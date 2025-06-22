import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings, 
  RefreshCw, 
  Download, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { entraIdService } from '@/services/auth/EntraIdService';
import { toast } from '@/utils/toast';
import type { EntraIdConfig, GroupMapping, SyncReport, EntraIdConnection } from '@/types/entra';

export const EnterpriseSSO = () => {
  const { theme, isDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<EntraIdConnection[]>([]);
  const [groupMappings, setGroupMappings] = useState<GroupMapping[]>([]);
  const [syncReports, setSyncReports] = useState<SyncReport[]>([]);
  const [activeTab, setActiveTab] = useState('connections');

  // Connection form state
  const [connectionForm, setConnectionForm] = useState<Partial<EntraIdConfig & { name: string }>>({
    name: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/callback/entra`,
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    autoProvision: true,
    defaultRole: 'viewer'
  });

  // Group mapping form state
  const [mappingForm, setMappingForm] = useState<Partial<GroupMapping>>({
    groupId: '',
    groupName: '',
    auditReadyRole: 'viewer',
    permissions: [],
    isActive: true
  });

  useEffect(() => {
    if (isDemo) {
      // Load demo data
      setConnections([
        {
          id: 'demo-conn-1',
          name: 'Demo Production AD',
          tenantId: 'demo-tenant-123',
          clientId: 'demo-client-456',
          clientSecret: 'demo-secret-789',
          redirectUri: 'https://demo.auditready.io/auth/callback/entra',
          scopes: ['openid', 'profile', 'email', 'User.Read'],
          status: 'active',
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          lastSyncStatus: 'success',
          autoSync: true,
          syncInterval: 60,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        },
        {
          id: 'demo-conn-2', 
          name: 'Demo Dev Environment',
          tenantId: 'demo-dev-tenant-123',
          clientId: 'demo-dev-client-456',
          clientSecret: 'demo-dev-secret-789',
          redirectUri: 'https://dev.auditready.io/auth/callback/entra',
          scopes: ['openid', 'profile', 'email', 'User.Read'],
          status: 'inactive',
          lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          lastSyncStatus: 'success',
          autoSync: false,
          syncInterval: 120,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
        }
      ]);
      
      setGroupMappings([
        {
          id: 'demo-group-1',
          groupId: 'demo-admin-group-123',
          groupName: 'AuditReady Administrators',
          auditReadyRole: 'admin',
          permissions: ['admin_access', 'user_management', 'system_settings'],
          isActive: true,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-group-2',
          groupId: 'demo-ciso-group-456', 
          groupName: 'Security Officers',
          auditReadyRole: 'ciso',
          permissions: ['compliance_management', 'audit_oversight'],
          isActive: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-group-3',
          groupId: 'demo-analyst-group-789',
          groupName: 'Security Analysts',
          auditReadyRole: 'analyst',
          permissions: ['requirements_management', 'assessment_execution'],
          isActive: true,
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      setSyncReports([
        {
          id: 'demo-sync-1',
          status: 'completed',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
          connectionId: 'demo-conn-1',
          triggeredBy: 'scheduled',
          totalUsers: 250,
          usersCreated: 12,
          usersUpdated: 8,
          usersDisabled: 2,
          errors: 0
        },
        {
          id: 'demo-sync-2',
          status: 'completed',
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 52000).toISOString(),
          connectionId: 'demo-conn-1',
          triggeredBy: 'manual',
          totalUsers: 248,
          usersCreated: 5,
          usersUpdated: 15,
          usersDisabled: 1,
          errors: 0
        },
        {
          id: 'demo-sync-3',
          status: 'failed',
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12000).toISOString(),
          connectionId: 'demo-conn-2',
          triggeredBy: 'manual',
          totalUsers: 0,
          usersCreated: 0,
          usersUpdated: 0,
          usersDisabled: 0,
          errors: 1
        }
      ]);
    } else {
      loadConnections();
      loadGroupMappings();
      loadSyncReports();
    }
  }, [isDemo]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('entra_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load SSO connections');
    }
  };

  const loadGroupMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('entra_group_mappings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroupMappings(data || []);
    } catch (error) {
      console.error('Error loading group mappings:', error);
      toast.error('Failed to load group mappings');
    }
  };

  const loadSyncReports = async () => {
    try {
      const { data, error } = await supabase
        .from('entra_sync_reports')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncReports(data || []);
    } catch (error) {
      console.error('Error loading sync reports:', error);
      toast.error('Failed to load sync reports');
    }
  };

  const handleCreateConnection = async () => {
    if (!connectionForm.name || !connectionForm.tenantId || !connectionForm.clientId || !connectionForm.clientSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isDemo) {
      toast.info('Demo Mode: Connection would be created and tested with Microsoft Entra ID');
      return;
    }

    setLoading(true);
    try {
      // Test the connection first
      await entraIdService.initialize({
        tenantId: connectionForm.tenantId!,
        clientId: connectionForm.clientId!,
        clientSecret: connectionForm.clientSecret!,
        redirectUri: connectionForm.redirectUri!,
        scopes: connectionForm.scopes!,
        authority: connectionForm.authority,
        domainHint: connectionForm.domainHint
      });

      // Save to database
      const { error } = await supabase
        .from('entra_connections')
        .insert({
          name: connectionForm.name,
          tenant_id: connectionForm.tenantId,
          client_id: connectionForm.clientId,
          client_secret: connectionForm.clientSecret,
          redirect_uri: connectionForm.redirectUri,
          scopes: connectionForm.scopes,
          authority: connectionForm.authority,
          domain_hint: connectionForm.domainHint,
          auto_provision: connectionForm.autoProvision,
          default_role: connectionForm.defaultRole,
          status: 'active',
          auto_sync: false,
          sync_interval: 60
        });

      if (error) throw error;

      toast.success('SSO connection created successfully');
      setConnectionForm({
        name: '',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback/entra`,
        scopes: ['openid', 'profile', 'email', 'User.Read'],
        autoProvision: true,
        defaultRole: 'viewer'
      });
      loadConnections();

    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create connection');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupMapping = async () => {
    if (!mappingForm.groupId || !mappingForm.groupName || !mappingForm.auditReadyRole) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isDemo) {
      toast.info('Demo Mode: Group mapping would be created in production');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('entra_group_mappings')
        .insert({
          group_id: mappingForm.groupId,
          group_name: mappingForm.groupName,
          auditready_role: mappingForm.auditReadyRole,
          permissions: mappingForm.permissions || [],
          is_active: mappingForm.isActive
        });

      if (error) throw error;

      toast.success('Group mapping created successfully');
      setMappingForm({
        groupId: '',
        groupName: '',
        auditReadyRole: 'viewer',
        permissions: [],
        isActive: true
      });
      loadGroupMappings();

    } catch (error) {
      console.error('Error creating group mapping:', error);
      toast.error('Failed to create group mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (connection: EntraIdConnection) => {
    if (isDemo) {
      toast.success('Demo Mode: Connection test successful - Microsoft Entra ID authenticated');
      return;
    }

    setLoading(true);
    try {
      await entraIdService.initialize({
        tenantId: connection.tenantId,
        clientId: connection.clientId,
        clientSecret: connection.clientSecret!,
        redirectUri: connection.redirectUri || `${window.location.origin}/auth/callback/entra`,
        scopes: connection.scopes || ['openid', 'profile', 'email', 'User.Read']
      });

      // Update connection status
      await supabase
        .from('entra_connections')
        .update({ 
          status: 'active',
          last_test_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      toast.success('Connection test successful');
      loadConnections();

    } catch (error) {
      console.error('Connection test failed:', error);
      
      await supabase
        .from('entra_connections')
        .update({ 
          status: 'error',
          last_test_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      toast.error(error instanceof Error ? error.message : 'Connection test failed');
      loadConnections();
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUsers = async (connection: EntraIdConnection) => {
    if (isDemo) {
      toast.success('Demo Mode: Synced 15 users - 3 created, 12 updated from Entra ID');
      return;
    }

    setLoading(true);
    try {
      // Create sync report
      const { data: report, error: reportError } = await supabase
        .from('entra_sync_reports')
        .insert({
          status: 'running',
          started_at: new Date().toISOString(),
          connection_id: connection.id,
          triggered_by: 'manual'
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
      await supabase
        .from('entra_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success'
        })
        .eq('id', connection.id);

      toast.success(`Sync completed: ${syncResults.created} created, ${syncResults.updated} updated`);
      loadConnections();
      loadSyncReports();

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(error instanceof Error ? error.message : 'User sync failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Enterprise SSO
          </h1>
          <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
            Manage Microsoft Entra ID integration and user provisioning
          </p>
          {isDemo && (
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Demo Mode - Showing enterprise features
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="groups">Group Mapping</TabsTrigger>
          <TabsTrigger value="sync">User Sync</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                SSO Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Connection Form */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Connection Name</Label>
                  <Input
                    value={connectionForm.name || ''}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Production Entra ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tenant ID</Label>
                  <Input
                    value={connectionForm.tenantId || ''}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, tenantId: e.target.value }))}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={connectionForm.clientId || ''}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    value={connectionForm.clientSecret || ''}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Client secret value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Role</Label>
                  <Select
                    value={connectionForm.defaultRole}
                    onValueChange={(value) => setConnectionForm(prev => ({ ...prev, defaultRole: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={connectionForm.autoProvision}
                      onCheckedChange={(checked) => setConnectionForm(prev => ({ ...prev, autoProvision: checked }))}
                    />
                    Auto-provision users
                  </Label>
                </div>
                <div className="col-span-2">
                  <Button 
                    onClick={handleCreateConnection}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Connection
                  </Button>
                </div>
              </div>

              {/* Existing Connections */}
              <div className="space-y-2">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tenant: {connection.tenantId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(connection.status)}
                        {connection.lastSyncAt && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(connection)}
                        disabled={loading}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSyncUsers(connection)}
                        disabled={loading}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Mappings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Group Mapping Form */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Group ID</Label>
                  <Input
                    value={mappingForm.groupId || ''}
                    onChange={(e) => setMappingForm(prev => ({ ...prev, groupId: e.target.value }))}
                    placeholder="AD Group GUID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={mappingForm.groupName || ''}
                    onChange={(e) => setMappingForm(prev => ({ ...prev, groupName: e.target.value }))}
                    placeholder="AuditReady Admins"
                  />
                </div>
                <div className="space-y-2">
                  <Label>AuditReady Role</Label>
                  <Select
                    value={mappingForm.auditReadyRole}
                    onValueChange={(value) => setMappingForm(prev => ({ ...prev, auditReadyRole: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Button 
                    onClick={handleCreateGroupMapping}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Mapping
                  </Button>
                </div>
              </div>

              {/* Existing Group Mappings */}
              <div className="space-y-2">
                {groupMappings.map((mapping) => (
                  <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{mapping.groupName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Maps to: {mapping.auditReadyRole}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mapping.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                User Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure automatic user synchronization from Entra ID
              </p>
              {/* Sync configuration will go here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Sync Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">
                        {new Date(report.startedAt).toLocaleString()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {report.totalUsers} users processed
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(report.status)}
                      <div className="text-xs text-muted-foreground mt-1">
                        Created: {report.usersCreated} | Updated: {report.usersUpdated} | Errors: {report.errors}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseSSO;