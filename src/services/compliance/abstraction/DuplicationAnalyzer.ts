/**
 * DuplicationAnalyzer.ts
 * Identifies duplicate pairs and requirement clusters with advanced similarity analysis
 * Calculates duplication confidence scores and generates comprehensive statistics
 */

import {
  ProcessedRequirement,
  SimilarityResult,
  ClusterInfo,
  ComplianceEntity
} from './types';
import { DeduplicationConfig } from './IntelligentDeduplicationEngine';

export interface DuplicationPair {
  source_id: string;
  target_id: string;
  similarity_type: 'EXACT' | 'SEMANTIC' | 'STRUCTURAL' | 'CONTEXTUAL' | 'HYBRID';
  similarity_score: number;
  confidence_score: number;
  duplication_probability: number;
  merge_recommendation: 'MERGE' | 'LINK' | 'KEEP_SEPARATE' | 'MANUAL_REVIEW';
  critical_differences: CriticalDifference[];
  common_elements: CommonElement[];
  framework_compatibility: FrameworkCompatibility;
}

export interface DuplicationCluster {
  cluster_id: string;
  member_ids: string[];
  similarity_score: number;
  confidence_score: number;
  cluster_type: 'EXACT_DUPLICATES' | 'SEMANTIC_SIMILAR' | 'STRUCTURAL_SIMILAR' | 'MIXED_SIMILARITY';
  dominant_framework: string;
  common_concepts: string[];
  merge_complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  preservation_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CriticalDifference {
  difference_type: 'SCOPE_VARIATION' | 'FREQUENCY_DIFFERENCE' | 'CONTROL_STRENGTH' | 'EVIDENCE_REQUIREMENT' | 'COMPLIANCE_LEVEL';
  source_value: string;
  target_value: string;
  impact_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  merge_blocker: boolean;
  resolution_suggestion: string;
}

export interface CommonElement {
  element_type: 'CONTROL' | 'PROCESS' | 'POLICY' | 'DOMAIN' | 'ENTITY' | 'KEYWORD';
  element_value: string;
  frequency_in_cluster: number;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  preservation_priority: number;
}

export interface FrameworkCompatibility {
  source_framework: string;
  target_framework: string;
  compatibility_score: number;
  cross_framework_merge_safe: boolean;
  compliance_implications: string[];
  harmonization_notes: string[];
}

export interface DuplicationAnalysisResult {
  total_requirements: number;
  total_pairs_analyzed: number;
  duplicate_pairs: DuplicationPair[];
  clusters: DuplicationCluster[];
  exact_duplicates: number;
  semantic_duplicates: number;
  structural_duplicates: number;
  hybrid_duplicates: number;
  total_clusters: number;
  average_cluster_size: number;
  highest_similarity_pair: DuplicationPair | null;
  framework_distribution: FrameworkDistribution;
  duplication_statistics: DuplicationStatistics;
  processing_recommendations: ProcessingRecommendation[];
}

export interface FrameworkDistribution {
  framework_counts: { [framework: string]: number };
  cross_framework_pairs: number;
  same_framework_pairs: number;
  framework_compatibility_matrix: { [key: string]: number };
}

export interface DuplicationStatistics {
  duplicate_percentage: number;
  average_similarity_score: number;
  confidence_distribution: { [range: string]: number };
  merge_recommendation_distribution: { [recommendation: string]: number };
  critical_differences_count: number;
  high_risk_merges: number;
  processing_complexity_distribution: { [complexity: string]: number };
}

export interface ProcessingRecommendation {
  recommendation_type: 'BATCH_PROCESS' | 'SEQUENTIAL_PROCESS' | 'MANUAL_REVIEW_REQUIRED' | 'SKIP_PROCESSING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  affected_clusters: string[];
  reasoning: string;
  action_items: string[];
  estimated_processing_time: number;
}

export class DuplicationAnalyzer {
  private config: DeduplicationConfig;
  private frameworkCompatibilityRules: Map<string, Map<string, number>>;
  private criticalTerms: Set<string>;
  private complianceKeywords: Map<string, number>;

  constructor(config: DeduplicationConfig) {
    this.config = config;
    this.initializeFrameworkCompatibility();
    this.initializeCriticalTerms();
    this.initializeComplianceKeywords();
  }

  /**
   * Main analysis method to identify duplications and clusters
   */
  async analyzeDuplications(
    requirements: ProcessedRequirement[],
    similarityMatrix: SimilarityResult[][],
    existingClusters: ClusterInfo[]
  ): Promise<DuplicationAnalysisResult> {
    console.log(`Analyzing duplications for ${requirements.length} requirements...`);

    if (requirements.length === 0) {
      return this.createEmptyResult();
    }

    // Step 1: Identify duplicate pairs
    const duplicatePairs = await this.identifyDuplicatePairs(requirements, similarityMatrix);

    // Step 2: Create enhanced clusters from pairs and existing clusters
    const enhancedClusters = await this.createEnhancedClusters(duplicatePairs, requirements, existingClusters);

    // Step 3: Analyze framework distribution
    const frameworkDistribution = this.analyzeFrameworkDistribution(duplicatePairs, requirements);

    // Step 4: Calculate comprehensive statistics
    const statistics = this.calculateDuplicationStatistics(duplicatePairs, enhancedClusters);

    // Step 5: Generate processing recommendations
    const recommendations = this.generateProcessingRecommendations(enhancedClusters, duplicatePairs);

    return {
      total_requirements: requirements.length,
      total_pairs_analyzed: duplicatePairs.length,
      duplicate_pairs: duplicatePairs,
      clusters: enhancedClusters,
      exact_duplicates: duplicatePairs.filter(p => p.similarity_type === 'EXACT').length,
      semantic_duplicates: duplicatePairs.filter(p => p.similarity_type === 'SEMANTIC').length,
      structural_duplicates: duplicatePairs.filter(p => p.similarity_type === 'STRUCTURAL').length,
      hybrid_duplicates: duplicatePairs.filter(p => p.similarity_type === 'HYBRID').length,
      total_clusters: enhancedClusters.length,
      average_cluster_size: enhancedClusters.length > 0 
        ? enhancedClusters.reduce((sum, c) => sum + c.member_ids.length, 0) / enhancedClusters.length 
        : 0,
      highest_similarity_pair: this.findHighestSimilarityPair(duplicatePairs),
      framework_distribution: frameworkDistribution,
      duplication_statistics: statistics,
      processing_recommendations: recommendations
    };
  }

  /**
   * Identify duplicate pairs from requirements and similarity matrix
   */
  private async identifyDuplicatePairs(
    requirements: ProcessedRequirement[],
    similarityMatrix: SimilarityResult[][]
  ): Promise<DuplicationPair[]> {
    const pairs: DuplicationPair[] = [];
    const reqMap = new Map(requirements.map(req => [req.id, req]));

    // If no similarity matrix provided, calculate pairwise similarities
    if (similarityMatrix.length === 0) {
      return this.calculatePairwiseSimilarities(requirements);
    }

    // Process similarity matrix
    for (let i = 0; i < similarityMatrix.length; i++) {
      for (let j = i + 1; j < similarityMatrix[i].length; j++) {
        const similarity = similarityMatrix[i][j];
        
        if (similarity.combined_score >= this.config.strategies.clustering_threshold) {
          const sourceReq = reqMap.get(similarity.source_id);
          const targetReq = reqMap.get(similarity.target_id);
          
          if (sourceReq && targetReq) {
            const pair = await this.createDuplicationPair(sourceReq, targetReq, similarity);
            pairs.push(pair);
          }
        }
      }
    }

    return pairs.sort((a, b) => b.similarity_score - a.similarity_score);
  }

  /**
   * Calculate pairwise similarities when matrix not provided
   */
  private async calculatePairwiseSimilarities(requirements: ProcessedRequirement[]): Promise<DuplicationPair[]> {
    const pairs: DuplicationPair[] = [];

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const sourceReq = requirements[i];
        const targetReq = requirements[j];

        // Quick exact match check
        if (sourceReq.hash === targetReq.hash) {
          const exactPair = await this.createDuplicationPair(sourceReq, targetReq, {
            source_id: sourceReq.id,
            target_id: targetReq.id,
            semantic_score: 1.0,
            structural_score: 1.0,
            contextual_score: 1.0,
            combined_score: 1.0,
            confidence: 1.0,
            explanation: 'Exact hash match',
            clusters: []
          });
          pairs.push(exactPair);
          continue;
        }

        // Calculate semantic similarity
        const semanticSimilarity = this.calculateSemanticSimilarity(sourceReq, targetReq);
        const structuralSimilarity = this.calculateStructuralSimilarity(sourceReq, targetReq);
        const contextualSimilarity = this.calculateContextualSimilarity(sourceReq, targetReq);
        
        const combinedScore = (semanticSimilarity * 0.5) + (structuralSimilarity * 0.3) + (contextualSimilarity * 0.2);

        if (combinedScore >= this.config.strategies.clustering_threshold) {
          const similarity: SimilarityResult = {
            source_id: sourceReq.id,
            target_id: targetReq.id,
            semantic_score: semanticSimilarity,
            structural_score: structuralSimilarity,
            contextual_score: contextualSimilarity,
            combined_score: combinedScore,
            confidence: Math.min(semanticSimilarity, structuralSimilarity, contextualSimilarity),
            explanation: 'Calculated similarity',
            clusters: []
          };

          const pair = await this.createDuplicationPair(sourceReq, targetReq, similarity);
          pairs.push(pair);
        }
      }
    }

    return pairs.sort((a, b) => b.similarity_score - a.similarity_score);
  }

  /**
   * Create detailed duplication pair analysis
   */
  private async createDuplicationPair(
    sourceReq: ProcessedRequirement,
    targetReq: ProcessedRequirement,
    similarity: SimilarityResult
  ): Promise<DuplicationPair> {
    // Determine similarity type
    const similarityType = this.determineSimilarityType(similarity);
    
    // Calculate duplication probability
    const duplicationProbability = this.calculateDuplicationProbability(similarity, sourceReq, targetReq);
    
    // Analyze critical differences
    const criticalDifferences = this.identifyCriticalDifferences(sourceReq, targetReq);
    
    // Find common elements
    const commonElements = this.extractCommonElements(sourceReq, targetReq);
    
    // Assess framework compatibility
    const frameworkCompatibility = this.assessFrameworkCompatibility(sourceReq, targetReq);
    
    // Generate merge recommendation
    const mergeRecommendation = this.generateMergeRecommendation(
      similarity,
      duplicationProbability,
      criticalDifferences,
      frameworkCompatibility
    );

    return {
      source_id: sourceReq.id,
      target_id: targetReq.id,
      similarity_type: similarityType,
      similarity_score: similarity.combined_score,
      confidence_score: similarity.confidence,
      duplication_probability: duplicationProbability,
      merge_recommendation: mergeRecommendation,
      critical_differences: criticalDifferences,
      common_elements: commonElements,
      framework_compatibility: frameworkCompatibility
    };
  }

  /**
   * Create enhanced clusters from duplicate pairs
   */
  private async createEnhancedClusters(
    duplicatePairs: DuplicationPair[],
    requirements: ProcessedRequirement[],
    existingClusters: ClusterInfo[]
  ): Promise<DuplicationCluster[]> {
    const clusters: DuplicationCluster[] = [];
    const processed = new Set<string>();

    // Create clusters from high-confidence pairs
    const highConfidencePairs = duplicatePairs.filter(p => 
      p.confidence_score >= this.config.quality_requirements.min_confidence_score
    );

    // Group connected pairs into clusters
    const connectedGroups = this.findConnectedGroups(highConfidencePairs);

    for (const group of connectedGroups) {
      if (group.length < 2) continue;

      const groupRequirements = requirements.filter(req => group.includes(req.id));
      const cluster = await this.createEnhancedCluster(group, groupRequirements, duplicatePairs);
      clusters.push(cluster);
      
      group.forEach(id => processed.add(id));
    }

    // Add remaining requirements as individual clusters if they have duplicates
    for (const pair of duplicatePairs) {
      if (!processed.has(pair.source_id) && !processed.has(pair.target_id)) {
        const sourceReq = requirements.find(r => r.id === pair.source_id);
        const targetReq = requirements.find(r => r.id === pair.target_id);
        
        if (sourceReq && targetReq) {
          const cluster = await this.createEnhancedCluster(
            [pair.source_id, pair.target_id],
            [sourceReq, targetReq],
            [pair]
          );
          clusters.push(cluster);
          processed.add(pair.source_id);
          processed.add(pair.target_id);
        }
      }
    }

    return clusters.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Create enhanced cluster with detailed analysis
   */
  private async createEnhancedCluster(
    memberIds: string[],
    requirements: ProcessedRequirement[],
    relevantPairs: DuplicationPair[]
  ): Promise<DuplicationCluster> {
    // Calculate cluster similarity and confidence
    const clusterPairs = relevantPairs.filter(p => 
      memberIds.includes(p.source_id) && memberIds.includes(p.target_id)
    );
    
    const avgSimilarity = clusterPairs.length > 0
      ? clusterPairs.reduce((sum, p) => sum + p.similarity_score, 0) / clusterPairs.length
      : 0;
    
    const avgConfidence = clusterPairs.length > 0
      ? clusterPairs.reduce((sum, p) => sum + p.confidence_score, 0) / clusterPairs.length
      : 0;

    // Determine cluster type
    const clusterType = this.determineClusterType(clusterPairs);
    
    // Find dominant framework
    const frameworkCounts = requirements.reduce((counts, req) => {
      counts[req.framework] = (counts[req.framework] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
    
    const dominantFramework = Object.keys(frameworkCounts).reduce((a, b) => 
      frameworkCounts[a] > frameworkCounts[b] ? a : b
    );

    // Extract common concepts
    const commonConcepts = this.extractClusterCommonConcepts(requirements);
    
    // Assess merge complexity and preservation risk
    const mergeComplexity = this.assessMergeComplexity(requirements, clusterPairs);
    const preservationRisk = this.assessPreservationRisk(requirements, clusterPairs);

    return {
      cluster_id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      member_ids: memberIds,
      similarity_score: avgSimilarity,
      confidence_score: avgConfidence,
      cluster_type: clusterType,
      dominant_framework: dominantFramework,
      common_concepts: commonConcepts,
      merge_complexity: mergeComplexity,
      preservation_risk: preservationRisk
    };
  }

  /**
   * Helper methods for similarity and analysis calculations
   */
  private calculateSemanticSimilarity(req1: ProcessedRequirement, req2: ProcessedRequirement): number {
    // Calculate keyword overlap
    const keywords1 = new Set(req1.keywords.map(k => k.toLowerCase()));
    const keywords2 = new Set(req2.keywords.map(k => k.toLowerCase()));
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);
    
    const keywordSimilarity = intersection.size / union.size;

    // Calculate entity overlap
    const entities1 = req1.entities.map(e => e.text.toLowerCase());
    const entities2 = req2.entities.map(e => e.text.toLowerCase());
    const entityIntersection = entities1.filter(e => entities2.includes(e));
    const entitySimilarity = entityIntersection.length / Math.max(entities1.length, entities2.length, 1);

    return (keywordSimilarity * 0.6) + (entitySimilarity * 0.4);
  }

  private calculateStructuralSimilarity(req1: ProcessedRequirement, req2: ProcessedRequirement): number {
    const struct1 = req1.structure;
    const struct2 = req2.structure;

    // Compare structural elements
    const clausesSimilarity = this.calculateArraySimilarity(struct1.sub_clauses, struct2.sub_clauses);
    const conditionsSimilarity = this.calculateArraySimilarity(struct1.conditions, struct2.conditions);
    const actionVerbsSimilarity = this.calculateArraySimilarity(struct1.action_verbs, struct2.action_verbs);

    return (clausesSimilarity * 0.4) + (conditionsSimilarity * 0.3) + (actionVerbsSimilarity * 0.3);
  }

  private calculateContextualSimilarity(req1: ProcessedRequirement, req2: ProcessedRequirement): number {
    // Compare domain and category
    const domainMatch = req1.metadata.domain === req2.metadata.domain ? 1.0 : 0.0;
    const categoryMatch = req1.metadata.category === req2.metadata.category ? 1.0 : 0.0;
    const frameworkMatch = req1.framework === req2.framework ? 1.0 : 0.3;

    return (domainMatch * 0.4) + (categoryMatch * 0.3) + (frameworkMatch * 0.3);
  }

  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1.0;
    if (arr1.length === 0 || arr2.length === 0) return 0.0;

    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));
    const intersection = new Set([...set1].filter(s => set2.has(s)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  private determineSimilarityType(similarity: SimilarityResult): 'EXACT' | 'SEMANTIC' | 'STRUCTURAL' | 'CONTEXTUAL' | 'HYBRID' {
    if (similarity.combined_score >= this.config.strategies.exact_threshold) {
      return 'EXACT';
    } else if (similarity.semantic_score >= this.config.strategies.semantic_threshold) {
      return 'SEMANTIC';
    } else if (similarity.structural_score >= this.config.strategies.semantic_threshold) {
      return 'STRUCTURAL';
    } else if (similarity.contextual_score >= this.config.strategies.semantic_threshold) {
      return 'CONTEXTUAL';
    } else {
      return 'HYBRID';
    }
  }

  private calculateDuplicationProbability(
    similarity: SimilarityResult,
    sourceReq: ProcessedRequirement,
    targetReq: ProcessedRequirement
  ): number {
    // Base probability from similarity
    let probability = similarity.combined_score;

    // Adjust for exact matches
    if (sourceReq.hash === targetReq.hash) {
      probability = 1.0;
    }

    // Adjust for framework compatibility
    const frameworkBonus = sourceReq.framework === targetReq.framework ? 0.1 : 0.0;
    
    // Adjust for domain compatibility
    const domainBonus = sourceReq.metadata.domain === targetReq.metadata.domain ? 0.05 : 0.0;

    return Math.min(1.0, probability + frameworkBonus + domainBonus);
  }

  private identifyCriticalDifferences(
    sourceReq: ProcessedRequirement,
    targetReq: ProcessedRequirement
  ): CriticalDifference[] {
    const differences: CriticalDifference[] = [];

    // Check for scope variations
    const scopeDiff = this.detectScopeDifferences(sourceReq, targetReq);
    if (scopeDiff) differences.push(scopeDiff);

    // Check for control strength differences
    const controlDiff = this.detectControlStrengthDifferences(sourceReq, targetReq);
    if (controlDiff) differences.push(controlDiff);

    // Check for evidence requirement differences
    const evidenceDiff = this.detectEvidenceDifferences(sourceReq, targetReq);
    if (evidenceDiff) differences.push(evidenceDiff);

    return differences;
  }

  private detectScopeDifferences(sourceReq: ProcessedRequirement, targetReq: ProcessedRequirement): CriticalDifference | null {
    const scopeIndicators = ['all', 'every', 'each', 'entire', 'complete', 'comprehensive'];
    
    const sourceScope = scopeIndicators.filter(indicator => 
      sourceReq.normalized_text.toLowerCase().includes(indicator)
    );
    const targetScope = scopeIndicators.filter(indicator => 
      targetReq.normalized_text.toLowerCase().includes(indicator)
    );

    if (sourceScope.length !== targetScope.length || 
        !sourceScope.every(scope => targetScope.includes(scope))) {
      return {
        difference_type: 'SCOPE_VARIATION',
        source_value: sourceScope.join(', ') || 'no scope indicators',
        target_value: targetScope.join(', ') || 'no scope indicators',
        impact_severity: 'MEDIUM',
        merge_blocker: false,
        resolution_suggestion: 'Use broadest scope or combine scope requirements'
      };
    }

    return null;
  }

  private detectControlStrengthDifferences(sourceReq: ProcessedRequirement, targetReq: ProcessedRequirement): CriticalDifference | null {
    const strongTerms = ['shall', 'must', 'required', 'mandatory'];
    const weakTerms = ['should', 'may', 'consider', 'recommend'];

    const sourceStrong = strongTerms.some(term => sourceReq.normalized_text.toLowerCase().includes(term));
    const targetStrong = strongTerms.some(term => targetReq.normalized_text.toLowerCase().includes(term));

    if (sourceStrong !== targetStrong) {
      return {
        difference_type: 'CONTROL_STRENGTH',
        source_value: sourceStrong ? 'mandatory language' : 'optional language',
        target_value: targetStrong ? 'mandatory language' : 'optional language',
        impact_severity: 'HIGH',
        merge_blocker: true,
        resolution_suggestion: 'Use strongest control language to maintain compliance rigor'
      };
    }

    return null;
  }

  private detectEvidenceDifferences(sourceReq: ProcessedRequirement, targetReq: ProcessedRequirement): CriticalDifference | null {
    const evidenceTerms = ['evidence', 'document', 'record', 'log', 'audit trail'];
    
    const sourceEvidence = evidenceTerms.filter(term => 
      sourceReq.normalized_text.toLowerCase().includes(term)
    );
    const targetEvidence = evidenceTerms.filter(term => 
      targetReq.normalized_text.toLowerCase().includes(term)
    );

    if (sourceEvidence.length !== targetEvidence.length) {
      return {
        difference_type: 'EVIDENCE_REQUIREMENT',
        source_value: sourceEvidence.join(', ') || 'no evidence requirements',
        target_value: targetEvidence.join(', ') || 'no evidence requirements',
        impact_severity: 'MEDIUM',
        merge_blocker: false,
        resolution_suggestion: 'Combine all evidence requirements to ensure comprehensive documentation'
      };
    }

    return null;
  }

  private extractCommonElements(sourceReq: ProcessedRequirement, targetReq: ProcessedRequirement): CommonElement[] {
    const commonElements: CommonElement[] = [];

    // Common keywords
    const commonKeywords = sourceReq.keywords.filter(k => 
      targetReq.keywords.includes(k)
    );
    
    commonKeywords.forEach(keyword => {
      commonElements.push({
        element_type: 'KEYWORD',
        element_value: keyword,
        frequency_in_cluster: 2,
        criticality: this.criticalTerms.has(keyword.toLowerCase()) ? 'HIGH' : 'MEDIUM',
        preservation_priority: this.complianceKeywords.get(keyword.toLowerCase()) || 1
      });
    });

    // Common entities
    const sourceEntityTexts = sourceReq.entities.map(e => e.text.toLowerCase());
    const targetEntityTexts = targetReq.entities.map(e => e.text.toLowerCase());
    const commonEntityTexts = sourceEntityTexts.filter(text => targetEntityTexts.includes(text));

    commonEntityTexts.forEach(entityText => {
      const sourceEntity = sourceReq.entities.find(e => e.text.toLowerCase() === entityText);
      if (sourceEntity) {
        commonElements.push({
          element_type: sourceEntity.type as any,
          element_value: sourceEntity.text,
          frequency_in_cluster: 2,
          criticality: sourceEntity.criticality,
          preservation_priority: sourceEntity.criticality === 'CRITICAL' ? 10 : 
                                 sourceEntity.criticality === 'HIGH' ? 8 : 5
        });
      }
    });

    return commonElements.sort((a, b) => b.preservation_priority - a.preservation_priority);
  }

  private assessFrameworkCompatibility(
    sourceReq: ProcessedRequirement,
    targetReq: ProcessedRequirement
  ): FrameworkCompatibility {
    const compatibilityScore = this.frameworkCompatibilityRules
      .get(sourceReq.framework)?.get(targetReq.framework) || 0.5;

    const crossFrameworkSafe = compatibilityScore >= 0.7;

    return {
      source_framework: sourceReq.framework,
      target_framework: targetReq.framework,
      compatibility_score: compatibilityScore,
      cross_framework_merge_safe: crossFrameworkSafe,
      compliance_implications: crossFrameworkSafe 
        ? ['Cross-framework merge appears safe']
        : ['Potential compliance gaps in cross-framework merge', 'Manual review recommended'],
      harmonization_notes: crossFrameworkSafe
        ? ['Frameworks have compatible requirements']
        : ['Frameworks may have different compliance interpretations']
    };
  }

  private generateMergeRecommendation(
    similarity: SimilarityResult,
    duplicationProbability: number,
    criticalDifferences: CriticalDifference[],
    frameworkCompatibility: FrameworkCompatibility
  ): 'MERGE' | 'LINK' | 'KEEP_SEPARATE' | 'MANUAL_REVIEW' {
    // Check for blocking critical differences
    const hasBlockingDifferences = criticalDifferences.some(diff => diff.merge_blocker);
    if (hasBlockingDifferences) {
      return 'KEEP_SEPARATE';
    }

    // High confidence exact/semantic matches
    if (duplicationProbability >= this.config.strategies.semantic_threshold && 
        similarity.confidence >= this.config.quality_requirements.min_confidence_score) {
      return frameworkCompatibility.cross_framework_merge_safe ? 'MERGE' : 'MANUAL_REVIEW';
    }

    // Medium confidence matches
    if (duplicationProbability >= this.config.strategies.hybrid_threshold) {
      return criticalDifferences.length === 0 ? 'LINK' : 'MANUAL_REVIEW';
    }

    // Low confidence or risky matches
    return 'KEEP_SEPARATE';
  }

  /**
   * Additional helper methods for cluster analysis
   */
  private findConnectedGroups(pairs: DuplicationPair[]): string[][] {
    const graph = new Map<string, Set<string>>();
    const visited = new Set<string>();
    const groups: string[][] = [];

    // Build adjacency graph
    for (const pair of pairs) {
      if (!graph.has(pair.source_id)) graph.set(pair.source_id, new Set());
      if (!graph.has(pair.target_id)) graph.set(pair.target_id, new Set());
      
      graph.get(pair.source_id)!.add(pair.target_id);
      graph.get(pair.target_id)!.add(pair.source_id);
    }

    // DFS to find connected components
    const dfs = (nodeId: string, currentGroup: string[]) => {
      visited.add(nodeId);
      currentGroup.push(nodeId);
      
      const neighbors = graph.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, currentGroup);
        }
      }
    };

    // Find all connected components
    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        const group: string[] = [];
        dfs(nodeId, group);
        if (group.length > 1) {
          groups.push(group);
        }
      }
    }

    return groups;
  }

  private determineClusterType(pairs: DuplicationPair[]): 'EXACT_DUPLICATES' | 'SEMANTIC_SIMILAR' | 'STRUCTURAL_SIMILAR' | 'MIXED_SIMILARITY' {
    if (pairs.length === 0) return 'MIXED_SIMILARITY';

    const types = new Set(pairs.map(p => p.similarity_type));
    
    if (types.has('EXACT')) return 'EXACT_DUPLICATES';
    if (types.size === 1) {
      if (types.has('SEMANTIC')) return 'SEMANTIC_SIMILAR';
      if (types.has('STRUCTURAL')) return 'STRUCTURAL_SIMILAR';
    }
    
    return 'MIXED_SIMILARITY';
  }

  private extractClusterCommonConcepts(requirements: ProcessedRequirement[]): string[] {
    const conceptCounts = new Map<string, number>();
    
    for (const req of requirements) {
      req.keywords.forEach(keyword => {
        conceptCounts.set(keyword, (conceptCounts.get(keyword) || 0) + 1);
      });
    }

    // Return concepts that appear in majority of requirements
    const threshold = Math.ceil(requirements.length * 0.6);
    return Array.from(conceptCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([concept, _]) => concept)
      .slice(0, 10);
  }

  private assessMergeComplexity(requirements: ProcessedRequirement[], pairs: DuplicationPair[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    const avgComplexity = requirements.reduce((sum, req) => sum + req.metadata.complexity, 0) / requirements.length;
    const criticalDifferencesCount = pairs.reduce((sum, pair) => sum + pair.critical_differences.length, 0);
    const frameworkCount = new Set(requirements.map(req => req.framework)).size;

    if (avgComplexity > 8 || criticalDifferencesCount > 5 || frameworkCount > 3) return 'VERY_HIGH';
    if (avgComplexity > 6 || criticalDifferencesCount > 3 || frameworkCount > 2) return 'HIGH';
    if (avgComplexity > 4 || criticalDifferencesCount > 1 || frameworkCount > 1) return 'MEDIUM';
    
    return 'LOW';
  }

  private assessPreservationRisk(requirements: ProcessedRequirement[], pairs: DuplicationPair[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const hasBlockingDifferences = pairs.some(pair => 
      pair.critical_differences.some(diff => diff.merge_blocker)
    );
    
    if (hasBlockingDifferences) return 'CRITICAL';

    const highSeverityDiffs = pairs.reduce((count, pair) => 
      count + pair.critical_differences.filter(diff => diff.impact_severity === 'HIGH').length, 0
    );

    const unsafeFrameworkMerges = pairs.filter(pair => 
      !pair.framework_compatibility.cross_framework_merge_safe
    ).length;

    if (highSeverityDiffs > 2 || unsafeFrameworkMerges > 0) return 'HIGH';
    if (highSeverityDiffs > 0) return 'MEDIUM';
    
    return 'LOW';
  }

  private analyzeFrameworkDistribution(pairs: DuplicationPair[], requirements: ProcessedRequirement[]): FrameworkDistribution {
    const frameworkCounts: { [framework: string]: number } = {};
    
    requirements.forEach(req => {
      frameworkCounts[req.framework] = (frameworkCounts[req.framework] || 0) + 1;
    });

    const crossFrameworkPairs = pairs.filter(pair => 
      pair.framework_compatibility.source_framework !== pair.framework_compatibility.target_framework
    ).length;

    const sameFrameworkPairs = pairs.length - crossFrameworkPairs;

    const frameworks = Object.keys(frameworkCounts);
    const compatibilityMatrix: { [key: string]: number } = {};
    
    for (const fw1 of frameworks) {
      for (const fw2 of frameworks) {
        const key = `${fw1}_${fw2}`;
        compatibilityMatrix[key] = this.frameworkCompatibilityRules.get(fw1)?.get(fw2) || 0.5;
      }
    }

    return {
      framework_counts: frameworkCounts,
      cross_framework_pairs: crossFrameworkPairs,
      same_framework_pairs: sameFrameworkPairs,
      framework_compatibility_matrix: compatibilityMatrix
    };
  }

  private calculateDuplicationStatistics(pairs: DuplicationPair[], clusters: DuplicationCluster[]): DuplicationStatistics {
    const totalRequirements = new Set([
      ...pairs.map(p => p.source_id),
      ...pairs.map(p => p.target_id)
    ]).size;

    const duplicatePercentage = pairs.length > 0 ? (pairs.length / totalRequirements) * 100 : 0;
    const averageSimilarity = pairs.length > 0 
      ? pairs.reduce((sum, p) => sum + p.similarity_score, 0) / pairs.length 
      : 0;

    // Confidence distribution
    const confidenceRanges = { 'high': 0, 'medium': 0, 'low': 0 };
    pairs.forEach(pair => {
      if (pair.confidence_score >= 0.8) confidenceRanges.high++;
      else if (pair.confidence_score >= 0.6) confidenceRanges.medium++;
      else confidenceRanges.low++;
    });

    // Merge recommendation distribution
    const mergeRecDistribution = { 'MERGE': 0, 'LINK': 0, 'KEEP_SEPARATE': 0, 'MANUAL_REVIEW': 0 };
    pairs.forEach(pair => {
      mergeRecDistribution[pair.merge_recommendation]++;
    });

    // Critical differences and high risk merges
    const criticalDifferencesCount = pairs.reduce((sum, pair) => sum + pair.critical_differences.length, 0);
    const highRiskMerges = clusters.filter(cluster => 
      cluster.preservation_risk === 'HIGH' || cluster.preservation_risk === 'CRITICAL'
    ).length;

    // Processing complexity distribution
    const complexityDistribution = { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'VERY_HIGH': 0 };
    clusters.forEach(cluster => {
      complexityDistribution[cluster.merge_complexity]++;
    });

    return {
      duplicate_percentage: duplicatePercentage,
      average_similarity_score: averageSimilarity,
      confidence_distribution: confidenceRanges,
      merge_recommendation_distribution: mergeRecDistribution,
      critical_differences_count: criticalDifferencesCount,
      high_risk_merges: highRiskMerges,
      processing_complexity_distribution: complexityDistribution
    };
  }

  private generateProcessingRecommendations(clusters: DuplicationCluster[], pairs: DuplicationPair[]): ProcessingRecommendation[] {
    const recommendations: ProcessingRecommendation[] = [];

    // High-confidence, low-risk clusters - batch process
    const easyMerges = clusters.filter(cluster => 
      cluster.confidence_score >= 0.9 && 
      cluster.preservation_risk === 'LOW' &&
      cluster.merge_complexity === 'LOW'
    );

    if (easyMerges.length > 0) {
      recommendations.push({
        recommendation_type: 'BATCH_PROCESS',
        priority: 'MEDIUM',
        affected_clusters: easyMerges.map(c => c.cluster_id),
        reasoning: 'High-confidence, low-risk merges suitable for batch processing',
        action_items: [
          'Process in automated batch mode',
          'Apply standard merge strategy',
          'Validate results post-processing'
        ],
        estimated_processing_time: easyMerges.length * 30 // 30ms per merge
      });
    }

    // High-risk clusters - manual review
    const riskyClusters = clusters.filter(cluster => 
      cluster.preservation_risk === 'HIGH' || cluster.preservation_risk === 'CRITICAL'
    );

    if (riskyClusters.length > 0) {
      recommendations.push({
        recommendation_type: 'MANUAL_REVIEW_REQUIRED',
        priority: 'HIGH',
        affected_clusters: riskyClusters.map(c => c.cluster_id),
        reasoning: 'High preservation risk requires human oversight',
        action_items: [
          'Review critical differences in detail',
          'Assess compliance implications',
          'Consider keeping requirements separate'
        ],
        estimated_processing_time: riskyClusters.length * 300000 // 5 minutes per cluster
      });
    }

    // Medium complexity - sequential processing
    const mediumClusters = clusters.filter(cluster => 
      cluster.merge_complexity === 'MEDIUM' && 
      cluster.preservation_risk === 'MEDIUM'
    );

    if (mediumClusters.length > 0) {
      recommendations.push({
        recommendation_type: 'SEQUENTIAL_PROCESS',
        priority: 'MEDIUM',
        affected_clusters: mediumClusters.map(c => c.cluster_id),
        reasoning: 'Medium complexity requires careful sequential processing',
        action_items: [
          'Process one cluster at a time',
          'Validate each merge before proceeding',
          'Monitor quality metrics continuously'
        ],
        estimated_processing_time: mediumClusters.length * 5000 // 5 seconds per merge
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private findHighestSimilarityPair(pairs: DuplicationPair[]): DuplicationPair | null {
    if (pairs.length === 0) return null;
    return pairs.reduce((highest, current) => 
      current.similarity_score > highest.similarity_score ? current : highest
    );
  }

  private createEmptyResult(): DuplicationAnalysisResult {
    return {
      total_requirements: 0,
      total_pairs_analyzed: 0,
      duplicate_pairs: [],
      clusters: [],
      exact_duplicates: 0,
      semantic_duplicates: 0,
      structural_duplicates: 0,
      hybrid_duplicates: 0,
      total_clusters: 0,
      average_cluster_size: 0,
      highest_similarity_pair: null,
      framework_distribution: {
        framework_counts: {},
        cross_framework_pairs: 0,
        same_framework_pairs: 0,
        framework_compatibility_matrix: {}
      },
      duplication_statistics: {
        duplicate_percentage: 0,
        average_similarity_score: 0,
        confidence_distribution: { 'high': 0, 'medium': 0, 'low': 0 },
        merge_recommendation_distribution: { 'MERGE': 0, 'LINK': 0, 'KEEP_SEPARATE': 0, 'MANUAL_REVIEW': 0 },
        critical_differences_count: 0,
        high_risk_merges: 0,
        processing_complexity_distribution: { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'VERY_HIGH': 0 }
      },
      processing_recommendations: []
    };
  }

  /**
   * Initialize framework compatibility rules
   */
  private initializeFrameworkCompatibility(): void {
    this.frameworkCompatibilityRules = new Map([
      ['ISO27001', new Map([
        ['ISO27001', 1.0],
        ['NIS2', 0.8],
        ['GDPR', 0.7],
        ['SOC2', 0.6],
        ['NIST', 0.8]
      ])],
      ['NIS2', new Map([
        ['NIS2', 1.0],
        ['ISO27001', 0.8],
        ['GDPR', 0.9],
        ['CIS', 0.7],
        ['NIST', 0.8]
      ])],
      ['GDPR', new Map([
        ['GDPR', 1.0],
        ['NIS2', 0.9],
        ['ISO27001', 0.7],
        ['CCPA', 0.8],
        ['Privacy', 0.9]
      ])]
    ]);
  }

  private initializeCriticalTerms(): void {
    this.criticalTerms = new Set([
      'shall', 'must', 'required', 'mandatory', 'compliance', 'audit',
      'evidence', 'documentation', 'policy', 'procedure', 'control',
      'security', 'privacy', 'confidentiality', 'integrity', 'availability'
    ]);
  }

  private initializeComplianceKeywords(): void {
    this.complianceKeywords = new Map([
      ['shall', 10], ['must', 10], ['required', 9], ['mandatory', 9],
      ['compliance', 8], ['audit', 8], ['evidence', 7], ['documentation', 7],
      ['policy', 6], ['procedure', 6], ['control', 8], ['monitor', 6],
      ['security', 8], ['privacy', 7], ['risk', 7], ['threat', 6]
    ]);
  }
}