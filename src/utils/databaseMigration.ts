import { supabase } from '@/lib/supabase';

/**
 * Apply the categories column migration directly to the database
 * This ensures the categories column exists before trying to use it
 */
export async function applyCategoriesMigration(): Promise<boolean> {
  try {
    console.log('Applying categories column migration...');
    
    // Execute the migration SQL directly
    const migrationSQL = `
      -- Ensure categories and related columns exist in organization_requirements table
      -- This migration adds missing columns that should exist but might not be in some environments

      -- Add categories column if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='organization_requirements' 
              AND column_name='categories'
          ) THEN
              ALTER TABLE organization_requirements 
              ADD COLUMN categories TEXT[] DEFAULT ARRAY[]::TEXT[];
              
              -- Add index for categories if it doesn't exist
              CREATE INDEX IF NOT EXISTS idx_org_requirements_categories 
              ON organization_requirements USING GIN(categories);
          END IF;
      END $$;

      -- Add applies_to column if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='organization_requirements' 
              AND column_name='applies_to'
          ) THEN
              ALTER TABLE organization_requirements 
              ADD COLUMN applies_to TEXT[] DEFAULT ARRAY[]::TEXT[];
          END IF;
      END $$;

      -- Add implementation_guidance column if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='organization_requirements' 
              AND column_name='implementation_guidance'
          ) THEN
              ALTER TABLE organization_requirements 
              ADD COLUMN implementation_guidance TEXT;
          END IF;
      END $$;
    `;

    // Try to execute the migration using direct PostgreSQL functions
    const { error } = await supabase.rpc('execute_sql', { query: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      return false;
    }
    
    console.log('Categories migration applied successfully!');
    return true;
  } catch (error) {
    console.error('Error applying migration:', error);
    return false;
  }
}

/**
 * Check if the categories column exists
 */
export async function checkCategoriesColumnExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('organization_requirements')
      .select('categories')
      .limit(1);
    
    // If we can select the column without error, it exists
    return !error;
  } catch (error) {
    return false;
  }
}