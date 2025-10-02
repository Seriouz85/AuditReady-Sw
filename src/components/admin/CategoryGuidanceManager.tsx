/**
 * Category-Specific Guidance Manager
 * Comprehensive management interface for all 21 compliance categories
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  FileText,
  Zap,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  TrendingDown,
  Activity
} from 'lucide-react';
import { RealTimeGuidanceEditor } from './RealTimeGuidanceEditor';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CategoryMetrics {
  category: string;
  totalGuidance: number;
  publishedGuidance: number;
  draftGuidance: number;
  avgQuality: number;
  userSatisfaction: number;
  lastUpdated: string;
  sourcesUsed: number;
  frameworkCoverage: number;
  completionRate: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  trends: {
    qualityTrend: 'up' | 'down' | 'stable';
    usageTrend: 'up' | 'down' | 'stable';
    updateFrequency: number;
  };
}

interface GuidanceItem {
  id: string;
  category: string;
  title: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  quality: number;
  version: string;
  lastModified: string;
  modifiedBy: string;
  frameworks: string[];
  wordCount: number;
  readingTime: number;
  complexity: 'basic' | 'intermediate' | 'advanced';
  userRating: number;
  views: number;
  downloads: number;
}

interface CategoryTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  structure: string;
  requiredFrameworks: string[];
  estimatedTime: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
}

interface ComplianceRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  frameworks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  hasGuidance: boolean;
  guidanceQuality: number;
}

// Compliance categories with detailed metadata
const COMPLIANCE_CATEGORIES = [
  {
    id: 'access-control',
    name: 'Access Control & Identity Management',
    description: 'User access management, authentication, and authorization controls',
    priority: 'critical',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls', 'GDPR'],
    estimatedGuidanceCount: 8
  },
  {
    id: 'asset-management',
    name: 'Asset Management & Configuration',
    description: 'IT asset inventory, configuration management, and lifecycle controls',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    estimatedGuidanceCount: 6
  },
  {
    id: 'data-protection',
    name: 'Data Protection & Encryption',
    description: 'Data classification, encryption, and protection mechanisms',
    priority: 'critical',
    frameworks: ['GDPR', 'ISO 27001', 'NIST CSF', 'HIPAA'],
    estimatedGuidanceCount: 10
  },
  {
    id: 'network-security',
    name: 'Network Security Controls',
    description: 'Network segmentation, firewalls, and perimeter security',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    estimatedGuidanceCount: 7
  },
  {
    id: 'incident-response',
    name: 'Incident Response & Recovery',
    description: 'Security incident handling, response procedures, and recovery',
    priority: 'critical',
    frameworks: ['ISO 27001', 'NIST CSF', 'NIS2'],
    estimatedGuidanceCount: 9
  },
  {
    id: 'risk-management',
    name: 'Risk Management & Assessment',
    description: 'Risk identification, assessment, and treatment processes',
    priority: 'critical',
    frameworks: ['ISO 27001', 'NIST CSF', 'SOX'],
    estimatedGuidanceCount: 8
  },
  {
    id: 'security-monitoring',
    name: 'Security Monitoring & Logging',
    description: 'Continuous monitoring, logging, and threat detection',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls', 'NIS2'],
    estimatedGuidanceCount: 6
  },
  {
    id: 'compliance-governance',
    name: 'Compliance & Governance',
    description: 'Governance framework, policies, and compliance management',
    priority: 'critical',
    frameworks: ['ISO 27001', 'SOX', 'GDPR'],
    estimatedGuidanceCount: 5
  },
  {
    id: 'business-continuity',
    name: 'Business Continuity Planning',
    description: 'Business continuity, disaster recovery, and resilience planning',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'NIS2'],
    estimatedGuidanceCount: 7
  },
  {
    id: 'physical-security',
    name: 'Physical & Environmental Security',
    description: 'Physical access controls and environmental protection',
    priority: 'medium',
    frameworks: ['ISO 27001', 'SOC 2'],
    estimatedGuidanceCount: 4
  },
  {
    id: 'supplier-management',
    name: 'Supplier & Third-Party Management',
    description: 'Third-party risk management and vendor security assessments',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'NIS2'],
    estimatedGuidanceCount: 6
  },
  {
    id: 'security-training',
    name: 'Security Training & Awareness',
    description: 'Security awareness programs and training requirements',
    priority: 'medium',
    frameworks: ['ISO 27001', 'NIST CSF', 'GDPR'],
    estimatedGuidanceCount: 4
  },
  {
    id: 'vulnerability-management',
    name: 'Vulnerability Management',
    description: 'Vulnerability scanning, assessment, and remediation',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    estimatedGuidanceCount: 6
  },
  {
    id: 'change-management',
    name: 'Change Management & Controls',
    description: 'Change control processes and configuration management',
    priority: 'medium',
    frameworks: ['ISO 27001', 'NIST CSF'],
    estimatedGuidanceCount: 5
  },
  {
    id: 'authentication',
    name: 'Authentication & Authorization',
    description: 'Multi-factor authentication and authorization mechanisms',
    priority: 'critical',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    estimatedGuidanceCount: 7
  },
  {
    id: 'backup-recovery',
    name: 'Backup & Recovery Systems',
    description: 'Data backup, recovery procedures, and testing',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF'],
    estimatedGuidanceCount: 5
  },
  {
    id: 'security-architecture',
    name: 'Security Architecture',
    description: 'Security design principles and architectural controls',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF'],
    estimatedGuidanceCount: 6
  },
  {
    id: 'mobile-device',
    name: 'Mobile Device Management',
    description: 'Mobile device security and management policies',
    priority: 'medium',
    frameworks: ['ISO 27001', 'NIST CSF'],
    estimatedGuidanceCount: 4
  },
  {
    id: 'cloud-security',
    name: 'Cloud Security Controls',
    description: 'Cloud service security and shared responsibility model',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'SOC 2'],
    estimatedGuidanceCount: 8
  },
  {
    id: 'application-security',
    name: 'Application Security',
    description: 'Secure development lifecycle and application security testing',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF'],
    estimatedGuidanceCount: 7
  },
  {
    id: 'cryptographic-controls',
    name: 'Cryptographic Controls',
    description: 'Encryption standards, key management, and cryptographic policies',
    priority: 'high',
    frameworks: ['ISO 27001', 'NIST CSF', 'GDPR'],
    estimatedGuidanceCount: 6
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CategoryGuidanceManager() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'priority' | 'quality' | 'completion' | 'updated'>('priority');
  
  // State management
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [guidanceItems, setGuidanceItems] = useState<GuidanceItem[]>([]);
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showEditor, setShowEditor] = useState(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState<typeof COMPLIANCE_CATEGORIES[0] | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<GuidanceItem | null>(null);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategoryMetrics(),
        loadGuidanceItems(),
        loadTemplates(),
        loadRequirements()
      ]);
    } catch (error) {
      console.error('Failed to load category guidance data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryMetrics = async () => {
    // Mock category metrics with realistic data
    const mockMetrics: CategoryMetrics[] = COMPLIANCE_CATEGORIES.map(category => ({
      category: category.name,
      totalGuidance: Math.floor(Math.random() * category.estimatedGuidanceCount) + 2,
      publishedGuidance: Math.floor(Math.random() * 5) + 1,
      draftGuidance: Math.floor(Math.random() * 3) + 1,
      avgQuality: 0.7 + (Math.random() * 0.3),
      userSatisfaction: 0.75 + (Math.random() * 0.25),
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sourcesUsed: Math.floor(Math.random() * 8) + 2,
      frameworkCoverage: Math.floor(Math.random() * 30) + 70,
      completionRate: Math.floor(Math.random() * 40) + 60,
      priority: category.priority as any,
      trends: {
        qualityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        usageTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        updateFrequency: Math.floor(Math.random() * 30) + 7
      }
    }));

    setCategoryMetrics(mockMetrics);
  };

  const loadGuidanceItems = async () => {
    // Mock guidance items
    const mockGuidance: GuidanceItem[] = [];
    
    COMPLIANCE_CATEGORIES.forEach(category => {
      const itemCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < itemCount; i++) {
        mockGuidance.push({
          id: `guidance_${category.id}_${i}`,
          category: category.name,
          title: `${category.name} - Implementation Guide ${i + 1}`,
          status: ['draft', 'review', 'approved', 'published'][Math.floor(Math.random() * 4)] as any,
          quality: 0.6 + (Math.random() * 0.4),
          version: `1.${Math.floor(Math.random() * 5)}.0`,
          lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          modifiedBy: user?.email || 'System Admin',
          frameworks: category.frameworks.slice(0, Math.floor(Math.random() * 3) + 1),
          wordCount: Math.floor(Math.random() * 800) + 200,
          readingTime: Math.floor(Math.random() * 5) + 2,
          complexity: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
          userRating: 3.5 + (Math.random() * 1.5),
          views: Math.floor(Math.random() * 500) + 50,
          downloads: Math.floor(Math.random() * 100) + 10
        });
      }
    });

    setGuidanceItems(mockGuidance);
  };

  const loadTemplates = async () => {
    // Mock templates
    const mockTemplates: CategoryTemplate[] = COMPLIANCE_CATEGORIES.slice(0, 5).map(category => ({
      id: `template_${category.id}`,
      category: category.name,
      name: `${category.name} - Standard Template`,
      description: `Standard guidance template for ${category.name.toLowerCase()}`,
      structure: `# ${category.name}\n\n## Overview\n\n## Requirements\n\n## Implementation\n\n## Validation`,
      requiredFrameworks: category.frameworks.slice(0, 2),
      estimatedTime: 30 + Math.floor(Math.random() * 60),
      difficulty: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
      tags: ['template', 'standard', category.name?.split(' ')[0]?.toLowerCase() || 'general']
    }));

    setTemplates(mockTemplates);
  };

  const loadRequirements = async () => {
    // Mock requirements
    const mockRequirements: ComplianceRequirement[] = [];
    
    COMPLIANCE_CATEGORIES.forEach(category => {
      const reqCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < reqCount; i++) {
        mockRequirements.push({
          id: `req_${category.id}_${i}`,
          category: category.name,
          title: `${category.name} Requirement ${i + 1}`,
          description: `Key requirement for ${category.name.toLowerCase()}`,
          frameworks: category.frameworks.slice(0, 2),
          priority: category.priority as any,
          hasGuidance: Math.random() > 0.3,
          guidanceQuality: 0.6 + (Math.random() * 0.4)
        });
      }
    });

    setRequirements(mockRequirements);
  };

  // Event handlers
  const handleCreateGuidance = (categoryName?: string) => {
    setSelectedGuidance(null);
    setSelectedCategoryData(COMPLIANCE_CATEGORIES.find(c => c.name === categoryName) || null);
    setShowEditor(true);
  };

  const handleEditGuidance = (guidance: GuidanceItem) => {
    setSelectedGuidance(guidance);
    setShowEditor(true);
  };

  const handleGenerateGuidance = async (categoryName: string) => {
    try {
      toast.info(`Generating AI guidance for ${categoryName}...`);
      
      const result = await RAGGenerationService.generateGuidance(
        {
          letter: 'a',
          title: `${categoryName} Implementation Guide`,
          description: `Comprehensive guidance for ${categoryName}`,
          originalText: `Comprehensive guidance for ${categoryName}`
        },
        categoryName,
        { iso27001: true, nist: true }
      );

      if (result.success) {
        toast.success('AI guidance generated successfully');
        // Create new guidance item
        const newGuidance: GuidanceItem = {
          id: `guidance_${Date.now()}`,
          category: categoryName,
          title: `${categoryName} - AI Generated Guide`,
          status: 'draft',
          quality: result.qualityScore || 0.8,
          version: '1.0.0',
          lastModified: new Date().toISOString(),
          modifiedBy: 'AI Generator',
          frameworks: ['ISO 27001', 'NIST CSF'],
          wordCount: result.content?.split(' ').length || 500,
          readingTime: Math.ceil((result.content?.split(' ').length || 500) / 200),
          complexity: 'intermediate',
          userRating: 0,
          views: 0,
          downloads: 0
        };
        
        setGuidanceItems(prev => [newGuidance, ...prev]);
        await loadCategoryMetrics(); // Refresh metrics
      } else {
        toast.error('Failed to generate AI guidance');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('AI generation failed');
    }
  };

  const handleBulkGenerate = async () => {
    const categoriesToGenerate = COMPLIANCE_CATEGORIES
      .filter(cat => cat.priority === 'critical')
      .slice(0, 3);

    toast.info(`Generating guidance for ${categoriesToGenerate.length} critical categories...`);

    for (const category of categoriesToGenerate) {
      await handleGenerateGuidance(category.name);
      // Add delay between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    toast.success('Bulk guidance generation completed');
  };

  // Filter and sort functions
  const filteredCategories = COMPLIANCE_CATEGORIES
    .filter(category => {
      const matchesSearch = searchQuery === '' || 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = selectedPriority === 'all' || category.priority === selectedPriority;
      
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      const aMetrics = categoryMetrics.find(m => m.category === a.name);
      const bMetrics = categoryMetrics.find(m => m.category === b.name);
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'quality':
          return (bMetrics?.avgQuality || 0) - (aMetrics?.avgQuality || 0);
        case 'completion':
          return (bMetrics?.completionRate || 0) - (aMetrics?.completionRate || 0);
        case 'updated':
          return new Date(bMetrics?.lastUpdated || 0).getTime() - new Date(aMetrics?.lastUpdated || 0).getTime();
        default:
          return 0;
      }
    });

  const filteredGuidance = guidanceItems
    .filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

  // Helper functions
  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={(variants[priority as keyof typeof variants] || 'outline') as "default" | "secondary" | "destructive" | "outline"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      review: 'default',
      approved: 'default',
      published: 'default',
      archived: 'outline'
    };
    return <Badge variant={(variants[status as keyof typeof variants] || 'outline') as "default" | "secondary" | "destructive" | "outline"}>{status}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3">Loading category guidance data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Category Guidance Manager
          </h2>
          <p className="text-gray-600 mt-2">
            Comprehensive management for all 21 compliance categories
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleBulkGenerate}>
            <Zap className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={() => handleCreateGuidance()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Guidance
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{COMPLIANCE_CATEGORIES.length}</div>
            <p className="text-xs text-gray-500">Compliance areas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{guidanceItems.length}</div>
            <p className="text-xs text-gray-500">
              {guidanceItems.filter(g => g.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(categoryMetrics.reduce((sum, m) => sum + m.avgQuality, 0) / categoryMetrics.length * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Across all categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {COMPLIANCE_CATEGORIES.filter(c => c.priority === 'critical').length}
            </div>
            <p className="text-xs text-gray-500">Need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {(categoryMetrics.reduce((sum, m) => sum + m.completionRate, 0) / categoryMetrics.length).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Average completion</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories or guidance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-64">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {COMPLIANCE_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'priority' | 'quality' | 'completion' | 'updated')}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <Tabs defaultValue="categories">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="categories">
            <Target className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="guidance">
            <FileText className="h-4 w-4 mr-2" />
            Guidance Items
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="requirements">
            <Shield className="h-4 w-4 mr-2" />
            Requirements
          </TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const metrics = categoryMetrics.find(m => m.category === category.name);
                const guidanceCount = guidanceItems.filter(g => g.category === category.name).length;
                
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{category.name}</CardTitle>
                          <CardDescription className="mt-1">{category.description}</CardDescription>
                        </div>
                        {getPriorityBadge(category.priority)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Guidance Items</span>
                          <div className="font-semibold">{guidanceCount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Quality Score</span>
                          <div className={`font-semibold ${getQualityColor(metrics?.avgQuality || 0)}`}>
                            {((metrics?.avgQuality || 0) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-semibold">{metrics?.completionRate || 0}%</span>
                        </div>
                        <Progress value={metrics?.completionRate || 0} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {category.frameworks.slice(0, 3).map(framework => (
                          <Badge key={framework} variant="outline" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                        {category.frameworks.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.frameworks.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(metrics?.trends.qualityTrend || 'stable')}
                          <span className="text-xs text-gray-600">Quality trend</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoryData(category);
                              setShowCategoryDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreateGuidance(category.name)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateGuidance(category.name)}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Guidance</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Frameworks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const metrics = categoryMetrics.find(m => m.category === category.name);
                      const guidanceCount = guidanceItems.filter(g => g.category === category.name).length;
                      
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-600">{category.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(category.priority)}</TableCell>
                          <TableCell className="text-center">{guidanceCount}</TableCell>
                          <TableCell>
                            <div className={`font-semibold ${getQualityColor(metrics?.avgQuality || 0)}`}>
                              {((metrics?.avgQuality || 0) * 100).toFixed(0)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={metrics?.completionRate || 0} className="w-16 h-2" />
                              <span className="text-sm">{metrics?.completionRate || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {category.frameworks.slice(0, 2).map(fw => (
                                <Badge key={fw} variant="outline" className="text-xs">
                                  {fw}
                                </Badge>
                              ))}
                              {category.frameworks.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{category.frameworks.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCategoryData(category);
                                  setShowCategoryDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateGuidance(category.name)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerateGuidance(category.name)}
                              >
                                <Zap className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Guidance Items Tab */}
        <TabsContent value="guidance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Guidance Items</CardTitle>
                  <CardDescription>
                    All guidance content across categories
                  </CardDescription>
                </div>
                <Button onClick={() => handleCreateGuidance()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Guidance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuidance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">
                            {item.wordCount} words • {item.readingTime} min read
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.category}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.quality * 100} className="w-16 h-2" />
                          <span className={`text-sm font-semibold ${getQualityColor(item.quality)}`}>
                            {(item.quality * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.views} views</div>
                          <div className="text-gray-600">{item.downloads} downloads</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.lastModified).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGuidance(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(item.id);
                              toast.success('ID copied to clipboard');
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
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
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryMetrics.slice(0, 5).map((metrics) => (
                    <div key={metrics.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metrics.category}</span>
                        <span className="text-sm">{(metrics.avgQuality * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={metrics.avgQuality * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryMetrics
                    .filter(m => m.trends.qualityTrend !== 'stable')
                    .slice(0, 5)
                    .map((metrics) => (
                      <div key={metrics.category} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(metrics.trends.qualityTrend)}
                          <span className="text-sm font-medium">{metrics.category}</span>
                        </div>
                        <span className="text-sm">{(metrics.avgQuality * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements Coverage</CardTitle>
              <CardDescription>
                Track guidance coverage for compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Has Guidance</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Frameworks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.slice(0, 10).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{req.title}</div>
                          <div className="text-sm text-gray-600">{req.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{req.category}</TableCell>
                      <TableCell>{getPriorityBadge(req.priority)}</TableCell>
                      <TableCell>
                        {req.hasGuidance ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {req.hasGuidance ? (
                          <span className={getQualityColor(req.guidanceQuality)}>
                            {(req.guidanceQuality * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {req.frameworks.map(fw => (
                            <Badge key={fw} variant="outline" className="text-xs">
                              {fw}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateGuidance(req.category)}
                        >
                          {req.hasGuidance ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0">
          <RealTimeGuidanceEditor
            category={selectedCategoryData?.name}
            onSave={(guidance) => {
              // Update guidance items
              setGuidanceItems(prev => {
                const existing = prev.find(g => g.id === guidance.id);
                if (existing) {
                  return prev.map(g => g.id === guidance.id ? {
                    ...g,
                    title: guidance.title,
                    content: guidance.content,
                    status: guidance.status,
                    quality: guidance.quality,
                    lastModified: guidance.lastModified
                  } : g);
                } else {
                  return [...prev, {
                    id: guidance.id,
                    category: guidance.category,
                    title: guidance.title,
                    status: guidance.status,
                    quality: guidance.quality,
                    version: guidance.version,
                    lastModified: guidance.lastModified,
                    modifiedBy: guidance.modifiedBy,
                    frameworks: guidance.frameworks,
                    wordCount: guidance.metadata.wordCount,
                    readingTime: guidance.metadata.readingTime,
                    complexity: guidance.metadata.complexity,
                    userRating: 0,
                    views: 0,
                    downloads: 0
                  }];
                }
              });
              
              setShowEditor(false);
              toast.success('Guidance saved successfully');
            }}
            onClose={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Category Details Dialog */}
      <Dialog open={showCategoryDetails} onOpenChange={setShowCategoryDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              Comprehensive information for {selectedCategoryData?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategoryData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedCategoryData.name}</div>
                    <div><strong>Description:</strong> {selectedCategoryData.description}</div>
                    <div><strong>Priority:</strong> {getPriorityBadge(selectedCategoryData.priority)}</div>
                    <div><strong>Est. Guidance:</strong> {selectedCategoryData.estimatedGuidanceCount}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Metrics</h3>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const metrics = categoryMetrics.find(m => m.category === selectedCategoryData.name);
                      const guidanceCount = guidanceItems.filter(g => g.category === selectedCategoryData.name).length;
                      return (
                        <>
                          <div><strong>Current Guidance:</strong> {guidanceCount}</div>
                          <div><strong>Quality Score:</strong> {((metrics?.avgQuality || 0) * 100).toFixed(0)}%</div>
                          <div><strong>Completion:</strong> {metrics?.completionRate || 0}%</div>
                          <div><strong>User Satisfaction:</strong> {((metrics?.userSatisfaction || 0) * 100).toFixed(0)}%</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Applicable Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryData.frameworks.map(framework => (
                    <Badge key={framework} variant="outline">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Current Guidance Items</h3>
                <div className="space-y-2">
                  {guidanceItems
                    .filter(g => g.category === selectedCategoryData.name)
                    .map(guidance => (
                      <div key={guidance.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{guidance.title}</div>
                          <div className="text-sm text-gray-600">
                            {guidance.wordCount} words • {getStatusBadge(guidance.status)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditGuidance(guidance);
                            setShowCategoryDetails(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  
                  {guidanceItems.filter(g => g.category === selectedCategoryData.name).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No guidance items yet for this category.</p>
                      <Button
                        className="mt-3"
                        onClick={() => {
                          handleCreateGuidance(selectedCategoryData.name);
                          setShowCategoryDetails(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Guidance
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}