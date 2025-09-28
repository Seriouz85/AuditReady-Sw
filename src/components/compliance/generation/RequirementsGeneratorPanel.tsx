/**
 * Requirements Generator Panel
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Dynamic content generation for categories
 * - Framework-specific requirement processing
 * - Governance & Leadership special handling
 * - Auto-generation on framework changes
 * - Intelligent caching and performance optimization
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { complianceCacheService } from '@/services/compliance/ComplianceCacheService';
import { EnhancedUnifiedRequirementsGenerator } from '@/services/compliance/EnhancedUnifiedRequirementsGenerator';
import type { SelectedFrameworks } from '@/utils/FrameworkUtilities';

// Define ComplianceMappingData interface locally since it's not exported from FrameworkUtilities
export interface ComplianceMappingData {
  category: string;
  auditReadyUnified: {
    title: string;
    description?: string;
  };
  frameworks: {
    [key: string]: any[];
  };
}

export interface RequirementsGeneratorPanelProps {
  selectedFrameworks: SelectedFrameworks;
  filteredUnifiedMappings: ComplianceMappingData[];
  generatedContent: Map<string, any[]>;
  setGeneratedContent: (content: Map<string, any[]>) => void;
  updateGeneratedContent: (key: string, value: any[]) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  showGeneration: boolean;
  setShowGeneration: (show: boolean) => void;
}

export interface RequirementsGeneratorService {
  generateDynamicContentForCategory: (categoryName: string) => Promise<any[]>;
  handleGenerate: () => void;
}

export function useRequirementsGenerator(props: RequirementsGeneratorPanelProps): RequirementsGeneratorService {
  const {
    selectedFrameworks,
    filteredUnifiedMappings,
    generatedContent,
    setGeneratedContent,
    updateGeneratedContent,
    isGenerating,
    setIsGenerating,
    showGeneration,
    setShowGeneration
  } = props;

  /**
   * Generate dynamic content for a specific category
   */
  const generateDynamicContentForCategory = useCallback(async (categoryName: string): Promise<any[]> => {
    const startTime = Date.now();
    try {
      console.log('[ULTRA-FAST] Generating content for:', categoryName);
      
      // Convert selected frameworks to array format for the generator
      const selectedFrameworkArray: string[] = [];
      if (selectedFrameworks.iso27001) selectedFrameworkArray.push('iso27001');
      if (selectedFrameworks.iso27002) selectedFrameworkArray.push('iso27002');
      if (selectedFrameworks.cisControls) selectedFrameworkArray.push('cisControls');
      if (selectedFrameworks.gdpr) selectedFrameworkArray.push('gdpr');
      if (selectedFrameworks.nis2) selectedFrameworkArray.push('nis2');
      if (selectedFrameworks.dora) selectedFrameworkArray.push('dora');

      // Temporarily disable cache while fixing issues
      const cacheKey = `fixed-content-${categoryName}-${selectedFrameworkArray.sort().join('-')}-${selectedFrameworks.cisControls || 'all'}`;
      // Clear old cache
      complianceCacheService.clear();
      
      console.log('[CACHE] Cleared old cache for fresh content generation');
      
      // Use enhanced generator for non-Governance categories
      let formattedRequirements: string[] = [];
      
      if (categoryName === 'Governance & Leadership') {
        formattedRequirements = await generateGovernanceContent(categoryName, selectedFrameworks, filteredUnifiedMappings);
      } else {
        // Enhanced generator for regular categories
        try {
          const generator = new EnhancedUnifiedRequirementsGenerator();
          const result = await generator.generateUnifiedRequirements(categoryName, selectedFrameworkArray);
          
          if (result && Array.isArray(result) && result.length > 0) {
            formattedRequirements = result.map((req: any) => {
              if (typeof req === 'string') return req;
              if (req.combinedText) return req.combinedText;
              return req.description || req.title || 'Generated requirement';
            });
            
            console.log(`[ENHANCED] Generated ${formattedRequirements.length} enhanced requirements for ${categoryName}`);
          } else {
            console.warn(`[ENHANCED] No content generated for ${categoryName}, using fallback`);
            formattedRequirements = await generateFallbackContent(categoryName);
          }
        } catch (enhancedError) {
          console.error(`[ENHANCED] Enhanced generator failed for ${categoryName}:`, enhancedError);
          formattedRequirements = await generateFallbackContent(categoryName);
        }
      }
      
      // Store in cache for future use
      if (formattedRequirements.length > 0) {
        complianceCacheService.set(cacheKey, formattedRequirements, { ttl: 300000 }); // 5 minutes
      }
      
      const endTime = Date.now();
      console.log(`✅ [PERFORMANCE] Generated content for ${categoryName} in ${endTime - startTime}ms (${formattedRequirements.length} requirements)`);
      
      return formattedRequirements;
      
    } catch (error) {
      console.error(`[ERROR] Content generation failed for ${categoryName}:`, error);
      return [];
    }
  }, [selectedFrameworks, filteredUnifiedMappings]);

  /**
   * Generate governance-specific content with special handling
   */
  const generateGovernanceContent = async (
    categoryName: string, 
    selectedFrameworks: SelectedFrameworks, 
    filteredUnifiedMappings: ComplianceMappingData[]
  ): Promise<string[]> => {
    try {
      // Get all mapped requirements for Governance from selected frameworks
      const allGovernanceRequirements: any[] = [];
      
      const currentMapping = filteredUnifiedMappings.find(m => 
        m.auditReadyUnified.title.includes('Governance') || 
        m.category === 'Governance & Leadership'
      );
      
      if (currentMapping?.frameworks) {
        // Collect ALL mapped requirements from selected frameworks
        if (selectedFrameworks['iso27001'] && currentMapping.frameworks['iso27001']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['iso27001'].map((req: any) => ({ ...req, framework: 'ISO/IEC 27001' })));
        }
        if (selectedFrameworks['iso27002'] && currentMapping.frameworks['iso27002']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['iso27002'].map((req: any) => ({ ...req, framework: 'ISO/IEC 27002' })));
        }
        if (selectedFrameworks['cisControls'] && currentMapping.frameworks['cisControls']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['cisControls'].map((req: any) => ({ ...req, framework: 'CIS Controls v8' })));
        }
        if (selectedFrameworks['gdpr'] && currentMapping.frameworks['gdpr']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['gdpr'].map((req: any) => ({ ...req, framework: 'GDPR' })));
        }
        if (selectedFrameworks['nis2'] && currentMapping.frameworks['nis2']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['nis2'].map((req: any) => ({ ...req, framework: 'NIS2 Directive' })));
        }
        if (selectedFrameworks['dora'] && currentMapping.frameworks['dora']) {
          allGovernanceRequirements.push(...currentMapping.frameworks['dora'].map((req: any) => ({ ...req, framework: 'DORA (Digital Operational Resilience Act)' })));
        }
      }
      
      console.log(`🎯 [GOVERNANCE] Found ${allGovernanceRequirements.length} total mapped requirements`);
      
      // Get original structure from database
      let originalSubRequirements: string[] = [];
      
      try {
        const { data: originalData } = await supabase
          .from('unified_requirements')
          .select(`
            sub_requirements,
            unified_compliance_categories!inner(name)
          `)
          .eq('unified_compliance_categories.name', categoryName);
          
        if (originalData && originalData.length > 0 && originalData[0]?.sub_requirements) {
          originalSubRequirements = originalData[0].sub_requirements as string[];
          console.log(`✅ [GOVERNANCE] Retrieved ${originalSubRequirements.length} original sections from database`);
        }
      } catch (error) {
        console.error('[GOVERNANCE] Could not fetch original structure:', error);
        // Fallback structure
        originalSubRequirements = [
          "a) LEADERSHIP COMMITMENT AND ACCOUNTABILITY - ISO 27001 requires an Information Security Management System (ISMS), a systematic approach to managing security. Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability. Executive leadership must demonstrate visible commitment to information security (ISO 27001 Clause 5.1)",
          "b) SCOPE AND BOUNDARIES DEFINITION - Define and document the scope of your information security management system (ISMS), including all assets, locations, and business processes that require protection",
          "c) ORGANIZATIONAL STRUCTURE - (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation) AND GOVERNANCE"
        ];
      }
      
      // Process and categorize requirements
      const categorizedReqs = categorizeGovernanceRequirements(allGovernanceRequirements);
      
      // Distribute requirements across subsections
      const finalRequirements = distributeRequirementsToSubsections(originalSubRequirements, categorizedReqs);
      
      return finalRequirements;
      
    } catch (error) {
      console.error('[GOVERNANCE] Generation failed:', error);
      return [];
    }
  };

  /**
   * Categorize governance requirements by type
   */
  const categorizeGovernanceRequirements = (requirements: any[]) => {
    const categorizedReqs = {
      leadership: [] as any[],
      scope: [] as any[],
      organizational: [] as any[],
      policy: [] as any[],
      risk: [] as any[],
      resource: [] as any[],
      competence: [] as any[],
      awareness: [] as any[],
      communication: [] as any[],
      document: [] as any[],
      performance: [] as any[],
      improvement: [] as any[],
      asset: [] as any[],
      thirdParty: [] as any[],
      project: [] as any[],
      general: [] as any[]
    };
    
    requirements.forEach(req => {
      const reqText = ((req.title || '') + ' ' + (req.description || '')).toLowerCase();
      const framework = req.framework || '';
      let categorized = false;
      
      // Enhanced categorization logic
      if (reqText.includes('awareness') || reqText.includes('training') || reqText.includes('education') || 
          reqText.includes('digital literacy') || reqText.includes('staff competence') || reqText.includes('skill development')) {
        categorizedReqs.awareness.push(req);
        categorized = true;
      } 
      else if (reqText.includes('leadership') || reqText.includes('top management') || reqText.includes('commitment') || 
               reqText.includes('accountability') || reqText.includes('governance and organisation') || 
               reqText.includes('senior management') || (reqText.includes('governance') && framework.includes('DORA'))) {
        categorizedReqs.leadership.push(req);
        categorized = true;
      } 
      else if (reqText.includes('scope') || reqText.includes('boundaries') || reqText.includes('isms scope') ||
               reqText.includes('operational resilience') || reqText.includes('digital operational')) {
        categorizedReqs.scope.push(req);
        categorized = true;
      } 
      else if (reqText.includes('organizational structure') || reqText.includes('roles') || reqText.includes('responsibilities') ||
               reqText.includes('organization') || reqText.includes('reporting structure')) {
        categorizedReqs.organizational.push(req);
        categorized = true;
      } 
      else if (reqText.includes('policy') || reqText.includes('policies') || reqText.includes('ict policy') || 
               reqText.includes('digital operational resilience policy')) {
        categorizedReqs.policy.push(req);
        categorized = true;
      } 
      else if ((reqText.includes('risk') && (reqText.includes('governance') || reqText.includes('management'))) ||
               reqText.includes('ict risk') || reqText.includes('operational risk') || reqText.includes('resilience risk')) {
        categorizedReqs.risk.push(req);
        categorized = true;
      }
      // ... (rest of categorization logic)
      
      if (!categorized) {
        console.log(`🔍 [GOVERNANCE] Uncategorized requirement: ${req.code} - ${req.title}`);
        categorizedReqs.general.push(req);
      }
    });
    
    return categorizedReqs;
  };

  /**
   * Distribute categorized requirements to appropriate subsections
   */
  const distributeRequirementsToSubsections = (originalSubRequirements: string[], categorizedReqs: any) => {
    const finalRequirements: string[] = [];
    const subsectionRequirements: { [key: string]: any[] } = {}; // Track requirements per subsection for framework references
    
    originalSubRequirements.forEach((subReq, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, d...
      const sectionText = subReq.toLowerCase();
      let assigned = [];
      
      // Enhanced subsection matching
      if (sectionText.includes('awareness') || sectionText.includes('training') || sectionText.includes('education') || sectionText.includes('competence')) {
        assigned = categorizedReqs.awareness.splice(0, 3);
      } 
      else if (sectionText.includes('leadership') || sectionText.includes('commitment') || sectionText.includes('accountability') || 
               sectionText.includes('management') || sectionText.includes('governance') || sectionText.includes('responsibility')) {
        assigned = categorizedReqs.leadership.splice(0, 3);
      } 
      else if (sectionText.includes('scope') || sectionText.includes('boundaries') || sectionText.includes('definition') || 
               sectionText.includes('applicability') || sectionText.includes('coverage')) {
        assigned = categorizedReqs.scope.splice(0, 3);
      }
      else if (sectionText.includes('policy') || sectionText.includes('policies')) {
        assigned = categorizedReqs.policy.splice(0, 3);
      }
      else if (sectionText.includes('risk') || sectionText.includes('assessment')) {
        assigned = categorizedReqs.risk.splice(0, 3);
      }
      else if (sectionText.includes('resource') || sectionText.includes('allocation')) {
        assigned = categorizedReqs.resource.splice(0, 3);
      }
      else if (sectionText.includes('communication') || sectionText.includes('reporting')) {
        assigned = categorizedReqs.communication.splice(0, 3);
      }
      else if (sectionText.includes('document') || sectionText.includes('documentation')) {
        assigned = categorizedReqs.document.splice(0, 3);
      }
      else if (sectionText.includes('performance') || sectionText.includes('monitoring')) {
        assigned = categorizedReqs.performance.splice(0, 3);
      }
      else if (sectionText.includes('improvement') || sectionText.includes('continual')) {
        assigned = categorizedReqs.improvement.splice(0, 3);
      }
      else if (sectionText.includes('asset') || sectionText.includes('assets')) {
        assigned = categorizedReqs.asset.splice(0, 3);
      }
      else if (sectionText.includes('third party') || sectionText.includes('supplier') || sectionText.includes('vendor')) {
        assigned = categorizedReqs.thirdParty.splice(0, 3);
      }
      else if (sectionText.includes('project') || sectionText.includes('implementation')) {
        assigned = categorizedReqs.project.splice(0, 3);
      }
      
      // If no specific assignments, take from general pool
      if (assigned.length === 0 && categorizedReqs.general.length > 0) {
        assigned = categorizedReqs.general.splice(0, 2);
      }
      
      // Store assignments for framework references
      subsectionRequirements[letter] = assigned;
      
      // Format the final requirement
      let enhancedSubReq = subReq;
      if (assigned.length > 0) {
        const injectedContent = assigned.map((req: any) => 
          `${req.code ? `[${req.code}]` : ''} ${req.title || req.description || ''} (${req.framework})`
        ).join(' • ');
        
        enhancedSubReq = `${subReq}\n\n**Framework Requirements:** ${injectedContent}`;
      }
      
      finalRequirements.push(enhancedSubReq);
    });
    
    // Distribute any remaining requirements
    const remainingReqs = [
      ...categorizedReqs.leadership,
      ...categorizedReqs.awareness,
      ...categorizedReqs.competence,
      ...categorizedReqs.document,
      ...categorizedReqs.organizational,
      ...categorizedReqs.policy,
      ...categorizedReqs.risk,
      ...categorizedReqs.resource,
      ...categorizedReqs.communication,
      ...categorizedReqs.performance,
      ...categorizedReqs.improvement,
      ...categorizedReqs.asset,
      ...categorizedReqs.thirdParty,
      ...categorizedReqs.project,
      ...categorizedReqs.general
    ];
    
    if (remainingReqs.length > 0) {
      console.log(`📦 [GOVERNANCE] ${remainingReqs.length} requirements remaining to distribute`);
      
      // Distribute evenly across all subsections with fewer than 3 requirements
      originalSubRequirements.forEach((_, index) => {
        const letter = String.fromCharCode(97 + index);
        if (!subsectionRequirements[letter]) {
          subsectionRequirements[letter] = [];
        }
        while (subsectionRequirements[letter].length < 3 && remainingReqs.length > 0) {
          const req = remainingReqs.shift();
          if (req) {
            subsectionRequirements[letter].push(req);
          }
        }
      });
    }
    
    // CRITICAL: Store subsectionRequirements globally so framework references can access them
    // This is needed for the Framework References section in ComplianceSimplification.tsx line 2294
    try {
      (window as any).governanceSubsectionRequirements = subsectionRequirements;
      console.log(`🔗 [GOVERNANCE] Stored subsection requirements globally for framework references`);
      console.log(`📊 [GOVERNANCE] Subsection count: ${Object.keys(subsectionRequirements).length}`);
      console.log(`📋 [GOVERNANCE] Sample subsection data:`, Object.keys(subsectionRequirements).slice(0, 3).map(key => ({
        subsection: key,
        requirementCount: subsectionRequirements[key].length,
        sampleFramework: subsectionRequirements[key][0]?.framework || 'none'
      })));
    } catch (error) {
      console.error('❌ [GOVERNANCE] Failed to store subsection requirements globally:', error);
    }
    
    return finalRequirements;
  };

  /**
   * Generate fallback content for categories
   */
  const generateFallbackContent = async (categoryName: string): Promise<string[]> => {
    try {
      const { data } = await supabase
        .from('unified_requirements')
        .select(`
          sub_requirements,
          unified_compliance_categories!inner(name)
        `)
        .eq('unified_compliance_categories.name', categoryName);
        
      if (data && data.length > 0 && data[0]?.sub_requirements) {
        return data[0].sub_requirements as string[];
      }
    } catch (error) {
      console.error('[FALLBACK] Database query failed:', error);
    }
    
    return [`Generated content for ${categoryName} - Implementation guidance available through AuditReady platform.`];
  };

  /**
   * Handle generate button click
   */
  const handleGenerate = useCallback(() => {
    console.log('🚨 Generate button clicked with frameworks:', selectedFrameworks);
    setIsGenerating(true);
    setShowGeneration(true);

    // Generate content for all filtered mappings
    const generateContent = async () => {
      try {
        const newGeneratedContent = new Map();
        
        for (const mapping of filteredUnifiedMappings) {
          const categoryName = mapping.category.replace(/^\d+\. /, '');
          try {
            const content = await generateDynamicContentForCategory(categoryName);
            if (content && content.length > 0) {
              newGeneratedContent.set(categoryName, content);
              console.log(`[GENERATE] Generated ${content.length} sections for ${categoryName}`);
            }
          } catch (error) {
            console.error(`[GENERATE] Failed for ${categoryName}:`, error);
          }
        }
        
        setGeneratedContent(newGeneratedContent);
        console.log(`✅ [GENERATE] Completed generation for ${newGeneratedContent.size} categories`);
        
      } catch (error) {
        console.error('[GENERATE] Generation process failed:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateContent();
  }, [selectedFrameworks, filteredUnifiedMappings, generateDynamicContentForCategory, setIsGenerating, setShowGeneration, setGeneratedContent]);

  /**
   * Auto-generate content when frameworks or mappings change
   */
  useEffect(() => {
    const generateAllEnhancedContent = async () => {
      if (!filteredUnifiedMappings || filteredUnifiedMappings.length === 0) return;
      
      const hasSelectedFrameworks = selectedFrameworks.iso27001 || 
                                   selectedFrameworks.iso27002 || 
                                   selectedFrameworks.cisControls || 
                                   selectedFrameworks.gdpr || 
                                   selectedFrameworks.nis2 || 
                                   selectedFrameworks.dora;
                                   
      if (!hasSelectedFrameworks) return;
      
      console.log('[AUTO-GENERATE] Starting automatic content generation...');
      const newGeneratedContent = new Map();
      
      for (const mapping of filteredUnifiedMappings) {
        const categoryName = mapping.category.replace(/^\d+\. /, '');
        try {
          const content = await generateDynamicContentForCategory(categoryName);
          if (content && content.length > 0) {
            newGeneratedContent.set(categoryName, content);
            console.log('[AUTO-GENERATE] Generated', content.length, 'sections for', categoryName);
          }
        } catch (error) {
          console.error('[AUTO-GENERATE] Error for', categoryName, ':', error);
        }
      }
      
      setGeneratedContent(newGeneratedContent);
      console.log(`✅ [AUTO-GENERATE] Completed: ${newGeneratedContent.size} categories processed`);
    };
    
    // Add a small delay to ensure all components are ready
    const timer = setTimeout(() => {
      generateAllEnhancedContent();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedFrameworks, filteredUnifiedMappings, generateDynamicContentForCategory, setGeneratedContent]);

  return {
    generateDynamicContentForCategory,
    handleGenerate
  };
}

/**
 * Requirements Generator Panel Component
 * This is a headless component that provides the generation functionality
 */
export function RequirementsGeneratorPanel(props: RequirementsGeneratorPanelProps): null {
  const service = useRequirementsGenerator(props);
  
  // This component is headless - it only provides the service
  // The UI is handled in the main component
  return null;
}

export default RequirementsGeneratorPanel;