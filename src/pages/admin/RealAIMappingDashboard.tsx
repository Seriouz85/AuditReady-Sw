import React, { useState, useEffect } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Upload,
  Link,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
  Plus,
  Eye,
  Edit,
  Download,
  Database,
  Target,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  Cpu,
  Network,
  Rocket,
  X,
  User,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService } from '@/services/rag/KnowledgeIngestionService';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';
import { useAuth } from '@/contexts/AuthContext';

// Real types based on your actual database schema
interface UnifiedCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  icon?: string;
  is_active: boolean;
}

interface UnifiedRequirement {
  id: string;
  category_id: string;
  title: string;
  description: string;
  ai_guidance?: string;
  guidance_confidence?: number;
  guidance_sources?: string[];
  created_at: string;
  updated_at: string;
  category?: UnifiedCategory;
}

interface KnowledgeSource {
  id: string;
  url: string;
  domain: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  authority_score: number;
  content_quality: number;
  last_scraped?: string;
  created_at: string;
}

interface RequirementValidation {
  requirement_id: string;
  quality_score: number;
  completeness_score: number;
  framework_alignment: number;
  missing_elements: string[];
  improvement_suggestions: string[];
  confidence: number;
  validated_at: string;
}

export default function RealAIMappingDashboard() {
  const { user, organization } = useAuth();
  
  // State
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [requirements, setRequirements] = useState<UnifiedRequirement[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<UnifiedRequirement | null>(null);
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // PHASE 1: Search and filter state
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'with_guidance' | 'pending_suggestions'>('all');
  const [activeCategory, setActiveCategory] = useState<UnifiedCategory | null>(null);
  
  // Sub-requirements editing focus
  const [editingSubRequirements, setEditingSubRequirements] = useState(false);

  // Load real data from your database
  useEffect(() => {
    loadRealData();
  }, [organization]);

  const loadRealData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadRequirements(),
        loadKnowledgeSources(),
        loadComprehensiveGuidance()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_compliance_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(21); // Limit to 21 unified categories only

      if (error) throw error;
      setCategories(data || []);
      console.log('✅ Loaded 21 unified categories:', data?.length || 0);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRequirements = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('unified_requirements')
        .select(`
          *,
          category:unified_compliance_categories(*)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
      console.log('✅ Loaded real requirements:', data?.length || 0);
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
      console.log('✅ Loaded knowledge sources:', data?.length || 0);
    } catch (error) {
      console.error('Error loading knowledge sources:', error);
    }
  };

  const loadComprehensiveGuidance = async () => {
    if (!organization) return;

    try {
      const guidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
      setCategoryGuidances(guidances);
      console.log('✅ Loaded comprehensive guidances:', guidances.length);
    } catch (error) {
      console.error('Error loading comprehensive guidance:', error);
    }
  };

  const handleAddKnowledgeSource = async () => {
    if (!newUrl.trim()) return;

    setIsScrapingUrl(true);
    setUploadProgress(0);
    
    try {
      console.log('🚀 Starting real URL scraping for:', newUrl);
      
      const result = await KnowledgeIngestionService.ingestFromURL(
        newUrl,
        {
          onProgress: (progress) => {
            setUploadProgress(progress);
            console.log(`📊 Scraping progress: ${progress}%`);
          },
          includeSubpages: true,
          maxDepth: 2
        }
      );

      if (result.success) {
        console.log('✅ URL scraping completed successfully');
        await loadKnowledgeSources();
        setNewUrl('');
        setUploadProgress(0);
      } else {
        console.error('❌ URL scraping failed:', result.error);
      }
    } catch (error) {
      console.error('Error adding knowledge source:', error);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const generateGuidanceForRequirement = async (requirement: UnifiedRequirement) => {
    if (!requirement.category) return;

    setIsGeneratingGuidance(true);
    setGenerationProgress(0);

    try {
      console.log('🧠 Generating real AI guidance for:', requirement.title);
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await RAGGenerationService.generateGuidance(
        requirement,
        requirement.category.name,
        { [requirement.category.name]: true }
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success && result.guidance) {
        console.log('✅ AI guidance generated successfully');
        
        // Save the generated guidance back to database
        const { error } = await supabase
          .from('unified_requirements')
          .update({ 
            ai_guidance: result.guidance,
            guidance_confidence: result.confidence || 0.8,
            guidance_sources: result.sources || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', requirement.id);

        if (!error) {
          await loadRequirements();
          setSelectedRequirement(prev => prev ? { 
            ...prev, 
            ai_guidance: result.guidance,
            guidance_confidence: result.confidence,
            guidance_sources: result.sources
          } : null);
        }
      } else {
        console.error('❌ AI guidance generation failed:', result.error);
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
    selectedCategory === 'all' || req.category_id === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading real compliance data...</p>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 1: Filter and search categories
  const filteredCategories = categories.filter(category => {
    // Search filter
    const matchesSearch = category.name.toLowerCase().includes(categorySearch.toLowerCase());
    
    // Category filter
    const guidance = categoryGuidances.find(cg => cg.category_id === category.id);
    let matchesFilter = true;
    
    if (categoryFilter === 'with_guidance') {
      matchesFilter = !!guidance;
    } else if (categoryFilter === 'pending_suggestions') {
      // TODO: Implement pending suggestions logic in later phases
      matchesFilter = !guidance; // For now, show categories without guidance as "pending"
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminNavigation />
      
      <div className="flex-1 ml-64 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Epic Header */}
          <div className="mb-8">
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 animate-pulse"></div>
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Brain className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                        AI KNOWLEDGE NEXUS
                      </h1>
                      <div className="flex gap-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          NEURAL
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                          <Rocket className="w-3 h-3 mr-1" />
                          LIVE
                        </Badge>
                      </div>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      🧠 <span className="text-purple-300 font-semibold">Neural Intelligence</span> meets 
                      <span className="text-blue-300 font-semibold"> Compliance Mastery</span> · 
                      Build the ultimate knowledge foundation for AI-powered guidance
                    </p>
                  </div>
                </div>

                {/* Neural Network Visualization */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                      <span className="text-xs text-purple-300 font-medium">URLs → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-xs text-blue-300 font-medium">Neural Processing → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span className="text-xs text-pink-300 font-medium">Knowledge Graph → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400 animate-bounce" />
                      <span className="text-xs text-green-300 font-medium">AI Guidance</span>
                    </div>
                  </div>
                  
                  {/* Neural Validation Controls */}
                  <div className="flex items-center gap-3">
                    {validationReport && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-300 font-medium">
                          Quality: {validationReport.overall_quality}%
                        </span>
                      </div>
                    )}
                    {categoryGuidances.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-purple-500/20">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-purple-300 font-medium">
                          Coverage: {Math.round(categoryGuidances.reduce((sum, cg) => sum + cg.coverage_percentage, 0) / categoryGuidances.length)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>

            {/* Epic Neural Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Categories Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{categories.length}</div>
                      <div className="text-xs text-purple-300 font-medium">NEURAL CATEGORIES</div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-full">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Requirements Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{requirements.length}</div>
                      <div className="text-xs text-green-300 font-medium">REQUIREMENTS</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300">{requirements.filter(r => r.ai_guidance).length} with AI guidance</span>
                  </div>
                </div>
              </div>

              {/* Knowledge Sources Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{knowledgeSources.length}</div>
                      <div className="text-xs text-blue-300 font-medium">KNOWLEDGE NODES</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="text-blue-300">{knowledgeSources.filter(s => s.status === 'completed').length} active</span>
                  </div>
                </div>
              </div>

              {/* Coverage Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">
                        {requirements.length > 0 ? Math.round((requirements.filter(r => r.ai_guidance).length / requirements.length) * 100) : 0}%
                      </div>
                      <div className="text-xs text-pink-300 font-medium">AI COVERAGE</div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-pink-500/30 to-rose-600/30 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${requirements.length > 0 ? Math.round((requirements.filter(r => r.ai_guidance).length / requirements.length) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Comprehensive Guidance Previews */}
            <div className="space-y-6">
              {/* Epic Comprehensive Guidance Header */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Comprehensive Guidance</h3>
                      <p className="text-xs text-cyan-300">All-frameworks unified guidance previews</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{categoryGuidances.length}</div>
                      <div className="text-xs text-cyan-300">Categories</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {categoryGuidances.reduce((sum, cg) => sum + cg.frameworks_included.length, 0)}
                      </div>
                      <div className="text-xs text-cyan-300">Frameworks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {categoryGuidances.length > 0 ? Math.round(categoryGuidances.reduce((sum, cg) => sum + cg.coverage_percentage, 0) / categoryGuidances.length) : 0}%
                      </div>
                      <div className="text-xs text-cyan-300">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHASE 1: Search and Filter Interface */}
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="with_guidance">With Guidance</option>
                        <option value="pending_suggestions">Pending Enhancement</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-300">
                      Showing {filteredCategories.length} of {categories.length} categories
                    </span>
                    <span className="text-purple-300">
                      {filteredCategories.filter(cat => categoryGuidances.find(cg => cg.category_id === cat.id)).length} with AI guidance
                    </span>
                  </div>
                </div>
              </div>

              {/* PHASE 1: Enhanced Category Container */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-15"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl">
                  {/* Header */}
                  <div className="p-4 border-b border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">Category Management</h4>
                      <div className="text-xs text-purple-300">
                        🎯 Click any category to load unified guidance
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Categories */}
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                    {filteredCategories.map((category, index) => {
                  const guidance = categoryGuidances.find(cg => cg.category_id === category.id);
                  const categoryRequirements = requirements.filter(r => r.category_id === category.id);
                  
                  return (
                    <div key={category.id} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                      <div 
                        className={`relative bg-black/50 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                          selectedCategoryGuidance?.category_id === category.id
                            ? 'border-purple-400/60 bg-purple-500/10'
                            : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        onClick={async () => {
                          // Set selected category
                          setActiveCategory(category);
                          
                          // Set guidance if exists
                          if (guidance) {
                            setSelectedCategoryGuidance(guidance);
                          } else {
                            // Clear previous guidance and attempt to load new
                            setSelectedCategoryGuidance(null);
                            
                            if (organization) {
                              console.log(`🔄 Loading unified guidance for category: ${category.name}`);
                              try {
                                const freshGuidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
                                const categoryGuidance = freshGuidances.find(cg => cg.category_id === category.id);
                                if (categoryGuidance) {
                                  setSelectedCategoryGuidance(categoryGuidance);
                                  setCategoryGuidances(freshGuidances);
                                  console.log(`✅ Loaded guidance for ${category.name}`);
                                } else {
                                  console.log(`⚠️ No guidance found for ${category.name}`);
                                }
                              } catch (error) {
                                console.error('Error loading category guidance:', error);
                              }
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">{category.name}</h4>
                            <p className="text-xs text-gray-300">{categoryRequirements.length} requirements</p>
                          </div>
                          {guidance && (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                guidance.coverage_percentage >= 80 ? 'bg-green-400' :
                                guidance.coverage_percentage >= 60 ? 'bg-yellow-400' :
                                'bg-red-400'
                              } animate-pulse`}></div>
                              <span className="text-xs text-white font-medium">{guidance.coverage_percentage}%</span>
                            </div>
                          )}
                        </div>

                        {guidance ? (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                              {guidance.comprehensive_guidance.slice(0, 150)}...
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {guidance.key_topics.slice(0, 3).map((topic, index) => (
                                <Badge key={index} className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              {guidance.frameworks_included.length > 0 && (
                                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs">
                                  {guidance.frameworks_included.length} frameworks
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              Updated: {new Date(guidance.last_generated).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-xs text-gray-400 mb-2">No sub-requirements guidance yet</div>
                            <div className="text-xs text-purple-300">Select a category to begin editing</div>
                          </div>
                        )}
                        
                        {selectedCategoryGuidance?.category_id === category.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Comprehensive Guidance Viewer */}
            <div className="space-y-6">
              {/* PHASE 2: Triple URL Input System - Above Content Viewer */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Authoritative URL Ingestion</h3>
                      <p className="text-xs text-purple-300">Add up to 3 expert sources to enhance unified guidance</p>
                    </div>
                  </div>
                  
                  {/* Three URL Input Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">1</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.nist.gov/cybersecurity-framework"
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">2</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://csrc.nist.gov/publications/detail/sp/800-53"
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">3</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.cisa.gov/cybersecurity-best-practices"
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* URL Processing Status */}
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-xs text-purple-200 mb-2">URL Processing Workflow:</div>
                    <div className="text-xs text-gray-300">1. Admin inputs authoritative URLs above</div>
                    <div className="text-xs text-gray-300">2. AI processes and validates content</div>
                    <div className="text-xs text-gray-300">3. Admin reviews and approves sub-requirement enhancements</div>
                  </div>
                  
                  {/* Processing Status */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-purple-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Ready to process authoritative sources</span>
                  </div>
                </div>
              </div>

              {activeCategory ? (
                <>
                  {/* Epic Category Details */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{activeCategory.name}</h3>
                          <p className="text-xs text-purple-300">
                            {selectedCategoryGuidance ? 'Comprehensive all-frameworks guidance' : 'Ready for URL enhancement'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? `${selectedCategoryGuidance.coverage_percentage}%` : '0%'}
                          </div>
                          <div className="text-xs text-purple-300">Coverage</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? selectedCategoryGuidance.frameworks_included.length : 0}
                          </div>
                          <div className="text-xs text-purple-300">Frameworks</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? `${Math.round(selectedCategoryGuidance.confidence_score * 100)}%` : 'N/A'}
                          </div>
                          <div className="text-xs text-purple-300">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? selectedCategoryGuidance.total_requirements : requirements.filter(r => r.category_id === activeCategory.id).length}
                          </div>
                          <div className="text-xs text-purple-300">Requirements</div>
                        </div>
                      </div>

                      {/* Frameworks Included */}
                      {selectedCategoryGuidance ? (
                        <div className="mb-4">
                          <h4 className="text-xs text-purple-300 mb-2">🌐 Frameworks Included:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategoryGuidance.frameworks_included.map((framework, index) => (
                              <Badge key={index} className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 text-center py-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-yellow-300 text-sm mb-2">⚠️ No guidance generated yet</div>
                          <div className="text-xs text-gray-400">Input URLs above and process with AI to generate guidance</div>
                        </div>
                      )}

                      {/* Key Topics */}
                      {selectedCategoryGuidance && selectedCategoryGuidance.key_topics.length > 0 && (
                        <div>
                          <h4 className="text-xs text-purple-300 mb-2">🎯 Key Topics:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategoryGuidance.key_topics.map((topic, index) => (
                              <Badge key={index} className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Epic Comprehensive Guidance Content */}
                  {selectedCategoryGuidance ? (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-black/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Comprehensive Guidance</h3>
                              <p className="text-xs text-indigo-300">Maximum framework coverage analysis</p>
                            </div>
                          </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      {/* Guidance Content */}
                      <div className="relative p-6 bg-black/40 rounded-xl border border-indigo-500/10 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/50">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <div 
                          className="text-sm leading-relaxed text-gray-200 prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: selectedCategoryGuidance.comprehensive_guidance.replace(/\n/g, '<br/>') 
                          }}
                        />
                      </div>

                      {/* Implementation Steps */}
                      {selectedCategoryGuidance.implementation_steps.length > 0 && (
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10">
                          <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Implementation Steps
                          </h4>
                          <div className="space-y-2">
                            {selectedCategoryGuidance.implementation_steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="text-xs text-gray-300 leading-relaxed">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compliance Notes */}
                      {selectedCategoryGuidance.compliance_notes.length > 0 && (
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10">
                          <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Framework Compliance Notes
                          </h4>
                          <div className="space-y-2">
                            {selectedCategoryGuidance.compliance_notes.map((note, index) => (
                              <div key={index} className="text-xs text-gray-300 leading-relaxed">
                                • {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generation Info */}
                      <div className="mt-4 pt-4 border-t border-indigo-500/10 text-xs text-gray-400">
                        Generated: {new Date(selectedCategoryGuidance.last_generated).toLocaleString()} • 
                        Confidence: {Math.round(selectedCategoryGuidance.confidence_score * 100)}% • 
                        Frameworks: {selectedCategoryGuidance.frameworks_included.length}
                      </div>
                    </div>
                  </div>
                  ) : null}
                </>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 via-slate-600 to-gray-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-6">
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Comprehensive Guidance Viewer</h3>
                      <p className="text-gray-300 mb-4">
                        Select a category from the left to view comprehensive guidance
                      </p>
                      <p className="text-xs text-gray-400">
                        📚 All-frameworks unified guidance with maximum coverage
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
