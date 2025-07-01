import { supabase } from '@/lib/supabase';
import { complianceEngine } from './ComplianceUnificationEngine';
import { complianceCacheService } from './ComplianceCacheService';
import { intelligentMappingService } from './IntelligentMappingService';

export interface UnifiedRequirement {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  subRequirements: string[];
  sortOrder: number;
}

export interface UnifiedCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  icon?: string;
  requirements?: UnifiedRequirement[];
}

export interface UnifiedRequirementMapping {
  id: string;
  unifiedRequirementId: string;
  requirementId: string;
  mappingStrength: 'exact' | 'strong' | 'partial' | 'related';
  notes?: string;
  requirement?: {
    id: string;
    code: string;
    title: string;
    description: string;
    standard: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface ComplianceMappingData {
  id: string;
  category: string;
  auditReadyUnified: {
    title: string;
    description: string;
    subRequirements: string[];
  };
  frameworks: {
    [key: string]: Array<{
      code: string;
      title: string;
      description: string;
    }>;
  };
}

class ComplianceUnificationService {
  /**
   * Get unified compliance categories with their requirements
   */
  async getUnifiedCategories(): Promise<UnifiedCategory[]> {
    try {
      // Check cache first
      const cacheKey = 'unified_categories';
      const cached = complianceCacheService.get<UnifiedCategory[]>(cacheKey, {
        storage: 'memory',
        ttl: 10 * 60 * 1000 // 10 minutes
      });
      
      if (cached) {
        return cached;
      }

      const { data: categories, error } = await supabase
        .from('unified_compliance_categories')
        .select(`
          id,
          name,
          description,
          sort_order,
          icon,
          requirements:unified_requirements(
            id,
            category_id,
            title,
            description,
            sub_requirements,
            sort_order
          )
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedCategories = (categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sort_order,
        icon: cat.icon,
        requirements: (cat.requirements || []).map((req: any) => ({
          id: req.id,
          categoryId: req.category_id,
          title: req.title,
          description: req.description,
          subRequirements: req.sub_requirements,
          sortOrder: req.sort_order
        }))
      }));

      // Cache the result
      complianceCacheService.set(cacheKey, transformedCategories, {
        storage: 'memory',
        ttl: 10 * 60 * 1000 // 10 minutes
      });

      return transformedCategories;
    } catch (error) {
      console.error('Error fetching unified categories:', error);
      throw error;
    }
  }

  /**
   * Get mappings for unified requirements to framework-specific requirements
   */
  async getUnifiedRequirementMappings(unifiedRequirementIds: string[]): Promise<UnifiedRequirementMapping[]> {
    try {
      const { data: mappings, error } = await supabase
        .from('unified_requirement_mappings')
        .select(`
          id,
          unified_requirement_id,
          requirement_id,
          mapping_strength,
          notes,
          requirement:requirements_library(
            id,
            requirement_code,
            title,
            official_description,
            standard:standards_library(
              id,
              name,
              code
            )
          )
        `)
        .in('unified_requirement_id', unifiedRequirementIds);

      if (error) throw error;
      
      return (mappings || []).map(mapping => ({
        id: mapping.id,
        unifiedRequirementId: mapping.unified_requirement_id,
        requirementId: mapping.requirement_id,
        mappingStrength: mapping.mapping_strength,
        notes: mapping.notes,
        requirement: mapping.requirement ? {
          id: mapping.requirement.id,
          code: mapping.requirement.requirement_code,
          title: mapping.requirement.title,
          description: mapping.requirement.official_description,
          standard: mapping.requirement.standard
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching unified requirement mappings:', error);
      throw error;
    }
  }

  /**
   * Get compliance mapping data in the format expected by ComplianceSimplification page
   * Enhanced with AI-powered unification engine
   */
  async getComplianceMappingData(selectedFrameworks: string[]): Promise<ComplianceMappingData[]> {
    try {
      // Temporarily disable cache for debugging
      const cacheKey = `compliance_mapping_${selectedFrameworks.sort().join('_')}`;
      // Clear any existing cache
      complianceCacheService.remove(cacheKey, 'memory');
      
      console.log('Fetching fresh compliance mapping data for frameworks:', selectedFrameworks);

      // Get all unified categories with requirements
      const categories = await this.getUnifiedCategories();
      console.log('Found unified categories:', categories.length);
      
      // Get framework requirements based on category keywords
      const frameworkRequirements = await this.getFrameworkRequirementsByCategories(categories, selectedFrameworks);
      console.log('Framework requirements:', Object.keys(frameworkRequirements).length, 'categories mapped');
      
      const result: ComplianceMappingData[] = [];
      
      for (const category of categories) {
        // Create one entry per category (not per requirement) as the original design expected
        const categoryFrameworks = frameworkRequirements[category.name] || {};
        
        // Get the first requirement for this category (the current design expects one requirement per category)
        const primaryRequirement = category.requirements?.[0];
        
        if (primaryRequirement) {
          // Create some mock framework requirements for testing if none are found
          const mockFrameworkRequirements = {
            iso27001: selectedFrameworks.includes('iso27001') ? (categoryFrameworks.iso27001?.length > 0 ? categoryFrameworks.iso27001 : [
              { code: `A.${category.sortOrder}.1`, title: `ISO 27001 Control for ${category.name}`, description: `Sample ISO 27001 control for ${category.name}` },
              { code: `A.${category.sortOrder}.2`, title: `ISO 27001 Security Control`, description: `Additional ISO 27001 requirement` }
            ]) : [],
            iso27002: selectedFrameworks.includes('iso27002') ? (categoryFrameworks.iso27002?.length > 0 ? categoryFrameworks.iso27002 : [
              { code: `${category.sortOrder}.1`, title: `ISO 27002 Control for ${category.name}`, description: `Sample ISO 27002 control for ${category.name}` },
              { code: `${category.sortOrder}.2`, title: `ISO 27002 Implementation Guide`, description: `Additional ISO 27002 guidance` }
            ]) : [],
            cisControls: selectedFrameworks.includes('cisControls') ? (categoryFrameworks.cisControls?.length > 0 ? categoryFrameworks.cisControls : [
              { code: `${category.sortOrder}.1`, title: `CIS Control for ${category.name}`, description: `Sample CIS Control for ${category.name}` },
              { code: `${category.sortOrder}.2`, title: `CIS Security Practice`, description: `Additional CIS control requirement` }
            ]) : [],
            nis2: selectedFrameworks.includes('nis2') ? (categoryFrameworks.nis2?.length > 0 ? categoryFrameworks.nis2 : [
              { code: `Art. ${category.sortOrder}`, title: `NIS2 Article for ${category.name}`, description: `Sample NIS2 article for ${category.name}` }
            ]) : [],
            gdpr: selectedFrameworks.includes('gdpr') ? (categoryFrameworks.gdpr?.length > 0 ? categoryFrameworks.gdpr : [
              { code: `Art. ${20 + category.sortOrder}`, title: `GDPR Article for ${category.name}`, description: `Sample GDPR article for ${category.name}` }
            ]) : []
          };

          result.push({
            id: category.id,
            category: category.name,
            auditReadyUnified: {
              title: primaryRequirement.title,
              description: primaryRequirement.description,
              subRequirements: primaryRequirement.subRequirements
            },
            frameworks: mockFrameworkRequirements
          });
        }
      }
      
      console.log('Generated compliance mapping data:', result.length, 'items');
      
      // Always return the basic result without caching for debugging
      return result;
    } catch (error) {
      console.error('Error fetching compliance mapping data:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get requirements for specific frameworks
   */
  async getFrameworkRequirements(frameworkCodes: string[]): Promise<any[]> {
    try {
      const { data: requirements, error } = await supabase
        .from('requirements_library')
        .select(`
          id,
          control_id,
          title,
          description,
          category,
          standard:standards_library(
            id,
            name
          )
        `)
        .in('standards_library.code', frameworkCodes);

      if (error) throw error;
      return requirements || [];
    } catch (error) {
      console.error('Error fetching framework requirements:', error);
      throw error;
    }
  }

  /**
   * Get framework requirements organized by category using intelligent mapping
   */
  async getFrameworkRequirementsByCategories(
    categories: UnifiedCategory[], 
    selectedFrameworks: string[]
  ): Promise<Record<string, Record<string, Array<{code: string, title: string, description: string}>>>> {
    try {
      // Use intelligent mapping service for proper framework structure-based mapping
      return await intelligentMappingService.getIntelligentlyMappedRequirements(categories, selectedFrameworks);
    } catch (error) {
      console.error('Error fetching framework requirements by categories:', error);
      return {};
    }
  }

}

export const complianceUnificationService = new ComplianceUnificationService();

// React Query hook
import { useQuery } from '@tanstack/react-query';

export function useUnifiedCategories() {
  return useQuery({
    queryKey: ['unified-categories'],
    queryFn: () => complianceUnificationService.getUnifiedCategories(),
  });
}

export function useComplianceMappingData(selectedFrameworks: Record<string, boolean>) {
  const frameworkCodes = Object.entries(selectedFrameworks)
    .filter(([_, selected]) => selected)
    .map(([code]) => code);
    
  return useQuery({
    queryKey: ['compliance-mapping-data', frameworkCodes.sort().join('-')],
    queryFn: () => {
      console.log('React Query: Executing query for frameworks:', frameworkCodes);
      return complianceUnificationService.getComplianceMappingData(frameworkCodes);
    },
    enabled: true, // Always enabled to show all categories
    staleTime: 0, // Always refetch for debugging
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useFrameworkRequirements(frameworkCodes: string[]) {
  return useQuery({
    queryKey: ['framework-requirements', frameworkCodes],
    queryFn: () => complianceUnificationService.getFrameworkRequirements(frameworkCodes),
    enabled: frameworkCodes.length > 0,
  });
}