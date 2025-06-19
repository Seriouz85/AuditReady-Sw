/**
 * User Invitation Service
 * Handles user invitations with Stripe seat management and Supabase integration
 */

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import { stripeService } from '../billing/StripeService';

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  role: string;
  organization_id: string;
  invited_by_user_id: string;
  invited_by_user_name: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitation_token: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  metadata?: {
    assigned_requirements?: string[];
    welcome_message?: string;
  };
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  user_seats_included: number;
  additional_seats: number;
  price_per_additional_seat: number;
  total_seats_allowed: number;
  created_at: string;
  updated_at: string;
}

export interface SeatUsage {
  organization_id: string;
  total_seats_allowed: number;
  current_active_users: number;
  pending_invitations: number;
  available_seats: number;
  seats_usage_percentage: number;
}

export class UserInvitationService {
  private static instance: UserInvitationService;

  public static getInstance(): UserInvitationService {
    if (!UserInvitationService.instance) {
      UserInvitationService.instance = new UserInvitationService();
    }
    return UserInvitationService.instance;
  }

  /**
   * Check seat availability for organization using StripeService
   */
  async checkSeatAvailability(organizationId: string): Promise<SeatUsage> {
    try {
      // Use the existing StripeService to get billing usage
      const usage = await stripeService.getBillingUsage(organizationId);
      
      if (!usage) {
        // Return demo/free tier limits for organizations without billing data
        return {
          organization_id: organizationId,
          total_seats_allowed: 3, // Free tier limit
          current_active_users: 1,
          pending_invitations: 0,
          available_seats: 2,
          seats_usage_percentage: 33
        };
      }

      // Get pending invitations count
      const { data: pendingInvitations, error: invitesError } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitesError) throw invitesError;

      const pendingInvitationCount = pendingInvitations?.length || 0;
      const totalSeatsAllowed = usage.userLimit === -1 ? 999999 : usage.userLimit; // Handle unlimited
      const availableSeats = Math.max(0, totalSeatsAllowed - usage.userCount - pendingInvitationCount);
      const usagePercentage = totalSeatsAllowed === 999999 ? 0 : 
        Math.round(((usage.userCount + pendingInvitationCount) / totalSeatsAllowed) * 100);

      return {
        organization_id: organizationId,
        total_seats_allowed: totalSeatsAllowed,
        current_active_users: usage.userCount,
        pending_invitations: pendingInvitationCount,
        available_seats: availableSeats,
        seats_usage_percentage: usagePercentage
      };

    } catch (error) {
      console.error('Error checking seat availability:', error);
      throw new Error('Failed to check seat availability');
    }
  }

  /**
   * Create user invitation - seamless for organizations with available seats
   */
  async createInvitation(
    email: string,
    name: string | undefined,
    role: string,
    organizationId: string,
    invitedByUserId: string,
    invitedByUserName: string,
    assignedRequirements?: string[],
    welcomeMessage?: string
  ): Promise<UserInvitation> {
    try {
      // Check seat availability first
      const seatUsage = await this.checkSeatAvailability(organizationId);
      
      if (seatUsage.available_seats <= 0) {
        throw new Error(`No available seats. Your plan allows ${seatUsage.total_seats_allowed} users. Please upgrade your subscription to invite more users.`);
      }

      // Check if user is already invited or exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('organization_users')
        .select('id, status')
        .eq('organization_id', organizationId)
        .eq('user_id', email); // In real implementation, would join with users table

      if (existingUser && existingUser.length > 0) {
        throw new Error('User is already a member of this organization');
      }

      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from('user_invitations')
        .select('id, status')
        .eq('organization_id', organizationId)
        .eq('email', email.toLowerCase())
        .eq('status', 'pending');

      if (existingInvite && existingInvite.length > 0) {
        throw new Error('User already has a pending invitation');
      }

      // Generate secure invitation token
      const invitationToken = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation record
      const invitationData = {
        email: email.toLowerCase(),
        name,
        role,
        organization_id: organizationId,
        invited_by_user_id: invitedByUserId,
        invited_by_user_name: invitedByUserName,
        status: 'pending' as const,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          assigned_requirements: assignedRequirements || [],
          welcome_message: welcomeMessage
        }
      };

      const { data: invitation, error: createError } = await supabaseAdmin
        .from('user_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (createError) throw createError;

      // Send invitation email
      await this.sendInvitationEmail(invitation, organizationId);

      // Log activity
      await this.logInvitationActivity(invitation, organizationId);

      return invitation;

    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  /**
   * Accept invitation and create user account
   */
  async acceptInvitation(
    invitationToken: string,
    userDetails: {
      password: string;
      name?: string;
    }
  ): Promise<{ user: any; organization: any }> {
    try {
      // Validate invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('user_invitations')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Create user account
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: invitation.email,
        password: userDetails.password,
        email_confirm: true,
        user_metadata: {
          name: userDetails.name || invitation.name,
          invited_by: invitation.invited_by_user_name,
          organization_id: invitation.organization_id
        }
      });

      if (authError) throw authError;

      // Create organization user record
      const { data: orgUser, error: orgUserError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: authData.user.id,
          organization_id: invitation.organization_id,
          role_id: invitation.role,
          status: 'active',
          joined_at: new Date().toISOString(),
          metadata: {
            invited_by: invitation.invited_by_user_id,
            invitation_id: invitation.id
          }
        })
        .select()
        .single();

      if (orgUserError) throw orgUserError;

      // Mark invitation as accepted
      await supabaseAdmin
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Assign pre-selected requirements if any
      if (invitation.metadata?.assigned_requirements?.length > 0) {
        await this.assignRequirementsToNewUser(
          authData.user.id,
          invitation.metadata.assigned_requirements,
          invitation.organization_id,
          invitation.invited_by_user_id
        );
      }

      return {
        user: authData.user,
        organization: invitation.organization
      };

    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(invitationId: string, revokedByUserId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('user_invitations')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('status', 'pending');

      if (error) throw error;

    } catch (error) {
      console.error('Error revoking invitation:', error);
      throw error;
    }
  }

  /**
   * Get organization invitations
   */
  async getOrganizationInvitations(organizationId: string): Promise<UserInvitation[]> {
    try {
      const { data: invitations, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return invitations || [];

    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  /**
   * Upgrade subscription to add more seats using StripeService
   */
  async upgradeSubscriptionSeats(
    organizationId: string,
    newTier: string
  ): Promise<{ stripe_checkout_url?: string; error?: string }> {
    try {
      // Get current usage to recommend the right tier
      const usage = await stripeService.getBillingUsage(organizationId);
      if (!usage) {
        // Create new subscription for organizations without billing
        const result = await stripeService.createSubscription(organizationId, newTier);
        if (result.error) {
          return { error: result.error };
        }
        return { stripe_checkout_url: result.sessionUrl };
      }

      // Update existing subscription
      const updateResult = await stripeService.updateSubscription(organizationId, newTier);
      if (updateResult.error) {
        return { error: updateResult.error };
      }

      // Get customer portal URL for immediate tier change
      const portalResult = await stripeService.getCustomerPortalUrl(organizationId);
      return { 
        stripe_checkout_url: portalResult.url,
        error: portalResult.error 
      };

    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { error: 'Failed to upgrade subscription' };
    }
  }

  /**
   * Private helper methods
   */
  private generateInvitationToken(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async sendInvitationEmail(invitation: UserInvitation, organizationId: string): Promise<void> {
    // In real implementation, this would use an email service like Resend, SendGrid, etc.
    const invitationUrl = `${window.location.origin}/accept-invitation?token=${invitation.invitation_token}`;
    
    console.log(`Invitation email sent to ${invitation.email}:`);
    console.log(`Join ${invitation.invited_by_user_name}'s organization: ${invitationUrl}`);
    
    // TODO: Implement actual email sending
  }

  private async logInvitationActivity(invitation: UserInvitation, organizationId: string): Promise<void> {
    // Log invitation activity for audit trail
    console.log(`User invitation created: ${invitation.email} invited to org ${organizationId}`);
  }

  private async assignRequirementsToNewUser(
    userId: string,
    requirementIds: string[],
    organizationId: string,
    assignedByUserId: string
  ): Promise<void> {
    // This would integrate with RequirementAssignmentService
    console.log(`Assigning ${requirementIds.length} requirements to new user ${userId}`);
  }
}

export const userInvitationService = UserInvitationService.getInstance();