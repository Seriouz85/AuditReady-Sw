/**
 * Supplier Assessment Service
 * Manages the complete supplier assessment workflow including campaign creation,
 * external user management, and risk calculation
 */

import { supabase } from '@/lib/supabase';
import type { 
  SupplierAssessmentCampaign, 
  SupplierExternalUser,
  SupplierRequirementResponse,
  SupplierRiskFactor,
  SupplierEmailTemplate as EmailTemplate
} from '@/types/supplier-assessment';

export interface CreateCampaignRequest {
  supplierId: string;
  name: string;
  description?: string;
  standardIds: string[];
  requirementIds: string[];
  dueDate?: string;
  settings: {
    allowDelegation: boolean;
    requireEvidence: boolean;
    sendReminders: boolean;
    reminderFrequencyDays: number;
  };
}

export interface InviteSupplierRequest {
  campaignId: string;
  contacts: {
    email: string;
    fullName: string;
    title?: string;
    phone?: string;
    role: 'primary' | 'contributor' | 'viewer';
  }[];
  customMessage?: string;
}

export interface SupplierLoginRequest {
  email: string;
  inviteToken: string;
}

export interface SupplierResponseRequest {
  campaignId: string;
  requirementId: string;
  fulfillmentLevel: 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'not_applicable' | 'in_progress';
  responseText?: string;
  evidenceDescription?: string;
  confidenceLevel?: number;
}

export class SupplierAssessmentService {
  
  // Campaign Management
  async createCampaign(request: CreateCampaignRequest): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('supplier_assessment_campaigns')
        .insert({
          supplier_id: request.supplierId,
          name: request.name,
          description: request.description,
          due_date: request.dueDate,
          created_by: user.user.id,
          allow_delegation: request.settings.allowDelegation,
          require_evidence: request.settings.requireEvidence,
          send_reminders: request.settings.sendReminders,
          reminder_frequency_days: request.settings.reminderFrequencyDays,
        })
        .select()
        .single();

      if (campaignError) {
        return { success: false, error: campaignError.message };
      }

      // Add standards to campaign
      const standardInserts = request.standardIds.map(standardId => ({
        campaign_id: campaign.id,
        standard_id: standardId,
      }));

      const { error: standardsError } = await supabase
        .from('supplier_assessment_standards')
        .insert(standardInserts);

      if (standardsError) {
        return { success: false, error: standardsError.message };
      }

      // Add requirements to campaign
      const requirementInserts = request.requirementIds.map(requirementId => {
        // Find which standard this requirement belongs to
        const standardId = request.standardIds.find(stdId => 
          // This would need to be looked up from requirements table
          true // placeholder
        );
        
        return {
          campaign_id: campaign.id,
          requirement_id: requirementId,
          standard_id: standardId || request.standardIds[0], // fallback
          is_mandatory: true,
          weight: 1.0,
        };
      });

      const { error: requirementsError } = await supabase
        .from('supplier_assessment_requirements')
        .insert(requirementInserts);

      if (requirementsError) {
        return { success: false, error: requirementsError.message };
      }

      // Log activity
      await this.logActivity(campaign.id, null, 'campaign_created', 'Assessment campaign created');

      return { success: true, campaignId: campaign.id };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, error: 'Failed to create campaign' };
    }
  }

  async getCampaigns(supplierId?: string): Promise<{ success: boolean; campaigns?: SupplierAssessmentCampaign[]; error?: string }> {
    try {
      let query = supabase
        .from('supplier_assessment_campaigns')
        .select(`
          *,
          supplier:suppliers(*),
          standards:supplier_assessment_standards(
            standard:standards(*)
          ),
          requirements:supplier_assessment_requirements(
            requirement:requirements(*)
          ),
          external_users:supplier_external_users(*),
          responses:supplier_requirement_responses(*)
        `);

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data: campaigns, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, campaigns: campaigns || [] };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { success: false, error: 'Failed to fetch campaigns' };
    }
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('supplier_assessment_campaigns')
        .update({ 
          status,
          ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}),
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq('id', campaignId);

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logActivity(campaignId, null, 'status_changed', `Campaign status changed to ${status}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating campaign status:', error);
      return { success: false, error: 'Failed to update campaign status' };
    }
  }

  // External User Management
  async inviteSupplier(request: InviteSupplierRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const inviteTokens = request.contacts.map(contact => ({
        supplier_id: '', // Will be filled from campaign
        campaign_id: request.campaignId,
        email: contact.email,
        full_name: contact.fullName,
        title: contact.title,
        phone: contact.phone,
        role: contact.role,
        invite_token: this.generateInviteToken(),
        invite_sent_at: new Date().toISOString(),
      }));

      // Get supplier_id from campaign
      const { data: campaign } = await supabase
        .from('supplier_assessment_campaigns')
        .select('supplier_id')
        .eq('id', request.campaignId)
        .single();

      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      // Add supplier_id to invite tokens
      const inviteInserts = inviteTokens.map(token => ({
        ...token,
        supplier_id: campaign.supplier_id,
      }));

      const { data: externalUsers, error } = await supabase
        .from('supplier_external_users')
        .insert(inviteInserts)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      // Send invitation emails (integrate with your email service)
      for (const user of externalUsers || []) {
        await this.sendInvitationEmail(user, request.customMessage);
      }

      await this.logActivity(request.campaignId, null, 'invitations_sent', `Invitations sent to ${request.contacts.length} contacts`);
      return { success: true };
    } catch (error) {
      console.error('Error inviting supplier:', error);
      return { success: false, error: 'Failed to send invitations' };
    }
  }

  async authenticateSupplier(request: SupplierLoginRequest): Promise<{ success: boolean; user?: SupplierExternalUser; sessionToken?: string; error?: string }> {
    try {
      // Find user by email and invite token
      const { data: user, error } = await supabase
        .from('supplier_external_users')
        .select(`
          *,
          campaign:supplier_assessment_campaigns(*),
          supplier:suppliers(*)
        `)
        .eq('email', request.email)
        .eq('invite_token', request.inviteToken)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid invitation link or email' };
      }

      // Check if campaign is still active
      if (user.campaign.status === 'cancelled' || user.campaign.status === 'expired') {
        return { success: false, error: 'This assessment is no longer active' };
      }

      // Generate session token
      const sessionToken = this.generateSessionToken();
      const sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

      // Update user with session info
      const { error: updateError } = await supabase
        .from('supplier_external_users')
        .update({
          session_token: sessionToken,
          session_expires_at: sessionExpiry.toISOString(),
          last_login_at: new Date().toISOString(),
          invite_accepted_at: user.invite_accepted_at || new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await this.logActivity(user.campaign_id, user.id, 'user_login', 'External user logged in');

      return { 
        success: true, 
        user: user,
        sessionToken 
      };
    } catch (error) {
      console.error('Error authenticating supplier:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async validateSession(sessionToken: string): Promise<{ success: boolean; user?: SupplierExternalUser; error?: string }> {
    try {
      const { data: user, error } = await supabase
        .from('supplier_external_users')
        .select(`
          *,
          campaign:supplier_assessment_campaigns(*),
          supplier:suppliers(*)
        `)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid session' };
      }

      // Check session expiry
      if (new Date(user.session_expires_at) < new Date()) {
        return { success: false, error: 'Session expired' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error validating session:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }

  // Response Management
  async saveResponse(request: SupplierResponseRequest, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('supplier_requirement_responses')
        .upsert({
          campaign_id: request.campaignId,
          requirement_id: request.requirementId,
          supplier_user_id: userId,
          fulfillment_level: request.fulfillmentLevel,
          response_text: request.responseText,
          evidence_description: request.evidenceDescription,
          confidence_level: request.confidenceLevel,
          is_draft: true,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logActivity(request.campaignId, userId, 'response_saved', `Response saved for requirement ${request.requirementId}`);
      return { success: true };
    } catch (error) {
      console.error('Error saving response:', error);
      return { success: false, error: 'Failed to save response' };
    }
  }

  async submitResponse(campaignId: string, requirementId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('supplier_requirement_responses')
        .update({
          is_draft: false,
          submitted_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('requirement_id', requirementId)
        .eq('supplier_user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Recalculate risk score
      await this.calculateRiskScore(campaignId);

      await this.logActivity(campaignId, userId, 'response_submitted', `Response submitted for requirement ${requirementId}`);
      return { success: true };
    } catch (error) {
      console.error('Error submitting response:', error);
      return { success: false, error: 'Failed to submit response' };
    }
  }

  async getSupplierResponses(campaignId: string, userId?: string): Promise<{ success: boolean; responses?: SupplierRequirementResponse[]; error?: string }> {
    try {
      let query = supabase
        .from('supplier_requirement_responses')
        .select(`
          *,
          requirement:requirements(*),
          evidence_files:supplier_evidence_files(*)
        `)
        .eq('campaign_id', campaignId);

      if (userId) {
        query = query.eq('supplier_user_id', userId);
      }

      const { data: responses, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, responses: responses || [] };
    } catch (error) {
      console.error('Error fetching responses:', error);
      return { success: false, error: 'Failed to fetch responses' };
    }
  }

  // Risk Calculation
  async calculateRiskScore(campaignId: string): Promise<{ success: boolean; riskScore?: number; error?: string }> {
    try {
      // Call the database function
      const { data, error } = await supabase
        .rpc('calculate_supplier_risk_score', { campaign_uuid: campaignId });

      if (error) {
        return { success: false, error: error.message };
      }

      const riskScore = data as number;

      // Update campaign with new risk score
      const { error: updateError } = await supabase
        .from('supplier_assessment_campaigns')
        .update({ 
          risk_score: riskScore,
          last_calculated_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, riskScore };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return { success: false, error: 'Failed to calculate risk score' };
    }
  }

  async getRiskFactors(campaignId: string): Promise<{ success: boolean; factors?: SupplierRiskFactor[]; error?: string }> {
    try {
      const { data: factors, error } = await supabase
        .from('supplier_risk_factors')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('calculated_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, factors: factors || [] };
    } catch (error) {
      console.error('Error fetching risk factors:', error);
      return { success: false, error: 'Failed to fetch risk factors' };
    }
  }

  // Email Management
  async sendInvitationEmail(user: SupplierExternalUser, customMessage?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get email template
      const { data: template } = await supabase
        .from('supplier_email_templates')
        .select('*')
        .eq('template_type', 'invitation')
        .eq('is_default', true)
        .single();

      if (!template) {
        return { success: false, error: 'Email template not found' };
      }

      // Generate assessment link
      const assessmentLink = `${window.location.origin}/supplier-portal?token=${user.invite_token}&email=${encodeURIComponent(user.email)}`;

      // Replace template variables
      const subject = this.replaceTemplateVariables(template.subject, user, { assessmentLink, customMessage });
      const body = this.replaceTemplateVariables(template.body_html, user, { assessmentLink, customMessage });

      // Schedule notification
      const { error } = await supabase
        .from('supplier_notifications')
        .insert({
          campaign_id: user.campaign_id,
          notification_type: 'invitation',
          recipient_email: user.email,
          subject,
          body,
          scheduled_for: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error: 'Failed to send invitation email' };
    }
  }

  // Utility Methods
  private generateInviteToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(64)))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private replaceTemplateVariables(template: string, user: SupplierExternalUser, extra: Record<string, string | undefined>): string {
    return template
      .replace(/\{\{supplier_contact_name\}\}/g, user.full_name)
      .replace(/\{\{supplier_name\}\}/g, user.supplier?.name || 'Unknown')
      .replace(/\{\{organization_name\}\}/g, 'Audit Readiness Hub') // Get from org
      .replace(/\{\{assessment_link\}\}/g, extra.assessmentLink || '#')
      .replace(/\{\{custom_message\}\}/g, extra.customMessage || '')
      .replace(/\{\{due_date\}\}/g, user.campaign?.due_date ? new Date(user.campaign.due_date).toLocaleDateString() : 'TBD');
  }

  private async logActivity(campaignId: string, userId: string | null, activityType: string, description: string): Promise<void> {
    try {
      await supabase
        .from('supplier_assessment_activities')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          activity_type: activityType,
          description,
          metadata: {},
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const supplierAssessmentService = new SupplierAssessmentService();