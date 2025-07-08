import { createClient, RedisClientType } from 'redis';
import { reportError, addBreadcrumb } from '@/lib/monitoring/sentry';

interface CacheConfig {
  url?: string;
  password?: string;
  host?: string;
  port?: number;
  db?: number;
  ttl?: number; // Default TTL in seconds
  keyPrefix?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  lastError?: string;
}

class RedisCache {
  private client: RedisClientType | null = null;
  private config: CacheConfig;
  private isConnected = false;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };
  private connectionRetries = 0;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: 3600, // 1 hour default
      keyPrefix: 'auditready:',
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      // Redis connection configuration
      const redisConfig = {
        url: this.config.url || `redis://${this.config.host || 'localhost'}:${this.config.port || 6379}`,
        password: this.config.password,
        database: this.config.db || 0,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > (this.config.maxRetries || 3)) {
              return new Error('Redis connection failed after max retries');
            }
            return Math.min(retries * 100, 3000);
          }
        },
        commandsQueueMaxLength: 1000,
        // Disable Redis in development if no URL provided
        disableOfflineQueue: !this.config.url
      };

      this.client = createClient(redisConfig);

      // Event handlers
      this.client.on('error', (error) => {
        this.metrics.errors++;
        this.metrics.lastError = error.message;
        console.warn('Redis connection error:', error.message);
        
        // Only report to Sentry in production
        if (import.meta.env.PROD) {
          reportError(error, { context: 'redis_connection' }, 'warning');
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.connectionRetries = 0;
        addBreadcrumb('Redis connected', 'redis', 'info');
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
      });

      this.client.on('end', () => {
        this.isConnected = false;
        addBreadcrumb('Redis connection ended', 'redis', 'info');
      });

      this.client.on('reconnecting', () => {
        this.connectionRetries++;
        addBreadcrumb('Redis reconnecting', 'redis', 'info', {
          attempt: this.connectionRetries
        });
      });

      await this.client.connect();
      
    } catch (error) {
      this.isConnected = false;
      console.warn('Failed to connect to Redis:', error);
      
      // In development, continue without Redis
      if (import.meta.env.DEV) {
        console.log('Continuing without Redis cache in development mode');
        return;
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      this.metrics.misses++;
      return null;
    }

    try {
      const value = await this.client!.get(this.getKey(key));
      
      if (value === null) {
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return JSON.parse(value) as T;
      
    } catch (error) {
      this.metrics.errors++;
      this.metrics.misses++;
      console.warn('Redis GET error:', error);
      return null;
    }
  }

  async set(
    key: string, 
    value: any, 
    ttl?: number
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const expiration = ttl || this.config.ttl || 3600;
      
      await this.client!.setEx(this.getKey(key), expiration, serializedValue);
      this.metrics.sets++;
      return true;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.del(this.getKey(key));
      this.metrics.deletes++;
      return result > 0;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(this.getKey(key));
      return result > 0;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis EXISTS error:', error);
      return false;
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isAvailable() || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const redisKeys = keys.map(key => this.getKey(key));
      const values = await this.client!.mGet(redisKeys);
      
      return values.map(value => {
        if (value === null) {
          this.metrics.misses++;
          return null;
        }
        
        this.metrics.hits++;
        try {
          return JSON.parse(value) as T;
        } catch {
          this.metrics.errors++;
          return null;
        }
      });
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValues: Record<string, any>, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const pipeline = this.client!.multi();
      const expiration = ttl || this.config.ttl || 3600;

      Object.entries(keyValues).forEach(([key, value]) => {
        const serializedValue = JSON.stringify(value);
        pipeline.setEx(this.getKey(key), expiration, serializedValue);
      });

      await pipeline.exec();
      this.metrics.sets += Object.keys(keyValues).length;
      return true;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis MSET error:', error);
      return false;
    }
  }

  async increment(key: string, amount = 1): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.client!.incrBy(this.getKey(key), amount);
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis INCR error:', error);
      return null;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.expire(this.getKey(key), ttl);
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis EXPIRE error:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Only flush keys with our prefix for safety
      const keys = await this.client!.keys(`${this.config.keyPrefix}*`);
      
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
      
      return true;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis FLUSH error:', error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const searchPattern = `${this.config.keyPrefix}${pattern}`;
      const keys = await this.client!.keys(searchPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await this.client!.del(keys);
      return keys.length;
      
    } catch (error) {
      this.metrics.errors++;
      console.warn('Redis FLUSH_PATTERN error:', error);
      return 0;
    }
  }

  getMetrics(): CacheMetrics & { hitRate: number; isConnected: boolean } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      isConnected: this.isConnected
    };
  }

  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        status: 'unhealthy',
        error: 'Not connected to Redis'
      };
    }

    try {
      const start = Date.now();
      await this.client!.ping();
      const latency = Date.now() - start;

      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        latency
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
const cacheConfig: CacheConfig = {
  url: import.meta.env.VITE_REDIS_URL,
  host: import.meta.env.VITE_REDIS_HOST,
  port: parseInt(import.meta.env.VITE_REDIS_PORT || '6379'),
  password: import.meta.env.VITE_REDIS_PASSWORD,
  db: parseInt(import.meta.env.VITE_REDIS_DB || '0'),
  ttl: parseInt(import.meta.env.VITE_CACHE_TTL || '3600'),
  keyPrefix: import.meta.env.VITE_CACHE_PREFIX || 'auditready:',
};

export const cache = new RedisCache(cacheConfig);

// Auto-connect in production
if (import.meta.env.PROD && cacheConfig.url) {
  cache.connect().catch(console.warn);
}

export default cache;