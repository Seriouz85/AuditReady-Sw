/**
 * AIIntegrationService.ts
 * Bridge service between CleanUnifiedRequirementsGenerator and AI consolidation system
 * Provides seamless integration with API key detection, validation, and caching
 */

import { 
  AITextConsolidationEngine,
  DeterministicAIValidator,
  FrameworkOverlapCalculator,
  ConsolidationRequest,
  ConsolidationResult,
  ValidationRequest,
  ValidationResult,
  FrameworkOverlapRequest,
  OverlapResult
} from './index';
import { CleanUnifiedRequirement, FrameworkRequirement } from '../CleanUnifiedRequirementsGenerator';
import { APIKeyDetector, APIKeyStatus } from './APIKeyDetector';
import { ContentFingerprinter } from './ContentFingerprinter';
import { IntegrationCache } from './IntegrationCache';

export interface AIIntegrationOptions {
  enableAIConsolidation?: boolean;
  targetReduction?: number;
  qualityThreshold?: number;
  preserveAllDetails?: boolean;
  useCache?: boolean;
  fallbackToOriginal?: boolean;
}

export interface AIIntegrationResult {
  success: boolean;
  enhanced: CleanUnifiedRequirement | null;
  original: CleanUnifiedRequirement;
  consolidation?: ConsolidationResult;
  validation?: ValidationResult;
  metrics: AIIntegrationMetrics;
  apiKeyStatus: APIKeyStatus;
}

export interface AIIntegrationMetrics {
  processingTimeMs: number;
  textReductionPercentage: number;
  qualityScore: number;
  detailsPreserved: boolean;
  cachingUsed: boolean;
  fallbackTriggered: boolean;
  errorDetails?: string;
}

export class AIIntegrationService {
  private consolidationEngine: AITextConsolidationEngine | null = null;
  private validator: DeterministicAIValidator;
  private overlapCalculator: FrameworkOverlapCalculator;
  private cache: IntegrationCache;
  private apiKeyStatus: APIKeyStatus;

  constructor() {
    this.apiKeyStatus = APIKeyDetector.detectAPIKeys();
    this.validator = new DeterministicAIValidator();
    this.overlapCalculator = new FrameworkOverlapCalculator();
    this.cache = new IntegrationCache();
    
    // Initialize consolidation engine only if we have valid API keys
    if (this.apiKeyStatus.hasValidKey) {
      try {
        this.consolidationEngine = new AITextConsolidationEngine();
      } catch (error) {
        console.warn('[AI-INTEGRATION] Failed to initialize consolidation engine:', error);
        this.apiKeyStatus.hasValidKey = false;
      }
    }
  }

  /**
   * Check if AI consolidation is available
   */
  isAIConsolidationAvailable(): boolean {
    return this.apiKeyStatus.hasValidKey && this.consolidationEngine !== null;
  }

  /**
   * Get API key status information
   */
  getAPIKeyStatus(): APIKeyStatus {
    return { ...this.apiKeyStatus };
  }

  /**
   * Apply AI consolidation to unified requirements
   */
  async applyAIConsolidation(
    unifiedRequirement: CleanUnifiedRequirement,
    frameworkRequirements: FrameworkRequirement[],
    options: AIIntegrationOptions = {}
  ): Promise<AIIntegrationResult> {
    const startTime = Date.now();
    
    // Default options
    const config = {
      enableAIConsolidation: options.enableAIConsolidation !== false,
      targetReduction: options.targetReduction || 25,
      qualityThreshold: options.qualityThreshold || 85,
      preserveAllDetails: options.preserveAllDetails !== false,
      useCache: options.useCache !== false,
      fallbackToOriginal: options.fallbackToOriginal !== false,
      ...options
    };

    // Create base result structure
    const baseMetrics: AIIntegrationMetrics = {
      processingTimeMs: 0,
      textReductionPercentage: 0,
      qualityScore: 100,
      detailsPreserved: true,
      cachingUsed: false,
      fallbackTriggered: false
    };

    // Check if AI consolidation is available and enabled
    if (!config.enableAIConsolidation || !this.isAIConsolidationAvailable()) {
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        enhanced: null,
        original: unifiedRequirement,
        metrics: {
          ...baseMetrics,
          processingTimeMs: processingTime,
          fallbackTriggered: true,
          errorDetails: !this.isAIConsolidationAvailable() 
            ? `No valid API key available (checked: ${this.apiKeyStatus.keySource})`
            : 'AI consolidation disabled'
        },
        apiKeyStatus: this.apiKeyStatus
      };
    }

    try {
      // Generate content fingerprint for caching
      const contentFingerprint = ContentFingerprinter.generateContentFingerprint(unifiedRequirement, config);

      // Check cache first if enabled
      if (config.useCache) {
        const cachedResult = this.cache.get(contentFingerprint);
        if (cachedResult) {
          cachedResult.metrics.processingTimeMs = Date.now() - startTime;
          cachedResult.metrics.cachingUsed = true;
          return cachedResult;
        }
      }

      // Apply AI consolidation to content
      const consolidationResult = await this.consolidateContent(
        unifiedRequirement,
        frameworkRequirements,
        config
      );

      // Validate the consolidation
      const validationResult = await this.validateConsolidation(
        unifiedRequirement,
        consolidationResult,
        frameworkRequirements,
        config
      );

      // Create enhanced unified requirement
      const enhanced = this.createEnhancedRequirement(
        unifiedRequirement,
        consolidationResult,
        validationResult
      );

      // Calculate final metrics
      const processingTime = Date.now() - startTime;
      const finalMetrics: AIIntegrationMetrics = {
        processingTimeMs: processingTime,
        textReductionPercentage: consolidationResult.reductionPercentage,
        qualityScore: consolidationResult.qualityMetrics.detailsPreserved,
        detailsPreserved: validationResult.detailPreservation.passed,
        cachingUsed: false,
        fallbackTriggered: false
      };

      const result: AIIntegrationResult = {
        success: true,
        enhanced,
        original: unifiedRequirement,
        consolidation: consolidationResult,
        validation: validationResult,
        metrics: finalMetrics,
        apiKeyStatus: this.apiKeyStatus
      };

      // Cache the result if enabled
      if (config.useCache) {
        this.cache.set(contentFingerprint, result);
      }

      return result;

    } catch (error) {
      console.error('[AI-INTEGRATION] Error during AI consolidation:', error);
      
      const processingTime = Date.now() - startTime;
      const errorMetrics: AIIntegrationMetrics = {
        ...baseMetrics,
        processingTimeMs: processingTime,
        fallbackTriggered: config.fallbackToOriginal,
        errorDetails: error instanceof Error ? error.message : String(error)
      };

      // Return fallback result if enabled
      if (config.fallbackToOriginal) {
        return {
          success: true,
          enhanced: null,
          original: unifiedRequirement,
          metrics: errorMetrics,
          apiKeyStatus: this.apiKeyStatus
        };
      }

      // Return error result
      return {
        success: false,
        enhanced: null,
        original: unifiedRequirement,
        metrics: errorMetrics,
        apiKeyStatus: this.apiKeyStatus
      };
    }
  }

  /**
   * Apply AI consolidation to specific content text
   */
  private async consolidateContent(
    unifiedRequirement: CleanUnifiedRequirement,
    frameworkRequirements: FrameworkRequirement[],
    config: AIIntegrationOptions
  ): Promise<ConsolidationResult> {
    if (!this.consolidationEngine) {
      throw new Error('Consolidation engine not available');
    }

    // Prepare consolidation request
    const request: ConsolidationRequest = {
      content: unifiedRequirement.content,
      category: unifiedRequirement.category,
      frameworks: unifiedRequirement.frameworksCovered,
      type: 'requirements',
      config: {
        targetReduction: config.targetReduction || 25,
        preserveAllDetails: config.preserveAllDetails !== false,
        enableSmartMerging: true,
        maintainStructure: true,
        preserveReferences: true,
        enhanceReadability: true
      }
    };

    return await this.consolidationEngine.consolidateText(request);
  }

  /**
   * Validate consolidation results
   */
  private async validateConsolidation(
    original: CleanUnifiedRequirement,
    consolidation: ConsolidationResult,
    frameworkRequirements: FrameworkRequirement[],
    config: AIIntegrationOptions
  ): Promise<ValidationResult> {
    const validationRequest: ValidationRequest = {
      originalContent: original.content,
      consolidatedContent: consolidation.consolidatedContent,
      category: original.category,
      frameworks: original.frameworksCovered,
      expectedReduction: config.targetReduction || 25,
      preservationRules: [
        'PRESERVE_ALL_FRAMEWORK_REFERENCES',
        'MAINTAIN_COMPLIANCE_REQUIREMENTS',
        'PRESERVE_TECHNICAL_SPECIFICATIONS',
        'MAINTAIN_TIMEFRAMES_AND_DEADLINES',
        'PRESERVE_AUTHORITY_REFERENCES'
      ]
    };

    return await this.validator.validateConsolidation(validationRequest);
  }

  /**
   * Create enhanced unified requirement from consolidation results
   */
  private createEnhancedRequirement(
    original: CleanUnifiedRequirement,
    consolidation: ConsolidationResult,
    validation: ValidationResult
  ): CleanUnifiedRequirement | null {
    // Only return enhanced version if validation passes quality threshold
    if (!validation.detailPreservation.passed || validation.overallScore < 85) {
      return null;
    }

    // Create enhanced version with consolidated content
    return {
      ...original,
      content: consolidation.consolidatedContent,
      // Add metadata about consolidation
      frameworksCovered: [
        ...original.frameworksCovered,
        `AI-Enhanced (${consolidation.reductionPercentage}% reduction)`
      ]
    };
  }

  /**
   * Analyze framework overlap for unified requirements
   */
  async analyzeFrameworkOverlap(
    frameworkRequirements: FrameworkRequirement[]
  ): Promise<OverlapResult> {
    const request: FrameworkOverlapRequest = {
      requirements: frameworkRequirements.map(req => ({
        id: req.id,
        framework: req.framework,
        category: req.category,
        content: req.description,
        metadata: {
          code: req.code,
          title: req.title
        }
      })),
      analysisType: 'COMPREHENSIVE'
    };

    return await this.overlapCalculator.calculateOverlap(request);
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    return {
      apiKeyStatus: this.apiKeyStatus,
      cacheStats: this.cache.getStats(),
      capabilities: {
        textConsolidation: this.isAIConsolidationAvailable(),
        validation: true,
        frameworkAnalysis: true,
        caching: true
      }
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.cache.clear();
    if (this.consolidationEngine) {
      this.consolidationEngine.clearCache();
    }
  }

  /**
   * Reset API key detection (useful for environment changes)
   */
  refreshAPIKeyStatus(): void {
    this.apiKeyStatus = APIKeyDetector.detectAPIKeys();
    
    // Reinitialize consolidation engine if needed
    if (this.apiKeyStatus.hasValidKey && !this.consolidationEngine) {
      try {
        this.consolidationEngine = new AITextConsolidationEngine();
      } catch (error) {
        console.warn('[AI-INTEGRATION] Failed to initialize consolidation engine after refresh:', error);
        this.apiKeyStatus.hasValidKey = false;
      }
    }
  }
}