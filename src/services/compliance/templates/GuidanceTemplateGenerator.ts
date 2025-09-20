/**
 * Guidance Template Generator
 * 
 * Provides hardcoded templates for compliance categories when AI or database fails.
 * Templates are minimal but comprehensive, under 200 lines each.
 */

export interface GuidanceTemplate {
  category: string;
  title: string;
  sections: {
    foundation: string;
    implementation: string;
    validation: string;
    resources: string;
  };
  subRequirements: string[];
}

export class GuidanceTemplateGenerator {
  
  private static templates: Record<string, GuidanceTemplate> = {
    
    'Access Control & Identity Management': {
      category: 'Access Control & Identity Management',
      title: 'Identity and Access Management Framework',
      sections: {
        foundation: `## 🔐 Foundation: Access Control as Security Cornerstone

Access control forms the foundation of information security by ensuring only authorized individuals access specific resources. This encompasses identity lifecycle management, authentication mechanisms, authorization frameworks, and continuous access monitoring.

**Core Principles:**
- Principle of Least Privilege: Users receive minimum necessary permissions
- Separation of Duties: Critical functions require multiple approvals
- Defense in Depth: Multiple layers of access controls
- Zero Trust Architecture: Verify every access request`,

        implementation: `## 🛠️ Implementation: Modern Identity Management

### Multi-Factor Authentication (MFA)
Deploy MFA for all privileged accounts and remote access. Implement adaptive authentication based on risk signals including location, device, and behavioral patterns.

### Role-Based Access Control (RBAC)
Establish role hierarchies aligned with business functions. Define standard roles for common positions and exception processes for unique requirements.

### Privileged Access Management (PAM)
Implement just-in-time access for administrative privileges. Use session recording and monitoring for all privileged activities.

### Identity Governance
Automated provisioning/deprovisioning based on HR systems. Regular access reviews with manager approval workflows.`,

        validation: `## ✅ Validation: Continuous Access Monitoring

### Access Certification
Quarterly access reviews by data owners and managers. Automated alerts for dormant accounts and excessive privileges.

### Security Monitoring
Real-time monitoring of privileged access activities. Integration with SIEM for anomaly detection and incident response.

### Compliance Reporting
Regular reports on access patterns, policy violations, and certification status. Integration with GRC platforms for audit trails.`,

        resources: `## 📚 Resources: Implementation Support

**Standards & Frameworks:**
- NIST SP 800-63 Digital Identity Guidelines
- ISO/IEC 27001 Access Control (A.9)
- CIS Controls v8 (Controls 5-6)

**Tools & Technologies:**
- Identity Providers (Azure AD, Okta, Ping)
- PAM Solutions (CyberArk, BeyondTrust)
- SIEM Integration (Splunk, QRadar)`
      },
      subRequirements: [
        'a) IDENTITY LIFECYCLE MANAGEMENT - Implement automated user provisioning and deprovisioning processes integrated with HR systems, ensuring timely account creation, modification, and termination based on business requirements and role changes.',
        'b) MULTI-FACTOR AUTHENTICATION - Deploy strong authentication mechanisms requiring multiple verification factors for all privileged accounts and remote access, with adaptive authentication based on risk assessment.',
        'c) ROLE-BASED ACCESS CONTROL - Establish comprehensive role definitions aligned with business functions, implementing principle of least privilege and separation of duties for critical business processes.',
        'd) PRIVILEGED ACCESS MANAGEMENT - Implement just-in-time privileged access with session monitoring, approval workflows, and automated privilege revocation for administrative and system accounts.',
        'e) ACCESS MONITORING AND REVIEW - Conduct regular access certification processes with automated monitoring of user activities, anomaly detection, and periodic review of permissions and entitlements.'
      ]
    },

    'Asset Management': {
      category: 'Asset Management',
      title: 'Comprehensive Asset Management Program',
      sections: {
        foundation: `## 📊 Foundation: Asset Visibility and Control

Asset management provides complete visibility into organizational assets, enabling effective security controls, risk management, and compliance. This includes hardware, software, data, and cloud resources with proper classification and lifecycle management.

**Key Components:**
- Asset Discovery and Inventory
- Classification and Labeling
- Lifecycle Management
- Configuration Management`,

        implementation: `## 🔧 Implementation: Modern Asset Tracking

### Automated Discovery
Deploy network scanning tools and endpoint agents for real-time asset discovery. Integrate with cloud APIs for comprehensive visibility across hybrid environments.

### Asset Classification
Implement data classification schemes based on sensitivity and business impact. Use automated tools for content scanning and labeling.

### Configuration Management
Maintain secure baselines for all asset types. Implement configuration drift detection and automated remediation.

### Lifecycle Tracking
Track assets from procurement through disposal. Implement secure disposal procedures for sensitive data.`,

        validation: `## ✅ Validation: Asset Accountability

### Inventory Accuracy
Regular reconciliation between discovered assets and authorized inventories. Automated alerts for unauthorized or unknown assets.

### Compliance Monitoring
Track compliance with security baselines and regulatory requirements. Generate reports for audit and risk assessment purposes.`,

        resources: `## 📚 Resources: Implementation Tools

**Standards:**
- ISO/IEC 27001 Asset Management (A.8)
- CIS Controls v8 (Controls 1-2)
- NIST SP 800-53 Configuration Management

**Technologies:**
- Discovery Tools (Lansweeper, Device42)
- CMDB Solutions (ServiceNow, Freshservice)
- Cloud Asset Management (AWS Config, Azure Resource Graph)`
      },
      subRequirements: [
        'a) ASSET INVENTORY AND DISCOVERY - Maintain comprehensive, real-time inventory of all organizational assets including hardware, software, data, and cloud resources with automated discovery and classification capabilities.',
        'b) ASSET CLASSIFICATION AND LABELING - Implement systematic classification scheme for all assets based on business value, security requirements, and regulatory obligations with appropriate handling procedures.',
        'c) CONFIGURATION MANAGEMENT - Establish and maintain secure configuration baselines for all asset types with continuous monitoring for unauthorized changes and automated remediation capabilities.',
        'd) ASSET LIFECYCLE MANAGEMENT - Define and implement complete asset lifecycle processes from procurement through secure disposal, including change management and end-of-life procedures.',
        'e) ASSET OWNERSHIP AND ACCOUNTABILITY - Assign clear ownership and custodial responsibilities for all assets with regular reviews and validation of asset assignments and access rights.'
      ]
    },

    'Network Security': {
      category: 'Network Security',
      title: 'Network Security and Communications Protection',
      sections: {
        foundation: `## 🌐 Foundation: Network Defense Strategy

Network security protects data in transit and establishes secure communication channels. This includes perimeter defense, network segmentation, encryption, and monitoring of network traffic for threats and anomalies.

**Defense Layers:**
- Perimeter Security (Firewalls, IPS/IDS)
- Network Segmentation and Micro-segmentation
- Secure Communications (VPN, TLS)
- Network Monitoring and Threat Detection`,

        implementation: `## 🔒 Implementation: Secure Network Architecture

### Network Segmentation
Implement network zones based on security requirements and business functions. Deploy VLANs and security groups to isolate critical systems.

### Firewall Management
Configure next-generation firewalls with application-aware rules. Implement centralized policy management and logging.

### Secure Communications
Deploy enterprise VPN for remote access. Implement TLS 1.3 for all web communications and certificate management.

### Network Monitoring
Deploy network detection and response (NDR) solutions. Implement flow monitoring and behavioral analysis.`,

        validation: `## ✅ Validation: Network Security Assurance

### Security Testing
Regular penetration testing and vulnerability assessments. Network security architecture reviews and configuration audits.

### Traffic Analysis
Continuous monitoring of network traffic patterns. Automated threat detection and incident response capabilities.`,

        resources: `## 📚 Resources: Network Security Tools

**Standards:**
- ISO/IEC 27001 Network Security (A.13)
- NIST SP 800-53 System and Communications Protection
- CIS Controls v8 (Controls 11-12)

**Technologies:**
- NGFWs (Palo Alto, Fortinet, Cisco)
- NDR Solutions (Darktrace, ExtraHop)
- Network Monitoring (SolarWinds, PRTG)`
      },
      subRequirements: [
        'a) NETWORK ARCHITECTURE AND SEGMENTATION - Design and implement secure network architecture with appropriate segmentation, demilitarized zones, and security boundaries to protect critical assets and systems.',
        'b) FIREWALL AND PERIMETER SECURITY - Deploy and maintain next-generation firewalls with intrusion detection/prevention capabilities, implementing rule-based access controls and comprehensive logging.',
        'c) SECURE COMMUNICATIONS - Implement encrypted communication channels for all sensitive data transmission using approved cryptographic protocols and certificate management practices.',
        'd) NETWORK MONITORING AND DETECTION - Establish continuous network monitoring capabilities with behavioral analysis, threat detection, and automated incident response for security events.',
        'e) REMOTE ACCESS SECURITY - Implement secure remote access solutions with multi-factor authentication, encryption, and monitoring for all external connections to organizational networks.'
      ]
    },

    'Incident Response': {
      category: 'Incident Response',
      title: 'Cybersecurity Incident Response Program',
      sections: {
        foundation: `## 🚨 Foundation: Incident Response Readiness

Incident response ensures rapid detection, containment, and recovery from security incidents. This includes preparation, detection capabilities, response procedures, and continuous improvement based on lessons learned.

**Response Phases:**
- Preparation and Planning
- Detection and Analysis
- Containment and Eradication
- Recovery and Post-Incident Activities`,

        implementation: `## ⚡ Implementation: Response Capabilities

### Incident Response Team
Establish dedicated CSIRT with defined roles and responsibilities. Provide regular training and tabletop exercises.

### Detection and Monitoring
Deploy SIEM and SOAR platforms for automated threat detection. Implement threat intelligence feeds and correlation rules.

### Response Procedures
Develop detailed playbooks for common incident types. Establish communication protocols and escalation procedures.

### Forensic Capabilities
Implement digital forensics tools and procedures. Maintain evidence handling and chain of custody processes.`,

        validation: `## ✅ Validation: Response Effectiveness

### Exercise and Testing
Regular tabletop exercises and simulated incident response. Testing of communication channels and response procedures.

### Metrics and Improvement
Track key metrics including detection time, response time, and recovery time. Conduct post-incident reviews and lessons learned.`,

        resources: `## 📚 Resources: Response Tools

**Standards:**
- NIST SP 800-61 Incident Handling Guide
- ISO/IEC 27035 Incident Management
- CIS Controls v8 (Control 17)

**Technologies:**
- SIEM Platforms (Splunk, QRadar, Sentinel)
- SOAR Solutions (Phantom, Demisto)
- Forensics Tools (EnCase, FTK, Volatility)`
      },
      subRequirements: [
        'a) INCIDENT RESPONSE PLANNING - Develop comprehensive incident response plan with defined procedures, roles, responsibilities, and communication protocols for various types of security incidents.',
        'b) INCIDENT DETECTION AND MONITORING - Implement continuous monitoring capabilities with automated threat detection, security event correlation, and real-time alerting mechanisms.',
        'c) INCIDENT RESPONSE TEAM - Establish trained incident response team with clear roles, decision-making authority, and regular exercises to maintain readiness and competency.',
        'd) INCIDENT CONTAINMENT AND RECOVERY - Define procedures for rapid incident containment, evidence preservation, system recovery, and business continuity during security incidents.',
        'e) POST-INCIDENT ANALYSIS - Conduct thorough post-incident reviews to identify lessons learned, improve response procedures, and implement preventive measures for future incidents.'
      ]
    },

    'Risk Management': {
      category: 'Risk Management',
      title: 'Enterprise Risk Management Framework',
      sections: {
        foundation: `## ⚖️ Foundation: Risk-Based Security Approach

Risk management provides systematic approach to identifying, assessing, and managing information security risks. This enables informed decision-making and appropriate allocation of security resources based on business impact and threat landscape.

**Risk Framework:**
- Risk Identification and Assessment
- Risk Treatment and Mitigation
- Risk Monitoring and Review
- Risk Communication and Reporting`,

        implementation: `## 📈 Implementation: Risk Management Process

### Risk Assessment
Conduct regular risk assessments using quantitative and qualitative methods. Identify assets, threats, vulnerabilities, and business impact.

### Risk Treatment
Develop risk treatment plans with appropriate controls. Implement risk mitigation, transfer, acceptance, or avoidance strategies.

### Risk Monitoring
Establish key risk indicators and monitoring processes. Regular review and update of risk registers and treatment plans.

### Risk Governance
Integrate risk management with business processes. Establish risk committees and reporting structures.`,

        validation: `## ✅ Validation: Risk Management Effectiveness

### Risk Metrics
Track key risk indicators and control effectiveness metrics. Regular reporting to senior management and board.

### Risk Reviews
Periodic review of risk appetite, tolerance, and treatment decisions. Assessment of risk management maturity and capabilities.`,

        resources: `## 📚 Resources: Risk Management Standards

**Frameworks:**
- ISO/IEC 27005 Information Security Risk Management
- NIST SP 800-30 Risk Assessment Guide
- COSO Enterprise Risk Management

**Tools:**
- GRC Platforms (ServiceNow, MetricStream)
- Risk Assessment Tools (FAIR, OCTAVE)
- Threat Intelligence (MITRE ATT&CK)`
      },
      subRequirements: [
        'a) RISK ASSESSMENT METHODOLOGY - Implement systematic risk assessment processes to identify, analyze, and evaluate information security risks using established methodologies and criteria.',
        'b) RISK TREATMENT PLANNING - Develop comprehensive risk treatment plans with appropriate controls, mitigation strategies, and resource allocation based on risk assessment results.',
        'c) RISK MONITORING AND REVIEW - Establish continuous risk monitoring processes with key risk indicators, regular reviews, and updates to risk registers and treatment plans.',
        'd) RISK COMMUNICATION AND REPORTING - Implement risk communication procedures with regular reporting to stakeholders, management, and governance bodies at appropriate levels.',
        'e) RISK MANAGEMENT INTEGRATION - Integrate risk management processes with business operations, change management, and strategic planning to ensure risk-informed decision making.'
      ]
    }
  };

  /**
   * Get template for a specific category
   */
  static getTemplate(categoryName: string): GuidanceTemplate | null {
    // Normalize category name for matching
    const normalizedName = this.normalizeCategoryName(categoryName);
    
    // Try exact match first
    if (this.templates[normalizedName]) {
      return this.templates[normalizedName];
    }

    // Try partial matches
    for (const [key, template] of Object.entries(this.templates)) {
      if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
        return template;
      }
    }

    return null;
  }

  /**
   * Get all available templates
   */
  static getAllTemplates(): GuidanceTemplate[] {
    return Object.values(this.templates);
  }

  /**
   * Get list of available category names
   */
  static getAvailableCategories(): string[] {
    return Object.keys(this.templates);
  }

  /**
   * Check if template exists for category
   */
  static hasTemplate(categoryName: string): boolean {
    return this.getTemplate(categoryName) !== null;
  }

  /**
   * Normalize category name for consistent matching
   */
  private static normalizeCategoryName(categoryName: string): string {
    return categoryName
      .toLowerCase()
      .replace(/[&\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate fallback template for unknown categories
   */
  static generateFallbackTemplate(categoryName: string): GuidanceTemplate {
    const cleanName = categoryName.replace(/^\d+\.\s*/, ''); // Remove number prefix
    
    return {
      category: cleanName,
      title: `${cleanName} Implementation Guide`,
      sections: {
        foundation: `## 📋 Foundation: ${cleanName} Overview

This category focuses on ${cleanName.toLowerCase()} requirements and controls necessary for comprehensive information security management. Implementation should align with organizational risk tolerance and business objectives.

**Key Areas:**
- Policy and procedure development
- Control implementation and monitoring
- Training and awareness programs
- Continuous improvement processes`,

        implementation: `## 🛠️ Implementation: ${cleanName} Controls

### Planning and Design
Develop comprehensive policies and procedures for ${cleanName.toLowerCase()}. Align implementation with business requirements and regulatory obligations.

### Control Implementation
Deploy appropriate technical, administrative, and physical controls. Ensure controls are properly configured and integrated with existing security infrastructure.

### Training and Awareness
Provide role-based training for personnel involved in ${cleanName.toLowerCase()}. Develop awareness programs for all stakeholders.

### Documentation and Procedures
Maintain comprehensive documentation of all ${cleanName.toLowerCase()} processes, procedures, and control implementations.`,

        validation: `## ✅ Validation: ${cleanName} Effectiveness

### Control Testing
Regular testing and validation of implemented controls. Assessment of control effectiveness and identification of gaps.

### Compliance Monitoring
Continuous monitoring of compliance with ${cleanName.toLowerCase()} requirements. Regular reporting and corrective action processes.

### Audit and Review
Periodic audits and reviews of ${cleanName.toLowerCase()} implementation. Assessment of program maturity and effectiveness.`,

        resources: `## 📚 Resources: ${cleanName} Standards

**Applicable Standards:**
- ISO/IEC 27001 relevant controls
- NIST Cybersecurity Framework
- Industry-specific regulations and standards

**Implementation Support:**
- Relevant industry best practices
- Professional security frameworks
- Vendor solutions and tools`
      },
      subRequirements: [
        `a) POLICY AND GOVERNANCE - Establish comprehensive policies and governance framework for ${cleanName.toLowerCase()} with clear roles, responsibilities, and accountability mechanisms.`,
        `b) CONTROL IMPLEMENTATION - Deploy appropriate technical and administrative controls for ${cleanName.toLowerCase()} based on risk assessment and business requirements.`,
        `c) MONITORING AND MEASUREMENT - Implement continuous monitoring and measurement processes to ensure effectiveness of ${cleanName.toLowerCase()} controls and procedures.`,
        `d) TRAINING AND AWARENESS - Provide comprehensive training and awareness programs for all personnel involved in ${cleanName.toLowerCase()} activities and processes.`,
        `e) CONTINUOUS IMPROVEMENT - Establish processes for regular review, assessment, and improvement of ${cleanName.toLowerCase()} implementation and effectiveness.`
      ]
    };
  }
}