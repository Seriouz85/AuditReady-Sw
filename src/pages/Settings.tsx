import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/utils/toast";
import { formatDate } from "@/utils/formatDate";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { 
  Download, Save, Upload, UserPlus, Settings as SettingsIcon, Shield, 
  Key, Activity, Trash2, Edit, Eye, Clock,
  CheckCircle, XCircle, Loader
} from "lucide-react";

// Demo data for demo accounts only
const demoUsers = [
  {
    id: 'demo-user-1',
    email: 'admin@democorp.com',
    name: 'Demo Admin',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-01-06T10:30:00Z',
    invitedBy: null,
    joinedAt: '2024-12-01T09:00:00Z'
  },
  {
    id: 'demo-user-2', 
    email: 'ciso@democorp.com',
    name: 'Demo CISO',
    role: 'ciso',
    status: 'active',
    lastLogin: '2025-01-05T16:45:00Z',
    invitedBy: 'demo-user-1',
    joinedAt: '2024-12-15T14:20:00Z'
  },
  {
    id: 'demo-user-3',
    email: 'analyst@democorp.com', 
    name: 'Demo Analyst',
    role: 'analyst',
    status: 'invited',
    lastLogin: null,
    invitedBy: 'demo-user-2',
    joinedAt: null
  }
];

const Settings = () => {
  const { user, organization, isDemo, hasPermission } = useAuth();
  const {
    users,
    roles,
    invitations,
    isLoading,
    error,
    inviteUser,
    revokeUserAccess,
    updateUserRole,
    refreshData
  } = useUserManagement();
  
  const [activeTab, setActiveTab] = useState('organization');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: '', message: '' });
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use demo data for demo accounts, real data for production accounts
  const displayUsers = isDemo ? demoUsers : users;
  const displayRoles = isDemo ? [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'ciso', name: 'CISO/Security Officer', description: 'Security oversight' },
    { id: 'manager', name: 'Manager', description: 'Team management' },
    { id: 'analyst', name: 'Security Analyst', description: 'Analysis and assessments' },
    { id: 'auditor', name: 'Auditor', description: 'Read-only audit access' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ] : roles;
  
  // Load data on component mount for real accounts
  useEffect(() => {
    if (!isDemo && organization) {
      refreshData();
    }
  }, [organization, isDemo, refreshData]);
  
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isDemo) {
      toast.info("User invitations are not available in demo mode");
      return;
    }
    
    if (!hasPermission('user_management')) {
      toast.error("You don't have permission to invite users");
      return;
    }
    
    setLocalLoading(true);
    try {
      await inviteUser({
        email: inviteForm.email,
        roleId: inviteForm.role,
        message: inviteForm.message
      });
      
      setInviteForm({ email: '', role: '', message: '' });
      setIsInviteDialogOpen(false);
      toast.success(`Invitation sent to ${inviteForm.email}`);
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast.error("Failed to send invitation");
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handleRevokeUser = async (userId: string) => {
    if (isDemo) {
      toast.info("User access management is not available in demo mode");
      return;
    }
    
    if (!hasPermission('user_management')) {
      toast.error("You don't have permission to revoke user access");
      return;
    }
    
    try {
      await revokeUserAccess(userId);
      toast.success("User access revoked");
    } catch (error) {
      console.error('Failed to revoke user access:', error);
      toast.error("Failed to revoke user access");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'invited':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Invited</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const getRoleDisplayName = (roleId: string | any) => {
    if (typeof roleId === 'object' && roleId?.name) {
      return roleId.name;
    }
    return displayRoles.find(role => role.id === roleId)?.name || roleId;
  };

  const getUserDisplayName = (user: any) => {
    if (isDemo) {
      return user.name || user.email;
    }
    // For real OrganizationUser type
    return user.user?.raw_user_meta_data?.full_name || 
           user.user?.raw_user_meta_data?.first_name || 
           user.user?.email?.split('@')[0] || 
           'Unknown User';
  };

  const getUserEmail = (user: any) => {
    if (isDemo) {
      return user.email;
    }
    // For real OrganizationUser type
    return user.user?.email || '';
  };

  const getUserLastLogin = (user: any) => {
    if (isDemo) {
      return user.lastLogin;
    }
    // For real OrganizationUser type
    return user.last_login_at;
  };

  const getUserJoinedAt = (user: any) => {
    if (isDemo) {
      return user.joinedAt;
    }
    // For real OrganizationUser type
    return user.joined_at;
  };
  
  const formatDateWithTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 lg:w-[700px]">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="importing">Import/Export</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Manage your organization details and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDemo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📊 Demo Mode: Organization settings are read-only in the demo version.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input 
                  id="org-name" 
                  defaultValue={organization?.name || (isDemo ? "Demo Company" : "")} 
                  disabled={isDemo}
                  onBlur={e => !isDemo && localStorage.setItem('organizationProfile', JSON.stringify({ name: e.target.value }))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" 
                  defaultValue={organization?.industry || (isDemo ? "Technology" : "")} 
                  disabled={isDemo}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Input 
                  id="company-size" 
                  defaultValue={organization?.company_size || (isDemo ? "51-200 employees" : "")} 
                  disabled={isDemo}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input 
                  id="contact-email" 
                  type="email" 
                  defaultValue={user?.email || (isDemo ? "contact@democorp.com" : "")} 
                  disabled={isDemo}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  defaultValue={isDemo ? "Demo Company showcasing AuditReady's comprehensive compliance management platform." : ""}
                  rows={4}
                  disabled={isDemo}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isDemo}>
                <Save className="mr-2 h-4 w-4" />
                {isDemo ? 'Read-Only in Demo' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    {isDemo ? 'Demo Plan' : 
                     organization?.subscription_tier === 'team' ? 'Team Plan' :
                     organization?.subscription_tier === 'business' ? 'Business Plan' :
                     organization?.subscription_tier === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {isDemo ? 'Full feature demo • No billing' :
                     organization?.subscription_tier === 'team' ? '€99/month • Up to 50 employees' :
                     organization?.subscription_tier === 'business' ? '€699/month • Up to 1000 employees' :
                     organization?.subscription_tier === 'enterprise' ? 'Custom pricing • Unlimited employees' : 'Free • Up to 5 users'}
                  </p>
                </div>
                <Badge className={isDemo ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}>
                  {isDemo ? 'Demo' : 'Current Plan'}
                </Badge>
              </div>
              
              {!isDemo && (
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { getCustomerPortalUrl } = await import('@/api/stripe');
                      const portalUrl = await getCustomerPortalUrl();
                      window.open(portalUrl, '_blank');
                    } catch (error) {
                      toast.error('Unable to open billing portal');
                    }
                  }}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Manage Billing
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { getInvoices } = await import('@/api/stripe');
                      const invoices = await getInvoices();
                      if (invoices.length === 0) {
                        toast.info('No invoices found');
                      } else {
                        // TODO: Implement invoice download
                        toast.info('Invoice download coming soon');
                      }
                    } catch (error) {
                      toast.error('Unable to fetch invoices');
                    }
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoices
                  </Button>
                </div>
              )}
              
              {isDemo && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    🚀 This is a demo account showcasing all premium features. To access billing and subscription management, please sign up for a paid plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users & Access Management */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage user access and permissions for your organization
                </CardDescription>
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="user@company.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({...inviteForm, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {displayRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-sm text-muted-foreground">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                      <Textarea
                        id="invite-message"
                        placeholder="Welcome to the team!"
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser} disabled={localLoading || isDemo}>
                      {localLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                      {isDemo ? 'Not Available in Demo' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && !isDemo ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : displayUsers.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No team members found. Invite your first team member to get started.
                  </div>
                ) : (
                  displayUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName(user)}`} />
                        <AvatarFallback>
                          {getUserDisplayName(user).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{getUserDisplayName(user)}</div>
                        <div className="text-sm text-muted-foreground">{getUserEmail(user)}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(user.status)}
                          <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Last login: {formatDateWithTime(getUserLastLogin(user))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Joined: {formatDateWithTime(getUserJoinedAt(user))}
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke access for {getUserEmail(user)}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure roles and permissions for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Permissions
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Configure password requirements for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Minimum Password Length</Label>
                  <p className="text-sm text-muted-foreground">Require at least 8 characters</p>
                </div>
                <Input type="number" defaultValue="8" className="w-20" min="6" max="32" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Include symbols (!@#$%^&*)</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">Include at least one number</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Expiration</Label>
                  <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Password Policy
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Enhance security with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require MFA for Admin Users</Label>
                  <p className="text-sm text-muted-foreground">Mandatory 2FA for administrators</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require MFA for All Users</Label>
                  <p className="text-sm text-muted-foreground">Organization-wide MFA requirement</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label>Allowed MFA Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm">Authenticator Apps (Google Authenticator, Authy)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm">SMS Text Messages</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm">Hardware Security Keys (YubiKey)</label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Shield className="mr-2 h-4 w-4" />
                Save MFA Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Control user session behavior and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout (minutes)</Label>
                  <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <Input type="number" defaultValue="30" className="w-20" min="5" max="480" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maximum Concurrent Sessions</Label>
                  <p className="text-sm text-muted-foreground">Limit active sessions per user</p>
                </div>
                <Input type="number" defaultValue="3" className="w-20" min="1" max="10" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Force Logout on Password Change</Label>
                  <p className="text-sm text-muted-foreground">End all sessions when password is updated</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Key className="mr-2 h-4 w-4" />
                Save Session Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Configure enterprise authentication providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Microsoft Azure AD</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable SSO with Microsoft Active Directory
                  </p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Google Workspace</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable SSO with Google Workspace
                  </p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Okta</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enterprise identity management
                  </p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Custom SAML</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Custom SAML 2.0 provider
                  </p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API access for integrations and automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Production API Key</div>
                    <div className="text-sm text-muted-foreground">Created on Dec 1, 2024</div>
                    <div className="text-sm text-muted-foreground">Last used: 2 hours ago</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Add Webhook Endpoint
                </Button>
                <p className="text-sm text-muted-foreground">
                  No webhook endpoints configured. Add endpoints to receive real-time notifications about compliance events.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Import/Export Settings */}
        <TabsContent value="importing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Standards</CardTitle>
              <CardDescription>
                Import standards and regulations from files or repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Available Standards</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">ISO 27001:2022</p>
                      <p className="text-sm text-muted-foreground">Information Security Management</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">NIST CSF 2.0</p>
                      <p className="text-sm text-muted-foreground">Cybersecurity Framework</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">GDPR</p>
                      <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Import from File</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Export Data</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Export system activity and audit logs for compliance reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Activity Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="user">User Management</SelectItem>
                      <SelectItem value="security">Security Events</SelectItem>
                      <SelectItem value="compliance">Compliance Changes</SelectItem>
                      <SelectItem value="system">System Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="CSV" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Audit Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="assessment-notifications">Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about assessment deadlines
                  </p>
                </div>
                <Switch id="assessment-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compliance-updates">Compliance Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about changes to compliance status
                  </p>
                </div>
                <Switch id="compliance-updates" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="team-activity">Team Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about team member actions
                  </p>
                </div>
                <Switch id="team-activity" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="standard-updates">Standard Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when standards are updated
                  </p>
                </div>
                <Switch id="standard-updates" defaultChecked />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="alerts@acme.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;