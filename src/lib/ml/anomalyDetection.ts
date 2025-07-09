import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';
import { alertingService } from '@/lib/monitoring/alerting';
import { cacheService } from '@/lib/cache/cacheService';

export interface AnomalyAlert {
  id: string;
  organizationId: string;
  type: 'compliance_drop' | 'requirement_pattern' | 'security_incident' | 'deadline_risk' | 'unusual_activity';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  details: Record<string, any>;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  confidence: number;
}

export interface AnomalyPattern {
  type: string;
  threshold: number;
  window: number; // in hours
  conditions: Record<string, any>;
}

interface ComplianceSnapshot {
  timestamp: Date;
  score: number;
  framework?: string;
  organizationId: string;
}

interface RequirementActivity {
  requirementId: string;
  timestamp: Date;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  userId: string;
}

class AnomalyDetectionService {
  private readonly CACHE_TTL = 600; // 10 minutes
  private readonly DETECTION_PATTERNS: AnomalyPattern[] = [
    {
      type: 'compliance_sudden_drop',
      threshold: 10, // 10% drop
      window: 24, // within 24 hours
      conditions: { minDataPoints: 3 }
    },
    {
      type: 'requirement_rapid_changes',
      threshold: 5, // 5 status changes
      window: 1, // within 1 hour
      conditions: { sameRequirement: true }
    },
    {
      type: 'deadline_proximity_risk',
      threshold: 7, // 7 days
      window: 168, // within 1 week
      conditions: { completionRate: 0.5 } // less than 50% complete
    },
    {
      type: 'unusual_user_activity',
      threshold: 20, // 20 actions
      window: 1, // within 1 hour
      conditions: { sameUser: true }
    },
    {
      type: 'security_incident_spike',
      threshold: 3, // 3 incidents
      window: 24, // within 24 hours
      conditions: { severity: 'HIGH' }
    }
  ];

  async detectAnomalies(organizationId: string): Promise<AnomalyAlert[]> {
    const cacheKey = `anomalies:${organizationId}`;
    const cached = await cacheService.get<AnomalyAlert[]>(cacheKey);
    if (cached) return cached;

    try {
      const alerts: AnomalyAlert[] = [];

      // Run all detection patterns
      const detectionPromises = this.DETECTION_PATTERNS.map(pattern => 
        this.runDetectionPattern(organizationId, pattern)
      );

      const results = await Promise.all(detectionPromises);
      results.forEach(patternAlerts => alerts.push(...patternAlerts));

      // Store new alerts in database
      for (const alert of alerts) {
        await this.storeAlert(alert);
      }

      await cacheService.set(cacheKey, alerts, this.CACHE_TTL);

      analytics.track('anomaly_detection_completed', {
        organization_id: organizationId,
        alerts_detected: alerts.length,
        high_severity_count: alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length
      });

      return alerts;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Anomaly detection failed'), {
        organization_id: organizationId
      });
      return [];
    }
  }

  async checkRequirementAnomaly(requirement: any): Promise<void> {
    try {
      // Check for rapid status changes
      const recentChanges = await this.getRecentRequirementChanges(requirement.id, 1);
      
      if (recentChanges.length >= 5) {
        const alert: AnomalyAlert = {
          id: `anomaly_${Date.now()}`,
          organizationId: requirement.organization_id,
          type: 'requirement_pattern',
          severity: 'MEDIUM',
          title: 'Rapid Requirement Status Changes',
          description: `Requirement "${requirement.title}" has been changed ${recentChanges.length} times in the last hour.`,
          details: {
            requirementId: requirement.id,
            changeCount: recentChanges.length,
            changes: recentChanges
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.85
        };

        await this.storeAlert(alert);
        await this.triggerAlert(alert);
      }

      // Check for unusual patterns
      await this.checkUnusualRequirementPatterns(requirement);
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Requirement anomaly check failed'), {
        requirement_id: requirement.id
      });
    }
  }

  async checkComplianceAnomaly(organizationId: string, newScore: number, framework?: string): Promise<void> {
    try {
      // Get recent compliance scores
      const recentScores = await this.getRecentComplianceScores(organizationId, framework, 24);
      
      if (recentScores.length < 2) return;

      const previousScore = recentScores[recentScores.length - 2].score;
      const scoreDrop = previousScore - newScore;

      // Check for sudden compliance drop
      if (scoreDrop >= 10) {
        const alert: AnomalyAlert = {
          id: `anomaly_${Date.now()}`,
          organizationId,
          type: 'compliance_drop',
          severity: scoreDrop >= 20 ? 'CRITICAL' : 'HIGH',
          title: 'Sudden Compliance Score Drop',
          description: `Compliance score dropped by ${scoreDrop.toFixed(1)}% ${framework ? `for ${framework}` : 'overall'}.`,
          details: {
            previousScore,
            newScore,
            drop: scoreDrop,
            framework,
            timestamp: new Date()
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.9
        };

        await this.storeAlert(alert);
        await this.triggerAlert(alert);
      }

      // Check for unusual volatility
      if (recentScores.length >= 5) {
        const volatility = this.calculateVolatility(recentScores.map(s => s.score));
        if (volatility > 15) {
          const alert: AnomalyAlert = {
            id: `anomaly_${Date.now()}`,
            organizationId,
            type: 'compliance_drop',
            severity: 'MEDIUM',
            title: 'High Compliance Score Volatility',
            description: `Compliance scores showing unusual volatility (σ=${volatility.toFixed(1)}).`,
            details: {
              volatility,
              recentScores: recentScores.slice(-5),
              framework
            },
            detectedAt: new Date(),
            resolved: false,
            confidence: 0.75
          };

          await this.storeAlert(alert);
        }
      }
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Compliance anomaly check failed'), {
        organization_id: organizationId,
        framework
      });
    }
  }

  async analyzeUserBehavior(organizationId: string, userId: string): Promise<AnomalyAlert[]> {
    try {
      const alerts: AnomalyAlert[] = [];

      // Get recent user activity
      const recentActivity = await this.getUserActivity(organizationId, userId, 1);

      // Check for excessive activity
      if (recentActivity.length >= 20) {
        alerts.push({
          id: `anomaly_${Date.now()}`,
          organizationId,
          type: 'unusual_activity',
          severity: recentActivity.length >= 50 ? 'HIGH' : 'MEDIUM',
          title: 'Unusual User Activity',
          description: `User performed ${recentActivity.length} actions in the last hour.`,
          details: {
            userId,
            actionCount: recentActivity.length,
            activityTypes: this.categorizeActivity(recentActivity)
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.8
        });
      }

      // Check for off-hours activity
      const offHoursActivity = recentActivity.filter(activity => {
        const hour = new Date(activity.timestamp).getHours();
        return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
      });

      if (offHoursActivity.length >= 5) {
        alerts.push({
          id: `anomaly_${Date.now()}`,
          organizationId,
          type: 'unusual_activity',
          severity: 'MEDIUM',
          title: 'Off-Hours Activity Detected',
          description: `User active during unusual hours (${offHoursActivity.length} actions).`,
          details: {
            userId,
            offHoursCount: offHoursActivity.length,
            timeDistribution: this.analyzeTimeDistribution(offHoursActivity)
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.7
        });
      }

      return alerts;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('User behavior analysis failed'), {
        organization_id: organizationId,
        user_id: userId
      });
      return [];
    }
  }

  async resolveAnomaly(alertId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('anomaly_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      analytics.track('anomaly_resolved', {
        alert_id: alertId,
        resolved_by: userId,
        alert_type: data.type
      });

      return true;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to resolve anomaly'), {
        alert_id: alertId,
        user_id: userId
      });
      return false;
    }
  }

  private async runDetectionPattern(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];

    switch (pattern.type) {
      case 'compliance_sudden_drop':
        alerts.push(...await this.detectComplianceDrops(organizationId, pattern));
        break;
      case 'requirement_rapid_changes':
        alerts.push(...await this.detectRapidRequirementChanges(organizationId, pattern));
        break;
      case 'deadline_proximity_risk':
        alerts.push(...await this.detectDeadlineRisks(organizationId, pattern));
        break;
      case 'unusual_user_activity':
        alerts.push(...await this.detectUnusualUserActivity(organizationId, pattern));
        break;
      case 'security_incident_spike':
        alerts.push(...await this.detectSecurityIncidentSpikes(organizationId, pattern));
        break;
    }

    return alerts;
  }

  private async detectComplianceDrops(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const cutoffTime = new Date(Date.now() - pattern.window * 60 * 60 * 1000);

    // Get recent compliance snapshots
    const { data: snapshots } = await supabase
      .from('compliance_snapshots')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (!snapshots || snapshots.length < pattern.conditions.minDataPoints) return alerts;

    // Group by framework
    const frameworkGroups = new Map<string, any[]>();
    snapshots.forEach(snapshot => {
      const framework = snapshot.framework || 'overall';
      const group = frameworkGroups.get(framework) || [];
      group.push(snapshot);
      frameworkGroups.set(framework, group);
    });

    // Check each framework for drops
    for (const [framework, frameworkSnapshots] of frameworkGroups) {
      if (frameworkSnapshots.length < 2) continue;

      const latest = frameworkSnapshots[0];
      const previous = frameworkSnapshots[1];
      const drop = previous.overall_score - latest.overall_score;

      if (drop >= pattern.threshold) {
        alerts.push({
          id: `anomaly_${Date.now()}_${framework}`,
          organizationId,
          type: 'compliance_drop',
          severity: drop >= 20 ? 'CRITICAL' : drop >= 15 ? 'HIGH' : 'MEDIUM',
          title: `Compliance Drop Detected: ${framework}`,
          description: `${framework} compliance dropped by ${drop.toFixed(1)}% in the last ${pattern.window} hours.`,
          details: {
            framework,
            drop,
            previousScore: previous.overall_score,
            currentScore: latest.overall_score,
            timeWindow: pattern.window
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.85
        });
      }
    }

    return alerts;
  }

  private async detectRapidRequirementChanges(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const cutoffTime = new Date(Date.now() - pattern.window * 60 * 60 * 1000);

    // Get recent requirement changes
    const { data: changes } = await supabase
      .from('requirement_history')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('updated_at', cutoffTime.toISOString());

    if (!changes) return alerts;

    // Group by requirement
    const requirementChanges = new Map<string, any[]>();
    changes.forEach(change => {
      const reqChanges = requirementChanges.get(change.requirement_id) || [];
      reqChanges.push(change);
      requirementChanges.set(change.requirement_id, reqChanges);
    });

    // Check for rapid changes
    for (const [requirementId, reqChanges] of requirementChanges) {
      if (reqChanges.length >= pattern.threshold) {
        // Get requirement details
        const { data: requirement } = await supabase
          .from('requirements')
          .select('title')
          .eq('id', requirementId)
          .single();

        alerts.push({
          id: `anomaly_${Date.now()}_${requirementId}`,
          organizationId,
          type: 'requirement_pattern',
          severity: reqChanges.length >= 10 ? 'HIGH' : 'MEDIUM',
          title: 'Rapid Requirement Changes',
          description: `Requirement "${requirement?.title || requirementId}" changed ${reqChanges.length} times in ${pattern.window} hour(s).`,
          details: {
            requirementId,
            changeCount: reqChanges.length,
            changes: reqChanges,
            timeWindow: pattern.window
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.9
        });
      }
    }

    return alerts;
  }

  private async detectDeadlineRisks(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const riskWindow = new Date(Date.now() + pattern.threshold * 24 * 60 * 60 * 1000);

    // Get assessments with approaching deadlines
    const { data: assessments } = await supabase
      .from('assessments')
      .select(`
        *,
        requirements(status)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .lte('due_date', riskWindow.toISOString())
      .not('due_date', 'is', null);

    if (!assessments) return alerts;

    for (const assessment of assessments) {
      const requirements = assessment.requirements || [];
      const completed = requirements.filter(r => 
        r.status === 'COMPLIANT' || r.status === 'IMPLEMENTED'
      ).length;
      
      const completionRate = requirements.length > 0 ? completed / requirements.length : 0;

      if (completionRate < pattern.conditions.completionRate) {
        const daysUntilDue = Math.ceil(
          (new Date(assessment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        alerts.push({
          id: `anomaly_${Date.now()}_${assessment.id}`,
          organizationId,
          type: 'deadline_risk',
          severity: daysUntilDue <= 3 ? 'CRITICAL' : daysUntilDue <= 7 ? 'HIGH' : 'MEDIUM',
          title: 'Assessment Deadline Risk',
          description: `Assessment "${assessment.title}" is ${(completionRate * 100).toFixed(1)}% complete with ${daysUntilDue} days remaining.`,
          details: {
            assessmentId: assessment.id,
            daysUntilDue,
            completionRate,
            completedRequirements: completed,
            totalRequirements: requirements.length
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.8
        });
      }
    }

    return alerts;
  }

  private async detectUnusualUserActivity(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const cutoffTime = new Date(Date.now() - pattern.window * 60 * 60 * 1000);

    // Get recent user activities
    const { data: activities } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', cutoffTime.toISOString());

    if (!activities) return alerts;

    // Group by user
    const userActivities = new Map<string, any[]>();
    activities.forEach(activity => {
      const userActs = userActivities.get(activity.user_id) || [];
      userActs.push(activity);
      userActivities.set(activity.user_id, userActs);
    });

    // Check for excessive activity
    for (const [userId, userActs] of userActivities) {
      if (userActs.length >= pattern.threshold) {
        const { data: user } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();

        alerts.push({
          id: `anomaly_${Date.now()}_${userId}`,
          organizationId,
          type: 'unusual_activity',
          severity: userActs.length >= 50 ? 'HIGH' : 'MEDIUM',
          title: 'Unusual User Activity',
          description: `User ${user?.full_name || userId} performed ${userActs.length} actions in ${pattern.window} hour(s).`,
          details: {
            userId,
            actionCount: userActs.length,
            timeWindow: pattern.window,
            activities: userActs.map(a => ({
              action: a.action,
              timestamp: a.created_at
            }))
          },
          detectedAt: new Date(),
          resolved: false,
          confidence: 0.75
        });
      }
    }

    return alerts;
  }

  private async detectSecurityIncidentSpikes(organizationId: string, pattern: AnomalyPattern): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const cutoffTime = new Date(Date.now() - pattern.window * 60 * 60 * 1000);

    // Get recent security incidents
    const { data: incidents } = await supabase
      .from('security_incidents')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', cutoffTime.toISOString());

    if (!incidents || incidents.length < pattern.threshold) return alerts;

    const highSeverityIncidents = incidents.filter(i => 
      i.severity === pattern.conditions.severity || i.severity === 'CRITICAL'
    );

    if (highSeverityIncidents.length >= pattern.threshold) {
      alerts.push({
        id: `anomaly_${Date.now()}_security`,
        organizationId,
        type: 'security_incident',
        severity: 'CRITICAL',
        title: 'Security Incident Spike',
        description: `${highSeverityIncidents.length} high-severity security incidents detected in ${pattern.window} hours.`,
        details: {
          incidentCount: highSeverityIncidents.length,
          timeWindow: pattern.window,
          incidents: highSeverityIncidents.map(i => ({
            id: i.id,
            type: i.incident_type,
            severity: i.severity,
            timestamp: i.created_at
          }))
        },
        detectedAt: new Date(),
        resolved: false,
        confidence: 0.95
      });
    }

    return alerts;
  }

  private async storeAlert(alert: AnomalyAlert): Promise<void> {
    try {
      const { error } = await supabase
        .from('anomaly_alerts')
        .insert([{
          id: alert.id,
          organization_id: alert.organizationId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          details: alert.details,
          detected_at: alert.detectedAt.toISOString(),
          resolved: alert.resolved,
          confidence: alert.confidence
        }]);

      if (error) throw error;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to store anomaly alert'), {
        alert_id: alert.id
      });
    }
  }

  private async triggerAlert(alert: AnomalyAlert): Promise<void> {
    try {
      // Send to alerting service
      await alertingService.recordEvent('anomaly_detected', {
        organization_id: alert.organizationId,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title
      });

      // Track analytics
      analytics.track('anomaly_alert_triggered', {
        organization_id: alert.organizationId,
        type: alert.type,
        severity: alert.severity,
        confidence: alert.confidence
      });
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to trigger anomaly alert'), {
        alert_id: alert.id
      });
    }
  }

  private async getRecentRequirementChanges(requirementId: string, hours: number): Promise<RequirementActivity[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data } = await supabase
      .from('requirement_history')
      .select('*')
      .eq('requirement_id', requirementId)
      .gte('updated_at', cutoffTime.toISOString())
      .order('updated_at', { ascending: false });

    return data || [];
  }

  private async getRecentComplianceScores(organizationId: string, framework: string | undefined, hours: number): Promise<ComplianceSnapshot[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    let query = supabase
      .from('compliance_snapshots')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (framework) {
      query = query.eq('framework', framework);
    }

    const { data } = await query;
    return (data || []).map(d => ({
      timestamp: new Date(d.created_at),
      score: d.overall_score,
      framework: d.framework,
      organizationId: d.organization_id
    }));
  }

  private async getUserActivity(organizationId: string, userId: string, hours: number): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .gte('created_at', cutoffTime.toISOString());

    return data || [];
  }

  private async checkUnusualRequirementPatterns(requirement: any): Promise<void> {
    // This could include checking for:
    // - Requirements being completed too quickly
    // - Requirements oscillating between statuses
    // - Evidence being uploaded and deleted repeatedly
    // Implementation would depend on specific business rules
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private categorizeActivity(activities: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    activities.forEach(activity => {
      categories[activity.action] = (categories[activity.action] || 0) + 1;
    });
    return categories;
  }

  private analyzeTimeDistribution(activities: any[]): Record<string, number> {
    const hours: Record<string, number> = {};
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hours[hour.toString()] = (hours[hour.toString()] || 0) + 1;
    });
    return hours;
  }
}

// Create singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();

export default anomalyDetectionService;