/**
 * Intelligent Requirement Mapper
 * 
 * REAL intelligent mapping that analyzes framework requirements and maps them 
 * to the correct sub-requirements based on actual content analysis.
 * 
 * NO MORE GENERIC ABSTRACTIONS - This creates proper requirement mapping!
 */

export interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  category: string;
}

export interface MappingResult {
  targetSubRequirement: string;  // Which sub-requirement (a, b, c...) this maps to
  confidence: number;           // Confidence score (0-1)
  mappingReasons: string[];     // Why it was mapped here
  preservedDetails: string[];   // Critical details preserved (72h, entities, etc.)
  unifiedContent: string;       // Clean unified content
  frameworkReferences: string[]; // Source references
}

export interface OverlapGroup {
  requirements: FrameworkRequirement[];
  commonTheme: string;
  unifiedRequirement: string;
  preservedDetails: string[];
  confidence: number;
}

export class IntelligentRequirementMapper {

  // Domain-specific mapping rules based on actual compliance content
  private static readonly MAPPING_RULES = {
    'governance': {
      keywords: ['management', 'governance', 'leadership', 'board', 'executive', 'policy', 'oversight'],
      subRequirements: {
        'a': ['leadership', 'board', 'executive', 'accountability', 'governance structure'],
        'b': ['policy', 'framework', 'establish', 'document', 'approve'],
        'c': ['roles', 'responsibilities', 'assignment', 'ownership', 'authority'],
        'd': ['communication', 'awareness', 'training', 'dissemination'],
        'e': ['review', 'monitoring', 'oversight', 'compliance', 'effectiveness'],
        'f': ['resources', 'budget', 'allocation', 'investment', 'funding']
      }
    },
    'access_control': {
      keywords: ['access', 'authentication', 'authorization', 'identity', 'user', 'privilege'],
      subRequirements: {
        'a': ['access control policy', 'strategy', 'framework', 'principles'],
        'b': ['user registration', 'provisioning', 'account management', 'lifecycle'],
        'c': ['authentication', 'password', 'credentials', 'multi-factor', 'mfa'],
        'd': ['authorization', 'privilege', 'rights', 'permissions', 'rbac'],
        'e': ['monitoring', 'logging', 'access review', 'audit trail'],
        'f': ['privileged access', 'admin', 'elevated', 'superuser'],
        'g': ['remote access', 'vpn', 'external', 'third party']
      }
    },
    'asset_management': {
      keywords: ['asset', 'inventory', 'classification', 'handling', 'lifecycle'],
      subRequirements: {
        'a': ['inventory', 'register', 'catalog', 'identification', 'tracking'],
        'b': ['classification', 'labeling', 'sensitivity', 'categorization'],
        'c': ['ownership', 'responsibility', 'accountability', 'custodian'],
        'd': ['handling', 'storage', 'transmission', 'processing', 'protection'],
        'e': ['lifecycle', 'acquisition', 'deployment', 'maintenance', 'retirement'],
        'f': ['media', 'removable', 'transport', 'sanitization'],
        'g': ['return', 'disposal', 'destruction', 'termination']
      }
    },
    'risk_management': {
      keywords: ['risk', 'assessment', 'treatment', 'monitoring', 'analysis'],
      subRequirements: {
        'a': ['risk assessment', 'methodology', 'process', 'approach'],
        'b': ['identification', 'threat', 'vulnerability', 'impact'],
        'c': ['evaluation', 'prioritization', 'criteria', 'appetite'],
        'd': ['treatment', 'mitigation', 'controls', 'strategy'],
        'e': ['monitoring', 'review', 'continuous', 'effectiveness'],
        'f': ['communication', 'reporting', 'stakeholder'],
        'g': ['documentation', 'records', 'audit trail']
      }
    },
    'network_security': {
      keywords: ['network', 'firewall', 'intrusion', 'monitoring', 'communication'],
      subRequirements: {
        'a': ['architecture', 'segmentation', 'dmz', 'isolation'],
        'b': ['access control', 'firewall', 'intrusion prevention', 'filtering'],
        'c': ['monitoring', 'detection', 'intrusion detection', 'traffic'],
        'd': ['encryption', 'vpn', 'secure communication', 'protocols'],
        'e': ['wireless', 'wifi', 'access point', 'guest network'],
        'f': ['configuration', 'hardening', 'change management'],
        'g': ['incident response', 'breach', 'forensics']
      }
    }
  };

  // Critical detail patterns that MUST be preserved
  private static readonly CRITICAL_PATTERNS = {
    timelines: /(\d+)\s*(hours?|days?|months?|weeks?|minutes?|years?)\b/gi,
    deadlines: /\b(within|not later than|before|after|during|immediately|without delay)\s*(\d+\s*(?:hours?|days?|months?))/gi,
    entities: /\b(controller|processor|data subject|supervisory authority|dpo|data protection officer|public authority|management|board)\b/gi,
    percentages: /(\d+(?:\.\d+)?)\s*%/g,
    amounts: /[\$€£]\s*[\d,]+(?:\.\d+)?/g,
    references: /\b(article|clause|section|annex)\s*\d+(?:\.\d+)*\b/gi,
    mandatory: /\b(shall|must|required|mandatory|obligatory)\b/gi
  };

  /**
   * Map framework requirement to correct sub-requirement with intelligence
   */
  static mapRequirementToSubRequirement(
    requirement: FrameworkRequirement,
    templateCategory: string
  ): MappingResult {
    
    console.log(`[INTELLIGENT MAPPING] Analyzing: ${requirement.code} - ${requirement.title}`);
    
    // Get mapping rules for this category
    const categoryKey = this.getCategoryKey(templateCategory);
    const rules = this.MAPPING_RULES[categoryKey];
    
    if (!rules) {
      console.log(`[INTELLIGENT MAPPING] No rules found for category: ${templateCategory}`);
      return this.createDefaultMapping(requirement);
    }

    // Analyze requirement content
    const content = `${requirement.title} ${requirement.description}`.toLowerCase();
    const preservedDetails = this.extractCriticalDetails(requirement.description);
    
    // Find best matching sub-requirement
    let bestMatch = { subReq: 'a', confidence: 0, reasons: [] as string[] };
    
    for (const [subReq, keywords] of Object.entries(rules.subRequirements)) {
      const confidence = this.calculateMatchConfidence(content, keywords);
      const reasons = this.getMatchingReasons(content, keywords);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { subReq, confidence, reasons };
      }
    }

    console.log(`[INTELLIGENT MAPPING] Best match: ${bestMatch.subReq} (confidence: ${bestMatch.confidence.toFixed(2)})`);
    console.log(`[INTELLIGENT MAPPING] Reasons:`, bestMatch.reasons);

    // Create unified content preserving critical details
    const unifiedContent = this.createUnifiedContent(requirement, preservedDetails);

    return {
      targetSubRequirement: bestMatch.subReq,
      confidence: bestMatch.confidence,
      mappingReasons: bestMatch.reasons,
      preservedDetails,
      unifiedContent,
      frameworkReferences: [`${requirement.framework} ${requirement.code}`]
    };
  }

  /**
   * Detect overlapping requirements and create unified version
   */
  static detectOverlaps(requirements: FrameworkRequirement[]): OverlapGroup[] {
    const groups: OverlapGroup[] = [];
    const processed = new Set<string>();

    for (const req of requirements) {
      if (processed.has(req.id)) continue;

      // Find similar requirements
      const similar = requirements.filter(other => 
        !processed.has(other.id) && 
        this.calculateSimilarity(req, other) > 0.7
      );

      if (similar.length > 1) {
        // Create overlap group
        const commonTheme = this.extractCommonTheme(similar);
        const unifiedRequirement = this.createUnifiedRequirement(similar);
        const preservedDetails = this.mergePreservedDetails(similar);
        
        groups.push({
          requirements: similar,
          commonTheme,
          unifiedRequirement,
          preservedDetails,
          confidence: 0.85
        });

        // Mark as processed
        similar.forEach(s => processed.add(s.id));
      }
    }

    return groups;
  }

  /**
   * Calculate match confidence between content and keywords
   */
  private static calculateMatchConfidence(content: string, keywords: string[]): number {
    let matches = 0;
    let totalScore = 0;

    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        matches++;
        // Weight longer, more specific keywords higher
        totalScore += keyword.length > 8 ? 2 : 1;
      }
    }

    // Calculate confidence as weighted matches / total possible
    const confidence = totalScore / (keywords.length * 1.5);
    return Math.min(confidence, 1.0);
  }

  /**
   * Get reasons why content matches keywords
   */
  private static getMatchingReasons(content: string, keywords: string[]): string[] {
    const reasons: string[] = [];
    
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        reasons.push(`Contains "${keyword}"`);
      }
    }

    return reasons.slice(0, 3); // Top 3 reasons
  }

  /**
   * Extract critical compliance details that must be preserved
   */
  private static extractCriticalDetails(text: string): string[] {
    const details: string[] = [];

    // Extract timelines (72 hours, 30 days, etc.)
    const timelineMatches = Array.from(text.matchAll(this.CRITICAL_PATTERNS.timelines));
    timelineMatches.forEach(match => {
      details.push(`Timeline: ${match[1]} ${match[2]}`);
    });

    // Extract deadlines
    const deadlineMatches = Array.from(text.matchAll(this.CRITICAL_PATTERNS.deadlines));
    deadlineMatches.forEach(match => {
      details.push(`Deadline: ${match[0]}`);
    });

    // Extract entities
    const entityMatches = Array.from(text.matchAll(this.CRITICAL_PATTERNS.entities));
    if (entityMatches.length > 0) {
      const entities = [...new Set(entityMatches.map(m => m[1]))];
      details.push(`Entities: ${entities.join(', ')}`);
    }

    // Extract percentages
    const percentageMatches = Array.from(text.matchAll(this.CRITICAL_PATTERNS.percentages));
    percentageMatches.forEach(match => {
      details.push(`Threshold: ${match[1]}%`);
    });

    // Extract mandatory language
    const mandatoryMatches = Array.from(text.matchAll(this.CRITICAL_PATTERNS.mandatory));
    if (mandatoryMatches.length > 0) {
      details.push('Mandatory requirement');
    }

    return details;
  }

  /**
   * Create unified content preserving critical details
   */
  private static createUnifiedContent(
    requirement: FrameworkRequirement, 
    preservedDetails: string[]
  ): string {
    let content = requirement.description;

    // Clean up common prefixes/suffixes
    content = content.replace(/^The organization (shall|must|should)\s*/i, '');
    content = content.replace(/\s*in accordance with.*$/i, '');

    // Ensure first letter is capitalized
    content = content.charAt(0).toUpperCase() + content.slice(1);

    // Add preserved details if any
    if (preservedDetails.length > 0) {
      content += ` (${preservedDetails.join('; ')})`;
    }

    return content;
  }

  /**
   * Calculate similarity between two requirements
   */
  private static calculateSimilarity(req1: FrameworkRequirement, req2: FrameworkRequirement): number {
    const text1 = `${req1.title} ${req1.description}`.toLowerCase();
    const text2 = `${req2.title} ${req2.description}`.toLowerCase();

    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Extract common theme from similar requirements
   */
  private static extractCommonTheme(requirements: FrameworkRequirement[]): string {
    // Find most common significant words
    const wordCounts = new Map<string, number>();
    
    requirements.forEach(req => {
      const words = `${req.title} ${req.description}`.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4 && !['shall', 'must', 'should', 'organization'].includes(w));
      
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    // Get top 3 common words
    const topWords = Array.from(wordCounts.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word, _]) => word);

    return topWords.join(' ');
  }

  /**
   * Create unified requirement from multiple similar ones
   */
  private static createUnifiedRequirement(requirements: FrameworkRequirement[]): string {
    // Start with the most detailed description
    const longest = requirements.reduce((prev, current) => 
      current.description.length > prev.description.length ? current : prev
    );

    let unified = longest.description;

    // Add unique details from others
    const uniqueDetails: string[] = [];
    requirements.forEach(req => {
      if (req.id !== longest.id) {
        // Extract unique phrases (simple approach)
        const uniquePhrases = req.description.split(/[.,;]/)
          .map(phrase => phrase.trim())
          .filter(phrase => 
            phrase.length > 10 && 
            !unified.toLowerCase().includes(phrase.toLowerCase())
          );
        
        uniqueDetails.push(...uniquePhrases.slice(0, 2)); // Max 2 per requirement
      }
    });

    if (uniqueDetails.length > 0) {
      unified += ` Additionally: ${uniqueDetails.join('; ')}.`;
    }

    return unified;
  }

  /**
   * Merge preserved details from multiple requirements
   */
  private static mergePreservedDetails(requirements: FrameworkRequirement[]): string[] {
    const allDetails: string[] = [];
    
    requirements.forEach(req => {
      const details = this.extractCriticalDetails(req.description);
      allDetails.push(...details);
    });

    // Remove duplicates and return
    return [...new Set(allDetails)];
  }

  /**
   * Get category key for mapping rules
   */
  private static getCategoryKey(templateCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Governance & Leadership': 'governance',
      'Access Control & Identity Management': 'access_control',
      'Asset Management': 'asset_management',
      'Risk Management': 'risk_management',
      'Network Security Management': 'network_security'
    };

    return categoryMap[templateCategory] || 'governance';
  }

  /**
   * Create default mapping when no rules available
   */
  private static createDefaultMapping(requirement: FrameworkRequirement): MappingResult {
    const preservedDetails = this.extractCriticalDetails(requirement.description);
    const unifiedContent = this.createUnifiedContent(requirement, preservedDetails);

    return {
      targetSubRequirement: 'a', // Default to first sub-requirement
      confidence: 0.5,
      mappingReasons: ['Default mapping - no specific rules available'],
      preservedDetails,
      unifiedContent,
      frameworkReferences: [`${requirement.framework} ${requirement.code}`]
    };
  }
}