/**
 * Enhanced Unified Guidance Service
 * 
 * Provides clean, professional guidance with exact requirement references
 * and practical implementation guidance for all 21 compliance categories.
 */

export interface RequirementReference {
  framework: string;
  code: string;
  title: string;
  relevance: 'primary' | 'supporting' | 'cross-reference';
}

export interface CategoryGuidance {
  category: string;
  requirementReferences: RequirementReference[];
  foundationContent: string;
  implementationSteps: string[];
  practicalTools: string[];
  auditEvidence: string[];
  crossReferences: string[];
}

export class EnhancedUnifiedGuidanceService {
  
  /**
   * Get comprehensive guidance for a category with exact requirement references
   */
  static getEnhancedGuidance(
    category: string, 
    selectedFrameworks: Record<string, boolean | string>
  ): string {
    const categoryData = this.getCategoryData(category);
    if (!categoryData) {
      return this.getDefaultGuidance(category);
    }

    // Build framework-specific references
    const references = this.buildFrameworkReferences(categoryData.requirementReferences, selectedFrameworks);
    
    // Build main content
    const content = this.buildGuidanceContent(categoryData);
    
    return `${references}\n\n${content}`;
  }

  /**
   * Build framework references section
   */
  private static buildFrameworkReferences(
    references: RequirementReference[], 
    selectedFrameworks: Record<string, boolean | string>
  ): string {
    let referenceText = 'FRAMEWORK REFERENCES:\n\n';
    
    const frameworkGroups: Record<string, RequirementReference[]> = {};
    
    // Group references by framework
    references.forEach(ref => {
      if (selectedFrameworks[ref.framework]) {
        if (!frameworkGroups[ref.framework]) {
          frameworkGroups[ref.framework] = [];
        }
        frameworkGroups[ref.framework].push(ref);
      }
    });

    // Build references for each framework
    Object.entries(frameworkGroups).forEach(([framework, refs]) => {
      const frameworkName = this.getFrameworkDisplayName(framework);
      referenceText += `${frameworkName}:\n`;
      
      // Group by relevance
      const primary = refs.filter(r => r.relevance === 'primary');
      const supporting = refs.filter(r => r.relevance === 'supporting');
      const crossRef = refs.filter(r => r.relevance === 'cross-reference');
      
      if (primary.length > 0) {
        referenceText += '  Primary Requirements:\n';
        primary.forEach(ref => {
          referenceText += `    ${ref.code}: ${ref.title}\n`;
        });
      }
      
      if (supporting.length > 0) {
        referenceText += '  Supporting Requirements:\n';
        supporting.forEach(ref => {
          referenceText += `    ${ref.code}: ${ref.title}\n`;
        });
      }
      
      if (crossRef.length > 0) {
        referenceText += '  Cross-References:\n';
        crossRef.forEach(ref => {
          referenceText += `    ${ref.code}: ${ref.title}\n`;
        });
      }
      
      referenceText += '\n';
    });

    return referenceText;
  }

  /**
   * Build main guidance content
   */
  private static buildGuidanceContent(categoryData: CategoryGuidance): string {
    let content = '';
    
    // Foundation section
    content += 'UNDERSTANDING THE REQUIREMENTS:\n\n';
    content += categoryData.foundationContent + '\n\n';
    
    // Implementation steps
    content += 'IMPLEMENTATION APPROACH:\n\n';
    categoryData.implementationSteps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
    content += '\n';
    
    // Practical tools and examples
    if (categoryData.practicalTools.length > 0) {
      content += 'PRACTICAL TOOLS AND EXAMPLES:\n\n';
      categoryData.practicalTools.forEach(tool => {
        content += `• ${tool}\n`;
      });
      content += '\n';
    }
    
    // Audit evidence
    content += 'AUDIT EVIDENCE CHECKLIST:\n\n';
    categoryData.auditEvidence.forEach(evidence => {
      content += `✓ ${evidence}\n`;
    });
    content += '\n';
    
    // Cross-references
    if (categoryData.crossReferences.length > 0) {
      content += 'RELATED CATEGORIES:\n\n';
      categoryData.crossReferences.forEach(ref => {
        content += `→ ${ref}\n`;
      });
    }
    
    return content;
  }

  /**
   * Get framework display name
   */
  private static getFrameworkDisplayName(framework: string): string {
    const names: Record<string, string> = {
      'iso27001': 'ISO 27001',
      'iso27002': 'ISO 27002', 
      'cisControls': 'CIS Controls v8',
      'gdpr': 'GDPR',
      'nis2': 'NIS2 Directive'
    };
    return names[framework] || framework.toUpperCase();
  }

  /**
   * Get category-specific data with exact requirement mappings
   */
  private static getCategoryData(category: string): CategoryGuidance | null {
    const cleanCategory = category.replace(/^\d+\.\s*/, '');
    
    const categoryMap: Record<string, CategoryGuidance> = {
      'Governance & Leadership': {
        category: 'Governance & Leadership',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.1', title: 'Information security policies', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.2', title: 'Information security roles and responsibilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.4', title: 'Management responsibilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.1', title: 'Screening', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.2', title: 'Terms and conditions of employment', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.4', title: 'Disciplinary process', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.1.1', title: 'Policies for information security', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.1.2', title: 'Review of the policies for information security', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21', title: 'Cybersecurity risk-management measures', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 24', title: 'Responsibility of the controller', relevance: 'supporting' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.6.3', title: 'Information security awareness, education and training', relevance: 'cross-reference' }
        ],
        foundationContent: `Governance and leadership form the foundation of any effective information security program. This category establishes the organizational structure, policies, and management commitment necessary to support all other security activities.

Leadership commitment means more than signing policies - it requires active participation in security decisions, adequate resource allocation, and visible support for security initiatives. Without genuine executive commitment, security programs lack authority and resources to succeed.

The governance framework includes policy development, role definition, management oversight, and accountability structures. These elements work together to ensure security is integrated into business operations rather than treated as a separate concern.`,
        implementationSteps: [
          'Secure executive sponsorship through board resolution or senior management directive',
          'Develop comprehensive information security policy with clear scope and objectives',
          'Define security roles and responsibilities with written job descriptions and accountability measures',
          'Establish security steering committee with cross-functional representation',
          'Create policy management process with regular review and update cycles',
          'Implement security performance metrics and reporting mechanisms',
          'Establish disciplinary procedures for security policy violations'
        ],
        practicalTools: [
          'Policy management platforms: ServiceNow, SharePoint, or specialized tools like MetricStream',
          'Role definition templates: Use RACI matrices to clarify responsibilities',
          'Board reporting templates: Executive dashboards with key security metrics',
          'Policy acknowledgment systems: Digital signature and training tracking tools',
          'Governance frameworks: Adopt ISO 27001, NIST Cybersecurity Framework, or COBIT'
        ],
        auditEvidence: [
          'Board meeting minutes showing security oversight and decision-making',
          'Signed security policies with approval dates and version control',
          'Organization charts showing security roles and reporting relationships',
          'Job descriptions including security responsibilities for all relevant positions', 
          'Security steering committee meeting minutes and attendance records',
          'Policy acknowledgment records for all personnel',
          'Security performance reports provided to management'
        ],
        crossReferences: [
          'Security Awareness & Skills Training (implements the awareness requirements referenced in governance)',
          'Risk Management (governance provides oversight and appetite setting)',
          'Compliance (governance ensures regulatory requirements are met)'
        ]
      },

      'Risk Management': {
        category: 'Risk Management', 
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.7', title: 'Threat intelligence', relevance: 'primary' },
          { framework: 'iso27001', code: 'Clause 6.1.2', title: 'Information security risk assessment', relevance: 'primary' },
          { framework: 'iso27001', code: 'Clause 6.1.3', title: 'Information security risk treatment', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.7.1', title: 'Threat intelligence information', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.a', title: 'Risk analysis and information system security policies', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'supporting' },
          { framework: 'cisControls', code: '18.1', title: 'Establish and Maintain a Penetration Testing Program', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' }
        ],
        foundationContent: `Risk management transforms security from reactive firefighting to strategic business enablement. This systematic approach identifies, analyzes, evaluates, and treats information security risks to protect business objectives and ensure regulatory compliance.

Effective risk management enables informed decision-making by quantifying potential impacts and likelihood of security threats. This allows organizations to prioritize security investments based on actual risk rather than perceived threats or vendor marketing.

Risk management is not a one-time activity but a continuous process that adapts to changing business conditions, emerging threats, and evolving regulatory requirements. The process must be integrated into business planning and decision-making processes.`,
        implementationSteps: [
          'Define risk management methodology aligned with business objectives and regulatory requirements',
          'Identify and catalog all information assets with business impact classifications',
          'Conduct systematic threat identification using structured techniques and threat intelligence',
          'Perform risk assessment combining threat likelihood with business impact analysis',
          'Develop risk treatment plans with clear ownership, timelines, and success metrics',
          'Implement risk monitoring and reporting processes with key risk indicators',
          'Establish risk appetite and tolerance levels approved by senior management',
          'Create risk communication processes for stakeholders at all levels'
        ],
        practicalTools: [
          'Risk assessment tools: ServiceNow Risk Management, Archer, or Resolver',
          'Threat intelligence platforms: Recorded Future, ThreatConnect, or MISP',
          'Risk quantification methods: FAIR (Factor Analysis of Information Risk) methodology',
          'Risk registers: Structured spreadsheets or specialized GRC platforms',
          'Business impact analysis tools: Continuity planning software and templates'
        ],
        auditEvidence: [
          'Risk management policy and procedures with management approval',
          'Risk assessment methodology documentation with validation evidence',
          'Current risk register with all identified risks and treatments',
          'Risk treatment plans with assigned owners and completion dates',
          'Risk monitoring reports showing trending and metrics',
          'Risk appetite statement approved by board or senior management',
          'Evidence of risk-based decision making in project and investment decisions'
        ],
        crossReferences: [
          'Asset Management (provides foundation for risk assessment)',
          'Business Continuity Management (implements risk treatment for availability risks)',
          'Information Security Incident Management (responds to risks that materialize)'
        ]
      },

      'Access Control & Identity Management': {
        category: 'Access Control & Identity Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.15', title: 'Access control', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.16', title: 'Identity management', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.17', title: 'Authentication information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.18', title: 'Access rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.2', title: 'Privileged access rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.3', title: 'Information access restriction', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.5', title: 'Secure authentication', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.9.1.1', title: 'Access control policy', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Identity and access management', relevance: 'primary' },
          { framework: 'cisControls', code: '5.1', title: 'Establish and Maintain an Inventory of Accounts', relevance: 'primary' },
          { framework: 'cisControls', code: '6.1', title: 'Establish an Access Granting Process', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.1.b', title: 'Ability to ensure ongoing confidentiality', relevance: 'supporting' }
        ],
        foundationContent: `Access control and identity management form the cornerstone of information security by ensuring only authorized individuals can access organizational resources. This category encompasses the complete lifecycle of digital identities from creation through termination.

Identity management establishes unique identities for all users, devices, and services requiring system access. Access control then governs what these identities can access, when, and under what conditions. Together, they prevent unauthorized access while enabling legitimate business activities.

Modern access control must address complex scenarios including remote work, cloud services, mobile devices, and third-party integrations. Zero-trust principles assume no inherent trust and verify every access request regardless of location or previous authentication.`,
        implementationSteps: [
          'Implement identity lifecycle management with automated provisioning and deprovisioning',
          'Deploy multi-factor authentication for all privileged and remote access',
          'Establish role-based access control with least privilege principles',
          'Create privileged access management solution with session monitoring',
          'Implement regular access reviews and recertification processes',
          'Deploy single sign-on to reduce password proliferation and improve user experience',
          'Establish access control monitoring with automated alerting for violations',
          'Create emergency access procedures with proper controls and auditing'
        ],
        practicalTools: [
          'Identity management platforms: Microsoft Azure AD, Okta, or Ping Identity',
          'Privileged access management: CyberArk, BeyondTrust, or Thycotic',
          'Multi-factor authentication: Duo, RSA, or YubiKey hardware tokens',
          'Access governance tools: SailPoint, Saviynt, or Oracle Identity Governance',
          'Zero-trust platforms: Zscaler, Palo Alto Prisma, or Microsoft Conditional Access'
        ],
        auditEvidence: [
          'Access control policy with defined roles, responsibilities, and procedures',
          'Identity management system configuration showing lifecycle automation',
          'Multi-factor authentication deployment records and usage statistics',
          'Access review reports with evidence of regular recertification',
          'Privileged access management logs showing session monitoring',
          'Access violation reports and incident response records',
          'Role definitions with associated permissions and business justifications'
        ],
        crossReferences: [
          'Governance & Leadership (establishes access control policies and oversight)',
          'Asset Management (defines what resources need access controls)',
          'Security Awareness & Skills Training (trains users on proper access practices)'
        ]
      },

      'Information Security Incident Management': {
        category: 'Information Security Incident Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.24', title: 'Information security incident management planning', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.25', title: 'Assessment and decision on information security events', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.26', title: 'Response to information security incidents', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.27', title: 'Learning from information security incidents', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.28', title: 'Collection of evidence', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.8', title: 'Information security event reporting', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 23', title: 'Reporting of significant incidents', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Incident handling', relevance: 'primary' },
          { framework: 'cisControls', code: '17.1', title: 'Designate Personnel to Manage Incident Handling', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 33', title: 'Notification of a personal data breach to supervisory authority', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 34', title: 'Communication of personal data breach to data subject', relevance: 'supporting' }
        ],
        foundationContent: `Information security incident management provides the systematic capability to detect, respond to, and recover from security incidents while minimizing business impact. This process determines whether organizations survive security events or suffer catastrophic damage.

Incident management extends beyond technical response to include business continuity, legal compliance, communication management, and organizational learning. The goal is not just to contain incidents but to improve organizational resilience and prevent similar incidents.

Modern incident response must address complex scenarios including advanced persistent threats, insider threats, supply chain attacks, and privacy breaches. Response teams need technical skills, business understanding, and regulatory knowledge to make appropriate decisions under pressure.`,
        implementationSteps: [
          'Establish incident response team with defined roles and 24/7 contact information',
          'Develop incident classification criteria with escalation thresholds and response procedures',
          'Create incident response playbooks for common scenarios including ransomware and data breaches',
          'Implement security monitoring with automated detection and alerting capabilities',
          'Establish evidence collection and forensic analysis capabilities',
          'Create communication templates for internal stakeholders and external parties',
          'Develop regulatory notification procedures with specific timelines and requirements',
          'Implement post-incident review process with lessons learned and improvement actions'
        ],
        practicalTools: [
          'SIEM platforms: Splunk, IBM QRadar, or Microsoft Sentinel for detection and monitoring',
          'Incident response platforms: Phantom, Demisto, or ServiceNow Security Operations',
          'Forensic tools: EnCase, FTK, or open-source alternatives like Autopsy',
          'Communication tools: Slack, Microsoft Teams, or specialized crisis communication platforms',
          'Threat intelligence: Recorded Future, ThreatConnect, or government sources like CISA'
        ],
        auditEvidence: [
          'Incident response plan with current team contact information and procedures',
          'Incident classification criteria with examples and escalation triggers',
          'Evidence of incident response exercises and testing with results documentation',
          'Incident logs showing detection, response, and resolution times',
          'Communication records demonstrating proper stakeholder notification',
          'Post-incident review reports with lessons learned and improvement actions',
          'Training records for incident response team members'
        ],
        crossReferences: [
          'Security Awareness & Skills Training (trains employees to recognize and report incidents)',
          'Business Continuity Management (provides recovery capabilities during incidents)',
          'Risk Management (incident data feeds back into risk assessments)'
        ]
      },

      'Asset Management': {
        category: 'Asset Management', 
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.9', title: 'Inventory of information and associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.10', title: 'Acceptable use of information and associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.11', title: 'Return of assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.12', title: 'Classification of information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.13', title: 'Labelling of information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.9', title: 'Security of assets off-premises', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.14', title: 'Secure disposal or re-use of equipment', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.8.1.1', title: 'Inventory of assets', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.8.2.1', title: 'Classification of information', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'primary' },
          { framework: 'cisControls', code: '2.1', title: 'Establish and Maintain a Software Inventory', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.c', title: 'Asset management', relevance: 'primary' }
        ],
        foundationContent: `Asset management establishes comprehensive visibility and control over all organizational information assets, from traditional IT infrastructure to cloud resources, data, and intellectual property. Without knowing what assets exist, organizations cannot adequately protect them.

Asset management encompasses the complete lifecycle from acquisition through disposal, including inventory maintenance, classification, ownership assignment, and protection controls. This foundation enables all other security controls by defining what needs protection and at what level.

Modern asset management must address hybrid environments including on-premises systems, cloud services, mobile devices, IoT sensors, and software applications. Dynamic environments require automated discovery and continuous monitoring to maintain accuracy.`,
        implementationSteps: [
          'Deploy automated asset discovery tools for network scanning and endpoint detection',
          'Create comprehensive asset inventory with technical details and business context',
          'Implement information classification scheme with handling requirements',
          'Assign asset owners with documented responsibilities for protection and management',
          'Establish asset lifecycle procedures from acquisition through secure disposal',
          'Deploy configuration management system to track changes and maintain baselines',
          'Implement asset labeling and marking standards for physical and digital assets',
          'Create regular asset review and verification processes with owner validation'
        ],
        practicalTools: [
          'Asset discovery tools: Lansweeper, Armis, or Qualys VMDR for comprehensive scanning',
          'CMDB platforms: ServiceNow, Device42, or Atlassian Assets for inventory management',
          'Cloud asset management: AWS Config, Azure Resource Graph, or Google Cloud Asset Inventory',
          'Data classification tools: Microsoft Purview, Varonis, or Forcepoint for automated labeling',
          'Mobile device management: Microsoft Intune, VMware Workspace ONE, or Jamf for endpoint control'
        ],
        auditEvidence: [
          'Asset inventory reports showing completeness and accuracy metrics',
          'Asset classification scheme with handling procedures and examples',
          'Asset ownership records with assigned responsibilities and contact information',
          'Configuration baselines and change management records',
          'Asset disposal certificates and data destruction verification',
          'Asset review reports with owner validation and update records',
          'Acceptable use policies with user acknowledgment records'
        ],
        crossReferences: [
          'Risk Management (asset inventory provides foundation for risk assessment)',
          'Access Control & Identity Management (assets define what needs access controls)',
          'Physical & Environmental Security (physical assets require physical protection)'
        ]
      },

      'Physical & Environmental Security': {
        category: 'Physical & Environmental Security',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.7.1', title: 'Physical security perimeters', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.2', title: 'Physical entry', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.3', title: 'Securing offices, rooms and facilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.4', title: 'Physical security monitoring', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.5', title: 'Protecting against physical and environmental threats', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.6', title: 'Working in secure areas', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.7', title: 'Clear desk and clear screen', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.8', title: 'Equipment siting and protection', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.11', title: 'Supporting utilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.12', title: 'Cabling security', relevance: 'primary' },
          { framework: 'cisControls', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.f', title: 'Physical and environmental security', relevance: 'primary' }
        ],
        foundationContent: `Physical and environmental security provides the foundational layer that protects all digital assets and business operations. No amount of cyber security can defend against physical threats that bypass technical controls entirely.

Physical security encompasses facility protection, environmental controls, equipment security, and personnel safety. These controls prevent unauthorized physical access, protect against environmental threats, and ensure business continuity during physical incidents.

Modern physical security must address distributed workforces, cloud facilities, remote locations, and supply chain facilities. Organizations must balance security requirements with operational efficiency and regulatory compliance.`,
        implementationSteps: [
          'Define physical security perimeters with appropriate barriers and access controls',
          'Implement access control systems with authentication and logging for secure areas',
          'Deploy environmental monitoring for temperature, humidity, water, and power quality',
          'Install surveillance systems with appropriate coverage and retention periods',
          'Establish visitor management procedures with registration and escort requirements',
          'Implement clear desk and screen policies with secure storage for sensitive materials',
          'Create equipment protection standards for placement, cabling, and maintenance',
          'Develop emergency response procedures for physical security incidents'
        ],
        practicalTools: [
          'Access control systems: HID, Lenel, or Software House for facility access management',
          'Surveillance systems: Axis, Hikvision, or Dahua with appropriate analytics capabilities',
          'Environmental monitoring: APC, Geist, or Sensaphone for data center monitoring',
          'Visitor management: Proxyclick, Envoy, or Traction Guest for registration and tracking',
          'Physical security assessment tools: Risk assessment templates and facility audit checklists'
        ],
        auditEvidence: [
          'Physical security assessment reports with current facility layouts and controls',
          'Access control system logs showing entry and exit records',
          'Surveillance system documentation with coverage maps and retention policies',
          'Environmental monitoring logs with alert thresholds and response records',
          'Visitor access logs with registration and escort verification',
          'Clear desk policy compliance monitoring reports',
          'Equipment inventory with security controls and protection measures'
        ],
        crossReferences: [
          'Asset Management (physical assets require physical protection controls)',
          'Business Continuity Management (physical threats can disrupt operations)',
          'Information Security Incident Management (physical incidents require response procedures)'
        ]
      },

      'Communications & Operations Management': {
        category: 'Communications & Operations Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.37', title: 'Documented operating procedures', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.7', title: 'Remote working', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.13', title: 'Equipment maintenance', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.1', title: 'User endpoint devices', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.6', title: 'Capacity management', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.17', title: 'Clock synchronization', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.19', title: 'Installation of software on operational systems', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.32', title: 'Change management', relevance: 'primary' },
          { framework: 'cisControls', code: '4.1', title: 'Establish and Maintain a Secure Configuration Process', relevance: 'primary' },
          { framework: 'cisControls', code: '10.1', title: 'Deploy and Maintain Anti-Malware Software', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.g', title: 'Network security', relevance: 'supporting' }
        ],
        foundationContent: `Communications and operations management ensures consistent security posture through standardized procedures, change control, and continuous monitoring. This category covers the day-to-day operational activities that maintain security while enabling business operations.

Operations management encompasses system administration, network management, endpoint security, capacity planning, and maintenance activities. These processes must balance security requirements with operational efficiency and business continuity.

Modern operations must address cloud services, remote work, DevOps practices, and continuous deployment while maintaining security standards. Automation and monitoring enable scalable operations without sacrificing security controls.`,
        implementationSteps: [
          'Document all operational procedures with version control and regular updates',
          'Implement formal change management with security impact assessment and approval workflows',
          'Deploy endpoint protection with centralized management and monitoring',
          'Establish capacity monitoring with predictive analytics and automated alerting',
          'Create remote work security standards with VPN access and endpoint controls',
          'Implement software installation controls with approved application lists',
          'Deploy time synchronization across all systems with redundant NTP sources',
          'Establish maintenance procedures with security verification and testing'
        ],
        practicalTools: [
          'Change management: ServiceNow, Jira Service Management, or Remedy for workflow automation',
          'Endpoint protection: CrowdStrike, Microsoft Defender, or Carbon Black for comprehensive security',
          'Capacity monitoring: SolarWinds, PRTG, or Nagios for infrastructure monitoring',
          'Configuration management: Ansible, Puppet, or Chef for automated deployment',
          'Remote access: Citrix, VMware Horizon, or Microsoft RDS for secure remote access'
        ],
        auditEvidence: [
          'Documented operational procedures with version control and approval records',
          'Change management logs with security assessments and approval workflows',
          'Endpoint protection deployment reports with coverage and compliance metrics',
          'Capacity monitoring reports with threshold alerts and response times',
          'Remote access logs with user authentication and session monitoring',
          'Software installation audit reports with approved application inventories',
          'Maintenance records with security testing and verification procedures'
        ],
        crossReferences: [
          'Asset Management (operations manage and maintain organizational assets)',
          'Risk Management (operational risks must be identified and managed)',
          'Information Security Incident Management (operations team often first to detect incidents)'
        ]
      },

      'Business Continuity Management': {
        category: 'Business Continuity Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.29', title: 'Information security during disruption', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.30', title: 'ICT readiness for business continuity', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.13', title: 'Information backup', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.14', title: 'Redundancy of information processing facilities', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.17.1.1', title: 'Planning information security continuity', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.17.1.2', title: 'Implementing information security continuity', relevance: 'primary' },
          { framework: 'cisControls', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', relevance: 'primary' },
          { framework: 'cisControls', code: '11.2', title: 'Perform Automated Backups', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.h', title: 'Business continuity', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.1.c', title: 'Ability to restore availability and access to personal data', relevance: 'supporting' }
        ],
        foundationContent: `Business continuity management ensures organizational survival through disruptions by maintaining critical business functions and enabling rapid recovery. This capability determines whether organizations continue operating during incidents or suffer permanent business damage.

Business continuity extends beyond disaster recovery to include crisis management, communication planning, supplier management, and stakeholder coordination. The goal is maintaining stakeholder confidence and market position during and after disruptive events.

Modern business continuity must address cyber incidents, pandemic disruptions, supply chain failures, and climate-related events. Organizations need flexible response capabilities that can adapt to various scenarios and escalating situations.`,
        implementationSteps: [
          'Conduct business impact analysis to identify critical processes and dependencies',
          'Define recovery time and recovery point objectives for all critical systems',
          'Develop business continuity plans with detailed response procedures and contact information',
          'Implement backup strategies following 3-2-1 rule with offsite and offline copies',
          'Establish alternate processing sites with appropriate security and capacity',
          'Create crisis communication plans for internal and external stakeholders',
          'Conduct regular testing including tabletop exercises and full system recoveries',
          'Maintain supplier continuity arrangements with service level agreements'
        ],
        practicalTools: [
          'Business continuity planning: Fusion Framework, MetricStream, or Castellan for plan development',
          'Backup solutions: Veeam, Commvault, or cloud-native services like AWS Backup',
          'Recovery orchestration: Zerto, VMware Site Recovery, or Azure Site Recovery',
          'Communication platforms: Everbridge, AlertMedia, or Rave Mobile Safety for crisis communication',
          'Testing tools: Continuous availability testing platforms and simulation environments'
        ],
        auditEvidence: [
          'Business impact analysis with critical process identification and dependencies',
          'Business continuity plans with current procedures and contact information',
          'Backup verification reports with successful restoration testing',
          'Recovery testing results with actual versus target recovery times',
          'Crisis communication records with stakeholder notification evidence',
          'Supplier continuity agreements with service level commitments',
          'Business continuity exercise reports with lessons learned and improvements'
        ],
        crossReferences: [
          'Risk Management (continuity planning addresses identified risks)',
          'Information Security Incident Management (incidents may trigger continuity responses)',
          'Physical & Environmental Security (physical threats can disrupt business operations)'
        ]
      },

      'System Acquisition, Development & Maintenance': {
        category: 'System Acquisition, Development & Maintenance',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.25', title: 'Secure development life cycle', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.26', title: 'Application security requirements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.27', title: 'Secure system architecture and engineering principles', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.28', title: 'Secure coding', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.29', title: 'Security testing in development and acceptance', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.30', title: 'Outsourced development', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.31', title: 'Separation of development, test and production environments', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.33', title: 'Test information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.4', title: 'Access to source code', relevance: 'primary' },
          { framework: 'cisControls', code: '16.1', title: 'Establish and Maintain a Secure Application Development Process', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.i', title: 'Supply chain security', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'supporting' }
        ],
        foundationContent: `System acquisition, development and maintenance integrates security throughout the system lifecycle to prevent vulnerabilities and ensure robust protection. Building security from inception is exponentially more cost-effective than retrofitting protection after deployment.

Secure development encompasses requirements definition, architecture design, coding practices, testing procedures, and deployment controls. This systematic approach prevents common vulnerabilities and creates resilient systems that support business objectives.

Modern development must address agile methodologies, DevSecOps practices, cloud-native applications, and continuous deployment while maintaining security standards. Security must be automated and integrated into development workflows without hindering productivity.`,
        implementationSteps: [
          'Define security requirements during project initiation with threat modeling and risk assessment',
          'Implement secure development lifecycle with security gates and approval processes',
          'Establish secure coding standards with developer training and reference materials',
          'Deploy automated security testing tools in development and build processes',
          'Create environment separation with appropriate access controls and data protection',
          'Implement code review processes with security-focused checklists and tools',
          'Establish security testing requirements including penetration testing for critical systems',
          'Create secure deployment procedures with configuration management and monitoring'
        ],
        practicalTools: [
          'Static analysis: SonarQube, Checkmarx, or Veracode for code vulnerability scanning',
          'Dynamic testing: OWASP ZAP, Burp Suite, or Rapid7 AppSpider for runtime testing',
          'Dependency scanning: Snyk, WhiteSource, or GitHub Dependabot for third-party vulnerabilities',
          'Container security: Twistlock, Aqua, or Sysdig for containerized applications',
          'DevSecOps platforms: GitLab, Azure DevOps, or Jenkins with security plugin ecosystems'
        ],
        auditEvidence: [
          'Secure development lifecycle documentation with security gates and procedures',
          'Security requirements documents with threat models and risk assessments',
          'Code review records with security findings and resolution evidence',
          'Security testing reports from static, dynamic, and penetration testing',
          'Environment separation documentation with access controls and data flow diagrams',
          'Developer training records with secure coding competency assessments',
          'Deployment procedures with security configuration and monitoring requirements'
        ],
        crossReferences: [
          'Access Control & Identity Management (development systems require access controls)',
          'Risk Management (development introduces risks that must be managed)',
          'Supplier & Third-Party Risk Management (outsourced development requires vendor management)'
        ]
      },

      'Compliance': {
        category: 'Compliance',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.32', title: 'Intellectual property rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.33', title: 'Protection of records', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.35', title: 'Independent review of information security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.36', title: 'Compliance with policies, rules and standards', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.34', title: 'Protection of information systems during audit testing', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.5', title: 'Contact with authorities', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.5.6', title: 'Contact with special interest groups', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 24', title: 'Responsibility of the controller', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 23', title: 'Reporting of significant incidents', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'supporting' }
        ],
        foundationContent: `Compliance management ensures organizational adherence to legal, regulatory, and contractual obligations while demonstrating security maturity to stakeholders. Effective compliance programs prevent penalties, enable market access, and build competitive advantage.

Compliance extends beyond checkbox compliance to create operational excellence through structured processes, evidence management, and continuous improvement. Organizations must balance compliance requirements with business objectives and operational efficiency.

Modern compliance must address multiple overlapping regulations, international requirements, sector-specific standards, and evolving privacy laws. Organizations need integrated compliance management that addresses all applicable requirements through unified controls.`,
        implementationSteps: [
          'Identify all applicable legal, regulatory, and contractual requirements',
          'Create compliance register with requirements mapping to organizational controls',
          'Establish compliance monitoring processes with regular assessment and reporting',
          'Implement evidence management system for audit preparation and regulatory requests',
          'Create relationships with regulatory authorities and industry groups',
          'Establish independent review processes with external validation and assessment',
          'Develop compliance training programs for all relevant personnel',
          'Implement continuous compliance monitoring with automated evidence collection'
        ],
        practicalTools: [
          'GRC platforms: ServiceNow GRC, MetricStream, or Resolver for compliance management',
          'Evidence management: SharePoint, Confluence, or specialized tools like AuditBoard',
          'Regulatory tracking: Thomson Reuters, Compliance.ai, or regulatory intelligence services',
          'Assessment tools: Compliance assessment templates and gap analysis frameworks',
          'Audit management: AuditBoard, Workiva, or MindBridge AI for audit coordination'
        ],
        auditEvidence: [
          'Compliance register with all applicable requirements and current status',
          'Regular compliance assessment reports with findings and remediation plans',
          'Independent review reports with external validation of compliance programs',
          'Evidence management system with audit trail and version control',
          'Training records with compliance-specific competency requirements',
          'Regulatory correspondence and authority relationship documentation',
          'Compliance monitoring reports with key performance indicators and trending'
        ],
        crossReferences: [
          'Governance & Leadership (provides compliance oversight and accountability)',
          'Risk Management (compliance failures represent significant risks)',
          'Information Security Incident Management (incidents may trigger compliance reporting)'
        ]
      },

      'Security Awareness & Skills Training': {
        category: 'Security Awareness & Skills Training',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.6.3', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.7.2.2', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'cisControls', code: '14.1', title: 'Establish and Maintain a Security Awareness Program', relevance: 'primary' },
          { framework: 'cisControls', code: '14.2', title: 'Train Workforce Members to Recognize Social Engineering', relevance: 'primary' },
          { framework: 'cisControls', code: '14.3', title: 'Train Workforce Members on Authentication Best Practices', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Human resources security and access privilege management', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 39', title: 'Tasks of the data protection officer', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.5.2', title: 'Information security roles and responsibilities', relevance: 'cross-reference' }
        ],
        foundationContent: `Security awareness and skills training transforms employees from potential security risks into active security assets. This foundational control addresses the human element of cybersecurity by building security knowledge, skills, and culture throughout the organization.

Training programs must address both general security awareness for all employees and specialized skills training for technical staff. The goal is creating a security-conscious culture where employees understand their role in protecting organizational assets and can recognize and respond appropriately to security threats.

Modern security awareness must address sophisticated social engineering, remote work security, personal device usage, cloud service security, and emerging threats. Training must be engaging, relevant, and measurable to ensure behavioral change rather than simple compliance.`,
        implementationSteps: [
          'Develop comprehensive security awareness program with role-specific training modules',
          'Create engaging training content using multiple delivery methods including videos and simulations',
          'Implement phishing simulation program with regular testing and remedial training',
          'Establish security awareness metrics with baseline measurements and improvement tracking',
          'Deploy specialized technical training for IT staff and security personnel',
          'Create security incident reporting training with clear procedures and contact information',
          'Implement new employee security orientation as part of onboarding process',
          'Establish security champions program with trained advocates in each business unit'
        ],
        practicalTools: [
          'Learning management systems: Cornerstone OnDemand, Docebo, or Moodle for training delivery',
          'Phishing simulation: KnowBe4, Proofpoint, or Cofense for social engineering testing',
          'Content libraries: SANS, (ISC)2, or custom content development for specialized training',
          'Assessment tools: Security awareness surveys, knowledge assessments, and behavioral metrics',
          'Communication platforms: Internal communication tools for security messaging and updates'
        ],
        auditEvidence: [
          'Security awareness training program documentation with curriculum and schedules',
          'Training completion records with scores and remediation tracking',
          'Phishing simulation results with click rates and improvement trends',
          'Security awareness metrics reports with behavioral change measurements',
          'New employee orientation records with security training completion',
          'Security champions program documentation with activities and engagement metrics',
          'Incident reporting training records with procedure acknowledgments'
        ],
        crossReferences: [
          'Governance & Leadership (establishes awareness training requirements and oversight)',
          'Information Security Incident Management (trained employees recognize and report incidents)',
          'Access Control & Identity Management (training covers password and authentication best practices)'
        ]
      },

      'Vulnerability Management': {
        category: 'Vulnerability Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.8', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.6.1', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'cisControls', code: '7.1', title: 'Establish and Maintain a Vulnerability Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.2', title: 'Establish and Maintain a Remediation Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.3', title: 'Perform Automated Operating System Patch Management', relevance: 'primary' },
          { framework: 'cisControls', code: '7.4', title: 'Perform Automated Application Patch Management', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.c', title: 'Systems for handling security incidents', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.8.7', title: 'Protection against malware', relevance: 'cross-reference' }
        ],
        foundationContent: `Vulnerability management provides systematic identification, assessment, and remediation of security weaknesses across all organizational systems and applications. This proactive approach prevents exploitation by addressing vulnerabilities before attackers can leverage them.

Effective vulnerability management balances security risk with operational stability through risk-based prioritization, testing procedures, and coordinated deployment. The process must address both known vulnerabilities through patching and unknown vulnerabilities through security testing.

Modern vulnerability management must handle cloud environments, containerized applications, mobile devices, and IoT systems while maintaining rapid response capabilities for critical vulnerabilities. Automation is essential for scalability and consistency.`,
        implementationSteps: [
          'Deploy vulnerability scanning tools for comprehensive asset discovery and assessment',
          'Establish vulnerability assessment schedule with regular scanning and emergency procedures',
          'Implement risk-based vulnerability prioritization using CVSS scores and business context',
          'Create patch management process with testing, approval, and deployment procedures',
          'Establish vulnerability response timelines based on risk levels and compliance requirements',
          'Deploy automated patching for operating systems and applications where appropriate',
          'Implement vulnerability metrics and reporting with trending and improvement tracking',
          'Create emergency response procedures for critical vulnerabilities and zero-day threats'
        ],
        practicalTools: [
          'Vulnerability scanners: Qualys, Rapid7, or Tenable for comprehensive assessment',
          'Patch management: Microsoft WSUS, Red Hat Satellite, or Tanium Patch for automated deployment',
          'Configuration management: Ansible, Puppet, or Chef for consistent system hardening',
          'Risk scoring: CVSS calculator integration and business context weighting',
          'Workflow management: ServiceNow, Jira, or dedicated vulnerability management platforms'
        ],
        auditEvidence: [
          'Vulnerability management policy with procedures and responsibilities',
          'Vulnerability scan reports with coverage verification and findings analysis',
          'Patch management records with testing, approval, and deployment tracking',
          'Vulnerability metrics reports with response times and remediation rates',
          'Risk assessment documentation for vulnerability prioritization decisions',
          'Emergency response records for critical vulnerability handling',
          'System hardening evidence with configuration baselines and compliance verification'
        ],
        crossReferences: [
          'Asset Management (vulnerability management requires complete asset inventory)',
          'Risk Management (vulnerabilities represent risks requiring assessment and treatment)',
          'System Acquisition, Development & Maintenance (secure development reduces vulnerabilities)'
        ]
      },

      'Network Infrastructure Management': {
        category: 'Network Infrastructure Management', 
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.20', title: 'Networks security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.21', title: 'Security of network services', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.22', title: 'Segregation of networks', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.1.1', title: 'Network controls', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.1.2', title: 'Security of network services', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.1.3', title: 'Segregation in networks', relevance: 'primary' },
          { framework: 'cisControls', code: '12.1', title: 'Maintain an Inventory of Network Boundaries', relevance: 'primary' },
          { framework: 'cisControls', code: '12.2', title: 'Establish and Maintain a Secure Network Architecture', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.g', title: 'Network security', relevance: 'primary' }
        ],
        foundationContent: `Network infrastructure management provides the secure foundation for all business communications and data flows. This category encompasses network design, segmentation, monitoring, and access control to ensure confidentiality, integrity, and availability of network services.

Network security requires defense-in-depth architecture with multiple security layers, network segmentation, access controls, and continuous monitoring. The network must support business operations while preventing unauthorized access and lateral movement during security incidents.

Modern network management must address hybrid cloud architectures, remote work requirements, mobile device access, and IoT connectivity while maintaining security standards. Software-defined networking and zero-trust architectures enable flexible, secure network design.`,
        implementationSteps: [
          'Design secure network architecture with appropriate segmentation and access controls',
          'Implement network access control with device authentication and compliance verification', 
          'Deploy network monitoring tools for traffic analysis and threat detection',
          'Establish firewall management with rule reviews and policy optimization',
          'Create wireless network security with enterprise authentication and encryption',
          'Implement network device hardening with secure configurations and management',
          'Establish VPN services for secure remote access with multi-factor authentication',
          'Deploy network security monitoring with intrusion detection and response capabilities'
        ],
        practicalTools: [
          'Network monitoring: SolarWinds, PRTG, or Nagios for infrastructure monitoring',
          'Network access control: Cisco ISE, Aruba ClearPass, or ForeScout for device authentication',
          'Firewalls: Palo Alto Networks, Fortinet, or Cisco for perimeter and internal segmentation',
          'Wireless management: Cisco, Aruba, or Ubiquiti for enterprise wireless security',
          'SIEM integration: Network log analysis and correlation for security monitoring'
        ],
        auditEvidence: [
          'Network architecture diagrams with security zones and access controls',
          'Network device inventory with configuration baselines and security hardening',
          'Network access control logs with device authentication and compliance records',
          'Network monitoring reports with traffic analysis and security event detection',
          'Firewall rule reviews with change management and optimization records',
          'Wireless network security configuration with authentication and encryption verification',
          'VPN access logs with user authentication and session monitoring'
        ],
        crossReferences: [
          'Access Control & Identity Management (network access requires identity verification)',
          'Information Security Incident Management (network monitoring detects security incidents)',
          'Physical & Environmental Security (network infrastructure requires physical protection)'
        ]
      },

      'Malware Defenses': {
        category: 'Malware Defenses',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.7', title: 'Protection against malware', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.2.1', title: 'Controls against malware', relevance: 'primary' },
          { framework: 'cisControls', code: '10.1', title: 'Deploy and Maintain Anti-Malware Software', relevance: 'primary' },
          { framework: 'cisControls', code: '10.2', title: 'Configure Automatic Anti-Malware Signature Updates', relevance: 'primary' },
          { framework: 'cisControls', code: '10.3', title: 'Disable Autorun and Autoplay for Removable Media', relevance: 'primary' },
          { framework: 'cisControls', code: '10.4', title: 'Configure Anti-Malware Scanning of Removable Media', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Incident handling', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.8.23', title: 'Web filtering', relevance: 'cross-reference' }
        ],
        foundationContent: `Malware defenses provide comprehensive protection against malicious software including viruses, worms, trojans, ransomware, and advanced persistent threats. This multi-layered approach combines prevention, detection, and response capabilities to protect organizational systems and data.

Effective malware protection requires endpoint security, email security, web filtering, network monitoring, and user education working together as integrated defense system. The approach must address both known malware signatures and unknown threats through behavioral analysis and sandboxing.

Modern malware defenses must handle sophisticated attacks that use legitimate tools, fileless techniques, and social engineering. Next-generation endpoint protection, threat hunting, and incident response capabilities are essential for comprehensive protection.`,
        implementationSteps: [
          'Deploy next-generation endpoint protection with behavioral analysis and machine learning',
          'Implement email security with attachment scanning and link protection',
          'Configure web filtering to block malicious websites and download categories',
          'Establish automatic signature updates and real-time threat intelligence integration',
          'Deploy network-based malware detection with traffic analysis and sandboxing',
          'Create malware incident response procedures with isolation and remediation steps',
          'Implement application whitelisting for critical systems and high-risk environments',
          'Establish threat hunting capabilities with proactive malware detection and analysis'
        ],
        practicalTools: [
          'Endpoint protection: CrowdStrike, Microsoft Defender, or Carbon Black for comprehensive security',
          'Email security: Proofpoint, Mimecast, or Barracuda for message and attachment protection',
          'Web filtering: Zscaler, Cisco Umbrella, or Forcepoint for URL and content filtering',
          'Sandboxing: FireEye, Palo Alto WildFire, or Joe Sandbox for malware analysis',
          'Threat intelligence: Recorded Future, ThreatConnect, or AlienVault for threat data'
        ],
        auditEvidence: [
          'Malware protection policy with deployment standards and update procedures',
          'Endpoint protection deployment records with coverage verification and compliance monitoring',
          'Malware detection reports with incident counts, types, and response actions',
          'Email security logs with blocked messages and malicious attachment detection',
          'Web filtering reports with blocked sites and malware download prevention',
          'Signature update logs with currency verification and automated distribution',
          'Malware incident response records with containment and remediation evidence'
        ],
        crossReferences: [
          'Security Awareness & Skills Training (user education prevents malware infections)',
          'Information Security Incident Management (malware incidents require coordinated response)',
          'Vulnerability Management (unpatched systems are vulnerable to malware exploitation)'
        ]
      },

      'Data Protection': {
        category: 'Data Protection',
        requirementReferences: [
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.24', title: 'Use of cryptography', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.10', title: 'Information deletion', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.11', title: 'Data masking', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.12', title: 'Data leakage prevention', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.10', title: 'Storage media', relevance: 'primary' },
          { framework: 'cisControls', code: '3.1', title: 'Establish and Maintain a Data Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '3.3', title: 'Configure Data Access Control Lists', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.j', title: 'Measures to assess the effectiveness of cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `Data protection ensures the confidentiality, integrity, and availability of organizational information throughout its lifecycle. This comprehensive approach encompasses data classification, access controls, encryption, loss prevention, and privacy protection to safeguard valuable information assets.

Data protection requires understanding information flows, implementing appropriate controls based on data sensitivity, and ensuring compliance with privacy regulations. Protection must address data at rest, in transit, and in use across all systems and environments.

Modern data protection must handle cloud storage, mobile devices, remote work, and third-party sharing while maintaining privacy compliance and business functionality. Advanced capabilities like data discovery, classification, and rights management enable scalable protection.`,
        implementationSteps: [
          'Implement data discovery and classification tools for comprehensive data inventory',
          'Deploy encryption for data at rest and in transit using industry-standard algorithms',
          'Establish data loss prevention with content inspection and policy enforcement',
          'Create data retention and disposal policies with automated enforcement capabilities',
          'Implement data masking for non-production environments and analytics use cases',
          'Deploy rights management for documents and sensitive information sharing',
          'Establish data backup and recovery processes with encryption and integrity verification',
          'Create privacy impact assessment procedures for new systems and processes'
        ],
        practicalTools: [
          'Data discovery: Microsoft Purview, Varonis, or Spirion for sensitive data identification',
          'Encryption: BitLocker, FileVault, or enterprise key management systems',
          'DLP solutions: Forcepoint, Symantec, or Microsoft Information Protection',
          'Data masking: Informatica, IBM InfoSphere, or Delphix for test data protection',
          'Backup solutions: Veeam, Commvault, or cloud-native backup services'
        ],
        auditEvidence: [
          'Data classification policy with handling procedures and labeling requirements',
          'Data discovery reports with sensitive data inventory and location mapping',
          'Encryption implementation records with key management and algorithm documentation',
          'Data loss prevention logs with policy violations and remediation actions',
          'Data retention records with disposal certificates and compliance verification',
          'Backup and recovery test results with restoration verification and integrity checks',
          'Privacy impact assessments with risk analysis and mitigation measures'
        ],
        crossReferences: [
          'Asset Management (data classification drives asset protection requirements)',
          'Access Control & Identity Management (data access controls enforce classification policies)',
          'Compliance (data protection supports privacy regulation compliance)'
        ]
      },

      'Secure Configuration of Hardware and Software': {
        category: 'Secure Configuration of Hardware and Software',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.9', title: 'Configuration management', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.1.2', title: 'Change management', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.6.2', title: 'Restrictions on software installation', relevance: 'primary' },
          { framework: 'cisControls', code: '4.1', title: 'Establish and Maintain a Secure Configuration Process', relevance: 'primary' },
          { framework: 'cisControls', code: '4.2', title: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure', relevance: 'primary' },
          { framework: 'cisControls', code: '4.3', title: 'Configure Automatic Session Locking on Enterprise Assets', relevance: 'primary' },
          { framework: 'cisControls', code: '4.4', title: 'Implement and Manage a Firewall on Servers', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.a', title: 'Risk analysis and information system security policies', relevance: 'supporting' }
        ],
        foundationContent: `Secure configuration management establishes and maintains security-hardened system configurations that eliminate vulnerabilities, reduce attack surfaces, and ensure consistent security posture across all organizational technology assets.

Configuration management requires establishing secure baselines, implementing change control processes, and continuously monitoring for configuration drift. This systematic approach prevents security gaps that arise from default configurations, unauthorized changes, or inconsistent deployments.

Modern configuration management must address cloud infrastructure, containers, mobile devices, and IoT systems while supporting DevOps practices and continuous deployment. Infrastructure as code and automated configuration management enable scalable, consistent security.`,
        implementationSteps: [
          'Establish secure configuration baselines using industry standards and organizational requirements',
          'Deploy configuration management tools for automated deployment and compliance monitoring',
          'Implement change control processes with security impact assessment and approval workflows',
          'Create configuration compliance monitoring with automated drift detection and remediation',
          'Establish hardening procedures for operating systems, applications, and network devices',
          'Deploy automated patching and configuration updates with testing and rollback capabilities',
          'Implement configuration documentation and version control for audit and troubleshooting',
          'Create exception management processes for configurations that cannot meet standard baselines'
        ],
        practicalTools: [
          'Configuration management: Ansible, Puppet, or Chef for automated deployment',
          'Compliance scanning: Nessus, Rapid7, or Qualys for configuration assessment',
          'Infrastructure as code: Terraform, CloudFormation, or ARM templates for cloud resources',
          'Baseline tools: CIS-CAT, SCAP scanners, or vendor-specific hardening tools',
          'Change management: ServiceNow, Jira, or dedicated ITSM platforms'
        ],
        auditEvidence: [
          'Secure configuration baselines with justification for settings and deviations',
          'Configuration management tool deployment records with coverage and compliance metrics',
          'Configuration compliance reports with drift detection and remediation tracking',
          'Change control records with security assessments and approval documentation',
          'Hardening procedure documentation with step-by-step implementation guides',
          'Configuration testing results with validation of security controls and functionality',
          'Exception management records with risk assessments and compensating controls'
        ],
        crossReferences: [
          'Vulnerability Management (secure configurations reduce vulnerability exposure)',
          'Asset Management (configuration management requires comprehensive asset inventory)',
          'Communications & Operations Management (configuration changes require operational procedures)'
        ]
      },

      'Audit Log Management': {
        category: 'Audit Log Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.15', title: 'Logging', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.16', title: 'Monitoring activities', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.4.1', title: 'Event logging', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.4.2', title: 'Protection of log information', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.4.3', title: 'Administrator and operator logs', relevance: 'primary' },
          { framework: 'cisControls', code: '8.1', title: 'Establish and Maintain an Audit Log Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '8.2', title: 'Collect Audit Logs', relevance: 'primary' },
          { framework: 'cisControls', code: 'A.8.3', title: 'Ensure Adequate Audit Log Storage', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Incident handling', relevance: 'supporting' }
        ],
        foundationContent: `Audit log management provides the foundation for security monitoring, incident investigation, and compliance demonstration through comprehensive collection, protection, and analysis of system and security events.

Effective log management encompasses log generation, collection, storage, protection, analysis, and retention across all systems and applications. This capability enables threat detection, forensic analysis, and regulatory compliance while supporting operational troubleshooting.

Modern log management must handle high-volume environments, cloud services, mobile devices, and distributed applications while providing real-time analysis and long-term retention. Security information and event management platforms enable centralized analysis and correlation.`,
        implementationSteps: [
          'Establish logging standards defining what events to log across all systems and applications',
          'Deploy centralized log collection with secure transmission and storage',
          'Implement log integrity protection with cryptographic signatures and immutable storage',
          'Create log analysis and correlation rules for security event detection',
          'Establish log retention policies meeting operational and regulatory requirements',
          'Deploy log monitoring with automated alerting for critical security events',
          'Implement log backup and recovery processes with disaster recovery capabilities',
          'Create log review procedures with regular analysis and investigation workflows'
        ],
        practicalTools: [
          'SIEM platforms: Splunk, IBM QRadar, or Microsoft Sentinel for centralized analysis',
          'Log collectors: Fluentd, Logstash, or native platform agents for data collection',
          'Log storage: Elasticsearch, ClickHouse, or cloud-native storage for scalable retention',
          'Analysis tools: Kibana, Grafana, or custom dashboards for visualization and investigation',
          'Compliance tools: LogRhythm, ArcSight, or specialized compliance reporting platforms'
        ],
        auditEvidence: [
          'Logging policy with standards for event types, retention, and protection requirements',
          'Log collection configuration with coverage verification and transmission security',
          'Log integrity verification records with hash validation and tamper detection',
          'Log analysis reports with security event detection and incident correlation',
          'Log retention documentation with policy compliance and storage management',
          'Log monitoring alerts with response times and investigation records',
          'Log backup and recovery test results with restoration verification'
        ],
        crossReferences: [
          'Information Security Incident Management (logs provide evidence for incident investigation)',
          'Access Control & Identity Management (access events must be logged and monitored)',
          'Compliance (audit logs provide evidence for regulatory compliance)'
        ]
      },

      'Supplier & Third-Party Risk Management': {
        category: 'Supplier & Third-Party Risk Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.19', title: 'Information security in supplier relationships', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.20', title: 'Addressing information security within supplier agreements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.21', title: 'Managing information security in the ICT supply chain', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.22', title: 'Monitoring, review and change management of supplier services', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.23', title: 'Information security for use of cloud services', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.30', title: 'Outsourced development', relevance: 'primary' },
          { framework: 'cisControls', code: '15.1', title: 'Establish and Maintain an Inventory of Authorized Service Providers', relevance: 'primary' },
          { framework: 'cisControls', code: '15.2', title: 'Establish and Maintain a Service Provider Management Policy', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.i', title: 'Supply chain security', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 28', title: 'Processor', relevance: 'supporting' }
        ],
        foundationContent: `Supplier and third-party risk management addresses security risks introduced through external relationships, outsourcing arrangements, and supply chain dependencies. This systematic approach ensures third parties meet organizational security requirements and do not introduce unacceptable risks.

Effective supplier management encompasses due diligence, contract management, ongoing monitoring, and incident coordination across all third-party relationships. The process must address both direct suppliers and extended supply chain risks including fourth-party relationships.

Modern supplier risk management must address cloud services, software as a service, development outsourcing, and global supply chains while maintaining security standards and regulatory compliance. Continuous monitoring and assessment are essential for dynamic risk management.`,
        implementationSteps: [
          'Create comprehensive supplier inventory with risk classifications and dependencies',
          'Establish supplier security assessment process with risk-based evaluation criteria',
          'Develop standard security requirements and contract clauses for supplier agreements',
          'Implement ongoing supplier monitoring with performance metrics and incident tracking',
          'Create supplier onboarding process with security verification and documentation',
          'Establish supplier incident response coordination with notification and escalation procedures',
          'Deploy supply chain security monitoring with threat intelligence and risk scoring',
          'Create supplier termination procedures with data return and access revocation'
        ],
        practicalTools: [
          'Vendor risk management: ServiceNow VRM, Resolver, or ProcessUnity for supplier assessment',
          'Contract management: Agiloft, ContractWorks, or legal department systems for agreement tracking',
          'Security assessments: StandardFusion, SHPS, or custom questionnaire platforms',
          'Supply chain monitoring: BitSight, SecurityScorecard, or RiskRecon for continuous assessment',
          'Due diligence platforms: Dun & Bradstreet, LexisNexis, or Thomson Reuters for background checks'
        ],
        auditEvidence: [
          'Supplier inventory with risk classifications and security assessment status',
          'Supplier security assessment reports with findings and risk ratings',
          'Supplier contracts with security requirements and service level agreements',
          'Supplier monitoring reports with performance metrics and incident tracking',
          'Supplier onboarding records with security verification and approval documentation',
          'Supply chain incident records with coordination and response evidence',
          'Supplier termination documentation with data return and access revocation verification'
        ],
        crossReferences: [
          'Risk Management (supplier risks must be identified, assessed, and treated)',
          'System Acquisition, Development & Maintenance (outsourced development requires supplier management)',
          'Data Protection (data processors require specific contractual protections)'
        ]
      },

      'Penetration Testing': {
        category: 'Penetration Testing',
        requirementReferences: [
          { framework: 'cisControls', code: '18.1', title: 'Establish and Maintain a Penetration Testing Program', relevance: 'primary' },
          { framework: 'cisControls', code: '18.2', title: 'Perform Periodic External Penetration Tests', relevance: 'primary' },
          { framework: 'cisControls', code: '18.3', title: 'Remediate Penetration Test Findings', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.34', title: 'Protection of information systems during audit testing', relevance: 'supporting' },
          { framework: 'iso27002', code: 'A.14.2.8', title: 'System security testing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.j', title: 'Measures to assess the effectiveness of cybersecurity risk-management measures', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.8.29', title: 'Security testing in development and acceptance', relevance: 'cross-reference' }
        ],
        foundationContent: `Penetration testing provides independent validation of security controls through simulated cyberattacks that identify vulnerabilities and assess organizational security posture. This proactive assessment complements vulnerability scanning with human expertise and real-world attack scenarios.

Effective penetration testing encompasses external and internal testing, web application testing, wireless security testing, and social engineering assessments. Testing must be conducted safely with appropriate scoping, authorization, and coordination to prevent operational disruption.

Modern penetration testing must address cloud environments, mobile applications, API security, and DevSecOps integration while providing actionable findings that improve security posture. Continuous security testing and red team exercises enhance ongoing validation.`,
        implementationSteps: [
          'Establish penetration testing program with regular testing schedules and scope definitions',
          'Engage qualified penetration testing providers with relevant certifications and experience',
          'Define testing scope and rules of engagement with appropriate authorizations and limitations',
          'Coordinate testing activities with operations teams to minimize business disruption',
          'Establish findings remediation process with priorities, timelines, and verification procedures',
          'Create retesting procedures to validate remediation effectiveness and closure',
          'Implement red team exercises for advanced persistent threat simulation',
          'Establish testing integration with development processes for application security validation'
        ],
        practicalTools: [
          'Testing frameworks: OWASP Testing Guide, NIST SP 800-115, or PTES for methodology',
          'Testing tools: Metasploit, Burp Suite, or Nmap for vulnerability exploitation and verification',
          'Reporting platforms: Dradis, PlexTrac, or custom reporting for findings management',
          'Scoping tools: Asset discovery and network mapping for comprehensive test coverage',
          'Coordination platforms: Project management and communication tools for testing coordination'
        ],
        auditEvidence: [
          'Penetration testing program documentation with schedules and scope definitions',
          'Penetration testing reports with findings, risk ratings, and remediation recommendations',
          'Testing authorization records with scope agreements and rules of engagement',
          'Remediation tracking with finding status, responsible parties, and completion dates',
          'Retest results with verification of remediation effectiveness and control validation',
          'Testing coordination records with operational impact assessments and approvals',
          'Testing provider qualifications with certifications and relevant experience validation'
        ],
        crossReferences: [
          'Vulnerability Management (penetration testing validates vulnerability remediation effectiveness)',
          'Risk Management (testing results inform risk assessments and treatment decisions)',
          'System Acquisition, Development & Maintenance (application testing validates secure development)'
        ]
      },

      'Email & Web Browser Protections': {
        category: 'Email & Web Browser Protections',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.23', title: 'Web filtering', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.2.1', title: 'Information transfer policies and procedures', relevance: 'supporting' },
          { framework: 'cisControls', code: '9.1', title: 'Ensure Use of Only Fully Supported Browsers and Email Clients', relevance: 'primary' },
          { framework: 'cisControls', code: '9.2', title: 'Use DNS Filtering Services', relevance: 'primary' },
          { framework: 'cisControls', code: '9.3', title: 'Maintain and Enforce Network-Based URL Filters', relevance: 'primary' },
          { framework: 'cisControls', code: '9.4', title: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions', relevance: 'primary' },
          { framework: 'cisControls', code: '9.5', title: 'Implement DMARC and Enable Receiver-Side Verification', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Incident handling', relevance: 'supporting' }
        ],
        foundationContent: `Email and web browser protections defend against the most common attack vectors used by cybercriminals to deliver malware, conduct phishing attacks, and establish initial access to organizational systems. These controls protect users during their most vulnerable online activities.

Email security requires comprehensive protection including attachment scanning, link protection, spam filtering, and anti-phishing measures. Web browsing protection encompasses URL filtering, malicious site blocking, browser hardening, and safe browsing policies.

Modern email and web protection must address sophisticated attacks including business email compromise, zero-day exploits, and social engineering while enabling legitimate business communications and web usage. Cloud-based security services provide scalable, up-to-date protection.`,
        implementationSteps: [
          'Deploy comprehensive email security with attachment scanning, link protection, and anti-phishing',
          'Implement web filtering with malicious site blocking and category-based restrictions',
          'Configure DNS filtering to block malicious domains and command-and-control communications',
          'Establish browser security policies with extension restrictions and security hardening',
          'Deploy email authentication with SPF, DKIM, and DMARC to prevent spoofing',
          'Create safe email and browsing policies with user guidelines and restrictions',
          'Implement email encryption for sensitive communications and regulatory compliance',
          'Establish incident response procedures for email and web-based security events'
        ],
        practicalTools: [
          'Email security: Proofpoint, Mimecast, or Microsoft Defender for comprehensive protection',
          'Web filtering: Zscaler, Cisco Umbrella, or Forcepoint for URL and content filtering',
          'DNS filtering: Quad9, OpenDNS, or Cloudflare for malicious domain blocking',
          'Browser management: Group Policy, Jamf, or mobile device management for configuration control',
          'Email encryption: Microsoft Information Protection, Virtru, or Zix for sensitive communications'
        ],
        auditEvidence: [
          'Email security policy with acceptable use guidelines and security procedures',
          'Email security deployment records with protection coverage and configuration verification',
          'Web filtering reports with blocked sites, malware prevention, and policy enforcement',
          'Browser security configuration with hardening settings and extension management',
          'Email authentication records with SPF, DKIM, and DMARC implementation verification',
          'Security incident records related to email and web-based attacks with response actions',
          'User training records for safe email and browsing practices'
        ],
        crossReferences: [
          'Security Awareness & Skills Training (user education prevents email and web-based attacks)',
          'Malware Defenses (email and web protections complement endpoint security)',
          'Information Security Incident Management (email and web attacks often trigger incident response)'
        ]
      },

      'Network Monitoring & Defense': {
        category: 'Network Monitoring & Defense',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.16', title: 'Monitoring activities', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.4.1', title: 'Event logging', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.1.1', title: 'Network controls', relevance: 'primary' },
          { framework: 'cisControls', code: '13.1', title: 'Centralize Security Event Alerting', relevance: 'primary' },
          { framework: 'cisControls', code: '13.2', title: 'Deploy a Host-Based Intrusion Detection System', relevance: 'primary' },
          { framework: 'cisControls', code: '13.3', title: 'Deploy a Network Intrusion Detection System', relevance: 'primary' },
          { framework: 'cisControls', code: '13.4', title: 'Perform Traffic Filtering Between Network Segments', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Incident handling', relevance: 'supporting' }
        ],
        foundationContent: `Network monitoring and defense provides continuous visibility into network traffic and security events to detect, analyze, and respond to threats in real-time. This capability forms the foundation for threat detection, incident response, and security operations.

Network defense combines intrusion detection, traffic analysis, behavioral monitoring, and threat hunting to identify both known and unknown threats. The approach must provide comprehensive coverage while minimizing false positives and enabling rapid response.

Modern network monitoring must handle encrypted traffic, cloud environments, remote work, and high-speed networks while providing actionable intelligence for security teams. Machine learning and behavioral analysis enhance detection of sophisticated attacks.`,
        implementationSteps: [
          'Deploy network intrusion detection systems with comprehensive traffic monitoring coverage',
          'Implement security information and event management for centralized analysis and correlation',
          'Establish network traffic analysis with baseline behavior and anomaly detection',
          'Create security monitoring procedures with alert triage and escalation workflows',
          'Deploy threat hunting capabilities with proactive analysis and investigation',
          'Implement network forensics with packet capture and analysis capabilities',
          'Establish threat intelligence integration with automated indicator consumption',
          'Create security operations center with 24/7 monitoring and response capabilities'
        ],
        practicalTools: [
          'Network IDS: Suricata, Snort, or commercial platforms like Palo Alto Networks for traffic analysis',
          'SIEM platforms: Splunk, IBM QRadar, or Microsoft Sentinel for event correlation',
          'Network monitoring: SolarWinds, PRTG, or Nagios for infrastructure visibility',
          'Threat hunting: Falcon X, CrowdStrike, or open-source tools like YARA for proactive detection',
          'Packet analysis: Wireshark, NetworkMiner, or specialized forensics platforms'
        ],
        auditEvidence: [
          'Network monitoring policy with coverage requirements and response procedures',
          'Network IDS deployment records with sensor placement and configuration verification',
          'SIEM configuration with use cases, correlation rules, and alert workflows',
          'Network traffic analysis reports with baseline establishment and anomaly detection',
          'Threat hunting reports with investigation findings and threat intelligence integration',
          'Security incident records with network-based detection and response evidence',
          'Security operations procedures with monitoring responsibilities and escalation processes'
        ],
        crossReferences: [
          'Audit Log Management (network monitoring generates logs requiring management and analysis)',
          'Information Security Incident Management (network monitoring detects incidents requiring response)',
          'Network Infrastructure Management (monitoring requires comprehensive network visibility)'
        ]
      }
    };

    return categoryMap[cleanCategory] || null;
  }

  /**
   * Get default guidance for unmapped categories
   */
  private static getDefaultGuidance(category: string): string {
    return `FRAMEWORK REFERENCES:

Selected frameworks contain requirements relevant to ${category}. Specific requirement codes and titles will be populated based on your framework selection.

UNDERSTANDING THE REQUIREMENTS:

This category addresses important security and compliance requirements that help ensure your organization meets industry standards and regulatory obligations. Implementation requires systematic planning, appropriate controls, and ongoing monitoring.

IMPLEMENTATION APPROACH:

1. Review all applicable requirements from your selected frameworks
2. Assess current organizational capabilities and identify gaps
3. Develop implementation plan with clear timelines and responsibilities
4. Deploy necessary controls and update procedures
5. Train personnel on new requirements and procedures
6. Monitor compliance and conduct regular reviews

PRACTICAL TOOLS AND EXAMPLES:

• Framework-specific guidance documents and implementation templates
• Industry best practice resources and benchmarking studies
• Professional services and consulting support for complex implementations
• Training programs and certification courses for technical competency

AUDIT EVIDENCE CHECKLIST:

✓ Policy and procedure documentation with management approval
✓ Implementation records with deployment dates and responsible parties
✓ Training completion records for all relevant personnel
✓ Regular assessment reports with findings and corrective actions
✓ Monitoring and measurement evidence demonstrating ongoing compliance

RELATED CATEGORIES:

This category typically relates to other compliance and security domains. Cross-references will be identified based on your specific framework selection and organizational context.`;
  }
}