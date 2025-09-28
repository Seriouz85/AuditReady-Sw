/**
 * Error Boundary Demo Component
 * Demonstrates the error boundary system in action
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FeatureErrorBoundary,
  ComponentErrorBoundary,
  AsyncErrorBoundary,
  SessionRecovery,
  ErrorBoundaryTestPanel,
  withCompliance,
  withAdmin
} from './index';
import { 
  Bug, 
  Zap, 
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

// Test component that can throw errors
function TestComponent({ shouldError = false, errorType = 'javascript' }: { 
  shouldError?: boolean; 
  errorType?: 'javascript' | 'async' | 'network';
}) {
  React.useEffect(() => {
    if (shouldError) {
      switch (errorType) {
        case 'javascript':
          throw new Error('Test JavaScript error from TestComponent');
        case 'async':
          setTimeout(() => {
            throw new Error('Test async error from TestComponent');
          }, 100);
          break;
        case 'network':
          // Simulate network error
          fetch('/non-existent-endpoint').catch(() => {
            throw new Error('Test network error from TestComponent');
          });
          break;
      }
    }
  }, [shouldError, errorType]);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-green-800">Component loaded successfully</span>
      </div>
    </div>
  );
}

// Wrapped test components
const ComplianceTestComponent = withCompliance(TestComponent);
const AdminTestComponent = withAdmin(TestComponent);

export function ErrorBoundaryDemo() {
  const [demoState, setDemoState] = useState({
    featureError: false,
    componentError: false,
    asyncError: false,
    showSessionRecovery: false,
    showTestPanel: false
  });

  const resetDemos = () => {
    setDemoState({
      featureError: false,
      componentError: false,
      asyncError: false,
      showSessionRecovery: false,
      showTestPanel: false
    });
  };

  if (import.meta.env.PROD) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Development Only</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Error boundary demo is only available in development mode.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Error Boundary & Recovery System Demo</CardTitle>
              <p className="text-sm text-gray-600">
                Interactive demonstration of error handling, boundaries, and recovery mechanisms
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline">Development Mode</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setDemoState(prev => ({ ...prev, featureError: !prev.featureError }))}
              variant={demoState.featureError ? "destructive" : "outline"}
              size="sm"
            >
              <Bug className="w-4 h-4 mr-2" />
              {demoState.featureError ? 'Stop' : 'Trigger'} Feature Error
            </Button>

            <Button
              onClick={() => setDemoState(prev => ({ ...prev, componentError: !prev.componentError }))}
              variant={demoState.componentError ? "destructive" : "outline"}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              {demoState.componentError ? 'Stop' : 'Trigger'} Component Error
            </Button>

            <Button
              onClick={() => setDemoState(prev => ({ ...prev, asyncError: !prev.asyncError }))}
              variant={demoState.asyncError ? "destructive" : "outline"}
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {demoState.asyncError ? 'Stop' : 'Trigger'} Async Error
            </Button>

            <Button
              onClick={() => setDemoState(prev => ({ ...prev, showSessionRecovery: !prev.showSessionRecovery }))}
              variant={demoState.showSessionRecovery ? "default" : "outline"}
              size="sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              {demoState.showSessionRecovery ? 'Hide' : 'Show'} Session Recovery
            </Button>

            <Button
              onClick={() => setDemoState(prev => ({ ...prev, showTestPanel: !prev.showTestPanel }))}
              variant={demoState.showTestPanel ? "default" : "outline"}
              size="sm"
            >
              <Bug className="w-4 h-4 mr-2" />
              {demoState.showTestPanel ? 'Hide' : 'Show'} Test Panel
            </Button>

            <Button onClick={resetDemos} variant="ghost" size="sm">
              Reset All
            </Button>
          </div>

          {/* Demo Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Error Boundary Demo */}
            <Card className="border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Feature Error Boundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeatureErrorBoundary 
                  feature="compliance"
                  allowRetry={true}
                  showFallbackContent={false}
                >
                  <ComplianceTestComponent 
                    shouldError={demoState.featureError}
                    errorType="javascript"
                  />
                </FeatureErrorBoundary>
              </CardContent>
            </Card>

            {/* Component Error Boundary Demo */}
            <Card className="border border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md flex items-center gap-2">
                  <Bug className="w-4 h-4 text-green-600" />
                  Component Error Boundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComponentErrorBoundary
                  componentName="DemoTestComponent"
                  isolate={true}
                  retryable={true}
                  showMinimal={false}
                >
                  <TestComponent 
                    shouldError={demoState.componentError}
                    errorType="javascript"
                  />
                </ComponentErrorBoundary>
              </CardContent>
            </Card>

            {/* Async Error Boundary Demo */}
            <Card className="border border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  Async Error Boundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AsyncErrorBoundary
                  operationName="demo_async_operation"
                  autoRetry={true}
                  maxRetries={2}
                  showProgress={true}
                >
                  <TestComponent 
                    shouldError={demoState.asyncError}
                    errorType="async"
                  />
                </AsyncErrorBoundary>
              </CardContent>
            </Card>

            {/* Admin Feature Demo */}
            <Card className="border border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Admin Feature Wrapper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTestComponent 
                  shouldError={false}  // Keep this one stable for comparison
                  errorType="javascript"
                />
              </CardContent>
            </Card>
          </div>

          {/* Session Recovery Demo */}
          {demoState.showSessionRecovery && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Session Recovery Demo</h3>
              <SessionRecovery
                onRestore={async (sessionData) => {
                  console.log('Restoring session:', sessionData);
                  // Simulate session restoration
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  alert(`Session restored: ${sessionData.route}`);
                }}
                onDiscard={() => {
                  console.log('Session discarded');
                }}
              />
            </div>
          )}

          {/* Test Panel */}
          {demoState.showTestPanel && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Comprehensive Test Panel</h3>
              <ErrorBoundaryTestPanel />
            </div>
          )}

          {/* Information */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Demo Information</AlertTitle>
            <AlertDescription>
              This demo showcases the error boundary system in development mode. 
              Error boundaries will gracefully handle errors and provide recovery options.
              In production, additional logging and user feedback mechanisms would be active.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}