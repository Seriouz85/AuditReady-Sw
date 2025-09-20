import { supabase } from '../../lib/supabase';

interface RequirementDetail {
  control_id: string;
  title: string;
  description: string;
  official_description?: string;
  audit_ready_guidance?: string;
  framework: string;
}

interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  unifiedText: string;
  frameworks: string[];
}

/**
 * Intelligent Unified Requirements Generator
 * Creates truly unified requirements by:
 * 1. Preserving existing section structure and titles
 * 2. Intelligently combining similar requirements from different frameworks
 * 3. Using proper grammar and unified sentences
 * 4. One topic per row with proper sectioning
 */
export class IntelligentUnifiedRequirementsGenerator {
  
  /**
   * Generate intelligent unified requirements that preserve structure
   */
  async generateIntelligentUnifiedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<string[]> {
    try {
      console.log('[INTELLIGENT UNIFIED] Generating for:', categoryName);
      
      // First, get the existing unified structure from database
      const existingStructure = await this.getExistingUnifiedStructure(categoryName);
      console.log('[INTELLIGENT UNIFIED] Found existing sections:', existingStructure.length);
      
      // Get all requirements for the selected frameworks
      const frameworkRequirements = await this.getFrameworkRequirements(
        categoryName, 
        selectedFrameworks, 
        cisIGLevel
      );
      console.log('[INTELLIGENT UNIFIED] Found framework requirements:', frameworkRequirements.length);
      
      // Create intelligent unified content for each section
      const unifiedSections = await this.createIntelligentUnifiedSections(
        existingStructure,
        frameworkRequirements
      );
      
      // Format for UI display
      const formattedSections = unifiedSections.map(section => {
        return `${section.id}) ${section.title}\n${section.description}\n\nUnified Implementation:\n${section.unifiedText}\n\n[${section.frameworks.join(' | ')}]`;
      });
      
      console.log('[INTELLIGENT UNIFIED] Generated', formattedSections.length, 'unified sections');
      return formattedSections;
      
    } catch (error) {
      console.error('[INTELLIGENT UNIFIED] Generation failed:', error);
      return [];
    }
  }
  
  /**
   * Get existing unified structure from database - extract EXACT titles and content
   */
  private async getExistingUnifiedStructure(categoryName: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('unified_requirements')
      .select(`
        title,
        description,
        sub_requirements,
        unified_compliance_categories!inner(name)
      `)
      .eq('unified_compliance_categories.name', categoryName);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn('[INTELLIGENT UNIFIED] No existing structure found for:', categoryName);
      return [];
    }
    
    // Parse the sub-requirements to extract individual sections with EXACT titles
    const subRequirements = data[0].sub_requirements || [];
    const sections: any[] = [];
    
    subRequirements.forEach((subReq: string) => {
      // Extract section letter and EXACT title - match everything up to " -" or " ("
      const match = subReq.match(/^([a-p])\)\s+([^-\(]+?)(?:\s*-|\s*\(|$)/i);
      if (match) {
        const [, letter, title] = match;
        
        // Get the EXACT title by cleaning up whitespace but preserving the full title
        const exactTitle = title.trim().replace(/\s+/g, ' ');
        
        sections.push({
          id: letter.toLowerCase(),
          title: exactTitle,
          originalContent: subReq,
          fullSection: subReq
        });
        
        console.log(`[EXACT TITLE] ${letter}) ${exactTitle}`);
      }
    });
    
    return sections;
  }
  
  /**
   * Get ONLY framework-specific requirements that are BOTH selected AND mapped to this category
   */
  private async getFrameworkRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<RequirementDetail[]> {
    // First, check which frameworks are actually mapped to this category
    const { data: mappedFrameworks, error: mappedError } = await supabase
      .from('requirements_library')
      .select(`standards_library!inner(name)`)
      .eq('category', categoryName)
      .eq('is_active', true);
      
    if (mappedError) throw mappedError;
    
    const actuallyMappedFrameworks = new Set(
      (mappedFrameworks || []).map((req: any) => req.standards_library.name)
    );
    
    console.log('[MAPPED FRAMEWORKS]', categoryName, 'has:', Array.from(actuallyMappedFrameworks));
    
    // Convert selected framework codes to names, but ONLY include those that are actually mapped
    const selectedFrameworkNames = this.mapFrameworkCodesToNames(selectedFrameworks, cisIGLevel);
    const validFrameworkNames = selectedFrameworkNames.filter(name => 
      actuallyMappedFrameworks.has(name)
    );
    
    console.log('[VALID FRAMEWORKS]', 'Selected:', selectedFrameworkNames, 'Valid:', validFrameworkNames);
    
    if (validFrameworkNames.length === 0) {
      console.warn('[NO VALID FRAMEWORKS] No selected frameworks are mapped to category:', categoryName);
      return [];
    }
    
    // Get requirements ONLY from frameworks that are both selected AND mapped to this category
    const { data, error } = await supabase
      .from('requirements_library')
      .select(`
        control_id,
        title,
        description,
        official_description,
        audit_ready_guidance,
        standards_library!inner(name)
      `)
      .eq('category', categoryName)
      .eq('is_active', true)
      .in('standards_library.name', validFrameworkNames);
    
    if (error) throw error;
    
    const requirements = (data || []).map((req: any) => ({
      control_id: String(req.control_id || ''),
      title: String(req.title || ''),
      description: String(req.description || ''),
      official_description: String(req.official_description || ''),
      audit_ready_guidance: String(req.audit_ready_guidance || ''),
      framework: String(req.standards_library?.name || '')
    }));
    
    console.log('[FINAL REQUIREMENTS]', categoryName, 'found', requirements.length, 'requirements from', validFrameworkNames.length, 'frameworks');
    
    return requirements;
  }
  
  /**
   * Map framework codes to database names
   */
  private mapFrameworkCodesToNames(frameworks: string[], cisIGLevel?: string): string[] {
    const names: string[] = [];
    
    if (frameworks.includes('iso27001')) names.push('ISO/IEC 27001');
    if (frameworks.includes('iso27002')) names.push('ISO/IEC 27002');
    if (frameworks.includes('nis2')) names.push('NIS2 Directive');
    if (frameworks.includes('gdpr')) names.push('GDPR');
    
    if (frameworks.includes('cisControls') && cisIGLevel) {
      if (cisIGLevel === 'ig1') names.push('CIS Controls Implementation Group 1 (IG1)');
      if (cisIGLevel === 'ig2') names.push('CIS Controls Implementation Group 2 (IG2)');
      if (cisIGLevel === 'ig3') names.push('CIS Controls Implementation Group 3 (IG3)');
    }
    
    return names;
  }
  
  /**
   * Create intelligent unified sections - ensure each requirement appears in ONLY ONE section
   */
  private async createIntelligentUnifiedSections(
    existingSections: any[],
    frameworkRequirements: RequirementDetail[]
  ): Promise<UnifiedSection[]> {
    const unifiedSections: UnifiedSection[] = [];
    const usedRequirements = new Set<string>(); // Track which requirements have been used
    
    console.log(`[SECTION CREATION] Processing ${existingSections.length} sections with ${frameworkRequirements.length} total requirements`);
    
    // First pass: assign each requirement to its BEST matching section
    const sectionAssignments = this.assignRequirementsToSections(existingSections, frameworkRequirements);
    
    for (const section of existingSections) {
      // Get requirements assigned specifically to this section (no duplicates)
      const sectionRequirements = sectionAssignments.get(section.id) || [];
      
      console.log(`[SECTION ${section.id}] ${section.title}: ${sectionRequirements.length} requirements`);
      
      // Create intelligent unified text from assigned requirements
      const unifiedText = this.createIntelligentUnifiedText(section, sectionRequirements);
      
      // Get framework references for this section only
      const frameworks = this.getFrameworkReferences(sectionRequirements);
      
      unifiedSections.push({
        id: section.id,
        title: section.title,
        description: this.extractCleanDescription(section.originalContent),
        unifiedText,
        frameworks
      });
      
      // Mark these requirements as used
      sectionRequirements.forEach(req => usedRequirements.add(req.control_id));
    }
    
    console.log(`[ASSIGNMENTS COMPLETE] Used ${usedRequirements.size} out of ${frameworkRequirements.length} requirements`);
    
    return unifiedSections;
  }
  
  /**
   * Assign each requirement to its BEST matching section (no duplicates)
   */
  private assignRequirementsToSections(
    sections: any[],
    requirements: RequirementDetail[]
  ): Map<string, RequirementDetail[]> {
    const assignments = new Map<string, RequirementDetail[]>();
    
    // Initialize empty arrays for each section
    sections.forEach(section => assignments.set(section.id, []));
    
    // For each requirement, find its BEST matching section
    requirements.forEach(req => {
      let bestSection = null;
      let bestScore = 0;
      
      sections.forEach(section => {
        const score = this.calculateSectionMatchScore(section, req);
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      });
      
      // Assign to best matching section (or first section if no good match)
      const targetSection = bestSection || sections[0];
      if (targetSection) {
        assignments.get(targetSection.id)!.push(req);
        console.log(`[ASSIGNMENT] ${req.control_id} → ${targetSection.id}) ${targetSection.title} (score: ${bestScore})`);
      }
    });
    
    return assignments;
  }
  
  /**
   * Calculate how well a requirement matches a specific section
   */
  private calculateSectionMatchScore(section: any, req: RequirementDetail): number {
    const sectionText = `${section.title} ${section.originalContent}`.toLowerCase();
    const reqText = `${req.title} ${req.description} ${req.official_description || ''}`.toLowerCase();
    
    let score = 0;
    
    // Get section-specific keywords based on the section title
    const sectionKeywords = this.getSectionSpecificKeywords(section.title.toLowerCase());
    
    // Count keyword matches (higher weight for title matches)
    sectionKeywords.forEach(keyword => {
      if (req.title.toLowerCase().includes(keyword)) score += 10; // Title match = high score
      if (req.description.toLowerCase().includes(keyword)) score += 5; // Description match = medium score
      if ((req.official_description || '').toLowerCase().includes(keyword)) score += 3;
    });
    
    // Penalty for mismatched topics (to prevent cross-contamination)
    const mismatchPenalties = this.getMismatchPenalties(section.title.toLowerCase(), reqText);
    score -= mismatchPenalties;
    
    return Math.max(0, score); // Never negative
  }
  
  /**
   * Get section-specific keywords for better matching
   */
  private getSectionSpecificKeywords(sectionTitle: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'leadership': ['leadership', 'commitment', 'management', 'executive', 'responsibility'],
      'scope': ['scope', 'boundary', 'definition', 'isms', 'coverage'],
      'organizational': ['role', 'responsibility', 'structure', 'organization', 'governance'],
      'policy': ['policy', 'procedure', 'document', 'framework', 'standard'],
      'project': ['project', 'development', 'implementation', 'lifecycle'],
      'asset': ['asset', 'disposal', 'use', 'equipment', 'inventory'],
      'documented': ['document', 'procedure', 'process', 'record'],
      'personnel': ['personnel', 'employee', 'staff', 'human', 'screening', 'background'],
      'competence': ['competence', 'training', 'skill', 'awareness', 'education'],
      'compliance': ['compliance', 'monitoring', 'audit', 'assessment', 'measure'],
      'change': ['change', 'modification', 'update', 'configuration'],
      'regulatory': ['regulatory', 'legal', 'authority', 'relationship'],
      'incident': ['incident', 'response', 'emergency', 'escalation'],
      'third-party': ['third party', 'supplier', 'vendor', 'contractor', 'external'],
      'continuous': ['improvement', 'continual', 'enhancement'],
      'awareness': ['awareness', 'training', 'culture', 'program']
    };
    
    // Find keywords that match the section title
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (sectionTitle.includes(key)) {
        return keywords;
      }
    }
    
    // Default generic keywords
    return ['security', 'information', 'control'];
  }
  
  /**
   * Calculate penalty for requirements that clearly don't belong in this section
   */
  private getMismatchPenalties(sectionTitle: string, reqText: string): number {
    let penalty = 0;
    
    // Define section mismatches to prevent topic mixing
    const mismatchRules = [
      { section: 'third-party', penalizeFor: ['backup', 'recovery', 'continuity', 'access control', 'authentication'] },
      { section: 'personnel', penalizeFor: ['network', 'cryptography', 'backup', 'asset'] },
      { section: 'incident', penalizeFor: ['policy framework', 'asset disposal', 'training'] },
      { section: 'asset', penalizeFor: ['incident response', 'training', 'personnel'] },
      { section: 'policy', penalizeFor: ['incident response', 'backup', 'cryptography'] }
    ];
    
    mismatchRules.forEach(rule => {
      if (sectionTitle.includes(rule.section)) {
        rule.penalizeFor.forEach(penaltyTerm => {
          if (reqText.includes(penaltyTerm)) {
            penalty += 15; // Strong penalty for clear mismatches
          }
        });
      }
    });
    
    return penalty;
  }
  
  // Removed old findRelatedRequirements method - now using assignRequirementsToSections for better assignment
  
  /**
   * Get keywords for different section types
   */
  private getSectionKeywords(sectionTitle: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'leadership': ['leadership', 'commitment', 'management', 'executive', 'accountability', 'responsibility'],
      'scope': ['scope', 'boundary', 'definition', 'isms', 'system', 'coverage'],
      'organizational': ['role', 'responsibility', 'structure', 'organization', 'governance', 'committee'],
      'policy': ['policy', 'procedure', 'document', 'framework', 'standard', 'guideline'],
      'personnel': ['personnel', 'employee', 'staff', 'human resource', 'screening', 'background'],
      'competence': ['competence', 'training', 'skill', 'awareness', 'education', 'development'],
      'compliance': ['compliance', 'monitoring', 'audit', 'assessment', 'review', 'measure'],
      'change': ['change', 'modification', 'update', 'version', 'control'],
      'regulatory': ['regulatory', 'legal', 'requirement', 'authority', 'stakeholder'],
      'incident': ['incident', 'response', 'emergency', 'crisis', 'escalation'],
      'third-party': ['third party', 'supplier', 'vendor', 'contractor', 'outsourcing'],
      'improvement': ['improvement', 'continual', 'enhancement', 'optimization'],
      'awareness': ['awareness', 'training', 'education', 'culture', 'program'],
      'project': ['project', 'development', 'implementation', 'lifecycle'],
      'asset': ['asset', 'disposal', 'use', 'management', 'inventory']
    };
    
    // Find matching keywords based on section title
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (sectionTitle.includes(key)) {
        return keywords;
      }
    }
    
    // Default keywords if no specific match
    return ['security', 'information', 'management', 'control', 'requirement'];
  }
  
  /**
   * Create intelligent unified text using ONLY actual requirement content
   */
  private createIntelligentUnifiedText(section: any, relatedRequirements: RequirementDetail[]): string {
    if (relatedRequirements.length === 0) {
      return 'No requirements from selected frameworks are mapped to this section.';
    }
    
    console.log(`[UNIFIED TEXT] Creating for ${section.title} with ${relatedRequirements.length} requirements`);
    
    // Group requirements by their core action/purpose to avoid repetition
    const actionGroups = this.groupRequirementsByAction(relatedRequirements);
    
    // Create concise, executive-ready sentences from ACTUAL requirement content
    const unifiedSentences: string[] = [];
    
    actionGroups.forEach((requirements, action) => {
      const sentence = this.createExecutiveReadySentence(action, requirements);
      if (sentence) {
        unifiedSentences.push(sentence);
      }
    });
    
    // Join with bullet points for readability
    return unifiedSentences.length > 0 
      ? unifiedSentences.map(s => `• ${s}`).join('\n')
      : 'Implement controls as specified by selected compliance frameworks.';
  }
  
  /**
   * Group requirements by their core action/purpose
   */
  private groupRequirementsByAction(requirements: RequirementDetail[]): Map<string, RequirementDetail[]> {
    const actionGroups = new Map<string, RequirementDetail[]>();
    
    requirements.forEach(req => {
      // Extract the core action from the requirement
      const action = this.extractCoreAction(req);
      
      if (!actionGroups.has(action)) {
        actionGroups.set(action, []);
      }
      actionGroups.get(action)!.push(req);
    });
    
    console.log(`[ACTION GROUPS]`, Array.from(actionGroups.keys()));
    return actionGroups;
  }
  
  /**
   * Extract core action from requirement text
   */
  private extractCoreAction(req: RequirementDetail): string {
    const fullText = `${req.title} ${req.description} ${req.official_description || ''}`.toLowerCase();
    
    // Define action patterns with their unified labels
    const actionPatterns = [
      { patterns: ['policy', 'policies', 'procedure', 'document'], action: 'establish_policies' },
      { patterns: ['training', 'awareness', 'education', 'competence'], action: 'provide_training' },
      { patterns: ['monitor', 'measurement', 'review', 'audit', 'assess'], action: 'monitor_controls' },
      { patterns: ['incident', 'response', 'emergency', 'breach'], action: 'manage_incidents' },
      { patterns: ['access', 'authorization', 'authentication', 'permission'], action: 'control_access' },
      { patterns: ['risk', 'threat', 'vulnerability', 'assessment'], action: 'manage_risks' },
      { patterns: ['backup', 'recovery', 'continuity', 'restore'], action: 'ensure_continuity' },
      { patterns: ['third party', 'supplier', 'vendor', 'contractor'], action: 'manage_suppliers' },
      { patterns: ['change', 'configuration', 'update', 'modification'], action: 'manage_changes' },
      { patterns: ['personnel', 'employee', 'staff', 'human'], action: 'manage_personnel' },
      { patterns: ['asset', 'inventory', 'equipment', 'disposal'], action: 'manage_assets' },
      { patterns: ['cryptography', 'encryption', 'key'], action: 'implement_cryptography' },
      { patterns: ['network', 'communication', 'transmission'], action: 'secure_networks' },
      { patterns: ['physical', 'environment', 'facility'], action: 'secure_facilities' },
      { patterns: ['compliance', 'regulatory', 'legal', 'requirement'], action: 'ensure_compliance' }
    ];
    
    // Find the most specific action
    for (const { patterns, action } of actionPatterns) {
      for (const pattern of patterns) {
        if (fullText.includes(pattern)) {
          return action;
        }
      }
    }
    
    // Default action
    return 'implement_controls';
  }
  
  /**
   * Create executive-ready sentence from requirements of same action
   */
  private createExecutiveReadySentence(action: string, requirements: RequirementDetail[]): string {
    if (requirements.length === 0) return '';
    
    // Get the best description from the requirements
    const bestContent = this.getBestRequirementContent(requirements);
    
    // Create executive-friendly sentence based on action type
    const actionTemplates: { [key: string]: string } = {
      'establish_policies': 'Establish and maintain documented policies and procedures',
      'provide_training': 'Implement security awareness training and competence development programs',
      'monitor_controls': 'Monitor, measure, and regularly review security control effectiveness',
      'manage_incidents': 'Establish incident response procedures with clear escalation protocols',
      'control_access': 'Implement access control mechanisms with proper authorization',
      'manage_risks': 'Conduct risk assessments and implement appropriate risk treatment measures',
      'ensure_continuity': 'Establish backup and business continuity procedures',
      'manage_suppliers': 'Implement supplier security requirements and ongoing monitoring',
      'manage_changes': 'Establish change management processes with security impact assessment',
      'manage_personnel': 'Implement personnel security controls including background verification',
      'manage_assets': 'Maintain asset inventory with secure disposal procedures',
      'implement_cryptography': 'Implement appropriate cryptographic controls and key management',
      'secure_networks': 'Secure network communications and infrastructure',
      'secure_facilities': 'Implement physical and environmental security controls',
      'ensure_compliance': 'Ensure compliance with applicable regulatory requirements',
      'implement_controls': 'Implement appropriate security controls'
    };
    
    const baseText = actionTemplates[action] || actionTemplates['implement_controls'];
    
    // Add specific details from the actual requirements if available
    if (bestContent) {
      return `${baseText} ${bestContent}`;
    }
    
    return baseText;
  }
  
  /**
   * Get the most useful content from a group of requirements - NO TRUNCATION
   */
  private getBestRequirementContent(requirements: RequirementDetail[]): string {
    // Find the most specific and useful description
    let bestDescription = '';
    let bestScore = 0;
    
    requirements.forEach(req => {
      // Priority order: audit_ready_guidance > official_description > description
      const descriptions = [
        { text: req.audit_ready_guidance, weight: 3 },
        { text: req.official_description, weight: 2 },
        { text: req.description, weight: 1 }
      ];
      
      descriptions.forEach(({ text, weight }) => {
        if (text && text.trim().length > 0) {
          // Score based on weight and useful content indicators
          let score = weight;
          
          // Bonus for specific terms that indicate actionable content
          const actionableTerms = ['implement', 'establish', 'maintain', 'ensure', 'define', 'develop'];
          actionableTerms.forEach(term => {
            if (text.toLowerCase().includes(term)) score += 2;
          });
          
          // Bonus for reasonable length (not too short, not too long)
          if (text.length > 30 && text.length < 300) score += 1;
          
          if (score > bestScore) {
            bestScore = score;
            bestDescription = text;
          }
        }
      });
    });
    
    if (bestDescription) {
      // Clean up the description to be executive-friendly - NO TRUNCATION
      let cleaned = bestDescription
        .replace(/^(must|shall|should)\s+/i, '') // Remove modal verbs at start
        .replace(/\b(ISO \d+:\s*\d+\.?\d*|clause \d+\.?\d*|control \d+\.?\d*)/gi, '') // Remove technical references
        .replace(/\s*\([^)]*ISO[^)]*\)/gi, '') // Remove ISO references in parentheses
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Ensure it starts with lowercase (it will be appended to base text)
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
      }
      
      // Ensure it doesn't end with a period (base text will handle punctuation)
      cleaned = cleaned.replace(/\.$/, '');
      
      // Only return if we have meaningful content after cleaning
      if (cleaned.length > 10) {
        return `including ${cleaned}`;
      }
    }
    
    return ''; // Return empty if no good content found
  }
  
  /**
   * Check if two requirements have similar concepts
   */
  private areSimilarConcepts(req1: RequirementDetail, req2: RequirementDetail): boolean {
    const text1 = `${req1.title} ${req1.description}`.toLowerCase();
    const text2 = `${req2.title} ${req2.description}`.toLowerCase();
    
    // Define concept similarity keywords
    const concepts = [
      ['policy', 'procedure', 'document'],
      ['training', 'awareness', 'education'],
      ['review', 'audit', 'assessment'],
      ['monitor', 'measure', 'evaluate'],
      ['access', 'authorization', 'authentication'],
      ['incident', 'response', 'emergency'],
      ['risk', 'threat', 'vulnerability'],
      ['asset', 'inventory', 'management'],
      ['change', 'configuration', 'control'],
      ['backup', 'recovery', 'continuity']
    ];
    
    // Check if both requirements contain words from the same concept group
    for (const conceptGroup of concepts) {
      const req1HasConcept = conceptGroup.some(word => text1.includes(word));
      const req2HasConcept = conceptGroup.some(word => text2.includes(word));
      
      if (req1HasConcept && req2HasConcept) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Create a unified sentence from a group of similar requirements
   */
  private createUnifiedSentence(requirementGroup: RequirementDetail[]): string {
    if (requirementGroup.length === 0) return '';
    
    if (requirementGroup.length === 1) {
      // Single requirement - clean up and format
      const req = requirementGroup[0];
      return this.formatSingleRequirement(req);
    }
    
    // Multiple requirements - create truly unified text
    return this.createTrulyUnifiedText(requirementGroup);
  }
  
  /**
   * Format a single requirement nicely
   */
  private formatSingleRequirement(req: RequirementDetail): string {
    const description = req.description || req.official_description || req.audit_ready_guidance || '';
    
    // Clean up the description
    let cleaned = description
      .replace(/^(must|shall|should)\s+/i, '') // Remove modal verbs at start
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Ensure proper capitalization
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Ensure it ends with a period
    if (!cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }
  
  /**
   * Create truly unified text from multiple requirements
   */
  private createTrulyUnifiedText(requirements: RequirementDetail[]): string {
    // Extract key action verbs and concepts
    const actions = new Set<string>();
    const concepts = new Set<string>();
    const specificDetails = new Set<string>();
    
    requirements.forEach(req => {
      const text = `${req.title} ${req.description} ${req.official_description || ''}`.toLowerCase();
      
      // Extract action verbs
      const actionWords = ['establish', 'implement', 'maintain', 'define', 'develop', 'ensure', 'monitor', 'review', 'assess', 'document'];
      actionWords.forEach(action => {
        if (text.includes(action)) actions.add(action);
      });
      
      // Extract concepts
      const conceptWords = ['policy', 'procedure', 'framework', 'process', 'control', 'standard', 'guideline', 'training', 'awareness'];
      conceptWords.forEach(concept => {
        if (text.includes(concept)) concepts.add(concept);
      });
      
      // Extract specific details (requirements, must-dos)
      const patterns = [
        /must\s+([^.]+)/gi,
        /shall\s+([^.]+)/gi,
        /require[sd]?\s+([^.]+)/gi,
        /including\s+([^.]+)/gi
      ];
      
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const detail = match.replace(/(must|shall|required?|including)\s+/i, '').trim();
            if (detail.length > 10 && detail.length < 100) {
              specificDetails.add(detail);
            }
          });
        }
      });
    });
    
    // Build unified sentence
    const primaryAction = this.selectPrimaryAction(Array.from(actions));
    const primaryConcepts = Array.from(concepts).slice(0, 3); // Limit to 3 main concepts
    const keyDetails = Array.from(specificDetails).slice(0, 2); // Limit to 2 key details
    
    let unifiedText = `${this.capitalize(primaryAction)} `;
    
    if (primaryConcepts.length > 0) {
      unifiedText += `comprehensive ${this.formatConceptList(primaryConcepts)} `;
    }
    
    unifiedText += 'that addresses the requirements from multiple frameworks';
    
    if (keyDetails.length > 0) {
      unifiedText += `, including ${this.formatDetailsList(keyDetails)}`;
    }
    
    unifiedText += '.';
    
    return unifiedText;
  }
  
  /**
   * Select the most appropriate primary action
   */
  private selectPrimaryAction(actions: string[]): string {
    const actionPriority = ['establish', 'implement', 'develop', 'define', 'maintain', 'ensure', 'monitor', 'review'];
    
    for (const priority of actionPriority) {
      if (actions.includes(priority)) {
        return priority;
      }
    }
    
    return actions[0] || 'implement';
  }
  
  /**
   * Format a list of concepts with proper grammar
   */
  private formatConceptList(concepts: string[]): string {
    if (concepts.length === 1) return concepts[0];
    if (concepts.length === 2) return `${concepts[0]} and ${concepts[1]}`;
    
    const last = concepts.pop();
    return `${concepts.join(', ')}, and ${last}`;
  }
  
  /**
   * Format a list of details with proper grammar
   */
  private formatDetailsList(details: string[]): string {
    if (details.length === 1) return details[0];
    if (details.length === 2) return `${details[0]} and ${details[1]}`;
    
    const last = details.pop();
    return `${details.join(', ')}, and ${last}`;
  }
  
  /**
   * Combine unified sentences with proper flow
   */
  private combineUnifiedSentences(sentences: string[]): string {
    if (sentences.length === 0) return '';
    if (sentences.length === 1) return sentences[0];
    
    // Use bullets for multiple concepts to maintain readability
    return sentences.map((sentence, index) => `• ${sentence}`).join('\n');
  }
  
  /**
   * Extract clean description from original content - use ACTUAL content from database
   */
  private extractCleanDescription(originalContent: string): string {
    // Extract the description part (after title and dash, before specific requirements)
    const match = originalContent.match(/^[a-p]\)\s+[^-\n]+?\s*-\s*([^-]+?)(?:\s*-\s*[A-Z]|$)/s);
    if (match) {
      let description = match[1].trim();
      
      // Clean up common patterns
      description = description
        .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical references
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Ensure proper sentence ending
      if (!description.match(/[.!?]$/)) {
        description += '.';
      }
      
      return description;
    }
    
    return 'Requirements for this security domain as defined by selected compliance frameworks.';
  }
  
  /**
   * Get framework references
   */
  private getFrameworkReferences(requirements: RequirementDetail[]): string[] {
    const frameworks = new Map<string, string[]>();
    
    requirements.forEach(req => {
      const shortName = this.getShortFrameworkName(req.framework);
      if (!frameworks.has(shortName)) {
        frameworks.set(shortName, []);
      }
      frameworks.get(shortName)!.push(req.control_id);
    });
    
    const references: string[] = [];
    frameworks.forEach((controls, framework) => {
      references.push(`${framework}: ${controls.join(', ')}`);
    });
    
    return references;
  }
  
  /**
   * Get short framework name
   */
  private getShortFrameworkName(framework: string): string {
    const shortNames: { [key: string]: string } = {
      'ISO/IEC 27001': 'ISO 27001',
      'ISO/IEC 27002': 'ISO 27002',
      'CIS Controls Implementation Group 1 (IG1)': 'CIS IG1',
      'CIS Controls Implementation Group 2 (IG2)': 'CIS IG2',
      'CIS Controls Implementation Group 3 (IG3)': 'CIS IG3',
      'NIS2 Directive': 'NIS2',
      'GDPR': 'GDPR'
    };
    
    return shortNames[framework] || framework;
  }
  
  /**
   * Capitalize first letter
   */
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

export const intelligentUnifiedRequirementsGenerator = new IntelligentUnifiedRequirementsGenerator();