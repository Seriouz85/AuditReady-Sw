import { supabase } from '@/lib/supabase';

export interface DetailedRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  category: string;
  keywords: string[];
  implementation: string[];
  controls: string[];
  evidence: string[];
}

export interface UnifiedRequirementMapping {
  unifiedId: string;
  unifiedTitle: string;
  unifiedDescription: string;
  subRequirements: string[];
  mappedRequirements: DetailedRequirement[];
  coverage: {
    keywords: string[];
    implementations: string[];
    controls: string[];
    frameworks: string[];
  };
  completeness: number; // 0-1 score
}

export interface ComplianceAuditResult {
  totalRequirements: number;
  mappedRequirements: number;
  unmappedRequirements: DetailedRequirement[];
  incompleteMappings: UnifiedRequirementMapping[];
  coverageScore: number;
  missingKeywords: string[];
  recommendations: string[];
}

export class ProGradeComplianceEngine {
  private implementationPatterns: Map<string, string[]> = new Map();
  private controlMappings: Map<string, string[]> = new Map();

  constructor() {
    this.initializeFrameworkPatterns();
  }

  private initializeFrameworkPatterns() {
    // ISO 27001/27002 implementation patterns
    this.implementationPatterns.set('governance', [
      'Establish written information security policy approved by management',
      'Define organizational roles and responsibilities with clear accountability',
      'Implement management review processes at planned intervals',
      'Ensure top management demonstrates visible commitment and leadership',
      'Allocate sufficient resources for information security implementation'
    ]);

    this.implementationPatterns.set('screening', [
      'Conduct background verification checks on all employment candidates',
      'Verify identity, qualifications, and employment history through reliable sources',
      'Perform credit checks and criminal background screening where legally permitted',
      'Document screening procedures and maintain records according to legal requirements',
      'Re-screen personnel at regular intervals for sensitive positions',
      'Implement enhanced screening for privileged access roles'
    ]);

    this.implementationPatterns.set('access-control', [
      'Implement role-based access control (RBAC) with principle of least privilege',
      'Establish user provisioning and de-provisioning procedures',
      'Deploy multi-factor authentication for privileged accounts',
      'Conduct regular access reviews and recertification processes',
      'Monitor and log all access attempts and activities'
    ]);

    this.implementationPatterns.set('data-protection', [
      'Classify data according to sensitivity and business value',
      'Implement encryption for data at rest and in transit',
      'Establish data retention and secure disposal procedures',
      'Deploy data loss prevention (DLP) technologies',
      'Conduct privacy impact assessments for new processing activities'
    ]);

    this.implementationPatterns.set('incident-response', [
      'Establish 24/7 incident response capability with clear escalation procedures',
      'Develop incident classification and severity rating systems',
      'Implement automated detection and alerting mechanisms',
      'Conduct regular incident response training and tabletop exercises',
      'Maintain forensic capabilities and evidence handling procedures'
    ]);

    this.implementationPatterns.set('risk-management', [
      'Conduct comprehensive risk assessments using structured methodologies',
      'Maintain risk registers with regular updates and reviews',
      'Implement risk treatment plans with clear timelines and ownership',
      'Monitor risk indicators and thresholds continuously',
      'Report risk status to management with actionable insights'
    ]);

    this.implementationPatterns.set('physical-security', [
      'Deploy layered physical security controls (perimeter, building, room level)',
      'Implement visitor management and escort procedures',
      'Install surveillance systems with appropriate monitoring and retention',
      'Secure equipment with locks, cables, and environmental controls',
      'Establish secure media handling and disposal procedures'
    ]);

    this.implementationPatterns.set('network-security', [
      'Implement network segmentation with firewalls and access controls',
      'Deploy intrusion detection and prevention systems (IDS/IPS)',
      'Monitor network traffic for anomalies and security events',
      'Establish secure remote access with VPN and endpoint security',
      'Conduct regular network security assessments and penetration testing'
    ]);

    // Control mappings for different frameworks
    this.controlMappings.set('iso27001', [
      'A.5.1 - Information security policies',
      'A.6.1 - Management responsibilities',
      'A.7.1 - Screening',
      'A.8.1 - Classification of information',
      'A.9.1 - Access control management'
    ]);

    this.controlMappings.set('gdpr', [
      'Art. 25 - Data protection by design and by default',
      'Art. 32 - Security of processing',
      'Art. 35 - Data protection impact assessment',
      'Art. 33 - Notification of personal data breach',
      'Art. 30 - Records of processing activities'
    ]);

    this.controlMappings.set('nis2', [
      'Art. 21 - Cybersecurity risk management measures',
      'Art. 23 - Incident reporting',
      'Art. 24 - Business continuity measures',
      'Art. 26 - Vulnerability handling',
      'Art. 28 - Coordination and information sharing'
    ]);
  }

  /**
   * Comprehensive audit of framework requirement coverage
   */
  async auditRequirementCoverage(
    selectedFrameworks: string[],
    existingMappings: any[]
  ): Promise<ComplianceAuditResult> {
    // Get all requirements for selected frameworks
    const allRequirements = await this.getAllFrameworkRequirements(selectedFrameworks);
    
    // Analyze coverage
    const mappedRequirementIds = new Set(
      existingMappings.flatMap(mapping => 
        Object.values(mapping.frameworks).flat().map((req: any) => req.code)
      )
    );

    const unmappedRequirements = allRequirements.filter(req => 
      !mappedRequirementIds.has(req.code)
    );

    // Extract all keywords from requirements
    const allKeywords = new Set<string>();
    allRequirements.forEach(req => {
      this.extractKeywords(`${req.title} ${req.description}`).forEach(kw => 
        allKeywords.add(kw)
      );
    });

    // Check unified requirements coverage
    const unifiedKeywords = new Set<string>();
    existingMappings.forEach(mapping => {
      this.extractKeywords(
        `${mapping.auditReadyUnified.title} ${mapping.auditReadyUnified.description} ${mapping.auditReadyUnified.subRequirements.join(' ')}`
      ).forEach(kw => unifiedKeywords.add(kw));
    });

    const missingKeywords = Array.from(allKeywords).filter(kw => 
      !unifiedKeywords.has(kw)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      unmappedRequirements,
      missingKeywords
    );

    return {
      totalRequirements: allRequirements.length,
      mappedRequirements: allRequirements.length - unmappedRequirements.length,
      unmappedRequirements,
      incompleteMappings: [],
      coverageScore: (allRequirements.length - unmappedRequirements.length) / allRequirements.length,
      missingKeywords,
      recommendations
    };
  }

  /**
   * Generate enhanced unified requirements with comprehensive coverage
   */
  async generateEnhancedUnifiedRequirements(
    category: string,
    selectedFrameworks: string[]
  ): Promise<UnifiedRequirementMapping[]> {
    const categoryRequirements = await this.getCategoryRequirements(category, selectedFrameworks);
    
    // Group requirements by similarity and purpose
    const requirementGroups = this.groupRequirementsByPurpose(categoryRequirements);
    
    const enhancedMappings: UnifiedRequirementMapping[] = [];

    for (const group of requirementGroups) {
      const unifiedMapping = await this.createUnifiedMapping(group, category);
      enhancedMappings.push(unifiedMapping);
    }

    return enhancedMappings;
  }

  private async getAllFrameworkRequirements(frameworks: string[]): Promise<DetailedRequirement[]> {
    try {
      const { data: requirements, error } = await supabase
        .from('requirements_library')
        .select(`
          id,
          requirement_code,
          title,
          official_description,
          category,
          standard:standards_library(code, name)
        `)
        .in('standards_library.code', frameworks.map(f => f.toUpperCase()));

      if (error) throw error;

      return (requirements || []).map((req: any) => ({
        id: req.id,
        code: req.requirement_code,
        title: req.title,
        description: req.official_description,
        framework: req.standard?.code?.toLowerCase() || 'unknown',
        category: req.category || 'General',
        keywords: this.extractKeywords(`${req.title} ${req.official_description}`),
        implementation: this.getImplementationGuidance(req.title, req.official_description),
        controls: this.getControlMappings(req.standard?.code?.toLowerCase() || 'unknown'),
        evidence: this.getEvidenceRequirements(req.title, req.official_description)
      }));
    } catch (error) {
      console.error('Error fetching framework requirements:', error);
      return [];
    }
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 
      'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 
      'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall', 'should', 'ensure', 'establish', 
      'implement', 'maintain', 'provide', 'include', 'require', 'necessary', 'appropriate', 'relevant', 'all'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => !word.match(/^\d+$/)); // Remove pure numbers
  }

  private getImplementationGuidance(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const guidance: string[] = [];

    // Extract specific requirements from the text itself
    const specificRequirements = this.extractSpecificRequirements(text);
    guidance.push(...specificRequirements);

    // Match against implementation patterns
    for (const [key, patterns] of this.implementationPatterns.entries()) {
      if (text.includes(key) || this.containsKeywordVariants(text, key)) {
        guidance.push(...patterns);
      }
    }

    // Comprehensive keyword-based guidance
    if (text.includes('screening') || text.includes('background') || text.includes('verification') || text.includes('check')) {
      guidance.push(...(this.implementationPatterns.get('screening') || []));
    }
    
    if ((text.includes('access') && text.includes('control')) || text.includes('authentication') || text.includes('authorization')) {
      guidance.push(...(this.implementationPatterns.get('access-control') || []));
    }

    if (text.includes('data') && (text.includes('protection') || text.includes('privacy') || text.includes('personal') || text.includes('sensitive'))) {
      guidance.push(...(this.implementationPatterns.get('data-protection') || []));
    }

    if (text.includes('incident') || text.includes('breach') || text.includes('event') || text.includes('emergency')) {
      guidance.push(...(this.implementationPatterns.get('incident-response') || []));
    }

    if (text.includes('risk') || text.includes('threat') || text.includes('vulnerability') || text.includes('assessment')) {
      guidance.push(...(this.implementationPatterns.get('risk-management') || []));
    }

    if (text.includes('physical') || text.includes('facility') || text.includes('premises') || text.includes('environmental')) {
      guidance.push(...(this.implementationPatterns.get('physical-security') || []));
    }

    if (text.includes('network') || text.includes('communication') || text.includes('firewall') || text.includes('segmentation')) {
      guidance.push(...(this.implementationPatterns.get('network-security') || []));
    }

    // Add framework-specific implementation details
    if (text.includes('iso 27001') || text.includes('iso27001')) {
      guidance.push('Implement controls according to ISO 27001 Annex A requirements');
      guidance.push('Document Statement of Applicability (SoA) with justifications');
      guidance.push('Establish Information Security Management System (ISMS) processes');
    }

    if (text.includes('gdpr')) {
      guidance.push('Implement privacy by design and by default principles');
      guidance.push('Establish lawful basis for processing personal data');
      guidance.push('Document processing activities and data flows');
    }

    if (text.includes('nis2') || text.includes('nis 2')) {
      guidance.push('Implement cybersecurity risk management measures');
      guidance.push('Establish incident reporting procedures within required timeframes');
      guidance.push('Ensure supply chain security measures');
    }

    return [...new Set(guidance)]; // Remove duplicates
  }

  private extractSpecificRequirements(text: string): string[] {
    const requirements: string[] = [];
    
    // Extract must/shall/should statements
    const mustStatements = text.match(/(?:must|shall|should)\s+[^.]+\./gi) || [];
    requirements.push(...mustStatements.map(s => s.trim()));
    
    // Extract ensure/establish/implement statements
    const actionStatements = text.match(/(?:ensure|establish|implement|maintain|develop|conduct)\s+[^.]+\./gi) || [];
    requirements.push(...actionStatements.map(s => s.trim()));
    
    return requirements.map(req => 
      req.charAt(0).toUpperCase() + req.slice(1) // Capitalize first letter
    ).filter(req => req.length > 20); // Filter out very short statements
  }

  private containsKeywordVariants(text: string, keyword: string): boolean {
    const variants: Record<string, string[]> = {
      'screening': ['verification', 'background', 'vetting', 'check'],
      'governance': ['management', 'leadership', 'oversight', 'direction'],
      'access-control': ['authentication', 'authorization', 'privilege', 'permission'],
      'data-protection': ['privacy', 'confidentiality', 'encryption', 'classification'],
      'incident-response': ['security event', 'breach response', 'emergency', 'crisis'],
      'risk-management': ['threat assessment', 'vulnerability', 'impact analysis'],
      'physical-security': ['facility security', 'environmental', 'premises'],
      'network-security': ['cybersecurity', 'information security', 'network protection']
    };

    const keywordVariants = variants[keyword] || [];
    return keywordVariants.some(variant => text.includes(variant));
  }

  private getControlMappings(framework: string): string[] {
    return this.controlMappings.get(framework) || [];
  }

  private getEvidenceRequirements(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const evidence: string[] = [];

    // Policy and procedure evidence
    if (text.includes('policy') || text.includes('procedure') || text.includes('standard') || text.includes('guideline')) {
      evidence.push(
        'Written policies and procedures',
        'Management approval documentation',
        'Policy review and update records',
        'Communication and acknowledgment records',
        'Version control documentation'
      );
    }

    // Training and awareness evidence
    if (text.includes('training') || text.includes('awareness') || text.includes('competence') || text.includes('education')) {
      evidence.push(
        'Training records and attendance',
        'Competency assessments',
        'Awareness program materials',
        'Training effectiveness measurements',
        'Role-specific training matrices',
        'Certification and qualification records'
      );
    }

    // Screening and background check evidence
    if (text.includes('screening') || text.includes('background') || text.includes('verification') || text.includes('vetting')) {
      evidence.push(
        'Background check reports',
        'Identity verification documentation',
        'Employment history verification',
        'Reference check records',
        'Criminal background check results (where permitted)',
        'Screening procedure records',
        'Re-screening schedules and records',
        'Privileged position screening documentation'
      );
    }

    // Access control evidence
    if (text.includes('access') || text.includes('authorization') || text.includes('authentication') || text.includes('privilege')) {
      evidence.push(
        'Access control logs',
        'User access reviews',
        'Authorization matrices',
        'Privileged account inventories',
        'Access provisioning/deprovisioning records',
        'Multi-factor authentication configurations',
        'Access recertification documentation'
      );
    }

    // Monitoring and review evidence
    if (text.includes('monitor') || text.includes('review') || text.includes('audit') || text.includes('assess')) {
      evidence.push(
        'Monitoring reports',
        'Review meeting minutes',
        'Performance metrics',
        'Audit findings and corrective actions',
        'Continuous monitoring dashboards',
        'Trend analysis reports',
        'Management review records'
      );
    }

    // Incident and breach evidence
    if (text.includes('incident') || text.includes('breach') || text.includes('event') || text.includes('response')) {
      evidence.push(
        'Incident reports',
        'Response logs',
        'Forensic analysis results',
        'Root cause analysis documentation',
        'Lessons learned reports',
        'Incident timeline documentation',
        'Communication records',
        'Regulatory notification evidence'
      );
    }

    // Risk management evidence
    if (text.includes('risk') || text.includes('assessment') || text.includes('threat') || text.includes('vulnerability')) {
      evidence.push(
        'Risk assessment reports',
        'Risk registers',
        'Treatment plans',
        'Risk acceptance documentation',
        'Threat intelligence reports',
        'Vulnerability scan results',
        'Risk mitigation tracking',
        'Residual risk documentation'
      );
    }

    // Physical security evidence
    if (text.includes('physical') || text.includes('facility') || text.includes('environmental') || text.includes('premises')) {
      evidence.push(
        'Physical access logs',
        'Visitor management records',
        'Security guard reports',
        'CCTV footage retention logs',
        'Environmental monitoring records',
        'Facility inspection reports',
        'Badge access reports'
      );
    }

    // Data protection evidence
    if (text.includes('data') || text.includes('privacy') || text.includes('personal') || text.includes('sensitive')) {
      evidence.push(
        'Data inventory and classification',
        'Data flow diagrams',
        'Privacy impact assessments',
        'Consent records',
        'Data retention schedules',
        'Data disposal certificates',
        'Encryption implementation records'
      );
    }

    return [...new Set(evidence)];
  }

  private async getCategoryRequirements(
    category: string, 
    frameworks: string[]
  ): Promise<DetailedRequirement[]> {
    const allRequirements = await this.getAllFrameworkRequirements(frameworks);
    
    // Filter requirements by category or keyword matching
    return allRequirements.filter(req => {
      const categoryKeywords = this.getCategoryKeywords(category);
      const hasKeywordMatch = categoryKeywords.some(keyword => 
        req.keywords.includes(keyword) || 
        req.title.toLowerCase().includes(keyword) ||
        req.description.toLowerCase().includes(keyword)
      );
      
      return hasKeywordMatch || req.category.toLowerCase().includes(category.toLowerCase());
    });
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMappings: Record<string, string[]> = {
      'Governance & Leadership': ['governance', 'leadership', 'management', 'policy', 'strategy', 'commitment', 'responsibility', 'authority', 'roles', 'oversight'],
      'Risk Management': ['risk', 'threat', 'vulnerability', 'assessment', 'analysis', 'treatment', 'mitigation', 'evaluation', 'impact', 'likelihood'],
      'Asset & Data Management': ['asset', 'data', 'information', 'classification', 'inventory', 'lifecycle', 'handling', 'disposal', 'retention', 'backup'],
      'Access Control & Identity': ['access', 'identity', 'authentication', 'authorization', 'privilege', 'account', 'user', 'credential', 'permission', 'screening'],
      'Physical & Environmental': ['physical', 'environmental', 'facility', 'premises', 'perimeter', 'visitor', 'equipment', 'media', 'disposal', 'surveillance'],
      'Network & Communications': ['network', 'communication', 'firewall', 'monitoring', 'segmentation', 'traffic', 'protocol', 'boundary', 'transmission', 'wireless'],
      'System Security & Hardening': ['system', 'configuration', 'hardening', 'patch', 'vulnerability', 'baseline', 'security', 'malware', 'antivirus', 'endpoint'],
      'Application & Development': ['application', 'development', 'software', 'code', 'testing', 'deployment', 'secure', 'sdlc', 'programming', 'quality'],
      'Incident & Continuity': ['incident', 'breach', 'response', 'continuity', 'recovery', 'disaster', 'emergency', 'forensics', 'investigation', 'notification'],
      'Compliance & Audit': ['compliance', 'audit', 'review', 'assessment', 'monitoring', 'evaluation', 'internal', 'external', 'regulation', 'standard'],
      'Supplier & Third Party': ['supplier', 'vendor', 'third-party', 'contract', 'agreement', 'assessment', 'monitoring', 'service', 'provider', 'outsourcing'],
      'Privacy & Data Protection': ['privacy', 'personal', 'sensitive', 'consent', 'subject', 'controller', 'processor', 'lawful', 'purpose', 'retention']
    };

    return categoryMappings[category] || [];
  }

  private groupRequirementsByPurpose(requirements: DetailedRequirement[]): DetailedRequirement[][] {
    const groups: DetailedRequirement[][] = [];
    const processed = new Set<string>();

    for (const req of requirements) {
      if (processed.has(req.id)) continue;

      const group = [req];
      processed.add(req.id);

      // Find similar requirements
      for (const otherReq of requirements) {
        if (processed.has(otherReq.id)) continue;

        const similarity = this.calculateSimilarity(req, otherReq);
        if (similarity > 0.6) { // 60% similarity threshold
          group.push(otherReq);
          processed.add(otherReq.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private calculateSimilarity(req1: DetailedRequirement, req2: DetailedRequirement): number {
    const keywords1 = new Set(req1.keywords);
    const keywords2 = new Set(req2.keywords);
    
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async createUnifiedMapping(
    requirementGroup: DetailedRequirement[],
    category: string
  ): Promise<UnifiedRequirementMapping> {
    // Extract ALL keywords and themes, not just common ones
    const allKeywords = requirementGroup.flatMap(req => req.keywords);
    const keywordFreq = new Map<string, number>();
    
    allKeywords.forEach(keyword => {
      keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
    });

    // Include both common and unique keywords for comprehensive coverage
    const commonKeywords = Array.from(keywordFreq.entries())
      .filter(([_, freq]) => freq >= Math.ceil(requirementGroup.length * 0.5))
      .map(([keyword]) => keyword);
    
    const uniqueKeywords = Array.from(new Set(allKeywords));
    const allRelevantKeywords = [...new Set([...commonKeywords, ...uniqueKeywords])].slice(0, 20); // Increase to top 20

    // Generate unified title and description
    const primaryKeyword = commonKeywords[0] || uniqueKeywords[0] || 'Security Control';
    const unifiedTitle = this.generateUnifiedTitle(primaryKeyword, category);
    const unifiedDescription = this.generateEnhancedUnifiedDescription(requirementGroup, allRelevantKeywords);

    // Generate comprehensive sub-requirements
    const subRequirements = this.generateComprehensiveSubRequirements(
      requirementGroup,
      allRelevantKeywords,
      category
    );

    // Calculate comprehensive coverage
    const allImplementations = requirementGroup.flatMap(req => req.implementation);
    const allControls = requirementGroup.flatMap(req => req.controls);
    const frameworks = [...new Set(requirementGroup.map(req => req.framework))];

    return {
      unifiedId: `unified-${category.toLowerCase().replace(/\s+/g, '-')}-${primaryKeyword}`,
      unifiedTitle,
      unifiedDescription,
      subRequirements,
      mappedRequirements: requirementGroup,
      coverage: {
        keywords: allRelevantKeywords,
        implementations: [...new Set(allImplementations)],
        controls: [...new Set(allControls)],
        frameworks
      },
      completeness: this.calculateCompleteness(requirementGroup, subRequirements)
    };
  }

  private generateUnifiedTitle(primaryKeyword: string, category: string): string {
    const titleTemplates: Record<string, string> = {
      'screening': 'Personnel Screening & Background Verification',
      'access': 'Access Control & Identity Management',
      'governance': 'Information Security Governance & Leadership',
      'risk': 'Risk Assessment & Management',
      'data': 'Data Protection & Privacy Management',
      'incident': 'Incident Response & Security Event Management',
      'physical': 'Physical & Environmental Security',
      'network': 'Network Security & Communications Protection',
      'training': 'Security Training & Awareness',
      'monitoring': 'Security Monitoring & Audit',
      'compliance': 'Compliance Management & Regulatory Adherence'
    };

    return titleTemplates[primaryKeyword] || `${category} Security Controls`;
  }


  private generateEnhancedUnifiedDescription(
    requirements: DetailedRequirement[],
    keywords: string[]
  ): string {
    const frameworks = [...new Set(requirements.map(req => req.framework.toUpperCase()))];
    const keywordPhrase = keywords.slice(0, 8).join(', ');
    const totalImplementations = [...new Set(requirements.flatMap(req => req.implementation))].length;
    const totalControls = [...new Set(requirements.flatMap(req => req.controls))].length;
    
    return `Comprehensive security controls addressing ${keywordPhrase} requirements across ${frameworks.join(', ')} frameworks, with ${totalImplementations} implementation guidelines and ${totalControls} control mappings, ensuring unified implementation and compliance management across all applicable standards.`;
  }

  private generateComprehensiveSubRequirements(
    requirements: DetailedRequirement[],
    keywords: string[],
    category: string
  ): string[] {
    const subReqs: string[] = [];
    const frameworks = [...new Set(requirements.map(req => req.framework.toUpperCase()))];
    const frameworkList = frameworks.join(', ');
    
    // Use category to tailor sub-requirements
    const categoryPrefix = category.toLowerCase().includes('governance') ? 'Management and ' : '';

    // First, ensure ALL specific requirements are captured
    const allImplementationDetails = new Set<string>();
    const allControlDetails = new Set<string>();
    const allEvidenceRequirements = new Set<string>();
    
    requirements.forEach(req => {
      req.implementation.forEach(impl => allImplementationDetails.add(impl));
      req.controls.forEach(ctrl => allControlDetails.add(ctrl));
      req.evidence.forEach(evid => allEvidenceRequirements.add(evid));
    });

    // Group requirements by common implementation themes
    const implementationThemes = this.extractImplementationThemes(requirements);

    implementationThemes.forEach((theme, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      const themeRequirements = requirements.filter(req => 
        req.implementation.some(impl => theme.keywords.some(kw => impl.toLowerCase().includes(kw)))
      );

      if (themeRequirements.length > 0) {
        const specificCodes = themeRequirements.map(req => req.code).join(', ');
        const detailedImplementation = this.generateDetailedImplementation(theme, themeRequirements);
        const enhancedThemeName = `${categoryPrefix}${theme.name}`;
        
        // Include ALL specific implementation details from the requirements
        const specificImplementations = themeRequirements
          .flatMap(req => req.implementation)
          .filter((impl, idx, arr) => arr.indexOf(impl) === idx) // Remove duplicates
          .join('; ');
        
        // Include ALL control mappings
        const specificControls = themeRequirements
          .flatMap(req => req.controls)
          .filter((ctrl, idx, arr) => arr.indexOf(ctrl) === idx)
          .join(', ');
        
        // Include ALL evidence requirements
        const specificEvidence = themeRequirements
          .flatMap(req => req.evidence)
          .filter((evid, idx, arr) => arr.indexOf(evid) === idx)
          .join(', ');
        
        subReqs.push(
          `${letter}) UNIFIED ${enhancedThemeName.toUpperCase()}: ${detailedImplementation} - satisfying ${frameworkList} requirements (${specificCodes}) with comprehensive implementation: [${specificImplementations}], controls mapping: [${specificControls}], evidence requirements: [${specificEvidence}]`
        );
      }
    });

    // Add screening-specific sub-requirement if missing and relevant
    if (keywords.includes('screening') || requirements.some(req => req.title.toLowerCase().includes('screening'))) {
      const screeningReqs = requirements.filter(req => 
        req.title.toLowerCase().includes('screening') || 
        req.description.toLowerCase().includes('background')
      );
      
      if (screeningReqs.length > 0) {
        const screeningCodes = screeningReqs.map(req => req.code).join(', ');
        const screeningImplementations = screeningReqs
          .flatMap(req => req.implementation)
          .filter((impl, idx, arr) => arr.indexOf(impl) === idx)
          .join('; ');
        const screeningControls = screeningReqs
          .flatMap(req => req.controls)
          .filter((ctrl, idx, arr) => arr.indexOf(ctrl) === idx)
          .join(', ');
        const screeningEvidence = screeningReqs
          .flatMap(req => req.evidence)
          .filter((evid, idx, arr) => arr.indexOf(evid) === idx)
          .join(', ');
          
        subReqs.unshift(
          `a) UNIFIED PERSONNEL SCREENING: Implement comprehensive background verification procedures including identity verification, employment history checks, criminal background screening (where legally permitted), reference verification, and qualification validation for all personnel requiring access to sensitive information or systems - satisfying ${frameworkList} personnel security requirements (${screeningCodes}) with comprehensive implementation: [${screeningImplementations}], controls mapping: [${screeningControls}], evidence requirements: [${screeningEvidence}]`
        );
      }
    }

    // Add any requirements not captured by themes
    const uncapturedRequirements = requirements.filter(req => 
      !subReqs.some(subReq => subReq.includes(req.code))
    );
    
    if (uncapturedRequirements.length > 0) {
      const letter = String.fromCharCode(97 + subReqs.length);
      const uncapturedCodes = uncapturedRequirements.map(req => req.code).join(', ');
      const uncapturedImplementations = uncapturedRequirements
        .flatMap(req => req.implementation)
        .filter((impl, idx, arr) => arr.indexOf(impl) === idx)
        .join('; ');
      const uncapturedControls = uncapturedRequirements
        .flatMap(req => req.controls)
        .filter((ctrl, idx, arr) => arr.indexOf(ctrl) === idx)
        .join(', ');
      const uncapturedEvidence = uncapturedRequirements
        .flatMap(req => req.evidence)
        .filter((evid, idx, arr) => arr.indexOf(evid) === idx)
        .join(', ');
        
      subReqs.push(
        `${letter}) UNIFIED ADDITIONAL REQUIREMENTS: Additional security controls and measures - satisfying ${frameworkList} requirements (${uncapturedCodes}) with comprehensive implementation: [${uncapturedImplementations}], controls mapping: [${uncapturedControls}], evidence requirements: [${uncapturedEvidence}]`
      );
    }

    return subReqs;
  }

  private extractImplementationThemes(requirements: DetailedRequirement[]): Array<{
    name: string;
    keywords: string[];
    guidance: string[];
  }> {
    const themes = [
      {
        name: 'Policy Framework',
        keywords: ['policy', 'procedure', 'standard', 'guideline'],
        guidance: [
          'Develop written policies approved by management',
          'Establish clear procedures with step-by-step instructions',
          'Implement regular review and update cycles',
          'Ensure compliance with regulatory requirements'
        ]
      },
      {
        name: 'Implementation Process',
        keywords: ['implement', 'establish', 'deploy', 'configure'],
        guidance: [
          'Define implementation phases with clear milestones',
          'Assign roles and responsibilities to qualified personnel',
          'Conduct pilot testing before full deployment',
          'Document configuration and operational procedures'
        ]
      },
      {
        name: 'Monitoring & Review',
        keywords: ['monitor', 'review', 'assess', 'evaluate'],
        guidance: [
          'Establish continuous monitoring capabilities',
          'Conduct regular reviews at defined intervals',
          'Document findings and corrective actions',
          'Report status to management with recommendations'
        ]
      },
      {
        name: 'Security Awareness & Skills Training',
        keywords: ['training', 'awareness', 'competence', 'education'],
        guidance: [
          'Develop role-specific training programs',
          'Conduct regular awareness sessions',
          'Assess competency and provide additional training as needed',
          'Maintain training records and certifications'
        ]
      }
    ];

    return themes.filter(theme => 
      requirements.some(req => 
        theme.keywords.some(kw => 
          req.title.toLowerCase().includes(kw) || 
          req.description.toLowerCase().includes(kw)
        )
      )
    );
  }

  private generateDetailedImplementation(
    theme: { name: string; keywords: string[]; guidance: string[] },
    requirements: DetailedRequirement[]
  ): string {
    // Get ALL specific actions without limiting
    const specificActions = requirements
      .flatMap(req => req.implementation)
      .filter(impl => theme.keywords.some(kw => impl.toLowerCase().includes(kw)))
      .filter((impl, idx, arr) => arr.indexOf(impl) === idx); // Remove duplicates

    // If too many actions, summarize key themes but keep all details
    if (specificActions.length > 5) {
      const summary = `Comprehensive ${theme.name.toLowerCase()} implementation including ${specificActions.length} specific controls`;
      return summary;
    }
    
    return specificActions.join(', ') || `Implement ${theme.name.toLowerCase()} controls to ensure comprehensive coverage`;
  }

  private calculateCompleteness(
    requirements: DetailedRequirement[],
    subRequirements: string[]
  ): number {
    const totalKeywords = new Set(requirements.flatMap(req => req.keywords));
    const coveredKeywords = new Set<string>();

    subRequirements.forEach(subReq => {
      this.extractKeywords(subReq).forEach(kw => {
        if (totalKeywords.has(kw)) {
          coveredKeywords.add(kw);
        }
      });
    });

    return totalKeywords.size > 0 ? coveredKeywords.size / totalKeywords.size : 0;
  }

  private generateRecommendations(
    unmappedRequirements: DetailedRequirement[],
    missingKeywords: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (unmappedRequirements.length > 0) {
      recommendations.push(
        `Map ${unmappedRequirements.length} unmapped requirements to unified controls to ensure complete coverage`
      );

      // Group unmapped by category
      const categoryGroups = new Map<string, DetailedRequirement[]>();
      unmappedRequirements.forEach(req => {
        const category = req.category || 'General';
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(req);
      });

      categoryGroups.forEach((reqs, category) => {
        recommendations.push(
          `Create unified requirements for ${category} covering: ${reqs.map(r => r.title).join(', ')}`
        );
      });
    }

    if (missingKeywords.length > 0) {
      const criticalKeywords = missingKeywords.filter(kw => 
        ['screening', 'background', 'verification', 'encryption', 'monitoring', 'incident'].includes(kw)
      );

      if (criticalKeywords.length > 0) {
        recommendations.push(
          `Add critical missing keywords to unified requirements: ${criticalKeywords.join(', ')}`
        );
      }
    }

    recommendations.push(
      'Conduct regular audits to ensure unified requirements remain comprehensive as frameworks evolve'
    );

    return recommendations;
  }
}

export const proGradeEngine = new ProGradeComplianceEngine();