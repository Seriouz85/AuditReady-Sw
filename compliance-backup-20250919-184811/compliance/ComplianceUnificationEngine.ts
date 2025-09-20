import { supabase } from '@/lib/supabase';

// Types for the unification engine
export interface UnificationRule {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  categories: string[];
  priority: number;
}

export interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  keywords?: string[];
  category?: string;
}

export interface UnifiedRequirementDetail {
  id: string;
  category: string;
  title: string;
  description: string;
  subRequirements: string[];
  mappedRequirements: FrameworkRequirement[];
  coverageScore: number;
  keywords: string[];
}

export interface ComplianceEngineConfig {
  minKeywordMatch: number; // Minimum number of keywords to match
  minCoverageScore: number; // Minimum coverage score to include
  enableAIEnhancement: boolean; // Enable AI-powered requirement analysis
}

export class ComplianceUnificationEngine {
  private config: ComplianceEngineConfig;
  private keywordIndex: Map<string, Set<string>>; // keyword -> requirement IDs
  private categoryRules: Map<string, UnificationRule[]>;
  
  constructor(config: Partial<ComplianceEngineConfig> = {}) {
    this.config = {
      minKeywordMatch: 2,
      minCoverageScore: 0.7,
      enableAIEnhancement: true,
      ...config
    };
    this.keywordIndex = new Map();
    this.categoryRules = new Map();
  }

  /**
   * Initialize the engine with rules and data
   */
  async initialize() {
    await this.loadUnificationRules();
    await this.buildKeywordIndex();
  }

  /**
   * Load unification rules from database or configuration
   */
  private async loadUnificationRules() {
    // Define comprehensive unification rules for each category
    const rules: UnificationRule[] = [
      {
        id: 'governance-policy',
        name: 'Governance and Policy Unification',
        description: 'Unifies governance, leadership, and policy requirements',
        keywords: ['governance', 'leadership', 'policy', 'management', 'commitment', 'responsibility', 'authority', 'roles', 'framework', 'strategy'],
        categories: ['Governance & Leadership'],
        priority: 1
      },
      {
        id: 'risk-assessment',
        name: 'Risk Management Unification',
        description: 'Unifies risk assessment and treatment requirements',
        keywords: ['risk', 'assessment', 'treatment', 'analysis', 'evaluation', 'mitigation', 'threat', 'vulnerability', 'impact', 'likelihood'],
        categories: ['Risk Management'],
        priority: 1
      },
      {
        id: 'access-control',
        name: 'Access Control Unification',
        description: 'Unifies access control and identity management',
        keywords: ['access', 'control', 'identity', 'authentication', 'authorization', 'privilege', 'permission', 'user', 'account', 'credential'],
        categories: ['Access Control & Identity'],
        priority: 1
      },
      {
        id: 'data-protection',
        name: 'Data Protection Unification',
        description: 'Unifies data protection and privacy requirements',
        keywords: ['data', 'protection', 'privacy', 'personal', 'sensitive', 'classification', 'encryption', 'retention', 'deletion', 'subject'],
        categories: ['Privacy & Data Protection', 'Asset & Data Management'],
        priority: 1
      },
      {
        id: 'incident-response',
        name: 'Incident Response Unification',
        description: 'Unifies incident management and response',
        keywords: ['incident', 'response', 'breach', 'event', 'detection', 'investigation', 'recovery', 'notification', 'forensics', 'continuity'],
        categories: ['Incident & Continuity'],
        priority: 1
      },
      {
        id: 'compliance-audit',
        name: 'Compliance and Audit Unification',
        description: 'Unifies compliance monitoring and audit',
        keywords: ['compliance', 'audit', 'monitoring', 'review', 'assessment', 'evaluation', 'internal', 'external', 'regulation', 'standard'],
        categories: ['Compliance & Audit'],
        priority: 1
      },
      {
        id: 'network-security',
        name: 'Network Security Unification',
        description: 'Unifies network and communications security',
        keywords: ['network', 'communication', 'firewall', 'segmentation', 'monitoring', 'traffic', 'protocol', 'boundary', 'perimeter', 'zone'],
        categories: ['Network & Communications'],
        priority: 1
      },
      {
        id: 'physical-security',
        name: 'Physical Security Unification',
        description: 'Unifies physical and environmental security',
        keywords: ['physical', 'environmental', 'facility', 'perimeter', 'entry', 'surveillance', 'equipment', 'media', 'disposal', 'visitor'],
        categories: ['Physical & Environmental'],
        priority: 1
      },
      {
        id: 'development-security',
        name: 'Development Security Unification',
        description: 'Unifies secure development and application security',
        keywords: ['development', 'application', 'code', 'testing', 'secure', 'sdlc', 'vulnerability', 'patch', 'update', 'deployment'],
        categories: ['Application & Development', 'System Security & Hardening'],
        priority: 1
      },
      {
        id: 'supplier-management',
        name: 'Supplier Management Unification',
        description: 'Unifies third-party and supplier security',
        keywords: ['supplier', 'vendor', 'third-party', 'contract', 'agreement', 'assessment', 'monitoring', 'chain', 'service', 'provider'],
        categories: ['Supplier & Third Party'],
        priority: 1
      },
      {
        id: 'screening-verification',
        name: 'Personnel Screening Unification',
        description: 'Unifies personnel screening and verification requirements',
        keywords: ['screening', 'background', 'verification', 'personnel', 'employee', 'contractor', 'check', 'vetting', 'clearance', 'reference'],
        categories: ['Governance & Leadership', 'Access Control & Identity'],
        priority: 2
      },
      {
        id: 'training-awareness',
        name: 'Training and Awareness Unification',
        description: 'Unifies security training and awareness requirements',
        keywords: ['training', 'awareness', 'education', 'competence', 'skills', 'knowledge', 'program', 'induction', 'ongoing', 'specialized'],
        categories: ['Governance & Leadership'],
        priority: 2
      }
    ];

    // Store rules by category
    rules.forEach(rule => {
      rule.categories.forEach(category => {
        if (!this.categoryRules.has(category)) {
          this.categoryRules.set(category, []);
        }
        this.categoryRules.get(category)!.push(rule);
      });
    });
  }

  /**
   * Build keyword index for fast requirement matching
   */
  private async buildKeywordIndex() {
    try {
      // Get all requirements from the database
      const { data: requirements, error } = await supabase
        .from('requirements_library')
        .select(`
          id,
          requirement_code,
          title,
          official_description,
          standard:standards_library(code)
        `);

      if (error) throw error;

      // Build keyword index
      (requirements || []).forEach(req => {
        const keywords = this.extractKeywords(
          `${req.title} ${req.official_description}`
        );
        
        keywords.forEach(keyword => {
          if (!this.keywordIndex.has(keyword)) {
            this.keywordIndex.set(keyword, new Set());
          }
          this.keywordIndex.get(keyword)!.add(req.id);
        });
      });
    } catch (error) {
      console.error('Error building keyword index:', error);
    }
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall']);
    
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Calculate similarity between two sets of keywords
   */
  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Find related requirements based on keywords and rules
   */
  private async findRelatedRequirements(
    category: string,
    keywords: string[],
    existingRequirementIds: Set<string>
  ): Promise<FrameworkRequirement[]> {
    const relatedRequirementIds = new Set<string>();
    
    // Get rules for this category
    const rules = this.categoryRules.get(category) || [];
    
    // Find requirements matching rule keywords
    rules.forEach(rule => {
      rule.keywords.forEach(ruleKeyword => {
        const matchingReqs = this.keywordIndex.get(ruleKeyword) || new Set();
        matchingReqs.forEach(reqId => {
          if (!existingRequirementIds.has(reqId)) {
            relatedRequirementIds.add(reqId);
          }
        });
      });
    });

    // Find requirements matching unified requirement keywords
    keywords.forEach(keyword => {
      const matchingReqs = this.keywordIndex.get(keyword) || new Set();
      matchingReqs.forEach(reqId => {
        if (!existingRequirementIds.has(reqId)) {
          relatedRequirementIds.add(reqId);
        }
      });
    });

    // Fetch the related requirements
    if (relatedRequirementIds.size > 0) {
      const { data: requirements } = await supabase
        .from('requirements_library')
        .select(`
          id,
          requirement_code,
          title,
          official_description,
          standard:standards_library(code, name)
        `)
        .in('id', Array.from(relatedRequirementIds));

      return (requirements || []).map(req => ({
        id: req.id,
        code: req.requirement_code,
        title: req.title,
        description: req.official_description,
        framework: req.standard.code.toLowerCase(),
        keywords: this.extractKeywords(`${req.title} ${req.official_description}`)
      }));
    }

    return [];
  }

  /**
   * Enhance unified requirements with missing details
   */
  async enhanceUnifiedRequirements(
    unifiedRequirements: any[],
    mappedRequirements: any[]
  ): Promise<UnifiedRequirementDetail[]> {
    const enhancedRequirements: UnifiedRequirementDetail[] = [];

    for (const unified of unifiedRequirements) {
      // Extract keywords from unified requirement
      const unifiedKeywords = this.extractKeywords(
        `${unified.title} ${unified.description} ${unified.subRequirements.join(' ')}`
      );

      // Find existing mapped requirements
      const existingMappings = mappedRequirements.filter(
        m => m.unifiedRequirementId === unified.id
      );
      const existingRequirementIds = new Set(
        existingMappings.map(m => m.requirementId)
      );

      // Find additional related requirements
      const relatedRequirements = await this.findRelatedRequirements(
        unified.category,
        unifiedKeywords,
        existingRequirementIds
      );

      // Combine existing and related requirements
      const allMappedRequirements = [
        ...existingMappings.map(m => ({
          id: m.requirement.id,
          code: m.requirement.code,
          title: m.requirement.title,
          description: m.requirement.description,
          framework: m.requirement.standard.code.toLowerCase(),
          keywords: this.extractKeywords(`${m.requirement.title} ${m.requirement.description}`)
        })),
        ...relatedRequirements
      ];

      // Extract missing keywords from mapped requirements
      const allMappedKeywords = new Set<string>();
      allMappedRequirements.forEach(req => {
        req.keywords?.forEach(kw => allMappedKeywords.add(kw));
      });

      // Find keywords that appear in mapped requirements but not in unified
      const missingKeywords = Array.from(allMappedKeywords).filter(
        kw => !unifiedKeywords.includes(kw)
      );

      // Enhance sub-requirements if needed
      const enhancedSubRequirements = [...unified.subRequirements];
      
      // Add missing important keywords to sub-requirements
      const importantMissingKeywords = missingKeywords.filter(kw => {
        // Check if keyword appears in multiple frameworks
        const frameworkCount = allMappedRequirements.filter(
          req => req.keywords?.includes(kw)
        ).length;
        return frameworkCount >= 2; // Keyword appears in at least 2 frameworks
      });

      if (importantMissingKeywords.length > 0) {
        // Group keywords by topic
        const keywordGroups = this.groupKeywordsByTopic(importantMissingKeywords);
        
        // Add enhanced sub-requirements for missing topics
        keywordGroups.forEach(group => {
          if (group.keywords.length >= this.config.minKeywordMatch) {
            const enhancedReq = this.generateEnhancedSubRequirement(
              group,
              unified.category,
              allMappedRequirements
            );
            if (enhancedReq) {
              enhancedSubRequirements.push(enhancedReq);
            }
          }
        });
      }

      // Calculate coverage score
      const coverageScore = this.calculateCoverageScore(
        unifiedKeywords,
        Array.from(allMappedKeywords)
      );

      enhancedRequirements.push({
        id: unified.id,
        category: unified.category,
        title: unified.title,
        description: unified.description,
        subRequirements: enhancedSubRequirements,
        mappedRequirements: allMappedRequirements,
        coverageScore,
        keywords: [...unifiedKeywords, ...importantMissingKeywords]
      });
    }

    return enhancedRequirements;
  }

  /**
   * Group keywords by topic/theme
   */
  private groupKeywordsByTopic(keywords: string[]): Array<{ topic: string; keywords: string[] }> {
    const topicGroups = [
      {
        topic: 'Personnel Security',
        keywords: ['screening', 'background', 'verification', 'vetting', 'clearance', 'personnel', 'employee', 'contractor']
      },
      {
        topic: 'Data Management',
        keywords: ['retention', 'deletion', 'disposal', 'archival', 'backup', 'recovery', 'restoration']
      },
      {
        topic: 'Monitoring and Logging',
        keywords: ['monitoring', 'logging', 'audit', 'trail', 'record', 'evidence', 'forensics']
      },
      {
        topic: 'Cryptography',
        keywords: ['encryption', 'cryptography', 'key', 'certificate', 'hash', 'signature', 'algorithm']
      },
      {
        topic: 'Change Management',
        keywords: ['change', 'configuration', 'baseline', 'version', 'release', 'deployment']
      }
    ];

    const groups: Array<{ topic: string; keywords: string[] }> = [];
    
    topicGroups.forEach(topicGroup => {
      const matchingKeywords = keywords.filter(kw => 
        topicGroup.keywords.includes(kw)
      );
      if (matchingKeywords.length > 0) {
        groups.push({
          topic: topicGroup.topic,
          keywords: matchingKeywords
        });
      }
    });

    // Group remaining keywords
    const groupedKeywords = new Set(groups.flatMap(g => g.keywords));
    const remainingKeywords = keywords.filter(kw => !groupedKeywords.has(kw));
    
    if (remainingKeywords.length > 0) {
      groups.push({
        topic: 'Additional Requirements',
        keywords: remainingKeywords
      });
    }

    return groups;
  }

  /**
   * Generate enhanced sub-requirement text
   */
  private generateEnhancedSubRequirement(
    keywordGroup: { topic: string; keywords: string[] },
    category: string,
    mappedRequirements: FrameworkRequirement[]
  ): string | null {
    // Find requirements that mention these keywords
    const relevantReqs = mappedRequirements.filter(req =>
      keywordGroup.keywords.some(kw => req.keywords?.includes(kw))
    );

    if (relevantReqs.length === 0) return null;

    // Generate sub-requirement based on topic
    const frameworks = [...new Set(relevantReqs.map(r => r.framework.toUpperCase()))];
    
    const templates: Record<string, string> = {
      'Personnel Security': `UNIFIED PERSONNEL SECURITY: Implement comprehensive ${keywordGroup.keywords.join(', ')} procedures that satisfy ${frameworks.join(', ')} requirements, including background verification, reference checks, and ongoing monitoring for all personnel with access to sensitive information`,
      'Data Management': `UNIFIED DATA LIFECYCLE: Establish ${keywordGroup.keywords.join(', ')} policies and procedures that meet ${frameworks.join(', ')} requirements for data handling throughout its lifecycle`,
      'Monitoring and Logging': `UNIFIED MONITORING FRAMEWORK: Implement comprehensive ${keywordGroup.keywords.join(', ')} capabilities that satisfy ${frameworks.join(', ')} requirements for security event detection and investigation`,
      'Cryptography': `UNIFIED CRYPTOGRAPHIC CONTROLS: Deploy ${keywordGroup.keywords.join(', ')} measures that meet ${frameworks.join(', ')} standards for protecting data in transit and at rest`,
      'Change Management': `UNIFIED CHANGE CONTROL: Establish ${keywordGroup.keywords.join(', ')} processes that satisfy ${frameworks.join(', ')} requirements for managing system modifications`,
      'Additional Requirements': `UNIFIED CONTROLS: Implement ${keywordGroup.keywords.join(', ')} measures to satisfy ${frameworks.join(', ')} specific requirements not covered in other sub-requirements`
    };

    return templates[keywordGroup.topic] || templates['Additional Requirements'];
  }

  /**
   * Calculate how well unified requirements cover framework requirements
   */
  private calculateCoverageScore(unifiedKeywords: string[], frameworkKeywords: string[]): number {
    if (frameworkKeywords.length === 0) return 1;
    
    const coveredKeywords = frameworkKeywords.filter(kw => 
      unifiedKeywords.includes(kw)
    );
    
    return coveredKeywords.length / frameworkKeywords.length;
  }

  /**
   * Process and enhance compliance mapping data
   */
  async processComplianceMappings(
    categories: any[],
    mappings: any[],
    selectedFrameworks: string[]
  ): Promise<ComplianceMappingData[]> {
    await this.initialize();

    const result: ComplianceMappingData[] = [];
    const processedUnified = await this.enhanceUnifiedRequirements(
      categories.flatMap(cat => 
        (cat.requirements || []).map(req => ({
          ...req,
          category: cat.name
        }))
      ),
      mappings
    );

    for (const enhanced of processedUnified) {
      // Only include if coverage score meets threshold
      if (enhanced.coverageScore >= this.config.minCoverageScore) {
        const frameworkGroups: Record<string, any[]> = {};
        
        enhanced.mappedRequirements.forEach(req => {
          if (selectedFrameworks.includes(req.framework)) {
            if (!frameworkGroups[req.framework]) {
              frameworkGroups[req.framework] = [];
            }
            frameworkGroups[req.framework].push({
              code: req.code,
              title: req.title,
              description: req.description
            });
          }
        });

        if (Object.keys(frameworkGroups).length > 0) {
          result.push({
            id: enhanced.id,
            category: enhanced.category,
            auditReadyUnified: {
              title: enhanced.title,
              description: enhanced.description,
              subRequirements: enhanced.subRequirements
            },
            frameworks: frameworkGroups
          });
        }
      }
    }

    return result;
  }
}

// Singleton instance
export const complianceEngine = new ComplianceUnificationEngine();

// Types matching the UI expectations
export interface ComplianceMappingData {
  id: string;
  category: string;
  auditReadyUnified: {
    title: string;
    description: string;
    subRequirements: string[];
  };
  frameworks: {
    [key: string]: Array<{
      code: string;
      title: string;
      description: string;
    }>;
  };
}