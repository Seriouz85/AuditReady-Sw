/**
 * Compliance Abstraction Service
 * 
 * High-level orchestration service for the entire smart abstraction workflow.
 * Coordinates semantic analysis, deduplication, harmonization, and template integration.
 * Provides caching, performance optimization, progress tracking, and error recovery.
 */

import { 
  EnhancedCleanUnifiedRequirementsGenerator,
  AbstractionResult,
  AbstractionMode,
  AbstractionOptions,
  AbstractionProgress
} from './EnhancedCleanUnifiedRequirementsGenerator';

import { AbstractionConfigurationService } from './AbstractionConfigurationService';
import { IntelligentDeduplicationEngine, DeduplicationResult } from './IntelligentDeduplicationEngine';
import { FrameworkRequirement, CleanUnifiedRequirement } from '../CleanUnifiedRequirementsGenerator';

export interface AbstractionWorkflowOptions {
  mode: AbstractionMode;
  userId?: string;
  frameworks: string[];
  enableCaching: boolean;
  enableProgressTracking: boolean;
  enableAuditTrail: boolean;
  performanceOptimizations: boolean;
  fallbackStrategy: 'GRACEFUL' | 'STRICT' | 'AGGRESSIVE';
  qualityThresholds: {
    minimum: number;
    target: number;
    excellent: number;
  };
}

export interface WorkflowResult {
  success: boolean;
  results: Map<string, AbstractionResult>;
  summary: WorkflowSummary;
  performance: WorkflowPerformance;
  auditTrail?: AuditEntry[];
  errors?: WorkflowError[];
  warnings?: string[];
}

export interface WorkflowSummary {
  categoriesProcessed: number;
  categoriesSuccessful: number;
  categoriesWithAbstraction: number;
  totalReductionAchieved: number;
  averageQualityScore: number;
  complianceIntegrityPreserved: boolean;
  recommendedNextSteps: string[];
}

export interface WorkflowPerformance {
  totalProcessingTimeMs: number;
  averageTimePerCategory: number;
  cacheHitRate: number;
  memoryUsagePeakMB: number;
  throughputCategoriesPerSecond: number;
  bottlenecks: PerformanceBottleneck[];
}

export interface PerformanceBottleneck {
  stage: 'SEMANTIC_ANALYSIS' | 'DEDUPLICATION' | 'HARMONIZATION' | 'TEMPLATE_INTEGRATION';
  timeSpentMs: number;
  percentageOfTotal: number;
  suggestions: string[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  category: string;
  details: any;
  userId?: string;
  result: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface WorkflowError {
  category: string;
  stage: string;
  message: string;
  recoveryAction: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  memoryUsedMB: number;
  entriesCount: number;
  oldestEntryAge: number;
}

/**
 * Compliance Abstraction Service
 * Orchestrates the complete smart abstraction workflow for compliance requirements
 */
export class ComplianceAbstractionService {
  
  private configService = new AbstractionConfigurationService();
  private enhancedGenerator = EnhancedCleanUnifiedRequirementsGenerator;
  private cache = new Map<string, { result: AbstractionResult; timestamp: Date; ttl: number }>();
  private auditTrail: AuditEntry[] = [];
  
  private static readonly DEFAULT_CACHE_TTL = 3600000; // 1 hour
  private static readonly MAX_CACHE_SIZE = 100;
  
  /**
   * Execute complete abstraction workflow for multiple categories
   */
  async executeWorkflow(
    categories: Array<{ name: string; requirements: FrameworkRequirement[] }>,
    options: AbstractionWorkflowOptions
  ): Promise<WorkflowResult> {
    
    const startTime = Date.now();
    const workflowId = this.generateWorkflowId();
    
    console.log(`[ABSTRACTION-SERVICE] Starting workflow ${workflowId} for ${categories.length} categories`);
    
    try {
      // Initialize workflow
      const results = new Map<string, AbstractionResult>();
      const errors: WorkflowError[] = [];
      const warnings: string[] = [];
      const performanceData: PerformanceBottleneck[] = [];
      
      // Add audit entry
      this.addAuditEntry('WORKFLOW_STARTED', 'ALL', {
        workflowId,
        categoriesCount: categories.length,
        mode: options.mode,
        frameworks: options.frameworks
      }, options.userId);
      
      // Get user configuration
      const config = options.userId 
        ? await this.configService.getUserConfiguration(options.userId)
        : await this.configService.getFrameworkConfiguration(options.frameworks, options.mode);
      
      // Process categories with progress tracking
      let processedCount = 0;
      let successCount = 0;
      
      for (const category of categories) {
        try {
          const categoryStartTime = Date.now();
          
          // Check cache first
          const cacheKey = this.generateCacheKey(category, options);
          const cached = this.getCached(cacheKey);
          
          if (cached && options.enableCaching) {
            results.set(category.name, cached);
            console.log(`[ABSTRACTION-SERVICE] Cache hit for ${category.name}`);
            
            this.addAuditEntry('CACHE_HIT', category.name, { cacheKey }, options.userId);
          } else {
            // Process category
            const result = await this.processSingleCategory(category, config, options);
            results.set(category.name, result);
            
            // Cache result if successful
            if (result.enhanced && options.enableCaching) {
              this.setCached(cacheKey, result);
            }
            
            this.addAuditEntry(
              result.abstraction.applied ? 'ABSTRACTION_APPLIED' : 'STANDARD_PROCESSING',
              category.name,
              {
                applied: result.abstraction.applied,
                reduction: result.abstraction.reductionPercentage,
                quality: result.abstraction.qualityScore
              },
              options.userId
            );
          }
          
          if (results.get(category.name)?.enhanced || results.get(category.name)?.original) {
            successCount++;
          }
          
          processedCount++;
          
          // Track performance
          const categoryTime = Date.now() - categoryStartTime;
          if (categoryTime > 5000) { // More than 5 seconds
            warnings.push(`Category ${category.name} took ${Math.round(categoryTime / 1000)}s to process`);
          }
          
          // Progress callback
          if (options.enableProgressTracking) {
            this.reportProgress(processedCount, categories.length, category.name);
          }
          
        } catch (error) {
          console.error(`[ABSTRACTION-SERVICE] Error processing ${category.name}:`, error);
          
          const workflowError: WorkflowError = {
            category: category.name,
            stage: 'CATEGORY_PROCESSING',
            message: error.message,
            recoveryAction: this.getRecoveryAction(error, options.fallbackStrategy),
            severity: this.assessErrorSeverity(error)
          };
          
          errors.push(workflowError);
          
          this.addAuditEntry('ERROR', category.name, { error: error.message }, options.userId, 'ERROR');
          
          // Attempt recovery based on strategy
          const recoveryResult = await this.attemptRecovery(category, workflowError, options);
          if (recoveryResult) {
            results.set(category.name, recoveryResult);
            successCount++;
          }
          
          processedCount++;
        }
      }
      
      const totalTime = Date.now() - startTime;
      
      // Generate summary and performance metrics
      const summary = this.generateSummary(results, successCount, categories.length);
      const performance = this.generatePerformanceMetrics(totalTime, processedCount, performanceData);
      
      this.addAuditEntry('WORKFLOW_COMPLETED', 'ALL', {
        workflowId,
        success: errors.length === 0,
        summary,
        performance
      }, options.userId, errors.length === 0 ? 'SUCCESS' : 'WARNING');
      
      return {
        success: errors.length === 0,
        results,
        summary,
        performance,
        auditTrail: options.enableAuditTrail ? [...this.auditTrail] : undefined,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
      
    } catch (error) {
      console.error(`[ABSTRACTION-SERVICE] Workflow ${workflowId} failed:`, error);
      
      this.addAuditEntry('WORKFLOW_FAILED', 'ALL', {
        workflowId,
        error: error.message
      }, options.userId, 'ERROR');
      
      throw new Error(`Abstraction workflow failed: ${error.message}`);
    }
  }
  
  /**
   * Process a single category with full abstraction pipeline
   */
  async processSingleCategory(
    category: { name: string; requirements: FrameworkRequirement[] },
    config: any,
    options: AbstractionWorkflowOptions
  ): Promise<AbstractionResult> {
    
    const enhancedOptions = {
      abstraction: {
        mode: options.mode,
        enableDeduplication: true,
        preserveAllReferences: true,
        qualityThreshold: options.qualityThresholds.minimum,
        maxComplexityIncrease: 1.3,
        enableFallback: options.fallbackStrategy !== 'STRICT'
      },
      featureFlags: {
        enableAbstraction: true,
        enableProgressReporting: options.enableProgressTracking,
        enableQualityAssurance: true,
        enableCaching: options.enableCaching
      }
    };
    
    return await this.enhancedGenerator.generateForCategory(
      category.name,
      category.requirements,
      enhancedOptions
    );
  }
  
  /**
   * Get comprehensive analysis report
   */
  async generateAnalysisReport(
    workflowResult: WorkflowResult,
    includeRecommendations: boolean = true
  ): Promise<AnalysisReport> {
    
    const report: AnalysisReport = {
      executive_summary: this.generateExecutiveSummary(workflowResult),
      detailed_analysis: this.generateDetailedAnalysis(workflowResult),
      quality_assessment: this.generateQualityAssessment(workflowResult),
      performance_analysis: this.generatePerformanceAnalysis(workflowResult),
      compliance_impact: this.generateComplianceImpact(workflowResult),
      recommendations: includeRecommendations ? this.generateRecommendations(workflowResult) : [],
      appendices: {
        audit_trail: workflowResult.auditTrail || [],
        error_details: workflowResult.errors || [],
        performance_metrics: workflowResult.performance
      }
    };
    
    return report;
  }
  
  /**
   * Get cache statistics and health
   */
  getCacheMetrics(): CacheMetrics {
    const now = Date.now();
    let totalRequests = 0;
    let cacheHits = 0;
    let memoryUsed = 0;
    let oldestAge = 0;
    
    for (const [key, value] of this.cache.entries()) {
      totalRequests++;
      
      const age = now - value.timestamp.getTime();
      if (age < value.ttl) {
        cacheHits++;
        memoryUsed += this.estimateObjectSize(value.result);
        oldestAge = Math.max(oldestAge, age);
      }
    }
    
    return {
      totalRequests,
      cacheHits,
      cacheMisses: totalRequests - cacheHits,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      memoryUsedMB: Math.round(memoryUsed / 1024 / 1024 * 100) / 100,
      entriesCount: this.cache.size,
      oldestEntryAge: oldestAge
    };
  }
  
  /**
   * Clear cache and reset metrics
   */
  clearCache(): void {
    this.cache.clear();
    this.addAuditEntry('CACHE_CLEARED', 'SYSTEM', {}, undefined);
    console.log('[ABSTRACTION-SERVICE] Cache cleared');
  }
  
  /**
   * Optimize cache by removing expired entries
   */
  optimizeCache(): number {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp.getTime() > value.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    console.log(`[ABSTRACTION-SERVICE] Cache optimization removed ${removedCount} expired entries`);
    return removedCount;
  }
  
  /**
   * Generate cache key for category and options
   */
  private generateCacheKey(
    category: { name: string; requirements: FrameworkRequirement[] },
    options: AbstractionWorkflowOptions
  ): string {
    
    const keyData = {
      name: category.name,
      reqCount: category.requirements.length,
      reqHash: this.hashRequirements(category.requirements),
      mode: options.mode,
      frameworks: options.frameworks.sort().join(','),
      thresholds: options.qualityThresholds
    };
    
    return `abstraction_${this.hashObject(keyData)}`;
  }
  
  /**
   * Get cached result if valid
   */
  private getCached(key: string): AbstractionResult | null {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.result;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired entry
    }
    
    return null;
  }
  
  /**
   * Set cached result
   */
  private setCached(key: string, result: AbstractionResult): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= ComplianceAbstractionService.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      result,
      timestamp: new Date(),
      ttl: ComplianceAbstractionService.DEFAULT_CACHE_TTL
    });
  }
  
  /**
   * Add audit trail entry
   */
  private addAuditEntry(
    action: string,
    category: string,
    details: any,
    userId?: string,
    result: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS'
  ): void {
    
    this.auditTrail.push({
      timestamp: new Date(),
      action,
      category,
      details,
      userId,
      result
    });
    
    // Keep only last 1000 entries
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-1000);
    }
  }
  
  /**
   * Generate workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Report progress
   */
  private reportProgress(processed: number, total: number, currentCategory: string): void {
    const progress = Math.round((processed / total) * 100);
    console.log(`[ABSTRACTION-SERVICE] Progress: ${progress}% (${processed}/${total}) - Processing: ${currentCategory}`);
  }
  
  /**
   * Generate summary from results
   */
  private generateSummary(
    results: Map<string, AbstractionResult>,
    successCount: number,
    totalCount: number
  ): WorkflowSummary {
    
    let abstractionCount = 0;
    let totalReduction = 0;
    let totalQuality = 0;
    
    for (const result of results.values()) {
      if (result.abstraction.applied) {
        abstractionCount++;
        totalReduction += result.abstraction.reductionPercentage;
        totalQuality += result.abstraction.qualityScore;
      }
    }
    
    return {
      categoriesProcessed: totalCount,
      categoriesSuccessful: successCount,
      categoriesWithAbstraction: abstractionCount,
      totalReductionAchieved: abstractionCount > 0 ? Math.round(totalReduction / abstractionCount) : 0,
      averageQualityScore: abstractionCount > 0 ? Math.round((totalQuality / abstractionCount) * 100) / 100 : 0,
      complianceIntegrityPreserved: true, // Would be calculated based on validation results
      recommendedNextSteps: this.generateNextSteps(results)
    };
  }
  
  /**
   * Generate performance metrics
   */
  private generatePerformanceMetrics(
    totalTime: number,
    processedCount: number,
    bottlenecks: PerformanceBottleneck[]
  ): WorkflowPerformance {
    
    const cacheMetrics = this.getCacheMetrics();
    
    return {
      totalProcessingTimeMs: totalTime,
      averageTimePerCategory: processedCount > 0 ? Math.round(totalTime / processedCount) : 0,
      cacheHitRate: cacheMetrics.hitRate,
      memoryUsagePeakMB: cacheMetrics.memoryUsedMB,
      throughputCategoriesPerSecond: totalTime > 0 ? Math.round((processedCount / totalTime) * 1000 * 100) / 100 : 0,
      bottlenecks
    };
  }
  
  /**
   * Generate next steps recommendations
   */
  private generateNextSteps(results: Map<string, AbstractionResult>): string[] {
    const steps: string[] = [];
    
    const failedCount = Array.from(results.values()).filter(r => !r.enhanced && !r.original).length;
    const lowQualityCount = Array.from(results.values()).filter(r => r.abstraction.qualityScore < 0.8).length;
    const highReductionCount = Array.from(results.values()).filter(r => r.abstraction.reductionPercentage > 30).length;
    
    if (failedCount > 0) {
      steps.push(`Review ${failedCount} failed categories and consider manual processing`);
    }
    
    if (lowQualityCount > 0) {
      steps.push(`Investigate ${lowQualityCount} categories with low quality scores`);
    }
    
    if (highReductionCount > 0) {
      steps.push(`Validate ${highReductionCount} categories with high reduction rates for compliance integrity`);
    }
    
    steps.push('Export results for stakeholder review');
    steps.push('Schedule follow-up validation with compliance team');
    
    return steps;
  }
  
  /**
   * Attempt error recovery
   */
  private async attemptRecovery(
    category: { name: string; requirements: FrameworkRequirement[] },
    error: WorkflowError,
    options: AbstractionWorkflowOptions
  ): Promise<AbstractionResult | null> {
    
    if (options.fallbackStrategy === 'STRICT') {
      return null;
    }
    
    try {
      // Try with more conservative settings
      const fallbackOptions = {
        abstraction: {
          mode: 'CONSERVATIVE' as AbstractionMode,
          enableDeduplication: false,
          preserveAllReferences: true,
          qualityThreshold: 0.95,
          maxComplexityIncrease: 1.1,
          enableFallback: true
        },
        featureFlags: {
          enableAbstraction: false,
          enableProgressReporting: false,
          enableQualityAssurance: true,
          enableCaching: false
        }
      };
      
      const result = await this.enhancedGenerator.generateForCategory(
        category.name,
        category.requirements,
        fallbackOptions
      );
      
      this.addAuditEntry('RECOVERY_SUCCESS', category.name, {
        originalError: error.message,
        recoveryStrategy: 'CONSERVATIVE_FALLBACK'
      });
      
      return result;
      
    } catch (recoveryError) {
      this.addAuditEntry('RECOVERY_FAILED', category.name, {
        originalError: error.message,
        recoveryError: recoveryError.message
      }, undefined, 'ERROR');
      
      return null;
    }
  }
  
  /**
   * Assess error severity
   */
  private assessErrorSeverity(error: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('template not found') || message.includes('no requirements')) {
      return 'LOW';
    }
    
    if (message.includes('quality threshold') || message.includes('validation failed')) {
      return 'MEDIUM';
    }
    
    if (message.includes('timeout') || message.includes('memory')) {
      return 'HIGH';
    }
    
    if (message.includes('critical') || message.includes('compliance')) {
      return 'CRITICAL';
    }
    
    return 'MEDIUM';
  }
  
  /**
   * Get recovery action based on error and strategy
   */
  private getRecoveryAction(error: any, strategy: string): string {
    const severity = this.assessErrorSeverity(error);
    
    switch (severity) {
      case 'LOW':
        return 'Retry with standard generator';
      case 'MEDIUM':
        return 'Apply conservative abstraction settings';
      case 'HIGH':
        return 'Reduce batch size and retry';
      case 'CRITICAL':
        return 'Manual review required';
      default:
        return 'Contact system administrator';
    }
  }
  
  /**
   * Hash requirements for cache key
   */
  private hashRequirements(requirements: FrameworkRequirement[]): string {
    const combined = requirements.map(r => `${r.code}:${r.title}`).join('|');
    return this.hashObject(combined);
  }
  
  /**
   * Simple hash function for objects
   */
  private hashObject(obj: any): string {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Estimate object size in bytes
   */
  private estimateObjectSize(obj: any): number {
    const str = JSON.stringify(obj);
    return str.length * 2; // Rough estimate for UTF-16
  }
  
  // Additional methods for report generation would be implemented here
  private generateExecutiveSummary(result: WorkflowResult): any { return {}; }
  private generateDetailedAnalysis(result: WorkflowResult): any { return {}; }
  private generateQualityAssessment(result: WorkflowResult): any { return {}; }
  private generatePerformanceAnalysis(result: WorkflowResult): any { return {}; }
  private generateComplianceImpact(result: WorkflowResult): any { return {}; }
  private generateRecommendations(result: WorkflowResult): any[] { return []; }
}

export interface AnalysisReport {
  executive_summary: any;
  detailed_analysis: any;
  quality_assessment: any;
  performance_analysis: any;
  compliance_impact: any;
  recommendations: any[];
  appendices: {
    audit_trail: AuditEntry[];
    error_details: WorkflowError[];
    performance_metrics: WorkflowPerformance;
  };
}