import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Standard } from '@/types';

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
    try {
      // Check cache first for performance
      const now = Date.now();
      if (StandardsService.standardsCache && 
          now - StandardsService.standardsCache.timestamp < StandardsService.CACHE_DURATION) {
        console.log('Returning cached standards data');
        return StandardsService.standardsCache.data;
      }

      console.log('Fetching fresh standards data from database');
      
      // Create a new supabase client without auth for public data
      const { createClient } = await import('@supabase/supabase-js');
      const publicSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      
      const { data, error } = await publicSupabase
        .from('standards_library')
        .select('id, name, version, type, description, created_at, updated_at')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Database query failed, falling back to mock data:', error);
        throw error;
      }

      const standards = data?.map(std => ({
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
    } catch (error) {
      console.error('Error fetching available standards:', error);
      return [];
    }
  }

  // Clear cache method for when standards are updated
  static clearCache(): void {
    StandardsService.standardsCache = null;
  }

  // Get organization's selected standards with applicability status
  async getOrganizationStandards(organizationId: string): Promise<StandardWithRequirements[]> {
    try {
      // For demo organization, use a direct query without RLS constraints
      const isDemoOrg = organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d';
      
      let query;
      if (isDemoOrg) {
        // Create a new supabase client without auth for demo organization
        const { createClient } = await import('@supabase/supabase-js');
        const publicSupabase = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
        
        query = publicSupabase
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
      } else {
        query = supabase
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
      }
      
      const { data, error } = await query;

      if (error) throw error;

      if (!data) return [];

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
      // For demo organization, use a direct query without RLS constraints
      const isDemoOrg = organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d';
      
      let supabaseClient = supabase;
      if (isDemoOrg) {
        // Create a new supabase client without auth for demo organization
        const { createClient } = await import('@supabase/supabase-js');
        supabaseClient = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
      }
      
      // Check if standards already exist for organization
      const { data: existingStandards } = await supabaseClient
        .from('organization_standards')
        .select('standard_id')
        .eq('organization_id', organizationId)
        .in('standard_id', standardIds);

      const existingIds = existingStandards?.map(s => s.standard_id) || [];
      const newStandardIds = standardIds.filter(id => !existingIds.includes(id));

      if (newStandardIds.length === 0) {
        return { success: false, error: 'Standards already added to organization' };
      }

      // Create organization standards entries
      const organizationStandards = newStandardIds.map(standardId => ({
        organization_id: organizationId,
        standard_id: standardId,
        is_applicable: true // Default to applicable
      }));

      const { error: insertError } = await supabaseClient
        .from('organization_standards')
        .insert(organizationStandards);

      if (insertError) throw insertError;

      // For each new standard, create organization_requirements entries
      for (const standardId of newStandardIds) {
        const { data: requirements } = await supabaseClient
          .from('requirements_library')
          .select('id')
          .eq('standard_id', standardId)
          .eq('is_active', true);

        if (requirements && requirements.length > 0) {
          const orgRequirements = requirements.map(req => ({
            organization_id: organizationId,
            requirement_id: req.id,
            status: 'not-started' as const
          }));

          await supabaseClient
            .from('organization_requirements')
            .insert(orgRequirements);
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
      const { error: requirementsError } = await supabase
        .from('organization_requirements')
        .delete()
        .eq('organization_id', organizationId)
        .eq('requirement_id', `(SELECT id FROM requirements_library WHERE standard_id = '${standardId}')`);

      // Note: The above query might not work with this syntax. Let's do it properly:
      
      // First get requirement IDs for this standard
      const { data: requirements } = await supabase
        .from('requirements_library')
        .select('id')
        .eq('standard_id', standardId);

      if (requirements && requirements.length > 0) {
        const requirementIds = requirements.map(req => req.id);
        
        await supabase
          .from('organization_requirements')
          .delete()
          .eq('organization_id', organizationId)
          .in('requirement_id', requirementIds);
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

  return {
    getStandards,
    addStandards,
    updateApplicability,
    removeStandard,
    getAvailableStandards
  };
};

export const standardsService = new StandardsService();