/**
 * Component Error Boundary
 * Fine-grained error boundary for individual components with minimal UI disruption
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sentryService } from '@/services/monitoring/SentryService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  EyeOff,
  Bug,
  X
} from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate the error or let it bubble up
  showMinimal?: boolean; // Show minimal error UI
  allowHide?: boolean; // Allow hiding the component
  retryable?: boolean; // Whether retry is allowed
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  isHidden: boolean;
  retryCount: number;
  isRetrying: boolean;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  private maxRetries = 1; // Single retry for component-level

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      isHidden: false,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';
    console.error(`[ComponentErrorBoundary:${componentName}] Error:`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Only report to Sentry if we're isolating the error
    if (this.props.isolate) {
      try {
        const eventId = await sentryService.captureError(error, {
          extra: {
            componentStack: errorInfo.componentStack,
            component_name: componentName,
            retry_count: this.state.retryCount,
            is_isolated: true,
            timestamp: new Date().toISOString()
          },
          tags: {
            component: 'component_error_boundary',
            component_name: componentName,
            severity: 'medium',
            isolation_level: 'component'
          },
          level: 'warning' // Lower severity for isolated component errors
        });

        this.setState({ eventId });
      } catch (sentryError) {
        console.error('Failed to report component error to Sentry:', sentryError);
      }
    } else {
      // Re-throw the error to let it bubble up to higher-level boundaries
      throw error;
    }
  }

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries || !this.props.retryable) {
      return;
    }

    this.setState({ isRetrying: true });

    // Small delay for retry
    await new Promise(resolve => setTimeout(resolve, 500));

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
      isHidden: false
    }));
  };

  private handleHide = () => {
    this.setState({ isHidden: true });
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    const componentName = this.props.componentName || 'Unknown Component';
    
    const bugReport = {
      component: componentName,
      eventId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500) // Limit stack trace length
      } : null,
      timestamp: new Date().toISOString()
    };

    const emailBody = encodeURIComponent(
      `Component Error Report - ${componentName}\n\n${JSON.stringify(bugReport, null, 2)}`
    );
    
    window.open(`mailto:support@auditready.com?subject=Component Error - ${componentName}&body=${emailBody}`);
  };

  private renderMinimalError = () => {
    const componentName = this.props.componentName || 'Component';
    const canRetry = this.props.retryable !== false && this.state.retryCount < this.maxRetries;

    return (
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700">
        <AlertCircle className="w-3 h-3" />
        <span>{componentName} error</span>
        
        {canRetry && (
          <button
            onClick={this.handleRetry}
            disabled={this.state.isRetrying}
            className="ml-1 px-1 hover:bg-red-100 rounded"
            title="Retry"
          >
            <RefreshCw className={`w-3 h-3 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {this.props.allowHide && (
          <button
            onClick={this.handleHide}
            className="ml-1 px-1 hover:bg-red-100 rounded"
            title="Hide"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  private renderFullError = () => {
    const componentName = this.props.componentName || 'Component';
    const canRetry = this.props.retryable !== false && this.state.retryCount < this.maxRetries;

    return (
      <Alert className="my-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>{componentName} Error</span>
          <div className="flex items-center gap-1">
            {this.state.eventId && (
              <Badge variant="outline" className="text-xs">
                ID: {this.state.eventId.slice(0, 6)}
              </Badge>
            )}
          </div>
        </AlertTitle>
        <AlertDescription>
          <div className="space-y-3">
            <p className="text-sm">
              This component encountered an error and cannot display properly.
            </p>

            {/* Error details for development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-20 overflow-auto">
                <div className="font-bold text-red-600">
                  {this.state.error.name}: {this.state.error.message}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  size="sm"
                  disabled={this.state.isRetrying}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                  {this.state.isRetrying ? 'Retrying...' : 'Retry'}
                </Button>
              )}

              {this.props.allowHide && (
                <Button
                  onClick={this.handleHide}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hide
                </Button>
              )}

              <Button
                onClick={this.handleReportBug}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Bug className="w-3 h-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  render() {
    // If hidden, render nothing
    if (this.state.isHidden) {
      return null;
    }

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal error UI
      if (this.props.showMinimal) {
        return this.renderMinimalError();
      }

      // Full error UI
      return this.renderFullError();
    }

    return this.props.children;
  }
}

// Higher-order component for easy component wrapping
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<Pick<Props, 'componentName' | 'isolate' | 'showMinimal' | 'allowHide' | 'retryable'>> = {}
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary 
      componentName={options.componentName || Component.displayName || Component.name}
      {...options}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withComponentErrorBoundary(${options.componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for component-level error handling
export function useComponentErrorHandler(componentName?: string) {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`[Component:${componentName}] Error:`, error);
    setError(error);

    // Report to Sentry
    sentryService.captureError(error, {
      tags: {
        source: 'component_error_handler',
        component: componentName || 'unknown'
      },
      extra: {
        context,
        timestamp: new Date().toISOString()
      },
      level: 'warning'
    });
  }, [componentName]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
}