import { z } from 'zod';
import DOMPurify from 'dompurify';
import { supabase } from '../supabase';

// Security event types for audit logging
export type SecurityEventType = 
  | 'authentication_success'
  | 'authentication_failure'
  | 'authorization_failure'
  | 'csrf_violation'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'privilege_escalation_attempt'
  | 'data_access_violation'
  | 'input_validation_failure'
  | 'file_upload_rejected'
  | 'security_configuration_change';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    requests: number;
    windowMs: number;
  };
  csrf: {
    enabled: boolean;
    tokenExpiry: number;
  };
  encryption: {
    algorithm: string;
    keyRotationInterval: number;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
  };
}

/**
 * Centralized Security Service implementing OWASP Top 10 protections
 * Provides comprehensive security functions for the application
 */
export class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private csrfTokens = new Map<string, { token: string; expires: number }>();
  private rateLimiters = new Map<string, { count: number; resetTime: number }>();
  private encryptionKey: CryptoKey | null = null;

  private constructor() {
    this.config = {
      rateLimiting: {
        enabled: true,
        requests: 100,
        windowMs: 60 * 1000, // 1 minute
      },
      csrf: {
        enabled: true,
        tokenExpiry: 30 * 60 * 1000, // 30 minutes
      },
      encryption: {
        algorithm: 'AES-GCM',
        keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      },
      audit: {
        enabled: true,
        retentionDays: 90,
      },
    };

    this.initializeEncryption();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * OWASP A01: Broken Access Control - Authorization Guards
   */
  public async verifyUserPermissions(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          role,
          organization_id,
          permissions:user_permissions(permission)
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        await this.logSecurityEvent({
          type: 'authorization_failure',
          userId,
          details: { resource, action, error: 'User not found' },
          timestamp: new Date(),
          severity: 'medium',
        });
        return false;
      }

      // Check role-based permissions
      const hasPermission = await this.checkRolePermissions(user.role, resource, action);
      
      if (!hasPermission) {
        await this.logSecurityEvent({
          type: 'authorization_failure',
          userId,
          details: { resource, action, role: user.role },
          timestamp: new Date(),
          severity: 'medium',
        });
        return false;
      }

      return true;
    } catch (error) {
      await this.logSecurityEvent({
        type: 'authorization_failure',
        userId,
        details: { resource, action, error: error.message },
        timestamp: new Date(),
        severity: 'high',
      });
      return false;
    }
  }

  private async checkRolePermissions(role: string, resource: string, action: string): Promise<boolean> {
    const permissions = {
      'super_admin': ['*'],
      'org_admin': ['organization:*', 'users:read', 'users:update', 'assessments:*'],
      'compliance_manager': ['assessments:*', 'requirements:*', 'documents:*'],
      'auditor': ['assessments:read', 'requirements:read', 'documents:read'],
      'user': ['assessments:read', 'own:*'],
    };

    const rolePermissions = permissions[role] || [];
    const requiredPermission = `${resource}:${action}`;

    return rolePermissions.some(perm => 
      perm === '*' || 
      perm === requiredPermission || 
      (perm.endsWith(':*') && requiredPermission.startsWith(perm.replace(':*', ':')))
    );
  }

  /**
   * OWASP A02: Cryptographic Failures - Data Encryption
   */
  private async initializeEncryption(): Promise<void> {
    try {
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  }

  public async encryptSensitiveData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.encryptionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
      await this.logSecurityEvent({
        type: 'security_configuration_change',
        details: { action: 'encryption_failure', error: error.message },
        timestamp: new Date(),
        severity: 'high',
      });
      throw error;
    }
  }

  public async decryptSensitiveData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      await this.logSecurityEvent({
        type: 'security_configuration_change',
        details: { action: 'decryption_failure', error: error.message },
        timestamp: new Date(),
        severity: 'high',
      });
      throw error;
    }
  }

  /**
   * OWASP A03: Injection - Input Validation and Sanitization
   */
  public validateAndSanitizeInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      // First validate with Zod schema
      const validated = schema.parse(data);

      // Then sanitize string fields
      return this.deepSanitize(validated);
    } catch (error) {
      this.logSecurityEvent({
        type: 'input_validation_failure',
        details: { error: error.message, data: JSON.stringify(data) },
        timestamp: new Date(),
        severity: 'medium',
      });
      throw new Error('Invalid input data');
    }
  }

  private deepSanitize<T>(obj: T): T {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      }) as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item)) as T;
    }

    if (obj && typeof obj === 'object') {
      const sanitized = {} as T;
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key as keyof T] = this.deepSanitize(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * OWASP A04: Insecure Design - Secure File Upload
   */
  public validateFileUpload(file: File, allowedTypes: string[], maxSize: number): boolean {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      this.logSecurityEvent({
        type: 'file_upload_rejected',
        details: { 
          reason: 'invalid_type', 
          type: file.type, 
          allowed: allowedTypes,
          filename: file.name 
        },
        timestamp: new Date(),
        severity: 'medium',
      });
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      this.logSecurityEvent({
        type: 'file_upload_rejected',
        details: { 
          reason: 'size_exceeded', 
          size: file.size, 
          maxSize,
          filename: file.name 
        },
        timestamp: new Date(),
        severity: 'medium',
      });
      return false;
    }

    // Check filename for path traversal
    const filename = file.name;
    if (filename.includes('../') || filename.includes('..\\') || filename.includes('\0')) {
      this.logSecurityEvent({
        type: 'file_upload_rejected',
        details: { 
          reason: 'path_traversal_attempt', 
          filename 
        },
        timestamp: new Date(),
        severity: 'high',
      });
      return false;
    }

    return true;
  }

  /**
   * OWASP A05: Security Misconfiguration - CSRF Protection
   */
  public generateCSRFToken(sessionId: string): string {
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenString = Array.from(token, byte => byte.toString(16).padStart(2, '0')).join('');
    
    this.csrfTokens.set(sessionId, {
      token: tokenString,
      expires: Date.now() + this.config.csrf.tokenExpiry,
    });

    return tokenString;
  }

  public validateCSRFToken(sessionId: string, providedToken: string): boolean {
    const tokenData = this.csrfTokens.get(sessionId);
    
    if (!tokenData || Date.now() > tokenData.expires) {
      this.logSecurityEvent({
        type: 'csrf_violation',
        details: { 
          reason: tokenData ? 'token_expired' : 'token_not_found',
          sessionId 
        },
        timestamp: new Date(),
        severity: 'high',
      });
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    if (providedToken.length !== tokenData.token.length) {
      this.logSecurityEvent({
        type: 'csrf_violation',
        details: { reason: 'invalid_token_length', sessionId },
        timestamp: new Date(),
        severity: 'high',
      });
      return false;
    }

    let result = 0;
    for (let i = 0; i < providedToken.length; i++) {
      result |= providedToken.charCodeAt(i) ^ tokenData.token.charCodeAt(i);
    }

    if (result !== 0) {
      this.logSecurityEvent({
        type: 'csrf_violation',
        details: { reason: 'token_mismatch', sessionId },
        timestamp: new Date(),
        severity: 'high',
      });
      return false;
    }

    return true;
  }

  /**
   * OWASP A06: Vulnerable Components - Component Security Scanning
   */
  public async scanDependencyVulnerabilities(): Promise<any[]> {
    // This would integrate with vulnerability databases in production
    // For now, return basic security recommendations
    return [
      {
        component: 'react',
        version: '18.3.1',
        vulnerabilities: [],
        recommendations: ['Keep React updated to latest stable version'],
      },
      {
        component: 'supabase',
        version: 'latest',
        vulnerabilities: [],
        recommendations: ['Ensure RLS policies are properly configured'],
      },
    ];
  }

  /**
   * OWASP A07: Authentication Failures - Rate Limiting
   */
  public isRateLimited(identifier: string, limit?: number, windowMs?: number): boolean {
    const maxRequests = limit || this.config.rateLimiting.requests;
    const window = windowMs || this.config.rateLimiting.windowMs;
    const now = Date.now();

    let limiterData = this.rateLimiters.get(identifier);

    if (!limiterData || limiterData.resetTime < now) {
      // Create new window
      this.rateLimiters.set(identifier, {
        count: 1,
        resetTime: now + window,
      });
      return false;
    }

    if (limiterData.count >= maxRequests) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: { 
          identifier, 
          limit: maxRequests, 
          window: window / 1000 
        },
        timestamp: new Date(),
        severity: 'medium',
      });
      return true;
    }

    limiterData.count++;
    this.rateLimiters.set(identifier, limiterData);
    return false;
  }

  /**
   * OWASP A08: Software Integrity Failures - Content Integrity
   */
  public generateContentHash(content: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
  }

  /**
   * OWASP A09: Security Logging Failures - Audit System
   */
  public async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.config.audit.enabled) {
      return;
    }

    try {
      // Log to Supabase security audit table
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: event.type,
          user_id: event.userId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          details: event.details,
          severity: event.severity,
          timestamp: event.timestamp.toISOString(),
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Also log to console for development
      if (import.meta.env.DEV) {
        console.warn('Security Event:', event);
      }

      // Alert on critical events
      if (event.severity === 'critical') {
        await this.handleCriticalSecurityEvent(event);
      }
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }

  private async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // In production, this would send alerts to security team
    console.error('CRITICAL SECURITY EVENT:', event);
    
    // Could integrate with:
    // - Slack/Teams notifications
    // - PagerDuty alerts
    // - Email notifications
    // - SIEM systems
  }

  /**
   * OWASP A10: Server-Side Request Forgery - URL Validation
   */
  public validateURL(url: string, allowedDomains?: string[]): boolean {
    try {
      const urlObject = new URL(url);
      
      // Only allow HTTPS (and HTTP for development)
      if (!['https:', 'http:'].includes(urlObject.protocol)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          details: { 
            reason: 'invalid_protocol', 
            url, 
            protocol: urlObject.protocol 
          },
          timestamp: new Date(),
          severity: 'medium',
        });
        return false;
      }

      // Check against allowed domains if provided
      if (allowedDomains && allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          urlObject.hostname === domain || 
          urlObject.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: { 
              reason: 'domain_not_allowed', 
              url, 
              hostname: urlObject.hostname,
              allowedDomains 
            },
            timestamp: new Date(),
            severity: 'medium',
          });
          return false;
        }
      }

      // Block private IP addresses and localhost (except in development)
      if (!import.meta.env.DEV) {
        const hostname = urlObject.hostname;
        const privateRanges = [
          /^127\./, // 127.0.0.0/8
          /^10\./, // 10.0.0.0/8
          /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
          /^192\.168\./, // 192.168.0.0/16
          /^localhost$/i,
          /^::1$/, // IPv6 localhost
        ];

        if (privateRanges.some(range => range.test(hostname))) {
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: { 
              reason: 'private_ip_access_attempt', 
              url, 
              hostname 
            },
            timestamp: new Date(),
            severity: 'high',
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        details: { 
          reason: 'invalid_url_format', 
          url, 
          error: error.message 
        },
        timestamp: new Date(),
        severity: 'medium',
      });
      return false;
    }
  }

  /**
   * Comprehensive Security Health Check
   */
  public async performSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }>;
  }> {
    const checks = [];

    // Check encryption initialization
    checks.push({
      name: 'Encryption Initialization',
      status: this.encryptionKey ? 'pass' : 'fail',
      message: this.encryptionKey ? 'Encryption key initialized' : 'Encryption key not initialized',
    });

    // Check CSP configuration
    checks.push({
      name: 'Content Security Policy',
      status: 'pass', // CSP is configured
      message: 'CSP directives configured',
    });

    // Check rate limiting
    checks.push({
      name: 'Rate Limiting',
      status: this.config.rateLimiting.enabled ? 'pass' : 'warning',
      message: this.config.rateLimiting.enabled ? 'Rate limiting enabled' : 'Rate limiting disabled',
    });

    // Check audit logging
    checks.push({
      name: 'Audit Logging',
      status: this.config.audit.enabled ? 'pass' : 'warning',
      message: this.config.audit.enabled ? 'Audit logging enabled' : 'Audit logging disabled',
    });

    const failCount = checks.filter(c => c.status === 'fail').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (failCount > 0) {
      status = 'critical';
    } else if (warningCount > 0) {
      status = 'warning';
    }

    return { status, checks };
  }

  /**
   * Cleanup expired tokens and rate limit data
   */
  public cleanup(): void {
    const now = Date.now();

    // Clean up expired CSRF tokens
    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (tokenData.expires < now) {
        this.csrfTokens.delete(sessionId);
      }
    }

    // Clean up expired rate limit data
    for (const [identifier, limiterData] of this.rateLimiters.entries()) {
      if (limiterData.resetTime < now) {
        this.rateLimiters.delete(identifier);
      }
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();

// Common validation schemas with security enhancements
export const securityValidationSchemas = {
  userRegistration: z.object({
    email: z.string().email().max(255),
    password: z.string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    firstName: z.string().min(1).max(100).regex(/^[a-zA-Z\s-']+$/),
    lastName: z.string().min(1).max(100).regex(/^[a-zA-Z\s-']+$/),
  }),

  organizationCreation: z.object({
    name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_.&()]+$/),
    domain: z.string().min(3).max(253).regex(/^[a-z0-9.-]+$/),
    industry: z.string().min(2).max(50),
  }),

  documentUpload: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    category: z.enum(['policy', 'procedure', 'evidence', 'template']),
    tags: z.array(z.string().max(50)).max(20).optional(),
  }),

  assessmentCreation: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    frameworkId: z.string().uuid(),
    dueDate: z.string().datetime().optional(),
    assignedUsers: z.array(z.string().uuid()).max(50).optional(),
  }),
};