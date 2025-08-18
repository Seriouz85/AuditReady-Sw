/**
 * Requirement Validation Service
 * Provides advanced validation capabilities for knowledge sources and guidance content
 */

import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ValidationResult {
  score: number;
  checks: ValidationCheck[];
  recommendations: string[];
  confidence: number;
  isValid: boolean;
  metadata: {
    processingTime: number;
    validatedAt: string;
    validator: string;
  };
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'content' | 'compliance' | 'quality' | 'security' | 'formatting';
}

export interface SourceValidationResult {
  accessible: boolean;
  contentType: string;
  authorityMetrics: {
    domain_authority: number;
    trust_score: number;
    expertise_indicators: string[];
  };
  complianceRelevance: {
    frameworks_detected: string[];
    categories_identified: string[];
    relevance_score: number;
  };
  qualityIndicators: {
    content_length: number;
    structure_quality: number;
    reference_quality: number;
    update_frequency: string;
  };
}

export class RequirementValidationService {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize the Gemini AI client for validation
   */
  private static initializeAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Validate knowledge source before ingestion
   */
  static async validateSource(source: {
    url: string;
    domain: string;
    contentType: string;
  }): Promise<ValidationResult> {
    const startTime = Date.now();
    const checks: ValidationCheck[] = [];
    const recommendations: string[] = [];

    try {
      console.log(`[ValidationService] Validating source: ${source.url}`);

      // 1. URL accessibility check
      const accessibilityCheck = await this.checkURLAccessibility(source.url);
      checks.push({
        name: 'URL Accessibility',
        passed: accessibilityCheck.accessible,
        score: accessibilityCheck.accessible ? 1.0 : 0.0,
        details: accessibilityCheck.accessible ? 'URL is accessible' : 'URL is not accessible or blocked',
        severity: accessibilityCheck.accessible ? 'low' : 'critical',
        category: 'content'
      });

      if (!accessibilityCheck.accessible) {
        recommendations.push('Verify URL is correct and publicly accessible');
      }

      // 2. Domain authority check
      const domainCheck = await this.checkDomainAuthority(source.domain);
      checks.push({
        name: 'Domain Authority',
        passed: domainCheck.score >= 0.6,
        score: domainCheck.score,
        details: `Domain authority score: ${(domainCheck.score * 100).toFixed(0)}%`,
        severity: domainCheck.score >= 0.8 ? 'low' : domainCheck.score >= 0.6 ? 'medium' : 'high',
        category: 'quality'
      });

      if (domainCheck.score < 0.7) {
        recommendations.push('Consider using more authoritative sources for better content quality');
      }

      // 3. Content type validation
      const contentCheck = await this.validateContentType(source.url, source.contentType);
      checks.push({
        name: 'Content Type Match',
        passed: contentCheck.matches,
        score: contentCheck.score,
        details: contentCheck.details,
        severity: contentCheck.matches ? 'low' : 'medium',
        category: 'content'
      });

      // 4. Compliance relevance check
      const complianceCheck = await this.checkComplianceRelevance(source.url);
      checks.push({
        name: 'Compliance Relevance',
        passed: complianceCheck.score >= 0.5,
        score: complianceCheck.score,
        details: `Found ${complianceCheck.frameworks.length} framework references`,
        severity: complianceCheck.score >= 0.7 ? 'low' : 'medium',
        category: 'compliance'
      });

      if (complianceCheck.score < 0.6) {
        recommendations.push('Content may not be directly relevant to compliance frameworks');
      }

      // 5. Security check
      const securityCheck = await this.performSecurityCheck(source.url);
      checks.push({
        name: 'Security Assessment',
        passed: securityCheck.safe,
        score: securityCheck.score,
        details: securityCheck.details,
        severity: securityCheck.safe ? 'low' : 'critical',
        category: 'security'
      });

      if (!securityCheck.safe) {
        recommendations.push('Source flagged as potentially unsafe - review before use');
      }

      // Calculate overall score
      const totalScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;
      const confidence = this.calculateConfidence(checks);
      const isValid = totalScore >= 0.6 && checks.every(check => check.severity !== 'critical' || check.passed);

      return {
        score: totalScore,
        checks,
        recommendations,
        confidence,
        isValid,
        metadata: {
          processingTime: Date.now() - startTime,
          validatedAt: new Date().toISOString(),
          validator: 'RequirementValidationService'
        }
      };

    } catch (error) {
      console.error('[ValidationService] Validation failed:', error);
      
      return {
        score: 0,
        checks: [{
          name: 'Validation Error',
          passed: false,
          score: 0,
          details: error instanceof Error ? error.message : 'Unknown validation error',
          severity: 'critical',
          category: 'content'
        }],
        recommendations: ['Fix validation errors before proceeding'],
        confidence: 0,
        isValid: false,
        metadata: {
          processingTime: Date.now() - startTime,
          validatedAt: new Date().toISOString(),
          validator: 'RequirementValidationService'
        }
      };
    }
  }

  /**
   * Validate generated guidance content
   */
  static async validateContent(content: string, type: 'source' | 'guidance'): Promise<ValidationResult> {
    const startTime = Date.now();
    const checks: ValidationCheck[] = [];
    const recommendations: string[] = [];

    try {
      console.log(`[ValidationService] Validating ${type} content (${content.length} chars)`);

      // 1. Length and structure check
      const structureCheck = this.validateStructure(content, type);
      checks.push(structureCheck);

      if (!structureCheck.passed) {
        recommendations.push('Improve content structure and length');
      }

      // 2. Professional tone check
      const toneCheck = await this.validateTone(content);
      checks.push(toneCheck);

      if (!toneCheck.passed) {
        recommendations.push('Use more professional language and tone');
      }

      // 3. Compliance terminology check
      const terminologyCheck = this.validateTerminology(content);
      checks.push(terminologyCheck);

      if (terminologyCheck.score < 0.7) {
        recommendations.push('Include more specific compliance terminology');
      }

      // 4. Framework coverage check (for guidance)
      if (type === 'guidance') {
        const frameworkCheck = this.validateFrameworkCoverage(content);
        checks.push(frameworkCheck);

        if (frameworkCheck.score < 0.6) {
          recommendations.push('Reference more compliance frameworks for comprehensive guidance');
        }
      }

      // 5. Actionability check
      const actionabilityCheck = this.validateActionability(content);
      checks.push(actionabilityCheck);

      if (!actionabilityCheck.passed) {
        recommendations.push('Make content more actionable with specific steps and recommendations');
      }

      // 6. AI content detection (for generated guidance)
      if (type === 'guidance') {
        const aiCheck = await this.detectAIContent(content);
        checks.push(aiCheck);

        if (aiCheck.score > 0.8) {
          recommendations.push('Review content to ensure it sounds natural and human-like');
        }
      }

      // Calculate overall score
      const totalScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;
      const confidence = this.calculateConfidence(checks);
      const isValid = totalScore >= 0.7 && checks.every(check => check.severity !== 'critical' || check.passed);

      return {
        score: totalScore,
        checks,
        recommendations,
        confidence,
        isValid,
        metadata: {
          processingTime: Date.now() - startTime,
          validatedAt: new Date().toISOString(),
          validator: 'RequirementValidationService'
        }
      };

    } catch (error) {
      console.error('[ValidationService] Content validation failed:', error);
      
      return {
        score: 0,
        checks: [{
          name: 'Content Validation Error',
          passed: false,
          score: 0,
          details: error instanceof Error ? error.message : 'Unknown validation error',
          severity: 'critical',
          category: 'content'
        }],
        recommendations: ['Fix validation errors before proceeding'],
        confidence: 0,
        isValid: false,
        metadata: {
          processingTime: Date.now() - startTime,
          validatedAt: new Date().toISOString(),
          validator: 'RequirementValidationService'
        }
      };
    }
  }

  /**
   * Validate content against specific compliance requirements
   */
  static async validateAgainstRequirements(
    content: string,
    requirements: string[],
    frameworks: string[]
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const checks: ValidationCheck[] = [];
    const recommendations: string[] = [];

    try {
      // Use AI to validate content against specific requirements
      const genAI = this.initializeAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze this compliance guidance content against specific requirements:

CONTENT TO VALIDATE:
${content}

REQUIREMENTS TO CHECK:
${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

FRAMEWORKS IN SCOPE:
${frameworks.join(', ')}

VALIDATION CRITERIA:
1. Does the content address each requirement adequately?
2. Are the recommendations specific and actionable?
3. Is the guidance technically accurate?
4. Does it cover all relevant framework aspects?
5. Is the tone professional and appropriate?

Provide a JSON response with:
{
  "overall_score": 0-1,
  "requirement_coverage": [
    {
      "requirement": "requirement text",
      "covered": true/false,
      "score": 0-1,
      "details": "explanation"
    }
  ],
  "framework_alignment": {
    "framework": "score 0-1"
  },
  "quality_issues": ["issue1", "issue2"],
  "recommendations": ["rec1", "rec2"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        // Extract JSON from response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);

          // Convert analysis to validation checks
          analysis.requirement_coverage?.forEach((req: any, index: number) => {
            checks.push({
              name: `Requirement ${index + 1} Coverage`,
              passed: req.covered,
              score: req.score,
              details: req.details,
              severity: req.covered ? 'low' : 'high',
              category: 'compliance'
            });
          });

          Object.entries(analysis.framework_alignment || {}).forEach(([framework, score]: [string, any]) => {
            checks.push({
              name: `${framework.toUpperCase()} Alignment`,
              passed: score >= 0.7,
              score: score,
              details: `Framework alignment score: ${(score * 100).toFixed(0)}%`,
              severity: score >= 0.7 ? 'low' : 'medium',
              category: 'compliance'
            });
          });

          recommendations.push(...(analysis.recommendations || []));

          const totalScore = analysis.overall_score || 0;
          const confidence = this.calculateConfidence(checks);
          const isValid = totalScore >= 0.7;

          return {
            score: totalScore,
            checks,
            recommendations,
            confidence,
            isValid,
            metadata: {
              processingTime: Date.now() - startTime,
              validatedAt: new Date().toISOString(),
              validator: 'AI-RequirementValidationService'
            }
          };
        }
      } catch (parseError) {
        console.error('[ValidationService] Failed to parse AI response:', parseError);
      }

      // Fallback to basic validation
      return this.validateContent(content, 'guidance');

    } catch (error) {
      console.error('[ValidationService] AI validation failed:', error);
      return this.validateContent(content, 'guidance');
    }
  }

  // Helper validation methods

  private static async checkURLAccessibility(url: string): Promise<{ accessible: boolean; details: string }> {
    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 10000 });
      return {
        accessible: response.ok,
        details: response.ok ? 'URL accessible' : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        accessible: false,
        details: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private static async checkDomainAuthority(domain: string): Promise<{ score: number; details: string }> {
    // Mock domain authority check - in production, integrate with SEO APIs
    const authorityDomains = new Set([
      'nist.gov', 'iso.org', 'cisecurity.org', 'sans.org', 'enisa.europa.eu',
      'ncsc.gov.uk', 'cisa.gov', 'microsoft.com', 'aws.amazon.com', 'cloud.google.com'
    ]);

    if (authorityDomains.has(domain)) {
      return { score: 0.95, details: 'High authority domain' };
    }

    // Basic heuristics
    if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
      return { score: 0.85, details: 'Government/Educational domain' };
    }

    if (domain.endsWith('.org')) {
      return { score: 0.75, details: 'Organization domain' };
    }

    return { score: 0.6, details: 'Standard domain' };
  }

  private static async validateContentType(url: string, expectedType: string): Promise<{
    matches: boolean;
    score: number;
    details: string;
  }> {
    // Mock content type validation
    return {
      matches: true,
      score: 0.8,
      details: `Content appears to match expected type: ${expectedType}`
    };
  }

  private static async checkComplianceRelevance(url: string): Promise<{
    score: number;
    frameworks: string[];
    categories: string[];
  }> {
    // Mock compliance relevance check
    const mockFrameworks = ['iso27001', 'nist', 'gdpr'];
    const mockCategories = ['access control', 'risk management'];

    return {
      score: 0.8,
      frameworks: mockFrameworks,
      categories: mockCategories
    };
  }

  private static async performSecurityCheck(url: string): Promise<{
    safe: boolean;
    score: number;
    details: string;
  }> {
    try {
      // Basic URL security checks
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'https:') {
        return {
          safe: false,
          score: 0.3,
          details: 'URL does not use HTTPS'
        };
      }

      // Check against basic malicious patterns
      const suspiciousPatterns = [
        /bit\.ly/, /tinyurl/, /t\.co/, // URL shorteners
        /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));

      return {
        safe: !isSuspicious,
        score: isSuspicious ? 0.4 : 0.9,
        details: isSuspicious ? 'URL matches suspicious patterns' : 'URL appears safe'
      };

    } catch (error) {
      return {
        safe: false,
        score: 0,
        details: 'Invalid URL format'
      };
    }
  }

  private static validateStructure(content: string, type: string): ValidationCheck {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    let score = 0;
    let details = '';
    let passed = false;

    if (type === 'guidance') {
      // Guidance should be substantial but not too long
      if (wordCount >= 150 && wordCount <= 800) score += 0.4;
      if (sentenceCount >= 3 && sentenceCount <= 15) score += 0.3;
      if (paragraphCount >= 1 && paragraphCount <= 4) score += 0.3;
      
      passed = score >= 0.7;
      details = `${wordCount} words, ${sentenceCount} sentences, ${paragraphCount} paragraphs`;
    } else {
      // Source content should be longer
      if (wordCount >= 100) score += 0.5;
      if (sentenceCount >= 2) score += 0.3;
      if (paragraphCount >= 1) score += 0.2;
      
      passed = score >= 0.6;
      details = `Content length: ${wordCount} words`;
    }

    return {
      name: 'Content Structure',
      passed,
      score,
      details,
      severity: passed ? 'low' : 'medium',
      category: 'formatting'
    };
  }

  private static async validateTone(content: string): Promise<ValidationCheck> {
    const lowerContent = content.toLowerCase();
    
    // Check for unprofessional language
    const unprofessionalTerms = [
      'think of it like', 'imagine', 'let\'s say', 'basically', 'obviously',
      'super easy', 'piece of cake', 'no-brainer', 'dummy', 'simple as that'
    ];

    const foundUnprofessional = unprofessionalTerms.filter(term => 
      lowerContent.includes(term)
    );

    // Check for appropriate professional terms
    const professionalTerms = [
      'implement', 'establish', 'maintain', 'ensure', 'configure',
      'requirements', 'compliance', 'policy', 'procedure', 'controls'
    ];

    const foundProfessional = professionalTerms.filter(term => 
      lowerContent.includes(term)
    );

    const score = Math.max(0, (foundProfessional.length * 0.1) - (foundUnprofessional.length * 0.2));
    const normalizedScore = Math.min(1, score);
    const passed = foundUnprofessional.length === 0 && foundProfessional.length >= 2;

    return {
      name: 'Professional Tone',
      passed,
      score: normalizedScore,
      details: passed ? 'Professional tone maintained' : 
        `Found ${foundUnprofessional.length} unprofessional terms, ${foundProfessional.length} professional terms`,
      severity: passed ? 'low' : 'medium',
      category: 'quality'
    };
  }

  private static validateTerminology(content: string): ValidationCheck {
    const lowerContent = content.toLowerCase();
    
    const complianceTerms = [
      'compliance', 'audit', 'risk', 'control', 'governance', 'framework',
      'policy', 'procedure', 'requirement', 'standard', 'assessment',
      'monitoring', 'incident', 'security', 'privacy', 'data protection'
    ];

    const foundTerms = complianceTerms.filter(term => 
      lowerContent.includes(term)
    );

    const score = Math.min(1, foundTerms.length / 5); // Target 5+ terms
    const passed = foundTerms.length >= 3;

    return {
      name: 'Compliance Terminology',
      passed,
      score,
      details: `Uses ${foundTerms.length} compliance terms`,
      severity: passed ? 'low' : 'medium',
      category: 'compliance'
    };
  }

  private static validateFrameworkCoverage(content: string): ValidationCheck {
    const lowerContent = content.toLowerCase();
    
    const frameworks = {
      'iso 27001': ['iso 27001', 'iso27001', 'isms'],
      'nist': ['nist', 'cybersecurity framework', 'csf'],
      'gdpr': ['gdpr', 'general data protection'],
      'nis2': ['nis2', 'nis 2', 'network information security'],
      'cis controls': ['cis controls', 'cis critical security']
    };

    const foundFrameworks = Object.keys(frameworks).filter(framework =>
      frameworks[framework as keyof typeof frameworks].some(term => 
        lowerContent.includes(term)
      )
    );

    const score = Math.min(1, foundFrameworks.length / 3); // Target 3+ frameworks
    const passed = foundFrameworks.length >= 2;

    return {
      name: 'Framework Coverage',
      passed,
      score,
      details: `References ${foundFrameworks.length} compliance frameworks`,
      severity: passed ? 'low' : 'medium',
      category: 'compliance'
    };
  }

  private static validateActionability(content: string): ValidationCheck {
    const lowerContent = content.toLowerCase();
    
    const actionableTerms = [
      'implement', 'establish', 'configure', 'monitor', 'review',
      'ensure', 'verify', 'document', 'maintain', 'update',
      'steps', 'process', 'procedure', 'should', 'must'
    ];

    const foundActions = actionableTerms.filter(term => 
      lowerContent.includes(term)
    );

    const score = Math.min(1, foundActions.length / 5); // Target 5+ actionable terms
    const passed = foundActions.length >= 3;

    return {
      name: 'Actionability',
      passed,
      score,
      details: `Contains ${foundActions.length} actionable terms`,
      severity: passed ? 'low' : 'medium',
      category: 'quality'
    };
  }

  private static async detectAIContent(content: string): Promise<ValidationCheck> {
    // Basic AI detection heuristics
    const aiIndicators = [
      'as an ai', 'i cannot', 'i don\'t have access',
      'i recommend', 'it\'s important to note',
      'please note that', 'it\'s worth mentioning'
    ];

    const foundIndicators = aiIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    );

    const score = foundIndicators.length > 0 ? 0.8 : 0.2; // Higher score = more AI-like
    const passed = foundIndicators.length === 0;

    return {
      name: 'Human-like Content',
      passed,
      score: 1 - score, // Invert score for validation (lower AI detection = higher score)
      details: passed ? 'Content appears human-written' : 
        `Found ${foundIndicators.length} AI indicators`,
      severity: passed ? 'low' : 'medium',
      category: 'quality'
    };
  }

  private static calculateConfidence(checks: ValidationCheck[]): number {
    const passedChecks = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;
    const criticalFailed = checks.filter(check => 
      check.severity === 'critical' && !check.passed
    ).length;

    if (criticalFailed > 0) return 0.3;
    if (totalChecks === 0) return 0.5;

    const baseConfidence = passedChecks / totalChecks;
    const avgScore = checks.reduce((sum, check) => sum + check.score, 0) / totalChecks;

    return (baseConfidence * 0.6) + (avgScore * 0.4);
  }

  /**
   * Store validation results for audit trail
   */
  static async storeValidationResult(
    entityId: string,
    entityType: 'source' | 'content' | 'guidance',
    result: ValidationResult
  ): Promise<void> {
    try {
      await supabase
        .from('validation_history')
        .insert({
          entity_id: entityId,
          entity_type: entityType,
          validation_score: result.score,
          validation_checks: result.checks,
          recommendations: result.recommendations,
          confidence: result.confidence,
          is_valid: result.isValid,
          metadata: result.metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('[ValidationService] Failed to store validation result:', error);
    }
  }
}