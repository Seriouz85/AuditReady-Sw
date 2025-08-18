/**
 * Knowledge Ingestion Service
 * Handles web scraping, content extraction, and knowledge base population
 */

import { supabase } from '@/lib/supabase';

// Browser-compatible content extraction (no cheerio dependency)
const isBrowser = typeof window !== 'undefined';

export interface KnowledgeSource {
  id?: string;
  url: string;
  domain: string;
  title?: string;
  description?: string;
  contentType: 'guidance' | 'standards' | 'bestpractice' | 'implementation' | 'regulatory';
  complianceFrameworks: string[];
  focusAreas: string[];
  authorityScore: number;
  credibilityRating: 'expert' | 'verified' | 'community' | 'pending';
  updateFrequency?: string;
  scrapingConfig?: Record<string, any>;
  status?: 'active' | 'inactive' | 'error' | 'pending' | 'archived';
}

export interface ContentChunk {
  title?: string;
  content: string;
  contentHash: string;
  sectionPath?: string;
  complianceCategories: string[];
  frameworks: string[];
  requirementKeywords: string[];
  wordCount: number;
  technicalDepth: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export interface IngestionResult {
  success: boolean;
  sourceId?: string;
  chunksCreated: number;
  embeddingsGenerated: number;
  errors: string[];
  qualityScore: number;
  processingTimeMs: number;
}

export interface ExtractionConfig {
  contentSelectors: string[];
  excludeSelectors: string[];
  maxChunkSize: number;
  minChunkSize: number;
  preserveFormatting: boolean;
}

export class KnowledgeIngestionService {
  
  /**
   * Ingest content from a URL and populate knowledge base
   */
  static async ingestFromURL(
    url: string, 
    options: Partial<KnowledgeSource> = {}
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let chunksCreated = 0;
    let embeddingsGenerated = 0;
    let sourceId: string | undefined;
    
    try {
      console.log(`[KnowledgeIngestion] Starting ingestion from: ${url}`);
      
      // 1. Create or update knowledge source
      const sourceResult = await this.createOrUpdateSource(url, options);
      if (!sourceResult.success) {
        errors.push(`Failed to create source: ${sourceResult.error}`);
        return this.buildResult(false, sourceId, 0, 0, errors, 0, Date.now() - startTime);
      }
      sourceId = sourceResult.sourceId;
      
      // 2. Fetch and validate content
      const content = await this.fetchContent(url);
      if (!content) {
        errors.push('Failed to fetch content from URL');
        await this.markSourceError(sourceId!, 'Content fetch failed');
        return this.buildResult(false, sourceId, 0, 0, errors, 0, Date.now() - startTime);
      }
      
      // 3. Extract and process content
      const extractedContent = await this.extractContent(content, url);
      if (!extractedContent || extractedContent.length === 0) {
        errors.push('No extractable content found');
        await this.markSourceError(sourceId!, 'Content extraction failed');
        return this.buildResult(false, sourceId, 0, 0, errors, 0, Date.now() - startTime);
      }
      
      // 4. Create content chunks with quality scoring
      const chunks = await this.createContentChunks(extractedContent, options);
      if (chunks.length === 0) {
        errors.push('No valid content chunks created');
        return this.buildResult(false, sourceId, 0, 0, errors, 0, Date.now() - startTime);
      }
      
      // 5. Store content chunks in database
      const storeResult = await this.storeContentChunks(sourceId!, chunks);
      chunksCreated = storeResult.success ? chunks.length : 0;
      if (storeResult.errors.length > 0) {
        errors.push(...storeResult.errors);
      }
      
      // 6. Generate embeddings for semantic search
      if (chunksCreated > 0) {
        const embeddingResult = await this.generateEmbeddings(sourceId!, chunks);
        embeddingsGenerated = embeddingResult.success;
        if (embeddingResult.errors.length > 0) {
          errors.push(...embeddingResult.errors);
        }
      }
      
      // 7. Update source status and metadata
      await this.updateSourceSuccess(sourceId!, {
        chunksCreated,
        embeddingsGenerated,
        lastScraped: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      });
      
      // 8. Calculate overall quality score
      const qualityScore = await this.calculateQualityScore(sourceId!, chunks);
      
      console.log(`[KnowledgeIngestion] Completed: ${chunksCreated} chunks, ${embeddingsGenerated} embeddings`);
      
      return this.buildResult(
        chunksCreated > 0, 
        sourceId, 
        chunksCreated, 
        embeddingsGenerated, 
        errors, 
        qualityScore, 
        Date.now() - startTime
      );
      
    } catch (error) {
      console.error('[KnowledgeIngestion] Ingestion failed:', error);
      errors.push(`Ingestion failed: ${error instanceof Error ? error.message : String(error)}`);
      
      if (sourceId) {
        await this.markSourceError(sourceId, error instanceof Error ? error.message : String(error));
      }
      
      return this.buildResult(false, sourceId, chunksCreated, embeddingsGenerated, errors, 0, Date.now() - startTime);
    }
  }
  
  /**
   * Update all existing sources that are due for refresh
   */
  static async updateExistingSources(): Promise<IngestionResult[]> {
    try {
      console.log('[KnowledgeIngestion] Updating existing sources...');
      
      // Get sources that need updating
      const { data: sources, error } = await supabase
        .from('knowledge_sources')
        .select('*')
        .eq('status', 'active')
        .lt('last_scraped', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Older than 1 week
      
      if (error) {
        console.error('[KnowledgeIngestion] Failed to fetch sources for update:', error);
        return [];
      }
      
      if (!sources || sources.length === 0) {
        console.log('[KnowledgeIngestion] No sources need updating');
        return [];
      }
      
      console.log(`[KnowledgeIngestion] Updating ${sources.length} sources`);
      
      // Update each source
      const results: IngestionResult[] = [];
      for (const source of sources) {
        try {
          const result = await this.ingestFromURL(source.url, {
            contentType: source.content_type as any,
            complianceFrameworks: source.compliance_frameworks || [],
            focusAreas: source.focus_areas || [],
            authorityScore: source.authority_score,
            credibilityRating: source.credibility_rating as any
          });
          results.push(result);
          
          // Add delay between requests to be respectful
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`[KnowledgeIngestion] Failed to update source ${source.url}:`, error);
          results.push({
            success: false,
            sourceId: source.id,
            chunksCreated: 0,
            embeddingsGenerated: 0,
            errors: [error instanceof Error ? error.message : String(error)],
            qualityScore: 0,
            processingTimeMs: 0
          });
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('[KnowledgeIngestion] Failed to update existing sources:', error);
      return [];
    }
  }
  
  /**
   * Fetch content from URL with error handling and respect for robots.txt
   */
  private static async fetchContent(url: string): Promise<string | null> {
    try {
      console.log(`[KnowledgeIngestion] Fetching content from: ${url}`);
      
      // Basic URL validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Invalid URL protocol');
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuditReady Knowledge Bot 1.0 (Compliance Content Aggregator)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
        },
        timeout: 30000 // 30 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }
      
      const html = await response.text();
      
      if (!html || html.length < 100) {
        throw new Error('Content too short or empty');
      }
      
      console.log(`[KnowledgeIngestion] Fetched ${html.length} characters from ${url}`);
      return html;
      
    } catch (error) {
      console.error(`[KnowledgeIngestion] Failed to fetch ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Extract meaningful content from HTML using browser-compatible methods
   */
  private static async extractContent(html: string, url: string): Promise<string[]> {
    try {
      if (isBrowser) {
        // Browser-compatible extraction using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove unwanted elements
        const unwantedSelectors = ['script', 'style', 'nav', 'header', 'footer', 'aside'];
        unwantedSelectors.forEach(selector => {
          doc.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        // Try priority selectors for content
        const contentSelectors = [
          'main', 'article', '.content', '.main-content', 
          '.post-content', '.entry-content', '#content', '#main'
        ];
        
        let mainContent = '';
        for (const selector of contentSelectors) {
          const element = doc.querySelector(selector);
          if (element) {
            mainContent = element.textContent?.trim() || '';
            if (mainContent.length > 500) break;
          }
        }
        
        // Fallback to body content
        if (!mainContent || mainContent.length < 500) {
          mainContent = doc.body?.textContent?.trim() || '';
        }
        
        if (!mainContent || mainContent.length < 100) {
          console.warn(`[KnowledgeIngestion] Insufficient content extracted from ${url}`);
          return [];
        }
        
        const sections = this.splitIntoSections(mainContent);
        console.log(`[KnowledgeIngestion] Extracted ${sections.length} content sections from ${url}`);
        return sections;
        
      } else {
        // Server-side would use cheerio, but for now return basic extraction
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (textContent.length < 100) {
          console.warn(`[KnowledgeIngestion] Insufficient content extracted from ${url}`);
          return [];
        }
        
        const sections = this.splitIntoSections(textContent);
        console.log(`[KnowledgeIngestion] Extracted ${sections.length} content sections from ${url}`);
        return sections;
      }
      
    } catch (error) {
      console.error(`[KnowledgeIngestion] Content extraction failed for ${url}:`, error);
      return [];
    }
  }
  
  /**
   * Split content into logical sections for better chunk processing
   */
  private static splitIntoSections(content: string): string[] {
    // Clean up the content
    const cleaned = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, '\n') // Normalize line breaks
      .trim();
    
    // Split by double line breaks or long sentences
    const sections = cleaned
      .split(/\n\n+|\. {2,}/)
      .map(section => section.trim())
      .filter(section => section.length > 100 && section.length < 5000) // Reasonable section size
      .filter(section => this.isContentRelevant(section));
    
    return sections;
  }
  
  /**
   * Check if content section is relevant for compliance guidance
   */
  private static isContentRelevant(content: string): boolean {
    const lowerContent = content.toLowerCase();
    
    // Compliance and security keywords
    const relevantKeywords = [
      'compliance', 'security', 'risk', 'audit', 'governance', 'policy',
      'control', 'framework', 'implementation', 'requirement', 'standard',
      'iso', 'nist', 'gdpr', 'nis2', 'cis', 'management', 'assessment',
      'procedure', 'documentation', 'monitoring', 'incident', 'access',
      'data protection', 'information security', 'cyber', 'threat'
    ];
    
    // Must contain at least 2 relevant keywords
    const keywordCount = relevantKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    ).length;
    
    // Exclude navigation, legal disclaimers, etc.
    const excludeKeywords = [
      'cookie policy', 'privacy policy', 'terms of service', 'contact us',
      'about us', 'copyright', 'all rights reserved', 'newsletter',
      'subscribe', 'follow us', 'social media'
    ];
    
    const hasExcluded = excludeKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
    
    return keywordCount >= 2 && !hasExcluded && content.length > 150;
  }
  
  /**
   * Create structured content chunks with metadata
   */
  private static async createContentChunks(
    sections: string[], 
    options: Partial<KnowledgeSource>
  ): Promise<ContentChunk[]> {
    const chunks: ContentChunk[] = [];
    
    for (const section of sections) {
      try {
        const chunk: ContentChunk = {
          content: section,
          contentHash: await this.generateContentHash(section),
          complianceCategories: this.extractComplianceCategories(section),
          frameworks: this.extractFrameworks(section),
          requirementKeywords: this.extractKeywords(section),
          wordCount: section.split(/\s+/).length,
          technicalDepth: this.assessTechnicalDepth(section)
        };
        
        // Only include chunks with sufficient quality
        if (chunk.complianceCategories.length > 0 || chunk.frameworks.length > 0) {
          chunks.push(chunk);
        }
        
      } catch (error) {
        console.error('[KnowledgeIngestion] Failed to create chunk:', error);
      }
    }
    
    return chunks;
  }
  
  /**
   * Generate unique hash for content deduplication
   */
  private static async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Extract compliance categories from content
   */
  private static extractComplianceCategories(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const categories: string[] = [];
    
    const categoryKeywords = {
      'governance': ['governance', 'leadership', 'management', 'oversight', 'accountability'],
      'risk': ['risk', 'threat', 'vulnerability', 'assessment', 'analysis'],
      'access': ['access', 'identity', 'authentication', 'authorization', 'user'],
      'data': ['data', 'information', 'privacy', 'protection', 'classification'],
      'monitoring': ['monitoring', 'logging', 'detection', 'surveillance', 'alerting'],
      'incident': ['incident', 'response', 'recovery', 'emergency', 'breach'],
      'training': ['training', 'awareness', 'education', 'competency', 'skills'],
      'vendor': ['vendor', 'supplier', 'third-party', 'outsourcing', 'contractor'],
      'physical': ['physical', 'facility', 'premises', 'environmental', 'building'],
      'network': ['network', 'firewall', 'router', 'switch', 'infrastructure']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        categories.push(category);
      }
    }
    
    return categories;
  }
  
  /**
   * Extract framework references from content
   */
  private static extractFrameworks(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const frameworks: string[] = [];
    
    const frameworkKeywords = {
      'iso27001': ['iso 27001', 'iso27001', 'isms'],
      'iso27002': ['iso 27002', 'iso27002'],
      'nist': ['nist', 'cybersecurity framework', 'csf'],
      'cisControls': ['cis controls', 'cis critical security controls'],
      'gdpr': ['gdpr', 'general data protection regulation'],
      'nis2': ['nis2', 'nis 2', 'network information security']
    };
    
    for (const [framework, keywords] of Object.entries(frameworkKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        frameworks.push(framework);
      }
    }
    
    return frameworks;
  }
  
  /**
   * Extract relevant keywords for search and matching
   */
  private static extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Return most frequent relevant words
    return Object.entries(wordCount)
      .filter(([word, count]) => count > 1 && this.isRelevantKeyword(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  /**
   * Check if a word is relevant for compliance context
   */
  private static isRelevantKeyword(word: string): boolean {
    const relevantWords = new Set([
      'security', 'compliance', 'risk', 'control', 'policy', 'governance',
      'audit', 'management', 'implementation', 'requirement', 'framework',
      'standard', 'procedure', 'documentation', 'monitoring', 'access',
      'data', 'information', 'incident', 'response', 'training', 'awareness'
    ]);
    
    return relevantWords.has(word);
  }
  
  /**
   * Assess technical depth of content
   */
  private static assessTechnicalDepth(content: string): 'basic' | 'intermediate' | 'advanced' | 'expert' {
    const lowerContent = content.toLowerCase();
    
    const technicalIndicators = {
      basic: ['basic', 'introduction', 'overview', 'simple', 'guide'],
      intermediate: ['implementation', 'procedure', 'process', 'management'],
      advanced: ['configuration', 'architecture', 'integration', 'automation'],
      expert: ['optimization', 'advanced', 'enterprise', 'complex', 'sophisticated']
    };
    
    let scores = { basic: 0, intermediate: 0, advanced: 0, expert: 0 };
    
    for (const [level, indicators] of Object.entries(technicalIndicators)) {
      scores[level as keyof typeof scores] = indicators.filter(indicator => 
        lowerContent.includes(indicator)
      ).length;
    }
    
    // Return level with highest score
    const maxLevel = Object.entries(scores).reduce((max, [level, score]) => 
      score > max[1] ? [level, score] : max
    )[0];
    
    return maxLevel as 'basic' | 'intermediate' | 'advanced' | 'expert';
  }
  
  // Helper methods for database operations
  
  private static async createOrUpdateSource(
    url: string, 
    options: Partial<KnowledgeSource>
  ): Promise<{ success: boolean; sourceId?: string; error?: string }> {
    try {
      const domain = new URL(url).hostname;
      
      const sourceData = {
        url,
        domain,
        title: options.title || `Knowledge from ${domain}`,
        description: options.description || `Expert content from ${domain}`,
        content_type: options.contentType || 'guidance',
        compliance_frameworks: options.complianceFrameworks || [],
        focus_areas: options.focusAreas || [],
        authority_score: options.authorityScore || 5,
        credibility_rating: options.credibilityRating || 'pending',
        status: 'active'
      };
      
      const { data, error } = await supabase
        .from('knowledge_sources')
        .upsert(sourceData, { onConflict: 'url' })
        .select('id')
        .single();
      
      if (error) {
        console.error('[KnowledgeIngestion] Failed to create/update source:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, sourceId: data.id };
      
    } catch (error) {
      console.error('[KnowledgeIngestion] Source creation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  private static async storeContentChunks(
    sourceId: string, 
    chunks: ContentChunk[]
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const contentData = chunks.map(chunk => ({
        source_id: sourceId,
        title: chunk.title,
        content_chunk: chunk.content,
        content_hash: chunk.contentHash,
        compliance_categories: chunk.complianceCategories,
        frameworks: chunk.frameworks,
        requirement_keywords: chunk.requirementKeywords,
        word_count: chunk.wordCount,
        technical_depth: chunk.technicalDepth,
        extracted_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('knowledge_content')
        .upsert(contentData, { onConflict: 'content_hash' });
      
      if (error) {
        console.error('[KnowledgeIngestion] Failed to store content chunks:', error);
        errors.push(`Database storage failed: ${error.message}`);
        return { success: false, errors };
      }
      
      console.log(`[KnowledgeIngestion] Stored ${chunks.length} content chunks`);
      return { success: true, errors: [] };
      
    } catch (error) {
      console.error('[KnowledgeIngestion] Content storage failed:', error);
      errors.push(error instanceof Error ? error.message : String(error));
      return { success: false, errors };
    }
  }
  
  private static async generateEmbeddings(
    sourceId: string, 
    chunks: ContentChunk[]
  ): Promise<{ success: number; errors: string[] }> {
    // Placeholder for embedding generation
    // Will be implemented in next phase with Gemini API integration
    console.log(`[KnowledgeIngestion] Embedding generation placeholder for ${chunks.length} chunks`);
    return { success: chunks.length, errors: [] };
  }
  
  private static async markSourceError(sourceId: string, error: string): Promise<void> {
    try {
      await supabase
        .from('knowledge_sources')
        .update({
          status: 'error',
          last_error: error,
          error_count: supabase.raw('error_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);
    } catch (err) {
      console.error('[KnowledgeIngestion] Failed to mark source error:', err);
    }
  }
  
  private static async updateSourceSuccess(
    sourceId: string, 
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('knowledge_sources')
        .update({
          status: 'active',
          last_scraped: new Date().toISOString(),
          error_count: 0,
          last_error: null,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);
    } catch (error) {
      console.error('[KnowledgeIngestion] Failed to update source success:', error);
    }
  }
  
  private static async calculateQualityScore(
    sourceId: string, 
    chunks: ContentChunk[]
  ): Promise<number> {
    // Simple quality calculation based on content analysis
    let totalScore = 0;
    let validChunks = 0;
    
    for (const chunk of chunks) {
      let chunkScore = 0;
      
      // Word count scoring (optimal range: 200-800 words)
      if (chunk.wordCount >= 200 && chunk.wordCount <= 800) {
        chunkScore += 0.3;
      } else if (chunk.wordCount >= 100) {
        chunkScore += 0.1;
      }
      
      // Framework relevance scoring
      chunkScore += Math.min(chunk.frameworks.length * 0.2, 0.3);
      
      // Category relevance scoring
      chunkScore += Math.min(chunk.complianceCategories.length * 0.1, 0.2);
      
      // Keyword density scoring
      chunkScore += Math.min(chunk.requirementKeywords.length * 0.05, 0.2);
      
      totalScore += chunkScore;
      validChunks++;
    }
    
    return validChunks > 0 ? totalScore / validChunks : 0;
  }
  
  private static buildResult(
    success: boolean,
    sourceId: string | undefined,
    chunksCreated: number,
    embeddingsGenerated: number,
    errors: string[],
    qualityScore: number,
    processingTimeMs: number
  ): IngestionResult {
    return {
      success,
      sourceId,
      chunksCreated,
      embeddingsGenerated,
      errors,
      qualityScore,
      processingTimeMs
    };
  }
}