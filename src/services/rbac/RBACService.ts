import { supabase } from '@/lib/supabase';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  is_custom: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  user_id: string;
  organization_id: string;
  role_id: string;
  permissions: string[];
  computed_permissions: string[];
  effective_permissions: string[];
}

export interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

class RBACService {
  
  // Core permission definitions
  private static readonly CORE_PERMISSIONS = {
    // Dashboard permissions
    'dashboard.view': { category: 'dashboard', resource: 'dashboard', action: 'view' },
    'dashboard.manage': { category: 'dashboard', resource: 'dashboard', action: 'manage' },
    
    // User management permissions
    'users.view': { category: 'users', resource: 'users', action: 'view' },
    'users.invite': { category: 'users', resource: 'users', action: 'invite' },
    'users.edit': { category: 'users', resource: 'users', action: 'edit' },
    'users.remove': { category: 'users', resource: 'users', action: 'remove' },
    'users.roles.assign': { category: 'users', resource: 'user_roles', action: 'assign' },
    
    // Organization permissions
    'organization.view': { category: 'organization', resource: 'organization', action: 'view' },
    'organization.edit': { category: 'organization', resource: 'organization', action: 'edit' },
    'organization.settings': { category: 'organization', resource: 'organization', action: 'settings' },
    'organization.billing': { category: 'organization', resource: 'organization', action: 'billing' },
    
    // Requirements permissions
    'requirements.view': { category: 'requirements', resource: 'requirements', action: 'view' },
    'requirements.edit': { category: 'requirements', resource: 'requirements', action: 'edit' },
    'requirements.assign': { category: 'requirements', resource: 'requirements', action: 'assign' },
    'requirements.comment': { category: 'requirements', resource: 'requirements', action: 'comment' },
    
    // Assessment permissions
    'assessments.view': { category: 'assessments', resource: 'assessments', action: 'view' },
    'assessments.create': { category: 'assessments', resource: 'assessments', action: 'create' },
    'assessments.edit': { category: 'assessments', resource: 'assessments', action: 'edit' },
    'assessments.delete': { category: 'assessments', resource: 'assessments', action: 'delete' },
    'assessments.submit': { category: 'assessments', resource: 'assessments', action: 'submit' },
    'assessments.approve': { category: 'assessments', resource: 'assessments', action: 'approve' },
    
    // Standards permissions
    'standards.view': { category: 'standards', resource: 'standards', action: 'view' },
    'standards.create': { category: 'standards', resource: 'standards', action: 'create' },
    'standards.edit': { category: 'standards', resource: 'standards', action: 'edit' },
    'standards.delete': { category: 'standards', resource: 'standards', action: 'delete' },
    'standards.import': { category: 'standards', resource: 'standards', action: 'import' },
    
    // Documents permissions
    'documents.view': { category: 'documents', resource: 'documents', action: 'view' },
    'documents.create': { category: 'documents', resource: 'documents', action: 'create' },
    'documents.edit': { category: 'documents', resource: 'documents', action: 'edit' },
    'documents.delete': { category: 'documents', resource: 'documents', action: 'delete' },
    'documents.upload': { category: 'documents', resource: 'documents', action: 'upload' },
    'documents.download': { category: 'documents', resource: 'documents', action: 'download' },
    
    // Reports permissions
    'reports.view': { category: 'reports', resource: 'reports', action: 'view' },
    'reports.create': { category: 'reports', resource: 'reports', action: 'create' },
    'reports.export': { category: 'reports', resource: 'reports', action: 'export' },
    
    // Risk management permissions
    'risks.view': { category: 'risks', resource: 'risks', action: 'view' },
    'risks.create': { category: 'risks', resource: 'risks', action: 'create' },
    'risks.edit': { category: 'risks', resource: 'risks', action: 'edit' },
    'risks.delete': { category: 'risks', resource: 'risks', action: 'delete' },
    'risks.assign': { category: 'risks', resource: 'risks', action: 'assign' },
    
    // Admin permissions
    'admin.system': { category: 'admin', resource: 'system', action: 'manage' },
    'admin.audit_logs': { category: 'admin', resource: 'audit_logs', action: 'view' },
    'admin.analytics': { category: 'admin', resource: 'analytics', action: 'view' },
    'admin.integrations': { category: 'admin', resource: 'integrations', action: 'manage' },
    
    // Collaboration permissions
    'collaboration.comment': { category: 'collaboration', resource: 'comments', action: 'create' },
    'collaboration.mention': { category: 'collaboration', resource: 'mentions', action: 'create' },
    'collaboration.activity_feed': { category: 'collaboration', resource: 'activity_feed', action: 'view' },
    
    // Notification permissions
    'notifications.view': { category: 'notifications', resource: 'notifications', action: 'view' },
    'notifications.settings': { category: 'notifications', resource: 'notifications', action: 'settings' },
  };

  // Predefined role templates
  private static readonly ROLE_TEMPLATES = {
    viewer: {
      name: 'viewer',
      display_name: 'Viewer',
      description: 'Read-only access to most content',
      permissions: [
        'dashboard.view',
        'requirements.view',
        'assessments.view',
        'standards.view',
        'documents.view',
        'documents.download',
        'reports.view',
        'risks.view',
        'collaboration.activity_feed',
        'notifications.view'
      ]
    },
    analyst: {
      name: 'analyst',
      display_name: 'Security Analyst',
      description: 'Can perform assessments and manage requirements',
      permissions: [
        'dashboard.view',
        'requirements.view',
        'requirements.edit',
        'requirements.comment',
        'assessments.view',
        'assessments.create',
        'assessments.edit',
        'assessments.submit',
        'standards.view',
        'documents.view',
        'documents.create',
        'documents.edit',
        'documents.upload',
        'documents.download',
        'reports.view',
        'reports.create',
        'risks.view',
        'risks.create',
        'risks.edit',
        'collaboration.comment',
        'collaboration.mention',
        'collaboration.activity_feed',
        'notifications.view',
        'notifications.settings'
      ]
    },
    editor: {
      name: 'editor',
      display_name: 'Editor',
      description: 'Can manage content and assignments',
      permissions: [
        'dashboard.view',
        'requirements.view',
        'requirements.edit',
        'requirements.assign',
        'requirements.comment',
        'assessments.view',
        'assessments.create',
        'assessments.edit',
        'assessments.delete',
        'assessments.submit',
        'assessments.approve',
        'standards.view',
        'standards.create',
        'standards.edit',
        'standards.import',
        'documents.view',
        'documents.create',
        'documents.edit',
        'documents.delete',
        'documents.upload',
        'documents.download',
        'reports.view',
        'reports.create',
        'reports.export',
        'risks.view',
        'risks.create',
        'risks.edit',
        'risks.assign',
        'collaboration.comment',
        'collaboration.mention',
        'collaboration.activity_feed',
        'notifications.view',
        'notifications.settings'
      ]
    },
    manager: {
      name: 'manager',
      display_name: 'Manager',
      description: 'Team management and oversight capabilities',
      permissions: [
        'dashboard.view',
        'dashboard.manage',
        'users.view',
        'users.invite',
        'organization.view',
        'requirements.view',
        'requirements.edit',
        'requirements.assign',
        'requirements.comment',
        'assessments.view',
        'assessments.create',
        'assessments.edit',
        'assessments.delete',
        'assessments.submit',
        'assessments.approve',
        'standards.view',
        'standards.create',
        'standards.edit',
        'standards.import',
        'documents.view',
        'documents.create',
        'documents.edit',
        'documents.delete',
        'documents.upload',
        'documents.download',
        'reports.view',
        'reports.create',
        'reports.export',
        'risks.view',
        'risks.create',
        'risks.edit',
        'risks.delete',
        'risks.assign',
        'collaboration.comment',
        'collaboration.mention',
        'collaboration.activity_feed',
        'notifications.view',
        'notifications.settings'
      ]
    },
    ciso: {
      name: 'ciso',
      display_name: 'CISO/Security Officer',
      description: 'Chief Information Security Officer with broad oversight',
      permissions: [
        'dashboard.view',
        'dashboard.manage',
        'users.view',
        'users.invite',
        'users.edit',
        'organization.view',
        'organization.settings',
        'requirements.view',
        'requirements.edit',
        'requirements.assign',
        'requirements.comment',
        'assessments.view',
        'assessments.create',
        'assessments.edit',
        'assessments.delete',
        'assessments.submit',
        'assessments.approve',
        'standards.view',
        'standards.create',
        'standards.edit',
        'standards.delete',
        'standards.import',
        'documents.view',
        'documents.create',
        'documents.edit',
        'documents.delete',
        'documents.upload',
        'documents.download',
        'reports.view',
        'reports.create',
        'reports.export',
        'risks.view',
        'risks.create',
        'risks.edit',
        'risks.delete',
        'risks.assign',
        'admin.analytics',
        'admin.integrations',
        'collaboration.comment',
        'collaboration.mention',
        'collaboration.activity_feed',
        'notifications.view',
        'notifications.settings'
      ]
    },
    admin: {
      name: 'admin',
      display_name: 'Administrator',
      description: 'Full system access and administration',
      permissions: Object.keys(RBACService.CORE_PERMISSIONS)
    }
  };

  // Get all available permissions
  async getPermissions(): Promise<Permission[]> {
    return Object.entries(RBACService.CORE_PERMISSIONS).map(([name, config]) => ({
      id: name,
      name,
      description: `${config.action} ${config.resource}`,
      category: config.category,
      resource: config.resource,
      action: config.action
    }));
  }

  // Get all roles for an organization
  async getOrganizationRoles(organizationId: string): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .or(`organization_id.eq.${organizationId},is_system_role.eq.true`)
        .order('name');

      if (error) throw error;

      // Map roles to include permissions
      const rolesWithPermissions = await Promise.all(
        data.map(async (role) => {
          const permissions = await this.getRolePermissions(role.id);
          return {
            ...role,
            permissions,
            is_custom: !role.is_system_role
          };
        })
      );

      return rolesWithPermissions;
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      return [];
    }
  }

  // Get permissions for a specific role
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_name')
        .eq('role_id', roleId);

      if (error) throw error;

      const allPermissions = await this.getPermissions();
      return allPermissions.filter(permission => 
        data.some(rp => rp.permission_name === permission.name)
      );
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  }

  // Get user's effective permissions
  async getUserPermissions(userId: string, organizationId: string): Promise<UserPermissions> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', {
          user_uuid: userId,
          org_uuid: organizationId
        });

      if (error) throw error;

      return data || {
        user_id: userId,
        organization_id: organizationId,
        role_id: '',
        permissions: [],
        computed_permissions: [],
        effective_permissions: []
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {
        user_id: userId,
        organization_id: organizationId,
        role_id: '',
        permissions: [],
        computed_permissions: [],
        effective_permissions: []
      };
    }
  }

  // Check if user has permission
  async hasPermission(
    userId: string, 
    organizationId: string, 
    permission: string | PermissionCheck
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId, organizationId);
      
      if (typeof permission === 'string') {
        return userPermissions.effective_permissions.includes(permission);
      }

      // For complex permission checks with conditions
      const permissionName = `${permission.resource}.${permission.action}`;
      const hasBasePermission = userPermissions.effective_permissions.includes(permissionName);
      
      if (!hasBasePermission) return false;
      
      // Check conditions if any (e.g., resource ownership, department access)
      if (permission.conditions) {
        return await this.checkPermissionConditions(
          userId, 
          organizationId, 
          permission.conditions
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Check permission conditions (for complex authorization)
  private async checkPermissionConditions(
    userId: string,
    organizationId: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    // Implement condition checking logic
    // Examples: department access, resource ownership, etc.
    
    if (conditions.department_id) {
      // Check if user has access to specific department
      const { data } = await supabase
        .from('user_departments')
        .select('id')
        .eq('user_id', userId)
        .eq('department_id', conditions.department_id)
        .single();
      
      if (!data) return false;
    }

    if (conditions.resource_owner) {
      // Check if user owns the resource
      const { data } = await supabase
        .from(conditions.resource_table)
        .select('created_by')
        .eq('id', conditions.resource_id)
        .single();
      
      if (data?.created_by !== userId) return false;
    }

    return true;
  }

  // Create custom role
  async createRole(params: {
    organizationId: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
  }): Promise<{ success: boolean; roleId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          name: params.name,
          display_name: params.displayName,
          description: params.description,
          organization_id: params.organizationId,
          is_system_role: false,
          is_custom: true
        })
        .select('id')
        .single();

      if (roleError) throw roleError;

      // Add permissions
      const permissionInserts = params.permissions.map(permission => ({
        role_id: roleData.id,
        permission_name: permission
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (permError) throw permError;

      return { success: true, roleId: roleData.id };
    } catch (error) {
      console.error('Error creating role:', error);
      return { success: false, error: 'Failed to create role' };
    }
  }

  // Update role permissions
  async updateRolePermissions(
    roleId: string, 
    permissions: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Add new permissions
      const permissionInserts = permissions.map(permission => ({
        role_id: roleId,
        permission_name: permission
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return { success: false, error: 'Failed to update role permissions' };
    }
  }

  // Initialize system roles for an organization
  async initializeSystemRoles(): Promise<void> {
    try {
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('name')
        .eq('is_system_role', true);

      const existingRoleNames = existingRoles?.map(role => role.name) || [];

      // Create missing system roles
      for (const [roleName, roleConfig] of Object.entries(RBACService.ROLE_TEMPLATES)) {
        if (!existingRoleNames.includes(roleName)) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .insert({
              name: roleName,
              display_name: roleConfig.display_name,
              description: roleConfig.description,
              is_system_role: true,
              is_custom: false
            })
            .select('id')
            .single();

          if (roleData) {
            // Add permissions
            const permissionInserts = roleConfig.permissions.map(permission => ({
              role_id: roleData.id,
              permission_name: permission
            }));

            await supabase
              .from('role_permissions')
              .insert(permissionInserts);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing system roles:', error);
    }
  }

  // Get permission categories for UI
  getPermissionCategories(): Array<{ name: string; permissions: Permission[] }> {
    const allPermissions = Object.entries(RBACService.CORE_PERMISSIONS).map(([name, config]) => ({
      id: name,
      name,
      description: `${config.action} ${config.resource}`,
      category: config.category,
      resource: config.resource,
      action: config.action
    }));

    const categories = Array.from(new Set(allPermissions.map(p => p.category)));
    
    return categories.map(category => ({
      name: category,
      permissions: allPermissions.filter(p => p.category === category)
    }));
  }

  // Validate permissions array
  validatePermissions(permissions: string[]): { valid: boolean; invalid: string[] } {
    const validPermissions = Object.keys(RBACService.CORE_PERMISSIONS);
    const invalid = permissions.filter(p => !validPermissions.includes(p));
    
    return {
      valid: invalid.length === 0,
      invalid
    };
  }
}

export const rbacService = new RBACService();