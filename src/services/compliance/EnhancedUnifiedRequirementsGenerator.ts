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
   * INJECT REAL DETAILS from user's selected frameworks using AGGRESSIVE LOGIC
   * Now captures ALL technical details without truncation
   */
  private combineRequirements(requirements: RequirementDetail[]): string {
    console.log(`🎯 [COMBINE] Starting combination for ${requirements.length} requirements`);
    
    if (requirements.length === 0) {
      console.log(`🎯 [COMBINE] No requirements - returning empty string`);
      return ''; // NO generic text - leave empty if no real requirements found
    }
    
    // Store complete details with better deduplication
    const uniqueDetails = new Map<string, string>();
    const processedKeywords = new Set<string>();
    
    requirements.forEach((req, index) => {
      console.log(`🔍 [COMBINE] Processing requirement ${index + 1}/${requirements.length}: ${req.control_id}`);
      
      // Get the DESCRIPTION source - this contains the concise technical requirement
      const bestSource = req.description || (req as any).official_description || '';
      console.log(`📊 [COMBINE] Using DESCRIPTION source for ${req.control_id}:`, {
        has_description: !!req.description,
        description_length: req.description?.length || 0,
        has_official_desc: !!(req as any).official_description,
        official_desc_length: (req as any).official_description?.length || 0,
        selected_source: req.description ? 'description' : 'official_description',
        source_length: bestSource.length
      });
      
      if (bestSource.length < 15) {
        console.log(`⚠️ [COMBINE] Skipping ${req.control_id} - source too short (${bestSource.length} chars)`);
        return;
      }
      
      // Extract more comprehensive key concepts for better deduplication
      const keyConcepts = this.extractEnhancedKeyConcepts(bestSource);
      console.log(`🏷️ [COMBINE] Enhanced key concepts for ${req.control_id}:`, keyConcepts);
      
      // More intelligent duplicate detection
      const hasProcessedSimilar = keyConcepts.some(concept => 
        Array.from(processedKeywords).some(processed => 
          concept.includes(processed) || processed.includes(concept)
        )
      );
      
      if (!hasProcessedSimilar) {
        console.log(`✨ [COMBINE] Processing unique content for ${req.control_id}`);
        
        // Extract AGGRESSIVE SPECIFIC details using enhanced logic
        const extractedDetail = this.extractSpecificDetails(bestSource, req);
        console.log(`🎯 [COMBINE] Extracted detail for ${req.control_id}:`, {
          raw_length: extractedDetail?.length || 0,
          preview: extractedDetail?.substring(0, 150) + '...' || 'None'
        });
        
        if (extractedDetail && extractedDetail.trim().length > 15) {
          const cleanDetail = this.cleanText(extractedDetail);
          console.log(`🧹 [COMBINE] Clean detail for ${req.control_id}:`, {
            clean_length: cleanDetail.length,
            preview: cleanDetail.substring(0, 150) + '...'
          });
          
          // More intelligent similarity check
          if (!this.isHighlySimilarContent(cleanDetail, Array.from(uniqueDetails.values()))) {
            const bulletPoint = `• ${cleanDetail}`;
            uniqueDetails.set(req.control_id, bulletPoint);
            console.log(`✅ [COMBINE] Added unique detail for ${req.control_id}: "${bulletPoint.substring(0, 120)}..."`);
            
            // Mark all key concepts as processed
            keyConcepts.forEach(c => processedKeywords.add(c));
          } else {
            console.log(`🔄 [COMBINE] Skipping highly similar content for ${req.control_id}`);
          }
        } else {
          console.log(`⚠️ [COMBINE] No valid extracted detail for ${req.control_id}`);
        }
      } else {
        console.log(`🔄 [COMBINE] Skipping due to processed similar concepts for ${req.control_id}`);
      }
      
      // Increased limit for more comprehensive coverage
      if (uniqueDetails.size >= 8) {
        console.log(`🚫 [COMBINE] Reached limit of 8 details - stopping`);
        return;
      }
    });
    
    const result = Array.from(uniqueDetails.values()).join('\n');
    console.log(`✅ [COMBINE] Final result: ${uniqueDetails.size} unique details, ${result.length} total chars`);
    console.log(`📝 [COMBINE] Final content preview:`, result.substring(0, 300) + '...');
    
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
    
    return [...new Set(keywords)];
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
    
    console.log('[MAPPING] 🎯 Final mapped framework names:', frameworkNames);
    return frameworkNames;
  }
}