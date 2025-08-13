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
          { framework: 'iso27002', code: 'A.14.1.1', title: 'Information security requirements analysis and specification', relevance: 'primary' },
          { framework: 'cisControls', code: '16.1', title: 'Establish and Maintain a Secure Application Development Process', relevance: 'primary' },
          { framework: 'cisControls', code: '16.2', title: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Security in network and information systems development', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'supporting' }
        ],
        foundationContent: `**a) Secure development lifecycle**
Establish and maintain a secure development lifecycle (SDLC) that integrates security at every phase. Define security requirements during the planning phase, implement secure design principles and threat modeling, conduct security reviews at each development milestone, perform security testing before deployment, and maintain security documentation throughout the development process. The SDLC must cover both internal development and outsourced projects.

**b) Application security requirements**
Define comprehensive security requirements for all applications based on risk assessment and regulatory obligations. Establish functional security requirements including authentication, authorization, and audit logging, define non-functional security requirements such as performance, availability, and scalability, implement data protection requirements aligned with classification levels, and ensure compliance requirements are addressed in application design.

**c) Secure system architecture**
Implement secure system architecture and engineering principles in all system designs. Apply defense-in-depth principles with layered security controls, implement least privilege and segregation of duties in system design, establish secure communication channels between system components, design for resilience with fail-secure mechanisms, and ensure security is considered in all architectural decisions.

**d) Secure coding practices**
Implement secure coding standards and practices to prevent common vulnerabilities. Establish secure coding guidelines for all programming languages used, implement input validation and output encoding to prevent injection attacks, use secure libraries and frameworks with known security track records, implement proper error handling without information disclosure, and conduct code reviews focusing on security vulnerabilities.

**e) Security testing and validation**
Conduct comprehensive security testing throughout development and before system acceptance. Perform static application security testing (SAST) during development, conduct dynamic application security testing (DAST) in test environments, implement software composition analysis for third-party components, perform penetration testing before production deployment, and validate security controls meet defined requirements.

**f) Change control and configuration management**
Implement strict change control and configuration management for development environments. Establish version control systems with proper access controls, implement code review and approval processes before merging, maintain separate development, test, and production environments, control migration between environments with proper approvals, and ensure configuration files are properly secured and versioned.

**g) Test data management**
Implement secure procedures for managing test data in development and testing environments. Use synthetic or anonymized data instead of production data, implement data masking techniques when production data is required, control access to test data based on need-to-know principles, ensure test data is properly disposed after use, and maintain compliance with data protection regulations.

**h) Outsourced development security**
Ensure security requirements are met when development is outsourced to third parties. Include security requirements in outsourcing contracts, conduct security assessments of third-party development practices, implement code review and security testing for delivered software, ensure intellectual property and source code protection, and maintain oversight of outsourced development activities.

**i) Vulnerability management in development**
Establish processes to identify and remediate vulnerabilities during development. Implement vulnerability scanning in development pipelines, track and prioritize vulnerability remediation based on risk, establish service level agreements for vulnerability patching, maintain vulnerability disclosure and coordination procedures, and ensure timely updates of vulnerable components.

**j) Development environment security**
Secure development environments to protect source code and development activities. Implement access controls for development systems and tools, secure source code repositories with encryption and access logging, establish secure build pipelines with integrity verification, protect development credentials and secrets, and monitor development environments for suspicious activities.`,
        implementationSteps: [
          'Establish secure SDLC with security integrated at every phase',
          'Define comprehensive security requirements based on risk assessment',
          'Implement secure coding standards and conduct security-focused code reviews',
          'Deploy automated security testing tools in CI/CD pipelines',
          'Establish separate development, test, and production environments',
          'Implement vulnerability management processes for development',
          'Secure development environments and protect source code',
          'Create security validation procedures before production deployment'
        ],
        practicalTools: [
          'SAST tools: SonarQube, Checkmarx, or Fortify',
          'DAST tools: OWASP ZAP, Burp Suite, or Acunetix',
          'Software composition analysis: Snyk, WhiteSource, or Black Duck',
          'Secret scanning: GitGuardian, TruffleHog, or GitHub secret scanning',
          'Development platforms: GitLab, GitHub Enterprise, or Azure DevOps'
        ],
        auditEvidence: [
          'Secure SDLC documentation with security integration points',
          'Security requirements documentation and traceability matrices',
          'Secure coding standards and code review records',
          'Security testing reports including SAST, DAST, and penetration testing',
          'Change control procedures and approval records',
          'Development environment security configuration and access logs',
          'Vulnerability management procedures and remediation tracking',
          'Outsourced development contracts with security requirements'
        ],
        crossReferences: [
          'Risk Management (provides input for security requirements)',
          'Access Control & Identity Management (secures development environment access)',
          'Change Management (coordinates system changes and deployments)'
        ]
      },

      'Compliance': {
        category: 'Compliance',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.32', title: 'Intellectual property rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.33', title: 'Protection of records', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.34', title: 'Privacy and protection of personal information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.35', title: 'Independent review of information security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.36', title: 'Compliance with policies, rules and standards', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.18.1.1', title: 'Identification of applicable legislation and contractual requirements', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 24', title: 'Responsibility of the controller', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 35', title: 'Data protection impact assessment', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 31', title: 'Compliance monitoring', relevance: 'primary' },
          { framework: 'cisControls', code: '17.5', title: 'Assign Key Roles and Responsibilities', relevance: 'supporting' }
        ],
        foundationContent: `**a) Legal and regulatory requirements identification**
Systematically identify and document all applicable legal, statutory, regulatory, and contractual requirements. Maintain a comprehensive compliance register with all applicable requirements, establish procedures for identifying new and changing regulations, assign ownership for tracking specific compliance obligations, document how each requirement applies to organizational operations, and establish regular review cycles to ensure currency.

**b) Compliance monitoring and assessment**
Implement systematic procedures to monitor and assess compliance with identified requirements. Conduct regular compliance assessments using structured methodologies, deploy automated compliance monitoring tools where feasible, establish key compliance indicators and metrics, perform gap analyses to identify non-compliance areas, and maintain compliance dashboards for management visibility.

**c) Privacy and data protection compliance**
Ensure compliance with privacy and data protection regulations including GDPR, CCPA, and sector-specific requirements. Implement privacy by design principles in all processing activities, conduct data protection impact assessments (DPIAs) for high-risk processing, maintain records of processing activities as required by regulations, establish data subject rights procedures and response timelines, and ensure lawful basis for all personal data processing.

**d) Intellectual property protection**
Protect intellectual property rights for both organizational and third-party assets. Establish procedures for identifying and protecting intellectual property, implement controls to prevent unauthorized use of licensed software, maintain software license inventory and compliance tracking, ensure proper attribution and usage of third-party content, and establish procedures for managing open source software compliance.

**e) Records management and retention**
Implement comprehensive records management to meet legal and business requirements. Establish records classification and retention schedules, implement secure storage and protection for records, ensure records integrity and authenticity throughout retention periods, establish secure disposal procedures at end of retention, and maintain audit trails for records access and modifications.

**f) Policy and standards compliance**
Ensure organizational compliance with internal policies, rules, and standards. Implement policy management framework with regular reviews and updates, establish procedures for policy exception management, conduct regular assessments of policy compliance, implement corrective action procedures for non-compliance, and maintain evidence of policy acknowledgment and training.

**g) Independent review and audit**
Conduct independent reviews of information security and compliance programs. Establish internal audit program with risk-based audit planning, engage external auditors for independent assessments, coordinate audit activities to minimize disruption, track and remediate audit findings within defined timelines, and report audit results to management and board.

**h) Regulatory reporting and notification**
Implement procedures for regulatory reporting and breach notification requirements. Establish clear procedures for regulatory reporting with defined timelines, maintain templates and communication channels for notifications, ensure compliance with breach notification requirements (GDPR 72-hour rule, etc.), coordinate with legal counsel for regulatory communications, and maintain records of all regulatory interactions.

**i) Compliance training and awareness**
Provide comprehensive compliance training to ensure workforce understanding of obligations. Develop role-specific compliance training programs, conduct regular compliance awareness campaigns, provide updates on new or changing requirements, track training completion and effectiveness, and integrate compliance training with security awareness programs.

**j) Continuous compliance improvement**
Implement continuous improvement processes for compliance management. Track compliance metrics and trends over time, analyze root causes of compliance failures, implement preventive and corrective actions, benchmark compliance practices against industry standards, and incorporate lessons learned from audits and incidents.`,
        implementationSteps: [
          'Create comprehensive compliance register with all applicable requirements',
          'Implement compliance monitoring tools and procedures',
          'Establish privacy and data protection compliance framework',
          'Deploy records management system with retention schedules',
          'Conduct regular compliance assessments and gap analyses',
          'Implement regulatory reporting and notification procedures',
          'Develop compliance training and awareness programs',
          'Establish internal audit program with remediation tracking'
        ],
        practicalTools: [
          'GRC platforms: ServiceNow GRC, MetricStream, or SAP GRC',
          'Privacy management: OneTrust, TrustArc, or BigID',
          'Compliance monitoring: LogicGate, Compliance.ai, or Thomson Reuters',
          'Records management: Microsoft Purview, OpenText, or IBM FileNet',
          'Audit management: AuditBoard, Workiva, or Diligent'
        ],
        auditEvidence: [
          'Compliance register with all applicable requirements and ownership',
          'Compliance assessment reports and gap analyses',
          'Privacy compliance documentation including DPIAs and processing records',
          'Records retention schedules and disposal certificates',
          'Policy compliance assessments and exception documentation',
          'Internal and external audit reports with remediation tracking',
          'Regulatory reporting and notification records',
          'Compliance training records and effectiveness metrics'
        ],
        crossReferences: [
          'Governance & Leadership (provides compliance oversight and resources)',
          'Risk Management (identifies compliance risks and impacts)',
          'Records Management (maintains compliance documentation and evidence)'
        ]
      },

      'Supplier Relationships': {
        category: 'Supplier Relationships',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.19', title: 'Information security in supplier relationships', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.20', title: 'Addressing information security within supplier agreements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.21', title: 'Managing information security in the ICT supply chain', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.22', title: 'Monitoring, review and change management of supplier services', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.15.1.1', title: 'Information security policy for supplier relationships', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Supply chain security', relevance: 'primary' },
          { framework: 'cisControls', code: '15.1', title: 'Establish and Maintain an Inventory of Service Providers', relevance: 'primary' },
          { framework: 'cisControls', code: '15.2', title: 'Establish and Maintain a Service Provider Management Policy', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 28', title: 'Processor requirements', relevance: 'supporting' }
        ],
        foundationContent: `**a) Supplier inventory and classification**
Establish and maintain comprehensive inventory of all service providers and suppliers with access to organizational information or systems. Create supplier registry with service descriptions and data access levels, classify suppliers based on criticality and risk exposure, document supplier dependencies and interconnections, maintain current contact and contract information, and regularly review and update supplier inventory.

**b) Supplier security policy**
Establish and maintain service provider management policy defining security requirements for all supplier relationships. Define minimum security requirements for different supplier categories, establish due diligence procedures for supplier selection, specify security requirements for supplier agreements, define ongoing monitoring and assessment requirements, and establish procedures for addressing supplier security incidents.

**c) Supplier risk assessment**
Conduct risk assessments of suppliers based on their access to sensitive data and critical services. Assess inherent risks associated with each supplier relationship, evaluate supplier security capabilities and maturity, identify potential vulnerabilities in supplier services, determine residual risk levels with mitigation strategies, and prioritize suppliers for enhanced monitoring based on risk.

**d) Supplier agreements and contracts**
Address information security comprehensively within all supplier agreements and contracts. Include specific security requirements and standards compliance, define data protection and confidentiality obligations, establish incident notification and response procedures, specify audit and assessment rights, and include termination and data return/destruction procedures.

**e) Supply chain security management**
Manage information security throughout the ICT supply chain to prevent compromises. Implement supply chain risk management procedures, assess multi-tier supplier dependencies and risks, establish software and hardware provenance requirements, monitor for supply chain vulnerabilities and threats, and implement controls to detect and prevent supply chain attacks.

**f) Supplier onboarding and offboarding**
Implement secure procedures for supplier onboarding and offboarding activities. Conduct security assessments before granting access, provision access based on principle of least privilege, provide security training and awareness for supplier personnel, establish procedures for supplier changes and transitions, and ensure complete access revocation and data return upon termination.

**g) Ongoing supplier monitoring**
Monitor supplier performance and security posture throughout the relationship lifecycle. Implement continuous monitoring of supplier security metrics, conduct periodic security assessments and audits, review supplier compliance with contractual obligations, track and address supplier security incidents, and maintain scorecards for supplier security performance.

**h) Fourth-party risk management**
Manage risks associated with supplier subcontractors and fourth parties. Require notification of significant subcontracting arrangements, assess fourth-party risks for critical suppliers, ensure flow-down of security requirements to subcontractors, maintain visibility into fourth-party relationships, and establish procedures for fourth-party incident response.

**i) Supplier incident management**
Establish procedures for managing security incidents involving suppliers. Define clear incident notification requirements and timelines, establish coordination procedures for incident response, implement forensic and investigation procedures, ensure proper evidence preservation and chain of custody, and conduct post-incident reviews with corrective actions.

**j) Supplier relationship governance**
Implement governance structures for managing supplier relationships and performance. Establish supplier governance committees with regular reviews, define key performance indicators and service level agreements, conduct regular relationship reviews with suppliers, manage supplier improvements and corrective actions, and ensure alignment with business objectives and risk appetite.`,
        implementationSteps: [
          'Create comprehensive supplier inventory with risk classifications',
          'Develop supplier security policy with tiered requirements',
          'Conduct supplier risk assessments and due diligence',
          'Implement standard security clauses in supplier contracts',
          'Establish supplier onboarding and security validation procedures',
          'Deploy continuous monitoring of supplier security posture',
          'Implement supply chain risk management procedures',
          'Create supplier incident response and coordination procedures'
        ],
        practicalTools: [
          'Third-party risk management: Prevalent, BitSight, or SecurityScorecard',
          'Supplier assessments: Shared Assessments, CAIQ, or custom questionnaires',
          'Contract management: Icertis, Agiloft, or ContractWorks',
          'Supply chain security: SBOM tools, dependency scanners',
          'Continuous monitoring: RiskRecon, UpGuard, or Panorays'
        ],
        auditEvidence: [
          'Supplier inventory with classifications and risk ratings',
          'Supplier security policy and management procedures',
          'Supplier risk assessment reports and due diligence documentation',
          'Supplier contracts with security requirements and SLAs',
          'Supplier onboarding and access provisioning records',
          'Continuous monitoring reports and security metrics',
          'Supplier incident reports and response documentation',
          'Supplier governance meeting minutes and performance reviews'
        ],
        crossReferences: [
          'Risk Management (assesses supplier-related risks)',
          'Access Control & Identity Management (manages supplier access)',
          'Information Security Incident Management (coordinates supplier incidents)'
        ]
      },

      'Cloud Security': {
        category: 'Cloud Security',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.23', title: 'Information security for use of cloud services', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.23.1', title: 'Information security for use of cloud services', relevance: 'primary' },
          { framework: 'cisControls', code: '3.12', title: 'Segment Data Processing and Storage Based on Sensitivity', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2', title: 'Cybersecurity risk-management measures', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' }
        ],
        foundationContent: `**a) Cloud service inventory and classification**
Maintain comprehensive inventory of all cloud services used across the organization. Document all cloud service providers and services in use, classify cloud services by deployment model (IaaS, PaaS, SaaS), identify data types and sensitivity levels processed in each service, map cloud services to business processes and owners, and track cloud service dependencies and integrations.

**b) Cloud security architecture**
Establish secure cloud architecture aligned with business requirements and security policies. Define cloud security reference architecture and patterns, implement secure network connectivity (VPN, Direct Connect, Private Link), establish identity federation and single sign-on, deploy cloud-native security controls and services, and ensure consistent security across multi-cloud environments.

**c) Cloud access controls**
Implement strong access controls for cloud services and resources. Deploy cloud identity and access management (IAM) with least privilege, implement multi-factor authentication for all cloud access, establish privileged access management for cloud administrators, control programmatic access with secure API keys and tokens, and monitor cloud access patterns for anomalies.

**d) Data protection in cloud**
Protect data throughout its lifecycle in cloud environments. Implement encryption for data at rest and in transit, establish key management procedures with customer-controlled keys, deploy data loss prevention for cloud services, implement secure data sharing and collaboration controls, and ensure secure data deletion and retention management.

**e) Cloud workload protection**
Secure cloud workloads including virtual machines, containers, and serverless functions. Implement cloud workload protection platforms (CWPP), establish secure configuration baselines for cloud resources, deploy vulnerability scanning and patch management, implement runtime protection and behavioral monitoring, and ensure secure container and serverless deployment practices.

**f) Cloud network security**
Implement comprehensive network security controls in cloud environments. Deploy cloud-native firewalls and security groups, implement network segmentation and microsegmentation, establish secure connectivity between cloud and on-premises, deploy cloud-based DDoS protection, and monitor network traffic for threats and anomalies.

**g) Cloud security monitoring**
Establish comprehensive monitoring and logging for cloud environments. Enable cloud-native logging and monitoring services, aggregate logs in centralized SIEM platform, implement cloud security posture management (CSPM), deploy cloud threat detection and response, and establish cloud forensics and investigation capabilities.

**h) Cloud compliance and governance**
Ensure cloud services meet compliance and governance requirements. Assess cloud provider compliance certifications and attestations, implement cloud governance policies and controls, establish cloud cost management and optimization, monitor compliance with regulatory requirements, and maintain audit trails for cloud activities.

**i) Cloud incident response**
Establish incident response procedures specific to cloud environments. Define shared responsibility for incident response, establish procedures for cloud-specific incident types, coordinate with cloud service provider support, implement cloud forensics and evidence collection, and conduct cloud-specific incident response exercises.

**j) Cloud service provider management**
Manage relationships with cloud service providers effectively. Establish cloud service provider governance framework, monitor service level agreements and performance, review cloud provider security practices and incidents, manage cloud service changes and updates, and ensure proper exit strategies and data portability.`,
        implementationSteps: [
          'Create cloud service inventory with business and data mappings',
          'Develop cloud security architecture and reference patterns',
          'Implement cloud IAM with MFA and privileged access management',
          'Deploy encryption and key management for cloud data',
          'Establish cloud workload protection and configuration management',
          'Implement cloud network security with segmentation',
          'Deploy cloud security monitoring and CSPM tools',
          'Create cloud-specific incident response procedures'
        ],
        practicalTools: [
          'Cloud security posture: Prisma Cloud, Dome9, or AWS Security Hub',
          'Cloud workload protection: CrowdStrike Falcon, Trend Micro Cloud One',
          'Cloud access security: Netskope, Zscaler, or Microsoft Cloud App Security',
          'Cloud key management: AWS KMS, Azure Key Vault, or HashiCorp Vault',
          'Cloud monitoring: Datadog, New Relic, or cloud-native tools'
        ],
        auditEvidence: [
          'Cloud service inventory with classifications and data mappings',
          'Cloud security architecture documentation and patterns',
          'Cloud IAM configurations and access control policies',
          'Encryption and key management procedures and configurations',
          'Cloud security monitoring dashboards and alert configurations',
          'Cloud compliance assessments and audit reports',
          'Cloud incident response procedures and exercise results',
          'Cloud service provider contracts and SLA documentation'
        ],
        crossReferences: [
          'Supplier Relationships (manages cloud service providers)',
          'Data Protection & Privacy (protects data in cloud environments)',
          'Access Control & Identity Management (secures cloud access)'
        ]
      },

      'Vulnerability Management': {
        category: 'Vulnerability Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.8', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.9', title: 'Configuration management', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.6.1', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'cisControls', code: '7.1', title: 'Establish and Maintain a Vulnerability Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.2', title: 'Establish and Maintain a Remediation Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.3', title: 'Perform Automated Operating System Patch Management', relevance: 'primary' },
          { framework: 'cisControls', code: '7.4', title: 'Perform Automated Application Patch Management', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Vulnerability handling and disclosure', relevance: 'primary' }
        ],
        foundationContent: `**a) Vulnerability management process**
Establish and maintain comprehensive vulnerability management process covering identification, evaluation, treatment, and reporting. Define vulnerability management policy with roles and responsibilities, establish vulnerability sources including CVE feeds and vendor advisories, implement vulnerability scanning schedules and coverage requirements, define vulnerability rating and prioritization criteria, and establish remediation timelines based on severity levels.

**b) Asset discovery and inventory**
Maintain accurate asset inventory as foundation for vulnerability management. Implement automated asset discovery across all environments, maintain detailed asset attributes including software versions and configurations, track asset criticality and business impact ratings, identify asset owners and technical contacts, and ensure coverage of all asset types including cloud and mobile.

**c) Vulnerability scanning and assessment**
Conduct regular vulnerability scanning and assessment across all assets. Deploy authenticated vulnerability scanning with comprehensive coverage, implement continuous vulnerability scanning for critical assets, conduct specialized assessments for different asset types, integrate vulnerability data from multiple sources, and validate scan results to minimize false positives.

**d) Vulnerability prioritization and risk rating**
Prioritize vulnerabilities based on risk to the organization. Apply CVSS scores with environmental adjustments, consider threat intelligence and exploit availability, assess business impact of affected assets, factor in compensating controls and mitigations, and establish risk-based remediation priorities.

**e) Patch management**
Implement systematic patch management for operating systems and applications. Establish patch management policy with defined timelines, deploy automated patch management tools and systems, implement patch testing procedures before production deployment, maintain emergency patching procedures for critical vulnerabilities, and track patch compliance across all systems.

**f) Remediation tracking and verification**
Track vulnerability remediation activities and verify successful mitigation. Establish remediation workflows with assignment and tracking, monitor remediation progress against defined SLAs, verify successful remediation through rescanning, document accepted risks and compensating controls, and maintain remediation metrics and reporting.

**g) Configuration management**
Maintain secure configurations to prevent vulnerability introduction. Establish configuration baselines and hardening standards, implement configuration management database (CMDB), deploy configuration compliance monitoring, control configuration changes through change management, and regularly review and update configuration standards.

**h) Vulnerability disclosure and coordination**
Establish procedures for vulnerability disclosure and coordination. Implement responsible disclosure procedures for discovered vulnerabilities, coordinate with vendors and security researchers, participate in vulnerability disclosure programs, maintain communication channels for vulnerability notifications, and ensure compliance with disclosure regulations and requirements.

**i) Third-party and supply chain vulnerabilities**
Manage vulnerabilities in third-party components and supply chain. Maintain inventory of third-party components and dependencies, monitor for vulnerabilities in third-party software, coordinate remediation with vendors and suppliers, implement software composition analysis (SCA), and establish procedures for supply chain vulnerability response.

**j) Vulnerability management metrics and reporting**
Measure and report on vulnerability management program effectiveness. Track key metrics including scan coverage and frequency, monitor mean time to detect and remediate vulnerabilities, analyze vulnerability trends and root causes, report vulnerability status to management, and implement continuous improvement based on metrics.`,
        implementationSteps: [
          'Establish vulnerability management process with defined roles and responsibilities',
          'Deploy automated asset discovery and maintain accurate inventory',
          'Implement vulnerability scanning across all environments',
          'Establish risk-based vulnerability prioritization methodology',
          'Deploy automated patch management for OS and applications',
          'Create remediation workflows with tracking and verification',
          'Implement configuration management and compliance monitoring',
          'Establish vulnerability disclosure and coordination procedures'
        ],
        practicalTools: [
          'Vulnerability scanners: Qualys, Rapid7 Nexpose, or Tenable Nessus',
          'Patch management: Microsoft WSUS/SCCM, Tanium, or ManageEngine',
          'Software composition analysis: Snyk, WhiteSource, or Black Duck',
          'Configuration management: Ansible, Puppet, or Chef',
          'Vulnerability intelligence: MITRE CVE, NVD, or threat intelligence feeds'
        ],
        auditEvidence: [
          'Vulnerability management policy and procedures documentation',
          'Asset inventory with criticality ratings and coverage metrics',
          'Vulnerability scan reports and coverage documentation',
          'Patch management procedures and compliance reports',
          'Remediation tracking with SLA compliance metrics',
          'Configuration baselines and compliance reports',
          'Vulnerability disclosure procedures and coordination records',
          'Vulnerability management metrics and trend analysis reports'
        ],
        crossReferences: [
          'Asset Management (provides foundation for vulnerability identification)',
          'Risk Management (assesses vulnerability risks and impacts)',
          'System Acquisition, Development & Maintenance (prevents vulnerability introduction)'
        ]
      },

      'Cryptography & Key Management': {
        category: 'Cryptography & Key Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.24', title: 'Use of cryptography', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.10.1.1', title: 'Policy on the use of cryptographic controls', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.10.1.2', title: 'Key management', relevance: 'primary' },
          { framework: 'cisControls', code: '3.10', title: 'Encrypt Sensitive Data in Transit', relevance: 'primary' },
          { framework: 'cisControls', code: '3.11', title: 'Encrypt Sensitive Data at Rest', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32.1.a', title: 'Pseudonymisation and encryption of personal data', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21', title: 'Cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Cryptographic policy and standards**
Establish comprehensive policy on the use of cryptographic controls aligned with business and compliance requirements. Define approved cryptographic algorithms and key lengths, specify use cases requiring encryption (data at rest, in transit, in use), establish cryptographic standards and protocols, mandate encryption for specific data classifications, and ensure compliance with export control and legal restrictions.

**b) Encryption for data at rest**
Implement encryption for sensitive data at rest across all storage locations. Deploy full disk encryption for laptops and mobile devices, implement database encryption with transparent data encryption (TDE), encrypt file systems and storage volumes, protect backup media with encryption, and ensure cloud storage encryption with customer-managed keys.

**c) Encryption for data in transit**
Protect data in transit using appropriate encryption protocols and standards. Implement TLS/SSL for all web communications with strong cipher suites, deploy VPN for remote access with current protocols, encrypt email communications for sensitive data, protect API communications with mutual TLS, and ensure end-to-end encryption for sensitive communications.

**d) Key lifecycle management**
Implement comprehensive key management throughout the cryptographic key lifecycle. Establish secure key generation using approved random number generators, implement secure key distribution and exchange protocols, deploy secure key storage using hardware security modules (HSMs) or key vaults, establish key rotation schedules based on risk and compliance, and ensure secure key destruction at end of lifecycle.

**e) Key escrow and recovery**
Establish procedures for key escrow and recovery to ensure business continuity. Implement key escrow for critical encryption keys, establish dual control and split knowledge procedures, deploy secure key recovery mechanisms, document key recovery procedures and test regularly, and ensure compliance with legal key disclosure requirements.

**f) Certificate management**
Manage digital certificates throughout their lifecycle to ensure trust and authenticity. Deploy public key infrastructure (PKI) or use trusted certificate authorities, implement certificate lifecycle management including issuance and renewal, monitor certificate expiration and automate renewal, maintain certificate inventory and discovery, and establish procedures for certificate revocation.

**g) Hardware security modules**
Deploy hardware security modules (HSMs) for critical cryptographic operations. Use HSMs for root key generation and protection, implement HSMs for high-value transaction processing, deploy HSMs for code signing and certificate authorities, ensure HSM high availability and disaster recovery, and maintain HSM compliance with FIPS 140-2 Level 3 or higher.

**h) Cryptographic agility**
Implement cryptographic agility to respond to algorithm weaknesses and quantum threats. Design systems to support algorithm updates without major changes, maintain inventory of cryptographic implementations, plan for post-quantum cryptography migration, monitor cryptographic algorithm security status, and establish procedures for emergency algorithm replacement.

**i) Application cryptography**
Ensure proper implementation of cryptography in applications. Provide secure cryptographic libraries and APIs for developers, implement cryptographic controls in application architecture, conduct code reviews focusing on cryptographic implementation, avoid custom cryptographic implementations, and ensure proper random number generation and salt usage.

**j) Compliance and audit**
Ensure cryptographic controls meet compliance requirements and undergo regular assessment. Document cryptographic implementations for audit purposes, maintain evidence of encryption for compliance reporting, conduct regular cryptographic control assessments, monitor cryptographic control effectiveness, and ensure alignment with regulatory encryption requirements.`,
        implementationSteps: [
          'Develop cryptographic policy with approved algorithms and use cases',
          'Deploy encryption for data at rest across all storage systems',
          'Implement TLS/SSL and VPN for data in transit protection',
          'Establish comprehensive key management lifecycle procedures',
          'Deploy HSMs or cloud key management services for key protection',
          'Implement certificate management with automated renewal',
          'Create key escrow and recovery procedures with proper controls',
          'Establish cryptographic monitoring and compliance reporting'
        ],
        practicalTools: [
          'Key management: HashiCorp Vault, AWS KMS, Azure Key Vault',
          'HSMs: Thales, Entrust nShield, AWS CloudHSM',
          'Certificate management: DigiCert CertCentral, Let\'s Encrypt, Venafi',
          'Encryption tools: VeraCrypt, BitLocker, dm-crypt/LUKS',
          'TLS management: SSL Labs, Qualys SSL Server Test'
        ],
        auditEvidence: [
          'Cryptographic policy and standards documentation',
          'Encryption implementation inventory and coverage reports',
          'Key management procedures and lifecycle documentation',
          'Certificate inventory and management reports',
          'HSM configuration and compliance certificates',
          'Key escrow and recovery procedures with test results',
          'Cryptographic assessment reports and remediation records',
          'Compliance documentation for encryption requirements'
        ],
        crossReferences: [
          'Data Protection & Privacy (uses encryption for data protection)',
          'Cloud Security (implements encryption in cloud environments)',
          'System Acquisition, Development & Maintenance (integrates cryptography in applications)'
        ]
      },

      'Logging & Monitoring': {
        category: 'Logging & Monitoring',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.15', title: 'Logging', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.16', title: 'Monitoring activities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.17', title: 'Clock synchronization', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.4.1', title: 'Event logging', relevance: 'primary' },
          { framework: 'cisControls', code: '8.1', title: 'Establish and Maintain an Audit Log Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '8.2', title: 'Collect Audit Logs', relevance: 'primary' },
          { framework: 'cisControls', code: '8.3', title: 'Ensure Adequate Audit Log Storage', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21', title: 'Cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Logging policy and standards**
Establish comprehensive logging policy defining what events must be logged across all systems. Define mandatory log events including authentication, authorization, and administrative actions, specify log format standards and required data fields, establish log retention periods based on compliance and business needs, mandate logging for security-relevant events and anomalies, and ensure consistency across diverse technology platforms.

**b) Log collection and aggregation**
Implement centralized log collection and aggregation from all critical systems. Deploy log collectors and forwarders on all systems, establish secure log transmission using encrypted channels, implement log aggregation platforms for centralized storage, ensure reliable log delivery with buffering and queuing, and maintain log source inventory with coverage monitoring.

**c) Log storage and retention**
Ensure adequate log storage capacity and retention to meet business and compliance requirements. Calculate storage requirements based on retention policies and log volumes, implement log archival for long-term retention, deploy log compression and deduplication where appropriate, ensure log storage redundancy and backup, and establish procedures for log restoration from archives.

**d) Log protection and integrity**
Protect logs from unauthorized access and ensure integrity throughout retention period. Implement access controls with principle of least privilege for log access, deploy log integrity monitoring using checksums or digital signatures, establish write-once storage for critical audit logs, protect logs from deletion or modification, and ensure secure log disposal at end of retention.

**e) Security monitoring and analysis**
Implement continuous security monitoring and analysis of log data. Deploy Security Information and Event Management (SIEM) systems, establish correlation rules for detecting security incidents, implement behavioral analytics and anomaly detection, create security dashboards and visualizations, and maintain use cases aligned with threat landscape.

**f) Clock synchronization**
Ensure accurate and synchronized time across all systems for reliable log correlation. Implement Network Time Protocol (NTP) with reliable time sources, establish time synchronization for all logging systems, monitor clock drift and synchronization status, ensure timezone consistency and UTC usage, and maintain time synchronization during incident investigation.

**g) Log review and investigation**
Establish procedures for regular log review and investigation activities. Conduct scheduled reviews of critical system logs, investigate security alerts and anomalies, document log review findings and actions, maintain investigation playbooks and procedures, and ensure timely escalation of security incidents.

**h) Performance and operational monitoring**
Monitor system performance and operational metrics alongside security events. Track system availability and performance metrics, monitor capacity utilization and trends, establish performance baselines and thresholds, implement automated alerting for operational issues, and correlate performance data with security events.

**i) Compliance and audit logging**
Ensure logging meets compliance requirements and supports audit activities. Maintain audit trails for regulatory compliance, provide tamper-evident logs for legal proceedings, support forensic investigations with detailed logging, generate compliance reports from log data, and ensure log availability for audit reviews.

**j) Continuous improvement**
Implement continuous improvement for logging and monitoring capabilities. Regularly review and update logging requirements, enhance detection capabilities based on incidents, optimize log storage and retention strategies, improve correlation rules and use cases, and incorporate threat intelligence into monitoring.`,
        implementationSteps: [
          'Develop comprehensive logging policy and standards',
          'Deploy centralized log collection and aggregation infrastructure',
          'Implement SIEM with correlation rules and use cases',
          'Establish log retention and archival procedures',
          'Configure clock synchronization across all systems',
          'Create log review and investigation procedures',
          'Implement log integrity and protection controls',
          'Establish monitoring dashboards and automated alerting'
        ],
        practicalTools: [
          'SIEM platforms: Splunk, IBM QRadar, Microsoft Sentinel, or Elastic Security',
          'Log management: ELK Stack, Graylog, or Sumo Logic',
          'Log collectors: Fluentd, Logstash, or Beats',
          'Time synchronization: NTP, Chrony, or Windows Time Service',
          'Log analysis: Grafana, Kibana, or custom analytics tools'
        ],
        auditEvidence: [
          'Logging policy and standards documentation',
          'Log source inventory with coverage metrics',
          'SIEM configuration and correlation rule documentation',
          'Log retention policy and archival procedures',
          'Clock synchronization configuration and monitoring',
          'Log review procedures and investigation records',
          'Log integrity controls and protection measures',
          'Monitoring dashboards and alert configuration documentation'
        ],
        crossReferences: [
          'Information Security Incident Management (uses logs for incident detection)',
          'Compliance (maintains audit logs for regulatory requirements)',
          'Access Control & Identity Management (logs authentication and authorization events)'
        ]
      },

      'Data Protection & Privacy': {
        category: 'Data Protection & Privacy',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.12', title: 'Classification of information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.13', title: 'Labelling of information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.14', title: 'Information transfer', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.34', title: 'Privacy and protection of PII', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.10', title: 'Information deletion', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.11', title: 'Data masking', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.12', title: 'Data leakage prevention', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 5', title: 'Principles relating to processing of personal data', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 35', title: 'Data protection impact assessment', relevance: 'primary' },
          { framework: 'cisControls', code: '3.1', title: 'Establish and Maintain a Data Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '3.2', title: 'Establish and Maintain a Data Inventory', relevance: 'primary' }
        ],
        foundationContent: `**a) Data discovery and inventory**
Establish and maintain comprehensive inventory of all data assets across the organization. Implement automated data discovery tools to locate sensitive data, maintain data inventory with classification and ownership, document data flows and processing activities, identify personal data and special categories, and track data lineage and dependencies.

**b) Data classification and labeling**
Implement systematic data classification based on sensitivity and business value. Define data classification scheme with clear categories and criteria, apply classification labels to all data assets, implement automated classification where feasible, ensure classification considers regulatory requirements, and maintain classification consistency across systems.

**c) Privacy by design and default**
Integrate privacy principles into all data processing activities from inception. Implement data minimization collecting only necessary data, establish purpose limitation with defined processing purposes, ensure data accuracy with validation and correction procedures, implement storage limitation with retention schedules, and deploy privacy-enhancing technologies.

**d) Data protection impact assessments**
Conduct data protection impact assessments (DPIAs) for high-risk processing activities. Establish DPIA methodology and triggers, assess risks to individuals\' rights and freedoms, identify and implement mitigation measures, consult with data protection officer and stakeholders, and document DPIA results and decisions.

**e) Data subject rights management**
Implement procedures to fulfill data subject rights under privacy regulations. Establish processes for access requests with identity verification, implement data portability with standard formats, enable rectification and erasure procedures, manage consent and opt-out preferences, and ensure timely response within regulatory deadlines.

**f) Data retention and deletion**
Implement data retention schedules with secure deletion at end of retention. Define retention periods based on legal and business requirements, implement automated retention policy enforcement, ensure secure data deletion with verification, maintain deletion certificates and audit trails, and handle legal holds and preservation requirements.

**g) Data masking and anonymization**
Implement data masking and anonymization techniques to protect sensitive data. Deploy dynamic data masking for production databases, implement static masking for non-production environments, use tokenization for sensitive data elements, apply anonymization techniques for analytics, and ensure masking maintains referential integrity.

**h) Data loss prevention**
Deploy data loss prevention (DLP) controls to prevent unauthorized data disclosure. Implement endpoint DLP monitoring and blocking, deploy network DLP for data in motion, configure cloud DLP for SaaS applications, establish DLP policies based on data classification, and monitor DLP alerts and policy violations.

**i) Data transfer security**
Secure data transfers both within and outside the organization. Implement encryption for all data transfers, establish secure file transfer mechanisms, control data exports with approval workflows, monitor cross-border data transfers, and ensure appropriate safeguards for international transfers.

**j) Privacy compliance monitoring**
Monitor and demonstrate compliance with privacy regulations continuously. Track privacy metrics and KPIs, conduct privacy audits and assessments, maintain records of processing activities, monitor data breach incidents and notifications, and report privacy compliance to management.`,
        implementationSteps: [
          'Conduct data discovery and create comprehensive data inventory',
          'Implement data classification scheme with automated labeling',
          'Establish privacy by design principles in all processes',
          'Deploy DLP controls across endpoint, network, and cloud',
          'Implement data subject rights management procedures',
          'Create data retention schedules with automated enforcement',
          'Deploy data masking for non-production environments',
          'Establish secure data transfer mechanisms with encryption'
        ],
        practicalTools: [
          'Data discovery: Microsoft Purview, Varonis, or BigID',
          'DLP solutions: Forcepoint, Symantec, or Microsoft Purview',
          'Data masking: Delphix, Informatica, or Oracle Data Masking',
          'Privacy management: OneTrust, TrustArc, or WireWheel',
          'Data classification: Boldon James, Titus, or Azure Information Protection'
        ],
        auditEvidence: [
          'Data inventory with classification and ownership',
          'Data classification policy and labeling standards',
          'DPIA documentation and risk mitigation records',
          'Data subject request procedures and response records',
          'Data retention schedules and deletion certificates',
          'DLP policy configuration and violation reports',
          'Data masking procedures and implementation evidence',
          'Privacy compliance metrics and audit reports'
        ],
        crossReferences: [
          'Compliance (ensures privacy regulation compliance)',
          'Cryptography & Key Management (protects data with encryption)',
          'Asset Management (manages data as critical assets)'
        ]
      },

      'Network Security': {
        category: 'Network Security',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.20', title: 'Networks security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.21', title: 'Security of network services', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.22', title: 'Segregation of networks', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.13.1.1', title: 'Network controls', relevance: 'primary' },
          { framework: 'cisControls', code: '12.1', title: 'Ensure Network Infrastructure is Up-to-Date', relevance: 'primary' },
          { framework: 'cisControls', code: '12.2', title: 'Establish and Maintain a Secure Network Architecture', relevance: 'primary' },
          { framework: 'cisControls', code: '13.1', title: 'Centralize Security Event Alerting', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2', title: 'Cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Network architecture and design**
Establish secure network architecture with defense-in-depth principles. Design network with security zones and trust boundaries, implement network segmentation based on data sensitivity, establish DMZ for public-facing services, deploy redundant network paths for resilience, and document network architecture with data flows.

**b) Network access controls**
Implement comprehensive network access controls to restrict unauthorized connections. Deploy firewalls at network perimeters and between zones, implement access control lists (ACLs) on network devices, establish VLANs for logical segmentation, deploy network access control (NAC) for device authentication, and implement zero-trust network access principles.

**c) Network device security**
Secure all network devices including routers, switches, and wireless access points. Harden network devices with secure configurations, disable unnecessary services and protocols, implement strong authentication for device access, encrypt management traffic with SSH/HTTPS, and maintain network device firmware updates.

**d) Wireless network security**
Implement strong security controls for wireless networks. Deploy WPA3 or WPA2-Enterprise with strong encryption, implement certificate-based authentication for corporate networks, establish guest network isolation, monitor for rogue access points, and control wireless network coverage areas.

**e) Network intrusion prevention**
Deploy intrusion detection and prevention systems across the network. Implement network-based IDS/IPS at strategic points, configure signature and anomaly-based detection, establish automated blocking for confirmed attacks, maintain IDS/IPS signatures and rules updates, and integrate with security incident response.

**f) Remote access security**
Secure remote access to organizational networks and resources. Deploy VPN with strong encryption and authentication, implement multi-factor authentication for all remote access, establish device compliance checks before granting access, monitor remote access sessions for anomalies, and maintain remote access audit trails.

**g) Network monitoring and visibility**
Establish comprehensive network monitoring for security and performance. Deploy network flow monitoring and analysis, implement network behavior analysis for anomaly detection, establish network performance baselines, monitor for data exfiltration patterns, and maintain network topology discovery and mapping.

**h) DDoS protection**
Implement protection against distributed denial of service attacks. Deploy DDoS mitigation solutions at network edge, establish traffic scrubbing and filtering capabilities, implement rate limiting and traffic shaping, maintain DDoS response procedures, and test DDoS defenses regularly.

**i) DNS and DHCP security**
Secure DNS and DHCP services critical for network operations. Implement DNSSEC for DNS integrity, deploy DNS filtering for malicious domains, secure DHCP with authentication and MAC filtering, monitor DNS queries for threats, and maintain redundant DNS/DHCP services.

**j) Network forensics and investigation**
Maintain network forensics capabilities for security investigations. Capture and retain network traffic for analysis, deploy network forensics tools and platforms, establish packet capture procedures, maintain chain of custody for network evidence, and integrate with incident response procedures.`,
        implementationSteps: [
          'Design secure network architecture with segmentation',
          'Deploy firewalls and access controls between network zones',
          'Implement network device hardening and secure management',
          'Deploy IDS/IPS with automated threat blocking',
          'Establish secure remote access with VPN and MFA',
          'Implement network monitoring and behavior analysis',
          'Deploy wireless security with enterprise authentication',
          'Establish network forensics and investigation capabilities'
        ],
        practicalTools: [
          'Firewalls: Palo Alto Networks, Fortinet, or Check Point',
          'IDS/IPS: Snort, Suricata, or commercial NGIPS solutions',
          'Network monitoring: Wireshark, NetFlow analyzers, or Darktrace',
          'NAC solutions: Cisco ISE, Aruba ClearPass, or ForeScout',
          'DDoS protection: Cloudflare, Akamai, or Radware'
        ],
        auditEvidence: [
          'Network architecture documentation and segmentation design',
          'Firewall rule sets and access control configurations',
          'Network device hardening standards and compliance reports',
          'IDS/IPS configuration and signature update records',
          'Remote access configuration and authentication logs',
          'Network monitoring dashboards and baseline documentation',
          'Wireless security configuration and rogue AP scan results',
          'Network forensics procedures and investigation records'
        ],
        crossReferences: [
          'Communications & Operations Management (manages network operations)',
          'Access Control & Identity Management (controls network access)',
          'Information Security Incident Management (responds to network incidents)'
        ]
      },

      'Endpoint Security': {
        category: 'Endpoint Security',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.7.7', title: 'Clear desk and clear screen', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.8', title: 'Equipment siting and protection', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.1', title: 'User endpoint devices', relevance: 'primary' },
          { framework: 'cisControls', code: '4.1', title: 'Establish and Maintain a Secure Configuration Process', relevance: 'primary' },
          { framework: 'cisControls', code: '10.1', title: 'Deploy and Maintain Anti-Malware Software', relevance: 'primary' },
          { framework: 'cisControls', code: '10.2', title: 'Configure Automatic Anti-Malware Signature Updates', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21', title: 'Cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Endpoint inventory and classification**
Maintain comprehensive inventory of all endpoint devices across the organization. Track all corporate-owned and BYOD devices, classify endpoints by type and risk level, document endpoint ownership and users, monitor endpoint compliance status, and identify unauthorized or unmanaged devices.

**b) Endpoint hardening and configuration**
Implement secure configuration standards for all endpoint types. Establish endpoint hardening baselines by device type, disable unnecessary services and features, configure host-based firewalls, implement application whitelisting or control, and enforce secure boot and integrity checking.

**c) Anti-malware and threat protection**
Deploy comprehensive anti-malware and endpoint detection solutions. Implement next-generation antivirus with behavioral analysis, deploy endpoint detection and response (EDR) capabilities, configure automatic signature and engine updates, establish malware quarantine and remediation procedures, and monitor endpoint threat indicators continuously.

**d) Endpoint encryption**
Implement full disk encryption on all endpoint devices containing sensitive data. Deploy BitLocker, FileVault, or equivalent encryption, manage encryption keys centrally, enforce encryption before network access, monitor encryption compliance status, and establish recovery key management procedures.

**e) Patch management for endpoints**
Ensure timely patching of operating systems and applications on endpoints. Deploy automated patch management solutions, establish patch testing and approval processes, enforce patch installation deadlines, monitor patch compliance across endpoints, and maintain emergency patching procedures.

**f) Mobile device management**
Implement mobile device management (MDM) for smartphones and tablets. Deploy MDM/EMM solutions with policy enforcement, configure device security requirements, implement containerization for corporate data, enforce app management and restrictions, and enable remote wipe capabilities.

**g) Removable media controls**
Control the use of removable media to prevent data loss and malware. Implement device control policies, block unauthorized USB devices, scan removable media for malware, encrypt data on approved removable media, and monitor removable media usage.

**h) Endpoint backup and recovery**
Ensure endpoint data is protected with appropriate backup solutions. Implement automated endpoint backup solutions, protect user data and system configurations, test restore procedures regularly, ensure backup encryption and security, and maintain offsite backup copies.

**i) User activity monitoring**
Monitor user activities on endpoints for security and compliance. Implement user behavior analytics, monitor privileged user activities, detect insider threats and data exfiltration, maintain audit trails of user actions, and ensure privacy compliance in monitoring.

**j) Endpoint incident response**
Establish procedures for responding to endpoint security incidents. Deploy endpoint forensics capabilities, implement endpoint isolation procedures, establish malware outbreak containment, coordinate with SOC and incident response teams, and maintain endpoint incident playbooks.`,
        implementationSteps: [
          'Create comprehensive endpoint inventory with classification',
          'Implement endpoint hardening standards and baselines',
          'Deploy EDR and next-generation antivirus solutions',
          'Enable full disk encryption on all endpoints',
          'Establish automated patch management processes',
          'Implement MDM for mobile devices with security policies',
          'Deploy removable media controls and monitoring',
          'Create endpoint incident response procedures'
        ],
        practicalTools: [
          'EDR solutions: CrowdStrike, SentinelOne, or Microsoft Defender',
          'MDM/EMM: Microsoft Intune, VMware Workspace ONE, or MobileIron',
          'Patch management: WSUS, SCCM, or Tanium',
          'Encryption: BitLocker, FileVault, or VeraCrypt',
          'Device control: Endpoint Protector, Symantec DLP'
        ],
        auditEvidence: [
          'Endpoint inventory with classification and ownership',
          'Endpoint hardening standards and compliance reports',
          'Anti-malware deployment and signature update records',
          'Encryption status reports and key management procedures',
          'Patch compliance reports and deployment records',
          'MDM enrollment and policy compliance reports',
          'Removable media usage logs and policy violations',
          'Endpoint incident response procedures and case records'
        ],
        crossReferences: [
          'Asset Management (manages endpoint devices as assets)',
          'Vulnerability Management (identifies and patches endpoint vulnerabilities)',
          'Information Security Incident Management (responds to endpoint incidents)'
        ]
      },

      'Change Management': {
        category: 'Change Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.32', title: 'Change management', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.37', title: 'Documented operating procedures', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.12.1.2', title: 'Change management', relevance: 'primary' },
          { framework: 'cisControls', code: '5.4', title: 'Restrict Administrator Privileges to Dedicated Administrator Accounts', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21', title: 'Cybersecurity risk-management measures', relevance: 'supporting' }
        ],
        foundationContent: `**a) Change management process**
Establish formal change management process for all system and infrastructure changes. Define change categories (standard, normal, emergency), establish Change Advisory Board (CAB) with defined roles, implement change request and approval workflows, maintain change calendar and scheduling, and ensure all changes follow documented procedures.

**b) Change request and documentation**
Implement comprehensive change request documentation and tracking. Require detailed change proposals with business justification, document technical implementation details, identify risks and mitigation strategies, specify rollback procedures, and maintain change request database.

**c) Change impact assessment**
Conduct thorough impact assessment for all proposed changes. Analyze potential security implications, assess business and operational impacts, identify affected systems and dependencies, evaluate resource requirements, and determine risk levels and approval requirements.

**d) Change approval and authorization**
Implement appropriate approval levels based on change risk and impact. Define approval authority matrix by change type, require security team review for security-relevant changes, obtain business owner approval for business-impacting changes, ensure emergency change procedures with post-implementation review, and maintain approval audit trails.

**e) Change testing and validation**
Ensure all changes are properly tested before implementation. Establish test environments mirroring production, develop test plans with success criteria, conduct security testing for all changes, validate changes against requirements, and document test results and sign-offs.

**f) Change implementation controls**
Implement controls to ensure safe and successful change deployment. Schedule changes during approved maintenance windows, follow documented implementation procedures, monitor changes during implementation, maintain communication with stakeholders, and ensure proper handover to operations.

**g) Post-implementation review**
Conduct post-implementation reviews to verify change success. Verify changes meet intended objectives, assess actual vs. predicted impacts, identify lessons learned and improvements, update documentation and procedures, and close change records with final status.

**h) Emergency change procedures**
Establish expedited procedures for emergency changes while maintaining controls. Define criteria for emergency changes, implement streamlined approval process, require security assessment even in emergencies, conduct mandatory post-implementation reviews, and convert to normal change process when possible.

**i) Configuration management integration**
Integrate change management with configuration management database (CMDB). Update CMDB with all changes, maintain configuration baselines, track configuration drift, ensure change-configuration reconciliation, and maintain configuration audit trails.

**j) Change management metrics**
Measure and report on change management effectiveness. Track change success/failure rates, monitor unauthorized changes, measure change-related incidents, analyze change trends and patterns, and implement continuous improvement based on metrics.`,
        implementationSteps: [
          'Establish formal change management process and procedures',
          'Create Change Advisory Board with defined responsibilities',
          'Implement change request system with workflow automation',
          'Develop change impact assessment methodology',
          'Create test environments and validation procedures',
          'Establish emergency change procedures with controls',
          'Integrate with configuration management database',
          'Implement change management metrics and reporting'
        ],
        practicalTools: [
          'Change management: ServiceNow, BMC Remedy, or Jira Service Management',
          'CMDB: ServiceNow CMDB, Device42, or ManageEngine',
          'Workflow automation: Microsoft Power Automate, Zapier Enterprise',
          'Testing tools: Selenium, Jenkins, or Azure DevOps',
          'Documentation: Confluence, SharePoint, or wiki platforms'
        ],
        auditEvidence: [
          'Change management policy and procedures documentation',
          'Change Advisory Board charter and meeting minutes',
          'Change request forms and approval records',
          'Impact assessment documentation and risk analysis',
          'Test plans and validation results',
          'Emergency change procedures and review records',
          'CMDB integration and configuration baseline reports',
          'Change management metrics and improvement initiatives'
        ],
        crossReferences: [
          'System Acquisition, Development & Maintenance (manages development changes)',
          'Communications & Operations Management (coordinates operational changes)',
          'Risk Management (assesses change-related risks)'
        ]
      },

      'Third-Party Risk Management': {
        category: 'Third-Party Risk Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.19', title: 'Information security in supplier relationships', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.21', title: 'Managing information security in the ICT supply chain', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.15.1.2', title: 'Addressing security within supplier agreements', relevance: 'primary' },
          { framework: 'cisControls', code: '15.3', title: 'Classify Service Providers', relevance: 'primary' },
          { framework: 'cisControls', code: '15.4', title: 'Ensure Service Provider Contracts Include Security Requirements', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Supply chain security', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 28', title: 'Processor', relevance: 'supporting' }
        ],
        foundationContent: `**a) Third-party inventory and tiering**
Maintain comprehensive inventory of all third parties with risk-based tiering. Catalog all vendors, suppliers, and service providers, classify third parties by criticality and data access, document services provided and dependencies, identify fourth-party relationships, and maintain current contract and contact information.

**b) Third-party risk assessment**
Conduct thorough risk assessments before onboarding and periodically thereafter. Evaluate inherent risks of third-party services, assess third-party security capabilities and controls, review compliance certifications and audit reports, identify concentration and dependency risks, and calculate residual risk with mitigation plans.

**c) Due diligence and selection**
Implement comprehensive due diligence for third-party selection. Conduct security questionnaires and assessments, review financial stability and viability, verify compliance with relevant regulations, assess technical capabilities and maturity, and check references and reputation.

**d) Contractual security requirements**
Ensure contracts include appropriate security and privacy requirements. Define specific security control requirements, establish data protection and confidentiality terms, include incident notification obligations, specify audit and assessment rights, and define termination and data return procedures.

**e) Onboarding and integration security**
Implement secure onboarding procedures for third parties. Conduct security review before access provisioning, implement least privilege access controls, establish secure connectivity methods, provide security training and requirements, and document integration security architecture.

**f) Continuous monitoring**
Monitor third-party security posture and performance continuously. Track security ratings and scores, monitor for security incidents and breaches, review compliance status changes, assess performance against SLAs, and conduct periodic reassessments.

**g) Fourth-party risk management**
Manage risks from third-party subcontractors and suppliers. Require notification of critical subcontracting, assess fourth-party risks for critical services, ensure flow-down of security requirements, maintain visibility into fourth-party relationships, and include fourth parties in incident response.

**h) Third-party incident response**
Establish procedures for managing third-party security incidents. Define incident notification requirements and timelines, establish coordination procedures, implement forensics and investigation protocols, ensure evidence preservation, and conduct post-incident reviews.

**i) Performance management**
Manage third-party performance against security requirements. Conduct regular performance reviews, track KPIs and SLA compliance, address performance issues promptly, implement improvement plans, and maintain performance documentation.

**j) Termination and transition**
Ensure secure termination and transition of third-party relationships. Execute data return or destruction procedures, revoke all access immediately, conduct exit security assessments, manage knowledge transfer securely, and verify complete termination activities.`,
        implementationSteps: [
          'Create third-party inventory with risk-based classification',
          'Develop risk assessment methodology and questionnaires',
          'Implement due diligence procedures for selection',
          'Standardize security requirements in contracts',
          'Establish secure onboarding procedures',
          'Deploy continuous monitoring solutions',
          'Create third-party incident response procedures',
          'Develop termination and transition protocols'
        ],
        practicalTools: [
          'TPRM platforms: Prevalent, OneTrust Vendorpedia, or ServiceNow',
          'Security ratings: BitSight, SecurityScorecard, or RiskRecon',
          'Assessment tools: Shared Assessments, CAIQ, or custom questionnaires',
          'Contract management: Icertis, Agiloft, or ContractWorks',
          'Continuous monitoring: UpGuard, Panorays, or CyberGRX'
        ],
        auditEvidence: [
          'Third-party inventory with risk classifications',
          'Risk assessment reports and mitigation plans',
          'Due diligence documentation and selection records',
          'Contracts with security requirements and SLAs',
          'Onboarding security reviews and access approvals',
          'Continuous monitoring reports and scorecards',
          'Incident response procedures and coordination records',
          'Termination checklists and completion verification'
        ],
        crossReferences: [
          'Supplier Relationships (manages operational supplier aspects)',
          'Risk Management (assesses third-party risks)',
          'Compliance (ensures third-party regulatory compliance)'
        ]
      }

      // Additional categories will be implemented as needed...
    };

    // Return exact match or check for partial matches
    const exactMatch = categoryMap[cleanCategory];
    if (exactMatch) return exactMatch;
    
    // Try to find a partial match for flexibility
    const categoryKeys = Object.keys(categoryMap);
    const partialMatch = categoryKeys.find(key => 
      key.toLowerCase().includes(cleanCategory.toLowerCase()) || 
      cleanCategory.toLowerCase().includes(key.toLowerCase())
    );
    
    return partialMatch ? categoryMap[partialMatch] : null;
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