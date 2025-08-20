/**
 * CORRECTED GOVERNANCE & LEADERSHIP UNIFIED REQUIREMENT STRUCTURE
 * 
 * This file contains the properly organized Governance & Leadership structure
 * as requested by the user with:
 * - Proper a, b, c, d ordering for all requirements
 * - Three sections in exact order: Leadership, HR (2 items), Monitoring & Compliance (3 items)
 * - First 2 requirements: a) ISMS, b) Scope and boundaries
 */

export const correctedGovernanceStructure = {
  title: 'Governance & Leadership Requirements',
  description: 'Unified requirements for governance and leadership controls with proper organizational structure',
  
  // Properly organized sections with a, b, c, d ordering
  sections: {
    
    // SECTION 1: Leadership (most requirements go here)
    'Leadership': [
      'a) ISMS (Information Security Management System) - Establish and maintain a systematic approach to managing information security risks, policies, and procedures across the organization',
      'b) Scope and boundaries - Define the boundaries and applicability of the information security management system, including internal and external issues and the context of the organization',
      'c) Leadership commitment and responsibility - Top management must demonstrate leadership and commitment with respect to the information security management system',
      'd) Information security policy framework - Develop, approve, communicate, and regularly review comprehensive information security policies aligned with business objectives',
      'e) Organizational roles and responsibilities - Define and assign clear information security roles, responsibilities, and authorities throughout the organization',
      'f) Resource allocation and management - Ensure adequate resources are provided for establishing, implementing, maintaining and continually improving the ISMS',
      'g) Strategic planning and alignment - Align information security objectives with business strategy and ensure security planning supports organizational goals',
      'h) Risk appetite and tolerance - Define and communicate the organization\'s risk appetite, tolerance levels, and risk treatment criteria for information security risks',
      'i) Governance structure and oversight - Establish appropriate governance structures with clear oversight responsibilities for information security',
      'j) Segregation of duties - Implement proper segregation of conflicting duties and areas of responsibility to reduce risk of misuse',
      'k) Management review and decision-making - Conduct regular management reviews of the ISMS performance and make strategic decisions for improvement'
    ],
    
    // SECTION 2: HR (ONLY 2 requirements as requested)
    'HR': [
      'l) Personnel Security Framework - Implement comprehensive background verification, screening procedures, ongoing monitoring, and security clearance processes for personnel',
      'm) Competence Management - Ensure personnel have appropriate competence, awareness, and training for their information security responsibilities'
    ],
    
    // SECTION 3: Monitoring & Compliance (ONLY 3 requirements as requested) 
    'Monitoring & Compliance': [
      'n) Monitoring, measurement, analysis and evaluation - Establish processes to monitor, measure, analyze and evaluate the performance and effectiveness of the ISMS using defined KPIs and security metrics',
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

export default correctedGovernanceStructure;