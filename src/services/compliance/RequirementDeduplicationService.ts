/**
 * Requirement Deduplication Service
 * 
 * Intelligently merges similar requirements from multiple frameworks
 * to avoid redundancy while preserving framework-specific details.
 */

export interface FrameworkRequirement {
  framework: string;
  code: string;
  title: string;
  description: string;
  mappingStrength?: 'exact' | 'strong' | 'partial' | 'related';
}

export interface UnifiedRequirement {
  id: string;
  title: string;
  unifiedDescription: string;
  frameworks: FrameworkRequirement[];
  implementationGuidance: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

export interface DeduplicationResult {
  originalCount: number;
  unifiedCount: number;
  reductionPercentage: number;
  unifiedRequirements: UnifiedRequirement[];
}

export class RequirementDeduplicationService {
  /**
   * Similarity threshold for considering requirements as duplicates
   */
  private static readonly SIMILARITY_THRESHOLD = 0.75;

  /**
   * Keywords that indicate similar concepts across frameworks
   */
  private static readonly CONCEPT_MAPPINGS: Record<string, string[]> = {
    'access_control': ['access control', 'access management', 'access rights', 'authorization', 'authentication', 'identity management'],
    'incident_response': ['incident', 'breach', 'security event', 'emergency', 'response', 'crisis management'],
    'risk_management': ['risk assessment', 'risk analysis', 'risk treatment', 'risk evaluation', 'threat assessment'],
    'data_protection': ['data security', 'information protection', 'confidentiality', 'privacy', 'personal data', 'PII'],
    'backup': ['backup', 'recovery', 'restoration', 'business continuity', 'disaster recovery', 'resilience'],
    'monitoring': ['monitoring', 'logging', 'audit trail', 'surveillance', 'detection', 'alerting'],
    'policy': ['policy', 'procedure', 'standard', 'guideline', 'documentation', 'governance'],
    'training': ['training', 'awareness', 'education', 'competence', 'skills development'],
    'supplier': ['supplier', 'vendor', 'third party', 'outsourcing', 'supply chain', 'contractor'],
    'physical': ['physical security', 'environmental', 'facility', 'premises', 'building security']
  };

  /**
   * Calculate similarity between two requirement descriptions
   */
  private static calculateSimilarity(desc1: string, desc2: string): number {
    const words1 = this.tokenize(desc1.toLowerCase());
    const words2 = this.tokenize(desc2.toLowerCase());
    
    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    if (union.size === 0) return 0;
    
    let similarity = intersection.size / union.size;
    
    // Boost similarity if they share concept keywords
    for (const [concept, keywords] of Object.entries(this.CONCEPT_MAPPINGS)) {
      const desc1HasConcept = keywords.some(kw => desc1.toLowerCase().includes(kw));
      const desc2HasConcept = keywords.some(kw => desc2.toLowerCase().includes(kw));
      
      if (desc1HasConcept && desc2HasConcept) {
        similarity = Math.min(1, similarity * 1.2); // 20% boost for shared concepts
      }
    }
    
    return similarity;
  }

  /**
   * Tokenize text into meaningful words
   */
  private static tokenize(text: string): Set<string> {
    // Remove punctuation and split into words
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'his', 'has', 'had', 'how', 'its',
      'may', 'such', 'shall', 'should', 'must', 'will', 'with', 'within'
    ]);
    
    return new Set(words.filter(word => !stopWords.has(word)));
  }

  /**
   * Deduplicate requirements from multiple frameworks
   */
  static deduplicateRequirements(
    requirements: FrameworkRequirement[],
    category: string
  ): DeduplicationResult {
    const originalCount = requirements.length;
    const unifiedRequirements: UnifiedRequirement[] = [];
    const processedIndices = new Set<number>();

    // Sort requirements by framework priority (ISO 27001/2 first, then others)
    const sortedRequirements = [...requirements].sort((a, b) => {
      const priorityOrder = ['iso27001', 'iso27002', 'nis2', 'cisControls', 'gdpr'];
      return priorityOrder.indexOf(a.framework) - priorityOrder.indexOf(b.framework);
    });

    for (let i = 0; i < sortedRequirements.length; i++) {
      if (processedIndices.has(i)) continue;

      const baseReq = sortedRequirements[i];
      const similarRequirements: FrameworkRequirement[] = [baseReq];
      processedIndices.add(i);

      // Find similar requirements
      for (let j = i + 1; j < sortedRequirements.length; j++) {
        if (processedIndices.has(j)) continue;

        const compareReq = sortedRequirements[j];
        const similarity = this.calculateSimilarity(
          baseReq.description,
          compareReq.description
        );

        if (similarity >= this.SIMILARITY_THRESHOLD) {
          similarRequirements.push(compareReq);
          processedIndices.add(j);
        }
      }

      // Create unified requirement
      const unified = this.createUnifiedRequirement(
        similarRequirements,
        category
      );
      unifiedRequirements.push(unified);
    }

    return {
      originalCount,
      unifiedCount: unifiedRequirements.length,
      reductionPercentage: ((originalCount - unifiedRequirements.length) / originalCount) * 100,
      unifiedRequirements
    };
  }

  /**
   * Create a unified requirement from similar requirements
   */
  private static createUnifiedRequirement(
    requirements: FrameworkRequirement[],
    category: string
  ): UnifiedRequirement {
    // Use the most comprehensive description as base
    const primaryReq = requirements.reduce((prev, curr) => 
      curr.description.length > prev.description.length ? curr : prev
    );

    // Determine priority based on number of frameworks requiring it
    let priority: 'critical' | 'high' | 'medium' | 'low';
    if (requirements.length >= 4) priority = 'critical';
    else if (requirements.length >= 3) priority = 'high';
    else if (requirements.length >= 2) priority = 'medium';
    else priority = 'low';

    // Extract tags from all requirements
    const tags = this.extractTags(requirements);

    // Generate comprehensive implementation guidance
    const implementationGuidance = this.generateImplementationGuidance(requirements);

    // Create unified description that captures all framework nuances
    const unifiedDescription = this.createUnifiedDescription(requirements);

    return {
      id: `unified_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.createUnifiedTitle(requirements),
      unifiedDescription,
      frameworks: requirements,
      implementationGuidance,
      category,
      priority,
      tags
    };
  }

  /**
   * Create a unified title from multiple requirements
   */
  private static createUnifiedTitle(requirements: FrameworkRequirement[]): string {
    // Find common themes in titles
    const titles = requirements.map(r => r.title);
    
    // If all titles are similar, use the most descriptive one
    const primaryTitle = titles.reduce((prev, curr) => 
      curr.length > prev.length ? curr : prev
    );

    // If multiple frameworks, indicate this
    if (requirements.length > 1) {
      const frameworks = [...new Set(requirements.map(r => r.framework))];
      return `${primaryTitle} (${frameworks.join(', ')})`;
    }

    return primaryTitle;
  }

  /**
   * Create unified description combining all framework requirements
   */
  private static createUnifiedDescription(requirements: FrameworkRequirement[]): string {
    const descriptions = requirements.map(r => r.description);
    
    // Start with the most comprehensive description
    let unified = descriptions.reduce((prev, curr) => 
      curr.length > prev.length ? curr : prev
    );

    // Add unique details from other descriptions
    requirements.forEach(req => {
      if (req.description === unified) return;

      // Extract unique details
      const uniqueDetails = this.extractUniqueDetails(req.description, unified);
      if (uniqueDetails.length > 0) {
        unified += ` Additionally, ${req.framework.toUpperCase()} requires: ${uniqueDetails.join('; ')}.`;
      }
    });

    return unified;
  }

  /**
   * Extract unique details from one description not in another
   */
  private static extractUniqueDetails(desc1: string, desc2: string): string[] {
    const details: string[] = [];
    const sentences1 = desc1.split(/[.!?]+/).filter(s => s.trim());
    const words2 = this.tokenize(desc2.toLowerCase());

    for (const sentence of sentences1) {
      const sentenceWords = this.tokenize(sentence.toLowerCase());
      const uniqueWords = [...sentenceWords].filter(w => !words2.has(w));
      
      // If sentence has significant unique content, include it
      if (uniqueWords.length / sentenceWords.size > 0.3) {
        details.push(sentence.trim());
      }
    }

    return details.slice(0, 3); // Limit to 3 unique details
  }

  /**
   * Generate comprehensive implementation guidance
   */
  private static generateImplementationGuidance(requirements: FrameworkRequirement[]): string {
    const guidanceParts: string[] = [];
    
    // Add framework-specific guidance
    requirements.forEach(req => {
      const frameworkGuidance = this.getFrameworkSpecificGuidance(req);
      if (frameworkGuidance) {
        guidanceParts.push(frameworkGuidance);
      }
    });

    // Add common implementation steps
    const commonSteps = this.extractCommonImplementationSteps(requirements);
    if (commonSteps.length > 0) {
      guidanceParts.push(`Common implementation steps: ${commonSteps.join('; ')}`);
    }

    return guidanceParts.join(' ');
  }

  /**
   * Get framework-specific implementation guidance
   */
  private static getFrameworkSpecificGuidance(req: FrameworkRequirement): string {
    const guidanceTemplates: Record<string, (req: FrameworkRequirement) => string> = {
      'iso27001': (r) => `ISO 27001 requires documented procedures with management approval and regular reviews`,
      'iso27002': (r) => `ISO 27002 provides detailed implementation guidance including technical and organizational measures`,
      'nis2': (r) => `NIS2 mandates reporting to competent authorities and specific timelines for implementation`,
      'cisControls': (r) => `CIS Controls emphasizes automated implementation and continuous monitoring where possible`,
      'gdpr': (r) => `GDPR requires demonstrable compliance with data subject rights and privacy by design`
    };

    const template = guidanceTemplates[req.framework];
    return template ? template(req) : '';
  }

  /**
   * Extract common implementation steps
   */
  private static extractCommonImplementationSteps(requirements: FrameworkRequirement[]): string[] {
    const steps: string[] = [];
    
    // Check for common requirements across frameworks
    const allDescriptions = requirements.map(r => r.description.toLowerCase()).join(' ');
    
    if (allDescriptions.includes('document') || allDescriptions.includes('procedure')) {
      steps.push('Document procedures and policies');
    }
    if (allDescriptions.includes('review') || allDescriptions.includes('assess')) {
      steps.push('Conduct regular reviews and assessments');
    }
    if (allDescriptions.includes('monitor') || allDescriptions.includes('log')) {
      steps.push('Implement monitoring and logging');
    }
    if (allDescriptions.includes('train') || allDescriptions.includes('aware')) {
      steps.push('Provide training and awareness');
    }
    if (allDescriptions.includes('test') || allDescriptions.includes('verify')) {
      steps.push('Test and verify effectiveness');
    }

    return steps;
  }

  /**
   * Extract tags from requirements
   */
  private static extractTags(requirements: FrameworkRequirement[]): string[] {
    const tags = new Set<string>();
    
    // Add framework tags
    requirements.forEach(req => {
      tags.add(req.framework);
    });

    // Add concept tags
    const allText = requirements.map(r => `${r.title} ${r.description}`).join(' ').toLowerCase();
    
    for (const [concept, keywords] of Object.entries(this.CONCEPT_MAPPINGS)) {
      if (keywords.some(kw => allText.includes(kw))) {
        tags.add(concept.replace('_', '-'));
      }
    }

    // Add category-specific tags
    const categoryKeywords: Record<string, string[]> = {
      'technical': ['technical', 'system', 'network', 'application'],
      'organizational': ['policy', 'procedure', 'governance', 'management'],
      'physical': ['physical', 'environmental', 'facility'],
      'people': ['personnel', 'training', 'awareness', 'human']
    };

    for (const [tag, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => allText.includes(kw))) {
        tags.add(tag);
      }
    }

    return Array.from(tags);
  }

  /**
   * Analyze deduplication effectiveness
   */
  static analyzeDeduplication(result: DeduplicationResult): {
    effectiveness: 'excellent' | 'good' | 'moderate' | 'poor';
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let effectiveness: 'excellent' | 'good' | 'moderate' | 'poor';

    // Determine effectiveness
    if (result.reductionPercentage >= 40) {
      effectiveness = 'excellent';
      insights.push(`Achieved ${result.reductionPercentage.toFixed(1)}% reduction in requirements`);
    } else if (result.reductionPercentage >= 25) {
      effectiveness = 'good';
      insights.push(`Good consolidation with ${result.reductionPercentage.toFixed(1)}% reduction`);
    } else if (result.reductionPercentage >= 10) {
      effectiveness = 'moderate';
      insights.push(`Moderate consolidation achieved`);
      recommendations.push('Consider reviewing similarity threshold for better consolidation');
    } else {
      effectiveness = 'poor';
      insights.push('Limited consolidation achieved');
      recommendations.push('Requirements may be too distinct for effective deduplication');
    }

    // Analyze unified requirements
    const criticalCount = result.unifiedRequirements.filter(r => r.priority === 'critical').length;
    const highCount = result.unifiedRequirements.filter(r => r.priority === 'high').length;
    
    insights.push(`${criticalCount} critical and ${highCount} high priority unified requirements identified`);
    
    // Framework coverage analysis
    const frameworkCoverage = new Map<string, number>();
    result.unifiedRequirements.forEach(req => {
      req.frameworks.forEach(fr => {
        frameworkCoverage.set(fr.framework, (frameworkCoverage.get(fr.framework) || 0) + 1);
      });
    });

    const maxCoverage = Math.max(...frameworkCoverage.values());
    const bestFramework = [...frameworkCoverage.entries()].find(([_, count]) => count === maxCoverage)?.[0];
    
    if (bestFramework) {
      insights.push(`${bestFramework} has the most comprehensive coverage with ${maxCoverage} requirements`);
    }

    // Recommendations based on analysis
    if (result.unifiedRequirements.some(r => r.frameworks.length >= 4)) {
      recommendations.push('Focus on requirements that appear across 4+ frameworks first');
    }
    
    if (result.unifiedRequirements.some(r => r.tags.includes('access-control'))) {
      recommendations.push('Access control is a common theme - consider unified access management strategy');
    }

    return {
      effectiveness,
      insights,
      recommendations
    };
  }
}