import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { entraIdService } from '@/services/auth/EntraIdService';
import type { EntraIdConnection, GroupMapping, EntraIdUser, SyncReport } from '@/types/entra';

export const useEntraId = () => {
  const [connections, setConnections] = useState<EntraIdConnection[]>([]);
  const [groupMappings, setGroupMappings] = useState<GroupMapping[]>([]);
  const [syncReports, setSyncReports] = useState<SyncReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all Entra ID data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadConnections(),
        loadGroupMappings(),
        loadSyncReports()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    const { data, error } = await supabase
      .from('entra_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Type-safe casting - database columns need mapping
    const typedData = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      tenantId: item.tenant_id,
      clientId: item.client_id,
      clientSecret: item.client_secret,
      redirectUri: item.redirect_uri,
      scopes: item.scopes,
      status: item.status,
      lastSyncAt: item.last_sync_at,
      lastSyncStatus: item.last_sync_status,
      lastTestAt: item.last_test_at,
      autoSync: item.auto_sync,
      syncInterval: item.sync_interval,
      organizationId: item.organization_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as EntraIdConnection[];
    setConnections(typedData);
    return typedData;
  };

  const loadGroupMappings = async () => {
    const { data, error } = await supabase
      .from('entra_group_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Type-safe casting - database columns need mapping
    const typedData = (data || []).map((item: any) => ({
      id: item.id,
      groupId: item.group_id,
      groupName: item.group_name,
      auditReadyRole: item.auditready_role,
      permissions: item.permissions || [],
      organizationId: item.organization_id,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as GroupMapping[];
    setGroupMappings(typedData);
    return typedData;
  };

  const loadSyncReports = async () => {
    const { data, error } = await supabase
      .from('entra_sync_reports')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    // Type-safe casting - database columns need mapping
    const typedData = (data || []).map((item: any) => ({
      id: item.id,
      startedAt: item.started_at,
      completedAt: item.completed_at,
      status: item.status,
      totalUsers: item.total_users,
      usersCreated: item.users_created,
      usersUpdated: item.users_updated,
      usersDisabled: item.users_disabled,
      errors: item.errors,
      errorDetails: item.error_details,
      organizationId: item.organization_id,
      triggeredBy: item.triggered_by
    })) as SyncReport[];
    setSyncReports(typedData);
    return typedData;
  };

  // Create new connection
  const createConnection = async (connectionData: Partial<EntraIdConnection>) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!connectionData.tenantId || !connectionData.clientId || !connectionData.clientSecret) {
        throw new Error('Missing required connection parameters');
      }

      // Test connection first
      await entraIdService.initialize({
        tenantId: connectionData.tenantId,
        clientId: connectionData.clientId,
        clientSecret: connectionData.clientSecret,
        redirectUri: connectionData.redirectUri || `${window.location.origin}/auth/callback/entra`,
        scopes: connectionData.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      const { data, error } = await supabase
        .from('entra_connections')
        .insert({
          name: connectionData.name,
          tenant_id: connectionData.tenantId,
          client_id: connectionData.clientId,
          client_secret: connectionData.clientSecret,
          redirect_uri: connectionData.redirectUri || `${window.location.origin}/auth/callback/entra`,
          scopes: connectionData.scopes || ['openid', 'profile', 'email', 'User.Read'],
          status: 'active',
          auto_sync: false,
          sync_interval: 60
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadConnections();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update connection
  const updateConnection = async (id: string, updates: Partial<EntraIdConnection>) => {
    setLoading(true);
    setError(null);

    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'tenantId':
            dbUpdates['tenant_id'] = value;
            break;
          case 'clientId':
            dbUpdates['client_id'] = value;
            break;
          case 'clientSecret':
            dbUpdates['client_secret'] = value;
            break;
          case 'redirectUri':
            dbUpdates['redirect_uri'] = value;
            break;
          case 'lastSyncAt':
            dbUpdates['last_sync_at'] = value;
            break;
          case 'lastSyncStatus':
            dbUpdates['last_sync_status'] = value;
            break;
          case 'lastTestAt':
            dbUpdates['last_test_at'] = value;
            break;
          case 'autoSync':
            dbUpdates['auto_sync'] = value;
            break;
          case 'syncInterval':
            dbUpdates['sync_interval'] = value;
            break;
          case 'organizationId':
            dbUpdates['organization_id'] = value;
            break;
          case 'updatedAt':
            dbUpdates['updated_at'] = value;
            break;
          default:
            dbUpdates[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('entra_connections')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadConnections();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete connection
  const deleteConnection = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('entra_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Test connection
  const testConnection = async (connection: EntraIdConnection) => {
    setLoading(true);
    setError(null);

    try {
      await entraIdService.initialize({
        tenantId: connection.tenantId,
        clientId: connection.clientId,
        clientSecret: connection.clientSecret!,
        redirectUri: connection.redirectUri || `${window.location.origin}/auth/callback/entra`,
        scopes: connection.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      await updateConnection(connection.id, { 
        status: 'active',
        lastTestAt: new Date().toISOString()
      });

      return true;
    } catch (err) {
      await updateConnection(connection.id, { 
        status: 'error',
        lastTestAt: new Date().toISOString()
      });
      setError(err instanceof Error ? err.message : 'Connection test failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create group mapping
  const createGroupMapping = async (mappingData: Partial<GroupMapping>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('entra_group_mappings')
        .insert({
          group_id: mappingData.groupId,
          group_name: mappingData.groupName,
          auditready_role: mappingData.auditReadyRole,
          permissions: mappingData.permissions || [],
          is_active: mappingData.isActive !== false
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadGroupMappings();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group mapping');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update group mapping
  const updateGroupMapping = async (id: string, updates: Partial<GroupMapping>) => {
    setLoading(true);
    setError(null);

    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'groupId':
            dbUpdates['group_id'] = value;
            break;
          case 'groupName':
            dbUpdates['group_name'] = value;
            break;
          case 'auditReadyRole':
            dbUpdates['auditready_role'] = value;
            break;
          case 'organizationId':
            dbUpdates['organization_id'] = value;
            break;
          case 'isActive':
            dbUpdates['is_active'] = value;
            break;
          case 'createdAt':
            dbUpdates['created_at'] = value;
            break;
          case 'updatedAt':
            dbUpdates['updated_at'] = value;
            break;
          default:
            dbUpdates[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('entra_group_mappings')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadGroupMappings();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group mapping');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete group mapping
  const deleteGroupMapping = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('entra_group_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadGroupMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group mapping');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sync users from Entra ID
  const syncUsers = async (connection: EntraIdConnection) => {
    setLoading(true);
    setError(null);

    try {
      // Create sync report
      const { data: report, error: reportError } = await supabase
        .from('entra_sync_reports')
        .insert({
          status: 'running',
          started_at: new Date().toISOString(),
          connection_id: connection.id,
          triggered_by: 'manual',
          total_users: 0,
          users_created: 0,
          users_updated: 0,
          users_disabled: 0,
          errors: 0
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Initialize service and sync
      await entraIdService.initialize({
        tenantId: connection.tenantId,
        clientId: connection.clientId,
        clientSecret: connection.clientSecret!,
        redirectUri: connection.redirectUri || `${window.location.origin}/auth/callback/entra`,
        scopes: connection.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      const syncResults = await entraIdService.syncAllUsers(groupMappings);

      // Update sync report
      await supabase
        .from('entra_sync_reports')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_users: syncResults.total,
          users_created: syncResults.created,
          users_updated: syncResults.updated,
          users_disabled: syncResults.disabled,
          errors: syncResults.errors
        })
        .eq('id', (report as any).id);

      // Update connection last sync
      await updateConnection(connection.id, {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: 'success'
      });

      await loadSyncReports();
      return syncResults;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'User sync failed');
      
      // Update connection sync status
      await updateConnection(connection.id, {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: 'failed'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user from Entra ID
  const getEntraUser = async (userPrincipalName: string, connection: EntraIdConnection): Promise<EntraIdUser | null> => {
    setLoading(true);
    setError(null);

    try {
      await entraIdService.initialize({
        tenantId: connection.tenantId,
        clientId: connection.clientId,
        clientSecret: connection.clientSecret!,
        redirectUri: connection.redirectUri || `${window.location.origin}/auth/callback/entra`,
        scopes: connection.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      const user = await entraIdService.getUser(userPrincipalName);
      return user;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize hook
  useEffect(() => {
    loadData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscriptions = [
      supabase
        .channel('entra_connections')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'entra_connections' },
          () => loadConnections()
        )
        .subscribe(),
      
      supabase
        .channel('entra_group_mappings')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'entra_group_mappings' },
          () => loadGroupMappings()
        )
        .subscribe(),
      
      supabase
        .channel('entra_sync_reports')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'entra_sync_reports' },
          () => loadSyncReports()
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  return {
    // State
    connections,
    groupMappings,
    syncReports,
    loading,
    error,

    // Actions
    loadData,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    createGroupMapping,
    updateGroupMapping,
    deleteGroupMapping,
    syncUsers,
    getEntraUser,

    // Utilities
    clearError: () => setError(null)
  };
};

export default useEntraId;