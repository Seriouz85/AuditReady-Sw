/**
 * Multi-Domain Support Service
 * Handles enterprise custom domains and subdomain routing
 */

export interface DomainConfig {
  domain: string;
  organizationId: string;
  isCustomDomain: boolean;
  certificateStatus: 'pending' | 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface DomainValidation {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

class MultiDomainService {
  private readonly ALLOWED_DOMAINS = [
    'auditready.com',
    'auditready.dev',
    'localhost'
  ];

  /**
   * Get the current domain configuration
   */
  getCurrentDomain(): string {
    return window.location.hostname;
  }

  /**
   * Extract organization identifier from subdomain
   */
  getOrganizationFromDomain(domain?: string): string | null {
    const hostname = domain || this.getCurrentDomain();
    
    // For custom domains like company.auditready.com
    if (hostname.includes('.auditready.com')) {
      const subdomain = hostname.split('.auditready.com')[0];
      return subdomain === 'app' ? null : (subdomain || null);
    }
    
    // For fully custom domains
    if (!this.ALLOWED_DOMAINS.some(allowed => hostname.includes(allowed))) {
      return hostname.replace(/\./g, '-');
    }
    
    return null;
  }

  /**
   * Validate a custom domain
   */
  validateDomain(domain: string): DomainValidation {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic format validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      errors.push('Invalid domain format');
      suggestions.push('Use format: company.example.com');
    }

    // Check for reserved domains
    if (this.ALLOWED_DOMAINS.some(reserved => domain.includes(reserved))) {
      errors.push('Cannot use reserved domain');
      suggestions.push('Use your own company domain');
    }

    // Length validation
    if (domain.length > 253) {
      errors.push('Domain name too long (max 253 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Generate subdomain for organization
   */
  generateSubdomain(organizationName: string): string {
    return organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 63);
  }

  /**
   * Check if current domain requires special handling
   */
  isCustomDomain(): boolean {
    const domain = this.getCurrentDomain();
    return !this.ALLOWED_DOMAINS.some(allowed => domain.includes(allowed));
  }

  /**
   * Get the appropriate base URL for API calls
   */
  getApiBaseUrl(): string {
    const domain = this.getCurrentDomain();
    
    if (domain.includes('localhost')) {
      return 'http://localhost:8080';
    }
    
    if (domain.includes('auditready.com')) {
      return 'https://api.auditready.com';
    }
    
    // For custom domains, use the same domain with api subdomain
    return `https://api.${domain}`;
  }

  /**
   * Handle domain-specific routing
   */
  getDomainSpecificRoutes(): { [key: string]: string } {
    const orgId = this.getOrganizationFromDomain();
    
    if (orgId) {
      return {
        login: `/org/${orgId}/login`,
        signup: `/org/${orgId}/signup`,
        dashboard: `/org/${orgId}/dashboard`
      };
    }
    
    return {
      login: '/login',
      signup: '/signup', 
      dashboard: '/dashboard'
    };
  }

  /**
   * Configure CORS for custom domains
   */
  getCorsOrigins(): string[] {
    const domain = this.getCurrentDomain();
    
    return [
      'https://auditready.com',
      'https://*.auditready.com',
      `https://${domain}`,
      'http://localhost:8080'
    ];
  }

  /**
   * Get domain-specific branding
   */
  getDomainBranding(): { logo?: string; primaryColor?: string; name?: string } {
    const orgId = this.getOrganizationFromDomain();
    
    if (orgId) {
      // In a real implementation, this would fetch from database
      return {
        logo: `/api/organizations/${orgId}/logo`,
        primaryColor: '#2563eb',
        name: orgId.charAt(0).toUpperCase() + orgId.slice(1)
      };
    }
    
    return {
      logo: '/ar-logo.jpeg',
      primaryColor: '#2563eb',
      name: 'AuditReady'
    };
  }
}

export const multiDomainService = new MultiDomainService();