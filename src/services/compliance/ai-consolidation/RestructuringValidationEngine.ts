/**
 * RestructuringValidationEngine.ts
 * 
 * Comprehensive validation system for AI-restructured compliance content.
 * Ensures quality, consistency, and preservation of critical details.
 */

import { RestructuredResult, CategoryRestructureRequest, PreservedElements } from './CategoryTextRestructuringService';

export interface ValidationRequest {
  originalContent: string;
  restructuredContent: string;
  categoryName: string;
  selectedFrameworks: string[];
  expectedElements: ExpectedElements;
}

export interface ExpectedElements {
  requiredTimeframes: string[];
  requiredStandards: string[];
  requiredProcesses: string[];
  requiredFrameworkReferences: string[];
  minSubRequirements: number;
  maxAllowedReduction: number;
}

export interface ValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  validationResults: {
    contentPreservation: ContentPreservationResult;
    structuralIntegrity: StructuralIntegrityResult;
    qualityAssurance: QualityAssuranceResult;
    consistencyCheck: ConsistencyCheckResult;
  };
  issues: ValidationIssue[];
  recommendations: string[];
  mustFixIssues: string[];
}

export interface ContentPreservationResult {
  score: number;
  timeframesPreserved: boolean;
  timeframesFound: string[];
  timeframesMissing: string[];
  standardsPreserved: boolean;
  standardsFound: string[];
  standardsMissing: string[];
  processesPreserved: boolean;
  processesFound: string[];
  processesMissing: string[];
  frameworkReferencesPreserved: boolean;
  referencesFound: string[];
  referencesMissing: string[];
}

export interface StructuralIntegrityResult {
  score: number;
  hasValidSubRequirements: boolean;
  subRequirementsCount: number;
  hasProperFormatting: boolean;
  hasConsistentStructure: boolean;
  structureIssues: string[];
}

export interface QualityAssuranceResult {
  score: number;
  readabilityImproved: boolean;
  redundancyReduced: boolean;
  logicalOrganization: boolean;
  professionalLanguage: boolean;
  appropriateLength: boolean;
  qualityIssues: string[];
}

export interface ConsistencyCheckResult {
  score: number;
  isConsistentWithCategory: boolean;
  terminologyConsistent: boolean;
  formattingConsistent: boolean;
  consistencyIssues: string[];
}

export interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'content' | 'structure' | 'quality' | 'consistency';
  message: string;
  suggestion?: string;
}

export class RestructuringValidationEngine {
  
  /**
   * Validate restructured content comprehensively
   */
  async validateRestructuring(request: ValidationRequest): Promise<ValidationResult> {
    console.log(`🔍 [VALIDATION] Validating restructured content for ${request.categoryName}`);
    
    const validationResults = {
      contentPreservation: await this.validateContentPreservation(request),
      structuralIntegrity: await this.validateStructuralIntegrity(request),
      qualityAssurance: await this.validateQualityAssurance(request),
      consistencyCheck: await this.validateConsistency(request)
    };

    const issues = this.collectIssues(validationResults);
    const { recommendations, mustFixIssues } = this.generateRecommendations(validationResults, issues);
    
    const overallScore = this.calculateOverallScore(validationResults);
    const isValid = this.determineValidity(overallScore, issues);

    const result: ValidationResult = {
      isValid,
      overallScore,
      validationResults,
      issues,
      recommendations,
      mustFixIssues
    };

    console.log(`📊 [VALIDATION] ${request.categoryName} validation complete: ${overallScore}% (${isValid ? 'VALID' : 'INVALID'})`);
    
    return result;
  }

  /**
   * Validate content preservation
   */
  private async validateContentPreservation(request: ValidationRequest): Promise<ContentPreservationResult> {
    const original = request.originalContent;
    const restructured = request.restructuredContent;
    const expected = request.expectedElements;

    // Check timeframes
    const timeframesFound = this.extractTimeframes(restructured);
    const expectedTimeframes = this.extractTimeframes(original);
    const timeframesMissing = expectedTimeframes.filter(tf => 
      !timeframesFound.some(found => this.isTimeframeEquivalent(found, tf))
    );
    const timeframesPreserved = timeframesMissing.length === 0;

    // Check standards
    const standardsFound = this.extractStandards(restructured);
    const expectedStandards = this.extractStandards(original);
    const standardsMissing = expectedStandards.filter(std => 
      !standardsFound.some(found => this.isStandardEquivalent(found, std))
    );
    const standardsPreserved = standardsMissing.length === 0;

    // Check processes
    const processesFound = this.extractProcesses(restructured);
    const expectedProcesses = this.extractProcesses(original);
    const processesMissing = expectedProcesses.filter(proc => 
      !processesFound.some(found => this.isProcessEquivalent(found, proc))
    );
    const processesPreserved = processesMissing.length === 0;

    // Check framework references
    const referencesFound = this.extractFrameworkReferences(restructured);
    const expectedReferences = this.extractFrameworkReferences(original);
    const referencesMissing = expectedReferences.filter(ref => 
      !referencesFound.some(found => this.isReferenceEquivalent(found, ref))
    );
    const frameworkReferencesPreserved = referencesMissing.length === 0;

    // Calculate preservation score
    const preservationFactors = [
      timeframesPreserved ? 100 : Math.max(0, 100 - (timeframesMissing.length * 20)),
      standardsPreserved ? 100 : Math.max(0, 100 - (standardsMissing.length * 15)),
      processesPreserved ? 100 : Math.max(0, 100 - (processesMissing.length * 10)),
      frameworkReferencesPreserved ? 100 : Math.max(0, 100 - (referencesMissing.length * 25))
    ];
    
    const score = Math.round(preservationFactors.reduce((sum, factor) => sum + factor, 0) / preservationFactors.length);

    return {
      score,
      timeframesPreserved,
      timeframesFound,
      timeframesMissing,
      standardsPreserved,
      standardsFound,
      standardsMissing,
      processesPreserved,
      processesFound,
      processesMissing,
      frameworkReferencesPreserved,
      referencesFound,
      referencesMissing
    };
  }

  /**
   * Validate structural integrity
   */
  private async validateStructuralIntegrity(request: ValidationRequest): Promise<StructuralIntegrityResult> {
    const content = request.restructuredContent;
    const expected = request.expectedElements;

    // Check sub-requirements
    const subReqPattern = /^[a-p]\)\s*\*\*/gm;
    const subRequirements = content.match(subReqPattern) || [];
    const subRequirementsCount = subRequirements.length;
    const hasValidSubRequirements = subRequirementsCount >= expected.minSubRequirements;

    // Check formatting
    const hasProperFormatting = this.checkProperFormatting(content);
    
    // Check structure consistency
    const hasConsistentStructure = this.checkStructuralConsistency(content);
    
    // Identify issues
    const structureIssues: string[] = [];
    if (!hasValidSubRequirements) {
      structureIssues.push(`Insufficient sub-requirements: found ${subRequirementsCount}, expected at least ${expected.minSubRequirements}`);
    }
    if (!hasProperFormatting) {
      structureIssues.push('Formatting inconsistencies detected');
    }
    if (!hasConsistentStructure) {
      structureIssues.push('Structural inconsistencies found');
    }

    // Calculate score
    const structuralFactors = [
      hasValidSubRequirements ? 100 : 50,
      hasProperFormatting ? 100 : 70,
      hasConsistentStructure ? 100 : 80
    ];
    const score = Math.round(structuralFactors.reduce((sum, factor) => sum + factor, 0) / structuralFactors.length);

    return {
      score,
      hasValidSubRequirements,
      subRequirementsCount,
      hasProperFormatting,
      hasConsistentStructure,
      structureIssues
    };
  }

  /**
   * Validate quality assurance
   */
  private async validateQualityAssurance(request: ValidationRequest): Promise<QualityAssuranceResult> {
    const original = request.originalContent;
    const restructured = request.restructuredContent;
    const expected = request.expectedElements;

    // Check readability improvement
    const readabilityImproved = this.assessReadabilityImprovement(original, restructured);
    
    // Check redundancy reduction
    const redundancyReduced = this.assessRedundancyReduced(original, restructured);
    
    // Check logical organization
    const logicalOrganization = this.assessLogicalOrganization(restructured);
    
    // Check professional language
    const professionalLanguage = this.assessProfessionalLanguage(restructured);
    
    // Check appropriate length
    const lengthReduction = ((original.length - restructured.length) / original.length) * 100;
    const appropriateLength = lengthReduction > 0 && lengthReduction <= expected.maxAllowedReduction;

    // Identify quality issues
    const qualityIssues: string[] = [];
    if (!readabilityImproved) {
      qualityIssues.push('Readability not significantly improved');
    }
    if (!redundancyReduced) {
      qualityIssues.push('Redundancy not effectively reduced');
    }
    if (!logicalOrganization) {
      qualityIssues.push('Content organization could be improved');
    }
    if (!professionalLanguage) {
      qualityIssues.push('Professional language standards not maintained');
    }
    if (!appropriateLength) {
      qualityIssues.push(`Content reduction (${lengthReduction.toFixed(1)}%) outside expected range (0-${expected.maxAllowedReduction}%)`);
    }

    // Calculate score
    const qualityFactors = [
      readabilityImproved ? 100 : 75,
      redundancyReduced ? 100 : 80,
      logicalOrganization ? 100 : 85,
      professionalLanguage ? 100 : 70,
      appropriateLength ? 100 : 90
    ];
    const score = Math.round(qualityFactors.reduce((sum, factor) => sum + factor, 0) / qualityFactors.length);

    return {
      score,
      readabilityImproved,
      redundancyReduced,
      logicalOrganization,
      professionalLanguage,
      appropriateLength,
      qualityIssues
    };
  }

  /**
   * Validate consistency
   */
  private async validateConsistency(request: ValidationRequest): Promise<ConsistencyCheckResult> {
    const content = request.restructuredContent;
    const category = request.categoryName;

    // Check category consistency
    const isConsistentWithCategory = this.checkCategoryConsistency(content, category);
    
    // Check terminology consistency
    const terminologyConsistent = this.checkTerminologyConsistency(content);
    
    // Check formatting consistency
    const formattingConsistent = this.checkFormattingConsistency(content);

    // Identify consistency issues
    const consistencyIssues: string[] = [];
    if (!isConsistentWithCategory) {
      consistencyIssues.push(`Content not fully consistent with ${category} category expectations`);
    }
    if (!terminologyConsistent) {
      consistencyIssues.push('Terminology inconsistencies detected');
    }
    if (!formattingConsistent) {
      consistencyIssues.push('Formatting inconsistencies found');
    }

    // Calculate score
    const consistencyFactors = [
      isConsistentWithCategory ? 100 : 80,
      terminologyConsistent ? 100 : 85,
      formattingConsistent ? 100 : 90
    ];
    const score = Math.round(consistencyFactors.reduce((sum, factor) => sum + factor, 0) / consistencyFactors.length);

    return {
      score,
      isConsistentWithCategory,
      terminologyConsistent,
      formattingConsistent,
      consistencyIssues
    };
  }

  /**
   * Extract timeframes from content
   */
  private extractTimeframes(content: string): string[] {
    const timeframePattern = /\b(quarterly|annually|monthly|weekly|daily|24\s*hours?|72\s*hours?|\d+\s*days?|within\s+\d+\s+\w+)\b/gi;
    const matches = content.match(timeframePattern) || [];
    return [...new Set(matches.map(match => match.toLowerCase().trim()))];
  }

  /**
   * Extract standards from content
   */
  private extractStandards(content: string): string[] {
    const standardPattern = /\b(ISO\s*27001|ISO\s*27002|CIS\s*Control|GDPR|NIS2|DORA|NIST)\b/gi;
    const matches = content.match(standardPattern) || [];
    return [...new Set(matches.map(match => match.toUpperCase().trim()))];
  }

  /**
   * Extract processes from content
   */
  private extractProcesses(content: string): string[] {
    const processPattern = /\b(approval|workflow|testing|validation|reporting|assessment|review|audit|monitoring|implementation)\b/gi;
    const matches = content.match(processPattern) || [];
    return [...new Set(matches.map(match => match.toLowerCase().trim()))];
  }

  /**
   * Extract framework references from content
   */
  private extractFrameworkReferences(content: string): string[] {
    const refPattern = /Framework References:|[\(\[]([A-Z]+\s*\d*)[)\]]/gi;
    const matches = content.match(refPattern) || [];
    return [...new Set(matches.map(match => match.trim()))];
  }

  /**
   * Check if timeframes are equivalent
   */
  private isTimeframeEquivalent(found: string, expected: string): boolean {
    const normalize = (tf: string) => tf.toLowerCase().replace(/\s+/g, ' ').trim();
    return normalize(found) === normalize(expected) || 
           found.includes(expected) || 
           expected.includes(found);
  }

  /**
   * Check if standards are equivalent
   */
  private isStandardEquivalent(found: string, expected: string): boolean {
    const normalize = (std: string) => std.toUpperCase().replace(/\s+/g, '').trim();
    return normalize(found) === normalize(expected);
  }

  /**
   * Check if processes are equivalent
   */
  private isProcessEquivalent(found: string, expected: string): boolean {
    const normalize = (proc: string) => proc.toLowerCase().trim();
    return normalize(found) === normalize(expected) ||
           found.includes(expected) ||
           expected.includes(found);
  }

  /**
   * Check if references are equivalent
   */
  private isReferenceEquivalent(found: string, expected: string): boolean {
    return found.includes(expected) || expected.includes(found);
  }

  /**
   * Check proper formatting
   */
  private checkProperFormatting(content: string): boolean {
    // Check for proper sub-requirement formatting
    const hasSubReqHeaders = /^[a-p]\)\s*\*\*[^*]+\*\*/gm.test(content);
    
    // Check for consistent spacing and structure
    const hasConsistentSpacing = !content.includes('\n\n\n'); // No triple line breaks
    
    // Check for proper bullet points
    const hasBulletPoints = content.includes('•') || content.includes('-');
    
    return hasSubReqHeaders && hasConsistentSpacing;
  }

  /**
   * Check structural consistency
   */
  private checkStructuralConsistency(content: string): boolean {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Check for consistent sub-requirement pattern
    const subReqLines = lines.filter(line => /^[a-p]\)\s*\*\*/.test(line));
    const hasConsistentPattern = subReqLines.length > 0;
    
    // Check for logical flow
    const hasLogicalFlow = !content.includes('undefined') && !content.includes('null');
    
    return hasConsistentPattern && hasLogicalFlow;
  }

  /**
   * Assess readability improvement
   */
  private assessReadabilityImprovement(original: string, restructured: string): boolean {
    // Simple metrics: shorter sentences, less redundancy
    const originalAvgSentenceLength = this.calculateAverageSentenceLength(original);
    const restructuredAvgSentenceLength = this.calculateAverageSentenceLength(restructured);
    
    return restructuredAvgSentenceLength <= originalAvgSentenceLength && 
           restructured.length < original.length;
  }

  /**
   * Calculate average sentence length
   */
  private calculateAverageSentenceLength(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalLength = sentences.reduce((sum, sentence) => sum + sentence.trim().length, 0);
    return totalLength / sentences.length;
  }

  /**
   * Assess redundancy reduction
   */
  private assessRedundancyReduced(original: string, restructured: string): boolean {
    // Check for reduced repetitive phrases
    const originalRepetition = this.calculateRepetitiveContent(original);
    const restructuredRepetition = this.calculateRepetitiveContent(restructured);
    
    return restructuredRepetition < originalRepetition;
  }

  /**
   * Calculate repetitive content score
   */
  private calculateRepetitiveContent(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 4) { // Only count significant words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
    
    let repetitiveScore = 0;
    wordCounts.forEach(count => {
      if (count > 3) { // More than 3 occurrences considered repetitive
        repetitiveScore += count - 3;
      }
    });
    
    return repetitiveScore;
  }

  /**
   * Assess logical organization
   */
  private assessLogicalOrganization(content: string): boolean {
    // Check for logical grouping of related content
    const hasLogicalSections = /Core Requirements|HR|Monitoring|Compliance/.test(content);
    const hasProperHierarchy = /^[a-p]\)\s*\*\*/gm.test(content);
    
    return hasLogicalSections || hasProperHierarchy;
  }

  /**
   * Assess professional language
   */
  private assessProfessionalLanguage(content: string): boolean {
    // Check for proper compliance terminology
    const complianceTerms = /\b(shall|must|should|required|implement|establish|maintain|ensure)\b/gi;
    const hasComplianceLanguage = complianceTerms.test(content);
    
    // Check for absence of informal language
    const informalTerms = /\b(awesome|cool|nice|pretty good|kinda|sorta)\b/gi;
    const hasNoInformalLanguage = !informalTerms.test(content);
    
    return hasComplianceLanguage && hasNoInformalLanguage;
  }

  /**
   * Check category consistency
   */
  private checkCategoryConsistency(content: string, category: string): boolean {
    const categoryKeywords = this.getCategoryKeywords(category);
    const contentLower = content.toLowerCase();
    
    const foundKeywords = categoryKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    return foundKeywords.length >= Math.ceil(categoryKeywords.length * 0.6); // At least 60% of keywords present
  }

  /**
   * Get expected keywords for category
   */
  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'Governance & Leadership': ['governance', 'leadership', 'management', 'policy', 'oversight', 'accountability'],
      'Risk Management': ['risk', 'assessment', 'mitigation', 'analysis', 'treatment'],
      'Identity & Access Management': ['access', 'identity', 'authentication', 'authorization', 'user'],
      'Asset Management': ['asset', 'inventory', 'classification', 'handling'],
      'Incident Response': ['incident', 'response', 'emergency', 'breach', 'escalation'],
      'Business Continuity': ['continuity', 'recovery', 'backup', 'resilience', 'disaster']
    };
    
    return keywordMap[category] || ['security', 'compliance', 'control', 'requirement'];
  }

  /**
   * Check terminology consistency
   */
  private checkTerminologyConsistency(content: string): boolean {
    // Check for consistent use of terms
    const hasConsistentISO = !content.includes('ISO27001') || !content.includes('ISO 27001'); // Should be one format
    const hasConsistentAcronyms = this.checkAcronymConsistency(content);
    
    return hasConsistentAcronyms;
  }

  /**
   * Check acronym consistency
   */
  private checkAcronymConsistency(content: string): boolean {
    const acronyms = ['GDPR', 'NIS2', 'DORA', 'ISO', 'CIS', 'NIST'];
    
    for (const acronym of acronyms) {
      const variations = [acronym, acronym.toLowerCase(), acronym.charAt(0) + acronym.slice(1).toLowerCase()];
      const foundVariations = variations.filter(variation => content.includes(variation));
      
      if (foundVariations.length > 1) {
        return false; // Inconsistent usage
      }
    }
    
    return true;
  }

  /**
   * Check formatting consistency
   */
  private checkFormattingConsistency(content: string): boolean {
    // Check sub-requirement formatting consistency
    const subReqLines = content.match(/^[a-p]\)\s*\*\*[^*]+\*\*/gm) || [];
    if (subReqLines.length === 0) return false;
    
    // All sub-requirements should follow same pattern
    const allFollowPattern = subReqLines.every(line => 
      /^[a-p]\)\s*\*\*[A-Z][^*]+\*\*/.test(line) // Capital letter after **
    );
    
    return allFollowPattern;
  }

  /**
   * Collect all issues from validation results
   */
  private collectIssues(results: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Content preservation issues
    if (!results.contentPreservation.timeframesPreserved) {
      issues.push({
        severity: 'critical',
        category: 'content',
        message: `Missing timeframes: ${results.contentPreservation.timeframesMissing.join(', ')}`,
        suggestion: 'Ensure all original timeframes are preserved in restructured content'
      });
    }

    if (!results.contentPreservation.standardsPreserved) {
      issues.push({
        severity: 'critical',
        category: 'content',
        message: `Missing standards: ${results.contentPreservation.standardsMissing.join(', ')}`,
        suggestion: 'Preserve all framework and standard references'
      });
    }

    // Structural issues
    if (!results.structuralIntegrity.hasValidSubRequirements) {
      issues.push({
        severity: 'critical',
        category: 'structure',
        message: 'Insufficient sub-requirements',
        suggestion: 'Maintain proper sub-requirement structure (a, b, c, etc.)'
      });
    }

    // Quality issues
    if (!results.qualityAssurance.readabilityImproved) {
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Readability not significantly improved',
        suggestion: 'Focus on clearer organization and shorter sentences'
      });
    }

    return issues;
  }

  /**
   * Generate recommendations and must-fix issues
   */
  private generateRecommendations(results: any, issues: ValidationIssue[]): { recommendations: string[]; mustFixIssues: string[] } {
    const recommendations: string[] = [];
    const mustFixIssues: string[] = [];

    // Critical issues must be fixed
    issues.forEach(issue => {
      if (issue.severity === 'critical') {
        mustFixIssues.push(issue.message);
        if (issue.suggestion) {
          recommendations.push(issue.suggestion);
        }
      }
    });

    // General recommendations
    if (results.qualityAssurance.score < 85) {
      recommendations.push('Focus on improving content organization and reducing redundancy');
    }

    if (results.structuralIntegrity.score < 90) {
      recommendations.push('Ensure consistent formatting and proper sub-requirement structure');
    }

    return { recommendations, mustFixIssues };
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallScore(results: any): number {
    const scores = [
      results.contentPreservation.score * 0.4, // 40% weight - most important
      results.structuralIntegrity.score * 0.25, // 25% weight
      results.qualityAssurance.score * 0.2, // 20% weight
      results.consistencyCheck.score * 0.15 // 15% weight
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0));
  }

  /**
   * Determine if content is valid
   */
  private determineValidity(overallScore: number, issues: ValidationIssue[]): boolean {
    const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');
    const meetsMinimumScore = overallScore >= 75;

    return !hasCriticalIssues && meetsMinimumScore;
  }

  /**
   * Validate multiple categories for consistency
   */
  async validateBatchConsistency(results: RestructuredResult[]): Promise<{
    isConsistent: boolean;
    consistencyScore: number;
    inconsistencies: string[];
  }> {
    console.log(`🔍 [VALIDATION] Checking batch consistency across ${results.length} categories`);

    const inconsistencies: string[] = [];
    let consistencyFactors: number[] = [];

    // Check formatting consistency across categories
    const formattingConsistent = this.checkCrossFormattingConsistency(results);
    consistencyFactors.push(formattingConsistent ? 100 : 70);
    if (!formattingConsistent) {
      inconsistencies.push('Formatting inconsistent across categories');
    }

    // Check quality score variance
    const qualityScores = results.map(r => r.qualityMetrics.overallQualityScore);
    const qualityVariance = this.calculateVariance(qualityScores);
    const lowQualityVariance = qualityVariance < 200; // Acceptable variance
    consistencyFactors.push(lowQualityVariance ? 100 : 80);
    if (!lowQualityVariance) {
      inconsistencies.push('Quality scores vary significantly across categories');
    }

    const consistencyScore = Math.round(
      consistencyFactors.reduce((sum, factor) => sum + factor, 0) / consistencyFactors.length
    );

    const isConsistent = inconsistencies.length === 0 && consistencyScore >= 85;

    return { isConsistent, consistencyScore, inconsistencies };
  }

  /**
   * Check formatting consistency across categories
   */
  private checkCrossFormattingConsistency(results: RestructuredResult[]): boolean {
    if (results.length < 2) return true;

    const firstStructure = this.extractStructurePattern(results[0].restructuredContent);
    
    return results.slice(1).every(result => {
      const structure = this.extractStructurePattern(result.restructuredContent);
      return this.areStructuresCompatible(firstStructure, structure);
    });
  }

  /**
   * Extract structure pattern from content
   */
  private extractStructurePattern(content: string): {
    hasSubRequirements: boolean;
    hasSections: boolean;
    hasFrameworkRefs: boolean;
  } {
    return {
      hasSubRequirements: /^[a-p]\)\s*\*\*/gm.test(content),
      hasSections: /Core Requirements|HR|Monitoring/.test(content),
      hasFrameworkRefs: content.includes('Framework References:')
    };
  }

  /**
   * Check if structures are compatible
   */
  private areStructuresCompatible(struct1: any, struct2: any): boolean {
    return struct1.hasSubRequirements === struct2.hasSubRequirements &&
           struct1.hasFrameworkRefs === struct2.hasFrameworkRefs;
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
}

// Export default instance
export const restructuringValidationEngine = new RestructuringValidationEngine();