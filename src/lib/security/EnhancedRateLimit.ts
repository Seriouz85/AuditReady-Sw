import { securityService } from './SecurityService';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string; // Error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
  onLimitReached?: (identifier: string, count: number) => void;
  whitelist?: string[];
  blacklist?: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
}

export interface RequestMetrics {
  totalRequests: number;
  blockedRequests: number;
  uniqueIps: number;
  avgRequestsPerMinute: number;
  suspiciousActivity: number;
}

/**
 * Enhanced Rate Limiting Service with adaptive algorithms and attack detection
 */
export class EnhancedRateLimit {
  private static instance: EnhancedRateLimit;
  private requestCounts = new Map<string, { count: number; resetTime: number; requests: number[] }>();
  private suspiciousIPs = new Set<string>();
  private metrics: RequestMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    uniqueIps: 0,
    avgRequestsPerMinute: 0,
    suspiciousActivity: 0,
  };

  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  private readonly SUSPICIOUS_THRESHOLD = 5; // Suspicious after 5 rate limit violations
  private readonly ADAPTIVE_MULTIPLIER = 1.5; // Increase limits by 50% for suspicious IPs

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  public static getInstance(): EnhancedRateLimit {
    if (!EnhancedRateLimit.instance) {
      EnhancedRateLimit.instance = new EnhancedRateLimit();
    }
    return EnhancedRateLimit.instance;
  }

  /**
   * Check if request is allowed based on rate limiting rules
   */
  public checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;

    // Check whitelist/blacklist
    if (config.whitelist?.includes(identifier)) {
      return { allowed: true, count: 0, resetTime: now + config.windowMs };
    }

    if (config.blacklist?.includes(identifier)) {
      this.logRateLimitEvent(identifier, 'blacklisted', config);
      return {
        allowed: false,
        count: 0,
        resetTime: now + config.windowMs,
        reason: 'IP address is blacklisted',
      };
    }

    // Get or create request info
    let requestInfo = this.requestCounts.get(key);
    if (!requestInfo || requestInfo.resetTime < now) {
      requestInfo = {
        count: 1,
        resetTime: now + config.windowMs,
        requests: [now],
      };
      this.requestCounts.set(key, requestInfo);
      this.metrics.totalRequests++;
      this.updateUniqueIps();
      return { allowed: true, count: 1, resetTime: requestInfo.resetTime };
    }

    // Calculate adaptive limit based on suspicious activity
    let effectiveLimit = config.max;
    if (this.suspiciousIPs.has(identifier)) {
      effectiveLimit = Math.floor(config.max / this.ADAPTIVE_MULTIPLIER);
    }

    // Check rate limit
    if (requestInfo.count >= effectiveLimit) {
      this.handleRateLimitViolation(identifier, requestInfo.count, config);
      return {
        allowed: false,
        count: requestInfo.count,
        resetTime: requestInfo.resetTime,
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000),
        reason: config.message || 'Rate limit exceeded',
      };
    }

    // Increment count and track request time
    requestInfo.count++;
    requestInfo.requests.push(now);
    this.requestCounts.set(key, requestInfo);
    this.metrics.totalRequests++;

    // Analyze request patterns for suspicious activity
    this.analyzeRequestPattern(identifier, requestInfo);

    return {
      allowed: true,
      count: requestInfo.count,
      resetTime: requestInfo.resetTime,
    };
  }

  /**
   * Create specific rate limiters for different operations
   */
  public createLoginRateLimit(): (identifier: string) => RateLimitResult {
    const config: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many login attempts. Please try again later.',
    };

    return (identifier: string) => this.checkRateLimit(identifier, config);
  }

  public createAPIRateLimit(): (identifier: string) => RateLimitResult {
    const config: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'API rate limit exceeded. Please slow down.',
    };

    return (identifier: string) => this.checkRateLimit(identifier, config);
  }

  public createUploadRateLimit(): (identifier: string) => RateLimitResult {
    const config: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 uploads per minute
      message: 'Upload rate limit exceeded. Please wait before uploading again.',
    };

    return (identifier: string) => this.checkRateLimit(identifier, config);
  }

  public createPasswordResetRateLimit(): (identifier: string) => RateLimitResult {
    const config: RateLimitConfig = {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 password reset requests per hour
      message: 'Too many password reset requests. Please try again later.',
    };

    return (identifier: string) => this.checkRateLimit(identifier, config);
  }

  /**
   * Handle rate limit violations and detect attacks
   */
  private handleRateLimitViolation(identifier: string, count: number, config: RateLimitConfig): void {
    this.metrics.blockedRequests++;

    // Track suspicious IPs
    const violations = this.getSuspiciousScore(identifier);
    if (violations >= this.SUSPICIOUS_THRESHOLD) {
      this.suspiciousIPs.add(identifier);
      this.metrics.suspiciousActivity++;
    }

    // Log security event
    this.logRateLimitEvent(identifier, 'limit_exceeded', config, count);

    // Call custom handler if provided
    if (config.onLimitReached) {
      config.onLimitReached(identifier, count);
    }
  }

  /**
   * Analyze request patterns to detect suspicious behavior
   */
  private analyzeRequestPattern(identifier: string, requestInfo: { requests: number[] }): void {
    const now = Date.now();
    const recentRequests = requestInfo.requests.filter(time => now - time < 60 * 1000); // Last minute

    // Check for burst patterns (too many requests in short time)
    if (recentRequests.length > 50) { // More than 50 requests per minute
      this.logSuspiciousActivity(identifier, 'burst_pattern', { requestsPerMinute: recentRequests.length });
    }

    // Check for regular interval patterns (potential bot behavior)
    if (recentRequests.length >= 10) {
      const intervals = [];
      for (let i = 1; i < recentRequests.length; i++) {
        intervals.push(recentRequests[i] - recentRequests[i - 1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      // Low variance indicates regular intervals (bot-like behavior)
      if (variance < 1000 && avgInterval < 5000) { // Less than 5 seconds average with low variance
        this.logSuspiciousActivity(identifier, 'regular_interval_pattern', { 
          avgInterval, 
          variance,
          requestCount: recentRequests.length 
        });
      }
    }
  }

  /**
   * Get suspicious score for an IP
   */
  private getSuspiciousScore(identifier: string): number {
    let score = 0;
    
    // Count rate limit violations in the last hour
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [requestKey, requestInfo] of this.requestCounts.entries()) {
      if (requestKey.includes(identifier) && now - (requestInfo.resetTime - oneHour) < oneHour) {
        if (requestInfo.count >= 10) { // Arbitrary threshold for "high" request count
          score++;
        }
      }
    }

    return score;
  }

  /**
   * Log rate limiting events for security monitoring
   */
  private logRateLimitEvent(
    identifier: string,
    reason: string,
    config: RateLimitConfig,
    count?: number
  ): void {
    securityService.logSecurityEvent({
      type: 'rate_limit_exceeded',
      details: {
        identifier,
        reason,
        count,
        limit: config.max,
        windowMs: config.windowMs,
        isSuspicious: this.suspiciousIPs.has(identifier),
      },
      timestamp: new Date(),
      severity: this.suspiciousIPs.has(identifier) ? 'high' : 'medium',
    });
  }

  /**
   * Log suspicious activity patterns
   */
  private logSuspiciousActivity(
    identifier: string,
    pattern: string,
    details: Record<string, any>
  ): void {
    securityService.logSecurityEvent({
      type: 'suspicious_activity',
      details: {
        identifier,
        pattern,
        ...details,
      },
      timestamp: new Date(),
      severity: 'medium',
    });
  }

  /**
   * Add IP to whitelist
   */
  public whitelistIP(ip: string, reason?: string): void {
    // Implementation would store in database or config
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'ip_whitelisted',
        ip,
        reason,
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  /**
   * Add IP to blacklist
   */
  public blacklistIP(ip: string, reason?: string): void {
    this.suspiciousIPs.add(ip);
    
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'ip_blacklisted',
        ip,
        reason,
      },
      timestamp: new Date(),
      severity: 'medium',
    });
  }

  /**
   * Clear rate limit for a specific identifier
   */
  public clearRateLimit(identifier: string): boolean {
    return this.requestCounts.delete(identifier);
  }

  /**
   * Clear suspicious status for an IP
   */
  public clearSuspiciousStatus(identifier: string): boolean {
    return this.suspiciousIPs.delete(identifier);
  }

  /**
   * Get current metrics
   */
  public getMetrics(): RequestMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get rate limit status for an identifier
   */
  public getStatus(identifier: string): {
    count: number;
    resetTime: number;
    isSuspicious: boolean;
    timeUntilReset: number;
  } | null {
    const requestInfo = this.requestCounts.get(identifier);
    if (!requestInfo) {
      return null;
    }

    const now = Date.now();
    return {
      count: requestInfo.count,
      resetTime: requestInfo.resetTime,
      isSuspicious: this.suspiciousIPs.has(identifier),
      timeUntilReset: Math.max(0, requestInfo.resetTime - now),
    };
  }

  /**
   * Update metrics calculations
   */
  private updateMetrics(): void {
    this.updateUniqueIps();
    
    // Calculate average requests per minute
    const now = Date.now();
    const oneMinute = 60 * 1000;
    let recentRequests = 0;
    
    for (const requestInfo of this.requestCounts.values()) {
      recentRequests += requestInfo.requests.filter(time => now - time < oneMinute).length;
    }
    
    this.metrics.avgRequestsPerMinute = recentRequests;
  }

  /**
   * Update unique IP count
   */
  private updateUniqueIps(): void {
    const uniqueKeys = new Set();
    for (const key of this.requestCounts.keys()) {
      // Extract IP from key (assuming format like "ip:endpoint" or just "ip")
      const ip = key.split(':')[0];
      uniqueKeys.add(ip);
    }
    this.metrics.uniqueIps = uniqueKeys.size;
  }

  /**
   * Clean up expired rate limit data
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, requestInfo] of this.requestCounts.entries()) {
      if (requestInfo.resetTime < now) {
        this.requestCounts.delete(key);
        cleanedCount++;
      } else {
        // Clean up old request timestamps
        requestInfo.requests = requestInfo.requests.filter(time => now - time < requestInfo.resetTime - now);
      }
    }

    if (cleanedCount > 0) {
      securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'rate_limit_cleanup',
          cleanedCount,
          remainingCount: this.requestCounts.size,
        },
        timestamp: new Date(),
        severity: 'low',
      });
    }
  }

  /**
   * Reset all rate limits (for testing/admin purposes)
   */
  public resetAll(): void {
    const count = this.requestCounts.size;
    this.requestCounts.clear();
    this.suspiciousIPs.clear();
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      uniqueIps: 0,
      avgRequestsPerMinute: 0,
      suspiciousActivity: 0,
    };

    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'rate_limits_reset',
        count,
      },
      timestamp: new Date(),
      severity: 'medium',
    });
  }
}

// Export singleton instance and utility functions
export const enhancedRateLimit = EnhancedRateLimit.getInstance();

// Pre-configured rate limiters
export const loginRateLimit = enhancedRateLimit.createLoginRateLimit();
export const apiRateLimit = enhancedRateLimit.createAPIRateLimit();
export const uploadRateLimit = enhancedRateLimit.createUploadRateLimit();
export const passwordResetRateLimit = enhancedRateLimit.createPasswordResetRateLimit();

// Legacy compatibility
export function createRateLimit(options: RateLimitConfig) {
  return (identifier: string) => enhancedRateLimit.checkRateLimit(identifier, options);
}

export const rateLimitMiddleware = apiRateLimit;