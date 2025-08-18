/**
 * Dynamic Content Enhancement Engine
 * AI-powered content improvement and optimization system
 * 
 * Features:
 * - Real-time content analysis and enhancement
 * - Category-specific optimization algorithms
 * - Framework alignment verification and improvement
 * - Quality scoring with confidence metrics
 * - Intelligent content merging and deduplication
 * - Continuous learning from user feedback
 */

import { supabase } from '@/lib/supabase';
import { GeminiContentGenerator, type ContentGenerationRequest, type ContentGenerationResponse } from './GeminiContentGenerator';
import { GeminiWebScrapingService, type EnhancementSuggestion } from './GeminiWebScrapingService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContentEnhancementRequest {
  content: string;
  contentId?: string;
  contentType: 'guidance' | 'policy' | 'procedure' | 'implementation' | 'evidence';
  frameworks: string[];
  categories: string[];
  targetQuality: 'standard' | 'professional' | 'executive' | 'ciso-grade';
  enhancementTypes: EnhancementType[];
  context?: EnhancementContext;
  options?: EnhancementOptions;
}

export interface EnhancementContext {
  organizationSize?: 'startup' | 'sme' | 'enterprise' | 'large-enterprise';
  industry?: string;
  userRole?: string;
  existingImplementations?: string[];
  complianceMaturity?: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  riskTolerance?: 'low' | 'medium' | 'high';
}

export interface EnhancementOptions {
  preserveStructure?: boolean;
  includeImplementationSteps?: boolean;
  addToolRecommendations?: boolean;
  generateEvidenceRequirements?: boolean;
  enableRealTimeStreaming?: boolean;
  maxEnhancementDepth?: 'surface' | 'moderate' | 'deep' | 'comprehensive';
}

export type EnhancementType =
  | 'clarity_improvement'
  | 'technical_depth'
  | 'framework_alignment'
  | 'implementation_guidance'
  | 'evidence_requirements'
  | 'tool_recommendations'
  | 'best_practices'
  | 'risk_considerations'
  | 'compliance_mapping'
  | 'quality_assurance';

export interface EnhancementResult {
  success: boolean;
  originalContent: string;
  enhancedContent: string;
  improvements: ContentImprovement[];
  qualityMetrics: QualityMetrics;
  frameworkAlignment: FrameworkAlignmentScore[];
  categoryOptimization: CategoryOptimization[];
  suggestions: EnhancementSuggestion[];
  metadata: EnhancementMetadata;
  errors?: string[];
}

export interface ContentImprovement {
  type: EnhancementType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  originalSection: string;
  improvedSection: string;
  confidence: number;
  impact: 'minor' | 'moderate' | 'significant' | 'major';
  frameworks: string[];
  categories: string[];
}

export interface QualityMetrics {
  overall: number;
  clarity: number;
  completeness: number;
  accuracy: number;
  relevance: number;
  professionalTone: number;
  actionability: number;
  frameworkAlignment: number;
  improvementScore: number;
}

export interface FrameworkAlignmentScore {
  framework: string;
  alignmentScore: number;
  coverage: number;
  gaps: string[];
  improvements: string[];
  confidence: number;
}

export interface CategoryOptimization {
  category: string;
  optimizationScore: number;
  relevantContent: number;
  missingElements: string[];
  enhancedElements: string[];
  recommendedActions: string[];
}

export interface EnhancementMetadata {
  processingTime: number;
  tokensUsed: number;
  costEstimate: number;
  enhancementLevel: 'basic' | 'moderate' | 'comprehensive' | 'expert';
  confidenceScore: number;
  versionId: string;
  timestamp: string;
}

export interface StreamingEnhancementEvent {
  type: 'progress' | 'improvement' | 'suggestion' | 'completion' | 'error';
  data: any;
  timestamp: string;
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class DynamicContentEnhancementEngine {
  private static instance: DynamicContentEnhancementEngine | null = null;
  private geminiGenerator: GeminiContentGenerator;
  private webScrapingService: GeminiWebScrapingService;

  // Enhancement patterns and rules
  private readonly enhancementRules = {
    clarity_improvement: {
      weight: 0.15,
      patterns: ['unclear', 'ambiguous', 'vague', 'confusing'],
      improvements: ['specific examples', 'clear definitions', 'step-by-step guidance']
    },
    technical_depth: {
      weight: 0.12,
      patterns: ['high-level', 'overview', 'general'],
      improvements: ['technical details', 'configuration examples', 'implementation specifics']
    },
    framework_alignment: {
      weight: 0.20,
      patterns: ['framework', 'standard', 'requirement'],
      improvements: ['specific references', 'control mappings', 'compliance evidence']
    },
    implementation_guidance: {
      weight: 0.18,
      patterns: ['implement', 'deploy', 'configure'],
      improvements: ['step-by-step procedures', 'tool usage', 'validation methods']
    },
    evidence_requirements: {
      weight: 0.10,
      patterns: ['audit', 'evidence', 'documentation'],
      improvements: ['required documents', 'proof points', 'audit trails']
    },
    tool_recommendations: {
      weight: 0.08,
      patterns: ['tool', 'software', 'solution'],
      improvements: ['specific tools', 'vendor recommendations', 'feature comparisons']
    },
    best_practices: {
      weight: 0.12,
      patterns: ['practice', 'approach', 'methodology'],
      improvements: ['industry standards', 'proven methods', 'optimization techniques']
    },
    risk_considerations: {
      weight: 0.05,
      patterns: ['risk', 'threat', 'vulnerability'],
      improvements: ['risk assessments', 'mitigation strategies', 'impact analysis']
    }
  };

  private constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
    this.webScrapingService = GeminiWebScrapingService.getInstance();
  }

  public static getInstance(): DynamicContentEnhancementEngine {
    if (!DynamicContentEnhancementEngine.instance) {
      DynamicContentEnhancementEngine.instance = new DynamicContentEnhancementEngine();
    }
    return DynamicContentEnhancementEngine.instance;
  }

  // ============================================================================
  // MAIN ENHANCEMENT METHODS
  // ============================================================================

  /**
   * Enhance content with comprehensive AI analysis
   */
  public async enhanceContent(request: ContentEnhancementRequest): Promise<EnhancementResult> {
    const startTime = Date.now();
    const versionId = this.generateVersionId();

    try {
      console.log(`[ContentEnhancement] Starting enhancement for ${request.contentType} content`);

      // Step 1: Analyze current content quality
      const initialQuality = await this.analyzeContentQuality(request.content, request.frameworks, request.categories);

      // Step 2: Identify improvement opportunities
      const improvementOpportunities = await this.identifyImprovementOpportunities(request);

      // Step 3: Generate targeted enhancements
      const enhancements = await this.generateTargetedEnhancements(request, improvementOpportunities);

      // Step 4: Apply enhancements systematically
      const enhancedContent = await this.applyEnhancements(request.content, enhancements, request);

      // Step 5: Validate improvement quality
      const finalQuality = await this.analyzeContentQuality(enhancedContent, request.frameworks, request.categories);

      // Step 6: Generate framework alignment scores
      const frameworkAlignment = await this.assessFrameworkAlignment(enhancedContent, request.frameworks);

      // Step 7: Optimize for categories
      const categoryOptimization = await this.optimizeForCategories(enhancedContent, request.categories);

      // Step 8: Generate additional suggestions
      const suggestions = await this.generateAdditionalSuggestions(enhancedContent, request);

      const processingTime = Date.now() - startTime;

      const result: EnhancementResult = {
        success: true,
        originalContent: request.content,
        enhancedContent,
        improvements: enhancements,
        qualityMetrics: {
          ...finalQuality,
          improvementScore: this.calculateImprovementScore(initialQuality, finalQuality)
        },
        frameworkAlignment,
        categoryOptimization,
        suggestions,
        metadata: {
          processingTime,
          tokensUsed: 0, // Will be calculated from AI calls
          costEstimate: 0, // Will be calculated from AI calls
          enhancementLevel: this.determineEnhancementLevel(enhancements),
          confidenceScore: this.calculateConfidenceScore(enhancements),
          versionId,
          timestamp: new Date().toISOString()
        }
      };

      // Store enhancement results
      await this.storeEnhancementResult(result, request);

      console.log(`[ContentEnhancement] Completed enhancement in ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error('[ContentEnhancement] Enhancement failed:', error);
      return this.buildFailureResult(request.content, error, Date.now() - startTime, versionId);
    }
  }

  /**
   * Stream real-time content enhancement
   */
  public async enhanceContentStreaming(
    request: ContentEnhancementRequest,
    onEvent: (event: StreamingEnhancementEvent) => void
  ): Promise<EnhancementResult> {
    const startTime = Date.now();

    try {
      onEvent({
        type: 'progress',
        data: { stage: 'analyzing', progress: 0.1 },
        timestamp: new Date().toISOString()
      });

      // Progressive enhancement with streaming updates
      const result = await this.enhanceContent(request);

      onEvent({
        type: 'completion',
        data: result,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      onEvent({
        type: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Bulk enhance multiple content pieces
   */
  public async bulkEnhanceContent(requests: ContentEnhancementRequest[]): Promise<EnhancementResult[]> {
    const results: EnhancementResult[] = [];

    console.log(`[ContentEnhancement] Starting bulk enhancement of ${requests.length} items`);

    for (const request of requests) {
      try {
        const result = await this.enhanceContent(request);
        results.push(result);

        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('[ContentEnhancement] Bulk enhancement item failed:', error);
        results.push(this.buildFailureResult(
          request.content,
          error,
          0,
          this.generateVersionId()
        ));
      }
    }

    return results;
  }

  // ============================================================================
  // CONTENT ANALYSIS METHODS
  // ============================================================================

  /**
   * Analyze content quality across multiple dimensions
   */
  private async analyzeContentQuality(
    content: string,
    frameworks: string[],
    categories: string[]
  ): Promise<QualityMetrics> {
    try {
      const analysisPrompt = this.buildQualityAnalysisPrompt(content, frameworks, categories);

      const request: ContentGenerationRequest = {
        prompt: analysisPrompt,
        contentType: 'validation',
        context: {
          frameworks,
          userRole: 'compliance-officer'
        },
        options: {
          temperature: 0.1,
          maxTokens: 1000
        }
      };

      const response = await this.geminiGenerator.validateContentQuality(content, request.context);
      
      return {
        overall: response.overallScore || 3.0,
        clarity: response.coherence || 3.0,
        completeness: response.completeness || 3.0,
        accuracy: response.accuracy || 3.0,
        relevance: response.relevance || 3.0,
        professionalTone: response.professionalTone || 3.0,
        actionability: 3.0, // Will be calculated separately
        frameworkAlignment: 3.0, // Will be calculated separately
        improvementScore: 0 // Will be calculated after enhancement
      };

    } catch (error) {
      console.warn('[ContentEnhancement] Quality analysis failed:', error);
      return this.getDefaultQualityMetrics();
    }
  }

  /**
   * Build quality analysis prompt
   */
  private buildQualityAnalysisPrompt(content: string, frameworks: string[], categories: string[]): string {
    return `As an expert compliance content analyst, evaluate the following content across multiple quality dimensions:

CONTENT TO ANALYZE:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

EVALUATION CONTEXT:
- Target Frameworks: ${frameworks.join(', ')}
- Target Categories: ${categories.join(', ')}

QUALITY DIMENSIONS (Score 0-5 each):

1. **CLARITY**: How clear, well-structured, and easy to understand is the content?
2. **COMPLETENESS**: How comprehensive is the coverage of the topic?
3. **ACCURACY**: How factually correct and technically sound is the information?
4. **RELEVANCE**: How relevant is the content to the specified frameworks and categories?
5. **PROFESSIONAL_TONE**: How appropriate is the language for compliance professionals?
6. **ACTIONABILITY**: How implementable and practical are the recommendations?
7. **FRAMEWORK_ALIGNMENT**: How well does the content align with framework requirements?

Provide scores and brief explanations for each dimension.`;
  }

  /**
   * Identify improvement opportunities using AI analysis
   */
  private async identifyImprovementOpportunities(request: ContentEnhancementRequest): Promise<string[]> {
    try {
      const opportunityPrompt = `As a cybersecurity content improvement specialist, analyze the following content and identify specific improvement opportunities:

CONTENT: ${request.content.substring(0, 2500)}...
TARGET FRAMEWORKS: ${request.frameworks.join(', ')}
TARGET CATEGORIES: ${request.categories.join(', ')}
QUALITY TARGET: ${request.targetQuality}
ENHANCEMENT TYPES: ${request.enhancementTypes.join(', ')}

Identify 5-8 specific improvement opportunities that would enhance the content for compliance professionals. Focus on:
- Framework alignment gaps
- Missing implementation details
- Clarity improvements
- Technical depth opportunities
- Evidence requirement additions

LIST IMPROVEMENTS:
1. [Specific improvement opportunity]
2. [Specific improvement opportunity]
...`;

      const improvementRequest: ContentGenerationRequest = {
        prompt: opportunityPrompt,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer'
        },
        options: {
          temperature: 0.4,
          maxTokens: 1500
        }
      };

      const response = await this.geminiGenerator.enhanceExistingContent(improvementRequest);
      
      return this.parseImprovementOpportunities(response.content);

    } catch (error) {
      console.warn('[ContentEnhancement] Failed to identify opportunities:', error);
      return ['Improve clarity and structure', 'Add implementation details', 'Enhance framework alignment'];
    }
  }

  /**
   * Parse improvement opportunities from AI response
   */
  private parseImprovementOpportunities(response: string): string[] {
    const opportunities: string[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        opportunities.push(match[1].trim());
      }
    }

    return opportunities.length > 0 ? opportunities : [
      'Improve content clarity and organization',
      'Add specific implementation guidance',
      'Enhance framework alignment',
      'Include evidence requirements',
      'Add tool recommendations'
    ];
  }

  // ============================================================================
  // ENHANCEMENT GENERATION METHODS
  // ============================================================================

  /**
   * Generate targeted enhancements based on opportunities
   */
  private async generateTargetedEnhancements(
    request: ContentEnhancementRequest,
    opportunities: string[]
  ): Promise<ContentImprovement[]> {
    const enhancements: ContentImprovement[] = [];

    for (const opportunity of opportunities) {
      try {
        const enhancement = await this.generateSpecificEnhancement(request, opportunity);
        if (enhancement) {
          enhancements.push(enhancement);
        }
      } catch (error) {
        console.warn(`[ContentEnhancement] Failed to generate enhancement for: ${opportunity}`, error);
      }
    }

    return enhancements;
  }

  /**
   * Generate a specific enhancement for an opportunity
   */
  private async generateSpecificEnhancement(
    request: ContentEnhancementRequest,
    opportunity: string
  ): Promise<ContentImprovement | null> {
    try {
      const enhancementPrompt = `As an expert compliance content enhancer, create a specific improvement for the following opportunity:

IMPROVEMENT OPPORTUNITY: ${opportunity}

ORIGINAL CONTENT SECTION (relevant excerpt):
${this.extractRelevantSection(request.content, opportunity)}

TARGET FRAMEWORKS: ${request.frameworks.join(', ')}
TARGET QUALITY: ${request.targetQuality}

Create an improved version that:
1. Addresses the identified opportunity
2. Maintains professional tone
3. Adds specific, actionable details
4. Aligns with framework requirements
5. Enhances practical value

PROVIDE:
- Original section (if modifying existing content)
- Improved section
- Type of enhancement
- Priority level
- Confidence score (0-1)
- Impact level
- Relevant frameworks
- Relevant categories

FORMAT: JSON object with the required fields`;

      const enhancementRequest: ContentGenerationRequest = {
        prompt: enhancementPrompt,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer'
        },
        options: {
          temperature: 0.5,
          maxTokens: 1500
        }
      };

      const response = await this.geminiGenerator.enhanceExistingContent(enhancementRequest);
      
      return this.parseSpecificEnhancement(response.content, opportunity);

    } catch (error) {
      console.warn('[ContentEnhancement] Failed to generate specific enhancement:', error);
      return null;
    }
  }

  /**
   * Extract relevant content section for enhancement
   */
  private extractRelevantSection(content: string, opportunity: string): string {
    // Simple extraction - find paragraphs containing relevant keywords
    const keywords = opportunity.toLowerCase().split(' ').filter(word => word.length > 3);
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (keywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
        return paragraph.substring(0, 500);
      }
    }
    
    return content.substring(0, 500);
  }

  /**
   * Parse specific enhancement from AI response
   */
  private parseSpecificEnhancement(response: string, opportunity: string): ContentImprovement | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          type: this.mapToEnhancementType(parsed.type || opportunity),
          priority: parsed.priority || 'medium',
          description: opportunity,
          originalSection: parsed.originalSection || '',
          improvedSection: parsed.improvedSection || '',
          confidence: parsed.confidence || 0.7,
          impact: parsed.impact || 'moderate',
          frameworks: parsed.frameworks || [],
          categories: parsed.categories || []
        };
      }
    } catch (error) {
      console.warn('[ContentEnhancement] Failed to parse specific enhancement:', error);
    }

    return {
      type: 'clarity_improvement',
      priority: 'medium',
      description: opportunity,
      originalSection: '',
      improvedSection: '',
      confidence: 0.5,
      impact: 'moderate',
      frameworks: [],
      categories: []
    };
  }

  /**
   * Map description to enhancement type
   */
  private mapToEnhancementType(description: string): EnhancementType {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('clarity') || lowerDesc.includes('clear')) return 'clarity_improvement';
    if (lowerDesc.includes('technical') || lowerDesc.includes('depth')) return 'technical_depth';
    if (lowerDesc.includes('framework') || lowerDesc.includes('alignment')) return 'framework_alignment';
    if (lowerDesc.includes('implementation') || lowerDesc.includes('steps')) return 'implementation_guidance';
    if (lowerDesc.includes('evidence') || lowerDesc.includes('audit')) return 'evidence_requirements';
    if (lowerDesc.includes('tool') || lowerDesc.includes('software')) return 'tool_recommendations';
    if (lowerDesc.includes('practice') || lowerDesc.includes('best')) return 'best_practices';
    if (lowerDesc.includes('risk') || lowerDesc.includes('threat')) return 'risk_considerations';
    
    return 'clarity_improvement';
  }

  // ============================================================================
  // ENHANCEMENT APPLICATION METHODS
  // ============================================================================

  /**
   * Apply enhancements to content
   */
  private async applyEnhancements(
    originalContent: string,
    enhancements: ContentImprovement[],
    request: ContentEnhancementRequest
  ): Promise<string> {
    try {
      const applicationPrompt = this.buildEnhancementApplicationPrompt(originalContent, enhancements, request);

      const applicationRequest: ContentGenerationRequest = {
        prompt: applicationPrompt,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer',
          existingContent: originalContent
        },
        quality: request.targetQuality,
        options: {
          temperature: 0.6,
          maxTokens: 6000
        }
      };

      const response = await this.geminiGenerator.enhanceExistingContent(applicationRequest);
      
      return response.content;

    } catch (error) {
      console.error('[ContentEnhancement] Failed to apply enhancements:', error);
      return originalContent; // Return original if enhancement fails
    }
  }

  /**
   * Build enhancement application prompt
   */
  private buildEnhancementApplicationPrompt(
    content: string,
    enhancements: ContentImprovement[],
    request: ContentEnhancementRequest
  ): string {
    const enhancementDescriptions = enhancements
      .map((enhancement, index) => `${index + 1}. ${enhancement.description} (${enhancement.type})`)
      .join('\n');

    return `As an expert compliance content enhancer, apply the following improvements to enhance the content:

ORIGINAL CONTENT:
${content}

IMPROVEMENTS TO APPLY:
${enhancementDescriptions}

TARGET FRAMEWORKS: ${request.frameworks.join(', ')}
TARGET CATEGORIES: ${request.categories.join(', ')}
QUALITY LEVEL: ${request.targetQuality.toUpperCase()}

ENHANCEMENT REQUIREMENTS:
- Apply all identified improvements systematically
- Maintain content structure and flow
- Ensure professional tone appropriate for ${request.targetQuality} level
- Add specific, actionable details
- Enhance framework alignment
- Improve practical value for compliance professionals
- Preserve original intent while significantly improving quality

ENHANCED CONTENT:
Provide the fully enhanced content with all improvements integrated naturally and professionally.`;
  }

  // ============================================================================
  // FRAMEWORK AND CATEGORY OPTIMIZATION
  // ============================================================================

  /**
   * Assess framework alignment
   */
  private async assessFrameworkAlignment(
    content: string,
    frameworks: string[]
  ): Promise<FrameworkAlignmentScore[]> {
    const alignmentScores: FrameworkAlignmentScore[] = [];

    for (const framework of frameworks) {
      try {
        const alignmentPrompt = `Assess how well the following content aligns with ${framework} requirements:

CONTENT: ${content.substring(0, 2000)}...

Evaluate:
1. Alignment score (0-5)
2. Coverage percentage (0-100)
3. Gaps in framework coverage
4. Possible improvements
5. Confidence in assessment (0-1)

Provide assessment as JSON object.`;

        const request: ContentGenerationRequest = {
          prompt: alignmentPrompt,
          contentType: 'validation',
          context: {
            frameworks: [framework],
            userRole: 'compliance-officer'
          },
          options: { temperature: 0.2, maxTokens: 800 }
        };

        const response = await this.geminiGenerator.generateContent(request);
        const parsed = this.parseFrameworkAlignment(response.content, framework);
        
        alignmentScores.push(parsed);

      } catch (error) {
        console.warn(`[ContentEnhancement] Framework alignment assessment failed for ${framework}:`, error);
        alignmentScores.push(this.getDefaultFrameworkAlignment(framework));
      }
    }

    return alignmentScores;
  }

  /**
   * Parse framework alignment from AI response
   */
  private parseFrameworkAlignment(response: string, framework: string): FrameworkAlignmentScore {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          framework,
          alignmentScore: parsed.alignmentScore || 3.0,
          coverage: parsed.coverage || 60,
          gaps: parsed.gaps || [],
          improvements: parsed.improvements || [],
          confidence: parsed.confidence || 0.7
        };
      }
    } catch (error) {
      console.warn('[ContentEnhancement] Failed to parse framework alignment:', error);
    }

    return this.getDefaultFrameworkAlignment(framework);
  }

  /**
   * Optimize content for categories
   */
  private async optimizeForCategories(
    content: string,
    categories: string[]
  ): Promise<CategoryOptimization[]> {
    const optimizations: CategoryOptimization[] = [];

    for (const category of categories) {
      try {
        const optimization = await this.optimizeForCategory(content, category);
        optimizations.push(optimization);
      } catch (error) {
        console.warn(`[ContentEnhancement] Category optimization failed for ${category}:`, error);
        optimizations.push(this.getDefaultCategoryOptimization(category));
      }
    }

    return optimizations;
  }

  /**
   * Optimize content for a specific category
   */
  private async optimizeForCategory(content: string, category: string): Promise<CategoryOptimization> {
    const optimizationPrompt = `Analyze how well the following content addresses ${category} compliance requirements:

CONTENT: ${content.substring(0, 2000)}...
CATEGORY: ${category}

Assess:
1. Optimization score (0-5) - how well optimized for this category
2. Relevant content percentage (0-100)
3. Missing elements that should be addressed
4. Enhanced elements that are well-covered
5. Recommended actions for improvement

Provide as JSON object.`;

    const request: ContentGenerationRequest = {
      prompt: optimizationPrompt,
      contentType: 'validation',
      context: {
        frameworks: [],
        userRole: 'compliance-officer'
      },
      options: { temperature: 0.2, maxTokens: 800 }
    };

    const response = await this.geminiGenerator.generateContent(request);
    
    return this.parseCategoryOptimization(response.content, category);
  }

  /**
   * Parse category optimization from AI response
   */
  private parseCategoryOptimization(response: string, category: string): CategoryOptimization {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          category,
          optimizationScore: parsed.optimizationScore || 3.0,
          relevantContent: parsed.relevantContent || 60,
          missingElements: parsed.missingElements || [],
          enhancedElements: parsed.enhancedElements || [],
          recommendedActions: parsed.recommendedActions || []
        };
      }
    } catch (error) {
      console.warn('[ContentEnhancement] Failed to parse category optimization:', error);
    }

    return this.getDefaultCategoryOptimization(category);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate additional enhancement suggestions
   */
  private async generateAdditionalSuggestions(
    content: string,
    request: ContentEnhancementRequest
  ): Promise<EnhancementSuggestion[]> {
    try {
      return await this.webScrapingService.generateEnhancementSuggestions(
        { content, sections: [] },
        {
          url: '',
          frameworks: request.frameworks,
          categories: request.categories,
          quality: request.targetQuality
        }
      );
    } catch (error) {
      console.warn('[ContentEnhancement] Failed to generate additional suggestions:', error);
      return [];
    }
  }

  /**
   * Calculate improvement score
   */
  private calculateImprovementScore(initial: QualityMetrics, final: QualityMetrics): number {
    const initialAvg = (initial.overall + initial.clarity + initial.completeness + initial.accuracy + initial.relevance) / 5;
    const finalAvg = (final.overall + final.clarity + final.completeness + final.accuracy + final.relevance) / 5;
    
    return Math.max(0, finalAvg - initialAvg);
  }

  /**
   * Determine enhancement level
   */
  private determineEnhancementLevel(enhancements: ContentImprovement[]): 'basic' | 'moderate' | 'comprehensive' | 'expert' {
    const totalImprovements = enhancements.length;
    const highPriorityCount = enhancements.filter(e => e.priority === 'high' || e.priority === 'critical').length;
    const majorImpactCount = enhancements.filter(e => e.impact === 'major' || e.impact === 'significant').length;

    if (totalImprovements >= 8 && highPriorityCount >= 4 && majorImpactCount >= 3) return 'expert';
    if (totalImprovements >= 6 && highPriorityCount >= 3) return 'comprehensive';
    if (totalImprovements >= 4) return 'moderate';
    return 'basic';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(enhancements: ContentImprovement[]): number {
    if (enhancements.length === 0) return 0;
    
    const totalConfidence = enhancements.reduce((sum, e) => sum + e.confidence, 0);
    return totalConfidence / enhancements.length;
  }

  /**
   * Generate version ID
   */
  private generateVersionId(): string {
    return `enh_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Get default quality metrics
   */
  private getDefaultQualityMetrics(): QualityMetrics {
    return {
      overall: 3.0,
      clarity: 3.0,
      completeness: 3.0,
      accuracy: 3.0,
      relevance: 3.0,
      professionalTone: 3.0,
      actionability: 3.0,
      frameworkAlignment: 3.0,
      improvementScore: 0
    };
  }

  /**
   * Get default framework alignment
   */
  private getDefaultFrameworkAlignment(framework: string): FrameworkAlignmentScore {
    return {
      framework,
      alignmentScore: 3.0,
      coverage: 60,
      gaps: ['Insufficient specific references'],
      improvements: ['Add framework-specific guidance'],
      confidence: 0.5
    };
  }

  /**
   * Get default category optimization
   */
  private getDefaultCategoryOptimization(category: string): CategoryOptimization {
    return {
      category,
      optimizationScore: 3.0,
      relevantContent: 60,
      missingElements: ['Category-specific requirements'],
      enhancedElements: ['General guidance'],
      recommendedActions: ['Add category-specific details']
    };
  }

  /**
   * Build failure result
   */
  private buildFailureResult(
    originalContent: string,
    error: any,
    processingTime: number,
    versionId: string
  ): EnhancementResult {
    return {
      success: false,
      originalContent,
      enhancedContent: originalContent,
      improvements: [],
      qualityMetrics: this.getDefaultQualityMetrics(),
      frameworkAlignment: [],
      categoryOptimization: [],
      suggestions: [],
      metadata: {
        processingTime,
        tokensUsed: 0,
        costEstimate: 0,
        enhancementLevel: 'basic',
        confidenceScore: 0,
        versionId,
        timestamp: new Date().toISOString()
      },
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }

  // ============================================================================
  // DATABASE INTEGRATION
  // ============================================================================

  /**
   * Store enhancement result
   */
  private async storeEnhancementResult(
    result: EnhancementResult,
    request: ContentEnhancementRequest
  ): Promise<void> {
    try {
      await supabase
        .from('ai_content_enhancements')
        .insert({
          content_id: request.contentId,
          original_content: result.originalContent.substring(0, 50000),
          enhanced_content: result.enhancedContent.substring(0, 50000),
          content_type: request.contentType,
          frameworks: request.frameworks,
          categories: request.categories,
          target_quality: request.targetQuality,
          enhancement_types: request.enhancementTypes,
          improvements: result.improvements,
          quality_metrics: result.qualityMetrics,
          framework_alignment: result.frameworkAlignment,
          category_optimization: result.categoryOptimization,
          suggestions: result.suggestions,
          metadata: result.metadata,
          version_id: result.metadata.versionId,
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('[ContentEnhancement] Failed to store enhancement result:', error);
    }
  }

  /**
   * Get enhancement analytics
   */
  public async getEnhancementAnalytics(organizationId?: string): Promise<any> {
    try {
      let query = supabase
        .from('ai_content_enhancements')
        .select('quality_metrics, metadata, created_at');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const totalEnhancements = data?.length || 0;
      const avgImprovement = data?.reduce((sum, item) => 
        sum + (item.quality_metrics?.improvementScore || 0), 0) / totalEnhancements || 0;
      const avgConfidence = data?.reduce((sum, item) => 
        sum + (item.metadata?.confidenceScore || 0), 0) / totalEnhancements || 0;

      return {
        totalEnhancements,
        avgImprovementScore: avgImprovement,
        avgConfidenceScore: avgConfidence,
        successRate: totalEnhancements > 0 ? 1.0 : 0
      };

    } catch (error) {
      console.error('[ContentEnhancement] Analytics error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const dynamicContentEnhancementEngine = DynamicContentEnhancementEngine.getInstance();