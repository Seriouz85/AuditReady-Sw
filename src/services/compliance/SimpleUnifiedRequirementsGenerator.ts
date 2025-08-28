import { supabase } from '../../lib/supabase';

interface RequirementDetail {
  control_id: string;
  title: string;
  description: string;
  framework: string;
}

interface SimpleUnifiedSection {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  frameworks: string[];
}

/**
 * SIMPLE Unified Requirements Generator
 * 
 * Philosophy: Keep it stupid simple
 * 1. Get existing section structure from database (preserve exact titles)
 * 2. Get actual requirements from selected frameworks for this category
 * 3. Show them in the simplest possible way - no hardcoded nonsense
 */
export class SimpleUnifiedRequirementsGenerator {
  
  /**
   * Generate simple, direct unified requirements
   */
  async generateSimpleUnifiedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<string[]> {
    try {
      console.log('[SIMPLE] Generating for:', categoryName);
      
      // 1. Get existing section structure (preserve exact titles)
      const existingSections = await this.getExistingSections(categoryName);
      
      // 2. Get all actual requirements from selected frameworks for this category
      const actualRequirements = await this.getActualRequirements(
        categoryName, 
        selectedFrameworks, 
        cisIGLevel
      );
      
      console.log('[SIMPLE]', actualRequirements.length, 'actual requirements found');
      
      // 3. Assign each requirement to exactly ONE section (no duplicates)
      const sectionAssignments = this.assignRequirementsToSections(existingSections, actualRequirements);
      
      // 4. Format sections with assigned requirements (limit to reasonable size)
      const formattedSections = existingSections.map(section => {
        let sectionRequirements = sectionAssignments.get(section.id) || [];
        
        // Limit each section to max 3 requirements for better readability
        if (sectionRequirements.length > 3) {
          sectionRequirements = sectionRequirements.slice(0, 3);
        }
        
        // Format with concise text - handle empty sections gracefully
        if (sectionRequirements.length === 0) {
          return `${section.id}) ${section.title}\n${section.description}\n\nImplementation guidance will be provided based on your selected compliance frameworks.`;
        }
        
        const requirementTexts = sectionRequirements.map(req => 
          `• ${this.cleanRequirementText(req)}`
        );
        
        const frameworks = this.getFrameworkRefs(sectionRequirements);
        
        return `${section.id}) ${section.title}\n${section.description}\n\nRequirements:\n${requirementTexts.join('\n')}\n\n[${frameworks}]`;
      });
      
      return formattedSections;
      
    } catch (error) {
      console.error('[SIMPLE] Generation failed:', error);
      return [];
    }
  }
  
  /**
   * Get existing sections with exact titles from database
   */
  private async getExistingSections(categoryName: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('unified_requirements')
      .select(`
        sub_requirements,
        unified_compliance_categories!inner(name)
      `)
      .eq('unified_compliance_categories.name', categoryName);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    const sections: any[] = [];
    const subRequirements = (data[0].sub_requirements || []) as string[];
    
    subRequirements.forEach((subReq: string) => {
      // MUCH SIMPLER: Split ONLY on " - " when followed by common description starters
      const letterMatch = subReq.match(/^([a-p])\)\s+/);
      if (!letterMatch) return;
      
      const letter = letterMatch[1];
      const content = subReq.replace(/^[a-p]\)\s+/, ''); // Remove "a) " prefix
      
      // Look for the LAST dash followed by description indicators
      let title = content;
      let description = '';
      
      // Common patterns that indicate description start (not part of title)
      const descriptionStarters = [
        /^(.+?)\s+-\s+(Requirements?:.*)/i,
        /^(.+?)\s+-\s+(Establish .*)/i,
        /^(.+?)\s+-\s+(Implement .*)/i,
        /^(.+?)\s+-\s+(Define .*)/i,
        /^(.+?)\s+-\s+(Ensure .*)/i,
        /^(.+?)\s+-\s+(The organization .*)/i,
        /^(.+?)\s+-\s+(Top management .*)/i,
        /^(.+?)\s+-\s+(Information .*)/i,
        /^(.+?)\s+-\s+(Evaluate .*)/i,
        /^(.+?)\s+-\s+(Clear .*)/i,
        /^(.+?)\s+-\s+([A-Z][a-z].*)/  // Capital letter followed by lowercase (like "Evaluate...")
      ];
      
      // Try to find the split point where description starts
      for (const pattern of descriptionStarters) {
        const match = content.match(pattern);
        if (match && match[1] && match[2]) {
          title = match[1].trim();
          description = match[2].trim();
          break;
        }
      }
      
      // If no clear pattern found, look for the most likely split (avoid breaking compound words)
      if (!description && content.includes(' - ')) {
        const parts = content.split(' - ');
        if (parts.length >= 2) {
          // If the second part starts with lowercase, it's likely description
          if (parts[1].charAt(0) === parts[1].charAt(0).toLowerCase()) {
            title = parts[0].trim();
            description = parts.slice(1).join(' - ').trim();
          }
        }
      }
      
      // Final fallback - keep original if no good split found
      if (!description) {
        const dashIndex = content.indexOf(' - ');
        if (dashIndex !== -1) {
          title = content.substring(0, dashIndex).trim();
          description = content.substring(dashIndex + 3).trim();
        }
      }
        
      sections.push({
        id: letter.toLowerCase(),
        title: title.trim(),
        description: this.cleanDescription(description),
        topic: this.extractMainTopic(title.trim())
      });
    });
    
    // FIXED: Only show sections that actually exist in the database
    // No more generating junk sections - only use what's actually defined
    
    // Sort sections by letter to ensure proper order
    sections.sort((a, b) => a.id.localeCompare(b.id));
    
    console.log(`[SECTION EXTRACTION] Found ${sections.length} sections for ${categoryName}:`, sections.map(s => `${s.id}) ${s.title}`));
    
    return sections;
  }
  
  /**
   * Get actual requirements from database for selected frameworks
   */
  private async getActualRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<RequirementDetail[]> {
    // Convert framework codes to names
    const frameworkNames = this.mapFrameworkCodes(selectedFrameworks, cisIGLevel);
    
    if (frameworkNames.length === 0) return [];
    
    const { data, error } = await supabase
      .from('requirements_library')
      .select(`
        control_id,
        title,
        description,
        standards_library!inner(name)
      `)
      .eq('category', categoryName)
      .eq('is_active', true)
      .in('standards_library.name', frameworkNames);
    
    if (error) throw error;
    
    return (data || []).map((req: any) => ({
      control_id: req.control_id,
      title: req.title,
      description: req.description,
      framework: req.standards_library.name
    }));
  }
  
  /**
   * Assign each requirement to exactly ONE section (prevents duplicates)
   */
  private assignRequirementsToSections(
    sections: any[], 
    allRequirements: RequirementDetail[]
  ): Map<string, RequirementDetail[]> {
    const assignments = new Map<string, RequirementDetail[]>();
    const usedRequirements = new Set<string>();
    
    // Initialize empty arrays for each section
    sections.forEach(section => assignments.set(section.id, []));
    
    console.log(`[ASSIGNMENT] Assigning ${allRequirements.length} requirements to ${sections.length} sections`);
    
    // PHASE 1: Ensure each section gets at least one requirement
    let requirementIndex = 0;
    sections.forEach(section => {
      if (requirementIndex < allRequirements.length) {
        const req = allRequirements[requirementIndex];
        assignments.get(section.id)!.push(req);
        usedRequirements.add(req.control_id);
        console.log(`[PHASE 1] ${req.control_id} → ${section.id}) ${section.title} (ensuring coverage)`);
        requirementIndex++;
      }
    });
    
    // PHASE 2: Distribute remaining requirements based on best match
    for (let i = requirementIndex; i < allRequirements.length; i++) {
      const req = allRequirements[i];
      if (usedRequirements.has(req.control_id)) continue;
      
      let bestSection = null;
      let bestScore = 0;
      
      // Score each section for this requirement
      sections.forEach(section => {
        const score = this.calculateSectionMatchScore(section, req);
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      });
      
      // Assign to best section (or least populated if no good match)
      const targetSection = bestSection || this.findLeastPopulatedSection(sections, assignments);
      if (targetSection) {
        assignments.get(targetSection.id)!.push(req);
        usedRequirements.add(req.control_id);
        console.log(`[PHASE 2] ${req.control_id} → ${targetSection.id}) ${targetSection.title} (score: ${bestScore})`);
      }
    }
    
    return assignments;
  }
  
  /**
   * Find section with fewest assigned requirements (for better distribution)
   */
  private findLeastPopulatedSection(sections: any[], assignments: Map<string, RequirementDetail[]>): any {
    let leastPopulated = sections[0];
    let minCount = assignments.get(leastPopulated.id)?.length || 0;
    
    sections.forEach(section => {
      const count = assignments.get(section.id)?.length || 0;
      if (count < minCount) {
        minCount = count;
        leastPopulated = section;
      }
    });
    
    return leastPopulated;
  }
  
  /**
   * Calculate how well a requirement matches a specific section
   */
  private calculateSectionMatchScore(section: any, req: RequirementDetail): number {
    const sectionTitle = section.title.toLowerCase();
    const reqText = `${req.title} ${req.description}`.toLowerCase();
    
    let score = 0;
    
    console.log(`[SCORING] Matching "${req.control_id}" against section "${section.id}) ${section.title}"`);
    
    // Get highly specific keywords for this exact section title
    const sectionKeywords = this.getExactSectionKeywords(sectionTitle);
    
    // Score based on keyword matches
    sectionKeywords.forEach(keyword => {
      if (reqText.includes(keyword)) {
        const points = reqText.includes(req.title.toLowerCase()) ? 15 : 8; // Higher score for title matches
        score += points;
        console.log(`  [+${points}] Found keyword "${keyword}" in requirement`);
      }
    });
    
    // PENALTY for obvious mismatches to prevent topic mixing
    const penalties = this.getTopicMismatchPenalties(sectionTitle, reqText);
    score -= penalties;
    if (penalties > 0) {
      console.log(`  [-${penalties}] Topic mismatch penalty applied`);
    }
    
    console.log(`  [FINAL SCORE] ${score} for ${req.control_id} → ${section.id}) ${section.title}`);
    return Math.max(0, score);
  }
  
  /**
   * Get exact, highly specific keywords for precise section matching
   */
  private getExactSectionKeywords(sectionTitle: string): string[] {
    // Use EXACT section title matching for precise assignment
    const exactKeywordMap: { [key: string]: string[] } = {
      'leadership commitment': ['leadership', 'commitment', 'management', 'top management'],
      'scope definition': ['scope', 'boundary', 'isms', 'definition', 'coverage'],
      'organizational roles': ['role', 'responsibility', 'organizational', 'structure'],
      'policy framework': ['policy', 'procedure', 'framework', 'document'],
      'project management': ['project', 'development', 'implementation', 'lifecycle'],
      'asset management': ['asset', 'disposal', 'equipment', 'inventory'],
      'personnel security': ['personnel', 'employee', 'staff', 'human resource', 'screening'],
      'competence': ['competence', 'training', 'skill', 'awareness', 'education'],
      'compliance monitoring': ['compliance', 'monitoring', 'audit', 'review', 'assessment'],
      'change management': ['change', 'modification', 'update', 'configuration'],
      'regulatory': ['regulatory', 'legal', 'requirement', 'authority'],
      'incident response': ['incident', 'response', 'emergency', 'escalation'],
      'third-party': ['third party', 'supplier', 'vendor', 'contractor', 'outsourcing'],
      'third-party risk': ['third party', 'risk', 'assessment', 'supplier'],
      'third-party governance': ['third party', 'governance', 'framework', 'supplier'],
      'continuous improvement': ['improvement', 'continual', 'enhancement'],
      'awareness training': ['awareness', 'training', 'education', 'culture'],
      'risk assessment': ['risk', 'assessment', 'evaluation', 'analysis'],
      'risk management': ['risk', 'management', 'treatment', 'monitoring'],
      'governance': ['governance', 'framework', 'oversight', 'structure'],
      'security requirement': ['security', 'information', 'control', 'requirement']
    };
    
    // Find the best matching keywords for this section title
    for (const [key, keywords] of Object.entries(exactKeywordMap)) {
      if (sectionTitle.includes(key)) {
        return keywords;
      }
    }
    
    // Fallback to generic keywords
    return ['security', 'information', 'control'];
  }
  
  /**
   * Get penalties for obvious topic mismatches
   */
  private getTopicMismatchPenalties(sectionTitle: string, reqText: string): number {
    let penalty = 0;
    
    // Define strict mismatch rules to prevent wrong topic assignments
    const mismatchRules = [
      {
        section: 'third-party',
        penalizeFor: ['backup', 'recovery', 'continuity', 'authentication', 'cryptography', 'network'],
        penalty: 20
      },
      {
        section: 'incident',
        penalizeFor: ['policy framework', 'asset disposal', 'training', 'governance structure'],
        penalty: 20
      },
      {
        section: 'governance',
        penalizeFor: ['risk assessment', 'backup', 'asset disposal', 'incident response'],
        penalty: 15
      },
      {
        section: 'awareness',
        penalizeFor: ['risk assessment', 'incident response', 'asset disposal'],
        penalty: 15
      },
      {
        section: 'improvement',
        penalizeFor: ['third party', 'incident response', 'asset disposal'],
        penalty: 15
      }
    ];
    
    mismatchRules.forEach(rule => {
      if (sectionTitle.includes(rule.section)) {
        rule.penalizeFor.forEach(penaltyTerm => {
          if (reqText.includes(penaltyTerm)) {
            penalty += rule.penalty;
          }
        });
      }
    });
    
    return penalty;
  }
  
  /**
   * Get keywords for section matching (legacy method)
   */
  private getSectionKeywords(sectionTitle: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'leadership': ['leadership', 'management', 'commitment', 'responsibility'],
      'scope': ['scope', 'boundary', 'isms', 'definition'],
      'policy': ['policy', 'procedure', 'document', 'framework'],
      'organizational': ['organizational', 'role', 'responsibility', 'structure'],
      'project': ['project', 'development', 'implementation'],
      'asset': ['asset', 'disposal', 'equipment', 'inventory'],
      'personnel': ['personnel', 'employee', 'staff', 'human'],
      'competence': ['competence', 'training', 'skill', 'awareness'],
      'compliance': ['compliance', 'monitoring', 'audit', 'review'],
      'change': ['change', 'modification', 'update', 'control'],
      'regulatory': ['regulatory', 'legal', 'requirement', 'authority'],
      'incident': ['incident', 'response', 'emergency', 'escalation'],
      'third': ['third party', 'supplier', 'vendor', 'contractor'],
      'improvement': ['improvement', 'continual', 'enhancement'],
      'governance': ['governance', 'framework', 'oversight']
    };
    
    // Find matching keywords
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (sectionTitle.includes(key)) {
        return keywords;
      }
    }
    
    return ['security', 'information', 'control']; // Default keywords
  }
  
  /**
   * Find requirements that actually match this section - SIMPLE matching
   */
  private findSimpleMatches(section: any, allRequirements: RequirementDetail[]): RequirementDetail[] {
    const sectionTopic = section.topic.toLowerCase();
    const matches: RequirementDetail[] = [];
    
    // Simple keyword matching based on section topic
    allRequirements.forEach(req => {
      const reqText = `${req.title} ${req.description}`.toLowerCase();
      
      if (reqText.includes(sectionTopic)) {
        matches.push(req);
      }
    });
    
    // If no matches, return a few general requirements for this section
    if (matches.length === 0 && allRequirements.length > 0) {
      return allRequirements.slice(0, 2); // Just take first 2
    }
    
    return matches;
  }
  
  /**
   * Extract main topic from section title
   */
  private extractMainTopic(title: string): string {
    const words = title.toLowerCase().split(' ');
    
    // Look for key topic words
    const topicWords = ['leadership', 'scope', 'policy', 'personnel', 'incident', 'third-party', 'training', 'asset', 'change'];
    
    for (const topic of topicWords) {
      if (title.toLowerCase().includes(topic)) {
        return topic;
      }
    }
    
    // Fallback to first meaningful word
    return words.find(word => word.length > 3) || 'security';
  }
  
  /**
   * Clean requirement text - make it simple and readable
   */
  private cleanRequirementText(req: RequirementDetail): string {
    let text = req.description || req.title;
    
    // Remove technical references
    text = text
      .replace(/\b(ISO \d+:\d+\.?\d*|clause \d+\.?\d*)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to 6-8 rows maximum (approximately 400-500 characters)
    if (text.length > 500) {
      // Find a natural break point near 450 characters
      let cutPoint = text.lastIndexOf('.', 450);
      if (cutPoint === -1) cutPoint = text.lastIndexOf(' ', 450);
      if (cutPoint === -1) cutPoint = 450;
      
      text = text.substring(0, cutPoint).trim();
      if (!text.endsWith('.')) text += '.';
    }
    
    return text;
  }
  
  /**
   * Clean section description
   */
  private cleanDescription(desc: string): string {
    return desc
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheses
      // Remove framework-specific terms from default descriptions
      .replace(/\b(GDPR|NIS2|NIST|SOC 2|CIS Controls?)\b/gi, '')
      .replace(/\s*,\s*,/g, ',') // Clean up double commas
      .replace(/\s*,\s*and\s*,/g, ' and') // Clean up comma-and patterns
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Get framework references
   */
  private getFrameworkRefs(requirements: RequirementDetail[]): string {
    const refs = new Map<string, string[]>();
    
    requirements.forEach(req => {
      const shortName = this.getShortFrameworkName(req.framework);
      if (!refs.has(shortName)) {
        refs.set(shortName, []);
      }
      refs.get(shortName)!.push(req.control_id);
    });
    
    const formattedRefs: string[] = [];
    refs.forEach((controls, framework) => {
      formattedRefs.push(`${framework}: ${controls.join(', ')}`);
    });
    
    return formattedRefs.join(' | ');
  }
  
  /**
   * Map framework codes to names
   */
  private mapFrameworkCodes(frameworks: string[], cisIGLevel?: string): string[] {
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
}

export const simpleUnifiedRequirementsGenerator = new SimpleUnifiedRequirementsGenerator();