/**
 * Email Notification Service
 * Comprehensive email management system for SaaS platform
 */

import { supabase } from '@/lib/supabase';
import { EmailQueueItem } from '@/types/auth';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  category: EmailCategory;
  variables: TemplateVariable[];
  is_active: boolean;
  priority: EmailPriority;
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata: Record<string, any>;
}

export interface EmailNotification {
  id: string;
  template_id?: string;
  recipient_email: string;
  recipient_id?: string;
  organization_id?: string;
  subject: string;
  html_body: string;
  text_body?: string;
  status: EmailStatus;
  priority: EmailPriority;
  scheduled_for: string;
  sent_at?: string;
  failed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  provider?: EmailProvider;
  provider_message_id?: string;
  opened_at?: string;
  clicked_at?: string;
  template_data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  organization_id?: string;
  assessment_reminders: boolean;
  compliance_alerts: boolean;
  report_ready: boolean;
  team_updates: boolean;
  onboarding_emails: boolean;
  weekly_digest: boolean;
  frequency: EmailFrequency;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  unsubscribed_all: boolean;
  unsubscribe_token: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  example?: string | number | boolean | Record<string, unknown>;
}

export interface EmailAnalytics {
  date: string;
  organization_id?: string;
  template_id?: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  avg_send_time_ms?: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

export type EmailCategory = 'assessment' | 'compliance' | 'onboarding' | 'report' | 'team' | 'system';
export type EmailStatus = 'pending' | 'queued' | 'sending' | 'sent' | 'failed' | 'bounced';
export type EmailPriority = 'critical' | 'high' | 'normal' | 'low';
export type EmailFrequency = 'realtime' | 'daily' | 'weekly';
export type EmailProvider = 'sendgrid' | 'resend' | 'ses' | 'smtp' | 'supabase';

export interface SendEmailRequest {
  templateName?: string;
  templateId?: string;
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  templateData?: Record<string, any>;
  priority?: EmailPriority;
  scheduledFor?: Date;
  organizationId?: string;
  category?: EmailCategory;
}

export interface BulkEmailRequest {
  templateName: string;
  recipients: Array<{
    email: string;
    userId?: string;
    templateData?: Record<string, any>;
  }>;
  priority?: EmailPriority;
  scheduledFor?: Date;
  organizationId?: string;
}

// ============================================================================
// EMAIL NOTIFICATION SERVICE
// ============================================================================

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  private provider: EmailProvider = 'resend'; // Default provider
  private apiKey: string | null = null;
  private baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  constructor() {
    this.initializeProvider();
  }

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  private initializeProvider() {
    // Initialize email provider based on environment
    this.provider = (import.meta.env.VITE_EMAIL_PROVIDER as EmailProvider) || 'supabase';
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || 
                  import.meta.env.VITE_SENDGRID_API_KEY ||
                  import.meta.env.VITE_AWS_SES_KEY ||
                  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!this.apiKey && this.provider !== 'supabase') {
      console.warn('⚠️ No email provider API key configured. Email notifications will be logged only.');
    }
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data;
  }

  async getTemplate(nameOrId: string): Promise<EmailTemplate | null> {
    try {
      // First try by name
      let { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', nameOrId)
        .eq('is_active', true)
        .single();

      // If not found by name, try by ID (only if nameOrId looks like a UUID)
      if (error && error.code === 'PGRST116' && nameOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const result = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', nameOrId)
          .eq('is_active', true)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get template: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.error('Error in getTemplate:', err);
      return null;
    }
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to get templates: ${error.message}`);
    return data || [];
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  // ============================================================================
  // EMAIL SENDING
  // ============================================================================

  async sendEmail(request: SendEmailRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let template: EmailTemplate | null = null;

      // Get template if specified
      if (request.templateName || request.templateId) {
        template = await this.getTemplate(request.templateName || request.templateId!);
        if (!template) {
          throw new Error(`Template not found: ${request.templateName || request.templateId}`);
        }
      }

      // Prepare email content
      const subject = request.subject || (template ? this.renderTemplate(template.subject, request.templateData || {}) : 'Notification');
      const htmlBody = request.html || (template ? this.renderTemplate(template.html_body, request.templateData || {}) : '');
      const textBody = request.text || (template?.text_body ? this.renderTemplate(template.text_body, request.templateData || {}) : '');

      // Handle multiple recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to];
      const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];

      // Check user preferences before sending
      for (const recipient of recipients) {
        const canSend = await this.checkUserPreferences(recipient, request.category || 'system');
        if (!canSend) {
          console.log(`📧 Skipping email to ${recipient} due to user preferences`);
          continue;
        }

        // Create notification record
        const notification = await this.createNotificationRecord({
          template_id: template?.id,
          recipient_email: recipient,
          organization_id: request.organizationId,
          subject,
          html_body: htmlBody,
          text_body: textBody,
          priority: request.priority || template?.priority || 'normal',
          scheduled_for: request.scheduledFor || new Date(),
          template_data: request.templateData || {},
          metadata: {
            category: request.category || template?.category || 'system',
            provider: this.provider
          }
        });

        // Send email based on priority
        if (request.priority === 'critical' || template?.priority === 'critical') {
          const result = await this.sendImmediate(notification);
          results.push(result);
        } else {
          await this.addToQueue(notification);
          results.push({ success: true, messageId: `queued-${notification.id}` });
        }
      }

      // Return combined results
      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        messageId: results.map(r => r.messageId).join(','),
        error: allSuccessful ? undefined : 'Some emails failed to send'
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulkEmail(request: BulkEmailRequest): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; error?: string }> }> {
    const template = await this.getTemplate(request.templateName);
    if (!template) {
      throw new Error(`Template not found: ${request.templateName}`);
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Process recipients in batches of 100
    const batchSize = 100;
    for (let i = 0; i < request.recipients.length; i += batchSize) {
      const batch = request.recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const result = await this.sendEmail({
            templateId: template.id,
            to: recipient.email,
            templateData: recipient.templateData,
            priority: request.priority,
            scheduledFor: request.scheduledFor,
            organizationId: request.organizationId
          });

          results.push({
            email: recipient.email,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < request.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount === request.recipients.length,
      results
    };
  }

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  private async addToQueue(notification: EmailNotification): Promise<void> {
    const priority = this.getPriorityValue(notification.priority);
    
    await supabase.from('email_queue').insert([{
      notification_id: notification.id,
      priority,
      next_retry_at: notification.scheduled_for
    }]);
  }

  async processQueue(): Promise<{ processed: number; errors: number }> {
    // Get next batch of emails to process
    const { data: queueItems, error } = await supabase
      .from('email_queue')
      .select(`
        *,
        email_notifications (*)
      `)
      .is('locked_at', null)
      .lte('next_retry_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !queueItems) {
      console.error('Failed to get queue items:', error);
      return { processed: 0, errors: 1 };
    }

    let processed = 0;
    let errors = 0;

    for (const queueItem of queueItems) {
      try {
        // Lock the queue item
        await supabase
          .from('email_queue')
          .update({ 
            locked_at: new Date().toISOString(),
            locked_by: 'email-processor'
          })
          .eq('id', queueItem.id);

        // Send the email
        const result = await this.sendImmediate(queueItem.email_notifications);
        
        if (result.success) {
          // Remove from queue
          await supabase.from('email_queue').delete().eq('id', queueItem.id);
          processed++;
        } else {
          // Handle retry logic
          await this.handleRetry(queueItem, result.error);
          errors++;
        }
      } catch (error) {
        console.error(`Failed to process queue item ${queueItem.id}:`, error);
        await this.handleRetry(queueItem, error instanceof Error ? error.message : 'Unknown error');
        errors++;
      }
    }

    return { processed, errors };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    // Replace {{variable}} with actual values
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(placeholder, String(value || ''));
    });

    // Add unsubscribe link if not present
    if (!rendered.includes('{{unsubscribe_url}}') && rendered.includes('<body')) {
      const unsubscribeFooter = `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
          <p>
            You received this email because you're subscribed to notifications from AuditReady.
            <br>
            <a href="${this.baseUrl}/unsubscribe?token={{unsubscribe_token}}" style="color: #666;">Unsubscribe from these notifications</a>
          </p>
        </div>
      `;
      rendered = rendered.replace('</body>', `${unsubscribeFooter}</body>`);
    }

    return rendered;
  }

  private async createNotificationRecord(notification: Omit<EmailNotification, 'id' | 'created_at'>): Promise<EmailNotification> {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw new Error(`Failed to create notification record: ${error.message}`);
    return data;
  }

  private async sendImmediate(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Update status to sending
      await supabase
        .from('email_notifications')
        .update({ status: 'sending' })
        .eq('id', notification.id);

      // Send via configured provider
      const result = await this.sendViaProvider(notification);

      // Update notification with result
      await supabase
        .from('email_notifications')
        .update({
          status: result.success ? 'sent' : 'failed',
          sent_at: result.success ? new Date().toISOString() : undefined,
          failed_at: result.success ? undefined : new Date().toISOString(),
          provider_message_id: result.messageId,
          error_message: result.error
        })
        .eq('id', notification.id);

      // Update analytics
      if (result.success) {
        await this.updateAnalytics(notification);
      }

      return result;
    } catch (error) {
      console.error('Failed to send email immediately:', error);
      await supabase
        .from('email_notifications')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', notification.id);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendViaProvider(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      // For development/testing - just log the email
      console.log('📧 Email would be sent:', {
        to: notification.recipient_email,
        subject: notification.subject,
        provider: this.provider
      });
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    switch (this.provider) {
      case 'resend':
        return this.sendViaResend(notification);
      case 'sendgrid':
        return this.sendViaSendgrid(notification);
      case 'supabase':
        return this.sendViaSupabase(notification);
      default:
        throw new Error(`Unsupported email provider: ${this.provider}`);
    }
  }

  private async sendViaResend(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AuditReady <notifications@auditready.com>',
          to: [notification.recipient_email],
          subject: notification.subject,
          html: notification.html_body,
          text: notification.text_body
        })
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, messageId: result.id };
      } else {
        return { success: false, error: result.message || 'Failed to send via Resend' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown Resend error' };
    }
  }

  private async sendViaSendgrid(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Implementation for SendGrid
    return { success: false, error: 'SendGrid not implemented yet' };
  }

  private async sendViaSupabase(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📧 Sending email via Supabase Edge Function:', {
        to: notification.recipient_email,
        subject: notification.subject,
        hasHtml: !!notification.html_body
      });

      // Use existing Supabase Edge Function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: [{ 
            email: notification.recipient_email,
            name: notification.metadata?.recipient_name || ''
          }],
          subject: notification.subject,
          html: notification.html_body,
          text: notification.text_body,
          from: {
            email: 'notifications@auditready.com',
            name: 'AuditReady'
          },
          category: notification.metadata?.category || 'notification'
        }
      });

      if (error) {
        console.error('Supabase email error:', error);
        
        // Check if it's a demo mode response
        if (error.message?.includes('demo mode') || error.message?.includes('Demo mode')) {
          return { 
            success: true, 
            messageId: `demo-${Date.now()}`,
            error: 'Demo mode - email logged but not sent'
          };
        }
        
        return { success: false, error: error.message };
      }

      console.log('✅ Supabase email response:', data);

      // Handle demo mode response
      if (data?.demo) {
        return { 
          success: true, 
          messageId: data.messageId || `demo-${Date.now()}`,
          error: 'Demo mode - email logged but not sent'
        };
      }

      return { 
        success: data?.success || false, 
        messageId: data?.messageId || `supabase-${Date.now()}` 
      };
    } catch (error) {
      console.error('Supabase email exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown Supabase error' 
      };
    }
  }

  private getPriorityValue(priority: EmailPriority): number {
    const priorityMap = {
      'critical': 0,
      'high': 1,
      'normal': 2,
      'low': 3
    };
    return priorityMap[priority] || 2;
  }

  private async checkUserPreferences(email: string, category: string): Promise<boolean> {
    // Get user preferences
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) return true; // Send to non-users

    const { data: prefs } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!prefs || prefs.unsubscribed_all) return false;

    // Check category-specific preferences
    switch (category) {
      case 'assessment': return prefs.assessment_reminders;
      case 'compliance': return prefs.compliance_alerts;
      case 'report': return prefs.report_ready;
      case 'team': return prefs.team_updates;
      case 'onboarding': return prefs.onboarding_emails;
      default: return true;
    }
  }

  private async handleRetry(queueItem: EmailQueueItem, error: string): Promise<void> {
    const maxRetries = queueItem.email_notifications.max_retries;
    const newAttempts = queueItem.attempts + 1;

    if (newAttempts >= maxRetries) {
      // Max retries reached - remove from queue and mark as failed
      await Promise.all([
        supabase.from('email_queue').delete().eq('id', queueItem.id),
        supabase.from('email_notifications').update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_message: `Max retries reached: ${error}`,
          retry_count: newAttempts
        }).eq('id', queueItem.notification_id)
      ]);
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = Math.min(Math.pow(2, newAttempts) * 60 * 1000, 24 * 60 * 60 * 1000); // Max 24 hours
      const nextRetry = new Date(Date.now() + retryDelay);

      await supabase.from('email_queue').update({
        attempts: newAttempts,
        next_retry_at: nextRetry.toISOString(),
        locked_at: null,
        locked_by: null
      }).eq('id', queueItem.id);

      await supabase.from('email_notifications').update({
        retry_count: newAttempts,
        error_message: error
      }).eq('id', queueItem.notification_id);
    }
  }

  private async updateAnalytics(notification: EmailNotification): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        date: today,
        organization_id: notification.organization_id,
        template_id: notification.template_id,
        total_sent: 1
      }, {
        onConflict: 'date,organization_id,template_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to update analytics:', error);
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getAnalytics(organizationId?: string, dateRange?: { from: string; to: string }): Promise<EmailAnalytics[]> {
    let query = supabase
      .from('email_analytics')
      .select('*');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (dateRange) {
      query = query.gte('date', dateRange.from).lte('date', dateRange.to);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw new Error(`Failed to get analytics: ${error.message}`);

    return (data || []).map(item => ({
      ...item,
      open_rate: item.total_sent > 0 ? (item.total_opened / item.total_sent) * 100 : 0,
      click_rate: item.total_sent > 0 ? (item.total_clicked / item.total_sent) * 100 : 0,
      bounce_rate: item.total_sent > 0 ? (item.total_bounced / item.total_sent) * 100 : 0,
    }));
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  async getUserPreferences(userId: string): Promise<EmailPreferences | null> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }

    return data;
  }

  async updateUserPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to update preferences: ${error.message}`);
    return data;
  }
}

// Export singleton instance
export const emailService = EmailNotificationService.getInstance();