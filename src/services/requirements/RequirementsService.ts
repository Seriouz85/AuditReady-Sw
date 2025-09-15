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
  // Validate and log mapping issues for debugging
  private validateRequirementMappings(
    requirement: any, 
    unifiedMappings: any[], 
    methodName: string
  ): { isValid: boolean; categoryName: string | null; issues: string[] } {
    const issues: string[] = [];
    let categoryName: string | null = null;
    
    // Check if requirement has basic data
    if (!requirement?.id || !requirement?.control_id) {
      issues.push('Missing basic requirement data (id or control_id)');
      return { isValid: false, categoryName, issues };
    }
    
    // Check unified mappings structure
    if (!unifiedMappings || !Array.isArray(unifiedMappings)) {
      issues.push('unified_mappings is missing or not an array');
    } else if (unifiedMappings.length === 0) {
      issues.push('unified_mappings array is empty - requirement not mapped to any unified category');
    } else {
      // Validate mapping structure
      const mapping = unifiedMappings[0];
      if (!mapping?.unified_requirement) {
        issues.push('unified_mappings[0] missing unified_requirement reference');
      } else if (!mapping.unified_requirement.category) {
        issues.push('unified_mappings[0].unified_requirement missing category reference');
      } else if (!mapping.unified_requirement.category.name) {
        issues.push('unified_mappings[0].unified_requirement.category missing name field');
      } else {
        categoryName = mapping.unified_requirement.category.name;
      }
    }
    
    const isValid = issues.length === 0 && categoryName !== null;
    
    // Log validation results
    if (!isValid) {
      console.error(`❌ MAPPING VALIDATION FAILED [${methodName}]: ${requirement.control_id} (${requirement.standard_id})`);
      console.error(`   → Requirement ID: ${requirement.id}`);
      console.error(`   → Issues found:`, issues);
      console.error(`   → Raw unified_mappings:`, JSON.stringify(unifiedMappings, null, 2));
      console.error(`   → ACTION: This requirement needs proper database mapping in unified_requirement_mappings table`);
    } else {
      console.log(`✅ MAPPING VALID [${methodName}]: ${requirement.control_id} → "${categoryName}"`);
    }
    
    return { isValid, categoryName, issues };
  }

  // Diagnose mapping issues for a specific standard
  async diagnoseMappingIssues(standardId?: string): Promise<{
    totalRequirements: number;
    mappedRequirements: number;
    unmappedRequirements: number;
    unmappedDetails: Array<{
      id: string;
      control_id: string;
      title: string;
      standard_id: string;
      legacy_tags: string[];
    }>;
  }> {
    try {
      let query = supabase
        .from('requirements_library')
        .select(`
          id,
          control_id,
          title,
          standard_id,
          tags,
          unified_mappings:unified_requirement_mappings (
            unified_requirement:unified_requirements (
              category:unified_compliance_categories (
                name
              )
            )
          )
        `)
        .eq('is_active', true);

      if (standardId) {
        query = query.eq('standard_id', standardId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (!data) return { totalRequirements: 0, mappedRequirements: 0, unmappedRequirements: 0, unmappedDetails: [] };

      const unmappedDetails = data
        .filter((req: any) => !req.unified_mappings || req.unified_mappings.length === 0)
        .map((req: any) => ({
          id: req.id,
          control_id: req.control_id,
          title: req.title,
          standard_id: req.standard_id,
          legacy_tags: req.tags || []
        }));

      const results = {
        totalRequirements: data.length,
        mappedRequirements: data.length - unmappedDetails.length,
        unmappedRequirements: unmappedDetails.length,
        unmappedDetails
      };

      console.log('🔍 MAPPING DIAGNOSIS RESULTS:', results);
      
      if (unmappedDetails.length > 0) {
        console.warn('⚠️ UNMAPPED REQUIREMENTS FOUND:');
        unmappedDetails.forEach(req => {
          console.warn(`   - ${req.control_id} (${req.standard_id}): ${req.title}`);
          if (req.legacy_tags.length > 0) {
            console.warn(`     Legacy tags: ${req.legacy_tags.join(', ')}`);
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Error diagnosing mapping issues:', error);
      return { totalRequirements: 0, mappedRequirements: 0, unmappedRequirements: 0, unmappedDetails: [] };
    }
  }

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
        const { data: standardRequirements } = await clientToUse
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
        // Validate and normalize status value
        const validStatuses: RequirementStatus[] = ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'];
        let status: RequirementStatus = 'not-fulfilled';
        
        const orgStatus = (orgReq as any)['status'];
        if (orgStatus && validStatuses.includes(orgStatus as RequirementStatus)) {
          status = orgStatus as RequirementStatus;
        } else {
          console.warn('Invalid requirement status:', orgStatus, 'for requirement:', (orgReq as any)['requirement']?.['title']);
          // Map common variations to valid statuses
          switch (orgStatus?.toLowerCase?.()) {
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

        // Safely access requirement data
        const requirement = (orgReq as any)['requirement'];
        if (!requirement) {
          console.warn('No requirement data found for organization requirement');
          return null;
        }

        // Use validation function to check database mappings
        const unifiedMappings = requirement['unified_mappings'] || [];
        const validation = this.validateRequirementMappings(requirement, unifiedMappings, 'getOrganizationRequirements');
        
        // Get category from validation result or fallback
        let unifiedCategoryName = validation.categoryName || requirement['category'] || 'General';
        const categoryNames = validation.categoryName ? [validation.categoryName] : [];

        // Use database mappings exclusively - no hardcoded overrides
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
            finalCategories: finalCategories,
            needsDatabaseFix: !validation.isValid
          });
        }

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
        // Use validation function to check database mappings
        const unifiedMappings = (req as any)['unified_mappings'] || [];
        const validation = this.validateRequirementMappings(req, unifiedMappings, 'getStandardRequirementsWithDefaultStatus');
        
        // Get category from validation result or fallback
        let unifiedCategoryName = validation.categoryName || (req as any)['category'] || 'General';
        const categoryNames = validation.categoryName ? [validation.categoryName] : [];

        // Use database mappings exclusively - no hardcoded overrides
        let finalTags = (req as any)['tags'] || [];
        let finalCategories = categoryNames;
        
        // Handle validation failures gracefully
        if (!validation.isValid && finalCategories.length === 0) {
          console.warn(`⚠️ FALLBACK: Using 'General' category for unmapped requirement ${(req as any)['control_id']}`);
          finalCategories = ['General'];
          unifiedCategoryName = 'General';
        }

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

  const diagnoseMappingIssues = async (standardId?: string) => {
    return service.diagnoseMappingIssues(standardId);
  };

  return {
    getRequirements,
    updateRequirement,
    getStandardRequirements,
    diagnoseMappingIssues
  };
};

export const requirementsService = new RequirementsService();