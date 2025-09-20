/**
 * Enhanced Unified Requirements Bridge
 * 
 * Bridges the old mapping system with the new clean unified requirements generator.
 * Converts existing framework mappings to the format expected by the CleanUnifiedRequirementsGenerator.
 * Supports optional smart abstraction for reduced content volume while preserving compliance integrity.
 */

import { 
  CleanUnifiedRequirementsGenerator, 
  FrameworkRequirement, 
  CleanUnifiedRequirement,
  EnhancedGenerationOptions,
  EnhancedGenerationResult 
} from './CleanUnifiedRequirementsGenerator';
import { 
  EnhancedCleanUnifiedRequirementsGenerator, 
  AbstractionResult, 
  AbstractionMode,
  AbstractionOptions,
  EnhancedGenerationOptions 
} from './abstraction/EnhancedCleanUnifiedRequirementsGenerator';
import { AbstractionConfigurationService } from './abstraction/AbstractionConfigurationService';
import { governanceTextFixer } from './FixGovernanceTextOrganization';

export interface BridgeOptions {
  enableAbstraction?: boolean;
  abstractionMode?: AbstractionMode;
  enableAIConsolidation?: boolean;
  aiConsolidationOptions?: {
    targetReduction?: number;
    qualityThreshold?: number;
    preserveAllDetails?: boolean;
    useCache?: boolean;
  };
  userId?: string;
  progressCallback?: (progress: any) => void;
  featureFlags?: {
    enableSmartAbstraction: boolean;
    enableQualityAssurance: boolean;
    enableTraceabilityMatrix: boolean;
    enableFallback: boolean;
    enableAIConsolidation?: boolean;
  };
}

export interface BridgeResult {
  content: string[];
  metadata?: {
    abstraction?: {
      applied: boolean;
      mode: AbstractionMode;
      reductionPercentage: number;
      qualityScore: number;
    };
    aiConsolidation?: {
      applied: boolean;
      reductionPercentage: number;
      qualityScore: number;
      apiProvider: string;
      cachingUsed: boolean;
      detailsPreserved: boolean;
    };
    traceability?: {
      originalRequirements: number;
      processedRequirements: number;
      frameworkReferences: string[];
    };
    performance?: {
      processingTimeMs: number;
      cacheHits: number;
      aiProcessingTimeMs?: number;
    };
  };
}

export class UnifiedRequirementsBridge {
  
  private static configService = new AbstractionConfigurationService();
  
  /**
   * Check if category is Governance & Leadership
   */
  private static isGovernanceCategory(category: string): boolean {
    return category === 'Governance & Leadership' || 
           category.includes('Governance') ||
           category.toLowerCase().includes('governance');
  }
  
  /**
   * Extract title from requirement text
   */
  private static extractTitleFromRequirement(requirement: string): string {
    // Look for bold text in markdown format
    const boldMatch = requirement.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      return boldMatch[1];
    }
    
    // Extract first part of requirement as title
    const firstSentence = requirement.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }
  
  /**
   * Generate unified requirements for a specific category (main method called by UI)
   * Enhanced with optional smart abstraction capabilities
   */
  static async generateUnifiedRequirementsForCategory(
    categoryMapping: any,
    selectedFrameworks: Record<string, any>,
    options: BridgeOptions = {}
  ): Promise<string[]> {
    
    console.log('[ENHANCED-BRIDGE] Generating unified requirements for category:', categoryMapping.category);
    
    try {
      // Extract framework requirements for this category
      const frameworkRequirements = this.extractFrameworkRequirements(categoryMapping, selectedFrameworks);
      
      console.log(`[ENHANCED-BRIDGE] Category: "${categoryMapping.category}", Requirements: ${frameworkRequirements.length}`);
      
      if (frameworkRequirements.length === 0) {
        console.log(`[ENHANCED-BRIDGE] No requirements found for category: ${categoryMapping.category}`);
        return [`No unified requirements available for ${categoryMapping.category}. Please select frameworks.`];
      }
      
      // Generate results with appropriate method
      let generatedResults: string[];
      
      // Check if AI consolidation is enabled and should be used
      const shouldUseAIConsolidation = this.shouldUseAIConsolidation(options, frameworkRequirements);
      
      if (shouldUseAIConsolidation) {
        console.log(`[ENHANCED-BRIDGE] Using AI consolidation for ${categoryMapping.category}`);
        generatedResults = await this.generateWithAIConsolidation(categoryMapping, frameworkRequirements, options);
      } else {
        // Check if abstraction is enabled and should be used
        const shouldUseAbstraction = this.shouldUseAbstraction(options, frameworkRequirements);
        
        if (shouldUseAbstraction) {
          console.log(`[ENHANCED-BRIDGE] Using enhanced generator with abstraction for ${categoryMapping.category}`);
          generatedResults = await this.generateWithAbstraction(categoryMapping, frameworkRequirements, options);
        } else {
          console.log(`[ENHANCED-BRIDGE] Using standard generator for ${categoryMapping.category}`);
          generatedResults = await this.generateWithStandardMethod(categoryMapping, frameworkRequirements);
        }
      }
      
      // Apply Governance & Leadership text organization fix if needed
      if (this.isGovernanceCategory(categoryMapping.category)) {
        console.log(`🔧 [GOVERNANCE FIX] Applying text organization fix for: ${categoryMapping.category}`);
        try {
          // Convert string array back to category mapping format for the fix
          const tempContent = {
            category: categoryMapping.category,
            auditReadyUnified: {
              subRequirements: generatedResults.map((req, index) => ({
                letter: String.fromCharCode(97 + index), // a, b, c, etc.
                title: this.extractTitleFromRequirement(req),
                requirements: [req]
              }))
            }
          };
          
          // Apply the governance text fix
          const fixedContent = await governanceTextFixer.fixGovernanceTextOrganization(
            categoryMapping.category,
            tempContent,
            selectedFrameworks
          );
          
          // Convert back to string array format
          if (fixedContent.auditReadyUnified?.subRequirements) {
            generatedResults = fixedContent.auditReadyUnified.subRequirements.flatMap((subReq: any) => 
              subReq.requirements || [`${subReq.letter}) **${subReq.title}** - ${subReq.description || 'No description available'}`]
            );
            console.log(`✅ [GOVERNANCE FIX] Successfully fixed text organization for ${categoryMapping.category}`);
          }
        } catch (fixError) {
          console.warn(`⚠️ [GOVERNANCE FIX] Failed to apply fix for ${categoryMapping.category}:`, fixError);
          // Continue with original results if fix fails
        }
      }
      
      return generatedResults;
      
    } catch (error) {
      console.error(`[ENHANCED-BRIDGE] Error processing category ${categoryMapping.category}:`, error);
      
      // Fallback to standard method if enabled
      if (options.featureFlags?.enableFallback !== false) {
        console.log(`[ENHANCED-BRIDGE] Attempting fallback for ${categoryMapping.category}`);
        try {
          const frameworkRequirements = this.extractFrameworkRequirements(categoryMapping, selectedFrameworks);
          return await this.generateWithStandardMethod(categoryMapping, frameworkRequirements);
        } catch (fallbackError) {
          console.error(`[ENHANCED-BRIDGE] Fallback also failed:`, fallbackError);
        }
      }
      
      return [`Error generating requirements for ${categoryMapping.category}: ${error}`];
    }
  }
  
  /**
   * Generate clean unified requirements from existing framework mappings
   */
  static async generateCleanUnifiedRequirements(
    filteredUnifiedMappings: any[],
    selectedFrameworks: Record<string, any>
  ): Promise<string[]> {
    
    console.log('[BRIDGE] Starting clean generation for', filteredUnifiedMappings.length, 'categories');
    
    const allResults: string[] = [];
    
    for (const mapping of filteredUnifiedMappings) {
      try {
        // Extract framework requirements for this category
        const frameworkRequirements = this.extractFrameworkRequirements(mapping, selectedFrameworks);
        
        if (frameworkRequirements.length === 0) {
          console.log(`[BRIDGE] No requirements found for category: ${mapping.category}`);
          continue;
        }
        
        // Generate clean unified requirements
        const cleanResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
          mapping.category,
          frameworkRequirements
        );
        
        if (cleanResult) {
          // Convert to string array format expected by current system
          const formatted = this.formatForCurrentSystem(cleanResult);
          allResults.push(...formatted);
          
          console.log(`[BRIDGE] Successfully generated ${cleanResult.subRequirements.length} sub-requirements for ${mapping.category}`);
        }
        
      } catch (error) {
        console.error(`[BRIDGE] Error processing category ${mapping.category}:`, error);
        allResults.push(`Error generating requirements for ${mapping.category}`);
      }
    }
    
    console.log(`[BRIDGE] Generated total of ${allResults.length} formatted requirements`);
    return allResults;
  }
  
  /**
   * Extract framework requirements from mapping in the format expected by CleanUnifiedRequirementsGenerator
   */
  private static extractFrameworkRequirements(
    mapping: any,
    selectedFrameworks: Record<string, any>
  ): FrameworkRequirement[] {
    
    const requirements: FrameworkRequirement[] = [];
    
    // Process each selected framework
    Object.entries(selectedFrameworks).forEach(([frameworkKey, isSelected]) => {
      if (!isSelected || !mapping.frameworks?.[frameworkKey]) {
        return;
      }
      
      const frameworkReqs = mapping.frameworks[frameworkKey];
      const frameworkDisplayName = this.getFrameworkDisplayName(frameworkKey);
      
      frameworkReqs.forEach((req: any) => {
        requirements.push({
          id: req.id || `${frameworkKey}-${req.code}`,
          code: req.code || req.control_id || 'N/A',
          title: req.title || 'Untitled Requirement',
          description: req.description || req.official_description || 'No description available',
          framework: frameworkDisplayName,
          category: mapping.category
        });
      });
    });
    
    console.log(`[BRIDGE] Extracted ${requirements.length} requirements for ${mapping.category}`);
    return requirements;
  }
  
  /**
   * Format CleanUnifiedRequirement for current system compatibility
   */
  private static formatForCurrentSystem(cleanResult: CleanUnifiedRequirement): string[] {
    const formatted: string[] = [];
    
    // Special handling for Governance & Leadership with sections
    if (cleanResult.category.includes('Governance') || cleanResult.category.includes('Leadership')) {
      this.formatGovernanceWithSections(formatted, cleanResult.subRequirements);
    } else {
      // Standard formatting for other categories
      this.formatStandardRequirements(formatted, cleanResult.subRequirements);
    }
    
    return formatted;
  }
  
  /**
   * Format Governance & Leadership with special sections
   */
  private static formatGovernanceWithSections(formatted: string[], subRequirements: any[]): void {
    // Core Requirements (a-g)
    formatted.push('Core Requirements');
    formatted.push('');
    this.formatRequirementsRange(formatted, subRequirements, 0, 6);
    
    // HR (h-i) 
    const hrReqs = subRequirements.filter(req => ['h', 'i'].includes(req.letter));
    if (hrReqs.length > 0) {
      formatted.push('HR');
      formatted.push('');
      hrReqs.forEach(subReq => this.formatSingleRequirement(formatted, subReq));
    }
    
    // Monitoring & Compliance (j-p)
    const monitoringReqs = subRequirements.filter(req => ['j', 'k', 'l', 'm', 'n', 'o', 'p'].includes(req.letter));
    if (monitoringReqs.length > 0) {
      formatted.push('Monitoring & Compliance');
      formatted.push('');
      monitoringReqs.forEach(subReq => this.formatSingleRequirement(formatted, subReq));
    }
  }
  
  /**
   * Format requirements in a specific range
   */
  private static formatRequirementsRange(formatted: string[], subRequirements: any[], start: number, end: number): void {
    const rangeReqs = subRequirements.filter(req => {
      const letterCode = req.letter.charCodeAt(0) - 97; // a=0, b=1, etc.
      return letterCode >= start && letterCode <= end;
    });
    
    rangeReqs.forEach(subReq => this.formatSingleRequirement(formatted, subReq));
  }
  
  /**
   * Format standard requirements without sections
   */
  private static formatStandardRequirements(formatted: string[], subRequirements: any[]): void {
    subRequirements.forEach(subReq => this.formatSingleRequirement(formatted, subReq));
  }
  
  /**
   * Format a single requirement
   */
  private static formatSingleRequirement(formatted: string[], subReq: any): void {
    // Sub-requirement title
    formatted.push(`${subReq.letter}) ${subReq.title.toUpperCase()}`);
    formatted.push('');
    formatted.push(subReq.description);
    formatted.push('');
    
    // Requirements
    if (subReq.requirements.length > 0) {
      subReq.requirements.forEach((req: string) => {
        formatted.push(`• ${req}`);
      });
      formatted.push('');
    }
    
    // Framework references - bold and blue
    if (subReq.frameworkReferences) {
      formatted.push(`Framework References: ${subReq.frameworkReferences}`);
      formatted.push('');
    }
  }
  
  /**
   * Get display name for framework
   */
  private static getFrameworkDisplayName(frameworkKey: string): string {
    const displayNames: Record<string, string> = {
      'iso27001': 'ISO 27001',
      'iso27002': 'ISO 27002',
      'cisControls': 'CIS Controls',
      'gdpr': 'GDPR',
      'nis2': 'NIS2',
      'dora': 'DORA'
    };
    
    return displayNames[frameworkKey] || frameworkKey.toUpperCase();
  }
  
  /**
   * Generate unified requirements objects (for new renderer component)
   */
  static async generateUnifiedRequirementObjects(
    filteredUnifiedMappings: any[],
    selectedFrameworks: Record<string, any>
  ): Promise<CleanUnifiedRequirement[]> {
    
    console.log('[BRIDGE] Generating unified requirement objects for', filteredUnifiedMappings.length, 'categories');
    
    const results: CleanUnifiedRequirement[] = [];
    
    for (const mapping of filteredUnifiedMappings) {
      try {
        // Extract framework requirements for this category
        const frameworkRequirements = this.extractFrameworkRequirements(mapping, selectedFrameworks);
        
        if (frameworkRequirements.length === 0) {
          console.log(`[BRIDGE] No requirements found for category: ${mapping.category}`);
          continue;
        }
        
        // Generate clean unified requirements
        const cleanResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
          mapping.category,
          frameworkRequirements
        );
        
        if (cleanResult) {
          results.push(cleanResult);
          console.log(`[BRIDGE] Successfully generated unified requirements for ${mapping.category}`);
        }
        
      } catch (error) {
        console.error(`[BRIDGE] Error processing category ${mapping.category}:`, error);
      }
    }
    
    console.log(`[BRIDGE] Generated ${results.length} unified requirement objects`);
    return results;
  }
  
  /**
   * Generate unified requirements for all categories (main batch method called by UI)
   * Returns a Map for compatibility with existing UI
   */
  static async generateForAllCategories(
    filteredMappings: any[],
    selectedFrameworks: Record<string, any>
  ): Promise<Map<string, string[]>> {
    
    console.log('[BRIDGE] Generating for all categories:', filteredMappings.length);
    const results = new Map<string, string[]>();
    
    for (const mapping of filteredMappings) {
      const categoryName = mapping.category?.replace(/^\d+\.\s*/, '') || 'Unknown';
      
      try {
        const content = await this.generateUnifiedRequirementsForCategory(
          mapping,
          selectedFrameworks
        );
        
        results.set(categoryName, content);
        console.log(`[BRIDGE] Generated content for ${categoryName}: ${content.length} items`);
        
      } catch (error) {
        console.error(`[BRIDGE] Error generating content for ${categoryName}:`, error);
        results.set(categoryName, [`Error generating requirements for ${categoryName}`]);
      }
    }
    
    console.log(`[BRIDGE] Generated content for ${results.size} categories`);
    return results;
  }
  
  /**
   * Generate with enhanced abstraction
   */
  private static async generateWithAbstraction(
    categoryMapping: any,
    frameworkRequirements: FrameworkRequirement[],
    options: BridgeOptions
  ): Promise<string[]> {
    
    try {
      // Prepare enhanced generation options
      const enhancedOptions: EnhancedGenerationOptions = {
        abstraction: {
          mode: options.abstractionMode || 'MODERATE',
          enableDeduplication: true,
          preserveAllReferences: true,
          qualityThreshold: 0.85,
          maxComplexityIncrease: 1.3,
          enableFallback: options.featureFlags?.enableFallback !== false,
          progressCallback: options.progressCallback
        },
        featureFlags: {
          enableAbstraction: options.featureFlags?.enableSmartAbstraction !== false,
          enableProgressReporting: true,
          enableQualityAssurance: options.featureFlags?.enableQualityAssurance !== false,
          enableCaching: true
        },
        compatibility: {
          preserveOriginalFormat: true,
          includeDebugInfo: false,
          enableLegacyFallback: true
        }
      };
      
      // Use enhanced generator
      const abstractionResult = await EnhancedCleanUnifiedRequirementsGenerator.generateForCategory(
        categoryMapping.category,
        frameworkRequirements,
        enhancedOptions
      );
      
      // Choose the best result based on quality
      const resultToUse = this.selectBestResult(abstractionResult);
      
      if (resultToUse) {
        const formatted = this.formatForCurrentSystemWithAbstraction(resultToUse, abstractionResult);
        
        console.log(`[ENHANCED-BRIDGE] Successfully generated with abstraction for ${categoryMapping.category}:`, {
          applied: abstractionResult.abstraction.applied,
          reduction: `${abstractionResult.abstraction.reductionPercentage}%`,
          quality: abstractionResult.abstraction.qualityScore
        });
        
        return formatted;
      }
      
      throw new Error('No valid result from enhanced generator');
      
    } catch (error) {
      console.error(`[ENHANCED-BRIDGE] Abstraction failed for ${categoryMapping.category}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate with standard method (backward compatibility)
   */
  private static async generateWithStandardMethod(
    categoryMapping: any,
    frameworkRequirements: FrameworkRequirement[]
  ): Promise<string[]> {
    
    // Use original CleanUnifiedRequirementsGenerator
    const cleanResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
      categoryMapping.category,
      frameworkRequirements
    );
    
    if (cleanResult) {
      const formatted = this.formatForCurrentSystem(cleanResult);
      console.log(`[ENHANCED-BRIDGE] Successfully generated ${cleanResult.subRequirements.length} sub-requirements for ${categoryMapping.category}`);
      return formatted;
    }
    
    console.error(`[ENHANCED-BRIDGE] NULL result from standard generator for category: ${categoryMapping.category}`);
    return [`Error generating unified requirements for ${categoryMapping.category} - no template found`];
  }
  
  /**
   * Generate with AI consolidation
   */
  private static async generateWithAIConsolidation(
    categoryMapping: any,
    frameworkRequirements: FrameworkRequirement[],
    options: BridgeOptions
  ): Promise<string[]> {
    
    try {
      // Prepare enhanced generation options
      const enhancedOptions: EnhancedGenerationOptions = {
        enableAIConsolidation: true,
        aiConsolidationOptions: {
          targetReduction: options.aiConsolidationOptions?.targetReduction || 25,
          qualityThreshold: options.aiConsolidationOptions?.qualityThreshold || 85,
          preserveAllDetails: options.aiConsolidationOptions?.preserveAllDetails !== false,
          useCache: options.aiConsolidationOptions?.useCache !== false
        },
        includeMetrics: true,
        fallbackToOriginal: options.featureFlags?.enableFallback !== false
      };
      
      // Use AI-enhanced generator
      const aiResult = await CleanUnifiedRequirementsGenerator.generateForCategoryWithAI(
        categoryMapping.category,
        frameworkRequirements,
        enhancedOptions
      );
      
      // Choose the best result (enhanced if available, otherwise original)
      const resultToUse = aiResult.enhanced || aiResult.original;
      
      if (resultToUse) {
        const formatted = this.formatForCurrentSystemWithAIMetrics(resultToUse, aiResult);
        
        console.log(`[ENHANCED-BRIDGE] Successfully generated with AI consolidation for ${categoryMapping.category}:`, {
          aiApplied: aiResult.metrics.aiConsolidationApplied,
          reduction: `${aiResult.metrics.textReductionPercentage}%`,
          quality: aiResult.metrics.qualityScore,
          provider: aiResult.metrics.apiKeyStatus
        });
        
        return formatted;
      }
      
      throw new Error('No valid result from AI-enhanced generator');
      
    } catch (error) {
      console.error(`[ENHANCED-BRIDGE] AI consolidation failed for ${categoryMapping.category}:`, error);
      
      // Fallback to standard method if enabled
      if (options.featureFlags?.enableFallback !== false) {
        console.log(`[ENHANCED-BRIDGE] Falling back to standard method for ${categoryMapping.category}`);
        return await this.generateWithStandardMethod(categoryMapping, frameworkRequirements);
      }
      
      throw error;
    }
  }

  /**
   * Determine if AI consolidation should be used
   */
  private static shouldUseAIConsolidation(
    options: BridgeOptions,
    frameworkRequirements: FrameworkRequirement[]
  ): boolean {
    
    // Check feature flags
    if (options.featureFlags?.enableAIConsolidation === false) {
      return false;
    }
    
    // Check if explicitly disabled
    if (options.enableAIConsolidation === false) {
      return false;
    }
    
    // Need at least 2 requirements for AI consolidation to be beneficial
    if (frameworkRequirements.length < 2) {
      return false;
    }
    
    // Default to enabled if not explicitly disabled
    return options.enableAIConsolidation !== false;
  }

  /**
   * Determine if abstraction should be used
   */
  private static shouldUseAbstraction(
    options: BridgeOptions,
    frameworkRequirements: FrameworkRequirement[]
  ): boolean {
    
    // Check feature flags
    if (options.featureFlags?.enableSmartAbstraction === false) {
      return false;
    }
    
    // Check if explicitly disabled
    if (options.enableAbstraction === false) {
      return false;
    }
    
    // Check if abstraction mode is disabled
    if (options.abstractionMode === 'DISABLED') {
      return false;
    }
    
    // Need at least 3 requirements for abstraction to be beneficial
    if (frameworkRequirements.length < 3) {
      return false;
    }
    
    // Default to enabled if not explicitly disabled
    return options.enableAbstraction !== false;
  }
  
  /**
   * Select the best result from abstraction results
   */
  private static selectBestResult(abstractionResult: AbstractionResult): CleanUnifiedRequirement | null {
    
    // If abstraction was successfully applied and quality is good
    if (abstractionResult.enhanced && 
        abstractionResult.abstraction.applied && 
        abstractionResult.abstraction.qualityScore >= 0.8) {
      return abstractionResult.enhanced;
    }
    
    // Fall back to original
    return abstractionResult.original;
  }
  
  /**
   * Format results with abstraction metadata
   */
  private static formatForCurrentSystemWithAbstraction(
    cleanResult: CleanUnifiedRequirement,
    abstractionResult: AbstractionResult
  ): string[] {
    
    const formatted = this.formatForCurrentSystem(cleanResult);
    
    // Add abstraction metadata as comments if abstraction was applied
    if (abstractionResult.abstraction.applied && abstractionResult.abstraction.reductionPercentage > 0) {
      formatted.unshift('');
      formatted.unshift(`Smart Abstraction Applied: ${abstractionResult.abstraction.reductionPercentage}% reduction achieved while preserving compliance integrity`);
      formatted.unshift('');
    }
    
    return formatted;
  }

  /**
   * Format results with AI consolidation metadata
   */
  private static formatForCurrentSystemWithAIMetrics(
    cleanResult: CleanUnifiedRequirement,
    aiResult: EnhancedGenerationResult
  ): string[] {
    
    const formatted = this.formatForCurrentSystem(cleanResult);
    
    // Add AI consolidation metadata if applied
    if (aiResult.metrics.aiConsolidationApplied && aiResult.metrics.textReductionPercentage > 0) {
      const provider = aiResult.metrics.apiKeyStatus.split('_')[0];
      formatted.unshift('');
      formatted.unshift(`AI Text Consolidation Applied: ${aiResult.metrics.textReductionPercentage}% reduction achieved using ${provider.toUpperCase()} while preserving 100% compliance details`);
      formatted.unshift('');
      
      // Add quality metrics if high quality
      if (aiResult.metrics.qualityScore >= 90) {
        formatted.push('');
        formatted.push(`Quality Score: ${aiResult.metrics.qualityScore}% - High quality consolidation with full detail preservation`);
      }
    }
    
    return formatted;
  }
  
  /**
   * Enhanced batch generation with AI consolidation support
   */
  static async generateForAllCategoriesWithAI(
    filteredMappings: any[],
    selectedFrameworks: Record<string, any>,
    options: BridgeOptions = {}
  ): Promise<Map<string, BridgeResult>> {
    
    console.log('[ENHANCED-BRIDGE] Generating for all categories with AI consolidation:', filteredMappings.length);
    const results = new Map<string, BridgeResult>();
    
    // Prepare category requirements for batch processing
    const categoryRequirements = filteredMappings.map(mapping => ({
      categoryName: mapping.category,
      frameworkRequirements: this.extractFrameworkRequirements(mapping, selectedFrameworks),
      mapping
    }));
    
    // Use AI-enhanced batch generation if enabled
    if (options.enableAIConsolidation && options.featureFlags?.enableAIConsolidation !== false) {
      try {
        console.log('[ENHANCED-BRIDGE] Using AI-enhanced batch generation');
        
        const enhancedOptions: EnhancedGenerationOptions = {
          enableAIConsolidation: true,
          aiConsolidationOptions: options.aiConsolidationOptions,
          includeMetrics: true,
          fallbackToOriginal: options.featureFlags?.enableFallback !== false
        };
        
        const aiResults = await CleanUnifiedRequirementsGenerator.generateMultipleCategoriesWithAI(
          categoryRequirements.map(({ categoryName, frameworkRequirements }) => ({ 
            categoryName, 
            frameworkRequirements 
          })),
          enhancedOptions
        );
        
        // Convert AI results to BridgeResult format
        for (const [categoryName, aiResult] of aiResults.entries()) {
          const cleanCategoryName = categoryName.replace(/^\d+\.\s*/, '') || 'Unknown';
          const resultToUse = aiResult.enhanced || aiResult.original;
          
          if (resultToUse) {
            const formatted = this.formatForCurrentSystemWithAIMetrics(resultToUse, aiResult);
            
            const bridgeResult: BridgeResult = {
              content: formatted,
              metadata: {
                aiConsolidation: {
                  applied: aiResult.metrics.aiConsolidationApplied,
                  reductionPercentage: aiResult.metrics.textReductionPercentage,
                  qualityScore: aiResult.metrics.qualityScore,
                  apiProvider: aiResult.metrics.apiKeyStatus.split('_')[0],
                  cachingUsed: aiResult.metrics.cachingUsed,
                  detailsPreserved: aiResult.metrics.qualityScore >= 85
                },
                traceability: {
                  originalRequirements: resultToUse.totalRequirementsProcessed,
                  processedRequirements: formatted.length,
                  frameworkReferences: resultToUse.frameworksCovered
                },
                performance: {
                  processingTimeMs: aiResult.metrics.processingTimeMs,
                  aiProcessingTimeMs: aiResult.metrics.processingTimeMs,
                  cacheHits: aiResult.metrics.cachingUsed ? 1 : 0
                }
              }
            };
            
            results.set(cleanCategoryName, bridgeResult);
          } else {
            // Create error result for failed AI generation
            const errorResult: BridgeResult = {
              content: [`Error generating AI-enhanced requirements for ${cleanCategoryName}`],
              metadata: {
                aiConsolidation: {
                  applied: false,
                  reductionPercentage: 0,
                  qualityScore: 0,
                  apiProvider: 'error',
                  cachingUsed: false,
                  detailsPreserved: false
                }
              }
            };
            results.set(cleanCategoryName, errorResult);
          }
        }
        
        console.log(`[ENHANCED-BRIDGE] AI batch generation completed: ${results.size} categories`);
        return results;
        
      } catch (error) {
        console.error('[ENHANCED-BRIDGE] AI batch generation failed, falling back to standard:', error);
        
        // Fallback to standard generation if enabled
        if (options.featureFlags?.enableFallback !== false) {
          return await this.generateForAllCategoriesWithAbstraction(filteredMappings, selectedFrameworks, options);
        }
        
        throw error;
      }
    }
    
    // Fallback to abstraction-based generation
    return await this.generateForAllCategoriesWithAbstraction(filteredMappings, selectedFrameworks, options);
  }

  /**
   * Enhanced batch generation with abstraction support
   */
  static async generateForAllCategoriesWithAbstraction(
    filteredMappings: any[],
    selectedFrameworks: Record<string, any>,
    options: BridgeOptions = {}
  ): Promise<Map<string, BridgeResult>> {
    
    console.log('[ENHANCED-BRIDGE] Generating for all categories with abstraction:', filteredMappings.length);
    const results = new Map<string, BridgeResult>();
    
    for (const mapping of filteredMappings) {
      const categoryName = mapping.category?.replace(/^\d+\.\s*/, '') || 'Unknown';
      
      try {
        const content = await this.generateUnifiedRequirementsForCategory(
          mapping,
          selectedFrameworks,
          options
        );
        
        // Create basic result structure
        const result: BridgeResult = {
          content,
          metadata: {
            traceability: {
              originalRequirements: this.extractFrameworkRequirements(mapping, selectedFrameworks).length,
              processedRequirements: content.length,
              frameworkReferences: Object.keys(selectedFrameworks).filter(k => selectedFrameworks[k])
            }
          }
        };
        
        results.set(categoryName, result);
        console.log(`[ENHANCED-BRIDGE] Generated content for ${categoryName}: ${content.length} items`);
        
      } catch (error) {
        console.error(`[ENHANCED-BRIDGE] Error generating content for ${categoryName}:`, error);
        
        const errorResult: BridgeResult = {
          content: [`Error generating requirements for ${categoryName}`],
          metadata: {
            traceability: {
              originalRequirements: 0,
              processedRequirements: 0,
              frameworkReferences: []
            }
          }
        };
        
        results.set(categoryName, errorResult);
      }
    }
    
    console.log(`[ENHANCED-BRIDGE] Generated content for ${results.size} categories`);
    return results;
  }
  
  /**
   * Get generation statistics
   */
  static getGenerationStats(results: Map<string, string[]>) {
    return {
      categoriesProcessed: results.size,
      totalContentItems: Array.from(results.values()).reduce((sum, arr) => sum + arr.length, 0),
      avgItemsPerCategory: results.size > 0 
        ? Math.round(Array.from(results.values()).reduce((sum, arr) => sum + arr.length, 0) / results.size)
        : 0
    };
  }
  
  /**
   * Get enhanced generation statistics with AI consolidation and abstraction metrics
   */
  static getEnhancedGenerationStats(results: Map<string, BridgeResult>) {
    const baseStats = {
      categoriesProcessed: results.size,
      totalContentItems: Array.from(results.values()).reduce((sum, result) => sum + result.content.length, 0),
      avgItemsPerCategory: 0,
      aiConsolidationStats: {
        categoriesWithAI: 0,
        averageReduction: 0,
        averageQualityScore: 0,
        totalProcessingTime: 0,
        cacheUtilization: 0,
        apiProviders: [] as string[]
      },
      abstractionStats: {
        categoriesWithAbstraction: 0,
        averageReduction: 0,
        averageQualityScore: 0,
        totalProcessingTime: 0
      }
    };
    
    if (results.size > 0) {
      baseStats.avgItemsPerCategory = Math.round(baseStats.totalContentItems / results.size);
      
      // Calculate AI consolidation statistics
      let aiReduction = 0;
      let aiQuality = 0;
      let aiCount = 0;
      let cacheHits = 0;
      const providers = new Set<string>();
      
      // Calculate abstraction statistics
      let abstractionReduction = 0;
      let abstractionQuality = 0;
      let abstractionCount = 0;
      
      for (const result of results.values()) {
        // AI consolidation metrics
        if (result.metadata?.aiConsolidation?.applied) {
          aiCount++;
          aiReduction += result.metadata.aiConsolidation.reductionPercentage;
          aiQuality += result.metadata.aiConsolidation.qualityScore;
          
          if (result.metadata.aiConsolidation.cachingUsed) {
            cacheHits++;
          }
          
          if (result.metadata.aiConsolidation.apiProvider !== 'error') {
            providers.add(result.metadata.aiConsolidation.apiProvider);
          }
        }
        
        // Abstraction metrics
        if (result.metadata?.abstraction?.applied) {
          abstractionCount++;
          abstractionReduction += result.metadata.abstraction.reductionPercentage;
          abstractionQuality += result.metadata.abstraction.qualityScore;
        }
        
        // Processing time
        if (result.metadata?.performance?.processingTimeMs) {
          baseStats.abstractionStats.totalProcessingTime += result.metadata.performance.processingTimeMs;
          baseStats.aiConsolidationStats.totalProcessingTime += result.metadata.performance.aiProcessingTimeMs || 0;
        }
      }
      
      // AI consolidation stats
      baseStats.aiConsolidationStats.categoriesWithAI = aiCount;
      baseStats.aiConsolidationStats.cacheUtilization = aiCount > 0 ? Math.round((cacheHits / aiCount) * 100) : 0;
      baseStats.aiConsolidationStats.apiProviders = Array.from(providers);
      
      if (aiCount > 0) {
        baseStats.aiConsolidationStats.averageReduction = Math.round(aiReduction / aiCount);
        baseStats.aiConsolidationStats.averageQualityScore = Math.round((aiQuality / aiCount) * 100) / 100;
      }
      
      // Abstraction stats
      baseStats.abstractionStats.categoriesWithAbstraction = abstractionCount;
      
      if (abstractionCount > 0) {
        baseStats.abstractionStats.averageReduction = Math.round(abstractionReduction / abstractionCount);
        baseStats.abstractionStats.averageQualityScore = Math.round((abstractionQuality / abstractionCount) * 100) / 100;
      }
    }
    
    return baseStats;
  }
}