import { supabase } from '@/lib/supabase';

export interface AuditLogData {
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  organization_id?: string;
}

export class AuditLogger {
  async log(
    action: string,
    resourceType: string,
    resourceId: string,
    data: AuditLogData = {}
  ) {
    try {
      // Get current user context
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user is platform admin using the function
      let isPlatformAdmin = false;
      try {
        const { data: adminCheck } = await supabase.rpc('is_platform_admin');
        isPlatformAdmin = adminCheck || false;
      } catch (error) {
        console.warn('Could not check platform admin status:', error);
      }
      
      const logEntry = {
        actor_id: user?.id || null,
        actor_type: isPlatformAdmin ? 'platform_admin' : 'organization_user',
        actor_email: user?.email || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: {
          old_values: data.old_values,
          new_values: data.new_values,
          organization_id: data.organization_id
        },
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || (typeof window !== 'undefined' ? window.navigator.userAgent : null),
        session_id: data.session_id || null
      };

      // In development mode, log to console instead of database if table doesn't exist
      if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        try {
          const { error } = await supabase
            .from('enhanced_audit_logs')
            .insert([logEntry]);

          if (error) {
            console.warn('Audit logging to database failed, logging to console instead:', error);
            console.log('Audit Event (Console):', {
              action,
              table_name: resourceType,
              record_id: resourceId,
              actor_id: logEntry.actor_id,
              details: logEntry.details
            });
          }
        } catch (dbError) {
          console.warn('Database audit logging unavailable, logging to console:', dbError);
          console.log('Audit Event (Console):', {
            action,
            table_name: resourceType,
            record_id: resourceId,
            actor_id: logEntry.actor_id,
            details: logEntry.details
          });
        }
      } else {
        // Production mode - throw error if audit logging fails
        const { error } = await supabase
          .from('enhanced_audit_logs')
          .insert([logEntry]);

        if (error) {
          console.error('Failed to log audit event:', error);
          throw new Error('Audit logging failed in production');
        }
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      console.log('Audit Event (Fallback):', {
        action,
        table_name: resourceType,
        record_id: resourceId,
        timestamp: new Date().toISOString()
      });
      // In development mode, don't fail the operation
      if (!(import.meta.env.DEV || window.location.hostname === 'localhost')) {
        throw error;
      }
    }
  }

  async getRecentActivity(limit = 50) {
    const { data, error } = await supabase
      .from('enhanced_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getUserActivity(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('enhanced_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getOrganizationActivity(organizationId: string, limit = 50) {
    const { data, error } = await supabase
      .from('enhanced_audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getActivityByAction(action: string, limit = 50) {
    const { data, error } = await supabase
      .from('enhanced_audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}