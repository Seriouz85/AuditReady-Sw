/**
 * Error Recovery Provider
 * Provides error recovery context and utilities across the application
 */

import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { sentryService } from '@/services/monitoring/SentryService';

interface ErrorRecoveryContextType {
  // Error reporting
  reportError: (error: Error, context?: string, metadata?: Record<string, any>) => Promise<string | null>;
  
  // Session recovery
  saveRecoveryData: (key: string, data: any) => void;
  getRecoveryData: (key: string) => any;
  clearRecoveryData: (key?: string) => void;
  
  // Network connectivity
  isOnline: boolean;
  lastError: Error | null;
  errorCount: number;
  
  // Retry mechanisms
  retryAction: (action: () => Promise<void>, maxRetries?: number) => Promise<boolean>;
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextType | null>(null);

interface ErrorRecoveryProviderProps {
  children: ReactNode;
}

export function ErrorRecoveryProvider({ children }: ErrorRecoveryProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  // Monitor network connectivity
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reportError = useCallback(async (
    error: Error, 
    context?: string, 
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    console.error(`[ErrorRecovery] ${context || 'Unknown'}:`, error);
    
    setLastError(error);
    setErrorCount(prev => prev + 1);

    // Store error for offline reporting
    if (!isOnline) {
      const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
      offlineErrors.push({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context,
        metadata,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('offline_errors', JSON.stringify(offlineErrors));
      return null;
    }

    // Report to Sentry
    try {
      const eventId = await sentryService.captureError(error, {
        tags: {
          source: 'error_recovery_provider',
          context: context || 'unknown'
        },
        extra: {
          ...metadata,
          error_count: errorCount,
          is_online: isOnline,
          user_agent: navigator.userAgent,
          url: window.location.href
        },
        level: 'error'
      });

      return eventId;
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
      return null;
    }
  }, [isOnline, errorCount]);

  const saveRecoveryData = useCallback((key: string, data: any) => {
    try {
      const recoveryData = JSON.parse(localStorage.getItem('recovery_data') || '{}');
      recoveryData[key] = {
        data,
        timestamp: new Date().toISOString(),
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      localStorage.setItem('recovery_data', JSON.stringify(recoveryData));
    } catch (error) {
      console.error('Failed to save recovery data:', error);
    }
  }, []);

  const getRecoveryData = useCallback((key: string) => {
    try {
      const recoveryData = JSON.parse(localStorage.getItem('recovery_data') || '{}');
      const item = recoveryData[key];
      
      if (!item) return null;
      
      // Check expiry
      if (new Date() > new Date(item.expiry)) {
        delete recoveryData[key];
        localStorage.setItem('recovery_data', JSON.stringify(recoveryData));
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Failed to get recovery data:', error);
      return null;
    }
  }, []);

  const clearRecoveryData = useCallback((key?: string) => {
    try {
      if (key) {
        const recoveryData = JSON.parse(localStorage.getItem('recovery_data') || '{}');
        delete recoveryData[key];
        localStorage.setItem('recovery_data', JSON.stringify(recoveryData));
      } else {
        localStorage.removeItem('recovery_data');
      }
    } catch (error) {
      console.error('Failed to clear recovery data:', error);
    }
  }, []);

  const retryAction = useCallback(async (
    action: () => Promise<void>, 
    maxRetries: number = 3
  ): Promise<boolean> => {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await action();
        return true;
      } catch (error) {
        attempts++;
        
        if (attempts >= maxRetries) {
          await reportError(
            error instanceof Error ? error : new Error('Unknown error'),
            'retry_action_failed',
            { attempts, max_retries: maxRetries }
          );
          return false;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }, [reportError]);

  // Report offline errors when coming back online
  React.useEffect(() => {
    if (isOnline) {
      const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
      if (offlineErrors.length > 0) {
        offlineErrors.forEach(async (errorData: any) => {
          try {
            const error = new Error(errorData.error.message);
            error.stack = errorData.error.stack;
            error.name = errorData.error.name;
            
            await sentryService.captureError(error, {
              tags: {
                source: 'offline_error_replay',
                context: errorData.context || 'unknown'
              },
              extra: {
                ...errorData.metadata,
                offline_timestamp: errorData.timestamp,
                replay_timestamp: new Date().toISOString()
              },
              level: 'error'
            });
          } catch (replayError) {
            console.error('Failed to replay offline error:', replayError);
          }
        });
        
        localStorage.removeItem('offline_errors');
      }
    }
  }, [isOnline]);

  const contextValue: ErrorRecoveryContextType = {
    reportError,
    saveRecoveryData,
    getRecoveryData,
    clearRecoveryData,
    isOnline,
    lastError,
    errorCount,
    retryAction
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

export function useErrorRecovery() {
  const context = useContext(ErrorRecoveryContext);
  if (!context) {
    throw new Error('useErrorRecovery must be used within an ErrorRecoveryProvider');
  }
  return context;
}

// Higher-order component for adding error recovery to components
export function withErrorRecovery<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { reportError } = useErrorRecovery();

    const handleError = useCallback((error: Error) => {
      reportError(error, `component_error_${componentName || Component.name}`, {
        component: componentName || Component.name,
        props: Object.keys(props as object)
      });
    }, [reportError, props]);

    // Add error handling to component
    React.useEffect(() => {
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0] instanceof Error) {
          handleError(args[0]);
        }
        originalError(...args);
      };

      return () => {
        console.error = originalError;
      };
    }, [handleError]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withErrorRecovery(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}