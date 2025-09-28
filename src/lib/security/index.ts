// Import for internal use
import { securityService } from './SecurityService';
import { dataEncryption } from './DataEncryption';
import { enhancedRateLimit } from './EnhancedRateLimit';
import { csrfProtection } from './CSRFProtection';
import { securityHeaders } from './SecurityHeaders';
import { securityMiddleware } from './SecurityMiddleware';
import { securityTesting } from './SecurityTesting';

/**
 * Security Layer Integration - Comprehensive Defense in Depth
 * 
 * This module integrates all security components following OWASP Top 10 guidelines:
 * 
 * OWASP A01: Broken Access Control
 * - RBAC Permission Guards with role hierarchy
 * - Resource-based access control
 * - Session management and validation
 * 
 * OWASP A02: Cryptographic Failures  
 * - AES-GCM encryption with key rotation
 * - Secure key management and storage
 * - Data integrity verification
 * 
 * OWASP A03: Injection
 * - Input validation with Zod schemas
 * - SQL injection prevention
 * - Command injection protection
 * - XSS sanitization with DOMPurify
 * 
 * OWASP A04: Insecure Design
 * - Secure file upload validation
 * - Content type verification
 * - Path traversal prevention
 * 
 * OWASP A05: Security Misconfiguration
 * - Comprehensive security headers
 * - Content Security Policy enforcement
 * - CSRF protection with double-submit cookies
 * 
 * OWASP A06: Vulnerable Components
 * - Component security scanning
 * - Dependency vulnerability monitoring
 * 
 * OWASP A07: Authentication Failures
 * - Adaptive rate limiting with attack detection
 * - Brute force protection
 * - Session security
 * 
 * OWASP A08: Software Integrity Failures
 * - Content integrity verification
 * - Hash-based validation
 * 
 * OWASP A09: Security Logging Failures
 * - Comprehensive audit logging
 * - Security event monitoring
 * - Real-time alerting
 * 
 * OWASP A10: Server-Side Request Forgery
 * - URL validation and whitelisting
 * - Private IP blocking
 * - Protocol restriction
 */

// Core Security Service
export { 
  securityService, 
  SecurityService,
  type SecurityEvent,
  type SecurityEventType,
  type SecurityConfig
} from './SecurityService';

// Authentication & Authorization
export {
  rbacGuards,
  RBACGuards,
  type UserContext,
  type ResourceContext,
  type Permission,
  type Role,
  type AccessResult,
  usePermissions
} from './RBACGuards';

// Permission Guards & Components
export {
  EnhancedPermissionGuard,
  RoleGuard,
  AdminGuard,
  OwnerGuard,
  OrganizationGuard,
  SecureButton,
  useEnhancedPermissions
} from './EnhancedPermissionGuard';

// CSRF Protection
export {
  csrfProtection,
  CSRFProtection,
  useCSRFToken,
  csrfMiddleware,
  type CSRFTokenData,
  type CSRFValidationResult
} from './CSRFProtection';

// XSS Protection
export {
  enhancedXSSProtection,
  EnhancedXSSProtection
} from './EnhancedXSSProtection';

// Rate Limiting
export {
  enhancedRateLimit,
  EnhancedRateLimit,
  loginRateLimit,
  apiRateLimit,
  uploadRateLimit,
  passwordResetRateLimit,
  createRateLimit,
  rateLimitMiddleware,
  type RateLimitConfig,
  type RateLimitResult,
  type RequestMetrics
} from './EnhancedRateLimit';

// Security Headers
export {
  securityHeaders,
  SecurityHeaders,
  getSecurityHeaders,
  applySecurityHeaders,
  getViteSecurityHeaders,
  type SecurityHeadersConfig,
  type SecurityHeadersResult
} from './SecurityHeaders';

// Content Security Policy
export {
  getCSPDirectives,
  generateNonce,
  applyCSP,
  getSecurityHeaders as getCSPHeaders
} from './csp';

// Data Encryption
export {
  dataEncryption,
  DataEncryption,
  encryptSensitiveField,
  decryptSensitiveField,
  type EncryptionConfig,
  type EncryptionResult,
  type DecryptionResult,
  type KeyRotationConfig,
  type EncryptionKey
} from './DataEncryption';

// Security Middleware
export {
  securityMiddleware,
  SecurityMiddleware,
  createSecurityMiddleware,
  type SecurityMiddlewareConfig,
  type SecurityContext,
  type SecurityResult
} from './SecurityMiddleware';

// Security Testing
export {
  securityTesting,
  SecurityTesting,
  type SecurityTestResult,
  type SecurityTestSuite
} from './SecurityTesting';

// Input Validation & Sanitization
export {
  sanitizeHtml,
  sanitizeString,
  emailSchema,
  passwordSchema,
  uuidSchema,
  slugSchema,
  organizationNameSchema,
  validateFileType,
  validateFileSize,
  validateFileName,
  validateUrl,
  RateLimiter,
  validateJWTStructure,
  generateCSRFToken,
  validateCSRFToken,
  escapeSQLIdentifier,
  escapeHtml,
  createDocumentSchema,
  createAssessmentSchema,
  updateRequirementStatusSchema,
  validationSchemas
} from './validation';

// Legacy HTML Sanitizer (for compatibility)
export {
  sanitizeRichText,
  stripHtml,
  escapeHtml as escapeHtmlLegacy
} from './htmlSanitizer';

/**
 * Security Layer Initialization
 * Call this function to initialize all security components
 */
export const initializeSecurity = async (config?: {
  enableAuditLogging?: boolean;
  enableRateLimit?: boolean;
  enableCSRF?: boolean;
  enableEncryption?: boolean;
}) => {
  const defaultConfig = {
    enableAuditLogging: true,
    enableRateLimit: true,
    enableCSRF: true,
    enableEncryption: true,
    ...config
  };

  console.log('🔒 Initializing Security Layer...');

  try {
    // Initialize core security service
    const healthCheck = await securityService.performSecurityHealthCheck();
    console.log(`✅ Security Service Health: ${healthCheck.status}`);

    // Initialize encryption if enabled
    if (defaultConfig.enableEncryption) {
      const encryptionStats = dataEncryption.getEncryptionStats();
      console.log(`🔐 Encryption Service: ${encryptionStats.activeKeys} active keys`);
    }

    // Initialize rate limiting if enabled
    if (defaultConfig.enableRateLimit) {
      const rateLimitMetrics = enhancedRateLimit.getMetrics();
      console.log(`⏱️ Rate Limiting: ${rateLimitMetrics.totalRequests} requests processed`);
    }

    // Initialize CSRF protection if enabled
    if (defaultConfig.enableCSRF) {
      const csrfStats = csrfProtection.getStatistics();
      console.log(`🛡️ CSRF Protection: ${csrfStats.totalTokens} tokens active`);
    }

    // Initialize security headers
    const headerResult = securityHeaders.generateHeaders();
    console.log(`📋 Security Headers: ${Object.keys(headerResult.headers).length} headers configured`);

    // Get overall security middleware health
    const middlewareHealth = await securityMiddleware.getSecurityHealth();
    console.log(`🔍 Security Middleware: ${middlewareHealth.status} (${middlewareHealth.overallScore}% score)`);

    // Log successful initialization
    await securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_layer_initialized',
        config: defaultConfig,
        healthStatus: healthCheck.status,
        middlewareScore: middlewareHealth.overallScore
      },
      timestamp: new Date(),
      severity: 'low'
    });

    console.log('✅ Security Layer Initialized Successfully');
    
    return {
      status: 'success',
      healthCheck,
      middlewareHealth,
      config: defaultConfig
    };

  } catch (error) {
    console.error('❌ Security Layer Initialization Failed:', error);
    
    await securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_layer_initialization_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        config: defaultConfig
      },
      timestamp: new Date(),
      severity: 'critical'
    });

    throw error;
  }
};

/**
 * Quick Security Test
 * Run basic security tests to verify implementation
 */
export const runQuickSecurityTest = async () => {
  console.log('🧪 Running Quick Security Test...');
  
  try {
    const testResults = await securityTesting.runFullSecurityTest();
    
    console.log(`📊 Security Test Results:`);
    console.log(`   Overall Score: ${testResults.overallScore}%`);
    console.log(`   Critical Issues: ${testResults.criticalIssues}`);
    console.log(`   High Issues: ${testResults.highIssues}`);
    
    if (testResults.criticalIssues > 0) {
      console.error('❌ CRITICAL SECURITY ISSUES FOUND - DO NOT DEPLOY TO PRODUCTION');
      testResults.recommendations.forEach((rec: string) => console.warn(`   ${rec}`));
    } else {
      console.log('✅ No critical security issues found');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Security test failed:', error);
    throw error;
  }
};

/**
 * Security Configuration Presets
 */
export const securityPresets = {
  // Development environment - more lenient for debugging
  development: {
    csrf: { enabled: true, excludePaths: ['/api/dev/', '/health'] },
    rateLimit: { enabled: true, rules: { default: { max: 1000, windowMs: 60000 } } },
    rbac: { enabled: true, requireAuth: false },
    xss: { enabled: true, sanitizeInput: true },
    headers: { enabled: true },
    audit: { enabled: true, logAllRequests: true },
    encryption: { enabled: true, encryptResponses: false }
  },

  // Staging environment - production-like with additional logging
  staging: {
    csrf: { enabled: true, excludePaths: ['/health'] },
    rateLimit: { enabled: true, rules: { default: { max: 500, windowMs: 60000 } } },
    rbac: { enabled: true, requireAuth: true },
    xss: { enabled: true, sanitizeInput: true },
    headers: { enabled: true },
    audit: { enabled: true, logAllRequests: true },
    encryption: { enabled: true, encryptResponses: true }
  },

  // Production environment - maximum security
  production: {
    csrf: { enabled: true, excludePaths: ['/health', '/metrics'] },
    rateLimit: { enabled: true, rules: { 
      '/api/auth/login': { max: 5, windowMs: 900000 }, // 15 min
      '/api/auth/register': { max: 3, windowMs: 3600000 }, // 1 hour
      default: { max: 100, windowMs: 60000 } // 1 min
    }},
    rbac: { enabled: true, requireAuth: true },
    xss: { enabled: true, sanitizeInput: true },
    headers: { enabled: true },
    audit: { enabled: true, logAllRequests: false },
    encryption: { enabled: true, encryptResponses: true }
  }
};

/**
 * Apply security preset based on environment
 */
export const applySecurityPreset = (environment: keyof typeof securityPresets) => {
  const preset = securityPresets[environment];
  if (!preset) {
    throw new Error(`Unknown security preset: ${environment}`);
  }

  securityMiddleware.updateConfig(preset);
  console.log(`🔧 Applied ${environment} security preset`);
  
  return preset;
};

// Export current version for tracking
export const SECURITY_LAYER_VERSION = '1.0.0';

// Export security status check
export const getSecurityStatus = async () => {
  const health = await securityMiddleware.getSecurityHealth();
  const encryptionStats = dataEncryption.getEncryptionStats();
  const rateLimitMetrics = enhancedRateLimit.getMetrics();
  const csrfStats = csrfProtection.getStatistics();

  return {
    version: SECURITY_LAYER_VERSION,
    timestamp: new Date().toISOString(),
    overallHealth: health.status,
    score: health.overallScore,
    components: {
      encryption: {
        status: encryptionStats.activeKeys > 0 ? 'healthy' : 'critical',
        activeKeys: encryptionStats.activeKeys,
        totalKeys: encryptionStats.totalKeys
      },
      rateLimit: {
        status: 'healthy',
        totalRequests: rateLimitMetrics.totalRequests,
        blockedRequests: rateLimitMetrics.blockedRequests,
        uniqueIps: rateLimitMetrics.uniqueIps
      },
      csrf: {
        status: 'healthy',
        totalTokens: csrfStats.totalTokens,
        expiredTokens: csrfStats.expiredTokens
      },
      middleware: health
    }
  };
};