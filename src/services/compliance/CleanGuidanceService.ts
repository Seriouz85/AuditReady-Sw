/**
 * Clean Guidance Service
 * Implements the required guidance structure:
 * Section 1: Framework References
 * Section 2: Sub-Requirements with detailed guidance and audit evidence
 * Section 3: Operational Excellence Indicators (ending with PRO TIP)
 * NOW ENHANCED: Uses audit evidence extracted from unified requirements database content
 */

import { AuditEvidenceExtractor } from './AuditEvidenceExtractor';

interface SubRequirement {
  id: string;
  title: string;
  professionalExplanation: string;
  auditEvidencePoints: string[];
  implementationGuidance: string[];
  practicalTools: string[];
  bestPractices: string[];
}

interface CategoryGuidanceStructure {
  frameworkReferences: string;
  subRequirements: SubRequirement[];
  operationalExcellence: string;
}

export class CleanGuidanceService {
  
  /**
   * Get clean guidance with proper structure
   */
  static async getCleanGuidance(
    category: string, 
    selectedFrameworks: Record<string, boolean | string>,
    dynamicRequirements?: any
  ): Promise<string> {
    const guidanceStructure = await this.buildGuidanceStructure(category, selectedFrameworks, dynamicRequirements);
    
    return this.formatGuidanceContent(guidanceStructure);
  }
  
  /**
   * Build guidance structure for category
   */
  private static async buildGuidanceStructure(
    category: string,
    selectedFrameworks: Record<string, boolean | string>,
    dynamicRequirements?: any
  ): Promise<CategoryGuidanceStructure> {
    // Section 1: Framework References
    const frameworkReferences = this.buildFrameworkReferences(category, selectedFrameworks);
    
    // Section 2: Sub-Requirements with guidance
    const subRequirements = await this.buildSubRequirements(category, dynamicRequirements, selectedFrameworks);
    
    // Section 3: Operational Excellence
    const operationalExcellence = this.buildOperationalExcellence();
    
    return {
      frameworkReferences,
      subRequirements,
      operationalExcellence
    };
  }
  
  /**
   * Format complete guidance content
   */
  private static formatGuidanceContent(structure: CategoryGuidanceStructure): string {
    let content = '';
    
    // Section 1: Framework References - REMOVED: Duplicate of button functionality
    // content += structure.frameworkReferences;
    // content += '\n\n';
    
    // Section 2: Sub-Requirements with detailed guidance and audit evidence
    structure.subRequirements.forEach(subReq => {
      content += `${subReq.id}) ${subReq.title}\n`;
      content += `${subReq.professionalExplanation}\n\n`;
      
      // Audit evidence points (now properly extracted from database content!)
      if (subReq.auditEvidencePoints.length > 0) {
        content += `📋 **Audit Ready Evidence Collection: Essential Documentation Required:**\n`;
        subReq.auditEvidencePoints.forEach(point => {
          content += `• ${point}\n`;
        });
        content += '\n';
      }
      
      // Implementation guidance - Now showing relevant guidance only
      if (subReq.implementationGuidance.length > 0) {
        content += `**Implementation Guidance:**\n`;
        subReq.implementationGuidance.forEach(guidance => {
          content += `• ${guidance}\n`;
        });
        content += '\n';
      }
      
      content += '\n';
    });
    
    // Section 3: Operational Excellence Indicators
    content += structure.operationalExcellence;
    
    return content;
  }
  
  /**
   * Build framework references section
   */
  private static buildFrameworkReferences(
    category: string,
    selectedFrameworks: Record<string, boolean | string>
  ): string {
    // Get framework mappings for category
    const frameworkMappings = this.getCategoryFrameworkMappings(category);
    
    const references: string[] = [];
    
    Object.entries(selectedFrameworks).forEach(([framework, enabled]) => {
      if (enabled && frameworkMappings[framework]) {
        const controls = frameworkMappings[framework];
        references.push(`**${framework.toUpperCase()}**: ${controls.join(', ')}`);
      }
    });
    
    return references.length > 0 
      ? `**Framework References:**\n${references.join(', ')}`
      : '**Framework References:** Multiple framework controls apply to this category';
  }
  
  /**
   * Build sub-requirements with professional guidance
   * NOW ENHANCED: Uses audit evidence extracted from unified requirements database content
   */
  private static async buildSubRequirements(
    category: string,
    dynamicRequirements?: any,
    selectedFrameworks?: Record<string, boolean | string>
  ): Promise<SubRequirement[]> {
    // ENHANCED: Always fetch sub-requirements directly from database to ensure we get ALL sub-requirements
    console.log(`[CleanGuidanceService] Fetching sub-requirements directly from database for category: ${category}`);
    
    const subRequirementsFromDb = await this.getSubRequirementsFromDatabase(category, selectedFrameworks);
    if (subRequirementsFromDb && subRequirementsFromDb.length > 0) {
      console.log(`[CleanGuidanceService] Found ${subRequirementsFromDb.length} sub-requirements in database for ${category}`);
      return await this.buildEnhancedSubRequirements(subRequirementsFromDb, selectedFrameworks);
    }
    
    // Fallback: Use dynamicRequirements if database fetch fails
    if (dynamicRequirements && Array.isArray(dynamicRequirements)) {
      console.log(`[CleanGuidanceService] Using fallback dynamic requirements for ${category}, count: ${dynamicRequirements.length}`);
      return await this.buildEnhancedSubRequirements(dynamicRequirements, selectedFrameworks);
    }
    
    // Try to get predefined category data as fallback
    const categoryData = this.getCategoryGuidanceData(category);
    if (categoryData) {
      console.log(`[CleanGuidanceService] Using predefined data for ${category}, count: ${categoryData.subRequirements.length}`);
      return categoryData.subRequirements;
    }
    
    // Final fallback to default structure
    console.log(`[CleanGuidanceService] Using default sub-requirements for ${category}`);
    return this.buildDefaultSubRequirements();
  }
  
  /**
   * Build enhanced sub-requirements using ACTUAL unified requirements from database
   * This method uses the SAME sub-requirements that are shown in unified requirements
   */
  private static async buildEnhancedSubRequirements(unifiedRequirements: string[], selectedFrameworks?: Record<string, boolean | string>): Promise<SubRequirement[]> {
    if (!unifiedRequirements || !Array.isArray(unifiedRequirements)) {
      console.warn('[CleanGuidanceService] No unified requirements provided');
      return [];
    }
    
    console.log(`[CleanGuidanceService] Processing ${unifiedRequirements.length} unified requirements for guidance`);
    console.log('[CleanGuidanceService] Unified requirements received:', unifiedRequirements.map((req, i) => `${String.fromCharCode(97 + i)}: ${req.substring(0, 100)}...`));
    
    const subRequirements: SubRequirement[] = [];
    
    // Process each unified requirement (these are the SAME ones shown in unified requirements)
    for (let index = 0; index < unifiedRequirements.length; index++) {
      const requirement = unifiedRequirements[index];
      const letter = String.fromCharCode(97 + index); // a, b, c, d, etc.
      
      // Extract title from the requirement text (this should match unified requirements exactly)
      const { title, cleanContent, auditEvidence } = this.parseUnifiedRequirement(requirement);
      
      console.log(`[CleanGuidanceService] Processing sub-requirement ${letter}: "${title}"`);
      
      // Get real implementation guidance from database based on frameworks
      const implementationGuidance = await this.getRealGuidanceFromDatabase(title, cleanContent, selectedFrameworks);
      
      subRequirements.push({
        id: letter,
        title: title,
        professionalExplanation: cleanContent,
        auditEvidencePoints: auditEvidence, // Extracted audit evidence from the requirement itself
        implementationGuidance: implementationGuidance, // REAL guidance from database
        practicalTools: [], // No generic spam
        bestPractices: [] // No generic spam
      });
    }
    
    return subRequirements;
  }
  
  /**
   * Generate professional explanation for sub-requirement
   */
  private static generateProfessionalExplanation(title: string, description: string): string {
    if (description && description.length > 50) {
      return description;
    }
    
    // Generate based on title
    return `Establish comprehensive ${title.toLowerCase()} that define requirements, responsibilities, and procedures for this security domain. This includes policy development, implementation planning, and ongoing management processes.`;
  }
  
  /**
   * Generate relevant implementation guidance based on the specific requirement and selected frameworks
   */
  private static async generateRelevantGuidance(title: string, description: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[]> {
    // Extract real guidance from requirements_library.audit_ready_guidance based on title/description match
    // and filter based on selected frameworks
    
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Build framework filter
      const frameworkCodes: string[] = [];
      if (selectedFrameworks) {
        Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
          if (selected) {
            // Map UI framework names to database codes
            switch (framework) {
              case 'iso27001': frameworkCodes.push('iso27001'); break;
              case 'iso27002': frameworkCodes.push('iso27002'); break;
              case 'cisControls': frameworkCodes.push('cis_controls'); break;
              case 'nis2': frameworkCodes.push('nis2'); break;
              case 'gdpr': frameworkCodes.push('gdpr'); break;
              case 'dora': frameworkCodes.push('dora'); break;
            }
          }
        });
      }
      
      // Query requirements_library for matching records with audit_ready_guidance
      const query = supabase
        .from('requirements_library')
        .select('audit_ready_guidance, title, description')
        .not('audit_ready_guidance', 'is', null)
        .neq('audit_ready_guidance', '');
      
      // Add framework filter if frameworks are selected
      if (frameworkCodes.length > 0) {
        query.in('framework_code', frameworkCodes);
      }
      
      // Add text matching - look for similar titles or descriptions
      if (title) {
        query.or(`title.ilike.%${title}%,description.ilike.%${title}%`);
      }
      
      const { data: requirements, error } = await query.limit(10);
      
      if (error) {
        console.error('[CleanGuidanceService] Error fetching guidance:', error);
        return [];
      }
      
      if (!requirements || requirements.length === 0) {
        return [];
      }
      
      // Extract guidance points from audit_ready_guidance text
      const guidancePoints: string[] = [];
      
      requirements.forEach(req => {
        if (req.audit_ready_guidance) {
          // Parse guidance from audit_ready_guidance text
          const guidance = this.extractGuidanceFromText(req.audit_ready_guidance);
          guidancePoints.push(...guidance);
        }
      });
      
      // Remove duplicates and limit to 3-4 most relevant points
      const uniqueGuidance = [...new Set(guidancePoints)];
      return uniqueGuidance.slice(0, 4);
      
    } catch (error) {
      console.error('[CleanGuidanceService] Error generating guidance:', error);
      return [];
    }
  }
  
  /**
   * Extract implementation guidance points from audit_ready_guidance text
   */
  private static extractGuidanceFromText(text: string): string[] {
    if (!text) return [];
    
    const guidancePoints: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for lines that contain implementation guidance (not audit evidence)
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        // Skip audit evidence bullets
        if (!/documented.*policy.*with.*management.*approval|implementation.*procedures.*and.*workflows|training.*records.*and.*competency/i.test(trimmed)) {
          // This looks like implementation guidance, not audit evidence
          const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
          if (guidance.length > 10) { // Filter out very short points
            guidancePoints.push(guidance);
          }
        }
      }
      
      // Also look for guidance sections
      if (/implementation.*guidance|best.*practice|recommended.*approach/i.test(trimmed)) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        if (guidance.length > 10) {
          guidancePoints.push(guidance);
        }
      }
    }
    
    return guidancePoints;
  }
  
  /**
   * Build operational excellence section
   */
  private static buildOperationalExcellence(): string {
    return `🎯 OPERATIONAL EXCELLENCE INDICATORS

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

💡 PRO TIP: Phase implementation over 6-12 months starting with foundational controls (policies, organizational structure), then advance to sophisticated monitoring and continuous improvement processes. Key success metrics include >95% policy compliance, executive participation in quarterly security reviews, documented incident response exercises, and evidence of year-over-year security program maturation.`;
  }
  
  /**
   * Get framework mappings for category
   */
  private static getCategoryFrameworkMappings(category: string): Record<string, string[]> {
    const mappings: Record<string, Record<string, string[]>> = {
      'Identity and Access Management': {
        'iso27001': ['A.9.1.1', 'A.9.1.2', 'A.9.2.1', 'A.9.2.2', 'A.9.2.3', 'A.9.2.4', 'A.9.2.5', 'A.9.2.6', 'A.9.3.1', 'A.9.4.1', 'A.9.4.2', 'A.9.4.3', 'A.9.4.4', 'A.9.4.5'],
        'cisControls': ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8'],
        'nistCsf': ['PR.AC-1', 'PR.AC-3', 'PR.AC-4', 'PR.AC-6', 'PR.AC-7'],
        'nis2': ['Article 21.2(a)', 'Article 21.2(b)']
      },
      'Governance & Leadership': {
        'iso27001': ['A.5.1', 'A.6.1', 'A.6.2', 'A.6.3'],
        'cisControls': ['14.1', '14.2', '14.3'],
        'nis2': ['Article 20', 'Article 21']
      }
      // Add more categories as needed
    };
    
    return mappings[category] || {};
  }
  
  /**
   * Get detailed guidance data for category
   */
  private static getCategoryGuidanceData(category: string): { subRequirements: SubRequirement[] } | null {
    const guidanceData: Record<string, { subRequirements: SubRequirement[] }> = {
      'Identity and Access Management': {
        subRequirements: [
          {
            id: 'a',
            title: 'User identity and authentication policies',
            professionalExplanation: 'Establish comprehensive user identity management policies that define authentication requirements, account lifecycle management, and identity verification procedures. These policies must address user registration, authentication mechanisms, password requirements, multi-factor authentication implementation, and identity federation standards.',
            auditEvidencePoints: [
              'Documented identity management policy with management approval',
              'Authentication mechanism specifications and configurations',
              'User account lifecycle procedures (creation, modification, deactivation)',
              'Multi-factor authentication implementation records',
              'Identity verification and validation processes'
            ],
            implementationGuidance: [
              'Define minimum password complexity and rotation requirements',
              'Implement multi-factor authentication for privileged accounts',
              'Establish automated account provisioning and deprovisioning workflows',
              'Create identity federation policies for third-party integrations'
            ],
            practicalTools: [
              'Identity and Access Management (IAM) systems',
              'Active Directory or LDAP directories',
              'Single Sign-On (SSO) solutions',
              'Multi-factor authentication tools'
            ],
            bestPractices: [
              'Regular access reviews and certifications',
              'Principle of least privilege implementation',
              'Automated user lifecycle management',
              'Strong authentication mechanisms'
            ]
          },
          {
            id: 'b',
            title: 'Access control and authorization framework',
            professionalExplanation: 'Implement robust access control mechanisms that enforce the principle of least privilege and provide appropriate authorization levels based on user roles and responsibilities. This includes role-based access control (RBAC), attribute-based access control (ABAC), and regular access reviews.',
            auditEvidencePoints: [
              'Access control policy documentation and approval',
              'Role definitions and permission matrices',
              'Access review procedures and schedules',
              'Authorization mechanism configurations',
              'Access control system logs and monitoring'
            ],
            implementationGuidance: [
              'Define user roles and associated permissions',
              'Implement automated access control enforcement',
              'Establish regular access certification processes',
              'Create exception handling procedures for emergency access'
            ],
            practicalTools: [
              'Role-Based Access Control (RBAC) systems',
              'Privileged Access Management (PAM) solutions',
              'Access governance platforms',
              'Identity governance and administration tools'
            ],
            bestPractices: [
              'Regular access recertification campaigns',
              'Segregation of duties enforcement',
              'Just-in-time access provisioning',
              'Comprehensive access logging and monitoring'
            ]
          },
          {
            id: 'c',
            title: 'Privileged access management and monitoring',
            professionalExplanation: 'Establish specialized controls for privileged accounts including administrative access, service accounts, and emergency access procedures. This requires enhanced monitoring, approval workflows, session recording, and regular review of privileged access rights.',
            auditEvidencePoints: [
              'Privileged access management policy and procedures',
              'Privileged account inventory and classifications',
              'Session monitoring and recording configurations',
              'Privileged access approval workflows',
              'Emergency access procedures and logs'
            ],
            implementationGuidance: [
              'Implement privileged account discovery and inventory',
              'Deploy session recording for privileged access',
              'Establish approval workflows for privileged access requests',
              'Create emergency access procedures with appropriate monitoring'
            ],
            practicalTools: [
              'Privileged Access Management (PAM) platforms',
              'Session recording and monitoring tools',
              'Password vaulting solutions',
              'Privileged account analytics platforms'
            ],
            bestPractices: [
              'Zero standing privileges implementation',
              'Comprehensive privileged session monitoring',
              'Regular privileged account reviews',
              'Automated privilege escalation controls'
            ]
          },
          {
            id: 'd',
            title: 'User access review and certification processes',
            professionalExplanation: 'Implement systematic processes for regular review and certification of user access rights to ensure continued appropriateness and compliance with the principle of least privilege. This includes automated review workflows, management attestation, and remediation procedures.',
            auditEvidencePoints: [
              'Access review policy and schedule documentation',
              'Access certification campaign results and approvals',
              'Remediation tracking and completion records',
              'Management attestation and sign-off procedures',
              'Access review automation configurations and logs'
            ],
            implementationGuidance: [
              'Establish quarterly access review cycles',
              'Implement automated access certification workflows',
              'Create remediation tracking and escalation procedures',
              'Define management attestation requirements and processes'
            ],
            practicalTools: [
              'Identity governance platforms',
              'Access certification workflow systems',
              'Automated access review tools',
              'Compliance reporting and dashboard solutions'
            ],
            bestPractices: [
              'Risk-based access review prioritization',
              'Continuous access monitoring and analytics',
              'Automated remediation where possible',
              'Regular review process improvement and optimization'
            ]
          }
        ]
      },
      'Governance & Leadership': {
        subRequirements: [
          {
            id: 'a',
            title: 'Leadership commitment and accountability',
            professionalExplanation: 'Information security leadership requires top management (CEO, Board of Directors) to actively demonstrate responsibility for protecting organizational information assets. This establishes the Information Security Management System (ISMS) as a systematic approach to managing sensitive company information and maintaining its confidentiality, integrity, and availability.',
            auditEvidencePoints: [
              'Board-level security governance committee charter and meeting minutes',
              'Executive security accountability framework with defined roles',
              'Annual security budget allocation and approval documentation',
              'Leadership participation in security incidents and responses',
              'Security performance metrics tied to executive compensation'
            ],
            implementationGuidance: [
              'Establish board-level security oversight committee',
              'Define executive security roles and responsibilities',
              'Implement security-focused KPIs for leadership team',
              'Create regular executive security briefing schedule'
            ],
            practicalTools: [
              'Governance, Risk, and Compliance (GRC) platforms',
              'Executive dashboard and reporting tools',
              'Board portal security modules',
              'Risk assessment and reporting systems'
            ],
            bestPractices: [
              'Monthly executive security reviews',
              'Annual security strategy development',
              'Leadership security awareness training',
              'Integration with business continuity planning'
            ]
          },
          {
            id: 'b',
            title: 'Organizational scope and boundaries',
            professionalExplanation: 'Scope definition requires comprehensive documentation of all organizational components within the security program coverage. This encompasses physical locations, digital boundaries, business processes, and data flows with clear inclusions and exclusions.',
            auditEvidencePoints: [
              'ISMS scope statement with management approval',
              'Asset inventory covering all locations and systems',
              'Business process documentation and security impact assessment',
              'Data flow mapping and classification documentation',
              'Scope exclusion justifications and risk assessments'
            ],
            implementationGuidance: [
              'Document all physical and logical boundaries',
              'Create comprehensive asset inventory',
              'Map critical business processes and dependencies',
              'Establish scope review and update procedures'
            ],
            practicalTools: [
              'Asset management systems',
              'Network discovery and mapping tools',
              'Business process modeling software',
              'Data flow analysis platforms'
            ],
            bestPractices: [
              'Regular scope reviews during organizational changes',
              'Risk-based scope prioritization',
              'Stakeholder involvement in scope definition',
              'Integration with business impact analysis'
            ]
          }
        ]
      }
      // Add more categories here
    };
    
    return guidanceData[category] || null;
  }
  
  // Removed getGuidanceTemplateFromDB method - not needed without audit evidence injection
  
  /**
   * Get sub-requirements directly from unified_requirements database table
   */
  private static async getSubRequirementsFromDatabase(category: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[] | null> {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      console.log(`[CleanGuidanceService] Querying database for category: "${category}"`);
      
      // First, we need to find the category_id based on the category name
      const { data: categoryData, error: categoryError } = await supabase
        .from('unified_compliance_categories')
        .select('id')
        .eq('name', category)
        .single();
        
      if (categoryError) {
        console.error(`[CleanGuidanceService] Category error for "${category}":`, categoryError);
        return null;
      }
      
      if (!categoryData) {
        console.warn(`[CleanGuidanceService] Category not found: "${category}"`);
        return null;
      }
      
      const { data, error } = await supabase
        .from('unified_requirements')
        .select('sub_requirements, title, description')
        .eq('category_id', categoryData.id);
        
      if (error) {
        console.error(`[CleanGuidanceService] Database error for category "${category}":`, error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.warn(`[CleanGuidanceService] No unified requirements found for category "${category}"`);
        return null;
      }
      
      // Select the appropriate unified requirement based on frameworks
      let selectedRequirement = null;
      
      // Check if DORA is selected and there's a DORA-specific requirement
      if (selectedFrameworks?.dora) {
        const doraRequirement = data.find(req => req.title && req.title.toLowerCase().includes('dora'));
        if (doraRequirement) {
          console.log(`[CleanGuidanceService] Using DORA-specific requirement for "${category}"`);
          selectedRequirement = doraRequirement;
        }
      }
      
      // If no DORA or no DORA-specific requirement found, use the first (main) one
      if (!selectedRequirement) {
        // Use the one with most sub-requirements (likely the main/comprehensive one)
        selectedRequirement = data.reduce((prev, current) => {
          const prevCount = Array.isArray(prev.sub_requirements) ? prev.sub_requirements.length : 0;
          const currentCount = Array.isArray(current.sub_requirements) ? current.sub_requirements.length : 0;
          return currentCount > prevCount ? current : prev;
        });
        console.log(`[CleanGuidanceService] Using main requirement (${Array.isArray(selectedRequirement.sub_requirements) ? selectedRequirement.sub_requirements.length : 0} sub-requirements) for "${category}"`);
      }
      
      if (!selectedRequirement || !selectedRequirement.sub_requirements) {
        console.warn(`[CleanGuidanceService] Selected requirement has no sub-requirements for category "${category}"`);
        return null;
      }
      
      // sub_requirements is a JSON array in the database
      const subRequirements = Array.isArray(selectedRequirement.sub_requirements) ? selectedRequirement.sub_requirements : [];
      console.log(`[CleanGuidanceService] Retrieved ${subRequirements.length} sub-requirements from database for "${category}"`);
      
      // DEBUG: Log first few characters of each sub-requirement to see the structure
      subRequirements.forEach((req, index) => {
        const letter = String.fromCharCode(97 + index);
        console.log(`[CleanGuidanceService] ${letter}: ${req.substring(0, 200)}...`);
      });
      
      return subRequirements;
      
    } catch (error) {
      console.error(`[CleanGuidanceService] Error fetching sub-requirements for "${category}":`, error);
      return null;
    }
  }

  /**
   * Parse unified requirement text to extract title, clean content, and audit evidence
   * COMPLETELY REWRITTEN to handle the actual database format correctly
   */
  private static parseUnifiedRequirement(requirement: string): { title: string; cleanContent: string; auditEvidence: string[] } {
    if (!requirement) {
      return { title: 'Unknown requirement', cleanContent: '', auditEvidence: [] };
    }
    
    console.log(`[CleanGuidanceService] Parsing requirement: "${requirement.substring(0, 300)}..."`);
    
    const lines = requirement.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let title = '';
    let cleanContent = '';
    const auditEvidence: string[] = [];
    let inAuditSection = false;
    let contentLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for audit evidence headers
      if (/📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection/i.test(line) || 
          /[Ee]ssential.*[Dd]ocumentation.*[Rr]equired/i.test(line) ||
          /[Tt]echnical.*[Ee]vidence.*to.*[Cc]ollect/i.test(line)) {
        inAuditSection = true;
        continue;
      }
      
      // If we're in audit section, collect evidence points
      if (inAuditSection && line.startsWith('•')) {
        const evidencePoint = line.replace(/^•\s*/, '').trim();
        if (evidencePoint.length > 0) {
          auditEvidence.push(evidencePoint);
        }
        continue;
      }
      
      // If we hit non-audit content after audit section, we're done with audit
      if (inAuditSection && !line.startsWith('•') && !line.includes('📋') && !line.includes('Essential') && !line.includes('Technical Evidence')) {
        inAuditSection = false;
      }
      
      // Skip audit content for clean content
      if (!inAuditSection && !line.startsWith('•') && !line.includes('📋') && !line.includes('Essential')) {
        contentLines.push(line);
      }
    }
    
    // Extract title and content from clean lines
    if (contentLines.length > 0) {
      const firstLine = contentLines[0];
      
      // Try different patterns to extract the title
      if (firstLine.includes(':')) {
        // Pattern like "a) TITLE: Description"
        const parts = firstLine.split(':');
        if (parts.length >= 2) {
          title = parts[0].replace(/^[a-z]\)\s*/i, '').trim();
          cleanContent = parts.slice(1).join(':').trim();
          if (contentLines.length > 1) {
            cleanContent += ' ' + contentLines.slice(1).join(' ');
          }
        }
      } else if (firstLine.includes(' - ')) {
        // Pattern like "a) TITLE - Description" (space-hyphen-space separator)
        const parts = firstLine.split(' - ');
        if (parts.length >= 2) {
          title = parts[0].replace(/^[a-z]\)\s*/i, '').trim();
          cleanContent = parts.slice(1).join(' - ').trim();
          if (contentLines.length > 1) {
            cleanContent += ' ' + contentLines.slice(1).join(' ');
          }
        }
      } else {
        // Pattern like "a) TITLE Description..." - extract first few words as title
        const text = firstLine.replace(/^[a-z]\)\s*/i, '').trim();
        const words = text.split(' ');
        if (words.length > 3) {
          // Take first 3-5 words as title, rest as content
          title = words.slice(0, Math.min(5, Math.ceil(words.length * 0.3))).join(' ');
          cleanContent = words.slice(Math.min(5, Math.ceil(words.length * 0.3))).join(' ');
        } else {
          title = text;
          cleanContent = text;
        }
        
        if (contentLines.length > 1) {
          cleanContent += ' ' + contentLines.slice(1).join(' ');
        }
      }
    }
    
    // Fallback
    if (!title) {
      title = 'Requirement';
    }
    
    console.log(`[CleanGuidanceService] Parsed requirement: title="${title}", clean content length=${cleanContent.length}, audit evidence count=${auditEvidence.length}`);
    
    return { title, cleanContent, auditEvidence };
  }
  
  /**
   * Get real implementation guidance from requirements_library.audit_ready_guidance
   * based on title/content matching and selected frameworks
   */
  private static async getRealGuidanceFromDatabase(title: string, content: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[]> {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Build framework names filter (use the same approach as other services)
      const frameworkNames: string[] = [];
      if (selectedFrameworks) {
        Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
          if (selected) {
            switch (framework) {
              case 'iso27001': frameworkNames.push('ISO 27001'); break;
              case 'iso27002': frameworkNames.push('ISO 27002'); break;  
              case 'cisControls': 
                if (typeof selected === 'string') {
                  frameworkNames.push('CIS Controls'); // The framework name, not the specific IG level
                } else {
                  frameworkNames.push('CIS Controls');
                }
                break;
              case 'nis2': frameworkNames.push('NIS2'); break;
              case 'gdpr': frameworkNames.push('GDPR'); break;
              case 'dora': frameworkNames.push('DORA'); break;
            }
          }
        });
      }
      
      // Query for matching guidance using standards_library relation
      let query = supabase
        .from('requirements_library')
        .select(`
          audit_ready_guidance,
          title,
          description,
          standards_library!inner(name)
        `)
        .not('audit_ready_guidance', 'is', null)
        .neq('audit_ready_guidance', '')
        .eq('is_active', true);
      
      // Filter by frameworks if specified
      if (frameworkNames.length > 0) {
        query = query.in('standards_library.name', frameworkNames);
        console.log(`[CleanGuidanceService] Filtering by framework names: ${frameworkNames.join(', ')}`);
      } else {
        console.log(`[CleanGuidanceService] No framework filter applied - getting guidance from all frameworks`);
      }
      
      const { data: requirements, error } = await query.limit(50);
      
      if (error) {
        console.error('[CleanGuidanceService] Database error:', error);
        return [];
      }
      
      if (!requirements || requirements.length === 0) {
        console.log('[CleanGuidanceService] No matching guidance found in database');
        return [];
      }
      
      console.log(`[CleanGuidanceService] Found ${requirements.length} requirements with audit_ready_guidance`);
      
      // Extract implementation guidance points (not audit evidence)
      const guidancePoints: string[] = [];
      
      requirements.forEach((req, index) => {
        if (req.audit_ready_guidance) {
          console.log(`[CleanGuidanceService] Processing requirement ${index + 1}: ${req.standards_library?.name} - ${req.title?.substring(0, 50)}...`);
          const guidance = this.extractImplementationGuidanceFromText(req.audit_ready_guidance);
          console.log(`[CleanGuidanceService] Extracted ${guidance.length} guidance points from this requirement`);
          guidancePoints.push(...guidance);
        }
      });
      
      // Remove duplicates and return top 4 most relevant points
      const uniqueGuidance = [...new Set(guidancePoints)];
      console.log(`[CleanGuidanceService] Found ${uniqueGuidance.length} unique guidance points for "${title}"`);
      
      return uniqueGuidance.slice(0, 4);
      
    } catch (error) {
      console.error('[CleanGuidanceService] Error fetching guidance:', error);
      return [];
    }
  }
  
  /**
   * Extract implementation guidance points from audit_ready_guidance text
   * IMPROVED: More aggressive extraction to find guidance anywhere in the text
   */
  private static extractImplementationGuidanceFromText(text: string): string[] {
    if (!text) return [];
    
    console.log(`[CleanGuidanceService] Extracting guidance from text (${text.length} chars): "${text.substring(0, 200)}..."`);
    
    const guidancePoints: string[] = [];
    const lines = text.split('\n');
    let inImplementationSection = false;
    let inAuditEvidenceSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check for implementation guidance sections
      if (/implementation.*guidance|recommended.*practice|best.*practice|approach.*guide/i.test(trimmed)) {
        inImplementationSection = true;
        inAuditEvidenceSection = false;
        console.log('[CleanGuidanceService] Found implementation guidance section');
        continue;
      }
      
      // Check for audit evidence sections  
      if (/audit.*evidence|documentation.*required|evidence.*collect|essential.*documentation/i.test(trimmed)) {
        inAuditEvidenceSection = true;
        inImplementationSection = false;
        console.log('[CleanGuidanceService] Found audit evidence section - skipping');
        continue;
      }
      
      // Collect bullets from implementation sections
      if (inImplementationSection && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        if (guidance.length > 15) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added implementation guidance: ${guidance.substring(0, 80)}...`);
        }
      }
      
      // Also collect standalone guidance bullets that look like implementation guidance
      if (!inAuditEvidenceSection && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        
        if (guidance.length > 15 && 
            !this.isAuditEvidence(guidance) && 
            this.isImplementationGuidance(guidance)) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added standalone guidance: ${guidance.substring(0, 80)}...`);
        }
      }
      
      // FALLBACK: If we don't find explicit sections, extract any actionable bullets
      if (!inImplementationSection && !inAuditEvidenceSection && 
          (trimmed.startsWith('•') || trimmed.startsWith('-')) && 
          guidancePoints.length < 2) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        
        if (guidance.length > 20 && 
            !this.isAuditEvidence(guidance) && 
            (this.isImplementationGuidance(guidance) || /establish|implement|ensure|maintain|deploy|configure/i.test(guidance))) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added fallback guidance: ${guidance.substring(0, 80)}...`);
        }
      }
    }
    
    console.log(`[CleanGuidanceService] Extracted ${guidancePoints.length} guidance points from text`);
    return guidancePoints;
  }
  
  /**
   * Check if a text line is audit evidence (not implementation guidance)
   */
  private static isAuditEvidence(text: string): boolean {
    const evidencePatterns = [
      /documented.*policy.*with.*management.*approval/i,
      /training.*records.*and.*competency/i,
      /implementation.*procedures.*and.*workflows/i,
      /regular.*review.*and.*update.*documentation/i,
      /compliance.*monitoring.*and.*reporting/i
    ];
    
    return evidencePatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if a text line is implementation guidance
   */
  private static isImplementationGuidance(text: string): boolean {
    const guidancePatterns = [
      /establish|implement|configure|deploy|create|define|maintain/i,
      /ensure.*that|make.*sure|verify.*that/i,
      /regular.*review|periodic.*assessment|continuous.*monitoring/i,
      /automated|centralized|systematic/i
    ];
    
    return guidancePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Build default sub-requirements for categories without detailed guidance
   */
  private static buildDefaultSubRequirements(): SubRequirement[] {
    return [
      {
        id: 'a',
        title: 'Policy and framework establishment',
        professionalExplanation: 'Establish comprehensive policies and frameworks that define requirements, responsibilities, and procedures for this security domain.',
        auditEvidencePoints: [], // No audit evidence for fallback
        implementationGuidance: [], // REMOVED: No more generic guidance spam
        practicalTools: [], // REMOVED: No more generic tool spam
        bestPractices: [] // REMOVED: No more generic best practice spam
      },
      {
        id: 'b',
        title: 'Implementation and operational controls',
        professionalExplanation: 'Implement operational controls and procedures that ensure consistent application of security requirements across the organization.',
        auditEvidencePoints: [], // No audit evidence for fallback  
        implementationGuidance: [], // REMOVED: No more generic guidance spam
        practicalTools: [], // REMOVED: No more generic tool spam
        bestPractices: [] // REMOVED: No more generic best practice spam
      }
    ];
  }
}