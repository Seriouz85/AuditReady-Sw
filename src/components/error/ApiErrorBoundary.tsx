/**
 * API Error Boundary Component
 * Handles API errors and provides consistent error UI across the application
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { ApiError, ApiErrorCode } from '@/lib/api/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  apiError: ApiError | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      apiError: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is an API error with structured data
    const apiError = (error as any).apiError as ApiError;
    
    return {
      hasError: true,
      error,
      apiError: apiError || null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ApiErrorBoundary] Caught error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log to monitoring service in production
    if (import.meta.env.PROD) {
      // Send to Sentry or other monitoring service
      console.error('[Production Error]', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        apiError: null
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Open email client with pre-filled error report
    const emailBody = encodeURIComponent(
      `Error Report:\n\n${JSON.stringify(errorReport, null, 2)}`
    );
    window.open(`mailto:support@auditready.com?subject=Error Report&body=${emailBody}`);
  };

  private renderErrorMessage() {
    const { apiError, error } = this.state;

    if (apiError) {
      return this.renderApiError(apiError);
    }

    return this.renderGenericError(error);
  }

  private renderApiError(apiError: ApiError) {
    const getErrorConfig = (code: string) => {
      switch (code) {
        case ApiErrorCode.UNAUTHORIZED:
        case ApiErrorCode.TOKEN_EXPIRED:
          return {
            title: 'Authentication Required',
            description: 'Please log in to continue accessing this feature.',
            action: 'Log In',
            actionHandler: () => window.location.href = '/login',
            canRetry: false
          };

        case ApiErrorCode.FORBIDDEN:
        case ApiErrorCode.INSUFFICIENT_PERMISSIONS:
          return {
            title: 'Access Denied',
            description: 'You don\'t have permission to access this resource.',
            action: 'Go Home',
            actionHandler: this.handleGoHome,
            canRetry: false
          };

        case ApiErrorCode.NOT_FOUND:
          return {
            title: 'Resource Not Found',
            description: 'The requested resource could not be found.',
            action: 'Go Home',
            actionHandler: this.handleGoHome,
            canRetry: true
          };

        case ApiErrorCode.VALIDATION_ERROR:
          return {
            title: 'Validation Error',
            description: apiError.message || 'Please check your input and try again.',
            action: 'Try Again',
            actionHandler: this.handleRetry,
            canRetry: true
          };

        case ApiErrorCode.RATE_LIMITED:
          return {
            title: 'Rate Limited',
            description: 'Too many requests. Please wait a moment before trying again.',
            action: 'Try Again',
            actionHandler: this.handleRetry,
            canRetry: true
          };

        case ApiErrorCode.NETWORK_ERROR:
          return {
            title: 'Network Error',
            description: 'Please check your internet connection and try again.',
            action: 'Retry',
            actionHandler: this.handleRetry,
            canRetry: true
          };

        case ApiErrorCode.INTERNAL_ERROR:
        case ApiErrorCode.DATABASE_ERROR:
          return {
            title: 'Server Error',
            description: 'We\'re experiencing technical difficulties. Please try again later.',
            action: 'Retry',
            actionHandler: this.handleRetry,
            canRetry: true
          };

        default:
          return {
            title: 'Error',
            description: apiError.message || 'An unexpected error occurred.',
            action: 'Try Again',
            actionHandler: this.handleRetry,
            canRetry: true
          };
      }
    };

    const config = getErrorConfig(apiError.code);

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {config.description}
          </p>

          {this.props.showDetails && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Technical Details</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                <div>Code: {apiError.code}</div>
                <div>Request ID: {apiError.requestId}</div>
                <div>Time: {new Date(apiError.timestamp).toLocaleString()}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={config.actionHandler} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {config.action}
            </Button>

            {config.canRetry && this.retryCount < this.maxRetries && (
              <Button 
                variant="outline" 
                onClick={this.handleRetry} 
                className="w-full"
                disabled={this.retryCount >= this.maxRetries}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({this.maxRetries - this.retryCount} attempts left)
              </Button>
            )}

            <Button variant="ghost" onClick={this.handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button variant="ghost" onClick={this.handleReportBug} className="w-full">
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  private renderGenericError(error: Error | null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            We encountered an unexpected error. Please try refreshing the page.
          </p>

          {this.props.showDetails && error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={this.handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" onClick={this.handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button variant="ghost" onClick={this.handleReportBug} className="w-full">
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          {this.renderErrorMessage()}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ApiErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ApiErrorBoundary>
  );

  WrappedComponent.displayName = `withApiErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling API errors in functional components
export function useApiErrorHandler() {
  const handleError = React.useCallback((error: any) => {
    // Convert regular errors to API errors
    if (error && typeof error === 'object') {
      const apiError: ApiError = {
        code: error.code || ApiErrorCode.UNKNOWN_ERROR,
        message: error.message || 'An unexpected error occurred',
        details: error,
        timestamp: new Date().toISOString(),
        requestId: error.requestId
      };

      // Throw enhanced error that the boundary can catch
      const enhancedError = new Error(error.message || 'API Error');
      (enhancedError as any).apiError = apiError;
      throw enhancedError;
    }

    throw error;
  }, []);

  return { handleError };
}