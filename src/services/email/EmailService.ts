import { supabase } from '@/lib/supabase';

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  substitutions?: Record<string, string>;
}

export class EmailService {
  private baseUrl: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.fromEmail = 'noreply@auditready.com';
    this.fromName = 'AuditReady Platform';
  }

  // Send email via Supabase Edge Function
  private async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    template: EmailTemplate,
    category?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipients,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          category,
        },
      });

      if (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
      }

      // Log email sent
      await this.logEmailSent(recipients, template.subject, category);

      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('Email service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  // Log email activity
  private async logEmailSent(
    recipients: EmailRecipient[],
    subject: string,
    category?: string
  ) {
    try {
      await supabase.from('enhanced_audit_logs').insert({
        action: 'email_sent',
        resource_type: 'email',
        actor_type: 'system',
        details: {
          recipients: recipients.map(r => r.email),
          subject,
          category,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to log email activity:', error);
    }
  }

  // User invitation email
  async sendInvitationEmail(
    invitation: {
      email: string;
      organization_name: string;
      inviter_name: string;
      invitation_token: string;
      role_name: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const inviteUrl = `${window.location.origin}/invite/${invitation.invitation_token}`;
    
    const template: EmailTemplate = {
      subject: `You've been invited to join ${invitation.organization_name} on AuditReady`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AuditReady</h1>
            </div>
            <div class="content">
              <h2>You're invited!</h2>
              <p>Hi there,</p>
              <p>${invitation.inviter_name} has invited you to join <strong>${invitation.organization_name}</strong> on AuditReady as a <strong>${invitation.role_name}</strong>.</p>
              <p>AuditReady is a comprehensive compliance management platform that helps organizations streamline their audit readiness and compliance processes.</p>
              <p>Click the button below to accept your invitation and create your account:</p>
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </div>
              <p style="color: #666; font-size: 14px;">This invitation link will expire in 7 days. If you have any questions, please contact ${invitation.inviter_name} or our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 AuditReady. All rights reserved.</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
You've been invited to join ${invitation.organization_name} on AuditReady

Hi there,

${invitation.inviter_name} has invited you to join ${invitation.organization_name} on AuditReady as a ${invitation.role_name}.

Accept your invitation here: ${inviteUrl}

This invitation link will expire in 7 days.

© 2025 AuditReady. All rights reserved.
      `.trim(),
    };

    return this.sendEmail(
      { email: invitation.email },
      template,
      'user_invitation'
    );
  }

  // Password reset email
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${window.location.origin}/reset-password/${resetToken}`;
    
    const template: EmailTemplate = {
      subject: 'Reset your AuditReady password',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>
              <p>We received a request to reset your AuditReady password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.</p>
              <p style="color: #666; font-size: 14px;">For security reasons, we recommend:</p>
              <ul style="color: #666; font-size: 14px;">
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication</li>
                <li>Not sharing your password with anyone</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2025 AuditReady. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail(
      { email, name: userName },
      template,
      'password_reset'
    );
  }

  // Welcome email for new users
  async sendWelcomeEmail(
    user: {
      email: string;
      name: string;
      organization_name: string;
      role: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const template: EmailTemplate = {
      subject: 'Welcome to AuditReady!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .feature { padding: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AuditReady!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>Welcome to <strong>${user.organization_name}</strong>'s AuditReady workspace! You've been added as a <strong>${user.role}</strong>.</p>
              
              <h3>Here's what you can do with AuditReady:</h3>
              <div class="feature">✓ Track compliance across multiple frameworks (ISO 27001, CIS Controls, GDPR, and more)</div>
              <div class="feature">✓ Manage requirements and evidence in one centralized platform</div>
              <div class="feature">✓ Generate comprehensive compliance reports</div>
              <div class="feature">✓ Collaborate with your team on compliance activities</div>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <h3>Getting Started:</h3>
              <ol>
                <li>Complete your profile setup</li>
                <li>Review your assigned requirements</li>
                <li>Upload evidence for compliance controls</li>
                <li>Track your organization's compliance progress</li>
              </ol>
              
              <p>If you have any questions, our support team is here to help at support@auditready.com</p>
            </div>
            <div class="footer">
              <p>© 2025 AuditReady. All rights reserved.</p>
              <p>You're receiving this because you recently joined AuditReady.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail(
      { email: user.email, name: user.name },
      template,
      'welcome'
    );
  }

  // Compliance alert email
  async sendComplianceAlert(
    recipients: EmailRecipient[],
    alert: {
      type: 'requirement_due' | 'assessment_expired' | 'evidence_missing';
      title: string;
      description: string;
      action_url: string;
      action_text: string;
      severity: 'low' | 'medium' | 'high';
    }
  ): Promise<{ success: boolean; error?: string }> {
    const severityColor = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
    };

    const template: EmailTemplate = {
      subject: `[${alert.severity.toUpperCase()}] Compliance Alert: ${alert.title}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${severityColor[alert.severity]}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert-box { border-left: 4px solid ${severityColor[alert.severity]}; padding: 15px; background-color: white; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Compliance Alert</h1>
              <p style="margin: 0;">Severity: ${alert.severity.toUpperCase()}</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2 style="margin-top: 0;">${alert.title}</h2>
                <p>${alert.description}</p>
              </div>
              
              <p>This alert requires your immediate attention to maintain compliance with your organization's requirements.</p>
              
              <div style="text-align: center;">
                <a href="${alert.action_url}" class="button">${alert.action_text}</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">You're receiving this alert because you're responsible for compliance activities in your organization. To manage your notification preferences, visit your account settings.</p>
            </div>
            <div class="footer">
              <p>© 2025 AuditReady. All rights reserved.</p>
              <p>This is an automated compliance notification.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail(recipients, template, 'compliance_alert');
  }

  // Test email configuration
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
    const template: EmailTemplate = {
      subject: 'AuditReady Email Configuration Test',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .success { color: #22c55e; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Configuration Test</h1>
            </div>
            <div class="content">
              <p class="success">✓ Email configuration is working correctly!</p>
              <p>This test email confirms that your AuditReady platform can successfully send emails.</p>
              <p><strong>Configuration Details:</strong></p>
              <ul>
                <li>From: ${this.fromName} &lt;${this.fromEmail}&gt;</li>
                <li>To: ${toEmail}</li>
                <li>Timestamp: ${new Date().toISOString()}</li>
              </ul>
              <p>Your email service is properly configured and ready for production use.</p>
            </div>
            <div class="footer">
              <p>© 2025 AuditReady. All rights reserved.</p>
              <p>This is a test email from your AuditReady platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail({ email: toEmail }, template, 'test');
  }
}

export const emailService = new EmailService();