/**
 * Abstraction Configuration Service
 * 
 * Manages configuration settings for the smart abstraction engine including:
 * - User preferences for abstraction levels
 * - Framework-specific abstraction rules
 * - Performance tuning parameters
 * - Quality threshold management
 */

import { DeduplicationConfig } from './IntelligentDeduplicationEngine';
import { AnalysisConfig } from './types';

export type AbstractionMode = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'DISABLED';

export interface AbstractionConfiguration {
  mode: AbstractionMode;
  deduplication: DeduplicationConfig;
  analysis: AnalysisConfig;
  performance: PerformanceConfiguration;
  quality: QualityConfiguration;
  frameworkRules: FrameworkSpecificRules;
}

export interface PerformanceConfiguration {
  maxProcessingTimeMs: number;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTTLMs: number;
  maxMemoryUsageMB: number;
  parallelProcessing: boolean;
  maxConcurrentJobs: number;
}

export interface QualityConfiguration {
  minCompliancePreservation: number; // 0.0 - 1.0
  maxComplexityIncrease: number; // 1.0 = no increase, 2.0 = double complexity
  minConfidenceScore: number; // 0.0 - 1.0
  criticalGapTolerance: number; // 0.0 = no gaps allowed
  qualityAssuranceEnabled: boolean;
  fallbackOnQualityFailure: boolean;
  auditTrailEnabled: boolean;
}

export interface FrameworkSpecificRules {
  iso27001: FrameworkRule;
  nis2: FrameworkRule;
  cisControls: FrameworkRule;
  gdpr: FrameworkRule;
  custom: Map<string, FrameworkRule>;
}

export interface FrameworkRule {
  preserveExactReferences: boolean;
  allowSemanticMerging: boolean;
  criticalKeywords: string[];
  prohibitedMerges: string[];
  requiredSeparations: string[];
  customDeduplicationRules: CustomRule[];
}

export interface CustomRule {
  name: string;
  condition: string; // e.g., "contains:encryption" or "category:access_control"
  action: 'PRESERVE' | 'MERGE_CAUTIOUSLY' | 'ALLOW_AGGRESSIVE_MERGE' | 'REQUIRE_MANUAL_REVIEW';
  priority: number; // 1-10, higher = more important
}

export interface UserPreferences {
  userId: string;
  defaultMode: AbstractionMode;
  frameworkPreferences: Record<string, AbstractionMode>;
  qualitySettings: Partial<QualityConfiguration>;
  notificationSettings: NotificationSettings;
  savedConfigurations: SavedConfiguration[];
}

export interface NotificationSettings {
  notifyOnQualityIssues: boolean;
  notifyOnFallbacks: boolean;
  notifyOnLongProcessing: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  description: string;
  configuration: AbstractionConfiguration;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

/**
 * Abstraction Configuration Service
 * Provides centralized configuration management for smart abstraction features
 */
export class AbstractionConfigurationService {
  
  private static readonly STORAGE_KEY = 'abstraction_config';
  private static readonly USER_PREFS_KEY = 'abstraction_user_prefs';
  
  private configCache = new Map<string, AbstractionConfiguration>();
  private userPrefsCache = new Map<string, UserPreferences>();
  
  /**
   * Get configuration for specific abstraction mode
   */
  async getConfigForMode(mode: AbstractionMode): Promise<AbstractionConfiguration> {
    
    const cacheKey = `mode_${mode}`;
    
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }
    
    const config = this.createConfigForMode(mode);
    this.configCache.set(cacheKey, config);
    
    return config;
  }
  
  /**
   * Get user-specific configuration
   */
  async getUserConfiguration(userId: string): Promise<AbstractionConfiguration> {
    
    const userPrefs = await this.getUserPreferences(userId);
    const baseConfig = await this.getConfigForMode(userPrefs.defaultMode);
    
    // Apply user-specific quality settings
    return {
      ...baseConfig,
      quality: {
        ...baseConfig.quality,
        ...userPrefs.qualitySettings
      }
    };
  }
  
  /**
   * Get framework-specific configuration
   */
  async getFrameworkConfiguration(
    frameworks: string[],
    mode: AbstractionMode = 'MODERATE'
  ): Promise<AbstractionConfiguration> {
    
    const baseConfig = await this.getConfigForMode(mode);
    
    // Adjust configuration based on frameworks
    const adjustedRules = this.adjustForFrameworks(baseConfig.frameworkRules, frameworks);
    const adjustedQuality = this.adjustQualityForFrameworks(baseConfig.quality, frameworks);
    
    return {
      ...baseConfig,
      frameworkRules: adjustedRules,
      quality: adjustedQuality
    };
  }
  
  /**
   * Save user preferences
   */
  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    
    const currentPrefs = await this.getUserPreferences(userId);
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      userId
    };
    
    this.userPrefsCache.set(userId, updatedPrefs);
    
    try {
      localStorage.setItem(
        `${this.USER_PREFS_KEY}_${userId}`,
        JSON.stringify(updatedPrefs)
      );
    } catch (error) {
      console.warn('[CONFIG] Failed to save user preferences to storage:', error);
    }
  }
  
  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    
    if (this.userPrefsCache.has(userId)) {
      return this.userPrefsCache.get(userId)!;
    }
    
    try {
      const stored = localStorage.getItem(`${this.USER_PREFS_KEY}_${userId}`);
      if (stored) {
        const prefs = JSON.parse(stored);
        this.userPrefsCache.set(userId, prefs);
        return prefs;
      }
    } catch (error) {
      console.warn('[CONFIG] Failed to load user preferences from storage:', error);
    }
    
    // Return default preferences
    const defaultPrefs = this.createDefaultUserPreferences(userId);
    this.userPrefsCache.set(userId, defaultPrefs);
    return defaultPrefs;
  }
  
  /**
   * Save custom configuration
   */
  async saveConfiguration(
    userId: string,
    name: string,
    description: string,
    configuration: AbstractionConfiguration
  ): Promise<string> {
    
    const id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const savedConfig: SavedConfiguration = {
      id,
      name,
      description,
      configuration,
      createdAt: new Date(),
      useCount: 0
    };
    
    const userPrefs = await this.getUserPreferences(userId);
    userPrefs.savedConfigurations.push(savedConfig);
    
    await this.saveUserPreferences(userId, userPrefs);
    
    return id;
  }
  
  /**
   * Load saved configuration
   */
  async loadConfiguration(userId: string, configId: string): Promise<AbstractionConfiguration | null> {
    
    const userPrefs = await this.getUserPreferences(userId);
    const savedConfig = userPrefs.savedConfigurations.find(c => c.id === configId);
    
    if (!savedConfig) {
      return null;
    }
    
    // Update usage statistics
    savedConfig.lastUsed = new Date();
    savedConfig.useCount++;
    
    await this.saveUserPreferences(userId, userPrefs);
    
    return savedConfig.configuration;
  }
  
  /**
   * Get performance recommendations based on system state
   */
  getPerformanceRecommendations(
    requirementCount: number,
    frameworkCount: number,
    availableMemoryMB: number
  ): PerformanceConfiguration {
    
    const basePerf = this.createDefaultPerformanceConfig();
    
    // Adjust based on workload
    if (requirementCount > 1000) {
      basePerf.batchSize = Math.min(50, basePerf.batchSize);
      basePerf.maxProcessingTimeMs *= 2;
    }
    
    if (frameworkCount > 5) {
      basePerf.parallelProcessing = true;
      basePerf.maxConcurrentJobs = Math.min(4, frameworkCount);
    }
    
    if (availableMemoryMB < 512) {
      basePerf.batchSize = Math.min(25, basePerf.batchSize);
      basePerf.cacheEnabled = false;
      basePerf.parallelProcessing = false;
    }
    
    return basePerf;
  }
  
  /**
   * Validate configuration for compatibility and safety
   */
  validateConfiguration(config: AbstractionConfiguration): ValidationResult {
    
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Quality checks
    if (config.quality.minCompliancePreservation < 0.9) {
      warnings.push('Compliance preservation below 90% may introduce risks');
    }
    
    if (config.quality.maxComplexityIncrease > 2.0) {
      issues.push('Complexity increase above 200% not recommended');
    }
    
    // Performance checks
    if (config.performance.maxProcessingTimeMs > 300000) { // 5 minutes
      warnings.push('Processing time limit very high - may impact user experience');
    }
    
    if (config.performance.batchSize > 200) {
      warnings.push('Large batch size may consume excessive memory');
    }
    
    // Deduplication checks
    if (config.deduplication.strategies.exact_threshold < 0.95) {
      warnings.push('Low exact threshold may merge non-identical requirements');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }
  
  /**
   * Create configuration for specific mode
   */
  private createConfigForMode(mode: AbstractionMode): AbstractionConfiguration {
    
    const baseConfig = this.createBaseConfiguration();
    
    switch (mode) {
      case 'CONSERVATIVE':
        return {
          ...baseConfig,
          deduplication: {
            ...baseConfig.deduplication,
            strategies: {
              exact_threshold: 0.98,
              semantic_threshold: 0.90,
              hybrid_threshold: 0.85,
              clustering_threshold: 0.80
            },
            quality_requirements: {
              min_compliance_preservation: 0.98,
              max_complexity_increase: 1.1,
              min_confidence_score: 0.90,
              critical_gap_tolerance: 0
            }
          },
          quality: {
            ...baseConfig.quality,
            minCompliancePreservation: 0.98,
            maxComplexityIncrease: 1.1,
            minConfidenceScore: 0.90
          }
        };
        
      case 'AGGRESSIVE':
        return {
          ...baseConfig,
          deduplication: {
            ...baseConfig.deduplication,
            strategies: {
              exact_threshold: 0.95,
              semantic_threshold: 0.75,
              hybrid_threshold: 0.65,
              clustering_threshold: 0.55
            },
            quality_requirements: {
              min_compliance_preservation: 0.90,
              max_complexity_increase: 1.5,
              min_confidence_score: 0.75,
              critical_gap_tolerance: 0.1
            }
          },
          quality: {
            ...baseConfig.quality,
            minCompliancePreservation: 0.90,
            maxComplexityIncrease: 1.5,
            minConfidenceScore: 0.75
          }
        };
        
      case 'MODERATE':
      default:
        return baseConfig;
    }
  }
  
  /**
   * Create base configuration with moderate settings
   */
  private createBaseConfiguration(): AbstractionConfiguration {
    return {
      mode: 'MODERATE',
      deduplication: this.createDefaultDeduplicationConfig(),
      analysis: this.createDefaultAnalysisConfig(),
      performance: this.createDefaultPerformanceConfig(),
      quality: this.createDefaultQualityConfig(),
      frameworkRules: this.createDefaultFrameworkRules()
    };
  }
  
  /**
   * Create default deduplication configuration
   */
  private createDefaultDeduplicationConfig(): DeduplicationConfig {
    return {
      strategies: {
        exact_threshold: 0.97,
        semantic_threshold: 0.85,
        hybrid_threshold: 0.75,
        clustering_threshold: 0.65
      },
      quality_requirements: {
        min_compliance_preservation: 0.95,
        max_complexity_increase: 1.3,
        min_confidence_score: 0.85,
        critical_gap_tolerance: 0
      },
      processing_options: {
        enable_exact_deduplication: true,
        enable_semantic_deduplication: true,
        enable_progressive_deduplication: true,
        enable_framework_aware_mode: true,
        batch_size: 100,
        max_processing_time_ms: 120000
      },
      fallback_strategies: {
        on_quality_failure: 'KEEP_SEPARATE',
        on_compliance_risk: 'ABORT_MERGE',
        on_processing_timeout: 'PARTIAL_RESULTS'
      }
    };
  }
  
  /**
   * Create default analysis configuration
   */
  private createDefaultAnalysisConfig(): AnalysisConfig {
    return {
      tfidf_weights: {
        control_terms: 0.3,
        process_terms: 0.25,
        technical_terms: 0.25,
        domain_terms: 0.2
      },
      similarity_thresholds: {
        semantic: 0.85,
        structural: 0.75,
        contextual: 0.70,
        clustering: 0.65
      },
      clustering_config: {
        min_cluster_size: 2,
        max_clusters: 20,
        quality_threshold: 0.75
      },
      performance_limits: {
        max_processing_time: 60000,
        max_requirements_per_batch: 100,
        cache_ttl: 3600000
      }
    };
  }
  
  /**
   * Create default performance configuration
   */
  private createDefaultPerformanceConfig(): PerformanceConfiguration {
    return {
      maxProcessingTimeMs: 120000, // 2 minutes
      batchSize: 100,
      cacheEnabled: true,
      cacheTTLMs: 3600000, // 1 hour
      maxMemoryUsageMB: 256,
      parallelProcessing: false,
      maxConcurrentJobs: 2
    };
  }
  
  /**
   * Create default quality configuration
   */
  private createDefaultQualityConfig(): QualityConfiguration {
    return {
      minCompliancePreservation: 0.95,
      maxComplexityIncrease: 1.3,
      minConfidenceScore: 0.85,
      criticalGapTolerance: 0,
      qualityAssuranceEnabled: true,
      fallbackOnQualityFailure: true,
      auditTrailEnabled: true
    };
  }
  
  /**
   * Create default framework rules
   */
  private createDefaultFrameworkRules(): FrameworkSpecificRules {
    return {
      iso27001: {
        preserveExactReferences: true,
        allowSemanticMerging: true,
        criticalKeywords: ['control', 'audit', 'certification', 'compliance'],
        prohibitedMerges: ['A.5.1', 'A.6.1', 'A.8.1'],
        requiredSeparations: ['management_controls', 'technical_controls'],
        customDeduplicationRules: []
      },
      nis2: {
        preserveExactReferences: true,
        allowSemanticMerging: false,
        criticalKeywords: ['essential', 'important', 'incident', 'report'],
        prohibitedMerges: ['Article 20', 'Article 21', 'Article 23'],
        requiredSeparations: ['incident_reporting', 'risk_management'],
        customDeduplicationRules: []
      },
      cisControls: {
        preserveExactReferences: true,
        allowSemanticMerging: true,
        criticalKeywords: ['implementation', 'safeguard', 'control'],
        prohibitedMerges: [],
        requiredSeparations: ['basic', 'foundational', 'organizational'],
        customDeduplicationRules: []
      },
      gdpr: {
        preserveExactReferences: true,
        allowSemanticMerging: false,
        criticalKeywords: ['data protection', 'privacy', 'consent', 'breach'],
        prohibitedMerges: ['Article 6', 'Article 7', 'Article 32'],
        requiredSeparations: ['lawfulness', 'security_measures'],
        customDeduplicationRules: []
      },
      custom: new Map()
    };
  }
  
  /**
   * Create default user preferences
   */
  private createDefaultUserPreferences(userId: string): UserPreferences {
    return {
      userId,
      defaultMode: 'MODERATE',
      frameworkPreferences: {},
      qualitySettings: {},
      notificationSettings: {
        notifyOnQualityIssues: true,
        notifyOnFallbacks: true,
        notifyOnLongProcessing: true,
        emailNotifications: false,
        inAppNotifications: true
      },
      savedConfigurations: []
    };
  }
  
  /**
   * Adjust framework rules for specific frameworks
   */
  private adjustForFrameworks(
    baseRules: FrameworkSpecificRules,
    frameworks: string[]
  ): FrameworkSpecificRules {
    
    // If critical frameworks are present, be more conservative
    const criticalFrameworks = ['nis2', 'gdpr'];
    const hasCritical = frameworks.some(f => criticalFrameworks.includes(f.toLowerCase()));
    
    if (hasCritical) {
      // Make all frameworks more conservative
      const adjustedRules = { ...baseRules };
      
      for (const framework of frameworks) {
        if (adjustedRules[framework as keyof FrameworkSpecificRules]) {
          const rule = adjustedRules[framework as keyof FrameworkSpecificRules] as FrameworkRule;
          rule.allowSemanticMerging = false;
          rule.preserveExactReferences = true;
        }
      }
      
      return adjustedRules;
    }
    
    return baseRules;
  }
  
  /**
   * Adjust quality settings for specific frameworks
   */
  private adjustQualityForFrameworks(
    baseQuality: QualityConfiguration,
    frameworks: string[]
  ): QualityConfiguration {
    
    const criticalFrameworks = ['nis2', 'gdpr'];
    const hasCritical = frameworks.some(f => criticalFrameworks.includes(f.toLowerCase()));
    
    if (hasCritical) {
      return {
        ...baseQuality,
        minCompliancePreservation: Math.max(0.98, baseQuality.minCompliancePreservation),
        maxComplexityIncrease: Math.min(1.2, baseQuality.maxComplexityIncrease),
        minConfidenceScore: Math.max(0.90, baseQuality.minConfidenceScore),
        criticalGapTolerance: 0
      };
    }
    
    return baseQuality;
  }
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}