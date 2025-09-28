// Auth-related type definitions to replace 'any' types

// Database query response types
export interface OrganizationUserWithRelations {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  status: string;
  joined_at?: string;
  last_login_at?: string;
  metadata: Record<string, unknown>;
  organization: {
    id: string;
    name: string;
    slug: string;
    industry?: string;
    company_size?: string;
    subscription_tier: string;
    stripe_customer_id?: string;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
  role: {
    id: string;
    name: string;
    display_name: string;
    permissions: string[];
  };
}

// Demo compliance stats from materialized view
export interface DemoComplianceStats {
  total_requirements: number;
  fulfilled: number;
  partially_fulfilled: number;
  not_fulfilled: number;
  last_updated: string;
}

// Authentication subscription type
export interface AuthSubscription {
  unsubscribe: () => void;
}

// Settings interface with proper typing
export interface OrganizationSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    browser: boolean;
    slack?: boolean;
  };
  compliance?: {
    defaultAssessor?: string;
    requireEvidence?: boolean;
    autoArchive?: boolean;
  };
  security?: {
    mfaRequired?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
  };
  [key: string]: unknown;
}

// Enhanced Organization interface with proper settings typing
export interface OrganizationWithSettings {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: string;
  stripe_customer_id?: string;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

// Enhanced metadata interface
export interface OrganizationUserMetadata {
  is_demo?: boolean;
  last_activity?: string;
  preferences?: {
    dashboard_layout?: string;
    notification_frequency?: 'immediate' | 'daily' | 'weekly';
  };
  [key: string]: unknown;
}

// Enhanced OrganizationUser interface
export interface EnhancedOrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  status: string;
  joined_at?: string;
  last_login_at?: string;
  metadata: OrganizationUserMetadata;
}

// Assessment data interface
export interface AssessmentData {
  name: string;
  description?: string;
  standardIds: string[];
  startDate: string;
  endDate?: string;
  assessorName: string;
  assessorId: string;
  notes?: string;
  evidence?: string;
  methods?: string[];
  requirementNotes?: Record<string, string>;
  isPinned?: boolean;
  isRecurring?: boolean;
  recurrenceSettings?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    weekdays?: string[];
    skipWeekends: boolean;
    startDate: string;
    endDate?: string;
  };
  nextDueDate?: string;
  status?: 'draft' | 'in-progress' | 'completed';
  progress?: number;
}

// Document data interface  
export interface DocumentData {
  name: string;
  description?: string;
  category?: string;
  type?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  version?: string;
  status?: 'draft' | 'review' | 'approved' | 'archived';
  tags?: string[];
  metadata?: Record<string, unknown>;
  access_level?: 'public' | 'internal' | 'confidential' | 'restricted';
  retention_period?: number;
  review_date?: string;
  owner_id?: string;
  classification_level?: string;
}

// Activity metadata interface
export interface ActivityMetadata {
  source?: string;
  previous_value?: unknown;
  new_value?: unknown;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  action_details?: Record<string, unknown>;
  [key: string]: unknown;
}

// Supabase function response interface
export interface SupabaseFunctionResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Stripe admin response types
export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string>;
  default_price?: string;
  prices?: StripePrice[];
}

export interface StripePrice {
  id: string;
  object: 'price';
  active: boolean;
  currency: string;
  product: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
  };
  unit_amount: number | null;
  unit_amount_decimal?: string;
}

export interface StripeCustomer {
  id: string;
  object: 'customer';
  created: number;
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
  subscriptions?: {
    data: StripeSubscription[];
  };
}

export interface StripeSubscription {
  id: string;
  object: 'subscription';
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  customer: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: StripePrice;
      quantity: number;
    }>;
  };
  metadata?: Record<string, string>;
}

// Event handler types
export type EventCallback = (...args: unknown[]) => void;

// Drag options interface
export interface DragOptions {
  snapToGrid?: boolean;
  gridSize?: number;
  bounds?: DOMRect;
  axis?: 'x' | 'y' | 'both';
}

// Extended SVG element with drag cleanup
export interface DraggableSVGElement extends SVGElement {
  __dragCleanup?: () => void;
}

// Notification data types
export interface NotificationData {
  resourceId?: string;
  resourceType?: string;
  resourceName?: string;
  actorId?: string;
  actorName?: string;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  deadlineDate?: string;
  assignmentDetails?: {
    dueDate?: string;
    priority?: string;
    description?: string;
  };
  mentionContext?: {
    commentId?: string;
    documentId?: string;
    location?: string;
  };
  [key: string]: unknown;
}

// Notification creation parameters
export interface CreateNotificationParams {
  userId: string;
  type: 'mention' | 'assignment' | 'comment' | 'status_change' | 'deadline' | 'system' | 'collaboration';
  title: string;
  message: string;
  data?: NotificationData;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  expiresAt?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
}

// Email service types
export interface EmailTemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  example?: string | number | boolean | Record<string, unknown>;
}

export interface EmailQueueItem {
  id: string;
  attempts: number;
  max_retries: number;
  email_notifications: {
    id: string;
    max_retries: number;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

// AI Requirements Validation types
export interface ValidatedRequirement {
  letter: string;
  title: string;
  description: string;
  originalText: string;
}

export interface ValidationAnalysis {
  length_compliance: 'too_short' | 'optimal' | 'too_long';
  clarity_score: number;
  completeness_score: number;
  framework_coverage_score: number;
  detected_frameworks: string[];
  missing_framework_coverage: string[];
  confidence_score: number;
}

// Rollback and diagnostic data types
export interface RollbackData {
  original_requirement?: ValidatedRequirement;
  suggestions_applied?: string[];
  quality_scores?: {
    clarity_score: number;
    completeness_score: number;
    framework_coverage_score: number;
  };
  timestamp: string;
  user_id: string;
  operation_type: string;
  [key: string]: unknown;
}

export interface DiagnosticData {
  error_messages?: string[];
  warning_messages?: string[];
  performance_metrics?: {
    execution_time_ms: number;
    memory_usage_mb?: number;
    ai_api_calls?: number;
  };
  validation_results?: {
    passed_checks: string[];
    failed_checks: string[];
  };
  ai_confidence_scores?: number[];
  [key: string]: unknown;
}