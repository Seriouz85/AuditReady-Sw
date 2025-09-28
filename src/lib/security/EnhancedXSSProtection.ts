import DOMPurify from 'dompurify';
import { securityService } from './SecurityService';

// Enhanced HTML sanitization with multiple security layers and threat detection
export class EnhancedXSSProtection {
  private static instance: EnhancedXSSProtection;
  private purifyConfig: DOMPurify.Config;
  private suspiciousPatterns: RegExp[];

  private constructor() {
    this.purifyConfig = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'width', 'height',
        'class', 'id',
      ],
      ALLOW_DATA_ATTR: false, // Disabled for security
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: true, // Enable Trusted Types if available
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
      // Block dangerous elements
      FORBID_TAGS: [
        'script', 'style', 'iframe', 'object', 'embed', 'applet',
        'form', 'input', 'button', 'textarea', 'select', 'option',
        'meta', 'link', 'base', 'frame', 'frameset',
        'svg', 'math', 'details', 'summary',
      ],
      FORBID_ATTR: [
        'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
        'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
        'onkeydown', 'onkeyup', 'onkeypress', 'onmousedown',
        'onmouseup', 'onmousemove', 'oncontextmenu', 'ondblclick',
        'onwheel', 'onscroll', 'onresize', 'onhashchange',
        'onpopstate', 'onpagehide', 'onpageshow', 'onbeforeunload',
        'onunload', 'oninput', 'onvalid', 'oninvalid',
        'formaction', 'formenctype', 'formmethod', 'formnovalidate',
        'formtarget', 'srcdoc', 'sandbox',
      ],
      USE_PROFILES: { html: true },
    };

    // Patterns that indicate potential XSS attempts
    this.suspiciousPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/x-httpd-php/gi,
      /<script[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /<applet[\s\S]*?<\/applet>/gi,
      /<link[\s\S]*?>/gi,
      /<meta[\s\S]*?>/gi,
      /<style[\s\S]*?<\/style>/gi,
      /<svg[\s\S]*?<\/svg>/gi,
      /expression\s*\(/gi,
      /url\s*\(\s*["']?\s*javascript:/gi,
      /url\s*\(\s*["']?\s*data:/gi,
      /@import/gi,
      /binding\s*:/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
      /mocha:/gi,
      /livescript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\.write/gi,
      /document\.writeln/gi,
      /innerHTML/gi,
      /outerHTML/gi,
      /insertAdjacentHTML/gi,
      /fromCharCode/gi,
      /String\.fromCharCode/gi,
      /unescape/gi,
      /decodeURI/gi,
      /decodeURIComponent/gi,
      /atob/gi,
      /btoa/gi,
      /ActiveXObject/gi,
      /XMLHttpRequest/gi,
      /fetch\s*\(/gi,
      /WebSocket/gi,
      /EventSource/gi,
      /SharedWorker/gi,
      /Worker/gi,
      /ImportScripts/gi,
      /location\s*=/gi,
      /location\.href/gi,
      /location\.replace/gi,
      /location\.assign/gi,
      /window\.open/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi,
      /console\./gi,
    ];

    this.addSecurityHooks();
  }

  public static getInstance(): EnhancedXSSProtection {
    if (!EnhancedXSSProtection.instance) {
      EnhancedXSSProtection.instance = new EnhancedXSSProtection();
    }
    return EnhancedXSSProtection.instance;
  }

  // Pre-sanitization threat detection
  private detectThreats(input: string, userId?: string): void {
    let threatsDetected = 0;
    const detectedPatterns: string[] = [];

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        threatsDetected++;
        detectedPatterns.push(pattern.source);
      }
    }

    if (threatsDetected > 0) {
      securityService.logSecurityEvent({
        type: 'suspicious_activity',
        userId,
        details: {
          reason: 'xss_attempt_detected',
          threatsCount: threatsDetected,
          patterns: detectedPatterns,
          inputLength: input.length,
          inputSnippet: input.substring(0, 100), // First 100 chars for analysis
        },
        timestamp: new Date(),
        severity: threatsDetected > 3 ? 'high' : 'medium',
      });
    }
  }

  // Sanitize rich text content (for editors, comments, etc.)
  public sanitizeRichText(input: string, userId?: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Detect threats before sanitization
    this.detectThreats(input, userId);

    const sanitized = DOMPurify.sanitize(input, {
      ...this.purifyConfig,
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a',
      ],
      ALLOWED_ATTR: ['href', 'title', 'class', 'rel'],
    });

    // Verify sanitization was effective
    this.verifySanitization(input, sanitized, userId);

    return sanitized;
  }

  // Sanitize plain text (removes all HTML)
  public sanitizePlainText(input: string, userId?: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Detect potential threats even in plain text
    this.detectThreats(input, userId);

    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // Additional text-based sanitization
    return sanitized
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[\uFEFF\uFFFE\uFFFF]/g, '') // Remove BOM and other special chars
      .trim();
  }

  // Sanitize for search/display (very restrictive)
  public sanitizeForDisplay(input: string, userId?: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    this.detectThreats(input, userId);

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['strong', 'em', 'u'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  // Sanitize URL parameters and form data
  public sanitizeFormData(data: Record<string, any>, userId?: string): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        this.detectThreats(value, userId);
        sanitized[key] = this.sanitizePlainText(value, userId);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizePlainText(item, userId) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Verify that sanitization removed threats
  private verifySanitization(original: string, sanitized: string, userId?: string): void {
    // Check if dangerous patterns still exist after sanitization
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        securityService.logSecurityEvent({
          type: 'suspicious_activity',
          userId,
          details: {
            reason: 'sanitization_bypass_detected',
            pattern: pattern.source,
            originalLength: original.length,
            sanitizedLength: sanitized.length,
            originalSnippet: original.substring(0, 100),
            sanitizedSnippet: sanitized.substring(0, 100),
          },
          timestamp: new Date(),
          severity: 'critical',
        });
      }
    }
  }

  // Custom hook for DOMPurify to add additional security
  private addSecurityHooks(): void {
    DOMPurify.addHook('beforeSanitizeElements', (node) => {
      // Log suspicious elements before removal
      if (node.tagName && ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED'].includes(node.tagName)) {
        securityService.logSecurityEvent({
          type: 'suspicious_activity',
          details: {
            reason: 'dangerous_element_detected',
            tagName: node.tagName,
            innerHTML: node.innerHTML?.substring(0, 100),
          },
          timestamp: new Date(),
          severity: 'high',
        });
      }

      // Remove any suspicious attributes
      if (node.hasAttributes && node.attributes) {
        const attributes = Array.from(node.attributes);
        attributes.forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          const attrValue = attr.value.toLowerCase();
          
          if (attrName.startsWith('on') ||
              attrValue.includes('javascript:') ||
              attrValue.includes('vbscript:') ||
              attrValue.includes('data:text/html') ||
              attrValue.includes('expression(')) {
            
            securityService.logSecurityEvent({
              type: 'suspicious_activity',
              details: {
                reason: 'dangerous_attribute_detected',
                tagName: node.tagName,
                attributeName: attrName,
                attributeValue: attrValue.substring(0, 100),
              },
              timestamp: new Date(),
              severity: 'high',
            });
            
            node.removeAttribute(attr.name);
          }
        });
      }
    });

    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      // Ensure links are safe and add security attributes
      if (node.tagName === 'A' && node.hasAttribute('href')) {
        const href = node.getAttribute('href');
        if (href && this.isValidUrl(href)) {
          // Add security attributes to external links
          if (!href.startsWith('/') && !href.startsWith('#')) {
            node.setAttribute('rel', 'noopener noreferrer');
            node.setAttribute('target', '_blank');
          }
        } else {
          node.removeAttribute('href');
        }
      }

      // Ensure images have safe sources
      if (node.tagName === 'IMG' && node.hasAttribute('src')) {
        const src = node.getAttribute('src');
        if (src && !this.isValidImageUrl(src)) {
          node.removeAttribute('src');
        }
      }
    });

    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      // Log when dangerous elements are removed
      if (data.allowedTags && !data.allowedTags[data.tagName]) {
        securityService.logSecurityEvent({
          type: 'suspicious_activity',
          details: {
            reason: 'forbidden_element_removed',
            tagName: data.tagName,
            nodeContent: node.textContent?.substring(0, 100),
          },
          timestamp: new Date(),
          severity: 'medium',
        });
      }
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
      
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return false;
      }

      // Block private IP ranges in production
      if (!import.meta.env.DEV) {
        const hostname = urlObj.hostname;
        const privateRanges = [
          /^127\./, // 127.0.0.0/8
          /^10\./, // 10.0.0.0/8
          /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
          /^192\.168\./, // 192.168.0.0/16
          /^localhost$/i,
          /^::1$/, // IPv6 localhost
        ];

        if (privateRanges.some(range => range.test(hostname))) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  private isValidImageUrl(url: string): boolean {
    if (url.startsWith('data:image/')) {
      // Allow data URIs for images but validate format
      const validDataImagePrefixes = [
        'data:image/jpeg;base64,',
        'data:image/jpg;base64,',
        'data:image/png;base64,',
        'data:image/gif;base64,',
        'data:image/webp;base64,',
        'data:image/svg+xml;base64,',
      ];
      
      return validDataImagePrefixes.some(prefix => url.startsWith(prefix));
    }

    return this.isValidUrl(url);
  }

  // Generate Content Security Policy for inline content
  public async generateInlineCSP(content: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `'sha256-${btoa(hashHex)}'`;
    }
    
    // Fallback: generate nonce
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    return `'nonce-${btoa(String.fromCharCode.apply(null, Array.from(nonce)))}'`;
  }

  // Enhanced HTML sanitization with context awareness
  public sanitizeWithContext(input: string, context: 'editor' | 'comment' | 'search' | 'display', userId?: string): string {
    switch (context) {
      case 'editor':
        return this.sanitizeRichText(input, userId);
      case 'comment':
        return this.sanitizeForComment(input, userId);
      case 'search':
        return this.sanitizePlainText(input, userId);
      case 'display':
        return this.sanitizeForDisplay(input, userId);
      default:
        return this.sanitizePlainText(input, userId);
    }
  }

  // Specialized sanitization for comments
  private sanitizeForComment(input: string, userId?: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    this.detectThreats(input, userId);

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'code'],
      ALLOWED_ATTR: ['href', 'rel'],
      KEEP_CONTENT: true,
    });
  }

  // Create a security report for the application
  public generateSecurityReport(): {
    xssProtection: 'enabled' | 'disabled';
    sanitizationActive: boolean;
    suspiciousPatterns: number;
    lastThreatDetected?: Date;
  } {
    return {
      xssProtection: 'enabled',
      sanitizationActive: true,
      suspiciousPatterns: this.suspiciousPatterns.length,
      lastThreatDetected: undefined, // Would track from security service
    };
  }
}

export const enhancedXSSProtection = EnhancedXSSProtection.getInstance();