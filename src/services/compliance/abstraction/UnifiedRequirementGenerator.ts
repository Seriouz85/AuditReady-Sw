/**
 * UnifiedRequirementGenerator.ts
 * Generates unified text from multiple similar requirements
 * Preserves critical terms and compliance indicators
 */

import { ProcessedRequirement, ComplianceEntity, RequirementStructure } from './types';
import { ConflictResolution, HarmonizationConfig } from './RequirementHarmonizer';

export interface UnificationStrategy {
  preserve_critical_terms: boolean;
  maintain_framework_specificity: boolean;
  consolidate_evidence_requirements: boolean;
  optimize_readability: boolean;
}

export interface UnifiedRequirementResult {
  unified_text: string;
  critical_terms_preserved: string[];
  framework_additions: FrameworkAddition[];
  evidence_requirements: string[];
  complexity_metrics: ComplexityMetrics;
  generation_metadata: GenerationMetadata;
}

export interface FrameworkAddition {
  framework: string;
  additional_text: string;
  insertion_position: number;
  justification: string;
}

export interface ComplexityMetrics {
  original_avg_readability: number;
  unified_readability: number;
  complexity_ratio: number;
  word_count_ratio: number;
  technical_term_density: number;
}

export interface GenerationMetadata {
  source_count: number;
  frameworks_merged: string[];
  merge_strategy_used: string;
  processing_time_ms: number;
  quality_score: number;
  conflicts_resolved_count: number;
}

export interface TextSegment {
  content: string;
  type: 'MAIN_CLAUSE' | 'SUB_CLAUSE' | 'CONDITION' | 'EXCEPTION' | 'REFERENCE';
  frameworks: string[];
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entities: ComplianceEntity[];
}

export class UnifiedRequirementGenerator {
  private config: HarmonizationConfig;
  private criticalTermsDict: Set<string>;
  private complianceIndicators: Set<string>;

  constructor(config: HarmonizationConfig) {
    this.config = config;
    this.initializeCriticalTerms();
    this.initializeComplianceIndicators();
  }

  /**
   * Generate unified requirement text from multiple similar requirements
   */
  async generateUnifiedRequirement(
    requirements: ProcessedRequirement[],
    conflictResolutions: ConflictResolution[]
  ): Promise<UnifiedRequirementResult> {
    const startTime = performance.now();

    if (requirements.length < 2) {
      throw new Error('At least 2 requirements needed for unification');
    }

    // Step 1: Extract and merge text segments
    const textSegments = this.extractTextSegments(requirements);
    const mergedSegments = this.mergeSegments(textSegments, conflictResolutions);

    // Step 2: Generate unified text with optimal structure
    const unifiedText = this.constructUnifiedText(mergedSegments);

    // Step 3: Add framework-specific additions
    const frameworkAdditions = this.generateFrameworkAdditions(requirements, unifiedText);
    const finalText = this.incorporateFrameworkAdditions(unifiedText, frameworkAdditions);

    // Step 4: Extract evidence requirements
    const evidenceRequirements = this.consolidateEvidenceRequirements(requirements);

    // Step 5: Calculate complexity metrics
    const complexityMetrics = this.calculateComplexityMetrics(requirements, finalText);

    // Step 6: Validate complexity constraints
    if (complexityMetrics.complexity_ratio > this.config.quality_thresholds.max_text_complexity_multiplier) {
      throw new Error(`Text complexity ratio ${complexityMetrics.complexity_ratio} exceeds maximum ${this.config.quality_thresholds.max_text_complexity_multiplier}`);
    }

    const processingTime = performance.now() - startTime;

    return {
      unified_text: finalText,
      critical_terms_preserved: this.extractCriticalTerms(finalText),
      framework_additions: frameworkAdditions,
      evidence_requirements: evidenceRequirements,
      complexity_metrics: complexityMetrics,
      generation_metadata: {
        source_count: requirements.length,
        frameworks_merged: Array.from(new Set(requirements.map(req => req.framework))),
        merge_strategy_used: this.config.merge_strategy,
        processing_time_ms: processingTime,
        quality_score: this.calculateQualityScore(complexityMetrics, frameworkAdditions),
        conflicts_resolved_count: conflictResolutions.length
      }
    };
  }

  /**
   * Extract text segments from requirements
   */
  private extractTextSegments(requirements: ProcessedRequirement[]): TextSegment[] {
    const segments: TextSegment[] = [];

    for (const requirement of requirements) {
      const structure = requirement.structure;

      // Main clause
      if (structure.main_clause) {
        segments.push({
          content: structure.main_clause,
          type: 'MAIN_CLAUSE',
          frameworks: [requirement.framework],
          criticality: requirement.metadata.criticality,
          entities: requirement.entities.filter(e => this.isInText(e.text, structure.main_clause))
        });
      }

      // Sub-clauses
      for (const subClause of structure.sub_clauses) {
        segments.push({
          content: subClause,
          type: 'SUB_CLAUSE',
          frameworks: [requirement.framework],
          criticality: requirement.metadata.criticality,
          entities: requirement.entities.filter(e => this.isInText(e.text, subClause))
        });
      }

      // Conditions
      for (const condition of structure.conditions) {
        segments.push({
          content: condition,
          type: 'CONDITION',
          frameworks: [requirement.framework],
          criticality: requirement.metadata.criticality,
          entities: requirement.entities.filter(e => this.isInText(e.text, condition))
        });
      }

      // Exceptions
      for (const exception of structure.exceptions) {
        segments.push({
          content: exception,
          type: 'EXCEPTION',
          frameworks: [requirement.framework],
          criticality: requirement.metadata.criticality,
          entities: requirement.entities.filter(e => this.isInText(e.text, exception))
        });
      }

      // References
      for (const reference of structure.references) {
        segments.push({
          content: reference,
          type: 'REFERENCE',
          frameworks: [requirement.framework],
          criticality: requirement.metadata.criticality,
          entities: requirement.entities.filter(e => this.isInText(e.text, reference))
        });
      }
    }

    return segments;
  }

  /**
   * Merge similar segments using the configured strategy
   */
  private mergeSegments(segments: TextSegment[], conflictResolutions: ConflictResolution[]): TextSegment[] {
    // Group segments by type and similarity
    const groupedSegments = this.groupSimilarSegments(segments);
    const mergedSegments: TextSegment[] = [];

    for (const group of groupedSegments) {
      if (group.length === 1) {
        mergedSegments.push(group[0]);
        continue;
      }

      // Merge multiple segments of the same type
      const mergedSegment = this.mergeSimilarSegments(group, conflictResolutions);
      mergedSegments.push(mergedSegment);
    }

    return mergedSegments;
  }

  /**
   * Group similar segments together
   */
  private groupSimilarSegments(segments: TextSegment[]): TextSegment[][] {
    const groups: TextSegment[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < segments.length; i++) {
      if (processed.has(i)) continue;

      const group = [segments[i]];
      processed.add(i);

      for (let j = i + 1; j < segments.length; j++) {
        if (processed.has(j)) continue;

        if (this.areSegmentsSimilar(segments[i], segments[j])) {
          group.push(segments[j]);
          processed.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Check if two segments are similar enough to merge
   */
  private areSegmentsSimilar(segment1: TextSegment, segment2: TextSegment): boolean {
    // Must be same type
    if (segment1.type !== segment2.type) return false;

    // Calculate semantic similarity (simplified)
    const similarity = this.calculateTextSimilarity(segment1.content, segment2.content);
    return similarity > 0.8; // High threshold for merging
  }

  /**
   * Merge segments of the same type
   */
  private mergeSimilarSegments(segments: TextSegment[], conflictResolutions: ConflictResolution[]): TextSegment {
    const baseSegment = segments[0];
    
    // Combine content using union strategy
    const mergedContent = this.mergeTextContent(segments.map(s => s.content));
    
    // Combine frameworks
    const allFrameworks = Array.from(new Set(segments.flatMap(s => s.frameworks)));
    
    // Use highest criticality
    const maxCriticality = this.getMaxCriticality(segments.map(s => s.criticality));
    
    // Combine entities
    const allEntities = this.deduplicateEntities(segments.flatMap(s => s.entities));

    return {
      content: mergedContent,
      type: baseSegment.type,
      frameworks: allFrameworks,
      criticality: maxCriticality,
      entities: allEntities
    };
  }

  /**
   * Merge text content preserving critical information
   */
  private mergeTextContent(texts: string[]): string {
    if (texts.length === 1) return texts[0];

    // Find common core text
    const coreText = this.findCommonCore(texts);
    
    // Extract unique additions
    const uniqueAdditions = this.extractUniqueAdditions(texts, coreText);
    
    // Combine core with unique additions
    return this.combineTextElements(coreText, uniqueAdditions);
  }

  /**
   * Find common core text among all requirements
   */
  private findCommonCore(texts: string[]): string {
    if (texts.length === 0) return '';
    if (texts.length === 1) return texts[0];

    // Find longest common subsequence of words
    const words = texts.map(text => text.split(/\s+/));
    const commonWords = this.findLongestCommonSubsequence(words);
    
    return commonWords.join(' ');
  }

  /**
   * Extract unique additions not in common core
   */
  private extractUniqueAdditions(texts: string[], core: string): string[] {
    const additions: string[] = [];
    const coreWords = new Set(core.toLowerCase().split(/\s+/));

    for (const text of texts) {
      const textWords = text.split(/\s+/);
      const uniqueWords = textWords.filter(word => 
        !coreWords.has(word.toLowerCase()) && this.criticalTermsDict.has(word.toLowerCase())
      );
      
      if (uniqueWords.length > 0) {
        additions.push(uniqueWords.join(' '));
      }
    }

    return Array.from(new Set(additions));
  }

  /**
   * Combine text elements maintaining readability
   */
  private combineTextElements(core: string, additions: string[]): string {
    if (additions.length === 0) return core;

    // Insert additions strategically
    let combinedText = core;
    
    for (const addition of additions) {
      if (!combinedText.toLowerCase().includes(addition.toLowerCase())) {
        combinedText += ` ${addition}`;
      }
    }

    return this.optimizeTextFlow(combinedText);
  }

  /**
   * Construct unified text from merged segments
   */
  private constructUnifiedText(segments: TextSegment[]): string {
    // Sort segments by type importance
    const sortedSegments = this.sortSegmentsByImportance(segments);
    
    // Combine segments with appropriate connectors
    const textParts: string[] = [];
    
    for (const segment of sortedSegments) {
      const connector = this.getSegmentConnector(segment.type);
      textParts.push(`${connector}${segment.content}`);
    }

    return textParts.join(' ').trim();
  }

  /**
   * Sort segments by importance for text construction
   */
  private sortSegmentsByImportance(segments: TextSegment[]): TextSegment[] {
    const typeOrder = {
      'MAIN_CLAUSE': 1,
      'SUB_CLAUSE': 2,
      'CONDITION': 3,
      'EXCEPTION': 4,
      'REFERENCE': 5
    };

    return segments.sort((a, b) => {
      const orderDiff = typeOrder[a.type] - typeOrder[b.type];
      if (orderDiff !== 0) return orderDiff;
      
      // Secondary sort by criticality
      const criticalityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
      return criticalityOrder[a.criticality] - criticalityOrder[b.criticality];
    });
  }

  /**
   * Get appropriate connector for segment type
   */
  private getSegmentConnector(type: string): string {
    switch (type) {
      case 'MAIN_CLAUSE': return '';
      case 'SUB_CLAUSE': return ', including ';
      case 'CONDITION': return ' when ';
      case 'EXCEPTION': return ' except ';
      case 'REFERENCE': return ' as defined in ';
      default: return ' ';
    }
  }

  /**
   * Generate framework-specific additions
   */
  private generateFrameworkAdditions(
    requirements: ProcessedRequirement[],
    unifiedText: string
  ): FrameworkAddition[] {
    const additions: FrameworkAddition[] = [];
    const frameworks = Array.from(new Set(requirements.map(req => req.framework)));

    for (const framework of frameworks) {
      const frameworkReqs = requirements.filter(req => req.framework === framework);
      const uniqueContent = this.extractFrameworkUniqueContent(frameworkReqs, unifiedText);

      if (uniqueContent.length > 0) {
        additions.push({
          framework,
          additional_text: uniqueContent,
          insertion_position: unifiedText.length,
          justification: `Framework-specific requirement for ${framework}`
        });
      }
    }

    return additions;
  }

  /**
   * Extract unique content specific to a framework
   */
  private extractFrameworkUniqueContent(
    frameworkRequirements: ProcessedRequirement[],
    unifiedText: string
  ): string {
    const uniqueParts: string[] = [];
    const unifiedWords = new Set(unifiedText.toLowerCase().split(/\s+/));

    for (const req of frameworkRequirements) {
      const reqWords = req.normalized_text.split(/\s+/);
      const uniqueWords = reqWords.filter(word => 
        !unifiedWords.has(word.toLowerCase()) && 
        (this.criticalTermsDict.has(word.toLowerCase()) || this.complianceIndicators.has(word.toLowerCase()))
      );

      if (uniqueWords.length > 0) {
        uniqueParts.push(uniqueWords.join(' '));
      }
    }

    return Array.from(new Set(uniqueParts)).join(', ');
  }

  /**
   * Incorporate framework additions into text
   */
  private incorporateFrameworkAdditions(text: string, additions: FrameworkAddition[]): string {
    if (additions.length === 0) return text;

    let modifiedText = text;
    
    for (const addition of additions) {
      if (addition.additional_text.trim()) {
        modifiedText += ` (${addition.framework}: ${addition.additional_text})`;
      }
    }

    return modifiedText;
  }

  /**
   * Consolidate evidence requirements from all source requirements
   */
  private consolidateEvidenceRequirements(requirements: ProcessedRequirement[]): string[] {
    const evidenceSet = new Set<string>();

    for (const req of requirements) {
      // Extract evidence-related terms from entities
      const evidenceEntities = req.entities.filter(entity => 
        entity.type === 'REQUIREMENT' && 
        (entity.text.toLowerCase().includes('evidence') || 
         entity.text.toLowerCase().includes('document') ||
         entity.text.toLowerCase().includes('record'))
      );

      for (const entity of evidenceEntities) {
        evidenceSet.add(entity.text);
      }

      // Also check references for evidence requirements
      for (const reference of req.structure.references) {
        if (reference.toLowerCase().includes('evidence') || 
            reference.toLowerCase().includes('documentation')) {
          evidenceSet.add(reference);
        }
      }
    }

    return Array.from(evidenceSet);
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexityMetrics(
    requirements: ProcessedRequirement[],
    unifiedText: string
  ): ComplexityMetrics {
    const originalAvgReadability = requirements.reduce((sum, req) => 
      sum + req.metadata.readability_score, 0) / requirements.length;
    
    const unifiedReadability = this.calculateReadabilityScore(unifiedText);
    const complexityRatio = unifiedReadability / originalAvgReadability;
    
    const originalWordCount = requirements.reduce((sum, req) => 
      sum + req.metadata.word_count, 0);
    const unifiedWordCount = unifiedText.split(/\s+/).length;
    const wordCountRatio = unifiedWordCount / originalWordCount;

    const technicalTerms = this.countTechnicalTerms(unifiedText);
    const technicalTermDensity = technicalTerms / unifiedWordCount;

    return {
      original_avg_readability: originalAvgReadability,
      unified_readability: unifiedReadability,
      complexity_ratio: complexityRatio,
      word_count_ratio: wordCountRatio,
      technical_term_density: technicalTermDensity
    };
  }

  /**
   * Helper methods for text processing
   */
  private isInText(entityText: string, text: string): boolean {
    return text.toLowerCase().includes(entityText.toLowerCase());
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    return intersection.size / union.size;
  }

  private getMaxCriticality(criticalities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (criticalities.includes('CRITICAL')) return 'CRITICAL';
    if (criticalities.includes('HIGH')) return 'HIGH';
    if (criticalities.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  private deduplicateEntities(entities: ComplianceEntity[]): ComplianceEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.type}_${entity.text.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private findLongestCommonSubsequence(wordArrays: string[][]): string[] {
    if (wordArrays.length === 0) return [];
    if (wordArrays.length === 1) return wordArrays[0];

    let lcs = wordArrays[0];
    for (let i = 1; i < wordArrays.length; i++) {
      lcs = this.lcsHelper(lcs, wordArrays[i]);
    }
    
    return lcs;
  }

  private lcsHelper(arr1: string[], arr2: string[]): string[] {
    const dp: number[][] = Array(arr1.length + 1).fill(null).map(() => Array(arr2.length + 1).fill(0));
    
    for (let i = 1; i <= arr1.length; i++) {
      for (let j = 1; j <= arr2.length; j++) {
        if (arr1[i-1].toLowerCase() === arr2[j-1].toLowerCase()) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }

    // Reconstruct LCS
    const result: string[] = [];
    let i = arr1.length, j = arr2.length;
    while (i > 0 && j > 0) {
      if (arr1[i-1].toLowerCase() === arr2[j-1].toLowerCase()) {
        result.unshift(arr1[i-1]);
        i--; j--;
      } else if (dp[i-1][j] > dp[i][j-1]) {
        i--;
      } else {
        j--;
      }
    }

    return result;
  }

  private optimizeTextFlow(text: string): string {
    // Remove duplicate phrases and optimize readability
    return text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .trim();
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch reading ease calculation
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);
    
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting
    return text.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
  }

  private countTechnicalTerms(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => this.criticalTermsDict.has(word)).length;
  }

  private extractCriticalTerms(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => this.criticalTermsDict.has(word));
  }

  private calculateQualityScore(metrics: ComplexityMetrics, additions: FrameworkAddition[]): number {
    const readabilityScore = Math.max(0, Math.min(1, metrics.unified_readability / 100));
    const complexityScore = Math.max(0, 2 - metrics.complexity_ratio);
    const completenessScore = additions.length > 0 ? 1 : 0.8;
    
    return (readabilityScore * 0.4) + (complexityScore * 0.4) + (completenessScore * 0.2);
  }

  private initializeCriticalTerms(): void {
    this.criticalTermsDict = new Set([
      'shall', 'must', 'required', 'mandatory', 'compliance', 'audit', 'evidence',
      'documentation', 'policy', 'procedure', 'control', 'monitor', 'review',
      'assess', 'validate', 'verify', 'implement', 'maintain', 'ensure',
      'security', 'privacy', 'confidentiality', 'integrity', 'availability',
      'risk', 'threat', 'vulnerability', 'incident', 'breach', 'unauthorized'
    ]);
  }

  private initializeComplianceIndicators(): void {
    this.complianceIndicators = new Set([
      'annually', 'quarterly', 'monthly', 'continuously', 'immediately',
      'minimum', 'maximum', 'threshold', 'baseline', 'standard',
      'approved', 'authorized', 'designated', 'responsible', 'accountable',
      'iso', 'nis2', 'gdpr', 'ccpa', 'sox', 'pci', 'hipaa', 'nist'
    ]);
  }
}