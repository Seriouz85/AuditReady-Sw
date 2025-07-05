import { supabase, supabaseAdmin } from '@/lib/supabase';
import { AuditLogger } from './AuditLogger';

export interface StandardCreateData {
  name: string;
  version: string;
  type: 'framework' | 'regulation' | 'policy' | 'guideline';
  description?: string;
  official_url?: string;
  publication_date?: string;
}

export interface OrganizationCreateData {
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface RequirementCreateData {
  standard_id: string;
  control_id: string;
  title: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  parent_requirement_id?: string;
  order_index?: number;
}

export interface UserInvitationData {
  organization_id: string;
  email: string;
  role_id: string;
  metadata?: Record<string, any>;
}

export class AdminService {
  private auditLogger: AuditLogger;
  private tableAccessMap: Record<string, boolean> | null = null;

  constructor() {
    this.auditLogger = new AuditLogger();
  }
  
  // Test database connection and table existence
  private async testTableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }
  
  private async getTableAccessMap(): Promise<Record<string, boolean>> {
    if (this.tableAccessMap) {
      return this.tableAccessMap;
    }
    
    const tables = [
      'organizations',
      'organization_users', 
      'standards_library',
      'requirements_library',
      'assessments',
      'audit_logs',
      'platform_administrators'
    ];
    
    this.tableAccessMap = {};
    
    for (const table of tables) {
      this.tableAccessMap[table] = await this.testTableExists(table);
    }
    
    return this.tableAccessMap;
  }

  // ============================================================================
  // STANDARDS MANAGEMENT
  // ============================================================================

  async getStandards(includeRequirementCount = true) {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['standards_library']) {
        return [];
      }
      
      const { data: standards, error } = await supabaseAdmin
        .from('standards_library')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching standards:', error);
        return [];
      }

      console.log('Standards fetched successfully:', standards?.length || 0, 'records');
      
      if (includeRequirementCount && standards) {
        const standardsWithCounts = await Promise.all(
          standards.map(async (standard) => {
            try {
              const { count } = await supabase
                .from('requirements_library')
                .select('id', { count: 'exact', head: true })
                .eq('standard_id', standard.id);

              return {
                ...standard,
                requirementCount: count || 0
              };
            } catch (err) {
              console.warn(`Failed to get requirement count for standard ${standard.id}:`, err);
              return {
                ...standard,
                requirementCount: 0
              };
            }
          })
        );
        return standardsWithCounts;
      }

      return standards || [];
    } catch (err) {
      console.error('Unexpected error fetching standards:', err);
      return [];
    }
  }

  async createStandard(data: StandardCreateData) {
    const { data: standard, error } = await supabase
      .from('standards_library')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('standard_created', 'standards_library', standard.id, {
      new_values: standard
    });

    return standard;
  }

  async updateStandard(id: string, updates: Partial<StandardCreateData>) {
    const { data: oldStandard } = await supabase
      .from('standards_library')
      .select('*')
      .eq('id', id)
      .single();

    const { data: standard, error } = await supabase
      .from('standards_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('standard_updated', 'standards_library', id, {
      old_values: oldStandard,
      new_values: standard
    });

    return standard;
  }

  async deleteStandard(id: string) {
    const { data: standard } = await supabase
      .from('standards_library')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('standards_library')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await this.auditLogger.log('standard_deleted', 'standards_library', id, {
      old_values: standard
    });
  }

  // ============================================================================
  // REQUIREMENTS MANAGEMENT
  // ============================================================================

  async getRequirements(standardId: string) {
    console.log('Fetching requirements for standard:', standardId);
    
    const { data, error } = await supabase
      .from('requirements_library')
      .select('*')
      .eq('standard_id', standardId)
      .eq('is_active', true)
      .order('control_id');

    if (error) {
      console.error('Error fetching requirements:', error);
      throw error;
    }
    
    // Sort requirements by control_id using natural sort for proper numeric ordering
    const sortedData = data?.sort((a, b) => {
      const aId = a.control_id;
      const bId = b.control_id;
      
      // Natural sort function for version-like strings (1.1, 1.2, 1.10, 2.1, etc.)
      const naturalSort = (a: string, b: string) => {
        const aParts = a.split('.').map(part => parseInt(part) || part);
        const bParts = b.split('.').map(part => parseInt(part) || part);
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;
          
          if (typeof aPart === 'number' && typeof bPart === 'number') {
            if (aPart !== bPart) return aPart - bPart;
          } else {
            const aStr = String(aPart);
            const bStr = String(bPart);
            if (aStr !== bStr) return aStr.localeCompare(bStr);
          }
        }
        return 0;
      };
      
      return naturalSort(aId, bId);
    });
    
    console.log('Requirements fetched and sorted:', sortedData);
    return sortedData;
  }

  async createRequirement(data: RequirementCreateData) {
    const { data: requirement, error } = await supabase
      .from('requirements_library')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('requirement_created', 'requirements_library', requirement.id, {
      new_values: requirement
    });

    return requirement;
  }

  async updateRequirement(id: string, updates: Partial<RequirementCreateData>) {
    const { data: oldRequirement } = await supabase
      .from('requirements_library')
      .select('*')
      .eq('id', id)
      .single();

    const { data: requirement, error } = await supabase
      .from('requirements_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('requirement_updated', 'requirements_library', id, {
      old_values: oldRequirement,
      new_values: requirement
    });

    // IMPORTANT: This updates the MASTER requirement template
    // Customer-specific requirement states are stored in organization_requirements table
    console.warn('Updated master requirement template. This affects ALL organizations using this standard.');

    return requirement;
  }

  async deleteRequirement(id: string) {
    const { data: requirement } = await supabase
      .from('requirements_library')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('requirements_library')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await this.auditLogger.log('requirement_deleted', 'requirements_library', id, {
      old_values: requirement
    });
  }

  async reorderRequirements(standardId: string, requirementIds: string[]) {
    const updates = requirementIds.map((id, index) => 
      supabase
        .from('requirements_library')
        .update({ order_index: index })
        .eq('id', id)
    );

    await Promise.all(updates);

    await this.auditLogger.log('requirements_reordered', 'requirements_library', standardId, {
      new_values: { requirement_order: requirementIds }
    });
  }

  // ============================================================================
  // CUSTOMER REQUIREMENT MANAGEMENT
  // ============================================================================

  async assignStandardToOrganization(organizationId: string, standardId: string) {
    // First, create the organization_standards entry
    const { data: orgStandard, error: orgStandardError } = await supabase
      .from('organization_standards')
      .insert([{
        organization_id: organizationId,
        standard_id: standardId
      }])
      .select()
      .single();

    if (orgStandardError) throw orgStandardError;

    // Then, create organization_requirements entries for all requirements in this standard
    const { data: requirements } = await supabase
      .from('requirements_library')
      .select('id')
      .eq('standard_id', standardId)
      .eq('is_active', true);

    if (requirements && requirements.length > 0) {
      const orgRequirements = requirements.map(req => ({
        organization_id: organizationId,
        requirement_id: req.id,
        status: 'not-started' as const
      }));

      const { error: reqError } = await supabase
        .from('organization_requirements')
        .insert(orgRequirements);

      if (reqError) throw reqError;
    }

    await this.auditLogger.log('standard_assigned', 'organization_standards', orgStandard.id, {
      new_values: { organization_id: organizationId, standard_id: standardId }
    });

    return orgStandard;
  }

  async getOrganizationRequirements(organizationId: string, standardId?: string) {
    let query = supabase
      .from('organization_requirements')
      .select(`
        *,
        requirement:requirements_library(*),
        standard:requirements_library(standard_id)
      `)
      .eq('organization_id', organizationId);

    if (standardId) {
      query = query.eq('requirement.standard_id', standardId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateOrganizationRequirement(id: string, updates: {
    status?: string;
    fulfillment_percentage?: number;
    evidence?: string;
    notes?: string;
    responsible_party?: string;
    tags?: string[];
    risk_level?: string;
  }) {
    const { data, error } = await supabase
      .from('organization_requirements')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('org_requirement_updated', 'organization_requirements', id, {
      new_values: updates
    });

    return data;
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  async getOrganizations() {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['organizations']) {
        return [];
      }
      
      // Use admin client for platform admin access
      const { data, error } = await supabaseAdmin
        .from('organizations')
        .select(`
          *,
          organization_users(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        
        // Try simpler query without join as fallback
        try {
          const { data: fallbackData, error: fallbackError } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (fallbackError) {
            return [];
          }
          
          return fallbackData || [];
        } catch (fallbackErr) {
          return [];
        }
      }
      
      return data || [];
    } catch (err) {
      return [];
    }
  }

  async createOrganization(data: OrganizationCreateData) {
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    // Create default roles for the organization
    await this.createDefaultRoles(organization.id);

    await this.auditLogger.log('organization_created', 'organizations', organization.id, {
      new_values: organization
    });

    return organization;
  }

  async updateOrganization(id: string, updates: Partial<OrganizationCreateData>) {
    const { data: oldOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('organization_updated', 'organizations', id, {
      old_values: oldOrg,
      new_values: organization
    });

    return organization;
  }

  async deleteOrganization(id: string) {
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await this.auditLogger.log('organization_deleted', 'organizations', id, {
      old_values: organization
    });
  }

  private async createDefaultRoles(organizationId: string) {
    const defaultRoles = [
      {
        organization_id: organizationId,
        name: 'organization_admin',
        display_name: 'Organization Administrator',
        permissions: [
          'manage_org_settings',
          'manage_org_users',
          'view_assessments',
          'create_assessments',
          'manage_documents'
        ]
      },
      {
        organization_id: organizationId,
        name: 'compliance_manager',
        display_name: 'Compliance Manager',
        permissions: [
          'view_assessments',
          'create_assessments',
          'manage_documents',
          'view_reports'
        ]
      },
      {
        organization_id: organizationId,
        name: 'user',
        display_name: 'User',
        permissions: [
          'view_assessments',
          'view_documents'
        ]
      }
    ];

    const { error } = await supabase
      .from('user_roles')
      .insert(defaultRoles);

    if (error) throw error;
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getAllUsers() {
    try {
      // Use Auth Admin API via Edge Function
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching users via Admin API:', error);
        // Fallback to organization users if Admin API fails
        return this.getAllOrganizationUsers();
      }

      return data.users || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      // Fallback to organization users
      return this.getAllOrganizationUsers();
    }
  }

  // Fallback method using organization users
  async getAllOrganizationUsers() {
    try {
      const { data: orgUsers, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          organization:organizations(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization users:', error);
        return [];
      }

      // Transform to match expected format
      return (orgUsers || []).map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_login,
        email_confirmed_at: user.created_at, // Assume confirmed if they're in org
        raw_user_meta_data: {
          name: user.name,
          organization: user.organization?.name
        }
      }));
    } catch (error) {
      console.error('Error in getAllOrganizationUsers:', error);
      return [];
    }
  }

  async getOrganizationUsers(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_users')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }
    return data || [];
  }

  async inviteUser(invitationData: UserInvitationData) {
    // Generate invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error } = await supabase
      .from('enhanced_user_invitations')
      .insert([{
        ...invitationData,
        invitation_token: token,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email
    await this.sendInvitationEmail(invitation);

    await this.auditLogger.log('user_invited', 'enhanced_user_invitations', invitation.id, {
      new_values: { email: invitationData.email, organization_id: invitationData.organization_id }
    });

    return invitation;
  }

  private async sendInvitationEmail(invitation: any) {
    // Import email service dynamically to avoid circular dependencies
    const { emailService } = await import('../email/EmailService');
    
    // Get inviter details
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', invitation.organization_id)
      .single();
    
    // Get role details
    const { data: role } = await supabase
      .from('user_roles')
      .select('display_name')
      .eq('id', invitation.role_id)
      .single();
    
    // Send invitation email
    const result = await emailService.sendInvitationEmail({
      email: invitation.email,
      organization_name: org?.name || 'Unknown Organization',
      inviter_name: user?.email || 'Platform Administrator',
      invitation_token: invitation.invitation_token,
      role_name: role?.display_name || 'User',
    });
    
    if (!result.success) {
      console.error('Failed to send invitation email:', result.error);
      throw new Error('Failed to send invitation email');
    }
    
    console.log('Invitation email sent successfully to:', invitation.email);
  }

  async suspendUser(userId: string, reason: string) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'PUT',
        body: {
          suspended: true,
          suspensionReason: reason,
        },
      });

      if (error) throw error;

      await this.auditLogger.log('user_suspended', 'auth.users', userId, {
        new_values: { reason, suspended: true }
      });

      return data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    password?: string;
    name?: string;
    organizationId?: string;
    role?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password || this.generateRandomPassword(),
          userData: {
            name: userData.name || userData.email.split('@')[0],
          },
          organizationId: userData.organizationId,
          role: userData.role || 'user',
        },
      });

      if (error) throw error;

      await this.auditLogger.log('user_created_by_admin', 'auth.users', data.user.id, {
        new_values: userData
      });

      return data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'DELETE',
      });

      if (error) throw error;

      await this.auditLogger.log('user_deleted', 'auth.users', userId, {
        old_values: { id: userId }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUserMetadata(userId: string, metadata: Record<string, any>) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'PUT',
        body: {
          userData: metadata,
        },
      });

      if (error) throw error;

      await this.auditLogger.log('user_metadata_updated', 'auth.users', userId, {
        new_values: metadata
      });

      return data;
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
  }

  private generateRandomPassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // ============================================================================
  // SYSTEM ADMINISTRATION
  // ============================================================================

  async getSystemSettings(category?: string) {
    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateSystemSetting(id: string, value: any) {
    const { data: oldSetting } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', id)
      .single();

    const { data: setting, error } = await supabase
      .from('system_settings')
      .update({ value })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('system_setting_updated', 'system_settings', id, {
      old_values: oldSetting,
      new_values: setting
    });

    return setting;
  }

  async getAuditLogs(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('enhanced_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getPlatformStatistics() {
    try {
      const accessMap = await this.getTableAccessMap();
      
      // Initialize with default values
      let totalOrganizations = 0;
      let totalStandards = 0;
      let totalRequirements = 0;
      let totalUsers = 0;
      let activeAssessments = 0;
      let recentUpdates = 0;
      
      // Only query tables that exist and are accessible
      const queries = [];
      
      if (accessMap['organizations']) {
        queries.push(
          supabaseAdmin.from('organizations').select('id', { count: 'exact', head: true })
            .then(({ count }) => ({ type: 'organizations', count: count || 0 }))
            .catch(() => ({ type: 'organizations', count: 0 }))
        );
      }
      
      if (accessMap['standards_library']) {
        queries.push(
          supabaseAdmin.from('standards_library').select('id', { count: 'exact', head: true }).eq('is_active', true)
            .then(({ count }) => ({ type: 'standards', count: count || 0 }))
            .catch(() => ({ type: 'standards', count: 0 }))
        );
      }
      
      if (accessMap['requirements_library']) {
        queries.push(
          supabaseAdmin.from('requirements_library').select('id', { count: 'exact', head: true }).eq('is_active', true)
            .then(({ count }) => ({ type: 'requirements', count: count || 0 }))
            .catch(() => ({ type: 'requirements', count: 0 }))
        );
      }
      
      if (accessMap['organization_users']) {
        queries.push(
          supabaseAdmin.from('organization_users').select('id', { count: 'exact', head: true }).eq('status', 'active')
            .then(({ count }) => ({ type: 'users', count: count || 0 }))
            .catch(() => ({ type: 'users', count: 0 }))
        );
      }
      
      if (accessMap['assessments']) {
        queries.push(
          supabaseAdmin.from('assessments').select('id', { count: 'exact', head: true }).in('status', ['in-progress', 'draft'])
            .then(({ count }) => ({ type: 'assessments', count: count || 0 }))
            .catch(() => ({ type: 'assessments', count: 0 }))
        );
      }
      
      // Execute all available queries
      const results = await Promise.all(queries);
      
      // Process results
      results.forEach(result => {
        switch (result.type) {
          case 'organizations':
            totalOrganizations = result.count;
            break;
          case 'standards':
            totalStandards = result.count;
            break;
          case 'requirements':
            totalRequirements = result.count;
            break;
          case 'users':
            totalUsers = result.count;
            break;
          case 'assessments':
            activeAssessments = result.count;
            break;
        }
      });
      
      // Get recent updates from audit logs if available
      if (accessMap['audit_logs']) {
        try {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const { count } = await supabaseAdmin
            .from('audit_logs')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', oneWeekAgo.toISOString());
            
          recentUpdates = count || 0;
        } catch (error) {
          console.warn('Failed to get recent updates:', error);
          recentUpdates = 0;
        }
      }

      return {
        totalOrganizations,
        totalUsers,
        totalStandards: totalStandards || 0,
        totalRequirements: totalRequirements || 0,
        pendingInvitations: 0, // TODO: Implement when invitation system is ready
        activeAssessments: activeAssessments || 0,
        recentUpdates: recentUpdates || 0
      };
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      // Return default values on error
      return {
        totalOrganizations: 0,
        totalUsers: 0,
        totalStandards: 0,
        totalRequirements: 0,
        pendingInvitations: 0,
        activeAssessments: 0,
        recentUpdates: 0
      };
    }
  }
}

export const adminService = new AdminService();