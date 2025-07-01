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
      // Check cache first
      const cacheKey = `compliance_mapping_${selectedFrameworks.sort().join('_')}`;
      const cached = complianceCacheService.get<ComplianceMappingData[]>(cacheKey, {
        storage: 'memory',
        ttl: 15 * 60 * 1000 // 15 minutes
      });
      
      if (cached) {
        return cached;
      }

      // Get all unified categories with requirements
      const categories = await this.getUnifiedCategories();
      
      // Get framework requirements based on category keywords
      const frameworkRequirements = await this.getFrameworkRequirementsByCategories(categories, selectedFrameworks);
      
      const result: ComplianceMappingData[] = [];
      
      for (const category of categories) {
        for (const requirement of (category.requirements || [])) {
          // Get relevant framework requirements for this category
          const categoryFrameworks = frameworkRequirements[category.name] || {};
          
          // Create a mapping entry for each requirement
          result.push({
            id: `${category.id}-${requirement.id}`,
            category: category.name,
            auditReadyUnified: {
              title: requirement.title,
              description: requirement.description,
              subRequirements: requirement.subRequirements
            },
            frameworks: {
              iso27001: selectedFrameworks.includes('iso27001') ? (categoryFrameworks.iso27001 || []) : [],
              iso27002: selectedFrameworks.includes('iso27002') ? (categoryFrameworks.iso27002 || []) : [],
              cisControls: selectedFrameworks.includes('cisControls') ? (categoryFrameworks.cisControls || []) : [],
              nis2: selectedFrameworks.includes('nis2') ? (categoryFrameworks.nis2 || []) : [],
              gdpr: selectedFrameworks.includes('gdpr') ? (categoryFrameworks.gdpr || []) : []
            }
          });
        }
      }
      
      // If we have the AI engine available, use it to enhance the results
      if (complianceEngine && typeof complianceEngine.processComplianceMappings === 'function') {
        try {
          const enhancedResult = await complianceEngine.processComplianceMappings(
            categories,
            [],  // Empty mappings for now
            selectedFrameworks
          );
          
          if (enhancedResult && enhancedResult.length > 0) {
            // Cache the enhanced result
            complianceCacheService.set(cacheKey, enhancedResult, {
              storage: 'memory',
              ttl: 15 * 60 * 1000 // 15 minutes
            });
            return enhancedResult;
          }
        } catch (engineError) {
          console.warn('AI engine processing failed, using basic results:', engineError);
        }
      }
      
      // Cache the basic result
      complianceCacheService.set(cacheKey, result, {
        storage: 'memory',
        ttl: 15 * 60 * 1000 // 15 minutes
      });
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
    queryKey: ['compliance-mapping-data', frameworkCodes],
    queryFn: () => complianceUnificationService.getComplianceMappingData(frameworkCodes),
    enabled: true, // Always enabled to show all categories
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useFrameworkRequirements(frameworkCodes: string[]) {
  return useQuery({
    queryKey: ['framework-requirements', frameworkCodes],
    queryFn: () => complianceUnificationService.getFrameworkRequirements(frameworkCodes),
    enabled: frameworkCodes.length > 0,
  });
}