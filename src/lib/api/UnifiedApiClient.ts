/**
 * Unified API Client Service
 * Enterprise-grade API client with standardized error handling, retries, and logging
 */

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  ApiResponse, 
  ApiError, 
  ApiErrorCode, 
  RetryConfig, 
  RequestConfig, 
  SupabaseQueryConfig,
  AuditLogEntry,
  ResponseMeta,
  PaginatedResponse,
  SupabaseErrorDetails
} from './types';
import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';

export class UnifiedApiClient {
  private static instance: UnifiedApiClient;
  private auditLogs: AuditLogEntry[] = [];
  private requestCounter = 0;

  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponential: true,
    retryCondition: (error: any) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return (
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'TIMEOUT_ERROR' ||
        error?.status >= 500 ||
        error?.message?.includes('network') ||
        error?.message?.includes('timeout')
      );
    }
  };

  public static getInstance(): UnifiedApiClient {
    if (!UnifiedApiClient.instance) {
      UnifiedApiClient.instance = new UnifiedApiClient();
    }
    return UnifiedApiClient.instance;
  }

  private generateRequestId(): string {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mapSupabaseError(error: PostgrestError | any): ApiError {
    const timestamp = new Date().toISOString();
    
    // Handle Supabase-specific errors
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return {
            code: ApiErrorCode.NOT_FOUND,
            message: 'Resource not found',
            details: error,
            timestamp
          };
        case 'PGRST204':
          return {
            code: ApiErrorCode.FORBIDDEN,
            message: 'Access denied - insufficient permissions',
            details: error,
            timestamp
          };
        case '23505':
          return {
            code: ApiErrorCode.RESOURCE_EXISTS,
            message: 'Resource already exists',
            details: error,
            timestamp
          };
        case '23503':
          return {
            code: ApiErrorCode.CONSTRAINT_VIOLATION,
            message: 'Foreign key constraint violation',
            details: error,
            timestamp
          };
        case '42501':
          return {
            code: ApiErrorCode.INSUFFICIENT_PERMISSIONS,
            message: 'Insufficient database permissions',
            details: error,
            timestamp
          };
        default:
          return {
            code: ApiErrorCode.DATABASE_ERROR,
            message: error.message || 'Database operation failed',
            details: error,
            timestamp
          };
      }
    }

    // Handle auth errors
    if (error?.message?.includes('JWT') || error?.status === 401) {
      return {
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        details: error,
        timestamp
      };
    }

    // Handle network errors
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        code: ApiErrorCode.NETWORK_ERROR,
        message: 'Network connection failed',
        details: error,
        timestamp
      };
    }

    // Generic error mapping
    return {
      code: ApiErrorCode.UNKNOWN_ERROR,
      message: error?.message || 'An unexpected error occurred',
      details: error,
      timestamp
    };
  }

  private createSuccessResponse<T>(
    data: T, 
    meta: Partial<ResponseMeta>,
    message?: string
  ): ApiResponse<T> {
    return {
      data,
      success: true,
      message,
      meta: {
        requestId: meta.requestId || this.generateRequestId(),
        timestamp: new Date().toISOString(),
        source: 'supabase',
        ...meta
      }
    };
  }

  private createErrorResponse(
    error: ApiError,
    requestId: string,
    retryCount = 0
  ): ApiResponse<null> {
    return {
      data: null,
      error: {
        ...error,
        requestId
      },
      success: false,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        retryCount,
        source: 'supabase'
      }
    };
  }

  private logRequest(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);
    
    // Keep only last 1000 entries in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${entry.operation}:`, entry);
    }
  }

  private showToast(error: ApiError, suppressToast = false): void {
    if (suppressToast) return;

    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
      case ApiErrorCode.TOKEN_EXPIRED:
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to continue."
        });
        break;
      
      case ApiErrorCode.FORBIDDEN:
      case ApiErrorCode.INSUFFICIENT_PERMISSIONS:
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to perform this action."
        });
        break;
      
      case ApiErrorCode.NOT_FOUND:
        toast({
          variant: "destructive",
          title: "Resource Not Found",
          description: "The requested resource could not be found."
        });
        break;
      
      case ApiErrorCode.VALIDATION_ERROR:
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.message
        });
        break;
      
      case ApiErrorCode.RATE_LIMITED:
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: "Too many requests. Please try again later."
        });
        break;
      
      case ApiErrorCode.NETWORK_ERROR:
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your internet connection."
        });
        break;
      
      default:
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred."
        });
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RequestConfig = {}
  ): Promise<T> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config.retries };
    const requestId = config.requestId || this.generateRequestId();
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      const startTime = Date.now();
      
      try {
        const result = await operation();
        
        // Log successful request
        this.logRequest({
          requestId,
          operation: 'database_operation',
          success: true,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

        return result;
      } catch (error) {
        lastError = error;
        const duration = Date.now() - startTime;
        
        // Log failed request
        this.logRequest({
          requestId,
          operation: 'database_operation',
          success: false,
          duration,
          error: this.mapSupabaseError(error),
          timestamp: new Date().toISOString()
        });

        // Don't retry on last attempt or if error is not retryable
        if (attempt === retryConfig.maxRetries || !retryConfig.retryCondition(error)) {
          break;
        }

        // Calculate delay for next attempt
        let delay = retryConfig.baseDelay;
        if (retryConfig.exponential) {
          delay = Math.min(delay * Math.pow(2, attempt), retryConfig.maxDelay);
        }

        console.log(`[API] Retry attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Execute a Supabase select query with standardized error handling
   */
  async select<T = any>(
    table: string,
    columns = '*',
    config: SupabaseQueryConfig = {}
  ): Promise<ApiResponse<T[]>> {
    const requestId = config.requestId || this.generateRequestId();
    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(async () => {
        let query = supabase.from(table).select(columns, { 
          count: config.count || null,
          head: config.head || false
        });

        return query;
      }, config);

      const { data, error, count } = result as PostgrestResponse<T>;

      if (error) {
        const apiError = this.mapSupabaseError(error);
        this.showToast(apiError, config.suppressToast);
        return this.createErrorResponse(apiError, requestId);
      }

      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        source: 'supabase'
      };

      return this.createSuccessResponse(data || [], meta);
    } catch (error) {
      const apiError = this.mapSupabaseError(error);
      this.showToast(apiError, config.suppressToast);
      return this.createErrorResponse(apiError, requestId);
    }
  }

  /**
   * Execute a Supabase insert operation with standardized error handling
   */
  async insert<T = any>(
    table: string,
    data: Partial<T> | Partial<T>[],
    config: SupabaseQueryConfig = {}
  ): Promise<ApiResponse<T[]>> {
    const requestId = config.requestId || this.generateRequestId();
    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(async () => {
        return supabase.from(table).insert(data).select();
      }, config);

      const { data: resultData, error } = result as PostgrestResponse<T>;

      if (error) {
        const apiError = this.mapSupabaseError(error);
        this.showToast(apiError, config.suppressToast);
        return this.createErrorResponse(apiError, requestId);
      }

      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        source: 'supabase'
      };

      return this.createSuccessResponse(resultData || [], meta, 'Resource created successfully');
    } catch (error) {
      const apiError = this.mapSupabaseError(error);
      this.showToast(apiError, config.suppressToast);
      return this.createErrorResponse(apiError, requestId);
    }
  }

  /**
   * Execute a Supabase update operation with standardized error handling
   */
  async update<T = any>(
    table: string,
    data: Partial<T>,
    config: SupabaseQueryConfig = {}
  ): Promise<ApiResponse<T[]>> {
    const requestId = config.requestId || this.generateRequestId();
    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(async () => {
        return supabase.from(table).update(data).select();
      }, config);

      const { data: resultData, error } = result as PostgrestResponse<T>;

      if (error) {
        const apiError = this.mapSupabaseError(error);
        this.showToast(apiError, config.suppressToast);
        return this.createErrorResponse(apiError, requestId);
      }

      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        source: 'supabase'
      };

      return this.createSuccessResponse(resultData || [], meta, 'Resource updated successfully');
    } catch (error) {
      const apiError = this.mapSupabaseError(error);
      this.showToast(apiError, config.suppressToast);
      return this.createErrorResponse(apiError, requestId);
    }
  }

  /**
   * Execute a Supabase delete operation with standardized error handling
   */
  async delete<T = any>(
    table: string,
    config: SupabaseQueryConfig = {}
  ): Promise<ApiResponse<T[]>> {
    const requestId = config.requestId || this.generateRequestId();
    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(async () => {
        return supabase.from(table).delete().select();
      }, config);

      const { data: resultData, error } = result as PostgrestResponse<T>;

      if (error) {
        const apiError = this.mapSupabaseError(error);
        this.showToast(apiError, config.suppressToast);
        return this.createErrorResponse(apiError, requestId);
      }

      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        source: 'supabase'
      };

      return this.createSuccessResponse(resultData || [], meta, 'Resource deleted successfully');
    } catch (error) {
      const apiError = this.mapSupabaseError(error);
      this.showToast(apiError, config.suppressToast);
      return this.createErrorResponse(apiError, requestId);
    }
  }

  /**
   * Execute a Supabase RPC call with standardized error handling
   */
  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {},
    config: SupabaseQueryConfig = {}
  ): Promise<ApiResponse<T>> {
    const requestId = config.requestId || this.generateRequestId();
    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(async () => {
        return supabase.rpc(functionName, params);
      }, config);

      const { data, error } = result as PostgrestResponse<T>;

      if (error) {
        const apiError = this.mapSupabaseError(error);
        this.showToast(apiError, config.suppressToast);
        return this.createErrorResponse(apiError, requestId);
      }

      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        source: 'supabase'
      };

      return this.createSuccessResponse(data, meta);
    } catch (error) {
      const apiError = this.mapSupabaseError(error);
      this.showToast(apiError, config.suppressToast);
      return this.createErrorResponse(apiError, requestId);
    }
  }

  /**
   * Get audit logs for debugging and monitoring
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Clear audit logs
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const logs = this.auditLogs;
    const successfulRequests = logs.filter(log => log.success);
    const failedRequests = logs.filter(log => !log.success);
    
    return {
      totalRequests: logs.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: logs.length ? (successfulRequests.length / logs.length) * 100 : 0,
      averageResponseTime: successfulRequests.length 
        ? successfulRequests.reduce((sum, log) => sum + log.duration, 0) / successfulRequests.length 
        : 0,
      errorsByCode: failedRequests.reduce((acc, log) => {
        const code = log.error?.code || 'UNKNOWN';
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const unifiedApiClient = UnifiedApiClient.getInstance();

// Export builder functions for common operations
export const createSelectQuery = (table: string, columns = '*') => ({
  execute: (config?: SupabaseQueryConfig) => unifiedApiClient.select(table, columns, config)
});

export const createInsertQuery = <T>(table: string, data: Partial<T> | Partial<T>[]) => ({
  execute: (config?: SupabaseQueryConfig) => unifiedApiClient.insert(table, data, config)
});

export const createUpdateQuery = <T>(table: string, data: Partial<T>) => ({
  execute: (config?: SupabaseQueryConfig) => unifiedApiClient.update(table, data, config)
});

export const createDeleteQuery = (table: string) => ({
  execute: (config?: SupabaseQueryConfig) => unifiedApiClient.delete(table, config)
});