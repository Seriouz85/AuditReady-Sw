/**
 * SmartSemanticAnalyzer.ts
 * Main orchestrator for semantic analysis of compliance requirements
 * Integrates SemanticAnalyzer, RequirementProcessor, and SimilarityEngine
 */

import { 
  AnalysisConfig,
  SemanticAnalyzerOptions,
  ProcessedRequirement,
  SimilarityResult,
  ClusterInfo,
  PerformanceMetrics,
  SemanticAnalysisResult
} from './types';
import { SemanticAnalyzer } from './SemanticAnalyzer';
import { RequirementProcessor, RawRequirement, ProcessingOptions } from './RequirementProcessor';
import { SimilarityEngine, ClusteringOptions, SimilarityMetrics } from './SimilarityEngine';

export interface SmartAnalysisOptions {
  processing: ProcessingOptions;
  clustering: ClusteringOptions;
  similarity_weights: SimilarityMetrics;
  enable_batch_processing: boolean;
  parallel_processing: boolean;
  cache_results: boolean;
}

export interface AnalysisResult {
  processed_requirements: ProcessedRequirement[];
  similarity_matrix: SimilarityResult[][];
  clusters: ClusterInfo[];
  performance_metrics: PerformanceMetrics;
  analysis_summary: AnalysisSummary;
}

export interface AnalysisSummary {
  total_requirements: number;
  processed_successfully: number;
  failed_processing: number;
  total_clusters: number;
  average_cluster_size: number;
  highest_similarity_score: number;
  lowest_similarity_score: number;
  processing_time_ms: number;
  cache_hit_rate: number;
}

export class SmartSemanticAnalyzer {
  private semanticAnalyzer: SemanticAnalyzer;
  private requirementProcessor: RequirementProcessor;
  private similarityEngine: SimilarityEngine;
  private config: AnalysisConfig;
  private isInitialized: boolean;

  constructor(options: SemanticAnalyzerOptions) {
    this.config = options.config;
    this.isInitialized = false;
    
    // Initialize components
    this.semanticAnalyzer = new SemanticAnalyzer(options);
    this.requirementProcessor = new RequirementProcessor(this.semanticAnalyzer, this.config);
    this.similarityEngine = new SimilarityEngine(this.config);
    
    this.isInitialized = true;
  }

  /**
   * Perform comprehensive semantic analysis on a set of requirements
   */
  async analyzeRequirements(
    rawRequirements: RawRequirement[],
    options: SmartAnalysisOptions = this.getDefaultAnalysisOptions()
  ): Promise<AnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('SmartSemanticAnalyzer not properly initialized');
    }

    const startTime = performance.now();
    let processedRequirements: ProcessedRequirement[] = [];
    let similarityMatrix: SimilarityResult[][] = [];
    let clusters: ClusterInfo[] = [];
    let failedProcessing = 0;

    try {
      // Step 1: Process raw requirements
      console.log(`Processing ${rawRequirements.length} requirements...`);
      
      if (options.enable_batch_processing) {
        processedRequirements = await this.requirementProcessor.batchProcessRequirements(
          rawRequirements, 
          options.processing
        );
      } else {
        const processingPromises = rawRequirements.map(async (req) => {
          try {
            return await this.requirementProcessor.processRequirement(req, options.processing);
          } catch (error) {
            console.warn(`Failed to process requirement ${req.id}: ${error.message}`);
            failedProcessing++;
            return null;
          }
        });

        const results = await Promise.all(processingPromises);
        processedRequirements = results.filter(req => req !== null) as ProcessedRequirement[];
      }

      console.log(`Successfully processed ${processedRequirements.length} requirements`);

      // Step 2: Calculate similarity matrix
      if (processedRequirements.length > 1) {
        console.log('Calculating similarity matrix...');
        similarityMatrix = await this.calculateSimilarityMatrix(
          processedRequirements, 
          options.similarity_weights,
          options.parallel_processing
        );
      }

      // Step 3: Perform clustering
      if (processedRequirements.length > 2) {
        console.log('Performing clustering analysis...');
        clusters = await this.similarityEngine.clusterRequirements(
          processedRequirements, 
          options.clustering
        );
        console.log(`Generated ${clusters.length} clusters`);
      }

      // Step 4: Generate analysis summary
      const summary = this.generateAnalysisSummary(
        rawRequirements.length,
        processedRequirements.length,
        failedProcessing,
        clusters,
        similarityMatrix,
        performance.now() - startTime
      );

      // Step 5: Collect performance metrics
      const performanceMetrics = this.collectPerformanceMetrics();

      return {
        processed_requirements: processedRequirements,
        similarity_matrix: similarityMatrix,
        clusters: clusters,
        performance_metrics: performanceMetrics,
        analysis_summary: summary
      };

    } catch (error) {
      throw new Error(`Semantic analysis failed: ${error.message}`);
    }
  }

  /**
   * Find similar requirements to a given requirement
   */
  async findSimilarRequirements(
    targetRequirement: RawRequirement,
    candidateRequirements: RawRequirement[],
    similarityThreshold: number = 0.6,
    maxResults: number = 10
  ): Promise<SimilarityResult[]> {
    // Process the target requirement
    const processedTarget = await this.requirementProcessor.processRequirement(
      targetRequirement, 
      this.getDefaultAnalysisOptions().processing
    );

    // Process candidate requirements
    const processedCandidates = await this.requirementProcessor.batchProcessRequirements(
      candidateRequirements,
      this.getDefaultAnalysisOptions().processing
    );

    // Calculate similarities
    const similarities: SimilarityResult[] = [];
    
    for (const candidate of processedCandidates) {
      try {
        const similarity = await this.similarityEngine.calculateSimilarity(
          processedTarget,
          candidate,
          this.getDefaultAnalysisOptions().similarity_weights
        );

        if (similarity.combined_score >= similarityThreshold) {
          similarities.push(similarity);
        }
      } catch (error) {
        console.warn(`Failed to calculate similarity for ${candidate.id}: ${error.message}`);
      }
    }

    // Sort by combined score and return top results
    return similarities
      .sort((a, b) => b.combined_score - a.combined_score)
      .slice(0, maxResults);
  }

  /**
   * Analyze semantic relationship between two specific requirements
   */
  async analyzeRequirementPair(
    requirement1: RawRequirement,
    requirement2: RawRequirement
  ): Promise<SemanticAnalysisResult> {
    // Process both requirements
    const [processed1, processed2] = await Promise.all([
      this.requirementProcessor.processRequirement(requirement1, this.getDefaultAnalysisOptions().processing),
      this.requirementProcessor.processRequirement(requirement2, this.getDefaultAnalysisOptions().processing)
    ]);

    // Perform semantic analysis
    return await this.semanticAnalyzer.analyzeSemanticSimilarity(processed1, processed2);
  }

  /**
   * Get clusters containing a specific requirement
   */
  async getRequirementClusters(
    requirementId: string,
    allRequirements: RawRequirement[]
  ): Promise<ClusterInfo[]> {
    const analysis = await this.analyzeRequirements(allRequirements);
    return analysis.clusters.filter(cluster => cluster.members.includes(requirementId));
  }

  /**
   * Calculate similarity matrix for all requirement pairs
   */
  private async calculateSimilarityMatrix(
    requirements: ProcessedRequirement[],
    weights: SimilarityMetrics,
    useParallel: boolean = false
  ): Promise<SimilarityResult[][]> {
    const matrix: SimilarityResult[][] = [];
    
    if (useParallel) {
      // Parallel processing for large datasets
      const promises: Promise<SimilarityResult>[] = [];
      
      for (let i = 0; i < requirements.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < requirements.length; j++) {
          if (i === j) {
            // Self-similarity
            matrix[i][j] = this.createSelfSimilarityResult(requirements[i]);
          } else if (i < j) {
            // Calculate similarity
            promises.push(
              this.similarityEngine.calculateSimilarity(requirements[i], requirements[j], weights)
                .then(result => {
                  matrix[i][j] = result;
                  // Mirror the result
                  matrix[j] = matrix[j] || [];
                  matrix[j][i] = this.mirrorSimilarityResult(result);
                  return result;
                })
            );
          }
        }
      }
      
      await Promise.all(promises);
    } else {
      // Sequential processing
      for (let i = 0; i < requirements.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < requirements.length; j++) {
          if (i === j) {
            matrix[i][j] = this.createSelfSimilarityResult(requirements[i]);
          } else {
            matrix[i][j] = await this.similarityEngine.calculateSimilarity(
              requirements[i], 
              requirements[j], 
              weights
            );
          }
        }
      }
    }

    return matrix;
  }

  /**
   * Generate comprehensive analysis summary
   */
  private generateAnalysisSummary(
    totalRequirements: number,
    processedSuccessfully: number,
    failedProcessing: number,
    clusters: ClusterInfo[],
    similarityMatrix: SimilarityResult[][],
    processingTimeMs: number
  ): AnalysisSummary {
    let highestSimilarity = 0;
    let lowestSimilarity = 1;

    // Analyze similarity scores
    if (similarityMatrix.length > 0) {
      for (let i = 0; i < similarityMatrix.length; i++) {
        for (let j = i + 1; j < similarityMatrix[i].length; j++) {
          const score = similarityMatrix[i][j].combined_score;
          if (score > highestSimilarity) highestSimilarity = score;
          if (score < lowestSimilarity) lowestSimilarity = score;
        }
      }
    }

    const averageClusterSize = clusters.length > 0 
      ? clusters.reduce((sum, cluster) => sum + cluster.size, 0) / clusters.length 
      : 0;

    return {
      total_requirements: totalRequirements,
      processed_successfully: processedSuccessfully,
      failed_processing: failedProcessing,
      total_clusters: clusters.length,
      average_cluster_size: averageClusterSize,
      highest_similarity_score: highestSimilarity,
      lowest_similarity_score: lowestSimilarity,
      processing_time_ms: processingTimeMs,
      cache_hit_rate: this.collectPerformanceMetrics().cache_hit_rate
    };
  }

  /**
   * Collect performance metrics from all components
   */
  private collectPerformanceMetrics(): PerformanceMetrics {
    const semanticMetrics = this.semanticAnalyzer.getMetrics();
    const similarityMetrics = this.similarityEngine.getMetrics();

    return {
      processing_time: semanticMetrics.processing_time + similarityMetrics.processing_time,
      cache_hit_rate: (semanticMetrics.cache_hit_rate + similarityMetrics.cache_hit_rate) / 2,
      total_requirements_processed: Math.max(
        semanticMetrics.total_requirements_processed,
        similarityMetrics.total_requirements_processed
      ),
      average_similarity_computation_time: similarityMetrics.average_similarity_computation_time,
      memory_usage: semanticMetrics.memory_usage + similarityMetrics.memory_usage,
      errors_encountered: semanticMetrics.errors_encountered + similarityMetrics.errors_encountered
    };
  }

  /**
   * Create self-similarity result for diagonal matrix elements
   */
  private createSelfSimilarityResult(requirement: ProcessedRequirement): SimilarityResult {
    return {
      source_id: requirement.id,
      target_id: requirement.id,
      semantic_score: 1.0,
      structural_score: 1.0,
      contextual_score: 1.0,
      combined_score: 1.0,
      confidence: 1.0,
      explanation: 'Perfect self-similarity',
      clusters: []
    };
  }

  /**
   * Mirror similarity result for symmetric matrix
   */
  private mirrorSimilarityResult(original: SimilarityResult): SimilarityResult {
    return {
      ...original,
      source_id: original.target_id,
      target_id: original.source_id
    };
  }

  /**
   * Get default analysis options
   */
  private getDefaultAnalysisOptions(): SmartAnalysisOptions {
    return {
      processing: {
        enable_vectorization: true,
        extract_keywords: true,
        analyze_structure: true,
        calculate_readability: true,
        generate_hash: true
      },
      clustering: {
        algorithm: 'k-means',
        min_similarity: this.config.similarity_thresholds.clustering,
        max_clusters: this.config.clustering_config.max_clusters,
        min_cluster_size: this.config.clustering_config.min_cluster_size,
        quality_threshold: this.config.clustering_config.quality_threshold,
        enable_validation: true
      },
      similarity_weights: {
        semantic_weight: 0.4,
        structural_weight: 0.3,
        contextual_weight: 0.2,
        entity_weight: 0.1
      },
      enable_batch_processing: true,
      parallel_processing: false, // Set to true for production with larger datasets
      cache_results: true
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalysisConfig {
    return { ...this.config };
  }

  /**
   * Reset all components and clear caches
   */
  reset(): void {
    this.semanticAnalyzer.reset();
    this.requirementProcessor.clearCache();
    this.similarityEngine.reset();
  }

  /**
   * Check if the analyzer is ready for processing
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.collectPerformanceMetrics();
  }

  /**
   * Create default configuration for the analyzer
   */
  static createDefaultConfig(): AnalysisConfig {
    return {
      tfidf_weights: {
        control_terms: 1.5,
        process_terms: 1.2,
        technical_terms: 1.3,
        domain_terms: 1.4
      },
      similarity_thresholds: {
        semantic: 0.7,
        structural: 0.6,
        contextual: 0.8,
        clustering: 0.65
      },
      clustering_config: {
        min_cluster_size: 2,
        max_clusters: 20,
        quality_threshold: 0.6
      },
      performance_limits: {
        max_processing_time: 30000, // 30 seconds
        max_requirements_per_batch: 100,
        cache_ttl: 3600000 // 1 hour
      }
    };
  }

  /**
   * Create analyzer with default settings
   */
  static createDefault(): SmartSemanticAnalyzer {
    const config = SmartSemanticAnalyzer.createDefaultConfig();
    const options: SemanticAnalyzerOptions = {
      config: config,
      enable_caching: true,
      performance_monitoring: true,
      debug_mode: false,
      batch_size: 50
    };

    return new SmartSemanticAnalyzer(options);
  }
}