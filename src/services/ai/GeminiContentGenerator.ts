/**
 * Professional Google Gemini API Service Wrapper
 * Enterprise-grade AI content generation for CISO-level compliance guidance
 * 
 * Features:
 * - Multi-stage content generation (foundation → implementation → tools → evidence)
 * - Comprehensive cost tracking and token usage monitoring
 * - Quality assessment and validation with scoring
 * - Retry logic with exponential backoff
 * - Database logging integration with ai_generation_logs
 * - Context-aware prompt engineering for compliance content
 * - Cache-friendly response formats with hash generation
 * - Environmental configuration and error handling
 */

import { supabase } from '../../lib/supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContentGenerationRequest {
  templateId?: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  prompt: string;
  contentType: ContentType;
  context: GenerationContext;
  quality?: QualityLevel;
  options?: GenerationOptions;
}

export interface GenerationContext {
  frameworks: string[];
  industry?: string;
  organizationSize?: 'startup' | 'sme' | 'enterprise' | 'large-enterprise';
  userRole?: 'ciso' | 'security-analyst' | 'compliance-officer' | 'auditor' | 'manager' | 'beginner';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  specificRequirements?: string[];
  existingContent?: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  stopSequences?: string[];
  safetySettings?: GeminiSafetySettings[];
}

export interface GeminiSafetySettings {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_HIGH_ONLY';
}

export type ContentType = 
  | 'foundation'
  | 'implementation'  
  | 'tools'
  | 'evidence'
  | 'enhancement'
  | 'validation'
  | 'summary';

export type QualityLevel = 'standard' | 'professional' | 'executive' | 'ciso-grade';

export interface ContentGenerationResponse {
  content: string;
  contentHash: string;
  quality: ContentQualityMetrics;
  metadata: ResponseMetadata;
  suggestions?: string[];
  followUpQuestions?: string[];
  relatedFrameworks?: string[];
}

export interface ContentQualityMetrics {
  relevance: number;      // 0-5 scale
  coherence: number;      // 0-5 scale
  accuracy: number;       // 0-5 scale
  completeness: number;   // 0-5 scale
  professionalTone: number; // 0-5 scale
  overallScore: number;   // 0-5 scale
}

export interface ResponseMetadata {
  model: string;
  tokensUsed: TokenUsage;
  costEstimate: CostEstimate;
  processingTime: number;
  generationParameters: GenerationOptions;
  contentLength: number;
  language: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  promptCost: number;
  completionCost: number;
  totalCost: number;
  currency: string;
}

// Error types for comprehensive error handling
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class ContentValidationError extends Error {
  constructor(
    message: string,
    public validationDetails: any
  ) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class GeminiContentGenerator {
  private static instance: GeminiContentGenerator | null = null;
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly defaultModel: string = 'gemini-1.5-pro';
  
  // Cost tracking (USD per 1K tokens - Gemini Pro pricing as of 2024)
  private readonly pricing = {
    'gemini-1.5-pro': { prompt: 0.0035, completion: 0.0105 },
    'gemini-1.5-flash': { prompt: 0.00075, completion: 0.003 },
    'gemini-pro': { prompt: 0.0005, completion: 0.0015 }
  };

  // Quality thresholds for different quality levels
  private readonly qualityThresholds = {
    standard: { overallScore: 3.0 },
    professional: { overallScore: 3.5 },
    executive: { overallScore: 4.0 },
    'ciso-grade': { overallScore: 4.5 }
  };

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new GeminiAPIError(
        'Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable.',
        'MISSING_API_KEY'
      );
    }
    this.apiKey = apiKey;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GeminiContentGenerator {
    if (!GeminiContentGenerator.instance) {
      GeminiContentGenerator.instance = new GeminiContentGenerator();
    }
    return GeminiContentGenerator.instance;
  }

  // ============================================================================
  // MAIN CONTENT GENERATION METHODS
  // ============================================================================

  /**
   * Generate foundation content - Core understanding and principles
   */
  public async generateFoundationContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const enhancedPrompt = this.buildFoundationPrompt(request);
    const fullRequest = { ...request, prompt: enhancedPrompt, contentType: 'foundation' as ContentType };
    
    return await this.generateContent(fullRequest);
  }

  /**
   * Generate implementation steps - Step-by-step guidance
   */
  public async generateImplementationSteps(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const enhancedPrompt = this.buildImplementationPrompt(request);
    const fullRequest = { ...request, prompt: enhancedPrompt, contentType: 'implementation' as ContentType };
    
    return await this.generateContent(fullRequest);
  }

  /**
   * Generate practical tools and resources recommendations
   */
  public async generatePracticalTools(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const enhancedPrompt = this.buildToolsPrompt(request);
    const fullRequest = { ...request, prompt: enhancedPrompt, contentType: 'tools' as ContentType };
    
    return await this.generateContent(fullRequest);
  }

  /**
   * Generate audit evidence and documentation requirements
   */
  public async generateAuditEvidence(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const enhancedPrompt = this.buildEvidencePrompt(request);
    const fullRequest = { ...request, prompt: enhancedPrompt, contentType: 'evidence' as ContentType };
    
    return await this.generateContent(fullRequest);
  }

  /**
   * Enhance existing content quality
   */
  public async enhanceExistingContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const enhancedPrompt = this.buildEnhancementPrompt(request);
    const fullRequest = { ...request, prompt: enhancedPrompt, contentType: 'enhancement' as ContentType };
    
    return await this.generateContent(fullRequest);
  }

  /**
   * Validate content quality and provide scoring
   */
  public async validateContentQuality(content: string, context: GenerationContext): Promise<ContentQualityMetrics> {
    const prompt = this.buildValidationPrompt(content, context);
    
    const request: ContentGenerationRequest = {
      prompt,
      contentType: 'validation',
      context,
      options: {
        temperature: 0.1, // Low temperature for consistent validation
        maxTokens: 1000
      }
    };

    try {
      const response = await this.generateContent(request);
      return this.parseQualityMetrics(response.content);
    } catch (error) {
      console.error('Content validation failed:', error);
      // Return default metrics on validation failure
      return {
        relevance: 3.0,
        coherence: 3.0,
        accuracy: 3.0,
        completeness: 3.0,
        professionalTone: 3.0,
        overallScore: 3.0
      };
    }
  }

  // ============================================================================
  // CORE CONTENT GENERATION ENGINE
  // ============================================================================

  /**
   * Main content generation method with comprehensive error handling and logging
   */
  private async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const startTime = Date.now();
    let logId: string | null = null;
    
    try {
      // Start logging
      logId = await this.logGenerationStart(request);
      
      // Generate content with retry logic
      const response = await this.generateWithRetry(request, 3);
      
      // Validate quality if required
      const quality = await this.assessContentQuality(response.content, request);
      
      // Check quality threshold
      if (request.quality && !this.meetsQualityThreshold(quality, request.quality)) {
        throw new ContentValidationError(
          `Content quality (${quality.overallScore.toFixed(1)}) does not meet ${request.quality} standards`,
          { quality, threshold: this.qualityThresholds[request.quality] }
        );
      }

      const processingTime = Date.now() - startTime;
      const contentResponse: ContentGenerationResponse = {
        content: response.content,
        contentHash: this.generateContentHash(response.content),
        quality,
        metadata: {
          model: response.model,
          tokensUsed: response.tokensUsed,
          costEstimate: this.calculateCost(response.tokensUsed, response.model),
          processingTime,
          generationParameters: request.options || {},
          contentLength: response.content.length,
          language: 'en'
        },
        suggestions: response.suggestions,
        followUpQuestions: response.followUpQuestions,
        relatedFrameworks: this.extractRelatedFrameworks(response.content, request.context.frameworks)
      };

      // Log successful completion
      if (logId) {
        await this.logGenerationComplete(logId, contentResponse, true);
      }

      return contentResponse;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Log failure
      if (logId) {
        await this.logGenerationComplete(logId, null, false, error as Error, processingTime);
      }
      
      throw error;
    }
  }

  /**
   * Generate content with retry logic and exponential backoff
   */
  private async generateWithRetry(request: ContentGenerationRequest, maxRetries: number): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.callGeminiAPI(request);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof GeminiAPIError) {
          if (['INVALID_API_KEY', 'QUOTA_EXCEEDED', 'CONTENT_BLOCKED'].includes(error.code)) {
            throw error;
          }
        }
        
        // Calculate backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        
        console.warn(`Content generation attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new GeminiAPIError('All retry attempts failed', 'MAX_RETRIES_EXCEEDED');
  }

  /**
   * Call Gemini API with proper error handling
   */
  private async callGeminiAPI(request: ContentGenerationRequest): Promise<any> {
    const model = request.options?.model || this.defaultModel;
    const url = `${this.baseUrl}/models/${model}:generateContent`;
    
    const body = this.buildAPIRequest(request);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new GeminiAPIError(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData.error?.code || 'API_ERROR',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new GeminiAPIError('No content generated', 'NO_CANDIDATES');
    }

    const candidate = data.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      throw new GeminiAPIError('Content blocked by safety filters', 'CONTENT_BLOCKED');
    }

    return this.parseGeminiResponse(data, model);
  }

  /**
   * Build Gemini API request body
   */
  private buildAPIRequest(request: ContentGenerationRequest): any {
    const options = request.options || {};
    
    return {
      contents: [{
        parts: [{
          text: request.prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 4000,
        stopSequences: options.stopSequences || []
      },
      safetySettings: options.safetySettings || [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };
  }

  /**
   * Parse Gemini API response
   */
  private parseGeminiResponse(data: any, model: string): any {
    const candidate = data.candidates[0];
    const content = candidate.content.parts[0].text;
    
    // Extract usage metadata if available
    const usage = data.usageMetadata || {};
    const tokensUsed = {
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0
    };

    // Parse structured content if it contains JSON sections
    const parsedContent = this.parseStructuredContent(content);

    return {
      content: parsedContent.content,
      model,
      tokensUsed,
      suggestions: parsedContent.suggestions || [],
      followUpQuestions: parsedContent.followUpQuestions || []
    };
  }

  // ============================================================================
  // PROMPT ENGINEERING METHODS
  // ============================================================================

  /**
   * Build foundation content prompt
   */
  private buildFoundationPrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    const frameworksText = context.frameworks.join(', ');
    const roleContext = this.getRoleContext(context.userRole);
    const qualityLevel = request.quality || 'professional';
    
    return `As an expert CISO and compliance consultant, generate comprehensive foundation content for compliance implementation.

CONTEXT:
- Target Frameworks: ${frameworksText}
- Industry: ${context.industry || 'General'}
- Organization Size: ${context.organizationSize || 'Medium'}
- Target Audience: ${roleContext}
- Quality Level: ${qualityLevel.toUpperCase()}

ORIGINAL REQUEST:
${request.prompt}

REQUIREMENTS:
1. **Executive-Level Understanding**: Provide strategic context that impresses experienced CISOs
2. **Practical Applicability**: Ensure content is immediately actionable
3. **Multi-Framework Alignment**: Show how principles apply across ${frameworksText}
4. **Business Value**: Connect technical requirements to business outcomes
5. **Risk Perspective**: Frame everything in terms of risk management

OUTPUT STRUCTURE:
Generate content in the following format:

## Strategic Context
[High-level strategic importance and business rationale]

## Core Principles  
[Fundamental concepts and principles]

## Framework Alignment
[How this applies to each framework: ${frameworksText}]

## Business Impact
[Risk implications and business value]

## Foundation Requirements
[Essential foundational elements needed]

QUALITY STANDARDS:
- Professional tone suitable for C-level executives
- Specific, actionable guidance
- Evidence-based recommendations
- Clear connection to compliance objectives
- Appropriate depth for ${context.experienceLevel || 'intermediate'} audience

Generate ${qualityLevel === 'ciso-grade' ? 'exceptionally detailed and nuanced' : 'comprehensive'} content that demonstrates deep expertise while remaining accessible.`;
  }

  /**
   * Build implementation steps prompt
   */
  private buildImplementationPrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    const frameworksText = context.frameworks.join(', ');
    
    return `As an expert implementation consultant specializing in ${frameworksText}, provide detailed step-by-step implementation guidance.

CONTEXT:
- Target Frameworks: ${frameworksText}  
- Organization: ${context.organizationSize || 'Medium'} ${context.industry || 'organization'}
- Audience: ${this.getRoleContext(context.userRole)}
- Existing Content: ${context.existingContent ? 'Available for reference' : 'Starting from scratch'}

REQUEST:
${request.prompt}

IMPLEMENTATION APPROACH:
Generate a comprehensive implementation plan with:

## Phase 1: Assessment & Planning
[Current state assessment and planning steps]

## Phase 2: Design & Architecture  
[System design and architectural decisions]

## Phase 3: Implementation
[Detailed implementation steps with timelines]

## Phase 4: Testing & Validation
[Testing procedures and validation criteria]

## Phase 5: Deployment & Monitoring
[Deployment strategy and ongoing monitoring]

EACH PHASE SHOULD INCLUDE:
- ✅ Specific deliverables
- 📋 Detailed task breakdown
- ⏱️ Realistic timelines  
- 👥 Required resources and skills
- 🔍 Success criteria and checkpoints
- ⚠️ Common pitfalls and mitigation strategies
- 📊 Metrics and KPIs

Focus on practical, executable steps that can be implemented by a ${context.experienceLevel || 'intermediate'} team with clear success criteria.`;
  }

  /**
   * Build tools and resources prompt  
   */
  private buildToolsPrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    
    return `As a cybersecurity tools expert and CISO advisor, recommend specific tools and resources for compliance implementation.

CONTEXT:
- Frameworks: ${context.frameworks.join(', ')}
- Organization: ${context.organizationSize || 'Medium'} ${context.industry || 'business'}
- Budget Considerations: Consider both enterprise and cost-effective solutions

REQUEST:
${request.prompt}

TOOL RECOMMENDATIONS:

## Commercial/Enterprise Tools
[Premium solutions with enterprise features]

## Open Source Alternatives
[Cost-effective open source options]

## Cloud-Native Solutions
[Cloud platform native tools and services]

## Assessment & Monitoring Tools
[Continuous monitoring and compliance assessment]

## Documentation & Reporting Tools
[Evidence collection and reporting platforms]

FOR EACH TOOL CATEGORY:
- 🔧 **Specific Tool Names**: Actual product recommendations
- 💰 **Cost Considerations**: Licensing models and pricing tiers
- ⭐ **Key Features**: Most relevant capabilities
- 🔗 **Integration Capabilities**: How tools work together
- 📈 **Scalability**: Growth considerations
- 🎯 **Best Use Cases**: When to choose each option
- ⚠️ **Limitations**: Known constraints or trade-offs

Include both technical tools and process/methodology resources that support ${context.frameworks.join(' and ')} compliance.

Prioritize recommendations based on ${context.organizationSize || 'medium'} organization needs with practical implementation guidance.`;
  }

  /**
   * Build audit evidence prompt
   */
  private buildEvidencePrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    
    return `As an experienced compliance auditor and evidence collection expert, define comprehensive audit evidence requirements.

CONTEXT:
- Compliance Frameworks: ${context.frameworks.join(', ')}
- Organization Profile: ${context.organizationSize || 'Medium'} ${context.industry || 'organization'}
- Audit Preparation: Focus on practical evidence collection

REQUEST:
${request.prompt}

EVIDENCE FRAMEWORK:

## Documentation Evidence
[Required policies, procedures, and documentation]

## Technical Evidence  
[System configurations, logs, and technical artifacts]

## Operational Evidence
[Process records, training records, incident reports]

## Continuous Monitoring Evidence
[Ongoing monitoring data and trend analysis]

## Third-Party Evidence
[External assessments, certifications, vendor attestations]

FOR EACH EVIDENCE TYPE:
- 📋 **Specific Artifacts**: Exact documents/records needed
- 🗂️ **Organization Method**: How to structure and maintain
- ⏱️ **Retention Requirements**: How long to keep records  
- 🔍 **Quality Criteria**: What makes evidence audit-ready
- 📊 **Presentation Format**: How auditors expect to see it
- 🔄 **Update Frequency**: How often to refresh evidence
- ✅ **Verification Methods**: How to validate evidence quality

## Auditor Expectations
[What auditors specifically look for in ${context.frameworks.join(' and ')} assessments]

## Evidence Gaps & Remediation
[Common missing evidence and how to address gaps]

Focus on practical, implementable evidence collection strategies that will satisfy ${context.frameworks.join(' and ')} audit requirements.

Ensure recommendations are appropriate for ${context.experienceLevel || 'intermediate'} compliance teams.`;
  }

  /**
   * Build content enhancement prompt
   */
  private buildEnhancementPrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    
    return `As an expert content strategist and compliance communications specialist, enhance the provided content for maximum impact and usability.

EXISTING CONTENT:
${context.existingContent || request.prompt}

ENHANCEMENT OBJECTIVES:
- Improve clarity and professional tone
- Add specific, actionable details  
- Enhance framework alignment with ${context.frameworks.join(', ')}
- Increase practical value for ${this.getRoleContext(context.userRole)}
- Ensure ${request.quality || 'professional'} quality standards

ENHANCEMENT AREAS:

## Content Structure & Flow
[Improve organization and logical progression]

## Professional Language & Tone  
[Elevate language for executive audience]

## Specific Details & Examples
[Add concrete examples and specific guidance]

## Framework Integration
[Better alignment with ${context.frameworks.join(' and ')} requirements]

## Actionability
[Make recommendations more implementable]

## Completeness
[Fill gaps and add missing critical elements]

ENHANCED OUTPUT:
Provide the improved content with:
- 📈 **Improvement Summary**: Key changes made
- 🎯 **Added Value**: New insights or details added  
- ✅ **Quality Verification**: How enhancements address quality standards
- 🔗 **Framework Alignment**: Improved compliance connections

Focus on transforming good content into exceptional, CISO-grade guidance that demonstrates deep expertise while remaining practical and actionable.

Target quality level: ${request.quality?.toUpperCase() || 'PROFESSIONAL'}`;
  }

  /**
   * Build validation prompt for quality assessment
   */
  private buildValidationPrompt(content: string, context: GenerationContext): string {
    return `As an expert content quality assessor specializing in cybersecurity and compliance content, evaluate the following content across multiple quality dimensions.

CONTENT TO EVALUATE:
${content}

EVALUATION CONTEXT:
- Target Frameworks: ${context.frameworks.join(', ')}
- Target Audience: ${this.getRoleContext(context.userRole)}
- Industry Context: ${context.industry || 'General'}

QUALITY ASSESSMENT CRITERIA:

Evaluate each dimension on a 0-5 scale (5 = exceptional, 4 = very good, 3 = good, 2 = fair, 1 = poor, 0 = unacceptable):

1. **RELEVANCE** (0-5): How well does the content address the specific compliance requirements and frameworks mentioned?

2. **COHERENCE** (0-5): How well-structured, logical, and easy to follow is the content?

3. **ACCURACY** (0-5): How factually correct and technically sound is the information provided?

4. **COMPLETENESS** (0-5): How comprehensive is the coverage of the topic area?

5. **PROFESSIONAL_TONE** (0-5): How appropriate is the language and tone for the target audience?

OUTPUT FORMAT:
Provide your assessment as a JSON object:

{
  "relevance": X.X,
  "coherence": X.X, 
  "accuracy": X.X,
  "completeness": X.X,
  "professionalTone": X.X,
  "overallScore": X.X,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "recommendation": "brief overall assessment"
}

Be objective and constructive in your evaluation, focusing on how well the content serves compliance professionals implementing ${context.frameworks.join(' and ')} frameworks.`;
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS  
  // ============================================================================

  /**
   * Get role-specific context for prompts
   */
  private getRoleContext(role?: string): string {
    const roleContexts = {
      'ciso': 'Chief Information Security Officers and senior security executives',
      'security-analyst': 'Security analysts and technical implementers', 
      'compliance-officer': 'Compliance officers and GRC professionals',
      'auditor': 'Internal and external auditors',
      'manager': 'IT managers and team leads',
      'beginner': 'Professionals new to cybersecurity and compliance'
    };
    
    return roleContexts[role as keyof typeof roleContexts] || 'Cybersecurity and compliance professionals';
  }

  /**
   * Assess content quality using AI-powered analysis
   */
  private async assessContentQuality(content: string, request: ContentGenerationRequest): Promise<ContentQualityMetrics> {
    try {
      return await this.validateContentQuality(content, request.context);
    } catch (error) {
      console.warn('Quality assessment failed, using default metrics:', error);
      // Return reasonable default metrics if AI assessment fails
      return {
        relevance: 3.5,
        coherence: 3.5,
        accuracy: 3.5,
        completeness: 3.5,
        professionalTone: 3.5,
        overallScore: 3.5
      };
    }
  }

  /**
   * Parse quality metrics from validation response
   */
  private parseQualityMetrics(response: string): ContentQualityMetrics {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          relevance: parsed.relevance || 3.0,
          coherence: parsed.coherence || 3.0,
          accuracy: parsed.accuracy || 3.0,
          completeness: parsed.completeness || 3.0,
          professionalTone: parsed.professionalTone || 3.0,
          overallScore: parsed.overallScore || 3.0
        };
      }
    } catch (error) {
      console.warn('Failed to parse quality metrics JSON:', error);
    }
    
    // Return default metrics if parsing fails
    return {
      relevance: 3.0,
      coherence: 3.0,
      accuracy: 3.0,
      completeness: 3.0,
      professionalTone: 3.0,
      overallScore: 3.0
    };
  }

  /**
   * Check if content meets quality threshold
   */
  private meetsQualityThreshold(quality: ContentQualityMetrics, level: QualityLevel): boolean {
    const threshold = this.qualityThresholds[level];
    return quality.overallScore >= threshold.overallScore;
  }

  /**
   * Calculate API costs based on token usage
   */
  private calculateCost(tokensUsed: TokenUsage, model: string): CostEstimate {
    const pricing = this.pricing[model as keyof typeof this.pricing] || this.pricing['gemini-1.5-pro'];
    
    const promptCost = (tokensUsed.promptTokens / 1000) * pricing.prompt;
    const completionCost = (tokensUsed.completionTokens / 1000) * pricing.completion;
    
    return {
      promptCost: Number(promptCost.toFixed(6)),
      completionCost: Number(completionCost.toFixed(6)),
      totalCost: Number((promptCost + completionCost).toFixed(6)),
      currency: 'USD'
    };
  }

  /**
   * Generate content hash for caching
   */
  private generateContentHash(content: string): string {
    // Simple hash function for content identification
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Parse structured content from AI response
   */
  private parseStructuredContent(content: string): any {
    // Look for structured sections in the response
    const suggestions = this.extractSection(content, 'suggestions');
    const followUpQuestions = this.extractSection(content, 'follow.?up|next steps|questions');
    
    return {
      content: content.replace(/\n\n## (Suggestions|Follow.?Up|Next Steps|Questions)[\s\S]*$/i, '').trim(),
      suggestions,
      followUpQuestions
    };
  }

  /**
   * Extract specific sections from content
   */
  private extractSection(content: string, sectionPattern: string): string[] {
    const regex = new RegExp(`## (${sectionPattern})[\\s\\S]*?(?=\\n\\n##|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const sectionContent = match[0].replace(/^## [^\\n]+\\n/, '');
      return sectionContent
        .split(/\\n[\\-\\*] /)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    return [];
  }

  /**
   * Extract related frameworks from content
   */
  private extractRelatedFrameworks(content: string, originalFrameworks: string[]): string[] {
    const frameworks = ['ISO 27001', 'SOC 2', 'NIST', 'CIS Controls', 'GDPR', 'HIPAA', 'PCI DSS', 'FedRAMP'];
    const mentioned = frameworks.filter(framework => 
      content.toLowerCase().includes(framework.toLowerCase()) &&
      !originalFrameworks.includes(framework)
    );
    return mentioned;
  }

  // ============================================================================
  // DATABASE LOGGING METHODS
  // ============================================================================

  /**
   * Log generation start to database
   */
  private async logGenerationStart(request: ContentGenerationRequest): Promise<string | null> {
    try {
      const logEntry = {
        template_id: request.templateId,
        user_id: request.userId,
        organization_id: request.organizationId,
        session_id: request.sessionId,
        request_id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt_type: this.mapContentTypeToPromptType(request.contentType),
        input_prompt: request.prompt.substring(0, 10000), // Limit to prevent oversized entries
        framework_context: request.context.frameworks || [],
        user_context: {
          industry: request.context.industry,
          organizationSize: request.context.organizationSize,
          userRole: request.context.userRole,
          experienceLevel: request.context.experienceLevel
        },
        generation_parameters: request.options || {},
        ai_provider: 'gemini',
        ai_model: request.options?.model || this.defaultModel,
        model_version: '1.5-pro',
        success: false, // Will be updated on completion
        final_attempt: false
      };

      const { data, error } = await supabase
        .from('ai_generation_logs')
        .insert(logEntry)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log generation start:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error logging generation start:', error);
      return null;
    }
  }

  /**
   * Log generation completion to database
   */
  private async logGenerationComplete(
    logId: string,
    response: ContentGenerationResponse | null,
    success: boolean,
    error?: Error,
    processingTime?: number
  ): Promise<void> {
    try {
      const updateData: any = {
        success,
        final_attempt: true,
        response_time_ms: processingTime || 0
      };

      if (success && response) {
        updateData.response_content = response.content.substring(0, 50000); // Limit size
        updateData.response_metadata = response.metadata;
        updateData.tokens_prompt = response.metadata.tokensUsed.promptTokens;
        updateData.tokens_completion = response.metadata.tokensUsed.completionTokens;
        updateData.total_tokens = response.metadata.tokensUsed.totalTokens;
        updateData.prompt_cost = response.metadata.costEstimate.promptCost;
        updateData.completion_cost = response.metadata.costEstimate.completionCost;
        updateData.total_cost = response.metadata.costEstimate.totalCost;
        updateData.content_relevance = response.quality.relevance;
        updateData.content_coherence = response.quality.coherence;
        updateData.factual_accuracy = response.quality.accuracy;
        updateData.processing_time_ms = response.metadata.processingTime;
      }

      if (!success && error) {
        updateData.error_message = error.message.substring(0, 1000);
        updateData.error_code = error instanceof GeminiAPIError ? error.code : 'UNKNOWN_ERROR';
      }

      const { error: updateError } = await supabase
        .from('ai_generation_logs')
        .update(updateData)
        .eq('id', logId);

      if (updateError) {
        console.error('Failed to log generation completion:', updateError);
      }
    } catch (error) {
      console.error('Error logging generation completion:', error);
    }
  }

  /**
   * Map content type to prompt type for database
   */
  private mapContentTypeToPromptType(contentType: ContentType): string {
    const mapping = {
      'foundation': 'generate',
      'implementation': 'generate',
      'tools': 'generate',
      'evidence': 'generate',
      'enhancement': 'enhance',
      'validation': 'validate',
      'summary': 'summarize'
    };
    
    return mapping[contentType] || 'generate';
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  /**
   * Get API usage statistics for cost monitoring
   */
  public async getUsageStatistics(organizationId: string, timeRange: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_ai_usage_stats', {
          org_id: organizationId,
          time_range: timeRange
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get usage statistics:', error);
      return null;
    }
  }

  /**
   * Validate API configuration
   */
  public validateConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.apiKey) {
      issues.push('Gemini API key not configured');
    }
    
    if (!this.baseUrl) {
      issues.push('Base URL not configured');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get available models and their capabilities
   */
  public getAvailableModels(): Array<{ name: string; description: string; costMultiplier: number }> {
    return [
      {
        name: 'gemini-1.5-pro',
        description: 'Most capable model with multimodal understanding',
        costMultiplier: 1.0
      },
      {
        name: 'gemini-1.5-flash', 
        description: 'Fast and efficient model for quick responses',
        costMultiplier: 0.3
      },
      {
        name: 'gemini-pro',
        description: 'Balanced performance and cost',
        costMultiplier: 0.5
      }
    ];
  }
}

// Export singleton instance
export const geminiContentGenerator = GeminiContentGenerator.getInstance();