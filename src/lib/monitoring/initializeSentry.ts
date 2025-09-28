/**
 * Enhanced Sentry Initialization
 * Comprehensive error monitoring setup with production-ready configuration
 */

import { sentryService } from '@/services/monitoring/SentryService';
import { errorReportingService } from '@/services/error/ErrorReportingService';

interface SentryInitOptions {
  environment?: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  enableUserFeedback?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export async function initializeSentry(options: SentryInitOptions = {}) {
  try {
    const {
      environment = import.meta.env.VITE_APP_ENV || 'development',
      release = import.meta.env.VITE_APP_VERSION || '1.0.0',
      sampleRate = 1.0,
      tracesSampleRate = environment === 'production' ? 0.1 : 1.0,
      enableUserFeedback = true,
      enablePerformanceMonitoring = true
    } = options;

    // Skip in development unless explicitly enabled
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn || (environment === 'development' && !import.meta.env.VITE_FORCE_SENTRY)) {
      console.log('🔍 Sentry monitoring disabled (development mode or no DSN)');
      return false;
    }

    // Initialize Sentry service
    const initialized = await sentryService.initialize();
    
    if (!initialized) {
      console.warn('🔍 Failed to initialize Sentry');
      return false;
    }

    // Set up additional Sentry configuration
    const Sentry = await import('@sentry/browser');
    const { BrowserTracing } = await import('@sentry/tracing');

    // Configure browser tracing for performance monitoring
    if (enablePerformanceMonitoring) {
      Sentry.addIntegration(new BrowserTracing({
        // Set sampling rates
        tracesSampleRate,
        
        // Capture interactions
        trackInteractions: true,
        
        // Route change tracking
        routingInstrumentation: Sentry.routingInstrumentation(
          // React Router v6 history
          window.history
        ),

        // Custom performance marks
        markBackgroundSpan: true,
        
        // Exclude certain URLs from tracking
        tracePropagationTargets: [
          /^https:\/\/api\.auditready\.com/,
          /^https:\/\/[^/]*\.auditready\.com/,
          /^\//
        ],

        // Don't track certain requests
        shouldCreateSpanForRequest: (url) => {
          // Skip tracking for certain endpoints
          const skipPatterns = [
            /\/health/,
            /\/metrics/,
            /\.js$/,
            /\.css$/,
            /\.map$/
          ];
          
          return !skipPatterns.some(pattern => pattern.test(url));
        }
      }));
    }

    // Set up user feedback integration
    if (enableUserFeedback) {
      const { UserFeedback } = await import('@sentry/browser');
      Sentry.addIntegration(new UserFeedback({
        // Auto-inject user feedback dialog on errors
        autoInject: false, // We'll handle this manually
        
        // Customize feedback dialog
        colorScheme: 'auto',
        showBranding: false,
        
        // Form configuration
        formTitle: 'Report Issue',
        subtitle: 'Help us improve by reporting this issue.',
        subtitle2: 'Your feedback is valuable to us.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelComments: 'What happened?',
        labelClose: 'Close',
        labelSubmit: 'Submit Report',
        errorGeneric: 'An error occurred while submitting your report.',
        errorFormEntry: 'Please check your form entries.',
        successMessage: 'Thank you for your report!'
      }));
    }

    // Set up custom error filtering and enhancement
    Sentry.addGlobalEventProcessor((event) => {
      // Filter out known non-critical errors
      if (event.exception?.values) {
        const error = event.exception.values[0];
        
        // Skip certain error types
        const skipErrors = [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'Network request failed',
          'Loading CSS chunk',
          'Loading chunk'
        ];
        
        if (skipErrors.some(skip => error.value?.includes(skip))) {
          return null;
        }
      }

      // Enhance error context
      if (event.level === 'error' || event.level === 'fatal') {
        // Add application context
        event.extra = {
          ...event.extra,
          app_version: release,
          environment,
          timestamp: new Date().toISOString(),
          session_id: sessionStorage.getItem('session_id'),
          
          // Browser context
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          url: window.location.href,
          referrer: document.referrer,
          
          // Performance context
          memory_usage: getMemoryUsage(),
          connection_info: getConnectionInfo(),
          
          // Feature flags (if any)
          feature_flags: getFeatureFlags()
        };

        // Add breadcrumbs for user actions
        if (!event.breadcrumbs) {
          event.breadcrumbs = [];
        }

        // Add page visibility state
        event.breadcrumbs.push({
          message: `Page visibility: ${document.visibilityState}`,
          category: 'state',
          level: 'info',
          timestamp: Date.now() / 1000
        });

        // Report to our internal error reporting service
        try {
          errorReportingService.reportError(
            event.exception?.values?.[0]?.value || event.message || 'Unknown error',
            {
              component: event.tags?.component as string,
              feature: event.tags?.feature as string,
              user_id: event.user?.id,
              organization_id: event.tags?.organization as string,
              url: window.location.href,
              user_agent: navigator.userAgent,
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              timestamp: new Date().toISOString()
            },
            {
              sentry_event_id: event.event_id,
              level: event.level,
              fingerprint: event.fingerprint,
              environment,
              release
            }
          );
        } catch (reportingError) {
          console.error('Failed to report to internal service:', reportingError);
        }
      }

      return event;
    });

    // Set up session tracking
    Sentry.setContext('session', {
      id: sessionStorage.getItem('session_id') || 'anonymous',
      started_at: new Date().toISOString(),
      page_loads: (parseInt(sessionStorage.getItem('page_loads') || '0') + 1).toString()
    });

    // Update page load counter
    sessionStorage.setItem('page_loads', 
      (parseInt(sessionStorage.getItem('page_loads') || '0') + 1).toString()
    );

    // Set up performance monitoring
    if (enablePerformanceMonitoring) {
      // Monitor Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToSentry);
        getFID(sendToSentry);
        getFCP(sendToSentry);
        getLCP(sendToSentry);
        getTTFB(sendToSentry);
      }).catch(() => {
        // web-vitals not available
      });
    }

    console.log('🔍 Sentry monitoring initialized successfully');
    return true;

  } catch (error) {
    console.error('🔍 Failed to initialize Sentry:', error);
    return false;
  }
}

// Helper functions

function getMemoryUsage() {
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

function getConnectionInfo() {
  try {
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
  } catch {
    // Connection API not available
  }
  return null;
}

function getFeatureFlags() {
  // Implement feature flag collection if using a feature flag service
  return {};
}

function sendToSentry(metric: any) {
  import('@sentry/browser').then(Sentry => {
    Sentry.addBreadcrumb({
      message: `Web Vital: ${metric.name}`,
      category: 'performance',
      level: 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta
      },
      timestamp: Date.now() / 1000
    });

    // Report performance issues
    if (metric.rating === 'poor') {
      Sentry.captureMessage(
        `Poor ${metric.name}: ${metric.value}`,
        'warning'
      );
    }
  });
}

// Export for use in error boundaries
export { sentryService, errorReportingService };