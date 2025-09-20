/**
 * Unified Requirements Generator
 * 
 * Generates professional unified requirements using templates and framework injection.
 * Implements smart overlap detection and requirement deduplication.
 */

import { UnifiedRequirementsTemplateManager, FrameworkRequirement } from './templates/UnifiedRequirementsTemplateManager';

export interface GeneratedUnifiedRequirement {
  category: string;
  title: string;
  description: string;
  content: string;
  subRequirements: string[];
  frameworksCovered: string[];
  totalRequirementsProcessed: number;
}

export class UnifiedRequirementsGenerator {
  
  /**
   * Generate unified requirements for selected categories and frameworks
   */
  static async generateForCategory(
    categoryName: string,
    frameworkRequirements: FrameworkRequirement[]
  ): Promise<GeneratedUnifiedRequirement | null> {
    
    // Get base template
    const template = UnifiedRequirementsTemplateManager.getTemplate(categoryName);
    if (!template) {
      console.warn(`No template found for category: ${categoryName}`);
      return null;
    }
    
    // Inject framework requirements into template
    const injectedTemplate = UnifiedRequirementsTemplateManager.injectRequirements(
      template,
      frameworkRequirements
    );
    
    // Format final unified requirements
    const formattedContent = this.formatUnifiedRequirements(injectedTemplate);
    
    // Extract frameworks covered
    const frameworksCovered = Array.from(new Set(
      frameworkRequirements.map(req => req.framework)
    ));
    
    return {
      category: categoryName,
      title: injectedTemplate.title,
      description: injectedTemplate.description,
      content: formattedContent,
      subRequirements: injectedTemplate.subRequirements.map(sub => 
        `${sub.letter}) ${sub.title}`
      ),
      frameworksCovered,
      totalRequirementsProcessed: frameworkRequirements.length
    };
  }
  
  /**
   * Format unified requirements with professional structure
   */
  private static formatUnifiedRequirements(template: any): string {
    let content = `# ${template.title}\n\n`;
    content += `${template.description}\n\n`;
    
    template.subRequirements.forEach((subReq: any) => {
      content += UnifiedRequirementsTemplateManager.formatUnifiedRequirement(
        subReq,
        subReq.requirements?.join(' ') || '',
        subReq.references || []
      );
    });
    
    return content;
  }
  
  /**
   * Generate unified requirements for multiple categories
   */
  static async generateForCategories(
    categories: string[],
    frameworkRequirementsByCategory: Record<string, FrameworkRequirement[]>
  ): Promise<GeneratedUnifiedRequirement[]> {
    
    const results: GeneratedUnifiedRequirement[] = [];
    
    for (const category of categories) {
      const requirements = frameworkRequirementsByCategory[category] || [];
      const generated = await this.generateForCategory(category, requirements);
      
      if (generated) {
        results.push(generated);
      }
    }
    
    return results;
  }
  
  /**
   * Get summary statistics for generated requirements
   */
  static getGenerationSummary(generated: GeneratedUnifiedRequirement[]) {
    return {
      categoriesGenerated: generated.length,
      totalFrameworksCovered: Array.from(new Set(
        generated.flatMap(g => g.frameworksCovered)
      )).length,
      totalRequirementsProcessed: generated.reduce(
        (sum, g) => sum + g.totalRequirementsProcessed, 0
      ),
      averageRequirementsPerCategory: generated.length > 0 
        ? Math.round(generated.reduce((sum, g) => sum + g.totalRequirementsProcessed, 0) / generated.length)
        : 0
    };
  }
}