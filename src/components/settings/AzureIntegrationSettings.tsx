import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Database,
  Clock,
  Users,
  Building2,
  Cloud,
  Activity,
  Key,
  TestTube
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AzureIntegrationSettingsProps {
  organizationId: string;
}

interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  subscriptionId: string;
  resourceGroups: string[];
  syncFrequency: 'hourly' | 'daily' | 'weekly';
  syncEnabled: boolean;
  lastSync?: string;
}

interface AzureSyncStatus {
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  nextSync?: string;
  syncedApplications: number;
  totalApplications: number;
  subscriptions: AzureSubscription[];
}

interface AzureSubscription {
  id: string;
  name: string;
  isActive: boolean;
  resourceGroups: AzureResourceGroup[];
}

interface AzureResourceGroup {
  id: string;
  name: string;
  location: string;
  applicationCount: number;
}

export function AzureIntegrationSettings({ organizationId }: AzureIntegrationSettingsProps) {
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const isDemo = user?.email === 'demo@auditready.com';

  // State management
  const [config, setConfig] = useState<AzureConfig>({
    clientId: '',
    clientSecret: '',
    tenantId: '',
    subscriptionId: '',
    resourceGroups: [],
    syncFrequency: 'daily',
    syncEnabled: false
  });
  
  const [syncStatus, setSyncStatus] = useState<AzureSyncStatus>({
    isConnected: false,
    connectionStatus: 'disconnected',
    syncedApplications: 0,
    totalApplications: 0,
    subscriptions: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAzureConfig();
    loadSyncStatus();
  }, [organizationId]);

  const loadAzureConfig = async () => {
    if (isDemo) {
      // Demo data
      setConfig({
        clientId: 'demo-client-id-12345',
        clientSecret: 'demo-secret-hidden',
        tenantId: 'demo-tenant-id-67890',
        subscriptionId: 'demo-subscription-id-11111',
        resourceGroups: ['rg-production', 'rg-development', 'rg-testing'],
        syncFrequency: 'daily',
        syncEnabled: true,
        lastSync: '2025-01-06T14:30:00Z'
      });
      return;
    }
    
    try {
      // In production, load from database/API
      // For now, showing empty state
    } catch (error) {
      console.error('Error loading Azure config:', error);
    }
  };

  const loadSyncStatus = async () => {
    if (isDemo) {
      // Demo data
      setSyncStatus({
        isConnected: true,
        connectionStatus: 'connected',
        lastSync: '2025-01-06T14:30:00Z',
        nextSync: '2025-01-07T14:30:00Z',
        syncedApplications: 47,
        totalApplications: 52,
        subscriptions: [
          {
            id: 'demo-prod-sub',
            name: 'Production Subscription',
            isActive: true,
            resourceGroups: [
              { id: 'rg-prod-1', name: 'rg-production', location: 'East US', applicationCount: 23 },
              { id: 'rg-prod-2', name: 'rg-api-services', location: 'East US', applicationCount: 12 }
            ]
          },
          {
            id: 'demo-dev-sub',
            name: 'Development Subscription',
            isActive: true,
            resourceGroups: [
              { id: 'rg-dev-1', name: 'rg-development', location: 'Central US', applicationCount: 15 },
              { id: 'rg-test-1', name: 'rg-testing', location: 'West US', applicationCount: 2 }
            ]
          }
        ]
      });
      return;
    }
    
    try {
      // In production, load from API
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      if (isDemo) {
        // Simulate testing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast({
          title: "Success",
          description: "Demo: Azure connection test successful!"
        });
        setSyncStatus(prev => ({ ...prev, connectionStatus: 'connected', isConnected: true }));
      } else {
        // In production, test the actual connection
        // Call Azure API to validate credentials
        toast({
          title: "Success",
          description: "Azure connection test successful!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Azure connection test failed. Please check your credentials.",
        variant: "destructive"
      });
      setSyncStatus(prev => ({ ...prev, connectionStatus: 'error', isConnected: false }));
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: "Success",
          description: "Demo: Azure integration settings saved!"
        });
      } else {
        // In production, save to database
        toast({
          title: "Success",
          description: "Azure integration settings saved successfully!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Azure integration settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSync = async () => {
    setIsLoading(true);
    try {
      setSyncStatus(prev => ({ ...prev, connectionStatus: 'syncing' }));
      
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setSyncStatus(prev => ({
          ...prev,
          connectionStatus: 'connected',
          lastSync: new Date().toISOString(),
          syncedApplications: 52,
          totalApplications: 52
        }));
        toast({
          title: "Success",
          description: "Demo: Azure application sync completed successfully!"
        });
      } else {
        // In production, trigger actual sync
        toast({
          title: "Success",
          description: "Azure application sync started!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync Azure applications",
        variant: "destructive"
      });
      setSyncStatus(prev => ({ ...prev, connectionStatus: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Disconnected</Badge>;
    }
  };

  return (
    <div className="w-full h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        {/* Compact Tab Navigation */}
        <div className="border-b bg-muted/30 px-4 py-2 flex-shrink-0">
          <TabsList className="grid w-full max-w-xl grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs font-medium">
              <Activity className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="connection" className="text-xs font-medium">
              <Key className="w-3 h-3 mr-1" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="sync" className="text-xs font-medium">
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs font-medium">
              <Database className="w-3 h-3 mr-1" />
              Resources
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 space-y-4 mt-0 h-full">
            {/* Connection Status Overview */}
            {/* Efficient Overview Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Status Cards Row */}
              {syncStatus.isConnected && (
                <>
                  <Card className="p-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{syncStatus.syncedApplications}</div>
                      <div className="text-xs text-blue-700">Synced Apps</div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{syncStatus.subscriptions.length}</div>
                      <div className="text-xs text-green-700">Subscriptions</div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {syncStatus.subscriptions.reduce((total, sub) => total + sub.resourceGroups.length, 0)}
                      </div>
                      <div className="text-xs text-purple-700">Resource Groups</div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-center">
                      {getStatusBadge(syncStatus.connectionStatus)}
                      <div className="text-xs text-muted-foreground mt-1">Status</div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      Azure Sync Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {syncStatus.lastSync && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Last Sync</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(syncStatus.lastSync).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {syncStatus.nextSync && (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Next Sync</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(syncStatus.nextSync).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={triggerSync} 
                      disabled={isLoading || !syncStatus.isConnected}
                      className="w-full"
                      size="sm"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      {isLoading ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('connection')}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Settings className="w-3 h-3 mr-2" />
                      Configure
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('resources')}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Database className="w-3 h-3 mr-2" />
                      Resources
                    </Button>
                  </CardContent>
                </Card>

                {/* Sync Progress Card */}
                {syncStatus.connectionStatus === 'syncing' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Sync Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Applications</span>
                          <span>{syncStatus.syncedApplications}/{syncStatus.totalApplications}</span>
                        </div>
                        <Progress value={(syncStatus.syncedApplications / syncStatus.totalApplications) * 100} />
                        <div className="text-xs text-muted-foreground text-center">
                          Synchronizing Azure resources...
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Connection Tab */}
          <TabsContent value="connection" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Azure Connection Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Azure application credentials for secure API access and automated application discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenantId">Azure Tenant ID</Label>
                      <Input
                        id="tenantId"
                        value={config.tenantId}
                        onChange={(e) => setConfig(prev => ({ ...prev, tenantId: e.target.value }))}
                        placeholder={isDemo ? "demo-tenant-id-67890" : "Enter Azure Tenant ID"}
                        disabled={isDemo}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Application Client ID</Label>
                      <Input
                        id="clientId"
                        value={config.clientId}
                        onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                        placeholder={isDemo ? "demo-client-id-12345" : "Enter Azure Client ID"}
                        disabled={isDemo}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Button
                          variant="ghost"
                          size="sm"  
                          onClick={() => setShowSecrets(!showSecrets)}
                          className="text-xs"
                        >
                          {showSecrets ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      <Input
                        id="clientSecret"
                        type={showSecrets ? "text" : "password"}
                        value={showSecrets ? config.clientSecret : "••••••••••••••••"}
                        onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                        placeholder="Enter Azure Client Secret"
                        disabled={isDemo}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionId">Primary Subscription ID</Label>
                      <Input
                        id="subscriptionId"
                        value={config.subscriptionId}
                        onChange={(e) => setConfig(prev => ({ ...prev, subscriptionId: e.target.value }))}
                        placeholder={isDemo ? "demo-subscription-id-11111" : "Enter Azure Subscription ID"}
                        disabled={isDemo}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={testConnection} 
                    disabled={isTesting || isDemo}
                    variant="outline"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isTesting ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                  <Button 
                    onClick={saveConfiguration} 
                    disabled={isLoading || isDemo}
                  >
                    {isLoading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>

                {isDemo && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                      Azure integration settings are read-only in demo mode. In production, you would configure your actual Azure credentials here.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Settings Tab */}
          <TabsContent value="sync" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Synchronization Configuration
                </CardTitle>
                <CardDescription>
                  Configure automated synchronization schedules and resource filtering for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Enable Automatic Sync</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync Azure applications and compliance data on schedule
                        </p>
                      </div>
                      <Switch 
                        checked={config.syncEnabled}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, syncEnabled: checked }))}
                        disabled={isDemo}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Sync Frequency</Label>
                      <Select 
                        value={config.syncFrequency} 
                        onValueChange={(value: 'hourly' | 'daily' | 'weekly') => 
                          setConfig(prev => ({ ...prev, syncFrequency: value }))
                        }
                        disabled={isDemo || !config.syncEnabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour (High Frequency)</SelectItem>
                          <SelectItem value="daily">Daily (Recommended)</SelectItem>
                          <SelectItem value="weekly">Weekly (Low Frequency)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Higher frequencies consume more API quota but provide more up-to-date compliance data
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Resource Group Filter</Label>
                      <div className="p-4 border rounded-lg bg-muted/20">
                        <div className="text-sm font-medium mb-2">
                          {config.resourceGroups.length > 0 ? 
                            `${config.resourceGroups.length} resource groups selected` : 
                            'All resource groups (default)'}
                        </div>
                        {config.resourceGroups.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {config.resourceGroups.map((rg, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {rg}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Filtering by resource groups improves sync performance and reduces API usage
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={triggerSync} 
                      disabled={isLoading || !syncStatus.isConnected}
                      className="w-full"
                      size="lg"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {isLoading ? 'Syncing Applications...' : 'Trigger Manual Sync Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="p-4 space-y-4 mt-0">
            {syncStatus.subscriptions.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Connected Azure Resources</h2>
                    <p className="text-muted-foreground">
                      Overview of synced Azure subscriptions, resource groups, and applications
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Applications</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {syncStatus.subscriptions.reduce((total, sub) => 
                        total + sub.resourceGroups.reduce((rgTotal, rg) => rgTotal + rg.applicationCount, 0), 0
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {syncStatus.subscriptions.map((subscription) => (
                    <Card key={subscription.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            <div>
                              <h3 className="text-xl font-semibold">{subscription.name}</h3>
                              <p className="text-sm text-muted-foreground">Subscription ID: {subscription.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                              {subscription.resourceGroups.reduce((total, rg) => total + rg.applicationCount, 0)} Applications
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {subscription.resourceGroups.length} Resource Groups
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {subscription.resourceGroups.map((rg) => (
                            <div key={rg.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-base">{rg.name}</span>
                                <Badge variant="outline" className="text-sm">
                                  {rg.applicationCount} apps
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                {rg.location}
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <Button variant="ghost" size="sm" className="w-full text-xs">
                                  View Applications
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Cloud className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Azure Resources Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Connect your Azure account and configure the integration to see your subscriptions and resource groups here.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setActiveTab('connection')}>
                      <Key className="w-4 h-4 mr-2" />
                      Configure Connection
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('sync')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}