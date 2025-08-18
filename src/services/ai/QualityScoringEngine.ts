/**
 * Quality Scoring and Confidence Metrics System
 * Advanced AI-powered quality assessment and confidence measurement
 * 
 * Features:
 * - Multi-dimensional quality scoring
 * - Dynamic confidence metrics calculation
 * - Framework-specific quality standards
 * - Continuous quality improvement tracking
 * - Automated quality assurance checks
 * - Real-time quality monitoring
 * - Quality prediction and trending
 */

import { supabase } from '@/lib/supabase';
import { GeminiContentGenerator, type ContentGenerationRequest } from './GeminiContentGenerator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QualityAssessmentRequest {
  content: string;
  contentType: 'guidance' | 'policy' | 'procedure' | 'implementation' | 'evidence' | 'training';
  frameworks: string[];
  categories: string[];
  context: AssessmentContext;
  options?: AssessmentOptions;
}

export interface AssessmentContext {
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  organizationSize: 'startup' | 'sme' | 'enterprise' | 'large-enterprise';
  industry?: string;
  complianceMaturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  existingStandards?: string[];
  customCriteria?: QualityCriterion[];
}

export interface AssessmentOptions {
  enableAIValidation: boolean;
  includeConfidenceAnalysis: boolean;
  generateImprovementSuggestions: boolean;
  compareToBaseline: boolean;
  realTimeScoring: boolean;
  detailedMetrics: boolean;
}

export interface QualityCriterion {
  name: string;
  description: string;
  weight: number; // 0-1
  evaluationMethod: 'ai' | 'rule-based' | 'hybrid';
  threshold: QualityThreshold;
  frameworks: string[];
}

export interface QualityThreshold {
  minimum: number;
  target: number;
  excellent: number;
}

export interface QualityScore {
  overall: number; // 0-5
  dimensions: QualityDimensions;
  confidence: ConfidenceMetrics;
  compliance: ComplianceAlignment;
  improvement: ImprovementAnalysis;
  metadata: ScoringMetadata;
}

export interface QualityDimensions {
  accuracy: DimensionScore;
  completeness: DimensionScore;
  clarity: DimensionScore;
  relevance: DimensionScore;
  actionability: DimensionScore;
  professionalTone: DimensionScore;
  technicalDepth: DimensionScore;
  frameworkAlignment: DimensionScore;
  evidenceSupport: DimensionScore;
  implementation: DimensionScore;
}

export interface DimensionScore {
  score: number; // 0-5
  weight: number; // 0-1
  confidence: number; // 0-1
  evidence: string[];
  gaps: string[];
  suggestions: string[];
}

export interface ConfidenceMetrics {
  overall: number; // 0-1
  assessment: AssessmentConfidence;
  prediction: PredictionConfidence;
  recommendation: RecommendationConfidence;
  factors: ConfidenceFactor[];
}

export interface AssessmentConfidence {
  dataQuality: number; // 0-1
  modelAccuracy: number; // 0-1
  frameworkCoverage: number; // 0-1
  contentCompleteness: number; // 0-1
}

export interface PredictionConfidence {
  trendReliability: number; // 0-1
  futurePerformance: number; // 0-1
  improvementPotential: number; // 0-1
  riskAssessment: number; // 0-1
}

export interface RecommendationConfidence {
  actionabilityScore: number; // 0-1
  impactPrediction: number; // 0-1
  feasibilityAssessment: number; // 0-1
  successProbability: number; // 0-1
}

export interface ConfidenceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1
  description: string;
}

export interface ComplianceAlignment {
  frameworks: FrameworkCompliance[];
  overallAlignment: number; // 0-1
  criticalGaps: ComplianceGap[];
  strengths: ComplianceStrength[];
  recommendations: ComplianceRecommendation[];
}

export interface FrameworkCompliance {
  framework: string;
  alignment: number; // 0-1
  coverage: number; // 0-1
  maturity: number; // 0-1
  gaps: string[];
  controls: ControlCompliance[];
}

export interface ControlCompliance {
  control: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  score: number; // 0-1
  evidence: string[];
  gaps: string[];
}

export interface ComplianceGap {
  framework: string;
  control: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface ComplianceStrength {
  framework: string;
  area: string;
  description: string;
  evidence: string[];
  leverage: string[];
}

export interface ComplianceRecommendation {
  framework: string;
  type: 'immediate' | 'short-term' | 'long-term';
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  rationale: string;
  expectedImpact: string;
  resources: string[];
}

export interface ImprovementAnalysis {
  potential: number; // 0-1
  priority: ImprovementPriority[];
  timeline: ImprovementTimeline;
  resources: ResourceRequirement[];
  dependencies: ImprovementDependency[];
  riskFactors: RiskFactor[];
}

export interface ImprovementPriority {
  dimension: string;
  currentScore: number;
  targetScore: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface ImprovementTimeline {
  immediate: string[]; // 0-30 days
  shortTerm: string[]; // 1-6 months
  longTerm: string[]; // 6+ months
}

export interface ResourceRequirement {
  type: 'human' | 'technology' | 'training' | 'external';
  description: string;
  estimated: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ImprovementDependency {
  improvement: string;
  dependencies: string[];
  type: 'sequential' | 'parallel' | 'conditional';
  impact: string;
}

export interface RiskFactor {
  factor: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
}

export interface ScoringMetadata {
  assessmentId: string;
  timestamp: string;
  processingTime: number;
  modelVersion: string;
  frameworkVersions: Record<string, string>;
  confidence: number; // 0-1
  reviewRequired: boolean;
  benchmarkComparison?: BenchmarkComparison;
}

export interface BenchmarkComparison {
  industry: IndustryBenchmark;
  size: SizeBenchmark;
  maturity: MaturityBenchmark;
  historical: HistoricalTrend;
}

export interface IndustryBenchmark {
  industry: string;
  averageScore: number;
  percentile: number;
  topQuartile: number;
  comparison: string;
}

export interface SizeBenchmark {
  organizationSize: string;
  averageScore: number;
  percentile: number;
  comparison: string;
}

export interface MaturityBenchmark {
  maturityLevel: string;
  expectedScore: number;
  actualScore: number;
  maturityGap: number;
  recommendations: string[];
}

export interface HistoricalTrend {
  timeframe: string;
  trend: 'improving' | 'stable' | 'declining';
  rate: number;
  factors: string[];
  prediction: TrendPrediction;
}

export interface TrendPrediction {
  nextPeriod: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface QualityMonitoringConfig {
  thresholds: QualityThresholds;
  alerts: AlertConfig[];
  reporting: ReportingConfig;
  automation: AutomationConfig;
}

export interface QualityThresholds {
  minimum: number;
  target: number;
  excellent: number;
  critical: number;
  warning: number;
}

export interface AlertConfig {
  trigger: string;
  threshold: number;
  recipients: string[];
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions: string[];
}

export interface ReportingConfig {
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'summary' | 'detailed' | 'dashboard';
  includeRecommendations: boolean;
}

export interface AutomationConfig {
  autoApproveThreshold: number;
  autoRejectThreshold: number;
  autoImprovementEnabled: boolean;
  escalationThreshold: number;
}

// ============================================================================
// MAIN SCORING ENGINE CLASS
// ============================================================================

export class QualityScoringEngine {
  private static instance: QualityScoringEngine | null = null;
  private geminiGenerator: GeminiContentGenerator;
  
  // Quality dimension weights by content type
  private readonly dimensionWeights = {
    guidance: {
      accuracy: 0.15,
      completeness: 0.15,
      clarity: 0.15,
      relevance: 0.12,
      actionability: 0.12,
      professionalTone: 0.08,
      technicalDepth: 0.08,
      frameworkAlignment: 0.10,
      evidenceSupport: 0.03,
      implementation: 0.02
    },
    policy: {
      accuracy: 0.18,
      completeness: 0.16,
      clarity: 0.14,
      relevance: 0.12,
      actionability: 0.10,
      professionalTone: 0.12,
      technicalDepth: 0.06,
      frameworkAlignment: 0.08,
      evidenceSupport: 0.02,
      implementation: 0.02
    },
    procedure: {
      accuracy: 0.14,
      completeness: 0.12,
      clarity: 0.16,
      relevance: 0.10,
      actionability: 0.18,
      professionalTone: 0.08,
      technicalDepth: 0.10,
      frameworkAlignment: 0.08,
      evidenceSupport: 0.02,
      implementation: 0.02
    },
    implementation: {
      accuracy: 0.12,
      completeness: 0.10,
      clarity: 0.12,
      relevance: 0.10,
      actionability: 0.20,
      professionalTone: 0.06,
      technicalDepth: 0.14,
      frameworkAlignment: 0.08,
      evidenceSupport: 0.04,
      implementation: 0.04
    },
    evidence: {
      accuracy: 0.20,
      completeness: 0.18,
      clarity: 0.10,
      relevance: 0.12,
      actionability: 0.06,
      professionalTone: 0.08,
      technicalDepth: 0.06,
      frameworkAlignment: 0.12,
      evidenceSupport: 0.06,
      implementation: 0.02
    },
    training: {
      accuracy: 0.14,
      completeness: 0.14,
      clarity: 0.18,
      relevance: 0.12,
      actionability: 0.14,
      professionalTone: 0.10,
      technicalDepth: 0.08,
      frameworkAlignment: 0.06,
      evidenceSupport: 0.02,
      implementation: 0.02
    }
  };

  // Framework-specific quality criteria
  private readonly frameworkCriteria = {
    'iso27001': {
      accuracy: { minimum: 4.0, target: 4.5, excellent: 4.8 },
      completeness: { minimum: 4.2, target: 4.6, excellent: 4.9 },
      frameworkAlignment: { minimum: 4.5, target: 4.8, excellent: 5.0 }
    },
    'gdpr': {
      accuracy: { minimum: 4.5, target: 4.8, excellent: 5.0 },
      clarity: { minimum: 4.0, target: 4.5, excellent: 4.8 },
      evidenceSupport: { minimum: 4.0, target: 4.5, excellent: 4.8 }
    },
    'nist': {
      technicalDepth: { minimum: 4.0, target: 4.5, excellent: 4.8 },
      actionability: { minimum: 4.2, target: 4.6, excellent: 4.9 },
      implementation: { minimum: 4.0, target: 4.5, excellent: 4.8 }
    }
  };

  private constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
  }

  public static getInstance(): QualityScoringEngine {
    if (!QualityScoringEngine.instance) {
      QualityScoringEngine.instance = new QualityScoringEngine();
    }
    return QualityScoringEngine.instance;
  }

  // ============================================================================
  // MAIN ASSESSMENT METHODS
  // ============================================================================

  /**
   * Comprehensive quality assessment with confidence metrics
   */
  public async assessQuality(request: QualityAssessmentRequest): Promise<QualityScore> {
    const startTime = Date.now();
    const assessmentId = this.generateAssessmentId();

    try {
      console.log(`[QualityScoring] Starting quality assessment ${assessmentId}`);

      // Step 1: AI-powered quality analysis
      const aiAnalysis = await this.performAIQualityAnalysis(request);

      // Step 2: Rule-based quality checks
      const ruleBasedAnalysis = await this.performRuleBasedAnalysis(request);

      // Step 3: Framework compliance assessment
      const complianceAnalysis = await this.assessFrameworkCompliance(request);

      // Step 4: Calculate dimension scores
      const dimensions = await this.calculateDimensionScores(request, aiAnalysis, ruleBasedAnalysis);

      // Step 5: Calculate confidence metrics
      const confidence = await this.calculateConfidenceMetrics(request, dimensions, complianceAnalysis);

      // Step 6: Generate improvement analysis
      const improvement = await this.analyzeImprovementPotential(request, dimensions, complianceAnalysis);

      // Step 7: Calculate overall score
      const overallScore = this.calculateOverallScore(dimensions, request.contentType);

      // Step 8: Generate benchmark comparison
      const benchmarkComparison = await this.generateBenchmarkComparison(request, overallScore);

      const qualityScore: QualityScore = {
        overall: overallScore,
        dimensions,
        confidence,
        compliance: complianceAnalysis,
        improvement,
        metadata: {
          assessmentId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          modelVersion: '1.0.0',
          frameworkVersions: this.getFrameworkVersions(request.frameworks),
          confidence: confidence.overall,
          reviewRequired: this.shouldRequireReview(overallScore, confidence.overall),
          benchmarkComparison
        }
      };

      // Store assessment result
      await this.storeAssessmentResult(qualityScore, request);

      console.log(`[QualityScoring] Assessment ${assessmentId} completed in ${Date.now() - startTime}ms`);
      return qualityScore;

    } catch (error) {
      console.error(`[QualityScoring] Assessment ${assessmentId} failed:`, error);
      throw error;
    }
  }

  /**
   * Real-time quality monitoring
   */
  public async monitorQualityRealtime(
    content: string,
    config: QualityMonitoringConfig,
    callback: (score: number, alerts: string[]) => void
  ): Promise<void> {
    try {
      // Perform lightweight quality check
      const quickScore = await this.performQuickQualityCheck(content);
      
      // Check thresholds and generate alerts
      const alerts = this.checkQualityThresholds(quickScore, config.thresholds);
      
      // Execute callback with results
      callback(quickScore, alerts);
      
      // Trigger automation if configured
      if (config.automation.autoImprovementEnabled && quickScore < config.automation.autoApproveThreshold) {
        await this.triggerAutomaticImprovement(content, quickScore);
      }

    } catch (error) {
      console.error('[QualityScoring] Real-time monitoring failed:', error);
      callback(0, ['Monitoring system error']);
    }
  }

  /**
   * Batch quality assessment for multiple content pieces
   */
  public async assessQualityBatch(requests: QualityAssessmentRequest[]): Promise<QualityScore[]> {
    const results: QualityScore[] = [];
    
    console.log(`[QualityScoring] Starting batch assessment of ${requests.length} items`);

    for (const request of requests) {
      try {
        const score = await this.assessQuality(request);
        results.push(score);

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('[QualityScoring] Batch item assessment failed:', error);
        results.push(this.buildErrorScore(request, error));
      }
    }

    return results;
  }

  // ============================================================================
  // AI-POWERED ANALYSIS METHODS
  // ============================================================================

  /**
   * Perform comprehensive AI quality analysis
   */
  private async performAIQualityAnalysis(request: QualityAssessmentRequest): Promise<any> {
    try {
      const analysisPrompt = this.buildQualityAnalysisPrompt(request);

      const analysisRequest: ContentGenerationRequest = {
        prompt: analysisPrompt,
        contentType: 'validation',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer',
          experienceLevel: request.context.targetAudience
        },
        options: {
          temperature: 0.1,
          maxTokens: 2000
        }
      };

      const response = await this.geminiGenerator.generateContent(analysisRequest);
      return this.parseAIAnalysisResponse(response.content);

    } catch (error) {
      console.error('[QualityScoring] AI analysis failed:', error);
      return this.getDefaultAIAnalysis();
    }
  }

  /**
   * Build comprehensive quality analysis prompt
   */
  private buildQualityAnalysisPrompt(request: QualityAssessmentRequest): string {
    return `As an expert compliance content quality assessor, conduct a comprehensive quality analysis of the following ${request.contentType} content:

CONTENT TO ANALYZE:
${request.content.substring(0, 3000)}${request.content.length > 3000 ? '...' : ''}

ASSESSMENT CONTEXT:
- Content Type: ${request.contentType}
- Target Frameworks: ${request.frameworks.join(', ')}
- Target Categories: ${request.categories.join(', ')}
- Target Audience: ${request.context.targetAudience}
- Organization Size: ${request.context.organizationSize}
- Industry: ${request.context.industry || 'General'}
- Compliance Maturity: ${request.context.complianceMaturity}

QUALITY DIMENSIONS TO ASSESS (Score 0-5 each):

1. **ACCURACY** - Technical correctness and factual accuracy
2. **COMPLETENESS** - Comprehensive coverage of requirements
3. **CLARITY** - Clear communication and readability
4. **RELEVANCE** - Alignment with specified frameworks and categories
5. **ACTIONABILITY** - Practical implementability
6. **PROFESSIONAL_TONE** - Appropriate language and presentation
7. **TECHNICAL_DEPTH** - Sufficient technical detail
8. **FRAMEWORK_ALIGNMENT** - Specific framework compliance
9. **EVIDENCE_SUPPORT** - Supporting documentation and references
10. **IMPLEMENTATION** - Implementation guidance quality

For each dimension, provide:
- Score (0-5)
- Confidence (0-1)
- Evidence (key supporting points)
- Gaps (missing elements)
- Suggestions (specific improvements)

RESPONSE FORMAT:
Provide assessment as JSON:
{
  "dimensions": {
    "accuracy": {"score": X.X, "confidence": 0.XX, "evidence": [...], "gaps": [...], "suggestions": [...]},
    "completeness": {"score": X.X, "confidence": 0.XX, "evidence": [...], "gaps": [...], "suggestions": [...]},
    ...
  },
  "overallConfidence": 0.XX,
  "criticalIssues": [...],
  "strongPoints": [...],
  "improvementPriorities": [...]
}

Focus on ${request.frameworks.join(' and ')} compliance requirements and ${request.context.targetAudience} audience needs.`;
  }

  /**
   * Parse AI analysis response
   */
  private parseAIAnalysisResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('[QualityScoring] Failed to parse AI analysis:', error);
    }

    return this.getDefaultAIAnalysis();
  }

  /**
   * Get default AI analysis structure
   */
  private getDefaultAIAnalysis(): any {
    const defaultDimension = {
      score: 3.0,
      confidence: 0.7,
      evidence: ['Analysis incomplete'],
      gaps: ['Assessment failed'],
      suggestions: ['Manual review required']
    };

    return {
      dimensions: {
        accuracy: { ...defaultDimension },
        completeness: { ...defaultDimension },
        clarity: { ...defaultDimension },
        relevance: { ...defaultDimension },
        actionability: { ...defaultDimension },
        professionalTone: { ...defaultDimension },
        technicalDepth: { ...defaultDimension },
        frameworkAlignment: { ...defaultDimension },
        evidenceSupport: { ...defaultDimension },
        implementation: { ...defaultDimension }
      },
      overallConfidence: 0.7,
      criticalIssues: ['AI analysis failed'],
      strongPoints: [],
      improvementPriorities: ['Conduct manual review']
    };
  }

  // ============================================================================
  // RULE-BASED ANALYSIS METHODS
  // ============================================================================

  /**
   * Perform rule-based quality analysis
   */
  private async performRuleBasedAnalysis(request: QualityAssessmentRequest): Promise<any> {
    const analysis = {
      structureScore: this.analyzeContentStructure(request.content),
      lengthScore: this.analyzeContentLength(request.content, request.contentType),
      keywordScore: this.analyzeKeywordPresence(request.content, request.frameworks, request.categories),
      readabilityScore: this.analyzeReadability(request.content),
      consistencyScore: this.analyzeConsistency(request.content),
      formatScore: this.analyzeFormatting(request.content)
    };

    return analysis;
  }

  /**
   * Analyze content structure
   */
  private analyzeContentStructure(content: string): number {
    const sections = content.split(/\n\s*\n/);
    const headers = content.match(/^#{1,6}\s+.+$/gm) || [];
    const lists = content.match(/^\s*[-*+]\s+.+$/gm) || [];
    
    let score = 2.0; // Base score
    
    // Bonus for good structure
    if (sections.length >= 3) score += 0.5;
    if (headers.length >= 2) score += 0.5;
    if (lists.length >= 1) score += 0.3;
    if (content.includes('##')) score += 0.2; // Sub-headers
    
    return Math.min(score, 5.0);
  }

  /**
   * Analyze content length appropriateness
   */
  private analyzeContentLength(content: string, contentType: string): number {
    const wordCount = content.split(/\s+/).length;
    
    const idealRanges = {
      guidance: { min: 300, ideal: 800, max: 2000 },
      policy: { min: 200, ideal: 600, max: 1500 },
      procedure: { min: 400, ideal: 1000, max: 2500 },
      implementation: { min: 500, ideal: 1200, max: 3000 },
      evidence: { min: 100, ideal: 400, max: 1000 },
      training: { min: 600, ideal: 1500, max: 4000 }
    };

    const range = idealRanges[contentType as keyof typeof idealRanges] || idealRanges.guidance;
    
    if (wordCount < range.min) return 2.0;
    if (wordCount > range.max) return 3.5;
    if (wordCount >= range.ideal * 0.8 && wordCount <= range.ideal * 1.2) return 5.0;
    if (wordCount >= range.min && wordCount <= range.max) return 4.0;
    
    return 3.0;
  }

  /**
   * Analyze keyword presence for frameworks and categories
   */
  private analyzeKeywordPresence(content: string, frameworks: string[], categories: string[]): number {
    const lowerContent = content.toLowerCase();
    let score = 0;
    let totalExpected = 0;

    // Framework keywords
    const frameworkKeywords = {
      'iso27001': ['information security', 'isms', 'risk assessment', 'security policy'],
      'gdpr': ['personal data', 'data protection', 'consent', 'data subject'],
      'nist': ['cybersecurity', 'identify', 'protect', 'detect', 'respond', 'recover'],
      'cisControls': ['cis controls', 'safeguards', 'asset', 'implementation group'],
      'iso27002': ['security controls', 'implementation guidance', 'control objective'],
      'nis2': ['essential entity', 'cybersecurity measures', 'incident reporting']
    };

    for (const framework of frameworks) {
      const keywords = frameworkKeywords[framework as keyof typeof frameworkKeywords] || [];
      totalExpected += keywords.length;
      
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword)) {
          score += 1;
        }
      }
    }

    // Category keywords
    const categoryKeywords = {
      'governance': ['governance', 'leadership', 'management', 'oversight'],
      'risk': ['risk', 'threat', 'vulnerability', 'assessment'],
      'access': ['access', 'identity', 'authentication', 'authorization'],
      'data': ['data', 'information', 'privacy', 'classification'],
      'monitoring': ['monitoring', 'logging', 'detection', 'surveillance'],
      'incident': ['incident', 'response', 'recovery', 'breach'],
      'training': ['training', 'awareness', 'education', 'competency'],
      'vendor': ['vendor', 'supplier', 'third-party', 'outsourcing'],
      'physical': ['physical', 'facility', 'environmental', 'premises'],
      'network': ['network', 'firewall', 'infrastructure', 'security']
    };

    for (const category of categories) {
      const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
      totalExpected += keywords.length;
      
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword)) {
          score += 1;
        }
      }
    }

    return totalExpected > 0 ? Math.min((score / totalExpected) * 5, 5.0) : 3.0;
  }

  /**
   * Analyze readability
   */
  private analyzeReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability scoring
    let score = 5.0;
    
    if (avgWordsPerSentence > 25) score -= 1.0; // Too long sentences
    if (avgWordsPerSentence > 35) score -= 1.0; // Very long sentences
    if (avgWordsPerSentence < 8) score -= 0.5; // Too short sentences
    
    // Check for complex words (more than 2 syllables - simplified)
    const complexWords = words.filter(word => word.length > 8).length;
    const complexWordRatio = complexWords / words.length;
    
    if (complexWordRatio > 0.2) score -= 0.5;
    if (complexWordRatio > 0.3) score -= 0.5;
    
    return Math.max(score, 1.0);
  }

  /**
   * Analyze consistency
   */
  private analyzeConsistency(content: string): number {
    let score = 5.0;
    
    // Check for consistent terminology
    const variations = [
      ['cyber security', 'cybersecurity'],
      ['email', 'e-mail'],
      ['setup', 'set up'],
      ['login', 'log in'],
      ['backup', 'back up']
    ];
    
    for (const [term1, term2] of variations) {
      if (content.toLowerCase().includes(term1) && content.toLowerCase().includes(term2)) {
        score -= 0.3; // Inconsistent terminology
      }
    }
    
    // Check for consistent formatting
    const bulletPoints = content.match(/^\s*[-*+]\s+/gm) || [];
    const numberedLists = content.match(/^\s*\d+\.\s+/gm) || [];
    
    if (bulletPoints.length > 0 && numberedLists.length > 0) {
      // Mixed list styles - check if intentional
      score -= 0.2;
    }
    
    return Math.max(score, 1.0);
  }

  /**
   * Analyze formatting quality
   */
  private analyzeFormatting(content: string): number {
    let score = 3.0; // Base score
    
    // Check for good formatting elements
    if (content.includes('**') || content.includes('*')) score += 0.3; // Bold/italic
    if (content.match(/^#{1,6}\s+/gm)) score += 0.5; // Headers
    if (content.includes('```') || content.includes('`')) score += 0.2; // Code blocks
    if (content.match(/^\s*[-*+]\s+/gm)) score += 0.3; // Bullet points
    if (content.match(/^\s*\d+\.\s+/gm)) score += 0.3; // Numbered lists
    if (content.includes('> ')) score += 0.2; // Blockquotes
    if (content.match(/\[.+\]\(.+\)/)) score += 0.2; // Links
    
    return Math.min(score, 5.0);
  }

  // ============================================================================
  // FRAMEWORK COMPLIANCE METHODS
  // ============================================================================

  /**
   * Assess framework compliance
   */
  private async assessFrameworkCompliance(request: QualityAssessmentRequest): Promise<ComplianceAlignment> {
    const frameworks: FrameworkCompliance[] = [];
    const criticalGaps: ComplianceGap[] = [];
    const strengths: ComplianceStrength[] = [];
    
    for (const framework of request.frameworks) {
      try {
        const compliance = await this.assessSingleFrameworkCompliance(request.content, framework, request.categories);
        frameworks.push(compliance);
        
        // Extract critical gaps
        const frameworkGaps = compliance.gaps.map(gap => ({
          framework,
          control: 'General',
          severity: 'medium' as const,
          description: gap,
          impact: 'Compliance risk',
          recommendation: 'Address gap',
          effort: 'medium' as const
        }));
        criticalGaps.push(...frameworkGaps);
        
      } catch (error) {
        console.warn(`[QualityScoring] Framework compliance assessment failed for ${framework}:`, error);
        frameworks.push(this.getDefaultFrameworkCompliance(framework));
      }
    }

    const overallAlignment = frameworks.reduce((sum, f) => sum + f.alignment, 0) / frameworks.length;
    
    const recommendations: ComplianceRecommendation[] = criticalGaps
      .filter(gap => gap.severity === 'high' || gap.severity === 'critical')
      .slice(0, 5)
      .map(gap => ({
        framework: gap.framework,
        type: 'immediate',
        priority: gap.severity as any,
        action: gap.recommendation,
        rationale: gap.description,
        expectedImpact: gap.impact,
        resources: ['Internal team', 'Documentation review']
      }));

    return {
      frameworks,
      overallAlignment,
      criticalGaps: criticalGaps.slice(0, 10), // Top 10 critical gaps
      strengths,
      recommendations
    };
  }

  /**
   * Assess compliance for a single framework
   */
  private async assessSingleFrameworkCompliance(
    content: string,
    framework: string,
    categories: string[]
  ): Promise<FrameworkCompliance> {
    try {
      const compliancePrompt = `Assess ${framework} compliance for the following content:

CONTENT: ${content.substring(0, 2000)}...
CATEGORIES: ${categories.join(', ')}

Evaluate:
1. Framework alignment (0-1)
2. Coverage percentage (0-1)
3. Maturity level (0-1)
4. Specific gaps in ${framework} compliance
5. Control compliance status

Provide assessment as JSON with alignment, coverage, maturity, and gaps array.`;

      const request: ContentGenerationRequest = {
        prompt: compliancePrompt,
        contentType: 'validation',
        context: {
          frameworks: [framework],
          userRole: 'compliance-officer'
        },
        options: { temperature: 0.1, maxTokens: 1000 }
      };

      const response = await this.geminiGenerator.generateContent(request);
      return this.parseFrameworkComplianceResponse(response.content, framework);

    } catch (error) {
      console.warn(`[QualityScoring] Single framework compliance assessment failed for ${framework}:`, error);
      return this.getDefaultFrameworkCompliance(framework);
    }
  }

  /**
   * Parse framework compliance response
   */
  private parseFrameworkComplianceResponse(response: string, framework: string): FrameworkCompliance {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          framework,
          alignment: parsed.alignment || 0.7,
          coverage: parsed.coverage || 0.6,
          maturity: parsed.maturity || 0.5,
          gaps: parsed.gaps || ['Assessment incomplete'],
          controls: [] // Would be populated with specific control analysis
        };
      }
    } catch (error) {
      console.warn('[QualityScoring] Failed to parse framework compliance:', error);
    }

    return this.getDefaultFrameworkCompliance(framework);
  }

  /**
   * Get default framework compliance
   */
  private getDefaultFrameworkCompliance(framework: string): FrameworkCompliance {
    return {
      framework,
      alignment: 0.6,
      coverage: 0.5,
      maturity: 0.4,
      gaps: ['Framework assessment failed', 'Manual review required'],
      controls: []
    };
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate dimension scores
   */
  private async calculateDimensionScores(
    request: QualityAssessmentRequest,
    aiAnalysis: any,
    ruleBasedAnalysis: any
  ): Promise<QualityDimensions> {
    const weights = this.dimensionWeights[request.contentType] || this.dimensionWeights.guidance;
    const aiDimensions = aiAnalysis.dimensions || {};
    
    const calculateDimension = (dimensionName: string): DimensionScore => {
      const aiScore = aiDimensions[dimensionName]?.score || 3.0;
      const aiConfidence = aiDimensions[dimensionName]?.confidence || 0.7;
      const ruleScore = this.getRuleBasedScore(dimensionName, ruleBasedAnalysis);
      
      // Weighted combination of AI and rule-based scores
      const combinedScore = (aiScore * 0.7) + (ruleScore * 0.3);
      
      return {
        score: Math.min(Math.max(combinedScore, 0), 5),
        weight: weights[dimensionName as keyof typeof weights] || 0.1,
        confidence: aiConfidence,
        evidence: aiDimensions[dimensionName]?.evidence || [],
        gaps: aiDimensions[dimensionName]?.gaps || [],
        suggestions: aiDimensions[dimensionName]?.suggestions || []
      };
    };

    return {
      accuracy: calculateDimension('accuracy'),
      completeness: calculateDimension('completeness'),
      clarity: calculateDimension('clarity'),
      relevance: calculateDimension('relevance'),
      actionability: calculateDimension('actionability'),
      professionalTone: calculateDimension('professionalTone'),
      technicalDepth: calculateDimension('technicalDepth'),
      frameworkAlignment: calculateDimension('frameworkAlignment'),
      evidenceSupport: calculateDimension('evidenceSupport'),
      implementation: calculateDimension('implementation')
    };
  }

  /**
   * Get rule-based score for a dimension
   */
  private getRuleBasedScore(dimensionName: string, ruleBasedAnalysis: any): number {
    const mapping = {
      accuracy: (ruleBasedAnalysis.keywordScore + ruleBasedAnalysis.consistencyScore) / 2,
      completeness: (ruleBasedAnalysis.lengthScore + ruleBasedAnalysis.structureScore) / 2,
      clarity: (ruleBasedAnalysis.readabilityScore + ruleBasedAnalysis.formatScore) / 2,
      relevance: ruleBasedAnalysis.keywordScore,
      actionability: ruleBasedAnalysis.structureScore,
      professionalTone: (ruleBasedAnalysis.consistencyScore + ruleBasedAnalysis.formatScore) / 2,
      technicalDepth: ruleBasedAnalysis.keywordScore,
      frameworkAlignment: ruleBasedAnalysis.keywordScore,
      evidenceSupport: ruleBasedAnalysis.structureScore,
      implementation: ruleBasedAnalysis.structureScore
    };

    return mapping[dimensionName as keyof typeof mapping] || 3.0;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(dimensions: QualityDimensions, contentType: string): number {
    const weights = this.dimensionWeights[contentType] || this.dimensionWeights.guidance;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(dimensions).forEach(([key, dimension]) => {
      const weight = weights[key as keyof typeof weights] || 0.1;
      weightedSum += dimension.score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 3.0;
  }

  /**
   * Calculate confidence metrics
   */
  private async calculateConfidenceMetrics(
    request: QualityAssessmentRequest,
    dimensions: QualityDimensions,
    compliance: ComplianceAlignment
  ): Promise<ConfidenceMetrics> {
    const assessmentConfidence: AssessmentConfidence = {
      dataQuality: this.assessDataQuality(request.content),
      modelAccuracy: 0.85, // Based on historical performance
      frameworkCoverage: compliance.overallAlignment,
      contentCompleteness: dimensions.completeness.score / 5
    };

    const predictionConfidence: PredictionConfidence = {
      trendReliability: 0.8,
      futurePerformance: 0.75,
      improvementPotential: 0.85,
      riskAssessment: 0.8
    };

    const recommendationConfidence: RecommendationConfidence = {
      actionabilityScore: dimensions.actionability.score / 5,
      impactPrediction: 0.8,
      feasibilityAssessment: 0.85,
      successProbability: 0.75
    };

    const factors: ConfidenceFactor[] = [
      {
        factor: 'Content Length',
        impact: request.content.length > 500 ? 'positive' : 'negative',
        weight: 0.1,
        description: 'Sufficient content for analysis'
      },
      {
        factor: 'Framework Coverage',
        impact: request.frameworks.length > 0 ? 'positive' : 'negative',
        weight: 0.2,
        description: 'Framework context provided'
      },
      {
        factor: 'AI Model Performance',
        impact: 'positive',
        weight: 0.3,
        description: 'Model trained on compliance content'
      }
    ];

    const overall = (
      assessmentConfidence.dataQuality * 0.3 +
      assessmentConfidence.modelAccuracy * 0.3 +
      assessmentConfidence.frameworkCoverage * 0.2 +
      assessmentConfidence.contentCompleteness * 0.2
    );

    return {
      overall,
      assessment: assessmentConfidence,
      prediction: predictionConfidence,
      recommendation: recommendationConfidence,
      factors
    };
  }

  /**
   * Assess data quality for confidence calculation
   */
  private assessDataQuality(content: string): number {
    let score = 0.5; // Base score
    
    // Length factor
    if (content.length > 200) score += 0.1;
    if (content.length > 500) score += 0.1;
    if (content.length > 1000) score += 0.1;
    
    // Structure factor
    if (content.includes('\n')) score += 0.05;
    if (content.match(/^#{1,6}\s+/gm)) score += 0.1;
    if (content.match(/^\s*[-*+]\s+/gm)) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  // ============================================================================
  // IMPROVEMENT ANALYSIS METHODS
  // ============================================================================

  /**
   * Analyze improvement potential
   */
  private async analyzeImprovementPotential(
    request: QualityAssessmentRequest,
    dimensions: QualityDimensions,
    compliance: ComplianceAlignment
  ): Promise<ImprovementAnalysis> {
    const priority: ImprovementPriority[] = [];
    
    // Analyze each dimension for improvement potential
    Object.entries(dimensions).forEach(([key, dimension]) => {
      if (dimension.score < 4.0) {
        const targetScore = this.getTargetScore(key, request.frameworks);
        priority.push({
          dimension: key,
          currentScore: dimension.score,
          targetScore,
          effort: this.estimateEffort(key, dimension.score, targetScore),
          impact: this.estimateImpact(key, dimension.weight),
          urgency: this.estimateUrgency(key, dimension.score, request.frameworks),
          suggestions: dimension.suggestions
        });
      }
    });

    // Sort by impact and urgency
    priority.sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA;
    });

    const timeline: ImprovementTimeline = {
      immediate: priority.filter(p => p.urgency === 'high').map(p => p.dimension).slice(0, 3),
      shortTerm: priority.filter(p => p.urgency === 'medium').map(p => p.dimension).slice(0, 5),
      longTerm: priority.filter(p => p.urgency === 'low').map(p => p.dimension)
    };

    const resources: ResourceRequirement[] = [
      {
        type: 'human',
        description: 'Compliance specialist time',
        estimated: '2-4 hours per improvement',
        priority: 'high'
      },
      {
        type: 'training',
        description: 'Framework-specific training',
        estimated: '1-2 days per framework',
        priority: 'medium'
      }
    ];

    const dependencies: ImprovementDependency[] = [];
    const riskFactors: RiskFactor[] = [
      {
        factor: 'Resource availability',
        probability: 0.3,
        impact: 'medium',
        mitigation: ['Allocate dedicated time', 'Prioritize critical improvements']
      }
    ];

    const potential = this.calculateImprovementPotential(priority);

    return {
      potential,
      priority: priority.slice(0, 10), // Top 10 priorities
      timeline,
      resources,
      dependencies,
      riskFactors
    };
  }

  /**
   * Get target score for dimension based on frameworks
   */
  private getTargetScore(dimension: string, frameworks: string[]): number {
    let maxTarget = 4.0; // Default target
    
    for (const framework of frameworks) {
      const criteria = this.frameworkCriteria[framework as keyof typeof this.frameworkCriteria];
      if (criteria && criteria[dimension as keyof typeof criteria]) {
        maxTarget = Math.max(maxTarget, criteria[dimension as keyof typeof criteria].target);
      }
    }
    
    return maxTarget;
  }

  /**
   * Estimate effort required for improvement
   */
  private estimateEffort(dimension: string, currentScore: number, targetScore: number): 'low' | 'medium' | 'high' {
    const gap = targetScore - currentScore;
    const effortMap = {
      accuracy: gap > 1.0 ? 'high' : gap > 0.5 ? 'medium' : 'low',
      completeness: gap > 1.5 ? 'high' : gap > 0.8 ? 'medium' : 'low',
      clarity: gap > 1.0 ? 'medium' : 'low',
      technicalDepth: gap > 1.2 ? 'high' : gap > 0.6 ? 'medium' : 'low'
    };
    
    return effortMap[dimension as keyof typeof effortMap] || (gap > 1.0 ? 'medium' : 'low');
  }

  /**
   * Estimate impact of improvement
   */
  private estimateImpact(dimension: string, weight: number): 'low' | 'medium' | 'high' {
    if (weight > 0.15) return 'high';
    if (weight > 0.08) return 'medium';
    return 'low';
  }

  /**
   * Estimate urgency of improvement
   */
  private estimateUrgency(dimension: string, score: number, frameworks: string[]): 'low' | 'medium' | 'high' {
    const criticalDimensions = ['accuracy', 'frameworkAlignment', 'compliance'];
    
    if (criticalDimensions.includes(dimension) && score < 3.0) return 'high';
    if (score < 2.5) return 'high';
    if (score < 3.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate priority score for sorting
   */
  private calculatePriorityScore(priority: ImprovementPriority): number {
    const impactScore = { low: 1, medium: 2, high: 3 }[priority.impact];
    const urgencyScore = { low: 1, medium: 2, high: 3 }[priority.urgency];
    const effortScore = { low: 3, medium: 2, high: 1 }[priority.effort]; // Lower effort = higher score
    
    return (impactScore * 0.4) + (urgencyScore * 0.4) + (effortScore * 0.2);
  }

  /**
   * Calculate overall improvement potential
   */
  private calculateImprovementPotential(priorities: ImprovementPriority[]): number {
    if (priorities.length === 0) return 0.2; // Low potential if no improvements needed
    
    const avgGap = priorities.reduce((sum, p) => sum + (p.targetScore - p.currentScore), 0) / priorities.length;
    const maxPossibleGap = 5.0; // Maximum possible score
    
    return Math.min(avgGap / maxPossibleGap, 1.0);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate benchmark comparison
   */
  private async generateBenchmarkComparison(
    request: QualityAssessmentRequest,
    overallScore: number
  ): Promise<BenchmarkComparison> {
    // This would integrate with actual benchmark data
    return {
      industry: {
        industry: request.context.industry || 'General',
        averageScore: 3.5,
        percentile: Math.round((overallScore / 5.0) * 100),
        topQuartile: 4.2,
        comparison: overallScore > 3.5 ? 'Above average' : 'Below average'
      },
      size: {
        organizationSize: request.context.organizationSize,
        averageScore: 3.4,
        percentile: Math.round((overallScore / 5.0) * 100),
        comparison: overallScore > 3.4 ? 'Above average' : 'Below average'
      },
      maturity: {
        maturityLevel: request.context.complianceMaturity,
        expectedScore: this.getExpectedScoreForMaturity(request.context.complianceMaturity),
        actualScore: overallScore,
        maturityGap: overallScore - this.getExpectedScoreForMaturity(request.context.complianceMaturity),
        recommendations: []
      },
      historical: {
        timeframe: '30 days',
        trend: 'stable',
        rate: 0.02,
        factors: ['Content improvements', 'Framework updates'],
        prediction: {
          nextPeriod: overallScore + 0.1,
          confidence: 0.75,
          factors: ['Continued improvement efforts'],
          recommendations: ['Maintain current improvement pace']
        }
      }
    };
  }

  /**
   * Get expected score for maturity level
   */
  private getExpectedScoreForMaturity(maturity: string): number {
    const maturityScores = {
      'initial': 2.5,
      'developing': 3.0,
      'defined': 3.5,
      'managed': 4.0,
      'optimizing': 4.5
    };
    
    return maturityScores[maturity as keyof typeof maturityScores] || 3.0;
  }

  /**
   * Get framework versions
   */
  private getFrameworkVersions(frameworks: string[]): Record<string, string> {
    const versions: Record<string, string> = {};
    
    frameworks.forEach(framework => {
      versions[framework] = '2024.1'; // Simplified version tracking
    });
    
    return versions;
  }

  /**
   * Determine if review is required
   */
  private shouldRequireReview(overallScore: number, confidence: number): boolean {
    return overallScore < 3.0 || confidence < 0.7;
  }

  /**
   * Generate assessment ID
   */
  private generateAssessmentId(): string {
    return `qa_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Build error score for failed assessments
   */
  private buildErrorScore(request: QualityAssessmentRequest, error: any): QualityScore {
    const defaultDimension: DimensionScore = {
      score: 0,
      weight: 0.1,
      confidence: 0,
      evidence: [],
      gaps: ['Assessment failed'],
      suggestions: ['Manual review required']
    };

    return {
      overall: 0,
      dimensions: {
        accuracy: defaultDimension,
        completeness: defaultDimension,
        clarity: defaultDimension,
        relevance: defaultDimension,
        actionability: defaultDimension,
        professionalTone: defaultDimension,
        technicalDepth: defaultDimension,
        frameworkAlignment: defaultDimension,
        evidenceSupport: defaultDimension,
        implementation: defaultDimension
      },
      confidence: {
        overall: 0,
        assessment: { dataQuality: 0, modelAccuracy: 0, frameworkCoverage: 0, contentCompleteness: 0 },
        prediction: { trendReliability: 0, futurePerformance: 0, improvementPotential: 0, riskAssessment: 0 },
        recommendation: { actionabilityScore: 0, impactPrediction: 0, feasibilityAssessment: 0, successProbability: 0 },
        factors: []
      },
      compliance: {
        frameworks: request.frameworks.map(f => this.getDefaultFrameworkCompliance(f)),
        overallAlignment: 0,
        criticalGaps: [],
        strengths: [],
        recommendations: []
      },
      improvement: {
        potential: 0.5,
        priority: [],
        timeline: { immediate: [], shortTerm: [], longTerm: [] },
        resources: [],
        dependencies: [],
        riskFactors: []
      },
      metadata: {
        assessmentId: this.generateAssessmentId(),
        timestamp: new Date().toISOString(),
        processingTime: 0,
        modelVersion: '1.0.0',
        frameworkVersions: {},
        confidence: 0,
        reviewRequired: true
      }
    };
  }

  /**
   * Store assessment result
   */
  private async storeAssessmentResult(score: QualityScore, request: QualityAssessmentRequest): Promise<void> {
    try {
      await supabase
        .from('quality_assessments')
        .insert({
          assessment_id: score.metadata.assessmentId,
          content_type: request.contentType,
          frameworks: request.frameworks,
          categories: request.categories,
          overall_score: score.overall,
          dimensions: score.dimensions,
          confidence_metrics: score.confidence,
          compliance_alignment: score.compliance,
          improvement_analysis: score.improvement,
          context: request.context,
          metadata: score.metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('[QualityScoring] Failed to store assessment result:', error);
    }
  }

  /**
   * Perform quick quality check for real-time monitoring
   */
  private async performQuickQualityCheck(content: string): Promise<number> {
    // Simplified quality check for real-time use
    const wordCount = content.split(/\s+/).length;
    const structureScore = this.analyzeContentStructure(content);
    const readabilityScore = this.analyzeReadability(content);
    
    let score = 3.0; // Base score
    
    if (wordCount > 200) score += 0.5;
    if (wordCount > 500) score += 0.5;
    score += (structureScore - 3.0) * 0.3;
    score += (readabilityScore - 3.0) * 0.2;
    
    return Math.min(Math.max(score, 0), 5);
  }

  /**
   * Check quality thresholds and generate alerts
   */
  private checkQualityThresholds(score: number, thresholds: QualityThresholds): string[] {
    const alerts: string[] = [];
    
    if (score < thresholds.critical) {
      alerts.push('CRITICAL: Quality score below critical threshold');
    } else if (score < thresholds.warning) {
      alerts.push('WARNING: Quality score below warning threshold');
    }
    
    if (score < thresholds.minimum) {
      alerts.push('Quality score below minimum acceptable level');
    }
    
    return alerts;
  }

  /**
   * Trigger automatic improvement
   */
  private async triggerAutomaticImprovement(content: string, score: number): Promise<void> {
    // Implementation for automatic improvement triggers
    console.log(`[QualityScoring] Triggering automatic improvement for content with score ${score}`);
    // This would integrate with the enhancement engine
  }
}

// Export singleton instance
export const qualityScoringEngine = QualityScoringEngine.getInstance();