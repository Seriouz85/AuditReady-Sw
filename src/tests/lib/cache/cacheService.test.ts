import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cacheService, CacheNamespaces, CacheStrategies } from '@/lib/cache/cacheService';
import { cache } from '@/lib/cache/redis';

// Mock Redis cache
vi.mock('@/lib/cache/redis', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    mget: vi.fn(),
    mset: vi.fn(),
    flushPattern: vi.fn(),
    getMetrics: vi.fn(() => ({
      hits: 10,
      misses: 5,
      hitRate: 66.67,
      isConnected: true
    })),
    healthCheck: vi.fn()
  }
}));

// Mock analytics
vi.mock('@/lib/monitoring/analytics', () => ({
  analytics: {
    track: vi.fn(),
    trackPerformance: vi.fn()
  }
}));

describe('CacheService', () => {
  const mockCache = cache as any;
  const testNamespace = 'test';
  const testKey = 'key1';
  const testData = { id: 1, name: 'Test Data' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear memory cache
    (cacheService as any).memoryCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get', () => {
    it('returns data from memory cache when available and fresh', async () => {
      const cacheKey = `${testNamespace}:${testKey}`;
      const cacheEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 3600,
        tags: []
      };

      // Manually set memory cache
      (cacheService as any).memoryCache.set(cacheKey, cacheEntry);

      const result = await cacheService.get(testNamespace, testKey);

      expect(result).toEqual(testData);
      expect(mockCache.get).not.toHaveBeenCalled();
    });

    it('returns data from Redis when not in memory cache', async () => {
      const cacheEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 3600,
        tags: []
      };

      mockCache.get.mockResolvedValue(cacheEntry);

      const result = await cacheService.get(testNamespace, testKey);

      expect(result).toEqual(testData);
      expect(mockCache.get).toHaveBeenCalledWith(`${testNamespace}:${testKey}`);
    });

    it('returns null when data is expired in memory cache', async () => {
      const cacheKey = `${testNamespace}:${testKey}`;
      const expiredEntry = {
        data: testData,
        timestamp: Date.now() - 4000 * 1000, // 4000 seconds ago
        ttl: 3600, // 1 hour TTL
        tags: []
      };

      (cacheService as any).memoryCache.set(cacheKey, expiredEntry);
      mockCache.get.mockResolvedValue(null);

      const result = await cacheService.get(testNamespace, testKey);

      expect(result).toBeNull();
    });

    it('returns null when data is not found in Redis', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await cacheService.get(testNamespace, testKey);

      expect(result).toBeNull();
      expect(mockCache.get).toHaveBeenCalledWith(`${testNamespace}:${testKey}`);
    });

    it('handles Redis errors gracefully', async () => {
      mockCache.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.get(testNamespace, testKey);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('stores data in both memory and Redis cache', async () => {
      const strategy = { ttl: 1800, tags: ['tag1', 'tag2'] };
      mockCache.set.mockResolvedValue(true);

      await cacheService.set(testNamespace, testKey, testData, strategy);

      const cacheKey = `${testNamespace}:${testKey}`;
      const memoryEntry = (cacheService as any).memoryCache.get(cacheKey);

      expect(memoryEntry).toBeDefined();
      expect(memoryEntry.data).toEqual(testData);
      expect(memoryEntry.ttl).toBe(1800);
      expect(memoryEntry.tags).toEqual(['tag1', 'tag2']);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('uses default TTL when not specified', async () => {
      mockCache.set.mockResolvedValue(true);

      await cacheService.set(testNamespace, testKey, testData);

      const cacheKey = `${testNamespace}:${testKey}`;
      const memoryEntry = (cacheService as any).memoryCache.get(cacheKey);

      expect(memoryEntry.ttl).toBe(3600); // Default TTL
    });

    it('handles Redis set errors gracefully', async () => {
      mockCache.set.mockRejectedValue(new Error('Redis error'));

      await expect(
        cacheService.set(testNamespace, testKey, testData)
      ).resolves.not.toThrow();

      // Should still store in memory cache
      const cacheKey = `${testNamespace}:${testKey}`;
      const memoryEntry = (cacheService as any).memoryCache.get(cacheKey);
      expect(memoryEntry).toBeDefined();
    });
  });

  describe('delete', () => {
    it('removes data from both memory and Redis cache', async () => {
      const cacheKey = `${testNamespace}:${testKey}`;
      
      // Set initial data
      (cacheService as any).memoryCache.set(cacheKey, {
        data: testData,
        timestamp: Date.now(),
        ttl: 3600,
        tags: []
      });

      mockCache.del.mockResolvedValue(true);

      await cacheService.delete(testNamespace, testKey);

      expect((cacheService as any).memoryCache.has(cacheKey)).toBe(false);
      expect(mockCache.del).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('invalidateByTag', () => {
    it('invalidates all cache entries with a specific tag', async () => {
      const taggedKeys = [`${testNamespace}:${testKey}`, `${testNamespace}:key2`];
      mockCache.get.mockResolvedValue(taggedKeys);
      mockCache.del.mockResolvedValue(true);

      const invalidated = await cacheService.invalidateByTag('tag1');

      expect(invalidated).toBe(2);
      expect(mockCache.get).toHaveBeenCalledWith('tags:tag1');
    });

    it('handles tag invalidation errors gracefully', async () => {
      mockCache.get.mockRejectedValue(new Error('Redis error'));

      const invalidated = await cacheService.invalidateByTag('tag1');

      expect(invalidated).toBe(0);
    });
  });

  describe('invalidateNamespace', () => {
    it('invalidates all cache entries in a namespace', async () => {
      const cacheKey1 = `${testNamespace}:key1`;
      const cacheKey2 = `${testNamespace}:key2`;
      
      // Set memory cache entries
      (cacheService as any).memoryCache.set(cacheKey1, { data: 'data1' });
      (cacheService as any).memoryCache.set(cacheKey2, { data: 'data2' });

      mockCache.flushPattern.mockResolvedValue(2);

      const invalidated = await cacheService.invalidateNamespace(testNamespace);

      expect(invalidated).toBe(4); // 2 from Redis + 2 from memory
      expect((cacheService as any).memoryCache.has(cacheKey1)).toBe(false);
      expect((cacheService as any).memoryCache.has(cacheKey2)).toBe(false);
    });
  });

  describe('getOrSet', () => {
    it('returns cached data when available', async () => {
      const cachedEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 3600,
        tags: []
      };

      mockCache.get.mockResolvedValue(cachedEntry);

      const fetcher = vi.fn().mockResolvedValue({ id: 2, name: 'Fresh Data' });
      
      const result = await cacheService.getOrSet(
        testNamespace,
        testKey,
        fetcher
      );

      expect(result).toEqual(testData);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('fetches and caches data when not in cache', async () => {
      const freshData = { id: 2, name: 'Fresh Data' };
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(true);

      const fetcher = vi.fn().mockResolvedValue(freshData);
      
      const result = await cacheService.getOrSet(
        testNamespace,
        testKey,
        fetcher
      );

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('fetches fresh data and updates cache', async () => {
      const freshData = { id: 2, name: 'Fresh Data' };
      mockCache.set.mockResolvedValue(true);

      const fetcher = vi.fn().mockResolvedValue(freshData);
      
      const result = await cacheService.refresh(
        testNamespace,
        testKey,
        fetcher
      );

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('falls back to cached data when fetch fails', async () => {
      const cachedEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 3600,
        tags: []
      };

      mockCache.get.mockResolvedValue(cachedEntry);

      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      
      const result = await cacheService.refresh(
        testNamespace,
        testKey,
        fetcher
      );

      expect(result).toEqual(testData);
    });

    it('throws error when fetch fails and no cached data available', async () => {
      mockCache.get.mockResolvedValue(null);

      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      
      await expect(
        cacheService.refresh(testNamespace, testKey, fetcher)
      ).rejects.toThrow('Fetch failed');
    });
  });

  describe('mget and mset', () => {
    it('retrieves multiple cache entries', async () => {
      const entries = [
        { data: testData, timestamp: Date.now(), ttl: 3600, tags: [] },
        null,
        { data: { id: 2 }, timestamp: Date.now(), ttl: 3600, tags: [] }
      ];

      mockCache.mget.mockResolvedValue(entries);

      const results = await cacheService.mget(testNamespace, ['key1', 'key2', 'key3']);

      expect(results).toEqual([testData, null, { id: 2 }]);
    });

    it('stores multiple cache entries', async () => {
      const keyValues = {
        key1: { id: 1 },
        key2: { id: 2 }
      };

      mockCache.mset.mockResolvedValue(true);

      await cacheService.mset(testNamespace, keyValues, { ttl: 1800 });

      expect(mockCache.mset).toHaveBeenCalled();
      
      // Check memory cache entries
      const memoryKey1 = (cacheService as any).memoryCache.get(`${testNamespace}:key1`);
      const memoryKey2 = (cacheService as any).memoryCache.get(`${testNamespace}:key2`);
      
      expect(memoryKey1.data).toEqual({ id: 1 });
      expect(memoryKey2.data).toEqual({ id: 2 });
    });
  });

  describe('warmup', () => {
    it('warms up cache with multiple entries', async () => {
      mockCache.set.mockResolvedValue(true);

      const entries = [
        {
          namespace: 'test1',
          key: 'key1',
          fetcher: vi.fn().mockResolvedValue({ id: 1 }),
          strategy: CacheStrategies.SHORT
        },
        {
          namespace: 'test2',
          key: 'key2',
          fetcher: vi.fn().mockResolvedValue({ id: 2 })
        }
      ];

      await cacheService.warmup(entries);

      expect(entries[0].fetcher).toHaveBeenCalled();
      expect(entries[1].fetcher).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledTimes(2);
    });

    it('handles warmup failures gracefully', async () => {
      const entries = [
        {
          namespace: 'test1',
          key: 'key1',
          fetcher: vi.fn().mockRejectedValue(new Error('Fetch failed'))
        }
      ];

      await expect(cacheService.warmup(entries)).resolves.not.toThrow();
    });
  });

  describe('memory cache cleanup', () => {
    it('cleans up expired entries from memory cache', () => {
      const now = Date.now();
      const expiredEntry = {
        data: 'expired',
        timestamp: now - 4000 * 1000, // 4000 seconds ago
        ttl: 3600, // 1 hour
        tags: []
      };
      const validEntry = {
        data: 'valid',
        timestamp: now,
        ttl: 3600,
        tags: []
      };

      (cacheService as any).memoryCache.set('expired:key', expiredEntry);
      (cacheService as any).memoryCache.set('valid:key', validEntry);

      // Trigger cleanup
      (cacheService as any).cleanupMemoryCache();

      expect((cacheService as any).memoryCache.has('expired:key')).toBe(false);
      expect((cacheService as any).memoryCache.has('valid:key')).toBe(true);
    });

    it('limits memory cache size', () => {
      const maxEntries = (cacheService as any).maxMemoryEntries;
      
      // Fill cache beyond limit
      for (let i = 0; i < maxEntries + 100; i++) {
        (cacheService as any).memoryCache.set(`key${i}`, {
          data: `data${i}`,
          timestamp: Date.now() - i * 1000, // Older entries have earlier timestamps
          ttl: 3600,
          tags: []
        });
      }

      // Trigger cleanup
      (cacheService as any).cleanupMemoryCache();

      expect((cacheService as any).memoryCache.size).toBeLessThanOrEqual(maxEntries);
    });
  });

  describe('getStats', () => {
    it('returns cache statistics', () => {
      const stats = cacheService.getStats();

      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('redis');
      expect(stats.memory).toHaveProperty('size');
      expect(stats.memory).toHaveProperty('maxSize');
      expect(stats.redis).toHaveProperty('hits');
      expect(stats.redis).toHaveProperty('misses');
    });
  });

  describe('healthCheck', () => {
    it('reports healthy status when all systems are working', async () => {
      mockCache.healthCheck.mockResolvedValue({
        status: 'healthy',
        latency: 50
      });

      const health = await cacheService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details).toHaveProperty('redis');
      expect(health.details).toHaveProperty('memory');
    });

    it('reports degraded status when Redis is degraded', async () => {
      mockCache.healthCheck.mockResolvedValue({
        status: 'degraded',
        latency: 150
      });

      const health = await cacheService.healthCheck();

      expect(health.status).toBe('degraded');
    });

    it('reports unhealthy status when Redis is down and memory cache is empty', async () => {
      mockCache.healthCheck.mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed'
      });

      const health = await cacheService.healthCheck();

      expect(health.status).toBe('unhealthy');
    });
  });

  describe('CacheNamespaces', () => {
    it('provides predefined namespaces', () => {
      expect(CacheNamespaces.ORGANIZATIONS).toBe('orgs');
      expect(CacheNamespaces.USERS).toBe('users');
      expect(CacheNamespaces.ASSESSMENTS).toBe('assessments');
      expect(CacheNamespaces.API_RESPONSES).toBe('api');
    });
  });

  describe('CacheStrategies', () => {
    it('provides predefined cache strategies', () => {
      expect(CacheStrategies.SHORT.ttl).toBe(300);
      expect(CacheStrategies.MEDIUM.ttl).toBe(1800);
      expect(CacheStrategies.LONG.ttl).toBe(3600);
      expect(CacheStrategies.DAILY.ttl).toBe(86400);
      expect(CacheStrategies.STATIC.ttl).toBe(604800);
    });
  });
});