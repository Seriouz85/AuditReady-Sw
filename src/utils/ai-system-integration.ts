/**
 * AI System Integration Utilities
 * Helper functions for integrating AI services across the application
 */

import { geminiWebScrapingService } from '@/services/ai/GeminiWebScrapingService';
import { dynamicContentEnhancementEngine } from '@/services/ai/DynamicContentEnhancementEngine';
import { realtimeAIProcessingPipeline } from '@/services/ai/RealtimeAIProcessingPipeline';
import { frameworkAwareAITrainer } from '@/services/ai/FrameworkAwareAITrainer';
import { qualityScoringEngine } from '@/services/ai/QualityScoringEngine';
import { intelligentContentMerger } from '@/services/ai/IntelligentContentMerger';
import { automatedQualityAssurance } from '@/services/ai/AutomatedQualityAssurance';
import { aiSystemMonitor } from '@/services/monitoring/AISystemMonitor';

// ============================================================================
// INTEGRATION ORCHESTRATOR
// ============================================================================

export class AISystemIntegration {
  private static instance: AISystemIntegration | null = null;

  private constructor() {}

  public static getInstance(): AISystemIntegration {
    if (!AISystemIntegration.instance) {
      AISystemIntegration.instance = new AISystemIntegration();
    }
    return AISystemIntegration.instance;
  }

  /**
   * Complete AI-powered content workflow
   * From URL scraping to quality-assured enhanced content
   */
  public async processContentWorkflow(options: {
    url?: string;
    content?: string;
    frameworks: string[];
    categories: string[];
    targetQuality: 'basic' | 'standard' | 'professional' | 'expert';
    enableQA?: boolean;
    enableMonitoring?: boolean;
  }): Promise<ContentWorkflowResult> {
    const startTime = Date.now();
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    let content = options.content;

    try {
      console.log(`[Integration] Starting content workflow ${workflowId}`);
      let scrapingResult: any = null;

      // Step 1: Web scraping (if URL provided)
      if (options.url && !content) {
        console.log(`[Integration] Step 1: Web scraping from ${options.url}`);
        scrapingResult = await geminiWebScrapingService.scrapeAndEnhance({
          url: options.url,
          frameworks: options.frameworks,
          categories: options.categories,
          qualityLevel: options.targetQuality,
          options: {
            enableCaching: true,
            maxRetries: 2,
            timeout: 30000
          }
        });

        if (!scrapingResult.success) {
          throw new Error(`Web scraping failed: ${scrapingResult.errors?.join(', ')}`);
        }

        content = scrapingResult.extractedContent;
      }

      if (!content) {
        throw new Error('No content provided or extracted');
      }

      // Step 2: Content enhancement
      console.log('[Integration] Step 2: Content enhancement');
      const enhancementResult = await dynamicContentEnhancementEngine.enhanceContent({
        content,
        contentType: 'guidance',
        frameworks: options.frameworks,
        categories: options.categories,
        targetQuality: options.targetQuality,
        enhancementTypes: [
          'clarity_improvement',
          'framework_alignment',
          'implementation_guidance',
          'structure_optimization'
        ],
        options: {
          enableRealTimeStreaming: false,
          maxEnhancementDepth: 'comprehensive'
        }
      });

      if (!enhancementResult.success) {
        throw new Error(`Content enhancement failed: ${enhancementResult.errors?.join(', ')}`);
      }

      // Step 3: AI processing pipeline
      console.log('[Integration] Step 3: AI processing pipeline');
      const processingResult = await realtimeAIProcessingPipeline.processContent({
        contentId: workflowId,
        content: enhancementResult.enhancedContent,
        contentType: 'guidance',
        frameworks: options.frameworks,
        categories: options.categories,
        priority: 'high',
        options: {
          enableStreaming: false,
          maxConcurrency: 3,
          enableCaching: true
        }
      });

      if (!processingResult.success) {
        throw new Error(`AI processing failed: ${processingResult.errors?.join(', ')}`);
      }

      // Step 4: Quality assurance (if enabled)
      let qaResult: any = null;
      if (options.enableQA) {
        console.log('[Integration] Step 4: Quality assurance');
        qaResult = await automatedQualityAssurance.executeQualityAssurance({
          contentId: workflowId,
          content: processingResult.processedContent,
          contentType: 'guidance',
          frameworks: options.frameworks,
          categories: options.categories,
          validationLevel: options.targetQuality === 'expert' ? 'comprehensive' : 'standard',
          context: {
            targetAudience: 'internal',
            urgency: 'normal',
            stakeholders: ['admin'],
            approvalRequired: false,
            auditTrailRequired: true
          },
          options: {
            enableAutomaticRemediation: true,
            requireHumanApproval: false,
            generateAuditTrail: true,
            performanceBenchmarking: true,
            realTimeMonitoring: options.enableMonitoring || false,
            escalationThreshold: 0.7,
            maxRemediationAttempts: 2
          }
        });
      }

      // Step 5: Final quality scoring
      console.log('[Integration] Step 5: Final quality scoring');
      const finalQualityScore = await qualityScoringEngine.assessQuality({
        content: processingResult.processedContent,
        contentType: 'guidance',
        frameworks: options.frameworks,
        categories: options.categories,
        context: {
          targetAudience: 'intermediate',
          organizationSize: 'enterprise',
          complianceMaturity: 'defined'
        }
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      const result: ContentWorkflowResult = {
        workflowId,
        success: true,
        processingTime,
        steps: {
          scraping: scrapingResult,
          enhancement: enhancementResult,
          processing: processingResult,
          qualityAssurance: qaResult,
          finalQuality: finalQualityScore
        },
        finalContent: processingResult.processedContent,
        qualityScore: finalQualityScore.overall,
        metadata: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          frameworks: options.frameworks,
          categories: options.categories,
          targetQuality: options.targetQuality
        }
      };

      console.log(`[Integration] Workflow ${workflowId} completed successfully in ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`[Integration] Workflow ${workflowId} failed:`, error);
      
      return {
        workflowId,
        success: false,
        processingTime: Date.now() - startTime,
        steps: {},
        finalContent: content || '',
        qualityScore: 0,
        metadata: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          frameworks: options.frameworks,
          categories: options.categories,
          targetQuality: options.targetQuality
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Batch process multiple pieces of content
   */
  public async batchProcessContent(
    items: Array<{
      id: string;
      url?: string;
      content?: string;
      frameworks: string[];
      categories: string[];
    }>,
    options: {
      targetQuality: 'basic' | 'standard' | 'professional' | 'expert';
      enableQA?: boolean;
      maxConcurrency?: number;
    }
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    console.log(`[Integration] Starting batch processing ${batchId} with ${items.length} items`);

    const maxConcurrency = options.maxConcurrency || 3;
    const results: ContentWorkflowResult[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process items in batches to control concurrency
    for (let i = 0; i < items.length; i += maxConcurrency) {
      const batch = items.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await this.processContentWorkflow({
            url: item.url,
            content: item.content,
            frameworks: item.frameworks,
            categories: item.categories,
            targetQuality: options.targetQuality,
            enableQA: options.enableQA,
            enableMonitoring: false // Disable monitoring for batch processing
          });

          return { ...result, itemId: item.id };
        } catch (error) {
          errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null) as ContentWorkflowResult[]);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const batchResult: BatchProcessingResult = {
      batchId,
      totalItems: items.length,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length,
      processingTime,
      results,
      errors,
      summary: {
        averageQualityScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length || 0,
        averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length || 0,
        frameworksCovered: [...new Set(items.flatMap(i => i.frameworks))],
        categoriesCovered: [...new Set(items.flatMap(i => i.categories))]
      }
    };

    console.log(`[Integration] Batch ${batchId} completed: ${batchResult.successCount}/${batchResult.totalItems} successful`);
    return batchResult;
  }

  /**
   * Get comprehensive system analytics
   */
  public async getSystemAnalytics(timeframe: string = '24h'): Promise<SystemAnalytics> {
    try {
      const [
        healthStatus,
        performanceReport,
        webScrapingAnalytics,
        enhancementAnalytics,
        qaAnalytics
      ] = await Promise.all([
        aiSystemMonitor.getSystemHealth(),
        aiSystemMonitor.generatePerformanceReport(timeframe),
        geminiWebScrapingService.getScrapingAnalytics(),
        dynamicContentEnhancementEngine.getEnhancementAnalytics(),
        automatedQualityAssurance.getQADashboard()
      ]);

      return {
        timeframe,
        systemHealth: healthStatus,
        performance: performanceReport,
        serviceAnalytics: {
          webScraping: webScrapingAnalytics,
          enhancement: enhancementAnalytics,
          qualityAssurance: qaAnalytics
        },
        aggregatedMetrics: {
          totalProcessed: (webScrapingAnalytics?.totalScrapes || 0) + (enhancementAnalytics?.totalEnhancements || 0),
          overallSuccessRate: (
            ((webScrapingAnalytics?.successRate || 0) + (enhancementAnalytics?.successRate || 0) + (qaAnalytics?.overview?.successRate || 0)) / 3
          ),
          averageQualityScore: (
            ((webScrapingAnalytics?.avgQualityScore || 0) + (enhancementAnalytics?.avgImprovementScore || 0)) / 2
          ),
          totalCost: (webScrapingAnalytics?.totalCost || 0) + (enhancementAnalytics?.totalCost || 0),
          systemUptime: healthStatus.uptime
        },
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('[Integration] Failed to get system analytics:', error);
      throw error;
    }
  }

  /**
   * Health check for all AI services
   */
  public async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const healthStatus = await aiSystemMonitor.getSystemHealth();
      
      const serviceChecks = await Promise.allSettled([
        this.checkServiceHealth('webScraping'),
        this.checkServiceHealth('enhancement'),
        this.checkServiceHealth('processing'),
        this.checkServiceHealth('qualityAssurance'),
        this.checkServiceHealth('training')
      ]);

      const healthChecks = serviceChecks.map((result, index) => {
        const serviceNames = ['webScraping', 'enhancement', 'processing', 'qualityAssurance', 'training'];
        return {
          service: serviceNames[index],
          status: result.status === 'fulfilled' ? 'healthy' : 'error',
          details: result.status === 'fulfilled' ? result.value : { error: result.reason }
        };
      });

      return {
        overall: healthStatus.overall,
        services: healthChecks,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        recommendations: healthStatus.recommendations
      };

    } catch (error) {
      return {
        overall: 'critical',
        services: [],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        recommendations: ['System health check failed - investigate monitoring service'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(serviceName: string): Promise<any> {
    switch (serviceName) {
      case 'webScraping':
        return await geminiWebScrapingService.getScrapingAnalytics();
      case 'enhancement':
        return await dynamicContentEnhancementEngine.getEnhancementAnalytics();
      case 'qualityAssurance':
        return await automatedQualityAssurance.getQADashboard();
      default:
        return { status: 'healthy', message: 'Service check not implemented' };
    }
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContentWorkflowResult {
  workflowId: string;
  success: boolean;
  processingTime: number;
  steps: {
    scraping?: any;
    enhancement?: any;
    processing?: any;
    qualityAssurance?: any;
    finalQuality?: any;
  };
  finalContent: string;
  qualityScore: number;
  metadata: {
    startTime: string;
    endTime: string;
    frameworks: string[];
    categories: string[];
    targetQuality: string;
  };
  itemId?: string;
  errors?: string[];
}

export interface BatchProcessingResult {
  batchId: string;
  totalItems: number;
  successCount: number;
  errorCount: number;
  processingTime: number;
  results: ContentWorkflowResult[];
  errors: Array<{ id: string; error: string }>;
  summary: {
    averageQualityScore: number;
    averageProcessingTime: number;
    frameworksCovered: string[];
    categoriesCovered: string[];
  };
}

export interface SystemAnalytics {
  timeframe: string;
  systemHealth: any;
  performance: any;
  serviceAnalytics: {
    webScraping?: any;
    enhancement?: any;
    qualityAssurance?: any;
  };
  aggregatedMetrics: {
    totalProcessed: number;
    overallSuccessRate: number;
    averageQualityScore: number;
    totalCost: number;
    systemUptime: number;
  };
  generatedAt: string;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  services: Array<{
    service: string;
    status: 'healthy' | 'warning' | 'error';
    details: any;
  }>;
  timestamp: string;
  processingTime: number;
  recommendations: string[];
  error?: string;
}

// Export singleton instance
export const aiSystemIntegration = AISystemIntegration.getInstance();