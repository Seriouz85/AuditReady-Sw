import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Target,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Activity,
  Search,
  Filter,
  PieChart,
  Users,
  Clock,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as ReChartPie, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, Legend } from 'recharts';
import { toast } from '@/utils/toast';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

// Types
interface GapAnalysisData {
  selectedStandards: string[];
  gaps: GapItem[];
  insights: InsightItem[];
  metrics: GapMetrics;
  overdueAssessments: OverdueAssessment[];
  requirementsByStatus: RequirementStatusBreakdown;
  trends: TrendData[];
}

interface GapItem {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementName: string;
  standardId: string;
  standardName: string;
  category: string;
  status: 'not-fulfilled' | 'not-applicable' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  daysOverdue?: number;
  responsibleParty?: string;
  lastAssessmentDate?: string;
  expectedCompletionDate?: string;
  impact: string;
  effort: string;
  remediation: string;
}

interface InsightItem {
  id: string;
  type: 'overdue' | 'trending' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedStandards?: string[];
  metrics?: {
    value: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
}

interface GapMetrics {
  totalRequirements: number;
  fulfilledRequirements: number;
  notFulfilledRequirements: number;
  notApplicableRequirements: number;
  overdueRequirements: number;
  complianceScore: number;
  riskScore: number;
  improvementRate: number;
  timeToCompliance: number; // days
}

interface OverdueAssessment {
  id: string;
  assessmentName: string;
  standardName: string;
  dueDate: string;
  daysOverdue: number;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RequirementStatusBreakdown {
  fulfilled: number;
  partiallyFulfilled: number;
  notFulfilled: number;
  notApplicable: number;
}

interface TrendData {
  date: string;
  complianceScore: number;
  gaps: number;
  resolved: number;
  new: number;
}

const COLORS = {
  fulfilled: '#10b981',
  partiallyFulfilled: '#f59e0b',
  notFulfilled: '#ef4444',
  notApplicable: '#6b7280',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

const GapAnalysis = () => {
  const { organization } = useAuth();
  const organizationId = organization?.id || 'demo-org';
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<GapAnalysisData | null>(null);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load available standards from localStorage
  const getAvailableStandards = () => {
    const savedStandards = JSON.parse(localStorage.getItem('standards') || '[]');
    return savedStandards.length > 0 ? savedStandards : [
      { id: 'iso-27001', name: 'ISO 27001', version: '2022' },
      { id: 'gdpr', name: 'GDPR', version: '2016' },
      { id: 'soc2', name: 'SOC 2', version: 'Type II' },
      { id: 'nist', name: 'NIST CSF', version: '2.0' },
      { id: 'cis', name: 'CIS Controls', version: 'v8' }
    ];
  };

  const loadGapAnalysisData = async () => {
    try {
      setLoading(true);
      
      // Demo data generation based on selected standards
      const availableStandards = getAvailableStandards();
      const activeStandards = selectedStandards.length > 0 
        ? availableStandards.filter((s: any) => selectedStandards.includes(s.id))
        : availableStandards;

      // Generate gaps based on selected standards
      const gaps: GapItem[] = [];
      activeStandards.forEach((standard: any) => {
        // Generate 5-10 gaps per standard
        const gapCount = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < gapCount; i++) {
          gaps.push({
            id: `gap-${standard.id}-${i}`,
            requirementId: `req-${standard.id}-${i}`,
            requirementCode: `${standard.id.toUpperCase()}-${i + 1}`,
            requirementName: getRandomRequirementName(standard.id),
            standardId: standard.id,
            standardName: standard.name,
            category: getRandomCategory(),
            status: Math.random() > 0.3 ? 'not-fulfilled' : (Math.random() > 0.5 ? 'not-applicable' : 'overdue'),
            priority: getRandomPriority(),
            daysOverdue: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 1 : undefined,
            responsibleParty: getRandomResponsible(),
            lastAssessmentDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            expectedCompletionDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            impact: getRandomImpact(),
            effort: getRandomEffort(),
            remediation: getRandomRemediation()
          });
        }
      });

      // Generate insights
      const insights: InsightItem[] = [
        {
          id: 'insight-1',
          type: 'overdue',
          title: 'Critical Requirements Overdue',
          description: `${gaps.filter(g => g.status === 'overdue').length} requirements are past their due date, impacting compliance across ${activeStandards.length} standards.`,
          impact: 'critical',
          actionRequired: true,
          suggestedActions: [
            'Prioritize overdue critical requirements',
            'Assign additional resources to high-impact items',
            'Set up automated reminders for upcoming deadlines'
          ],
          relatedStandards: activeStandards.map((s: any) => s.name),
          metrics: {
            value: gaps.filter(g => g.status === 'overdue').length,
            trend: 'up',
            change: 15
          }
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Quick Win Opportunities',
          description: `${Math.floor(gaps.length * 0.3)} requirements can be resolved with minimal effort, potentially improving compliance by 12%.`,
          impact: 'medium',
          actionRequired: false,
          suggestedActions: [
            'Focus on documentation gaps first',
            'Batch similar requirements for efficiency',
            'Leverage existing controls across standards'
          ],
          metrics: {
            value: Math.floor(gaps.length * 0.3),
            trend: 'stable',
            change: 0
          }
        },
        {
          id: 'insight-3',
          type: 'risk',
          title: 'High-Risk Areas Identified',
          description: 'Access control and incident response show the highest gap concentration, requiring immediate attention.',
          impact: 'high',
          actionRequired: true,
          suggestedActions: [
            'Implement multi-factor authentication',
            'Update incident response procedures',
            'Conduct security awareness training'
          ],
          relatedStandards: activeStandards.slice(0, 2).map((s: any) => s.name)
        }
      ];

      // Generate overdue assessments
      const overdueAssessments: OverdueAssessment[] = activeStandards.slice(0, 3).map((standard: any, index: number) => ({
        id: `assessment-${standard.id}`,
        assessmentName: `${standard.name} Quarterly Review`,
        standardName: standard.name,
        dueDate: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysOverdue: (index + 1) * 7,
        assignee: getRandomResponsible(),
        priority: index === 0 ? 'critical' : index === 1 ? 'high' : 'medium'
      }));

      // Calculate metrics
      const totalReqs = activeStandards.length * 50; // Assume 50 requirements per standard
      const fulfilled = Math.floor(totalReqs * 0.65);
      const notFulfilled = gaps.filter(g => g.status === 'not-fulfilled').length;
      const notApplicable = gaps.filter(g => g.status === 'not-applicable').length;
      const overdue = gaps.filter(g => g.status === 'overdue').length;

      const metrics: GapMetrics = {
        totalRequirements: totalReqs,
        fulfilledRequirements: fulfilled,
        notFulfilledRequirements: notFulfilled,
        notApplicableRequirements: notApplicable,
        overdueRequirements: overdue,
        complianceScore: Math.round((fulfilled / totalReqs) * 100),
        riskScore: Math.round((notFulfilled + overdue) / totalReqs * 100),
        improvementRate: 2.3,
        timeToCompliance: Math.ceil((notFulfilled + overdue) / 2.3)
      };

      // Generate trends data
      const trends: TrendData[] = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        trends.push({
          date: date.toISOString().split('T')[0],
          complianceScore: Math.max(50, metrics.complianceScore - (i * 0.5) + Math.random() * 5),
          gaps: Math.max(20, gaps.length + (i * 0.3) + Math.random() * 10),
          resolved: Math.floor(Math.random() * 5) + 1,
          new: Math.floor(Math.random() * 3)
        });
      }

      setData({
        selectedStandards: activeStandards.map((s: any) => s.id),
        gaps,
        insights,
        metrics,
        overdueAssessments,
        requirementsByStatus: {
          fulfilled,
          partiallyFulfilled: Math.floor(totalReqs * 0.15),
          notFulfilled,
          notApplicable
        },
        trends
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load gap analysis data:', error);
      toast.error('Failed to load gap analysis data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGapAnalysisData();
    setRefreshing(false);
    toast.success('Gap analysis refreshed');
  };

  const handleStandardChange = (standardId: string) => {
    if (selectedStandards.includes(standardId)) {
      setSelectedStandards(selectedStandards.filter(id => id !== standardId));
    } else {
      setSelectedStandards([...selectedStandards, standardId]);
    }
  };

  const exportReport = () => {
    // Export functionality
    toast.success('Gap analysis report exported');
  };

  // Filter gaps based on search and filters
  const filteredGaps = data?.gaps.filter(gap => {
    const matchesSearch = searchQuery === '' || 
      gap.requirementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gap.requirementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gap.standardName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || gap.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || gap.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  }) || [];

  useEffect(() => {
    loadGapAnalysisData();
  }, [selectedStandards]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load gap analysis data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gap Analysis & Insights" 
          description="Intelligent analysis of compliance gaps and actionable recommendations"
        />
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
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
        </div>
      </div>

      {/* Standards Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Selected Standards
          </CardTitle>
          <CardDescription>
            Choose which standards to include in the gap analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getAvailableStandards().map((standard: any) => (
              <Badge
                key={standard.id}
                variant={selectedStandards.includes(standard.id) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => handleStandardChange(standard.id)}
              >
                <CheckCircle className={cn(
                  "h-3 w-3 mr-1",
                  selectedStandards.includes(standard.id) ? "opacity-100" : "opacity-0"
                )} />
                {standard.name} {standard.version}
              </Badge>
            ))}
          </div>
          {selectedStandards.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              All standards are included when none are selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.complianceScore}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.metrics.complianceScore} className="flex-1" />
              <Badge variant="secondary" className="text-xs">
                +{data.metrics.improvementRate}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.metrics.timeToCompliance} days to full compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.gaps.length}</div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{data.gaps.filter(g => g.priority === 'critical').length} Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>{data.gaps.filter(g => g.priority === 'high').length} High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.metrics.overdueRequirements + data.overdueAssessments.length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>{data.metrics.overdueRequirements} requirements</p>
              <p>{data.overdueAssessments.length} assessments</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.riskScore}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.metrics.riskScore} className="flex-1" />
              <Badge 
                variant={data.metrics.riskScore < 30 ? "default" : data.metrics.riskScore < 60 ? "secondary" : "destructive"} 
                className="text-xs"
              >
                {data.metrics.riskScore < 30 ? 'Low' : data.metrics.riskScore < 60 ? 'Medium' : 'High'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.insights.map((insight) => (
              <div 
                key={insight.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  insight.actionRequired && "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'overdue' && <Clock className="h-4 w-4 text-red-500" />}
                      {insight.type === 'risk' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      {insight.type === 'opportunity' && <Target className="h-4 w-4 text-green-500" />}
                      {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-blue-500" />}
                      <h4 className="font-semibold">{insight.title}</h4>
                      {insight.actionRequired && (
                        <Badge variant="destructive" className="text-xs">Action Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    {insight.suggestedActions && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Suggested Actions:</p>
                        <ul className="space-y-1">
                          {insight.suggestedActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {insight.metrics && (
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold">{insight.metrics.value}</div>
                      <div className="flex items-center gap-1 text-xs">
                        {insight.metrics.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                        {insight.metrics.trend === 'down' && <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />}
                        <span className={cn(
                          insight.metrics.trend === 'up' ? 'text-red-500' : 'text-green-500'
                        )}>
                          {insight.metrics.change}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gaps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Gap Details</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Gap Details Tab */}
        <TabsContent value="gaps" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requirements, codes, or standards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-fulfilled">Not Fulfilled</SelectItem>
                <SelectItem value="not-applicable">Not Applicable</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gap List */}
          <div className="space-y-4">
            {filteredGaps.map((gap) => (
              <Card key={gap.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          gap.priority === 'critical' ? 'destructive' : 
                          gap.priority === 'high' ? 'default' : 
                          'secondary'
                        }>
                          {gap.priority}
                        </Badge>
                        <Badge variant="outline">{gap.requirementCode}</Badge>
                        <Badge variant="outline">{gap.standardName}</Badge>
                        {gap.status === 'overdue' && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {gap.daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{gap.requirementName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{gap.remediation}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{gap.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impact:</span>
                          <p className="font-medium">{gap.impact}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effort:</span>
                          <p className="font-medium">{gap.effort}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Responsible:</span>
                          <p className="font-medium">{gap.responsibleParty}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="ml-4">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Overdue Items Tab */}
        <TabsContent value="overdue" className="space-y-6">
          <div className="grid gap-6">
            {/* Overdue Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Assessments</CardTitle>
                <CardDescription>Assessments that have passed their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.overdueAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          assessment.priority === 'critical' ? 'bg-red-100 text-red-600' :
                          assessment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                          'bg-yellow-100 text-yellow-600'
                        )}>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{assessment.assessmentName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{assessment.standardName}</span>
                            <span>•</span>
                            <span>Assigned to: {assessment.assignee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {assessment.daysOverdue} days overdue
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(assessment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Requirements</CardTitle>
                <CardDescription>Requirements that need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.gaps.filter(g => g.status === 'overdue').map((gap) => (
                    <div key={gap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{gap.requirementName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{gap.requirementCode}</span>
                            <span>•</span>
                            <span>{gap.standardName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {gap.daysOverdue} days overdue
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {gap.responsibleParty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requirements by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ReChartPie>
                    <Pie
                      data={[
                        { name: 'Fulfilled', value: data.requirementsByStatus.fulfilled, color: COLORS.fulfilled },
                        { name: 'Partially Fulfilled', value: data.requirementsByStatus.partiallyFulfilled, color: COLORS.partiallyFulfilled },
                        { name: 'Not Fulfilled', value: data.requirementsByStatus.notFulfilled, color: COLORS.notFulfilled },
                        { name: 'Not Applicable', value: data.requirementsByStatus.notApplicable, color: COLORS.notApplicable }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(data.requirementsByStatus).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </ReChartPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gap Distribution by Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Gap Distribution by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { priority: 'Critical', count: data.gaps.filter(g => g.priority === 'critical').length },
                      { priority: 'High', count: data.gaps.filter(g => g.priority === 'high').length },
                      { priority: 'Medium', count: data.gaps.filter(g => g.priority === 'medium').length },
                      { priority: 'Low', count: data.gaps.filter(g => g.priority === 'low').length }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Progress by Standard */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Progress by Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="10%" 
                  outerRadius="80%"
                  data={getAvailableStandards()
                    .filter((s: any) => data.selectedStandards.includes(s.id))
                    .map((standard: any, index: number) => ({
                      name: standard.name,
                      value: 65 + Math.random() * 30,
                      fill: Object.values(COLORS)[index % Object.values(COLORS).length]
                    }))
                  }
                >
                  <RadialBar minAngle={15} background clockWise dataKey="value" />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Gap Trends</CardTitle>
              <CardDescription>30-day trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="complianceScore" 
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Compliance Score %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gaps" 
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    name="Total Gaps"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke={COLORS.info}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};

// Helper functions
function getRandomRequirementName(standardId: string): string {
  const requirements = {
    'iso-27001': [
      'Information Security Policy',
      'Access Control Management',
      'Asset Management',
      'Physical Security Controls',
      'Incident Response Procedures'
    ],
    'gdpr': [
      'Data Processing Records',
      'Consent Management',
      'Data Subject Rights',
      'Privacy Impact Assessment',
      'Data Breach Notification'
    ],
    'soc2': [
      'Security Monitoring',
      'Change Management',
      'Risk Assessment',
      'Vendor Management',
      'Business Continuity'
    ],
    'nist': [
      'Identify Assets',
      'Protect Access',
      'Detect Anomalies',
      'Respond to Incidents',
      'Recover Operations'
    ],
    'cis': [
      'Inventory of Assets',
      'Software Management',
      'Data Protection',
      'Secure Configuration',
      'Account Management'
    ]
  };
  
  const standardRequirements = requirements[standardId as keyof typeof requirements] || requirements['iso-27001'];
  return standardRequirements[Math.floor(Math.random() * standardRequirements.length)];
}

function getRandomCategory(): string {
  const categories = ['Access Control', 'Data Protection', 'Incident Management', 'Risk Management', 'Physical Security', 'Network Security', 'Application Security'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomPriority(): 'low' | 'medium' | 'high' | 'critical' {
  const priorities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  const weights = [0.2, 0.4, 0.3, 0.1];
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return priorities[i];
  }
  return 'medium';
}

function getRandomResponsible(): string {
  const people = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Wilson'];
  return people[Math.floor(Math.random() * people.length)];
}

function getRandomImpact(): string {
  const impacts = ['Low', 'Medium', 'High', 'Critical'];
  return impacts[Math.floor(Math.random() * impacts.length)];
}

function getRandomEffort(): string {
  const efforts = ['1-2 days', '3-5 days', '1-2 weeks', '2-4 weeks', '1-2 months'];
  return efforts[Math.floor(Math.random() * efforts.length)];
}

function getRandomRemediation(): string {
  const remediations = [
    'Implement additional security controls and update documentation',
    'Review and update existing policies to meet compliance requirements',
    'Conduct security assessment and implement recommended controls',
    'Deploy technical controls and provide staff training',
    'Document current processes and establish monitoring procedures'
  ];
  return remediations[Math.floor(Math.random() * remediations.length)];
}

export default GapAnalysis;