import Redis from 'ioredis';

/**
 * Production-ready Redis-based Rate Limiter
 * Supports sliding window and fixed window algorithms
 */

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (identifier: string) => string;  // Custom key generator
  skipSuccessfulRequests?: boolean;  // Only count failed requests
  skipFailedRequests?: boolean;  // Only count successful requests
  message?: string;  // Custom error message
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

export class RedisRateLimit {
  private redis: Redis;
  private keyPrefix: string;

  constructor(redisUrl?: string, keyPrefix = 'rl:') {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
    this.keyPrefix = keyPrefix;
  }

  /**
   * Check if request is within rate limit using sliding window algorithm
   */
  async checkLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = this.generateKey(identifier, config);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Use Lua script for atomic operations
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        local windowStart = now - window
        
        -- Remove expired entries
        redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
        
        -- Count current requests in window
        local current = redis.call('ZCARD', key)
        
        if current < limit then
          -- Add current request
          redis.call('ZADD', key, now, now .. ':' .. math.random())
          redis.call('EXPIRE', key, math.ceil(window / 1000))
          return {1, limit - current - 1, now + window, current + 1}
        else
          return {0, 0, now + window, current}
        end
      `;

      const result = await this.redis.eval(
        luaScript,
        1,
        key,
        now.toString(),
        config.windowMs.toString(),
        config.maxRequests.toString()
      ) as [number, number, number, number];

      return {
        allowed: result[0] === 1,
        remaining: result[1],
        resetTime: result[2],
        totalHits: result[3]
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        totalHits: 1
      };
    }
  }

  /**
   * Check rate limit with fixed window algorithm (more memory efficient)
   */
  async checkFixedWindow(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
    const key = this.generateKey(identifier, config, windowStart.toString());

    try {
      const luaScript = `
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local ttl = tonumber(ARGV[2])
        
        local current = redis.call('GET', key)
        if current == false then
          current = 0
        else
          current = tonumber(current)
        end
        
        if current < limit then
          local newVal = redis.call('INCR', key)
          redis.call('EXPIRE', key, ttl)
          return {1, limit - newVal, newVal}
        else
          return {0, 0, current}
        end
      `;

      const result = await this.redis.eval(
        luaScript,
        1,
        key,
        config.maxRequests.toString(),
        Math.ceil(config.windowMs / 1000).toString()
      ) as [number, number, number];

      return {
        allowed: result[0] === 1,
        remaining: result[1],
        resetTime: windowStart + config.windowMs,
        totalHits: result[2]
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: windowStart + config.windowMs,
        totalHits: 1
      };
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async resetLimit(identifier: string, config: RateLimitConfig): Promise<void> {
    const key = this.generateKey(identifier, config);
    await this.redis.del(key);
  }

  /**
   * Get current usage for an identifier
   */
  async getUsage(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = this.generateKey(identifier, config);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      await this.redis.zremrangebyscore(key, 0, windowStart);
      const current = await this.redis.zcard(key);

      return {
        allowed: current < config.maxRequests,
        remaining: Math.max(0, config.maxRequests - current),
        resetTime: now + config.windowMs,
        totalHits: current
      };
    } catch (error) {
      console.error('Error getting usage:', error);
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        totalHits: 0
      };
    }
  }

  private generateKey(identifier: string, config: RateLimitConfig, suffix?: string): string {
    const baseKey = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
    return `${this.keyPrefix}${baseKey}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const createCommonRateLimiters = (redisUrl?: string) => {
  const rateLimiter = new RedisRateLimit(redisUrl);

  return {
    // API rate limiting
    api: {
      free: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100
      }),
      pro: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000
      }),
      enterprise: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10000
      })
    },

    // Authentication rate limiting
    auth: {
      login: (identifier: string) => rateLimiter.checkFixedWindow(identifier, {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many login attempts. Please try again in 15 minutes.'
      }),
      registration: (identifier: string) => rateLimiter.checkFixedWindow(identifier, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        message: 'Too many registration attempts. Please try again in 1 hour.'
      }),
      passwordReset: (identifier: string) => rateLimiter.checkFixedWindow(identifier, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        message: 'Too many password reset attempts. Please try again in 1 hour.'
      })
    },

    // Content creation rate limiting
    content: {
      upload: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10
      }),
      comment: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30
      }),
      report: (identifier: string) => rateLimiter.checkLimit(identifier, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50
      })
    },

    // Email rate limiting
    email: {
      send: (identifier: string) => rateLimiter.checkFixedWindow(identifier, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10
      }),
      invite: (identifier: string) => rateLimiter.checkFixedWindow(identifier, {
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        maxRequests: 50
      })
    }
  };
};

/**
 * Express middleware for rate limiting
 */
export const createRateLimitMiddleware = (
  rateLimiter: RedisRateLimit,
  config: RateLimitConfig,
  getIdentifier?: (req: any) => string
) => {
  return async (req: any, res: any, next: any) => {
    try {
      const identifier = getIdentifier ? getIdentifier(req) : req.ip || 'anonymous';
      const result = await rateLimiter.checkLimit(identifier, config);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (!result.allowed) {
        return res.status(429).json({
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      // Fail open - continue processing if rate limiter fails
      next();
    }
  };
};

export default RedisRateLimit;