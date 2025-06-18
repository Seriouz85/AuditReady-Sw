import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Requirement, RequirementStatus, RequirementPriority } from '@/types';
// Removed mock data import to fix duplicate key warnings

export interface OrganizationRequirement {
  id: string;
  organization_id: string;
  requirement_id: string;
  status: string;
  fulfillment_percentage: number;
  evidence?: string;
  notes?: string;
  responsible_party?: string;
  tags?: string[];
  risk_level?: string;
  updated_at: string;
  requirement?: {
    id: string;
    standard_id: string;
    control_id: string;
    title: string;
    description: string;
    category?: string;
    priority?: string;
    order_index: number;
  };
}

export interface RequirementWithStatus extends Requirement {
  organizationStatus?: string;
  fulfillmentPercentage?: number;
  evidence?: string;
  notes?: string;
  responsibleParty?: string;
  organizationTags?: string[];
  riskLevel?: string;
  lastUpdated?: string;
}

export class RequirementsService {
  // Get organization's requirements with status for a specific standard
  async getOrganizationRequirements(
    organizationId: string, 
    standardId?: string
  ): Promise<RequirementWithStatus[]> {
    try {
      let query = supabase
        .from('organization_requirements')
        .select(`
          *,
          requirement:requirements_library (
            id,
            standard_id,
            control_id,
            title,
            description,
            category,
            priority,
            order_index
          )
        `)
        .eq('organization_id', organizationId);

      // If standard is specified, filter by standard
      if (standardId) {
        // First get requirement IDs for this standard
        const { data: standardRequirements } = await supabase
          .from('requirements_library')
          .select('id')
          .eq('standard_id', standardId);

        if (standardRequirements && standardRequirements.length > 0) {
          const requirementIds = standardRequirements.map(req => req.id);
          query = query.in('requirement_id', requirementIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('requirement.order_index');

      if (error) throw error;

      if (!data) return [];

      return data.map(orgReq => ({
        id: orgReq.requirement.id,
        code: orgReq.requirement.control_id,
        name: orgReq.requirement.title,
        description: orgReq.requirement.description,
        standardId: orgReq.requirement.standard_id,
        status: orgReq.status as RequirementStatus,
        priority: (orgReq.requirement.priority || 'medium') as RequirementPriority,
        section: orgReq.requirement.category || 'General',
        tags: orgReq.tags || [],
        organizationStatus: orgReq.status,
        fulfillmentPercentage: orgReq.fulfillment_percentage || 0,
        evidence: orgReq.evidence,
        notes: orgReq.notes,
        responsibleParty: orgReq.responsible_party,
        organizationTags: orgReq.tags || [],
        riskLevel: orgReq.risk_level,
        lastUpdated: orgReq.updated_at,
        createdAt: orgReq.created_at || new Date().toISOString(),
        updatedAt: orgReq.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching organization requirements:', error);
      return [];
    }
  }

  // Update organization requirement status and details
  async updateOrganizationRequirement(
    organizationId: string,
    requirementId: string,
    updates: {
      status?: RequirementStatus;
      fulfillmentPercentage?: number;
      evidence?: string;
      notes?: string;
      responsibleParty?: string;
      tags?: string[];
      riskLevel?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('organization_requirements')
        .update({
          status: updates.status,
          fulfillment_percentage: updates.fulfillmentPercentage,
          evidence: updates.evidence,
          notes: updates.notes,
          responsible_party: updates.responsibleParty,
          tags: updates.tags,
          risk_level: updates.riskLevel,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating organization requirement:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get all requirements for a standard (from library)
  async getStandardRequirements(standardId: string): Promise<Requirement[]> {
    try {
      const { data, error } = await supabase
        .from('requirements_library')
        .select('*')
        .eq('standard_id', standardId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      return data?.map(req => ({
        id: req.id,
        code: req.control_id,
        name: req.title,
        description: req.description,
        standardId: req.standard_id,
        status: 'not-fulfilled' as any, // Default status
        priority: (req.priority || 'medium') as any,
        section: req.category || 'General',
        tags: []
      })) || [];
    } catch (error) {
      console.error('Error fetching standard requirements:', error);
      return [];
    }
  }
}

// Hook to use requirements service with auth context
export const useRequirementsService = () => {
  const { organization, isDemo } = useAuth();
  
  const service = new RequirementsService();

  const getRequirements = async (standardId?: string): Promise<RequirementWithStatus[]> => {
    if (isDemo) {
      // Load demo data dynamically to avoid import issues
      const { requirements: mockRequirements } = await import('@/data/mockData');
      
      // Return demo data filtered by standard if specified
      let filteredRequirements = mockRequirements;
      
      if (standardId) {
        filteredRequirements = mockRequirements.filter(req => req.standardId === standardId);
      }
      
      // Get saved requirement updates from localStorage
      const savedUpdates = localStorage.getItem('requirementUpdates');
      const updates = savedUpdates ? JSON.parse(savedUpdates) : {};
      
      return filteredRequirements.map(req => ({
        ...req,
        organizationStatus: updates[req.id]?.status || req.status,
        fulfillmentPercentage: updates[req.id]?.fulfillmentPercentage || 0,
        evidence: updates[req.id]?.evidence || '',
        notes: updates[req.id]?.notes || '',
        responsibleParty: updates[req.id]?.responsibleParty || '',
        organizationTags: updates[req.id]?.tags || req.tags || [],
        riskLevel: updates[req.id]?.riskLevel || 'medium',
        lastUpdated: updates[req.id]?.lastUpdated || new Date().toISOString()
      }));
    }

    if (!organization) {
      throw new Error('No organization found');
    }

    return service.getOrganizationRequirements(organization.id, standardId);
  };

  const updateRequirement = async (
    requirementId: string,
    updates: {
      status?: string;
      fulfillmentPercentage?: number;
      evidence?: string;
      notes?: string;
      responsibleParty?: string;
      tags?: string[];
      riskLevel?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      // Handle demo mode - update localStorage
      const savedUpdates = localStorage.getItem('requirementUpdates');
      const currentUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
      
      currentUpdates[requirementId] = {
        ...currentUpdates[requirementId],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('requirementUpdates', JSON.stringify(currentUpdates));
      return { success: true };
    }

    if (!organization) {
      return { success: false, error: 'No organization found' };
    }

    return service.updateOrganizationRequirement(organization.id, requirementId, updates);
  };

  const getStandardRequirements = async (standardId: string): Promise<Requirement[]> => {
    if (isDemo) {
      // Load demo data dynamically to avoid import issues
      const { requirements: mockRequirements } = await import('@/data/mockData');
      return mockRequirements.filter(req => req.standardId === standardId);
    }

    return service.getStandardRequirements(standardId);
  };

  return {
    getRequirements,
    updateRequirement,
    getStandardRequirements
  };
};

export const requirementsService = new RequirementsService();