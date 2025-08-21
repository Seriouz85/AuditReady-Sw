import { useState, useEffect, useCallback } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  RefreshCw,
  CheckCircle,
  Clock,
  Shield,
  Search,
  FileText,
  Target,
  X,
  Sparkles,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';

// Types for unified guidance validation
interface UnifiedCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  icon?: string;
  is_active: boolean;
  frameworks?: string[];
}

interface CategoryGuidance {
  id: string;
  category_id: string;
  category_name: string;
  unified_guidance: string;
  coverage_percentage: number;
  quality_score: number;
  framework_coverage: { [framework: string]: number };
  improvement_suggestions: string[];
  created_at: string;
  updated_at: string;
}

interface GuidanceValidationResult {
  category_id: string;
  category_name: string;
  overall_quality_score: number;
  overall_coverage: number;
  guidance_completeness: number;
  framework_alignment: number;
  recommendations: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  framework_analysis: {
    framework: string;
    coverage: number;
    gaps: string[];
    recommendations: string[];
  }[];
}

export default function CISOGuidanceValidationDashboard() {
  const { user, organization, isPlatformAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Framework selection
  const [selectedFrameworks] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: true,
    nis2: true
  });
  
  // Load compliance mapping data
  const { data: complianceMappings, isLoading: isLoadingMappings } = useComplianceMappingData(selectedFrameworks);

  // Main state
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<UnifiedCategory | null>(null);
  const [categoryGuidance, setCategoryGuidance] = useState<CategoryGuidance | null>(null);
  const [validationResult, setValidationResult] = useState<GuidanceValidationResult | null>(null);
  const [aiAnalysisInProgress, setAiAnalysisInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Category icon helper
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Information Security Governance': '🏛️',
      'Information Security Organisation': '🏢', 
      'Human Resource Security': '👥',
      'Asset Management': '📋',
      'Access Control': '🔐',
      'Cryptography': '🔒',
      'Physical and Environmental Security': '🏗️',
      'Operations Security': '⚙️',
      'Communications Security': '📡',
      'System Acquisition': '🛒',
      'Supplier Relationships': '🤝',
      'Information Security Incident Management': '🚨',
      'Information Security in Business Continuity': '🔄',
      'Compliance': '✅'
    };
    return iconMap[categoryName] || '📁';
  };

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    
    try {
      if (complianceMappings && complianceMappings.length > 0) {
        const processedCategories: UnifiedCategory[] = complianceMappings.map((mapping, index) => ({
          id: `category-${index}`,
          name: mapping.category || `Category ${index + 1}`,
          description: `Unified guidance validation for ${mapping.category || 'category'}`,
          sort_order: index,
          icon: getCategoryIcon(mapping.category),
          is_active: true,
          frameworks: Object.keys(mapping.frameworks || {})
        }));

        setCategories(processedCategories);
        console.log(`✅ Loaded ${processedCategories.length} guidance categories`);
      }
    } catch (error) {
      console.error('❌ Error loading guidance data:', error);
    } finally {
      setLoading(false);
    }
  }, [complianceMappings]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load guidance for selected category
  const loadCategoryGuidance = async (category: UnifiedCategory) => {
    try {
      setActiveCategory(category);
      
      // Mock comprehensive guidance data
      const mockGuidance: CategoryGuidance = {
        id: `guidance-${category.id}`,
        category_id: category.id,
        category_name: category.name,
        unified_guidance: `Comprehensive implementation guidance for ${category.name}. This category encompasses critical security controls and processes that organizations must implement to maintain effective information security management. The guidance covers policy development, risk assessment procedures, control implementation, monitoring activities, and continuous improvement processes.`,
        coverage_percentage: Math.random() * 20 + 80,
        quality_score: Math.random() * 20 + 80,
        framework_coverage: {
          'ISO 27001': Math.random() * 20 + 80,
          'ISO 27002': Math.random() * 20 + 80,
          'CIS Controls': Math.random() * 30 + 70,
          'GDPR': Math.random() * 25 + 75,
          'NIS2': Math.random() * 25 + 75
        },
        improvement_suggestions: [
          `Enhance ${category.name} documentation completeness`,
          'Improve cross-framework alignment',
          'Strengthen implementation examples',
          'Add risk-based considerations'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCategoryGuidance(mockGuidance);
      console.log(`✅ Loaded guidance for ${category.name}`);
      
    } catch (error) {
      console.error('❌ Error loading category guidance:', error);
      setCategoryGuidance(null);
    }
  };

  // Perform AI validation analysis (category-level)
  const performAIValidationAnalysis = async () => {
    if (!activeCategory || !isPlatformAdmin) return;

    setAiAnalysisInProgress(true);
    setValidationResult(null);

    try {
      console.log('🔍 Starting AI guidance validation for category:', activeCategory.name);

      // Mock comprehensive validation analysis
      const mockValidation: GuidanceValidationResult = {
        category_id: activeCategory.id,
        category_name: activeCategory.name,
        overall_quality_score: Math.random() * 20 + 80,
        overall_coverage: Math.random() * 15 + 85,
        guidance_completeness: Math.random() * 25 + 75,
        framework_alignment: Math.random() * 20 + 80,
        recommendations: {
          high_priority: [
            `Strengthen ${activeCategory.name} implementation guidance`,
            'Improve framework cross-references',
            'Enhance risk assessment integration'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          medium_priority: [
            'Add practical implementation examples',
            'Include common pitfalls and solutions',
            'Expand monitoring and measurement guidance'
          ].slice(0, Math.floor(Math.random() * 2) + 1),
          low_priority: [
            'Improve formatting consistency',
            'Add reference links',
            'Update terminology alignment'
          ].slice(0, Math.floor(Math.random() * 2) + 1)
        },
        framework_analysis: [
          {
            framework: 'ISO 27001',
            coverage: Math.random() * 20 + 80,
            gaps: ['Control implementation details', 'Measurement criteria'],
            recommendations: ['Enhance control descriptions', 'Add measurement examples']
          },
          {
            framework: 'ISO 27002',
            coverage: Math.random() * 25 + 75,
            gaps: ['Implementation guidance depth', 'Related controls mapping'],
            recommendations: ['Expand implementation details', 'Improve control relationships']
          },
          {
            framework: 'CIS Controls',
            coverage: Math.random() * 30 + 70,
            gaps: ['Technical implementation steps', 'Automation guidance'],
            recommendations: ['Add technical details', 'Include automation examples']
          },
          {
            framework: 'GDPR',
            coverage: Math.random() * 20 + 80,
            gaps: ['Privacy impact considerations', 'Data processing alignment'],
            recommendations: ['Integrate privacy requirements', 'Add data protection guidance']
          },
          {
            framework: 'NIS2',
            coverage: Math.random() * 25 + 75,
            gaps: ['Incident response alignment', 'Supply chain considerations'],
            recommendations: ['Enhance incident procedures', 'Add supplier requirements']
          }
        ]
      };

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2500));

      setValidationResult(mockValidation);
      console.log('✅ AI guidance validation complete');

    } catch (error) {
      console.error('❌ AI guidance validation failed:', error);
    } finally {
      setAiAnalysisInProgress(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading || isLoadingMappings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AdminNavigation />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-white mb-2">Initializing Guidance Validation</h2>
            <p className="text-purple-300 mb-4">Loading AI-powered guidance analysis...</p>
            {isPlatformAdmin && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300">Platform Admin Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminNavigation />
      
      {/* FIXED: Two-column layout - NO gaps, equal height, CISO-ready */}
      <div className="ml-64 grid grid-cols-2 h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Column - Category Selection Panel - FULL HEIGHT */}
        <div className="h-full bg-black/60 backdrop-blur-xl border-r border-purple-500/20 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Guidance Categories</h2>
            <p className="text-gray-400">Select a category for comprehensive guidance validation</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeCategory?.id === category.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/40'
                    : 'bg-black/40 border-gray-600/30 hover:border-purple-500/40 hover:bg-purple-500/10'
                }`}
                onClick={() => loadCategoryGuidance(category)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{category.description}</p>
                  </div>
                </div>
                
                {activeCategory?.id === category.id && categoryGuidance && (
                  <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="text-center p-2 bg-black/30 rounded-lg">
                        <div className="text-white font-semibold">{Math.round(categoryGuidance.coverage_percentage)}%</div>
                        <div className="text-gray-400">Coverage</div>
                      </div>
                      <div className="text-center p-2 bg-black/30 rounded-lg">
                        <div className="text-white font-semibold">{Math.round(categoryGuidance.quality_score)}%</div>
                        <div className="text-gray-400">Quality</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-300">
                      <CheckCircle className="w-3 h-3" />
                      <span>Active - Guidance Loaded</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Category Content Viewer - FULL HEIGHT */}
        <div className="h-full bg-black/60 backdrop-blur-xl overflow-y-auto p-6">
          {activeCategory ? (
            <div className="space-y-6">
              {/* Category Header */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{activeCategory.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{activeCategory.name}</h3>
                        <p className="text-emerald-300 text-base">
                          Comprehensive guidance validation and analysis
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={performAIValidationAnalysis}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3"
                        disabled={aiAnalysisInProgress}
                      >
                        {aiAnalysisInProgress ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Validating Guidance...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            AI Validate Guidance
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Category Statistics */}
                  {categoryGuidance && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                        <div className="text-2xl font-bold text-white">{Math.round(categoryGuidance.coverage_percentage)}%</div>
                        <div className="text-sm text-emerald-300">Coverage</div>
                      </div>
                      <div className="text-center p-4 bg-black/40 rounded-xl border border-blue-500/10">
                        <div className="text-2xl font-bold text-blue-400">{Math.round(categoryGuidance.quality_score)}%</div>
                        <div className="text-sm text-blue-300">Quality Score</div>
                      </div>
                      <div className="text-center p-4 bg-black/40 rounded-xl border border-purple-500/10">
                        <div className="text-2xl font-bold text-purple-400">{Object.keys(categoryGuidance.framework_coverage).length}</div>
                        <div className="text-sm text-purple-300">Frameworks</div>
                      </div>
                      <div className="text-center p-4 bg-black/40 rounded-xl border border-yellow-500/10">
                        <div className="text-2xl font-bold text-yellow-400">{categoryGuidance.improvement_suggestions.length}</div>
                        <div className="text-sm text-yellow-300">Improvements</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Validation Results */}
              {validationResult && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <Brain className="w-6 h-6 text-purple-400" />
                      AI Validation Results
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h5 className="text-lg font-semibold text-purple-300 mb-3">High Priority</h5>
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                          {validationResult.recommendations.high_priority.length}
                        </div>
                        <p className="text-sm text-gray-300">Critical improvements needed</p>
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-purple-300 mb-3">Overall Score</h5>
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {Math.round(validationResult.overall_quality_score)}%
                        </div>
                        <p className="text-sm text-gray-300">Quality assessment</p>
                      </div>
                    </div>

                    {/* Category Assessment */}
                    <div className="bg-black/30 rounded-xl p-4 mb-4">
                      <h5 className="text-lg font-semibold text-white mb-3">Guidance Assessment</h5>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        This category guidance demonstrates {validationResult.overall_quality_score >= 80 ? 'strong' : validationResult.overall_quality_score >= 60 ? 'adequate' : 'limited'} alignment with compliance frameworks. 
                        Coverage stands at {Math.round(validationResult.overall_coverage)}% with a quality score of {Math.round(validationResult.overall_quality_score)}%. 
                        {validationResult.recommendations.high_priority.length > 0 ? 
                          `${validationResult.recommendations.high_priority.length} high-priority improvements have been identified for immediate attention.` :
                          'The guidance meets current standards with only minor optimizations suggested.'
                        }
                      </p>
                      
                      {/* Priority Recommendations */}
                      {validationResult.recommendations.high_priority.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-orange-300">Priority Actions:</h6>
                          <ul className="space-y-1">
                            {validationResult.recommendations.high_priority.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-orange-400 text-xs mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Framework Analysis */}
                    <div className="mb-4">
                      <h5 className="text-lg font-semibold text-white mb-3">Framework Coverage</h5>
                      <div className="space-y-3">
                        {validationResult.framework_analysis.map((analysis, index) => (
                          <div key={index} className="p-3 bg-black/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{analysis.framework}</span>
                              <div className="flex items-center gap-3">
                                <div className={`text-sm font-semibold ${analysis.coverage >= 80 ? 'text-green-400' : analysis.coverage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {Math.round(analysis.coverage)}%
                                </div>
                                <div className={`w-3 h-3 rounded-full ${analysis.coverage >= 80 ? 'bg-green-500' : analysis.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                              </div>
                            </div>
                            {analysis.gaps.length > 0 && (
                              <div className="text-xs text-gray-400">
                                Gaps: {analysis.gaps.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                      <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Guidance
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 font-semibold"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Reject Guidance
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Guidance Display */}
              {categoryGuidance && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-15"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Current Guidance
                    </h4>
                    <div className="bg-black/30 rounded-xl p-4 mb-4">
                      <p className="text-gray-300 leading-relaxed">{categoryGuidance.unified_guidance}</p>
                    </div>
                    
                    {/* Framework Coverage Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(categoryGuidance.framework_coverage).map(([framework, coverage]) => (
                        <div key={framework} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                          <span className="text-sm text-white">{framework}</span>
                          <Badge variant={coverage >= 80 ? "default" : coverage >= 60 ? "secondary" : "destructive"}>
                            {Math.round(coverage)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Category Selected State */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-4">No Category Selected</h3>
                <p className="text-gray-400">Select a category from the left panel to view guidance validation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}