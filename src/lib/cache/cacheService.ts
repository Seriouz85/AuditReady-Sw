import { cache } from './redis';
import { analytics } from '@/lib/monitoring/analytics';

interface CacheStrategy {
  ttl?: number;
  staleWhileRevalidate?: boolean;
  tags?: string[];
  refreshThreshold?: number; // Refresh when TTL is less than this (in seconds)
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  etag?: string;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private maxMemoryEntries = 1000;
  private defaultTTL = 3600; // 1 hour

  constructor() {
    // Clean up memory cache periodically
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Every minute
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      analytics.track('cache_cleanup', {
        type: 'memory',
        cleaned_entries: cleaned,
        remaining_entries: this.memoryCache.size
      });
    }

    // If memory cache is too large, remove oldest entries
    if (this.memoryCache.size > this.maxMemoryEntries) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.memoryCache.size - this.maxMemoryEntries);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private getCacheKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  async get<T>(
    namespace: string,
    key: string,
    strategy: CacheStrategy = {}
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(namespace, key);
    const now = Date.now();

    // Try memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && (now - memoryEntry.timestamp) < memoryEntry.ttl * 1000) {
      analytics.trackPerformance({
        route: 'cache_hit',
        loadTime: 0,
        bundleSize: JSON.stringify(memoryEntry.data).length
      });
      return memoryEntry.data;
    }

    // Try Redis cache
    try {
      const redisEntry = await cache.get<CacheEntry<T>>(cacheKey);
      if (redisEntry && (now - redisEntry.timestamp) < redisEntry.ttl * 1000) {
        // Store in memory cache for faster access
        this.memoryCache.set(cacheKey, redisEntry);
        
        analytics.trackPerformance({
          route: 'cache_hit_redis',
          loadTime: 1,
          bundleSize: JSON.stringify(redisEntry.data).length
        });
        
        return redisEntry.data;
      }
    } catch (error) {
      console.warn('Redis cache error:', error);
    }

    analytics.track('cache_miss', { namespace, key });
    return null;
  }

  async set<T>(
    namespace: string,
    key: string,
    data: T,
    strategy: CacheStrategy = {}
  ): Promise<void> {
    const cacheKey = this.getCacheKey(namespace, key);
    const ttl = strategy.ttl || this.defaultTTL;
    const tags = strategy.tags || [];
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry);

    // Store in Redis
    try {
      await cache.set(cacheKey, entry, ttl);
      
      // Store tags for invalidation
      if (tags.length > 0) {
        await this.storeTags(tags, cacheKey);
      }
      
      analytics.track('cache_set', {
        namespace,
        key,
        ttl,
        size: JSON.stringify(data).length,
        tags: tags.length
      });
      
    } catch (error) {
      console.warn('Redis cache set error:', error);
    }
  }

  async delete(namespace: string, key: string): Promise<void> {
    const cacheKey = this.getCacheKey(namespace, key);
    
    // Remove from memory cache
    this.memoryCache.delete(cacheKey);
    
    // Remove from Redis
    try {
      await cache.del(cacheKey);
      analytics.track('cache_delete', { namespace, key });
    } catch (error) {
      console.warn('Redis cache delete error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    let invalidated = 0;

    try {
      // Get all cache keys with this tag
      const tagKey = `tags:${tag}`;
      const cacheKeys = await cache.get<string[]>(tagKey) || [];
      
      if (cacheKeys.length > 0) {
        // Remove from memory cache
        cacheKeys.forEach(key => {
          this.memoryCache.delete(key);
        });

        // Remove from Redis
        const pipeline = [];
        for (const key of cacheKeys) {
          pipeline.push(cache.del(key));
        }
        await Promise.all(pipeline);
        
        // Clean up tag reference
        await cache.del(tagKey);
        
        invalidated = cacheKeys.length;
        
        analytics.track('cache_invalidate_tag', {
          tag,
          invalidated_keys: invalidated
        });
      }
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }

    return invalidated;
  }

  async invalidateNamespace(namespace: string): Promise<number> {
    let invalidated = 0;

    try {
      // Pattern to match all keys in namespace
      const pattern = `${namespace}:*`;
      const deletedCount = await cache.flushPattern(pattern);
      
      // Remove from memory cache
      for (const [key] of this.memoryCache.entries()) {
        if (key.startsWith(`${namespace}:`)) {
          this.memoryCache.delete(key);
          invalidated++;
        }
      }
      
      analytics.track('cache_invalidate_namespace', {
        namespace,
        redis_deleted: deletedCount,
        memory_deleted: invalidated
      });
      
      return deletedCount + invalidated;
      
    } catch (error) {
      console.warn('Cache namespace invalidation error:', error);
      return 0;
    }
  }

  private async storeTags(tags: string[], cacheKey: string): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = `tags:${tag}`;
        const existingKeys = await cache.get<string[]>(tagKey) || [];
        
        if (!existingKeys.includes(cacheKey)) {
          existingKeys.push(cacheKey);
          await cache.set(tagKey, existingKeys, 86400); // Tags expire in 24 hours
        }
      }
    } catch (error) {
      console.warn('Error storing cache tags:', error);
    }
  }

  // Specialized methods for common cache patterns

  async getOrSet<T>(
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(namespace, key, strategy);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    await this.set(namespace, key, data, strategy);
    
    return data;
  }

  async refresh<T>(
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = {}
  ): Promise<T> {
    try {
      // Always fetch fresh data
      const data = await fetcher();
      
      // Update cache
      await this.set(namespace, key, data, strategy);
      
      return data;
      
    } catch (error) {
      // Fall back to cached data if fetch fails
      const cached = await this.get<T>(namespace, key, strategy);
      if (cached !== null) {
        analytics.track('cache_fallback', { namespace, key, error: error.message });
        return cached;
      }
      
      throw error;
    }
  }

  async mget<T>(
    namespace: string,
    keys: string[]
  ): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    const cacheKeys = keys.map(key => this.getCacheKey(namespace, key));
    
    try {
      const entries = await cache.mget<CacheEntry<T>>(cacheKeys);
      const now = Date.now();
      
      return entries.map((entry, index) => {
        if (!entry || (now - entry.timestamp) >= entry.ttl * 1000) {
          analytics.track('cache_miss', { namespace, key: keys[index] });
          return null;
        }
        
        // Store in memory cache
        this.memoryCache.set(cacheKeys[index], entry);
        
        analytics.trackPerformance({
          route: 'cache_hit_batch',
          loadTime: 1,
          bundleSize: JSON.stringify(entry.data).length
        });
        
        return entry.data;
      });
      
    } catch (error) {
      console.warn('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset<T>(
    namespace: string,
    keyValues: Record<string, T>,
    strategy: CacheStrategy = {}
  ): Promise<void> {
    const ttl = strategy.ttl || this.defaultTTL;
    const tags = strategy.tags || [];
    const now = Date.now();

    const cacheEntries: Record<string, CacheEntry<T>> = {};
    
    Object.entries(keyValues).forEach(([key, data]) => {
      const cacheKey = this.getCacheKey(namespace, key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        ttl,
        tags
      };
      
      cacheEntries[cacheKey] = entry;
      this.memoryCache.set(cacheKey, entry);
    });

    try {
      await cache.mset(cacheEntries, ttl);
      
      // Store tags
      if (tags.length > 0) {
        const cacheKeys = Object.keys(cacheEntries);
        await Promise.all(tags.map(tag => this.storeTags([tag], cacheKeys.join(','))));
      }
      
      analytics.track('cache_mset', {
        namespace,
        count: Object.keys(keyValues).length,
        ttl,
        tags: tags.length
      });
      
    } catch (error) {
      console.warn('Cache mset error:', error);
    }
  }

  // Cache warming utilities
  async warmup(entries: Array<{
    namespace: string;
    key: string;
    fetcher: () => Promise<any>;
    strategy?: CacheStrategy;
  }>): Promise<void> {
    const promises = entries.map(async ({ namespace, key, fetcher, strategy }) => {
      try {
        const data = await fetcher();
        await this.set(namespace, key, data, strategy);
      } catch (error) {
        console.warn(`Cache warmup failed for ${namespace}:${key}`, error);
      }
    });

    await Promise.all(promises);
    
    analytics.track('cache_warmup', {
      entries_count: entries.length
    });
  }

  getStats(): {
    memory: { size: number; maxSize: number };
    redis: any;
  } {
    return {
      memory: {
        size: this.memoryCache.size,
        maxSize: this.maxMemoryEntries
      },
      redis: cache.getMetrics()
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const redisHealth = await cache.healthCheck();
    const memorySize = this.memoryCache.size;
    
    const status = 
      redisHealth.status === 'unhealthy' && memorySize === 0 ? 'unhealthy' :
      redisHealth.status === 'degraded' || memorySize > this.maxMemoryEntries * 0.9 ? 'degraded' :
      'healthy';

    return {
      status,
      details: {
        redis: redisHealth,
        memory: {
          size: memorySize,
          maxSize: this.maxMemoryEntries,
          usage: (memorySize / this.maxMemoryEntries) * 100
        }
      }
    };
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache namespaces for organization
export const CacheNamespaces = {
  ORGANIZATIONS: 'orgs',
  USERS: 'users',
  ASSESSMENTS: 'assessments',
  COMPLIANCE: 'compliance',
  RISKS: 'risks',
  DOCUMENTS: 'docs',
  LMS: 'lms',
  ANALYTICS: 'analytics',
  API_RESPONSES: 'api'
} as const;

// Common cache strategies
export const CacheStrategies = {
  SHORT: { ttl: 300 }, // 5 minutes
  MEDIUM: { ttl: 1800 }, // 30 minutes  
  LONG: { ttl: 3600 }, // 1 hour
  DAILY: { ttl: 86400 }, // 24 hours
  STATIC: { ttl: 604800 }, // 1 week
} as const;

export default cacheService;