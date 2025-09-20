/**
 * Fix Governance & Leadership Text Organization
 * CRITICAL FIX: Addresses bullet points not being under correct sub-requirement titles
 * and massive amounts of text in the Governance & Leadership category
 */

import { AITextConsolidationEngine, ConsolidationRequest } from './ai-consolidation/AITextConsolidationEngine';

export interface GovernanceFixConfig {
  useAIConsolidation: boolean;
  maxBulletsPerSubRequirement: number;
  targetReductionPercentage: number;
}

export class GovernanceTextOrganizationFixer {
  private aiEngine: AITextConsolidationEngine;
  private config: GovernanceFixConfig;

  constructor(config: GovernanceFixConfig = {
    useAIConsolidation: true,
    maxBulletsPerSubRequirement: 3,
    targetReductionPercentage: 50
  }) {
    this.aiEngine = new AITextConsolidationEngine();
    this.config = config;
  }

  /**
   * Main fix method for Governance & Leadership text organization
   */
  async fixGovernanceTextOrganization(
    category: string,
    originalContent: any,
    selectedFrameworks: any
  ): Promise<any> {
    if (!this.isGovernanceCategory(category)) {
      return originalContent; // Not governance, return as-is
    }

    console.log('🔧 [GOVERNANCE FIX] Applying text organization fix for:', category);

    try {
      // Step 1: Organize bullet points under correct sub-requirement titles
      const organizedContent = await this.organizeBySubRequirements(originalContent);

      // Step 2: Apply text consolidation to reduce massive amounts of text
      const consolidatedContent = await this.applyTextConsolidation(
        organizedContent,
        category,
        selectedFrameworks
      );

      // Step 3: Validate and ensure quality
      const validatedContent = this.validateAndCleanup(consolidatedContent);

      console.log('✅ [GOVERNANCE FIX] Successfully organized and consolidated text');
      return validatedContent;

    } catch (error) {
      console.error('❌ [GOVERNANCE FIX] Failed to fix text organization:', error);
      return originalContent; // Return original on error
    }
  }

  /**
   * Check if category is Governance & Leadership
   */
  private isGovernanceCategory(category: string): boolean {
    return category === 'Governance & Leadership' || 
           category.includes('Governance') ||
           category.toLowerCase().includes('governance');
  }

  /**
   * Organize bullet points under correct sub-requirement titles
   */
  private async organizeBySubRequirements(content: any): Promise<any> {
    if (!content.auditReadyUnified?.subRequirements) {
      return content;
    }

    const organizedSubRequirements: any[] = [];

    // Define the proper Governance & Leadership structure
    const governanceStructure = [
      {
        letter: 'a',
        title: 'Leadership Commitment and Accountability',
        keywords: ['leadership', 'commitment', 'accountability', 'management', 'executive', 'responsibility']
      },
      {
        letter: 'b',
        title: 'Scope and Boundaries Definition', 
        keywords: ['scope', 'boundaries', 'coverage', 'perimeter', 'definition', 'limits']
      },
      {
        letter: 'c',
        title: 'Organizational Structure and Roles',
        keywords: ['roles', 'responsibilities', 'structure', 'organization', 'authority', 'reporting']
      },
      {
        letter: 'd',
        title: 'Policy Framework with Deadlines',
        keywords: ['policy', 'policies', 'framework', 'deadlines', 'timelines', 'compliance']
      },
      {
        letter: 'e',
        title: 'Project Management and Security Integration',
        keywords: ['project', 'integration', 'development', 'planning', 'deployment', 'lifecycle']
      },
      {
        letter: 'f',
        title: 'Asset Use and Disposal Policies',
        keywords: ['asset', 'disposal', 'acceptable use', 'destruction', 'lifecycle', 'handling']
      },
      {
        letter: 'g',
        title: 'Documented Procedures and Evidence',
        keywords: ['documentation', 'procedures', 'evidence', 'records', 'version control', 'audit trail']
      },
      {
        letter: 'h',
        title: 'Personnel Security Framework',
        keywords: ['personnel', 'employment', 'screening', 'confidentiality', 'human resources', 'staff']
      },
      {
        letter: 'i',
        title: 'Competence Management',
        keywords: ['competence', 'training', 'skills', 'development', 'education', 'qualification']
      },
      {
        letter: 'j',
        title: 'Monitoring and Reporting',
        keywords: ['monitoring', 'reporting', 'audit', 'review', 'oversight', 'measurement']
      },
      {
        letter: 'k',
        title: 'Change Management and Control',
        keywords: ['change management', 'control', 'modification', 'approval', 'testing', 'impact assessment']
      },
      {
        letter: 'l',
        title: 'Regulatory and Authority Relationships',
        keywords: ['regulatory', 'authority', 'compliance', 'notification', 'cooperation', 'relationship']
      },
      {
        letter: 'm',
        title: 'Incident Response Governance',
        keywords: ['incident', 'response', 'classification', 'escalation', 'emergency', 'breach']
      },
      {
        letter: 'n',
        title: 'Third Party Governance',
        keywords: ['third party', 'supplier', 'vendor', 'contract', 'outsourcing', 'service provider']
      },
      {
        letter: 'o',
        title: 'Continuous Improvement',
        keywords: ['improvement', 'enhancement', 'maturity', 'optimization', 'evolution', 'progression']
      },
      {
        letter: 'p',
        title: 'Security Awareness Governance',
        keywords: ['awareness', 'training', 'education', 'culture', 'communication', 'engagement']
      }
    ];

    // Extract all bullets from current content
    const allBullets = this.extractAllBullets(content.auditReadyUnified.subRequirements);

    // Organize bullets under correct sub-requirements
    for (const structure of governanceStructure) {
      const matchingBullets = this.findMatchingBullets(allBullets, structure.keywords);
      
      // Limit bullets per sub-requirement to reduce text volume
      const limitedBullets = matchingBullets.slice(0, this.config.maxBulletsPerSubRequirement);

      organizedSubRequirements.push({
        letter: structure.letter,
        title: structure.title,
        description: this.generateConciseDescription(structure.title, limitedBullets),
        requirements: limitedBullets,
        framework_references: this.extractFrameworkReferences(limitedBullets)
      });
    }

    return {
      ...content,
      auditReadyUnified: {
        ...content.auditReadyUnified,
        subRequirements: organizedSubRequirements
      }
    };
  }

  /**
   * Extract all bullet points from sub-requirements
   */
  private extractAllBullets(subRequirements: any[]): string[] {
    const bullets: string[] = [];
    
    for (const subReq of subRequirements) {
      if (typeof subReq === 'string' && subReq.trim().startsWith('-')) {
        bullets.push(subReq.trim());
      } else if (subReq.requirements && Array.isArray(subReq.requirements)) {
        bullets.push(...subReq.requirements.filter((req: any) => 
          typeof req === 'string' && req.trim().startsWith('-')
        ));
      } else if (typeof subReq === 'string' && subReq.includes('-')) {
        // Extract bullets from text content
        const extractedBullets = subReq.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim());
        bullets.push(...extractedBullets);
      }
    }

    return bullets;
  }

  /**
   * Find bullets matching specific keywords
   */
  private findMatchingBullets(bullets: string[], keywords: string[]): string[] {
    return bullets.filter(bullet => {
      const bulletLower = bullet.toLowerCase();
      return keywords.some(keyword => 
        bulletLower.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * Generate concise description for sub-requirement
   */
  private generateConciseDescription(title: string, bullets: string[]): string {
    if (bullets.length === 0) {
      return `Implement and maintain ${title.toLowerCase()} controls as required by selected frameworks.`;
    }

    // Generate description based on the first bullet
    const firstBullet = bullets[0]?.replace(/^-\s*/, '').trim();
    if (firstBullet && firstBullet.length > 20) {
      return firstBullet.split('.')[0] + '.';
    }

    return `Comprehensive ${title.toLowerCase()} requirements based on organizational needs.`;
  }

  /**
   * Extract framework references from bullets
   */
  private extractFrameworkReferences(bullets: string[]): string[] {
    const frameworks = new Set<string>();
    const frameworkPatterns = [
      /ISO\s*27001/gi,
      /ISO\s*27002/gi,
      /CIS\s*Control/gi,
      /GDPR/gi,
      /NIS2/gi,
      /DORA/gi
    ];

    for (const bullet of bullets) {
      for (const pattern of frameworkPatterns) {
        const matches = bullet.match(pattern);
        if (matches) {
          matches.forEach(match => frameworks.add(match.toUpperCase()));
        }
      }
    }

    return Array.from(frameworks);
  }

  /**
   * Apply AI-powered text consolidation to reduce text volume
   */
  private async applyTextConsolidation(
    content: any,
    category: string,
    selectedFrameworks: any
  ): Promise<any> {
    if (!this.config.useAIConsolidation) {
      return content;
    }

    console.log('🤖 [GOVERNANCE FIX] Applying AI text consolidation...');

    const consolidatedSubRequirements: any[] = [];

    for (const subReq of content.auditReadyUnified.subRequirements) {
      if (!subReq.requirements || subReq.requirements.length === 0) {
        consolidatedSubRequirements.push(subReq);
        continue;
      }

      try {
        // Prepare consolidation request
        const request: ConsolidationRequest = {
          content: subReq.requirements.join('\n'),
          category: `${category} - ${subReq.title}`,
          frameworks: Object.keys(selectedFrameworks).filter(fw => selectedFrameworks[fw]),
          type: 'bullets',
          config: {
            maxLength: 200,
            preserveDetails: true,
            maintainStructure: true,
            targetReduction: this.config.targetReductionPercentage
          }
        };

        // Apply AI consolidation
        const result = await this.aiEngine.consolidateText(request);
        
        // Parse consolidated content back to array
        const consolidatedRequirements = result.consolidatedContent
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.startsWith('-') ? line : `- ${line}`);

        consolidatedSubRequirements.push({
          ...subReq,
          requirements: consolidatedRequirements,
          consolidationMetrics: {
            originalCount: subReq.requirements.length,
            consolidatedCount: consolidatedRequirements.length,
            reductionPercentage: result.reductionPercentage
          }
        });

        console.log(`✅ [GOVERNANCE FIX] Consolidated ${subReq.title}: ${subReq.requirements.length} → ${consolidatedRequirements.length} bullets`);

      } catch (error) {
        console.warn(`⚠️ [GOVERNANCE FIX] Failed to consolidate ${subReq.title}:`, error);
        consolidatedSubRequirements.push(subReq); // Keep original on error
      }
    }

    return {
      ...content,
      auditReadyUnified: {
        ...content.auditReadyUnified,
        subRequirements: consolidatedSubRequirements
      }
    };
  }

  /**
   * Final validation and cleanup
   */
  private validateAndCleanup(content: any): any {
    if (!content.auditReadyUnified?.subRequirements) {
      return content;
    }

    // Ensure no sub-requirement has more than maxBulletsPerSubRequirement
    const cleanedSubRequirements = content.auditReadyUnified.subRequirements.map((subReq: any) => {
      if (subReq.requirements && subReq.requirements.length > this.config.maxBulletsPerSubRequirement) {
        return {
          ...subReq,
          requirements: subReq.requirements.slice(0, this.config.maxBulletsPerSubRequirement)
        };
      }
      return subReq;
    });

    return {
      ...content,
      auditReadyUnified: {
        ...content.auditReadyUnified,
        subRequirements: cleanedSubRequirements
      }
    };
  }

  /**
   * Get fix statistics
   */
  getFixStatistics(originalContent: any, fixedContent: any): any {
    const original = this.countTextMetrics(originalContent);
    const fixed = this.countTextMetrics(fixedContent);

    return {
      originalMetrics: original,
      fixedMetrics: fixed,
      reduction: {
        bulletPoints: ((original.bulletPoints - fixed.bulletPoints) / original.bulletPoints * 100).toFixed(1),
        totalText: ((original.totalLength - fixed.totalLength) / original.totalLength * 100).toFixed(1)
      }
    };
  }

  /**
   * Count text metrics
   */
  private countTextMetrics(content: any): any {
    if (!content?.auditReadyUnified?.subRequirements) {
      return { bulletPoints: 0, totalLength: 0, subRequirements: 0 };
    }

    let bulletPoints = 0;
    let totalLength = 0;

    for (const subReq of content.auditReadyUnified.subRequirements) {
      if (subReq.requirements) {
        bulletPoints += subReq.requirements.length;
        totalLength += subReq.requirements.join('').length;
      }
    }

    return {
      bulletPoints,
      totalLength,
      subRequirements: content.auditReadyUnified.subRequirements.length
    };
  }
}

// Export default instance
export const governanceTextFixer = new GovernanceTextOrganizationFixer();