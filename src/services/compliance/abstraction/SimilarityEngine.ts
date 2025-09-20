/**
 * SimilarityEngine.ts
 * Multi-level similarity scoring, clustering algorithms, and quality confidence scoring
 * Handles threshold management and validation rules for semantic clustering
 */

import { 
  SimilarityResult, 
  ProcessedRequirement, 
  ClusterInfo, 
  AnalysisConfig,
  PerformanceMetrics
} from './types';
import { ClusteringUtils } from './ClusteringUtils';
import type { ClusteringOptions } from './ClusteringUtils';

export interface SimilarityMetrics {
  semantic_weight: number;
  structural_weight: number;
  contextual_weight: number;
  entity_weight: number;
}

export type { ClusteringOptions };

export class SimilarityEngine {
  private config: AnalysisConfig;
  private metrics: PerformanceMetrics;
  private clusterCache: Map<string, ClusterInfo[]>;
  private similarityCache: Map<string, SimilarityResult>;

  // Similarity thresholds for different levels
  private readonly DEFAULT_THRESHOLDS = {
    VERY_HIGH: 0.9,
    HIGH: 0.75,
    MEDIUM: 0.6,
    LOW: 0.4,
    VERY_LOW: 0.2
  };

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.clusterCache = new Map();
    this.similarityCache = new Map();
  }

  /**
   * Calculate comprehensive similarity between two requirements
   */
  async calculateSimilarity(
    source: ProcessedRequirement,
    target: ProcessedRequirement,
    weights: SimilarityMetrics = this.getDefaultWeights()
  ): Promise<SimilarityResult> {
    const startTime = performance.now();

    try {
      // Check cache
      const cacheKey = this.generateSimilarityCacheKey(source.id, target.id);
      if (this.similarityCache.has(cacheKey)) {
        return this.similarityCache.get(cacheKey)!;
      }

      // Calculate individual similarity scores
      const semanticScore = this.calculateSemanticSimilarity(source, target);
      const structuralScore = this.calculateStructuralSimilarity(source, target);
      const contextualScore = this.calculateContextualSimilarity(source, target);
      const entityScore = this.calculateEntitySimilarity(source, target);

      // Weighted combination
      const combinedScore = 
        (semanticScore * weights.semantic_weight) +
        (structuralScore * weights.structural_weight) +
        (contextualScore * weights.contextual_weight) +
        (entityScore * weights.entity_weight);

      // Calculate confidence
      const confidence = this.calculateSimilarityConfidence(
        semanticScore, structuralScore, contextualScore, entityScore, source, target
      );

      // Generate explanation
      const explanation = this.generateSimilarityExplanation(
        semanticScore, structuralScore, contextualScore, entityScore, combinedScore
      );

      const result: SimilarityResult = {
        source_id: source.id,
        target_id: target.id,
        semantic_score: semanticScore,
        structural_score: structuralScore,
        contextual_score: contextualScore,
        combined_score: combinedScore,
        confidence: confidence,
        explanation: explanation,
        clusters: [] // Will be populated during clustering
      };

      // Cache result
      this.similarityCache.set(cacheKey, result);

      // Update metrics
      this.updateProcessingMetrics(performance.now() - startTime);

      return result;
    } catch (error) {
      this.metrics.errors_encountered++;
      throw new Error(`Similarity calculation failed: ${error.message}`);
    }
  }

  /**
   * Perform clustering on a set of requirements
   */
  async clusterRequirements(
    requirements: ProcessedRequirement[],
    options: ClusteringOptions = this.getDefaultClusteringOptions()
  ): Promise<ClusterInfo[]> {
    const startTime = performance.now();

    try {
      // Check cache
      const cacheKey = this.generateClusterCacheKey(requirements, options);
      if (this.clusterCache.has(cacheKey)) {
        return this.clusterCache.get(cacheKey)!;
      }

      let clusters: ClusterInfo[] = [];

      switch (options.algorithm) {
        case 'k-means':
          clusters = await ClusteringUtils.performKMeansClustering(requirements, options);
          break;
        case 'hierarchical':
          clusters = await ClusteringUtils.performHierarchicalClustering(requirements, options);
          break;
        case 'dbscan':
          clusters = await ClusteringUtils.performDBSCANClustering(requirements, options);
          break;
        case 'agglomerative':
          clusters = await ClusteringUtils.performHierarchicalClustering(requirements, options);
          break;
        default:
          throw new Error(`Unsupported clustering algorithm: ${options.algorithm}`);
      }

      // Validate clusters if enabled
      if (options.enable_validation) {
        clusters = this.validateClusters(clusters, options);
      }

      // Calculate cluster quality scores
      clusters = this.calculateClusterQuality(clusters, requirements);

      // Cache results
      this.clusterCache.set(cacheKey, clusters);

      // Update metrics
      this.updateProcessingMetrics(performance.now() - startTime);

      return clusters;
    } catch (error) {
      this.metrics.errors_encountered++;
      throw new Error(`Clustering failed: ${error.message}`);
    }
  }

  /**
   * Calculate semantic similarity using vector comparison
   */
  private calculateSemanticSimilarity(
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    if (source.vector.length === 0 || target.vector.length === 0) {
      return this.calculateTextSimilarity(source.normalized_text, target.normalized_text);
    }

    return this.cosineSimilarity(source.vector, target.vector);
  }

  /**
   * Calculate structural similarity based on requirement components
   */
  private calculateStructuralSimilarity(
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    const scores = [
      this.arrayJaccardSimilarity(source.structure.action_verbs, target.structure.action_verbs),
      this.arrayJaccardSimilarity(source.structure.conditions, target.structure.conditions),
      this.arrayJaccardSimilarity(source.structure.sub_clauses, target.structure.sub_clauses),
      this.arrayJaccardSimilarity(source.structure.references, target.structure.references),
      source.structure.domain_context === target.structure.domain_context ? 1 : 0
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculate contextual similarity based on metadata and framework
   */
  private calculateContextualSimilarity(
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    const categoryMatch = source.metadata.category === target.metadata.category ? 1 : 0;
    const domainMatch = source.metadata.domain === target.metadata.domain ? 1 : 0;
    const frameworkMatch = source.framework === target.framework ? 1 : 0;
    const criticalityMatch = source.metadata.criticality === target.metadata.criticality ? 1 : 0;

    // Weight different contextual factors
    const weights = { category: 0.3, domain: 0.3, framework: 0.2, criticality: 0.2 };
    
    return (categoryMatch * weights.category) + 
           (domainMatch * weights.domain) + 
           (frameworkMatch * weights.framework) + 
           (criticalityMatch * weights.criticality);
  }

  /**
   * Calculate entity similarity based on compliance entities
   */
  private calculateEntitySimilarity(
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    const sourceEntityTypes = new Set(source.entities.map(e => e.type));
    const targetEntityTypes = new Set(target.entities.map(e => e.type));
    
    const intersection = new Set(Array.from(sourceEntityTypes).filter(x => targetEntityTypes.has(x)));
    const union = new Set([...Array.from(sourceEntityTypes), ...Array.from(targetEntityTypes)]);
    
    const typeJaccard = union.size > 0 ? intersection.size / union.size : 0;

    // Also consider entity text similarity
    const sourceEntityTexts = source.entities.map(e => e.text);
    const targetEntityTexts = target.entities.map(e => e.text);
    const textJaccard = this.arrayJaccardSimilarity(sourceEntityTexts, targetEntityTexts);

    return (typeJaccard + textJaccard) / 2;
  }


  /**
   * Validate clusters based on quality metrics
   */
  private validateClusters(clusters: ClusterInfo[], options: ClusteringOptions): ClusterInfo[] {
    return clusters.filter(cluster => {
      // Size validation
      if (cluster.size < options.min_cluster_size) return false;
      
      // Quality threshold validation
      if (cluster.quality_score < options.quality_threshold) return false;
      
      // Internal coherence validation
      if (cluster.quality_score < 0.5) return false;
      
      return true;
    });
  }

  /**
   * Calculate quality scores for clusters
   */
  private calculateClusterQuality(clusters: ClusterInfo[], requirements: ProcessedRequirement[]): ClusterInfo[] {
    return clusters.map(cluster => {
      const members = requirements.filter(req => cluster.members.includes(req.id));
      
      // Internal similarity (cohesion)
      const internalSimilarity = ClusteringUtils.calculateInternalSimilarity(members);
      
      // External separation
      const externalSeparation = ClusteringUtils.calculateExternalSeparation(cluster, clusters, requirements);
      
      // Silhouette coefficient approximation
      const silhouette = internalSimilarity - externalSeparation;
      
      // Update quality score
      cluster.quality_score = Math.max(0, Math.min(1, (silhouette + 1) / 2));
      
      // Update dominant concepts
      cluster.dominant_concepts = ClusteringUtils.extractDominantConcepts(members);
      
      return cluster;
    });
  }

  /**
   * Helper methods
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
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

  private arrayJaccardSimilarity(arrayA: string[], arrayB: string[]): number {
    const setA = new Set(arrayA.map(item => item.toLowerCase()));
    const setB = new Set(arrayB.map(item => item.toLowerCase()));
    
    const intersection = new Set(Array.from(setA).filter(x => setB.has(x)));
    const union = new Set([...Array.from(setA), ...Array.from(setB)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateTextSimilarity(textA: string, textB: string): number {
    const wordsA = new Set(textA.split(/\s+/));
    const wordsB = new Set(textB.split(/\s+/));
    
    const intersection = new Set(Array.from(wordsA).filter(x => wordsB.has(x)));
    const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateSimilarityConfidence(
    semantic: number,
    structural: number,
    contextual: number,
    entity: number,
    source: ProcessedRequirement,
    target: ProcessedRequirement
  ): number {
    // Base confidence from score consistency
    const scores = [semantic, structural, contextual, entity];
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const consistency = 1 - Math.sqrt(variance);
    
    // Adjust for data quality
    const dataQuality = Math.min(
      source.vector.length > 0 ? 1 : 0.7,
      target.vector.length > 0 ? 1 : 0.7,
      source.entities.length > 0 ? 1 : 0.8,
      target.entities.length > 0 ? 1 : 0.8
    );
    
    return consistency * dataQuality;
  }

  private generateSimilarityExplanation(
    semantic: number,
    structural: number,
    contextual: number,
    entity: number,
    combined: number
  ): string {
    const level = this.getSimilarityLevel(combined);
    const components = [
      `Semantic: ${(semantic * 100).toFixed(1)}%`,
      `Structural: ${(structural * 100).toFixed(1)}%`,
      `Contextual: ${(contextual * 100).toFixed(1)}%`,
      `Entity: ${(entity * 100).toFixed(1)}%`
    ];
    
    return `${level} similarity (${(combined * 100).toFixed(1)}%) - ${components.join(', ')}`;
  }

  private getSimilarityLevel(score: number): string {
    if (score >= this.DEFAULT_THRESHOLDS.VERY_HIGH) return 'Very High';
    if (score >= this.DEFAULT_THRESHOLDS.HIGH) return 'High';
    if (score >= this.DEFAULT_THRESHOLDS.MEDIUM) return 'Medium';
    if (score >= this.DEFAULT_THRESHOLDS.LOW) return 'Low';
    return 'Very Low';
  }


  private getDefaultWeights(): SimilarityMetrics {
    return {
      semantic_weight: 0.4,
      structural_weight: 0.3,
      contextual_weight: 0.2,
      entity_weight: 0.1
    };
  }

  private getDefaultClusteringOptions(): ClusteringOptions {
    return {
      algorithm: 'k-means',
      min_similarity: this.config.similarity_thresholds.clustering,
      max_clusters: this.config.clustering_config.max_clusters,
      min_cluster_size: this.config.clustering_config.min_cluster_size,
      quality_threshold: this.config.clustering_config.quality_threshold,
      enable_validation: true
    };
  }

  private generateSimilarityCacheKey(sourceId: string, targetId: string): string {
    const sortedIds = [sourceId, targetId].sort();
    return `sim_${sortedIds[0]}_${sortedIds[1]}`;
  }

  private generateClusterCacheKey(requirements: ProcessedRequirement[], options: ClusteringOptions): string {
    const reqIds = requirements.map(r => r.id).sort().join(',');
    const optionsHash = JSON.stringify(options);
    return `cluster_${reqIds.slice(0, 50)}_${optionsHash.slice(0, 20)}`;
  }

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

  private updateProcessingMetrics(processingTime: number): void {
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
   * Clear all caches and reset metrics
   */
  reset(): void {
    this.clusterCache.clear();
    this.similarityCache.clear();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Get similarity threshold for a given level
   */
  getThreshold(level: keyof typeof this.DEFAULT_THRESHOLDS): number {
    return this.DEFAULT_THRESHOLDS[level];
  }
}