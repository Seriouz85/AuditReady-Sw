/**
 * Unified Guidance Template Service
 * Creates standardized, professional guidance for all 22 compliance categories
 * Eliminates inconsistencies and ensures professional tone throughout
 */

export interface CategoryTemplate {
  category: string;
  requirementStructure: string; // Pattern for sub-requirements (a-p, a-k, etc.)
  focusAreas: string[];
  professionalContext: string;
  implementationComplexity: 'basic' | 'intermediate' | 'advanced';
  regulatoryPriority: 'critical' | 'high' | 'standard';
}

export class UnifiedGuidanceTemplate {
  
  /**
   * Standard template for all categories - ensures consistency
   */
  private static getStandardTemplate(): string {
    return `🎯 OPERATIONAL EXCELLENCE INDICATORS

Your Compliance Scorecard - Track these metrics to demonstrate audit readiness

✅ FOUNDATIONAL CONTROLS

✅ **Policy Documentation** - Comprehensive policies covering all requirement areas with management approval and annual reviews
✅ **Process Implementation** - Documented and implemented procedures for all security processes with version control
✅ **Resource Allocation** - Adequate resources assigned to implementation with budget tracking and year-over-year analysis
✅ **Training Programs** - Staff training on relevant requirements with completion tracking and effectiveness measurement

✅ ADVANCED CONTROLS

✅ **Continuous Monitoring** - Automated monitoring where applicable with real-time dashboards and alerting
✅ **Regular Reviews** - Periodic assessment and improvement with quarterly management reviews and annual internal audits
✅ **Integration** - Integration with other business processes including project management and change control
✅ **Metrics and KPIs** - Measurable performance indicators tied to business objectives and executive accountability

✅ AUDIT-READY DOCUMENTATION

✅ **Evidence Collection** - Systematic evidence gathering with centralized repository and retention policies
✅ **Compliance Records** - Complete audit trails with timestamped logs and version-controlled documentation
✅ **Gap Analysis** - Regular assessment against requirements with remediation tracking and progress reporting
✅ **Corrective Actions** - Documented remediation activities with ownership, timelines, and effectiveness validation

💡 PRO TIP: Phase implementation over 6-12 months: Start with foundational controls, then advance to sophisticated monitoring and continuous improvement processes. Key success metrics include documented procedures, regular management reviews, comprehensive evidence collection, and measurable year-over-year program maturation.`;
  }

  /**
   * All 22 category templates with professional structure
   */
  private static getCategoryTemplates(): Record<string, CategoryTemplate> {
    return {
      'Asset Management': {
        category: 'Asset Management',
        requirementStructure: 'a-m', // 13 requirements
        focusAreas: ['Hardware inventory', 'Software inventory', 'Asset lifecycle', 'Configuration management', 'Asset ownership', 'Asset disposal'],
        professionalContext: 'Systematic management of information assets throughout their lifecycle',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Access Control & Identity Management': {
        category: 'Access Control & Identity Management',
        requirementStructure: 'a-n', // 14 requirements  
        focusAreas: ['User provisioning', 'Authentication', 'Authorization', 'Privileged access', 'Access reviews', 'Identity lifecycle'],
        professionalContext: 'Comprehensive identity and access management controls',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Network Security & Defense': {
        category: 'Network Security & Defense',
        requirementStructure: 'a-l', // 12 requirements
        focusAreas: ['Network segmentation', 'Firewall management', 'Intrusion detection', 'Network monitoring', 'Wireless security', 'Network architecture'],
        professionalContext: 'Defense-in-depth network security architecture and controls',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Data Protection & Privacy': {
        category: 'Data Protection & Privacy',
        requirementStructure: 'a-p', // 16 requirements
        focusAreas: ['Data classification', 'Data encryption', 'Privacy controls', 'Data retention', 'Data loss prevention', 'Cross-border transfers'],
        professionalContext: 'Comprehensive data protection and privacy management',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Vulnerability Management': {
        category: 'Vulnerability Management',
        requirementStructure: 'a-j', // 10 requirements
        focusAreas: ['Vulnerability assessment', 'Patch management', 'Security testing', 'Threat intelligence', 'Vulnerability tracking', 'Risk prioritization'],
        professionalContext: 'Systematic identification and remediation of security vulnerabilities',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Incident Response & Recovery': {
        category: 'Incident Response & Recovery',
        requirementStructure: 'a-m', // 13 requirements
        focusAreas: ['Incident detection', 'Response procedures', 'Communication protocols', 'Forensic capability', 'Recovery planning', 'Lessons learned'],
        professionalContext: 'Comprehensive incident response and business recovery capabilities',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Governance & Leadership': {
        category: 'Governance & Leadership',
        requirementStructure: 'a-p', // 16 requirements
        focusAreas: ['Leadership commitment', 'Policy framework', 'Organizational structure', 'Resource allocation', 'Performance measurement', 'Continuous improvement'],
        professionalContext: 'Executive-level governance and strategic security management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'critical'
      },
      'Risk Management': {
        category: 'Risk Management',
        requirementStructure: 'a-k', // 11 requirements
        focusAreas: ['Risk assessment', 'Risk treatment', 'Risk monitoring', 'Risk communication', 'Risk appetite', 'Risk integration'],
        professionalContext: 'Enterprise-wide information security risk management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'critical'
      },
      'Training & Awareness': {
        category: 'Training & Awareness',
        requirementStructure: 'a-i', // 9 requirements
        focusAreas: ['Security awareness', 'Role-based training', 'Training effectiveness', 'Communication programs', 'Behavioral change', 'Training records'],
        professionalContext: 'Comprehensive security awareness and training programs',
        implementationComplexity: 'basic',
        regulatoryPriority: 'high'
      },
      'Physical Security': {
        category: 'Physical Security',
        requirementStructure: 'a-j', // 10 requirements
        focusAreas: ['Facility security', 'Access control', 'Environmental protection', 'Equipment security', 'Clear desk policy', 'Disposal security'],
        professionalContext: 'Physical and environmental security controls',
        implementationComplexity: 'basic',
        regulatoryPriority: 'standard'
      },
      'Supplier & Third Party Management': {
        category: 'Supplier & Third Party Management',
        requirementStructure: 'a-m', // 13 requirements
        focusAreas: ['Supplier assessment', 'Contract security', 'Service monitoring', 'Supply chain risk', 'Data processing agreements', 'Vendor management'],
        professionalContext: 'Third-party risk management and supplier security controls',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Business Continuity & Resilience': {
        category: 'Business Continuity & Resilience',
        requirementStructure: 'a-k', // 11 requirements
        focusAreas: ['Business continuity planning', 'Disaster recovery', 'Backup procedures', 'Resilience testing', 'Recovery objectives', 'Emergency response'],
        professionalContext: 'Business continuity and operational resilience management',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Compliance & Legal': {
        category: 'Compliance & Legal',
        requirementStructure: 'a-i', // 9 requirements
        focusAreas: ['Regulatory compliance', 'Legal requirements', 'Compliance monitoring', 'Reporting obligations', 'Privacy rights', 'Intellectual property'],
        professionalContext: 'Legal and regulatory compliance management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'critical'
      },
      'Audit Log Management': {
        category: 'Audit Log Management',
        requirementStructure: 'a-l', // 12 requirements
        focusAreas: ['Log collection', 'Log analysis', 'Log retention', 'Log protection', 'Event correlation', 'Audit trails'],
        professionalContext: 'Comprehensive audit logging and monitoring systems',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Communication Security': {
        category: 'Communication Security',
        requirementStructure: 'a-j', // 10 requirements
        focusAreas: ['Secure protocols', 'Email security', 'Network communications', 'Message authentication', 'Communication encryption', 'Secure channels'],
        professionalContext: 'Secure communications and network protocol management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'System Development & Maintenance': {
        category: 'System Development & Maintenance',
        requirementStructure: 'a-n', // 14 requirements
        focusAreas: ['Secure development', 'Code review', 'System testing', 'Change management', 'Development standards', 'Security integration'],
        professionalContext: 'Secure system development lifecycle and maintenance procedures',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'high'
      },
      'Operational Security': {
        category: 'Operational Security',
        requirementStructure: 'a-k', // 11 requirements
        focusAreas: ['Operational procedures', 'System administration', 'Capacity management', 'Performance monitoring', 'Error handling', 'Operational controls'],
        professionalContext: 'Day-to-day operational security procedures and controls',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Cloud Security': {
        category: 'Cloud Security',
        requirementStructure: 'a-m', // 13 requirements
        focusAreas: ['Cloud governance', 'Service security', 'Data residency', 'Cloud monitoring', 'Multi-tenancy', 'Cloud architecture'],
        professionalContext: 'Cloud service security and management controls',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'high'
      },
      'Mobile & Remote Access': {
        category: 'Mobile & Remote Access',
        requirementStructure: 'a-j', // 10 requirements
        focusAreas: ['Mobile device management', 'Remote access controls', 'BYOD policies', 'VPN security', 'Mobile applications', 'Endpoint protection'],
        professionalContext: 'Mobile device and remote access security management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      },
      'Cryptography & Encryption': {
        category: 'Cryptography & Encryption',
        requirementStructure: 'a-l', // 12 requirements
        focusAreas: ['Encryption standards', 'Key management', 'Cryptographic controls', 'Digital signatures', 'Certificate management', 'Encryption policies'],
        professionalContext: 'Cryptographic controls and key management systems',
        implementationComplexity: 'advanced',
        regulatoryPriority: 'critical'
      },
      'Malware Protection': {
        category: 'Malware Protection',
        requirementStructure: 'a-i', // 9 requirements
        focusAreas: ['Anti-malware solutions', 'Threat detection', 'Endpoint protection', 'Malware prevention', 'Incident response', 'Protection updates'],
        professionalContext: 'Anti-malware and endpoint protection systems',
        implementationComplexity: 'basic',
        regulatoryPriority: 'high'
      },
      'Configuration Management': {
        category: 'Configuration Management',
        requirementStructure: 'a-k', // 11 requirements
        focusAreas: ['Security baselines', 'Configuration control', 'Change tracking', 'Hardening standards', 'Configuration monitoring', 'Compliance verification'],
        professionalContext: 'System and security configuration management',
        implementationComplexity: 'intermediate',
        regulatoryPriority: 'high'
      }
    };
  }

  /**
   * Generate professional guidance content for any category
   */
  static generateGuidanceContent(
    categoryName: string, 
    actualRequirements: string[], // From database/mapping
    frameworkReferences: any[]
  ): string {
    const template = this.getCategoryTemplates()[categoryName];
    if (!template) {
      return this.generateFallbackContent(categoryName, actualRequirements);
    }

    // Build professional content based on actual requirements
    let content = this.buildRequirementExplanations(actualRequirements, template);
    content += '\n\n' + this.getStandardTemplate();
    
    return content;
  }

  /**
   * Build professional explanations for each requirement
   */
  private static buildRequirementExplanations(
    requirements: string[],
    template: CategoryTemplate
  ): string {
    const explanations: string[] = [];

    requirements.forEach((requirement, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      const cleanReq = requirement.replace(/^[a-z]\)\s*/, '').trim();
      
      // Professional explanation without childish examples
      const explanation = this.generateProfessionalExplanation(cleanReq, template.professionalContext);
      explanations.push(`**${letter}) ${cleanReq}**\n${explanation}`);
    });

    return explanations.join('\n\n');
  }

  /**
   * Generate professional, business-focused explanations
   */
  private static generateProfessionalExplanation(requirement: string, context: string): string {
    // Create professional explanations based on requirement content
    const cleanReq = requirement.toLowerCase().trim();
    
    // Professional explanations without childish examples
    if (cleanReq.includes('policy') || cleanReq.includes('policies')) {
      return `This requirement establishes the policy framework for ${context}. Organizations must develop comprehensive written policies that define responsibilities, procedures, and standards. Policies require management approval, regular review cycles, and effective communication to all relevant personnel. Implementation includes policy development, approval workflows, distribution mechanisms, and compliance monitoring.`;
    }
    
    if (cleanReq.includes('risk') || cleanReq.includes('assessment')) {
      return `This requirement addresses systematic risk identification and assessment within ${context}. Organizations must implement structured methodologies to identify, analyze, and evaluate risks. This includes establishing risk criteria, conducting regular assessments, documenting findings, and implementing appropriate risk treatment measures. Risk management processes require ongoing monitoring and periodic review.`;
    }
    
    if (cleanReq.includes('incident') || cleanReq.includes('response')) {
      return `This requirement establishes incident management capabilities for ${context}. Organizations must develop incident response procedures, assign responsibilities, and ensure appropriate escalation mechanisms. This includes incident detection, classification, response coordination, communication protocols, and post-incident review processes. Regular testing and training ensure effectiveness.`;
    }
    
    if (cleanReq.includes('access') || cleanReq.includes('control')) {
      return `This requirement implements access control measures within ${context}. Organizations must establish systematic approaches to manage user access, including provisioning, modification, and deprovisioning procedures. This encompasses authentication mechanisms, authorization controls, privilege management, and regular access reviews to ensure principle of least privilege.`;
    }
    
    if (cleanReq.includes('training') || cleanReq.includes('awareness')) {
      return `This requirement establishes training and awareness programs for ${context}. Organizations must develop role-specific training curricula, delivery mechanisms, and effectiveness measurement. This includes initial training for new personnel, ongoing awareness activities, specialized training for security roles, and regular updates based on emerging threats and regulatory changes.`;
    }
    
    if (cleanReq.includes('monitoring') || cleanReq.includes('logging')) {
      return `This requirement implements monitoring and logging capabilities for ${context}. Organizations must establish comprehensive monitoring systems, define logging requirements, and implement analysis procedures. This includes log collection, retention policies, security monitoring, incident detection, and regular review of monitoring effectiveness.`;
    }
    
    // Default professional explanation
    return `This requirement addresses ${cleanReq} within ${context}. Organizations must establish documented procedures, implement appropriate controls, and ensure ongoing compliance through regular monitoring and assessment. Implementation requires resource allocation, staff training, and integration with existing business processes to achieve sustained effectiveness.`;
  }

  /**
   * Fallback content for categories without templates
   */
  private static generateFallbackContent(categoryName: string, requirements: string[]): string {
    let content = `This category encompasses ${requirements.length} key requirements for ${categoryName}:\n\n`;
    
    requirements.forEach((req, index) => {
      const letter = String.fromCharCode(97 + index);
      content += `**${letter}) ${req}**\nImplementation guidance pending - professional content will be added.\n\n`;
    });
    
    content += this.getStandardTemplate();
    return content;
  }
}