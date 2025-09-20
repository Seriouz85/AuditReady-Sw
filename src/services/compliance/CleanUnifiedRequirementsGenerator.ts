/**
 * Clean Unified Requirements Generator
 * 
 * Simple, professional unified requirements generation:
 * 1. Use hardcoded category templates only
 * 2. Inject framework requirements into proper sub-requirement letters  
 * 3. Deduplicate overlapping requirements intelligently
 * 4. Format framework references cleanly on one line
 * 5. Abstract requirement descriptions professionally
 * 6. Optional AI-powered text consolidation for enhanced readability
 */

import { 
  AIIntegrationService, 
  AIIntegrationOptions, 
  AIIntegrationResult 
} from './ai-consolidation/AIIntegrationService';

export interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  category: string;
}

export interface CleanUnifiedRequirement {
  category: string;
  title: string;
  description: string;
  content: string;
  subRequirements: {
    letter: string;
    title: string;
    description: string;
    requirements: string[];
    frameworkReferences: string;
  }[];
  frameworksCovered: string[];
  totalRequirementsProcessed: number;
}

export interface EnhancedGenerationOptions {
  enableAIConsolidation?: boolean;
  aiConsolidationOptions?: AIIntegrationOptions;
  includeMetrics?: boolean;
  fallbackToOriginal?: boolean;
}

export interface EnhancedGenerationResult {
  original: CleanUnifiedRequirement | null;
  enhanced: CleanUnifiedRequirement | null;
  aiIntegration?: AIIntegrationResult;
  metrics: {
    processingTimeMs: number;
    aiConsolidationApplied: boolean;
    textReductionPercentage: number;
    qualityScore: number;
    apiKeyStatus: string;
    cachingUsed: boolean;
  };
}

export class CleanUnifiedRequirementsGenerator {

  /**
   * Generate clean, professional unified requirements for a category
   */
  static async generateForCategory(
    categoryName: string,
    frameworkRequirements: FrameworkRequirement[]
  ): Promise<CleanUnifiedRequirement | null> {
    
    console.log(`[DEBUG] Processing category: ${categoryName} with ${frameworkRequirements.length} requirements`);
    
    // Get base template
    const template = this.getTemplate(categoryName);
    if (!template) {
      console.log(`[DEBUG] No template found for: ${categoryName}`);
      return null;
    }
    
    console.log(`[DEBUG] Template found for: ${categoryName}, has ${template.subRequirements.length} sub-requirements`);
    
    // Deduplicate requirements first
    const deduplicatedRequirements = this.deduplicateRequirements(frameworkRequirements);
    console.log(`[DEBUG] Deduplicated: ${frameworkRequirements.length} → ${deduplicatedRequirements.length}`);
    
    // Detect overlaps and merge intelligently  
    const mergedRequirements = this.detectAndMergeOverlaps(deduplicatedRequirements);
    console.log(`[DEBUG] Merged overlaps: ${deduplicatedRequirements.length} → ${mergedRequirements.length}`);
    
    // Map requirements to sub-requirement letters using simple keyword matching
    const mappedRequirements = this.mapRequirementsToSubRequirements(mergedRequirements, template);
    console.log(`[DEBUG] Mapped requirements for ${categoryName}:`, Object.keys(mappedRequirements).map(letter => `${letter}:${mappedRequirements[letter].length}`).join(', '));
    
    // Build clean sub-requirements with professional formatting - SHOW ALL LETTERS
    const cleanSubRequirements = template.subRequirements.map((subReq: any) => {
      const mappedReqs = mappedRequirements[subReq.letter] || [];
      console.log(`[DEBUG] Sub-req ${subReq.letter} (${subReq.title.substring(0, 30)}...) has ${mappedReqs.length} mapped requirements`);
      
      // Always include the sub-requirement even if no framework requirements are mapped
      if (mappedReqs.length === 0) {
        return {
          letter: subReq.letter,
          title: subReq.title,
          description: subReq.description,
          requirements: [], // Empty array but still show the sub-requirement
          frameworkReferences: ''
        };
      }
      
      // Abstract and clean requirement descriptions
      const abstractedRequirements = mappedReqs.map(req => this.abstractRequirement(req));
      
      // Build framework references in clean format
      const frameworkRefs = this.buildFrameworkReferences(mappedReqs);
      
      return {
        letter: subReq.letter,
        title: subReq.title,
        description: subReq.description,
        requirements: abstractedRequirements,
        frameworkReferences: frameworkRefs
      };
    }); // REMOVED FILTER - Show all sub-requirements regardless of content
    
    // Generate clean content string
    const content = this.formatCleanContent(template, cleanSubRequirements);
    
    // Extract frameworks covered
    const frameworksCovered = Array.from(new Set(
      frameworkRequirements.map(req => req.framework)
    ));
    
    console.log(`[CLEAN GENERATOR] Generated ${cleanSubRequirements.length} sub-requirements for ${categoryName}`);
    
    return {
      category: categoryName,
      title: template.title,
      description: template.description,
      content,
      subRequirements: cleanSubRequirements,
      frameworksCovered,
      totalRequirementsProcessed: frameworkRequirements.length
    };
  }

  /**
   * Enhanced generation with optional AI consolidation
   */
  static async generateForCategoryWithAI(
    categoryName: string,
    frameworkRequirements: FrameworkRequirement[],
    options: EnhancedGenerationOptions = {}
  ): Promise<EnhancedGenerationResult> {
    
    const startTime = Date.now();
    
    console.log(`[AI-ENHANCED GENERATOR] Processing category: ${categoryName} with AI consolidation ${options.enableAIConsolidation ? 'enabled' : 'disabled'}`);
    
    // Generate original requirements using standard method
    const original = await this.generateForCategory(categoryName, frameworkRequirements);
    
    // Initialize default metrics
    const baseMetrics = {
      processingTimeMs: 0,
      aiConsolidationApplied: false,
      textReductionPercentage: 0,
      qualityScore: 100,
      apiKeyStatus: 'unknown',
      cachingUsed: false
    };

    if (!original) {
      const processingTime = Date.now() - startTime;
      console.log(`[AI-ENHANCED GENERATOR] No template found for category: ${categoryName}`);
      return {
        original: null,
        enhanced: null,
        metrics: {
          ...baseMetrics,
          processingTimeMs: processingTime,
          apiKeyStatus: 'template_not_found'
        }
      };
    }

    // If AI consolidation is disabled or not available, return original only
    if (!options.enableAIConsolidation) {
      const processingTime = Date.now() - startTime;
      console.log(`[AI-ENHANCED GENERATOR] AI consolidation disabled for ${categoryName}`);
      return {
        original,
        enhanced: null,
        metrics: {
          ...baseMetrics,
          processingTimeMs: processingTime,
          apiKeyStatus: 'disabled'
        }
      };
    }

    try {
      // Initialize AI Integration Service
      const aiService = new AIIntegrationService();
      
      // Check if AI consolidation is available
      if (!aiService.isAIConsolidationAvailable()) {
        const processingTime = Date.now() - startTime;
        const keyStatus = aiService.getAPIKeyStatus();
        
        console.log(`[AI-ENHANCED GENERATOR] AI consolidation not available for ${categoryName}:`, keyStatus);
        
        // Return original with fallback if enabled
        if (options.fallbackToOriginal !== false) {
          return {
            original,
            enhanced: null,
            metrics: {
              ...baseMetrics,
              processingTimeMs: processingTime,
              apiKeyStatus: `no_api_key_${keyStatus.provider}`
            }
          };
        }
        
        // Return error if fallback disabled
        throw new Error(`AI consolidation unavailable: ${keyStatus.keySource}`);
      }

      // Apply AI consolidation
      const aiIntegrationOptions: AIIntegrationOptions = {
        enableAIConsolidation: true,
        targetReduction: 25,
        qualityThreshold: 85,
        preserveAllDetails: true,
        useCache: true,
        fallbackToOriginal: options.fallbackToOriginal !== false,
        ...options.aiConsolidationOptions
      };

      const aiResult = await aiService.applyAIConsolidation(
        original,
        frameworkRequirements,
        aiIntegrationOptions
      );

      const processingTime = Date.now() - startTime;
      const keyStatus = aiService.getAPIKeyStatus();

      // Build final metrics
      const finalMetrics = {
        processingTimeMs: processingTime,
        aiConsolidationApplied: aiResult.success && aiResult.enhanced !== null,
        textReductionPercentage: aiResult.metrics.textReductionPercentage,
        qualityScore: aiResult.metrics.qualityScore,
        apiKeyStatus: `${keyStatus.provider}_${keyStatus.hasValidKey ? 'valid' : 'invalid'}`,
        cachingUsed: aiResult.metrics.cachingUsed
      };

      console.log(`[AI-ENHANCED GENERATOR] AI consolidation completed for ${categoryName}:`, {
        success: aiResult.success,
        enhanced: aiResult.enhanced !== null,
        reduction: `${finalMetrics.textReductionPercentage}%`,
        quality: finalMetrics.qualityScore,
        provider: keyStatus.provider
      });

      return {
        original,
        enhanced: aiResult.enhanced,
        aiIntegration: options.includeMetrics ? aiResult : undefined,
        metrics: finalMetrics
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`[AI-ENHANCED GENERATOR] Error during AI consolidation for ${categoryName}:`, error);
      
      // Return original with fallback if enabled
      if (options.fallbackToOriginal !== false) {
        return {
          original,
          enhanced: null,
          metrics: {
            ...baseMetrics,
            processingTimeMs: processingTime,
            apiKeyStatus: `error_${error instanceof Error ? error.message.substring(0, 20) : 'unknown'}`
          }
        };
      }
      
      // Re-throw error if fallback disabled
      throw error;
    }
  }

  /**
   * Batch generation with AI consolidation for multiple categories
   */
  static async generateMultipleCategoriesWithAI(
    categoryRequirements: Array<{
      categoryName: string;
      frameworkRequirements: FrameworkRequirement[];
    }>,
    options: EnhancedGenerationOptions = {}
  ): Promise<Map<string, EnhancedGenerationResult>> {
    
    console.log(`[AI-ENHANCED GENERATOR] Batch processing ${categoryRequirements.length} categories with AI consolidation`);
    
    const results = new Map<string, EnhancedGenerationResult>();
    
    // Initialize AI service once for better performance
    const aiService = new AIIntegrationService();
    const isAIAvailable = aiService.isAIConsolidationAvailable();
    const keyStatus = aiService.getAPIKeyStatus();
    
    console.log(`[AI-ENHANCED GENERATOR] AI consolidation status:`, {
      available: isAIAvailable,
      provider: keyStatus.provider,
      hasKey: keyStatus.hasValidKey
    });

    for (const { categoryName, frameworkRequirements } of categoryRequirements) {
      try {
        const result = await this.generateForCategoryWithAI(
          categoryName,
          frameworkRequirements,
          options
        );
        
        results.set(categoryName, result);
        
        console.log(`[AI-ENHANCED GENERATOR] Completed ${categoryName}: AI=${result.metrics.aiConsolidationApplied}, Reduction=${result.metrics.textReductionPercentage}%`);
        
      } catch (error) {
        console.error(`[AI-ENHANCED GENERATOR] Failed to process ${categoryName}:`, error);
        
        // Create error result
        results.set(categoryName, {
          original: null,
          enhanced: null,
          metrics: {
            processingTimeMs: 0,
            aiConsolidationApplied: false,
            textReductionPercentage: 0,
            qualityScore: 0,
            apiKeyStatus: 'error',
            cachingUsed: false
          }
        });
      }
    }
    
    console.log(`[AI-ENHANCED GENERATOR] Batch processing completed: ${results.size}/${categoryRequirements.length} categories processed`);
    return results;
  }

  /**
   * Get AI consolidation statistics for a batch of results
   */
  static getAIConsolidationStats(results: Map<string, EnhancedGenerationResult>) {
    const values = Array.from(results.values());
    const successful = values.filter(r => r.metrics.aiConsolidationApplied);
    
    return {
      totalCategories: values.length,
      aiEnhancedCategories: successful.length,
      enhancementRate: values.length > 0 ? Math.round((successful.length / values.length) * 100) : 0,
      averageReduction: successful.length > 0 
        ? Math.round(successful.reduce((sum, r) => sum + r.metrics.textReductionPercentage, 0) / successful.length)
        : 0,
      averageQuality: successful.length > 0
        ? Math.round(successful.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / successful.length)
        : 0,
      cacheUtilization: successful.length > 0
        ? Math.round((successful.filter(r => r.metrics.cachingUsed).length / successful.length) * 100)
        : 0,
      totalProcessingTime: values.reduce((sum, r) => sum + r.metrics.processingTimeMs, 0),
      apiProviders: Array.from(new Set(values.map(r => r.metrics.apiKeyStatus.split('_')[0]))).filter(p => p !== 'unknown' && p !== 'error')
    };
  }
  
  /**
   * Deduplicate requirements - remove exact duplicates and near-duplicates
   */
  private static deduplicateRequirements(requirements: FrameworkRequirement[]): FrameworkRequirement[] {
    const deduplicated: FrameworkRequirement[] = [];
    const seenHashes = new Set<string>();
    
    for (const req of requirements) {
      // Create hash of key content for deduplication
      const contentHash = this.createContentHash(req);
      
      if (!seenHashes.has(contentHash)) {
        seenHashes.add(contentHash);
        deduplicated.push(req);
      } else {
        console.log(`[DEDUPLICATION] Removed duplicate: ${req.framework} ${req.code}`);
      }
    }
    
    return deduplicated;
  }
  
  /**
   * Create content hash for deduplication
   */
  private static createContentHash(req: FrameworkRequirement): string {
    // Normalize text for comparison
    const normalizedTitle = req.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const normalizedDesc = req.description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200); // First 200 chars for comparison
    
    return `${normalizedTitle}|${normalizedDesc}`;
  }
  
  /**
   * Detect overlapping requirements and merge them intelligently
   */
  private static detectAndMergeOverlaps(requirements: FrameworkRequirement[]): FrameworkRequirement[] {
    const merged: FrameworkRequirement[] = [];
    const processed = new Set<string>();
    
    for (const req of requirements) {
      if (processed.has(req.id)) continue;
      
      // Find similar requirements
      const similar = requirements.filter(other => 
        !processed.has(other.id) && 
        this.calculateSimilarity(req, other) > 0.75 // High threshold for overlap
      );
      
      if (similar.length > 1) {
        // Merge overlapping requirements
        const mergedReq = this.mergeRequirements(similar);
        merged.push(mergedReq);
        similar.forEach(s => processed.add(s.id));
        console.log(`[OVERLAP DETECTION] Merged ${similar.length} similar requirements`);
      } else {
        // No overlap, keep original
        merged.push(req);
        processed.add(req.id);
      }
    }
    
    return merged;
  }
  
  /**
   * Calculate similarity between two requirements
   */
  private static calculateSimilarity(req1: FrameworkRequirement, req2: FrameworkRequirement): number {
    const text1 = `${req1.title} ${req1.description}`.toLowerCase();
    const text2 = `${req2.title} ${req2.description}`.toLowerCase();
    
    // Simple word-based similarity
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Merge similar requirements into one unified requirement
   */
  private static mergeRequirements(requirements: FrameworkRequirement[]): FrameworkRequirement {
    // Use the most description
    const primary = requirements.reduce((prev, current) => 
      current.description.length > prev.description.length ? current : prev
    );
    
    // Combine all framework codes
    const allCodes = requirements.map(r => `${r.framework} ${r.code}`).join(', ');
    
    // Create merged requirement
    return {
      ...primary,
      id: `merged-${requirements.map(r => r.id).join('-')}`,
      code: allCodes,
      description: this.createMergedDescription(requirements)
    };
  }
  
  /**
   * Create merged description from multiple requirements
   */
  private static createMergedDescription(requirements: FrameworkRequirement[]): string {
    // Start with the longest, most detailed description
    const primary = requirements.reduce((prev, current) => 
      current.description.length > prev.description.length ? current : prev
    );
    
    let mergedDesc = primary.description;
    
    // Add unique details from other requirements
    const uniqueDetails: string[] = [];
    requirements.forEach(req => {
      if (req.id !== primary.id) {
        // Extract unique phrases (simple approach)
        const uniquePhrases = req.description.split(/[.,;]/)
          .map(phrase => phrase.trim())
          .filter(phrase => 
            phrase.length > 15 && 
            !mergedDesc.toLowerCase().includes(phrase.toLowerCase())
          );
        
        uniqueDetails.push(...uniquePhrases.slice(0, 1)); // Max 1 per requirement
      }
    });
    
    if (uniqueDetails.length > 0) {
      mergedDesc += ` Additionally: ${uniqueDetails.join('; ')}.`;
    }
    
    return mergedDesc;
  }
  
  /**
   * Map requirements to sub-requirement letters using enhanced keyword matching with semantic analysis
   */
  private static mapRequirementsToSubRequirements(
    requirements: FrameworkRequirement[],
    template: any
  ): Record<string, FrameworkRequirement[]> {
    
    const mapping: Record<string, FrameworkRequirement[]> = {};
    
    // Define enhanced mapping rules with semantic keywords
    const mappingRules = this.getMappingRules(template.title);
    
    for (const req of requirements) {
      const content = `${req.title} ${req.description}`.toLowerCase();
      
      // Enhanced scoring with multiple factors
      let bestMatch = { letter: 'a', score: 0, confidence: 0 };
      const scores: Array<{letter: string, score: number, confidence: number}> = [];
      
      for (const subReq of template.subRequirements) {
        const keywords = mappingRules[subReq.letter] || [];
        
        // Calculate enhanced score with multiple factors
        const keywordScore = this.calculateEnhancedKeywordScore(content, keywords);
        const semanticScore = this.calculateSemanticScore(content, subReq.title, subReq.description);
        const contextScore = this.calculateContextScore(content, keywords);
        
        // Weighted composite score
        const compositeScore = (keywordScore * 0.5) + (semanticScore * 0.3) + (contextScore * 0.2);
        
        // Calculate confidence based on multiple matches and specificity
        const confidence = this.calculateMatchConfidence(content, keywords, subReq.title);
        
        
        scores.push({ letter: subReq.letter, score: compositeScore, confidence });
        
        if (compositeScore > bestMatch.score) {
          bestMatch = { letter: subReq.letter, score: compositeScore, confidence };
        }
      }
      
      // Only assign if confidence meets minimum threshold (30%) or if it's clearly the best match
      const secondBest = scores.filter(s => s.letter !== bestMatch.letter).sort((a, b) => b.score - a.score)[0];
      const isSignificantlyBetter = !secondBest || (bestMatch.score > secondBest.score * 1.2);
      
      if (bestMatch.confidence >= 0.3 || (bestMatch.score > 0 && isSignificantlyBetter)) {
        // Add to mapping
        if (!mapping[bestMatch.letter]) {
          mapping[bestMatch.letter] = [];
        }
        mapping[bestMatch.letter].push(req);
      } else {
        // Fallback to first sub-requirement for low-confidence matches
        if (!mapping['a']) {
          mapping['a'] = [];
        }
        mapping['a'].push(req);
      }
    }
    
    return mapping;
  }
  
  /**
   * Get enhanced mapping rules for different categories with keyword coverage
   */
  private static getMappingRules(category: string): Record<string, string[]> {
    const rules: Record<string, Record<string, string[]>> = {
      'Governance & Leadership': {
        'a': ['leadership', 'commitment', 'accountability', 'board', 'executive', 'top management', 'senior leadership', 'management commitment', 'executive leadership', 'leadership responsibility'],
        'b': ['scope', 'boundaries', 'definition', 'charter', 'scope definition', 'boundary definition', 'isms scope', 'system boundaries', 'organizational boundaries'],
        'c': ['structure', 'roles', 'responsibilities', 'organization', 'organizational structure', 'governance structure', 'reporting lines', 'hierarchy', 'authority'],
        'd': ['policy', 'framework', 'establish', 'document', 'information security policy', 'policy framework', 'security policies', 'policy development', 'policy management'],
        'e': ['project management', 'project', 'security integration', 'project planning', 'project security', 'development projects', 'implementation projects'],
        'f': ['asset use', 'asset disposal', 'acceptable use', 'disposal procedures', 'equipment disposal', 'media disposal', 'secure disposal'],
        'g': ['documented procedures', 'procedures', 'processes', 'documentation', 'operating procedures', 'procedure management', 'process documentation'],
        'h': ['personnel security', 'background verification', 'employment', 'confidentiality agreements', 'employment termination', 'personnel controls'],
        'i': ['competence', 'training', 'awareness', 'education', 'competency', 'skill development', 'security awareness', 'training programs'],
        'j': ['compliance monitoring', 'oversight', 'monitoring', 'compliance assessment', 'regulatory compliance', 'audit compliance'],
        'k': ['change management', 'change control', 'system changes', 'modification control', 'change procedures', 'change approval'],
        'l': ['regulatory relationships', 'external stakeholders', 'regulatory authorities', 'compliance relationships', 'stakeholder management'],
        'm': ['incident response governance', 'incident management', 'response structure', 'incident procedures', 'escalation procedures'],
        'n': ['third-party governance', 'supplier management', 'vendor management', 'third party relationships', 'supplier risk'],
        'o': ['continuous improvement', 'improvement processes', 'isms improvement', 'performance improvement', 'system enhancement'],
        'p': ['awareness training governance', 'training governance', 'awareness programs', 'security culture', 'training management']
      },
      'Identity and Access Management Controls': {
        'a': ['account inventory', 'account lifecycle', 'user accounts', 'administrative accounts', 'service accounts', 'account management', 'provisioning', 'deprovisioning'],
        'b': ['unique authentication', 'passwords', 'credentials', 'default credentials', 'password complexity', 'authentication mechanisms', 'unique passwords'],
        'c': ['account management', 'dormant accounts', 'inactive accounts', 'account monitoring', 'account review', 'account status', 'account ownership'],
        'd': ['privileged access', 'administrator privileges', 'privileged access management', 'pam', 'administrative access', 'elevated privileges', 'utility programs'],
        'e': ['multi-factor authentication', 'mfa', 'two-factor', 'authentication factors', 'continuous authentication', 'external access', 'remote access'],
        'f': ['access provisioning', 'access granting', 'authorization workflows', 'role-based access', 'rbac', 'least privilege', 'access reviews'],
        'g': ['access verification', 'access validation', 'periodic reviews', 'access certification', 'user access review', 'access audit'],
        'h': ['network access', 'remote network access', 'vpn access', 'network authentication', 'network authorization', 'external network'],
        'i': ['segregation duties', 'separation of duties', 'conflicting privileges', 'privilege separation', 'duty conflicts', 'role conflicts'],
        'j': ['information access', 'data access', 'system access', 'application access', 'information authorization', 'data permissions'],
        'k': ['mobile device', 'mobile access', 'device management', 'mobile security', 'byod', 'device controls'],
        'l': ['teleworking', 'remote work', 'home working', 'mobile working', 'remote access controls', 'telework security']
      },
      'Asset Management': {
        'a': ['inventory', 'assets', 'cataloging', 'tracking'],
        'b': ['ownership', 'custodian', 'responsible', 'accountable'],
        'c': ['acceptable use', 'usage', 'guidelines', 'policies'],
        'd': ['return', 'recovery', 'termination', 'handover'],
        'e': ['classification', 'labeling', 'categorization', 'sensitivity'],
        'f': ['labelling', 'marking', 'identification', 'tags'],
        'g': ['handling', 'processing', 'storage', 'transmission']
      },
      'Risk Management': {
        'a': ['risk process', 'methodology', 'framework', 'approach'],
        'b': ['risk assessment', 'analysis', 'evaluation', 'identification'],
        'c': ['risk treatment', 'mitigation', 'controls', 'measures'],
        'd': ['risk acceptance', 'approval', 'tolerance', 'appetite'],
        'e': ['risk communication', 'reporting', 'sharing', 'intelligence']
      },
      'Cryptography': {
        'a': ['cryptographic policy', 'encryption', 'standards', 'algorithms'],
        'b': ['key management', 'key lifecycle', 'key storage', 'key distribution'],
        'c': ['cryptographic implementation', 'encryption usage', 'crypto controls']
      },
      'Physical and Environmental Security': {
        'a': ['physical perimeter', 'boundaries', 'secure areas', 'premises'],
        'b': ['entry controls', 'access controls', 'physical access', 'visitor management'],
        'c': ['environmental threats', 'natural disasters', 'weather', 'climate'],
        'd': ['equipment maintenance', 'servicing', 'repair', 'upkeep'],
        'e': ['secure disposal', 'destruction', 'sanitization', 'decommissioning']
      },
      'Operations Security': {
        'a': ['operating procedures', 'documentation', 'processes', 'instructions'],
        'b': ['change management', 'change control', 'modifications', 'updates'],
        'c': ['capacity management', 'performance', 'resources', 'monitoring'],
        'd': ['system separation', 'segregation', 'isolation', 'environments'],
        'e': ['malware protection', 'antivirus', 'malicious software', 'threats'],
        'f': ['backup', 'recovery', 'restore', 'data protection'],
        'g': ['event logging', 'audit logs', 'monitoring', 'surveillance']
      },
      'Communications Security': {
        'a': ['network controls', 'network security', 'network management', 'segmentation'],
        'b': ['network services', 'service levels', 'network agreements', 'connectivity'],
        'c': ['network segregation', 'isolation', 'separation', 'zones'],
        'd': ['information transfer', 'data transmission', 'communication', 'exchange'],
        'e': ['transfer agreements', 'business information', 'external transfer', 'partnerships'],
        'f': ['electronic messaging', 'email', 'messaging systems', 'communication tools'],
        'g': ['confidentiality agreements', 'non-disclosure', 'privacy', 'secrecy']
      },
      'System Acquisition Development & Maintenance': {
        'a': ['security requirements', 'system requirements', 'specifications', 'analysis'],
        'b': ['application services', 'public networks', 'service security', 'online services'],
        'c': ['application transactions', 'transaction security', 'data integrity', 'communication'],
        'd': ['secure development', 'development policy', 'coding standards', 'secure design'],
        'e': ['system engineering', 'secure engineering', 'system design', 'architecture'],
        'f': ['development environment', 'secure environment', 'development security', 'build'],
        'g': ['outsourced development', 'third party', 'vendor development', 'external']
      },
      'Supplier Relationships': {
        'a': ['supplier policy', 'vendor management', 'third party', 'external relationships'],
        'b': ['supplier agreements', 'contracts', 'security requirements', 'vendor contracts'],
        'c': ['supply chain', 'technology supply', 'procurement', 'sourcing'],
        'd': ['supplier monitoring', 'vendor review', 'performance monitoring', 'oversight'],
        'e': ['supplier changes', 'vendor changes', 'service modifications', 'updates']
      },
      'Information Security Incident Management': {
        'a': ['incident management', 'incident response', 'procedures', 'responsibilities'],
        'b': ['incident reporting', 'event reporting', 'security events', 'notifications'],
        'c': ['weakness reporting', 'vulnerability reporting', 'security weaknesses', 'flaws'],
        'd': ['incident assessment', 'event assessment', 'classification', 'evaluation'],
        'e': ['incident response', 'incident handling', 'response procedures', 'resolution'],
        'f': ['incident learning', 'lessons learned', 'improvement', 'knowledge']
      },
      'Information Security Aspects of Business Continuity Management': {
        'a': ['continuity planning', 'business continuity', 'disaster recovery', 'planning'],
        'b': ['continuity implementation', 'recovery procedures', 'business recovery', 'restoration'],
        'c': ['continuity verification', 'testing', 'validation', 'review'],
        'd': ['technology readiness', 'system resilience', 'infrastructure', 'availability']
      },
      'Compliance': {
        'a': ['legislation', 'regulatory requirements', 'legal compliance', 'statutory'],
        'b': ['intellectual property', 'copyright', 'licensing', 'proprietary'],
        'c': ['records protection', 'record keeping', 'documentation', 'archives'],
        'd': ['privacy protection', 'personal data', 'data protection', 'personally identifiable'],
        'e': ['cryptographic compliance', 'encryption regulations', 'crypto legal', 'standards'],
        'f': ['independent review', 'audits', 'assessments', 'evaluations']
      }
    };
    
    return rules[category] || {};
  }
  
  /**
   * Calculate enhanced keyword matching score with frequency and position weighting
   */
  private static calculateEnhancedKeywordScore(content: string, keywords: string[]): number {
    let score = 0;
    const contentLower = content.toLowerCase();
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Count occurrences and weight by position (title occurrences weighted more)
      const titleWeight = contentLower.indexOf(keywordLower) < 100 ? 2 : 1; // First 100 chars considered "title"
      const occurrences = (contentLower.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      if (occurrences > 0) {
        // Score = keyword specificity * frequency * position weight
        const specificity = keyword.length * 2; // Longer keywords are more specific
        const frequencyBonus = Math.min(occurrences * 0.5, 2); // Cap frequency bonus at 2
        score += specificity * (1 + frequencyBonus) * titleWeight;
      }
    }
    
    return score;
  }
  
  /**
   * Calculate semantic similarity score between content and sub-requirement
   */
  private static calculateSemanticScore(content: string, subReqTitle: string, subReqDescription: string): number {
    const contentLower = content.toLowerCase();
    const titleLower = subReqTitle.toLowerCase();
    const descLower = subReqDescription.toLowerCase();
    
    let score = 0;
    
    // Extract key terms from sub-requirement title and description
    const titleTerms = this.extractKeyTerms(titleLower);
    const descTerms = this.extractKeyTerms(descLower);
    
    // Check for semantic matches
    for (const term of titleTerms) {
      if (contentLower.includes(term)) {
        score += term.length * 3; // Title terms weighted heavily
      }
    }
    
    for (const term of descTerms.slice(0, 5)) { // Limit to top 5 description terms
      if (contentLower.includes(term)) {
        score += term.length * 1.5; // Description terms weighted moderately
      }
    }
    
    return score;
  }
  
  /**
   * Calculate contextual score based on surrounding keywords
   */
  private static calculateContextScore(content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    
    // Context keywords that enhance relevance
    const contextEnhancers = [
      'implement', 'establish', 'maintain', 'ensure', 'define', 'document',
      'manage', 'control', 'monitor', 'review', 'assess', 'validate'
    ];
    
    for (const keyword of keywords) {
      const keywordPos = contentLower.indexOf(keyword.toLowerCase());
      if (keywordPos >= 0) {
        // Check for context enhancers within 50 characters
        const contextStart = Math.max(0, keywordPos - 50);
        const contextEnd = Math.min(contentLower.length, keywordPos + keyword.length + 50);
        const context = contentLower.slice(contextStart, contextEnd);
        
        for (const enhancer of contextEnhancers) {
          if (context.includes(enhancer)) {
            score += 2; // Context bonus
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Calculate confidence score for the mapping
   */
  private static calculateMatchConfidence(content: string, keywords: string[], subReqTitle: string): number {
    const contentLower = content.toLowerCase();
    const titleTerms = this.extractKeyTerms(subReqTitle.toLowerCase());
    
    let matches = 0;
    let totalTerms = keywords.length + titleTerms.length;
    
    // Count keyword matches
    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    // Count title term matches
    for (const term of titleTerms) {
      if (contentLower.includes(term)) {
        matches++;
      }
    }
    
    // Confidence = match ratio with minimum floor
    const confidence = totalTerms > 0 ? matches / totalTerms : 0;
    return Math.max(confidence, 0.1); // Minimum 10% confidence
  }
  
  /**
   * Extract key terms from text (filter out common words)
   */
  private static extractKeyTerms(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall'
    ]);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Return unique words sorted by length (longer first)
    return [...new Set(words)].sort((a, b) => b.length - a.length);
  }
  
  /**
   * Calculate keyword matching score (legacy method for compatibility)
   */
  private static calculateKeywordScore(content: string, keywords: string[]): number {
    return this.calculateEnhancedKeywordScore(content, keywords);
  }
  
  /**
   * Abstract requirement description to be clean and professional WITHOUT CUTOFFS
   */
  private static abstractRequirement(req: FrameworkRequirement): string {
    let description = req.description;
    
    // Remove common prefixes that add verbosity but keep full content
    description = description
      .replace(/^The organization (shall|must|should)\s*/i, '')
      .replace(/^Organizations (shall|must|should)\s*/i, '')
      .replace(/^It is required that\s*/i, '')
      .replace(/^In accordance with.*?,\s*/i, '')
      .replace(/\s*in accordance with.*$/i, '');
    
    // Clean up multiple spaces and normalize formatting
    description = description
      .replace(/\s+/g, ' ')
      .replace(/\s*([.!?])\s*/g, '$1 ')
      .trim();
    
    // Ensure first letter is capitalized
    description = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Remove trailing periods and normalize
    description = description.replace(/\.$/, '').trim();
    
    // NO CUTOFFS - Return full abstracted content
    return description;
  }
  
  /**
   * Get template for a specific category
   */
  private static getTemplate(categoryName: string): any {
    // Clean category name to match template keys - minimal cleaning
    const cleanName = categoryName
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .trim();

    console.log('[TEMPLATE DEBUG] Looking for template:', {
      originalName: categoryName,
      cleanName: cleanName
    });

    // Original 21 Category Templates (restored from database)
    const templates: Record<string, any> = {
      'Governance & Leadership': {
        title: 'Governance & Leadership',
        description: 'Digital operational resilience governance, organizational structure, and leadership accountability',
        subRequirements: [
          { letter: 'a', title: 'LEADERSHIP COMMITMENT AND ACCOUNTABILITY', description: 'ISO 27001 requires an Information Security Management System (ISMS), a systematic approach to managing security. Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability. Executive leadership must demonstrate visible commitment to information security (ISO 27001 Clause 5.1) - Assign specific accountability for security decisions and outcomes' },
          { letter: 'b', title: 'SCOPE AND BOUNDARIES DEFINITION', description: 'Define and document the scope of your information security management system (ISMS), including all assets, locations, and business processes that require protection - Document all systems, data, and infrastructure within security scope (ISO 27001 Clause 4.3) - Identify interfaces with external parties and third-party services (ISO 27001 Clause 4.3) - Define geographical and organizational boundaries clearly - Regular review and updates when business changes occur' },
          { letter: 'c', title: 'ORGANIZATIONAL STRUCTURE (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation) AND GOVERNANCE', description: 'Establish clear roles, responsibilities, and reporting lines for information security governance throughout the organization. Core Requirements: - Define security governance structure with clear hierarchy (ISO 27001 Clause 5.3) - Assign specific security responsibilities to key personnel (ISO 27001 Annex A.5.2) - Establish information security committee or steering group' },
          { letter: 'd', title: 'POLICY FRAMEWORK (ISO 27001 Foundation: Your information security policy becomes the cornerstone document where many governance requirements can be documented, approved, and communicated)', description: 'Develop, implement, and maintain information security policy framework aligned with business objectives and regulatory requirements - Create overarching information security policy approved by management (ISO 27001 Clause 5.2) - Develop supporting policies for specific security domains (ISO 27001 Annex A.5.1) - Ensure policies reflect current threats and business requirements - Regular review and update cycle for all security policies' },
          { letter: 'e', title: 'PROJECT MANAGEMENT AND SECURITY INTEGRATION (ISO 27002 Control 5.8: Information security in project management)', description: 'Integrate information security requirements into all project management processes, ensuring security is considered from project inception through completion - Include security requirements in project planning and design (ISO 27002 Control 5.8) - Conduct security risk assessments for all new projects (ISO 27001 Annex A.5.8) - Implement security testing and validation before deployment - Maintain security documentation throughout project lifecycle' },
          { letter: 'f', title: 'ASSET USE AND DISPOSAL GOVERNANCE', description: 'Define acceptable use policies for information and associated assets, including secure disposal procedures to prevent unauthorized disclosure - Establish clear guidelines for acceptable use of organizational assets (ISO 27001 Annex A.5.10) - Define procedures for secure disposal of equipment and media (ISO 27001 Annex A.7.14) - Implement asset tracking throughout its lifecycle (ISO 27001 Annex A.5.9) - Ensure data is properly sanitized before disposal or reuse' },
          { letter: 'g', title: 'DOCUMENTED PROCEDURES MANAGEMENT', description: 'Maintain documented operating procedures for all security processes, ensuring consistent implementation and compliance with requirements - Document all security processes and procedures clearly (ISO 27001 Clause 7.5.1) - Ensure procedures are accessible to relevant personnel (ISO 27001 Clause 7.5.3) - Maintain version control for all security documentation (ISO 27001 Clause 7.5.2) - Regular review and testing of documented procedures' },
          { letter: 'h', title: 'PERSONNEL SECURITY FRAMEWORK (ISO 27002 Control 6.2: Terms and conditions of employment, Control 6.5: Responsibilities after termination or change of employment)', description: 'Implement personnel security controls including background verification, confidentiality agreements, and clear responsibilities after employment termination - Conduct appropriate background checks for personnel (ISO 27001 Annex A.6.1) - Include security responsibilities in employment contracts (ISO 27001 Annex A.6.2) - Implement confidentiality and non-disclosure agreements - Define responsibilities after termination or change of employment (ISO 27002 Control 6.5) - Ensure proper return of assets upon employment termination' },
          { letter: 'i', title: 'COMPETENCE MANAGEMENT AND DEVELOPMENT', description: 'Determine and ensure the necessary competence of persons whose work affects information security performance - Define competency requirements for security-related roles (ISO 27001 Clause 7.2) - Assess current competency levels against requirements (ISO 27001 Clause 7.2) - Provide training and development to address gaps - Maintain records of competency assessments and training' },
          { letter: 'j', title: 'COMPLIANCE MONITORING AND OVERSIGHT', description: 'Establish monitoring, measurement, analysis and evaluation processes to ensure ongoing compliance with security requirements - Define monitoring processes for security controls effectiveness - Implement regular compliance assessments and audits - Establish metrics and KPIs for security performance - Regular reporting to management on compliance status' },
          { letter: 'k', title: 'CHANGE MANAGEMENT GOVERNANCE', description: 'Establish formal change management processes for all system modifications affecting information security - Define change approval processes and authorities - Assess security impact of all proposed changes - Implement change testing and validation procedures - Maintain change logs and documentation' },
          { letter: 'l', title: 'REGULATORY RELATIONSHIPS MANAGEMENT', description: 'Establish and maintain appropriate relationships with regulatory authorities and other external stakeholders - Maintain contact with special interest groups (ISO 27002 Control 5.6) - Establish communication channels with regulatory bodies - Participate in relevant security forums and associations - Monitor regulatory changes and compliance requirements' },
          { letter: 'm', title: 'INCIDENT RESPONSE GOVERNANCE STRUCTURE', description: 'Establish governance structures for incident response including roles, responsibilities, and escalation procedures - Define incident response team structure and authorities - Establish escalation procedures for critical incidents - Define communication protocols during incidents - Regular testing and updating of incident response procedures' },
          { letter: 'n', title: 'THIRD-PARTY GOVERNANCE FRAMEWORK', description: 'Implement governance controls for managing information security risks in third-party relationships - Establish supplier risk assessment processes - Define security requirements for third-party agreements - Implement ongoing monitoring of supplier security performance - Regular review and audit of third-party security controls' },
          { letter: 'o', title: 'CONTINUOUS IMPROVEMENT GOVERNANCE', description: 'Implement formal processes for continual improvement of the information security management system - Establish improvement identification and prioritization processes - Define roles and responsibilities for improvement initiatives - Implement tracking and measurement of improvement effectiveness - Regular review of improvement program effectiveness' },
          { letter: 'p', title: 'AWARENESS TRAINING GOVERNANCE', description: 'Establish security awareness training programs at the governance level to ensure organizational security culture - Design role-specific awareness training programs - Implement regular training updates and assessments - Measure training effectiveness and participation - Maintain training records and competency documentation' }
        ]
      },
      'Identity & Access Management': {
        title: 'Identity & Access Management',
        description: 'Identity lifecycle management, authentication, authorization, and access control framework across the enterprise',
        subRequirements: [
          { letter: 'a', title: 'ACCOUNT INVENTORY & LIFECYCLE', description: 'Establish and maintain inventory of all accounts (user, administrative, service, shared) with complete lifecycle management from provisioning to deprovisioning including automated processes for joiners, movers, and leavers' },
          { letter: 'b', title: 'UNIQUE AUTHENTICATION', description: 'Implement unique passwords/credentials for all enterprise assets and accounts, eliminate default credentials, enforce password complexity requirements, and implement secure password storage and transmission' },
          { letter: 'c', title: 'ACCOUNT MANAGEMENT', description: 'Disable or delete dormant accounts after maximum 45 days of inactivity, regularly review account status, implement automated account monitoring, and maintain account ownership records' },
          { letter: 'd', title: 'PRIVILEGED ACCESS CONTROLS', description: 'Restrict administrator privileges to dedicated administrator accounts, implement privileged access management (PAM) solutions, control utility program usage, and monitor privileged activities' },
          { letter: 'e', title: 'MULTI-FACTOR AUTHENTICATION', description: 'Require MFA for all externally-exposed applications, remote network access, administrative access, and sensitive system access with support for multiple authentication factors and continuous authentication where appropriate' },
          { letter: 'f', title: 'ACCESS PROVISIONING', description: 'Establish formal access granting processes with proper authorization workflows, role-based access control (RBAC), principle of least privilege, and regular access reviews and certifications' },
          { letter: 'g', title: 'ACCESS REVOCATION', description: 'Implement automated access revocation processes for terminated employees, role changes, and expired access, with immediate revocation capabilities for emergency situations' },
          { letter: 'h', title: 'CENTRALIZED IDENTITY MANAGEMENT', description: 'Deploy centralized account management through directory services or identity providers with single sign-on (SSO) capabilities, identity federation, and centralized policy enforcement' },
          { letter: 'i', title: 'ROLE-BASED ACCESS CONTROL', description: 'Define and maintain RBAC with documented access rights, role definitions, segregation of duties, and regular role reviews and updates' },
          { letter: 'j', title: 'AUTHENTICATION INFORMATION SECURITY', description: 'Secure allocation, distribution, storage, and management of authentication information with proper encryption, secure transmission, and credential recovery procedures' },
          { letter: 'k', title: 'ACCESS RIGHTS MANAGEMENT', description: 'Provision, review, modify, and remove access rights based on business requirements with formal approval processes and regular access certifications' },
          { letter: 'l', title: 'REMOTE ACCESS SECURITY', description: 'Implement specific security measures for remote working including VPN controls, device management, secure remote access protocols, and monitoring of remote activities' },
          { letter: 'm', title: 'PHYSICAL AND LOGICAL ACCESS INTEGRATION', description: 'Coordinate physical and logical access controls with unified access policies, visitor management, and area access restrictions' }
        ]
      },
      'Inventory and Control of Hardware Assets': {
        title: 'Inventory and Control of Hardware Assets',
        description: 'Hardware asset management including inventory, tracking, lifecycle management, and security controls with automated discovery tools',
        subRequirements: [
          { letter: 'a', title: 'COMPREHENSIVE HARDWARE INVENTORY', description: 'Establish and maintain detailed inventory of ALL hardware assets including computers, servers, network devices, mobile devices, IoT devices, and peripheral equipment. Document hardware specifications, locations, ownership, criticality, and security classification. Use automated discovery tools with network scanning, agent-based detection, and manual verification to achieve 98% inventory accuracy with weekly updates.' },
          { letter: 'b', title: 'UNAUTHORIZED HARDWARE DETECTION', description: 'Implement automated detection of unauthorized hardware connections within 4 hours using network access control (NAC), endpoint detection, and physical security monitoring. Establish immediate quarantine procedures for unauthorized devices with automated network isolation. Document all unauthorized hardware incidents with investigation and remediation procedures. Deploy network monitoring tools to detect rogue devices and unauthorized connections.' },
          { letter: 'c', title: 'AUTOMATED ASSET DISCOVERY', description: 'Deploy automated asset discovery tools including network scanners, DHCP monitoring, wireless access point detection, and endpoint agents. Configure continuous scanning across all network segments, VLANs, and remote locations. Integrate discovery tools with Configuration Management Database (CMDB) and asset management systems. Implement discovery tool monitoring with 24/7 coverage and real-time alerting for new device detection.' },
          { letter: 'd', title: 'NETWORK ACCESS CONTROL', description: 'Implement technical controls to prevent unauthorized hardware connections including 802.1X authentication, NAC solutions, port security, and wireless access controls. Configure automatic device quarantine for non-compliant or unknown devices. Establish device onboarding procedures with security validation and compliance verification. Deploy certificate-based device authentication where possible.' },
          { letter: 'e', title: 'ASSET LIFECYCLE MANAGEMENT', description: 'Manage complete hardware lifecycle from procurement through secure disposal including acquisition approval, deployment, maintenance, upgrades, and retirement. Establish asset tracking with unique identifiers, barcodes, or RFID tags. Implement asset transfer procedures with security validation and documentation updates. Maintain asset warranty and support contract tracking with automated renewal notifications.' },
          { letter: 'f', title: 'HARDWARE CLASSIFICATION AND LABELING', description: 'Implement asset classification based on criticality, sensitivity, and business function including public, internal, confidential, and restricted classifications. Apply physical labels and digital tags to all assets. Establish handling procedures for each classification level including storage, transport, and access requirements. Maintain classification review and update procedures with annual validation.' },
          { letter: 'g', title: 'ASSET OWNERSHIP AND RESPONSIBILITY', description: 'Assign and document asset ownership for every hardware device including asset custodian, technical owner, and business owner responsibilities. Establish clear accountability for asset security, maintenance, and compliance. Implement asset transfer procedures with ownership updates and security validation. Maintain asset responsibility matrices with contact information and escalation procedures.' },
          { letter: 'h', title: 'CONTINUOUS INVENTORY AUDITING', description: 'Conduct regular physical inventory audits using barcode scanning, RFID systems, and visual verification with quarterly full audits and monthly spot checks. Implement automated inventory reconciliation with discovery tools and manual verification. Establish discrepancy investigation procedures with root cause analysis and corrective actions. Maintain audit trails with photographic evidence and location verification.' },
          { letter: 'i', title: 'MOBILE AND PORTABLE DEVICE CONTROL', description: 'Implement enhanced controls for mobile devices including laptops, tablets, smartphones, and USB storage devices with mobile device management (MDM), encryption requirements, and remote wipe capabilities. Establish device check-out/check-in procedures with security validation. Deploy asset tracking for portable devices using GPS or asset management software with location monitoring.' },
          { letter: 'j', title: 'IoT AND EMBEDDED DEVICE MANAGEMENT', description: 'Extend asset management to Internet of Things (IoT) devices, embedded systems, and specialized equipment including industrial controls, security cameras, and building automation systems. Implement network segmentation for IoT devices with dedicated VLANs and security monitoring. Establish firmware update procedures and security configuration management for embedded devices.' },
          { letter: 'k', title: 'CLOUD AND VIRTUAL ASSET TRACKING', description: 'Manage cloud-based infrastructure and virtual assets including virtual machines, containers, cloud storage, and Platform-as-a-Service resources. Implement cloud asset discovery and inventory tools with cost tracking and security configuration monitoring. Establish cloud asset lifecycle management with automated provisioning and deprovisioning procedures.' },
          { letter: 'l', title: 'ASSET SECURITY AND COMPLIANCE', description: 'Implement security controls for all hardware assets including encryption requirements, access controls, monitoring capabilities, and compliance validation. Establish asset security baselines with configuration standards and security monitoring. Conduct regular security assessments of critical assets with vulnerability scanning and compliance checking. Maintain asset security documentation for audit and regulatory compliance.' }
        ]
      },
      'Inventory and Control of Software Assets': {
        title: 'Inventory and Control of Software Assets',
        description: 'Software asset management including inventory, licensing, vulnerability management, and unauthorized software control with automated tools',
        subRequirements: [
          { letter: 'a', title: 'SOFTWARE INVENTORY MANAGEMENT', description: 'Establish and maintain inventory of ALL software assets including installed applications, versions, licenses, dependencies, and security patches. Use automated software discovery tools with agent-based and agentless scanning to capture operating systems, applications, browser plugins, and development tools. Update inventory within 24 hours of software changes and maintain 95% inventory accuracy.' },
          { letter: 'b', title: 'UNAUTHORIZED SOFTWARE CONTROL', description: 'Implement automated detection and removal of unauthorized software within 72 hours of discovery. Establish software allowlisting policies with defined business justification processes for new software requests. Deploy technical controls (application whitelisting, endpoint protection) to prevent unauthorized software installation. Document all software removal actions with business impact assessment.' },
          { letter: 'c', title: 'SOFTWARE LICENSING COMPLIANCE', description: 'Maintain software licensing records including license types, quantities, expiration dates, and compliance status. Conduct monthly license reconciliation against installed software inventory. Establish automated alerting for license violations or approaching expiration (30-day notice). Maintain vendor relationships and license agreements with centralized license management.' },
          { letter: 'd', title: 'AUTOMATED SOFTWARE DISCOVERY', description: 'Deploy automated software inventory tools across all enterprise assets including workstations, servers, mobile devices, and cloud instances. Configure continuous scanning with real-time inventory updates, software change detection, and coverage validation. Integrate discovery tools with CMDB and asset management systems for consolidated asset visibility.' },
          { letter: 'e', title: 'SOFTWARE ALLOWLISTING ENFORCEMENT', description: 'Implement technical controls to enforce software allowlisting including application control technologies, code signing verification, and hash-based allowlisting. Define software categories (approved, conditional, prohibited) with documented business justification. Establish change management processes for allowlist modifications with security review and approval workflows.' },
          { letter: 'f', title: 'SECURE SOFTWARE LIBRARIES', description: 'Maintain approved software library inventory including third-party components, open-source libraries, and development frameworks. Implement vulnerability scanning for software dependencies and components. Establish secure coding standards requiring use of approved libraries only. Monitor for library vulnerabilities and implement rapid patching for critical security issues.' },
          { letter: 'g', title: 'EXECUTABLE AND SCRIPT CONTROL', description: 'Control execution of scripts, macros, and executable content through technical controls and policy enforcement. Implement script execution policies restricting unauthorized PowerShell, batch files, and interpreted code execution. Deploy endpoint detection and response (EDR) solutions to monitor and control script activities. Maintain digital signing requirements for approved scripts.' },
          { letter: 'h', title: 'OPERATIONAL SOFTWARE CONTROL', description: 'Establish formal change management processes for software installation, modification, and removal on operational systems. Require security impact assessments for all software changes affecting production environments. Implement separation of duties between software requesters, approvers, and installers. Maintain rollback capabilities for all software deployments.' },
          { letter: 'i', title: 'SOFTWARE LIFECYCLE MANAGEMENT', description: 'Manage complete software lifecycle from procurement through disposal including vendor evaluation, security assessment, deployment, maintenance, and end-of-life planning. Establish software retirement procedures ensuring secure data removal and license compliance. Maintain software roadmaps with version control and upgrade planning.' },
          { letter: 'j', title: 'SOFTWARE SECURITY ASSESSMENT', description: 'Conduct security assessments of all software before deployment including vulnerability scanning, code review (for custom applications), and security configuration validation. Establish software security standards and acceptance criteria. Implement continuous monitoring for software security posture and emerging threats.' },
          { letter: 'k', title: 'CLOUD SOFTWARE GOVERNANCE', description: 'Extend software asset management to cloud-based software including Software-as-a-Service (SaaS), Platform-as-a-Service (PaaS), and Infrastructure-as-a-Service (IaaS) components. Monitor cloud software usage, licensing, and security configurations. Establish cloud software approval processes and shadow IT detection capabilities.' },
          { letter: 'l', title: 'SOFTWARE COMPLIANCE REPORTING', description: 'Generate software compliance reports including inventory status, licensing compliance, security posture, and policy violations. Provide executive dashboards with key metrics, trends, and compliance indicators. Maintain audit trails for all software management activities and ensure regulatory compliance documentation.' }
        ]
      },
      'Risk Management': {
        title: 'Risk Management',
        description: 'Risk management framework covering risk assessment, treatment, monitoring, and compliance with systematic processes for managing information security risks',
        subRequirements: [
          { letter: 'a', title: 'RISK MANAGEMENT FRAMEWORK', description: 'Establish information security risk management framework aligned with business objectives, regulatory requirements, and organizational context including ISO 27001 and GDPR requirements' },
          { letter: 'b', title: 'RISK ASSESSMENT METHODOLOGY', description: 'Implement systematic risk assessment processes covering asset identification, threat assessment, vulnerability analysis, and impact evaluation with quantitative and qualitative methodologies' },
          { letter: 'c', title: 'RISK ANALYSIS AND INFORMATION SYSTEM SECURITY POLICIES', description: 'Conduct cybersecurity risk analysis and develop information system security policies that address identified risks and regulatory requirements' },
          { letter: 'd', title: 'RISK TREATMENT PLANNING', description: 'Develop and implement risk treatment plans with appropriate controls selection, implementation timelines, and resource allocation based on risk appetite and business priorities' },
          { letter: 'e', title: 'PROPORTIONATE CYBERSECURITY MEASURES', description: 'Implement appropriate and proportionate technical, operational, and organizational measures to manage cybersecurity risks and minimize incident impact' },
          { letter: 'f', title: 'EFFECTIVENESS ASSESSMENT PROCEDURES', description: 'Establish policies and procedures to assess the effectiveness of cybersecurity risk management measures with regular reviews, metrics, and improvement actions' },
          { letter: 'g', title: 'BUSINESS IMPACT ANALYSIS', description: 'Conduct business impact analysis to understand potential consequences of information security incidents on business operations, reputation, and compliance' },
          { letter: 'h', title: 'RISK MONITORING AND REVIEW', description: 'Implement continuous risk monitoring with regular risk assessments, control effectiveness reviews, and risk register updates to maintain current risk profile' },
          { letter: 'i', title: 'RISK COMMUNICATION', description: 'Establish risk communication procedures to ensure appropriate stakeholders are informed of risk status, treatment decisions, and residual risks at all organizational levels' },
          { letter: 'j', title: 'THIRD-PARTY RISK ASSESSMENT', description: 'Evaluate and manage information security risks from third-party relationships, suppliers, and service providers with risk assessment and ongoing monitoring' },
          { letter: 'k', title: 'EMERGING THREAT ANALYSIS', description: 'Monitor and assess emerging threats, vulnerabilities, and attack vectors to proactively adjust risk management strategies and control implementations' },
          { letter: 'l', title: 'REGULATORY COMPLIANCE RISK', description: 'Assess and manage compliance risks related to information security regulations, standards, and legal requirements with regular compliance monitoring and gap analysis' }
        ]
      },
      'Data Protection': {
        title: 'Data Protection',
        description: 'Data protection and privacy framework covering GDPR compliance, cryptographic controls, data lifecycle management, and privacy by design principles',
        subRequirements: [
          { letter: 'a', title: 'DATA CLASSIFICATION', description: 'Establish data classification scheme with categories, handling requirements, and protection levels based on sensitivity, regulatory requirements, and business value' },
          { letter: 'b', title: 'CRYPTOGRAPHIC CONTROLS', description: 'Implement appropriate cryptographic controls including encryption at rest, in transit, and in processing with key management, algorithm selection, and secure implementation' },
          { letter: 'c', title: 'DATA LOSS PREVENTION', description: 'Deploy data loss prevention (DLP) solutions with monitoring, detection, and prevention of unauthorized data access, transmission, and storage across all channels' },
          { letter: 'd', title: 'DATA HANDLING PROCEDURES', description: 'Establish secure data handling procedures covering data collection, processing, storage, transmission, sharing, and disposal throughout the data lifecycle' },
          { letter: 'e', title: 'PRIVACY BY DESIGN', description: 'Implement privacy by design principles with data minimization, purpose limitation, consent management, and privacy impact assessments for all data processing activities' },
          { letter: 'f', title: 'GDPR COMPLIANCE', description: 'Ensure full GDPR compliance including lawful basis determination, data subject rights, consent mechanisms, breach notification, and data protection impact assessments' },
          { letter: 'g', title: 'DATA SUBJECT RIGHTS', description: 'Implement data subject rights management including access, rectification, erasure, portability, and objection rights with automated response capabilities' },
          { letter: 'h', title: 'CROSS-BORDER DATA TRANSFERS', description: 'Manage international data transfers with appropriate safeguards, adequacy decisions, standard contractual clauses, and binding corporate rules' },
          { letter: 'i', title: 'DATA BREACH MANAGEMENT', description: 'Establish data breach response procedures including detection, assessment, notification, and remediation with regulatory reporting and stakeholder communication' },
          { letter: 'j', title: 'DATA RETENTION AND DISPOSAL', description: 'Implement data retention policies and secure disposal procedures with automated retention management and certified data destruction processes' },
          { letter: 'k', title: 'THIRD-PARTY DATA PROCESSING', description: 'Manage third-party data processing relationships with data processing agreements, due diligence, monitoring, and compliance verification' },
          { letter: 'l', title: 'DATA PROTECTION TRAINING', description: 'Provide data protection training for all personnel with role-specific guidance, GDPR awareness, and privacy-conscious culture development' },
          { letter: 'm', title: 'TECHNICAL AND ORGANIZATIONAL MEASURES', description: 'Implement technical and organizational measures (TOMs) ensuring appropriate security level relative to risk with regular assessment and updates' }
        ]
      },
      'GDPR Data Protection': {
        title: 'GDPR Data Protection',
        description: 'GDPR compliance framework covering essential privacy and data protection requirements',
        subRequirements: [
          { letter: 'a', title: 'LAWFUL BASIS', description: 'Establish lawful basis for all personal data processing activities and maintain processing records' },
          { letter: 'b', title: 'CONSENT MECHANISMS', description: 'Implement consent mechanisms that are freely given, specific, informed and unambiguous' },
          { letter: 'c', title: 'PRIVACY BY DESIGN', description: 'Design and implement data protection by design and by default in all systems' },
          { letter: 'd', title: 'DATA SUBJECT RIGHTS', description: 'Establish data subject rights fulfillment processes (access, rectification, erasure, portability)' },
          { letter: 'e', title: 'DATA PROTECTION IMPACT ASSESSMENTS', description: 'Conduct Data Protection Impact Assessments (DPIA) for high-risk processing activities' },
          { letter: 'f', title: 'BREACH NOTIFICATION', description: 'Implement personal data breach detection, notification and response procedures' },
          { letter: 'g', title: 'DATA RETENTION', description: 'Establish data retention, deletion and cross-border transfer compliance procedures' },
          { letter: 'h', title: 'DATA PROTECTION OFFICER', description: 'Designate Data Protection Officer (DPO) where required and define responsibilities' },
          { letter: 'i', title: 'PRIVACY-ENHANCING TECHNOLOGIES', description: 'Implement privacy-enhancing technologies and data minimization principles' },
          { letter: 'j', title: 'PROCESSOR AGREEMENTS', description: 'Establish processor agreements and third-party data protection compliance' },
          { letter: 'k', title: 'CHILDREN\'S DATA', description: 'Implement age verification and parental consent mechanisms for children' },
          { letter: 'l', title: 'PRIVACY NOTICES', description: 'Design transparent privacy notices and cookie consent management' },
          { letter: 'm', title: 'AUTOMATED DECISION-MAKING', description: 'Establish automated decision-making and profiling disclosure procedures' },
          { letter: 'n', title: 'DATA PORTABILITY', description: 'Implement data portability and interoperability mechanisms' },
          { letter: 'o', title: 'SUPERVISORY AUTHORITY LIAISON', description: 'Establish supervisory authority liaison and regulatory compliance monitoring' }
        ]
      },
      'Physical & Environmental Security Controls': {
        title: 'Physical & Environmental Security Controls',
        description: 'Physical and environmental security framework covering facility protection, equipment security, environmental controls, and physical access management',
        subRequirements: [
          { letter: 'a', title: 'PHYSICAL ACCESS CONTROL', description: 'Implement physical access controls including perimeter security, facility access restrictions, visitor management, and area-based access controls' },
          { letter: 'b', title: 'SECURE AREAS AND ZONES', description: 'Establish and maintain secure areas with appropriate physical protection including restricted zones, data center security, and equipment protection areas' },
          { letter: 'c', title: 'EQUIPMENT PROTECTION', description: 'Protect equipment from physical and environmental threats including power protection, climate control, fire suppression, and equipment security measures' },
          { letter: 'd', title: 'ENVIRONMENTAL MONITORING', description: 'Implement environmental monitoring and control systems for temperature, humidity, water detection, and other environmental factors affecting information systems' },
          { letter: 'f', title: 'EQUIPMENT MAINTENANCE', description: 'Establish secure equipment maintenance procedures including authorized service provider access, maintenance logging, and equipment sanitization' },
          { letter: 'g', title: 'SECURE DISPOSAL', description: 'Implement secure disposal or reuse procedures for equipment and media containing sensitive information with data destruction and verification processes' },
          { letter: 'h', title: 'OFF-SITE EQUIPMENT SECURITY', description: 'Protect off-site equipment and remote working environments with appropriate physical security measures and monitoring capabilities' },
          { letter: 'i', title: 'CABLING SECURITY', description: 'Secure power and telecommunications cabling to protect against interception, interference, and damage with proper cable management and protection' },
          { letter: 'j', title: 'DELIVERY AND LOADING AREAS', description: 'Control delivery and loading areas to prevent unauthorized access to facilities and ensure secure handling of equipment and materials' },
          { letter: 'k', title: 'PHYSICAL SECURITY MONITORING', description: 'Implement physical security monitoring systems including surveillance, intrusion detection, and access logging with 24/7 monitoring capabilities' },
          { letter: 'l', title: 'EMERGENCY PROCEDURES', description: 'Establish emergency response procedures for physical security incidents including evacuation plans, emergency contacts, and business continuity measures' }
        ]
      },
      'Secure Configuration of Hardware and Software': {
        title: 'Secure Configuration of Hardware and Software',
        description: 'Secure configuration management covering enterprise assets with systematic hardening, change control, monitoring, and cloud security integration',
        subRequirements: [
          { letter: 'a', title: 'SECURE CONFIGURATION PROCESS', description: 'Establish and maintain documented secure configuration process for all enterprise assets including configuration standards, baselines, and hardening guidelines' },
          { letter: 'b', title: 'NETWORK INFRASTRUCTURE CONFIGURATION', description: 'Implement secure configuration process for network infrastructure with network device hardening, secure protocols, and configuration management' },
          { letter: 'c', title: 'AUTOMATIC SESSION SECURITY', description: 'Configure automatic session locking on all enterprise assets with appropriate timeout settings, screen savers, and session termination controls' },
          { letter: 'd', title: 'FIREWALL IMPLEMENTATION', description: 'Implement and manage firewalls on servers and end-user devices with rule sets, monitoring, logging, and regular configuration reviews' },
          { letter: 'e', title: 'MOBILE DEVICE SECURITY', description: 'Enforce automatic device lockout and remote wipe capability on portable end-user devices with mobile device management (MDM) solutions' },
          { letter: 'f', title: 'CONFIGURATION BASELINES', description: 'Establish and maintain secure configuration baselines for operating systems, applications, and network devices with regular baseline updates and compliance monitoring' },
          { letter: 'g', title: 'CONFIGURATION CHANGE MANAGEMENT', description: 'Implement formal change management for configuration modifications with approval processes, testing, and rollback procedures' },
          { letter: 'h', title: 'CLOUD SECURITY CONFIGURATION', description: 'Implement security controls for cloud services including data encryption, access management, and cloud provider security assessments' },
          { letter: 'i', title: 'SYSTEM HARDENING', description: 'Apply system hardening measures including unnecessary service removal, port closure, default account management, and security feature enablement' },
          { letter: 'j', title: 'CONFIGURATION MONITORING', description: 'Continuously monitor configuration drift and unauthorized changes with automated detection, alerting, and remediation capabilities' },
          { letter: 'k', title: 'VULNERABILITY REMEDIATION IN CONFIGURATION', description: 'Address configuration-related vulnerabilities through systematic review, testing, and implementation of security patches and updates' },
          { letter: 'l', title: 'SECURE DEPLOYMENT', description: 'Implement secure deployment processes for new systems and applications with security validation, testing, and approval before production use' }
        ]
      },
      'Vulnerability Management': {
        title: 'Vulnerability Management',
        description: 'Vulnerability identification, assessment, and remediation program covering enterprise assets with systematic processes, automated tools, and risk-based prioritization',
        subRequirements: [
          { letter: 'a', title: 'VULNERABILITY MANAGEMENT PROCESS', description: 'Establish and maintain documented vulnerability management process covering identification, assessment, prioritization, remediation, and verification of vulnerabilities across all enterprise assets' },
          { letter: 'b', title: 'VULNERABILITY SCANNING', description: 'Perform automated vulnerability scans of internal and externally-exposed enterprise assets on at least quarterly basis (or more frequently) using SCAP-compliant vulnerability scanners with coverage' },
          { letter: 'c', title: 'THREAT INTELLIGENCE', description: 'Collect, analyze, and integrate threat intelligence information to identify emerging threats, vulnerabilities, and attack patterns relevant to the organization' },
          { letter: 'd', title: 'PATCH MANAGEMENT PROCESS', description: 'Establish and maintain systematic remediation and patching process with defined baselines, testing procedures, and rollback capabilities for enterprise assets' },
          { letter: 'e', title: 'AUTOMATED OS PATCH MANAGEMENT', description: 'Implement automated operating system patch management for all enterprise assets with appropriate testing, scheduling, and deployment controls' },
          { letter: 'f', title: 'AUTOMATED APPLICATION PATCH MANAGEMENT', description: 'Implement automated application patch management for all enterprise software with version control, testing, and deployment procedures' },
          { letter: 'g', title: 'VULNERABILITY REMEDIATION', description: 'Remediate detected vulnerabilities through systematic processes and tooling on monthly or more frequent basis with risk-based prioritization and tracking' },
          { letter: 'h', title: 'VULNERABILITY ASSESSMENT', description: 'Conduct systematic vulnerability assessments including technical vulnerability identification, impact analysis, and risk assessment of information systems' },
          { letter: 'i', title: 'EXTERNAL VULNERABILITY SCANNING', description: 'Perform regular automated vulnerability scans of externally-exposed assets using qualified scanning services or tools with public-facing coverage' },
          { letter: 'j', title: 'VULNERABILITY REPORTING', description: 'Maintain vulnerability reporting including status tracking, metrics, and management reporting on vulnerability posture and remediation progress' },
          { letter: 'k', title: 'EMERGENCY PATCHING', description: 'Establish emergency patching procedures for critical vulnerabilities with expedited testing, approval, and deployment processes' },
          { letter: 'l', title: 'VULNERABILITY VERIFICATION', description: 'Implement verification procedures to confirm successful remediation and validate that vulnerabilities have been properly addressed' }
        ]
      },
      'Malware Defenses': {
        title: 'Malware Defenses',
        description: 'Malware protection framework covering detection, prevention, response, and recovery with multi-layered defense strategies and automated protection systems',
        subRequirements: [
          { letter: 'a', title: 'COMPREHENSIVE ANTI-MALWARE DEPLOYMENT', description: 'Deploy and maintain enterprise-grade anti-malware software on ALL enterprise assets including workstations, servers, mobile devices, and email systems with centrally managed solutions providing real-time protection, behavioral analysis, and machine learning detection capabilities. Implement endpoint detection and response (EDR) solutions with advanced threat hunting capabilities. Configure anti-malware with heuristic analysis, sandboxing, and zero-day protection mechanisms.' },
          { letter: 'b', title: 'AUTOMATED SIGNATURE AND DEFINITION UPDATES', description: 'Configure anti-malware software for automatic signature updates with multiple daily update cycles (minimum every 4 hours) and emergency update capabilities for critical threats. Implement update verification procedures ensuring successful deployment across all endpoints with automated rollback capabilities for problematic updates. Deploy threat intelligence feeds and community-based threat information sharing to enhance detection capabilities.' },
          { letter: 'c', title: 'REAL-TIME PROTECTION AND MONITORING', description: 'Enable real-time scanning and monitoring including file system monitoring, network traffic analysis, email attachment scanning, web download inspection, and USB/removable media scanning with immediate threat quarantine and user notification. Deploy behavioral analysis engines to detect unknown malware and advanced persistent threats (APTs) with machine learning and artificial intelligence capabilities.' },
          { letter: 'd', title: 'MALWARE INCIDENT RESPONSE PROCEDURES', description: 'Establish malware incident response procedures including immediate isolation protocols, forensic evidence preservation, malware analysis procedures, and system restoration processes with detailed incident documentation and reporting requirements. Implement automated incident response workflows with security orchestration and automated response (SOAR) capabilities. Deploy incident classification with severity-based response procedures.' },
          { letter: 'e', title: 'EMAIL AND WEB MALWARE FILTERING', description: 'Implement advanced email security gateways with multi-layer malware filtering including attachment scanning, URL reputation checking, sandboxing analysis, and phishing protection with real-time threat intelligence integration. Deploy web security solutions with URL filtering, download protection, and browser isolation capabilities. Configure DNS filtering to block malicious domains and command-and-control communications.' },
          { letter: 'f', title: 'COMPREHENSIVE SYSTEM SCANNING', description: 'Conduct regular malware scans including full system scans (weekly), quick scans (daily), and on-demand scanning capabilities with scheduled scanning during off-hours and scan result monitoring. Implement memory scanning, rootkit detection, and boot sector analysis with custom scanning policies based on system criticality and threat landscape. Deploy network-based malware scanning for encrypted traffic analysis.' },
          { letter: 'g', title: 'USER TRAINING AND AWARENESS', description: 'Provide malware awareness training covering malware identification, social engineering tactics, safe computing practices, and incident reporting procedures with role-specific training and simulated phishing exercises. Implement security awareness measurement with user behavior analytics and training effectiveness assessment. Deploy just-in-time training triggered by risky user behavior or security events.' },
          { letter: 'h', title: 'CENTRALIZED MALWARE MANAGEMENT', description: 'Maintain centralized management of all anti-malware solutions with unified policy management, centralized reporting and analytics, and coordinated threat response capabilities across all enterprise assets. Implement malware dashboard with real-time threat status, infection statistics, and trend analysis. Deploy automated policy enforcement with compliance monitoring and remediation workflows.' },
          { letter: 'i', title: 'ADVANCED THREAT PROTECTION', description: 'Deploy advanced threat protection capabilities including threat intelligence integration, advanced persistent threat (APT) detection, fileless malware detection, and supply chain attack protection with behavioral analysis and anomaly detection. Implement threat hunting capabilities with proactive threat detection and investigation procedures. Deploy deception technologies and honeypots for early threat detection.' },
          { letter: 'j', title: 'MOBILE DEVICE MALWARE PROTECTION', description: 'Extend malware protection to mobile devices with mobile device management (MDM) integration, mobile application management (MAM), and mobile threat defense (MTD) solutions covering iOS and Android platforms. Implement mobile-specific threat detection including malicious app detection, network-based attacks, and device compromise indicators. Deploy secure mobile app distribution with app whitelisting and malware scanning.' },
          { letter: 'k', title: 'CLOUD AND VIRTUAL ENVIRONMENT PROTECTION', description: 'Implement malware protection for cloud environments and virtualized infrastructure including virtual machine (VM) scanning, container security, and cloud-native security solutions with API-based protection and serverless security. Deploy cloud workload protection platforms (CWPP) with runtime protection and compliance monitoring. Implement cloud-specific threat detection for cloud-native attacks and misconfigurations.' },
          { letter: 'l', title: 'MALWARE ANALYSIS AND INTELLIGENCE', description: 'Establish malware analysis capabilities including static and dynamic analysis, reverse engineering procedures, and threat intelligence development with internal analysis capabilities or external service integration. Deploy malware sandboxing and analysis platforms with automated analysis workflows and threat intelligence sharing. Implement indicators of compromise (IoC) management with threat hunting integration and attribution analysis.' }
        ]
      },
      'Email & Web Browser Protections': {
        title: 'Email & Web Browser Protections',
        description: 'Email and web browser security framework covering secure communications, web browsing protection, email security gateways, and user training with multi-layered defense',
        subRequirements: [
          { letter: 'a', title: 'SUPPORTED WEB BROWSER AND EMAIL CLIENT MANAGEMENT', description: 'Deploy and maintain only fully supported, up-to-date web browsers and email clients with automated patch management, version control, and end-of-life tracking. Establish browser and email client standards with approved software lists, configuration baselines, and security hardening guidelines. Implement centralized software deployment with automatic updates enabled and security configuration enforcement. Remove unsupported software within 30 days of end-of-support notifications.' },
          { letter: 'b', title: 'DNS FILTERING AND SECURITY SERVICES', description: 'Implement DNS filtering services for all enterprise assets including malicious domain blocking, command-and-control (C2) communication prevention, DNS over HTTPS (DoH) protection, and DNS tunneling detection. Deploy DNS security services with threat intelligence integration, real-time reputation checking, and category-based filtering with policy enforcement. Configure DNS logging and monitoring with anomaly detection and incident response integration.' },
          { letter: 'c', title: 'NETWORK-BASED URL FILTERING', description: 'Deploy and maintain network-based URL filtering policies covering malicious sites, inappropriate content, and business-use restrictions with real-time URL reputation checking and category-based filtering. Implement SSL inspection capabilities for encrypted web traffic with certificate validation and privacy protection. Configure bypass procedures for legitimate business needs with approval workflows and monitoring controls.' },
          { letter: 'd', title: 'EMAIL SECURITY GATEWAY PROTECTION', description: 'Deploy email security gateways with multi-layer protection including anti-spam filtering, anti-malware scanning, advanced threat protection, attachment sandboxing, and URL rewriting for link protection. Implement email authentication protocols (SPF, DKIM, DMARC) with policy enforcement and monitoring. Deploy email encryption capabilities with key management and secure message delivery systems.' },
          { letter: 'e', title: 'WEB APPLICATION FIREWALL DEPLOYMENT', description: 'Implement Web Application Firewalls (WAF) for all web-based applications with application-specific rule sets, OWASP Top 10 protection, DDoS mitigation capabilities, and API security protection. Configure WAF with automated rule updates, threat intelligence integration, and custom rule development for application-specific threats. Deploy WAF monitoring with attack detection, incident response, and security analytics integration.' },
          { letter: 'f', title: 'SECURE EMAIL COMMUNICATIONS', description: 'Configure email encryption and digital signatures including end-to-end encryption for sensitive communications, S/MIME or PGP implementation, certificate management, and secure key distribution. Implement email data loss prevention (DLP) with content inspection, policy enforcement, and automated classification. Deploy email archiving and retention systems with legal hold capabilities and compliance monitoring.' },
          { letter: 'g', title: 'WEB AND EMAIL SECURITY TRAINING', description: 'Provide user training on safe web browsing and email handling practices including phishing recognition, social engineering awareness, safe link clicking procedures, and secure file handling with regular training updates and effectiveness measurement. Implement simulated phishing exercises with user behavior tracking and targeted training. Deploy security awareness messaging and real-time coaching systems.' },
          { letter: 'h', title: 'TRAFFIC MONITORING AND THREAT DETECTION', description: 'Deploy monitoring of web and email traffic for security threats including behavioral analysis, anomaly detection, advanced persistent threat (APT) detection, and data exfiltration prevention. Implement Security Information and Event Management (SIEM) integration with correlation rules and automated alerting. Deploy threat hunting capabilities with proactive threat detection and investigation procedures.' },
          { letter: 'i', title: 'BROWSER SECURITY HARDENING', description: 'Implement browser security hardening including security policy enforcement, extension management, download protection, and cookie security with centralized browser configuration management. Deploy browser isolation technologies for high-risk web browsing with virtualized browsing environments. Configure browser security settings including script blocking, plugin management, and certificate validation with user override controls where appropriate.' },
          { letter: 'j', title: 'EMAIL FLOW SECURITY AND AUTHENTICATION', description: 'Implement email flow security including mail transfer agent (MTA) hardening, transport layer security (TLS) enforcement, and email authentication verification with sender policy framework (SPF), DomainKeys Identified Mail (DKIM), and Domain-based Message Authentication, Reporting, and Conformance (DMARC) policies. Deploy email security monitoring with message flow analysis, authentication failure tracking, and spoofing detection.' },
          { letter: 'k', title: 'ADVANCED WEB THREAT PROTECTION', description: 'Deploy advanced web threat protection capabilities including zero-day exploit protection, drive-by download prevention, malvertising protection, and browser exploit mitigation with real-time threat intelligence integration. Implement web reputation services with dynamic risk assessment and automated blocking of malicious sites. Deploy sandboxing technologies for suspicious web content analysis and threat investigation.' },
          { letter: 'l', title: 'CLOUD EMAIL AND WEB SECURITY', description: 'Extend email and web security controls to cloud-based services including cloud email security (Office 365, G Suite), cloud web security, and Software-as-a-Service (SaaS) application protection with API-based security integration. Implement cloud access security broker (CASB) solutions with data protection, threat protection, and compliance monitoring. Deploy cloud-native security services with centralized policy management and unified threat protection.' }
        ]
      },
      'Network Monitoring & Defense': {
        title: 'Network Monitoring & Defense',
        description: 'Network security framework covering infrastructure protection, monitoring, intrusion detection, threat hunting, and defense capabilities with advanced security technologies',
        subRequirements: [
          { letter: 'a', title: 'NETWORK SEGMENTATION AND SECURE ARCHITECTURE', description: 'Implement network segmentation with micro-segmentation capabilities, zero-trust network architecture principles, and software-defined perimeter (SDP) technologies. Deploy network access control (NAC) with device authentication, VLAN assignment, and policy enforcement. Establish security zones including DMZ, internal networks, management networks, and guest networks with strict inter-zone communication controls and monitoring.' },
          { letter: 'b', title: 'FIREWALL AND SECURITY CONTROL MANAGEMENT', description: 'Deploy and maintain next-generation firewalls (NGFW) with application awareness, intrusion prevention, URL filtering, and advanced threat protection capabilities. Implement firewall rule management with least-privilege principles, regular rule reviews (quarterly), and automated rule optimization. Deploy web application firewalls (WAF) for web-based applications with custom rule development and OWASP Top 10 protection.' },
          { letter: 'c', title: 'SECURE REMOTE ACCESS AND VPN', description: 'Establish secure remote access solutions including zero-trust VPN, multi-factor authentication, device compliance checking, and session monitoring capabilities. Deploy secure remote desktop solutions with jump servers, privileged access management (PAM), and session recording. Implement remote access policy enforcement with user behavior analytics and anomaly detection.' },
          { letter: 'd', title: 'WIRELESS NETWORK SECURITY CONTROLS', description: 'Implement enterprise-grade wireless security with WPA3 encryption, certificate-based authentication, rogue access point detection, and wireless intrusion prevention systems (WIPS). Deploy wireless network segmentation with guest network isolation, BYOD management, and device classification. Establish wireless security monitoring with RF analysis and threat detection capabilities.' },
          { letter: 'e', title: 'NETWORK DOCUMENTATION AND CONFIGURATION MANAGEMENT', description: 'Maintain network documentation including topology diagrams, IP address management (IPAM), configuration baselines, and change management procedures. Implement network configuration management with automated backups, version control, and compliance monitoring. Deploy network discovery tools with asset inventory integration and configuration drift detection.' },
          { letter: 'f', title: 'NETWORK ACCESS CONTROL AND AUTHENTICATION', description: 'Deploy network access control (NAC) solutions with 802.1X authentication, device profiling, policy enforcement, and quarantine capabilities. Implement network authentication integration with Active Directory, RADIUS, and certificate-based authentication. Establish device onboarding procedures with security validation and compliance checking.' },
          { letter: 'g', title: 'ADVANCED NETWORK MONITORING AND ANALYSIS', description: 'Deploy network monitoring tools including network traffic analysis (NTA), flow monitoring, packet capture capabilities, and bandwidth monitoring with performance and security analytics. Implement network behavior analysis with machine learning and artificial intelligence for anomaly detection. Deploy network forensics capabilities with full packet capture and analysis tools.' },
          { letter: 'h', title: 'INTRUSION DETECTION AND PREVENTION SYSTEMS', description: 'Implement network-based intrusion detection and prevention systems (NIDS/NIPS) with signature-based and behavioral analysis capabilities, threat intelligence integration, and automated response capabilities. Deploy host-based intrusion detection systems (HIDS) with file integrity monitoring, log analysis, and system behavior monitoring. Configure IDPS with custom rules and tuning for organization-specific threats.' },
          { letter: 'i', title: 'NETWORK TRAFFIC ANALYSIS AND LOGGING', description: 'Establish network traffic analysis including flow analysis, deep packet inspection (DPI), encrypted traffic analysis, and metadata extraction with centralized logging and long-term retention (minimum 90 days). Implement network traffic baseline establishment with anomaly detection and trend analysis. Deploy network traffic correlation with security event analysis and incident response integration.' },
          { letter: 'j', title: 'NETWORK-BASED MALWARE DETECTION', description: 'Deploy network-based malware detection capabilities including sandbox analysis, reputation-based filtering, command-and-control (C2) communication detection, and data exfiltration prevention. Implement DNS filtering and monitoring with malicious domain blocking and DNS tunneling detection. Deploy network-based threat intelligence with indicator of compromise (IoC) integration and automated blocking.' },
          { letter: 'k', title: 'NETWORK SECURITY MONITORING AND SOC INTEGRATION', description: 'Establish network security monitoring with Security Operations Center (SOC) integration, 24/7 monitoring capabilities, and incident response coordination. Implement network security event correlation with SIEM integration, automated alerting, and escalation procedures. Deploy threat hunting capabilities with proactive threat detection and investigation procedures.' },
          { letter: 'l', title: 'NETWORK FORENSICS AND INCIDENT RESPONSE', description: 'Develop network forensics capabilities including packet capture analysis, network timeline reconstruction, and evidence preservation procedures with legal admissibility requirements. Implement network incident response procedures with network isolation, traffic analysis, and attack vector identification. Deploy network-based indicators of compromise (IoC) with automated detection and response capabilities.' },
          { letter: 'm', title: 'THREAT INTELLIGENCE AND NETWORK SECURITY', description: 'Integrate threat intelligence feeds with network security tools including threat intelligence platforms (TIP), automated indicator sharing, and contextual threat analysis. Implement threat intelligence-driven security with proactive defense measures and predictive analytics. Deploy threat intelligence correlation with network monitoring and incident response integration.' },
          { letter: 'n', title: 'NETWORK SECURITY EVENT CORRELATION', description: 'Establish advanced security event correlation capabilities with machine learning and artificial intelligence for pattern recognition, anomaly detection, and automated threat detection across multiple network security tools and data sources. Implement correlation rule development with custom logic and business-specific threat scenarios. Deploy automated response capabilities with security orchestration and automated response (SOAR) integration.' },
          { letter: 'o', title: 'NETWORK SECURITY ASSESSMENT AND VALIDATION', description: 'Conduct regular network security assessments including penetration testing, vulnerability scanning, configuration reviews, and security architecture validation with external and internal testing capabilities. Implement continuous network security validation with automated testing tools and manual verification procedures. Deploy network security metrics with key performance indicators (KPIs) and security posture measurement.' }
        ]
      },
      'Network Infrastructure Management': {
        title: 'Network Infrastructure Management',
        description: 'network infrastructure security management covering architecture design, secure configuration, maintenance, monitoring, and specialized network environments including OT/IT integration',
        subRequirements: [
          { letter: 'a', title: 'NETWORK INFRASTRUCTURE MAINTENANCE', description: 'Ensure all network infrastructure components are kept up-to-date with current firmware, software patches, and security updates with documented maintenance schedules' },
          { letter: 'b', title: 'SECURE NETWORK ARCHITECTURE', description: 'Establish and maintain secure network architecture with network segmentation, defense-in-depth principles, and documented security zones and boundaries' },
          { letter: 'c', title: 'SECURE NETWORK MANAGEMENT', description: 'Implement secure management of network infrastructure using encrypted protocols, secure administrative access, and protected management interfaces' },
          { letter: 'd', title: 'NETWORK DOCUMENTATION', description: 'Establish and maintain network architecture diagrams, topology documentation, and configuration records with regular updates and change tracking' },
          { letter: 'e', title: 'CENTRALIZED NETWORK AAA', description: 'Implement centralized network authentication, authorization, and auditing (AAA) systems for all network device access with logging and monitoring' },
          { letter: 'f', title: 'SECURE COMMUNICATION PROTOCOLS', description: 'Use secure network management and communication protocols including 802.1X, WPA2/WPA3, encrypted management protocols, and secure wireless configurations' },
          { letter: 'g', title: 'VPN AND REMOTE ACCESS', description: 'Ensure remote devices utilize VPN connections and connect to enterprise AAA systems with strong encryption and access controls' },
          { letter: 'h', title: 'DEDICATED ADMINISTRATIVE RESOURCES', description: 'Establish and maintain dedicated computing resources for administrative work, either physically or logically separated from general user systems' },
          { letter: 'i', title: 'OT/IT NETWORK ISOLATION', description: 'Implement appropriate isolation between operational technology (OT) and information technology (IT) networks while maintaining necessary operational connectivity' },
          { letter: 'j', title: 'INDUSTRIAL CONTROL SYSTEM SECURITY', description: 'Secure industrial control systems (ICS) and supervisory control and data acquisition (SCADA) systems with appropriate access controls and monitoring' },
          { letter: 'k', title: 'DNS AND INTERNET INFRASTRUCTURE SECURITY', description: 'Implement security measures for DNS services, internet exchange points, and other internet infrastructure components under organizational control' },
          { letter: 'l', title: 'NETWORK CHANGE MANAGEMENT', description: 'Implement formal change management procedures for network infrastructure modifications with testing, approval, and rollback capabilities' },
          { letter: 'm', title: 'NETWORK CAPACITY MANAGEMENT', description: 'Monitor and manage network capacity, performance, and availability with proactive capacity planning and performance optimization' }
        ]
      },
      'Operational Technology Security': {
        title: 'Operational Technology Security',
        description: 'network infrastructure security management covering architecture design, secure configuration, maintenance, monitoring, and specialized network environments including OT/IT integration',
        subRequirements: [
          { letter: 'a', title: 'NETWORK INFRASTRUCTURE MAINTENANCE', description: 'Ensure all network infrastructure components are kept up-to-date with current firmware, software patches, and security updates with documented maintenance schedules' },
          { letter: 'b', title: 'SECURE NETWORK ARCHITECTURE', description: 'Establish and maintain secure network architecture with network segmentation, defense-in-depth principles, and documented security zones and boundaries' },
          { letter: 'c', title: 'SECURE NETWORK MANAGEMENT', description: 'Implement secure management of network infrastructure using encrypted protocols, secure administrative access, and protected management interfaces' },
          { letter: 'd', title: 'NETWORK DOCUMENTATION', description: 'Establish and maintain network architecture diagrams, topology documentation, and configuration records with regular updates and change tracking' },
          { letter: 'e', title: 'CENTRALIZED NETWORK AAA', description: 'Implement centralized network authentication, authorization, and auditing (AAA) systems for all network device access with logging and monitoring' },
          { letter: 'f', title: 'SECURE COMMUNICATION PROTOCOLS', description: 'Use secure network management and communication protocols including 802.1X, WPA2/WPA3, encrypted management protocols, and secure wireless configurations' },
          { letter: 'g', title: 'VPN AND REMOTE ACCESS', description: 'Ensure remote devices utilize VPN connections and connect to enterprise AAA systems with strong encryption and access controls' },
          { letter: 'h', title: 'DEDICATED ADMINISTRATIVE RESOURCES', description: 'Establish and maintain dedicated computing resources for administrative work, either physically or logically separated from general user systems' },
          { letter: 'i', title: 'OT/IT NETWORK ISOLATION', description: 'Implement appropriate isolation between operational technology (OT) and information technology (IT) networks while maintaining necessary operational connectivity' },
          { letter: 'j', title: 'INDUSTRIAL CONTROL SYSTEM SECURITY', description: 'Secure industrial control systems (ICS) and supervisory control and data acquisition (SCADA) systems with appropriate access controls and monitoring' },
          { letter: 'k', title: 'DNS AND INTERNET INFRASTRUCTURE SECURITY', description: 'Implement security measures for DNS services, internet exchange points, and other internet infrastructure components under organizational control' },
          { letter: 'l', title: 'NETWORK CHANGE MANAGEMENT', description: 'Implement formal change management procedures for network infrastructure modifications with testing, approval, and rollback capabilities' },
          { letter: 'm', title: 'NETWORK CAPACITY MANAGEMENT', description: 'Monitor and manage network capacity, performance, and availability with proactive capacity planning and performance optimization' }
        ]
      },
      'Audit Log Management': {
        title: 'Audit Log Management',
        description: 'audit log collection, management, and analysis framework with centralized monitoring, correlation, and compliance reporting capabilities',
        subRequirements: [
          { letter: 'a', title: 'AUDIT LOG COLLECTION', description: 'Implement audit log collection and management for all systems, applications, networks, and security devices with centralized logging infrastructure' },
          { letter: 'b', title: 'LOG MONITORING AND ANALYSIS', description: 'Establish continuous monitoring and analysis of audit logs with automated correlation, alerting, and anomaly detection capabilities' },
          { letter: 'c', title: 'LOG RETENTION AND ARCHIVAL', description: 'Implement appropriate log retention policies and secure archival procedures meeting regulatory requirements and business needs with long-term storage management' },
          { letter: 'd', title: 'LOG INTEGRITY PROTECTION', description: 'Ensure audit log integrity through cryptographic protection, access controls, and tamper-evident storage with digital signatures and hash verification' },
          { letter: 'e', title: 'CENTRALIZED LOG MANAGEMENT', description: 'Deploy centralized log management systems with log aggregation, normalization, and correlation across all enterprise assets and security tools' },
          { letter: 'f', title: 'SECURITY EVENT CORRELATION', description: 'Implement security event correlation and SIEM capabilities to identify security incidents, threats, and compliance violations through log analysis' },
          { letter: 'g', title: 'LOG ACCESS CONTROLS', description: 'Establish strict access controls for audit logs with role-based permissions, privileged access monitoring, and audit trail for log access activities' },
          { letter: 'h', title: 'COMPLIANCE REPORTING', description: 'Generate compliance reports and audit trails from log data to support regulatory requirements, internal audits, and security assessments' },
          { letter: 'i', title: 'LOG BACKUP AND RECOVERY', description: 'Implement secure backup and recovery procedures for audit logs with disaster recovery capabilities and business continuity planning' },
          { letter: 'j', title: 'REAL-TIME ALERTING', description: 'Configure real-time alerting for critical security events, policy violations, and suspicious activities detected in audit logs' },
          { letter: 'k', title: 'LOG STANDARDIZATION', description: 'Establish log format standardization and normalization procedures to ensure consistent log data across different systems and applications' },
          { letter: 'l', title: 'PERFORMANCE OPTIMIZATION', description: 'Optimize log management performance with efficient storage, indexing, search capabilities, and resource management for large-scale log processing' }
        ]
      },
      'Security Awareness & Skills Training': {
        title: 'Security Awareness & Skills Training',
        description: 'security awareness and training program covering all aspects of human factor security with role-specific training, behavioral change initiatives, and continuous education',
        subRequirements: [
          { letter: 'a', title: 'SECURITY AWARENESS PROGRAM', description: 'Establish and maintain security awareness program with regular training schedules, content updates, and effectiveness measurement across all organizational levels' },
          { letter: 'b', title: 'SOCIAL ENGINEERING TRAINING', description: 'Train all workforce members to recognize and respond to social engineering attacks including phishing, pretexting, tailgating, and other manipulation techniques' },
          { letter: 'c', title: 'AUTHENTICATION BEST PRACTICES', description: 'Provide training on authentication best practices including password management, multi-factor authentication, secure credential handling, and account security' },
          { letter: 'd', title: 'DATA HANDLING TRAINING', description: 'Train workforce members on data handling best practices including data classification, data protection, secure data transmission, and data lifecycle management' },
          { letter: 'e', title: 'UNINTENTIONAL DATA EXPOSURE PREVENTION', description: 'Educate users on causes and prevention of unintentional data exposure including data loss prevention, secure file sharing, and privacy protection measures' },
          { letter: 'f', title: 'SECURITY INCIDENT RECOGNITION', description: 'Train workforce members on recognizing and reporting security incidents with clear procedures, escalation paths, and incident classification guidelines' },
          { letter: 'g', title: 'SECURITY UPDATE AWARENESS', description: 'Train workforce on identifying and reporting missing security updates on enterprise assets with proper procedures for security maintenance and vulnerability reporting' },
          { letter: 'h', title: 'SECURE NETWORK USAGE', description: 'Educate workforce on dangers of connecting to and transmitting enterprise data over insecure networks with guidance on secure connectivity and data protection' },
          { letter: 'i', title: 'ROLE-SPECIFIC SECURITY TRAINING', description: 'Conduct specialized security awareness and skills training tailored to specific roles, responsibilities, and risk profiles within the organization' },
          { letter: 'j', title: 'CYBER HYGIENE PRACTICES', description: 'Implement basic cyber hygiene practices and cybersecurity training covering fundamental security behaviors, digital safety, and security-conscious culture development' },
          { letter: 'k', title: 'TRAINING EFFECTIVENESS MEASUREMENT', description: 'Establish metrics and assessment methods to measure training effectiveness, knowledge retention, and behavioral change through testing and simulation' },
          { letter: 'l', title: 'CONTINUOUS SECURITY EDUCATION', description: 'Provide ongoing security education and awareness activities including newsletters, briefings, alerts, and refresher training to maintain security consciousness' },
          { letter: 'm', title: 'SPECIALIZED PERSONNEL TRAINING', description: 'Ensure personnel with elevated access or security responsibilities receive appropriate specialized information security education and skills development' }
        ]
      },
      'Penetration Testing': {
        title: 'Penetration Testing',
        description: 'security testing framework including penetration tests, red team exercises, vulnerability assessments, and security validation with structured methodologies, qualified personnel, and continuous improvement processes',
        subRequirements: [
          { letter: 'a', title: 'COMPREHENSIVE PENETRATION TESTING PROGRAM', description: 'Establish regular penetration testing program conducted by qualified security professionals (certified in OSCP, GPEN, CEH, or equivalent) with structured methodologies (OWASP Testing Guide, NIST SP 800-115, PTES) covering network penetration testing, web application testing, wireless security testing, and social engineering assessment. Conduct penetration testing annually for standard systems and semi-annually for critical systems with additional testing after significant changes.' },
          { letter: 'b', title: 'RED TEAM EXERCISES AND ADVERSARIAL TESTING', description: 'Perform red team exercises simulating advanced persistent threats (APTs) and sophisticated attack scenarios to test detection capabilities, incident response procedures, and organizational security posture with multi-phase attack simulation including reconnaissance, initial access, persistence, privilege escalation, and data exfiltration. Conduct exercises quarterly with varying attack vectors and objectives.' },
          { letter: 'c', title: 'SECURITY CONTROL VALIDATION TESTING', description: 'Test security controls through authorized simulated attacks including firewall rule testing, intrusion detection system (IDS) effectiveness, access control validation, and security monitoring capability assessment with control-specific testing procedures and validation criteria. Implement continuous security validation with automated testing tools and manual validation procedures to ensure control effectiveness over time.' },
          { letter: 'd', title: 'SECURITY ARCHITECTURE TESTING', description: 'Validate security architecture through adversarial testing including network segmentation effectiveness, defense-in-depth validation, security boundary testing, and architectural weakness identification with threat modeling validation and attack path analysis. Test security architecture assumptions and validate security control integration with business process and technology architecture alignment.' },
          { letter: 'e', title: 'PENETRATION TEST DOCUMENTATION AND REMEDIATION', description: 'Document penetration testing findings including detailed vulnerability descriptions, exploit procedures, business impact assessment, and prioritized remediation recommendations with executive summaries and technical details. Implement remediation tracking with timeline requirements (critical: 30 days, high: 60 days, medium: 90 days) and validation testing to confirm effective remediation completion.' },
          { letter: 'f', title: 'TESTING COORDINATION AND OPERATIONAL INTEGRATION', description: 'Coordinate penetration testing activities with operational teams including advance notification, scope definition, safety procedures, and communication protocols to minimize business disruption while maintaining testing effectiveness. Establish testing approval processes with legal review, insurance notification, and business stakeholder coordination. Implement testing incident response procedures for unexpected issues.' },
          { letter: 'g', title: 'SECURITY POSTURE IMPROVEMENT', description: 'Use penetration testing results to systematically improve security posture including gap analysis, security control enhancement, process improvement, and training needs identification with metrics-driven improvement tracking. Implement testing trend analysis with year-over-year improvement measurement and benchmarking against industry standards and best practices.' },
          { letter: 'h', title: 'RISK-BASED TESTING SCHEDULES', description: 'Maintain penetration testing schedules based on risk assessment including asset criticality, threat landscape analysis, regulatory requirements, and business impact considerations with dynamic scheduling based on threat intelligence and security posture changes. Prioritize testing for high-risk systems, external-facing applications, and critical infrastructure components.' },
          { letter: 'i', title: 'SPECIALIZED SECURITY TESTING', description: 'Conduct specialized security testing including mobile application testing, Internet of Things (IoT) security assessment, cloud security testing, industrial control system (ICS) security evaluation, and supply chain security assessment with methodology-specific testing procedures and specialized tools. Deploy testing expertise for emerging technologies and evolving threat landscapes.' },
          { letter: 'j', title: 'AUTOMATED SECURITY TESTING INTEGRATION', description: 'Integrate automated security testing capabilities including vulnerability scanning integration, automated penetration testing tools, continuous security monitoring, and DevSecOps integration with CI/CD pipeline security testing. Implement automated testing validation with manual verification and false positive management to ensure testing accuracy and effectiveness.' },
          { letter: 'k', title: 'EXTERNAL TESTING VALIDATION', description: 'Validate internal security testing through external testing services including third-party penetration testing, bug bounty programs, security consulting assessments, and independent security audits with external testing comparison and validation. Implement external testing coordination with internal testing programs to maximize security testing coverage and effectiveness.' },
          { letter: 'l', title: 'COMPLIANCE AND REGULATORY TESTING', description: 'Ensure penetration testing meets regulatory and compliance requirements including industry-specific testing requirements (PCI DSS, HIPAA, SOX), regulatory penetration testing mandates, and audit requirements with compliance documentation and reporting. Maintain testing evidence for regulatory inspection and audit purposes with documentation and traceability to compliance requirements.' }
        ]
      },
      'Secure Software Development': {
        title: 'Secure Software Development',
        description: 'secure development lifecycle (SDLC) framework covering security integration from requirements through deployment with detailed processes, automated testing, and continuous security validation',
        subRequirements: [
          { letter: 'a', title: 'SECURE DEVELOPMENT LIFECYCLE INTEGRATION', description: 'Establish secure SDLC processes integrated into all development methodologies (Waterfall, Agile, DevOps) with security requirements definition, threat modeling, secure design reviews, and security acceptance criteria. Implement security gates at each SDLC phase with mandatory security sign-off before progression. Train development teams on secure coding practices with annual security training and competency validation.' },
          { letter: 'b', title: 'SECURE CODING STANDARDS AND PRACTICES', description: 'Implement secure coding standards covering input validation, output encoding, authentication, authorization, error handling, logging, and cryptographic implementation. Establish coding guidelines for each programming language and framework used. Deploy secure coding training programs with hands-on exercises and regular security code review training. Maintain secure code libraries and approved security functions.' },
          { letter: 'c', title: 'SECURITY CODE REVIEW PROCESSES', description: 'Conduct mandatory security-focused code reviews for all code changes using both automated static analysis and manual review processes. Establish security review criteria with specific focus on OWASP Top 10, common vulnerabilities, and business logic flaws. Train developers on security review techniques and maintain security-focused code review checklists. Implement peer review requirements with security champion involvement.' },
          { letter: 'd', title: 'AUTOMATED SECURITY TESTING INTEGRATION', description: 'Implement application security testing including Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), Interactive Application Security Testing (IAST), and Software Composition Analysis (SCA) integrated into CI/CD pipelines. Configure automated security testing to run on every code commit with build failure for critical security issues. Maintain security testing tool management with regular signature updates.' },
          { letter: 'e', title: 'SECURE DEPLOYMENT AND CONFIGURATION', description: 'Establish secure deployment processes including environment hardening, secure configuration management, secrets management, and deployment validation testing. Implement infrastructure-as-code with security configuration templates and automated compliance checking. Deploy container security scanning for containerized applications and implement secure orchestration platforms. Maintain deployment security checklists and validation procedures.' },
          { letter: 'f', title: 'DEPENDENCY AND THIRD-PARTY SECURITY', description: 'Implement third-party component security management including Software Bill of Materials (SBOM) generation, vulnerability scanning of dependencies, license compliance checking, and supply chain security validation. Establish approved component libraries with regular security assessments. Deploy automated dependency update processes with security patch prioritization. Maintain vendor security assessment procedures for commercial components.' },
          { letter: 'g', title: 'PENETRATION TESTING AND SECURITY VALIDATION', description: 'Conduct application penetration testing by qualified security professionals including black-box, white-box, and gray-box testing methodologies. Perform security validation testing throughout the development lifecycle with threat-based testing scenarios. Implement red team exercises for critical applications with attack simulation. Maintain penetration testing schedules based on application risk and criticality.' },
          { letter: 'h', title: 'APPLICATION SECURITY MONITORING', description: 'Implement runtime application security monitoring including application performance monitoring (APM) with security instrumentation, runtime application self-protection (RASP), and Web Application Firewalls (WAF) with custom rule development. Deploy security logging and monitoring for application security events with SIEM integration. Establish application security incident response procedures with automated threat detection.' },
          { letter: 'i', title: 'SECURITY REQUIREMENTS AND THREAT MODELING', description: 'Establish security requirements gathering processes including business security requirements, technical security controls, and compliance requirement integration. Conduct threat modeling exercises using structured methodologies (STRIDE, PASTA, LINDDUN) with threat landscape analysis and attack vector identification. Maintain security requirement traceability throughout the development lifecycle.' },
          { letter: 'j', title: 'SECURE ARCHITECTURE AND DESIGN', description: 'Implement secure architecture design processes including security architecture reviews, design pattern security validation, and architectural threat assessment. Establish security architecture principles including defense-in-depth, least privilege, fail-safe defaults, and complete mediation. Deploy reference security architectures for common application patterns with security control integration guidance.' },
          { letter: 'k', title: 'SECURITY TESTING AND QUALITY ASSURANCE', description: 'Establish security testing programs including unit security testing, integration security testing, and system security testing with automated and manual testing procedures. Implement security test case development with negative testing scenarios and boundary condition validation. Deploy security testing frameworks with test data management and security test environment controls.' },
          { letter: 'l', title: 'CONTINUOUS SECURITY IMPROVEMENT', description: 'Implement continuous security improvement processes including security metrics collection, vulnerability trend analysis, security debt management, and security practice maturity assessment. Establish security champion programs with developer security training and mentoring. Deploy security feedback loops with post-incident security enhancement and lessons learned integration.' }
        ]
      },
      'Supplier & Third-Party Risk Management': {
        title: 'Supplier & Third-Party Risk Management',
        description: 'supplier and third-party risk management framework covering vendor lifecycle management, cloud services, supply chain security, and continuous monitoring with detailed processes for enterprise vendor governance',
        subRequirements: [
          { letter: 'a', title: 'SUPPLIER RISK ASSESSMENT FRAMEWORK', description: 'Establish supplier risk assessment processes including initial vendor security assessments, financial stability evaluation, business continuity planning review, and regulatory compliance verification. Implement risk-based vendor categorization (Critical, Important, Standard) with assessment frequency and depth based on risk level. Conduct annual risk reassessments with quarterly reviews for critical suppliers. Maintain vendor risk register with risk ratings and mitigation strategies.' },
          { letter: 'b', title: 'THIRD-PARTY SECURITY CONTRACTS', description: 'Develop third-party security requirements and contractual obligations including security standards compliance, incident notification procedures, audit rights and inspection capabilities, data protection and privacy requirements, and service level agreements with security metrics. Establish mandatory security clauses including right-to-audit, security certification requirements, and breach notification obligations with appropriate timelines.' },
          { letter: 'c', title: 'VENDOR SECURITY ASSESSMENT PROGRAM', description: 'Conduct thorough vendor security assessments including security questionnaire completion, security certification validation (ISO 27001, SOC 2, etc.), penetration testing results review, and on-site security audits for critical suppliers. Implement standardized assessment criteria with scoring methodologies and acceptance thresholds. Maintain vendor assessment documentation with annual updates and exception management processes.' },
          { letter: 'd', title: 'CLOUD SERVICE PROVIDER GOVERNANCE', description: 'Establish specialized security requirements for cloud service providers including data location controls, encryption standards, access management, compliance certifications, and shared responsibility model documentation. Implement cloud security assessment frameworks (CAIQ, FedRAMP) with continuous monitoring and compliance validation. Establish multi-cloud governance with consistent security standards across all cloud providers.' },
          { letter: 'e', title: 'SUPPLY CHAIN SECURITY CONTROLS', description: 'Implement supply chain security measures including supplier background checks, software supply chain validation, hardware authenticity verification, and intellectual property protection. Establish supply chain risk monitoring with geopolitical risk assessment and alternative supplier identification. Deploy supply chain security standards aligned with NIST 800-161 and ISO 28000 frameworks.' },
          { letter: 'f', title: 'CONTINUOUS THIRD-PARTY MONITORING', description: 'Deploy continuous monitoring of third-party security compliance including automated security posture monitoring, threat intelligence integration, breach notification tracking, and performance metric monitoring. Implement vendor security scorecard programs with real-time risk ratings and trend analysis. Establish automated alerting for vendor security incidents and compliance violations with immediate risk assessment procedures.' },
          { letter: 'g', title: 'DATA SHARING GOVERNANCE', description: 'Establish data sharing agreements and controls including data classification requirements, data protection standards, cross-border transfer controls, and data retention and disposal procedures. Implement data sharing monitoring with data flow mapping, access controls, and usage tracking. Deploy data loss prevention (DLP) controls for third-party data sharing with encryption and access management requirements.' },
          { letter: 'h', title: 'THIRD-PARTY ACCESS MANAGEMENT', description: 'Manage third-party access and privileged accounts including dedicated third-party access procedures, privileged access management (PAM) for vendor accounts, multi-factor authentication requirements, and session monitoring and recording. Implement just-in-time access provisioning with approval workflows and time-limited access grants. Establish third-party access review and certification processes with quarterly access validation.' },
          { letter: 'i', title: 'VENDOR LIFECYCLE MANAGEMENT', description: 'Manage complete vendor lifecycle including vendor onboarding with security validation, ongoing relationship management with performance monitoring, contract renewal with security requirement updates, and secure vendor off-boarding with data return and access revocation. Establish vendor performance metrics with security KPIs and service level monitoring. Maintain vendor relationship documentation with security compliance tracking.' },
          { letter: 'j', title: 'INCIDENT RESPONSE COORDINATION', description: 'Establish third-party incident response coordination including joint incident response procedures, communication protocols, escalation procedures, and evidence preservation requirements. Implement vendor security incident notification requirements with specific timeframes (4 hours for critical incidents) and detailed reporting obligations. Deploy coordinated incident response exercises with key vendors including tabletop exercises and technical response drills.' },
          { letter: 'k', title: 'REGULATORY COMPLIANCE MANAGEMENT', description: 'Ensure third-party regulatory compliance including GDPR data processor agreements, industry-specific compliance requirements (HIPAA, PCI DSS, etc.), and jurisdiction-specific regulations. Implement compliance monitoring with regular compliance attestations and certification validation. Establish regulatory change management with vendor notification and compliance update procedures.' },
          { letter: 'l', title: 'VENDOR SECURITY PERFORMANCE METRICS', description: 'Establish vendor security performance metrics including security incident frequency, response times, compliance scores, and security control effectiveness. Deploy vendor security dashboard with real-time monitoring and trend analysis. Implement vendor security benchmarking with industry comparisons and best practice identification. Maintain vendor security performance reporting with executive summaries and action plans.' }
        ]
      },
      'Incident Response Management': {
        title: 'Incident Response Management',
        description: 'incident response framework covering detection, analysis, containment, eradication, recovery, and post-incident activities with regulatory compliance, timely notifications, and continuous improvement processes',
        subRequirements: [
          { letter: 'a', title: 'INCIDENT RESPONSE TEAM AND PROCEDURES', description: 'Establish incident response team structure including incident response manager, technical analysts, communications coordinator, and legal counsel with clearly defined roles, responsibilities, and authority levels. Develop detailed incident response procedures covering incident classification, escalation procedures, decision-making authority, and 24/7 response capabilities. Maintain current contact information with backup personnel and automated notification systems.' },
          { letter: 'b', title: 'INCIDENT DETECTION AND MONITORING', description: 'Implement incident detection capabilities including Security Information and Event Management (SIEM) systems, intrusion detection systems (IDS), endpoint detection and response (EDR), and threat intelligence integration. Deploy continuous monitoring with real-time alerting, automated threat detection, and correlation analysis. Establish multiple detection channels including technical monitoring, user reports, and third-party notifications with centralized incident intake.' },
          { letter: 'c', title: 'INCIDENT CLASSIFICATION AND PRIORITIZATION', description: 'Establish incident classification system including severity levels (Critical, High, Medium, Low) with specific criteria, impact assessment procedures, and response time requirements. Define incident categories covering security incidents, data breaches, system outages, and operational disruptions. Implement priority assignment based on business impact, regulatory requirements, and recovery urgency with automated escalation procedures.' },
          { letter: 'd', title: 'INCIDENT CONTAINMENT AND ERADICATION', description: 'Develop systematic incident containment procedures including network isolation, system shutdown, account disabling, and evidence preservation with immediate containment (within 1 hour for critical incidents) and eradication strategies. Implement containment decision trees with technical procedures and business impact assessment. Deploy automated containment capabilities where appropriate with manual override controls.' },
          { letter: 'e', title: 'INCIDENT RECOVERY AND RESTORATION', description: 'Establish recovery procedures including system restoration from clean backups, configuration validation, security testing, and gradual service restoration with recovery validation and monitoring. Implement recovery prioritization based on business criticality with phased restoration approach. Deploy recovery testing procedures with rollback capabilities and business continuity integration.' },
          { letter: 'f', title: 'INCIDENT DOCUMENTATION AND REPORTING', description: 'Maintain incident documentation including incident timeline, actions taken, evidence collected, and decisions made with detailed incident reports and regulatory notifications. Implement automated documentation tools with workflow management and evidence chain of custody procedures. Establish incident reporting formats for different audiences including executive summaries, technical reports, and regulatory submissions.' },
          { letter: 'g', title: 'INCIDENT RESPONSE TRAINING AND EXERCISES', description: 'Conduct regular incident response training including tabletop exercises, technical drills, and full-scale response simulations with scenario-based training covering various incident types and coordination with external parties. Implement training effectiveness measurement with competency assessment and skills validation. Conduct surprise exercises and cross-functional training with business units.' },
          { letter: 'h', title: 'EXTERNAL COORDINATION AND COMMUNICATION', description: 'Establish external coordination procedures including law enforcement liaison, regulatory authority notification (GDPR: 72-hour breach notification), threat intelligence sharing, and vendor coordination during incidents. Implement communication protocols with predefined messaging, spokesperson designation, and stakeholder management. Deploy secure communication channels for sensitive incident information.' },
          { letter: 'i', title: 'DIGITAL FORENSICS AND EVIDENCE HANDLING', description: 'Implement digital forensics capabilities including evidence identification, preservation, collection, and analysis with forensically sound procedures and chain of custody maintenance. Deploy forensic tools and techniques with trained forensic analysts or external forensic service contracts. Establish evidence handling procedures with legal admissibility requirements and data retention policies.' },
          { letter: 'j', title: 'INCIDENT RESPONSE METRICS AND IMPROVEMENT', description: 'Establish incident response metrics including mean time to detection (MTTD), mean time to containment (MTTC), mean time to recovery (MTTR), and incident recurrence rates with performance dashboards and trend analysis. Implement continuous improvement processes with post-incident reviews, lessons learned documentation, and procedure updates. Deploy maturity assessment frameworks with benchmarking against industry standards.' },
          { letter: 'k', title: 'REGULATORY INCIDENT RESPONSE', description: 'Ensure regulatory compliance for incident response including breach notification requirements, regulatory reporting procedures, and compliance documentation maintenance with specific timeframes and content requirements. Implement regulatory liaison procedures with authority communication and coordination. Establish compliance monitoring with audit trails for regulatory inspections.' },
          { letter: 'l', title: 'CRISIS MANAGEMENT INTEGRATION', description: 'Integrate incident response with organizational crisis management including crisis team activation, business continuity coordination, and executive communication with decision-making procedures for business-critical incidents. Implement crisis communication procedures with media management and stakeholder communication. Deploy crisis management exercises with incident response coordination testing.' }
        ]
      },
      'Business Continuity & Disaster Recovery Management': {
        title: 'Business Continuity & Disaster Recovery Management',
        description: 'business continuity and disaster recovery framework covering disruption management, recovery capabilities, crisis management, and operational resilience with detailed procedures and testing requirements',
        subRequirements: [
          { letter: 'a', title: 'BUSINESS CONTINUITY PLANNING FRAMEWORK', description: 'Establish business continuity planning and management framework aligned with ISO 22301 including business continuity policy development, governance structure definition, and business continuity management system (BCMS) implementation. Define business continuity objectives with Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for all critical business processes. Implement business continuity lifecycle management with annual plan reviews and updates.' },
          { letter: 'b', title: 'COMPREHENSIVE BUSINESS IMPACT ANALYSIS', description: 'Conduct detailed business impact analysis (BIA) covering all business processes, systems, and dependencies including impact assessment over time (1 hour, 4 hours, 24 hours, 72 hours, 1 week), resource requirement identification, minimum staffing levels, and critical supplier dependencies. Quantify financial impacts including revenue loss, increased costs, regulatory fines, and reputation damage. Update BIA annually or when significant business changes occur.' },
          { letter: 'c', title: 'DISASTER RECOVERY PROCEDURES', description: 'Develop disaster recovery procedures covering IT systems recovery, data restoration, communications recovery, and facility recovery with detailed step-by-step recovery procedures, recovery team roles and responsibilities, and recovery resource requirements. Establish primary and alternate recovery sites with appropriate technology and infrastructure. Implement recovery procedure documentation with regular updates and version control.' },
          { letter: 'd', title: 'DATA BACKUP AND RECOVERY SYSTEMS', description: 'Implement data backup and recovery processes including automated backup systems with 3-2-1 backup strategy (3 copies, 2 different media types, 1 offsite), backup integrity verification with regular restore testing, and encrypted backup storage with secure key management. Establish backup schedules based on data criticality and RPO requirements. Deploy backup monitoring with automated failure alerting and recovery time validation.' },
          { letter: 'e', title: 'ALTERNATIVE PROCESSING FACILITIES', description: 'Establish alternative processing facilities including hot sites, warm sites, or cold sites based on RTO requirements with appropriate technology infrastructure, communications capabilities, and workspace facilities. Implement facility agreements with detailed service levels and activation procedures. Conduct regular facility readiness assessments with infrastructure testing and capability validation. Maintain facility access procedures with security controls and staff notification.' },
          { letter: 'f', title: 'BUSINESS CONTINUITY TESTING PROGRAM', description: 'Conduct business continuity testing including desktop exercises, functional exercises, and full-scale exercises with annual testing schedules and scenario-based testing covering multiple threat types. Implement testing documentation with test objectives, success criteria, and lessons learned capture. Establish test evaluation procedures with gap analysis and improvement planning. Conduct surprise tests and cross-training exercises.' },
          { letter: 'g', title: 'BUSINESS CONTINUITY DOCUMENTATION MANAGEMENT', description: 'Maintain business continuity documentation including business continuity plans, emergency contact lists, recovery procedures, and resource inventories with document version control and regular updates. Implement document distribution with secure access and offline availability. Establish documentation review procedures with annual validation and update cycles. Maintain plan accessibility during crisis situations.' },
          { letter: 'h', title: 'PERSONNEL TRAINING AND AWARENESS', description: 'Train all personnel on business continuity procedures with role-specific training for business continuity team members, general awareness training for all employees, and emergency response procedures training with evacuation and safety protocols. Implement training effectiveness measurement with competency assessment and skills validation. Conduct regular training updates and refresher sessions with new employee orientation.' },
          { letter: 'i', title: 'CRISIS COMMUNICATION MANAGEMENT', description: 'Establish crisis communication procedures including internal communication protocols with employee notification systems, external communication management with customer and stakeholder messaging, media relations procedures with spokesperson designation, and regulatory notification requirements with compliance reporting timelines. Implement communication testing with message delivery validation and feedback mechanisms.' },
          { letter: 'j', title: 'SUPPLY CHAIN CONTINUITY PLANNING', description: 'Develop supply chain continuity strategies including critical supplier identification and alternative supplier arrangements, supplier business continuity assessment and monitoring, and supply chain risk management with geographic diversification and contract provisions for business continuity. Establish supplier communication protocols during disruptions with coordination procedures and mutual aid agreements.' },
          { letter: 'k', title: 'TECHNOLOGY RECOVERY AND RESILIENCE', description: 'Implement technology recovery capabilities including system redundancy and failover mechanisms, cloud-based recovery solutions with geographic distribution, and network resilience with multiple connectivity options. Deploy monitoring systems for early warning and rapid response with automated failover capabilities where appropriate. Establish technology recovery procedures with priority-based system restoration sequences.' },
          { letter: 'l', title: 'REGULATORY COMPLIANCE AND REPORTING', description: 'Ensure business continuity compliance with regulatory requirements including applicable industry continuity requirements, regulatory notification and reporting procedures during disruptions, and compliance documentation maintenance with audit trails. Establish regulatory liaison procedures with authority communication and coordination during crisis situations.' }
        ]
      },
    };

    // Add common category name variations to prevent mismatches
    const categoryAliases: Record<string, string> = {
      // Identity variations
      'Identity and Access Management Controls': 'Identity & Access Management',
      'Identity and Access Management': 'Identity & Access Management',
      
      // Physical security variations  
      'Physical and Environmental Security': 'Physical & Environmental Security Controls',
      
      // Business continuity variations
      'Information Security Aspects of Business Continuity Management': 'Business Continuity & Disaster Recovery Management',
      'Business Continuity Management': 'Business Continuity & Disaster Recovery Management',
      
      // Incident response variations
      'Information Security Incident Management': 'Incident Response Management',
      'Incident Management': 'Incident Response Management',
      
      // Supplier variations
      'Supplier Relationships': 'Supplier & Third-Party Risk Management',
      'Third-Party Risk Management': 'Supplier & Third-Party Risk Management',
      
      // System development variations
      'System Acquisition Development & Maintenance': 'Secure Software Development',
      'System Acquisition, Development & Maintenance': 'Secure Software Development',
      
      // GDPR variations
      'GDPR Unified Compliance': 'GDPR Data Protection',
      'GDPR Compliance': 'GDPR Data Protection'
    };

    // Check for aliases first
    const aliasedName = categoryAliases[cleanName];
    const template = templates[aliasedName || cleanName];
    console.log('[TEMPLATE DEBUG] Template lookup result:', {
      cleanName: cleanName,
      found: !!template,
      availableTemplates: Object.keys(templates)
    });
    
    // Return only templates that exist - no generic fallback
    return template || null;
  }
  
  /**
   * Build clean framework references string
   */
  private static buildFrameworkReferences(requirements: FrameworkRequirement[]): string {
    const refs = new Map<string, string[]>();
    
    // Group by framework
    requirements.forEach(req => {
      if (!refs.has(req.framework)) {
        refs.set(req.framework, []);
      }
      refs.get(req.framework)!.push(req.code);
    });
    
    // Format as clean string
    const refStrings: string[] = [];
    refs.forEach((codes, framework) => {
      refStrings.push(`${framework}: ${codes.join(', ')}`);
    });
    
    return refStrings.join(' | ');
  }
  
  /**
   * Format clean content string for the category
   */
  private static formatCleanContent(template: any, subRequirements: any[]): string {
    let content = '';
    
    subRequirements.forEach(subReq => {
      content += `## ${subReq.letter}) ${subReq.title}\n\n`;
      content += `${subReq.description}\n\n`;
      
      if (subReq.requirements.length > 0) {
        content += `**Requirements:**\n`;
        subReq.requirements.forEach((req: string) => {
          content += `- ${req}\n`;
        });
        content += '\n';
        
        if (subReq.frameworkReferences) {
          content += `**Framework References:** ${subReq.frameworkReferences}\n\n`;
        }
      } else {
        // Show placeholder text when no framework requirements are mapped
        content += `*No specific framework requirements mapped to this sub-requirement.*\n\n`;
      }
    });
    
    return content;
  }
  
  /**
   * Generate unified requirements for multiple categories
   */
  static async generateForCategories(
    categories: string[],
    frameworkRequirementsByCategory: Record<string, FrameworkRequirement[]>
  ): Promise<CleanUnifiedRequirement[]> {
    
    const results: CleanUnifiedRequirement[] = [];
    
    for (const category of categories) {
      const requirements = frameworkRequirementsByCategory[category] || [];
      const generated = await this.generateForCategory(category, requirements);
      
      if (generated) {
        results.push(generated);
      }
    }
    
    return results;
  }
}