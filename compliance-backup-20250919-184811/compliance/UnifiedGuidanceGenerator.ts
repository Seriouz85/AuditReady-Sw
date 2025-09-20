/**
 * UnifiedGuidanceGenerator - Dynamically generates unified guidance from requirements
 * This replaces hardcoded guidance with dynamic, scalable generation
 */

import { UnifiedRequirement, CategoryRequirements } from './UnifiedRequirementsService';

export interface GuidanceSection {
  requirement: string;
  guidance: string;
}

export interface GeneratedGuidance {
  category: string;
  foundationContent: string;
  requirementReferences: any[];
  implementationSteps: string[];
  practicalTools: string[];
  auditEvidence: string[];
  crossReferences: string[];
}

export class UnifiedGuidanceGenerator {
  
  /**
   * Generate complete unified guidance from requirements
   */
  static generateGuidance(categoryRequirements: CategoryRequirements): GeneratedGuidance {
    const { category, requirements } = categoryRequirements;
    
    // Generate guidance for each requirement
    const guidanceSections = requirements.map(req => 
      this.generateRequirementGuidance(req, category)
    );
    
    // Build foundation content (includes operational excellence)
    const foundationContent = this.buildFoundationContent(guidanceSections, category);
    
    // Note: Requirement references are now handled by ComplianceSimplification using real mappings
    const requirementReferences: any[] = [];
    
    // Build implementation steps
    const implementationSteps = this.buildImplementationSteps(requirements, category);
    
    // Build practical tools
    const practicalTools = this.buildPracticalTools(category);
    
    // Build audit evidence
    const auditEvidence = this.buildAuditEvidence(requirements, category);
    
    // Build cross references
    const crossReferences = this.buildCrossReferences(category);
    
    return {
      category,
      foundationContent,
      requirementReferences,
      implementationSteps,
      practicalTools,
      auditEvidence,
      crossReferences
    };
  }
  
  /**
   * Generate guidance for a single requirement
   */
  private static generateRequirementGuidance(
    requirement: UnifiedRequirement, 
    category: string
  ): GuidanceSection {
    // Create professional title
    const professionalTitle = this.createProfessionalTitle(requirement);
    
    // Generate main guidance text
    const guidanceText = this.generateGuidanceText(requirement, category);
    
    return {
      requirement: `${requirement.letter}) ${professionalTitle}`,
      guidance: guidanceText
    };
  }
  
  /**
   * Create professional title from requirement
   */
  private static createProfessionalTitle(requirement: UnifiedRequirement): string {
    let title = requirement.title;
    
    // Remove any informal language
    title = title.replace(/^(establish|implement|ensure|maintain|create)\s+/i, '');
    
    // Capitalize appropriately
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Ensure it's descriptive enough
    if (title.length < 20 && requirement.description) {
      // Add context from description if title is too short
      const descWords = requirement.description.split(' ').slice(0, 3).join(' ');
      if (descWords && !title.toLowerCase().includes(descWords.toLowerCase())) {
        title = `${title} - ${descWords}`;
      }
    }
    
    return title;
  }
  
  /**
   * Generate main guidance text based on actual requirement content
   */
  private static generateGuidanceText(requirement: UnifiedRequirement, category: string): string {
    const title = requirement.title;
    const description = requirement.description || '';
    const fullText = `${title} ${description}`.trim();
    
    // Generate guidance that directly explains THIS specific requirement, 3x longer
    let guidance = '';
    
    // Part 1: Direct explanation of what this specific requirement means
    guidance += `This requirement focuses on ${title.toLowerCase()}. `;
    
    // Part 2: Expand on the actual description if available
    if (description && description.length > 20) {
      guidance += `${description} `;
      guidance += `This means organizations must implement systematic approaches to ${title.toLowerCase()} `;
      guidance += `with documented procedures, clear responsibilities, and regular validation. `;
      
      // Part 3: Add more specific details about what this means in practice
      guidance += `${this.getSpecificPracticalGuidance(title, description)} `;
      
      // Part 4: Add implementation specifics for this exact requirement
      guidance += `Implementation requires ${this.getSpecificImplementationForRequirement(title, description)} `;
      guidance += `with regular reviews and continuous improvement to ensure effectiveness.`;
    } else {
      // Part 2: Create explanation based on the actual title
      guidance += `Organizations must establish comprehensive processes for ${title.toLowerCase()} `;
      guidance += `that include formal documentation, implementation procedures, and ongoing management. `;
      
      // Part 3: Add specific practical guidance based on the title
      guidance += `${this.getSpecificPracticalGuidance(title, '')} `;
      
      // Part 4: Add implementation specifics
      guidance += `Implementation requires ${this.getSpecificImplementationForRequirement(title, description)} `;
      guidance += `with regular reviews and continuous improvement to ensure effectiveness.`;
    }
    
    return guidance;
  }
  
  /**
   * Get specific practical guidance based on the requirement title
   */
  private static getSpecificPracticalGuidance(title: string, description: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('leadership') || lowerTitle.includes('commitment')) {
      return 'Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability.';
    } else if (lowerTitle.includes('scope') || lowerTitle.includes('boundaries')) {
      return 'Clearly document ISMS scope including: physical locations, logical boundaries, included/excluded systems, interfaces with third parties, and business processes covered. Make scope statement publicly available. Review scope with any significant organizational change.';
    } else if (lowerTitle.includes('policy') || lowerTitle.includes('policies')) {
      return 'Establish written policies that define organizational security standards, approved by management, communicated to all personnel, and reviewed annually for continued appropriateness.';
    } else if (lowerTitle.includes('risk')) {
      return 'Implement systematic risk identification, analysis, and evaluation processes with defined criteria, regular assessments, and documented treatment decisions aligned with organizational risk appetite.';
    } else if (lowerTitle.includes('access') || lowerTitle.includes('identity')) {
      return 'Deploy identity lifecycle management with automated provisioning/deprovisioning, role-based access controls, multi-factor authentication, and regular access certification campaigns.';
    } else if (lowerTitle.includes('data') || lowerTitle.includes('information')) {
      return 'Implement data classification schemes with protection levels, encryption for sensitive data, data loss prevention monitoring, and comprehensive lifecycle management from creation to disposal.';
    } else if (lowerTitle.includes('monitor') || lowerTitle.includes('logging')) {
      return 'Deploy comprehensive logging and monitoring systems with real-time alerting, log retention policies, integrity protection, and regular review of monitoring effectiveness.';
    } else if (lowerTitle.includes('incident') || lowerTitle.includes('response')) {
      return 'Establish incident response procedures with clear escalation paths, communication protocols, evidence preservation, and post-incident analysis for organizational learning.';
    } else if (lowerTitle.includes('training') || lowerTitle.includes('awareness')) {
      return 'Develop role-specific security training programs with initial onboarding, annual refresher training, targeted simulations, and measurement of training effectiveness.';
    } else if (lowerTitle.includes('vendor') || lowerTitle.includes('supplier') || lowerTitle.includes('third')) {
      return 'Implement vendor risk assessment frameworks with security questionnaires, contractual security requirements, ongoing monitoring, and incident response coordination.';
    } else if (lowerTitle.includes('asset') || lowerTitle.includes('inventory')) {
      return 'Maintain comprehensive asset inventories with classification levels, ownership assignments, acceptable use guidelines, and regular asset reviews and updates.';
    } else if (lowerTitle.includes('vulnerability') || lowerTitle.includes('patch')) {
      return 'Deploy vulnerability scanning tools with regular assessments, patch management processes, risk-based prioritization, and tracking of remediation activities.';
    } else if (lowerTitle.includes('backup') || lowerTitle.includes('recovery')) {
      return 'Implement automated backup procedures with offsite storage, regular recovery testing, documented recovery procedures, and business continuity planning integration.';
    } else if (lowerTitle.includes('network') || lowerTitle.includes('firewall')) {
      return 'Deploy network security controls including firewalls, intrusion detection systems, network segmentation, and continuous monitoring of network traffic patterns.';
    } else if (lowerTitle.includes('physical') || lowerTitle.includes('facility')) {
      return 'Establish physical security measures including access controls, visitor management, environmental monitoring, and protection against environmental threats.';
    } else if (lowerTitle.includes('compliance') || lowerTitle.includes('audit')) {
      return 'Implement compliance monitoring with regular internal audits, external assessments, evidence collection systems, and corrective action tracking.';
    } else if (lowerTitle.includes('communication') || lowerTitle.includes('reporting')) {
      return 'Establish communication frameworks with defined reporting structures, stakeholder engagement processes, and regular security status reporting to management.';
    } else {
      return 'Deploy systematic control frameworks with documented procedures, regular effectiveness validation, and continuous improvement based on industry best practices.';
    }
  }
  
  /**
   * Get specific implementation details for this exact requirement
   */
  private static getSpecificImplementationForRequirement(title: string, description: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('leadership') || lowerTitle.includes('commitment')) {
      return 'executive sponsorship, clear governance structures, and documented accountability frameworks';
    } else if (lowerTitle.includes('scope') || lowerTitle.includes('boundaries')) {
      return 'clear definition of organizational boundaries, system inventories, and scope documentation';
    } else if (lowerTitle.includes('policy') || lowerTitle.includes('policies')) {
      return 'comprehensive policy development, management approval, and communication processes';
    } else if (lowerTitle.includes('risk')) {
      return 'systematic risk assessment methodologies, treatment strategies, and monitoring processes';
    } else if (lowerTitle.includes('access') || lowerTitle.includes('identity')) {
      return 'identity management systems, access controls, and regular access reviews';
    } else if (lowerTitle.includes('data') || lowerTitle.includes('information')) {
      return 'data classification, protection measures, and lifecycle management';
    } else if (lowerTitle.includes('monitor') || lowerTitle.includes('logging')) {
      return 'monitoring systems, log management, and alerting capabilities';
    } else if (lowerTitle.includes('incident') || lowerTitle.includes('response')) {
      return 'incident response procedures, escalation processes, and recovery capabilities';
    } else if (lowerTitle.includes('training') || lowerTitle.includes('awareness')) {
      return 'structured training programs, awareness campaigns, and competency assessments';
    } else if (lowerTitle.includes('vendor') || lowerTitle.includes('supplier') || lowerTitle.includes('third')) {
      return 'vendor assessment processes, contract management, and ongoing oversight';
    } else if (lowerTitle.includes('asset') || lowerTitle.includes('inventory')) {
      return 'asset identification, classification, and lifecycle management processes';
    } else if (lowerTitle.includes('vulnerability') || lowerTitle.includes('patch')) {
      return 'vulnerability scanning, patch management, and remediation tracking';
    } else if (lowerTitle.includes('backup') || lowerTitle.includes('recovery')) {
      return 'backup procedures, recovery testing, and business continuity planning';
    } else if (lowerTitle.includes('network') || lowerTitle.includes('firewall')) {
      return 'network security controls, segmentation, and monitoring capabilities';
    } else if (lowerTitle.includes('physical') || lowerTitle.includes('facility')) {
      return 'physical security measures, access controls, and environmental protections';
    } else if (lowerTitle.includes('compliance') || lowerTitle.includes('audit')) {
      return 'compliance monitoring, audit preparation, and evidence management';
    } else if (lowerTitle.includes('communication') || lowerTitle.includes('reporting')) {
      return 'communication frameworks, reporting structures, and stakeholder engagement';
    } else {
      return 'systematic implementation approaches, documented procedures, and regular validation';
    }
  }
  
  /**
   * Expand requirement description intelligently based on content (2x longer)
   */
  private static expandRequirementDescription(fullText: string, category: string): string {
    // Extract key concepts from the text
    const concepts = this.extractKeyConcepts(fullText);
    
    // Build explanation that's 2x the original content
    let expanded = '';
    
    // Part 1: Clear opening that builds on the original
    expanded += this.createOpeningStatement(fullText, concepts);
    expanded += ' ';
    
    // Part 2: Detailed explanation of what this means in practice
    expanded += this.addDetailedExplanation(fullText, concepts, category);
    expanded += ' ';
    
    // Part 3: Implementation context specific to the content
    expanded += this.addImplementationContext(fullText, concepts, category);
    
    return expanded;
  }
  
  /**
   * Create comprehensive explanation when only title is available (2x longer)
   */
  private static createComprehensiveExplanation(title: string, category: string): string {
    const concepts = this.extractKeyConcepts(title);
    
    let explanation = '';
    
    // Part 1: Explain what this requirement establishes
    explanation += `This requirement addresses ${this.getSpecificDomain(title, concepts)} `;
    explanation += `within ${category.toLowerCase()} frameworks. `;
    
    // Part 2: Add detailed explanation
    explanation += this.addDetailedExplanation(title, concepts, category);
    explanation += ' ';
    
    // Part 3: Add specific implementation details
    explanation += this.getSpecificImplementation(title, concepts, category);
    
    return explanation;
  }
  
  /**
   * Extract key concepts from requirement text
   */
  private static extractKeyConcepts(text: string): string[] {
    const lowerText = text.toLowerCase();
    const concepts: string[] = [];
    
    // Security concepts
    if (lowerText.includes('policy') || lowerText.includes('policies')) concepts.push('policy');
    if (lowerText.includes('risk')) concepts.push('risk');
    if (lowerText.includes('access') || lowerText.includes('permission')) concepts.push('access');
    if (lowerText.includes('data') || lowerText.includes('information')) concepts.push('data');
    if (lowerText.includes('monitor') || lowerText.includes('logging')) concepts.push('monitoring');
    if (lowerText.includes('train') || lowerText.includes('awareness')) concepts.push('training');
    if (lowerText.includes('incident') || lowerText.includes('response')) concepts.push('incident');
    if (lowerText.includes('vendor') || lowerText.includes('supplier') || lowerText.includes('third')) concepts.push('vendor');
    if (lowerText.includes('encryption') || lowerText.includes('crypto')) concepts.push('encryption');
    if (lowerText.includes('backup') || lowerText.includes('recovery')) concepts.push('backup');
    if (lowerText.includes('network') || lowerText.includes('firewall')) concepts.push('network');
    if (lowerText.includes('asset') || lowerText.includes('inventory')) concepts.push('asset');
    if (lowerText.includes('vulnerability') || lowerText.includes('patch')) concepts.push('vulnerability');
    if (lowerText.includes('audit') || lowerText.includes('log')) concepts.push('audit');
    if (lowerText.includes('control') || lowerText.includes('security')) concepts.push('control');
    
    return concepts;
  }
  
  /**
   * Create opening statement based on actual content
   */
  private static createOpeningStatement(fullText: string, concepts: string[]): string {
    // Use the actual content to create a specific opening
    if (concepts.includes('policy')) {
      return `This requirement establishes comprehensive policy frameworks that define organizational security standards and governance structures.`;
    } else if (concepts.includes('risk')) {
      return `This requirement implements systematic risk management processes to identify, assess, and mitigate security threats across organizational operations.`;
    } else if (concepts.includes('access')) {
      return `This requirement governs identity and access management to ensure appropriate user permissions and secure system access.`;
    } else if (concepts.includes('data')) {
      return `This requirement addresses data protection and information management throughout the complete data lifecycle.`;
    } else if (concepts.includes('monitoring')) {
      return `This requirement establishes continuous monitoring capabilities to detect security events and maintain operational visibility.`;
    } else if (concepts.includes('training')) {
      return `This requirement develops organizational security awareness and competency through comprehensive education programs.`;
    } else if (concepts.includes('incident')) {
      return `This requirement creates incident response capabilities to detect, contain, and recover from security events.`;
    } else if (concepts.includes('vendor')) {
      return `This requirement manages third-party relationships and supply chain security risks through systematic vendor oversight.`;
    } else {
      return `This requirement establishes essential security controls and organizational capabilities for comprehensive protection.`;
    }
  }
  
  /**
   * Add detailed explanation of what this means in practice
   */
  private static addDetailedExplanation(fullText: string, concepts: string[], category: string): string {
    const explanations: string[] = [];
    
    if (concepts.includes('policy')) {
      explanations.push('This involves creating formal documentation that clearly defines organizational expectations, procedures, and standards.');
      explanations.push('Policies must be communicated effectively across the organization and regularly reviewed to ensure continued relevance and effectiveness.');
    }
    
    if (concepts.includes('risk')) {
      explanations.push('Risk management requires systematic identification of potential threats and vulnerabilities that could impact organizational objectives.');
      explanations.push('This includes both internal risks (such as system failures or human error) and external risks (such as cyber attacks or regulatory changes).');
    }
    
    if (concepts.includes('access')) {
      explanations.push('Access management ensures that individuals have appropriate permissions to perform their job functions while preventing unauthorized access to sensitive resources.');
      explanations.push('This requires careful balance between security requirements and operational efficiency to maintain productivity while protecting organizational assets.');
    }
    
    if (concepts.includes('data')) {
      explanations.push('Data protection encompasses the entire information lifecycle from collection and processing through storage and eventual disposal.');
      explanations.push('Organizations must consider data sensitivity, regulatory requirements, and business needs when implementing protection measures.');
    }
    
    if (concepts.includes('monitoring')) {
      explanations.push('Continuous monitoring provides real-time visibility into security events and operational activities across the organization.');
      explanations.push('Effective monitoring systems must balance comprehensiveness with manageability to avoid alert fatigue while ensuring critical events are detected.');
    }
    
    if (concepts.includes('training')) {
      explanations.push('Security awareness education transforms employees from potential security vulnerabilities into active security assets.');
      explanations.push('Training programs must be engaging, relevant, and regularly updated to address evolving threats and organizational changes.');
    }
    
    if (concepts.includes('incident')) {
      explanations.push('Incident response capabilities enable organizations to quickly detect, contain, and recover from security events.');
      explanations.push('Effective incident response requires pre-planning, regular testing, and continuous improvement based on lessons learned.');
    }
    
    if (concepts.includes('vendor')) {
      explanations.push('Third-party risk management addresses security and compliance risks introduced through vendor relationships and outsourced services.');
      explanations.push('Effective vendor management includes due diligence assessments, contractual security requirements, and ongoing monitoring.');
    }
    
    // Return the first 2 most relevant explanations
    if (explanations.length > 0) {
      return explanations.slice(0, 2).join(' ');
    } else {
      return 'This requirement establishes systematic controls and processes that enhance organizational security posture through consistent implementation and ongoing management.';
    }
  }
  
  /**
   * Add compliance and regulatory context
   */
  private static addComplianceContext(fullText: string, concepts: string[], category: string): string {
    const contexts: string[] = [];
    
    if (concepts.includes('data') || concepts.includes('privacy')) {
      contexts.push('Data protection regulations including GDPR, CCPA, and sector-specific requirements mandate specific safeguards and documentation.');
      contexts.push('Organizations must demonstrate compliance through comprehensive policies, procedures, and evidence of implementation effectiveness.');
    }
    
    if (concepts.includes('risk')) {
      contexts.push('Risk management frameworks such as ISO 27001, NIST, and industry standards require systematic risk assessment and treatment processes.');
      contexts.push('Regulatory compliance often depends on demonstrating effective risk management practices and continuous improvement.');
    }
    
    if (concepts.includes('access')) {
      contexts.push('Access control requirements appear across multiple frameworks including SOX, HIPAA, and PCI DSS with specific audit trail and segregation requirements.');
      contexts.push('Compliance audits frequently focus on access management as a critical control for protecting sensitive information and systems.');
    }
    
    if (concepts.includes('monitoring')) {
      contexts.push('Regulatory frameworks require organizations to maintain adequate monitoring and logging capabilities for security and compliance purposes.');
      contexts.push('Audit requirements often specify retention periods, log integrity, and monitoring scope to ensure comprehensive coverage.');
    }
    
    // Return the most relevant context
    if (contexts.length > 0) {
      return contexts.slice(0, 1).join(' ');
    } else {
      return 'This requirement supports compliance with multiple regulatory frameworks and industry standards that organizations must demonstrate during audits.';
    }
  }
  
  /**
   * Add implementation context specific to the content
   */
  private static addImplementationContext(fullText: string, concepts: string[], category: string): string {
    const implementations: string[] = [];
    
    if (concepts.includes('policy')) {
      implementations.push('documented procedures with management approval');
      implementations.push('regular policy reviews and updates');
    }
    if (concepts.includes('risk')) {
      implementations.push('quantitative and qualitative risk assessment methodologies');
      implementations.push('risk treatment strategies with defined ownership');
    }
    if (concepts.includes('access')) {
      implementations.push('role-based access control with least privilege principles');
      implementations.push('automated provisioning and deprovisioning workflows');
    }
    if (concepts.includes('data')) {
      implementations.push('data classification schemes with protection levels');
      implementations.push('encryption and data loss prevention technologies');
    }
    if (concepts.includes('monitoring')) {
      implementations.push('real-time security monitoring with alerting capabilities');
      implementations.push('comprehensive logging and audit trail maintenance');
    }
    
    if (implementations.length > 0) {
      return `Implementation requires ${implementations.slice(0, 2).join(' and ')}.`;
    } else {
      return `Implementation follows industry best practices with documented procedures and regular validation.`;
    }
  }
  
  /**
   * Add business context specific to the content
   */
  private static addBusinessContext(fullText: string, concepts: string[], category: string): string {
    if (concepts.includes('risk')) {
      return `Effective risk management reduces business exposure while enabling informed decision-making and regulatory compliance.`;
    } else if (concepts.includes('data')) {
      return `Strong data protection builds customer trust while ensuring compliance with privacy regulations including GDPR and CCPA.`;
    } else if (concepts.includes('access')) {
      return `Proper access management prevents unauthorized data exposure while maintaining productivity and operational efficiency.`;
    } else if (concepts.includes('policy')) {
      return `Comprehensive policies provide organizational clarity while demonstrating commitment to security governance and compliance.`;
    } else if (concepts.includes('incident')) {
      return `Effective incident response minimizes business disruption while maintaining stakeholder confidence and regulatory standing.`;
    } else {
      return `This control supports business objectives through enhanced security posture and operational resilience.`;
    }
  }

  
  /**
   * Generate implementation approach section
   */
  private static generateImplementationApproach(requirement: UnifiedRequirement, category: string): string {
    const approaches = [];
    
    // Technical implementation
    approaches.push(this.getTechnicalImplementation(requirement, category));
    
    // Process implementation
    approaches.push(this.getProcessImplementation(requirement, category));
    
    // Organizational implementation
    approaches.push(this.getOrganizationalImplementation(requirement, category));
    
    return `**Implementation approach**: ${approaches.filter(a => a).join('. ')}`;
  }
  
  /**
   * Generate strategic importance section
   */
  private static generateStrategicImportance(requirement: UnifiedRequirement, category: string): string {
    const importance = [];
    
    // Risk perspective
    importance.push(this.getRiskPerspective(requirement, category));
    
    // Business perspective
    importance.push(this.getBusinessPerspective(requirement, category));
    
    // Compliance perspective
    importance.push(this.getCompliancePerspective(requirement, category));
    
    return `**Strategic importance**: ${importance.filter(i => i).join('. ')}`;
  }
  
  /**
   * Build complete foundation content from all guidance sections + operational excellence
   */
  private static buildFoundationContent(sections: GuidanceSection[], category: string): string {
    const mainContent = sections.map(section => {
      return `**${section.requirement}**\n${section.guidance}`;
    }).join('\n\n');
    
    const operationalExcellence = this.buildOperationalExcellence(category);
    
    return `${mainContent}\n\n${operationalExcellence}`;
  }
  
  /**
   * Build operational excellence indicators section
   */
  private static buildOperationalExcellence(category: string): string {
    return `
🎯 OPERATIONAL EXCELLENCE INDICATORS

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

💡 PRO TIP: Phase implementation over 6-12 months focusing on ${this.getCategoryFocus(category)}. Key success metrics include >95% control implementation, documented evidence for all requirements, and demonstrated continuous improvement through regular assessments.`;
  }
  
  
  /**
   * Build implementation steps
   */
  private static buildImplementationSteps(requirements: UnifiedRequirement[], category: string): string[] {
    const baseSteps = [
      'Establish comprehensive policy framework with management approval',
      'Implement systematic processes and procedures with version control',
      'Deploy technical controls and monitoring capabilities',
      'Create evidence collection and audit trail systems',
      'Establish regular review and improvement processes'
    ];
    
    // Add category-specific steps
    const categorySteps = this.getCategorySpecificSteps(category);
    return [...categorySteps, ...baseSteps];
  }
  
  /**
   * Build practical tools
   */
  private static buildPracticalTools(category: string): string[] {
    const baseName = category.toLowerCase().replace(/[^a-z]/g, '');
    
    if (baseName.includes('risk')) {
      return [
        'Risk management: ServiceNow GRC, Archer, LogicGate, or Resolver',
        'Risk assessment: FAIR Institute tools, RiskLens, or Quantitative RA',
        'Threat intelligence: MITRE ATT&CK, NIST Cybersecurity Framework',
        'Vulnerability management: Nessus, Qualys, Rapid7, or OpenVAS',
        'Compliance tracking: MetricStream, SAI Global, or custom dashboards'
      ];
    } else if (baseName.includes('identity') || baseName.includes('access')) {
      return [
        'Identity providers: Microsoft Azure AD, Okta, Ping Identity, or ForgeRock',
        'Privileged access management: CyberArk, BeyondTrust, Thycotic, or HashiCorp Vault',
        'Multi-factor authentication: Duo, RSA, Microsoft Authenticator, or Google Auth',
        'Access governance: SailPoint, Saviynt, Microsoft Identity Governance, or Oracle IDM',
        'Directory services: Microsoft Active Directory, OpenLDAP, or AWS Directory Service'
      ];
    } else if (baseName.includes('data') || baseName.includes('protection')) {
      return [
        'Data classification: Microsoft Purview, Varonis, Forcepoint, or Spirion',
        'Data loss prevention: Symantec DLP, Forcepoint DLP, Microsoft Purview DLP, or Digital Guardian',
        'Encryption: Vormetric, Vera, Microsoft Azure RMS, or Thales',
        'Key management: AWS KMS, Azure Key Vault, HashiCorp Vault, or Thales HSM',
        'Privacy management: OneTrust, TrustArc, BigID, or Privacera'
      ];
    } else {
      return [
        `${category} frameworks: Industry-standard frameworks and methodologies`,
        'Policy management: MetricStream, ServiceNow GRC, or SharePoint',
        'Monitoring platforms: Splunk, ELK Stack, or cloud-native solutions',
        'Documentation tools: Confluence, SharePoint, or specialized compliance platforms',
        'Training platforms: Custom LMS or specialized security awareness tools'
      ];
    }
  }
  
  /**
   * Build audit evidence
   */
  private static buildAuditEvidence(requirements: UnifiedRequirement[], category: string): string[] {
    const baseEvidence = [
      'Comprehensive policies with management approval and review dates',
      'Process documentation with version control and change management',
      'Implementation records and configuration evidence',
      'Regular review reports and management decisions',
      'Training records and competency validation',
      'Incident reports and corrective action tracking',
      'Compliance monitoring reports and metrics',
      'Third-party assessments and audit findings'
    ];
    
    // Add requirement-specific evidence
    const requirementEvidence = requirements.map(req => 
      `${req.title} implementation evidence and operational records`
    );
    
    return [...requirementEvidence.slice(0, 3), ...baseEvidence];
  }
  
  /**
   * Build cross references
   */
  private static buildCrossReferences(category: string): string[] {
    const baseName = category.toLowerCase().replace(/[^a-z]/g, '');
    
    if (baseName.includes('governance')) {
      return [
        'Risk Management (implements governance decisions)',
        'Security Awareness & Skills Training (executes governance communication)',
        'Incident Response Management (reports to governance structure)'
      ];
    } else if (baseName.includes('risk')) {
      return [
        'Governance & Leadership (provides risk governance oversight)',
        'Vulnerability Management (identifies technical risks)',
        'Incident Response Management (manages risk realization)'
      ];
    } else if (baseName.includes('identity') || baseName.includes('access')) {
      return [
        'Governance & Leadership (defines access governance policies)',
        'Security Awareness & Skills Training (trains users on access security)',
        'Audit Log Management (monitors identity and access events)'
      ];
    } else if (baseName.includes('data')) {
      return [
        'Identity & Access Management (controls access to protected data)',
        'Vulnerability Management (secures systems processing data)',
        'Supplier & Third-Party Risk Management (manages processor relationships)'
      ];
    } else {
      return [
        'Governance & Leadership (provides strategic oversight)',
        'Risk Management (manages category-specific risks)',
        'Security Awareness & Skills Training (supports user education)'
      ];
    }
  }
  
  /**
   * Get category-specific implementation steps
   */
  private static getCategorySpecificSteps(category: string): string[] {
    const baseName = category.toLowerCase().replace(/[^a-z]/g, '');
    
    if (baseName.includes('risk')) {
      return [
        'Conduct comprehensive risk assessment and threat modeling',
        'Establish risk treatment strategies and mitigation plans',
        'Implement continuous risk monitoring and reporting'
      ];
    } else if (baseName.includes('identity') || baseName.includes('access')) {
      return [
        'Deploy centralized identity management platform with automated provisioning',
        'Implement multi-factor authentication for all user accounts',
        'Establish role-based access control with least privilege principles'
      ];
    } else if (baseName.includes('data')) {
      return [
        'Implement comprehensive data classification and labeling system',
        'Deploy data loss prevention solutions with monitoring capabilities',
        'Establish data retention policies with automated lifecycle management'
      ];
    } else if (baseName.includes('governance')) {
      return [
        'Establish written information security policy approved by management',
        'Define organizational roles and responsibilities with clear accountability',
        'Implement management review processes at planned intervals'
      ];
    } else {
      return [
        `Deploy ${category.toLowerCase()} controls and monitoring systems`,
        `Establish ${category.toLowerCase()}-specific policies and procedures`,
        `Implement regular assessment and improvement processes`
      ];
    }
  }
  
  /**
   * Get specific domain based on title and concepts
   */
  private static getSpecificDomain(title: string, concepts: string[]): string {
    if (concepts.includes('risk')) return 'risk identification, assessment, and treatment procedures';
    if (concepts.includes('access')) return 'identity verification and access authorization mechanisms';
    if (concepts.includes('data')) return 'data protection, classification, and lifecycle management';
    if (concepts.includes('policy')) return 'organizational governance and policy frameworks';
    if (concepts.includes('monitoring')) return 'security monitoring and event detection capabilities';
    if (concepts.includes('incident')) return 'incident detection, response, and recovery procedures';
    if (concepts.includes('training')) return 'security awareness and competency development programs';
    if (concepts.includes('vendor')) return 'third-party risk management and supplier oversight';
    return 'essential security control implementation';
  }
  
  /**
   * Get specific implementation details
   */
  private static getSpecificImplementation(title: string, concepts: string[], category: string): string {
    if (concepts.includes('risk')) {
      return 'Organizations establish risk registers, assessment methodologies, and treatment strategies with clearly defined risk appetite and tolerance levels.';
    } else if (concepts.includes('access')) {
      return 'Implementation includes identity lifecycle management, multi-factor authentication, and privileged access controls with regular access reviews.';
    } else if (concepts.includes('data')) {
      return 'Organizations implement data classification schemes, encryption standards, and data loss prevention with comprehensive lifecycle management.';
    } else if (concepts.includes('policy')) {
      return 'Policy frameworks require management approval, regular reviews, and communication mechanisms with compliance monitoring and enforcement.';
    } else if (concepts.includes('monitoring')) {
      return 'Monitoring systems provide real-time alerting, comprehensive logging, and incident detection with defined escalation procedures.';
    } else {
      return 'Implementation follows systematic approaches with documented procedures, regular validation, and continuous improvement processes.';
    }
  }
  
  /**
   * Get organizational impact
   */
  private static getOrganizationalImpact(title: string, concepts: string[], category: string): string {
    if (concepts.includes('risk')) {
      return 'Effective implementation enables informed risk-based decision making while maintaining regulatory compliance and business continuity.';
    } else if (concepts.includes('data')) {
      return 'Strong data protection enhances customer trust and competitive advantage while ensuring privacy regulation compliance.';
    } else if (concepts.includes('access')) {
      return 'Proper access management balances security requirements with operational productivity and user experience.';
    } else {
      return 'This requirement enhances organizational security posture while supporting business objectives and stakeholder confidence.';
    }
  }
  
  // Helper methods for generating context-aware content
  
  private static getRequirementDomain(title: string, category: string): string {
    const domains: Record<string, string> = {
      'risk': 'comprehensive risk management capabilities',
      'access': 'identity and access control mechanisms',
      'data': 'data protection and privacy controls',
      'governance': 'organizational governance structures',
      'incident': 'incident response capabilities',
      'security': 'security control frameworks',
      'compliance': 'regulatory compliance programs'
    };
    
    for (const [key, value] of Object.entries(domains)) {
      if (title.toLowerCase().includes(key) || category.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'comprehensive control mechanisms';
  }
  
  private static getKeyControls(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    const controls = [];
    
    if (text.includes('assessment')) controls.push('systematic assessments');
    if (text.includes('monitor')) controls.push('continuous monitoring');
    if (text.includes('document')) controls.push('comprehensive documentation');
    if (text.includes('process')) controls.push('defined processes');
    if (text.includes('control')) controls.push('technical controls');
    if (text.includes('policy')) controls.push('policy frameworks');
    
    return controls.length > 0 ? controls.join(', ') : 'appropriate controls and procedures';
  }
  
  private static getOrganizationalActions(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    const actions = [];
    
    if (text.includes('implement')) actions.push('implement technical and administrative controls');
    if (text.includes('establish')) actions.push('establish formal procedures');
    if (text.includes('maintain')) actions.push('maintain ongoing compliance');
    if (text.includes('review')) actions.push('conduct regular reviews');
    if (text.includes('monitor')) actions.push('monitor effectiveness');
    
    return actions.length > 0 ? actions.join(', ') : 'implement appropriate measures';
  }
  
  private static getDesiredOutcomes(title: string, category: string): string {
    const categoryOutcomes: Record<string, string> = {
      'risk': 'effective risk identification and mitigation',
      'governance': 'strong organizational oversight and accountability',
      'access': 'appropriate access control and identity management',
      'data': 'comprehensive data protection and privacy',
      'incident': 'rapid incident detection and response',
      'security': 'robust security posture',
      'compliance': 'regulatory compliance and audit readiness'
    };
    
    for (const [key, value] of Object.entries(categoryOutcomes)) {
      if (category.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'effective control implementation and compliance';
  }
  
  private static expandTechnicalDetails(description: string, category: string): string {
    // Expand on technical aspects mentioned in the description
    const technical = [];
    
    if (description.includes('system')) {
      technical.push('System-level controls provide automated enforcement and monitoring capabilities');
    }
    if (description.includes('data')) {
      technical.push('Data protection measures ensure confidentiality, integrity, and availability');
    }
    if (description.includes('network')) {
      technical.push('Network security controls protect against unauthorized access and data exfiltration');
    }
    
    return technical.join('. ');
  }
  
  private static getComplianceContext(title: string, category: string): string {
    const contexts = [];
    
    // Add framework-specific context
    if (category.toLowerCase().includes('gdpr') || title.toLowerCase().includes('privacy')) {
      contexts.push('GDPR compliance requires documented procedures and audit trails');
    }
    if (category.toLowerCase().includes('iso') || title.toLowerCase().includes('management')) {
      contexts.push('ISO 27001 certification requires systematic implementation and regular reviews');
    }
    
    return contexts.length > 0 ? contexts.join('. ') : '';
  }
  
  private static getTechnicalImplementation(requirement: UnifiedRequirement, category: string): string {
    return `Organizations implement ${requirement.title.toLowerCase()} using automated tools and platforms where applicable, with manual processes for exception handling`;
  }
  
  private static getProcessImplementation(requirement: UnifiedRequirement, category: string): string {
    return `Formal procedures define roles, responsibilities, and workflows with clear escalation paths and approval requirements`;
  }
  
  private static getOrganizationalImplementation(requirement: UnifiedRequirement, category: string): string {
    return `Management commitment ensures adequate resources and organizational support for effective implementation`;
  }
  
  private static getRiskPerspective(requirement: UnifiedRequirement, category: string): string {
    return `Effective implementation reduces organizational risk exposure and potential for security incidents`;
  }
  
  private static getBusinessPerspective(requirement: UnifiedRequirement, category: string): string {
    return `Strong controls support business objectives through operational resilience and stakeholder confidence`;
  }
  
  private static getCompliancePerspective(requirement: UnifiedRequirement, category: string): string {
    return `Documented implementation demonstrates regulatory compliance and audit readiness`;
  }
  
  private static getCategoryFocus(category: string): string {
    const focuses: Record<string, string> = {
      'risk': 'risk assessment methodologies and treatment strategies',
      'governance': 'leadership commitment and organizational structure',
      'access': 'identity lifecycle management and access controls',
      'data': 'data classification and protection measures',
      'incident': 'detection capabilities and response procedures',
      'security': 'technical controls and security configurations'
    };
    
    for (const [key, value] of Object.entries(focuses)) {
      if (category.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'foundational controls and process implementation';
  }
}