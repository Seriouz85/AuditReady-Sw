/**
 * SmartSemanticAnalyzer and RequirementHarmonizer abstraction layer exports
 * Provides clean API access to semantic analysis and harmonization components
 */

// Main analyzer and harmonizer
import { SmartSemanticAnalyzer } from './SmartSemanticAnalyzer';
import { RequirementHarmonizer } from './RequirementHarmonizer';
export { SmartSemanticAnalyzer, RequirementHarmonizer };
export type { SmartAnalysisOptions, AnalysisResult, AnalysisSummary } from './SmartSemanticAnalyzer';
export type { 
  HarmonizationConfig, 
  HarmonizedRequirement, 
  ConflictResolution, 
  HarmonizationResult,
  HarmonizationPerformanceMetrics,
  QualityAssessment 
} from './RequirementHarmonizer';

// Core components
export { SemanticAnalyzer } from './SemanticAnalyzer';
export { RequirementProcessor } from './RequirementProcessor';
export type { RawRequirement, ProcessingOptions } from './RequirementProcessor';
export { SimilarityEngine } from './SimilarityEngine';
export type { SimilarityMetrics } from './SimilarityEngine';
export { ClusteringUtils } from './ClusteringUtils';
export type { ClusteringOptions } from './ClusteringUtils';
export { TextProcessor } from './TextProcessor';

// Harmonization components
export { UnifiedRequirementGenerator } from './UnifiedRequirementGenerator';
export type { 
  UnificationStrategy, 
  UnifiedRequirementResult, 
  FrameworkAddition,
  ComplexityMetrics,
  GenerationMetadata 
} from './UnifiedRequirementGenerator';
export { CompliancePreservationValidator } from './CompliancePreservationValidator';
export type { 
  PreservationValidationResult, 
  ComplianceGap, 
  AuditImpactIssue,
  ValidationRecommendation,
  ComplianceMetrics 
} from './CompliancePreservationValidator';
export { ConflictResolver } from './ConflictResolver';
export type { 
  ConflictAnalysisResult, 
  DetectedConflict, 
  ConflictingValue,
  UnresolvableConflict 
} from './ConflictResolver';

// Type definitions
import type {
  AnalysisConfig,
  SemanticAnalyzerOptions
} from './types';
import type { HarmonizationConfig } from './RequirementHarmonizer';
export type {
  SemanticAnalysisResult,
  SemanticMatch,
  ComplianceEntity,
  RequirementStructure,
  ProcessedRequirement,
  RequirementMetadata,
  SimilarityResult,
  ClusterInfo,
  AnalysisConfig,
  CacheEntry,
  PerformanceMetrics,
  SemanticAnalyzerOptions
} from './types';

// Utility functions for easy setup
export const createDefaultSemanticAnalyzer = () => {
  return SmartSemanticAnalyzer.createDefault();
};

export const createCustomSemanticAnalyzer = (config: Partial<AnalysisConfig>) => {
  const defaultConfig = SmartSemanticAnalyzer.createDefaultConfig();
  const mergedConfig = { ...defaultConfig, ...config };
  
  const options: SemanticAnalyzerOptions = {
    config: mergedConfig,
    enable_caching: true,
    performance_monitoring: true,
    debug_mode: false,
    batch_size: 50
  };

  return new SmartSemanticAnalyzer(options);
};

export const createDefaultHarmonizer = () => {
  return new RequirementHarmonizer(RequirementHarmonizer.getDefaultConfig());
};

export const createCustomHarmonizer = (config: Partial<HarmonizationConfig>) => {
  const defaultConfig = RequirementHarmonizer.getDefaultConfig();
  const mergedConfig = { ...defaultConfig, ...config };
  return new RequirementHarmonizer(mergedConfig);
};

export const createDefaultDeduplicationEngine = () => {
  const analysisConfig = SmartSemanticAnalyzer.createDefaultConfig();
  const harmonizationConfig = RequirementHarmonizer.getDefaultConfig();
  const deduplicationConfig = IntelligentDeduplicationEngine.getDefaultConfig();
  
  return new IntelligentDeduplicationEngine(
    analysisConfig,
    harmonizationConfig,
    deduplicationConfig
  );
};

// Integration layer exports
export { EnhancedCleanUnifiedRequirementsGenerator } from './EnhancedCleanUnifiedRequirementsGenerator';
export type { 
  AbstractionMode,
  AbstractionOptions,
  AbstractionProgress,
  AbstractionResult,
  EnhancedGenerationOptions
} from './EnhancedCleanUnifiedRequirementsGenerator';

export { AbstractionConfigurationService } from './AbstractionConfigurationService';
export type {
  AbstractionConfiguration,
  PerformanceConfiguration,
  QualityConfiguration,
  FrameworkSpecificRules,
  FrameworkRule,
  CustomRule,
  UserPreferences,
  NotificationSettings,
  SavedConfiguration,
  ValidationResult
} from './AbstractionConfigurationService';

export { ComplianceAbstractionService } from './ComplianceAbstractionService';
export type {
  AbstractionWorkflowOptions,
  WorkflowResult,
  WorkflowSummary,
  WorkflowPerformance,
  PerformanceBottleneck,
  AuditEntry,
  WorkflowError,
  CacheMetrics,
  AnalysisReport
} from './ComplianceAbstractionService';

// Deduplication engine exports
export { IntelligentDeduplicationEngine } from './IntelligentDeduplicationEngine';
export type {
  DeduplicationConfig,
  DeduplicationStrategy,
  DeduplicationResult,
  DeduplicationSummary,
  FailedDeduplication
} from './IntelligentDeduplicationEngine';

// Re-export types for convenience
// AnalysisConfig already exported above