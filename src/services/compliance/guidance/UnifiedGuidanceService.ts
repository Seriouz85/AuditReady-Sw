/**
 * Unified Guidance Service
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Build guidance from unified requirements
 * - Extract real framework mappings
 * - Build references sections
 * - Load guidance content asynchronously
 * - Framework mapping extraction
 */

import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import { EnhancedUnifiedGuidanceService } from '@/services/compliance/EnhancedUnifiedGuidanceService';

export interface GuidanceServiceOptions {
  selectedFrameworks: any;
  selectedIndustrySector: string | null;
}

export class UnifiedGuidanceService {
  
  /**
   * Build guidance from unified requirements
   */
  static async buildGuidanceFromUnifiedRequirements(
    category: string,
    categoryMapping: any,
    selectedFrameworks: any,
    selectedIndustrySector: string | null
  ): Promise<string | null> {
    // Debug information for customers
    if (!category || category.trim() === '') {
      console.warn(`[Unified Guidance Debug] Empty category name provided`);
      return null;
    }
    
    if (!categoryMapping) {
      console.warn(`[Unified Guidance Debug] No category mapping found for: "${category}"`);
      return null;
    }
    
    // Use the new dynamic guidance generator instead of hardcoded content
    try {
      // Extract real framework mappings from categoryMapping
      const realFrameworkMappings = this.extractRealFrameworkMappings(categoryMapping, selectedFrameworks);
      
      // Generate comprehensive guidance content using EnhancedUnifiedGuidanceService
      const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
        category, 
        selectedFrameworks, 
        categoryMapping
      );
      
      // Store the complete guidance data globally so Show References can access it
      (window as any).currentGuidanceData = { content: [guidanceContent] };
      
      // Build references section using REAL mappings, not fake ones
      const referencesSection = this.buildReferencesSection(realFrameworkMappings);
      
      // Return the foundation content with optional references
      return `${referencesSection}\n\n${guidanceContent}`;
    } catch (error) {
      console.error(`[Unified Guidance Debug] Error generating guidance for ${category}:`, error);
      
      // Fallback to old method if new generator fails
      if (!categoryMapping?.auditReadyUnified?.subRequirements) {
        console.warn(`[Unified Guidance Debug] No unified requirements found for: ${category}`, categoryMapping);
        return null;
      }
    }
    
    console.log(`[Unified Guidance Debug] Building guidance for: ${category}`, {
      hasMapping: !!categoryMapping,
      requirementsCount: categoryMapping.auditReadyUnified?.subRequirements?.length || 0,
      selectedFrameworks,
      selectedIndustrySector
    });

    // Apply the same special handling that's used throughout the application
    let baseRequirements = categoryMapping.auditReadyUnified.subRequirements || [];
    
    // Use database content directly - no more hardcoded fallbacks for Governance & Leadership
    
    // Apply sector-specific enhancements
    const requirements = SectorSpecificEnhancer.enhanceSubRequirements(
      baseRequirements,
      category,
      selectedIndustrySector,
      selectedFrameworks['nis2']
    );
    
    // Build framework references section using the FILTERED framework mappings
    let frameworkRefs = '';
    const activeFrameworks = Object.keys(selectedFrameworks).filter(fw => selectedFrameworks[fw]);
    
    console.log(`🔍 [QA] Building framework references for ${category} with frameworks:`, activeFrameworks);
    
    if (activeFrameworks.length > 0) {
      frameworkRefs += 'FRAMEWORK REFERENCES:\n\n';
      frameworkRefs += 'Framework References for Selected Standards:\n\n';
      
      const processedCodes = new Set<string>(); // Track processed codes to prevent duplicates
      
      activeFrameworks.forEach(framework => {
        let frameworkData = categoryMapping.frameworks?.[framework];
        
        // IMPORTANT: Do NOT apply filtering here - the data should already be filtered by main filteredMappings logic
        // Additional filtering here causes double-filtering and duplication issues
        
        if (frameworkData && frameworkData.length > 0) {
          // Enhanced deduplication: code-level + semantic similarity checking
          const uniqueRequirements = frameworkData.filter((req: any) => {
            const code = req.code || req.id || req.requirement || req.number;
            const title = req.title || '';
            const description = req.description || '';
            
            // Primary deduplication: exact code match
            const uniqueKey = `${framework}-${code}`;
            if (processedCodes.has(uniqueKey)) {
              return false;
            }
            
            // Secondary deduplication: semantic similarity
            const content = (title + ' ' + description).toLowerCase();
            const semanticKey = content.substring(0, 100); // First 100 chars for similarity
            
            // Check for similar content across all frameworks
            const similarContentKey = `content-${semanticKey}`;
            if (processedCodes.has(similarContentKey)) {
              console.log(`🔄 [DEDUP] Semantic duplicate detected: ${code} similar to existing content`);
              return false;
            }
            
            // Add both keys to prevent duplicates
            processedCodes.add(uniqueKey);
            processedCodes.add(similarContentKey);
            return true;
          });
          
          if (uniqueRequirements.length > 0) {
            const frameworkName = {
              iso27001: 'ISO 27001',
              iso27002: 'ISO 27002', 
              cisControls: 'CIS Controls v8',
              gdpr: 'GDPR',
              nis2: 'NIS2 Directive',
              dora: 'DORA (Digital Operational Resilience Act)'
            }[framework] || framework;
            
            frameworkRefs += `${frameworkName}: ${uniqueRequirements.map((req: any) => `${req.code} (${req.title})`).join(', ')}\n\n`;
          }
        }
      });
    }
    
    // FALLBACK: Ensure framework references appear even when no requirements are mapped
    if (frameworkRefs === '') {
      console.log(`⚠️ [FALLBACK] No framework references found for ${category}, adding fallback`);
      frameworkRefs = 'FRAMEWORK REFERENCES:\n\nRefer to the selected compliance frameworks for specific requirements.\n\n';
    }
    
    // ENHANCED: Format requirements with markdown and better structure
    const formattedRequirements = requirements.map((req, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, d...
      return `${letter}) ${req}`;
    }).join('\n\n');
    
    const content = `${frameworkRefs}\n\nUNIFIED REQUIREMENTS:\n\n${formattedRequirements}`;
    
    return content;
  }

  /**
   * Extract real framework mappings from categoryMapping
   */
  static extractRealFrameworkMappings(categoryMapping: any, selectedFrameworks: any): any[] {
    console.log('🔍 [REAL MAPPINGS] Extracting real framework mappings for Show References:', {
      category: categoryMapping?.category,
      selectedFrameworks,
      availableFrameworks: Object.keys(categoryMapping?.frameworks || {})
    });
    
    const realMappings: any[] = [];
    
    // Only process frameworks that are actually selected AND have data
    Object.keys(selectedFrameworks).forEach(framework => {
      if (selectedFrameworks[framework] && categoryMapping?.frameworks?.[framework]) {
        const frameworkData = categoryMapping.frameworks[framework];
        
        console.log(`✅ [REAL MAPPINGS] Found ${frameworkData.length} real requirements for ${framework}`);
        
        frameworkData.forEach((req: any) => {
          realMappings.push({
            framework,
            ...req
          });
        });
      }
    });
    
    console.log(`📋 [REAL MAPPINGS] Total real mappings extracted: ${realMappings.length}`);
    
    return realMappings;
  }

  /**
   * Build references section for dynamic guidance
   */
  static buildReferencesSection(references: any[]): string {
    if (!references || references.length === 0) {
      return 'FRAMEWORK REFERENCES:\n\nNo specific framework requirements mapped for this category.';
    }
    
    // Group by framework
    const groupedRefs = references.reduce((acc: any, ref: any) => {
      if (!acc[ref.framework]) {
        acc[ref.framework] = [];
      }
      acc[ref.framework].push(ref);
      return acc;
    }, {});
    
    let referencesContent = 'FRAMEWORK REFERENCES:\n\n';
    
    Object.keys(groupedRefs).forEach(framework => {
      const frameworkName = {
        iso27001: 'ISO 27001',
        iso27002: 'ISO 27002',
        cisControls: 'CIS Controls v8',
        gdpr: 'GDPR',
        nis2: 'NIS2 Directive',
        dora: 'DORA (Digital Operational Resilience Act)'
      }[framework] || framework;
      
      referencesContent += `${frameworkName}:\n`;
      groupedRefs[framework].forEach((ref: any) => {
        referencesContent += `• ${ref.code} - ${ref.title}\n`;
      });
      referencesContent += '\n';
    });
    
    return referencesContent;
  }

  /**
   * Load guidance content asynchronously
   */
  static async loadGuidanceContentAsync(
    category: string, 
    categoryMapping: any,
    selectedFrameworks: any,
    selectedIndustrySector: string | null,
    useActiveFrameworks: boolean = true
  ): Promise<string | null> {
    console.log(`[GUIDANCE] Loading async content for: ${category}`, {
      useActiveFrameworks,
      selectedFrameworks,
      categoryMapping: !!categoryMapping
    });

    try {
      // Enhanced loading with progress tracking
      const loadingSteps = [
        'Validating category mapping...',
        'Processing selected frameworks...',
        'Generating unified content...',
        'Applying sector-specific enhancements...',
        'Finalizing guidance content...'
      ];

      for (let i = 0; i < loadingSteps.length; i++) {
        console.log(`[GUIDANCE] Step ${i + 1}/5: ${loadingSteps[i]}`);
        
        // Simulate progressive loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (i === 1) {
          // Validate we have the required data
          if (!categoryMapping) {
            console.error(`[GUIDANCE] No category mapping available for: ${category}`);
            return null;
          }
        }
        
        if (i === 4) {
          // Final step: generate the guidance
          const guidance = await this.buildGuidanceFromUnifiedRequirements(
            category,
            categoryMapping,
            selectedFrameworks,
            selectedIndustrySector
          );
          
          console.log(`[GUIDANCE] ✅ Generated guidance for ${category}:`, {
            contentLength: guidance?.length || 0,
            hasContent: !!guidance
          });
          
          return guidance;
        }
      }
      
      // Loading complete
    } catch (error) {
      console.error(`[GUIDANCE] Error loading content for ${category}:`, error);
      return null;
    }

    return null;
  }

  /**
   * Get guidance content fallback
   */
  static getGuidanceContentFallback(cleanCategory: string): string {
    return `# ${cleanCategory}

This category contains essential compliance requirements that help organizations maintain security and regulatory compliance.

**Implementation Guidance:**
- Review your current policies and procedures
- Identify gaps in your compliance posture  
- Implement necessary controls and safeguards
- Monitor and maintain ongoing compliance

*For detailed requirements, please select specific compliance frameworks in the Framework Mapping tab and click "Generate Unified Requirements".*

----
*Debug info logged to browser console for technical support*`;
  }
}

export default UnifiedGuidanceService;