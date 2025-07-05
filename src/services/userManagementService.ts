import { supabase } from '@/lib/supabase';
import { EmailService } from './emailService';

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
}

export interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  status: 'active' | 'invited' | 'suspended' | 'inactive';
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  last_login_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
    };
  };
  role?: UserRole;
  invited_by_user?: {
    email: string;
  };
}

export interface UserInvitation {
  id: string;
  organization_id: string;
  email: string;
  role_id: string;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  role?: UserRole;
  invited_by_user?: {
    email: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: string;
  stripe_customer_id?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class UserManagementService {
  
  // Get current user's organization
  async getCurrentUserOrganization(): Promise<Organization | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // CRITICAL SECURITY: Return demo organization for demo accounts
    if (user.email === 'demo@auditready.com') {
      console.log('Demo mode detected - returning demo organization');
      return {
        id: 'demo-org-1',
        name: 'Demo Company',
        slug: 'demo-company',
        industry: 'Technology',
        company_size: '50-200',
        subscription_tier: 'professional',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('organization_users')
      .select(`
        organization:organizations(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    return data?.organization || null;
  }

  // Get all users in the current user's organization
  async getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    const { data, error } = await supabase
      .from('organization_users')
      .select(`
        *,
        user:auth.users(email, raw_user_meta_data),
        role:user_roles(*),
        invited_by_user:auth.users!organization_users_invited_by_fkey(email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization users:', error);
      throw error;
    }

    return data || [];
  }

  // Get all available user roles
  async getUserRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }

    return data || [];
  }

  // Get pending invitations for organization
  async getOrganizationInvitations(organizationId: string): Promise<UserInvitation[]> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        role:user_roles(*),
        invited_by_user:auth.users!user_invitations_invited_by_fkey(email)
      `)
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization invitations:', error);
      throw error;
    }

    return data || [];
  }

  // Invite a new user to the organization
  async inviteUser(params: {
    organizationId: string;
    email: string;
    roleId: string;
    message?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user already exists in organization
      const { data: existingUser } = await supabase
        .from('organization_users')
        .select('id')
        .eq('organization_id', params.organizationId)
        .eq('user_id', user.id)
        .single();

      if (existingUser) {
        return { success: false, error: 'User already exists in organization' };
      }

      // Check for existing pending invitation
      const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('organization_id', params.organizationId)
        .eq('email', params.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvitation) {
        return { success: false, error: 'User already has a pending invitation' };
      }

      // Generate secure token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      // Create invitation
      const { error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: params.organizationId,
          email: params.email,
          role_id: params.roleId,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
          metadata: {
            message: params.message || '',
            source: 'settings_page'
          }
        });

      if (insertError) {
        console.error('Error creating invitation:', insertError);
        return { success: false, error: 'Failed to create invitation' };
      }

      // Send invitation email
      try {
        // Get role name for email
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('display_name')
          .eq('id', params.roleId)
          .single();
        
        // Get organization name
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', params.organizationId)
          .single();
        
        // Get inviter name
        const inviterName = user.user_metadata?.name || user.email?.split('@')[0] || 'Team Administrator';
        
        await EmailService.sendInvitationEmail({
          to: params.email,
          organizationName: orgData?.name || 'Your Organization',
          roleName: roleData?.display_name || 'Team Member',
          inviterName,
          invitationToken: token,
          message: params.message,
          expiresIn: '7 days'
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the invitation creation if email fails
      }

      // Log activity
      await this.logActivity({
        organizationId: params.organizationId,
        userId: user.id,
        action: 'invite_user',
        resourceType: 'user',
        details: {
          invited_email: params.email,
          role_id: params.roleId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Update user role in organization
  async updateUserRole(params: {
    organizationId: string;
    userId: string;
    roleId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('organization_users')
        .update({ 
          role_id: params.roleId,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', params.organizationId)
        .eq('user_id', params.userId);

      if (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role' };
      }

      // Log activity
      await this.logActivity({
        organizationId: params.organizationId,
        userId: user.id,
        action: 'update_user_role',
        resourceType: 'user',
        resourceId: params.userId,
        details: {
          new_role_id: params.roleId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Remove user from organization
  async removeUser(params: {
    organizationId: string;
    userId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Cannot remove self
      if (user.id === params.userId) {
        return { success: false, error: 'Cannot remove yourself from the organization' };
      }

      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('organization_id', params.organizationId)
        .eq('user_id', params.userId);

      if (error) {
        console.error('Error removing user:', error);
        return { success: false, error: 'Failed to remove user' };
      }

      // Log activity
      await this.logActivity({
        organizationId: params.organizationId,
        userId: user.id,
        action: 'remove_user',
        resourceType: 'user',
        resourceId: params.userId,
        details: {}
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing user:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Revoke user invitation
  async revokeInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Error revoking invitation:', error);
        return { success: false, error: 'Failed to revoke invitation' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error revoking invitation:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Check user permissions
  async getUserPermissions(userId: string, organizationId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          user_uuid: userId,
          org_uuid: organizationId
        });

      if (error) {
        console.error('Error getting user permissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Log activity for audit trail
  private async logActivity(params: {
    organizationId: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details: Record<string, any>;
  }): Promise<void> {
    try {
      await supabase.rpc('log_activity', {
        org_id: params.organizationId,
        user_id: params.userId,
        action_name: params.action,
        resource_type_name: params.resourceType,
        resource_id_val: params.resourceId,
        details_val: params.details
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Accept invitation (for invited users)
  async acceptInvitation(token: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            invited_organization_id: invitation.organization_id,
            invitation_token: token
          }
        }
      });

      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Add user to organization
      const { error: orgUserError } = await supabase
        .from('organization_users')
        .insert({
          organization_id: invitation.organization_id,
          user_id: authData.user.id,
          role_id: invitation.role_id,
          status: 'active',
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          joined_at: new Date().toISOString()
        });

      if (orgUserError) {
        console.error('Error adding user to organization:', orgUserError);
        return { success: false, error: 'Failed to join organization' };
      }

      // Mark invitation as accepted
      await supabase
        .from('user_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // Log activity
      await this.logActivity({
        organizationId: invitation.organization_id,
        userId: authData.user.id,
        action: 'accept_invitation',
        resourceType: 'user',
        details: {
          invitation_id: invitation.id
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export const userManagementService = new UserManagementService();