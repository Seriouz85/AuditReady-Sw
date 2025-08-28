import { supabase } from '../../lib/supabase';

interface MappedRequirement {
  control_id: string;
  title: string;
  description: string;
  framework: string;
  official_description?: string;
  audit_ready_guidance?: string;
}

interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  coreRequirements: string[];
}

export class EnhancedUnifiedContentGenerator {
  /**
   * Generate rich, unified content that explains requirements in detail
   * while combining similar ones into comprehensive sentences
   */
  async generateEnhancedUnifiedContent(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<UnifiedSection[]> {
    // Fetch all mapped requirements with full descriptions
    const requirements = await this.fetchDetailedRequirements(categoryName, selectedFrameworks, cisIGLevel);
    
    // Generate sections based on category patterns
    return this.generateDetailedSections(categoryName, requirements);
  }

  private async fetchDetailedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<MappedRequirement[]> {
    const frameworkNames = this.mapFrameworkCodesToNames(selectedFrameworks, cisIGLevel);
    
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
      .in('standards_library.name', frameworkNames);

    if (error) throw error;
    
    return (data || []).map((req: any) => ({
      control_id: String(req.control_id || ''),
      title: String(req.title || ''),
      description: String(req.description || ''),
      official_description: String(req.official_description || ''),
      audit_ready_guidance: String(req.audit_ready_guidance || ''),
      framework: String(req.standards_library?.name || '')
    }));
  }

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

  private generateDetailedSections(categoryName: string, requirements: MappedRequirement[]): UnifiedSection[] {
    const sections: UnifiedSection[] = [];
    const sectionPatterns = this.getCategoryPatterns(categoryName);
    
    sectionPatterns.forEach(pattern => {
      const sectionRequirements = this.filterRequirementsForSection(requirements, pattern);
      
      if (sectionRequirements.length > 0) {
        const coreRequirements = this.generateDetailedCoreRequirements(sectionRequirements, pattern);
        
        sections.push({
          id: pattern.id,
          title: pattern.title,
          description: pattern.description,
          coreRequirements
        });
      }
    });
    
    return sections;
  }

  private getCategoryPatterns(categoryName: string): any[] {
    const patterns: { [key: string]: any[] } = {
      'Governance & Leadership': [
        {
          id: 'a',
          title: 'LEADERSHIP COMMITMENT AND ACCOUNTABILITY',
          description: 'Executive leadership must demonstrate visible commitment to information security with documented commitment, regular reviews, and personal accountability',
          keywords: ['leadership', 'commitment', 'management', 'executive', 'accountability', 'review'],
          topics: ['management commitment', 'leadership roles', 'management review', 'executive accountability']
        },
        {
          id: 'b',
          title: 'SCOPE AND BOUNDARIES DEFINITION',
          description: 'Define and document the scope of your information security management system, including all assets, locations, and business processes',
          keywords: ['scope', 'boundary', 'definition', 'assets', 'locations', 'interface'],
          topics: ['scope definition', 'ISMS boundaries', 'asset identification', 'interface management']
        },
        {
          id: 'c',
          title: 'ORGANIZATIONAL STRUCTURE',
          description: 'Establish clear roles, responsibilities, and reporting lines for information security governance',
          keywords: ['role', 'responsibility', 'structure', 'organization', 'reporting', 'hierarchy'],
          topics: ['security roles', 'responsibilities assignment', 'reporting structure', 'governance hierarchy']
        },
        {
          id: 'd',
          title: 'POLICY AND COMPLIANCE FRAMEWORK',
          description: 'Develop, implement and maintain comprehensive security policies aligned with regulatory requirements',
          keywords: ['policy', 'procedure', 'compliance', 'regulation', 'standard', 'framework'],
          topics: ['security policies', 'compliance management', 'regulatory requirements', 'policy framework']
        }
      ],
      'Risk Management': [
        {
          id: 'a',
          title: 'RISK MANAGEMENT FRAMEWORK',
          description: 'Establish comprehensive information security risk management framework aligned with business objectives and organizational context',
          keywords: ['risk', 'framework', 'management', 'business', 'context', 'objective'],
          topics: ['risk framework', 'risk criteria', 'business alignment', 'risk appetite']
        },
        {
          id: 'b',
          title: 'RISK ASSESSMENT METHODOLOGY',
          description: 'Implement systematic risk assessment processes covering asset identification, threat assessment, vulnerability analysis, and impact evaluation',
          keywords: ['assessment', 'threat', 'vulnerability', 'impact', 'analysis', 'identification'],
          topics: ['threat assessment', 'vulnerability analysis', 'impact evaluation', 'risk scoring']
        },
        {
          id: 'c',
          title: 'RISK ANALYSIS AND INFORMATION SYSTEM SECURITY POLICIES',
          description: 'Conduct comprehensive cybersecurity risk analysis and develop information system security policies',
          keywords: ['analysis', 'cybersecurity', 'information system', 'security policy'],
          topics: ['risk analysis', 'security policies', 'control selection', 'risk evaluation']
        },
        {
          id: 'd',
          title: 'RISK TREATMENT PLANNING',
          description: 'Develop and implement risk treatment plans with appropriate controls selection, implementation timelines, and resource allocation',
          keywords: ['treatment', 'control', 'mitigation', 'implementation', 'resource'],
          topics: ['risk treatment', 'control implementation', 'mitigation strategies', 'residual risk']
        },
        {
          id: 'e',
          title: 'PROPORTIONATE CYBERSECURITY MEASURES',
          description: 'Implement appropriate and proportionate technical, operational, and organizational measures',
          keywords: ['proportionate', 'measures', 'technical', 'operational', 'organizational'],
          topics: ['security measures', 'proportionality', 'control effectiveness']
        },
        {
          id: 'f',
          title: 'EFFECTIVENESS ASSESSMENT PROCEDURES',
          description: 'Establish procedures to assess the effectiveness of cybersecurity risk management measures',
          keywords: ['effectiveness', 'assessment', 'metrics', 'review', 'improvement'],
          topics: ['effectiveness metrics', 'performance monitoring', 'continuous improvement']
        },
        {
          id: 'g',
          title: 'BUSINESS IMPACT ANALYSIS',
          description: 'Conduct comprehensive business impact analysis to understand potential consequences',
          keywords: ['business impact', 'consequences', 'analysis', 'operations'],
          topics: ['impact analysis', 'business consequences', 'criticality assessment']
        },
        {
          id: 'h',
          title: 'RISK MONITORING AND REVIEW',
          description: 'Implement continuous risk monitoring with regular assessments and risk register updates',
          keywords: ['monitoring', 'review', 'continuous', 'register', 'update'],
          topics: ['risk monitoring', 'periodic review', 'risk register management']
        }
      ],
      'Identity & Access Management': [
        {
          id: 'a',
          title: 'ACCESS CONTROL FRAMEWORK',
          description: 'Establish comprehensive access control policies based on least privilege and need-to-know principles',
          keywords: ['access control', 'least privilege', 'authorization', 'need-to-know'],
          topics: ['access policies', 'authorization models', 'privilege management']
        },
        {
          id: 'b',
          title: 'ACCESS GRANTING AND REVOKING PROCESSES',
          description: 'Implement formal processes for granting, modifying, and revoking access rights',
          keywords: ['granting', 'revoking', 'provisioning', 'deprovisioning', 'lifecycle'],
          topics: ['access provisioning', 'deprovisioning procedures', 'access reviews']
        },
        {
          id: 'c',
          title: 'MULTI-FACTOR AUTHENTICATION',
          description: 'Require MFA for externally-exposed applications, remote access, and administrative privileges',
          keywords: ['MFA', 'multi-factor', 'authentication', 'remote', 'administrative'],
          topics: ['MFA implementation', 'authentication strength', 'privileged access']
        },
        {
          id: 'd',
          title: 'AUTHENTICATION AND AUTHORIZATION SYSTEMS',
          description: 'Maintain inventory of authentication systems with centralized access control',
          keywords: ['authentication', 'authorization', 'inventory', 'centralized', 'SSO'],
          topics: ['authentication systems', 'SSO implementation', 'directory services']
        },
        {
          id: 'e',
          title: 'ROLE-BASED ACCESS CONTROL',
          description: 'Define and maintain role-based access control with regular reviews',
          keywords: ['RBAC', 'role-based', 'roles', 'permissions', 'segregation'],
          topics: ['RBAC implementation', 'role definitions', 'segregation of duties']
        }
      ],
      'Data Protection': [
        {
          id: 'a',
          title: 'DATA CLASSIFICATION AND LABELING',
          description: 'Classify information assets based on sensitivity and apply appropriate labeling',
          keywords: ['classification', 'labeling', 'sensitivity', 'categorization'],
          topics: ['data classification scheme', 'labeling requirements', 'handling procedures']
        },
        {
          id: 'b',
          title: 'ENCRYPTION AND CRYPTOGRAPHIC CONTROLS',
          description: 'Implement encryption for sensitive data in transit and at rest with proper key management',
          keywords: ['encryption', 'cryptography', 'key management', 'transit', 'rest'],
          topics: ['encryption standards', 'key lifecycle', 'cryptographic protocols']
        },
        {
          id: 'c',
          title: 'DATA PRIVACY AND PERSONAL INFORMATION',
          description: 'Protect privacy and personal identifiable information in compliance with regulations',
          keywords: ['privacy', 'PII', 'personal data', 'GDPR', 'consent'],
          topics: ['privacy controls', 'PII protection', 'consent management', 'data subject rights']
        },
        {
          id: 'd',
          title: 'DATA RETENTION AND SECURE DISPOSAL',
          description: 'Implement data retention policies and secure disposal procedures',
          keywords: ['retention', 'disposal', 'deletion', 'destruction', 'lifecycle'],
          topics: ['retention schedules', 'secure deletion', 'media sanitization']
        }
      ]
      // Add more categories as needed
    };
    
    return patterns[categoryName] || this.getDefaultPatterns();
  }

  private getDefaultPatterns(): any[] {
    return [
      {
        id: 'a',
        title: 'CORE REQUIREMENTS',
        description: 'Fundamental security requirements for this domain',
        keywords: [],
        topics: []
      },
      {
        id: 'b',
        title: 'IMPLEMENTATION STANDARDS',
        description: 'Standards and procedures for effective implementation',
        keywords: [],
        topics: []
      },
      {
        id: 'c',
        title: 'OPERATIONAL CONTROLS',
        description: 'Day-to-day operational security controls and procedures',
        keywords: [],
        topics: []
      },
      {
        id: 'd',
        title: 'MONITORING AND REVIEW',
        description: 'Continuous monitoring and periodic review processes',
        keywords: ['monitor', 'review', 'audit', 'assess'],
        topics: []
      }
    ];
  }

  private filterRequirementsForSection(requirements: MappedRequirement[], pattern: any): MappedRequirement[] {
    return requirements.filter(req => {
      const text = `${req.title} ${req.description} ${req.official_description || ''} ${req.audit_ready_guidance || ''}`.toLowerCase();
      
      // Check if requirement matches any keyword
      const matchesKeyword = pattern.keywords.some((keyword: string) => 
        text.includes(keyword.toLowerCase())
      );
      
      // Check if requirement matches any topic
      const matchesTopic = pattern.topics.some((topic: string) => 
        text.includes(topic.toLowerCase())
      );
      
      return matchesKeyword || matchesTopic;
    });
  }

  private generateDetailedCoreRequirements(requirements: MappedRequirement[], pattern: any): string[] {
    const coreRequirements: string[] = [];
    const processedConcepts = new Set<string>();
    
    // Group requirements by similar concepts
    const conceptGroups = this.groupByConcepts(requirements, pattern);
    
    conceptGroups.forEach(group => {
      const unifiedText = this.createDetailedUnifiedText(group, pattern);
      if (unifiedText && !processedConcepts.has(unifiedText)) {
        coreRequirements.push(unifiedText);
        processedConcepts.add(unifiedText);
      }
    });
    
    return coreRequirements;
  }

  private groupByConcepts(requirements: MappedRequirement[], pattern: any): MappedRequirement[][] {
    const groups: MappedRequirement[][] = [];
    const processed = new Set<string>();
    
    requirements.forEach(req => {
      if (processed.has(req.control_id)) return;
      
      const group = [req];
      processed.add(req.control_id);
      
      // Find similar requirements to group together
      requirements.forEach(otherReq => {
        if (otherReq.control_id !== req.control_id && !processed.has(otherReq.control_id)) {
          if (this.areSimilarRequirements(req, otherReq)) {
            group.push(otherReq);
            processed.add(otherReq.control_id);
          }
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }

  private areSimilarRequirements(req1: MappedRequirement, req2: MappedRequirement): boolean {
    const text1 = `${req1.title} ${req1.description}`.toLowerCase();
    const text2 = `${req2.title} ${req2.description}`.toLowerCase();
    
    // Check for common important terms
    const importantTerms = [
      'policy', 'procedure', 'access', 'authentication', 'encryption',
      'monitoring', 'review', 'assessment', 'incident', 'backup',
      'training', 'awareness', 'risk', 'control', 'audit'
    ];
    
    let commonTerms = 0;
    importantTerms.forEach(term => {
      if (text1.includes(term) && text2.includes(term)) {
        commonTerms++;
      }
    });
    
    return commonTerms >= 2; // Requirements are similar if they share 2+ important terms
  }

  private createDetailedUnifiedText(group: MappedRequirement[], pattern: any): string {
    if (group.length === 0) return '';
    
    // Extract detailed concepts from all requirements
    const concepts = this.extractDetailedConcepts(group);
    const frameworks = this.extractFrameworkReferences(group);
    
    // Build detailed unified text
    let unifiedText = '';
    
    if (group.length === 1) {
      // Single requirement - create detailed explanation
      const req = group[0];
      const details = this.extractKeyDetails(req);
      unifiedText = this.formatSingleRequirement(details, req);
    } else {
      // Multiple requirements - create comprehensive unified text
      unifiedText = this.formatMultipleRequirements(concepts, group);
    }
    
    // Add framework references
    unifiedText += ` [${frameworks}]`;
    
    return unifiedText;
  }

  private extractDetailedConcepts(requirements: MappedRequirement[]): Map<string, Set<string>> {
    const concepts = new Map<string, Set<string>>();
    
    // Categories of concepts to extract
    const categories = {
      'actions': ['establish', 'implement', 'maintain', 'document', 'review', 'monitor', 'assess', 'ensure', 'define', 'develop'],
      'subjects': ['policy', 'procedure', 'control', 'framework', 'system', 'process', 'standard', 'guideline'],
      'attributes': ['security', 'risk', 'access', 'authentication', 'encryption', 'incident', 'vulnerability'],
      'requirements': ['must', 'shall', 'require', 'necessary', 'critical', 'essential']
    };
    
    requirements.forEach(req => {
      const text = `${req.title} ${req.description} ${req.official_description || ''} ${req.audit_ready_guidance || ''}`.toLowerCase();
      
      Object.entries(categories).forEach(([category, terms]) => {
        if (!concepts.has(category)) {
          concepts.set(category, new Set<string>());
        }
        
        terms.forEach(term => {
          if (text.includes(term)) {
            // Extract the phrase containing this term
            const phrase = this.extractPhrase(text, term);
            if (phrase) {
              concepts.get(category)!.add(phrase);
            }
          }
        });
      });
    });
    
    return concepts;
  }

  private extractPhrase(text: string, term: string): string {
    const words = text.split(/\s+/);
    const index = words.findIndex(word => word.includes(term));
    
    if (index === -1) return term;
    
    // Extract surrounding context (2 words before and after)
    const start = Math.max(0, index - 2);
    const end = Math.min(words.length, index + 3);
    
    return words.slice(start, end).join(' ');
  }

  private extractKeyDetails(req: MappedRequirement): string[] {
    const details: string[] = [];
    const text = `${req.description} ${req.official_description || ''} ${req.audit_ready_guidance || ''}`;
    
    // Extract specific requirements
    const patterns = [
      /must\s+[\w\s]+/gi,
      /shall\s+[\w\s]+/gi,
      /require[sd]?\s+[\w\s]+/gi,
      /including\s+[\w\s,]+/gi,
      /such as\s+[\w\s,]+/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().substring(0, 100); // Limit length
          if (cleaned.length > 10) { // Filter out very short matches
            details.push(cleaned);
          }
        });
      }
    });
    
    return Array.from(new Set(details)); // Remove duplicates
  }

  private formatSingleRequirement(details: string[], req: MappedRequirement): string {
    let formatted = '';
    
    // Start with the main action or requirement
    const mainAction = this.extractMainAction(req.description);
    
    // Build comprehensive text
    if (req.title.toLowerCase().includes('personnel') || req.title.toLowerCase().includes('employee')) {
      // Personnel security specific formatting
      formatted = this.formatPersonnelRequirement(req, details);
    } else if (req.title.toLowerCase().includes('access')) {
      // Access control specific formatting
      formatted = this.formatAccessRequirement(req, details);
    } else if (req.title.toLowerCase().includes('risk')) {
      // Risk management specific formatting
      formatted = this.formatRiskRequirement(req, details);
    } else {
      // Generic formatting
      formatted = `${this.capitalize(mainAction)} ${req.title.toLowerCase()}`;
      
      if (details.length > 0) {
        formatted += ` including ${details[0].toLowerCase()}`;
      }
    }
    
    return formatted;
  }

  private formatPersonnelRequirement(req: MappedRequirement, details: string[]): string {
    const components: string[] = [];
    
    const text = `${req.title} ${req.description}`.toLowerCase();
    
    if (text.includes('screening') || text.includes('background')) {
      components.push('background screening');
    }
    if (text.includes('nda') || text.includes('confidentiality') || text.includes('non-disclosure')) {
      components.push('confidentiality agreements');
    }
    if (text.includes('training') || text.includes('awareness')) {
      components.push('security awareness training');
    }
    if (text.includes('disciplinary')) {
      components.push('disciplinary procedures');
    }
    if (text.includes('termination') || text.includes('offboarding')) {
      components.push('termination procedures');
    }
    
    if (components.length === 0) {
      return `Implement personnel security controls`;
    }
    
    return `Implement personnel security framework including ${components.join(', ')}`;
  }

  private formatAccessRequirement(req: MappedRequirement, details: string[]): string {
    const components: string[] = [];
    
    const text = `${req.title} ${req.description}`.toLowerCase();
    
    if (text.includes('grant')) {
      components.push('access granting processes');
    }
    if (text.includes('revok') || text.includes('remov')) {
      components.push('access revocation procedures');
    }
    if (text.includes('review')) {
      components.push('periodic access reviews');
    }
    if (text.includes('privilege')) {
      components.push('privileged access management');
    }
    if (text.includes('mfa') || text.includes('multi-factor')) {
      components.push('multi-factor authentication');
    }
    
    if (components.length === 0) {
      return `Establish access control mechanisms`;
    }
    
    return `Establish ${components.join(', ')} with formal approval workflows`;
  }

  private formatRiskRequirement(req: MappedRequirement, details: string[]): string {
    const components: string[] = [];
    
    const text = `${req.title} ${req.description}`.toLowerCase();
    
    if (text.includes('assessment')) {
      components.push('risk assessment methodology');
    }
    if (text.includes('treatment')) {
      components.push('risk treatment plans');
    }
    if (text.includes('monitor')) {
      components.push('continuous monitoring');
    }
    if (text.includes('review')) {
      components.push('periodic reviews');
    }
    if (text.includes('register')) {
      components.push('risk register management');
    }
    
    if (components.length === 0) {
      return `Implement risk management processes`;
    }
    
    return `Implement ${components.join(', ')} aligned with business objectives`;
  }

  private formatMultipleRequirements(concepts: Map<string, Set<string>>, requirements: MappedRequirement[]): string {
    // Determine the main theme
    const theme = this.determineMainTheme(requirements);
    
    // Extract all important components
    const components = this.extractAllComponents(requirements);
    
    // Build comprehensive unified text
    let unifiedText = '';
    
    switch (theme) {
      case 'personnel':
        unifiedText = this.buildPersonnelText(components);
        break;
      case 'access':
        unifiedText = this.buildAccessText(components);
        break;
      case 'risk':
        unifiedText = this.buildRiskText(components);
        break;
      case 'data':
        unifiedText = this.buildDataText(components);
        break;
      default:
        unifiedText = this.buildGenericText(components);
    }
    
    return unifiedText;
  }

  private determineMainTheme(requirements: MappedRequirement[]): string {
    const themes = new Map<string, number>();
    
    requirements.forEach(req => {
      const text = `${req.title} ${req.description}`.toLowerCase();
      
      if (text.includes('personnel') || text.includes('employee')) themes.set('personnel', (themes.get('personnel') || 0) + 1);
      if (text.includes('access')) themes.set('access', (themes.get('access') || 0) + 1);
      if (text.includes('risk')) themes.set('risk', (themes.get('risk') || 0) + 1);
      if (text.includes('data') || text.includes('information')) themes.set('data', (themes.get('data') || 0) + 1);
    });
    
    // Return theme with highest count
    let maxTheme = 'generic';
    let maxCount = 0;
    
    themes.forEach((count, theme) => {
      if (count > maxCount) {
        maxCount = count;
        maxTheme = theme;
      }
    });
    
    return maxTheme;
  }

  private extractAllComponents(requirements: MappedRequirement[]): Set<string> {
    const components = new Set<string>();
    
    requirements.forEach(req => {
      const text = `${req.title} ${req.description} ${req.official_description || ''}`.toLowerCase();
      
      // Extract specific security components mentioned
      const componentPatterns = [
        /background check/gi,
        /confidentiality agreement/gi,
        /non-disclosure agreement/gi,
        /security training/gi,
        /awareness program/gi,
        /disciplinary process/gi,
        /termination procedure/gi,
        /access control/gi,
        /authentication/gi,
        /authorization/gi,
        /encryption/gi,
        /monitoring/gi,
        /logging/gi,
        /audit/gi,
        /incident response/gi,
        /backup/gi,
        /recovery/gi,
        /vulnerability management/gi,
        /patch management/gi,
        /configuration management/gi
      ];
      
      componentPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => components.add(match.toLowerCase()));
        }
      });
    });
    
    return components;
  }

  private buildPersonnelText(components: Set<string>): string {
    const items = Array.from(components);
    
    if (items.length === 0) {
      return 'Implement comprehensive personnel security controls';
    }
    
    let text = 'Implement personnel security framework encompassing ';
    
    // Group related items
    const screening = items.filter(i => i.includes('background') || i.includes('screening'));
    const agreements = items.filter(i => i.includes('confidentiality') || i.includes('nda') || i.includes('non-disclosure'));
    const training = items.filter(i => i.includes('training') || i.includes('awareness'));
    const processes = items.filter(i => i.includes('disciplinary') || i.includes('termination'));
    
    const parts: string[] = [];
    
    if (screening.length > 0) parts.push('pre-employment screening');
    if (agreements.length > 0) parts.push('confidentiality and non-disclosure agreements');
    if (training.length > 0) parts.push('security awareness training programs');
    if (processes.length > 0) parts.push('disciplinary and termination procedures');
    
    text += this.joinWithProperGrammar(parts);
    
    return text;
  }

  private buildAccessText(components: Set<string>): string {
    const items = Array.from(components);
    
    if (items.length === 0) {
      return 'Establish comprehensive access control mechanisms';
    }
    
    let text = 'Establish access control framework with ';
    
    const parts: string[] = [];
    
    if (items.some(i => i.includes('grant'))) parts.push('formal access granting processes');
    if (items.some(i => i.includes('revok'))) parts.push('revocation procedures');
    if (items.some(i => i.includes('review'))) parts.push('periodic access reviews');
    if (items.some(i => i.includes('mfa') || i.includes('multi-factor'))) parts.push('multi-factor authentication requirements');
    if (items.some(i => i.includes('privilege'))) parts.push('privileged access management');
    
    text += this.joinWithProperGrammar(parts);
    
    return text;
  }

  private buildRiskText(components: Set<string>): string {
    const items = Array.from(components);
    
    if (items.length === 0) {
      return 'Implement comprehensive risk management framework';
    }
    
    let text = 'Establish risk management framework incorporating ';
    
    const parts: string[] = [];
    
    if (items.some(i => i.includes('assessment'))) parts.push('systematic risk assessment methodology');
    if (items.some(i => i.includes('treatment'))) parts.push('risk treatment planning');
    if (items.some(i => i.includes('monitor'))) parts.push('continuous monitoring processes');
    if (items.some(i => i.includes('register'))) parts.push('risk register management');
    if (items.some(i => i.includes('review'))) parts.push('periodic effectiveness reviews');
    
    text += this.joinWithProperGrammar(parts);
    
    return text;
  }

  private buildDataText(components: Set<string>): string {
    const items = Array.from(components);
    
    if (items.length === 0) {
      return 'Implement comprehensive data protection controls';
    }
    
    let text = 'Implement data protection measures including ';
    
    const parts: string[] = [];
    
    if (items.some(i => i.includes('classification'))) parts.push('data classification schemes');
    if (items.some(i => i.includes('encryption'))) parts.push('encryption for data at rest and in transit');
    if (items.some(i => i.includes('retention'))) parts.push('retention and disposal policies');
    if (items.some(i => i.includes('privacy'))) parts.push('privacy protection controls');
    if (items.some(i => i.includes('backup'))) parts.push('backup and recovery procedures');
    
    text += this.joinWithProperGrammar(parts);
    
    return text;
  }

  private buildGenericText(components: Set<string>): string {
    const items = Array.from(components);
    
    if (items.length === 0) {
      return 'Implement appropriate security controls';
    }
    
    if (items.length === 1) {
      return `Implement ${items[0]}`;
    }
    
    return `Implement ${this.joinWithProperGrammar(items)}`;
  }

  private joinWithProperGrammar(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    
    const lastItem = items.pop();
    return `${items.join(', ')}, and ${lastItem}`;
  }

  private extractMainAction(text: string): string {
    const actions = [
      'establish', 'implement', 'develop', 'maintain', 'ensure',
      'define', 'document', 'review', 'monitor', 'assess'
    ];
    
    const lowerText = text.toLowerCase();
    
    for (const action of actions) {
      if (lowerText.includes(action)) {
        return action;
      }
    }
    
    return 'implement';
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private extractFrameworkReferences(requirements: MappedRequirement[]): string {
    const refs: Map<string, string[]> = new Map();
    
    requirements.forEach(req => {
      const framework = this.getShortFrameworkName(req.framework);
      if (!refs.has(framework)) {
        refs.set(framework, []);
      }
      refs.get(framework)!.push(req.control_id);
    });
    
    const formattedRefs: string[] = [];
    refs.forEach((controls, framework) => {
      formattedRefs.push(`${framework}: ${controls.join(', ')}`);
    });
    
    return formattedRefs.join(' | ');
  }

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

export const enhancedUnifiedContentGenerator = new EnhancedUnifiedContentGenerator();