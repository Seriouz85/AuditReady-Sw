/**
 * Compliance Simplification State Management
 * Consolidated from 20+ useState hooks in ComplianceSimplification.tsx
 * CRITICAL: Preserves ALL existing state behavior exactly
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types - EXACT preservation from original component
export interface SelectedFrameworks {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

// Complete state interface - consolidating all useState hooks
interface ComplianceSimplificationState {
  // Navigation and component state
  selectedMapping: string | null;
  activeTab: string;
  
  // Filter states
  filterFramework: string;
  filterCategory: string;
  unifiedCategoryFilter: string;
  
  // Industry and framework selection
  selectedIndustrySector: string | null;
  selectedFrameworks: SelectedFrameworks;
  
  // AI generation state
  isGenerating: boolean;
  showGeneration: boolean;
  
  // Modal states
  showUnifiedGuidance: boolean;
  selectedGuidanceCategory: string;
  showFrameworkReferences: boolean;
  showOperationalExcellence: boolean;
  
  // Content and progress
  generatedContent: Map<string, any[]>;
  
  // Actions to update state
  setSelectedMapping: (mapping: string | null) => void;
  setActiveTab: (tab: string) => void;
  setFilterFramework: (framework: string) => void;
  setFilterCategory: (category: string) => void;
  setUnifiedCategoryFilter: (filter: string) => void;
  setSelectedIndustrySector: (sector: string | null) => void;
  setSelectedFrameworks: (frameworks: SelectedFrameworks) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowGeneration: (show: boolean) => void;
  setShowUnifiedGuidance: (show: boolean) => void;
  setSelectedGuidanceCategory: (category: string) => void;
  setShowFrameworkReferences: (show: boolean) => void;
  setShowOperationalExcellence: (show: boolean) => void;
  setGeneratedContent: (content: Map<string, any[]>) => void;
  updateGeneratedContent: (key: string, value: any[]) => void;
  
  // Reset actions
  resetFilters: () => void;
  resetModals: () => void;
}

// Initial state values - EXACT preservation from original useState defaults
const initialState = {
  selectedMapping: null as string | null,
  activeTab: 'overview',
  filterFramework: 'all',
  filterCategory: 'all',
  unifiedCategoryFilter: 'all',
  selectedIndustrySector: null as string | null,
  selectedFrameworks: {
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3' as const,
    gdpr: false,
    nis2: false,
    dora: false
  },
  isGenerating: false,
  showGeneration: false,
  showUnifiedGuidance: false,
  selectedGuidanceCategory: '',
  showFrameworkReferences: false,
  showOperationalExcellence: false,
  generatedContent: new Map<string, any[]>()
};

// Zustand store with persistence for framework selection
export const useComplianceSimplificationStore = create<ComplianceSimplificationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // State setters - exact behavior preservation
      setSelectedMapping: (mapping) => set({ selectedMapping: mapping }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setFilterFramework: (framework) => set({ filterFramework: framework }),
      setFilterCategory: (category) => set({ filterCategory: category }),
      setUnifiedCategoryFilter: (filter) => set({ unifiedCategoryFilter: filter }),
      setSelectedIndustrySector: (sector) => set({ selectedIndustrySector: sector }),
      setSelectedFrameworks: (frameworks) => set({ selectedFrameworks: frameworks }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setShowGeneration: (show) => set({ showGeneration: show }),
      setShowUnifiedGuidance: (show) => set({ showUnifiedGuidance: show }),
      setSelectedGuidanceCategory: (category) => set({ selectedGuidanceCategory: category }),
      setShowFrameworkReferences: (show) => set({ showFrameworkReferences: show }),
      setShowOperationalExcellence: (show) => set({ showOperationalExcellence: show }),
      setGeneratedContent: (content) => set({ generatedContent: content }),
      
      // Update specific content in map
      updateGeneratedContent: (key, value) => {
        const currentContent = get().generatedContent;
        // Ensure we always have a proper Map
        const newContent = currentContent instanceof Map 
          ? new Map(currentContent) 
          : new Map();
        newContent.set(key, value);
        set({ generatedContent: newContent });
      },
      
      // Reset functions
      resetFilters: () => set({
        filterFramework: 'all',
        filterCategory: 'all',
        unifiedCategoryFilter: 'all'
      }),
      
      resetModals: () => set({
        showUnifiedGuidance: false,
        selectedGuidanceCategory: '',
        showFrameworkReferences: false,
        showOperationalExcellence: false
      })
    }),
    {
      name: 'compliance-simplification-store',
      // Only persist framework selection and preferences
      partialize: (state) => ({
        selectedFrameworks: state.selectedFrameworks,
        selectedIndustrySector: state.selectedIndustrySector
      }),
      // Ensure proper rehydration with fresh Map
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Always ensure generatedContent is a proper Map after rehydration
          state.generatedContent = new Map<string, any[]>();
        }
      }
    }
  )
);

// Helper hooks for specific state slices - maintains original useState pattern
export const useActiveTab = () => {
  const { activeTab, setActiveTab } = useComplianceSimplificationStore();
  return [activeTab, setActiveTab] as const;
};

export const useSelectedFrameworks = () => {
  const { selectedFrameworks, setSelectedFrameworks } = useComplianceSimplificationStore();
  return [selectedFrameworks, setSelectedFrameworks] as const;
};

export const useGeneratedContent = () => {
  const { generatedContent, setGeneratedContent, updateGeneratedContent } = useComplianceSimplificationStore();
  return [generatedContent, setGeneratedContent, updateGeneratedContent] as const;
};

export const useGenerationState = () => {
  const { isGenerating, setIsGenerating, showGeneration, setShowGeneration } = useComplianceSimplificationStore();
  return {
    isGenerating,
    setIsGenerating,
    showGeneration,
    setShowGeneration
  };
};

export const useGuidanceModal = () => {
  const { 
    showUnifiedGuidance, 
    setShowUnifiedGuidance,
    selectedGuidanceCategory,
    setSelectedGuidanceCategory,
    showFrameworkReferences,
    setShowFrameworkReferences
  } = useComplianceSimplificationStore();
  
  return {
    showUnifiedGuidance,
    setShowUnifiedGuidance,
    selectedGuidanceCategory,
    setSelectedGuidanceCategory,
    showFrameworkReferences,
    setShowFrameworkReferences
  };
};

export const useFilters = () => {
  const { 
    filterFramework, 
    setFilterFramework,
    filterCategory,
    setFilterCategory,
    unifiedCategoryFilter,
    setUnifiedCategoryFilter,
    resetFilters
  } = useComplianceSimplificationStore();
  
  return {
    filterFramework,
    setFilterFramework,
    filterCategory,
    setFilterCategory,
    unifiedCategoryFilter,
    setUnifiedCategoryFilter,
    resetFilters
  };
};