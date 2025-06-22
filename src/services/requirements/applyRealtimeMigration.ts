import { supabase } from '@/lib/supabase';

/**
 * Apply the real-time collaboration migration to Supabase
 * This should be run once to set up the necessary tables and columns
 */
export async function applyRealtimeMigration(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Applying real-time collaboration migration...');

    // Check if we're in demo mode or if Supabase is available
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Add collaboration tracking columns to existing organization_requirements table
    const addColumnsSQL = `
      ALTER TABLE organization_requirements 
      ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES organization_users(id),
      ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES organization_users(id),
      ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
    `;

    const { error: columnsError } = await supabase.rpc('execute_sql', { 
      sql: addColumnsSQL 
    });

    if (columnsError) {
      console.error('Error adding columns:', columnsError);
      // Continue anyway as columns might already exist
    }

    // Create requirement collaborations table
    const createCollaborationsTableSQL = `
      CREATE TABLE IF NOT EXISTS requirement_collaborations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES organization_users(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL CHECK (action_type IN ('viewing', 'editing', 'commenting')),
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error: collaborationsError } = await supabase.rpc('execute_sql', { 
      sql: createCollaborationsTableSQL 
    });

    if (collaborationsError) {
      console.error('Error creating collaborations table:', collaborationsError);
      return { success: false, error: collaborationsError.message };
    }

    // Create requirement activities table
    const createActivitiesTableSQL = `
      CREATE TABLE IF NOT EXISTS requirement_activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES organization_users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL CHECK (activity_type IN (
          'status_changed', 
          'evidence_added', 
          'evidence_removed',
          'notes_updated', 
          'assignee_changed',
          'due_date_changed',
          'priority_changed',
          'locked',
          'unlocked'
        )),
        old_value JSONB,
        new_value JSONB,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error: activitiesError } = await supabase.rpc('execute_sql', { 
      sql: createActivitiesTableSQL 
    });

    if (activitiesError) {
      console.error('Error creating activities table:', activitiesError);
      return { success: false, error: activitiesError.message };
    }

    // Create indexes for performance
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_org_req 
      ON requirement_collaborations(organization_id, requirement_id);

      CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_user 
      ON requirement_collaborations(user_id);

      CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_active 
      ON requirement_collaborations(requirement_id) WHERE ended_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_requirement_activities_org_req 
      ON requirement_activities(organization_id, requirement_id);

      CREATE INDEX IF NOT EXISTS idx_requirement_activities_created_at 
      ON requirement_activities(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_organization_requirements_last_edited 
      ON organization_requirements(last_edited_at DESC);
    `;

    const { error: indexesError } = await supabase.rpc('execute_sql', { 
      sql: createIndexesSQL 
    });

    if (indexesError) {
      console.error('Error creating indexes:', indexesError);
      // Continue anyway as this is not critical
    }

    console.log('Real-time collaboration migration applied successfully!');
    return { success: true };

  } catch (error) {
    console.error('Error applying real-time migration:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if the real-time migration has been applied
 */
export async function checkMigrationStatus(): Promise<{ applied: boolean; error?: string }> {
  try {
    // Check if the collaboration table exists
    const { data, error } = await supabase
      .from('requirement_collaborations')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist
      return { applied: false };
    }

    if (error) {
      return { applied: false, error: error.message };
    }

    return { applied: true };

  } catch (error) {
    console.error('Error checking migration status:', error);
    return { 
      applied: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}