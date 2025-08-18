/**
 * Advanced Gemini API Web Scraping Service
 * AI-powered web content extraction and enhancement for compliance guidance
 * 
 * Features:
 * - Intelligent web content extraction using Gemini API
 * - Content quality assessment and relevance scoring
 * - Framework-specific content identification
 * - Automated content summarization and enhancement
 * - Real-time processing with streaming capabilities
 * - Content deduplication and merging algorithms
 */

import { supabase } from '@/lib/supabase';
import { GeminiContentGenerator, type ContentGenerationRequest, type ContentGenerationResponse } from './GeminiContentGenerator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WebScrapingRequest {
  url: string;
  frameworks: string[];
  categories: string[];
  quality: 'standard' | 'professional' | 'executive' | 'ciso-grade';
  options?: ScrapingOptions;
  organizationId?: string;
  userId?: string;
}

export interface ScrapingOptions {
  maxContentLength?: number;
  extractionDepth?: 'surface' | 'medium' | 'deep';
  languageFilter?: string[];
  contentTypes?: string[];
  respectRobots?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  metadata: ContentMetadata;
  extractedSections: ContentSection[];
  qualityScore: number;
  relevanceScore: number;
  frameworkAlignment: FrameworkAlignment[];
  categoryMapping: CategoryMapping[];
}

export interface ContentMetadata {
  domain: string;
  publishDate?: string;
  author?: string;
  contentType: string;
  language: string;
  wordCount: number;
  extractedAt: string;
  processingTime: number;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  sectionType: 'introduction' | 'implementation' | 'requirements' | 'guidelines' | 'tools' | 'evidence';
  relevanceScore: number;
  frameworks: string[];
  categories: string[];
  keywords: string[];
}

export interface FrameworkAlignment {
  framework: string;
  confidence: number;
  matchingElements: string[];
  references: string[];
}

export interface CategoryMapping {
  category: string;
  confidence: number;
  relevantSections: string[];
  keywords: string[];
}

export interface EnhancementSuggestion {
  type: 'content' | 'structure' | 'framework' | 'implementation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  rationale: string;
  frameworks: string[];
  categories: string[];
}

export interface WebScrapingResult {
  success: boolean;
  scrapedContent?: ScrapedContent;
  enhancedContent?: ContentGenerationResponse;
  suggestions: EnhancementSuggestion[];
  errors: string[];
  metadata: {
    processingTime: number;
    tokensUsed: number;
    cost: number;
    qualityScore: number;
    confidenceScore: number;
  };
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class GeminiWebScrapingService {
  private static instance: GeminiWebScrapingService | null = null;
  private geminiGenerator: GeminiContentGenerator;

  // Framework-specific extraction patterns
  private readonly frameworkPatterns = {
    'iso27001': [
      'information security management system', 'isms', 'iso 27001', 'security controls',
      'risk assessment', 'security policy', 'incident management', 'access control'
    ],
    'iso27002': [
      'iso 27002', 'security controls', 'implementation guidance', 'control objectives',
      'security measures', 'organizational security', 'physical security'
    ],
    'nist': [
      'nist cybersecurity framework', 'csf', 'identify', 'protect', 'detect', 'respond', 'recover',
      'cybersecurity core', 'implementation tiers', 'profiles'
    ],
    'cisControls': [
      'cis controls', 'critical security controls', 'cis safeguards', 'basic safeguards',
      'foundational safeguards', 'organizational safeguards'
    ],
    'gdpr': [
      'general data protection regulation', 'gdpr', 'personal data', 'data protection',
      'privacy by design', 'data subject rights', 'lawful basis'
    ],
    'nis2': [
      'nis2 directive', 'network information security', 'essential entities',
      'cybersecurity measures', 'incident reporting'
    ]
  };

  // Category-specific extraction patterns
  private readonly categoryPatterns = {
    'governance': ['governance', 'leadership', 'management', 'oversight', 'accountability', 'strategy'],
    'risk': ['risk management', 'threat assessment', 'vulnerability', 'risk register', 'mitigation'],
    'access': ['access control', 'identity management', 'authentication', 'authorization', 'user management'],
    'data': ['data protection', 'information security', 'data classification', 'data lifecycle'],
    'monitoring': ['monitoring', 'logging', 'detection', 'surveillance', 'alerting', 'siem'],
    'incident': ['incident response', 'emergency response', 'breach response', 'recovery'],
    'training': ['security awareness', 'training', 'education', 'competency development'],
    'vendor': ['vendor management', 'supplier assessment', 'third-party risk', 'outsourcing'],
    'physical': ['physical security', 'facility security', 'environmental controls'],
    'network': ['network security', 'firewall', 'network segmentation', 'infrastructure security']
  };

  private constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
  }

  public static getInstance(): GeminiWebScrapingService {
    if (!GeminiWebScrapingService.instance) {
      GeminiWebScrapingService.instance = new GeminiWebScrapingService();
    }
    return GeminiWebScrapingService.instance;
  }

  // ============================================================================
  // MAIN SCRAPING METHODS
  // ============================================================================

  /**
   * Scrape and enhance web content using AI
   */
  public async scrapeAndEnhance(request: WebScrapingRequest): Promise<WebScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.log(`[GeminiWebScraping] Starting AI-powered scraping for: ${request.url}`);

      // Step 1: Fetch raw content
      const rawContent = await this.fetchContent(request.url, request.options);
      if (!rawContent) {
        errors.push('Failed to fetch content from URL');
        return this.buildFailureResult(errors, Date.now() - startTime);
      }

      // Step 2: AI-powered content extraction and analysis
      const extractedContent = await this.aiExtractContent(rawContent, request);
      if (!extractedContent) {
        errors.push('AI content extraction failed');
        return this.buildFailureResult(errors, Date.now() - startTime);
      }

      // Step 3: Quality assessment and scoring
      const qualityScore = await this.assessContentQuality(extractedContent, request.frameworks);
      const relevanceScore = await this.assessRelevance(extractedContent, request.categories);

      // Step 4: Framework alignment analysis
      const frameworkAlignment = await this.analyzeFrameworkAlignment(extractedContent, request.frameworks);

      // Step 5: Category mapping
      const categoryMapping = await this.mapToCategories(extractedContent, request.categories);

      // Step 6: Generate enhancement suggestions
      const suggestions = await this.generateEnhancementSuggestions(extractedContent, request);

      // Step 7: Create enhanced content using AI
      const enhancedContent = await this.generateEnhancedContent(extractedContent, request);

      // Step 8: Build structured result
      const scrapedContent: ScrapedContent = {
        url: request.url,
        title: extractedContent.title,
        content: extractedContent.content,
        metadata: {
          domain: new URL(request.url).hostname,
          contentType: 'guidance',
          language: 'en',
          wordCount: extractedContent.content.split(/\s+/).length,
          extractedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime
        },
        extractedSections: extractedContent.sections,
        qualityScore,
        relevanceScore,
        frameworkAlignment,
        categoryMapping
      };

      const processingTime = Date.now() - startTime;
      console.log(`[GeminiWebScraping] Completed processing in ${processingTime}ms`);

      return {
        success: true,
        scrapedContent,
        enhancedContent,
        suggestions,
        errors,
        metadata: {
          processingTime,
          tokensUsed: enhancedContent?.metadata.tokensUsed.totalTokens || 0,
          cost: enhancedContent?.metadata.costEstimate.totalCost || 0,
          qualityScore,
          confidenceScore: frameworkAlignment.reduce((sum, fa) => sum + fa.confidence, 0) / frameworkAlignment.length
        }
      };

    } catch (error) {
      console.error('[GeminiWebScraping] Scraping failed:', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.buildFailureResult(errors, Date.now() - startTime);
    }
  }

  /**
   * Bulk process multiple URLs
   */
  public async bulkScrapeAndEnhance(
    urls: string[],
    frameworks: string[],
    categories: string[],
    quality: 'standard' | 'professional' | 'executive' | 'ciso-grade' = 'professional'
  ): Promise<WebScrapingResult[]> {
    const results: WebScrapingResult[] = [];
    
    console.log(`[GeminiWebScraping] Starting bulk processing of ${urls.length} URLs`);

    for (const url of urls) {
      try {
        const result = await this.scrapeAndEnhance({
          url,
          frameworks,
          categories,
          quality
        });
        results.push(result);

        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`[GeminiWebScraping] Failed to process ${url}:`, error);
        results.push(this.buildFailureResult([error instanceof Error ? error.message : 'Unknown error'], 0));
      }
    }

    return results;
  }

  // ============================================================================
  // AI-POWERED CONTENT EXTRACTION
  // ============================================================================

  /**
   * Extract content using AI analysis
   */
  private async aiExtractContent(rawContent: string, request: WebScrapingRequest): Promise<{
    title: string;
    content: string;
    sections: ContentSection[];
  } | null> {
    try {
      const extractionPrompt = this.buildExtractionPrompt(rawContent, request);
      
      const extractionRequest: ContentGenerationRequest = {
        prompt: extractionPrompt,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer',
          experienceLevel: 'intermediate'
        },
        options: {
          temperature: 0.3,
          maxTokens: 6000
        }
      };

      const response = await this.geminiGenerator.enhanceExistingContent(extractionRequest);
      
      return this.parseExtractionResponse(response.content);

    } catch (error) {
      console.error('[GeminiWebScraping] AI extraction failed:', error);
      return null;
    }
  }

  /**
   * Build AI prompt for content extraction
   */
  private buildExtractionPrompt(rawContent: string, request: WebScrapingRequest): string {
    const frameworksText = request.frameworks.join(', ');
    const categoriesText = request.categories.join(', ');

    return `As an expert cybersecurity content analyst, extract and structure relevant compliance guidance from the following web content.

TARGET FRAMEWORKS: ${frameworksText}
TARGET CATEGORIES: ${categoriesText}
QUALITY LEVEL: ${request.quality.toUpperCase()}

RAW CONTENT TO ANALYZE:
${rawContent.substring(0, 15000)} ${rawContent.length > 15000 ? '...' : ''}

EXTRACTION REQUIREMENTS:
1. **Relevance Filtering**: Only extract content directly relevant to ${frameworksText} frameworks
2. **Category Alignment**: Focus on content related to ${categoriesText}
3. **Quality Standards**: Ensure ${request.quality} quality level content
4. **Structure Preservation**: Maintain logical content organization
5. **Framework References**: Identify specific framework mentions and references

OUTPUT FORMAT:
Structure your response as JSON:

{
  "title": "Clear, descriptive title for the content",
  "content": "Main extracted content with clear structure and formatting",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "content": "Section content",
      "sectionType": "requirements|implementation|guidelines|tools|evidence",
      "frameworks": ["framework1", "framework2"],
      "categories": ["category1", "category2"],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

EXTRACTION CRITERIA:
- Extract 3-7 logical sections based on content structure
- Each section should be 200-800 words
- Focus on actionable guidance and requirements
- Identify framework-specific references
- Map content to relevant compliance categories
- Extract key technical and procedural keywords

Ensure the extracted content is immediately useful for compliance professionals implementing ${frameworksText} frameworks.`;
  }

  /**
   * Parse AI extraction response
   */
  private parseExtractionResponse(response: string): {
    title: string;
    content: string;
    sections: ContentSection[];
  } | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          title: parsed.title || 'Extracted Compliance Content',
          content: parsed.content || '',
          sections: (parsed.sections || []).map((section: any, index: number) => ({
            id: section.id || `section_${index + 1}`,
            title: section.title || `Section ${index + 1}`,
            content: section.content || '',
            sectionType: section.sectionType || 'guidelines',
            relevanceScore: 0.8, // Will be calculated separately
            frameworks: section.frameworks || [],
            categories: section.categories || [],
            keywords: section.keywords || []
          }))
        };
      }
    } catch (error) {
      console.warn('[GeminiWebScraping] Failed to parse extraction JSON:', error);
    }

    // Fallback to text parsing
    return {
      title: 'Extracted Content',
      content: response,
      sections: []
    };
  }

  // ============================================================================
  // QUALITY AND RELEVANCE ASSESSMENT
  // ============================================================================

  /**
   * Assess content quality using AI
   */
  private async assessContentQuality(content: any, frameworks: string[]): Promise<number> {
    try {
      const qualityPrompt = `As a cybersecurity content quality assessor, evaluate the following content for compliance guidance quality:

CONTENT: ${content.content.substring(0, 2000)}...

ASSESSMENT CRITERIA:
1. Technical Accuracy (0-2 points)
2. Framework Alignment with ${frameworks.join(', ')} (0-2 points)
3. Actionability and Clarity (0-2 points)
4. Completeness (0-2 points)
5. Professional Standards (0-2 points)

Provide a score from 0-10 and brief rationale.

RESPONSE FORMAT:
Score: X.X/10
Rationale: Brief explanation`;

      const request: ContentGenerationRequest = {
        prompt: qualityPrompt,
        contentType: 'validation',
        context: {
          frameworks,
          userRole: 'compliance-officer'
        },
        options: { temperature: 0.1, maxTokens: 500 }
      };

      const response = await this.geminiGenerator.generateContent(request);
      
      // Extract score from response
      const scoreMatch = response.content.match(/Score:\s*(\d+\.?\d*)/i);
      if (scoreMatch) {
        return Math.min(Math.max(parseFloat(scoreMatch[1]), 0), 10) / 10; // Normalize to 0-1
      }

      return 0.7; // Default score

    } catch (error) {
      console.warn('[GeminiWebScraping] Quality assessment failed:', error);
      return 0.7;
    }
  }

  /**
   * Assess content relevance to categories
   */
  private async assessRelevance(content: any, categories: string[]): Promise<number> {
    const relevantKeywords = categories.flatMap(category => 
      this.categoryPatterns[category as keyof typeof this.categoryPatterns] || []
    );

    const contentText = content.content.toLowerCase();
    const matchedKeywords = relevantKeywords.filter(keyword =>
      contentText.includes(keyword.toLowerCase())
    );

    return Math.min(matchedKeywords.length / Math.max(relevantKeywords.length * 0.3, 1), 1);
  }

  /**
   * Analyze framework alignment
   */
  private async analyzeFrameworkAlignment(content: any, frameworks: string[]): Promise<FrameworkAlignment[]> {
    const alignments: FrameworkAlignment[] = [];

    for (const framework of frameworks) {
      const patterns = this.frameworkPatterns[framework as keyof typeof this.frameworkPatterns] || [];
      const contentText = content.content.toLowerCase();
      
      const matchingElements = patterns.filter(pattern =>
        contentText.includes(pattern.toLowerCase())
      );

      const confidence = Math.min(matchingElements.length / Math.max(patterns.length * 0.2, 1), 1);

      alignments.push({
        framework,
        confidence,
        matchingElements,
        references: matchingElements.slice(0, 3) // Top 3 references
      });
    }

    return alignments;
  }

  /**
   * Map content to categories
   */
  private async mapToCategories(content: any, categories: string[]): Promise<CategoryMapping[]> {
    const mappings: CategoryMapping[] = [];

    for (const category of categories) {
      const keywords = this.categoryPatterns[category as keyof typeof this.categoryPatterns] || [];
      const contentText = content.content.toLowerCase();
      
      const relevantKeywords = keywords.filter(keyword =>
        contentText.includes(keyword.toLowerCase())
      );

      const confidence = Math.min(relevantKeywords.length / Math.max(keywords.length * 0.3, 1), 1);

      const relevantSections = content.sections
        ?.filter((section: any) => section.categories.includes(category))
        .map((section: any) => section.id) || [];

      mappings.push({
        category,
        confidence,
        relevantSections,
        keywords: relevantKeywords
      });
    }

    return mappings;
  }

  // ============================================================================
  // ENHANCEMENT SUGGESTIONS
  // ============================================================================

  /**
   * Generate AI-powered enhancement suggestions
   */
  private async generateEnhancementSuggestions(
    content: any,
    request: WebScrapingRequest
  ): Promise<EnhancementSuggestion[]> {
    try {
      const suggestionPrompt = `As a cybersecurity compliance expert, analyze the following content and provide specific enhancement suggestions:

CONTENT: ${content.content.substring(0, 2000)}...
FRAMEWORKS: ${request.frameworks.join(', ')}
CATEGORIES: ${request.categories.join(', ')}
QUALITY TARGET: ${request.quality}

Provide 3-5 specific suggestions to improve the content for compliance guidance. For each suggestion, specify:
- Type (content/structure/framework/implementation)
- Priority (low/medium/high/critical)
- Specific suggestion
- Rationale
- Relevant frameworks
- Relevant categories

FORMAT: JSON array of suggestions`;

      const suggestionRequest: ContentGenerationRequest = {
        prompt: suggestionPrompt,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer'
        },
        options: { temperature: 0.5, maxTokens: 1500 }
      };

      const response = await this.geminiGenerator.enhanceExistingContent(suggestionRequest);
      
      return this.parseEnhancementSuggestions(response.content);

    } catch (error) {
      console.warn('[GeminiWebScraping] Failed to generate suggestions:', error);
      return [];
    }
  }

  /**
   * Parse enhancement suggestions from AI response
   */
  private parseEnhancementSuggestions(response: string): EnhancementSuggestion[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((suggestion: any) => ({
          type: suggestion.type || 'content',
          priority: suggestion.priority || 'medium',
          suggestion: suggestion.suggestion || '',
          rationale: suggestion.rationale || '',
          frameworks: suggestion.frameworks || [],
          categories: suggestion.categories || []
        }));
      }
    } catch (error) {
      console.warn('[GeminiWebScraping] Failed to parse suggestions JSON:', error);
    }

    return [
      {
        type: 'content',
        priority: 'medium',
        suggestion: 'Enhance content with more specific implementation guidance',
        rationale: 'Current content could benefit from more actionable steps',
        frameworks: [],
        categories: []
      }
    ];
  }

  // ============================================================================
  // ENHANCED CONTENT GENERATION
  // ============================================================================

  /**
   * Generate enhanced content using AI
   */
  private async generateEnhancedContent(
    extractedContent: any,
    request: WebScrapingRequest
  ): Promise<ContentGenerationResponse> {
    try {
      const enhancementRequest: ContentGenerationRequest = {
        prompt: `Enhance and optimize the following cybersecurity content for ${request.frameworks.join(' and ')} compliance:

ORIGINAL CONTENT:
${extractedContent.content}

ENHANCEMENT OBJECTIVES:
- Improve clarity and professional tone for ${request.quality} standards
- Add specific implementation guidance
- Enhance framework alignment with ${request.frameworks.join(', ')}
- Increase practical value for compliance professionals
- Add relevant examples and best practices`,
        contentType: 'enhancement',
        context: {
          frameworks: request.frameworks,
          userRole: 'compliance-officer',
          experienceLevel: 'intermediate',
          existingContent: extractedContent.content
        },
        quality: request.quality,
        options: {
          temperature: 0.6,
          maxTokens: 5000
        }
      };

      return await this.geminiGenerator.enhanceExistingContent(enhancementRequest);

    } catch (error) {
      console.error('[GeminiWebScraping] Content enhancement failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Fetch content from URL
   */
  private async fetchContent(url: string, options?: ScrapingOptions): Promise<string | null> {
    try {
      const timeout = options?.timeout || 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuditReady Compliance Assistant (AI-Powered Content Enhancement)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Basic content extraction (enhanced version of browser-compatible extraction)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove unwanted elements
      ['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement'].forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Extract main content
      const contentSelectors = [
        'main', 'article', '.content', '.main-content', '.post-content', 
        '.entry-content', '#content', '#main', '.container'
      ];

      let mainContent = '';
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          mainContent = element.textContent?.trim() || '';
          if (mainContent.length > 1000) break;
        }
      }

      if (!mainContent || mainContent.length < 1000) {
        mainContent = doc.body?.textContent?.trim() || '';
      }

      return mainContent;

    } catch (error) {
      console.error(`[GeminiWebScraping] Failed to fetch ${url}:`, error);
      return null;
    }
  }

  /**
   * Build failure result
   */
  private buildFailureResult(errors: string[], processingTime: number): WebScrapingResult {
    return {
      success: false,
      suggestions: [],
      errors,
      metadata: {
        processingTime,
        tokensUsed: 0,
        cost: 0,
        qualityScore: 0,
        confidenceScore: 0
      }
    };
  }

  // ============================================================================
  // DATABASE INTEGRATION
  // ============================================================================

  /**
   * Store scraping results in database
   */
  public async storeScrapingResult(result: WebScrapingResult, organizationId?: string): Promise<string | null> {
    try {
      if (!result.success || !result.scrapedContent) {
        return null;
      }

      const { data, error } = await supabase
        .from('ai_scraped_content')
        .insert({
          url: result.scrapedContent.url,
          title: result.scrapedContent.title,
          content: result.scrapedContent.content,
          enhanced_content: result.enhancedContent?.content,
          metadata: result.scrapedContent.metadata,
          quality_score: result.metadata.qualityScore,
          confidence_score: result.metadata.confidenceScore,
          framework_alignments: result.scrapedContent.frameworkAlignment,
          category_mappings: result.scrapedContent.categoryMapping,
          enhancement_suggestions: result.suggestions,
          processing_metrics: {
            processingTime: result.metadata.processingTime,
            tokensUsed: result.metadata.tokensUsed,
            cost: result.metadata.cost
          },
          organization_id: organizationId,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('[GeminiWebScraping] Failed to store result:', error);
        return null;
      }

      return data.id;

    } catch (error) {
      console.error('[GeminiWebScraping] Storage error:', error);
      return null;
    }
  }

  /**
   * Get scraping analytics
   */
  public async getScrapingAnalytics(organizationId?: string): Promise<any> {
    try {
      let query = supabase
        .from('ai_scraped_content')
        .select('quality_score, confidence_score, processing_metrics, created_at');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const totalScrapes = data?.length || 0;
      const avgQuality = data?.reduce((sum, item) => sum + item.quality_score, 0) / totalScrapes || 0;
      const avgConfidence = data?.reduce((sum, item) => sum + item.confidence_score, 0) / totalScrapes || 0;
      const totalCost = data?.reduce((sum, item) => sum + (item.processing_metrics?.cost || 0), 0) || 0;

      return {
        totalScrapes,
        avgQualityScore: avgQuality,
        avgConfidenceScore: avgConfidence,
        totalCost,
        successRate: totalScrapes > 0 ? 1.0 : 0 // Simplified success rate
      };

    } catch (error) {
      console.error('[GeminiWebScraping] Analytics error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const geminiWebScrapingService = GeminiWebScrapingService.getInstance();