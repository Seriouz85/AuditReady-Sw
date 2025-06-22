import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  AlertTriangle, Shield, Clock, FileText, CheckCircle, XCircle,
  Calendar, User, Settings, Play, Pause, Bell, BellOff,
  TrendingUp, TrendingDown, Minus, Target, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ComplianceAlert, 
  MonitoringDashboardData,
  complianceMonitoringService 
} from '@/services/ComplianceMonitoringService';
import { useAuth } from '@/contexts/AuthContext';

const SEVERITY_COLORS = {
  info: '#3b82f6',
  warning: '#f59e0b', 
  critical: '#ef4444'
};

const ALERT_ICONS = {
  deadline_approaching: <Clock className="h-4 w-4" />,
  non_compliance: <AlertTriangle className="h-4 w-4" />,
  documentation_missing: <FileText className="h-4 w-4" />,
  assessment_overdue: <Calendar className="h-4 w-4" />,
  risk_threshold_exceeded: <Shield className="h-4 w-4" />
};

interface ComplianceMonitoringDashboardProps {
  organizationId: string;
}

export function ComplianceMonitoringDashboard({ organizationId }: ComplianceMonitoringDashboardProps) {
  const { toast } = useToast();
  const { user, isDemo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MonitoringDashboardData | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Set up periodic monitoring (every 5 minutes)
    const interval = setInterval(() => {
      if (isMonitoringActive) {
        runMonitoringCheck();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [organizationId, isMonitoringActive]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        setDashboardData(getDemoMonitoringData());
      } else {
        const data = await complianceMonitoringService.getMonitoringDashboard(organizationId);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load monitoring dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runMonitoringCheck = async () => {
    try {
      setIsRunningCheck(true);
      
      if (isDemo) {
        // Simulate monitoring check for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
          title: 'Monitoring Check Complete',
          description: 'Demo compliance monitoring has been updated'
        });
        return;
      }

      const alerts = await complianceMonitoringService.runMonitoringChecks(organizationId);
      
      // Refresh dashboard data
      await loadDashboardData();
      
      if (alerts.length > 0) {
        const criticalCount = alerts.filter(alert => alert.severity === 'critical').length;
        toast({
          title: 'Monitoring Check Complete',
          description: `Found ${alerts.length} alerts${criticalCount > 0 ? `, including ${criticalCount} critical` : ''}`,
          variant: criticalCount > 0 ? 'destructive' : 'default'
        });
      } else {
        toast({
          title: 'Monitoring Check Complete',
          description: 'No new compliance issues detected'
        });
      }
    } catch (error) {
      console.error('Error running monitoring check:', error);
      toast({
        title: 'Error',
        description: 'Failed to run monitoring check',
        variant: 'destructive'
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleAlertAction = async (alertId: string, action: 'resolve' | 'dismiss') => {
    try {
      if (isDemo) {
        toast({
          title: 'Demo Mode',
          description: `Alert ${action}d in demo mode`
        });
        return;
      }

      if (action === 'resolve') {
        await complianceMonitoringService.resolveAlert(alertId, user?.id || '');
      } else {
        await complianceMonitoringService.dismissAlert(alertId, user?.id || '');
      }
      
      await loadDashboardData();
      
      toast({
        title: 'Success',
        description: `Alert ${action}d successfully`
      });
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} alert`,
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No monitoring data available</h3>
        <p className="text-gray-500 mb-4">Run a monitoring check to get started</p>
        <Button onClick={runMonitoringCheck} disabled={isRunningCheck}>
          {isRunningCheck ? 'Running...' : 'Run Check'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Monitoring</h2>
          <p className="text-gray-600">
            Real-time monitoring and alerts for compliance issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isMonitoringActive ? "default" : "outline"}
            onClick={() => setIsMonitoringActive(!isMonitoringActive)}
            className="flex items-center gap-2"
          >
            {isMonitoringActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            )}
          </Button>
          <Button 
            onClick={runMonitoringCheck}
            disabled={isRunningCheck}
            className="flex items-center gap-2"
          >
            {isRunningCheck ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Run Check
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Monitoring Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMonitoringActive ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <h3 className="font-medium">
                  Monitoring {isMonitoringActive ? 'Active' : 'Paused'}
                </h3>
                <p className="text-sm text-gray-600">
                  Last check: {new Date(dashboardData.metrics.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant={isMonitoringActive ? "default" : "secondary"}>
              {isMonitoringActive ? 'Live' : 'Paused'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.complianceScore}%</p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(dashboardData.metrics.trendDirection)}
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <Progress value={dashboardData.metrics.complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.activeAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboardData.criticalIssues.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.overdueAssessments}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Assessments past due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.riskScore}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <Progress 
              value={dashboardData.metrics.riskScore} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="critical">Critical Issues</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">All Clear!</h3>
                    <p className="text-gray-500">No active alerts at this time</p>
                  </div>
                ) : (
                  dashboardData.recentAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="p-1 rounded"
                              style={{ backgroundColor: `${getSeverityColor(alert.severity)}20` }}
                            >
                              <div style={{ color: getSeverityColor(alert.severity) }}>
                                {ALERT_ICONS[alert.type]}
                              </div>
                            </div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: getSeverityColor(alert.severity),
                                color: getSeverityColor(alert.severity)
                              }}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{alert.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>{alert.relatedEntity.type}: {alert.relatedEntity.name}</span>
                            </div>
                            {alert.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Assigned</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <strong>Action Required:</strong> {alert.actionRequired}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'resolve')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'dismiss')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.criticalIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Critical Issues</h3>
                    <p className="text-gray-500">All critical compliance issues have been addressed</p>
                  </div>
                ) : (
                  dashboardData.criticalIssues.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <h4 className="font-semibold text-red-900">{alert.title}</h4>
                          </div>
                          <p className="text-red-800 mb-2">{alert.description}</p>
                          <p className="text-sm text-red-600 font-medium">
                            {alert.actionRequired}
                          </p>
                          {alert.dueDate && (
                            <p className="text-xs text-red-500 mt-1">
                              Due: {new Date(alert.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                        >
                          Address Now
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Upcoming Deadlines</h3>
                    <p className="text-gray-500">All deadlines are up to date</p>
                  </div>
                ) : (
                  dashboardData.upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{deadline.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{deadline.type}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={deadline.daysRemaining <= 3 ? "destructive" : "outline"}>
                          {deadline.daysRemaining} days
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.complianceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Compliance Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.complianceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="alerts" 
                      fill="#f59e0b"
                      name="Alert Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Demo data function
function getDemoMonitoringData(): MonitoringDashboardData {
  return {
    metrics: {
      totalRequirements: 124,
      compliantRequirements: 98,
      overdueAssessments: 3,
      pendingDocuments: 7,
      activeAlerts: 5,
      complianceScore: 79,
      trendDirection: 'improving',
      riskScore: 85,
      lastUpdated: new Date().toISOString()
    },
    recentAlerts: [
      {
        id: 'alert-1',
        organizationId: 'demo-org',
        type: 'deadline_approaching',
        severity: 'warning',
        title: 'Security Assessment Due Soon',
        description: 'Annual security assessment for ISO 27001 is due in 5 days',
        relatedEntity: {
          type: 'assessment',
          id: 'assessment-1',
          name: 'ISO 27001 Annual Assessment'
        },
        actionRequired: 'Schedule and complete the security assessment',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        metadata: {}
      },
      {
        id: 'alert-2',
        organizationId: 'demo-org',
        type: 'documentation_missing',
        severity: 'warning',
        title: 'Missing Security Policies',
        description: 'Access control policy documentation is missing for high priority requirements',
        relatedEntity: {
          type: 'requirement',
          id: 'req-1',
          name: 'Access Control Management'
        },
        actionRequired: 'Upload required security policy documents',
        createdAt: new Date().toISOString(),
        status: 'active',
        metadata: {}
      }
    ],
    criticalIssues: [],
    upcomingDeadlines: [
      {
        id: 'deadline-1',
        type: 'assessment',
        name: 'ISO 27001 Annual Assessment',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 5
      }
    ],
    complianceTrends: [
      { date: '2024-01-01', score: 72, alerts: 8 },
      { date: '2024-01-08', score: 75, alerts: 6 },
      { date: '2024-01-15', score: 77, alerts: 5 },
      { date: '2024-01-22', score: 79, alerts: 5 }
    ]
  };
}