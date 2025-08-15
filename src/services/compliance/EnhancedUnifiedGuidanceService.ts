/**
 * Enhanced Unified Guidance Service
 * Contains ONLY the 21 categories actually used in the application
 * Provides comprehensive guidance with exact requirement references
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
   * Enhanced with dynamic requirement injection from actual framework mappings
   */
  static getEnhancedGuidance(
    category: string, 
    selectedFrameworks: Record<string, boolean | string>,
    dynamicRequirements?: any // Optional: actual requirements from compliance simplification mapping
  ): string {
    const categoryData = this.getCategoryData(category);
    if (!categoryData) {
      return this.getDefaultGuidance(category);
    }

    // Use dynamic requirements if provided, otherwise fall back to static ones
    const requirementReferences = dynamicRequirements 
      ? this.buildDynamicRequirementReferences(dynamicRequirements, selectedFrameworks)
      : categoryData.requirementReferences;

    // Build framework-specific references
    const references = this.buildFrameworkReferences(requirementReferences, selectedFrameworks);
    
    // Build main content
    const content = this.buildGuidanceContent(categoryData);
    
    return `${references}\n\n${content}`;
  }

  /**
   * Build dynamic requirement references from actual mapping data
   * This ensures unified guidance shows the EXACT requirements that are mapped to each category
   */
  private static buildDynamicRequirementReferences(
    mappingData: any,
    selectedFrameworks: Record<string, boolean | string>
  ): RequirementReference[] {
    const references: RequirementReference[] = [];

    // Debug logging for development (only in browser console)
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log('🔍 Dynamic Requirements - Building references for category:', mappingData?.category);
      console.log('📋 Available frameworks in mapping:', Object.keys(mappingData?.frameworks || {}));
      console.log('✅ Selected frameworks:', selectedFrameworks);
    }

    // Process each framework if it's selected and has data
    if (selectedFrameworks.iso27001 && mappingData.frameworks?.iso27001) {
      mappingData.frameworks.iso27001.forEach((req: any) => {
        references.push({
          framework: 'iso27001',
          code: req.code,
          title: req.title,
          relevance: 'primary'
        });
      });
      
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('📖 Added ISO 27001 requirements:', mappingData.frameworks.iso27001.length);
      }
    }

    if (selectedFrameworks.iso27002 && mappingData.frameworks?.iso27002) {
      mappingData.frameworks.iso27002.forEach((req: any) => {
        references.push({
          framework: 'iso27002',
          code: req.code,
          title: req.title,
          relevance: 'primary'
        });
      });
      
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('📖 Added ISO 27002 requirements:', mappingData.frameworks.iso27002.length);
      }
    }

    if (selectedFrameworks.cisControls && mappingData.frameworks?.cisControls) {
      mappingData.frameworks.cisControls.forEach((req: any) => {
        references.push({
          framework: 'cisControls',
          code: req.code,
          title: req.title,
          relevance: 'primary'
        });
      });
      
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('📖 Added CIS Controls requirements:', mappingData.frameworks.cisControls.length);
      }
    }

    if (selectedFrameworks.gdpr && mappingData.frameworks?.gdpr) {
      mappingData.frameworks.gdpr.forEach((req: any) => {
        references.push({
          framework: 'gdpr',
          code: req.code,
          title: req.title,
          relevance: 'primary'
        });
      });
      
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('📖 Added GDPR requirements:', mappingData.frameworks.gdpr.length);
      }
    }

    if (selectedFrameworks.nis2 && mappingData.frameworks?.nis2) {
      mappingData.frameworks.nis2.forEach((req: any) => {
        references.push({
          framework: 'nis2',
          code: req.code,
          title: req.title,
          relevance: 'primary'
        });
      });
      
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('📖 Added NIS2 requirements:', mappingData.frameworks.nis2.length);
      }
    }

    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log('🎯 Total dynamic requirements generated:', references.length);
    }

    return references;
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
   * Get category-specific data - ONLY contains the 21 categories used in the application
   */
  private static getCategoryData(category: string): CategoryGuidance | null {
    const cleanCategory = category.replace(/^\d+\.\s*/, '').trim();
    
    const categoryMap: Record<string, CategoryGuidance> = {
      
      // === THE 21 CATEGORIES ACTUALLY USED IN THE APPLICATION ===
      
      // 1. Governance & Leadership ✅
      'Governance & Leadership': {
        category: 'Governance & Leadership',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.1', title: 'Information security policies', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.1', title: 'Management direction for information security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.2', title: 'Information security roles and responsibilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.6.3', title: 'Segregation of duties', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.1.1', title: 'Information security policy set', relevance: 'primary' },
          { framework: 'cisControls', code: '14.1', title: 'Establish and Maintain a Security Awareness Program', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 20', title: 'Cybersecurity risk management', relevance: 'primary' }
        ],
        foundationContent: `**a) Leadership commitment with measurable accountability (ISO 27001 5.1)**\nEstablish Board-level security committee meeting quarterly minimum with documented minutes and action tracking. CEO/Board must approve information security policy annually with signed attestation. Allocate minimum 5-8% of IT budget to security initiatives with year-over-year tracking. Implement executive KPIs tied to security metrics: <5 critical findings per audit, >95% security training completion, <1% security incidents causing business impact. Require C-suite participation in annual tabletop exercises and quarterly security briefings with attendance records.\n\n**b) ISMS scope with comprehensive boundaries (ISO 27001 4.3)**\nDocument ISMS scope covering 100% of critical business processes, all data processing locations (on-premise, cloud, third-party), and complete technology stack from infrastructure to applications. Include explicit statements for out-of-scope items with risk-based justification. Define interfaces and dependencies with third parties including data flows and security responsibilities. Publish scope statement internally and to key stakeholders. Review scope quarterly and update within 30 days of major organizational changes, acquisitions, or new service launches.\n\n**c) Organizational structure with security roles (ISO 27001 5.3, GDPR Art 37-39)**\nAppoint qualified CISO reporting directly to CEO or Board, not through IT (independence requirement). Designate Data Protection Officer (mandatory for GDPR) with legal/compliance background. Establish Information Security Committee with representatives from IT, Legal, HR, Operations, and business units meeting monthly. Define security responsibilities in all job descriptions with security objectives in performance reviews. Maintain RACI matrix for all security activities with clear escalation paths. Require security certifications for key roles: CISO (CISSP/CISM), DPO (CIPP), Security Engineers (Security+/CEH).\n\n**d) Policy framework with enforcement mechanisms (ISO 27001 5.2)**\nDevelop hierarchical policy structure: Board-approved Information Security Policy, topic-specific policies (20+ domains), procedures, and work instructions. Require annual policy review with tracked changes and version control. Implement policy exception process requiring risk assessment and executive approval with maximum 90-day duration. Enforce policy compliance through automated controls where possible, with violations tracked in GRC system. Mandate annual policy acknowledgment by all employees with comprehension testing for critical policies.\n\n**e) Resource allocation**\nAllocate sufficient budget, personnel, and technology resources for security implementation. Track resource utilization and justify security investments with business cases. Ensure resources scale with organizational growth and threat evolution.\n\n**f) Performance measurement**\nEstablish security metrics and KPIs aligned with business objectives. Implement regular measurement, analysis, and reporting to management. Use metrics to demonstrate security program effectiveness and drive continuous improvement.\n\n**g) Management oversight**\nImplement management review processes with regular meetings, status reports, and decision-making authority. Ensure management understands security risks, approves major decisions, and provides strategic direction for the security program.\n\n**h) Communication and awareness**\nEstablish communication channels for security information throughout the organization. Ensure all personnel understand their security responsibilities through training, policies, and regular communications. Maintain awareness of current threats and security requirements.\n\n**i) Third-party governance**\nExtend governance principles to suppliers, contractors, and business partners. Ensure security requirements are included in contracts and regularly monitored. Maintain oversight of third-party security performance and compliance.\n\n**j) Continuous improvement**\nImplement processes for continuous improvement of the security governance framework. Regularly assess effectiveness, identify improvement opportunities, and implement changes based on lessons learned, incidents, and changing business requirements.`,
        implementationSteps: [
          'Establish written information security policy approved by management',
          'Define organizational roles and responsibilities with clear accountability',
          'Implement management review processes at planned intervals',
          'Ensure top management demonstrates visible commitment and leadership',
          'Allocate sufficient resources for information security implementation',
          'Establish security metrics and performance measurement systems',
          'Create communication channels for security awareness and reporting',
          'Implement continuous improvement processes based on regular reviews'
        ],
        practicalTools: [
          'Governance frameworks: ISO 27001, NIST Cybersecurity Framework, or COBIT',
          'Policy management: MetricStream, ServiceNow GRC, or SharePoint',
          'Risk management: Archer, LogicGate, or Resolver',
          'Training platforms: KnowBe4, Proofpoint, or custom LMS',
          'Metrics dashboards: Power BI, Tableau, or custom reporting tools'
        ],
        auditEvidence: [
          'Information security policy with management approval and review dates',
          'Organizational chart with security roles and responsibilities defined',
          'Management review meeting minutes and action item tracking',
          'Resource allocation documentation and budget approvals',
          'Security metrics reports and trend analysis',
          'Training records and awareness campaign materials',
          'Continuous improvement documentation and process updates',
          'Third-party governance contracts and monitoring reports'
        ],
        crossReferences: [
          'Risk Management (implements governance decisions)',
          'Security Awareness & Skills Training (executes governance communication)',
          'Incident Response Management (reports to governance structure)'
        ]
      },

      // 2. Risk Management ✅
      'Risk Management': {
        category: 'Risk Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.2', title: 'Information security risk assessment', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.3', title: 'Information security risk treatment', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.5.2.1', title: 'Information security risk management process', relevance: 'primary' },
          { framework: 'cisControls', code: '18.1', title: 'Establish and Maintain Penetration Testing Program', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 35', title: 'Data protection impact assessment', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.1', title: 'Cybersecurity risk management measures', relevance: 'primary' }
        ],
        foundationContent: `**a) Risk assessment with quantitative and qualitative methods**\nEstablish dual-method risk assessment using 5x5 qualitative matrices for initial screening and quantitative analysis (ALE, SLE, ARO) for high-value assets exceeding $1M impact (ISO 27001 A.5.2). Define clear risk appetite statements with tolerance thresholds: Critical <5%, High <15%, Medium <30%, Low <50% residual risk acceptance. Conduct enterprise risk assessments annually, project risk assessments for all changes, and continuous risk monitoring for critical assets. Document methodology including threat modeling (STRIDE, DREAD), likelihood scales (1-5), and financial impact calculations.\n\n**b) Asset identification with business impact analysis**\nCatalog 100% of information assets within asset management database including hardware, software, data, and intellectual property. Assign business criticality ratings using BIA criteria: Mission Critical (RTO <1hr), Business Critical (RTO <4hrs), Business Important (RTO <24hrs), Business Supporting (RTO <72hrs). Calculate asset values based on replacement cost, revenue impact, regulatory fines, and reputational damage. Map asset dependencies and single points of failure with quarterly validation against configuration management database (CMDB).\n\n**c) Threat and vulnerability identification with intelligence integration**\nImplement threat intelligence platform aggregating feeds from CISA, ENISA, industry ISACs, and commercial sources. Conduct weekly authenticated vulnerability scans achieving 95% coverage, monthly unauthenticated external scans, and quarterly penetration tests by qualified third parties (CREST, OSCP certified). Maintain vulnerability database with CVSS scoring, exploitability metrics, and threat actor TTPs. Integrate threat hunting activities identifying zero-day and advanced persistent threats (APTs).\n\n**d) Risk analysis with KRI monitoring**\nCalculate inherent and residual risk scores using consistent formula: Risk = Likelihood × Impact × Threat Capability × Vulnerability. Establish Key Risk Indicators (KRIs) with thresholds: Failed login attempts >100/hour, Patch compliance <95%, Privileged account usage >20% increase, Data exfiltration >1GB unusual transfer. Evaluate risks against board-approved risk appetite with formal acceptance required for High/Critical residual risks. Generate executive risk dashboards with heat maps, trend analysis, and predictive analytics using Monte Carlo simulations.\n\n**e) Risk treatment planning**\nDevelop comprehensive risk treatment plans for identified risks. Define treatment options including mitigation, avoidance, transfer, or acceptance. Assign ownership, timelines, and resources for implementation. Ensure treatments address root causes effectively.\n\n**f) Risk monitoring and review**\nImplement continuous risk monitoring processes with regular reviews and updates. Track risk treatment progress and effectiveness. Monitor for new risks and changing threat landscape. Conduct periodic comprehensive risk assessments.\n\n**g) Risk communication and reporting**\nEstablish clear risk communication processes for different stakeholder groups. Provide regular risk reports to management with actionable insights. Ensure risk information supports decision-making at all organizational levels.\n\n**h) Integration with business processes**\nIntegrate risk management with business planning, project management, and operational processes. Ensure risk considerations are included in major decisions, changes, and strategic initiatives.\n\n**i) Third-party risk assessment**\nExtend risk assessment to suppliers, vendors, and business partners. Evaluate third-party risks including data access, service dependencies, and supply chain vulnerabilities. Include third-party risks in overall risk register.\n\n**j) Risk culture and awareness**\nFoster risk-aware culture throughout the organization through training, communication, and leadership example. Ensure all personnel understand their role in risk management and feel empowered to identify and report risks.`,
        implementationSteps: [
          'Develop and document risk assessment methodology and criteria',
          'Conduct comprehensive asset inventory and valuation',
          'Implement systematic threat and vulnerability identification processes',
          'Perform regular risk assessments using established methodology',
          'Develop and implement risk treatment plans with clear ownership',
          'Establish risk monitoring and review processes',
          'Create risk reporting and communication procedures',
          'Integrate risk management with business decision-making processes'
        ],
        practicalTools: [
          'Risk management platforms: Archer, LogicGate, ServiceNow GRC, or Resolver',
          'Vulnerability assessment: Qualys, Rapid7, Tenable, or OpenVAS',
          'Threat intelligence: IBM X-Force, FireEye, or MITRE ATT&CK',
          'Asset management: ServiceNow, Device42, or ManageEngine',
          'Quantitative risk analysis: FAIR, Monte Carlo simulation tools'
        ],
        auditEvidence: [
          'Risk assessment methodology documentation with approval records',
          'Comprehensive asset inventory with valuations and criticality ratings',
          'Risk assessment reports with analysis and treatment decisions',
          'Risk treatment plans with implementation timelines and ownership',
          'Risk monitoring reports and trend analysis',
          'Management risk reports and decision documentation',
          'Third-party risk assessments and mitigation measures',
          'Risk awareness training records and culture assessment results'
        ],
        crossReferences: [
          'Governance & Leadership (provides risk governance oversight)',
          'Vulnerability Management (identifies and manages technical risks)',
          'Supplier & Third-Party Risk Management (manages external risks)'
        ]
      },

      // 3. Inventory and Control of Software Assets ✅ (Already had good content)
      'Inventory and Control of Software Assets': {
        category: 'Inventory and Control of Software Assets',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.9', title: 'Inventory of information and other associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.18', title: 'Use of privileged utility programs', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.8.1.1', title: 'Inventory of assets', relevance: 'primary' },
          { framework: 'cisControls', code: '2.1', title: 'Establish and Maintain a Software Inventory', relevance: 'primary' },
          { framework: 'cisControls', code: '2.2', title: 'Ensure Authorized Software is Currently Supported', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Security in network and information systems acquisition, development and maintenance', relevance: 'primary' }
        ],
        foundationContent: `**a) Comprehensive software inventory**\nMaintain complete inventory of all authorized software including operating systems, applications, utilities, scripts, and cloud services. Document software versions, licenses, installation locations, and dependencies. Track both commercial and open-source software with automated discovery achieving 95% accuracy.\n\n**b) Unauthorized software detection**\nImplement continuous monitoring to detect and alert on unauthorized software within 24 hours. Use application whitelisting, endpoint detection, and software metering tools. Establish procedures for immediate investigation and remediation of unauthorized software. Maintain metrics on detection and response times.\n\n**c) Software standardization**\nEstablish approved software catalog with standard configurations and versions. Define software categories and approval requirements. Implement software request and approval workflows. Maintain technology roadmap for software lifecycle planning.\n\n**d) License management**\nTrack software licenses, entitlements, and compliance status. Monitor license usage against purchased quantities. Implement license optimization to reduce costs. Maintain vendor contracts and support agreements. Ensure compliance with licensing terms and audits.\n\n**e) End-of-life and unsupported software**\nIdentify software approaching or past end-of-life/end-of-support. Establish migration plans for unsupported software. Implement compensating controls for software that cannot be immediately replaced. Track security risks associated with legacy software.\n\n**f) Cloud and SaaS applications**\nExtend inventory to cloud services and SaaS applications. Implement cloud access security broker (CASB) for visibility. Track data flows to cloud services. Manage shadow IT through discovery and governance.\n\n**g) Development and custom software**\nInventory internally developed applications and scripts. Track development frameworks and libraries. Maintain software bill of materials (SBOM). Monitor for vulnerabilities in custom code and dependencies.\n\n**h) Software installation and deployment**\nControl software installation through centralized deployment tools. Implement least privilege for software installation rights. Maintain software packaging standards. Track deployment success rates and issues.\n\n**i) Integration with security processes**\nIntegrate software inventory with vulnerability management for patch prioritization. Link to incident response for compromise assessment. Connect with change management for impact analysis. Support data protection through software data flow mapping.\n\n**j) Inventory validation and reconciliation**\nConduct regular software audits comparing discovered versus authorized software. Investigate discrepancies and unauthorized installations. Maintain software inventory accuracy metrics. Report compliance status to management.`,
        implementationSteps: [
          'Deploy software discovery tools across all endpoints and servers',
          'Create authorized software catalog with approval workflows',
          'Implement application whitelisting or control solutions',
          'Establish software license management system',
          'Deploy cloud application discovery tools',
          'Create end-of-life software tracking and migration planning',
          'Integrate software inventory with vulnerability management',
          'Conduct quarterly software compliance audits'
        ],
        practicalTools: [
          'Software inventory: Microsoft SCCM, ManageEngine Desktop Central, or Snow Software',
          'Application control: Microsoft AppLocker, Ivanti Application Control, or Carbon Black',
          'License management: Flexera, Snow License Manager, or ServiceNow SAM',
          'Cloud discovery: Microsoft Cloud App Security, Netskope, or Cisco Cloudlock',
          'SBOM tools: OWASP Dependency-Track, Sonatype Nexus, or JFrog Xray'
        ],
        auditEvidence: [
          'Complete software inventory with 95%+ accuracy metrics',
          'Authorized software catalog and approval procedures',
          'Unauthorized software detection logs and remediation records',
          'License compliance reports and audit results',
          'End-of-life software tracking with migration plans',
          'Cloud application inventory and governance documentation',
          'Software deployment logs and success metrics',
          'Quarterly audit reports with reconciliation records'
        ],
        crossReferences: [
          'Inventory and Control of Hardware Assets (software runs on hardware)',
          'Vulnerability Management (patches software vulnerabilities)',
          'Data Protection (tracks data processing software)'
        ]
      },

      // 4. Inventory and Control of Hardware Assets ✅ (Already had good content)
      'Inventory and Control of Hardware Assets': {
        category: 'Inventory and Control of Hardware Assets',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.9', title: 'Inventory of information and other associated assets', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.11', title: 'Return of assets', relevance: 'primary' },
          { framework: 'iso27002', code: 'A.8.1.1', title: 'Inventory of assets', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'primary' },
          { framework: 'cisControls', code: '1.2', title: 'Address Unauthorized Assets', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 30', title: 'Records of processing activities', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.a', title: 'Risk analysis and information system security', relevance: 'primary' }
        ],
        foundationContent: `**a) Comprehensive hardware inventory**\nEstablish and maintain detailed inventory of ALL hardware assets including computers, servers, network devices, mobile devices, IoT devices, and peripheral equipment. Document hardware specifications, locations, ownership, criticality, and security classification. Use automated discovery tools with network scanning, agent-based detection, and manual verification to achieve 98% inventory accuracy with weekly updates.\n\n**b) Unauthorized hardware detection**\nImplement automated detection of unauthorized hardware connections within 4 hours using network access control (NAC), endpoint security systems, and physical security monitoring. Establish immediate quarantine procedures for unauthorized devices with automated network isolation. Document all unauthorized hardware incidents for root cause analysis.\n\n**c) Hardware lifecycle management**\nManage hardware throughout complete lifecycle from procurement to disposal. Establish procurement procedures with security requirements and approved vendor lists. Implement secure deployment with hardening standards and baseline configurations. Maintain hardware through regular updates, patches, and maintenance. Plan replacement based on age, performance, and security support. Ensure secure disposal with data destruction certification.\n\n**d) Asset classification and labeling**\nClassify hardware assets based on criticality, sensitivity of data processed, and business impact. Apply physical and digital labels with asset tags, QR codes, or RFID. Maintain classification consistency across inventory systems. Update classifications based on changing usage or risk profiles.\n\n**e) Ownership and accountability**\nAssign clear ownership for each hardware asset with documented responsibilities. Designate asset custodians for day-to-day management. Establish accountability through regular attestations and reviews. Maintain chain of custody for asset transfers and changes.\n\n**f) Mobile and remote device management**\nImplement mobile device management (MDM) for all portable hardware. Enforce security policies including encryption, authentication, and remote wipe. Track device location and usage patterns. Manage BYOD devices with containerization and security controls.\n\n**g) Network device inventory**\nMaintain specialized inventory for network infrastructure including routers, switches, firewalls, and wireless access points. Document network topology and interconnections. Track firmware versions and security configurations. Monitor for unauthorized network changes.\n\n**h) Virtual and cloud assets**\nExtend inventory to virtual machines, containers, and cloud instances. Track dynamic infrastructure with automated discovery. Maintain visibility across hybrid environments. Ensure consistent security controls for virtual assets.\n\n**i) Integration with other processes**\nIntegrate hardware inventory with vulnerability management for patch prioritization. Link to incident response for affected asset identification. Connect with change management for impact analysis. Support business continuity with critical asset identification.\n\n**j) Inventory accuracy and validation**\nConduct regular inventory reconciliation comparing multiple data sources. Perform physical verification audits quarterly. Investigate and resolve discrepancies promptly. Maintain inventory accuracy metrics with improvement targets.`,
        implementationSteps: [
          'Deploy automated asset discovery tools across all network segments',
          'Establish hardware asset database with complete attribute tracking',
          'Implement network access control (NAC) for unauthorized device detection',
          'Create hardware lifecycle procedures from procurement to disposal',
          'Deploy mobile device management (MDM) for portable assets',
          'Establish asset classification scheme with labeling standards',
          'Integrate inventory with vulnerability and change management',
          'Conduct quarterly physical inventory verification audits'
        ],
        practicalTools: [
          'Asset discovery: Lansweeper, ManageEngine AssetExplorer, or Device42',
          'Network access control: Cisco ISE, Aruba ClearPass, or ForeScout',
          'Mobile device management: Microsoft Intune, VMware Workspace ONE, or Jamf',
          'Asset tracking: ServiceNow, BMC Helix, or Ivanti',
          'Network mapping: SolarWinds, Auvik, or NetBrain'
        ],
        auditEvidence: [
          'Complete hardware inventory with 98%+ accuracy metrics',
          'Automated discovery tool configurations and scan schedules',
          'Unauthorized device detection logs and quarantine procedures',
          'Hardware lifecycle documentation with disposal certificates',
          'Asset classification policy and labeling evidence',
          'MDM enrollment reports and compliance statistics',
          'Physical inventory audit results and reconciliation records',
          'Integration documentation with other security processes'
        ],
        crossReferences: [
          'Inventory and Control of Software Assets (manages software on hardware)',
          'Vulnerability Management (prioritizes patches for hardware)',
          'Network Infrastructure Management (secures network infrastructure devices)'
        ]
      },

      // 5. Identity & Access Management ✅
      'Identity & Access Management': {
        category: 'Identity & Access Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.1', title: 'User access provisioning', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.2', title: 'User access rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.3', title: 'Information access restriction', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.5', title: 'Privileged access rights', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.6', title: 'Access rights removal or adjustment', relevance: 'primary' },
          { framework: 'cisControls', code: '5.1', title: 'Establish and Maintain an Inventory of Accounts', relevance: 'primary' },
          { framework: 'cisControls', code: '5.2', title: 'Use Unique Passwords', relevance: 'primary' },
          { framework: 'cisControls', code: '6.1', title: 'Establish an Access Granting Process', relevance: 'primary' },
          { framework: 'cisControls', code: '6.2', title: 'Establish an Access Revoking Process', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Identity and access management', relevance: 'primary' }
        ],
        foundationContent: `**a) User account management - Why every employee needs a digital identity**
Think of this like creating employee badges for your digital workplace. Just like physical badges, every person who works for your organization needs a unique digital identity to access systems and data. This means creating user accounts when someone joins your company, updating their access when they change roles, and removing their access when they leave.

What this means in practice: When Sarah starts as a marketing manager, she automatically gets access to the marketing systems within 24 hours. When she's promoted to marketing director, her access gets updated to include budget management tools. When she leaves the company, all her access is removed within 4 hours to prevent unauthorized access.

Why this matters: Without proper account management, ex-employees might still have access to your systems (a major security risk), or new employees can't do their jobs because they don't have the right access. This is like having keys to your office but not knowing who has them or if they still work there.

**b) Multi-factor authentication - Like having two locks on your front door**
Imagine your house had only one lock, and a burglar found your key. They'd walk right in. Multi-factor authentication (MFA) is like having multiple different types of locks - even if someone steals your password, they still can't get in without the second "key" (like a code from your phone).

What this means in practice: When John tries to log into the company email, he enters his password (something he knows) AND a code from his smartphone app (something he has). Both are required - having just the password isn't enough.

Why this matters: 99.9% of cyber attacks using stolen passwords are stopped by MFA. It's like having a security guard who checks both your ID and your access card - much harder for bad actors to fake both. For sensitive data or admin access, this becomes absolutely critical.

**c) Access control - Giving people only what they need for their job**
This is like giving employees only the keys to the rooms they need for their work. The janitor gets keys to all rooms for cleaning, but the intern only gets keys to the break room and their work area. In digital terms, this means people only get access to the systems and data they need to do their specific job.

What this means in practice: Maria in Accounting can see payroll data and financial reports, but she can't access the engineering team's product designs. Meanwhile, Tom the software engineer can access code repositories and development tools, but not the HR system with employee personal information.

Why this matters: If someone's account gets compromised (hacked), the damage is limited to only what that person had access to. It also prevents internal fraud and ensures compliance with privacy laws. It's about creating digital boundaries that match job responsibilities.

**d) Privileged account management - Extra security for the digital "master keys"**
Some people in your organization have "master keys" - like system administrators who can access everything, or executives who can approve large purchases. These accounts need extra protection because they have more power to cause damage if misused.

What this means in practice: When your IT administrator needs to install new software on the server, they request temporary elevated access for 4 hours, their session is recorded, and a second person must approve critical actions. After 4 hours, their special access automatically expires.

Why this matters: These powerful accounts are the crown jewels for cyber attackers. If they compromise a regular employee account, they can do limited damage. If they compromise an admin account, they can potentially access everything. Extra security here prevents the worst-case scenarios.

**e) Single sign-on - One key for multiple doors**
Instead of having separate keys for every door in a building, imagine having one master key that works for all the doors you're supposed to access. Single sign-on (SSO) works the same way - one login gives you access to all your work applications.

What this means in practice: Lisa logs in once in the morning, and she can access email, customer database, project management tool, and expense system without entering her password again for each one.

Why this matters: People use weak passwords when they have to remember many of them. With SSO, they only need one strong password, and IT can ensure all applications have the same security standards. It also makes it easier to remove access when someone leaves.

**f) Regular access reviews - Spring cleaning for digital permissions**
Just like you periodically clean out your garage and get rid of things you don't need, organizations need to regularly review who has access to what systems and remove access that's no longer needed.

What this means in practice: Every quarter, managers review a list of what their team members can access and confirm it's still appropriate. They might discover that Jake from marketing still has access to the old project management system from two years ago, which can now be removed.

Why this matters: Over time, people accumulate digital access they don't need (called "access creep"). Regular reviews ensure people only have current, necessary access, reducing security risks and compliance issues.

**g) Identity management systems - The digital employee directory**
This is like having a central phone book that knows everything about every employee and what they should have access to, and it automatically updates all the different systems when changes happen.

What this means in practice: When HR updates someone's job title in the system, it automatically updates their access across email, file systems, applications, and other tools without manual work.

Why this matters: Without central management, IT has to manually update dozens of systems when someone changes roles, which is slow and error-prone. Centralized identity management ensures consistency and reduces the risk of forgotten access.

**h) External user access - Managing visitors to your digital workplace**
Just like you have procedures for physical visitors (visitor badges, escorts, time limits), you need similar procedures for external people who need access to your systems - contractors, consultants, partners, or vendors.

What this means in practice: When ABC Consulting needs access to review your financial systems for an audit, you give them temporary access that automatically expires after 30 days, and their access is more limited and closely monitored than regular employees.

Why this matters: External users often need access but shouldn't be treated like permanent employees. They need appropriate restrictions and oversight since you have less control over their security practices.

**i) Access monitoring - Security cameras for digital access**
Just like physical security cameras record who enters and exits buildings, digital access monitoring records who accesses what systems and data, helping detect suspicious activity.

What this means in practice: The system notices that someone logged in from Singapore at 2 AM (when they normally work in New York during business hours) and flags this for investigation. Or it notices someone accessing unusually large amounts of customer data.

Why this matters: This helps detect both external attacks and internal misuse. If someone's account gets compromised or if an employee goes rogue, unusual access patterns can alert security teams before major damage occurs.

**j) Compliance documentation - Proving you're doing things right**
Just like keeping receipts for tax purposes, you need to document your access control practices to prove to auditors, regulators, and customers that you're protecting data properly.

What this means in practice: You maintain records showing who had access to what systems when, evidence that you're regularly reviewing access, documentation of your security policies, and reports showing your compliance with requirements.

Why this matters: Many regulations (like GDPR, SOX, HIPAA) require proof that you're controlling access to sensitive data. Having good documentation protects you during audits and demonstrates due diligence if there's ever a security incident.`,
        implementationSteps: [
          'Deploy centralized identity management platform with automated provisioning',
          'Implement multi-factor authentication for all user accounts',
          'Establish role-based access control with least privilege principles',
          'Deploy privileged access management solution for administrative accounts',
          'Implement single sign-on and identity federation capabilities',
          'Create automated access review and recertification processes',
          'Integrate with enterprise directory services and maintain synchronization',
          'Establish monitoring and alerting for identity-related security events'
        ],
        practicalTools: [
          'Identity providers: Microsoft Azure AD, Okta, Ping Identity, or ForgeRock',
          'Privileged access management: CyberArk, BeyondTrust, Thycotic, or HashiCorp Vault',
          'Multi-factor authentication: Duo, RSA, Microsoft Authenticator, or Google Auth',
          'Access governance: SailPoint, Saviynt, Microsoft Identity Governance, or Oracle IDM',
          'Directory services: Microsoft Active Directory, OpenLDAP, or AWS Directory Service'
        ],
        auditEvidence: [
          'User account inventory with provisioning and deprovisioning records',
          'Multi-factor authentication deployment and compliance reports',
          'Role-based access control documentation and role definitions',
          'Privileged access management logs and session recordings',
          'Access review and recertification reports with remediation actions',
          'Identity federation and SSO configuration documentation',
          'Directory services integration and synchronization logs',
          'Identity monitoring and incident response records'
        ],
        crossReferences: [
          'Governance & Leadership (defines access governance policies)',
          'Security Awareness & Skills Training (trains users on access security)',
          'Audit Log Management (monitors identity and access events)'
        ]
      },

      // 6. Data Protection ✅
      'Data Protection': {
        category: 'Data Protection',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.9', title: 'Information classification', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.10', title: 'Information labelling', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.11', title: 'Information handling', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.12', title: 'Data loss prevention', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.24', title: 'Use of cryptography', relevance: 'primary' },
          { framework: 'cisControls', code: '3.1', title: 'Establish and Maintain a Data Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '3.2', title: 'Establish and Maintain a Data Inventory', relevance: 'primary' },
          { framework: 'cisControls', code: '3.3', title: 'Configure Data Access Control Lists', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 17', title: 'Right to erasure', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.c', title: 'Data protection and privacy', relevance: 'primary' }
        ],
        foundationContent: `**a) Data classification - Organizing your information like a filing system**
Think of data classification like organizing files in your office. Just as you wouldn't store sensitive HR documents in the same unlocked drawer as company newsletters, you need to organize digital information based on how sensitive it is and who should have access to it.

What this means in practice: Your organization creates a simple system with four levels: Public (anyone can see it, like your website), Internal Use (only employees, like meeting minutes), Confidential (sensitive business info, like financial reports), and Restricted (highly sensitive, like social security numbers). Each document, email, and database gets labeled with the appropriate level, and these labels determine how it can be shared and protected.

Why this matters: When everything is treated the same, either you waste money over-protecting unimportant data, or you under-protect sensitive information that could cause major damage if leaked. Proper classification ensures the right protection for the right information. It's like having different types of safes - a fireproof safe for important documents, but just a locked drawer for everyday paperwork.

**b) Data inventory - Knowing what information you have and where**
Imagine trying to secure your house but not knowing how many doors and windows you have, or what valuables are inside. A data inventory is like creating a complete map of all the information your organization collects, stores, and processes, so you know what needs protection.

What this means in practice: You create a comprehensive list of all the personal and sensitive data your organization handles - customer information, employee records, financial data, etc. For each type of data, you document where it comes from, how it's used, who has access, where it's stored, and how long you keep it. This includes tracking data that moves between systems or gets shared with third parties.

Why this matters: You can't protect what you don't know exists. Many data breaches happen because organizations didn't realize they had sensitive data in unexpected places. Laws like GDPR require you to know exactly what personal data you process and why. It's like having a complete inventory of your home before getting insurance - you need to know what you're protecting.

**c) Data access controls - Digital locks and keys for your information**
Just like you have different keys for different rooms in a building, data access controls ensure people can only access the information they need for their specific job role. This prevents sensitive data from being seen by people who don't need it or shouldn't have it.

What this means in practice: The HR manager can access employee personal information for payroll purposes, but can't see the company's financial forecasts. The finance team can see budget data but can't access individual employee health records. These permissions are automatically enforced by the system, and they're regularly reviewed to make sure they're still appropriate.

Why this matters: Most data breaches involve inappropriate access to information. Sometimes it's an attacker who gained access they shouldn't have, sometimes it's an insider who misuses their access. Proper access controls limit the potential damage if someone's account gets compromised or if an employee acts inappropriately. It's about creating digital boundaries that match business needs and privacy requirements.

**d) Data encryption - Making information unreadable to unauthorized people**
Encryption is like translating your sensitive information into a secret code that only authorized people have the key to decode. Even if someone steals encrypted data, they can't read it without the decryption key.

What this means in practice: When sensitive data is stored on servers, laptops, or sent over the internet, it gets scrambled using mathematical algorithms. Only people with the proper credentials can unscramble it back into readable form. It's like having a conversation in a secret language that only you and the intended recipient understand, even if someone else is listening.

Why this matters: Data gets stolen regularly - laptops get lost, databases get hacked, emails get intercepted. Encryption means that even if the data falls into the wrong hands, it's useless without the decryption key. Many regulations require encryption for certain types of sensitive data. It's your last line of defense when other security measures fail.

**e) Data loss prevention - Automatically stopping information from leaving inappropriately**
Think of this like having smart security guards that can recognize when someone is trying to take sensitive information out of the building inappropriately. Data loss prevention (DLP) systems automatically monitor and block attempts to inappropriately share or steal sensitive data.

What this means in practice: The system automatically scans emails, file transfers, and other data movements. If someone tries to email a spreadsheet full of customer credit card numbers to their personal Gmail account, the system blocks it and alerts security. It can recognize patterns like social security numbers, credit card numbers, or confidential documents based on their labels.

Why this matters: People make mistakes or sometimes act maliciously. An employee might accidentally attach the wrong file to an email, or a disgruntled worker might try to steal customer data. DLP systems provide an automated safety net that prevents these incidents from becoming data breaches. It's like having an intelligent alarm system that knows the difference between authorized and unauthorized data movement.

**f) Data retention and disposal - Digital housekeeping**
Just like you eventually throw away old paperwork you no longer need, organizations need policies for how long to keep different types of data and how to securely dispose of it when it's no longer needed.

What this means in practice: You establish rules like "keep customer transaction records for 7 years, employee payroll records for 4 years, and marketing email lists until customers opt out." When data reaches its expiration date, it gets automatically deleted using methods that make it unrecoverable. For physical devices, this might mean professional data destruction services.

Why this matters: Keeping data forever increases your risk and costs. Old, forgotten data can be breached, and many privacy laws require you to delete personal data when it's no longer needed. Proper retention and disposal reduces your attack surface and demonstrates compliance with privacy regulations. It's like regularly clearing out old files to reduce clutter and security risks.

**g) Privacy by design - Building privacy into everything from the start**
Instead of trying to add privacy protections after a system is built, privacy by design means considering privacy implications from the very beginning of any project or system design.

What this means in practice: When designing a new customer portal, you automatically include features like data minimization (only collecting necessary information), user consent management, and easy ways for customers to access or delete their data. Privacy considerations become part of the standard development checklist.

Why this matters: It's much easier and cheaper to build privacy protections into systems from the beginning than to retrofit them later. Privacy by design helps prevent privacy violations before they happen and demonstrates proactive compliance with privacy regulations. It's like building a house with security features included rather than trying to add them after construction is complete.

**h) Cross-border data transfers - Moving information across international boundaries safely**
When data moves from one country to another, different privacy laws may apply. This is about ensuring you comply with all relevant regulations when transferring personal data internationally.

What this means in practice: Before sending European customer data to your US-based customer service center, you verify that appropriate legal protections are in place, such as adequacy decisions or standard contractual clauses. You document all international data transfers and ensure they meet the requirements of laws like GDPR.

Why this matters: International data transfers are heavily regulated, with significant penalties for non-compliance. Different countries have different privacy laws and standards. Proper handling of cross-border transfers protects your organization from legal issues and maintains customer trust in how their data is handled globally.

**i) Data breach response - Having a plan when things go wrong**
Even with good protection, data breaches can still happen. This is about having a clear, tested plan for how to respond quickly and appropriately when a breach occurs.

What this means in practice: You have documented procedures for identifying breaches, assessing their scope and impact, containing the problem, notifying affected individuals and regulators within required timeframes (like GDPR's 72-hour rule), and taking steps to prevent similar incidents in the future.

Why this matters: How you respond to a breach can significantly affect its impact on your business and reputation. Quick, appropriate response can minimize damage and demonstrate responsibility. Poor response can lead to additional regulatory penalties and loss of customer trust. It's like having a fire emergency plan - you hope you never need it, but when you do, you need to act quickly and correctly.

**j) Third-party data processing - Managing data when others handle it for you**
When you use external vendors, cloud services, or partners that handle your data, you need to ensure they protect it as well as you would. This is about maintaining responsibility for data protection even when others are processing it on your behalf.

What this means in practice: Before signing with a cloud storage provider or outsourced customer service company, you verify their security practices, include specific data protection requirements in contracts, and regularly audit their compliance. You maintain oversight even though they're handling the data.

Why this matters: You remain legally responsible for data protection even when third parties process data for you. A breach at a vendor can become your breach from a legal and reputational perspective. Proper third-party management ensures consistent data protection across your entire ecosystem and helps prevent vendor-related incidents from affecting your organization.`,
        implementationSteps: [
          'Implement comprehensive data classification and labeling system',
          'Create complete data inventory with mapping of data flows',
          'Deploy granular data access controls based on classification',
          'Implement encryption for data at rest and in transit',
          'Deploy data loss prevention solutions with monitoring capabilities',
          'Establish data retention policies with automated lifecycle management',
          'Integrate privacy by design principles into system development',
          'Implement data breach detection and response procedures'
        ],
        practicalTools: [
          'Data classification: Microsoft Purview, Varonis, Forcepoint, or Spirion',
          'Data loss prevention: Symantec DLP, Forcepoint DLP, Microsoft Purview DLP, or Digital Guardian',
          'Encryption: Vormetric, Vera, Microsoft Azure RMS, or Thales',
          'Key management: AWS KMS, Azure Key Vault, HashiCorp Vault, or Thales HSM',
          'Privacy management: OneTrust, TrustArc, BigID, or Privacera'
        ],
        auditEvidence: [
          'Data classification policy and implementation evidence',
          'Complete data inventory with classification and flow mapping',
          'Data access control configurations and permission matrices',
          'Encryption implementation documentation and key management procedures',
          'Data loss prevention system logs and incident reports',
          'Data retention schedules and disposal certificates',
          'Privacy impact assessments and design documentation',
          'Data processing agreements and third-party assessments'
        ],
        crossReferences: [
          'Identity & Access Management (controls access to protected data)',
          'Vulnerability Management (secures systems processing data)',
          'Supplier & Third-Party Risk Management (manages processor relationships)'
        ]
      },

      // 7. Secure Configuration of Hardware and Software ✅
      'Secure Configuration of Hardware and Software': {
        category: 'Secure Configuration of Hardware and Software',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.29', title: 'Configuration management', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.30', title: 'Information deletion', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.31', title: 'Data masking', relevance: 'primary' },
          { framework: 'cisControls', code: '4.1', title: 'Establish and Maintain a Secure Configuration Process', relevance: 'primary' },
          { framework: 'cisControls', code: '4.2', title: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure', relevance: 'primary' },
          { framework: 'cisControls', code: '4.3', title: 'Configure Automatic Session Locking on Enterprise Assets', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Security in network and information systems acquisition, development and maintenance', relevance: 'primary' }
        ],
        foundationContent: `**a) Baseline configuration standards**\\nEstablish secure configuration baselines for all hardware and software components including operating systems, applications, network devices, and cloud services. Document configuration standards aligned with industry benchmarks like CIS Controls, NIST, or vendor security guides. Regularly update baselines to address new threats and vulnerabilities.\\n\\n**b) Configuration management process**\\nImplement systematic configuration management with version control, change tracking, and rollback capabilities. Maintain configuration repositories with automated deployment tools. Establish approval processes for configuration changes and document all modifications.\\n\\n**c) Hardening procedures**\\nApply security hardening measures including disabling unnecessary services, removing default accounts, configuring strong authentication, and enabling security features. Use automated hardening tools and scripts where possible. Validate hardening effectiveness through compliance scanning.\\n\\n**d) Default credential management**\\nChange all default passwords and credentials on systems and applications before deployment. Implement strong password policies for default accounts that cannot be removed. Maintain inventory of all default accounts and their remediation status.\\n\\n**e) Service and port management**\\nDisable unnecessary services, ports, and protocols on all systems. Implement network segmentation to limit service exposure. Regularly audit running services and network listeners to identify unauthorized changes.\\n\\n**f) Configuration drift detection**\\nImplement automated tools to detect configuration drift from approved baselines. Establish alerting for unauthorized configuration changes and remediation procedures. Conduct regular configuration compliance assessments.\\n\\n**g) Secure deployment procedures**\\nDevelop secure deployment processes with configuration validation before production. Use infrastructure as code (IaC) for consistent and repeatable deployments. Implement automated security testing in deployment pipelines.\\n\\n**h) Patch management integration**\\nIntegrate secure configuration with patch management processes to ensure security updates don't break configurations. Test patches in secure baseline environments before production deployment.\\n\\n**i) Cloud and virtualization security**\\nExtend secure configuration practices to cloud services and virtual machines. Use cloud security posture management (CSPM) tools to monitor cloud configurations. Implement container security scanning and runtime protection.\\n\\n**j) Documentation and training**\\nMaintain comprehensive documentation for all secure configuration procedures and standards. Provide training to system administrators and developers on secure configuration practices. Establish knowledge management for configuration best practices.`,
        implementationSteps: [
          'Develop secure configuration baselines for all system types',
          'Implement configuration management tools with version control',
          'Deploy automated hardening scripts and compliance scanning',
          'Establish change management processes for configuration updates',
          'Implement configuration drift detection and alerting',
          'Create secure deployment procedures with validation testing',
          'Deploy cloud security posture management for cloud resources',
          'Provide training on secure configuration practices'
        ],
        practicalTools: [
          'Configuration management: Ansible, Chef, Puppet, or SaltStack',
          'Compliance scanning: Qualys VMDR, Rapid7, Tenable.sc, or OpenSCAP',
          'Infrastructure as Code: Terraform, CloudFormation, or Azure ARM',
          'Container security: Twistlock, Aqua Security, or Sysdig Secure',
          'Cloud security posture: Prisma Cloud, CloudGuard, or AWS Config'
        ],
        auditEvidence: [
          'Secure configuration baseline documentation and approval records',
          'Configuration management system implementation with change logs',
          'Hardening compliance scan results and remediation tracking',
          'Default credential inventory and remediation evidence',
          'Configuration drift detection reports and resolution records',
          'Secure deployment procedures and validation test results',
          'Training records for secure configuration practices',
          'Cloud security posture assessments and findings'
        ],
        crossReferences: [
          'Vulnerability Management (addresses configuration vulnerabilities)',
          'Network Infrastructure Management (secures network device configurations)',
          'Secure Software Development (implements secure coding configurations)'
        ]
      },

      // 8. Vulnerability Management ✅
      'Vulnerability Management': {
        category: 'Vulnerability Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.8.8', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.14.2.3', title: 'Technical review of applications after operating platform changes', relevance: 'primary' },
          { framework: 'cisControls', code: '7.1', title: 'Establish and Maintain a Vulnerability Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.2', title: 'Establish and Maintain a Remediation Process', relevance: 'primary' },
          { framework: 'cisControls', code: '7.3', title: 'Perform Automated Operating System Patch Management', relevance: 'primary' },
          { framework: 'cisControls', code: '7.4', title: 'Perform Automated Application Patch Management', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Systems for vulnerability handling and disclosure', relevance: 'primary' }
        ],
        foundationContent: `**a) Vulnerability assessment program**\\nEstablish comprehensive vulnerability assessment program with regular scanning of all systems, applications, and network infrastructure. Use both authenticated and unauthenticated scanning approaches. Conduct vulnerability assessments at least monthly for critical systems and quarterly for all systems.\\n\\n**b) Asset discovery and inventory**\\nMaintain accurate asset inventory integrated with vulnerability management tools. Implement continuous asset discovery to identify new or unauthorized systems. Ensure all assets are included in vulnerability scanning scope with proper authentication credentials.\\n\\n**c) Risk-based prioritization**\\nImplement risk-based vulnerability prioritization considering exploitability, business impact, and threat intelligence. Use vulnerability scoring systems (CVSS) enhanced with contextual information. Prioritize vulnerabilities in internet-facing systems and critical business applications.\\n\\n**d) Patch management process**\\nEstablish systematic patch management with automated deployment capabilities. Test patches in development environments before production deployment. Maintain patch deployment windows with rollback procedures. Track patch compliance across all systems with reporting.\\n\\n**e) Remediation timelines**\\nDefine vulnerability remediation timelines based on risk severity: Critical (72 hours), High (7 days), Medium (30 days), Low (90 days). Track remediation progress with automated reporting to management. Implement compensating controls when patches cannot be immediately applied.\\n\\n**f) Third-party and vendor management**\\nExtend vulnerability management to third-party systems and vendor-managed services. Require vulnerability scanning and patch management commitments in vendor contracts. Monitor third-party security bulletins and coordinate remediation activities.\\n\\n**g) Web application security testing**\\nConduct regular web application vulnerability assessments including dynamic (DAST) and static (SAST) analysis. Implement automated security testing in development pipelines. Address OWASP Top 10 vulnerabilities and secure coding practices.\\n\\n**h) Threat intelligence integration**\\nIntegrate threat intelligence feeds to prioritize vulnerabilities based on active threats. Monitor for indicators of compromise (IoCs) related to unpatched vulnerabilities. Participate in threat intelligence sharing programs for early warning.\\n\\n**i) Metrics and reporting**\\nEstablish vulnerability management metrics including time to detection, remediation rates, and risk reduction. Provide regular reports to management with trend analysis. Measure program effectiveness and continuous improvement opportunities.\\n\\n**j) Emergency response procedures**\\nEstablish emergency patching procedures for zero-day vulnerabilities and active exploits. Define escalation processes for critical vulnerabilities. Coordinate with incident response team for vulnerability-related security events.`,
        implementationSteps: [
          'Deploy comprehensive vulnerability scanning tools across all environments',
          'Establish risk-based vulnerability prioritization methodology',
          'Implement automated patch management systems with testing procedures',
          'Define vulnerability remediation timelines and tracking processes',
          'Integrate threat intelligence for enhanced vulnerability prioritization',
          'Deploy web application security testing tools and processes',
          'Establish metrics and reporting for vulnerability management program',
          'Create emergency response procedures for critical vulnerabilities'
        ],
        practicalTools: [
          'Vulnerability scanning: Qualys, Rapid7, Tenable, or OpenVAS',
          'Patch management: Microsoft WSUS/SCCM, Red Hat Satellite, or Tanium',
          'Web application testing: Veracode, Checkmarx, SonarQube, or OWASP ZAP',
          'Threat intelligence: FireEye, IBM X-Force, or MITRE ATT&CK',
          'Vulnerability management: ServiceNow Security Operations, or Kenna Security'
        ],
        auditEvidence: [
          'Vulnerability assessment reports with remediation tracking',
          'Patch management system deployment and compliance reports',
          'Risk-based prioritization methodology and implementation evidence',
          'Vulnerability remediation timeline compliance and metrics',
          'Web application security testing reports and remediation records',
          'Threat intelligence integration and prioritization examples',
          'Vulnerability management metrics and trend analysis reports',
          'Emergency response procedures and activation records'
        ],
        crossReferences: [
          'Secure Configuration of Hardware and Software (addresses configuration vulnerabilities)',
          'Network Infrastructure Management (manages network security vulnerabilities)',
          'Secure Software Development (prevents application vulnerabilities)'
        ]
      },

      // 9. Physical & Environmental Security Controls ✅
      'Physical & Environmental Security Controls': {
        category: 'Physical & Environmental Security Controls',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.7.1', title: 'Physical security perimeters', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.2', title: 'Physical entry', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.3', title: 'Protection against environmental threats', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.4', title: 'Working in secure areas', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.11.1.1', title: 'Equipment siting and protection', relevance: 'primary' },
          { framework: 'cisControls', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', relevance: 'supporting' },
          { framework: 'cisControls', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.f', title: 'Physical security and security of facilities', relevance: 'primary' }
        ],
        foundationContent: `**a) Physical security perimeters**\\nEstablish clear physical security perimeters around facilities containing information systems and data. Implement multiple layers of physical barriers including fencing, walls, and controlled access points. Install intrusion detection systems and surveillance cameras with 24/7 monitoring capabilities.\\n\\n**b) Access control systems**\\nImplement multi-factor physical access control using card readers, biometrics, and PIN codes. Maintain visitor management systems with escort requirements for non-employees. Log all physical access attempts and conduct regular access reviews for terminated or transferred personnel.\\n\\n**c) Environmental monitoring and protection**\\nDeploy environmental monitoring systems for temperature, humidity, water detection, and power quality. Implement redundant power systems with uninterruptible power supplies (UPS) and backup generators. Install fire suppression systems appropriate for electronic equipment (gas-based or water mist).\\n\\n**d) Secure areas and zones**\\nDesign facilities with graduated security zones based on sensitivity levels. Implement clean desk policies and secure storage for sensitive materials. Establish secure server rooms and data centers with restricted access and environmental controls.\\n\\n**e) Equipment protection and maintenance**\\nSecure all IT equipment against theft, tampering, and environmental damage. Implement equipment maintenance schedules with authorized service providers only. Maintain equipment inventory with location tracking and ownership assignment.\\n\\n**f) Cable and network protection**\\nProtect network and power cabling from unauthorized access, damage, and interference. Use conduits, cable trays, and secure pathways for sensitive cabling. Implement cable labeling and documentation for maintenance and troubleshooting.\\n\\n**g) Waste and media disposal**\\nEstablish secure disposal procedures for electronic media, paper documents, and equipment. Use certified destruction services with certificates of destruction. Implement clear desk and clear screen policies to prevent information exposure.\\n\\n**h) Workplace security**\\nImplement security measures for remote work locations and mobile devices. Establish secure storage for portable equipment and media. Provide security awareness training for physical security responsibilities.\\n\\n**i) Incident detection and response**\\nDeploy physical security monitoring with 24/7 security operations center capabilities. Establish incident response procedures for physical security breaches. Integrate physical security events with cyber security incident response.\\n\\n**j) Business continuity integration**\\nIntegrate physical security with business continuity and disaster recovery planning. Establish alternate work locations with appropriate security controls. Implement procedures for emergency facility evacuation and equipment protection.`,
        implementationSteps: [
          'Design and implement layered physical security perimeters',
          'Deploy multi-factor physical access control systems',
          'Install environmental monitoring and protection systems',
          'Establish graduated security zones with appropriate controls',
          'Implement equipment protection and maintenance procedures',
          'Deploy cable protection and network infrastructure security',
          'Establish secure disposal procedures for media and equipment',
          'Create physical security monitoring and incident response capabilities'
        ],
        practicalTools: [
          'Access control systems: HID Global, ASSA ABLOY, Lenel, or Genetec',
          'Surveillance systems: Axis, Bosch, Hikvision, or Milestone',
          'Environmental monitoring: APC, Liebert, CyberPower, or Sensaphone',
          'Intrusion detection: Honeywell, DSC, Bosch, or UTC Fire & Security',
          'Visitor management: Proxyclick, Envoy, SwipedOn, or Greetly'
        ],
        auditEvidence: [
          'Physical security perimeter design and implementation documentation',
          'Access control system configuration and access logs',
          'Environmental monitoring system reports and alert records',
          'Security zone classifications and control implementations',
          'Equipment inventory with protection and maintenance records',
          'Cable protection and network security implementation evidence',
          'Secure disposal procedures and destruction certificates',
          'Physical security incident reports and response documentation'
        ],
        crossReferences: [
          'Inventory and Control of Hardware Assets (protects physical asset inventory)',
          'Business Continuity & Disaster Recovery Management (ensures facility continuity)',
          'Incident Response Management (responds to physical security incidents)'
        ]
      },

      // 10. Network Infrastructure Management ✅
      'Network Infrastructure Management': {
        category: 'Network Infrastructure Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.13.1', title: 'Network controls', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.13.2', title: 'Network services security', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.13.3', title: 'Segregation in networks', relevance: 'primary' },
          { framework: 'cisControls', code: '12.1', title: 'Maintain an Inventory of Network Boundaries', relevance: 'primary' },
          { framework: 'cisControls', code: '12.2', title: 'Establish and Maintain a Secure Network Architecture', relevance: 'primary' },
          { framework: 'cisControls', code: '12.3', title: 'Securely Manage Network Infrastructure', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.a', title: 'Risk analysis and information system security', relevance: 'primary' }
        ],
        foundationContent: `**a) Network architecture design**\\nDesign secure network architecture with clear security zones, network segmentation, and traffic flow controls. Implement defense-in-depth principles with multiple security layers. Document network topology with security boundaries and trust relationships clearly defined.\\n\\n**b) Network segmentation and micro-segmentation**\\nImplement network segmentation to isolate critical systems and limit lateral movement. Use VLANs, firewalls, and software-defined networking for segmentation. Deploy micro-segmentation for granular control of east-west traffic within network segments.\\n\\n**c) Firewall and perimeter security**\\nDeploy next-generation firewalls (NGFW) with intrusion prevention, application control, and threat intelligence. Implement distributed firewall architecture with consistent rule management. Regularly review and optimize firewall rules to maintain least privilege access.\\n\\n**d) Network access control (NAC)**\\nImplement 802.1X network access control to authenticate and authorize device connections. Deploy dynamic VLAN assignment based on device identity and compliance status. Monitor network access attempts and maintain device inventory integration.\\n\\n**e) Wireless network security**\\nSecure wireless networks using WPA3 encryption and enterprise authentication. Implement guest network isolation and monitoring. Deploy wireless intrusion detection systems (WIDS) to identify rogue access points and attacks.\\n\\n**f) Remote access security**\\nImplement secure remote access using VPN solutions with multi-factor authentication. Deploy zero-trust network access (ZTNA) for application-specific access. Monitor remote access sessions and implement session timeouts.\\n\\n**g) Network monitoring and threat detection**\\nDeploy network monitoring tools with traffic analysis, anomaly detection, and threat hunting capabilities. Implement security information and event management (SIEM) with network log correlation. Monitor for indicators of compromise and lateral movement.\\n\\n**h) Network device hardening**\\nHarden network devices using security baselines and configuration standards. Change default credentials, disable unnecessary services, and implement secure management protocols. Maintain firmware updates and security patches.\\n\\n**i) Traffic encryption and integrity**\\nEncrypt sensitive network traffic using TLS, IPSec, or application-layer encryption. Implement network traffic integrity checking and monitoring. Deploy certificate management for encrypted communications.\\n\\n**j) Network incident response**\\nEstablish network incident response procedures with traffic isolation and analysis capabilities. Implement network forensics tools and packet capture capabilities. Coordinate network security events with overall incident response processes.`,
        implementationSteps: [
          'Design secure network architecture with clear segmentation boundaries',
          'Deploy next-generation firewalls with centralized management',
          'Implement network access control (NAC) with device authentication',
          'Secure wireless networks with enterprise-grade encryption',
          'Deploy network monitoring and threat detection capabilities',
          'Harden network devices with security baselines and patches',
          'Implement secure remote access with zero-trust principles',
          'Establish network incident response and forensics capabilities'
        ],
        practicalTools: [
          'Firewalls: Palo Alto Networks, Fortinet, Cisco ASA, or pfSense',
          'Network access control: Cisco ISE, Aruba ClearPass, or ForeScout',
          'Network monitoring: SolarWinds, PRTG, Nagios, or Datadog',
          'SIEM platforms: Splunk, IBM QRadar, ArcSight, or Elastic Security',
          'Wireless security: Aruba, Cisco Meraki, Ruckus, or Ubiquiti'
        ],
        auditEvidence: [
          'Network architecture documentation with security zone definitions',
          'Firewall configuration and rule review documentation',
          'Network access control implementation and device inventory',
          'Wireless network security configuration and monitoring logs',
          'Network monitoring system implementation and alert records',
          'Network device hardening compliance and patch management',
          'Remote access security configuration and usage logs',
          'Network incident response procedures and activation records'
        ],
        crossReferences: [
          'Secure Configuration of Hardware and Software (hardens network devices)',
          'Network Monitoring & Defense (monitors network security)',
          'Identity & Access Management (controls network access)'
        ]
      },

      // 11. Secure Software Development ✅
      'Secure Software Development': {
        category: 'Secure Software Development',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.14.1', title: 'Security requirements of information systems', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.14.2', title: 'Security in development and support processes', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.14.3', title: 'Test data protection', relevance: 'primary' },
          { framework: 'cisControls', code: '16.1', title: 'Establish and Maintain a Secure Application Development Process', relevance: 'primary' },
          { framework: 'cisControls', code: '16.2', title: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities', relevance: 'primary' },
          { framework: 'cisControls', code: '16.3', title: 'Perform Root Cause Analysis on Security Vulnerabilities', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.e', title: 'Security in network and information systems acquisition, development and maintenance', relevance: 'primary' }
        ],
        foundationContent: `**a) Secure development lifecycle (SDLC)**\\nImplement security throughout the software development lifecycle including requirements, design, implementation, testing, and deployment phases. Integrate security activities into existing development processes. Train development teams on secure coding practices and threat modeling.\\n\\n**b) Security requirements and threat modeling**\\nDefine security requirements based on risk assessment and regulatory compliance needs. Conduct threat modeling during design phase to identify security risks and controls. Document security requirements with acceptance criteria and validation procedures.\\n\\n**c) Secure coding practices**\\nEstablish secure coding standards addressing OWASP Top 10 vulnerabilities and common security flaws. Implement input validation, output encoding, authentication, and authorization controls. Use secure frameworks and libraries with regular security updates.\\n\\n**d) Static application security testing (SAST)**\\nIntegrate SAST tools into development IDE and CI/CD pipelines for automated code analysis. Configure tools to detect security vulnerabilities, coding standard violations, and logic flaws. Establish developer training on remediation of identified issues.\\n\\n**e) Dynamic application security testing (DAST)**\\nImplement DAST tools to test running applications for security vulnerabilities. Conduct automated security testing in staging environments before production deployment. Include API security testing and authentication bypass testing.\\n\\n**f) Dependency and third-party component management**\\nMaintain inventory of all third-party components and dependencies with version tracking. Monitor for known vulnerabilities in dependencies using tools like OWASP Dependency-Check. Establish processes for timely updates of vulnerable components.\\n\\n**g) Code review and quality gates**\\nImplement mandatory security code reviews with trained reviewers. Establish quality gates in CI/CD pipelines that prevent deployment of code with security vulnerabilities. Maintain code review checklists focusing on security controls.\\n\\n**h) Test data management**\\nImplement secure test data management with data masking and anonymization. Prohibit use of production data in development and testing environments. Establish data retention and disposal policies for test data.\\n\\n**i) DevSecOps integration**\\nIntegrate security tools and processes into DevOps pipelines with shift-left security approach. Automate security testing and compliance checking in CI/CD workflows. Implement infrastructure as code with security controls.\\n\\n**j) Security training and awareness**\\nProvide regular security training to development teams covering secure coding, threat awareness, and incident response. Establish security champions programs within development teams. Maintain security knowledge base and best practices documentation.`,
        implementationSteps: [
          'Integrate security requirements into software development lifecycle',
          'Deploy static application security testing (SAST) tools in CI/CD',
          'Implement dynamic application security testing (DAST) capabilities',
          'Establish secure coding standards and training programs',
          'Deploy dependency scanning and vulnerability management',
          'Implement mandatory security code reviews with quality gates',
          'Establish secure test data management procedures',
          'Create DevSecOps processes with automated security testing'
        ],
        practicalTools: [
          'SAST tools: Veracode, Checkmarx, SonarQube, or Fortify',
          'DAST tools: OWASP ZAP, Burp Suite, Veracode DAST, or Rapid7',
          'Dependency scanning: OWASP Dependency-Check, Snyk, or WhiteSource',
          'Code review: GitHub, GitLab, Crucible, or Azure DevOps',
          'DevSecOps platforms: GitLab Security, GitHub Advanced Security, or Aqua Security'
        ],
        auditEvidence: [
          'Secure development lifecycle documentation and implementation',
          'Security requirements and threat modeling documentation',
          'SAST tool integration and vulnerability remediation records',
          'DAST testing results and security validation evidence',
          'Dependency inventory and vulnerability management records',
          'Code review procedures and quality gate implementation',
          'Test data management policies and masking implementation',
          'Security training records for development teams'
        ],
        crossReferences: [
          'Vulnerability Management (manages application vulnerabilities)',
          'Security Awareness & Skills Training (trains developers)',
          'Supplier & Third-Party Risk Management (manages component risks)'
        ]
      },

      // 12. Network Monitoring & Defense ✅
      'Network Monitoring & Defense': {
        category: 'Network Monitoring & Defense',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.12.4', title: 'Event logging', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.6', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.13.1', title: 'Network controls', relevance: 'primary' },
          { framework: 'cisControls', code: '13.1', title: 'Centralize Security Event Alerting', relevance: 'primary' },
          { framework: 'cisControls', code: '13.2', title: 'Deploy a Host-Based Intrusion Detection System', relevance: 'primary' },
          { framework: 'cisControls', code: '13.3', title: 'Deploy a Network Intrusion Detection System', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.g', title: 'Systems for network security monitoring', relevance: 'primary' }
        ],
        foundationContent: `**a) Network traffic analysis**\\nImplement comprehensive network traffic monitoring with deep packet inspection and flow analysis. Deploy network sensors at critical network boundaries and internal segments. Analyze traffic patterns to identify anomalies, threats, and policy violations.\\n\\n**b) Intrusion detection and prevention systems (IDS/IPS)**\\nDeploy network-based and host-based intrusion detection systems with real-time alerting. Configure IPS systems to automatically block malicious traffic while minimizing false positives. Maintain signature databases with regular updates for new threats.\\n\\n**c) Security information and event management (SIEM)**\\nImplement centralized SIEM solution for log aggregation, correlation, and analysis. Collect logs from network devices, security tools, and critical systems. Develop correlation rules for threat detection and incident alerting.\\n\\n**d) Network behavior analysis (NBA)**\\nDeploy NBA tools to establish baseline network behavior and detect anomalies. Monitor for indicators of compromise, lateral movement, and data exfiltration. Implement machine learning algorithms for advanced threat detection.\\n\\n**e) Threat intelligence integration**\\nIntegrate threat intelligence feeds to enhance detection capabilities with known indicators of compromise. Participate in threat intelligence sharing programs for early warning of new threats. Correlate internal events with external threat intelligence.\\n\\n**f) DNS security monitoring**\\nMonitor DNS queries and responses for malicious domains, data exfiltration, and command and control communications. Deploy DNS filtering to block access to known malicious domains. Analyze DNS logs for security incidents and policy violations.\\n\\n**g) Network forensics capabilities**\\nImplement network packet capture and forensic analysis capabilities for incident investigation. Maintain network forensics tools and trained personnel. Establish evidence collection and preservation procedures.\\n\\n**h) Automated incident response**\\nImplement automated response capabilities for common threats including traffic blocking, system isolation, and alert escalation. Integrate network security tools with security orchestration platforms. Establish playbooks for automated threat response.\\n\\n**i) Performance and availability monitoring**\\nMonitor network performance metrics to identify security-related degradation or denial of service attacks. Implement availability monitoring with alerting for critical network services. Correlate performance issues with security events.\\n\\n**j) Compliance and reporting**\\nGenerate compliance reports for regulatory requirements and security frameworks. Provide regular security metrics and trend analysis to management. Maintain audit trails for network security monitoring activities.`,
        implementationSteps: [
          'Deploy network traffic analysis and monitoring tools',
          'Implement intrusion detection and prevention systems',
          'Deploy centralized SIEM for log correlation and analysis',
          'Implement network behavior analysis for anomaly detection',
          'Integrate threat intelligence feeds for enhanced detection',
          'Deploy DNS security monitoring and filtering',
          'Establish network forensics and investigation capabilities',
          'Implement automated incident response and orchestration'
        ],
        practicalTools: [
          'Network monitoring: SolarWinds, PRTG, Nagios, or Datadog',
          'IDS/IPS: Snort, Suricata, Cisco Firepower, or Palo Alto Threat Prevention',
          'SIEM: Splunk, IBM QRadar, ArcSight, or Elastic Security',
          'Network behavior analysis: Darktrace, ExtraHop, or Vectra',
          'Threat intelligence: FireEye, IBM X-Force, or ThreatConnect'
        ],
        auditEvidence: [
          'Network monitoring system deployment and configuration',
          'IDS/IPS implementation with detection rule management',
          'SIEM deployment with log sources and correlation rules',
          'Network behavior analysis baseline and anomaly detection',
          'Threat intelligence integration and correlation evidence',
          'DNS security monitoring and filtering configuration',
          'Network forensics capabilities and investigation procedures',
          'Automated incident response playbooks and activation records'
        ],
        crossReferences: [
          'Network Infrastructure Management (monitors network infrastructure)',
          'Incident Response Management (responds to network security incidents)',
          'Audit Log Management (collects and analyzes network logs)'
        ]
      },

      // 13. Supplier & Third-Party Risk Management ✅
      'Supplier & Third-Party Risk Management': {
        category: 'Supplier & Third-Party Risk Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.5.19', title: 'Information security in supplier relationships', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.20', title: 'Addressing information security within supplier agreements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.21', title: 'Managing information security in the ICT supply chain', relevance: 'primary' },
          { framework: 'cisControls', code: '15.1', title: 'Establish and Maintain an Inventory of Service Providers', relevance: 'primary' },
          { framework: 'cisControls', code: '15.2', title: 'Establish and Maintain a Service Provider Management Process', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 28', title: 'Processor obligations', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 44', title: 'General principle for transfers', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.h', title: 'Supply chain security', relevance: 'primary' }
        ],
        foundationContent: `**a) Supplier risk assessment and classification**\\nEstablish comprehensive supplier risk assessment methodology considering data access, service criticality, and security maturity. Classify suppliers based on risk levels (high, medium, low) and apply appropriate controls. Conduct due diligence on suppliers including financial stability, security capabilities, and compliance status.\\n\\n**b) Vendor security requirements and contracts**\\nDefine mandatory security requirements for suppliers including technical, administrative, and physical controls. Include security clauses in all supplier contracts with clear obligations and liability terms. Require compliance with applicable regulations (GDPR, HIPAA, SOX) and industry standards.\\n\\n**c) Supplier security assessments and audits**\\nConduct regular security assessments of suppliers through questionnaires, audits, and third-party certifications. Verify implementation of required security controls and validate compliance claims. Maintain assessment results and track remediation of identified deficiencies.\\n\\n**d) Supply chain security monitoring**\\nImplement continuous monitoring of supplier security posture through automated tools and threat intelligence. Monitor supplier security incidents, breaches, and reputation changes. Establish supplier security scorecards and performance metrics.\\n\\n**e) Data processing and sharing controls**\\nEstablish clear data sharing agreements specifying data types, processing purposes, and security requirements. Implement data minimization principles limiting supplier access to necessary data only. Monitor data flows and ensure compliance with data protection regulations.\\n\\n**f) Incident response coordination**\\nEstablish incident response procedures covering supplier-related security events. Require suppliers to notify of security incidents within specified timeframes. Coordinate incident response activities and implement joint containment measures when necessary.\\n\\n**g) Fourth-party risk management**\\nExtend risk management to suppliers' subcontractors and service providers. Require transparency of subcontracting arrangements and approval of critical fourth parties. Implement flow-down security requirements through the entire supply chain.\\n\\n**h) Termination and transition planning**\\nDevelop supplier termination procedures ensuring secure data return or destruction. Plan for service transitions with continuity measures and security controls. Maintain escrow arrangements for critical software or services.\\n\\n**i) Geographic and jurisdictional considerations**\\nAssess risks associated with supplier locations and data processing jurisdictions. Ensure compliance with data localization and cross-border transfer requirements. Consider geopolitical risks and implement appropriate controls.\\n\\n**j) Supplier performance management**\\nEstablish supplier performance metrics including security KPIs and SLA compliance. Conduct regular supplier business reviews with security performance discussions. Implement supplier improvement programs and capability development initiatives.`,
        implementationSteps: [
          'Develop supplier risk assessment methodology and classification system',
          'Create standardized security requirements and contract templates',
          'Implement supplier security assessment and audit programs',
          'Deploy supply chain security monitoring and threat intelligence',
          'Establish data processing agreements with clear security controls',
          'Create incident response procedures for supplier-related events',
          'Implement fourth-party risk management and transparency requirements',
          'Develop supplier termination and transition security procedures'
        ],
        practicalTools: [
          'Vendor risk management: Prevalent, BitSight, SecurityScorecard, or ProcessUnity',
          'Contract management: Agiloft, ContractWorks, Icertis, or ServiceNow',
          'Security assessments: OneTrust, MetricStream, or Shared Assessments',
          'Supply chain monitoring: RiskRecon, CyberGRX, or UpGuard',
          'Data processing agreements: OneTrust, TrustArc, or Privacera'
        ],
        auditEvidence: [
          'Supplier inventory with risk classifications and assessment results',
          'Security requirements documentation and contract provisions',
          'Supplier security assessment reports and remediation tracking',
          'Supply chain monitoring reports and security scorecards',
          'Data processing agreements and compliance validation',
          'Supplier incident response coordination and notification records',
          'Fourth-party transparency documentation and approval records',
          'Supplier termination procedures and secure data return evidence'
        ],
        crossReferences: [
          'Risk Management (assesses third-party risks)',
          'Data Protection (controls data processing by suppliers)',
          'Incident Response Management (coordinates supplier incidents)'
        ]
      },

      // 14. Security Awareness & Skills Training ✅
      'Security Awareness & Skills Training': {
        category: 'Security Awareness & Skills Training',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.6.3', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.7.2.2', title: 'Information security awareness, education and training', relevance: 'primary' },
          { framework: 'cisControls', code: '14.1', title: 'Establish and Maintain a Security Awareness Program', relevance: 'primary' },
          { framework: 'cisControls', code: '14.2', title: 'Train Workforce Members to Recognize Social Engineering Attacks', relevance: 'primary' },
          { framework: 'cisControls', code: '14.3', title: 'Train Workforce Members on Authentication Best Practices', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'gdpr', code: 'Article 39', title: 'Tasks of the data protection officer', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 20.2.d', title: 'Training in cybersecurity hygiene', relevance: 'primary' }
        ],
        foundationContent: `**a) Security awareness program - Teaching everyone to be security-minded**
Imagine if your office building had great locks and security cameras, but employees kept leaving doors propped open or letting strangers follow them inside. Technology alone can't protect you if people don't understand their role in security. A security awareness program teaches everyone in your organization how to be part of the security solution, not part of the problem.

What this means in practice: Your company creates training materials that explain security concepts in everyday language, provides examples relevant to different job roles, and makes learning engaging rather than boring. Instead of just telling people "don't click suspicious links," you explain how to recognize them and what happens when they're clicked.

Why this matters: Employees are often the first line of defense against cyber attacks, but they can also be the weakest link. Most successful cyber attacks start with tricking a person, not breaking technology. When people understand the "why" behind security rules, they're much more likely to follow them and spot potential threats.

**b) Basic security training for everyone - Security fundamentals everyone should know**
Just like every employee learns basic safety procedures (like where fire exits are), every employee should learn basic cybersecurity practices. This covers the essential security knowledge that applies to everyone, regardless of their job role.

What this means in practice: Everyone learns how to create strong passwords, recognize phishing emails, safely use public Wi-Fi, protect company devices, and report suspicious activity. Training explains not just the "what" but the "why" - why password reuse is dangerous, what happens when someone clicks a malicious link, and how data breaches affect the company and customers.

Why this matters: Security incidents often happen because someone didn't know better, not because they were careless. When you explain that using "password123" is like leaving your house key under the doormat with a sign saying "key here," people understand why strong passwords matter. Basic training prevents most common security mistakes.

**c) Phishing simulation - Practice spotting fake emails safely**
Just like fire drills prepare people for real emergencies, phishing simulations help people practice identifying fake emails in a safe environment. Instead of waiting for a real attack to test whether people can spot suspicious emails, you send them harmless fake phishing emails to see how they respond.

What this means in practice: Your IT team sends realistic-looking fake phishing emails to employees. Those who click get immediate feedback explaining what made the email suspicious, not punishment. Those who correctly report the email get positive recognition. This helps people learn through practice rather than just theory.

Why this matters: Phishing (fake emails designed to trick people) is the #1 way cybercriminals get into organizations. Reading about phishing is like reading about swimming - actually practicing with safe examples is much more effective. People who fail simulations get extra help, making the whole organization more resilient.

**d) Role-specific training - Security guidance tailored to your job**
Different jobs face different security risks. A software developer needs to know about secure coding practices, while an HR manager needs to understand how to protect employee personal information. Role-specific training provides security guidance that's directly relevant to what people do every day.

What this means in practice: Developers learn why certain coding practices prevent hackers from exploiting software vulnerabilities. Finance staff learn about business email compromise scams that target their approval processes. Executives learn about targeted attacks against leadership and how to verify unusual requests.

Why this matters: Generic security training often feels irrelevant to people's daily work. When training addresses the specific risks and scenarios people actually encounter in their roles, they're more likely to pay attention and apply what they learn. Role-specific training makes security practical and actionable.

**e) Incident response training - What to do when something goes wrong**
Even with good security, incidents can still happen. Just like buildings have evacuation procedures and first aid training, organizations need to train people on what to do if they suspect a security incident. This isn't about becoming security experts, but about knowing how to respond appropriately.

What this means in practice: Employees learn how to recognize potential security incidents (like unusual computer behavior or suspicious emails), who to contact, what information to provide, and what NOT to do (like trying to "fix" things themselves). Training includes practice scenarios and tabletop exercises.

Why this matters: The faster security incidents are detected and reported, the less damage they cause. When people know what to look for and feel comfortable reporting concerns without fear of blame, problems get solved faster. Good incident response training turns every employee into a security sensor for the organization.

**f) Data protection training - Handling sensitive information responsibly**
Your organization likely handles sensitive information - customer data, employee records, financial information, trade secrets, or regulated data. Data protection training teaches people how to handle this information responsibly and comply with privacy laws.

What this means in practice: People learn what types of information are considered sensitive, how to classify and label data appropriately, secure ways to share information, how long to keep different types of data, and what to do if there's a potential data breach. Training covers both legal requirements and practical protective measures.

Why this matters: Data breaches can result in huge fines, lawsuits, lost customers, and damaged reputation. Most data breaches involve human error - someone sending sensitive data to the wrong person, losing a device with unencrypted data, or mishandling information. Training helps people understand their responsibility in protecting data.

**g) Making training engaging - Learning that people actually want to do**
Security training often has a reputation for being boring, technical, and irrelevant. Effective security training is designed to be engaging, practical, and memorable. This might include interactive content, real-world scenarios, gamification elements, or storytelling approaches.

What this means in practice: Instead of reading dry policy documents, people might complete interactive scenarios, watch short videos with real examples, participate in security games or challenges, or learn through case studies of actual incidents (anonymized). Training is available in multiple formats and languages as needed.

Why this matters: People learn better when they're engaged and interested. Boring training leads to box-checking compliance rather than actual behavior change. When security training is engaging and relevant, people are more likely to remember and apply what they learn in real situations.

**h) Testing knowledge - Making sure training actually works**
Just like schools give tests to ensure students understand the material, security training should include assessments to verify that people actually learned and retained the important concepts. This isn't about punishment, but about ensuring training is effective.

What this means in practice: After completing training modules, people take short quizzes or complete practical exercises to demonstrate understanding. Those who struggle with assessments receive additional support and training. Assessments focus on practical application rather than memorizing technical details.

Why this matters: Completing training doesn't guarantee learning occurred. Assessments help identify gaps in understanding and ensure that critical security concepts are actually retained. They also help improve training materials by showing which topics people struggle with most.

**i) Measuring success - Tracking whether security behavior improves**
The goal of security awareness training isn't just to check a compliance box, but to actually change behavior and reduce security risks. This requires measuring whether people are applying what they learned and whether the organization is becoming more secure.

What this means in practice: Organizations track metrics like phishing simulation click rates, security incident reporting rates, compliance with security policies, and employee feedback on training quality. They correlate training data with actual security outcomes to see what's working.

Why this matters: Without measurement, you don't know if your training investment is paying off. Tracking behavior changes helps identify what training approaches work best and where additional focus is needed. It also helps demonstrate the value of security awareness programs to management.

**j) Keeping training current - Staying ahead of evolving threats**
Cybersecurity threats constantly evolve, regulations change, and organizations adopt new technologies. Security awareness training needs to stay current with these changes to remain effective. This means regularly updating content, incorporating lessons learned from incidents, and adapting to new threats.

What this means in practice: Training content gets updated quarterly based on new threat trends, regulatory changes, and internal incident lessons learned. New employee onboarding includes the latest security awareness content. Existing employees receive updates on emerging threats and new company security policies.

Why this matters: Outdated security training can actually be counterproductive, giving people false confidence about threats that no longer exist while leaving them unprepared for current risks. Keeping training current ensures people are prepared for the security challenges they actually face today.`,
        implementationSteps: [
          'Develop comprehensive security awareness program with role-based content',
          'Implement baseline security training for all personnel',
          'Deploy simulated phishing campaigns with immediate feedback',
          'Create specialized training for different job functions and roles',
          'Establish incident response training and tabletop exercises',
          'Provide data protection and privacy training aligned with regulations',
          'Deploy multiple training delivery methods with engagement techniques',
          'Implement assessments and competency validation processes'
        ],
        practicalTools: [
          'Training platforms: KnowBe4, Proofpoint, SANS Securing the Human, or Wombat',
          'Phishing simulation: KnowBe4, Cofense, Proofpoint, or Gophish',
          'Learning management: Cornerstone OnDemand, Docebo, or Absorb LMS',
          'Content creation: Articulate 360, Adobe Captivate, or Camtasia',
          'Assessment tools: Questionmark, ProctorU, or built-in LMS assessment'
        ],
        auditEvidence: [
          'Security awareness program documentation and curriculum',
          'Training completion records and attendance tracking',
          'Phishing simulation results and improvement metrics',
          'Role-specific training materials and completion records',
          'Incident response training documentation and exercise records',
          'Data protection training materials and assessment results',
          'Training effectiveness metrics and behavioral change analysis',
          'Training content updates and continuous improvement documentation'
        ],
        crossReferences: [
          'Governance & Leadership (establishes training governance and oversight)',
          'Incident Response Management (trains personnel on incident procedures)',
          'Data Protection (provides privacy and data protection training)'
        ]
      },

      // 15. Business Continuity & Disaster Recovery Management ✅
      'Business Continuity & Disaster Recovery Management': {
        category: 'Business Continuity & Disaster Recovery Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.17.1', title: 'Information security continuity', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.17.2', title: 'Redundancies', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.3', title: 'Information backup', relevance: 'primary' },
          { framework: 'cisControls', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', relevance: 'primary' },
          { framework: 'cisControls', code: '11.2', title: 'Perform Automated Backups', relevance: 'primary' },
          { framework: 'cisControls', code: '11.3', title: 'Protect Recovery Data', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.i', title: 'Business continuity, crisis management and emergency procedures', relevance: 'primary' }
        ],
        foundationContent: `**a) Business impact analysis (BIA)**\\nConduct comprehensive business impact analysis to identify critical business processes, systems, and data. Define recovery time objectives (RTO) and recovery point objectives (RPO) for each critical component. Assess financial, operational, and reputational impacts of disruptions with quantified metrics.\\n\\n**b) Risk assessment and threat modeling**\\nIdentify potential threats and vulnerabilities that could disrupt business operations including natural disasters, cyber attacks, system failures, and pandemic scenarios. Assess likelihood and impact of each threat. Develop risk treatment strategies for high-impact scenarios.\\n\\n**c) Business continuity strategy and planning**\\nDevelop comprehensive business continuity plan covering people, processes, technology, and facilities. Define alternate work arrangements, backup locations, and emergency communication procedures. Establish clear roles, responsibilities, and decision-making authority during incidents.\\n\\n**d) Data backup and recovery systems**\\nImplement robust data backup systems with automated scheduling and monitoring. Use 3-2-1 backup strategy (3 copies, 2 different media, 1 offsite). Deploy backup encryption, integrity verification, and regular restore testing. Maintain backup retention policies aligned with business and regulatory requirements.\\n\\n**e) IT disaster recovery planning**\\nDevelop detailed IT disaster recovery plans covering infrastructure, applications, and data restoration. Implement redundant systems, failover capabilities, and cloud-based recovery solutions. Define step-by-step recovery procedures with clear priorities and dependencies.\\n\\n**f) Emergency communication and notification**\\nEstablish emergency communication systems with multiple channels (phone, email, SMS, web portals). Maintain current contact information for all personnel and stakeholders. Implement automated notification systems for rapid response activation.\\n\\n**g) Alternate site and facility planning**\\nIdentify and prepare alternate work locations including hot sites, warm sites, or cloud-based infrastructure. Ensure alternate sites have necessary technology, communications, and security controls. Plan for workforce relocation and remote work capabilities.\\n\\n**h) Training and awareness programs**\\nProvide business continuity training to all personnel with role-specific responsibilities. Conduct regular awareness campaigns on emergency procedures and contact information. Train incident response teams on plan execution and decision-making.\\n\\n**i) Testing and exercising**\\nConduct regular business continuity exercises including tabletop exercises, functional tests, and full-scale simulations. Test backup and recovery systems with documented restore procedures. Validate alternate site capabilities and communication systems.\\n\\n**j) Plan maintenance and continuous improvement**\\nRegularly review and update business continuity plans based on organizational changes, new threats, and exercise findings. Maintain current contact information, system configurations, and recovery procedures. Implement lessons learned from incidents and exercises.`,
        implementationSteps: [
          'Conduct business impact analysis to identify critical processes and systems',
          'Develop comprehensive business continuity and disaster recovery plans',
          'Implement robust data backup systems with automated scheduling',
          'Establish IT disaster recovery capabilities with redundant systems',
          'Create emergency communication and notification systems',
          'Identify and prepare alternate work locations and facilities',
          'Provide business continuity training and awareness programs',
          'Conduct regular testing and exercises to validate plan effectiveness'
        ],
        practicalTools: [
          'BCP software: MetricStream, ServiceNow BCM, Fusion Risk Management, or LogicGate',
          'Backup solutions: Veeam, Commvault, Veritas NetBackup, or AWS Backup',
          'Cloud DR: Microsoft Azure Site Recovery, AWS Disaster Recovery, or VMware vCloud',
          'Communication: Everbridge, AlertMedia, Rave Mobile Safety, or BlackBerry AtHoc',
          'Testing platforms: Preparis, Avalution, or ResilienceONE'
        ],
        auditEvidence: [
          'Business impact analysis with RTO/RPO definitions and approval',
          'Comprehensive business continuity and disaster recovery plans',
          'Data backup system implementation with automated scheduling',
          'IT disaster recovery capabilities and redundancy documentation',
          'Emergency communication systems and contact database maintenance',
          'Alternate site preparations and capability validations',
          'Business continuity training records and awareness materials',
          'Testing and exercise documentation with improvement actions'
        ],
        crossReferences: [
          'Risk Management (assesses continuity risks)',
          'Physical & Environmental Security Controls (protects facilities)',
          'Incident Response Management (coordinates emergency response)'
        ]
      },

      // 16. Incident Response Management ✅
      'Incident Response Management': {
        category: 'Incident Response Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.16.1', title: 'Management of information security incidents and improvements', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.24', title: 'Information security incident management planning and preparation', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.5.25', title: 'Assessment and decision on information security events', relevance: 'primary' },
          { framework: 'cisControls', code: '17.1', title: 'Designate Personnel to Manage Incident Handling', relevance: 'primary' },
          { framework: 'cisControls', code: '17.2', title: 'Establish and Maintain Contact Information for Reporting Security Incidents', relevance: 'primary' },
          { framework: 'cisControls', code: '17.3', title: 'Establish and Maintain an Enterprise Process for Reporting Incidents', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 33', title: 'Notification of a personal data breach to the supervisory authority', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 34', title: 'Communication of a personal data breach to the data subject', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 23', title: 'Reporting obligations', relevance: 'primary' }
        ],
        foundationContent: `**a) Incident response program establishment**\\nEstablish formal incident response program with dedicated team, clear roles, and defined authority. Develop incident response policy approved by management with regular reviews. Define incident types, severity levels, and escalation procedures. Ensure program alignment with business objectives and regulatory requirements.\\n\\n**b) Incident response team structure**\\nDesign incident response team with representatives from IT, security, legal, communications, and business units. Define team roles including incident commander, technical leads, communications coordinator, and legal advisor. Establish 24/7 availability and escalation procedures.\\n\\n**c) Incident detection and reporting**\\nImplement multiple detection mechanisms including automated monitoring, user reporting, and threat intelligence. Establish clear reporting procedures with accessible contact information. Define incident classification criteria and initial assessment procedures.\\n\\n**d) Incident analysis and containment**\\nDevelop systematic incident analysis procedures including evidence collection, impact assessment, and root cause analysis. Implement containment strategies to limit incident spread and minimize damage. Maintain forensic capabilities for detailed investigation.\\n\\n**e) Communication and notification**\\nEstablish internal and external communication procedures including management notification, regulatory reporting, and customer communication. Define notification timelines compliant with regulations (GDPR 72-hour rule). Maintain pre-approved communication templates.\\n\\n**f) Evidence collection and preservation**\\nImplement forensic evidence collection procedures with proper chain of custody. Maintain evidence integrity through documented handling procedures. Coordinate with legal counsel and law enforcement as needed.\\n\\n**g) Recovery and restoration**\\nDevelop system restoration procedures with security validation before returning to service. Implement recovery priorities based on business impact. Coordinate with business continuity and disaster recovery processes.\\n\\n**h) Post-incident activities**\\nConduct thorough post-incident reviews to identify lessons learned and improvement opportunities. Update incident response procedures based on findings. Provide feedback to preventive controls and security awareness programs.\\n\\n**i) Legal and regulatory compliance**\\nEnsure incident response procedures comply with applicable regulations including breach notification requirements. Coordinate with legal counsel for potential litigation or regulatory action. Maintain incident documentation for audit and compliance purposes.\\n\\n**j) Training and exercises**\\nProvide regular incident response training to team members and general personnel. Conduct tabletop exercises and simulations to test response procedures. Update training based on new threats and procedure changes.`,
        implementationSteps: [
          'Establish formal incident response program with dedicated team',
          'Develop incident detection and reporting mechanisms',
          'Create incident analysis and containment procedures',
          'Implement communication and notification processes',
          'Establish evidence collection and forensic capabilities',
          'Develop recovery and restoration procedures',
          'Create post-incident review and improvement processes',
          'Provide incident response training and conduct regular exercises'
        ],
        practicalTools: [
          'Incident response platforms: Phantom, Demisto, IBM Resilient, or ServiceNow SecOps',
          'SIEM/SOAR: Splunk, IBM QRadar, Microsoft Sentinel, or Chronicle',
          'Communication: Slack, Microsoft Teams, PagerDuty, or Everbridge',
          'Forensics: EnCase, FTK, X-Ways, or SANS SIFT',
          'Documentation: Jira Service Management, ServiceNow, or Confluence'
        ],
        auditEvidence: [
          'Incident response policy and program documentation',
          'Incident response team structure and role definitions',
          'Incident detection and reporting procedure documentation',
          'Incident logs with analysis and containment records',
          'Communication and notification records with regulatory compliance',
          'Evidence collection and forensic investigation documentation',
          'Recovery and restoration procedures with validation records',
          'Post-incident review reports and improvement implementations'
        ],
        crossReferences: [
          'Governance & Leadership (provides incident response oversight)',
          'Business Continuity & Disaster Recovery Management (coordinates recovery)',
          'Audit Log Management (provides incident investigation data)'
        ]
      },

      // 17. Malware Defenses ✅
      'Malware Defenses': {
        category: 'Malware Defenses',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.12.2', title: 'Protection from malware', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.13.1', title: 'Network controls', relevance: 'supporting' },
          { framework: 'cisControls', code: '10.1', title: 'Deploy and Maintain Anti-Malware Software', relevance: 'primary' },
          { framework: 'cisControls', code: '10.2', title: 'Configure Automatic Anti-Malware Signature Updates', relevance: 'primary' },
          { framework: 'cisControls', code: '10.3', title: 'Disable Autorun and Autoplay for Removable Media', relevance: 'primary' },
          { framework: 'cisControls', code: '10.4', title: 'Configure Automatic Anti-Malware Scanning', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Handling of cybersecurity incidents', relevance: 'supporting' }
        ],
        foundationContent: `**a) Multi-layered anti-malware strategy**\\nImplement comprehensive anti-malware strategy with multiple detection technologies including signature-based, heuristic, behavioral, and machine learning approaches. Deploy protection at endpoints, email gateways, web gateways, and network boundaries. Ensure coverage across all operating systems and device types.\\n\\n**b) Endpoint protection deployment**\\nDeploy enterprise endpoint protection with centralized management and real-time monitoring. Ensure automatic signature updates and scheduled scanning. Implement application control and device control features. Monitor endpoint protection status and compliance across all devices.\\n\\n**c) Email security and filtering**\\nImplement advanced email security solutions with anti-malware scanning, sandboxing, and threat intelligence. Filter malicious attachments and URLs with real-time analysis. Deploy email encryption and data loss prevention capabilities.\\n\\n**d) Web content filtering and security**\\nDeploy web security gateways with URL filtering, malware scanning, and sandboxing capabilities. Block access to known malicious websites and categories. Implement safe browsing policies with user education.\\n\\n**e) Network-based malware detection**\\nImplement network-based malware detection with intrusion prevention systems and network behavior analysis. Monitor for command and control communications and data exfiltration. Deploy DNS security solutions to block malicious domains.\\n\\n**f) Sandboxing and dynamic analysis**\\nDeploy advanced sandboxing solutions for suspicious file analysis before execution. Implement automated malware analysis workflows. Maintain threat intelligence integration for improved detection.\\n\\n**g) Removable media controls**\\nImplement strict controls for removable media including USB devices, CDs, and external drives. Disable autorun/autoplay features and require administrative approval. Deploy endpoint controls to monitor and restrict removable media usage.\\n\\n**h) Incident response integration**\\nIntegrate malware defenses with incident response procedures for rapid containment and remediation. Implement automated quarantine and isolation capabilities. Maintain forensic capabilities for malware analysis.\\n\\n**i) Threat intelligence and updates**\\nImplement threat intelligence feeds for enhanced malware detection and prevention. Ensure automatic signature and rule updates across all security tools. Participate in threat intelligence sharing programs.\\n\\n**j) User awareness and training**\\nProvide regular training on malware threats including phishing, social engineering, and safe computing practices. Implement simulated malware attacks for awareness testing. Maintain incident reporting procedures for suspected malware infections.`,
        implementationSteps: [
          'Deploy comprehensive endpoint protection with centralized management',
          'Implement advanced email security with anti-malware scanning',
          'Deploy web security gateways with content filtering and sandboxing',
          'Implement network-based malware detection and prevention',
          'Deploy advanced sandboxing for suspicious file analysis',
          'Implement strict removable media controls and monitoring',
          'Integrate malware defenses with incident response procedures',
          'Provide malware awareness training and maintain threat intelligence'
        ],
        practicalTools: [
          'Endpoint protection: CrowdStrike, Microsoft Defender, SentinelOne, or Symantec',
          'Email security: Proofpoint, Microsoft Exchange Online Protection, or Mimecast',
          'Web security: Zscaler, Blue Coat, Forcepoint, or Cisco Umbrella',
          'Sandboxing: FireEye, Joe Sandbox, Cuckoo Sandbox, or VMware Carbon Black',
          'Network security: Palo Alto Networks, Fortinet, or Check Point'
        ],
        auditEvidence: [
          'Anti-malware deployment documentation and coverage reports',
          'Endpoint protection configuration and compliance monitoring',
          'Email security implementation with scanning and filtering logs',
          'Web security gateway deployment and policy enforcement',
          'Network-based malware detection system implementation',
          'Sandboxing solution deployment and analysis results',
          'Removable media control policies and monitoring logs',
          'Malware incident response records and remediation documentation'
        ],
        crossReferences: [
          'Email & Web Browser Protections (secures email and web attack vectors)',
          'Network Infrastructure Management (provides network-based defenses)',
          'Incident Response Management (responds to malware incidents)'
        ]
      },

      // 18. Email & Web Browser Protections ✅
      'Email & Web Browser Protections': {
        category: 'Email & Web Browser Protections',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.13.2.1', title: 'Information transfer policies and procedures', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.2', title: 'Protection from malware', relevance: 'supporting' },
          { framework: 'cisControls', code: '9.1', title: 'Ensure Use of Only Fully Supported Browsers and Email Clients', relevance: 'primary' },
          { framework: 'cisControls', code: '9.2', title: 'Use DNS Filtering Services', relevance: 'primary' },
          { framework: 'cisControls', code: '9.3', title: 'Maintain and Enforce Network-Based URL Filters', relevance: 'primary' },
          { framework: 'cisControls', code: '9.4', title: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.b', title: 'Identity and access management', relevance: 'supporting' }
        ],
        foundationContent: `**a) Email security architecture**\\nImplement comprehensive email security with multiple protection layers including gateway security, advanced threat protection, and endpoint email security. Deploy anti-phishing, anti-malware, and anti-spam solutions. Implement email encryption for sensitive communications.\\n\\n**b) Web browser security configuration**\\nStandardize on supported web browsers with security-focused configuration. Disable unnecessary plugins and extensions. Implement automatic updates and security patches. Deploy browser isolation or sandbox technologies for high-risk browsing.\\n\\n**c) URL and content filtering**\\nDeploy web content filtering with real-time URL categorization and malicious site blocking. Implement DNS filtering to block known malicious domains. Create and maintain acceptable use policies with enforcement mechanisms.\\n\\n**d) Phishing and social engineering protection**\\nDeploy advanced anti-phishing solutions with machine learning and behavioral analysis. Implement email authentication protocols (SPF, DKIM, DMARC) to prevent email spoofing. Provide regular phishing awareness training with simulated attacks.\\n\\n**e) Safe attachment and link handling**\\nImplement safe attachment scanning with sandboxing for unknown files. Deploy safe links technology that rewrites URLs for real-time analysis. Prevent execution of dangerous file types and macros.\\n\\n**f) Email encryption and data protection**\\nImplement email encryption for sensitive data transmission with automatic classification. Deploy data loss prevention (DLP) for email communications. Maintain encryption key management and secure email gateways.\\n\\n**g) Web application security**\\nImplement web application firewalls (WAF) and security headers. Deploy content security policies (CSP) to prevent cross-site scripting. Implement secure coding practices for web applications.\\n\\n**h) Browser extension and plugin management**\\nMaintain inventory of approved browser extensions and plugins. Implement centralized management for extension deployment and updates. Regularly assess extensions for security risks and remove unnecessary ones.\\n\\n**i) Mobile email and web security**\\nExtend email and web protections to mobile devices with mobile device management (MDM). Implement secure email containers and safe browsing apps. Deploy mobile threat defense solutions.\\n\\n**j) Monitoring and incident response**\\nImplement monitoring for email and web-based threats with automated alerting. Integrate with security information and event management (SIEM) systems. Maintain incident response procedures for email and web-based attacks.`,
        implementationSteps: [
          'Deploy comprehensive email security gateway with advanced threat protection',
          'Configure secure browser standards with automatic updates',
          'Implement web content filtering and DNS security services',
          'Deploy anti-phishing solutions with email authentication protocols',
          'Implement safe attachment and link scanning technologies',
          'Deploy email encryption and data loss prevention capabilities',
          'Implement web application security controls and monitoring',
          'Extend protections to mobile devices with secure containers'
        ],
        practicalTools: [
          'Email security: Microsoft Exchange Online Protection, Proofpoint, Mimecast, or Barracuda',
          'Web filtering: Zscaler, Blue Coat, Forcepoint, or Cisco Umbrella',
          'Anti-phishing: Cofense, KnowBe4, Proofpoint TAP, or Microsoft ATP',
          'Browser management: Microsoft Group Policy, Google Chrome Enterprise, or Mozilla Firefox ESR',
          'DNS security: Cisco Umbrella, Infoblox, or Quad9'
        ],
        auditEvidence: [
          'Email security gateway configuration and protection statistics',
          'Browser security configuration standards and deployment evidence',
          'Web content filtering policies and blocking statistics',
          'Anti-phishing solution deployment and detection metrics',
          'Safe attachment and link scanning configuration and results',
          'Email encryption implementation and key management documentation',
          'Web application security controls and monitoring logs',
          'Mobile device email and web security implementation records'
        ],
        crossReferences: [
          'Malware Defenses (protects against email and web-based malware)',
          'Security Awareness & Skills Training (trains users on email and web threats)',
          'Data Protection (protects data in email communications)'
        ]
      },

      // 19. Penetration Testing ✅
      'Penetration Testing': {
        category: 'Penetration Testing',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.12.6', title: 'Management of technical vulnerabilities', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.14.2.8', title: 'System security testing', relevance: 'primary' },
          { framework: 'cisControls', code: '18.1', title: 'Establish and Maintain a Penetration Testing Program', relevance: 'primary' },
          { framework: 'cisControls', code: '18.2', title: 'Perform Periodic External Penetration Tests', relevance: 'primary' },
          { framework: 'cisControls', code: '18.3', title: 'Remediate Penetration Test Findings', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.d', title: 'Systems for vulnerability handling and disclosure', relevance: 'primary' }
        ],
        foundationContent: `**a) Penetration testing program establishment**\\nEstablish formal penetration testing program with defined scope, frequency, and methodology. Develop testing policies approved by management with clear objectives. Define testing types including external, internal, wireless, web application, and social engineering assessments.\\n\\n**b) Testing methodology and standards**\\nAdopt recognized penetration testing methodologies such as OWASP, NIST, or PTES (Penetration Testing Execution Standard). Define testing phases including reconnaissance, scanning, exploitation, and reporting. Maintain consistency in testing approach and documentation.\\n\\n**c) Scope definition and planning**\\nDefine comprehensive testing scope covering network infrastructure, web applications, wireless networks, and social engineering vectors. Establish testing schedules with appropriate frequency (annual for external, quarterly for critical systems). Plan testing to minimize business disruption.\\n\\n**d) Internal vs external testing capabilities**\\nMaintain combination of internal security testing capabilities and external third-party assessments. Develop internal red team capabilities for ongoing testing. Engage qualified external penetration testing firms for independent assessment.\\n\\n**e) Web application security testing**\\nConduct comprehensive web application penetration testing addressing OWASP Top 10 vulnerabilities. Implement both automated and manual testing approaches. Include API security testing and authentication bypass attempts.\\n\\n**f) Infrastructure and network testing**\\nPerform network penetration testing including external and internal network assessments. Test wireless network security and rogue access point detection. Assess network segmentation effectiveness and lateral movement possibilities.\\n\\n**g) Social engineering assessments**\\nConduct social engineering assessments including phishing campaigns, physical security testing, and human factor analysis. Test employee awareness and response to social engineering attempts. Coordinate with HR and legal departments.\\n\\n**h) Findings documentation and reporting**\\nProvide comprehensive penetration testing reports with detailed findings, risk ratings, and remediation recommendations. Include executive summaries with business impact analysis. Maintain evidence documentation for audit and compliance purposes.\\n\\n**i) Remediation tracking and validation**\\nEstablish systematic remediation tracking for all penetration testing findings. Prioritize remediation based on risk severity and business impact. Conduct validation testing to confirm remediation effectiveness.\\n\\n**j) Continuous improvement and integration**\\nIntegrate penetration testing results with vulnerability management and risk assessment processes. Use findings to improve security controls and awareness programs. Continuously refine testing methodology based on emerging threats.`,
        implementationSteps: [
          'Establish formal penetration testing program with defined methodology',
          'Define comprehensive testing scope and scheduling',
          'Develop internal security testing capabilities and external partnerships',
          'Implement web application security testing procedures',
          'Conduct infrastructure and network penetration testing',
          'Perform social engineering assessments with appropriate approvals',
          'Create comprehensive reporting and documentation procedures',
          'Establish remediation tracking and validation processes'
        ],
        practicalTools: [
          'Penetration testing: Metasploit, Nessus, Burp Suite, or OWASP ZAP',
          'Network scanning: Nmap, Masscan, or Zmap',
          'Web application testing: Burp Suite Professional, OWASP ZAP, or Acunetix',
          'Social engineering: SET (Social Engineer Toolkit), Gophish, or King Phisher',
          'Reporting: Dradis, Faraday, or custom reporting frameworks'
        ],
        auditEvidence: [
          'Penetration testing program policy and methodology documentation',
          'Testing scope definitions and scheduling documentation',
          'Penetration testing reports with findings and risk ratings',
          'Remediation tracking and validation records',
          'Internal testing capability development and training records',
          'External penetration testing firm qualifications and contracts',
          'Social engineering assessment approvals and results',
          'Integration documentation with vulnerability management processes'
        ],
        crossReferences: [
          'Vulnerability Management (validates and prioritizes findings)',
          'Risk Management (incorporates penetration testing results)',
          'Secure Software Development (tests application security controls)'
        ]
      },

      // 20. Audit Log Management ✅
      'Audit Log Management': {
        category: 'Audit Log Management',
        requirementReferences: [
          { framework: 'iso27001', code: 'A.12.4', title: 'Event logging', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.4.1', title: 'Event logging', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.4.2', title: 'Protection of log information', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.12.4.3', title: 'Administrator and operator logs', relevance: 'primary' },
          { framework: 'cisControls', code: '8.1', title: 'Establish and Maintain an Audit Log Management Process', relevance: 'primary' },
          { framework: 'cisControls', code: '8.2', title: 'Collect Audit Logs', relevance: 'primary' },
          { framework: 'cisControls', code: '8.3', title: 'Ensure Adequate Audit Log Storage', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 30', title: 'Records of processing activities', relevance: 'primary' },
          { framework: 'nis2', code: 'Article 21.2.g', title: 'Systems for network security monitoring', relevance: 'primary' }
        ],
        foundationContent: `**a) Comprehensive log collection strategy**\\nEstablish comprehensive logging strategy covering all critical systems, applications, network devices, and security tools. Define log types including authentication events, authorization changes, system activities, and data access. Implement standardized logging formats and timestamps for correlation.\\n\\n**b) Centralized log management system**\\nDeploy centralized log management system with automated collection, parsing, and storage capabilities. Implement log aggregation from distributed systems with secure transmission. Ensure scalability for growing log volumes and retention requirements.\\n\\n**c) Log protection and integrity**\\nImplement log protection measures including encryption in transit and at rest. Deploy log integrity controls with digital signatures or hashing. Protect log management systems from unauthorized access and tampering.\\n\\n**d) Log retention and archival**\\nEstablish log retention policies aligned with business, legal, and regulatory requirements. Implement automated archival and disposal procedures. Maintain long-term storage with appropriate access controls and retrieval capabilities.\\n\\n**e) Real-time monitoring and alerting**\\nImplement real-time log monitoring with automated alerting for security events and policy violations. Deploy security information and event management (SIEM) capabilities. Create correlation rules for detecting suspicious patterns and activities.\\n\\n**f) Log analysis and forensics**\\nDevelop log analysis capabilities for security investigations and forensic analysis. Maintain search and correlation tools for incident response. Implement automated analysis for common security events and compliance monitoring.\\n\\n**g) Compliance reporting and auditing**\\nGenerate compliance reports from log data for regulatory and audit requirements. Maintain audit trails for critical business processes and data access. Provide evidence for security control effectiveness and incident investigations.\\n\\n**h) Performance monitoring and capacity planning**\\nMonitor log management system performance and capacity utilization. Implement capacity planning for growing log volumes and retention requirements. Optimize log collection and processing for performance and cost.\\n\\n**i) Access controls and segregation**\\nImplement strict access controls for log data with role-based permissions. Segregate log access based on job functions and need-to-know principles. Monitor log access activities and maintain access audit trails.\\n\\n**j) Log management governance**\\nEstablish log management governance with policies, procedures, and responsibilities. Define log management roles including administrators, analysts, and auditors. Conduct regular reviews of log management practices and effectiveness.`,
        implementationSteps: [
          'Establish comprehensive log collection strategy and standards',
          'Deploy centralized log management system with automated collection',
          'Implement log protection and integrity controls',
          'Establish log retention policies with automated archival',
          'Deploy real-time monitoring and SIEM capabilities',
          'Develop log analysis and forensic investigation capabilities',
          'Create compliance reporting and audit trail procedures',
          'Implement access controls and governance for log management'
        ],
        practicalTools: [
          'SIEM platforms: Splunk, IBM QRadar, ArcSight, or Elastic Security',
          'Log management: Graylog, LogRhythm, Sumo Logic, or Fluentd',
          'Log collectors: Filebeat, Logstash, Fluentbit, or rsyslog',
          'Analysis tools: Kibana, Grafana, or custom dashboards',
          'Compliance tools: Netwrix, Varonis, or LogPoint'
        ],
        auditEvidence: [
          'Log management policy and collection standards documentation',
          'Centralized log management system implementation records',
          'Log protection and integrity control implementation',
          'Log retention schedules and archival procedures',
          'SIEM deployment with correlation rules and alerting',
          'Log analysis and forensic investigation procedures',
          'Compliance reporting templates and audit trail documentation',
          'Access control implementation and governance procedures'
        ],
        crossReferences: [
          'Network Monitoring & Defense (provides network event logs)',
          'Incident Response Management (uses logs for investigation)',
          'Identity & Access Management (generates authentication and authorization logs)'
        ]
      },

      // 21. GDPR Unified Compliance ✅
      'GDPR Unified Compliance': {
        category: 'GDPR Unified Compliance',
        requirementReferences: [
          { framework: 'gdpr', code: 'Article 5', title: 'Principles relating to processing of personal data', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 25', title: 'Data protection by design and by default', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 30', title: 'Records of processing activities', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 32', title: 'Security of processing', relevance: 'primary' },
          { framework: 'gdpr', code: 'Article 35', title: 'Data protection impact assessment', relevance: 'primary' },
          { framework: 'iso27001', code: 'A.8.9', title: 'Information classification', relevance: 'supporting' },
          { framework: 'iso27001', code: 'A.8.11', title: 'Information handling', relevance: 'supporting' },
          { framework: 'cisControls', code: '3.1', title: 'Establish and Maintain a Data Management Process', relevance: 'supporting' },
          { framework: 'nis2', code: 'Article 21.2.c', title: 'Data protection and privacy', relevance: 'supporting' }
        ],
        foundationContent: `**a) Legal basis and data processing principles**\\nEstablish lawful basis for all personal data processing activities under GDPR Article 6. Implement data protection principles including lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, and accountability. Document legal basis decisions and maintain records.\\n\\n**b) Data subject rights implementation**\\nImplement comprehensive data subject rights management including right of access, rectification, erasure, restriction, portability, and objection. Establish processes for identity verification and response within required timelines (one month). Maintain request tracking and documentation systems.\\n\\n**c) Privacy by design and by default**\\nIntegrate privacy considerations into system design and development processes from inception. Implement privacy-preserving technologies including pseudonymization, encryption, and access controls. Conduct privacy impact assessments for high-risk processing activities.\\n\\n**d) Record of processing activities (ROPA)**\\nMaintain comprehensive records of processing activities including data categories, processing purposes, legal basis, data subjects, recipients, and retention periods. Update ROPA regularly and make available to supervisory authorities. Document cross-border transfers and safeguards.\\n\\n**e) Data protection impact assessments (DPIA)**\\nConduct DPIAs for high-risk processing activities including systematic monitoring, large-scale processing of special categories, and new technologies. Assess privacy risks and implement mitigation measures. Consult with supervisory authorities when residual risk remains high.\\n\\n**f) Data breach management and notification**\\nImplement data breach detection, assessment, and notification procedures compliant with 72-hour reporting requirement. Assess breach likelihood and severity for data subject notification. Maintain breach register and documentation for supervisory authority investigations.\\n\\n**g) Vendor and processor management**\\nEstablish data processing agreements (DPA) with all processors and sub-processors. Conduct due diligence on processor security measures and compliance capabilities. Monitor processor compliance and conduct audits as necessary.\\n\\n**h) Cross-border transfer compliance**\\nImplement appropriate safeguards for international data transfers including adequacy decisions, standard contractual clauses, binding corporate rules, or certification schemes. Assess third-country privacy laws and surveillance programs. Document transfer mechanisms and safeguards.\\n\\n**i) Training and awareness programs**\\nProvide comprehensive GDPR training to all personnel with data processing responsibilities. Implement role-specific training for developers, administrators, and customer service staff. Conduct regular awareness updates on regulatory changes and organizational policies.\\n\\n**j) Governance and accountability**\\nAppoint Data Protection Officer (DPO) where required and define clear responsibilities. Establish privacy governance framework with policies, procedures, and oversight mechanisms. Conduct regular compliance assessments and implement continuous improvement programs.`,
        implementationSteps: [
          'Document legal basis for all personal data processing activities',
          'Implement comprehensive data subject rights management system',
          'Integrate privacy by design principles into development processes',
          'Maintain current records of processing activities (ROPA)',
          'Conduct data protection impact assessments for high-risk processing',
          'Implement breach detection and notification procedures',
          'Establish data processing agreements with all processors',
          'Provide comprehensive GDPR training and awareness programs'
        ],
        practicalTools: [
          'Privacy management: OneTrust, TrustArc, Privacera, or BigID',
          'Data subject request management: OneTrust, TrustArc, or DataGrail',
          'Data discovery and mapping: Varonis, BigID, or Microsoft Purview',
          'Consent management: OneTrust, Cookiebot, or Usercentrics',
          'DPIA tools: OneTrust, TrustArc, or custom assessment frameworks'
        ],
        auditEvidence: [
          'Legal basis documentation and processing justifications',
          'Data subject rights management system and response records',
          'Privacy by design implementation documentation',
          'Current records of processing activities (ROPA)',
          'Data protection impact assessments and risk mitigation measures',
          'Data breach notification records and supervisory authority communications',
          'Data processing agreements and processor audit results',
          'GDPR training records and awareness program documentation'
        ],
        crossReferences: [
          'Data Protection (implements technical data protection measures)',
          'Risk Management (assesses privacy risks and impacts)',
          'Supplier & Third-Party Risk Management (manages processor relationships)'
        ]
      }
    };

    // Improved matching logic for exact category names used in the application
    const exactMatch = categoryMap[cleanCategory];
    if (exactMatch) return exactMatch;
    
    // Try case-insensitive matching
    const categoryKeys = Object.keys(categoryMap);
    const caseInsensitiveMatch = categoryKeys.find(key => 
      key.toLowerCase() === cleanCategory.toLowerCase()
    );
    
    if (caseInsensitiveMatch) return categoryMap[caseInsensitiveMatch];
    
    // Log missing categories for debugging (only in development)
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log(`EnhancedUnifiedGuidanceService: No guidance found for category "${cleanCategory}". Available categories:`, categoryKeys);
    }
    
    return null;
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