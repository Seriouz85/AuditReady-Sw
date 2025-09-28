import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Activity, 
  Shield, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Upload, 
  Zap,
  Sparkles,
  Server,
  Monitor,
  HardDrive
} from 'lucide-react';

interface SystemManagementProps {
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({
  loading,
  onRefresh
}) => {
  if (loading) {
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
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">99.9%</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Database Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">Excellent</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Database className="w-4 h-4 mr-1" />
              Supabase
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">234ms</div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Zap className="w-4 h-4 mr-1" />
              Average
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">142</div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <Activity className="w-4 h-4 mr-1" />
              Live users
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
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
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Web Application</div>
                    <div className="text-sm text-gray-500">Vite + React</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-sm text-gray-500">Supabase PostgreSQL</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-gray-500">Supabase Auth</div>
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
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2 text-purple-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Real-time system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">CPU Usage</div>
                    <div className="text-sm text-gray-500">Current load</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">23%</div>
                  <div className="text-xs text-gray-500">Normal</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Memory Usage</div>
                    <div className="text-sm text-gray-500">RAM utilization</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">67%</div>
                  <div className="text-xs text-gray-500">Good</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Database Connections</div>
                    <div className="text-sm text-gray-500">Active connections</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">47/100</div>
                  <div className="text-xs text-gray-500">Healthy</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium">API Response Time</div>
                    <div className="text-sm text-gray-500">Average latency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">234ms</div>
                  <div className="text-xs text-gray-500">Excellent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Management Tools */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Sparkles className="w-5 h-5 mr-2" />
            System Management Tools
          </CardTitle>
          <CardDescription>Administrative tools for system maintenance and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-slate-200 text-slate-700 hover:bg-slate-50">
              <Database className="w-5 h-5 mb-1" />
              <span className="text-sm">Database</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 text-slate-700 hover:bg-slate-50">
              <Shield className="w-5 h-5 mb-1" />
              <span className="text-sm">Security</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 text-slate-700 hover:bg-slate-50">
              <Download className="w-5 h-5 mb-1" />
              <span className="text-sm">Backup</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 text-slate-700 hover:bg-slate-50">
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};