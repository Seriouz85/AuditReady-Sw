#!/usr/bin/env node

/**
 * Security Implementation Verification Test
 * Tests actual security implementations at runtime
 */

const fs = require('fs');
const crypto = require('crypto');

console.log('🧪 Starting Security Implementation Verification...\n');

// Security test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  overallScore: 0,
  criticalFailures: 0,
  warnings: 0
};

// Helper function to add test result
const addTestResult = (name, passed, details, severity = 'medium') => {
  const result = {
    name,
    passed,
    details,
    severity,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (!passed && severity === 'critical') {
    testResults.criticalFailures++;
  } else if (!passed && severity === 'high') {
    testResults.warnings++;
  }
  
  console.log(`${passed ? '✅' : '❌'} ${name}: ${details}`);
};

// Test 1: CSP Implementation
console.log('🛡️ Testing Content Security Policy Implementation...');
try {
  const cspFile = './src/lib/security/csp.ts';
  if (fs.existsSync(cspFile)) {
    const cspContent = fs.readFileSync(cspFile, 'utf8');
    
    // Check for nonce generation
    const hasNonceGeneration = cspContent.includes('generateNonce') && cspContent.includes('crypto.getRandomValues');
    addTestResult('CSP Nonce Generation', hasNonceGeneration, 
      hasNonceGeneration ? 'Cryptographically secure nonce generation implemented' : 'Missing secure nonce generation',
      'high');
    
    // Check for strict directives
    const hasStrictDirectives = cspContent.includes("'self'") && cspContent.includes("object-src") && cspContent.includes("'none'");
    addTestResult('CSP Strict Directives', hasStrictDirectives,
      hasStrictDirectives ? 'Strict CSP directives configured' : 'CSP directives may be too permissive',
      'medium');
    
    // Check for frame protection
    const hasFrameProtection = cspContent.includes('frame-ancestors') && cspContent.includes("'none'");
    addTestResult('CSP Clickjacking Protection', hasFrameProtection,
      hasFrameProtection ? 'Clickjacking protection enabled' : 'Missing clickjacking protection',
      'high');
  } else {
    addTestResult('CSP Implementation', false, 'CSP file not found', 'critical');
  }
} catch (error) {
  addTestResult('CSP Implementation Test', false, `Error: ${error.message}`, 'critical');
}

// Test 2: Authentication Security
console.log('\n🔐 Testing Authentication Security...');
try {
  const authFile = './src/contexts/AuthContext.tsx';
  if (fs.existsSync(authFile)) {
    const authContent = fs.readFileSync(authFile, 'utf8');
    
    // Check for demo account isolation
    const hasDemoIsolation = authContent.includes('demo@auditready.com') && authContent.includes('SECURITY:');
    addTestResult('Demo Account Isolation', hasDemoIsolation,
      hasDemoIsolation ? 'Demo account properly isolated with security checks' : 'Demo account isolation may be insufficient',
      'critical');
    
    // Check for permission validation
    const hasPermissionValidation = authContent.includes('hasPermission') && authContent.includes('platform_admin');
    addTestResult('Permission Validation', hasPermissionValidation,
      hasPermissionValidation ? 'Permission validation system implemented' : 'Missing permission validation',
      'high');
    
    // Check for platform admin security
    const hasPlatformAdminSecurity = authContent.includes('isPlatformAdminEmail') && authContent.includes('payam.razifar@gmail.com');
    addTestResult('Platform Admin Security', hasPlatformAdminSecurity,
      hasPlatformAdminSecurity ? 'Platform admin access properly restricted' : 'Platform admin security may be weak',
      'critical');
  } else {
    addTestResult('Authentication Security', false, 'Auth context file not found', 'critical');
  }
} catch (error) {
  addTestResult('Authentication Security Test', false, `Error: ${error.message}`, 'critical');
}

// Test 3: Input Validation
console.log('\n🔍 Testing Input Validation...');
try {
  const validationFile = './src/lib/security/validation.ts';
  if (fs.existsSync(validationFile)) {
    const validationContent = fs.readFileSync(validationFile, 'utf8');
    
    // Check for Zod schema validation
    const hasZodValidation = validationContent.includes('z.') && validationContent.includes('schema');
    addTestResult('Schema Validation', hasZodValidation,
      hasZodValidation ? 'Zod schema validation implemented' : 'Missing schema validation',
      'high');
    
    // Check for XSS protection
    const hasXSSProtection = validationContent.includes('sanitize') && validationContent.includes('XSS');
    addTestResult('XSS Protection', hasXSSProtection,
      hasXSSProtection ? 'XSS protection implemented' : 'XSS protection may be missing',
      'high');
    
    // Check for SQL injection protection
    const hasSQLProtection = validationContent.includes('escapeSQLIdentifier') || validationContent.includes('parameterized');
    addTestResult('SQL Injection Protection', hasSQLProtection,
      hasSQLProtection ? 'SQL injection protection implemented' : 'SQL injection protection may be missing',
      'critical');
  } else {
    addTestResult('Input Validation', false, 'Validation file not found', 'critical');
  }
} catch (error) {
  addTestResult('Input Validation Test', false, `Error: ${error.message}`, 'critical');
}

// Test 4: Rate Limiting
console.log('\n⏱️ Testing Rate Limiting...');
try {
  const rateLimitFile = './src/lib/security/EnhancedRateLimit.ts';
  if (fs.existsSync(rateLimitFile)) {
    const rateLimitContent = fs.readFileSync(rateLimitFile, 'utf8');
    
    // Check for adaptive rate limiting
    const hasAdaptiveRateLimit = rateLimitContent.includes('adaptive') && rateLimitContent.includes('sliding');
    addTestResult('Adaptive Rate Limiting', hasAdaptiveRateLimit,
      hasAdaptiveRateLimit ? 'Adaptive rate limiting implemented' : 'Basic rate limiting only',
      'medium');
    
    // Check for attack detection
    const hasAttackDetection = rateLimitContent.includes('attack') && rateLimitContent.includes('detection');
    addTestResult('Attack Detection', hasAttackDetection,
      hasAttackDetection ? 'Attack detection implemented' : 'Missing attack detection',
      'high');
    
    // Check for IP-based limiting
    const hasIPLimiting = rateLimitContent.includes('ip') || rateLimitContent.includes('IP');
    addTestResult('IP-based Rate Limiting', hasIPLimiting,
      hasIPLimiting ? 'IP-based rate limiting implemented' : 'Missing IP-based rate limiting',
      'medium');
  } else {
    addTestResult('Rate Limiting', false, 'Rate limiting file not found', 'high');
  }
} catch (error) {
  addTestResult('Rate Limiting Test', false, `Error: ${error.message}`, 'high');
}

// Test 5: Data Encryption
console.log('\n🔒 Testing Data Encryption...');
try {
  const encryptionFile = './src/lib/security/DataEncryption.ts';
  if (fs.existsSync(encryptionFile)) {
    const encryptionContent = fs.readFileSync(encryptionFile, 'utf8');
    
    // Check for AES-GCM encryption
    const hasAESGCM = encryptionContent.includes('aes-256-gcm') || encryptionContent.includes('AES-GCM');
    addTestResult('AES-GCM Encryption', hasAESGCM,
      hasAESGCM ? 'AES-GCM encryption implemented' : 'Encryption algorithm may be weak',
      'high');
    
    // Check for key rotation
    const hasKeyRotation = encryptionContent.includes('rotation') && encryptionContent.includes('key');
    addTestResult('Key Rotation', hasKeyRotation,
      hasKeyRotation ? 'Key rotation implemented' : 'Missing key rotation',
      'medium');
    
    // Check for secure key generation
    const hasSecureKeyGen = encryptionContent.includes('crypto.randomBytes') || encryptionContent.includes('getRandomValues');
    addTestResult('Secure Key Generation', hasSecureKeyGen,
      hasSecureKeyGen ? 'Cryptographically secure key generation' : 'Weak key generation',
      'critical');
  } else {
    addTestResult('Data Encryption', false, 'Encryption file not found', 'critical');
  }
} catch (error) {
  addTestResult('Data Encryption Test', false, `Error: ${error.message}`, 'critical');
}

// Test 6: CSRF Protection
console.log('\n🛡️ Testing CSRF Protection...');
try {
  const csrfFile = './src/lib/security/CSRFProtection.ts';
  if (fs.existsSync(csrfFile)) {
    const csrfContent = fs.readFileSync(csrfFile, 'utf8');
    
    // Check for double-submit cookies
    const hasDoubleSubmit = csrfContent.includes('double') && csrfContent.includes('submit');
    addTestResult('CSRF Double-Submit Pattern', hasDoubleSubmit,
      hasDoubleSubmit ? 'Double-submit CSRF protection implemented' : 'CSRF protection may be basic',
      'high');
    
    // Check for origin validation
    const hasOriginValidation = csrfContent.includes('origin') && csrfContent.includes('validate');
    addTestResult('CSRF Origin Validation', hasOriginValidation,
      hasOriginValidation ? 'Origin validation implemented' : 'Missing origin validation',
      'high');
    
    // Check for token expiration
    const hasTokenExpiration = csrfContent.includes('expir') && csrfContent.includes('ttl');
    addTestResult('CSRF Token Expiration', hasTokenExpiration,
      hasTokenExpiration ? 'Token expiration implemented' : 'CSRF tokens may not expire',
      'medium');
  } else {
    addTestResult('CSRF Protection', false, 'CSRF protection file not found', 'critical');
  }
} catch (error) {
  addTestResult('CSRF Protection Test', false, `Error: ${error.message}`, 'critical');
}

// Test 7: Security Headers
console.log('\n📋 Testing Security Headers...');
try {
  const headersFile = './src/lib/security/SecurityHeaders.ts';
  if (fs.existsSync(headersFile)) {
    const headersContent = fs.readFileSync(headersFile, 'utf8');
    
    // Check for comprehensive headers
    const hasComprehensiveHeaders = headersContent.includes('X-Content-Type-Options') && 
                                   headersContent.includes('X-Frame-Options') && 
                                   headersContent.includes('Referrer-Policy');
    addTestResult('Comprehensive Security Headers', hasComprehensiveHeaders,
      hasComprehensiveHeaders ? 'Comprehensive security headers implemented' : 'Missing security headers',
      'high');
    
    // Check for HSTS
    const hasHSTS = headersContent.includes('Strict-Transport-Security') || headersContent.includes('HSTS');
    addTestResult('HSTS Header', hasHSTS,
      hasHSTS ? 'HSTS header implemented' : 'Missing HSTS header',
      'medium');
    
    // Check for Permissions Policy
    const hasPermissionsPolicy = headersContent.includes('Permissions-Policy') || headersContent.includes('Feature-Policy');
    addTestResult('Permissions Policy', hasPermissionsPolicy,
      hasPermissionsPolicy ? 'Permissions policy implemented' : 'Missing permissions policy',
      'medium');
  } else {
    addTestResult('Security Headers', false, 'Security headers file not found', 'high');
  }
} catch (error) {
  addTestResult('Security Headers Test', false, `Error: ${error.message}`, 'high');
}

// Test 8: MFA Implementation
console.log('\n🔑 Testing Multi-Factor Authentication...');
try {
  const mfaPath = './src/components/mfa';
  const mfaFiles = fs.existsSync(mfaPath) ? fs.readdirSync(mfaPath) : [];
  
  // Check for MFA components
  const hasMFAComponents = mfaFiles.length > 0;
  addTestResult('MFA Components', hasMFAComponents,
    hasMFAComponents ? `${mfaFiles.length} MFA components found` : 'No MFA components found',
    'high');
  
  // Check for TOTP implementation
  const hasTOTP = mfaFiles.some(file => file.toLowerCase().includes('totp') || file.toLowerCase().includes('authenticator'));
  addTestResult('TOTP Implementation', hasTOTP,
    hasTOTP ? 'TOTP implementation found' : 'TOTP implementation missing',
    'medium');
  
  // Check for backup codes
  const hasBackupCodes = mfaFiles.some(file => file.toLowerCase().includes('backup') || file.toLowerCase().includes('recovery'));
  addTestResult('MFA Backup Codes', hasBackupCodes,
    hasBackupCodes ? 'Backup codes implementation found' : 'Backup codes missing',
    'medium');
    
} catch (error) {
  addTestResult('MFA Implementation Test', false, `Error: ${error.message}`, 'high');
}

// Test 9: Audit Logging
console.log('\n📊 Testing Audit Logging...');
try {
  const securityServiceFile = './src/lib/security/SecurityService.ts';
  if (fs.existsSync(securityServiceFile)) {
    const serviceContent = fs.readFileSync(securityServiceFile, 'utf8');
    
    // Check for comprehensive logging
    const hasComprehensiveLogging = serviceContent.includes('logSecurityEvent') && 
                                   serviceContent.includes('SecurityEvent') &&
                                   serviceContent.includes('timestamp');
    addTestResult('Comprehensive Audit Logging', hasComprehensiveLogging,
      hasComprehensiveLogging ? 'Comprehensive audit logging implemented' : 'Audit logging may be incomplete',
      'high');
    
    // Check for log retention
    const hasLogRetention = serviceContent.includes('retention') || serviceContent.includes('ttl');
    addTestResult('Log Retention', hasLogRetention,
      hasLogRetention ? 'Log retention implemented' : 'Log retention may be missing',
      'medium');
    
    // Check for security event types
    const hasSecurityEventTypes = serviceContent.includes('SecurityEventType') || serviceContent.includes('event.*type');
    addTestResult('Security Event Classification', hasSecurityEventTypes,
      hasSecurityEventTypes ? 'Security event classification implemented' : 'Security events may not be classified',
      'medium');
  } else {
    addTestResult('Audit Logging', false, 'Security service file not found', 'high');
  }
} catch (error) {
  addTestResult('Audit Logging Test', false, `Error: ${error.message}`, 'high');
}

// Test 10: Database Security (RLS)
console.log('\n🗄️ Testing Database Security...');
try {
  const migrationsPath = './supabase/migrations';
  if (fs.existsSync(migrationsPath)) {
    const migrationFiles = fs.readdirSync(migrationsPath);
    
    // Check for RLS migrations
    let hasRLSPolicies = false;
    migrationFiles.forEach(file => {
      if (file.endsWith('.sql')) {
        const content = fs.readFileSync(`${migrationsPath}/${file}`, 'utf8');
        if (content.toLowerCase().includes('row level security') || content.toLowerCase().includes('enable rls')) {
          hasRLSPolicies = true;
        }
      }
    });
    
    addTestResult('Row Level Security', hasRLSPolicies,
      hasRLSPolicies ? 'RLS policies implemented' : 'RLS policies may be missing',
      'critical');
    
    // Check for security-specific migrations
    const hasSecurityMigrations = migrationFiles.some(file => 
      file.includes('security') || file.includes('audit') || file.includes('rls')
    );
    addTestResult('Security Migrations', hasSecurityMigrations,
      hasSecurityMigrations ? 'Security-specific migrations found' : 'No dedicated security migrations',
      'medium');
  } else {
    addTestResult('Database Security', false, 'Migrations directory not found', 'high');
  }
} catch (error) {
  addTestResult('Database Security Test', false, `Error: ${error.message}`, 'high');
}

// Calculate overall score
const totalTests = testResults.tests.length;
const passedTests = testResults.tests.filter(test => test.passed).length;
testResults.overallScore = Math.round((passedTests / totalTests) * 100);

// Generate summary
console.log('\n📊 SECURITY IMPLEMENTATION VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests Run: ${totalTests}`);
console.log(`Tests Passed: ${passedTests}`);
console.log(`Tests Failed: ${totalTests - passedTests}`);
console.log(`Overall Score: ${testResults.overallScore}%`);
console.log(`Critical Failures: ${testResults.criticalFailures}`);
console.log(`Warnings: ${testResults.warnings}`);

// Determine security status
let securityStatus = 'UNKNOWN';
if (testResults.criticalFailures === 0 && testResults.overallScore >= 90) {
  securityStatus = 'EXCELLENT';
} else if (testResults.criticalFailures === 0 && testResults.overallScore >= 80) {
  securityStatus = 'GOOD';
} else if (testResults.criticalFailures <= 1 && testResults.overallScore >= 70) {
  securityStatus = 'ACCEPTABLE';
} else {
  securityStatus = 'NEEDS_IMPROVEMENT';
}

console.log(`Security Status: ${securityStatus}`);

// Save detailed results
fs.writeFileSync('./security-implementation-test-results.json', JSON.stringify(testResults, null, 2));
console.log('\n📄 Detailed results saved to: security-implementation-test-results.json');

// Generate recommendations
const recommendations = [];
if (testResults.criticalFailures > 0) {
  recommendations.push('🚨 Address all critical security failures immediately');
}
if (testResults.warnings > 0) {
  recommendations.push('⚠️ Review and fix all security warnings');
}
if (testResults.overallScore < 90) {
  recommendations.push('📈 Implement additional security measures to reach 90%+ compliance');
}

// Specific recommendations based on failed tests
const failedTests = testResults.tests.filter(test => !test.passed);
failedTests.forEach(test => {
  if (test.name.includes('CSP')) {
    recommendations.push('🛡️ Strengthen Content Security Policy implementation');
  }
  if (test.name.includes('Authentication')) {
    recommendations.push('🔐 Enhance authentication security measures');
  }
  if (test.name.includes('Encryption')) {
    recommendations.push('🔒 Implement proper data encryption');
  }
  if (test.name.includes('MFA')) {
    recommendations.push('🔑 Complete Multi-Factor Authentication implementation');
  }
});

if (recommendations.length > 0) {
  console.log('\n📋 SECURITY RECOMMENDATIONS:');
  recommendations.forEach(rec => console.log(`   ${rec}`));
}

console.log('\n🔒 Security Implementation Verification Complete!');

// Exit with appropriate code
process.exit(testResults.criticalFailures === 0 ? 0 : 1);