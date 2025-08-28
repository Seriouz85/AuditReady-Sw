import { supabase } from '@/lib/supabase';
import { 
  FrameworkMappingResolver, 
  CategoryMapping, 
  FrameworkSelection 
} from './FrameworkMappingResolver';

export interface AggregatedRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  frameworks: string[];
  mappingStrength: ('exact' | 'strong' | 'partial' | 'related')[];
  priority: number;
  category: string;
  igLevel?: string;
}

export interface MergedRequirement {
  id: string;
  unifiedText: string;
  sourceRequirements: {
    id: string;
    code: string;
    framework: string;
    original: string;
  }[];
  frameworks: string[];
  priority: number;
  category: string;
}

/**
 * Service responsible for aggregating requirements from multiple frameworks,
 * merging related requirements, and prioritizing them based on relevance
 */
export class RequirementAggregator {
  
  private frameworkResolver: FrameworkMappingResolver;
  
  constructor() {
    this.frameworkResolver = new FrameworkMappingResolver();
  }

  /**
   * Aggregate requirements for a category from selected frameworks
   */
  async aggregateRequirements(
    frameworks: FrameworkSelection,
    category: string
  ): Promise<AggregatedRequirement[]> {
    try {
      // Get mappings from FrameworkMappingResolver
      const mappings = await this.frameworkResolver.resolveMappings(category, frameworks);
      
      if (!mappings.length) {
        return [];
      }

      // Transform mappings to aggregated requirements
      const aggregated: AggregatedRequirement[] = mappings.map(mapping => ({
        id: mapping.requirement.id,
        code: mapping.requirement.code,
        title: mapping.requirement.title,
        description: mapping.requirement.description,
        frameworks: [mapping.framework.code],
        mappingStrength: [mapping.mappingStrength],
        priority: this.calculatePriority(mapping),
        category: mapping.categoryName,
        igLevel: mapping.requirement.igLevel
      }));

      // Group by similar requirements and merge duplicates
      const grouped = this.groupSimilarRequirements(aggregated);
      
      // Sort by priority
      return grouped.sort((a, b) => b.priority - a.priority);
      
    } catch (error) {
      console.error('Error aggregating requirements:', error);
      return [];
    }
  }

  /**
   * Merge related requirements from different frameworks
   */
  mergeRelatedRequirements(requirements: AggregatedRequirement[]): MergedRequirement[] {
    const merged: MergedRequirement[] = [];
    const processed = new Set<string>();

    for (const requirement of requirements) {
      if (processed.has(requirement.id)) continue;

      // Find related requirements
      const related = requirements.filter(req => 
        req.id !== requirement.id && 
        !processed.has(req.id) &&
        this.areRequirementsRelated(requirement, req)
      );

      // Create merged requirement
      const mergedRequirement: MergedRequirement = {
        id: this.generateMergedId([requirement, ...related]),
        unifiedText: this.createUnifiedText([requirement, ...related]),
        sourceRequirements: [requirement, ...related].map(req => ({
          id: req.id,
          code: req.code,
          framework: req.frameworks.join(', '),
          original: req.description
        })),
        frameworks: [...new Set([requirement, ...related].flatMap(req => req.frameworks))],
        priority: Math.max(requirement.priority, ...related.map(r => r.priority)),
        category: requirement.category
      };

      merged.push(mergedRequirement);

      // Mark as processed
      processed.add(requirement.id);
      related.forEach(req => processed.add(req.id));
    }

    return merged;
  }

  /**
   * Prioritize requirements based on framework selection and mapping strength
   */
  prioritizeRequirements(requirements: AggregatedRequirement[]): AggregatedRequirement[] {
    return requirements
      .map(req => ({
        ...req,
        priority: this.calculateEnhancedPriority(req)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get requirements aggregated by category for all selected frameworks
   */
  async getAggregatedByCategory(
    frameworks: FrameworkSelection
  ): Promise<Map<string, AggregatedRequirement[]>> {
    try {
      const categoryMappings = await this.frameworkResolver.getAllCategoryMappings(frameworks);
      const result = new Map<string, AggregatedRequirement[]>();

      for (const [categoryName, mappings] of categoryMappings) {
        const aggregated: AggregatedRequirement[] = mappings.map(mapping => ({
          id: mapping.requirement.id,
          code: mapping.requirement.code,
          title: mapping.requirement.title,
          description: mapping.requirement.description,
          frameworks: [mapping.framework.code],
          mappingStrength: [mapping.mappingStrength],
          priority: this.calculatePriority(mapping),
          category: mapping.categoryName,
          igLevel: mapping.requirement.igLevel
        }));

        const grouped = this.groupSimilarRequirements(aggregated);
        const prioritized = this.prioritizeRequirements(grouped);
        
        result.set(categoryName, prioritized);
      }

      return result;
      
    } catch (error) {
      console.error('Error getting aggregated requirements by category:', error);
      return new Map();
    }
  }

  /**
   * Filter requirements by IG level for CIS Controls
   */
  filterByIGLevel(
    requirements: AggregatedRequirement[],
    igLevel: 'ig1' | 'ig2' | 'ig3'
  ): AggregatedRequirement[] {
    return requirements.filter(req => {
      // Only filter CIS requirements
      if (!req.frameworks.includes('CIS')) return true;
      
      if (!req.igLevel) return true;

      const reqLevel = req.igLevel.toUpperCase();
      const selectedLevel = igLevel.toUpperCase();

      switch (selectedLevel) {
        case 'IG1':
          return reqLevel === 'IG1';
        case 'IG2':
          return reqLevel === 'IG1' || reqLevel === 'IG2';
        case 'IG3':
          return true;
        default:
          return true;
      }
    });
  }

  /**
   * Get statistics about aggregated requirements
   */
  getAggregationStatistics(requirements: AggregatedRequirement[]): {
    total: number;
    byFramework: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: requirements.length,
      byFramework: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    requirements.forEach(req => {
      // Count by framework
      req.frameworks.forEach(framework => {
        stats.byFramework[framework] = (stats.byFramework[framework] || 0) + 1;
      });

      // Count by priority level
      const priorityLevel = req.priority >= 80 ? 'high' : 
                           req.priority >= 60 ? 'medium' : 'low';
      stats.byPriority[priorityLevel] = (stats.byPriority[priorityLevel] || 0) + 1;

      // Count by category
      stats.byCategory[req.category] = (stats.byCategory[req.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Calculate priority score for a mapping
   */
  private calculatePriority(mapping: CategoryMapping): number {
    let priority = 50; // Base priority

    // Adjust by mapping strength
    switch (mapping.mappingStrength) {
      case 'exact':
        priority += 40;
        break;
      case 'strong':
        priority += 30;
        break;
      case 'partial':
        priority += 20;
        break;
      case 'related':
        priority += 10;
        break;
    }

    // Boost priority for certain frameworks
    switch (mapping.framework.code) {
      case 'ISO27001':
        priority += 15;
        break;
      case 'GDPR':
        priority += 10;
        break;
      case 'NIS2':
        priority += 10;
        break;
      case 'CIS':
        priority += 5;
        break;
    }

    // Boost priority for IG1 requirements (foundational)
    if (mapping.requirement.igLevel === 'IG1') {
      priority += 15;
    }

    return Math.min(priority, 100); // Cap at 100
  }

  /**
   * Calculate enhanced priority considering cross-framework relevance
   */
  private calculateEnhancedPriority(requirement: AggregatedRequirement): number {
    let priority = requirement.priority;

    // Boost requirements that appear in multiple frameworks
    if (requirement.frameworks.length > 1) {
      priority += requirement.frameworks.length * 10;
    }

    // Boost requirements with strong mappings
    const strongMappings = requirement.mappingStrength.filter(s => s === 'exact' || s === 'strong');
    if (strongMappings.length > 0) {
      priority += strongMappings.length * 5;
    }

    return Math.min(priority, 100);
  }

  /**
   * Group similar requirements together
   */
  private groupSimilarRequirements(requirements: AggregatedRequirement[]): AggregatedRequirement[] {
    const grouped: AggregatedRequirement[] = [];
    const processed = new Set<string>();

    for (const requirement of requirements) {
      if (processed.has(requirement.id)) continue;

      // Find similar requirements
      const similar = requirements.filter(req => 
        req.id !== requirement.id && 
        !processed.has(req.id) &&
        this.calculateSimilarity(requirement.description, req.description) > 0.8
      );

      if (similar.length > 0) {
        // Merge similar requirements
        const merged: AggregatedRequirement = {
          ...requirement,
          frameworks: [...new Set([requirement, ...similar].flatMap(req => req.frameworks))],
          mappingStrength: [...new Set([requirement, ...similar].flatMap(req => req.mappingStrength))],
          priority: Math.max(requirement.priority, ...similar.map(r => r.priority)),
          description: this.mergeSimilarDescriptions([requirement, ...similar])
        };

        grouped.push(merged);
        similar.forEach(req => processed.add(req.id));
      } else {
        grouped.push(requirement);
      }

      processed.add(requirement.id);
    }

    return grouped;
  }

  /**
   * Check if two requirements are related
   */
  private areRequirementsRelated(req1: AggregatedRequirement, req2: AggregatedRequirement): boolean {
    // Same category
    if (req1.category !== req2.category) return false;

    // Similar codes (e.g., "4.1" and "4.2")
    const code1Parts = req1.code.split('.');
    const code2Parts = req2.code.split('.');
    
    if (code1Parts.length > 1 && code2Parts.length > 1) {
      if (code1Parts[0] === code2Parts[0]) {
        return true;
      }
    }

    // Similar content
    const similarity = this.calculateSimilarity(req1.description, req2.description);
    return similarity > 0.6;
  }

  /**
   * Calculate text similarity using simple token overlap
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
    const tokens2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  /**
   * Create unified text from multiple requirements
   */
  private createUnifiedText(requirements: AggregatedRequirement[]): string {
    if (requirements.length === 1) {
      return requirements[0].description;
    }

    // Find common elements
    const commonWords = this.findCommonWords(requirements.map(r => r.description));
    const uniqueElements = requirements.map(r => this.extractUniqueElements(r.description, commonWords));

    // Build unified text
    let unified = commonWords.join(' ');
    
    const uniqueParts = uniqueElements.filter(part => part.trim()).join('. ');
    if (uniqueParts) {
      unified += '. ' + uniqueParts;
    }

    return unified.trim();
  }

  /**
   * Merge descriptions from similar requirements
   */
  private mergeSimilarDescriptions(requirements: AggregatedRequirement[]): string {
    if (requirements.length === 1) {
      return requirements[0].description;
    }

    // Take the longest description as base
    const base = requirements.reduce((prev, current) => 
      current.description.length > prev.description.length ? current : prev
    );

    return base.description;
  }

  /**
   * Find common words across multiple texts
   */
  private findCommonWords(texts: string[]): string[] {
    if (texts.length === 0) return [];
    
    const wordCounts = new Map<string, number>();
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    // Return words that appear in all texts
    const commonWords: string[] = [];
    for (const [word, count] of wordCounts) {
      if (count === texts.length && word.length > 3) {
        commonWords.push(word);
      }
    }

    return commonWords;
  }

  /**
   * Extract unique elements from text
   */
  private extractUniqueElements(text: string, commonWords: string[]): string {
    const words = text.split(/\s+/);
    const uniqueWords = words.filter(word => 
      !commonWords.includes(word.toLowerCase()) && word.length > 3
    );
    
    return uniqueWords.join(' ');
  }

  /**
   * Generate merged ID from multiple requirements
   */
  private generateMergedId(requirements: AggregatedRequirement[]): string {
    const codes = requirements.map(r => r.code).sort().join('_');
    const frameworks = [...new Set(requirements.flatMap(r => r.frameworks))].sort().join('_');
    return `merged_${codes}_${frameworks}`;
  }
}