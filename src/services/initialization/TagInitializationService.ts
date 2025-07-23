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
      const categoryTags: UnifiedCategoryTag[] = unifiedCategories.map((category: any, index: number) => ({
        id: `unified-category-${category.id}`,
        name: category.name || 'Unknown Category',
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] || '#3B82F6',
        description: category.description || `Unified compliance category: ${category.name || 'Unknown'}`,
        category: 'unified-category' as const,
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
        // Silently return empty array to reduce console spam during login
        return [];
      }

      // Extract category names (not IDs) for direct use as tags
      const categoryNames = mappings
        .map((mapping: any) => {
          const categoryName = mapping.unified_requirement?.category?.name;
          return categoryName || null;
        })
        .filter(Boolean) as string[];

      // Remove duplicates
      const uniqueCategories = [...new Set(categoryNames)];
      
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

      // Get requirements without tags - avoid selecting categories column to prevent errors
      const { data: requirements, error } = await supabase
        .from('organization_requirements')
        .select(`
          id,
          requirement_id,
          tags
        `)
        .eq('organization_id', organizationId);

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
          // Check if already has tags
          const needsTagging = !req.tags || (Array.isArray(req.tags) && req.tags.length === 0);
          
          if (!needsTagging) {
            continue; // Skip if already has tags or categories
          }

          // Get unified category tags for this requirement
          const unifiedCategoryTags = await this.getUnifiedCategoryTagsForRequirement(req.requirement_id as string);
          
          // Only update if we found tags
          if (unifiedCategoryTags.length > 0) {
            // Try to update both tags and categories, fall back to tags only if categories column doesn't exist
            let updateData: any = { tags: unifiedCategoryTags };
            
            // Only add categories if the column exists (check if property exists)
            if ('categories' in req) {
              updateData.categories = unifiedCategoryTags;
            }
            
            const { error: updateError } = await supabase
              .from('organization_requirements')
              .update(updateData)
              .eq('id', req.id as string);

            if (updateError) {
              console.warn('Error updating requirement:', req.id, updateError);
            } else {
              updatedCount++;
              // Only log every 50 successful updates to reduce console spam
              if (updatedCount % 50 === 0) {
                console.log(`Applied unified category tags to ${updatedCount} requirements so far...`);
              }
            }
          }
          // else: Silently skip requirements without mappings to reduce console spam
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
  static async populateCategoriesFromTags(_organizationId: string): Promise<number> {
    try {
      console.log('Skipping categories population - column may not exist');
      // Skip this operation to avoid errors with missing categories column
      return 0;
    } catch (error) {
      console.error('Error populating categories from tags:', error);
      return 0;
    }
  }
}