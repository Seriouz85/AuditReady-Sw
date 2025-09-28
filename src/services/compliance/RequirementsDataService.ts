import { supabase } from '../../lib/supabase';
import { RequirementDetail, UnifiedSection } from './types/ComplianceTypesDefinitions';

/**
 * Requirements Data Service
 * 
 * Handles all database operations and data fetching for compliance requirements.
 * Responsible for retrieving structured sections and mapped requirements from
 * the database while maintaining data integrity and consistency.
 */
export class RequirementsDataService {

  /**
   * Get section structure from database (preserves exact formatting)
   */
  async getDatabaseSections(categoryName: string): Promise<UnifiedSection[]> {
    // GOVERNANCE: Use original database structure but make it framework-compatible
    if (categoryName === 'Governance & Leadership') {
      return this.getOriginalGovernanceFromDatabase();
    }
    
    const { data, error } = await supabase
      .from('unified_requirements')
      .select(`
        sub_requirements,
        unified_compliance_categories!inner(name)
      `)
      .eq('unified_compliance_categories.name', categoryName);
    
    if (error) throw error;
    if (!data || data.length === 0) return [];
    
    const sections: UnifiedSection[] = [];
    const subRequirements = (data[0]?.sub_requirements || []) as string[];
    
    subRequirements.forEach((subReq: string) => {
      const letterMatch = subReq.match(/^([a-p])\)\s+/);
      if (!letterMatch) return;
      
      const letter = letterMatch[1];
      const content = subReq.replace(/^[a-p]\)\s+/, '');
      
      // Smart title/description extraction
      const { title, description } = this.extractTitleAndDescription(content);
      
      sections.push({
        id: letter || String.fromCharCode(97 + sections.length),
        title: title || '',
        description: description || '',
        requirements: [],
        frameworks: new Set()
      });
    });
    
    return sections.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get EXACT original Governance structure from database parsing - ALL 16 SECTIONS
   */
  private getOriginalGovernanceFromDatabase(): UnifiedSection[] {
    // EXACT ORIGINAL DATABASE CONTENT FROM YOUR DATABASE - DO NOT CHANGE ANYTHING
    const originalSubRequirements = [
      "a) LEADERSHIP COMMITMENT AND ACCOUNTABILITY - ISO 27001 requires an Information Security Management System (ISMS), a systematic approach to managing security. Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability. Executive leadership must demonstrate visible commitment to information security (ISO 27001 Clause 5.1) - Assign specific accountability for security decisions and outcomes",
      "b) SCOPE AND BOUNDARIES DEFINITION - Define and document the scope of your information security management system (ISMS), including all assets, locations, and business processes that require protection - Document all systems, data, and infrastructure within security scope (ISO 27001 Clause 4.3) - Identify interfaces with external parties and third-party services (ISO 27001 Clause 4.3) - Define geographical and organizational boundaries clearly - Regular review and updates when business changes occur",
      "c) ORGANIZATIONAL STRUCTURE (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation) AND GOVERNANCE - Establish clear roles, responsibilities, and reporting lines for information security governance throughout the organization. Core Requirements: - Define security governance structure with clear hierarchy (ISO 27001 Clause 5.3) - Assign specific security responsibilities to key personnel (ISO 27001 Annex A.5.2) - Establish information security committee or steering group",
      "d) POLICY FRAMEWORK (ISO 27001 Foundation: Your information security policy becomes the cornerstone document where many governance requirements can be documented, approved, and communicated) - Develop, implement, and maintain a comprehensive information security policy framework aligned with business objectives and regulatory requirements - Create overarching information security policy approved by management (ISO 27001 Clause 5.2) - Develop supporting policies for specific security domains (ISO 27001 Annex A.5.1) - Ensure policies reflect current threats and business requirements - Regular review and update cycle for all security policies",
      "e) PROJECT MANAGEMENT AND SECURITY INTEGRATION (ISO 27002 Control 5.8: Information security in project management) - Integrate information security requirements into all project management processes, ensuring security is considered from project inception through completion - Include security requirements in project planning and design (ISO 27002 Control 5.8) - Conduct security risk assessments for all new projects (ISO 27001 Annex A.5.8) - Implement security testing and validation before deployment - Maintain security documentation throughout project lifecycle",
      "f) ASSET USE AND DISPOSAL GOVERNANCE - Define acceptable use policies for information and associated assets, including secure disposal procedures to prevent unauthorized disclosure - Establish clear guidelines for acceptable use of organizational assets (ISO 27001 Annex A.5.10) - Define procedures for secure disposal of equipment and media (ISO 27001 Annex A.7.14) - Implement asset tracking throughout its lifecycle (ISO 27001 Annex A.5.9) - Ensure data is properly sanitized before disposal or reuse",
      "g) DOCUMENTED PROCEDURES MANAGEMENT - Maintain documented operating procedures for all security processes, ensuring consistent implementation and compliance with requirements - Document all security processes and procedures clearly (ISO 27001 Clause 7.5.1) - Ensure procedures are accessible to relevant personnel (ISO 27001 Clause 7.5.3) - Maintain version control for all security documentation (ISO 27001 Clause 7.5.2) - Regular review and testing of documented procedures",
      "h) **PERSONNEL SECURITY FRAMEWORK** (ISO 27002 Control 6.2: Terms and conditions of employment, Control 6.5: Responsibilities after termination or change of employment) - Implement comprehensive personnel security controls including background verification, confidentiality agreements, and clear responsibilities after employment termination - Conduct appropriate background checks for personnel (ISO 27001 Annex A.6.1) - Include security responsibilities in employment contracts (ISO 27001 Annex A.6.2) - Implement confidentiality and non-disclosure agreements - Define responsibilities after termination or change of employment (ISO 27002 Control 6.5) - Ensure proper return of assets upon employment termination",
      "i) **COMPETENCE MANAGEMENT AND DEVELOPMENT** - Determine and ensure the necessary competence of persons whose work affects information security performance - Define competency requirements for security-related roles (ISO 27001 Clause 7.2) - Assess current competency levels against requirements (ISO 27001 Clause 7.2) - Provide training and development to address gaps - Maintain records of competency assessments and training",
      "j) COMPLIANCE MONITORING AND OVERSIGHT - Establish monitoring, measurement, analysis and evaluation processes to ensure ongoing compliance with security requirements - Define monitoring processes for security controls effectiveness - Implement regular compliance assessments and audits - Establish metrics and KPIs for security performance - Regular reporting to management on compliance status",
      "k) CHANGE MANAGEMENT GOVERNANCE - Establish formal change management processes for all system modifications affecting information security - Define change approval processes and authorities - Assess security impact of all proposed changes - Implement change testing and validation procedures - Maintain change logs and documentation",
      "l) REGULATORY RELATIONSHIPS MANAGEMENT - Establish and maintain appropriate relationships with regulatory authorities and other external stakeholders - Maintain contact with special interest groups (ISO 27002 Control 5.6) - Establish communication channels with regulatory bodies - Participate in relevant security forums and associations - Monitor regulatory changes and compliance requirements",
      "m) INCIDENT RESPONSE GOVERNANCE STRUCTURE - Establish governance structures for incident response including roles, responsibilities, and escalation procedures - Define incident response team structure and authorities - Establish escalation procedures for critical incidents - Define communication protocols during incidents - Regular testing and updating of incident response procedures",
      "n) **THIRD-PARTY GOVERNANCE FRAMEWORK** - Implement governance controls for managing information security risks in third-party relationships - Establish supplier risk assessment processes - Define security requirements for third-party agreements - Implement ongoing monitoring of supplier security performance - Regular review and audit of third-party security controls",
      "o) CONTINUOUS IMPROVEMENT GOVERNANCE - Implement formal processes for continual improvement of the information security management system - Establish improvement identification and prioritization processes - Define roles and responsibilities for improvement initiatives - Implement tracking and measurement of improvement effectiveness - Regular review of improvement program effectiveness",
      "p) AWARENESS TRAINING GOVERNANCE - Establish comprehensive security awareness training programs at the governance level to ensure organizational security culture - Design role-specific awareness training programs - Implement regular training updates and assessments - Measure training effectiveness and participation - Maintain training records and competency documentation"
    ];

    return originalSubRequirements.map((subReq: string) => {
      const letterMatch = subReq.match(/^([a-p])\)\s+/);
      if (!letterMatch) return null;
      
      const letter = letterMatch[1];
      const content = subReq.replace(/^[a-p]\)\s+/, '');
      
      // Extract title and description exactly as database parsing does
      const { title, description } = this.extractTitleAndDescription(content);
      
      return {
        id: letter,
        title: title || '',
        description: description || '',
        requirements: [],
        frameworks: new Set()
      };
    }).filter(section => section !== null) as UnifiedSection[];
  }
  
  /**
   * Extract title and description with proper capitalization
   */
  private extractTitleAndDescription(content: string): { title: string; description: string } {
    // Pattern matching for common description indicators
    const patterns = [
      /^(.+?)\s+-\s+(Requirements?:.*)/i,
      /^(.+?)\s+-\s+(Establish\s+.*)/i,
      /^(.+?)\s+-\s+(Implement\s+.*)/i,
      /^(.+?)\s+-\s+(Define\s+.*)/i,
      /^(.+?)\s+-\s+(Ensure\s+.*)/i,
      /^(.+?)\s+-\s+(The\s+organization\s+.*)/i,
      /^(.+?)\s+-\s+([A-Z][a-z]+\s+.*)/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          title: this.formatTitle(match[1]?.trim() || ''),
          description: this.cleanText(match[2]?.trim() || '')
        };
      }
    }
    
    // Fallback
    const dashIndex = content.indexOf(' - ');
    if (dashIndex > -1) {
      return {
        title: this.formatTitle(content.substring(0, dashIndex).trim()),
        description: this.cleanText(content.substring(dashIndex + 3).trim())
      };
    }
    
    return { 
      title: this.formatTitle(content), 
      description: '' 
    };
  }
  
  /**
   * Format title with proper capitalization (not all uppercase)
   */
  private formatTitle(text: string): string {
    return text
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/\b[A-Z]{2,}\b/g, (match) => {
        // Keep acronyms in uppercase
        if (['ISMS', 'IT', 'AI', 'API', 'URL', 'DNS', 'IP', 'VPN', 'SSL', 'TLS', 'CIA', 'NIST', 'ISO', 'CIS', 'GDPR', 'NIS2'].includes(match)) {
          return match;
        }
        // Convert to proper case
        return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      })
      .trim();
  }
  
  /**
   * Get all mapped requirements from database
   */
  async getMappedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<RequirementDetail[]> {
    console.log('[DB-QUERY] 🔍 Getting mapped requirements for category:', categoryName);
    console.log('[DB-QUERY] 🎯 Raw selected frameworks:', selectedFrameworks);
    console.log('[DB-QUERY] 🎚️ CIS IG Level:', cisIGLevel);
    
    const frameworkNames = this.mapFrameworkCodes(selectedFrameworks, cisIGLevel);
    console.log('[DB-QUERY] 📋 Mapped framework names:', frameworkNames);
    
    if (frameworkNames.length === 0) {
      console.warn('[DB-QUERY] ⚠️ No framework names mapped - returning empty');
      return [];
    }
    
    console.log('[DB-QUERY] 🚀 Executing Supabase query with filters:');
    console.log('  - category:', categoryName);
    console.log('  - is_active:', true);
    console.log('  - standards_library.name IN:', frameworkNames);
    
    const { data, error } = await supabase
      .from('requirements_library')
      .select(`
        control_id,
        title,
        description,
        official_description,
        audit_ready_guidance,
        category,
        standards_library!inner(name)
      `)
      .eq('category', categoryName)
      .eq('is_active', true)
      .in('standards_library.name', frameworkNames);
    
    if (error) {
      console.error('[DB-QUERY] ❌ Database query error:', error);
      throw error;
    }
    
    console.log(`[DB-QUERY] ✅ Raw database response: ${data?.length || 0} records`);
    if (data && data.length > 0) {
      console.log('[DB-QUERY] 📊 Sample record structure:', {
        control_id: data[0]?.control_id,
        title_length: (data[0] as any)?.title?.length || 0,
        description_length: (data[0] as any)?.description?.length || 0,
        official_description_length: (data[0] as any)?.official_description?.length || 0,
        audit_ready_guidance_length: (data[0] as any)?.audit_ready_guidance?.length || 0,
        framework: (data[0] as any)?.standards_library?.name,
        category: (data[0] as any)?.category
      });
      
      // Log first few records to see actual content
      console.log('[DB-QUERY] 📝 First 3 records content preview:', data.slice(0, 3).map((req: any) => ({
        control_id: req.control_id,
        title: req.title?.substring(0, 60) + '...' || 'No title',
        has_audit_guidance: !!(req as any).audit_ready_guidance && (req as any).audit_ready_guidance.length > 10,
        audit_guidance_preview: (req as any).audit_ready_guidance?.substring(0, 100) + '...' || 'None',
        has_official_desc: !!(req as any).official_description && (req as any).official_description.length > 10,
        framework: req.standards_library?.name
      })));
    }
    
    const mappedRequirements = (data || []).map((req: any) => ({
      control_id: req.control_id,
      title: req.title,
      description: req.description,
      official_description: req.official_description,
      audit_ready_guidance: req.audit_ready_guidance,
      framework: req.standards_library.name,
      category: req.category
    }));
    
    console.log(`[DB-QUERY] 🎯 Final mapped requirements: ${mappedRequirements.length}`);
    return mappedRequirements;
  }

  /**
   * Get all unified categories from database
   */
  async getAllUnifiedCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('unified_compliance_categories')
      .select('name')
      .order('name');
    
    if (error) throw error;
    return (data || []).map(category => category.name);
  }

  /**
   * Clean text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\*+/g, '')
      .replace(/\s*-\s*/g, ' - ')
      .trim();
  }

  /**
   * Map framework display codes to database names
   */
  private mapFrameworkCodes(selectedFrameworks: string[], cisIGLevel?: string): string[] {
    const frameworkMap: Record<string, string> = {
      'ISO 27001': 'ISO 27001',
      'CIS Controls': cisIGLevel ? `CIS Controls v8 IG${cisIGLevel}` : 'CIS Controls v8',
      'NIST Framework': 'NIST Cybersecurity Framework',
      'SOC 2': 'SOC 2',
      'NIS2 Directive': 'NIS2 Directive'
    };
    
    const mappedFrameworks: string[] = [];
    
    for (const framework of selectedFrameworks) {
      if (frameworkMap[framework]) {
        mappedFrameworks.push(frameworkMap[framework]);
      } else {
        console.warn(`[DATA-SERVICE] Unknown framework: ${framework}`);
        mappedFrameworks.push(framework);
      }
    }
    
    console.log('[DATA-SERVICE] Framework mapping:', {
      input: selectedFrameworks,
      cisIGLevel,
      output: mappedFrameworks
    });
    
    return mappedFrameworks;
  }
}