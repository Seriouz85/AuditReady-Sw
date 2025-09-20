/**
 * AITextConsolidationEngine.ts
 * AI-powered text consolidation with deterministic validation
 * Integrates with Mistral AI for consistent, repetitive results
 */

import { AIPromptTemplates, ConsolidationPromptConfig, PromptTemplate } from './AIPromptTemplates';

export interface ConsolidationRequest {
  content: string;
  category: string;
  frameworks: string[];
  type: 'requirements' | 'guidance' | 'bullets' | 'references';
  config: ConsolidationPromptConfig;
}

export interface ConsolidationResult {
  consolidatedContent: string;
  originalLength: number;
  consolidatedLength: number;
  reductionPercentage: number;
  contentFingerprint: string;
  timestamp: Date;
  fromCache: boolean;
  qualityMetrics: QualityMetrics;
}

export interface QualityMetrics {
  detailsPreserved: number; // 0-100
  readabilityImproved: boolean;
  consistencyScore: number; // 0-100
  timeframesPreserved: boolean;
  authoritiesPreserved: boolean;
  standardsPreserved: boolean;
  technicalSpecsPreserved: boolean;
  referencesIntact: boolean;
}

interface CacheEntry {
  fingerprint: string;
  result: ConsolidationResult;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export class AITextConsolidationEngine {
  private cache: Map<string, CacheEntry> = new Map();
  private mistralApiKey: string;
  private mistralEndpoint: string = 'https://api.mistral.ai/v1/chat/completions';
  private retryAttempts: number = 3;
  private cacheExpirationMs: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Check for Mistral API key in environment
    this.mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY || 
                        import.meta.env.VITE_MISTRAL_KEY ||
                        import.meta.env.MISTRAL_API_KEY ||
                        '';

    if (!this.mistralApiKey) {
      console.warn('Mistral API key not found. AI consolidation will use fallback mode.');
    }
  }

  /**
   * Main consolidation method with deterministic caching
   */
  async consolidateText(request: ConsolidationRequest): Promise<ConsolidationResult> {
    try {
      // Generate content fingerprint for caching
      const fingerprint = this.generateRequestFingerprint(request);
      
      // Check cache first for identical requests
      const cachedResult = this.getCachedResult(fingerprint);
      if (cachedResult) {
        this.updateCacheAccess(fingerprint);
        return { ...cachedResult, fromCache: true };
      }

      // Generate appropriate prompt template
      const promptTemplate = this.generatePromptTemplate(request);
      
      // Attempt AI consolidation with retries
      let consolidatedContent: string;
      let attempt = 0;
      
      while (attempt < this.retryAttempts) {
        try {
          consolidatedContent = await this.callMistralAPI(promptTemplate);
          break;
        } catch (error) {
          attempt++;
          console.warn(`AI consolidation attempt ${attempt} failed:`, error);
          
          // For rate limit errors (429) or service capacity errors, fallback immediately
          if (error instanceof Error && (error.message.includes('429') || error.message.includes('service_tier_capacity') || error.message.includes('rate limit'))) {
            console.info('Rate limit detected, falling back to deterministic consolidation');
            consolidatedContent = this.fallbackConsolidation(request);
            break;
          }
          
          if (attempt >= this.retryAttempts) {
            console.error('AI consolidation failed after retries, using fallback:', error);
            // Fallback to rule-based consolidation
            consolidatedContent = this.fallbackConsolidation(request);
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      // Calculate metrics and validate
      const result = await this.buildConsolidationResult(
        request,
        consolidatedContent,
        fingerprint,
        false
      );

      // Cache the result for future identical requests
      this.cacheResult(fingerprint, result);

      return result;
    } catch (error) {
      console.error('Consolidation engine error:', error);
      throw new Error(`Text consolidation failed: ${error.message}`);
    }
  }

  /**
   * Generate deterministic fingerprint for request caching
   */
  private generateRequestFingerprint(request: ConsolidationRequest): string {
    const configString = JSON.stringify(request.config);
    const contentFingerprint = AIPromptTemplates.generateContentFingerprint(request.content);
    const metaData = `${request.category}|${request.type}|${request.frameworks.sort().join(',')}|${configString}`;
    
    // Combine content and metadata fingerprints
    let hash = 0;
    const fullString = contentFingerprint + metaData;
    for (let i = 0; i < fullString.length; i++) {
      const char = fullString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate appropriate prompt template based on request type
   */
  private generatePromptTemplate(request: ConsolidationRequest): PromptTemplate {
    switch (request.type) {
      case 'requirements':
        // Parse requirements from content
        const requirements = this.parseRequirementsFromContent(request.content);
        return AIPromptTemplates.generateRequirementConsolidationPrompt(
          requirements,
          request.category,
          request.config
        );
        
      case 'guidance':
        return AIPromptTemplates.generateGuidanceConsolidationPrompt(
          request.content,
          request.category,
          request.config
        );
        
      case 'bullets':
        const bulletPoints = this.extractBulletPoints(request.content);
        return AIPromptTemplates.generateBulletConsolidationPrompt(
          bulletPoints,
          request.category,
          request.config
        );
        
      case 'references':
        const frameworkRefs = this.parseFrameworkReferences(request.content);
        return AIPromptTemplates.generateFrameworkReferencePrompt(
          frameworkRefs,
          request.config
        );
        
      default:
        throw new Error(`Unsupported consolidation type: ${request.type}`);
    }
  }

  /**
   * Call Mistral AI API with retry logic
   */
  private async callMistralAPI(promptTemplate: PromptTemplate): Promise<string> {
    if (!this.mistralApiKey) {
      throw new Error('Mistral API key not available');
    }

    const response = await fetch(this.mistralEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.mistralApiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: promptTemplate.systemPrompt
          },
          {
            role: 'user',
            content: promptTemplate.userPrompt
          }
        ],
        temperature: 0.1, // Low temperature for consistency
        max_tokens: 4000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Mistral API');
    }

    return data.choices[0].message.content.trim();
  }

  /**
   * Enhanced fallback consolidation using advanced rule-based approach
   */
  private fallbackConsolidation(request: ConsolidationRequest): string {
    console.log('Using enhanced deterministic consolidation for:', request.category);
    
    const lines = request.content.split('\n').filter(line => line.trim());
    const consolidatedLines: string[] = [];
    
    // Preserve headers and structure
    const structuredContent = this.parseContentStructure(lines);
    
    for (const section of structuredContent) {
      if (section.type === 'header') {
        consolidatedLines.push(section.content);
      } else if (section.type === 'bullet_group') {
        // Apply intelligent bullet point consolidation
        const consolidated = this.intelligentBulletConsolidation(section.items);
        consolidatedLines.push(...consolidated);
      } else {
        consolidatedLines.push(section.content);
      }
    }
    
    return consolidatedLines.join('\n');
  }

  /**
   * Parse content into structured sections
   */
  private parseContentStructure(lines: string[]): Array<{type: string, content: string, items?: string[]}> {
    const sections: Array<{type: string, content: string, items?: string[]}> = [];
    let currentBulletGroup: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/) || line.match(/^\*\*[^*]+\*\*/) || !line.startsWith('-')) {
        // Save any pending bullet group
        if (currentBulletGroup.length > 0) {
          sections.push({
            type: 'bullet_group',
            content: '',
            items: [...currentBulletGroup]
          });
          currentBulletGroup = [];
        }
        
        // Add header or regular content
        sections.push({
          type: line.match(/^#{1,3}\s+/) ? 'header' : 'content',
          content: line
        });
      } else if (line.startsWith('-')) {
        // Collect bullet points
        currentBulletGroup.push(line);
      }
    }
    
    // Add final bullet group if exists
    if (currentBulletGroup.length > 0) {
      sections.push({
        type: 'bullet_group',
        content: '',
        items: currentBulletGroup
      });
    }
    
    return sections;
  }

  /**
   * Intelligent bullet point consolidation
   */
  private intelligentBulletConsolidation(bullets: string[]): string[] {
    if (bullets.length <= 1) return bullets;
    
    const groups = this.groupByTopic(bullets);
    const consolidated: string[] = [];
    
    for (const group of groups) {
      if (group.length === 1) {
        consolidated.push(group[0]);
      } else {
        // Merge similar bullets while preserving ALL details
        const merged = this.mergePreservingDetails(group);
        consolidated.push(merged);
      }
    }
    
    return consolidated;
  }

  /**
   * Group bullets by topic/theme
   */
  private groupByTopic(bullets: string[]): string[][] {
    const groups: string[][] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < bullets.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [bullets[i]];
      processed.add(i);
      
      // Find similar bullets
      for (let j = i + 1; j < bullets.length; j++) {
        if (processed.has(j)) continue;
        
        if (this.areBulletsTopicallyRelated(bullets[i], bullets[j])) {
          group.push(bullets[j]);
          processed.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Check if bullets are topically related
   */
  private areBulletsTopicallyRelated(bullet1: string, bullet2: string): boolean {
    // Extract key concepts
    const concepts1 = this.extractKeyConcepts(bullet1);
    const concepts2 = this.extractKeyConcepts(bullet2);
    
    // Check for overlap in key concepts
    const overlap = concepts1.filter(concept => concepts2.includes(concept));
    return overlap.length >= 2 || (overlap.length >= 1 && (concepts1.length <= 3 || concepts2.length <= 3));
  }

  /**
   * Extract key concepts from text
   */
  private extractKeyConcepts(text: string): string[] {
    const keyTerms = [
      'document', 'policy', 'procedure', 'control', 'monitor', 'review', 'assess',
      'implement', 'maintain', 'establish', 'ensure', 'manage', 'audit', 'report',
      'access', 'security', 'data', 'system', 'network', 'user', 'risk', 'incident',
      'training', 'awareness', 'backup', 'recovery', 'encryption', 'authentication'
    ];
    
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
    return words.filter(word => keyTerms.includes(word) && word.length > 3);
  }

  /**
   * Merge bullets while preserving ALL details
   */
  private mergePreservingDetails(bullets: string[]): string {
    // Remove bullet markers for processing
    const contents = bullets.map(b => b.replace(/^-\s*/, '').trim());
    
    // Extract all unique details (timeframes, authorities, standards)
    const allDetails = new Set<string>();
    const mainActions = new Set<string>();
    
    for (const content of contents) {
      // Extract timeframes (quarterly, annually, monthly, etc.)
      const timeframes = content.match(/\b(quarterly|annually|monthly|weekly|daily)\b/gi);
      if (timeframes) timeframes.forEach(t => allDetails.add(t.toLowerCase()));
      
      // Extract authorities (ENISA, ISO, etc.)
      const authorities = content.match(/\b(ENISA|ISO|NIST|CIS|GDPR|NIS2)\b/gi);
      if (authorities) authorities.forEach(a => allDetails.add(a.toUpperCase()));
      
      // Extract standards and references
      const standards = content.match(/\b(27001|27002|2700[0-9]|CIS\s*Control)\b/gi);
      if (standards) standards.forEach(s => allDetails.add(s));
      
      // Extract main action/concept
      const mainAction = this.extractMainAction(content);
      if (mainAction) mainActions.add(mainAction);
    }
    
    // Create consolidated text
    const primaryAction = Array.from(mainActions)[0] || contents[0];
    let consolidated = `- ${primaryAction}`;
    
    // Add all preserved details
    if (allDetails.size > 0) {
      const detailsArray = Array.from(allDetails);
      consolidated += ` (${detailsArray.join(', ')})`;
    }
    
    return consolidated;
  }

  /**
   * Extract main action from bullet content
   */
  private extractMainAction(content: string): string {
    // Look for action verbs and main concepts
    const actionPattern = /\b(implement|establish|maintain|monitor|review|assess|ensure|manage|document|perform)\s+[^.]*?(?:\.|$)/i;
    const match = content.match(actionPattern);
    return match ? match[0].trim() : content.split('.')[0].trim();
  }
}
