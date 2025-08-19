import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Plus,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  Database,
  Settings,
  FileText,
  BookOpen,
  Activity,
  Users,
  Award,
  AlertCircle,
  ChevronRight,
  Calendar,
  MessageSquare,
  Lightbulb,
  Shield,
  Server
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AITemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  frameworks: string[];
  qualityScore: number;
  lastUpdated: string;
  createdBy: string;
  usageCount: number;
  avgRating: number;
  status: 'active' | 'draft' | 'archived';
  contentSections: {
    foundation?: string;
    implementation?: string;
    tools?: string;
    evidence?: string;
  };
  tags: string[];
  metadata: {
    tokensUsed?: number;
    generationTime?: number;
    aiModel?: string;
    version: string;
  };
}

interface UsageAnalytics {
  totalRequests: number;
  cacheHitRate: number;
  averageQuality: number;
  totalCost: number;
  dailyUsage: { date: string; requests: number; cost: number }[];
  topCategories: { category: string; usage: number; quality: number }[];
  performanceMetrics: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
  };
}

interface QualityMetrics {
  overallScore: number;
  categories: {
    category: string;
    score: number;
    count: number;
    trends: 'up' | 'down' | 'stable';
  }[];
  improvements: {
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }[];
}

interface CacheMetrics {
  hitRate: number;
  totalEntries: number;
  memoryUsage: string;
  oldestEntry: string;
  newestEntry: string;
  performanceGains: {
    avgCacheResponse: number;
    avgGenerationResponse: number;
    costSavings: number;
  };
}

interface MigrationStatus {
  totalTemplates: number;
  migrated: number;
  failed: number;
  pending: number;
  lastMigration: string;
  errors: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIContentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data for templates
      const mockTemplates: AITemplate[] = [
        {
          id: 'tmpl-1',
          category: 'access_control',
          title: 'Multi-Factor Authentication Implementation',
          content: 'Comprehensive guidance for implementing multi-factor authentication...',
          frameworks: ['ISO 27001', 'NIST', 'CIS Controls'],
          qualityScore: 94,
          lastUpdated: '2025-01-14T10:30:00Z',
          createdBy: 'AI Generator',
          usageCount: 245,
          avgRating: 4.8,
          status: 'active',
          contentSections: {
            foundation: 'MFA fundamentals and risk assessment...',
            implementation: 'Step-by-step deployment guide...',
            tools: 'Recommended MFA solutions and tools...',
            evidence: 'Compliance evidence collection...'
          },
          tags: ['authentication', 'security', 'compliance', 'iso-27001'],
          metadata: {
            tokensUsed: 3420,
            generationTime: 2.4,
            aiModel: 'gemini-1.5-pro',
            version: '1.2.0'
          }
        },
        {
          id: 'tmpl-2',
          category: 'data_protection',
          title: 'Data Classification and Labeling',
          content: 'Enterprise data classification framework implementation...',
          frameworks: ['GDPR', 'ISO 27001', 'NIST'],
          qualityScore: 91,
          lastUpdated: '2025-01-13T15:45:00Z',
          createdBy: 'AI Generator',
          usageCount: 189,
          avgRating: 4.6,
          status: 'active',
          contentSections: {
            foundation: 'Data classification principles and taxonomy...',
            implementation: 'Classification workflow and automation...',
            tools: 'Classification tools and Azure Purview integration...',
            evidence: 'Compliance documentation templates...'
          },
          tags: ['data-protection', 'classification', 'gdpr', 'privacy'],
          metadata: {
            tokensUsed: 4120,
            generationTime: 3.1,
            aiModel: 'gemini-1.5-pro',
            version: '1.1.0'
          }
        },
        {
          id: 'tmpl-3',
          category: 'incident_response',
          title: 'Cybersecurity Incident Response Plan',
          content: 'Comprehensive incident response framework and playbooks...',
          frameworks: ['NIST', 'ISO 27035', 'CIS Controls'],
          qualityScore: 96,
          lastUpdated: '2025-01-12T09:20:00Z',
          createdBy: 'AI Generator',
          usageCount: 156,
          avgRating: 4.9,
          status: 'active',
          contentSections: {
            foundation: 'Incident response lifecycle and team structure...',
            implementation: 'Response procedures and communication plans...',
            tools: 'SOAR platforms and forensic tools...',
            evidence: 'Incident documentation and lessons learned...'
          },
          tags: ['incident-response', 'security', 'nist', 'playbooks'],
          metadata: {
            tokensUsed: 5240,
            generationTime: 4.2,
            aiModel: 'gemini-1.5-pro',
            version: '1.3.0'
          }
        }
      ];
      setTemplates(mockTemplates);

      // Mock analytics data
      const mockAnalytics: UsageAnalytics = {
        totalRequests: 12450,
        cacheHitRate: 73.2,
        averageQuality: 92.4,
        totalCost: 1247.83,
        dailyUsage: [
          { date: '2025-01-14', requests: 245, cost: 24.50 },
          { date: '2025-01-13', requests: 189, cost: 18.90 },
          { date: '2025-01-12', requests: 234, cost: 23.40 },
          { date: '2025-01-11', requests: 198, cost: 19.80 },
          { date: '2025-01-10', requests: 267, cost: 26.70 },
        ],
        topCategories: [
          { category: 'Access Control', usage: 3240, quality: 93.2 },
          { category: 'Data Protection', usage: 2890, quality: 91.8 },
          { category: 'Incident Response', usage: 2156, quality: 95.1 },
          { category: 'Risk Management', usage: 1890, quality: 89.7 },
          { category: 'Network Security', usage: 1564, quality: 92.3 }
        ],
        performanceMetrics: {
          avgResponseTime: 2.4,
          successRate: 98.7,
          errorRate: 1.3
        }
      };
      setAnalytics(mockAnalytics);

      // Mock quality metrics
      const mockQualityMetrics: QualityMetrics = {
        overallScore: 92.4,
        categories: [
          { category: 'Access Control', score: 93.2, count: 45, trends: 'up' },
          { category: 'Data Protection', score: 91.8, count: 38, trends: 'stable' },
          { category: 'Incident Response', score: 95.1, count: 32, trends: 'up' },
          { category: 'Risk Management', score: 89.7, count: 29, trends: 'down' }
        ],
        improvements: [
          {
            category: 'Risk Management',
            suggestion: 'Enhance quantitative risk assessment examples',
            priority: 'high',
            impact: 'Could improve quality score by 5-7 points'
          },
          {
            category: 'Network Security',
            suggestion: 'Add more zero-trust architecture guidance',
            priority: 'medium',
            impact: 'Increase framework coverage completeness'
          }
        ]
      };
      setQualityMetrics(mockQualityMetrics);

      // Mock cache metrics
      const mockCacheMetrics: CacheMetrics = {
        hitRate: 73.2,
        totalEntries: 1247,
        memoryUsage: '128.5 MB',
        oldestEntry: '2025-01-01T00:00:00Z',
        newestEntry: '2025-01-14T14:30:00Z',
        performanceGains: {
          avgCacheResponse: 0.3,
          avgGenerationResponse: 3.2,
          costSavings: 892.45
        }
      };
      setCacheMetrics(mockCacheMetrics);

      // Mock migration status
      const mockMigrationStatus: MigrationStatus = {
        totalTemplates: 156,
        migrated: 142,
        failed: 3,
        pending: 11,
        lastMigration: '2025-01-14T08:30:00Z',
        errors: [
          'Template ID tmpl-legacy-23: Invalid framework mapping',
          'Template ID tmpl-legacy-67: Content parsing error',
          'Template ID tmpl-legacy-89: Missing required metadata'
        ]
      };
      setMigrationStatus(mockMigrationStatus);

    } catch (error) {
      console.error('Error loading AI content management data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI content management data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Action handlers
  const handleEditTemplate = useCallback((template: AITemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  }, []);

  const handleSaveTemplate = useCallback(async (template: AITemplate) => {
    // Mock save operation
    setTemplates(prev => 
      prev.map(t => t.id === template.id ? template : t)
    );
    setEditDialogOpen(false);
    toast({
      title: 'Template Updated',
      description: 'AI template has been successfully updated'
    });
  }, [toast]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: 'Template Deleted',
      description: 'AI template has been removed'
    });
  }, [toast]);

  const handleClearCache = useCallback(async () => {
    // Mock cache clear operation
    setCacheMetrics(prev => prev ? {
      ...prev,
      totalEntries: 0,
      memoryUsage: '0 MB',
      hitRate: 0
    } : null);
    toast({
      title: 'Cache Cleared',
      description: 'AI content cache has been cleared successfully'
    });
  }, [toast]);

  const handleMigrateLegacyContent = useCallback(async () => {
    // Mock migration operation
    setMigrationDialogOpen(false);
    toast({
      title: 'Migration Started',
      description: 'Legacy content migration has been initiated'
    });
  }, [toast]);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [loadAdminData]);

  // Access control
  const isPlatformAdmin = user?.email === 'platform@auditready.com' || import.meta.env.MODE === 'development';
  
  if (!isPlatformAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">This area is reserved for platform administrators only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">AI Content Management</h2>
            <p className="text-gray-600">
              Manage AI-powered unified guidance templates and analytics
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setMigrationDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Migrate Legacy
          </Button>
          <Button variant="outline" onClick={loadAdminData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                {templates.filter(t => t.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">Performance optimization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.averageQuality}</div>
              <p className="text-xs text-muted-foreground">Average across all content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">AI generation costs</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          <TabsTrigger value="quality">Quality Dashboard</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="migration">Content Migration</TabsTrigger>
        </TabsList>

        {/* Template Library Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Library</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Frameworks</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-gray-600">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="mr-1 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {template.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {template.frameworks.slice(0, 2).join(', ')}
                          {template.frameworks.length > 2 && (
                            <span className="text-gray-500">+{template.frameworks.length - 2} more</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={template.qualityScore} className="w-16 h-2" />
                          <span className="text-sm font-medium">{template.qualityScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{template.usageCount} requests</div>
                          <div className="text-gray-500">★ {template.avgRating}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            template.status === 'active' ? 'default' :
                            template.status === 'draft' ? 'secondary' : 'outline'
                          }
                        >
                          {template.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(template.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Usage Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Requests</span>
                      <span className="font-mono text-lg">{analytics.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <span className="font-mono text-green-600">{analytics.performanceMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-mono">{analytics.performanceMetrics.avgResponseTime}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Error Rate</span>
                      <span className="font-mono text-red-600">{analytics.performanceMetrics.errorRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Top Categories</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topCategories.map((category) => (
                        <div key={category.category} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{category.usage}</span>
                              <Badge variant="outline">Q{category.quality}</Badge>
                            </div>
                          </div>
                          <Progress value={(category.usage / analytics.topCategories[0].usage) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Cost Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {analytics.dailyUsage.map((day) => (
                      <div key={day.date} className="p-3 border rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-lg font-bold">{day.requests}</div>
                        <div className="text-sm text-green-600">${day.cost}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Quality Dashboard Tab */}
        <TabsContent value="quality" className="space-y-4">
          {qualityMetrics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Quality Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {qualityMetrics.overallScore}
                      </div>
                      <div className="text-sm text-gray-600">Overall Quality Score</div>
                      <Progress value={qualityMetrics.overallScore} className="mt-3" />
                    </div>
                    
                    <div className="space-y-3">
                      {qualityMetrics.categories.map((category) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{category.category}</span>
                            <Badge variant="outline" className="text-xs">
                              {category.count} templates
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{category.score}</span>
                            {category.trends === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                            {category.trends === 'down' && <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />}
                            {category.trends === 'stable' && <div className="w-3 h-0.5 bg-gray-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Improvement Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {qualityMetrics.improvements.map((improvement, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">{improvement.category}</div>
                          <Badge 
                            variant={
                              improvement.priority === 'high' ? 'destructive' :
                              improvement.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {improvement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{improvement.suggestion}</p>
                        <p className="text-xs text-blue-600">{improvement.impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Cache Management Tab */}
        <TabsContent value="cache" className="space-y-4">
          {cacheMetrics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Cache Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {cacheMetrics.hitRate}%
                      </div>
                      <div className="text-sm text-gray-600">Cache Hit Rate</div>
                      <Progress value={cacheMetrics.hitRate} className="mt-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{cacheMetrics.totalEntries}</div>
                        <div className="text-xs text-gray-600">Total Entries</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{cacheMetrics.memoryUsage}</div>
                        <div className="text-xs text-gray-600">Memory Usage</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Performance Gains</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Cache Response</span>
                      <span className="font-mono text-green-600">
                        {cacheMetrics.performanceGains.avgCacheResponse}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Generation Response</span>
                      <span className="font-mono text-orange-600">
                        {cacheMetrics.performanceGains.avgGenerationResponse}s
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Cost Savings</span>
                      <span className="font-mono text-blue-600">
                        ${cacheMetrics.performanceGains.costSavings}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleClearCache}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Oldest Entry</Label>
                      <div className="font-mono">
                        {new Date(cacheMetrics.oldestEntry).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Newest Entry</Label>
                      <div className="font-mono">
                        {new Date(cacheMetrics.newestEntry).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Content Migration Tab */}
        <TabsContent value="migration" className="space-y-4">
          {migrationStatus && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Migration Status</span>
                  </CardTitle>
                  <CardDescription>
                    Status of legacy EnhancedUnifiedGuidanceService content migration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {migrationStatus.totalTemplates}
                      </div>
                      <div className="text-sm text-gray-600">Total Templates</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {migrationStatus.migrated}
                      </div>
                      <div className="text-sm text-gray-600">Migrated</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {migrationStatus.pending}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {migrationStatus.failed}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Migration Progress</span>
                      <span className="text-sm text-gray-600">
                        {Math.round((migrationStatus.migrated / migrationStatus.totalTemplates) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(migrationStatus.migrated / migrationStatus.totalTemplates) * 100} 
                      className="h-2"
                    />
                  </div>

                  {migrationStatus.errors.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">Migration Errors ({migrationStatus.errors.length})</div>
                        <div className="space-y-1 text-sm">
                          {migrationStatus.errors.slice(0, 3).map((error, index) => (
                            <div key={index} className="text-red-600">• {error}</div>
                          ))}
                          {migrationStatus.errors.length > 3 && (
                            <div className="text-gray-600">... and {migrationStatus.errors.length - 3} more</div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Button onClick={() => setMigrationDialogOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Start Migration
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AI Template</DialogTitle>
            <DialogDescription>
              Modify the AI-generated template content and metadata
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-title">Title</Label>
                  <Input 
                    id="template-title"
                    value={selectedTemplate.title}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      title: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Input 
                    id="template-category"
                    value={selectedTemplate.category}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      category: e.target.value
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-content">Content</Label>
                <Textarea 
                  id="template-content"
                  value={selectedTemplate.content}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    content: e.target.value
                  })}
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frameworks</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.frameworks.map(framework => (
                      <Badge key={framework} variant="outline">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Quality Score</Label>
                  <div className="mt-2">
                    <Progress value={selectedTemplate.qualityScore} />
                    <span className="text-sm text-gray-600 mt-1">
                      {selectedTemplate.qualityScore}/100
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Usage Count</Label>
                  <div className="text-2xl font-bold mt-2">
                    {selectedTemplate.usageCount}
                  </div>
                </div>
                <div>
                  <Label>Average Rating</Label>
                  <div className="text-2xl font-bold mt-2">
                    ★ {selectedTemplate.avgRating}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedTemplate && handleSaveTemplate(selectedTemplate)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migration Dialog */}
      <Dialog open={migrationDialogOpen} onOpenChange={setMigrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrate Legacy Content</DialogTitle>
            <DialogDescription>
              Migrate content from EnhancedUnifiedGuidanceService to the new AI-powered system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will migrate all legacy templates to the new AI-powered template system.
                Existing templates will be analyzed and enhanced with AI-generated improvements.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Migration Options</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Enhance content quality with AI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Update framework mappings</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Generate missing metadata</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMigrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMigrateLegacyContent}>
              Start Migration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}