/**
 * Global Error Boundary
 * Top-level error boundary for catastrophic failures with comprehensive recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sentryService } from '@/services/monitoring/SentryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Download,
  Wifi,
  WifiOff,
  Clock,
  Shield
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  retryCount: number;
  isOnline: boolean;
  errorTimestamp: string | null;
  recoveryData: any;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: 0,
      isOnline: navigator.onLine,
      errorTimestamp: null,
      recoveryData: null
    };

    // Bind network listeners
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Try to recover any saved data
    this.loadRecoveryData();
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline() {
    this.setState({ isOnline: true });
    // Attempt auto-recovery when coming back online
    if (this.state.hasError && this.state.retryCount < this.maxRetries) {
      setTimeout(() => this.handleRetry(), 2000);
    }
  }

  handleOffline() {
    this.setState({ isOnline: false });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorTimestamp: new Date().toISOString()
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Catastrophic error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Save error state for recovery
    this.saveErrorState(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to Sentry with enhanced context
    try {
      const eventId = await sentryService.captureError(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          error_boundary: 'global',
          url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          session_storage_size: this.getStorageSize('sessionStorage'),
          local_storage_size: this.getStorageSize('localStorage'),
          memory_usage: this.getMemoryUsage(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          connection: this.getConnectionInfo()
        },
        tags: {
          component: 'global_error_boundary',
          severity: 'critical',
          has_retry_available: (this.state.retryCount < this.maxRetries).toString(),
          is_online: this.state.isOnline.toString()
        },
        level: 'error'
      });

      this.setState({ eventId });
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }
  }

  private saveErrorState(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorState = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      localStorage.setItem('global_error_state', JSON.stringify(errorState));
      
      // Save current application state if available
      const appState = this.captureApplicationState();
      if (appState) {
        localStorage.setItem('app_recovery_state', JSON.stringify(appState));
      }
    } catch (saveError) {
      console.error('Failed to save error state:', saveError);
    }
  }

  private loadRecoveryData() {
    try {
      const recoveryData = localStorage.getItem('app_recovery_state');
      if (recoveryData) {
        this.setState({ recoveryData: JSON.parse(recoveryData) });
      }
    } catch (error) {
      console.error('Failed to load recovery data:', error);
    }
  }

  private captureApplicationState() {
    try {
      // Capture current route, form data, etc.
      return {
        route: window.location.pathname + window.location.search,
        timestamp: new Date().toISOString(),
        sessionId: sessionStorage.getItem('session_id'),
        // Add more application-specific state as needed
      };
    } catch (error) {
      console.error('Failed to capture application state:', error);
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

  private getMemoryUsage() {
    try {
      // @ts-ignore - performance.memory is not in all browsers
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
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    } catch {
      // Connection API not available
    }
    return null;
  }

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // Add delay for retry with exponential backoff
    const delay = this.retryDelay * Math.pow(2, this.state.retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Clear error state to trigger retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      errorTimestamp: null
    });

    // Clear error states from storage
    localStorage.removeItem('global_error_state');
  };

  private handleReload = () => {
    // Save current retry count to prevent infinite loops
    sessionStorage.setItem('error_reload_count', (this.state.retryCount + 1).toString());
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear all error states
    localStorage.removeItem('global_error_state');
    localStorage.removeItem('app_recovery_state');
    sessionStorage.removeItem('error_reload_count');
    
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    
    const bugReport = {
      eventId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: this.state.errorTimestamp,
      retryCount: this.state.retryCount
    };

    const emailBody = encodeURIComponent(
      `Critical Error Report\n\n${JSON.stringify(bugReport, null, 2)}`
    );
    
    window.open(`mailto:support@auditready.com?subject=Critical Error Report&body=${emailBody}`);
  };

  private handleDownloadReport = () => {
    const { error, errorInfo, eventId } = this.state;
    
    const report = {
      eventId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: this.state.errorTimestamp,
      retryCount: this.state.retryCount,
      memoryUsage: this.getMemoryUsage(),
      connectionInfo: this.getConnectionInfo(),
      storageInfo: {
        localStorage: this.getStorageSize('localStorage'),
        sessionStorage: this.getStorageSize('sessionStorage')
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  private handleRecoverSession = () => {
    if (this.state.recoveryData) {
      try {
        // Attempt to restore the previous route
        window.location.href = this.state.recoveryData.route || '/';
      } catch (error) {
        console.error('Failed to recover session:', error);
        this.handleGoHome();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Critical error UI
      const canRetry = this.state.retryCount < this.maxRetries;
      const hasRecoveryData = !!this.state.recoveryData;

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-xl border-red-200">
            <CardHeader className="text-center border-b border-red-100">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <CardTitle className="text-2xl text-red-700 mb-2">
                Critical System Error
              </CardTitle>
              
              <CardDescription className="text-gray-600">
                The application encountered a serious error and needs to recover.
                {this.state.eventId && (
                  <div className="mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
                    Error ID: {this.state.eventId}
                  </div>
                )}
              </CardDescription>

              {/* Status badges */}
              <div className="flex justify-center gap-2 mt-4">
                <Badge variant={this.state.isOnline ? "default" : "destructive"} className="text-xs">
                  {this.state.isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>
                
                {this.state.retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retries: {this.state.retryCount}/{this.maxRetries}
                  </Badge>
                )}
                
                {this.state.errorTimestamp && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(this.state.errorTimestamp).toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Error details for development */}
              {import.meta.env.DEV && this.state.error && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Bug className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Development Mode - Error Details</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    <div className="font-mono text-xs mt-2 max-h-32 overflow-auto bg-white p-2 rounded border">
                      <div className="font-bold text-red-600 mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <pre className="whitespace-pre-wrap text-xs text-gray-700">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recovery options */}
              {hasRecoveryData && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Session Recovery Available</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    We found a previous session that can be restored.
                  </AlertDescription>
                </Alert>
              )}

              {/* Primary actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="w-full"
                    disabled={!this.state.isOnline}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </Button>
                )}

                {hasRecoveryData && (
                  <Button 
                    onClick={this.handleRecoverSession}
                    variant="outline"
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Recover Session
                  </Button>
                )}

                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>

                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button 
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>

                <Button 
                  onClick={this.handleDownloadReport}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>

              {/* Offline notice */}
              {!this.state.isOnline && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <WifiOff className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">No Internet Connection</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Some recovery options may be limited while offline. 
                    Error details have been saved locally and will be reported when connection is restored.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                If this problem persists, please contact our support team with the error ID above.
                <br />
                <span className="font-mono">Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}