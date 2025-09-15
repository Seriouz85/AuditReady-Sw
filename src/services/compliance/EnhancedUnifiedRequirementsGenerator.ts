import { supabase } from '../../lib/supabase';

interface RequirementDetail {
  control_id: string;
  title: string;
  description: string;
  official_description?: string;
  audit_ready_guidance?: string;
  framework: string;
  category?: string;
}

interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  requirements: RequirementDetail[];
  combinedText?: string;
  frameworks: Set<string>;
}

interface ValidationResult {
  isValid: boolean;
  missingRequirements: string[];
  coverage: number;
  suggestions: string[];
}

interface ContentValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  actionableScore: number;
  relevanceScore: number;
  technicalDepthScore: number;
}

interface ValidationConfig {
  enabled: boolean;
  minContentLength: number;
  minQualityScore: number;
  requireActionableContent: boolean;
  strictRelevanceCheck: boolean;
  logValidationResults: boolean;
  frameworkSpecificValidation?: boolean;
  preserveHRStructure?: boolean;
  maxSimilarityThreshold?: number;
}

export interface QualityIssue {
  type: 'incomplete_sentence' | 'markdown_leakage' | 'duplicate_content' | 'vague_terminology' | 'broken_content' | 'structure_inconsistency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  lineNumber?: number;
  suggestion?: string;
}

export interface CategoryQualityReport {
  categoryName: string;
  overallScore: number;
  totalIssues: number;
  issues: QualityIssue[];
  subRequirements: {
    id: string;
    title: string;
    score: number;
    issues: QualityIssue[];
  }[];
  recommendations: string[];
}

export interface ComprehensiveQualityReport {
  overallScore: number;
  totalCategories: number;
  totalIssues: number;
  categoriesByScore: CategoryQualityReport[];
  prioritizedActions: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    actions: string[];
  }[];
  statistics: {
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    averageScoreByCategory: number;
  };
  generatedAt: Date;
}

/**
 * Enhanced Unified Requirements Generator
 * 
 * Design Philosophy:
 * 1. Database-driven structure (no hardcoding)
 * 2. Intelligent requirement grouping and combination
 * 3. Professional formatting with proper line breaks
 * 4. Complete requirement coverage validation
 * 5. Scalable for future frameworks
 */
export class EnhancedUnifiedRequirementsGenerator {
  
  /**
   * Main generation method - returns professionally formatted unified requirements
   */
  async generateUnifiedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<{ content: string[]; validation: ValidationResult }> {
    try {
      console.log('[ENHANCED] Generating unified requirements for:', categoryName);
      console.log('[ENHANCED] Selected frameworks:', selectedFrameworks);
      console.log('[ENHANCED] CIS IG Level:', cisIGLevel);
      
      // 1. Get database structure and all mapped requirements
      const [sections, requirements] = await Promise.all([
        this.getDatabaseSections(categoryName),
        this.getMappedRequirements(categoryName, selectedFrameworks, cisIGLevel)
      ]);
      
      console.log(`[ENHANCED] ✅ Found ${sections.length} sections and ${requirements.length} requirements`);
      console.log('[ENHANCED] 📋 Sections structure:', sections.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description.substring(0, 80) + '...'
      })));
      
      // CRITICAL DEBUG: Log FULL requirement details
      console.log('[ENHANCED] 🎯 FULL Requirements found:', requirements.map((r, index) => ({
        index,
        control_id: r.control_id,
        title: r.title,
        framework: r.framework,
        description_length: r.description?.length || 0,
        official_description_length: (r as any).official_description?.length || 0,
        audit_ready_guidance_length: (r as any).audit_ready_guidance?.length || 0,
        has_technical_content: /\.(dll|exe|jar|so)|automated|technical|software|inventory|unauthorized/.test(
          (r.description || (r as any).official_description || '').toLowerCase()
        )
      })));

      // Check if we have any requirements with real content
      const requirementsWithContent = requirements.filter(r => 
        ((r as any).audit_ready_guidance && (r as any).audit_ready_guidance.length > 50) ||
        ((r as any).official_description && (r as any).official_description.length > 50) ||
        (r.description && r.description.length > 50)
      );
      console.log(`[ENHANCED] 📊 Requirements with substantial content: ${requirementsWithContent.length}/${requirements.length}`);
      
      // 2. Smart assignment with requirement combination
      const enhancedSections = await this.assignAndCombineRequirements(sections, requirements);
      
      // 3. Format with professional structure
      const formattedContent = this.formatProfessionalContent(enhancedSections, selectedFrameworks, cisIGLevel);
      
      // 4. Validate completeness
      const validation = this.validateCompleteness(requirements, enhancedSections);
      
      return { content: formattedContent, validation };
      
    } catch (error) {
      console.error('[ENHANCED] Generation failed:', error);
      return { 
        content: [], 
        validation: { 
          isValid: false, 
          missingRequirements: [], 
          coverage: 0, 
          suggestions: ['Failed to generate requirements'] 
        } 
      };
    }
  }
  
  /**
   * Get section structure from database (preserves exact formatting)
   */
  private async getDatabaseSections(categoryName: string): Promise<UnifiedSection[]> {
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
      "h) PERSONNEL SECURITY FRAMEWORK (ISO 27002 Control 6.2: Terms and conditions of employment, Control 6.5: Responsibilities after termination or change of employment) - Implement comprehensive personnel security controls including background verification, confidentiality agreements, and clear responsibilities after employment termination - Conduct appropriate background checks for personnel (ISO 27001 Annex A.6.1) - Include security responsibilities in employment contracts (ISO 27001 Annex A.6.2) - Implement confidentiality and non-disclosure agreements - Define responsibilities after termination or change of employment (ISO 27002 Control 6.5) - Ensure proper return of assets upon employment termination",
      "i) COMPETENCE MANAGEMENT AND DEVELOPMENT - Determine and ensure the necessary competence of persons whose work affects information security performance - Define competency requirements for security-related roles (ISO 27001 Clause 7.2) - Assess current competency levels against requirements (ISO 27001 Clause 7.2) - Provide training and development to address gaps - Maintain records of competency assessments and training",
      "j) COMPLIANCE MONITORING AND OVERSIGHT - Establish monitoring, measurement, analysis and evaluation processes to ensure ongoing compliance with security requirements - Define monitoring processes for security controls effectiveness - Implement regular compliance assessments and audits - Establish metrics and KPIs for security performance - Regular reporting to management on compliance status",
      "k) CHANGE MANAGEMENT GOVERNANCE - Establish formal change management processes for all system modifications affecting information security - Define change approval processes and authorities - Assess security impact of all proposed changes - Implement change testing and validation procedures - Maintain change logs and documentation",
      "l) REGULATORY RELATIONSHIPS MANAGEMENT - Establish and maintain appropriate relationships with regulatory authorities and other external stakeholders - Maintain contact with special interest groups (ISO 27002 Control 5.6) - Establish communication channels with regulatory bodies - Participate in relevant security forums and associations - Monitor regulatory changes and compliance requirements",
      "m) INCIDENT RESPONSE GOVERNANCE STRUCTURE - Establish governance structures for incident response including roles, responsibilities, and escalation procedures - Define incident response team structure and authorities - Establish escalation procedures for critical incidents - Define communication protocols during incidents - Regular testing and updating of incident response procedures",
      "n) THIRD-PARTY GOVERNANCE FRAMEWORK - Implement governance controls for managing information security risks in third-party relationships - Establish supplier risk assessment processes - Define security requirements for third-party agreements - Implement ongoing monitoring of supplier security performance - Regular review and audit of third-party security controls",
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
  private async getMappedRequirements(
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
   * Smart assignment with requirement combination
   */
  private async assignAndCombineRequirements(
    sections: UnifiedSection[],
    requirements: RequirementDetail[]
  ): Promise<UnifiedSection[]> {
    const enhancedSections = [...sections];
    const assignedRequirements = new Set<string>();
    
    console.log(`[ENHANCED] Assigning ${requirements.length} requirements to ${sections.length} sub-sections`);
    
    // Requirements come from CATEGORY level, we need to distribute them to sub-requirements
    // based on content matching
    for (const req of requirements) {
      let bestSection: UnifiedSection | null = null;
      let bestScore = 0;
      
      // Find the BEST matching sub-section for this requirement
      for (const section of enhancedSections) {
        const keywords = this.getSectionKeywords(section.title, section.description);
        const score = this.calculateMatchScore(req, keywords, section);
        
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      }
      
      // Assign to best matching section (or first section if no good match)
      if (bestSection && bestScore > 1) {
        bestSection.requirements.push(req);
        bestSection.frameworks.add(req.framework);
        assignedRequirements.add(req.control_id);
        console.log(`✅ [ENHANCED] Assigned "${req.control_id}" to section "${bestSection.title}" (score: ${bestScore})`);
      } else if (enhancedSections.length > 0) {
        // Fallback: assign to most relevant section based on keywords
        const fallbackSection = this.findBestFallbackSection(req, enhancedSections);
        if (fallbackSection) {
          fallbackSection.requirements.push(req);
          fallbackSection.frameworks.add(req.framework);
          assignedRequirements.add(req.control_id);
          console.log(`🔄 [ENHANCED] Fallback assigned "${req.control_id}" to section "${fallbackSection.title}"`);
        }
      }
    }
    
    // Phase 2: Distribute unassigned requirements (AGGRESSIVE - ensure ALL get assigned)
    const unassigned = requirements.filter(r => !assignedRequirements.has(r.control_id));
    console.log(`[ENHANCED] Phase 2: ${unassigned.length} unassigned requirements to distribute`);
    
    if (unassigned.length > 0 && enhancedSections.length > 0) {
      // If we have unassigned requirements, distribute them across sections
      unassigned.forEach((req, index) => {
        const sectionIndex = index % enhancedSections.length; // Round-robin assignment
        const section = enhancedSections[sectionIndex];
        
        if (section) {
          section.requirements.push(req);
          section.frameworks.add(req.framework);
          assignedRequirements.add(req.control_id);
          
          console.log(`✅ [ENHANCED] Round-robin assigned "${req.control_id}" to section "${section.title}"`);
        }
      });
    }
    
    // Phase 3: Combine similar requirements into coherent text
    for (const section of enhancedSections) {
      section.combinedText = this.combineRequirements(section.requirements);
    }
    
    return enhancedSections;
  }
  
  /**
   * Content validation configuration - can be disabled for testing
   */
  private validationConfig: ValidationConfig = {
    enabled: true,
    minContentLength: 50,
    minQualityScore: 0.6,
    requireActionableContent: true,
    strictRelevanceCheck: true,
    logValidationResults: true
  };

  /**
   * Set validation configuration with enhanced options
   */
  public setValidationConfig(config: Partial<ValidationConfig>): void {
    this.validationConfig = { ...this.validationConfig, ...config };
    console.log('[VALIDATION] Enhanced configuration updated:', this.validationConfig);
    
    // Log framework-specific thresholds when validation is enabled
    if (config.enabled !== false && this.validationConfig.logValidationResults) {
      console.log('[VALIDATION] Framework-specific settings active:', {
        iso_min_length: this.getMinContentLengthForFramework('ISO/IEC 27001'),
        cis_min_length: this.getMinContentLengthForFramework('CIS Controls Implementation Group 1 (IG1)'),
        similarity_thresholds: {
          iso: this.getFrameworkSimilarityThreshold('ISO/IEC 27001'),
          cis: this.getFrameworkSimilarityThreshold('CIS Controls Implementation Group 1 (IG1)')
        }
      });
    }
  }

  /**
   * INJECT REAL DETAILS from user's selected frameworks using ENHANCED VALIDATION
   * Now captures ALL technical details with comprehensive quality checks
   * Enhanced with framework-specific validation and better similarity detection
   */
  private combineRequirements(requirements: RequirementDetail[]): string {
    console.log(`🎯 [COMBINE] Starting enhanced combination for ${requirements.length} requirements`);
    
    if (requirements.length === 0) {
      console.log(`🎯 [COMBINE] No requirements - returning empty string`);
      return ''; // NO generic text - leave empty if no real requirements found
    }
    
    // Enhanced tracking for better deduplication and quality control
    const uniqueDetails = new Map<string, { content: string; framework: string; score: number }>();
    const processedKeywords = new Set<string>();
    const frameworkCoverage = new Map<string, number>();
    
    // Sort requirements by framework to ensure balanced coverage
    const sortedRequirements = this.sortRequirementsByFramework(requirements);
    
    sortedRequirements.forEach((req, index) => {
      console.log(`🔍 [COMBINE] Processing requirement ${index + 1}/${sortedRequirements.length}: ${req.control_id}`);
      
      // Get the BEST available source with prioritized selection
      const bestSource = this.selectBestContentSource(req);
      console.log(`📊 [COMBINE] Selected content source for ${req.control_id}:`, {
        source_type: this.getSourceType(req, bestSource),
        source_length: bestSource.length,
        framework: req.framework
      });
      
      // Enhanced validation pipeline with framework-specific rules
      const contentValidation = this.validateContentWithFrameworkContext(bestSource, req, requirements);
      
      if (this.validationConfig.enabled && !contentValidation.isValid) {
        if (this.validationConfig.logValidationResults) {
          console.log(`❌ [VALIDATION] Content failed enhanced validation for ${req.control_id}:`, {
            qualityScore: contentValidation.qualityScore,
            actionableScore: contentValidation.actionableScore,
            relevanceScore: contentValidation.relevanceScore,
            technicalDepthScore: contentValidation.technicalDepthScore,
            issues: contentValidation.issues
          });
        }
        return; // Skip invalid content
      }
      
      if (bestSource.length < this.getMinContentLengthForFramework(req.framework)) {
        console.log(`⚠️ [COMBINE] Skipping ${req.control_id} - source too short for framework ${req.framework}`);
        return;
      }
      
      if (this.validationConfig.logValidationResults && contentValidation.isValid) {
        console.log(`✅ [VALIDATION] Content passed enhanced validation for ${req.control_id}:`, {
          qualityScore: contentValidation.qualityScore,
          actionableScore: contentValidation.actionableScore,
          relevanceScore: contentValidation.relevanceScore,
          technicalDepthScore: contentValidation.technicalDepthScore,
          framework: req.framework
        });
      }
      
      // Enhanced concept extraction with framework awareness
      const keyConcepts = this.extractFrameworkAwareKeyConcepts(bestSource, req.framework);
      console.log(`🏷️ [COMBINE] Framework-aware key concepts for ${req.control_id}:`, keyConcepts.slice(0, 3));
      
      // More intelligent duplicate detection with similarity scoring
      const similarityScore = this.calculateContentSimilarity(bestSource, Array.from(uniqueDetails.values()).map(d => d.content));
      
      if (similarityScore < this.getFrameworkSimilarityThreshold(req.framework)) {
        console.log(`✨ [COMBINE] Processing unique content for ${req.control_id} (similarity: ${similarityScore.toFixed(2)})`);
        
        // Extract framework-specific details with enhanced logic
        const extractedDetail = this.extractFrameworkSpecificDetails(bestSource, req);
        console.log(`🎯 [COMBINE] Extracted framework-specific detail for ${req.control_id}:`, {
          raw_length: extractedDetail?.length || 0,
          framework: req.framework,
          preview: extractedDetail?.substring(0, 150) + '...' || 'None'
        });
        
        if (extractedDetail && extractedDetail.trim().length > 15) {
          const cleanDetail = this.cleanText(extractedDetail);
          console.log(`🧹 [COMBINE] Clean detail for ${req.control_id}:`, {
            clean_length: cleanDetail.length,
            framework: req.framework,
            preview: cleanDetail.substring(0, 150) + '...'
          });
          
          // Store with enhanced metadata for better selection
          const bulletPoint = `• ${cleanDetail}`;
          uniqueDetails.set(req.control_id, {
            content: bulletPoint,
            framework: req.framework,
            score: contentValidation.qualityScore
          });
          
          // Update framework coverage tracking
          frameworkCoverage.set(req.framework, (frameworkCoverage.get(req.framework) || 0) + 1);
          
          console.log(`✅ [COMBINE] Added unique detail for ${req.control_id}: "${bulletPoint.substring(0, 120)}..."`);
          
          // Mark enhanced concepts as processed
          keyConcepts.forEach(c => processedKeywords.add(c));
        } else {
          console.log(`⚠️ [COMBINE] No valid extracted detail for ${req.control_id}`);
        }
      } else {
        console.log(`🔄 [COMBINE] Skipping similar content for ${req.control_id} (similarity: ${similarityScore.toFixed(2)})`);
      }
      
      // Dynamic limit based on framework diversity
      const maxDetails = this.calculateMaxDetailsForFrameworks(frameworkCoverage);
      if (uniqueDetails.size >= maxDetails) {
        console.log(`🚫 [COMBINE] Reached optimal limit of ${maxDetails} details - stopping`);
        return;
      }
    });
    
    // Sort final results by quality score and framework balance
    const sortedDetails = this.sortDetailsByQualityAndBalance(uniqueDetails, frameworkCoverage);
    const result = sortedDetails.join('\n');
    
    console.log(`✅ [COMBINE] Final enhanced result:`, {
      unique_details: uniqueDetails.size,
      total_chars: result.length,
      framework_coverage: Object.fromEntries(frameworkCoverage),
      avg_quality_score: Array.from(uniqueDetails.values()).reduce((sum, d) => sum + d.score, 0) / uniqueDetails.size
    });
    
    return result;
  }
  
  
  /**
   * SIMPLIFIED: No concept extraction filtering - preserve all content as-is
   * This method now just returns the full text for content comparison
   */
  private extractEnhancedKeyConcepts(text: string): string[] {
    // Return the full text for similarity comparison - no filtering
    // This ensures we don't lose any technical details through concept extraction
    return [text.substring(0, 200)]; // Just use first part for similarity matching
  }
  
  
  /**
   * Enhanced similarity check - stricter to avoid losing important details
   */
  private isHighlySimilarContent(newContent: string, existingContent: string[]): boolean {
    const newLower = newContent.toLowerCase();
    
    for (const existing of existingContent) {
      const existingLower = existing.toLowerCase();
      
      // Check for very high overlap (more than 70% of meaningful words match)
      const newWords = new Set(newLower.split(/\s+/).filter(w => w.length > 4));
      const existingWords = new Set(existingLower.split(/\s+/).filter(w => w.length > 4));
      
      let matchCount = 0;
      let importantMatchCount = 0;
      
      newWords.forEach(word => {
        if (existingWords.has(word)) {
          matchCount++;
          // Count technical terms more heavily
          if (/^(software|library|control|technical|authorized|unauthorized|dll|exe|ocx|scanning|inventory|verification|signing|automated)/.test(word)) {
            importantMatchCount += 2;
          }
        }
      });
      
      const wordSimilarity = matchCount / Math.max(newWords.size, existingWords.size);
      const importantSimilarity = importantMatchCount / Math.max(newWords.size * 2, existingWords.size * 2);
      
      // More lenient - only block if very high similarity AND important terms overlap
      if (wordSimilarity > 0.7 && importantSimilarity > 0.5) {
        console.log(`🔄 [INJECT] Skipping highly similar content (word: ${Math.round(wordSimilarity * 100)}%, important: ${Math.round(importantSimilarity * 100)}%)`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Extract SPECIFIC technical details from requirement DESCRIPTION field for injection into sub-categories
   * This preserves the original structure but injects actual technical details from database descriptions
   */
  private extractSpecificDetails(requirementText: string, req: RequirementDetail): string {
    console.log(`🔍 [EXTRACT] Processing "${req.control_id}": ${req.title}`);
    console.log(`📝 [EXTRACT] Description text length: ${requirementText.length}`);
    
    if (!requirementText || requirementText.trim().length === 0) {
      console.log(`⚠️ [EXTRACT] Empty description for ${req.control_id}`);
      return `Implement ${req.title?.toLowerCase() || 'security control'}`;
    }
    
    // Clean but preserve the core description content
    const cleanDescription = this.cleanText(requirementText);
    
    // Extract the FIRST sentence which usually contains the core technical requirement
    const sentences = cleanDescription.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || cleanDescription;
    
    // For technical requirements, prefer the complete first sentence if it contains technical details
    const hasTechnicalDetails = /\.(dll|exe|ocx|so)|DLLs?|shared\s+objects?|technical\s+controls?|unauthorized|authorized|library|libraries|software|implement|deploy|establish|maintain|ensure/i.test(firstSentence);
    
    if (hasTechnicalDetails && firstSentence.length > 30 && firstSentence.length < 300) {
      console.log(`✅ [EXTRACT] Using technical first sentence: "${firstSentence}"`);
      return firstSentence;
    }
    
    // Otherwise take a reasonable portion that captures the core requirement
    const excerpt = cleanDescription.length > 200 ? 
      cleanDescription.substring(0, 200).replace(/\s+\S*$/, '...') : 
      cleanDescription;
      
    console.log(`📝 [EXTRACT] Using description excerpt: "${excerpt}"`);
    return excerpt;
  }
  
  
  
  
  /**
   * Format sections into professional content with references
   */
  private formatProfessionalContent(sections: UnifiedSection[], selectedFrameworks: string[], cisIGLevel?: string): string[] {
    console.log(`📝 [FORMAT] Formatting ${sections.length} sections for professional output`);
    
    return sections.map((section, index) => {
      console.log(`🔧 [FORMAT] Processing section ${index + 1}: "${section.id}) ${section.title}"`);
      console.log(`📊 [FORMAT] Section stats:`, {
        id: section.id,
        title_length: section.title.length,
        description_length: section.description.length,
        requirements_count: section.requirements.length,
        frameworks_count: section.frameworks.size,
        combined_text_length: section.combinedText?.length || 0,
        has_combined_text: !!(section.combinedText && section.combinedText.trim().length > 0)
      });
      
      let content = `**${section.id}) ${section.title}**\n\n`;
      
      // Only show description if we have NO requirements (as context)
      // If we have requirements, they will provide the actual content
      if (section.requirements.length > 0) {
        console.log(`✅ [FORMAT] Section has ${section.requirements.length} requirements - using database content`);
        
        // Show the INJECTED content from database requirements
        if (section.combinedText && section.combinedText.trim().length > 0) {
          console.log(`📝 [FORMAT] Using combined text (${section.combinedText.length} chars)`);
          content += section.combinedText;
        } else {
          console.log(`⚠️ [FORMAT] No combined text - using direct requirements formatting`);
          const directContent = this.formatRequirementsDirectly(section.requirements);
          content += directContent;
          console.log(`📄 [FORMAT] Direct content: ${directContent.length} chars`);
        }
        
        // Add framework references
        if (section.frameworks.size > 0) {
          console.log(`🔗 [FORMAT] Adding framework references for ${section.frameworks.size} frameworks`);
          const frameworkRefs = this.buildFrameworkReferences(section.requirements);
          if (frameworkRefs) {
            content += `\n\nFramework References: ${frameworkRefs}`;
            console.log(`✅ [FORMAT] Added references: "${frameworkRefs}"`);
            console.log(`🎯 [DEBUG] Content now contains: "${content.substring(0, 200)}"`);
          } else {
            console.log(`⚠️ [FORMAT] No framework references generated`);
          }
        } else {
          console.log(`⚠️ [FORMAT] No frameworks to reference`);
        }
      } else {
        console.log(`📋 [FORMAT] Section has no requirements - using description as placeholder`);
        // Show the original description as a framework/placeholder
        if (section.description && section.description.trim().length > 0) {
          content += `${section.description}\n`;
          console.log(`📝 [FORMAT] Used description (${section.description.length} chars)`);
          
          // Add framework references even for fallback descriptions
          const selectedFrameworkNames = this.getSelectedFrameworkNames(selectedFrameworks, cisIGLevel);
          if (selectedFrameworkNames.length > 0) {
            const frameworkRefs = selectedFrameworkNames.join(' | ');
            content += `\n\nFramework References: ${frameworkRefs}`;
            console.log(`✅ [FORMAT] Added fallback framework references: "${frameworkRefs}"`);
          }
        } else {
          console.log(`⚠️ [FORMAT] No description available`);
        }
      }
      
      console.log(`🎯 [FORMAT] Final content for section ${section.id}: ${content.length} chars`);
      console.log(`📄 [FORMAT] Content preview: "${content.substring(0, 150)}..."`);
      
      return content;
    });
  }
  
  /**
   * Format requirements directly if combinedText generation failed
   */
  private formatRequirementsDirectly(requirements: RequirementDetail[]): string {
    const formatted: string[] = [];
    
    requirements.slice(0, 5).forEach(req => {
      const bestSource = req.description || (req as any).official_description || '';
      if (bestSource.length > 20) {
        const extracted = this.extractSpecificDetails(bestSource, req);
        if (extracted && extracted.trim().length > 10) {
          formatted.push(`• ${this.cleanText(extracted)}`);
        }
      }
    });
    
    return formatted.join('\n');
  }
  
  /**
   * Build framework references from requirements
   */
  private buildFrameworkReferences(requirements: RequirementDetail[]): string {
    console.log(`🔗 [REFS] Building framework references for ${requirements.length} requirements`);
    
    const refMap = new Map<string, string[]>();
    
    requirements.forEach(req => {
      console.log(`📋 [REFS] Processing: ${req.control_id} (${req.framework})`);
      
      if (!refMap.has(req.framework)) {
        refMap.set(req.framework, []);
        console.log(`🆕 [REFS] Created new framework group: ${req.framework}`);
      }
      const frameworkGroup = refMap.get(req.framework);
      if (frameworkGroup) {
        frameworkGroup.push(req.control_id);
      }
    });
    
    console.log(`📊 [REFS] Framework groups:`, Array.from(refMap.entries()).map(([framework, ids]) => ({
      framework,
      count: ids.length,
      ids: ids.join(', ')
    })));
    
    const references: string[] = [];
    refMap.forEach((controlIds, framework) => {
      const sortedIds = controlIds.sort();
      const reference = `${framework}: ${sortedIds.join(', ')}`;
      references.push(reference);
      console.log(`✅ [REFS] Created reference: ${reference}`);
    });
    
    const result = references.join('; ');
    console.log(`🎯 [REFS] Final framework references: "${result}"`);
    
    return result;
  }
  
  /**
   * Validate requirement coverage
   */
  private validateCompleteness(
    allRequirements: RequirementDetail[],
    sections: UnifiedSection[]
  ): ValidationResult {
    const assignedIds = new Set<string>();
    
    for (const section of sections) {
      section.requirements.forEach(r => assignedIds.add(r.control_id));
    }
    
    const missingRequirements = allRequirements
      .filter(r => !assignedIds.has(r.control_id))
      .map(r => `${r.framework}: ${r.control_id}`);
    
    const coverage = (assignedIds.size / allRequirements.length) * 100;
    
    const suggestions: string[] = [];
    if (coverage < 100) {
      suggestions.push(`${missingRequirements.length} requirements not included in unified view`);
      if (missingRequirements.length > 0) {
        suggestions.push(`Missing: ${missingRequirements.slice(0, 3).join(', ')}${missingRequirements.length > 3 ? '...' : ''}`);
      }
    }
    
    return {
      isValid: coverage >= 95, // Allow 5% margin
      missingRequirements,
      coverage,
      suggestions
    };
  }
  
  
  /**
   * Calculate match score for requirement to section
   */
  private calculateMatchScore(
    req: RequirementDetail,
    keywords: string[],
    section: UnifiedSection
  ): number {
    const reqText = `${req.title} ${req.description}`.toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (reqText.includes(keyword.toLowerCase())) {
        score += keyword.length > 8 ? 3 : 2;
      }
    }
    
    // Bonus for exact title matches
    if (req.title.toLowerCase().includes(section.title.toLowerCase())) {
      score += 5;
    }
    
    return score;
  }
  
  /**
   * Find best fallback section for requirement
   */
  private findBestFallbackSection(req: RequirementDetail, sections: UnifiedSection[]): UnifiedSection | null {
    // Smart fallback based on requirement content
    const reqText = `${req.title} ${req.description}`.toLowerCase();
    
    // Keywords for each typical sub-section
    const sectionPatterns: { [key: string]: string[] } = {
      'inventory': ['inventory', 'discover', 'catalog', 'asset', 'tracking', 'maintain'],
      'control': ['control', 'unauthorized', 'prevent', 'block', 'removal', 'detection'],
      'compliance': ['compliance', 'license', 'licensing', 'legal', 'agreement'],
      'discovery': ['automated', 'discovery', 'scanning', 'tools', 'continuous'],
      'enforcement': ['enforcement', 'allowlist', 'whitelist', 'approved', 'policy'],
      'libraries': ['library', 'libraries', 'third-party', 'components', 'dependencies'],
      'script': ['script', 'executable', 'powershell', 'macro', 'code execution']
    };
    
    let bestSection: UnifiedSection | null = null;
    let bestMatchCount = 0;
    
    for (const section of sections) {
      let matchCount = 0;
      const sectionTitle = section.title.toLowerCase();
      
      // Check each pattern group
      for (const [pattern, keywords] of Object.entries(sectionPatterns)) {
        if (sectionTitle.includes(pattern)) {
          // Count keyword matches
          for (const keyword of keywords) {
            if (reqText.includes(keyword)) {
              matchCount++;
            }
          }
        }
      }
      
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestSection = section;
      }
    }
    
    // If still no match, use the first section as ultimate fallback
    return bestSection || sections[0] || null;
  }
  
  
  /**
   * Get keywords for section matching
   */
  private getSectionKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];
    
    // Extract meaningful words (>3 chars, not common words)
    const commonWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'shall', 'must', 'should']);
    const words = text.split(/\s+/).filter(w => w.length > 3 && !commonWords.has(w));
    
    keywords.push(...words);
    
    // Add domain-specific keywords based on title
    const domainKeywords: { [key: string]: string[] } = {
      'leadership': ['management', 'commitment', 'responsibility', 'executive'],
      'scope': ['boundary', 'definition', 'coverage', 'isms'],
      'policy': ['procedure', 'documentation', 'framework', 'standard'],
      'personnel': ['employee', 'staff', 'human', 'screening', 'training'],
      'asset': ['inventory', 'disposal', 'equipment', 'resource'],
      'risk': ['assessment', 'analysis', 'treatment', 'evaluation'],
      'incident': ['response', 'emergency', 'escalation', 'breach'],
      'access': ['control', 'authorization', 'authentication', 'identity'],
      'third': ['party', 'supplier', 'vendor', 'contractor', 'outsourcing']
    };
    
    for (const [key, values] of Object.entries(domainKeywords)) {
      if (text.includes(key)) {
        keywords.push(...values);
      }
    }
    
    return Array.from(new Set(keywords));
  }
  
  /**
   * Clean text for presentation - remove asterisks, fix capitalization, remove repetitive sentences
   */
  private cleanText(text: string): string {
    return text
      // Remove asterisks
      .replace(/\*+/g, '')
      // Fix capitalization - convert ALL CAPS to proper case
      .replace(/\b[A-Z]{2,}\b/g, (match) => {
        // Keep common acronyms in uppercase
        if (['ISMS', 'IT', 'AI', 'API', 'URL', 'DNS', 'IP', 'VPN', 'SSL', 'TLS', 'CIA', 'NIST', 'ISO', 'CIS', 'GDPR', 'NIS2'].includes(match)) {
          return match;
        }
        // Convert to proper case
        return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      })
      // Remove repetitive implementation guidance sentences
      .replace(/Implementation guidance will be provided based on your selected compliance frameworks\.?\s*/gi, '')
      .replace(/\s*Implementation guidance will be provided.*?\.\s*/gi, '')
      // Clean up whitespace and periods
      .replace(/\s+/g, ' ')
      .replace(/^Requirements?:\s*/i, '')
      .replace(/\.+$/, '') // Remove trailing periods
      .trim();
  }
  
  /**
   * Get selected framework names for display
   */
  private getSelectedFrameworkNames(frameworks: string[], cisIGLevel?: string): string[] {
    const names: string[] = [];
    
    if (frameworks.includes('iso27001')) names.push('ISO 27001');
    if (frameworks.includes('iso27002')) names.push('ISO 27002');
    if (frameworks.includes('nis2')) names.push('NIS2');
    if (frameworks.includes('gdpr')) names.push('GDPR');
    
    if (frameworks.includes('cisControls') && cisIGLevel) {
      if (cisIGLevel === 'ig1') names.push('CIS IG1');
      if (cisIGLevel === 'ig2') names.push('CIS IG2');
      if (cisIGLevel === 'ig3') names.push('CIS IG3');
    }
    
    return names;
  }

  /**
   * Legacy content validation - maintained for backward compatibility
   */
  private validateContent(content: string, req: RequirementDetail, allRequirements: RequirementDetail[]): ContentValidationResult {
    // Delegate to the enhanced validation method
    return this.validateContentWithFrameworkContext(content, req, allRequirements);
  }

  /**
   * Enhanced content quality validation with framework-specific criteria
   */
  private validateContentQuality(content: string, framework?: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;
    
    // Framework-specific minimum length requirements
    const minLength = this.getMinContentLengthForFramework(framework || '');
    if (content.length < minLength) {
      issues.push(`Content too short for ${framework || 'standard'} requirements (${content.length} < ${minLength})`);
      score -= 0.3;
    }

    // Enhanced generic/placeholder content detection
    const genericPatterns = [
      /implementation guidance will be provided/i,
      /to be determined/i,
      /placeholder/i,
      /lorem ipsum/i,
      /example content/i,
      /\[insert [^\]]+\]/i,
      /\{[^}]+\}/,
      /TBD|TODO|FIXME/i,
      /sample text/i,
      /dummy content/i
    ];

    let genericPenalty = 0;
    for (const pattern of genericPatterns) {
      if (pattern.test(content)) {
        issues.push('Contains generic/placeholder content');
        genericPenalty = Math.max(genericPenalty, 0.4);
      }
    }
    score -= genericPenalty;

    // Enhanced sentence structure validation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length === 0) {
      issues.push('No complete sentences found');
      score -= 0.25;
    } else if (sentences.length === 1 && content.length > 100) {
      issues.push('Insufficient sentence structure for content length');
      score -= 0.1;
    }

    // More sophisticated repetition detection
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordCounts = new Map<string, number>();
    const significantWords = new Set<string>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
        if (this.isSignificantTechnicalWord(cleanWord)) {
          significantWords.add(cleanWord);
        }
      }
    });

    // Check for excessive repetition but allow technical terms
    let maxRepetition = 0;
    let repetitiveWord = '';
    wordCounts.forEach((count, word) => {
      if (count > maxRepetition && !significantWords.has(word)) {
        maxRepetition = count;
        repetitiveWord = word;
      }
    });
    
    const repetitionRatio = maxRepetition / Math.max(words.length, 1);
    if (repetitionRatio > 0.25 && maxRepetition > 3) {
      issues.push(`Excessive repetition of word '${repetitiveWord}' (${maxRepetition} times)`);
      score -= Math.min(0.3, repetitionRatio);
    }

    // Bonus for technical complexity and specificity
    const technicalComplexity = this.assessTechnicalComplexity(content);
    if (technicalComplexity > 0.7) {
      score = Math.min(1.0, score + 0.1);
    }

    // Penalty for overly generic language
    const genericLanguageRatio = this.calculateGenericLanguageRatio(content);
    if (genericLanguageRatio > 0.6) {
      issues.push('Content contains too much generic language');
      score -= 0.15;
    }

    return { score: Math.max(0, Math.min(1.0, score)), issues };
  }

  /**
   * Enhanced actionability validation with framework-specific requirements
   */
  private validateActionability(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    // Framework-specific action requirements
    const frameworkActionThresholds = {
      'ISO/IEC 27001': 2,
      'ISO/IEC 27002': 3,
      'CIS Controls Implementation Group 1 (IG1)': 4,
      'CIS Controls Implementation Group 2 (IG2)': 4,
      'CIS Controls Implementation Group 3 (IG3)': 5,
      'NIS2 Directive': 3,
      'GDPR': 2,
      'default': 2
    };

    // Enhanced action word patterns with categories
    const actionPatterns = {
      implementation: /\b(implement|establish|deploy|install|configure|setup|initialize|activate|enable)\b/gi,
      maintenance: /\b(maintain|update|patch|upgrade|refresh|sustain|preserve|keep)\b/gi,
      governance: /\b(define|create|develop|document|establish|formalize|approve|authorize)\b/gi,
      monitoring: /\b(monitor|review|assess|audit|evaluate|check|inspect|examine|track)\b/gi,
      enforcement: /\b(control|restrict|prevent|block|deny|limit|constrain|enforce|ensure)\b/gi,
      detection: /\b(detect|identify|discover|find|locate|recognize|scan|search)\b/gi,
      response: /\b(respond|react|address|handle|manage|resolve|remediate|correct)\b/gi,
      verification: /\b(test|validate|verify|confirm|prove|demonstrate|show|evidence)\b/gi
    };

    // Enhanced imperative patterns
    const imperativePatterns = [
      /\b(must|shall|should|will|need to|required to|obligated to)\s+\w+/gi,
      /\b(organization|entity|system)\s+(must|shall|should|will)/gi,
      /\b(procedures?|processes?|controls?|policies?|standards?|measures?)\s+(must|shall|should)/gi
    ];

    let totalActionMatches = 0;
    const actionCategories = new Set<string>();
    
    // Count matches in each action category
    Object.entries(actionPatterns).forEach(([category, pattern]) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        totalActionMatches += matches.length;
        actionCategories.add(category);
      }
    });

    // Count imperative matches
    let imperativeMatches = 0;
    for (const pattern of imperativePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        imperativeMatches += matches.length;
      }
    }

    // Calculate base actionability score
    const requiredActions = frameworkActionThresholds[req.framework as keyof typeof frameworkActionThresholds] || frameworkActionThresholds.default;
    const actionScore = Math.min(1.0, (totalActionMatches + imperativeMatches) / requiredActions);
    
    // Category diversity bonus
    const diversityBonus = actionCategories.size >= 3 ? 0.2 : actionCategories.size >= 2 ? 0.1 : 0;
    
    score = Math.min(1.0, actionScore + diversityBonus);

    // Enhanced technical instruction validation
    const technicalInstructions = [
      /\.(exe|dll|so|jar|msi|deb|rpm|dmg)\b/gi,
      /\b(configure|parameter|setting|option|flag|property|attribute)\b/gi,
      /\b(automated|manual|scan|inventory|list|catalog|enumerate)\b/gi,
      /\b(command|script|tool|utility|software|application)\b/gi,
      /\b(database|registry|file|directory|folder|path)\b/gi,
      /\b(network|port|protocol|service|daemon|process)\b/gi
    ];

    let technicalScore = 0;
    for (const pattern of technicalInstructions) {
      const matches = content.match(pattern);
      if (matches) {
        technicalScore += matches.length * 0.05;
      }
    }
    
    score = Math.min(1.0, score + Math.min(0.3, technicalScore));

    // Specific scoring feedback
    if (score >= 0.8) {
      // High actionability - no issues
    } else if (score >= 0.6) {
      issues.push('Content has moderate actionability but could be more specific');
    } else if (score >= 0.4) {
      issues.push('Content lacks sufficient actionable guidance');
    } else {
      issues.push('Content provides minimal actionable guidance');
      if (totalActionMatches === 0) {
        issues.push('No clear action words found');
      }
      if (imperativeMatches === 0) {
        issues.push('No imperative statements found');
      }
    }

    // Framework-specific penalties
    if (req.framework.includes('CIS Controls') && technicalScore < 0.1) {
      issues.push('CIS Controls require more technical specificity');
      score *= 0.8;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Enhanced relevance validation with contextual category matching
   */
  private validateCategoryRelevance(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0.4; // Start with baseline score
    const contentLower = content.toLowerCase();
    
    // Enhanced title term extraction and weighting
    const titleTerms = this.extractWeightedKeyTerms(req.title || '');
    let weightedTitleScore = 0;
    let titleMatchDetails: string[] = [];
    
    titleTerms.forEach(({ term, weight }) => {
      if (contentLower.includes(term.toLowerCase())) {
        weightedTitleScore += weight;
        titleMatchDetails.push(`${term}(${weight.toFixed(1)})`);
      }
    });
    
    const maxTitleWeight = titleTerms.reduce((sum, t) => sum + t.weight, 0);
    const titleRelevance = maxTitleWeight > 0 ? weightedTitleScore / maxTitleWeight : 0;
    score = Math.max(score, titleRelevance * 0.8);
    
    if (this.validationConfig.logValidationResults && titleMatchDetails.length > 0) {
      console.log(`🎯 [RELEVANCE] Title matches for ${req.control_id}:`, titleMatchDetails.join(', '));
    }

    // Enhanced category-specific validation with subcategories
    const categoryAnalysis = this.analyzeCategoryRelevance(content, req.category || '');
    score += categoryAnalysis.score * 0.4;
    
    if (categoryAnalysis.issues.length > 0) {
      issues.push(...categoryAnalysis.issues);
    }
    
    // Framework-specific terminology with context
    const frameworkAnalysis = this.analyzeFrameworkTerminology(content, req.framework);
    score += frameworkAnalysis.score * 0.2;
    
    // Contextual relevance - check for HR-specific terms in Governance category
    if (req.category === 'Governance & Leadership') {
      const hrTerms = [
        'personnel', 'employee', 'staff', 'human resources', 'competence', 'training',
        'screening', 'background check', 'employment', 'termination', 'confidentiality',
        'roles', 'responsibilities', 'job description', 'skills', 'qualifications'
      ];
      
      let hrMatches = 0;
      hrTerms.forEach(term => {
        if (contentLower.includes(term)) {
          hrMatches++;
        }
      });
      
      if (hrMatches > 0) {
        const hrBonus = Math.min(0.15, hrMatches * 0.03);
        score += hrBonus;
        console.log(`👥 [RELEVANCE] HR relevance bonus for ${req.control_id}: +${hrBonus.toFixed(2)} (${hrMatches} matches)`);
      }
    }
    
    // Penalty for off-topic content
    const offTopicPenalty = this.detectOffTopicContent(content, req);
    if (offTopicPenalty > 0) {
      issues.push('Content may contain off-topic information');
      score -= offTopicPenalty;
    }
    
    // Context-aware scoring adjustments
    const contextScore = this.assessContextualRelevance(content, req);
    score = Math.min(1.0, score + contextScore);
    
    // Final validation with detailed feedback
    if (score < 0.3) {
      issues.push(`Low relevance to ${req.category} category and ${req.framework} framework`);
    } else if (score < 0.5 && this.validationConfig.strictRelevanceCheck) {
      issues.push(`Moderate relevance - may need more specific content for ${req.category}`);
    }

    return { score: Math.max(0, Math.min(1.0, score)), issues };
  }

  /**
   * Validate technical depth and specificity
   */
  private validateTechnicalDepth(content: string, req: RequirementDetail): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0.3; // Start with low baseline

    // Technical terminology indicators
    const technicalPatterns = [
      /\b(system|software|application|database|network|server|infrastructure|platform)s?\b/gi,
      /\b(security|encryption|authentication|authorization|access|control|monitoring)\b/gi,
      /\b(configuration|implementation|deployment|integration|management)\b/gi,
      /\b(automated|manual|process|procedure|workflow|protocol)\b/gi,
      /\b(audit|compliance|assessment|evaluation|review|validation)\b/gi
    ];

    let technicalMatches = 0;
    for (const pattern of technicalPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        technicalMatches += matches.length;
      }
    }

    // Calculate technical depth score
    if (technicalMatches >= 5) {
      score = 1.0;
    } else if (technicalMatches >= 3) {
      score = 0.8;
    } else if (technicalMatches >= 1) {
      score = 0.6;
    } else {
      issues.push('Lacks technical depth or specific terminology');
      score = 0.3;
    }

    // Bonus for specific file types, commands, or tools
    const specificPatterns = [
      /\.(exe|dll|so|jar|msi|dmg|deb|rpm)\b/gi,
      /\b(PowerShell|bash|cmd|registry|GPO|LDAP|API|SQL|HTTP|HTTPS)\b/gi,
      /\b(Windows|Linux|macOS|Active Directory|Azure|AWS|Docker|Kubernetes)\b/gi
    ];

    for (const pattern of specificPatterns) {
      if (pattern.test(content)) {
        score = Math.min(1.0, score + 0.1);
      }
    }

    return { score, issues };
  }

  /**
   * Extract key terms from text for relevance checking
   */
  private extractKeyTerms(text: string): string[] {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'shall', 'must', 'should', 'will', 'can', 'may'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 terms
  }

  /**
   * Get category-specific validation patterns
   */
  private getCategorySpecificPatterns(category: string): RegExp[] {
    const categoryPatterns: { [key: string]: RegExp[] } = {
      'Software Asset Management': [
        /\b(software|application|license|inventory|asset)\b/gi,
        /\b(unauthorized|approved|whitelist|blacklist)\b/gi,
        /\b(executable|binary|script|library)\b/gi
      ],
      'Governance & Leadership': [
        /\b(policy|governance|leadership|management|oversight)\b/gi,
        /\b(responsibility|accountability|authority|commitment)\b/gi,
        /\b(board|executive|senior|management)\b/gi
      ],
      'Access Control': [
        /\b(access|authentication|authorization|identity)\b/gi,
        /\b(user|account|privilege|permission|rights?)\b/gi,
        /\b(login|password|credential|token|certificate)\b/gi
      ],
      'Network Security': [
        /\b(network|firewall|router|switch|gateway)\b/gi,
        /\b(traffic|packet|protocol|port|connection)\b/gi,
        /\b(intrusion|detection|prevention|monitoring)\b/gi
      ]
    };

    return categoryPatterns[category] || [];
  }

  /**
   * Get framework-specific terminology
   */
  private getFrameworkSpecificTerms(framework: string): string[] {
    const frameworkTerms: { [key: string]: string[] } = {
      'ISO/IEC 27001': ['ISMS', 'clause', 'annex', 'control objective', 'risk assessment'],
      'ISO/IEC 27002': ['control', 'safeguard', 'countermeasure', 'security measure'],
      'CIS Controls Implementation Group 1 (IG1)': ['CIS', 'implementation group', 'safeguard', 'sub-control'],
      'CIS Controls Implementation Group 2 (IG2)': ['CIS', 'implementation group', 'safeguard', 'sub-control'],
      'CIS Controls Implementation Group 3 (IG3)': ['CIS', 'implementation group', 'safeguard', 'sub-control'],
      'NIS2 Directive': ['essential entity', 'important entity', 'cybersecurity', 'incident reporting'],
      'GDPR': ['data protection', 'personal data', 'controller', 'processor', 'consent'],
      'DORA (Digital Operational Resilience Act)': ['operational resilience', 'ICT risk', 'financial entity']
    };

    return frameworkTerms[framework] || [];
  }

  /**
   * Map framework codes to database names
   */
  private mapFrameworkCodes(selectedFrameworks: string[], cisIGLevel?: string): string[] {
    console.log('[MAPPING] 🗂️ Mapping framework codes:', { selectedFrameworks, cisIGLevel });
    
    const frameworkNames: string[] = [];
    
    if (selectedFrameworks.includes('iso27001')) {
      frameworkNames.push('ISO/IEC 27001');
      console.log('[MAPPING] ✅ Added ISO/IEC 27001');
    }
    if (selectedFrameworks.includes('iso27002')) {
      frameworkNames.push('ISO/IEC 27002');
      console.log('[MAPPING] ✅ Added ISO/IEC 27002');
    }
    if (selectedFrameworks.includes('nis2')) {
      frameworkNames.push('NIS2 Directive');
      console.log('[MAPPING] ✅ Added NIS2 Directive');
    }
    if (selectedFrameworks.includes('gdpr')) {
      frameworkNames.push('GDPR');
      console.log('[MAPPING] ✅ Added GDPR');
    }
    if (selectedFrameworks.includes('cisControls')) {
      if (cisIGLevel === 'ig1') {
        frameworkNames.push('CIS Controls Implementation Group 1 (IG1)');
        console.log('[MAPPING] ✅ Added CIS Controls IG1');
      } else if (cisIGLevel === 'ig2') {
        frameworkNames.push('CIS Controls Implementation Group 2 (IG2)');
        console.log('[MAPPING] ✅ Added CIS Controls IG2');
      } else if (cisIGLevel === 'ig3') {
        frameworkNames.push('CIS Controls Implementation Group 3 (IG3)');
        console.log('[MAPPING] ✅ Added CIS Controls IG3');
      } else {
        // If no specific IG level, add all (but this should rarely happen)
        frameworkNames.push(
          'CIS Controls Implementation Group 1 (IG1)',
          'CIS Controls Implementation Group 2 (IG2)', 
          'CIS Controls Implementation Group 3 (IG3)'
        );
        console.log('[MAPPING] ✅ Added all CIS Controls IG levels');
      }
    }
    if (selectedFrameworks.includes('dora')) {
      frameworkNames.push('DORA (Digital Operational Resilience Act)');
      console.log('[MAPPING] ✅ Added DORA');
    }
    
    console.log('[MAPPING] 🎯 Final mapped framework names:', frameworkNames);
    return frameworkNames;
  }

  /**
   * Enhanced helper methods for improved validation
   */
  
  private sortRequirementsByFramework(requirements: RequirementDetail[]): RequirementDetail[] {
    // Sort to ensure balanced framework representation
    const frameworkGroups = new Map<string, RequirementDetail[]>();
    requirements.forEach(req => {
      if (!frameworkGroups.has(req.framework)) {
        frameworkGroups.set(req.framework, []);
      }
      frameworkGroups.get(req.framework)!.push(req);
    });
    
    // Interleave requirements from different frameworks
    const sorted: RequirementDetail[] = [];
    const maxGroupSize = Math.max(...Array.from(frameworkGroups.values()).map(g => g.length));
    
    for (let i = 0; i < maxGroupSize; i++) {
      frameworkGroups.forEach(group => {
        if (group[i]) {
          sorted.push(group[i]);
        }
      });
    }
    
    return sorted;
  }
  
  private selectBestContentSource(req: RequirementDetail): string {
    // Prioritize audit_ready_guidance > official_description > description
    const sources = [
      { content: (req as any).audit_ready_guidance, type: 'audit_ready_guidance' },
      { content: (req as any).official_description, type: 'official_description' },
      { content: req.description, type: 'description' }
    ];
    
    for (const source of sources) {
      if (source.content && source.content.length > 20) {
        return source.content;
      }
    }
    
    return '';
  }
  
  private getSourceType(req: RequirementDetail, selectedSource: string): string {
    if ((req as any).audit_ready_guidance === selectedSource) return 'audit_ready_guidance';
    if ((req as any).official_description === selectedSource) return 'official_description';
    if (req.description === selectedSource) return 'description';
    return 'unknown';
  }
  
  private validateContentWithFrameworkContext(content: string, req: RequirementDetail, allRequirements: RequirementDetail[]): ContentValidationResult {
    if (!this.validationConfig.enabled) {
      return {
        isValid: true,
        qualityScore: 1.0,
        issues: [],
        actionableScore: 1.0,
        relevanceScore: 1.0,
        technicalDepthScore: 1.0
      };
    }
    
    const issues: string[] = [];
    
    // Enhanced validation with framework context
    const qualityResult = this.validateContentQuality(content, req.framework);
    const actionabilityResult = this.validateActionability(content, req);
    const relevanceResult = this.validateCategoryRelevance(content, req);
    const technicalResult = this.validateTechnicalDepth(content, req);
    
    // Collect all issues
    issues.push(...qualityResult.issues, ...actionabilityResult.issues, 
                ...relevanceResult.issues, ...technicalResult.issues);
    
    const overallScore = (qualityResult.score + actionabilityResult.score + 
                         relevanceResult.score + technicalResult.score) / 4;
    
    const isValid = overallScore >= this.validationConfig.minQualityScore &&
                   (!this.validationConfig.requireActionableContent || actionabilityResult.score >= 0.5) &&
                   (!this.validationConfig.strictRelevanceCheck || relevanceResult.score >= 0.5);
    
    return {
      isValid,
      qualityScore: overallScore,
      issues,
      actionableScore: actionabilityResult.score,
      relevanceScore: relevanceResult.score,
      technicalDepthScore: technicalResult.score
    };
  }
  
  private getMinContentLengthForFramework(framework: string): number {
    const frameworkLengths: { [key: string]: number } = {
      'ISO/IEC 27001': 40,
      'ISO/IEC 27002': 50,
      'CIS Controls Implementation Group 1 (IG1)': 60,
      'CIS Controls Implementation Group 2 (IG2)': 60,
      'CIS Controls Implementation Group 3 (IG3)': 70,
      'NIS2 Directive': 45,
      'GDPR': 35,
      'default': 30
    };
    
    return frameworkLengths[framework] || frameworkLengths.default;
  }
  
  private extractFrameworkAwareKeyConcepts(content: string, framework: string): string[] {
    // Framework-specific concept extraction
    const concepts: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Base technical concepts
    const baseConcepts = content.split(/[\s,;.!?]+/).filter(word => 
      word.length > 4 && /[a-z]/.test(word)
    ).slice(0, 10);
    
    concepts.push(...baseConcepts);
    
    // Framework-specific enhancements
    if (framework.includes('CIS Controls')) {
      // Extract specific technical terms for CIS
      const cisPatterns = /\b(safeguard|ig[123]|implementation|group|control|sub-control)\b/gi;
      const cisMatches = content.match(cisPatterns) || [];
      concepts.push(...cisMatches);
    }
    
    return Array.from(new Set(concepts));
  }
  
  private calculateContentSimilarity(newContent: string, existingContents: string[]): number {
    if (existingContents.length === 0) return 0;
    
    const newWords = new Set(newContent.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    let maxSimilarity = 0;
    
    existingContents.forEach(existing => {
      const existingWords = new Set(existing.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const intersection = new Set(Array.from(newWords).filter(w => existingWords.has(w)));
      const union = new Set([...Array.from(newWords), ...Array.from(existingWords)]);
      const similarity = intersection.size / Math.max(union.size, 1);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });
    
    return maxSimilarity;
  }
  
  private getFrameworkSimilarityThreshold(framework: string): number {
    // Different similarity thresholds for different frameworks
    const thresholds: { [key: string]: number } = {
      'ISO/IEC 27001': 0.6,
      'ISO/IEC 27002': 0.65,
      'CIS Controls Implementation Group 1 (IG1)': 0.5, // Allow more CIS content
      'CIS Controls Implementation Group 2 (IG2)': 0.5,
      'CIS Controls Implementation Group 3 (IG3)': 0.5,
      'NIS2 Directive': 0.7,
      'GDPR': 0.75,
      'default': 0.65
    };
    
    return thresholds[framework] || thresholds.default;
  }
  
  private extractFrameworkSpecificDetails(content: string, req: RequirementDetail): string {
    // Enhanced extraction with framework awareness
    const cleanContent = this.cleanText(content);
    
    // Framework-specific extraction logic
    if (req.framework.includes('CIS Controls')) {
      return this.extractCISSpecificDetails(cleanContent, req);
    } else if (req.framework.includes('ISO')) {
      return this.extractISOSpecificDetails(cleanContent, req);
    } else {
      return this.extractSpecificDetails(content, req);
    }
  }
  
  private extractCISSpecificDetails(content: string, req: RequirementDetail): string {
    // Prefer technical implementation details for CIS
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Look for sentences with technical terms
    const technicalSentences = sentences.filter(s => 
      /\b(software|executable|dll|inventory|automated|scan|tool|configuration)\b/i.test(s)
    );
    
    if (technicalSentences.length > 0) {
      return technicalSentences[0].trim();
    }
    
    return sentences[0]?.trim() || content;
  }
  
  private extractISOSpecificDetails(content: string, req: RequirementDetail): string {
    // Prefer process and control descriptions for ISO
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Look for sentences with control language
    const controlSentences = sentences.filter(s => 
      /\b(control|process|procedure|policy|manage|establish|maintain)\b/i.test(s)
    );
    
    if (controlSentences.length > 0) {
      return controlSentences[0].trim();
    }
    
    return sentences[0]?.trim() || content;
  }
  
  private calculateMaxDetailsForFrameworks(frameworkCoverage: Map<string, number>): number {
    // Dynamic limit based on framework diversity
    const frameworkCount = frameworkCoverage.size;
    return Math.min(10, Math.max(6, frameworkCount * 2));
  }
  
  private sortDetailsByQualityAndBalance(uniqueDetails: Map<string, { content: string; framework: string; score: number }>, frameworkCoverage: Map<string, number>): string[] {
    // Sort by quality score while maintaining framework balance
    const detailsArray = Array.from(uniqueDetails.values());
    
    // Sort by score descending
    detailsArray.sort((a, b) => b.score - a.score);
    
    return detailsArray.map(d => d.content);
  }
  
  private isSignificantTechnicalWord(word: string): boolean {
    const technicalTerms = new Set([
      'system', 'software', 'network', 'security', 'access', 'control', 'policy',
      'procedure', 'process', 'management', 'monitoring', 'audit', 'compliance',
      'risk', 'assessment', 'implementation', 'configuration', 'authentication',
      'authorization', 'encryption', 'data', 'information', 'infrastructure'
    ]);
    
    return technicalTerms.has(word.toLowerCase());
  }
  
  private assessTechnicalComplexity(content: string): number {
    // Assess technical complexity based on terminology density
    const technicalPatterns = [
      /\b(algorithm|protocol|architecture|framework|implementation)\b/gi,
      /\b(configuration|parameter|specification|requirement|criteria)\b/gi,
      /\b(automated|systematic|comprehensive|integrated|coordinated)\b/gi
    ];
    
    let matches = 0;
    technicalPatterns.forEach(pattern => {
      const found = content.match(pattern);
      if (found) matches += found.length;
    });
    
    const words = content.split(/\s+/).length;
    return Math.min(1.0, (matches * 10) / Math.max(words, 1));
  }
  
  private calculateGenericLanguageRatio(content: string): number {
    const genericWords = [
      'appropriate', 'adequate', 'sufficient', 'necessary', 'relevant',
      'suitable', 'effective', 'efficient', 'proper', 'correct', 'good',
      'important', 'significant', 'various', 'different', 'multiple',
      'several', 'many', 'some', 'certain', 'particular'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    const genericCount = words.filter(word => genericWords.includes(word)).length;
    
    return genericCount / Math.max(words.length, 1);
  }
  
  private extractWeightedKeyTerms(title: string): Array<{ term: string; weight: number }> {
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const terms: Array<{ term: string; weight: number }> = [];
    
    words.forEach(word => {
      let weight = 1.0;
      
      // Higher weight for technical terms
      if (/^(software|system|control|security|management|personnel|competence)/.test(word)) {
        weight = 1.5;
      }
      
      // Higher weight for specific nouns
      if (/^(inventory|framework|governance|leadership|training)/.test(word)) {
        weight = 1.3;
      }
      
      terms.push({ term: word, weight });
    });
    
    return terms;
  }
  
  private analyzeCategoryRelevance(content: string, category: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    const categoryPatterns = this.getCategorySpecificPatterns(category);
    let categoryMatches = 0;
    
    for (const pattern of categoryPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        categoryMatches += matches.length;
      }
    }
    
    if (categoryMatches > 0) {
      score = Math.min(0.4, categoryMatches * 0.08);
    } else if (categoryPatterns.length > 0) {
      issues.push(`Limited relevance to ${category} category`);
    }
    
    return { score, issues };
  }
  
  private analyzeFrameworkTerminology(content: string, framework: string): { score: number } {
    const frameworkTerms = this.getFrameworkSpecificTerms(framework);
    let matches = 0;
    
    frameworkTerms.forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        matches++;
      }
    });
    
    return {
      score: Math.min(0.2, matches * 0.05)
    };
  }
  
  private detectOffTopicContent(content: string, req: RequirementDetail): number {
    // Detect content that seems unrelated to the requirement
    const offTopicPatterns = [
      /\b(cooking|recipes?|food|restaurant|travel|vacation|sports?|entertainment)\b/gi,
      /\b(weather|climate|seasons?|holidays?|personal|family|social)\b/gi
    ];
    
    let penalty = 0;
    for (const pattern of offTopicPatterns) {
      if (pattern.test(content)) {
        penalty += 0.2;
      }
    }
    
    return Math.min(0.5, penalty);
  }
  
  private assessContextualRelevance(content: string, req: RequirementDetail): number {
    // Assess how well content fits the specific requirement context
    let bonus = 0;
    
    // Bonus for alignment with requirement ID patterns
    if (req.control_id && content.toLowerCase().includes(req.control_id.toLowerCase())) {
      bonus += 0.05;
    }
    
    // Bonus for contextual alignment
    if (req.category === 'Software Asset Management' && 
        /\b(software|application|executable|library)\b/gi.test(content)) {
      bonus += 0.1;
    }
    
    if (req.category === 'Governance & Leadership' && 
        /\b(governance|leadership|management|oversight|policy)\b/gi.test(content)) {
      bonus += 0.1;
    }
    
    return Math.min(0.2, bonus);
  }

  // ============================================================================
  // COMPREHENSIVE CONTENT QUALITY ANALYSIS SYSTEM
  // ============================================================================

  /**
   * Performs comprehensive quality analysis on all unified requirements content
   */
  async generateComprehensiveQualityReport(): Promise<ComprehensiveQualityReport> {
    console.log('[QUALITY-ANALYSIS] 🔍 Starting comprehensive content quality analysis');
    
    try {
      // Get all categories from the database
      const categories = await this.getAllUnifiedCategories();
      console.log(`[QUALITY-ANALYSIS] 📋 Found ${categories.length} categories to analyze`);
      
      const categoryReports: CategoryQualityReport[] = [];
      let totalIssues = 0;
      const issuesByType: Record<string, number> = {};
      const issuesBySeverity: Record<string, number> = {};
      
      // Analyze each category
      for (const category of categories) {
        console.log(`[QUALITY-ANALYSIS] 🎯 Analyzing category: ${category}`);
        const categoryReport = await this.analyzeCategory(category);
        categoryReports.push(categoryReport);
        
        totalIssues += categoryReport.totalIssues;
        
        // Aggregate statistics
        categoryReport.issues.forEach(issue => {
          issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
          issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
        });
        
        categoryReport.subRequirements.forEach(subReq => {
          subReq.issues.forEach(issue => {
            issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
            issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
          });
        });
      }
      
      // Sort categories by score (worst first)
      categoryReports.sort((a, b) => a.overallScore - b.overallScore);
      
      const overallScore = categoryReports.reduce((sum, cat) => sum + cat.overallScore, 0) / categoryReports.length;
      const averageScoreByCategory = overallScore;
      
      // Generate prioritized action items
      const prioritizedActions = this.generatePrioritizedActions(categoryReports, issuesBySeverity);
      
      const report: ComprehensiveQualityReport = {
        overallScore: Math.round(overallScore * 100) / 100,
        totalCategories: categoryReports.length,
        totalIssues,
        categoriesByScore: categoryReports,
        prioritizedActions,
        statistics: {
          issuesByType,
          issuesBySeverity,
          averageScoreByCategory: Math.round(averageScoreByCategory * 100) / 100
        },
        generatedAt: new Date()
      };
      
      console.log('[QUALITY-ANALYSIS] ✅ Comprehensive analysis complete:', {
        overallScore: report.overallScore,
        totalCategories: report.totalCategories,
        totalIssues: report.totalIssues,
        criticalIssues: issuesBySeverity.critical || 0
      });
      
      return report;
    } catch (error) {
      console.error('[QUALITY-ANALYSIS] ❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get all unified requirement categories from database
   */
  private async getAllUnifiedCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('unified_compliance_categories')
      .select('name')
      .eq('is_active', true)
      .order('name');
      
    if (error) {
      console.error('[QUALITY-ANALYSIS] Database query error:', error);
      throw error;
    }
    
    return data?.map((row: any) => row.name as string) || [];
  }

  /**
   * Analyze a specific category for quality issues
   */
  private async analyzeCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[QUALITY-ANALYSIS] 📊 Analyzing category: ${categoryName}`);
    
    // Get the database structure for this category
    const sections = await this.getDatabaseSections(categoryName);
    console.log(`[QUALITY-ANALYSIS] 📋 Found ${sections.length} sub-requirements for ${categoryName}`);
    
    const categoryIssues: QualityIssue[] = [];
    const subRequirementReports: CategoryQualityReport['subRequirements'] = [];
    let totalScore = 0;
    
    // Analyze each sub-requirement
    for (const section of sections) {
      const subReqIssues = this.analyzeSubRequirementContent(section, categoryName);
      const subReqScore = this.calculateSubRequirementScore(section, subReqIssues);
      
      subRequirementReports.push({
        id: section.id,
        title: section.title,
        score: subReqScore,
        issues: subReqIssues
      });
      
      totalScore += subReqScore;
    }
    
    // Check for category-level issues
    const categoryStructureIssues = this.analyzeCategoryStructure(sections, categoryName);
    categoryIssues.push(...categoryStructureIssues);
    
    const overallScore = sections.length > 0 ? totalScore / sections.length : 0;
    const totalIssues = categoryIssues.length + subRequirementReports.reduce((sum, sub) => sum + sub.issues.length, 0);
    
    const recommendations = this.generateCategoryRecommendations(categoryIssues, subRequirementReports);
    
    return {
      categoryName,
      overallScore: Math.round(overallScore * 100) / 100,
      totalIssues,
      issues: categoryIssues,
      subRequirements: subRequirementReports,
      recommendations
    };
  }

  /**
   * Analyze content quality issues in a sub-requirement
   */
  private analyzeSubRequirementContent(section: UnifiedSection, categoryName: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const content = `${section.title} ${section.description}`.trim();
    
    if (!content) {
      issues.push({
        type: 'broken_content',
        severity: 'critical',
        description: 'Sub-requirement has no content',
        location: `Section ${section.id}`,
        suggestion: 'Add title and description content'
      });
      return issues;
    }
    
    // Check for incomplete sentences
    const incompleteSentences = this.detectIncompleteSentences(content);
    if (incompleteSentences.length > 0) {
      issues.push({
        type: 'incomplete_sentence',
        severity: 'high',
        description: `Found ${incompleteSentences.length} incomplete sentences`,
        location: `Section ${section.id}`,
        suggestion: 'Complete sentences ending with: ' + incompleteSentences.join(', ')
      });
    }
    
    // Check for markdown leakage
    const markdownIssues = this.detectMarkdownLeakage(content);
    if (markdownIssues.length > 0) {
      issues.push({
        type: 'markdown_leakage',
        severity: 'medium',
        description: 'Found markdown formatting in content',
        location: `Section ${section.id}`,
        suggestion: 'Remove markdown: ' + markdownIssues.join(', ')
      });
    }
    
    // Check for vague terminology
    const vagueTerms = this.detectVagueTerminology(content);
    if (vagueTerms.length > 0) {
      issues.push({
        type: 'vague_terminology',
        severity: 'medium',
        description: `Found vague terminology: ${vagueTerms.join(', ')}`,
        location: `Section ${section.id}`,
        suggestion: 'Replace vague terms with specific requirements'
      });
    }
    
    // Check for repetitive content within the same requirement
    const duplicateContent = this.detectDuplicateContent(content);
    if (duplicateContent.length > 0) {
      issues.push({
        type: 'duplicate_content',
        severity: 'low',
        description: `Found repetitive content: ${duplicateContent.join(', ')}`,
        location: `Section ${section.id}`,
        suggestion: 'Remove or consolidate repetitive content'
      });
    }
    
    // Check content length appropriateness
    const lengthIssues = this.checkContentLength(content);
    if (lengthIssues) {
      issues.push(lengthIssues);
    }
    
    return issues;
  }

  /**
   * Detect incomplete sentences that end with connecting words
   */
  private detectIncompleteSentences(content: string): string[] {
    const incompleteSentences: string[] = [];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const connectingWords = [
      'of', 'to', 'and', 'the', 'for', 'with', 'in', 'on', 'at', 'by', 'from',
      'or', 'but', 'as', 'if', 'when', 'while', 'because', 'since', 'that', 'which'
    ];
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (connectingWords.includes(lastWord)) {
        incompleteSentences.push(`"...${sentence.substring(Math.max(0, sentence.length - 30))}"`);
      }
    });
    
    return incompleteSentences;
  }

  /**
   * Detect markdown formatting leakage
   */
  private detectMarkdownLeakage(content: string): string[] {
    const markdownIssues: string[] = [];
    
    // Check for markdown headers
    if (/#{1,6}\s/.test(content)) {
      markdownIssues.push('Markdown headers (#, ##, ###)');
    }
    
    // Check for specific problematic terms
    if (/auditreadyguidance/i.test(content)) {
      markdownIssues.push('"auditreadyguidance" reference');
    }
    
    if (/executive summary/i.test(content)) {
      markdownIssues.push('"Executive Summary" reference');
    }
    
    // Check for markdown lists
    if (/^\s*[-*+]\s/m.test(content)) {
      markdownIssues.push('Markdown list formatting');
    }
    
    // Check for markdown emphasis
    if (/\*\*.*\*\*|__.*__/.test(content)) {
      markdownIssues.push('Markdown bold formatting (**)'); 
    }
    
    return markdownIssues;
  }

  /**
   * Detect vague terminology without specifics
   */
  private detectVagueTerminology(content: string): string[] {
    const vagueTerms: string[] = [];
    
    const vaguePatterns = [
      { pattern: /\bappropriate\b(?!\s+(controls?|measures?|procedures?|standards?|documentation))/gi, term: 'appropriate (without context)' },
      { pattern: /\bessential entities\b(?!\s+(such as|including|like))/gi, term: 'essential entities (without examples)' },
      { pattern: /\brelevant\b(?!\s+(standards?|frameworks?|regulations?|requirements?))/gi, term: 'relevant (without context)' },
      { pattern: /\badequate\b(?!\s+(controls?|measures?|procedures?))/gi, term: 'adequate (without criteria)' },
      { pattern: /\bnecessary\b(?!\s+(steps?|actions?|measures?))/gi, term: 'necessary (without specifics)' },
      { pattern: /\bsufficient\b(?!\s+(evidence|controls?|measures?))/gi, term: 'sufficient (without criteria)' }
    ];
    
    vaguePatterns.forEach(({ pattern, term }) => {
      if (pattern.test(content)) {
        vagueTerms.push(term);
      }
    });
    
    return vagueTerms;
  }

  /**
   * Detect duplicate content within the same requirement
   */
  private detectDuplicateContent(content: string): string[] {
    const duplicates: string[] = [];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    // Check for repeated phrases (5+ words)
    const phrases = new Map<string, number>();
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      
      // Extract 5-word phrases
      for (let i = 0; i <= words.length - 5; i++) {
        const phrase = words.slice(i, i + 5).join(' ');
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    });
    
    phrases.forEach((count, phrase) => {
      if (count > 1) {
        duplicates.push(`"${phrase}" (${count}x)`);
      }
    });
    
    return duplicates;
  }

  /**
   * Check if content length is appropriate
   */
  private checkContentLength(content: string): QualityIssue | null {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    if (wordCount < 5) {
      return {
        type: 'broken_content',
        severity: 'critical',
        description: `Content too short: only ${wordCount} words`,
        suggestion: 'Add more detailed content (minimum 5 words)'
      };
    }
    
    if (wordCount > 200) {
      return {
        type: 'incomplete_sentence',
        severity: 'medium',
        description: `Content too long: ${wordCount} words`,
        suggestion: 'Break into smaller, more focused requirements'
      };
    }
    
    return null;
  }

  /**
   * Analyze category-level structural issues
   */
  private analyzeCategoryStructure(sections: UnifiedSection[], categoryName: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Check for missing sections (should have a-p structure for most categories)
    const sectionIds = new Set(sections.map(s => s.id));
    const expectedSections = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    const missingSections = expectedSections.filter(id => !sectionIds.has(id));
    if (missingSections.length > 0) {
      issues.push({
        type: 'structure_inconsistency',
        severity: 'medium',
        description: `Missing sub-requirements: ${missingSections.join(', ')}`,
        location: `Category: ${categoryName}`,
        suggestion: 'Ensure consistent a-p structure across categories'
      });
    }
    
    // Check for inconsistent section formatting
    const titlesWithoutProperCase = sections.filter(s => 
      s.title && (s.title === s.title.toUpperCase() || s.title === s.title.toLowerCase())
    );
    
    if (titlesWithoutProperCase.length > 0) {
      issues.push({
        type: 'structure_inconsistency',
        severity: 'low',
        description: `${titlesWithoutProperCase.length} titles have inconsistent capitalization`,
        location: `Sections: ${titlesWithoutProperCase.map(s => s.id).join(', ')}`,
        suggestion: 'Use proper title case for all section titles'
      });
    }
    
    return issues;
  }

  /**
   * Calculate quality score for a sub-requirement
   */
  private calculateSubRequirementScore(section: UnifiedSection, issues: QualityIssue[]): number {
    let score = 100; // Start with perfect score
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Additional scoring based on content quality
    const content = `${section.title} ${section.description}`.trim();
    if (content.length < 10) {
      score -= 40; // Severe penalty for very short content
    } else if (content.length < 20) {
      score -= 20; // Moderate penalty for short content
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate category-specific recommendations
   */
  private generateCategoryRecommendations(categoryIssues: QualityIssue[], subRequirements: CategoryQualityReport['subRequirements']): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = categoryIssues.filter(i => i.severity === 'critical').length +
                          subRequirements.reduce((sum, sub) => sum + sub.issues.filter(i => i.severity === 'critical').length, 0);
    
    const highIssues = categoryIssues.filter(i => i.severity === 'high').length +
                      subRequirements.reduce((sum, sub) => sum + sub.issues.filter(i => i.severity === 'high').length, 0);
    
    if (criticalIssues > 0) {
      recommendations.push(`Immediately address ${criticalIssues} critical content issues`);
    }
    
    if (highIssues > 0) {
      recommendations.push(`Review and fix ${highIssues} high-priority content problems`);
    }
    
    const lowScoreSections = subRequirements.filter(sub => sub.score < 60);
    if (lowScoreSections.length > 0) {
      recommendations.push(`Rewrite ${lowScoreSections.length} sub-requirements with scores below 60`);
    }
    
    const incompleteSections = subRequirements.filter(sub => 
      sub.issues.some(issue => issue.type === 'incomplete_sentence')
    );
    if (incompleteSections.length > 0) {
      recommendations.push(`Complete incomplete sentences in sections: ${incompleteSections.map(s => s.id).join(', ')}`);
    }
    
    const markdownSections = subRequirements.filter(sub => 
      sub.issues.some(issue => issue.type === 'markdown_leakage')
    );
    if (markdownSections.length > 0) {
      recommendations.push(`Remove markdown formatting from sections: ${markdownSections.map(s => s.id).join(', ')}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Content quality is good - consider minor improvements for vague terminology');
    }
    
    return recommendations;
  }

  /**
   * Generate prioritized action items across all categories
   */
  private generatePrioritizedActions(
    categoryReports: CategoryQualityReport[], 
    issuesBySeverity: Record<string, number>
  ): ComprehensiveQualityReport['prioritizedActions'] {
    const actions = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[]
    };
    
    // Critical actions
    if (issuesBySeverity.critical > 0) {
      actions.critical.push(`Fix ${issuesBySeverity.critical} critical content issues immediately`);
      
      const brokenCategories = categoryReports.filter(cat => 
        cat.issues.some(i => i.severity === 'critical') || 
        cat.subRequirements.some(sub => sub.issues.some(i => i.severity === 'critical'))
      );
      
      if (brokenCategories.length > 0) {
        actions.critical.push(`Restore broken content in: ${brokenCategories.map(c => c.categoryName).join(', ')}`);
      }
    }
    
    // High priority actions
    if (issuesBySeverity.high > 0) {
      actions.high.push(`Complete ${issuesBySeverity.high} incomplete sentences`);
      
      const lowScoreCategories = categoryReports.filter(cat => cat.overallScore < 50);
      if (lowScoreCategories.length > 0) {
        actions.high.push(`Rewrite categories with scores below 50: ${lowScoreCategories.map(c => c.categoryName).join(', ')}`);
      }
    }
    
    // Medium priority actions
    if (issuesBySeverity.medium > 0) {
      actions.medium.push(`Clean up ${issuesBySeverity.medium} markdown formatting issues`);
      actions.medium.push(`Replace vague terminology with specific requirements`);
    }
    
    // Low priority actions
    if (issuesBySeverity.low > 0) {
      actions.low.push(`Remove ${issuesBySeverity.low} instances of duplicate content`);
      actions.low.push(`Standardize capitalization and formatting`);
    }
    
    // Overall improvements
    const averageScore = categoryReports.reduce((sum, cat) => sum + cat.overallScore, 0) / categoryReports.length;
    if (averageScore < 70) {
      actions.high.push('Conduct comprehensive content review - average score below 70');
    } else if (averageScore < 85) {
      actions.medium.push('Improve content quality - average score below 85');
    }
    
    return [
      { priority: 'critical' as const, actions: actions.critical },
      { priority: 'high' as const, actions: actions.high },
      { priority: 'medium' as const, actions: actions.medium },
      { priority: 'low' as const, actions: actions.low }
    ].filter(item => item.actions.length > 0);
  }

  /**
   * Export quality report as formatted text
   */
  exportQualityReportAsText(report: ComprehensiveQualityReport): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push('COMPREHENSIVE UNIFIED REQUIREMENTS QUALITY REPORT');
    lines.push('='.repeat(80));
    lines.push(`Generated: ${report.generatedAt.toISOString()}`);
    lines.push('');
    
    // Executive Summary
    lines.push('EXECUTIVE SUMMARY');
    lines.push('-'.repeat(40));
    lines.push(`Overall Score: ${report.overallScore}/100`);
    lines.push(`Total Categories: ${report.totalCategories}`);
    lines.push(`Total Issues Found: ${report.totalIssues}`);
    lines.push('');
    
    // Statistics
    lines.push('ISSUE STATISTICS');
    lines.push('-'.repeat(40));
    lines.push('By Severity:');
    Object.entries(report.statistics.issuesBySeverity).forEach(([severity, count]) => {
      lines.push(`  ${severity.toUpperCase()}: ${count}`);
    });
    lines.push('');
    lines.push('By Type:');
    Object.entries(report.statistics.issuesByType).forEach(([type, count]) => {
      lines.push(`  ${type.replace(/_/g, ' ').toUpperCase()}: ${count}`);
    });
    lines.push('');
    
    // Prioritized Actions
    lines.push('PRIORITIZED ACTION ITEMS');
    lines.push('-'.repeat(40));
    report.prioritizedActions.forEach(({ priority, actions }) => {
      if (actions.length > 0) {
        lines.push(`${priority.toUpperCase()} PRIORITY:`);
        actions.forEach(action => {
          lines.push(`  • ${action}`);
        });
        lines.push('');
      }
    });
    
    // Category Details
    lines.push('CATEGORY ANALYSIS (SORTED BY SCORE)');
    lines.push('-'.repeat(40));
    report.categoriesByScore.forEach(category => {
      lines.push(`\n${category.categoryName} - Score: ${category.overallScore}/100`);
      lines.push(`Issues: ${category.totalIssues}`);
      
      if (category.issues.length > 0) {
        lines.push('Category Issues:');
        category.issues.forEach(issue => {
          lines.push(`  [${issue.severity.toUpperCase()}] ${issue.description}`);
          if (issue.suggestion) {
            lines.push(`    Suggestion: ${issue.suggestion}`);
          }
        });
      }
      
      const problemSections = category.subRequirements.filter(sub => sub.issues.length > 0);
      if (problemSections.length > 0) {
        lines.push('Sub-requirement Issues:');
        problemSections.forEach(sub => {
          lines.push(`  Section ${sub.id}) ${sub.title} (Score: ${sub.score}/100)`);
          sub.issues.forEach(issue => {
            lines.push(`    [${issue.severity.toUpperCase()}] ${issue.description}`);
          });
        });
      }
      
      if (category.recommendations.length > 0) {
        lines.push('Recommendations:');
        category.recommendations.forEach(rec => {
          lines.push(`  • ${rec}`);
        });
      }
    });
    
    lines.push('');
    lines.push('='.repeat(80));
    lines.push('End of Report');
    lines.push('='.repeat(80));
    
    return lines.join('\n');
  }

  /**
   * Run quality analysis for a specific category (useful for targeted analysis)
   */
  async analyzeSingleCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[QUALITY-ANALYSIS] 🎯 Running targeted analysis for: ${categoryName}`);
    return await this.analyzeCategory(categoryName);
  }

  /**
   * Get quality scan summary (quick overview without detailed analysis)
   */
  async getQualityScanSummary(): Promise<{
    totalCategories: number;
    categoriesWithIssues: number;
    estimatedTotalIssues: number;
    worstCategories: string[];
  }> {
    console.log('[QUALITY-ANALYSIS] 🔍 Running quick quality scan');
    
    const categories = await this.getAllUnifiedCategories();
    let categoriesWithIssues = 0;
    let estimatedTotalIssues = 0;
    const categoryScores: Array<{ name: string; score: number }> = [];
    
    for (const categoryName of categories.slice(0, 5)) { // Sample first 5 categories
      const sections = await this.getDatabaseSections(categoryName);
      let categoryIssues = 0;
      let categoryScore = 0;
      
      for (const section of sections) {
        const issues = this.analyzeSubRequirementContent(section, categoryName);
        if (issues.length > 0) {
          categoriesWithIssues++;
          break;
        }
        categoryIssues += issues.length;
        categoryScore += this.calculateSubRequirementScore(section, issues);
      }
      
      estimatedTotalIssues += categoryIssues;
      categoryScores.push({
        name: categoryName,
        score: sections.length > 0 ? categoryScore / sections.length : 0
      });
    }
    
    // Extrapolate to all categories
    const totalEstimatedIssues = Math.round(estimatedTotalIssues * (categories.length / 5));
    
    // Sort by score and get worst performing
    categoryScores.sort((a, b) => a.score - b.score);
    const worstCategories = categoryScores.slice(0, 3).map(c => c.name);
    
    return {
      totalCategories: categories.length,
      categoriesWithIssues,
      estimatedTotalIssues: totalEstimatedIssues,
      worstCategories
    };
  }
}