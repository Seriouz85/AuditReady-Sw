/**
 * TextProcessor.ts
 * Text normalization, keyword extraction, and linguistic analysis utilities
 * Extracted from RequirementProcessor for better maintainability
 */

export class TextProcessor {
  // Stop words for text processing
  private readonly STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
    'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
    'will', 'with', 'or', 'but', 'not', 'this', 'can', 'may', 'should'
  ]);

  // Technical terms dictionary for domain classification
  private readonly TECHNICAL_TERMS = {
    SECURITY: [
      'authentication', 'authorization', 'encryption', 'cryptography', 'certificate',
      'firewall', 'intrusion', 'malware', 'vulnerability', 'penetration', 'breach'
    ],
    GOVERNANCE: [
      'governance', 'oversight', 'accountability', 'responsibility', 'delegation',
      'policy', 'procedure', 'framework', 'standard', 'guideline', 'compliance'
    ],
    RISK: [
      'risk', 'threat', 'vulnerability', 'impact', 'likelihood', 'mitigation',
      'assessment', 'analysis', 'treatment', 'monitoring', 'control', 'exposure'
    ],
    PROCESS: [
      'process', 'workflow', 'procedure', 'operation', 'activity', 'task',
      'implement', 'execute', 'perform', 'conduct', 'maintain', 'review'
    ],
    TECHNOLOGY: [
      'system', 'application', 'infrastructure', 'network', 'database', 'server',
      'software', 'hardware', 'platform', 'architecture', 'component', 'service'
    ],
    AUDIT: [
      'audit', 'review', 'assessment', 'evaluation', 'verification', 'validation',
      'testing', 'monitoring', 'measurement', 'evidence', 'documentation', 'record'
    ]
  };

  /**
   * Normalize text for consistent processing
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s.,;:!?()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.,;:!?]{2,}/g, match => match[0])
      .replace(/won't/g, 'will not')
      .replace(/can't/g, 'cannot')
      .replace(/n't/g, ' not')
      .replace(/'s/g, ' is')
      .replace(/'re/g, ' are')
      .replace(/'ve/g, ' have')
      .replace(/'ll/g, ' will')
      .replace(/'d/g, ' would');
  }

  /**
   * Extract technical terms from normalized text
   */
  extractTechnicalTerms(text: string): string[] {
    const foundTerms: string[] = [];
    const textLower = text.toLowerCase();

    Object.values(this.TECHNICAL_TERMS).forEach(termList => {
      termList.forEach(term => {
        if (textLower.includes(term.toLowerCase())) {
          foundTerms.push(term);
        }
      });
    });

    return Array.from(new Set(foundTerms)); // Remove duplicates
  }

  /**
   * Extract significant keywords from text
   */
  extractKeywords(text: string): string[] {
    const words = text.split(/\s+/)
      .filter(word => word.length > 2 && !this.STOP_WORDS.has(word))
      .map(word => word.toLowerCase());

    // Count frequency
    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Get top keywords by frequency
    return Array.from(frequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Calculate readability score (Flesch Reading Ease approximation)
   */
  calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => {
      return total + this.countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate complexity score based on multiple factors
   */
  calculateComplexity(text: string, technicalTerms: string[]): number {
    const factors = {
      length: Math.min(text.length / 1000, 1),
      technicalDensity: Math.min(technicalTerms.length / 20, 1),
      sentenceComplexity: this.calculateSentenceComplexity(text),
      conditionals: this.countConditionals(text) / 5,
      references: this.countReferences(text) / 10
    };

    const weights = {
      length: 0.2,
      technicalDensity: 0.3,
      sentenceComplexity: 0.2,
      conditionals: 0.15,
      references: 0.15
    };

    return Object.entries(factors).reduce((total, [factor, value]) => {
      return total + (value * weights[factor as keyof typeof weights]);
    }, 0);
  }

  /**
   * Generate vector representation for semantic similarity
   */
  generateVector(text: string, entityTexts: string[]): number[] {
    const words = text.split(/\s+/).filter(word => 
      word.length > 2 && !this.STOP_WORDS.has(word)
    );

    // Create TF-IDF style vector
    const termFrequency = new Map<string, number>();
    words.forEach(word => {
      termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
    });

    // Convert to normalized vector (first 100 most common terms)
    const sortedTerms = Array.from(termFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 100);

    const vector = new Array(100).fill(0);
    sortedTerms.forEach(([term, freq], index) => {
      vector[index] = freq / words.length; // Normalize by total word count
    });

    // Add entity-based features
    const entityTypes = ['CONTROL', 'POLICY', 'PROCESS', 'REQUIREMENT', 'DOMAIN', 'ASSET', 'RISK'];
    entityTypes.forEach((type, index) => {
      const entityCount = entityTexts.filter(text => text.includes(type.toLowerCase())).length;
      if (index < vector.length) {
        vector[index] = Math.max(vector[index], entityCount / 10);
      }
    });

    return vector;
  }

  /**
   * Generate content hash for deduplication
   */
  generateContentHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Infer category from content analysis
   */
  inferCategory(text: string, technicalTerms: string[]): string {
    const categoryScores: Record<string, number> = {};

    // Score based on technical terms
    Object.entries(this.TECHNICAL_TERMS).forEach(([category, terms]) => {
      categoryScores[category] = terms.filter(term => 
        technicalTerms.includes(term)
      ).length;
    });

    // Score based on action verbs and context
    const categoryKeywords = {
      'ACCESS_CONTROL': ['access', 'permission', 'authorization', 'identity'],
      'DATA_PROTECTION': ['data', 'information', 'privacy', 'confidentiality'],
      'INCIDENT_MANAGEMENT': ['incident', 'response', 'recovery', 'continuity'],
      'RISK_MANAGEMENT': ['risk', 'assessment', 'treatment', 'mitigation'],
      'GOVERNANCE': ['governance', 'policy', 'oversight', 'management'],
      'MONITORING': ['monitor', 'log', 'audit', 'review', 'surveillance']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      categoryScores[category] = (categoryScores[category] || 0) + score;
    });

    // Return category with highest score
    const topCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];

    return topCategory && topCategory[1] > 0 ? topCategory[0] : 'GENERAL';
  }

  /**
   * Infer domain from content analysis
   */
  inferDomain(text: string, technicalTerms: string[]): string {
    const domainScores: Record<string, number> = {};

    // Score based on technical terms
    Object.entries(this.TECHNICAL_TERMS).forEach(([domain, terms]) => {
      domainScores[domain] = terms.filter(term => 
        technicalTerms.includes(term)
      ).length;
    });

    // Additional domain-specific patterns
    const domainPatterns = {
      'CYBERSECURITY': /\b(cyber|security|protect|defend|secure)\b/g,
      'IT_GOVERNANCE': /\b(governance|it|technology|digital)\b/g,
      'COMPLIANCE': /\b(compliance|regulatory|standard|framework)\b/g,
      'OPERATIONS': /\b(operation|process|procedure|workflow)\b/g,
      'LEGAL': /\b(legal|law|regulation|statute|requirement)\b/g
    };

    Object.entries(domainPatterns).forEach(([domain, pattern]) => {
      const matches = text.match(pattern);
      domainScores[domain] = (domainScores[domain] || 0) + (matches ? matches.length : 0);
    });

    const topDomain = Object.entries(domainScores)
      .sort(([,a], [,b]) => b - a)[0];

    return topDomain && topDomain[1] > 0 ? topDomain[0] : 'GENERAL';
  }

  /**
   * Private helper methods
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private calculateSentenceComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((total, sentence) => {
      return total + sentence.split(/\s+/).length;
    }, 0) / sentences.length;

    return Math.min(avgLength / 20, 1); // Normalize to 0-1
  }

  private countConditionals(text: string): number {
    const conditionalWords = ['if', 'when', 'unless', 'provided', 'where', 'should'];
    return conditionalWords.filter(word => text.includes(word)).length;
  }

  private countReferences(text: string): number {
    const referencePattern = /\b(section|clause|requirement|standard|policy|framework)\s+[\w.-]+/gi;
    const matches = text.match(referencePattern);
    return matches ? matches.length : 0;
  }

  /**
   * Get technical terms dictionary
   */
  getTechnicalTerms(): typeof this.TECHNICAL_TERMS {
    return this.TECHNICAL_TERMS;
  }
}