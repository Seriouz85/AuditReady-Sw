import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';

// Enhanced Sentry configuration
export const initializeSentry = () => {
  const isDev = import.meta.env.DEV;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  const release = import.meta.env.VITE_APP_VERSION || 'unknown';

  if (!sentryDsn || isDev) {
    console.log('Sentry not initialized: missing DSN or in development mode');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    release,
    integrations: [
      new BrowserTracing({
        // Performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/[^\/]*\.supabase\.co/,
          /^https:\/\/api\.stripe\.com/,
        ],
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      ...Sentry.defaultIntegrations.filter((integration) => {
        // Remove default integrations that might capture too much data
        return integration.name !== 'Breadcrumbs';
      }),
      new Sentry.Integrations.Breadcrumbs({
        console: false, // Don't capture console logs
        dom: true,
        fetch: true,
        history: true,
        sentry: true,
        xhr: true,
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Error sampling
    sampleRate: 1.0,
    
    // Release health
    autoSessionTracking: true,
    
    // Enhanced error context
    beforeSend(event, hint) {
      // Filter out development errors
      if (isDev) {
        return null;
      }

      // Add user context if available
      const userState = useAuthStore?.getState?.();
      if (userState?.user) {
        event.user = {
          id: userState.user.id,
          email: userState.user.email,
        };
      }

      // Add organization context
      const orgState = useOrganizationStore?.getState?.();
      if (orgState?.currentOrganization) {
        event.contexts = {
          ...event.contexts,
          organization: {
            id: orgState.currentOrganization.id,
            name: orgState.currentOrganization.name,
            tier: orgState.currentOrganization.subscription_tier,
          },
        };
      }

      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out network errors that might be temporary
        if (error.message.includes('Network Error') || 
            error.message.includes('Failed to fetch')) {
          return null;
        }

        // Filter out ChunkLoadError (common in SPAs)
        if (error.name === 'ChunkLoadError') {
          return null;
        }

        // Filter out ResizeObserver errors (known browser issue)
        if (error.message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }

      // Add custom breadcrumb data
      if (breadcrumb.category === 'navigation') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: Date.now(),
        };
      }

      return breadcrumb;
    },

    // Enhanced fingerprinting
    fingerprint: ['{{ default }}'],
    
    // Security
    allowUrls: [
      // Only capture errors from our domains
      /https:\/\/[^\/]*\.vercel\.app/,
      /https:\/\/auditready\.com/,
      /https:\/\/[^\/]*\.auditready\.com/,
    ],
    
    // Ignore common third-party errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Generic error from Safari
      'Script error.',
      // Chrome extensions
      /extension\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  // Set initial context
  Sentry.setContext('app', {
    name: 'AuditReady',
    version: release,
    environment,
  });
};

// Custom error reporting utilities
export const reportError = (
  error: Error,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'error'
) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context) {
      scope.setContext('additional', context);
    }
    
    Sentry.captureException(error);
  });
};

export const reportMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context) {
      scope.setContext('additional', context);
    }
    
    Sentry.captureMessage(message);
  });
};

// Performance monitoring
export const startTransaction = (name: string, operation: string) => {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

// User context management
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
  organizationId?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    organizationId: user.organizationId,
  });
};

export const clearUser = () => {
  Sentry.setUser(null);
};

// Tag management
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

// Context management
export const setContext = (key: string, context: Record<string, any>) => {
  Sentry.setContext(key, context);
};

// React error boundary integration
export const withSentryErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryOptions?: Sentry.ErrorBoundaryProps
) => {
  return Sentry.withErrorBoundary(WrappedComponent, {
    fallback: () => React.createElement('div', {
      style: { padding: '2rem', textAlign: 'center' }
    }, 'Something went wrong. Please refresh the page.'),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setContext('react', {
        componentStack: errorInfo.componentStack,
      });
    },
    ...errorBoundaryOptions,
  });
};

// Performance monitoring hooks
export const useSentryTransaction = (name: string, operation: string) => {
  const [transaction, setTransaction] = React.useState<Sentry.Transaction | null>(null);

  React.useEffect(() => {
    const txn = startTransaction(name, operation);
    setTransaction(txn);

    return () => {
      txn?.finish();
    };
  }, [name, operation]);

  return transaction;
};

// Import required React hooks for router integration
import React, { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { createRoutesFromChildren, matchRoutes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';