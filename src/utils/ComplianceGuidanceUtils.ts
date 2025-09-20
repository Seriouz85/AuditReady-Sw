import { supabase } from '@/lib/supabase';
import { EnhancedUnifiedGuidanceService } from '@/services/compliance/EnhancedUnifiedGuidanceService';
import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import { ComplianceExportService } from '@/services/compliance/ComplianceExportService';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

// Function to build guidance content from actual unified requirements
export const buildGuidanceFromUnifiedRequirements = async (
  category: string,
  categoryMapping: any,
  selectedFrameworks: any,
  selectedIndustrySector: string | null
): Promise<string | null> => {
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
    const realFrameworkMappings = extractRealFrameworkMappings(categoryMapping, selectedFrameworks);
    
    // Generate comprehensive guidance content using EnhancedUnifiedGuidanceService
    const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
      category, 
      selectedFrameworks, 
      categoryMapping
    );
    
    // Store the complete guidance data globally so Show References can access it
    (window as any).currentGuidanceData = { content: [guidanceContent] };
    
    // Build references section using REAL mappings, not fake ones
    const referencesSection = buildReferencesSection(realFrameworkMappings);
    
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
      
      if (frameworkData && frameworkData.length > 0) {
        const uniqueRequirements = frameworkData.filter((req: any) => {
          const code = req.code || req.id || req.requirement || req.number;
          const uniqueKey = `${framework}-${code}`;
          if (processedCodes.has(uniqueKey)) {
            return false;
          }
          
          processedCodes.add(uniqueKey);
          return true;
        });
        
        if (uniqueRequirements.length > 0) {
          const frameworkName = getFrameworkDisplayName(framework);
          frameworkRefs += `${frameworkName}: `;
          
          const codes = uniqueRequirements.map((req: any) => {
            return req.code || req.id || req.requirement || req.number || 'N/A';
          }).join(', ');
          
          frameworkRefs += `${codes}\n\n`;
        }
      }
    });
  }
  
  // Build the complete guidance content
  let content = '';
  
  if (frameworkRefs.trim()) {
    content = frameworkRefs + '\n' + requirements.join('\n\n');
  } else {
    content = requirements.join('\n\n');
  }
  
  return content;
};

// Function to extract real framework mappings from categoryMapping
export const extractRealFrameworkMappings = (categoryMapping: any, selectedFrameworks: any): any => {
  const realMappings: any = {};
  
  if (!categoryMapping?.frameworks) {
    console.warn('[Extract Real Mappings] No frameworks found in category mapping');
    return realMappings;
  }
  
  Object.keys(selectedFrameworks).forEach(framework => {
    if (selectedFrameworks[framework] && categoryMapping.frameworks[framework]) {
      realMappings[framework] = categoryMapping.frameworks[framework];
      console.log(`✅ [Extract Real Mappings] Found ${categoryMapping.frameworks[framework].length} real mappings for ${framework}`);
    }
  });
  
  return realMappings;
};

// Function to build references section for dynamic guidance
export const buildReferencesSection = (realFrameworkMappings: any): string => {
  if (!realFrameworkMappings || Object.keys(realFrameworkMappings).length === 0) {
    return '';
  }
  
  let referencesContent = 'Framework References for Selected Standards:\n\n';
  
  Object.entries(realFrameworkMappings).forEach(([framework, requirements]: [string, any]) => {
    if (requirements && requirements.length > 0) {
      const frameworkName = getFrameworkDisplayName(framework);
      referencesContent += `${frameworkName}: `;
      
      const codes = requirements.map((req: any) => {
        return req.code || req.id || req.requirement || req.number || 'N/A';
      }).join(', ');
      
      referencesContent += `${codes}\n\n`;
    }
  });
  
  return referencesContent;
};

// Helper function to get framework display name
export const getFrameworkDisplayName = (framework: string): string => {
  const names: Record<string, string> = {
    'iso27001': 'ISO 27001',
    'iso27002': 'ISO 27002',
    'cisControls': 'CIS Controls v8',
    'gdpr': 'GDPR',
    'nis2': 'NIS2 Directive',
    'dora': 'DORA (Digital Operational Resilience Act)'
  };
  return names[framework] || framework;
};

// Export functions
export const exportToCSV = (
  filteredMappings: any[],
  selectedFrameworks: FrameworkSelection,
  selectedIndustrySector: string | null
) => {
  ComplianceExportService.exportToCSV(
    filteredMappings,
    selectedFrameworks,
    selectedIndustrySector
  );
};

export const exportToXLSX = async (
  filteredMappings: any[],
  selectedFrameworks: FrameworkSelection,
  selectedIndustrySector: string | null
) => {
  await ComplianceExportService.exportToXLSX(
    filteredMappings,
    selectedFrameworks,
    selectedIndustrySector
  );
};

export const exportToPDF = async (
  filteredMappings: any[],
  selectedFrameworks: FrameworkSelection,
  selectedIndustrySector: string | null
) => {
  await ComplianceExportService.exportToPDF(
    filteredMappings,
    selectedFrameworks,
    selectedIndustrySector
  );
};

// Guidance content loading function
export const loadGuidanceContentAsync = async (
  category: string,
  useActiveFrameworks: boolean = true,
  selectedFrameworks: FrameworkSelection,
  filteredUnifiedMappings: any[],
  selectedIndustrySector: string | null,
  setGuidanceContent: (content: string) => void
) => {
  try {
    const cleanCategory = category.replace(/^\d+\.\s*/, '');
    console.log(`[Guidance] Loading guidance for: "${cleanCategory}"`);
    
    // Find the current category mapping
    const currentMapping = filteredUnifiedMappings.find(m => 
      m.auditReadyUnified.title.includes(cleanCategory) || 
      m.category === cleanCategory ||
      m.auditReadyUnified.title === cleanCategory ||
      cleanCategory.includes(m.auditReadyUnified.title) ||
      m.auditReadyUnified.title.includes(cleanCategory.split(' ')[0])
    );

    if (currentMapping) {
      console.log(`[Guidance] Found mapping for ${cleanCategory}:`, currentMapping);
      
      const guidanceResult = await buildGuidanceFromUnifiedRequirements(
        cleanCategory,
        currentMapping,
        selectedFrameworks,
        selectedIndustrySector
      );
      
      if (guidanceResult) {
        console.log(`[Guidance] ✅ Generated guidance for ${cleanCategory}`);
        setGuidanceContent(guidanceResult);
        return;
      }
    }
    
    // If no guidance found, use fallback
    console.log(`[Guidance] ⚠️ No mapping found for ${cleanCategory}, using fallback`);
    const fallbackContent = getGuidanceContentFallback(cleanCategory);
    setGuidanceContent(fallbackContent);
  } catch (error) {
    console.error(`[Guidance] ❌ Error loading guidance for ${category}:`, error);
    setGuidanceContent(getGuidanceContentFallback(category));
  }
};

// Fallback guidance content
export const getGuidanceContentFallback = (cleanCategory: string): string => {
  return `**${cleanCategory} Implementation Guidance**

This section provides guidance for implementing ${cleanCategory} controls.

✅ **Review applicable standards** for specific requirements
✅ **Develop implementation plan** with clear timelines and responsibilities  
✅ **Implement monitoring and measurement** procedures
✅ **Regular reviews and improvements** based on effectiveness assessments

💡 **PRO TIP**: Align implementation efforts with business objectives and risk appetite to ensure sustainable and effective security controls.

*For detailed guidance specific to your selected frameworks, ensure AI services are properly configured.*
*Debug info logged to browser console for technical support*`;
};