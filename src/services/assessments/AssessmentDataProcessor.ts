import { Assessment, Requirement, Standard } from '@/types';
import { UnifiedAssessmentData } from '@/components/assessments/UnifiedAssessmentTemplate';

/**
 * AssessmentDataProcessor
 * 
 * Processes assessment data once and creates a unified data structure
 * that can be used consistently across preview, PDF, and Word exports.
 * 
 * This eliminates redundant processing and ensures data consistency.
 */
export class AssessmentDataProcessor {
  
  /**
   * Process assessment data into unified format
   */
  static processAssessmentData(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: {
      showHeader?: boolean;
      showSummary?: boolean;
      showCharts?: boolean;
      showRequirements?: boolean;
      showAttachments?: boolean;
      format?: 'preview' | 'pdf' | 'word';
      activeStandardId?: string;
    } = {}
  ): UnifiedAssessmentData {
    
    // Filter requirements by active standard if specified
    const filteredRequirements = options.activeStandardId 
      ? requirements.filter(req => req.standardId === options.activeStandardId)
      : requirements;
    
    // Calculate metrics
    const metrics = this.calculateMetrics(filteredRequirements);
    
    // Group requirements by section and status
    const requirementsBySection = this.groupRequirementsBySection(filteredRequirements, standards);
    const requirementsByStatus = this.groupRequirementsByStatus(filteredRequirements);
    
    // Extract attachments from evidence
    const attachments = this.extractAttachmentsFromEvidence(assessment.evidence);
    
    // Set default configuration
    const config = {
      showHeader: options.showHeader ?? true,
      showSummary: options.showSummary ?? true,
      showCharts: options.showCharts ?? true,
      showRequirements: options.showRequirements ?? true,
      showAttachments: options.showAttachments ?? true,
      format: options.format ?? 'preview'
    };
    
    return {
      assessment,
      requirements: filteredRequirements,
      standards,
      metrics,
      requirementsBySection,
      requirementsByStatus,
      requirementNotes: assessment.requirementNotes || {},
      attachments,
      config
    };
  }
  
  /**
   * Calculate assessment metrics efficiently
   */
  private static calculateMetrics(requirements: Requirement[]) {
    const totalRequirements = requirements.length;
    let fulfilled = 0;
    let partiallyFulfilled = 0;
    let notFulfilled = 0;
    let notApplicable = 0;
    
    // Single pass through requirements for all counts
    requirements.forEach(req => {
      switch (req.status) {
        case 'fulfilled':
          fulfilled++;
          break;
        case 'partially-fulfilled':
          partiallyFulfilled++;
          break;
        case 'not-fulfilled':
          notFulfilled++;
          break;
        case 'not-applicable':
          notApplicable++;
          break;
      }
    });
    
    // Calculate compliance score
    const applicableRequirements = totalRequirements - notApplicable;
    const complianceScore = applicableRequirements > 0 
      ? Math.round((fulfilled + (partiallyFulfilled * 0.5)) / applicableRequirements * 100)
      : 0;
    
    return {
      totalRequirements,
      fulfilled,
      partiallyFulfilled,
      notFulfilled,
      notApplicable,
      complianceScore
    };
  }
  
  /**
   * Group requirements by section with proper multi-standard organization and numerical sorting
   */
  private static groupRequirementsBySection(
    requirements: Requirement[], 
    standards: Standard[]
  ): Record<string, Requirement[]> {
    let grouped: Record<string, Requirement[]>;
    
    // For multi-standard assessments, organize by "Standard Name - Section"
    if (standards.length > 1) {
      grouped = requirements.reduce((acc, req) => {
        const standard = standards.find(s => s.id === req.standardId);
        const standardName = standard ? `${standard.name} ${standard.version}` : 'Unknown Standard';
        const section = req.section || this.extractSectionFromCode(req.code) || 'Other';
        const sectionKey = `${standardName} - ${section}`;
        
        if (!acc[sectionKey]) {
          acc[sectionKey] = [];
        }
        acc[sectionKey].push(req);
        return acc;
      }, {} as Record<string, Requirement[]>);
    } else {
      // For single standard, organize by section only
      grouped = requirements.reduce((acc, req) => {
        const section = req.section || this.extractSectionFromCode(req.code) || 'Other';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(req);
        return acc;
      }, {} as Record<string, Requirement[]>);
    }
    
    // Apply numerical sorting to each section using comprehensive patterns
    // Trust database ordering for well-structured requirements, only sort when clearly needed
    Object.keys(grouped).forEach(sectionKey => {
      const reqs = grouped[sectionKey];
      // Only apply custom sorting if the codes don't follow standard patterns that DB handles well
      const hasComplexCodes = reqs.some(req => {
        const code = req.control_id || req.code || '';
        return code.includes('Article') || code.includes('Requirement') || !code.match(/^\d+\.?\d*\.?\d*$/);
      });
      
      if (hasComplexCodes) {
        grouped[sectionKey] = this.sortRequirementsNumerically(reqs);
      }
      // Otherwise trust the database ordering (control_id ASC)
    });
    
    return grouped;
  }


  /**
   * Sort requirements using comprehensive numerical patterns for all frameworks
   */
  private static sortRequirementsNumerically(requirements: Requirement[]): Requirement[] {
    const patterns = [
      { name: 'Article', regex: /^Article\s+(\d+)$/i },                          // DORA: Article 1, Article 2...
      { name: 'Requirement', regex: /^Requirement\s+(\d+)$/i },                 // Requirement 1, Requirement 2...
      { name: 'Section_Deep', regex: /(\d+)\.(\d+)\.(\d+)\.(\d+)$/i },          // Deep: 1.2.3.4...
      { name: 'ISO_Multi', regex: /([A-Z])\.(\d+)\.(\d+)\.(\d+)$/i },           // ISO: A.5.1.1, A.5.1.2...
      { name: 'ISO_Standard', regex: /([A-Z])\.(\d+)\.(\d+)$/i },               // ISO: A.5.1, A.5.2... (handles prefixes)
      { name: 'Control_Multi', regex: /(\d+)\.(\d+)\.(\d+)$/i },                // CIS: 1.1.1, 1.1.2...
      { name: 'Control_Simple', regex: /(\d+)\.(\d+)$/i },                      // Common: 8.11, 9.1, 4.1, 4.2...
      { name: 'Number_Suffix', regex: /^(\d+)([A-Z]?)$/i },                     // Numbers with optional suffix: 1A, 2B, 3...
      { name: 'Letter_Number', regex: /^([A-Z])(\d+)$/i },                      // Format: A1, B2, C3...
      { name: 'Number', regex: /^(\d+)$/i }                                     // Simple: 1, 2, 3...
    ];

    return requirements.sort((a, b) => {
      const aCode = a.code?.trim() || '';
      const bCode = b.code?.trim() || '';

      if (!aCode || !bCode) return aCode.localeCompare(bCode);

      // Try each pattern to find matches
      for (const pattern of patterns) {
        const aMatch = aCode.match(pattern.regex);
        const bMatch = bCode.match(pattern.regex);

        if (aMatch && bMatch) {
          // Both match this pattern, use custom comparison
          const result = this.compareMatches(pattern.name, aMatch, bMatch);
          if (result !== 0) return result;
        } else if (aMatch && !bMatch) {
          return -1; // Structured codes come first
        } else if (!aMatch && bMatch) {
          return 1;  // Structured codes come first
        }
      }

      // If no patterns match, fall back to string comparison
      return aCode.localeCompare(bCode);
    });
  }

  /**
   * Compare two regex matches based on pattern type
   */
  private static compareMatches(patternName: string, aMatch: RegExpMatchArray, bMatch: RegExpMatchArray): number {
    switch (patternName) {
      case 'Article':
      case 'Requirement':
      case 'Number':
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);

      case 'Letter_Number':
        const letterCompare = aMatch[1].localeCompare(bMatch[1]);
        return letterCompare !== 0 ? letterCompare : parseInt(aMatch[2]) - parseInt(bMatch[2]);

      case 'Number_Suffix':
        const numCompare = parseInt(aMatch[1]) - parseInt(bMatch[1]);
        return numCompare !== 0 ? numCompare : (aMatch[2] || '').localeCompare(bMatch[2] || '');

      case 'Control_Simple':
      case 'ISO_Standard':
        // Always use numerical comparison, not string comparison
        const level1Compare = parseInt(aMatch[1]) - parseInt(bMatch[1]);
        if (level1Compare !== 0) return level1Compare;
        return parseInt(aMatch[2]) - parseInt(bMatch[2]);

      case 'Control_Multi':
      case 'ISO_Multi':
        // Always use numerical comparison for first level
        const l1Compare = parseInt(aMatch[1]) - parseInt(bMatch[1]);
        if (l1Compare !== 0) return l1Compare;
        const l2Compare = parseInt(aMatch[2]) - parseInt(bMatch[2]);
        if (l2Compare !== 0) return l2Compare;
        return parseInt(aMatch[3]) - parseInt(bMatch[3]);

      case 'Section_Deep':
        for (let i = 1; i <= 4; i++) {
          const levelCompare = parseInt(aMatch[i]) - parseInt(bMatch[i]);
          if (levelCompare !== 0) return levelCompare;
        }
        return 0;

      default:
        return 0;
    }
  }
  
  /**
   * Group requirements by status
   */
  private static groupRequirementsByStatus(requirements: Requirement[]): Record<string, Requirement[]> {
    return requirements.reduce((acc, req) => {
      if (!acc[req.status]) {
        acc[req.status] = [];
      }
      acc[req.status]!.push(req);
      return acc;
    }, {} as Record<string, Requirement[]>);
  }
  
  /**
   * Extract section from requirement code (e.g., "A.5.1" -> "A.5")
   */
  static extractSectionFromCode(code: string): string {
    const match = code.match(/^([A-Z]+\.?\d*)/);
    return match?.[1] || 'Other';
  }
  
  /**
   * Extract attachment information from evidence content
   */
  private static extractAttachmentsFromEvidence(evidence?: string): Array<{
    filename: string;
    description: string;
    size?: string;
    type?: string;
  }> {
    if (!evidence) return [];
    
    const attachments: Array<{filename: string; description: string; size?: string; type?: string}> = [];
    
    if (evidence.includes('📎') || evidence.includes('Attached Evidence Files')) {
      // Extract file information using regex patterns
      const fileMatches = evidence.match(/•\s*([^(]+)\(([^)]+)\)/g) || [];
      
      fileMatches.forEach(match => {
        const parts = match.match(/•\s*([^(]+)\(([^)]+)\)/);
        if (parts && parts[1] && parts[2]) {
          const filename = parts[1].trim();
          const details = parts[2];
          
          // Try to extract size and type from details
          const sizeMatch = details.match(/(\d+\.?\d*\s*[KMGT]?B)/i);
          const typeMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
          
          attachments.push({
            filename,
            description: details,
            ...(sizeMatch?.[1] && { size: sizeMatch[1] }),
            ...(typeMatch?.[1] && { type: typeMatch[1].toUpperCase() }) || { type: 'Document' }
          });
        }
      });
    }
    
    return attachments;
  }
  
  /**
   * Generate export filename based on assessment data
   */
  static generateExportFilename(
    assessmentName: string, 
    format: 'pdf' | 'docx' | 'csv',
    includeDate: boolean = true
  ): string {
    const cleanName = assessmentName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const dateStr = includeDate ? `_${new Date().toISOString().split('T')[0]}` : '';
    
    return `${cleanName}${dateStr}.${format}`;
  }
  
  /**
   * Validate assessment data for export
   */
  static validateAssessmentData(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!assessment.name?.trim()) {
      errors.push('Assessment name is required');
    }
    
    if (!requirements || requirements.length === 0) {
      errors.push('Assessment must have at least one requirement');
    }
    
    // More lenient validation - check for standardIds on assessment instead
    if (!assessment.standardIds || assessment.standardIds.length === 0) {
      errors.push('Assessment must be associated with at least one standard');
    }
    
    // Only validate standards array if it's provided and not empty
    // This allows export to work even if standards loading failed
    if (standards && standards.length === 0 && assessment.standardIds.length > 0) {
      console.warn('Standards array is empty but assessment has standardIds. This may indicate a data loading issue.');
    }
    
    if (requirements.some(req => !req.code || !req.name)) {
      errors.push('All requirements must have a code and name');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get requirement statistics for dashboard displays
   */
  static getRequirementStatistics(requirements: Requirement[], standards: Standard[] = []) {
    const metrics = this.calculateMetrics(requirements);
    const bySection = this.groupRequirementsBySection(requirements, standards);
    
    return {
      ...metrics,
      sectionsCount: Object.keys(bySection).length,
      avgRequirementsPerSection: Math.round(requirements.length / Object.keys(bySection).length),
      sections: Object.entries(bySection).map(([section, reqs]) => ({
        name: section,
        count: reqs.length,
        fulfilled: reqs.filter(r => r.status === 'fulfilled').length,
        compliance: Math.round((reqs.filter(r => r.status === 'fulfilled').length / reqs.length) * 100)
      }))
    };
  }
  
  /**
   * Clean text for export (remove emojis, markdown, etc.)
   */
  static cleanTextForExport(text: string): string {
    return text
      .replace(/🎯|📋|🔍|⚡|•|📁|📎|🎨|🐛|🧹|🎯|🛡️|⚙️|📊|🔧|🚀/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`(.*?)`/g, '$1') // Remove code blocks
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .trim();
  }
  
  /**
   * Get color scheme for status indicators
   */
  static getStatusColorScheme() {
    return {
      fulfilled: {
        primary: '#10b981', // emerald-500
        light: '#d1fae5',   // emerald-100
        dark: '#047857'     // emerald-700
      },
      'partially-fulfilled': {
        primary: '#f59e0b', // amber-500
        light: '#fef3c7',   // amber-100
        dark: '#d97706'     // amber-600
      },
      'not-fulfilled': {
        primary: '#ef4444', // red-500
        light: '#fee2e2',   // red-100
        dark: '#dc2626'     // red-600
      },
      'not-applicable': {
        primary: '#6b7280', // gray-500
        light: '#f3f4f6',   // gray-100
        dark: '#374151'     // gray-700
      }
    };
  }
}

export default AssessmentDataProcessor;