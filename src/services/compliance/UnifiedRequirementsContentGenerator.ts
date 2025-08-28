import { supabase } from '@/lib/supabase';

interface MappedRequirement {
  control_id: string;
  title: string;
  description: string;
  framework: string;
}

interface UnifiedSection {
  id: string;
  title: string;
  description: string;
  coreRequirements: string[];
}

export class UnifiedRequirementsContentGenerator {
  /**
   * Generate unified requirements content for a category based on selected frameworks
   */
  async generateUnifiedContent(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<UnifiedSection[]> {
    // Fetch all mapped requirements for this category and selected frameworks
    const requirements = await this.fetchMappedRequirements(categoryName, selectedFrameworks, cisIGLevel);
    
    // Group requirements by theme/topic
    const groupedRequirements = this.groupRequirementsByTheme(requirements);
    
    // Generate unified sections based on the category
    return this.generateSectionsForCategory(categoryName, groupedRequirements);
  }

  private async fetchMappedRequirements(
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
        standard:standards_library(name)
      `)
      .eq('category', categoryName)
      .eq('is_active', true)
      .in('standards_library.name', frameworkNames);

    if (error) throw error;
    
    return (data || []).map(req => ({
      control_id: req.control_id,
      title: req.title,
      description: req.description,
      framework: req.standard?.name || ''
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

  private groupRequirementsByTheme(requirements: MappedRequirement[]): Map<string, MappedRequirement[]> {
    const themes = new Map<string, MappedRequirement[]>();
    
    requirements.forEach(req => {
      // Determine theme based on keywords in title and description
      const theme = this.determineTheme(req);
      
      if (!themes.has(theme)) {
        themes.set(theme, []);
      }
      themes.get(theme)!.push(req);
    });
    
    return themes;
  }

  private determineTheme(req: MappedRequirement): string {
    const text = (req.title + ' ' + req.description).toLowerCase();
    
    // Theme detection based on keywords
    if (text.includes('leadership') || text.includes('commitment') || text.includes('accountability')) {
      return 'leadership';
    }
    if (text.includes('scope') || text.includes('boundar') || text.includes('definition')) {
      return 'scope';
    }
    if (text.includes('role') || text.includes('responsibilit') || text.includes('structure')) {
      return 'structure';
    }
    if (text.includes('policy') || text.includes('procedure') || text.includes('document')) {
      return 'policy';
    }
    if (text.includes('risk') && (text.includes('assessment') || text.includes('analysis'))) {
      return 'risk_assessment';
    }
    if (text.includes('risk') && (text.includes('treatment') || text.includes('mitigation'))) {
      return 'risk_treatment';
    }
    if (text.includes('monitor') || text.includes('review') || text.includes('measure')) {
      return 'monitoring';
    }
    if (text.includes('training') || text.includes('awareness') || text.includes('education')) {
      return 'awareness';
    }
    if (text.includes('incident') || text.includes('response') || text.includes('breach')) {
      return 'incident';
    }
    if (text.includes('access') || text.includes('authentication') || text.includes('authorization')) {
      return 'access';
    }
    if (text.includes('encrypt') || text.includes('cryptograph')) {
      return 'encryption';
    }
    if (text.includes('backup') || text.includes('recovery') || text.includes('continuity')) {
      return 'continuity';
    }
    if (text.includes('supplier') || text.includes('third') || text.includes('vendor')) {
      return 'supplier';
    }
    if (text.includes('physic') || text.includes('environment')) {
      return 'physical';
    }
    
    return 'general';
  }

  private generateSectionsForCategory(
    categoryName: string,
    groupedRequirements: Map<string, MappedRequirement[]>
  ): UnifiedSection[] {
    // Define section templates based on category
    const sectionTemplates = this.getSectionTemplates(categoryName);
    const sections: UnifiedSection[] = [];
    
    sectionTemplates.forEach(template => {
      const relevantRequirements = this.getRequirementsForSection(template.theme, groupedRequirements);
      
      if (relevantRequirements.length > 0) {
        const coreRequirements = this.generateCoreRequirements(relevantRequirements, template.focus);
        
        sections.push({
          id: template.id,
          title: template.title,
          description: template.description,
          coreRequirements
        });
      }
    });
    
    return sections;
  }

  private getSectionTemplates(categoryName: string): any[] {
    const templates: { [key: string]: any[] } = {
      'Governance & Leadership': [
        {
          id: 'a',
          title: 'LEADERSHIP COMMITMENT AND ACCOUNTABILITY',
          description: 'Establish visible executive commitment to information security with clear accountability structures',
          theme: 'leadership',
          focus: ['commitment', 'accountability', 'management review']
        },
        {
          id: 'b',
          title: 'SCOPE AND BOUNDARIES DEFINITION',
          description: 'Define and document the scope of information security management system',
          theme: 'scope',
          focus: ['scope definition', 'boundaries', 'interfaces']
        },
        {
          id: 'c',
          title: 'ORGANIZATIONAL STRUCTURE',
          description: 'Establish clear roles, responsibilities, and reporting lines',
          theme: 'structure',
          focus: ['roles', 'responsibilities', 'hierarchy']
        },
        {
          id: 'd',
          title: 'POLICY FRAMEWORK',
          description: 'Develop and maintain comprehensive security policies and procedures',
          theme: 'policy',
          focus: ['policies', 'procedures', 'standards']
        }
      ],
      'Risk Management': [
        {
          id: 'a',
          title: 'RISK MANAGEMENT FRAMEWORK',
          description: 'Establish comprehensive risk management framework aligned with business objectives',
          theme: 'risk_assessment',
          focus: ['framework', 'methodology', 'criteria']
        },
        {
          id: 'b',
          title: 'RISK ASSESSMENT METHODOLOGY',
          description: 'Implement systematic risk assessment processes',
          theme: 'risk_assessment',
          focus: ['assessment', 'analysis', 'evaluation']
        },
        {
          id: 'c',
          title: 'RISK TREATMENT PLANNING',
          description: 'Develop and implement risk treatment plans',
          theme: 'risk_treatment',
          focus: ['treatment', 'controls', 'mitigation']
        },
        {
          id: 'd',
          title: 'RISK MONITORING AND REVIEW',
          description: 'Continuous risk monitoring and periodic reviews',
          theme: 'monitoring',
          focus: ['monitoring', 'review', 'metrics']
        }
      ],
      'Identity & Access Management': [
        {
          id: 'a',
          title: 'ACCESS CONTROL FRAMEWORK',
          description: 'Establish comprehensive access control policies and procedures',
          theme: 'access',
          focus: ['access control', 'authorization', 'least privilege']
        },
        {
          id: 'b',
          title: 'USER IDENTITY MANAGEMENT',
          description: 'Implement identity lifecycle management processes',
          theme: 'access',
          focus: ['identity management', 'provisioning', 'deprovisioning']
        },
        {
          id: 'c',
          title: 'AUTHENTICATION MECHANISMS',
          description: 'Deploy strong authentication controls including multi-factor authentication',
          theme: 'access',
          focus: ['authentication', 'MFA', 'strong authentication']
        },
        {
          id: 'd',
          title: 'PRIVILEGED ACCESS MANAGEMENT',
          description: 'Control and monitor privileged access to critical systems',
          theme: 'access',
          focus: ['privileged access', 'administrative access', 'monitoring']
        }
      ],
      'Data Protection': [
        {
          id: 'a',
          title: 'DATA CLASSIFICATION AND HANDLING',
          description: 'Classify information assets and establish appropriate handling procedures',
          theme: 'classification',
          focus: ['classification', 'labeling', 'handling']
        },
        {
          id: 'b',
          title: 'ENCRYPTION AND CRYPTOGRAPHY',
          description: 'Implement encryption for data protection at rest and in transit',
          theme: 'encryption',
          focus: ['encryption', 'cryptography', 'key management']
        },
        {
          id: 'c',
          title: 'DATA PRIVACY CONTROLS',
          description: 'Ensure privacy protection for personal and sensitive data',
          theme: 'privacy',
          focus: ['privacy', 'personal data', 'GDPR compliance']
        },
        {
          id: 'd',
          title: 'DATA RETENTION AND DISPOSAL',
          description: 'Manage data lifecycle including retention and secure disposal',
          theme: 'retention',
          focus: ['retention', 'disposal', 'destruction']
        }
      ]
      // Add more categories as needed
    };
    
    return templates[categoryName] || this.getDefaultSectionTemplates();
  }

  private getDefaultSectionTemplates(): any[] {
    return [
      {
        id: 'a',
        title: 'CORE REQUIREMENTS',
        description: 'Fundamental requirements for this security domain',
        theme: 'general',
        focus: []
      },
      {
        id: 'b',
        title: 'IMPLEMENTATION STANDARDS',
        description: 'Standards and procedures for implementation',
        theme: 'general',
        focus: []
      },
      {
        id: 'c',
        title: 'OPERATIONAL CONTROLS',
        description: 'Day-to-day operational security controls',
        theme: 'general',
        focus: []
      },
      {
        id: 'd',
        title: 'MONITORING AND REVIEW',
        description: 'Continuous monitoring and periodic review processes',
        theme: 'monitoring',
        focus: []
      }
    ];
  }

  private getRequirementsForSection(
    theme: string,
    groupedRequirements: Map<string, MappedRequirement[]>
  ): MappedRequirement[] {
    const requirements: MappedRequirement[] = [];
    
    // Get direct theme matches
    if (groupedRequirements.has(theme)) {
      requirements.push(...groupedRequirements.get(theme)!);
    }
    
    // Also include general requirements if section needs them
    if (groupedRequirements.has('general') && requirements.length < 3) {
      requirements.push(...groupedRequirements.get('general')!);
    }
    
    return requirements;
  }

  private generateCoreRequirements(
    requirements: MappedRequirement[],
    focusAreas: string[]
  ): string[] {
    const coreRequirements: string[] = [];
    const processedTopics = new Set<string>();
    
    // Group similar requirements together
    const topicGroups = this.groupByTopic(requirements);
    
    topicGroups.forEach((reqs, topic) => {
      if (!processedTopics.has(topic)) {
        const unifiedText = this.createUnifiedText(reqs, focusAreas);
        if (unifiedText) {
          coreRequirements.push(unifiedText);
          processedTopics.add(topic);
        }
      }
    });
    
    return coreRequirements;
  }

  private groupByTopic(requirements: MappedRequirement[]): Map<string, MappedRequirement[]> {
    const topics = new Map<string, MappedRequirement[]>();
    
    requirements.forEach(req => {
      const topic = this.extractMainTopic(req);
      if (!topics.has(topic)) {
        topics.set(topic, []);
      }
      topics.get(topic)!.push(req);
    });
    
    return topics;
  }

  private extractMainTopic(req: MappedRequirement): string {
    // Extract the main topic from the requirement title
    const title = req.title.toLowerCase();
    
    // Common security topics
    const topics = [
      'access control', 'authentication', 'authorization', 'encryption',
      'incident response', 'risk assessment', 'risk treatment', 'monitoring',
      'awareness', 'training', 'backup', 'recovery', 'policy', 'procedure',
      'audit', 'review', 'physical security', 'network security', 'vulnerability'
    ];
    
    for (const topic of topics) {
      if (title.includes(topic)) {
        return topic;
      }
    }
    
    // Default to first few words of title
    return title.split(' ').slice(0, 3).join(' ');
  }

  private createUnifiedText(
    requirements: MappedRequirement[],
    focusAreas: string[]
  ): string {
    if (requirements.length === 0) return '';
    
    // Extract key concepts from all requirements
    const concepts = new Set<string>();
    const actions = new Set<string>();
    const frameworks = new Set<string>();
    
    requirements.forEach(req => {
      // Extract key concepts from description
      const keyPhrases = this.extractKeyPhrases(req.description);
      keyPhrases.forEach(phrase => concepts.add(phrase));
      
      // Track which frameworks require this
      frameworks.add(req.framework);
      
      // Extract action verbs
      const actionVerbs = this.extractActionVerbs(req.description);
      actionVerbs.forEach(verb => actions.add(verb));
    });
    
    // Build unified text
    let unifiedText = '';
    
    // Determine the main action
    const mainAction = this.selectMainAction(Array.from(actions));
    
    // Create the unified requirement text
    if (requirements.length === 1) {
      // Single requirement - use its description with framework reference
      const req = requirements[0];
      unifiedText = `${this.enhanceDescription(req.description)} [${this.getFrameworkRef(req)}]`;
    } else {
      // Multiple requirements - create unified text
      const unifiedConcepts = this.combineConceptsIntoText(Array.from(concepts), mainAction);
      const frameworkRefs = this.formatFrameworkReferences(requirements);
      unifiedText = `${unifiedConcepts} [${frameworkRefs}]`;
    }
    
    return unifiedText;
  }

  private extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];
    
    // Common security phrases to extract
    const patterns = [
      /security controls?/gi,
      /risk assessment/gi,
      /access control/gi,
      /incident response/gi,
      /vulnerability management/gi,
      /security awareness/gi,
      /backup and recovery/gi,
      /encryption/gi,
      /authentication/gi,
      /authorization/gi,
      /monitoring/gi,
      /audit log/gi,
      /security policy/gi,
      /security procedures?/gi,
      /security training/gi,
      /third[- ]party/gi,
      /supplier management/gi,
      /physical security/gi,
      /network security/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => phrases.push(match.toLowerCase()));
      }
    });
    
    return [...new Set(phrases)]; // Remove duplicates
  }

  private extractActionVerbs(text: string): string[] {
    const verbs = [];
    
    // Common action verbs in security requirements
    const actionVerbs = [
      'establish', 'implement', 'maintain', 'document', 'review',
      'monitor', 'assess', 'evaluate', 'control', 'protect',
      'ensure', 'verify', 'validate', 'approve', 'authorize',
      'authenticate', 'encrypt', 'audit', 'log', 'report'
    ];
    
    const lowerText = text.toLowerCase();
    actionVerbs.forEach(verb => {
      if (lowerText.includes(verb)) {
        verbs.push(verb);
      }
    });
    
    return verbs;
  }

  private selectMainAction(actions: string[]): string {
    // Priority order for action verbs
    const priorityOrder = [
      'establish', 'implement', 'ensure', 'maintain', 'control',
      'protect', 'monitor', 'assess', 'document', 'review'
    ];
    
    for (const priority of priorityOrder) {
      if (actions.includes(priority)) {
        return priority;
      }
    }
    
    return actions[0] || 'implement';
  }

  private combineConceptsIntoText(concepts: string[], mainAction: string): string {
    if (concepts.length === 0) {
      return `${this.capitalize(mainAction)} appropriate security controls`;
    }
    
    if (concepts.length === 1) {
      return `${this.capitalize(mainAction)} ${concepts[0]}`;
    }
    
    if (concepts.length === 2) {
      return `${this.capitalize(mainAction)} ${concepts[0]} and ${concepts[1]}`;
    }
    
    // Multiple concepts - list the main ones
    const mainConcepts = concepts.slice(0, 3);
    const lastConcept = mainConcepts.pop();
    return `${this.capitalize(mainAction)} ${mainConcepts.join(', ')}, and ${lastConcept}`;
  }

  private enhanceDescription(description: string): string {
    // Clean up and enhance the description
    let enhanced = description.trim();
    
    // Ensure it starts with a capital letter
    enhanced = this.capitalize(enhanced);
    
    // Remove redundant words
    enhanced = enhanced.replace(/\s+/g, ' ');
    
    // Make sure it's a complete sentence
    if (!enhanced.match(/[.!?]$/)) {
      enhanced += '.';
    }
    
    return enhanced;
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private getFrameworkRef(req: MappedRequirement): string {
    const frameworkMap: { [key: string]: string } = {
      'ISO/IEC 27001': 'ISO 27001',
      'ISO/IEC 27002': 'ISO 27002',
      'CIS Controls Implementation Group 1 (IG1)': 'CIS IG1',
      'CIS Controls Implementation Group 2 (IG2)': 'CIS IG2',
      'CIS Controls Implementation Group 3 (IG3)': 'CIS IG3',
      'NIS2 Directive': 'NIS2',
      'GDPR': 'GDPR'
    };
    
    const framework = frameworkMap[req.framework] || req.framework;
    return `${framework}: ${req.control_id}`;
  }

  private formatFrameworkReferences(requirements: MappedRequirement[]): string {
    const refs: { [key: string]: string[] } = {};
    
    requirements.forEach(req => {
      const framework = this.getShortFrameworkName(req.framework);
      if (!refs[framework]) {
        refs[framework] = [];
      }
      refs[framework].push(req.control_id);
    });
    
    const formattedRefs: string[] = [];
    Object.keys(refs).forEach(framework => {
      const controls = refs[framework].join(', ');
      formattedRefs.push(`${framework}: ${controls}`);
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

export const unifiedRequirementsContentGenerator = new UnifiedRequirementsContentGenerator();