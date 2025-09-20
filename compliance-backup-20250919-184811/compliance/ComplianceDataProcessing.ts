import { SelectedFrameworks } from '@/hooks/ComplianceSimplificationHooks';
import { complianceCacheService } from './ComplianceCacheService';
import { ComplianceCalculationService } from './ComplianceCalculationService';

/**
 * Service for data processing and transformation utilities for compliance simplification
 */
export class ComplianceDataProcessing {

  /**
   * Handle framework toggle logic
   */
  static handleFrameworkToggle(
    framework: string,
    value: boolean | 'ig1' | 'ig2' | 'ig3' | null,
    selectedFrameworks: SelectedFrameworks,
    setSelectedFrameworks: React.Dispatch<React.SetStateAction<SelectedFrameworks>>
  ) {
    setSelectedFrameworks(prev => ({
      ...prev,
      [framework]: value
    }));
  }

  /**
   * Handle generate action with cache management
   */
  static handleGenerate(
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
    setShowGeneration: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    setIsGenerating(true);
    setShowGeneration(true);
    
    // Clear memory cache to ensure fresh results
    complianceCacheService.clear('memory');
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generation completed, staying on current tab');
      
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }, 2500);
  }

  /**
   * Get guidance content with fallback logic
   */
  static getGuidanceContent(
    selectedGuidanceCategory: string,
    filteredUnifiedMappings: any[]
  ): any {
    if (!selectedGuidanceCategory) return null;
    
    try {
      const cleanCategory = selectedGuidanceCategory.replace(/^\d+\.\s*/, '');
      return this.getGuidanceContentFallback(cleanCategory, filteredUnifiedMappings);
    } catch (error) {
      console.error('[GUIDANCE] Error getting content:', error);
      return null;
    }
  }

  /**
   * Get guidance content fallback
   */
  static getGuidanceContentFallback(
    cleanCategory: string,
    filteredUnifiedMappings: any[]
  ): any {
    // Enhanced guidance with structured professional content
    const guidanceData = {
      'Asset Management': {
        overview: 'Comprehensive asset management framework ensuring complete visibility and control over organizational assets.',
        keyPrinciples: [
          'Asset inventory and classification',
          'Lifecycle management',
          'Security controls application',
          'Regular assessment and review'
        ],
        implementationSteps: [
          'Establish asset inventory process',
          'Define classification schemes',
          'Implement tracking mechanisms',
          'Setup monitoring and reporting'
        ]
      },
      'Governance & Leadership': {
        overview: 'Strategic governance framework establishing clear leadership, accountability, and decision-making structures.',
        keyPrinciples: [
          'Executive leadership commitment',
          'Clear roles and responsibilities',
          'Strategic alignment',
          'Continuous improvement'
        ],
        implementationSteps: [
          'Define governance structure',
          'Establish policies and procedures',
          'Implement oversight mechanisms',
          'Setup performance metrics'
        ]
      },
      'Human Resources Security': {
        overview: 'Comprehensive human resources security program covering the entire employee lifecycle.',
        keyPrinciples: [
          'Background verification',
          'Security awareness training',
          'Access management',
          'Termination procedures'
        ],
        implementationSteps: [
          'Develop security policies',
          'Implement training programs',
          'Establish access controls',
          'Create termination checklists'
        ]
      }
    };

    const baseContent = guidanceData[cleanCategory] || {
      overview: `Professional guidance for ${cleanCategory} implementation and compliance.`,
      keyPrinciples: [
        'Risk-based approach',
        'Continuous monitoring',
        'Regular assessment',
        'Documentation and reporting'
      ],
      implementationSteps: [
        'Assess current state',
        'Define target state',
        'Develop implementation plan',
        'Execute and monitor'
      ]
    };

    // Find matching mapping for additional context
    const matchingMapping = filteredUnifiedMappings.find(mapping => 
      mapping.category.toLowerCase().includes(cleanCategory.toLowerCase()) ||
      mapping.auditReadyUnified?.title?.toLowerCase().includes(cleanCategory.toLowerCase())
    );

    return {
      ...baseContent,
      mapping: matchingMapping,
      category: cleanCategory,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate dynamic content for a category using enhanced generator
   */
  static async generateDynamicContentForCategory(
    categoryName: string,
    selectedFrameworks: SelectedFrameworks,
    filteredUnifiedMappings: any[],
    enhancedGenerator: any
  ): Promise<any[]> {
    const startTime = Date.now();
    try {
      console.log('[ULTRA-FAST] Generating content for:', categoryName);
      
      // Convert selected frameworks to array format for the generator
      const selectedFrameworkArray = ComplianceCalculationService.convertSelectedFrameworksToArray(selectedFrameworks);

      // Generate cache key
      const cacheKey = ComplianceCalculationService.generateCacheKey(categoryName, selectedFrameworks);
      
      // Clear old cache
      complianceCacheService.clear();
      console.log('[CACHE] Cleared old cache for fresh content generation');
      
      // Use enhanced generator for non-Governance categories
      let formattedRequirements: string[] = [];
      
      if (categoryName === 'Governance & Leadership') {
        // Special handling for Governance category
        const allGovernanceRequirements = ComplianceCalculationService.getGovernanceRequirements(
          filteredUnifiedMappings,
          selectedFrameworks
        );
        
        console.log(`🎯 [GOVERNANCE] Found ${allGovernanceRequirements.length} total mapped requirements`);
        
        // Format requirements for display
        formattedRequirements = allGovernanceRequirements.map((req: any) => 
          `${req.framework}: ${req.title || req.description || 'Requirement'}`
        );
      } else {
        // Use enhanced generator for other categories
        try {
          const generatedContent = await enhancedGenerator.generateDynamicContent(
            categoryName,
            selectedFrameworkArray,
            selectedFrameworks.cisControls || 'ig3'
          );
          
          formattedRequirements = generatedContent || [`Enhanced guidance for ${categoryName}`];
        } catch (error) {
          console.error('[GENERATOR] Error generating content:', error);
          formattedRequirements = [`Professional guidance for ${categoryName} implementation`];
        }
      }
      
      const endTime = Date.now();
      console.log(`[GENERATION] Completed in ${endTime - startTime}ms for ${categoryName}`);
      
      return formattedRequirements;
    } catch (error) {
      console.error('[GENERATION] Error generating content:', error);
      return [`Error generating content for ${categoryName}`];
    }
  }

  /**
   * Enhanced content generation with full framework support
   */
  static async generateAllEnhancedContent(
    filteredUnifiedMappings: any[],
    selectedFrameworks: SelectedFrameworks,
    generatedContent: Map<string, any[]>,
    setGeneratedContent: React.Dispatch<React.SetStateAction<Map<string, any[]>>>,
    enhancedGenerator: any
  ) {
    if (!filteredUnifiedMappings || filteredUnifiedMappings.length === 0) return;
    
    const hasSelectedFrameworks = ComplianceCalculationService.hasSelectedFrameworks(selectedFrameworks);
    if (!hasSelectedFrameworks) {
      console.log('[CONTENT GENERATION] No frameworks selected, skipping content generation');
      return;
    }

    console.log('🚀 [ENHANCED CONTENT] Starting generation for all categories...');
    
    const newContent = new Map(generatedContent);
    
    // Generate content for each category
    for (const mapping of filteredUnifiedMappings) {
      const categoryName = mapping.category;
      const cleanCategoryName = categoryName.replace(/^\d+\.\s*/, '');
      
      try {
        const content = await this.generateDynamicContentForCategory(
          cleanCategoryName,
          selectedFrameworks,
          filteredUnifiedMappings,
          enhancedGenerator
        );
        
        newContent.set(cleanCategoryName, content);
        console.log(`✅ [CONTENT] Generated for ${cleanCategoryName}`);
      } catch (error) {
        console.error(`❌ [CONTENT] Failed for ${cleanCategoryName}:`, error);
        newContent.set(cleanCategoryName, [`Professional guidance for ${cleanCategoryName}`]);
      }
    }
    
    setGeneratedContent(newContent);
    console.log('🎉 [ENHANCED CONTENT] Generation completed for all categories');
  }

  /**
   * Process GDPR-specific filtering logic
   */
  static processGDPRFiltering(
    complianceMappingData: any[] | undefined,
    selectedFrameworks: SelectedFrameworks
  ): any[] {
    let filtered = complianceMappingData || [];
    
    // First, filter to show only GDPR group when GDPR is selected, or non-GDPR groups when other frameworks are selected
    if (selectedFrameworks.gdpr && !selectedFrameworks.iso27001 && !selectedFrameworks.iso27002 && !selectedFrameworks.cisControls && !selectedFrameworks.nis2 && !selectedFrameworks.dora) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2 || selectedFrameworks.dora)) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2 || selectedFrameworks.dora)) {
      // Mixed selection - show all relevant groups
      filtered = complianceMappingData || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    return filtered;
  }

  /**
   * Clean and format category name
   */
  static cleanCategoryName(categoryName: string): string {
    return categoryName.replace(/^\d+\.\s*/, '');
  }

  /**
   * Check if a mapping has content for selected frameworks
   */
  static mappingHasContent(mapping: any, selectedFrameworks: SelectedFrameworks): boolean {
    return (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) ||
           (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) ||
           (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) ||
           (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) ||
           (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) ||
           (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0);
  }

  /**
   * Get maximum framework count for a mapping
   */
  static getMaxFrameworkCount(mapping: any, selectedFrameworks: SelectedFrameworks): number {
    let maxCount = 0;
    
    if (selectedFrameworks.iso27001) {
      maxCount = Math.max(maxCount, mapping.frameworks?.iso27001?.length || 0);
    }
    if (selectedFrameworks.iso27002) {
      maxCount = Math.max(maxCount, mapping.frameworks?.iso27002?.length || 0);
    }
    if (selectedFrameworks.cisControls) {
      maxCount = Math.max(maxCount, mapping.frameworks?.cisControls?.length || 0);
    }
    if (selectedFrameworks.gdpr) {
      maxCount = Math.max(maxCount, mapping.frameworks?.gdpr?.length || 0);
    }
    if (selectedFrameworks.nis2) {
      maxCount = Math.max(maxCount, mapping.frameworks?.nis2?.length || 0);
    }
    if (selectedFrameworks.dora) {
      maxCount = Math.max(maxCount, mapping.frameworks?.dora?.length || 0);
    }
    
    return maxCount;
  }

  /**
   * Format framework requirements for display
   */
  static formatFrameworkRequirements(requirements: any[], frameworkName: string): string[] {
    return requirements.map(req => `${frameworkName}: ${req.title || req.description || 'Requirement'}`);
  }

  /**
   * Validate content generation parameters
   */
  static validateGenerationParams(
    categoryName: string,
    selectedFrameworks: SelectedFrameworks
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!categoryName || categoryName.trim() === '') {
      errors.push('Category name is required');
    }
    
    if (!ComplianceCalculationService.hasSelectedFrameworks(selectedFrameworks)) {
      errors.push('At least one framework must be selected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Log generation metrics
   */
  static logGenerationMetrics(categoryName: string, startTime: number, requirementCount: number) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[METRICS] Category: ${categoryName}, Duration: ${duration}ms, Requirements: ${requirementCount}`);
  }
}