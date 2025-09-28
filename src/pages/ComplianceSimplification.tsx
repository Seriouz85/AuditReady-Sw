import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FrameworkIdMapper } from '@/services/compliance/FrameworkIdMapper';
import { cleanUnifiedRequirementsEngine } from '@/services/compliance/CleanUnifiedRequirementsEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanMarkdownFormatting, cleanComplianceSubRequirement } from '@/utils/textFormatting';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import '../debug/RequirementExtractionTest';
import { 
  ArrowLeft, 
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Download,
  ChevronDown,
  FileText,
  Lightbulb,
  Users,
  BookOpen,
  Lock,
  Settings,
  Eye,
  Filter,
  Building2,
  Factory,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { supabase } from '@/lib/supabase';
import { complianceCacheService } from '@/services/compliance/ComplianceCacheService';
import { EnhancedUnifiedRequirementsGenerator } from '../services/compliance/EnhancedUnifiedRequirementsGenerator';
import { EnhancedUnifiedGuidanceService } from '../services/compliance/EnhancedUnifiedGuidanceService';
import { ComplianceSimplificationBusinessLogic } from '@/services/compliance/ComplianceSimplificationBusinessLogic';

// Mock missing services to prevent TypeScript errors
const ProfessionalGuidanceService = {
  formatFrameworkName: (name: string) => name,
  formatCategoryName: (name: string) => name,
  cleanText: (text: string) => text
};

import { validateAIEnvironment, getAIProviderInfo, shouldEnableAIByDefault } from '../utils/aiEnvironmentValidator';
import { AILoadingAnimation } from '@/components/compliance/AILoadingAnimation';
import RestructuringProgressAnimator, { CategoryProgress } from '@/components/compliance/RestructuringProgressAnimator';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { useFrameworkCounts } from '@/hooks/useFrameworkCounts';
import { useQueryClient } from '@tanstack/react-query';
import { FrameworkFilterService } from '@/services/compliance/FrameworkFilterService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// IMPORTED EXTRACTED COMPONENTS
import { ComplianceOverviewTab } from '@/components/compliance/ComplianceOverviewTab';
import { UnifiedRequirementsTab } from '@/components/compliance/UnifiedRequirementsTab';
import FrameworkMappingTab from '@/components/compliance/mapping/FrameworkMappingTab';
import { FrameworkOverlapTab } from '@/components/compliance/tabs/FrameworkOverlapTab';
import { TraceabilityMatrixTab } from '@/components/compliance/traceability/TraceabilityMatrixTab';
import { UnifiedGuidanceModal } from '@/components/compliance/modals/UnifiedGuidanceModal';
import { ComplianceExportService } from '@/services/compliance/export/ComplianceExportService';
import { 
  useComplianceSimplificationStore,
  useActiveTab,
  useSelectedFrameworks,
  useGeneratedContent,
  useGenerationState,
  useGuidanceModal,
  useFilters
} from '@/services/compliance/ComplianceSimplificationState';

// Type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function ComplianceSimplification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // USE STATE MANAGEMENT HOOKS
  const [activeTab, setActiveTab] = useActiveTab();
  const [selectedFrameworks, setSelectedFrameworks] = useSelectedFrameworks();
  const [generatedContent, setGeneratedContent, updateGeneratedContent] = useGeneratedContent();
  const { isGenerating, setIsGenerating, showGeneration, setShowGeneration } = useGenerationState();
  const { 
    showUnifiedGuidance, 
    setShowUnifiedGuidance,
    selectedGuidanceCategory,
    setSelectedGuidanceCategory,
    showFrameworkReferences,
    setShowFrameworkReferences
  } = useGuidanceModal();
  const {
    filterFramework,
    setFilterFramework,
    filterCategory,
    setFilterCategory,
    unifiedCategoryFilter,
    setUnifiedCategoryFilter
  } = useFilters();

  // REMAINING LOCAL STATE (only what's truly local to this component)
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  const [showOperationalExcellence, setShowOperationalExcellence] = useState(false);
  const [guidanceContent, setGuidanceContent] = useState<string>('');
  
  // Restructuring progress state
  const [showRestructuringProgress, setShowRestructuringProgress] = useState(false);
  const [restructuringCategories, setRestructuringCategories] = useState<CategoryProgress[]>([]);
  
  // Get dynamic framework counts from database
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  
  // Helper function to get framework badges for a mapping - using extracted service
  const getFrameworkBadges = (mapping: any) => {
    return ComplianceSimplificationBusinessLogic.getFrameworkBadges(mapping, selectedFrameworks);
  };

  // Function to generate dynamic content for a category - using extracted service
  const generateDynamicContentForCategory = async (categoryName: string): Promise<any[]> => {
    return ComplianceSimplificationBusinessLogic.generateDynamicContentForCategory(
      categoryName,
      filteredUnifiedMappings,
      selectedFrameworks
    );
  };

  // PRESERVE ALL EXISTING LOGIC - just use hooks instead of useState
  // Load mapping data and calculate statistics - pass selected frameworks to get dynamic data
  const { data: originalMappingData, isLoading, refetch: refetchComplianceData } = useComplianceMappingData(selectedFrameworks as unknown as Record<string, string | boolean>, selectedIndustrySector || undefined);
  
  // CRITICAL FIX: Use CleanUnifiedRequirementsEngine as fallback when database is empty
  const [mappingData, setMappingData] = useState<any[]>([]);
  
  useEffect(() => {
    const generateFallbackData = async () => {
      const result = await ComplianceSimplificationBusinessLogic.generateFallbackData(
        originalMappingData,
        selectedFrameworks
      );
      setMappingData(result);
    };
    
    generateFallbackData();
  }, [originalMappingData, selectedFrameworks]);
  
  // Fetch ALL frameworks data for maximum statistics calculation (overview tab)
  const allFrameworksSelection = {
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3', // Maximum coverage with IG3
    gdpr: true,
    nis2: true,
    dora: true
  };
  
  const { data: maxComplianceMapping } = useComplianceMappingData(allFrameworksSelection);
  const { data: industrySectors } = useIndustrySectors();

  // Filter mappings based on selected frameworks - using extracted service
  const filteredMappings = useMemo(() => {
    return ComplianceSimplificationBusinessLogic.filterMappings(
      mappingData,
      selectedFrameworks,
      filterFramework,
      filterCategory
    );
  }, [mappingData, selectedFrameworks, filterFramework, filterCategory]);

  // Create filtered unified mappings for the unified tab - using extracted service
  const filteredUnifiedMappings = useMemo(() => {
    return ComplianceSimplificationBusinessLogic.filterUnifiedMappings(filteredMappings);
  }, [filteredMappings]);

  console.log('[UNIFIED] Filtered unified mappings:', filteredUnifiedMappings.length);

  // Calculate MAXIMUM statistics for overview - using extracted service
  const maximumOverviewStats = useMemo(() => {
    return ComplianceSimplificationBusinessLogic.calculateMaximumOverviewStats(maxComplianceMapping || []);
  }, [maxComplianceMapping]);

  // Function to build guidance content from unified requirements - using extracted service
  const buildGuidanceFromUnifiedRequirements = async (category: string): Promise<string> => {
    return ComplianceSimplificationBusinessLogic.buildGuidanceFromUnifiedRequirements(
      category,
      filteredUnifiedMappings,
      selectedFrameworks,
      generatedContent
    );
  };

  // Export functions using the extracted service
  const exportToExcel = async () => {
    try {
      await ComplianceExportService.exportToExcel({
        filteredUnifiedMappings,
        selectedFrameworks,
        selectedIndustrySector,
        industrySectors
      });
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      await ComplianceExportService.exportToPDF({
        filteredUnifiedMappings,
        selectedFrameworks,
        selectedIndustrySector,
        industrySectors
      });
    } catch (error) {
      console.error('Export to PDF failed:', error);
    }
  };

  // Generate unified requirements function - using extracted service
  const generateUnifiedRequirements = async () => {
    await ComplianceSimplificationBusinessLogic.generateUnifiedRequirements(
      filteredMappings,
      selectedFrameworks,
      setIsGenerating,
      setShowGeneration,
      setGeneratedContent,
      setRestructuringCategories,
      setShowRestructuringProgress,
      queryClient,
      refetchComplianceData
    );
  };

  // AI Environment validation
  const aiEnvironment = validateAIEnvironment();
  const aiProviderInfo = getAIProviderInfo(aiEnvironment.provider);

  // Force data refetch on component mount to ensure fresh data
  useEffect(() => {
    console.log('[COMPONENT MOUNT] Forcing compliance data refetch to bypass any caching...');
    refetchComplianceData();
  }, []);

  // Effect to build guidance content when modal opens - PRESERVE EXACT LOGIC
  useEffect(() => {
    const buildGuidanceContent = async () => {
      if (showUnifiedGuidance && selectedGuidanceCategory) {
        try {
          const content = await buildGuidanceFromUnifiedRequirements(selectedGuidanceCategory);
          console.log(`[GUIDANCE] Built guidance for ${selectedGuidanceCategory}, length: ${content.length}`);
          setGuidanceContent(content);
        } catch (error) {
          console.error(`[GUIDANCE] Error building guidance for ${selectedGuidanceCategory}:`, error);
          setGuidanceContent('Error loading guidance content. Please try again.');
        }
      }
    };

    buildGuidanceContent();
  }, [showUnifiedGuidance, selectedGuidanceCategory, selectedFrameworks, generatedContent]);

  // Function to get guidance content for modal
  const getGuidanceContent = (): string => {
    return guidanceContent || 'Loading guidance content...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Compliance Simplification</h1>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">How AuditReady AI unifies overlapping compliance requirements</p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                  <span className="text-xs text-muted-foreground ml-auto">Enhanced</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-red-600" />
                  Export to PDF
                  <span className="text-xs text-muted-foreground ml-auto">Premium</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation - PRESERVE EXACT DESIGN */}
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span>Framework Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="unified" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Zap className="w-4 h-4" />
              <span>Unified Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="overlap" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Framework Overlap</span>
            </TabsTrigger>
            <TabsTrigger value="traceability" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <GitBranch className="w-4 h-4" />
              <span>Traceability Matrix</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - USE EXTRACTED COMPONENT */}
          <TabsContent value="overview">
            <ComplianceOverviewTab 
              maximumOverviewStats={maximumOverviewStats}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          {/* Unified Requirements Tab - USE EXTRACTED COMPONENT */}
          <TabsContent value="unified">
            <UnifiedRequirementsTab 
              filteredUnifiedMappings={filteredUnifiedMappings}
              selectedFrameworks={selectedFrameworks}
              selectedIndustrySector={selectedIndustrySector}
              unifiedCategoryFilter={unifiedCategoryFilter}
              setUnifiedCategoryFilter={setUnifiedCategoryFilter}
              restructuringCategories={restructuringCategories}
              generateDynamicContentForCategory={generateDynamicContentForCategory}
              setSelectedGuidanceCategory={setSelectedGuidanceCategory}
              setShowUnifiedGuidance={setShowUnifiedGuidance}
              generatedContent={generatedContent}
              showGeneration={showGeneration}
              isGenerating={isGenerating}
            />
          </TabsContent>

          {/* Framework Mapping Tab - USE EXTRACTED COMPONENT */}
          <TabsContent value="mapping">
            <FrameworkMappingTab 
              showGeneration={showGeneration}
              isGenerating={isGenerating}
              frameworksSelected={selectedFrameworks}
              handleFrameworkToggle={(framework: string, value: any) => {
                setSelectedFrameworks({
                  ...selectedFrameworks,
                  [framework]: value
                });
              }}
              frameworkCounts={frameworkCounts as unknown as Record<string, number> || {}}
              categoryMappings={filteredMappings}
              selectedFrameworks={selectedFrameworks}
              selectedMapping={selectedMapping}
              setSelectedMapping={setSelectedMapping}
              getFrameworkBadges={getFrameworkBadges}
              isLoadingCategoryMapping={isLoading}
              isLoadingCounts={isLoadingCounts}
              generateUnifiedRequirements={generateUnifiedRequirements}
              selectedIndustrySector={selectedIndustrySector}
              setSelectedIndustrySector={setSelectedIndustrySector}
              industrySectors={industrySectors}
              isLoadingSectors={false}
            />
          </TabsContent>

          {/* Framework Overlap Tab - USE EXTRACTED COMPONENT */}
          <TabsContent value="overlap">
            <FrameworkOverlapTab 
              selectedFrameworks={selectedFrameworks}
              filteredMappings={filteredMappings}
            />
          </TabsContent>

          {/* Traceability Matrix Tab - NEW COMPONENT */}
          <TabsContent value="traceability">
            <TraceabilityMatrixTab 
              selectedFrameworks={selectedFrameworks}
              filteredMappings={filteredMappings}
              onExport={(format) => {
                if (format === 'excel') {
                  exportToExcel();
                } else {
                  exportToPDF();
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Unified Guidance Modal - USE EXTRACTED COMPONENT */}
      <UnifiedGuidanceModal 
        open={showUnifiedGuidance}
        onOpenChange={setShowUnifiedGuidance}
        selectedGuidanceCategory={selectedGuidanceCategory}
        getGuidanceContent={getGuidanceContent}
        aiEnvironment={aiEnvironment}
        aiProviderInfo={aiProviderInfo}
      />

      {/* AI Restructuring Progress Animator - Compact Right Panel */}
      <RestructuringProgressAnimator
        categories={restructuringCategories}
        isVisible={showRestructuringProgress}
        isCompact={true} // Use compact right-side panel
        onComplete={() => {
          console.log('🎉 [RESTRUCTURING] Animation complete, hiding progress');
          setShowRestructuringProgress(false);
        }}
        onCancel={() => {
          console.log('❌ [RESTRUCTURING] User canceled, stopping generation');
          setShowRestructuringProgress(false);
          setIsGenerating(false);
        }}
        totalEstimatedTime={restructuringCategories.length * 5000} // 5 seconds per category
      />
    </div>
  );
}