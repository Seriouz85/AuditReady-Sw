import { securityService } from './SecurityService';

export interface CSRFTokenData {
  token: string;
  sessionId: string;
  expires: number;
  origin: string;
  userAgent?: string;
}

export interface CSRFValidationResult {
  valid: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Comprehensive CSRF Protection System
 * Implements double-submit cookie pattern and additional security measures
 */
export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokens = new Map<string, CSRFTokenData>();
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_TOKENS_PER_SESSION = 10;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Generate a new CSRF token for a session
   */
  public generateToken(sessionId: string, origin: string, userAgent?: string): string {
    // Cleanup expired tokens for this session first
    this.cleanupSessionTokens(sessionId);

    // Check if session has too many tokens
    const sessionTokens = Array.from(this.tokens.values()).filter(
      token => token.sessionId === sessionId
    );

    if (sessionTokens.length >= this.MAX_TOKENS_PER_SESSION) {
      // Remove oldest token
      const oldestToken = sessionTokens.sort((a, b) => a.expires - b.expires)[0];
      for (const [key, value] of this.tokens.entries()) {
        if (value === oldestToken) {
          this.tokens.delete(key);
          break;
        }
      }
    }

    // Generate cryptographically secure token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');

    // Store token data
    const tokenData: CSRFTokenData = {
      token,
      sessionId,
      expires: Date.now() + this.TOKEN_EXPIRY,
      origin,
      userAgent,
    };

    this.tokens.set(token, tokenData);

    // Log token generation for audit
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'csrf_token_generated',
        sessionId,
        origin,
        tokenCount: this.tokens.size,
      },
      timestamp: new Date(),
      severity: 'low',
    });

    return token;
  }

  /**
   * Validate CSRF token with comprehensive security checks
   */
  public validateToken(
    token: string, 
    sessionId: string, 
    origin: string, 
    userAgent?: string,
    userId?: string
  ): CSRFValidationResult {
    // Basic validation
    if (!token || !sessionId || !origin) {
      this.logCSRFViolation('missing_parameters', { token: !!token, sessionId: !!sessionId, origin: !!origin }, userId);
      return { valid: false, reason: 'Missing required parameters', severity: 'medium' };
    }

    // Check token exists
    const tokenData = this.tokens.get(token);
    if (!tokenData) {
      this.logCSRFViolation('invalid_token', { token: token.substring(0, 8) + '...' }, userId);
      return { valid: false, reason: 'Invalid or expired token', severity: 'high' };
    }

    // Check token expiry
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      this.logCSRFViolation('token_expired', { 
        token: token.substring(0, 8) + '...', 
        expired: new Date(tokenData.expires).toISOString() 
      }, userId);
      return { valid: false, reason: 'Token expired', severity: 'medium' };
    }

    // Check session ID match
    if (tokenData.sessionId !== sessionId) {
      this.logCSRFViolation('session_mismatch', { 
        expectedSession: tokenData.sessionId,
        providedSession: sessionId,
        token: token.substring(0, 8) + '...'
      }, userId);
      return { valid: false, reason: 'Session mismatch', severity: 'high' };
    }

    // Check origin match (strict)
    if (tokenData.origin !== origin) {
      this.logCSRFViolation('origin_mismatch', { 
        expectedOrigin: tokenData.origin,
        providedOrigin: origin,
        token: token.substring(0, 8) + '...'
      }, userId);
      return { valid: false, reason: 'Origin mismatch', severity: 'critical' };
    }

    // Optional: Check User-Agent consistency (helps detect some attacks)
    if (tokenData.userAgent && userAgent && tokenData.userAgent !== userAgent) {
      this.logCSRFViolation('user_agent_mismatch', { 
        token: token.substring(0, 8) + '...',
        userAgentChanged: true
      }, userId);
      // Don't fail validation but log as suspicious
    }

    // Token is valid
    securityService.logSecurityEvent({
      type: 'authentication_success',
      userId,
      details: {
        action: 'csrf_token_validated',
        sessionId,
        origin,
        token: token.substring(0, 8) + '...',
      },
      timestamp: new Date(),
      severity: 'low',
    });

    return { valid: true };
  }

  /**
   * Invalidate a specific token
   */
  public invalidateToken(token: string, userId?: string): boolean {
    const tokenData = this.tokens.get(token);
    if (tokenData) {
      this.tokens.delete(token);
      
      securityService.logSecurityEvent({
        type: 'security_configuration_change',
        userId,
        details: {
          action: 'csrf_token_invalidated',
          sessionId: tokenData.sessionId,
          token: token.substring(0, 8) + '...',
        },
        timestamp: new Date(),
        severity: 'low',
      });
      
      return true;
    }
    return false;
  }

  /**
   * Invalidate all tokens for a session
   */
  public invalidateSessionTokens(sessionId: string, userId?: string): number {
    let invalidatedCount = 0;
    
    for (const [token, tokenData] of this.tokens.entries()) {
      if (tokenData.sessionId === sessionId) {
        this.tokens.delete(token);
        invalidatedCount++;
      }
    }

    if (invalidatedCount > 0) {
      securityService.logSecurityEvent({
        type: 'security_configuration_change',
        userId,
        details: {
          action: 'csrf_session_tokens_invalidated',
          sessionId,
          count: invalidatedCount,
        },
        timestamp: new Date(),
        severity: 'low',
      });
    }

    return invalidatedCount;
  }

  /**
   * Get CSRF token for embedding in forms/requests
   */
  public getTokenForSession(sessionId: string): string | null {
    for (const [token, tokenData] of this.tokens.entries()) {
      if (tokenData.sessionId === sessionId && Date.now() < tokenData.expires) {
        return token;
      }
    }
    return null;
  }

  /**
   * Generate HTML meta tag for CSRF token
   */
  public generateMetaTag(token: string): string {
    return `<meta name="csrf-token" content="${token}">`;
  }

  /**
   * Generate hidden form field for CSRF token
   */
  public generateFormField(token: string, fieldName: string = '_csrf_token'): string {
    return `<input type="hidden" name="${fieldName}" value="${token}">`;
  }

  /**
   * Validate request headers for CSRF protection
   */
  public validateRequestHeaders(headers: Record<string, string>, token: string): boolean {
    // Check for custom header (helps prevent CSRF from forms)
    const customHeader = headers['x-csrf-token'] || headers['X-CSRF-Token'];
    if (customHeader !== token) {
      return false;
    }

    // Validate Content-Type for state-changing requests
    const contentType = headers['content-type'] || headers['Content-Type'];
    if (contentType && !this.isAllowedContentType(contentType)) {
      return false;
    }

    return true;
  }

  /**
   * Check if Content-Type is allowed for CSRF-protected requests
   */
  private isAllowedContentType(contentType: string): boolean {
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ];

    return allowedTypes.some(allowed => 
      contentType.toLowerCase().startsWith(allowed.toLowerCase())
    );
  }

  /**
   * Log CSRF violation for security monitoring
   */
  private logCSRFViolation(reason: string, details: Record<string, any>, userId?: string): void {
    securityService.logSecurityEvent({
      type: 'csrf_violation',
      userId,
      details: {
        reason,
        ...details,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      severity: reason === 'origin_mismatch' ? 'critical' : 'high',
    });
  }

  /**
   * Clean up expired tokens for a specific session
   */
  private cleanupSessionTokens(sessionId: string): void {
    const now = Date.now();
    for (const [token, tokenData] of this.tokens.entries()) {
      if (tokenData.sessionId === sessionId && now > tokenData.expires) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Clean up all expired tokens
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expires) {
        this.tokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'csrf_token_cleanup',
          cleanedCount,
          remainingCount: this.tokens.size,
        },
        timestamp: new Date(),
        severity: 'low',
      });
    }
  }

  /**
   * Get security statistics
   */
  public getStatistics(): {
    totalTokens: number;
    expiredTokens: number;
    tokensPerSession: Record<string, number>;
    oldestToken?: Date;
    newestToken?: Date;
  } {
    const now = Date.now();
    let expiredCount = 0;
    const sessionsCount: Record<string, number> = {};
    let oldestExpiry = Infinity;
    let newestExpiry = 0;

    for (const tokenData of this.tokens.values()) {
      if (now > tokenData.expires) {
        expiredCount++;
      }

      sessionsCount[tokenData.sessionId] = (sessionsCount[tokenData.sessionId] || 0) + 1;
      
      if (tokenData.expires < oldestExpiry) {
        oldestExpiry = tokenData.expires;
      }
      if (tokenData.expires > newestExpiry) {
        newestExpiry = tokenData.expires;
      }
    }

    return {
      totalTokens: this.tokens.size,
      expiredTokens: expiredCount,
      tokensPerSession: sessionsCount,
      oldestToken: oldestExpiry !== Infinity ? new Date(oldestExpiry) : undefined,
      newestToken: newestExpiry !== 0 ? new Date(newestExpiry) : undefined,
    };
  }

  /**
   * Force cleanup all tokens (for testing/admin purposes)
   */
  public clearAllTokens(userId?: string): number {
    const count = this.tokens.size;
    this.tokens.clear();

    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      userId,
      details: {
        action: 'csrf_all_tokens_cleared',
        count,
      },
      timestamp: new Date(),
      severity: 'medium',
    });

    return count;
  }
}

// React Hook for CSRF token management
export const useCSRFToken = () => {
  const csrf = CSRFProtection.getInstance();

  const generateToken = (sessionId: string, origin: string = window.location.origin) => {
    return csrf.generateToken(sessionId, origin, navigator.userAgent);
  };

  const validateToken = (token: string, sessionId: string, userId?: string) => {
    return csrf.validateToken(
      token, 
      sessionId, 
      window.location.origin, 
      navigator.userAgent, 
      userId
    );
  };

  const getTokenForSession = (sessionId: string) => {
    return csrf.getTokenForSession(sessionId);
  };

  const invalidateToken = (token: string, userId?: string) => {
    return csrf.invalidateToken(token, userId);
  };

  return {
    generateToken,
    validateToken,
    getTokenForSession,
    invalidateToken,
  };
};

// Middleware function for API routes
export const csrfMiddleware = (
  token: string,
  sessionId: string,
  headers: Record<string, string>,
  userId?: string
): CSRFValidationResult => {
  const csrf = CSRFProtection.getInstance();
  const origin = headers['origin'] || headers['referer'];
  
  if (!origin) {
    return { valid: false, reason: 'Missing origin header', severity: 'high' };
  }

  // Validate token
  const tokenValidation = csrf.validateToken(token, sessionId, origin, headers['user-agent'], userId);
  if (!tokenValidation.valid) {
    return tokenValidation;
  }

  // Validate headers
  if (!csrf.validateRequestHeaders(headers, token)) {
    return { valid: false, reason: 'Invalid request headers', severity: 'high' };
  }

  return { valid: true };
};

export const csrfProtection = CSRFProtection.getInstance();