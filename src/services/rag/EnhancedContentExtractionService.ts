/**
 * Enhanced Content Extraction Service
 * Advanced AI-powered content extraction with semantic analysis
 * Optimized for compliance and regulatory content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface EnhancedExtractionConfig {
  contentSelectors: string[];
  prioritySelectors: string[];
  excludeSelectors: string[];
  maxChunkSize: number;
  minChunkSize: number;
  semanticAnalysis: boolean;
  complianceFrameworks: string[];
  targetCategories: string[];
  qualityThreshold: number;
}

export interface ExtractedContent {
  mainContent: string;
  structuredSections: ContentSection[];
  metadata: ContentMetadata;
  qualityScore: number;
  relevanceScore: number;
  extractionMethod: 'ai-enhanced' | 'rule-based' | 'hybrid';
}

export interface ContentSection {
  id: string;
  title?: string;
  content: string;
  sectionType: 'header' | 'requirement' | 'guidance' | 'implementation' | 'example';
  relevanceScore: number;
  complianceCategories: string[];
  frameworks: string[];
  semanticTags: string[];
  wordCount: number;
}

export interface ContentMetadata {
  url: string;
  domain: string;
  title: string;
  description?: string;
  lastModified?: string;
  authorityIndicators: string[];
  frameworkReferences: string[];
  documentType: 'guidance' | 'standard' | 'regulation' | 'bestpractice' | 'implementation';
  credibilityScore: number;
  freshnessScore: number;
}

export class EnhancedContentExtractionService {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize AI service
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
   * Enhanced content extraction with AI-powered semantic analysis
   */
  static async extractEnhancedContent(
    html: string,
    url: string,
    config: Partial<EnhancedExtractionConfig> = {}
  ): Promise<ExtractedContent> {
    const startTime = Date.now();
    
    try {
      console.log(`[EnhancedExtraction] Starting AI-enhanced extraction for: ${url}`);

      // 1. Basic content extraction and cleanup
      const cleanedContent = await this.performBasicExtraction(html, url, config);
      
      if (!cleanedContent || cleanedContent.length < 200) {
        throw new Error('Insufficient content for enhanced extraction');
      }

      // 2. AI-powered semantic analysis
      const semanticAnalysis = config.semanticAnalysis !== false 
        ? await this.performSemanticAnalysis(cleanedContent, url, config)
        : null;

      // 3. Structured section extraction
      const structuredSections = await this.extractStructuredSections(
        cleanedContent, 
        semanticAnalysis, 
        config
      );

      // 4. Generate metadata
      const metadata = await this.generateContentMetadata(html, url, structuredSections);

      // 5. Calculate quality and relevance scores
      const qualityScore = this.calculateQualityScore(structuredSections, metadata);
      const relevanceScore = this.calculateRelevanceScore(structuredSections, config);

      const result: ExtractedContent = {
        mainContent: cleanedContent,
        structuredSections,
        metadata,
        qualityScore,
        relevanceScore,
        extractionMethod: semanticAnalysis ? 'ai-enhanced' : 'rule-based'
      };

      console.log(`[EnhancedExtraction] Completed in ${Date.now() - startTime}ms with quality: ${qualityScore.toFixed(2)}`);
      return result;

    } catch (error) {
      console.error('[EnhancedExtraction] AI-enhanced extraction failed:', error);
      
      // Fallback to basic extraction
      return this.fallbackExtraction(html, url, config);
    }
  }

  /**
   * Perform basic content extraction and cleanup
   */
  private static async performBasicExtraction(
    html: string,
    url: string,
    config: Partial<EnhancedExtractionConfig>
  ): Promise<string> {
    try {
      if (typeof window !== 'undefined') {
        // Browser-based extraction
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove unwanted elements
        const excludeSelectors = config.excludeSelectors || [
          'script', 'style', 'nav', 'header', 'footer', 'aside', 
          '.navigation', '.menu', '.sidebar', '.advertisement', 
          '.cookie-banner', '.popup', '#comments'
        ];
        
        excludeSelectors.forEach(selector => {
          doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Extract main content using priority selectors
        const prioritySelectors = config.prioritySelectors || [
          'main', 'article', '.main-content', '.content', '.post-content',
          '.entry-content', '#content', '#main', '.document-content',
          '.compliance-content', '.standard-content'
        ];

        let mainContent = '';
        for (const selector of prioritySelectors) {
          const element = doc.querySelector(selector);
          if (element) {
            mainContent = element.textContent?.trim() || '';
            if (mainContent.length > 500) break;
          }
        }

        // Fallback to body if no priority content found
        if (!mainContent || mainContent.length < 500) {
          mainContent = doc.body?.textContent?.trim() || '';
        }

        // Clean and normalize text
        return this.cleanAndNormalizeText(mainContent);

      } else {
        // Server-side extraction (simplified)
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return this.cleanAndNormalizeText(textContent);
      }

    } catch (error) {
      console.error('[EnhancedExtraction] Basic extraction failed:', error);
      return '';
    }
  }

  /**
   * AI-powered semantic analysis of content
   */
  private static async performSemanticAnalysis(
    content: string,
    url: string,
    config: Partial<EnhancedExtractionConfig>
  ): Promise<any> {
    try {
      const genAI = this.initializeAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const frameworks = config.complianceFrameworks?.join(', ') || 'ISO 27001, NIST, GDPR, NIS2';
      const categories = config.targetCategories?.join(', ') || 'security, compliance, risk management';

      const prompt = `Analyze this compliance/security content for semantic structure and relevance.

Content URL: ${url}
Target Frameworks: ${frameworks}
Target Categories: ${categories}

Content to analyze:
${content.substring(0, 4000)}

Provide analysis in JSON format:
{
  "documentType": "guidance|standard|regulation|bestpractice|implementation",
  "primaryFrameworks": ["framework1", "framework2"],
  "complianceCategories": ["category1", "category2"],
  "contentSections": [
    {
      "title": "Section title",
      "type": "header|requirement|guidance|implementation|example",
      "relevanceScore": 0.8,
      "keyTopics": ["topic1", "topic2"]
    }
  ],
  "authorityIndicators": ["indicator1", "indicator2"],
  "credibilityScore": 0.9,
  "mainTopics": ["topic1", "topic2"]
}

Focus on compliance relevance and practical implementation guidance.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      // Parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;

    } catch (error) {
      console.error('[EnhancedExtraction] Semantic analysis failed:', error);
      return null;
    }
  }

  /**
   * Extract structured sections with enhanced categorization
   */
  private static async extractStructuredSections(
    content: string,
    semanticAnalysis: any,
    config: Partial<EnhancedExtractionConfig>
  ): Promise<ContentSection[]> {
    const sections: ContentSection[] = [];
    
    try {
      // Split content into logical sections
      const rawSections = this.splitContentIntoSections(content);
      
      for (let i = 0; i < rawSections.length; i++) {
        const sectionContent = rawSections[i];
        
        if (sectionContent.length < (config.minChunkSize || 100)) continue;
        if (sectionContent.length > (config.maxChunkSize || 2000)) {
          // Further split large sections
          const subSections = this.splitLargeSection(sectionContent, config.maxChunkSize || 2000);
          for (const subSection of subSections) {
            sections.push(await this.createContentSection(subSection, i, semanticAnalysis, config));
          }
        } else {
          sections.push(await this.createContentSection(sectionContent, i, semanticAnalysis, config));
        }
      }

      // Filter sections by quality and relevance
      return sections.filter(section => 
        section.relevanceScore >= (config.qualityThreshold || 0.5) &&
        this.isComplianceRelevant(section.content)
      );

    } catch (error) {
      console.error('[EnhancedExtraction] Section extraction failed:', error);
      return [];
    }
  }

  /**
   * Create enhanced content section with metadata
   */
  private static async createContentSection(
    content: string,
    index: number,
    semanticAnalysis: any,
    config: Partial<EnhancedExtractionConfig>
  ): Promise<ContentSection> {
    const sectionId = `section-${index}-${Date.now()}`;
    
    // Determine section type
    const sectionType = this.determineSectionType(content);
    
    // Extract title if available
    const title = this.extractSectionTitle(content);
    
    // Calculate relevance score
    const relevanceScore = this.calculateSectionRelevance(content, config);
    
    // Extract compliance categories
    const complianceCategories = this.extractComplianceCategories(content);
    
    // Extract framework references
    const frameworks = this.extractFrameworkReferences(content);
    
    // Generate semantic tags
    const semanticTags = this.generateSemanticTags(content, semanticAnalysis);
    
    return {
      id: sectionId,
      title,
      content: content.trim(),
      sectionType,
      relevanceScore,
      complianceCategories,
      frameworks,
      semanticTags,
      wordCount: content.split(/\s+/).length
    };
  }

  /**
   * Generate comprehensive content metadata
   */
  private static async generateContentMetadata(
    html: string,
    url: string,
    sections: ContentSection[]
  ): Promise<ContentMetadata> {
    const domain = new URL(url).hostname;
    
    // Extract basic metadata
    let title = 'Unknown Document';
    let description = '';
    
    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      title = doc.querySelector('title')?.textContent?.trim() || 
              doc.querySelector('h1')?.textContent?.trim() || 
              title;
      
      description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                   doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                   '';
    }

    // Aggregate framework references from sections
    const frameworkReferences = [...new Set(
      sections.flatMap(section => section.frameworks)
    )];

    // Determine document type based on content analysis
    const documentType = this.determineDocumentType(sections, url);
    
    // Generate authority indicators
    const authorityIndicators = this.generateAuthorityIndicators(domain, url, sections);
    
    // Calculate credibility score
    const credibilityScore = this.calculateCredibilityScore(domain, authorityIndicators, sections);
    
    // Calculate freshness score
    const freshnessScore = this.calculateFreshnessScore(html, url);

    return {
      url,
      domain,
      title,
      description,
      authorityIndicators,
      frameworkReferences,
      documentType,
      credibilityScore,
      freshnessScore
    };
  }

  // Helper methods

  private static cleanAndNormalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]]/g, ' ')
      .trim();
  }

  private static splitContentIntoSections(content: string): string[] {
    // Split by headers, numbered lists, or logical breaks
    const sections = content
      .split(/\n\n+|(?=^\d+\.|(?=^[A-Z][^.]*:)|(?=^#+\s))/)
      .map(section => section.trim())
      .filter(section => section.length > 50);

    return sections;
  }

  private static splitLargeSection(content: string, maxSize: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const sections: string[] = [];
    let currentSection = '';

    for (const sentence of sentences) {
      if ((currentSection + sentence).length > maxSize && currentSection.length > 0) {
        sections.push(currentSection.trim());
        currentSection = sentence;
      } else {
        currentSection += (currentSection ? '. ' : '') + sentence;
      }
    }

    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }

    return sections;
  }

  private static determineSectionType(content: string): 'header' | 'requirement' | 'guidance' | 'implementation' | 'example' {
    const lowerContent = content.toLowerCase();
    
    if (/^#|^[A-Z][^.]*:$/.test(content.trim())) return 'header';
    if (lowerContent.includes('shall') || lowerContent.includes('must') || lowerContent.includes('required')) return 'requirement';
    if (lowerContent.includes('example') || lowerContent.includes('e.g.') || lowerContent.includes('for instance')) return 'example';
    if (lowerContent.includes('implement') || lowerContent.includes('procedure') || lowerContent.includes('step')) return 'implementation';
    
    return 'guidance';
  }

  private static extractSectionTitle(content: string): string | undefined {
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim();
    
    if (firstLine && firstLine.length < 100 && (
      firstLine.endsWith(':') || 
      /^#+\s/.test(firstLine) ||
      /^\d+\./.test(firstLine)
    )) {
      return firstLine.replace(/^#+\s|^\d+\.\s*|:$/g, '').trim();
    }
    
    return undefined;
  }

  private static calculateSectionRelevance(
    content: string,
    config: Partial<EnhancedExtractionConfig>
  ): number {
    const lowerContent = content.toLowerCase();
    let score = 0.3; // Base score

    // Compliance keywords
    const complianceKeywords = [
      'compliance', 'security', 'risk', 'audit', 'governance', 'policy',
      'control', 'framework', 'implementation', 'requirement', 'standard'
    ];

    complianceKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) score += 0.1;
    });

    // Framework references
    const frameworks = config.complianceFrameworks || ['iso', 'nist', 'gdpr', 'nis2'];
    frameworks.forEach(framework => {
      if (lowerContent.includes(framework.toLowerCase())) score += 0.15;
    });

    // Category relevance
    const categories = config.targetCategories || [];
    categories.forEach(category => {
      if (lowerContent.includes(category.toLowerCase())) score += 0.1;
    });

    return Math.min(1.0, score);
  }

  private static extractComplianceCategories(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const categories: string[] = [];

    const categoryKeywords = {
      'access_control': ['access', 'authentication', 'authorization', 'identity'],
      'asset_management': ['asset', 'inventory', 'classification', 'handling'],
      'cryptography': ['encryption', 'cryptography', 'key management', 'certificate'],
      'physical_security': ['physical', 'facility', 'environmental', 'premises'],
      'incident_management': ['incident', 'response', 'recovery', 'breach'],
      'risk_management': ['risk', 'assessment', 'analysis', 'vulnerability'],
      'compliance': ['compliance', 'audit', 'regulatory', 'legal']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories;
  }

  private static extractFrameworkReferences(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const frameworks: string[] = [];

    const frameworkPatterns = {
      'ISO 27001': ['iso 27001', 'iso27001', 'isms'],
      'ISO 27002': ['iso 27002', 'iso27002'],
      'NIST': ['nist', 'cybersecurity framework'],
      'GDPR': ['gdpr', 'general data protection'],
      'NIS2': ['nis2', 'nis 2', 'network information security'],
      'CIS Controls': ['cis controls', 'center for internet security'],
      'SOC 2': ['soc 2', 'soc2', 'service organization control']
    };

    for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
      if (patterns.some(pattern => lowerContent.includes(pattern))) {
        frameworks.push(framework);
      }
    }

    return frameworks;
  }

  private static generateSemanticTags(content: string, semanticAnalysis: any): string[] {
    const tags: Set<string> = new Set();

    // From semantic analysis
    if (semanticAnalysis?.mainTopics) {
      semanticAnalysis.mainTopics.forEach((topic: string) => tags.add(topic));
    }

    // Extract from content
    const lowerContent = content.toLowerCase();
    const semanticKeywords = [
      'implementation', 'monitoring', 'documentation', 'training',
      'assessment', 'evaluation', 'management', 'control', 'procedure'
    ];

    semanticKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) tags.add(keyword);
    });

    return Array.from(tags).slice(0, 8);
  }

  private static calculateQualityScore(sections: ContentSection[], metadata: ContentMetadata): number {
    if (sections.length === 0) return 0;

    let totalScore = 0;
    let factors = 0;

    // Section quality
    const avgSectionRelevance = sections.reduce((sum, s) => sum + s.relevanceScore, 0) / sections.length;
    totalScore += avgSectionRelevance * 0.4;
    factors += 0.4;

    // Content diversity
    const sectionTypes = new Set(sections.map(s => s.sectionType));
    totalScore += (sectionTypes.size / 5) * 0.2;
    factors += 0.2;

    // Framework coverage
    const frameworkCount = metadata.frameworkReferences.length;
    totalScore += Math.min(frameworkCount / 3, 1) * 0.2;
    factors += 0.2;

    // Authority score
    totalScore += metadata.credibilityScore * 0.2;
    factors += 0.2;

    return factors > 0 ? totalScore / factors : 0;
  }

  private static calculateRelevanceScore(sections: ContentSection[], config: Partial<EnhancedExtractionConfig>): number {
    if (sections.length === 0) return 0;

    const avgRelevance = sections.reduce((sum, s) => sum + s.relevanceScore, 0) / sections.length;
    return avgRelevance;
  }

  private static isComplianceRelevant(content: string): boolean {
    const lowerContent = content.toLowerCase();
    const requiredKeywords = ['compliance', 'security', 'risk', 'audit', 'governance', 'control'];
    
    return requiredKeywords.some(keyword => lowerContent.includes(keyword)) &&
           content.length > 100 &&
           content.split(/\s+/).length > 20;
  }

  private static determineDocumentType(sections: ContentSection[], url: string): 'guidance' | 'standard' | 'regulation' | 'bestpractice' | 'implementation' {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('standard') || lowerUrl.includes('iso')) return 'standard';
    if (lowerUrl.includes('regulation') || lowerUrl.includes('directive')) return 'regulation';
    if (lowerUrl.includes('best') || lowerUrl.includes('practice')) return 'bestpractice';
    if (lowerUrl.includes('implement') || lowerUrl.includes('guide')) return 'implementation';
    
    return 'guidance';
  }

  private static generateAuthorityIndicators(domain: string, url: string, sections: ContentSection[]): string[] {
    const indicators: string[] = [];
    
    // Domain-based indicators
    if (domain.includes('.gov') || domain.includes('.org')) indicators.push('government/organization');
    if (domain.includes('iso.org')) indicators.push('international standard');
    if (domain.includes('nist.gov')) indicators.push('nist official');
    
    // Content-based indicators
    const hasReferences = sections.some(s => s.content.toLowerCase().includes('reference'));
    if (hasReferences) indicators.push('peer-reviewed');
    
    const hasFrameworks = sections.some(s => s.frameworks.length > 0);
    if (hasFrameworks) indicators.push('framework-aligned');
    
    return indicators;
  }

  private static calculateCredibilityScore(domain: string, indicators: string[], sections: ContentSection[]): number {
    let score = 0.5; // Base score
    
    // Domain authority
    if (domain.includes('.gov')) score += 0.3;
    else if (domain.includes('.org')) score += 0.2;
    else if (domain.includes('.edu')) score += 0.2;
    
    // Authority indicators
    score += Math.min(indicators.length * 0.1, 0.3);
    
    // Content quality
    const avgRelevance = sections.length > 0 
      ? sections.reduce((sum, s) => sum + s.relevanceScore, 0) / sections.length 
      : 0;
    score += avgRelevance * 0.2;
    
    return Math.min(1.0, score);
  }

  private static calculateFreshnessScore(html: string, url: string): number {
    // Simple freshness calculation - could be enhanced with actual date extraction
    return 0.8; // Default to reasonably fresh
  }

  /**
   * Fallback extraction for when AI enhancement fails
   */
  private static async fallbackExtraction(
    html: string,
    url: string,
    config: Partial<EnhancedExtractionConfig>
  ): Promise<ExtractedContent> {
    console.log('[EnhancedExtraction] Using fallback extraction');
    
    const basicContent = await this.performBasicExtraction(html, url, config);
    const sections = await this.extractStructuredSections(basicContent, null, config);
    const metadata = await this.generateContentMetadata(html, url, sections);
    
    return {
      mainContent: basicContent,
      structuredSections: sections,
      metadata,
      qualityScore: 0.6,
      relevanceScore: 0.6,
      extractionMethod: 'rule-based'
    };
  }
}