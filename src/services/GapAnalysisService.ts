import { supabase } from '@/lib/supabase';

export interface GapAnalysisResult {
  id: string;
  standardId: string;
  standardName: string;
  totalRequirements: number;
  completedRequirements: number;
  compliancePercentage: number;
  gapAreas: GapArea[];
  recommendations: Recommendation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAnalyzed: string;
}

export interface GapArea {
  id: string;
  categoryName: string;
  requirementCount: number;
  completedCount: number;
  gapPercentage: number;
  criticalGaps: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  type: 'quick_win' | 'strategic' | 'documentation' | 'process' | 'training';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedEffort: string;
  estimatedImpact: number; // Percentage improvement expected
  requiredResources: string[];
  dependencies: string[];
  timeframe: string;
  category: string;
  relatedRequirements: string[];
}

export interface ComplianceMetrics {
  overallScore: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  standardBreakdown: Record<string, number>;
  categoryPerformance: Record<string, number>;
  riskDistribution: Record<string, number>;
  monthlyProgress: Array<{
    month: string;
    score: number;
    completedRequirements: number;
  }>;
}

export class GapAnalysisService {
  private static instance: GapAnalysisService;

  static getInstance(): GapAnalysisService {
    if (!GapAnalysisService.instance) {
      GapAnalysisService.instance = new GapAnalysisService();
    }
    return GapAnalysisService.instance;
  }

  /**
   * Perform comprehensive gap analysis for an organization
   */
  async performGapAnalysis(organizationId: string): Promise<GapAnalysisResult[]> {
    try {
      // Get all standards and their requirements
      const { data: standards, error: standardsError } = await supabase
        .from('standards')
        .select(`
          id,
          name,
          requirements (
            id,
            title,
            description,
            category,
            priority,
            requirement_assessments (
              id,
              status,
              completion_percentage,
              last_reviewed_at,
              evidence_count
            )
          )
        `)
        .eq('organization_id', organizationId);

      if (standardsError) throw standardsError;

      const results: GapAnalysisResult[] = [];

      for (const standard of standards || []) {
        const analysis = await this.analyzeStandard(standard, organizationId);
        results.push(analysis);
      }

      // Store analysis results
      await this.storeAnalysisResults(organizationId, results);

      return results;
    } catch (error) {
      console.error('Error performing gap analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze a single standard for gaps and recommendations
   */
  private async analyzeStandard(standard: any, organizationId: string): Promise<GapAnalysisResult> {
    const requirements = standard.requirements || [];
    const totalRequirements = requirements.length;
    
    // Calculate completion metrics
    const completedRequirements = requirements.filter((req: any) => 
      req.requirement_assessments?.some((assessment: any) => 
        assessment.status === 'completed' && assessment.completion_percentage >= 80
      )
    ).length;

    const compliancePercentage = totalRequirements > 0 
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;

    // Analyze gaps by category
    const gapAreas = await this.analyzeGapsByCategory(requirements);

    // Generate intelligent recommendations
    const recommendations = await this.generateRecommendations(
      standard,
      requirements,
      gapAreas,
      organizationId
    );

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(compliancePercentage, gapAreas);

    return {
      id: `gap-${standard.id}`,
      standardId: standard.id,
      standardName: standard.name,
      totalRequirements,
      completedRequirements,
      compliancePercentage,
      gapAreas,
      recommendations,
      riskLevel,
      lastAnalyzed: new Date().toISOString()
    };
  }

  /**
   * Analyze gaps by requirement category
   */
  private async analyzeGapsByCategory(requirements: any[]): Promise<GapArea[]> {
    const categories = new Map<string, any[]>();

    // Group requirements by category
    requirements.forEach(req => {
      const category = req.category || 'General';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(req);
    });

    const gapAreas: GapArea[] = [];

    for (const [categoryName, categoryReqs] of categories) {
      const requirementCount = categoryReqs.length;
      const completedCount = categoryReqs.filter(req => 
        req.requirement_assessments?.some((assessment: any) => 
          assessment.status === 'completed' && assessment.completion_percentage >= 80
        )
      ).length;

      const gapPercentage = requirementCount > 0 
        ? Math.round(((requirementCount - completedCount) / requirementCount) * 100)
        : 0;

      // Identify critical gaps
      const criticalGaps = categoryReqs
        .filter(req => 
          req.priority === 'high' && 
          !req.requirement_assessments?.some((assessment: any) => 
            assessment.status === 'completed'
          )
        )
        .map(req => req.title);

      // Determine impact level
      const impact = this.calculateImpactLevel(gapPercentage, criticalGaps.length);

      gapAreas.push({
        id: `gap-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        categoryName,
        requirementCount,
        completedCount,
        gapPercentage,
        criticalGaps,
        impact
      });
    }

    return gapAreas.sort((a, b) => b.gapPercentage - a.gapPercentage);
  }

  /**
   * Generate intelligent recommendations based on gap analysis
   */
  private async generateRecommendations(
    standard: any,
    requirements: any[],
    gapAreas: GapArea[],
    organizationId: string
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Quick wins - Low effort, high impact
    const quickWins = this.generateQuickWinRecommendations(requirements, gapAreas);
    recommendations.push(...quickWins);

    // Strategic recommendations
    const strategicRecs = this.generateStrategicRecommendations(gapAreas, standard);
    recommendations.push(...strategicRecs);

    // Documentation gaps
    const docRecs = await this.generateDocumentationRecommendations(
      requirements,
      organizationId
    );
    recommendations.push(...docRecs);

    // Process improvements
    const processRecs = this.generateProcessRecommendations(gapAreas);
    recommendations.push(...processRecs);

    // Training recommendations
    const trainingRecs = this.generateTrainingRecommendations(gapAreas);
    recommendations.push(...trainingRecs);

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate quick win recommendations
   */
  private generateQuickWinRecommendations(requirements: any[], gapAreas: GapArea[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Find requirements that are partially completed
    const partiallyCompleted = requirements.filter(req => 
      req.requirement_assessments?.some((assessment: any) => 
        assessment.completion_percentage > 0 && assessment.completion_percentage < 80
      )
    );

    if (partiallyCompleted.length > 0) {
      recommendations.push({
        id: 'quick-win-partial',
        type: 'quick_win',
        priority: 'high',
        title: 'Complete Partially Implemented Requirements',
        description: `${partiallyCompleted.length} requirements are partially completed and can be finished quickly.`,
        estimatedEffort: '1-2 weeks',
        estimatedImpact: 15,
        requiredResources: ['Compliance Team'],
        dependencies: [],
        timeframe: 'Immediate',
        category: 'Implementation',
        relatedRequirements: partiallyCompleted.map(req => req.id)
      });
    }

    // Find documentation gaps that are easy to fill
    const missingDocumentation = requirements.filter(req => 
      req.requirement_assessments?.every((assessment: any) => 
        assessment.evidence_count === 0
      )
    );

    if (missingDocumentation.length > 0) {
      recommendations.push({
        id: 'quick-win-docs',
        type: 'documentation',
        priority: 'medium',
        title: 'Document Existing Processes',
        description: `${missingDocumentation.length} requirements lack documentation but may have informal processes in place.`,
        estimatedEffort: '3-4 weeks',
        estimatedImpact: 20,
        requiredResources: ['Technical Writers', 'Subject Matter Experts'],
        dependencies: [],
        timeframe: 'Short-term',
        category: 'Documentation',
        relatedRequirements: missingDocumentation.slice(0, 10).map(req => req.id)
      });
    }

    return recommendations;
  }

  /**
   * Generate strategic recommendations
   */
  private generateStrategicRecommendations(gapAreas: GapArea[], standard: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Focus on highest gap areas
    const criticalAreas = gapAreas.filter(area => area.gapPercentage > 60);

    criticalAreas.forEach(area => {
      recommendations.push({
        id: `strategic-${area.id}`,
        type: 'strategic',
        priority: area.impact === 'high' ? 'critical' : 'high',
        title: `Comprehensive ${area.categoryName} Improvement`,
        description: `Develop systematic approach to address ${area.gapPercentage}% gap in ${area.categoryName} category.`,
        estimatedEffort: '3-6 months',
        estimatedImpact: area.gapPercentage * 0.8,
        requiredResources: ['Project Manager', 'Compliance Team', 'IT Team'],
        dependencies: ['Management Approval', 'Budget Allocation'],
        timeframe: 'Long-term',
        category: area.categoryName,
        relatedRequirements: []
      });
    });

    return recommendations;
  }

  /**
   * Generate documentation recommendations
   */
  private async generateDocumentationRecommendations(
    requirements: any[],
    organizationId: string
  ): Promise<Recommendation[]> {
    // Check existing documents
    const { data: documents } = await supabase
      .from('uploaded_documents')
      .select('id, name, category')
      .eq('organization_id', organizationId);

    const documentCount = documents?.length || 0;
    const requirementCount = requirements.length;

    if (documentCount < requirementCount * 0.5) {
      return [{
        id: 'doc-coverage',
        type: 'documentation',
        priority: 'high',
        title: 'Improve Documentation Coverage',
        description: 'Current documentation coverage is below recommended levels. Focus on creating comprehensive policy and procedure documents.',
        estimatedEffort: '6-8 weeks',
        estimatedImpact: 25,
        requiredResources: ['Technical Writers', 'Compliance Officers'],
        dependencies: ['Document Templates', 'Review Process'],
        timeframe: 'Medium-term',
        category: 'Documentation',
        relatedRequirements: []
      }];
    }

    return [];
  }

  /**
   * Generate process improvement recommendations
   */
  private generateProcessRecommendations(gapAreas: GapArea[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    gapAreas.forEach(area => {
      if (area.criticalGaps.length > 0) {
        recommendations.push({
          id: `process-${area.id}`,
          type: 'process',
          priority: 'medium',
          title: `Standardize ${area.categoryName} Processes`,
          description: `Implement standardized processes for ${area.categoryName} to address ${area.criticalGaps.length} critical gaps.`,
          estimatedEffort: '4-6 weeks',
          estimatedImpact: 30,
          requiredResources: ['Process Analyst', 'Department Heads'],
          dependencies: ['Process Mapping', 'Stakeholder Buy-in'],
          timeframe: 'Medium-term',
          category: area.categoryName,
          relatedRequirements: []
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate training recommendations
   */
  private generateTrainingRecommendations(gapAreas: GapArea[]): Recommendation[] {
    const highImpactAreas = gapAreas.filter(area => area.impact === 'high');

    if (highImpactAreas.length > 0) {
      return [{
        id: 'training-program',
        type: 'training',
        priority: 'medium',
        title: 'Implement Compliance Training Program',
        description: `Develop targeted training for ${highImpactAreas.map(a => a.categoryName).join(', ')} to improve awareness and implementation.`,
        estimatedEffort: '8-10 weeks',
        estimatedImpact: 35,
        requiredResources: ['Training Coordinator', 'Subject Matter Experts'],
        dependencies: ['Training Materials', 'Learning Management System'],
        timeframe: 'Medium-term',
        category: 'Training',
        relatedRequirements: []
      }];
    }

    return [];
  }

  /**
   * Calculate risk level based on compliance metrics
   */
  private calculateRiskLevel(
    compliancePercentage: number,
    gapAreas: GapArea[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalGaps = gapAreas.reduce((sum, area) => sum + area.criticalGaps.length, 0);

    if (compliancePercentage < 30 || criticalGaps > 10) return 'critical';
    if (compliancePercentage < 60 || criticalGaps > 5) return 'high';
    if (compliancePercentage < 80 || criticalGaps > 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate impact level for gap areas
   */
  private calculateImpactLevel(gapPercentage: number, criticalGapCount: number): 'low' | 'medium' | 'high' {
    if (gapPercentage > 70 || criticalGapCount > 3) return 'high';
    if (gapPercentage > 40 || criticalGapCount > 1) return 'medium';
    return 'low';
  }

  /**
   * Store analysis results for tracking
   */
  private async storeAnalysisResults(organizationId: string, results: GapAnalysisResult[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('gap_analysis_results')
        .upsert(
          results.map(result => ({
            organization_id: organizationId,
            standard_id: result.standardId,
            analysis_data: result,
            created_at: new Date().toISOString()
          })),
          { onConflict: 'organization_id,standard_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error storing analysis results:', error);
      // Don't throw - analysis can still be returned even if storage fails
    }
  }

  /**
   * Get compliance metrics and trends
   */
  async getComplianceMetrics(organizationId: string): Promise<ComplianceMetrics> {
    try {
      const { data: results } = await supabase
        .from('gap_analysis_results')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (!results || results.length === 0) {
        return this.getDefaultMetrics();
      }

      const latest = results[0].analysis_data;
      const overallScore = this.calculateOverallScore(results.map(r => r.analysis_data));

      return {
        overallScore,
        trendDirection: this.calculateTrend(results),
        standardBreakdown: this.getStandardBreakdown(results),
        categoryPerformance: this.getCategoryPerformance(latest),
        riskDistribution: this.getRiskDistribution(results),
        monthlyProgress: this.getMonthlyProgress(results)
      };
    } catch (error) {
      console.error('Error getting compliance metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): ComplianceMetrics {
    return {
      overallScore: 0,
      trendDirection: 'stable',
      standardBreakdown: {},
      categoryPerformance: {},
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      monthlyProgress: []
    };
  }

  private calculateOverallScore(results: GapAnalysisResult[]): number {
    if (results.length === 0) return 0;
    const average = results.reduce((sum, result) => sum + result.compliancePercentage, 0) / results.length;
    return Math.round(average);
  }

  private calculateTrend(results: any[]): 'improving' | 'declining' | 'stable' {
    if (results.length < 2) return 'stable';
    
    const latest = results[0].analysis_data.compliancePercentage;
    const previous = results[1].analysis_data.compliancePercentage;
    
    if (latest > previous + 5) return 'improving';
    if (latest < previous - 5) return 'declining';
    return 'stable';
  }

  private getStandardBreakdown(results: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    results.forEach(result => {
      const data = result.analysis_data;
      breakdown[data.standardName] = data.compliancePercentage;
    });
    return breakdown;
  }

  private getCategoryPerformance(result: GapAnalysisResult): Record<string, number> {
    const performance: Record<string, number> = {};
    result.gapAreas.forEach(area => {
      performance[area.categoryName] = 100 - area.gapPercentage;
    });
    return performance;
  }

  private getRiskDistribution(results: any[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    results.forEach(result => {
      const riskLevel = result.analysis_data.riskLevel;
      distribution[riskLevel]++;
    });
    return distribution;
  }

  private getMonthlyProgress(results: any[]): Array<{month: string; score: number; completedRequirements: number}> {
    // This would typically aggregate historical data
    // For now, return current month's data
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const currentScore = this.calculateOverallScore(results.map(r => r.analysis_data));
    const completedRequirements = results.reduce((sum, result) => 
      sum + result.analysis_data.completedRequirements, 0
    );

    return [{
      month: currentMonth,
      score: currentScore,
      completedRequirements
    }];
  }
}

export const gapAnalysisService = GapAnalysisService.getInstance();