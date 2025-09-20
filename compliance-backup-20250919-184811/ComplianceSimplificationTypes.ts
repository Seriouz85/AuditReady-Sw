// Shared types for Compliance Simplification components

export interface FrameworkSelection {
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

export interface ComplianceMapping {
  id: string;
  category: string;
  auditReadyUnified: {
    title: string;
    description: string;
    sections?: string[];
  };
  frameworks?: {
    [key: string]: any[];
  };
}

export interface OverviewStats {
  maxRequirements: number;
  unifiedGroups: number;
  reduction: number;
  reductionPercentage: string;
  efficiencyRatio: number;
}

export interface ComplianceSimplificationProps {
  selectedFrameworks: FrameworkSelection;
  setSelectedFrameworks: (frameworks: FrameworkSelection) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filterFramework: string;
  setFilterFramework: (framework: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  unifiedCategoryFilter: string;
  setUnifiedCategoryFilter: (filter: string) => void;
  selectedIndustrySector: string | null;
  setSelectedIndustrySector: (sector: string | null) => void;
  selectedMapping: string | null;
  setSelectedMapping: (mapping: string | null) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  showGeneration: boolean;
  setShowGeneration: (show: boolean) => void;
  showUnifiedGuidance: boolean;
  setShowUnifiedGuidance: (show: boolean) => void;
  selectedGuidanceCategory: string;
  setSelectedGuidanceCategory: (category: string) => void;
  showFrameworkReferences: boolean;
  setShowFrameworkReferences: (show: boolean) => void;
  showOperationalExcellence: boolean;
  setShowOperationalExcellence: (show: boolean) => void;
  generatedContent: Map<string, any[]>;
  setGeneratedContent: (content: Map<string, any[]>) => void;
}

export interface HeaderProps {
  onNavigateBack: () => void;
  onExportCSV: () => void;
  onExportXLSX: () => void;
  onExportPDF: () => void;
}

export interface OverviewTabProps extends Pick<ComplianceSimplificationProps, 
  'selectedFrameworks' | 'setSelectedFrameworks' | 'selectedIndustrySector' | 'setSelectedIndustrySector'> {
  frameworkCounts: any;
  isLoadingCounts: boolean;
  maximumOverviewStats: OverviewStats;
  filteredMappings: ComplianceMapping[];
  getFrameworkBadges: (mapping: any) => FrameworkBadge[];
}

export interface MappingTabProps extends Pick<ComplianceSimplificationProps,
  'selectedFrameworks' | 'filterFramework' | 'setFilterFramework' | 'filterCategory' | 'setFilterCategory' | 'selectedMapping' | 'setSelectedMapping'> {
  filteredMappings: ComplianceMapping[];
  categoryOptions: ComplianceMapping[];
  getFrameworkBadges: (mapping: any) => FrameworkBadge[];
}

export interface UnifiedTabProps extends Pick<ComplianceSimplificationProps,
  'selectedFrameworks' | 'unifiedCategoryFilter' | 'setUnifiedCategoryFilter' | 'isGenerating' | 'setIsGenerating' | 
  'showGeneration' | 'setShowGeneration' | 'showUnifiedGuidance' | 'setShowUnifiedGuidance' | 'selectedGuidanceCategory' | 
  'setSelectedGuidanceCategory' | 'showFrameworkReferences' | 'setShowFrameworkReferences' | 'showOperationalExcellence' | 
  'setShowOperationalExcellence' | 'generatedContent' | 'setGeneratedContent'> {
  filteredUnifiedMappings: ComplianceMapping[];
  generateDynamicContentForCategory: (categoryName: string) => Promise<any[]>;
}

export interface OverlapTabProps extends Pick<ComplianceSimplificationProps, 'selectedFrameworks'> {
  filteredMappings: ComplianceMapping[];
}