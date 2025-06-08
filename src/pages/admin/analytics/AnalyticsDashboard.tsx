import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield,
  Activity,
  Download
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch real platform statistics
      const realStats = await adminService.getPlatformStatistics();
      const organizations = await adminService.getOrganizations();
      const standards = await adminService.getStandards(true);
      
      setAnalytics({
        platformOverview: {
          totalOrganizations: realStats.totalOrganizations,
          totalUsers: realStats.totalUsers,
          totalStandards: realStats.totalStandards,
          totalRequirements: realStats.totalRequirements,
          averageCompliance: 67 // TODO: Calculate from organization_requirements
        },
        complianceMetrics: {
          byStandard: standards.map(standard => ({
            name: standard.name,
            compliance: Math.floor(Math.random() * 40) + 50, // Random 50-90% for demo
            organizations: Math.floor(Math.random() * organizations.length) + 1
          }))
        },
        organizationMetrics: {
          byTier: (() => {
            const tierCounts = organizations.reduce((acc, org) => {
              const tier = org.subscription_tier || 'starter';
              const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
              acc[tierName] = (acc[tierName] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return Object.entries(tierCounts).map(([tier, count]) => ({
              tier,
              count,
              avgCompliance: Math.floor(Math.random() * 30) + 60 // Random 60-90%
            }));
          })()
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into platform usage and compliance
            </p>
          </div>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformOverview.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformOverview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformOverview.totalStandards}</div>
            <p className="text-xs text-muted-foreground">Active frameworks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformOverview.totalRequirements}</div>
            <p className="text-xs text-muted-foreground">Total controls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformOverview.averageCompliance}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Metrics</TabsTrigger>
          <TabsTrigger value="organizations">Organization Analytics</TabsTrigger>
          <TabsTrigger value="usage">Platform Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Standard</CardTitle>
                <CardDescription>Average compliance percentage per standard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.complianceMetrics.byStandard.map((standard: any) => (
                    <div key={standard.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{standard.name}</span>
                          <span className="text-sm text-muted-foreground">{standard.compliance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${standard.compliance}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{standard.organizations} organizations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization Tiers</CardTitle>
                <CardDescription>Compliance performance by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.organizationMetrics.byTier.map((tier: any) => (
                    <div key={tier.tier} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{tier.tier}</span>
                          <span className="text-sm text-muted-foreground">{tier.avgCompliance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${tier.avgCompliance}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{tier.count} organizations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Performance</CardTitle>
              <CardDescription>Detailed breakdown of organization compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Organization-specific analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage Metrics</CardTitle>
              <CardDescription>User activity and feature adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Usage metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Platform health and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};