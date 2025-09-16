import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { complianceCacheService } from '@/services/compliance/ComplianceCacheService';
import { FrameworkFilterService } from '@/services/compliance/FrameworkFilterService';
import { validateAIEnvironment, getAIProviderInfo, shouldEnableAIByDefault } from '../utils/aiEnvironmentValidator';

export interface SelectedFrameworks {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

export interface ComplianceSimplificationState {
  selectedFrameworks: SelectedFrameworks;
  setSelectedFrameworks: React.Dispatch<React.SetStateAction<SelectedFrameworks>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  filterFramework: string;
  setFilterFramework: React.Dispatch<React.SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  unifiedCategoryFilter: string;
  setUnifiedCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedIndustrySector: string | null;
  setSelectedIndustrySector: React.Dispatch<React.SetStateAction<string | null>>;
  selectedMapping: string | null;
  setSelectedMapping: React.Dispatch<React.SetStateAction<string | null>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  showGeneration: boolean;
  setShowGeneration: React.Dispatch<React.SetStateAction<boolean>>;
  showUnifiedGuidance: boolean;
  setShowUnifiedGuidance: React.Dispatch<React.SetStateAction<boolean>>;
  selectedGuidanceCategory: string;
  setSelectedGuidanceCategory: React.Dispatch<React.SetStateAction<string>>;
  showFrameworkReferences: boolean;
  setShowFrameworkReferences: React.Dispatch<React.SetStateAction<boolean>>;
  showOperationalExcellence: boolean;
  setShowOperationalExcellence: React.Dispatch<React.SetStateAction<boolean>>;
  generatedContent: Map<string, any[]>;
  setGeneratedContent: React.Dispatch<React.SetStateAction<Map<string, any[]>>>;
}

/**
 * Custom hook for managing all ComplianceSimplification state
 */
export function useComplianceSimplificationState(): ComplianceSimplificationState {
  const [selectedFrameworks, setSelectedFrameworks] = useState<SelectedFrameworks>({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: false,
    nis2: false,
    dora: false
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [unifiedCategoryFilter, setUnifiedCategoryFilter] = useState('all');
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [showUnifiedGuidance, setShowUnifiedGuidance] = useState(false);
  const [selectedGuidanceCategory, setSelectedGuidanceCategory] = useState<string>('');
  const [showFrameworkReferences, setShowFrameworkReferences] = useState(false);
  const [showOperationalExcellence, setShowOperationalExcellence] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Map<string, any[]>>(new Map());

  return {
    selectedFrameworks,
    setSelectedFrameworks,
    activeTab,
    setActiveTab,
    filterFramework,
    setFilterFramework,
    filterCategory,
    setFilterCategory,
    unifiedCategoryFilter,
    setUnifiedCategoryFilter,
    selectedIndustrySector,
    setSelectedIndustrySector,
    selectedMapping,
    setSelectedMapping,
    isGenerating,
    setIsGenerating,
    showGeneration,
    setShowGeneration,
    showUnifiedGuidance,
    setShowUnifiedGuidance,
    selectedGuidanceCategory,
    setSelectedGuidanceCategory,
    showFrameworkReferences,
    setShowFrameworkReferences,
    showOperationalExcellence,
    setShowOperationalExcellence,
    generatedContent,
    setGeneratedContent,
  };
}

/**
 * Custom hook for AI environment validation and configuration
 */
export function useAIEnvironment() {
  const aiEnvironment = useMemo(() => validateAIEnvironment(), []);
  const aiProviderInfo = useMemo(() => getAIProviderInfo(aiEnvironment.provider), [aiEnvironment.provider]);
  const [useAIGuidance] = useState(shouldEnableAIByDefault());

  return {
    aiEnvironment,
    aiProviderInfo,
    useAIGuidance,
  };
}

/**
 * Custom hook for compliance data with caching management
 */
export function useComplianceDataWithCache() {
  const queryClient = useQueryClient();
  const { 
    data: complianceMappingData, 
    isLoading: isLoadingComplianceMapping, 
    error: complianceMappingError,
    refetch: refetchComplianceData 
  } = useComplianceMappingData();

  const { 
    data: maxComplianceMapping,
    isLoading: isLoadingMaxMapping,
    error: maxMappingError
  } = useComplianceMappingData(undefined, 'unlimited');

  const { 
    data: industrySectors, 
    isLoading: isLoadingIndustrySectors 
  } = useIndustrySectors();

  // Clear caches on mount to ensure fresh data
  useEffect(() => {
    console.log('[DEBUG] Clearing all caches on component mount...');
    queryClient.invalidateQueries({ predicate: () => true });
    queryClient.removeQueries({ predicate: () => true });
    complianceCacheService.clear('all');
  }, [queryClient]);

  // Force compliance data refetch on mount
  useEffect(() => {
    console.log('🚨 [COMPONENT MOUNT] Forcing compliance data refetch to bypass any caching...');
    refetchComplianceData();
  }, [refetchComplianceData]);

  // Debug logging for received data
  useEffect(() => {
    if (complianceMappingData) {
      console.log('[DEBUG] ComplianceSimplification received data from React Query:', {
        dataLength: complianceMappingData.length,
        governanceCategory: complianceMappingData.find(item => item.category === 'Governance & Leadership'),
        allCategories: complianceMappingData.map(item => item.category)
      });
    }
  }, [complianceMappingData]);

  return {
    complianceMappingData,
    maxComplianceMapping,
    industrySectors,
    isLoading: isLoadingComplianceMapping || isLoadingMaxMapping || isLoadingIndustrySectors,
    error: complianceMappingError || maxMappingError,
    refetchComplianceData,
    queryClient,
  };
}

/**
 * Custom hook for unified guidance content management
 */
export function useUnifiedGuidanceManagement(
  showUnifiedGuidance: boolean,
  selectedGuidanceCategory: string,
  selectedFrameworks: SelectedFrameworks,
  useAIGuidance: boolean
) {
  const [guidanceContent, setGuidanceContent] = useState<any>(null);

  const loadGuidanceContentAsync = async (category: string, useActiveFrameworks: boolean = true) => {
    try {
      console.log(`[GUIDANCE] Loading content for: ${category}`);
      
      // Simulate async content loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setGuidanceContent({
        category,
        frameworks: useActiveFrameworks ? selectedFrameworks : {},
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('[GUIDANCE] Error loading content:', error);
      setGuidanceContent(null);
    }
  };

  useEffect(() => {
    if (showUnifiedGuidance && selectedGuidanceCategory) {
      loadGuidanceContentAsync(selectedGuidanceCategory);
    }
  }, [showUnifiedGuidance, selectedGuidanceCategory, selectedFrameworks]);

  useEffect(() => {
    if (showUnifiedGuidance && useAIGuidance && selectedGuidanceCategory) {
      console.log(`[AI Guidance] Available for: ${selectedGuidanceCategory}. User can manually generate if desired.`);
    }
  }, [showUnifiedGuidance, useAIGuidance, selectedGuidanceCategory]);

  return {
    guidanceContent,
    loadGuidanceContentAsync,
  };
}

/**
 * Custom hook for filtered mappings computation
 */
export function useFilteredMappings(
  complianceMappingData: any[] | undefined,
  selectedFrameworks: SelectedFrameworks,
  filterFramework: string,
  filterCategory: string
) {
  const filteredMappings = useMemo(() => {
    let filtered = complianceMappingData || [];
    
    // Filter based on GDPR selection logic
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2'] && !selectedFrameworks['dora']) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'] || selectedFrameworks['dora'])) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'] || selectedFrameworks['dora'])) {
      // Mixed selection - show all relevant groups
      filtered = complianceMappingData || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Filter by framework selection
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || [],
            dora: []
          }
        };
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] && mapping.frameworks?.['iso27001'] ? mapping.frameworks['iso27001'] : [],
          iso27002: selectedFrameworks['iso27002'] && mapping.frameworks?.['iso27002'] ? mapping.frameworks['iso27002'] : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          gdpr: [], // Never show GDPR in non-GDPR groups
          cisControls: selectedFrameworks['cisControls'] && mapping.frameworks?.['cisControls'] ? mapping.frameworks['cisControls'] : [],
          dora: selectedFrameworks['dora'] ? (mapping.frameworks?.['dora'] || []) : []
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
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          case 'nis2':
            return (mapping.frameworks['nis2']?.length || 0) > 0;
          case 'dora':
            return (mapping.frameworks['dora']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(mapping => mapping.id === filterCategory);
    }
    
    // Apply dynamic numbering: GDPR always comes last
    const nonGdprGroups = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
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
  }, [complianceMappingData, selectedFrameworks, filterFramework, filterCategory]);

  const filteredUnifiedMappings = useMemo(() => {
    return filteredMappings.map(mapping => ({
      ...mapping,
      auditReadyUnified: FrameworkFilterService.filterUnifiedRequirement(
        mapping.auditReadyUnified,
        selectedFrameworks
      )
    }));
  }, [filteredMappings, selectedFrameworks]);

  return {
    filteredMappings,
    filteredUnifiedMappings,
  };
}

/**
 * Custom hook for category options computation
 */
export function useCategoryOptions(
  complianceMappingData: any[] | undefined,
  selectedFrameworks: SelectedFrameworks
) {
  return useMemo(() => {
    // Use the SAME data that's actually displayed, but without the category filter applied
    let baseFiltered = complianceMappingData || [];
    
    // Apply the SAME framework filtering logic as filteredMappings
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2'] && !selectedFrameworks['dora']) {
      // GDPR only - show only the unified GDPR group
      baseFiltered = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'] || selectedFrameworks['dora'])) {
      // Other frameworks without GDPR - show only non-GDPR groups
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Get unique categories with proper numbering
    const nonGdprGroups = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    // Number categories properly to match what's shown in the display
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      const categoryName = mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`;
      return {
        id: mapping.id,
        category: categoryName
      };
    });
    
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      const categoryName = mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`;
      return {
        id: mapping.id,
        category: categoryName
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [complianceMappingData, selectedFrameworks]);
}