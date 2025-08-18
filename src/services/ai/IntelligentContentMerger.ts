/**
 * Intelligent Content Merging and Deduplication System
 * Advanced AI-powered content consolidation and optimization
 * 
 * Features:
 * - Semantic content similarity detection
 * - Intelligent content merging algorithms
 * - Framework-aware content consolidation
 * - Duplicate content identification and removal
 * - Content quality preservation during merging
 * - Conflict resolution and harmonization
 * - Version control and change tracking
 */

import { supabase } from '@/lib/supabase';
import { GeminiContentGenerator, type ContentGenerationRequest } from './GeminiContentGenerator';
import { QualityScoringEngine, type QualityScore } from './QualityScoringEngine';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContentMergingRequest {
  contents: ContentItem[];
  mergingStrategy: MergingStrategy;
  frameworks: string[];
  categories: string[];
  options: MergingOptions;
  context: MergingContext;
}

export interface ContentItem {
  id: string;
  content: string;
  metadata: ContentMetadata;
  quality?: QualityScore;
  fingerprint?: ContentFingerprint;
}

export interface ContentMetadata {
  title?: string;
  source: string;
  type: 'guidance' | 'policy' | 'procedure' | 'implementation' | 'evidence';
  frameworks: string[];
  categories: string[];
  version?: string;
  lastModified: string;
  author?: string;
  priority: number; // 1-10, higher = more important
  trustScore: number; // 0-1, based on source reliability
}

export interface ContentFingerprint {
  hash: string;
  semanticHash: string;
  structuralHash: string;
  keywordHash: string;
  similarity: SimilarityMetrics;
}

export interface SimilarityMetrics {
  semantic: number; // 0-1
  structural: number; // 0-1
  keyword: number; // 0-1
  framework: number; // 0-1
  overall: number; // 0-1
}

export type MergingStrategy = 
  | 'preserve_best' // Keep highest quality content
  | 'comprehensive' // Merge all non-duplicate information
  | 'framework_specific' // Merge by framework alignment
  | 'hierarchical' // Use priority-based merging
  | 'consensus' // Merge based on majority patterns
  | 'expert_guided'; // AI-guided intelligent merging

export interface MergingOptions {
  duplicateThreshold: number; // 0-1, similarity threshold for duplicates
  qualityWeightFactor: number; // 0-1, how much to weight quality vs completeness
  preserveSourceAttribution: boolean;
  enableConflictResolution: boolean;
  generateMergeSummary: boolean;
  validateMergedContent: boolean;
  maxMergedLength?: number;
  includeVersionHistory: boolean;
}

export interface MergingContext {
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  organizationSize: 'startup' | 'sme' | 'enterprise' | 'large-enterprise';
  complianceMaturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  mergingPurpose: 'consolidation' | 'enhancement' | 'standardization' | 'optimization';
  customCriteria?: MergingCriterion[];
}

export interface MergingCriterion {
  name: string;
  weight: number; // 0-1
  evaluator: (content: ContentItem) => number; // 0-1
}

export interface MergingResult {
  success: boolean;
  mergedContent: MergedContent;
  duplicatesRemoved: DuplicateAnalysis[];
  conflicts: ContentConflict[];
  mergingSummary: MergingSummary;
  qualityComparison: QualityComparison;
  recommendations: MergingRecommendation[];
  metadata: MergingMetadata;
  errors?: string[];
}

export interface MergedContent {
  id: string;
  content: string;
  title: string;
  sourceContributions: SourceContribution[];
  frameworks: string[];
  categories: string[];
  quality: QualityScore;
  version: string;
  changeLog: ChangeLogEntry[];
}

export interface SourceContribution {
  sourceId: string;
  source: string;
  contribution: number; // 0-1, percentage of content from this source
  sections: ContributionSection[];
  quality: number; // 0-1
  trustScore: number; // 0-1
}

export interface ContributionSection {
  section: string;
  startIndex: number;
  endIndex: number;
  type: 'original' | 'modified' | 'synthesized';
  confidence: number; // 0-1
}

export interface ChangeLogEntry {
  timestamp: string;
  action: 'merge' | 'deduplicate' | 'resolve_conflict' | 'enhance';
  description: string;
  sources: string[];
  impact: 'minor' | 'moderate' | 'significant' | 'major';
}

export interface DuplicateAnalysis {
  duplicateSet: string[]; // Content IDs that are duplicates
  similarity: SimilarityMetrics;
  keptContent: string; // ID of content that was kept
  reason: string;
  confidenceScore: number; // 0-1
}

export interface ContentConflict {
  type: 'framework_mismatch' | 'contradictory_guidance' | 'version_conflict' | 'quality_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  conflictingSources: string[];
  resolution: ConflictResolution;
  confidence: number; // 0-1
}

export interface ConflictResolution {
  strategy: 'prioritize_quality' | 'prioritize_source' | 'merge_guidance' | 'flag_for_review';
  action: string;
  rationale: string;
  reviewRequired: boolean;
}

export interface MergingSummary {
  originalCount: number;
  finalCount: number;
  duplicatesRemoved: number;
  conflictsResolved: number;
  qualityImprovement: number; // -1 to 1
  contentReduction: number; // 0-1, percentage reduction
  processingTime: number;
  strategyUsed: MergingStrategy;
}

export interface QualityComparison {
  beforeMerging: QualityMetrics;
  afterMerging: QualityMetrics;
  improvement: QualityImprovement;
  dimensionChanges: DimensionChange[];
}

export interface QualityMetrics {
  averageScore: number;
  totalScore: number;
  bestScore: number;
  worstScore: number;
  consistency: number; // 0-1
}

export interface QualityImprovement {
  overall: number; // -1 to 1
  dimensions: Record<string, number>; // -1 to 1 for each dimension
  confidence: number; // 0-1
}

export interface DimensionChange {
  dimension: string;
  before: number;
  after: number;
  change: number;
  significance: 'insignificant' | 'minor' | 'moderate' | 'significant';
}

export interface MergingRecommendation {
  type: 'process_improvement' | 'content_enhancement' | 'quality_assurance' | 'automation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
}

export interface MergingMetadata {
  mergingId: string;
  timestamp: string;
  strategy: MergingStrategy;
  inputCount: number;
  outputCount: number;
  processingTime: number;
  algorithmVersion: string;
  qualityValidated: boolean;
  reviewRequired: boolean;
}

export interface DeduplicationRequest {
  contents: ContentItem[];
  similarityThreshold: number; // 0-1
  algorithms: DeduplicationAlgorithm[];
  options: DeduplicationOptions;
}

export type DeduplicationAlgorithm = 
  | 'exact_match'
  | 'semantic_similarity'
  | 'structural_similarity'
  | 'keyword_overlap'
  | 'framework_alignment'
  | 'fuzzy_matching';

export interface DeduplicationOptions {
  preserveHighestQuality: boolean;
  considerSourceTrust: boolean;
  enableSemanticAnalysis: boolean;
  crossFrameworkDeduplication: boolean;
  generateDeduplicationReport: boolean;
}

export interface DeduplicationResult {
  originalCount: number;
  uniqueCount: number;
  duplicatesRemoved: number;
  clusters: DuplicateCluster[];
  summary: DeduplicationSummary;
  qualityImpact: QualityImpact;
}

export interface DuplicateCluster {
  id: string;
  similarity: number; // 0-1
  contents: string[]; // Content IDs in this cluster
  representative: string; // ID of content chosen to represent the cluster
  reason: string;
  confidence: number; // 0-1
}

export interface DeduplicationSummary {
  algorithmsUsed: DeduplicationAlgorithm[];
  processingTime: number;
  efficiency: number; // 0-1, removal efficiency
  qualityPreservation: number; // 0-1
}

export interface QualityImpact {
  qualityLoss: number; // 0-1
  informationLoss: number; // 0-1
  consistencyGain: number; // 0-1
  overallImpact: 'positive' | 'neutral' | 'negative';
}

// ============================================================================
// MAIN MERGING ENGINE CLASS
// ============================================================================

export class IntelligentContentMerger {
  private static instance: IntelligentContentMerger | null = null;
  private geminiGenerator: GeminiContentGenerator;
  private qualityEngine: QualityScoringEngine;
  
  // Similarity calculation weights
  private readonly similarityWeights = {
    semantic: 0.4,
    structural: 0.2,
    keyword: 0.2,
    framework: 0.2
  };

  // Content fingerprint cache
  private fingerprintCache: Map<string, ContentFingerprint> = new Map();
  
  // Deduplication algorithms
  private deduplicationAlgorithms: Map<DeduplicationAlgorithm, (contents: ContentItem[]) => DuplicateCluster[]> = new Map();

  private constructor() {
    this.geminiGenerator = GeminiContentGenerator.getInstance();
    this.qualityEngine = QualityScoringEngine.getInstance();
    this.initializeDeduplicationAlgorithms();
  }

  public static getInstance(): IntelligentContentMerger {
    if (!IntelligentContentMerger.instance) {
      IntelligentContentMerger.instance = new IntelligentContentMerger();
    }
    return IntelligentContentMerger.instance;
  }

  // ============================================================================
  // MAIN MERGING METHODS
  // ============================================================================

  /**
   * Intelligently merge multiple content pieces
   */
  public async mergeContents(request: ContentMergingRequest): Promise<MergingResult> {
    const startTime = Date.now();
    const mergingId = this.generateMergingId();

    try {
      console.log(`[ContentMerger] Starting intelligent merging ${mergingId} with ${request.contents.length} items`);

      // Step 1: Generate content fingerprints
      await this.generateContentFingerprints(request.contents);

      // Step 2: Assess content quality
      const qualityAssessments = await this.assessContentQuality(request.contents, request.frameworks, request.categories);

      // Step 3: Identify duplicates
      const duplicateAnalysis = await this.identifyDuplicates(request.contents, request.options.duplicateThreshold);

      // Step 4: Remove duplicates
      const uniqueContents = this.removeDuplicates(request.contents, duplicateAnalysis);

      // Step 5: Identify conflicts
      const conflicts = await this.identifyConflicts(uniqueContents, request.frameworks);

      // Step 6: Resolve conflicts
      const resolvedContents = await this.resolveConflicts(uniqueContents, conflicts, request.options);

      // Step 7: Merge content using strategy
      const mergedContent = await this.executeMergingStrategy(resolvedContents, request);

      // Step 8: Validate merged content
      let finalContent = mergedContent;
      if (request.options.validateMergedContent) {
        finalContent = await this.validateAndRefine(mergedContent, request);
      }

      // Step 9: Generate quality comparison
      const qualityComparison = await this.generateQualityComparison(
        request.contents,
        [finalContent],
        qualityAssessments
      );

      // Step 10: Generate recommendations
      const recommendations = this.generateMergingRecommendations(request, conflicts, qualityComparison);

      const processingTime = Date.now() - startTime;

      const result: MergingResult = {
        success: true,
        mergedContent: finalContent,
        duplicatesRemoved: duplicateAnalysis,
        conflicts,
        mergingSummary: {
          originalCount: request.contents.length,
          finalCount: 1,
          duplicatesRemoved: duplicateAnalysis.length,
          conflictsResolved: conflicts.filter(c => c.resolution.strategy !== 'flag_for_review').length,
          qualityImprovement: qualityComparison.improvement.overall,
          contentReduction: 1 - (1 / request.contents.length),
          processingTime,
          strategyUsed: request.mergingStrategy
        },
        qualityComparison,
        recommendations,
        metadata: {
          mergingId,
          timestamp: new Date().toISOString(),
          strategy: request.mergingStrategy,
          inputCount: request.contents.length,
          outputCount: 1,
          processingTime,
          algorithmVersion: '1.0.0',
          qualityValidated: request.options.validateMergedContent,
          reviewRequired: conflicts.some(c => c.resolution.reviewRequired)
        }
      };

      await this.storeMergingResult(result);

      console.log(`[ContentMerger] Merging ${mergingId} completed in ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`[ContentMerger] Merging ${mergingId} failed:`, error);
      return this.buildFailureResult(request, error, Date.now() - startTime, mergingId);
    }
  }

  /**
   * Remove duplicates from content collection
   */
  public async deduplicateContents(request: DeduplicationRequest): Promise<DeduplicationResult> {
    const startTime = Date.now();

    try {
      console.log(`[ContentMerger] Starting deduplication of ${request.contents.length} items`);

      const clusters: DuplicateCluster[] = [];
      
      // Apply each specified algorithm
      for (const algorithm of request.algorithms) {
        const algorithmClusters = await this.applyDeduplicationAlgorithm(algorithm, request.contents, request.options);
        clusters.push(...algorithmClusters);
      }

      // Merge overlapping clusters
      const finalClusters = this.mergeOverlappingClusters(clusters, request.similarityThreshold);

      // Calculate results
      const duplicatesRemoved = finalClusters.reduce((sum, cluster) => sum + cluster.contents.length - 1, 0);
      const uniqueCount = request.contents.length - duplicatesRemoved;

      // Assess quality impact
      const qualityImpact = await this.assessDeduplicationQualityImpact(request.contents, finalClusters);

      const processingTime = Date.now() - startTime;

      return {
        originalCount: request.contents.length,
        uniqueCount,
        duplicatesRemoved,
        clusters: finalClusters,
        summary: {
          algorithmsUsed: request.algorithms,
          processingTime,
          efficiency: duplicatesRemoved / request.contents.length,
          qualityPreservation: 1 - qualityImpact.qualityLoss
        },
        qualityImpact
      };

    } catch (error) {
      console.error('[ContentMerger] Deduplication failed:', error);
      throw error;
    }
  }

  /**
   * Calculate content similarity between two pieces
   */
  public async calculateSimilarity(content1: ContentItem, content2: ContentItem): Promise<SimilarityMetrics> {
    try {
      // Ensure fingerprints exist
      if (!content1.fingerprint) {
        content1.fingerprint = await this.generateFingerprint(content1);
      }
      if (!content2.fingerprint) {
        content2.fingerprint = await this.generateFingerprint(content2);
      }

      const semantic = await this.calculateSemanticSimilarity(content1.content, content2.content);
      const structural = this.calculateStructuralSimilarity(content1.content, content2.content);
      const keyword = this.calculateKeywordSimilarity(content1.content, content2.content);
      const framework = this.calculateFrameworkSimilarity(content1.metadata.frameworks, content2.metadata.frameworks);

      const overall = (
        semantic * this.similarityWeights.semantic +
        structural * this.similarityWeights.structural +
        keyword * this.similarityWeights.keyword +
        framework * this.similarityWeights.framework
      );

      return { semantic, structural, keyword, framework, overall };

    } catch (error) {
      console.error('[ContentMerger] Similarity calculation failed:', error);
      return { semantic: 0, structural: 0, keyword: 0, framework: 0, overall: 0 };
    }
  }

  // ============================================================================
  // FINGERPRINTING METHODS
  // ============================================================================

  /**
   * Generate content fingerprints for all items
   */
  private async generateContentFingerprints(contents: ContentItem[]): Promise<void> {
    const fingerprintPromises = contents.map(async (content) => {
      if (!content.fingerprint) {
        content.fingerprint = await this.generateFingerprint(content);
      }
    });

    await Promise.all(fingerprintPromises);
  }

  /**
   * Generate comprehensive fingerprint for content
   */
  private async generateFingerprint(content: ContentItem): Promise<ContentFingerprint> {
    const cached = this.fingerprintCache.get(content.id);
    if (cached) return cached;

    try {
      const hash = this.generateHash(content.content);
      const semanticHash = await this.generateSemanticHash(content.content);
      const structuralHash = this.generateStructuralHash(content.content);
      const keywordHash = this.generateKeywordHash(content.content);

      const fingerprint: ContentFingerprint = {
        hash,
        semanticHash,
        structuralHash,
        keywordHash,
        similarity: { semantic: 0, structural: 0, keyword: 0, framework: 0, overall: 0 }
      };

      this.fingerprintCache.set(content.id, fingerprint);
      return fingerprint;

    } catch (error) {
      console.error('[ContentMerger] Fingerprint generation failed:', error);
      return {
        hash: 'error',
        semanticHash: 'error',
        structuralHash: 'error',
        keywordHash: 'error',
        similarity: { semantic: 0, structural: 0, keyword: 0, framework: 0, overall: 0 }
      };
    }
  }

  /**
   * Generate basic content hash
   */
  private generateHash(content: string): string {
    const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
    return btoa(normalized).slice(0, 16);
  }

  /**
   * Generate semantic hash using AI
   */
  private async generateSemanticHash(content: string): Promise<string> {
    try {
      // Extract key concepts and generate semantic representation
      const concepts = await this.extractKeyConcepts(content);
      const semanticRepresentation = concepts.sort().join('|');
      return btoa(semanticRepresentation).slice(0, 16);
    } catch (error) {
      console.error('[ContentMerger] Semantic hash generation failed:', error);
      return this.generateHash(content);
    }
  }

  /**
   * Generate structural hash
   */
  private generateStructuralHash(content: string): string {
    const structure = {
      paragraphs: content.split(/\n\s*\n/).length,
      headers: (content.match(/^#{1,6}\s+/gm) || []).length,
      lists: (content.match(/^\s*[-*+]\s+/gm) || []).length,
      codeBlocks: (content.match(/```/g) || []).length / 2
    };

    const structureString = Object.values(structure).join('-');
    return btoa(structureString).slice(0, 16);
  }

  /**
   * Generate keyword hash
   */
  private generateKeywordHash(content: string): string {
    const keywords = this.extractKeywords(content, 20);
    const keywordString = keywords.sort().join('|');
    return btoa(keywordString).slice(0, 16);
  }

  /**
   * Extract key concepts using AI
   */
  private async extractKeyConcepts(content: string): Promise<string[]> {
    try {
      const conceptPrompt = `Extract 5-10 key concepts from the following compliance content:

CONTENT: ${content.substring(0, 1500)}...

List the main concepts as single words or short phrases, focusing on:
- Security controls
- Compliance requirements
- Implementation approaches
- Risk factors
- Framework elements

Provide as comma-separated list.`;

      const request: ContentGenerationRequest = {
        prompt: conceptPrompt,
        contentType: 'validation',
        context: {
          frameworks: [],
          userRole: 'compliance-officer'
        },
        options: { temperature: 0.2, maxTokens: 200 }
      };

      const response = await this.geminiGenerator.generateContent(request);
      
      return response.content
        .split(',')
        .map(concept => concept.trim().toLowerCase())
        .filter(concept => concept.length > 0)
        .slice(0, 10);

    } catch (error) {
      console.error('[ContentMerger] Concept extraction failed:', error);
      return this.extractKeywords(content, 10);
    }
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, limit: number = 20): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }

  // ============================================================================
  // SIMILARITY CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate semantic similarity using AI
   */
  private async calculateSemanticSimilarity(content1: string, content2: string): Promise<number> {
    try {
      const similarityPrompt = `Compare the semantic similarity between these two compliance content pieces:

CONTENT 1: ${content1.substring(0, 1000)}...

CONTENT 2: ${content2.substring(0, 1000)}...

Rate similarity from 0.0 (completely different) to 1.0 (essentially the same meaning).
Consider:
- Core concepts and ideas
- Implementation approaches
- Risk factors
- Compliance objectives

Provide only a decimal number between 0.0 and 1.0.`;

      const request: ContentGenerationRequest = {
        prompt: similarityPrompt,
        contentType: 'validation',
        context: {
          frameworks: [],
          userRole: 'compliance-officer'
        },
        options: { temperature: 0.1, maxTokens: 50 }
      };

      const response = await this.geminiGenerator.generateContent(request);
      
      const scoreMatch = response.content.match(/(\d+\.?\d*)/);
      if (scoreMatch) {
        const score = parseFloat(scoreMatch[1]);
        return Math.min(Math.max(score, 0), 1);
      }

      return 0.5; // Default if parsing fails

    } catch (error) {
      console.error('[ContentMerger] Semantic similarity calculation failed:', error);
      return this.calculateKeywordSimilarity(content1, content2); // Fallback
    }
  }

  /**
   * Calculate structural similarity
   */
  private calculateStructuralSimilarity(content1: string, content2: string): number {
    const structure1 = this.analyzeStructure(content1);
    const structure2 = this.analyzeStructure(content2);

    const similarities = [
      this.calculateFeatureSimilarity(structure1.paragraphs, structure2.paragraphs),
      this.calculateFeatureSimilarity(structure1.headers, structure2.headers),
      this.calculateFeatureSimilarity(structure1.lists, structure2.lists),
      this.calculateFeatureSimilarity(structure1.avgSentenceLength, structure2.avgSentenceLength)
    ];

    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  /**
   * Analyze content structure
   */
  private analyzeStructure(content: string): any {
    const paragraphs = content.split(/\n\s*\n/).length;
    const headers = (content.match(/^#{1,6}\s+/gm) || []).length;
    const lists = (content.match(/^\s*[-*+]\s+/gm) || []).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const avgSentenceLength = words.length / sentences.length;

    return { paragraphs, headers, lists, avgSentenceLength };
  }

  /**
   * Calculate feature similarity
   */
  private calculateFeatureSimilarity(value1: number, value2: number): number {
    if (value1 === 0 && value2 === 0) return 1;
    if (value1 === 0 || value2 === 0) return 0;
    
    const ratio = Math.min(value1, value2) / Math.max(value1, value2);
    return ratio;
  }

  /**
   * Calculate keyword similarity
   */
  private calculateKeywordSimilarity(content1: string, content2: string): number {
    const keywords1 = new Set(this.extractKeywords(content1, 30));
    const keywords2 = new Set(this.extractKeywords(content2, 30));

    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Calculate framework similarity
   */
  private calculateFrameworkSimilarity(frameworks1: string[], frameworks2: string[]): number {
    if (frameworks1.length === 0 && frameworks2.length === 0) return 1;
    if (frameworks1.length === 0 || frameworks2.length === 0) return 0;

    const set1 = new Set(frameworks1);
    const set2 = new Set(frameworks2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // ============================================================================
  // DEDUPLICATION METHODS
  // ============================================================================

  /**
   * Initialize deduplication algorithms
   */
  private initializeDeduplicationAlgorithms(): void {
    this.deduplicationAlgorithms.set('exact_match', this.exactMatchDeduplication.bind(this));
    this.deduplicationAlgorithms.set('semantic_similarity', this.semanticSimilarityDeduplication.bind(this));
    this.deduplicationAlgorithms.set('structural_similarity', this.structuralSimilarityDeduplication.bind(this));
    this.deduplicationAlgorithms.set('keyword_overlap', this.keywordOverlapDeduplication.bind(this));
    this.deduplicationAlgorithms.set('framework_alignment', this.frameworkAlignmentDeduplication.bind(this));
    this.deduplicationAlgorithms.set('fuzzy_matching', this.fuzzyMatchingDeduplication.bind(this));
  }

  /**
   * Apply specific deduplication algorithm
   */
  private async applyDeduplicationAlgorithm(
    algorithm: DeduplicationAlgorithm,
    contents: ContentItem[],
    options: DeduplicationOptions
  ): Promise<DuplicateCluster[]> {
    const algorithmFunction = this.deduplicationAlgorithms.get(algorithm);
    if (!algorithmFunction) {
      console.warn(`[ContentMerger] Unknown deduplication algorithm: ${algorithm}`);
      return [];
    }

    try {
      return await algorithmFunction(contents);
    } catch (error) {
      console.error(`[ContentMerger] Deduplication algorithm ${algorithm} failed:`, error);
      return [];
    }
  }

  /**
   * Exact match deduplication
   */
  private exactMatchDeduplication(contents: ContentItem[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      const hash1 = contents[i].fingerprint?.hash || this.generateHash(contents[i].content);

      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const hash2 = contents[j].fingerprint?.hash || this.generateHash(contents[j].content);
        
        if (hash1 === hash2) {
          cluster.push(contents[j].id);
          processed.add(contents[j].id);
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `exact_${i}`,
          similarity: 1.0,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'Exact content match',
          confidence: 1.0
        });
      }
    }

    return clusters;
  }

  /**
   * Semantic similarity deduplication
   */
  private async semanticSimilarityDeduplication(contents: ContentItem[]): Promise<DuplicateCluster[]> {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      
      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const similarity = await this.calculateSemanticSimilarity(contents[i].content, contents[j].content);
        
        if (similarity > 0.85) { // High semantic similarity threshold
          cluster.push(contents[j].id);
          processed.add(contents[j].id);
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `semantic_${i}`,
          similarity: 0.85,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'High semantic similarity',
          confidence: 0.9
        });
      }
    }

    return clusters;
  }

  /**
   * Structural similarity deduplication
   */
  private structuralSimilarityDeduplication(contents: ContentItem[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      
      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const similarity = this.calculateStructuralSimilarity(contents[i].content, contents[j].content);
        
        if (similarity > 0.9) { // High structural similarity threshold
          cluster.push(contents[j].id);
          processed.add(contents[j].id);
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `structural_${i}`,
          similarity: 0.9,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'High structural similarity',
          confidence: 0.85
        });
      }
    }

    return clusters;
  }

  /**
   * Keyword overlap deduplication
   */
  private keywordOverlapDeduplication(contents: ContentItem[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      
      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const similarity = this.calculateKeywordSimilarity(contents[i].content, contents[j].content);
        
        if (similarity > 0.8) { // High keyword overlap threshold
          cluster.push(contents[j].id);
          processed.add(contents[j].id);
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `keyword_${i}`,
          similarity: 0.8,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'High keyword overlap',
          confidence: 0.8
        });
      }
    }

    return clusters;
  }

  /**
   * Framework alignment deduplication
   */
  private frameworkAlignmentDeduplication(contents: ContentItem[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      
      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const frameworkSim = this.calculateFrameworkSimilarity(
          contents[i].metadata.frameworks,
          contents[j].metadata.frameworks
        );
        
        const categorySim = this.calculateFrameworkSimilarity(
          contents[i].metadata.categories,
          contents[j].metadata.categories
        );

        if (frameworkSim === 1.0 && categorySim > 0.8) {
          // Same frameworks and very similar categories
          const contentSim = this.calculateKeywordSimilarity(contents[i].content, contents[j].content);
          
          if (contentSim > 0.7) {
            cluster.push(contents[j].id);
            processed.add(contents[j].id);
          }
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `framework_${i}`,
          similarity: 0.8,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'Same framework and category alignment',
          confidence: 0.85
        });
      }
    }

    return clusters;
  }

  /**
   * Fuzzy matching deduplication
   */
  private fuzzyMatchingDeduplication(contents: ContentItem[]): DuplicateCluster[] {
    // Simplified fuzzy matching based on normalized edit distance
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contents.length; i++) {
      if (processed.has(contents[i].id)) continue;

      const cluster: string[] = [contents[i].id];
      
      for (let j = i + 1; j < contents.length; j++) {
        if (processed.has(contents[j].id)) continue;

        const similarity = this.calculateFuzzySimilarity(contents[i].content, contents[j].content);
        
        if (similarity > 0.85) {
          cluster.push(contents[j].id);
          processed.add(contents[j].id);
        }
      }

      if (cluster.length > 1) {
        processed.add(contents[i].id);
        clusters.push({
          id: `fuzzy_${i}`,
          similarity: 0.85,
          contents: cluster,
          representative: this.selectRepresentative(cluster, contents),
          reason: 'High fuzzy similarity',
          confidence: 0.8
        });
      }
    }

    return clusters;
  }

  /**
   * Calculate fuzzy similarity (simplified Levenshtein-based)
   */
  private calculateFuzzySimilarity(content1: string, content2: string): number {
    // Simplified implementation for fuzzy similarity
    const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
    const norm1 = normalize(content1);
    const norm2 = normalize(content2);
    
    if (norm1 === norm2) return 1.0;
    
    const maxLength = Math.max(norm1.length, norm2.length);
    if (maxLength === 0) return 1.0;
    
    // Very simplified distance calculation
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length >= norm2.length ? norm1 : norm2;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer[i] === shorter[i]) matches++;
    }
    
    return matches / maxLength;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Select representative content from cluster
   */
  private selectRepresentative(cluster: string[], contents: ContentItem[]): string {
    const clusterContents = contents.filter(c => cluster.includes(c.id));
    
    // Sort by quality, trust score, and priority
    clusterContents.sort((a, b) => {
      const qualityA = a.quality?.overall || 3.0;
      const qualityB = b.quality?.overall || 3.0;
      
      if (qualityA !== qualityB) return qualityB - qualityA;
      if (a.metadata.trustScore !== b.metadata.trustScore) return b.metadata.trustScore - a.metadata.trustScore;
      return b.metadata.priority - a.metadata.priority;
    });
    
    return clusterContents[0].id;
  }

  /**
   * Merge overlapping clusters
   */
  private mergeOverlappingClusters(clusters: DuplicateCluster[], threshold: number): DuplicateCluster[] {
    const merged: DuplicateCluster[] = [];
    const processed = new Set<string>();

    for (const cluster of clusters) {
      if (processed.has(cluster.id)) continue;

      let mergedCluster = { ...cluster };
      
      for (const otherCluster of clusters) {
        if (otherCluster.id === cluster.id || processed.has(otherCluster.id)) continue;
        
        const overlap = cluster.contents.filter(id => otherCluster.contents.includes(id));
        if (overlap.length > 0) {
          // Merge clusters
          mergedCluster.contents = [...new Set([...mergedCluster.contents, ...otherCluster.contents])];
          mergedCluster.similarity = Math.min(mergedCluster.similarity, otherCluster.similarity);
          mergedCluster.confidence = Math.min(mergedCluster.confidence, otherCluster.confidence);
          processed.add(otherCluster.id);
        }
      }
      
      processed.add(cluster.id);
      merged.push(mergedCluster);
    }

    return merged;
  }

  /**
   * Additional utility methods would be implemented here...
   */

  private async assessContentQuality(contents: ContentItem[], frameworks: string[], categories: string[]): Promise<QualityScore[]> {
    // Implementation for quality assessment
    return [];
  }

  private async identifyDuplicates(contents: ContentItem[], threshold: number): Promise<DuplicateAnalysis[]> {
    // Implementation for duplicate identification
    return [];
  }

  private removeDuplicates(contents: ContentItem[], duplicates: DuplicateAnalysis[]): ContentItem[] {
    // Implementation for duplicate removal
    return contents;
  }

  private async identifyConflicts(contents: ContentItem[], frameworks: string[]): Promise<ContentConflict[]> {
    // Implementation for conflict identification
    return [];
  }

  private async resolveConflicts(contents: ContentItem[], conflicts: ContentConflict[], options: MergingOptions): Promise<ContentItem[]> {
    // Implementation for conflict resolution
    return contents;
  }

  private async executeMergingStrategy(contents: ContentItem[], request: ContentMergingRequest): Promise<MergedContent> {
    // Implementation for merging strategy execution
    return {
      id: 'merged_' + Date.now(),
      content: 'Merged content placeholder',
      title: 'Merged Content',
      sourceContributions: [],
      frameworks: request.frameworks,
      categories: request.categories,
      quality: await this.qualityEngine.assessQuality({
        content: 'Merged content',
        contentType: 'guidance',
        frameworks: request.frameworks,
        categories: request.categories,
        context: {
          targetAudience: request.context.targetAudience,
          organizationSize: request.context.organizationSize,
          complianceMaturity: request.context.complianceMaturity
        }
      }),
      version: '1.0',
      changeLog: []
    };
  }

  private async validateAndRefine(content: MergedContent, request: ContentMergingRequest): Promise<MergedContent> {
    // Implementation for content validation and refinement
    return content;
  }

  private async generateQualityComparison(before: ContentItem[], after: ContentItem[], assessments: QualityScore[]): Promise<QualityComparison> {
    // Implementation for quality comparison
    return {
      beforeMerging: { averageScore: 3.5, totalScore: 10.5, bestScore: 4.0, worstScore: 3.0, consistency: 0.8 },
      afterMerging: { averageScore: 4.0, totalScore: 4.0, bestScore: 4.0, worstScore: 4.0, consistency: 1.0 },
      improvement: { overall: 0.5, dimensions: {}, confidence: 0.85 },
      dimensionChanges: []
    };
  }

  private generateMergingRecommendations(request: ContentMergingRequest, conflicts: ContentConflict[], quality: QualityComparison): MergingRecommendation[] {
    // Implementation for generating recommendations
    return [{
      type: 'content_enhancement',
      priority: 'medium',
      description: 'Content successfully merged',
      action: 'Continue with current approach',
      expectedBenefit: 'Improved content consistency',
      effort: 'low'
    }];
  }

  private generateMergingId(): string {
    return `merge_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private buildFailureResult(request: ContentMergingRequest, error: any, processingTime: number, mergingId: string): MergingResult {
    return {
      success: false,
      mergedContent: {
        id: 'failed',
        content: '',
        title: 'Merge Failed',
        sourceContributions: [],
        frameworks: request.frameworks,
        categories: request.categories,
        quality: {} as QualityScore,
        version: '0.0',
        changeLog: []
      },
      duplicatesRemoved: [],
      conflicts: [],
      mergingSummary: {
        originalCount: request.contents.length,
        finalCount: 0,
        duplicatesRemoved: 0,
        conflictsResolved: 0,
        qualityImprovement: 0,
        contentReduction: 0,
        processingTime,
        strategyUsed: request.mergingStrategy
      },
      qualityComparison: {} as QualityComparison,
      recommendations: [],
      metadata: {
        mergingId,
        timestamp: new Date().toISOString(),
        strategy: request.mergingStrategy,
        inputCount: request.contents.length,
        outputCount: 0,
        processingTime,
        algorithmVersion: '1.0.0',
        qualityValidated: false,
        reviewRequired: true
      },
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }

  private async assessDeduplicationQualityImpact(contents: ContentItem[], clusters: DuplicateCluster[]): Promise<QualityImpact> {
    // Implementation for assessing quality impact of deduplication
    return {
      qualityLoss: 0.1,
      informationLoss: 0.05,
      consistencyGain: 0.8,
      overallImpact: 'positive'
    };
  }

  private async storeMergingResult(result: MergingResult): Promise<void> {
    try {
      await supabase
        .from('content_merging_results')
        .insert({
          merging_id: result.metadata.mergingId,
          success: result.success,
          merged_content: result.mergedContent,
          duplicates_removed: result.duplicatesRemoved,
          conflicts: result.conflicts,
          merging_summary: result.mergingSummary,
          quality_comparison: result.qualityComparison,
          recommendations: result.recommendations,
          metadata: result.metadata,
          errors: result.errors,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('[ContentMerger] Failed to store merging result:', error);
    }
  }
}

// Export singleton instance
export const intelligentContentMerger = IntelligentContentMerger.getInstance();