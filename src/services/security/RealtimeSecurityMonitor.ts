/**
 * Real-time Security Monitor
 * Continuous monitoring and alerting system for cybersecurity threats
 */

import { supabase } from '@/lib/supabase';
import { CybersecurityValidationFramework, type SecurityMonitoringEvent, type SecurityValidationResult } from './CybersecurityValidationFramework';

// === TYPES FOR REAL-TIME MONITORING ===

export interface SecurityAlert {
  alert_id: string;
  alert_type: 'threat_detected' | 'compliance_violation' | 'anomaly_detected' | 'policy_breach' | 'system_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_systems: string[];
  affected_users: string[];
  detection_method: 'automated' | 'ai_analysis' | 'manual_review' | 'external_source';
  indicators: SecurityIndicator[];
  recommendations: string[];
  created_at: string;
  escalated: boolean;
  acknowledged: boolean;
  resolved: boolean;
  response_actions: SecurityResponseAction[];
}

export interface SecurityIndicator {
  indicator_type: 'ip_address' | 'domain' | 'hash' | 'pattern' | 'behavior' | 'content_signature';
  value: string;
  confidence: number;
  source: string;
  context: Record<string, any>;
}

export interface SecurityResponseAction {
  action_id: string;
  action_type: 'block' | 'quarantine' | 'alert' | 'investigate' | 'escalate' | 'remediate';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  automated: boolean;
  executed_by: string;
  executed_at: string;
  result: string;
  details: Record<string, any>;
}

export interface ThreatIntelligence {
  source: string;
  threat_type: string;
  indicators: SecurityIndicator[];
  context: Record<string, any>;
  confidence_score: number;
  last_updated: string;
}

export interface SecurityMetrics {
  timeframe: string;
  total_validations: number;
  threats_blocked: number;
  false_positives: number;
  average_response_time: number;
  compliance_score: number;
  risk_score: number;
  trend_data: Array<{
    timestamp: string;
    validations: number;
    threats: number;
    risk_level: number;
  }>;
}

export interface MonitoringRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'threshold' | 'pattern' | 'anomaly' | 'ml_model';
  enabled: boolean;
  conditions: Record<string, any>;
  actions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: string[];
  created_by: string;
  created_at: string;
  last_triggered: string;
  trigger_count: number;
}

// === MAIN REAL-TIME SECURITY MONITOR ===

export class RealtimeSecurityMonitor {
  private static instance: RealtimeSecurityMonitor | null = null;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(event: SecurityAlert) => void> = new Set();
  private activeRules: Map<string, MonitoringRule> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();

  /**
   * Singleton pattern for monitoring system
   */
  static getInstance(): RealtimeSecurityMonitor {
    if (!this.instance) {
      this.instance = new RealtimeSecurityMonitor();
    }
    return this.instance;
  }

  /**
   * Start real-time security monitoring
   */
  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      console.log('[SecurityMonitor] Already monitoring');
      return;
    }

    console.log('[SecurityMonitor] Starting real-time security monitoring');
    this.isMonitoring = true;

    // Load monitoring rules
    await this.loadMonitoringRules();

    // Load threat intelligence
    await this.loadThreatIntelligence();

    // Start monitoring loop
    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, intervalMs);

    // Set up real-time database listeners
    await this.setupDatabaseListeners();

    console.log(`[SecurityMonitor] Monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop real-time security monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('[SecurityMonitor] Stopping real-time security monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clean up database listeners
    this.cleanupDatabaseListeners();
  }

  /**
   * Subscribe to security alerts
   */
  subscribe(callback: (alert: SecurityAlert) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Process new validation result for real-time monitoring
   */
  async processValidationResult(result: SecurityValidationResult, metadata: {
    content_type: string;
    source_url?: string;
    user_id?: string;
    organization_id?: string;
  }): Promise<void> {
    try {
      // Check for immediate threats
      const criticalThreats = result.threats_detected.filter(t => 
        t.severity === 'critical' || t.severity === 'high'
      );

      if (criticalThreats.length > 0) {
        await this.generateSecurityAlert({
          alert_type: 'threat_detected',
          severity: result.risk_level,
          title: `${criticalThreats.length} Critical Threat(s) Detected`,
          description: `High-risk content detected from ${metadata.source_url || 'unknown source'}`,
          affected_systems: ['content_validation'],
          affected_users: metadata.user_id ? [metadata.user_id] : [],
          detection_method: 'automated',
          indicators: this.extractSecurityIndicators(result, metadata),
          recommendations: result.recommendations
        });
      }

      // Apply monitoring rules
      await this.applyMonitoringRules(result, metadata);

      // Update metrics
      await this.updateSecurityMetrics(result, metadata);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to process validation result:', error);
    }
  }

  /**
   * Generate and broadcast security alert
   */
  async generateSecurityAlert(alertData: Partial<SecurityAlert>): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: SecurityAlert = {
      alert_id: alertId,
      alert_type: alertData.alert_type || 'threat_detected',
      severity: alertData.severity || 'medium',
      title: alertData.title || 'Security Alert',
      description: alertData.description || 'Security incident detected',
      affected_systems: alertData.affected_systems || [],
      affected_users: alertData.affected_users || [],
      detection_method: alertData.detection_method || 'automated',
      indicators: alertData.indicators || [],
      recommendations: alertData.recommendations || [],
      created_at: new Date().toISOString(),
      escalated: false,
      acknowledged: false,
      resolved: false,
      response_actions: []
    };

    try {
      // Store alert in database
      const { error } = await supabase
        .from('security_alerts')
        .insert(alert);

      if (error) {
        console.error('[SecurityMonitor] Failed to store security alert:', error);
      }

      // Notify subscribers
      this.notifySubscribers(alert);

      // Trigger automated response actions
      await this.triggerAutomatedResponse(alert);

      console.log(`[SecurityMonitor] Security alert generated: ${alert.alert_id} - ${alert.severity}`);
      
      return alertId;

    } catch (error) {
      console.error('[SecurityMonitor] Failed to generate security alert:', error);
      throw new Error('Failed to generate security alert');
    }
  }

  /**
   * Add or update monitoring rule
   */
  async addMonitoringRule(rule: Omit<MonitoringRule, 'rule_id' | 'created_at' | 'last_triggered' | 'trigger_count'>): Promise<string> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newRule: MonitoringRule = {
      ...rule,
      rule_id: ruleId,
      created_at: new Date().toISOString(),
      last_triggered: '',
      trigger_count: 0
    };

    try {
      // Store rule in database
      const { error } = await supabase
        .from('security_monitoring_rules')
        .insert(newRule);

      if (error) throw error;

      // Add to active rules
      this.activeRules.set(ruleId, newRule);

      console.log(`[SecurityMonitor] Monitoring rule added: ${ruleId}`);
      return ruleId;

    } catch (error) {
      console.error('[SecurityMonitor] Failed to add monitoring rule:', error);
      throw new Error('Failed to add monitoring rule');
    }
  }

  /**
   * Get current security metrics
   */
  async getSecurityMetrics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SecurityMetrics> {
    try {
      const timeframeHours = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
      };

      const hoursBack = timeframeHours[timeframe];
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      // Get validation metrics
      const { data: validations } = await supabase
        .from('security_validation_logs')
        .select('*')
        .gte('validated_at', startTime);

      // Get threat metrics
      const { data: threats } = await supabase
        .from('security_monitoring_events')
        .select('*')
        .gte('timestamp', startTime);

      const totalValidations = validations?.length || 0;
      const threatsBlocked = threats?.filter(t => t.event_type === 'threat_detected').length || 0;
      
      // Calculate compliance score (simplified)
      const passedValidations = validations?.filter(v => v.passed).length || 0;
      const complianceScore = totalValidations > 0 ? (passedValidations / totalValidations) * 100 : 100;

      // Calculate risk score
      const highRiskValidations = validations?.filter(v => 
        v.risk_level === 'high' || v.risk_level === 'critical'
      ).length || 0;
      const riskScore = totalValidations > 0 ? (highRiskValidations / totalValidations) * 100 : 0;

      // Generate trend data (hourly buckets)
      const trendData = this.generateTrendData(validations || [], threats || [], hoursBack);

      return {
        timeframe,
        total_validations: totalValidations,
        threats_blocked: threatsBlocked,
        false_positives: 0, // Would calculate from historical data
        average_response_time: this.calculateAverageResponseTime(validations || []),
        compliance_score: complianceScore,
        risk_score: riskScore,
        trend_data: trendData
      };

    } catch (error) {
      console.error('[SecurityMonitor] Failed to get security metrics:', error);
      throw new Error('Failed to retrieve security metrics');
    }
  }

  /**
   * Get active security alerts
   */
  async getActiveSecurityAlerts(filters?: {
    severity?: string;
    alert_type?: string;
    unresolved_only?: boolean;
  }): Promise<SecurityAlert[]> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*');

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.alert_type) {
        query = query.eq('alert_type', filters.alert_type);
      }
      if (filters?.unresolved_only) {
        query = query.eq('resolved', false);
      }

      const { data: alerts, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return alerts || [];

    } catch (error) {
      console.error('[SecurityMonitor] Failed to get security alerts:', error);
      throw new Error('Failed to retrieve security alerts');
    }
  }

  // === PRIVATE METHODS ===

  private async performMonitoringCycle(): Promise<void> {
    try {
      // Check for anomalies in recent validation patterns
      await this.detectAnomalies();

      // Update threat intelligence
      await this.updateThreatIntelligence();

      // Process rule triggers
      await this.processRuleTriggers();

      // Clean up old data
      await this.cleanupOldData();

    } catch (error) {
      console.error('[SecurityMonitor] Monitoring cycle failed:', error);
    }
  }

  private async loadMonitoringRules(): Promise<void> {
    try {
      const { data: rules } = await supabase
        .from('security_monitoring_rules')
        .select('*')
        .eq('enabled', true);

      if (rules) {
        this.activeRules.clear();
        rules.forEach(rule => {
          this.activeRules.set(rule.rule_id, rule);
        });
      }

      console.log(`[SecurityMonitor] Loaded ${this.activeRules.size} monitoring rules`);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to load monitoring rules:', error);
    }
  }

  private async loadThreatIntelligence(): Promise<void> {
    try {
      const { data: intelligence } = await supabase
        .from('threat_intelligence')
        .select('*')
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (intelligence) {
        this.threatIntelligence.clear();
        intelligence.forEach(intel => {
          this.threatIntelligence.set(intel.source, intel);
        });
      }

      console.log(`[SecurityMonitor] Loaded ${this.threatIntelligence.size} threat intelligence sources`);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to load threat intelligence:', error);
    }
  }

  private async setupDatabaseListeners(): Promise<void> {
    // Set up real-time listeners for new security events
    supabase
      .channel('security_monitoring')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_validation_logs'
      }, (payload) => {
        this.handleNewValidationLog(payload.new as any);
      })
      .subscribe();
  }

  private cleanupDatabaseListeners(): void {
    supabase.removeAllChannels();
  }

  private async handleNewValidationLog(log: any): Promise<void> {
    // Process new validation log in real-time
    if (!log.passed && log.validation_result?.threats_detected?.length > 0) {
      const criticalThreats = log.validation_result.threats_detected.filter((t: any) => 
        t.severity === 'critical' || t.severity === 'high'
      );

      if (criticalThreats.length > 0) {
        await this.generateSecurityAlert({
          alert_type: 'threat_detected',
          severity: log.risk_level,
          title: `Real-time Threat Detection`,
          description: `Critical threat detected in real-time validation`,
          affected_systems: ['content_validation'],
          detection_method: 'automated',
          indicators: [],
          recommendations: log.validation_result.recommendations || []
        });
      }
    }
  }

  private extractSecurityIndicators(result: SecurityValidationResult, metadata: any): SecurityIndicator[] {
    const indicators: SecurityIndicator[] = [];

    // Extract URL indicators
    if (metadata.source_url) {
      indicators.push({
        indicator_type: 'domain',
        value: new URL(metadata.source_url).hostname,
        confidence: 0.8,
        source: 'content_validation',
        context: { url: metadata.source_url }
      });
    }

    // Extract threat patterns
    result.threats_detected.forEach(threat => {
      threat.evidence?.forEach(evidence => {
        indicators.push({
          indicator_type: 'pattern',
          value: evidence,
          confidence: 0.7,
          source: 'threat_detection',
          context: { threat_type: threat.type, severity: threat.severity }
        });
      });
    });

    return indicators;
  }

  private async applyMonitoringRules(result: SecurityValidationResult, metadata: any): Promise<void> {
    for (const [ruleId, rule] of this.activeRules) {
      if (!rule.enabled) continue;

      const triggered = this.evaluateRule(rule, result, metadata);
      
      if (triggered) {
        await this.triggerRule(rule, result, metadata);
      }
    }
  }

  private evaluateRule(rule: MonitoringRule, result: SecurityValidationResult, metadata: any): boolean {
    // Implement rule evaluation logic based on rule type
    switch (rule.rule_type) {
      case 'threshold':
        return this.evaluateThresholdRule(rule, result);
      case 'pattern':
        return this.evaluatePatternRule(rule, result);
      case 'anomaly':
        return this.evaluateAnomalyRule(rule, result);
      default:
        return false;
    }
  }

  private evaluateThresholdRule(rule: MonitoringRule, result: SecurityValidationResult): boolean {
    const conditions = rule.conditions;
    
    if (conditions.min_threats && result.threats_detected.length >= conditions.min_threats) {
      return true;
    }
    
    if (conditions.max_confidence && result.confidence_score <= conditions.max_confidence) {
      return true;
    }
    
    return false;
  }

  private evaluatePatternRule(rule: MonitoringRule, result: SecurityValidationResult): boolean {
    const patterns = rule.conditions.patterns || [];
    
    return result.threats_detected.some(threat =>
      threat.evidence?.some(evidence =>
        patterns.some((pattern: string) => new RegExp(pattern, 'i').test(evidence))
      )
    );
  }

  private evaluateAnomalyRule(rule: MonitoringRule, result: SecurityValidationResult): boolean {
    // Simplified anomaly detection
    return result.risk_level === 'critical' && result.confidence_score > 0.9;
  }

  private async triggerRule(rule: MonitoringRule, result: SecurityValidationResult, metadata: any): Promise<void> {
    try {
      // Update rule trigger count and last triggered
      await supabase
        .from('security_monitoring_rules')
        .update({
          last_triggered: new Date().toISOString(),
          trigger_count: rule.trigger_count + 1
        })
        .eq('rule_id', rule.rule_id);

      // Generate alert if specified in actions
      if (rule.actions.includes('alert')) {
        await this.generateSecurityAlert({
          alert_type: 'anomaly_detected',
          severity: rule.severity,
          title: `Monitoring Rule Triggered: ${rule.rule_name}`,
          description: `Security monitoring rule "${rule.rule_name}" has been triggered`,
          affected_systems: ['monitoring_system'],
          detection_method: 'automated',
          indicators: [],
          recommendations: [`Review rule: ${rule.rule_name}`, 'Investigate triggering conditions']
        });
      }

      console.log(`[SecurityMonitor] Rule triggered: ${rule.rule_name}`);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to trigger rule:', error);
    }
  }

  private notifySubscribers(alert: SecurityAlert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[SecurityMonitor] Subscriber notification failed:', error);
      }
    });
  }

  private async triggerAutomatedResponse(alert: SecurityAlert): Promise<void> {
    // Implement automated response based on alert severity and type
    const actions: SecurityResponseAction[] = [];

    if (alert.severity === 'critical') {
      actions.push({
        action_id: `action_${Date.now()}_1`,
        action_type: 'quarantine',
        status: 'pending',
        automated: true,
        executed_by: 'security_monitor',
        executed_at: new Date().toISOString(),
        result: 'Automated quarantine triggered',
        details: { alert_id: alert.alert_id }
      });
    }

    if (alert.severity === 'high' || alert.severity === 'critical') {
      actions.push({
        action_id: `action_${Date.now()}_2`,
        action_type: 'escalate',
        status: 'pending',
        automated: true,
        executed_by: 'security_monitor',
        executed_at: new Date().toISOString(),
        result: 'Escalated to security team',
        details: { alert_id: alert.alert_id }
      });
    }

    // Store response actions
    if (actions.length > 0) {
      try {
        await supabase
          .from('security_response_actions')
          .insert(actions);
        
        // Update alert with response actions
        await supabase
          .from('security_alerts')
          .update({ response_actions: actions })
          .eq('alert_id', alert.alert_id);

      } catch (error) {
        console.error('[SecurityMonitor] Failed to store response actions:', error);
      }
    }
  }

  private async updateSecurityMetrics(result: SecurityValidationResult, metadata: any): Promise<void> {
    // Update real-time security metrics
    try {
      const metricData = {
        timestamp: new Date().toISOString(),
        validation_count: 1,
        threat_count: result.threats_detected.length,
        risk_level: result.risk_level,
        confidence_score: result.confidence_score,
        processing_time: result.metadata.processing_time_ms,
        content_type: metadata.content_type,
        organization_id: metadata.organization_id
      };

      await supabase
        .from('security_metrics_realtime')
        .insert(metricData);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to update security metrics:', error);
    }
  }

  private async detectAnomalies(): Promise<void> {
    // Implement anomaly detection logic
    // This would analyze patterns in recent validations and detect unusual activity
  }

  private async updateThreatIntelligence(): Promise<void> {
    // Update threat intelligence from external sources
    // This would fetch latest threat indicators from security feeds
  }

  private async processRuleTriggers(): Promise<void> {
    // Process any pending rule triggers
    // This would handle delayed or batched rule evaluations
  }

  private async cleanupOldData(): Promise<void> {
    // Clean up old monitoring data to prevent database bloat
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await supabase
        .from('security_metrics_realtime')
        .delete()
        .lt('timestamp', cutoffDate);

    } catch (error) {
      console.error('[SecurityMonitor] Failed to cleanup old data:', error);
    }
  }

  private calculateAverageResponseTime(validations: any[]): number {
    if (validations.length === 0) return 0;
    
    const totalTime = validations.reduce((sum, v) => sum + (v.processing_time_ms || 0), 0);
    return totalTime / validations.length;
  }

  private generateTrendData(validations: any[], threats: any[], hoursBack: number): any[] {
    const trendData: any[] = [];
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    for (let i = 0; i < Math.min(hoursBack, 24); i++) {
      const bucketStart = new Date(now - (i + 1) * hourMs);
      const bucketEnd = new Date(now - i * hourMs);

      const bucketValidations = validations.filter(v => {
        const validatedAt = new Date(v.validated_at);
        return validatedAt >= bucketStart && validatedAt < bucketEnd;
      });

      const bucketThreats = threats.filter(t => {
        const timestamp = new Date(t.timestamp);
        return timestamp >= bucketStart && timestamp < bucketEnd;
      });

      const riskLevels = bucketValidations.map(v => {
        switch (v.risk_level) {
          case 'critical': return 4;
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 0;
        }
      });

      const avgRiskLevel = riskLevels.length > 0 
        ? riskLevels.reduce((sum, level) => sum + level, 0) / riskLevels.length 
        : 0;

      trendData.unshift({
        timestamp: bucketStart.toISOString(),
        validations: bucketValidations.length,
        threats: bucketThreats.length,
        risk_level: avgRiskLevel
      });
    }

    return trendData;
  }
}