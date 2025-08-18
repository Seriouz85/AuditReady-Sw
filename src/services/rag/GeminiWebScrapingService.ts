/**
 * Gemini Web Scraping Service
 * Advanced web content extraction using Google Gemini AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ScrapingConfig {
  frameworks: string[];
  categories: string[];
  maxContentLength?: number;
  includeMetadata?: boolean;
}

export interface ExtractedWebContent {
  title: string;
  description?: string;
  content: string;
  metadata: {
    url: string;
    domain: string;
    extractedAt: string;
    contentLength: number;
    relevanceScore: number;
    frameworks: string[];
    categories: string[];
  };
  sections: ContentSection[];
}

export interface ContentSection {
  title: string;
  content: string;
  relevanceScore: number;
  frameworks: string[];
}

export class GeminiWebScrapingService {
  private static genAI: GoogleGenerativeAI | null = null;

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
   * Extract and analyze web content using Gemini AI
   */
  static async extractContent(
    url: string, 
    config: ScrapingConfig
  ): Promise<ExtractedWebContent> {
    try {
      console.log(`[GeminiScraping] Extracting content from: ${url}`);

      // Step 1: Fetch raw HTML content
      const htmlContent = await this.fetchHTMLContent(url);
      
      // Step 2: Use Gemini to extract and analyze content
      const analysisResult = await this.analyzeContentWithGemini(htmlContent, url, config);
      
      // Step 3: Structure the response
      return this.structureExtractedContent(analysisResult, url, config);

    } catch (error) {
      console.error('[GeminiScraping] Content extraction failed:', error);
      throw error;
    }
  }

  /**
   * Fetch HTML content from URL
   */
  private static async fetchHTMLContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuditReady AI Knowledge Bot 1.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      if (!html || html.length < 100) {
        throw new Error('Content too short or empty');
      }

      return html;

    } catch (error) {
      console.error(`[GeminiScraping] Failed to fetch HTML from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Analyze content using Gemini AI
   */
  private static async analyzeContentWithGemini(
    html: string,
    url: string,
    config: ScrapingConfig
  ): Promise<any> {
    try {
      const genAI = this.initializeAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze this web page for compliance and security knowledge content.

**URL:** ${url}
**Target Frameworks:** ${config.frameworks.join(', ')}
**Target Categories:** ${config.categories.join(', ')}

**HTML Content:**
${html.substring(0, 8000)} ${html.length > 8000 ? '...[truncated]' : ''}

**Analysis Requirements:**
1. Extract the main title and description
2. Identify and extract relevant compliance/security content
3. Categorize content by compliance domains
4. Identify framework-specific guidance
5. Assess content quality and relevance
6. Structure content into logical sections

**Output Format (JSON):**
{
  "title": "Page title",
  "description": "Brief description",
  "mainContent": "Primary content relevant to compliance/security",
  "relevanceScore": 0.8,
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "relevanceScore": 0.9,
      "frameworks": ["iso27001", "nist"],
      "categories": ["access_control", "governance"]
    }
  ],
  "identifiedFrameworks": ["iso27001", "nist", "gdpr"],
  "identifiedCategories": ["governance", "access_control"],
  "qualityAssessment": {
    "authorityScore": 0.8,
    "completenessScore": 0.7,
    "clarityScore": 0.9,
    "practicalityScore": 0.8
  },
  "metadata": {
    "contentType": "guidance|standard|regulation|bestpractice",
    "technicalDepth": "basic|intermediate|advanced|expert",
    "targetAudience": "executives|managers|practitioners|technical",
    "keyTopics": ["topic1", "topic2"]
  }
}

Focus on extracting actionable compliance and security guidance. Ignore navigation, advertisements, and irrelevant content.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      // Parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Gemini analysis response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('[GeminiScraping] Gemini analysis failed:', error);
      throw error;
    }
  }

  /**
   * Structure the extracted content into standardized format
   */
  private static structureExtractedContent(
    analysisResult: any,
    url: string,
    config: ScrapingConfig
  ): ExtractedWebContent {
    const domain = new URL(url).hostname;
    
    return {
      title: analysisResult.title || 'Extracted Content',
      description: analysisResult.description,
      content: analysisResult.mainContent || '',
      metadata: {
        url,
        domain,
        extractedAt: new Date().toISOString(),
        contentLength: (analysisResult.mainContent || '').length,
        relevanceScore: analysisResult.relevanceScore || 0.7,
        frameworks: analysisResult.identifiedFrameworks || [],
        categories: analysisResult.identifiedCategories || []
      },
      sections: (analysisResult.sections || []).map((section: any) => ({
        title: section.title,
        content: section.content,
        relevanceScore: section.relevanceScore || 0.7,
        frameworks: section.frameworks || []
      }))
    };
  }

  /**
   * Extract content from multiple URLs in batch
   */
  static async extractBatchContent(
    urls: string[],
    config: ScrapingConfig
  ): Promise<ExtractedWebContent[]> {
    const results: ExtractedWebContent[] = [];
    
    for (const url of urls) {
      try {
        const content = await this.extractContent(url, config);
        results.push(content);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`[GeminiScraping] Failed to extract from ${url}:`, error);
        // Continue with other URLs
      }
    }
    
    return results;
  }

  /**
   * Validate extracted content quality
   */
  static validateExtractedContent(content: ExtractedWebContent): {
    isValid: boolean;
    issues: string[];
    qualityScore: number;
  } {
    const issues: string[] = [];
    let qualityScore = 1.0;

    // Check content length
    if (content.content.length < 200) {
      issues.push('Content too short');
      qualityScore -= 0.3;
    }

    // Check relevance score
    if (content.metadata.relevanceScore < 0.5) {
      issues.push('Low relevance score');
      qualityScore -= 0.2;
    }

    // Check framework identification
    if (content.metadata.frameworks.length === 0) {
      issues.push('No frameworks identified');
      qualityScore -= 0.2;
    }

    // Check category identification
    if (content.metadata.categories.length === 0) {
      issues.push('No categories identified');
      qualityScore -= 0.2;
    }

    // Check sections
    if (content.sections.length === 0) {
      issues.push('No structured sections found');
      qualityScore -= 0.1;
    }

    qualityScore = Math.max(0, qualityScore);

    return {
      isValid: qualityScore >= 0.6 && issues.length < 3,
      issues,
      qualityScore
    };
  }
}