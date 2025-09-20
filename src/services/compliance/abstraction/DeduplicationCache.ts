/**
 * DeduplicationCache.ts
 * Intelligent caching system for expensive deduplication operations
 * Optimizes performance through strategic caching and background processing
 */

import { ProcessedRequirement, SimilarityResult, ClusterInfo } from './types';
import { DuplicationAnalysisResult } from './DuplicationAnalyzer';
import { QualityAssessmentResult } from './MergeQualityAssessor';

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  access_count: number;
  last_accessed: Date;
  size_estimate: number; // Estimated memory size in bytes
  cache_level: 'L1' | 'L2' | 'PERSISTENT';
  invalidation_triggers: string[];
}

export interface CacheConfig {
  max_memory_mb: number; // Maximum cache memory in MB
  default_ttl_ms: number; // Default TTL in milliseconds
  l1_cache_size: number; // Number of entries in L1 cache
  l2_cache_size: number; // Number of entries in L2 cache
  enable_persistent_cache: boolean;
  cache_warming_enabled: boolean;
  cleanup_interval_ms: number;
  compression_enabled: boolean;
  performance_monitoring: boolean;
}

export interface CacheStats {
  total_entries: number;
  l1_entries: number;
  l2_entries: number;
  persistent_entries: number;
  total_memory_mb: number;
  hit_rate: number;
  miss_rate: number;
  eviction_count: number;
  cleanup_count: number;
  compression_ratio: number;
  average_access_time_ms: number;
  cache_effectiveness_score: number;
}

export interface CacheOperation {
  operation_type: 'GET' | 'SET' | 'DELETE' | 'INVALIDATE' | 'CLEANUP' | 'WARM';
  key: string;
  timestamp: Date;
  success: boolean;
  processing_time_ms: number;
  cache_level: 'L1' | 'L2' | 'PERSISTENT' | 'MISS';
  data_size_bytes?: number;
}

export interface CacheInvalidationRule {
  trigger_pattern: string; // Regex pattern for keys that trigger invalidation
  dependent_patterns: string[]; // Patterns of keys to invalidate
  cascade_invalidation: boolean;
  description: string;
}

export class DeduplicationCache {
  private l1Cache: Map<string, CacheEntry<any>>;
  private l2Cache: Map<string, CacheEntry<any>>;
  private persistentCache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;
  private stats: CacheStats;
  private operations: CacheOperation[];
  private invalidationRules: CacheInvalidationRule[];
  private cleanupTimer?: NodeJS.Timeout;
  private warmupQueue: string[];

  constructor(config?: Partial<CacheConfig>) {
    this.config = this.mergeWithDefaults(config || {});
    this.l1Cache = new Map();
    this.l2Cache = new Map();
    this.persistentCache = new Map();
    this.operations = [];
    this.warmupQueue = [];
    
    this.initializeStats();
    this.initializeInvalidationRules();
    this.startCleanupTimer();
    
    console.log('DeduplicationCache initialized with config:', this.config);
  }

  /**
   * Get cached data by key with intelligent cache level management
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    let result: T | null = null;
    let cacheLevel: 'L1' | 'L2' | 'PERSISTENT' | 'MISS' = 'MISS';

    try {
      // Check L1 cache first (fastest)
      let entry = this.l1Cache.get(key);
      if (entry && this.isEntryValid(entry)) {
        result = entry.data;
        cacheLevel = 'L1';
        this.updateEntryAccess(entry);
        this.recordOperation('GET', key, true, performance.now() - startTime, cacheLevel, this.estimateSize(result));
        return result;
      }

      // Check L2 cache
      entry = this.l2Cache.get(key);
      if (entry && this.isEntryValid(entry)) {
        result = entry.data;
        cacheLevel = 'L2';
        this.updateEntryAccess(entry);
        
        // Promote to L1 if frequently accessed
        if (entry.access_count > 3) {
          await this.promoteToL1(key, entry);
        }
        
        this.recordOperation('GET', key, true, performance.now() - startTime, cacheLevel, this.estimateSize(result));
        return result;
      }

      // Check persistent cache
      if (this.config.enable_persistent_cache) {
        entry = this.persistentCache.get(key);
        if (entry && this.isEntryValid(entry)) {
          result = entry.data;
          cacheLevel = 'PERSISTENT';
          this.updateEntryAccess(entry);
          
          // Promote to L2 for faster future access
          if (entry.access_count > 1) {
            await this.promoteToL2(key, entry);
          }
          
          this.recordOperation('GET', key, true, performance.now() - startTime, cacheLevel, this.estimateSize(result));
          return result;
        }
      }

      // Cache miss
      this.recordOperation('GET', key, false, performance.now() - startTime, 'MISS');
      this.stats.miss_rate = this.calculateMissRate();
      
      return null;

    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      this.recordOperation('GET', key, false, performance.now() - startTime, 'MISS');
      return null;
    }
  }

  /**
   * Set data in cache with intelligent placement strategy
   */
  async set<T>(key: string, data: T, ttl?: number, cacheLevel?: 'L1' | 'L2' | 'PERSISTENT'): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const entryTtl = ttl || this.config.default_ttl_ms;
      const dataSize = this.estimateSize(data);
      
      // Determine optimal cache level if not specified
      if (!cacheLevel) {
        cacheLevel = this.determineOptimalCacheLevel(key, dataSize, entryTtl);
      }

      const entry: CacheEntry<T> = {
        key: key,
        data: data,
        timestamp: new Date(),
        ttl: entryTtl,
        access_count: 0,
        last_accessed: new Date(),
        size_estimate: dataSize,
        cache_level: cacheLevel,
        invalidation_triggers: this.generateInvalidationTriggers(key)
      };

      // Set in appropriate cache level
      const success = await this.setInCacheLevel(key, entry, cacheLevel);
      
      if (success) {
        this.updateStats();
        this.recordOperation('SET', key, true, performance.now() - startTime, cacheLevel, dataSize);
        
        // Trigger cache warming for related keys
        if (this.config.cache_warming_enabled) {
          this.scheduleWarmup(key);
        }
      }

      return success;

    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
      this.recordOperation('SET', key, false, performance.now() - startTime, 'L1');
      return false;
    }
  }

  /**
   * Delete entry from all cache levels
   */
  async delete(key: string): Promise<boolean> {
    const startTime = performance.now();
    let deleted = false;

    try {
      // Remove from all cache levels
      if (this.l1Cache.has(key)) {
        this.l1Cache.delete(key);
        deleted = true;
      }
      
      if (this.l2Cache.has(key)) {
        this.l2Cache.delete(key);
        deleted = true;
      }
      
      if (this.persistentCache.has(key)) {
        this.persistentCache.delete(key);
        deleted = true;
      }

      if (deleted) {
        this.updateStats();
        this.recordOperation('DELETE', key, true, performance.now() - startTime, 'L1');
      }

      return deleted;

    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error);
      this.recordOperation('DELETE', key, false, performance.now() - startTime, 'L1');
      return false;
    }
  }

  /**
   * Invalidate cache entries based on patterns
   */
  async invalidate(pattern: string): Promise<number> {
    const startTime = performance.now();
    let invalidatedCount = 0;

    try {
      const regex = new RegExp(pattern);
      
      // Invalidate matching entries in all cache levels
      const allCaches = [
        { cache: this.l1Cache, level: 'L1' as const },
        { cache: this.l2Cache, level: 'L2' as const },
        { cache: this.persistentCache, level: 'PERSISTENT' as const }
      ];

      for (const { cache, level } of allCaches) {
        const keysToDelete: string[] = [];
        
        for (const [key, entry] of cache) {
          if (regex.test(key)) {
            keysToDelete.push(key);
          }
        }
        
        for (const key of keysToDelete) {
          cache.delete(key);
          invalidatedCount++;
        }
      }

      // Apply cascading invalidation rules
      const cascadeCount = await this.applyCascadingInvalidation(pattern);
      invalidatedCount += cascadeCount;

      this.updateStats();
      this.recordOperation('INVALIDATE', pattern, true, performance.now() - startTime, 'L1');
      
      console.log(`Invalidated ${invalidatedCount} cache entries matching pattern: ${pattern}`);
      
      return invalidatedCount;

    } catch (error) {
      console.warn(`Cache invalidation error for pattern ${pattern}:`, error);
      this.recordOperation('INVALIDATE', pattern, false, performance.now() - startTime, 'L1');
      return 0;
    }
  }

  /**
   * Generate cache key for different operation types
   */
  generateCacheKey(operation: string, identifiers: string[]): string {
    const sortedIds = identifiers.sort();
    const hash = this.simpleHash(sortedIds.join('_'));
    return `${operation}_${hash}_${sortedIds.length}`;
  }

  /**
   * Cache similarity matrix results
   */
  async cacheSimilarityMatrix(
    requirementIds: string[],
    matrix: SimilarityResult[][],
    ttl?: number
  ): Promise<boolean> {
    const key = this.generateCacheKey('similarity_matrix', requirementIds);
    return this.set(key, matrix, ttl, 'L2');
  }

  /**
   * Get cached similarity matrix
   */
  async getCachedSimilarityMatrix(requirementIds: string[]): Promise<SimilarityResult[][] | null> {
    const key = this.generateCacheKey('similarity_matrix', requirementIds);
    return this.get<SimilarityResult[][]>(key);
  }

  /**
   * Cache cluster analysis results
   */
  async cacheClusterAnalysis(
    requirementIds: string[],
    clusters: ClusterInfo[],
    ttl?: number
  ): Promise<boolean> {
    const key = this.generateCacheKey('cluster_analysis', requirementIds);
    return this.set(key, clusters, ttl, 'L2');
  }

  /**
   * Get cached cluster analysis
   */
  async getCachedClusterAnalysis(requirementIds: string[]): Promise<ClusterInfo[] | null> {
    const key = this.generateCacheKey('cluster_analysis', requirementIds);
    return this.get<ClusterInfo[]>(key);
  }

  /**
   * Cache duplication analysis results
   */
  async cacheDuplicationAnalysis(
    requirementIds: string[],
    analysis: DuplicationAnalysisResult,
    ttl?: number
  ): Promise<boolean> {
    const key = this.generateCacheKey('duplication_analysis', requirementIds);
    return this.set(key, analysis, ttl, 'PERSISTENT');
  }

  /**
   * Get cached duplication analysis
   */
  async getCachedDuplicationAnalysis(requirementIds: string[]): Promise<DuplicationAnalysisResult | null> {
    const key = this.generateCacheKey('duplication_analysis', requirementIds);
    return this.get<DuplicationAnalysisResult>(key);
  }

  /**
   * Cache quality assessment results
   */
  async cacheQualityAssessment(
    requirementIds: string[],
    assessment: QualityAssessmentResult,
    ttl?: number
  ): Promise<boolean> {
    const key = this.generateCacheKey('quality_assessment', requirementIds);
    return this.set(key, assessment, ttl, 'L1');
  }

  /**
   * Get cached quality assessment
   */
  async getCachedQualityAssessment(requirementIds: string[]): Promise<QualityAssessmentResult | null> {
    const key = this.generateCacheKey('quality_assessment', requirementIds);
    return this.get<QualityAssessmentResult>(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Clear all cache levels
   */
  async clearAll(): Promise<void> {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.persistentCache.clear();
    this.operations = [];
    this.initializeStats();
    console.log('All cache levels cleared');
  }

  /**
   * Perform cache optimization
   */
  async optimize(): Promise<CacheOptimizationResult> {
    const startTime = performance.now();
    let optimizationActions: string[] = [];

    try {
      // Remove expired entries
      const expiredCount = await this.removeExpiredEntries();
      if (expiredCount > 0) {
        optimizationActions.push(`Removed ${expiredCount} expired entries`);
      }

      // Optimize cache level distribution
      const redistributedCount = await this.optimizeCacheDistribution();
      if (redistributedCount > 0) {
        optimizationActions.push(`Redistributed ${redistributedCount} entries`);
      }

      // Compress large entries if enabled
      if (this.config.compression_enabled) {
        const compressedCount = await this.compressLargeEntries();
        if (compressedCount > 0) {
          optimizationActions.push(`Compressed ${compressedCount} large entries`);
        }
      }

      // Update cache effectiveness metrics
      this.updateCacheEffectiveness();

      const processingTime = performance.now() - startTime;
      
      console.log(`Cache optimization completed in ${processingTime.toFixed(2)}ms:`, optimizationActions);

      return {
        success: true,
        actions_performed: optimizationActions,
        processing_time_ms: processingTime,
        memory_saved_mb: this.calculateMemorySaved(),
        effectiveness_improvement: this.calculateEffectivenessImprovement()
      };

    } catch (error) {
      console.error('Cache optimization failed:', error);
      return {
        success: false,
        actions_performed: [],
        processing_time_ms: performance.now() - startTime,
        memory_saved_mb: 0,
        effectiveness_improvement: 0
      };
    }
  }

  /**
   * Start background cache warming for related operations
   */
  async startCacheWarming(seedKeys: string[]): Promise<void> {
    if (!this.config.cache_warming_enabled) return;

    console.log(`Starting cache warming with ${seedKeys.length} seed keys...`);
    
    // Add seed keys to warmup queue
    this.warmupQueue.push(...seedKeys);
    
    // Process warmup queue in background
    this.processWarmupQueue();
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    this.clearAll();
    console.log('DeduplicationCache destroyed');
  }

  /**
   * Private helper methods
   */
  private mergeWithDefaults(config: Partial<CacheConfig>): CacheConfig {
    return {
      max_memory_mb: config.max_memory_mb || 100,
      default_ttl_ms: config.default_ttl_ms || 3600000, // 1 hour
      l1_cache_size: config.l1_cache_size || 100,
      l2_cache_size: config.l2_cache_size || 500,
      enable_persistent_cache: config.enable_persistent_cache !== undefined ? config.enable_persistent_cache : true,
      cache_warming_enabled: config.cache_warming_enabled !== undefined ? config.cache_warming_enabled : true,
      cleanup_interval_ms: config.cleanup_interval_ms || 300000, // 5 minutes
      compression_enabled: config.compression_enabled !== undefined ? config.compression_enabled : false,
      performance_monitoring: config.performance_monitoring !== undefined ? config.performance_monitoring : true
    };
  }

  private initializeStats(): void {
    this.stats = {
      total_entries: 0,
      l1_entries: 0,
      l2_entries: 0,
      persistent_entries: 0,
      total_memory_mb: 0,
      hit_rate: 0,
      miss_rate: 0,
      eviction_count: 0,
      cleanup_count: 0,
      compression_ratio: 1.0,
      average_access_time_ms: 0,
      cache_effectiveness_score: 1.0
    };
  }

  private initializeInvalidationRules(): void {
    this.invalidationRules = [
      {
        trigger_pattern: 'similarity_matrix_.*',
        dependent_patterns: ['cluster_analysis_.*', 'duplication_analysis_.*'],
        cascade_invalidation: true,
        description: 'Invalidate dependent analyses when similarity matrix changes'
      },
      {
        trigger_pattern: 'requirement_update_.*',
        dependent_patterns: ['.*'],
        cascade_invalidation: true,
        description: 'Invalidate all caches when requirements are updated'
      },
      {
        trigger_pattern: 'cluster_analysis_.*',
        dependent_patterns: ['quality_assessment_.*'],
        cascade_invalidation: true,
        description: 'Invalidate quality assessments when cluster analysis changes'
      }
    ];
  }

  private isEntryValid(entry: CacheEntry<any>): boolean {
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    return age < entry.ttl;
  }

  private updateEntryAccess(entry: CacheEntry<any>): void {
    entry.access_count++;
    entry.last_accessed = new Date();
  }

  private estimateSize(data: any): number {
    try {
      // Simple size estimation based on JSON string length
      const jsonString = JSON.stringify(data);
      return jsonString.length * 2; // Estimate 2 bytes per character
    } catch {
      return 1000; // Default estimate
    }
  }

  private determineOptimalCacheLevel(key: string, dataSize: number, ttl: number): 'L1' | 'L2' | 'PERSISTENT' {
    // Frequently accessed, small data -> L1
    if (dataSize < 10000 && ttl < 600000) { // < 10KB and < 10 minutes
      return 'L1';
    }
    
    // Medium sized data with moderate TTL -> L2
    if (dataSize < 100000 && ttl < 3600000) { // < 100KB and < 1 hour
      return 'L2';
    }
    
    // Large data or long TTL -> Persistent
    return 'PERSISTENT';
  }

  private async setInCacheLevel<T>(key: string, entry: CacheEntry<T>, level: 'L1' | 'L2' | 'PERSISTENT'): Promise<boolean> {
    try {
      switch (level) {
        case 'L1':
          await this.ensureCacheSpace(this.l1Cache, this.config.l1_cache_size);
          this.l1Cache.set(key, entry);
          break;
        case 'L2':
          await this.ensureCacheSpace(this.l2Cache, this.config.l2_cache_size);
          this.l2Cache.set(key, entry);
          break;
        case 'PERSISTENT':
          // Persistent cache can grow larger but still needs memory management
          if (this.getTotalMemoryUsage() > this.config.max_memory_mb * 1024 * 1024) {
            await this.evictLeastUsedEntries(this.persistentCache, 10);
          }
          this.persistentCache.set(key, entry);
          break;
      }
      return true;
    } catch (error) {
      console.warn(`Failed to set entry in ${level} cache:`, error);
      return false;
    }
  }

  private async ensureCacheSpace(cache: Map<string, CacheEntry<any>>, maxSize: number): Promise<void> {
    if (cache.size >= maxSize) {
      await this.evictLeastUsedEntries(cache, Math.ceil(maxSize * 0.1)); // Evict 10%
    }
  }

  private async evictLeastUsedEntries(cache: Map<string, CacheEntry<any>>, count: number): Promise<void> {
    const entries = Array.from(cache.entries()).sort((a, b) => {
      // Sort by access count (ascending) and last accessed time (ascending)
      if (a[1].access_count !== b[1].access_count) {
        return a[1].access_count - b[1].access_count;
      }
      return a[1].last_accessed.getTime() - b[1].last_accessed.getTime();
    });

    const toEvict = entries.slice(0, count);
    for (const [key] of toEvict) {
      cache.delete(key);
      this.stats.eviction_count++;
    }
  }

  private async promoteToL1(key: string, entry: CacheEntry<any>): Promise<void> {
    if (this.l1Cache.size < this.config.l1_cache_size) {
      entry.cache_level = 'L1';
      this.l1Cache.set(key, entry);
      this.l2Cache.delete(key);
    }
  }

  private async promoteToL2(key: string, entry: CacheEntry<any>): Promise<void> {
    if (this.l2Cache.size < this.config.l2_cache_size) {
      entry.cache_level = 'L2';
      this.l2Cache.set(key, entry);
      this.persistentCache.delete(key);
    }
  }

  private generateInvalidationTriggers(key: string): string[] {
    // Generate patterns that would invalidate this cache entry
    const triggers: string[] = [];
    
    if (key.includes('similarity_matrix')) {
      triggers.push('requirement_update_.*');
    }
    if (key.includes('cluster_analysis')) {
      triggers.push('similarity_matrix_.*', 'requirement_update_.*');
    }
    if (key.includes('quality_assessment')) {
      triggers.push('cluster_analysis_.*', 'requirement_update_.*');
    }
    
    return triggers;
  }

  private recordOperation(
    type: 'GET' | 'SET' | 'DELETE' | 'INVALIDATE' | 'CLEANUP' | 'WARM',
    key: string,
    success: boolean,
    processingTime: number,
    cacheLevel: 'L1' | 'L2' | 'PERSISTENT' | 'MISS',
    dataSize?: number
  ): void {
    if (!this.config.performance_monitoring) return;

    const operation: CacheOperation = {
      operation_type: type,
      key: key,
      timestamp: new Date(),
      success: success,
      processing_time_ms: processingTime,
      cache_level: cacheLevel,
      data_size_bytes: dataSize
    };

    this.operations.push(operation);
    
    // Keep only recent operations (last 1000)
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-1000);
    }
  }

  private updateStats(): void {
    this.stats.l1_entries = this.l1Cache.size;
    this.stats.l2_entries = this.l2Cache.size;
    this.stats.persistent_entries = this.persistentCache.size;
    this.stats.total_entries = this.stats.l1_entries + this.stats.l2_entries + this.stats.persistent_entries;
    this.stats.total_memory_mb = this.getTotalMemoryUsage() / (1024 * 1024);
    this.stats.hit_rate = this.calculateHitRate();
    this.stats.average_access_time_ms = this.calculateAverageAccessTime();
  }

  private getTotalMemoryUsage(): number {
    let totalSize = 0;
    
    const allCaches = [this.l1Cache, this.l2Cache, this.persistentCache];
    for (const cache of allCaches) {
      for (const entry of cache.values()) {
        totalSize += entry.size_estimate;
      }
    }
    
    return totalSize;
  }

  private calculateHitRate(): number {
    const recentOps = this.operations.slice(-100); // Last 100 operations
    if (recentOps.length === 0) return 0;
    
    const getOps = recentOps.filter(op => op.operation_type === 'GET');
    if (getOps.length === 0) return 0;
    
    const hits = getOps.filter(op => op.success && op.cache_level !== 'MISS').length;
    return hits / getOps.length;
  }

  private calculateMissRate(): number {
    return 1 - this.calculateHitRate();
  }

  private calculateAverageAccessTime(): number {
    const recentOps = this.operations.slice(-100).filter(op => op.operation_type === 'GET');
    if (recentOps.length === 0) return 0;
    
    const totalTime = recentOps.reduce((sum, op) => sum + op.processing_time_ms, 0);
    return totalTime / recentOps.length;
  }

  private async applyCascadingInvalidation(triggerPattern: string): Promise<number> {
    let invalidatedCount = 0;
    
    for (const rule of this.invalidationRules) {
      if (rule.cascade_invalidation && new RegExp(rule.trigger_pattern).test(triggerPattern)) {
        for (const dependentPattern of rule.dependent_patterns) {
          const count = await this.invalidate(dependentPattern);
          invalidatedCount += count;
        }
      }
    }
    
    return invalidatedCount;
  }

  private scheduleWarmup(seedKey: string): void {
    // Generate related keys that might be accessed soon
    const relatedKeys = this.generateRelatedKeys(seedKey);
    this.warmupQueue.push(...relatedKeys);
  }

  private generateRelatedKeys(key: string): string[] {
    // Generate keys for related operations that might be accessed
    const relatedKeys: string[] = [];
    
    if (key.includes('similarity_matrix')) {
      // If similarity matrix is cached, cluster analysis might be next
      const baseId = key.replace('similarity_matrix_', '');
      relatedKeys.push(`cluster_analysis_${baseId}`);
      relatedKeys.push(`duplication_analysis_${baseId}`);
    }
    
    if (key.includes('cluster_analysis')) {
      // If cluster analysis is cached, quality assessment might be next
      const baseId = key.replace('cluster_analysis_', '');
      relatedKeys.push(`quality_assessment_${baseId}`);
    }
    
    return relatedKeys;
  }

  private async processWarmupQueue(): Promise<void> {
    // Process warmup queue in background (simplified implementation)
    while (this.warmupQueue.length > 0) {
      const key = this.warmupQueue.shift();
      if (key && !this.l1Cache.has(key) && !this.l2Cache.has(key)) {
        // In a real implementation, this would pre-compute and cache the data
        // For now, we just record the warmup attempt
        this.recordOperation('WARM', key, false, 0, 'MISS');
      }
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.performCleanup();
    }, this.config.cleanup_interval_ms);
  }

  private async performCleanup(): Promise<void> {
    const startTime = performance.now();
    let cleanedCount = 0;

    try {
      // Remove expired entries from all cache levels
      cleanedCount = await this.removeExpiredEntries();
      
      // Trim operation history
      if (this.operations.length > 1000) {
        this.operations = this.operations.slice(-500);
      }
      
      this.stats.cleanup_count++;
      const processingTime = performance.now() - startTime;
      
      if (cleanedCount > 0) {
        console.log(`Cache cleanup completed: removed ${cleanedCount} expired entries in ${processingTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  private async removeExpiredEntries(): Promise<number> {
    let removedCount = 0;
    const now = new Date();
    
    const allCaches = [
      { cache: this.l1Cache, level: 'L1' },
      { cache: this.l2Cache, level: 'L2' },
      { cache: this.persistentCache, level: 'PERSISTENT' }
    ];

    for (const { cache } of allCaches) {
      const expiredKeys: string[] = [];
      
      for (const [key, entry] of cache) {
        const age = now.getTime() - entry.timestamp.getTime();
        if (age >= entry.ttl) {
          expiredKeys.push(key);
        }
      }
      
      for (const key of expiredKeys) {
        cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.updateStats();
    }
    
    return removedCount;
  }

  private async optimizeCacheDistribution(): Promise<number> {
    let redistributedCount = 0;
    
    // Move frequently accessed L2 entries to L1
    const l2Entries = Array.from(this.l2Cache.entries())
      .sort((a, b) => b[1].access_count - a[1].access_count);
    
    for (const [key, entry] of l2Entries) {
      if (entry.access_count > 5 && this.l1Cache.size < this.config.l1_cache_size) {
        await this.promoteToL1(key, entry);
        redistributedCount++;
      }
    }
    
    return redistributedCount;
  }

  private async compressLargeEntries(): Promise<number> {
    // Placeholder for compression implementation
    // In a real implementation, this would compress large cache entries
    return 0;
  }

  private updateCacheEffectiveness(): void {
    const hitRate = this.calculateHitRate();
    const memoryEfficiency = Math.max(0, 1 - (this.getTotalMemoryUsage() / (this.config.max_memory_mb * 1024 * 1024)));
    const accessSpeed = Math.max(0, 1 - (this.calculateAverageAccessTime() / 100)); // Normalize to 100ms baseline
    
    this.stats.cache_effectiveness_score = (hitRate * 0.5) + (memoryEfficiency * 0.3) + (accessSpeed * 0.2);
  }

  private calculateMemorySaved(): number {
    // Placeholder calculation
    return this.stats.eviction_count * 0.1; // Estimate 0.1MB saved per eviction
  }

  private calculateEffectivenessImprovement(): number {
    // Placeholder calculation based on recent optimization actions
    return Math.min(0.1, this.stats.eviction_count * 0.01);
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

interface CacheOptimizationResult {
  success: boolean;
  actions_performed: string[];
  processing_time_ms: number;
  memory_saved_mb: number;
  effectiveness_improvement: number;
}