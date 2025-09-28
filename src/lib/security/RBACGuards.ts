import { supabase } from '../supabase';
import { securityService } from './SecurityService';

export type Role = 'super_admin' | 'org_admin' | 'compliance_manager' | 'auditor' | 'user';

export type Permission = 
  | 'organization:create' | 'organization:read' | 'organization:update' | 'organization:delete'
  | 'user:create' | 'user:read' | 'user:update' | 'user:delete' | 'user:invite'
  | 'assessment:create' | 'assessment:read' | 'assessment:update' | 'assessment:delete'
  | 'requirement:create' | 'requirement:read' | 'requirement:update' | 'requirement:delete'
  | 'document:create' | 'document:read' | 'document:update' | 'document:delete'
  | 'framework:create' | 'framework:read' | 'framework:update' | 'framework:delete'
  | 'report:create' | 'report:read' | 'report:export'
  | 'risk:create' | 'risk:read' | 'risk:update' | 'risk:delete'
  | 'audit:read' | 'audit:export'
  | 'settings:read' | 'settings:update'
  | 'billing:read' | 'billing:update'
  | 'admin:system' | 'admin:users' | 'admin:organizations'
  | 'own:read' | 'own:update';

export interface UserContext {
  id: string;
  role: Role;
  organizationId: string;
  permissions?: Permission[];
  sessionId?: string;
}

export interface ResourceContext {
  type: string;
  id?: string;
  organizationId?: string;
  ownerId?: string;
  metadata?: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
  requiredPermissions?: Permission[];
  missingPermissions?: Permission[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Role-Based Access Control Guards
 * Implements comprehensive permission checking and audit logging
 */
export class RBACGuards {
  private static instance: RBACGuards;
  private roleHierarchy: Record<Role, Role[]> = {
    'super_admin': ['org_admin', 'compliance_manager', 'auditor', 'user'],
    'org_admin': ['compliance_manager', 'auditor', 'user'],
    'compliance_manager': ['auditor', 'user'],
    'auditor': ['user'],
    'user': [],
  };

  private rolePermissions: Record<Role, Permission[]> = {
    'super_admin': [
      'organization:create', 'organization:read', 'organization:update', 'organization:delete',
      'user:create', 'user:read', 'user:update', 'user:delete', 'user:invite',
      'assessment:create', 'assessment:read', 'assessment:update', 'assessment:delete',
      'requirement:create', 'requirement:read', 'requirement:update', 'requirement:delete',
      'document:create', 'document:read', 'document:update', 'document:delete',
      'framework:create', 'framework:read', 'framework:update', 'framework:delete',
      'report:create', 'report:read', 'report:export',
      'risk:create', 'risk:read', 'risk:update', 'risk:delete',
      'audit:read', 'audit:export',
      'settings:read', 'settings:update',
      'billing:read', 'billing:update',
      'admin:system', 'admin:users', 'admin:organizations',
      'own:read', 'own:update',
    ],
    'org_admin': [
      'organization:read', 'organization:update',
      'user:create', 'user:read', 'user:update', 'user:invite',
      'assessment:create', 'assessment:read', 'assessment:update', 'assessment:delete',
      'requirement:create', 'requirement:read', 'requirement:update', 'requirement:delete',
      'document:create', 'document:read', 'document:update', 'document:delete',
      'framework:read', 'framework:update',
      'report:create', 'report:read', 'report:export',
      'risk:create', 'risk:read', 'risk:update', 'risk:delete',
      'audit:read',
      'settings:read', 'settings:update',
      'billing:read', 'billing:update',
      'admin:users',
      'own:read', 'own:update',
    ],
    'compliance_manager': [
      'assessment:create', 'assessment:read', 'assessment:update', 'assessment:delete',
      'requirement:create', 'requirement:read', 'requirement:update', 'requirement:delete',
      'document:create', 'document:read', 'document:update', 'document:delete',
      'framework:read',
      'report:create', 'report:read', 'report:export',
      'risk:create', 'risk:read', 'risk:update', 'risk:delete',
      'own:read', 'own:update',
    ],
    'auditor': [
      'assessment:read',
      'requirement:read',
      'document:read',
      'framework:read',
      'report:read', 'report:export',
      'risk:read',
      'own:read', 'own:update',
    ],
    'user': [
      'assessment:read',
      'requirement:read',
      'document:read',
      'framework:read',
      'own:read', 'own:update',
    ],
  };

  private constructor() {}

  public static getInstance(): RBACGuards {
    if (!RBACGuards.instance) {
      RBACGuards.instance = new RBACGuards();
    }
    return RBACGuards.instance;
  }

  /**
   * Check if user has permission to access a resource
   */
  public async checkAccess(
    user: UserContext,
    permission: Permission,
    resource?: ResourceContext
  ): Promise<AccessResult> {
    try {
      // Get user's effective permissions
      const userPermissions = await this.getUserPermissions(user);

      // Check basic permission
      if (!userPermissions.includes(permission)) {
        // Check if it's an 'own' resource permission
        if (permission.startsWith('own:') && resource?.ownerId === user.id) {
          const ownPermission = permission as Permission;
          if (userPermissions.includes(ownPermission)) {
            return await this.logAccessDecision(user, permission, resource, true, 'own_resource');
          }
        }

        return await this.logAccessDecision(
          user, 
          permission, 
          resource, 
          false, 
          'insufficient_permissions',
          [permission],
          [permission]
        );
      }

      // Check organization context
      if (resource?.organizationId && resource.organizationId !== user.organizationId) {
        // Super admins can access cross-organization resources
        if (user.role !== 'super_admin') {
          return await this.logAccessDecision(
            user, 
            permission, 
            resource, 
            false, 
            'cross_organization_access_denied'
          );
        }
      }

      // Additional security checks based on resource type
      const resourceCheck = await this.checkResourceSpecificRules(user, permission, resource);
      if (!resourceCheck.granted) {
        return resourceCheck;
      }

      // Access granted
      return await this.logAccessDecision(user, permission, resource, true);

    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'authorization_failure',
        userId: user.id,
        details: {
          error: error.message,
          permission,
          resource: resource?.type,
          resourceId: resource?.id,
        },
        timestamp: new Date(),
        severity: 'high',
      });

      return {
        granted: false,
        reason: 'Authorization system error',
        riskLevel: 'high',
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  public async checkMultiplePermissions(
    user: UserContext,
    permissions: Permission[],
    resource?: ResourceContext
  ): Promise<AccessResult> {
    const missingPermissions: Permission[] = [];
    
    for (const permission of permissions) {
      const result = await this.checkAccess(user, permission, resource);
      if (!result.granted) {
        missingPermissions.push(permission);
      }
    }

    if (missingPermissions.length > 0) {
      return await this.logAccessDecision(
        user,
        permissions[0], // Log first permission for context
        resource,
        false,
        'multiple_permissions_missing',
        permissions,
        missingPermissions
      );
    }

    return { granted: true };
  }

  /**
   * Get all permissions for a user based on role and custom permissions
   */
  public async getUserPermissions(user: UserContext): Promise<Permission[]> {
    // Start with role-based permissions
    let permissions = [...this.rolePermissions[user.role]];

    // Add inherited permissions from role hierarchy
    const inheritedRoles = this.roleHierarchy[user.role];
    for (const inheritedRole of inheritedRoles) {
      permissions.push(...this.rolePermissions[inheritedRole]);
    }

    // Add custom permissions from database
    if (user.permissions) {
      permissions.push(...user.permissions);
    } else {
      // Fetch custom permissions from database
      const { data: customPermissions } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.id);

      if (customPermissions) {
        permissions.push(...customPermissions.map(p => p.permission as Permission));
      }
    }

    // Remove duplicates and return
    return [...new Set(permissions)];
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasRole(user: UserContext, roles: Role | Role[]): boolean {
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    
    // Check direct role match
    if (rolesToCheck.includes(user.role)) {
      return true;
    }

    // Check inherited roles
    const userInheritedRoles = this.roleHierarchy[user.role];
    return rolesToCheck.some(role => userInheritedRoles.includes(role));
  }

  /**
   * Check if user can impersonate another user
   */
  public async canImpersonate(impersonator: UserContext, targetUserId: string): Promise<AccessResult> {
    // Only super admins can impersonate
    if (impersonator.role !== 'super_admin') {
      return await this.logAccessDecision(
        impersonator,
        'admin:users',
        { type: 'user', id: targetUserId },
        false,
        'impersonation_denied_insufficient_role'
      );
    }

    // Get target user information
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return {
        granted: false,
        reason: 'Target user not found',
        riskLevel: 'medium',
      };
    }

    // Cannot impersonate other super admins
    if (targetUser.role === 'super_admin') {
      return await this.logAccessDecision(
        impersonator,
        'admin:users',
        { type: 'user', id: targetUserId },
        false,
        'impersonation_denied_target_super_admin'
      );
    }

    return await this.logAccessDecision(
      impersonator,
      'admin:users',
      { type: 'user', id: targetUserId },
      true,
      'impersonation_granted'
    );
  }

  /**
   * Resource-specific access rules
   */
  private async checkResourceSpecificRules(
    user: UserContext,
    permission: Permission,
    resource?: ResourceContext
  ): Promise<AccessResult> {
    if (!resource) {
      return { granted: true };
    }

    switch (resource.type) {
      case 'assessment':
        return await this.checkAssessmentAccess(user, permission, resource);
      
      case 'document':
        return await this.checkDocumentAccess(user, permission, resource);
      
      case 'risk':
        return await this.checkRiskAccess(user, permission, resource);
      
      case 'user':
        return await this.checkUserAccess(user, permission, resource);

      default:
        return { granted: true };
    }
  }

  /**
   * Assessment-specific access checks
   */
  private async checkAssessmentAccess(
    user: UserContext,
    permission: Permission,
    resource: ResourceContext
  ): Promise<AccessResult> {
    // Check if user is assigned to the assessment
    if (resource.id) {
      const { data: assignment } = await supabase
        .from('assessment_assignments')
        .select('user_id')
        .eq('assessment_id', resource.id)
        .eq('user_id', user.id)
        .single();

      // If user is assigned, allow read/update permissions
      if (assignment && ['assessment:read', 'assessment:update'].includes(permission)) {
        return { granted: true };
      }
    }

    return { granted: true }; // Default to role-based check
  }

  /**
   * Document-specific access checks
   */
  private async checkDocumentAccess(
    user: UserContext,
    permission: Permission,
    resource: ResourceContext
  ): Promise<AccessResult> {
    // Check document sensitivity level
    if (resource.metadata?.sensitivityLevel === 'confidential') {
      const canAccessConfidential = ['super_admin', 'org_admin', 'compliance_manager'].includes(user.role);
      if (!canAccessConfidential) {
        return {
          granted: false,
          reason: 'Insufficient clearance for confidential document',
          riskLevel: 'high',
        };
      }
    }

    return { granted: true };
  }

  /**
   * Risk-specific access checks
   */
  private async checkRiskAccess(
    user: UserContext,
    permission: Permission,
    resource: ResourceContext
  ): Promise<AccessResult> {
    // High severity risks require elevated permissions
    if (resource.metadata?.severity === 'critical' && permission.includes('update')) {
      const canUpdateCritical = ['super_admin', 'org_admin', 'compliance_manager'].includes(user.role);
      if (!canUpdateCritical) {
        return {
          granted: false,
          reason: 'Insufficient permissions for critical risk modification',
          riskLevel: 'high',
        };
      }
    }

    return { granted: true };
  }

  /**
   * User-specific access checks
   */
  private async checkUserAccess(
    user: UserContext,
    permission: Permission,
    resource: ResourceContext
  ): Promise<AccessResult> {
    // Users can always access their own profile
    if (resource.id === user.id && permission.startsWith('own:')) {
      return { granted: true };
    }

    // Cannot modify users with higher or equal role (except super admin)
    if (permission.includes('update') || permission.includes('delete')) {
      const { data: targetUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', resource.id)
        .single();

      if (targetUser && user.role !== 'super_admin') {
        const userRoleLevel = this.getRoleLevel(user.role);
        const targetRoleLevel = this.getRoleLevel(targetUser.role);

        if (targetRoleLevel >= userRoleLevel) {
          return {
            granted: false,
            reason: 'Cannot modify user with equal or higher role',
            riskLevel: 'high',
          };
        }
      }
    }

    return { granted: true };
  }

  /**
   * Get numeric role level for comparison
   */
  private getRoleLevel(role: Role): number {
    const levels: Record<Role, number> = {
      'super_admin': 5,
      'org_admin': 4,
      'compliance_manager': 3,
      'auditor': 2,
      'user': 1,
    };
    return levels[role] || 0;
  }

  /**
   * Log access decision for audit trail
   */
  private async logAccessDecision(
    user: UserContext,
    permission: Permission,
    resource?: ResourceContext,
    granted: boolean = true,
    reason?: string,
    requiredPermissions?: Permission[],
    missingPermissions?: Permission[]
  ): Promise<AccessResult> {
    const logDetails = {
      permission,
      granted,
      reason,
      resourceType: resource?.type,
      resourceId: resource?.id,
      organizationId: resource?.organizationId,
      userRole: user.role,
      userOrgId: user.organizationId,
      requiredPermissions,
      missingPermissions,
    };

    await securityService.logSecurityEvent({
      type: granted ? 'authentication_success' : 'authorization_failure',
      userId: user.id,
      details: logDetails,
      timestamp: new Date(),
      severity: granted ? 'low' : (reason?.includes('critical') || reason?.includes('confidential') ? 'high' : 'medium'),
    });

    // Detect privilege escalation attempts
    if (!granted && (
      permission.includes('admin:') || 
      permission.includes('delete') ||
      missingPermissions?.some(p => p.includes('admin:'))
    )) {
      await securityService.logSecurityEvent({
        type: 'privilege_escalation_attempt',
        userId: user.id,
        details: {
          attemptedPermission: permission,
          userRole: user.role,
          ...logDetails,
        },
        timestamp: new Date(),
        severity: 'critical',
      });
    }

    return {
      granted,
      reason,
      requiredPermissions,
      missingPermissions,
      riskLevel: granted ? 'low' : 'medium',
    };
  }

  /**
   * Generate a security report for RBAC system
   */
  public generateSecurityReport(): {
    totalRoles: number;
    totalPermissions: number;
    roleHierarchyDepth: number;
    rbacEnabled: boolean;
  } {
    return {
      totalRoles: Object.keys(this.rolePermissions).length,
      totalPermissions: new Set(Object.values(this.rolePermissions).flat()).size,
      roleHierarchyDepth: Math.max(...Object.values(this.roleHierarchy).map(h => h.length)),
      rbacEnabled: true,
    };
  }

  /**
   * Validate role hierarchy integrity
   */
  public validateRoleHierarchy(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for circular dependencies
    for (const [role, inheritedRoles] of Object.entries(this.roleHierarchy)) {
      if (inheritedRoles.includes(role as Role)) {
        issues.push(`Circular dependency detected: ${role} inherits from itself`);
      }
    }

    // Check for invalid role references
    for (const [role, inheritedRoles] of Object.entries(this.roleHierarchy)) {
      for (const inheritedRole of inheritedRoles) {
        if (!this.rolePermissions[inheritedRole]) {
          issues.push(`Invalid role reference: ${role} inherits from non-existent role ${inheritedRole}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// React Hook for permission checking
export const usePermissions = (user: UserContext) => {
  const rbac = RBACGuards.getInstance();

  const checkPermission = async (permission: Permission, resource?: ResourceContext) => {
    return await rbac.checkAccess(user, permission, resource);
  };

  const hasRole = (roles: Role | Role[]) => {
    return rbac.hasRole(user, roles);
  };

  const getUserPermissions = async () => {
    return await rbac.getUserPermissions(user);
  };

  return {
    checkPermission,
    hasRole,
    getUserPermissions,
  };
};

export const rbacGuards = RBACGuards.getInstance();