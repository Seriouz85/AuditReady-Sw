import React, { useState, useEffect, useCallback } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare,
  AlertTriangle,
  Eye,
  Shield,
  Brain,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';
import { UnifiedRequirementsAnalysisService } from '@/services/analysis/UnifiedRequirementsAnalysisService';

export default function UnifiedRequirementsValidationDashboard() {
  const { user, isPlatformAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  
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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFramework, setFilterFramework] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadInitialDataCallback = useCallback(async () => {
    setLoading(true);
    try {
      if (complianceMappings && complianceMappings.length > 0) {
        console.log('📊 Loading unified requirements validation data...', {
          mappingsCount: complianceMappings.length,
          isPlatformAdmin
        });
        
        // Process compliance mappings into categories using the advanced analysis service
        const processedCategories = await Promise.all(
          complianceMappings.map(async (mapping, index) => {
            try {
              // Use advanced analysis service for quick assessment
              const quickAssessment = await UnifiedRequirementsAnalysisService.quickAssessCategory(mapping);
              
              return {
                id: mapping.id || `category-${index}`,
                name: mapping.category || `Category ${index + 1}`,
                unified_requirements_count: mapping.auditReadyUnified?.subRequirements?.length || 0,
                framework_mappings: extractFrameworkMappings(mapping),
                coverage_score: quickAssessment.coverage_score,
                quality_score: quickAssessment.quality_score,
                gap_count: quickAssessment.gap_count,
                last_validated: null,
                needs_attention: quickAssessment.needs_attention,
                mapping_data: mapping // Store original mapping for detailed analysis
              };
            } catch (error) {
              console.warn(`Failed to analyze category ${mapping.category}:`, error);
              // Fallback to simple analysis
              return {
                id: mapping.id || `category-${index}`,
                name: mapping.category || `Category ${index + 1}`,
                unified_requirements_count: mapping.auditReadyUnified?.subRequirements?.length || 0,
                framework_mappings: extractFrameworkMappings(mapping),
                coverage_score: calculateCoverageScore(mapping),
                quality_score: calculateQualityScore(mapping),
                gap_count: identifyGaps(mapping),
                last_validated: null,
                needs_attention: calculateCoverageScore(mapping) < 0.8 || identifyGaps(mapping) > 0,
                mapping_data: mapping
              };
            }
          })
        );

        setCategories(processedCategories);
        console.log(`✅ Processed ${processedCategories.length} categories for validation with advanced analysis`);
      }
    } catch (error) {
      console.error('Error loading validation data:', error);
    } finally {
      setLoading(false);
    }
  }, [complianceMappings, isPlatformAdmin]);

  useEffect(() => {
    loadInitialDataCallback();
  }, [loadInitialDataCallback]);

  const loadInitialData = loadInitialDataCallback;

  // Helper functions for analysis
  const extractFrameworkMappings = (mapping: any) => {
    const frameworks = {
      iso27001: mapping.iso27001Controls?.length || 0,
      nistCsf: mapping.nistCsfCategories?.length || 0,
      cisControls: mapping.cisControls?.length || 0,
      nis2: mapping.nis2Articles?.length || 0,
      gdpr: mapping.gdprArticles?.length || 0
    };
    return frameworks;
  };

  const calculateCoverageScore = (mapping: any) => {
    const frameworks = extractFrameworkMappings(mapping);
    const totalPossibleMappings = Object.values(frameworks).reduce((sum: number, count: number) => sum + count, 0);
    const unifiedRequirementsCount = mapping.auditReadyUnified?.subRequirements?.length || 0;
    
    if (totalPossibleMappings === 0) return 0;
    return Math.min(unifiedRequirementsCount / Math.max(totalPossibleMappings * 0.7, 1), 1);
  };

  const calculateQualityScore = (mapping: any) => {
    const unifiedRequirements = mapping.auditReadyUnified?.subRequirements || [];
    if (unifiedRequirements.length === 0) return 0;
    
    // Simple quality heuristics
    let totalQuality = 0;
    unifiedRequirements.forEach((req: any) => {
      const content = req.content || req.text || req.requirement || '';
      const wordCount = content.split(' ').length;
      const hasProperStructure = content.includes('\n') || wordCount > 20;
      const quality = hasProperStructure ? (wordCount > 50 ? 1 : 0.7) : 0.3;
      totalQuality += quality;
    });
    
    return totalQuality / unifiedRequirements.length;
  };

  const identifyGaps = (mapping: any) => {
    const frameworks = extractFrameworkMappings(mapping);
    const unifiedCount = mapping.auditReadyUnified?.subRequirements?.length || 0;
    const totalFrameworkRequirements = Object.values(frameworks).reduce((sum: number, count: number) => sum + count, 0);
    
    // Simple gap detection: if we have significantly fewer unified requirements than framework requirements
    return Math.max(0, totalFrameworkRequirements - unifiedCount);
  };

  // Advanced analysis functions
  const performDetailedAnalysis = async (categoryId: string) => {
    setIsAnalyzing(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.mapping_data) {
        console.error('Category not found or missing mapping data');
        return;
      }

      console.log('🔬 Starting detailed analysis for category:', category.name);
      
      const detailedAnalysis = await UnifiedRequirementsAnalysisService.analyzeCategory(
        category.mapping_data,
        {
          includeAIRecommendations: true,
          deepAnalysis: true
        }
      );

      setCategoryAnalysis(detailedAnalysis);
      console.log('✅ Detailed analysis complete:', detailedAnalysis);
      
    } catch (error) {
      console.error('❌ Detailed analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAIAnalysis = async (categoryId: string) => {
    setIsAnalyzing(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.mapping_data) {
        console.error('Category not found or missing mapping data');
        return;
      }

      console.log('🤖 Starting AI-powered analysis for category:', category.name);
      
      const aiAnalysis = await UnifiedRequirementsAnalysisService.analyzeCategory(
        category.mapping_data,
        {
          includeAIRecommendations: true,
          deepAnalysis: true,
          frameworkFocus: ['iso27001', 'nis2', 'nist'] // Focus on critical frameworks
        }
      );

      setCategoryAnalysis(aiAnalysis);
      console.log('🧠 AI analysis complete with recommendations:', aiAnalysis);
      
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading || isLoadingMappings || !isPlatformAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading unified requirements validation data...</p>
            {isPlatformAdmin && (
              <p className="text-xs text-emerald-500 mt-2">
                Platform Admin Mode - Quality Assurance Dashboard
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterFramework === 'all' || 
      (filterFramework === 'needs-attention' && category.needs_attention) ||
      (filterFramework === 'high-quality' && category.quality_score > 0.8);
    return matchesSearch && matchesFilter;
  });

  const overallStats = {
    total_categories: categories.length,
    high_quality: categories.filter(c => c.quality_score > 0.8).length,
    needs_attention: categories.filter(c => c.needs_attention).length,
    avg_coverage: categories.length > 0 ? categories.reduce((sum, c) => sum + c.coverage_score, 0) / categories.length : 0,
    total_gaps: categories.reduce((sum, c) => sum + c.gap_count, 0)
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Unified Requirements Validation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quality assurance dashboard for validating unified requirements against all frameworks
              </p>
            </div>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Categories</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.total_categories}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">High Quality</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {overallStats.high_quality}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Needs Attention</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {overallStats.needs_attention}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Coverage</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(overallStats.avg_coverage * 100)}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Gaps</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {overallStats.total_gaps}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterFramework}
                onChange={(e) => setFilterFramework(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="high-quality">High Quality</option>
              </select>
              
              <Button 
                onClick={loadInitialData}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.unified_requirements_count} unified requirements
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {category.needs_attention && (
                      <Badge variant="destructive" className="text-xs">
                        Needs Attention
                      </Badge>
                    )}
                    {category.quality_score > 0.8 && (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        High Quality
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Coverage Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Coverage Score</span>
                      <span className="font-medium">{Math.round(category.coverage_score * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          category.coverage_score > 0.8 ? 'bg-green-500' :
                          category.coverage_score > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${category.coverage_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality Score</span>
                      <span className="font-medium">{Math.round(category.quality_score * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          category.quality_score > 0.8 ? 'bg-blue-500' :
                          category.quality_score > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${category.quality_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Gap Count */}
                  {category.gap_count > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {category.gap_count} potential gaps detected
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Framework Breakdown */}
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(category.framework_mappings).map(([framework, count]) => (
                        count > 0 && (
                          <span key={framework} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {framework.toUpperCase()}: {count}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => performDetailedAnalysis(category.id)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      Validate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => performAIAnalysis(category.id)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-1" />
                      )}
                      AI Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis Results Modal/Panel */}
        {categoryAnalysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Analysis Results: {categoryAnalysis.category_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Comprehensive quality and coverage analysis
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setCategoryAnalysis(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Overall Scores */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Coverage Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(categoryAnalysis.coverage_analysis.coverage_percentage * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(categoryAnalysis.quality_analysis.overall_quality_score * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gap Score</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(categoryAnalysis.gap_analysis.gap_score * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Issues</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {categoryAnalysis.gap_analysis.total_gap_count}
                    </div>
                  </div>
                </div>

                {/* Framework Coverage Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Framework Coverage Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(categoryAnalysis.coverage_analysis.framework_breakdown).map(([framework, data]: [string, any]) => (
                      <div key={framework} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{framework}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {data.mapped}/{data.total} ({Math.round(data.coverage * 100)}%)
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.coverage > 0.8 ? 'bg-green-500' :
                              data.coverage > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${data.coverage * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Issues */}
                {categoryAnalysis.quality_analysis.quality_issues.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">
                      Quality Issues ({categoryAnalysis.quality_analysis.quality_issues.length})
                    </h3>
                    <div className="space-y-3">
                      {categoryAnalysis.quality_analysis.quality_issues.map((issue: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border-red-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs">
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{issue.type.replace('_', ' ').toUpperCase()}</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {issue.description}
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-400">
                            <strong>Fix:</strong> {issue.suggested_fix}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {categoryAnalysis.recommendations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-4">
                      AI Recommendations ({categoryAnalysis.recommendations.length})
                    </h3>
                    <div className="space-y-3">
                      {categoryAnalysis.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={rec.priority === 'critical' ? 'destructive' : 'default'} 
                              className="text-xs"
                            >
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{rec.title}</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {rec.description}
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-400 mb-2">
                            <strong>Expected Impact:</strong> {rec.expected_impact}
                          </div>
                          {rec.ai_generated_content && (
                            <div className="text-xs text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              <strong>AI Suggestion:</strong> {rec.ai_generated_content}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}