/**
 * RAG Generation Service
 * Handles AI-powered guidance generation using retrieved knowledge
 */

import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UnifiedRequirement } from '../compliance/UnifiedRequirementsService';

export interface RelevantKnowledge {
  id: string;
  content: string;
  title?: string;
  sourceUrl: string;
  domain: string;
  authorityScore: number;
  relevanceScore: number;
  frameworks: string[];
  complianceCategories: string[];
  qualityScore: number;
  freshness: number; // 0-1 based on age
}

export interface GenerationContext {
  requirement: UnifiedRequirement;
  category: string;
  selectedFrameworks: Record<string, boolean>;
  relevantKnowledge: RelevantKnowledge[];
  userContext?: {
    industry?: string;
    organizationSize?: string;
    role?: string;
  };
}

export interface RAGGuidanceResult {
  success: boolean;
  content: string;
  generationMethod: 'rag' | 'hybrid' | 'fallback';
  qualityScore: number;
  sourcesUsed: string[];
  processingTimeMs: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  errors: string[];
  confidence: number;
  fallbackReason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  tone: 'professional' | 'casual' | 'technical' | 'inappropriate';
  length: 'too_short' | 'optimal' | 'too_long';
  relevance: number; // 0-1
  factualAccuracy: number; // 0-1
}

export class RAGGenerationService {
  private static genAI: GoogleGenerativeAI | null = null;
  
  // Model selection with fallbacks
  private static readonly PRIMARY_MODEL = 'gemini-2.0-flash-exp';
  private static readonly FALLBACK_MODEL = 'gemini-1.5-flash';
  private static readonly LITE_MODEL = 'gemini-1.5-flash-8b';
  
  /**
   * Initialize the Gemini AI client
   */
  private static initializeAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Get optimal Gemini model with automatic fallback
   */
  private static async getOptimalModel() {
    const genAI = this.initializeAI();
    
    try {
      // Try Gemini 2.0 Flash first (latest and fastest)
      return genAI.getGenerativeModel({ model: this.PRIMARY_MODEL });
    } catch (error) {
      console.warn('Gemini 2.0 Flash not available, falling back to 1.5 Flash:', error);
      try {
        // Fallback to Gemini 1.5 Flash
        return genAI.getGenerativeModel({ model: this.FALLBACK_MODEL });
      } catch (fallbackError) {
        console.warn('Gemini 1.5 Flash not available, using lite model:', fallbackError);
        // Final fallback to lite model
        return genAI.getGenerativeModel({ model: this.LITE_MODEL });
      }
    }
  }
  
  /**
   * Generate AI-powered guidance for a specific requirement
   */
  static async generateGuidance(
    requirement: UnifiedRequirement,
    category: string,
    selectedFrameworks: Record<string, boolean>,
    userContext?: any
  ): Promise<RAGGuidanceResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log(`[RAGGeneration] Generating guidance for: ${requirement.title}`);
      
      // 1. Retrieve relevant knowledge from knowledge base
      const knowledgeResult = await this.retrieveRelevantKnowledge(
        requirement.title,
        category,
        selectedFrameworks
      );
      
      if (!knowledgeResult.success || knowledgeResult.knowledge.length === 0) {
        console.log('[RAGGeneration] No relevant knowledge found, falling back to hybrid');
        return await this.fallbackToHybrid(requirement, category, selectedFrameworks, startTime, ['No relevant knowledge found']);
      }
      
      // 2. Build generation context
      const context: GenerationContext = {
        requirement,
        category,
        selectedFrameworks,
        relevantKnowledge: knowledgeResult.knowledge,
        userContext
      };
      
      // 3. Generate content using RAG
      const generationResult = await this.generateWithRAG(context);
      
      if (!generationResult.success) {
        console.log('[RAGGeneration] RAG generation failed, falling back to hybrid');
        return await this.fallbackToHybrid(requirement, category, selectedFrameworks, startTime, generationResult.errors);
      }
      
      // 4. Validate generated content
      const validationResult = await this.validateGeneratedContent(generationResult.content, requirement);
      
      if (!validationResult.isValid || validationResult.qualityScore < 0.7) {
        console.log('[RAGGeneration] Generated content failed validation, falling back to hybrid');
        return await this.fallbackToHybrid(requirement, category, selectedFrameworks, startTime, ['Content validation failed']);
      }
      
      // 5. Store generation history
      await this.recordGenerationHistory({
        requirement,
        category,
        content: generationResult.content,
        method: 'rag',
        sourcesUsed: knowledgeResult.knowledge.map(k => k.id),
        qualityScore: validationResult.qualityScore,
        processingTimeMs: Date.now() - startTime,
        tokenUsage: generationResult.tokenUsage
      });
      
      return {
        success: true,
        content: generationResult.content,
        generationMethod: 'rag',
        qualityScore: validationResult.qualityScore,
        sourcesUsed: knowledgeResult.knowledge.map(k => k.sourceUrl),
        processingTimeMs: Date.now() - startTime,
        tokenUsage: generationResult.tokenUsage,
        errors: [],
        confidence: generationResult.confidence
      };
      
    } catch (error) {
      console.error('[RAGGeneration] Generation failed:', error);
      errors.push(error instanceof Error ? error.message : String(error));
      
      // Final fallback to hybrid
      return await this.fallbackToHybrid(requirement, category, selectedFrameworks, startTime, errors);
    }
  }
  
  /**
   * Retrieve relevant knowledge from the knowledge base
   */
  static async retrieveRelevantKnowledge(
    query: string,
    category: string,
    selectedFrameworks: Record<string, boolean>
  ): Promise<{ success: boolean; knowledge: RelevantKnowledge[]; errors: string[] }> {
    try {
      console.log(`[RAGGeneration] Retrieving knowledge for: ${query}`);
      
      // Get framework filter
      const activeFrameworks = Object.entries(selectedFrameworks)
        .filter(([, isSelected]) => isSelected)
        .map(([framework]) => framework);
      
      // Query knowledge content with relevance scoring
      const { data: content, error } = await supabase
        .from('knowledge_content')
        .select(`
          id,
          content_chunk,
          title,
          compliance_categories,
          frameworks,
          quality_score,
          extracted_at,
          knowledge_sources!inner (
            url,
            domain,
            authority_score,
            status
          )
        `)
        .contains('compliance_categories', [category.toLowerCase()])
        .eq('knowledge_sources.status', 'active')
        .gte('quality_score', 0.5)
        .order('quality_score', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('[RAGGeneration] Knowledge retrieval failed:', error);
        return { success: false, knowledge: [], errors: [error.message] };
      }
      
      if (!content || content.length === 0) {
        console.log('[RAGGeneration] No relevant content found in knowledge base');
        return { success: false, knowledge: [], errors: ['No relevant content found'] };
      }
      
      // Transform and score results
      const relevantKnowledge: RelevantKnowledge[] = content.map(item => {
        // Calculate relevance score based on multiple factors
        const relevanceScore = this.calculateRelevanceScore(
          item.content_chunk,
          query,
          category,
          activeFrameworks,
          item.frameworks
        );
        
        // Calculate freshness score (newer content scores higher)
        const age = Date.now() - new Date(item.extracted_at).getTime();
        const freshnessScore = Math.max(0, 1 - (age / (365 * 24 * 60 * 60 * 1000))); // Decay over 1 year
        
        return {
          id: item.id,
          content: item.content_chunk,
          title: item.title,
          sourceUrl: item.knowledge_sources.url,
          domain: item.knowledge_sources.domain,
          authorityScore: item.knowledge_sources.authority_score,
          relevanceScore,
          frameworks: item.frameworks || [],
          complianceCategories: item.compliance_categories || [],
          qualityScore: item.quality_score || 0,
          freshness: freshnessScore
        };
      })
      .filter(k => k.relevanceScore > 0.3) // Minimum relevance threshold
      .sort((a, b) => {
        // Sort by weighted score: relevance + authority + quality + freshness
        const scoreA = (a.relevanceScore * 0.4) + (a.authorityScore / 10 * 0.3) + (a.qualityScore * 0.2) + (a.freshness * 0.1);
        const scoreB = (b.relevanceScore * 0.4) + (b.authorityScore / 10 * 0.3) + (b.qualityScore * 0.2) + (b.freshness * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Top 5 most relevant pieces
      
      console.log(`[RAGGeneration] Found ${relevantKnowledge.length} relevant knowledge pieces`);
      
      return {
        success: true,
        knowledge: relevantKnowledge,
        errors: []
      };
      
    } catch (error) {
      console.error('[RAGGeneration] Knowledge retrieval error:', error);
      return {
        success: false,
        knowledge: [],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Generate content using RAG with expert knowledge
   */
  private static async generateWithRAG(
    context: GenerationContext
  ): Promise<{ success: boolean; content: string; confidence: number; tokenUsage: any; errors: string[] }> {
    try {
      const genAI = this.initializeAI();
      const model = await this.getOptimalModel();
      
      // Build expert knowledge context
      const knowledgeContext = context.relevantKnowledge
        .map(k => `**Source: ${k.domain} (Authority: ${k.authorityScore}/10)**\n${k.content}`)
        .join('\n\n---\n\n');
      
      // Build framework context
      const activeFrameworks = Object.entries(context.selectedFrameworks)
        .filter(([, isSelected]) => isSelected)
        .map(([framework]) => this.getFrameworkName(framework))
        .join(', ');
      
      // Create structured prompt
      const prompt = `You are an expert compliance consultant. Generate professional guidance for the following requirement using the provided expert knowledge.

**REQUIREMENT CONTEXT:**
Category: ${context.category}
Requirement: ${context.requirement.title}
${context.requirement.description ? `Description: ${context.requirement.description}` : ''}
Applicable Frameworks: ${activeFrameworks}

**EXPERT KNOWLEDGE SOURCES:**
${knowledgeContext}

**GENERATION REQUIREMENTS:**
1. Create professional, pedagogical guidance (4-6 sentences)
2. Focus specifically on the requirement title and description
3. Use expert knowledge to provide accurate, specific advice
4. Maintain professional tone - no condescending language
5. Include practical implementation guidance
6. Reference relevant frameworks when appropriate
7. Ensure content is actionable and specific

**OUTPUT FORMAT:**
Generate a single comprehensive paragraph that explains:
- What this requirement focuses on
- Practical implementation details based on expert sources
- Specific actions organizations should take
- Why this is important for compliance

Generate the guidance now:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content || content.length < 100) {
        return {
          success: false,
          content: '',
          confidence: 0,
          tokenUsage: { input: 0, output: 0, total: 0 },
          errors: ['Generated content too short or empty']
        };
      }
      
      // Estimate token usage (rough approximation)
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(content.length / 4);
      
      // Calculate confidence based on knowledge quality and content length
      const avgKnowledgeQuality = context.relevantKnowledge.reduce((sum, k) => sum + k.qualityScore, 0) / context.relevantKnowledge.length;
      const confidence = Math.min(0.95, avgKnowledgeQuality * 0.8 + (Math.min(content.length / 500, 1) * 0.2));
      
      console.log(`[RAGGeneration] Generated ${content.length} characters with ${confidence.toFixed(2)} confidence`);
      
      return {
        success: true,
        content: content.trim(),
        confidence,
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        errors: []
      };
      
    } catch (error) {
      console.error('[RAGGeneration] AI generation failed:', error);
      return {
        success: false,
        content: '',
        confidence: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Validate generated content for quality and appropriateness
   */
  static async validateGeneratedContent(
    content: string,
    requirement: UnifiedRequirement
  ): Promise<ValidationResult> {
    try {
      const issues: string[] = [];
      let qualityScore = 1.0;
      
      // Length validation
      let lengthStatus: 'too_short' | 'optimal' | 'too_long' = 'optimal';
      if (content.length < 150) {
        lengthStatus = 'too_short';
        issues.push('Content too short');
        qualityScore -= 0.3;
      } else if (content.length > 800) {
        lengthStatus = 'too_long';
        issues.push('Content too long');
        qualityScore -= 0.2;
      }
      
      // Tone validation
      let tone: 'professional' | 'casual' | 'technical' | 'inappropriate' = 'professional';
      const lowerContent = content.toLowerCase();
      
      // Check for inappropriate casual language
      const casualIndicators = ['think of it like', 'imagine', 'let\'s say', 'basically', 'obviously'];
      if (casualIndicators.some(indicator => lowerContent.includes(indicator))) {
        tone = 'casual';
        issues.push('Casual or condescending language detected');
        qualityScore -= 0.4;
      }
      
      // Check for overly technical language
      const technicalIndicators = ['algorithm', 'implementation details', 'code', 'programming'];
      if (technicalIndicators.filter(indicator => lowerContent.includes(indicator)).length > 2) {
        tone = 'technical';
        issues.push('Overly technical language');
        qualityScore -= 0.2;
      }
      
      // Relevance validation - check if content actually addresses the requirement
      const relevanceScore = this.calculateContentRelevance(content, requirement);
      if (relevanceScore < 0.5) {
        issues.push('Content not relevant to requirement');
        qualityScore -= 0.5;
      }
      
      // Factual accuracy estimation (basic keyword matching)
      const factualScore = this.estimateFactualAccuracy(content, requirement);
      if (factualScore < 0.6) {
        issues.push('Potential factual accuracy issues');
        qualityScore -= 0.3;
      }
      
      // Professional structure validation
      if (!this.hasGoodStructure(content)) {
        issues.push('Poor content structure');
        qualityScore -= 0.2;
      }
      
      qualityScore = Math.max(0, qualityScore);
      const isValid = qualityScore >= 0.7 && issues.length <= 2;
      
      return {
        isValid,
        qualityScore,
        issues,
        tone,
        length: lengthStatus,
        relevance: relevanceScore,
        factualAccuracy: factualScore
      };
      
    } catch (error) {
      console.error('[RAGGeneration] Content validation failed:', error);
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Validation failed'],
        tone: 'inappropriate',
        length: 'too_short',
        relevance: 0,
        factualAccuracy: 0
      };
    }
  }
  
  /**
   * Fallback to hybrid generation (RAG + rules)
   */
  private static async fallbackToHybrid(
    requirement: UnifiedRequirement,
    category: string,
    selectedFrameworks: Record<string, boolean>,
    startTime: number,
    errors: string[]
  ): Promise<RAGGuidanceResult> {
    try {
      console.log('[RAGGeneration] Using hybrid fallback generation');
      
      // Import the existing unified guidance generator
      const { UnifiedGuidanceGenerator } = await import('../compliance/UnifiedGuidanceGenerator');
      
      // Generate using rule-based system
      const categoryRequirements = {
        category,
        requirements: [requirement]
      };
      
      const ruleBasedGuidance = UnifiedGuidanceGenerator.generateGuidance(categoryRequirements);
      
      // Extract just the requirement guidance
      const guidanceMatch = ruleBasedGuidance.foundationContent.match(/\*\*[^*]+\*\*\n([^*]+?)(?=\n\n|\n\*\*|$)/);
      const content = guidanceMatch ? guidanceMatch[1].trim() : ruleBasedGuidance.foundationContent;
      
      if (!content || content.length < 100) {
        throw new Error('Hybrid generation failed - insufficient content');
      }
      
      // Record hybrid generation
      await this.recordGenerationHistory({
        requirement,
        category,
        content,
        method: 'hybrid',
        sourcesUsed: [],
        qualityScore: 0.7,
        processingTimeMs: Date.now() - startTime,
        tokenUsage: { input: 0, output: 0, total: 0 },
        fallbackReason: errors.join('; ')
      });
      
      return {
        success: true,
        content,
        generationMethod: 'hybrid',
        qualityScore: 0.7,
        sourcesUsed: [],
        processingTimeMs: Date.now() - startTime,
        tokenUsage: { input: 0, output: 0, total: 0 },
        errors: [],
        confidence: 0.7,
        fallbackReason: `RAG failed: ${errors.join('; ')}`
      };
      
    } catch (error) {
      console.error('[RAGGeneration] Hybrid fallback failed:', error);
      
      // Final emergency fallback
      const emergencyContent = `This requirement focuses on ${requirement.title.toLowerCase()}. Organizations must implement systematic approaches to ${requirement.title.toLowerCase()} with documented procedures, clear responsibilities, and regular validation. Implementation requires appropriate controls and processes with regular reviews and continuous improvement to ensure effectiveness.`;
      
      return {
        success: false,
        content: emergencyContent,
        generationMethod: 'fallback',
        qualityScore: 0.5,
        sourcesUsed: [],
        processingTimeMs: Date.now() - startTime,
        tokenUsage: { input: 0, output: 0, total: 0 },
        errors: [...errors, 'All generation methods failed'],
        confidence: 0.5,
        fallbackReason: 'Emergency fallback used'
      };
    }
  }
  
  // Helper methods
  
  private static calculateRelevanceScore(
    content: string,
    query: string,
    category: string,
    activeFrameworks: string[],
    contentFrameworks: string[]
  ): number {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    let score = 0;
    
    // Query keyword matching
    const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 3);
    const matchingWords = queryWords.filter(word => lowerContent.includes(word));
    score += (matchingWords.length / queryWords.length) * 0.4;
    
    // Category relevance
    if (lowerContent.includes(lowerCategory)) {
      score += 0.3;
    }
    
    // Framework alignment
    const frameworkMatches = activeFrameworks.filter(framework => 
      contentFrameworks.includes(framework)
    );
    score += (frameworkMatches.length / Math.max(activeFrameworks.length, 1)) * 0.3;
    
    return Math.min(1.0, score);
  }
  
  private static calculateContentRelevance(content: string, requirement: UnifiedRequirement): number {
    const lowerContent = content.toLowerCase();
    const titleWords = requirement.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    const matchingWords = titleWords.filter(word => lowerContent.includes(word));
    return matchingWords.length / titleWords.length;
  }
  
  private static estimateFactualAccuracy(content: string, requirement: UnifiedRequirement): number {
    // Basic estimation - could be enhanced with more sophisticated analysis
    const lowerContent = content.toLowerCase();
    
    // Check for common compliance terms
    const complianceTerms = ['requirement', 'compliance', 'standard', 'framework', 'policy', 'procedure'];
    const termMatches = complianceTerms.filter(term => lowerContent.includes(term));
    
    return Math.min(1.0, termMatches.length / 3);
  }
  
  private static hasGoodStructure(content: string): boolean {
    // Check for reasonable sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.length >= 2 && sentences.length <= 8;
  }
  
  private static getFrameworkName(framework: string): string {
    const names: Record<string, string> = {
      'iso27001': 'ISO 27001',
      'iso27002': 'ISO 27002',
      'cisControls': 'CIS Controls',
      'gdpr': 'GDPR',
      'nis2': 'NIS2 Directive',
      'nist': 'NIST Framework'
    };
    return names[framework] || framework.toUpperCase();
  }
  
  private static async recordGenerationHistory(data: {
    requirement: UnifiedRequirement;
    category: string;
    content: string;
    method: 'rag' | 'hybrid' | 'fallback';
    sourcesUsed: string[];
    qualityScore: number;
    processingTimeMs: number;
    tokenUsage: any;
    fallbackReason?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('rag_generation_history')
        .insert({
          requirement_category: data.category,
          requirement_title: data.requirement.title,
          generated_content: data.content,
          generation_method: data.method,
          source_ids: data.sourcesUsed,
          quality_score: data.qualityScore,
          generation_time_ms: data.processingTimeMs,
          token_usage: data.tokenUsage,
          fallback_reason: data.fallbackReason,
          metadata: {
            requirement_description: data.requirement.description,
            requirement_letter: data.requirement.letter
          }
        });
    } catch (error) {
      console.error('[RAGGeneration] Failed to record generation history:', error);
    }
  }
}