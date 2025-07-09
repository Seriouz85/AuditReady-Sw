import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting (for production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum number of requests per window
  message?: string; // Error message
}

export function createRateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests from this IP, please try again later.'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request count for this IP
    let requestInfo = requestCounts.get(ip);
    
    if (!requestInfo || requestInfo.resetTime < now) {
      // Create new window
      requestInfo = {
        count: 1,
        resetTime: now + windowMs
      };
      requestCounts.set(ip, requestInfo);
      next();
      return;
    }

    if (requestInfo.count >= max) {
      // Rate limit exceeded
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000)
      });
      return;
    }

    // Increment count
    requestInfo.count++;
    requestCounts.set(ip, requestInfo);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [key, value] of requestCounts.entries()) {
        if (value.resetTime < now) {
          requestCounts.delete(key);
        }
      }
    }

    next();
  };
}

// Default rate limit middleware
export const rateLimitMiddleware = createRateLimit();