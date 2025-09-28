/**
 * Mock Supplier Assessment Service for Demo/Development
 * Uses mock data to simulate the supplier assessment functionality
 */

import { 
  supplierAssessmentCampaigns, 
  supplierExternalUsers, 
  supplierRequirementResponses 
} from '@/data/mockData';
import type { 
  SupplierAssessmentCampaign,
  SupplierExternalUser,
  SupplierRequirementResponse,
  CreateCampaignRequest,
  InviteSupplierRequest,
  SupplierLoginRequest,
  SupplierResponseRequest
} from '@/types/supplier-assessment';

export class MockSupplierAssessmentService {
  
  // Campaign Management
  async createCampaign(request: CreateCampaignRequest): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCampaignId = `campaign-${Date.now()}`;
      const newCampaign: SupplierAssessmentCampaign = {
        id: newCampaignId,
        organization_id: 'demo-org',
        supplier_id: request.supplier_id,
        name: request.name,
        description: request.description,
        status: 'draft',
        due_date: request.due_date,
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        risk_score: 0,
        risk_level: 'unknown',
        allow_delegation: request.settings.allow_delegation,
        require_evidence: request.settings.require_evidence,
        send_reminders: request.settings.send_reminders,
        reminder_frequency_days: request.settings.reminder_frequency_days
      };
      
      // Add to mock data (in-memory only)
      supplierAssessmentCampaigns.push(newCampaign);
      
      return { success: true, campaignId: newCampaignId };
    } catch (error) {
      console.error('Mock error creating campaign:', error);
      return { success: false, error: 'Failed to create campaign' };
    }
  }

  async getCampaigns(supplierId?: string): Promise<{ success: boolean; campaigns?: SupplierAssessmentCampaign[]; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let campaigns = [...supplierAssessmentCampaigns];
      
      if (supplierId) {
        campaigns = campaigns.filter(c => c.supplier_id === supplierId);
      }
      
      return { success: true, campaigns };
    } catch (error) {
      console.error('Mock error fetching campaigns:', error);
      return { success: false, error: 'Failed to fetch campaigns' };
    }
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const campaign = supplierAssessmentCampaigns.find(c => c.id === campaignId);
      if (campaign) {
        campaign.status = status as any;
        campaign.updated_at = new Date().toISOString();
        
        if (status === 'sent') {
          campaign.sent_at = new Date().toISOString();
        } else if (status === 'completed') {
          campaign.completed_at = new Date().toISOString();
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Mock error updating campaign status:', error);
      return { success: false, error: 'Failed to update campaign status' };
    }
  }

  // External User Management
  async inviteSupplier(request: InviteSupplierRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create mock external users
      for (const contact of request.contacts) {
        const newUser: SupplierExternalUser = {
          id: `ext-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          supplier_id: 'demo-supplier', // Will be filled from campaign
          campaign_id: request.campaign_id,
          email: contact.email,
          full_name: contact.full_name,
          title: contact.title,
          phone: contact.phone,
          role: contact.role,
          invite_token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          invite_sent_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        supplierExternalUsers.push(newUser);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Mock error inviting supplier:', error);
      return { success: false, error: 'Failed to send invitations' };
    }
  }

  async authenticateSupplier(request: SupplierLoginRequest): Promise<{ success: boolean; user?: SupplierExternalUser; sessionToken?: string; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Find user by email and invite token
      let user = supplierExternalUsers.find(u => 
        u.email === request.email && u.invite_token === request.invite_token
      );
      
      // If not found, create a demo user for testing
      if (!user && request.email === 'demo@example.com' && request.invite_token === 'demo-token') {
        user = {
          id: 'demo-ext-user',
          supplier_id: 'supplier-1',
          campaign_id: 'campaign-1',
          email: 'demo@example.com',
          full_name: 'Demo User',
          title: 'Security Manager',
          phone: '+1-555-DEMO',
          role: 'primary',
          invite_token: 'demo-token',
          invite_sent_at: '2024-12-01T10:00:00Z',
          invite_accepted_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          is_active: true,
          session_token: `session-demo-${Date.now()}`,
          session_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
          created_at: '2024-12-01T10:00:00Z',
          updated_at: new Date().toISOString()
        };
      }
      
      if (!user) {
        return { success: false, error: 'Invalid invitation link or email' };
      }
      
      // Generate session token
      const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update user with session info
      user.session_token = sessionToken;
      user.session_expires_at = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      user.last_login_at = new Date().toISOString();
      if (!user.invite_accepted_at) {
        user.invite_accepted_at = new Date().toISOString();
      }
      
      return { 
        success: true, 
        user: user,
        sessionToken 
      };
    } catch (error) {
      console.error('Mock error authenticating supplier:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async validateSession(sessionToken: string): Promise<{ success: boolean; user?: SupplierExternalUser; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const user = supplierExternalUsers.find(u => u.session_token === sessionToken);
      
      if (!user) {
        return { success: false, error: 'Invalid session' };
      }
      
      // Check session expiry
      if (user.session_expires_at && new Date(user.session_expires_at) < new Date()) {
        return { success: false, error: 'Session expired' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Mock error validating session:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }

  // Response Management
  async saveResponse(request: SupplierResponseRequest, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find existing response or create new one
      let response = supplierRequirementResponses.find(r => 
        r.campaign_id === request.campaignId && 
        r.requirement_id === request.requirementId &&
        r.supplier_user_id === userId
      );
      
      if (response) {
        // Update existing response
        response.fulfillment_level = request.fulfillmentLevel;
        response.response_text = request.responseText;
        response.evidence_description = request.evidenceDescription;
        response.confidence_level = request.confidenceLevel;
        response.updated_at = new Date().toISOString();
      } else {
        // Create new response
        const newResponse: SupplierRequirementResponse = {
          id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          campaign_id: request.campaignId,
          requirement_id: request.requirementId,
          supplier_user_id: userId,
          fulfillment_level: request.fulfillmentLevel,
          response_text: request.responseText,
          evidence_description: request.evidenceDescription,
          confidence_level: request.confidenceLevel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_draft: true
        };
        
        supplierRequirementResponses.push(newResponse);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Mock error saving response:', error);
      return { success: false, error: 'Failed to save response' };
    }
  }

  async submitResponse(campaignId: string, requirementId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const response = supplierRequirementResponses.find(r => 
        r.campaign_id === campaignId && 
        r.requirement_id === requirementId &&
        r.supplier_user_id === userId
      );
      
      if (response) {
        response.is_draft = false;
        response.submitted_at = new Date().toISOString();
        response.updated_at = new Date().toISOString();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Mock error submitting response:', error);
      return { success: false, error: 'Failed to submit response' };
    }
  }

  async getSupplierResponses(campaignId: string, userId?: string): Promise<{ success: boolean; responses?: SupplierRequirementResponse[]; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let responses = supplierRequirementResponses.filter(r => r.campaign_id === campaignId);
      
      if (userId) {
        responses = responses.filter(r => r.supplier_user_id === userId);
      }
      
      return { success: true, responses };
    } catch (error) {
      console.error('Mock error fetching responses:', error);
      return { success: false, error: 'Failed to fetch responses' };
    }
  }

  // Risk Calculation (Mock implementation)
  async calculateRiskScore(campaignId: string): Promise<{ success: boolean; riskScore?: number; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock risk calculation based on campaign responses
      const responses = supplierRequirementResponses.filter(r => r.campaign_id === campaignId && !r.is_draft);
      
      if (responses.length === 0) {
        return { success: true, riskScore: 0 };
      }
      
      let totalScore = 0;
      responses.forEach(response => {
        switch (response.fulfillment_level) {
          case 'fulfilled':
            totalScore += 100;
            break;
          case 'partially_fulfilled':
            totalScore += 60;
            break;
          case 'in_progress':
            totalScore += 40;
            break;
          case 'not_fulfilled':
            totalScore += 0;
            break;
          case 'not_applicable':
            // Don't count
            break;
        }
      });
      
      const avgScore = totalScore / responses.length;
      const riskScore = Math.round(100 - avgScore); // Invert to make it a risk score
      
      // Update campaign with new risk score
      const campaign = supplierAssessmentCampaigns.find(c => c.id === campaignId);
      if (campaign) {
        campaign.risk_score = riskScore;
        campaign.risk_level = riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
        campaign.last_calculated_at = new Date().toISOString();
      }
      
      return { success: true, riskScore };
    } catch (error) {
      console.error('Mock error calculating risk score:', error);
      return { success: false, error: 'Failed to calculate risk score' };
    }
  }
}

export const mockSupplierAssessmentService = new MockSupplierAssessmentService();