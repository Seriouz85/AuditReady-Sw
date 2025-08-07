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
        
        // SECTION 1: Leadership (most requirements go here)
        'Leadership': [
          'a) ISMS (Information Security Management System) - Establish and maintain a systematic approach to managing information security risks, policies, and procedures across the organization',
          'b) Scope and boundaries - Define the boundaries and applicability of the information security management system, including internal and external issues',
          'c) Leadership commitment and responsibility - Top management must demonstrate leadership and commitment with respect to the information security management system',
          'd) Information security policy framework - Develop, approve, communicate, and regularly review comprehensive information security policies aligned with business objectives',
          'e) Organizational roles and responsibilities - Define and assign clear information security roles, responsibilities, and authorities throughout the organization',
          'f) Resource allocation and management - Ensure adequate resources are provided for establishing, implementing, maintaining and continually improving the ISMS',
          'g) Strategic planning and alignment - Align information security objectives with business strategy and ensure security planning supports organizational goals',
          'h) Risk appetite and tolerance - Define and communicate the organization\'s risk appetite and tolerance levels for information security risks',
          'i) Governance structure and oversight - Establish appropriate governance structures with clear oversight responsibilities for information security',
          'j) Segregation of duties - Implement proper segregation of conflicting duties and areas of responsibility to reduce risk of misuse',
          'k) Management review and decision-making - Conduct regular management reviews of the ISMS performance and make strategic decisions for improvement'
        ],
        
        // SECTION 2: HR (ONLY 2 requirements as requested)
        'HR': [
          'l) Personnel Security Framework - Implement comprehensive background verification, screening procedures, security clearance processes, disciplinary action procedures, and detailed termination protocols. Include pre-employment screening (criminal background, employment verification, reference checks), ongoing monitoring for security violations, progressive disciplinary measures (verbal warning, written warning, suspension, termination), immediate termination procedures for security breaches, security clearance revocation processes, post-employment obligations (confidentiality agreements, non-disclosure enforcement), asset recovery procedures, and access revocation protocols',
          'm) Competence Management - Ensure personnel have appropriate competence, awareness, and training for their information security responsibilities'
        ],
        
        // SECTION 3: Monitoring & Compliance (ONLY 3 requirements as requested) 
        'Monitoring & Compliance': [
          'n) Monitoring, measurement, analysis and evaluation - Establish processes to monitor, measure, analyze and evaluate the performance and effectiveness of the ISMS',
          'o) Internal audit and compliance verification - Conduct planned internal audits to verify ISMS conformity and effective implementation',
          'p) Continual improvement and corrective actions - Implement processes for continual improvement including corrective actions and management of nonconformities'
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

    // Check first 2 requirements are a) ISMS and b) Scope and boundaries
    const leadershipReqs = structure.sections['Leadership'];
    if (!leadershipReqs[0]?.includes('a) ISMS')) {
      errors.push('First requirement must be a) ISMS');
    }
    if (!leadershipReqs[1]?.includes('b) Scope and boundaries')) {
      errors.push('Second requirement must be b) Scope and boundaries');
    }

    // Check HR has only 2 requirements
    if (structure.sections['HR']?.length !== 2) {
      errors.push(`HR section must have exactly 2 requirements, found ${structure.sections['HR']?.length}`);
    }

    // Check Monitoring & Compliance has only 3 requirements
    if (structure.sections['Monitoring & Compliance']?.length !== 3) {
      errors.push(`Monitoring & Compliance section must have exactly 3 requirements, found ${structure.sections['Monitoring & Compliance']?.length}`);
    }

    // Check proper a, b, c ordering
    const allReqs = [
      ...leadershipReqs,
      ...structure.sections['HR'],
      ...structure.sections['Monitoring & Compliance']
    ];

    const expectedLetters = 'abcdefghijklmnop'.split('');
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