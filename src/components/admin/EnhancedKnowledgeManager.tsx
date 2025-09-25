/**
 * Enhanced Knowledge Manager - Advanced RAG System Management
 * Real-time guidance management, content approval, and category-specific controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Brain,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
  Zap,
  Settings,
  BarChart3,
  Target,
  Users,
  Calendar,
  MessageSquare,
  Shield,
  Database,
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  ChevronRight,
  Server,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService, type KnowledgeSource } from '@/services/rag/KnowledgeIngestionService';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';
import { RequirementValidationService } from '@/services/rag/RequirementValidationService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface EnhancedKnowledgeSource extends Omit<KnowledgeSource, 'id'> {
  id: string; // Required id, not optional
  status: 'active' | 'inactive' | 'pending' | 'error' | 'reviewing' | 'approved' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  lastScraped?: string;
  errorCount: number;
  lastError?: string;
  successRate: number;
  contentChunks: number;
  qualityScore: number;
  reviewNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  metadata: {
    scrapingConfig?: any;
    processingRules?: any;
    validationResults?: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface GuidancePreview {
  category: string;
  content: string;
  quality: number;
  sources: string[];
  frameworks: string[];
  lastGenerated: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
  version: string;
  approvalWorkflow: {
    submittedAt?: string;
    reviewedAt?: string;
    approvedAt?: string;
    reviewedBy?: string;
    approvedBy?: string;
    comments?: string[];
  };
}

interface CategoryStats {
  category: string;
  totalGuidance: number;
  approvedGuidance: number;
  avgQuality: number;
  lastUpdated: string;
  sourcesUsed: number;
  userSatisfaction: number;
}

interface ApprovalWorkflowItem {
  id: string;
  type: 'source' | 'guidance' | 'content';
  title: string;
  category: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  metadata: any;
}

interface ValidationResult {
  score: number;
  checks: {
    name: string;
    passed: boolean;
    score: number;
    details: string;
  }[];
  recommendations: string[];
  confidence: number;
}

// Compliance categories
const COMPLIANCE_CATEGORIES = [
  'Access Control & Identity Management',
  'Asset Management & Configuration',
  'Data Protection & Encryption',
  'Network Security Controls',
  'Incident Response & Recovery',
  'Risk Management & Assessment',
  'Security Monitoring & Logging',
  'Compliance & Governance',
  'Business Continuity Planning',
  'Physical & Environmental Security',
  'Supplier & Third-Party Management',
  'Security Training & Awareness',
  'Vulnerability Management',
  'Change Management & Controls',
  'Authentication & Authorization',
  'Backup & Recovery Systems',
  'Security Architecture',
  'Mobile Device Management',
  'Cloud Security Controls',
  'Application Security',
  'Cryptographic Controls'
];

const CONTENT_TYPES = [
  'guidance',
  'standards',
  'bestpractice',
  'implementation',
  'regulatory'
];

const FRAMEWORKS = [
  'iso27001',
  'iso27002',
  'nist',
  'cis',
  'gdpr',
  'nis2',
  'sox',
  'pci-dss',
  'hipaa'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedKnowledgeManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sources');
  
  // State management
  const [sources, setSources] = useState<EnhancedKnowledgeSource[]>([]);
  const [guidancePreviews, setGuidancePreviews] = useState<GuidancePreview[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalWorkflowItem[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<EnhancedKnowledgeSource | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<GuidancePreview | null>(null);
  
  // Dialog states
  const [showAddSource, setShowAddSource] = useState(false);
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  const [showGuidancePreview, setShowGuidancePreview] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  
  // Form states
  const [newSource, setNewSource] = useState<Partial<KnowledgeSource>>({
    contentType: 'guidance',
    authorityScore: 5,
    credibilityRating: 'pending',
    complianceFrameworks: [],
    focusAreas: []
  });
  
  // Real-time updates
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load initial data
  useEffect(() => {
    loadAllData();
    
    if (realTimeUpdates) {
      intervalRef.current = setInterval(loadAllData, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTimeUpdates]);
  
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSources(),
        loadGuidancePreviews(),
        loadCategoryStats(),
        loadApprovalQueue()
      ]);
    } catch (error) {
      console.error('Failed to load knowledge manager data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadSources = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select(`
          *,
          knowledge_content(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const enhancedSources: EnhancedKnowledgeSource[] = (data || []).map(source => ({
        ...source,
        approvalStatus: source.status === 'active' ? 'approved' : 'pending',
        contentChunks: Array.isArray(source.knowledge_content) ? source.knowledge_content.length : 0,
        qualityScore: 0.85, // Mock quality score
        metadata: source.metadata || {}
      }));
      
      setSources(enhancedSources);
    } catch (error) {
      console.error('Failed to load sources:', error);
    }
  };
  
  const loadGuidancePreviews = async () => {
    // Mock guidance previews data
    const mockGuidance: GuidancePreview[] = COMPLIANCE_CATEGORIES.map((category, index) => ({
      category,
      content: `Comprehensive ${category.toLowerCase()} guidance with implementation steps, best practices, and compliance requirements...`,
      quality: 0.85 + (Math.random() * 0.15),
      sources: ['nist.gov', 'iso27001security.com', 'cisecurity.org'].slice(0, Math.floor(Math.random() * 3) + 1),
      frameworks: FRAMEWORKS.slice(0, Math.floor(Math.random() * 4) + 2),
      lastGenerated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['draft', 'approved', 'published'][Math.floor(Math.random() * 3)] as any,
      version: `1.${Math.floor(Math.random() * 5) + 1}.0`,
      approvalWorkflow: {
        submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        comments: ['Comprehensive content', 'Good framework coverage', 'Needs minor updates']
      }
    }));
    
    setGuidancePreviews(mockGuidance);
  };
  
  const loadCategoryStats = async () => {
    // Mock category statistics
    const mockStats: CategoryStats[] = COMPLIANCE_CATEGORIES.map(category => ({
      category,
      totalGuidance: Math.floor(Math.random() * 10) + 5,
      approvedGuidance: Math.floor(Math.random() * 8) + 3,
      avgQuality: 0.8 + (Math.random() * 0.2),
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      sourcesUsed: Math.floor(Math.random() * 5) + 2,
      userSatisfaction: 0.75 + (Math.random() * 0.25)
    }));
    
    setCategoryStats(mockStats);
  };
  
  const loadApprovalQueue = async () => {
    // Mock approval queue data
    const mockQueue: ApprovalWorkflowItem[] = [
      {
        id: '1',
        type: 'source',
        title: 'NIST Cybersecurity Guidelines',
        category: 'Risk Management & Assessment',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        submittedBy: 'admin@company.com',
        status: 'pending',
        priority: 'high',
        content: 'New NIST cybersecurity guidelines source for risk management',
        metadata: { url: 'https://nist.gov/cybersecurity' }
      },
      {
        id: '2',
        type: 'guidance',
        title: 'Enhanced Access Control Implementation',
        category: 'Access Control & Identity Management',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        submittedBy: 'content.ai@system.com',
        status: 'in_review',
        priority: 'medium',
        content: 'AI-generated comprehensive access control guidance with new implementation strategies',
        metadata: { version: '2.1.0', frameworks: ['iso27001', 'nist'] }
      }
    ];
    
    setApprovalQueue(mockQueue);
  };
  
  // Action handlers
  const handleAddSource = async () => {
    if (!newSource.url || !newSource.domain) {
      toast.error('URL and domain are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate source first
      const validationResult = await RequirementValidationService.validateSource({
        url: newSource.url,
        domain: newSource.domain,
        contentType: newSource.contentType || 'guidance'
      });
      
      if (validationResult.score < 0.6) {
        toast.error('Source validation failed. Please check URL and content quality.');
        return;
      }
      
      // Add to database with pending approval status
      const { data, error } = await supabase
        .from('knowledge_sources')
        .insert({
          url: newSource.url,
          domain: newSource.domain,
          title: newSource.title || `Knowledge from ${newSource.domain}`,
          description: newSource.description,
          content_type: newSource.contentType,
          compliance_frameworks: newSource.complianceFrameworks || [],
          focus_areas: newSource.focusAreas || [],
          authority_score: newSource.authorityScore,
          credibility_rating: newSource.credibilityRating,
          status: 'pending' // Start in pending status for approval
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Source added and queued for approval');
      setShowAddSource(false);
      resetNewSourceForm();
      await loadAllData();
      
      // Add to approval queue
      const approvalItem: ApprovalWorkflowItem = {
        id: data.id,
        type: 'source',
        title: data.title,
        category: newSource.focusAreas?.[0] || 'General',
        submittedAt: new Date().toISOString(),
        submittedBy: user?.email || 'unknown',
        status: 'pending',
        priority: 'medium',
        content: `New knowledge source: ${data.url}`,
        metadata: { url: data.url, validation: validationResult }
      };
      
      setApprovalQueue(prev => [approvalItem, ...prev]);
      
    } catch (error) {
      console.error('Failed to add source:', error);
      toast.error('Failed to add source');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveSource = async (sourceId: string, approved: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_sources')
        .update({
          status: approved ? 'active' : 'rejected',
          metadata: {
            approvalNotes: notes,
            approvedBy: user?.email,
            approvedAt: new Date().toISOString()
          }
        })
        .eq('id', sourceId);
      
      if (error) throw error;
      
      toast.success(`Source ${approved ? 'approved' : 'rejected'} successfully`);
      await loadAllData();
      
      // Start ingestion if approved
      if (approved) {
        const source = sources.find(s => s.id === sourceId);
        if (source) {
          handleStartIngestion(source);
        }
      }
      
    } catch (error) {
      console.error('Failed to update source approval:', error);
      toast.error('Failed to update source');
    }
  };
  
  const handleStartIngestion = async (source: EnhancedKnowledgeSource) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const result = await KnowledgeIngestionService.ingestFromURL(source.url, {
        title: source.title,
        description: source.description,
        contentType: source.contentType,
        complianceFrameworks: source.complianceFrameworks,
        focusAreas: source.focusAreas,
        authorityScore: source.authorityScore,
        credibilityRating: source.credibilityRating
      });
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (result.success) {
        toast.success(`Ingestion completed: ${result.chunksCreated} content chunks created`);
      } else {
        toast.error(`Ingestion failed: ${result.errors.join(', ')}`);
      }
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 2000);
      
      await loadAllData();
      
    } catch (error) {
      console.error('Failed to start ingestion:', error);
      toast.error('Failed to start ingestion');
      setIsGenerating(false);
    }
  };
  
  const handleGenerateGuidance = async (category: string) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 200);
      
      const result = await RAGGenerationService.generateGuidance(
        {
          letter: 'a',
          title: `${category} Implementation`,
          description: `Comprehensive ${category} guidance`,
          originalText: `Comprehensive ${category} guidance`
        },
        category,
        { iso27001: true, nist: true }
      );
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (result.success && result.content) {
        // Add to guidance previews
        const newGuidance: GuidancePreview = {
          category,
          content: result.content,
          quality: result.qualityScore || 0.85,
          sources: result.sourcesUsed || [],
          frameworks: FRAMEWORKS.slice(0, 3),
          lastGenerated: new Date().toISOString(),
          status: 'draft',
          version: '1.0.0',
          approvalWorkflow: {
            submittedAt: new Date().toISOString(),
            comments: ['AI-generated content', 'Needs review']
          }
        };
        
        setGuidancePreviews(prev => {
          const filtered = prev.filter(g => g.category !== category);
          return [newGuidance, ...filtered];
        });
        
        toast.success('Guidance generated successfully');
      } else {
        toast.error('Failed to generate guidance');
      }
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to generate guidance:', error);
      toast.error('Failed to generate guidance');
      setIsGenerating(false);
    }
  };
  
  const handleValidateContent = async (content: string, type: 'source' | 'guidance') => {
    try {
      const validation = await RequirementValidationService.validateContent(content, type);
      setValidationResults(validation);
      setShowValidationDialog(true);
    } catch (error) {
      console.error('Failed to validate content:', error);
      toast.error('Failed to validate content');
    }
  };
  
  const resetNewSourceForm = () => {
    setNewSource({
      contentType: 'guidance',
      authorityScore: 5,
      credibilityRating: 'pending',
      complianceFrameworks: [],
      focusAreas: []
    });
  };
  
  // Filter functions
  const filteredSources = sources.filter(source => {
    const matchesSearch = searchQuery === '' ||
      source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' ||
      source.focusAreas?.includes(selectedCategory);
    
    const matchesStatus = selectedStatus === 'all' || source.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const filteredGuidance = guidancePreviews.filter(guidance => {
    const matchesSearch = searchQuery === '' ||
      guidance.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guidance.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || guidance.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || guidance.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Status badge helper
  const getStatusBadge = (status: string, type: 'source' | 'guidance' = 'source') => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      approved: 'default',
      published: 'default',
      pending: 'secondary',
      draft: 'secondary',
      reviewing: 'secondary',
      in_review: 'secondary',
      error: 'destructive',
      rejected: 'destructive',
      inactive: 'outline',
      archived: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };
  
  // Access control
  const isAdmin = user?.email === 'platform@auditready.com' || import.meta.env.DEV;
  
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">This area is reserved for administrators only.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (loading && sources.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading enhanced knowledge management system...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Enhanced Knowledge Manager</h2>
            <p className="text-gray-600 mt-1">
              Advanced RAG system with real-time guidance management and approval workflows
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
              id="real-time"
            />
            <Label htmlFor="real-time" className="text-sm">Real-time updates</Label>
          </div>
          <Button variant="outline" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddSource(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Knowledge Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
            <p className="text-xs text-gray-500">
              {sources.filter(s => s.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Content Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sources.reduce((sum, s) => sum + s.contentChunks, 0)}
            </div>
            <p className="text-xs text-gray-500">Total processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Guidance Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{guidancePreviews.length}</div>
            <p className="text-xs text-gray-500">
              {guidancePreviews.filter(g => g.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{approvalQueue.length}</div>
            <p className="text-xs text-gray-500">
              {approvalQueue.filter(a => a.priority === 'high').length} high priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {(guidancePreviews.reduce((sum, g) => sum + g.quality, 0) / guidancePreviews.length * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Content quality</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Processing content...
                  </span>
                  <span className="text-sm text-blue-700">{generationProgress.toFixed(0)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
              <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sources, guidance, categories..."
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
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Knowledge Sources
          </TabsTrigger>
          <TabsTrigger value="guidance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Guidance Management
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Category Analytics
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            System Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Knowledge Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Knowledge Sources</CardTitle>
                  <CardDescription>
                    Manage expert knowledge sources with approval workflows
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{source.title || source.domain}</div>
                          <div className="text-sm text-gray-600">{source.url}</div>
                          <div className="flex gap-1 mt-1">
                            {source.complianceFrameworks?.slice(0, 2).map(fw => (
                              <Badge key={fw} variant="outline" className="text-xs">
                                {fw.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {source.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={source.qualityScore * 100} className="w-16 h-2" />
                          <span className="text-sm">{(source.qualityScore * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{source.contentChunks}</div>
                          <div className="text-xs text-gray-500">chunks</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(source.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSource(source);
                              setShowSourceDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleValidateContent(source.url, 'source')}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          {source.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveSource(source.id, true)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveSource(source.id, false)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {source.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartIngestion(source)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredSources.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No knowledge sources found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Guidance Management Tab */}
        <TabsContent value="guidance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Guidance Management</CardTitle>
                  <CardDescription>
                    Real-time guidance preview, editing, and approval for all categories
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    const category = selectedCategory !== 'all' ? selectedCategory : COMPLIANCE_CATEGORIES[0];
                    handleGenerateGuidance(category);
                  }}
                  disabled={isGenerating}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Guidance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Sources</TableHead>
                    <TableHead>Frameworks</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuidance.map((guidance) => (
                    <TableRow key={guidance.category}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guidance.category}</div>
                          <div className="text-sm text-gray-600">v{guidance.version}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(guidance.status, 'guidance')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={guidance.quality * 100} className="w-16 h-2" />
                          <span className="text-sm">{(guidance.quality * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{guidance.sources.length}</div>
                          <div className="text-xs text-gray-500">sources</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {guidance.frameworks.slice(0, 2).map(fw => (
                            <Badge key={fw} variant="outline" className="text-xs">
                              {fw.toUpperCase()}
                            </Badge>
                          ))}
                          {guidance.frameworks.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{guidance.frameworks.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(guidance.lastGenerated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGuidance(guidance);
                              setShowGuidancePreview(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleValidateContent(guidance.content, 'guidance')}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateGuidance(guidance.category)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {guidance.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGuidance(guidance);
                                setShowApprovalDialog(true);
                              }}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Category Analytics Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {categoryStats.map((stat) => (
              <Card key={stat.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{stat.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Guidance</span>
                    <span className="font-semibold">{stat.totalGuidance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-semibold text-green-600">{stat.approvedGuidance}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality Score</span>
                      <span className="font-semibold">{(stat.avgQuality * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={stat.avgQuality * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sources Used</span>
                    <span className="font-semibold">{stat.sourcesUsed}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <span className="font-semibold">{(stat.userSatisfaction * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={stat.userSatisfaction * 100} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleGenerateGuidance(stat.category)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Approval Workflow Tab */}
        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Review and approve knowledge sources and guidance content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalQueue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">
                            {item.content.slice(0, 80)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.priority === 'high' ? 'destructive' :
                            item.priority === 'medium' ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {approvalQueue.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  All items have been reviewed. No pending approvals.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ingestions</span>
                  <span className="text-xl font-bold text-blue-600">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-xl font-bold text-green-600">98.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Processing Time</span>
                  <span className="text-xl font-bold text-purple-600">2.4s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-xl font-bold text-orange-600">73.2%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">92.4</div>
                  <div className="text-sm text-gray-600">Overall Quality Score</div>
                  <Progress value={92.4} className="mt-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Content Accuracy</span>
                    <span className="font-semibold">94.1%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Framework Coverage</span>
                    <span className="font-semibold">89.7%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>User Satisfaction</span>
                    <span className="font-semibold">93.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">128.5 MB</div>
                  <div className="text-sm text-gray-600">Memory Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Source Dialog */}
      <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
            <DialogDescription>
              Add a new expert knowledge source with approval workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="url">Source URL *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/compliance-guide"
                  value={newSource.url || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setNewSource(prev => ({
                      ...prev,
                      url,
                      domain: url ? new URL(url).hostname : ''
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newSource.domain || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, domain: e.target.value }))}
                  readOnly
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Expert Compliance Guide"
                value={newSource.title || ''}
                onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this source provides..."
                value={newSource.description || ''}
                onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={newSource.contentType}
                  onValueChange={(value) => setNewSource(prev => ({ ...prev, contentType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="authorityScore">Authority Score</Label>
                <Select
                  value={newSource.authorityScore?.toString()}
                  onValueChange={(value) => setNewSource(prev => ({ ...prev, authorityScore: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}/10
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="credibilityRating">Credibility</Label>
                <Select
                  value={newSource.credibilityRating}
                  onValueChange={(value) => setNewSource(prev => ({ ...prev, credibilityRating: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Compliance Frameworks</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FRAMEWORKS.map(framework => (
                  <Badge
                    key={framework}
                    variant={newSource.complianceFrameworks?.includes(framework) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      const frameworks = newSource.complianceFrameworks || [];
                      if (frameworks.includes(framework)) {
                        setNewSource(prev => ({
                          ...prev,
                          complianceFrameworks: frameworks.filter(f => f !== framework)
                        }));
                      } else {
                        setNewSource(prev => ({
                          ...prev,
                          complianceFrameworks: [...frameworks, framework]
                        }));
                      }
                    }}
                  >
                    {framework.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Focus Areas</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                {COMPLIANCE_CATEGORIES.slice(0, 10).map(category => (
                  <Badge
                    key={category}
                    variant={newSource.focusAreas?.includes(category) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const areas = newSource.focusAreas || [];
                      if (areas.includes(category)) {
                        setNewSource(prev => ({
                          ...prev,
                          focusAreas: areas.filter(a => a !== category)
                        }));
                      } else {
                        setNewSource(prev => ({
                          ...prev,
                          focusAreas: [...areas, category]
                        }));
                      }
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddSource(false);
              resetNewSourceForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSource}
              disabled={!newSource.url || !newSource.domain || loading}
            >
              {loading ? 'Adding...' : 'Add Source'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Source Details Dialog */}
      <Dialog open={showSourceDetails} onOpenChange={setShowSourceDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Source Details</DialogTitle>
            <DialogDescription>
              Detailed information and management options for knowledge source
            </DialogDescription>
          </DialogHeader>
          
          {selectedSource && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>URL:</strong> {selectedSource.url}</div>
                    <div><strong>Domain:</strong> {selectedSource.domain}</div>
                    <div><strong>Title:</strong> {selectedSource.title}</div>
                    <div><strong>Type:</strong> {selectedSource.contentType}</div>
                    <div><strong>Authority Score:</strong> {selectedSource.authorityScore}/10</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedSource.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Content Chunks:</strong> {selectedSource.contentChunks}</div>
                    <div><strong>Quality Score:</strong> {(selectedSource.qualityScore * 100).toFixed(1)}%</div>
                    <div><strong>Success Rate:</strong> {selectedSource.successRate * 100}%</div>
                    <div><strong>Error Count:</strong> {selectedSource.errorCount}</div>
                    <div><strong>Last Scraped:</strong> {selectedSource.lastScraped ? new Date(selectedSource.lastScraped).toLocaleString() : 'Never'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Compliance Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSource.complianceFrameworks?.map(framework => (
                    <Badge key={framework} variant="outline">
                      {framework.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSource.focusAreas?.map(area => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedSource.description && (
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-sm text-gray-600">{selectedSource.description}</p>
                </div>
              )}
              
              {selectedSource.lastError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Last Error:</strong> {selectedSource.lastError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSourceDetails(false)}>
              Close
            </Button>
            {selectedSource && selectedSource.status === 'active' && (
              <Button onClick={() => handleStartIngestion(selectedSource)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Content
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Guidance Preview Dialog */}
      <Dialog open={showGuidancePreview} onOpenChange={setShowGuidancePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guidance Preview</DialogTitle>
            <DialogDescription>
              Real-time preview and editing for AI-generated guidance
            </DialogDescription>
          </DialogHeader>
          
          {selectedGuidance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <p className="text-lg">{selectedGuidance.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedGuidance.status, 'guidance')}
                    <span className="text-sm text-gray-500">v{selectedGuidance.version}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(selectedGuidance.quality * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedGuidance.sources.length}
                  </div>
                  <div className="text-sm text-gray-600">Sources Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedGuidance.frameworks.length}
                  </div>
                  <div className="text-sm text-gray-600">Frameworks</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Guidance Content</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Textarea
                    value={selectedGuidance.content}
                    onChange={(e) => {
                      if (selectedGuidance) {
                        setSelectedGuidance({
                          ...selectedGuidance,
                          content: e.target.value
                        });
                      }
                    }}
                    rows={12}
                    className="bg-white"
                    placeholder="Guidance content..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Sources Used</h3>
                  <div className="space-y-1">
                    {selectedGuidance.sources.map(source => (
                      <div key={source} className="text-sm text-blue-600">
                        • {source}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Framework Coverage</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedGuidance.frameworks.map(fw => (
                      <Badge key={fw} variant="outline" className="text-xs">
                        {fw.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedGuidance.approvalWorkflow && (
                <div>
                  <h3 className="font-semibold mb-3">Approval Workflow</h3>
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <div className="space-y-2 text-sm">
                      <div><strong>Submitted:</strong> {new Date(selectedGuidance.approvalWorkflow.submittedAt!).toLocaleString()}</div>
                      {selectedGuidance.approvalWorkflow.comments && (
                        <div>
                          <strong>Comments:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {selectedGuidance.approvalWorkflow.comments.map((comment, index) => (
                              <li key={index}>{comment}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuidancePreview(false)}>
              Close
            </Button>
            <Button onClick={() => handleValidateContent(selectedGuidance?.content || '', 'guidance')}>
              <Shield className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button onClick={() => {
              if (selectedGuidance) {
                setShowGuidancePreview(false);
                setShowApprovalDialog(true);
              }
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Submit this guidance for review and approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-notes">Review Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add notes for the reviewer..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Approval Options</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Notify reviewers immediately</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Run automated quality checks</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Require manual review before publishing</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowApprovalDialog(false);
              toast.success('Guidance submitted for approval');
            }}>
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Validation Results Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Validation Results</DialogTitle>
            <DialogDescription>
              Automated quality and compliance validation results
            </DialogDescription>
          </DialogHeader>
          
          {validationResults && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={validationResults.score >= 0.8 ? 'text-green-600' : validationResults.score >= 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                    {(validationResults.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">Overall Validation Score</div>
                <Progress value={validationResults.score * 100} className="mt-3" />
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Validation Checks</h3>
                <div className="space-y-2">
                  {validationResults.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {check.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-gray-600">{check.details}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {(check.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {validationResults.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {validationResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">{rec}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm font-semibold">{(validationResults.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowValidationDialog(false);
              toast.success('Validation results exported');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}