import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Secure HTML Sanitizer for XSS Protection
 * Provides pre-configured sanitization profiles for different use cases
 */

// Configuration for rich text content (articles, pages, descriptions)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'title', 'alt',
    'class', 'id', 'style'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'frame'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  USE_PROFILES: { html: true }
};

// Configuration for basic content (comments, simple descriptions)
const BASIC_TEXT_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'frame'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

// Configuration for SVG content (diagrams, charts)
const SVG_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['svg', 'path', 'g', 'text', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'defs', 'marker', 'clipPath'],
  ADD_ATTR: [
    'viewBox', 'xmlns', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
    'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
    'width', 'height', 'transform', 'class', 'id'
  ],
  FORBID_TAGS: ['script', 'foreignObject'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror']
};

// Configuration for plain text (no HTML allowed)
const PLAIN_TEXT_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: []
};

/**
 * Sanitize rich text content (articles, documentation, etc.)
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG);
}

/**
 * Sanitize basic text content (comments, simple descriptions)
 */
export function sanitizeBasicText(html: string): string {
  return DOMPurify.sanitize(html, BASIC_TEXT_CONFIG);
}

/**
 * Sanitize SVG content (diagrams, charts, illustrations)
 */
export function sanitizeSVG(svg: string): string {
  return DOMPurify.sanitize(svg, SVG_CONFIG);
}

/**
 * Strip all HTML tags and return plain text
 */
export function sanitizeToPlainText(html: string): string {
  return DOMPurify.sanitize(html, PLAIN_TEXT_CONFIG);
}

/**
 * Sanitize with custom configuration
 */
export function sanitizeWithConfig(html: string, config: any): string {
  return DOMPurify.sanitize(html, config);
}

/**
 * Validate if content is safe (doesn't contain potentially dangerous elements)
 */
export function validateContent(html: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for common XSS patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<style/gi
  ];
  
  dangerousPatterns.forEach((pattern, index) => {
    if (pattern.test(html)) {
      const patternNames = [
        'JavaScript protocol',
        'VBScript protocol',
        'Data URL',
        'Event handlers',
        'Script tags',
        'Iframe tags',
        'Object tags',
        'Embed tags',
        'Link tags',
        'Style tags'
      ];
      issues.push(`Potentially dangerous ${patternNames[index]} detected`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * React hook for sanitizing content with memoization
 */
import { useMemo } from 'react';

export function useSanitizedContent(content: string, type: 'rich' | 'basic' | 'svg' | 'plain' = 'basic') {
  return useMemo(() => {
    switch (type) {
      case 'rich':
        return sanitizeRichText(content);
      case 'basic':
        return sanitizeBasicText(content);
      case 'svg':
        return sanitizeSVG(content);
      case 'plain':
        return sanitizeToPlainText(content);
      default:
        return sanitizeBasicText(content);
    }
  }, [content, type]);
}

/**
 * React component for safely rendering HTML content
 */
import React from 'react';

interface SafeHTMLProps {
  content: string;
  type?: 'rich' | 'basic' | 'svg' | 'plain';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  content, 
  type = 'basic', 
  className = '', 
  as: Component = 'div' 
}) => {
  const sanitizedContent = useSanitizedContent(content, type);
  
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

/**
 * Configure DOMPurify with additional security measures
 */
DOMPurify.addHook('beforeSanitizeElements', (node) => {
  // Remove any nodes with suspicious attributes
  if (node.hasAttribute && node.hasAttribute('data-bind')) {
    node.remove();
  }
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Ensure external links have proper security attributes
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
  
  // Remove any remaining event handlers
  Array.from(node.attributes || []).forEach(attr => {
    if (attr.name.startsWith('on')) {
      node.removeAttribute(attr.name);
    }
  });
});

export default {
  sanitizeRichText,
  sanitizeBasicText,
  sanitizeSVG,
  sanitizeToPlainText,
  sanitizeWithConfig,
  validateContent,
  SafeHTML
};