import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireOrganization?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireOrganization = true
}) => {
  const { user, organization, loading, hasPermission, isDemo, isPlatformAdmin } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    user: !!user, 
    organization: !!organization, 
    loading, 
    isDemo, 
    isPlatformAdmin, 
    requireOrganization,
    path: location.pathname 
  });

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For demo users, skip organization requirement
  if (isDemo) {
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">This feature is not available in demo mode.</p>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Platform admins bypass organization requirement
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Redirect to onboarding if user has no organization (but NOT for demo users or platform admins)
  if (requireOrganization && !organization && !isDemo && !isPlatformAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Higher-order component for easier route protection
export const withAuth = (
  Component: React.ComponentType<any>,
  requiredPermission?: string,
  requireOrganization?: boolean
) => {
  return (props: any) => (
    <ProtectedRoute 
      requiredPermission={requiredPermission}
      requireOrganization={requireOrganization}
    >
      <Component {...props} />
    </ProtectedRoute>
  );
};