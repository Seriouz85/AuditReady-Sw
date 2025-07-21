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
  // Real-time collaboration fields
  organization_requirement_id?: string;
  evidence_summary?: string;
  last_edited_by?: string;
  last_edited_at?: string;
  version?: number;
  is_locked?: boolean;
  locked_by?: string;
  locked_at?: string;
}

export interface RequirementUpdateOptions {
  optimisticUpdate?: boolean;
  skipConflictCheck?: boolean;
  expectedVersion?: number;
}

export interface ConflictResolution {
  requirementId: string;
  conflictType: 'version_mismatch' | 'concurrent_edit' | 'lock_conflict';
  localValue: any;
  remoteValue: any;
  resolution?: 'keep_local' | 'keep_remote' | 'merge';
}

export interface RequirementActivity {
  id: string;
  requirement_id: string;
  user_id: string;
  activity_type: string;
  old_value?: any;
  new_value?: any;
  description?: string;
  created_at: string;
}

export class RequirementsService {
  // Get organization's requirements with status for a specific standard
  async getOrganizationRequirements(
    organizationId: string, 
    standardId?: string
  ): Promise<RequirementWithStatus[]> {
    try {
      const isDemoOrg = organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d';
      let clientToUse = supabase;
      
      // For demo org, use main client to avoid multiple client issues
      if (isDemoOrg) {
        console.log('Using main supabase client for demo org requirements');
      }

      let query = clientToUse
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
            order_index,
            audit_ready_guidance
          )
        `)
        .eq('organization_id', organizationId);

      // If standard is specified, filter by standard
      if (standardId) {
        // First get requirement IDs for this standard
        const { data: standardRequirements } = await clientToUse
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

      const { data, error } = await query.order('created_at', { ascending: true });

      // Handle RLS infinite recursion specifically
      if (error && error.code === '42P17') {
        console.warn('RLS infinite recursion in requirements query, returning empty result for demo org');
        return [];
      }

      if (error) throw error;

      if (!data) return [];

      return data.map(orgReq => {
        // Validate and normalize status value
        const validStatuses: RequirementStatus[] = ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'];
        let status: RequirementStatus = 'not-fulfilled';
        
        if (orgReq.status && validStatuses.includes(orgReq.status as RequirementStatus)) {
          status = orgReq.status as RequirementStatus;
        } else {
          console.warn('Invalid requirement status:', orgReq.status, 'for requirement:', orgReq.requirement?.title);
          // Map common variations to valid statuses
          switch (orgReq.status?.toLowerCase()) {
            case 'complete':
            case 'completed':
            case 'done':
              status = 'fulfilled';
              break;
            case 'partial':
            case 'partially-complete':
            case 'in-progress':
              status = 'partially-fulfilled';
              break;
            case 'incomplete':
            case 'failed':
            case 'missing':
              status = 'not-fulfilled';
              break;
            case 'na':
            case 'n/a':
            case 'exempt':
              status = 'not-applicable';
              break;
            default:
              status = 'not-fulfilled';
          }
        }

        return {
          id: orgReq.requirement.id,
          code: orgReq.requirement.control_id,
          name: orgReq.requirement.title,
          description: orgReq.requirement.description,
          standardId: orgReq.requirement.standard_id,
          status,
          priority: (orgReq.requirement.priority || 'medium') as RequirementPriority,
          section: orgReq.requirement.category || 'General',
          tags: orgReq.tags || [],
          // TEMPORARY FIX: Use tags as categories if categories column doesn't exist
          categories: orgReq.categories || orgReq.tags || [],
          appliesTo: orgReq.applies_to || [], // FIX: Add applies_to from database
          organizationStatus: orgReq.status,
          fulfillmentPercentage: orgReq.fulfillment_percentage || 0,
          evidence: orgReq.evidence,
          notes: orgReq.notes,
          responsibleParty: orgReq.responsible_party,
          organizationTags: orgReq.tags || [],
          riskLevel: orgReq.risk_level,
          guidance: orgReq.implementation_guidance || '', // FIX: Add guidance from database
          lastUpdated: orgReq.updated_at,
          createdAt: orgReq.created_at || new Date().toISOString(),
          updatedAt: orgReq.updated_at || new Date().toISOString(),
          auditReadyGuidance: orgReq.requirement.audit_ready_guidance
        };
      });
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
      categories?: string[];
      appliesTo?: string[];
      riskLevel?: string;
      guidance?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use upsert to create or update
      const { error } = await supabase
        .from('organization_requirements')
        .upsert({
          organization_id: organizationId,
          requirement_id: requirementId,
          status: updates.status,
          fulfillment_percentage: updates.fulfillmentPercentage,
          evidence: updates.evidence,
          notes: updates.notes,
          responsible_party: updates.responsibleParty,
          tags: updates.tags,
          categories: updates.categories,
          applies_to: updates.appliesTo,
          risk_level: updates.riskLevel,
          implementation_guidance: updates.guidance,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,requirement_id'
        });

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

  // Create organization requirement record
  async createOrganizationRequirement(
    organizationId: string,
    requirementId: string,
    updates: {
      status?: RequirementStatus;
      fulfillmentPercentage?: number;
      evidence?: string;
      notes?: string;
      responsibleParty?: string;
      tags?: string[];
      categories?: string[];
      appliesTo?: string[];
      riskLevel?: string;
      guidance?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('organization_requirements')
        .insert({
          organization_id: organizationId,
          requirement_id: requirementId,
          status: updates.status || 'not-fulfilled',
          fulfillment_percentage: updates.fulfillmentPercentage || 0,
          evidence: updates.evidence || '',
          notes: updates.notes || '',
          responsible_party: updates.responsibleParty || '',
          tags: updates.tags || [],
          categories: updates.categories || [],
          applies_to: updates.appliesTo || [],
          risk_level: updates.riskLevel || 'medium',
          implementation_guidance: updates.guidance || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating organization requirement:', error);
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
        tags: [],
        auditReadyGuidance: req.audit_ready_guidance
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
      // Demo account now uses database too, with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      return service.getOrganizationRequirements(demoOrgId, standardId);
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
      categories?: string[];
      appliesTo?: string[];
      riskLevel?: string;
      guidance?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      // Demo account uses database with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      try {
        const result = await service.updateOrganizationRequirement(demoOrgId, requirementId, updates);
        if (!result.success && result.error?.includes('not found')) {
          // Try to create the requirement record if it doesn't exist
          return await service.createOrganizationRequirement(demoOrgId, requirementId, updates);
        }
        return result;
      } catch (error) {
        console.error('Error updating demo requirement:', error);
        return { success: false, error: 'Failed to update requirement' };
      }
    }

    if (!organization) {
      return { success: false, error: 'No organization found' };
    }

    // First try to update existing record, if not found create new one
    try {
      const result = await service.updateOrganizationRequirement(organization.id, requirementId, updates);
      if (!result.success && result.error?.includes('not found')) {
        // Try to create the requirement record if it doesn't exist
        return await service.createOrganizationRequirement(organization.id, requirementId, updates);
      }
      return result;
    } catch (error) {
      console.error('Error updating requirement:', error);
      return { success: false, error: 'Failed to update requirement' };
    }
  };

  const getStandardRequirements = async (standardId: string): Promise<Requirement[]> => {
    // Both demo and production accounts now use database
    return service.getStandardRequirements(standardId);
  };

  return {
    getRequirements,
    updateRequirement,
    getStandardRequirements
  };
};

export const requirementsService = new RequirementsService();