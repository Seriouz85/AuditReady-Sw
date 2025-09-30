import { supabase } from '@/lib/supabase';
import { AuditLogger } from './AuditLogger';
import { Standard } from '@/types';

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
      const { error } = await supabase
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
      'standards',
      'requirements',
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
  // USER INVITATION MANAGEMENT
  // ============================================================================

  async inviteUser(invitationData: UserInvitationData) {
    try {
      // Option 1: Use Supabase built-in user invitation (RECOMMENDED)
      const { data: authInvitation, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        invitationData.email,
        {
          data: {
            organization_id: invitationData.organization_id,
            role_id: invitationData.role_id,
            invited_by: (await supabase.auth.getUser()).data.user?.id,
            ...invitationData.metadata
          },
          redirectTo: `${window.location.origin}/auth/accept-invitation`
        }
      );

      if (authError) {
        console.error('Supabase auth invitation error:', authError);
        
        // Fallback to custom invitation system
        return this.createCustomInvitation(invitationData);
      }

      // Store invitation record in our custom table for tracking
      const { data: invitation, error: dbError } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitationData.email,
          role_id: invitationData.role_id,
          organization_id: invitationData.organization_id,
          token: 'supabase-auth-invitation', // Using Supabase's system
          invited_by: authInvitation.user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: invitationData.metadata || {},
          status: 'sent'
        }])
        .select()
        .single();

      if (dbError) {
        console.warn('Could not log invitation to database:', dbError);
      }

      await this.auditLogger.log('user_invited', 'user_invitations', invitation?.id || 'supabase-auth', {
        new_values: { email: invitationData.email, organization_id: invitationData.organization_id }
      });

      console.log('✅ Invitation sent via Supabase Auth to:', invitationData.email);
      return authInvitation;

    } catch (error) {
      console.error('Error inviting user:', error);
      
      // Final fallback to custom system
      return this.createCustomInvitation(invitationData);
    }
  }

  // Fallback method for custom invitations
  private async createCustomInvitation(invitationData: UserInvitationData) {
    console.log('📧 Using custom invitation fallback for:', invitationData.email);
    
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let userId: string;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (authError) {
      console.warn('Auth error, using demo user:', authError);
      userId = null;
    }
    
    if (!userId) {
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser || import.meta.env.DEV) {
        userId = '031dbc29-51fd-4135-9582-a9c5b63f7451';
      } else {
        throw new Error('User not authenticated and not in demo mode');
      }
    }

    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert([{
        email: invitationData.email,
        role_id: invitationData.role_id,
        organization_id: invitationData.organization_id,
        token: token,
        invited_by: userId,
        expires_at: expiresAt.toISOString(),
        metadata: invitationData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error creating custom invitation:', error);
      throw error;
    }

    // Send custom invitation email
    try {
      await this.sendInvitationEmail(invitation);
    } catch (emailError) {
      console.error('Email error:', emailError);
      throw new Error(`Invitation created but email failed: ${emailError}`);
    }

    await this.auditLogger.log('user_invited', 'user_invitations', invitation.id, {
      new_values: { email: invitationData.email, organization_id: invitationData.organization_id }
    });

    return invitation;
  }

  private async sendInvitationEmail(invitation: any) {
    try {
      // In development/demo mode, skip actual email sending
      if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        console.log('📧 Demo mode: Invitation email would be sent to:', invitation.email);
        console.log('📧 Invitation details:', {
          email: invitation.email,
          organization_id: invitation.organization_id,
          role_id: invitation.role_id,
          invitation_token: invitation.token,
          expires_at: invitation.expires_at
        });
        return;
      }

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('../email/EmailService');
      
      // Get inviter details (use demo safe approach)
      let inviterName = 'Platform Administrator';
      try {
        const { data: { user } } = await supabase.auth.getUser();
        inviterName = user?.email || 'Platform Administrator';
      } catch (userError) {
        console.warn('Could not get user details, using default inviter name');
      }
      
      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      // Get role details from role_id
      let roleName = 'User';
      if (invitation.role_id) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('display_name')
          .eq('id', invitation.role_id)
          .single();
        roleName = roleData?.display_name || 'User';
      }
      
      const result = await emailService.sendInvitationEmail({
        email: invitation.email,
        organization_name: org?.name || 'Unknown Organization',
        inviter_name: inviterName,
        invitation_token: invitation.token,
        role_name: roleName,
        template_id: invitation.metadata?.template_id || 'professional', // Use template from metadata or default
      });
      
      if (!result.success) {
        console.error('Failed to send invitation email:', result.error);
        throw new Error('Failed to send invitation email');
      }
      
      console.log('✅ Invitation email sent successfully to:', invitation.email);
    } catch (error) {
      console.error('Error in sendInvitationEmail:', error);
      // In development mode, continue despite email errors
      if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        console.warn('Demo mode: Continuing despite email service error');
        return;
      }
      throw error;
    }
  }

  // ============================================================================
  // ORGANIZATIONS MANAGEMENT
  // ============================================================================

  async getOrganizations() {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['organizations']) {
        return [];
      }
      
      // Use admin client for platform admin access
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_users(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }

      console.log('Organizations fetched successfully:', data?.length || 0, 'records');
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching organizations:', err);
      return [];
    }
  }

  async getOrganizationUsers(organizationId: string) {
    try {
      // First get organization users without trying to join users table
      const { data: orgUsers, error } = await supabase
        .from('organization_users')
        .select(`
          id,
          user_id,
          status,
          created_at,
          joined_at,
          role_id
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching organization users:', error);
        // Fallback to demo data
        return [
          {
            id: '1',
            user_email: 'demo@auditready.com',
            role: { name: 'admin', display_name: 'Administrator', permissions: ['all'] },
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];
      }

      if (!orgUsers || orgUsers.length === 0) {
        return [];
      }

      // Now fetch user emails from auth.users and roles separately
      const userIds = orgUsers.map(u => u.user_id).filter(Boolean);
      const roleIds = orgUsers.map(u => u.role_id).filter(Boolean);

      // Get user emails from auth.users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userEmails = new Map();
      authUsers?.users?.forEach(user => {
        userEmails.set(user.id, user.email);
      });

      // Get roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('id, name, display_name, permissions')
        .in('id', roleIds);

      const rolesMap = new Map();
      roles?.forEach(role => {
        rolesMap.set(role.id, role);
      });

      return orgUsers.map(user => ({
        id: user.id,
        user_email: userEmails.get(user.user_id) || 'unknown@email.com',
        role: rolesMap.get(user.role_id) || { 
          name: 'viewer', 
          display_name: 'Viewer', 
          permissions: ['read'] 
        },
        status: user.status,
        created_at: user.created_at
      }));
    } catch (err) {
      console.error('Error fetching organization users:', err);
      return [];
    }
  }

  async getOrganizationRoles() {
    try {
      // Return default roles since roles table might not exist
      return [
        { id: '6cbb32e1-9da3-48aa-ab91-04d1105c8024', name: 'admin', display_name: 'Administrator' },
        { id: '9b9f8544-be6e-4c1a-8e81-b75e8b598aba', name: 'manager', display_name: 'Manager' },
        { id: 'f68236dd-08ec-4747-9e6c-bda143dcda63', name: 'viewer', display_name: 'Viewer' }
      ];
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  }

  // updateOrganization method moved to organization management section below

  // ============================================================================
  // STANDARDS MANAGEMENT
  // ============================================================================

  async getStandards(includeRequirementCount = true) {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['standards']) {
        return [];
      }
      
      const { data: standards, error } = await supabase
        .from('standards')
        .select('*')
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
                .from('requirements')
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

  async createStandard(data: StandardCreateData): Promise<Standard> {
    const { data: standard, error } = await supabase
      .from('standards')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('standard_created', 'standards', standard.id, {
      new_values: data
    });

    return standard;
  }

  async updateStandard(id: string, data: Partial<StandardCreateData>) {
    const { data: oldStandard } = await supabase
      .from('standards')
      .select('*')
      .eq('id', id)
      .single();

    const { data: standard, error } = await supabase
      .from('standards')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('standard_updated', 'standards', id, {
      old_values: oldStandard,
      new_values: data
    });

    return standard;
  }

  async deleteStandard(id: string) {
    const { data: standard } = await supabase
      .from('standards')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('standards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await this.auditLogger.log('standard_deleted', 'standards', id, {
      old_values: standard
    });
  }

  // ============================================================================
  // REQUIREMENTS MANAGEMENT
  // ============================================================================

  async getRequirements(standardId?: string) {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['requirements']) {
        return [];
      }
      
      let query = supabase
        .from('requirements')
        .select(`
          *,
          standards(name, version)
        `)
        .order('control_id');

      if (standardId) {
        query = query.eq('standard_id', standardId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching requirements:', error);
        return [];
      }

      console.log('Requirements fetched successfully:', data?.length || 0, 'records');
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching requirements:', err);
      return [];
    }
  }

  async createRequirement(data: RequirementCreateData) {
    const { data: requirement, error } = await supabase
      .from('requirements')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('requirement_created', 'requirements', requirement.id, {
      new_values: data
    });

    return requirement;
  }

  async updateRequirement(id: string, data: Partial<RequirementCreateData>) {
    const { data: oldRequirement } = await supabase
      .from('requirements')
      .select('*')
      .eq('id', id)
      .single();

    const { data: requirement, error } = await supabase
      .from('requirements')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.auditLogger.log('requirement_updated', 'requirements', id, {
      old_values: oldRequirement,
      new_values: data
    });

    return requirement;
  }

  async deleteRequirement(id: string) {
    const { data: requirement } = await supabase
      .from('requirements')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('requirements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await this.auditLogger.log('requirement_deleted', 'requirements', id, {
      old_values: requirement
    });
  }

  // ============================================================================
  // PLATFORM STATISTICS
  // ============================================================================
  
  async getPlatformStatistics() {
    try {
      const accessMap = await this.getTableAccessMap();
      
      // Get organizations count
      let totalOrganizations = 0;
      if (accessMap['organizations']) {
        const { count: orgCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });
        totalOrganizations = orgCount || 0;
      }
      
      // Get users count
      let totalUsers = 0;
      if (accessMap['organization_users']) {
        const { count: userCount } = await supabase
          .from('organization_users')
          .select('*', { count: 'exact', head: true });
        totalUsers = userCount || 0;
      }
      
      // Get standards count
      let totalStandards = 0;
      if (accessMap['standards']) {
        const { count: standardsCount } = await supabase
          .from('standards')
          .select('*', { count: 'exact', head: true });
        totalStandards = standardsCount || 0;
      }
      
      // Get requirements count
      let totalRequirements = 0;
      if (accessMap['requirements']) {
        const { count: reqCount } = await supabase
          .from('requirements')
          .select('*', { count: 'exact', head: true });
        totalRequirements = reqCount || 0;
      }
      
      // Get active assessments count
      let activeAssessments = 0;
      if (accessMap['assessments']) {
        const { count: assessmentCount } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');
        activeAssessments = assessmentCount || 0;
      }
      
      // Get recent updates (last 7 days)
      let recentUpdates = 0;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (accessMap['audit_logs']) {
        const { count: updateCount } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());
        recentUpdates = updateCount || 0;
      }
      
      console.log('Platform statistics:', {
        totalOrganizations,
        totalUsers,
        totalStandards,
        totalRequirements,
        activeAssessments,
        recentUpdates
      });
      
      return {
        totalOrganizations,
        totalUsers,
        totalStandards,
        totalRequirements,
        activeAssessments,
        recentUpdates
      };
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      return {
        totalOrganizations: 0,
        totalUsers: 0,
        totalStandards: 0,
        totalRequirements: 0,
        activeAssessments: 0,
        recentUpdates: 0
      };
    }
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT METHODS
  // ============================================================================

  async createOrganization(orgData: {
    name: string;
    slug: string;
    subscription_tier: string;
    industry?: string;
    company_size?: string;
  }) {
    try {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name,
          slug: orgData.slug,
          subscription_tier: orgData.subscription_tier,
          industry: orgData.industry,
          company_size: orgData.company_size
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await this.auditLogger.log('organization_created', 'organizations', newOrg.id, {
        new_values: orgData
      });

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async updateOrganization(organizationId: string, updates: {
    name?: string;
    slug?: string;
    subscription_tier?: string;
    industry?: string;
    company_size?: string;
  }) {
    try {
      const { data: updatedOrg, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await this.auditLogger.log('organization_updated', 'organizations', organizationId, {
        new_values: updates
      });

      return updatedOrg;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  async deleteOrganization(organizationId: string) {
    try {
      // First check if organization has users
      const { count: userCount } = await supabase
        .from('organization_users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (userCount && userCount > 0) {
        throw new Error('Cannot delete organization with active users. Please remove all users first.');
      }

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) {
        throw error;
      }

      await this.auditLogger.log('organization_deleted', 'organizations', organizationId, {
        old_values: { organization_id: organizationId }
      });

      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }

  async toggleOrganizationStatus(organizationId: string, isActive: boolean) {
    try {
      const { data: updatedOrg, error } = await supabase
        .from('organizations')
        .update({ is_active: isActive })
        .eq('id', organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await this.auditLogger.log('organization_status_changed', 'organizations', organizationId, {
        new_values: { is_active: isActive }
      });

      return updatedOrg;
    } catch (error) {
      console.error('Error toggling organization status:', error);
      throw error;
    }
  }

  async removeUserFromOrganization(organizationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({ status: 'inactive' })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      await this.auditLogger.log('user_removed', 'organization_users', `${organizationId}-${userId}`, {
        new_values: { organization_id: organizationId, user_id: userId, status: 'inactive' }
      });

      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();