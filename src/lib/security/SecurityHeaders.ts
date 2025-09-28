import { getCSPDirectives, generateNonce } from './csp';
import { securityService } from './SecurityService';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: {
    enabled: boolean;
    directives?: Record<string, string[]>;
    reportOnly?: boolean;
    reportUri?: string;
  };
  hsts?: {
    enabled: boolean;
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  xFrameOptions?: {
    enabled: boolean;
    value?: 'DENY' | 'SAMEORIGIN' | string;
  };
  xContentTypeOptions?: {
    enabled: boolean;
  };
  referrerPolicy?: {
    enabled: boolean;
    value?: string;
  };
  permissionsPolicy?: {
    enabled: boolean;
    directives?: Record<string, string[]>;
  };
  expectCT?: {
    enabled: boolean;
    maxAge?: number;
    enforce?: boolean;
    reportUri?: string;
  };
}

export interface SecurityHeadersResult {
  headers: Record<string, string>;
  nonce?: string;
  warnings: string[];
}

/**
 * Security Headers Service for comprehensive HTTP security
 * Implements all major security headers following OWASP recommendations
 */
export class SecurityHeaders {
  private static instance: SecurityHeaders;
  private config: SecurityHeadersConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders();
    }
    return SecurityHeaders.instance;
  }

  /**
   * Get default security headers configuration
   */
  private getDefaultConfig(): SecurityHeadersConfig {
    const isDev = import.meta.env?.DEV || process.env.NODE_ENV === 'development';
    
    return {
      contentSecurityPolicy: {
        enabled: true,
        reportOnly: isDev,
        reportUri: '/api/security/csp-report',
      },
      hsts: {
        enabled: !isDev,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      xFrameOptions: {
        enabled: true,
        value: 'DENY',
      },
      xContentTypeOptions: {
        enabled: true,
      },
      referrerPolicy: {
        enabled: true,
        value: 'strict-origin-when-cross-origin',
      },
      permissionsPolicy: {
        enabled: true,
        directives: {
          'geolocation': ['()'],
          'microphone': ['()'],
          'camera': ['()'],
          'payment': ['*'],
          'usb': ['()'],
          'magnetometer': ['()'],
          'gyroscope': ['()'],
          'accelerometer': ['()'],
          'ambient-light-sensor': ['()'],
          'autoplay': ['()'],
          'encrypted-media': ['()'],
          'fullscreen': ['*'],
          'picture-in-picture': ['()'],
          'sync-xhr': ['()'],
        },
      },
      expectCT: {
        enabled: !isDev,
        maxAge: 86400, // 24 hours
        enforce: false,
        reportUri: '/api/security/ct-report',
      },
    };
  }

  /**
   * Generate all security headers
   */
  public generateHeaders(customConfig?: Partial<SecurityHeadersConfig>): SecurityHeadersResult {
    const config = { ...this.config, ...customConfig };
    const headers: Record<string, string> = {};
    const warnings: string[] = [];
    let nonce: string | undefined;

    try {
      // Content Security Policy
      if (config.contentSecurityPolicy?.enabled) {
        nonce = generateNonce();
        const cspValue = this.buildCSP(config.contentSecurityPolicy, nonce);
        const headerName = config.contentSecurityPolicy.reportOnly 
          ? 'Content-Security-Policy-Report-Only' 
          : 'Content-Security-Policy';
        headers[headerName] = cspValue;
      }

      // HTTP Strict Transport Security
      if (config.hsts?.enabled) {
        headers['Strict-Transport-Security'] = this.buildHSTS(config.hsts);
      }

      // X-Frame-Options
      if (config.xFrameOptions?.enabled) {
        headers['X-Frame-Options'] = config.xFrameOptions.value || 'DENY';
      }

      // X-Content-Type-Options
      if (config.xContentTypeOptions?.enabled) {
        headers['X-Content-Type-Options'] = 'nosniff';
      }

      // Referrer Policy
      if (config.referrerPolicy?.enabled) {
        headers['Referrer-Policy'] = config.referrerPolicy.value || 'strict-origin-when-cross-origin';
      }

      // Permissions Policy
      if (config.permissionsPolicy?.enabled) {
        headers['Permissions-Policy'] = this.buildPermissionsPolicy(config.permissionsPolicy);
      }

      // Expect-CT
      if (config.expectCT?.enabled) {
        headers['Expect-CT'] = this.buildExpectCT(config.expectCT);
      }

      // Additional security headers
      headers['X-XSS-Protection'] = '1; mode=block';
      headers['X-DNS-Prefetch-Control'] = 'off';
      headers['X-Download-Options'] = 'noopen';
      headers['X-Permitted-Cross-Domain-Policies'] = 'none';
      headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
      headers['Cross-Origin-Opener-Policy'] = 'same-origin';
      headers['Cross-Origin-Resource-Policy'] = 'same-origin';

      // Log header generation
      this.logHeaderGeneration(Object.keys(headers));

      return { headers, nonce, warnings };

    } catch (error) {
      const errorMessage = `Failed to generate security headers: ${error.message}`;
      warnings.push(errorMessage);
      
      securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'header_generation_failed',
          error: error.message,
        },
        timestamp: new Date(),
        severity: 'high',
      });

      return { headers, warnings };
    }
  }

  /**
   * Build Content Security Policy header value
   */
  private buildCSP(config: SecurityHeadersConfig['contentSecurityPolicy'], nonce?: string): string {
    let cspValue = getCSPDirectives();

    // Add nonce to script-src if provided
    if (nonce) {
      cspValue = cspValue.replace(
        /script-src ([^;]+)/,
        `script-src $1 'nonce-${nonce}'`
      );
    }

    // Add report URI if specified
    if (config?.reportUri) {
      cspValue += `; report-uri ${config.reportUri}`;
    }

    return cspValue;
  }

  /**
   * Build HSTS header value
   */
  private buildHSTS(config: SecurityHeadersConfig['hsts']): string {
    let value = `max-age=${config?.maxAge || 31536000}`;
    
    if (config?.includeSubDomains) {
      value += '; includeSubDomains';
    }
    
    if (config?.preload) {
      value += '; preload';
    }
    
    return value;
  }

  /**
   * Build Permissions Policy header value
   */
  private buildPermissionsPolicy(config: SecurityHeadersConfig['permissionsPolicy']): string {
    if (!config?.directives) {
      return '';
    }

    const policies = Object.entries(config.directives).map(([directive, allowlist]) => {
      const allowlistStr = allowlist.join(' ');
      return `${directive}=(${allowlistStr})`;
    });

    return policies.join(', ');
  }

  /**
   * Build Expect-CT header value
   */
  private buildExpectCT(config: SecurityHeadersConfig['expectCT']): string {
    let value = `max-age=${config?.maxAge || 86400}`;
    
    if (config?.enforce) {
      value += ', enforce';
    }
    
    if (config?.reportUri) {
      value += `, report-uri="${config.reportUri}"`;
    }
    
    return value;
  }

  /**
   * Validate security headers configuration
   */
  public validateConfig(config: SecurityHeadersConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate CSP
    if (config.contentSecurityPolicy?.enabled && config.contentSecurityPolicy.reportUri) {
      if (!this.isValidUrl(config.contentSecurityPolicy.reportUri)) {
        errors.push('Invalid CSP report URI');
      }
    }

    // Validate HSTS
    if (config.hsts?.enabled && config.hsts.maxAge !== undefined) {
      if (config.hsts.maxAge < 0 || config.hsts.maxAge > 63072000) { // 2 years max
        errors.push('HSTS max-age should be between 0 and 63072000 seconds');
      }
    }

    // Validate X-Frame-Options
    if (config.xFrameOptions?.enabled && config.xFrameOptions.value) {
      const validValues = ['DENY', 'SAMEORIGIN'];
      if (!validValues.includes(config.xFrameOptions.value) && 
          !config.xFrameOptions.value.startsWith('ALLOW-FROM ')) {
        errors.push('Invalid X-Frame-Options value');
      }
    }

    // Validate Referrer Policy
    if (config.referrerPolicy?.enabled && config.referrerPolicy.value) {
      const validValues = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url'
      ];
      if (!validValues.includes(config.referrerPolicy.value)) {
        errors.push('Invalid Referrer-Policy value');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply security headers to a response (for framework integration)
   */
  public applyHeaders(
    response: any, // Generic response object
    customConfig?: Partial<SecurityHeadersConfig>
  ): void {
    const { headers } = this.generateHeaders(customConfig);

    for (const [name, value] of Object.entries(headers)) {
      if (response.setHeader) {
        response.setHeader(name, value);
      } else if (response.headers) {
        response.headers[name] = value;
      }
    }
  }

  /**
   * Get security headers for Vite development
   */
  public getViteHeaders(): Record<string, string> {
    const { headers } = this.generateHeaders({
      hsts: { enabled: false }, // Disable HSTS for local development
      expectCT: { enabled: false }, // Disable Expect-CT for local development
      contentSecurityPolicy: {
        enabled: true,
        reportOnly: true, // Use report-only mode in development
      },
    });

    return headers;
  }

  /**
   * Generate meta tags for client-side security
   */
  public generateMetaTags(nonce?: string): string[] {
    const metaTags: string[] = [];

    // CSP meta tag (not recommended for production, but useful for testing)
    if (import.meta.env?.DEV) {
      const cspValue = getCSPDirectives();
      metaTags.push(`<meta http-equiv="Content-Security-Policy" content="${cspValue}">`);
    }

    // Referrer policy meta tag
    metaTags.push(`<meta name="referrer" content="strict-origin-when-cross-origin">`);

    // Viewport meta tag with security considerations
    metaTags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">`);

    // Robots meta tag
    metaTags.push(`<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`);

    // CSRF token meta tag (if nonce provided)
    if (nonce) {
      metaTags.push(`<meta name="csrf-token" content="${nonce}">`);
    }

    return metaTags;
  }

  /**
   * Check if headers are properly configured
   */
  public auditHeaders(headers: Record<string, string>): {
    score: number;
    issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string }>;
    recommendations: string[];
  } {
    const issues = [];
    const recommendations = [];
    let score = 100;

    // Check CSP
    if (!headers['Content-Security-Policy'] && !headers['Content-Security-Policy-Report-Only']) {
      issues.push({ severity: 'high', message: 'Missing Content-Security-Policy header' });
      score -= 20;
    }

    // Check HSTS
    if (!headers['Strict-Transport-Security']) {
      issues.push({ severity: 'medium', message: 'Missing Strict-Transport-Security header' });
      score -= 10;
    }

    // Check X-Frame-Options
    if (!headers['X-Frame-Options']) {
      issues.push({ severity: 'medium', message: 'Missing X-Frame-Options header' });
      score -= 10;
    }

    // Check X-Content-Type-Options
    if (!headers['X-Content-Type-Options']) {
      issues.push({ severity: 'low', message: 'Missing X-Content-Type-Options header' });
      score -= 5;
    }

    // Check Referrer-Policy
    if (!headers['Referrer-Policy']) {
      issues.push({ severity: 'low', message: 'Missing Referrer-Policy header' });
      score -= 5;
    }

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push('Implement missing security headers');
      recommendations.push('Consider using a security headers service');
      recommendations.push('Test headers with online security scanners');
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SecurityHeadersConfig>): void {
    const validation = this.validateConfig({ ...this.config, ...newConfig });
    
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    this.config = { ...this.config, ...newConfig };

    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_headers_config_updated',
        changes: Object.keys(newConfig),
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  /**
   * Get current configuration
   */
  public getConfig(): SecurityHeadersConfig {
    return { ...this.config };
  }

  /**
   * Log header generation for audit
   */
  private logHeaderGeneration(headerNames: string[]): void {
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'security_headers_generated',
        headers: headerNames,
        count: headerNames.length,
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url, 'https://example.com');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate report for CSP violations
   */
  public handleCSPReport(report: any): void {
    securityService.logSecurityEvent({
      type: 'suspicious_activity',
      details: {
        reason: 'csp_violation',
        report,
        userAgent: report['user-agent'],
        documentUri: report['document-uri'],
        violatedDirective: report['violated-directive'],
        blockedUri: report['blocked-uri'],
      },
      timestamp: new Date(),
      severity: 'medium',
    });
  }

  /**
   * Generate report for Expect-CT violations
   */
  public handleExpectCTReport(report: any): void {
    securityService.logSecurityEvent({
      type: 'suspicious_activity',
      details: {
        reason: 'expect_ct_violation',
        report,
        hostname: report.hostname,
        port: report.port,
        effectiveExpiration: report['effective-expiration'],
        servedCertificateChain: report['served-certificate-chain'],
        validatedCertificateChain: report['validated-certificate-chain'],
      },
      timestamp: new Date(),
      severity: 'high',
    });
  }
}

// Export singleton instance
export const securityHeaders = SecurityHeaders.getInstance();

// Utility functions for framework integration
export const getSecurityHeaders = (config?: Partial<SecurityHeadersConfig>) => {
  return securityHeaders.generateHeaders(config);
};

export const applySecurityHeaders = (response: any, config?: Partial<SecurityHeadersConfig>) => {
  return securityHeaders.applyHeaders(response, config);
};

export const getViteSecurityHeaders = () => {
  return securityHeaders.getViteHeaders();
};