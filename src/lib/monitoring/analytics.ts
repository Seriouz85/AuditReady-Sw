// Analytics and monitoring utilities
import * as React from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

interface PerformanceMetrics {
  route: string;
  loadTime: number;
  renderTime?: number;
  bundleSize?: number;
  timestamp: number;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  url: string;
  userId?: string;
  userAgent: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class Analytics {
  private isEnabled: boolean;
  private userId: string | null = null;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private errors: ErrorDetails[] = [];

  constructor() {
    this.isEnabled = !import.meta.env.DEV && import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.initializePerformanceMonitoring();
      this.initializeErrorTracking();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMonitoring(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackPerformance({
              route: window.location.pathname,
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              timestamp: Date.now(),
            });
          }
        }, 100);
      });

      // Monitor resource loading
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.trackPerformance({
              route: window.location.pathname,
              loadTime: entry.duration,
              timestamp: Date.now(),
            });
          }
        }
      }).observe({ entryTypes: ['measure'] });
    }
  }

  private initializeErrorTracking(): void {
    if (typeof window !== 'undefined') {
      // Global error handler
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          stack: event.error?.stack,
          url: event.filename || window.location.href,
          timestamp: Date.now(),
          severity: 'high',
          userAgent: navigator.userAgent,
          context: {
            line: event.lineno,
            column: event.colno,
          },
        });
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          url: window.location.href,
          timestamp: Date.now(),
          severity: 'medium',
          userAgent: navigator.userAgent,
          context: {
            type: 'unhandledrejection',
            reason: event.reason,
          },
        });
      });
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  clearUserId(): void {
    this.userId = null;
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
      userId: this.userId || undefined,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    this.sendEvent(analyticsEvent);
  }

  trackPerformance(metrics: Omit<PerformanceMetrics, 'timestamp'> & { timestamp?: number }): void {
    if (!this.isEnabled) return;

    const performanceMetric: PerformanceMetrics = {
      ...metrics,
      timestamp: metrics.timestamp || Date.now(),
    };

    this.performanceMetrics.push(performanceMetric);
    this.sendPerformanceMetric(performanceMetric);
  }

  trackError(error: Omit<ErrorDetails, 'timestamp'> & { timestamp?: number }): void {
    const errorDetail: ErrorDetails = {
      ...error,
      timestamp: error.timestamp || Date.now(),
      userId: this.userId || undefined,
    };

    this.errors.push(errorDetail);
    
    if (this.isEnabled) {
      this.sendError(errorDetail);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('Tracked Error:', errorDetail);
    }
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  private async sendPerformanceMetric(metric: PerformanceMetrics): Promise<void> {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  private async sendError(error: ErrorDetails): Promise<void> {
    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (error) {
      console.warn('Failed to send error report:', error);
    }
  }

  // Convenience methods for common events
  trackPageView(route: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      route,
      ...properties,
    });
  }

  trackUserAction(action: string, target: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      target,
      ...properties,
    });
  }

  trackFeatureUsage(feature: string, properties?: Record<string, any>): void {
    this.track('feature_usage', {
      feature,
      ...properties,
    });
  }

  trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    this.track('api_call', {
      endpoint,
      method,
      duration,
      status,
      success: status >= 200 && status < 300,
    });
  }

  trackFormSubmission(formName: string, success: boolean, errors?: string[]): void {
    this.track('form_submission', {
      form_name: formName,
      success,
      errors,
    });
  }

  trackSearch(query: string, results: number, filters?: Record<string, any>): void {
    this.track('search', {
      query,
      results,
      filters,
    });
  }

  trackDownload(fileName: string, fileType: string, fileSize?: number): void {
    this.track('download', {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    });
  }

  // Batch operations
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  clearLocalData(): void {
    this.events = [];
    this.performanceMetrics = [];
    this.errors = [];
  }

  // Export data for debugging
  exportData(): {
    events: AnalyticsEvent[];
    performance: PerformanceMetrics[];
    errors: ErrorDetails[];
    session: string;
  } {
    return {
      events: this.getEvents(),
      performance: this.getPerformanceMetrics(),
      errors: this.getErrors(),
      session: this.sessionId,
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackAPICall: analytics.trackAPICall.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
  };
};

// HOC for automatic page view tracking
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) => {
  return function WithAnalyticsComponent(props: P) {
    React.useEffect(() => {
      const route = pageName || window.location.pathname;
      analytics.trackPageView(route);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};