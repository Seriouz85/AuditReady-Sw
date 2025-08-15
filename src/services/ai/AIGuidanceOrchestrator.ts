/**
 * AI-Powered Unified Guidance Orchestrator
 * =====================================
 * 
 * Central coordination service that orchestrates all AI-powered guidance generation.
 * Provides a unified API for frontend components while coordinating between:
 * - Template management
 * - AI content generation (Gemini)
 * - Content caching
 * - Quality validation
 * - Database operations
 * 
 * Features:
 * - Framework requirement mapping and context building
 * - Intelligent caching with cache-first retrieval
 * - Multi-dimensional quality assessment
 * - Cost optimization and performance monitoring
 * - Seamless integration with existing ComplianceSimplification
 * - CISO-grade content standards enforcement
 */

import { supabase } from '../../lib/supabase';
import { GeminiContentGenerator, ContentGenerationRequest, ContentGenerationResponse, GenerationContext, QualityLevel } from './GeminiContentGenerator';
import { TemplateManager } from './TemplateManager';
import { ContentCacheManager } from './ContentCacheManager';
import { QualityValidator } from './QualityValidator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GuidanceGenerationRequest {
  category: string;
  frameworks: Record<string, boolean | string>;
  requirements?: any[];
  sessionId?: string;
  userId?: string;
  organizationId?: string;
  userContext?: UserContext;
  options?: GuidanceOptions;
}

export interface UserContext {
  industry?: string;
  organizationSize?: 'startup' | 'sme' | 'enterprise' | 'large-enterprise';
  userRole?: 'ciso' | 'security-analyst' | 'compliance-officer' | 'auditor' | 'manager' | 'beginner';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences?: {
    showReferences?: boolean;
    detailLevel?: 'basic' | 'standard' | 'detailed' | 'comprehensive';
    outputFormat?: 'markdown' | 'structured' | 'executive_summary';
  };
}

export interface GuidanceOptions {
  quality?: QualityLevel;
  useCache?: boolean;
  forceRegeneration?: boolean;
  enhanceExisting?: boolean;
  includeReferences?: boolean;
  maxCacheAge?: number; // in hours
  timeout?: number; // in milliseconds
}

export interface UnifiedGuidanceResponse {
  content: string;
  contentSections: {
    foundation?: string;
    implementation?: string;
    tools?: string;
    evidence?: string;
    references?: string[];
  };
  metadata: {
    source: 'cache' | 'ai_generated' | 'template' | 'hybrid';
    qualityScore: number;
    generationTime: number;
    tokensUsed?: number;
    cost?: number;
    frameworksCovered: string[];
    confidence: number;
  };
  recommendations?: string[];
  relatedCategories?: string[];
  templateId?: string;
  cacheKey?: string;
}

export interface FrameworkMapping {
  framework: string;
  requirements: any[];
  relevance: number;
  context: string;
}

export interface GuidanceAnalytics {
  totalRequests: number;
  cacheHitRate: number;
  averageQuality: number;
  totalCost: number;
  popularCategories: string[];
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    userSatisfaction: number;
  };
}

// ============================================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================================

export class AIGuidanceOrchestrator {
  private static instance: AIGuidanceOrchestrator | null = null;
  private geminiGenerator: GeminiContentGenerator;
  private templateManager: TemplateManager;
  private cacheManager: ContentCacheManager;
  private qualityValidator: QualityValidator;

  private constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
    this.templateManager = new TemplateManager();
    this.cacheManager = new ContentCacheManager();
    this.qualityValidator = new QualityValidator();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIGuidanceOrchestrator {
    if (!AIGuidanceOrchestrator.instance) {
      AIGuidanceOrchestrator.instance = new AIGuidanceOrchestrator();
    }
    return AIGuidanceOrchestrator.instance;
  }

  // ============================================================================
  // MAIN GENERATION METHODS
  // ============================================================================

  /**
   * Generate unified guidance content for a category with framework mapping
   */
  public async generateGuidance(request: GuidanceGenerationRequest): Promise<UnifiedGuidanceResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`[AIGuidanceOrchestrator] Starting guidance generation for category: ${request.category}`, {
      requestId,
      frameworks: Object.keys(request.frameworks).filter(f => request.frameworks[f])
    });

    try {
      // Step 1: Build framework context and mappings
      const frameworkMappings = await this.buildFrameworkMappings(request);
      
      // Step 2: Generate cache key
      const cacheKey = await this.cacheManager.generateCacheKey(request, frameworkMappings);
      
      // Step 3: Check cache first (unless force regeneration)
      if (request.options?.useCache !== false && !request.options?.forceRegeneration) {
        const cachedContent = await this.cacheManager.getCachedContent(cacheKey, request.organizationId);
        if (cachedContent) {
          console.log(`[AIGuidanceOrchestrator] Cache hit for key: ${cacheKey}`);
          return this.formatCachedResponse(cachedContent, startTime);
        }
      }

      // Step 4: Get or create template
      let template = await this.templateManager.getTemplateByCategory(request.category, request.organizationId);
      if (!template) {
        template = await this.templateManager.createTemplateFromLegacyService(request.category, request.organizationId);
      }

      // Step 5: Generate AI content
      const aiContent = await this.generateAIContent(request, template, frameworkMappings);
      
      // Step 6: Validate quality
      const qualityAssessment = await this.qualityValidator.assessContent(
        aiContent.content,
        {
          category: request.category,
          frameworks: frameworkMappings.map(fm => fm.framework),
          requirements: frameworkMappings.flatMap(fm => fm.requirements),
          targetQuality: request.options?.quality || 'professional'
        }
      );

      // Step 7: Cache the result (if quality meets threshold)
      if (qualityAssessment.overallScore >= 3.5) {
        await this.cacheManager.cacheContent({
          cacheKey,
          templateId: template.id,
          content: aiContent.content,
          sections: this.parseContentSections(aiContent.content),
          qualityScore: qualityAssessment.overallScore,
          generationMetadata: aiContent.metadata,
          organizationId: request.organizationId,
          frameworkContext: frameworkMappings.map(fm => fm.framework)
        });
      }

      // Step 8: Update template quality if needed
      if (template.content_quality_score < qualityAssessment.overallScore) {
        await this.templateManager.updateTemplateQuality(template.id, qualityAssessment.overallScore);
      }

      const processingTime = Date.now() - startTime;
      
      return {
        content: aiContent.content,
        contentSections: this.parseContentSections(aiContent.content),
        metadata: {
          source: 'ai_generated',
          qualityScore: qualityAssessment.overallScore,
          generationTime: processingTime,
          tokensUsed: aiContent.metadata.tokensUsed.totalTokens,
          cost: aiContent.metadata.costEstimate.totalCost,
          frameworksCovered: frameworkMappings.map(fm => fm.framework),
          confidence: this.calculateConfidence(qualityAssessment, frameworkMappings)
        },
        recommendations: aiContent.suggestions || [],
        relatedCategories: await this.findRelatedCategories(request.category, request.organizationId),
        templateId: template.id,
        cacheKey
      };

    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error generating guidance:`, error);
      
      // Fallback to template-only content if AI fails
      try {
        return await this.generateFallbackResponse(request, startTime);
      } catch (fallbackError) {
        console.error(`[AIGuidanceOrchestrator] Fallback generation failed:`, fallbackError);
        throw new Error(`Guidance generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Enhance existing content with AI improvements
   */
  public async enhanceExistingContent(templateId: string, organizationId?: string): Promise<UnifiedGuidanceResponse> {
    console.log(`[AIGuidanceOrchestrator] Enhancing existing content for template: ${templateId}`);
    
    try {
      // Get existing template
      const template = await this.templateManager.getTemplateById(templateId, organizationId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Build context from template
      const context: GenerationContext = {
        frameworks: await this.getTemplateFrameworks(templateId),
        existingContent: template.foundation_content
      };

      // Generate enhanced content
      const enhancementRequest: ContentGenerationRequest = {
        templateId,
        organizationId,
        prompt: `Enhance the following compliance guidance content with more specific details, better structure, and actionable recommendations:\n\n${template.foundation_content}`,
        contentType: 'enhancement',
        context,
        quality: 'ciso-grade'
      };

      const enhancedContent = await this.geminiGenerator.enhanceExistingContent(enhancementRequest);
      
      // Assess quality
      const qualityAssessment = await this.qualityValidator.assessContent(
        enhancedContent.content,
        {
          category: template.category_name,
          frameworks: context.frameworks,
          targetQuality: 'ciso-grade'
        }
      );

      // Update template with enhanced content
      await this.templateManager.updateTemplate(templateId, {
        foundation_content: enhancedContent.content,
        content_quality_score: qualityAssessment.overallScore,
        last_ai_enhanced_at: new Date(),
        version: template.version + 1
      });

      // Invalidate related cache
      await this.cacheManager.invalidateCacheByTemplate(templateId);

      return {
        content: enhancedContent.content,
        contentSections: this.parseContentSections(enhancedContent.content),
        metadata: {
          source: 'ai_generated',
          qualityScore: qualityAssessment.overallScore,
          generationTime: enhancedContent.metadata.processingTime,
          tokensUsed: enhancedContent.metadata.tokensUsed.totalTokens,
          cost: enhancedContent.metadata.costEstimate.totalCost,
          frameworksCovered: context.frameworks,
          confidence: qualityAssessment.overallScore / 5.0
        },
        recommendations: enhancedContent.suggestions || [],
        templateId
      };

    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error enhancing content:`, error);
      throw error;
    }
  }

  /**
   * Get cached content or generate new content
   */
  public async getCachedOrGenerate(cacheKey: string, fallbackRequest?: GuidanceGenerationRequest): Promise<UnifiedGuidanceResponse | null> {
    try {
      const cachedContent = await this.cacheManager.getCachedContent(cacheKey);
      if (cachedContent) {
        return this.formatCachedResponse(cachedContent, Date.now());
      }

      if (fallbackRequest) {
        return await this.generateGuidance(fallbackRequest);
      }

      return null;
    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error in getCachedOrGenerate:`, error);
      return null;
    }
  }

  /**
   * Invalidate cache for a specific template
   */
  public async invalidateCache(templateId: string): Promise<void> {
    try {
      await this.cacheManager.invalidateCacheByTemplate(templateId);
      console.log(`[AIGuidanceOrchestrator] Cache invalidated for template: ${templateId}`);
    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error invalidating cache:`, error);
      throw error;
    }
  }

  /**
   * Migrate existing guidance from EnhancedUnifiedGuidanceService
   */
  public async migrateFromExistingService(): Promise<{ migrated: number; errors: string[] }> {
    console.log(`[AIGuidanceOrchestrator] Starting migration from existing service`);
    
    const results = { migrated: 0, errors: [] as string[] };
    
    try {
      // Define categories to migrate (based on existing service)
      const categoriesToMigrate = [
        'Access Control',
        'Asset Management', 
        'Vulnerability Management',
        'Incident Response',
        'Risk Management',
        'Data Protection',
        'Security Awareness',
        'Business Continuity',
        'Supplier Risk',
        'Network Security',
        'Secure Development',
        'Physical Security',
        'Governance & Leadership',
        'Audit Logging',
        'Compliance & Audit'
      ];

      for (const category of categoriesToMigrate) {
        try {
          // Check if template already exists
          const existing = await this.templateManager.getTemplateByCategory(category);
          if (!existing) {
            await this.templateManager.createTemplateFromLegacyService(category);
            results.migrated++;
            console.log(`[AIGuidanceOrchestrator] Migrated category: ${category}`);
          } else {
            console.log(`[AIGuidanceOrchestrator] Category already migrated: ${category}`);
          }
        } catch (error) {
          const errorMsg = `Failed to migrate category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`[AIGuidanceOrchestrator] ${errorMsg}`);
        }
      }

      console.log(`[AIGuidanceOrchestrator] Migration completed. Migrated: ${results.migrated}, Errors: ${results.errors.length}`);
      return results;

    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Migration failed:`, error);
      results.errors.push(`Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return results;
    }
  }

  // ============================================================================
  // ANALYTICS AND MONITORING
  // ============================================================================

  /**
   * Get guidance analytics for organization
   */
  public async getAnalytics(organizationId: string, timeRange: 'day' | 'week' | 'month' = 'month'): Promise<GuidanceAnalytics> {
    try {
      const [cacheStats, generationStats] = await Promise.all([
        this.cacheManager.getCacheStatistics(organizationId),
        this.getGenerationStatistics(organizationId, timeRange)
      ]);

      return {
        totalRequests: generationStats.totalRequests,
        cacheHitRate: cacheStats.cacheHitRate,
        averageQuality: cacheStats.averageQuality,
        totalCost: generationStats.totalCost,
        popularCategories: generationStats.popularCategories,
        performanceMetrics: {
          averageResponseTime: generationStats.averageResponseTime,
          errorRate: generationStats.errorRate,
          userSatisfaction: cacheStats.averageUserFeedback || 4.0
        }
      };
    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error getting analytics:`, error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  public async getSystemHealth(): Promise<{ status: 'healthy' | 'degraded' | 'critical'; issues: string[] }> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    try {
      // Check Gemini API
      const geminiConfig = this.geminiGenerator.validateConfiguration();
      if (!geminiConfig.valid) {
        issues.push(`Gemini API: ${geminiConfig.issues.join(', ')}`);
        status = 'critical';
      }

      // Check database connectivity
      const { error: dbError } = await supabase.from('unified_guidance_templates').select('id').limit(1);
      if (dbError) {
        issues.push(`Database: ${dbError.message}`);
        status = 'critical';
      }

      // Check cache performance
      const cacheStats = await this.cacheManager.getCacheStatistics();
      if (cacheStats.cacheHitRate < 0.3) {
        issues.push(`Cache performance low: ${(cacheStats.cacheHitRate * 100).toFixed(1)}% hit rate`);
        status = status === 'healthy' ? 'degraded' : status;
      }

      return { status, issues };
    } catch (error) {
      return {
        status: 'critical',
        issues: [`System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Build framework mappings with requirements and context
   */
  private async buildFrameworkMappings(request: GuidanceGenerationRequest): Promise<FrameworkMapping[]> {
    const activeFrameworks = Object.entries(request.frameworks)
      .filter(([_, active]) => active)
      .map(([framework, _]) => framework);

    const mappings: FrameworkMapping[] = [];

    for (const framework of activeFrameworks) {
      try {
        const requirements = request.requirements?.filter(req => 
          req.framework === framework || req.standard?.includes(framework)
        ) || [];

        mappings.push({
          framework,
          requirements,
          relevance: this.calculateFrameworkRelevance(framework, request.category),
          context: this.buildFrameworkContext(framework, requirements)
        });
      } catch (error) {
        console.warn(`[AIGuidanceOrchestrator] Error building mapping for ${framework}:`, error);
      }
    }

    return mappings;
  }

  /**
   * Generate AI content using Gemini
   */
  private async generateAIContent(
    request: GuidanceGenerationRequest, 
    template: any, 
    frameworkMappings: FrameworkMapping[]
  ): Promise<ContentGenerationResponse> {
    const context: GenerationContext = {
      frameworks: frameworkMappings.map(fm => fm.framework),
      industry: request.userContext?.industry,
      organizationSize: request.userContext?.organizationSize,
      userRole: request.userContext?.userRole,
      experienceLevel: request.userContext?.experienceLevel,
      specificRequirements: frameworkMappings.flatMap(fm => 
        fm.requirements.map(req => req.title || req.description)
      ),
      existingContent: template.foundation_content
    };

    const aiRequest: ContentGenerationRequest = {
      templateId: template.id,
      userId: request.userId,
      organizationId: request.organizationId,
      sessionId: request.sessionId,
      prompt: this.buildEnhancedPrompt(request, frameworkMappings, template),
      contentType: 'foundation',
      context,
      quality: request.options?.quality || 'professional',
      options: {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.95
      }
    };

    return await this.geminiGenerator.generateFoundationContent(aiRequest);
  }

  /**
   * Build enhanced prompt with framework context
   */
  private buildEnhancedPrompt(
    request: GuidanceGenerationRequest,
    frameworkMappings: FrameworkMapping[],
    template: any
  ): string {
    const frameworkContext = frameworkMappings.map(fm => 
      `${fm.framework}: ${fm.requirements.length} requirements`
    ).join(', ');

    const existingContent = template.foundation_content ? 
      `\n\nEXISTING CONTENT TO ENHANCE:\n${template.foundation_content.substring(0, 2000)}` : '';

    return `Generate comprehensive CISO-grade guidance for ${request.category} compliance.

FRAMEWORK CONTEXT: ${frameworkContext}

REQUIREMENTS:
- Address all framework-specific requirements
- Provide actionable implementation steps
- Include specific tools and resources
- Specify audit evidence requirements
- Maintain professional executive tone

SPECIFIC FRAMEWORKS:
${frameworkMappings.map(fm => 
  `- ${fm.framework}: ${fm.context || 'Standard compliance requirements'}`
).join('\n')}

TARGET AUDIENCE: ${request.userContext?.userRole || 'Compliance professionals'}
ORGANIZATION SIZE: ${request.userContext?.organizationSize || 'Medium enterprise'}
INDUSTRY: ${request.userContext?.industry || 'General business'}${existingContent}`;
  }

  /**
   * Generate fallback response using template only
   */
  private async generateFallbackResponse(request: GuidanceGenerationRequest, startTime: number): Promise<UnifiedGuidanceResponse> {
    const template = await this.templateManager.getTemplateByCategory(request.category, request.organizationId);
    
    if (!template) {
      throw new Error(`No template available for category: ${request.category}`);
    }

    const processingTime = Date.now() - startTime;
    
    return {
      content: template.foundation_content || `Basic guidance for ${request.category} is being prepared. Please check back shortly for AI-enhanced content.`,
      contentSections: this.parseContentSections(template.foundation_content),
      metadata: {
        source: 'template',
        qualityScore: template.content_quality_score || 3.0,
        generationTime: processingTime,
        frameworksCovered: Object.keys(request.frameworks).filter(f => request.frameworks[f]),
        confidence: 0.7
      },
      templateId: template.id
    };
  }

  /**
   * Format cached response
   */
  private formatCachedResponse(cachedContent: any, startTime: number): UnifiedGuidanceResponse {
    const processingTime = Date.now() - startTime;
    
    return {
      content: cachedContent.generated_content,
      contentSections: cachedContent.content_sections || {},
      metadata: {
        source: 'cache',
        qualityScore: cachedContent.content_quality_score,
        generationTime: processingTime,
        frameworksCovered: cachedContent.framework_context || [],
        confidence: cachedContent.content_quality_score / 5.0
      },
      templateId: cachedContent.template_id,
      cacheKey: cachedContent.framework_selection_hash
    };
  }

  /**
   * Parse content into structured sections
   */
  private parseContentSections(content: string): any {
    if (!content) return {};

    const sections: any = {};
    const sectionRegex = /## ([^#\n]+)\n([\s\S]*?)(?=\n## |$)/g;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionTitle = match[1].trim().toLowerCase();
      const sectionContent = match[2].trim();
      
      if (sectionTitle.includes('strategic') || sectionTitle.includes('context')) {
        sections.foundation = sectionContent;
      } else if (sectionTitle.includes('implementation') || sectionTitle.includes('steps')) {
        sections.implementation = sectionContent;
      } else if (sectionTitle.includes('tools') || sectionTitle.includes('resources')) {
        sections.tools = sectionContent;
      } else if (sectionTitle.includes('evidence') || sectionTitle.includes('audit')) {
        sections.evidence = sectionContent;
      }
    }

    return sections;
  }

  /**
   * Calculate framework relevance score
   */
  private calculateFrameworkRelevance(framework: string, category: string): number {
    // Framework-category relevance scoring
    const relevanceMap: Record<string, Record<string, number>> = {
      'ISO 27001': {
        'Access Control': 0.95,
        'Risk Management': 0.90,
        'Incident Response': 0.85,
        'Asset Management': 0.85
      },
      'CIS Controls': {
        'Access Control': 0.90,
        'Asset Management': 0.95,
        'Vulnerability Management': 0.95,
        'Network Security': 0.90
      },
      'NIST': {
        'Risk Management': 0.95,
        'Incident Response': 0.90,
        'Access Control': 0.85
      }
    };

    return relevanceMap[framework]?.[category] || 0.75;
  }

  /**
   * Build framework-specific context
   */
  private buildFrameworkContext(framework: string, requirements: any[]): string {
    const reqCount = requirements.length;
    return `${framework} compliance with ${reqCount} specific requirements addressing implementation, monitoring, and evidence collection.`;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(quality: any, mappings: FrameworkMapping[]): number {
    const qualityWeight = 0.6;
    const mappingWeight = 0.4;
    
    const qualityScore = quality.overallScore / 5.0;
    const mappingScore = mappings.reduce((sum, m) => sum + m.relevance, 0) / mappings.length;
    
    return Math.min(1.0, qualityWeight * qualityScore + mappingWeight * mappingScore);
  }

  /**
   * Find related categories using vector similarity
   */
  private async findRelatedCategories(category: string, organizationId?: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('find_similar_templates', {
        query_text: category,
        similarity_threshold: 0.6,
        max_results: 5,
        organization_filter: organizationId
      });

      if (error) throw error;
      
      return (data || [])
        .filter((item: any) => item.category_name !== category)
        .map((item: any) => item.category_name);
    } catch (error) {
      console.warn(`[AIGuidanceOrchestrator] Error finding related categories:`, error);
      return [];
    }
  }

  /**
   * Get template frameworks from mappings
   */
  private async getTemplateFrameworks(templateId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('framework_requirement_mappings')
        .select('framework_type')
        .eq('template_id', templateId);

      if (error) throw error;
      
      return [...new Set((data || []).map(d => d.framework_type))];
    } catch (error) {
      console.warn(`[AIGuidanceOrchestrator] Error getting template frameworks:`, error);
      return [];
    }
  }

  /**
   * Get generation statistics
   */
  private async getGenerationStatistics(organizationId: string, timeRange: 'day' | 'week' | 'month') {
    try {
      const { data, error } = await supabase
        .from('ai_generation_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', this.getTimeRangeStart(timeRange));

      if (error) throw error;

      const logs = data || [];
      return {
        totalRequests: logs.length,
        totalCost: logs.reduce((sum, log) => sum + (log.total_cost || 0), 0),
        averageResponseTime: logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length || 0,
        errorRate: logs.filter(log => !log.success).length / logs.length || 0,
        popularCategories: this.extractPopularCategories(logs)
      };
    } catch (error) {
      console.error(`[AIGuidanceOrchestrator] Error getting generation statistics:`, error);
      return {
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
        errorRate: 0,
        popularCategories: []
      };
    }
  }

  /**
   * Extract popular categories from logs
   */
  private extractPopularCategories(logs: any[]): string[] {
    const categoryCounts = logs.reduce((counts, log) => {
      // Extract category from prompt or template context
      const prompt = log.input_prompt || '';
      const categoryMatch = prompt.match(/for ([^,\n]+) compliance/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        counts[category] = (counts[category] || 0) + 1;
      }
      return counts;
    }, {});

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([category]) => category);
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

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `guidance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiGuidanceOrchestrator = AIGuidanceOrchestrator.getInstance();