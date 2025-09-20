/**
 * Governance & Leadership Special Handling Utilities
 * Extracted from ComplianceSimplification.tsx 
 * CRITICAL: Preserves EXACT infosec specialist approved logic
 * 
 * This utility centralizes all special handling for Governance & Leadership
 * that is scattered throughout the original file. Every check and condition
 * is preserved exactly to maintain the approved behavior.
 */

/**
 * Check if a category is Governance & Leadership - EXACT logic preservation
 * This function checks multiple ways the category might appear
 */
export function isGovernanceCategory(category: string | undefined): boolean {
  if (!category) return false;
  
  return category === 'Governance & Leadership' || 
         category.includes('Governance') ||
         category.toLowerCase().includes('governance');
}

/**
 * Find Governance & Leadership mapping - EXACT logic preservation
 */
export function findGovernanceMapping(mappings: any[]): any | undefined {
  return mappings.find(m => 
    m.auditReadyUnified?.title?.includes('Governance') || 
    m.category === 'Governance & Leadership'
  );
}

/**
 * Find Governance & Leadership data - EXACT logic preservation
 */
export function findGovernanceData(data: any[]): any | undefined {
  return data.find(item => item.category === 'Governance & Leadership');
}

/**
 * Check if item is Governance for special formatting - EXACT logic preservation
 */
export function isGovernanceItem(mapping: any): boolean {
  return mapping.category === 'Governance & Leadership' || 
         mapping.category?.includes('Governance');
}

/**
 * Log Governance category debug info - EXACT preservation
 */
export function logGovernanceDebug(mapping: any, index: number = 0): void {
  if (index === 0) {
    console.log('[CATEGORY DEBUG] Mapping category:', JSON.stringify(mapping.category));
    console.log('[CATEGORY DEBUG] Exact category match?', mapping.category === 'Governance & Leadership');
    console.log('[CATEGORY DEBUG] Category includes Governance?', mapping.category?.includes('Governance'));
    if (mapping.category?.includes('Governance')) {
      console.log('[GOVERNANCE DEBUG] First requirement received:', 
        mapping.auditReadyUnified?.subRequirements?.[0]?.substring(0, 200) || 'No requirements');
    }
  }
}

/**
 * Log Governance section grouping debug info - EXACT preservation
 */
export function logGovernanceSectionDebug(mapping: any): void {
  console.log('[SECTION GROUPING] Processing category:', mapping.category);
  console.log('[SECTION GROUPING] Is Governance?', mapping.category === 'Governance & Leadership');
  console.log('[SECTION CHECK] Category:', mapping.category, 'Is Governance:', isGovernanceCategory(mapping.category));
}

/**
 * Log Governance data loading debug info - EXACT preservation
 */
export function logGovernanceDataDebug(data: any[], governance: any): void {
  console.log('[DEBUG] ComplianceSimplification received data from React Query:', {
    dataLength: data.length,
    governanceCategory: findGovernanceData(data),
    allCategories: data.map(item => item.category)
  });
  
  if (governance) {
    console.log('[DEBUG] Governance & Leadership data loaded successfully with', 
      governance.auditReadyUnified?.subRequirements?.length || 0, 'unified requirements');
  } else {
    console.log('🚨 [UI DEBUG] NO Governance & Leadership found in fetchedComplianceMapping!');
    console.log('🚨 [UI DEBUG] Available categories:', data.map(item => item.category));
  }
}

/**
 * Special Governance & Leadership section organization constants
 * EXACT preservation of the THREE sections with PROPER organization
 */
export const GOVERNANCE_SECTIONS = {
  CORE_REQUIREMENTS: 'Core Requirements',
  HR: 'HR',
  MONITORING_COMPLIANCE: 'Monitoring & Compliance'
} as const;

/**
 * Check for Personnel Security requirement - EXACT preservation
 */
export function findPersonnelSecurityRequirement(enhancedSubReqs: string[]): string | undefined {
  return enhancedSubReqs.find(req => req.includes('PERSONNEL SECURITY'));
}

/**
 * Governance special path indicator
 */
export const GOVERNANCE_SPECIAL_PATH_COMMENT = 'GOVERNANCE SPECIAL PATH: Inject mapped requirements while preserving structure';

/**
 * Constants for Governance category identification
 */
export const GOVERNANCE_IDENTIFIERS = {
  EXACT_NAME: 'Governance & Leadership',
  INCLUDES_GOVERNANCE: 'Governance',
  LOWERCASE_GOVERNANCE: 'governance'
} as const;

/**
 * Get all possible Governance category checks for consistent usage
 */
export function getGovernanceCategoryChecks(category: string) {
  return {
    exactMatch: category === GOVERNANCE_IDENTIFIERS.EXACT_NAME,
    includesGovernance: category?.includes(GOVERNANCE_IDENTIFIERS.INCLUDES_GOVERNANCE),
    lowercaseIncludes: category?.toLowerCase().includes(GOVERNANCE_IDENTIFIERS.LOWERCASE_GOVERNANCE),
    isGovernance: isGovernanceCategory(category)
  };
}