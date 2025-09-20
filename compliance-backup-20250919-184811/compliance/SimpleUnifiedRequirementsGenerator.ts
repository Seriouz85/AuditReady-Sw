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
      // 1. Get existing section structure (preserve exact titles)
      const existingSections = await this.getExistingSections(categoryName);
      
      // 2. Get all actual requirements from selected frameworks for this category
      const actualRequirements = await this.getActualRequirements(
        categoryName, 
        selectedFrameworks, 
        cisIGLevel
      );
      
      // 3. Assign each requirement to exactly ONE section (no duplicates)
      const sectionAssignments = this.assignRequirementsToSections(existingSections, actualRequirements);
      
      // 4. Format sections with assigned requirements
      const formattedSections = existingSections.map(section => {
        let sectionRequirements = sectionAssignments.get(section.id) || [];
        
        // Smart limit - show more for key sections, less for others
        const maxRequirements = this.getMaxRequirementsForSection(section.title);
        if (sectionRequirements.length > maxRequirements) {
          // Prioritize diverse frameworks
          sectionRequirements = this.prioritizeRequirements(sectionRequirements, maxRequirements);
        }
        
        // Format with concise text - handle empty sections gracefully
        if (sectionRequirements.length === 0) {
          // Skip empty sections if no requirements match
          return null;
        }
        
        // Build consolidated description from requirements (avoid repetition)
        const consolidatedText = this.buildConsolidatedText(sectionRequirements);
        const frameworks = this.getFrameworkRefs(sectionRequirements);
        
        // Use section title with minimal intro
        const sectionIntro = this.getFrameworkAgnosticDescription(section.title);
        
        // Format with proper Framework References title for blue styling
        return `${section.id}) ${section.title}\n${sectionIntro}\n\n${consolidatedText}\n\nFramework References: ${frameworks}`;
      }).filter(Boolean); // Remove null entries
      
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
        description: '', // Don't use potentially contaminated description
        topic: this.extractMainTopic(title.trim())
      });
    });
    
    // FIXED: Only show sections that actually exist in the database
    // No more generating junk sections - only use what's actually defined
    
    // Sort sections by letter to ensure proper order
    sections.sort((a, b) => a.id.localeCompare(b.id));
    
    
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
    
    // PHASE 1: Ensure each section gets at least one requirement
    let requirementIndex = 0;
    sections.forEach(section => {
      if (requirementIndex < allRequirements.length) {
        const req = allRequirements[requirementIndex];
        assignments.get(section.id)!.push(req);
        usedRequirements.add(req.control_id);
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
    
    // Get highly specific keywords for this exact section title
    const sectionKeywords = this.getExactSectionKeywords(sectionTitle);
    
    // Score based on keyword matches
    sectionKeywords.forEach(keyword => {
      if (reqText.includes(keyword)) {
        // Prioritize title matches
        const points = req.title.toLowerCase().includes(keyword) ? 20 : 10;
        score += points;
      }
    });
    
    // Boost score for direct topic matches
    const directTopicBoost = this.getDirectTopicBoost(sectionTitle, reqText);
    score += directTopicBoost;
    
    // PENALTY for obvious mismatches to prevent topic mixing
    const penalties = this.getTopicMismatchPenalties(sectionTitle, reqText);
    score -= penalties;
    
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
   * Get direct topic boost for exact matches
   */
  private getDirectTopicBoost(sectionTitle: string, reqText: string): number {
    const exactMatches = [
      { section: ['asset', 'inventory'], requirement: ['hardware inventory', 'asset discovery', 'asset management'], boost: 25 },
      { section: ['risk'], requirement: ['risk assessment', 'risk management', 'risk treatment'], boost: 25 },
      { section: ['leadership'], requirement: ['leadership commitment', 'management', 'governance'], boost: 25 },
      { section: ['policy'], requirement: ['policy', 'procedure', 'documentation'], boost: 25 },
      { section: ['incident'], requirement: ['incident response', 'incident handling', 'recovery'], boost: 25 },
      { section: ['access'], requirement: ['access control', 'authentication', 'authorization'], boost: 25 },
      { section: ['cryptography', 'encryption'], requirement: ['encryption', 'cryptography', 'crypto'], boost: 25 },
      { section: ['monitoring'], requirement: ['monitoring', 'logging', 'audit'], boost: 25 }
    ];
    
    for (const match of exactMatches) {
      const sectionMatch = match.section.some(s => sectionTitle.includes(s));
      const reqMatch = match.requirement.some(r => reqText.includes(r));
      
      if (sectionMatch && reqMatch) {
        return match.boost;
      }
    }
    
    return 0;
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
        penalty: 30
      },
      {
        section: 'incident',
        penalizeFor: ['policy framework', 'asset disposal', 'training', 'governance structure'],
        penalty: 30
      },
      {
        section: 'governance',
        penalizeFor: ['hardware inventory', 'backup', 'cryptography', 'network monitoring'],
        penalty: 25
      },
      {
        section: 'asset',
        penalizeFor: ['incident response', 'risk assessment', 'policy development'],
        penalty: 25
      },
      {
        section: 'training',
        penalizeFor: ['hardware inventory', 'incident response', 'asset disposal'],
        penalty: 25
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
    
    // Remove "Implementation:" sections and everything after
    const implementationIndex = text.search(/\bImplementation:?\s*/i);
    if (implementationIndex > 0) {
      text = text.substring(0, implementationIndex).trim();
    }
    
    // Remove technical references but keep the essential content
    text = text
      .replace(/\b(ISO\/IEC \d+:\d+\.?\d*|ISO \d+:\d+\.?\d*|clause \d+\.?\d*|Annex [A-Z]\.?\d+\.?\d*)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Smart truncation - find complete sentences within limit
    const maxLength = 600; // Slightly increased to avoid cutting mid-sentence
    if (text.length > maxLength) {
      // Try to find a sentence end before the limit
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let result = '';
      
      for (const sentence of sentences) {
        if ((result + sentence).length <= maxLength) {
          result += sentence;
        } else {
          // If we haven't added any sentences yet, take at least partial
          if (result.length === 0) {
            result = text.substring(0, maxLength);
            const lastSpace = result.lastIndexOf(' ');
            if (lastSpace > maxLength * 0.8) {
              result = result.substring(0, lastSpace);
            }
            if (!result.endsWith('.')) result += '.';
          }
          break;
        }
      }
      text = result.trim();
    }
    
    return text;
  }
  
  /**
   * Clean section description - ENHANCED to remove ALL framework-specific content
   */
  private cleanDescription(desc: string): string {
    // Remove ALL framework-specific references comprehensively
    let cleaned = desc
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and their content
      // Remove all framework names and their variations
      .replace(/\b(GDPR|NIS2|NIS 2|NIST|SOC 2|SOC2|CIS Controls?|ISO\/IEC \d+|ISO \d+|PCI DSS|PCI-DSS|HIPAA|CCPA)\b/gi, '')
      // Remove framework-specific timing requirements
      .replace(/\b\d+[\s-]?hour(s)?\s+(requirement|notification|reporting|deadline)/gi, '')
      .replace(/within\s+\d+\s+hours?\s+of/gi, '')
      // Remove framework article/clause references
      .replace(/\b(Article|Articles|Clause|Clauses|Section|Control|Annex)\s+[\d.]+/gi, '')
      // Remove framework-specific terminology
      .replace(/\b(Data Protection Authority|DPA|competent authority|supervisory authority|essential service|important service)\b/gi, '')
      .replace(/\b(data subject|personal data breach|processing activities|lawful basis)\b/gi, '')
      // Clean up resulting issues
      .replace(/\s*,\s*,/g, ',') // Clean up double commas
      .replace(/\s*,\s*and\s*,/g, ' and') // Clean up comma-and patterns
      .replace(/\s*-\s*-/g, ' - ') // Clean up double dashes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // If description becomes too short or empty after cleaning, provide generic text
    if (cleaned.length < 20) {
      cleaned = 'Implementation requirements based on your selected compliance frameworks.';
    }
    
    return cleaned;
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
  
  /**
   * Get framework-agnostic description for a section
   */
  private getFrameworkAgnosticDescription(sectionTitle: string): string {
    const title = sectionTitle.toLowerCase();
    
    const descriptions: { [key: string]: string } = {
      'leadership': 'Establish management commitment and accountability for information security.',
      'scope': 'Define the boundaries and applicability of your security management system.',
      'policy': 'Develop and maintain comprehensive security policies aligned with business objectives.',
      'organizational': 'Define clear roles, responsibilities, and reporting structures for security governance.',
      'project': 'Integrate security requirements into project management processes.',
      'asset': 'Manage information assets throughout their lifecycle, including secure disposal.',
      'personnel': 'Implement personnel security controls and background verification processes.',
      'competence': 'Ensure personnel have appropriate security competence and awareness.',
      'compliance': 'Monitor and verify compliance with security requirements.',
      'change': 'Manage changes to systems and processes with security considerations.',
      'regulatory': 'Maintain appropriate relationships with authorities and stakeholders.',
      'incident': 'Establish incident response capabilities and procedures.',
      'third': 'Manage security risks associated with suppliers and third parties.',
      'improvement': 'Implement continuous improvement processes for security management.',
      'governance': 'Establish appropriate governance structures and oversight.',
      'risk': 'Identify, assess, and manage information security risks.',
      'awareness': 'Provide security awareness training and education programs.'
    };
    
    // Find matching description
    for (const [key, desc] of Object.entries(descriptions)) {
      if (title.includes(key)) {
        return desc;
      }
    }
    
    return 'Implementation requirements based on your selected compliance frameworks.';
  }
  
  /**
   * Get minimal intro text for a section based on selected frameworks
   */
  private getMinimalIntroText(sectionTitle: string, selectedFrameworks: string[]): string {
    // Create framework-specific but minimal intro
    const frameworkList = selectedFrameworks
      .map(f => {
        if (f === 'iso27001') return 'ISO 27001';
        if (f === 'iso27002') return 'ISO 27002';
        if (f === 'cisControls') return 'CIS Controls';
        if (f === 'nis2') return 'NIS2';
        if (f === 'gdpr') return 'GDPR';
        return f;
      })
      .filter(Boolean)
      .join(', ');
    
    const baseDescription = this.getFrameworkAgnosticDescription(sectionTitle);
    
    if (frameworkList) {
      return `${baseDescription} Requirements from ${frameworkList}:`;
    }
    
    return baseDescription;
  }
  
  /**
   * Get max requirements to show for a section
   */
  private getMaxRequirementsForSection(sectionTitle: string): number {
    const title = sectionTitle.toLowerCase();
    
    // Key sections get more requirements
    if (title.includes('leadership') || title.includes('scope') || title.includes('policy')) {
      return 5;
    }
    
    // Standard sections
    return 4;
  }
  
  /**
   * Prioritize requirements to show diverse frameworks
   */
  private prioritizeRequirements(requirements: RequirementDetail[], maxCount: number): RequirementDetail[] {
    // Group by framework
    const byFramework = new Map<string, RequirementDetail[]>();
    requirements.forEach(req => {
      if (!byFramework.has(req.framework)) {
        byFramework.set(req.framework, []);
      }
      byFramework.get(req.framework)!.push(req);
    });
    
    // Take requirements from each framework in rotation
    const result: RequirementDetail[] = [];
    let index = 0;
    
    while (result.length < maxCount) {
      let added = false;
      byFramework.forEach(frameworkReqs => {
        if (result.length < maxCount && frameworkReqs.length > index) {
          result.push(frameworkReqs[index]);
          added = true;
        }
      });
      
      if (!added) break;
      index++;
    }
    
    return result;
  }
  
  /**
   * Build consolidated text from requirements without repetition
   */
  private buildConsolidatedText(requirements: RequirementDetail[]): string {
    if (requirements.length === 0) return '';
    
    // Group similar requirements to avoid repetition
    const consolidatedRequirements: string[] = [];
    const processedTopics = new Set<string>();
    
    requirements.forEach(req => {
      // Extract main topic from requirement
      const topic = this.extractRequirementTopic(req);
      
      // Check if we already have this topic covered
      if (!processedTopics.has(topic)) {
        processedTopics.add(topic);
        
        // Find all requirements for this topic
        const topicReqs = requirements.filter(r => this.extractRequirementTopic(r) === topic);
        
        if (topicReqs.length === 1) {
          // Single requirement for this topic
          consolidatedRequirements.push(`• ${this.cleanRequirementText(topicReqs[0])}`);
        } else {
          // Multiple requirements for same topic - consolidate
          const consolidated = this.consolidateMultipleRequirements(topicReqs);
          consolidatedRequirements.push(`• ${consolidated}`);
        }
      }
    });
    
    return consolidatedRequirements.join('\n');
  }
  
  /**
   * Extract main topic from requirement for grouping
   */
  private extractRequirementTopic(req: RequirementDetail): string {
    const text = (req.title + ' ' + req.description).toLowerCase();
    
    // Key topics to identify
    const topics = [
      'risk assessment', 'risk management', 'risk treatment',
      'policy', 'procedure', 'documentation',
      'access control', 'authentication', 'authorization',
      'incident', 'response', 'recovery',
      'audit', 'monitoring', 'review',
      'training', 'awareness', 'competence',
      'asset', 'inventory', 'classification',
      'encryption', 'cryptography', 'protection'
    ];
    
    for (const topic of topics) {
      if (text.includes(topic)) {
        return topic;
      }
    }
    
    // Fallback to first few words of title
    return req.title.split(' ').slice(0, 3).join(' ').toLowerCase();
  }
  
  /**
   * Consolidate multiple requirements about the same topic
   */
  private consolidateMultipleRequirements(requirements: RequirementDetail[]): string {
    if (requirements.length === 0) return '';
    if (requirements.length === 1) return this.cleanRequirementText(requirements[0]);
    
    // Find the most comprehensive requirement
    let bestReq = requirements[0];
    let maxLength = bestReq.description.length;
    
    requirements.forEach(req => {
      if (req.description.length > maxLength) {
        maxLength = req.description.length;
        bestReq = req;
      }
    });
    
    // Use the most comprehensive description
    let consolidated = this.cleanRequirementText(bestReq);
    
    // Add unique elements from other requirements
    const additionalPoints: string[] = [];
    requirements.forEach(req => {
      if (req !== bestReq) {
        // Extract unique points not already in consolidated
        const uniquePoint = this.extractUniquePoint(req, consolidated);
        if (uniquePoint) {
          additionalPoints.push(uniquePoint);
        }
      }
    });
    
    if (additionalPoints.length > 0) {
      consolidated += ' Additional requirements: ' + additionalPoints.join(', ');
    }
    
    return consolidated;
  }
  
  /**
   * Extract unique point from requirement not already covered
   */
  private extractUniquePoint(req: RequirementDetail, existingText: string): string | null {
    const existing = existingText.toLowerCase();
    const words = req.description.split(' ');
    
    // Find key phrases not in existing
    const keyPhrases = [
      'must', 'shall', 'required', 'ensure', 'implement',
      'establish', 'maintain', 'document', 'review', 'approve'
    ];
    
    for (let i = 0; i < words.length - 3; i++) {
      const phrase = words.slice(i, i + 4).join(' ').toLowerCase();
      if (keyPhrases.some(key => phrase.includes(key)) && !existing.includes(phrase)) {
        // Found unique phrase, extract it
        const end = Math.min(i + 10, words.length);
        return words.slice(i, end).join(' ');
      }
    }
    
    return null;
  }
}

export const simpleUnifiedRequirementsGenerator = new SimpleUnifiedRequirementsGenerator();