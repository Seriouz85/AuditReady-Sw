import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Users,
  Building,
  Settings,
  CreditCard,
  Mail,
  Shield,
  Activity
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
  organization_users?: any[];
}

interface OrganizationUser {
  id: string;
  user_email: string;
  role: {
    name: string;
    display_name: string;
    permissions: string[];
  };
  status: string;
  created_at: string;
}

export const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing states
  const [isEditingOrganization, setIsEditingOrganization] = useState(false);
  const [isInvitingUser, setIsInvitingUser] = useState(false);
  
  // Form states
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    slug: '',
    industry: '',
    company_size: '',
    subscription_tier: 'team'
  });
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role_id: ''
  });

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadOrganizationData();
    }
  }, [id]);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Load organization details
      const orgs = await adminService.getOrganizations();
      const currentOrg = orgs?.find(o => o.id === id);
      
      if (!currentOrg) {
        setError('Organization not found');
        return;
      }
      
      setOrganization(currentOrg);
      setOrganizationForm({
        name: currentOrg.name,
        slug: currentOrg.slug,
        industry: currentOrg.industry || '',
        company_size: currentOrg.company_size || '',
        subscription_tier: currentOrg.subscription_tier
      });
      
      // Load organization users
      const orgUsers = await adminService.getOrganizationUsers(id);
      setUsers(orgUsers || []);
      
      // Load available roles from database
      try {
        const roles = await adminService.getOrganizationRoles();
        if (roles && roles.length > 0) {
          setAvailableRoles(roles);
        } else {
          // Fallback to default roles if none in database
          setAvailableRoles([
            { id: 'org-admin', name: 'organization_admin', display_name: 'Organization Administrator' },
            { id: 'compliance-manager', name: 'compliance_manager', display_name: 'Compliance Manager' },
            { id: 'user', name: 'user', display_name: 'User' }
          ]);
        }
      } catch (roleError) {
        console.warn('Could not load roles from database, using defaults:', roleError);
        setAvailableRoles([
          { id: 'org-admin', name: 'organization_admin', display_name: 'Organization Administrator' },
          { id: 'compliance-manager', name: 'compliance_manager', display_name: 'Compliance Manager' },
          { id: 'user', name: 'user', display_name: 'User' }
        ]);
      }
      
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!id) return;
    
    try {
      const updatedOrg = await adminService.updateOrganization(id, organizationForm);
      setOrganization(prev => prev ? { ...prev, ...updatedOrg } : null);
      setIsEditingOrganization(false);
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization');
    }
  };

  const handleInviteUser = async () => {
    if (!id) return;
    
    try {
      await adminService.inviteUser({
        organization_id: id,
        email: inviteForm.email,
        role_id: inviteForm.role_id
      });
      
      setInviteForm({ email: '', role_id: '' });
      setIsInvitingUser(false);
      await loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('Failed to send invitation');
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default';
      case 'business': return 'secondary';
      case 'team': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Organization not found'}</p>
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          
          {/* Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => navigate('/admin')} className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{organization.name}</h1>
                  <p className="text-blue-100 text-lg">
                    {users.length} users • {organization.subscription_tier} plan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Organization Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Users Connected</span>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2" variant={getTierBadgeVariant(organization.subscription_tier)}>
                <CreditCard className="w-4 h-4 mr-2" />
                {organization.subscription_tier.toUpperCase()}
              </Badge>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Active Organization
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Information</CardTitle>
                  <CardDescription>Basic details about this organization</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingOrganization(!isEditingOrganization)}
                >
                  {isEditingOrganization ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditingOrganization ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingOrganization ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={organizationForm.name}
                      onChange={(e) => setOrganizationForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={organizationForm.slug}
                      onChange={(e) => setOrganizationForm(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={organizationForm.industry}
                      onChange={(e) => setOrganizationForm(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select value={organizationForm.company_size} onValueChange={(value) => setOrganizationForm(prev => ({ ...prev, company_size: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subscription_tier">Subscription Tier</Label>
                    <Select value={organizationForm.subscription_tier} onValueChange={(value) => setOrganizationForm(prev => ({ ...prev, subscription_tier: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team - €499/month</SelectItem>
                        <SelectItem value="business">Business - €699/month</SelectItem>
                        <SelectItem value="enterprise">Enterprise - €999/month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 flex space-x-2">
                    <Button onClick={handleSaveOrganization}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingOrganization(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{organization.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
                    <p className="text-sm">{organization.slug}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                    <p className="text-sm">{organization.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Size</Label>
                    <p className="text-sm">{organization.company_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subscription Tier</Label>
                    <p className="text-sm capitalize">{organization.subscription_tier}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(organization.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Organization Users</h2>
              <p className="text-muted-foreground">Manage user access and permissions</p>
            </div>
            <Dialog open={isInvitingUser} onOpenChange={setIsInvitingUser}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteForm.role_id} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleInviteUser}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button variant="outline" onClick={() => setIsInvitingUser(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {users.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users</h3>
                <p className="text-muted-foreground mb-4">
                  This organization doesn't have any users yet.
                </p>
                <Button onClick={() => setIsInvitingUser(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite First User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{user.user_email}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role?.display_name || 'Unknown Role'}</Badge>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Shield className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>Manage subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Current Plan</h4>
                    <p className="text-sm text-muted-foreground capitalize">{organization.subscription_tier} Plan</p>
                  </div>
                  <Badge variant={getTierBadgeVariant(organization.subscription_tier)}>
                    {organization.subscription_tier}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Billing Status</h4>
                    <p className="text-sm text-muted-foreground">Active subscription</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Current
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Next Billing Date</h4>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Organization Settings
              </CardTitle>
              <CardDescription>Advanced configuration for this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Data Retention</h4>
                    <p className="text-sm text-muted-foreground">How long to keep organization data</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">API Access</h4>
                    <p className="text-sm text-muted-foreground">Manage API keys and integrations</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Download organization data</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-600">Delete Organization</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete this organization</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};