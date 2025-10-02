import { supabase, supabaseUrl } from '@/lib/supabase';
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
      const { error } = await (supabase as any)
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
  // USER INVITATION MANAGEMENT
  // ============================================================================

  async inviteUser(invitationData: UserInvitationData) {
    try {
      // Use custom invitation system (works in dev and prod)
      console.log('📧 Creating custom invitation for:', invitationData.email);
      return this.createCustomInvitation(invitationData);
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }

  // Fallback method for custom invitations
  private async createCustomInvitation(invitationData: UserInvitationData) {
    console.log('📧 Using custom invitation fallback for:', invitationData.email);
    
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let userId: string | undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (authError) {
      console.warn('Auth error, using demo user:', authError);
      userId = undefined;
    }

    if (!userId) {
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser || import.meta.env.DEV) {
        userId = '031dbc29-51fd-4135-9582-a9c5b63f7451';
      } else {
        throw new Error('User not authenticated and not in demo mode');
      }
    }

    const insertData = {
      email: invitationData.email,
      role_id: invitationData.role_id,
      organization_id: invitationData.organization_id,
      token: token,
      invited_by: userId,
      expires_at: expiresAt.toISOString(),
      metadata: invitationData.metadata || {}
    };

    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert(insertData as any)
      .select()
      .single() as { data: any; error: any };

    if (error) {
      console.error('Database error creating custom invitation:', error);
      throw error;
    }

    if (!invitation) {
      throw new Error('Failed to create invitation');
    }

    // Send custom invitation email (non-blocking)
    try {
      await this.sendInvitationEmail(invitation);
    } catch (emailError) {
      console.warn('⚠️ Email sending failed (invitation still created):', emailError);
      // Don't throw - invitation was created successfully
    }

    await this.auditLogger.log('user_invited', 'user_invitations', invitation.id, {
      new_values: { email: invitationData.email, organization_id: invitationData.organization_id }
    });

    console.log('✅ Invitation created successfully:', invitation.id);
    return invitation;
  }

  private async sendInvitationEmail(invitation: any) {
    try {
      console.log('📧 Sending invitation email to:', invitation.email);
      console.log('📧 Invitation details:', {
        email: invitation.email,
        organization_id: invitation.organization_id,
        role_id: invitation.role_id,
        invitation_token: invitation.token,
        expires_at: invitation.expires_at
      });

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
      const { data: org } = await (supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single() as any);

      // Get role details from role_id
      let roleName = 'User';
      if (invitation.role_id) {
        const { data: roleData } = await (supabase
          .from('user_roles')
          .select('display_name')
          .eq('id', invitation.role_id)
          .single() as any);
        roleName = roleData && roleData.display_name ? roleData.display_name : 'User';
      }

      const result = await emailService.sendInvitationEmail({
        email: invitation.email,
        organization_name: org && org.name ? org.name : 'Unknown Organization',
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
      console.error('❌ Error sending invitation email:', error);
      // Email failure should not block the invitation - user can still be invited manually
      console.warn('⚠️ Email service error - invitation created but email not sent');
      // Don't throw - invitation was still created in database
    }
  }

  // ============================================================================
  // ORGANIZATIONS MANAGEMENT
  // ============================================================================

  async getOrganizations(): Promise<any[]> {
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
      const userIds = orgUsers.map((u: any) => u.user_id).filter(Boolean);
      const roleIds = orgUsers.map((u: any) => u.role_id).filter(Boolean);

      // Get user emails from auth.users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userEmails = new Map<string, string>();
      authUsers?.users?.forEach(user => {
        if (user.id && user.email) {
          userEmails.set(user.id, user.email);
        }
      });

      // Get roles
      const { data: roles } = await (supabase
        .from('user_roles')
        .select('id, name, display_name, permissions')
        .in('id', roleIds) as any);

      const rolesMap = new Map<string, any>();
      roles?.forEach((role: any) => {
        rolesMap.set(role.id, role);
      });

      return orgUsers.map((user: any) => ({
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
      console.log('🔍 AdminService.getStandards() called');

      // Try to fetch standards directly - if RLS blocks it, we'll get an error
      const { data: standards, error } = await supabase
        .from('standards_library')
        .select('*')
        .order('name');

      if (error) {
        console.warn('⚠️ Unable to fetch standards (likely RLS policy):', error.message);
        return [];
      }

      console.log('✅ Standards fetched successfully:', standards?.length || 0, 'records');
      console.log('📋 Standards data:', standards);
      
      if (includeRequirementCount && standards) {
        const standardsWithCounts = await Promise.all(
          standards.map(async (standard: any) => {
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

  async createStandard(data: StandardCreateData): Promise<Standard> {
    const { data: standard, error } = await supabase
      .from('standards_library')
      .insert(data as any)
      .select()
      .single() as { data: any; error: any };

    if (error) throw error;

    if (!standard) {
      throw new Error('Failed to create standard');
    }

    await this.auditLogger.log('standard_created', 'standards', (standard as any).id, {
      new_values: data
    });

    return standard as Standard;
  }

  async updateStandard(id: string, data: Partial<StandardCreateData>) {
    const { data: oldStandard } = await supabase
      .from('standards_library')
      .select('*')
      .eq('id', id)
      .single() as { data: any; error: any };

    const { data: standard, error } = await supabase
      .from('standards_library')
      .update(data as any)
      .eq('id', id)
      .select()
      .single() as { data: any; error: any };

    if (error) throw error;

    await this.auditLogger.log('standard_updated', 'standards', id, {
      old_values: oldStandard,
      new_values: data
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

    await this.auditLogger.log('standard_deleted', 'standards', id, {
      old_values: standard
    });
  }

  // ============================================================================
  // REQUIREMENTS MANAGEMENT
  // ============================================================================

  async getRequirements(standardId?: string): Promise<any[]> {
    try {
      const accessMap = await this.getTableAccessMap();
      
      if (!accessMap['requirements_library']) {
        return [];
      }
      
      let query = supabase
        .from('requirements_library')
        .select(`
          *,
          standards_library(name, version)
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
      .from('requirements_library')
      .insert(data as any)
      .select()
      .single() as { data: any; error: any };

    if (error) throw error;

    if (!requirement) {
      throw new Error('Failed to create requirement');
    }

    await this.auditLogger.log('requirement_created', 'requirements', (requirement as any).id, {
      new_values: data
    });

    return requirement;
  }

  async updateRequirement(id: string, data: Partial<RequirementCreateData>) {
    const { data: oldRequirement } = await supabase
      .from('requirements_library')
      .select('*')
      .eq('id', id)
      .single() as { data: any; error: any };

    const { data: requirement, error } = await supabase
      .from('requirements_library')
      .update(data as any)
      .eq('id', id)
      .select()
      .single() as { data: any; error: any };

    if (error) throw error;

    await this.auditLogger.log('requirement_updated', 'requirements', id, {
      old_values: oldRequirement,
      new_values: data
    });

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
      if (accessMap['standards_library']) {
        const { count: standardsCount } = await supabase
          .from('standards_library')
          .select('*', { count: 'exact', head: true });
        totalStandards = standardsCount || 0;
      }
      
      // Get requirements count
      let totalRequirements = 0;
      if (accessMap['requirements_library']) {
        const { count: reqCount } = await supabase
          .from('requirements_library')
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
        const { count: updateCount } = await (supabase as any)
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
      const insertData = {
        name: orgData.name,
        slug: orgData.slug,
        subscription_tier: orgData.subscription_tier,
        industry: orgData.industry,
        company_size: orgData.company_size
      };

      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert(insertData as any)
        .select()
        .single() as { data: any; error: any };

      if (error) {
        throw error;
      }

      if (!newOrg) {
        throw new Error('Failed to create organization');
      }

      await this.auditLogger.log('organization_created', 'organizations', (newOrg as any).id, {
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
        .update(updates as any)
        .eq('id', organizationId)
        .select()
        .single() as { data: any; error: any };

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
        .update({ is_active: isActive } as any)
        .eq('id', organizationId)
        .select()
        .single() as { data: any; error: any };

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
        .update({ status: 'inactive' } as any)
        .eq('organization_id', organizationId)
        .eq('user_id', userId) as { data: any; error: any };

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

  async getAllUsers() {
    try {
      // Call admin-users Edge Function to get all users with proper auth
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const url = `${supabaseUrl}/functions/v1/admin-users`;
      console.log('🔍 Fetching users from:', url);
      console.log('🔑 Using token:', session.session.access_token.substring(0, 20) + '...');
      console.log('🌐 Supabase URL from env:', supabaseUrl);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Received users data:', data);

      // Return users in a format compatible with the UI
      return (data.users || []).map((user: any) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        raw_user_meta_data: user.user_metadata || {},
        organization_memberships: user.organization_memberships || []
      }));
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getPlatformAdministrators() {
    try {
      const { data, error } = await supabase
        .from('platform_administrators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        is_active: admin.is_active,
        permissions: [admin.role], // Role as permission
        created_at: admin.created_at,
        last_login_at: admin.last_login,
      }));
    } catch (error) {
      console.error('❌ Error fetching platform administrators:', error);
      throw error;
    }
  }

  async getDemoAccounts() {
    try {
      const { data, error } = await (supabase as any)
        .from('demo_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((demo: any) => ({
        id: demo.id,
        user_id: demo.user_id,
        email: demo.email,
        name: demo.name,
        is_active: demo.is_active,
        features: demo.features,
        created_at: demo.created_at,
        updated_at: demo.updated_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching demo accounts:', error);
      throw error;
    }
  }

  async updateDemoAccount(id: string, updates: { is_active?: boolean; features?: any }) {
    try {
      const { data, error } = await (supabase as any)
        .from('demo_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating demo account:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER DETAILS & MANAGEMENT
  // ============================================================================

  async getUserDetails(userId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user details: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      throw error;
    }
  }

  async getUserMFAFactors(userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('auth.mfa_factors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching MFA factors:', error);
      return [];
    }
  }

  async removeMFAFactor(userId: string, factorId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'remove_mfa',
            userId: userId,
            factorId: factorId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove MFA factor: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error removing MFA factor:', error);
      throw error;
    }
  }

  async sendPasswordReset(email: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reset_password',
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send password reset: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error sending password reset:', error);
      throw error;
    }
  }

  async getUserActivityLog(userId: string, limit = 50) {
    try {
      const { data, error } = await (supabase as any)
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching user activity log:', error);
      return [];
    }
  }

  async logUserActivity(
    userId: string,
    activityType: string,
    metadata: any = {}
  ) {
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data: adminUser } = await supabase
        .from('platform_administrators')
        .select('id')
        .eq('email', session?.session?.user?.email)
        .single();

      await (supabase as any).from('user_activity_log').insert({
        user_id: userId,
        activity_type: activityType,
        performed_by_admin_id: adminUser?.id,
        metadata,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error logging user activity:', error);
    }
  }

  // ============================================================================
  // SUPPORT TICKETS
  // ============================================================================

  async getUserSupportTickets(userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching support tickets:', error);
      return [];
    }
  }

  async createSupportTicket(ticketData: {
    user_id: string;
    subject: string;
    description: string;
    priority?: string;
    category?: string;
  }) {
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data: adminUser } = await supabase
        .from('platform_administrators')
        .select('id')
        .eq('email', session?.session?.user?.email)
        .single();

      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .insert({
          ...ticketData,
          created_by_admin_id: adminUser?.id,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating support ticket:', error);
      throw error;
    }
  }

  async updateSupportTicket(
    ticketId: string,
    updates: {
      status?: string;
      priority?: string;
      resolution_notes?: string;
      assigned_to_admin_id?: string;
    }
  ) {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.status === 'resolved' || updates.status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating support ticket:', error);
      throw error;
    }
  }

  async suspendUser(userId: string, reason: string) {
    try {
      // Call admin-users Edge Function to suspend user
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            suspended: true,
            userData: { suspension_reason: reason }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend user');
      }

      // Log the suspension
      await this.auditLogger.log('user_suspended', 'auth.users', userId, {
        new_values: { suspended: true, reason }
      });

      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  async getSystemSettings(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching system settings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSystemSettings:', error);
      throw error;
    }
  }

  async updateSystemSetting(settingId: string, value: any) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() } as any)
        .eq('id', settingId)
        .select()
        .single() as { data: any; error: any };

      if (error) {
        console.error('Error updating system setting:', error);
        throw error;
      }

      // Log the change
      await this.auditLogger.log('system_setting_updated', 'system_settings', settingId, {
        new_values: { value }
      });

      return data;
    } catch (error) {
      console.error('Error in updateSystemSetting:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();