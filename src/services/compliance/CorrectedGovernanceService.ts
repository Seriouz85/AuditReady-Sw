/**
 * Corrected Governance Service
 * 
 * Provides the properly structured Governance & Leadership unified requirement
 * with the exact organization requested by the user.
 */

export interface CorrectedGovernanceStructure {
  title: string;
  description: string;
  sections: {
    [sectionName: string]: string[];
  };
  implementationGuidance: {
    [sectionName: string]: string;
  };
}

export class CorrectedGovernanceService {
  /**
   * Get the corrected Governance & Leadership structure with proper a, b, c ordering
   * and organized into the three sections as requested
   */
  static getCorrectedStructure(): CorrectedGovernanceStructure {
    return {
      title: 'Governance & Leadership Requirements',
      description: 'Unified requirements for governance and leadership controls with proper organizational structure',
      
      // Properly organized sections with a, b, c, d ordering
      sections: {
        
        // SECTION 1: Leadership
        'Leadership': [
          'a) Leadership commitment and accountability - ISMS Foundation: ISO 27001 requires an Information Security Management System (ISMS), a systematic approach to managing security. Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability',
          'b) Scope and boundaries - Clearly document ISMS scope including: physical locations, logical boundaries, included/excluded systems, interfaces with third parties, and business processes covered. Make scope statement publicly available. Review scope with any significant organizational change',
          'c) Organizational structure (ISMS Define roles and responsibilities as part of your ISMS implementation) and roles - Define and document ALL security roles including: Information Security Officer, Data Protection Officer (GDPR mandatory if applicable), Incident Response Manager (with backup), Risk Owners, and Asset Owners. Each role must have clear written responsibilities, authorities, and reporting lines. Review and update annually or when organizational changes occur',
          'd) Policy framework (ISO 27001 Foundation: Your information security policy becomes the cornerstone document where many governance can be documented, approved, and communicated) with deadlines - Establish comprehensive security policies that specify key timelines: disable unused accounts within 45 days, have incident response plans ready for notifications (GDPR: notify supervisory authority within 72h when personal data breaches likely result in high risk to individuals. NIS2: early warning to national competent authority within 24h for significant incidents affecting service continuity), keep audit logs for at least 90 days, and patch vulnerabilities monthly. All policies must be approved by management and reviewed annually',
          'e) Project management (ISO 27001 Security must be integrated into all project processes including planning, development, and deployment) and security integration - ISO 27001 Security must be integrated into all projects from inception. Project managers must include security in project planning, conduct security reviews at key milestones, and ensure security testing before deployment. All projects must complete security impact assessments and maintain security documentation throughout the project lifecycle',
          'f) Asset use and disposal policies (ISO 27001 Define acceptable use and secure disposal procedures for all information assets) policies - Define acceptable use policies for information and associated assets covering permitted activities, prohibited actions, and monitoring procedures. Establish asset return and disposal procedures ensuring secure data destruction, documentation of disposal activities, and proper handling of both physical and digital assets during termination, transfer, or end of life',
          'g) Documented procedures and evidence - Maintain documented operating procedures for ALL security processes. Keep evidence of: lawful basis for data processing (GDPR), risk assessments, incident reports, audit results, management decisions, training records, and certifications. Documentation must be version controlled'
        ],
        
        // SECTION 2: HR
        'HR': [
          'h) Personnel security framework (ISO 27001 Comprehensive employment security including terms, screening, NDAs, and termination procedures) and leadership framework: leadership responsibilities - Employment terms and conditions with defined security responsibilities and accountabilities. Confidentiality/non-disclosure agreements',
          'i) Competence management - Determine and ensure the necessary competence of persons doing work that affects information security performance. This includes defining competence for each security role, providing appropriate education/training/experience, evaluating effectiveness of competence actions, and maintaining documented evidence of competence. Implement mentoring programs, skills assessments, and continuous professional development for security personnel'
        ],
        
        // SECTION 3: Monitoring & Compliance
        'Monitoring & Compliance': [
          'j) Monitoring and reporting - Conduct internal ISMS audits at planned intervals (minimum annually), management reviews (minimum quarterly), and maintain continuous monitoring. Document ALL activities, findings, and corrective actions. Report status to management with specific metrics and KPIs',
          'k) Change management and control - Establish formal change management processes for all system modifications. All changes must follow documented procedures with security impact assessments, testing, and approval workflows. Implement change advisory boards for significant changes and maintain detailed change logs for audit purposes',
          'l) Relationships - Establish documented procedures for: GDPR supervisory authority cooperation (including breach notifications), NIS2 competent authority reporting (incident warnings), law enforcement cooperation, and industry information sharing. Maintain current contact lists and communication templates',
          'm) Incident response governance - Designate incident response manager plus backup (review annually). Establish 24/7 contact information for incident reporting. Define incident classification with clear thresholds for: significant incidents (NIS2), high risk breaches (GDPR)',
          'n) Third party governance - ALL service provider contracts MUST include: security, incident notification (specify timeframes), audit rights, data protection clauses, termination procedures with data return/destruction, and verification. Monitor providers monthly and conduct annual security reviews',
          'o) Continuous improvement - Implement formal processes for: learning from incidents, updating policies based on new threats, addressing audit findings within 30 days, tracking security metrics, and demonstrating year over year improvement'
        ]
      },
      
      // Implementation guidance for each section
      implementationGuidance: {
        'Leadership': 'Focus on establishing strong governance foundation with leadership commitment, policy framework, and organizational structure. These requirements form the core of any effective information security program.',
        'HR': 'Concentrate on the two critical people-related requirements: ensuring personnel are properly vetted and trained for their security responsibilities.',
        'Monitoring & Compliance': 'Implement the three essential oversight functions: monitoring system performance, conducting internal audits, and driving continuous improvement.'
      }
    };
  }

  /**
   * Check if a category should use the corrected governance structure
   */
  static isGovernanceCategory(categoryName: string): boolean {
    return categoryName.toLowerCase().includes('governance') || 
           categoryName.toLowerCase().includes('leadership') ||
           categoryName.toLowerCase().includes('security governance');
  }

  /**
   * Get the sections in the correct order
   */
  static getSectionOrder(): string[] {
    return ['Leadership', 'HR', 'Monitoring & Compliance'];
  }

  /**
   * Validate that the structure follows user requirements
   */
  static validateStructure(): { valid: boolean; errors: string[] } {
    const structure = this.getCorrectedStructure();
    const errors: string[] = [];

    // Check first requirement is a) Leadership commitment
    const leadershipReqs = structure.sections['Leadership'];
    if (!leadershipReqs || !leadershipReqs[0]?.includes('a) Leadership commitment')) {
      errors.push('First requirement must be a) Leadership commitment');
    }

    // Check HR has 2 requirements
    if (structure.sections['HR']?.length !== 2) {
      errors.push(`HR section must have exactly 2 requirements, found ${structure.sections['HR']?.length}`);
    }

    // Check Monitoring & Compliance has 6 requirements
    if (structure.sections['Monitoring & Compliance']?.length !== 6) {
      errors.push(`Monitoring & Compliance section must have exactly 6 requirements, found ${structure.sections['Monitoring & Compliance']?.length}`);
    }

    // Check proper a, b, c ordering
    const allReqs = [
      ...(leadershipReqs || []),
      ...(structure.sections['HR'] || []),
      ...(structure.sections['Monitoring & Compliance'] || [])
    ];

    const expectedLetters = 'abcdefghijklmno'.split('');
    for (let i = 0; i < allReqs.length; i++) {
      if (!allReqs[i]?.startsWith(`${expectedLetters[i]})`)) {
        errors.push(`Requirement ${i + 1} should start with "${expectedLetters[i]})" but starts with "${allReqs[i]?.substring(0, 3)}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}