# RAG Security Implementation Proposal

## Overview

This document outlines the specific security enhancements needed for the RAG knowledge system, prioritized by risk level and implementation complexity.

## Phase 1: Critical Security Fixes (Week 1-2)

### 1. Input Sanitization Service

Create a comprehensive input sanitization service:

```typescript
// src/services/security/ContentSanitizationService.ts
import DOMPurify from 'dompurify';
import { createDOMPurifyInstance } from 'isomorphic-dompurify';

export interface SanitizationConfig {
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
  stripComments: boolean;
  stripScripts: boolean;
  maxLength?: number;
}

export class ContentSanitizationService {
  private static readonly DEFAULT_CONFIG: SanitizationConfig = {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title']
    },
    stripComments: true,
    stripScripts: true,
    maxLength: 100000 // 100KB limit
  };

  static sanitizeHTML(html: string, config: Partial<SanitizationConfig> = {}): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Length check
    if (finalConfig.maxLength && html.length > finalConfig.maxLength) {
      throw new SecurityError(`Content exceeds maximum length of ${finalConfig.maxLength} characters`);
    }

    // Use isomorphic DOMPurify for browser/server compatibility
    const purify = createDOMPurifyInstance();
    
    return purify.sanitize(html, {
      ALLOWED_TAGS: finalConfig.allowedTags,
      ALLOWED_ATTR: finalConfig.allowedAttributes,
      REMOVE_DATA_ATTRIBUTES: true,
      REMOVE_UNKNOWN_PROTOCOLS: true,
      USE_PROFILES: { html: true },
      KEEP_CONTENT: true,
      ADD_TAGS: [],
      ADD_ATTR: [],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
  }

  static sanitizeText(text: string): string {
    // Remove potential script injections
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/expression\s*\(/gi, '')
      .trim();
  }

  static validateURL(url: string): { isValid: boolean; sanitizedUrl?: string; error?: string } {
    try {
      const parsed = new URL(url);
      
      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS protocols allowed' };
      }

      // Block dangerous patterns
      const hostname = parsed.hostname.toLowerCase();
      
      // Block private IPs
      if (this.isPrivateIP(hostname)) {
        return { isValid: false, error: 'Private IP addresses not allowed' };
      }

      // Block localhost
      if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) {
        return { isValid: false, error: 'Localhost access not allowed' };
      }

      // Block suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.onion'];
      if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
        return { isValid: false, error: 'Suspicious domain extension' };
      }

      return { isValid: true, sanitizedUrl: parsed.toString() };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  private static isPrivateIP(hostname: string): boolean {
    // IPv4 private ranges
    const ipv4Patterns = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // Link-local
      /^224\./, // Multicast
    ];

    // IPv6 private ranges
    const ipv6Patterns = [
      /^fe80:/i, // Link-local
      /^fc00:/i, // Unique local
      /^fd00:/i, // Unique local
    ];

    return ipv4Patterns.concat(ipv6Patterns).some(pattern => pattern.test(hostname));
  }
}

export class SecurityError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
```

### 2. Enhanced URL Validation

Update the KnowledgeIngestionService with secure URL validation:

```typescript
// Add to src/services/rag/KnowledgeIngestionService.ts
import { ContentSanitizationService, SecurityError } from '@/services/security/ContentSanitizationService';

export class KnowledgeIngestionService {
  private static readonly TRUSTED_DOMAINS = [
    'nist.gov',
    'iso.org',
    'sans.org',
    'cisa.gov',
    'owasp.org',
    'mitre.org',
    'enisa.europa.eu'
  ];

  private static readonly RATE_LIMIT_MAP = new Map<string, number>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly MAX_REQUESTS_PER_MINUTE = 10;

  static async ingestFromURL(
    url: string, 
    options: Partial<KnowledgeSource> = {}
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    
    try {
      // Security validation
      await this.performSecurityValidation(url);
      
      // Rate limiting
      await this.enforceRateLimit(url);
      
      // Continue with existing ingestion logic...
      return await this.performSecureIngestion(url, options, startTime);
      
    } catch (error) {
      if (error instanceof SecurityError) {
        console.warn(`[KnowledgeIngestion] Security violation: ${error.message}`);
        await this.logSecurityEvent('url_validation_failed', { url, error: error.message });
      }
      throw error;
    }
  }

  private static async performSecurityValidation(url: string): Promise<void> {
    // URL format validation
    const urlValidation = ContentSanitizationService.validateURL(url);
    if (!urlValidation.isValid) {
      throw new SecurityError(`Invalid URL: ${urlValidation.error}`);
    }

    // Domain trust check
    const hostname = new URL(url).hostname;
    if (!this.isDomainTrusted(hostname)) {
      throw new SecurityError(`Domain not in trusted list: ${hostname}`);
    }

    // DNS resolution check (prevent DNS rebinding)
    try {
      const resolved = await this.resolveDNSSecure(hostname);
      if (!resolved.isValid) {
        throw new SecurityError(`DNS resolution failed: ${resolved.error}`);
      }
    } catch (error) {
      throw new SecurityError(`DNS validation failed: ${error}`);
    }
  }

  private static async enforceRateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const now = Date.now();
    const lastRequest = this.RATE_LIMIT_MAP.get(domain) || 0;
    
    if (now - lastRequest < this.RATE_LIMIT_WINDOW / this.MAX_REQUESTS_PER_MINUTE) {
      throw new SecurityError(`Rate limit exceeded for domain: ${domain}`);
    }
    
    this.RATE_LIMIT_MAP.set(domain, now);
  }

  private static isDomainTrusted(hostname: string): boolean {
    return this.TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  }

  private static async resolveDNSSecure(hostname: string): Promise<{ isValid: boolean; error?: string }> {
    // Use secure DNS resolution to prevent DNS rebinding attacks
    try {
      // In a real implementation, use a secure DNS resolver
      // For now, simulate with basic checks
      if (hostname.includes('..') || hostname.includes('//')) {
        return { isValid: false, error: 'Invalid hostname format' };
      }
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'DNS resolution failed' };
    }
  }
}
```

### 3. Server-Side Admin Authorization

Create a robust admin authorization service:

```typescript
// src/services/security/AdminAuthorizationService.ts
import { supabase } from '@/lib/supabase';

export interface AdminPermission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export class AdminAuthorizationService {
  private static readonly PERMISSION_CACHE = new Map<string, { permissions: string[]; expiry: number }>();
  private static readonly CACHE_TTL = 300000; // 5 minutes

  static async validateAdminPermission(
    userId: string,
    permission: AdminPermission,
    context: SecurityContext
  ): Promise<{ authorized: boolean; reason?: string }> {
    try {
      // 1. Validate user session
      const sessionValid = await this.validateUserSession(userId, context.sessionId);
      if (!sessionValid) {
        await this.logSecurityEvent('invalid_session', { userId, sessionId: context.sessionId });
        return { authorized: false, reason: 'Invalid session' };
      }

      // 2. Check if user is platform admin
      const adminStatus = await this.getPlatformAdminStatus(userId);
      if (!adminStatus.isAdmin) {
        await this.logSecurityEvent('unauthorized_access_attempt', { 
          userId, 
          permission, 
          context 
        });
        return { authorized: false, reason: 'User is not a platform administrator' };
      }

      // 3. Validate specific permission
      const hasPermission = await this.userHasPermission(userId, permission);
      if (!hasPermission) {
        await this.logSecurityEvent('insufficient_permissions', { 
          userId, 
          permission, 
          userPermissions: adminStatus.permissions 
        });
        return { authorized: false, reason: 'Insufficient permissions' };
      }

      // 4. Validate IP restrictions (if any)
      const ipValid = await this.validateIPRestrictions(userId, context.ipAddress);
      if (!ipValid) {
        await this.logSecurityEvent('ip_restriction_violation', { 
          userId, 
          ipAddress: context.ipAddress 
        });
        return { authorized: false, reason: 'IP address not authorized' };
      }

      // 5. Check rate limits
      const rateLimitValid = await this.checkRateLimit(userId, permission.action);
      if (!rateLimitValid) {
        await this.logSecurityEvent('rate_limit_exceeded', { userId, action: permission.action });
        return { authorized: false, reason: 'Rate limit exceeded' };
      }

      // Log successful authorization
      await this.logSecurityEvent('admin_action_authorized', { 
        userId, 
        permission, 
        context 
      });

      return { authorized: true };

    } catch (error) {
      console.error('[AdminAuth] Authorization check failed:', error);
      await this.logSecurityEvent('authorization_error', { 
        userId, 
        permission, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return { authorized: false, reason: 'Authorization check failed' };
    }
  }

  private static async getPlatformAdminStatus(userId: string): Promise<{
    isAdmin: boolean;
    permissions: string[];
    constraints?: Record<string, any>;
  }> {
    // Check cache first
    const cached = this.PERMISSION_CACHE.get(userId);
    if (cached && Date.now() < cached.expiry) {
      return { isAdmin: true, permissions: cached.permissions };
    }

    try {
      const { data, error } = await supabase
        .from('platform_administrators')
        .select(`
          *,
          admin_roles (
            name,
            permissions,
            constraints
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isAdmin: false, permissions: [] };
      }

      // Cache the result
      const permissions = data.admin_roles?.permissions || [];
      this.PERMISSION_CACHE.set(userId, {
        permissions,
        expiry: Date.now() + this.CACHE_TTL
      });

      return {
        isAdmin: true,
        permissions,
        constraints: data.admin_roles?.constraints
      };

    } catch (error) {
      console.error('[AdminAuth] Failed to check admin status:', error);
      return { isAdmin: false, permissions: [] };
    }
  }

  private static async validateUserSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Validate against Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session || session.user.id !== userId) {
        return false;
      }

      // Additional session validation can be added here
      return true;

    } catch (error) {
      console.error('[AdminAuth] Session validation failed:', error);
      return false;
    }
  }

  private static async userHasPermission(
    userId: string,
    permission: AdminPermission
  ): Promise<boolean> {
    const adminStatus = await this.getPlatformAdminStatus(userId);
    
    if (!adminStatus.isAdmin) {
      return false;
    }

    // Check if user has the specific permission
    const requiredPermission = `${permission.resource}:${permission.action}`;
    return adminStatus.permissions.includes(requiredPermission) || 
           adminStatus.permissions.includes('*') || // Super admin
           adminStatus.permissions.includes(`${permission.resource}:*`); // Resource admin
  }

  private static async validateIPRestrictions(userId: string, ipAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_ip_restrictions')
        .select('allowed_ips')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('[AdminAuth] IP restriction check failed:', error);
        return true; // Allow access if check fails (fail open)
      }

      if (!data || data.length === 0) {
        return true; // No restrictions
      }

      // Check if IP is in allowed list
      const allowedIPs = data[0].allowed_ips || [];
      return allowedIPs.includes(ipAddress) || allowedIPs.includes('*');

    } catch (error) {
      console.error('[AdminAuth] IP validation error:', error);
      return true; // Fail open
    }
  }

  private static async checkRateLimit(userId: string, action: string): Promise<boolean> {
    // Implement rate limiting logic
    // For now, return true
    return true;
  }

  private static async logSecurityEvent(
    eventType: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('security_audit_log')
        .insert({
          event_type: eventType,
          event_category: 'security',
          actor_id: data.userId,
          event_data: data,
          ip_address: data.ipAddress,
          timestamp: new Date().toISOString(),
          severity: this.getSeverityForEvent(eventType)
        });
    } catch (error) {
      console.error('[AdminAuth] Failed to log security event:', error);
    }
  }

  private static getSeverityForEvent(eventType: string): string {
    const severityMap: Record<string, string> = {
      'unauthorized_access_attempt': 'high',
      'ip_restriction_violation': 'high',
      'rate_limit_exceeded': 'medium',
      'invalid_session': 'medium',
      'insufficient_permissions': 'low',
      'admin_action_authorized': 'low'
    };
    return severityMap[eventType] || 'low';
  }
}
```

## Phase 2: Content Security Pipeline (Week 3-4)

### Content Validation Service

```typescript
// src/services/security/ContentValidationService.ts
export interface ContentValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  recommendations: string[];
  quarantined: boolean;
}

export interface ValidationIssue {
  type: 'security' | 'quality' | 'policy' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  suggestion?: string;
}

export class ContentValidationService {
  static async validateContent(
    content: string,
    source: KnowledgeSource,
    context: ValidationContext
  ): Promise<ContentValidationResult> {
    const issues: ValidationIssue[] = [];
    let confidence = 1.0;

    // 1. Security validation
    const securityIssues = await this.performSecurityValidation(content);
    issues.push(...securityIssues);

    // 2. Content policy validation
    const policyIssues = await this.performPolicyValidation(content);
    issues.push(...policyIssues);

    // 3. Quality assessment
    const qualityIssues = await this.performQualityValidation(content);
    issues.push(...qualityIssues);

    // 4. Compliance check
    const complianceIssues = await this.performComplianceValidation(content, source);
    issues.push(...complianceIssues);

    // Calculate overall confidence
    confidence = this.calculateConfidence(issues);

    // Determine if content should be quarantined
    const quarantined = this.shouldQuarantine(issues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      confidence,
      issues,
      recommendations,
      quarantined
    };
  }

  private static async performSecurityValidation(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for malicious patterns
    const maliciousPatterns = [
      { pattern: /<script[^>]*>.*?<\/script>/gi, description: 'JavaScript code detected' },
      { pattern: /javascript:/gi, description: 'JavaScript protocol detected' },
      { pattern: /data:text\/html/gi, description: 'HTML data URI detected' },
      { pattern: /eval\s*\(/gi, description: 'eval() function detected' },
      { pattern: /document\.write\s*\(/gi, description: 'document.write() detected' }
    ];

    for (const { pattern, description } of maliciousPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'security',
          severity: 'critical',
          description,
          suggestion: 'Remove or sanitize the detected code'
        });
      }
    }

    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urls = content.match(urlPattern) || [];
    
    for (const url of urls) {
      const validation = ContentSanitizationService.validateURL(url);
      if (!validation.isValid) {
        issues.push({
          type: 'security',
          severity: 'high',
          description: `Suspicious URL detected: ${url}`,
          suggestion: 'Verify URL safety before including'
        });
      }
    }

    return issues;
  }

  private static async performPolicyValidation(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for inappropriate content
    const inappropriatePatterns = [
      /\b(password|secret|key|token)\s*[:=]\s*\S+/gi,
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card patterns
      /\b\d{3}-\d{2}-\d{4}\b/g // SSN patterns
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'policy',
          severity: 'high',
          description: 'Potentially sensitive information detected',
          suggestion: 'Remove or redact sensitive information'
        });
      }
    }

    return issues;
  }

  private static async performQualityValidation(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Basic quality checks
    if (content.length < 100) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        description: 'Content is too short',
        suggestion: 'Ensure content provides sufficient information'
      });
    }

    if (content.length > 50000) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        description: 'Content is very long',
        suggestion: 'Consider breaking into smaller sections'
      });
    }

    // Check for readability
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence > 30) {
      issues.push({
        type: 'quality',
        severity: 'low',
        description: 'Sentences may be too long',
        suggestion: 'Consider breaking down complex sentences'
      });
    }

    return issues;
  }

  private static async performComplianceValidation(
    content: string,
    source: KnowledgeSource
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for required framework references
    const requiredFrameworks = source.complianceFrameworks || [];
    const frameworkMentions = this.findFrameworkMentions(content);

    for (const framework of requiredFrameworks) {
      if (!frameworkMentions.includes(framework.toLowerCase())) {
        issues.push({
          type: 'compliance',
          severity: 'medium',
          description: `Missing reference to required framework: ${framework}`,
          suggestion: `Add relevant ${framework} guidance or references`
        });
      }
    }

    return issues;
  }

  private static findFrameworkMentions(content: string): string[] {
    const frameworks = ['iso 27001', 'nist', 'sox', 'gdpr', 'hipaa', 'pci dss', 'cis controls'];
    const lowerContent = content.toLowerCase();
    
    return frameworks.filter(framework => 
      lowerContent.includes(framework)
    );
  }

  private static calculateConfidence(issues: ValidationIssue[]): number {
    let confidence = 1.0;
    
    for (const issue of issues) {
      const penalty = {
        'critical': 0.5,
        'high': 0.3,
        'medium': 0.2,
        'low': 0.1
      }[issue.severity] || 0;
      
      confidence -= penalty;
    }
    
    return Math.max(0, confidence);
  }

  private static shouldQuarantine(issues: ValidationIssue[]): boolean {
    return issues.some(issue => 
      issue.type === 'security' && ['critical', 'high'].includes(issue.severity)
    );
  }

  private static generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations = new Set<string>();
    
    for (const issue of issues) {
      if (issue.suggestion) {
        recommendations.add(issue.suggestion);
      }
    }
    
    // Add general recommendations based on issue types
    const issueTypes = new Set(issues.map(i => i.type));
    
    if (issueTypes.has('security')) {
      recommendations.add('Review content for security vulnerabilities');
    }
    
    if (issueTypes.has('policy')) {
      recommendations.add('Ensure content complies with organizational policies');
    }
    
    if (issueTypes.has('quality')) {
      recommendations.add('Improve content quality and readability');
    }
    
    return Array.from(recommendations);
  }
}
```

## Phase 3: Database Security Enhancements (Week 5-6)

### Enhanced RLS Policies

```sql
-- src/database/security_policies.sql

-- Create admin validation function
CREATE OR REPLACE FUNCTION auth.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_administrators pa
    WHERE pa.user_id = auth.uid()
    AND pa.is_active = true
    AND pa.permissions ? 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS for knowledge_sources
DROP POLICY IF EXISTS "Platform admin full access" ON knowledge_sources;
CREATE POLICY "Platform admin full access" ON knowledge_sources
  FOR ALL TO authenticated
  USING (auth.is_platform_admin())
  WITH CHECK (auth.is_platform_admin());

-- Read-only access for regular users
CREATE POLICY "Users can view approved sources" ON knowledge_sources
  FOR SELECT TO authenticated
  USING (
    status = 'active' 
    AND NOT auth.is_platform_admin()
  );

-- Enhanced RLS for knowledge_content
CREATE POLICY "Admin content management" ON knowledge_content
  FOR ALL TO authenticated
  USING (auth.is_platform_admin())
  WITH CHECK (auth.is_platform_admin());

CREATE POLICY "Users can view validated content" ON knowledge_content
  FOR SELECT TO authenticated
  USING (
    validation_status = 'validated'
    AND NOT auth.is_platform_admin()
  );

-- Audit log protection
CREATE POLICY "Audit log insert only" ON security_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Audit log admin read" ON security_audit_log
  FOR SELECT TO authenticated
  USING (auth.is_platform_admin());

-- Content approval workflow
CREATE POLICY "Admin approval workflow" ON content_approval_workflow
  FOR ALL TO authenticated
  USING (auth.is_platform_admin())
  WITH CHECK (auth.is_platform_admin());

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_event_category TEXT,
  p_target_resource TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_previous_hash TEXT;
  v_event_hash TEXT;
BEGIN
  -- Get previous hash for chain integrity
  SELECT event_hash INTO v_previous_hash
  FROM security_audit_log
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Generate new event ID
  v_event_id := gen_random_uuid();
  
  -- Calculate event hash (simplified)
  v_event_hash := encode(
    digest(
      v_event_id::TEXT || p_event_type || p_event_category || COALESCE(v_previous_hash, ''),
      'sha256'
    ),
    'hex'
  );
  
  -- Insert audit record
  INSERT INTO security_audit_log (
    id,
    event_type,
    event_category,
    actor_id,
    target_resource,
    target_id,
    event_data,
    severity,
    ip_address,
    user_agent,
    event_hash,
    previous_hash
  ) VALUES (
    v_event_id,
    p_event_type,
    p_event_category,
    auth.uid(),
    p_target_resource,
    p_target_id,
    p_event_data,
    p_severity,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    v_event_hash,
    v_previous_hash
  );
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic audit logging
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_security_event(
    TG_OP::TEXT,
    'data_modification',
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(NEW)::jsonb,
    'low'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_knowledge_sources
  AFTER INSERT OR UPDATE OR DELETE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_knowledge_content
  AFTER INSERT OR UPDATE OR DELETE ON knowledge_content
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Rate limiting table and function
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Get current rate limit state
  SELECT request_count, window_start
  INTO v_current_count, v_window_start
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND resource_type = p_resource_type
    AND (resource_id = p_resource_id OR (resource_id IS NULL AND p_resource_id IS NULL));
  
  -- If no record exists or window expired, create/reset
  IF NOT FOUND OR v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    INSERT INTO rate_limits (user_id, resource_type, resource_id, request_count, window_start)
    VALUES (auth.uid(), p_resource_type, p_resource_id, 1, NOW())
    ON CONFLICT (user_id, resource_type, resource_id)
    DO UPDATE SET request_count = 1, window_start = NOW();
    
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  IF v_current_count < p_max_requests THEN
    UPDATE rate_limits
    SET request_count = request_count + 1
    WHERE user_id = auth.uid()
      AND resource_type = p_resource_type
      AND (resource_id = p_resource_id OR (resource_id IS NULL AND p_resource_id IS NULL));
    
    RETURN TRUE;
  END IF;
  
  -- Log rate limit violation
  PERFORM log_security_event(
    'rate_limit_exceeded',
    'security',
    p_resource_type,
    NULL,
    jsonb_build_object(
      'resource_id', p_resource_id,
      'current_count', v_current_count,
      'max_requests', p_max_requests,
      'window_minutes', p_window_minutes
    ),
    'medium'
  );
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Implementation Timeline

### Week 1-2: Critical Security Fixes
- [ ] Implement ContentSanitizationService
- [ ] Add secure URL validation to KnowledgeIngestionService
- [ ] Deploy AdminAuthorizationService
- [ ] Update admin components to use server-side validation

### Week 3-4: Content Security Pipeline
- [ ] Deploy ContentValidationService
- [ ] Implement content approval workflow
- [ ] Add threat detection capabilities
- [ ] Create content quarantine system

### Week 5-6: Database Security
- [ ] Deploy enhanced RLS policies
- [ ] Implement audit logging system
- [ ] Add rate limiting functionality
- [ ] Create security monitoring dashboard

### Week 7-8: Testing and Monitoring
- [ ] Comprehensive security testing
- [ ] Performance optimization
- [ ] Security monitoring setup
- [ ] Documentation and training

## Testing Strategy

### Security Test Cases
1. **Input Sanitization Tests**
   - XSS payload injection
   - HTML tag stripping
   - JavaScript code removal
   - SQL injection attempts

2. **URL Validation Tests**
   - Private IP blocking
   - Protocol validation
   - Domain allowlist enforcement
   - DNS rebinding prevention

3. **Access Control Tests**
   - Privilege escalation attempts
   - Session validation
   - IP restriction enforcement
   - Permission boundary testing

4. **Content Security Tests**
   - Malicious content detection
   - Policy violation identification
   - Quality threshold validation
   - Compliance requirement checking

## Monitoring and Alerting

### Key Metrics to Monitor
- Failed authentication attempts
- Rate limit violations
- Content validation failures
- Admin action frequency
- Unusual access patterns

### Alert Thresholds
- **Critical**: Security policy violations, admin privilege escalation attempts
- **High**: Multiple failed authentications, suspicious content detection
- **Medium**: Rate limit exceeding, quality threshold failures
- **Low**: Normal admin actions, successful validations

## Rollback Plan

1. **Database Changes**: All migrations include rollback scripts
2. **Service Changes**: Feature flags for gradual rollout
3. **Monitoring**: Real-time performance and error monitoring
4. **Backup Strategy**: Automated daily backups before deployments

This implementation proposal provides a comprehensive security enhancement plan that can be executed in phases while maintaining system availability and performance.