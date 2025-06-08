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
      
      const logEntry = {
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        user_id: user?.id || null,
        user_email: user?.email || null,
        organization_id: data.organization_id || null,
        old_values: data.old_values || null,
        new_values: data.new_values || null,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || (typeof window !== 'undefined' ? window.navigator.userAgent : null),
        session_id: data.session_id || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('enhanced_audit_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
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