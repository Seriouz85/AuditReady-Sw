/**
 * Error Boundary System - Index
 * Consolidated exports for all error handling components and utilities
 */

// Main Error Boundaries
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary';
export { ApiErrorBoundary, withApiErrorBoundary, useApiErrorHandler } from './ApiErrorBoundary';
export { GlobalErrorBoundary } from './GlobalErrorBoundary';
export { 
  FeatureErrorBoundary, 
  withFeatureErrorBoundary,
  type FeatureType 
} from './FeatureErrorBoundary';
export { 
  ComponentErrorBoundary, 
  withComponentErrorBoundary,
  useComponentErrorHandler 
} from './ComponentErrorBoundary';
export { 
  AsyncErrorBoundary,
  useAsyncErrorHandler 
} from './AsyncErrorBoundary';

// Error Recovery System
export { 
  ErrorRecoveryProvider, 
  useErrorRecovery, 
  withErrorRecovery 
} from './ErrorRecoveryProvider';
export { 
  SessionRecovery,
  useSessionRecovery 
} from './recovery/SessionRecovery';

// Error Fallback Components
export {
  InlineErrorFallback,
  CardErrorFallback,
  PageErrorFallback,
  NetworkErrorFallback,
  FeatureUnavailableFallback
} from './recovery/ErrorFallback';

// Error Reporting Service
export { 
  errorReportingService,
  type ErrorReport,
  type ErrorMetrics,
  type UserErrorExperience
} from '../../services/error/ErrorReportingService';

// Enhanced Sentry Service
export { sentryService } from '../../services/monitoring/SentryService';

// Wrapped Components for Major Features
export {
  ComplianceWrapper,
  AdminWrapper,
  LMSWrapper,
  AssessmentWrapper,
  DocumentWrapper,
  ReportsWrapper,
  SuppliersWrapper,
  EditorWrapper,
  SettingsWrapper,
  DashboardWrapper,
  CriticalComponentWrapper,
  NonCriticalComponentWrapper,
  wrapComponent,
  withCompliance,
  withAdmin,
  withLMS,
  withAssessments,
  withDocuments,
  withReports,
  withSuppliers,
  withEditor,
  withSettings,
  withDashboard,
  withCriticalComponent,
  withNonCriticalComponent
} from './WrappedComponents';

// Testing Utilities (Development Only)
export {
  ErrorTrigger,
  ErrorBoundaryTestPanel,
  useErrorTesting
} from './testing/ErrorTestingUtils';

// Utility Types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorContext {
  component?: string;
  feature?: string;
  user_id?: string;
  organization_id?: string;
  action?: string;
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error Types
export enum ErrorType {
  JAVASCRIPT = 'javascript',
  API = 'api',
  NETWORK = 'network',
  USER = 'user',
  BOUNDARY = 'boundary'
}

// Utility Functions
export const createErrorReport = (
  error: Error,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
) => {
  return errorReportingService.reportError(error, context, { severity });
};

export const withGlobalErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  context: string = 'unknown'
) => {
  return withErrorBoundary(Component, context);
};

export const withFeatureErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureType,
  options: {
    allowRetry?: boolean;
    showFallbackContent?: boolean;
    fallbackMessage?: string;
  } = {}
) => {
  return withFeatureErrorBoundary(Component, feature, options);
};

export const withComponentErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    isolate?: boolean;
    showMinimal?: boolean;
    allowHide?: boolean;
    retryable?: boolean;
  } = {}
) => {
  return withComponentErrorBoundary(Component, options);
};