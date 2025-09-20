/**
 * Framework Utilities for Compliance Simplification
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * CRITICAL: Preserves exact visual output and color schemes
 */

export interface SelectedFrameworks {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

export interface FrameworkBadge {
  name: string;
  color: string;
  variant: 'default' | 'secondary' | 'outline';
}

/**
 * Framework color schemes - EXACT preservation from original
 */
export const FRAMEWORK_COLORS = {
  iso27001: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  iso27002: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  cisControls: 'bg-green-500/20 text-green-300 border-green-500/30',
  gdpr: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  nis2: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  dora: 'bg-red-500/20 text-red-300 border-red-500/30',
} as const;

/**
 * Framework display names
 */
export const FRAMEWORK_NAMES = {
  iso27001: 'ISO 27001',
  iso27002: 'ISO 27002',
  cisControls: 'CIS',
  gdpr: 'GDPR',
  nis2: 'NIS2',
  dora: 'DORA',
} as const;

/**
 * Get framework badges for a mapping - EXACT extraction from original
 * Preserves all logic and visual styling exactly
 */
export function getFrameworkBadges(
  mapping: any,
  selectedFrameworks: SelectedFrameworks
): FrameworkBadge[] {
  const badges: FrameworkBadge[] = [];
  
  if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
    badges.push({ 
      name: FRAMEWORK_NAMES.iso27001, 
      color: FRAMEWORK_COLORS.iso27001, 
      variant: 'default' 
    });
  }
  
  if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
    badges.push({ 
      name: FRAMEWORK_NAMES.iso27002, 
      color: FRAMEWORK_COLORS.iso27002, 
      variant: 'default' 
    });
  }
  
  if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
    badges.push({ 
      name: `${FRAMEWORK_NAMES.cisControls} ${selectedFrameworks.cisControls.toUpperCase()}`, 
      color: FRAMEWORK_COLORS.cisControls, 
      variant: 'default' 
    });
  }
  
  if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
    badges.push({ 
      name: FRAMEWORK_NAMES.gdpr, 
      color: FRAMEWORK_COLORS.gdpr, 
      variant: 'default' 
    });
  }
  
  if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
    badges.push({ 
      name: FRAMEWORK_NAMES.nis2, 
      color: FRAMEWORK_COLORS.nis2, 
      variant: 'default' 
    });
  }
  
  if (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0) {
    badges.push({ 
      name: FRAMEWORK_NAMES.dora, 
      color: FRAMEWORK_COLORS.dora, 
      variant: 'default' 
    });
  }
  
  return badges;
}

/**
 * Check if a framework has controls in a mapping
 */
export function frameworkHasControls(
  mapping: any,
  framework: keyof SelectedFrameworks
): boolean {
  return (mapping.frameworks?.[framework]?.length || 0) > 0;
}

/**
 * Get framework count for a mapping
 */
export function getFrameworkCount(
  mapping: any,
  framework: keyof SelectedFrameworks
): number {
  return mapping.frameworks?.[framework]?.length || 0;
}

/**
 * Filter mappings by selected frameworks
 */
export function filterMappingsByFrameworks(
  mappings: any[],
  selectedFrameworks: SelectedFrameworks
): any[] {
  return mappings.map(mapping => {
    const newMapping = {
      ...mapping,
      frameworks: {
        iso27001: selectedFrameworks.iso27001 && mapping.frameworks?.iso27001 ? mapping.frameworks.iso27001 : [],
        iso27002: selectedFrameworks.iso27002 && mapping.frameworks?.iso27002 ? mapping.frameworks.iso27002 : [],
        nis2: selectedFrameworks.nis2 ? (mapping.frameworks?.nis2 || []) : [],
        gdpr: selectedFrameworks.gdpr ? (mapping.frameworks?.gdpr || []) : [],
        cisControls: selectedFrameworks.cisControls && mapping.frameworks?.cisControls ? mapping.frameworks.cisControls : [],
        dora: selectedFrameworks.dora ? (mapping.frameworks?.dora || []) : []
      }
    };
    
    // Only include the mapping if it has at least one framework with controls
    const hasControls = Object.values(newMapping.frameworks).some(
      (controls: any) => controls.length > 0
    );
    
    return hasControls ? newMapping : null;
  }).filter(mapping => mapping !== null);
}