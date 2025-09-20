/**
 * CompliancePreservationValidator.ts
 * Validates that merged requirements preserve compliance meaning (≥95%)
 * Identifies compliance gaps and missing details
 */

import { ProcessedRequirement, ComplianceEntity } from './types';
import { HarmonizationConfig } from './RequirementHarmonizer';

export interface PreservationValidationResult {
  preservation_score: number;
  complexity_ratio: number;
  critical_terms_preserved: string[];
  evidence_requirements: string[];
  compliance_gaps: ComplianceGap[];
  audit_impact_issues: AuditImpactIssue[];
  recommendations: ValidationRecommendation[];
  validation_metadata: ValidationMetadata;
}

export interface ComplianceGap {
  gap_type: 'MISSING_REQUIREMENT' | 'WEAKENED_CONTROL' | 'SCOPE_REDUCTION' | 'FREQUENCY_CHANGE';
  original_framework: string;
  missing_element: string;
  impact_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  remediation_suggestion: string;
}

export interface AuditImpactIssue {
  issue_type: 'EVIDENCE_REDUCTION' | 'TRACEABILITY_LOSS' | 'CONTROL_AMBIGUITY' | 'COMPLIANCE_UNCERTAINTY';
  affected_frameworks: string[];
  description: string;
  audit_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigation_strategies: string[];
}

export interface ValidationRecommendation {
  recommendation_type: 'MANUAL_REVIEW' | 'ADDITIONAL_CONTROLS' | 'CLARIFICATION_NEEDED' | 'ACCEPTABLE_AS_IS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  action_items: string[];
}

export interface ValidationMetadata {
  total_requirements_analyzed: number;
  frameworks_covered: string[];
  critical_entities_count: number;
  validation_time_ms: number;
  confidence_level: number;
  validation_method: string;
}

export interface ComplianceMetrics {
  control_preservation: number;
  policy_preservation: number;
  process_preservation: number;
  requirement_preservation: number;
  domain_preservation: number;
  overall_preservation: number;
}

export interface TextComplexityAnalysis {
  original_complexity: number;
  unified_complexity: number;
  complexity_increase: number;
  readability_impact: number;
  technical_term_density_change: number;
}

export class CompliancePreservationValidator {
  private config: HarmonizationConfig;
  private complianceKeywords: Map<string, number>;
  private frameworkSpecificTerms: Map<string, Set<string>>;
  private auditCriticalTerms: Set<string>;

  constructor(config: HarmonizationConfig) {
    this.config = config;
    this.initializeComplianceKeywords();
    this.initializeFrameworkTerms();
    this.initializeAuditCriticalTerms();
  }

  /**
   * Validate that unified requirement preserves compliance meaning
   */
  async validatePreservation(
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string
  ): Promise<PreservationValidationResult> {
    const startTime = performance.now();

    if (sourceRequirements.length === 0) {
      throw new Error('No source requirements provided for validation');
    }

    // Step 1: Calculate compliance preservation metrics
    const complianceMetrics = this.calculateComplianceMetrics(sourceRequirements, unifiedText);

    // Step 2: Analyze text complexity changes
    const complexityAnalysis = this.analyzeTextComplexity(sourceRequirements, unifiedText);

    // Step 3: Identify compliance gaps
    const complianceGaps = this.identifyComplianceGaps(sourceRequirements, unifiedText);

    // Step 4: Assess audit impact
    const auditImpactIssues = this.assessAuditImpact(sourceRequirements, unifiedText, complianceGaps);

    // Step 5: Generate recommendations
    const recommendations = this.generateRecommendations(
      complianceMetrics,
      complianceGaps,
      auditImpactIssues
    );

    // Step 6: Extract preserved elements
    const criticalTermsPreserved = this.extractPreservedCriticalTerms(sourceRequirements, unifiedText);
    const evidenceRequirements = this.extractEvidenceRequirements(sourceRequirements, unifiedText);

    const validationTime = performance.now() - startTime;

    return {
      preservation_score: complianceMetrics.overall_preservation,
      complexity_ratio: complexityAnalysis.complexity_increase,
      critical_terms_preserved: criticalTermsPreserved,
      evidence_requirements: evidenceRequirements,
      compliance_gaps: complianceGaps,
      audit_impact_issues: auditImpactIssues,
      recommendations: recommendations,
      validation_metadata: {
        total_requirements_analyzed: sourceRequirements.length,
        frameworks_covered: Array.from(new Set(sourceRequirements.map(req => req.framework))),
        critical_entities_count: this.countCriticalEntities(sourceRequirements),
        validation_time_ms: validationTime,
        confidence_level: this.calculateConfidenceLevel(complianceMetrics, complexityAnalysis),
        validation_method: 'SEMANTIC_ENTITY_ANALYSIS'
      }
    };
  }

  /**
   * Calculate compliance preservation metrics by entity type
   */
  private calculateComplianceMetrics(
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string
  ): ComplianceMetrics {
    const entityTypes = ['CONTROL', 'POLICY', 'PROCESS', 'REQUIREMENT', 'DOMAIN'];
    const preservationScores: { [key: string]: number } = {};

    for (const entityType of entityTypes) {
      const originalEntities = this.extractEntitiesByType(sourceRequirements, entityType);
      const preservedEntities = this.findPreservedEntities(originalEntities, unifiedText);
      
      preservationScores[entityType.toLowerCase() + '_preservation'] = 
        originalEntities.length > 0 ? preservedEntities.length / originalEntities.length : 1.0;
    }

    // Calculate overall preservation as weighted average
    const weights = { control: 0.3, policy: 0.2, process: 0.2, requirement: 0.2, domain: 0.1 };
    const overallPreservation = Object.keys(weights).reduce((sum, key) => 
      sum + (preservationScores[key + '_preservation'] * weights[key]), 0
    );

    return {
      control_preservation: preservationScores.control_preservation,
      policy_preservation: preservationScores.policy_preservation,
      process_preservation: preservationScores.process_preservation,
      requirement_preservation: preservationScores.requirement_preservation,
      domain_preservation: preservationScores.domain_preservation,
      overall_preservation: overallPreservation
    };
  }

  /**
   * Analyze text complexity changes
   */
  private analyzeTextComplexity(
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string
  ): TextComplexityAnalysis {
    const originalComplexity = this.calculateAverageComplexity(sourceRequirements);
    const unifiedComplexity = this.calculateTextComplexity(unifiedText);
    const complexityIncrease = unifiedComplexity / originalComplexity;

    const originalReadability = this.calculateAverageReadability(sourceRequirements);
    const unifiedReadability = this.calculateReadabilityScore(unifiedText);
    const readabilityImpact = (originalReadability - unifiedReadability) / originalReadability;

    const originalTechDensity = this.calculateAverageTechnicalDensity(sourceRequirements);
    const unifiedTechDensity = this.calculateTechnicalTermDensity(unifiedText);
    const techDensityChange = (unifiedTechDensity - originalTechDensity) / originalTechDensity;

    return {
      original_complexity: originalComplexity,
      unified_complexity: unifiedComplexity,
      complexity_increase: complexityIncrease,
      readability_impact: readabilityImpact,
      technical_term_density_change: techDensityChange
    };
  }

  /**
   * Identify compliance gaps in unified requirement
   */
  private identifyComplianceGaps(
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string
  ): ComplianceGap[] {
    const gaps: ComplianceGap[] = [];

    for (const requirement of sourceRequirements) {
      // Check for missing critical entities
      const missingEntities = this.findMissingCriticalEntities(requirement, unifiedText);
      for (const entity of missingEntities) {
        gaps.push({
          gap_type: this.determineGapType(entity),
          original_framework: requirement.framework,
          missing_element: entity.text,
          impact_severity: entity.criticality,
          description: `Critical ${entity.type.toLowerCase()} "${entity.text}" not preserved in unified requirement`,
          remediation_suggestion: this.generateRemediationSuggestion(entity)
        });
      }

      // Check for weakened control language
      const weakenedControls = this.detectWeakenedControls(requirement, unifiedText);
      for (const control of weakenedControls) {
        gaps.push({
          gap_type: 'WEAKENED_CONTROL',
          original_framework: requirement.framework,
          missing_element: control.original,
          impact_severity: 'HIGH',
          description: `Control language weakened: "${control.original}" became "${control.weakened}"`,
          remediation_suggestion: 'Restore original control strength or add clarifying language'
        });
      }

      // Check for scope reductions
      const scopeReductions = this.detectScopeReductions(requirement, unifiedText);
      for (const reduction of scopeReductions) {
        gaps.push({
          gap_type: 'SCOPE_REDUCTION',
          original_framework: requirement.framework,
          missing_element: reduction.reducedScope,
          impact_severity: 'MEDIUM',
          description: `Requirement scope reduced: ${reduction.description}`,
          remediation_suggestion: 'Expand scope to match original requirement or document justified reduction'
        });
      }
    }

    return gaps;
  }

  /**
   * Assess audit impact of harmonization
   */
  private assessAuditImpact(
    sourceRequirements: ProcessedRequirement[],
    unifiedText: string,
    complianceGaps: ComplianceGap[]
  ): AuditImpactIssue[] {
    const issues: AuditImpactIssue[] = [];

    // Evidence reduction impact
    const evidenceReduction = this.assessEvidenceReduction(sourceRequirements, unifiedText);
    if (evidenceReduction.severity !== 'NONE') {
      issues.push({
        issue_type: 'EVIDENCE_REDUCTION',
        affected_frameworks: evidenceReduction.frameworks,
        description: evidenceReduction.description,
        audit_risk_level: evidenceReduction.severity,
        mitigation_strategies: evidenceReduction.mitigations
      });
    }

    // Traceability loss
    const traceabilityLoss = this.assessTraceabilityLoss(sourceRequirements, unifiedText);
    if (traceabilityLoss.hasLoss) {
      issues.push({
        issue_type: 'TRACEABILITY_LOSS',
        affected_frameworks: traceabilityLoss.frameworks,
        description: traceabilityLoss.description,
        audit_risk_level: traceabilityLoss.riskLevel,
        mitigation_strategies: [
          'Maintain mapping table of unified to original requirements',
          'Include framework-specific references in documentation'
        ]
      });
    }

    // Control ambiguity
    const controlAmbiguity = this.assessControlAmbiguity(unifiedText, complianceGaps);
    if (controlAmbiguity.hasAmbiguity) {
      issues.push({
        issue_type: 'CONTROL_AMBIGUITY',
        affected_frameworks: controlAmbiguity.frameworks,
        description: controlAmbiguity.description,
        audit_risk_level: controlAmbiguity.riskLevel,
        mitigation_strategies: [
          'Add clarifying language to ambiguous controls',
          'Provide implementation guidance for unified requirements'
        ]
      });
    }

    return issues;
  }

  /**
   * Generate validation recommendations
   */
  private generateRecommendations(
    complianceMetrics: ComplianceMetrics,
    complianceGaps: ComplianceGap[],
    auditImpactIssues: AuditImpactIssue[]
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Overall preservation assessment
    if (complianceMetrics.overall_preservation >= this.config.quality_thresholds.min_compliance_preservation) {
      if (complianceGaps.length === 0 && auditImpactIssues.length === 0) {
        recommendations.push({
          recommendation_type: 'ACCEPTABLE_AS_IS',
          priority: 'LOW',
          description: 'Unified requirement meets all preservation thresholds and has no significant gaps',
          action_items: ['Document harmonization rationale for audit purposes']
        });
      } else {
        recommendations.push({
          recommendation_type: 'MANUAL_REVIEW',
          priority: 'MEDIUM',
          description: 'High preservation score but some gaps identified',
          action_items: [
            'Review identified compliance gaps',
            'Assess audit impact of minor issues',
            'Consider additional controls if needed'
          ]
        });
      }
    } else {
      recommendations.push({
        recommendation_type: 'MANUAL_REVIEW',
        priority: 'HIGH',
        description: `Preservation score ${complianceMetrics.overall_preservation.toFixed(3)} below threshold ${this.config.quality_thresholds.min_compliance_preservation}`,
        action_items: [
          'Conduct detailed review of compliance gaps',
          'Consider keeping requirements separate',
          'Implement additional controls to address gaps'
        ]
      });
    }

    // Critical gaps requiring urgent attention
    const criticalGaps = complianceGaps.filter(gap => gap.impact_severity === 'CRITICAL');
    if (criticalGaps.length > 0) {
      recommendations.push({
        recommendation_type: 'ADDITIONAL_CONTROLS',
        priority: 'URGENT',
        description: `${criticalGaps.length} critical compliance gaps identified`,
        action_items: criticalGaps.map(gap => gap.remediation_suggestion)
      });
    }

    // High audit risk issues
    const highRiskIssues = auditImpactIssues.filter(issue => issue.audit_risk_level === 'HIGH' || issue.audit_risk_level === 'CRITICAL');
    if (highRiskIssues.length > 0) {
      recommendations.push({
        recommendation_type: 'CLARIFICATION_NEEDED',
        priority: 'HIGH',
        description: 'High audit risk issues require clarification',
        action_items: highRiskIssues.flatMap(issue => issue.mitigation_strategies)
      });
    }

    return recommendations;
  }

  /**
   * Helper methods for entity and text analysis
   */
  private extractEntitiesByType(requirements: ProcessedRequirement[], entityType: string): ComplianceEntity[] {
    return requirements.flatMap(req => req.entities.filter(entity => entity.type === entityType));
  }

  private findPreservedEntities(originalEntities: ComplianceEntity[], unifiedText: string): ComplianceEntity[] {
    return originalEntities.filter(entity => 
      this.isEntityPreserved(entity, unifiedText)
    );
  }

  private isEntityPreserved(entity: ComplianceEntity, text: string): boolean {
    const entityText = entity.text.toLowerCase();
    const unifiedTextLower = text.toLowerCase();
    
    // Exact match
    if (unifiedTextLower.includes(entityText)) return true;
    
    // Semantic match for critical terms
    if (entity.criticality === 'CRITICAL' || entity.criticality === 'HIGH') {
      const keywords = entityText.split(/\s+/);
      const preservedKeywords = keywords.filter(keyword => 
        unifiedTextLower.includes(keyword) || this.hasSynonym(keyword, unifiedTextLower)
      );
      return preservedKeywords.length / keywords.length >= 0.8;
    }
    
    return false;
  }

  private findMissingCriticalEntities(requirement: ProcessedRequirement, unifiedText: string): ComplianceEntity[] {
    return requirement.entities.filter(entity => 
      (entity.criticality === 'CRITICAL' || entity.criticality === 'HIGH') &&
      !this.isEntityPreserved(entity, unifiedText)
    );
  }

  private detectWeakenedControls(requirement: ProcessedRequirement, unifiedText: string): Array<{original: string, weakened: string}> {
    const weakenedControls: Array<{original: string, weakened: string}> = [];
    
    // Check for weakening language changes
    const strengtheningTerms = ['shall', 'must', 'required', 'mandatory'];
    const weakeningTerms = ['should', 'may', 'consider', 'recommend'];
    
    for (const term of strengtheningTerms) {
      if (requirement.normalized_text.toLowerCase().includes(term) && 
          !unifiedText.toLowerCase().includes(term)) {
        
        // Check if replaced with weaker term
        for (const weakTerm of weakeningTerms) {
          if (unifiedText.toLowerCase().includes(weakTerm)) {
            weakenedControls.push({
              original: term,
              weakened: weakTerm
            });
            break;
          }
        }
      }
    }
    
    return weakenedControls;
  }

  private detectScopeReductions(requirement: ProcessedRequirement, unifiedText: string): Array<{reducedScope: string, description: string}> {
    const reductions: Array<{reducedScope: string, description: string}> = [];
    
    // Check for removed scope indicators
    const scopeIndicators = ['all', 'every', 'each', 'entire', 'complete', 'comprehensive'];
    
    for (const indicator of scopeIndicators) {
      if (requirement.normalized_text.toLowerCase().includes(indicator) && 
          !unifiedText.toLowerCase().includes(indicator)) {
        reductions.push({
          reducedScope: indicator,
          description: `Scope indicator "${indicator}" removed from unified requirement`
        });
      }
    }
    
    return reductions;
  }

  private assessEvidenceReduction(requirements: ProcessedRequirement[], unifiedText: string): any {
    const originalEvidence = this.extractAllEvidenceRequirements(requirements);
    const preservedEvidence = originalEvidence.filter(evidence => 
      unifiedText.toLowerCase().includes(evidence.toLowerCase())
    );
    
    const reductionRatio = 1 - (preservedEvidence.length / Math.max(1, originalEvidence.length));
    
    if (reductionRatio > 0.3) {
      return {
        severity: 'HIGH' as const,
        frameworks: Array.from(new Set(requirements.map(req => req.framework))),
        description: `${Math.round(reductionRatio * 100)}% of evidence requirements not preserved`,
        mitigations: [
          'Restore missing evidence requirements',
          'Create supplementary evidence guidance',
          'Map evidence to unified requirement'
        ]
      };
    } else if (reductionRatio > 0.1) {
      return {
        severity: 'MEDIUM' as const,
        frameworks: Array.from(new Set(requirements.map(req => req.framework))),
        description: `${Math.round(reductionRatio * 100)}% of evidence requirements not preserved`,
        mitigations: [
          'Review missing evidence requirements',
          'Consider if reduction is acceptable'
        ]
      };
    }
    
    return { severity: 'NONE' as const };
  }

  private assessTraceabilityLoss(requirements: ProcessedRequirement[], unifiedText: string): any {
    const frameworkReferences = requirements.flatMap(req => req.structure.references);
    const preservedReferences = frameworkReferences.filter(ref => 
      unifiedText.toLowerCase().includes(ref.toLowerCase())
    );
    
    const lossRatio = 1 - (preservedReferences.length / Math.max(1, frameworkReferences.length));
    
    return {
      hasLoss: lossRatio > 0.2,
      frameworks: Array.from(new Set(requirements.map(req => req.framework))),
      description: `${Math.round(lossRatio * 100)}% of framework references not preserved`,
      riskLevel: lossRatio > 0.5 ? 'HIGH' as const : 'MEDIUM' as const
    };
  }

  private assessControlAmbiguity(unifiedText: string, gaps: ComplianceGap[]): any {
    const ambiguityIndicators = gaps.filter(gap => gap.gap_type === 'WEAKENED_CONTROL').length;
    
    return {
      hasAmbiguity: ambiguityIndicators > 0,
      frameworks: Array.from(new Set(gaps.map(gap => gap.original_framework))),
      description: `${ambiguityIndicators} control ambiguity issues identified`,
      riskLevel: ambiguityIndicators > 2 ? 'HIGH' as const : 'MEDIUM' as const
    };
  }

  private extractAllEvidenceRequirements(requirements: ProcessedRequirement[]): string[] {
    const evidenceTerms = new Set<string>();
    
    for (const req of requirements) {
      const evidenceEntities = req.entities.filter(entity => 
        entity.text.toLowerCase().includes('evidence') ||
        entity.text.toLowerCase().includes('document') ||
        entity.text.toLowerCase().includes('record')
      );
      
      evidenceEntities.forEach(entity => evidenceTerms.add(entity.text));
      
      req.structure.references.forEach(ref => {
        if (ref.toLowerCase().includes('evidence') || ref.toLowerCase().includes('documentation')) {
          evidenceTerms.add(ref);
        }
      });
    }
    
    return Array.from(evidenceTerms);
  }

  private extractPreservedCriticalTerms(requirements: ProcessedRequirement[], unifiedText: string): string[] {
    const criticalTerms = new Set<string>();
    
    for (const req of requirements) {
      for (const keyword of req.keywords) {
        if (this.auditCriticalTerms.has(keyword.toLowerCase()) && 
            unifiedText.toLowerCase().includes(keyword.toLowerCase())) {
          criticalTerms.add(keyword);
        }
      }
    }
    
    return Array.from(criticalTerms);
  }

  private extractEvidenceRequirements(requirements: ProcessedRequirement[], unifiedText: string): string[] {
    const allEvidence = this.extractAllEvidenceRequirements(requirements);
    return allEvidence.filter(evidence => 
      unifiedText.toLowerCase().includes(evidence.toLowerCase())
    );
  }

  private countCriticalEntities(requirements: ProcessedRequirement[]): number {
    return requirements.reduce((count, req) => 
      count + req.entities.filter(entity => 
        entity.criticality === 'CRITICAL' || entity.criticality === 'HIGH'
      ).length, 0
    );
  }

  private calculateConfidenceLevel(metrics: ComplianceMetrics, complexity: TextComplexityAnalysis): number {
    const preservationConfidence = metrics.overall_preservation;
    const complexityConfidence = complexity.complexity_increase <= 1.3 ? 1 : (1.3 / complexity.complexity_increase);
    
    return (preservationConfidence * 0.7) + (complexityConfidence * 0.3);
  }

  private calculateAverageComplexity(requirements: ProcessedRequirement[]): number {
    return requirements.reduce((sum, req) => sum + req.metadata.complexity, 0) / requirements.length;
  }

  private calculateTextComplexity(text: string): number {
    // Simplified complexity calculation based on sentence length and word complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const avgSentenceLength = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;
    
    return (avgSentenceLength * 0.4) + (longWordRatio * 100 * 0.6);
  }

  private calculateAverageReadability(requirements: ProcessedRequirement[]): number {
    return requirements.reduce((sum, req) => sum + req.metadata.readability_score, 0) / requirements.length;
  }

  private calculateReadabilityScore(text: string): number {
    // Flesch Reading Ease calculation
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  }

  private calculateAverageTechnicalDensity(requirements: ProcessedRequirement[]): number {
    return requirements.reduce((sum, req) => 
      sum + (req.metadata.technical_terms.length / req.metadata.word_count), 0
    ) / requirements.length;
  }

  private calculateTechnicalTermDensity(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const technicalTerms = words.filter(word => this.complianceKeywords.has(word));
    return technicalTerms.length / words.length;
  }

  private countSyllables(text: string): number {
    const vowelPattern = /[aeiouy]+/gi;
    const matches = text.match(vowelPattern);
    return matches ? matches.length : 1;
  }

  private determineGapType(entity: ComplianceEntity): 'MISSING_REQUIREMENT' | 'WEAKENED_CONTROL' | 'SCOPE_REDUCTION' | 'FREQUENCY_CHANGE' {
    switch (entity.type) {
      case 'CONTROL': return 'WEAKENED_CONTROL';
      case 'REQUIREMENT': return 'MISSING_REQUIREMENT';
      case 'DOMAIN': return 'SCOPE_REDUCTION';
      default: return 'MISSING_REQUIREMENT';
    }
  }

  private generateRemediationSuggestion(entity: ComplianceEntity): string {
    switch (entity.type) {
      case 'CONTROL':
        return 'Add explicit control language to unified requirement';
      case 'POLICY':
        return 'Include policy reference or incorporate policy requirements';
      case 'PROCESS':
        return 'Specify process steps or reference process documentation';
      case 'REQUIREMENT':
        return 'Incorporate missing requirement into unified text';
      default:
        return 'Review and address missing compliance element';
    }
  }

  private hasSynonym(keyword: string, text: string): boolean {
    // Simple synonym checking for common compliance terms
    const synonyms: { [key: string]: string[] } = {
      'shall': ['must', 'required', 'mandatory'],
      'must': ['shall', 'required', 'mandatory'],
      'document': ['record', 'log', 'evidence'],
      'monitor': ['track', 'observe', 'watch'],
      'assess': ['evaluate', 'review', 'analyze']
    };
    
    const keywordSynonyms = synonyms[keyword.toLowerCase()] || [];
    return keywordSynonyms.some(synonym => text.includes(synonym));
  }

  private initializeComplianceKeywords(): void {
    this.complianceKeywords = new Map([
      ['shall', 10], ['must', 10], ['required', 9], ['mandatory', 9],
      ['compliance', 8], ['audit', 8], ['evidence', 7], ['documentation', 7],
      ['policy', 6], ['procedure', 6], ['control', 8], ['monitor', 6],
      ['review', 5], ['assess', 6], ['validate', 6], ['verify', 7],
      ['implement', 5], ['maintain', 5], ['ensure', 6], ['security', 8],
      ['privacy', 7], ['confidentiality', 7], ['integrity', 7], ['availability', 7]
    ]);
  }

  private initializeFrameworkTerms(): void {
    this.frameworkSpecificTerms = new Map([
      ['ISO27001', new Set(['isms', 'annex', 'clause', 'certification'])],
      ['NIS2', new Set(['essential', 'important', 'incident', 'cybersecurity'])],
      ['GDPR', new Set(['personal', 'processing', 'controller', 'processor'])],
      ['SOX', new Set(['internal', 'financial', 'disclosure', 'controls'])],
      ['PCI', new Set(['cardholder', 'payment', 'secure', 'encryption'])]
    ]);
  }

  private initializeAuditCriticalTerms(): void {
    this.auditCriticalTerms = new Set([
      'shall', 'must', 'required', 'mandatory', 'compliance', 'audit',
      'evidence', 'documentation', 'policy', 'procedure', 'control',
      'monitor', 'review', 'assess', 'validate', 'verify', 'implement',
      'maintain', 'ensure', 'security', 'privacy', 'risk', 'threat',
      'vulnerability', 'incident', 'breach', 'unauthorized', 'approved',
      'authorized', 'designated', 'responsible', 'accountable'
    ]);
  }
}