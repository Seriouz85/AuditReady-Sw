import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Brain, 
  Download,
  RefreshCw,
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { complianceMonitoringService } from '@/services/ComplianceMonitoringService';
import { dashboardService } from '@/lib/analytics/dashboardService';
import { mlAnalyticsService } from '@/lib/ml/analyticsService';
import { riskPredictionService } from '@/lib/ml/riskPrediction';
import { anomalyDetectionService } from '@/lib/ml/anomalyDetection';
import { toast } from '@/utils/toast';

// Combined data interface for monitoring and analytics
interface MonitoringAnalyticsData {
  // Monitoring data
  monitoringStatus: {
    isActive: boolean;
    lastCheck: Date;
    nextCheck: Date;
  };
  complianceMetrics: {
    score: number;
    trend: number;
    activeAlerts: number;
    overdueItems: number;
    riskScore: number;
  };
  alerts: any[];
  deadlines: any[];
  // Analytics data
  mlInsights: any[];
  riskAnalysis: any;
  anomalies: any[];
  predictiveAnalytics: any;
  trendsData: any[];
}

const ComplianceMonitoring = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization } = useAuth();
  const [data, setData] = useState<MonitoringAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Determine organization ID
  const currentOrgId = organizationId || organization?.id || 'demo';
  const isDemoMode = organization?.settings?.is_demo === true || currentOrgId === 'demo';
  
  const loadMonitoringAndAnalytics = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Comprehensive demo data combining both monitoring and analytics
        setData({
          monitoringStatus: {
            isActive: true,
            lastCheck: new Date(Date.now() - 5 * 60 * 1000),
            nextCheck: new Date(Date.now() + 10 * 60 * 1000)
          },
          complianceMetrics: {
            score: 84.2,
            trend: 6.2,
            activeAlerts: 7,
            overdueItems: 3,
            riskScore: 23
          },
          alerts: [
            {
              id: 1,
              type: 'deadline_approaching',
              severity: 'warning',
              title: 'ISO 27001 Assessment Due Soon',
              description: 'Annual ISO 27001 compliance assessment is due in 5 days',
              entity: { type: 'assessment', name: 'ISO 27001 Annual Review' },
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              assignedTo: 'security-team'
            },
            {
              id: 2,
              type: 'compliance_violation',
              severity: 'critical',
              title: 'GDPR Data Processing Gap',
              description: 'Missing data processing documentation for new system',
              entity: { type: 'requirement', name: 'GDPR Article 30' },
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              assignedTo: 'data-protection-officer'
            }
          ],
          deadlines: [
            {
              id: 1,
              title: 'SOC 2 Type II Report',
              type: 'assessment',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              priority: 'HIGH'
            },
            {
              id: 2,
              title: 'Security Training Completion',
              type: 'requirement',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              priority: 'MEDIUM'
            }
          ],
          mlInsights: [
            {
              id: 1,
              type: 'COMPLIANCE_TREND',
              title: 'Compliance Score Trending Upward',
              description: 'Your organization\'s compliance score has improved by 6.2% over the last 30 days.',
              confidence: 0.92,
              impact: 'HIGH',
              suggestedActions: ['Continue current security training', 'Implement automated monitoring'],
              createdAt: new Date()
            },
            {
              id: 2,
              type: 'RISK_PREDICTION',
              title: 'Potential Risk in Access Management',
              description: 'ML models predict a 15% increase in access-related risks within the next 2 weeks.',
              confidence: 0.78,
              impact: 'MEDIUM',
              suggestedActions: ['Review user access permissions', 'Implement MFA for critical systems'],
              createdAt: new Date()
            }
          ],
          riskAnalysis: {
            overall: 23,
            categories: [
              { name: 'Technical', value: 15, color: '#8884d8' },
              { name: 'Operational', value: 30, color: '#82ca9d' },
              { name: 'Compliance', value: 25, color: '#ffc658' },
              { name: 'Financial', value: 30, color: '#ff7300' }
            ],
            predictions: [
              {
                timeframe: '30 days',
                risk: 26,
                confidence: 0.85,
                factors: ['Upcoming compliance deadlines', 'Staff changes', 'New regulatory requirements']
              },
              {
                timeframe: '60 days', 
                risk: 21,
                confidence: 0.72,
                factors: ['Training completion', 'System updates', 'Process improvements']
              }
            ],
            recommendations: [
              { priority: 'HIGH', action: 'Implement automated compliance monitoring' },
              { priority: 'MEDIUM', action: 'Increase security awareness training frequency' }
            ]
          },
          anomalies: [
            {
              id: 1,
              type: 'compliance_drop',
              severity: 'warning',
              title: 'Unusual Compliance Score Drop',
              description: 'Compliance score dropped 12% in the last week',
              detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              confidence: 0.89
            }
          ],
          predictiveAnalytics: {
            complianceTrajectory: {
              current: 84.2,
              projected30Days: 87.1,
              projected60Days: 89.5,
              confidence: 0.81
            }
          },
          trendsData: [
            { date: '2024-01-01', compliance: 78, risk: 32, alerts: 12 },
            { date: '2024-01-02', compliance: 79, risk: 30, alerts: 10 },
            { date: '2024-01-03', compliance: 81, risk: 28, alerts: 8 },
            { date: '2024-01-04', compliance: 82, risk: 26, alerts: 9 },
            { date: '2024-01-05', compliance: 84, risk: 24, alerts: 7 },
            { date: '2024-01-06', compliance: 85, risk: 22, alerts: 6 },
            { date: '2024-01-07', compliance: 84, risk: 23, alerts: 7 }
          ]
        });
      } else {
        // In production, load data from multiple services
        const [monitoringData, analyticsData, mlData] = await Promise.all([
          complianceMonitoringService.getMonitoringDashboard(currentOrgId),
          dashboardService.getDashboardData(currentOrgId),
          mlAnalyticsService.getInsights(currentOrgId)
        ]);
        
        // Combine the data from different services
        setData({
          ...monitoringData,
          ...analyticsData,
          ...mlData
        });
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load monitoring and analytics data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringAndAnalytics();
    setRefreshing(false);
  };
  
  const handleRunManualCheck = async () => {
    setRunningCheck(true);
    try {
      if (!isDemoMode) {
        await complianceMonitoringService.runMonitoringChecks(currentOrgId);
      }
      await loadMonitoringAndAnalytics();
      toast.success('Compliance check completed successfully');
    } catch (error) {
      toast.error('Failed to run compliance check');
    } finally {
      setRunningCheck(false);
    }
  };
  
  const handleToggleMonitoring = async () => {
    try {
      if (data?.monitoringStatus?.isActive) {
        // For demo purposes, just toggle the status
        toast.success('Monitoring paused');
      } else {
        // For demo purposes, just toggle the status  
        toast.success('Monitoring resumed');
      }
      await loadMonitoringAndAnalytics();
    } catch (error) {
      toast.error('Failed to toggle monitoring');
    }
  };
  
  const exportReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        organizationId: currentOrgId,
        ...data
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };
  
  useEffect(() => {
    loadMonitoringAndAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMonitoringAndAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentOrgId, isDemoMode]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load monitoring data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Monitoring & ML Analytics</h1>
          <p className="text-muted-foreground">
            Real-time compliance monitoring with AI-powered insights and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            size="sm" 
            onClick={handleRunManualCheck}
            disabled={runningCheck}
          >
            <Activity className={`h-4 w-4 mr-2 ${runningCheck ? 'animate-spin' : ''}`} />
            {runningCheck ? 'Running Check...' : 'Run Check'}
          </Button>
        </div>
      </div>
      
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Monitoring Status
              </CardTitle>
              <CardDescription>
                Real-time compliance monitoring with ML-powered insights
              </CardDescription>
            </div>
            <Button
              variant={data.monitoringStatus?.isActive ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleMonitoring}
            >
              {data.monitoringStatus?.isActive ? (
                <><Pause className="h-4 w-4 mr-2" />Pause Monitoring</>
              ) : (
                <><Play className="h-4 w-4 mr-2" />Resume Monitoring</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                data.monitoringStatus?.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">
                {data.monitoringStatus?.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last check: {data.monitoringStatus?.lastCheck?.toLocaleTimeString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">
              Next check: {data.monitoringStatus?.nextCheck?.toLocaleTimeString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.score || 0}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.complianceMetrics?.score || 0} className="flex-1" />
              <Badge variant="secondary" className="text-xs">
                +{data.complianceMetrics?.trend || 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.alerts?.filter(a => a.severity === 'critical').length || 0} critical alerts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.mlInsights?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.mlInsights?.filter(i => i.impact === 'HIGH' || i.impact === 'CRITICAL').length || 0} high priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.riskScore || 0}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.complianceMetrics?.riskScore || 0} className="flex-1" />
              <Badge variant={(data.complianceMetrics?.riskScore || 0) < 30 ? "default" : "destructive"} className="text-xs">
                {(data.complianceMetrics?.riskScore || 0) < 30 ? 'Low' : 'Medium'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
        </TabsList>
        
        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {data.alerts?.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {alert.type === 'deadline_approaching' && <Clock className="h-4 w-4" />}
                        {alert.type === 'compliance_violation' && <XCircle className="h-4 w-4" />}
                        {alert.type === 'missing_documentation' && <FileText className="h-4 w-4" />}
                        {!['deadline_approaching', 'compliance_violation', 'missing_documentation'].includes(alert.type) && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'default'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entity:</span>
                      <p className="text-muted-foreground">{alert.entity?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">{alert.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Assigned:</span>
                      <p className="text-muted-foreground">{alert.assignedTo || 'Unassigned'}</p>
                    </div>
                    {alert.dueDate && (
                      <div>
                        <span className="font-medium">Due:</span>
                        <p className="text-muted-foreground">{alert.dueDate.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* ML Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {data.mlInsights?.map((insight, index) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'HIGH' || insight.impact === 'CRITICAL' ? 'destructive' : 'secondary'}>
                        {insight.impact} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% Confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {insight.suggestedActions?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggested Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {insight.suggestedActions?.map((action: string, i: number) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Predictive Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>AI-powered risk assessment and categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{data.riskAnalysis?.overall || 0}%</div>
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.riskAnalysis?.categories || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {data.riskAnalysis?.categories?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Predictions</CardTitle>
                <CardDescription>ML-powered risk forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.riskAnalysis?.predictions?.map((prediction: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prediction.timeframe}</h4>
                        <Badge variant={prediction.risk < 25 ? 'default' : prediction.risk < 50 ? 'secondary' : 'destructive'}>
                          {prediction.risk}% Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Confidence: {Math.round(prediction.confidence * 100)}%
                      </p>
                      {prediction.factors?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Contributing Factors:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {prediction.factors?.map((factor: string, i: number) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Anomalies */}
          {data.anomalies?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>AI-detected unusual patterns in compliance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.anomalies?.map((anomaly: any) => (
                    <div key={anomaly.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <h4 className="font-medium">{anomaly.title}</h4>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {Math.round(anomaly.confidence * 100)}% Confidence
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {anomaly.detectedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Trends & Charts Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Risk Trends</CardTitle>
              <CardDescription>Historical compliance and risk metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trendsData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Compliance Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Risk Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Volume Trends</CardTitle>
              <CardDescription>Alert frequency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trendsData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="alerts" fill="#ffc658" name="Alert Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Upcoming Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-4">
          <div className="grid gap-4">
            {data.deadlines?.map((deadline) => (
              <Card key={deadline.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{deadline.title}</h4>
                        <p className="text-sm text-muted-foreground">{deadline.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={deadline.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                        {deadline.priority}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {deadline.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceMonitoring;