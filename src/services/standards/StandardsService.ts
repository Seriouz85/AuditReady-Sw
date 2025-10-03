import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Standard } from '@/types';
import { TagInitializationService } from '@/services/initialization/TagInitializationService';
import { unifiedApiClient } from '@/lib/api/UnifiedApiClient';
import { createQueryBuilder } from '@/lib/api/SupabaseQueryBuilder';
import { ApiResponse } from '@/lib/api/types';

export interface OrganizationStandard {
  id: string;
  organization_id: string;
  standard_id: string;
  is_applicable: boolean;
  added_at: string;
  updated_at: string;
  standard?: {
    id: string;
    name: string;
    version: string;
    type: string;
    description: string;
    category: string;
    requirement_count: number;
  };
}

export interface StandardWithRequirements extends Standard {
  requirementCount: number;
  isApplicable: boolean;
  addedAt: string;
}

export class StandardsService {
  // Cache for standards to improve performance
  private static standardsCache: { data: Standard[]; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get all available standards from the library (admin-managed)
  async getAvailableStandards(): Promise<Standard[]> {
    console.log('Getting available standards from library');
    
    // Check cache first for performance
    const now = Date.now();
    if (StandardsService.standardsCache && 
        now - StandardsService.standardsCache.timestamp < StandardsService.CACHE_DURATION) {
      console.log('Returning cached standards data');
      return StandardsService.standardsCache.data;
    }

    console.log('Fetching fresh standards data from database');
    
    // Use unified API client for standardized error handling
    const response = await createQueryBuilder<Standard>('standards_library')
      .select('id, name, version, type, description, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .execute();

    console.log('Standards library query result:', response);

    if (!response.success) {
      console.error('Database query failed:', response.error);
      return [];
    }

    const standards = response.data?.map(std => ({
      id: std.id,
      name: std.name,
      version: std.version,
      type: std.type as any,
      description: std.description || '',
      category: 'General', // Default category since column doesn't exist
      requirements: [], // Will be populated separately
      createdAt: std.created_at,
      updatedAt: std.updated_at
    })) || [];

    // Cache the results for future use
    StandardsService.standardsCache = {
      data: standards,
      timestamp: now
    };

    return standards;
  }

  // Clear cache method for when standards are updated
  static clearCache(): void {
    StandardsService.standardsCache = null;
  }

  // Get organization's selected standards with applicability status
  async getOrganizationStandards(organizationId: string): Promise<StandardWithRequirements[]> {
    try {
      console.log('Getting organization standards for:', organizationId);
      const isDemoOrg = organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d';
      console.log('Is demo org:', isDemoOrg);
      
      // For demo organization, try multiple approaches to handle RLS issues
      if (isDemoOrg) {
        // First, try to get standards directly using main client
        try {
          const { data: anonData, error: anonError } = await supabase
            .from('organization_standards')
            .select(`
              *,
              standard:standards_library (
                id,
                name,
                version,
                type,
                description
              )
            `)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

          if (!anonError && anonData) {
            console.log('Demo standards loaded via anon client:', anonData.length);
            const data = anonData;
            // Process the data normally
            if (!data) return [];
            
            console.log('Organization standards found:', data.length);

            // Get requirement counts for each standard
            const standardsWithCounts = await Promise.all(
              data.map(async (orgStd) => {
                const { count } = await supabase
                  .from('requirements_library')
                  .select('id', { count: 'exact', head: true })
                  .eq('standard_id', orgStd.standard_id);

                return {
                  id: orgStd.standard.id,
                  name: orgStd.standard.name,
                  version: orgStd.standard.version,
                  type: orgStd.standard.type as any,
                  description: orgStd.standard.description || '',
                  category: 'General',
                  requirements: [],
                  requirementCount: count || 0,
                  isApplicable: orgStd.is_applicable,
                  addedAt: orgStd.added_at,
                  createdAt: orgStd.added_at,
                  updatedAt: orgStd.updated_at
                };
              })
            );

            return standardsWithCounts;
          }
        } catch (anonError) {
          console.warn('Anon client failed for demo org, trying regular client:', anonError);
        }
      }
      
      // Fallback to regular client for both demo and production
      const query = supabase
        .from('organization_standards')
        .select(`
          *,
          standard:standards_library (
            id,
            name,
            version,
            type,
            description
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;

      console.log('Query result:', { data, error });

      // Handle RLS infinite recursion specifically
      if (error && error.code === '42P17') {
        console.warn('RLS infinite recursion detected, demo org may need manual standards setup');
        return [];
      }

      if (error) throw error;

      if (!data) return [];
      
      console.log('Organization standards found:', data.length);

      // Get requirement counts for each standard
      const standardsWithCounts = await Promise.all(
        data.map(async (orgStd) => {
          const { count } = await supabase
            .from('requirements_library')
            .select('id', { count: 'exact', head: true })
            .eq('standard_id', orgStd.standard_id);

          return {
            id: orgStd.standard.id,
            name: orgStd.standard.name,
            version: orgStd.standard.version,
            type: orgStd.standard.type as any,
            description: orgStd.standard.description || '',
            category: 'General', // Standards don't have categories, only requirements do
            requirements: [], // Will be populated when needed
            requirementCount: count || 0,
            isApplicable: orgStd.is_applicable,
            addedAt: orgStd.added_at,
            createdAt: orgStd.added_at,
            updatedAt: orgStd.updated_at
          };
        })
      );

      return standardsWithCounts;
    } catch (error) {
      console.error('Error fetching organization standards:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  // Add standards to organization
  async addStandardsToOrganization(
    organizationId: string, 
    standardIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isDemoOrg = organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d';
      let clientToUse = supabase;
      
      // For demo org, use main supabase client
      if (isDemoOrg) {
        console.log('Using main supabase client for demo org operations');
      }
      
      // Check if standards already exist for organization
      const { data: existingStandards, error: checkError } = await clientToUse
        .from('organization_standards')
        .select('standard_id')
        .eq('organization_id', organizationId)
        .in('standard_id', standardIds);

      // Handle RLS infinite recursion in check query
      if (checkError && checkError.code === '42P17') {
        console.warn('RLS recursion in standards check, proceeding with caution');
        // For demo org with RLS issues, assume no existing standards and proceed
        if (isDemoOrg) {
          const organizationStandards = standardIds.map(standardId => ({
            organization_id: organizationId,
            standard_id: standardId,
            is_applicable: false
          }));

          const { error: insertError } = await clientToUse
            .from('organization_standards')
            .insert(organizationStandards);

          if (insertError && insertError.code === '42P17') {
            return { success: false, error: 'RLS configuration issue preventing standard addition. Please contact support.' };
          }

          if (insertError) throw insertError;
          return { success: true };
        }
        return { success: false, error: 'Unable to check existing standards due to access policies' };
      }

      if (checkError) throw checkError;

      const existingIds = existingStandards?.map(s => s.standard_id) || [];
      const newStandardIds = standardIds.filter(id => !existingIds.includes(id));

      if (newStandardIds.length === 0) {
        return { success: false, error: 'Standards already added to organization' };
      }

      // Create organization standards entries
      const organizationStandards = newStandardIds.map(standardId => ({
        organization_id: organizationId,
        standard_id: standardId,
        is_applicable: false // Default to not applicable - organizations can browse requirements without committing
      }));

      const { error: insertError } = await clientToUse
        .from('organization_standards')
        .insert(organizationStandards);

      // Handle RLS infinite recursion in insert
      if (insertError && insertError.code === '42P17') {
        return { success: false, error: 'RLS configuration issue preventing standard addition. Please contact support.' };
      }

      if (insertError) throw insertError;

      // Initialize unified category tags before adding requirements
      await TagInitializationService.initializeUnifiedCategoryTags();

      // For each new standard, create organization_requirements entries
      for (const standardId of newStandardIds) {
        const { data: requirements } = await clientToUse
          .from('requirements_library')
          .select('id')
          .eq('standard_id', standardId)
          .eq('is_active', true);

        if (requirements && requirements.length > 0) {
          // Create organization requirements without tags first
          const orgRequirements = requirements.map(req => ({
            organization_id: organizationId,
            requirement_id: req.id,
            status: 'not-fulfilled' as const // Use the default initial status
          }));

          const { error: reqInsertError } = await clientToUse
            .from('organization_requirements')
            .insert(orgRequirements);

          // Handle RLS issues in requirements insert
          if (reqInsertError && reqInsertError.code === '42P17') {
            console.warn('RLS issue with requirements insert for demo org');
            // For demo org, this is acceptable - standards added but requirements may need manual setup
            if (!isDemoOrg) {
              throw reqInsertError;
            }
          } else if (reqInsertError) {
            throw reqInsertError;
          }

          // Now apply unified category tags to the newly created requirements
          console.log(`Processing unified category tags for ${requirements.length} requirements from standard ${standardId}`);
          for (const req of requirements) {
            try {
              const unifiedCategoryTags = await TagInitializationService.getUnifiedCategoryTagsForRequirement(req.id);
              
              if (unifiedCategoryTags.length > 0) {
                await clientToUse
                  .from('organization_requirements')
                  .update({ tags: unifiedCategoryTags })
                  .eq('organization_id', organizationId)
                  .eq('requirement_id', req.id);
                
                console.log(`Applied ${unifiedCategoryTags.length} unified category tags to requirement ${req.id}`);
              } else {
                console.log(`No unified category mappings found for requirement ${req.id}`);
              }
            } catch (tagError) {
              console.warn(`Failed to apply unified category tags to requirement ${req.id}:`, tagError);
              // Continue processing other requirements even if one fails
            }
          }

          console.log(`Processed unified category tagging for ${requirements.length} requirements from standard ${standardId}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding standards to organization:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Update standard applicability
  async updateStandardApplicability(
    organizationId: string,
    standardId: string,
    isApplicable: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('organization_standards')
        .update({ 
          is_applicable: isApplicable,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('standard_id', standardId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating standard applicability:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // 🔒 SECURITY FIX (Issue #16): Check for dependencies before deletion
  async checkStandardDependencies(standardId: string): Promise<{
    hasAssessments: boolean;
    hasRequirements: boolean;
    assessmentCount: number;
    requirementCount: number;
  }> {
    try {
      // Check for assessments using this standard
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .contains('standard_ids', [standardId]);

      if (assessmentError) {
        console.error('Error checking assessments:', assessmentError);
      }

      // Check for requirements linked to this standard
      const { count: requirementCount, error: requirementError } = await supabase
        .from('requirements_library')
        .select('id', { count: 'exact', head: true })
        .eq('standard_id', standardId)
        .eq('is_active', true);

      if (requirementError) {
        console.error('Error checking requirements:', requirementError);
      }

      return {
        hasAssessments: (assessmentCount || 0) > 0,
        hasRequirements: (requirementCount || 0) > 0,
        assessmentCount: assessmentCount || 0,
        requirementCount: requirementCount || 0
      };
    } catch (error) {
      console.error('Error checking standard dependencies:', error);
      // Return safe defaults - assume dependencies exist to prevent accidental deletion
      return {
        hasAssessments: true,
        hasRequirements: true,
        assessmentCount: 0,
        requirementCount: 0
      };
    }
  }

  // Remove standard from organization
  async removeStandardFromOrganization(
    organizationId: string,
    standardId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove organization standards entry
      const { error: standardError } = await supabase
        .from('organization_standards')
        .delete()
        .eq('organization_id', organizationId)
        .eq('standard_id', standardId);

      if (standardError) throw standardError;

      // Remove associated organization requirements
      // First get requirement IDs for this standard using parameterized query
      const { data: requirements } = await supabase
        .from('requirements_library')
        .select('id')
        .eq('standard_id', standardId);

      if (requirements && requirements.length > 0) {
        const requirementIds = requirements.map(req => req.id);
        
        const { error: requirementsError } = await supabase
          .from('organization_requirements')
          .delete()
          .eq('organization_id', organizationId)
          .in('requirement_id', requirementIds);
          
        if (requirementsError) {
          console.warn('Error removing organization requirements:', requirementsError);
          // Continue execution - this is not a critical failure
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing standard from organization:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get standards applicable for SoA generation
  async getApplicableStandards(organizationId: string): Promise<StandardWithRequirements[]> {
    try {
      const allStandards = await this.getOrganizationStandards(organizationId);
      return allStandards.filter(std => std.isApplicable);
    } catch (error) {
      console.error('Error fetching applicable standards:', error);
      return [];
    }
  }
}

// Hook to use standards service with auth context
export const useStandardsService = () => {
  const { organization, isDemo } = useAuth();
  
  const service = new StandardsService();

  const getStandards = async (): Promise<StandardWithRequirements[]> => {
    if (isDemo) {
      // Demo account now uses database with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      return service.getOrganizationStandards(demoOrgId);
    }

    if (!organization) {
      throw new Error('No organization found');
    }

    return service.getOrganizationStandards(organization.id);
  };

  const addStandards = async (standardIds: string[]): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      // Demo account uses database with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      return service.addStandardsToOrganization(demoOrgId, standardIds);
    }

    if (!organization) {
      return { success: false, error: 'No organization found' };
    }

    return service.addStandardsToOrganization(organization.id, standardIds);
  };

  const updateApplicability = async (standardId: string, isApplicable: boolean): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      // Demo account uses database with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      return service.updateStandardApplicability(demoOrgId, standardId, isApplicable);
    }

    if (!organization) {
      return { success: false, error: 'No organization found' };
    }

    return service.updateStandardApplicability(organization.id, standardId, isApplicable);
  };

  const removeStandard = async (standardId: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      // Demo account uses database with real demo organization ID
      const demoOrgId = '34adc4bb-d1e7-43bd-8249-89c76520533d'; // Real demo org ID from database
      return service.removeStandardFromOrganization(demoOrgId, standardId);
    }

    if (!organization) {
      return { success: false, error: 'No organization found' };
    }

    return service.removeStandardFromOrganization(organization.id, standardId);
  };

  const getAvailableStandards = async (): Promise<Standard[]> => {
    // Both demo and production accounts now use database
    return service.getAvailableStandards();
  };

  const checkStandardDependencies = async (standardId: string) => {
    // 🔒 SECURITY FIX (Issue #16): Check dependencies before deletion
    return service.checkStandardDependencies(standardId);
  };

  return {
    getStandards,
    addStandards,
    updateApplicability,
    removeStandard,
    getAvailableStandards,
    checkStandardDependencies
  };
};

export const standardsService = new StandardsService();