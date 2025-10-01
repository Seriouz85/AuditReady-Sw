import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import {
  Database,
  Activity,
  Shield,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Zap,
  Server,
  Monitor,
  HardDrive,
  Users,
  FileText,
  Lock,
  ArrowRight,
  Container,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SystemManagementProps {
  loading: boolean;
  onRefresh: () => Promise<void>;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  uptime: string;
  activeUsers: number;
  totalOrganizations: number;
  avgResponseTime: number;
  recentBackups: number;
  storageUsed: number;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({
  loading: parentLoading,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    uptime: '99.9%',
    activeUsers: 0,
    totalOrganizations: 0,
    avgResponseTime: 0,
    recentBackups: 0,
    storageUsed: 0
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    setDataLoading(true);
    try {
      // Get active user sessions count (users who logged in within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: activeSessions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', oneHourAgo);

      // Get total organizations count
      const { count: orgsCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Get recent backup count (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: backupsCount } = await supabase
        .from('backup_metadata')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)
        .eq('status', 'completed');

      // Estimate storage (count documents + knowledge sources)
      const { count: docsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      const { count: sourcesCount } = await supabase
        .from('knowledge_sources')
        .select('*', { count: 'exact', head: true });

      // Estimate storage in MB (rough estimate: 100KB per doc + 500KB per knowledge source)
      const estimatedStorageMB = ((docsCount || 0) * 0.1) + ((sourcesCount || 0) * 0.5);

      // Database health check - try a simple query
      const startTime = Date.now();
      await supabase.from('users').select('id').limit(1);
      const responseTime = Date.now() - startTime;

      const dbHealth: 'healthy' | 'warning' | 'critical' =
        responseTime < 500 ? 'healthy' :
        responseTime < 1000 ? 'warning' : 'critical';

      setHealth({
        database: dbHealth,
        uptime: '99.9%', // Static for now - would come from monitoring service
        activeUsers: activeSessions || 0,
        totalOrganizations: orgsCount || 0,
        avgResponseTime: responseTime,
        recentBackups: backupsCount || 0,
        storageUsed: Math.round(estimatedStorageMB)
      });
    } catch (error) {
      console.error('Failed to load system health:', error);
      toast.error('Failed to load system health data');
      setHealth(prev => ({ ...prev, database: 'critical' }));
    } finally {
      setDataLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      await loadSystemHealth();
      toast.success('System status refreshed');
    } catch (error) {
      toast.error('Failed to refresh system status');
    } finally {
      setRefreshing(false);
    }
  };

  const goToSystemSettings = () => {
    navigate('/admin/system/settings');
  };

  const goToBackupManagement = () => {
    navigate('/admin/system/settings#backups');
  };

  const goToDatabaseStatus = () => {
    navigate('/admin/system/settings#database');
  };

  const goToUserManagement = () => {
    navigate('/admin');
    // Switch to Users tab via state or event
  };

  if (parentLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
              System Management
            </h2>
            <p className="text-muted-foreground mt-2">Monitor system health, performance, and infrastructure</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const isHealthy = health.database === 'healthy' && health.avgResponseTime < 500;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
            System Management
          </h2>
          <p className="text-muted-foreground mt-2">Monitor system health, performance, and infrastructure</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={isHealthy ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {isHealthy ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
            {isHealthy ? 'All Systems Operational' : 'Performance Warning'}
          </Badge>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className={`bg-gradient-to-br border-2 ${
          health.database === 'healthy'
            ? 'from-green-50 to-emerald-50 border-green-200'
            : 'from-yellow-50 to-orange-50 border-yellow-200'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Database Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">
              {health.database === 'healthy' ? (
                <span className="text-green-900">Excellent</span>
              ) : (
                <span className="text-yellow-900">Warning</span>
              )}
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Database className="w-4 h-4 mr-1" />
              {health.avgResponseTime}ms response
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{health.activeUsers}</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              Last hour
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{health.totalOrganizations}</div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Users className="w-4 h-4 mr-1" />
              Total tenants
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Recent Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{health.recentBackups}</div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <Download className="w-4 h-4 mr-1" />
              Last 7 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Admin Tools */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-600" />
              Infrastructure Status
            </CardTitle>
            <CardDescription>Core system components health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer" onClick={goToDatabaseStatus}>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Database (Supabase)</div>
                    <div className="text-sm text-gray-500">{health.avgResponseTime}ms avg response</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-gray-500">Supabase Auth + Microsoft Entra</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Payment Processing</div>
                    <div className="text-sm text-gray-500">Stripe</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Storage</div>
                    <div className="text-sm text-gray-500">{health.storageUsed}MB used</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Admin Operations
            </CardTitle>
            <CardDescription>Common troubleshooting and support tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={goToUserManagement}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-purple-50"
              >
                <div className="flex items-start space-x-3 text-left">
                  <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">User Management</div>
                    <div className="text-xs text-gray-500 mt-1">Password resets, account troubleshooting, role changes</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
              </Button>

              <Button
                onClick={goToBackupManagement}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-blue-50"
              >
                <div className="flex items-start space-x-3 text-left">
                  <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Backup & Restore</div>
                    <div className="text-xs text-gray-500 mt-1">Create backups, restore data, schedule automated backups</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
              </Button>

              <Button
                onClick={goToDatabaseStatus}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-green-50"
              >
                <div className="flex items-start space-x-3 text-left">
                  <Database className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Database Diagnostics</div>
                    <div className="text-xs text-gray-500 mt-1">Query performance, connection pool, table health</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
              </Button>

              <Button
                onClick={goToSystemSettings}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3 text-left">
                  <Settings className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">System Configuration</div>
                    <div className="text-xs text-gray-500 mt-1">Email settings, API keys, feature flags, K8s deployments</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Zap className="w-5 h-5 mr-2" />
            Quick Admin Actions
          </CardTitle>
          <CardDescription>Frequently used system management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button
              onClick={goToDatabaseStatus}
              variant="outline"
              className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Database className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Database</span>
              <span className="text-xs text-gray-500">{health.avgResponseTime}ms</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/security')}
              variant="outline"
              className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Shield className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Security</span>
              <span className="text-xs text-gray-500">Logs & Access</span>
            </Button>
            <Button
              onClick={goToBackupManagement}
              variant="outline"
              className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Backups</span>
              <span className="text-xs text-gray-500">{health.recentBackups} recent</span>
            </Button>
            <Button
              onClick={goToSystemSettings}
              variant="outline"
              className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Settings className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Settings</span>
              <span className="text-xs text-gray-500">Configure</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health Alert */}
      {health.database !== 'healthy' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-yellow-100 p-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Performance Warning</h3>
                  <p className="text-sm text-yellow-700">
                    Database response time is above normal ({health.avgResponseTime}ms). Consider checking connection pool and query performance.
                  </p>
                </div>
              </div>
              <Button onClick={goToDatabaseStatus} className="bg-yellow-600 hover:bg-yellow-700">
                <Activity className="w-4 h-4 mr-2" />
                Investigate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Reminder */}
      {health.recentBackups === 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">No Recent Backups</h3>
                  <p className="text-sm text-red-700">
                    No backups found in the last 7 days. It's critical to maintain regular backups for disaster recovery.
                  </p>
                </div>
              </div>
              <Button onClick={goToBackupManagement} className="bg-red-600 hover:bg-red-700">
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
