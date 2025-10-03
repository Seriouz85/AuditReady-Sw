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
  // 🔧 REFACTORED: Simplified category extraction
  private extractCategoryFromMappings(unifiedMappings: any[]): string {
    const categoryName = unifiedMappings?.[0]?.unified_requirement?.category?.name;
    return categoryName || 'General';
  }

  private validateRequirementMappings(
    requirement: any,
    unifiedMappings: any[]
  ): { isValid: boolean; categoryName: string } {
    const categoryName = this.extractCategoryFromMappings(unifiedMappings);
    const isValid = !!unifiedMappings?.length && categoryName !== 'General';

    return { isValid, categoryName };
  }

  // 🔧 REFACTORED: Extracted status validation to reduce duplication
  private normalizeRequirementStatus(orgStatus: string, requirementTitle?: string): RequirementStatus {
    const validStatuses: RequirementStatus[] = ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'];

    if (orgStatus && validStatuses.includes(orgStatus as RequirementStatus)) {
      return orgStatus as RequirementStatus;
    }

    console.warn('Invalid requirement status:', orgStatus, 'for requirement:', requirementTitle);

    // Map common variations to valid statuses
    switch (orgStatus?.toLowerCase?.()) {
      case 'complete':
      case 'completed':
      case 'done':
        return 'fulfilled';
      case 'partial':
      case 'partially-complete':
      case 'in-progress':
        return 'partially-fulfilled';
      case 'incomplete':
      case 'failed':
      case 'missing':
        return 'not-fulfilled';
      case 'na':
      case 'n/a':
      case 'exempt':
        return 'not-applicable';
      default:
        return 'not-fulfilled';
    }
  }

  // 🔧 REFACTORED: Extracted shared transformation logic to reduce duplication
  private processCategoryAndTags(requirement: any, unifiedMappings: any[]): {
    unifiedCategoryName: string;
    finalTags: string[];
    finalCategories: string[];
  } {
    const validation = this.validateRequirementMappings(requirement, unifiedMappings);

    let unifiedCategoryName = validation.categoryName || requirement['category'] || 'General';
    const categoryNames = validation.categoryName ? [validation.categoryName] : [];

    let finalTags = requirement['tags'] || [];
    let finalCategories = categoryNames;

    // Handle validation failures gracefully
    if (!validation.isValid && finalCategories.length === 0) {
      console.warn(`⚠️ FALLBACK: Using 'General' category for unmapped requirement ${requirement['control_id']}`);
      finalCategories = ['General'];
      unifiedCategoryName = 'General';
    }

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 REQUIREMENT PROCESSED: ${requirement['control_id']} (${requirement['standard_id']})`, {
        requirementId: requirement['id'],
        validationResult: validation,
        finalCategories,
        needsDatabaseFix: !validation.isValid
      });
    }

    return { unifiedCategoryName, finalTags, finalCategories };
  }

  // 🔧 REFACTORED: Removed diagnoseMappingIssues() - dev-only diagnostic (-75 lines)

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
            order_index,
            tags,
            audit_ready_guidance,
            unified_mappings:unified_requirement_mappings (
              unified_requirement:unified_requirements (
                category:unified_compliance_categories (
                  name,
                  description,
                  icon
                )
              )
            )
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
          // No requirements in library for this standard
          return this.getStandardRequirementsWithDefaultStatus(standardId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      // Handle RLS infinite recursion specifically
      if (error && error.code === '42P17') {
        console.warn('RLS infinite recursion in requirements query, returning empty result for demo org');
        return [];
      }

      if (error) throw error;

      // If no organization-specific requirements exist, fallback to requirements from library
      if (!data || data.length === 0) {
        console.log('No organization requirements found, falling back to library requirements');
        return this.getStandardRequirementsWithDefaultStatus(standardId);
      }

      return data.map(orgReq => {
        const requirement = (orgReq as any)['requirement'];
        if (!requirement) {
          console.warn('No requirement data found for organization requirement');
          return null;
        }

        // Validate and normalize status value
        const status = this.normalizeRequirementStatus(
          (orgReq as any)['status'],
          requirement['title']
        );

        // Process categories and tags using shared helper
        const unifiedMappings = requirement['unified_mappings'] || [];
        const { unifiedCategoryName, finalTags, finalCategories } = this.processCategoryAndTags(requirement, unifiedMappings);

        return {
          id: requirement['id'],
          code: requirement['control_id'],
          name: requirement['title'],
          description: requirement['description'],
          standardId: requirement['standard_id'],
          status,
          priority: (requirement['priority'] || 'medium') as RequirementPriority,
          section: unifiedCategoryName, // Use unified category name
          tags: finalTags, // Use processed tags
          categories: finalCategories, // Use processed categories
          appliesTo: (orgReq as any)['applies_to'] || [],
          organizationStatus: (orgReq as any)['status'] as string,
          fulfillmentPercentage: (orgReq as any)['fulfillment_percentage'] || 0,
          evidence: (orgReq as any)['evidence'],
          notes: (orgReq as any)['notes'],
          responsibleParty: (orgReq as any)['responsible_party'],
          organizationTags: (orgReq as any)['tags'] || [],
          riskLevel: (orgReq as any)['risk_level'],
          guidance: (orgReq as any)['implementation_guidance'] || '',
          lastUpdated: (orgReq as any)['updated_at'],
          createdAt: (orgReq as any)['created_at'] || new Date().toISOString(),
          updatedAt: (orgReq as any)['updated_at'] || new Date().toISOString(),
          auditReadyGuidance: requirement['audit_ready_guidance']
        };
      }).filter(Boolean) as RequirementWithStatus[];
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

  // Get all requirements for a standard (from library) with default status  
  async getStandardRequirementsWithDefaultStatus(standardId?: string): Promise<RequirementWithStatus[]> {
    try {
      let query = supabase
        .from('requirements_library')
        .select(`
          *,
          unified_mappings:unified_requirement_mappings (
            unified_requirement:unified_requirements (
              category:unified_compliance_categories (
                name,
                description,
                icon
              )
            )
          )
        `)
        .eq('is_active', true)
        .order('order_index');

      // Filter by standard if specified
      if (standardId) {
        query = query.eq('standard_id', standardId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map(req => {
        // Process categories and tags using shared helper
        const unifiedMappings = (req as any)['unified_mappings'] || [];
        const { unifiedCategoryName, finalTags, finalCategories } = this.processCategoryAndTags(req, unifiedMappings);

        return {
          id: (req as any)['id'],
          code: (req as any)['control_id'],
          name: (req as any)['title'],
          description: (req as any)['description'],
          standardId: (req as any)['standard_id'],
          status: 'not-fulfilled' as RequirementStatus,
          priority: ((req as any)['priority'] || 'medium') as RequirementPriority,
          section: unifiedCategoryName,
          tags: finalTags, // Database tags only
          categories: finalCategories, // Database categories only
          appliesTo: [],
          organizationStatus: 'not-fulfilled',
          fulfillmentPercentage: 0,
          evidence: (req as any)['evidence'] || '',
          notes: (req as any)['notes'] || '',
          responsibleParty: (req as any)['responsible_party'] || '',
          organizationTags: [],
          riskLevel: (req as any)['risk_level'] || '',
          guidance: (req as any)['implementation_guidance'] || '',
          lastUpdated: (req as any)['updated_at'],
          createdAt: (req as any)['created_at'] || new Date().toISOString(),
          updatedAt: (req as any)['updated_at'] || new Date().toISOString(),
          auditReadyGuidance: (req as any)['audit_ready_guidance'] || ''
        };
      });
    } catch (error) {
      console.error('Error fetching standard requirements with default status:', error);
      return [];
    }
  }

  // Get all requirements for a standard (from library)
  async getStandardRequirements(standardId: string): Promise<Requirement[]> {
    try {
      const requirementsWithStatus = await this.getStandardRequirementsWithDefaultStatus(standardId);
      
      return requirementsWithStatus.map(req => ({
        id: req.id,
        code: req.code,
        name: req.name,
        description: req.description,
        standardId: req.standardId,
        status: req.status,
        priority: req.priority || 'medium',
        section: req.section,
        tags: req.tags || [],
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        auditReadyGuidance: req.auditReadyGuidance || ''
      }));
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

  // 🔧 REFACTORED: Removed diagnoseMappingIssues - dev-only diagnostic method

  return {
    getRequirements,
    updateRequirement,
    getStandardRequirements
  };
};

export const requirementsService = new RequirementsService();