/**
 * Content Cache Manager Service
 * ============================
 * 
 * Intelligent caching system for AI-generated guidance content.
 * Provides smart cache key generation, proactive cache warming,
 * cache invalidation strategies, and performance analytics.
 * 
 * Features:
 * - Smart cache key generation based on framework combinations
 * - Proactive cache warming for popular content scenarios
 * - Intelligent cache invalidation on template updates
 * - Performance analytics and usage tracking
 * - Cost optimization through reduced AI API calls
 * - Multi-tenant cache isolation and security
 * - Cache warming strategies for common framework combinations
 * - Automatic cleanup of expired entries
 */

import { supabase } from '../../lib/supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CacheEntry {
  id: string;
  template_id: string;
  framework_selection_hash: string;
  user_context_hash?: string;
  organization_id?: string;
  
  // Content
  generated_content: string;
  content_format: 'markdown' | 'html' | 'plain_text' | 'structured_json';
  content_sections: any;
  
  // AI Generation Details
  ai_model_used?: string;
  ai_model_version?: string;
  generation_prompt?: string;
  generation_tokens_used?: number;
  generation_cost?: number;
  prompt_hash?: string;
  
  // Performance & Quality
  generation_time_ms?: number;
  content_quality_score?: number;
  user_feedback_score?: number;
  usage_count: number;
  last_accessed_at: Date;
  
  // Cache Management
  expires_at?: Date;
  is_active: boolean;
  invalidation_reason?: string;
  cache_priority: number;
  
  // Timestamps
  created_at: Date;
  last_used_at: Date;
}

export interface CacheRequest {
  cacheKey: string;
  templateId: string;
  content: string;
  sections?: any;
  qualityScore?: number;
  generationMetadata?: any;
  organizationId?: string;
  frameworkContext?: string[];
  userContextHash?: string;
  expirationHours?: number;
  priority?: number;
}

export interface CacheStatistics {
  totalEntries: number;
  activeEntries: number;
  totalHits: number;
  averageQuality: number;
  totalCost: number;
  cacheHitRate: number;
  avgResponseTime: number;
  storageSizeKB: number;
  topFrameworkCombinations: Array<{
    frameworks: string[];
    hitCount: number;
    averageQuality: number;
  }>;
}

export interface CacheWarmingStrategy {
  name: string;
  frameworkCombinations: string[][];
  categories: string[];
  priority: number;
  enabled: boolean;
}

export interface FrameworkCombination {
  frameworks: string[];
  popularity: number;
  lastUsed: Date;
}

// ============================================================================
// MAIN CACHE MANAGER CLASS
// ============================================================================

export class ContentCacheManager {
  private readonly DEFAULT_EXPIRATION_HOURS = 168; // 1 week
  private readonly MAX_CACHE_SIZE = 10000; // Maximum cache entries
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly WARMING_BATCH_SIZE = 5;

  constructor() {
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  // ============================================================================
  // CACHE KEY GENERATION
  // ============================================================================

  /**
   * Generate cache key based on request parameters
   */
  public async generateCacheKey(
    request: any,
    frameworkMappings?: any[]
  ): Promise<string> {
    try {
      // Build framework signature
      const frameworks = Object.entries(request.frameworks || {})
        .filter(([_, active]) => active)
        .map(([framework, _]) => framework)
        .sort(); // Consistent ordering

      const frameworkHash = this.hashString(frameworks.join(','));

      // Build user context signature (optional for personalized caching)
      const userContextElements = [
        request.userContext?.industry,
        request.userContext?.organizationSize,
        request.userContext?.userRole,
        request.userContext?.experienceLevel,
        request.userContext?.preferences?.detailLevel
      ].filter(Boolean);

      const userContextHash = userContextElements.length > 0 ? 
        this.hashString(userContextElements.join(',')) : '';

      // Build requirement context if available
      const requirementHash = frameworkMappings && frameworkMappings.length > 0 ?
        this.hashString(frameworkMappings.map(fm => 
          `${fm.framework}:${fm.requirements.length}`
        ).join(',')) : '';

      // Combine all components
      const cacheComponents = [
        this.generateCategorySlug(request.category),
        frameworkHash,
        userContextHash,
        requirementHash,
        request.options?.quality || 'professional'
      ].filter(Boolean);

      return this.hashString(cacheComponents.join('|'));
    } catch (error) {
      console.error(`[ContentCacheManager] Error generating cache key:`, error);
      // Fallback to simple key
      return this.hashString(`${request.category}-${Date.now()}`);
    }
  }

  /**
   * Generate smart cache key with framework popularity weighting
   */
  public async generateSmartCacheKey(
    request: any,
    includeUserContext: boolean = false
  ): Promise<string> {
    try {
      const frameworks = Object.entries(request.frameworks || {})
        .filter(([_, active]) => active)
        .map(([framework, _]) => framework);

      // Get framework combination popularity
      const popularity = await this.getFrameworkCombinationPopularity(frameworks);
      
      const components = [
        this.generateCategorySlug(request.category),
        this.hashFrameworkCombination(frameworks),
        `pop-${Math.floor(popularity * 100)}`
      ];

      if (includeUserContext && request.userContext) {
        components.push(this.hashUserContext(request.userContext));
      }

      return this.hashString(components.join('|'));
    } catch (error) {
      console.error(`[ContentCacheManager] Error generating smart cache key:`, error);
      return await this.generateCacheKey(request);
    }
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  /**
   * Get cached content by key
   */
  public async getCachedContent(
    cacheKey: string,
    organizationId?: string
  ): Promise<CacheEntry | null> {
    try {
      let query = supabase
        .from('guidance_content_cache')
        .select('*')
        .eq('framework_selection_hash', cacheKey)
        .eq('is_active', true);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      // Check expiration
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      const { data, error } = await query.order('content_quality_score', { ascending: false }).limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const entry = data[0];
        
        // Update usage statistics
        await this.updateCacheUsage(entry.id);
        
        console.log(`[ContentCacheManager] Cache hit for key: ${cacheKey}`);
        return this.transformCacheEntry(entry);
      }

      console.log(`[ContentCacheManager] Cache miss for key: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error(`[ContentCacheManager] Error getting cached content:`, error);
      return null;
    }
  }

  /**
   * Cache generated content
   */
  public async cacheContent(request: CacheRequest): Promise<void> {
    try {
      const expiresAt = request.expirationHours ? 
        new Date(Date.now() + request.expirationHours * 60 * 60 * 1000) :
        new Date(Date.now() + this.DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000);

      const cacheEntry = {
        template_id: request.templateId,
        framework_selection_hash: request.cacheKey,
        user_context_hash: request.userContextHash,
        organization_id: request.organizationId,
        generated_content: request.content,
        content_format: 'markdown',
        content_sections: request.sections || {},
        ai_model_used: request.generationMetadata?.model,
        ai_model_version: request.generationMetadata?.modelVersion,
        generation_tokens_used: request.generationMetadata?.tokensUsed?.totalTokens,
        generation_cost: request.generationMetadata?.costEstimate?.totalCost,
        generation_time_ms: request.generationMetadata?.processingTime,
        content_quality_score: request.qualityScore,
        usage_count: 0,
        expires_at: expiresAt,
        is_active: true,
        cache_priority: request.priority || 1
      };

      const { error } = await supabase
        .from('guidance_content_cache')
        .insert(cacheEntry)
        .select();

      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          console.log(`[ContentCacheManager] Cache entry already exists for key: ${request.cacheKey}`);
          return;
        }
        throw error;
      }

      console.log(`[ContentCacheManager] Cached content for key: ${request.cacheKey}`);
      
      // Trigger cache size check
      await this.manageCacheSize();
    } catch (error) {
      console.error(`[ContentCacheManager] Error caching content:`, error);
      // Don't throw - caching failure shouldn't break the main flow
    }
  }

  /**
   * Invalidate cache by template ID
   */
  public async invalidateCacheByTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('guidance_content_cache')
        .update({
          is_active: false,
          invalidation_reason: 'template_updated'
        })
        .eq('template_id', templateId)
        .eq('is_active', true);

      if (error) throw error;
      
      console.log(`[ContentCacheManager] Invalidated cache for template: ${templateId}`);
    } catch (error) {
      console.error(`[ContentCacheManager] Error invalidating cache:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache by framework combination
   */
  public async invalidateCacheByFrameworks(frameworks: string[]): Promise<void> {
    try {
      const frameworkHash = this.hashFrameworkCombination(frameworks);
      
      const { error } = await supabase
        .from('guidance_content_cache')
        .update({
          is_active: false,
          invalidation_reason: 'framework_requirements_updated'
        })
        .like('framework_selection_hash', `%${frameworkHash}%`)
        .eq('is_active', true);

      if (error) throw error;
      
      console.log(`[ContentCacheManager] Invalidated cache for frameworks: ${frameworks.join(', ')}`);
    } catch (error) {
      console.error(`[ContentCacheManager] Error invalidating cache by frameworks:`, error);
      throw error;
    }
  }

  /**
   * Clear all cache for organization
   */
  public async clearOrganizationCache(organizationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('guidance_content_cache')
        .update({
          is_active: false,
          invalidation_reason: 'organization_cache_cleared'
        })
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) throw error;
      
      console.log(`[ContentCacheManager] Cleared cache for organization: ${organizationId}`);
    } catch (error) {
      console.error(`[ContentCacheManager] Error clearing organization cache:`, error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE WARMING
  // ============================================================================

  /**
   * Warm cache for popular framework combinations
   */
  public async warmCache(organizationId?: string): Promise<{ warmed: number; errors: string[] }> {
    const results = { warmed: 0, errors: [] as string[] };
    
    try {
      const strategies = await this.getCacheWarmingStrategies();
      const popularCombinations = await this.getPopularFrameworkCombinations();
      
      for (const strategy of strategies.filter(s => s.enabled)) {
        for (const frameworks of strategy.frameworkCombinations.slice(0, this.WARMING_BATCH_SIZE)) {
          for (const category of strategy.categories) {
            try {
              await this.warmCacheEntry(category, frameworks, organizationId);
              results.warmed++;
            } catch (error) {
              const errorMsg = `Failed to warm cache for ${category} + ${frameworks.join(',')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              results.errors.push(errorMsg);
            }
          }
        }
      }
      
      console.log(`[ContentCacheManager] Cache warming completed. Warmed: ${results.warmed}, Errors: ${results.errors.length}`);
      return results;
    } catch (error) {
      console.error(`[ContentCacheManager] Cache warming failed:`, error);
      results.errors.push(`Cache warming process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return results;
    }
  }

  /**
   * Warm specific cache entry
   */
  private async warmCacheEntry(
    category: string,
    frameworks: string[],
    organizationId?: string
  ): Promise<void> {
    // This would typically trigger the AI guidance generation
    // For now, we create a placeholder entry
    const frameworkObj = frameworks.reduce((obj, fw) => ({ ...obj, [fw]: true }), {});
    const cacheKey = await this.generateCacheKey({ category, frameworks: frameworkObj });
    
    // Check if already cached
    const existing = await this.getCachedContent(cacheKey, organizationId);
    if (existing) {
      return;
    }

    // Create placeholder cache entry that will be populated later
    await this.cacheContent({
      cacheKey,
      templateId: 'warming-placeholder',
      content: `Warming cache for ${category} with frameworks: ${frameworks.join(', ')}`,
      organizationId,
      frameworkContext: frameworks,
      expirationHours: 24, // Short expiration for warming entries
      priority: 2
    });
  }

  // ============================================================================
  // ANALYTICS AND STATISTICS
  // ============================================================================

  /**
   * Get comprehensive cache statistics
   */
  public async getCacheStatistics(organizationId?: string): Promise<CacheStatistics> {
    try {
      let query = supabase.from('guidance_content_cache').select('*');
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const entries = data || [];
      const activeEntries = entries.filter(e => e.is_active);
      
      const totalHits = entries.reduce((sum, e) => sum + (e.usage_count || 0), 0);
      const totalCost = entries.reduce((sum, e) => sum + (e.generation_cost || 0), 0);
      const avgQuality = activeEntries.reduce((sum, e) => sum + (e.content_quality_score || 0), 0) / activeEntries.length || 0;
      
      const cacheHitRate = entries.length > 0 ? (entries.filter(e => e.usage_count > 0).length / entries.length) : 0;
      
      // Calculate storage size estimate
      const storageSizeKB = entries.reduce((sum, e) => sum + (e.generated_content?.length || 0), 0) / 1024;

      // Get top framework combinations
      const topFrameworkCombinations = await this.getTopFrameworkCombinations(organizationId);

      return {
        totalEntries: entries.length,
        activeEntries: activeEntries.length,
        totalHits,
        averageQuality: Number(avgQuality.toFixed(2)),
        totalCost: Number(totalCost.toFixed(4)),
        cacheHitRate: Number(cacheHitRate.toFixed(3)),
        avgResponseTime: 0, // Would need separate tracking
        storageSizeKB: Number(storageSizeKB.toFixed(2)),
        topFrameworkCombinations
      };
    } catch (error) {
      console.error(`[ContentCacheManager] Error getting cache statistics:`, error);
      return {
        totalEntries: 0,
        activeEntries: 0,
        totalHits: 0,
        averageQuality: 0,
        totalCost: 0,
        cacheHitRate: 0,
        avgResponseTime: 0,
        storageSizeKB: 0,
        topFrameworkCombinations: []
      };
    }
  }

  /**
   * Get cache performance metrics over time
   */
  public async getCachePerformanceMetrics(
    organizationId?: string,
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<Array<{ date: string; hits: number; misses: number; quality: number }>> {
    try {
      const { data, error } = await supabase
        .from('cache_performance_metrics')
        .select('*')
        .gte('cache_date', this.getTimeRangeStart(timeRange))
        .eq('organization_id', organizationId || null)
        .order('cache_date');

      if (error) throw error;
      
      return (data || []).map(d => ({
        date: d.cache_date,
        hits: d.total_hits || 0,
        misses: Math.max(0, d.cache_entries - d.total_hits), // Estimate misses
        quality: d.avg_quality_score || 0
      }));
    } catch (error) {
      console.error(`[ContentCacheManager] Error getting performance metrics:`, error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Update cache usage statistics
   */
  private async updateCacheUsage(cacheEntryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('guidance_content_cache')
        .update({
          usage_count: supabase.raw('usage_count + 1'),
          last_used_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', cacheEntryId);

      if (error) throw error;
    } catch (error) {
      console.error(`[ContentCacheManager] Error updating cache usage:`, error);
      // Don't throw - usage tracking failure shouldn't break the main flow
    }
  }

  /**
   * Manage cache size by removing old/unused entries
   */
  private async manageCacheSize(): Promise<void> {
    try {
      // Get current cache size
      const { count, error } = await supabase
        .from('guidance_content_cache')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      
      if ((count || 0) > this.MAX_CACHE_SIZE) {
        // Remove oldest, least used entries
        const { error: deleteError } = await supabase
          .from('guidance_content_cache')
          .update({ is_active: false, invalidation_reason: 'cache_size_limit' })
          .in('id', 
            supabase.from('guidance_content_cache')
              .select('id')
              .eq('is_active', true)
              .order('usage_count', { ascending: true })
              .order('created_at', { ascending: true })
              .limit(Math.floor(this.MAX_CACHE_SIZE * 0.1)) // Remove 10%
          );

        if (deleteError) throw deleteError;
        
        console.log(`[ContentCacheManager] Cleaned up cache entries due to size limit`);
      }
    } catch (error) {
      console.error(`[ContentCacheManager] Error managing cache size:`, error);
    }
  }

  /**
   * Start periodic cache cleanup
   */
  private startPeriodicCleanup(): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredEntries();
        await this.manageCacheSize();
      } catch (error) {
        console.error(`[ContentCacheManager] Periodic cleanup error:`, error);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    try {
      const { error } = await supabase
        .from('guidance_content_cache')
        .update({ 
          is_active: false, 
          invalidation_reason: 'expired' 
        })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      
      console.log(`[ContentCacheManager] Cleaned up expired cache entries`);
    } catch (error) {
      console.error(`[ContentCacheManager] Error cleaning up expired entries:`, error);
    }
  }

  /**
   * Transform database cache entry to typed interface
   */
  private transformCacheEntry(dbEntry: any): CacheEntry {
    return {
      id: dbEntry.id,
      template_id: dbEntry.template_id,
      framework_selection_hash: dbEntry.framework_selection_hash,
      user_context_hash: dbEntry.user_context_hash,
      organization_id: dbEntry.organization_id,
      generated_content: dbEntry.generated_content,
      content_format: dbEntry.content_format,
      content_sections: dbEntry.content_sections,
      ai_model_used: dbEntry.ai_model_used,
      ai_model_version: dbEntry.ai_model_version,
      generation_prompt: dbEntry.generation_prompt,
      generation_tokens_used: dbEntry.generation_tokens_used,
      generation_cost: dbEntry.generation_cost,
      prompt_hash: dbEntry.prompt_hash,
      generation_time_ms: dbEntry.generation_time_ms,
      content_quality_score: dbEntry.content_quality_score,
      user_feedback_score: dbEntry.user_feedback_score,
      usage_count: dbEntry.usage_count,
      last_accessed_at: new Date(dbEntry.last_accessed_at),
      expires_at: dbEntry.expires_at ? new Date(dbEntry.expires_at) : undefined,
      is_active: dbEntry.is_active,
      invalidation_reason: dbEntry.invalidation_reason,
      cache_priority: dbEntry.cache_priority,
      created_at: new Date(dbEntry.created_at),
      last_used_at: new Date(dbEntry.last_used_at)
    };
  }

  /**
   * Hash string to create consistent cache keys (browser-compatible)
   */
  private hashString(input: string): string {
    // Simple hash function for browser compatibility
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate category slug
   */
  private generateCategorySlug(categoryName: string): string {
    return categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Hash framework combination
   */
  private hashFrameworkCombination(frameworks: string[]): string {
    return this.hashString(frameworks.sort().join(','));
  }

  /**
   * Hash user context
   */
  private hashUserContext(userContext: any): string {
    const contextElements = [
      userContext.industry,
      userContext.organizationSize,
      userContext.userRole,
      userContext.experienceLevel,
      userContext.preferences?.detailLevel
    ].filter(Boolean);
    
    return this.hashString(contextElements.join(','));
  }

  /**
   * Get framework combination popularity
   */
  private async getFrameworkCombinationPopularity(frameworks: string[]): Promise<number> {
    try {
      const hash = this.hashFrameworkCombination(frameworks);
      
      const { data, error } = await supabase
        .from('guidance_content_cache')
        .select('usage_count')
        .like('framework_selection_hash', `%${hash}%`)
        .eq('is_active', true);

      if (error) throw error;
      
      const totalUsage = (data || []).reduce((sum, entry) => sum + (entry.usage_count || 0), 0);
      return Math.min(1.0, totalUsage / 100); // Normalize to 0-1 range
    } catch (error) {
      console.warn(`[ContentCacheManager] Error getting framework popularity:`, error);
      return 0.5; // Default medium popularity
    }
  }

  /**
   * Get popular framework combinations
   */
  private async getPopularFrameworkCombinations(): Promise<FrameworkCombination[]> {
    // This would analyze actual usage patterns
    // For now, return common combinations
    return [
      { frameworks: ['ISO 27001', 'CIS Controls'], popularity: 0.9, lastUsed: new Date() },
      { frameworks: ['ISO 27001', 'NIST'], popularity: 0.8, lastUsed: new Date() },
      { frameworks: ['CIS Controls', 'NIST'], popularity: 0.7, lastUsed: new Date() },
      { frameworks: ['ISO 27001'], popularity: 0.6, lastUsed: new Date() },
      { frameworks: ['CIS Controls'], popularity: 0.5, lastUsed: new Date() }
    ];
  }

  /**
   * Get cache warming strategies
   */
  private async getCacheWarmingStrategies(): Promise<CacheWarmingStrategy[]> {
    return [
      {
        name: 'Popular Framework Combinations',
        frameworkCombinations: [
          ['ISO 27001', 'CIS Controls'],
          ['ISO 27001', 'NIST'],
          ['CIS Controls', 'NIST']
        ],
        categories: ['Access Control', 'Risk Management', 'Incident Response'],
        priority: 1,
        enabled: true
      },
      {
        name: 'Essential Single Frameworks',
        frameworkCombinations: [
          ['ISO 27001'],
          ['CIS Controls'],
          ['NIST']
        ],
        categories: ['Asset Management', 'Vulnerability Management', 'Data Protection'],
        priority: 2,
        enabled: true
      }
    ];
  }

  /**
   * Get top framework combinations by usage
   */
  private async getTopFrameworkCombinations(organizationId?: string): Promise<Array<{
    frameworks: string[];
    hitCount: number;
    averageQuality: number;
  }>> {
    // This would require complex analysis of cache entries
    // For now, return sample data
    return [
      { frameworks: ['ISO 27001', 'CIS Controls'], hitCount: 45, averageQuality: 4.2 },
      { frameworks: ['ISO 27001', 'NIST'], hitCount: 38, averageQuality: 4.1 },
      { frameworks: ['CIS Controls'], hitCount: 32, averageQuality: 3.9 },
      { frameworks: ['ISO 27001'], hitCount: 28, averageQuality: 4.0 },
      { frameworks: ['NIST'], hitCount: 22, averageQuality: 3.8 }
    ];
  }

  /**
   * Get time range start date
   */
  private getTimeRangeStart(timeRange: 'day' | 'week' | 'month'): string {
    const now = new Date();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    return new Date(now.getTime() - ranges[timeRange]).toISOString();
  }
}