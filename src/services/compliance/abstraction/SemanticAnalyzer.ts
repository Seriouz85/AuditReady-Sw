/**
 * SemanticAnalyzer.ts
 * Core semantic analysis engine for compliance requirements
 * Implements NLP processing, TF-IDF similarity, and entity extraction
 */

import { 
  SemanticAnalysisResult, 
  ProcessedRequirement, 
  ComplianceEntity, 
  RequirementStructure,
  AnalysisConfig,
  CacheEntry,
  PerformanceMetrics,
  SemanticAnalyzerOptions
} from './types';

export class SemanticAnalyzer {
  private config: AnalysisConfig;
  private cache: Map<string, CacheEntry<any>>;
  private metrics: PerformanceMetrics;
  private enableCaching: boolean;
  private performanceMonitoring: boolean;

  // Domain-specific term weights for TF-IDF
  private readonly DOMAIN_WEIGHTS = {
    SECURITY: ['security', 'protect', 'secure', 'encryption', 'authentication'],
    GOVERNANCE: ['governance', 'policy', 'oversight', 'management', 'control'],
    RISK: ['risk', 'threat', 'vulnerability', 'assessment', 'mitigation'],
    COMPLIANCE: ['compliance', 'requirement', 'standard', 'audit', 'framework'],
    PROCESS: ['process', 'procedure', 'workflow', 'implement', 'execute'],
    TECHNOLOGY: ['system', 'network', 'application', 'infrastructure', 'device']
  };

  constructor(options: SemanticAnalyzerOptions) {
    this.config = options.config;
    this.enableCaching = options.enable_caching;
    this.performanceMonitoring = options.performance_monitoring;
    this.cache = new Map();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Analyze semantic similarity between requirements
   */
  async analyzeSemanticSimilarity(
    source: ProcessedRequirement, 
    target: ProcessedRequirement
  ): Promise<SemanticAnalysisResult> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(source.id, target.id);
      if (this.enableCaching) {
        const cached = this.getFromCache<SemanticAnalysisResult>(cacheKey);
        if (cached) {
          this.metrics.cache_hit_rate++;
          return cached;
        }
      }

      // Compute TF-IDF similarity
      const tfidfSimilarity = this.computeTFIDFSimilarity(source, target);
      
      // Compute cosine similarity
      const cosineSimilarity = this.computeCosineSimilarity(source.vector, target.vector);
      
      // Extract and compare entities
      const entitySimilarity = this.compareEntities(source.entities, target.entities);
      
      // Analyze structural similarity
      const structuralSimilarity = this.analyzeStructuralSimilarity(
        source.structure, 
        target.structure
      );

      // Combine scores with weighted average
      const combinedSimilarity = this.combineSemanticScores(
        tfidfSimilarity,
        cosineSimilarity,
        entitySimilarity,
        structuralSimilarity
      );

      // Calculate confidence score
      const confidence = this.calculateConfidence(
        combinedSimilarity,
        source,
        target
      );

      const result: SemanticAnalysisResult = {
        similarity: combinedSimilarity,
        confidence: confidence,
        matches: [{
          source_id: source.id,
          target_id: target.id,
          similarity_score: combinedSimilarity,
          match_type: 'hybrid',
          confidence: confidence,
          matched_concepts: this.extractMatchedConcepts(source, target),
          overlap_percentage: this.calculateOverlapPercentage(source, target)
        }],
        entities: [...source.entities, ...target.entities],
        structure: this.mergeStructures(source.structure, target.structure),
        processing_time: performance.now() - startTime
      };

      // Cache result
      if (this.enableCaching) {
        this.setCache(cacheKey, result);
      }

      // Update metrics
      this.updateMetrics(result.processing_time);

      return result;
    } catch (error) {
      this.metrics.errors_encountered++;
      throw new Error(`Semantic analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract compliance entities from text
   */
  extractComplianceEntities(text: string): ComplianceEntity[] {
    const entities: ComplianceEntity[] = [];
    const normalizedText = this.normalizeText(text);
    
    // Entity patterns for different compliance types
    const entityPatterns = {
      CONTROL: /\b(control|controls|safeguard|measure|protection)\b/gi,
      POLICY: /\b(policy|policies|guideline|standard|procedure)\b/gi,
      PROCESS: /\b(process|processes|workflow|procedure|operation)\b/gi,
      REQUIREMENT: /\b(requirement|shall|must|should|need|require)\b/gi,
      DOMAIN: /\b(security|governance|risk|compliance|audit)\b/gi,
      ASSET: /\b(asset|system|data|information|resource)\b/gi,
      RISK: /\b(risk|threat|vulnerability|hazard|exposure)\b/gi
    };

    Object.entries(entityPatterns).forEach(([type, pattern]) => {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        entities.push({
          type: type as ComplianceEntity['type'],
          text: match[0],
          confidence: this.calculateEntityConfidence(match[0], type),
          position: [match.index, match.index + match[0].length],
          domain: this.determineDomain(match[0]),
          criticality: this.assessCriticality(match[0], type)
        });
      }
    });

    return this.deduplicateEntities(entities);
  }

  /**
   * Analyze requirement structure
   */
  analyzeRequirementStructure(text: string): RequirementStructure {
    const sentences = this.splitIntoSentences(text);
    
    return {
      main_clause: this.extractMainClause(sentences),
      sub_clauses: this.extractSubClauses(sentences),
      conditions: this.extractConditions(text),
      exceptions: this.extractExceptions(text),
      references: this.extractReferences(text),
      action_verbs: this.extractActionVerbs(text),
      domain_context: this.determineDomainContext(text)
    };
  }

  /**
   * Normalize text for consistent processing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Compute TF-IDF similarity with domain-specific weights
   */
  private computeTFIDFSimilarity(
    source: ProcessedRequirement, 
    target: ProcessedRequirement
  ): number {
    const sourceTerms = this.extractTermFrequency(source.normalized_text);
    const targetTerms = this.extractTermFrequency(target.normalized_text);
    
    let weightedSimilarity = 0;
    let totalWeight = 0;

    // Apply domain-specific weights
    Object.entries(this.DOMAIN_WEIGHTS).forEach(([domain, terms]) => {
      const domainWeight = this.config.tfidf_weights[domain.toLowerCase() + '_terms'] || 1;
      
      terms.forEach(term => {
        const sourceFreq = sourceTerms.get(term) || 0;
        const targetFreq = targetTerms.get(term) || 0;
        
        if (sourceFreq > 0 && targetFreq > 0) {
          weightedSimilarity += Math.min(sourceFreq, targetFreq) * domainWeight;
          totalWeight += domainWeight;
        }
      });
    });

    return totalWeight > 0 ? weightedSimilarity / totalWeight : 0;
  }

  /**
   * Compute cosine similarity between vectors
   */
  private computeCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Compare entities between requirements
   */
  private compareEntities(
    entitiesA: ComplianceEntity[], 
    entitiesB: ComplianceEntity[]
  ): number {
    const typesA = new Set(entitiesA.map(e => e.type));
    const typesB = new Set(entitiesB.map(e => e.type));
    
    const intersection = new Set(Array.from(typesA).filter(x => typesB.has(x)));
    const union = new Set([...Array.from(typesA), ...Array.from(typesB)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Analyze structural similarity between requirements
   */
  private analyzeStructuralSimilarity(
    structureA: RequirementStructure,
    structureB: RequirementStructure
  ): number {
    const scores = [
      this.compareTextArrays(structureA.action_verbs, structureB.action_verbs),
      this.compareTextArrays(structureA.conditions, structureB.conditions),
      this.compareTextArrays(structureA.sub_clauses, structureB.sub_clauses),
      structureA.domain_context === structureB.domain_context ? 1 : 0
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Generate cache key for requirement pair
   */
  private generateCacheKey(sourceId: string, targetId: string): string {
    const sortedIds = [sourceId, targetId].sort();
    return `semantic_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Extract term frequency from text
   */
  private extractTermFrequency(text: string): Map<string, number> {
    const terms = text.split(/\s+/);
    const frequency = new Map<string, number>();
    
    terms.forEach(term => {
      frequency.set(term, (frequency.get(term) || 0) + 1);
    });
    
    return frequency;
  }

  /**
   * Calculate entity confidence based on context
   */
  private calculateEntityConfidence(text: string, type: string): number {
    // Simple confidence calculation - can be enhanced with ML models
    const baseConfidence = 0.7;
    const lengthBonus = Math.min(text.length / 10, 0.2);
    const typeBonus = type === 'REQUIREMENT' ? 0.1 : 0;
    
    return Math.min(baseConfidence + lengthBonus + typeBonus, 1.0);
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      processing_time: 0,
      cache_hit_rate: 0,
      total_requirements_processed: 0,
      average_similarity_computation_time: 0,
      memory_usage: 0,
      errors_encountered: 0
    };
  }

  /**
   * Helper methods for structure analysis
   */
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private extractMainClause(sentences: string[]): string {
    return sentences.length > 0 ? sentences[0].trim() : '';
  }

  private extractSubClauses(sentences: string[]): string[] {
    return sentences.slice(1).map(s => s.trim()).filter(s => s.length > 0);
  }

  private extractConditions(text: string): string[] {
    const conditionPatterns = /\b(if|when|where|provided|unless|except)\b.*?[.;]/gi;
    return Array.from(text.matchAll(conditionPatterns)).map(match => match[0]);
  }

  private extractExceptions(text: string): string[] {
    const exceptionPatterns = /\b(except|unless|excluding|but not|other than)\b.*?[.;]/gi;
    return Array.from(text.matchAll(exceptionPatterns)).map(match => match[0]);
  }

  private extractReferences(text: string): string[] {
    const refPatterns = /\b(section|clause|requirement|standard|policy)\s+[\w.-]+/gi;
    return Array.from(text.matchAll(refPatterns)).map(match => match[0]);
  }

  private extractActionVerbs(text: string): string[] {
    const actionWords = ['shall', 'must', 'should', 'will', 'may', 'implement', 'establish', 'maintain', 'review', 'monitor'];
    return actionWords.filter(word => text.toLowerCase().includes(word));
  }

  private determineDomainContext(text: string): string {
    const domainKeywords = {
      'security': ['security', 'protect', 'secure', 'encryption'],
      'governance': ['governance', 'policy', 'management'],
      'risk': ['risk', 'threat', 'vulnerability'],
      'compliance': ['compliance', 'audit', 'standard']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return domain;
      }
    }

    return 'general';
  }

  private determineDomain(text: string): string {
    return this.determineDomainContext(text);
  }

  private assessCriticality(text: string, type: string): ComplianceEntity['criticality'] {
    const criticalWords = ['critical', 'essential', 'mandatory', 'must', 'shall'];
    const highWords = ['important', 'significant', 'should', 'required'];
    
    const lowerText = text.toLowerCase();
    
    if (criticalWords.some(word => lowerText.includes(word))) return 'CRITICAL';
    if (highWords.some(word => lowerText.includes(word))) return 'HIGH';
    if (type === 'REQUIREMENT') return 'MEDIUM';
    return 'LOW';
  }

  private deduplicateEntities(entities: ComplianceEntity[]): ComplianceEntity[] {
    const unique = new Map<string, ComplianceEntity>();
    
    entities.forEach(entity => {
      const key = `${entity.type}_${entity.text}`;
      if (!unique.has(key) || unique.get(key)!.confidence < entity.confidence) {
        unique.set(key, entity);
      }
    });
    
    return Array.from(unique.values());
  }

  private combineSemanticScores(
    tfidf: number,
    cosine: number,
    entity: number,
    structural: number
  ): number {
    const weights = { tfidf: 0.3, cosine: 0.3, entity: 0.2, structural: 0.2 };
    return (tfidf * weights.tfidf) + (cosine * weights.cosine) + 
           (entity * weights.entity) + (structural * weights.structural);
  }

  private calculateConfidence(
    similarity: number,
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    const baseLine = 0.5;
    const similarityBonus = similarity * 0.3;
    const lengthPenalty = Math.abs(source.metadata.word_count - target.metadata.word_count) / 100;
    
    return Math.max(0, Math.min(1, baseLine + similarityBonus - lengthPenalty));
  }

  private extractMatchedConcepts(source: ProcessedRequirement, target: ProcessedRequirement): string[] {
    const sourceKeywords = new Set(source.keywords);
    const targetKeywords = new Set(target.keywords);
    return Array.from(sourceKeywords).filter(k => targetKeywords.has(k));
  }

  private calculateOverlapPercentage(source: ProcessedRequirement, target: ProcessedRequirement): number {
    const sourceWords = new Set(source.normalized_text.split(/\s+/));
    const targetWords = new Set(target.normalized_text.split(/\s+/));
    const intersection = new Set(Array.from(sourceWords).filter(x => targetWords.has(x)));
    const union = new Set([...Array.from(sourceWords), ...Array.from(targetWords)]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  private mergeStructures(a: RequirementStructure, b: RequirementStructure): RequirementStructure {
    return {
      main_clause: a.main_clause || b.main_clause,
      sub_clauses: [...a.sub_clauses, ...b.sub_clauses],
      conditions: [...a.conditions, ...b.conditions],
      exceptions: [...a.exceptions, ...b.exceptions],
      references: [...a.references, ...b.references],
      action_verbs: Array.from(new Set([...a.action_verbs, ...b.action_verbs])),
      domain_context: a.domain_context || b.domain_context
    };
  }

  private compareTextArrays(arrayA: string[], arrayB: string[]): number {
    const setA = new Set(arrayA);
    const setB = new Set(arrayB);
    const intersection = new Set(Array.from(setA).filter(x => setB.has(x)));
    const union = new Set([...Array.from(setA), ...Array.from(setB)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp.getTime() < entry.ttl) {
      entry.hits++;
      return entry.data as T;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: this.config.performance_limits.cache_ttl,
      hits: 0,
      key_hash: key
    });
  }

  private updateMetrics(processingTime: number): void {
    this.metrics.processing_time += processingTime;
    this.metrics.total_requirements_processed++;
    this.metrics.average_similarity_computation_time = 
      this.metrics.processing_time / this.metrics.total_requirements_processed;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache and reset metrics
   */
  reset(): void {
    this.cache.clear();
    this.metrics = this.initializeMetrics();
  }
}