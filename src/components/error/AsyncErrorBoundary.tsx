/**
 * Async Error Boundary
 * Specialized error boundary for async operations with automatic retry and loading states
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sentryService } from '@/services/monitoring/SentryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi,
  WifiOff,
  Clock,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Props {
  children: ReactNode;
  operationName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => Promise<void>;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showProgress?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  retryCount: number;
  isRetrying: boolean;
  isOnline: boolean;
  retryProgress: number;
  lastRetryTime: string | null;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private progressIntervalId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: 0,
      isRetrying: false,
      isOnline: navigator.onLine,
      retryProgress: 0,
      lastRetryTime: null
    };

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
    }
  }

  handleOnline() {
    this.setState({ isOnline: true });
    
    // Auto-retry when coming back online
    if (this.state.hasError && this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      setTimeout(() => this.handleRetry(), 1000);
    }
  }

  handleOffline() {
    this.setState({ isOnline: false });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const operationName = this.props.operationName || 'Async Operation';
    console.error(`[AsyncErrorBoundary:${operationName}] Error:`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to Sentry
    try {
      const eventId = await sentryService.captureError(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          operation_name: operationName,
          retry_count: this.state.retryCount,
          is_online: this.state.isOnline,
          auto_retry: this.props.autoRetry,
          timestamp: new Date().toISOString()
        },
        tags: {
          component: 'async_error_boundary',
          operation: operationName,
          severity: 'medium',
          async_operation: 'true'
        },
        level: 'warning'
      });

      this.setState({ eventId });
    } catch (sentryError) {
      console.error('Failed to report async error to Sentry:', sentryError);
    }

    // Auto-retry if enabled
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
  }

  private scheduleRetry = () => {
    const delay = this.props.retryDelay || 1000 * Math.pow(2, this.state.retryCount);
    
    this.setState({ 
      retryProgress: 0,
      lastRetryTime: new Date().toISOString()
    });

    // Start progress animation if enabled
    if (this.props.showProgress) {
      this.startProgressAnimation(delay);
    }

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private startProgressAnimation = (duration: number) => {
    const interval = 100; // Update every 100ms
    const steps = duration / interval;
    let currentStep = 0;

    this.progressIntervalId = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;
      
      this.setState({ retryProgress: Math.min(progress, 100) });

      if (currentStep >= steps) {
        if (this.progressIntervalId) {
          clearInterval(this.progressIntervalId);
        }
      }
    }, interval);
  };

  private handleRetry = async () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    try {
      // Execute custom retry logic if provided
      if (this.props.onRetry) {
        await this.props.onRetry();
      }

      // Clear error state
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
        retryProgress: 0
      }));

    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
        retryProgress: 0
      }));

      // Schedule next retry if under limit
      if (this.state.retryCount + 1 < maxRetries && this.props.autoRetry) {
        this.scheduleRetry();
      }
    }
  };

  private handleManualRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
    }
    
    this.handleRetry();
  };

  private getRetryStatus = () => {
    const maxRetries = this.props.maxRetries || 3;
    const remaining = maxRetries - this.state.retryCount;
    
    if (this.state.isRetrying) {
      return { status: 'retrying', message: 'Retrying operation...', color: 'blue' };
    }
    
    if (this.retryTimeoutId && this.props.autoRetry) {
      return { status: 'scheduled', message: `Next retry in ${Math.ceil(this.state.retryProgress / 10)}s`, color: 'yellow' };
    }
    
    if (remaining > 0) {
      return { status: 'available', message: `${remaining} retries remaining`, color: 'green' };
    }
    
    return { status: 'exhausted', message: 'No retries remaining', color: 'red' };
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const operationName = this.props.operationName || 'Operation';
      const maxRetries = this.props.maxRetries || 3;
      const retryStatus = this.getRetryStatus();
      const canManualRetry = this.state.retryCount < maxRetries && !this.state.isRetrying;

      return (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            
            <CardTitle className="text-lg text-orange-700">
              {operationName} Failed
            </CardTitle>
            
            <div className="flex justify-center gap-2 mt-3">
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
              
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  retryStatus.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                  retryStatus.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                  retryStatus.color === 'green' ? 'border-green-200 bg-green-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                {retryStatus.status === 'retrying' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {retryStatus.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                {retryStatus.status === 'available' && <RefreshCw className="w-3 h-3 mr-1" />}
                {retryStatus.status === 'exhausted' && <XCircle className="w-3 h-3 mr-1" />}
                {retryStatus.message}
              </Badge>

              {this.state.eventId && (
                <Badge variant="outline" className="text-xs">
                  ID: {this.state.eventId.slice(0, 6)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress bar for auto-retry */}
            {this.props.showProgress && this.retryTimeoutId && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Auto-retry progress</span>
                  <span>{Math.round(this.state.retryProgress)}%</span>
                </div>
                <Progress value={this.state.retryProgress} className="h-2" />
              </div>
            )}

            {/* Error message */}
            <Alert>
              <AlertDescription className="text-sm">
                {this.state.error?.message || 'An unexpected error occurred during the operation.'}
                {!this.state.isOnline && (
                  <div className="mt-2 text-xs text-yellow-700">
                    You appear to be offline. The operation will retry automatically when connection is restored.
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {canManualRetry && (
                <Button
                  onClick={this.handleManualRetry}
                  disabled={this.state.isRetrying || !this.state.isOnline}
                  className="w-full"
                >
                  {this.state.isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Now ({maxRetries - this.state.retryCount} left)
                    </>
                  )}
                </Button>
              )}

              {this.state.retryCount >= maxRetries && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm">
                    Maximum retry attempts reached. Please try again later or contact support.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Retry history */}
            {this.state.retryCount > 0 && (
              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                Attempted {this.state.retryCount} time{this.state.retryCount !== 1 ? 's' : ''}
                {this.state.lastRetryTime && (
                  <div>Last attempt: {new Date(this.state.lastRetryTime).toLocaleTimeString()}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for async error handling with retry logic
export function useAsyncErrorHandler(operationName?: string) {
  const [state, setState] = React.useState({
    error: null as Error | null,
    isRetrying: false,
    retryCount: 0
  });

  const executeWithRetry = React.useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ) => {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        setState(prev => ({ ...prev, isRetrying: attempts > 0 }));
        const result = await operation();
        setState({ error: null, isRetrying: false, retryCount: attempts });
        return result;
      } catch (error) {
        attempts++;
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error : new Error('Unknown error'),
          retryCount: attempts,
          isRetrying: attempts < maxRetries
        }));
        
        if (attempts >= maxRetries) {
          // Report final failure to Sentry
          await sentryService.captureError(
            error instanceof Error ? error : new Error('Unknown error'),
            {
              tags: {
                source: 'async_error_handler',
                operation: operationName || 'unknown'
              },
              extra: {
                attempts,
                max_retries: maxRetries
              },
              level: 'error'
            }
          );
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempts - 1)));
      }
    }
  }, [operationName]);

  const clearError = React.useCallback(() => {
    setState({ error: null, isRetrying: false, retryCount: 0 });
  }, []);

  return {
    ...state,
    executeWithRetry,
    clearError,
    hasError: !!state.error
  };
}