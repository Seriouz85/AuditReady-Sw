/**
 * Error Fallback Components
 * Reusable fallback UI components for different error scenarios
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Settings,
  Wifi,
  WifiOff,
  Bug,
  Download,
  FileText,
  HelpCircle
} from 'lucide-react';

interface BaseErrorFallbackProps {
  error?: Error;
  errorId?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  canRetry?: boolean;
  isRetrying?: boolean;
  className?: string;
}

// Minimal inline error fallback
export function InlineErrorFallback({ 
  error, 
  onRetry, 
  canRetry = true,
  isRetrying = false,
  className = ""
}: BaseErrorFallbackProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 ${className}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>Error loading content</span>
      {canRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="ghost"
          disabled={isRetrying}
          className="h-6 px-2 text-xs hover:bg-red-100"
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}

// Card-based error fallback
export function CardErrorFallback({ 
  error, 
  errorId,
  onRetry, 
  onGoBack,
  canRetry = true,
  isRetrying = false,
  className = ""
}: BaseErrorFallbackProps) {
  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-sm text-red-800">Error</CardTitle>
            {errorId && (
              <Badge variant="outline" className="text-xs mt-1">
                ID: {errorId.slice(0, 8)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-red-700">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        
        <div className="flex gap-2">
          {canRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              disabled={isRetrying}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
          
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Full-page error fallback
export function PageErrorFallback({ 
  error, 
  errorId,
  onRetry, 
  onGoHome,
  canRetry = true,
  isRetrying = false,
  className = ""
}: BaseErrorFallbackProps) {
  const handleReportBug = () => {
    const bugReport = {
      errorId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      } : null,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const emailBody = encodeURIComponent(
      `Error Report\n\n${JSON.stringify(bugReport, null, 2)}`
    );
    
    window.open(`mailto:support@auditready.com?subject=Error Report&body=${emailBody}`);
  };

  const handleDownloadReport = () => {
    const report = {
      errorId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
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

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-700">
            Something went wrong
          </CardTitle>
          {errorId && (
            <div className="mt-3">
              <Badge variant="outline" className="text-xs">
                Error ID: {errorId}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              {error?.message || 'An unexpected error occurred while loading this page.'}
            </AlertDescription>
          </Alert>

          {/* Development error details */}
          {import.meta.env.DEV && error && (
            <Alert className="border-orange-200 bg-orange-50">
              <Bug className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Development Details</AlertTitle>
              <AlertDescription className="text-orange-700">
                <div className="font-mono text-xs mt-2 max-h-32 overflow-auto bg-white p-2 rounded border">
                  <div className="font-bold">{error.name}: {error.message}</div>
                  {error.stack && (
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {canRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}

            <Button
              onClick={onGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            <Button
              onClick={handleReportBug}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>

            <Button
              onClick={handleDownloadReport}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2">
            If this problem persists, please contact our support team.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Network-aware error fallback
export function NetworkErrorFallback({ 
  error, 
  errorId,
  onRetry, 
  onGoBack,
  canRetry = true,
  isRetrying = false,
  className = ""
}: BaseErrorFallbackProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

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

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-orange-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-600" />
            )}
          </div>
          <div>
            <CardTitle className="text-sm text-orange-800">
              {isOnline ? 'Network Error' : 'No Internet Connection'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? (
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
              {errorId && (
                <Badge variant="outline" className="text-xs">
                  ID: {errorId.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-orange-700">
          {isOnline 
            ? 'Unable to connect to the server. Please check your connection and try again.'
            : 'You appear to be offline. Please check your internet connection.'
          }
        </p>
        
        {!isOnline && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-700 text-xs">
              The application will automatically retry when your connection is restored.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2">
          {canRetry && isOnline && (
            <Button
              onClick={onRetry}
              size="sm"
              disabled={isRetrying || !isOnline}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
          
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Feature unavailable fallback
export function FeatureUnavailableFallback({ 
  title = "Feature Unavailable",
  description = "This feature is temporarily unavailable.",
  onGoBack,
  className = ""
}: {
  title?: string;
  description?: string;
  onGoBack?: () => void;
  className?: string;
}) {
  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg text-blue-800">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-blue-700">{description}</p>
        
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <HelpCircle className="w-3 h-3 mr-1" />
            Learn More
          </Button>
          
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}