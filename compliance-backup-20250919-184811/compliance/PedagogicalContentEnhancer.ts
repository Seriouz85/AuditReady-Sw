/**
 * Pedagogical Content Enhancer
 * Transforms basic compliance requirements into detailed, implementation-focused guidance
 * with HOW-TO instructions, timelines, metrics, examples, and best practices
 */

export interface EnhancedRequirement {
  letter: string;
  title: string;
  overview: string;
  howToImplement: string[];
  timeline: string;
  metrics: string[];
  tools: string[];
  examples: string[];
  commonPitfalls: string[];
  bestPractices: string[];
}

export class PedagogicalContentEnhancer {
  
  /**
   * Enhance basic requirement text into comprehensive pedagogical guidance
   */
  static enhanceRequirement(
    basicText: string, 
    category: string, 
    index: number
  ): EnhancedRequirement {
    const letter = String.fromCharCode(97 + index); // a, b, c, etc.
    const baseTitle = this.extractTitle(basicText);
    
    // Generate enhanced content based on category and requirement content
    const enhancement = this.generateEnhancement(basicText, category, baseTitle);
    
    return {
      letter: `${letter})`,
      title: enhancement.title,
      overview: enhancement.overview,
      howToImplement: enhancement.howToImplement,
      timeline: enhancement.timeline,
      metrics: enhancement.metrics,
      tools: enhancement.tools,
      examples: enhancement.examples,
      commonPitfalls: enhancement.commonPitfalls,
      bestPractices: enhancement.bestPractices
    };
  }

  /**
   * Extract title from basic requirement text
   */
  private static extractTitle(text: string): string {
    // Extract title from patterns like "Data classification with 4-tier model"
    const titleMatch = text.match(/^([^:\.]+)(?:[:\.]\s*|$)/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Fallback: take first few words
    const words = text.split(/\s+/).slice(0, 5);
    return words.join(' ');
  }

  /**
   * Generate comprehensive enhancement based on requirement content and category
   */
  private static generateEnhancement(
    basicText: string, 
    category: string, 
    baseTitle: string
  ): Omit<EnhancedRequirement, 'letter'> {
    
    // Category-specific enhancements
    if (category.includes('Data Protection')) {
      return this.enhanceDataProtectionRequirement(basicText, baseTitle);
    }
    
    if (category.includes('Access Control')) {
      return this.enhanceAccessControlRequirement(basicText, baseTitle);
    }
    
    if (category.includes('Incident Response')) {
      return this.enhanceIncidentResponseRequirement(basicText, baseTitle);
    }
    
    if (category.includes('Risk Management')) {
      return this.enhanceRiskManagementRequirement(basicText, baseTitle);
    }
    
    if (category.includes('Governance')) {
      return this.enhanceGovernanceRequirement(basicText, baseTitle);
    }
    
    if (category.includes('Network Security')) {
      return this.enhanceNetworkSecurityRequirement(basicText, baseTitle);
    }
    
    // Generic enhancement for other categories
    return this.enhanceGenericRequirement(basicText, baseTitle);
  }

  /**
   * Enhance Data Protection requirements
   */
  private static enhanceDataProtectionRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    if (basicText.toLowerCase().includes('classification')) {
      return {
        title: 'Data Classification with Automated Discovery & Labeling',
        overview: 'Implement a comprehensive 4-tier data classification system with automated discovery tools to identify, label, and protect sensitive information across all systems and storage locations.',
        howToImplement: [
          '1. **Define Classification Schema**: Create 4 tiers - Public (no restrictions), Internal Use (employee access only), Confidential (authorized personnel only), Restricted (strictly controlled access)',
          '2. **Deploy Automated Discovery Tools**: Install data discovery software that scans all repositories, databases, file shares, and cloud storage to identify sensitive data patterns',
          '3. **Configure Classification Rules**: Set up automated classification rules based on data patterns, keywords, regular expressions, and machine learning models',
          '4. **Apply Persistent Labels**: Implement labeling that follows data through its lifecycle - visual markings on documents, metadata tags in databases, headers in emails',
          '5. **Integrate with Security Controls**: Connect classification labels to DLP policies, access controls, encryption systems, and backup procedures',
          '6. **Train Users on Classification**: Provide comprehensive training on how to classify new data, when to escalate decisions, and how to handle each classification level'
        ],
        timeline: 'Phase 1 (Month 1): Schema definition and tool selection. Phase 2 (Months 2-4): Tool deployment and automated discovery. Phase 3 (Months 5-6): User training and policy integration. Ongoing: Quarterly reviews and updates.',
        metrics: [
          'Data discovery coverage: Target 95% of all data repositories within 6 months',
          'Classification accuracy: Achieve 90% accurate auto-classification with monthly quality reviews',
          'Policy violations: Reduce unauthorized data sharing by 80% within 3 months of implementation',
          'User compliance: 100% of employees complete classification training annually',
          'Label consistency: 95% of documents properly labeled within 30 days of creation'
        ],
        tools: [
          'Microsoft Purview (comprehensive data governance)',
          'Varonis Data Security Platform (data discovery and classification)',
          'Spirion (sensitive data discovery)',
          'Forcepoint DLP (data loss prevention integration)',
          'BigID (privacy and data intelligence)',
          'Symantec Data Loss Prevention (content awareness)',
          'Digital Guardian (data protection platform)'
        ],
        examples: [
          '**Financial Services**: Customer account numbers auto-classified as Confidential, transaction data as Internal Use, public rate sheets as Public',
          '**Healthcare**: Patient records auto-detected and classified as Restricted, research data as Confidential, published studies as Public',
          '**Manufacturing**: Product blueprints classified as Restricted, employee handbooks as Internal Use, press releases as Public',
          '**Retail**: Customer payment data as Restricted, inventory reports as Confidential, store locations as Public'
        ],
        commonPitfalls: [
          '**Over-classification**: Classifying too much data as high-sensitivity creates user friction and reduces compliance',
          '**Inconsistent labeling**: Different departments using different classification schemes leads to confusion',
          '**Missing legacy data**: Focusing only on new data while ignoring existing unclassified information',
          '**No user training**: Technical implementation without proper user education results in poor adoption',
          '**Static classifications**: Not updating classifications when data sensitivity changes over time'
        ],
        bestPractices: [
          'Start with a pilot program in one department to refine the classification process before company-wide rollout',
          'Use data sampling and statistical analysis to validate automated classification accuracy before full deployment',
          'Create clear escalation procedures for borderline classification decisions',
          'Implement regular data classification audits with both automated and manual verification',
          'Establish data steward roles to maintain classification quality and resolve disputes',
          'Integrate classification into existing business processes rather than creating separate workflows'
        ]
      };
    }
    
    // Default data protection enhancement
    return {
      title: baseTitle,
      overview: 'Implement comprehensive data protection measures to ensure confidentiality, integrity, and availability of sensitive information.',
      howToImplement: [
        '1. Assess current data protection posture and identify gaps',
        '2. Implement technical controls based on data sensitivity',
        '3. Establish procedural safeguards and user training',
        '4. Deploy monitoring and compliance verification'
      ],
      timeline: 'Implementation over 3-6 months with ongoing monitoring and annual reviews.',
      metrics: ['Data protection incidents reduced by 70%', '100% sensitive data encrypted', '90% user training completion'],
      tools: ['Data loss prevention tools', 'Encryption solutions', 'Access control systems'],
      examples: ['Industry-specific data protection implementations'],
      commonPitfalls: ['Inadequate user training', 'Inconsistent policy enforcement'],
      bestPractices: ['Regular audits', 'Layered security approach', 'Clear incident response procedures']
    };
  }

  /**
   * Enhance Access Control requirements
   */
  private static enhanceAccessControlRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    if (basicText.toLowerCase().includes('multi-factor') || basicText.toLowerCase().includes('mfa')) {
      return {
        title: 'Multi-Factor Authentication (MFA) with Universal Coverage',
        overview: 'Deploy comprehensive MFA across all privileged accounts, remote access, and sensitive system access using multiple authentication factors with automated enrollment and monitoring.',
        howToImplement: [
          '1. **Inventory All Access Points**: Catalog all systems requiring authentication - VPN, email, cloud services, administrative accounts, business applications',
          '2. **Choose Authentication Methods**: Implement "something you know" (password/PIN), "something you have" (phone/token/smart card), "something you are" (fingerprint/face recognition)',
          '3. **Deploy MFA Solution**: Install enterprise MFA platform supporting SAML, RADIUS, and API integration with existing systems',
          '4. **Prioritize Critical Systems**: Start with privileged accounts, then remote access, followed by business-critical applications',
          '5. **Configure Adaptive Authentication**: Set up risk-based authentication that adjusts MFA requirements based on user behavior, location, and device trust',
          '6. **Establish Backup Procedures**: Provide backup authentication methods for users who lose primary devices'
        ],
        timeline: 'Week 1: Privileged accounts and remote access. Month 1: Business-critical systems. Month 2: All user accounts. Month 3: Fine-tuning and optimization.',
        metrics: [
          'MFA coverage: 100% privileged accounts within 1 week, 100% remote access within 2 weeks',
          'Account compromises: Reduce by 99% compared to password-only authentication',
          'User enrollment: Complete MFA registration within 48 hours of account creation',
          'Authentication success rate: Maintain 95% first-attempt success rate',
          'Helpdesk tickets: Limit MFA-related tickets to <5% of total authentication support'
        ],
        tools: [
          'Microsoft Authenticator (enterprise integration)',
          'Duo Security (comprehensive MFA platform)',
          'RSA SecurID (hardware tokens and software)',
          'Okta Verify (cloud-based authentication)',
          'Google Authenticator (TOTP standard)',
          'YubiKey (hardware security keys)',
          'Azure AD Multi-Factor Authentication (cloud-native)',
          'Cisco Duo (adaptive authentication)'
        ],
        examples: [
          '**Finance Firm**: Hardware tokens for traders, mobile apps for analysts, biometrics for executives accessing trading systems',
          '**Healthcare System**: Smart cards for clinical staff, mobile push for administrators, voice recognition for physicians',
          '**Tech Company**: Hardware keys for developers, mobile apps for employees, conditional access for contractors',
          '**Government Agency**: PIV cards for employees, RSA tokens for contractors, biometrics for facility access'
        ],
        commonPitfalls: [
          '**Poor user experience**: Overly complex authentication flows reduce productivity and increase shadow IT usage',
          '**Single point of failure**: Relying on one MFA method without backup options locks out users when devices fail',
          '**Inadequate backup procedures**: Not providing alternative authentication methods for lost or broken devices',
          '**Inconsistent enforcement**: Applying MFA to some systems but not others creates security gaps',
          '**Lack of user training**: Users bypass or disable MFA when they don\'t understand its importance'
        ],
        bestPractices: [
          'Use risk-based authentication to reduce MFA prompts for trusted devices and locations',
          'Provide multiple MFA options to accommodate different user preferences and technical constraints',
          'Implement gradual rollout with pilot groups to identify and resolve issues before full deployment',
          'Create clear MFA policies defining when and how authentication is required',
          'Establish 24/7 support procedures for MFA-related issues to minimize business disruption',
          'Regularly audit MFA effectiveness and update methods based on emerging threats and technologies'
        ]
      };
    }
    
    // Default access control enhancement
    return {
      title: baseTitle,
      overview: 'Implement robust access control mechanisms to ensure only authorized users can access sensitive systems and data.',
      howToImplement: [
        '1. Define access control policies based on business requirements',
        '2. Implement technical controls and authentication mechanisms',
        '3. Establish user provisioning and deprovisioning procedures',
        '4. Deploy monitoring and audit capabilities'
      ],
      timeline: 'Implementation over 2-4 months with ongoing access reviews and updates.',
      metrics: ['Unauthorized access attempts reduced by 90%', '100% user accounts properly provisioned', 'Quarterly access reviews completed'],
      tools: ['Identity management systems', 'Access control platforms', 'Audit and monitoring tools'],
      examples: ['Role-based access control implementations', 'Privileged access management systems'],
      commonPitfalls: ['Overprivileged accounts', 'Stale user accounts', 'Inadequate monitoring'],
      bestPractices: ['Principle of least privilege', 'Regular access reviews', 'Automated provisioning workflows']
    };
  }

  /**
   * Enhance Incident Response requirements
   */
  private static enhanceIncidentResponseRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    if (basicText.toLowerCase().includes('immediate') || basicText.toLowerCase().includes('response')) {
      return {
        title: 'Immediate Incident Response with Regulatory Compliance',
        overview: 'Establish rapid incident response capabilities meeting GDPR 72-hour and NIS2 24-hour notification requirements with documented procedures, trained personnel, and automated workflows.',
        howToImplement: [
          '1. **Establish Response Team**: Create 24/7 incident response team with defined roles - Incident Commander, Technical Lead, Communications Manager, Legal Counsel, Business Continuity',
          '2. **Define Detection Capabilities**: Deploy SIEM/SOAR platforms with automated alerting, threat hunting capabilities, and integration with security tools',
          '3. **Create Response Procedures**: Document step-by-step procedures for containment, eradication, recovery, and communication with internal and external stakeholders',
          '4. **Prepare Notification Templates**: Create pre-approved templates for GDPR breach notifications, NIS2 incident reports, customer communications, and media statements',
          '5. **Implement Communication Workflows**: Establish escalation matrices, contact lists, secure communication channels, and decision-making authorities',
          '6. **Deploy Forensic Capabilities**: Ensure ability to preserve evidence, conduct analysis, and maintain chain of custody for legal proceedings'
        ],
        timeline: 'Week 1: Team formation and basic procedures. Month 1: Full procedures and templates. Month 2: Training and first drill. Ongoing: Monthly drills and quarterly updates.',
        metrics: [
          'Response time: Activate incident response team within 30 minutes of detection',
          'Containment time: Initial containment actions within 1 hour of activation',
          'Notification compliance: 100% on-time regulatory notifications (24/72 hour requirements)',
          'Recovery time: Restore critical services within RTO objectives (typically 4-24 hours)',
          'Team readiness: 95% availability of primary response team members'
        ],
        tools: [
          'IBM QRadar SOAR (security orchestration and automated response)',
          'Splunk Phantom (incident response automation)',
          'ServiceNow Security Incident Response (workflow management)',
          'TheHive (open-source incident response platform)',
          'MISP (malware information sharing platform)',
          'Volatility (memory forensics framework)',
          'Wireshark (network traffic analysis)',
          'EnCase/FTK (digital forensics suites)'
        ],
        examples: [
          '**Ransomware Attack**: Immediate isolation of affected systems, activation of backup procedures, law enforcement notification, customer communication within 4 hours',
          '**Data Breach**: Forensic preservation, GDPR notification to authorities within 72 hours, affected individual notification within 7 days, legal review',
          '**Service Disruption**: NIS2 early warning within 24 hours, technical restoration, detailed report within 72 hours, lessons learned documentation',
          '**Insider Threat**: HR coordination, legal review, evidence preservation, access revocation, investigation procedures'
        ],
        commonPitfalls: [
          '**Delayed activation**: Waiting too long to activate incident response procedures misses critical notification deadlines',
          '**Poor communication**: Inconsistent messaging creates confusion and regulatory compliance issues',
          '**Evidence destruction**: Failing to preserve forensic evidence compromises investigation and legal proceedings',
          '**Inadequate training**: Untrained team members make critical errors under pressure',
          '**Missing documentation**: Inadequate incident documentation creates compliance gaps and prevents learning'
        ],
        bestPractices: [
          'Conduct monthly tabletop exercises and annual full-scale drills to maintain team readiness',
          'Establish relationships with external forensic firms, legal counsel, and PR agencies before incidents occur',
          'Create decision trees for common incident types to speed response and ensure consistency',
          'Implement automated evidence collection and preservation to reduce human error',
          'Maintain incident response "go bags" with necessary tools, contact information, and procedures',
          'Establish clear legal hold procedures to preserve relevant documents and communications'
        ]
      };
    }
    
    // Default incident response enhancement
    return {
      title: baseTitle,
      overview: 'Develop comprehensive incident response capabilities to quickly identify, contain, and recover from security incidents.',
      howToImplement: [
        '1. Establish incident response team and procedures',
        '2. Deploy detection and monitoring capabilities',
        '3. Create containment and recovery procedures',
        '4. Implement communication and reporting workflows'
      ],
      timeline: 'Initial setup within 1-2 months, with ongoing refinement through drills and real incidents.',
      metrics: ['Incident detection time reduced by 80%', 'Response team activation within 30 minutes', '100% regulatory notifications on time'],
      tools: ['SIEM platforms', 'Forensic tools', 'Communication systems'],
      examples: ['Ransomware response procedures', 'Data breach notification processes'],
      commonPitfalls: ['Untrained response teams', 'Inadequate communication procedures', 'Missing legal requirements'],
      bestPractices: ['Regular training and drills', 'Clear escalation procedures', 'Comprehensive documentation']
    };
  }

  /**
   * Enhance Risk Management requirements
   */
  private static enhanceRiskManagementRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    return {
      title: `Comprehensive ${baseTitle}`,
      overview: 'Implement systematic risk management approach combining quantitative analysis, regulatory compliance, and business-aligned risk treatment strategies.',
      howToImplement: [
        '1. **Risk Identification**: Conduct comprehensive risk assessments using asset inventories, threat modeling, and stakeholder interviews',
        '2. **Risk Analysis**: Apply both quantitative (ALE calculations) and qualitative (risk matrices) analysis methods',
        '3. **Risk Evaluation**: Establish risk criteria and thresholds aligned with organizational risk appetite',
        '4. **Risk Treatment**: Develop and implement risk mitigation strategies with defined timelines and ownership'
      ],
      timeline: 'Initial assessment: 1-2 months. Risk treatment implementation: 3-6 months. Ongoing: Quarterly reviews and annual updates.',
      metrics: [
        'Risk coverage: 100% of critical assets assessed annually',
        'Risk reduction: Achieve target risk levels within defined timelines',
        'Compliance rate: 95% of regulatory risk requirements met'
      ],
      tools: [
        'GRC platforms (ServiceNow, Archer, MetricStream)',
        'Risk assessment tools (FAIR, OCTAVE, NIST RMF)',
        'Quantitative analysis software (Monte Carlo simulation)'
      ],
      examples: [
        'Enterprise risk register with 200+ identified risks',
        'Quantitative cyber risk analysis using FAIR methodology',
        'Third-party risk assessment program'
      ],
      commonPitfalls: [
        'Risk assessments without business context',
        'Static risk registers not updated regularly',
        'Risk treatments without clear ownership or timelines'
      ],
      bestPractices: [
        'Align risk management with business objectives',
        'Use consistent risk scoring methodology',
        'Implement continuous risk monitoring',
        'Engage stakeholders throughout the process'
      ]
    };
  }

  /**
   * Enhance Governance requirements
   */
  private static enhanceGovernanceRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    return {
      title: `Strategic ${baseTitle}`,
      overview: 'Establish comprehensive governance framework with executive oversight, clear accountability, and measurable performance indicators.',
      howToImplement: [
        '1. **Governance Structure**: Establish board-level oversight with executive steering committees and operational working groups',
        '2. **Policy Framework**: Develop hierarchical policy structure with clear roles, responsibilities, and decision authorities',
        '3. **Performance Management**: Implement KPIs, metrics, and regular reporting to track governance effectiveness',
        '4. **Continuous Improvement**: Establish review cycles, audit procedures, and improvement processes'
      ],
      timeline: 'Governance structure: Month 1. Policy development: Months 2-3. Performance framework: Month 4. Ongoing: Quarterly reviews.',
      metrics: [
        'Policy compliance: 95% adherence to governance policies',
        'Executive engagement: 100% participation in governance reviews',
        'Audit findings: Reduce governance-related findings by 80%'
      ],
      tools: [
        'GRC platforms for policy management',
        'Dashboard and reporting tools',
        'Document management systems'
      ],
      examples: [
        'Board-level cybersecurity committee with quarterly reporting',
        'Information security governance charter with clear RACI',
        'Executive dashboard with key security metrics'
      ],
      commonPitfalls: [
        'Governance without executive buy-in',
        'Complex procedures that impede business operations',
        'Metrics that don\'t align with business objectives'
      ],
      bestPractices: [
        'Ensure visible executive leadership commitment',
        'Align governance with business strategy',
        'Implement proportionate governance controls',
        'Regular effectiveness reviews and adjustments'
      ]
    };
  }

  /**
   * Enhance Network Security requirements
   */
  private static enhanceNetworkSecurityRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    return {
      title: `Advanced ${baseTitle}`,
      overview: 'Implement comprehensive network security controls including segmentation, monitoring, and threat detection capabilities.',
      howToImplement: [
        '1. **Network Architecture**: Design segmented network with defense-in-depth principles',
        '2. **Security Controls**: Deploy firewalls, IPS/IDS, and network access control systems',
        '3. **Monitoring**: Implement network traffic analysis and behavioral monitoring',
        '4. **Incident Response**: Establish network-specific incident response procedures'
      ],
      timeline: 'Architecture design: Month 1. Control implementation: Months 2-4. Monitoring deployment: Month 3. Ongoing: Continuous monitoring.',
      metrics: [
        'Network segmentation: 100% critical systems properly segmented',
        'Threat detection: 95% of network threats detected within 1 hour',
        'Incident response: Network incidents contained within 2 hours'
      ],
      tools: [
        'Next-generation firewalls (Palo Alto, Fortinet, Check Point)',
        'Network monitoring tools (SolarWinds, PRTG, Nagios)',
        'IPS/IDS systems (Snort, Suricata, Cisco)'
      ],
      examples: [
        'Zero-trust network architecture implementation',
        'Micro-segmentation for critical applications',
        'AI-powered network threat detection'
      ],
      commonPitfalls: [
        'Flat network architecture without segmentation',
        'Inadequate network monitoring and logging',
        'Static security policies not adapted to threats'
      ],
      bestPractices: [
        'Implement zero-trust network principles',
        'Regular network security assessments',
        'Automated threat detection and response',
        'Comprehensive network documentation'
      ]
    };
  }

  /**
   * Generic enhancement for other categories
   */
  private static enhanceGenericRequirement(basicText: string, baseTitle: string): Omit<EnhancedRequirement, 'letter'> {
    return {
      title: baseTitle,
      overview: `Implement comprehensive ${baseTitle.toLowerCase()} controls to meet regulatory and business requirements.`,
      howToImplement: [
        '1. Assess current state and identify gaps',
        '2. Design appropriate controls and procedures',
        '3. Implement technical and administrative safeguards',
        '4. Establish monitoring and compliance verification'
      ],
      timeline: 'Assessment and design: Month 1. Implementation: Months 2-3. Ongoing: Regular reviews and updates.',
      metrics: [
        'Implementation completion: 100% of planned controls deployed',
        'Compliance rate: 95% adherence to requirements',
        'Effectiveness measure: Reduction in related incidents by 70%'
      ],
      tools: [
        'Industry-standard compliance tools',
        'Monitoring and reporting platforms',
        'Automated compliance checking systems'
      ],
      examples: [
        'Industry-specific implementation examples',
        'Best practice frameworks and standards',
        'Successful compliance program case studies'
      ],
      commonPitfalls: [
        'Insufficient planning and resource allocation',
        'Lack of stakeholder engagement and training',
        'Inadequate monitoring and maintenance'
      ],
      bestPractices: [
        'Align with business objectives and risk appetite',
        'Engage stakeholders throughout implementation',
        'Implement continuous monitoring and improvement',
        'Regular effectiveness reviews and updates'
      ]
    };
  }

  /**
   * Format enhanced requirement for display
   */
  static formatEnhancedRequirement(requirement: EnhancedRequirement): string {
    let formatted = `${requirement.letter} **${requirement.title}**\n\n`;
    formatted += `${requirement.overview}\n\n`;
    
    formatted += `**🔧 HOW TO IMPLEMENT:**\n`;
    requirement.howToImplement.forEach(step => {
      formatted += `${step}\n`;
    });
    formatted += '\n';
    
    formatted += `**⏱️ TIMELINE:** ${requirement.timeline}\n\n`;
    
    formatted += `**📊 SUCCESS METRICS:**\n`;
    requirement.metrics.forEach(metric => {
      formatted += `• ${metric}\n`;
    });
    formatted += '\n';
    
    formatted += `**🛠️ RECOMMENDED TOOLS:**\n`;
    requirement.tools.forEach(tool => {
      formatted += `• ${tool}\n`;
    });
    formatted += '\n';
    
    formatted += `**💡 REAL-WORLD EXAMPLES:**\n`;
    requirement.examples.forEach(example => {
      formatted += `• ${example}\n`;
    });
    formatted += '\n';
    
    formatted += `**⚠️ COMMON PITFALLS TO AVOID:**\n`;
    requirement.commonPitfalls.forEach(pitfall => {
      formatted += `• ${pitfall}\n`;
    });
    formatted += '\n';
    
    formatted += `**✅ BEST PRACTICES:**\n`;
    requirement.bestPractices.forEach(practice => {
      formatted += `• ${practice}\n`;
    });
    formatted += '\n';
    
    return formatted;
  }
}