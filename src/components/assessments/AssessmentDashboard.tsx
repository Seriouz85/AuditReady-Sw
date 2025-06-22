import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { 
  Plus, Calendar as CalendarIcon, Filter, Download, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Users, FileText, BarChart3, Settings,
  Activity, Target, Shield, Workflow
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';
import { AssessmentTemplateBuilder } from './AssessmentTemplateBuilder';
import { 
  EnhancedAssessmentService, 
  AssessmentTemplate, 
  AssessmentSchedule,
  EnhancedAssessment 
} from '@/services/assessments/EnhancedAssessmentService';

interface DashboardMetrics {
  totalAssessments: number;
  activeAssessments: number;
  completedAssessments: number;
  avgComplianceScore: number;
  totalFindings: number;
  criticalFindings: number;
  templatesCount: number;
  scheduledAssessments: number;
}

export const AssessmentDashboard: React.FC = () => {
  const { user, organization, isDemo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAssessments: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    avgComplianceScore: 0,
    totalFindings: 0,
    criticalFindings: 0,
    templatesCount: 0,
    scheduledAssessments: 0
  });

  const [assessments, setAssessments] = useState<EnhancedAssessment[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [complianceTrend, setComplianceTrend] = useState<any[]>([]);

  // UI State
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | undefined>();
  const [filterStatus, setFilterStatus] = useState('all');

  const assessmentService = EnhancedAssessmentService.getInstance();

  useEffect(() => {
    if (organization) {
      loadDashboardData();
    }
  }, [organization, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isDemo) {
        // Load demo data
        loadDemoData();
      } else {
        // Load real data
        await Promise.all([
          loadAssessments(),
          loadTemplates(),
          loadSchedules(),
          loadMetrics()
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Demo metrics
    setMetrics({
      totalAssessments: 24,
      activeAssessments: 8,
      completedAssessments: 16,
      avgComplianceScore: 78.5,
      totalFindings: 47,
      criticalFindings: 3,
      templatesCount: 6,
      scheduledAssessments: 4
    });

    // Demo chart data
    setChartData([
      { name: 'SOC 2', completed: 12, active: 3, pending: 2 },
      { name: 'ISO 27001', completed: 8, active: 2, pending: 1 },
      { name: 'NIST', completed: 6, active: 2, pending: 1 },
      { name: 'GDPR', completed: 4, active: 1, pending: 0 }
    ]);

    // Demo compliance trend
    setComplianceTrend([
      { month: 'Jan', score: 72 },
      { month: 'Feb', score: 75 },
      { month: 'Mar', score: 74 },
      { month: 'Apr', score: 77 },
      { month: 'May', score: 79 },
      { month: 'Jun', score: 78.5 }
    ]);

    // Demo templates
    setTemplates([
      {
        id: '1',
        organization_id: organization?.id || 'demo',
        name: 'SOC 2 Type II Assessment',
        description: 'Comprehensive SOC 2 compliance assessment',
        standard_ids: ['soc2'],
        methodology: 'standard',
        risk_scoring_enabled: true,
        sections: [],
        created_by: user?.id || 'demo',
        is_public: false,
        tags: ['security', 'compliance'],
        metadata: {},
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        organization_id: organization?.id || 'demo',
        name: 'ISO 27001 Risk Assessment',
        description: 'Risk-based ISO 27001 assessment template',
        standard_ids: ['iso27001'],
        methodology: 'risk-based',
        risk_scoring_enabled: true,
        sections: [],
        created_by: user?.id || 'demo',
        is_public: true,
        tags: ['iso', 'risk'],
        metadata: {},
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      }
    ]);
  };

  const loadAssessments = async () => {
    // Implementation would load real assessments
    // const data = await assessmentService.getAssessments(organization!.id);
    // setAssessments(data);
  };

  const loadTemplates = async () => {
    if (!organization) return;
    
    const data = await assessmentService.getTemplates(organization.id);
    setTemplates(data);
  };

  const loadSchedules = async () => {
    if (!organization) return;
    
    const data = await assessmentService.getSchedules(organization.id);
    setSchedules(data);
  };

  const loadMetrics = async () => {
    // Implementation would calculate real metrics
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined);
    setShowTemplateBuilder(true);
  };

  const handleEditTemplate = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateBuilder(true);
  };

  const handleTemplateSaved = (template: AssessmentTemplate) => {
    setTemplates(prev => {
      const existing = prev.find(t => t.id === template.id);
      if (existing) {
        return prev.map(t => t.id === template.id ? template : t);
      } else {
        return [...prev, template];
      }
    });
    setShowTemplateBuilder(false);
    setSelectedTemplate(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Activity className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your compliance assessments
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                <p className="text-3xl font-bold">{metrics.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {metrics.activeAssessments} active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Compliance</p>
                <p className="text-3xl font-bold">{metrics.avgComplianceScore}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+2.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Findings</p>
                <p className="text-3xl font-bold">{metrics.totalFindings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {metrics.criticalFindings} Critical
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-3xl font-bold">{metrics.templatesCount}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {metrics.scheduledAssessments} scheduled
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Progress by Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="active" fill="#3b82f6" name="Active" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Templates and Schedules */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      {template.is_public && (
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.methodology.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.standard_ids.length} standards</span>
                    <span>{format(new Date(template.created_at), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent 
                className="flex flex-col items-center justify-center py-8"
                onClick={handleCreateTemplate}
              >
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Create New Template</p>
                <p className="text-xs text-muted-foreground">Start with a blank template</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {schedules.length > 0 ? (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{schedule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {schedule.frequency} • Next run: {format(new Date(schedule.next_run_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No scheduled assessments</p>
                  <p className="text-sm">Create recurring assessments to automate your compliance process</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isDemo && [
                  { action: 'Assessment completed', target: 'SOC 2 Q2 2024', time: '2 hours ago', type: 'completed' },
                  { action: 'Finding created', target: 'Access Control Review', time: '4 hours ago', type: 'finding' },
                  { action: 'Template created', target: 'NIST Assessment Template', time: '1 day ago', type: 'template' },
                  { action: 'Evidence uploaded', target: 'Vulnerability Management', time: '2 days ago', type: 'evidence' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.type)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.target}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Builder Dialog */}
      {showTemplateBuilder && (
        <AssessmentTemplateBuilder
          template={selectedTemplate}
          onSave={handleTemplateSaved}
          onCancel={() => {
            setShowTemplateBuilder(false);
            setSelectedTemplate(undefined);
          }}
          isOpen={showTemplateBuilder}
        />
      )}
    </div>
  );
};