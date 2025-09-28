/**
 * Standardized API Response Types
 * Enterprise-grade TypeScript interfaces for consistent API responses
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  duration?: number;
  retryCount?: number;
  source: 'supabase' | 'external' | 'cache';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SupabaseErrorDetails {
  hint?: string;
  details?: string;
  code?: string;
  message: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponential: boolean;
  retryCondition: (error: any) => boolean;
}

export interface RequestConfig {
  timeout?: number;
  retries?: Partial<RetryConfig>;
  cache?: boolean;
  cacheTTL?: number;
  suppressToast?: boolean;
  requestId?: string;
}

export interface SupabaseQueryConfig extends RequestConfig {
  count?: 'exact' | 'planned' | 'estimated' | null;
  head?: boolean;
}

export interface DatabaseOperation {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'rpc';
  filters?: Record<string, any>;
  data?: any;
  config?: SupabaseQueryConfig;
}

export interface AuditLogEntry {
  requestId: string;
  operation: string;
  table?: string;
  userId?: string;
  organizationId?: string;
  success: boolean;
  duration: number;
  error?: ApiError;
  timestamp: string;
}

// Enhanced error codes for better error handling
export enum ApiErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  MFA_REQUIRED = 'MFA_REQUIRED',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  
  // Unknown/Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface BusinessError extends ApiError {
  validationErrors?: ValidationError[];
  conflictingResource?: string;
  suggestedActions?: string[];
}