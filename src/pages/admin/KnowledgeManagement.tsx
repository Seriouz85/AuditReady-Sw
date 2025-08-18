/**
 * Knowledge Management - Platform Admin Interface
 * Manage RAG knowledge sources, content quality, and system metrics
 */

import React, { useState, useEffect } from 'react';
import { Brain, Database, Globe, TrendingUp, Settings, Eye, Trash2, RefreshCw, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService, type KnowledgeSource, type IngestionResult } from '@/services/rag/KnowledgeIngestionService';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';

interface KnowledgeSourceData extends KnowledgeSource {
  id: string;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'archived';
  lastScraped?: string;
  errorCount: number;
  lastError?: string;
  successRate: number;
  metadata?: any;
  createdAt: string;
}

interface ContentMetrics {
  totalSources: number;
  activeSources: number;
  errorSources: number;
  totalContent: number;
  avgQualityScore: number;
  lastUpdated: string;
}

interface RAGMetrics {
  totalGenerations: number;
  ragGenerations: number;
  hybridGenerations: number;
  fallbackGenerations: number;
  avgQualityScore: number;
  avgResponseTime: number;
  successRate: number;
}

export default function KnowledgeManagement() {
  const [sources, setSources] = useState<KnowledgeSourceData[]>([]);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics | null>(null);
  const [ragMetrics, setRAGMetrics] = useState<RAGMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSourceData | null>(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState<Partial<KnowledgeSource>>({
    contentType: 'guidance',
    authorityScore: 5,
    credibilityRating: 'pending',
    complianceFrameworks: [],
    focusAreas: []
  });
  const [activeTab, setActiveTab] = useState('sources');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSources(),
        loadContentMetrics(),
        loadRAGMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load knowledge management data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadSources = async () => {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to load sources:', error);
      return;
    }
    
    setSources(data || []);
  };
  
  const loadContentMetrics = async () => {
    try {
      // Get source metrics
      const { data: sourceData, error: sourceError } = await supabase
        .from('knowledge_sources')
        .select('status');
      
      if (sourceError) throw sourceError;
      
      // Get content metrics
      const { data: contentData, error: contentError } = await supabase
        .from('knowledge_content')
        .select('quality_score, extracted_at');
      
      if (contentError) throw contentError;
      
      const totalSources = sourceData?.length || 0;
      const activeSources = sourceData?.filter(s => s.status === 'active').length || 0;
      const errorSources = sourceData?.filter(s => s.status === 'error').length || 0;
      const totalContent = contentData?.length || 0;
      const avgQualityScore = contentData?.length 
        ? contentData.reduce((sum, c) => sum + (c.quality_score || 0), 0) / contentData.length
        : 0;
      
      setContentMetrics({
        totalSources,
        activeSources,
        errorSources,
        totalContent,
        avgQualityScore,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to load content metrics:', error);
    }
  };
  
  const loadRAGMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('rag_generation_history')
        .select('generation_method, quality_score, generation_time_ms, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const totalGenerations = data.length;
        const ragGenerations = data.filter(g => g.generation_method === 'rag').length;
        const hybridGenerations = data.filter(g => g.generation_method === 'hybrid').length;
        const fallbackGenerations = data.filter(g => g.generation_method === 'fallback').length;
        const avgQualityScore = data.reduce((sum, g) => sum + (g.quality_score || 0), 0) / data.length;
        const avgResponseTime = data.reduce((sum, g) => sum + (g.generation_time_ms || 0), 0) / data.length;
        const successRate = (ragGenerations + hybridGenerations) / totalGenerations;
        
        setRAGMetrics({
          totalGenerations,
          ragGenerations,
          hybridGenerations,
          fallbackGenerations,
          avgQualityScore,
          avgResponseTime,
          successRate
        });
      }
      
    } catch (error) {
      console.error('Failed to load RAG metrics:', error);
    }
  };
  
  const handleAddSource = async () => {
    if (!newSource.url || !newSource.domain) {
      toast.error('URL and domain are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // First add to database
      const { data, error } = await supabase
        .from('knowledge_sources')
        .insert({
          url: newSource.url,
          domain: newSource.domain,
          title: newSource.title || `Knowledge from ${newSource.domain}`,
          description: newSource.description,
          content_type: newSource.contentType,
          compliance_frameworks: newSource.complianceFrameworks,
          focus_areas: newSource.focusAreas,
          authority_score: newSource.authorityScore,
          credibility_rating: newSource.credibilityRating,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Source added successfully. Starting ingestion...');
      setShowAddSource(false);
      setNewSource({
        contentType: 'guidance',
        authorityScore: 5,
        credibilityRating: 'pending',
        complianceFrameworks: [],
        focusAreas: []
      });
      
      // Start ingestion process
      const ingestionResult = await KnowledgeIngestionService.ingestFromURL(newSource.url!, {
        title: newSource.title,
        description: newSource.description,
        contentType: newSource.contentType,
        complianceFrameworks: newSource.complianceFrameworks,
        focusAreas: newSource.focusAreas,
        authorityScore: newSource.authorityScore,
        credibilityRating: newSource.credibilityRating
      });
      
      if (ingestionResult.success) {
        toast.success(`Ingestion completed: ${ingestionResult.chunksCreated} content chunks created`);
      } else {
        toast.error(`Ingestion failed: ${ingestionResult.errors.join(', ')}`);
      }
      
      await loadData();
      
    } catch (error) {
      console.error('Failed to add source:', error);
      toast.error('Failed to add source');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshSource = async (source: KnowledgeSourceData) => {
    try {
      setLoading(true);
      toast.info(`Refreshing ${source.domain}...`);
      
      const result = await KnowledgeIngestionService.ingestFromURL(source.url, {
        title: source.title,
        description: source.description,
        contentType: source.contentType,
        complianceFrameworks: source.complianceFrameworks,
        focusAreas: source.focusAreas,
        authorityScore: source.authorityScore,
        credibilityRating: source.credibilityRating
      });
      
      if (result.success) {
        toast.success(`Refresh completed: ${result.chunksCreated} chunks updated`);
      } else {
        toast.error(`Refresh failed: ${result.errors.join(', ')}`);
      }
      
      await loadData();
      
    } catch (error) {
      console.error('Failed to refresh source:', error);
      toast.error('Failed to refresh source');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSource = async (source: KnowledgeSourceData) => {
    if (!confirm(`Are you sure you want to delete ${source.domain}? This will remove all associated content.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('knowledge_sources')
        .delete()
        .eq('id', source.id);
      
      if (error) throw error;
      
      toast.success('Source deleted successfully');
      await loadData();
      
    } catch (error) {
      console.error('Failed to delete source:', error);
      toast.error('Failed to delete source');
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      error: 'destructive',
      inactive: 'outline'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };
  
  if (loading && sources.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading knowledge management data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Knowledge Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage AI knowledge sources and RAG system performance
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddSource(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Knowledge Source
        </Button>
      </div>
      
      {/* Metrics Overview */}
      {(contentMetrics || ragMetrics) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentMetrics && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentMetrics.totalSources}</div>
                  <p className="text-xs text-gray-500">
                    {contentMetrics.activeSources} active, {contentMetrics.errorSources} errors
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Content Chunks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentMetrics.totalContent}</div>
                  <p className="text-xs text-gray-500">
                    Avg quality: {contentMetrics.avgQualityScore.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
          
          {ragMetrics && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">RAG Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ragMetrics.totalGenerations}</div>
                  <p className="text-xs text-gray-500">
                    {(ragMetrics.successRate * 100).toFixed(1)}% success rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ragMetrics.avgResponseTime.toFixed(0)}ms</div>
                  <p className="text-xs text-gray-500">
                    Quality: {ragMetrics.avgQualityScore.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Knowledge Sources
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Content Quality
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            RAG Metrics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Knowledge Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expert Knowledge Sources</CardTitle>
              <CardDescription>
                Manage trusted sources for AI-powered guidance generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(source.status)}
                      <div>
                        <h3 className="font-medium">{source.title || source.domain}</h3>
                        <p className="text-sm text-gray-600">{source.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(source.status)}
                          <Badge variant="outline">Authority: {source.authorityScore}/10</Badge>
                          <Badge variant="outline">{source.contentType}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshSource(source)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSource(source)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSource(source)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {sources.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No knowledge sources configured yet.
                    <br />
                    Add your first expert source to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Quality Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Quality Overview</CardTitle>
              <CardDescription>
                Monitor and validate knowledge base content quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Content quality monitoring interface will be implemented in Phase 2
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* RAG Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG System Performance</CardTitle>
              <CardDescription>
                Monitor AI generation quality and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ragMetrics ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{ragMetrics.ragGenerations}</div>
                    <p className="text-sm text-gray-600">RAG Generations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{ragMetrics.hybridGenerations}</div>
                    <p className="text-sm text-gray-600">Hybrid Generations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{ragMetrics.fallbackGenerations}</div>
                    <p className="text-sm text-gray-600">Fallback Generations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(ragMetrics.successRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {ragMetrics.avgQualityScore.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Avg Quality Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {ragMetrics.avgResponseTime.toFixed(0)}ms
                    </div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No RAG metrics available yet. Generate some guidance to see performance data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG System Configuration</CardTitle>
              <CardDescription>
                Configure AI generation parameters and quality thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                System configuration interface will be implemented in Phase 2
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
              Add a new expert knowledge source for AI guidance generation
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
                    <SelectItem value="guidance">Guidance</SelectItem>
                    <SelectItem value="standards">Standards</SelectItem>
                    <SelectItem value="bestpractice">Best Practice</SelectItem>
                    <SelectItem value="implementation">Implementation</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
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
            
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleAddSource}
                disabled={!newSource.url || !newSource.domain || loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Source'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddSource(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}