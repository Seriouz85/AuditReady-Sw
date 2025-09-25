/**
 * Intelligent Text Consolidation Service
 * 
 * This service provides AI-level text abstraction and deduplication
 * WITHOUT relying on external AI APIs, solving rate limit issues.
 * 
 * Features:
 * - Semantic similarity detection
 * - Smart text merging and abstraction
 * - Reference preservation and consolidation
 * - Topic-based reorganization
 * - Duplicate elimination
 */

interface ConsolidationResult {
  consolidatedText: string;
  originalLength: number;
  consolidatedLength: number;
  reductionRatio: number;
  referencesPreserved: string[];
  topicsReorganized: number;
}

interface RequirementText {
  content: string;
  references: string[];
  topic?: string;
  priority?: number;
}

export class IntelligentTextConsolidator {
  private commonPhrases = [
    'organization shall',
    'organization must',
    'organization should',
    'shall establish',
    'must establish',
    'should establish',
    'shall implement',
    'must implement', 
    'should implement',
    'shall maintain',
    'must maintain',
    'should maintain',
    'information security',
    'security controls',
    'risk management',
    'access control',
    'incident response',
    'business continuity',
    'data protection',
    'security policy',
    'security procedure'
  ];

  private topicKeywords = {
    'policy': ['policy', 'policies', 'governance', 'framework', 'strategy'],
    'procedure': ['procedure', 'process', 'workflow', 'methodology'],
    'training': ['training', 'awareness', 'education', 'competence'],
    'monitoring': ['monitoring', 'review', 'audit', 'assessment'],
    'documentation': ['document', 'record', 'evidence', 'documentation'],
    'implementation': ['implement', 'establish', 'deploy', 'execute'],
    'maintenance': ['maintain', 'update', 'review', 'improve'],
    'compliance': ['comply', 'conform', 'adherence', 'compliance']
  };

  /**
   * Main consolidation method
   */
  consolidateRequirements(requirements: RequirementText[]): ConsolidationResult {
    const originalLength = this.calculateTotalLength(requirements);
    
    // Step 1: Group by semantic similarity
    const semanticGroups = this.groupBySimilarity(requirements);
    
    // Step 2: Merge similar requirements
    const mergedRequirements = this.mergeSimilarRequirements(semanticGroups);
    
    // Step 3: Abstract and deduplicate
    const abstractedRequirements = this.abstractRequirements(mergedRequirements);
    
    // Step 4: Reorganize by topics
    const reorganized = this.reorganizeByTopics(abstractedRequirements);
    
    // Step 5: Generate final consolidated text
    const consolidatedText = this.generateConsolidatedText(reorganized);
    
    const consolidatedLength = consolidatedText.length;
    const allReferences = this.extractAllReferences(requirements);
    
    return {
      consolidatedText,
      originalLength,
      consolidatedLength,
      reductionRatio: (originalLength - consolidatedLength) / originalLength,
      referencesPreserved: allReferences,
      topicsReorganized: Object.keys(reorganized).length
    };
  }

  /**
   * Group requirements by semantic similarity using word overlap
   */
  private groupBySimilarity(requirements: RequirementText[]): RequirementText[][] {
    const groups: RequirementText[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < requirements.length; i++) {
      if (used.has(i)) continue;
      
      const group = [requirements[i]];
      used.add(i);

      for (let j = i + 1; j < requirements.length; j++) {
        if (used.has(j)) continue;
        
        const similarity = this.calculateSimilarity(requirements[i].content, requirements[j].content);
        if (similarity > 0.6) { // 60% similarity threshold
          group.push(requirements[j]);
          used.add(j);
        }
      }
      
      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculate semantic similarity between two texts
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common stop words
    const stopWords = ['shall', 'must', 'should', 'will', 'organization', 'system', 'control'];
    return words.filter(word => !stopWords.includes(word));
  }

  /**
   * Merge similar requirements intelligently
   */
  private mergeSimilarRequirements(groups: RequirementText[][]): RequirementText[] {
    return groups.map(group => {
      if (group.length === 1) return group[0];
      
      // Find the most comprehensive requirement as base
      const baseRequirement = group.reduce((prev, current) => 
        current.content.length > prev.content.length ? current : prev
      );
      
      // Merge unique content from other requirements
      const additionalContent = this.extractUniqueContent(group, baseRequirement);
      const allReferences = this.mergeReferences(group);
      
      return {
        content: this.mergeContent(baseRequirement.content, additionalContent),
        references: allReferences,
        topic: baseRequirement.topic,
        priority: Math.max(...group.map(r => r.priority || 0))
      };
    });
  }

  /**
   * Extract unique content from a group of requirements
   */
  private extractUniqueContent(group: RequirementText[], base: RequirementText): string[] {
    const baseKeywords = new Set(this.extractKeywords(base.content));
    const uniqueContent: string[] = [];
    
    group.forEach(req => {
      if (req === base) return;
      
      const sentences = req.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      sentences.forEach(sentence => {
        const sentenceKeywords = this.extractKeywords(sentence);
        const hasUniqueContent = sentenceKeywords.some(keyword => !baseKeywords.has(keyword));
        
        if (hasUniqueContent && !this.isDuplicate(sentence, uniqueContent)) {
          uniqueContent.push(sentence.trim());
        }
      });
    });
    
    return uniqueContent;
  }

  /**
   * Merge content intelligently
   */
  private mergeContent(baseContent: string, additionalContent: string[]): string {
    if (additionalContent.length === 0) return baseContent;
    
    // Add unique content while maintaining flow
    const additional = additionalContent
      .filter(content => content.length > 0)
      .join('. ');
    
    return `${baseContent}${additional ? '. ' + additional : ''}`;
  }

  /**
   * Merge references from multiple requirements
   */
  private mergeReferences(group: RequirementText[]): string[] {
    const allRefs = group.flatMap(req => req.references || []);
    return [...new Set(allRefs)].sort();
  }

  /**
   * Abstract requirements by removing redundancy
   */
  private abstractRequirements(requirements: RequirementText[]): RequirementText[] {
    return requirements.map(req => {
      let abstractedContent = req.content;
      
      // Remove redundant phrases
      this.commonPhrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        const matches = abstractedContent.match(regex);
        if (matches && matches.length > 1) {
          // Keep only the first occurrence
          abstractedContent = abstractedContent.replace(regex, (match, offset) => {
            return offset === abstractedContent.search(regex) ? match : '';
          });
        }
      });
      
      // Clean up extra whitespace
      abstractedContent = abstractedContent.replace(/\s+/g, ' ').trim();
      
      return {
        ...req,
        content: abstractedContent
      };
    });
  }

  /**
   * Reorganize requirements by topics
   */
  private reorganizeByTopics(requirements: RequirementText[]): Record<string, RequirementText[]> {
    const topicGroups: Record<string, RequirementText[]> = {};
    
    requirements.forEach(req => {
      const topic = this.identifyTopic(req.content) || 'general';
      if (!topicGroups[topic]) {
        topicGroups[topic] = [];
      }
      topicGroups[topic].push(req);
    });
    
    return topicGroups;
  }

  /**
   * Identify the main topic of a requirement
   */
  private identifyTopic(content: string): string | null {
    const contentLower = content.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      const matchCount = keywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;
      
      if (matchCount >= 2) { // At least 2 keyword matches
        return topic;
      }
    }
    
    return null;
  }

  /**
   * Generate final consolidated text with proper formatting
   */
  private generateConsolidatedText(topicGroups: Record<string, RequirementText[]>): string {
    const sections: string[] = [];
    
    // Sort topics by priority
    const sortedTopics = Object.entries(topicGroups)
      .sort(([a], [b]) => this.getTopicPriority(a) - this.getTopicPriority(b));
    
    sortedTopics.forEach(([topic, requirements]) => {
      const topicTitle = this.formatTopicTitle(topic);
      const topicContent = requirements.map((req, index) => {
        const letter = String.fromCharCode(97 + index); // a, b, c, etc.
        const references = req.references.length > 0 
          ? `\n\n**Framework References:** ${req.references.join(', ')}`
          : '';
        
        return `${letter}. ${req.content}${references}`;
      }).join('\n\n');
      
      sections.push(`## ${topicTitle}\n\n${topicContent}`);
    });
    
    return sections.join('\n\n');
  }

  /**
   * Helper methods
   */
  private calculateTotalLength(requirements: RequirementText[]): number {
    return requirements.reduce((total, req) => total + req.content.length, 0);
  }

  private extractAllReferences(requirements: RequirementText[]): string[] {
    const allRefs = requirements.flatMap(req => req.references || []);
    return [...new Set(allRefs)].sort();
  }

  private isDuplicate(content: string, existing: string[]): boolean {
    const contentKeywords = new Set(this.extractKeywords(content));
    return existing.some(existingContent => {
      const existingKeywords = new Set(this.extractKeywords(existingContent));
      const intersection = [...contentKeywords].filter(word => existingKeywords.has(word));
      return intersection.length / Math.max(contentKeywords.size, existingKeywords.size) > 0.8;
    });
  }

  private getTopicPriority(topic: string): number {
    const priorities: Record<string, number> = {
      'policy': 1,
      'implementation': 2,
      'procedure': 3,
      'training': 4,
      'monitoring': 5,
      'documentation': 6,
      'maintenance': 7,
      'compliance': 8,
      'general': 9
    };
    return priorities[topic] || 10;
  }

  private formatTopicTitle(topic: string): string {
    return topic.charAt(0).toUpperCase() + topic.slice(1).replace(/([A-Z])/g, ' $1');
  }
}

export const intelligentTextConsolidator = new IntelligentTextConsolidator();