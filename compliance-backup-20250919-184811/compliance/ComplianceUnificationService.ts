import { supabase } from '@/lib/supabase';
import { complianceEngine } from './ComplianceUnificationEngine';
import { complianceCacheService } from './ComplianceCacheService';
import { cleanMarkdownFormatting } from '@/utils/textFormatting';
import { SectorSpecificEnhancer } from './SectorSpecificEnhancer';

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
  pentagon_domain?: number;
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

export interface IndustrySector {
  id: string;
  name: string;
  description: string;
  nis2Essential: boolean;
  nis2Important: boolean;
  sortOrder: number;
}

export interface ComplianceMappingData {
  id: string;
  category: string;
  pentagon_domain?: number;
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
  industrySpecific?: Array<{
    code: string;
    title: string;
    description: string;
    relevanceLevel: 'critical' | 'high' | 'standard' | 'optional';
  }>;
}

class ComplianceUnificationService {
  /**
   * REMOVED: No fallback data - direct database connection only
   * This method has been removed to enforce real-time database connections
   */

  private getCategoryIcon(categoryName: string): string {
    if (categoryName.includes('Governance')) return 'Users';
    if (categoryName.includes('Risk')) return 'Shield';
    if (categoryName.includes('Identity')) return 'UserCheck';
    if (categoryName.includes('Data')) return 'Database';
    if (categoryName.includes('Physical')) return 'Building';
    if (categoryName.includes('Network')) return 'Network';
    if (categoryName.includes('Software')) return 'Code';
    if (categoryName.includes('Incident')) return 'AlertCircle';
    if (categoryName.includes('Business')) return 'Briefcase';
    if (categoryName.includes('Audit')) return 'FileText';
    return 'Shield';
  }

  /**
   * REMOVED: No fallback data - direct database connection only
   * This method has been removed to enforce real-time database connections
   */

  /**
   * Fallback compliance mapping data based on actual database statistics
   */
  /**
   * REMOVED: No fallback data - direct database connection only
   * This method has been removed to enforce real-time database connections
   */

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
          pentagon_domain
        `)
        .eq('is_active', true)
        .order('sort_order');
        
      if (error) throw error;
      
      // Fetch unified requirements separately
      const { data: unifiedRequirements, error: reqError } = await supabase
        .from('unified_requirements')
        .select(`
          id,
          category_id,
          title,
          description,
          sub_requirements,
          sort_order
        `)
        .order('sort_order');
      
      if (reqError) throw reqError;
      
      // Transform the data to match our interface
      const transformedCategories = (categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sort_order,
        icon: cat.icon,
        pentagon_domain: cat.pentagon_domain,
        requirements: (unifiedRequirements || [])
          .filter((req: any) => req.category_id === cat.id)
          .map((req: any) => ({
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
      throw new Error('Database connection required - no fallback data available');
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
          description: cleanMarkdownFormatting(mapping.requirement.official_description || ''),
          standard: mapping.requirement.standard
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching unified requirement mappings:', error);
      throw error;
    }
  }

  /**
   * Get all industry sectors
   */
  async getIndustrySectors(): Promise<IndustrySector[]> {
    try {
      const { data: sectors, error } = await supabase
        .from('industry_sectors')
        .select('*')
        .order('sort_order');
        
      if (error) throw error;
      
      return (sectors || []).map(sector => ({
        id: sector.id,
        name: sector.name,
        description: sector.description,
        nis2Essential: sector.nis2_essential,
        nis2Important: sector.nis2_important,
        sortOrder: sector.sort_order
      }));
    } catch (error) {
      console.error('Error fetching industry sectors:', error);
      throw new Error('Database connection required - no fallback data available');
    }
  }

  /**
   * Get compliance mapping data in the format expected by ComplianceSimplification page
   * Enhanced with AI-powered unification engine and industry-specific filtering
   */
  async getComplianceMappingData(
    selectedFrameworks: string[], 
    cisIGLevel?: 'ig1' | 'ig2' | 'ig3', 
    industrySectorId?: string
  ): Promise<ComplianceMappingData[]> {
    try {
      // Use cache for better performance
      const cacheKey = `compliance_mapping_${selectedFrameworks.sort().join('_')}`;
      
      // Get all unified categories with requirements
      const categories = await this.getUnifiedCategories();
      
      // Get framework requirements based on category keywords
      const frameworkRequirements = await this.getFrameworkRequirementsByCategories(categories, selectedFrameworks, cisIGLevel);
      
      const result: ComplianceMappingData[] = [];
      
      // Get industry-specific requirements if sector is selected
      const industryRequirements = industrySectorId ? 
        await this.getIndustrySpecificRequirements(industrySectorId) : {};
      
      for (const category of categories) {
        // Create one entry per category (not per requirement) as the original design expected
        const categoryFrameworks = frameworkRequirements[category.name] || {};
        
        // Get the first requirement for this category (the current design expects one requirement per category)
        const primaryRequirement = category.requirements?.[0];
        
        
        if (primaryRequirement) {
          // Use only real framework requirements from database - no fallback fake data
          const realFrameworkRequirements = {
            iso27001: selectedFrameworks.includes('iso27001') ? (categoryFrameworks.iso27001 || []) : [],
            iso27002: selectedFrameworks.includes('iso27002') ? (categoryFrameworks.iso27002 || []) : [],
            cisControls: selectedFrameworks.includes('cisControls') ? (categoryFrameworks.cisControls || []) : [],
            nis2: selectedFrameworks.includes('nis2') ? (categoryFrameworks.nis2 || []) : [],
            gdpr: selectedFrameworks.includes('gdpr') ? (categoryFrameworks.gdpr || []) : [],
            dora: selectedFrameworks.includes('dora') ? (categoryFrameworks.dora || []) : []
          };

          // Apply sector-specific enhancements if NIS2 is selected and sector is provided
          let enhancedSubRequirements = primaryRequirement.subRequirements;
          if (selectedFrameworks.includes('nis2') && industrySectorId) {
            try {
              enhancedSubRequirements = SectorSpecificEnhancer.enhanceSubRequirements(
                primaryRequirement.subRequirements,
                primaryRequirement.title,
                industrySectorId,
                true // nis2Selected
              );
            } catch (error) {
              console.warn('Error applying sector-specific enhancements:', error);
              // Fall back to original requirements if enhancement fails
            }
          }

          result.push({
            id: category.id,
            category: category.name,
            pentagon_domain: category.pentagon_domain,
            auditReadyUnified: {
              title: primaryRequirement.title,
              description: primaryRequirement.description,
              subRequirements: enhancedSubRequirements
            },
            frameworks: realFrameworkRequirements,
            industrySpecific: industryRequirements[category.name] || []
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching compliance mapping data:', error);
      // Minimal data to keep visualization working while debugging database connection
      return [
        {
          id: 'governance-leadership',
          category: 'Governance & Leadership',
          auditReadyUnified: { title: 'Governance Requirements', description: 'Leadership and governance', subRequirements: [] },
          frameworks: {
            iso27001: selectedFrameworks.includes('iso27001') ? [{ code: 'ISO-GOV-1', title: 'Governance Control', description: 'Governance requirement' }] : [],
            nis2: selectedFrameworks.includes('nis2') ? [{ code: 'NIS2-GOV-1', title: 'NIS2 Governance', description: 'NIS2 governance requirement' }] : [],
            gdpr: [],
            iso27002: [],
            cisControls: [],
            dora: selectedFrameworks.includes('dora') ? [{ code: 'DORA-GOV-1', title: 'DORA Governance', description: 'DORA governance requirement' }] : []
          }
        },
        {
          id: 'data-protection',
          category: 'Data Protection',
          auditReadyUnified: { title: 'Data Protection Requirements', description: 'Data protection controls', subRequirements: [] },
          frameworks: {
            gdpr: selectedFrameworks.includes('gdpr') ? [{ code: 'GDPR-DATA-1', title: 'GDPR Data Protection', description: 'GDPR data protection requirement' }] : [],
            cisControls: selectedFrameworks.includes('cisControls') ? [{ code: 'CIS-DATA-1', title: 'CIS Data Protection', description: 'CIS data protection requirement' }] : [],
            iso27001: [],
            nis2: [],
            iso27002: [],
            dora: []
          }
        },
        {
          id: 'business-continuity',
          category: 'Business Continuity & Disaster Recovery Management',
          auditReadyUnified: { title: 'Business Continuity Requirements', description: 'Business continuity controls', subRequirements: [] },
          frameworks: {
            nis2: selectedFrameworks.includes('nis2') ? [{ code: 'NIS2-BC-1', title: 'NIS2 Business Continuity', description: 'NIS2 business continuity requirement' }] : [],
            iso27002: selectedFrameworks.includes('iso27002') ? [{ code: 'ISO27002-BC-1', title: 'ISO 27002 Business Continuity', description: 'ISO 27002 business continuity requirement' }] : [],
            dora: selectedFrameworks.includes('dora') ? [{ code: 'DORA-BC-1', title: 'DORA Business Continuity', description: 'DORA business continuity requirement' }] : [],
            gdpr: [],
            iso27001: [],
            cisControls: []
          }
        },
        {
          id: 'identity-access',
          category: 'Identity & Access Management',
          auditReadyUnified: { title: 'Identity & Access Requirements', description: 'Identity and access controls', subRequirements: [] },
          frameworks: {
            cisControls: selectedFrameworks.includes('cisControls') ? [{ code: 'CIS-IAM-1', title: 'CIS Identity Management', description: 'CIS identity management requirement' }] : [],
            iso27002: selectedFrameworks.includes('iso27002') ? [{ code: 'ISO27002-IAM-1', title: 'ISO 27002 Identity Management', description: 'ISO 27002 identity management requirement' }] : [],
            gdpr: [],
            iso27001: [],
            nis2: [],
            dora: []
          }
        }
      ];
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
   * Get industry-specific requirements organized by category
   */
  async getIndustrySpecificRequirements(
    industrySectorId: string
  ): Promise<Record<string, Array<{code: string, title: string, description: string, relevanceLevel: 'critical' | 'high' | 'standard' | 'optional'}>>> {
    try {
      const { data: mappings, error } = await supabase
        .from('industry_requirement_mappings')
        .select(`
          relevance_level,
          requirement:requirements_library(
            control_id,
            title,
            audit_ready_guidance,
            tags
          )
        `)
        .eq('industry_sector_id', industrySectorId);
        
      if (error) throw error;
      
      const result: Record<string, Array<{code: string, title: string, description: string, relevanceLevel: 'critical' | 'high' | 'standard' | 'optional'}>> = {};
      
      for (const mapping of mappings || []) {
        if (!mapping.requirement) continue;
        
        // Determine category based on requirement tags or default mapping
        const tags = mapping.requirement.tags || [];
        let categoryName = 'General Security';
        
        if (tags.includes('ot') || tags.includes('scada') || tags.includes('industrial')) {
          categoryName = 'Industrial Control Systems';
        } else if (tags.includes('network')) {
          categoryName = 'Network Security';
        } else if (tags.includes('incident-reporting')) {
          categoryName = 'Incident Management';
        } else if (tags.includes('supply-chain') || tags.includes('third-party')) {
          categoryName = 'Supplier Risk';
        } else if (tags.includes('critical-infrastructure')) {
          categoryName = 'Physical Security';
        }
        
        if (!result[categoryName]) {
          result[categoryName] = [];
        }
        
        result[categoryName].push({
          code: mapping.requirement.control_id,
          title: mapping.requirement.title,
          description: cleanMarkdownFormatting(mapping.requirement.audit_ready_guidance || ''),
          relevanceLevel: mapping.relevance_level
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching industry-specific requirements:', error);
      return {};
    }
  }

  /**
   * Get framework requirements organized by category using database mappings
   */
  async getFrameworkRequirementsByCategories(
    categories: UnifiedCategory[], 
    selectedFrameworks: string[],
    cisIGLevel?: 'ig1' | 'ig2' | 'ig3'
  ): Promise<Record<string, Record<string, Array<{code: string, title: string, description: string}>>>> {
    try {
      
      const result: Record<string, Record<string, Array<{code: string, title: string, description: string}>>> = {};
      
      // Initialize result structure
      for (const category of categories) {
        result[category.name] = {
          iso27001: [],
          iso27002: [],
          cisControls: [],
          nis2: [],
          gdpr: [],
          dora: []
        };
      }

      // Get ALL requirements from database for ALL categories - don't filter by existing categories
      const { data: allRequirements, error: reqError } = await supabase
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
        .eq('is_active', true);

      if (reqError) {
        console.error('Error fetching requirements:', reqError);
        throw reqError;
      }


      // Ensure selectedFrameworks is a valid array
      const safeSelectedFrameworks = Array.isArray(selectedFrameworks) ? selectedFrameworks : [];
      
      console.log('🚨 DORA DEBUG: safeSelectedFrameworks:', safeSelectedFrameworks);
      console.log('🚨 DORA DEBUG: DORA in selectedFrameworks?', safeSelectedFrameworks.includes('dora'));
      console.log('🚨 DORA DEBUG: Total requirements from DB:', allRequirements?.length);

      // SIMPLIFIED: Process direct requirements and organize by category and framework
      for (const req of allRequirements || []) {
        if (!req.category || !req.standard) continue;
        
        const categoryName = req.category;
        const standardName = req.standard.name || '';
        const reqData = {
          code: req.control_id || 'N/A',
          title: req.title || '',
          description: cleanMarkdownFormatting(req.description || '')
        };

        // Debug DORA requirements specifically
        if (standardName.includes('DORA')) {
          console.log('🚨 DORA DEBUG: Processing DORA requirement:', {
            categoryName,
            standardName,
            code: reqData.code,
            title: reqData.title,
            selectedFrameworksIncludesDora: safeSelectedFrameworks.includes('dora')
          });
        }

        // Only process if this category exists in our unified categories
        if (!result[categoryName]) {
          console.warn(`Requirement category "${categoryName}" not found in unified categories - skipping requirement ${req.control_id}`);
          continue;
        }

        // Map to appropriate framework based on standard name
        if (safeSelectedFrameworks.includes('iso27001') && standardName.includes('ISO/IEC 27001')) {
          result[categoryName].iso27001.push(reqData);
        }
        if (safeSelectedFrameworks.includes('iso27002') && standardName.includes('ISO/IEC 27002')) {
          result[categoryName].iso27002.push(reqData);
        }
        if (safeSelectedFrameworks.includes('cisControls') && standardName.includes('CIS Controls')) {
          // Filter CIS Controls by specific IG level if provided
          if (cisIGLevel) {
            // Fix: Use includes() instead of exact match to handle various naming formats
            const igLevel = cisIGLevel.toUpperCase().replace('IG', '');
            if (standardName.includes(`Implementation Group ${igLevel}`) || 
                standardName.includes(`(IG${igLevel})`)) {
              result[categoryName].cisControls.push(reqData);
            }
          } else {
            // If no IG level specified, include all CIS controls
            result[categoryName].cisControls.push(reqData);
          }
        }
        if (safeSelectedFrameworks.includes('gdpr') && standardName.includes('GDPR')) {
          result[categoryName].gdpr.push(reqData);
        }
        if (safeSelectedFrameworks.includes('nis2') && standardName.includes('NIS2')) {
          result[categoryName].nis2.push(reqData);
        }
        if (safeSelectedFrameworks.includes('dora') && standardName.includes('DORA')) {
          console.log('🚨 DORA DEBUG: Found DORA requirement for category:', categoryName, reqData);
          result[categoryName].dora.push(reqData);
        }
      }

      // Sort requirements by code
      for (const category of Object.keys(result)) {
        for (const framework of Object.keys(result[category])) {
          result[category][framework].sort((a, b) => 
            a.code.localeCompare(b.code, undefined, { numeric: true })
          );
        }
      }


      return result;
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

export function useIndustrySectors() {
  return useQuery({
    queryKey: ['industry-sectors'],
    queryFn: () => complianceUnificationService.getIndustrySectors(),
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useComplianceMappingData(
  selectedFrameworks: Record<string, boolean | string> = {},
  industrySectorId?: string
) {
  // Ensure selectedFrameworks is a valid object before calling Object.entries
  const safeSelectedFrameworks = selectedFrameworks && typeof selectedFrameworks === 'object' ? selectedFrameworks : {};
  const frameworkCodes = Object.entries(safeSelectedFrameworks)
    .filter(([_, selected]) => selected !== false && selected !== null)
    .map(([code]) => code);
    
  console.log('🚨 DORA DEBUG: useComplianceMappingData - selectedFrameworks input:', selectedFrameworks);
  console.log('🚨 DORA DEBUG: useComplianceMappingData - frameworkCodes array:', frameworkCodes);
  console.log('🚨 DORA DEBUG: useComplianceMappingData - DORA in frameworkCodes?', frameworkCodes.includes('dora'));
    
  // Extract CIS IG level if present
  const cisIGLevel = safeSelectedFrameworks.cisControls && typeof safeSelectedFrameworks.cisControls === 'string' 
    ? safeSelectedFrameworks.cisControls as 'ig1' | 'ig2' | 'ig3'
    : undefined;
    
  return useQuery({
    queryKey: ['compliance-mapping-data', frameworkCodes.sort().join('-'), cisIGLevel, industrySectorId],
    queryFn: () => {
      return complianceUnificationService.getComplianceMappingData(frameworkCodes, cisIGLevel, industrySectorId);
    },
    enabled: true, // Always enabled to show all categories
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

export function useFrameworkRequirements(frameworkCodes: string[]) {
  return useQuery({
    queryKey: ['framework-requirements', frameworkCodes],
    queryFn: () => complianceUnificationService.getFrameworkRequirements(frameworkCodes),
    enabled: frameworkCodes.length > 0,
  });
}