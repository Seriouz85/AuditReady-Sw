import { supabase } from '@/lib/supabase';
import { AggregatedRequirement } from './RequirementAggregator';

export interface DeduplicatedRequirement {
  id: string;
  unifiedText: string;
  originalRequirements: {
    id: string;
    code: string;
    framework: string;
    text: string;
  }[];
  frameworks: string[];
  references: FrameworkReference[];
  priority: number;
  category: string;
  isDuplicate: boolean;
}

export interface FrameworkReference {
  framework: string;
  codes: string[];
  titles: string[];
  strength: 'exact' | 'strong' | 'partial' | 'related';
}

export interface GuidanceSection {
  id: string;
  title: string;
  content: string;
  sources: string[];
  frameworks: string[];
}

/**
 * Service responsible for removing duplicate requirements across frameworks,
 * merging similar references, and consolidating guidance into coherent content
 */
export class ContentDeduplicator {

  private readonly SIMILARITY_THRESHOLD = 0.85;
  private readonly PARTIAL_SIMILARITY_THRESHOLD = 0.65;

  /**
   * Deduplicate requirements by identifying and merging similar content
   */
  deduplicateRequirements(requirements: AggregatedRequirement[]): DeduplicatedRequirement[] {
    if (!requirements.length) return [];

    const deduplicated: DeduplicatedRequirement[] = [];
    const processed = new Set<string>();

    // Sort by priority to process high-priority items first
    const sortedRequirements = [...requirements].sort((a, b) => b.priority - a.priority);

    for (const requirement of sortedRequirements) {
      if (processed.has(requirement.id)) continue;

      // Find similar requirements
      const similar = this.findSimilarRequirements(requirement, sortedRequirements, processed);
      
      // Create deduplicated requirement
      const deduplicatedReq = this.createDeduplicatedRequirement(requirement, similar);
      deduplicated.push(deduplicatedReq);

      // Mark as processed
      processed.add(requirement.id);
      similar.forEach(req => processed.add(req.id));
    }

    return deduplicated.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Merge references from multiple frameworks into consolidated references
   */
  mergeReferences(requirements: DeduplicatedRequirement[]): FrameworkReference[] {
    const referenceMap = new Map<string, FrameworkReference>();

    requirements.forEach(req => {
      req.references.forEach(ref => {
        const existing = referenceMap.get(ref.framework);
        
        if (existing) {
          // Merge codes and titles
          existing.codes = [...new Set([...existing.codes, ...ref.codes])];
          existing.titles = [...new Set([...existing.titles, ...ref.titles])];
          
          // Use the strongest mapping strength
          const strengths = ['exact', 'strong', 'partial', 'related'];
          const existingIndex = strengths.indexOf(existing.strength);
          const newIndex = strengths.indexOf(ref.strength);
          
          if (newIndex < existingIndex) {
            existing.strength = ref.strength;
          }
        } else {
          referenceMap.set(ref.framework, { ...ref });
        }
      });
    });

    return Array.from(referenceMap.values())
      .sort((a, b) => {
        const priority = { 'exact': 4, 'strong': 3, 'partial': 2, 'related': 1 };
        return priority[b.strength] - priority[a.strength];
      });
  }

  /**
   * Consolidate multiple guidance sections into single coherent guidance
   */
  consolidateGuidance(guidances: GuidanceSection[]): GuidanceSection {
    if (guidances.length === 0) {
      return {
        id: 'empty',
        title: 'No Guidance Available',
        content: 'No guidance content found for the selected frameworks.',
        sources: [],
        frameworks: []
      };
    }

    if (guidances.length === 1) {
      return guidances[0];
    }

    // Merge guidance content intelligently
    const consolidatedFrameworks = [...new Set(guidances.flatMap(g => g.frameworks))];
    const consolidatedSources = [...new Set(guidances.flatMap(g => g.sources))];
    
    // Find the most comprehensive guidance as base
    const baseGuidance = guidances.reduce((prev, current) => 
      current.content.length > prev.content.length ? current : prev
    );

    // Extract unique insights from other guidances
    const additionalInsights = this.extractUniqueInsights(baseGuidance.content, 
      guidances.filter(g => g.id !== baseGuidance.id));

    let consolidatedContent = baseGuidance.content;
    
    if (additionalInsights.length > 0) {
      consolidatedContent += '\n\n**Additional Framework-Specific Considerations:**\n';
      consolidatedContent += additionalInsights.join('\n\n');
    }

    return {
      id: `consolidated_${guidances.map(g => g.id).join('_')}`,
      title: baseGuidance.title,
      content: consolidatedContent,
      sources: consolidatedSources,
      frameworks: consolidatedFrameworks
    };
  }

  /**
   * Remove duplicate content from a list of text items
   */
  removeDuplicateContent(items: string[]): string[] {
    const unique: string[] = [];
    const normalized: string[] = [];

    for (const item of items) {
      const normalizedItem = this.normalizeText(item);
      
      let isDuplicate = false;
      for (let i = 0; i < normalized.length; i++) {
        if (this.calculateTextSimilarity(normalizedItem, normalized[i]) > this.SIMILARITY_THRESHOLD) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        unique.push(item);
        normalized.push(normalizedItem);
      }
    }

    return unique;
  }

  /**
   * Identify and group related requirements across frameworks
   */
  identifyRelatedRequirements(requirements: AggregatedRequirement[]): Map<string, AggregatedRequirement[]> {
    const groups = new Map<string, AggregatedRequirement[]>();
    const processed = new Set<string>();

    for (const requirement of requirements) {
      if (processed.has(requirement.id)) continue;

      const related = this.findRelatedRequirements(requirement, requirements, processed);
      const groupKey = this.generateGroupKey([requirement, ...related]);
      
      groups.set(groupKey, [requirement, ...related]);
      
      processed.add(requirement.id);
      related.forEach(req => processed.add(req.id));
    }

    return groups;
  }

  /**
   * Get deduplication statistics
   */
  getDeduplicationStats(
    original: AggregatedRequirement[], 
    deduplicated: DeduplicatedRequirement[]
  ): {
    originalCount: number;
    deduplicatedCount: number;
    reductionPercentage: number;
    duplicatesRemoved: number;
    frameworkOverlap: Record<string, number>;
  } {
    const duplicatesRemoved = original.length - deduplicated.length;
    const reductionPercentage = (duplicatesRemoved / original.length) * 100;

    // Calculate framework overlap
    const frameworkOverlap: Record<string, number> = {};
    deduplicated.forEach(req => {
      if (req.frameworks.length > 1) {
        const key = req.frameworks.sort().join(' + ');
        frameworkOverlap[key] = (frameworkOverlap[key] || 0) + 1;
      }
    });

    return {
      originalCount: original.length,
      deduplicatedCount: deduplicated.length,
      reductionPercentage: Math.round(reductionPercentage * 100) / 100,
      duplicatesRemoved,
      frameworkOverlap
    };
  }

  /**
   * Find similar requirements to a given requirement
   */
  private findSimilarRequirements(
    target: AggregatedRequirement,
    allRequirements: AggregatedRequirement[],
    processed: Set<string>
  ): AggregatedRequirement[] {
    return allRequirements.filter(req => 
      req.id !== target.id &&
      !processed.has(req.id) &&
      req.category === target.category &&
      this.areRequirementsSimilar(target, req)
    );
  }

  /**
   * Check if two requirements are similar enough to be merged
   */
  private areRequirementsSimilar(req1: AggregatedRequirement, req2: AggregatedRequirement): boolean {
    // Check text similarity
    const textSimilarity = this.calculateTextSimilarity(req1.description, req2.description);
    if (textSimilarity > this.SIMILARITY_THRESHOLD) {
      return true;
    }

    // Check code similarity (e.g., "4.1" and "4.2" might be related)
    if (this.areCodesSimilar(req1.code, req2.code)) {
      return textSimilarity > this.PARTIAL_SIMILARITY_THRESHOLD;
    }

    // Check title similarity
    const titleSimilarity = this.calculateTextSimilarity(req1.title, req2.title);
    if (titleSimilarity > 0.8 && textSimilarity > this.PARTIAL_SIMILARITY_THRESHOLD) {
      return true;
    }

    return false;
  }

  /**
   * Create a deduplicated requirement from a main requirement and its similar ones
   */
  private createDeduplicatedRequirement(
    main: AggregatedRequirement,
    similar: AggregatedRequirement[]
  ): DeduplicatedRequirement {
    const allRequirements = [main, ...similar];
    
    // Generate unified text
    const unifiedText = this.generateUnifiedText(allRequirements);
    
    // Collect all frameworks
    const frameworks = [...new Set(allRequirements.flatMap(req => req.frameworks))];
    
    // Generate references
    const references = this.generateReferences(allRequirements);
    
    // Calculate priority (use highest priority)
    const priority = Math.max(...allRequirements.map(req => req.priority));

    return {
      id: this.generateDeduplicatedId(allRequirements),
      unifiedText,
      originalRequirements: allRequirements.map(req => ({
        id: req.id,
        code: req.code,
        framework: req.frameworks.join(', '),
        text: req.description
      })),
      frameworks,
      references,
      priority,
      category: main.category,
      isDuplicate: similar.length > 0
    };
  }

  /**
   * Generate unified text from multiple requirements
   */
  private generateUnifiedText(requirements: AggregatedRequirement[]): string {
    if (requirements.length === 1) {
      return requirements[0].description;
    }

    // Use the most comprehensive description as base
    const base = requirements.reduce((prev, current) => 
      current.description.length > prev.description.length ? current : prev
    );

    // Extract unique elements from other descriptions
    const uniqueElements = requirements
      .filter(req => req.id !== base.id)
      .map(req => this.extractUniqueElements(req.description, base.description))
      .filter(element => element.trim().length > 0);

    let unified = base.description;
    
    if (uniqueElements.length > 0) {
      unified += ' ' + uniqueElements.join(' ').trim();
    }

    return this.cleanText(unified);
  }

  /**
   * Generate framework references from requirements
   */
  private generateReferences(requirements: AggregatedRequirement[]): FrameworkReference[] {
    const referenceMap = new Map<string, FrameworkReference>();

    requirements.forEach(req => {
      req.frameworks.forEach(framework => {
        const existing = referenceMap.get(framework);
        
        if (existing) {
          existing.codes.push(req.code);
          existing.titles.push(req.title);
        } else {
          referenceMap.set(framework, {
            framework,
            codes: [req.code],
            titles: [req.title],
            strength: req.mappingStrength[0] || 'related'
          });
        }
      });
    });

    // Clean up references
    referenceMap.forEach(ref => {
      ref.codes = [...new Set(ref.codes)].sort();
      ref.titles = [...new Set(ref.titles)];
    });

    return Array.from(referenceMap.values());
  }

  /**
   * Find related requirements (broader than similar)
   */
  private findRelatedRequirements(
    target: AggregatedRequirement,
    allRequirements: AggregatedRequirement[],
    processed: Set<string>
  ): AggregatedRequirement[] {
    return allRequirements.filter(req => 
      req.id !== target.id &&
      !processed.has(req.id) &&
      req.category === target.category &&
      (this.areCodesSimilar(target.code, req.code) ||
       this.calculateTextSimilarity(target.description, req.description) > this.PARTIAL_SIMILARITY_THRESHOLD)
    );
  }

  /**
   * Extract unique insights from additional guidance content
   */
  private extractUniqueInsights(baseContent: string, otherGuidances: GuidanceSection[]): string[] {
    const insights: string[] = [];
    const baseWords = new Set(this.normalizeText(baseContent).split(/\s+/));

    otherGuidances.forEach(guidance => {
      const sentences = guidance.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      sentences.forEach(sentence => {
        const sentenceWords = new Set(this.normalizeText(sentence).split(/\s+/));
        const overlap = this.calculateSetOverlap(baseWords, sentenceWords);
        
        // If sentence has low overlap with base content, it might be unique
        if (overlap < 0.5 && sentence.trim().length > 30) {
          insights.push(`• ${sentence.trim()}`);
        }
      });
    });

    return insights.slice(0, 5); // Limit to top 5 unique insights
  }

  /**
   * Calculate text similarity using Jaccard similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.normalizeText(text1).split(/\s+/));
    const words2 = new Set(this.normalizeText(text2).split(/\s+/));
    
    return this.calculateSetOverlap(words1, words2);
  }

  /**
   * Calculate overlap between two sets (Jaccard index)
   */
  private calculateSetOverlap(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Check if two requirement codes are similar
   */
  private areCodesSimilar(code1: string, code2: string): boolean {
    // Extract numeric parts
    const num1 = code1.match(/(\d+)\.(\d+)/);
    const num2 = code2.match(/(\d+)\.(\d+)/);
    
    if (num1 && num2) {
      // Same major version (e.g., "4.1" and "4.2")
      return num1[1] === num2[1];
    }
    
    // Simple string similarity for non-numeric codes
    return code1.toLowerCase().includes(code2.toLowerCase()) || 
           code2.toLowerCase().includes(code1.toLowerCase());
  }

  /**
   * Extract unique elements from one text compared to another
   */
  private extractUniqueElements(sourceText: string, baseText: string): string {
    const sourceWords = this.normalizeText(sourceText).split(/\s+/);
    const baseWords = new Set(this.normalizeText(baseText).split(/\s+/));
    
    const uniqueWords = sourceWords.filter(word => !baseWords.has(word) && word.length > 3);
    
    // Try to form coherent phrases
    const uniquePhrases: string[] = [];
    let currentPhrase: string[] = [];
    
    for (let i = 0; i < uniqueWords.length; i++) {
      currentPhrase.push(uniqueWords[i]);
      
      if (currentPhrase.length >= 3 || i === uniqueWords.length - 1) {
        if (currentPhrase.length >= 2) {
          uniquePhrases.push(currentPhrase.join(' '));
        }
        currentPhrase = [];
      }
    }
    
    return uniquePhrases.join(', ');
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clean up text formatting
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .trim();
  }

  /**
   * Generate unique ID for deduplicated requirement
   */
  private generateDeduplicatedId(requirements: AggregatedRequirement[]): string {
    const codes = requirements.map(req => req.code).sort().join('_');
    const frameworks = [...new Set(requirements.flatMap(req => req.frameworks))].sort().join('_');
    return `dedup_${codes}_${frameworks}`;
  }

  /**
   * Generate group key for related requirements
   */
  private generateGroupKey(requirements: AggregatedRequirement[]): string {
    const category = requirements[0].category.replace(/\s+/g, '_').toLowerCase();
    const frameworks = [...new Set(requirements.flatMap(req => req.frameworks))].sort().join('_');
    return `group_${category}_${frameworks}`;
  }
}