import { supabase } from '@/lib/supabase';
import { Assessment, AssessmentStatus } from '@/types';

export interface AssessmentTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  standard_ids: string[];
  methodology: 'standard' | 'risk-based' | 'maturity-model';
  risk_scoring_enabled: boolean;
  sections: any[];
  default_workflow_id?: string;
  created_by: string;
  is_public: boolean;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  stages: WorkflowStage[];
  current_stage: number;
  auto_advance: boolean;
  notification_settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStage {
  id: number;
  name: string;
  description?: string;
  approvers: string[]; // User IDs
  approval_type: 'any' | 'all'; // Any one approver or all approvers
  auto_approve_conditions?: Record<string, any>;
  sla_hours?: number;
}

export interface AssessmentSchedule {
  id: string;
  organization_id: string;
  template_id?: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date?: string;
  next_run_date: string;
  time_of_day: string;
  timezone: string;
  assigned_team_ids: string[];
  auto_start: boolean;
  notification_settings: Record<string, any>;
  is_active: boolean;
  created_by: string;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentEvidence {
  id: string;
  assessment_id: string;
  requirement_id: string;
  evidence_type: 'document' | 'screenshot' | 'log' | 'system-scan' | 'interview';
  title: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  collected_by: string;
  collected_at: string;
  verified_by?: string;
  verified_at?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentFinding {
  id: string;
  assessment_id: string;
  requirement_id: string;
  finding_type: 'gap' | 'risk' | 'non-conformity' | 'observation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact?: string;
  likelihood?: 'high' | 'medium' | 'low';
  risk_rating?: 'critical' | 'high' | 'medium' | 'low';
  remediation_plan?: string;
  responsible_party?: string;
  due_date?: string;
  status: 'open' | 'in-progress' | 'closed' | 'accepted';
  evidence_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedAssessment extends Assessment {
  template_id?: string;
  workflow_id?: string;
  current_workflow_stage?: number;
  workflow_status?: string;
  assigned_team_ids?: string[];
  reviewer_ids?: string[];
  risk_score?: number;
  maturity_level?: number;
  is_recurring?: boolean;
  recurrence_pattern?: Record<string, any>;
  parent_assessment_id?: string;
  version?: number;
  locked_by?: string;
  locked_at?: string;
  compliance_score?: number;
  findings_count?: number;
  critical_findings_count?: number;
}

export class EnhancedAssessmentService {
  private static instance: EnhancedAssessmentService;

  static getInstance(): EnhancedAssessmentService {
    if (!EnhancedAssessmentService.instance) {
      EnhancedAssessmentService.instance = new EnhancedAssessmentService();
    }
    return EnhancedAssessmentService.instance;
  }

  // Template Management
  async createTemplate(template: Omit<AssessmentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentTemplate> {
    const { data, error } = await supabase
      .from('assessment_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as AssessmentTemplate;
  }

  async getTemplates(organizationId: string, includePublic = true): Promise<AssessmentTemplate[]> {
    let query = supabase
      .from('assessment_templates')
      .select('*');

    if (includePublic) {
      query = query.or(`organization_id.eq.${organizationId},is_public.eq.true`);
    } else {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as AssessmentTemplate[];
  }

  async getTemplateById(templateId: string): Promise<AssessmentTemplate | null> {
    const { data, error } = await supabase
      .from('assessment_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data as unknown as AssessmentTemplate;
  }

  // Workflow Management
  async createWorkflow(workflow: Omit<AssessmentWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentWorkflow> {
    const { data, error } = await supabase
      .from('assessment_workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as AssessmentWorkflow;
  }

  async getWorkflows(organizationId: string): Promise<AssessmentWorkflow[]> {
    const { data, error } = await supabase
      .from('assessment_workflows')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as AssessmentWorkflow[];
  }

  async advanceWorkflow(assessmentId: string, action: 'approve' | 'reject', comments?: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get current assessment and workflow
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*, workflow:assessment_workflows(*)')
      .eq('id', assessmentId)
      .single();

    if (!assessment || !(assessment as any)['workflow']) {
      throw new Error('Assessment or workflow not found');
    }

    const currentStage = (assessment as any)['current_workflow_stage'] || 0;
    const workflow = (assessment as any)['workflow'] as AssessmentWorkflow;

    // Record workflow action
    await supabase
      .from('assessment_workflow_history')
      .insert({
        assessment_id: assessmentId,
        workflow_id: workflow.id,
        stage: currentStage,
        action,
        actor_id: userId,
        comments
      });

    if (action === 'approve' && currentStage < workflow.stages.length - 1) {
      // Advance to next stage
      await supabase
        .from('assessments')
        .update({
          current_workflow_stage: currentStage + 1,
          workflow_status: 'pending_approval'
        })
        .eq('id', assessmentId);
    } else if (action === 'approve' && currentStage === workflow.stages.length - 1) {
      // Final approval
      await supabase
        .from('assessments')
        .update({
          workflow_status: 'approved',
          status: 'completed'
        })
        .eq('id', assessmentId);
    } else if (action === 'reject') {
      // Reject assessment
      await supabase
        .from('assessments')
        .update({
          workflow_status: 'rejected'
        })
        .eq('id', assessmentId);
    }

    return true;
  }

  // Schedule Management
  async createSchedule(schedule: Omit<AssessmentSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentSchedule> {
    const { data, error } = await supabase
      .from('assessment_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as AssessmentSchedule;
  }

  async getSchedules(organizationId: string, activeOnly = true): Promise<AssessmentSchedule[]> {
    let query = supabase
      .from('assessment_schedules')
      .select('*')
      .eq('organization_id', organizationId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('next_run_date', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as AssessmentSchedule[];
  }

  async runScheduledAssessment(scheduleId: string): Promise<EnhancedAssessment> {
    const { data: schedule } = await supabase
      .from('assessment_schedules')
      .select('*, template:assessment_templates(*)')
      .eq('id', scheduleId)
      .single();

    if (!schedule) throw new Error('Schedule not found');

    // Create assessment from template  
    const templateId = schedule['template_id'] as string;
    if (!templateId) throw new Error('Schedule template not found');
    
    const assessment = await this.createAssessmentFromTemplate(
      templateId,
      {
        name: `${schedule['name'] as string} - ${new Date().toLocaleDateString()}`,
        assigned_team_ids: schedule['assigned_team_ids'] as string[],
        is_recurring: false // Prevent infinite recursion
      }
    );

    // Update schedule next run date
    const frequency = schedule['frequency'] as string;
    const nextRunDate = schedule['next_run_date'] as string;
    const nextDate = this.calculateNextRunDate(frequency, new Date(nextRunDate));
    await supabase
      .from('assessment_schedules')
      .update({
        next_run_date: nextDate.toISOString(),
        last_run_at: new Date().toISOString()
      })
      .eq('id', scheduleId);

    return assessment;
  }

  private calculateNextRunDate(frequency: string, currentDate: Date): Date {
    const next = new Date(currentDate);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'annually':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  // Evidence Management
  async uploadEvidence(evidence: Omit<AssessmentEvidence, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentEvidence> {
    const { data, error } = await supabase
      .from('assessment_evidence')
      .insert(evidence)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as AssessmentEvidence;
  }

  async getEvidenceForAssessment(assessmentId: string): Promise<AssessmentEvidence[]> {
    const { data, error } = await supabase
      .from('assessment_evidence')
      .select(`
        *,
        collector:organization_users!collected_by(
          user:users(first_name, last_name, email)
        ),
        verifier:organization_users!verified_by(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('assessment_id', assessmentId)
      .order('collected_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as AssessmentEvidence[];
  }

  async verifyEvidence(
    evidenceId: string, 
    status: 'verified' | 'rejected', 
    notes?: string
  ): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('assessment_evidence')
      .update({
        verified_by: userId,
        verified_at: new Date().toISOString(),
        verification_status: status,
        verification_notes: notes
      })
      .eq('id', evidenceId);

    if (error) throw error;
    return true;
  }

  // Findings Management
  async createFinding(finding: Omit<AssessmentFinding, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentFinding> {
    const { data, error } = await supabase
      .from('assessment_findings')
      .insert(finding)
      .select()
      .single();

    if (error) throw error;

    // Update assessment findings count
    await this.updateAssessmentFindingsCounts(finding.assessment_id);

    return data as unknown as AssessmentFinding;
  }

  async getFindingsForAssessment(assessmentId: string): Promise<AssessmentFinding[]> {
    const { data, error } = await supabase
      .from('assessment_findings')
      .select(`
        *,
        requirement:requirements_library(code, title),
        creator:organization_users!created_by(
          user:users(first_name, last_name, email)
        ),
        responsible:organization_users!responsible_party(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('assessment_id', assessmentId)
      .order('severity', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as AssessmentFinding[];
  }

  async updateFindingStatus(
    findingId: string, 
    status: AssessmentFinding['status'],
    remediationPlan?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('assessment_findings')
      .update({
        status,
        remediation_plan: remediationPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', findingId);

    if (error) throw error;
    return true;
  }

  private async updateAssessmentFindingsCounts(assessmentId: string): Promise<void> {
    const { data: findings } = await supabase
      .from('assessment_findings')
      .select('severity')
      .eq('assessment_id', assessmentId)
      .eq('status', 'open');

    const findingsCount = findings?.length || 0;
    const criticalFindingsCount = findings?.filter(f => f.severity === 'critical').length || 0;

    await supabase
      .from('assessments')
      .update({
        findings_count: findingsCount,
        critical_findings_count: criticalFindingsCount
      })
      .eq('id', assessmentId);
  }

  // Enhanced Assessment Creation
  async createAssessmentFromTemplate(
    templateId: string, 
    overrides?: Partial<EnhancedAssessment>
  ): Promise<EnhancedAssessment> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const assessmentData: any = {
      name: overrides?.name || `Assessment from ${template.name}`,
      description: overrides?.description || template.description,
      standard_ids: template.standard_ids,
      template_id: templateId,
      workflow_id: overrides?.workflow_id || template.default_workflow_id,
      status: 'draft' as AssessmentStatus,
      created_by: userId,
      organization_id: template.organization_id,
      start_date: new Date().toISOString(),
      progress: 0,
      assessor_name: '',
      assessor_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) throw error;

    // Copy requirements from template standards
    await this.copyRequirementsToAssessment((data as any).id, template.standard_ids);

    return data as unknown as EnhancedAssessment;
  }

  private async copyRequirementsToAssessment(assessmentId: string, standardIds: string[]): Promise<void> {
    // Get all requirements for the standards
    const { data: requirements } = await supabase
      .from('requirements_library')
      .select('id')
      .in('standard_id', standardIds);

    if (!requirements || requirements.length === 0) return;

    // Insert assessment requirements
    const assessmentRequirements = requirements.map(req => ({
      assessment_id: assessmentId,
      requirement_id: req.id,
      status: 'not-assessed'
    }));

    await supabase
      .from('assessment_requirements')
      .insert(assessmentRequirements);
  }

  // Analytics and Reporting
  async getAssessmentAnalytics(assessmentId: string): Promise<any> {
    const { data } = await supabase
      .rpc('calculate_assessment_completion', { assessment_id: assessmentId });

    const findings = await this.getFindingsForAssessment(assessmentId);
    
    const analytics = {
      completion: (data as any)?.[0] || {},
      findings: {
        total: findings.length,
        bySeverity: {
          critical: findings.filter((f: AssessmentFinding) => f.severity === 'critical').length,
          high: findings.filter((f: AssessmentFinding) => f.severity === 'high').length,
          medium: findings.filter((f: AssessmentFinding) => f.severity === 'medium').length,
          low: findings.filter((f: AssessmentFinding) => f.severity === 'low').length
        },
        byStatus: {
          open: findings.filter((f: AssessmentFinding) => f.status === 'open').length,
          inProgress: findings.filter((f: AssessmentFinding) => f.status === 'in-progress').length,
          closed: findings.filter((f: AssessmentFinding) => f.status === 'closed').length
        }
      }
    };

    // Store analytics
    await supabase
      .from('assessment_analytics')
      .insert({
        organization_id: ((await this.getAssessmentById(assessmentId)) as any)?.organization_id,
        assessment_id: assessmentId,
        metric_type: 'completion_snapshot',
        metric_value: analytics.completion.completion_percentage,
        metric_data: analytics
      });

    return analytics;
  }

  async getAssessmentById(assessmentId: string): Promise<EnhancedAssessment | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error) throw error;
    return data as unknown as EnhancedAssessment;
  }

  // Risk Scoring
  async calculateRiskScore(assessmentId: string): Promise<number> {
    const findings = await this.getFindingsForAssessment(assessmentId);
    
    const riskWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1
    };

    let totalRisk = 0;
    findings.forEach(finding => {
      if (finding.status !== 'closed') {
        totalRisk += riskWeights[finding.severity] || 0;
      }
    });

    // Normalize to 0-100 scale
    const maxPossibleRisk = findings.length * 10;
    const riskScore = maxPossibleRisk > 0 ? (totalRisk / maxPossibleRisk) * 100 : 0;

    // Update assessment
    await supabase
      .from('assessments')
      .update({ risk_score: riskScore })
      .eq('id', assessmentId);

    return riskScore;
  }

  // Collaboration
  async lockAssessment(assessmentId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('assessments')
      .update({
        locked_by: userId,
        locked_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .is('locked_by', null); // Only lock if not already locked

    return !error;
  }

  async unlockAssessment(assessmentId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('assessments')
      .update({
        locked_by: null,
        locked_at: null
      })
      .eq('id', assessmentId)
      .eq('locked_by', userId); // Only unlock if locked by current user

    return !error;
  }
}