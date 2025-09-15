import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Users,
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Search,
  Eye,
  Ban,
  Unlock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ContentQualityAnalysis from './ContentQualityAnalysis';

interface SystemMetrics {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalOrganizations: number;
  totalDocuments: number;
  apiRequests24h: number;
  errorRate: number;
  responseTime: number;
}

interface OrganizationSummary {
  id: string;
  name: string;
  userCount: number;
  documentsCount: number;
  complianceScore: number;
  subscriptionTier: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  lastActivity: string;
  storageUsed: number;
  apiCalls30d: number;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  organizationName: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  component: string;
  timestamp: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EnhancedAdminConsoleProps {
  organizationId?: string;
}

export function EnhancedAdminConsole({ organizationId: _organizationId }: EnhancedAdminConsoleProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management - must be called before any early returns
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  // const [selectedOrg, setSelectedOrg] = useState<string>('all');

  // Load admin data function
  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load system metrics
      const demoMetrics: SystemMetrics = {
        uptime: '15 days, 7 hours',
        cpuUsage: 34,
        memoryUsage: 67,
        diskUsage: 45,
        activeUsers: 1247,
        totalOrganizations: 89,
        totalDocuments: 15420,
        apiRequests24h: 245890,
        errorRate: 0.12,
        responseTime: 145
      };
      setMetrics(demoMetrics);

      // Load organizations
      const demoOrgs: OrganizationSummary[] = [
        {
          id: 'org-1',
          name: 'TechCorp Industries',
          userCount: 45,
          documentsCount: 1250,
          complianceScore: 87,
          subscriptionTier: 'enterprise',
          status: 'active',
          lastActivity: '2 minutes ago',
          storageUsed: 2.4, // GB
          apiCalls30d: 45890
        },
        {
          id: 'org-2', 
          name: 'SecureBank Ltd',
          userCount: 78,
          documentsCount: 3420,
          complianceScore: 94,
          subscriptionTier: 'enterprise',
          status: 'active',
          lastActivity: '5 minutes ago',
          storageUsed: 8.7,
          apiCalls30d: 89340
        },
        {
          id: 'org-3',
          name: 'StartupXYZ',
          userCount: 12,
          documentsCount: 340,
          complianceScore: 65,
          subscriptionTier: 'professional',
          status: 'trial',
          lastActivity: '1 hour ago',
          storageUsed: 0.8,
          apiCalls30d: 12450
        },
        {
          id: 'demo-org',
          name: 'Demo Organization',
          userCount: 1,
          documentsCount: 25,
          complianceScore: 78,
          subscriptionTier: 'free',
          status: 'active',
          lastActivity: 'Just now',
          storageUsed: 0.1,
          apiCalls30d: 2340
        }
      ];
      setOrganizations(demoOrgs);

      // Load user activities
      const demoActivities: UserActivity[] = [
        {
          id: 'act-1',
          userId: 'user-1',
          userName: 'John Smith',
          organizationName: 'TechCorp Industries',
          action: 'Document Upload',
          resource: 'ISO 27001 Assessment.pdf',
          timestamp: '2 minutes ago',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/119.0',
          success: true
        },
        {
          id: 'act-2',
          userId: 'user-2',
          userName: 'Sarah Johnson',
          organizationName: 'SecureBank Ltd',  
          action: 'Compliance Report Generated',
          resource: 'Q1 2025 Compliance Report',
          timestamp: '5 minutes ago',
          ipAddress: '10.0.0.45',
          userAgent: 'Firefox/120.0',
          success: true
        },
        {
          id: 'act-3',
          userId: 'demo-user',
          userName: 'Demo User',
          organizationName: 'Demo Organization',
          action: 'Settings Access',
          resource: 'Data Classification Settings',
          timestamp: 'Just now',
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome/119.0',
          success: true
        }
      ];
      setUserActivities(demoActivities);

      // Load system alerts
      const demoAlerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage has exceeded 65% threshold',
          component: 'Application Server',
          timestamp: '10 minutes ago',
          resolved: false,
          severity: 'medium'
        },
        {
          id: 'alert-2',
          type: 'info',
          title: 'Backup Completed',
          message: 'Daily backup completed successfully',
          component: 'Backup Service',
          timestamp: '2 hours ago', 
          resolved: true,
          severity: 'low'
        },
        {
          id: 'alert-3',
          type: 'error',
          title: 'API Rate Limit Exceeded',
          message: 'Organization "StartupXYZ" exceeded rate limits',
          component: 'API Gateway',
          timestamp: '30 minutes ago',
          resolved: false,
          severity: 'high'
        }
      ];
      setSystemAlerts(demoAlerts);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin console data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSuspendOrg = useCallback((orgId: string) => {
    setOrganizations(prev => prev.map(org => 
      org.id === orgId 
        ? { ...org, status: org.status === 'suspended' ? 'active' : 'suspended' as any }
        : org
    ));
    
    const org = organizations.find(o => o.id === orgId);
    toast({
      title: org?.status === 'suspended' ? 'Organization Activated' : 'Organization Suspended',
      description: `${org?.name} has been ${org?.status === 'suspended' ? 'activated' : 'suspended'}`
    });
  }, [organizations, toast]);

  const handleResolveAlert = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    
    toast({
      title: 'Alert Resolved',
      description: 'System alert has been marked as resolved'
    });
  }, [toast]);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadAdminData]);

  // Restrict access to platform administrators only
  const isPlatformAdmin = user?.email === 'platform@auditready.com' || process.env['NODE_ENV'] === 'development';
  
  if (!isPlatformAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">This area is reserved for platform administrators only.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Admin Console</h2>
          <p className="text-gray-600">
            Comprehensive system monitoring and organization management
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAdminData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.uptime}</div>
              <p className="text-xs text-muted-foreground">99.98% availability</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.apiRequests24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.errorRate}%</div>
              <p className="text-xs text-muted-foreground">Within SLA limits</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Usage */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>CPU Usage</Label>
                  <span className="text-sm font-medium">{metrics.cpuUsage}%</span>
                </div>
                <Progress value={metrics.cpuUsage} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Memory Usage</Label>
                  <span className="text-sm font-medium">{metrics.memoryUsage}%</span>
                </div>
                <Progress value={metrics.memoryUsage} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Disk Usage</Label>
                  <span className="text-sm font-medium">{metrics.diskUsage}%</span>
                </div>
                <Progress value={metrics.diskUsage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="activities">User Activities</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="quality">Content Quality</TabsTrigger>
          <TabsTrigger value="monitoring">Advanced Monitoring</TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organization Management</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations
                    .filter(org => 
                      searchQuery === '' || 
                      org.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-gray-600">
                            {org.storageUsed.toFixed(1)} GB used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{org.userCount}</TableCell>
                      <TableCell>{org.documentsCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={org.complianceScore} className="w-16 h-2" />
                          <span className="text-sm">{org.complianceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(org.subscriptionTier)}>
                          {org.subscriptionTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(org.status)}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {org.lastActivity}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSuspendOrg(org.id)}
                          >
                            {org.status === 'suspended' ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Log</CardTitle>
              <p className="text-sm text-gray-600">
                Real-time monitoring of user actions across all organizations
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.userName}</div>
                          <div className="text-sm text-gray-600">{activity.userAgent}</div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.organizationName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {activity.resource}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {activity.ipAddress}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {activity.timestamp}
                      </TableCell>
                      <TableCell>
                        {activity.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts & Notifications</CardTitle>
              <p className="text-sm text-gray-600">
                Monitor system health and resolve issues proactively
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline">Resolved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Component: {alert.component}</span>
                        <span>Time: {alert.timestamp}</span>
                      </div>
                    </div>
                    
                    {!alert.resolved && (
                      <Button 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Quality Analysis Tab */}
        <TabsContent value="quality" className="space-y-4">
          <ContentQualityAnalysis />
        </TabsContent>

        {/* Advanced Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <span className="font-mono">{metrics?.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Throughput</span>
                  <span className="font-mono">2,845 req/min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Concurrent Users</span>
                  <span className="font-mono">{metrics?.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Connections</span>
                  <span className="font-mono">23/100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Failed Login Attempts</span>
                  <span className="font-mono text-orange-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blocked IPs</span>
                  <span className="font-mono">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <span className="font-mono">{Math.floor((metrics?.activeUsers || 0) * 0.8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SSL Certificate</span>
                  <span className="text-green-600 font-medium">Valid (89 days)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Web Application', status: 'healthy', uptime: '99.98%' },
                  { name: 'API Gateway', status: 'healthy', uptime: '99.95%' },
                  { name: 'Database', status: 'healthy', uptime: '100%' },
                  { name: 'Storage', status: 'warning', uptime: '99.89%' },
                  { name: 'Authentication', status: 'healthy', uptime: '99.99%' },
                  { name: 'Notifications', status: 'healthy', uptime: '99.92%' },
                  { name: 'Backup Service', status: 'healthy', uptime: '100%' },
                  { name: 'Monitoring', status: 'healthy', uptime: '99.97%' }
                ].map((service) => (
                  <div key={service.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{service.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' : 
                        service.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-xs text-gray-600">
                      Uptime: {service.uptime}
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
}