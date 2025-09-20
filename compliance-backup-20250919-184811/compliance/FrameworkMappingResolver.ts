import { supabase } from '@/lib/supabase';

export interface CategoryMapping {
  id: string;
  categoryId: string;
  categoryName: string;
  requirement: {
    id: string;
    code: string;
    title: string;
    description: string;
    igLevel?: string;
  };
  framework: {
    id: string;
    name: string;
    code: string;
  };
  mappingStrength: 'exact' | 'strong' | 'partial' | 'related';
}

export interface FrameworkSelection {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: string | null; // 'ig1', 'ig2', 'ig3', or null
  gdpr: boolean;
  nis2: boolean;
}

export interface CISRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  igLevel: 'IG1' | 'IG2' | 'IG3';
}

/**
 * Service responsible for resolving framework mappings to categories
 * and handling IG level filtering for CIS Controls
 */
export class FrameworkMappingResolver {
  
  /**
   * Resolve all mappings for a category based on selected frameworks
   */
  async resolveMappings(
    category: string, 
    frameworks: FrameworkSelection
  ): Promise<CategoryMapping[]> {
    try {
      // Get category ID first
      const { data: categoryData, error: categoryError } = await supabase
        .from('unified_compliance_categories')
        .select('id, name')
        .eq('name', category)
        .single();
      
      if (categoryError || !categoryData) {
        console.error('Category not found:', category, categoryError);
        return [];
      }

      // Build framework filter array
      const selectedFrameworks = this.buildFrameworkFilter(frameworks);
      
      if (selectedFrameworks.length === 0) {
        return [];
      }

      // Query unified_category_mappings with proper joins
      const { data: mappings, error: mappingError } = await supabase
        .from('unified_category_mappings')
        .select(`
          id,
          category_id,
          mapping_strength,
          requirement:requirements!inner(
            id,
            code,
            title,
            description,
            ig_level
          ),
          framework:standards!inner(
            id,
            name,
            code
          )
        `)
        .eq('category_id', categoryData.id)
        .in('framework.code', selectedFrameworks)
        .order('requirement.code');

      if (mappingError) {
        console.error('Error fetching mappings:', mappingError);
        return [];
      }

      // Transform and filter results
      const transformedMappings: CategoryMapping[] = (mappings || []).map(mapping => ({
        id: mapping.id,
        categoryId: mapping.category_id,
        categoryName: categoryData.name,
        requirement: {
          id: mapping.requirement.id,
          code: mapping.requirement.code,
          title: mapping.requirement.title,
          description: mapping.requirement.description,
          igLevel: mapping.requirement.ig_level
        },
        framework: mapping.framework,
        mappingStrength: mapping.mapping_strength as any
      }));

      // Apply CIS Controls IG level filtering
      return this.applyCISFiltering(transformedMappings, frameworks.cisControls);
      
    } catch (error) {
      console.error('Error resolving mappings:', error);
      return [];
    }
  }

  /**
   * Get requirements for a specific category and framework
   */
  async getCategoryRequirements(
    categoryId: string, 
    frameworkCode: string
  ): Promise<CategoryMapping[]> {
    try {
      const { data: mappings, error } = await supabase
        .from('unified_category_mappings')
        .select(`
          id,
          category_id,
          mapping_strength,
          requirement:requirements!inner(
            id,
            code,
            title,
            description,
            ig_level
          ),
          framework:standards!inner(
            id,
            name,
            code
          )
        `)
        .eq('category_id', categoryId)
        .eq('framework.code', frameworkCode)
        .order('requirement.code');

      if (error) {
        console.error('Error fetching category requirements:', error);
        return [];
      }

      return (mappings || []).map(mapping => ({
        id: mapping.id,
        categoryId: mapping.category_id,
        categoryName: '', // Will be filled by caller if needed
        requirement: {
          id: mapping.requirement.id,
          code: mapping.requirement.code,
          title: mapping.requirement.title,
          description: mapping.requirement.description,
          igLevel: mapping.requirement.ig_level
        },
        framework: mapping.framework,
        mappingStrength: mapping.mapping_strength as any
      }));
      
    } catch (error) {
      console.error('Error getting category requirements:', error);
      return [];
    }
  }

  /**
   * Resolve CIS Controls mappings with proper IG level filtering
   */
  async resolveCISMappings(
    category: string, 
    igLevel: 'ig1' | 'ig2' | 'ig3'
  ): Promise<CategoryMapping[]> {
    try {
      // Get all CIS mappings for category
      const allMappings = await this.resolveMappings(category, {
        iso27001: false,
        iso27002: false,
        cisControls: igLevel,
        gdpr: false,
        nis2: false
      });

      // Apply IG level filtering
      return this.applyCISFiltering(allMappings, igLevel);
      
    } catch (error) {
      console.error('Error resolving CIS mappings:', error);
      return [];
    }
  }

  /**
   * Check if a CIS requirement should be included based on IG level
   */
  resolveIGLevel(requirement: CISRequirement, igLevel: 'ig1' | 'ig2' | 'ig3'): boolean {
    if (!requirement.igLevel) return true;

    const reqLevel = requirement.igLevel.toUpperCase();
    const selectedLevel = igLevel.toUpperCase();

    switch (selectedLevel) {
      case 'IG1':
        return reqLevel === 'IG1';
      case 'IG2':
        return reqLevel === 'IG1' || reqLevel === 'IG2';
      case 'IG3':
        return true; // Include all levels
      default:
        return true;
    }
  }

  /**
   * Fix CIS Controls 4.6 and 4.7 mapping issues
   */
  async fixCISMappingIssues(): Promise<void> {
    try {
      // Get CIS Controls standard ID
      const { data: cisStandard, error: cisError } = await supabase
        .from('standards')
        .select('id')
        .ilike('name', '%CIS%')
        .single();

      if (cisError || !cisStandard) {
        console.error('CIS Controls standard not found:', cisError);
        return;
      }

      // Get Secure Configuration category ID
      const { data: secureCategory, error: categoryError } = await supabase
        .from('unified_compliance_categories')
        .select('id')
        .ilike('name', '%Secure Configuration%')
        .single();

      if (categoryError || !secureCategory) {
        console.error('Secure Configuration category not found:', categoryError);
        return;
      }

      // Get CIS 4.6 and 4.7 requirements
      const { data: cisRequirements, error: reqError } = await supabase
        .from('requirements')
        .select('id, code')
        .eq('standard_id', cisStandard.id)
        .in('code', ['4.6', '4.7']);

      if (reqError || !cisRequirements?.length) {
        console.error('CIS 4.6/4.7 requirements not found:', reqError);
        return;
      }

      // Check if mappings already exist
      for (const requirement of cisRequirements) {
        const { data: existingMapping, error: checkError } = await supabase
          .from('unified_category_mappings')
          .select('id')
          .eq('category_id', secureCategory.id)
          .eq('requirement_id', requirement.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing mapping:', checkError);
          continue;
        }

        if (!existingMapping) {
          // Create missing mapping
          const { error: insertError } = await supabase
            .from('unified_category_mappings')
            .insert({
              category_id: secureCategory.id,
              requirement_id: requirement.id,
              mapping_strength: 'strong'
            });

          if (insertError) {
            console.error(`Error creating mapping for CIS ${requirement.code}:`, insertError);
          } else {
            console.log(`Created mapping for CIS ${requirement.code} to Secure Configuration`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error fixing CIS mapping issues:', error);
    }
  }

  /**
   * Build framework filter array from framework selection
   */
  private buildFrameworkFilter(frameworks: FrameworkSelection): string[] {
    const selected: string[] = [];
    
    if (frameworks.iso27001) selected.push('ISO27001');
    if (frameworks.iso27002) selected.push('ISO27002');
    if (frameworks.cisControls) selected.push('CIS');
    if (frameworks.gdpr) selected.push('GDPR');
    if (frameworks.nis2) selected.push('NIS2');
    
    return selected;
  }

  /**
   * Apply CIS Controls IG level filtering to mappings
   */
  private applyCISFiltering(
    mappings: CategoryMapping[], 
    igLevel: string | null
  ): CategoryMapping[] {
    if (!igLevel) return mappings;

    return mappings.filter(mapping => {
      // Only filter CIS Controls requirements
      if (mapping.framework.code !== 'CIS') return true;
      
      const reqIGLevel = mapping.requirement.igLevel;
      if (!reqIGLevel) return true;

      const reqLevel = reqIGLevel.toUpperCase();
      const selectedLevel = igLevel.toUpperCase();

      switch (selectedLevel) {
        case 'IG1':
          return reqLevel === 'IG1';
        case 'IG2':
          return reqLevel === 'IG1' || reqLevel === 'IG2';
        case 'IG3':
          return true; // Include all levels
        default:
          return true;
      }
    });
  }

  /**
   * Get all categories with their framework mappings
   */
  async getAllCategoryMappings(frameworks: FrameworkSelection): Promise<Map<string, CategoryMapping[]>> {
    try {
      const { data: categories, error: categoryError } = await supabase
        .from('unified_compliance_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');

      if (categoryError) {
        console.error('Error fetching categories:', categoryError);
        return new Map();
      }

      const categoryMappings = new Map<string, CategoryMapping[]>();

      for (const category of categories || []) {
        const mappings = await this.resolveMappings(category.name, frameworks);
        categoryMappings.set(category.name, mappings);
      }

      return categoryMappings;
      
    } catch (error) {
      console.error('Error getting all category mappings:', error);
      return new Map();
    }
  }

  /**
   * Validate framework mappings for consistency
   */
  async validateMappings(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for missing CIS 4.6 and 4.7 mappings
      const { data: cisMappings, error } = await supabase
        .from('unified_category_mappings')
        .select(`
          requirement:requirements!inner(code),
          category:unified_compliance_categories!inner(name)
        `)
        .in('requirement.code', ['4.6', '4.7']);

      if (error) {
        issues.push(`Database query error: ${error.message}`);
      } else if (!cisMappings || cisMappings.length < 2) {
        issues.push('Missing mappings for CIS Controls 4.6 and/or 4.7');
      }

      // Check for orphaned mappings
      const { data: orphanedMappings, error: orphanError } = await supabase
        .from('unified_category_mappings')
        .select('id, category_id, requirement_id')
        .is('requirement.id', null);

      if (orphanError) {
        issues.push(`Orphaned mapping check failed: ${orphanError.message}`);
      } else if (orphanedMappings && orphanedMappings.length > 0) {
        issues.push(`Found ${orphanedMappings.length} orphaned mappings`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };
      
    } catch (error) {
      console.error('Error validating mappings:', error);
      return {
        isValid: false,
        issues: [`Validation error: ${error}`]
      };
    }
  }
}