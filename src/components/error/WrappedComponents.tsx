/**
 * Wrapped Components with Error Boundaries
 * Pre-configured components with appropriate error boundaries for major features
 */

import React, { Suspense } from 'react';
import { 
  FeatureErrorBoundary, 
  ComponentErrorBoundary,
  AsyncErrorBoundary,
  type FeatureType 
} from './index';
import { PageLoading } from '@/components/loading/LoadingStates';

// Higher-order component factory for feature wrapping
function createFeatureWrapper<P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureType,
  options: {
    allowRetry?: boolean;
    showFallbackContent?: boolean;
    fallbackMessage?: string;
    enableAsync?: boolean;
    asyncOperationName?: string;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    const content = (
      <FeatureErrorBoundary
        feature={feature}
        allowRetry={options.allowRetry !== false}
        showFallbackContent={options.showFallbackContent}
        fallbackMessage={options.fallbackMessage}
      >
        {options.enableAsync ? (
          <AsyncErrorBoundary
            operationName={options.asyncOperationName || `${feature}_async_operation`}
            autoRetry={true}
            maxRetries={3}
            showProgress={true}
          >
            <Component {...props} />
          </AsyncErrorBoundary>
        ) : (
          <Component {...props} />
        )}
      </FeatureErrorBoundary>
    );

    return (
      <Suspense fallback={<PageLoading title={`Loading ${feature}...`} />}>
        {content}
      </Suspense>
    );
  };

  WrappedComponent.displayName = `FeatureWrapped(${feature})(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Compliance Module Wrappers
export const ComplianceWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'compliance', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'compliance_data_processing',
    fallbackMessage: 'Compliance features are temporarily unavailable. Other modules remain accessible.'
  });

// Admin Module Wrappers
export const AdminWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'admin', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'admin_operations',
    fallbackMessage: 'Admin panel features are temporarily unavailable. Contact system administrator if issues persist.'
  });

// LMS Module Wrappers  
export const LMSWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'lms', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'lms_content_loading',
    fallbackMessage: 'Learning management features are temporarily unavailable. Try refreshing or contact support.'
  });

// Assessment Module Wrappers
export const AssessmentWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'assessments', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'assessment_processing',
    fallbackMessage: 'Assessment features are temporarily unavailable. Your progress has been saved.'
  });

// Document Module Wrappers
export const DocumentWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'documents', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'document_processing',
    fallbackMessage: 'Document management is temporarily unavailable. Files remain secure and accessible via alternative methods.'
  });

// Reports Module Wrappers
export const ReportsWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'reports', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'report_generation',
    fallbackMessage: 'Report generation is temporarily unavailable. Scheduled reports will continue to run normally.'
  });

// Suppliers Module Wrappers
export const SuppliersWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'suppliers', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'supplier_data_sync',
    fallbackMessage: 'Supplier management features are temporarily unavailable. Data remains synchronized.'
  });

// Editor Module Wrappers
export const EditorWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'editor', {
    allowRetry: true,
    enableAsync: true,
    asyncOperationName: 'editor_operations',
    fallbackMessage: 'Editor features are temporarily unavailable. Your work is automatically saved.'
  });

// Settings Module Wrappers
export const SettingsWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'settings', {
    allowRetry: true,
    enableAsync: false, // Settings usually don't need async handling
    fallbackMessage: 'Settings panel is temporarily unavailable. Current configurations remain active.'
  });

// Dashboard Module Wrappers
export const DashboardWrapper = <P extends object>(Component: React.ComponentType<P>) => 
  createFeatureWrapper(Component, 'dashboard', {
    allowRetry: true,
    showFallbackContent: true, // Show fallback widgets instead of full error
    enableAsync: true,
    asyncOperationName: 'dashboard_data_loading',
    fallbackMessage: 'Some dashboard widgets may not display correctly. Data is being synchronized.'
  });

// Critical Component Wrapper (for essential UI components)
export const CriticalComponentWrapper = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary
      componentName={componentName || Component.displayName || Component.name}
      isolate={false} // Let critical errors bubble up
      retryable={true}
      showMinimal={false}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `CriticalWrapped(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Non-Critical Component Wrapper (for optional UI components)
export const NonCriticalComponentWrapper = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary
      componentName={componentName || Component.displayName || Component.name}
      isolate={true} // Contain errors to this component
      retryable={true}
      showMinimal={true}
      allowHide={true}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `NonCriticalWrapped(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Utility function to determine wrapper type based on component importance
export function wrapComponent<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    feature?: FeatureType;
    critical?: boolean;
    componentName?: string;
    enableAsync?: boolean;
    asyncOperationName?: string;
  }
) {
  const { feature, critical = false, componentName, enableAsync = false, asyncOperationName } = options;

  if (feature) {
    // Feature-level wrapping
    return createFeatureWrapper(Component, feature, {
      enableAsync,
      asyncOperationName
    });
  } else if (critical) {
    // Critical component wrapping
    return CriticalComponentWrapper(Component, componentName);
  } else {
    // Non-critical component wrapping
    return NonCriticalComponentWrapper(Component, componentName);
  }
}

// Pre-configured wrappers for common patterns
export const withCompliance = ComplianceWrapper;
export const withAdmin = AdminWrapper;
export const withLMS = LMSWrapper;
export const withAssessments = AssessmentWrapper;
export const withDocuments = DocumentWrapper;
export const withReports = ReportsWrapper;
export const withSuppliers = SuppliersWrapper;
export const withEditor = EditorWrapper;
export const withSettings = SettingsWrapper;
export const withDashboard = DashboardWrapper;
export const withCriticalComponent = CriticalComponentWrapper;
export const withNonCriticalComponent = NonCriticalComponentWrapper;