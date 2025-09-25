/**
 * Enhanced RAG Service
 * Advanced integration service for RAG-powered compliance guidance
 */

import { supabase } from '@/lib/supabase';
import { RAGGenerationService } from './RAGGenerationService';
import { KnowledgeIngestionService } from './KnowledgeIngestionService';
import { RequirementValidationService, type ValidationResult } from './RequirementValidationService';

export interface EnhancedGuidanceRequest {
  category: string;
  frameworks: {
    iso27001: boolean;
    iso27002: boolean;
    cisControls: boolean;
    gdpr: boolean;
    nis2: boolean;
  };
  industrySector?: string;
  complexityLevel?: 'basic' | 'intermediate' | 'advanced';
  includeImplementationSteps?: boolean;
  includeBestPractices?: boolean;
  includeValidationCriteria?: boolean;
}

export interface EnhancedGuidanceResponse {
  success: boolean;
  content: string;
  qualityScore: number;
  sourcesUsed: string[];
  frameworkReferences: {
    framework: string;
    references: string[];
  }[];
  validationResults?: ValidationResult;
  implementationSteps?: string[];
  bestPractices?: string[];
  validationCriteria?: string[];
  metadata: {
    generatedAt: string;
    processingTime: number;
    enhancementLevel: 'basic' | 'enhanced' | 'expert';
    confidence: number;
  };
  errors?: string[];
}

export interface KnowledgeSourceSummary {
  id: string;
  domain: string;
  title: string;
  url: string;
  status: 'active' | 'inactive' | 'pending';
  contentChunks: number;
  qualityScore: number;
  lastScraped: string;
  frameworks: string[];
  categories: string[];
}

export interface ContentApprovalItem {
  id: string;
  type: 'guidance' | 'source' | 'template';
  title: string;
  category: string;
  content: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  qualityScore: number;
  validationResults?: ValidationResult;
  reviewComments?: string[];
}

export class EnhancedRAGService {
  /**
   * Generate enhanced compliance guidance using RAG with expert knowledge
   */
  static async generateEnhancedGuidance(request: EnhancedGuidanceRequest): Promise<EnhancedGuidanceResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`[EnhancedRAG] Generating guidance for category: ${request.category}`);

      // Step 1: Retrieve relevant knowledge sources
      const relevantSources = await this.getRelevantKnowledgeSources(
        request.category,
        Object.keys(request.frameworks).filter(key => request.frameworks[key as keyof typeof request.frameworks])
      );

      console.log(`[EnhancedRAG] Found ${relevantSources.length} relevant knowledge sources`);

      // Step 2: Generate base guidance using RAG
      const ragResult = await RAGGenerationService.generateGuidance(
        {
          letter: 'a',
          title: `${request.category} - Enhanced Implementation Guide`,
          description: `Comprehensive guidance for ${request.category} implementation`,
          originalText: `Comprehensive guidance for ${request.category} implementation`
        },
        request.category,
        request.frameworks
      );

      if (!ragResult.success || !ragResult.content) {
        throw new Error(`RAG generation failed: ${ragResult.errors?.join(', ') || 'Unknown error'}`);
      }

      let enhancedContent = ragResult.content;
      const sourcesUsed = ragResult.sourcesUsed || [];

      // Step 3: Enhance with implementation steps if requested
      if (request.includeImplementationSteps) {
        const implementationSteps = await this.generateImplementationSteps(
          request.category,
          request.frameworks,
          request.complexityLevel || 'intermediate'
        );
        
        if (implementationSteps.length > 0) {
          enhancedContent += '\n\n## Implementation Steps\n\n';
          implementationSteps.forEach((step, index) => {
            enhancedContent += `${index + 1}. ${step}\n`;
          });
        }
      }

      // Step 4: Add best practices if requested
      if (request.includeBestPractices) {
        const bestPractices = await this.generateBestPractices(
          request.category,
          request.frameworks,
          request.industrySector
        );
        
        if (bestPractices.length > 0) {
          enhancedContent += '\n\n## Industry Best Practices\n\n';
          bestPractices.forEach((practice, index) => {
            enhancedContent += `• ${practice}\n`;
          });
        }
      }

      // Step 5: Add validation criteria if requested
      if (request.includeValidationCriteria) {
        const validationCriteria = await this.generateValidationCriteria(
          request.category,
          request.frameworks
        );
        
        if (validationCriteria.length > 0) {
          enhancedContent += '\n\n## Validation Criteria\n\n';
          validationCriteria.forEach((criteria, index) => {
            enhancedContent += `✓ ${criteria}\n`;
          });
        }
      }

      // Step 6: Generate framework references
      const frameworkReferences = await this.generateFrameworkReferences(
        request.category,
        request.frameworks
      );

      if (frameworkReferences.length > 0) {
        enhancedContent += '\n\n## Framework References\n\n';
        frameworkReferences.forEach(ref => {
          enhancedContent += `**${ref.framework}**: ${ref.references.join(', ')}\n\n`;
        });
      }

      // Step 7: Validate the enhanced content
      const validationResults = await RequirementValidationService.validateContent(
        enhancedContent,
        'guidance'
      );

      // Step 8: Calculate enhancement level and confidence
      const enhancementLevel = this.calculateEnhancementLevel(
        enhancedContent,
        sourcesUsed,
        validationResults
      );

      const processingTime = Date.now() - startTime;

      const response: EnhancedGuidanceResponse = {
        success: true,
        content: enhancedContent,
        qualityScore: validationResults.score,
        sourcesUsed,
        frameworkReferences,
        validationResults,
        implementationSteps: request.includeImplementationSteps ? 
          await this.generateImplementationSteps(request.category, request.frameworks, request.complexityLevel || 'intermediate') : undefined,
        bestPractices: request.includeBestPractices ? 
          await this.generateBestPractices(request.category, request.frameworks, request.industrySector) : undefined,
        validationCriteria: request.includeValidationCriteria ? 
          await this.generateValidationCriteria(request.category, request.frameworks) : undefined,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime,
          enhancementLevel,
          confidence: validationResults.confidence
        }
      };

      // Store the generated guidance for future reference
      await this.storeGeneratedGuidance(request, response);

      console.log(`[EnhancedRAG] Successfully generated enhanced guidance in ${processingTime}ms`);
      return response;

    } catch (error) {
      console.error('[EnhancedRAG] Generation failed:', error);
      return {
        success: false,
        content: '',
        qualityScore: 0,
        sourcesUsed: [],
        frameworkReferences: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          enhancementLevel: 'basic',
          confidence: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get knowledge sources relevant to a category and frameworks
   */
  private static async getRelevantKnowledgeSources(
    category: string,
    frameworks: string[]
  ): Promise<KnowledgeSourceSummary[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select(`
          id,
          domain,
          title,
          url,
          status,
          compliance_frameworks,
          focus_areas,
          metadata,
          updated_at,
          knowledge_content(count)
        `)
        .eq('status', 'active')
        .or(`focus_areas.cs.{${category}},compliance_frameworks.ov.{${frameworks.join(',')}}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(source => ({
        id: source.id,
        domain: source.domain,
        title: source.title || source.domain,
        url: source.url,
        status: source.status,
        contentChunks: source.knowledge_content?.[0]?.count || 0,
        qualityScore: source.metadata?.qualityScore || 0.8,
        lastScraped: source.updated_at,
        frameworks: source.compliance_frameworks || [],
        categories: source.focus_areas || []
      }));

    } catch (error) {
      console.error('Failed to get relevant knowledge sources:', error);
      return [];
    }
  }

  /**
   * Generate implementation steps for a category
   */
  private static async generateImplementationSteps(
    category: string,
    frameworks: { [key: string]: boolean },
    complexityLevel: 'basic' | 'intermediate' | 'advanced'
  ): Promise<string[]> {
    // Mock implementation steps - in production, this would use AI generation
    const baseSteps = [
      `Conduct risk assessment for ${category}`,
      `Define policies and procedures for ${category}`,
      `Implement technical controls for ${category}`,
      `Train staff on ${category} requirements`,
      `Monitor and review ${category} effectiveness`
    ];

    const enhancedSteps = [
      ...baseSteps,
      `Document ${category} implementation`,
      `Test ${category} controls regularly`,
      `Maintain compliance evidence for ${category}`,
      `Review and update ${category} controls annually`
    ];

    const expertSteps = [
      ...enhancedSteps,
      `Integrate ${category} with enterprise risk management`,
      `Automate ${category} monitoring and reporting`,
      `Conduct third-party assessments of ${category}`,
      `Establish metrics and KPIs for ${category}`,
      `Implement continuous improvement for ${category}`
    ];

    switch (complexityLevel) {
      case 'basic': return baseSteps;
      case 'advanced': return expertSteps;
      default: return enhancedSteps;
    }
  }

  /**
   * Generate best practices for a category
   */
  private static async generateBestPractices(
    category: string,
    frameworks: { [key: string]: boolean },
    industrySector?: string
  ): Promise<string[]> {
    // Mock best practices - in production, this would use AI generation with industry-specific knowledge
    const practices = [
      `Adopt a risk-based approach to ${category}`,
      `Ensure ${category} aligns with business objectives`,
      `Implement defense-in-depth for ${category}`,
      `Use automation where possible for ${category}`,
      `Maintain up-to-date documentation for ${category}`,
      `Regular training and awareness for ${category}`,
      `Continuous monitoring and improvement of ${category}`,
      `Integration with incident response processes`
    ];

    if (industrySector) {
      practices.unshift(`Follow ${industrySector}-specific requirements for ${category}`);
    }

    return practices;
  }

  /**
   * Generate validation criteria for a category
   */
  private static async generateValidationCriteria(
    category: string,
    frameworks: { [key: string]: boolean }
  ): Promise<string[]> {
    // Mock validation criteria - in production, this would be framework-specific
    return [
      `${category} policies are documented and approved`,
      `${category} procedures are implemented and tested`,
      `Staff are trained on ${category} requirements`,
      `${category} controls are monitored regularly`,
      `${category} incidents are tracked and resolved`,
      `${category} compliance is measured and reported`,
      `${category} effectiveness is reviewed annually`
    ];
  }

  /**
   * Generate framework-specific references
   */
  private static async generateFrameworkReferences(
    category: string,
    frameworks: { [key: string]: boolean }
  ): Promise<{ framework: string; references: string[] }[]> {
    const references: { framework: string; references: string[] }[] = [];

    if (frameworks.iso27001) {
      references.push({
        framework: 'ISO 27001:2022',
        references: ['A.5.1 Information Security Policies', 'A.6.1 Management Direction for Information Security']
      });
    }

    if (frameworks.nist) {
      references.push({
        framework: 'NIST Cybersecurity Framework',
        references: ['ID.GV-1: Organizational cybersecurity policy', 'PR.AC-1: Identities and credentials are issued']
      });
    }

    if (frameworks.gdpr) {
      references.push({
        framework: 'GDPR',
        references: ['Article 32: Security of processing', 'Article 25: Data protection by design']
      });
    }

    return references;
  }

  /**
   * Calculate enhancement level based on content and sources
   */
  private static calculateEnhancementLevel(
    content: string,
    sourcesUsed: string[],
    validationResults: ValidationResult
  ): 'basic' | 'enhanced' | 'expert' {
    const contentLength = content.length;
    const sourceCount = sourcesUsed.length;
    const qualityScore = validationResults.score;

    if (contentLength > 2000 && sourceCount >= 5 && qualityScore >= 0.9) {
      return 'expert';
    } else if (contentLength > 1000 && sourceCount >= 3 && qualityScore >= 0.8) {
      return 'enhanced';
    } else {
      return 'basic';
    }
  }

  /**
   * Store generated guidance for analytics and future reference
   */
  private static async storeGeneratedGuidance(
    request: EnhancedGuidanceRequest,
    response: EnhancedGuidanceResponse
  ): Promise<void> {
    try {
      await supabase
        .from('generated_guidance')
        .insert({
          category: request.category,
          frameworks: Object.keys(request.frameworks).filter(key => request.frameworks[key as keyof typeof request.frameworks]),
          industry_sector: request.industrySector,
          content: response.content,
          quality_score: response.qualityScore,
          sources_used: response.sourcesUsed,
          enhancement_level: response.metadata.enhancementLevel,
          processing_time: response.metadata.processingTime,
          confidence: response.metadata.confidence,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store generated guidance:', error);
    }
  }

  /**
   * Get content approval queue
   */
  static async getContentApprovalQueue(): Promise<ContentApprovalItem[]> {
    try {
      const { data, error } = await supabase
        .from('content_approval_queue')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        category: item.category,
        content: item.content,
        submittedAt: item.submitted_at,
        submittedBy: item.submitted_by,
        status: item.status,
        qualityScore: item.quality_score || 0,
        validationResults: item.validation_results,
        reviewComments: item.review_comments || []
      }));

    } catch (error) {
      console.error('Failed to get content approval queue:', error);
      return [];
    }
  }

  /**
   * Submit content for approval
   */
  static async submitForApproval(
    type: 'guidance' | 'source' | 'template',
    title: string,
    category: string,
    content: string,
    submittedBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Validate content first
      const validationResults = await RequirementValidationService.validateContent(
        content,
        type === 'source' ? 'source' : 'guidance'
      );

      const { data, error } = await supabase
        .from('content_approval_queue')
        .insert({
          type,
          title,
          category,
          content,
          submitted_by: submittedBy,
          status: 'pending',
          quality_score: validationResults.score,
          validation_results: validationResults,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id };

    } catch (error) {
      console.error('Failed to submit content for approval:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get guidance generation analytics
   */
  static async getAnalytics(): Promise<{
    totalGuidanceGenerated: number;
    avgQualityScore: number;
    avgProcessingTime: number;
    topCategories: { category: string; count: number }[];
    qualityTrend: { date: string; avgScore: number }[];
  }> {
    try {
      const { data, error } = await supabase
        .from('generated_guidance')
        .select('category, quality_score, processing_time, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const total = data?.length || 0;
      const avgQuality = data?.reduce((sum, item) => sum + item.quality_score, 0) / total || 0;
      const avgProcessing = data?.reduce((sum, item) => sum + item.processing_time, 0) / total || 0;

      // Calculate top categories
      const categoryCount: Record<string, number> = {};
      data?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      return {
        totalGuidanceGenerated: total,
        avgQualityScore: avgQuality,
        avgProcessingTime: avgProcessing,
        topCategories,
        qualityTrend: [] // Would implement trend calculation here
      };

    } catch (error) {
      console.error('Failed to get analytics:', error);
      return {
        totalGuidanceGenerated: 0,
        avgQualityScore: 0,
        avgProcessingTime: 0,
        topCategories: [],
        qualityTrend: []
      };
    }
  }
}