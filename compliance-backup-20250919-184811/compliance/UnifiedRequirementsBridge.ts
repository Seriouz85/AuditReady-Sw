/**
 * Unified Requirements Bridge
 * 
 * Bridges the old mapping system with the new clean unified requirements generator.
 * Converts existing framework mappings to the format expected by the CleanUnifiedRequirementsGenerator.
 */

import { CleanUnifiedRequirementsGenerator, FrameworkRequirement, CleanUnifiedRequirement } from './CleanUnifiedRequirementsGenerator';

export class UnifiedRequirementsBridge {
  
  /**
   * Generate unified requirements for a specific category (main method called by UI)
   */
  static async generateUnifiedRequirementsForCategory(
    categoryMapping: any,
    selectedFrameworks: Record<string, any>
  ): Promise<string[]> {
    
    console.log('[BRIDGE] Generating unified requirements for category:', categoryMapping.category);
    
    try {
      // Extract framework requirements for this category
      const frameworkRequirements = this.extractFrameworkRequirements(categoryMapping, selectedFrameworks);
      
      console.log(`[BRIDGE DEBUG] Category: "${categoryMapping.category}", Requirements: ${frameworkRequirements.length}`);
      
      if (frameworkRequirements.length === 0) {
        console.log(`[BRIDGE] No requirements found for category: ${categoryMapping.category}`);
        return [`No unified requirements available for ${categoryMapping.category}. Please select frameworks.`];
      }
      
      // Generate clean unified requirements
      const cleanResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
        categoryMapping.category,
        frameworkRequirements
      );
      
      console.log(`[BRIDGE DEBUG] Clean result for "${categoryMapping.category}":`, !!cleanResult);
      
      if (cleanResult) {
        // Convert to string array format expected by current system
        const formatted = this.formatForCurrentSystem(cleanResult);
        console.log(`[BRIDGE] Successfully generated ${cleanResult.subRequirements.length} sub-requirements for ${categoryMapping.category}`);
        return formatted;
      }
      
      console.error(`[BRIDGE] NULL result from generator for category: ${categoryMapping.category}`);
      return [`Error generating unified requirements for ${categoryMapping.category} - no template found`];
      
    } catch (error) {
      console.error(`[BRIDGE] Error processing category ${categoryMapping.category}:`, error);
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
}