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
        foundationContent: `**a) Leadership commitment** 
Your organization's top management must actively lead information security initiatives. This means documented commitment, regular reviews (at least quarterly), and personal accountability. Leadership commitment includes assigning adequate resources, participating in security decisions, and setting the security culture tone throughout the organization.

**b) Scope and boundaries**
Clearly document your Information Security Management System (ISMS) scope including physical locations, logical boundaries, included/excluded systems, interfaces with third parties, and business processes covered. Make scope statement publicly available and review it with any significant organizational changes.

**c) Organizational structure** 
Define and document all security roles including Information Security Officer, Data Protection Officer (if GDPR applicable), Incident Response Manager, Risk Owners, and Asset Owners. Each role must have clear written responsibilities, authorities, and reporting lines. Review and update annually or when organizational changes occur.

**d) Policy framework**
Your information security policy becomes the cornerstone document where governance is documented, approved, and communicated. Set real deadlines - establish comprehensive security policies with specific timelines, have incident response plans ready for notifications, notify supervisory authority within 72h when personal data breaches likely result in high risk to individuals, notify national competent authority within 24h for significant incidents, keep audit logs for at least 90 days, and patch vulnerabilities monthly.

**e) Project management**
Security must be integrated into all project processes including planning, development, and deployment. Project managers must include security in project planning, conduct security reviews at key milestones, and perform testing before deployment. All projects must complete security impact assessments and maintain security documentation throughout the project lifecycle.

**f) Asset use and disposal policies**
Define acceptable use and secure disposal procedures for all information assets. Define acceptable use policies for information and associated assets covering permitted activities, prohibited actions, and monitoring procedures. Establish asset return and disposal procedures ensuring secure data destruction, documentation of disposal activities, and proper handling of both physical and digital assets during termination, transfer, or end of life.

**g) Documented procedures and evidence**
Maintain documented operating procedures for ALL security processes. Keep evidence of lawful basis for data processing, risk assessments, incident reports, audit results, management decisions, training records, and certifications. Documentation must be version controlled.

**h) Personnel security framework**
Comprehensive employment security including terms, screening, NDAs, and termination procedures. Leadership framework with leadership responsibilities - employment terms and conditions with defined security responsibilities and accountabilities, confidentiality/non-disclosure agreements.

**i) Competence management**
Determine and ensure the necessary competence of persons doing work that affects information security performance. This includes defining competence for each security role, providing appropriate education/training/experience, evaluating effectiveness of competence actions, and maintaining documented evidence of competence.

**j) Monitoring and reporting**
Conduct internal ISMS audits at planned intervals (minimum annually), management reviews (minimum quarterly), and maintain continuous monitoring. Document ALL activities, findings, and corrective actions. Report status to management with specific metrics and KPIs.

**k) Change management and control**
Establish formal change management processes for ISMS. All system changes must follow documented procedures with security impact assessments, testing, and approval workflows. Implement change advisory boards for significant changes and maintain detailed change logs for audit purposes.

**l) Relationships**
Documented procedures for supervisory authority cooperation (including breach notifications), competent authority reporting (incident warnings), law enforcement cooperation, and industry information sharing. Maintain current contact lists and communication templates.

**m) Incident response governance**
Designate incident response manager plus backup (review annually). Establish 24/7 contact information for incident reporting. Define procedures including clear thresholds for significant incidents. Establish incident classifications with escalation procedures.

**n) Third party governance**
ALL service provider contracts MUST include security, incident notification (specify timeframes), audit rights, data protection clauses, termination procedures with data return/destruction, and verification. Monitor providers monthly and conduct annual security reviews.

**o) Continuous improvement**
Implement formal processes for learning from incidents, updating policies based on new threats, addressing audit findings within 30 days, tracking security metrics, and demonstrating year over year improvement.

**p) Awareness training**
Establish comprehensive security awareness training program at governance level - define training strategy, allocate resources, measure effectiveness, and ensure management commitment. This governance requirement oversees the detailed training requirements found in Security Awareness & Skills Training category.`,
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
          { framework: 'iso27001', code: 'A.5.18', title: 'Authentication rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.2', title: 'Privileged access rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.3', title: 'Information access restriction', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.5', title: 'Secure authentication', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.9.1.1', title: 'Access control policy', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Identity and access management', relevance: 'primary' },
          { framework: 'cisControls', code: '5.1', title: 'Establish and Maintain an Inventory of Accounts', relevance: 'primary' },
          { framework: 'cisControls', code: '6.1', title: 'Establish an Access Granting Process', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.1.b', title: 'Ability to ensure ongoing confidentiality', relevance: 'supporting' }
        ],
        foundationContent: `**a) Access control policy**
Establish comprehensive access control policy defining how access to information systems and data is granted, managed, and revoked. Policy must specify role-based access control principles, least privilege enforcement, segregation of duties requirements, and business justification processes. Document clear procedures for access request, approval, provisioning, and regular review cycles.

**b) Identity lifecycle management**
Implement systematic identity management covering the complete user lifecycle from onboarding to termination. Create unique identifiers for all users, devices, and services requiring system access. Establish identity proofing procedures for new accounts, maintain central identity repository, and implement automated provisioning and deprovisioning workflows.

**c) Authentication and credentials**
Protect authentication information to prevent unauthorized access to systems and data. Enforce strong password requirements, implement multi-factor authentication for sensitive access, protect stored credentials with encryption, require password changes for default accounts, monitor for compromised credentials, and provide user education on credential protection.

**d) Access rights management**
Manage access rights to ensure users have appropriate permissions aligned with job responsibilities. Document access request and approval processes, implement formal access provisioning workflows, conduct regular access reviews (quarterly), remove or modify access for role changes, monitor privileged access usage, and maintain access rights audit trails.

**e) Privileged access controls**
Implement enhanced controls for privileged access including administrative accounts, system accounts, and elevated permissions. Deploy privileged access management solutions with session monitoring, require additional approval workflows, implement break-glass emergency access procedures, and maintain detailed logging of all privileged activities.

**f) System and application access**
Control access to information systems and applications based on business requirements and security policies. Implement role-based access control (RBAC), apply principle of least privilege throughout systems, limit access based on network location and device compliance, and ensure proper access control for both on-premises and cloud-based systems.

**g) Network access controls**
Manage and control access to networks and network services. Implement network segmentation to limit lateral movement, deploy secure remote access solutions, control wireless network access, and monitor network access patterns for anomalous behavior.

**h) Access monitoring and logging**
Monitor and log access to sensitive resources and systems. Implement comprehensive logging of authentication events, access attempts, privilege escalation, and administrative activities. Deploy automated alerting for access violations, failed authentication attempts, and unusual access patterns.

**i) Regular access reviews**
Conduct systematic reviews of user access rights and permissions. Perform quarterly access recertification, validate business justification for access rights, identify and remediate excessive permissions, and document review results with corrective actions taken.

**j) Automated account management**
Deploy automated solutions for account lifecycle management. Implement automated dormant account detection (45-day threshold), automated account disabling for terminated users, integration with HR systems for role changes, and automated compliance reporting for access management activities.`,
        implementationSteps: [
          'Implement identity lifecycle management with automated provisioning and deprovisioning',
          'Deploy multi-factor authentication for all privileged and remote access',
          'Establish role-based access control with least privilege principles',
          'Create privileged access management solution with session monitoring',
          'Implement regular access reviews and recertification processes',
          'Deploy single sign-on to reduce password proliferation and improve user experience',
          'Establish access control monitoring with automated alerting for violations',
          'Create emergency access procedures with proper controls and auditing',
          'Deploy automated dormant account detection (45-day threshold) with disable workflow'
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
          'Role definitions with associated permissions and business justifications',
          'Automated dormant account reports showing 45-day detection and disable actions',
          'Account reactivation approval workflows and verification procedures'
        ],
        crossReferences: [
          'Governance & Leadership (establishes access control policies and oversight)',
          'Asset Management (defines what resources need access controls)',
          'Security Awareness & Skills Training (trains users on proper access practices)'
        ]
      },

      'Business Continuity Management': {
        category: 'Business Continuity Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.29', title: 'Information security during disruption', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.30', title: 'ICT readiness for business continuity', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.14', title: 'Redundancy of information processing facilities', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.29.1', title: 'Information security during disruption', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.30.1', title: 'ICT readiness for business continuity', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.c', title: 'Business continuity measures', relevance: 'primary' },
          { framework: 'cisControls', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', relevance: 'primary' },
          { framework: 'cisControls', code: '11.2', title: 'Perform Automated Backups', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.1.c', title: 'Ability to restore availability and access to personal data', relevance: 'supporting' }
        ],
        foundationContent: `**a) Business impact analysis**
Conduct comprehensive business impact analysis to identify critical business functions, dependencies, and recovery priorities. Document maximum tolerable downtime for each critical process, identify resource requirements for recovery operations, analyze financial and operational impacts of disruptions, and establish recovery time objectives (RTO) and recovery point objectives (RPO) for each critical system and process.

**b) Business continuity strategy**
Develop business continuity strategy based on business impact analysis results. Define recovery strategies for different disruption scenarios, establish alternate processing facilities and communication channels, plan for workforce continuity including remote work capabilities, and ensure strategy aligns with business priorities and budget constraints.

**c) Business continuity planning**
Create detailed business continuity plans with step-by-step recovery procedures. Document recovery procedures for all critical systems and processes, define roles and responsibilities for business continuity teams, establish communication plans and notification procedures, and integrate business continuity planning with incident response and crisis management procedures.

**d) Information security during disruption**
Ensure information security controls remain effective during business disruption scenarios. Maintain security controls during emergency operations, implement secure remote access for business continuity operations, protect information assets during recovery activities, and ensure backup systems maintain equivalent security controls to primary systems.

**e) ICT readiness and redundancy**
Implement ICT infrastructure redundancy and readiness measures to support business continuity. Deploy redundant information processing facilities, implement network and communication redundancy, establish backup power and environmental controls, and ensure ICT systems can support business continuity requirements during disruptions.

**f) Data recovery and backup management**
Establish and maintain comprehensive data recovery processes with automated backup solutions. Implement automated backup scheduling and monitoring, define backup retention policies aligned with business and compliance requirements, conduct regular backup verification and integrity testing, and maintain backup system architecture documentation with recovery procedures.

**g) Recovery testing and validation**
Conduct regular testing of business continuity and recovery procedures. Schedule recovery testing for all critical systems, perform tabletop exercises and full-scale simulations, document test results and lessons learned, validate recovery procedures work within defined RTO and RPO objectives, and update plans based on testing outcomes.

**h) Business continuity team management**
Create and train business continuity teams with clearly defined roles and responsibilities. Establish business continuity team structure with primary and backup personnel, provide regular training and awareness programs, maintain current contact information and escalation procedures, and ensure team members understand their roles during different types of disruptions.

**i) Supplier and third-party continuity**
Ensure business continuity arrangements cover suppliers and third-party dependencies. Assess business continuity capabilities of critical suppliers, include business continuity requirements in supplier contracts, establish alternative supplier arrangements where feasible, and coordinate business continuity planning with key suppliers and partners.

**j) Continuous improvement**
Implement continuous improvement processes for business continuity management. Review and update business continuity plans based on organizational changes, incorporate lessons learned from incidents and exercises, update plans based on emerging threats and changing business environment, and ensure business continuity management evolves with business needs and technological changes.`,
        implementationSteps: [
          'Conduct business impact analysis to identify critical functions and dependencies',
          'Define recovery time objectives (RTO) and recovery point objectives (RPO) for each critical system',
          'Implement automated backup solutions with regular testing and verification',
          'Develop detailed recovery procedures with step-by-step instructions',
          'Establish alternate processing facilities and communication channels',
          'Create and train business continuity teams with defined roles and responsibilities',
          'Conduct regular business continuity exercises and tabletop scenarios',
          'Integrate business continuity planning with incident response procedures'
        ],
        practicalTools: [
          'Business continuity planning software: Fusion Risk Management, MetricStream, or Resolver',
          'Backup and recovery solutions: Veeam, Acronis, or cloud-native backup services',
          'Disaster recovery as a service: AWS Disaster Recovery, Azure Site Recovery, or Zerto',
          'Communication platforms: Emergency notification systems and collaboration tools',
          'Testing frameworks: Recovery testing automation and validation tools'
        ],
        auditEvidence: [
          'Business impact analysis with criticality ratings and recovery objectives',
          'Business continuity plan with procedures for all critical systems and processes',
          'Backup system configuration showing automated schedules and retention policies',
          'Recovery testing results demonstrating successful restoration within RTO/RPO',
          'Business continuity team training records and contact information',
          'Emergency communication procedures and notification system testing',
          'Tabletop exercise results and lessons learned documentation',
          'Integration documentation showing alignment with incident response procedures'
        ],
        crossReferences: [
          'Risk Management (provides input for business impact analysis)',
          'Information Security Incident Management (coordinates response to disruptions)',
          'Asset Management (identifies critical assets requiring protection and recovery)'
        ]
      },

      'Security Awareness & Skills Training': {
        category: 'Security Awareness & Skills Training',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.6.3', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.6.3.1', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Human resource security measures', relevance: 'primary' },
          { framework: 'cisControls', code: '14.1', title: 'Establish and Maintain a Security Awareness Program', relevance: 'primary' },
          { framework: 'cisControls', code: '14.2', title: 'Train Workforce Members to Recognize Social Engineering Attacks', relevance: 'primary' },
          { framework: 'cisControls', code: '14.3', title: 'Train Workforce Members on Authentication Best Practices', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.4', title: 'Steps to ensure personnel are aware of security measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Security awareness program establishment**
Establish and maintain a comprehensive security awareness program with documented charter and objectives. Define program scope covering all personnel and relevant external parties, develop program governance structure with management oversight, allocate adequate resources including budget and personnel, and establish program metrics and effectiveness measurement criteria.

**b) Training curriculum development**
Develop comprehensive training curriculum addressing all relevant security topics and role-specific requirements. Create annual security awareness training materials, develop role-specific training content for different job functions, design engaging and interactive training delivery methods, and establish training schedules and mandatory participation requirements.

**c) Social engineering awareness**
Train workforce members to recognize and respond to social engineering attacks including phishing, vishing, smishing, and physical social engineering attempts. Implement phishing simulation programs with progressive difficulty levels, provide immediate feedback and remedial training for failures, track improvement metrics and behavioral change, and integrate social engineering awareness into regular security communications.

**d) Authentication and password security**
Train workforce members on authentication best practices and password security. Educate users on strong password creation and management, provide guidance on multi-factor authentication usage, train users on recognizing credential theft attempts, and establish clear procedures for reporting compromised accounts or suspicious authentication activities.

**e) Data protection and handling**
Provide training on proper data protection and information handling procedures. Educate personnel on data classification schemes and handling requirements, train users on secure data transmission and storage practices, provide guidance on data retention and disposal procedures, and ensure understanding of privacy requirements and personal data protection obligations.

**f) Incident reporting and response**
Train all personnel on security incident identification and reporting procedures. Establish clear incident reporting channels and contact information, provide training on recognizing different types of security incidents, educate users on proper incident response procedures and their roles, and ensure understanding of incident escalation and communication requirements.

**g) Physical security awareness**
Provide training on physical security practices and environmental controls. Educate personnel on physical access control procedures, train users on proper visitor management and tailgating prevention, provide guidance on clean desk policies and information protection, and ensure understanding of device security and theft prevention measures.

**h) Mobile device and remote work security**
Train users on secure mobile device usage and remote work practices. Provide guidance on mobile device security configurations and management, educate users on secure remote access procedures and VPN usage, train personnel on public Wi-Fi risks and secure communication practices, and establish clear policies for personal device usage and BYOD security.

**i) Program effectiveness measurement**
Implement comprehensive measurement and evaluation of security awareness program effectiveness. Conduct regular security culture surveys and behavior assessments, measure training completion rates and knowledge retention, track security incident trends and correlation with training activities, and implement continuous improvement processes based on measurement results.

**j) Ongoing reinforcement and communication**
Establish ongoing security awareness reinforcement and communication activities. Implement regular security awareness campaigns and communications, provide timely security alerts and threat intelligence updates, conduct security awareness events and recognition programs, and ensure continuous reinforcement of security messages through multiple channels and formats.`,
        implementationSteps: [
          'Develop security awareness program charter with clear objectives and success metrics',
          'Conduct role-based security training needs assessment',
          'Create engaging, relevant training content for different audiences and delivery methods',
          'Implement learning management system with tracking and reporting capabilities',
          'Deploy phishing simulation programs with progressive difficulty and remedial training',
          'Establish security awareness communication campaigns and reinforcement activities',
          'Measure program effectiveness through behavior change metrics and incident correlation',
          'Continuously update training content based on emerging threats and organizational changes'
        ],
        practicalTools: [
          'Learning management systems: Cornerstone OnDemand, Docebo, or specialized security training platforms',
          'Phishing simulation platforms: KnowBe4, Proofpoint Security Awareness, or Microsoft Defender for Office 365',
          'Security awareness content: SANS Security Awareness, NIST training materials, or custom development',
          'Behavior measurement tools: Security culture surveys and incident correlation analytics',
          'Communication platforms: Internal newsletters, intranet portals, and digital signage systems'
        ],
        auditEvidence: [
          'Security awareness program documentation and charter with management approval',
          'Training curriculum and materials with role-specific content and delivery schedules',
          'Learning management system reports showing training completion and effectiveness metrics',
          'Phishing simulation results with click rates, reporting rates, and improvement trends',
          'Security awareness campaign materials and communication records',
          'Program effectiveness surveys and behavior change measurement results',
          'Training needs assessment and content update documentation',
          'Integration records showing alignment with incident response and policy awareness'
        ],
        crossReferences: [
          'Governance & Leadership (provides oversight and resources for awareness programs)',
          'Access Control & Identity Management (reinforces proper authentication and access practices)',
          'Information Security Incident Management (integrates reporting and response training)'
        ]
      },

      'Asset Management': {
        category: 'Asset Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.9', title: 'Inventory of information and other associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.10', title: 'Acceptable use of information and other associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.11', title: 'Return of assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.12', title: 'Classification of information', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.8.1.1', title: 'Inventory of assets', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'primary' },
          { framework: 'cisControls', code: '1.2', title: 'Address Unauthorized Assets', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.a', title: 'Risk analysis and information system security policies', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 30', title: 'Records of processing activities', relevance: 'supporting' }
        ],
        foundationContent: `**a) Asset inventory establishment**
Establish and maintain a detailed inventory of all information and other associated assets. Create comprehensive asset registers covering hardware, software, data, facilities, and personnel assets. Assign unique identifiers to all assets, document asset ownership and custodianship, and maintain current inventory records with regular updates and verification processes.

**b) Asset classification and labeling**
Implement systematic classification of information assets based on their value, sensitivity, and criticality to business operations. Develop clear classification schemes with defined levels and criteria, apply appropriate labels and markings to classified assets, and ensure classification decisions consider legal, regulatory, and business requirements.

**c) Asset ownership and responsibility**
Assign clear ownership and custodianship responsibilities for all assets throughout their lifecycle. Designate asset owners responsible for protection and acceptable use decisions, assign custodians responsible for day-to-day asset handling and maintenance, and document ownership assignments with clear accountability and reporting structures.

**d) Acceptable use policies**
Define and enforce acceptable use policies for information and associated assets. Establish clear guidelines for authorized asset usage, prohibit unauthorized activities and personal use, implement monitoring and enforcement mechanisms, and provide training and awareness on acceptable use requirements.

**e) Asset handling and protection**
Implement appropriate handling and protection procedures for all asset types. Establish secure storage and access controls for physical and digital assets, implement protection measures proportionate to asset classification levels, and ensure proper handling throughout asset lifecycle including creation, usage, transmission, and storage.

**f) Asset return and transfer**
Establish procedures for asset return and transfer during employment changes and termination. Implement systematic asset recovery processes, maintain records of asset assignments and returns, ensure complete data removal from returned devices, and establish procedures for emergency asset recovery situations.

**g) Asset lifecycle management**
Manage assets throughout their complete lifecycle from acquisition to disposal. Implement processes for asset procurement and onboarding, maintain assets during operational use with appropriate maintenance and updates, plan for asset retirement and replacement, and ensure secure disposal with proper data destruction.

**h) Unauthorized asset management**
Implement procedures to identify and address unauthorized assets on the network. Deploy automated discovery tools to detect unknown devices, establish processes for investigating and addressing unauthorized assets, implement network access controls to prevent unauthorized connections, and maintain logs of unauthorized asset incidents.

**i) Asset vulnerability management**
Maintain awareness of vulnerabilities affecting organizational assets. Implement vulnerability scanning and assessment programs, track vulnerabilities across all asset types, prioritize remediation based on asset criticality and risk exposure, and maintain vulnerability management databases with tracking and reporting capabilities.

**j) Asset disposal and destruction**
Implement secure disposal procedures for assets at end of lifecycle. Ensure complete data destruction before asset disposal, maintain documentation of disposal activities and certificates of destruction, implement environmentally responsible disposal methods, and establish procedures for emergency disposal situations.`,
        implementationSteps: [
          'Conduct comprehensive asset discovery and catalog all organizational assets',
          'Implement asset classification scheme with clear levels and criteria',
          'Assign asset ownership and custodianship with documented responsibilities',
          'Develop and deploy acceptable use policies for all asset types',
          'Implement asset protection measures appropriate to classification levels',
          'Establish asset lifecycle management processes from acquisition to disposal',
          'Deploy automated tools for asset tracking and unauthorized asset detection',
          'Create secure asset disposal procedures with proper data destruction'
        ],
        practicalTools: [
          'Asset discovery tools: Lansweeper, ManageEngine AssetExplorer, or Tanium',
          'Configuration management databases (CMDB): ServiceNow, Device42, or Freshservice',
          'Data classification tools: Microsoft Purview, Varonis, or Forcepoint',
          'Mobile device management: Microsoft Intune, VMware Workspace ONE, or Jamf',
          'Vulnerability management: Qualys, Rapid7, or Tenable'
        ],
        auditEvidence: [
          'Comprehensive asset inventory with ownership assignments and classifications',
          'Asset classification policy and procedures with management approval',
          'Acceptable use policies with employee acknowledgment records',
          'Asset handling and protection procedures appropriate to classification levels',
          'Asset return procedures and records of asset recovery activities',
          'Asset disposal procedures with certificates of destruction',
          'Unauthorized asset detection reports and remediation records',
          'Asset lifecycle management procedures and implementation evidence'
        ],
        crossReferences: [
          'Risk Management (uses asset inventory for risk assessment)',
          'Access Control & Identity Management (protects access to classified assets)',
          'Physical & Environmental Security (protects physical assets and facilities)'
        ]
      },

      'Physical & Environmental Security': {
        category: 'Physical & Environmental Security',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.7.1', title: 'Physical security perimeters', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.2', title: 'Physical entry', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.3', title: 'Protection against environmental threats', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.4', title: 'Equipment siting and protection', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.11.1.1', title: 'Physical security perimeter', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Physical and environmental security', relevance: 'primary' },
          { framework: 'cisControls', code: '12.8', title: 'Establish and Maintain Dedicated Computing Resources for All Administrative Work', relevance: 'supporting' }
        ],
        foundationContent: `**a) Physical security perimeters**
Establish physical security perimeters around areas containing information processing facilities. Define clear security perimeters with appropriate barriers and entry controls, implement layered perimeter security with multiple protection zones, ensure perimeters are clearly marked and monitored, and regularly review perimeter effectiveness against current threats.

**b) Physical entry controls**
Control physical entry to secure areas through appropriate access control systems. Implement access controls such as card readers, biometric systems, or security guards, maintain visitor management systems with logging and escort procedures, establish different access levels for different security zones, and ensure entry controls are regularly tested and maintained.

**c) Protection against environmental threats**
Implement protection measures against environmental threats including natural disasters, extreme weather, and human-caused environmental hazards. Install environmental monitoring systems for temperature, humidity, smoke, and water detection, implement fire suppression and detection systems, establish earthquake and flood protection measures, and create emergency response procedures for environmental incidents.

**d) Equipment siting and protection**
Ensure information processing equipment is properly sited and protected from environmental hazards and unauthorized access. Position equipment away from environmental threats and unauthorized viewing, implement secure equipment rooms with appropriate access controls, provide adequate cooling, power, and ventilation for equipment operations, and establish equipment protection measures during maintenance activities.

**e) Secure work areas**
Establish secure work areas for processing sensitive information with appropriate physical and environmental controls. Implement clear desk and clear screen policies, control access to work areas containing sensitive information, provide secure storage for sensitive materials and media, and establish procedures for working with classified information in designated areas.

**f) Equipment maintenance and disposal**
Implement secure procedures for equipment maintenance and disposal activities. Ensure maintenance is performed by authorized personnel with appropriate security clearances, implement data protection measures during maintenance activities, establish secure disposal procedures with complete data destruction, and maintain records of all maintenance and disposal activities.

**g) Removal of assets**
Control the removal of assets from organizational premises with appropriate authorization and tracking procedures. Implement asset removal authorization processes with management approval, maintain logs of all asset movements and removals, ensure proper packaging and protection during transport, and establish procedures for emergency asset evacuation.

**h) Cabling security**
Protect network and power cabling from interception, interference, and physical damage. Route cables through secure areas and protected conduits, implement cable separation to prevent electromagnetic interference, establish cable inspection and maintenance procedures, and ensure cables are properly secured and protected from unauthorized access.

**i) Supporting utilities**
Ensure supporting utilities such as electricity, telecommunications, water, and gas are adequately protected and maintained. Implement backup power systems with adequate capacity and testing procedures, protect utility connections and distribution systems, establish utility monitoring and maintenance procedures, and create emergency procedures for utility failures.

**j) Storage media handling**
Implement secure procedures for handling storage media throughout its lifecycle. Establish media creation, handling, and distribution procedures, implement secure storage for media containing sensitive information, ensure proper media transportation with appropriate protection, and establish secure media disposal procedures with complete data destruction.`,
        implementationSteps: [
          'Conduct physical security risk assessment of all organizational facilities',
          'Implement layered physical security perimeters with appropriate controls',
          'Deploy physical access control systems with proper authentication methods',
          'Install environmental monitoring and protection systems',
          'Establish secure work areas with clear desk and screen policies',
          'Implement equipment maintenance and disposal security procedures',
          'Deploy cabling security measures and utility protection systems',
          'Create comprehensive physical security policies and procedures'
        ],
        practicalTools: [
          'Physical access control systems: HID, Honeywell, or Johnson Controls',
          'Environmental monitoring: APC, Schneider Electric, or Vertiv',
          'Video surveillance: Axis, Hikvision, or Bosch security cameras',
          'Intrusion detection: DSC, Honeywell, or Bosch alarm systems',
          'Fire suppression: FM-200, Novec 1230, or water-based systems'
        ],
        auditEvidence: [
          'Physical security risk assessment and perimeter design documentation',
          'Physical access control system configuration and user access records',
          'Environmental monitoring system logs and alert records',
          'Equipment maintenance records and security procedures',
          'Asset removal logs and authorization records',
          'Cabling security implementation and inspection records',
          'Utility protection measures and backup system test records',
          'Storage media handling procedures and disposal certificates'
        ],
        crossReferences: [
          'Asset Management (protects physical assets and equipment)',
          'Access Control & Identity Management (integrates with physical access controls)',
          'Business Continuity Management (supports facility continuity and recovery)'
        ]
      },

      'Communications & Operations Management': {
        category: 'Communications & Operations Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.1', title: 'Operational procedures and responsibilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.6', title: 'Capacity management', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.7', title: 'System installation', relevance: 'primary' },
          { framework: 'cisControls', code: '12.1', title: 'Ensure Network Infrastructure is Up-to-Date', relevance: 'primary' },
          { framework: 'cisControls', code: '12.2', title: 'Establish and Maintain a Secure Network Architecture', relevance: 'primary' },
          { framework: 'cisControls', code: '12.3', title: 'Securely Manage Network Assets', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.f', title: 'Network and information systems management', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.1.1', title: 'Documented operating procedures', relevance: 'primary' }
        ],
        foundationContent: `**a) Operational procedures and responsibilities**
Establish documented operating procedures for all critical information systems and network infrastructure. Define clear operational responsibilities with detailed procedures, implement change control processes with proper approvals, establish maintenance windows and procedures, and ensure all operational activities are properly documented and monitored.

**b) Network infrastructure management**
Ensure network infrastructure is up-to-date and securely configured for reliable operations. Maintain network infrastructure inventory with current firmware/software versions, implement patch management procedures for network devices, establish network device update testing and approval processes, and implement change management procedures for network infrastructure updates with proper documentation and rollback procedures.

**c) Secure network architecture**
Establish and maintain a secure network architecture with proper segmentation and access controls. Implement network segmentation design to limit lateral movement, establish firewall rules with proper business justification, deploy network access control (NAC) configuration and policies, and conduct regular penetration testing to validate network segmentation effectiveness with proper monitoring of inter-zone network traffic.

**d) Network asset security management**
Securely manage network assets using secure protocols and credential management. Implement secure protocol usage (SSH, TLS, SNMPv3) for network device management, establish credential management and secure transmission procedures, deploy network device hardening and security configuration baselines, and implement network asset monitoring with privileged access controls and session recording.

**e) System installation and configuration**
Implement secure procedures for system installation and configuration management. Establish system installation procedures with security baseline implementation, deploy configuration management tools with automated compliance checking, implement system hardening procedures and security configuration baselines, and establish system acceptance testing procedures with security validation.

**f) Capacity management and monitoring**
Monitor and manage system capacity to ensure adequate performance and availability. Implement capacity monitoring tools with automated alerting for resource utilization, establish capacity planning procedures with growth projections, deploy performance monitoring with baseline establishment and trend analysis, and implement capacity optimization procedures with resource allocation management.

**g) System maintenance and updates**
Establish systematic procedures for system maintenance and security updates. Implement patch management procedures with testing and approval workflows, establish maintenance schedules with proper change control, deploy automated update management tools with compliance tracking, and implement system backup procedures before maintenance activities with verification testing.

**h) Network and communications security**
Protect network communications and ensure secure data transmission. Implement encryption for data in transit using approved protocols, establish secure communication channels with certificate management, deploy network monitoring tools with intrusion detection capabilities, and implement network access controls with proper authentication and authorization.

**i) Operations monitoring and logging**
Establish comprehensive monitoring and logging for all operational activities. Deploy centralized logging systems with log correlation and analysis, implement security information and event management (SIEM) with automated alerting, establish log retention policies with compliance requirements, and implement operational monitoring with performance and security metrics.

**j) Administrative access management**
Establish and maintain dedicated computing resources for all administrative work. Deploy dedicated administrative workstations with proper network segmentation, implement privileged access management (PAM) with session monitoring and recording, establish administrative network isolation with internet access restrictions, and implement administrative access controls with multi-factor authentication and proper monitoring of all administrative activities.`,
        implementationSteps: [
          'Document all operational procedures with clear responsibilities and escalation paths',
          'Implement network infrastructure management with automated patching and configuration management',
          'Deploy secure network architecture with proper segmentation and access controls',
          'Establish secure network asset management with encrypted protocols and credential protection',
          'Implement system installation procedures with security baselines and acceptance testing',
          'Deploy capacity management tools with monitoring and automated alerting',
          'Establish comprehensive logging and monitoring with SIEM integration',
          'Create dedicated administrative workstations with proper isolation and controls'
        ],
        practicalTools: [
          'Network management: SolarWinds, ManageEngine OpManager, or Cisco Prime',
          'Configuration management: Ansible, Puppet, Chef, or Microsoft System Center',
          'Monitoring and SIEM: Splunk, IBM QRadar, or Azure Sentinel',
          'Privileged access management: CyberArk, BeyondTrust, or Thycotic',
          'Network security: Cisco ASA, Palo Alto Networks, or Check Point firewalls'
        ],
        auditEvidence: [
          'Network infrastructure inventory with current firmware/software versions and patch management procedures',
          'Network architecture documentation with security zones and firewall rule documentation with approval records',
          'Network device security configuration baselines and secure protocol implementation evidence',
          'System installation procedures and security baseline configuration evidence',
          'Capacity monitoring configuration and performance trend analysis reports',
          'Centralized logging system configuration and SIEM deployment evidence',
          'Administrative workstation policy and network segmentation documentation with dedicated resource implementation evidence',
          'Operational procedure documentation and responsibility assignment with change control records'
        ],
        crossReferences: [
          'Asset Management (manages network and system assets)',
          'Access Control & Identity Management (controls access to operational systems)',
          'Information Security Incident Management (responds to operational security events)'
        ]
      },

      'Information Security Incident Management': {
        category: 'Information Security Incident Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.25', title: 'Assessment and decision on information security events', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.26', title: 'Response to information security incidents', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.27', title: 'Learning from information security incidents', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.16.1.1', title: 'Responsibilities and procedures', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 23', title: 'Reporting significant incidents', relevance: 'primary' },
          { framework: 'cisControls', code: '17.1', title: 'Designate Personnel to Manage Incident Handling', relevance: 'primary' },
          { framework: 'cisControls', code: '17.2', title: 'Establish and Maintain Contact Information for Reporting Security Incidents', relevance: 'primary' },
          { framework: 'cisControls', code: '17.3', title: 'Establish and Maintain an Enterprise Process for Reporting Incidents', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 33', title: 'Notification of a personal data breach to the supervisory authority', relevance: 'primary' }
        ],
        foundationContent: `**a) Incident response organization**
Establish and maintain an incident response organization with designated personnel to manage incident handling. Designate incident response manager plus backup personnel with clear roles and responsibilities, establish incident response team with appropriate skills and authority, define escalation procedures and contact information, and ensure 24/7 availability for critical incident response with documented contact information and response procedures.

**b) Incident reporting procedures**
Establish and maintain an enterprise process for reporting security incidents with multiple accessible channels. Create clear incident reporting procedures that workforce members can follow quickly and easily, develop simple reporting forms and tools with anonymous reporting options, establish multiple incident reporting channels including phone, email, and web-based systems, and ensure prompt acknowledgment of all incident reports with tracking metrics and response times.

**c) Incident detection and analysis**
Implement systematic procedures for detecting and analyzing security incidents to enable rapid response. Deploy automated detection tools with correlation and analysis capabilities, establish incident classification and severity levels with defined response criteria, implement security information and event management (SIEM) with automated alerting, and train workforce members to recognize potential security incidents with clear indicators and reporting procedures.

**d) Incident containment and eradication**
Develop procedures for containing and eradicating security incidents to minimize damage and prevent spread. Establish containment strategies for different incident types with isolation and quarantine procedures, implement eradication procedures to remove threats and restore systems, deploy forensic capabilities to preserve evidence and support investigation, and coordinate with law enforcement and external parties when required.

**e) Incident recovery and restoration**
Implement systematic procedures for recovering from security incidents and restoring normal operations. Establish recovery procedures with validation and testing requirements, implement system restoration with security verification, conduct post-incident monitoring to detect recurring issues, and validate system integrity and security before returning to production operations.

**f) Incident communication and notification**
Establish comprehensive communication procedures for internal and external incident notification. Maintain current contact information for internal and external parties including law enforcement and regulatory bodies, implement regulatory notification procedures (GDPR 72-hour breach notification, NIS2 24-hour significant incident reporting), establish communication templates and escalation procedures, and coordinate with public relations and legal teams for external communications.

**g) Incident documentation and tracking**
Implement comprehensive documentation and tracking for all security incidents throughout their lifecycle. Maintain detailed incident records with timeline, actions taken, and resolution details, track incident metrics including detection time, response time, and resolution time, document lessons learned and improvement opportunities, and generate incident reports for management and regulatory authorities.

**h) Incident response testing and training**
Conduct regular testing and training to ensure incident response procedures are effective and current. Conduct incident response tabletop exercises and simulations with scenario-based testing, provide incident response training for team members and general workforce, test incident response procedures and communication channels regularly, and update incident response plans based on exercise results and lessons learned.

**i) Evidence collection and forensics**
Establish procedures for collecting and preserving digital evidence during security incidents. Implement forensic capabilities with chain of custody procedures, train incident response team on evidence collection and preservation, establish legal hold procedures for incident-related data, and coordinate with law enforcement and legal teams for forensic investigation.

**j) Continuous improvement**
Implement continuous improvement processes for incident response capabilities based on lessons learned. Conduct post-incident reviews to identify improvement opportunities, update incident response procedures based on new threats and organizational changes, track incident trends and metrics to improve detection and prevention, and incorporate industry best practices and threat intelligence into response procedures.`,
        implementationSteps: [
          'Designate incident response personnel with clear roles and 24/7 contact information',
          'Establish multiple incident reporting channels with simple procedures and forms',
          'Deploy incident detection tools with automated analysis and correlation',
          'Develop incident containment and eradication procedures for different threat types',
          'Create incident recovery procedures with validation and system integrity checking',
          'Implement notification procedures for regulatory and external communication requirements',
          'Establish incident documentation and tracking with comprehensive record keeping',
          'Conduct regular incident response training and tabletop exercises with scenario testing'
        ],
        practicalTools: [
          'Incident response platforms: IBM Resilient, Phantom, or ServiceNow Security Incident Response',
          'SIEM and detection: Splunk, IBM QRadar, or Microsoft Sentinel',
          'Forensic tools: EnCase, FTK, or SANS SIFT Workstation',
          'Communication tools: Emergency notification systems and secure messaging platforms',
          'Documentation: Incident tracking systems and case management platforms'
        ],
        auditEvidence: [
          'Incident response plan with designated personnel and contact information',
          'Incident reporting procedures and multiple accessible reporting channels',
          'Incident detection system configuration and automated alerting evidence',
          'Incident response exercise results and training completion records',
          'Incident tracking database with documented cases and resolution details',
          'Regulatory notification procedures and compliance documentation',
          'Evidence collection procedures and forensic capability documentation',
          'Post-incident review reports and continuous improvement documentation'
        ],
        crossReferences: [
          'Governance & Leadership (provides incident response oversight and authority)',
          'Communications & Operations Management (coordinates operational response activities)',
          'Security Awareness & Skills Training (trains workforce on incident recognition and reporting)'
        ]
      }

      // Additional categories will be implemented as needed...
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