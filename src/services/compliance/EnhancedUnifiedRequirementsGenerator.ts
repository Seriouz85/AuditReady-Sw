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
          ((r as any).audit_ready_guidance || (r as any).official_description || r.description || '').toLowerCase()
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
      const formattedContent = this.formatProfessionalContent(enhancedSections);
      
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
      
      // Get the most detailed source - prioritize audit_ready_guidance for complete details
      const bestSource = (req as any).audit_ready_guidance || (req as any).official_description || req.description || '';
      console.log(`📊 [COMBINE] Best source for ${req.control_id}:`, {
        has_audit_guidance: !!(req as any).audit_ready_guidance,
        audit_guidance_length: (req as any).audit_ready_guidance?.length || 0,
        has_official_desc: !!(req as any).official_description,
        official_desc_length: (req as any).official_description?.length || 0,
        has_description: !!req.description,
        description_length: req.description?.length || 0,
        selected_source: (req as any).audit_ready_guidance ? 'audit_ready_guidance' : 
                        (req as any).official_description ? 'official_description' : 'description',
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
   * Extract comprehensive key concepts for better deduplication
   */
  private extractEnhancedKeyConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    // Extract action phrases with objects (more comprehensive)
    const actionPatterns = [
      /(maintain|implement|establish|deploy|configure|monitor|control|enforce|utilize|employ|use|install|create|develop|ensure|verify|validate)\s+[\w\s]{5,30}/gi,
      /(technical\s+controls?|security\s+controls?|access\s+controls?|application\s+controls?)\s+[\w\s]{5,25}/gi,
      /(software\s+inventory|hardware\s+inventory|asset\s+inventory)\s+[\w\s]{5,25}/gi
    ];
    
    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase().trim()));
      }
    });
    
    // Extract comprehensive technical terms
    const enhancedTechTerms = [
      // File and software terms
      /\b(dll|exe|ocx|so|jar|library|libraries|software\s+libraries|third-party\s+libraries)\b/gi,
      /\b(unauthorized\s+software|approved\s+software|software\s+whitelist|allowlist|blocklist)\b/gi,
      /\b(application\s+whitelisting|endpoint\s+protection|antivirus|anti-malware)\b/gi,
      
      // Control mechanisms
      /\b(digital\s+signing|code\s+signing|hash-based\s+verification|certificate\s+validation)\b/gi,
      /\b(vulnerability\s+scanning|security\s+scanning|automated\s+detection)\b/gi,
      /\b(inventory\s+tools|discovery\s+tools|scanning\s+tools|monitoring\s+tools)\b/gi,
      
      // Process terms
      /\b(automated\s+discovery|continuous\s+monitoring|real-time\s+detection)\b/gi,
      /\b(software\s+categories|software\s+classification|risk\s+assessment)\b/gi
    ];
    
    enhancedTechTerms.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase().trim()));
      }
    });
    
    // Extract file extension mentions
    const fileExtensions = text.match(/\.\w{2,4}\b/g);
    if (fileExtensions && fileExtensions.length > 0) {
      concepts.push(`file extensions: ${[...new Set(fileExtensions)].join(', ')}`);
    }
    
    // Remove duplicates and short concepts
    return [...new Set(concepts)].filter(c => c.length > 5);
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
   * Extract SPECIFIC technical details from requirement text using AGGRESSIVE LOGIC
   * This method now captures ALL technical details without truncation
   */
  private extractSpecificDetails(requirementText: string, req: RequirementDetail): string {
    console.log(`🔍 [EXTRACT] Processing "${req.control_id}": ${req.title}`);
    console.log(`📝 [EXTRACT] Source text length: ${requirementText.length}`);
    
    // Split into sentences for analysis
    const textSentences = requirementText.split(/(?<=[.!?])\s+/);
    
    // 1. HIGHEST PRIORITY: Find sentences with file extensions (.dll, .ocx, .so)
    const fileExtPattern = /\.(dll|exe|ocx|so|jar|war|ear|msi|app|deb|rpm|dmg|pkg|bat|cmd|ps1|vbs|js|py|pl|sh|bin|lib)/i;
    for (const sentence of textSentences) {
      if (fileExtPattern.test(sentence)) {
        // Found a sentence with file extensions - use the FULL sentence!
        const cleanSentence = this.cleanText(sentence);
        console.log(`📂 [EXTRACT] Found file extension sentence: "${cleanSentence}"`);
        
        // Return the complete sentence with technical details
        if (cleanSentence.length > 20) {
          return cleanSentence;
        }
      }
    }
    
    // 2. Look for sentences with specific technical implementations
    const technicalSentencePatterns = [
      /use\s+technical\s+controls\s+to\s+[^.]+/i,
      /implement\s+[^.]*\s+(control|signing|verification|scanning|monitoring)[^.]*/i,
      /deploy\s+[^.]*\s+(tools?|systems?|controls?)[^.]*/i,
      /establish\s+[^.]*\s+(procedures?|standards?|controls?)[^.]*/i,
      /block\s+unauthorized\s+[^.]*/i,
      /ensure\s+that\s+only\s+[^.]*/i,
      /reassess\s+[^.]+/i,
      /maintain\s+[^.]+\s+(inventory|library|software)[^.]*/i
    ];
    
    for (const sentence of textSentences) {
      for (const pattern of technicalSentencePatterns) {
        if (pattern.test(sentence)) {
          const cleanSentence = this.cleanText(sentence);
          console.log(`🔧 [EXTRACT] Found technical sentence: "${cleanSentence}"`);
          
          if (cleanSentence.length > 30) {
            return cleanSentence;
          }
        }
      }
    }
    
    // 3. Look for any sentence with key technical terms and good length
    for (const sentence of textSentences) {
      const cleanSentence = this.cleanText(sentence);
      const lowerSentence = cleanSentence.toLowerCase();
      
      // Check for important technical keywords and reasonable length
      if (cleanSentence.length > 40 && cleanSentence.length < 300) {
        const hasImportantTerms = [
          'software', 'technical', 'control', 'authorized', 'unauthorized',
          'library', 'libraries', 'automated', 'security', 'scanning',
          'verification', 'signing', 'inventory', 'deployment'
        ].some(term => lowerSentence.includes(term));
        
        if (hasImportantTerms) {
          console.log(`🎯 [EXTRACT] Found good technical sentence: "${cleanSentence}"`);
          return cleanSentence;
        }
      }
    }
    
    // 4. Fallback: Use the first meaningful sentence that's not too short
    for (const sentence of textSentences) {
      const cleanSentence = this.cleanText(sentence);
      if (cleanSentence.length > 25 && cleanSentence.length < 250) {
        console.log(`🔄 [EXTRACT] Using fallback sentence: "${cleanSentence}"`);
        return cleanSentence;
      }
    }
    
    // 5. Last resort: Take first part of requirement text
    const fallbackText = this.cleanText(requirementText.substring(0, 150));
    console.log(`📋 [EXTRACT] Using fallback text: "${fallbackText}"`);
    return fallbackText + (requirementText.length > 150 ? '...' : '');
  }
  
  
  
  
  /**
   * Format sections into professional content with references
   */
  private formatProfessionalContent(sections: UnifiedSection[]): string[] {
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
            content += `\n\n**Framework References:** ${frameworkRefs}`;
            console.log(`✅ [FORMAT] Added references: "${frameworkRefs}"`);
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
      const bestSource = (req as any).audit_ready_guidance || (req as any).official_description || req.description || '';
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