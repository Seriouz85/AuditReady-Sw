/**
 * FrameworkOverlapCalculator.ts
 * Calculate REAL overlap percentages between frameworks
 * Support "what-if" analysis and generate overlap heatmaps
 */

import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

export interface FrameworkOverlapRequest {
  selectedFrameworks: FrameworkSelection;
  requirements: RequirementData[];
  analysisType: 'current' | 'whatif';
  whatIfChanges?: FrameworkSelection; // For what-if analysis
}

export interface RequirementData {
  id: string;
  category: string;
  title: string;
  description: string;
  frameworks: string[];
  mappings: FrameworkMapping[];
  keywords: string[];
  semanticVector?: number[]; // For advanced similarity analysis
}

export interface FrameworkMapping {
  framework: string;
  requirementCode: string;
  confidence: number; // 0-1
  mappingType: 'direct' | 'partial' | 'derived' | 'interpreted';
}

export interface OverlapResult {
  overallStats: OverlapStats;
  frameworkPairs: FrameworkPairOverlap[];
  heatmapData: HeatmapData;
  categoryBreakdown: CategoryOverlap[];
  uniqueRequirements: UniqueRequirementAnalysis;
  coverageAnalysis: CoverageAnalysis;
  whatIfComparison?: WhatIfComparison;
}

export interface OverlapStats {
  totalRequirements: number;
  uniqueRequirements: number;
  sharedRequirements: number;
  overlapPercentage: number;
  efficiencyGain: number; // How much consolidation helps
  complexityReduction: number;
}

export interface FrameworkPairOverlap {
  framework1: string;
  framework2: string;
  overlapCount: number;
  overlapPercentage: number;
  uniqueToFramework1: number;
  uniqueToFramework2: number;
  sharedRequirements: SharedRequirement[];
  mappingQuality: number; // Average confidence of mappings
}

export interface SharedRequirement {
  requirement1: RequirementData;
  requirement2: RequirementData;
  similarityScore: number;
  mappingConfidence: number;
  consolidationPotential: 'high' | 'medium' | 'low';
}

export interface HeatmapData {
  frameworks: string[];
  matrix: number[][]; // frameworks.length x frameworks.length
  maxOverlap: number;
  minOverlap: number;
  avgOverlap: number;
}

export interface CategoryOverlap {
  category: string;
  totalRequirements: number;
  frameworkDistribution: FrameworkDistribution[];
  overlapPercentage: number;
  consolidationOpportunity: number; // 0-100
}

export interface FrameworkDistribution {
  framework: string;
  requirementCount: number;
  percentage: number;
}

export interface UniqueRequirementAnalysis {
  byFramework: FrameworkUniqueAnalysis[];
  totalUnique: number;
  mostUniqueFramework: string;
  leastUniqueFramework: string;
}

export interface FrameworkUniqueAnalysis {
  framework: string;
  totalRequirements: number;
  uniqueRequirements: number;
  sharedRequirements: number;
  uniquenessPercentage: number;
}

export interface CoverageAnalysis {
  byCategory: CategoryCoverage[];
  gapAnalysis: RequirementGap[];
  redundancyAnalysis: RequirementRedundancy[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface CategoryCoverage {
  category: string;
  totalPossibleRequirements: number;
  coveredRequirements: number;
  coveragePercentage: number;
  missingFromFrameworks: string[];
  overCoveredByFrameworks: string[];
}

export interface RequirementGap {
  category: string;
  missingRequirement: string;
  affectedFrameworks: string[];
  impactLevel: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

export interface RequirementRedundancy {
  category: string;
  redundantRequirements: RequirementData[];
  redundancyLevel: number; // How redundant (0-100)
  consolidationPotential: number; // How much can be consolidated (0-100)
}

export interface OptimizationOpportunity {
  type: 'consolidation' | 'gap_filling' | 'redundancy_removal';
  description: string;
  affectedFrameworks: string[];
  estimatedImpact: number; // 0-100
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface WhatIfComparison {
  currentScenario: OverlapStats;
  whatIfScenario: OverlapStats;
  impact: WhatIfImpact;
  recommendation: string;
}

export interface WhatIfImpact {
  requirementsDelta: number;
  overlapDelta: number;
  efficiencyDelta: number;
  complexityDelta: number;
  addedValue: string[];
  removedValue: string[];
}

export class FrameworkOverlapCalculator {
  private readonly SIMILARITY_THRESHOLD = 0.7; // 70% similarity for overlap
  private readonly CONSOLIDATION_THRESHOLD = 0.8; // 80% similarity for consolidation
  private readonly KEYWORD_WEIGHT = 0.3;
  private readonly SEMANTIC_WEIGHT = 0.4;
  private readonly MAPPING_WEIGHT = 0.3;

  /**
   * Main method to calculate framework overlap
   */
  async calculateOverlap(request: FrameworkOverlapRequest): Promise<OverlapResult> {
    try {
      // Get active frameworks
      const activeFrameworks = this.getActiveFrameworks(request.selectedFrameworks);
      
      // Filter requirements to selected frameworks
      const relevantRequirements = this.filterRequirementsByFrameworks(
        request.requirements,
        activeFrameworks
      );

      // Calculate overall statistics
      const overallStats = this.calculateOverallStats(relevantRequirements, activeFrameworks);

      // Calculate pairwise overlaps
      const frameworkPairs = await this.calculateFrameworkPairs(
        relevantRequirements,
        activeFrameworks
      );

      // Generate heatmap data
      const heatmapData = this.generateHeatmapData(frameworkPairs, activeFrameworks);

      // Analyze by category
      const categoryBreakdown = this.analyzeCategoryOverlap(
        relevantRequirements,
        activeFrameworks
      );

      // Analyze unique requirements
      const uniqueRequirements = this.analyzeUniqueRequirements(
        relevantRequirements,
        activeFrameworks
      );

      // Perform coverage analysis
      const coverageAnalysis = this.performCoverageAnalysis(
        relevantRequirements,
        activeFrameworks
      );

      // What-if analysis if requested
      let whatIfComparison: WhatIfComparison | undefined;
      if (request.analysisType === 'whatif' && request.whatIfChanges) {
        whatIfComparison = await this.performWhatIfAnalysis(
          request.requirements,
          request.selectedFrameworks,
          request.whatIfChanges
        );
      }

      return {
        overallStats,
        frameworkPairs,
        heatmapData,
        categoryBreakdown,
        uniqueRequirements,
        coverageAnalysis,
        whatIfComparison
      };
    } catch (error) {
      console.error('Framework overlap calculation error:', error);
      throw new Error(`Overlap calculation failed: ${error.message}`);
    }
  }

  /**
   * Get list of active frameworks from selection
   */
  private getActiveFrameworks(selection: FrameworkSelection): string[] {
    const frameworks: string[] = [];
    
    if (selection.iso27001) frameworks.push('ISO27001');
    if (selection.iso27002) frameworks.push('ISO27002');
    if (selection.cisControls) frameworks.push(`CIS_${selection.cisControls.toUpperCase()}`);
    if (selection.gdpr) frameworks.push('GDPR');
    if (selection.nis2) frameworks.push('NIS2');
    if (selection.dora) frameworks.push('DORA');
    
    return frameworks;
  }

  /**
   * Filter requirements to only include selected frameworks
   */
  private filterRequirementsByFrameworks(
    requirements: RequirementData[],
    frameworks: string[]
  ): RequirementData[] {
    return requirements.filter(req => 
      req.frameworks.some(framework => frameworks.includes(framework))
    );
  }

  /**
   * Calculate overall overlap statistics
   */
  private calculateOverallStats(
    requirements: RequirementData[],
    frameworks: string[]
  ): OverlapStats {
    
    const totalRequirements = requirements.length;
    
    // Group requirements by similarity
    const similarityGroups = this.groupBySimilarity(requirements);
    const uniqueRequirements = similarityGroups.length;
    const sharedRequirements = totalRequirements - uniqueRequirements;
    
    const overlapPercentage = totalRequirements > 0 ? 
      (sharedRequirements / totalRequirements) * 100 : 0;
    
    // Calculate efficiency gain from consolidation
    const efficiencyGain = totalRequirements > 0 ? 
      ((totalRequirements - uniqueRequirements) / totalRequirements) * 100 : 0;
    
    // Calculate complexity reduction
    const complexityReduction = this.calculateComplexityReduction(
      totalRequirements,
      uniqueRequirements,
      frameworks.length
    );

    return {
      totalRequirements,
      uniqueRequirements,
      sharedRequirements,
      overlapPercentage: Math.round(overlapPercentage),
      efficiencyGain: Math.round(efficiencyGain),
      complexityReduction: Math.round(complexityReduction)
    };
  }

  /**
   * Group requirements by similarity
   */
  private groupBySimilarity(requirements: RequirementData[]): RequirementData[][] {
    const groups: RequirementData[][] = [];
    const processed = new Set<string>();

    for (const req of requirements) {
      if (processed.has(req.id)) continue;

      const group = [req];
      processed.add(req.id);

      // Find similar requirements
      for (const otherReq of requirements) {
        if (processed.has(otherReq.id)) continue;

        const similarity = this.calculateRequirementSimilarity(req, otherReq);
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          group.push(otherReq);
          processed.add(otherReq.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculate similarity between two requirements
   */
  private calculateRequirementSimilarity(req1: RequirementData, req2: RequirementData): number {
    // Keyword similarity
    const keywordSim = this.calculateKeywordSimilarity(req1.keywords, req2.keywords);
    
    // Semantic similarity (if vectors available)
    const semanticSim = req1.semanticVector && req2.semanticVector ? 
      this.calculateSemanticSimilarity(req1.semanticVector, req2.semanticVector) : 
      this.calculateTextSimilarity(req1.description, req2.description);
    
    // Mapping similarity
    const mappingSim = this.calculateMappingSimilarity(req1.mappings, req2.mappings);

    return (
      keywordSim * this.KEYWORD_WEIGHT +
      semanticSim * this.SEMANTIC_WEIGHT +
      mappingSim * this.MAPPING_WEIGHT
    );
  }

  /**
   * Calculate keyword similarity
   */
  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    
    const intersection = new Set([...set1].filter(k => set2.has(k)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate semantic similarity using vectors
   */
  private calculateSemanticSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0;

    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate text similarity (fallback when no vectors)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate mapping similarity
   */
  private calculateMappingSimilarity(mappings1: FrameworkMapping[], mappings2: FrameworkMapping[]): number {
    const frameworks1 = new Set(mappings1.map(m => m.framework));
    const frameworks2 = new Set(mappings2.map(m => m.framework));
    
    const commonFrameworks = new Set([...frameworks1].filter(f => frameworks2.has(f)));
    const totalFrameworks = new Set([...frameworks1, ...frameworks2]);
    
    return totalFrameworks.size > 0 ? commonFrameworks.size / totalFrameworks.size : 0;
  }

  /**
   * Calculate complexity reduction
   */
  private calculateComplexityReduction(
    totalRequirements: number,
    uniqueRequirements: number,
    frameworkCount: number
  ): number {
    if (totalRequirements === 0 || frameworkCount === 0) return 0;

    // Complexity is roughly proportional to requirements × frameworks
    const originalComplexity = totalRequirements * frameworkCount;
    const reducedComplexity = uniqueRequirements * frameworkCount;
    
    return ((originalComplexity - reducedComplexity) / originalComplexity) * 100;
  }

  /**
   * Calculate pairwise framework overlaps
   */
  private async calculateFrameworkPairs(
    requirements: RequirementData[],
    frameworks: string[]
  ): Promise<FrameworkPairOverlap[]> {
    
    const pairs: FrameworkPairOverlap[] = [];

    for (let i = 0; i < frameworks.length; i++) {
      for (let j = i + 1; j < frameworks.length; j++) {
        const framework1 = frameworks[i];
        const framework2 = frameworks[j];

        const overlap = await this.calculatePairOverlap(
          requirements,
          framework1,
          framework2
        );

        pairs.push(overlap);
      }
    }

    return pairs;
  }

  /**
   * Calculate overlap between two specific frameworks
   */
  private async calculatePairOverlap(
    requirements: RequirementData[],
    framework1: string,
    framework2: string
  ): Promise<FrameworkPairOverlap> {
    
    const req1 = requirements.filter(r => r.frameworks.includes(framework1));
    const req2 = requirements.filter(r => r.frameworks.includes(framework2));

    const sharedRequirements: SharedRequirement[] = [];
    let totalMappingQuality = 0;

    // Find shared requirements
    for (const r1 of req1) {
      for (const r2 of req2) {
        const similarity = this.calculateRequirementSimilarity(r1, r2);
        
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          const mappingConfidence = this.getMappingConfidence(r1, r2, framework1, framework2);
          const consolidationPotential = this.determineConsolidationPotential(similarity, mappingConfidence);

          sharedRequirements.push({
            requirement1: r1,
            requirement2: r2,
            similarityScore: similarity,
            mappingConfidence,
            consolidationPotential
          });

          totalMappingQuality += mappingConfidence;
        }
      }
    }

    const overlapCount = sharedRequirements.length;
    const maxRequirements = Math.max(req1.length, req2.length);
    const overlapPercentage = maxRequirements > 0 ? (overlapCount / maxRequirements) * 100 : 0;
    
    const uniqueToFramework1 = req1.length - sharedRequirements.filter(s => 
      s.requirement1.frameworks.includes(framework1)
    ).length;
    
    const uniqueToFramework2 = req2.length - sharedRequirements.filter(s => 
      s.requirement2.frameworks.includes(framework2)
    ).length;

    const mappingQuality = sharedRequirements.length > 0 ? 
      totalMappingQuality / sharedRequirements.length : 0;

    return {
      framework1,
      framework2,
      overlapCount,
      overlapPercentage: Math.round(overlapPercentage),
      uniqueToFramework1,
      uniqueToFramework2,
      sharedRequirements,
      mappingQuality: Math.round(mappingQuality * 100)
    };
  }

  /**
   * Get mapping confidence between requirements
   */
  private getMappingConfidence(
    req1: RequirementData,
    req2: RequirementData,
    framework1: string,
    framework2: string
  ): number {
    
    const mapping1 = req1.mappings.find(m => m.framework === framework1);
    const mapping2 = req2.mappings.find(m => m.framework === framework2);
    
    if (mapping1 && mapping2) {
      return (mapping1.confidence + mapping2.confidence) / 2;
    } else if (mapping1) {
      return mapping1.confidence;
    } else if (mapping2) {
      return mapping2.confidence;
    }
    
    return 0.5; // Default confidence
  }

  /**
   * Determine consolidation potential
   */
  private determineConsolidationPotential(
    similarity: number,
    mappingConfidence: number
  ): 'high' | 'medium' | 'low' {
    
    const combinedScore = (similarity + mappingConfidence) / 2;
    
    if (combinedScore >= this.CONSOLIDATION_THRESHOLD) {
      return 'high';
    } else if (combinedScore >= this.SIMILARITY_THRESHOLD) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate heatmap data for visualization
   */
  private generateHeatmapData(
    frameworkPairs: FrameworkPairOverlap[],
    frameworks: string[]
  ): HeatmapData {
    
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i < frameworks.length; i++) {
      matrix[i] = new Array(frameworks.length).fill(0);
      matrix[i][i] = 100; // Self-overlap is 100%
    }

    // Fill matrix with overlap data
    for (const pair of frameworkPairs) {
      const index1 = frameworks.indexOf(pair.framework1);
      const index2 = frameworks.indexOf(pair.framework2);
      
      if (index1 !== -1 && index2 !== -1) {
        matrix[index1][index2] = pair.overlapPercentage;
        matrix[index2][index1] = pair.overlapPercentage; // Symmetric
      }
    }

    // Calculate statistics
    const allValues = matrix.flatMap(row => row).filter(val => val !== 100); // Exclude self-overlap
    const maxOverlap = Math.max(...allValues);
    const minOverlap = Math.min(...allValues);
    const avgOverlap = allValues.length > 0 ? 
      allValues.reduce((sum, val) => sum + val, 0) / allValues.length : 0;

    return {
      frameworks,
      matrix,
      maxOverlap,
      minOverlap,
      avgOverlap: Math.round(avgOverlap)
    };
  }

  /**
   * Analyze overlap by category
   */
  private analyzeCategoryOverlap(
    requirements: RequirementData[],
    frameworks: string[]
  ): CategoryOverlap[] {
    
    const categories = [...new Set(requirements.map(r => r.category))];
    const categoryOverlaps: CategoryOverlap[] = [];

    for (const category of categories) {
      const categoryReqs = requirements.filter(r => r.category === category);
      
      // Calculate framework distribution
      const frameworkDistribution: FrameworkDistribution[] = [];
      for (const framework of frameworks) {
        const count = categoryReqs.filter(r => r.frameworks.includes(framework)).length;
        const percentage = categoryReqs.length > 0 ? (count / categoryReqs.length) * 100 : 0;
        
        frameworkDistribution.push({
          framework,
          requirementCount: count,
          percentage: Math.round(percentage)
        });
      }

      // Calculate overlap percentage
      const uniqueGroups = this.groupBySimilarity(categoryReqs);
      const overlapPercentage = categoryReqs.length > 0 ? 
        ((categoryReqs.length - uniqueGroups.length) / categoryReqs.length) * 100 : 0;

      // Calculate consolidation opportunity
      const consolidationOpportunity = this.calculateConsolidationOpportunity(categoryReqs);

      categoryOverlaps.push({
        category,
        totalRequirements: categoryReqs.length,
        frameworkDistribution,
        overlapPercentage: Math.round(overlapPercentage),
        consolidationOpportunity: Math.round(consolidationOpportunity)
      });
    }

    return categoryOverlaps.sort((a, b) => b.consolidationOpportunity - a.consolidationOpportunity);
  }

  /**
   * Calculate consolidation opportunity for a category
   */
  private calculateConsolidationOpportunity(requirements: RequirementData[]): number {
    if (requirements.length <= 1) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        totalSimilarity += this.calculateRequirementSimilarity(requirements[i], requirements[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;
  }

  /**
   * Analyze unique requirements by framework
   */
  private analyzeUniqueRequirements(
    requirements: RequirementData[],
    frameworks: string[]
  ): UniqueRequirementAnalysis {
    
    const byFramework: FrameworkUniqueAnalysis[] = [];
    
    for (const framework of frameworks) {
      const frameworkReqs = requirements.filter(r => r.frameworks.includes(framework));
      
      // Find unique requirements (not shared with other frameworks)
      const uniqueReqs = frameworkReqs.filter(req => {
        const otherFrameworkReqs = requirements.filter(r => 
          !r.frameworks.includes(framework) && 
          r.frameworks.some(f => frameworks.includes(f))
        );
        
        return !otherFrameworkReqs.some(otherReq => 
          this.calculateRequirementSimilarity(req, otherReq) >= this.SIMILARITY_THRESHOLD
        );
      });

      const uniquenessPercentage = frameworkReqs.length > 0 ? 
        (uniqueReqs.length / frameworkReqs.length) * 100 : 0;

      byFramework.push({
        framework,
        totalRequirements: frameworkReqs.length,
        uniqueRequirements: uniqueReqs.length,
        sharedRequirements: frameworkReqs.length - uniqueReqs.length,
        uniquenessPercentage: Math.round(uniquenessPercentage)
      });
    }

    // Find most and least unique frameworks
    const sortedByUniqueness = [...byFramework].sort((a, b) => b.uniquenessPercentage - a.uniquenessPercentage);
    const mostUniqueFramework = sortedByUniqueness[0]?.framework || '';
    const leastUniqueFramework = sortedByUniqueness[sortedByUniqueness.length - 1]?.framework || '';

    const totalUnique = byFramework.reduce((sum, analysis) => sum + analysis.uniqueRequirements, 0);

    return {
      byFramework,
      totalUnique,
      mostUniqueFramework,
      leastUniqueFramework
    };
  }

  /**
   * Perform comprehensive coverage analysis
   */
  private performCoverageAnalysis(
    requirements: RequirementData[],
    frameworks: string[]
  ): CoverageAnalysis {
    
    const byCategory = this.analyzeCategoryCoverage(requirements, frameworks);
    const gapAnalysis = this.performGapAnalysis(requirements, frameworks);
    const redundancyAnalysis = this.performRedundancyAnalysis(requirements);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      byCategory,
      gapAnalysis,
      redundancyAnalysis
    );

    return {
      byCategory,
      gapAnalysis,
      redundancyAnalysis,
      optimizationOpportunities
    };
  }

  /**
   * Analyze coverage by category
   */
  private analyzeCategoryCoverage(
    requirements: RequirementData[],
    frameworks: string[]
  ): CategoryCoverage[] {
    
    const categories = [...new Set(requirements.map(r => r.category))];
    const coverage: CategoryCoverage[] = [];

    for (const category of categories) {
      const categoryReqs = requirements.filter(r => r.category === category);
      const uniqueGroups = this.groupBySimilarity(categoryReqs);
      
      const totalPossibleRequirements = uniqueGroups.length;
      const coveredRequirements = categoryReqs.length;
      const coveragePercentage = totalPossibleRequirements > 0 ? 
        (coveredRequirements / totalPossibleRequirements) * 100 : 0;

      // Identify missing and over-covered frameworks
      const frameworkCounts = frameworks.map(f => ({
        framework: f,
        count: categoryReqs.filter(r => r.frameworks.includes(f)).length
      }));

      const avgCount = frameworkCounts.reduce((sum, fc) => sum + fc.count, 0) / frameworks.length;
      const missingFromFrameworks = frameworkCounts
        .filter(fc => fc.count < avgCount * 0.5)
        .map(fc => fc.framework);
      
      const overCoveredByFrameworks = frameworkCounts
        .filter(fc => fc.count > avgCount * 1.5)
        .map(fc => fc.framework);

      coverage.push({
        category,
        totalPossibleRequirements,
        coveredRequirements,
        coveragePercentage: Math.round(coveragePercentage),
        missingFromFrameworks,
        overCoveredByFrameworks
      });
    }

    return coverage;
  }

  /**
   * Perform gap analysis
   */
  private performGapAnalysis(
    requirements: RequirementData[],
    frameworks: string[]
  ): RequirementGap[] {
    
    const gaps: RequirementGap[] = [];
    const categories = [...new Set(requirements.map(r => r.category))];

    for (const category of categories) {
      const categoryReqs = requirements.filter(r => r.category === category);
      
      // Find frameworks with missing requirements in this category
      for (const framework of frameworks) {
        const frameworkReqs = categoryReqs.filter(r => r.frameworks.includes(framework));
        const otherFrameworkReqs = categoryReqs.filter(r => !r.frameworks.includes(framework));
        
        // Find requirements missing from this framework
        for (const otherReq of otherFrameworkReqs) {
          const hasSimilar = frameworkReqs.some(req => 
            this.calculateRequirementSimilarity(req, otherReq) >= this.SIMILARITY_THRESHOLD
          );
          
          if (!hasSimilar) {
            gaps.push({
              category,
              missingRequirement: otherReq.title,
              affectedFrameworks: [framework],
              impactLevel: this.assessGapImpact(otherReq, frameworks),
              suggestedAction: this.generateGapSuggestion(otherReq, framework)
            });
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Assess impact level of a gap
   */
  private assessGapImpact(requirement: RequirementData, frameworks: string[]): 'high' | 'medium' | 'low' {
    const coverageCount = requirement.frameworks.length;
    const totalFrameworks = frameworks.length;
    
    if (coverageCount >= totalFrameworks * 0.8) return 'high';
    if (coverageCount >= totalFrameworks * 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate suggestion for gap
   */
  private generateGapSuggestion(requirement: RequirementData, framework: string): string {
    return `Consider adding similar requirement to ${framework} framework: "${requirement.title}"`;
  }

  /**
   * Perform redundancy analysis
   */
  private performRedundancyAnalysis(requirements: RequirementData[]): RequirementRedundancy[] {
    const redundancies: RequirementRedundancy[] = [];
    const categories = [...new Set(requirements.map(r => r.category))];

    for (const category of categories) {
      const categoryReqs = requirements.filter(r => r.category === category);
      const redundantGroups: RequirementData[][] = [];
      const processed = new Set<string>();

      // Find redundant requirement groups
      for (const req of categoryReqs) {
        if (processed.has(req.id)) continue;

        const redundantGroup = [req];
        processed.add(req.id);

        for (const otherReq of categoryReqs) {
          if (processed.has(otherReq.id)) continue;

          const similarity = this.calculateRequirementSimilarity(req, otherReq);
          if (similarity >= this.CONSOLIDATION_THRESHOLD) {
            redundantGroup.push(otherReq);
            processed.add(otherReq.id);
          }
        }

        if (redundantGroup.length > 1) {
          redundantGroups.push(redundantGroup);
        }
      }

      // Calculate redundancy metrics for each group
      for (const group of redundantGroups) {
        const redundancyLevel = this.calculateRedundancyLevel(group);
        const consolidationPotential = this.calculateConsolidationPotential(group);

        redundancies.push({
          category,
          redundantRequirements: group,
          redundancyLevel: Math.round(redundancyLevel),
          consolidationPotential: Math.round(consolidationPotential)
        });
      }
    }

    return redundancies.sort((a, b) => b.consolidationPotential - a.consolidationPotential);
  }

  /**
   * Calculate redundancy level for a group
   */
  private calculateRedundancyLevel(requirements: RequirementData[]): number {
    if (requirements.length <= 1) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        totalSimilarity += this.calculateRequirementSimilarity(requirements[i], requirements[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;
  }

  /**
   * Calculate consolidation potential for a group
   */
  private calculateConsolidationPotential(requirements: RequirementData[]): number {
    // Higher potential if requirements are very similar and from different frameworks
    const avgSimilarity = this.calculateRedundancyLevel(requirements);
    const frameworkDiversity = new Set(requirements.flatMap(r => r.frameworks)).size;
    
    // More diverse frameworks = higher consolidation potential
    const diversityBonus = Math.min(frameworkDiversity * 20, 40);
    
    return Math.min(100, avgSimilarity + diversityBonus);
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(
    coverage: CategoryCoverage[],
    gaps: RequirementGap[],
    redundancies: RequirementRedundancy[]
  ): OptimizationOpportunity[] {
    
    const opportunities: OptimizationOpportunity[] = [];

    // Consolidation opportunities from redundancies
    for (const redundancy of redundancies) {
      if (redundancy.consolidationPotential > 70) {
        opportunities.push({
          type: 'consolidation',
          description: `High consolidation potential in ${redundancy.category} with ${redundancy.redundantRequirements.length} similar requirements`,
          affectedFrameworks: [...new Set(redundancy.redundantRequirements.flatMap(r => r.frameworks))],
          estimatedImpact: redundancy.consolidationPotential,
          implementationEffort: redundancy.redundantRequirements.length > 5 ? 'high' : 'medium'
        });
      }
    }

    // Gap filling opportunities
    const highImpactGaps = gaps.filter(gap => gap.impactLevel === 'high');
    if (highImpactGaps.length > 0) {
      opportunities.push({
        type: 'gap_filling',
        description: `${highImpactGaps.length} high-impact requirement gaps identified`,
        affectedFrameworks: [...new Set(highImpactGaps.flatMap(gap => gap.affectedFrameworks))],
        estimatedImpact: 80,
        implementationEffort: highImpactGaps.length > 10 ? 'high' : 'medium'
      });
    }

    // Redundancy removal opportunities
    const highRedundancy = redundancies.filter(r => r.redundancyLevel > 80);
    if (highRedundancy.length > 0) {
      opportunities.push({
        type: 'redundancy_removal',
        description: `${highRedundancy.length} categories with high redundancy can be streamlined`,
        affectedFrameworks: [...new Set(highRedundancy.flatMap(r => r.redundantRequirements.flatMap(req => req.frameworks)))],
        estimatedImpact: 70,
        implementationEffort: 'low'
      });
    }

    return opportunities.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  /**
   * Perform what-if analysis
   */
  private async performWhatIfAnalysis(
    allRequirements: RequirementData[],
    currentSelection: FrameworkSelection,
    whatIfSelection: FrameworkSelection
  ): Promise<WhatIfComparison> {
    
    // Calculate current scenario
    const currentFrameworks = this.getActiveFrameworks(currentSelection);
    const currentRequirements = this.filterRequirementsByFrameworks(allRequirements, currentFrameworks);
    const currentScenario = this.calculateOverallStats(currentRequirements, currentFrameworks);

    // Calculate what-if scenario
    const whatIfFrameworks = this.getActiveFrameworks(whatIfSelection);
    const whatIfRequirements = this.filterRequirementsByFrameworks(allRequirements, whatIfFrameworks);
    const whatIfScenario = this.calculateOverallStats(whatIfRequirements, whatIfFrameworks);

    // Calculate impact
    const impact: WhatIfImpact = {
      requirementsDelta: whatIfScenario.totalRequirements - currentScenario.totalRequirements,
      overlapDelta: whatIfScenario.overlapPercentage - currentScenario.overlapPercentage,
      efficiencyDelta: whatIfScenario.efficiencyGain - currentScenario.efficiencyGain,
      complexityDelta: whatIfScenario.complexityReduction - currentScenario.complexityReduction,
      addedValue: this.calculateAddedValue(currentFrameworks, whatIfFrameworks),
      removedValue: this.calculateRemovedValue(currentFrameworks, whatIfFrameworks)
    };

    // Generate recommendation
    const recommendation = this.generateWhatIfRecommendation(currentScenario, whatIfScenario, impact);

    return {
      currentScenario,
      whatIfScenario,
      impact,
      recommendation
    };
  }

  /**
   * Calculate added value from framework changes
   */
  private calculateAddedValue(currentFrameworks: string[], whatIfFrameworks: string[]): string[] {
    return whatIfFrameworks.filter(framework => !currentFrameworks.includes(framework));
  }

  /**
   * Calculate removed value from framework changes
   */
  private calculateRemovedValue(currentFrameworks: string[], whatIfFrameworks: string[]): string[] {
    return currentFrameworks.filter(framework => !whatIfFrameworks.includes(framework));
  }

  /**
   * Generate what-if recommendation
   */
  private generateWhatIfRecommendation(
    current: OverlapStats,
    whatIf: OverlapStats,
    impact: WhatIfImpact
  ): string {
    
    if (impact.efficiencyDelta > 10) {
      return `Recommended: The proposed changes would increase efficiency by ${impact.efficiencyDelta}% and reduce complexity by ${impact.complexityDelta}%`;
    } else if (impact.efficiencyDelta < -10) {
      return `Not recommended: The proposed changes would decrease efficiency by ${Math.abs(impact.efficiencyDelta)}% and may increase complexity`;
    } else if (impact.requirementsDelta > 0 && impact.addedValue.length > 0) {
      return `Neutral impact: Adding ${impact.addedValue.join(', ')} would add ${impact.requirementsDelta} requirements with minimal efficiency change`;
    } else {
      return `Minimal impact: The proposed changes would have little effect on overall compliance efficiency`;
    }
  }

  /**
   * Generate optimization summary report
   */
  generateOptimizationSummary(result: OverlapResult): string {
    let summary = `FRAMEWORK OVERLAP ANALYSIS SUMMARY\n\n`;

    summary += `OVERALL STATISTICS:\n`;
    summary += `- Total Requirements: ${result.overallStats.totalRequirements}\n`;
    summary += `- Unique Requirements: ${result.overallStats.uniqueRequirements}\n`;
    summary += `- Overlap Percentage: ${result.overallStats.overlapPercentage}%\n`;
    summary += `- Efficiency Gain: ${result.overallStats.efficiencyGain}%\n`;
    summary += `- Complexity Reduction: ${result.overallStats.complexityReduction}%\n\n`;

    summary += `TOP FRAMEWORK OVERLAPS:\n`;
    const topOverlaps = result.frameworkPairs
      .sort((a, b) => b.overlapPercentage - a.overlapPercentage)
      .slice(0, 3);
    
    topOverlaps.forEach((pair, index) => {
      summary += `${index + 1}. ${pair.framework1} ↔ ${pair.framework2}: ${pair.overlapPercentage}%\n`;
    });

    summary += `\nCONSOLIDATION OPPORTUNITIES:\n`;
    const topOpportunities = result.coverageAnalysis.optimizationOpportunities
      .slice(0, 3);
    
    topOpportunities.forEach((opp, index) => {
      summary += `${index + 1}. ${opp.description} (Impact: ${opp.estimatedImpact}%)\n`;
    });

    if (result.whatIfComparison) {
      summary += `\nWHAT-IF ANALYSIS:\n`;
      summary += `${result.whatIfComparison.recommendation}\n`;
    }

    return summary;
  }
}