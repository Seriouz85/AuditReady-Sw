// Standard types
export type StandardType = 'framework' | 'regulation' | 'policy' | 'guideline';

// Tag categories
export type TagCategory = 'type' | 'applies-to';

// Tag interface
export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: TagCategory;
  parentId?: string; // For hierarchical tags (e.g., Device > Server)
}

export interface Standard {
  id: string;
  name: string;
  version: string;
  type: StandardType;
  description: string;
  category: string;
  requirements: string[]; // Array of requirement IDs
  createdAt: string;
  updatedAt: string;
}

// Requirement status types
export type RequirementStatus = 'fulfilled' | 'partially-fulfilled' | 'not-fulfilled' | 'not-applicable';

// Requirement priority types
export type RequirementPriority = 'low' | 'medium' | 'high' | 'default';

// Requirement types
export interface Requirement {
  id: string;
  standardId: string;
  section: string;
  code: string;
  name: string;
  description: string;
  guidance?: string;
  auditReadyGuidance?: string;
  justification?: string;
  status: RequirementStatus;
  priority?: RequirementPriority;
  evidence?: string;
  notes?: string;
  responsibleParty?: string;
  lastAssessmentDate?: string;
  tags?: string[]; // Array of tag IDs (old system: tag-organizational, tag-identity, etc.)
  categories?: string[]; // Array of unified category names (21 categories)
  appliesTo?: string[]; // Array of "applies to" targets
  createdAt: string;
  updatedAt: string;
}

// Assessment method types
export const ASSESSMENT_METHODS = {
  DOCUMENT_REVIEW: 'Document Review',
  INTERVIEWS: 'Interviews',
  OBSERVATION: 'Observation',
  SURVEYS: 'Surveys and Questionnaires',
  DATA_ANALYSIS: 'Data Analysis & Statistics',
  SAMPLING: 'Sampling',
  PROCESS_WALKTHROUGH: 'Process Walkthrough',
  BENCHMARKING: 'Benchmarking'
} as const;

export type AssessmentMethod = typeof ASSESSMENT_METHODS[keyof typeof ASSESSMENT_METHODS];

// Recurrence settings interface
export interface RecurrenceSettings {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  weekdays?: string[];
  skipWeekends: boolean;
  startDate: string;
  endDate?: string;
}

// Assessment types
export interface Assessment {
  id: string;
  name: string;
  description: string;
  standardIds: string[]; // Changed from standardId to support multiple standards
  status: 'draft' | 'in-progress' | 'completed';
  progress: number; // Percentage of completion
  startDate: string;
  endDate?: string;
  assessorName: string; // Primary assessor name (for backward compatibility)
  assessorId: string; // Primary assessor ID (for backward compatibility)
  assessorNames?: string[]; // Multiple assessor names
  assessorIds?: string[]; // Multiple assessor IDs
  notes?: string; // Assessment notes from the assessor
  evidence?: string; // Evidence collection notes
  methods?: string[]; // Assessment methods used (document review, interviews, etc.)
  requirementNotes?: Record<string, string>; // Notes for specific requirements
  isPinned?: boolean; // Whether the assessment is pinned
  isRecurring?: boolean; // Whether the assessment is recurring
  recurrenceSettings?: RecurrenceSettings; // Recurrence configuration
  nextDueDate?: string; // Next due date for recurring assessments
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface ComplianceStats {
  totalStandards: number;
  totalRequirements: number;
  totalAssessments: number;
  complianceScore: number;
  requirementStatusCounts: {
    fulfilled: number;
    partiallyFulfilled: number;
    notFulfilled: number;
    notApplicable: number;
  };
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  organizationNumber: string;
  address?: string;
  website?: string;
  category?: string;
  status: 'active' | 'inactive' | 'pending-review';
  contact: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  internalResponsible: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  associatedStandards: SupplierStandard[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierStandard {
  standardId: string;
  requirementIds: string[]; // Selected requirements to send to supplier
  sentDate?: string; // When requirements were last sent to the supplier
  status: 'draft' | 'sent' | 'in-progress' | 'completed';
}

// Application types
export interface Application {
  id: string;
  name: string;
  description?: string;
  organizationNumber: string;
  type?: string;
  category?: string;
  status: 'active' | 'inactive' | 'under-review';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  contact: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  internalResponsible: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  associatedRequirements: string[]; // Requirements that apply to this application
  lastReviewDate?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Internal user from Active Directory
export interface InternalUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'requirement' | 'assessment' | 'application' | 'device' | 'location' | 'organization';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  entityId: string; // ID of the related entity (requirement, assessment, etc.)
  dueDate?: string;
  createdAt: string;
}

// Requirement Assignment types
export interface RequirementAssignment {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementName: string;
  standardId: string;
  standardName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedToUserEmail: string;
  assignedByUserId: string;
  assignedByUserName: string;
  organizationId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'pending_invitation';
  dueDate?: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
  evidence?: string;
}

// User Activity types for the Activities page
export interface UserActivity {
  id: string;
  userId: string;
  type: 'requirement_assigned' | 'requirement_completed' | 'assessment_started' | 'assessment_completed';
  title: string;
  description: string;
  entityId: string; // ID of the related entity
  entityType: 'requirement' | 'assessment' | 'application';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
