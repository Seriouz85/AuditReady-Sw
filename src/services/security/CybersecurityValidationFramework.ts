/**
 * Comprehensive Cybersecurity Validation Framework
 * Advanced multi-layer security validation system for AI Knowledge Nexus
 */

import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeRichText, stripHtml } from '@/lib/security/htmlSanitizer';

// === TYPES AND INTERFACES ===

export interface SecurityValidationResult {
  passed: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  threats_detected: SecurityThreat[];
  recommendations: string[];
  confidence_score: number;
  validation_layers: LayerValidationResult[];
  metadata: SecurityValidationMetadata;
}

export interface SecurityThreat {
  type: 'malicious_content' | 'phishing' | 'malware_link' | 'social_engineering' | 'data_exfiltration' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  mitigation: string;
  auto_remediation?: string;
}

export interface LayerValidationResult {
  layer_name: string;
  passed: boolean;
  score: number;
  execution_time_ms: number;
  details: string;
  threats_found: number;
}

export interface SecurityValidationMetadata {
  validated_at: string;
  validator_agent: string;
  processing_time_ms: number;
  content_hash: string;
  validation_version: string;
  source_ip?: string;
  user_agent?: string;
}

export interface ContentValidationRequest {
  content: string;
  content_type: 'web_scraped' | 'user_generated' | 'ai_generated' | 'external_api';
  source_url?: string;
  framework_context?: string[];
  user_id?: string;
  organization_id?: string;
  metadata?: Record<string, any>;
}

export interface AdminSecurityAction {
  action_type: 'approve' | 'reject' | 'quarantine' | 'escalate' | 'modify';
  content_id: string;
  admin_id: string;
  reason: string;
  security_notes?: string;
  remediation_applied?: string;
  follow_up_required?: boolean;
}

export interface SecurityMonitoringEvent {
  event_type: 'threat_detected' | 'validation_failed' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, any>;
  user_id?: string;
  organization_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  resolved: boolean;
  resolution_notes?: string;
}

// === MAIN CYBERSECURITY VALIDATION FRAMEWORK ===

export class CybersecurityValidationFramework {
  private static genAI: GoogleGenerativeAI | null = null;
  private static readonly VALIDATION_VERSION = '1.0.0';

  /**
   * Initialize AI client for security validation
   */
  private static initializeAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key required for security validation');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Multi-layer security validation pipeline
   */
  static async validateContent(request: ContentValidationRequest): Promise<SecurityValidationResult> {
    const startTime = Date.now();
    const contentHash = await this.generateContentHash(request.content);
    
    console.log(`[CyberSecurity] Starting validation for content type: ${request.content_type}`);

    try {
      // Layer 1: Static Security Analysis
      const staticAnalysis = await this.performStaticSecurityAnalysis(request);
      
      // Layer 2: Dynamic Threat Detection
      const threatDetection = await this.performThreatDetection(request);
      
      // Layer 3: AI-Powered Content Analysis
      const aiAnalysis = await this.performAISecurityAnalysis(request);
      
      // Layer 4: Framework-Specific Compliance Validation
      const complianceValidation = await this.validateFrameworkCompliance(request);
      
      // Layer 5: Contextual Security Assessment
      const contextualAssessment = await this.performContextualSecurityAssessment(request);

      // Aggregate results
      const validationLayers = [staticAnalysis, threatDetection, aiAnalysis, complianceValidation, contextualAssessment];
      const allThreats = validationLayers.flatMap(layer => layer.threats_found || []);
      
      // Calculate overall risk level
      const riskLevel = this.calculateRiskLevel(validationLayers);
      const overallPassed = validationLayers.every(layer => layer.passed);
      
      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(validationLayers, allThreats);

      const result: SecurityValidationResult = {
        passed: overallPassed,
        risk_level: riskLevel,
        threats_detected: allThreats,
        recommendations,
        confidence_score: this.calculateConfidenceScore(validationLayers),
        validation_layers: validationLayers.map(layer => ({
          layer_name: layer.layer_name,
          passed: layer.passed,
          score: layer.score,
          execution_time_ms: layer.execution_time_ms,
          details: layer.details,
          threats_found: layer.threats_found?.length || 0
        })),
        metadata: {
          validated_at: new Date().toISOString(),
          validator_agent: 'CybersecurityValidationFramework',
          processing_time_ms: Date.now() - startTime,
          content_hash: contentHash,
          validation_version: this.VALIDATION_VERSION,
          source_ip: request.metadata?.source_ip,
          user_agent: request.metadata?.user_agent
        }
      };

      // Store validation result for audit trail
      await this.storeValidationResult(result, request);

      // Trigger real-time monitoring if threats detected
      if (allThreats.length > 0) {
        await this.triggerSecurityMonitoring(result, request);
      }

      return result;

    } catch (error) {
      console.error('[CyberSecurity] Validation failed:', error);
      
      // Return critical risk result on validation failure
      return {
        passed: false,
        risk_level: 'critical',
        threats_detected: [{
          type: 'compliance_violation',
          severity: 'critical',
          description: 'Security validation system failure',
          evidence: [error instanceof Error ? error.message : 'Unknown error'],
          mitigation: 'Content blocked pending manual review'
        }],
        recommendations: ['Manual security review required', 'System error investigation needed'],
        confidence_score: 0,
        validation_layers: [],
        metadata: {
          validated_at: new Date().toISOString(),
          validator_agent: 'CybersecurityValidationFramework',
          processing_time_ms: Date.now() - startTime,
          content_hash: contentHash,
          validation_version: this.VALIDATION_VERSION
        }
      };
    }
  }

  /**
   * Layer 1: Static Security Analysis
   */
  private static async performStaticSecurityAnalysis(request: ContentValidationRequest): Promise<any> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];

    // Sanitize content first
    const sanitizedContent = sanitizeRichText(request.content);
    const textContent = stripHtml(request.content);

    // Check for malicious patterns
    const maliciousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /onclick\s*=/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(request.content)) {
        threats.push({
          type: 'malicious_content',
          severity: 'high',
          description: 'Potentially malicious code pattern detected',
          evidence: [pattern.toString()],
          mitigation: 'Content sanitization required',
          auto_remediation: 'Apply HTML sanitization'
        });
      }
    }

    // Check for suspicious URLs
    if (request.source_url) {
      const suspiciousUrlPatterns = [
        /bit\.ly|tinyurl|t\.co/gi,
        /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/g, // IP addresses
        /[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+\./g, // Randomly generated domains
      ];

      for (const pattern of suspiciousUrlPatterns) {
        if (pattern.test(request.source_url)) {
          threats.push({
            type: 'phishing',
            severity: 'medium',
            description: 'Suspicious URL pattern detected',
            evidence: [request.source_url],
            mitigation: 'URL reputation check required'
          });
        }
      }
    }

    return {
      layer_name: 'Static Security Analysis',
      passed: threats.length === 0,
      score: Math.max(0, 1 - (threats.length * 0.2)),
      execution_time_ms: Date.now() - startTime,
      details: `Analyzed ${request.content.length} characters, found ${threats.length} threats`,
      threats_found: threats
    };
  }

  /**
   * Layer 2: Dynamic Threat Detection
   */
  private static async performThreatDetection(request: ContentValidationRequest): Promise<any> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];

    // Social engineering detection
    const socialEngineeringKeywords = [
      'urgent', 'immediate action', 'verify account', 'suspended', 'click here now',
      'limited time', 'act now', 'verify identity', 'confirm password',
      'account locked', 'security breach', 'unauthorized access'
    ];

    const textContent = stripHtml(request.content).toLowerCase();
    const foundKeywords = socialEngineeringKeywords.filter(keyword => 
      textContent.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length >= 3) {
      threats.push({
        type: 'social_engineering',
        severity: 'high',
        description: 'Multiple social engineering indicators detected',
        evidence: foundKeywords,
        mitigation: 'Content requires expert review'
      });
    }

    // Data exfiltration pattern detection
    const sensitiveDataPatterns = [
      /\b\d{4}\s*[-]?\s*\d{4}\s*[-]?\s*\d{4}\s*[-]?\s*\d{4}\b/g, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g // Phone
    ];

    for (const pattern of sensitiveDataPatterns) {
      const matches = textContent.match(pattern);
      if (matches && matches.length > 0) {
        threats.push({
          type: 'data_exfiltration',
          severity: 'critical',
          description: 'Potential sensitive data exposure detected',
          evidence: ['Sensitive data pattern found'],
          mitigation: 'Immediate content review and data redaction required'
        });
      }
    }

    return {
      layer_name: 'Dynamic Threat Detection',
      passed: threats.length === 0,
      score: Math.max(0, 1 - (threats.length * 0.3)),
      execution_time_ms: Date.now() - startTime,
      details: `Scanned for ${socialEngineeringKeywords.length} social engineering patterns and ${sensitiveDataPatterns.length} data patterns`,
      threats_found: threats
    };
  }

  /**
   * Layer 3: AI-Powered Content Analysis
   */
  private static async performAISecurityAnalysis(request: ContentValidationRequest): Promise<any> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];

    try {
      const genAI = this.initializeAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
        Analyze the following content for cybersecurity threats and compliance violations:

        Content Type: ${request.content_type}
        Source URL: ${request.source_url || 'N/A'}
        Framework Context: ${request.framework_context?.join(', ') || 'General'}

        Content to analyze:
        """
        ${request.content.substring(0, 4000)} ${request.content.length > 4000 ? '...' : ''}
        """

        Please analyze for:
        1. Malicious content or code injection attempts
        2. Phishing or social engineering tactics
        3. Misinformation or false claims about cybersecurity
        4. Compliance framework misrepresentation
        5. Data privacy violations
        6. Inappropriate or harmful security advice

        Respond in JSON format:
        {
          "threats_detected": [
            {
              "type": "threat_type",
              "severity": "low|medium|high|critical",
              "description": "detailed description",
              "confidence": 0.0-1.0,
              "evidence": ["specific examples"],
              "recommendation": "mitigation approach"
            }
          ],
          "overall_assessment": "safe|suspicious|dangerous",
          "confidence_score": 0.0-1.0,
          "compliance_notes": "any framework-specific observations"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const analysis = JSON.parse(response);
        
        if (analysis.threats_detected && Array.isArray(analysis.threats_detected)) {
          for (const threat of analysis.threats_detected) {
            threats.push({
              type: threat.type as any,
              severity: threat.severity,
              description: `AI Analysis: ${threat.description}`,
              evidence: threat.evidence || [],
              mitigation: threat.recommendation || 'Manual review required'
            });
          }
        }

        return {
          layer_name: 'AI Security Analysis',
          passed: analysis.overall_assessment === 'safe',
          score: analysis.confidence_score || 0.5,
          execution_time_ms: Date.now() - startTime,
          details: `AI assessment: ${analysis.overall_assessment}, ${threats.length} threats identified`,
          threats_found: threats,
          ai_confidence: analysis.confidence_score,
          compliance_notes: analysis.compliance_notes
        };

      } catch (parseError) {
        console.warn('[CyberSecurity] AI response parsing failed:', parseError);
        return {
          layer_name: 'AI Security Analysis',
          passed: false,
          score: 0.3,
          execution_time_ms: Date.now() - startTime,
          details: 'AI analysis inconclusive due to parsing error',
          threats_found: []
        };
      }

    } catch (error) {
      console.warn('[CyberSecurity] AI analysis failed:', error);
      return {
        layer_name: 'AI Security Analysis',
        passed: true, // Default to pass if AI unavailable
        score: 0.5,
        execution_time_ms: Date.now() - startTime,
        details: 'AI analysis unavailable, manual review recommended',
        threats_found: []
      };
    }
  }

  /**
   * Layer 4: Framework-Specific Compliance Validation
   */
  private static async validateFrameworkCompliance(request: ContentValidationRequest): Promise<any> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];

    if (!request.framework_context || request.framework_context.length === 0) {
      return {
        layer_name: 'Framework Compliance Validation',
        passed: true,
        score: 1.0,
        execution_time_ms: Date.now() - startTime,
        details: 'No specific framework context provided',
        threats_found: []
      };
    }

    // Check for framework misrepresentation
    const frameworkPatterns = {
      'ISO27001': [/ISO\s*27001/gi, /information\s*security\s*management/gi],
      'GDPR': [/GDPR/gi, /general\s*data\s*protection/gi, /personal\s*data/gi],
      'SOC2': [/SOC\s*2/gi, /service\s*organization\s*control/gi],
      'HIPAA': [/HIPAA/gi, /health\s*insurance\s*portability/gi],
      'PCI-DSS': [/PCI[-\s]*DSS/gi, /payment\s*card\s*industry/gi]
    };

    const textContent = stripHtml(request.content);
    
    for (const framework of request.framework_context) {
      const patterns = frameworkPatterns[framework as keyof typeof frameworkPatterns];
      if (!patterns) continue;

      const mentioned = patterns.some(pattern => pattern.test(textContent));
      
      if (mentioned) {
        // Check for potentially incorrect claims
        const incorrectClaims = [
          /100%\s*compliance/gi,
          /guaranteed\s*certification/gi,
          /instant\s*compliance/gi,
          /automatic\s*audit\s*pass/gi
        ];

        const hasIncorrectClaims = incorrectClaims.some(claim => claim.test(textContent));
        
        if (hasIncorrectClaims) {
          threats.push({
            type: 'compliance_violation',
            severity: 'medium',
            description: `Potentially misleading claims about ${framework} compliance`,
            evidence: ['Unrealistic compliance guarantees detected'],
            mitigation: 'Review compliance claims for accuracy'
          });
        }
      }
    }

    return {
      layer_name: 'Framework Compliance Validation',
      passed: threats.length === 0,
      score: Math.max(0, 1 - (threats.length * 0.25)),
      execution_time_ms: Date.now() - startTime,
      details: `Validated against ${request.framework_context.length} frameworks`,
      threats_found: threats
    };
  }

  /**
   * Layer 5: Contextual Security Assessment
   */
  private static async performContextualSecurityAssessment(request: ContentValidationRequest): Promise<any> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];

    // Content type specific checks
    switch (request.content_type) {
      case 'web_scraped':
        if (request.source_url) {
          // Check if URL is from a known malicious domain (simplified)
          const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
          const hasSuspiciousTld = suspiciousTlds.some(tld => 
            request.source_url!.toLowerCase().includes(tld)
          );
          
          if (hasSuspiciousTld) {
            threats.push({
              type: 'phishing',
              severity: 'high',
              description: 'Content sourced from suspicious domain',
              evidence: [request.source_url],
              mitigation: 'Domain reputation verification required'
            });
          }
        }
        break;

      case 'user_generated':
        // Higher scrutiny for user-generated content
        const textLength = stripHtml(request.content).length;
        if (textLength > 10000) {
          // Large user-generated content requires additional review
          threats.push({
            type: 'compliance_violation',
            severity: 'low',
            description: 'Large user-generated content requires additional review',
            evidence: [`Content length: ${textLength} characters`],
            mitigation: 'Extended review process recommended'
          });
        }
        break;

      case 'external_api':
        // API content should be validated against expected structure
        threats.push({
          type: 'compliance_violation',
          severity: 'low',
          description: 'External API content requires validation',
          evidence: ['Content from external API source'],
          mitigation: 'API response validation recommended'
        });
        break;
    }

    return {
      layer_name: 'Contextual Security Assessment',
      passed: threats.filter(t => t.severity === 'high' || t.severity === 'critical').length === 0,
      score: Math.max(0, 1 - (threats.length * 0.1)),
      execution_time_ms: Date.now() - startTime,
      details: `Context-aware assessment for ${request.content_type} content`,
      threats_found: threats
    };
  }

  /**
   * Calculate overall risk level based on validation layers
   */
  private static calculateRiskLevel(layers: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const allThreats = layers.flatMap(layer => layer.threats_found || []);
    const criticalThreats = allThreats.filter(t => t.severity === 'critical');
    const highThreats = allThreats.filter(t => t.severity === 'high');
    const mediumThreats = allThreats.filter(t => t.severity === 'medium');

    if (criticalThreats.length > 0) return 'critical';
    if (highThreats.length > 1) return 'high';
    if (highThreats.length > 0 || mediumThreats.length > 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidenceScore(layers: any[]): number {
    const scores = layers.map(layer => layer.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Factor in AI confidence if available
    const aiLayer = layers.find(layer => layer.ai_confidence);
    if (aiLayer) {
      return (avgScore + aiLayer.ai_confidence) / 2;
    }
    
    return avgScore;
  }

  /**
   * Generate security recommendations
   */
  private static generateSecurityRecommendations(layers: any[], threats: SecurityThreat[]): string[] {
    const recommendations: string[] = [];

    if (threats.length === 0) {
      recommendations.push('Content passed all security validations');
      return recommendations;
    }

    const threatsByType = threats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (threatsByType.malicious_content) {
      recommendations.push('Apply additional content sanitization');
      recommendations.push('Implement stricter input validation');
    }

    if (threatsByType.phishing || threatsByType.social_engineering) {
      recommendations.push('Require expert cybersecurity review');
      recommendations.push('Implement user awareness training');
    }

    if (threatsByType.data_exfiltration) {
      recommendations.push('Immediate data redaction required');
      recommendations.push('Implement data loss prevention measures');
    }

    if (threatsByType.compliance_violation) {
      recommendations.push('Framework compliance review needed');
      recommendations.push('Update content to meet standards');
    }

    recommendations.push('Consider quarantine pending resolution');
    recommendations.push('Document incident for audit trail');

    return recommendations;
  }

  /**
   * Generate content hash for tracking
   */
  private static async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store validation result for audit trail
   */
  private static async storeValidationResult(result: SecurityValidationResult, request: ContentValidationRequest): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_validation_logs')
        .insert({
          content_hash: result.metadata.content_hash,
          content_type: request.content_type,
          source_url: request.source_url,
          user_id: request.user_id,
          organization_id: request.organization_id,
          validation_result: result,
          risk_level: result.risk_level,
          threats_count: result.threats_detected.length,
          passed: result.passed,
          confidence_score: result.confidence_score,
          processing_time_ms: result.metadata.processing_time_ms,
          validated_at: result.metadata.validated_at,
          framework_context: request.framework_context
        });

      if (error) {
        console.warn('[CyberSecurity] Failed to store validation result:', error);
      }
    } catch (error) {
      console.warn('[CyberSecurity] Error storing validation result:', error);
    }
  }

  /**
   * Trigger real-time security monitoring
   */
  private static async triggerSecurityMonitoring(result: SecurityValidationResult, request: ContentValidationRequest): Promise<void> {
    const criticalThreats = result.threats_detected.filter(t => t.severity === 'critical' || t.severity === 'high');
    
    if (criticalThreats.length === 0) return;

    const monitoringEvent: SecurityMonitoringEvent = {
      event_type: 'threat_detected',
      severity: result.risk_level,
      source: `content_validation_${request.content_type}`,
      details: {
        content_hash: result.metadata.content_hash,
        threats_detected: criticalThreats.length,
        threat_types: [...new Set(criticalThreats.map(t => t.type))],
        source_url: request.source_url,
        framework_context: request.framework_context
      },
      user_id: request.user_id,
      organization_id: request.organization_id,
      ip_address: request.metadata?.source_ip,
      user_agent: request.metadata?.user_agent,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    try {
      await this.recordSecurityEvent(monitoringEvent);
    } catch (error) {
      console.error('[CyberSecurity] Failed to record security event:', error);
    }
  }

  /**
   * Record security monitoring event
   */
  static async recordSecurityEvent(event: SecurityMonitoringEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_monitoring_events')
        .insert(event);

      if (error) {
        console.warn('[CyberSecurity] Failed to record security event:', error);
      } else {
        console.log(`[CyberSecurity] Security event recorded: ${event.event_type} - ${event.severity}`);
      }
    } catch (error) {
      console.error('[CyberSecurity] Error recording security event:', error);
    }
  }
}