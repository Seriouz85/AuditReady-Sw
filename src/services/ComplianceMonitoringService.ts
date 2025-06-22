import { supabase } from '@/lib/supabase';

export interface ComplianceAlert {
  id: string;
  organizationId: string;
  type: 'deadline_approaching' | 'non_compliance' | 'documentation_missing' | 'assessment_overdue' | 'risk_threshold_exceeded';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  relatedEntity: {
    type: 'requirement' | 'assessment' | 'document' | 'standard' | 'risk';
    id: string;
    name: string;
  };
  actionRequired: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  resolvedAt?: string;
  status: 'active' | 'resolved' | 'dismissed';
  metadata: Record<string, any>;
}

export interface MonitoringRule {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: ComplianceAlert['type'];
  severity: ComplianceAlert['severity'];
  conditions: {
    entity: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'days_until' | 'days_since';
    value: any;
  }[];
  actions: {
    type: 'create_alert' | 'send_email' | 'assign_task' | 'escalate';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface ComplianceMetrics {
  totalRequirements: number;
  compliantRequirements: number;
  overdueAssessments: number;
  pendingDocuments: number;
  activeAlerts: number;
  complianceScore: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  riskScore: number;
  lastUpdated: string;
}

export interface MonitoringDashboardData {
  metrics: ComplianceMetrics;
  recentAlerts: ComplianceAlert[];
  criticalIssues: ComplianceAlert[];
  upcomingDeadlines: Array<{
    id: string;
    type: string;
    name: string;
    dueDate: string;
    daysRemaining: number;
  }>;
  complianceTrends: Array<{
    date: string;
    score: number;
    alerts: number;
  }>;
}

export class ComplianceMonitoringService {
  private static instance: ComplianceMonitoringService;

  static getInstance(): ComplianceMonitoringService {
    if (!ComplianceMonitoringService.instance) {
      ComplianceMonitoringService.instance = new ComplianceMonitoringService();
    }
    return ComplianceMonitoringService.instance;
  }

  /**
   * Run compliance monitoring checks for an organization
   */
  async runMonitoringChecks(organizationId: string): Promise<ComplianceAlert[]> {
    try {
      const [
        deadlineAlerts,
        complianceAlerts,
        documentationAlerts,
        assessmentAlerts,
        riskAlerts
      ] = await Promise.all([
        this.checkUpcomingDeadlines(organizationId),
        this.checkComplianceViolations(organizationId),
        this.checkMissingDocumentation(organizationId),
        this.checkOverdueAssessments(organizationId),
        this.checkRiskThresholds(organizationId)
      ]);

      const allAlerts = [
        ...deadlineAlerts,
        ...complianceAlerts,
        ...documentationAlerts,
        ...assessmentAlerts,
        ...riskAlerts
      ];

      // Store alerts in database
      await this.storeAlerts(allAlerts);

      return allAlerts;
    } catch (error) {
      console.error('Error running monitoring checks:', error);
      throw error;
    }
  }

  /**
   * Check for upcoming deadlines
   */
  private async checkUpcomingDeadlines(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check assessment deadlines
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          id,
          name,
          due_date,
          status,
          standard:standards(name)
        `)
        .eq('organization_id', organizationId)
        .not('status', 'eq', 'completed')
        .not('due_date', 'is', null);

      const now = new Date();
      
      assessments?.forEach(assessment => {
        if (assessment.due_date) {
          const dueDate = new Date(assessment.due_date);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 7 && daysUntilDue > 0) {
            alerts.push({
              id: `deadline-${assessment.id}`,
              organizationId,
              type: 'deadline_approaching',
              severity: daysUntilDue <= 3 ? 'critical' : 'warning',
              title: 'Assessment Deadline Approaching',
              description: `Assessment "${assessment.name}" is due in ${daysUntilDue} day(s)`,
              relatedEntity: {
                type: 'assessment',
                id: assessment.id,
                name: assessment.name
              },
              actionRequired: 'Complete assessment before deadline',
              dueDate: assessment.due_date,
              createdAt: new Date().toISOString(),
              status: 'active',
              metadata: {
                daysUntilDue,
                standard: assessment.standard?.name
              }
            });
          }
        }
      });

      // Check requirement review deadlines
      const { data: requirements } = await supabase
        .from('requirements')
        .select(`
          id,
          title,
          next_review_date,
          requirement_assessments!inner(
            id,
            status,
            last_reviewed_at
          )
        `)
        .eq('organization_id', organizationId)
        .not('next_review_date', 'is', null);

      requirements?.forEach(requirement => {
        if (requirement.next_review_date) {
          const reviewDate = new Date(requirement.next_review_date);
          const daysUntilReview = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilReview <= 14 && daysUntilReview > 0) {
            alerts.push({
              id: `review-${requirement.id}`,
              organizationId,
              type: 'deadline_approaching',
              severity: daysUntilReview <= 7 ? 'warning' : 'info',
              title: 'Requirement Review Due',
              description: `Requirement "${requirement.title}" is due for review in ${daysUntilReview} day(s)`,
              relatedEntity: {
                type: 'requirement',
                id: requirement.id,
                name: requirement.title
              },
              actionRequired: 'Schedule and conduct requirement review',
              dueDate: requirement.next_review_date,
              createdAt: new Date().toISOString(),
              status: 'active',
              metadata: {
                daysUntilReview
              }
            });
          }
        }
      });

    } catch (error) {
      console.error('Error checking deadlines:', error);
    }

    return alerts;
  }

  /**
   * Check for compliance violations
   */
  private async checkComplianceViolations(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check requirements with non-compliant status
      const { data: nonCompliantRequirements } = await supabase
        .from('requirement_assessments')
        .select(`
          id,
          status,
          completion_percentage,
          requirement:requirements(
            id,
            title,
            priority,
            standard:standards(name)
          )
        `)
        .eq('requirements.organization_id', organizationId)
        .in('status', ['non_compliant', 'partially_compliant'])
        .lt('completion_percentage', 80);

      nonCompliantRequirements?.forEach(assessment => {
        if (assessment.requirement) {
          alerts.push({
            id: `compliance-${assessment.requirement.id}`,
            organizationId,
            type: 'non_compliance',
            severity: assessment.requirement.priority === 'high' ? 'critical' : 'warning',
            title: 'Non-Compliance Detected',
            description: `Requirement "${assessment.requirement.title}" is ${assessment.status}`,
            relatedEntity: {
              type: 'requirement',
              id: assessment.requirement.id,
              name: assessment.requirement.title
            },
            actionRequired: 'Address compliance gaps and update implementation',
            createdAt: new Date().toISOString(),
            status: 'active',
            metadata: {
              completionPercentage: assessment.completion_percentage,
              priority: assessment.requirement.priority,
              standard: assessment.requirement.standard?.name
            }
          });
        }
      });

    } catch (error) {
      console.error('Error checking compliance violations:', error);
    }

    return alerts;
  }

  /**
   * Check for missing documentation
   */
  private async checkMissingDocumentation(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check requirements without evidence
      const { data: requirementsWithoutEvidence } = await supabase
        .from('requirements')
        .select(`
          id,
          title,
          priority,
          requirement_assessments!left(
            id,
            evidence_count
          )
        `)
        .eq('organization_id', organizationId)
        .is('requirement_assessments.evidence_count', null)
        .or('requirement_assessments.evidence_count.eq.0', { 
          foreignTable: 'requirement_assessments' 
        });

      requirementsWithoutEvidence?.forEach(requirement => {
        if (requirement.priority === 'high') {
          alerts.push({
            id: `docs-${requirement.id}`,
            organizationId,
            type: 'documentation_missing',
            severity: 'warning',
            title: 'Missing Documentation',
            description: `High priority requirement "${requirement.title}" has no supporting documentation`,
            relatedEntity: {
              type: 'requirement',
              id: requirement.id,
              name: requirement.title
            },
            actionRequired: 'Upload supporting documents or evidence',
            createdAt: new Date().toISOString(),
            status: 'active',
            metadata: {
              priority: requirement.priority
            }
          });
        }
      });

    } catch (error) {
      console.error('Error checking documentation:', error);
    }

    return alerts;
  }

  /**
   * Check for overdue assessments
   */
  private async checkOverdueAssessments(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      const now = new Date();

      // Check overdue assessments
      const { data: overdueAssessments } = await supabase
        .from('assessments')
        .select(`
          id,
          name,
          due_date,
          status,
          standard:standards(name)
        `)
        .eq('organization_id', organizationId)
        .not('status', 'eq', 'completed')
        .lt('due_date', now.toISOString());

      overdueAssessments?.forEach(assessment => {
        const dueDate = new Date(assessment.due_date);
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        alerts.push({
          id: `overdue-${assessment.id}`,
          organizationId,
          type: 'assessment_overdue',
          severity: daysOverdue > 30 ? 'critical' : 'warning',
          title: 'Assessment Overdue',
          description: `Assessment "${assessment.name}" is ${daysOverdue} day(s) overdue`,
          relatedEntity: {
            type: 'assessment',
            id: assessment.id,
            name: assessment.name
          },
          actionRequired: 'Complete overdue assessment immediately',
          dueDate: assessment.due_date,
          createdAt: new Date().toISOString(),
          status: 'active',
          metadata: {
            daysOverdue,
            standard: assessment.standard?.name
          }
        });
      });

    } catch (error) {
      console.error('Error checking overdue assessments:', error);
    }

    return alerts;
  }

  /**
   * Check risk threshold violations
   */
  private async checkRiskThresholds(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      // Check high and critical risks
      const { data: highRisks } = await supabase
        .from('risks')
        .select('id, title, risk_level, impact, likelihood')
        .eq('organization_id', organizationId)
        .in('risk_level', ['high', 'critical'])
        .eq('status', 'open');

      highRisks?.forEach(risk => {
        alerts.push({
          id: `risk-${risk.id}`,
          organizationId,
          type: 'risk_threshold_exceeded',
          severity: risk.risk_level === 'critical' ? 'critical' : 'warning',
          title: 'High Risk Detected',
          description: `Risk "${risk.title}" has ${risk.risk_level} risk level`,
          relatedEntity: {
            type: 'risk',
            id: risk.id,
            name: risk.title
          },
          actionRequired: 'Implement risk mitigation measures',
          createdAt: new Date().toISOString(),
          status: 'active',
          metadata: {
            riskLevel: risk.risk_level,
            impact: risk.impact,
            likelihood: risk.likelihood
          }
        });
      });

    } catch (error) {
      console.error('Error checking risk thresholds:', error);
    }

    return alerts;
  }

  /**
   * Store alerts in database
   */
  private async storeAlerts(alerts: ComplianceAlert[]): Promise<void> {
    if (alerts.length === 0) return;

    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .upsert(
          alerts.map(alert => ({
            id: alert.id,
            organization_id: alert.organizationId,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            related_entity: alert.relatedEntity,
            action_required: alert.actionRequired,
            assigned_to: alert.assignedTo,
            due_date: alert.dueDate,
            status: alert.status,
            metadata: alert.metadata,
            created_at: alert.createdAt
          })),
          { onConflict: 'id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error storing alerts:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data for monitoring
   */
  async getMonitoringDashboard(organizationId: string): Promise<MonitoringDashboardData> {
    try {
      const [metrics, alerts] = await Promise.all([
        this.calculateComplianceMetrics(organizationId),
        this.getActiveAlerts(organizationId)
      ]);

      const criticalIssues = alerts.filter(alert => alert.severity === 'critical');
      const upcomingDeadlines = this.extractUpcomingDeadlines(alerts);
      const complianceTrends = await this.getComplianceTrends(organizationId);

      return {
        metrics,
        recentAlerts: alerts.slice(0, 10),
        criticalIssues,
        upcomingDeadlines,
        complianceTrends
      };
    } catch (error) {
      console.error('Error getting monitoring dashboard:', error);
      throw error;
    }
  }

  /**
   * Calculate compliance metrics
   */
  private async calculateComplianceMetrics(organizationId: string): Promise<ComplianceMetrics> {
    try {
      // Get requirement counts
      const { data: requirements } = await supabase
        .from('requirements')
        .select(`
          id,
          requirement_assessments(
            id,
            status,
            completion_percentage
          )
        `)
        .eq('organization_id', organizationId);

      const totalRequirements = requirements?.length || 0;
      const compliantRequirements = requirements?.filter(req => 
        req.requirement_assessments?.some(assessment => 
          assessment.status === 'completed' && assessment.completion_percentage >= 80
        )
      ).length || 0;

      // Get overdue assessments count
      const { data: overdueAssessments } = await supabase
        .from('assessments')
        .select('id')
        .eq('organization_id', organizationId)
        .not('status', 'eq', 'completed')
        .lt('due_date', new Date().toISOString());

      // Get pending documents count
      const { data: pendingDocs } = await supabase
        .from('uploaded_documents')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'pending');

      // Get active alerts count
      const { data: activeAlerts } = await supabase
        .from('compliance_alerts')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      const complianceScore = totalRequirements > 0 
        ? Math.round((compliantRequirements / totalRequirements) * 100)
        : 0;

      // Calculate risk score (simplified)
      const riskScore = Math.max(0, 100 - (activeAlerts?.length || 0) * 5);

      return {
        totalRequirements,
        compliantRequirements,
        overdueAssessments: overdueAssessments?.length || 0,
        pendingDocuments: pendingDocs?.length || 0,
        activeAlerts: activeAlerts?.length || 0,
        complianceScore,
        trendDirection: 'stable', // This would be calculated from historical data
        riskScore,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        totalRequirements: 0,
        compliantRequirements: 0,
        overdueAssessments: 0,
        pendingDocuments: 0,
        activeAlerts: 0,
        complianceScore: 0,
        trendDirection: 'stable',
        riskScore: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(organizationId: string): Promise<ComplianceAlert[]> {
    try {
      const { data: alerts } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      return alerts?.map(alert => ({
        id: alert.id,
        organizationId: alert.organization_id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        relatedEntity: alert.related_entity,
        actionRequired: alert.action_required,
        assignedTo: alert.assigned_to,
        dueDate: alert.due_date,
        createdAt: alert.created_at,
        resolvedAt: alert.resolved_at,
        status: alert.status,
        metadata: alert.metadata || {}
      })) || [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  /**
   * Extract upcoming deadlines from alerts
   */
  private extractUpcomingDeadlines(alerts: ComplianceAlert[]) {
    return alerts
      .filter(alert => alert.type === 'deadline_approaching' && alert.dueDate)
      .map(alert => {
        const daysRemaining = Math.ceil(
          (new Date(alert.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          id: alert.id,
          type: alert.relatedEntity.type,
          name: alert.relatedEntity.name,
          dueDate: alert.dueDate!,
          daysRemaining
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }

  /**
   * Get compliance trends (simplified - would use historical data)
   */
  private async getComplianceTrends(organizationId: string) {
    // This would typically query historical compliance data
    // For now, return mock trend data
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      
      trends.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 20) + 70, // Mock data
        alerts: Math.floor(Math.random() * 10) + 1
      });
    }
    
    return trends;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({
          status: 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: userId
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  /**
   * Assign alert to user
   */
  async assignAlert(alertId: string, assignedTo: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ assigned_to: assignedTo })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning alert:', error);
      throw error;
    }
  }
}

export const complianceMonitoringService = ComplianceMonitoringService.getInstance();