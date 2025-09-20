/**
 * AI-Powered Text Consolidation System
 * Export all core components for enterprise compliance management
 */

// Core Engine
export { AITextConsolidationEngine } from './AITextConsolidationEngine';
export type {
  ConsolidationRequest,
  ConsolidationResult,
  QualityMetrics
} from './AITextConsolidationEngine';

// Validation System
export { DeterministicAIValidator } from './DeterministicAIValidator';
export type {
  ValidationRequest,
  ValidationResult,
  DetailPreservationResult,
  StructuralIntegrityResult,
  ComplianceIntegrityResult,
  TraceabilityMatrix,
  ValidationRecommendation,
  ValidationIssue
} from './DeterministicAIValidator';

// Framework Analysis
export { FrameworkOverlapCalculator } from './FrameworkOverlapCalculator';
export type {
  FrameworkOverlapRequest,
  OverlapResult,
  OverlapStats,
  FrameworkPairOverlap,
  HeatmapData,
  CategoryOverlap,
  UniqueRequirementAnalysis,
  CoverageAnalysis,
  WhatIfComparison
} from './FrameworkOverlapCalculator';

// Prompt Templates
export { AIPromptTemplates } from './AIPromptTemplates';
export type {
  ConsolidationPromptConfig,
  PromptTemplate
} from './AIPromptTemplates';

// Integration Support Components
export { APIKeyDetector } from './APIKeyDetector';
export type { APIKeyStatus } from './APIKeyDetector';

export { ContentFingerprinter } from './ContentFingerprinter';
export { IntegrationCache } from './IntegrationCache';

export { AIIntegrationService } from './AIIntegrationService';
export type {
  AIIntegrationOptions,
  AIIntegrationResult,
  AIIntegrationMetrics
} from './AIIntegrationService';

/**
 * Integration Helper Class
 * Provides unified interface for the entire AI consolidation system
 */
export class AIConsolidationIntegrator {
  private engine: AITextConsolidationEngine;
  private validator: DeterministicAIValidator;
  private overlapCalculator: FrameworkOverlapCalculator;

  constructor() {
    this.engine = new AITextConsolidationEngine();
    this.validator = new DeterministicAIValidator();
    this.overlapCalculator = new FrameworkOverlapCalculator();
  }

  /**
   * Complete consolidation workflow with validation
   */
  async consolidateWithValidation(request: ConsolidationRequest): Promise<{
    consolidation: ConsolidationResult;
    validation: ValidationResult;
  }> {
    // Step 1: Perform AI consolidation
    const consolidation = await this.engine.consolidateText(request);

    // Step 2: Validate the consolidation
    const validationRequest: ValidationRequest = {
      originalContent: request.content,
      consolidatedContent: consolidation.consolidatedContent,
      category: request.category,
      frameworks: request.frameworks,
      expectedReduction: request.config.targetReduction,
      preservationRules: [] // Add rules as needed
    };

    const validation = await this.validator.validateConsolidation(validationRequest);

    return { consolidation, validation };
  }

  /**
   * Framework overlap analysis
   */
  async analyzeFrameworkOverlap(request: FrameworkOverlapRequest): Promise<OverlapResult> {
    return this.overlapCalculator.calculateOverlap(request);
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    return {
      cache: this.engine.getCacheStats(),
      version: '1.0.0',
      capabilities: [
        'AI Text Consolidation',
        'Deterministic Validation',
        'Framework Overlap Analysis',
        'What-If Analysis',
        'Traceability Matrix Generation',
        'Quality Metrics Calculation'
      ]
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.engine.clearCache();
  }
}

// Re-export types for convenience
export type {
  ConsolidationPromptConfig,
  PromptTemplate
} from './AIPromptTemplates';

export type {
  ConsolidationRequest,
  ConsolidationResult,
  QualityMetrics
} from './AITextConsolidationEngine';

export type {
  ValidationRequest,
  ValidationResult,
  TraceabilityMatrix
} from './DeterministicAIValidator';

export type {
  FrameworkOverlapRequest,
  OverlapResult,
  HeatmapData
} from './FrameworkOverlapCalculator';