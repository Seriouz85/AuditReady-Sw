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

// Requirement types
export interface Requirement {
  id: string;
  standardId: string;
  section: string;
  code: string;
  name: string;
  description: string;
  guidance: string;
  status: RequirementStatus;
  evidence?: string;
  notes?: string;
  responsibleParty?: string;
  lastAssessmentDate?: string;
  tags?: string[]; // Array of tag IDs
  createdAt: string;
  updatedAt: string;
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
  assessorName: string;
  assessorId: string; // Added this field to match the mock data
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
