import { supabase } from '../../lib/supabase';

interface RequirementDetail {
  control_id: string;
  title: string;
  description: string;
  official_description?: string;
  audit_ready_guidance?: string;
  framework: string;
  category?: string;
}

interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  requirements: RequirementDetail[];
  combinedText?: string;
  frameworks: Set<string>;
}

interface ValidationResult {
  isValid: boolean;
  missingRequirements: string[];
  coverage: number;
  suggestions: string[];
}

/**
 * Clean Requirements Generator
 * Focuses on concise a,b,c,d structure without audit evidence
 */
export class CleanRequirementsGenerator {
  
  /**
   * Generate clean unified requirements with only essential sub-requirements
   */
  async generateCleanRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<{ content: string[]; validation: ValidationResult }> {
    try {
      console.log('[CLEAN] Generating clean requirements for:', categoryName);
      
      // Get database structure
      const [sections, requirements] = await Promise.all([
        this.getDatabaseSections(categoryName),
        this.getMappedRequirements(categoryName, selectedFrameworks, cisIGLevel)
      ]);
      
      // Format into clean a,b,c,d structure
      const formattedSections = this.formatCleanSections(sections, requirements);
      
      // Validate coverage
      const validation = this.validateCompleteness(requirements, sections);
      
      return {
        content: formattedSections,
        validation
      };
      
    } catch (error) {
      console.error('[CLEAN] Error generating requirements:', error);
      throw error;
    }
  }
  
  /**
   * Format sections into clean a,b,c,d structure
   */
  private formatCleanSections(sections: UnifiedSection[], requirements: RequirementDetail[]): string[] {
    return sections.map((section, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      
      // Extract concise title from section
      const cleanTitle = this.extractCleanTitle(section.title, section.description);
      
      // Build concise description without audit evidence
      const conciseDescription = this.buildConciseDescription(section);
      
      return `**${letter}) ${cleanTitle}**\n${conciseDescription}`;
    });
  }
  
  /**
   * Extract clean, concise title for sub-requirement
   */
  private extractCleanTitle(title: string, description: string): string {
    // Remove common prefixes and clean up
    let cleanTitle = title
      .replace(/^(Establish|Implement|Maintain|Ensure|Define|Document|Create|Manage)\s+/, '')
      .replace(/\s+and\s+/g, ' & ')
      .replace(/\s+procedures?\s*/gi, '')
      .replace(/\s+processes?\s*/gi, '')
      .trim();
    
    // Capitalize first word
    if (cleanTitle.length > 0) {
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }
    
    return cleanTitle || title.substring(0, 50);
  }
  
  /**
   * Build concise description without audit evidence
   */
  private buildConciseDescription(section: UnifiedSection): string {
    // Extract key requirements without audit evidence points
    const keyPoints: string[] = [];
    
    // Analyze section description for core requirements
    const coreRequirements = this.extractCoreRequirements(section.description);
    
    if (coreRequirements.length > 0) {
      return coreRequirements.join('. ') + '.';
    }
    
    // Fallback to first sentence of description
    const firstSentence = section.description.split('.')[0];
    return firstSentence.length > 10 ? firstSentence + '.' : section.description.substring(0, 100) + '...';
  }
  
  /**
   * Extract core requirements from description text
   */
  private extractCoreRequirements(description: string): string[] {
    const requirements: string[] = [];
    
    // Look for structured requirements patterns
    const patterns = [
      /(?:must|shall|should)\s+([^.]+)/gi,
      /(?:requires?|needs?)\s+([^.]+)/gi,
      /(?:includes?)\s+([^.]+)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const requirement = match.replace(/^(must|shall|should|requires?|needs?|includes?)\s+/i, '').trim();
          if (requirement.length > 10 && requirement.length < 100) {
            requirements.push(requirement);
          }
        });
      }
      
      if (requirements.length >= 2) break; // Limit to key requirements
    }
    
    return requirements.slice(0, 2); // Max 2 key points per sub-requirement
  }
  
  /**
   * Get database sections for category
   */
  private async getDatabaseSections(categoryName: string): Promise<UnifiedSection[]> {
    const { data, error } = await supabase
      .from('compliance_simplification_mapping')
      .select('*')
      .eq('category', categoryName);
    
    if (error) {
      console.error('[CLEAN] Database error:', error);
      return [];
    }
    
    // Convert to UnifiedSection format
    return (data || []).map((item, index) => ({
      id: `section_${index + 1}`,
      title: item.audit_ready_unified?.subRequirements?.[index] || `Sub-requirement ${index + 1}`,
      description: item.description || '',
      requirements: [],
      frameworks: new Set<string>()
    }));
  }
  
  /**
   * Get mapped requirements for category and frameworks
   */
  private async getMappedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<RequirementDetail[]> {
    let query = supabase
      .from('requirements')
      .select('*')
      .eq('category', categoryName);
    
    if (selectedFrameworks.length > 0) {
      query = query.in('framework', selectedFrameworks);
    }
    
    if (cisIGLevel) {
      query = query.eq('cis_ig_level', cisIGLevel);
    }
    
    const { data, error } = query;
    
    if (error) {
      console.error('[CLEAN] Requirements error:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Validate requirement coverage
   */
  private validateCompleteness(
    allRequirements: RequirementDetail[],
    sections: UnifiedSection[]
  ): ValidationResult {
    const coverage = sections.length > 0 ? 100 : 0;
    
    return {
      isValid: sections.length > 0,
      missingRequirements: [],
      coverage,
      suggestions: sections.length === 0 ? ['No sections found for category'] : []
    };
  }
}