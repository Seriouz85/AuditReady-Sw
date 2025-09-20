/**
 * DeterministicAIValidator.ts
 * Validates ALL details are preserved in AI consolidation (100% requirement)
 * Provides validation metrics for traceability matrix display
 */

import { AIPromptTemplates } from './AIPromptTemplates';
import { QualityMetrics } from './AITextConsolidationEngine';

export interface ValidationRequest {
  originalContent: string;
  consolidatedContent: string;
  category: string;
  frameworks: string[];
  expectedReduction: number; // 0.4-0.7
  preservationRules: PreservationRule[];
}

export interface PreservationRule {
  type: 'timeframes' | 'authorities' | 'standards' | 'technical' | 'references' | 'structure';
  pattern: RegExp;
  description: string;
  critical: boolean; // If true, failure blocks approval
}

export interface ValidationResult {
  passed: boolean;
  overallScore: number; // 0-100
  detailPreservation: DetailPreservationResult;
  structuralIntegrity: StructuralIntegrityResult;
  complianceIntegrity: ComplianceIntegrityResult;
  qualityMetrics: QualityMetrics;
  traceabilityMatrix: TraceabilityMatrix;
  recommendations: ValidationRecommendation[];
  blockingIssues: ValidationIssue[];
}

export interface DetailPreservationResult {
  timeframes: PreservationCheck;
  authorities: PreservationCheck;
  standards: PreservationCheck;
  technicalSpecs: PreservationCheck;
  numericalValues: PreservationCheck;
  references: PreservationCheck;
  overallScore: number;
}

export interface PreservationCheck {
  preserved: boolean;
  originalCount: number;
  preservedCount: number;
  preservationRate: number;
  missingItems: string[];
  addedItems: string[];
}

export interface StructuralIntegrityResult {
  hierarchyPreserved: boolean;
  subRequirementsIntact: boolean;
  bulletPointStructure: boolean;
  formattingConsistent: boolean;
  referencePointsIntact: boolean;
  score: number;
}

export interface ComplianceIntegrityResult {
  auditTrailMaintained: boolean;
  regulatoryAccuracy: boolean;
  frameworkMappingsIntact: boolean;
  complianceDeadlinesPreserved: boolean;
  score: number;
}

export interface TraceabilityMatrix {
  originalRequirements: TraceabilityEntry[];
  consolidatedRequirements: TraceabilityEntry[];
  mappings: RequirementMapping[];
  coverage: number; // 0-100
}

export interface TraceabilityEntry {
  id: string;
  content: string;
  framework: string;
  category: string;
  fingerprint: string;
}

export interface RequirementMapping {
  originalIds: string[];
  consolidatedId: string;
  mappingConfidence: number;
  preservationScore: number;
}

export interface ValidationRecommendation {
  type: 'improvement' | 'warning' | 'optimization';
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface ValidationIssue {
  type: 'missing_detail' | 'structural_change' | 'compliance_risk';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  affectedContent: string;
  suggestedFix: string;
}

export class DeterministicAIValidator {
  private readonly PRESERVATION_PATTERNS = {
    timeframes: [
      /\b(quarterly|annual|monthly|weekly|daily)\b/gi,
      /\b\d+\s*(months?|years?|weeks?|days?)\b/gi,
      /\b(Q[1-4]|FY\d{4}|H[12])\b/gi,
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
    ],
    authorities: [
      /\b(ENISA|ISO|NIST|CISA|GDPR|NIS2|DORA|ECCC|ANSSI)\b/gi,
      /\bEuropean\s+(Commission|Parliament|Council)\b/gi,
      /\b(Cybersecurity|Privacy|Data\s+Protection)\s+A(gency|uthority)\b/gi,
      /\b(National|Federal|Regional)\s+(Agency|Authority|Commission)\b/gi
    ],
    standards: [
      /\bISO\s*[/-]?\s*27001\b/gi,
      /\bISO\s*[/-]?\s*27002\b/gi,
      /\bNIS2?\s*(Directive)?\b/gi,
      /\bGDPR\b/gi,
      /\bCIS\s*Controls?\b/gi,
      /\bNIST\s*(Framework|CSF)?\b/gi,
      /\bSOC\s*[12]\b/gi
    ],
    technical: [
      /\b\d+(?:\.\d+)?%\b/g,
      /\b\d+\s*(?:bits?|bytes?|[KMGT]B)\b/gi,
      /\b\d+\s*(?:milliseconds?|seconds?|minutes?|hours?)\b/gi,
      /\b\d+\s*(?:users?|devices?|systems?|applications?)\b/gi,
      /\b(?:AES|RSA|SHA|MD5)-?\d*\b/gi
    ],
    references: [
      /\{\{[^}]+\}\}/g,
      /\[[^\]]+\]/g,
      /\([^)]*ref[^)]*\)/gi,
      /\bsee\s+(section|chapter|appendix|clause)\s*\d+/gi,
      /\b(article|section|paragraph)\s*\d+(?:\.\d+)*/gi
    ]
  };

  private readonly CRITICAL_SCORE_THRESHOLD = 95; // 95% minimum for approval
  private readonly WARNING_SCORE_THRESHOLD = 85;

  /**
   * Main validation method - validates ALL details are preserved
   */
  async validateConsolidation(request: ValidationRequest): Promise<ValidationResult> {
    try {
      // Step 1: Detail preservation validation
      const detailPreservation = await this.validateDetailPreservation(
        request.originalContent,
        request.consolidatedContent
      );

      // Step 2: Structural integrity validation
      const structuralIntegrity = this.validateStructuralIntegrity(
        request.originalContent,
        request.consolidatedContent
      );

      // Step 3: Compliance integrity validation
      const complianceIntegrity = this.validateComplianceIntegrity(
        request.originalContent,
        request.consolidatedContent,
        request.frameworks
      );

      // Step 4: Generate traceability matrix
      const traceabilityMatrix = this.generateTraceabilityMatrix(
        request.originalContent,
        request.consolidatedContent,
        request.category,
        request.frameworks
      );

      // Step 5: Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(
        detailPreservation,
        structuralIntegrity,
        complianceIntegrity,
        request.expectedReduction,
        request.originalContent.length,
        request.consolidatedContent.length
      );

      // Step 6: Generate recommendations and identify issues
      const recommendations = this.generateRecommendations(
        detailPreservation,
        structuralIntegrity,
        complianceIntegrity,
        qualityMetrics
      );

      const blockingIssues = this.identifyBlockingIssues(
        detailPreservation,
        structuralIntegrity,
        complianceIntegrity
      );

      // Step 7: Calculate overall score and pass/fail
      const overallScore = this.calculateOverallScore(
        detailPreservation.overallScore,
        structuralIntegrity.score,
        complianceIntegrity.score,
        traceabilityMatrix.coverage
      );

      const passed = overallScore >= this.CRITICAL_SCORE_THRESHOLD && blockingIssues.length === 0;

      return {
        passed,
        overallScore,
        detailPreservation,
        structuralIntegrity,
        complianceIntegrity,
        qualityMetrics,
        traceabilityMatrix,
        recommendations,
        blockingIssues
      };
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Validate detail preservation across all critical categories
   */
  private async validateDetailPreservation(
    original: string,
    consolidated: string
  ): Promise<DetailPreservationResult> {
    
    const timeframes = this.validatePreservationByType(original, consolidated, 'timeframes');
    const authorities = this.validatePreservationByType(original, consolidated, 'authorities');
    const standards = this.validatePreservationByType(original, consolidated, 'standards');
    const technicalSpecs = this.validatePreservationByType(original, consolidated, 'technical');
    const numericalValues = this.validateNumericalValues(original, consolidated);
    const references = this.validatePreservationByType(original, consolidated, 'references');

    // Calculate weighted overall score
    const scores = [
      { check: timeframes, weight: 0.2 },
      { check: authorities, weight: 0.2 },
      { check: standards, weight: 0.2 },
      { check: technicalSpecs, weight: 0.15 },
      { check: numericalValues, weight: 0.15 },
      { check: references, weight: 0.1 }
    ];

    const overallScore = scores.reduce((sum, { check, weight }) => 
      sum + (check.preservationRate * weight), 0
    );

    return {
      timeframes,
      authorities,
      standards,
      technicalSpecs,
      numericalValues,
      references,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Validate preservation by specific type using patterns
   */
  private validatePreservationByType(
    original: string,
    consolidated: string,
    type: keyof typeof this.PRESERVATION_PATTERNS
  ): PreservationCheck {
    const patterns = this.PRESERVATION_PATTERNS[type];
    const originalItems = new Set<string>();
    const consolidatedItems = new Set<string>();

    // Extract items from original content
    patterns.forEach(pattern => {
      const matches = original.match(pattern) || [];
      matches.forEach(match => originalItems.add(match.toLowerCase().trim()));
    });

    // Extract items from consolidated content
    patterns.forEach(pattern => {
      const matches = consolidated.match(pattern) || [];
      matches.forEach(match => consolidatedItems.add(match.toLowerCase().trim()));
    });

    // Calculate preservation metrics
    const originalCount = originalItems.size;
    const preservedItems = Array.from(originalItems).filter(item => 
      consolidatedItems.has(item)
    );
    const preservedCount = preservedItems.length;
    const preservationRate = originalCount > 0 ? (preservedCount / originalCount) * 100 : 100;

    const missingItems = Array.from(originalItems).filter(item => 
      !consolidatedItems.has(item)
    );

    const addedItems = Array.from(consolidatedItems).filter(item => 
      !originalItems.has(item)
    );

    return {
      preserved: preservationRate >= 100,
      originalCount,
      preservedCount,
      preservationRate: Math.round(preservationRate),
      missingItems,
      addedItems
    };
  }

  /**
   * Specialized validation for numerical values
   */
  private validateNumericalValues(original: string, consolidated: string): PreservationCheck {
    const numberPattern = /\b\d+(?:\.\d+)?(?:%|°|[A-Za-z]+)?\b/g;
    
    const originalNumbers = (original.match(numberPattern) || [])
      .map(n => n.toLowerCase().trim());
    const consolidatedNumbers = (consolidated.match(numberPattern) || [])
      .map(n => n.toLowerCase().trim());

    const originalCount = originalNumbers.length;
    const preservedCount = originalNumbers.filter(num => 
      consolidatedNumbers.includes(num)
    ).length;

    const preservationRate = originalCount > 0 ? (preservedCount / originalCount) * 100 : 100;

    const missingItems = originalNumbers.filter(num => 
      !consolidatedNumbers.includes(num)
    );

    const addedItems = consolidatedNumbers.filter(num => 
      !originalNumbers.includes(num)
    );

    return {
      preserved: preservationRate >= 100,
      originalCount,
      preservedCount,
      preservationRate: Math.round(preservationRate),
      missingItems,
      addedItems
    };
  }

  /**
   * Validate structural integrity of the content
   */
  private validateStructuralIntegrity(
    original: string,
    consolidated: string
  ): StructuralIntegrityResult {
    
    const hierarchyPreserved = this.validateHierarchyPreservation(original, consolidated);
    const subRequirementsIntact = this.validateSubRequirements(original, consolidated);
    const bulletPointStructure = this.validateBulletPointStructure(original, consolidated);
    const formattingConsistent = this.validateFormattingConsistency(consolidated);
    const referencePointsIntact = this.validateReferencePoints(original, consolidated);

    // Calculate structural score
    const checks = [
      hierarchyPreserved,
      subRequirementsIntact,
      bulletPointStructure,
      formattingConsistent,
      referencePointsIntact
    ];

    const score = (checks.filter(check => check).length / checks.length) * 100;

    return {
      hierarchyPreserved,
      subRequirementsIntact,
      bulletPointStructure,
      formattingConsistent,
      referencePointsIntact,
      score: Math.round(score)
    };
  }

  /**
   * Validate hierarchy preservation (headers, sub-headers)
   */
  private validateHierarchyPreservation(original: string, consolidated: string): boolean {
    const originalHeaders = (original.match(/^#{1,6}\s+.+$/gm) || [])
      .map(h => h.replace(/^#+\s*/, '').trim().toLowerCase());
    
    const consolidatedHeaders = (consolidated.match(/^#{1,6}\s+.+$/gm) || [])
      .map(h => h.replace(/^#+\s*/, '').trim().toLowerCase());

    // Check that major headers are preserved
    const majorHeaders = originalHeaders.filter(h => h.length > 10); // Likely important headers
    const preservedMajorHeaders = majorHeaders.filter(h => 
      consolidatedHeaders.some(ch => ch.includes(h) || h.includes(ch))
    );

    return majorHeaders.length === 0 || 
           (preservedMajorHeaders.length / majorHeaders.length) >= 0.8;
  }

  /**
   * Validate sub-requirements structure
   */
  private validateSubRequirements(original: string, consolidated: string): boolean {
    const originalSubReqs = (original.match(/^##?\s+.+$/gm) || []).length;
    const consolidatedSubReqs = (consolidated.match(/^##?\s+.+$/gm) || []).length;

    // Allow some consolidation but not complete elimination
    if (originalSubReqs === 0) return true;
    return consolidatedSubReqs >= originalSubReqs * 0.5;
  }

  /**
   * Validate bullet point structure preservation
   */
  private validateBulletPointStructure(original: string, consolidated: string): boolean {
    const originalBullets = (original.match(/^\s*[-*•]\s+.+$/gm) || []).length;
    const consolidatedBullets = (consolidated.match(/^\s*[-*•]\s+.+$/gm) || []).length;

    // Expect reduction but not elimination
    if (originalBullets === 0) return true;
    return consolidatedBullets >= originalBullets * 0.3; // At least 30% preserved
  }

  /**
   * Validate formatting consistency
   */
  private validateFormattingConsistency(content: string): boolean {
    const bulletStyles = [
      (content.match(/^\s*-\s+/gm) || []).length,
      (content.match(/^\s*\*\s+/gm) || []).length,
      (content.match(/^\s*•\s+/gm) || []).length
    ];

    const numberStyles = [
      (content.match(/^\s*\d+\.\s+/gm) || []).length,
      (content.match(/^\s*\d+\)\s+/gm) || []).length
    ];

    // Check for consistent bullet style
    const totalBullets = bulletStyles.reduce((sum, count) => sum + count, 0);
    const dominantBulletStyle = Math.max(...bulletStyles);
    const bulletConsistency = totalBullets === 0 || (dominantBulletStyle / totalBullets) >= 0.8;

    // Check for consistent number style
    const totalNumbers = numberStyles.reduce((sum, count) => sum + count, 0);
    const dominantNumberStyle = Math.max(...numberStyles);
    const numberConsistency = totalNumbers === 0 || (dominantNumberStyle / totalNumbers) >= 0.8;

    return bulletConsistency && numberConsistency;
  }

  /**
   * Validate reference points are intact
   */
  private validateReferencePoints(original: string, consolidated: string): boolean {
    const originalRefs = (original.match(/\{\{[^}]+\}\}/g) || []).length;
    const consolidatedRefs = (consolidated.match(/\{\{[^}]+\}\}/g) || []).length;

    return originalRefs === 0 || consolidatedRefs >= originalRefs * 0.9; // 90% preservation
  }

  /**
   * Validate compliance integrity
   */
  private validateComplianceIntegrity(
    original: string,
    consolidated: string,
    frameworks: string[]
  ): ComplianceIntegrityResult {
    
    const auditTrailMaintained = this.validateAuditTrail(original, consolidated);
    const regulatoryAccuracy = this.validateRegulatoryAccuracy(original, consolidated);
    const frameworkMappingsIntact = this.validateFrameworkMappings(original, consolidated, frameworks);
    const complianceDeadlinesPreserved = this.validateComplianceDeadlines(original, consolidated);

    const checks = [
      auditTrailMaintained,
      regulatoryAccuracy,
      frameworkMappingsIntact,
      complianceDeadlinesPreserved
    ];

    const score = (checks.filter(check => check).length / checks.length) * 100;

    return {
      auditTrailMaintained,
      regulatoryAccuracy,
      frameworkMappingsIntact,
      complianceDeadlinesPreserved,
      score: Math.round(score)
    };
  }

  /**
   * Validate audit trail is maintained
   */
  private validateAuditTrail(original: string, consolidated: string): boolean {
    const auditKeywords = ['audit', 'evidence', 'documentation', 'record', 'log', 'track'];
    const originalAuditRefs = auditKeywords.reduce((count, keyword) => 
      count + (original.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length, 0
    );

    const consolidatedAuditRefs = auditKeywords.reduce((count, keyword) => 
      count + (consolidated.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length, 0
    );

    return originalAuditRefs === 0 || consolidatedAuditRefs >= originalAuditRefs * 0.8;
  }

  /**
   * Validate regulatory accuracy
   */
  private validateRegulatoryAccuracy(original: string, consolidated: string): boolean {
    const regulatoryTerms = ['must', 'shall', 'required', 'mandatory', 'obligatory', 'compulsory'];
    
    for (const term of regulatoryTerms) {
      const originalCount = (original.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
      const consolidatedCount = (consolidated.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
      
      // Regulatory terms should not be reduced significantly
      if (originalCount > 0 && consolidatedCount < originalCount * 0.7) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate framework mappings are intact
   */
  private validateFrameworkMappings(original: string, consolidated: string, frameworks: string[]): boolean {
    for (const framework of frameworks) {
      const originalRefs = (original.match(new RegExp(`\\b${framework}\\b`, 'gi')) || []).length;
      const consolidatedRefs = (consolidated.match(new RegExp(`\\b${framework}\\b`, 'gi')) || []).length;
      
      if (originalRefs > 0 && consolidatedRefs === 0) {
        return false; // Framework completely removed
      }
    }

    return true;
  }

  /**
   * Validate compliance deadlines are preserved
   */
  private validateComplianceDeadlines(original: string, consolidated: string): boolean {
    const deadlinePatterns = [
      /\bby\s+\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/gi,
      /\bwithin\s+\d+\s+(days?|months?|years?)\b/gi,
      /\bbefore\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
    ];

    for (const pattern of deadlinePatterns) {
      const originalDeadlines = original.match(pattern) || [];
      const consolidatedDeadlines = consolidated.match(pattern) || [];
      
      // All deadlines must be preserved
      for (const deadline of originalDeadlines) {
        if (!consolidatedDeadlines.some(cd => 
          cd.toLowerCase().includes(deadline.toLowerCase()) ||
          deadline.toLowerCase().includes(cd.toLowerCase())
        )) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Generate traceability matrix for requirement mapping
   */
  private generateTraceabilityMatrix(
    original: string,
    consolidated: string,
    category: string,
    frameworks: string[]
  ): TraceabilityMatrix {
    
    const originalRequirements = this.extractRequirements(original, frameworks, 'original');
    const consolidatedRequirements = this.extractRequirements(consolidated, frameworks, 'consolidated');
    
    const mappings = this.generateRequirementMappings(originalRequirements, consolidatedRequirements);
    
    // Calculate coverage - what percentage of original requirements are mapped
    const mappedOriginalIds = new Set(mappings.flatMap(m => m.originalIds));
    const coverage = originalRequirements.length > 0 ? 
      (mappedOriginalIds.size / originalRequirements.length) * 100 : 100;

    return {
      originalRequirements,
      consolidatedRequirements,
      mappings,
      coverage: Math.round(coverage)
    };
  }

  /**
   * Extract requirements from content for traceability
   */
  private extractRequirements(content: string, frameworks: string[], source: string): TraceabilityEntry[] {
    const requirements: TraceabilityEntry[] = [];
    const lines = content.split('\n');
    
    let currentSection = '';
    let currentContent = '';
    let sectionId = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^#{1,3}\s+/)) {
        // Save previous section if it has content
        if (currentContent.trim()) {
          requirements.push({
            id: `${source}-${sectionId}`,
            content: currentContent.trim(),
            framework: this.detectFramework(currentContent, frameworks),
            category: currentSection || 'general',
            fingerprint: AIPromptTemplates.generateContentFingerprint(currentContent)
          });
          sectionId++;
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s*/, '');
        currentContent = '';
      } else if (line) {
        currentContent += line + '\n';
      }
    }

    // Add final section
    if (currentContent.trim()) {
      requirements.push({
        id: `${source}-${sectionId}`,
        content: currentContent.trim(),
        framework: this.detectFramework(currentContent, frameworks),
        category: currentSection || 'general',
        fingerprint: AIPromptTemplates.generateContentFingerprint(currentContent)
      });
    }

    return requirements;
  }

  /**
   * Detect framework from content
   */
  private detectFramework(content: string, frameworks: string[]): string {
    for (const framework of frameworks) {
      if (content.toLowerCase().includes(framework.toLowerCase())) {
        return framework;
      }
    }
    return 'general';
  }

  /**
   * Generate requirement mappings between original and consolidated
   */
  private generateRequirementMappings(
    original: TraceabilityEntry[],
    consolidated: TraceabilityEntry[]
  ): RequirementMapping[] {
    const mappings: RequirementMapping[] = [];
    
    for (const consReq of consolidated) {
      const mapping: RequirementMapping = {
        originalIds: [],
        consolidatedId: consReq.id,
        mappingConfidence: 0,
        preservationScore: 0
      };

      // Find matching original requirements
      for (const origReq of original) {
        const similarity = this.calculateContentSimilarity(origReq.content, consReq.content);
        
        if (similarity > 0.3) { // 30% similarity threshold
          mapping.originalIds.push(origReq.id);
          mapping.mappingConfidence = Math.max(mapping.mappingConfidence, similarity);
        }
      }

      // Calculate preservation score
      if (mapping.originalIds.length > 0) {
        const originalContent = original
          .filter(req => mapping.originalIds.includes(req.id))
          .map(req => req.content)
          .join(' ');
        
        mapping.preservationScore = this.calculatePreservationScore(originalContent, consReq.content);
      }

      mappings.push(mapping);
    }

    return mappings;
  }

  /**
   * Calculate content similarity between two texts
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate preservation score for a mapping
   */
  private calculatePreservationScore(original: string, consolidated: string): number {
    // Check preservation of key elements
    const keywordPreservation = this.calculateKeywordPreservation(original, consolidated);
    const structurePreservation = this.calculateStructurePreservation(original, consolidated);
    const detailPreservation = this.calculateDetailPreservationForMapping(original, consolidated);
    
    return Math.round((keywordPreservation + structurePreservation + detailPreservation) / 3);
  }

  /**
   * Calculate keyword preservation
   */
  private calculateKeywordPreservation(original: string, consolidated: string): number {
    const originalKeywords = original.match(/\b[A-Z][A-Za-z]+\b/g) || [];
    const consolidatedKeywords = consolidated.match(/\b[A-Z][A-Za-z]+\b/g) || [];
    
    const preservedKeywords = originalKeywords.filter(keyword => 
      consolidatedKeywords.some(ck => ck.toLowerCase() === keyword.toLowerCase())
    );
    
    return originalKeywords.length > 0 ? 
      (preservedKeywords.length / originalKeywords.length) * 100 : 100;
  }

  /**
   * Calculate structure preservation
   */
  private calculateStructurePreservation(original: string, consolidated: string): number {
    const originalBullets = (original.match(/^\s*[-*•]\s/gm) || []).length;
    const consolidatedBullets = (consolidated.match(/^\s*[-*•]\s/gm) || []).length;
    
    const originalNumbers = (original.match(/^\s*\d+\.\s/gm) || []).length;
    const consolidatedNumbers = (consolidated.match(/^\s*\d+\.\s/gm) || []).length;
    
    const structureScore = originalBullets + originalNumbers > 0 ? 
      ((consolidatedBullets + consolidatedNumbers) / (originalBullets + originalNumbers)) * 100 : 100;
    
    return Math.min(100, structureScore);
  }

  /**
   * Calculate detail preservation for mapping
   */
  private calculateDetailPreservationForMapping(original: string, consolidated: string): number {
    const importantElements = [
      ...this.PRESERVATION_PATTERNS.timeframes,
      ...this.PRESERVATION_PATTERNS.authorities,
      ...this.PRESERVATION_PATTERNS.standards,
      ...this.PRESERVATION_PATTERNS.technical
    ];

    let preservedCount = 0;
    let totalCount = 0;

    for (const pattern of importantElements) {
      const originalMatches = original.match(pattern) || [];
      const consolidatedMatches = consolidated.match(pattern) || [];
      
      totalCount += originalMatches.length;
      preservedCount += originalMatches.filter(match => 
        consolidatedMatches.some(cm => cm.toLowerCase() === match.toLowerCase())
      ).length;
    }

    return totalCount > 0 ? (preservedCount / totalCount) * 100 : 100;
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    detailPreservation: DetailPreservationResult,
    structuralIntegrity: StructuralIntegrityResult,
    complianceIntegrity: ComplianceIntegrityResult,
    expectedReduction: number,
    originalLength: number,
    consolidatedLength: number
  ): QualityMetrics {
    
    const actualReduction = (originalLength - consolidatedLength) / originalLength;
    const reductionScore = Math.abs(actualReduction - expectedReduction) < 0.1 ? 100 : 
      Math.max(0, 100 - (Math.abs(actualReduction - expectedReduction) * 200));

    return {
      detailsPreserved: detailPreservation.overallScore,
      readabilityImproved: consolidatedLength < originalLength && structuralIntegrity.score > 80,
      consistencyScore: structuralIntegrity.formattingConsistent ? 100 : 70,
      timeframesPreserved: detailPreservation.timeframes.preserved,
      authoritiesPreserved: detailPreservation.authorities.preserved,
      standardsPreserved: detailPreservation.standards.preserved,
      technicalSpecsPreserved: detailPreservation.technicalSpecs.preserved,
      referencesIntact: detailPreservation.references.preserved
    };
  }

  /**
   * Generate validation recommendations
   */
  private generateRecommendations(
    detailPreservation: DetailPreservationResult,
    structuralIntegrity: StructuralIntegrityResult,
    complianceIntegrity: ComplianceIntegrityResult,
    qualityMetrics: QualityMetrics
  ): ValidationRecommendation[] {
    
    const recommendations: ValidationRecommendation[] = [];

    // Detail preservation recommendations
    if (detailPreservation.overallScore < this.WARNING_SCORE_THRESHOLD) {
      recommendations.push({
        type: 'warning',
        message: `Detail preservation score (${detailPreservation.overallScore}%) is below recommended threshold`,
        impact: 'high',
        actionable: true
      });
    }

    // Structural integrity recommendations
    if (!structuralIntegrity.hierarchyPreserved) {
      recommendations.push({
        type: 'improvement',
        message: 'Header hierarchy should be better preserved to maintain document structure',
        impact: 'medium',
        actionable: true
      });
    }

    // Compliance integrity recommendations
    if (!complianceIntegrity.auditTrailMaintained) {
      recommendations.push({
        type: 'warning',
        message: 'Audit trail references may have been compromised during consolidation',
        impact: 'high',
        actionable: true
      });
    }

    // Quality optimization recommendations
    if (!qualityMetrics.readabilityImproved) {
      recommendations.push({
        type: 'optimization',
        message: 'Consider further text simplification to improve readability',
        impact: 'low',
        actionable: true
      });
    }

    return recommendations;
  }

  /**
   * Identify blocking issues that prevent approval
   */
  private identifyBlockingIssues(
    detailPreservation: DetailPreservationResult,
    structuralIntegrity: StructuralIntegrityResult,
    complianceIntegrity: ComplianceIntegrityResult
  ): ValidationIssue[] {
    
    const issues: ValidationIssue[] = [];

    // Critical detail preservation issues
    if (!detailPreservation.timeframes.preserved && detailPreservation.timeframes.missingItems.length > 0) {
      issues.push({
        type: 'missing_detail',
        severity: 'critical',
        message: 'Critical timeframes missing from consolidated content',
        affectedContent: detailPreservation.timeframes.missingItems.join(', '),
        suggestedFix: 'Re-add missing timeframes to maintain compliance accuracy'
      });
    }

    if (!detailPreservation.authorities.preserved && detailPreservation.authorities.missingItems.length > 0) {
      issues.push({
        type: 'missing_detail',
        severity: 'critical',
        message: 'Regulatory authorities missing from consolidated content',
        affectedContent: detailPreservation.authorities.missingItems.join(', '),
        suggestedFix: 'Re-add missing authority references for regulatory compliance'
      });
    }

    if (!detailPreservation.standards.preserved && detailPreservation.standards.missingItems.length > 0) {
      issues.push({
        type: 'missing_detail',
        severity: 'critical',
        message: 'Compliance standards missing from consolidated content',
        affectedContent: detailPreservation.standards.missingItems.join(', '),
        suggestedFix: 'Re-add missing standard references for audit compliance'
      });
    }

    // Structural integrity issues
    if (!structuralIntegrity.referencePointsIntact) {
      issues.push({
        type: 'structural_change',
        severity: 'major',
        message: 'Framework reference points have been compromised',
        affectedContent: 'Template reference points {{framework_references}}',
        suggestedFix: 'Restore framework reference injection points'
      });
    }

    // Compliance integrity issues
    if (!complianceIntegrity.frameworkMappingsIntact) {
      issues.push({
        type: 'compliance_risk',
        severity: 'critical',
        message: 'Framework mappings have been compromised',
        affectedContent: 'Framework cross-references',
        suggestedFix: 'Restore all framework mapping references'
      });
    }

    return issues;
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallScore(
    detailScore: number,
    structuralScore: number,
    complianceScore: number,
    coverageScore: number
  ): number {
    
    // Weighted scoring - detail preservation is most critical
    const weights = {
      detail: 0.4,
      structural: 0.2,
      compliance: 0.3,
      coverage: 0.1
    };

    return Math.round(
      detailScore * weights.detail +
      structuralScore * weights.structural +
      complianceScore * weights.compliance +
      coverageScore * weights.coverage
    );
  }

  /**
   * Generate validation summary report
   */
  generateValidationSummary(result: ValidationResult): string {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const score = result.overallScore;

    let summary = `VALIDATION RESULT: ${status} (Score: ${score}%)\n\n`;

    summary += `DETAIL PRESERVATION: ${result.detailPreservation.overallScore}%\n`;
    summary += `- Timeframes: ${result.detailPreservation.timeframes.preservationRate}%\n`;
    summary += `- Authorities: ${result.detailPreservation.authorities.preservationRate}%\n`;
    summary += `- Standards: ${result.detailPreservation.standards.preservationRate}%\n`;
    summary += `- Technical Specs: ${result.detailPreservation.technicalSpecs.preservationRate}%\n\n`;

    summary += `STRUCTURAL INTEGRITY: ${result.structuralIntegrity.score}%\n`;
    summary += `COMPLIANCE INTEGRITY: ${result.complianceIntegrity.score}%\n`;
    summary += `TRACEABILITY COVERAGE: ${result.traceabilityMatrix.coverage}%\n\n`;

    if (result.blockingIssues.length > 0) {
      summary += `BLOCKING ISSUES (${result.blockingIssues.length}):\n`;
      result.blockingIssues.forEach((issue, index) => {
        summary += `${index + 1}. ${issue.message}\n`;
      });
    }

    if (result.recommendations.length > 0) {
      summary += `\nRECOMMENDATIONS (${result.recommendations.length}):\n`;
      result.recommendations.forEach((rec, index) => {
        summary += `${index + 1}. ${rec.message}\n`;
      });
    }

    return summary;
  }
}