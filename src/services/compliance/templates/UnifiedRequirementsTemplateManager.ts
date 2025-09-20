/**
 * Unified Requirements Template Manager
 * 
 * Manages all 21 compliance category templates for professional unified requirements generation.
 * Each template provides base structure with sub-requirements (a, b, c...) for framework injection.
 * 
 * Architecture:
 * - Base templates with professional structure
 * - Framework requirement injection points  
 * - Overlap detection and deduplication
 * - Reference tracking and citation
 */

export interface UnifiedRequirementTemplate {
  category: string;
  title: string;
  description: string;
  subRequirements: {
    letter: string;
    title: string;
    description: string;
    injectionPoints: string[]; // Keywords for framework requirement injection
    requirements?: string[]; // Injected requirements from frameworks
    references?: string[]; // Framework references used
  }[];
}

export interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  category: string;
}

export interface InjectionResult {
  subRequirement: string;
  injectedContent: string;
  references: string[];
  deduplicatedCount: number;
}

// Import templates
import { GovernanceLeadershipTemplate } from './governance/GovernanceLeadershipTemplate';
import { AccessControlTemplate } from './security/AccessControlTemplate';
import { AssetManagementTemplate } from './asset/AssetManagementTemplate';
import { RiskManagementTemplate } from './risk/RiskManagementTemplate';
import { NetworkSecurityTemplate } from './network/NetworkSecurityTemplate';

// Import new intelligent mapping engine
import { IntelligentRequirementMapper, type MappingResult } from '../IntelligentRequirementMapper';

export class UnifiedRequirementsTemplateManager {
  
  private static templates: Record<string, UnifiedRequirementTemplate> = {
    'Governance & Leadership': GovernanceLeadershipTemplate,
    'Access Control & Identity Management': AccessControlTemplate,
    'Asset Management': AssetManagementTemplate,
    'Risk Management': RiskManagementTemplate,
    'Network Security Management': NetworkSecurityTemplate,
    // Additional templates can be added here for remaining categories
  };
  
  /**
   * Get template for a specific category
   */
  static getTemplate(categoryName: string): UnifiedRequirementTemplate | null {
    // Clean category name to match template keys
    const cleanName = categoryName
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/[^\w\s&-]/g, '') // Remove special chars except & and -
      .trim();
    
    return this.templates[cleanName] || null;
  }
  
  /**
   * Inject framework requirements into template using intelligent mapping
   */
  static injectRequirements(
    template: UnifiedRequirementTemplate,
    frameworkRequirements: FrameworkRequirement[]
  ): UnifiedRequirementTemplate {
    console.log(`[TEMPLATE INJECTION] Processing ${frameworkRequirements.length} requirements for ${template.category}`);
    
    const injectedTemplate = { ...template };
    const mappingResults = new Map<string, MappingResult[]>();
    
    // Phase 1: Use intelligent mapper to determine where each requirement should go
    frameworkRequirements.forEach(req => {
      const mapping = IntelligentRequirementMapper.mapRequirementToSubRequirement(req, template.category);
      
      if (!mappingResults.has(mapping.targetSubRequirement)) {
        mappingResults.set(mapping.targetSubRequirement, []);
      }
      mappingResults.get(mapping.targetSubRequirement)!.push(mapping);
    });
    
    // Phase 2: Apply mappings to sub-requirements
    injectedTemplate.subRequirements = template.subRequirements.map(subReq => {
      const mappings = mappingResults.get(subReq.letter) || [];
      
      if (mappings.length === 0) {
        console.log(`[TEMPLATE INJECTION] No mappings for ${subReq.letter}) ${subReq.title}`);
        return subReq;
      }
      
      console.log(`[TEMPLATE INJECTION] Injecting ${mappings.length} requirements into ${subReq.letter}) ${subReq.title}`);
      
      // Create unified requirements from mappings
      const requirements = this.createUnifiedRequirements(mappings);
      const references = mappings.flatMap(m => m.frameworkReferences);
      
      return {
        ...subReq,
        requirements,
        references
      };
    });
    
    console.log(`[TEMPLATE INJECTION] Successfully injected requirements into ${template.category}`);
    return injectedTemplate;
  }
  
  /**
   * Create unified requirements from intelligent mappings
   */
  private static createUnifiedRequirements(mappings: MappingResult[]): string[] {
    if (mappings.length === 0) return [];
    
    // Group mappings by overlap detection
    const overlapGroups = IntelligentRequirementMapper.detectOverlaps(
      mappings.map(m => ({ 
        id: m.frameworkReferences[0],
        code: m.frameworkReferences[0].split(' ').pop() || '',
        title: '',
        description: m.unifiedContent,
        framework: m.frameworkReferences[0].split(' ')[0] || '',
        category: ''
      }))
    );
    
    if (overlapGroups.length > 0) {
      // Use overlap detection results
      return overlapGroups.map(group => {
        let content = group.unifiedRequirement;
        if (group.preservedDetails.length > 0) {
          content += ` (${group.preservedDetails.join('; ')})`;
        }
        return content;
      });
    } else {
      // No overlaps - return individual unified requirements
      return mappings.map(mapping => {
        let content = mapping.unifiedContent;
        if (mapping.preservedDetails.length > 0) {
          content += ` (${mapping.preservedDetails.join('; ')})`;
        }
        return content;
      });
    }
  }
  
  
  /**
   * Format final unified requirement with references
   */
  static formatUnifiedRequirement(
    subRequirement: any,
    injectedContent: string,
    references: string[]
  ): string {
    let formatted = `${subRequirement.letter}) **${subRequirement.title}**\n\n`;
    formatted += `${subRequirement.description}\n\n`;
    
    if (injectedContent) {
      formatted += `*Implementation Details:* ${injectedContent}\n\n`;
    }
    
    if (references.length > 0) {
      formatted += `*Framework References:* ${references.join(', ')}\n\n`;
    }
    
    return formatted;
  }
  
  /**
   * Get all available template categories
   */
  static getAvailableCategories(): string[] {
    return Object.keys(this.templates);
  }
}