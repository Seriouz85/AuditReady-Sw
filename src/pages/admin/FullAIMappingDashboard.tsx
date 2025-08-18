import React, { useState, useEffect } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Upload,
  Link,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService } from '@/services/rag/KnowledgeIngestionService';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';
import { useAuth } from '@/contexts/AuthContext';

// Types
interface UnifiedRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  frameworks: string[];
  status: 'draft' | 'active' | 'archived';
  guidance?: string;
  ai_guidance?: string;
  updated_at: string;
}

interface KnowledgeSource {
  id: string;
  url: string;
  domain: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  authority_score: number;
  content_quality: number;
  last_scraped: string;
}

interface GuidanceGeneration {
  requirement_id: string;
  guidance: string;
  confidence: number;
  sources_used: string[];
  generated_at: string;
}

export default function FullAIMappingDashboard() {
  const { user, organization } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('requirements');
  const [requirements, setRequirements] = useState<UnifiedRequirement[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<UnifiedRequirement | null>(null);
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Categories from your unified system
  const categories = [
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

  // Load data on component mount
  useEffect(() => {
    loadRequirements();
    loadKnowledgeSources();
  }, [organization]);

  const loadRequirements = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('organization_id', organization.id)
        .order('category', { ascending: true });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  };

  const loadKnowledgeSources = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledgeSources(data || []);
    } catch (error) {
      console.error('Error loading knowledge sources:', error);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;

    setIsScrapingUrl(true);
    try {
      const result = await KnowledgeIngestionService.ingestFromURL(
        newUrl,
        {
          onProgress: (progress) => setUploadProgress(progress),
          includeSubpages: true,
          maxDepth: 2
        }
      );

      if (result.success) {
        await loadKnowledgeSources();
        setNewUrl('');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error adding URL:', error);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const generateGuidanceForRequirement = async (requirement: UnifiedRequirement) => {
    setIsGeneratingGuidance(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await RAGGenerationService.generateGuidance(
        requirement,
        requirement.category,
        { [requirement.category]: true }
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success && result.guidance) {
        // Update requirement with generated guidance
        const { error } = await supabase
          .from('requirements')
          .update({ 
            ai_guidance: result.guidance,
            updated_at: new Date().toISOString()
          })
          .eq('id', requirement.id);

        if (!error) {
          await loadRequirements();
          setSelectedRequirement(prev => prev ? { ...prev, guidance: result.guidance } : null);
        }
      }

      setTimeout(() => {
        setGenerationProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error generating guidance:', error);
    } finally {
      setIsGeneratingGuidance(false);
    }
  };

  const filteredRequirements = requirements.filter(req => 
    selectedCategory === 'all' || req.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  AI Mapping Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Advanced AI-powered compliance guidance generation
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{requirements.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    With Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {requirements.filter(r => r.guidance || r.ai_guidance).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Knowledge Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{knowledgeSources.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Requirements & Management */}
            <div className="space-y-6">
              {/* Requirements Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Unified Requirements
                      </CardTitle>
                      <CardDescription>
                        Manage and categorize compliance requirements
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={loadRequirements}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Category Filter */}
                  <div className="mb-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredRequirements.map((requirement) => (
                      <div
                        key={requirement.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequirement?.id === requirement.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRequirement(requirement)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{requirement.title}</h4>
                              {(requirement.guidance || requirement.ai_guidance) && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {requirement.description.slice(0, 100)}...
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {requirement.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {requirement.frameworks.length} frameworks
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Sources Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Knowledge Sources
                  </CardTitle>
                  <CardDescription>
                    Add URLs and documents for AI guidance generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add URL */}
                  <div className="space-y-4 mb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter URL to scrape (e.g., https://nist.gov/cybersecurity)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddUrl}
                        disabled={isScrapingUrl || !newUrl.trim()}
                      >
                        {isScrapingUrl ? (
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add URL
                      </Button>
                    </div>

                    {isScrapingUrl && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-600 text-center">
                          Scraping content... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sources List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {knowledgeSources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{source.domain}</span>
                            <Badge className={getStatusColor(source.status)}>
                              {source.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{source.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Score: {source.authority_score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Guidance Generation & Display */}
            <div className="space-y-6">
              {selectedRequirement ? (
                <>
                  {/* Selected Requirement Details */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Requirement Details
                        </CardTitle>
                        <Button 
                          onClick={() => generateGuidanceForRequirement(selectedRequirement)}
                          disabled={isGeneratingGuidance}
                          size="sm"
                        >
                          {isGeneratingGuidance ? (
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          Generate Guidance
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{selectedRequirement.title}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {selectedRequirement.category}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{selectedRequirement.description}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Applicable Frameworks</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRequirement.frameworks.map(framework => (
                              <Badge key={framework} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {isGeneratingGuidance && (
                          <div className="space-y-2">
                            <Progress value={generationProgress} className="w-full" />
                            <p className="text-sm text-gray-600 text-center">
                              Generating AI guidance... {generationProgress}%
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generated Guidance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI-Generated Guidance
                      </CardTitle>
                      <CardDescription>
                        Comprehensive implementation guidance based on knowledge sources
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(selectedRequirement.guidance || selectedRequirement.ai_guidance) ? (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-sm leading-relaxed whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ 
                                __html: (selectedRequirement.ai_guidance || selectedRequirement.guidance || '').replace(/\n/g, '<br/>') 
                              }}
                            />
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Last updated: {new Date(selectedRequirement.updated_at).toLocaleString()}</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3 mr-1" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No guidance generated yet</p>
                          <Button 
                            onClick={() => generateGuidanceForRequirement(selectedRequirement)}
                            disabled={isGeneratingGuidance}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Generate AI Guidance
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Select a Requirement</h3>
                    <p className="text-gray-500">
                      Choose a requirement from the left panel to view details and generate guidance
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}