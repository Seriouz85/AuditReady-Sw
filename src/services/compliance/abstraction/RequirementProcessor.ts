/**
 * RequirementProcessor.ts
 * Framework-agnostic requirement parsing and metadata extraction
 * Handles text preprocessing, normalization, and keyword identification
 */

import { 
  ProcessedRequirement, 
  RequirementMetadata, 
  ComplianceEntity, 
  RequirementStructure,
  AnalysisConfig
} from './types';
import { SemanticAnalyzer } from './SemanticAnalyzer';
import { TextProcessor } from './TextProcessor';

export interface RawRequirement {
  id: string;
  framework: string;
  code: string;
  title: string;
  description: string;
  category?: string;
  domain?: string;
}

export interface ProcessingOptions {
  enable_vectorization: boolean;
  extract_keywords: boolean;
  analyze_structure: boolean;
  calculate_readability: boolean;
  generate_hash: boolean;
}

export class RequirementProcessor {
  private semanticAnalyzer: SemanticAnalyzer;
  private textProcessor: TextProcessor;
  private config: AnalysisConfig;
  private processingCache: Map<string, ProcessedRequirement>;

  constructor(semanticAnalyzer: SemanticAnalyzer, config: AnalysisConfig) {
    this.semanticAnalyzer = semanticAnalyzer;
    this.textProcessor = new TextProcessor();
    this.config = config;
    this.processingCache = new Map();
  }

  /**
   * Process a raw requirement into structured format
   */
  async processRequirement(
    raw: RawRequirement, 
    options: ProcessingOptions = this.getDefaultOptions()
  ): Promise<ProcessedRequirement> {
    try {
      // Check cache
      const cacheKey = this.generateProcessingCacheKey(raw, options);
      if (this.processingCache.has(cacheKey)) {
        return this.processingCache.get(cacheKey)!;
      }

      // Normalize text
      const normalizedText = this.textProcessor.normalizeText(raw.description);

      // Extract entities
      const entities = this.semanticAnalyzer.extractComplianceEntities(raw.description);

      // Analyze structure
      const structure = options.analyze_structure 
        ? this.semanticAnalyzer.analyzeRequirementStructure(raw.description)
        : this.createEmptyStructure();

      // Extract metadata
      const metadata = this.extractMetadata(raw, normalizedText, options);

      // Generate vector representation
      const vector = options.enable_vectorization 
        ? this.textProcessor.generateVector(normalizedText, entities.map(e => e.text))
        : [];

      // Extract keywords
      const keywords = options.extract_keywords 
        ? this.textProcessor.extractKeywords(normalizedText)
        : [];

      // Generate hash
      const hash = options.generate_hash 
        ? this.textProcessor.generateContentHash(raw.description)
        : '';

      const processed: ProcessedRequirement = {
        id: raw.id,
        framework: raw.framework,
        original_text: raw.description,
        normalized_text: normalizedText,
        entities: entities,
        structure: structure,
        metadata: metadata,
        vector: vector,
        keywords: keywords,
        hash: hash
      };

      // Cache result
      this.processingCache.set(cacheKey, processed);

      return processed;
    } catch (error) {
      throw new Error(`Requirement processing failed for ${raw.id}: ${error.message}`);
    }
  }

  /**
   * Batch process multiple requirements
   */
  async batchProcessRequirements(
    requirements: RawRequirement[],
    options: ProcessingOptions = this.getDefaultOptions()
  ): Promise<ProcessedRequirement[]> {
    const batchSize = this.config.performance_limits.max_requirements_per_batch;
    const results: ProcessedRequirement[] = [];

    for (let i = 0; i < requirements.length; i += batchSize) {
      const batch = requirements.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => this.processRequirement(req, options))
      );
      results.push(...batchResults);
    }

    return results;
  }


  /**
   * Extract comprehensive metadata from requirement
   */
  private extractMetadata(
    raw: RawRequirement, 
    normalizedText: string,
    options: ProcessingOptions
  ): RequirementMetadata {
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
    const technicalTerms = this.textProcessor.extractTechnicalTerms(normalizedText);
    
    return {
      category: raw.category || this.textProcessor.inferCategory(normalizedText, technicalTerms),
      domain: raw.domain || this.textProcessor.inferDomain(normalizedText, technicalTerms),
      criticality: this.assessCriticality(normalizedText),
      complexity: this.textProcessor.calculateComplexity(normalizedText, technicalTerms),
      word_count: words.length,
      readability_score: options.calculate_readability 
        ? this.textProcessor.calculateReadabilityScore(normalizedText)
        : 0,
      technical_terms: technicalTerms,
      extracted_at: new Date()
    };
  }


  /**
   * Assess requirement criticality based on linguistic cues
   */
  private assessCriticality(text: string): RequirementMetadata['criticality'] {
    const criticalIndicators = [
      'shall', 'must', 'required', 'mandatory', 'critical', 'essential',
      'imperative', 'obligatory', 'compulsory', 'vital', 'crucial'
    ];

    const highIndicators = [
      'should', 'important', 'significant', 'necessary', 'recommended',
      'advised', 'suggested', 'encouraged', 'expected'
    ];

    const mediumIndicators = [
      'may', 'could', 'might', 'optional', 'desirable', 'preferred',
      'beneficial', 'helpful', 'useful', 'consider'
    ];

    const criticalCount = criticalIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;

    const highCount = highIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;

    const mediumCount = mediumIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;

    if (criticalCount > 0 || text.includes('compliance') && text.includes('mandatory')) {
      return 'CRITICAL';
    } else if (highCount > 0 || text.includes('security') && text.includes('protect')) {
      return 'HIGH';
    } else if (mediumCount > 0) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private createEmptyStructure(): RequirementStructure {
    return {
      main_clause: '',
      sub_clauses: [],
      conditions: [],
      exceptions: [],
      references: [],
      action_verbs: [],
      domain_context: ''
    };
  }

  private getDefaultOptions(): ProcessingOptions {
    return {
      enable_vectorization: true,
      extract_keywords: true,
      analyze_structure: true,
      calculate_readability: true,
      generate_hash: true
    };
  }

  private generateProcessingCacheKey(raw: RawRequirement, options: ProcessingOptions): string {
    const optionsStr = JSON.stringify(options);
    return `proc_${raw.id}_${raw.framework}_${this.textProcessor.generateContentHash(optionsStr)}`;
  }

  /**
   * Clear processing cache
   */
  clearCache(): void {
    this.processingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.processingCache.size,
      hitRate: 0 // Would need to track hits/misses for actual hit rate
    };
  }
}