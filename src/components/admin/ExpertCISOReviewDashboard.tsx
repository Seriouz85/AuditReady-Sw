/**
 * 🏆 Expert CISO Review Dashboard
 * 
 * Admin dashboard component for displaying the results of expert CISO
 * systematic review of unified requirements across all 21 categories.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Award,
  TrendingUp,
  FileText,
  Users,
  Building2,
  Zap
} from 'lucide-react';
import { useComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';
import ExpertCISOReviewService, { CISOReviewResult } from '@/services/compliance/ExpertCISOReviewService';

export interface ExpertCISOReviewDashboardProps {
  className?: string;
}

export default function ExpertCISOReviewDashboard({ className }: ExpertCISOReviewDashboardProps) {
  const [reviewResults, setReviewResults] = useState<CISOReviewResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  
  // Get compliance mappings for all categories
  const { data: complianceMappings, isLoading: isMappingsLoading } = useComplianceMappingData({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: true,
    nis2: true
  });

  /**
   * 🔍 Conduct expert CISO systematic review
   */
  const conductReview = async () => {
    if (!complianceMappings || complianceMappings.length === 0) {
      console.warn('No compliance mappings available for review');
      return;
    }

    setLoading(true);
    try {
      console.log('🏆 Starting Expert CISO Systematic Review...');
      const results = await ExpertCISOReviewService.conductSystematicReview(complianceMappings);
      setReviewResults(results);
      console.log(`✅ Review complete: ${results.length} categories analyzed`);
    } catch (error) {
      console.error('Error conducting CISO review:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-conduct review when mappings are loaded
  useEffect(() => {
    if (complianceMappings && complianceMappings.length > 0 && reviewResults.length === 0) {
      conductReview();
    }
  }, [complianceMappings]);

  /**
   * 📊 Calculate overall statistics
   */
  const calculateOverallStats = () => {
    if (reviewResults.length === 0) return null;

    const totalCategories = reviewResults.length;
    const avgQualityScore = Math.round(
      reviewResults.reduce((sum, r) => sum + r.overallQualityScore, 0) / totalCategories
    );
    const avgFrameworkScore = Math.round(
      reviewResults.reduce((sum, r) => sum + r.frameworkCoverageScore, 0) / totalCategories
    );
    const totalImprovements = reviewResults.reduce((sum, r) => sum + r.improvementsApplied, 0);
    const totalRecommendations = reviewResults.reduce((sum, r) => sum + r.recommendations.length, 0);
    const criticalRecommendations = reviewResults.reduce(
      (sum, r) => sum + r.recommendations.filter(rec => rec.priority === 'critical').length, 0
    );

    return {
      totalCategories,
      avgQualityScore,
      avgFrameworkScore,
      totalImprovements,
      totalRecommendations,
      criticalRecommendations
    };
  };

  const stats = calculateOverallStats();

  if (isMappingsLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Conducting Expert CISO Systematic Review...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Award className="w-8 h-8 mr-3 text-yellow-600" />
            Expert CISO Review Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Systematic review and improvement of unified requirements across all compliance categories
          </p>
        </div>
        <Button onClick={conductReview} disabled={loading} className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Refresh Review</span>
        </Button>
      </div>

      {/* Overall Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCategories}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgQualityScore}/100</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Framework Coverage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgFrameworkScore}/100</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvements Applied</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalImprovements}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecommendations}</p>
                </div>
                <FileText className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Issues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalRecommendations}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Category Results</TabsTrigger>
          <TabsTrigger value="improvements">Improvements Applied</TabsTrigger>
          <TabsTrigger value="recommendations">CISO Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviewResults.map((result, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{result.categoryName}</span>
                    <Badge variant={result.overallQualityScore >= 80 ? 'default' : 'secondary'}>
                      {result.overallQualityScore}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quality Score</span>
                      <span>{result.overallQualityScore}/100</span>
                    </div>
                    <Progress value={result.overallQualityScore} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Framework Coverage</span>
                      <span>{result.frameworkCoverageScore}/100</span>
                    </div>
                    <Progress value={result.frameworkCoverageScore} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Requirements: {result.currentRequirements.length}</span>
                    <span>Improved: {result.improvementsApplied}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Recommendations: {result.recommendations.length}</span>
                    {result.recommendations.some(r => r.priority === 'critical') && (
                      <Badge variant="destructive" className="text-xs">
                        Critical Issues
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvements Applied by Expert CISO Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewResults.map((result, categoryIndex) => 
                  result.reviewResults
                    .filter(review => review.hasImprovement)
                    .map((review, reviewIndex) => (
                      <div key={`${categoryIndex}-${reviewIndex}`} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{result.categoryName} - Requirement {review.letter})</h4>
                          <Badge variant="outline">{review.improvementType}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Original:</span>
                            <p className="text-gray-800 dark:text-gray-200">{review.originalText}</p>
                          </div>
                          {review.improvedText && (
                            <div>
                              <span className="font-medium text-green-600">Improved:</span>
                              <p className="text-gray-800 dark:text-gray-200">{review.improvedText}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-blue-600">CISO Comments:</span>
                            <p className="text-gray-700 dark:text-gray-300">{review.cisoComments}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {reviewResults.map((result, index) => 
              result.recommendations.length > 0 && (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{result.categoryName} - CISO Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.recommendations.map((rec, recIndex) => (
                        <div key={recIndex} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <div className="flex space-x-2">
                              <Badge variant={rec.priority === 'critical' ? 'destructive' : 
                                           rec.priority === 'high' ? 'default' : 'secondary'}>
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline">{rec.type}</Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{rec.description}</p>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Expected Impact: {rec.expectedImpact}</div>
                            <div>Implementation Effort: {rec.implementationEffort}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { ExpertCISOReviewDashboard };