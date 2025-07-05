import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanMarkdownFormatting, cleanComplianceSubRequirement } from '@/utils/textFormatting';
import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import { 
  ArrowLeft, 
  Download, 
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Lightbulb,
  Users,
  BookOpen,
  Lock,
  Settings,
  Eye,
  Filter,
  Loader2,
  Building2,
  Factory
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { AILoadingAnimation } from '@/components/compliance/AILoadingAnimation';
import { proGradeEngine } from '@/services/compliance/ProGradeComplianceEngine';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { useFrameworkCounts, useCISControlsCount } from '@/hooks/useFrameworkCounts';
import { useQueryClient } from '@tanstack/react-query';
import { FrameworkFilterService } from '@/services/compliance/FrameworkFilterService';
// Removed xlsx import - will use CSV export instead for better compatibility

export default function ComplianceSimplification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  
  // Get dynamic framework counts from database
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [unifiedCategoryFilter, setUnifiedCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'heatmap' | '3d'>('heatmap');
  
  // Industry sector selection state
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  
  // Framework selection state
  const [selectedFrameworks, setSelectedFrameworks] = useState<{
    iso27001: boolean;
    iso27002: boolean;
    cisControls: 'ig1' | 'ig2' | 'ig3' | null;
    gdpr: boolean;
    nis2: boolean;
  }>({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: false,
    nis2: false
  });
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [frameworksSelected, setFrameworksSelected] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3' as 'ig1' | 'ig2' | 'ig3' | null,
    gdpr: false,
    nis2: false
  });

  // Fetch industry sectors
  const { data: industrySectors, isLoading: isLoadingSectors } = useIndustrySectors();
  
  // Fetch compliance mapping data from Supabase
  // Transform selectedFrameworks to match the expected format for the hook
  const frameworksForHook = {
    iso27001: selectedFrameworks.iso27001,
    iso27002: selectedFrameworks.iso27002,
    cisControls: selectedFrameworks.cisControls, // Pass the actual IG level ('ig1', 'ig2', 'ig3') or null
    gdpr: selectedFrameworks.gdpr,
    nis2: selectedFrameworks.nis2
  };
  
  const { data: fetchedComplianceMapping, isLoading: isLoadingMappings } = useComplianceMappingData(frameworksForHook, selectedIndustrySector);
  
  // Use database data
  const complianceMappingData = fetchedComplianceMapping || [];
  
  // Fetch ALL frameworks data for maximum statistics calculation (overview tab)
  const allFrameworksSelection = {
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3', // Maximum coverage with IG3
    gdpr: true,
    nis2: true
  };
  
  const { data: maxComplianceMapping } = useComplianceMappingData(allFrameworksSelection);
  
  
  
  // Handle framework selection
  const handleFrameworkToggle = (framework: string, value: any) => {
    setFrameworksSelected(prev => ({ ...prev, [framework]: value }));
  };
  
  // Handle generation button
  const handleGenerate = () => {
    console.log('Generate button clicked', { frameworksSelected, selectedFrameworks });
    setIsGenerating(true);
    setShowGeneration(true);
    
    // Force update the frameworks to trigger data refetch
    setSelectedFrameworks({ ...frameworksSelected });
    
    // Force invalidate React Query cache to ensure fresh data
    queryClient.invalidateQueries(['compliance-mapping-data']);
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generation completed, staying on current tab');
      
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }, 2500);
  };

  const exportToCSV = () => {
    // Create CSV data
    const headers = [
      'AuditReady Category',
      'AuditReady Requirement', 
      'Sub-requirement',
      'ISO 27001 Controls',
      'ISO 27002 Controls',
      'CIS Controls',
      'NIS2 Articles',
      'Unified Description'
    ];

    const rows = (filteredUnifiedMappings || []).flatMap(mapping => 
      (mapping.auditReadyUnified?.subRequirements || []).map((subReq) => [
        mapping.category,
        mapping.auditReadyUnified?.title || '',
        subReq,
        mapping.frameworks?.iso27001?.map(r => `${r.code}: ${r.title}`).join('; ') || '',
        mapping.frameworks?.iso27002?.map(r => `${r.code}: ${r.title}`).join('; ') || '',
        mapping.frameworks?.cisControls?.map(r => `${r.code}: ${r.title}`).join('; ') || '',
        (mapping.frameworks?.nis2 || []).map(r => `${r.code}: ${r.title}`).join('; '),
        mapping.auditReadyUnified?.description || ''
      ])
    );

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'AuditReady_Compliance_Simplification.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMappings = useMemo(() => {
    let filtered = complianceMappingData || [];
    
    // First, filter to show only GDPR group when GDPR is selected, or non-GDPR groups when other frameworks are selected
    if (selectedFrameworks.gdpr && !selectedFrameworks.iso27001 && !selectedFrameworks.iso27002 && !selectedFrameworks.cisControls && !selectedFrameworks.nis2) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2)) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2)) {
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
        if (!selectedFrameworks.gdpr) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.gdpr || []
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
          cisControls: selectedFrameworks.cisControls && mapping.frameworks?.cisControls ? mapping.frameworks.cisControls : []
        }
      };
      
      // Only include the mapping if it has at least one framework with controls
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.iso27001?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.iso27002?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.cisControls?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks.gdpr?.length || 0) > 0;
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
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, filterCategory, complianceMappingData]);

  // Create category options that match exactly what's displayed in filteredMappings
  const categoryOptions = useMemo(() => {
    // Use the SAME data that's actually displayed, but without the category filter applied
    let baseFiltered = complianceMappingData || [];
    
    // Apply the SAME framework filtering logic as filteredMappings
    if (selectedFrameworks.gdpr && !selectedFrameworks.iso27001 && !selectedFrameworks.iso27002 && !selectedFrameworks.cisControls && !selectedFrameworks.nis2) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2)) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.nis2)) {
      baseFiltered = complianceMappingData || [];
    } else {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Apply the SAME framework content filtering
    baseFiltered = baseFiltered.map(mapping => {
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks.gdpr) return null;
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.gdpr || []
          }
        };
      }
      
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks.iso27001 && mapping.frameworks?.iso27001 ? mapping.frameworks.iso27001 : [],
          iso27002: selectedFrameworks.iso27002 && mapping.frameworks?.iso27002 ? mapping.frameworks.iso27002 : [],
          nis2: selectedFrameworks.nis2 ? (mapping.frameworks?.nis2 || []) : [],
          gdpr: [],
          cisControls: selectedFrameworks.cisControls && mapping.frameworks?.cisControls ? 
            mapping.frameworks.cisControls.filter(control => {
              const ig3OnlyControls = [
                '1.5', '2.7', '3.13', '3.14', '4.12', '6.8', '8.12', '9.7', 
                '12.8', '13.1', '13.7', '13.8', '13.9', '13.11', 
                '15.5', '15.6', '15.7', '16.12', '16.13', '16.14', 
                '17.9', '18.4', '18.5'
              ];
              
              if (selectedFrameworks.cisControls === 'ig1') {
                return !ig3OnlyControls.includes(control.code) && 
                       !control.code.startsWith('13.') && 
                       !control.code.startsWith('16.') && 
                       !control.code.startsWith('17.') && 
                       !control.code.startsWith('18.');
              } else if (selectedFrameworks.cisControls === 'ig2') {
                return !ig3OnlyControls.includes(control.code);
              } else if (selectedFrameworks.cisControls === 'ig3') {
                return true;
              }
              return false;
            }) : []
        }
      };
      
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Apply SAME framework filter
    if (filterFramework !== 'all') {
      baseFiltered = baseFiltered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.iso27001?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.iso27002?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.cisControls?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks.gdpr?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Apply the SAME numbering logic as filteredMappings
    const nonGdprGroups = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, complianceMappingData]); // Note: deliberately excluding filterCategory

  // Create filtered unified requirements for the unified tab (removes unselected framework references)
  const filteredUnifiedMappings = useMemo(() => {
    return filteredMappings.map(mapping => ({
      ...mapping,
      auditReadyUnified: FrameworkFilterService.filterUnifiedRequirement(
        mapping.auditReadyUnified,
        selectedFrameworks
      )
    }));
  }, [filteredMappings, selectedFrameworks]);

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
        (mapping.frameworks?.iso27001?.length || 0) > 0 ||
        (mapping.frameworks?.iso27002?.length || 0) > 0 ||
        (mapping.frameworks?.cisControls?.length || 0) > 0 ||
        (mapping.frameworks?.gdpr?.length || 0) > 0 ||
        (mapping.frameworks?.nis2?.length || 0) > 0;
      return hasAnyFramework;
    });
    
    // Calculate total requirements across ALL frameworks
    const totalRequirements = processedData.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.iso27001?.length || 0;
      const iso27002Count = mapping.frameworks?.iso27002?.length || 0;
      const cisControlsCount = mapping.frameworks?.cisControls?.length || 0;
      const gdprCount = mapping.frameworks?.gdpr?.length || 0;
      const nis2Count = mapping.frameworks?.nis2?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
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

  // Calculate dynamic statistics based on selected frameworks
  const dynamicOverviewStats = useMemo(() => {
    // Calculate total maximum requirements across selected frameworks only
    const maxRequirements = filteredMappings.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.iso27001?.length || 0;
      const iso27002Count = mapping.frameworks?.iso27002?.length || 0;
      const cisControlsCount = mapping.frameworks?.cisControls?.length || 0;
      const gdprCount = mapping.frameworks?.gdpr?.length || 0;
      const nis2Count = mapping.frameworks?.nis2?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
    }, 0);
    
    // Number of unified groups based on filtered mappings
    const unifiedGroups = filteredMappings.length;
    
    // Calculate reduction metrics with safe fallbacks
    const reduction = maxRequirements - unifiedGroups;
    const reductionPercentage = maxRequirements > 0 ? ((reduction / maxRequirements) * 100).toFixed(1) : '0.0';
    const efficiencyRatio = unifiedGroups > 0 ? Math.round(maxRequirements / unifiedGroups) : 0;
    
    return {
      maxRequirements,
      unifiedGroups,
      reduction,
      reductionPercentage,
      efficiencyRatio
    };
  }, [filteredMappings]);

  // Show enhanced AI loading state while fetching data
  if (isLoadingMappings || isLoadingCounts) {
    return <AILoadingAnimation />;
  }

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
            <Button
              onClick={exportToCSV}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export to </span>CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Problem Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
                <CardTitle className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md shadow-red-500/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The Compliance Complexity Problem</h2>
                      <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">CHALLENGE</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Why traditional compliance is overwhelming organizations worldwide</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Overlapping Requirements</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Multiple frameworks often have similar requirements with different wording, creating confusion and redundancy.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Implementation Confusion</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Teams struggle to understand which requirements apply and how to avoid duplicate work across frameworks.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Settings className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Resource Inefficiency</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Organizations waste time and resources implementing the same control multiple times for different frameworks.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Solution Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-md shadow-green-500/20">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The AuditReady Solution</h2>
                        <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">SOLUTION</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered compliance unification that transforms complexity into clarity</p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4"
                  >
                    <Button
                      onClick={() => setActiveTab('mapping')}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg shadow-blue-500/25 border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Unify Frameworks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Intelligent Unification</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our AI transforms {maximumOverviewStats.maxRequirements} scattered requirements from multiple frameworks into just {maximumOverviewStats.unifiedGroups} comprehensive requirement groups, reducing complexity by {maximumOverviewStats.reductionPercentage}%.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Complete Coverage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Every detail from source frameworks is preserved in our unified requirements, ensuring nothing is lost.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Clear Implementation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Plain language descriptions with actionable sub-requirements make implementation straightforward and effective.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  value: `${maximumOverviewStats.maxRequirements}→${maximumOverviewStats.unifiedGroups}`, 
                  label: "Requirements Simplified", 
                  desc: `From ${maximumOverviewStats.maxRequirements} scattered requirements to ${maximumOverviewStats.unifiedGroups} unified groups`, 
                  color: "blue",
                  bgClass: "bg-blue-50 dark:bg-blue-900/20",
                  textClass: "text-blue-600 dark:text-blue-400"
                },
                { 
                  value: `${maximumOverviewStats.reductionPercentage}%`, 
                  label: "Complexity Reduction", 
                  desc: `${maximumOverviewStats.reduction} fewer requirements to manage`, 
                  color: "green",
                  bgClass: "bg-green-50 dark:bg-green-900/20",
                  textClass: "text-green-600 dark:text-green-400"
                },
                { 
                  value: `${maximumOverviewStats.efficiencyRatio}:1`, 
                  label: "Efficiency Ratio", 
                  desc: `${maximumOverviewStats.efficiencyRatio} traditional requirements per 1 unified group`, 
                  color: "purple",
                  bgClass: "bg-purple-50 dark:bg-purple-900/20",
                  textClass: "text-purple-600 dark:text-purple-400"
                },
                { 
                  value: "100%", 
                  label: "Coverage Maintained", 
                  desc: "All original requirements preserved", 
                  color: "emerald",
                  bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
                  textClass: "text-emerald-600 dark:text-emerald-400"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="flex"
                >
                  <Card className={`text-center border border-slate-200 dark:border-slate-700 rounded-xl ${stat.bgClass} hover:shadow-md transition-all duration-200 flex-1`}>
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${stat.textClass} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {stat.desc}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Framework Mapping Tab */}
          <TabsContent value="mapping" className="space-y-6">
            {/* Framework Selection Interface - Enhanced */}
            <div className="relative">
              {/* AI Generation Overlay */}
              <AnimatePresence>
                {showGeneration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: isGenerating ? Infinity : 0 
                      }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      {isGenerating ? 'AI Analyzing Frameworks...' : 'Unified Requirements Generated!'}
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md"
                    >
                      {isGenerating 
                        ? 'Our AI is processing your selected frameworks and creating optimized unified requirements...'
                        : 'Your customized compliance roadmap is ready! Scroll down to see the unified requirements.'
                      }
                    </motion.p>
                    {!isGenerating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="mt-4 flex items-center space-x-2 text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Generation Complete</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Framework Unification
                    </span>
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Select your compliance frameworks and watch our AI instantly generate unified, simplified requirements tailored to your organization
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Framework Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                    
                    {/* ISO 27001 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected.iso27001
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27001', !frameworksSelected.iso27001)}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected.iso27001 && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected.iso27001 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected.iso27001 ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27001</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Info Security Management</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                            {frameworkCounts?.iso27001 || 24} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected.iso27001 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* ISO 27002 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected.iso27002
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27002', !frameworksSelected.iso27002)}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected.iso27002 && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected.iso27002 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Lock className={`w-5 h-5 ${frameworksSelected.iso27002 ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27002</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Information Security Controls</p>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                            {frameworkCounts?.iso27002 || 93} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected.iso27002 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* CIS Controls Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected.cisControls
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                      }`}
                      onClick={(e) => {
                        // If clicking on the card background (not on IG buttons), deselect CIS Controls
                        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.space-y-1') === null) {
                          handleFrameworkToggle('cisControls', null);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected.cisControls && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected.cisControls ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Settings className={`w-5 h-5 ${frameworksSelected.cisControls ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">CIS Controls</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Cybersecurity Best Practices</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                            {(() => {
                              const igLevel = frameworksSelected.cisControls;
                              if (!frameworkCounts || isLoadingCounts) {
                                return igLevel === 'ig1' ? 36 : igLevel === 'ig2' ? 82 : 155;
                              }
                              return igLevel === 'ig1' ? (frameworkCounts.cisIG1 || 36) : 
                                     igLevel === 'ig2' ? (frameworkCounts.cisIG2 || 82) : 
                                     (frameworkCounts.cisIG3 || 155);
                            })()} requirements
                          </p>
                        </div>
                        
                        {/* IG Level Selection */}
                        <div className="space-y-1 w-full">
                          {['ig1', 'ig2', 'ig3'].map((level) => (
                            <motion.button
                              key={level}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-1.5 rounded-lg text-xs font-medium transition-all ${
                                frameworksSelected.cisControls === level
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                              }`}
                              onClick={() => handleFrameworkToggle('cisControls', frameworksSelected.cisControls === level ? null : level as 'ig1' | 'ig2' | 'ig3')}
                            >
                              {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Foundational' : 'Organizational'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {frameworksSelected.cisControls && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* GDPR Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected.gdpr
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                      }`}
                      onClick={() => handleFrameworkToggle('gdpr', !frameworksSelected.gdpr)}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected.gdpr && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-orange-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected.gdpr ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className={`w-5 h-5 ${frameworksSelected.gdpr ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Data Protection Regulation</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                            {frameworkCounts?.gdpr || 25} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected.gdpr && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* NIS2 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col overflow-visible ${
                        frameworksSelected.nis2
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                      }`}
                      onClick={(e) => {
                        // Only toggle if clicking the card background, not the dropdown
                        if (!(e.target as HTMLElement).closest('.industry-dropdown')) {
                          handleFrameworkToggle('nis2', !frameworksSelected.nis2);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected.nis2 && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected.nis2 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected.nis2 ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Cybersecurity Directive</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                            {frameworkCounts?.nis2 || 17} requirements
                          </p>
                        </div>
                        
                        {/* Industry Sector Selection - Inside the card */}
                        {frameworksSelected.nis2 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mt-2 industry-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Building2 className="w-2 h-2 text-indigo-600" />
                                <span className="text-[9px] font-medium text-indigo-700 dark:text-indigo-300">Sector</span>
                                <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-indigo-300 text-indigo-600">
                                  NIS2
                                </Badge>
                              </div>
                              <div className="relative">
                                <Select value={selectedIndustrySector || 'none'} onValueChange={(value) => setSelectedIndustrySector(value === 'none' ? null : value)}>
                                  <SelectTrigger className="w-full text-[9px] h-4 border-indigo-300 focus:border-indigo-500 px-1 py-0">
                                    <SelectValue placeholder="All Industries" className="text-[9px] leading-none" />
                                  </SelectTrigger>
                                  <SelectContent 
                                    className="max-h-48 w-full text-xs z-50 overflow-y-auto" 
                                    position="popper"
                                    sideOffset={4}
                                    align="start"
                                  >
                                    <SelectItem value="none" className="text-xs py-1 px-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs">All Industries</span>
                                      </div>
                                    </SelectItem>
                                    {industrySectors?.filter(sector => {
                                      // Only show official NIS2 sectors according to directive
                                      const officialNIS2Sectors = [
                                        'Energy',
                                        'Healthcare', 
                                        'Health', // Alternative naming
                                        'Transportation',
                                        'Transport', // Alternative naming
                                        'Banking & Finance',
                                        'Water & Wastewater',
                                        'Digital Infrastructure',
                                        'Government & Public',
                                        'Manufacturing',
                                        'Food & Agriculture',
                                        'ICT Service Management',
                                        'Space',
                                        'Postal and Courier Services',
                                        'Waste Management',
                                        'Digital Providers',
                                        'Research'
                                      ];
                                      return officialNIS2Sectors.includes(sector.name);
                                    }).map((sector) => (
                                      <SelectItem key={sector.id} value={sector.id} className="text-xs py-1 px-2">
                                        <div className="flex items-center gap-2 w-full">
                                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            sector.nis2Essential ? 'bg-red-500' : 
                                            sector.nis2Important ? 'bg-orange-500' : 
                                            'bg-green-500'
                                          }`}></div>
                                          <span className="text-xs truncate flex-1 min-w-0">{sector.name}</span>
                                          {sector.nis2Essential && (
                                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Essential
                                            </Badge>
                                          )}
                                          {sector.nis2Important && !sector.nis2Essential && (
                                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Important
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {selectedIndustrySector && industrySectors && (
                                <div className="mt-0.5 p-0.5 bg-white dark:bg-indigo-800/50 rounded text-[7px] border border-indigo-200 dark:border-indigo-600">
                                  <p className="text-indigo-800 dark:text-indigo-200 leading-tight">
                                    {industrySectors.find(s => s.id === selectedIndustrySector)?.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {frameworksSelected.nis2 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Quick Selection Presets */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-center">Quick Presets</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { name: 'Comprehensive Security', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3' as const, gdpr: false, nis2: false } },
                        { name: 'Privacy Focused', frameworks: { iso27001: false, iso27002: false, cisControls: null, gdpr: true, nis2: false } },
                        { name: 'EU Compliance', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig2' as const, gdpr: true, nis2: true } },
                        { name: 'Basic Security', frameworks: { iso27001: true, iso27002: false, cisControls: 'ig1' as const, gdpr: false, nis2: false } }
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFrameworksSelected(preset.frameworks);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <div className="border-t pt-8">
                    <div className="flex justify-center">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!frameworksSelected.iso27001 && !frameworksSelected.iso27002 && !frameworksSelected.cisControls && !frameworksSelected.gdpr && !frameworksSelected.nis2)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 mr-3"
                            >
                              <Zap className="w-6 h-6" />
                            </motion.div>
                            Generating Unified Requirements...
                          </>
                        ) : (
                          <>
                            <Zap className="w-6 h-6 mr-3" />
                            Generate Unified Requirements
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Select frameworks above and click to generate your unified compliance requirements
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Framework Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Framework:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
                    { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
                    { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
                    { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
                    { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> }
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filterFramework === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterFramework(filter.id)}
                      className="flex items-center space-x-1 rounded-full"
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Category:</span>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
                    <SelectValue placeholder="Select a category to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((mapping) => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Framework Connections */}
            <div className="space-y-8">
              <AnimatePresence>
                {filteredMappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">{mapping.category}</h3>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Framework Grid - Different layout for GDPR vs other frameworks */}
                        {mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948' ? (
                          /* GDPR-only layout */
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR Articles</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                                {(mapping.frameworks.gdpr || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular layout for ISO/CIS/NIS2 frameworks - Only show selected frameworks */
                          <div className={`grid gap-0 border-b border-slate-200 dark:border-slate-700 grid-cols-1 ${
                            // Calculate grid columns based on selected frameworks
                            (() => {
                              const selectedCount = 
                                (selectedFrameworks.iso27001 ? 1 : 0) +
                                (selectedFrameworks.iso27002 ? 1 : 0) +
                                (selectedFrameworks.cisControls ? 1 : 0) +
                                (selectedFrameworks.nis2 ? 1 : 0);
                              
                              if (selectedCount === 1) return 'lg:grid-cols-1';
                              if (selectedCount === 2) return 'sm:grid-cols-2';
                              if (selectedCount === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
                              if (selectedCount === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
                              return 'sm:grid-cols-2 lg:grid-cols-3'; // fallback
                            })()
                          }`}>
                          
                          {/* ISO 27001 Column - Only show if selected */}
                          {selectedFrameworks.iso27001 && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                                {(mapping.frameworks?.iso27001 || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ISO 27002 Column - Only show if selected */}
                          {selectedFrameworks.iso27002 && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Lock className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                                {(mapping.frameworks?.iso27002 || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                    <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CIS Controls Column - Only show if selected */}
                          {selectedFrameworks.cisControls && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                                  CIS Controls {selectedFrameworks.cisControls.toUpperCase()}
                                </h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                                {(mapping.frameworks?.cisControls || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* NIS2 Column - Only show if selected */}
                          {selectedFrameworks.nis2 && (
                            <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">NIS2</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-indigo-900">
                                {(mapping.frameworks.nis2 || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        )}

                        {/* AuditReady Unified Row */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">AuditReady Unified</h4>
                                <p className="text-xs text-white/90">{mapping.auditReadyUnified.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center bg-white/20 rounded-lg px-3 py-1">
                                <span className="text-xs font-medium block">
                                  {(() => {
                                    if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
                                      // For GDPR groups, show GDPR articles count
                                      const totalGdprReqs = mapping.frameworks.gdpr?.length || 0;
                                      const unifiedReqs = mapping.auditReadyUnified.subRequirements.length;
                                      const reductionPercent = totalGdprReqs > 1 ? Math.round((1 - unifiedReqs / totalGdprReqs) * 100) : 0;
                                      return `Unifies ${totalGdprReqs} GDPR articles - ${reductionPercent}% simpler`;
                                    } else {
                                      // For regular groups, show framework requirements from selected frameworks only
                                      const totalFrameworkReqs = 
                                        (selectedFrameworks.iso27001 ? (mapping.frameworks?.iso27001?.length || 0) : 0) + 
                                        (selectedFrameworks.iso27002 ? (mapping.frameworks?.iso27002?.length || 0) : 0) + 
                                        (selectedFrameworks.cisControls ? (mapping.frameworks?.cisControls?.length || 0) : 0) +
                                        (selectedFrameworks.nis2 ? (mapping.frameworks?.nis2?.length || 0) : 0);
                                      const reductionPercent = totalFrameworkReqs > 1 ? Math.round((1 - 1 / totalFrameworkReqs) * 100) : 0;
                                      return totalFrameworkReqs > 0 ? `Replaces ${totalFrameworkReqs} requirements - ${reductionPercent}% reduction` : 'No requirements from selected frameworks';
                                    }
                                  })()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id)}
                                className="text-white hover:bg-white/20 whitespace-nowrap text-xs px-2 py-1 h-auto"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{selectedMapping === mapping.id ? 'Hide' : 'Show'} Sub-Requirements</span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {selectedMapping === mapping.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 dark:bg-gray-800/50"
                            >
                              <div className="p-4 sm:p-6">
                                <h5 className="font-semibold mb-4 text-gray-900 dark:text-white">Unified Sub-Requirements</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapping.auditReadyUnified.subRequirements.map((subReq, i) => (
                                  <div key={i} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{cleanComplianceSubRequirement(subReq)}</span>
                                  </div>
                                ))}
                              </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Unified Requirements Tab */}
          <TabsContent value="unified" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AuditReady Unified Requirements</h2>
                    <p className="text-sm text-white/80 font-normal">Simplified, comprehensive compliance requirements</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Framework Unification Introduction */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-blue-600" />
                      Framework Integration Overview
                    </h3>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Generated Requirements</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredUnifiedMappings.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">unified groups</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    The following unified requirements have been generated by consolidating controls from your selected compliance frameworks{selectedFrameworks.nis2 && selectedIndustrySector ? ' with sector-specific enhancements for ' + (industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'selected sector') : ''}:
                  </p>
                  {selectedFrameworks.nis2 && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Sector-Specific Enhancements Active
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {SectorSpecificEnhancer.getEnhancementSummary(selectedIndustrySector)} for {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedFrameworks.iso27001 && (
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        ISO 27001
                      </Badge>
                    )}
                    {selectedFrameworks.iso27002 && (
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        <Lock className="w-3 h-3 mr-1" />
                        ISO 27002
                      </Badge>
                    )}
                    {selectedFrameworks.cisControls && (
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Settings className="w-3 h-3 mr-1" />
                        CIS Controls {selectedFrameworks.cisControls.toUpperCase()}
                      </Badge>
                    )}
                    {selectedFrameworks.gdpr && (
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        GDPR
                      </Badge>
                    )}
                    {selectedFrameworks.nis2 && (
                      <Badge className="bg-indigo-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        NIS2
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Each unified requirement below eliminates duplicate controls and combines overlapping requirements into streamlined, actionable guidelines.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{filteredUnifiedMappings.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total Groups</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {filteredUnifiedMappings.reduce((total, group) => {
                          const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                            group.auditReadyUnified.subRequirements || [],
                            group.category,
                            selectedIndustrySector,
                            selectedFrameworks.nis2
                          );
                          return total + enhancedSubReqs.length;
                        }, 0)}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Total Sub-requirements{selectedFrameworks.nis2 && selectedIndustrySector ? ' (Enhanced)' : ''}</div>
                    </div>
                  </div>
                </div>
                
                {/* Category Filter Dropdown */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Filter Categories:</span>
                  </div>
                  <Select 
                    value={unifiedCategoryFilter}
                    onValueChange={(value) => {
                      setUnifiedCategoryFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-full max-w-lg mt-2">
                      <SelectValue placeholder="Filter requirement categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {filteredUnifiedMappings.map((mapping) => (
                        <SelectItem key={mapping.id} value={mapping.id}>
                          {mapping.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-6">
                  {filteredUnifiedMappings.filter(mapping => 
                    unifiedCategoryFilter === 'all' || mapping.id === unifiedCategoryFilter
                  ).map((mapping, index) => (
                    <motion.div
                      key={mapping.id}
                      id={`unified-${mapping.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {mapping.category.replace(/^\d+\. /, '')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {cleanMarkdownFormatting(mapping.auditReadyUnified.description)}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {mapping.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Replaces</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(mapping.frameworks?.iso27001?.length || 0) + (mapping.frameworks?.iso27002?.length || 0) + (mapping.frameworks?.cisControls?.length || 0) + (mapping.frameworks?.gdpr?.length || 0)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                                mapping.auditReadyUnified.subRequirements || [],
                                mapping.category,
                                selectedIndustrySector,
                                selectedFrameworks.nis2
                              );
                              return enhancedSubReqs.length;
                            })()} sub-requirements{selectedFrameworks.nis2 && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) ? ' (enhanced)' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Implementation Guidelines:</h4>
                        <div className="space-y-4">
                          {(() => {
                            // Apply sector-specific enhancements if NIS2 and sector are selected
                            const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                              mapping.auditReadyUnified.subRequirements || [],
                              mapping.category,
                              selectedIndustrySector,
                              selectedFrameworks.nis2
                            );
                            
                            // Group enhanced sub-requirements for better organization
                            const groupedSubReqs = {
                              'Core Requirements': enhancedSubReqs.filter((_, i) => i < Math.ceil(enhancedSubReqs.length / 3)),
                              'Implementation Standards': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length / 3) && i < Math.ceil(enhancedSubReqs.length * 2 / 3)),
                              'Monitoring & Compliance': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length * 2 / 3))
                            };
                            
                            return Object.entries(groupedSubReqs).map(([groupName, requirements]) => (
                              requirements.length > 0 && (
                                <div key={groupName} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    {groupName}
                                  </h5>
                                  <div className="space-y-2">
                                    {requirements.map((subReq, i) => (
                                      <div key={i} className="flex items-start space-x-2 text-sm">
                                        <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{subReq}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            ));
                          })()}
                        </div>
                        
                        {/* Industry-Specific Requirements Section */}
                        {selectedIndustrySector && mapping.industrySpecific && mapping.industrySpecific.length > 0 && (
                          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-3 flex items-center">
                              <Factory className="w-4 h-4 mr-2" />
                              Industry-Specific Requirements
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                              </Badge>
                            </h5>
                            <div className="space-y-3">
                              {mapping.industrySpecific.map((req, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-green-200/50 dark:border-green-700/50">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {req.code}
                                      </span>
                                      <Badge variant={
                                        req.relevanceLevel === 'critical' ? 'destructive' :
                                        req.relevanceLevel === 'high' ? 'default' :
                                        req.relevanceLevel === 'standard' ? 'secondary' :
                                        'outline'
                                      } className="text-xs">
                                        {req.relevanceLevel}
                                      </Badge>
                                    </div>
                                  </div>
                                  <h6 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                                    {req.title}
                                  </h6>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {req.description.split('•').filter(item => item.trim()).map((item, j) => (
                                      <div key={j} className="flex items-start space-x-2 mb-1">
                                        <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                        <span>{item.trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Framework Overlap Tab */}
          <TabsContent value="overlap" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Framework Overlap Analysis</h2>
                    <p className="text-sm text-white/80 font-normal">Visual representation of how your selected frameworks overlap</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Check if any frameworks are selected */}
                {(selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls || selectedFrameworks.gdpr || selectedFrameworks.nis2) ? (
                  <>
                {/* Overlap Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Object.values(selectedFrameworks).filter(v => v).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Frameworks Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredMappings.reduce((total, mapping) => {
                        const frameworkCount = Object.entries(mapping.frameworks).filter(([key, value]) => {
                          if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                          if (key === 'cisControls') return value.length > 0;
                          return value.length > 0;
                        }).length;
                        return total + (frameworkCount > 1 ? 1 : 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Groups with Overlap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(() => {
                        const overlapRate = filteredMappings.reduce((total, mapping) => {
                          const activeFrameworks = Object.entries(mapping.frameworks).filter(([key, value]) => {
                            if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                            if (key === 'cisControls') return value.length > 0;
                            return value.length > 0;
                          });
                          const maxReqs = activeFrameworks.length > 0 ? Math.max(...activeFrameworks.map(([_, reqs]) => reqs.length)) : 0;
                          const totalReqs = activeFrameworks.reduce((sum, [_, reqs]) => sum + reqs.length, 0);
                          return total + (totalReqs > 0 ? ((totalReqs - maxReqs) / totalReqs) * 100 : 0);
                        }, 0);
                        return Math.round(overlapRate / Math.max(filteredMappings.length, 1));
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Overlap Rate</div>
                  </div>
                </div>
                
                {/* Framework Coverage Visualization */}
                <PentagonVisualization 
                  selectedFrameworks={selectedFrameworks}
                  mappingData={filteredMappings}
                />
                
                
                {/* Framework Legend */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Frameworks</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedFrameworks.iso27001 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">ISO 27001</span>
                      </div>
                    )}
                    {selectedFrameworks.iso27002 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">ISO 27002</span>
                      </div>
                    )}
                    {selectedFrameworks.cisControls && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm">CIS Controls ({selectedFrameworks.cisControls.toUpperCase()})</span>
                      </div>
                    )}
                    {selectedFrameworks.gdpr && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm">GDPR</span>
                      </div>
                    )}
                    {selectedFrameworks.nis2 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                        <span className="text-sm">NIS2</span>
                      </div>
                    )}
                  </div>
                </div>
                </>
                ) : (
                  /* No frameworks selected state */
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Frameworks Selected
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Select frameworks in the "Framework Mapping" tab and click "Generate Unified Requirements" to see overlap analysis and efficiency insights.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>ISO 27001/27002</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-purple-500" />
                          <span>CIS Controls</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                          <span>GDPR</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span>NIS2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}