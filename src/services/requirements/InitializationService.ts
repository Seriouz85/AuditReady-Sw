import { supabase } from '@/lib/supabase';

export class RequirementInitializationService {
  /**
   * Initialize organization requirements from requirements library
   * This ensures every organization has records for all active requirements
   */
  async initializeOrganizationRequirements(organizationId: string, standardId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get all active requirements from library
      let query = supabase
        .from('requirements_library')
        .select('id, standard_id')
        .eq('is_active', true);

      if (standardId) {
        query = query.eq('standard_id', standardId);
      }

      const { data: libraryRequirements, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      if (!libraryRequirements || libraryRequirements.length === 0) {
        return { success: true }; // No requirements to initialize
      }

      // Get existing organization requirements
      const { data: existingRequirements, error: existingError } = await supabase
        .from('organization_requirements')
        .select('requirement_id')
        .eq('organization_id', organizationId);

      if (existingError) throw existingError;

      const existingIds = new Set(existingRequirements?.map(req => req.requirement_id) || []);

      // Find requirements that need to be initialized
      const requirementsToInit = libraryRequirements.filter(req => !existingIds.has(req.id));

      if (requirementsToInit.length === 0) {
        return { success: true }; // All requirements already initialized
      }

      // Create organization requirement records
      const organizationRequirements = requirementsToInit.map(req => ({
        organization_id: organizationId,
        requirement_id: req.id,
        status: 'not-fulfilled',
        fulfillment_percentage: 0,
        evidence: '',
        notes: '',
        responsible_party: '',
        tags: [],
        risk_level: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('organization_requirements')
        .insert(organizationRequirements);

      if (insertError) throw insertError;

      console.log(`Initialized ${requirementsToInit.length} requirements for organization ${organizationId}`);
      return { success: true };

    } catch (error) {
      console.error('Error initializing organization requirements:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if organization has any requirements initialized
   */
  async hasInitializedRequirements(organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('organization_requirements')
        .select('id')
        .eq('organization_id', organizationId)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking organization requirements:', error);
      return false;
    }
  }

  /**
   * Get or create demo organization for testing
   */
  async getOrCreateDemoOrganization(): Promise<{ id: string; name: string } | null> {
    try {
      // Check if demo organization exists
      const { data: existing, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('name', 'Demo Organization')
        .single();

      if (existing && !fetchError) {
        return existing;
      }

      // Create demo organization
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: 'Demo Organization',
          type: 'enterprise',
          industry: 'technology',
          size: 'medium',
          is_demo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, name')
        .single();

      if (createError) throw createError;
      return newOrg;

    } catch (error) {
      console.error('Error getting/creating demo organization:', error);
      return null;
    }
  }
}

export const requirementInitService = new RequirementInitializationService();