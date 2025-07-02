/**
 * Service to filter unified requirements content based on selected frameworks
 * Removes references to unselected frameworks from descriptions and sub-requirements
 */

export interface FrameworkSelection {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: string | null; // 'ig1', 'ig2', 'ig3', or null
  gdpr: boolean;
  nis2: boolean;
}

export interface FilteredUnifiedRequirement {
  title: string;
  description: string;
  subRequirements: string[];
}

export class FrameworkFilterService {
  
  /**
   * Prioritize ISMS and Policy requirements for ISO 27001
   */
  private static prioritizeFoundationalRequirements(subRequirements: string[], selectedFrameworks: FrameworkSelection): string[] {
    if (!selectedFrameworks.iso27001) return subRequirements;
    
    // Move ISMS and Policy requirements to the front
    const prioritized: string[] = [];
    const regular: string[] = [];
    
    subRequirements.forEach(req => {
      if (req.includes('ISMS') || req.includes('POLICY FRAMEWORK') || req.includes('LEADERSHIP COMMITMENT') || req.includes('ORGANIZATIONAL STRUCTURE') || req.includes('PROJECT MANAGEMENT') || req.includes('PERSONNEL SECURITY') || req.includes('ASSET USE & DISPOSAL')) {
        prioritized.push(req);
      } else {
        regular.push(req);
      }
    });
    
    return [...prioritized, ...regular];
  }

  /**
   * Filter unified requirement content based on selected frameworks
   */
  static filterUnifiedRequirement(
    unifiedRequirement: { title: string; description: string; subRequirements: string[] },
    selectedFrameworks: FrameworkSelection
  ): FilteredUnifiedRequirement {
    
    let filteredSubRequirements = unifiedRequirement.subRequirements
      .map(subReq => this.filterSubRequirement(subReq, selectedFrameworks))
      .filter(subReq => subReq.length > 0); // Remove empty requirements after filtering
    
    // Prioritize foundational requirements for ISO 27001
    filteredSubRequirements = this.prioritizeFoundationalRequirements(filteredSubRequirements, selectedFrameworks);
    
    return {
      title: this.filterText(unifiedRequirement.title, selectedFrameworks),
      description: this.filterText(unifiedRequirement.description, selectedFrameworks),
      subRequirements: filteredSubRequirements
    };
  }
  
  /**
   * Improve deadline explanations to be more user-friendly
   */
  private static improveDeadlineGuidance(text: string, selectedFrameworks: FrameworkSelection): string {
    // Make deadline explanations more helpful and guiding
    
    // Fix the specific problematic phrase first
    text = text.replace(
      /72-hour, 24-hour, 1-month deadline for full incident reports,/g,
      'incident response timelines: notify authorities within 72 hours for data breaches, provide early warnings within 24 hours for security incidents, and complete detailed incident reports within 1 month (having response procedures and contact lists prepared makes these deadlines manageable),'
    );
    
    // Fix other variations of the problematic text
    text = text.replace(
      /72-hour GDPR breach notification to authorities, 24-hour NIS2 incident early warning, 1-month deadline for full incident reports/g,
      'incident response timelines (GDPR requires notifying authorities within 72 hours of discovering a breach, NIS2 requires early incident warnings within 24 hours, and detailed incident reports should be completed within 1 month - having documented procedures and contact lists ready makes this manageable)'
    );
    
    text = text.replace(
      /45-day maximum for disabling dormant accounts, 72-hour GDPR breach notification to authorities, 24-hour NIS2 incident early warning, 1-month deadline for full incident reports, 90-day minimum audit log retention, monthly vulnerability remediation cycles/g,
      'key compliance timelines: disable unused accounts within 45 days, have incident response plans ready for quick regulatory notifications (72h for GDPR breaches, 24h for NIS2 incidents), keep audit logs for at least 90 days, and patch vulnerabilities monthly'
    );
    
    if (selectedFrameworks.gdpr || selectedFrameworks.nis2) {
      // Replace technical deadline text with helpful guidance
      text = text.replace(
        /72-hour GDPR breach notification to authorities, 24-hour NIS2 incident early warning, 1-month deadline for full incident reports/g,
        'incident response timelines (GDPR requires notifying authorities within 72 hours of discovering a breach, NIS2 requires early incident warnings within 24 hours, and detailed incident reports should be completed within 1 month - having documented procedures and contact lists ready makes this manageable)'
      );
      
      text = text.replace(
        /45-day maximum for disabling dormant accounts, 72-hour GDPR breach notification to authorities, 24-hour NIS2 incident early warning, 1-month deadline for full incident reports, 90-day minimum audit log retention, monthly vulnerability remediation cycles/g,
        'key compliance timelines: disable unused accounts within 45 days, have incident response plans ready for quick regulatory notifications (72h for GDPR breaches, 24h for NIS2 incidents), keep audit logs for at least 90 days, and patch vulnerabilities monthly'
      );
    } else if (selectedFrameworks.gdpr) {
      text = text.replace(
        /72-hour GDPR breach notification/g,
        'GDPR 72-hour breach notification (having a breach response plan and authority contact details ready makes this achievable)'
      );
    } else if (selectedFrameworks.nis2) {
      text = text.replace(
        /24-hour NIS2 incident early warning/g,
        'NIS2 24-hour incident reporting (early detection systems and documented escalation procedures help meet this timeline)'
      );
    }
    
    return text;
  }

  /**
   * Add ISO 27001 ISMS and Policy guidance
   */
  private static addISMSGuidance(text: string, selectedFrameworks: FrameworkSelection): string {
    if (!selectedFrameworks.iso27001) return text;
    
    // Add ISMS guidance to governance requirements
    if (text.includes('LEADERSHIP COMMITMENT') || text.includes('Top management must')) {
      text = text.replace(
        'Top management must',
        'ISMS Foundation: ISO 27001 requires an Information Security Management System (ISMS) - a systematic approach to managing security. Top management must'
      );
    }
    
    // Add policy guidance early in governance
    if (text.includes('POLICY FRAMEWORK')) {
      text = text.replace(
        'POLICY FRAMEWORK',
        'POLICY FRAMEWORK (ISO 27001 Foundation: Your information security policy becomes the cornerstone document where many governance requirements can be documented, approved, and communicated)'
      );
    }
    
    // Enhance organizational structure text for ISO 27001
    if (text.includes('ORGANIZATIONAL STRUCTURE')) {
      text = text.replace(
        'ORGANIZATIONAL STRUCTURE',
        'ORGANIZATIONAL STRUCTURE (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation)'
      );
    }
    
    // Add guidance for project management security
    if (text.includes('PROJECT MANAGEMENT')) {
      text = text.replace(
        'PROJECT MANAGEMENT',
        'PROJECT MANAGEMENT & CHANGE CONTROL (ISO 27001 Requirement: Security must be integrated into all projects and change processes)'
      );
    }
    
    // Add guidance for personnel security
    if (text.includes('PERSONNEL SECURITY')) {
      text = text.replace(
        'PERSONNEL SECURITY',
        'PERSONNEL SECURITY FRAMEWORK (ISO 27001 Requirement: Comprehensive employment security including terms, screening, NDAs, and termination procedures)'
      );
    }
    
    // Add guidance for asset use and disposal policies
    if (text.includes('ASSET USE & DISPOSAL')) {
      text = text.replace(
        'ASSET USE & DISPOSAL',
        'ASSET USE & DISPOSAL POLICIES (ISO 27001 Requirement: Define acceptable use and secure disposal procedures for all information assets)'
      );
    }
    
    return text;
  }

  /**
   * Filter individual sub-requirement text
   */
  private static filterSubRequirement(subRequirement: string, selectedFrameworks: FrameworkSelection): string {
    let filtered = subRequirement;
    
    // First, improve deadline guidance to be more user-friendly
    filtered = this.improveDeadlineGuidance(filtered, selectedFrameworks);
    
    // Add ISO 27001 ISMS and policy guidance
    filtered = this.addISMSGuidance(filtered, selectedFrameworks);
    
    // Remove entire clauses that reference unselected frameworks
    if (!selectedFrameworks.gdpr) {
      // Remove GDPR-specific clauses
      filtered = filtered.replace(/,?\s*including GDPR[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*GDPR[^,]*(?:notification|breach|data protection|consent|rights)[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*72-hour GDPR[^,]*/gi, '');
      filtered = filtered.replace(/\([^)]*GDPR[^)]*\),?\s*/gi, '');
    }
    
    if (!selectedFrameworks.nis2) {
      // Remove NIS2-specific clauses
      filtered = filtered.replace(/,?\s*including NIS2[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*NIS2[^,]*(?:obligations|incident|early warning|reporting)[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*24-hour NIS2[^,]*/gi, '');
      filtered = filtered.replace(/\([^)]*NIS2[^)]*\),?\s*/gi, '');
    }
    
    if (!selectedFrameworks.iso27001) {
      // Remove ISO 27001-specific references
      filtered = filtered.replace(/,?\s*ISO 27001[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*including ISO 27001[^,]*/gi, '');
    }
    
    if (!selectedFrameworks.iso27002) {
      // Remove ISO 27002-specific references  
      filtered = filtered.replace(/,?\s*ISO 27002[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*including ISO 27002[^,]*/gi, '');
    }
    
    if (!selectedFrameworks.cisControls) {
      // Remove CIS Controls references
      filtered = filtered.replace(/,?\s*CIS Controls?[^,]*/gi, '');
      filtered = filtered.replace(/,?\s*including CIS[^,]*/gi, '');
    }
    
    // Clean up formatting issues after removals
    filtered = filtered.replace(/,\s*,/g, ','); // Remove double commas
    filtered = filtered.replace(/,\s*and\s*,/g, ' and '); // Fix "and" surrounded by commas
    filtered = filtered.replace(/,\s*$/, ''); // Remove trailing commas
    filtered = filtered.replace(/^\s*,/, ''); // Remove leading commas
    filtered = filtered.replace(/\s+/g, ' '); // Clean up extra spaces
    filtered = filtered.trim();
    
    // If the requirement becomes too short or meaningless, return empty to filter it out
    if (filtered.length < 50 || filtered.match(/^[a-z]\)\s*[A-Z\s]*:?\s*$/)) {
      return '';
    }
    
    return filtered;
  }
  
  /**
   * Filter general text content (titles, descriptions)
   */
  private static filterText(text: string, selectedFrameworks: FrameworkSelection): string {
    let filtered = text;
    
    // Remove framework-specific mentions in parentheses
    if (!selectedFrameworks.gdpr) {
      filtered = filtered.replace(/\([^)]*GDPR[^)]*\)/gi, '');
    }
    
    if (!selectedFrameworks.nis2) {
      filtered = filtered.replace(/\([^)]*NIS2[^)]*\)/gi, '');
    }
    
    if (!selectedFrameworks.iso27001) {
      filtered = filtered.replace(/\([^)]*ISO 27001[^)]*\)/gi, '');
    }
    
    if (!selectedFrameworks.iso27002) {
      filtered = filtered.replace(/\([^)]*ISO 27002[^)]*\)/gi, '');
    }
    
    if (!selectedFrameworks.cisControls) {
      filtered = filtered.replace(/\([^)]*CIS[^)]*\)/gi, '');
    }
    
    // Clean up extra spaces and punctuation
    filtered = filtered.replace(/\s+/g, ' ').trim();
    
    return filtered;
  }
  
  /**
   * Get framework-specific context for the unified requirements
   */
  static getFrameworkContext(selectedFrameworks: FrameworkSelection): string {
    const selected = [];
    
    if (selectedFrameworks.iso27001) selected.push('ISO 27001');
    if (selectedFrameworks.iso27002) selected.push('ISO 27002');
    if (selectedFrameworks.cisControls) {
      selected.push(`CIS Controls ${selectedFrameworks.cisControls.toUpperCase()}`);
    }
    if (selectedFrameworks.gdpr) selected.push('GDPR');
    if (selectedFrameworks.nis2) selected.push('NIS2');
    
    if (selected.length === 0) return 'No frameworks selected';
    if (selected.length === 1) return `Unified requirements for ${selected[0]}`;
    if (selected.length === 2) return `Unified requirements for ${selected.join(' and ')}`;
    
    return `Unified requirements for ${selected.slice(0, -1).join(', ')} and ${selected[selected.length - 1]}`;
  }
}