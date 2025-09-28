/**
 * Error Testing Utilities
 * Development tools for testing error boundaries and recovery mechanisms
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Zap, 
  Network,
  Database,
  AlertTriangle,
  RefreshCw,
  Clock,
  Target
} from 'lucide-react';
import { errorReportingService } from '@/services/error/ErrorReportingService';
import { useErrorRecovery } from '../ErrorRecoveryProvider';

// Component that throws errors for testing
export function ErrorTrigger({ 
  errorType = 'javascript',
  delay = 0,
  message = 'Test error triggered',
  shouldThrow = false 
}: {
  errorType?: 'javascript' | 'api' | 'network' | 'async' | 'memory';
  delay?: number;
  message?: string;
  shouldThrow?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (shouldThrow) {
      if (delay > 0) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          triggerError();
        }, delay);
      } else {
        triggerError();
      }
    }
  }, [shouldThrow, delay, errorType, message]);

  const triggerError = () => {
    switch (errorType) {
      case 'javascript':
        throw new Error(message);
      
      case 'api':
        const apiError = new Error(`API Error: ${message}`);
        (apiError as any).apiError = {
          code: 'INTERNAL_ERROR',
          message,
          details: { status: 500 },
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id'
        };
        throw apiError;
      
      case 'network':
        throw new Error(`Network Error: ${message}`);
      
      case 'async':
        Promise.reject(new Error(`Async Error: ${message}`));
        break;
      
      case 'memory':
        // Simulate memory error
        const largeArray = [];
        try {
          for (let i = 0; i < 10000000; i++) {
            largeArray.push(new Array(1000).fill('memory test'));
          }
        } catch (error) {
          throw new Error(`Memory Error: ${message}`);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Error triggering in {delay}ms...
      </div>
    );
  }

  return <div>Error component loaded</div>;
}

// Test panel for error boundaries
export function ErrorBoundaryTestPanel() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    error?: string;
    timestamp?: string;
  }>>([]);
  
  const { reportError, isOnline, errorCount } = useErrorRecovery();

  const runTest = async (testName: string, testFn: () => Promise<void> | void) => {
    setTestResults(prev => [...prev, { test: testName, status: 'running' }]);
    
    try {
      await testFn();
      setTestResults(prev => prev.map(result => 
        result.test === testName 
          ? { ...result, status: 'passed', timestamp: new Date().toISOString() }
          : result
      ));
    } catch (error) {
      setTestResults(prev => prev.map(result => 
        result.test === testName 
          ? { 
              ...result, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          : result
      ));
    }
  };

  const tests = [
    {
      name: 'Error Reporting Service',
      fn: async () => {
        await errorReportingService.reportError(
          new Error('Test error for reporting service'),
          { component: 'error_test_panel', feature: 'testing' },
          { test_case: 'error_reporting_service' }
        );
      }
    },
    {
      name: 'Network Error Simulation',
      fn: async () => {
        const networkError = new Error('Network request failed');
        await reportError(networkError, 'network_test', { 
          test_case: 'network_error_simulation',
          simulated_network_failure: true
        });
      }
    },
    {
      name: 'API Error Simulation',
      fn: async () => {
        const apiError = new Error('API endpoint returned 500');
        (apiError as any).apiError = {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { status: 500, endpoint: '/test/api' },
          timestamp: new Date().toISOString(),
          requestId: 'test-api-request'
        };
        await reportError(apiError, 'api_test', { 
          test_case: 'api_error_simulation'
        });
      }
    },
    {
      name: 'Session Recovery',
      fn: async () => {
        // Test session data saving
        localStorage.setItem('test_recovery_session', JSON.stringify({
          id: 'test-session',
          timestamp: new Date().toISOString(),
          route: '/test',
          formData: { field1: 'test', field2: 'data' },
          errorContext: {
            error: 'Test session recovery',
            component: 'test_component'
          }
        }));
        
        // Verify it was saved
        const saved = localStorage.getItem('test_recovery_session');
        if (!saved) throw new Error('Session data not saved');
        
        // Clean up
        localStorage.removeItem('test_recovery_session');
      }
    },
    {
      name: 'Error Metrics Collection',
      fn: async () => {
        // Generate some test errors
        for (let i = 0; i < 3; i++) {
          await errorReportingService.reportError(
            new Error(`Test error ${i + 1}`),
            { component: 'test_metrics', feature: 'testing' },
            { test_iteration: i + 1 }
          );
        }
        
        // Check metrics
        const metrics = errorReportingService.getErrorMetrics('1h');
        if (metrics.total_errors === 0) {
          throw new Error('No errors recorded in metrics');
        }
      }
    }
  ];

  const runAllTests = async () => {
    setTestResults([]);
    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, color: 'gray' },
      running: { variant: 'default' as const, color: 'blue' },
      passed: { variant: 'default' as const, color: 'green' },
      failed: { variant: 'destructive' as const, color: 'red' }
    };
    
    return variants[status as keyof typeof variants] || variants.pending;
  };

  if (import.meta.env.PROD) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Development Tool</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Error testing utilities are only available in development mode.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bug className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Error Boundary Test Panel</CardTitle>
            <p className="text-sm text-gray-600">
              Test error boundaries, recovery mechanisms, and reporting systems
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant={isOnline ? "default" : "destructive"}>
              <Network className="w-3 h-3 mr-1" />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="outline">
              <Target className="w-3 h-3 mr-1" />
              Errors: {errorCount}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex gap-3">
          <Button onClick={runAllTests} className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Run All Tests
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        {/* Individual Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{test.name}</h4>
                  <Button
                    onClick={() => runTest(test.name, test.fn)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Run Test
                  </Button>
                </div>
                
                {testResults.find(r => r.test === test.name) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge {...getStatusBadge(testResults.find(r => r.test === test.name)?.status || 'pending')}>
                        {testResults.find(r => r.test === test.name)?.status}
                      </Badge>
                      {testResults.find(r => r.test === test.name)?.timestamp && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(testResults.find(r => r.test === test.name)!.timestamp!).toLocaleTimeString()}
                        </Badge>
                      )}
                    </div>
                    
                    {testResults.find(r => r.test === test.name)?.error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700 text-xs">
                          {testResults.find(r => r.test === test.name)?.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Trigger Components */}
        <div className="border-t pt-6">
          <h3 className="text-md font-medium mb-4">Error Trigger Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-orange-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">JavaScript Error</h4>
                <ErrorTrigger
                  errorType="javascript"
                  message="Intentional JavaScript error for testing"
                  shouldThrow={false}
                />
              </CardContent>
            </Card>
            
            <Card className="border border-red-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">API Error</h4>
                <ErrorTrigger
                  errorType="api"
                  message="Intentional API error for testing"
                  shouldThrow={false}
                />
              </CardContent>
            </Card>
            
            <Card className="border border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Network Error</h4>
                <ErrorTrigger
                  errorType="network"
                  message="Intentional network error for testing"
                  shouldThrow={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-md font-medium mb-4">Test Results Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-800">
                  {testResults.length}
                </div>
                <div className="text-xs text-gray-600">Total Tests</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-800">
                  {testResults.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-xs text-green-600">Passed</div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-800">
                  {testResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-800">
                  {testResults.filter(r => r.status === 'running').length}
                </div>
                <div className="text-xs text-blue-600">Running</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for testing error boundaries in development
export function useErrorTesting() {
  const triggerError = React.useCallback((
    type: 'javascript' | 'api' | 'network' | 'async' = 'javascript',
    message: string = 'Test error'
  ) => {
    if (import.meta.env.PROD) {
      console.warn('Error testing is disabled in production');
      return;
    }

    switch (type) {
      case 'javascript':
        throw new Error(message);
      case 'api':
        const apiError = new Error(message);
        (apiError as any).apiError = {
          code: 'TEST_ERROR',
          message,
          details: { test: true },
          timestamp: new Date().toISOString(),
          requestId: 'test-request'
        };
        throw apiError;
      case 'network':
        throw new Error(`Network Error: ${message}`);
      case 'async':
        setTimeout(() => {
          throw new Error(`Async Error: ${message}`);
        }, 100);
        break;
    }
  }, []);

  return {
    triggerError,
    isTestingEnabled: !import.meta.env.PROD
  };
}