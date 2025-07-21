import { supabase } from '@/lib/supabase';
import { format, parseISO, subDays, subHours } from 'date-fns';

export interface AuditEntry {
  id: string;
  organizationId: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  userId: string;
  userEmail: string;
  sessionId?: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  applicationContext?: any;
  createdAt: string;
}

export interface RestorePoint {
  timestamp: string;
  label: string;
  description?: string;
  changeCount: number;
  affectedTables: string[];
  user?: {
    id: string;
    email: string;
  };
}

export interface RestoreRequest {
  organizationId: string;
  restoreType: 'FIELD' | 'RECORD' | 'USER_SESSION' | 'TIME_POINT' | 'BULK';
  targetTimestamp?: string;
  targetUserId?: string;
  targetSessionId?: string;
  targetRecords?: {
    tableName: string;
    recordIds: string[];
    fields?: string[];
  }[];
  reason: string;
  requiresApproval?: boolean;
}

export interface RestorePreview {
  affectedRecords: {
    tableName: string;
    recordId: string;
    currentValues: any;
    restoredValues: any;
    changes: {
      field: string;
      currentValue: any;
      restoredValue: any;
    }[];
  }[];
  totalChanges: number;
  warnings: string[];
}

export interface UserActivity {
  userId: string;
  userEmail: string;
  sessionId?: string;
  startTime: string;
  endTime?: string;
  changeCount: number;
  affectedTables: string[];
  summary: {
    inserts: number;
    updates: number;
    deletes: number;
  };
}

export class BackupRestoreService {
  // Get audit trail for an organization
  async getAuditTrail(
    organizationId: string,
    options: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      tableName?: string;
      recordId?: string;
      action?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: AuditEntry[]; count: number }> {
    try {
      let query = supabase
        .from('audit_trail')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.tableName) {
        query = query.eq('table_name', options.tableName);
      }
      if (options.recordId) {
        query = query.eq('record_id', options.recordId);
      }
      if (options.action) {
        query = query.eq('action', options.action);
      }

      const limit = options.limit || 100;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data?.map(this.mapAuditEntry) || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  // Get restore points (significant moments in time)
  async getRestorePoints(
    organizationId: string,
    days: number = 7
  ): Promise<RestorePoint[]> {
    try {
      const startDate = subDays(new Date(), days).toISOString();
      
      // Get daily summaries
      const { data, error } = await supabase.rpc('get_restore_points', {
        p_organization_id: organizationId,
        p_start_date: startDate
      });

      if (error) throw error;

      // Add suggested restore points
      const restorePoints: RestorePoint[] = [];
      
      // Add hourly points for last 24 hours
      for (let i = 1; i <= 24; i++) {
        const timestamp = subHours(new Date(), i);
        restorePoints.push({
          timestamp: timestamp.toISOString(),
          label: `${i} hour${i > 1 ? 's' : ''} ago`,
          changeCount: 0,
          affectedTables: []
        });
      }

      // Add daily points
      for (let i = 1; i <= days; i++) {
        const timestamp = subDays(new Date(), i);
        restorePoints.push({
          timestamp: timestamp.toISOString(),
          label: `${i} day${i > 1 ? 's' : ''} ago`,
          changeCount: 0,
          affectedTables: []
        });
      }

      return restorePoints;
    } catch (error) {
      console.error('Error fetching restore points:', error);
      throw error;
    }
  }

  // Get user activity summary
  async getUserActivity(
    organizationId: string,
    options: {
      startDate?: string;
      endDate?: string;
      userId?: string;
    } = {}
  ): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          audit_trail!inner(
            action,
            table_name
          )
        `)
        .eq('organization_id', organizationId)
        .order('session_start', { ascending: false });

      if (error) throw error;

      // Process and group by session
      const activities: UserActivity[] = [];
      
      // Group audit entries by session
      const sessionMap = new Map<string, any[]>();
      
      data?.forEach(session => {
        if (!sessionMap.has(session.id)) {
          sessionMap.set(session.id, []);
        }
        // Note: This would need adjustment based on actual query structure
      });

      return activities;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  // Preview what would be restored
  async previewRestore(request: RestoreRequest): Promise<RestorePreview> {
    try {
      const preview: RestorePreview = {
        affectedRecords: [],
        totalChanges: 0,
        warnings: []
      };

      switch (request.restoreType) {
        case 'TIME_POINT':
          if (!request.targetTimestamp) {
            throw new Error('Target timestamp required for time point restore');
          }
          return await this.previewTimePointRestore(
            request.organizationId,
            request.targetTimestamp
          );

        case 'USER_SESSION':
          if (!request.targetSessionId) {
            throw new Error('Target session ID required for session restore');
          }
          return await this.previewSessionRestore(
            request.organizationId,
            request.targetSessionId
          );

        case 'RECORD':
          if (!request.targetRecords || request.targetRecords.length === 0) {
            throw new Error('Target records required for record restore');
          }
          return await this.previewRecordRestore(
            request.organizationId,
            request.targetRecords
          );

        default:
          throw new Error(`Unsupported restore type: ${request.restoreType}`);
      }
    } catch (error) {
      console.error('Error previewing restore:', error);
      throw error;
    }
  }

  // Perform the actual restore
  async performRestore(
    request: RestoreRequest,
    approvedBy?: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    try {
      // Validate permissions
      const hasPermission = await this.validateRestorePermission(
        request.organizationId,
        request.restoreType
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions for restore operation');
      }

      // Check if approval is required
      if (request.requiresApproval && !approvedBy) {
        throw new Error('This restore operation requires approval');
      }

      // Create a restore session
      const { data: restoreSession, error: sessionError } = await supabase
        .from('restore_history')
        .insert({
          organization_id: request.organizationId,
          restored_by: await this.getCurrentUserId(),
          restore_type: request.restoreType,
          restore_point: request.targetTimestamp || new Date().toISOString(),
          affected_table: request.targetRecords?.[0]?.tableName || 'multiple',
          affected_records: request.targetRecords?.flatMap(t => t.recordIds) || [],
          reason: request.reason,
          approved_by: approvedBy,
          approval_timestamp: approvedBy ? new Date().toISOString() : null,
          changes_summary: {}
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Perform the restore based on type
      let result;
      switch (request.restoreType) {
        case 'TIME_POINT':
          result = await this.restoreToTimePoint(
            request.organizationId,
            request.targetTimestamp!
          );
          break;

        case 'USER_SESSION':
          result = await this.restoreUserSession(
            request.organizationId,
            request.targetSessionId!
          );
          break;

        case 'RECORD':
          result = await this.restoreRecords(
            request.organizationId,
            request.targetRecords!
          );
          break;

        default:
          throw new Error(`Unsupported restore type: ${request.restoreType}`);
      }

      // Update restore session with results
      await supabase
        .from('restore_history')
        .update({
          changes_summary: { restoredCount: result.restoredCount, errors: result.errors }
        })
        .eq('id', restoreSession.id);

      return result;
    } catch (error) {
      console.error('Error performing restore:', error);
      throw error;
    }
  }

  // Private helper methods

  private mapAuditEntry(raw: any): AuditEntry {
    return {
      id: raw.id,
      organizationId: raw.organization_id,
      tableName: raw.table_name,
      recordId: raw.record_id,
      action: raw.action,
      userId: raw.user_id,
      userEmail: raw.user_email,
      sessionId: raw.session_id,
      oldValues: raw.old_values,
      newValues: raw.new_values,
      changedFields: raw.changed_fields,
      ipAddress: raw.ip_address,
      userAgent: raw.user_agent,
      applicationContext: raw.application_context,
      createdAt: raw.created_at
    };
  }

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || '';
  }

  private async validateRestorePermission(
    organizationId: string,
    restoreType: string
  ): Promise<boolean> {
    // Check if user has restore permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check organization role
    const { data: orgUser } = await supabase
      .from('organization_users')
      .select('role:user_roles(*)')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!orgUser) return false;

    // Check if role has restore permission
    const permissions = orgUser.role?.permissions || [];
    return permissions.includes('restore_data') || permissions.includes('admin');
  }

  private async previewTimePointRestore(
    organizationId: string,
    targetTimestamp: string
  ): Promise<RestorePreview> {
    // Implementation for time point restore preview
    // This would query the audit trail and calculate what would change
    return {
      affectedRecords: [],
      totalChanges: 0,
      warnings: []
    };
  }

  private async previewSessionRestore(
    organizationId: string,
    sessionId: string
  ): Promise<RestorePreview> {
    // Implementation for session restore preview
    return {
      affectedRecords: [],
      totalChanges: 0,
      warnings: []
    };
  }

  private async previewRecordRestore(
    organizationId: string,
    targetRecords: any[]
  ): Promise<RestorePreview> {
    // Implementation for record restore preview
    return {
      affectedRecords: [],
      totalChanges: 0,
      warnings: []
    };
  }

  private async restoreToTimePoint(
    organizationId: string,
    targetTimestamp: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for time point restore
    return { success: true, restoredCount: 0 };
  }

  private async restoreUserSession(
    organizationId: string,
    sessionId: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for session restore
    return { success: true, restoredCount: 0 };
  }

  private async restoreRecords(
    organizationId: string,
    targetRecords: any[]
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for record restore
    return { success: true, restoredCount: 0 };
  }
}

// Export singleton instance
export const backupRestoreService = new BackupRestoreService();