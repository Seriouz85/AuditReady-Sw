import { supabase } from '@/lib/supabase';
import { format, subDays, subHours } from 'date-fns';
import { mfaService, MFAVerificationRequest } from '@/services/auth/MFAService';
import { toast } from '@/hooks/use-toast';

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
  // Verify MFA for sensitive operations
  async verifyMFAForOperation(
    organizationId: string,
    operationType: 'restore_data' | 'export_data' | 'delete_data' | 'bulk_operations',
    operationDetails: {
      target: string;
      scope: string;
      recordCount?: number;
      tables?: string[];
    }
  ): Promise<{ verified: boolean; sessionId?: string; error?: string }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { verified: false, error: 'User not authenticated' };
      }

      // Determine risk level based on operation
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (operationType === 'delete_data') {
        riskLevel = 'critical';
      } else if (operationType === 'restore_data' && (operationDetails.recordCount || 0) > 10) {
        riskLevel = 'high';
      } else if (operationType === 'export_data' && operationDetails.scope === 'all') {
        riskLevel = 'high';
      } else if (operationType === 'restore_data' || operationType === 'export_data') {
        riskLevel = 'medium';
      }

      // Check if user has MFA enabled for high/critical operations
      const hasMFA = await mfaService.hasMFAEnabled(user.id);
      
      if (!hasMFA && (riskLevel === 'high' || riskLevel === 'critical')) {
        return { 
          verified: false, 
          error: 'Multi-factor authentication required for this operation. Please enable MFA in your security settings.' 
        };
      }

      // For low/medium-risk operations without MFA, allow with password only
      if (!hasMFA && (riskLevel === 'low' || riskLevel === 'medium')) {
        await this.logSensitiveOperation(
          user.id,
          organizationId,
          operationType,
          `${operationType.replace('_', ' ')} operation on ${operationDetails.target}`,
          { ...operationDetails, risk_level: riskLevel },
          null,
          'password_only',
          riskLevel,
          'success'
        );
        return { verified: true };
      }

      // Map operation type to valid MFA operation types
      const validOperationType: 'restore_data' | 'export_data' | 'delete_data' | 'user_management' = 
        operationType === 'bulk_operations' ? 'user_management' : operationType as any;

      // Request MFA verification
      const verificationRequest: MFAVerificationRequest = {
        operation_type: validOperationType,
        operation_details: {
          target: operationDetails.target,
          scope: operationDetails.scope,
          risk_level: riskLevel
        }
      };

      const verification = await mfaService.requestMFAVerification(verificationRequest);
      
      if (!verification) {
        return { verified: false, error: 'Unable to create MFA verification session' };
      }

      // If no MFA methods required, auto-verify
      if (verification.required_methods.length === 0) {
        await this.logSensitiveOperation(
          user.id,
          organizationId,
          operationType,
          `${operationType.replace('_', ' ')} operation on ${operationDetails.target}`,
          { ...operationDetails, risk_level: riskLevel },
          verification.verification_id,
          'password_only',
          riskLevel,
          'success'
        );
        return { verified: true, sessionId: verification.verification_id };
      }

      // Return verification session for UI to handle
      return { 
        verified: false, 
        sessionId: verification.verification_id,
        error: `MFA verification required. Please verify using: ${verification.required_methods.join(', ')}`
      };

    } catch (error) {
      console.error('Error verifying MFA for operation:', error);
      return { verified: false, error: 'MFA verification failed' };
    }
  }

  // Complete MFA verification with token
  async completeMFAVerification(
    sessionId: string,
    token: string,
    method: 'totp' | 'backup_codes' = 'totp'
  ): Promise<boolean> {
    try {
      const isValid = await mfaService.verifyMFAToken(sessionId, token, method);
      
      if (isValid) {
        toast({
          title: "Verification Successful",
          description: "Multi-factor authentication completed successfully.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }

      return isValid;
    } catch (error) {
      console.error('Error completing MFA verification:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify MFA token. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Log sensitive operations
  async logSensitiveOperation(
    userId: string,
    organizationId: string,
    operationType: string,
    description: string,
    affectedResources: any,
    mfaSessionId?: string | null,
    authLevel: 'password_only' | 'mfa_verified' | 'admin_override' = 'password_only',
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    status: 'success' | 'failed' | 'partial' | 'cancelled' = 'success'
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_sensitive_operation', {
        p_user_id: userId,
        p_organization_id: organizationId,
        p_operation_type: operationType,
        p_operation_description: description,
        p_affected_resources: affectedResources,
        p_mfa_session_id: mfaSessionId,
        p_authorization_level: authLevel,
        p_risk_level: riskLevel,
        p_operation_status: status
      });

      if (error) {
        console.error('Error logging sensitive operation:', error);
      }
    } catch (error) {
      console.error('Error logging sensitive operation:', error);
    }
  }

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
      // Check if this is demo account
      if (organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d') {
        return this.getDemoAuditTrail(options);
      }

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
      // Check if this is demo account
      if (organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d') {
        return this.getDemoRestorePoints(days);
      }

      const startDate = subDays(new Date(), days).toISOString();
      
      // Get daily summaries
      const { data: _data, error } = await supabase.rpc('get_restore_points', {
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
    _options: {
      startDate?: string;
      endDate?: string;
      userId?: string;
    } = {}
  ): Promise<UserActivity[]> {
    try {
      // Check if this is demo account
      if (organizationId === '34adc4bb-d1e7-43bd-8249-89c76520533d') {
        return this.getDemoUserActivity();
      }

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
      
      data?.forEach((session: any) => {
        const sessionId = String(session?.id || '');
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, []);
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
    approvedBy?: string,
    mfaSessionId?: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate permissions
      const hasPermission = await this.validateRestorePermission(
        request.organizationId,
        request.restoreType
      );

      if (!hasPermission) {
        await this.logSensitiveOperation(
          user.id,
          request.organizationId,
          'restore_data',
          `Failed restore attempt: ${request.restoreType}`,
          { restore_type: request.restoreType, reason: request.reason },
          mfaSessionId,
          'password_only',
          'high',
          'failed'
        );
        throw new Error('Insufficient permissions for restore operation');
      }

      // Verify MFA for restore operations
      if (!mfaSessionId) {
        const recordCount = request.targetRecords?.reduce((sum, r) => sum + r.recordIds.length, 0) || 1;
        
        const mfaResult = await this.verifyMFAForOperation(
          request.organizationId,
          'restore_data',
          {
            target: request.restoreType,
            scope: recordCount > 1 ? 'multiple' : 'single',
            recordCount: recordCount,
            tables: request.targetRecords?.map(r => r.tableName) || []
          }
        );

        if (!mfaResult.verified) {
          if (mfaResult.sessionId) {
            // Return session ID for UI to handle MFA
            throw new Error(`MFA_REQUIRED:${mfaResult.sessionId}:${mfaResult.error}`);
          } else {
            throw new Error(mfaResult.error || 'MFA verification required');
          }
        }

        mfaSessionId = mfaResult.sessionId;
      }

      // Check if approval is required
      if (request.requiresApproval && !approvedBy) {
        await this.logSensitiveOperation(
          user.id,
          request.organizationId,
          'restore_data',
          `Restore attempt without required approval: ${request.restoreType}`,
          { restore_type: request.restoreType, reason: request.reason },
          mfaSessionId,
          mfaSessionId ? 'mfa_verified' : 'password_only',
          'high',
          'failed'
        );
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
        .eq('id', (restoreSession as any)['id']);

      // Log successful operation
      await this.logSensitiveOperation(
        user.id,
        request.organizationId,
        'restore_data',
        `Successful restore operation: ${request.restoreType}`,
        {
          restore_type: request.restoreType,
          reason: request.reason,
          restored_count: result.restoredCount,
          affected_records: request.targetRecords?.flatMap(r => r.recordIds) || []
        },
        mfaSessionId,
        mfaSessionId ? 'mfa_verified' : 'password_only',
        'high',
        'success'
      );

      return result;
    } catch (error) {
      console.error('Error performing restore:', error);
      
      // Log failed operation
      const user = (await supabase.auth.getUser()).data.user;
      if (user && !(error as any)?.message?.includes('MFA_REQUIRED')) {
        await this.logSensitiveOperation(
          user.id,
          request.organizationId,
          'restore_data',
          `Failed restore operation: ${request.restoreType}`,
          {
            restore_type: request.restoreType,
            reason: request.reason,
            error: (error as any)?.message || 'Unknown error'
          },
          mfaSessionId,
          mfaSessionId ? 'mfa_verified' : 'password_only',
          'high',
          'failed'
        );
      }
      
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
    _restoreType: string
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
    const permissions = (orgUser as any)?.role?.permissions || [];
    return permissions.includes('restore_data') || permissions.includes('admin');
  }

  private async previewTimePointRestore(
    _organizationId: string,
    _targetTimestamp: string
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
    _organizationId: string,
    _sessionId: string
  ): Promise<RestorePreview> {
    // Implementation for session restore preview
    return {
      affectedRecords: [],
      totalChanges: 0,
      warnings: []
    };
  }

  private async previewRecordRestore(
    _organizationId: string,
    _targetRecords: any[]
  ): Promise<RestorePreview> {
    // Implementation for record restore preview
    return {
      affectedRecords: [],
      totalChanges: 0,
      warnings: []
    };
  }

  private async restoreToTimePoint(
    _organizationId: string,
    _targetTimestamp: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for time point restore
    return { success: true, restoredCount: 0 };
  }

  private async restoreUserSession(
    _organizationId: string,
    _sessionId: string
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for session restore
    return { success: true, restoredCount: 0 };
  }

  private async restoreRecords(
    _organizationId: string,
    _targetRecords: any[]
  ): Promise<{ success: boolean; restoredCount: number; errors?: string[] }> {
    // Implementation for record restore
    return { success: true, restoredCount: 0 };
  }

  // Demo data methods
  private getDemoAuditTrail(options: any): { data: AuditEntry[]; count: number } {
    const now = new Date();
    const mockEntries: AuditEntry[] = [
      {
        id: 'demo-audit-1',
        organizationId: '34adc4bb-d1e7-43bd-8249-89c76520533d',
        tableName: 'organization_requirements',
        recordId: 'req-demo-1',
        action: 'UPDATE',
        userId: 'demo-user-1',
        userEmail: 'demo@auditready.com',
        sessionId: 'session-demo-1',
        oldValues: { status: 'not_started', notes: '' },
        newValues: { status: 'in_progress', notes: 'Working on implementation' },
        changedFields: ['status', 'notes'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Demo Browser',
        applicationContext: { feature: 'requirements', action: 'status_update' },
        createdAt: subHours(now, 2).toISOString()
      },
      {
        id: 'demo-audit-2',
        organizationId: '34adc4bb-d1e7-43bd-8249-89c76520533d',
        tableName: 'assessments',
        recordId: 'assessment-demo-1',
        action: 'INSERT',
        userId: 'demo-user-2',
        userEmail: 'ciso@democorp.com',
        sessionId: 'session-demo-2',
        oldValues: null,
        newValues: { name: 'Q1 Compliance Review', type: 'quarterly', status: 'active' },
        changedFields: ['name', 'type', 'status'],
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 Demo Browser',
        applicationContext: { feature: 'assessments', action: 'create' },
        createdAt: subHours(now, 4).toISOString()
      },
      {
        id: 'demo-audit-3',
        organizationId: '34adc4bb-d1e7-43bd-8249-89c76520533d',
        tableName: 'documents',
        recordId: 'doc-demo-1',
        action: 'UPDATE',
        userId: 'demo-user-1',
        userEmail: 'demo@auditready.com',
        sessionId: 'session-demo-1',
        oldValues: { content: 'Draft policy', status: 'draft' },
        newValues: { content: 'Updated security policy with new requirements', status: 'review' },
        changedFields: ['content', 'status'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Demo Browser',
        applicationContext: { feature: 'documents', action: 'edit' },
        createdAt: subHours(now, 6).toISOString()
      },
      {
        id: 'demo-audit-4',
        organizationId: '34adc4bb-d1e7-43bd-8249-89c76520533d',
        tableName: 'organization_requirements',
        recordId: 'req-demo-2',
        action: 'UPDATE',
        userId: 'demo-user-3',
        userEmail: 'analyst@democorp.com',
        sessionId: 'session-demo-3',
        oldValues: { status: 'not_started', evidence_count: 0 },
        newValues: { status: 'completed', evidence_count: 3 },
        changedFields: ['status', 'evidence_count'],
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 Demo Browser',
        applicationContext: { feature: 'requirements', action: 'evidence_upload' },
        createdAt: subDays(now, 1).toISOString()
      },
      {
        id: 'demo-audit-5',
        organizationId: '34adc4bb-d1e7-43bd-8249-89c76520533d',
        tableName: 'users',
        recordId: 'demo-user-4',
        action: 'INSERT',
        userId: 'demo-user-1',
        userEmail: 'demo@auditready.com',
        sessionId: 'session-demo-4',
        oldValues: null,
        newValues: { email: 'newuser@democorp.com', role: 'analyst', status: 'invited' },
        changedFields: ['email', 'role', 'status'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Demo Browser',
        applicationContext: { feature: 'user_management', action: 'invite' },
        createdAt: subDays(now, 2).toISOString()
      }
    ];

    // Apply filters
    let filteredEntries = mockEntries;

    if (options.startDate) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.createdAt >= options.startDate
      );
    }
    if (options.endDate) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.createdAt <= options.endDate
      );
    }
    if (options.userId) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.userId === options.userId
      );
    }
    if (options.tableName) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.tableName === options.tableName
      );
    }
    if (options.action) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.action === options.action
      );
    }

    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);

    return {
      data: paginatedEntries,
      count: filteredEntries.length
    };
  }

  private getDemoRestorePoints(days: number): RestorePoint[] {
    const now = new Date();
    const restorePoints: RestorePoint[] = [];

    // Add some meaningful restore points with demo data
    restorePoints.push({
      timestamp: subHours(now, 2).toISOString(),
      label: '2 hours ago',
      description: 'Before bulk requirement updates',
      changeCount: 15,
      affectedTables: ['organization_requirements', 'assessments'],
      user: {
        id: 'demo-user-1',
        email: 'demo@auditready.com'
      }
    });

    restorePoints.push({
      timestamp: subHours(now, 6).toISOString(),
      label: '6 hours ago',
      description: 'Before policy document changes',
      changeCount: 8,
      affectedTables: ['documents', 'organization_requirements'],
      user: {
        id: 'demo-user-2',
        email: 'ciso@democorp.com'
      }
    });

    // Add hourly points for last 24 hours
    for (let i = 1; i <= Math.min(24, days * 24); i++) {
      const timestamp = subHours(now, i);
      if (!restorePoints.some(p => p.timestamp === timestamp.toISOString())) {
        restorePoints.push({
          timestamp: timestamp.toISOString(),
          label: `${i} hour${i > 1 ? 's' : ''} ago`,
          changeCount: Math.floor(Math.random() * 5),
          affectedTables: ['organization_requirements', 'assessments', 'documents']
        });
      }
    }

    // Add daily points
    for (let i = 1; i <= days; i++) {
      const timestamp = subDays(now, i);
      restorePoints.push({
        timestamp: timestamp.toISOString(),
        label: `${i} day${i > 1 ? 's' : ''} ago`,
        description: `Daily snapshot - ${format(timestamp, 'MMM d, yyyy')}`,
        changeCount: Math.floor(Math.random() * 25) + 5,
        affectedTables: ['organization_requirements', 'assessments', 'documents', 'users']
      });
    }

    return restorePoints.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private getDemoUserActivity(): UserActivity[] {
    const now = new Date();
    
    return [
      {
        userId: 'demo-user-1',
        userEmail: 'demo@auditready.com',
        sessionId: 'session-demo-1',
        startTime: subHours(now, 3).toISOString(),
        endTime: subHours(now, 2).toISOString(),
        changeCount: 12,
        affectedTables: ['organization_requirements', 'documents'],
        summary: {
          inserts: 2,
          updates: 8,
          deletes: 2
        }
      },
      {
        userId: 'demo-user-2',
        userEmail: 'ciso@democorp.com',
        sessionId: 'session-demo-2',
        startTime: subHours(now, 5).toISOString(),
        endTime: subHours(now, 4).toISOString(),
        changeCount: 6,
        affectedTables: ['assessments', 'documents'],
        summary: {
          inserts: 3,
          updates: 3,
          deletes: 0
        }
      },
      {
        userId: 'demo-user-3',
        userEmail: 'analyst@democorp.com',
        sessionId: 'session-demo-3',
        startTime: subDays(now, 1).toISOString(),
        endTime: subDays(now, 1).toISOString(),
        changeCount: 4,
        affectedTables: ['organization_requirements'],
        summary: {
          inserts: 0,
          updates: 4,
          deletes: 0
        }
      }
    ];
  }
}

// Export singleton instance
export const backupRestoreService = new BackupRestoreService();