import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  FileText, 
  Play, 
  RefreshCw,
  TrendingDown,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { ContentQualityService } from '@/services/admin/ContentQualityService';
import type { ComprehensiveQualityReport, CategoryQualityReport } from '@/services/compliance/EnhancedUnifiedRequirementsGenerator';

interface QualityMetrics {
  overallScore: number;
  totalIssues: number;
  criticalIssues: number;
  highPriorityIssues: number;
  categoriesNeedingAttention: string[];
  lastAnalyzed: Date;
}

interface ActionPlan {
  immediateActions: string[];
  shortTermActions: string[];
  longTermActions: string[];
  estimatedEffort: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function ContentQualityAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ComprehensiveQualityReport | null>(null);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [issueBreakdown, setIssueBreakdown] = useState<{
    byType: Array<{ type: string; count: number; description: string }>;
    bySeverity: Array<{ severity: string; count: number; color: string }>;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryQualityReport | null>(null);

  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const [fullReport, metricsData, actionPlanData, issueData] = await Promise.all([
        ContentQualityService.runComprehensiveAnalysis(),
        ContentQualityService.getQualityMetrics(),
        ContentQualityService.getActionPlan(),
        ContentQualityService.getIssueBreakdown()
      ]);

      setReport(fullReport);
      setMetrics(metricsData);
      setActionPlan(actionPlanData);
      setIssueBreakdown(issueData);
    } catch (error) {
      console.error('Quality analysis failed:', error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSingleCategory = async (categoryName: string) => {
    setIsAnalyzing(true);
    try {
      const catReport = await ContentQualityService.analyzeSingleCategory(categoryName);
      setCategoryReport(catReport);
      setSelectedCategory(categoryName);
    } catch (error) {
      console.error('Category analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = async () => {
    try {
      const { content, filename } = await ContentQualityService.exportQualityReport();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Quality Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive quality scanning and analysis of unified requirements content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runComprehensiveAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          {report && (
            <Button variant="outline" onClick={exportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              {metrics.overallScore >= 85 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : metrics.overallScore >= 70 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore}/100
              </div>
              <Progress value={metrics.overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.criticalIssues} critical, {metrics.highPriorityIssues} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories at Risk</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.categoriesNeedingAttention.length}</div>
              <p className="text-xs text-muted-foreground">
                Need quality improvements
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      {report && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="actions">Action Plan</TabsTrigger>
            <TabsTrigger value="single">Single Category</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Issue Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Distribution by Type</CardTitle>
                  <CardDescription>
                    Breakdown of content quality issues found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {issueBreakdown && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={issueBreakdown.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="type" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [value, 'Count']}
                          labelFormatter={(label) => {
                            const item = issueBreakdown.byType.find(i => i.type === label);
                            return item ? `${label}: ${item.description}` : label;
                          }}
                        />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Severity</CardTitle>
                  <CardDescription>
                    Priority levels of identified issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {issueBreakdown && (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={issueBreakdown.bySeverity}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ severity, count }) => `${severity}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {issueBreakdown.bySeverity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Categories Needing Attention */}
            {metrics && metrics.categoriesNeedingAttention.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories Needing Attention</CardTitle>
                  <CardDescription>
                    Categories with scores below 70/100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {metrics.categoriesNeedingAttention.map((category) => (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">{category}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzeSingleCategory(category)}
                        >
                          Analyze
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Issue Analysis</CardTitle>
                <CardDescription>
                  All quality issues found across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {report.categoriesByScore.map((category) => (
                    <div key={category.categoryName} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.categoryName}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getScoreColor(category.overallScore)}`}>
                            {category.overallScore}/100
                          </span>
                          <Badge variant="outline">
                            {category.totalIssues} issues
                          </Badge>
                        </div>
                      </div>

                      {/* Category-level issues */}
                      {category.issues.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Category Issues:</h4>
                          {category.issues.map((issue, index) => (
                            <Alert key={index} className="mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="flex items-center gap-2">
                                <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </AlertTitle>
                              <AlertDescription>
                                {issue.description}
                                {issue.suggestion && (
                                  <div className="mt-1 text-xs">
                                    <strong>Suggestion:</strong> {issue.suggestion}
                                  </div>
                                )}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      {/* Sub-requirement issues */}
                      {category.subRequirements.filter(sub => sub.issues.length > 0).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Sub-requirement Issues:</h4>
                          <div className="space-y-2">
                            {category.subRequirements
                              .filter(sub => sub.issues.length > 0)
                              .map((sub) => (
                                <div key={sub.id} className="bg-gray-50 p-3 rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      Section {sub.id}) {sub.title}
                                    </span>
                                    <span className={`text-xs ${getScoreColor(sub.score)}`}>
                                      {sub.score}/100
                                    </span>
                                  </div>
                                  {sub.issues.map((issue, issueIndex) => (
                                    <div key={issueIndex} className="text-xs text-muted-foreground mb-1">
                                      <Badge variant={getSeverityBadgeVariant(issue.severity)} className="mr-2">
                                        {issue.severity}
                                      </Badge>
                                      {issue.description}
                                      {issue.suggestion && (
                                        <div className="mt-1">
                                          <strong>Fix:</strong> {issue.suggestion}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Quality scores for all categories (sorted by score)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.categoriesByScore.map((category) => (
                    <div key={category.categoryName} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{category.categoryName}</h3>
                          <span className={`font-bold ${getScoreColor(category.overallScore)}`}>
                            {category.overallScore}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{category.totalIssues} issues</span>
                          <span>•</span>
                          <span>{category.subRequirements.length} sub-requirements</span>
                        </div>
                        <Progress value={category.overallScore} className="mt-2 h-2" />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-4"
                        onClick={() => analyzeSingleCategory(category.categoryName)}
                      >
                        Analyze
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {actionPlan && (
              <>
                {/* Effort Estimation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Effort</CardTitle>
                    <CardDescription>
                      Time required to address quality issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {actionPlan.estimatedEffort.critical.toFixed(1)}h
                        </div>
                        <p className="text-sm text-muted-foreground">Critical</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {actionPlan.estimatedEffort.high.toFixed(1)}h
                        </div>
                        <p className="text-sm text-muted-foreground">High</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {actionPlan.estimatedEffort.medium.toFixed(1)}h
                        </div>
                        <p className="text-sm text-muted-foreground">Medium</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {actionPlan.estimatedEffort.low.toFixed(1)}h
                        </div>
                        <p className="text-sm text-muted-foreground">Low</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Total estimated time: {' '}
                        <span className="font-semibold">
                          {Object.values(actionPlan.estimatedEffort)
                            .reduce((sum, hours) => sum + hours, 0)
                            .toFixed(1)}h
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Immediate Actions</CardTitle>
                      <CardDescription>Do these first (Critical)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {actionPlan.immediateActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                        {actionPlan.immediateActions.length === 0 && (
                          <li className="text-sm text-muted-foreground">No immediate actions needed</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">Short-term Actions</CardTitle>
                      <CardDescription>Plan for this week (High)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {actionPlan.shortTermActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                        {actionPlan.shortTermActions.length === 0 && (
                          <li className="text-sm text-muted-foreground">No short-term actions needed</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Long-term Actions</CardTitle>
                      <CardDescription>Future improvements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {actionPlan.longTermActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                        {actionPlan.longTermActions.length === 0 && (
                          <li className="text-sm text-muted-foreground">No long-term actions needed</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Single Category Analysis</CardTitle>
                <CardDescription>
                  Analyze a specific category for detailed quality issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCategory && categoryReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{categoryReport.categoryName}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(categoryReport.overallScore)}`}>
                          {categoryReport.overallScore}/100
                        </span>
                        <Badge variant="outline">
                          {categoryReport.totalIssues} issues
                        </Badge>
                      </div>
                    </div>

                    <Progress value={categoryReport.overallScore} />

                    {/* Recommendations */}
                    {categoryReport.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {categoryReport.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sub-requirements breakdown */}
                    <div>
                      <h4 className="font-medium mb-2">Sub-requirements Analysis:</h4>
                      <div className="space-y-2">
                        {categoryReport.subRequirements.map((sub) => (
                          <div key={sub.id} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                Section {sub.id}) {sub.title}
                              </span>
                              <span className={`font-bold ${getScoreColor(sub.score)}`}>
                                {sub.score}/100
                              </span>
                            </div>
                            {sub.issues.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {sub.issues.map((issue, index) => (
                                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                                        {issue.severity}
                                      </Badge>
                                      <span>{issue.description}</span>
                                    </div>
                                    {issue.suggestion && (
                                      <div className="mt-1 text-muted-foreground">
                                        <strong>Fix:</strong> {issue.suggestion}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {sub.issues.length === 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ No issues found
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Select a category from the Overview tab or enter a category name to analyze
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Initial State */}
      {!report && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Content Quality Scanner</CardTitle>
            <CardDescription>
              Run comprehensive analysis to identify and prioritize content quality issues
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Click "Run Analysis" to start scanning all unified requirements for quality issues
            </p>
            <Button onClick={runComprehensiveAnalysis} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Quality Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}