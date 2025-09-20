/**
 * Unified Guidance Validation and Enhancement Service
 * 
 * Ensures all unified guidance content:
 * 1. References all selected frameworks properly
 * 2. Has consistent structure aligned with unified requirements
 * 3. Contains actionable insights with checkmarks
 * 4. Uses clear, pedagogical language without jargon
 */

export interface GuidanceValidation {
  category: string;
  hasReferences: boolean;
  missingFrameworks: string[];
  hasActionableInsights: boolean;
  hasCheckmarks: boolean;
  grammarIssues: string[];
  structureAligned: boolean;
  completeness: number; // percentage
}

export interface EnhancedGuidance {
  category: string;
  frameworkReferences: string;
  mainContent: string;
  actionableInsights: string[];
  implementationSteps: string[];
  auditChecklist: string[];
}

export class UnifiedGuidanceValidationService {
  /**
   * Framework reference templates
   */
  private static readonly FRAMEWORK_REFERENCES = {
    iso27001: (category: string) => `**ISO 27001:** Clauses 4-10 (ISMS requirements) and relevant Annex A controls`,
    iso27002: (category: string) => `**ISO 27002:** Detailed implementation guidance for ${category} controls`,
    cisControls: (category: string, igLevel: string) => `**CIS Controls v8:** Implementation Group ${igLevel} controls for ${category}`,
    gdpr: (category: string) => `**GDPR:** Articles relevant to ${category} including data protection principles`,
    nis2: (category: string) => `**NIS2 Directive:** Essential requirements for ${category} security measures`
  };

  /**
   * Category-specific guidance templates with proper structure
   */
  private static readonly CATEGORY_GUIDANCE_TEMPLATES: Record<string, EnhancedGuidance> = {
    'Governance & Leadership': {
      category: 'Governance & Leadership',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Why Governance & Leadership Matters

Strong governance and leadership form the bedrock of effective information security. Without executive commitment and clear accountability, security programs fail regardless of technical sophistication.

### Strategic Business Impact
- **Risk Reduction**: Executive oversight ensures appropriate risk appetite and tolerance levels
- **Resource Allocation**: Leadership commitment drives budget and staffing decisions
- **Cultural Change**: Top-down security culture transforms organizational behavior
- **Compliance Assurance**: Board accountability ensures regulatory compliance

## 🎯 Implementation: Building Effective Governance

### Section 1: Leadership Commitment & Accountability
Establish demonstrable leadership involvement through documented commitment, regular reviews, and personal accountability for security outcomes.

### Section 2: Organizational Structure & Roles
Define clear security roles with documented responsibilities, reporting lines, and performance metrics for all security functions.

### Section 3: Policy Framework & Standards
Develop comprehensive security policies with specific timelines, clear requirements, and regular review cycles.`,
      actionableInsights: [
        '✅ Board-level security committee established with quarterly meetings',
        '✅ CISO appointed with direct board reporting line',
        '✅ Security included in executive performance metrics',
        '✅ Annual security budget approved with growth trajectory',
        '✅ Comprehensive policy framework documented and communicated'
      ],
      implementationSteps: [
        '1. Obtain board resolution for security priority',
        '2. Appoint qualified CISO with appropriate authority',
        '3. Establish security steering committee',
        '4. Develop and approve policy framework',
        '5. Implement performance metrics and reporting'
      ],
      auditChecklist: [
        'Board meeting minutes showing security reviews',
        'Signed leadership commitment statements',
        'Documented roles and responsibilities',
        'Current security policies with approval records',
        'Evidence of security performance monitoring'
      ]
    },

    'Risk Management': {
      category: 'Risk Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Why Risk Management is Critical

Risk management transforms security from reactive firefighting to strategic business enablement. Organizations must understand, assess, and manage information security risks systematically.

### Strategic Value
- **Informed Decisions**: Risk-based approach enables appropriate security investments
- **Business Alignment**: Security controls aligned with actual business risks
- **Resource Optimization**: Focus resources on highest-impact risks
- **Stakeholder Confidence**: Demonstrable risk management builds trust

## 🎯 Implementation: Comprehensive Risk Program

### Risk Assessment Methodology
Implement systematic risk identification, analysis, and evaluation using recognized frameworks (ISO 31000, NIST RMF).

### Risk Treatment Planning
Develop risk treatment plans with clear ownership, timelines, and success metrics for all identified risks.

### Continuous Monitoring
Establish ongoing risk monitoring with KRIs, regular reviews, and emerging threat integration.`,
      actionableInsights: [
        '✅ Risk assessment methodology documented and approved',
        '✅ Risk register maintained with regular updates',
        '✅ Risk treatment plans with assigned owners',
        '✅ Risk appetite statement approved by board',
        '✅ Quarterly risk reviews with management'
      ],
      implementationSteps: [
        '1. Define risk assessment methodology',
        '2. Conduct comprehensive risk assessment',
        '3. Develop risk treatment plans',
        '4. Implement risk controls',
        '5. Monitor and review regularly'
      ],
      auditChecklist: [
        'Risk assessment methodology documentation',
        'Current risk register with classifications',
        'Risk treatment plans with timelines',
        'Evidence of risk monitoring activities',
        'Management risk review records'
      ]
    },

    'Access Control & Identity Management': {
      category: 'Access Control & Identity Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Access Control as Security Cornerstone

Access control prevents unauthorized access to information and systems. Without proper identity management and access controls, all other security measures become ineffective.

### Business Benefits
- **Data Protection**: Prevent unauthorized access to sensitive information
- **Compliance**: Meet regulatory requirements for access control
- **Insider Threat Mitigation**: Reduce risk from privileged users
- **Audit Trail**: Complete visibility of access activities

## 🎯 Implementation: Zero Trust Access Architecture

### Identity Lifecycle Management
Implement complete identity lifecycle from onboarding through termination with unique identifiers and regular reviews.

### Privileged Access Management
Deploy PAM solution with just-in-time access, session monitoring, and regular privilege reviews.

### Access Control Enforcement
Implement role-based access control with least privilege, segregation of duties, and regular recertification.`,
      actionableInsights: [
        '✅ Identity lifecycle process fully documented',
        '✅ Privileged access management deployed',
        '✅ Multi-factor authentication enforced',
        '✅ Regular access reviews conducted quarterly',
        '✅ Access violations monitored and investigated'
      ],
      implementationSteps: [
        '1. Document identity lifecycle process',
        '2. Implement role-based access control',
        '3. Deploy privileged access management',
        '4. Enable multi-factor authentication',
        '5. Establish access review process'
      ],
      auditChecklist: [
        'Identity management procedures',
        'Access control matrix',
        'Privileged account inventory',
        'Access review records',
        'MFA deployment evidence'
      ]
    },

    'Information Security Incident Management': {
      category: 'Information Security Incident Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Incident Response Readiness

Incidents are inevitable. The difference between minor disruption and catastrophic breach lies in preparation, detection speed, and response effectiveness.

### Critical Success Factors
- **Speed of Detection**: Minimize dwell time through effective monitoring
- **Response Capability**: Trained team with clear procedures
- **Communication**: Stakeholder notification within regulatory timeframes
- **Learning**: Post-incident improvement prevents recurrence

## 🎯 Implementation: Comprehensive Incident Program

### Incident Response Planning
Develop detailed response plans with clear roles, escalation criteria, and communication templates.

### Detection and Analysis
Implement monitoring with SIEM, behavioral analytics, and threat intelligence integration.

### Response and Recovery
Execute containment, eradication, and recovery with evidence preservation and stakeholder communication.`,
      actionableInsights: [
        '✅ Incident response plan tested quarterly',
        '✅ 24/7 incident response capability established',
        '✅ SIEM deployed with use cases configured',
        '✅ Forensic capabilities ready and tested',
        '✅ Regulatory notification procedures documented'
      ],
      implementationSteps: [
        '1. Develop incident response plan',
        '2. Establish incident response team',
        '3. Deploy detection capabilities',
        '4. Create communication templates',
        '5. Conduct regular exercises'
      ],
      auditChecklist: [
        'Incident response plan current',
        'Team contact list maintained',
        'Incident classification criteria',
        'Exercise results documented',
        'Post-incident review records'
      ]
    },

    'Asset Management': {
      category: 'Asset Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Asset Visibility and Control

You cannot protect what you don't know exists. Comprehensive asset management provides the foundation for all security controls.

### Operational Excellence
- **Complete Visibility**: Know all hardware, software, and data assets
- **Ownership Accountability**: Clear responsibility for asset protection
- **Lifecycle Management**: Secure handling from acquisition to disposal
- **Risk Prioritization**: Focus protection on critical assets

## 🎯 Implementation: Modern Asset Management

### Discovery and Inventory
Deploy automated discovery tools for real-time asset visibility across on-premise and cloud environments.

### Classification and Labeling
Implement data classification scheme with automated labeling and handling procedures.

### Lifecycle Controls
Establish secure acquisition, configuration, maintenance, and disposal procedures.`,
      actionableInsights: [
        '✅ Automated asset discovery deployed',
        '✅ Complete asset inventory maintained',
        '✅ All critical assets classified and labeled',
        '✅ Asset ownership assigned and verified',
        '✅ Secure disposal procedures implemented'
      ],
      implementationSteps: [
        '1. Deploy asset discovery tools',
        '2. Build comprehensive inventory',
        '3. Implement classification scheme',
        '4. Assign asset ownership',
        '5. Establish lifecycle procedures'
      ],
      auditChecklist: [
        'Asset inventory completeness',
        'Classification scheme documentation',
        'Asset ownership records',
        'Disposal certificates',
        'Configuration baselines'
      ]
    },

    'Physical & Environmental Security': {
      category: 'Physical & Environmental Security',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Physical Protection Reality

Physical security is the foundation layer - no amount of cyber security can protect against physical compromise. One unauthorized physical access can bypass all technical controls.

### Business Continuity Impact
- **Operational Resilience**: Protect against environmental threats
- **Data Center Security**: Safeguard critical infrastructure
- **Equipment Protection**: Prevent theft and tampering
- **Personnel Safety**: Ensure safe working environment

## 🎯 Implementation: Layered Physical Defense

### Perimeter Security
Establish security zones with appropriate barriers, access controls, and surveillance systems.

### Environmental Controls
Implement temperature, humidity, water, and power monitoring with automated alerting.

### Equipment Protection
Secure equipment placement with cable protection, maintenance controls, and secure disposal.`,
      actionableInsights: [
        '✅ Security perimeters clearly defined',
        '✅ Access control systems operational',
        '✅ Environmental monitoring active 24/7',
        '✅ CCTV coverage comprehensive',
        '✅ Visitor management procedures enforced'
      ],
      implementationSteps: [
        '1. Define security perimeters',
        '2. Deploy access control systems',
        '3. Implement environmental monitoring',
        '4. Install surveillance systems',
        '5. Establish visitor procedures'
      ],
      auditChecklist: [
        'Physical security assessment',
        'Access control logs',
        'Environmental monitoring records',
        'Visitor access logs',
        'Equipment disposal records'
      ]
    },

    'Communications & Operations Management': {
      category: 'Communications & Operations Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Operational Security Excellence

Secure operations ensure consistent security posture through standardized procedures, change control, and continuous monitoring.

### Operational Benefits
- **Consistency**: Standardized procedures reduce errors
- **Availability**: Capacity management prevents outages
- **Integrity**: Change control maintains system integrity
- **Efficiency**: Automation reduces manual errors

## 🎯 Implementation: Mature Operations

### Documented Procedures
Create comprehensive operating procedures for all critical processes with version control.

### Change Management
Implement formal change control with security impact assessment and approval workflows.

### Capacity Management
Monitor resource utilization with predictive analytics and automated scaling.`,
      actionableInsights: [
        '✅ Operating procedures documented',
        '✅ Change advisory board established',
        '✅ Capacity monitoring automated',
        '✅ Backup procedures tested regularly',
        '✅ Configuration management active'
      ],
      implementationSteps: [
        '1. Document operating procedures',
        '2. Establish change management',
        '3. Implement capacity monitoring',
        '4. Deploy configuration management',
        '5. Automate routine operations'
      ],
      auditChecklist: [
        'Operating procedure library',
        'Change management records',
        'Capacity reports',
        'Backup test results',
        'Configuration baselines'
      ]
    },

    'System Acquisition, Development & Maintenance': {
      category: 'System Acquisition, Development & Maintenance',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Security by Design

Building security into systems from inception is exponentially more effective and economical than retrofitting security after deployment.

### Development Security Value
- **Cost Reduction**: Fix vulnerabilities early when cheaper
- **Risk Prevention**: Eliminate vulnerabilities before production
- **Compliance Integration**: Build compliance into design
- **Quality Improvement**: Security enhances overall quality

## 🎯 Implementation: Secure SDLC

### Security Requirements
Define security requirements during design phase with threat modeling and risk assessment.

### Secure Development
Implement secure coding standards with developer training and automated security testing.

### Security Testing
Conduct comprehensive security testing including SAST, DAST, and penetration testing.`,
      actionableInsights: [
        '✅ Security requirements in all projects',
        '✅ Threat modeling performed consistently',
        '✅ Secure coding standards enforced',
        '✅ Security testing automated in CI/CD',
        '✅ Code reviews include security focus'
      ],
      implementationSteps: [
        '1. Integrate security in SDLC',
        '2. Implement threat modeling',
        '3. Deploy security testing tools',
        '4. Train developers on security',
        '5. Establish security gates'
      ],
      auditChecklist: [
        'SDLC security integration',
        'Threat models documented',
        'Security test results',
        'Developer training records',
        'Code review evidence'
      ]
    },

    'Business Continuity Management': {
      category: 'Business Continuity Management',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Resilience and Recovery

Business continuity ensures organization survival through disruptions. Without tested continuity plans, single incidents can cause permanent business failure.

### Resilience Requirements
- **Recovery Capability**: Restore operations within acceptable timeframes
- **Data Protection**: Prevent permanent data loss
- **Stakeholder Confidence**: Demonstrate resilience to customers
- **Regulatory Compliance**: Meet continuity requirements

## 🎯 Implementation: Comprehensive BCM Program

### Business Impact Analysis
Identify critical processes with RTO/RPO requirements and dependency mapping.

### Continuity Planning
Develop detailed continuity plans with alternate procedures and communication protocols.

### Testing and Maintenance
Conduct regular exercises from tabletop to full failover with lessons learned integration.`,
      actionableInsights: [
        '✅ BIA completed and current',
        '✅ BC plans documented and approved',
        '✅ Backup strategy implemented (3-2-1)',
        '✅ DR site operational and tested',
        '✅ Annual BC exercises conducted'
      ],
      implementationSteps: [
        '1. Conduct business impact analysis',
        '2. Define RTO/RPO objectives',
        '3. Develop continuity plans',
        '4. Implement backup strategy',
        '5. Test and improve regularly'
      ],
      auditChecklist: [
        'BIA documentation',
        'BC/DR plans current',
        'Backup verification logs',
        'Exercise reports',
        'Recovery test results'
      ]
    },

    'Compliance': {
      category: 'Compliance',
      frameworkReferences: '',
      mainContent: `
## 📋 Foundation: Compliance as Business Enabler

Compliance demonstrates commitment to security, privacy, and operational excellence. Beyond avoiding penalties, compliance builds trust and competitive advantage.

### Compliance Benefits
- **Market Access**: Required for regulated industries
- **Customer Trust**: Demonstrates security maturity
- **Risk Reduction**: Structured approach reduces incidents
- **Operational Excellence**: Compliance drives process improvement

## 🎯 Implementation: Integrated Compliance

### Requirements Management
Maintain comprehensive compliance register with all applicable regulations and standards.

### Compliance Monitoring
Implement continuous compliance monitoring with automated evidence collection.

### Audit Management
Coordinate internal and external audits with finding remediation tracking.`,
      actionableInsights: [
        '✅ Compliance register maintained',
        '✅ Regular compliance assessments',
        '✅ Audit calendar established',
        '✅ Finding remediation tracked',
        '✅ Compliance metrics reported'
      ],
      implementationSteps: [
        '1. Identify compliance requirements',
        '2. Map controls to requirements',
        '3. Implement monitoring processes',
        '4. Conduct regular assessments',
        '5. Manage audit activities'
      ],
      auditChecklist: [
        'Compliance register current',
        'Assessment reports',
        'Audit findings tracked',
        'Remediation evidence',
        'Management reporting'
      ]
    }
  };

  /**
   * Validate guidance content for a category
   */
  static validateGuidance(
    category: string, 
    guidanceContent: string,
    selectedFrameworks: string[]
  ): GuidanceValidation {
    const validation: GuidanceValidation = {
      category,
      hasReferences: false,
      missingFrameworks: [],
      hasActionableInsights: false,
      hasCheckmarks: false,
      grammarIssues: [],
      structureAligned: false,
      completeness: 0
    };

    // Check framework references
    selectedFrameworks.forEach(framework => {
      const frameworkUpper = framework.toUpperCase();
      if (!guidanceContent.includes(frameworkUpper) && 
          !guidanceContent.includes(framework)) {
        validation.missingFrameworks.push(framework);
      }
    });
    validation.hasReferences = validation.missingFrameworks.length === 0;

    // Check for actionable insights
    validation.hasActionableInsights = guidanceContent.includes('Key Focus Areas') ||
                                       guidanceContent.includes('Implementation') ||
                                       guidanceContent.includes('Next Steps');

    // Check for checkmarks
    validation.hasCheckmarks = guidanceContent.includes('✅') || 
                              guidanceContent.includes('✓');

    // Check for common grammar issues
    const grammarPatterns = [
      { pattern: /\.\s*\./g, issue: 'Double periods' },
      { pattern: /\s{3,}/g, issue: 'Multiple spaces' },
      { pattern: /[^.!?]\n{3,}/g, issue: 'Excessive line breaks' },
      { pattern: /\b(\w+)\s+\1\b/gi, issue: 'Repeated words' },
      { pattern: /[A-Z]{2,}(?![A-Z])/g, issue: 'Improper capitalization' }
    ];

    grammarPatterns.forEach(({ pattern, issue }) => {
      if (pattern.test(guidanceContent)) {
        validation.grammarIssues.push(issue);
      }
    });

    // Check structure alignment
    validation.structureAligned = 
      guidanceContent.includes('Foundation') &&
      guidanceContent.includes('Implementation') &&
      (guidanceContent.includes('Focus Areas') || guidanceContent.includes('Next Steps'));

    // Calculate completeness
    const expectedSections = [
      'Foundation', 'Implementation', 'Key Focus Areas',
      'framework references', 'audit', 'checkmarks'
    ];
    const presentSections = expectedSections.filter(section => 
      guidanceContent.toLowerCase().includes(section.toLowerCase())
    );
    validation.completeness = (presentSections.length / expectedSections.length) * 100;

    return validation;
  }

  /**
   * Generate enhanced guidance for a category
   */
  static generateEnhancedGuidance(
    category: string,
    selectedFrameworks: Record<string, boolean | string>,
    existingRequirements?: string[]
  ): string {
    const template = this.CATEGORY_GUIDANCE_TEMPLATES[category];
    if (!template) {
      return this.generateDefaultGuidance(category, selectedFrameworks);
    }

    // Build framework references
    const references: string[] = [];
    Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
      if (selected) {
        if (framework === 'cisControls' && typeof selected === 'string') {
          references.push(this.FRAMEWORK_REFERENCES.cisControls(category, selected.toUpperCase()));
        } else if (this.FRAMEWORK_REFERENCES[framework as keyof typeof this.FRAMEWORK_REFERENCES]) {
          const refFunc = this.FRAMEWORK_REFERENCES[framework as keyof typeof this.FRAMEWORK_REFERENCES];
          if (typeof refFunc === 'function') {
            references.push(refFunc(category));
          }
        }
      }
    });

    // Build complete guidance
    let guidance = references.join('\n') + '\n\n';
    guidance += template.mainContent + '\n\n';
    
    // Add actionable insights
    guidance += '## ✅ Audit Readiness Checklist\n\n';
    template.actionableInsights.forEach(insight => {
      guidance += insight + '\n';
    });
    
    // Add implementation steps
    guidance += '\n## 📊 Implementation Roadmap\n\n';
    template.implementationSteps.forEach(step => {
      guidance += step + '\n';
    });
    
    // Add audit checklist
    guidance += '\n## 📋 Evidence for Auditors\n\n';
    template.auditChecklist.forEach(item => {
      guidance += `• ${item}\n`;
    });

    return guidance;
  }

  /**
   * Generate default guidance for unmapped categories
   */
  private static generateDefaultGuidance(
    category: string,
    selectedFrameworks: Record<string, boolean | string>
  ): string {
    // Build framework references
    const references: string[] = [];
    Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
      if (selected) {
        references.push(`**${framework.toUpperCase()}:** Relevant controls and requirements for ${category}`);
      }
    });

    return `${references.join('\n')}

## 📋 Foundation: Understanding ${category}

This category addresses critical security requirements that help ensure your organization meets compliance obligations and security best practices.

### Why This Matters
- **Risk Reduction**: Minimize vulnerabilities and threats in this domain
- **Compliance**: Meet regulatory and framework requirements
- **Operational Excellence**: Improve processes and controls
- **Stakeholder Confidence**: Demonstrate security maturity

## 🎯 Implementation Approach

### Assessment Phase
Review current state against requirements, identify gaps, and prioritize improvements based on risk.

### Implementation Phase
Deploy necessary controls, update procedures, and train personnel on new requirements.

### Verification Phase
Test controls effectiveness, conduct internal assessments, and prepare audit evidence.

## ✅ Success Indicators
✅ Requirements understood and documented
✅ Controls implemented and tested
✅ Personnel trained on procedures
✅ Evidence collected for audit
✅ Continuous improvement established

## 📊 Next Steps
1. Review detailed requirements below
2. Assess current compliance state
3. Develop implementation plan
4. Execute controls deployment
5. Verify and document compliance

For specific guidance, consult with your compliance team or security advisors.`;
  }

  /**
   * Fix grammar and formatting issues in guidance text
   */
  static fixGrammarIssues(text: string): string {
    // Fix double periods
    text = text.replace(/\.\s*\./g, '.');
    
    // Fix multiple spaces
    text = text.replace(/\s{3,}/g, ' ');
    
    // Fix excessive line breaks
    text = text.replace(/([^.!?])\n{3,}/g, '$1\n\n');
    
    // Fix repeated words
    text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');
    
    // Ensure proper sentence spacing
    text = text.replace(/\.(?=[A-Z])/g, '. ');
    
    // Fix markdown formatting
    text = text.replace(/\*\*\s+/g, '**');
    text = text.replace(/\s+\*\*/g, '**');
    
    return text;
  }

  /**
   * Validate all categories in the system
   */
  static validateAllCategories(
    categories: string[],
    guidanceMap: Record<string, string>,
    selectedFrameworks: string[]
  ): Record<string, GuidanceValidation> {
    const validations: Record<string, GuidanceValidation> = {};
    
    categories.forEach(category => {
      const guidance = guidanceMap[category] || '';
      validations[category] = this.validateGuidance(
        category,
        guidance,
        selectedFrameworks
      );
    });
    
    return validations;
  }

  /**
   * Get summary statistics for validation results
   */
  static getValidationSummary(
    validations: Record<string, GuidanceValidation>
  ): {
    totalCategories: number;
    completeCategories: number;
    categoriesWithIssues: number;
    commonIssues: string[];
    averageCompleteness: number;
  } {
    const categories = Object.values(validations);
    const completeCategories = categories.filter(v => 
      v.hasReferences && 
      v.hasActionableInsights && 
      v.hasCheckmarks && 
      v.grammarIssues.length === 0 &&
      v.completeness >= 80
    );
    
    const issueCategories = categories.filter(v =>
      !v.hasReferences ||
      !v.hasActionableInsights ||
      !v.hasCheckmarks ||
      v.grammarIssues.length > 0 ||
      v.completeness < 80
    );
    
    const allIssues = categories.flatMap(v => v.grammarIssues);
    const commonIssues = [...new Set(allIssues)];
    
    const avgCompleteness = categories.reduce((sum, v) => sum + v.completeness, 0) / categories.length;
    
    return {
      totalCategories: categories.length,
      completeCategories: completeCategories.length,
      categoriesWithIssues: issueCategories.length,
      commonIssues,
      averageCompleteness: avgCompleteness
    };
  }
}