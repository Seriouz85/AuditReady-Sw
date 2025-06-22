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
    setConnections(data || []);
    return data || [];
  };

  const loadGroupMappings = async () => {
    const { data, error } = await supabase
      .from('entra_group_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setGroupMappings(data || []);
    return data || [];
  };

  const loadSyncReports = async () => {
    const { data, error } = await supabase
      .from('entra_sync_reports')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setSyncReports(data || []);
    return data || [];
  };

  // Create new connection
  const createConnection = async (connectionData: Partial<EntraIdConnection>) => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      await entraIdService.initialize({
        tenantId: connectionData.tenantId!,
        clientId: connectionData.clientId!,
        clientSecret: connectionData.clientSecret!,
        redirectUri: connectionData.redirectUri!,
        scopes: connectionData.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      const { data, error } = await supabase
        .from('entra_connections')
        .insert({
          name: connectionData.name,
          tenant_id: connectionData.tenantId,
          client_id: connectionData.clientId,
          client_secret: connectionData.clientSecret,
          redirect_uri: connectionData.redirectUri,
          scopes: connectionData.scopes,
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
      const { data, error } = await supabase
        .from('entra_connections')
        .update(updates)
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
      const { data, error } = await supabase
        .from('entra_group_mappings')
        .update(updates)
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
        .eq('id', report.id);

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