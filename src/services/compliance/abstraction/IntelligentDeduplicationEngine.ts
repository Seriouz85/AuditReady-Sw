/**
 * IntelligentDeduplicationEngine.ts
 * Main orchestrator for intelligent requirement deduplication
 * Identifies and processes duplicate/similar requirements while preserving compliance integrity
 */

import {
  ProcessedRequirement,
  SimilarityResult,
  ClusterInfo,
  PerformanceMetrics,
  AnalysisConfig
} from './types';
import { SmartSemanticAnalyzer, AnalysisResult } from './SmartSemanticAnalyzer';
import { RequirementHarmonizer, HarmonizationResult, HarmonizationConfig } from './RequirementHarmonizer';
import { CompliancePreservationValidator } from './CompliancePreservationValidator';
import { DuplicationAnalyzer, DuplicationAnalysisResult } from './DuplicationAnalyzer';
import { MergeQualityAssessor, QualityAssessmentResult } from './MergeQualityAssessor';
import { DeduplicationCache } from './DeduplicationCache';

export interface DeduplicationConfig {
  strategies: {
    exact_threshold: number; // 0.98 - Nearly identical text
    semantic_threshold: number; // 0.85 - Similar meaning
    hybrid_threshold: number; // 0.75 - Combined similarity
    clustering_threshold: number; // 0.65 - For grouping
  };
  quality_requirements: {
    min_compliance_preservation: number; // 0.95
    max_complexity_increase: number; // 1.3
    min_confidence_score: number; // 0.85
    critical_gap_tolerance: number; // 0
  };
  processing_options: {
    enable_exact_deduplication: boolean;
    enable_semantic_deduplication: boolean;
    enable_progressive_deduplication: boolean;
    enable_framework_aware_mode: boolean;
    batch_size: number;
    max_processing_time_ms: number;
  };
  fallback_strategies: {
    on_quality_failure: 'KEEP_SEPARATE' | 'MANUAL_REVIEW' | 'RETRY_WITH_LOWER_THRESHOLD';
    on_compliance_risk: 'ABORT_MERGE' | 'MANUAL_VALIDATION' | 'ADD_SAFEGUARDS';
    on_processing_timeout: 'PARTIAL_RESULTS' | 'RETRY_SMALLER_BATCHES' | 'ABORT';
  };
}

export interface DeduplicationStrategy {
  name: 'EXACT' | 'SEMANTIC' | 'HYBRID' | 'FRAMEWORK_AWARE' | 'PROGRESSIVE';
  description: string;
  threshold: number;
  confidence_requirement: number;
  preservation_requirement: number;
}

export interface DeduplicationResult {
  original_count: number;
  deduplicated_count: number;
  reduction_percentage: number;
  deduplication_summary: DeduplicationSummary;
  harmonized_requirements: ProcessedRequirement[];
  preserved_requirements: ProcessedRequirement[];
  failed_deduplications: FailedDeduplication[];
  quality_assessment: QualityAssessmentResult;
  performance_metrics: DeduplicationPerformanceMetrics;
  audit_trail: DeduplicationAuditEntry[];
}

export interface DeduplicationSummary {
  exact_duplicates_found: number;
  semantic_duplicates_found: number;
  hybrid_duplicates_found: number;
  clusters_processed: number;
  successful_merges: number;
  failed_merges: number;
  frameworks_affected: string[];
  compliance_preservation_average: number;
  processing_strategies_used: string[];
}

export interface FailedDeduplication {
  requirement_ids: string[];
  strategy_attempted: string;
  failure_reason: string;
  quality_issues: string[];
  fallback_action: string;
  retry_recommended: boolean;
}

export interface DeduplicationAuditEntry {
  timestamp: Date;
  action: 'EXACT_MERGE' | 'SEMANTIC_MERGE' | 'HYBRID_MERGE' | 'QUALITY_REJECTION' | 'FALLBACK_APPLIED';
  source_requirements: string[];
  result_requirement?: string;
  preservation_score: number;
  confidence_score: number;
  strategy_used: string;
  audit_notes: string;
}

export interface DeduplicationPerformanceMetrics extends PerformanceMetrics {
  total_comparisons_performed: number;
  cache_hit_rate: number;
  average_merge_time_ms: number;
  quality_validation_time_ms: number;
  exact_deduplication_time_ms: number;
  semantic_analysis_time_ms: number;
  clustering_time_ms: number;
  harmonization_time_ms: number;
}

export class IntelligentDeduplicationEngine {
  private semanticAnalyzer: SmartSemanticAnalyzer;
  private requirementHarmonizer: RequirementHarmonizer;
  private preservationValidator: CompliancePreservationValidator;
  private duplicationAnalyzer: DuplicationAnalyzer;
  private qualityAssessor: MergeQualityAssessor;
  private cache: DeduplicationCache;
  private config: DeduplicationConfig;
  private auditTrail: DeduplicationAuditEntry[];
  private performanceMetrics: DeduplicationPerformanceMetrics;

  constructor(
    analysisConfig: AnalysisConfig,
    harmonizationConfig: HarmonizationConfig,
    deduplicationConfig: DeduplicationConfig
  ) {
    this.config = deduplicationConfig;
    this.auditTrail = [];
    
    // Initialize components
    this.semanticAnalyzer = new SmartSemanticAnalyzer({ 
      config: analysisConfig,
      enable_caching: true,
      performance_monitoring: true,
      debug_mode: false,
      batch_size: deduplicationConfig.processing_options.batch_size
    });
    
    this.requirementHarmonizer = new RequirementHarmonizer(harmonizationConfig);
    this.preservationValidator = new CompliancePreservationValidator(harmonizationConfig);
    this.duplicationAnalyzer = new DuplicationAnalyzer(deduplicationConfig);
    this.qualityAssessor = new MergeQualityAssessor(deduplicationConfig);
    this.cache = new DeduplicationCache();
    
    this.initializeMetrics();
  }

  /**
   * Main entry point for intelligent deduplication
   */
  async deduplicateRequirements(
    requirements: ProcessedRequirement[],
    enableProgressiveMode: boolean = true
  ): Promise<DeduplicationResult> {
    const startTime = performance.now();
    this.resetMetrics();
    this.auditTrail = [];

    if (requirements.length === 0) {
      return this.createEmptyResult();
    }

    console.log(`Starting intelligent deduplication of ${requirements.length} requirements...`);

    try {
      // Step 1: Exact deduplication (fast and safe)
      const exactDeduplicationResult = await this.performExactDeduplication(requirements);
      let currentRequirements = exactDeduplicationResult.remaining_requirements;
      let harmonizedRequirements = [...exactDeduplicationResult.merged_requirements];

      // Step 2: Semantic analysis and clustering
      const semanticAnalysis = await this.performSemanticAnalysis(currentRequirements);
      
      // Step 3: Identify duplication candidates
      const duplicationAnalysis = await this.duplicationAnalyzer.analyzeDuplications(
        semanticAnalysis.processed_requirements,
        semanticAnalysis.similarity_matrix,
        semanticAnalysis.clusters
      );

      // Step 4: Progressive deduplication based on confidence
      if (enableProgressiveMode) {
        const progressiveResult = await this.performProgressiveDeduplication(
          duplicationAnalysis,
          currentRequirements
        );
        harmonizedRequirements.push(...progressiveResult.harmonized_requirements);
        currentRequirements = progressiveResult.remaining_requirements;
      } else {
        // Single-pass deduplication
        const batchResult = await this.performBatchDeduplication(
          duplicationAnalysis,
          currentRequirements
        );
        harmonizedRequirements.push(...batchResult.harmonized_requirements);
        currentRequirements = batchResult.remaining_requirements;
      }

      // Step 5: Final quality assessment
      const overallQualityAssessment = await this.qualityAssessor.assessOverallQuality(
        harmonizedRequirements,
        requirements
      );

      // Step 6: Create comprehensive result
      const processingTime = performance.now() - startTime;
      this.updatePerformanceMetrics(processingTime);

      const result = this.createDeduplicationResult(
        requirements,
        harmonizedRequirements,
        currentRequirements,
        duplicationAnalysis,
        overallQualityAssessment,
        exactDeduplicationResult.failed_merges
      );

      console.log(`Deduplication completed: ${requirements.length} → ${result.deduplicated_count} (${result.reduction_percentage.toFixed(1)}% reduction)`);
      
      return result;

    } catch (error) {
      console.error('Deduplication failed:', error);
      throw new Error(`Intelligent deduplication failed: ${error.message}`);
    }
  }

  /**
   * Perform exact deduplication using hash comparison
   */
  private async performExactDeduplication(
    requirements: ProcessedRequirement[]
  ): Promise<{
    merged_requirements: ProcessedRequirement[];
    remaining_requirements: ProcessedRequirement[];
    failed_merges: FailedDeduplication[];
  }> {
    const startTime = performance.now();
    const hashGroups = new Map<string, ProcessedRequirement[]>();
    const mergedRequirements: ProcessedRequirement[] = [];
    const failedMerges: FailedDeduplication[] = [];

    // Group by hash
    for (const req of requirements) {
      const hash = req.hash;
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      hashGroups.get(hash)!.push(req);
    }

    // Process exact duplicates
    for (const [hash, group] of hashGroups) {
      if (group.length > 1) {
        try {
          // Exact duplicates - merge with high confidence
          const representative = this.selectBestRepresentative(group);
          const mergedRequirement = this.createMergedRequirement(representative, group, 'EXACT');
          
          mergedRequirements.push(mergedRequirement);
          
          this.addAuditEntry({
            timestamp: new Date(),
            action: 'EXACT_MERGE',
            source_requirements: group.map(r => r.id),
            result_requirement: mergedRequirement.id,
            preservation_score: 1.0,
            confidence_score: 1.0,
            strategy_used: 'EXACT',
            audit_notes: `Merged ${group.length} exact duplicates`
          });
        } catch (error) {
          failedMerges.push({
            requirement_ids: group.map(r => r.id),
            strategy_attempted: 'EXACT',
            failure_reason: error.message,
            quality_issues: ['Exact merge failed'],
            fallback_action: 'KEEP_SEPARATE',
            retry_recommended: false
          });
        }
      }
    }

    // Remaining requirements (no exact duplicates)
    const remainingRequirements = Array.from(hashGroups.values())
      .filter(group => group.length === 1)
      .map(group => group[0]);

    this.performanceMetrics.exact_deduplication_time_ms = performance.now() - startTime;
    
    return {
      merged_requirements: mergedRequirements,
      remaining_requirements: remainingRequirements,
      failed_merges: failedMerges
    };
  }

  /**
   * Perform semantic analysis on remaining requirements
   */
  private async performSemanticAnalysis(requirements: ProcessedRequirement[]): Promise<AnalysisResult> {
    const startTime = performance.now();
    
    // Use cache if available
    const cacheKey = this.cache.generateCacheKey('semantic_analysis', requirements.map(r => r.id));
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.performanceMetrics.cache_hit_rate += 1;
      return cached as AnalysisResult;
    }

    const analysis = await this.semanticAnalyzer.analyzeRequirements(
      requirements.map(req => ({
        id: req.id,
        framework: req.framework,
        text: req.original_text,
        category: req.metadata.category,
        domain: req.metadata.domain
      }))
    );

    // Cache the result
    await this.cache.set(cacheKey, analysis, 3600000); // 1 hour TTL

    this.performanceMetrics.semantic_analysis_time_ms = performance.now() - startTime;
    
    return analysis;
  }

  /**
   * Perform progressive deduplication with increasing aggressiveness
   */
  private async performProgressiveDeduplication(
    duplicationAnalysis: DuplicationAnalysisResult,
    requirements: ProcessedRequirement[]
  ): Promise<{
    harmonized_requirements: ProcessedRequirement[];
    remaining_requirements: ProcessedRequirement[];
  }> {
    const harmonizedRequirements: ProcessedRequirement[] = [];
    let remainingRequirements = [...requirements];

    // Progressive thresholds (conservative to aggressive)
    const strategies: DeduplicationStrategy[] = [
      {
        name: 'SEMANTIC',
        description: 'High-confidence semantic matches',
        threshold: this.config.strategies.semantic_threshold,
        confidence_requirement: 0.95,
        preservation_requirement: 0.98
      },
      {
        name: 'HYBRID',
        description: 'Combined semantic and structural matches',
        threshold: this.config.strategies.hybrid_threshold,
        confidence_requirement: 0.90,
        preservation_requirement: 0.96
      },
      {
        name: 'FRAMEWORK_AWARE',
        description: 'Framework-specific similarity analysis',
        threshold: this.config.strategies.clustering_threshold,
        confidence_requirement: 0.85,
        preservation_requirement: 0.95
      }
    ];

    for (const strategy of strategies) {
      console.log(`Applying ${strategy.name} deduplication strategy...`);
      
      const strategyResult = await this.applyDeduplicationStrategy(
        strategy,
        duplicationAnalysis,
        remainingRequirements
      );
      
      harmonizedRequirements.push(...strategyResult.successful_merges);
      remainingRequirements = strategyResult.remaining_requirements;
      
      // Update duplication analysis for remaining requirements
      if (remainingRequirements.length > 1) {
        const updatedAnalysis = await this.duplicationAnalyzer.analyzeDuplications(
          remainingRequirements,
          [], // Will recalculate similarity matrix
          []  // Will recalculate clusters
        );
        duplicationAnalysis = updatedAnalysis;
      }
    }

    return {
      harmonized_requirements: harmonizedRequirements,
      remaining_requirements: remainingRequirements
    };
  }

  /**
   * Apply specific deduplication strategy
   */
  private async applyDeduplicationStrategy(
    strategy: DeduplicationStrategy,
    duplicationAnalysis: DuplicationAnalysisResult,
    requirements: ProcessedRequirement[]
  ): Promise<{
    successful_merges: ProcessedRequirement[];
    remaining_requirements: ProcessedRequirement[];
  }> {
    const successfulMerges: ProcessedRequirement[] = [];
    const processedIds = new Set<string>();

    // Get high-confidence clusters for this strategy
    const targetClusters = duplicationAnalysis.clusters.filter(cluster => 
      cluster.confidence_score >= strategy.confidence_requirement &&
      cluster.similarity_score >= strategy.threshold
    );

    for (const cluster of targetClusters) {
      // Skip if any requirements already processed
      if (cluster.member_ids.some(id => processedIds.has(id))) {
        continue;
      }

      const clusterRequirements = requirements.filter(req => 
        cluster.member_ids.includes(req.id)
      );

      if (clusterRequirements.length < 2) {
        continue;
      }

      try {
        // Assess merge quality before attempting
        const qualityAssessment = await this.qualityAssessor.assessMergeQuality(
          clusterRequirements,
          strategy.threshold
        );

        if (qualityAssessment.overall_score >= strategy.preservation_requirement) {
          // Perform harmonization
          const harmonizationResult = await this.requirementHarmonizer.harmonizeCluster(
            {
              cluster_id: cluster.cluster_id,
              size: cluster.member_ids.length,
              centroid: clusterRequirements[0], // Use first as centroid placeholder
              members: cluster.member_ids,
              quality_score: cluster.confidence_score,
              dominant_concepts: cluster.common_concepts
            },
            clusterRequirements
          );

          if ('id' in harmonizationResult) {
            // Success - create merged requirement
            const mergedRequirement = this.createMergedRequirement(
              clusterRequirements[0],
              clusterRequirements,
              strategy.name,
              harmonizationResult.unified_text
            );

            successfulMerges.push(mergedRequirement);
            clusterRequirements.forEach(req => processedIds.add(req.id));

            this.addAuditEntry({
              timestamp: new Date(),
              action: strategy.name === 'SEMANTIC' ? 'SEMANTIC_MERGE' : 
                     strategy.name === 'HYBRID' ? 'HYBRID_MERGE' : 'SEMANTIC_MERGE',
              source_requirements: clusterRequirements.map(r => r.id),
              result_requirement: mergedRequirement.id,
              preservation_score: harmonizationResult.compliance_preservation_score,
              confidence_score: qualityAssessment.overall_score,
              strategy_used: strategy.name,
              audit_notes: `${strategy.description} - ${clusterRequirements.length} requirements merged`
            });
          }
        } else {
          // Quality assessment failed
          this.addAuditEntry({
            timestamp: new Date(),
            action: 'QUALITY_REJECTION',
            source_requirements: clusterRequirements.map(r => r.id),
            preservation_score: qualityAssessment.overall_score,
            confidence_score: cluster.confidence_score,
            strategy_used: strategy.name,
            audit_notes: `Quality score ${qualityAssessment.overall_score.toFixed(3)} below threshold ${strategy.preservation_requirement}`
          });
        }
      } catch (error) {
        console.warn(`Failed to merge cluster ${cluster.cluster_id}: ${error.message}`);
        
        this.addAuditEntry({
          timestamp: new Date(),
          action: 'QUALITY_REJECTION',
          source_requirements: clusterRequirements.map(r => r.id),
          preservation_score: 0,
          confidence_score: cluster.confidence_score,
          strategy_used: strategy.name,
          audit_notes: `Merge failed: ${error.message}`
        });
      }
    }

    // Remaining requirements (not processed)
    const remainingRequirements = requirements.filter(req => !processedIds.has(req.id));

    return {
      successful_merges: successfulMerges,
      remaining_requirements: remainingRequirements
    };
  }

  /**
   * Perform batch deduplication (non-progressive)
   */
  private async performBatchDeduplication(
    duplicationAnalysis: DuplicationAnalysisResult,
    requirements: ProcessedRequirement[]
  ): Promise<{
    harmonized_requirements: ProcessedRequirement[];
    remaining_requirements: ProcessedRequirement[];
  }> {
    // Use hybrid strategy for batch processing
    const strategy: DeduplicationStrategy = {
      name: 'HYBRID',
      description: 'Batch hybrid deduplication',
      threshold: this.config.strategies.hybrid_threshold,
      confidence_requirement: this.config.quality_requirements.min_confidence_score,
      preservation_requirement: this.config.quality_requirements.min_compliance_preservation
    };

    return this.applyDeduplicationStrategy(strategy, duplicationAnalysis, requirements);
  }

  /**
   * Create merged requirement from multiple source requirements
   */
  private createMergedRequirement(
    representative: ProcessedRequirement,
    sourceRequirements: ProcessedRequirement[],
    strategy: string,
    unifiedText?: string
  ): ProcessedRequirement {
    const mergedId = `merged_${strategy.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Combine metadata
    const combinedFrameworks = Array.from(new Set(sourceRequirements.map(r => r.framework)));
    const combinedKeywords = Array.from(new Set(sourceRequirements.flatMap(r => r.keywords)));
    const avgComplexity = sourceRequirements.reduce((sum, r) => sum + r.metadata.complexity, 0) / sourceRequirements.length;
    const totalWordCount = sourceRequirements.reduce((sum, r) => sum + r.metadata.word_count, 0);

    return {
      id: mergedId,
      framework: combinedFrameworks.join(', '),
      original_text: unifiedText || representative.original_text,
      normalized_text: unifiedText || representative.normalized_text,
      entities: this.mergeEntities(sourceRequirements),
      structure: this.mergeStructures(sourceRequirements),
      metadata: {
        ...representative.metadata,
        complexity: avgComplexity,
        word_count: totalWordCount,
        technical_terms: Array.from(new Set(sourceRequirements.flatMap(r => r.metadata.technical_terms))),
        extracted_at: new Date()
      },
      vector: representative.vector, // Use representative's vector
      keywords: combinedKeywords,
      hash: this.generateMergedHash(sourceRequirements)
    };
  }

  /**
   * Helper methods
   */
  private selectBestRepresentative(requirements: ProcessedRequirement[]): ProcessedRequirement {
    // Select based on completeness and framework priority
    return requirements.reduce((best, current) => {
      const bestScore = best.metadata.complexity + best.keywords.length;
      const currentScore = current.metadata.complexity + current.keywords.length;
      return currentScore > bestScore ? current : best;
    });
  }

  private mergeEntities(requirements: ProcessedRequirement[]): any[] {
    const entityMap = new Map();
    
    for (const req of requirements) {
      for (const entity of req.entities) {
        const key = `${entity.type}_${entity.text.toLowerCase()}`;
        if (!entityMap.has(key) || entityMap.get(key).confidence < entity.confidence) {
          entityMap.set(key, entity);
        }
      }
    }
    
    return Array.from(entityMap.values());
  }

  private mergeStructures(requirements: ProcessedRequirement[]): any {
    const combinedStructure = {
      main_clause: requirements[0].structure.main_clause,
      sub_clauses: Array.from(new Set(requirements.flatMap(r => r.structure.sub_clauses))),
      conditions: Array.from(new Set(requirements.flatMap(r => r.structure.conditions))),
      exceptions: Array.from(new Set(requirements.flatMap(r => r.structure.exceptions))),
      references: Array.from(new Set(requirements.flatMap(r => r.structure.references))),
      action_verbs: Array.from(new Set(requirements.flatMap(r => r.structure.action_verbs))),
      domain_context: requirements[0].structure.domain_context
    };
    
    return combinedStructure;
  }

  private generateMergedHash(requirements: ProcessedRequirement[]): string {
    const combinedText = requirements.map(r => r.normalized_text).sort().join('||');
    return btoa(combinedText).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private addAuditEntry(entry: DeduplicationAuditEntry): void {
    this.auditTrail.push(entry);
  }

  private createEmptyResult(): DeduplicationResult {
    return {
      original_count: 0,
      deduplicated_count: 0,
      reduction_percentage: 0,
      deduplication_summary: {
        exact_duplicates_found: 0,
        semantic_duplicates_found: 0,
        hybrid_duplicates_found: 0,
        clusters_processed: 0,
        successful_merges: 0,
        failed_merges: 0,
        frameworks_affected: [],
        compliance_preservation_average: 0,
        processing_strategies_used: []
      },
      harmonized_requirements: [],
      preserved_requirements: [],
      failed_deduplications: [],
      quality_assessment: this.qualityAssessor.createEmptyAssessment(),
      performance_metrics: this.performanceMetrics,
      audit_trail: []
    };
  }

  private createDeduplicationResult(
    originalRequirements: ProcessedRequirement[],
    harmonizedRequirements: ProcessedRequirement[],
    preservedRequirements: ProcessedRequirement[],
    duplicationAnalysis: DuplicationAnalysisResult,
    qualityAssessment: QualityAssessmentResult,
    failedMerges: FailedDeduplication[]
  ): DeduplicationResult {
    const deduplicatedCount = harmonizedRequirements.length + preservedRequirements.length;
    const reductionPercentage = ((originalRequirements.length - deduplicatedCount) / originalRequirements.length) * 100;

    const strategiesUsed = Array.from(new Set(this.auditTrail.map(entry => entry.strategy_used)));
    const frameworksAffected = Array.from(new Set(originalRequirements.map(r => r.framework)));
    
    const preservationScores = this.auditTrail
      .filter(entry => entry.preservation_score > 0)
      .map(entry => entry.preservation_score);
    const avgPreservation = preservationScores.length > 0 
      ? preservationScores.reduce((sum, score) => sum + score, 0) / preservationScores.length
      : 1.0;

    return {
      original_count: originalRequirements.length,
      deduplicated_count: deduplicatedCount,
      reduction_percentage: reductionPercentage,
      deduplication_summary: {
        exact_duplicates_found: this.auditTrail.filter(e => e.action === 'EXACT_MERGE').length,
        semantic_duplicates_found: this.auditTrail.filter(e => e.action === 'SEMANTIC_MERGE').length,
        hybrid_duplicates_found: this.auditTrail.filter(e => e.action === 'HYBRID_MERGE').length,
        clusters_processed: duplicationAnalysis.total_clusters,
        successful_merges: harmonizedRequirements.length,
        failed_merges: failedMerges.length,
        frameworks_affected: frameworksAffected,
        compliance_preservation_average: avgPreservation,
        processing_strategies_used: strategiesUsed
      },
      harmonized_requirements: harmonizedRequirements,
      preserved_requirements: preservedRequirements,
      failed_deduplications: failedMerges,
      quality_assessment: qualityAssessment,
      performance_metrics: this.performanceMetrics,
      audit_trail: this.auditTrail
    };
  }

  private initializeMetrics(): void {
    this.performanceMetrics = {
      processing_time: 0,
      cache_hit_rate: 0,
      total_requirements_processed: 0,
      average_similarity_computation_time: 0,
      memory_usage: 0,
      errors_encountered: 0,
      total_comparisons_performed: 0,
      average_merge_time_ms: 0,
      quality_validation_time_ms: 0,
      exact_deduplication_time_ms: 0,
      semantic_analysis_time_ms: 0,
      clustering_time_ms: 0,
      harmonization_time_ms: 0
    };
  }

  private resetMetrics(): void {
    this.initializeMetrics();
  }

  private updatePerformanceMetrics(totalProcessingTime: number): void {
    this.performanceMetrics.processing_time = totalProcessingTime;
    this.performanceMetrics.total_requirements_processed = this.auditTrail.length;
  }

  /**
   * Get default deduplication configuration
   */
  static getDefaultConfig(): DeduplicationConfig {
    return {
      strategies: {
        exact_threshold: 0.98,
        semantic_threshold: 0.85,
        hybrid_threshold: 0.75,
        clustering_threshold: 0.65
      },
      quality_requirements: {
        min_compliance_preservation: 0.95,
        max_complexity_increase: 1.3,
        min_confidence_score: 0.85,
        critical_gap_tolerance: 0
      },
      processing_options: {
        enable_exact_deduplication: true,
        enable_semantic_deduplication: true,
        enable_progressive_deduplication: true,
        enable_framework_aware_mode: true,
        batch_size: 50,
        max_processing_time_ms: 300000 // 5 minutes
      },
      fallback_strategies: {
        on_quality_failure: 'MANUAL_REVIEW',
        on_compliance_risk: 'ABORT_MERGE',
        on_processing_timeout: 'PARTIAL_RESULTS'
      }
    };
  }
}