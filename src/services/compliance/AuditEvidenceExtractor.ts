/**
 * Audit Evidence Extractor Service
 * Separates audit evidence bullet points from unified requirements content
 * and structures them for use in unified guidance
 */

export interface ExtractedContent {
  cleanRequirement: string;
  auditEvidencePoints: string[];
}

export interface ExtractedSubRequirement {
  id: string;
  title: string;
  description: string;
  auditEvidencePoints: string[];
}

export class AuditEvidenceExtractor {
  
  /**
   * Extract audit evidence from unified requirements content
   */
  static extractAuditEvidenceFromRequirements(subRequirements: string[]): ExtractedSubRequirement[] {
    return subRequirements.map((requirement, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      
      // Extract title and content
      const { title, content } = this.extractTitleAndContent(requirement);
      
      // Separate audit evidence from main content
      const extracted = this.separateAuditEvidenceFromContent(content);
      
      return {
        id: letter,
        title: title || `Sub-requirement ${letter}`,
        description: extracted.cleanRequirement,
        auditEvidencePoints: extracted.auditEvidencePoints
      };
    });
  }
  
  /**
   * Extract title and content from requirement text
   */
  private static extractTitleAndContent(requirement: string): { title: string; content: string } {
    // Handle different title patterns
    const patterns = [
      /^[a-z]\)\s*(.*?)\s-\s+(.*)/is,         // "a) TITLE - description" (space-hyphen-space separator)
      /^[a-z]\)\s*(.*?):\s*(.*)/is,           // "a) TITLE: description" (colon separator)  
      /^[a-z]\)\s*([^.\n]+)\.\s*(.*)/is,      // "a) TITLE. description" (period separator)
      /^(.*?)\s-\s+(.*)/is,                   // "TITLE - description" (no letter prefix, space-hyphen-space)
      /^(.*?):\s*(.*)/is,                     // "TITLE: description" (no letter prefix, colon)
      /^([^.\n]+)\.\s*(.*)/is,                // "TITLE. description" (no letter prefix, period)
      /^[a-z]\)\s*([^\n]+)/is                 // "a) TITLE" (everything after letter, fallback)
    ];
    
    for (const pattern of patterns) {
      const match = requirement.match(pattern);
      if (match) {
        let title = match[1].trim();
        let content = match[2] || match[1];
        
        // Clean up title - remove common prefixes and make it concise
        title = title
          .replace(/^(Establish|Implement|Maintain|Ensure|Define|Document|Create|Manage)\s+/i, '')
          .replace(/\s+and\s+/g, ' & ')
          .trim();
        
        return { title, content };
      }
    }
    
    // Fallback - no clear title pattern found
    return {
      title: '',
      content: requirement
    };
  }
  
  /**
   * Separate audit evidence bullet points from main requirement content
   * Made public static so it can be used by textFormatting utility
   */
  static separateAuditEvidenceFromContent(content: string): ExtractedContent {
    if (!content) {
      return { cleanRequirement: '', auditEvidencePoints: [] };
    }
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const cleanLines: string[] = [];
    const evidencePoints: string[] = [];
    
    let inEvidenceSection = false;
    
    for (const line of lines) {
      // Detect audit evidence section headers
      if (this.isEvidenceSectionHeader(line)) {
        inEvidenceSection = true;
        continue; // Skip the header line
      }
      
      // Detect evidence bullet points
      if (this.isEvidenceBulletPoint(line)) {
        inEvidenceSection = true;
        evidencePoints.push(this.cleanEvidenceBulletPoint(line));
        continue;
      }
      
      // Detect sections that indicate we're back to main content
      if (this.isMainContentIndicator(line)) {
        inEvidenceSection = false;
      }
      
      // If not in evidence section and not an evidence point, it's main content
      if (!inEvidenceSection && !this.isEvidenceBulletPoint(line)) {
        cleanLines.push(line);
      }
    }
    
    return {
      cleanRequirement: cleanLines.join(' ').trim(),
      auditEvidencePoints: evidencePoints
    };
  }
  
  /**
   * Check if a line is an audit evidence section header
   */
  private static isEvidenceSectionHeader(line: string): boolean {
    const evidenceHeaders = [
      /^\s*📋.*?audit.*?ready.*?evidence.*?collection/gi,
      /^\s*audit.*?ready.*?evidence.*?collection.*?essential.*?documentation.*?required/gi,
      /^\s*essential.*?documentation.*?required/gi,
      /^\s*technical.*?evidence.*?to.*?collect/gi
    ];
    
    return evidenceHeaders.some(pattern => pattern.test(line));
  }
  
  /**
   * Check if a line is an audit evidence bullet point
   */
  private static isEvidenceBulletPoint(line: string): boolean {
    const evidencePatterns = [
      // Generic audit evidence patterns
      /^\s*[•\-\*]?\s*documented.*?policy.*?with.*?management.*?approval/gi,
      /^\s*[•\-\*]?\s*implementation.*?procedures.*?and.*?workflows/gi,
      /^\s*[•\-\*]?\s*training.*?records.*?and.*?competency.*?assessments/gi,
      /^\s*[•\-\*]?\s*regular.*?review.*?and.*?update.*?documentation/gi,
      /^\s*[•\-\*]?\s*compliance.*?monitoring.*?and.*?reporting.*?records/gi,
      
      // Specific technical evidence patterns
      /^\s*[•\-\*]?\s*.*?deployment.*?coverage.*?reports.*?across.*?critical.*?enterprise.*?assets/gi,
      /^\s*[•\-\*]?\s*.*?agent.*?configuration.*?and.*?detection.*?rule.*?sets/gi,
      /^\s*[•\-\*]?\s*.*?alert.*?generation.*?and.*?investigation.*?logs/gi,
      /^\s*[•\-\*]?\s*.*?system.*?performance.*?and.*?resource.*?utilization.*?monitoring/gi,
      /^\s*[•\-\*]?\s*.*?integration.*?with.*?centralized.*?security.*?monitoring.*?and.*?siem.*?systems/gi,
      /^\s*[•\-\*]?\s*.*?signature.*?and.*?rule.*?update.*?procedures.*?and.*?schedules/gi,
      
      // Network/infrastructure evidence
      /^\s*[•\-\*]?\s*.*?network.*?infrastructure.*?inventory.*?with.*?current.*?firmware.*?software.*?versions/gi,
      /^\s*[•\-\*]?\s*.*?patch.*?management.*?procedures.*?for.*?network.*?devices/gi,
      /^\s*[•\-\*]?\s*.*?update.*?testing.*?results.*?and.*?rollback.*?procedures/gi,
      /^\s*[•\-\*]?\s*.*?vulnerability.*?scans.*?of.*?network.*?infrastructure.*?showing.*?current.*?patch.*?levels/gi,
      
      // SIEM/logging evidence
      /^\s*[•\-\*]?\s*.*?siem.*?system.*?deployment.*?architecture.*?and.*?data.*?flow.*?diagrams/gi,
      /^\s*[•\-\*]?\s*.*?log.*?source.*?configuration.*?and.*?collection.*?status.*?across.*?enterprise.*?assets/gi,
      /^\s*[•\-\*]?\s*.*?security.*?event.*?correlation.*?rules.*?and.*?alerting.*?thresholds.*?configuration/gi,
      /^\s*[•\-\*]?\s*.*?siem.*?dashboard.*?and.*?reporting.*?capabilities.*?demonstration/gi,
      /^\s*[•\-\*]?\s*.*?security.*?event.*?storage.*?retention.*?and.*?backup.*?procedures/gi,
      
      // Host-based detection evidence
      /^\s*[•\-\*]?\s*.*?host.*?based.*?intrusion.*?detection.*?system.*?deployment.*?policy.*?and.*?standards/gi,
      /^\s*[•\-\*]?\s*.*?enterprise.*?asset.*?risk.*?assessment.*?and.*?hids.*?deployment.*?prioritization/gi,
      /^\s*[•\-\*]?\s*.*?hids.*?agent.*?configuration.*?and.*?rule.*?management.*?procedures/gi,
      /^\s*[•\-\*]?\s*.*?hids.*?alert.*?investigation.*?and.*?response.*?procedures/gi,
      /^\s*[•\-\*]?\s*.*?hids.*?system.*?architecture.*?and.*?integration.*?documentation/gi,
      /^\s*[•\-\*]?\s*.*?hids.*?performance.*?monitoring.*?and.*?tuning.*?procedures/gi
    ];
    
    return evidencePatterns.some(pattern => pattern.test(line));
  }
  
  /**
   * Check if a line indicates we're back to main content (not evidence)
   */
  private static isMainContentIndicator(line: string): boolean {
    const mainContentIndicators = [
      /^framework.*?references/gi,
      /^implementation.*?guidelines/gi,
      /^operational.*?excellence/gi,
      /^interview.*?questions.*?for.*?auditors/gi,
      /^[a-z]\)/gi  // Another sub-requirement starting
    ];
    
    return mainContentIndicators.some(pattern => pattern.test(line));
  }
  
  /**
   * Clean an audit evidence bullet point
   */
  private static cleanEvidenceBulletPoint(line: string): string {
    // Remove bullet point indicators and clean up
    return line
      .replace(/^\s*[•\-\*]\s*/, '')
      .replace(/^\s*[\-\*]\s*/, '')
      .trim();
  }
  
  /**
   * Extract audit evidence from all categories' unified requirements
   */
  static extractAuditEvidenceFromMappingData(complianceMappingData: any[]): Map<string, ExtractedSubRequirement[]> {
    const evidenceMap = new Map<string, ExtractedSubRequirement[]>();
    
    for (const mapping of complianceMappingData) {
      if (mapping.auditReadyUnified?.subRequirements) {
        const extractedSubRequirements = this.extractAuditEvidenceFromRequirements(
          mapping.auditReadyUnified.subRequirements
        );
        evidenceMap.set(mapping.category, extractedSubRequirements);
      }
    }
    
    return evidenceMap;
  }
}