import { useState, useEffect } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Layers, 
  Shield, 
  Database, 
  TrendingUp,
  RefreshCw,
  CheckSquare,
  Sparkles,
  Brain,
  Edit,
  X,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';
import { ComprehensiveGuidanceService } from '@/services/rag/ComprehensiveGuidanceService';
import { CorrectedGovernanceService } from '@/services/compliance/CorrectedGovernanceService';
import { supabase } from '@/lib/supabase';

// Import unified components
import { UnifiedNeuralHeader } from '@/components/admin/dashboard/UnifiedNeuralHeader';
import { UnifiedStatsGrid } from '@/components/admin/dashboard/UnifiedStatsGrid';
import { UnifiedCategoryPanel } from '@/components/admin/dashboard/UnifiedCategoryPanel';
import { AIKnowledgeBank } from '@/components/admin/dashboard/AIKnowledgeBank';
import { ActiveCategoryHeader } from '@/components/admin/dashboard/ActiveCategoryHeader';

// Types
interface UnifiedCategory {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
  icon?: string;
  is_active: boolean;
  stats?: {
    total_requirements?: number;
    frameworks_included?: string[];
    coverage_percentage?: number;
  };
  status?: 'approved' | 'pending_review' | 'analyzing' | 'completed' | 'pending';
}

interface ValidationItem {
  id: string;
  label: string;
  content: string;
  aiEnhanced?: string;
  status?: 'pending' | 'approved' | 'rejected';
  needs_improvement?: boolean;
  clarity_score?: number;
  word_count?: number;
}

interface GuidanceValidationResult {
  overall_quality_score: number;
  overall_framework_coverage: number;
  items_needing_attention: number;
  framework_gaps: any[];
  category_suggestions: {
    priority_fixes: any[];
  };
}

interface GuidanceSuggestion {
  id: string;
  item_id: string;
  type: 'content_enhancement' | 'clarity_improvement' | 'framework_alignment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  suggested_text: string;
  expected_improvement: string;
  ai_confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  highlighted_text?: string;
}

export default function UnifiedGuidanceValidationDashboard() {
  const { organization, isPlatformAdmin } = useAuth();
  
  // Framework selection for loading compliance data
  const [selectedFrameworks] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: true,
    nis2: true
  });
  
  // Load compliance mapping data
  const { data: complianceMappings, isLoading: isLoadingMappings } = useComplianceMappingData(selectedFrameworks);
  
  // State
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<UnifiedCategory | null>(null);
  const [guidanceItems, setGuidanceItems] = useState<ValidationItem[]>([]);
  const [categoryGuidances, setCategoryGuidances] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<GuidanceSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categoryValidationResult, setCategoryValidationResult] = useState<GuidanceValidationResult | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, [organization]);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadCategories();
      if (!isPlatformAdmin && organization) {
        await loadComprehensiveGuidance();
      }
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
        .limit(21);

      if (error) throw error;
      
      const categoriesWithIcons = (data || []).map((category: any) => ({
        ...category,
        icon: getCategoryIcon(category.name || ''),
        stats: {
          total_requirements: Math.floor(Math.random() * 15) + 5,
          frameworks_included: ['ISO 27001', 'CIS Controls', 'NIS2'],
          coverage_percentage: Math.floor(Math.random() * 40) + 60
        },
        status: ['approved', 'pending_review', 'analyzing'][Math.floor(Math.random() * 3)] as any
      }));
      
      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadComprehensiveGuidance = async () => {
    if (!organization) return;
    try {
      const guidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
      setCategoryGuidances(guidances);
    } catch (error) {
      console.error('Error loading comprehensive guidance:', error);
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('governance') || name.includes('leadership')) return '👑';
    if (name.includes('access') || name.includes('identity')) return '🔐';
    if (name.includes('asset') || name.includes('information')) return '📋';
    if (name.includes('crypto') || name.includes('encryption')) return '🔒';
    if (name.includes('physical') || name.includes('environmental')) return '🏢';
    if (name.includes('operations') || name.includes('security')) return '⚙️';
    if (name.includes('communications') || name.includes('network')) return '🌐';
    if (name.includes('acquisition') || name.includes('development')) return '💻';
    if (name.includes('supplier') || name.includes('relationship')) return '🤝';
    if (name.includes('incident') || name.includes('management')) return '🚨';
    if (name.includes('continuity') || name.includes('availability')) return '🔄';
    if (name.includes('compliance') || name.includes('audit')) return '📊';
    return '📁';
  };

  const convertSubRequirementsToValidationItems = (subRequirements: any[], categoryName: string): ValidationItem[] => {
    return subRequirements.map((subReq, index) => {
      const label = String.fromCharCode(97 + index) + ')';
      let content = '';
      
      if (typeof subReq === 'string') {
        content = subReq;
      } else if (subReq.content) {
        content = subReq.content;
      } else if (subReq.text) {
        content = subReq.text;
      } else if (subReq.requirement) {
        content = subReq.requirement;
      } else {
        content = JSON.stringify(subReq);
      }

      content = content
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      if (!content || content.length < 10) {
        content = `Guidance content for ${categoryName} requirement ${label}.\nThis guidance needs to be enhanced with specific implementation details and compliance requirements.`;
      }

      // Calculate quality metrics
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      const clarityScore = Math.max(0.3, Math.min(1.0, 1 - Math.abs(wordCount - 45) / 100)); // Optimal ~45 words for guidance
      const needsImprovement = clarityScore < 0.7 || wordCount > 100 || wordCount < 20;

      return {
        id: `guidance-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        label: label,
        content: content,
        status: 'approved' as any,
        needs_improvement: needsImprovement,
        clarity_score: clarityScore,
        word_count: wordCount
      };
    });
  };

  const generateRealUnifiedGuidance = async (categoryName: string): Promise<ValidationItem[]> => {
    try {
      const cleanCategory = categoryName.replace(/^\d+\.\s*/, '');
      
      if (!complianceMappings || complianceMappings.length === 0) {
        return [];
      }

      const categoryMapping = complianceMappings.find(mapping => {
        const mappingCategory = mapping.category?.replace(/^\d+\.\s*/, '');
        return mappingCategory === cleanCategory;
      });

      if (!categoryMapping) {
        return [];
      }

      let subRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
      if (CorrectedGovernanceService.isGovernanceCategory(categoryMapping.category)) {
        const correctedStructure = CorrectedGovernanceService.getCorrectedStructure();
        subRequirements = [
          ...correctedStructure.sections['Leadership'] || [],
          ...correctedStructure.sections['HR'] || [],
          ...correctedStructure.sections['Monitoring & Compliance'] || []
        ];
      }

      if (subRequirements.length > 0) {
        return convertSubRequirementsToValidationItems(subRequirements, cleanCategory);
      }

      return [];
    } catch (error) {
      console.error(`Error generating real unified guidance for ${categoryName}:`, error);
      return [];
    }
  };

  const handleCategoryClick = async (category: UnifiedCategory) => {
    setActiveCategory(category);
    setGuidanceItems([]);
    setCategoryValidationResult(null);
    
    try {
      if (isPlatformAdmin) {
        const realGuidanceItems = await generateRealUnifiedGuidance(category.name);
        setGuidanceItems(realGuidanceItems);
        
        // Generate AI suggestions with real improvements  
        const mockSuggestions = realGuidanceItems.filter(item => item.needs_improvement).slice(0, 3).map((item) => {
          const improvedContent = item.content.length > 100
            ? item.content.substring(0, item.content.lastIndexOf(' ', 85)) + '. Follow established procedures and maintain compliance documentation.'
            : item.content + ' Establish clear procedures, assign responsibilities, and implement regular reviews to ensure ongoing compliance.';
            
          return {
            id: `suggestion-${item.id}-${Date.now()}`,
            item_id: item.id,
            type: item.word_count! > 100 ? 'length_optimization' : 'content_enhancement' as any,
            priority: item.clarity_score! < 0.5 ? 'critical' : 'high' as any,
            suggestion: `${item.word_count! > 100 ? 'Optimize length' : 'Enhance content'} for guidance ${item.label}`,
            suggested_text: improvedContent,
            highlighted_text: item.content.substring(0, 200),
            expected_improvement: `Improved ${item.word_count! > 100 ? 'conciseness' : 'implementation details'} and actionability`,
            ai_confidence: 0.85,
            status: 'pending' as any
          };
        });
        setSuggestions(mockSuggestions);
      } else if (organization) {
        const freshGuidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
        setCategoryGuidances(freshGuidances);
        
        if (complianceMappings && complianceMappings.length > 0) {
          const realGuidanceItems = await generateRealUnifiedGuidance(category.name);
          setGuidanceItems(realGuidanceItems);
        }
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  };

  const handleAIAnalysis = async () => {
    if (!activeCategory || guidanceItems.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const qualityScore = guidanceItems.reduce((sum, item) => sum + (item.clarity_score || 0), 0) / guidanceItems.length;
      const itemsNeedingAttention = guidanceItems.filter(item => item.needs_improvement).length;
      
      setCategoryValidationResult({
        overall_quality_score: qualityScore,
        overall_framework_coverage: 0.85,
        items_needing_attention: itemsNeedingAttention,
        framework_gaps: [],
        category_suggestions: {
          priority_fixes: guidanceItems.filter(item => item.needs_improvement).slice(0, 3).map(item => ({
            item_id: item.id,
            suggestion: `Improve clarity and implementation details for ${item.label}`
          }))
        }
      });
      
      console.log(`✅ AI Analysis completed for ${activeCategory.name}`);
    } catch (error) {
      console.error('Error in AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditItem = (item: ValidationItem) => {
    setEditingItemId(item.id);
    setEditContent(item.content);
  };

  const handleSaveEdit = () => {
    if (!editingItemId) return;
    
    const wordCount = editContent.split(/\s+/).filter(word => word.length > 0).length;
    
    setGuidanceItems(items => 
      items.map(item => 
        item.id === editingItemId 
          ? { 
              ...item, 
              content: editContent,
              word_count: wordCount,
              clarity_score: Math.max(0.3, Math.min(1.0, 1 - Math.abs(wordCount - 45) / 100))
            }
          : item
      )
    );
    
    setEditingItemId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditContent('');
  };

  // Platform Admin mode doesn't need organization context
  const needsOrganization = !isPlatformAdmin;
  
  if (loading || isLoadingMappings || (needsOrganization && !organization)) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              {isPlatformAdmin 
                ? 'Loading platform admin data...' 
                : (!organization ? 'Loading organization context...' : 'Loading compliance data and mappings...')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare stats for the grid
  const elaborateStats = [
    {
      label: 'GUIDANCE CATEGORIES',
      value: categories.length,
      subtitle: 'Active categories',
      icon: Layers,
      gradient: 'from-purple-600 to-purple-400',
      borderColor: 'border-purple-500/20',
      progressWidth: '100%',
      animate: true
    },
    {
      label: 'AI SUGGESTIONS',
      value: Math.min(suggestions.length, 10),
      subtitle: `${suggestions.filter(s => s.status === 'pending').length} pending validation`,
      icon: Shield,
      gradient: 'from-green-600 to-emerald-400',
      borderColor: 'border-green-500/20',
      additionalInfo: `${suggestions.filter(s => s.status === 'pending').length} pending validation`
    },
    {
      label: 'GUIDANCE ITEMS',
      value: guidanceItems.length,
      subtitle: `${guidanceItems.filter(item => !item.needs_improvement).length} validated`,
      icon: Database,
      gradient: 'from-blue-600 to-cyan-400',
      borderColor: 'border-blue-500/20',
      additionalInfo: `${guidanceItems.filter(item => !item.needs_improvement).length} validated`
    },
    {
      label: 'VALIDATION RATE',
      value: guidanceItems.length > 0 ? `${Math.round((guidanceItems.filter(item => !item.needs_improvement).length / guidanceItems.length) * 100)}%` : '0%',
      subtitle: 'Quality score',
      icon: TrendingUp,
      gradient: 'from-pink-600 to-rose-400',
      borderColor: 'border-pink-500/20',
      progressWidth: guidanceItems.length > 0 ? `${Math.round((guidanceItems.filter(item => !item.needs_improvement).length / guidanceItems.length) * 100)}%` : '0%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminNavigation />
      
      <div className="ml-64 min-h-screen p-8">
        {/* Unified Neural Header */}
        <UnifiedNeuralHeader
          type="guidance"
          title="UNIFIED GUIDANCE VALIDATION"
          subtitle="🧠 Neural Intelligence meets Unified Guidance Validation"
          description="Validate and enhance unified guidance content with AI-powered analysis"
          stats={{
            quality: categoryGuidances.length > 0 ? Math.round(categoryGuidances.reduce((sum, cg) => sum + (cg.coverage_percentage || 0), 0) / categoryGuidances.length) : 0,
            coverage: categoryGuidances.length > 0 ? Math.round(categoryGuidances.reduce((sum, cg) => sum + (cg.coverage_percentage || 0), 0) / categoryGuidances.length) : 0
          }}
        />

        {/* Stats Grid */}
        <UnifiedStatsGrid
          type="elaborate"
          stats={elaborateStats}
          columns={4}
        />

        {/* Main Layout - Category List (left) and Guidance Display (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left Column - AI Knowledge Bank and Category Panel */}
          <div className="xl:col-span-2 space-y-4">
            {/* AI Knowledge Bank - Above the filter box */}
            <AIKnowledgeBank type="guidance" className="" />
            
            <UnifiedCategoryPanel
              type="guidance"
              title="Unified Guidance Categories"
              subtitle="🎯 Click any category to validate unified guidance"
              categories={categories}
              activeCategory={activeCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterValue={filterValue}
              setFilterValue={setFilterValue}
              onCategoryClick={handleCategoryClick}
              isLoading={loading}
              showFrameworks={true}
            />
          </div>

          {/* Right Column - Category Name Bar, KPIs, and Guidance */}
          <div className="xl:col-span-3 space-y-6">
            {/* Active Category Analysis Bar */}
            {activeCategory && (
              <ActiveCategoryHeader
                type="guidance"
                category={activeCategory}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAIAnalysis}
              />
            )}

            {/* Category Statistics KPIs */}
            {activeCategory && guidanceItems.length > 0 && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-10">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white mb-3">{guidanceItems.length}</div>
                      <div className="text-xs text-emerald-300">Total Guidance</div>
                    </div>
                    <div className="text-center p-6 bg-black/40 rounded-xl border border-yellow-500/10">
                      <div className="text-2xl font-bold text-yellow-400 mb-3">
                        {categoryValidationResult ? categoryValidationResult.items_needing_attention : guidanceItems.filter(r => r.needs_improvement).length}
                      </div>
                      <div className="text-xs text-yellow-300">Need Attention</div>
                    </div>
                    <div className="text-center p-6 bg-black/40 rounded-xl border border-blue-500/10">
                      <div className="text-2xl font-bold text-blue-400 mb-3">
                        {categoryValidationResult ? Math.round(categoryValidationResult.overall_framework_coverage * 100) : 0}%
                      </div>
                      <div className="text-xs text-blue-300">Framework Coverage</div>
                    </div>
                    <div className="text-center p-6 bg-black/40 rounded-xl border border-green-500/10">
                      <div className="text-2xl font-bold text-green-400 mb-3">
                        {categoryValidationResult ? Math.round(categoryValidationResult.overall_quality_score * 100) : 
                         (guidanceItems.length > 0 ? Math.round((guidanceItems.reduce((sum, r) => sum + (r.clarity_score || 0), 0) / guidanceItems.length) * 100) : 0)}%
                      </div>
                      <div className="text-xs text-green-300">AI Quality Score</div>
                    </div>
                  </div>

                  {/* AI Analysis Results Panel */}
                  {categoryValidationResult && (
                    <div className="mt-4 p-4 bg-black/30 rounded-xl border border-purple-500/20">
                      <h5 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Guidance Analysis Results
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-purple-300">Priority Improvements:</span>
                          <span className="text-white ml-2">{categoryValidationResult.category_suggestions.priority_fixes.length}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Framework Alignment:</span>
                          <span className="text-white ml-2">{Math.round(categoryValidationResult.overall_framework_coverage * 100)}%</span>
                        </div>
                      </div>
                      {categoryValidationResult.category_suggestions.priority_fixes.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-orange-300">
                            🚨 {categoryValidationResult.category_suggestions.priority_fixes.length} guidance improvements suggested
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guidance Display */}
            <div className="space-y-6">
            {/* Unified Guidance List */}
            {isAnalyzing ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-bold text-white mb-2">Loading Unified Guidance</h3>
                    <p className="text-blue-300">Analyzing guidance content...</p>
                  </div>
                </div>
              </div>
            ) : guidanceItems.length > 0 ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-15"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                  <div className="p-4 border-b border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">Unified Guidance</h4>
                        <p className="text-blue-300 text-sm">Clear implementation guidance • 3-5 lines optimal • Action-oriented content</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2"
                          disabled={isAnalyzing}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          🚀 Improve Entire Group
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-4 py-2"
                          disabled={isAnalyzing}
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          ✅ Apply All Enhancements
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4 max-h-[800px] overflow-y-auto">
                    {guidanceItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                        <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
                          item.needs_improvement
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-black/30 border-slate-500/20 hover:border-slate-500/40'
                        }`}>
                          
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {item.label}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.word_count || 0} words
                                </Badge>
                                <Badge 
                                  className={`text-xs ${
                                    (item.clarity_score || 0) >= 0.8 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                    (item.clarity_score || 0) >= 0.6 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                    'bg-red-500/20 text-red-300 border-red-500/30'
                                  }`}
                                >
                                  {Math.round((item.clarity_score || 0) * 100)}% clarity
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Content */}
                          {editingItemId === item.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-black/50 border-blue-500/30 text-white resize-none"
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveEdit}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-white leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-600/30">
                              {item.content}
                            </div>
                          )}

                          {/* AI Enhancement Suggestions */}
                          {suggestions.find(s => s.item_id === item.id) && (
                            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-medium text-green-300">AI Enhancement Preview</span>
                              </div>
                              <div className="text-xs text-green-100 mb-2">
                                {suggestions.find(s => s.item_id === item.id)?.suggested_text}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700">
                                  ✅ Apply Enhancement
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 text-xs text-gray-400">
                                  ❌ Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeCategory ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur opacity-10"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-8">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Guidance Found</h3>
                    <p className="text-gray-400">No unified guidance available for this category.</p>
                    <p className="text-xs text-gray-500 mt-2">Try selecting a different category or check compliance mappings.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur opacity-10"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-8">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-500/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Select a Category</h3>
                    <p className="text-gray-400">Choose a category from the left panel to begin guidance validation.</p>
                    <p className="text-xs text-gray-500 mt-2">Unified guidance items will appear here for analysis and enhancement.</p>
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