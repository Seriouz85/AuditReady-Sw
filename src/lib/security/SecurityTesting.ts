import { securityService } from './SecurityService';
import { csrfProtection } from './CSRFProtection';
import { enhancedRateLimit } from './EnhancedRateLimit';
import { rbacGuards, UserContext } from './RBACGuards';
import { enhancedXSSProtection } from './EnhancedXSSProtection';
import { securityHeaders } from './SecurityHeaders';
import { dataEncryption } from './DataEncryption';
import { securityMiddleware } from './SecurityMiddleware';

export interface SecurityTestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityTestSuite {
  name: string;
  description: string;
  tests: SecurityTestResult[];
  overallScore: number;
  passed: number;
  failed: number;
}

/**
 * Comprehensive Security Testing Suite
 * Validates all security implementations and identifies vulnerabilities
 */
export class SecurityTesting {
  private static instance: SecurityTesting;

  private constructor() {}

  public static getInstance(): SecurityTesting {
    if (!SecurityTesting.instance) {
      SecurityTesting.instance = new SecurityTesting();
    }
    return SecurityTesting.instance;
  }

  /**
   * Run comprehensive security test suite
   */
  public async runFullSecurityTest(): Promise<{
    suites: SecurityTestSuite[];
    overallScore: number;
    criticalIssues: number;
    highIssues: number;
    recommendations: string[];
  }> {
    const suites: SecurityTestSuite[] = [];

    // Run all test suites
    suites.push(await this.testCSRFProtection());
    suites.push(await this.testRateLimiting());
    suites.push(await this.testRBACPermissions());
    suites.push(await this.testXSSProtection());
    suites.push(await this.testSecurityHeaders());
    suites.push(await this.testDataEncryption());
    suites.push(await this.testSecurityMiddleware());
    suites.push(await this.testInputValidation());
    suites.push(await this.testAuditLogging());

    // Calculate overall statistics
    const allTests = suites.flatMap(suite => suite.tests);
    const passedTests = allTests.filter(test => test.passed);
    const overallScore = Math.round((passedTests.length / allTests.length) * 100);
    
    const criticalIssues = allTests.filter(test => !test.passed && test.severity === 'critical').length;
    const highIssues = allTests.filter(test => !test.passed && test.severity === 'high').length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(allTests);

    // Log security test execution
    await securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_test_suite_executed',
        overallScore,
        totalTests: allTests.length,
        passedTests: passedTests.length,
        criticalIssues,
        highIssues,
      },
      timestamp: new Date(),
      severity: criticalIssues > 0 ? 'critical' : highIssues > 0 ? 'high' : 'low',
    });

    return {
      suites,
      overallScore,
      criticalIssues,
      highIssues,
      recommendations,
    };
  }

  /**
   * Test CSRF Protection
   */
  private async testCSRFProtection(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test token generation
      const sessionId = 'test-session-123';
      const origin = 'https://example.com';
      const token = csrfProtection.generateCSRFToken(sessionId, origin);
      
      tests.push({
        testName: 'CSRF Token Generation',
        passed: token && token.length > 0,
        message: token ? 'CSRF tokens can be generated' : 'CSRF token generation failed',
        severity: 'high',
      });

      // Test token validation
      const isValid = csrfProtection.validateCSRFToken(sessionId, token, origin);
      tests.push({
        testName: 'CSRF Token Validation',
        passed: isValid.valid,
        message: isValid.valid ? 'CSRF tokens validate correctly' : `CSRF validation failed: ${isValid.reason}`,
        severity: 'critical',
      });

      // Test token rejection for wrong session
      const invalidValidation = csrfProtection.validateCSRFToken('wrong-session', token, origin);
      tests.push({
        testName: 'CSRF Token Session Validation',
        passed: !invalidValidation.valid,
        message: !invalidValidation.valid ? 'CSRF correctly rejects wrong session' : 'CSRF accepts wrong session - SECURITY ISSUE',
        severity: 'critical',
      });

      // Test token rejection for wrong origin
      const wrongOriginValidation = csrfProtection.validateCSRFToken(sessionId, token, 'https://evil.com');
      tests.push({
        testName: 'CSRF Token Origin Validation',
        passed: !wrongOriginValidation.valid,
        message: !wrongOriginValidation.valid ? 'CSRF correctly rejects wrong origin' : 'CSRF accepts wrong origin - SECURITY ISSUE',
        severity: 'critical',
      });

    } catch (error) {
      tests.push({
        testName: 'CSRF Protection Error Handling',
        passed: false,
        message: `CSRF protection threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('CSRF Protection', 'Cross-Site Request Forgery protection tests', tests);
  }

  /**
   * Test Rate Limiting
   */
  private async testRateLimiting(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      const testIdentifier = 'test-rate-limit-ip';
      
      // Test rate limit allows initial requests
      const result1 = enhancedRateLimit.checkRateLimit(testIdentifier, {
        windowMs: 60000,
        max: 5,
      });
      
      tests.push({
        testName: 'Rate Limit Initial Request',
        passed: result1.allowed,
        message: result1.allowed ? 'Initial requests are allowed' : 'Initial request blocked unexpectedly',
        severity: 'medium',
      });

      // Test rate limit blocks after limit exceeded
      for (let i = 0; i < 10; i++) {
        enhancedRateLimit.checkRateLimit(testIdentifier, {
          windowMs: 60000,
          max: 5,
        });
      }

      const resultAfterLimit = enhancedRateLimit.checkRateLimit(testIdentifier, {
        windowMs: 60000,
        max: 5,
      });

      tests.push({
        testName: 'Rate Limit Enforcement',
        passed: !resultAfterLimit.allowed,
        message: !resultAfterLimit.allowed ? 'Rate limit correctly blocks excess requests' : 'Rate limit not enforcing - SECURITY ISSUE',
        severity: 'high',
      });

      // Test rate limit metrics
      const metrics = enhancedRateLimit.getMetrics();
      tests.push({
        testName: 'Rate Limit Metrics',
        passed: metrics.totalRequests > 0,
        message: `Rate limit metrics: ${metrics.totalRequests} total requests, ${metrics.blockedRequests} blocked`,
        severity: 'low',
      });

    } catch (error) {
      tests.push({
        testName: 'Rate Limiting Error Handling',
        passed: false,
        message: `Rate limiting threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('Rate Limiting', 'Request rate limiting protection tests', tests);
  }

  /**
   * Test RBAC Permissions
   */
  private async testRBACPermissions(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test user context creation
      const testUser: UserContext = {
        id: 'test-user-123',
        role: 'user',
        organizationId: 'test-org-123',
      };

      const adminUser: UserContext = {
        id: 'test-admin-123',
        role: 'super_admin',
        organizationId: 'test-org-123',
      };

      // Test basic permission check
      const userCanRead = await rbacGuards.checkAccess(testUser, 'document:read');
      tests.push({
        testName: 'Basic Permission Check',
        passed: userCanRead.granted,
        message: userCanRead.granted ? 'Users can read documents' : 'User permission check failed',
        severity: 'medium',
      });

      // Test admin permission check
      const adminCanDelete = await rbacGuards.checkAccess(adminUser, 'organization:delete');
      tests.push({
        testName: 'Admin Permission Check',
        passed: adminCanDelete.granted,
        message: adminCanDelete.granted ? 'Admins have elevated permissions' : 'Admin permission check failed',
        severity: 'medium',
      });

      // Test permission denial
      const userCannotDelete = await rbacGuards.checkAccess(testUser, 'organization:delete');
      tests.push({
        testName: 'Permission Denial',
        passed: !userCannotDelete.granted,
        message: !userCannotDelete.granted ? 'Users correctly denied admin permissions' : 'User granted admin permission - SECURITY ISSUE',
        severity: 'critical',
      });

      // Test role hierarchy
      const hasRole = rbacGuards.hasRole(adminUser, 'user');
      tests.push({
        testName: 'Role Hierarchy',
        passed: hasRole,
        message: hasRole ? 'Role hierarchy working correctly' : 'Role hierarchy not working',
        severity: 'medium',
      });

    } catch (error) {
      tests.push({
        testName: 'RBAC Error Handling',
        passed: false,
        message: `RBAC threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('RBAC Permissions', 'Role-based access control tests', tests);
  }

  /**
   * Test XSS Protection
   */
  private async testXSSProtection(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test basic XSS prevention
      const maliciousScript = '<script>alert("XSS")</script>';
      const sanitized = enhancedXSSProtection.sanitizePlainText(maliciousScript);
      
      tests.push({
        testName: 'Basic XSS Prevention',
        passed: !sanitized.includes('<script>'),
        message: !sanitized.includes('<script>') ? 'Script tags removed successfully' : 'Script tags not removed - XSS VULNERABILITY',
        details: { original: maliciousScript, sanitized },
        severity: 'critical',
      });

      // Test JavaScript URL prevention
      const jsUrl = 'javascript:alert("XSS")';
      const sanitizedUrl = enhancedXSSProtection.sanitizePlainText(jsUrl);
      
      tests.push({
        testName: 'JavaScript URL Prevention',
        passed: !sanitizedUrl.includes('javascript:'),
        message: !sanitizedUrl.includes('javascript:') ? 'JavaScript URLs blocked' : 'JavaScript URLs not blocked - XSS VULNERABILITY',
        severity: 'critical',
      });

      // Test HTML injection prevention
      const htmlInjection = '<img src="x" onerror="alert(1)">';
      const sanitizedHtml = enhancedXSSProtection.sanitizeRichText(htmlInjection);
      
      tests.push({
        testName: 'HTML Injection Prevention',
        passed: !sanitizedHtml.includes('onerror'),
        message: !sanitizedHtml.includes('onerror') ? 'Event handlers removed' : 'Event handlers not removed - XSS VULNERABILITY',
        severity: 'critical',
      });

      // Test legitimate content preservation
      const legitimateContent = '<p>This is <strong>legitimate</strong> content</p>';
      const sanitizedLegitimate = enhancedXSSProtection.sanitizeRichText(legitimateContent);
      
      tests.push({
        testName: 'Legitimate Content Preservation',
        passed: sanitizedLegitimate.includes('<strong>'),
        message: sanitizedLegitimate.includes('<strong>') ? 'Legitimate HTML preserved' : 'Legitimate content incorrectly removed',
        severity: 'medium',
      });

    } catch (error) {
      tests.push({
        testName: 'XSS Protection Error Handling',
        passed: false,
        message: `XSS protection threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('XSS Protection', 'Cross-site scripting prevention tests', tests);
  }

  /**
   * Test Security Headers
   */
  private async testSecurityHeaders(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      const headerResult = securityHeaders.generateHeaders();
      const headers = headerResult.headers;

      // Test CSP header
      tests.push({
        testName: 'Content Security Policy',
        passed: !!(headers['Content-Security-Policy'] || headers['Content-Security-Policy-Report-Only']),
        message: headers['Content-Security-Policy'] ? 'CSP header present' : 'CSP header missing',
        severity: 'high',
      });

      // Test X-Frame-Options
      tests.push({
        testName: 'X-Frame-Options Header',
        passed: !!headers['X-Frame-Options'],
        message: headers['X-Frame-Options'] ? 'X-Frame-Options header present' : 'X-Frame-Options header missing',
        severity: 'medium',
      });

      // Test X-Content-Type-Options
      tests.push({
        testName: 'X-Content-Type-Options Header',
        passed: headers['X-Content-Type-Options'] === 'nosniff',
        message: headers['X-Content-Type-Options'] === 'nosniff' ? 'X-Content-Type-Options correct' : 'X-Content-Type-Options missing or incorrect',
        severity: 'medium',
      });

      // Test Referrer Policy
      tests.push({
        testName: 'Referrer Policy Header',
        passed: !!headers['Referrer-Policy'],
        message: headers['Referrer-Policy'] ? 'Referrer-Policy header present' : 'Referrer-Policy header missing',
        severity: 'low',
      });

      // Test header audit
      const audit = securityHeaders.auditHeaders(headers);
      tests.push({
        testName: 'Security Headers Audit',
        passed: audit.score >= 80,
        message: `Security headers score: ${audit.score}%. ${audit.issues.length} issues found.`,
        details: audit,
        severity: audit.score < 60 ? 'high' : audit.score < 80 ? 'medium' : 'low',
      });

    } catch (error) {
      tests.push({
        testName: 'Security Headers Error Handling',
        passed: false,
        message: `Security headers threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('Security Headers', 'HTTP security headers tests', tests);
  }

  /**
   * Test Data Encryption
   */
  private async testDataEncryption(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      const testData = 'This is sensitive test data that should be encrypted';

      // Test encryption
      const encryptionResult = await dataEncryption.encryptData(testData);
      tests.push({
        testName: 'Data Encryption',
        passed: !!encryptionResult.encryptedData && encryptionResult.encryptedData !== testData,
        message: encryptionResult.encryptedData ? 'Data encrypted successfully' : 'Data encryption failed',
        severity: 'critical',
      });

      // Test decryption
      const decryptionResult = await dataEncryption.decryptData(encryptionResult);
      tests.push({
        testName: 'Data Decryption',
        passed: decryptionResult.verified && decryptionResult.decryptedData === testData,
        message: decryptionResult.verified ? 'Data decrypted successfully' : 'Data decryption failed',
        severity: 'critical',
      });

      // Test encryption with invalid key
      const invalidEncryption = { ...encryptionResult, keyId: 'invalid-key-id' };
      const invalidDecryption = await dataEncryption.decryptData(invalidEncryption);
      tests.push({
        testName: 'Invalid Key Rejection',
        passed: !invalidDecryption.verified,
        message: !invalidDecryption.verified ? 'Invalid keys correctly rejected' : 'Invalid keys accepted - SECURITY ISSUE',
        severity: 'critical',
      });

      // Test object encryption
      const testObject = { username: 'testuser', email: 'test@example.com' };
      const objectEncryption = await dataEncryption.encryptObject(testObject);
      const objectDecryption = await dataEncryption.decryptObject(objectEncryption);
      
      tests.push({
        testName: 'Object Encryption/Decryption',
        passed: objectDecryption.verified && JSON.stringify(objectDecryption.data) === JSON.stringify(testObject),
        message: objectDecryption.verified ? 'Object encryption working correctly' : 'Object encryption failed',
        severity: 'high',
      });

      // Test encryption statistics
      const stats = dataEncryption.getEncryptionStats();
      tests.push({
        testName: 'Encryption Key Management',
        passed: stats.activeKeys > 0 && !!stats.activeKeyId,
        message: `${stats.activeKeys} active keys, ${stats.totalKeys} total keys`,
        details: stats,
        severity: 'medium',
      });

    } catch (error) {
      tests.push({
        testName: 'Encryption Error Handling',
        passed: false,
        message: `Encryption threw error: ${error.message}`,
        severity: 'critical',
      });
    }

    return this.createTestSuite('Data Encryption', 'Data encryption and decryption tests', tests);
  }

  /**
   * Test Security Middleware
   */
  private async testSecurityMiddleware(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test middleware health check
      const health = await securityMiddleware.getSecurityHealth();
      tests.push({
        testName: 'Security Middleware Health',
        passed: health.status !== 'critical',
        message: `Security middleware status: ${health.status} (${health.overallScore}%)`,
        details: health,
        severity: health.status === 'critical' ? 'critical' : health.status === 'warning' ? 'medium' : 'low',
      });

      // Test configuration validation
      const config = securityMiddleware.getConfig();
      const enabledFeatures = Object.values(config).filter(section => 
        typeof section === 'object' && section.enabled
      ).length;
      
      tests.push({
        testName: 'Security Features Configuration',
        passed: enabledFeatures >= 5,
        message: `${enabledFeatures} security features enabled`,
        details: config,
        severity: enabledFeatures < 3 ? 'high' : enabledFeatures < 5 ? 'medium' : 'low',
      });

    } catch (error) {
      tests.push({
        testName: 'Security Middleware Error Handling',
        passed: false,
        message: `Security middleware threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('Security Middleware', 'Security middleware integration tests', tests);
  }

  /**
   * Test Input Validation
   */
  private async testInputValidation(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test SQL injection prevention
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitizedSql = await securityService.validateAndSanitizeInput(
        { input: sqlInjection },
        { input: { type: 'string' } } as any
      );
      
      tests.push({
        testName: 'SQL Injection Prevention',
        passed: !sanitizedSql.input.includes('DROP TABLE'),
        message: !sanitizedSql.input.includes('DROP TABLE') ? 'SQL injection attempts sanitized' : 'SQL injection not prevented - VULNERABILITY',
        severity: 'critical',
      });

      // Test command injection prevention
      const commandInjection = "test; rm -rf /";
      const sanitizedCommand = await securityService.validateAndSanitizeInput(
        { command: commandInjection },
        { command: { type: 'string' } } as any
      );
      
      tests.push({
        testName: 'Command Injection Prevention',
        passed: !sanitizedCommand.command.includes('rm -rf'),
        message: !sanitizedCommand.command.includes('rm -rf') ? 'Command injection attempts sanitized' : 'Command injection not prevented - VULNERABILITY',
        severity: 'critical',
      });

    } catch (error) {
      tests.push({
        testName: 'Input Validation Error Handling',
        passed: false,
        message: `Input validation threw error: ${error.message}`,
        severity: 'high',
      });
    }

    return this.createTestSuite('Input Validation', 'Input validation and sanitization tests', tests);
  }

  /**
   * Test Audit Logging
   */
  private async testAuditLogging(): Promise<SecurityTestSuite> {
    const tests: SecurityTestResult[] = [];

    try {
      // Test security event logging
      await securityService.logSecurityEvent({
        type: 'authentication_success',
        details: { test: 'security_testing' },
        timestamp: new Date(),
        severity: 'low',
      });

      tests.push({
        testName: 'Security Event Logging',
        passed: true,
        message: 'Security events can be logged',
        severity: 'low',
      });

      // Test security health check
      const healthCheck = await securityService.performSecurityHealthCheck();
      tests.push({
        testName: 'Security Health Check',
        passed: healthCheck.status !== 'critical',
        message: `Security health status: ${healthCheck.status}`,
        details: healthCheck,
        severity: healthCheck.status === 'critical' ? 'high' : 'low',
      });

    } catch (error) {
      tests.push({
        testName: 'Audit Logging Error Handling',
        passed: false,
        message: `Audit logging threw error: ${error.message}`,
        severity: 'medium',
      });
    }

    return this.createTestSuite('Audit Logging', 'Security audit and logging tests', tests);
  }

  /**
   * Create test suite object
   */
  private createTestSuite(name: string, description: string, tests: SecurityTestResult[]): SecurityTestSuite {
    const passed = tests.filter(test => test.passed).length;
    const failed = tests.length - passed;
    const overallScore = tests.length > 0 ? Math.round((passed / tests.length) * 100) : 0;

    return {
      name,
      description,
      tests,
      overallScore,
      passed,
      failed,
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(tests: SecurityTestResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = tests.filter(test => !test.passed);

    // Group by severity
    const criticalIssues = failedTests.filter(test => test.severity === 'critical');
    const highIssues = failedTests.filter(test => test.severity === 'high');
    const mediumIssues = failedTests.filter(test => test.severity === 'medium');

    if (criticalIssues.length > 0) {
      recommendations.push('🚨 CRITICAL: Address all critical security issues immediately before production deployment');
      criticalIssues.forEach(issue => {
        recommendations.push(`   - ${issue.testName}: ${issue.message}`);
      });
    }

    if (highIssues.length > 0) {
      recommendations.push('⚠️ HIGH: Resolve high-priority security issues as soon as possible');
      highIssues.forEach(issue => {
        recommendations.push(`   - ${issue.testName}: ${issue.message}`);
      });
    }

    if (mediumIssues.length > 0) {
      recommendations.push('📋 MEDIUM: Address medium-priority issues in next security review');
    }

    // General recommendations
    if (failedTests.length === 0) {
      recommendations.push('✅ All security tests passed! Consider periodic security reviews and penetration testing.');
    } else {
      recommendations.push('🔒 Consider implementing additional security monitoring and alerting');
      recommendations.push('📚 Review OWASP Top 10 guidelines for additional security measures');
      recommendations.push('🔄 Run security tests regularly as part of CI/CD pipeline');
    }

    return recommendations;
  }

  /**
   * Export test results to JSON
   */
  public exportTestResults(testResults: any): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      testResults,
      metadata: {
        version: '1.0.0',
        environment: import.meta.env?.MODE || 'unknown',
      },
    }, null, 2);
  }
}

// Export singleton instance
export const securityTesting = SecurityTesting.getInstance();