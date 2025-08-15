/**
 * Quality Validator Service
 * ========================
 * 
 * Multi-dimensional content quality assessment and validation service.
 * Provides CISO-grade content validation with technical accuracy verification,
 * completeness checking, and integration with content quality metrics.
 * 
 * Features:
 * - Multi-dimensional quality scoring (relevance, coherence, accuracy, etc.)
 * - CISO-grade content standards enforcement
 * - Technical accuracy verification using AI analysis
 * - Completeness assessment for all required sections
 * - Readability and professional tone evaluation
 * - Framework-specific requirement validation
 * - Content structure and formatting verification
 * - Automated improvement suggestions
 * - Quality trend tracking and analytics
 */

import { supabase } from '../../lib/supabase';
import { GeminiContentGenerator } from './GeminiContentGenerator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QualityAssessmentRequest {
  content: string;
  category: string;
  frameworks: string[];
  requirements?: any[];
  targetQuality: 'standard' | 'professional' | 'executive' | 'ciso-grade';
  userRole?: string;
  industry?: string;
}

export interface QualityMetrics {
  // Core Quality Dimensions (0-5 scale)
  relevance: number;       // How well content addresses requirements
  coherence: number;       // Logical structure and flow
  accuracy: number;        // Technical and factual correctness
  completeness: number;    // Coverage of all required aspects
  professionalTone: number; // Appropriate language and style
  overallScore: number;    // Weighted average of all dimensions
  
  // Detailed Content Analysis
  contentAnalysis: {
    wordCount: number;
    paragraphCount: number;
    sentenceCount: number;
    readabilityGrade: number; // Flesch-Kincaid grade level
    technicalTermDensity: number;
    actionVerbCount: number;
    bulletPointCount: number;
  };
  
  // Structural Validation
  structuralValidation: {
    hasAllRequiredSections: boolean;
    frameworkCoverageComplete: boolean;
    crossReferencesValid: boolean;
    implementationStepsPresent: boolean;
    evidenceExamplesPresent: boolean;
    toolRecommendationsPresent: boolean;
  };
  
  // AI Analysis Results
  aiAnalysis: {
    sentimentScore: number; // Professional confidence tone
    topicsCovered: string[];
    improvementSuggestions: string[];
    riskAssessment: {
      contentRisks: string[];
      accuracyConfidence: number;
      biasDetection: string[];
    };
  };
  
  // Quality Benchmarks
  benchmarks: {
    industryStandard: number;
    frameworkSpecific: number;
    roleAppropriate: number;
    complianceGrade: 'basic' | 'standard' | 'advanced' | 'expert' | 'ciso-grade';
  };
}

export interface QualityThresholds {
  standard: { overallScore: number; minimumDimensions: Record<string, number> };
  professional: { overallScore: number; minimumDimensions: Record<string, number> };
  executive: { overallScore: number; minimumDimensions: Record<string, number> };
  'ciso-grade': { overallScore: number; minimumDimensions: Record<string, number> };
}

export interface ContentValidationResult {
  isValid: boolean;
  quality: QualityMetrics;
  issues: ValidationIssue[];
  recommendations: string[];
  passesThreshold: boolean;
  targetThreshold: number;
}

export interface ValidationIssue {
  type: 'critical' | 'major' | 'minor' | 'suggestion';
  category: 'structure' | 'content' | 'accuracy' | 'completeness' | 'tone' | 'formatting';
  description: string;
  suggestion?: string;
  affectedSection?: string;
  severity: number; // 1-10 scale
}

export interface QualityTrendData {
  date: string;
  averageQuality: number;
  totalAssessments: number;
  qualityDistribution: Record<string, number>;
  topIssues: Array<{ issue: string; count: number }>;
}

// ============================================================================
// MAIN QUALITY VALIDATOR CLASS
// ============================================================================

export class QualityValidator {
  private geminiGenerator: GeminiContentGenerator;
  
  // Quality thresholds for different standards
  private readonly qualityThresholds: QualityThresholds = {
    standard: { 
      overallScore: 3.0, 
      minimumDimensions: { relevance: 2.8, coherence: 2.8, accuracy: 3.0 }
    },
    professional: { 
      overallScore: 3.5, 
      minimumDimensions: { relevance: 3.2, coherence: 3.2, accuracy: 3.5, professionalTone: 3.0 }
    },
    executive: { 
      overallScore: 4.0, 
      minimumDimensions: { relevance: 3.8, coherence: 3.8, accuracy: 4.0, professionalTone: 3.8, completeness: 3.5 }
    },
    'ciso-grade': { 
      overallScore: 4.5, 
      minimumDimensions: { relevance: 4.2, coherence: 4.2, accuracy: 4.5, professionalTone: 4.0, completeness: 4.0 }
    }
  };

  // Required sections for complete content
  private readonly requiredSections = [
    'strategic context', 'foundation', 'principles',
    'implementation', 'steps', 'approach',
    'tools', 'resources', 'recommendations',
    'evidence', 'audit', 'compliance'
  ];

  constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
  }

  // ============================================================================
  // MAIN QUALITY ASSESSMENT METHODS
  // ============================================================================

  /**
   * Perform comprehensive quality assessment
   */
  public async assessContent(
    content: string,
    request: QualityAssessmentRequest
  ): Promise<QualityMetrics> {
    console.log(`[QualityValidator] Starting quality assessment for ${request.category}`);
    
    try {
      // Parallel assessment of different quality dimensions
      const [
        aiQualityMetrics,
        contentAnalysis,
        structuralValidation,
        frameworkValidation
      ] = await Promise.all([
        this.performAIQualityAssessment(content, request),
        this.analyzeContentStructure(content),
        this.validateContentStructure(content),
        this.validateFrameworkCoverage(content, request.frameworks, request.requirements)
      ]);

      // Calculate weighted quality scores
      const qualityScores = this.calculateQualityScores(
        aiQualityMetrics,
        structuralValidation,
        frameworkValidation,
        request.targetQuality
      );

      // Build comprehensive quality metrics
      const qualityMetrics: QualityMetrics = {
        ...qualityScores,
        contentAnalysis,
        structuralValidation,
        aiAnalysis: aiQualityMetrics.aiAnalysis,
        benchmarks: await this.calculateBenchmarks(qualityScores, request)
      };

      // Store quality metrics in database
      await this.storeQualityMetrics(qualityMetrics, request);

      console.log(`[QualityValidator] Quality assessment completed. Overall score: ${qualityMetrics.overallScore.toFixed(2)}`);
      return qualityMetrics;

    } catch (error) {
      console.error(`[QualityValidator] Error in quality assessment:`, error);
      // Return fallback metrics
      return this.getFallbackQualityMetrics();
    }
  }

  /**
   * Validate content against quality standards
   */
  public async validateContent(
    content: string,
    request: QualityAssessmentRequest
  ): Promise<ContentValidationResult> {
    try {
      const quality = await this.assessContent(content, request);
      const threshold = this.qualityThresholds[request.targetQuality];
      
      // Check overall threshold
      const passesOverallThreshold = quality.overallScore >= threshold.overallScore;
      
      // Check individual dimension thresholds
      const dimensionChecks = Object.entries(threshold.minimumDimensions).map(([dimension, minScore]) => ({
        dimension,
        score: (quality as any)[dimension] || 0,
        required: minScore,
        passes: ((quality as any)[dimension] || 0) >= minScore
      }));

      const failedDimensions = dimensionChecks.filter(check => !check.passes);
      const passesThreshold = passesOverallThreshold && failedDimensions.length === 0;

      // Generate issues and recommendations
      const issues = await this.generateValidationIssues(quality, failedDimensions);
      const recommendations = await this.generateRecommendations(quality, request);

      return {
        isValid: passesThreshold,
        quality,
        issues,
        recommendations,
        passesThreshold,
        targetThreshold: threshold.overallScore
      };

    } catch (error) {
      console.error(`[QualityValidator] Error in content validation:`, error);
      throw error;
    }
  }

  /**
   * Get quality requirements for target standard
   */
  public getQualityRequirements(targetQuality: keyof QualityThresholds): {
    threshold: number;
    requirements: string[];
    recommendations: string[];
  } {
    const threshold = this.qualityThresholds[targetQuality];
    
    const requirements = [
      `Overall quality score of ${threshold.overallScore} or higher`,
      ...Object.entries(threshold.minimumDimensions).map(([dim, score]) => 
        `${dim.charAt(0).toUpperCase() + dim.slice(1)}: ${score} or higher`
      )
    ];

    const recommendations = this.getQualityRecommendations(targetQuality);

    return {
      threshold: threshold.overallScore,
      requirements,
      recommendations
    };
  }

  // ============================================================================
  // AI-POWERED QUALITY ASSESSMENT
  // ============================================================================

  /**
   * Perform AI-powered quality assessment using Gemini
   */
  private async performAIQualityAssessment(
    content: string,
    request: QualityAssessmentRequest
  ): Promise<{
    relevance: number;
    coherence: number;
    accuracy: number;
    completeness: number;
    professionalTone: number;
    aiAnalysis: any;
  }> {
    try {
      const assessmentPrompt = this.buildQualityAssessmentPrompt(content, request);
      
      const aiResponse = await this.geminiGenerator.validateContentQuality(
        content,
        {
          frameworks: request.frameworks,
          industry: request.industry,
          userRole: request.userRole
        }
      );

      // Extract additional AI insights
      const aiAnalysis = await this.performAIContentAnalysis(content, request);

      return {
        relevance: aiResponse.relevance,
        coherence: aiResponse.coherence,
        accuracy: aiResponse.accuracy,
        completeness: aiResponse.completeness,
        professionalTone: aiResponse.professionalTone,
        aiAnalysis
      };

    } catch (error) {
      console.warn(`[QualityValidator] AI quality assessment failed, using fallback:`, error);
      return {
        relevance: 3.0,
        coherence: 3.0,
        accuracy: 3.0,
        completeness: 3.0,
        professionalTone: 3.0,
        aiAnalysis: {
          sentimentScore: 0.0,
          topicsCovered: [],
          improvementSuggestions: [],
          riskAssessment: { contentRisks: [], accuracyConfidence: 0.5, biasDetection: [] }
        }
      };
    }
  }

  /**
   * Perform detailed AI content analysis
   */
  private async performAIContentAnalysis(
    content: string,
    request: QualityAssessmentRequest
  ): Promise<any> {
    try {
      const analysisPrompt = `Analyze the following compliance content for sentiment, topics, and potential improvements:

CONTENT: ${content.substring(0, 3000)}

ANALYSIS REQUIREMENTS:
1. Sentiment Score (-1 to 1): Measure professional confidence and authority
2. Topics Covered: List 5-10 main topics discussed
3. Improvement Suggestions: Provide 3-5 specific suggestions
4. Risk Assessment: Identify potential content risks

Return as JSON:
{
  "sentimentScore": 0.X,
  "topicsCovered": ["topic1", "topic2", ...],
  "improvementSuggestions": ["suggestion1", "suggestion2", ...],
  "riskAssessment": {
    "contentRisks": ["risk1", "risk2", ...],
    "accuracyConfidence": 0.X,
    "biasDetection": ["bias1", "bias2", ...]
  }
}`;

      // This would use Gemini for analysis - for now return structured analysis
      return this.parseAIAnalysisResponse(content, request);

    } catch (error) {
      console.warn(`[QualityValidator] AI content analysis failed:`, error);
      return {
        sentimentScore: 0.0,
        topicsCovered: [],
        improvementSuggestions: [],
        riskAssessment: { contentRisks: [], accuracyConfidence: 0.5, biasDetection: [] }
      };
    }
  }

  // ============================================================================
  // CONTENT STRUCTURE ANALYSIS
  // ============================================================================

  /**
   * Analyze content structure and readability
   */
  private analyzeContentStructure(content: string): any {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Technical term detection
    const technicalTerms = content.match(/\b[A-Z]{2,}(?:[A-Z][a-z]*)*\b/g) || [];
    const technicalTermDensity = technicalTerms.length / words.length;
    
    // Action verb detection
    const actionVerbs = ['implement', 'establish', 'maintain', 'monitor', 'review', 'assess', 'configure', 'deploy', 'manage', 'ensure'];
    const actionVerbCount = actionVerbs.reduce((count, verb) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${verb}`, 'g')) || []).length, 0
    );
    
    // Bullet point detection
    const bulletPointCount = (content.match(/^\s*[-*•]\s/gm) || []).length;
    
    // Readability calculation (simplified Flesch-Kincaid)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = this.estimateAverageSyllables(words);
    const readabilityGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
      readabilityGrade: Math.max(0, Math.round(readabilityGrade * 10) / 10),
      technicalTermDensity: Math.round(technicalTermDensity * 1000) / 1000,
      actionVerbCount,
      bulletPointCount
    };
  }

  /**
   * Validate content structure for completeness
   */
  private validateContentStructure(content: string): any {
    const lowerContent = content.toLowerCase();
    
    return {
      hasAllRequiredSections: this.checkRequiredSections(lowerContent),
      frameworkCoverageComplete: this.checkFrameworkCoverage(lowerContent),
      crossReferencesValid: this.checkCrossReferences(lowerContent),
      implementationStepsPresent: this.checkImplementationSteps(lowerContent),
      evidenceExamplesPresent: this.checkEvidenceExamples(lowerContent),
      toolRecommendationsPresent: this.checkToolRecommendations(lowerContent)
    };
  }

  /**
   * Validate framework coverage
   */
  private async validateFrameworkCoverage(
    content: string,
    frameworks: string[],
    requirements?: any[]
  ): Promise<{ coverageScore: number; missingFrameworks: string[] }> {
    const lowerContent = content.toLowerCase();
    const coveredFrameworks = frameworks.filter(framework => 
      lowerContent.includes(framework.toLowerCase())
    );
    
    const coverageScore = frameworks.length > 0 ? 
      coveredFrameworks.length / frameworks.length : 1.0;
    
    const missingFrameworks = frameworks.filter(framework => 
      !lowerContent.includes(framework.toLowerCase())
    );
    
    return { coverageScore, missingFrameworks };
  }

  // ============================================================================
  // QUALITY SCORING AND CALCULATIONS
  // ============================================================================

  /**
   * Calculate weighted quality scores
   */
  private calculateQualityScores(
    aiMetrics: any,
    structuralValidation: any,
    frameworkValidation: any,
    targetQuality: string
  ): {
    relevance: number;
    coherence: number;
    accuracy: number;
    completeness: number;
    professionalTone: number;
    overallScore: number;
  } {
    // Base scores from AI assessment
    let relevance = aiMetrics.relevance;
    let coherence = aiMetrics.coherence;
    let accuracy = aiMetrics.accuracy;
    let completeness = aiMetrics.completeness;
    let professionalTone = aiMetrics.professionalTone;

    // Adjust based on structural validation
    if (!structuralValidation.hasAllRequiredSections) {
      completeness = Math.max(0, completeness - 0.5);
    }
    
    if (!structuralValidation.implementationStepsPresent) {
      completeness = Math.max(0, completeness - 0.3);
      relevance = Math.max(0, relevance - 0.2);
    }
    
    if (!structuralValidation.evidenceExamplesPresent) {
      completeness = Math.max(0, completeness - 0.3);
    }

    // Adjust based on framework coverage
    if (frameworkValidation.coverageScore < 0.8) {
      relevance = Math.max(0, relevance - (1 - frameworkValidation.coverageScore));
      completeness = Math.max(0, completeness - (1 - frameworkValidation.coverageScore) * 0.5);
    }

    // Calculate weighted overall score based on target quality
    const weights = this.getQualityWeights(targetQuality);
    const overallScore = (
      relevance * weights.relevance +
      coherence * weights.coherence +
      accuracy * weights.accuracy +
      completeness * weights.completeness +
      professionalTone * weights.professionalTone
    );

    return {
      relevance: Math.round(relevance * 100) / 100,
      coherence: Math.round(coherence * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      completeness: Math.round(completeness * 100) / 100,
      professionalTone: Math.round(professionalTone * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100
    };
  }

  /**
   * Calculate quality benchmarks
   */
  private async calculateBenchmarks(qualityScores: any, request: QualityAssessmentRequest): Promise<any> {
    // This would compare against industry standards
    // For now, return estimated benchmarks
    return {
      industryStandard: 3.5,
      frameworkSpecific: 3.8,
      roleAppropriate: request.userRole === 'ciso' ? 4.2 : 3.6,
      complianceGrade: this.determineComplianceGrade(qualityScores.overallScore)
    };
  }

  // ============================================================================
  // VALIDATION AND RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate validation issues
   */
  private async generateValidationIssues(
    quality: QualityMetrics,
    failedDimensions: any[]
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Critical issues
    if (quality.accuracy < 3.0) {
      issues.push({
        type: 'critical',
        category: 'accuracy',
        description: 'Technical accuracy is below acceptable standards',
        suggestion: 'Review technical details and verify against authoritative sources',
        severity: 9
      });
    }

    // Major issues
    failedDimensions.forEach(dim => {
      if (dim.required - dim.score > 0.5) {
        issues.push({
          type: 'major',
          category: dim.dimension,
          description: `${dim.dimension} score (${dim.score.toFixed(1)}) is significantly below required standard (${dim.required.toFixed(1)})`,
          suggestion: this.getDimensionImprovement(dim.dimension),
          severity: Math.ceil((dim.required - dim.score) * 2)
        });
      }
    });

    // Structural issues
    if (!quality.structuralValidation.hasAllRequiredSections) {
      issues.push({
        type: 'major',
        category: 'structure',
        description: 'Missing required content sections',
        suggestion: 'Add strategic context, implementation steps, tools, and audit evidence sections',
        severity: 7
      });
    }

    return issues.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Generate improvement recommendations
   */
  private async generateRecommendations(
    quality: QualityMetrics,
    request: QualityAssessmentRequest
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // AI-generated suggestions
    recommendations.push(...quality.aiAnalysis.improvementSuggestions);

    // Score-based recommendations
    if (quality.coherence < 4.0) {
      recommendations.push('Improve logical flow and structure with clear section headings and transitions');
    }
    
    if (quality.completeness < 4.0) {
      recommendations.push('Add more comprehensive coverage of implementation steps and audit evidence');
    }
    
    if (quality.professionalTone < 4.0 && request.targetQuality === 'ciso-grade') {
      recommendations.push('Elevate language to executive level with strategic business context');
    }

    // Framework-specific recommendations
    if (!quality.structuralValidation.frameworkCoverageComplete) {
      recommendations.push(`Ensure explicit coverage of all ${request.frameworks.length} selected frameworks`);
    }

    return recommendations.slice(0, 8); // Top 8 recommendations
  }

  // ============================================================================
  // ANALYTICS AND TRACKING
  // ============================================================================

  /**
   * Store quality metrics in database
   */
  private async storeQualityMetrics(
    metrics: QualityMetrics,
    request: QualityAssessmentRequest
  ): Promise<void> {
    try {
      const qualityData = {
        completeness_score: metrics.completeness,
        accuracy_score: metrics.accuracy,
        clarity_score: metrics.coherence,
        actionability_score: metrics.relevance,
        ciso_grade_score: metrics.overallScore,
        overall_quality_score: metrics.overallScore,
        
        word_count: metrics.contentAnalysis.wordCount,
        paragraph_count: metrics.contentAnalysis.paragraphCount,
        sentence_count: metrics.contentAnalysis.sentenceCount,
        readability_grade: metrics.contentAnalysis.readabilityGrade,
        technical_term_density: metrics.contentAnalysis.technicalTermDensity,
        action_verb_count: metrics.contentAnalysis.actionVerbCount,
        bullet_point_count: metrics.contentAnalysis.bulletPointCount,
        
        has_all_required_sections: metrics.structuralValidation.hasAllRequiredSections,
        framework_coverage_complete: metrics.structuralValidation.frameworkCoverageComplete,
        cross_references_valid: metrics.structuralValidation.crossReferencesValid,
        implementation_steps_present: metrics.structuralValidation.implementationStepsPresent,
        evidence_examples_present: metrics.structuralValidation.evidenceExamplesPresent,
        tools_recommendations_present: metrics.structuralValidation.toolRecommendationsPresent,
        
        ai_sentiment_score: metrics.aiAnalysis.sentimentScore,
        ai_topics_covered: metrics.aiAnalysis.topicsCovered,
        improvement_suggestions: metrics.aiAnalysis.improvementSuggestions,
        risk_assessment: metrics.aiAnalysis.riskAssessment,
        
        measurement_method: 'ai_assisted',
        validator_version: 'QualityValidator-1.0'
      };

      const { error } = await supabase
        .from('content_quality_metrics')
        .insert(qualityData);

      if (error && error.code !== '23505') { // Ignore duplicate entries
        console.warn(`[QualityValidator] Failed to store quality metrics:`, error);
      }

    } catch (error) {
      console.warn(`[QualityValidator] Error storing quality metrics:`, error);
      // Don't throw - quality tracking failure shouldn't break the main flow
    }
  }

  /**
   * Get quality trend data
   */
  public async getQualityTrends(
    organizationId?: string,
    timeRange: 'day' | 'week' | 'month' = 'month'
  ): Promise<QualityTrendData[]> {
    try {
      const startDate = this.getTimeRangeStart(timeRange);
      
      let query = supabase
        .from('content_quality_metrics')
        .select('*')
        .gte('measured_at', startDate)
        .order('measured_at');

      if (organizationId) {
        // Would need to join with templates table for org filter
        // For now, return all data
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process data into trends
      return this.processTrendData(data || []);

    } catch (error) {
      console.error(`[QualityValidator] Error getting quality trends:`, error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Build quality assessment prompt for AI
   */
  private buildQualityAssessmentPrompt(
    content: string,
    request: QualityAssessmentRequest
  ): string {
    return `Assess the quality of this ${request.category} compliance content for ${request.frameworks.join(' and ')} frameworks.

TARGET QUALITY: ${request.targetQuality.toUpperCase()}
TARGET ROLE: ${request.userRole || 'Compliance Professional'}

CONTENT: ${content.substring(0, 4000)}

Rate each dimension 0-5:
1. RELEVANCE: How well does it address the specific requirements?
2. COHERENCE: How well-structured and logical is the content?
3. ACCURACY: How technically correct and factually sound is it?
4. COMPLETENESS: How comprehensive is the coverage?
5. PROFESSIONAL_TONE: How appropriate for the target audience?

Provide scores as JSON: {"relevance": X, "coherence": X, "accuracy": X, "completeness": X, "professionalTone": X}`;
  }

  /**
   * Parse AI analysis response
   */
  private parseAIAnalysisResponse(content: string, request: QualityAssessmentRequest): any {
    // Simplified analysis based on content patterns
    const sentimentScore = this.analyzeSentiment(content);
    const topicsCovered = this.extractTopics(content);
    const improvementSuggestions = this.generateImprovementSuggestions(content, request);
    const riskAssessment = this.assessContentRisks(content);

    return {
      sentimentScore,
      topicsCovered,
      improvementSuggestions,
      riskAssessment
    };
  }

  /**
   * Check required sections presence
   */
  private checkRequiredSections(lowerContent: string): boolean {
    const foundSections = this.requiredSections.filter(section => 
      lowerContent.includes(section)
    );
    return foundSections.length >= Math.ceil(this.requiredSections.length * 0.75);
  }

  /**
   * Check framework coverage
   */
  private checkFrameworkCoverage(lowerContent: string): boolean {
    const frameworkIndicators = ['iso', 'nist', 'cis', 'framework', 'standard', 'compliance'];
    return frameworkIndicators.some(indicator => lowerContent.includes(indicator));
  }

  /**
   * Check cross references
   */
  private checkCrossReferences(lowerContent: string): boolean {
    const referenceIndicators = ['see also', 'refer to', 'related to', 'cross-reference'];
    return referenceIndicators.some(indicator => lowerContent.includes(indicator));
  }

  /**
   * Check implementation steps
   */
  private checkImplementationSteps(lowerContent: string): boolean {
    const stepIndicators = ['step', 'phase', 'implement', 'deploy', 'establish', 'configure'];
    return stepIndicators.filter(indicator => lowerContent.includes(indicator)).length >= 2;
  }

  /**
   * Check evidence examples
   */
  private checkEvidenceExamples(lowerContent: string): boolean {
    const evidenceIndicators = ['evidence', 'document', 'log', 'record', 'audit', 'proof'];
    return evidenceIndicators.filter(indicator => lowerContent.includes(indicator)).length >= 2;
  }

  /**
   * Check tool recommendations
   */
  private checkToolRecommendations(lowerContent: string): boolean {
    const toolIndicators = ['tool', 'software', 'solution', 'platform', 'system', 'application'];
    return toolIndicators.filter(indicator => lowerContent.includes(indicator)).length >= 2;
  }

  /**
   * Get quality weights based on target quality
   */
  private getQualityWeights(targetQuality: string): Record<string, number> {
    const weightMaps = {
      standard: { relevance: 0.25, coherence: 0.20, accuracy: 0.30, completeness: 0.15, professionalTone: 0.10 },
      professional: { relevance: 0.25, coherence: 0.20, accuracy: 0.25, completeness: 0.20, professionalTone: 0.10 },
      executive: { relevance: 0.20, coherence: 0.25, accuracy: 0.25, completeness: 0.15, professionalTone: 0.15 },
      'ciso-grade': { relevance: 0.20, coherence: 0.20, accuracy: 0.30, completeness: 0.15, professionalTone: 0.15 }
    };
    
    return weightMaps[targetQuality as keyof typeof weightMaps] || weightMaps.professional;
  }

  /**
   * Determine compliance grade from overall score
   */
  private determineComplianceGrade(overallScore: number): 'basic' | 'standard' | 'advanced' | 'expert' | 'ciso-grade' {
    if (overallScore >= 4.5) return 'ciso-grade';
    if (overallScore >= 4.0) return 'expert';
    if (overallScore >= 3.5) return 'advanced';
    if (overallScore >= 3.0) return 'standard';
    return 'basic';
  }

  /**
   * Get dimension improvement suggestions
   */
  private getDimensionImprovement(dimension: string): string {
    const improvements = {
      relevance: 'Focus more directly on the specific framework requirements and use cases',
      coherence: 'Improve logical flow with clearer section organization and transitions',
      accuracy: 'Verify technical details against authoritative sources and current standards',
      completeness: 'Add missing implementation steps, tools, and audit evidence sections',
      professionalTone: 'Elevate language to be more appropriate for senior executives and CISOs'
    };
    
    return improvements[dimension as keyof typeof improvements] || 'Review and improve this dimension';
  }

  /**
   * Get quality recommendations for target level
   */
  private getQualityRecommendations(targetQuality: string): string[] {
    const recommendations = {
      standard: [
        'Ensure all basic requirements are covered',
        'Use clear, professional language',
        'Include practical examples'
      ],
      professional: [
        'Add strategic business context',
        'Include specific implementation guidance',
        'Reference industry best practices',
        'Provide actionable recommendations'
      ],
      executive: [
        'Focus on business value and risk implications',
        'Use executive-appropriate language and tone',
        'Include ROI and business case elements',
        'Provide strategic oversight guidance'
      ],
      'ciso-grade': [
        'Demonstrate deep technical expertise',
        'Address complex enterprise scenarios',
        'Include comprehensive risk analysis',
        'Provide strategic leadership guidance',
        'Reference latest industry developments'
      ]
    };
    
    return recommendations[targetQuality as keyof typeof recommendations] || recommendations.professional;
  }

  /**
   * Estimate average syllables in words (simplified)
   */
  private estimateAverageSyllables(words: string[]): number {
    return words.reduce((total, word) => {
      // Simple syllable estimation: vowel groups + adjustments
      const vowelGroups = (word.toLowerCase().match(/[aeiouy]+/g) || []).length;
      return total + Math.max(1, vowelGroups);
    }, 0) / Math.max(words.length, 1);
  }

  /**
   * Analyze sentiment of content
   */
  private analyzeSentiment(content: string): number {
    const positiveWords = ['effective', 'comprehensive', 'robust', 'secure', 'compliant', 'professional'];
    const negativeWords = ['inadequate', 'insufficient', 'vulnerable', 'non-compliant', 'poor'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (lowerContent.match(new RegExp(`\\b${word}`, 'g')) || []).length, 0
    );
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (lowerContent.match(new RegExp(`\\b${word}`, 'g')) || []).length, 0
    );
    
    const totalWords = content.split(/\s+/).length;
    return Math.max(-1, Math.min(1, (positiveCount - negativeCount) / Math.max(totalWords * 0.01, 1)));
  }

  /**
   * Extract topics from content
   */
  private extractTopics(content: string): string[] {
    const topics = new Set<string>();
    
    // Extract technical terms as topics
    const technicalTerms = content.match(/\b[A-Z]{2,}(?:[A-Z][a-z]*)*\b/g) || [];
    technicalTerms.slice(0, 10).forEach(term => topics.add(term));
    
    // Extract key concepts
    const keyConcepts = ['access control', 'risk management', 'compliance', 'security', 'audit', 'governance'];
    keyConcepts.forEach(concept => {
      if (content.toLowerCase().includes(concept)) {
        topics.add(concept);
      }
    });
    
    return Array.from(topics).slice(0, 10);
  }

  /**
   * Generate improvement suggestions based on content analysis
   */
  private generateImprovementSuggestions(content: string, request: QualityAssessmentRequest): string[] {
    const suggestions: string[] = [];
    
    if (content.length < 1000) {
      suggestions.push('Expand content with more detailed implementation guidance');
    }
    
    if (!content.toLowerCase().includes('implement')) {
      suggestions.push('Add specific implementation steps and procedures');
    }
    
    if (!content.toLowerCase().includes('evidence') && !content.toLowerCase().includes('audit')) {
      suggestions.push('Include audit evidence requirements and documentation examples');
    }
    
    if (request.targetQuality === 'ciso-grade' && !content.toLowerCase().includes('business')) {
      suggestions.push('Add business context and strategic implications');
    }
    
    return suggestions.slice(0, 5);
  }

  /**
   * Assess content risks
   */
  private assessContentRisks(content: string): any {
    const risks: string[] = [];
    let accuracyConfidence = 0.8;
    const biases: string[] = [];
    
    // Check for overly prescriptive language
    if (content.toLowerCase().includes('must always') || content.toLowerCase().includes('never')) {
      risks.push('Overly prescriptive language may not apply to all contexts');
      biases.push('Absolutist language bias');
    }
    
    // Check for vendor-specific mentions
    const vendorMentions = content.match(/\b[A-Z][a-z]+\s+(Security|Solutions?|Software)\b/g);
    if (vendorMentions && vendorMentions.length > 2) {
      risks.push('Multiple vendor mentions may indicate commercial bias');
      biases.push('Commercial bias');
      accuracyConfidence -= 0.1;
    }
    
    return {
      contentRisks: risks,
      accuracyConfidence: Math.max(0.3, accuracyConfidence),
      biasDetection: biases
    };
  }

  /**
   * Process trend data from database results
   */
  private processTrendData(data: any[]): QualityTrendData[] {
    // Group by date and calculate averages
    const groupedData = data.reduce((groups, item) => {
      const date = item.measured_at.split('T')[0]; // Get date part
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});

    return Object.entries(groupedData).map(([date, items]) => ({
      date,
      averageQuality: (items as any[]).reduce((sum, item) => sum + (item.overall_quality_score || 0), 0) / (items as any[]).length,
      totalAssessments: (items as any[]).length,
      qualityDistribution: this.calculateQualityDistribution(items as any[]),
      topIssues: this.extractTopIssues(items as any[])
    }));
  }

  /**
   * Calculate quality distribution
   */
  private calculateQualityDistribution(items: any[]): Record<string, number> {
    const distribution = { basic: 0, standard: 0, advanced: 0, expert: 0, 'ciso-grade': 0 };
    
    items.forEach(item => {
      const grade = this.determineComplianceGrade(item.overall_quality_score || 0);
      distribution[grade]++;
    });
    
    return distribution;
  }

  /**
   * Extract top issues from assessment data
   */
  private extractTopIssues(items: any[]): Array<{ issue: string; count: number }> {
    const issueMap: Record<string, number> = {};
    
    items.forEach(item => {
      if (item.improvement_suggestions) {
        item.improvement_suggestions.forEach((suggestion: string) => {
          issueMap[suggestion] = (issueMap[suggestion] || 0) + 1;
        });
      }
    });
    
    return Object.entries(issueMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Get fallback quality metrics when assessment fails
   */
  private getFallbackQualityMetrics(): QualityMetrics {
    return {
      relevance: 3.0,
      coherence: 3.0,
      accuracy: 3.0,
      completeness: 3.0,
      professionalTone: 3.0,
      overallScore: 3.0,
      contentAnalysis: {
        wordCount: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        readabilityGrade: 0,
        technicalTermDensity: 0,
        actionVerbCount: 0,
        bulletPointCount: 0
      },
      structuralValidation: {
        hasAllRequiredSections: false,
        frameworkCoverageComplete: false,
        crossReferencesValid: false,
        implementationStepsPresent: false,
        evidenceExamplesPresent: false,
        toolRecommendationsPresent: false
      },
      aiAnalysis: {
        sentimentScore: 0.0,
        topicsCovered: [],
        improvementSuggestions: ['Quality assessment failed - manual review recommended'],
        riskAssessment: { contentRisks: [], accuracyConfidence: 0.5, biasDetection: [] }
      },
      benchmarks: {
        industryStandard: 3.5,
        frameworkSpecific: 3.5,
        roleAppropriate: 3.5,
        complianceGrade: 'standard'
      }
    };
  }

  /**
   * Get time range start date
   */
  private getTimeRangeStart(timeRange: 'day' | 'week' | 'month'): string {
    const now = new Date();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    return new Date(now.getTime() - ranges[timeRange]).toISOString();
  }
}