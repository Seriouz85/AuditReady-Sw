import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { rbacGuards, Permission, UserContext, ResourceContext } from './RBACGuards';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface EnhancedPermissionGuardProps {
  children: React.ReactNode;
  permissions: Permission | Permission[];
  resource?: ResourceContext;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  showFallbackError?: boolean;
  onAccessDenied?: (reason?: string) => void;
  loadingComponent?: React.ReactNode;
}

export const EnhancedPermissionGuard: React.FC<EnhancedPermissionGuardProps> = ({
  children,
  permissions,
  resource,
  fallback = null,
  requireAll = false,
  showFallbackError = false,
  onAccessDenied,
  loadingComponent,
}) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessReason, setAccessReason] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setAccessReason('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const userContext: UserContext = {
          id: user.id,
          role: user.role,
          organizationId: user.organization_id,
          sessionId: user.session_id,
        };

        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        
        if (requireAll) {
          // Check all permissions
          const result = await rbacGuards.checkMultiplePermissions(userContext, requiredPermissions, resource);
          setHasAccess(result.granted);
          setAccessReason(result.reason);
        } else {
          // Check if user has any of the permissions
          let granted = false;
          let lastReason = '';
          
          for (const permission of requiredPermissions) {
            const result = await rbacGuards.checkAccess(userContext, permission, resource);
            if (result.granted) {
              granted = true;
              break;
            }
            lastReason = result.reason || 'Access denied';
          }
          
          setHasAccess(granted);
          setAccessReason(granted ? undefined : lastReason);
        }

        if (!hasAccess && onAccessDenied) {
          onAccessDenied(accessReason);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasAccess(false);
        setAccessReason('Permission check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, permissions, resource, requireAll, onAccessDenied, hasAccess, accessReason]);

  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  if (!hasAccess) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {accessReason || 'You do not have permission to access this resource.'}
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role-based guard component
interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
  showFallbackError?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback = null,
  requireAll = false,
  showFallbackError = false,
}) => {
  const { user } = useAuth();

  if (!user) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Authentication required to access this resource.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  const userContext: UserContext = {
    id: user.id,
    role: user.role,
    organizationId: user.organization_id,
  };

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const hasRole = rbacGuards.hasRole(userContext, requiredRoles as any);

  if (!hasRole) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your role does not have access to this resource. Required roles: {requiredRoles.join(', ')}
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Admin-only guard component
interface AdminGuardProps {
  children: React.ReactNode;
  level?: 'super' | 'org' | 'any';
  fallback?: React.ReactNode;
  showFallbackError?: boolean;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  level = 'any',
  fallback = null,
  showFallbackError = false,
}) => {
  const adminRoles = {
    super: ['super_admin'],
    org: ['super_admin', 'org_admin'],
    any: ['super_admin', 'org_admin'],
  };

  return (
    <RoleGuard
      roles={adminRoles[level]}
      fallback={fallback}
      showFallbackError={showFallbackError}
    >
      {children}
    </RoleGuard>
  );
};

// Conditional rendering based on resource ownership
interface OwnerGuardProps {
  children: React.ReactNode;
  resourceOwnerId?: string;
  allowAdmins?: boolean;
  fallback?: React.ReactNode;
  showFallbackError?: boolean;
}

export const OwnerGuard: React.FC<OwnerGuardProps> = ({
  children,
  resourceOwnerId,
  allowAdmins = true,
  fallback = null,
  showFallbackError = false,
}) => {
  const { user } = useAuth();

  if (!user) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Authentication required to access this resource.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  // Check if user is the owner
  const isOwner = user.id === resourceOwnerId;

  // Check if user is admin (if allowed)
  const isAdmin = allowAdmins && ['super_admin', 'org_admin'].includes(user.role);

  if (!isOwner && !isAdmin) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You can only access your own resources.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Organization-scoped guard
interface OrganizationGuardProps {
  children: React.ReactNode;
  organizationId?: string;
  allowCrossOrg?: boolean;
  fallback?: React.ReactNode;
  showFallbackError?: boolean;
}

export const OrganizationGuard: React.FC<OrganizationGuardProps> = ({
  children,
  organizationId,
  allowCrossOrg = false,
  fallback = null,
  showFallbackError = false,
}) => {
  const { user } = useAuth();

  if (!user) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Authentication required to access this resource.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  // Super admins can access any organization
  if (user.role === 'super_admin' && allowCrossOrg) {
    return <>{children}</>;
  }

  // Check organization match
  if (organizationId && organizationId !== user.organization_id) {
    if (showFallbackError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You can only access resources from your organization.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Security-aware button component
interface SecureButtonProps {
  permission: Permission;
  resource?: ResourceContext;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export const SecureButton: React.FC<SecureButtonProps> = ({
  permission,
  resource,
  onClick,
  children,
  className = '',
  variant = 'default',
  disabled = false,
}) => {
  return (
    <EnhancedPermissionGuard
      permissions={permission}
      resource={resource}
      fallback={
        <button
          className={`${className} opacity-50 cursor-not-allowed`}
          disabled={true}
          title="You don't have permission to perform this action"
        >
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </button>
      }
    >
      <button
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </EnhancedPermissionGuard>
  );
};

// React Hook for permission checking with enhanced features
export const useEnhancedPermissions = (user: UserContext) => {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const checkPermission = async (permission: Permission, resource?: ResourceContext, useCache = true) => {
    const cacheKey = `${permission}-${JSON.stringify(resource)}`;
    
    // Check cache first
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }
    }

    setLoading(true);
    try {
      const result = await rbacGuards.checkAccess(user, permission, resource);
      
      // Update cache
      const newCache = new Map(cache);
      newCache.set(cacheKey, { result: result.granted, timestamp: Date.now() });
      setCache(newCache);
      
      return result.granted;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: string | string[]) => {
    return rbacGuards.hasRole(user, roles as any);
  };

  const clearCache = () => {
    setCache(new Map());
  };

  const getUserPermissions = async () => {
    return await rbacGuards.getUserPermissions(user);
  };

  return {
    checkPermission,
    hasRole,
    getUserPermissions,
    clearCache,
    loading,
  };
};