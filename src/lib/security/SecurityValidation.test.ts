/**
 * Security Implementation Validation Test
 * Quick validation to ensure all security components are working
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  initializeSecurity, 
  runQuickSecurityTest,
  getSecurityStatus,
  securityService,
  csrfProtection,
  enhancedRateLimit,
  rbacGuards,
  enhancedXSSProtection,
  securityHeaders,
  dataEncryption
} from './index';

describe('Security Layer Integration', () => {
  beforeAll(async () => {
    // Initialize security layer
    await initializeSecurity({
      enableAuditLogging: true,
      enableRateLimit: true,
      enableCSRF: true,
      enableEncryption: true
    });
  });

  it('should initialize all security components', async () => {
    const status = await getSecurityStatus();
    
    expect(status.version).toBeDefined();
    expect(status.overallHealth).toBeOneOf(['healthy', 'warning', 'critical']);
    expect(status.score).toBeGreaterThan(0);
    expect(status.components).toHaveProperty('encryption');
    expect(status.components).toHaveProperty('rateLimit');
    expect(status.components).toHaveProperty('csrf');
    expect(status.components).toHaveProperty('middleware');
  });

  it('should pass basic security tests', async () => {
    const testResults = await runQuickSecurityTest();
    
    expect(testResults.overallScore).toBeGreaterThan(70);
    expect(testResults.criticalIssues).toBeLessThan(3);
    expect(testResults.suites).toBeArray();
    expect(testResults.recommendations).toBeArray();
  });

  it('should validate CSRF protection', () => {
    const sessionId = 'test-session-123';
    const origin = 'https://test.com';
    
    // Generate token
    const token = csrfProtection.generateCSRFToken(sessionId, origin);
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
    
    // Validate token
    const validation = csrfProtection.validateCSRFToken(sessionId, token, origin);
    expect(validation.valid).toBe(true);
    
    // Reject invalid token
    const invalidValidation = csrfProtection.validateCSRFToken('wrong-session', token, origin);
    expect(invalidValidation.valid).toBe(false);
  });

  it('should validate rate limiting', () => {
    const identifier = 'test-rate-limit';
    
    // Allow initial requests
    const result1 = enhancedRateLimit.checkRateLimit(identifier, {
      windowMs: 60000,
      max: 5
    });
    expect(result1.allowed).toBe(true);
    
    // Block after limit exceeded
    for (let i = 0; i < 10; i++) {
      enhancedRateLimit.checkRateLimit(identifier, {
        windowMs: 60000,
        max: 5
      });
    }
    
    const resultAfterLimit = enhancedRateLimit.checkRateLimit(identifier, {
      windowMs: 60000,
      max: 5
    });
    expect(resultAfterLimit.allowed).toBe(false);
  });

  it('should validate XSS protection', () => {
    const maliciousScript = '<script>alert("XSS")</script>';
    const sanitized = enhancedXSSProtection.sanitizePlainText(maliciousScript);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  it('should validate encryption/decryption', async () => {
    const testData = 'This is sensitive test data';
    
    // Encrypt
    const encrypted = await dataEncryption.encryptData(testData);
    expect(encrypted.encryptedData).toBeDefined();
    expect(encrypted.encryptedData).not.toBe(testData);
    
    // Decrypt
    const decrypted = await dataEncryption.decryptData(encrypted);
    expect(decrypted.verified).toBe(true);
    expect(decrypted.decryptedData).toBe(testData);
  });

  it('should validate security headers', () => {
    const headerResult = securityHeaders.generateHeaders();
    const headers = headerResult.headers;
    
    expect(headers).toHaveProperty('Content-Security-Policy');
    expect(headers).toHaveProperty('X-Frame-Options');
    expect(headers).toHaveProperty('X-Content-Type-Options');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('should validate RBAC permissions', async () => {
    const testUser = {
      id: 'test-user-123',
      role: 'user' as const,
      organizationId: 'test-org-123'
    };
    
    const adminUser = {
      id: 'test-admin-123',
      role: 'super_admin' as const,
      organizationId: 'test-org-123'
    };
    
    // User can read documents
    const userCanRead = await rbacGuards.checkAccess(testUser, 'document:read');
    expect(userCanRead.granted).toBe(true);
    
    // User cannot delete organization
    const userCannotDelete = await rbacGuards.checkAccess(testUser, 'organization:delete');
    expect(userCannotDelete.granted).toBe(false);
    
    // Admin can delete organization
    const adminCanDelete = await rbacGuards.checkAccess(adminUser, 'organization:delete');
    expect(adminCanDelete.granted).toBe(true);
  });

  it('should validate audit logging', async () => {
    // Test security event logging
    const logPromise = securityService.logSecurityEvent({
      type: 'authentication_success',
      details: { test: 'security_validation' },
      timestamp: new Date(),
      severity: 'low'
    });
    
    expect(logPromise).resolves.not.toThrow();
    
    // Test health check
    const healthCheck = await securityService.performSecurityHealthCheck();
    expect(healthCheck.status).toBeOneOf(['healthy', 'warning', 'critical']);
    expect(healthCheck.checks).toBeArray();
  });
});