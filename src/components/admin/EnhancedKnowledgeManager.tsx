/**
 * Enhanced Knowledge Manager - Advanced RAG System Management
 * Main orchestrator component that manages all knowledge management functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Brain,
  Search,
  Plus,
  RefreshCw,
  Zap,
  Shield,
  Globe,
  FileText,
  Target,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService, type KnowledgeSource } from '@/services/rag/KnowledgeIngestionService';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';
import { RequirementValidationService } from '@/services/rag/RequirementValidationService';

// Import extracted components
import { KnowledgeSourcesList } from './knowledge/sources/KnowledgeSourcesList';
import { SourceManager } from './knowledge/sources/SourceManager';
import { SourceDetails } from './knowledge/sources/SourceDetails';
import { GuidanceManager } from './knowledge/content/GuidanceManager';
import { GuidancePreview } from './knowledge/content/GuidancePreview';
import { KnowledgeAnalytics } from './knowledge/content/KnowledgeAnalytics';
import { ContentValidator } from './knowledge/quality/ContentValidator';
import { ApprovalWorkflow } from './knowledge/quality/ApprovalWorkflow';
import { ApprovalDialog } from './knowledge/quality/ApprovalDialog';

// Import shared types and utilities
import {
  EnhancedKnowledgeSource,
  GuidancePreview as GuidancePreviewType,
  CategoryStats,
  ApprovalWorkflowItem,
  ValidationResult,
  COMPLIANCE_CATEGORIES,
  FRAMEWORKS
} from './knowledge/shared/KnowledgeTypes';
import {
  filterSources,
  filterGuidance,
  validateSourceForm,
  generateMockGuidance,
  generateMockCategoryStats,
  generateMockApprovalQueue
} from './knowledge/shared/KnowledgeUtilities';

export function EnhancedKnowledgeManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sources');
  
  // State management
  const [sources, setSources] = useState<EnhancedKnowledgeSource[]>([]);
  const [guidancePreviews, setGuidancePreviews] = useState<GuidancePreviewType[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalWorkflowItem[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<EnhancedKnowledgeSource | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<GuidancePreviewType | null>(null);
  
  // Dialog states
  const [showAddSource, setShowAddSource] = useState(false);
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  const [showGuidancePreview, setShowGuidancePreview] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  
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
        id: String(source.id || ''),
        url: String(source.url || ''),
        domain: String(source.domain || ''),
        title: String(source.title || ''),
        description: String(source.description || ''),
        contentType: (source.content_type || 'guidance') as any,
        complianceFrameworks: Array.isArray(source.compliance_frameworks) ? source.compliance_frameworks : [],
        focusAreas: Array.isArray(source.focus_areas) ? source.focus_areas : [],
        authorityScore: Number(source.authority_score) || 0,
        credibilityRating: (source.credibility_rating || 'pending') as any,
        status: (source.status || 'pending') as any,
        approvalStatus: source.status === 'active' ? 'approved' : 'pending',
        errorCount: 0,
        successRate: 100,
        contentChunks: Array.isArray(source.knowledge_content) ? source.knowledge_content.length : 0,
        qualityScore: 0.85, // Mock quality score
        metadata: source.metadata || {},
        createdAt: String(source.created_at || new Date().toISOString()),
        updatedAt: String(source.updated_at || new Date().toISOString())
      }));
      
      setSources(enhancedSources);
    } catch (error) {
      console.error('Failed to load sources:', error);
    }
  };
  
  const loadGuidancePreviews = async () => {
    const mockGuidance = generateMockGuidance(COMPLIANCE_CATEGORIES, FRAMEWORKS);
    setGuidancePreviews(mockGuidance);
  };
  
  const loadCategoryStats = async () => {
    const mockStats = generateMockCategoryStats(COMPLIANCE_CATEGORIES);
    setCategoryStats(mockStats);
  };
  
  const loadApprovalQueue = async () => {
    const mockQueue = generateMockApprovalQueue();
    setApprovalQueue(mockQueue);
  };
  
  // Action handlers
  const handleAddSource = async (source: Partial<KnowledgeSource>) => {
    const validation = validateSourceForm(source);
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate source first
      const validationResult = await RequirementValidationService.validateSource({
        url: source.url!,
        domain: source.domain!,
        contentType: source.contentType || 'guidance'
      });
      
      if (validationResult.score < 0.6) {
        toast.error('Source validation failed. Please check URL and content quality.');
        return;
      }
      
      // Add to database with pending approval status
      const { data, error } = await supabase
        .from('knowledge_sources')
        .insert({
          url: source.url,
          domain: source.domain,
          title: source.title || `Knowledge from ${source.domain}`,
          description: source.description,
          content_type: source.contentType,
          compliance_frameworks: source.complianceFrameworks || [],
          focus_areas: source.focusAreas || [],
          authority_score: source.authorityScore,
          credibility_rating: source.credibilityRating,
          status: 'pending' // Start in pending status for approval
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Source added and queued for approval');
      setShowAddSource(false);
      await loadAllData();
      
      // Add to approval queue
      const approvalItem: ApprovalWorkflowItem = {
        id: String(data.id),
        type: 'source',
        title: String(data.title),
        category: source.focusAreas?.[0] || 'General',
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
        const newGuidance: GuidancePreviewType = {
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
  
  // Filter functions
  const filteredSources = filterSources(sources, searchQuery, selectedCategory, selectedStatus);
  const filteredGuidance = filterGuidance(guidancePreviews, searchQuery, selectedCategory, selectedStatus);
  
  // Content validation handler
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
  
  // Approval submission handler
  const handleSubmitForApproval = (notes: string, options: any) => {
    toast.success('Guidance submitted for approval');
    setShowApprovalDialog(false);
  };
  
  // Export validation report handler
  const handleExportValidationReport = () => {
    toast.success('Validation results exported');
    setShowValidationDialog(false);
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
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
            <p className="text-xs text-gray-500">
              {sources.filter(s => s.status === 'active').length} active sources
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {sources.reduce((sum, s) => sum + s.contentChunks, 0)}
            </div>
            <p className="text-xs text-gray-500">Content chunks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{guidancePreviews.length}</div>
            <p className="text-xs text-gray-500">
              {guidancePreviews.filter(g => g.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{approvalQueue.length}</div>
            <p className="text-xs text-gray-500">
              {approvalQueue.filter(a => a.priority === 'high').length} high priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-indigo-600">
              {guidancePreviews.length > 0 ? (guidancePreviews.reduce((sum, g) => sum + g.quality, 0) / guidancePreviews.length * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-gray-500">Avg quality</p>
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
            Sources
          </TabsTrigger>
          <TabsTrigger value="guidance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Guidance
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approval
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>
        
        {/* Knowledge Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <KnowledgeSourcesList
            sources={filteredSources}
            loading={loading}
            onViewSource={(source) => {
              setSelectedSource(source);
              setShowSourceDetails(true);
            }}
            onValidateSource={(source) => handleValidateContent(source.url, 'source')}
            onApproveSource={handleApproveSource}
            onRefreshSource={handleStartIngestion}
          />
        </TabsContent>
        
        {/* Guidance Management Tab */}
        <TabsContent value="guidance" className="space-y-4">
          <GuidanceManager
            guidancePreviews={filteredGuidance}
            isGenerating={isGenerating}
            onViewGuidance={(guidance) => {
              setSelectedGuidance(guidance);
              setShowGuidancePreview(true);
            }}
            onValidateGuidance={(guidance) => handleValidateContent(guidance.content, 'guidance')}
            onRefreshGuidance={handleGenerateGuidance}
            onApproveGuidance={(guidance) => {
              setSelectedGuidance(guidance);
              setShowApprovalDialog(true);
            }}
            onGenerateGuidance={handleGenerateGuidance}
            selectedCategory={selectedCategory}
          />
        </TabsContent>
        
        {/* Category Analytics Tab */}
        <TabsContent value="categories" className="space-y-4">
          <KnowledgeAnalytics
            categoryStats={categoryStats}
            onGenerateGuidance={handleGenerateGuidance}
          />
        </TabsContent>
        
        {/* Approval Workflow Tab */}
        <TabsContent value="approval" className="space-y-4">
          <ApprovalWorkflow
            approvalQueue={approvalQueue}
            onViewItem={(item) => {
              // Handle view item logic
            }}
            onApproveItem={(itemId, approved) => {
              // Handle approve item logic
            }}
          />
        </TabsContent>
        
        {/* System Analytics Tab - Simple placeholder */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-600">98.3%</div>
                <p className="text-sm text-gray-600">System Uptime</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <p className="text-sm text-gray-600">Total Ingestions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-purple-600">2.4s</div>
                <p className="text-sm text-gray-600">Avg Processing</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <SourceManager
        open={showAddSource}
        onOpenChange={setShowAddSource}
        onSubmit={handleAddSource}
        loading={loading}
      />
      
      <SourceDetails
        open={showSourceDetails}
        onOpenChange={setShowSourceDetails}
        source={selectedSource}
        onRefreshSource={handleStartIngestion}
      />
      
      <GuidancePreview
        open={showGuidancePreview}
        onOpenChange={setShowGuidancePreview}
        guidance={selectedGuidance}
        onValidateContent={(content) => handleValidateContent(content, 'guidance')}
        onSubmitForApproval={() => setShowApprovalDialog(true)}
      />
      
      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        onSubmit={handleSubmitForApproval}
      />
      
      <ContentValidator
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        validationResults={validationResults}
        onExportReport={handleExportValidationReport}
      />
    </div>
  );
}