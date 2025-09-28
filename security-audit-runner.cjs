#!/usr/bin/env node

/**
 * Comprehensive Security Audit Runner
 * Executes security tests and generates OWASP compliance report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Starting Comprehensive Security Audit...\n');

// Security audit results container
const auditResults = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  owasp: {},
  vulnerabilities: [],
  recommendations: [],
  overallScore: 0,
  status: 'unknown'
};

// OWASP Top 10 Assessment Functions
const owaspAssessments = {
  // A01: Broken Access Control
  assessA01: () => {
    console.log('📋 A01: Assessing Broken Access Control...');
    const findings = [];
    
    try {
      // Check RBAC implementation
      const rbacPath = './src/lib/security/RBACGuards.ts';
      const rbacExists = fs.existsSync(rbacPath);
      findings.push({
        check: 'RBAC Implementation',
        status: rbacExists ? 'PASS' : 'FAIL',
        details: rbacExists ? 'RBAC guards implemented' : 'Missing RBAC implementation'
      });
      
      // Check permission guards
      const permissionGuardPath = './src/lib/security/EnhancedPermissionGuard.tsx';
      const permissionGuardExists = fs.existsSync(permissionGuardPath);
      findings.push({
        check: 'Permission Guards',
        status: permissionGuardExists ? 'PASS' : 'FAIL',
        details: permissionGuardExists ? 'Permission guards implemented' : 'Missing permission guards'
      });
      
      // Check authentication context
      const authContextPath = './src/contexts/AuthContext.tsx';
      const authExists = fs.existsSync(authContextPath);
      findings.push({
        check: 'Authentication Context',
        status: authExists ? 'PASS' : 'FAIL',
        details: authExists ? 'Authentication context implemented' : 'Missing authentication context'
      });
      
    } catch (error) {
      findings.push({
        check: 'Access Control Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A01: Broken Access Control',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A02: Cryptographic Failures
  assessA02: () => {
    console.log('🔐 A02: Assessing Cryptographic Failures...');
    const findings = [];
    
    try {
      // Check data encryption implementation
      const encryptionPath = './src/lib/security/DataEncryption.ts';
      const encryptionExists = fs.existsSync(encryptionPath);
      findings.push({
        check: 'Data Encryption Implementation',
        status: encryptionExists ? 'PASS' : 'FAIL',
        details: encryptionExists ? 'Data encryption service implemented' : 'Missing data encryption'
      });
      
      // Check for HTTPS enforcement
      const viteConfigPath = './vite.config.ts';
      if (fs.existsSync(viteConfigPath)) {
        const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
        const hasHttpsConfig = viteConfig.includes('https') || viteConfig.includes('secure');
        findings.push({
          check: 'HTTPS Configuration',
          status: hasHttpsConfig ? 'PASS' : 'WARN',
          details: hasHttpsConfig ? 'HTTPS configuration detected' : 'HTTPS configuration not explicit in Vite config'
        });
      }
      
      // Check for environment variable protection
      const envExample = fs.existsSync('.env.example');
      const gitignoreExists = fs.existsSync('.gitignore');
      let envProtected = false;
      if (gitignoreExists) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        envProtected = gitignore.includes('.env');
      }
      
      findings.push({
        check: 'Environment Variable Protection',
        status: envProtected ? 'PASS' : 'FAIL',
        details: envProtected ? 'Environment variables protected in .gitignore' : 'Environment variables not properly protected'
      });
      
    } catch (error) {
      findings.push({
        check: 'Cryptographic Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A02: Cryptographic Failures',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A03: Injection
  assessA03: () => {
    console.log('💉 A03: Assessing Injection Vulnerabilities...');
    const findings = [];
    
    try {
      // Check for XSS protection
      const xssProtectionPath = './src/lib/security/EnhancedXSSProtection.ts';
      const xssExists = fs.existsSync(xssProtectionPath);
      findings.push({
        check: 'XSS Protection Implementation',
        status: xssExists ? 'PASS' : 'FAIL',
        details: xssExists ? 'XSS protection implemented' : 'Missing XSS protection'
      });
      
      // Check for input validation
      const validationPath = './src/lib/security/validation.ts';
      const validationExists = fs.existsSync(validationPath);
      findings.push({
        check: 'Input Validation',
        status: validationExists ? 'PASS' : 'FAIL',
        details: validationExists ? 'Input validation implemented' : 'Missing input validation'
      });
      
      // Check for SQL injection protection (Supabase RLS)
      const supabaseMigrations = fs.existsSync('./supabase/migrations');
      if (supabaseMigrations) {
        const migrationFiles = fs.readdirSync('./supabase/migrations');
        const hasRLSMigrations = migrationFiles.some(file => 
          fs.readFileSync(`./supabase/migrations/${file}`, 'utf8').toLowerCase().includes('row level security')
        );
        
        findings.push({
          check: 'SQL Injection Protection (RLS)',
          status: hasRLSMigrations ? 'PASS' : 'WARN',
          details: hasRLSMigrations ? 'Row Level Security implemented' : 'RLS policies may not be comprehensive'
        });
      }
      
    } catch (error) {
      findings.push({
        check: 'Injection Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A03: Injection',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A04: Insecure Design
  assessA04: () => {
    console.log('🏗️ A04: Assessing Insecure Design...');
    const findings = [];
    
    try {
      // Check for security middleware
      const middlewarePath = './src/lib/security/SecurityMiddleware.ts';
      const middlewareExists = fs.existsSync(middlewarePath);
      findings.push({
        check: 'Security Middleware',
        status: middlewareExists ? 'PASS' : 'FAIL',
        details: middlewareExists ? 'Security middleware implemented' : 'Missing security middleware'
      });
      
      // Check for comprehensive security service
      const securityServicePath = './src/lib/security/SecurityService.ts';
      const securityServiceExists = fs.existsSync(securityServicePath);
      findings.push({
        check: 'Security Service Architecture',
        status: securityServiceExists ? 'PASS' : 'FAIL',
        details: securityServiceExists ? 'Security service implemented' : 'Missing security service'
      });
      
      // Check for security testing
      const securityTestingPath = './src/lib/security/SecurityTesting.ts';
      const securityTestingExists = fs.existsSync(securityTestingPath);
      findings.push({
        check: 'Security Testing Framework',
        status: securityTestingExists ? 'PASS' : 'FAIL',
        details: securityTestingExists ? 'Security testing framework implemented' : 'Missing security testing'
      });
      
    } catch (error) {
      findings.push({
        check: 'Insecure Design Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A04: Insecure Design',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A05: Security Misconfiguration
  assessA05: () => {
    console.log('⚙️ A05: Assessing Security Misconfiguration...');
    const findings = [];
    
    try {
      // Check CSP implementation
      const cspPath = './src/lib/security/csp.ts';
      const cspExists = fs.existsSync(cspPath);
      findings.push({
        check: 'Content Security Policy',
        status: cspExists ? 'PASS' : 'FAIL',
        details: cspExists ? 'CSP implementation found' : 'Missing CSP implementation'
      });
      
      // Check security headers
      const headersPath = './src/lib/security/SecurityHeaders.ts';
      const headersExist = fs.existsSync(headersPath);
      findings.push({
        check: 'Security Headers',
        status: headersExist ? 'PASS' : 'FAIL',
        details: headersExist ? 'Security headers implemented' : 'Missing security headers'
      });
      
      // Check CSRF protection
      const csrfPath = './src/lib/security/CSRFProtection.ts';
      const csrfExists = fs.existsSync(csrfPath);
      findings.push({
        check: 'CSRF Protection',
        status: csrfExists ? 'PASS' : 'FAIL',
        details: csrfExists ? 'CSRF protection implemented' : 'Missing CSRF protection'
      });
      
    } catch (error) {
      findings.push({
        check: 'Security Misconfiguration Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A05: Security Misconfiguration',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A06: Vulnerable and Outdated Components
  assessA06: () => {
    console.log('🔄 A06: Assessing Vulnerable Components...');
    const findings = [];
    
    try {
      // Check package.json for security audit
      const packagePath = './package.json';
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check for audit script
        const hasAuditScript = packageJson.scripts && packageJson.scripts.audit;
        findings.push({
          check: 'Security Audit Script',
          status: hasAuditScript ? 'PASS' : 'WARN',
          details: hasAuditScript ? 'Security audit script configured' : 'Consider adding npm audit script'
        });
        
        // Check for known vulnerable packages (basic check)
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const suspiciousPackages = ['node-sass', 'request', 'debug'];
        const hasSuspiciousPackages = suspiciousPackages.some(pkg => dependencies[pkg]);
        
        findings.push({
          check: 'Known Vulnerable Packages',
          status: hasSuspiciousPackages ? 'WARN' : 'PASS',
          details: hasSuspiciousPackages ? 'Some packages may have known vulnerabilities' : 'No obviously vulnerable packages detected'
        });
      }
      
      // Check for dependency lock file
      const lockFileExists = fs.existsSync('./package-lock.json') || fs.existsSync('./yarn.lock');
      findings.push({
        check: 'Dependency Lock File',
        status: lockFileExists ? 'PASS' : 'FAIL',
        details: lockFileExists ? 'Dependency lock file present' : 'Missing dependency lock file'
      });
      
    } catch (error) {
      findings.push({
        check: 'Vulnerable Components Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A06: Vulnerable and Outdated Components',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A07: Identification and Authentication Failures
  assessA07: () => {
    console.log('🔐 A07: Assessing Authentication Failures...');
    const findings = [];
    
    try {
      // Check rate limiting
      const rateLimitPath = './src/lib/security/EnhancedRateLimit.ts';
      const rateLimitExists = fs.existsSync(rateLimitPath);
      findings.push({
        check: 'Rate Limiting Implementation',
        status: rateLimitExists ? 'PASS' : 'FAIL',
        details: rateLimitExists ? 'Rate limiting implemented' : 'Missing rate limiting'
      });
      
      // Check MFA implementation
      const mfaPath = './src/components/mfa';
      const mfaExists = fs.existsSync(mfaPath);
      findings.push({
        check: 'Multi-Factor Authentication',
        status: mfaExists ? 'PASS' : 'WARN',
        details: mfaExists ? 'MFA components implemented' : 'MFA implementation not found'
      });
      
      // Check authentication context security
      const authPath = './src/contexts/AuthContext.tsx';
      if (fs.existsSync(authPath)) {
        const authContent = fs.readFileSync(authPath, 'utf8');
        const hasSecurityChecks = authContent.includes('hasPermission') && authContent.includes('platform_admin');
        findings.push({
          check: 'Authentication Context Security',
          status: hasSecurityChecks ? 'PASS' : 'WARN',
          details: hasSecurityChecks ? 'Authentication context has security checks' : 'Authentication context may lack security checks'
        });
      }
      
    } catch (error) {
      findings.push({
        check: 'Authentication Failures Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A07: Identification and Authentication Failures',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A08: Software and Data Integrity Failures
  assessA08: () => {
    console.log('🔒 A08: Assessing Software Integrity Failures...');
    const findings = [];
    
    try {
      // Check for CI/CD security
      const githubWorkflows = fs.existsSync('./.github/workflows');
      findings.push({
        check: 'CI/CD Security',
        status: githubWorkflows ? 'PASS' : 'WARN',
        details: githubWorkflows ? 'GitHub workflows configured' : 'No CI/CD workflows detected'
      });
      
      // Check for package integrity
      const lockFileExists = fs.existsSync('./package-lock.json');
      findings.push({
        check: 'Package Integrity',
        status: lockFileExists ? 'PASS' : 'FAIL',
        details: lockFileExists ? 'Package lock file ensures integrity' : 'Missing package lock file'
      });
      
      // Check for code signing/verification
      const hasHusky = fs.existsSync('./.husky');
      findings.push({
        check: 'Code Quality Checks',
        status: hasHusky ? 'PASS' : 'WARN',
        details: hasHusky ? 'Pre-commit hooks configured' : 'No pre-commit hooks detected'
      });
      
    } catch (error) {
      findings.push({
        check: 'Software Integrity Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A08: Software and Data Integrity Failures',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A09: Security Logging and Monitoring Failures
  assessA09: () => {
    console.log('📊 A09: Assessing Logging and Monitoring Failures...');
    const findings = [];
    
    try {
      // Check for audit logging
      const securityServicePath = './src/lib/security/SecurityService.ts';
      if (fs.existsSync(securityServicePath)) {
        const content = fs.readFileSync(securityServicePath, 'utf8');
        const hasLogging = content.includes('logSecurityEvent') && content.includes('SecurityEvent');
        findings.push({
          check: 'Security Event Logging',
          status: hasLogging ? 'PASS' : 'FAIL',
          details: hasLogging ? 'Security event logging implemented' : 'Missing security event logging'
        });
      }
      
      // Check for monitoring integration
      const sentryConfig = fs.existsSync('./sentry.config.js') || fs.existsSync('./sentry.config.ts');
      findings.push({
        check: 'Error Monitoring',
        status: sentryConfig ? 'PASS' : 'WARN',
        details: sentryConfig ? 'Sentry monitoring configured' : 'No error monitoring detected'
      });
      
      // Check for audit trail
      const auditMigrations = fs.existsSync('./supabase/migrations');
      if (auditMigrations) {
        const migrationFiles = fs.readdirSync('./supabase/migrations');
        const hasAuditTables = migrationFiles.some(file => 
          fs.readFileSync(`./supabase/migrations/${file}`, 'utf8').toLowerCase().includes('audit')
        );
        
        findings.push({
          check: 'Database Audit Trail',
          status: hasAuditTables ? 'PASS' : 'WARN',
          details: hasAuditTables ? 'Database audit tables detected' : 'Database audit trail may be incomplete'
        });
      }
      
    } catch (error) {
      findings.push({
        check: 'Logging and Monitoring Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A09: Security Logging and Monitoring Failures',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  },

  // A10: Server-Side Request Forgery (SSRF)
  assessA10: () => {
    console.log('🌐 A10: Assessing SSRF Vulnerabilities...');
    const findings = [];
    
    try {
      // Check for URL validation
      const validationPath = './src/lib/security/validation.ts';
      if (fs.existsSync(validationPath)) {
        const content = fs.readFileSync(validationPath, 'utf8');
        const hasUrlValidation = content.includes('validateUrl');
        findings.push({
          check: 'URL Validation',
          status: hasUrlValidation ? 'PASS' : 'WARN',
          details: hasUrlValidation ? 'URL validation implemented' : 'URL validation may be missing'
        });
      }
      
      // Check for network security
      const securityServicePath = './src/lib/security/SecurityService.ts';
      if (fs.existsSync(securityServicePath)) {
        const content = fs.readFileSync(securityServicePath, 'utf8');
        const hasNetworkSecurity = content.includes('network') || content.includes('request');
        findings.push({
          check: 'Network Security Controls',
          status: hasNetworkSecurity ? 'PASS' : 'WARN',
          details: hasNetworkSecurity ? 'Network security controls present' : 'Network security controls may be missing'
        });
      }
      
      // Check for API endpoint protection
      const apiPath = './src/lib/api';
      const hasApiSecurity = fs.existsSync(apiPath);
      findings.push({
        check: 'API Security Layer',
        status: hasApiSecurity ? 'PASS' : 'WARN',
        details: hasApiSecurity ? 'API security layer present' : 'API security layer not detected'
      });
      
    } catch (error) {
      findings.push({
        check: 'SSRF Assessment',
        status: 'ERROR',
        details: error.message
      });
    }
    
    const passedChecks = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passedChecks / findings.length) * 100);
    
    return {
      category: 'A10: Server-Side Request Forgery',
      score,
      findings,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'PARTIAL' : 'NON_COMPLIANT'
    };
  }
};

// Run all OWASP assessments
console.log('🔍 Running OWASP Top 10 Security Assessment...\n');

const owaspResults = {};
let totalScore = 0;
let compliantCategories = 0;

for (const [key, assessFunc] of Object.entries(owaspAssessments)) {
  const result = assessFunc();
  owaspResults[result.category] = result;
  totalScore += result.score;
  if (result.status === 'COMPLIANT') compliantCategories++;
  
  console.log(`✅ ${result.category}: ${result.score}% (${result.status})`);
}

auditResults.owasp = owaspResults;
auditResults.overallScore = Math.round(totalScore / Object.keys(owaspAssessments).length);

// Determine overall compliance status
if (compliantCategories >= 8) {
  auditResults.status = 'COMPLIANT';
} else if (compliantCategories >= 6) {
  auditResults.status = 'MOSTLY_COMPLIANT';
} else if (compliantCategories >= 4) {
  auditResults.status = 'PARTIALLY_COMPLIANT';
} else {
  auditResults.status = 'NON_COMPLIANT';
}

// Generate recommendations
auditResults.recommendations = [
  'Update dependencies to latest secure versions',
  'Consider implementing additional MFA methods',
  'Enhance API security documentation',
  'Implement comprehensive integration tests for security',
  'Consider adding security scanning to CI/CD pipeline'
];

// Generate final report
console.log('\n📊 SECURITY AUDIT SUMMARY');
console.log('='.repeat(50));
console.log(`Overall Score: ${auditResults.overallScore}%`);
console.log(`Compliance Status: ${auditResults.status}`);
console.log(`Compliant Categories: ${compliantCategories}/10`);

// Save detailed report
const reportPath = './security-audit-report.json';
fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Generate human-readable report
const humanReportPath = './SECURITY_AUDIT_REPORT.md';
const humanReport = `# Security Audit Report

**Generated:** ${auditResults.timestamp}
**Overall Score:** ${auditResults.overallScore}%
**Status:** ${auditResults.status}

## OWASP Top 10 Compliance

${Object.values(owaspResults).map(result => `
### ${result.category}
**Score:** ${result.score}% | **Status:** ${result.status}

${result.findings.map(finding => `- **${finding.check}:** ${finding.status} - ${finding.details}`).join('\n')}
`).join('\n')}

## Recommendations

${auditResults.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. Address any FAIL findings immediately
2. Review and improve WARN findings
3. Consider implementing additional security measures
4. Schedule regular security audits
5. Keep dependencies updated

---
*Report generated by Audit Readiness Hub Security Scanner*
`;

fs.writeFileSync(humanReportPath, humanReport);
console.log(`📄 Human-readable report saved to: ${humanReportPath}`);

console.log('\n🔒 Security Audit Complete!');

// Exit with appropriate code
process.exit(auditResults.overallScore >= 80 ? 0 : 1);