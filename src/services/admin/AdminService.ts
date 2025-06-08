import { supabase } from '@/lib/supabase';
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

  constructor() {
    this.auditLogger = new AuditLogger();
  }

  // ============================================================================
  // STANDARDS MANAGEMENT
  // ============================================================================

  async getStandards(includeRequirementCount = true) {
    const { data: standards, error } = await supabase
      .from('standards_library')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching standards:', error);
      throw error;
    }

    if (includeRequirementCount && standards) {
      const standardsWithCounts = await Promise.all(
        standards.map(async (standard) => {
          const { count } = await supabase
            .from('requirements_library')
            .select('id', { count: 'exact', head: true })
            .eq('standard_id', standard.id);

          return {
            ...standard,
            requirementCount: count || 0
          };
        })
      );
      return standardsWithCounts;
    }

    return standards;
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
      .order('order_index');

    if (error) {
      console.error('Error fetching requirements:', error);
      throw error;
    }
    
    console.log('Requirements fetched:', data);
    return data;
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
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
    
    return data || [];
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
    // Note: auth.users is not directly accessible via Supabase client
    // For now, return empty array - will need to use Admin API for this
    console.log('getAllUsers: Direct auth.users access not available via client SDK');
    return [];
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
    // TODO: Implement email sending
    console.log('Sending invitation email to:', invitation.email);
    console.log('Invitation URL: /invite/' + invitation.invitation_token);
  }

  async suspendUser(userId: string, reason: string) {
    // TODO: Implement user suspension
    await this.auditLogger.log('user_suspended', 'auth.users', userId, {
      new_values: { reason }
    });
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
      const [
        { count: totalOrganizations },
        { count: totalStandards },
        { count: totalRequirements }
      ] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('standards_library').select('id', { count: 'exact', head: true }),
        supabase.from('requirements_library').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalOrganizations: totalOrganizations || 0,
        totalUsers: 0, // Will implement with proper user counting
        totalStandards: totalStandards || 0,
        totalRequirements: totalRequirements || 0,
        pendingInvitations: 0,
        activeAssessments: 0,
        recentUpdates: 3
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