/**
 * Shared type definitions for compliance requirements generation system
 * 
 * This file contains all interfaces and types used across the compliance
 * requirements generation services to ensure type consistency and avoid
 * circular dependencies.
 */

export interface RequirementDetail {
  control_id: string;
  title: string;
  description: string;
  official_description?: string;
  audit_ready_guidance?: string;
  framework: string;
  category?: string;
}

export interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  requirements: RequirementDetail[];
  combinedText?: string;
  frameworks: Set<string>;
}

export interface ValidationResult {
  isValid: boolean;
  missingRequirements: string[];
  coverage: number;
  suggestions: string[];
}

export interface ContentValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  actionableScore: number;
  relevanceScore: number;
  technicalDepthScore: number;
}

export interface ValidationConfig {
  enabled: boolean;
  minContentLength: number;
  minQualityScore: number;
  requireActionableContent: boolean;
  strictRelevanceCheck: boolean;
  logValidationResults: boolean;
  frameworkSpecificValidation?: boolean;
  preserveHRStructure?: boolean;
  maxSimilarityThreshold?: number;
}

export interface QualityIssue {
  type: 'incomplete_sentence' | 'markdown_leakage' | 'duplicate_content' | 'vague_terminology' | 'broken_content' | 'structure_inconsistency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  lineNumber?: number;
  suggestion?: string;
}

export interface CategoryQualityReport {
  categoryName: string;
  overallScore: number;
  totalIssues: number;
  issues: QualityIssue[];
  subRequirements: {
    id: string;
    title: string;
    score: number;
    issues: QualityIssue[];
  }[];
  recommendations: string[];
}

export interface ComprehensiveQualityReport {
  overallScore: number;
  totalCategories: number;
  totalIssues: number;
  categoriesByScore: CategoryQualityReport[];
  prioritizedActions: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    actions: string[];
  }[];
  statistics: {
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    averageScoreByCategory: number;
  };
  generatedAt: Date;
}

/**
 * Quality analysis scoring thresholds
 */
export const QUALITY_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 40,
  CRITICAL: 25
} as const;

/**
 * Framework-specific constants
 */
export const FRAMEWORK_CODES = {
  ISO_27001: ['ISO27001', 'ISO_27001'],
  CIS_CONTROLS: ['CIS', 'CIS_Controls'],
  NIST: ['NIST', 'NIST_Framework'],
  SOC2: ['SOC2', 'SOC_2'],
  NIS2: ['NIS2', 'NIS_2']
} as const;

/**
 * Content validation patterns
 */
export const VALIDATION_PATTERNS = {
  MARKDOWN_LEAKAGE: /(\*\*|__|\[.*\]|\#|```)/g,
  INCOMPLETE_SENTENCE: /\b(and|or|but|with|for|to|from|in|on|at|by|through)\s*$/gi,
  VAGUE_TERMS: /\b(some|many|various|several|multiple|appropriate|adequate|reasonable|proper|suitable)\b/gi,
  TECHNICAL_INDICATORS: /\.(dll|exe|jar|so)|automated|technical|software|inventory|unauthorized/i
} as const;

/**
 * Minimum content length requirements by framework
 */
export const MIN_CONTENT_LENGTHS = {
  ISO_27001: 100,
  CIS_CONTROLS: 80,
  NIST: 120,
  SOC2: 90,
  NIS2: 110,
  DEFAULT: 75
} as const;

/**
 * Framework similarity thresholds for duplicate detection
 */
export const SIMILARITY_THRESHOLDS = {
  ISO_27001: 0.85,
  CIS_CONTROLS: 0.80,
  NIST: 0.85,
  SOC2: 0.82,
  NIS2: 0.85,
  DEFAULT: 0.80
} as const;