/**
 * TypeScript types for the Supplier Assessment System
 */

// Import commonly used types from main types file
import type { Supplier, Standard, Requirement } from './index';

// Re-export the imported types for external consumers
export type { Supplier, Standard, Requirement };

export interface SupplierAssessmentCampaign {
  id: string;
  organization_id: string;
  supplier_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  completed_at?: string;
  expires_at?: string;
  
  // Risk scoring
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  last_calculated_at?: string;
  
  // Assessment settings
  allow_delegation: boolean;
  require_evidence: boolean;
  send_reminders: boolean;
  reminder_frequency_days: number;
  
  // Relations
  supplier?: Supplier;
  standards?: SupplierAssessmentStandard[];
  requirements?: SupplierAssessmentRequirement[];
  external_users?: SupplierExternalUser[];
  responses?: SupplierRequirementResponse[];
  activities?: SupplierAssessmentActivity[];
}

export interface SupplierAssessmentStandard {
  id: string;
  campaign_id: string;
  standard_id: string;
  created_at: string;
  
  // Relations
  standard?: Standard;
}

export interface SupplierAssessmentRequirement {
  id: string;
  campaign_id: string;
  requirement_id: string;
  standard_id: string;
  is_mandatory: boolean;
  weight: number;
  custom_notes?: string;
  created_at: string;
  
  // Relations
  requirement?: Requirement;
  standard?: Standard;
}

export interface SupplierExternalUser {
  id: string;
  supplier_id: string;
  campaign_id: string;
  email: string;
  full_name: string;
  title?: string;
  phone?: string;
  
  // Authentication
  invite_token?: string;
  invite_sent_at?: string;
  invite_accepted_at?: string;
  last_login_at?: string;
  is_active: boolean;
  
  // Role within supplier organization
  role: 'primary' | 'contributor' | 'viewer';
  
  // Session management
  session_token?: string;
  session_expires_at?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  supplier?: Supplier;
  campaign?: SupplierAssessmentCampaign;
  responses?: SupplierRequirementResponse[];
  delegations_sent?: SupplierDelegation[];
  delegations_received?: SupplierDelegation[];
}

export interface SupplierRequirementResponse {
  id: string;
  campaign_id: string;
  requirement_id: string;
  supplier_user_id: string;
  
  // Response data
  fulfillment_level: 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'not_applicable' | 'in_progress';
  response_text?: string;
  evidence_description?: string;
  confidence_level?: number; // 1-5 scale
  
  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  
  // Workflow
  is_draft: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // Relations
  requirement?: Requirement;
  supplier_user?: SupplierExternalUser;
  evidence_files?: SupplierEvidenceFile[];
}

export interface SupplierEvidenceFile {
  id: string;
  response_id: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  storage_path: string;
  uploaded_by: string;
  uploaded_at: string;
  
  // Security
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'error';
  is_approved: boolean;
  
  // Relations
  response?: SupplierRequirementResponse;
  uploaded_by_user?: SupplierExternalUser;
}

export interface SupplierDelegation {
  id: string;
  campaign_id: string;
  delegated_by: string;
  delegated_to: string;
  requirement_ids: string[];
  message?: string;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  
  // Relations
  delegated_by_user?: SupplierExternalUser;
  delegated_to_user?: SupplierExternalUser;
  campaign?: SupplierAssessmentCampaign;
}

export interface SupplierAssessmentActivity {
  id: string;
  campaign_id: string;
  user_id?: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  
  // Relations
  user?: SupplierExternalUser;
  campaign?: SupplierAssessmentCampaign;
}

export interface SupplierEmailTemplate {
  id: string;
  organization_id: string;
  template_type: 'invitation' | 'reminder' | 'completion' | 'escalation';
  subject: string;
  body_html: string;
  body_text: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierNotification {
  id: string;
  campaign_id: string;
  notification_type: string;
  recipient_email: string;
  subject: string;
  body: string;
  scheduled_for: string;
  sent_at?: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
  created_at: string;
}

export interface SupplierRiskFactor {
  id: string;
  campaign_id: string;
  factor_type: string;
  factor_name: string;
  weight: number;
  current_value?: number;
  max_value?: number;
  risk_impact: number; // 1-5 scale
  description?: string;
  calculated_at: string;
}

// Dashboard and Analytics Types
export interface SupplierRiskDashboard {
  total_suppliers: number;
  active_assessments: number;
  completed_assessments: number;
  overdue_assessments: number;
  average_risk_score: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recent_activities: SupplierAssessmentActivity[];
  top_risk_suppliers: {
    supplier: Supplier;
    risk_score: number;
    risk_level: string;
    last_assessment: string;
  }[];
}

export interface SupplierComplianceMetrics {
  campaign_id: string;
  total_requirements: number;
  completed_requirements: number;
  compliance_percentage: number;
  fulfillment_breakdown: {
    fulfilled: number;
    partially_fulfilled: number;
    not_fulfilled: number;
    not_applicable: number;
    in_progress: number;
  };
  standards_compliance: {
    standard_id: string;
    standard_name: string;
    total_requirements: number;
    completed_requirements: number;
    compliance_percentage: number;
  }[];
  time_to_completion_days?: number;
  last_activity: string;
}

// External Portal Types (for supplier-facing interface)
export interface ExternalPortalSession {
  user: SupplierExternalUser;
  campaign: SupplierAssessmentCampaign;
  permissions: {
    can_respond: boolean;
    can_delegate: boolean;
    can_upload_evidence: boolean;
    can_view_others_responses: boolean;
  };
  progress: {
    total_requirements: number;
    completed_requirements: number;
    draft_responses: number;
    percentage_complete: number;
  };
}

export interface ExternalPortalRequirement {
  id: string;
  section: string;
  name: string;
  description: string;
  guidance?: string;
  is_mandatory: boolean;
  weight: number;
  custom_notes?: string;
  
  // Current response (if any)
  response?: SupplierRequirementResponse;
  
  // Delegation info
  delegated_to?: SupplierExternalUser;
  delegation_message?: string;
}

// API Request/Response Types
export interface CreateCampaignRequest {
  supplier_id: string;
  name: string;
  description?: string;
  standard_ids: string[];
  requirement_ids: string[];
  due_date?: string;
  settings: {
    allow_delegation: boolean;
    require_evidence: boolean;
    send_reminders: boolean;
    reminder_frequency_days: number;
  };
}

export interface InviteSupplierRequest {
  campaign_id: string;
  contacts: {
    email: string;
    full_name: string;
    title?: string;
    phone?: string;
    role: 'primary' | 'contributor' | 'viewer';
  }[];
  custom_message?: string;
}

export interface SupplierLoginRequest {
  email: string;
  invite_token: string;
}

export interface SupplierResponseRequest {
  campaign_id: string;
  requirement_id: string;
  fulfillment_level: 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'not_applicable' | 'in_progress';
  response_text?: string;
  evidence_description?: string;
  confidence_level?: number;
}

export interface DelegateRequirementsRequest {
  campaign_id: string;
  delegate_to_email: string;
  delegate_to_name: string;
  delegate_to_title?: string;
  requirement_ids: string[];
  message?: string;
}

// Form Types
export interface SupplierAssessmentForm {
  campaign: {
    name: string;
    description: string;
    due_date: string;
    settings: {
      allow_delegation: boolean;
      require_evidence: boolean;
      send_reminders: boolean;
      reminder_frequency_days: number;
    };
  };
  standards: {
    selected_standard_ids: string[];
    selected_requirement_ids: string[];
  };
  contacts: {
    email: string;
    full_name: string;
    title: string;
    phone: string;
    role: 'primary' | 'contributor' | 'viewer';
  }[];
  email: {
    custom_message: string;
    send_immediately: boolean;
  };
}

// Utility Types
export type CampaignStatus = SupplierAssessmentCampaign['status'];
export type FulfillmentLevel = SupplierRequirementResponse['fulfillment_level'];
export type RiskLevel = SupplierAssessmentCampaign['risk_level'];
export type UserRole = SupplierExternalUser['role'];
export type TemplateType = SupplierEmailTemplate['template_type'];
export type NotificationStatus = SupplierNotification['delivery_status'];

// Additional service types
export interface SupplierAssessmentService {
  createCampaign(request: CreateCampaignRequest): Promise<SupplierAssessmentCampaign>;
  inviteSuppliers(request: InviteSupplierRequest): Promise<void>;
  authenticateSupplier(request: SupplierLoginRequest): Promise<ExternalPortalSession>;
  saveResponse(request: SupplierResponseRequest): Promise<SupplierRequirementResponse>;
  delegateRequirements(request: DelegateRequirementsRequest): Promise<SupplierDelegation>;
  getCampaign(campaignId: string): Promise<SupplierAssessmentCampaign>;
  getSupplierProgress(campaignId: string, userId: string): Promise<SupplierComplianceMetrics>;
}

// Additional request types for service compatibility
export interface SupplierInviteRequest extends InviteSupplierRequest {}
export interface AuthenticateSupplierRequest extends SupplierLoginRequest {}
export interface SaveResponseRequest extends SupplierResponseRequest {}

// Compliance gap analysis type
export interface ComplianceGapAnalysis {
  campaign_id: string;
  total_requirements: number;
  fulfilled_requirements: number;
  gaps: {
    requirement_id: string;
    requirement_name: string;
    current_status: FulfillmentLevel;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }[];
  overall_compliance_score: number;
  risk_summary: {
    total_gaps: number;
    high_risk_gaps: number;
    critical_risk_gaps: number;
  };
}