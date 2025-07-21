import { supabase } from '@/lib/supabase';

export interface UnifiedCategoryTag {
  id: string;
  name: string;
  color: string;
  description: string;
  category: 'unified-category';
  sort_order: number;
}

// Color palette for unified categories (cycling through professional colors)
const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple  
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#2563EB', // Blue-600
  '#7C3AED', // Violet
  '#059669', // Emerald
  '#D97706', // Orange
  '#DC2626', // Red-600
  '#C2410C', // Orange-700
  '#4338CA', // Indigo
  '#0D9488', // Teal
  '#1D4ED8', // Blue-700
  '#7C2D12', // Orange-900
  '#166534', // Green-800
  '#581C87', // Purple-900
  '#B91C1C', // Red-700
  '#BE185D', // Pink-700
  '#0369A1', // Sky-700
  '#1E40AF'  // Blue-800
];

export class TagInitializationService {
  /**
   * Get unified categories for use as tags (no separate tags table needed)
   */
  static async getUnifiedCategoriesAsTags(): Promise<UnifiedCategoryTag[]> {
    try {
      console.log('Getting unified categories as tags...');
      
      // Get unified categories from database
      const { data: unifiedCategories, error: categoriesError } = await supabase
        .from('unified_compliance_categories')
        .select('id, name, description, sort_order')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) {
        console.error('Error fetching unified categories:', categoriesError);
        return [];
      }

      if (!unifiedCategories || unifiedCategories.length === 0) {
        console.log('No unified categories found in database');
        return [];
      }

      // Convert unified categories to tag format
      const categoryTags: UnifiedCategoryTag[] = unifiedCategories.map((category, index) => ({
        id: `unified-category-${category.id}`,
        name: category.name,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        description: category.description || `Unified compliance category: ${category.name}`,
        category: 'unified-category',
        sort_order: category.sort_order || index
      }));

      console.log(`Found ${categoryTags.length} unified categories as tags`);
      return categoryTags;
    } catch (error) {
      console.error('Error getting unified categories as tags:', error);
      return [];
    }
  }

  /**
   * Initialize unified category tags - for backward compatibility 
   */
  static async initializeUnifiedCategoryTags(): Promise<boolean> {
    try {
      // Just verify that unified categories exist
      const categories = await this.getUnifiedCategoriesAsTags();
      console.log(`Initialized ${categories.length} unified category tags`);
      return categories.length > 0;
    } catch (error) {
      console.error('Unified category tag initialization failed:', error);
      return false;
    }
  }

  /**
   * Get unified category tags for a requirement based on database mappings
   */
  static async getUnifiedCategoryTagsForRequirement(requirementId: string): Promise<string[]> {
    try {
      // Get unified category mappings for this requirement
      const { data: mappings, error } = await supabase
        .from('unified_requirement_mappings')
        .select(`
          unified_requirement_id,
          unified_requirement:unified_requirements (
            category_id,
            category:unified_compliance_categories (
              id,
              name
            )
          )
        `)
        .eq('requirement_id', requirementId);

      if (error) {
        console.warn('Error fetching unified category mappings:', error);
        return [];
      }

      if (!mappings || mappings.length === 0) {
        console.log(`No unified category mappings found for requirement ${requirementId}`);
        return [];
      }

      // Extract category names (not IDs) for direct use as tags
      const categoryNames = mappings
        .map(mapping => {
          const categoryName = mapping.unified_requirement?.category?.name;
          return categoryName || null;
        })
        .filter(Boolean) as string[];

      // Remove duplicates
      const uniqueCategories = [...new Set(categoryNames)];
      
      if (uniqueCategories.length > 0) {
        console.log(`Found ${uniqueCategories.length} unified categories for requirement ${requirementId}:`, uniqueCategories);
      }
      
      return uniqueCategories;
    } catch (error) {
      console.error('Error getting unified category tags for requirement:', error);
      return [];
    }
  }


  /**
   * Apply unified category tagging to existing requirements
   */
  static async applyUnifiedCategoryTaggingToExistingRequirements(organizationId: string): Promise<number> {
    try {
      console.log('Applying unified category tagging to existing requirements...');

      // Get requirements without tags (gracefully handle missing categories column)
      let requirements;
      let error;
      
      // First try with categories column
      try {
        const result = await supabase
          .from('organization_requirements')
          .select(`
            id,
            requirement_id,
            tags,
            categories
          `)
          .eq('organization_id', organizationId);
        requirements = result.data;
        error = result.error;
      } catch (categoriesError) {
        // If categories column doesn't exist, fall back to tags only
        console.log('Categories column not found, falling back to tags-only mode');
        const result = await supabase
          .from('organization_requirements')
          .select(`
            id,
            requirement_id,
            tags
          `)
          .eq('organization_id', organizationId);
        requirements = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching requirements for unified category tagging:', error);
        return 0;
      }

      if (!requirements || requirements.length === 0) {
        console.log('No requirements found for unified category tagging');
        return 0;
      }

      let updatedCount = 0;
      const batchSize = 5; // Smaller batch size for database-intensive operations

      for (let i = 0; i < requirements.length; i += batchSize) {
        const batch = requirements.slice(i, i + batchSize);
        
        for (const req of batch) {
          // Check if already has tags (categories check is optional if column doesn't exist)
          const hasCategories = req.categories !== undefined ? req.categories.length > 0 : false;
          const needsTagging = (!req.tags || req.tags.length === 0) && !hasCategories;
          
          if (!needsTagging) {
            continue; // Skip if already has tags or categories
          }

          // Get unified category tags for this requirement
          const unifiedCategoryTags = await this.getUnifiedCategoryTagsForRequirement(req.requirement_id);
          
          // Only update if we found tags
          if (unifiedCategoryTags.length > 0) {
            // Try to update both tags and categories, fall back to tags only if categories column doesn't exist
            let updateData: any = { tags: unifiedCategoryTags };
            
            // Only add categories if the column exists (req.categories !== undefined means column was selected)
            if (req.categories !== undefined) {
              updateData.categories = unifiedCategoryTags;
            }
            
            const { error: updateError } = await supabase
              .from('organization_requirements')
              .update(updateData)
              .eq('id', req.id);

            if (updateError) {
              console.warn('Error updating requirement:', req.id, updateError);
            } else {
              updatedCount++;
              console.log(`Applied ${unifiedCategoryTags.length} unified category tags to requirement ${req.id}:`, unifiedCategoryTags);
            }
          } else {
            console.log(`No unified category mappings found for requirement ${req.requirement_id}`);
          }
        }

        // Small delay to prevent overwhelming the API
        if (i + batchSize < requirements.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`Applied unified category tagging to ${updatedCount} requirements`);
      return updatedCount;
    } catch (error) {
      console.error('Unified category tagging failed:', error);
      return 0;
    }
  }

  /**
   * Retroactively populate categories field from tags field for existing demo data
   */
  static async populateCategoriesFromTags(organizationId: string): Promise<number> {
    try {
      console.log('Populating categories field from existing tags...');
      
      // Get requirements that have tags but no categories
      const { data: requirements, error } = await supabase
        .from('organization_requirements')
        .select('id, tags, categories')
        .eq('organization_id', organizationId)
        .not('tags', 'is', null)
        .or('categories.is.null,categories.eq.{}');

      if (error) {
        console.error('Error fetching requirements for category population:', error);
        return 0;
      }

      if (!requirements || requirements.length === 0) {
        console.log('No requirements need category population');
        return 0;
      }

      let updatedCount = 0;
      
      for (const req of requirements) {
        if (req.tags && req.tags.length > 0 && (!req.categories || req.categories.length === 0)) {
          const { error: updateError } = await supabase
            .from('organization_requirements')
            .update({ categories: req.tags })
            .eq('id', req.id);

          if (updateError) {
            console.warn('Error updating categories for requirement:', req.id, updateError);
          } else {
            updatedCount++;
            console.log(`Populated categories from tags for requirement ${req.id}:`, req.tags);
          }
        }
      }

      console.log(`Populated categories for ${updatedCount} requirements`);
      return updatedCount;
    } catch (error) {
      console.error('Error populating categories from tags:', error);
      return 0;
    }
  }
}