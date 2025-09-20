import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Mock missing services to prevent TypeScript errors
const ProfessionalGuidanceService = {
  formatFrameworkName: (name: string) => name,
  formatCategoryName: (name: string) => name,
  cleanText: (text: string) => text
};

import { validateAIEnvironment, getAIProviderInfo, shouldEnableAIByDefault } from '../utils/aiEnvironmentValidator';
import { AILoadingAnimation } from '@/components/compliance/AILoadingAnimation';
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
  
  // Get dynamic framework counts from database
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  
  // Initialize generator
  const enhancedGenerator = new EnhancedUnifiedRequirementsGenerator();
  
  // Helper function to get framework badges for a mapping
  const getFrameworkBadges = (mapping: any) => {
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
  };

  // Function to generate dynamic content for a category - PRESERVE EXACT LOGIC
  const generateDynamicContentForCategory = async (categoryName: string): Promise<any[]> => {
    const startTime = Date.now();
    try {
      console.log('[TEMPLATE-SYSTEM] Generating content for:', categoryName);
      
      // Fast cache lookup with framework and CIS version
      const selectedFrameworkArray: string[] = [];
      if (selectedFrameworks.iso27001) selectedFrameworkArray.push('iso27001');
      if (selectedFrameworks.iso27002) selectedFrameworkArray.push('iso27002');
      if (selectedFrameworks.cisControls) selectedFrameworkArray.push('cisControls');
      if (selectedFrameworks.gdpr) selectedFrameworkArray.push('gdpr');
      if (selectedFrameworks.nis2) selectedFrameworkArray.push('nis2');
      if (selectedFrameworks.dora) selectedFrameworkArray.push('dora');

      const cacheKey = `template-content-${categoryName}-${selectedFrameworkArray.sort().join('-')}-${selectedFrameworks.cisControls || 'all'}`;
      
      console.log('[CACHE] Checking cache for key:', cacheKey);
      const cachedContent = complianceCacheService.get(cacheKey);
      if (cachedContent) {
        console.log('[CACHE HIT] Returning cached content for:', categoryName, 'in', Date.now() - startTime, 'ms');
        return cachedContent as any[];
      }

      console.log('[CACHE MISS] Generating fresh content for:', categoryName);

      // Find the mapping for this category
      const currentMapping = filteredUnifiedMappings.find(m => 
        m.category === categoryName || 
        m.category.replace(/^\d+\. /, '') === categoryName ||
        m.category.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(m.category.toLowerCase().replace(/^\d+\. /, ''))
      );

      if (!currentMapping) {
        console.warn('[NO MAPPING] No mapping found for category:', categoryName);
        return [];
      }

      console.log('[MAPPING FOUND]', currentMapping.category, '-> Processing with template system...');

      // Use new template system via bridge
      const { UnifiedRequirementsBridge } = await import('@/services/compliance/UnifiedRequirementsBridge');
      
      const templateContent = await UnifiedRequirementsBridge.generateUnifiedRequirementsForCategory(
        currentMapping,
        selectedFrameworks
      );

      // Cache the results for 1 hour
      if (templateContent.length > 0) {
        complianceCacheService.set(cacheKey, templateContent, { ttl: 3600000 });
        console.log('[CACHE SET] Cached template content for:', categoryName);
      }

      console.log('[TEMPLATE GENERATED] Generated', templateContent.length, 'items for', categoryName, 'in', Date.now() - startTime, 'ms');
      return templateContent;

    } catch (error) {
      console.error('[TEMPLATE ERROR] Error generating template content for', categoryName, ':', error);
      
      // Fallback to basic content
      return [
        `**${categoryName} Requirements**`,
        `Professional unified requirements for ${categoryName.toLowerCase()} based on your selected frameworks.`,
        '',
        'a) **Foundation Requirements** - Establish baseline security controls',
        'b) **Implementation Standards** - Deploy technical safeguards', 
        'c) **Monitoring & Validation** - Continuous oversight and measurement',
        'd) **Compliance & Reporting** - Documentation and regulatory alignment'
      ];
    }
  };

  // PRESERVE ALL EXISTING LOGIC - just use hooks instead of useState
  // Load mapping data and calculate statistics - pass selected frameworks to get dynamic data
  const { data: mappingData, isLoading, refetch: refetchComplianceData } = useComplianceMappingData(selectedFrameworks as unknown as Record<string, string | boolean>, selectedIndustrySector || undefined);
  
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

  // Filter mappings based on selected frameworks
  const filteredMappings = useMemo(() => {
    if (!mappingData || mappingData.length === 0) {
      console.log('[FILTER] No mapping data available');
      return [];
    }

    console.log('[FILTER] Original mapping data length:', mappingData.length);
    console.log('[FILTER] Selected frameworks:', selectedFrameworks);

    const filtered = mappingData.filter((mapping: any) => {
      // Basic mapping validation
      if (!mapping.frameworks) {
        console.log('[FILTER] No frameworks in mapping:', mapping.id);
        return false;
      }

      // Check for at least one selected framework with requirements
      const hasSelectedFramework = (
        (selectedFrameworks.iso27001 && mapping.frameworks.iso27001?.length > 0) ||
        (selectedFrameworks.iso27002 && mapping.frameworks.iso27002?.length > 0) ||
        (selectedFrameworks.cisControls && mapping.frameworks.cisControls?.length > 0) ||
        (selectedFrameworks.gdpr && mapping.frameworks.gdpr?.length > 0) ||
        (selectedFrameworks.nis2 && mapping.frameworks.nis2?.length > 0) ||
        (selectedFrameworks.dora && mapping.frameworks.dora?.length > 0)
      );

      if (!hasSelectedFramework) {
        return false;
      }

      // Apply additional filters
      const matchesFrameworkFilter = filterFramework === 'all' || 
        (filterFramework === 'iso27001' && mapping.frameworks.iso27001?.length > 0) ||
        (filterFramework === 'iso27002' && mapping.frameworks.iso27002?.length > 0) ||
        (filterFramework === 'cisControls' && mapping.frameworks.cisControls?.length > 0) ||
        (filterFramework === 'gdpr' && mapping.frameworks.gdpr?.length > 0) ||
        (filterFramework === 'nis2' && mapping.frameworks.nis2?.length > 0) ||
        (filterFramework === 'dora' && mapping.frameworks.dora?.length > 0);

      const matchesCategoryFilter = filterCategory === 'all' || 
        mapping.category.toLowerCase().includes(filterCategory.toLowerCase());

      return matchesFrameworkFilter && matchesCategoryFilter;
    });

    console.log('[FILTER] Filtered mappings length:', filtered.length);
    return filtered;
  }, [mappingData, selectedFrameworks, filterFramework, filterCategory]);

  // Create filtered unified mappings for the unified tab
  const filteredUnifiedMappings = useMemo(() => {
    return filteredMappings.filter((mapping: any) => {
      // Show only mappings that have auditReadyUnified content
      return mapping.auditReadyUnified && 
             (mapping.auditReadyUnified.subRequirements?.length > 0 || 
              mapping.auditReadyUnified.description);
    });
  }, [filteredMappings]);

  console.log('[UNIFIED] Filtered unified mappings:', filteredUnifiedMappings.length);

  // Calculate MAXIMUM statistics for overview (ALL frameworks selected)
  const maximumOverviewStats = useMemo(() => {
    if (!maxComplianceMapping || maxComplianceMapping.length === 0) {
      return {
        maxRequirements: 310, // Actual maximum from database
        unifiedGroups: 21,
        reduction: 289,
        reductionPercentage: '93.2',
        efficiencyRatio: 15
      };
    }
    
    // Calculate with ALL frameworks selected
    const allFrameworksData = maxComplianceMapping || [];
    
    // Filter to ensure we have all groups (including GDPR)
    const processedData = allFrameworksData.filter(mapping => {
      const hasAnyFramework = 
        (mapping.frameworks?.['iso27001']?.length || 0) > 0 ||
        (mapping.frameworks?.['iso27002']?.length || 0) > 0 ||
        (mapping.frameworks?.['cisControls']?.length || 0) > 0 ||
        (mapping.frameworks?.['gdpr']?.length || 0) > 0 ||
        (mapping.frameworks?.['nis2']?.length || 0) > 0 ||
        (mapping.frameworks?.['dora']?.length || 0) > 0;
      return hasAnyFramework;
    });
    
    // Calculate total requirements across ALL frameworks
    const totalRequirements = processedData.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
      const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
      const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
      const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
      const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
      const doraCount = mapping.frameworks?.['dora']?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count + doraCount;
    }, 0);
    
    const unifiedGroups = processedData.length;
    const reduction = totalRequirements - unifiedGroups;
    const reductionPercentage = totalRequirements > 0 ? ((reduction / totalRequirements) * 100).toFixed(1) : '0.0';
    const efficiencyRatio = unifiedGroups > 0 ? Math.round(totalRequirements / unifiedGroups) : 0;
    
    return {
      maxRequirements: totalRequirements,
      unifiedGroups,
      reduction,
      reductionPercentage,
      efficiencyRatio
    };
  }, [maxComplianceMapping]);

  // Function to build guidance content from unified requirements - PRESERVE EXACT LOGIC
  const buildGuidanceFromUnifiedRequirements = async (
    category: string
  ): Promise<string> => {
    try {
      console.log(`[Unified Guidance Debug] Building guidance for: ${category}`);
      
      if (!category || typeof category !== 'string') {
        console.warn(`[Unified Guidance Debug] Empty category name provided`);
        return '';
      }

      const categoryMapping = filteredUnifiedMappings.find(m => m.category.replace(/^\d+\. /, '') === category);
      if (!categoryMapping) {
        console.warn(`[Unified Guidance Debug] No category mapping found for: "${category}"`);
        return '';
      }

      // Use the new dynamic guidance generator instead of hardcoded content
      try {
        console.log(`[Unified Guidance Debug] Using EnhancedUnifiedGuidanceService for: ${category}`);
        
        // Generate comprehensive guidance content using EnhancedUnifiedGuidanceService
        const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
          category,
          selectedFrameworks as unknown as Record<string, string | boolean>,
          categoryMapping
        );

        if (guidanceContent) {
          console.log(`[Unified Guidance Debug] Successfully generated guidance for ${category}, length: ${guidanceContent.length}`);
          return guidanceContent;
        }
      } catch (error) {
        console.error(`[Unified Guidance Debug] Error generating guidance for ${category}:`, error);
      }

      if (!categoryMapping.auditReadyUnified?.subRequirements?.length) {
        console.warn(`[Unified Guidance Debug] No unified requirements found for: ${category}`, categoryMapping);
        return '';
      }

      // Fallback to basic requirements if guidance service fails
      console.log(`[Unified Guidance Debug] Building guidance for: ${category}`, {
        hasMapping: !!categoryMapping,
        subRequirementsCount: categoryMapping.auditReadyUnified?.subRequirements?.length || 0
      });

      // Return basic guidance based on requirements
      return categoryMapping.auditReadyUnified.subRequirements
        .map((req: any) => `${req.title}: ${req.description}`)
        .join('\n\n');

    } catch (error) {
      console.error(`[Unified Guidance Debug] Error in buildGuidanceFromUnifiedRequirements:`, error);
      return '';
    }
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

  // Generate unified requirements function - MATCH GITHUB LOGIC
  const generateUnifiedRequirements = async () => {
    try {
      console.log('[GENERATE] Starting unified requirements generation...');
      setIsGenerating(true);
      setShowGeneration(true);
      
      // Force invalidate React Query cache to ensure fresh data including unified categories
      queryClient.invalidateQueries({ queryKey: ['compliance-mapping-data'] });
      queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'compliance-mapping-data' });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'unified-categories' });
      
      // Also clear internal compliance cache
      complianceCacheService.clear('all');
      
      // Force clear any guidance content cache
      complianceCacheService.clear('memory');
      
      // Force refetch compliance data to get updated categories
      await refetchComplianceData();
      
      // Convert selected frameworks to array format
      const selectedFrameworkArray: string[] = [];
      if (selectedFrameworks.iso27001) selectedFrameworkArray.push('iso27001');
      if (selectedFrameworks.iso27002) selectedFrameworkArray.push('iso27002');
      if (selectedFrameworks.cisControls) selectedFrameworkArray.push('cisControls');
      if (selectedFrameworks.gdpr) selectedFrameworkArray.push('gdpr');
      if (selectedFrameworks.nis2) selectedFrameworkArray.push('nis2');
      if (selectedFrameworks.dora) selectedFrameworkArray.push('dora');

      // Generate using the new template system
      const { UnifiedRequirementsBridge } = await import('@/services/compliance/UnifiedRequirementsBridge');
      
      const result = await UnifiedRequirementsBridge.generateForAllCategories(
        filteredMappings,
        selectedFrameworks
      );

      if (result && result.size > 0) {
        const stats = UnifiedRequirementsBridge.getGenerationStats(result);
        console.log('[GENERATE] Generated unified requirements:', stats);
        
        // Update the generated content with new template-based content
        setGeneratedContent(result);
        
        // Stay on current tab (mapping) to show the results instead of switching to unified
        console.log('[GENERATE] Generation completed, staying on current tab');
      }
      
    } catch (error) {
      console.error('[GENERATE] Error generating unified requirements:', error);
    } finally {
      setIsGenerating(false);
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }
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
  }, [showUnifiedGuidance, selectedGuidanceCategory, selectedFrameworks]);

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
    </div>
  );
}