/**
 * Feature Error Boundary
 * Module-level error boundary for specific features with graceful degradation
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sentryService } from '@/services/monitoring/SentryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Bug,
  AlertTriangle,
  Settings,
  Wrench
} from 'lucide-react';

export type FeatureType = 
  | 'compliance'
  | 'admin'
  | 'lms'
  | 'assessments'
  | 'documents'
  | 'reports'
  | 'suppliers'
  | 'editor'
  | 'settings'
  | 'dashboard';

interface Props {
  children: ReactNode;
  feature: FeatureType;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  allowRetry?: boolean;
  showFallbackContent?: boolean;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  retryCount: number;
  isRetrying: boolean;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  private maxRetries = 2; // Fewer retries for feature-level errors

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
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
    console.error(`[FeatureErrorBoundary:${this.props.feature}] Error:`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to Sentry with feature context
    try {
      const eventId = await sentryService.captureError(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          feature: this.props.feature,
          retry_count: this.state.retryCount,
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        tags: {
          component: 'feature_error_boundary',
          feature: this.props.feature,
          severity: 'high',
          has_fallback: !!this.props.fallback,
          allow_retry: this.props.allowRetry !== false
        },
        level: 'error'
      });

      this.setState({ eventId });
    } catch (sentryError) {
      console.error('Failed to report feature error to Sentry:', sentryError);
    }
  }

  private getFeatureConfig() {
    const configs = {
      compliance: {
        title: 'Compliance Module Error',
        description: 'The compliance management system encountered an error.',
        icon: Settings,
        color: 'blue',
        fallbackMessage: 'You can still access other features while we fix this issue.',
        recoveryActions: ['Check system status', 'Try a different compliance framework', 'Contact support']
      },
      admin: {
        title: 'Admin Panel Error',
        description: 'The administration panel encountered an error.',
        icon: Wrench,
        color: 'purple',
        fallbackMessage: 'Some admin features may be temporarily unavailable.',
        recoveryActions: ['Check permissions', 'Verify system status', 'Use alternative admin tools']
      },
      lms: {
        title: 'Learning System Error',
        description: 'The Learning Management System encountered an error.',
        icon: AlertTriangle,
        color: 'green',
        fallbackMessage: 'Learning content may be temporarily inaccessible.',
        recoveryActions: ['Check course availability', 'Try offline materials', 'Contact instructor']
      },
      assessments: {
        title: 'Assessment Error',
        description: 'The assessment system encountered an error.',
        icon: AlertCircle,
        color: 'orange',
        fallbackMessage: 'Assessment data may be temporarily unavailable.',
        recoveryActions: ['Save current progress', 'Try alternative assessment', 'Contact support']
      },
      documents: {
        title: 'Document System Error',
        description: 'The document management system encountered an error.',
        icon: AlertCircle,
        color: 'red',
        fallbackMessage: 'Document access may be limited.',
        recoveryActions: ['Check file permissions', 'Try manual upload', 'Use alternative storage']
      },
      reports: {
        title: 'Reporting Error',
        description: 'The reporting system encountered an error.',
        icon: AlertCircle,
        color: 'indigo',
        fallbackMessage: 'Report generation may be temporarily unavailable.',
        recoveryActions: ['Try different date range', 'Export raw data', 'Schedule report for later']
      },
      suppliers: {
        title: 'Supplier Portal Error',
        description: 'The supplier management system encountered an error.',
        icon: AlertCircle,
        color: 'cyan',
        fallbackMessage: 'Supplier information may be temporarily inaccessible.',
        recoveryActions: ['Check network connection', 'Use cached data', 'Contact supplier directly']
      },
      editor: {
        title: 'Editor Error',
        description: 'The document editor encountered an error.',
        icon: AlertTriangle,
        color: 'pink',
        fallbackMessage: 'Your work has been automatically saved.',
        recoveryActions: ['Check auto-save status', 'Export current work', 'Use alternative editor']
      },
      settings: {
        title: 'Settings Error',
        description: 'The settings panel encountered an error.',
        icon: Settings,
        color: 'gray',
        fallbackMessage: 'Some settings may be temporarily unavailable.',
        recoveryActions: ['Use default settings', 'Check system configuration', 'Contact admin']
      },
      dashboard: {
        title: 'Dashboard Error',
        description: 'The dashboard encountered an error.',
        icon: AlertCircle,
        color: 'slate',
        fallbackMessage: 'Some dashboard widgets may not display correctly.',
        recoveryActions: ['Refresh specific widgets', 'Check data sources', 'Use alternative views']
      }
    };

    return configs[this.props.feature] || configs.dashboard;
  }

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries || !this.props.allowRetry) {
      return;
    }

    this.setState({ isRetrying: true });

    // Add small delay for retry
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }));
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    
    const bugReport = {
      feature: this.props.feature,
      eventId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const emailBody = encodeURIComponent(
      `Feature Error Report - ${this.props.feature}\n\n${JSON.stringify(bugReport, null, 2)}`
    );
    
    window.open(`mailto:support@auditready.com?subject=Feature Error - ${this.props.feature}&body=${emailBody}`);
  };

  private renderFallbackContent = () => {
    const config = this.getFeatureConfig();
    const IconComponent = config.icon;

    return (
      <Card className={`border-${config.color}-200 bg-${config.color}-50`}>
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto w-12 h-12 bg-${config.color}-100 rounded-full flex items-center justify-center mb-4`}>
            <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
          </div>
          <CardTitle className={`text-lg text-${config.color}-800`}>
            Feature Temporarily Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={`text-sm text-${config.color}-700`}>
            The {this.props.feature} feature is currently experiencing issues.
          </p>
          <p className={`text-xs text-${config.color}-600`}>
            {config.fallbackMessage}
          </p>
          
          {config.recoveryActions && (
            <div className="mt-4">
              <h4 className={`text-sm font-medium text-${config.color}-800 mb-2`}>
                Suggested Actions:
              </h4>
              <ul className={`text-xs text-${config.color}-700 space-y-1`}>
                {config.recoveryActions.map((action, index) => (
                  <li key={index}>• {action}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {this.props.allowRetry !== false && this.state.retryCount < this.maxRetries && (
              <Button
                onClick={this.handleRetry}
                size="sm"
                disabled={this.state.isRetrying}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              onClick={this.handleGoBack}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show fallback content instead of full error if requested
      if (this.props.showFallbackContent) {
        return this.renderFallbackContent();
      }

      // Full error UI
      const config = this.getFeatureConfig();
      const IconComponent = config.icon;
      const canRetry = this.props.allowRetry !== false && this.state.retryCount < this.maxRetries;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className={`mx-auto w-12 h-12 bg-${config.color}-100 rounded-full flex items-center justify-center mb-4`}>
                <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
              </div>
              
              <CardTitle className={`text-lg text-${config.color}-700`}>
                {config.title}
              </CardTitle>
              
              <p className={`text-sm text-${config.color}-600`}>
                {config.description}
              </p>

              {this.state.eventId && (
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    Error ID: {this.state.eventId.slice(0, 8)}
                  </Badge>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error details for development */}
              {import.meta.env.DEV && this.state.error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertTitle>Development Details</AlertTitle>
                  <AlertDescription className="font-mono text-xs mt-2 max-h-24 overflow-auto">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="w-full"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Retrying...' : `Try Again (${this.maxRetries - this.state.retryCount} left)`}
                  </Button>
                )}

                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>

                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center pt-2">
                {this.props.fallbackMessage || 'Other features remain available.'}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy feature wrapping
export function withFeatureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureType,
  options: Partial<Pick<Props, 'allowRetry' | 'showFallbackContent' | 'fallbackMessage'>> = {}
) {
  const WrappedComponent = (props: P) => (
    <FeatureErrorBoundary feature={feature} {...options}>
      <Component {...props} />
    </FeatureErrorBoundary>
  );

  WrappedComponent.displayName = `withFeatureErrorBoundary(${feature})(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}