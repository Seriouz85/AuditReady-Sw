import { securityService } from './SecurityService';
import { csrfProtection } from './CSRFProtection';
import { enhancedRateLimit } from './EnhancedRateLimit';
import { rbacGuards, UserContext, Permission } from './RBACGuards';
import { enhancedXSSProtection } from './EnhancedXSSProtection';
import { securityHeaders } from './SecurityHeaders';
import { dataEncryption } from './DataEncryption';

export interface SecurityMiddlewareConfig {
  csrf: {
    enabled: boolean;
    excludePaths?: string[];
  };
  rateLimit: {
    enabled: boolean;
    rules?: Record<string, { max: number; windowMs: number }>;
  };
  rbac: {
    enabled: boolean;
    requireAuth?: boolean;
  };
  xss: {
    enabled: boolean;
    sanitizeInput?: boolean;
  };
  headers: {
    enabled: boolean;
    customHeaders?: Record<string, string>;
  };
  audit: {
    enabled: boolean;
    logAllRequests?: boolean;
  };
  encryption: {
    enabled: boolean;
    encryptResponses?: boolean;
  };
}

export interface SecurityContext {
  user?: UserContext;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  origin: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface SecurityResult {
  allowed: boolean;
  reason?: string;
  headers?: Record<string, string>;
  sanitizedInput?: any;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
  warnings?: string[];
}

/**
 * Comprehensive Security Middleware Integration
 * Orchestrates all security layers for complete protection
 */
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private config: SecurityMiddlewareConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  /**
   * Get default security middleware configuration
   */
  private getDefaultConfig(): SecurityMiddlewareConfig {
    return {
      csrf: {
        enabled: true,
        excludePaths: ['/api/public/', '/health', '/metrics'],
      },
      rateLimit: {
        enabled: true,
        rules: {
          '/api/auth/login': { max: 5, windowMs: 15 * 60 * 1000 },
          '/api/auth/register': { max: 3, windowMs: 60 * 60 * 1000 },
          '/api/auth/reset-password': { max: 3, windowMs: 60 * 60 * 1000 },
          '/api/': { max: 100, windowMs: 60 * 1000 },
          default: { max: 1000, windowMs: 60 * 1000 },
        },
      },
      rbac: {
        enabled: true,
        requireAuth: true,
      },
      xss: {
        enabled: true,
        sanitizeInput: true,
      },
      headers: {
        enabled: true,
      },
      audit: {
        enabled: true,
        logAllRequests: false,
      },
      encryption: {
        enabled: true,
        encryptResponses: false,
      },
    };
  }

  /**
   * Main security middleware function
   */
  public async processRequest(context: SecurityContext): Promise<SecurityResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    let headers: Record<string, string> = {};
    let sanitizedInput = context.body;

    try {
      // 1. Security Headers
      if (this.config.headers.enabled) {
        const headerResult = securityHeaders.generateHeaders();
        headers = { ...headers, ...headerResult.headers };
        warnings.push(...headerResult.warnings);
      }

      // 2. Rate Limiting
      if (this.config.rateLimit.enabled) {
        const rateLimitResult = await this.checkRateLimit(context);
        if (!rateLimitResult.allowed) {
          return {
            allowed: false,
            reason: rateLimitResult.reason,
            headers,
            warnings,
          };
        }
      }

      // 3. CSRF Protection (for state-changing requests)
      if (this.config.csrf.enabled && this.isStateChangingRequest(context)) {
        const csrfResult = await this.checkCSRF(context);
        if (!csrfResult.allowed) {
          return {
            allowed: false,
            reason: csrfResult.reason,
            headers,
            warnings,
          };
        }
      }

      // 4. Input Sanitization (XSS Protection)
      if (this.config.xss.enabled && this.config.xss.sanitizeInput) {
        sanitizedInput = await this.sanitizeInput(context, sanitizedInput);
      }

      // 5. Authentication & Authorization (RBAC)
      if (this.config.rbac.enabled) {
        const authResult = await this.checkAuthorization(context);
        if (!authResult.allowed) {
          return {
            allowed: false,
            reason: authResult.reason,
            headers,
            warnings,
          };
        }
      }

      // 6. Audit Logging
      if (this.config.audit.enabled) {
        await this.logRequest(context, true, Date.now() - startTime);
      }

      return {
        allowed: true,
        headers,
        sanitizedInput,
        warnings,
      };

    } catch (error) {
      // Log security middleware error
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'security_middleware_error',
          error: error.message,
          path: context.path,
          method: context.method,
          ipAddress: context.ipAddress,
        },
        timestamp: new Date(),
        severity: 'high',
      });

      return {
        allowed: false,
        reason: 'Security middleware error',
        headers,
        warnings: [...warnings, error.message],
      };
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(context: SecurityContext): Promise<SecurityResult> {
    const identifier = `${context.ipAddress}:${context.path}`;
    
    // Find matching rate limit rule
    let ruleConfig = this.config.rateLimit.rules?.default;
    if (this.config.rateLimit.rules) {
      for (const [pattern, config] of Object.entries(this.config.rateLimit.rules)) {
        if (pattern !== 'default' && context.path.startsWith(pattern)) {
          ruleConfig = config;
          break;
        }
      }
    }

    if (!ruleConfig) {
      return { allowed: true };
    }

    const result = enhancedRateLimit.checkRateLimit(identifier, {
      windowMs: ruleConfig.windowMs,
      max: ruleConfig.max,
      message: 'Rate limit exceeded for this endpoint',
    });

    if (!result.allowed) {
      await securityService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: {
          path: context.path,
          method: context.method,
          ipAddress: context.ipAddress,
          limit: ruleConfig.max,
          windowMs: ruleConfig.windowMs,
        },
        timestamp: new Date(),
        severity: 'medium',
      });
    }

    return {
      allowed: result.allowed,
      reason: result.reason,
      rateLimitInfo: {
        remaining: Math.max(0, ruleConfig.max - result.count),
        resetTime: result.resetTime,
      },
    };
  }

  /**
   * Check CSRF protection
   */
  private async checkCSRF(context: SecurityContext): Promise<SecurityResult> {
    // Skip CSRF check for excluded paths
    if (this.config.csrf.excludePaths?.some(path => context.path.startsWith(path))) {
      return { allowed: true };
    }

    const csrfToken = context.headers['x-csrf-token'] || context.body?._csrf_token;
    if (!csrfToken) {
      return { allowed: false, reason: 'CSRF token missing' };
    }

    const isValid = csrfProtection.validateCSRFToken(
      context.sessionId,
      csrfToken,
      context.origin,
      context.userAgent,
      context.user?.id
    );

    return {
      allowed: isValid.valid,
      reason: isValid.reason,
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  private async sanitizeInput(context: SecurityContext, input: any): Promise<any> {
    if (!input) return input;

    if (typeof input === 'string') {
      return enhancedXSSProtection.sanitizePlainText(input, context.user?.id);
    }

    if (Array.isArray(input)) {
      return Promise.all(input.map(item => this.sanitizeInput(context, item)));
    }

    if (typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = await this.sanitizeInput(context, value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Check authorization (RBAC)
   */
  private async checkAuthorization(context: SecurityContext): Promise<SecurityResult> {
    // Skip auth check for public endpoints
    const publicPaths = ['/api/public/', '/health', '/metrics', '/api/auth/login', '/api/auth/register'];
    if (publicPaths.some(path => context.path.startsWith(path))) {
      return { allowed: true };
    }

    if (this.config.rbac.requireAuth && !context.user) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (context.user) {
      // Extract permission from path and method
      const permission = this.mapEndpointToPermission(context.path, context.method);
      if (permission) {
        const result = await rbacGuards.checkAccess(context.user, permission);
        return {
          allowed: result.granted,
          reason: result.reason,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Map API endpoint to permission
   */
  private mapEndpointToPermission(path: string, method: string): Permission | null {
    const pathMappings: Record<string, Record<string, Permission>> = {
      '/api/organizations': {
        GET: 'organization:read',
        POST: 'organization:create',
        PUT: 'organization:update',
        DELETE: 'organization:delete',
      },
      '/api/users': {
        GET: 'user:read',
        POST: 'user:create',
        PUT: 'user:update',
        DELETE: 'user:delete',
      },
      '/api/assessments': {
        GET: 'assessment:read',
        POST: 'assessment:create',
        PUT: 'assessment:update',
        DELETE: 'assessment:delete',
      },
      '/api/documents': {
        GET: 'document:read',
        POST: 'document:create',
        PUT: 'document:update',
        DELETE: 'document:delete',
      },
      '/api/admin': {
        GET: 'admin:system',
        POST: 'admin:system',
        PUT: 'admin:system',
        DELETE: 'admin:system',
      },
    };

    // Find matching path pattern
    for (const [pathPattern, methods] of Object.entries(pathMappings)) {
      if (path.startsWith(pathPattern)) {
        return methods[method] || null;
      }
    }

    return null;
  }

  /**
   * Log request for audit trail
   */
  private async logRequest(
    context: SecurityContext,
    allowed: boolean,
    responseTime: number
  ): Promise<void> {
    // Only log sensitive endpoints or failed requests
    const shouldLog = !allowed || 
      this.config.audit.logAllRequests ||
      context.path.includes('/api/admin') ||
      context.path.includes('/auth/') ||
      ['POST', 'PUT', 'DELETE'].includes(context.method);

    if (shouldLog) {
      await securityService.logSecurityEvent({
        type: allowed ? 'authentication_success' : 'authorization_failure',
        userId: context.user?.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: {
          path: context.path,
          method: context.method,
          sessionId: context.sessionId,
          responseTime,
          allowed,
        },
        timestamp: new Date(),
        severity: allowed ? 'low' : 'medium',
      });
    }
  }

  /**
   * Check if request is state-changing (requires CSRF protection)
   */
  private isStateChangingRequest(context: SecurityContext): boolean {
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    return stateChangingMethods.includes(context.method);
  }

  /**
   * Process response (add security headers, encrypt if needed)
   */
  public async processResponse(
    context: SecurityContext,
    response: any,
    securityResult: SecurityResult
  ): Promise<{ 
    headers: Record<string, string>; 
    body: any; 
    encrypted?: boolean;
  }> {
    let headers = { ...securityResult.headers };
    let body = response;

    // Add CSRF token to response headers if needed
    if (this.config.csrf.enabled && context.user) {
      const csrfToken = csrfProtection.generateCSRFToken(
        context.sessionId,
        context.origin,
        context.userAgent
      );
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Encrypt sensitive responses if configured
    if (this.config.encryption.enabled && this.config.encryption.encryptResponses) {
      const sensitiveEndpoints = ['/api/users', '/api/admin', '/api/sensitive'];
      const isSensitive = sensitiveEndpoints.some(endpoint => 
        context.path.startsWith(endpoint)
      );

      if (isSensitive) {
        try {
          const encryptionResult = await dataEncryption.encryptObject(body);
          body = {
            encrypted: true,
            data: encryptionResult,
          };
          headers['Content-Type'] = 'application/json';
        } catch (error) {
          console.error('Response encryption failed:', error);
        }
      }
    }

    // Add security-related response headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';

    return { headers, body };
  }

  /**
   * Get security middleware configuration
   */
  public getConfig(): SecurityMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Update security middleware configuration
   */
  public updateConfig(newConfig: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };

    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_middleware_config_updated',
        changes: Object.keys(newConfig),
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  /**
   * Get security health status
   */
  public async getSecurityHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    components: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      message: string;
    }>;
    overallScore: number;
  }> {
    const components = [];
    let totalScore = 0;
    const maxScore = 7;

    // Check CSRF protection
    components.push({
      name: 'CSRF Protection',
      status: this.config.csrf.enabled ? 'healthy' : 'critical',
      message: this.config.csrf.enabled ? 'CSRF protection is enabled' : 'CSRF protection is disabled',
    });
    if (this.config.csrf.enabled) totalScore++;

    // Check rate limiting
    components.push({
      name: 'Rate Limiting',
      status: this.config.rateLimit.enabled ? 'healthy' : 'warning',
      message: this.config.rateLimit.enabled ? 'Rate limiting is active' : 'Rate limiting is disabled',
    });
    if (this.config.rateLimit.enabled) totalScore++;

    // Check RBAC
    components.push({
      name: 'Access Control',
      status: this.config.rbac.enabled ? 'healthy' : 'critical',
      message: this.config.rbac.enabled ? 'RBAC is enforced' : 'Access control is disabled',
    });
    if (this.config.rbac.enabled) totalScore++;

    // Check XSS protection
    components.push({
      name: 'XSS Protection',
      status: this.config.xss.enabled ? 'healthy' : 'warning',
      message: this.config.xss.enabled ? 'XSS protection is active' : 'XSS protection is disabled',
    });
    if (this.config.xss.enabled) totalScore++;

    // Check security headers
    components.push({
      name: 'Security Headers',
      status: this.config.headers.enabled ? 'healthy' : 'warning',
      message: this.config.headers.enabled ? 'Security headers are set' : 'Security headers are missing',
    });
    if (this.config.headers.enabled) totalScore++;

    // Check audit logging
    components.push({
      name: 'Audit Logging',
      status: this.config.audit.enabled ? 'healthy' : 'warning',
      message: this.config.audit.enabled ? 'Audit logging is active' : 'Audit logging is disabled',
    });
    if (this.config.audit.enabled) totalScore++;

    // Check encryption
    components.push({
      name: 'Data Encryption',
      status: this.config.encryption.enabled ? 'healthy' : 'warning',
      message: this.config.encryption.enabled ? 'Encryption is available' : 'Encryption is disabled',
    });
    if (this.config.encryption.enabled) totalScore++;

    const overallScore = Math.round((totalScore / maxScore) * 100);
    const criticalIssues = components.filter(c => c.status === 'critical').length;
    const warningIssues = components.filter(c => c.status === 'warning').length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalIssues > 0) {
      status = 'critical';
    } else if (warningIssues > 2) {
      status = 'warning';
    }

    return {
      status,
      components,
      overallScore,
    };
  }
}

// Export singleton instance and utility functions
export const securityMiddleware = SecurityMiddleware.getInstance();

// Middleware factory for different frameworks
export const createSecurityMiddleware = (config?: Partial<SecurityMiddlewareConfig>) => {
  if (config) {
    securityMiddleware.updateConfig(config);
  }
  return securityMiddleware;
};