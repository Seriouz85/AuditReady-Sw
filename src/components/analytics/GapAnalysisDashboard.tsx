import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  Target, Lightbulb, Clock, Users, FileText, Settings,
  ArrowRight, Calendar, Award, Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  GapAnalysisResult, 
  Recommendation, 
  ComplianceMetrics,
  gapAnalysisService 
} from '@/services/GapAnalysisService';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316', 
  medium: '#eab308',
  low: '#22c55e',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

const RECOMMENDATION_ICONS = {
  quick_win: <Zap className="h-4 w-4" />,
  strategic: <Target className="h-4 w-4" />,
  documentation: <FileText className="h-4 w-4" />,
  process: <Settings className="h-4 w-4" />,
  training: <Users className="h-4 w-4" />
};

interface GapAnalysisDashboardProps {
  organizationId: string;
}

export function GapAnalysisDashboard({ organizationId }: GapAnalysisDashboardProps) {
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<GapAnalysisResult[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadAnalysisData();
  }, [organizationId]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Load demo data
        setAnalysisResults(getDemoAnalysisResults());
        setMetrics(getDemoMetrics());
      } else {
        const [results, complianceMetrics] = await Promise.all([
          gapAnalysisService.performGapAnalysis(organizationId),
          gapAnalysisService.getComplianceMetrics(organizationId)
        ]);
        
        setAnalysisResults(results);
        setMetrics(complianceMetrics);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gap analysis data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runNewAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      if (isDemo) {
        // Simulate analysis for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast({
          title: 'Analysis Complete',
          description: 'Demo gap analysis has been updated'
        });
        return;
      }

      const results = await gapAnalysisService.performGapAnalysis(organizationId);
      setAnalysisResults(results);
      
      const updatedMetrics = await gapAnalysisService.getComplianceMetrics(organizationId);
      setMetrics(updatedMetrics);

      toast({
        title: 'Analysis Complete',
        description: 'Gap analysis has been updated with latest data'
      });
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to run gap analysis',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    return COLORS[risk as keyof typeof COLORS] || COLORS.medium;
  };

  const getPriorityColor = (priority: string) => {
    return COLORS[priority as keyof typeof COLORS] || COLORS.medium;
  };

  const filteredResults = selectedStandard === 'all' 
    ? analysisResults 
    : analysisResults.filter(result => result.standardId === selectedStandard);

  const allRecommendations = analysisResults
    .flatMap(result => result.recommendations)
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - 
             priorityOrder[a.priority as keyof typeof priorityOrder];
    });

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
          <h2 className="text-2xl font-bold">Gap Analysis & Recommendations</h2>
          <p className="text-gray-600">
            Intelligent insights to improve your compliance posture
          </p>
        </div>
        <Button 
          onClick={runNewAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Overview Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className="text-2xl font-bold">{metrics.overallScore}%</p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metrics.trendDirection)}
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <Progress value={metrics.overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Standards</p>
                  <p className="text-2xl font-bold">{Object.keys(metrics.standardBreakdown).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Being monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold">{allRecommendations.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Active suggestions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quick Wins</p>
                  <p className="text-2xl font-bold">
                    {allRecommendations.filter(r => r.type === 'quick_win').length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Low effort, high impact
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="standards">By Standard</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance by Standard */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="standardName" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="compliancePercentage" 
                      fill={COLORS.primary}
                      name="Compliance %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(metrics?.riskDistribution || {}).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value,
                        color: getRiskColor(key)
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(metrics?.riskDistribution || {}).map(([key], index) => (
                        <Cell key={`cell-${index}`} fill={getRiskColor(key)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gap Areas Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Top Gap Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults
                  .flatMap(result => result.gapAreas)
                  .sort((a, b) => b.gapPercentage - a.gapPercentage)
                  .slice(0, 5)
                  .map((area, index) => (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{area.categoryName}</h4>
                        <p className="text-sm text-gray-600">
                          {area.criticalGaps.length} critical gaps
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={area.impact === 'high' ? 'destructive' : 'outline'}>
                          {area.impact} impact
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-lg">{area.gapPercentage}%</p>
                          <p className="text-xs text-gray-500">gap</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {['critical', 'high', 'medium', 'low'].map(priority => {
              const priorityRecs = allRecommendations.filter(r => r.priority === priority);
              if (priorityRecs.length === 0) return null;

              return (
                <Card key={priority}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(priority) }}
                      />
                      <CardTitle className="capitalize">
                        {priority} Priority ({priorityRecs.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {priorityRecs.map((rec) => (
                        <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {RECOMMENDATION_ICONS[rec.type]}
                                <h4 className="font-semibold">{rec.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {rec.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{rec.description}</p>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span>{rec.estimatedEffort}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3 text-gray-400" />
                                  <span>{rec.estimatedImpact}% impact</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-gray-400" />
                                  <span>{rec.requiredResources.length} resources</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>{rec.timeframe}</span>
                                </div>
                              </div>
                              
                              {rec.dependencies.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Dependencies:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {rec.dependencies.map((dep, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {dep}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button variant="outline" size="sm" className="ml-4">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Standards</option>
              {analysisResults.map(result => (
                <option key={result.standardId} value={result.standardId}>
                  {result.standardName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6">
            {filteredResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{result.standardName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.riskLevel === 'low' ? 'default' : 'destructive'}
                        style={{ backgroundColor: getRiskColor(result.riskLevel) }}
                      >
                        {result.riskLevel} risk
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold text-lg">{result.compliancePercentage}%</p>
                        <p className="text-xs text-gray-500">compliance</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {result.completedRequirements} of {result.totalRequirements} requirements</span>
                      <Progress value={result.compliancePercentage} className="w-32" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Gap Areas</h5>
                        <div className="space-y-2">
                          {result.gapAreas.slice(0, 3).map((area) => (
                            <div key={area.id} className="flex items-center justify-between text-sm">
                              <span>{area.categoryName}</span>
                              <span className="font-medium">{area.gapPercentage}% gap</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Top Recommendations</h5>
                        <div className="space-y-2">
                          {result.recommendations.slice(0, 3).map((rec) => (
                            <div key={rec.id} className="flex items-center gap-2 text-sm">
                              {RECOMMENDATION_ICONS[rec.type]}
                              <span className="truncate">{rec.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                      name="Compliance Score %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Demo data functions
function getDemoAnalysisResults(): GapAnalysisResult[] {
  return [
    {
      id: 'gap-iso27001',
      standardId: 'iso27001',
      standardName: 'ISO 27001',
      totalRequirements: 114,
      completedRequirements: 86,
      compliancePercentage: 75,
      gapAreas: [
        {
          id: 'gap-access-control',
          categoryName: 'Access Control',
          requirementCount: 14,
          completedCount: 8,
          gapPercentage: 43,
          criticalGaps: ['Multi-factor Authentication', 'Privileged Access Management'],
          impact: 'high'
        },
        {
          id: 'gap-incident-management',
          categoryName: 'Incident Management',
          requirementCount: 8,
          completedCount: 5,
          gapPercentage: 38,
          criticalGaps: ['Incident Response Plan'],
          impact: 'medium'
        }
      ],
      recommendations: [
        {
          id: 'rec-mfa',
          type: 'quick_win',
          priority: 'high',
          title: 'Implement Multi-Factor Authentication',
          description: 'Deploy MFA across all critical systems to improve access control compliance.',
          estimatedEffort: '2-3 weeks',
          estimatedImpact: 20,
          requiredResources: ['IT Team', 'Security Team'],
          dependencies: ['MFA Solution'],
          timeframe: 'Short-term',
          category: 'Access Control',
          relatedRequirements: ['A.9.4.2', 'A.9.4.3']
        }
      ],
      riskLevel: 'medium',
      lastAnalyzed: new Date().toISOString()
    }
  ];
}

function getDemoMetrics(): ComplianceMetrics {
  return {
    overallScore: 75,
    trendDirection: 'improving',
    standardBreakdown: {
      'ISO 27001': 75,
      'SOC 2': 68,
      'PCI DSS': 82
    },
    categoryPerformance: {
      'Access Control': 57,
      'Incident Management': 62,
      'Risk Management': 78
    },
    riskDistribution: {
      low: 2,
      medium: 3,
      high: 1,
      critical: 0
    },
    monthlyProgress: [
      { month: 'Jan 2024', score: 68, completedRequirements: 145 },
      { month: 'Feb 2024', score: 72, completedRequirements: 156 },
      { month: 'Mar 2024', score: 75, completedRequirements: 167 }
    ]
  };
}