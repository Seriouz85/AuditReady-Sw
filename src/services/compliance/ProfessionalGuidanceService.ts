/**
 * Professional Guidance Service for Clean PDF Export
 * Provides properly formatted guidance text without special characters
 */

export class ProfessionalGuidanceService {
  /**
   * Clean text by removing special characters and markdown formatting
   */
  static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Remove ALL Unicode emoji blocks and special characters
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[📋🎯💡🏛️⚙️🔒🛡️📊✅❌⚠️🌍🔄📈]/gu, '')
      // Remove any corrupted/weird characters
      .replace(/[Ø=ÚÊÃê]/gi, '') // Remove corrupted chars like Ø=ÚÊ
      .replace(/Ø=.{2}/g, '') // Remove patterns like Ø=XX
      // Remove markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/__([^_]+)__/g, '$1') // Bold alt
      .replace(/_([^_]+)_/g, '$1') // Italic alt
      .replace(/`([^`]+)`/g, '$1') // Code
      .replace(/#+\s*/g, '') // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      // Remove other special characters but keep basic punctuation
      .replace(/[•◆▪→←↑↓]/g, '')
      .replace(/[│├└─]/g, '')
      // Remove asterisks and hash symbols that might remain
      .replace(/^[#*]+/gm, '') // Remove leading # or *
      .replace(/\s[#*]+\s/g, ' ') // Remove isolated # or *
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Format framework name properly with version/year
   */
  static formatFrameworkName(framework: string): string {
    const frameworkMap: Record<string, string> = {
      'iso27001': 'ISO 27001:2022',
      'iso27002': 'ISO 27002:2022', 
      'ciscontrols': 'CIS Controls - v8.1.2',
      'cis controls': 'CIS Controls - v8.1.2',
      'ciscontrols(ig1)': 'CIS Controls - IG1 (v8.1.2)',
      'ciscontrols(ig2)': 'CIS Controls - IG2 (v8.1.2)', 
      'ciscontrols(ig3)': 'CIS Controls - IG3 (v8.1.2)',
      'ciscontrols (ig1)': 'CIS Controls - IG1 (v8.1.2)',
      'ciscontrols (ig2)': 'CIS Controls - IG2 (v8.1.2)', 
      'ciscontrols (ig3)': 'CIS Controls - IG3 (v8.1.2)',
      'gdpr': 'GDPR (EU 2016/679)',
      'nis2': 'NIS2 Directive (EU 2022/2555)'
    };

    const key = framework.toLowerCase().replace(/\s+/g, '');
    return frameworkMap[key] || framework;
  }

  /**
   * Extract guidance content without framework references
   */
  static extractPureGuidance(guidanceText: string): string {
    if (!guidanceText) return '';

    // Split by common section markers
    const sections = guidanceText.split(/(?:FRAMEWORK REFERENCES:|FRAMEWORK MAPPINGS:|REFERENCES:|UNDERSTANDING:|IMPLEMENTATION:)/i);
    
    // Take the first part (before any references section)
    let pureGuidance = sections[0] || guidanceText;

    // Further clean up by removing inline reference patterns
    pureGuidance = pureGuidance
      .replace(/\((?:ISO \d+|CIS|GDPR|NIS2)[^)]*\)/g, '') // Remove inline references
      .replace(/(?:A\.\d+\.\d+|Article \d+|\d+\.\d+\.\d+)/g, '') // Remove reference codes
      .replace(/\*\*[^*]+\*\*/g, (match) => match.replace(/\*\*/g, '')) // Remove bold markers
      .trim();

    return this.cleanText(pureGuidance);
  }

  /**
   * Extract framework references from guidance text
   */
  static extractReferences(guidanceText: string): string {
    if (!guidanceText) return '';

    const references: string[] = [];
    
    // Look for framework reference sections
    const refMatch = guidanceText.match(/(?:FRAMEWORK REFERENCES:|FRAMEWORK MAPPINGS:|REFERENCES:)(.+?)(?:UNDERSTANDING|IMPLEMENTATION|AUDIT-READY|$)/si);
    
    if (refMatch && refMatch[1]) {
      const refsText = refMatch[1];
      
      // Extract ISO 27001 references
      const iso27001Match = refsText.match(/ISO 27001[:\s]+([^,\n]+(?:,\s*[^,\n]+)*)/i);
      if (iso27001Match) {
        references.push(`ISO 27001: ${this.cleanText(iso27001Match[1])}`);
      }
      
      // Extract ISO 27002 references
      const iso27002Match = refsText.match(/ISO 27002[:\s]+([^,\n]+(?:,\s*[^,\n]+)*)/i);
      if (iso27002Match) {
        references.push(`ISO 27002: ${this.cleanText(iso27002Match[1])}`);
      }
      
      // Extract CIS Controls references
      const cisMatch = refsText.match(/CIS Controls?[:\s]+([^,\n]+(?:,\s*[^,\n]+)*)/i);
      if (cisMatch) {
        references.push(`CIS Controls: ${this.cleanText(cisMatch[1])}`);
      }
      
      // Extract GDPR references
      const gdprMatch = refsText.match(/GDPR[:\s]+([^,\n]+(?:,\s*[^,\n]+)*)/i);
      if (gdprMatch) {
        references.push(`GDPR: ${this.cleanText(gdprMatch[1])}`);
      }
      
      // Extract NIS2 references
      const nis2Match = refsText.match(/NIS2[:\s]+([^,\n]+(?:,\s*[^,\n]+)*)/i);
      if (nis2Match) {
        references.push(`NIS2: ${this.cleanText(nis2Match[1])}`);
      }
    }

    return references.join('\n');
  }

  /**
   * Format unified requirements without special characters
   */
  static formatUnifiedRequirements(requirements: any[]): string {
    if (!requirements || requirements.length === 0) {
      return 'No specific unified requirements identified';
    }

    const items = requirements
      .map((req, idx) => {
        const cleanReq = this.cleanText(
          typeof req === 'string' ? req : req.description || req.text || ''
        );
        return `${idx + 1}. ${cleanReq}`;
      })
      .join('\n\n');

    return items;
  }

  /**
   * Format category name for display
   */
  static formatCategoryName(category: string): string {
    if (!category) return '';
    
    // Remove leading numbers and clean up
    const cleaned = category
      .replace(/^\d+\.\s*/, '') // Remove leading numbers
      .replace(/^0+/, '') // Remove leading zeros
      .trim();
    
    // Capitalize properly
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format structured guidance with bold headers maintained for readability
   */
  static formatStructuredGuidanceForPDF(guidance: string): string {
    if (!guidance) return '';
    
    return guidance
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Create structured requirements with proper lettering
   */
  static formatRequirementsWithLettering(requirements: string[]): string {
    if (!requirements || requirements.length === 0) {
      return 'Complete requirements available in application interface';
    }
    
    return requirements.map((req, index) => {
      // Check if requirement already has lettering
      if (req.match(/^[a-z]\)|^\d+\.|^[A-Z]\)/)) {
        return req;
      }
      
      // Add letter formatting
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      return `${letter}) ${req}`;
    }).join('\n\n');
  }
}