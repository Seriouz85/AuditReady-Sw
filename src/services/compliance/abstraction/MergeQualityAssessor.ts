/**
 * MergeQualityAssessor.ts
 * Assesses quality of proposed merges before execution
 * Validates compliance preservation and calculates risk scores
 */

import {
  ProcessedRequirement,
  ComplianceEntity,
  RequirementStructure
} from './types';
import { DeduplicationConfig } from './IntelligentDeduplicationEngine';

export interface QualityAssessmentResult {
  overall_score: number;
  compliance_preservation_score: number;
  text_complexity_ratio: number;
  confidence_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  quality_issues: QualityIssue[];
  merge_recommendations: MergeRecommendation[];
  assessment_metadata: AssessmentMetadata;
}

export interface QualityIssue {
  issue_type: 'COMPLIANCE_GAP' | 'COMPLEXITY_INCREASE' | 'INFORMATION_LOSS' | 'FRAMEWORK_MISMATCH' | 'ENTITY_CONFLICT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affected_requirements: string[];
  impact_assessment: string;
  mitigation_strategies: string[];
  blocking_merge: boolean;
}

export interface MergeRecommendation {
  recommendation_type: 'PROCEED_WITH_MERGE' | 'MERGE_WITH_MODIFICATIONS' | 'KEEP_SEPARATE' | 'MANUAL_REVIEW_REQUIRED';
  confidence_level: number;
  reasoning: string;
  suggested_modifications: string[];
  quality_thresholds_met: boolean;
  compliance_risk_acceptable: boolean;
}

export interface AssessmentMetadata {
  assessment_timestamp: Date;
  requirements_analyzed: number;
  frameworks_involved: string[];
  total_entities_analyzed: number;
  critical_entities_count: number;
  assessment_method: string;
  processing_time_ms: number;
  validator_version: string;
}

export interface CompliancePreservationAnalysis {
  entity_preservation_score: number;
  keyword_preservation_score: number;
  structure_preservation_score: number;
  domain_preservation_score: number;
  framework_preservation_score: number;
  overall_preservation: number;
  critical_losses: CriticalLoss[];
  preserved_elements: PreservedElement[];
}

export interface CriticalLoss {
  loss_type: 'CRITICAL_ENTITY' | 'MANDATORY_KEYWORD' | 'CONTROL_LANGUAGE' | 'EVIDENCE_REQUIREMENT' | 'SCOPE_DEFINITION';
  lost_element: string;
  original_requirement: string;
  impact_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compliance_implications: string[];
  recovery_possible: boolean;
  recovery_strategy?: string;
}

export interface PreservedElement {
  element_type: 'ENTITY' | 'KEYWORD' | 'STRUCTURE' | 'DOMAIN' | 'FRAMEWORK';
  element_value: string;
  preservation_confidence: number;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_requirements: string[];
}

export interface TextComplexityAssessment {
  original_complexity_average: number;
  projected_unified_complexity: number;
  complexity_increase_ratio: number;
  readability_impact: number;
  technical_density_change: number;
  sentence_structure_impact: number;
  vocabulary_complexity_change: number;
  acceptable_complexity_level: boolean;
}

export interface FrameworkHarmonizationAssessment {
  frameworks_involved: string[];
  cross_framework_compatibility: number;
  framework_specific_requirements: FrameworkRequirement[];
  harmonization_challenges: HarmonizationChallenge[];
  regulatory_conflict_risk: number;
  audit_traceability_preserved: boolean;
}

export interface FrameworkRequirement {
  framework: string;
  requirement_id: string;
  uniqueness_score: number;
  merge_safe: boolean;
  special_handling_needed: boolean;
  handling_instructions?: string[];
}

export interface HarmonizationChallenge {
  challenge_type: 'TERMINOLOGY_CONFLICT' | 'SCOPE_MISMATCH' | 'FREQUENCY_DIFFERENCE' | 'EVIDENCE_VARIANCE' | 'CONTROL_LEVEL_DIFFERENCE';
  affected_frameworks: string[];
  description: string;
  resolution_difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  recommended_approach: string;
}

export class MergeQualityAssessor {
  private config: DeduplicationConfig;
  private criticalComplianceTerms: Set<string>;
  private frameworkSpecificTerms: Map<string, Set<string>>;
  private qualityThresholds: QualityThresholds;

  constructor(config: DeduplicationConfig) {
    this.config = config;
    this.initializeCriticalTerms();
    this.initializeFrameworkTerms();
    this.initializeQualityThresholds();
  }

  /**
   * Main quality assessment method for proposed merges
   */
  async assessMergeQuality(
    requirements: ProcessedRequirement[],
    proposedSimilarityThreshold: number,
    unifiedText?: string
  ): Promise<QualityAssessmentResult> {
    const startTime = performance.now();

    if (requirements.length < 2) {
      throw new Error('Cannot assess merge quality for less than 2 requirements');
    }

    console.log(`Assessing merge quality for ${requirements.length} requirements...`);

    // Step 1: Analyze compliance preservation
    const complianceAnalysis = await this.analyzeCompliancePreservation(requirements, unifiedText);

    // Step 2: Assess text complexity impact
    const complexityAssessment = await this.assessTextComplexity(requirements, unifiedText);

    // Step 3: Evaluate framework harmonization
    const frameworkAssessment = await this.assessFrameworkHarmonization(requirements);

    // Step 4: Identify quality issues
    const qualityIssues = this.identifyQualityIssues(
      requirements,
      complianceAnalysis,
      complexityAssessment,
      frameworkAssessment
    );

    // Step 5: Calculate overall scores
    const overallScore = this.calculateOverallQualityScore(
      complianceAnalysis,
      complexityAssessment,
      frameworkAssessment,
      qualityIssues
    );

    // Step 6: Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore, qualityIssues);

    // Step 7: Generate recommendations
    const recommendations = this.generateMergeRecommendations(
      overallScore,
      riskLevel,
      qualityIssues,
      complianceAnalysis
    );

    const processingTime = performance.now() - startTime;

    return {
      overall_score: overallScore,
      compliance_preservation_score: complianceAnalysis.overall_preservation,
      text_complexity_ratio: complexityAssessment.complexity_increase_ratio,
      confidence_score: Math.min(
        complianceAnalysis.overall_preservation,
        complexityAssessment.acceptable_complexity_level ? 1.0 : 0.7,
        frameworkAssessment.cross_framework_compatibility
      ),
      risk_level: riskLevel,
      quality_issues: qualityIssues,
      merge_recommendations: recommendations,
      assessment_metadata: {
        assessment_timestamp: new Date(),
        requirements_analyzed: requirements.length,
        frameworks_involved: Array.from(new Set(requirements.map(r => r.framework))),
        total_entities_analyzed: requirements.reduce((sum, r) => sum + r.entities.length, 0),
        critical_entities_count: requirements.reduce((sum, r) => 
          sum + r.entities.filter(e => e.criticality === 'CRITICAL' || e.criticality === 'HIGH').length, 0
        ),
        assessment_method: 'COMPREHENSIVE_QUALITY_ANALYSIS',
        processing_time_ms: processingTime,
        validator_version: '1.0.0'
      }
    };
  }

  /**
   * Assess overall quality for a complete deduplication result
   */
  async assessOverallQuality(
    harmonizedRequirements: ProcessedRequirement[],
    originalRequirements: ProcessedRequirement[]
  ): Promise<QualityAssessmentResult> {
    if (harmonizedRequirements.length === 0) {
      return this.createEmptyAssessment();
    }

    // Aggregate assessment across all harmonized requirements
    const individualAssessments: QualityAssessmentResult[] = [];

    // Group harmonized requirements by their source requirements (simplified)
    for (const harmonized of harmonizedRequirements) {
      // For simplicity, treat each harmonized requirement as a single-item assessment
      const assessment = await this.assessMergeQuality([harmonized], 1.0);
      individualAssessments.push(assessment);
    }

    // Calculate aggregate metrics
    const avgOverallScore = individualAssessments.reduce((sum, a) => sum + a.overall_score, 0) / individualAssessments.length;
    const avgComplianceScore = individualAssessments.reduce((sum, a) => sum + a.compliance_preservation_score, 0) / individualAssessments.length;
    const avgComplexityRatio = individualAssessments.reduce((sum, a) => sum + a.text_complexity_ratio, 0) / individualAssessments.length;
    const avgConfidenceScore = individualAssessments.reduce((sum, a) => sum + a.confidence_score, 0) / individualAssessments.length;

    // Aggregate quality issues
    const allQualityIssues = individualAssessments.flatMap(a => a.quality_issues);
    const highSeverityIssues = allQualityIssues.filter(issue => 
      issue.severity === 'HIGH' || issue.severity === 'CRITICAL'
    );

    // Determine overall risk level
    const overallRiskLevel = this.determineRiskLevel(avgOverallScore, allQualityIssues);

    // Generate overall recommendations
    const overallRecommendations = this.generateOverallRecommendations(
      avgOverallScore,
      overallRiskLevel,
      highSeverityIssues,
      originalRequirements.length,
      harmonizedRequirements.length
    );

    return {
      overall_score: avgOverallScore,
      compliance_preservation_score: avgComplianceScore,
      text_complexity_ratio: avgComplexityRatio,
      confidence_score: avgConfidenceScore,
      risk_level: overallRiskLevel,
      quality_issues: allQualityIssues,
      merge_recommendations: overallRecommendations,
      assessment_metadata: {
        assessment_timestamp: new Date(),
        requirements_analyzed: harmonizedRequirements.length,
        frameworks_involved: Array.from(new Set(harmonizedRequirements.map(r => r.framework))),
        total_entities_analyzed: harmonizedRequirements.reduce((sum, r) => sum + r.entities.length, 0),
        critical_entities_count: harmonizedRequirements.reduce((sum, r) => 
          sum + r.entities.filter(e => e.criticality === 'CRITICAL' || e.criticality === 'HIGH').length, 0
        ),
        assessment_method: 'OVERALL_DEDUPLICATION_QUALITY',
        processing_time_ms: 0,
        validator_version: '1.0.0'
      }
    };
  }

  /**
   * Analyze compliance preservation across requirements
   */
  private async analyzeCompliancePreservation(
    requirements: ProcessedRequirement[],
    unifiedText?: string
  ): Promise<CompliancePreservationAnalysis> {
    // Entity preservation analysis
    const allEntities = requirements.flatMap(r => r.entities);
    const criticalEntities = allEntities.filter(e => e.criticality === 'CRITICAL' || e.criticality === 'HIGH');
    
    let entityPreservationScore = 1.0;
    let preservedElements: PreservedElement[] = [];
    let criticalLosses: CriticalLoss[] = [];

    if (unifiedText) {
      // Check which entities are preserved in unified text
      const preservedEntityCount = allEntities.filter(entity => 
        this.isEntityPreservedInText(entity, unifiedText)
      ).length;
      
      entityPreservationScore = allEntities.length > 0 ? preservedEntityCount / allEntities.length : 1.0;

      // Identify critical losses
      const lostCriticalEntities = criticalEntities.filter(entity => 
        !this.isEntityPreservedInText(entity, unifiedText)
      );

      criticalLosses = lostCriticalEntities.map(entity => ({
        loss_type: 'CRITICAL_ENTITY',
        lost_element: entity.text,
        original_requirement: requirements.find(r => r.entities.includes(entity))?.id || 'unknown',
        impact_severity: entity.criticality,
        compliance_implications: [`Loss of critical ${entity.type.toLowerCase()}: ${entity.text}`],
        recovery_possible: true,
        recovery_strategy: `Add "${entity.text}" to unified requirement`
      }));

      // Track preserved elements
      preservedElements = allEntities
        .filter(entity => this.isEntityPreservedInText(entity, unifiedText))
        .map(entity => ({
          element_type: 'ENTITY',
          element_value: entity.text,
          preservation_confidence: 0.9,
          criticality: entity.criticality,
          source_requirements: [requirements.find(r => r.entities.includes(entity))?.id || 'unknown']
        }));
    }

    // Keyword preservation analysis
    const allKeywords = Array.from(new Set(requirements.flatMap(r => r.keywords)));
    const criticalKeywords = allKeywords.filter(k => this.criticalComplianceTerms.has(k.toLowerCase()));
    
    let keywordPreservationScore = 1.0;
    if (unifiedText) {
      const preservedKeywords = allKeywords.filter(keyword => 
        unifiedText.toLowerCase().includes(keyword.toLowerCase())
      );
      keywordPreservationScore = allKeywords.length > 0 ? preservedKeywords.length / allKeywords.length : 1.0;

      // Check for lost critical keywords
      const lostCriticalKeywords = criticalKeywords.filter(keyword => 
        !unifiedText.toLowerCase().includes(keyword.toLowerCase())
      );

      lostCriticalKeywords.forEach(keyword => {
        criticalLosses.push({
          loss_type: 'MANDATORY_KEYWORD',
          lost_element: keyword,
          original_requirement: 'multiple',
          impact_severity: 'HIGH',
          compliance_implications: [`Loss of critical compliance keyword: ${keyword}`],
          recovery_possible: true,
          recovery_strategy: `Include "${keyword}" in unified requirement`
        });
      });
    }

    // Structure preservation analysis
    const structurePreservationScore = this.analyzeStructurePreservation(requirements, unifiedText);

    // Domain preservation analysis
    const domains = Array.from(new Set(requirements.map(r => r.metadata.domain)));
    const domainPreservationScore = domains.length <= 1 ? 1.0 : 0.8; // Slight penalty for cross-domain merges

    // Framework preservation analysis
    const frameworks = Array.from(new Set(requirements.map(r => r.framework)));
    const frameworkPreservationScore = frameworks.length === 1 ? 1.0 : 
      this.calculateCrossFrameworkPreservation(frameworks);

    // Calculate overall preservation
    const overallPreservation = (
      entityPreservationScore * 0.3 +
      keywordPreservationScore * 0.25 +
      structurePreservationScore * 0.2 +
      domainPreservationScore * 0.15 +
      frameworkPreservationScore * 0.1
    );

    return {
      entity_preservation_score: entityPreservationScore,
      keyword_preservation_score: keywordPreservationScore,
      structure_preservation_score: structurePreservationScore,
      domain_preservation_score: domainPreservationScore,
      framework_preservation_score: frameworkPreservationScore,
      overall_preservation: overallPreservation,
      critical_losses: criticalLosses,
      preserved_elements: preservedElements
    };
  }

  /**
   * Assess text complexity impact of merge
   */
  private async assessTextComplexity(
    requirements: ProcessedRequirement[],
    unifiedText?: string
  ): Promise<TextComplexityAssessment> {
    // Calculate original complexity average
    const originalComplexityAvg = requirements.reduce((sum, r) => sum + r.metadata.complexity, 0) / requirements.length;

    // Estimate unified complexity (or calculate if unified text provided)
    let projectedComplexity = originalComplexityAvg * 1.1; // Default estimate
    if (unifiedText) {
      projectedComplexity = this.calculateTextComplexity(unifiedText);
    }

    const complexityIncreaseRatio = projectedComplexity / originalComplexityAvg;

    // Calculate readability impact
    const originalReadabilityAvg = requirements.reduce((sum, r) => sum + r.metadata.readability_score, 0) / requirements.length;
    let projectedReadability = originalReadabilityAvg * 0.95; // Slight penalty for merging
    if (unifiedText) {
      projectedReadability = this.calculateReadabilityScore(unifiedText);
    }
    const readabilityImpact = (originalReadabilityAvg - projectedReadability) / originalReadabilityAvg;

    // Technical density analysis
    const originalTechDensityAvg = requirements.reduce((sum, r) => 
      sum + (r.metadata.technical_terms.length / r.metadata.word_count), 0
    ) / requirements.length;
    
    let projectedTechDensity = originalTechDensityAvg * 1.05; // Slight increase expected
    if (unifiedText) {
      projectedTechDensity = this.calculateTechnicalDensity(unifiedText);
    }
    const techDensityChange = (projectedTechDensity - originalTechDensityAvg) / originalTechDensityAvg;

    // Sentence structure impact (placeholder calculation)
    const sentenceStructureImpact = complexityIncreaseRatio > 1.2 ? 0.3 : 0.1;

    // Vocabulary complexity change
    const vocabularyComplexityChange = techDensityChange;

    // Determine if complexity is acceptable
    const acceptableComplexityLevel = complexityIncreaseRatio <= this.config.quality_requirements.max_complexity_increase;

    return {
      original_complexity_average: originalComplexityAvg,
      projected_unified_complexity: projectedComplexity,
      complexity_increase_ratio: complexityIncreaseRatio,
      readability_impact: readabilityImpact,
      technical_density_change: techDensityChange,
      sentence_structure_impact: sentenceStructureImpact,
      vocabulary_complexity_change: vocabularyComplexityChange,
      acceptable_complexity_level: acceptableComplexityLevel
    };
  }

  /**
   * Assess framework harmonization challenges
   */
  private async assessFrameworkHarmonization(requirements: ProcessedRequirement[]): Promise<FrameworkHarmonizationAssessment> {
    const frameworks = Array.from(new Set(requirements.map(r => r.framework)));
    
    if (frameworks.length === 1) {
      // Single framework - minimal harmonization challenges
      return {
        frameworks_involved: frameworks,
        cross_framework_compatibility: 1.0,
        framework_specific_requirements: requirements.map(r => ({
          framework: r.framework,
          requirement_id: r.id,
          uniqueness_score: 0.5,
          merge_safe: true,
          special_handling_needed: false
        })),
        harmonization_challenges: [],
        regulatory_conflict_risk: 0.0,
        audit_traceability_preserved: true
      };
    }

    // Multi-framework analysis
    const compatibility = this.calculateFrameworkCompatibility(frameworks);
    const frameworkRequirements = this.analyzeFrameworkSpecificRequirements(requirements);
    const challenges = this.identifyHarmonizationChallenges(requirements, frameworks);
    const conflictRisk = this.assessRegulatoryConflictRisk(frameworks);
    const traceabilityPreserved = this.assessAuditTraceability(requirements);

    return {
      frameworks_involved: frameworks,
      cross_framework_compatibility: compatibility,
      framework_specific_requirements: frameworkRequirements,
      harmonization_challenges: challenges,
      regulatory_conflict_risk: conflictRisk,
      audit_traceability_preserved: traceabilityPreserved
    };
  }

  /**
   * Identify quality issues that may affect merge success
   */
  private identifyQualityIssues(
    requirements: ProcessedRequirement[],
    complianceAnalysis: CompliancePreservationAnalysis,
    complexityAssessment: TextComplexityAssessment,
    frameworkAssessment: FrameworkHarmonizationAssessment
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Compliance preservation issues
    if (complianceAnalysis.overall_preservation < this.config.quality_requirements.min_compliance_preservation) {
      issues.push({
        issue_type: 'COMPLIANCE_GAP',
        severity: 'HIGH',
        description: `Compliance preservation score ${complianceAnalysis.overall_preservation.toFixed(3)} below threshold ${this.config.quality_requirements.min_compliance_preservation}`,
        affected_requirements: requirements.map(r => r.id),
        impact_assessment: 'Risk of compliance gaps and audit failures',
        mitigation_strategies: [
          'Review and restore critical lost elements',
          'Add supplementary controls',
          'Consider keeping requirements separate'
        ],
        blocking_merge: true
      });
    }

    // Critical losses
    complianceAnalysis.critical_losses.forEach(loss => {
      if (loss.impact_severity === 'CRITICAL' || loss.impact_severity === 'HIGH') {
        issues.push({
          issue_type: 'INFORMATION_LOSS',
          severity: loss.impact_severity,
          description: `Critical information loss: ${loss.lost_element}`,
          affected_requirements: [loss.original_requirement],
          impact_assessment: loss.compliance_implications.join('; '),
          mitigation_strategies: loss.recovery_possible && loss.recovery_strategy 
            ? [loss.recovery_strategy]
            : ['Manual review required'],
          blocking_merge: loss.impact_severity === 'CRITICAL'
        });
      }
    });

    // Complexity issues
    if (!complexityAssessment.acceptable_complexity_level) {
      issues.push({
        issue_type: 'COMPLEXITY_INCREASE',
        severity: complexityAssessment.complexity_increase_ratio > 1.5 ? 'HIGH' : 'MEDIUM',
        description: `Text complexity increase ratio ${complexityAssessment.complexity_increase_ratio.toFixed(2)} exceeds threshold ${this.config.quality_requirements.max_complexity_increase}`,
        affected_requirements: requirements.map(r => r.id),
        impact_assessment: 'Reduced readability and increased implementation difficulty',
        mitigation_strategies: [
          'Simplify merged text',
          'Break into smaller components',
          'Add implementation guidance'
        ],
        blocking_merge: complexityAssessment.complexity_increase_ratio > 2.0
      });
    }

    // Framework compatibility issues
    if (frameworkAssessment.cross_framework_compatibility < 0.7) {
      issues.push({
        issue_type: 'FRAMEWORK_MISMATCH',
        severity: frameworkAssessment.cross_framework_compatibility < 0.5 ? 'HIGH' : 'MEDIUM',
        description: `Low cross-framework compatibility: ${frameworkAssessment.cross_framework_compatibility.toFixed(2)}`,
        affected_requirements: requirements.map(r => r.id),
        impact_assessment: 'Risk of regulatory conflicts and audit confusion',
        mitigation_strategies: [
          'Maintain framework-specific versions',
          'Add cross-reference mappings',
          'Seek regulatory guidance'
        ],
        blocking_merge: frameworkAssessment.cross_framework_compatibility < 0.5
      });
    }

    // Entity conflicts
    const entityConflicts = this.detectEntityConflicts(requirements);
    entityConflicts.forEach(conflict => {
      issues.push({
        issue_type: 'ENTITY_CONFLICT',
        severity: 'MEDIUM',
        description: `Entity conflict detected: ${conflict.description}`,
        affected_requirements: conflict.affected_requirements,
        impact_assessment: 'Potential semantic ambiguity in merged requirement',
        mitigation_strategies: conflict.resolution_strategies,
        blocking_merge: false
      });
    });

    return issues.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQualityScore(
    complianceAnalysis: CompliancePreservationAnalysis,
    complexityAssessment: TextComplexityAssessment,
    frameworkAssessment: FrameworkHarmonizationAssessment,
    qualityIssues: QualityIssue[]
  ): number {
    // Base score from compliance preservation
    let score = complianceAnalysis.overall_preservation * 0.5;

    // Complexity penalty
    const complexityScore = complexityAssessment.acceptable_complexity_level ? 1.0 : 
      Math.max(0.0, 1.0 - ((complexityAssessment.complexity_increase_ratio - 1.0) * 0.5));
    score += complexityScore * 0.25;

    // Framework compatibility
    score += frameworkAssessment.cross_framework_compatibility * 0.15;

    // Quality issues penalty
    const criticalIssues = qualityIssues.filter(issue => issue.severity === 'CRITICAL').length;
    const highIssues = qualityIssues.filter(issue => issue.severity === 'HIGH').length;
    const mediumIssues = qualityIssues.filter(issue => issue.severity === 'MEDIUM').length;

    const issuesPenalty = (criticalIssues * 0.3) + (highIssues * 0.15) + (mediumIssues * 0.05);
    score -= Math.min(score * 0.4, issuesPenalty); // Cap penalty at 40% of current score

    // Ensure score is between 0 and 1
    return Math.max(0.0, Math.min(1.0, score));
  }

  /**
   * Determine risk level based on score and issues
   */
  private determineRiskLevel(overallScore: number, qualityIssues: QualityIssue[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const blockingIssues = qualityIssues.filter(issue => issue.blocking_merge);
    const criticalIssues = qualityIssues.filter(issue => issue.severity === 'CRITICAL');
    const highIssues = qualityIssues.filter(issue => issue.severity === 'HIGH');

    if (blockingIssues.length > 0 || criticalIssues.length > 0) {
      return 'CRITICAL';
    }

    if (overallScore < 0.7 || highIssues.length > 2) {
      return 'HIGH';
    }

    if (overallScore < 0.85 || highIssues.length > 0) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Generate merge recommendations based on assessment
   */
  private generateMergeRecommendations(
    overallScore: number,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    qualityIssues: QualityIssue[],
    complianceAnalysis: CompliancePreservationAnalysis
  ): MergeRecommendation[] {
    const recommendations: MergeRecommendation[] = [];

    const qualityThresholdsMet = overallScore >= this.config.quality_requirements.min_compliance_preservation;
    const complianceRiskAcceptable = riskLevel !== 'CRITICAL' && riskLevel !== 'HIGH';

    if (riskLevel === 'LOW' && qualityThresholdsMet) {
      recommendations.push({
        recommendation_type: 'PROCEED_WITH_MERGE',
        confidence_level: overallScore,
        reasoning: 'High quality merge with minimal risks detected',
        suggested_modifications: [],
        quality_thresholds_met: true,
        compliance_risk_acceptable: true
      });
    } else if (riskLevel === 'MEDIUM' && qualityThresholdsMet) {
      const modifications = qualityIssues
        .filter(issue => !issue.blocking_merge)
        .flatMap(issue => issue.mitigation_strategies);

      recommendations.push({
        recommendation_type: 'MERGE_WITH_MODIFICATIONS',
        confidence_level: overallScore,
        reasoning: 'Acceptable merge quality with some modifications needed',
        suggested_modifications: Array.from(new Set(modifications)),
        quality_thresholds_met: true,
        compliance_risk_acceptable: true
      });
    } else if (riskLevel === 'HIGH' || !qualityThresholdsMet) {
      recommendations.push({
        recommendation_type: 'MANUAL_REVIEW_REQUIRED',
        confidence_level: overallScore,
        reasoning: 'Quality concerns require human review before proceeding',
        suggested_modifications: [
          'Address compliance preservation issues',
          'Review critical information losses',
          'Validate framework compatibility'
        ],
        quality_thresholds_met: qualityThresholdsMet,
        compliance_risk_acceptable: false
      });
    } else {
      recommendations.push({
        recommendation_type: 'KEEP_SEPARATE',
        confidence_level: overallScore,
        reasoning: 'Critical quality issues make merge inadvisable',
        suggested_modifications: [],
        quality_thresholds_met: false,
        compliance_risk_acceptable: false
      });
    }

    return recommendations;
  }

  /**
   * Helper methods for detailed analysis
   */
  private isEntityPreservedInText(entity: ComplianceEntity, text: string): boolean {
    const entityText = entity.text.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Direct text match
    if (textLower.includes(entityText)) return true;
    
    // Semantic match for critical entities
    if (entity.criticality === 'CRITICAL' || entity.criticality === 'HIGH') {
      const keywords = entityText.split(/\s+/);
      const preservedKeywords = keywords.filter(keyword => textLower.includes(keyword));
      return preservedKeywords.length / keywords.length >= 0.8;
    }
    
    return false;
  }

  private analyzeStructurePreservation(requirements: ProcessedRequirement[], unifiedText?: string): number {
    if (!unifiedText) return 0.8; // Default estimate when no unified text

    // Analyze preservation of structural elements
    const allStructuralElements = requirements.flatMap(r => [
      ...r.structure.sub_clauses,
      ...r.structure.conditions,
      ...r.structure.action_verbs
    ]);

    if (allStructuralElements.length === 0) return 1.0;

    const preservedElements = allStructuralElements.filter(element =>
      unifiedText.toLowerCase().includes(element.toLowerCase())
    );

    return preservedElements.length / allStructuralElements.length;
  }

  private calculateCrossFrameworkPreservation(frameworks: string[]): number {
    if (frameworks.length <= 1) return 1.0;
    
    // Calculate compatibility between all framework pairs
    let totalCompatibility = 0;
    let pairCount = 0;

    for (let i = 0; i < frameworks.length; i++) {
      for (let j = i + 1; j < frameworks.length; j++) {
        const compatibility = this.getFrameworkCompatibility(frameworks[i], frameworks[j]);
        totalCompatibility += compatibility;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalCompatibility / pairCount : 0.5;
  }

  private getFrameworkCompatibility(framework1: string, framework2: string): number {
    // Simplified compatibility matrix
    const compatibilityRules: { [key: string]: number } = {
      'ISO27001_NIS2': 0.8,
      'ISO27001_GDPR': 0.7,
      'NIS2_GDPR': 0.9,
      'ISO27001_SOC2': 0.6,
      'NIST_ISO27001': 0.8
    };

    const key1 = `${framework1}_${framework2}`;
    const key2 = `${framework2}_${framework1}`;
    
    return compatibilityRules[key1] || compatibilityRules[key2] || 0.5;
  }

  private calculateTextComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;
    
    return (avgSentenceLength * 0.4) + (longWordRatio * 100 * 0.6);
  }

  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  }

  private calculateTechnicalDensity(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const technicalTerms = words.filter(word => this.criticalComplianceTerms.has(word));
    return technicalTerms.length / words.length;
  }

  private countSyllables(text: string): number {
    const vowelPattern = /[aeiouy]+/gi;
    const matches = text.match(vowelPattern);
    return matches ? matches.length : 1;
  }

  private calculateFrameworkCompatibility(frameworks: string[]): number {
    if (frameworks.length <= 1) return 1.0;
    
    let totalCompatibility = 0;
    let pairCount = 0;

    for (let i = 0; i < frameworks.length; i++) {
      for (let j = i + 1; j < frameworks.length; j++) {
        totalCompatibility += this.getFrameworkCompatibility(frameworks[i], frameworks[j]);
        pairCount++;
      }
    }

    return pairCount > 0 ? totalCompatibility / pairCount : 0.5;
  }

  private analyzeFrameworkSpecificRequirements(requirements: ProcessedRequirement[]): FrameworkRequirement[] {
    return requirements.map(req => {
      const frameworkSpecificTerms = this.frameworkSpecificTerms.get(req.framework) || new Set();
      const hasSpecificTerms = req.keywords.some(keyword => 
        frameworkSpecificTerms.has(keyword.toLowerCase())
      );
      
      return {
        framework: req.framework,
        requirement_id: req.id,
        uniqueness_score: hasSpecificTerms ? 0.8 : 0.3,
        merge_safe: !hasSpecificTerms,
        special_handling_needed: hasSpecificTerms,
        handling_instructions: hasSpecificTerms 
          ? [`Preserve ${req.framework}-specific terminology`]
          : undefined
      };
    });
  }

  private identifyHarmonizationChallenges(requirements: ProcessedRequirement[], frameworks: string[]): HarmonizationChallenge[] {
    const challenges: HarmonizationChallenge[] = [];

    if (frameworks.length > 1) {
      // Check for terminology conflicts
      const terminologyConflicts = this.detectTerminologyConflicts(requirements);
      if (terminologyConflicts.length > 0) {
        challenges.push({
          challenge_type: 'TERMINOLOGY_CONFLICT',
          affected_frameworks: frameworks,
          description: `Conflicting terminology between frameworks: ${terminologyConflicts.join(', ')}`,
          resolution_difficulty: 'MEDIUM',
          recommended_approach: 'Use neutral terminology with framework-specific notes'
        });
      }

      // Check for scope mismatches
      const scopeMismatches = this.detectScopeMismatches(requirements);
      if (scopeMismatches) {
        challenges.push({
          challenge_type: 'SCOPE_MISMATCH',
          affected_frameworks: frameworks,
          description: 'Different scope requirements across frameworks',
          resolution_difficulty: 'HIGH',
          recommended_approach: 'Use broadest scope with framework-specific exceptions'
        });
      }
    }

    return challenges;
  }

  private detectTerminologyConflicts(requirements: ProcessedRequirement[]): string[] {
    // Simplified terminology conflict detection
    const conflictPairs = [
      ['shall', 'should'],
      ['must', 'may'],
      ['required', 'recommended']
    ];

    const conflicts: string[] = [];
    const allText = requirements.map(r => r.normalized_text).join(' ').toLowerCase();

    for (const [term1, term2] of conflictPairs) {
      if (allText.includes(term1) && allText.includes(term2)) {
        conflicts.push(`${term1} vs ${term2}`);
      }
    }

    return conflicts;
  }

  private detectScopeMismatches(requirements: ProcessedRequirement[]): boolean {
    const scopeIndicators = ['all', 'every', 'some', 'certain', 'specific'];
    const scopeCounts = requirements.map(req => 
      scopeIndicators.filter(indicator => 
        req.normalized_text.toLowerCase().includes(indicator)
      ).length
    );

    const variance = this.calculateVariance(scopeCounts);
    return variance > 1; // Arbitrary threshold for scope mismatch
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private assessRegulatoryConflictRisk(frameworks: string[]): number {
    if (frameworks.length <= 1) return 0.0;
    
    // Risk increases with number of frameworks
    const baseRisk = (frameworks.length - 1) * 0.2;
    
    // Additional risk for specific framework combinations
    const highRiskCombinations = [
      ['GDPR', 'CCPA'], // Different privacy regulations
      ['SOX', 'ISO27001'] // Financial vs security standards
    ];

    let additionalRisk = 0;
    for (const [fw1, fw2] of highRiskCombinations) {
      if (frameworks.includes(fw1) && frameworks.includes(fw2)) {
        additionalRisk += 0.3;
      }
    }

    return Math.min(1.0, baseRisk + additionalRisk);
  }

  private assessAuditTraceability(requirements: ProcessedRequirement[]): boolean {
    // Check if requirements maintain sufficient traceability information
    const hasReferences = requirements.every(req => 
      req.structure.references.length > 0 || req.framework
    );
    
    return hasReferences;
  }

  private detectEntityConflicts(requirements: ProcessedRequirement[]): Array<{
    description: string;
    affected_requirements: string[];
    resolution_strategies: string[];
  }> {
    const conflicts: Array<{
      description: string;
      affected_requirements: string[];
      resolution_strategies: string[];
    }> = [];

    // Group entities by type and text
    const entityGroups = new Map<string, ProcessedRequirement[]>();
    
    for (const req of requirements) {
      for (const entity of req.entities) {
        const key = `${entity.type}_${entity.text.toLowerCase()}`;
        if (!entityGroups.has(key)) {
          entityGroups.set(key, []);
        }
        entityGroups.get(key)!.push(req);
      }
    }

    // Check for conflicts (same entity text, different types)
    const textGroups = new Map<string, Set<string>>();
    for (const [key, reqs] of entityGroups) {
      const [type, text] = key.split('_', 2);
      if (!textGroups.has(text)) {
        textGroups.set(text, new Set());
      }
      textGroups.get(text)!.add(type);
    }

    for (const [text, types] of textGroups) {
      if (types.size > 1) {
        const affectedReqs = Array.from(entityGroups.entries())
          .filter(([key]) => key.includes(text))
          .flatMap(([, reqs]) => reqs.map(r => r.id));

        conflicts.push({
          description: `Entity "${text}" has conflicting types: ${Array.from(types).join(', ')}`,
          affected_requirements: Array.from(new Set(affectedReqs)),
          resolution_strategies: [
            'Use most specific entity type',
            'Combine entity types if semantically compatible',
            'Add clarifying context to resolve ambiguity'
          ]
        });
      }
    }

    return conflicts;
  }

  private generateOverallRecommendations(
    overallScore: number,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    highSeverityIssues: QualityIssue[],
    originalCount: number,
    harmonizedCount: number
  ): MergeRecommendation[] {
    const reductionPercentage = ((originalCount - harmonizedCount) / originalCount) * 100;
    
    return [{
      recommendation_type: riskLevel === 'LOW' ? 'PROCEED_WITH_MERGE' : 
                           riskLevel === 'MEDIUM' ? 'MERGE_WITH_MODIFICATIONS' : 
                           'MANUAL_REVIEW_REQUIRED',
      confidence_level: overallScore,
      reasoning: `Overall deduplication achieved ${reductionPercentage.toFixed(1)}% reduction with ${riskLevel.toLowerCase()} risk level`,
      suggested_modifications: highSeverityIssues.flatMap(issue => issue.mitigation_strategies),
      quality_thresholds_met: overallScore >= this.config.quality_requirements.min_compliance_preservation,
      compliance_risk_acceptable: riskLevel !== 'CRITICAL'
    }];
  }

  createEmptyAssessment(): QualityAssessmentResult {
    return {
      overall_score: 0,
      compliance_preservation_score: 0,
      text_complexity_ratio: 1.0,
      confidence_score: 0,
      risk_level: 'CRITICAL',
      quality_issues: [],
      merge_recommendations: [{
        recommendation_type: 'KEEP_SEPARATE',
        confidence_level: 0,
        reasoning: 'No requirements to assess',
        suggested_modifications: [],
        quality_thresholds_met: false,
        compliance_risk_acceptable: false
      }],
      assessment_metadata: {
        assessment_timestamp: new Date(),
        requirements_analyzed: 0,
        frameworks_involved: [],
        total_entities_analyzed: 0,
        critical_entities_count: 0,
        assessment_method: 'EMPTY_ASSESSMENT',
        processing_time_ms: 0,
        validator_version: '1.0.0'
      }
    };
  }

  private initializeCriticalTerms(): void {
    this.criticalComplianceTerms = new Set([
      'shall', 'must', 'required', 'mandatory', 'compliance', 'audit',
      'evidence', 'documentation', 'policy', 'procedure', 'control',
      'monitor', 'review', 'assess', 'validate', 'verify', 'implement',
      'maintain', 'ensure', 'security', 'privacy', 'confidentiality',
      'integrity', 'availability', 'risk', 'threat', 'vulnerability'
    ]);
  }

  private initializeFrameworkTerms(): void {
    this.frameworkSpecificTerms = new Map([
      ['ISO27001', new Set(['isms', 'annex', 'clause', 'certification', 'continual'])],
      ['NIS2', new Set(['essential', 'important', 'incident', 'cybersecurity', 'operator'])],
      ['GDPR', new Set(['personal', 'processing', 'controller', 'processor', 'consent'])],
      ['SOC2', new Set(['service', 'organization', 'trust', 'criteria', 'principle'])],
      ['NIST', new Set(['framework', 'subcategory', 'function', 'tier', 'profile'])]
    ]);
  }

  private initializeQualityThresholds(): void {
    this.qualityThresholds = {
      min_overall_score: this.config.quality_requirements.min_compliance_preservation,
      max_complexity_ratio: this.config.quality_requirements.max_complexity_increase,
      min_preservation_score: this.config.quality_requirements.min_compliance_preservation,
      max_critical_issues: this.config.quality_requirements.critical_gap_tolerance,
      min_framework_compatibility: 0.7
    };
  }
}

interface QualityThresholds {
  min_overall_score: number;
  max_complexity_ratio: number;
  min_preservation_score: number;
  max_critical_issues: number;
  min_framework_compatibility: number;
}