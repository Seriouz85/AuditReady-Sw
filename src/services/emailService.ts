import { supabase } from '@/lib/supabase';

export interface EmailData {
  to: string;
  type: 'welcome' | 'invitation' | 'password_reset' | 'credentials';
  data: Record<string, any>;
}

export class EmailService {
  /**
   * Send welcome email to new user after successful registration
   */
  static async sendWelcomeEmail({
    to,
    userName,
    organizationName,
    role = 'Administrator'
  }: {
    to: string;
    userName?: string;
    organizationName?: string;
    role?: string;
  }) {
    return this.sendEmail({
      to,
      type: 'welcome',
      data: {
        email: to,
        userName,
        organizationName,
        role
      }
    });
  }

  /**
   * Send invitation email to new team member
   */
  static async sendInvitationEmail({
    to,
    organizationName,
    roleName,
    inviterName,
    invitationToken,
    message,
    expiresIn = '7 days'
  }: {
    to: string;
    organizationName: string;
    roleName: string;
    inviterName?: string;
    invitationToken: string;
    message?: string;
    expiresIn?: string;
  }) {
    return this.sendEmail({
      to,
      type: 'invitation',
      data: {
        organizationName,
        roleName,
        inviterName,
        invitationToken,
        message,
        expiresIn
      }
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail({
    to,
    resetLink
  }: {
    to: string;
    resetLink: string;
  }) {
    return this.sendEmail({
      to,
      type: 'password_reset',
      data: {
        resetLink
      }
    });
  }

  /**
   * Send credentials email after successful payment
   */
  static async sendCredentialsEmail({
    to,
    organizationName,
    planName
  }: {
    to: string;
    organizationName: string;
    planName: string;
  }) {
    return this.sendEmail({
      to,
      type: 'credentials',
      data: {
        email: to,
        organizationName,
        planName
      }
    });
  }

  /**
   * Generic email sending method using Supabase Edge Function
   */
  private static async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Send bulk emails (for announcements, etc.)
   */
  static async sendBulkEmails(emails: EmailData[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        success++;
      } else {
        failed++;
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.error || 'Unknown error';
        errors.push(`Email ${index + 1}: ${error}`);
      }
    });

    return { success, failed, errors };
  }
}

// Convenience functions for common email types
export const sendWelcomeEmail = EmailService.sendWelcomeEmail.bind(EmailService);
export const sendInvitationEmail = EmailService.sendInvitationEmail.bind(EmailService);
export const sendPasswordResetEmail = EmailService.sendPasswordResetEmail.bind(EmailService);
export const sendCredentialsEmail = EmailService.sendCredentialsEmail.bind(EmailService);