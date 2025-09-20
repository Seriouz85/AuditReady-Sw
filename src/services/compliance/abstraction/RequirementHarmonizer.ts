/**
 * RequirementHarmonizer.ts
 * Main orchestrator for intelligent requirement harmonization
 * Merges similar requirements while preserving compliance meaning
 */

import {
  ProcessedRequirement,
  ClusterInfo,
  PerformanceMetrics,
  SimilarityResult
} from './types';
import { UnifiedRequirementGenerator } from './UnifiedRequirementGenerator';
import { CompliancePreservationValidator } from './CompliancePreservationValidator';
import { ConflictResolver } from './ConflictResolver';

export interface HarmonizationConfig {
  merge_strategy: 'UNION_WITH_SPECIFICITY' | 'INTERSECTION_SAFE' | 'PRIORITY_WEIGHTED';
  quality_thresholds: {
    min_compliance_preservation: number; // >= 0.95
    max_text_complexity_multiplier: number; // <= 1.3
    min_confidence_score: number; // >= 0.85
  };
  processing_limits: {
    max_cluster_size: number; // 10
    max_processing_time_ms: number; // 30000
    batch_size: number; // 50
  };
  conflict_resolution: {
    frequency_strategy: 'MOST_STRINGENT' | 'LEAST_STRINGENT' | 'WEIGHTED_AVERAGE';
    scope_strategy: 'BROADEST' | 'NARROWEST' | 'COMBINED';
    method_strategy: 'ALL_OPTIONS' | 'MOST_COMMON' | 'PRIORITIZED';
    evidence_strategy: 'COMBINED' | 'STRONGEST' | 'COMPREHENSIVE';
  };
}

export interface HarmonizedRequirement {
  id: string;
  unified_text: string;
  source_requirements: string[];
  framework_coverage: string[];
  compliance_preservation_score: number;
  text_complexity_ratio: number;
  confidence_score: number;
  conflicts_resolved: ConflictResolution[];
  harmonization_metadata: HarmonizationMetadata;
}

export interface ConflictResolution {
  conflict_type: 'FREQUENCY' | 'SCOPE' | 'METHOD' | 'EVIDENCE' | 'TERMINOLOGY';
  source_values: string[];
  resolved_value: string;
  resolution_strategy: string;
  confidence: number;
}

export interface HarmonizationMetadata {
  original_word_count: number;
  unified_word_count: number;
  reduction_percentage: number;
  frameworks_merged: string[];
  critical_terms_preserved: string[];
  evidence_requirements: string[];
  harmonized_at: Date;
  processing_time_ms: number;
}

export interface HarmonizationResult {
  harmonized_requirements: HarmonizedRequirement[];
  failed_harmonizations: FailedHarmonization[];
  performance_metrics: HarmonizationPerformanceMetrics;
  quality_assessment: QualityAssessment;
}

export interface FailedHarmonization {
  cluster_id: string;
  source_requirements: string[];
  failure_reason: string;
  fallback_action: 'KEEP_SEPARATE' | 'MANUAL_REVIEW' | 'RETRY_LATER';
  quality_issues: string[];
}

export interface HarmonizationPerformanceMetrics extends PerformanceMetrics {
  total_clusters_processed: number;
  successful_harmonizations: number;
  failed_harmonizations: number;
  average_reduction_percentage: number;
  average_compliance_preservation: number;
  cache_utilization: number;
}

export interface QualityAssessment {
  overall_quality_score: number;
  compliance_preservation_average: number;
  text_complexity_average: number;
  confidence_score_average: number;
  recommendations: string[];
  manual_review_required: string[];
}

export class RequirementHarmonizer {
  private unifiedGenerator: UnifiedRequirementGenerator;
  private preservationValidator: CompliancePreservationValidator;
  private conflictResolver: ConflictResolver;
  private config: HarmonizationConfig;
  private cache: Map<string, HarmonizedRequirement>;
  private performanceMetrics: HarmonizationPerformanceMetrics;

  constructor(config: HarmonizationConfig) {
    this.config = config;
    this.cache = new Map();
    this.unifiedGenerator = new UnifiedRequirementGenerator(config);
    this.preservationValidator = new CompliancePreservationValidator(config);
    this.conflictResolver = new ConflictResolver(config);
    this.initializeMetrics();
  }

  /**
   * Harmonize requirements within clusters to reduce redundancy
   */
  async harmonizeRequirements(
    clusters: ClusterInfo[],
    processedRequirements: ProcessedRequirement[]
  ): Promise<HarmonizationResult> {
    const startTime = performance.now();
    this.resetMetrics();

    const harmonizedRequirements: HarmonizedRequirement[] = [];
    const failedHarmonizations: FailedHarmonization[] = [];

    // Process clusters in batches
    const batches = this.createBatches(clusters);
    
    for (const batch of batches) {
      const batchResults = await this.processBatch(batch, processedRequirements);
      harmonizedRequirements.push(...batchResults.successful);
      failedHarmonizations.push(...batchResults.failed);
    }

    const processingTime = performance.now() - startTime;
    this.updatePerformanceMetrics(processingTime, harmonizedRequirements.length, failedHarmonizations.length);

    return {
      harmonized_requirements: harmonizedRequirements,
      failed_harmonizations: failedHarmonizations,
      performance_metrics: this.performanceMetrics,
      quality_assessment: this.assessOverallQuality(harmonizedRequirements)
    };
  }

  /**
   * Process a single cluster for harmonization
   */
  async harmonizeCluster(
    cluster: ClusterInfo,
    requirements: ProcessedRequirement[]
  ): Promise<HarmonizedRequirement | FailedHarmonization> {
    const startTime = performance.now();
    
    try {
      // Extract cluster requirements
      const clusterRequirements = requirements.filter(req => 
        cluster.members.includes(req.id)
      );

      if (clusterRequirements.length < 2) {
        return this.createFailedHarmonization(
          cluster,
          'INSUFFICIENT_REQUIREMENTS',
          'Cluster has less than 2 requirements'
        );
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(clusterRequirements);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // Validate cluster quality before processing
      if (cluster.quality_score < this.config.quality_thresholds.min_confidence_score) {
        return this.createFailedHarmonization(
          cluster,
          'LOW_CLUSTER_QUALITY',
          `Cluster quality ${cluster.quality_score} below threshold ${this.config.quality_thresholds.min_confidence_score}`
        );
      }

      // Step 1: Resolve conflicts between requirements
      const conflictResolutions = await this.conflictResolver.resolveConflicts(clusterRequirements);

      // Step 2: Generate unified requirement text
      const unifiedResult = await this.unifiedGenerator.generateUnifiedRequirement(
        clusterRequirements,
        conflictResolutions
      );

      // Step 3: Validate compliance preservation
      const preservationResult = await this.preservationValidator.validatePreservation(
        clusterRequirements,
        unifiedResult.unified_text
      );

      // Step 4: Check quality thresholds
      if (preservationResult.preservation_score < this.config.quality_thresholds.min_compliance_preservation) {
        return this.createFailedHarmonization(
          cluster,
          'COMPLIANCE_PRESERVATION_FAILURE',
          `Preservation score ${preservationResult.preservation_score} below threshold ${this.config.quality_thresholds.min_compliance_preservation}`
        );
      }

      // Step 5: Create harmonized requirement
      const harmonizedRequirement = this.createHarmonizedRequirement(
        cluster,
        clusterRequirements,
        unifiedResult.unified_text,
        conflictResolutions,
        preservationResult,
        performance.now() - startTime
      );

      // Cache the result
      this.cache.set(cacheKey, harmonizedRequirement);

      return harmonizedRequirement;

    } catch (error) {
      return this.createFailedHarmonization(
        cluster,
        'PROCESSING_ERROR',
        `Error during harmonization: ${error.message}`
      );
    }
  }

  /**
   * Create batches for parallel processing
   */
  private createBatches(clusters: ClusterInfo[]): ClusterInfo[][] {
    const batches: ClusterInfo[][] = [];
    const batchSize = this.config.processing_limits.batch_size;
    
    for (let i = 0; i < clusters.length; i += batchSize) {
      batches.push(clusters.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Process a batch of clusters
   */
  private async processBatch(
    batch: ClusterInfo[],
    processedRequirements: ProcessedRequirement[]
  ): Promise<{ successful: HarmonizedRequirement[], failed: FailedHarmonization[] }> {
    const successful: HarmonizedRequirement[] = [];
    const failed: FailedHarmonization[] = [];

    const promises = batch.map(async (cluster) => {
      const result = await this.harmonizeCluster(cluster, processedRequirements);
      if ('id' in result) {
        successful.push(result);
      } else {
        failed.push(result);
      }
    });

    await Promise.all(promises);
    
    return { successful, failed };
  }

  /**
   * Create a harmonized requirement object
   */
  private createHarmonizedRequirement(
    cluster: ClusterInfo,
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string,
    conflictResolutions: ConflictResolution[],
    preservationResult: any,
    processingTime: number
  ): HarmonizedRequirement {
    const originalWordCount = sourceRequirements.reduce((sum, req) => 
      sum + req.metadata.word_count, 0
    );
    const unifiedWordCount = unifiedText.split(/\s+/).length;

    return {
      id: `harmonized_${cluster.cluster_id}`,
      unified_text: unifiedText,
      source_requirements: sourceRequirements.map(req => req.id),
      framework_coverage: Array.from(new Set(sourceRequirements.map(req => req.framework))),
      compliance_preservation_score: preservationResult.preservation_score,
      text_complexity_ratio: preservationResult.complexity_ratio,
      confidence_score: cluster.quality_score,
      conflicts_resolved: conflictResolutions,
      harmonization_metadata: {
        original_word_count: originalWordCount,
        unified_word_count: unifiedWordCount,
        reduction_percentage: ((originalWordCount - unifiedWordCount) / originalWordCount) * 100,
        frameworks_merged: Array.from(new Set(sourceRequirements.map(req => req.framework))),
        critical_terms_preserved: preservationResult.critical_terms_preserved,
        evidence_requirements: preservationResult.evidence_requirements,
        harmonized_at: new Date(),
        processing_time_ms: processingTime
      }
    };
  }

  /**
   * Create a failed harmonization record
   */
  private createFailedHarmonization(
    cluster: ClusterInfo,
    reason: string,
    details: string
  ): FailedHarmonization {
    return {
      cluster_id: cluster.cluster_id,
      source_requirements: cluster.members,
      failure_reason: reason,
      fallback_action: this.determineFallbackAction(reason),
      quality_issues: [details]
    };
  }

  /**
   * Determine appropriate fallback action based on failure reason
   */
  private determineFallbackAction(reason: string): 'KEEP_SEPARATE' | 'MANUAL_REVIEW' | 'RETRY_LATER' {
    switch (reason) {
      case 'INSUFFICIENT_REQUIREMENTS':
        return 'KEEP_SEPARATE';
      case 'COMPLIANCE_PRESERVATION_FAILURE':
        return 'MANUAL_REVIEW';
      case 'LOW_CLUSTER_QUALITY':
        return 'RETRY_LATER';
      default:
        return 'MANUAL_REVIEW';
    }
  }

  /**
   * Generate cache key for cluster requirements
   */
  private generateCacheKey(requirements: ProcessedRequirement[]): string {
    const sortedIds = requirements.map(req => req.id).sort();
    return `harmonized_${sortedIds.join('_')}`;
  }

  /**
   * Assess overall quality of harmonization results
   */
  private assessOverallQuality(harmonizedRequirements: HarmonizedRequirement[]): QualityAssessment {
    if (harmonizedRequirements.length === 0) {
      return {
        overall_quality_score: 0,
        compliance_preservation_average: 0,
        text_complexity_average: 0,
        confidence_score_average: 0,
        recommendations: ['No successful harmonizations produced'],
        manual_review_required: []
      };
    }

    const avgPreservation = harmonizedRequirements.reduce((sum, req) => 
      sum + req.compliance_preservation_score, 0) / harmonizedRequirements.length;
    
    const avgComplexity = harmonizedRequirements.reduce((sum, req) => 
      sum + req.text_complexity_ratio, 0) / harmonizedRequirements.length;
    
    const avgConfidence = harmonizedRequirements.reduce((sum, req) => 
      sum + req.confidence_score, 0) / harmonizedRequirements.length;

    const overallScore = (avgPreservation * 0.5) + (avgConfidence * 0.3) + ((2 - avgComplexity) * 0.2);

    return {
      overall_quality_score: overallScore,
      compliance_preservation_average: avgPreservation,
      text_complexity_average: avgComplexity,
      confidence_score_average: avgConfidence,
      recommendations: this.generateRecommendations(avgPreservation, avgComplexity, avgConfidence),
      manual_review_required: harmonizedRequirements
        .filter(req => req.compliance_preservation_score < 0.97)
        .map(req => req.id)
    };
  }

  /**
   * Generate quality recommendations
   */
  private generateRecommendations(
    avgPreservation: number,
    avgComplexity: number,
    avgConfidence: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (avgPreservation < 0.96) {
      recommendations.push('Consider manual review for low preservation scores');
    }
    if (avgComplexity > 1.2) {
      recommendations.push('Text complexity increased significantly - review for readability');
    }
    if (avgConfidence < 0.9) {
      recommendations.push('Low confidence scores - consider improving clustering quality');
    }
    
    return recommendations;
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): void {
    this.performanceMetrics = {
      processing_time: 0,
      cache_hit_rate: 0,
      total_requirements_processed: 0,
      average_similarity_computation_time: 0,
      memory_usage: 0,
      errors_encountered: 0,
      total_clusters_processed: 0,
      successful_harmonizations: 0,
      failed_harmonizations: 0,
      average_reduction_percentage: 0,
      average_compliance_preservation: 0,
      cache_utilization: 0
    };
  }

  /**
   * Reset metrics for new analysis
   */
  private resetMetrics(): void {
    this.initializeMetrics();
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    processingTime: number,
    successful: number,
    failed: number
  ): void {
    this.performanceMetrics.processing_time = processingTime;
    this.performanceMetrics.successful_harmonizations = successful;
    this.performanceMetrics.failed_harmonizations = failed;
    this.performanceMetrics.total_clusters_processed = successful + failed;
    this.performanceMetrics.cache_utilization = (this.cache.size / Math.max(1, successful + failed)) * 100;
  }

  /**
   * Get default harmonization configuration
   */
  static getDefaultConfig(): HarmonizationConfig {
    return {
      merge_strategy: 'UNION_WITH_SPECIFICITY',
      quality_thresholds: {
        min_compliance_preservation: 0.95,
        max_text_complexity_multiplier: 1.3,
        min_confidence_score: 0.85
      },
      processing_limits: {
        max_cluster_size: 10,
        max_processing_time_ms: 30000,
        batch_size: 50
      },
      conflict_resolution: {
        frequency_strategy: 'MOST_STRINGENT',
        scope_strategy: 'BROADEST',
        method_strategy: 'ALL_OPTIONS',
        evidence_strategy: 'COMBINED'
      }
    };
  }
}