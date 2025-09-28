import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Globe, 
  Lock, 
  Eye, 
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { securityService } from '../../lib/security/SecurityService';
import { securityMiddleware } from '../../lib/security/SecurityMiddleware';
import { enhancedRateLimit } from '../../lib/security/EnhancedRateLimit';
import { csrfProtection } from '../../lib/security/CSRFProtection';
import { rbacGuards } from '../../lib/security/RBACGuards';
import { dataEncryption } from '../../lib/security/DataEncryption';
import { AdminGuard } from '../../lib/security/EnhancedPermissionGuard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  authenticationFailures: number;
  rateLimitViolations: number;
  uniqueIps: number;
  averageResponseTime: number;
  uptime: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  ipAddress?: string;
}

interface SecurityConfig {
  csrf: boolean;
  rateLimit: boolean;
  rbac: boolean;
  xss: boolean;
  headers: boolean;
  audit: boolean;
  encryption: boolean;
}

export const SecurityDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [securityHealth, setSecurityHealth] = useState<any>(null);
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setRefreshing(true);
      
      // Load security metrics
      const { data: metricsData } = await supabase.rpc('get_security_dashboard_metrics', {
        org_id: organization?.id,
        days_back: 7
      });

      if (metricsData && Array.isArray(metricsData) && metricsData.length > 0) {
        const data = metricsData[0] as any;
        setMetrics({
          totalEvents: data.total_events || 0,
          criticalEvents: data.critical_events || 0,
          highEvents: data.high_events || 0,
          authenticationFailures: data.authentication_failures || 0,
          rateLimitViolations: data.rate_limit_violations || 0,
          uniqueIps: 0, // Calculate from top_ips
          averageResponseTime: 120, // Mock data
          uptime: 99.9, // Mock data
        });
      }

      // Load security alerts
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsData) {
        setAlerts(alertsData.map((alert: any) => ({
          id: alert.id as string,
          type: alert.alert_type as string,
          severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
          title: alert.title as string,
          description: alert.description as string,
          timestamp: new Date(alert.created_at as string),
          status: (alert.status === 'sent' || alert.status === 'delivered') ? 'acknowledged' : 'open' as 'open' | 'acknowledged' | 'resolved',
          ipAddress: alert.ip_address as string,
        })));
      }

      // Load security health
      const health = await securityMiddleware.getSecurityHealth();
      setSecurityHealth(health);

      // Load current configuration
      const middlewareConfig = securityMiddleware.getConfig();
      setConfig({
        csrf: middlewareConfig.csrf.enabled,
        rateLimit: middlewareConfig.rateLimit.enabled,
        rbac: middlewareConfig.rbac.enabled,
        xss: middlewareConfig.xss.enabled,
        headers: middlewareConfig.headers.enabled,
        audit: middlewareConfig.audit.enabled,
        encryption: middlewareConfig.encryption.enabled,
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportSecurityReport = async () => {
    try {
      // Generate comprehensive security report
      const report = {
        timestamp: new Date().toISOString(),
        organization: organization?.id,
        metrics,
        alerts: alerts.filter(a => a.status === 'open'),
        health: securityHealth,
        configuration: config,
        recommendations: generateRecommendations(),
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export security report:', error);
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (securityHealth) {
      const criticalComponents = securityHealth.components.filter((c: any) => c.status === 'critical');
      const warningComponents = securityHealth.components.filter((c: any) => c.status === 'warning');
      
      criticalComponents.forEach((component: any) => {
        recommendations.push({
          priority: 'high',
          component: component.name,
          issue: component.message,
          action: `Enable ${component.name} immediately`,
        });
      });
      
      warningComponents.forEach((component: any) => {
        recommendations.push({
          priority: 'medium',
          component: component.name,
          issue: component.message,
          action: `Review and enhance ${component.name} configuration`,
        });
      });
    }
    
    if (metrics) {
      if (metrics.authenticationFailures > 50) {
        recommendations.push({
          priority: 'high',
          component: 'Authentication',
          issue: 'High number of authentication failures',
          action: 'Investigate potential brute force attacks and strengthen authentication',
        });
      }
      
      if (metrics.rateLimitViolations > 100) {
        recommendations.push({
          priority: 'medium',
          component: 'Rate Limiting',
          issue: 'High number of rate limit violations',
          action: 'Review and adjust rate limiting thresholds',
        });
      }
    }
    
    return recommendations;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  return (
    <AdminGuard level="any" showFallbackError>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600">Monitor and manage security across your organization</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={loadSecurityData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportSecurityReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Security Health Overview */}
        {securityHealth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Health Overview
                <Badge 
                  className={`ml-2 ${
                    securityHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    securityHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {securityHealth.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Overall security score: {securityHealth.overallScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {securityHealth.components.map((component: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    {getStatusIcon(component.status)}
                    <div className="ml-3">
                      <p className="font-medium text-sm">{component.name}</p>
                      <p className="text-xs text-gray-600">{component.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auth Failures</CardTitle>
                <Lock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.authenticationFailures}</div>
                <p className="text-xs text-muted-foreground">Failed login attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.uptime}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Views */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>Latest security incidents and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No security alerts in the last 7 days</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{alert.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {alert.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.timestamp.toLocaleString()}
                            {alert.ipAddress && (
                              <>
                                <span className="mx-2">•</span>
                                <Globe className="h-3 w-3 mr-1" />
                                {alert.ipAddress}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Current security feature status</CardDescription>
              </CardHeader>
              <CardContent>
                {config && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(config).map(([key, enabled]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center">
                          {enabled ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`ml-2 text-sm ${enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Recent security-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Audit log view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>Suggested improvements for your security posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateRecommendations().map((rec, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <strong>{rec.component}:</strong> {rec.action}
                            <br />
                            <span className="text-sm text-gray-600">{rec.issue}</span>
                          </div>
                          <Badge
                            className={
                              rec.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  {generateRecommendations().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No security recommendations at this time</p>
                      <p className="text-sm">Your security configuration looks good!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
};