import { SelectedFrameworks } from '@/hooks/ComplianceSimplificationHooks';

export interface OverviewStats {
  maxRequirements: number;
  unifiedGroups: number;
  reduction: number;
  efficiency: number;
}

export interface DynamicOverviewStats {
  selectedRequirements: number;
  unifiedGroups: number;
  reduction: number;
  efficiency: number;
}

/**
 * Service for performing calculations and data processing for compliance simplification
 */
export class ComplianceCalculationService {
  
  /**
   * Calculate maximum overview statistics from compliance mapping data
   */
  static calculateMaximumOverviewStats(maxComplianceMapping: any[] | undefined): OverviewStats {
    if (!maxComplianceMapping || maxComplianceMapping.length === 0) {
      return {
        maxRequirements: 310, // Actual maximum from database
        unifiedGroups: 21,
        reduction: 289,
        efficiency: 93.2
      };
    }

    const maxRequirements = maxComplianceMapping.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
      const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
      const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
      const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
      const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
      const doraCount = mapping.frameworks?.['dora']?.length || 0;
      
      return total + Math.max(iso27001Count, iso27002Count, cisControlsCount, gdprCount, nis2Count, doraCount);
    }, 0);

    const unifiedGroups = maxComplianceMapping.length;
    const reduction = Math.max(0, maxRequirements - unifiedGroups);
    const efficiency = maxRequirements > 0 ? (reduction / maxRequirements) * 100 : 0;

    return {
      maxRequirements,
      unifiedGroups,
      reduction,
      efficiency: Number(efficiency.toFixed(1))
    };
  }

  /**
   * Calculate dynamic overview statistics based on selected frameworks
   */
  static calculateDynamicOverviewStats(
    filteredMappings: any[],
    selectedFrameworks: SelectedFrameworks
  ): DynamicOverviewStats {
    const selectedRequirements = filteredMappings.reduce((total, mapping) => {
      let maxCount = 0;
      
      if (selectedFrameworks.iso27001) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['iso27001']?.length || 0);
      }
      if (selectedFrameworks.iso27002) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['iso27002']?.length || 0);
      }
      if (selectedFrameworks.cisControls) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['cisControls']?.length || 0);
      }
      if (selectedFrameworks.gdpr) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['gdpr']?.length || 0);
      }
      if (selectedFrameworks.nis2) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['nis2']?.length || 0);
      }
      if (selectedFrameworks.dora) {
        maxCount = Math.max(maxCount, mapping.frameworks?.['dora']?.length || 0);
      }
      
      return total + maxCount;
    }, 0);

    const unifiedGroups = filteredMappings.filter(mapping => {
      const hasSelectedFrameworkContent = 
        (selectedFrameworks.iso27001 && mapping.frameworks?.['iso27001']?.length > 0) ||
        (selectedFrameworks.iso27002 && mapping.frameworks?.['iso27002']?.length > 0) ||
        (selectedFrameworks.cisControls && mapping.frameworks?.['cisControls']?.length > 0) ||
        (selectedFrameworks.gdpr && mapping.frameworks?.['gdpr']?.length > 0) ||
        (selectedFrameworks.nis2 && mapping.frameworks?.['nis2']?.length > 0) ||
        (selectedFrameworks.dora && mapping.frameworks?.['dora']?.length > 0);
      
      return hasSelectedFrameworkContent;
    }).length;

    const reduction = Math.max(0, selectedRequirements - unifiedGroups);
    const efficiency = selectedRequirements > 0 ? (reduction / selectedRequirements) * 100 : 0;

    return {
      selectedRequirements,
      unifiedGroups,
      reduction,
      efficiency: Number(efficiency.toFixed(1))
    };
  }

  /**
   * Calculate framework badge information for a mapping
   */
  static getFrameworkBadges(mapping: any, selectedFrameworks: SelectedFrameworks) {
    const badges: { name: string; color: string; variant: 'default' | 'secondary' | 'outline' }[] = [];
    
    if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
      badges.push({ name: 'ISO 27001', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', variant: 'default' });
    }
    if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
      badges.push({ name: 'ISO 27002', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', variant: 'default' });
    }
    if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
      badges.push({ name: `CIS ${selectedFrameworks.cisControls.toUpperCase()}`, color: 'bg-green-500/20 text-green-300 border-green-500/30', variant: 'default' });
    }
    if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
      badges.push({ name: 'GDPR', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', variant: 'default' });
    }
    if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
      badges.push({ name: 'NIS2', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', variant: 'default' });
    }
    if (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0) {
      badges.push({ name: 'DORA', color: 'bg-red-500/20 text-red-300 border-red-500/30', variant: 'default' });
    }
    
    return badges;
  }

  /**
   * Convert selected frameworks object to array format for generators
   */
  static convertSelectedFrameworksToArray(selectedFrameworks: SelectedFrameworks): string[] {
    const frameworks: string[] = [];
    
    if (selectedFrameworks.iso27001) frameworks.push('iso27001');
    if (selectedFrameworks.iso27002) frameworks.push('iso27002');
    if (selectedFrameworks.cisControls) frameworks.push('cisControls');
    if (selectedFrameworks.gdpr) frameworks.push('gdpr');
    if (selectedFrameworks.nis2) frameworks.push('nis2');
    if (selectedFrameworks.dora) frameworks.push('dora');
    
    return frameworks;
  }

  /**
   * Generate cache key for content based on category and selected frameworks
   */
  static generateCacheKey(categoryName: string, selectedFrameworks: SelectedFrameworks): string {
    const frameworkArray = this.convertSelectedFrameworksToArray(selectedFrameworks);
    return `fixed-content-${categoryName}-${frameworkArray.sort().join('-')}-${selectedFrameworks.cisControls || 'all'}`;
  }

  /**
   * Check if any frameworks are selected
   */
  static hasSelectedFrameworks(selectedFrameworks: SelectedFrameworks): boolean {
    return selectedFrameworks.iso27001 || 
           selectedFrameworks.iso27002 || 
           !!selectedFrameworks.cisControls || 
           selectedFrameworks.gdpr || 
           selectedFrameworks.nis2 || 
           selectedFrameworks.dora;
  }

  /**
   * Count total requirements across all selected frameworks for a mapping
   */
  static countMappingRequirements(mapping: any, selectedFrameworks: SelectedFrameworks): number {
    let total = 0;
    
    if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001) {
      total += mapping.frameworks.iso27001.length;
    }
    if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002) {
      total += mapping.frameworks.iso27002.length;
    }
    if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls) {
      total += mapping.frameworks.cisControls.length;
    }
    if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr) {
      total += mapping.frameworks.gdpr.length;
    }
    if (selectedFrameworks.nis2 && mapping.frameworks?.nis2) {
      total += mapping.frameworks.nis2.length;
    }
    if (selectedFrameworks.dora && mapping.frameworks?.dora) {
      total += mapping.frameworks.dora.length;
    }
    
    return total;
  }

  /**
   * Get all governance requirements from mappings for special governance processing
   */
  static getGovernanceRequirements(
    filteredUnifiedMappings: any[],
    selectedFrameworks: SelectedFrameworks
  ): any[] {
    const allGovernanceRequirements: any[] = [];
    
    const currentMapping = filteredUnifiedMappings.find(m => 
      m.auditReadyUnified.title.includes('Governance') || 
      m.category === 'Governance & Leadership'
    );
    
    if (currentMapping?.frameworks) {
      // Collect ALL mapped requirements from selected frameworks
      if (selectedFrameworks.iso27001 && currentMapping.frameworks.iso27001) {
        allGovernanceRequirements.push(...currentMapping.frameworks.iso27001.map((req: any) => ({ 
          ...req, 
          framework: 'ISO/IEC 27001' 
        })));
      }
      if (selectedFrameworks.iso27002 && currentMapping.frameworks.iso27002) {
        allGovernanceRequirements.push(...currentMapping.frameworks.iso27002.map((req: any) => ({ 
          ...req, 
          framework: 'ISO/IEC 27002' 
        })));
      }
      if (selectedFrameworks.cisControls && currentMapping.frameworks.cisControls) {
        allGovernanceRequirements.push(...currentMapping.frameworks.cisControls.map((req: any) => ({ 
          ...req, 
          framework: 'CIS Controls v8' 
        })));
      }
      if (selectedFrameworks.gdpr && currentMapping.frameworks.gdpr) {
        allGovernanceRequirements.push(...currentMapping.frameworks.gdpr.map((req: any) => ({ 
          ...req, 
          framework: 'GDPR' 
        })));
      }
      if (selectedFrameworks.nis2 && currentMapping.frameworks.nis2) {
        allGovernanceRequirements.push(...currentMapping.frameworks.nis2.map((req: any) => ({ 
          ...req, 
          framework: 'NIS2 Directive' 
        })));
      }
      if (selectedFrameworks.dora && currentMapping.frameworks.dora) {
        allGovernanceRequirements.push(...currentMapping.frameworks.dora.map((req: any) => ({ 
          ...req, 
          framework: 'DORA (Digital Operational Resilience Act)' 
        })));
      }
    }
    
    return allGovernanceRequirements;
  }

  /**
   * Apply category numbering logic (GDPR always comes last)
   */
  static applyDynamicNumbering(mappings: any[]): any[] {
    const nonGdprGroups = mappings.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = mappings.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }

  /**
   * Filter mappings based on framework requirements
   */
  static filterMappingsByFramework(
    mappings: any[],
    selectedFrameworks: SelectedFrameworks
  ): any[] {
    return mappings.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks.gdpr) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.gdpr || [],
            dora: []
          }
        };
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks.iso27001 && mapping.frameworks?.iso27001 ? mapping.frameworks.iso27001 : [],
          iso27002: selectedFrameworks.iso27002 && mapping.frameworks?.iso27002 ? mapping.frameworks.iso27002 : [],
          nis2: selectedFrameworks.nis2 ? (mapping.frameworks?.nis2 || []) : [],
          gdpr: [], // Never show GDPR in non-GDPR groups
          cisControls: selectedFrameworks.cisControls && mapping.frameworks?.cisControls ? mapping.frameworks.cisControls : [],
          dora: selectedFrameworks.dora ? (mapping.frameworks?.dora || []) : []
        }
      };
      
      // Only include the mapping if it has at least one framework with controls
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0 ||
                         (newMapping.frameworks?.dora?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
  }

  /**
   * Apply traditional framework filter for backwards compatibility
   */
  static applyTraditionalFrameworkFilter(mappings: any[], filterFramework: string): any[] {
    if (filterFramework === 'all') return mappings;
    
    return mappings.filter(mapping => {
      switch (filterFramework) {
        case 'iso27001':
          return (mapping.frameworks?.iso27001?.length || 0) > 0;
        case 'iso27002':
          return (mapping.frameworks?.iso27002?.length || 0) > 0;
        case 'cis':
          return (mapping.frameworks?.cisControls?.length || 0) > 0;
        case 'gdpr':
          return (mapping.frameworks?.gdpr?.length || 0) > 0;
        case 'nis2':
          return (mapping.frameworks?.nis2?.length || 0) > 0;
        case 'dora':
          return (mapping.frameworks?.dora?.length || 0) > 0;
        default:
          return true;
      }
    });
  }

  /**
   * Apply category filter
   */
  static applyCategoryFilter(mappings: any[], filterCategory: string): any[] {
    if (filterCategory === 'all') return mappings;
    return mappings.filter(mapping => mapping.id === filterCategory);
  }
}