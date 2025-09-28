import { 
  RequirementDetail, 
  UnifiedSection, 
  ValidationResult, 
  ContentValidationResult, 
  ValidationConfig,
  MIN_CONTENT_LENGTHS,
  VALIDATION_PATTERNS
} from './types/ComplianceTypesDefinitions';

/**
 * Requirements Validation Service
 * 
 * Handles comprehensive validation of compliance content including:
 * - Content quality assessment
 * - Framework-specific validation
 * - Actionability scoring
 * - Category relevance checking
 * - Technical depth analysis
 * - Completeness validation
 */
export class RequirementsValidationService {
  
  /**
   * Content validation configuration
   */
  private validationConfig: ValidationConfig = {
    enabled: true,
    minContentLength: 50,
    minQualityScore: 0.6,
    requireActionableContent: true,
    strictRelevanceCheck: true,
    logValidationResults: true
  };

  /**
   * Set validation configuration
   */
  setValidationConfig(config: Partial<ValidationConfig>): void {
    this.validationConfig = { ...this.validationConfig, ...config };
    console.log('[VALIDATION] Enhanced configuration updated:', this.validationConfig);
  }

  /**
   * Validate completeness of requirements assignment
   */
  validateCompleteness(
    allRequirements: RequirementDetail[],
    sections: UnifiedSection[]
  ): ValidationResult {
    const assignedIds = new Set<string>();
    
    for (const section of sections) {
      section.requirements.forEach(r => assignedIds.add(r.control_id));
    }
    
    const missingRequirements = allRequirements
      .filter(r => !assignedIds.has(r.control_id))
      .map(r => `${r.framework}: ${r.control_id}`);
    
    const coverage = (assignedIds.size / allRequirements.length) * 100;
    
    const suggestions: string[] = [];
    if (coverage < 100) {
      suggestions.push(`${missingRequirements.length} requirements not included in unified view`);
      if (missingRequirements.length > 0) {
        suggestions.push(`Missing: ${missingRequirements.slice(0, 3).join(', ')}${missingRequirements.length > 3 ? '...' : ''}`);
      }
    }
    
    return {
      isValid: coverage >= 95, // Allow 5% margin
      missingRequirements,
      coverage,
      suggestions
    };
  }

  /**
   * Enhanced content validation with framework-specific context
   */
  validateContentWithFrameworkContext(
    content: string, 
    req: RequirementDetail, 
    allRequirements: RequirementDetail[]
  ): ContentValidationResult {
    if (!this.validationConfig.enabled) {
      return {
        isValid: true,
        qualityScore: 1.0,
        issues: [],
        actionableScore: 1.0,
        relevanceScore: 1.0,
        technicalDepthScore: 1.0
      };
    }

    const qualityResult = this.validateContentQuality(content, req.framework);
    const actionabilityResult = this.validateActionability(content, req);
    const relevanceResult = this.validateCategoryRelevance(content, req);
    const technicalResult = this.validateTechnicalDepth(content, req);

    const overallScore = (
      qualityResult.score * 0.3 +
      actionabilityResult.score * 0.3 +
      relevanceResult.score * 0.2 +
      technicalResult.score * 0.2
    );

    const allIssues = [
      ...qualityResult.issues,
      ...actionabilityResult.issues,
      ...relevanceResult.issues,
      ...technicalResult.issues
    ];

    const isValid = overallScore >= this.validationConfig.minQualityScore &&
                   content.length >= this.validationConfig.minContentLength &&
                   (!this.validationConfig.requireActionableContent || actionabilityResult.score >= 0.5) &&
                   (!this.validationConfig.strictRelevanceCheck || relevanceResult.score >= 0.6);

    return {
      isValid,
      qualityScore: overallScore,
      issues: allIssues,
      actionableScore: actionabilityResult.score,
      relevanceScore: relevanceResult.score,
      technicalDepthScore: technicalResult.score
    };
  }

  /**
   * Enhanced content quality validation with framework-specific criteria
   */
  private validateContentQuality(content: string, framework?: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;
    
    // Framework-specific minimum length requirements
    const minLength = this.getMinContentLengthForFramework(framework || '');
    if (content.length < minLength) {
      issues.push(`Content too short for ${framework || 'standard'} requirements (${content.length} < ${minLength})`);
      score -= 0.3;
    }

    // Enhanced generic/placeholder content detection
    const genericPatterns = [
      /implementation guidance will be provided/i,
      /to be determined/i,
      /placeholder/i,
      /lorem ipsum/i,
      /example content/i,
      /\[insert [^\]]+\]/i,
      /\{[^}]+\}/,
      /TBD|TODO|FIXME/i,
      /sample text/i,
      /dummy content/i
    ];

    let genericPenalty = 0;
    for (const pattern of genericPatterns) {
      if (pattern.test(content)) {
        issues.push('Contains generic/placeholder content');
        genericPenalty = Math.max(genericPenalty, 0.4);
      }
    }
    score -= genericPenalty;

    // Enhanced sentence structure validation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length === 0) {
      issues.push('No complete sentences found');
      score -= 0.25;
    } else if (sentences.length === 1 && content.length > 100) {
      issues.push('Insufficient sentence structure for content length');
      score -= 0.1;
    }

    // More sophisticated repetition detection
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordCounts = new Map<string, number>();
    const significantWords = new Set<string>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
        if (this.isSignificantTechnicalWord(cleanWord)) {
          significantWords.add(cleanWord);
        }
      }
    });

    // Check for excessive repetition but allow technical terms
    let maxRepetition = 0;
    let repetitiveWord = '';
    wordCounts.forEach((count, word) => {
      if (count > maxRepetition && !significantWords.has(word)) {
        maxRepetition = count;
        repetitiveWord = word;
      }
    });
    
    const repetitionRatio = maxRepetition / Math.max(words.length, 1);
    if (repetitionRatio > 0.25 && maxRepetition > 3) {
      issues.push(`Excessive repetition of word '${repetitiveWord}' (${maxRepetition} times)`);
      score -= Math.min(0.3, repetitionRatio);
    }

    // Bonus for technical complexity and specificity
    const technicalComplexity = this.assessTechnicalComplexity(content);
    if (technicalComplexity > 0.7) {
      score = Math.min(1.0, score + 0.1);
    }

    // Penalty for overly generic language
    const genericLanguageRatio = this.calculateGenericLanguageRatio(content);
    if (genericLanguageRatio > 0.6) {
      issues.push('Content contains too much generic language');
      score -= 0.15;
    }

    return { score: Math.max(0, Math.min(1.0, score)), issues };
  }

  /**
   * Enhanced actionability validation with framework-specific requirements
   */
  private validateActionability(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    // Framework-specific action requirements
    const frameworkActionThresholds = {
      'ISO/IEC 27001': 2,
      'ISO/IEC 27002': 3,
      'CIS Controls Implementation Group 1 (IG1)': 4,
      'CIS Controls Implementation Group 2 (IG2)': 4,
      'CIS Controls Implementation Group 3 (IG3)': 5,
      'NIS2 Directive': 3,
      'GDPR': 2,
      'default': 2
    };

    // Enhanced action word patterns with categories
    const actionPatterns = {
      implementation: /\b(implement|establish|deploy|install|configure|setup|initialize|activate|enable)\b/gi,
      maintenance: /\b(maintain|update|patch|upgrade|refresh|sustain|preserve|keep)\b/gi,
      governance: /\b(define|create|develop|document|establish|formalize|approve|authorize)\b/gi,
      monitoring: /\b(monitor|review|assess|audit|evaluate|check|inspect|examine|track)\b/gi,
      enforcement: /\b(control|restrict|prevent|block|deny|limit|constrain|enforce|ensure)\b/gi,
      detection: /\b(detect|identify|discover|find|locate|recognize|scan|search)\b/gi,
      response: /\b(respond|react|address|handle|manage|resolve|remediate|correct)\b/gi,
      verification: /\b(test|validate|verify|confirm|prove|demonstrate|show|evidence)\b/gi
    };

    // Enhanced imperative patterns
    const imperativePatterns = [
      /\b(must|shall|should|will|need to|required to|obligated to)\s+\w+/gi,
      /\b(organization|entity|system)\s+(must|shall|should|will)/gi,
      /\b(procedures?|processes?|controls?|policies?|standards?|measures?)\s+(must|shall|should)/gi
    ];

    let totalActionMatches = 0;
    const actionCategories = new Set<string>();
    
    // Count matches in each action category
    Object.entries(actionPatterns).forEach(([category, pattern]) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        totalActionMatches += matches.length;
        actionCategories.add(category);
      }
    });

    // Count imperative matches
    let imperativeMatches = 0;
    for (const pattern of imperativePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        imperativeMatches += matches.length;
      }
    }

    // Calculate base actionability score
    const requiredActions = frameworkActionThresholds[req.framework as keyof typeof frameworkActionThresholds] || frameworkActionThresholds.default;
    const actionScore = Math.min(1.0, (totalActionMatches + imperativeMatches) / requiredActions);
    
    // Category diversity bonus
    const diversityBonus = actionCategories.size >= 3 ? 0.2 : actionCategories.size >= 2 ? 0.1 : 0;
    
    score = Math.min(1.0, actionScore + diversityBonus);

    // Enhanced technical instruction validation
    const technicalInstructions = [
      /\.(exe|dll|so|jar|msi|deb|rpm|dmg)\b/gi,
      /\b(configure|parameter|setting|option|flag|property|attribute)\b/gi,
      /\b(automated|manual|scan|inventory|list|catalog|enumerate)\b/gi,
      /\b(command|script|tool|utility|software|application)\b/gi,
      /\b(database|registry|file|directory|folder|path)\b/gi,
      /\b(network|port|protocol|service|daemon|process)\b/gi
    ];

    let technicalScore = 0;
    for (const pattern of technicalInstructions) {
      const matches = content.match(pattern);
      if (matches) {
        technicalScore += matches.length * 0.05;
      }
    }
    
    score = Math.min(1.0, score + Math.min(0.3, technicalScore));

    // Specific scoring feedback
    if (score >= 0.8) {
      // High actionability - no issues
    } else if (score >= 0.6) {
      issues.push('Content has moderate actionability but could be more specific');
    } else if (score >= 0.4) {
      issues.push('Content lacks sufficient actionable guidance');
    } else {
      issues.push('Content provides minimal actionable guidance');
      if (totalActionMatches === 0) {
        issues.push('No clear action words found');
      }
      if (imperativeMatches === 0) {
        issues.push('No imperative statements found');
      }
    }

    // Framework-specific penalties
    if (req.framework.includes('CIS Controls') && technicalScore < 0.1) {
      issues.push('CIS Controls require more technical specificity');
      score *= 0.8;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Enhanced relevance validation with contextual category matching
   */
  private validateCategoryRelevance(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0.4; // Start with baseline score
    const contentLower = content.toLowerCase();
    
    // Enhanced title term extraction and weighting
    const titleTerms = this.extractWeightedKeyTerms(req.title || '');
    let weightedTitleScore = 0;
    let titleMatchDetails: string[] = [];
    
    titleTerms.forEach(({ term, weight }) => {
      if (contentLower.includes(term.toLowerCase())) {
        weightedTitleScore += weight;
        titleMatchDetails.push(`${term}(${weight.toFixed(1)})`);
      }
    });
    
    const maxTitleWeight = titleTerms.reduce((sum, t) => sum + t.weight, 0);
    const titleRelevance = maxTitleWeight > 0 ? weightedTitleScore / maxTitleWeight : 0;
    score = Math.max(score, titleRelevance * 0.8);
    
    if (this.validationConfig.logValidationResults && titleMatchDetails.length > 0) {
      console.log(`🎯 [RELEVANCE] Title matches for ${req.control_id}:`, titleMatchDetails.join(', '));
    }

    // Enhanced category-specific validation with subcategories
    const categoryAnalysis = this.analyzeCategoryRelevance(content, req.category || '');
    score += categoryAnalysis.score * 0.4;
    
    if (categoryAnalysis.issues.length > 0) {
      issues.push(...categoryAnalysis.issues);
    }
    
    // Framework-specific terminology with context
    const frameworkAnalysis = this.analyzeFrameworkTerminology(content, req.framework);
    score += frameworkAnalysis.score * 0.2;
    
    // Contextual relevance - check for HR-specific terms in Governance category
    if (req.category === 'Governance & Leadership') {
      const hrTerms = [
        'personnel', 'employee', 'staff', 'human resources', 'competence', 'training',
        'background check', 'employment', 'termination', 'confidentiality', 'awareness'
      ];
      
      let hrMatches = 0;
      for (const term of hrTerms) {
        if (contentLower.includes(term)) {
          hrMatches++;
        }
      }
      
      if (hrMatches >= 2) {
        score = Math.min(1.0, score + 0.2);
      }
    }

    // Off-topic content detection
    const offTopicPenalty = this.detectOffTopicContent(content, req);
    if (offTopicPenalty > 0.3) {
      issues.push('Content appears to be off-topic for this requirement');
      score -= offTopicPenalty;
    }

    // Contextual relevance assessment
    const contextualRelevance = this.assessContextualRelevance(content, req);
    score = Math.min(1.0, score + contextualRelevance * 0.15);

    return { score: Math.max(0, Math.min(1.0, score)), issues };
  }

  /**
   * Enhanced technical depth validation with domain-specific patterns
   */
  private validateTechnicalDepth(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    // Technical terminology patterns by category
    const technicalPatterns = [
      // File and system patterns
      /\.(exe|dll|so|jar|msi|deb|rpm|dmg|ocx|bat|ps1|sh)\b/gi,
      // Configuration and settings
      /\b(configure|parameter|setting|registry|config|property|attribute|flag|option)\b/gi,
      // Security and access patterns
      /\b(authentication|authorization|encryption|certificate|key|hash|algorithm|protocol)\b/gi,
      // Network and infrastructure
      /\b(firewall|proxy|vpn|dns|dhcp|tcp|udp|http|https|ssl|tls|port|socket)\b/gi,
      // System administration
      /\b(service|daemon|process|thread|memory|cpu|disk|partition|mount|unmount)\b/gi,
      // Database and storage
      /\b(database|table|index|query|backup|restore|transaction|schema|field)\b/gi,
      // Monitoring and logging
      /\b(log|audit|monitor|alert|threshold|metric|dashboard|report|analysis)\b/gi,
      // Automation and tools
      /\b(automated|script|tool|utility|scanner|parser|analyzer|generator)\b/gi
    ];

    let technicalMatches = 0;
    const technicalCategories = new Set<string>();
    
    technicalPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        technicalMatches += matches.length;
        technicalCategories.add(`cat_${index}`);
      }
    });

    // Base technical score
    const technicalDensity = technicalMatches / Math.max(content.split(/\s+/).length, 1);
    score = Math.min(0.7, technicalDensity * 20);

    // Category diversity bonus
    if (technicalCategories.size >= 3) {
      score += 0.2;
    } else if (technicalCategories.size >= 2) {
      score += 0.1;
    }

    // Framework-specific technical requirements
    if (req.framework.includes('CIS Controls')) {
      // CIS Controls expect higher technical specificity
      if (technicalMatches < 2) {
        issues.push('CIS Controls require more technical implementation details');
        score *= 0.7;
      }
      
      // Bonus for asset inventory and control mentions
      const cisSpecific = /\b(asset|inventory|safeguard|implementation group|ig1|ig2|ig3)\b/gi;
      const cisMatches = content.match(cisSpecific);
      if (cisMatches && cisMatches.length > 0) {
        score = Math.min(1.0, score + 0.15);
      }
    }

    // Scoring feedback
    if (score >= 0.8) {
      // Excellent technical depth
    } else if (score >= 0.6) {
      // Good technical depth
    } else if (score >= 0.4) {
      issues.push('Content could benefit from more technical details');
    } else {
      issues.push('Content lacks sufficient technical depth');
      if (technicalMatches === 0) {
        issues.push('No technical terms or implementation details found');
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Get minimum content length for framework
   */
  private getMinContentLengthForFramework(framework: string): number {
    return MIN_CONTENT_LENGTHS[framework as keyof typeof MIN_CONTENT_LENGTHS] || MIN_CONTENT_LENGTHS.DEFAULT;
  }

  /**
   * Check if word is significant technical term
   */
  private isSignificantTechnicalWord(word: string): boolean {
    const technicalTerms = [
      'software', 'hardware', 'system', 'network', 'security', 'control', 'policy',
      'procedure', 'process', 'management', 'framework', 'standard', 'compliance',
      'audit', 'risk', 'vulnerability', 'threat', 'incident', 'response', 'recovery',
      'backup', 'encryption', 'authentication', 'authorization', 'access', 'identity',
      'monitoring', 'logging', 'detection', 'prevention', 'protection', 'configuration',
      'implementation', 'maintenance', 'documentation', 'training', 'awareness'
    ];
    return technicalTerms.includes(word.toLowerCase());
  }

  /**
   * Assess technical complexity of content
   */
  private assessTechnicalComplexity(content: string): number {
    const technicalIndicators = [
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\d+(\.\d+)*\b/g, // Version numbers
      /\b(configure|implement|establish|maintain|monitor|control)\b/gi, // Technical verbs
      /\.(exe|dll|conf|cfg|xml|json|yaml)\b/gi, // File extensions
      /\b(automated|manual|systematic|structured)\b/gi // Process descriptors
    ];

    let complexityScore = 0;
    for (const pattern of technicalIndicators) {
      const matches = content.match(pattern);
      if (matches) {
        complexityScore += matches.length * 0.1;
      }
    }

    return Math.min(1.0, complexityScore / 5);
  }

  /**
   * Calculate generic language ratio
   */
  private calculateGenericLanguageRatio(content: string): number {
    const genericTerms = [
      'appropriate', 'adequate', 'reasonable', 'proper', 'suitable', 'effective',
      'efficient', 'optimal', 'necessary', 'required', 'relevant', 'applicable',
      'various', 'several', 'multiple', 'many', 'some', 'certain', 'specific'
    ];

    const words = content.toLowerCase().split(/\s+/);
    let genericCount = 0;
    
    for (const word of words) {
      if (genericTerms.includes(word.replace(/[^a-z]/g, ''))) {
        genericCount++;
      }
    }

    return genericCount / Math.max(words.length, 1);
  }

  /**
   * Extract weighted key terms from title
   */
  private extractWeightedKeyTerms(title: string): Array<{ term: string; weight: number }> {
    const terms: Array<{ term: string; weight: number }> = [];
    const words = title.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      if (word.length > 3) {
        // Earlier words get higher weight
        const positionWeight = 1.0 - (index * 0.1);
        // Technical terms get bonus weight
        const technicalBonus = this.isSignificantTechnicalWord(word) ? 0.3 : 0;
        
        terms.push({
          term: word,
          weight: Math.max(0.1, positionWeight + technicalBonus)
        });
      }
    });
    
    return terms;
  }

  /**
   * Analyze category relevance
   */
  private analyzeCategoryRelevance(content: string, category: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    const categoryPatterns = this.getCategorySpecificPatterns(category);
    
    for (const pattern of categoryPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        score += 0.2;
      }
    }
    
    if (score < 0.3) {
      issues.push(`Content may not be well-aligned with ${category} category`);
    }
    
    return { score: Math.min(1.0, score), issues };
  }

  /**
   * Get category-specific patterns
   */
  private getCategorySpecificPatterns(category: string): RegExp[] {
    const patterns: Record<string, RegExp[]> = {
      'Governance & Leadership': [
        /\b(governance|leadership|management|policy|oversight)\b/gi,
        /\b(commitment|responsibility|accountability|authority)\b/gi,
        /\b(framework|structure|organization|committee)\b/gi
      ],
      'Asset Management': [
        /\b(asset|inventory|equipment|hardware|software)\b/gi,
        /\b(lifecycle|disposal|maintenance|tracking)\b/gi,
        /\b(classification|labeling|handling|protection)\b/gi
      ],
      'Access Control': [
        /\b(access|control|authentication|authorization|identity)\b/gi,
        /\b(user|account|privilege|permission|role)\b/gi,
        /\b(password|credential|token|certificate)\b/gi
      ]
    };
    
    return patterns[category] || [];
  }

  /**
   * Analyze framework terminology
   */
  private analyzeFrameworkTerminology(content: string, framework: string): { score: number } {
    const frameworkTerms = this.getFrameworkSpecificTerms(framework);
    let matches = 0;
    
    for (const term of frameworkTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        matches++;
      }
    }
    
    return { score: Math.min(0.5, matches * 0.1) };
  }

  /**
   * Get framework-specific terms
   */
  private getFrameworkSpecificTerms(framework: string): string[] {
    const frameworkTerms: Record<string, string[]> = {
      'ISO 27001': ['ISMS', 'management system', 'clause', 'annex', 'control', 'information security'],
      'CIS Controls': ['implementation group', 'safeguard', 'asset', 'inventory', 'IG1', 'IG2', 'IG3'],
      'NIST': ['cybersecurity framework', 'identify', 'protect', 'detect', 'respond', 'recover'],
      'SOC 2': ['trust service criteria', 'control environment', 'monitoring', 'security'],
      'NIS2': ['essential services', 'digital service provider', 'incident reporting', 'cybersecurity']
    };
    
    return frameworkTerms[framework] || [];
  }

  /**
   * Detect off-topic content
   */
  private detectOffTopicContent(content: string, req: RequirementDetail): number {
    // This is a simplified implementation
    // In practice, this could use more sophisticated NLP techniques
    const requiredKeywords = req.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let relevantWordCount = 0;
    for (const keyword of requiredKeywords) {
      if (contentWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        relevantWordCount++;
      }
    }
    
    const relevanceRatio = relevantWordCount / Math.max(requiredKeywords.length, 1);
    return Math.max(0, 0.5 - relevanceRatio);
  }

  /**
   * Assess contextual relevance
   */
  private assessContextualRelevance(content: string, req: RequirementDetail): number {
    // Check for context-appropriate language based on requirement type
    const controlKeywords = ['control', 'implement', 'establish', 'maintain', 'ensure'];
    const policyKeywords = ['policy', 'procedure', 'document', 'define', 'approve'];
    const technicalKeywords = ['configure', 'install', 'deploy', 'monitor', 'scan'];
    
    let contextScore = 0;
    const contentLower = content.toLowerCase();
    
    if (req.title.toLowerCase().includes('control')) {
      for (const keyword of controlKeywords) {
        if (contentLower.includes(keyword)) {
          contextScore += 0.1;
        }
      }
    }
    
    if (req.title.toLowerCase().includes('policy')) {
      for (const keyword of policyKeywords) {
        if (contentLower.includes(keyword)) {
          contextScore += 0.1;
        }
      }
    }
    
    return Math.min(0.5, contextScore);
  }
}