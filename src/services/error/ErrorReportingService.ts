/**
 * Enhanced Error Reporting Service
 * Comprehensive error tracking, analytics, and reporting system
 */

import { sentryService } from '@/services/monitoring/SentryService';

export interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'javascript' | 'api' | 'network' | 'user' | 'boundary';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: {
    component?: string;
    feature?: string;
    user_id?: string;
    organization_id?: string;
    session_id?: string;
    url: string;
    user_agent: string;
    viewport: string;
    timestamp: string;
  };
  metadata?: Record<string, any>;
  fingerprint?: string;
  resolved?: boolean;
  resolution_notes?: string;
}

export interface ErrorMetrics {
  total_errors: number;
  errors_by_type: Record<string, number>;
  errors_by_severity: Record<string, number>;
  errors_by_component: Record<string, number>;
  error_rate_last_24h: number;
  most_common_errors: Array<{
    fingerprint: string;
    message: string;
    count: number;
    last_seen: string;
  }>;
  resolution_rate: number;
}

export interface UserErrorExperience {
  user_id: string;
  organization_id?: string;
  error_count: number;
  last_error: string;
  error_frequency: 'low' | 'medium' | 'high';
  most_affected_features: string[];
  recovery_success_rate: number;
}

class ErrorReportingService {
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
    // Monitor network status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Process queued errors on startup
    this.processQueuedErrors();
    
    // Set up periodic error queue processing
    setInterval(() => this.processQueuedErrors(), 30000); // Every 30 seconds
  }

  private handleOnline() {
    this.isOnline = true;
    this.processQueuedErrors();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  /**
   * Report an error with comprehensive context
   */
  async reportError(
    error: Error | string,
    context: Partial<ErrorReport['context']> = {},
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: this.inferErrorType(error, context),
      severity: this.inferSeverity(error, context),
      message: errorMessage,
      stack: errorStack,
      context: {
        url: window.location.href,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        ...context
      },
      metadata: {
        ...metadata,
        memory_usage: this.getMemoryUsage(),
        connection_info: this.getConnectionInfo(),
        storage_usage: this.getStorageUsage()
      },
      fingerprint: this.generateFingerprint(errorMessage, context.component),
      resolved: false
    };

    // Store locally first
    this.storeErrorLocally(report);
    
    // Add to queue for processing
    this.errorQueue.push(report);
    
    // Try to send immediately if online
    if (this.isOnline) {
      await this.processQueuedErrors();
    }

    return report.id;
  }

  /**
   * Report user experience metrics
   */
  async reportUserExperience(
    action: 'error_encountered' | 'recovery_attempted' | 'recovery_successful' | 'recovery_failed',
    context: {
      error_id?: string;
      component?: string;
      feature?: string;
      user_id?: string;
      organization_id?: string;
    } = {}
  ): Promise<void> {
    try {
      await sentryService.addBreadcrumb(
        `User experience: ${action}`,
        'user_experience',
        'info',
        {
          action,
          ...context,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to report user experience:', error);
    }
  }

  /**
   * Get error metrics and analytics
   */
  getErrorMetrics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): ErrorMetrics {
    const stored = this.getStoredErrors(timeframe);
    
    return {
      total_errors: stored.length,
      errors_by_type: this.groupBy(stored, 'type'),
      errors_by_severity: this.groupBy(stored, 'severity'),
      errors_by_component: this.groupBy(stored, error => error.context.component || 'unknown'),
      error_rate_last_24h: this.calculateErrorRate(stored, '24h'),
      most_common_errors: this.getMostCommonErrors(stored),
      resolution_rate: this.calculateResolutionRate(stored)
    };
  }

  /**
   * Get user-specific error experience
   */
  getUserErrorExperience(userId: string, organizationId?: string): UserErrorExperience {
    const userErrors = this.getStoredErrors('30d').filter(error => 
      error.context.user_id === userId &&
      (!organizationId || error.context.organization_id === organizationId)
    );

    const errorCount = userErrors.length;
    const lastError = userErrors.length > 0 ? userErrors[0].timestamp : '';
    
    // Calculate error frequency based on errors per day
    const daysActive = 30; // Last 30 days
    const errorsPerDay = errorCount / daysActive;
    const errorFrequency = errorsPerDay > 5 ? 'high' : errorsPerDay > 1 ? 'medium' : 'low';

    // Get most affected features
    const featureCounts = this.groupBy(userErrors, error => error.context.feature || 'unknown');
    const mostAffectedFeatures = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);

    return {
      user_id: userId,
      organization_id: organizationId,
      error_count: errorCount,
      last_error: lastError,
      error_frequency: errorFrequency as 'low' | 'medium' | 'high',
      most_affected_features: mostAffectedFeatures,
      recovery_success_rate: this.calculateUserRecoveryRate(userId)
    };
  }

  /**
   * Mark an error as resolved
   */
  async resolveError(errorId: string, notes: string = ''): Promise<void> {
    try {
      const stored = this.getStoredErrors('30d');
      const errorIndex = stored.findIndex(error => error.id === errorId);
      
      if (errorIndex !== -1) {
        stored[errorIndex].resolved = true;
        stored[errorIndex].resolution_notes = notes;
        this.updateStoredErrors(stored);
      }

      await sentryService.captureMessage(
        `Error resolved: ${errorId}`,
        'info',
        {
          tags: { source: 'error_resolution' },
          extra: { error_id: errorId, notes }
        }
      );
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }

  /**
   * Export error reports for analysis
   */
  exportErrorReports(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    format: 'json' | 'csv' = 'json'
  ): string {
    const errors = this.getStoredErrors(timeframe);
    
    if (format === 'csv') {
      return this.convertToCSV(errors);
    }
    
    return JSON.stringify(errors, null, 2);
  }

  // Private methods

  private async processQueuedErrors(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const batch = this.errorQueue.splice(0, 10); // Process in batches of 10
    
    for (const report of batch) {
      try {
        await this.sendErrorReport(report);
      } catch (error) {
        console.error('Failed to send error report:', error);
        // Put back in queue for retry
        this.errorQueue.unshift(report);
        break; // Stop processing if sending fails
      }
    }
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    try {
      await sentryService.captureMessage(
        `Error Report: ${report.message}`,
        report.severity === 'critical' ? 'error' : 
        report.severity === 'high' ? 'error' :
        report.severity === 'medium' ? 'warning' : 'info',
        {
          tags: {
            error_type: report.type,
            severity: report.severity,
            component: report.context.component || 'unknown',
            feature: report.context.feature || 'unknown'
          },
          extra: {
            error_id: report.id,
            fingerprint: report.fingerprint,
            context: report.context,
            metadata: report.metadata
          }
        }
      );
    } catch (error) {
      throw new Error(`Failed to send error report: ${error}`);
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(message: string, component?: string): string {
    const input = `${component || 'unknown'}_${message}`;
    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private inferErrorType(
    error: Error | string, 
    context: Partial<ErrorReport['context']>
  ): ErrorReport['type'] {
    const message = typeof error === 'string' ? error : error.message;
    
    if (context.component?.includes('boundary')) return 'boundary';
    if (message.includes('fetch') || message.includes('network')) return 'network';
    if (message.includes('API') || message.includes('HTTP')) return 'api';
    if (context.component === 'user_action') return 'user';
    
    return 'javascript';
  }

  private inferSeverity(
    error: Error | string,
    context: Partial<ErrorReport['context']>
  ): ErrorReport['severity'] {
    const message = typeof error === 'string' ? error : error.message;
    
    if (context.component?.includes('global') || message.includes('critical')) return 'critical';
    if (message.includes('auth') || message.includes('security')) return 'high';
    if (context.component?.includes('feature')) return 'medium';
    
    return 'low';
  }

  private storeErrorLocally(report: ErrorReport): void {
    try {
      const stored = this.getStoredErrors('30d');
      stored.unshift(report);
      
      // Keep only last 1000 errors to prevent storage bloat
      const trimmed = stored.slice(0, 1000);
      localStorage.setItem('error_reports', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }

  private getStoredErrors(timeframe: string): ErrorReport[] {
    try {
      const stored = localStorage.getItem('error_reports');
      if (!stored) return [];
      
      const errors: ErrorReport[] = JSON.parse(stored);
      return this.filterByTimeframe(errors, timeframe);
    } catch {
      return [];
    }
  }

  private updateStoredErrors(errors: ErrorReport[]): void {
    try {
      localStorage.setItem('error_reports', JSON.stringify(errors));
    } catch (error) {
      console.error('Failed to update stored errors:', error);
    }
  }

  private filterByTimeframe(errors: ErrorReport[], timeframe: string): ErrorReport[] {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeframe) {
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      default:
        return errors;
    }
    
    return errors.filter(error => new Date(error.timestamp) > cutoff);
  }

  private groupBy<T>(array: T[], keyFn: string | ((item: T) => string)): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = typeof keyFn === 'string' ? item[keyFn as keyof T] as string : keyFn(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateErrorRate(errors: ErrorReport[], timeframe: string): number {
    const timeframePeriod = timeframe === '24h' ? 24 : 
                           timeframe === '7d' ? 24 * 7 :
                           timeframe === '30d' ? 24 * 30 : 1;
    
    return errors.length / timeframePeriod;
  }

  private getMostCommonErrors(errors: ErrorReport[]): ErrorMetrics['most_common_errors'] {
    const fingerprints = this.groupBy(errors, 'fingerprint');
    
    return Object.entries(fingerprints)
      .map(([fingerprint, count]) => {
        const lastError = errors.find(e => e.fingerprint === fingerprint);
        return {
          fingerprint,
          message: lastError?.message || 'Unknown error',
          count,
          last_seen: lastError?.timestamp || ''
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateResolutionRate(errors: ErrorReport[]): number {
    const resolvedCount = errors.filter(error => error.resolved).length;
    return errors.length > 0 ? (resolvedCount / errors.length) * 100 : 0;
  }

  private calculateUserRecoveryRate(userId: string): number {
    // This would typically integrate with user action tracking
    // For now, return a mock value
    return 75; // 75% recovery success rate
  }

  private getMemoryUsage() {
    try {
      // @ts-ignore - performance.memory is experimental
      const memory = performance.memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
      }
    } catch {
      // Memory API not available
    }
    return null;
  }

  private getConnectionInfo() {
    try {
      // @ts-ignore - navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        };
      }
    } catch {
      // Connection API not available
    }
    return null;
  }

  private getStorageUsage() {
    try {
      return {
        localStorage: this.getStorageSize('localStorage'),
        sessionStorage: this.getStorageSize('sessionStorage')
      };
    } catch {
      return null;
    }
  }

  private getStorageSize(storage: 'localStorage' | 'sessionStorage'): number {
    try {
      const store = window[storage];
      let size = 0;
      for (const key in store) {
        if (Object.prototype.hasOwnProperty.call(store, key)) {
          size += store[key].length + key.length;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }

  private convertToCSV(errors: ErrorReport[]): string {
    const headers = [
      'ID', 'Timestamp', 'Type', 'Severity', 'Message', 
      'Component', 'Feature', 'URL', 'Resolved'
    ];
    
    const rows = errors.map(error => [
      error.id,
      error.timestamp,
      error.type,
      error.severity,
      `"${error.message.replace(/"/g, '""')}"`, // Escape quotes
      error.context.component || '',
      error.context.feature || '',
      error.context.url,
      error.resolved ? 'Yes' : 'No'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const errorReportingService = new ErrorReportingService();