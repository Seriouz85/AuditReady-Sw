/**
 * Direct Supabase API Implementation for SaaS Admin Console
 * Based on Supabase documentation and best practices
 */

import { supabase } from '@/lib/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Enhanced Supabase Configuration
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

// Get admin client with service role key (singleton to avoid multiple instances)
let adminClientInstance: SupabaseClient | null = null;
const getAdminClient = (): SupabaseClient => {
  if (!adminClientInstance) {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    
    if (!serviceRoleKey || !url) {
      console.warn('Service role key not available, using regular client');
      return supabase;
    }
    
    adminClientInstance = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  return adminClientInstance;
};

// User Management with Admin API
export class SupabaseAuthAdminAPI {
  private static adminClient = getAdminClient();

  // Create user with email verification
  static async createUser(data: {
    email: string;
    password?: string;
    phone?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
    email_confirm?: boolean;
    phone_confirm?: boolean;
  }) {
    const { data: user, error } = await this.adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      phone: data.phone,
      user_metadata: data.user_metadata || {},
      app_metadata: data.app_metadata || {},
      email_confirm: data.email_confirm ?? false,
      phone_confirm: data.phone_confirm ?? false,
    });

    if (error) throw error;
    return user;
  }

  // Invite user by email
  static async inviteUserByEmail(email: string, options?: {
    data?: Record<string, any>;
    redirectTo?: string;
  }) {
    const { data, error } = await this.adminClient.auth.admin.inviteUserByEmail(email, {
      data: options?.data,
      redirectTo: options?.redirectTo,
    });

    if (error) throw error;
    return data;
  }

  // List users with pagination
  static async listUsers(params?: {
    page?: number;
    perPage?: number;
  }) {
    const { data, error } = await this.adminClient.auth.admin.listUsers({
      page: params?.page || 1,
      perPage: params?.perPage || 50,
    });

    if (error) throw error;
    return data;
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const { data, error } = await this.adminClient.auth.admin.getUserById(userId);
    if (error) throw error;
    return data;
  }

  // Update user
  static async updateUserById(userId: string, updates: {
    email?: string;
    phone?: string;
    password?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
    email_confirm?: boolean;
    phone_confirm?: boolean;
    ban_duration?: string;
  }) {
    const { data, error } = await this.adminClient.auth.admin.updateUserById(userId, {
      email: updates.email,
      phone: updates.phone,
      password: updates.password,
      user_metadata: updates.user_metadata,
      app_metadata: updates.app_metadata,
      email_confirm: updates.email_confirm,
      phone_confirm: updates.phone_confirm,
      ban_duration: updates.ban_duration,
    });

    if (error) throw error;
    return data;
  }

  // Delete user
  static async deleteUser(userId: string) {
    const { data, error } = await this.adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
    return data;
  }

  // Generate access token for user
  static async generateAccessToken(userId: string) {
    const { data, error } = await this.adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: '', // Will be filled by user ID lookup
      options: {
        redirectTo: '/dashboard',
      },
    });

    if (error) throw error;
    return data;
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, redirectTo?: string) {
    const { data, error } = await this.adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: redirectTo || '/auth/reset-password',
      },
    });

    if (error) throw error;
    return data;
  }

  // Ban/unban user
  static async banUser(userId: string, duration?: string) {
    return this.updateUserById(userId, { ban_duration: duration || 'none' });
  }

  static async unbanUser(userId: string) {
    return this.updateUserById(userId, { ban_duration: 'none' });
  }
}

// Database Operations with RLS
export class SupabaseDatabaseAPI {
  private static client = supabase;
  private static adminClient = getAdminClient();

  // Generic query builder with RLS bypass option
  static query<T = any>(table: string, bypassRLS = false): any {
    const client = bypassRLS ? this.adminClient : this.client;
    return client.from(table);
  }

  // Execute raw SQL with optional RLS bypass
  static async executeSQL(query: string, params?: any[], bypassRLS = false) {
    const client = bypassRLS ? this.adminClient : this.client;
    const { data, error } = await client.rpc('execute_sql', {
      sql_query: query,
      parameters: params || [],
    });

    if (error) throw error;
    return data;
  }

  // Create RLS policy
  static async createRLSPolicy(options: {
    table: string;
    name: string;
    command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
    role?: string;
    using?: string;
    withCheck?: string;
  }) {
    let sql = `CREATE POLICY ${options.name} ON ${options.table}`;
    
    if (options.command !== 'ALL') {
      sql += ` FOR ${options.command}`;
    }
    
    if (options.role) {
      sql += ` TO ${options.role}`;
    }
    
    if (options.using) {
      sql += ` USING (${options.using})`;
    }
    
    if (options.withCheck) {
      sql += ` WITH CHECK (${options.withCheck})`;
    }

    return this.executeSQL(sql, [], true);
  }

  // Enable RLS on table
  static async enableRLS(table: string) {
    return this.executeSQL(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, [], true);
  }

  // Disable RLS on table
  static async disableRLS(table: string) {
    return this.executeSQL(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`, [], true);
  }

  // Get table info
  static async getTableInfo(table: string) {
    const { data, error } = await this.adminClient
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', table)
      .eq('table_schema', 'public');

    if (error) throw error;
    return data;
  }

  // Get RLS policies for table
  static async getRLSPolicies(table: string) {
    const { data, error } = await this.adminClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', table);

    if (error) throw error;
    return data;
  }

  // Bulk insert with conflict resolution
  static async bulkInsert(table: string, data: any[], options?: {
    onConflict?: string;
    ignoreDuplicates?: boolean;
    bypassRLS?: boolean;
  }) {
    const client = options?.bypassRLS ? this.adminClient : this.client;
    let query = client.from(table).insert(data);

    if (options?.onConflict) {
      query = query.onConflict(options.onConflict);
    }

    if (options?.ignoreDuplicates) {
      query = query.ignoreDuplicates();
    }

    const { data: result, error } = await query.select();
    if (error) throw error;
    return result;
  }

  // Bulk update
  static async bulkUpdate(table: string, updates: any[], matchColumn: string, options?: {
    bypassRLS?: boolean;
  }) {
    const client = options?.bypassRLS ? this.adminClient : this.client;
    const results = [];

    for (const update of updates) {
      const matchValue = update[matchColumn];
      const updateData = { ...update };
      delete updateData[matchColumn];

      const { data, error } = await client
        .from(table)
        .update(updateData)
        .eq(matchColumn, matchValue)
        .select();

      if (error) throw error;
      results.push(data);
    }

    return results.flat();
  }

  // Get table statistics
  static async getTableStats(table: string) {
    const { data, error } = await this.adminClient.rpc('get_table_stats', {
      table_name: table,
    });

    if (error) throw error;
    return data;
  }
}

// Edge Functions Management
export class SupabaseEdgeFunctionsAPI {
  private static adminClient = getAdminClient();

  // Invoke edge function
  static async invoke(functionName: string, options?: {
    body?: any;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  }) {
    const { data, error } = await this.adminClient.functions.invoke(functionName, {
      body: options?.body,
      headers: options?.headers,
      method: options?.method,
    });

    if (error) throw error;
    return data;
  }

  // Get function logs (requires admin privileges)
  static async getFunctionLogs(functionName: string, options?: {
    limit?: number;
    level?: 'error' | 'warn' | 'info' | 'debug';
    startTime?: string;
    endTime?: string;
  }) {
    // This would typically require admin API access
    console.warn('Function logs require platform admin access');
    return null;
  }

  // Test function health
  static async healthCheck(functionName: string) {
    try {
      const startTime = Date.now();
      await this.invoke(functionName, { body: { health_check: true } });
      const duration = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime: duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Storage Operations
export class SupabaseStorageAPI {
  private static client = supabase;
  private static adminClient = getAdminClient();

  // Upload file
  static async uploadFile(bucket: string, path: string, file: File | Blob, options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
    bypassRLS?: boolean;
  }) {
    const client = options?.bypassRLS ? this.adminClient : this.client;
    
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl,
        contentType: options?.contentType,
        upsert: options?.upsert,
      });

    if (error) throw error;
    return data;
  }

  // Download file
  static async downloadFile(bucket: string, path: string, bypassRLS = false) {
    const client = bypassRLS ? this.adminClient : this.client;
    
    const { data, error } = await client.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }

  // Get file URL
  static getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Create signed URL
  static async createSignedUrl(bucket: string, path: string, expiresIn: number, bypassRLS = false) {
    const client = bypassRLS ? this.adminClient : this.client;
    
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  }

  // List files
  static async listFiles(bucket: string, path?: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
    bypassRLS?: boolean;
  }) {
    const client = options?.bypassRLS ? this.adminClient : this.client;
    
    const { data, error } = await client.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit,
        offset: options?.offset,
        sortBy: options?.sortBy,
      });

    if (error) throw error;
    return data;
  }

  // Delete file
  static async deleteFile(bucket: string, paths: string | string[], bypassRLS = false) {
    const client = bypassRLS ? this.adminClient : this.client;
    const pathsArray = Array.isArray(paths) ? paths : [paths];
    
    const { data, error } = await client.storage
      .from(bucket)
      .remove(pathsArray);

    if (error) throw error;
    return data;
  }

  // Create bucket
  static async createBucket(bucketId: string, options?: {
    public?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  }) {
    const { data, error } = await this.adminClient.storage.createBucket(bucketId, {
      public: options?.public ?? false,
      fileSizeLimit: options?.fileSizeLimit,
      allowedMimeTypes: options?.allowedMimeTypes,
    });

    if (error) throw error;
    return data;
  }

  // Delete bucket
  static async deleteBucket(bucketId: string) {
    const { data, error } = await this.adminClient.storage.deleteBucket(bucketId);
    if (error) throw error;
    return data;
  }

  // Get bucket details
  static async getBucket(bucketId: string) {
    const { data, error } = await this.adminClient.storage.getBucket(bucketId);
    if (error) throw error;
    return data;
  }

  // List buckets
  static async listBuckets() {
    const { data, error } = await this.adminClient.storage.listBuckets();
    if (error) throw error;
    return data;
  }
}

// Real-time Subscriptions
export class SupabaseRealtimeAPI {
  private static client = supabase;

  // Subscribe to table changes
  static subscribeToTable(table: string, options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    filter?: string;
  }) {
    let subscription = this.client
      .channel(`table-${table}`)
      .on('postgres_changes', {
        event: options?.event || '*',
        schema: options?.schema || 'public',
        table: table,
        filter: options?.filter,
      }, (payload) => {
        console.log('Change received:', payload);
      });

    return subscription;
  }

  // Subscribe to user presence
  static subscribeToPresence(channelName: string, userInfo: Record<string, any>) {
    const channel = this.client.channel(channelName, {
      config: { presence: { key: userInfo.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence sync:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userInfo);
      }
    });

    return channel;
  }

  // Send broadcast message
  static async broadcast(channelName: string, event: string, payload: any) {
    const channel = this.client.channel(channelName);
    
    await channel.subscribe();
    
    const { error } = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    if (error) throw error;
    return true;
  }

  // Unsubscribe from channel
  static unsubscribe(channel: any) {
    return this.client.removeChannel(channel);
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    return this.client.removeAllChannels();
  }
}

// Analytics and Monitoring
export class SupabaseAnalyticsAPI {
  private static adminClient = getAdminClient();

  // Get database usage stats
  static async getDatabaseUsage() {
    const { data, error } = await this.adminClient.rpc('get_database_usage');
    if (error) throw error;
    return data;
  }

  // Get API usage stats
  static async getAPIUsage(startDate?: string, endDate?: string) {
    // This would typically require admin API access
    console.warn('API usage stats require platform admin access');
    return null;
  }

  // Get active connections
  static async getActiveConnections() {
    const { data, error } = await this.adminClient.rpc('get_active_connections');
    if (error) throw error;
    return data;
  }

  // Get slow queries
  static async getSlowQueries(limit = 10) {
    const { data, error } = await this.adminClient.rpc('get_slow_queries', {
      query_limit: limit,
    });
    if (error) throw error;
    return data;
  }

  // Custom analytics queries
  static async runAnalyticsQuery(query: string, params?: any[]) {
    return SupabaseDatabaseAPI.executeSQL(query, params, true);
  }
}

// Organization Management with Multi-tenancy
export class SupabaseOrganizationAPI {
  // Create organization with proper RLS setup
  static async createOrganization(orgData: {
    name: string;
    slug: string;
    subscription_tier?: string;
    owner_id: string;
  }) {
    const { data: org, error: orgError } = await SupabaseDatabaseAPI.query('organizations', true)
      .insert({
        name: orgData.name,
        slug: orgData.slug,
        subscription_tier: orgData.subscription_tier || 'free',
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Create owner relationship
    const { error: ownerError } = await SupabaseDatabaseAPI.query('organization_users', true)
      .insert({
        organization_id: org.id,
        user_id: orgData.owner_id,
        role: 'owner',
        status: 'active',
      });

    if (ownerError) throw ownerError;

    return org;
  }

  // Add user to organization
  static async addUserToOrganization(orgId: string, userId: string, role: string) {
    const { data, error } = await SupabaseDatabaseAPI.query('organization_users', true)
      .insert({
        organization_id: orgId,
        user_id: userId,
        role,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remove user from organization
  static async removeUserFromOrganization(orgId: string, userId: string) {
    const { error } = await SupabaseDatabaseAPI.query('organization_users', true)
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  // Get organization users
  static async getOrganizationUsers(orgId: string) {
    const { data, error } = await SupabaseDatabaseAPI.query('organization_users')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }

  // Update user role in organization
  static async updateUserRole(orgId: string, userId: string, newRole: string) {
    const { data, error } = await SupabaseDatabaseAPI.query('organization_users', true)
      .update({ role: newRole })
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user's organizations
  static async getUserOrganizations(userId: string) {
    const { data, error } = await SupabaseDatabaseAPI.query('organization_users')
      .select(`
        role,
        status,
        organization:organization_id (
          id,
          name,
          slug,
          subscription_tier
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }
}

// Main Supabase API class
export class SupabaseDirectAPI {
  static Auth = SupabaseAuthAdminAPI;
  static Database = SupabaseDatabaseAPI;
  static EdgeFunctions = SupabaseEdgeFunctionsAPI;
  static Storage = SupabaseStorageAPI;
  static Realtime = SupabaseRealtimeAPI;
  static Analytics = SupabaseAnalyticsAPI;
  static Organization = SupabaseOrganizationAPI;

  // Utility methods
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('organizations').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  static async getProjectInfo() {
    // This would require platform API access
    return {
      id: 'project-id',
      name: 'AuditReady',
      region: 'us-east-1',
      status: 'active',
    };
  }

  // Helper for common multi-tenant queries
  static getOrganizationQuery<T = any>(table: string, organizationId: string) {
    return SupabaseDatabaseAPI.query(table)
      .eq('organization_id', organizationId);
  }

  // Helper for user-scoped queries
  static getUserQuery<T = any>(table: string, userId: string) {
    return SupabaseDatabaseAPI.query(table)
      .eq('user_id', userId);
  }

  // Batch operations helper
  static async batchOperations(operations: Array<() => Promise<any>>) {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    return { successful, failed };
  }
}

export default SupabaseDirectAPI;