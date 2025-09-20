/**
 * Enhanced Clean Unified Requirements Generator with Smart Abstraction Integration
 * 
 * Extends the existing CleanUnifiedRequirementsGenerator to include intelligent abstraction capabilities
 * while preserving backward compatibility and all existing functionality.
 */

import { 
  CleanUnifiedRequirementsGenerator, 
  FrameworkRequirement, 
  CleanUnifiedRequirement 
} from '../CleanUnifiedRequirementsGenerator';

import { 
  IntelligentDeduplicationEngine, 
  DeduplicationConfig,
  DeduplicationResult,
  DeduplicationStrategy
} from './IntelligentDeduplicationEngine';

import { SmartSemanticAnalyzer } from './SmartSemanticAnalyzer';
import { RequirementHarmonizer } from './RequirementHarmonizer';

import { 
  ProcessedRequirement,
  AnalysisConfig,
  PerformanceMetrics
} from './types';

import { AbstractionConfigurationService } from './AbstractionConfigurationService';

export type AbstractionMode = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'DISABLED';

export interface AbstractionOptions {
  mode: AbstractionMode;
  enableDeduplication: boolean;
  preserveAllReferences: boolean;
  qualityThreshold: number;
  maxComplexityIncrease: number;
  enableFallback: boolean;
  progressCallback?: (progress: AbstractionProgress) => void;
}

export interface AbstractionProgress {
  stage: 'PROCESSING' | 'ANALYZING' | 'DEDUPLICATING' | 'HARMONIZING' | 'VALIDATING' | 'COMPLETE';
  progress: number; // 0-100
  currentCategory?: string;
  requirementsProcessed: number;
  totalRequirements: number;
  estimatedTimeRemaining?: number;
}

export interface AbstractionResult {
  original: CleanUnifiedRequirement;
  enhanced: CleanUnifiedRequirement | null;
  abstraction: {
    mode: AbstractionMode;
    applied: boolean;
    qualityScore: number;
    reductionPercentage: number;
    preservationScore: number;
  };
  performance: {
    processingTimeMs: number;
    deduplicationCount: number;
    harmonizationCount: number;
  };
  fallbackReason?: string;
}

export interface EnhancedGenerationOptions {
  abstraction?: AbstractionOptions;
  featureFlags?: {
    enableAbstraction: boolean;
    enableProgressReporting: boolean;
    enableQualityAssurance: boolean;
    enableCaching: boolean;
  };
  compatibility?: {
    preserveOriginalFormat: boolean;
    includeDebugInfo: boolean;
    enableLegacyFallback: boolean;
  };
}

/**
 * Enhanced Clean Unified Requirements Generator with Smart Abstraction
 */
export class EnhancedCleanUnifiedRequirementsGenerator {
  
  private static deduplicationEngine: IntelligentDeduplicationEngine;
  private static configService = new AbstractionConfigurationService();
  
  private static getDeduplicationEngine(): IntelligentDeduplicationEngine {
    if (!this.deduplicationEngine) {
      const analysisConfig = SmartSemanticAnalyzer.createDefaultConfig();
      const harmonizationConfig = RequirementHarmonizer.getDefaultConfig();
      const deduplicationConfig = IntelligentDeduplicationEngine.getDefaultConfig();
      
      this.deduplicationEngine = new IntelligentDeduplicationEngine(
        analysisConfig,
        harmonizationConfig,
        deduplicationConfig
      );
    }
    return this.deduplicationEngine;
  }
  
  /**
   * Generate enhanced unified requirements with optional smart abstraction
   */
  static async generateForCategory(
    categoryName: string,
    frameworkRequirements: FrameworkRequirement[],
    options: EnhancedGenerationOptions = {}
  ): Promise<AbstractionResult> {
    
    const startTime = Date.now();
    
    console.log(`[ENHANCED] Processing category: ${categoryName} with ${frameworkRequirements.length} requirements`);
    
    // Set up default options
    const abstractionOptions = this.getDefaultAbstractionOptions(options.abstraction);
    const featureFlags = this.getDefaultFeatureFlags(options.featureFlags);
    
    // Update progress
    this.reportProgress(abstractionOptions, {
      stage: 'PROCESSING',
      progress: 10,
      currentCategory: categoryName,
      requirementsProcessed: 0,
      totalRequirements: frameworkRequirements.length
    });
    
    try {
      // Generate original unified requirements using existing system
      const originalResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
        categoryName,
        frameworkRequirements
      );
      
      if (!originalResult) {
        return this.createNullResult(categoryName, startTime, 'No template found');
      }
      
      this.reportProgress(abstractionOptions, {
        stage: 'ANALYZING',
        progress: 30,
        currentCategory: categoryName,
        requirementsProcessed: frameworkRequirements.length,
        totalRequirements: frameworkRequirements.length
      });
      
      // Check if abstraction is enabled and applicable
      if (!featureFlags.enableAbstraction || 
          abstractionOptions.mode === 'DISABLED' ||
          frameworkRequirements.length < 3) {
        
        console.log(`[ENHANCED] Abstraction disabled or not applicable for ${categoryName}`);
        return this.createResultWithoutAbstraction(originalResult, startTime);
      }
      
      // Apply smart abstraction
      const enhancedResult = await this.applySmartAbstraction(
        originalResult,
        frameworkRequirements,
        abstractionOptions,
        categoryName
      );
      
      this.reportProgress(abstractionOptions, {
        stage: 'COMPLETE',
        progress: 100,
        currentCategory: categoryName,
        requirementsProcessed: frameworkRequirements.length,
        totalRequirements: frameworkRequirements.length
      });
      
      return enhancedResult;
      
    } catch (error) {
      console.error(`[ENHANCED] Error processing category ${categoryName}:`, error);
      
      // Fallback to original system
      if (abstractionOptions.enableFallback) {
        const originalResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
          categoryName,
          frameworkRequirements
        );
        
        if (originalResult) {
          return this.createResultWithFallback(originalResult, startTime, error.message);
        }
      }
      
      return this.createNullResult(categoryName, startTime, error.message);
    }
  }
  
  /**
   * Generate enhanced unified requirements for multiple categories
   */
  static async generateForCategories(
    categories: Array<{ name: string; requirements: FrameworkRequirement[] }>,
    options: EnhancedGenerationOptions = {}
  ): Promise<Map<string, AbstractionResult>> {
    
    console.log(`[ENHANCED] Processing ${categories.length} categories`);
    
    const results = new Map<string, AbstractionResult>();
    const totalRequirements = categories.reduce((sum, cat) => sum + cat.requirements.length, 0);
    let processedRequirements = 0;
    
    for (const category of categories) {
      try {
        // Update progress for batch processing
        const batchOptions = {
          ...options,
          abstraction: {
            ...this.getDefaultAbstractionOptions(options.abstraction),
            progressCallback: (progress: AbstractionProgress) => {
              const overallProgress = {
                ...progress,
                requirementsProcessed: processedRequirements + progress.requirementsProcessed,
                totalRequirements: totalRequirements
              };
              options.abstraction?.progressCallback?.(overallProgress);
            }
          }
        };
        
        const result = await this.generateForCategory(
          category.name,
          category.requirements,
          batchOptions
        );
        
        results.set(category.name, result);
        processedRequirements += category.requirements.length;
        
      } catch (error) {
        console.error(`[ENHANCED] Error processing category ${category.name}:`, error);
        results.set(category.name, this.createNullResult(category.name, Date.now(), error.message));
      }
    }
    
    return results;
  }
  
  /**
   * Apply smart abstraction to unified requirements
   */
  private static async applySmartAbstraction(
    originalResult: CleanUnifiedRequirement,
    frameworkRequirements: FrameworkRequirement[],
    options: AbstractionOptions,
    categoryName: string
  ): Promise<AbstractionResult> {
    
    const startTime = Date.now();
    
    try {
      // Convert framework requirements to processed requirements
      const processedRequirements = this.convertToProcessedRequirements(frameworkRequirements);
      
      this.reportProgress(options, {
        stage: 'DEDUPLICATING',
        progress: 50,
        currentCategory: categoryName,
        requirementsProcessed: frameworkRequirements.length,
        totalRequirements: frameworkRequirements.length
      });
      
      // Get configuration for the abstraction mode
      const config = await this.configService.getConfigForMode(options.mode);
      
      // Apply intelligent deduplication
      const deduplicationResult = await this.getDeduplicationEngine().deduplicateRequirements(
        processedRequirements,
        true // enableProgressiveMode
      );
      
      this.reportProgress(options, {
        stage: 'HARMONIZING',
        progress: 70,
        currentCategory: categoryName,
        requirementsProcessed: frameworkRequirements.length,
        totalRequirements: frameworkRequirements.length
      });
      
      // Check quality thresholds
      if (deduplicationResult.qualityScore < options.qualityThreshold) {
        console.log(`[ENHANCED] Quality threshold not met for ${categoryName}: ${deduplicationResult.qualityScore} < ${options.qualityThreshold}`);
        
        if (options.enableFallback) {
          return this.createResultWithFallback(originalResult, startTime, 'Quality threshold not met');
        }
        
        return this.createResultWithoutAbstraction(originalResult, startTime);
      }
      
      this.reportProgress(options, {
        stage: 'VALIDATING',
        progress: 90,
        currentCategory: categoryName,
        requirementsProcessed: frameworkRequirements.length,
        totalRequirements: frameworkRequirements.length
      });
      
      // Generate enhanced unified requirements from deduplicated content
      const enhancedResult = await this.generateEnhancedFromDeduplication(
        originalResult,
        deduplicationResult,
        options
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        original: originalResult,
        enhanced: enhancedResult,
        abstraction: {
          mode: options.mode,
          applied: true,
          qualityScore: deduplicationResult.quality_assessment?.overall_quality_score || 0.5,
          reductionPercentage: this.calculateReductionPercentage(originalResult, enhancedResult),
          preservationScore: deduplicationResult.deduplication_summary?.compliance_preservation_average || 1.0
        },
        performance: {
          processingTimeMs: processingTime,
          deduplicationCount: deduplicationResult.deduplication_summary?.successful_merges || 0,
          harmonizationCount: deduplicationResult.harmonized_requirements?.length || 0
        }
      };
      
    } catch (error) {
      console.error(`[ENHANCED] Error applying abstraction to ${categoryName}:`, error);
      
      if (options.enableFallback) {
        return this.createResultWithFallback(originalResult, Date.now() - startTime, error.message);
      }
      
      throw error;
    }
  }
  
  /**
   * Convert framework requirements to processed requirements format
   */
  private static convertToProcessedRequirements(
    frameworkRequirements: FrameworkRequirement[]
  ): ProcessedRequirement[] {
    
    return frameworkRequirements.map((req, index) => ({
      id: req.id || `req-${index}`,
      framework: req.framework,
      original_text: req.description,
      normalized_text: req.description.toLowerCase().trim(),
      entities: [],
      structure: {
        main_clause: req.description,
        sub_clauses: [],
        conditions: [],
        exceptions: [],
        references: [req.code],
        action_verbs: [],
        domain_context: req.category
      },
      metadata: {
        category: req.category,
        domain: req.framework,
        criticality: 'MEDIUM',
        complexity: req.description.split(' ').length / 20,
        word_count: req.description.split(' ').length,
        readability_score: 0.5,
        technical_terms: [],
        extracted_at: new Date()
      },
      vector: [],
      keywords: req.description.toLowerCase().split(' ').filter(word => word.length > 3),
      hash: this.generateHash(req.description)
    }));
  }
  
  /**
   * Generate enhanced unified requirements from deduplication results
   */
  private static async generateEnhancedFromDeduplication(
    originalResult: CleanUnifiedRequirement,
    deduplicationResult: DeduplicationResult,
    options: AbstractionOptions
  ): Promise<CleanUnifiedRequirement> {
    
    // Create enhanced version with deduplicated content
    const enhancedSubRequirements = originalResult.subRequirements.map(subReq => {
      // Find harmonized content for this sub-requirement
      const harmonizedContent = this.findHarmonizedContent(subReq, deduplicationResult);
      
      if (harmonizedContent && harmonizedContent.length > 0) {
        return {
          ...subReq,
          requirements: harmonizedContent,
          frameworkReferences: this.consolidateReferences(subReq.frameworkReferences, deduplicationResult)
        };
      }
      
      return subReq;
    });
    
    return {
      ...originalResult,
      subRequirements: enhancedSubRequirements,
      metadata: {
        ...originalResult.metadata,
        enhanced: true,
        abstractionMode: options.mode,
        processingTimestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Find harmonized content for a sub-requirement
   */
  private static findHarmonizedContent(
    subReq: any,
    deduplicationResult: DeduplicationResult
  ): string[] {
    
    // Map original requirements to harmonized ones
    const harmonizedReqs: string[] = [];
    
    for (const originalReq of subReq.requirements) {
      // Find if this requirement was harmonized
      const harmonized = deduplicationResult.harmonized_requirements?.find(h => 
        h.original_text.includes(originalReq.substring(0, 50))
      );
      
      if (harmonized) {
        harmonizedReqs.push(harmonized.normalized_text);
      } else {
        harmonizedReqs.push(originalReq);
      }
    }
    
    return [...new Set(harmonizedReqs)]; // Remove duplicates
  }
  
  /**
   * Consolidate framework references after deduplication
   */
  private static consolidateReferences(
    originalRefs: string,
    deduplicationResult: DeduplicationResult
  ): string {
    
    // Preserve all framework references to maintain traceability
    return originalRefs;
  }
  
  /**
   * Calculate reduction percentage
   */
  private static calculateReductionPercentage(
    original: CleanUnifiedRequirement,
    enhanced: CleanUnifiedRequirement | null
  ): number {
    
    if (!enhanced) return 0;
    
    const originalCount = original.subRequirements.reduce((sum, sub) => sum + sub.requirements.length, 0);
    const enhancedCount = enhanced.subRequirements.reduce((sum, sub) => sum + sub.requirements.length, 0);
    
    return originalCount > 0 ? Math.round(((originalCount - enhancedCount) / originalCount) * 100) : 0;
  }
  
  /**
   * Create result without abstraction
   */
  private static createResultWithoutAbstraction(
    originalResult: CleanUnifiedRequirement,
    startTime: number
  ): AbstractionResult {
    
    return {
      original: originalResult,
      enhanced: null,
      abstraction: {
        mode: 'DISABLED',
        applied: false,
        qualityScore: 1.0,
        reductionPercentage: 0,
        preservationScore: 1.0
      },
      performance: {
        processingTimeMs: Date.now() - startTime,
        deduplicationCount: 0,
        harmonizationCount: 0
      }
    };
  }
  
  /**
   * Create result with fallback
   */
  private static createResultWithFallback(
    originalResult: CleanUnifiedRequirement,
    startTime: number,
    reason: string
  ): AbstractionResult {
    
    return {
      original: originalResult,
      enhanced: null,
      abstraction: {
        mode: 'DISABLED',
        applied: false,
        qualityScore: 0,
        reductionPercentage: 0,
        preservationScore: 1.0
      },
      performance: {
        processingTimeMs: Date.now() - startTime,
        deduplicationCount: 0,
        harmonizationCount: 0
      },
      fallbackReason: reason
    };
  }
  
  /**
   * Create null result
   */
  private static createNullResult(
    categoryName: string,
    startTime: number,
    reason: string
  ): AbstractionResult {
    
    const nullResult: CleanUnifiedRequirement = {
      category: categoryName,
      subRequirements: [],
      metadata: { generated: false, reason }
    };
    
    return this.createResultWithFallback(nullResult, startTime, reason);
  }
  
  /**
   * Get default abstraction options
   */
  private static getDefaultAbstractionOptions(options?: Partial<AbstractionOptions>): AbstractionOptions {
    return {
      mode: 'MODERATE',
      enableDeduplication: true,
      preserveAllReferences: true,
      qualityThreshold: 0.85,
      maxComplexityIncrease: 1.3,
      enableFallback: true,
      ...options
    };
  }
  
  /**
   * Get default feature flags
   */
  private static getDefaultFeatureFlags(flags?: Partial<EnhancedGenerationOptions['featureFlags']>): NonNullable<EnhancedGenerationOptions['featureFlags']> {
    return {
      enableAbstraction: true,
      enableProgressReporting: true,
      enableQualityAssurance: true,
      enableCaching: true,
      ...flags
    };
  }
  
  /**
   * Report progress to callback
   */
  private static reportProgress(options: AbstractionOptions, progress: AbstractionProgress): void {
    if (options.progressCallback) {
      try {
        options.progressCallback(progress);
      } catch (error) {
        console.warn('[ENHANCED] Progress callback error:', error);
      }
    }
  }
  
  /**
   * Generate simple hash for requirement text
   */
  private static generateHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Get generation statistics for enhanced results
   */
  static getEnhancedStats(results: Map<string, AbstractionResult>) {
    const stats = {
      categoriesProcessed: results.size,
      abstractionApplied: 0,
      fallbacksUsed: 0,
      averageReduction: 0,
      averageQuality: 0,
      totalProcessingTime: 0
    };
    
    for (const result of results.values()) {
      if (result.abstraction.applied) {
        stats.abstractionApplied++;
        stats.averageReduction += result.abstraction.reductionPercentage;
        stats.averageQuality += result.abstraction.qualityScore;
      }
      
      if (result.fallbackReason) {
        stats.fallbacksUsed++;
      }
      
      stats.totalProcessingTime += result.performance.processingTimeMs;
    }
    
    if (stats.abstractionApplied > 0) {
      stats.averageReduction = Math.round(stats.averageReduction / stats.abstractionApplied);
      stats.averageQuality = Math.round((stats.averageQuality / stats.abstractionApplied) * 100) / 100;
    }
    
    return stats;
  }
}