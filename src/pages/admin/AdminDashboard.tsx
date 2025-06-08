import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection } from '@/utils/testSupabase';
import { uploadRequirements } from '@/scripts/uploadRequirements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Settings, 
  Activity, 
  Database,
  AlertTriangle,
  CheckCircle,
  Building,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalStandards: number;
  totalRequirements: number;
  activeAssessments: number;
  recentUpdates: number;
}

interface StandardSummary {
  id: string;
  name: string;
  version: string;
  type: string;
  requirementCount: number;
  organizationCount: number;
  lastUpdated: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
  tier: string;
  userCount: number;
  assessmentCount: number;
  lastActivity: string;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isPlatformAdmin, user: authUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // For platform admins, use AuthContext
        if (isPlatformAdmin && authUser) {
          console.log('Platform admin access confirmed via AuthContext');
          setIsAdmin(true);
          await loadDashboardData();
          return;
        }

        // Check Supabase auth for real users
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is platform admin in database
        const { data: adminData, error: adminError } = await supabase
          .from('platform_administrators')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          setIsAdmin(false);
          setError('Access denied. Platform administrator privileges required.');
          return;
        }

        setIsAdmin(true);
        await loadDashboardData();
      } catch (err) {
        console.error('Admin access check failed:', err);
        setError('Failed to verify administrator access.');
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, [isPlatformAdmin, authUser]);


  const loadDashboardData = async () => {
    try {
      console.log('Loading production dashboard data...');
      setLoading(true);
      
      // Check Supabase configuration
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Use the admin service for all data loading
      const [stats, standardsData, orgsData] = await Promise.all([
        adminService.getPlatformStatistics(),
        adminService.getStandards(true),
        adminService.getOrganizations()
      ]);

      console.log('Standards data from Supabase:', standardsData);
      console.log('Stats:', stats);
      console.log('Organizations:', orgsData);

      // Set statistics
      setStats(stats);

      // Process standards data
      if (standardsData && standardsData.length > 0) {
        const processedStandards = standardsData.map(s => ({
          id: s.id,
          name: s.name,
          version: s.version,
          type: s.type,
          requirementCount: s.requirementCount || 0,
          organizationCount: 0, // Will implement organization standards relationship later
          lastUpdated: s.updated_at || s.created_at
        }));
        console.log('Processed standards:', processedStandards);
        setStandards(processedStandards);
      } else {
        console.log('No standards data received');
        setStandards([]);
      }

      // Process organizations data
      if (orgsData && orgsData.length > 0) {
        setOrganizations(orgsData.map(o => ({
          id: o.id,
          name: o.name,
          tier: o.subscription_tier || 'free',
          userCount: o.organization_users?.length || 0,
          assessmentCount: 0, // Will implement when we have assessments
          lastActivity: o.updated_at,
          isActive: true
        })));
      } else {
        setOrganizations([]);
      }

      console.log('Production data loaded successfully:', {
        standards: standardsData?.length || 0,
        organizations: orgsData?.length || 0,
        totalUsers: stats.totalUsers
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (err instanceof Error) {
        setError(`Failed to load production data: ${err.message}`);
      } else {
        setError('Failed to load production data from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'starter': return 'outline';
      default: return 'outline';
    }
  };

  // Function to create a new organization
  const handleCreateOrganization = async () => {
    const name = prompt('Enter organization name:');
    if (!name) return;

    try {
      await adminService.createOrganization({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        subscription_tier: 'starter'
      });

      console.log('Organization created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating organization:', error);
      setError('Failed to create organization');
    }
  };

  // Function to create a new standard
  const handleCreateStandard = async () => {
    const name = prompt('Enter standard name (e.g., "SOC 2"):');
    if (!name) return;
    
    const version = prompt('Enter standard version (e.g., "2017"):');
    if (!version) return;

    const type = prompt('Enter standard type (framework/regulation/policy/guideline):');
    if (!type || !['framework', 'regulation', 'policy', 'guideline'].includes(type)) {
      alert('Invalid type. Must be: framework, regulation, policy, or guideline');
      return;
    }

    try {
      await adminService.createStandard({
        name,
        version,
        type: type as any,
        description: `${name} compliance standard`
      });

      console.log('Standard created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating standard:', error);
      setError('Failed to create standard');
    }
  };

  // Function to navigate to standard detail
  const handleViewStandard = (standardId: string) => {
    navigate(`/admin/standards/${standardId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Access denied. Platform administrator privileges required.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Admin Console</h1>
          <p className="text-muted-foreground">
            Manage standards, organizations, and platform operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Platform Administrator
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
              <p className="text-xs text-muted-foreground">Active customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Standards</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStandards}</div>
              <p className="text-xs text-muted-foreground">Available frameworks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requirements</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequirements}</div>
              <p className="text-xs text-muted-foreground">Total controls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAssessments}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUpdates}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="standards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standards">Standards Management</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="standards" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Standards Library</h2>
              <p className="text-muted-foreground">Manage compliance standards and frameworks</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={loadDashboardData}>
                Refresh
              </Button>
              <Button variant="outline" onClick={() => testSupabaseConnection()}>
                Test DB
              </Button>
              <Button variant="outline" onClick={() => uploadRequirements()}>
                Upload All Requirements
              </Button>
              <Button onClick={handleCreateStandard}>
                <Shield className="w-4 h-4 mr-2" />
                Add Standard
              </Button>
            </div>
          </div>

          {standards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Standards Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first compliance standard to get started.
                </p>
                <Button onClick={handleCreateStandard}>
                  <Shield className="w-4 h-4 mr-2" />
                  Add Your First Standard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {standards.map((standard) => (
                <Card key={standard.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{standard.name}</CardTitle>
                        <CardDescription>
                          Version {standard.version} • {standard.type}
                          {standard.requirementCount > 0 && (
                            <span> • {standard.requirementCount} requirements</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{standard.organizationCount} organizations</div>
                          <div>Updated {formatDate(standard.lastUpdated)}</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Created {formatDate(standard.lastUpdated)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewStandard(standard.id)}>
                          View Requirements
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewStandard(standard.id)}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Customer Organizations</h2>
              <p className="text-muted-foreground">Manage customer accounts and subscriptions</p>
            </div>
            <Button onClick={handleCreateOrganization}>
              <Building className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </div>

          {organizations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Organizations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first customer organization to get started.
                </p>
                <Button onClick={handleCreateOrganization}>
                  <Building className="w-4 h-4 mr-2" />
                  Create First Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Badge variant={getTierBadgeVariant(org.tier)}>
                            {org.tier}
                          </Badge>
                          {org.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{org.userCount} users</div>
                        <div>{org.assessmentCount} assessments</div>
                        <div>Created {formatDate(org.lastActivity)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last activity {formatDate(org.lastActivity)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                          Manage Users
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/admin/analytics')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/users/platform-admins')}>
                <Shield className="w-4 h-4 mr-2" />
                Platform Admins
              </Button>
              <Button onClick={() => navigate('/admin/users')}>
                <Users className="w-4 h-4 mr-2" />
                All Users
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management Features</CardTitle>
              <CardDescription>
                Comprehensive user administration across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/users')}>
                  <Users className="w-6 h-6 mb-2" />
                  Browse All Users
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/users')}>
                  <Shield className="w-6 h-6 mb-2" />
                  Role Management
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/users')}>
                  <Activity className="w-6 h-6 mb-2" />
                  Access Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">System Administration</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Global configuration and feature flags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system/settings')}>
                  <Activity className="w-4 h-4 mr-2" />
                  Feature Flags
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/billing')}>
                  <Building className="w-4 h-4 mr-2" />
                  Billing Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Operations</CardTitle>
                <CardDescription>
                  Monitoring, logs, and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system/settings')}>
                  <Activity className="w-4 h-4 mr-2" />
                  System Health
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system/settings')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system/settings')}>
                  <Database className="w-4 h-4 mr-2" />
                  Backup Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};