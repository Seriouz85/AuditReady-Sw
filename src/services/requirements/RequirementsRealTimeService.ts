import { supabase } from '@/lib/supabase';
import { RequirementWithStatus, RequirementUpdateOptions, ConflictResolution, RequirementActivity } from './RequirementsService';

export interface RequirementLockResult {
  success: boolean;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  error?: string;
}

export interface RequirementUpdateResult {
  success: boolean;
  data?: RequirementWithStatus;
  conflict?: ConflictResolution;
  error?: string;
}

export class RequirementsRealTimeService {
  private static instance: RequirementsRealTimeService;

  static getInstance(): RequirementsRealTimeService {
    if (!RequirementsRealTimeService.instance) {
      RequirementsRealTimeService.instance = new RequirementsRealTimeService();
    }
    return RequirementsRealTimeService.instance;
  }

  /**
   * Update a requirement with conflict detection and optimistic locking
   */
  async updateRequirementWithConflictDetection(
    organizationId: string,
    requirementId: string,
    updates: Partial<RequirementWithStatus>,
    options: RequirementUpdateOptions = {}
  ): Promise<RequirementUpdateResult> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // First, get the current version if we need to check for conflicts
      if (!options.skipConflictCheck && options.expectedVersion !== undefined) {
        const { data: current } = await supabase
          .from('organization_requirements')
          .select('version, is_locked, locked_by')
          .eq('organization_id', organizationId)
          .eq('requirement_id', requirementId)
          .single();

        if (current) {
          // Check for version conflicts
          if (current.version !== options.expectedVersion) {
            return {
              success: false,
              conflict: {
                requirementId,
                conflictType: 'version_mismatch',
                localValue: updates,
                remoteValue: current
              }
            };
          }

          // Check for lock conflicts
          if (current.is_locked && current.locked_by !== userId) {
            return {
              success: false,
              conflict: {
                requirementId,
                conflictType: 'lock_conflict',
                localValue: updates,
                remoteValue: current
              }
            };
          }
        }
      }

      // Prepare the update with versioning
      const updateData = {
        ...updates,
        last_edited_by: userId,
        last_edited_at: new Date().toISOString(),
        version: options.expectedVersion ? options.expectedVersion + 1 : undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      // Perform the update with version check
      let query = supabase
        .from('organization_requirements')
        .update(updateData)
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId);

      // Add version check if provided
      if (options.expectedVersion !== undefined && !options.skipConflictCheck) {
        query = query.eq('version', options.expectedVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        // Check if it's a version conflict
        if (error.code === 'PGRST116') { // No rows updated
          return {
            success: false,
            conflict: {
              requirementId,
              conflictType: 'concurrent_edit',
              localValue: updates,
              remoteValue: null
            }
          };
        }
        throw error;
      }

      // Log the activity
      await this.logRequirementActivity(
        organizationId,
        requirementId,
        userId,
        'status_changed', // or determine based on what was updated
        updates,
        data
      );

      return {
        success: true,
        data: data as RequirementWithStatus
      };

    } catch (error) {
      console.error('Error updating requirement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Lock a requirement for editing
   */
  async lockRequirement(
    organizationId: string,
    requirementId: string,
    userId: string
  ): Promise<RequirementLockResult> {
    try {
      // Check if already locked
      const { data: current } = await supabase
        .from('organization_requirements')
        .select('is_locked, locked_by, locked_at')
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId)
        .single();

      if (current?.is_locked && current.locked_by !== userId) {
        return {
          success: false,
          isLocked: true,
          lockedBy: current.locked_by,
          lockedAt: current.locked_at
        };
      }

      // Lock the requirement
      const { error } = await supabase
        .from('organization_requirements')
        .update({
          is_locked: true,
          locked_by: userId,
          locked_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId);

      if (error) throw error;

      // Log the activity
      await this.logRequirementActivity(
        organizationId,
        requirementId,
        userId,
        'locked',
        null,
        { locked: true }
      );

      return { success: true, isLocked: true };

    } catch (error) {
      console.error('Error locking requirement:', error);
      return {
        success: false,
        isLocked: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unlock a requirement
   */
  async unlockRequirement(
    organizationId: string,
    requirementId: string,
    userId: string
  ): Promise<RequirementLockResult> {
    try {
      const { error } = await supabase
        .from('organization_requirements')
        .update({
          is_locked: false,
          locked_by: null,
          locked_at: null
        })
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId)
        .eq('locked_by', userId); // Only allow unlocking if user owns the lock

      if (error) throw error;

      // Log the activity
      await this.logRequirementActivity(
        organizationId,
        requirementId,
        userId,
        'unlocked',
        { locked: true },
        { locked: false }
      );

      return { success: true, isLocked: false };

    } catch (error) {
      console.error('Error unlocking requirement:', error);
      return {
        success: false,
        isLocked: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent activities for a requirement
   */
  async getRequirementActivities(
    organizationId: string,
    requirementId?: string,
    limit: number = 50
  ): Promise<RequirementActivity[]> {
    try {
      let query = supabase
        .from('requirement_activities')
        .select(`
          *,
          user:organization_users!requirement_activities_user_id_fkey(
            user:users(first_name, last_name, email)
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (requirementId) {
        query = query.eq('requirement_id', requirementId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching requirement activities:', error);
      return [];
    }
  }

  /**
   * Log a requirement activity
   */
  private async logRequirementActivity(
    organizationId: string,
    requirementId: string,
    userId: string,
    activityType: string,
    oldValue?: any,
    newValue?: any,
    description?: string
  ): Promise<void> {
    try {
      await supabase
        .from('requirement_activities')
        .insert({
          organization_id: organizationId,
          requirement_id: requirementId,
          user_id: userId,
          activity_type: activityType,
          old_value: oldValue,
          new_value: newValue,
          description
        });
    } catch (error) {
      console.error('Error logging requirement activity:', error);
      // Don't throw here as this is just logging
    }
  }

  /**
   * Start a collaboration session
   */
  async startCollaboration(
    organizationId: string,
    requirementId: string,
    userId: string,
    actionType: 'viewing' | 'editing' | 'commenting'
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('requirement_collaborations')
        .insert({
          organization_id: organizationId,
          requirement_id: requirementId,
          user_id: userId,
          action_type: actionType,
          metadata: { 
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        })
        .select()
        .single();

      if (error) throw error;

      return data.id;

    } catch (error) {
      console.error('Error starting collaboration:', error);
      return null;
    }
  }

  /**
   * End a collaboration session
   */
  async endCollaboration(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('requirement_collaborations')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error ending collaboration:', error);
    }
  }

  /**
   * Get active collaborators for a requirement
   */
  async getActiveCollaborators(
    organizationId: string,
    requirementId: string
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('requirement_collaborations')
        .select(`
          *,
          user:organization_users!requirement_collaborations_user_id_fkey(
            user:users(first_name, last_name, email, avatar_url)
          )
        `)
        .eq('organization_id', organizationId)
        .eq('requirement_id', requirementId)
        .is('ended_at', null)
        .order('started_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching active collaborators:', error);
      return [];
    }
  }

  /**
   * Clean up stale locks and collaborations
   */
  async cleanupStaleData(): Promise<void> {
    try {
      // End collaborations older than 30 minutes
      await supabase
        .from('requirement_collaborations')
        .update({ ended_at: new Date().toISOString() })
        .is('ended_at', null)
        .lt('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

      // Remove locks older than 1 hour
      await supabase
        .from('organization_requirements')
        .update({
          is_locked: false,
          locked_by: null,
          locked_at: null
        })
        .eq('is_locked', true)
        .lt('locked_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    } catch (error) {
      console.error('Error cleaning up stale data:', error);
    }
  }
}