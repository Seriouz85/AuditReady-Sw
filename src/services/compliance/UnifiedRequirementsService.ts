/**
 * UnifiedRequirementsService - Extracts and manages unified requirements
 * This service provides the source of truth for unified requirements that 
 * will be used to generate unified guidance dynamically
 */

import { ProfessionalGuidanceService } from './ProfessionalGuidanceService';
import { CorrectedGovernanceService } from './CorrectedGovernanceService';

export interface UnifiedRequirement {
  letter: string;
  title: string;
  description: string;
  originalText: string;
}

export interface CategoryRequirements {
  category: string;
  requirements: UnifiedRequirement[];
}

export class UnifiedRequirementsService {
  /**
   * Extract unified requirements from mapping data
   * This is the EXACT logic from ComplianceSimplification.tsx
   */
  static extractUnifiedRequirements(mapping: any): CategoryRequirements {
    const category = mapping.category || '';
    
    // Get unified requirements with clean formatting
    let requirements = mapping.auditReadyUnified?.subRequirements || [];
    
    // Special handling for Governance & Leadership category
    if (CorrectedGovernanceService.isGovernanceCategory(category)) {
      const correctedStructure = CorrectedGovernanceService.getCorrectedStructure();
      requirements = [
        ...correctedStructure.sections['Leadership'] || [],
        ...correctedStructure.sections['HR'] || [],
        ...correctedStructure.sections['Monitoring & Compliance'] || []
      ];
    }
    
    // Clean and process requirements
    const cleanedRequirements = requirements.map((req: any) => {
      const text = typeof req === 'string' ? req : req.description || req.text || '';
      return ProfessionalGuidanceService.cleanText(text);
    }).filter((req: string) => req && req.trim().length > 0);
    
    // Fallback to title if no subrequirements
    if (cleanedRequirements.length === 0 && mapping.auditReadyUnified?.title) {
      const titleText = ProfessionalGuidanceService.cleanText(mapping.auditReadyUnified.title);
      if (titleText.length > 10) {
        cleanedRequirements.push(titleText);
      }
    }
    
    // Format requirements with proper lettering
    const isGovernance = CorrectedGovernanceService.isGovernanceCategory(category);
    const formattedRequirements: UnifiedRequirement[] = [];
    
    cleanedRequirements.forEach((req: string, idx: number) => {
      const letter = String.fromCharCode(97 + idx); // a, b, c, d, ...
      
      let cleanReq = req.trim();
      let title = '';
      let description = '';
      
      if (isGovernance) {
        // Governance requirements already have proper lettering
        const match = cleanReq.match(/^([a-z])\)\s*([^-:]+)[-:]?\s*(.*)$/i);
        if (match) {
          title = match[2].trim();
          description = match[3]?.trim() || '';
        } else {
          title = cleanReq;
        }
      } else {
        // Remove existing numbering/lettering
        cleanReq = cleanReq.replace(/^[a-z]\)\s*/i, '').replace(/^\d+\.\s*/, '');
        
        // Extract title and description (split at first sentence or colon)
        const colonSplit = cleanReq.split(':');
        const sentenceSplit = cleanReq.split('. ');
        
        if (colonSplit.length > 1) {
          title = colonSplit[0].trim();
          description = colonSplit.slice(1).join(':').trim();
        } else if (sentenceSplit.length > 1) {
          title = sentenceSplit[0].trim();
          description = sentenceSplit.slice(1).join('. ').trim();
        } else {
          title = cleanReq;
        }
      }
      
      formattedRequirements.push({
        letter: letter,
        title: title,
        description: description,
        originalText: req
      });
    });
    
    // Final fallback if still no requirements
    if (formattedRequirements.length === 0) {
      const fallbackContent = mapping.auditReadyUnified?.title || 
                            mapping.auditReadyUnified?.description || 
                            'Requirements definition in progress';
      formattedRequirements.push({
        letter: 'a',
        title: ProfessionalGuidanceService.cleanText(fallbackContent),
        description: '',
        originalText: fallbackContent
      });
    }
    
    return {
      category: category,
      requirements: formattedRequirements
    };
  }
  
  /**
   * Get requirements for a specific category from mock data or database
   */
  static async getRequirementsForCategory(category: string): Promise<UnifiedRequirement[]> {
    // This would normally fetch from database
    // For now, we'll need to integrate with existing data sources
    
    // Placeholder for database integration
    return [];
  }
  
  /**
   * Format requirements for display
   */
  static formatRequirementsForDisplay(requirements: UnifiedRequirement[]): string {
    return requirements.map(req => {
      const title = req.title ? ` ${req.title}` : '';
      const desc = req.description ? ` - ${req.description}` : '';
      return `${req.letter})${title}${desc}`;
    }).join('\n\n');
  }
}