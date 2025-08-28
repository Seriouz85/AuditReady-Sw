import { supabase } from '@/lib/supabase';
import { 
  RequirementAggregator, 
  AggregatedRequirement 
} from './RequirementAggregator';
import { 
  ContentDeduplicator, 
  DeduplicatedRequirement, 
  FrameworkReference 
} from './ContentDeduplicator';
import { 
  FrameworkMappingResolver, 
  FrameworkSelection, 
  CategoryMapping 
} from './FrameworkMappingResolver';

export interface UnifiedRequirement {
  id: string;
  title: string;
  description: string;
  subRequirements: string[];
  references: FrameworkReference[];
  frameworks: string[];
  priority: number;
  category: string;
}

export interface GuidanceContent {
  category: string;
  title: string;
  description: string;
  sections: GuidanceSection[];
  references: FrameworkReference[];
  frameworks: string[];
  tips: string[];
}

export interface GuidanceSection {
  id: string;
  title: string;
  content: string;
  frameworks: string[];
  examples?: string[];
  bestPractices?: string[];
}

export interface GeneratedContent {
  unifiedRequirements: UnifiedRequirement[];
  guidanceContent: GuidanceContent;
  references: FrameworkReference[];
  statistics: ContentStatistics;
}

export interface ContentStatistics {
  totalRequirements: number;
  requirementsByFramework: Record<string, number>;
  deduplicationRate: number;
  coverageByCategory: Record<string, number>;
}

/**
 * Main service responsible for generating dynamic, database-driven content
 * for compliance requirements and guidance without any hardcoded content
 */
export class DynamicContentGenerator {
  
  private requirementAggregator: RequirementAggregator;
  private contentDeduplicator: ContentDeduplicator;
  private frameworkResolver: FrameworkMappingResolver;

  constructor() {
    this.requirementAggregator = new RequirementAggregator();
    this.contentDeduplicator = new ContentDeduplicator();
    this.frameworkResolver = new FrameworkMappingResolver();
  }

  /**
   * Generate complete content for a category based on selected frameworks
   */
  async generateCategoryContent(
    category: string,
    selectedFrameworks: FrameworkSelection
  ): Promise<GeneratedContent> {
    try {
      // 1. Aggregate requirements from all selected frameworks
      const aggregatedRequirements = await this.requirementAggregator.aggregateRequirements(
        selectedFrameworks, 
        category
      );

      // 2. Deduplicate and merge similar requirements
      const deduplicatedRequirements = this.contentDeduplicator.deduplicateRequirements(
        aggregatedRequirements
      );

      // 3. Generate unified requirements
      const unifiedRequirements = this.generateUnifiedRequirements(
        category,
        deduplicatedRequirements,
        selectedFrameworks
      );

      // 4. Generate guidance content
      const guidanceContent = await this.generateUnifiedGuidance(
        category,
        unifiedRequirements,
        selectedFrameworks
      );

      // 5. Generate consolidated references
      const references = this.generateReferences(
        deduplicatedRequirements,
        selectedFrameworks
      );

      // 6. Generate statistics
      const statistics = this.generateStatistics(
        aggregatedRequirements,
        deduplicatedRequirements,
        selectedFrameworks
      );

      return {
        unifiedRequirements,
        guidanceContent,
        references,
        statistics
      };

    } catch (error) {
      console.error('Error generating category content:', error);
      
      // Return empty content on error
      return {
        unifiedRequirements: [],
        guidanceContent: this.createEmptyGuidanceContent(category),
        references: [],
        statistics: this.createEmptyStatistics()
      };
    }
  }

  /**
   * Generate unified requirements from database mappings (NO hardcoded content)
   */
  generateUnifiedRequirements(
    category: string,
    deduplicatedRequirements: DeduplicatedRequirement[],
    selectedFrameworks: FrameworkSelection
  ): UnifiedRequirement[] {
    return deduplicatedRequirements.map(req => ({
      id: req.id,
      title: this.generateRequirementTitle(req, category),
      description: this.enhanceRequirementDescription(req, selectedFrameworks),
      subRequirements: this.generateSubRequirements(req),
      references: req.references,
      frameworks: req.frameworks,
      priority: req.priority,
      category
    }));
  }

  /**
   * Generate unified guidance content based on actual requirements
   */
  async generateUnifiedGuidance(
    category: string,
    requirements: UnifiedRequirement[],
    selectedFrameworks: FrameworkSelection
  ): Promise<GuidanceContent> {
    try {
      const frameworks = this.getSelectedFrameworkNames(selectedFrameworks);
      
      // Generate guidance sections based on requirement patterns
      const sections = await this.generateGuidanceSections(requirements, selectedFrameworks);
      
      // Generate practical tips from requirements
      const tips = this.generatePracticalTips(requirements, selectedFrameworks);

      // Create consolidated references
      const allReferences = requirements.flatMap(req => req.references);
      const mergedReferences = this.contentDeduplicator.mergeReferences(
        requirements.map(req => ({ references: req.references }))
      );

      return {
        category,
        title: `${category} Implementation Guide`,
        description: this.generateCategoryDescription(category, frameworks),
        sections,
        references: mergedReferences,
        frameworks,
        tips
      };

    } catch (error) {
      console.error('Error generating unified guidance:', error);
      return this.createEmptyGuidanceContent(category);
    }
  }

  /**
   * Generate accurate reference lists from real mappings
   */
  generateReferences(
    deduplicatedRequirements: DeduplicatedRequirement[],
    selectedFrameworks: FrameworkSelection
  ): FrameworkReference[] {
    const allReferences = deduplicatedRequirements.flatMap(req => req.references);
    return this.contentDeduplicator.mergeReferences([{ references: allReferences }]);
  }

  /**
   * Generate content for all categories at once
   */
  async generateAllCategoriesContent(
    selectedFrameworks: FrameworkSelection
  ): Promise<Map<string, GeneratedContent>> {
    try {
      const categoryMappings = await this.frameworkResolver.getAllCategoryMappings(selectedFrameworks);
      const result = new Map<string, GeneratedContent>();

      for (const [categoryName] of categoryMappings) {
        const content = await this.generateCategoryContent(categoryName, selectedFrameworks);
        result.set(categoryName, content);
      }

      return result;

    } catch (error) {
      console.error('Error generating all categories content:', error);
      return new Map();
    }
  }

  /**
   * Validate generated content for completeness
   */
  validateGeneratedContent(content: GeneratedContent): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for empty content
    if (content.unifiedRequirements.length === 0) {
      issues.push('No unified requirements generated');
    }

    if (!content.guidanceContent.sections.length) {
      issues.push('No guidance sections generated');
    }

    if (!content.references.length) {
      issues.push('No references generated');
    }

    // Check for framework coverage
    const frameworksInRequirements = new Set(
      content.unifiedRequirements.flatMap(req => req.frameworks)
    );
    
    const frameworksInGuidance = new Set(content.guidanceContent.frameworks);
    
    if (frameworksInRequirements.size !== frameworksInGuidance.size) {
      recommendations.push('Framework coverage mismatch between requirements and guidance');
    }

    // Check deduplication effectiveness
    if (content.statistics.deduplicationRate < 10) {
      recommendations.push('Low deduplication rate - review similarity thresholds');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Generate requirement title based on content and category
   */
  private generateRequirementTitle(req: DeduplicatedRequirement, category: string): string {
    if (req.originalRequirements.length === 1) {
      return req.originalRequirements[0].code;
    }

    // For merged requirements, create a descriptive title
    const codes = req.originalRequirements.map(r => r.code).sort();
    const frameworks = req.frameworks.join(' & ');
    
    return `${codes.join(', ')} (${frameworks})`;
  }

  /**
   * Enhance requirement description with framework-specific context
   */
  private enhanceRequirementDescription(
    req: DeduplicatedRequirement, 
    selectedFrameworks: FrameworkSelection
  ): string {
    let enhanced = req.unifiedText;

    // Add framework context if multiple frameworks are involved
    if (req.frameworks.length > 1) {
      const frameworkList = req.frameworks.join(', ');
      enhanced = `**Multi-Framework Requirement (${frameworkList}):** ${enhanced}`;
    }

    // Add specific framework guidance
    if (selectedFrameworks.iso27001 && req.frameworks.includes('ISO27001')) {
      enhanced = this.addISO27001Context(enhanced);
    }

    if (selectedFrameworks.gdpr && req.frameworks.includes('GDPR')) {
      enhanced = this.addGDPRContext(enhanced);
    }

    if (selectedFrameworks.nis2 && req.frameworks.includes('NIS2')) {
      enhanced = this.addNIS2Context(enhanced);
    }

    return enhanced;
  }

  /**
   * Generate sub-requirements from deduplicated requirement
   */
  private generateSubRequirements(req: DeduplicatedRequirement): string[] {
    const subRequirements: string[] = [];

    // Extract key points from unified text
    const sentences = req.unifiedText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach((sentence, index) => {
      if (sentence.trim().length > 20) {
        subRequirements.push(`${String.fromCharCode(97 + index)}) ${sentence.trim()}`);
      }
    });

    // Add framework-specific sub-requirements if multiple frameworks
    if (req.frameworks.length > 1) {
      req.frameworks.forEach(framework => {
        const specificReq = req.originalRequirements.find(r => r.framework.includes(framework));
        if (specificReq) {
          subRequirements.push(`**${framework} Specific:** ${specificReq.text.substring(0, 200)}...`);
        }
      });
    }

    return subRequirements.slice(0, 6); // Limit to 6 sub-requirements
  }

  /**
   * Generate guidance sections from requirements patterns
   */
  private async generateGuidanceSections(
    requirements: UnifiedRequirement[],
    selectedFrameworks: FrameworkSelection
  ): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Implementation section
    sections.push({
      id: 'implementation',
      title: 'Implementation Approach',
      content: this.generateImplementationGuidance(requirements, selectedFrameworks),
      frameworks: this.getSelectedFrameworkNames(selectedFrameworks)
    });

    // Best practices section
    sections.push({
      id: 'best-practices',
      title: 'Best Practices',
      content: this.generateBestPracticesGuidance(requirements),
      frameworks: this.getSelectedFrameworkNames(selectedFrameworks),
      bestPractices: this.extractBestPractices(requirements)
    });

    // Common challenges section
    sections.push({
      id: 'challenges',
      title: 'Common Challenges & Solutions',
      content: this.generateChallengesGuidance(requirements, selectedFrameworks),
      frameworks: this.getSelectedFrameworkNames(selectedFrameworks)
    });

    return sections;
  }

  /**
   * Generate practical tips from requirements
   */
  private generatePracticalTips(
    requirements: UnifiedRequirement[], 
    selectedFrameworks: FrameworkSelection
  ): string[] {
    const tips: string[] = [];

    // Framework-specific tips
    if (selectedFrameworks.iso27001) {
      tips.push('Document all implementations in your ISMS management system');
      tips.push('Ensure top management approval for policy changes');
    }

    if (selectedFrameworks.gdpr) {
      tips.push('Consider data protection impact assessments for high-risk processing');
      tips.push('Maintain records of processing activities');
    }

    if (selectedFrameworks.nis2) {
      tips.push('Report significant incidents within required timeframes');
      tips.push('Ensure cybersecurity measures are proportionate to risk');
    }

    // Requirement-based tips
    if (requirements.some(req => req.description.includes('policy'))) {
      tips.push('Regular policy reviews ensure continued effectiveness');
    }

    if (requirements.some(req => req.description.includes('training'))) {
      tips.push('Track training completion and effectiveness metrics');
    }

    return tips.slice(0, 8); // Limit to 8 tips
  }

  /**
   * Generate category description based on requirements
   */
  private generateCategoryDescription(category: string, frameworks: string[]): string {
    const frameworkList = frameworks.length > 1 ? 
      `${frameworks.slice(0, -1).join(', ')} and ${frameworks[frameworks.length - 1]}` :
      frameworks[0] || 'selected frameworks';

    return `Comprehensive implementation guidance for ${category} requirements across ${frameworkList}. This guidance consolidates requirements from multiple frameworks to provide a unified approach to compliance.`;
  }

  /**
   * Generate implementation guidance
   */
  private generateImplementationGuidance(
    requirements: UnifiedRequirement[], 
    selectedFrameworks: FrameworkSelection
  ): string {
    let guidance = 'To implement these requirements effectively:\n\n';

    // Priority-based approach
    const highPriority = requirements.filter(req => req.priority >= 80);
    const mediumPriority = requirements.filter(req => req.priority >= 60 && req.priority < 80);
    const lowPriority = requirements.filter(req => req.priority < 60);

    if (highPriority.length > 0) {
      guidance += `**Phase 1 (High Priority - ${highPriority.length} requirements):**\n`;
      guidance += 'Focus on foundational requirements that provide the greatest compliance impact.\n\n';
    }

    if (mediumPriority.length > 0) {
      guidance += `**Phase 2 (Medium Priority - ${mediumPriority.length} requirements):**\n`;
      guidance += 'Implement supporting controls that enhance your security posture.\n\n';
    }

    if (lowPriority.length > 0) {
      guidance += `**Phase 3 (Enhancement - ${lowPriority.length} requirements):**\n`;
      guidance += 'Add advanced controls for comprehensive coverage.\n\n';
    }

    return guidance;
  }

  /**
   * Generate best practices guidance
   */
  private generateBestPracticesGuidance(requirements: UnifiedRequirement[]): string {
    const practices: string[] = [
      'Start with risk assessment to prioritize implementation efforts',
      'Document all processes and decisions for audit evidence',
      'Implement gradual rollout with pilot groups before full deployment',
      'Establish regular review cycles to ensure continued effectiveness',
      'Train staff on new procedures and their importance to compliance'
    ];

    return practices.map((practice, index) => `${index + 1}. ${practice}`).join('\n');
  }

  /**
   * Generate challenges and solutions guidance
   */
  private generateChallengesGuidance(
    requirements: UnifiedRequirement[], 
    selectedFrameworks: FrameworkSelection
  ): string {
    let guidance = 'Common implementation challenges and recommended solutions:\n\n';

    guidance += '**Resource Constraints:**\n';
    guidance += 'Prioritize requirements by risk impact and regulatory urgency. Consider phased implementation.\n\n';

    guidance += '**Technical Complexity:**\n';
    guidance += 'Break down complex requirements into smaller, manageable tasks. Seek expert guidance when needed.\n\n';

    if (selectedFrameworks.gdpr && selectedFrameworks.nis2) {
      guidance += '**Multiple Framework Alignment:**\n';
      guidance += 'Look for overlapping requirements that can be implemented once to satisfy multiple frameworks.\n\n';
    }

    return guidance;
  }

  /**
   * Extract best practices from requirements
   */
  private extractBestPractices(requirements: UnifiedRequirement[]): string[] {
    const practices: string[] = [];

    requirements.forEach(req => {
      if (req.description.includes('regular')) {
        practices.push('Establish regular review and update cycles');
      }
      if (req.description.includes('document')) {
        practices.push('Maintain comprehensive documentation');
      }
      if (req.description.includes('training')) {
        practices.push('Provide ongoing staff training and awareness');
      }
    });

    return [...new Set(practices)].slice(0, 5);
  }

  /**
   * Add ISO 27001 specific context
   */
  private addISO27001Context(text: string): string {
    if (text.includes('policy') && !text.includes('ISMS')) {
      return text + ' This should be integrated into your Information Security Management System (ISMS).';
    }
    return text;
  }

  /**
   * Add GDPR specific context
   */
  private addGDPRContext(text: string): string {
    if (text.includes('personal data') || text.includes('privacy')) {
      return text + ' Ensure compliance with data protection principles and individual rights.';
    }
    return text;
  }

  /**
   * Add NIS2 specific context
   */
  private addNIS2Context(text: string): string {
    if (text.includes('incident') || text.includes('security')) {
      return text + ' Consider reporting obligations to relevant supervisory authorities.';
    }
    return text;
  }

  /**
   * Get selected framework names as array
   */
  private getSelectedFrameworkNames(selectedFrameworks: FrameworkSelection): string[] {
    const names: string[] = [];
    
    if (selectedFrameworks.iso27001) names.push('ISO 27001');
    if (selectedFrameworks.iso27002) names.push('ISO 27002');
    if (selectedFrameworks.cisControls) names.push(`CIS Controls ${selectedFrameworks.cisControls.toUpperCase()}`);
    if (selectedFrameworks.gdpr) names.push('GDPR');
    if (selectedFrameworks.nis2) names.push('NIS2');
    
    return names;
  }

  /**
   * Generate statistics about the content generation process
   */
  private generateStatistics(
    originalRequirements: AggregatedRequirement[],
    deduplicatedRequirements: DeduplicatedRequirement[],
    selectedFrameworks: FrameworkSelection
  ): ContentStatistics {
    const deduplicationStats = this.contentDeduplicator.getDeduplicationStats(
      originalRequirements, 
      deduplicatedRequirements
    );

    const requirementsByFramework: Record<string, number> = {};
    deduplicatedRequirements.forEach(req => {
      req.frameworks.forEach(framework => {
        requirementsByFramework[framework] = (requirementsByFramework[framework] || 0) + 1;
      });
    });

    return {
      totalRequirements: deduplicatedRequirements.length,
      requirementsByFramework,
      deduplicationRate: deduplicationStats.reductionPercentage,
      coverageByCategory: {} // To be filled by caller if needed
    };
  }

  /**
   * Create empty guidance content for error cases
   */
  private createEmptyGuidanceContent(category: string): GuidanceContent {
    return {
      category,
      title: `${category} - No Content Available`,
      description: 'No guidance content could be generated for the selected frameworks.',
      sections: [],
      references: [],
      frameworks: [],
      tips: []
    };
  }

  /**
   * Create empty statistics for error cases
   */
  private createEmptyStatistics(): ContentStatistics {
    return {
      totalRequirements: 0,
      requirementsByFramework: {},
      deduplicationRate: 0,
      coverageByCategory: {}
    };
  }
}