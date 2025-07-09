import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Brain, 
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '@/lib/analytics/dashboardService';
import { mlAnalyticsService } from '@/lib/ml/analyticsService';
import { riskPredictionService } from '@/lib/ml/riskPrediction';
import { anomalyDetectionService } from '@/lib/ml/anomalyDetection';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  overview: any;
  insights: any[];
  riskAnalysis: any;
  anomalies: any[];
  realTimeMetrics: any;
}

const Analytics: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check if user is in demo mode
  const isDemoMode = organization?.settings?.is_demo === true || organizationId === 'demo';

  const loadAnalytics = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      
      if (isDemoMode || organizationId === 'demo') {
        // Return comprehensive demo data for ML analytics
        setData({
          overview: {
            complianceScore: 84.2,
            riskLevel: 'MEDIUM',
            activeAssessments: 12,
            recentAlerts: 3,
            mlInsights: 24,
            trendsData: [
              { date: '2024-01-01', compliance: 78, risk: 32 },
              { date: '2024-01-02', compliance: 79, risk: 30 },
              { date: '2024-01-03', compliance: 81, risk: 28 },
              { date: '2024-01-04', compliance: 82, risk: 26 },
              { date: '2024-01-05', compliance: 84, risk: 24 },
              { date: '2024-01-06', compliance: 85, risk: 22 },
              { date: '2024-01-07', compliance: 84, risk: 23 }
            ],
            frameworkStatus: [
              { name: 'ISO 27001', score: 89, status: 'COMPLIANT' },
              { name: 'GDPR', score: 95, status: 'COMPLIANT' },
              { name: 'SOC 2', score: 78, status: 'PARTIAL' },
              { name: 'HIPAA', score: 82, status: 'COMPLIANT' }
            ],
            frameworks: [
              { framework: 'ISO 27001', score: 89, status: 'COMPLIANT' },
              { framework: 'GDPR', score: 95, status: 'COMPLIANT' },
              { framework: 'SOC 2', score: 78, status: 'PARTIAL' },
              { framework: 'HIPAA', score: 82, status: 'COMPLIANT' }
            ],
            upcomingDeadlines: [
              { 
                id: 1, 
                title: 'Annual Security Assessment', 
                framework: 'ISO 27001', 
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                priority: 'HIGH' 
              },
              { 
                id: 2, 
                title: 'Data Protection Impact Assessment', 
                framework: 'GDPR', 
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                priority: 'MEDIUM' 
              },
              { 
                id: 3, 
                title: 'Vendor Risk Assessment', 
                framework: 'SOC 2', 
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                priority: 'CRITICAL' 
              },
              { 
                id: 4, 
                title: 'Business Associate Agreement Review', 
                framework: 'HIPAA', 
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: 'MEDIUM' 
              },
              { 
                id: 5, 
                title: 'Penetration Testing Report', 
                framework: 'ISO 27001', 
                dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                priority: 'HIGH' 
              }
            ]
          },
          insights: [
            {
              id: 1,
              type: 'COMPLIANCE_TREND',
              title: 'Compliance Score Trending Upward',
              description: 'Your organization\'s compliance score has improved by 6.2% over the last 30 days.',
              confidence: 0.92,
              impact: 'HIGH',
              actions: ['Continue current security training', 'Implement automated monitoring'],
              createdAt: new Date()
            },
            {
              id: 2,
              type: 'RISK_PREDICTION',
              title: 'Potential Risk in Access Management',
              description: 'ML models predict a 15% increase in access-related risks within the next 2 weeks.',
              confidence: 0.78,
              impact: 'MEDIUM',
              actions: ['Review user access permissions', 'Implement MFA for critical systems'],
              createdAt: new Date()
            },
            {
              id: 3,
              type: 'ANOMALY_DETECTION',
              title: 'Unusual Data Access Pattern Detected',
              description: 'Detected 23% increase in after-hours database access compared to baseline.',
              confidence: 0.85,
              impact: 'HIGH',
              actions: ['Investigate access logs', 'Implement additional monitoring'],
              createdAt: new Date()
            }
          ],
          riskAnalysis: {
            overall: 'MEDIUM',
            score: 2.3,
            categories: [
              { name: 'Technical', risk: 2.1, percentage: 35 },
              { name: 'Operational', risk: 2.8, percentage: 28 },
              { name: 'Compliance', risk: 1.9, percentage: 22 },
              { name: 'Financial', risk: 2.5, percentage: 15 }
            ],
            predictions: [
              { timeframe: '1 week', riskLevel: 2.1, factors: ['Training completion', 'Patch management'] },
              { timeframe: '1 month', riskLevel: 2.0, factors: ['Policy updates', 'Audit preparation'] },
              { timeframe: '3 months', riskLevel: 1.8, factors: ['Framework certification', 'Process maturity'] }
            ],
            recommendations: [
              {
                id: 1,
                title: 'Implement Multi-Factor Authentication',
                description: 'Deploy MFA across all critical systems to reduce authentication-based risks',
                impact: 'HIGH',
                effort: 'MEDIUM',
                category: 'Technical',
                potentialRiskReduction: 25
              },
              {
                id: 2,
                title: 'Enhance Security Awareness Training',
                description: 'Expand phishing simulation and security training programs',
                impact: 'MEDIUM',
                effort: 'LOW',
                category: 'Operational',
                potentialRiskReduction: 18
              },
              {
                id: 3,
                title: 'Update Incident Response Plan',
                description: 'Review and update incident response procedures based on recent threats',
                impact: 'HIGH',
                effort: 'MEDIUM',
                category: 'Compliance',
                potentialRiskReduction: 22
              },
              {
                id: 4,
                title: 'Implement Continuous Monitoring',
                description: 'Deploy automated monitoring tools for real-time threat detection',
                impact: 'HIGH',
                effort: 'HIGH',
                category: 'Technical',
                potentialRiskReduction: 30
              },
              {
                id: 5,
                title: 'Conduct Vendor Risk Assessment',
                description: 'Evaluate and mitigate third-party vendor security risks',
                impact: 'MEDIUM',
                effort: 'MEDIUM',
                category: 'Operational',
                potentialRiskReduction: 15
              }
            ]
          },
          anomalies: [
            {
              id: 1,
              type: 'DATA_ACCESS',
              severity: 'HIGH',
              description: 'Unusual data access pattern detected in HR database',
              detectedAt: new Date(),
              affectedSystems: ['HR Database', 'Employee Portal'],
              confidence: 0.89
            },
            {
              id: 2,
              type: 'LOGIN_PATTERN',
              severity: 'MEDIUM',
              description: 'Multiple failed login attempts from unusual locations',
              detectedAt: new Date(),
              affectedSystems: ['Authentication System'],
              confidence: 0.76
            }
          ],
          realTimeMetrics: {
            activeUsers: 347,
            systemHealth: 98.5,
            securityAlerts: 3,
            complianceGaps: 7,
            complianceScore: 84.2,
            lastScanTime: new Date()
          }
        });
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [overview, insights, riskAnalysis, anomalies, realTimeMetrics] = await Promise.all([
        mlAnalyticsService.getComplianceOverview(organizationId),
        mlAnalyticsService.getInsights(organizationId, undefined, 20),
        riskPredictionService.analyzeRisk(organizationId),
        anomalyDetectionService.detectAnomalies(organizationId),
        dashboardService.getRealTimeMetrics(organizationId)
      ]);

      setData({
        overview,
        insights,
        riskAnalysis,
        anomalies,
        realTimeMetrics
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  const exportReport = async (format: 'pdf' | 'png' | 'json') => {
    if (!organizationId) return;
    
    try {
      const url = await dashboardService.exportDashboard(organizationId, format);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Set up auto-refresh every 5 minutes (only if not in demo mode)
    if (!isDemoMode) {
      const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    
    // Return undefined for demo mode (no cleanup needed)
    return undefined;
  }, [organizationId, isDemoMode]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictive analytics for compliance management
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-muted-foreground mr-4">
            <Clock className="h-4 w-4 mr-1" />
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realTimeMetrics.complianceScore.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.1% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={
                data.realTimeMetrics.riskLevel === 'LOW' ? 'secondary' :
                data.realTimeMetrics.riskLevel === 'MEDIUM' ? 'default' :
                data.realTimeMetrics.riskLevel === 'HIGH' ? 'destructive' : 'destructive'
              }>
                {data.realTimeMetrics.riskLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Risk Score: {data.riskAnalysis.overallScore}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realTimeMetrics.activeAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {data.realTimeMetrics.overdueRequirements} overdue requirements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realTimeMetrics.recentAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Insights</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.insights?.filter(i => i.impact === 'high' || i.impact === 'critical').length || 0} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>Historical compliance score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.overview.trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance Score']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Framework Status */}
            <Card>
              <CardHeader>
                <CardTitle>Framework Compliance</CardTitle>
                <CardDescription>Current status by framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.overview.frameworks?.map((framework: any) => (
                    <div key={framework.framework} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{framework.framework}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {framework.requirementsCompleted}/{framework.totalRequirements}
                          </span>
                          <Badge variant={
                            framework.status === 'COMPLIANT' ? 'secondary' :
                            framework.status === 'PARTIALLY_COMPLIANT' ? 'default' :
                            framework.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                          }>
                            {framework.score}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            framework.score >= 80 ? 'bg-green-500' :
                            framework.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${framework.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Assessments requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.overview.upcomingDeadlines?.slice(0, 5).map((deadline: any) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-muted-foreground">{deadline.framework}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </span>
                      <Badge variant={
                        deadline.priority === 'CRITICAL' ? 'destructive' :
                        deadline.priority === 'HIGH' ? 'destructive' :
                        deadline.priority === 'MEDIUM' ? 'default' : 'secondary'
                      }>
                        {deadline.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.insights?.map((insight: any, index: number) => (
              <Card key={insight.id || index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        insight.impact === 'critical' ? 'destructive' :
                        insight.impact === 'high' ? 'destructive' :
                        insight.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {insight.impact}
                      </Badge>
                      <Badge variant="outline">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.description}</p>
                  
                  {insight.suggestedActions?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggested Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {insight.suggestedActions?.map((action: string, i: number) => (
                          <li key={i} className="text-muted-foreground">{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Type: {insight.type.replace('_', ' ')}</span>
                    <span>{new Date(insight.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Risk by Category</CardTitle>
                <CardDescription>Current risk distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.riskAnalysis.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="score"
                      >
                        {data.riskAnalysis.categories?.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Recommendations</CardTitle>
                <CardDescription>Prioritized actions to reduce risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.riskAnalysis.recommendations?.slice(0, 5).map((rec: any, index: number) => (
                    <div key={rec.id || index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant="outline">
                          -{rec.potentialRiskReduction}% risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span>Impact: {rec.impact}</span>
                        <span>•</span>
                        <span>Effort: {rec.effort}</span>
                        <span>•</span>
                        <span>Category: {rec.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="space-y-6">
            {data.anomalies?.length > 0 ? (
              data.anomalies?.map((anomaly: any) => (
                <Card key={anomaly.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{anomaly.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          anomaly.severity === 'CRITICAL' ? 'destructive' :
                          anomaly.severity === 'HIGH' ? 'destructive' :
                          anomaly.severity === 'MEDIUM' ? 'default' : 'secondary'
                        }>
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="outline">
                          {(anomaly.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{anomaly.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Type: {anomaly.type.replace('_', ' ')}</span>
                      <span>Detected: {new Date(anomaly.detectedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Anomalies Detected</h3>
                  <p className="text-muted-foreground">
                    Your compliance system is operating normally with no unusual patterns detected.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.riskAnalysis.predictions?.map((prediction: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Risk Prediction - {prediction.timeframe}</CardTitle>
                  <CardDescription>
                    Predicted risk level in {prediction.timeframe.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Predicted Risk Level:</span>
                    <Badge variant={
                      prediction.predictedLevel === 'LOW' ? 'secondary' :
                      prediction.predictedLevel === 'MEDIUM' ? 'default' :
                      prediction.predictedLevel === 'HIGH' ? 'destructive' : 'destructive'
                    }>
                      {prediction.predictedLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Predicted Score:</span>
                    <span className="font-medium">{prediction.predictedScore}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Confidence:</span>
                    <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                  
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;