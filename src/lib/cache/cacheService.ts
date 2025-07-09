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

    // Redis not available in browser environment

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

    // Redis not available in browser environment
    analytics.track('cache_set', {
      namespace,
      key,
      ttl,
      size: JSON.stringify(data).length,
      tags: tags.length
    });
  }

  async delete(namespace: string, key: string): Promise<void> {
    const cacheKey = this.getCacheKey(namespace, key);
    
    // Remove from memory cache
    this.memoryCache.delete(cacheKey);
    
    // Redis not available in browser environment
    analytics.track('cache_delete', { namespace, key });
  }

  async invalidateByTag(tag: string): Promise<number> {
    let invalidated = 0;

    // In memory-only mode, search through memory cache for tags
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }
    
    analytics.track('cache_invalidate_tag', {
      tag,
      invalidated_keys: invalidated
    });

    return invalidated;
  }

  async invalidateNamespace(namespace: string): Promise<number> {
    let invalidated = 0;

    // Remove from memory cache
    for (const [key] of this.memoryCache.entries()) {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }
    
    analytics.track('cache_invalidate_namespace', {
      namespace,
      memory_deleted: invalidated
    });
    
    return invalidated;
  }

  private async storeTags(tags: string[], cacheKey: string): Promise<void> {
    // Tags are stored within cache entries in memory-only mode
    // No separate tag storage needed
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
    const now = Date.now();
    
    return cacheKeys.map((cacheKey, index) => {
      const entry = this.memoryCache.get(cacheKey);
      
      if (!entry || (now - entry.timestamp) >= entry.ttl * 1000) {
        analytics.track('cache_miss', { namespace, key: keys[index] });
        return null;
      }
      
      analytics.trackPerformance({
        route: 'cache_hit_batch',
        loadTime: 0,
        bundleSize: JSON.stringify(entry.data).length
      });
      
      return entry.data;
    });
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

    // Redis not available in browser environment
    analytics.track('cache_mset', {
      namespace,
      count: Object.keys(keyValues).length,
      ttl,
      tags: tags.length
    });
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
  } {
    return {
      memory: {
        size: this.memoryCache.size,
        maxSize: this.maxMemoryEntries
      }
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const memorySize = this.memoryCache.size;
    
    const status = 
      memorySize === 0 ? 'healthy' :
      memorySize > this.maxMemoryEntries * 0.9 ? 'degraded' :
      'healthy';

    return {
      status,
      details: {
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