import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rbacService, PermissionCheck } from '@/services/rbac/RBACService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission: string | PermissionCheck;
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  showFallback = true
}) => {
  const { user, organization, isDemo } = useAuth();
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    checkPermission();
  }, [permission, user, organization]);

  const checkPermission = async () => {
    if (!user || !organization) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    // In demo mode, allow most permissions except sensitive operations
    if (isDemo) {
      const permissionString = typeof permission === 'string' ? permission : `${permission.resource}.${permission.action}`;
      const restrictedInDemo = [
        'users.remove',
        'users.edit',
        'organization.billing',
        'admin.system'
      ];
      
      setHasPermission(!restrictedInDemo.includes(permissionString));
      setLoading(false);
      return;
    }

    try {
      const result = await rbacService.hasPermission(user.id, organization.id, permission);
      setHasPermission(result);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>;
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (!showFallback) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <Lock className="h-4 w-4" />
      <AlertDescription>
        You don't have permission to access this feature. Contact your administrator if you need access.
      </AlertDescription>
    </Alert>
  );
};

// Hook for permission checking
export const usePermission = (permission: string | PermissionCheck) => {
  const { user, organization, isDemo } = useAuth();
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    checkPermission();
  }, [permission, user, organization]);

  const checkPermission = async () => {
    if (!user || !organization) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    // In demo mode, allow most permissions except sensitive operations
    if (isDemo) {
      const permissionString = typeof permission === 'string' ? permission : `${permission.resource}.${permission.action}`;
      const restrictedInDemo = [
        'users.remove',
        'users.edit',
        'organization.billing',
        'admin.system'
      ];
      
      setHasPermission(!restrictedInDemo.includes(permissionString));
      setLoading(false);
      return;
    }

    try {
      const result = await rbacService.hasPermission(user.id, organization.id, permission);
      setHasPermission(result);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasPermission, loading, checkPermission };
};

// Higher-order component for permission protection
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: string | PermissionCheck,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <PermissionGuard permission={permission} fallback={fallback}>
      <Component {...props} ref={ref} />
    </PermissionGuard>
  ));
};