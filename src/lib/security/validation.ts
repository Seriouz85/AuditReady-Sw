import { z } from 'zod';
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[char];
    });
};

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const organizationNameSchema = z
  .string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.&()]+$/, 'Organization name contains invalid characters');

// File upload validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

export const validateFileName = (fileName: string): boolean => {
  // Check for directory traversal attempts
  if (fileName.includes('../') || fileName.includes('..\\')) {
    return false;
  }
  
  // Check for null bytes
  if (fileName.includes('\0')) {
    return false;
  }
  
  // Check for reserved characters
  // eslint-disable-next-line no-control-regex
  const reservedChars = /[<>:"\/\\|?*\x00-\x1f]/;
  if (reservedChars.test(fileName)) {
    return false;
  }
  
  return true;
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const urlObject = new URL(url);
    // Only allow HTTPS and HTTP
    return ['https:', 'http:'].includes(urlObject.protocol);
  } catch {
    return false;
  }
};

// Rate limiting helpers
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this key
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > now - this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Create rate limiters for different operations
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

// JWT token validation
export const validateJWTStructure = (token: string): boolean => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    // Validate base64 encoding of header and payload
    atob(parts[0]);
    atob(parts[1]);
    return true;
  } catch {
    return false;
  }
};

// CSRF token validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};

// SQL injection prevention (for dynamic queries)
export const escapeSQLIdentifier = (identifier: string): string => {
  // Remove any non-alphanumeric characters except underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
};

// XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Content validation schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  type: z.enum(['policy', 'procedure', 'guideline', 'template', 'evidence']),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  framework_id: uuidSchema,
  due_date: z.string().datetime().optional(),
  assigned_to: z.array(uuidSchema).max(50).optional(),
});

export const updateRequirementStatusSchema = z.object({
  status: z.enum(['fulfilled', 'partially_fulfilled', 'not_fulfilled', 'not_applicable']),
  implementation_notes: z.string().max(2000).optional(),
  evidence_links: z.array(uuidSchema).max(20).optional(),
  due_date: z.string().datetime().optional(),
});

// Export all schemas for use in API endpoints
export const validationSchemas = {
  email: emailSchema,
  password: passwordSchema,
  uuid: uuidSchema,
  slug: slugSchema,
  organizationName: organizationNameSchema,
  createDocument: createDocumentSchema,
  createAssessment: createAssessmentSchema,
  updateRequirementStatus: updateRequirementStatusSchema,
};