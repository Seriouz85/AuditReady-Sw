interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class ComplianceCacheService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default
  private maxCacheSize = 100; // Maximum number of items in memory cache

  /**
   * Get item from cache
   */
  get<T>(key: string, options?: CacheOptions): T | null {
    const storage = options?.storage || 'memory';
    
    switch (storage) {
      case 'memory':
        return this.getFromMemory<T>(key);
      case 'localStorage':
        return this.getFromStorage<T>(key, localStorage);
      case 'sessionStorage':
        return this.getFromStorage<T>(key, sessionStorage);
      default:
        return null;
    }
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const storage = options?.storage || 'memory';
    const ttl = options?.ttl || this.defaultTTL;
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    switch (storage) {
      case 'memory':
        this.setInMemory(key, cacheItem);
        break;
      case 'localStorage':
        this.setInStorage(key, cacheItem, localStorage);
        break;
      case 'sessionStorage':
        this.setInStorage(key, cacheItem, sessionStorage);
        break;
    }
  }

  /**
   * Remove item from cache
   */
  remove(key: string, storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'all'): void {
    if (storage === 'all' || !storage) {
      this.memoryCache.delete(key);
      localStorage.removeItem(this.getCacheKey(key));
      sessionStorage.removeItem(this.getCacheKey(key));
    } else {
      switch (storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'localStorage':
          localStorage.removeItem(this.getCacheKey(key));
          break;
        case 'sessionStorage':
          sessionStorage.removeItem(this.getCacheKey(key));
          break;
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'all'): void {
    if (storage === 'all' || !storage) {
      this.memoryCache.clear();
      this.clearStorage(localStorage);
      this.clearStorage(sessionStorage);
    } else {
      switch (storage) {
        case 'memory':
          this.memoryCache.clear();
          break;
        case 'localStorage':
          this.clearStorage(localStorage);
          break;
        case 'sessionStorage':
          this.clearStorage(sessionStorage);
          break;
      }
    }
  }

  /**
   * Check if cache has valid item
   */
  has(key: string, storage?: 'memory' | 'localStorage' | 'sessionStorage'): boolean {
    const storageType = storage || 'memory';
    return this.get(key, { storage: storageType }) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryCacheSize: number;
    localStorageKeys: number;
    sessionStorageKeys: number;
  } {
    const localStorageKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('compliance_cache_')
    ).length;
    
    const sessionStorageKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('compliance_cache_')
    ).length;

    return {
      memoryCacheSize: this.memoryCache.size,
      localStorageKeys,
      sessionStorageKeys
    };
  }

  /**
   * Prune expired items from cache
   */
  prune(): void {
    // Prune memory cache
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.memoryCache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Prune storage caches
    this.pruneStorage(localStorage);
    this.pruneStorage(sessionStorage);
  }

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  private getFromStorage<T>(key: string, storage: Storage): T | null {
    try {
      const stored = storage.getItem(this.getCacheKey(key));
      if (!stored) return null;

      const item = JSON.parse(stored) as CacheItem<T>;
      const now = Date.now();
      
      if (now - item.timestamp > item.ttl) {
        storage.removeItem(this.getCacheKey(key));
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error reading from storage cache:', error);
      return null;
    }
  }

  private setInMemory<T>(key: string, item: CacheItem<T>): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
    
    this.memoryCache.set(key, item);
  }

  private setInStorage<T>(key: string, item: CacheItem<T>, storage: Storage): void {
    try {
      storage.setItem(this.getCacheKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Error writing to storage cache:', error);
      // If storage is full, try to clear old compliance cache items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestFromStorage(storage);
        try {
          storage.setItem(this.getCacheKey(key), JSON.stringify(item));
        } catch (retryError) {
          console.error('Failed to write to storage after cleanup:', retryError);
        }
      }
    }
  }

  private clearStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('compliance_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private pruneStorage(storage: Storage): void {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('compliance_cache_')) {
        try {
          const stored = storage.getItem(key);
          if (stored) {
            const item = JSON.parse(stored) as CacheItem<any>;
            if (now - item.timestamp > item.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Invalid item, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private clearOldestFromStorage(storage: Storage): void {
    const items: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('compliance_cache_')) {
        try {
          const stored = storage.getItem(key);
          if (stored) {
            const item = JSON.parse(stored) as CacheItem<any>;
            items.push({ key, timestamp: item.timestamp });
          }
        } catch (error) {
          // Invalid item, remove it
          storage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove the oldest 10%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = Math.ceil(items.length * 0.1);
    
    for (let i = 0; i < itemsToRemove && i < items.length; i++) {
      storage.removeItem(items[i].key);
    }
  }

  private getCacheKey(key: string): string {
    return `compliance_cache_${key}`;
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUp(fetchers: Array<{ key: string; fetcher: () => Promise<any>; options?: CacheOptions }>): Promise<void> {
    await Promise.all(
      fetchers.map(async ({ key, fetcher, options }) => {
        try {
          const data = await fetcher();
          this.set(key, data, options);
        } catch (error) {
          console.error(`Failed to warm up cache for key ${key}:`, error);
        }
      })
    );
  }
}

// Export singleton instance
export const complianceCacheService = new ComplianceCacheService();

// Export class for testing purposes
export { ComplianceCacheService };

// Helper hook for React components
import { useEffect, useState } from 'react';

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions & { enabled?: boolean }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = complianceCacheService.get<T>(key, options);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      complianceCacheService.set(key, freshData, options);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData();
    }
  }, [key, options?.enabled]);

  const refetch = async () => {
    complianceCacheService.remove(key, options?.storage);
    await fetchData();
  };

  return { data, loading, error, refetch };
}