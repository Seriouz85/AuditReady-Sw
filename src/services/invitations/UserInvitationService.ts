import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/email/EmailService';

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  role: string;
  organization_id: string;
  invitation_token: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

export class UserInvitationService {
  /**
   * Generate a secure invitation token
   */
  private generateInvitationToken(): string {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
  }

  /**
   * Send user invitation
   */
  async sendInvitation(
    email: string,
    role: string,
    organizationId: string,
    invitedBy: string,
    name?: string
  ): Promise<{ success: boolean; invitation?: UserInvitation; error?: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Check if invitation already exists and is pending
      const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('email', email)
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        return { success: false, error: 'Invitation already sent to this email' };
      }

      // Get organization info
      const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      if (!organization) {
        return { success: false, error: 'Organization not found' };
      }

      // Get inviter info
      const { data: inviter } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', invitedBy)
        .single();

      if (!inviter) {
        return { success: false, error: 'Inviter not found' };
      }

      // Create invitation
      const invitationToken = this.generateInvitationToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data: invitation, error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          name,
          role,
          organization_id: organizationId,
          invitation_token: invitationToken,
          invited_by: invitedBy,
          invited_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send invitation email
      const emailResult = await emailService.sendInvitationEmail({
        email,
        organization_name: organization.name,
        inviter_name: inviter.name || inviter.email,
        invitation_token: invitationToken,
        role_name: this.getRoleName(role)
      });

      if (!emailResult.success) {
        // If email fails, mark invitation as failed but don't delete it
        await supabase
          .from('user_invitations')
          .update({ status: 'failed' })
          .eq('id', invitation.id);
        
        return { success: false, error: `Invitation created but email failed: ${emailResult.error}` };
      }

      return { success: true, invitation: invitation as UserInvitation };

    } catch (error) {
      console.error('Error sending invitation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation'
      };
    }
  }

  /**
   * Get role display name
   */
  private getRoleName(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'ciso': 'CISO',
      'manager': 'Manager',
      'analyst': 'Analyst',
      'auditor': 'Auditor',
      'viewer': 'Viewer'
    };

    return roleMap[role] || role;
  }

  /**
   * Demo mode: Store invitations in localStorage
   */
  sendInvitationDemo(
    email: string,
    role: string,
    name?: string
  ): { success: boolean; invitation?: UserInvitation; error?: string } {
    try {
      const demoInvitations = JSON.parse(localStorage.getItem('demoInvitations') || '[]');
      
      // Check if invitation already exists
      const existing = demoInvitations.find((inv: any) => inv.email === email && inv.status === 'pending');
      if (existing) {
        return { success: false, error: 'Invitation already sent to this email' };
      }

      const invitation: UserInvitation = {
        id: crypto.randomUUID(),
        email,
        name,
        role,
        organization_id: 'demo-org',
        invitation_token: this.generateInvitationToken(),
        invited_by: 'demo-user',
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };

      demoInvitations.push(invitation);
      localStorage.setItem('demoInvitations', JSON.stringify(demoInvitations));

      return { success: true, invitation };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation'
      };
    }
  }

  /**
   * Get demo invitations
   */
  getDemoInvitations(): UserInvitation[] {
    try {
      return JSON.parse(localStorage.getItem('demoInvitations') || '[]');
    } catch {
      return [];
    }
  }
}

export const userInvitationService = new UserInvitationService();