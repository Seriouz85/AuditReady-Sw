import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Cloud,
  RefreshCw,
  Settings,
  Users,
  Search,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus
} from 'lucide-react';

interface User {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  isActive: boolean;
  photo?: string;
}

interface EntraIDConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  autoSync: boolean;
  syncInterval: number;
  syncGroups: boolean;
  lastSync?: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    displayName: 'John Doe',
    email: 'john.doe@company.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    isActive: true
  },
  {
    id: '2',
    displayName: 'Jane Smith',
    email: 'jane.smith@company.com',
    jobTitle: 'UX Designer',
    department: 'Design',
    isActive: true
  },
  {
    id: '3',
    displayName: 'Robert Johnson',
    email: 'robert.johnson@company.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    isActive: true
  },
  {
    id: '4',
    displayName: 'Emily Davis',
    email: 'emily.davis@company.com',
    jobTitle: 'Marketing Specialist',
    department: 'Marketing',
    isActive: false
  },
  {
    id: '5',
    displayName: 'Michael Wilson',
    email: 'michael.wilson@company.com',
    jobTitle: 'IT Administrator',
    department: 'IT',
    isActive: true
  }
];

const EntraIDIntegration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [config, setConfig] = useState<EntraIDConfig>({
    tenantId: '',
    clientId: '',
    clientSecret: '',
    autoSync: true,
    syncInterval: 24,
    syncGroups: true
  });

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handler for connecting to Entra ID
  const handleConnect = () => {
    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      alert('Please fill in all required fields');
      return;
    }
    
    // In a real implementation, this would make an API call to establish the connection
    setIsSyncing(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsSyncing(false);
      setIsConnected(true);
      setConfig({
        ...config,
        lastSync: new Date().toISOString()
      });
    }, 2000);
  };

  // Handler for syncing users
  const handleSync = () => {
    setIsSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      setConfig({
        ...config,
        lastSync: new Date().toISOString()
      });
    }, 2000);
  };

  // Handler for adding selected users to LMS
  const handleAddUsers = () => {
    // In a real implementation, this would make an API call to add the selected users
    console.log('Adding users:', selectedUsers);
    
    // For demo, just clear selection
    setSelectedUsers([]);
  };

  // Handler for selecting/deselecting all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Handler for toggling a single user selection
  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Microsoft Entra ID Integration</h1>
        {isConnected && (
          <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Users
          </Button>
        )}
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6 mt-6">
          {isConnected ? (
            <>
              <div className="flex justify-between items-center">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectAll}
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    onClick={handleAddUsers} 
                    disabled={selectedUsers.length === 0}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Selected Users to LMS
                  </Button>
                </div>
              </div>
              
              <Card>
                <div className="divide-y">
                  <div className="grid grid-cols-12 p-4 font-medium text-sm">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Department</div>
                    <div className="col-span-2">Job Title</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`grid grid-cols-12 p-4 hover:bg-muted/50 transition-colors ${
                        selectedUsers.includes(user.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="col-span-1 flex items-center">
                        <div 
                          className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer 
                            ${selectedUsers.includes(user.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}
                          `}
                          onClick={() => handleToggleUser(user.id)}
                        >
                          {selectedUsers.includes(user.id) && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        {user.displayName}
                      </div>
                      <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="col-span-2 flex items-center">
                        {user.department || '—'}
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                        {user.jobTitle || '—'}
                      </div>
                      <div className="col-span-1 flex items-center">
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No users found matching your search criteria</p>
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="text-sm text-muted-foreground">
                {config.lastSync ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Last synced: {new Date(config.lastSync).toLocaleString()}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connect to Microsoft Entra ID</h2>
              <p className="text-muted-foreground mb-6">
                Connect to your organization's Microsoft Entra ID to import and manage users in the LMS.
              </p>
              <Button onClick={() => setActiveTab('settings')}>
                Configure Connection
              </Button>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Microsoft Entra ID Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input 
                  id="tenantId" 
                  placeholder="Enter your Entra ID tenant ID" 
                  className="mt-1"
                  value={config.tenantId}
                  onChange={(e) => setConfig({...config, tenantId: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="clientId">Client ID (Application ID)</Label>
                <Input 
                  id="clientId" 
                  placeholder="Enter your application client ID" 
                  className="mt-1"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input 
                  id="clientSecret" 
                  type="password"
                  placeholder="Enter your application client secret" 
                  className="mt-1"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically synchronize users at regular intervals
                  </p>
                </div>
                <Switch 
                  checked={config.autoSync}
                  onCheckedChange={(checked) => setConfig({...config, autoSync: checked})}
                />
              </div>
              
              {config.autoSync && (
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                  <Input 
                    id="syncInterval" 
                    type="number"
                    min="1"
                    max="168"
                    className="mt-1 w-32"
                    value={config.syncInterval}
                    onChange={(e) => setConfig({...config, syncInterval: parseInt(e.target.value) || 24})}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sync Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    Also synchronize Azure AD groups and memberships
                  </p>
                </div>
                <Switch 
                  checked={config.syncGroups}
                  onCheckedChange={(checked) => setConfig({...config, syncGroups: checked})}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleConnect} disabled={isSyncing}>
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connected
                    </>
                  ) : isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {isConnected && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-provision new users</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically create accounts for new users found in Entra ID
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-deactivate deleted users</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically deactivate users that have been removed from Entra ID
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Single Sign-On (SSO)</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable Single Sign-On with Microsoft Entra ID
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EntraIDIntegration; 