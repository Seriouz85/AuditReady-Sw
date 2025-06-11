// Simple Sentry service with graceful fallbacks
interface ErrorContext {
  user?: {
    id: string;
    email: string;
    organization?: string;
  };
  extra?: Record<string, any>;
  tags?: Record<string, string>;
  level?: 'error' | 'warning' | 'info' | 'debug';
}

export class SentryService {
  private isInitialized = false;
  private isAvailable = false;

  async initialize(): Promise<boolean> {
    try {
      // Skip in development or if no DSN
      const dsn = import.meta.env.VITE_SENTRY_DSN;
      const environment = import.meta.env.VITE_APP_ENV || 'development';
      
      if (!dsn || environment === 'development') {
        console.log('🔍 Monitoring disabled (development mode or no DSN)');
        return false;
      }

      // Check browser environment
      if (typeof window === 'undefined') {
        console.warn('Sentry not available in server environment');
        return false;
      }

      // Try to import and initialize Sentry
      const Sentry = await import('@sentry/browser');
      
      Sentry.init({
        dsn,
        environment,
        release: import.meta.env.VITE_APP_VERSION || '1.0.0',
        sampleRate: 1.0,
        tracesSampleRate: 0.1,
        beforeSend: (event) => {
          // Filter sensitive information
          if (event.exception) {
            const error = event.exception.values?.[0];
            if (error?.value?.includes('password') || error?.value?.includes('token')) {
              return null;
            }
          }
          return event;
        },
      });

      this.isInitialized = true;
      this.isAvailable = true;
      console.log('🔍 Monitoring enabled');
      return true;
    } catch (error) {
      console.warn('🔍 Monitoring not available:', error instanceof Error ? error.message : 'Unknown error');
      this.isAvailable = false;
      return false;
    }
  }

  // Capture error with context
  async captureError(error: Error, context?: ErrorContext): Promise<string | null> {
    // Always log locally first
    console.error('Error captured:', error);
    
    if (!this.isInitialized || !this.isAvailable) {
      return null;
    }

    try {
      const Sentry = await import('@sentry/browser');

      // Set context
      if (context?.user) {
        Sentry.setUser({
          id: context.user.id,
          email: context.user.email,
          organization: context.user.organization,
        });
      }

      if (context?.extra) {
        Sentry.setContext('extra', context.extra);
      }

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          Sentry.setTag(key, value);
        });
      }

      const eventId = Sentry.captureException(error);
      return eventId;
    } catch (sentryError) {
      console.warn('Failed to capture error with Sentry:', sentryError);
      return null;
    }
  }

  // Capture message
  async captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' | 'debug' = 'info',
    context?: ErrorContext
  ): Promise<string | null> {
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    if (!this.isInitialized || !this.isAvailable) {
      return null;
    }

    try {
      const Sentry = await import('@sentry/browser');

      if (context?.user) {
        Sentry.setUser({
          id: context.user.id,
          email: context.user.email,
          organization: context.user.organization,
        });
      }

      if (context?.extra) {
        Sentry.setContext('extra', context.extra);
      }

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          Sentry.setTag(key, value);
        });
      }

      const eventId = Sentry.captureMessage(message, level);
      return eventId;
    } catch (sentryError) {
      console.warn('Failed to capture message with Sentry:', sentryError);
      return null;
    }
  }

  // Set user context
  async setUser(user: { id: string; email: string; organization?: string }): Promise<void> {
    if (!this.isInitialized || !this.isAvailable) return;

    try {
      const Sentry = await import('@sentry/browser');
      Sentry.setUser(user);
    } catch (error) {
      console.warn('Failed to set Sentry user:', error);
    }
  }

  // Clear user context
  async clearUser(): Promise<void> {
    if (!this.isInitialized || !this.isAvailable) return;

    try {
      const Sentry = await import('@sentry/browser');
      Sentry.getCurrentScope().clear();
    } catch (error) {
      console.warn('Failed to clear Sentry user:', error);
    }
  }

  // Add breadcrumb
  async addBreadcrumb(
    message: string,
    category: string,
    level: 'error' | 'warning' | 'info' | 'debug' = 'info',
    data?: Record<string, any>
  ): Promise<void> {
    if (!this.isInitialized || !this.isAvailable) return;

    try {
      const Sentry = await import('@sentry/browser');
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
        timestamp: Date.now() / 1000,
      });
    } catch (error) {
      console.warn('Failed to add Sentry breadcrumb:', error);
    }
  }

  // Convenience methods for common scenarios
  async captureAdminError(
    error: Error,
    adminAction: string,
    resourceType: string,
    resourceId?: string
  ): Promise<string | null> {
    return this.captureError(error, {
      tags: {
        component: 'platform_admin',
        action: adminAction,
        resource_type: resourceType,
      },
      extra: {
        resource_id: resourceId,
        timestamp: new Date().toISOString(),
      },
      level: 'error',
    });
  }

  async captureBillingError(
    error: Error,
    organizationId: string,
    billingAction: string
  ): Promise<string | null> {
    return this.captureError(error, {
      tags: {
        component: 'billing',
        action: billingAction,
      },
      extra: {
        organization_id: organizationId,
        timestamp: new Date().toISOString(),
      },
      level: 'error',
    });
  }

  async trackAdminPerformance(
    action: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const message = `Admin action: ${action} (${duration}ms, ${success ? 'success' : 'failed'})`;
    
    await this.captureMessage(
      message,
      success ? 'info' : 'warning',
      {
        tags: {
          component: 'platform_admin',
          action: action,
          success: success.toString(),
        },
        extra: {
          duration_ms: duration,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }
    );
  }

  // Get status
  getStatus(): { initialized: boolean; available: boolean; environment: string } {
    return {
      initialized: this.isInitialized,
      available: this.isAvailable,
      environment: import.meta.env.VITE_APP_ENV || 'development',
    };
  }
}

export const sentryService = new SentryService();