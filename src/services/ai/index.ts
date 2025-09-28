/**
 * AI Services Index
 * =================
 * 
 * Centralized export for all AI-powered services in the unified guidance system.
 * This index provides easy access to all AI services and maintains consistent
 * imports across the application.
 */

// Main orchestrator service
import { AIGuidanceOrchestrator, aiGuidanceOrchestrator } from './AIGuidanceOrchestrator';
import { GeminiContentGenerator, geminiContentGenerator } from './GeminiContentGenerator';
export { AIGuidanceOrchestrator, aiGuidanceOrchestrator };
export type { 
  GuidanceGenerationRequest,
  UserContext,
  GuidanceOptions,
  UnifiedGuidanceResponse,
  FrameworkMapping,
  GuidanceAnalytics
} from './AIGuidanceOrchestrator';

// Template management service
export { TemplateManager } from './TemplateManager';
export type {
  UnifiedGuidanceTemplate,
  TemplateCreateRequest,
  TemplateUpdateRequest,
  FrameworkMapping as TemplateFrameworkMapping,
  TemplateSearchOptions,
  MigrationResult
} from './TemplateManager';

// Content caching service
export { ContentCacheManager } from './ContentCacheManager';
export type {
  CacheEntry,
  CacheRequest,
  CacheStatistics,
  CacheWarmingStrategy,
  FrameworkCombination
} from './ContentCacheManager';

// Quality validation service
export { QualityValidator } from './QualityValidator';
export type {
  QualityAssessmentRequest,
  QualityMetrics,
  ContentValidationResult,
  ValidationIssue,
  QualityTrendData
} from './QualityValidator';

// Gemini content generator (re-export for convenience)
export { GeminiContentGenerator, geminiContentGenerator } from './GeminiContentGenerator';
export type {
  ContentGenerationRequest,
  ContentGenerationResponse,
  GenerationContext,
  QualityLevel,
  ContentType,
  ContentQualityMetrics,
  ResponseMetadata,
  TokenUsage,
  CostEstimate
} from './GeminiContentGenerator';

// Utility functions and constants
export const AI_SERVICES_VERSION = '1.0.0';
export const SUPPORTED_FRAMEWORKS = [
  'ISO 27001',
  'CIS Controls',
  'NIST',
  'GDPR',
  'NIS2',
  'SOX',
  'HIPAA',
  'PCI DSS'
] as const;

export const QUALITY_LEVELS = [
  'standard',
  'professional', 
  'executive',
  'ciso-grade'
] as const;

export const CONTENT_TYPES = [
  'foundation',
  'implementation',
  'tools',
  'evidence',
  'enhancement',
  'validation',
  'summary'
] as const;

/**
 * Initialize AI services for an organization
 */
export async function initializeAIServices(organizationId?: string): Promise<{
  orchestrator: typeof aiGuidanceOrchestrator;
  systemHealth: any;
  migrationStatus?: any;
}> {
  const orchestrator = aiGuidanceOrchestrator;
  
  // Check system health
  const systemHealth = await orchestrator.getSystemHealth();
  
  let migrationStatus;
  if (organizationId) {
    // Run migration if needed
    try {
      migrationStatus = await orchestrator.migrateFromExistingService();
    } catch (error) {
      console.warn('Migration check failed:', error);
    }
  }
  
  return {
    orchestrator,
    systemHealth,
    migrationStatus
  };
}

/**
 * Get AI services configuration and status
 */
export async function getAIServicesStatus(): Promise<{
  version: string;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'critical';
    lastCheck: string;
  }>;
  configuration: {
    geminiConfigured: boolean;
    databaseConnected: boolean;
    cachingEnabled: boolean;
  };
}> {
  try {
    const orchestrator = aiGuidanceOrchestrator;
    const geminiGenerator = geminiContentGenerator;
    
    const [systemHealth, geminiConfig] = await Promise.all([
      orchestrator.getSystemHealth(),
      Promise.resolve(geminiGenerator.validateConfiguration())
    ]);
    
    return {
      version: AI_SERVICES_VERSION,
      services: [
        {
          name: 'AI Guidance Orchestrator',
          status: systemHealth.status,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Gemini Content Generator', 
          status: geminiConfig.valid ? 'healthy' : 'critical',
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Template Manager',
          status: 'healthy', // Would need actual health check
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Content Cache Manager',
          status: 'healthy', // Would need actual health check
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Quality Validator',
          status: 'healthy', // Would need actual health check
          lastCheck: new Date().toISOString()
        }
      ],
      configuration: {
        geminiConfigured: geminiConfig.valid,
        databaseConnected: systemHealth.issues.length === 0,
        cachingEnabled: true
      }
    };
  } catch (error) {
    console.error('Error getting AI services status:', error);
    return {
      version: AI_SERVICES_VERSION,
      services: [],
      configuration: {
        geminiConfigured: false,
        databaseConnected: false,
        cachingEnabled: false
      }
    };
  }
}