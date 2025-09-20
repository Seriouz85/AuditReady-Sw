import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Target, 
  Eye, 
  Download, 
  Filter,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Grid3X3,
  Search,
  Settings,
  Zap,
  Brain,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrameworkSelection, ComplianceMapping } from '@/types/ComplianceSimplificationTypes';
import { InteractiveOverlapMatrix } from './InteractiveOverlapMatrix';
import { FrameworkOverlapVisualization } from './FrameworkOverlapVisualization';
import { AIValidationMetricsPanel } from './AIValidationMetricsPanel';
import { RequirementMappingDetails } from './RequirementMappingDetails';
import { CoverageGapAnalysis } from './CoverageGapAnalysis';
import { FrameworkOverlapCalculator, FrameworkOverlapRequest, RequirementData } from '@/services/compliance/ai-consolidation/FrameworkOverlapCalculator';
import { DeterministicAIValidator, ValidationRequest } from '@/services/compliance/ai-consolidation/DeterministicAIValidator';

interface TraceabilityMatrixTabProps {
  selectedFrameworks: FrameworkSelection;
  filteredMappings: ComplianceMapping[];
  onExport: (format: 'excel' | 'pdf') => void;
}

interface MappingType {
  type: 'DIRECT' | 'PARTIAL' | 'DERIVED' | 'NO_MAPPING';
  confidence: number;
  details: string[];
}

interface CoverageStats {
  totalRequirements: number;
  mappedRequirements: number;
  coveragePercentage: number;
  frameworkCoverage: Map<string, number>;
  gapCount: number;
}

interface TraceabilityData {
  frameworkRequirements: Map<string, any[]>;
  unifiedRequirements: any[];
  mappingMatrix: Map<string, Map<string, MappingType>>;
  coverageStats: CoverageStats;
  overlapMetrics?: any;
  validationMetrics?: any;
}

export function EnhancedTraceabilityMatrixTab({ 
  selectedFrameworks, 
  filteredMappings, 
  onExport 
}: TraceabilityMatrixTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overlap' | 'ai-validation' | 'matrix' | 'coverage' | 'details'>('overlap');
  const [selectedFrameworkFilter, setSelectedFrameworkFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{
    framework: string;
    requirement: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [whatIfFrameworks, setWhatIfFrameworks] = useState<FrameworkSelection>(selectedFrameworks);
  const [isCalculatingOverlap, setIsCalculatingOverlap] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Initialize services
  const overlapCalculator = useMemo(() => new FrameworkOverlapCalculator(), []);
  const aiValidator = useMemo(() => new DeterministicAIValidator(), []);

  // Build enhanced traceability data with overlap and validation metrics
  const traceabilityData = useMemo<TraceabilityData>(() => {
    console.log('[ENHANCED_TRACEABILITY] Building data from', filteredMappings.length, 'mappings');
    
    const frameworkRequirements = new Map<string, any[]>();
    const unifiedRequirements: any[] = [];
    const mappingMatrix = new Map<string, Map<string, MappingType>>();
    
    // Initialize framework maps
    const frameworks = ['iso27001', 'iso27002', 'cisControls', 'gdpr', 'nis2', 'dora'];
    frameworks.forEach(fw => {
      if (selectedFrameworks[fw as keyof FrameworkSelection]) {
        frameworkRequirements.set(fw, []);
        mappingMatrix.set(fw, new Map());
      }
    });

    // Process mappings to build traceability matrix
    filteredMappings.forEach(mapping => {
      // Add unified requirement
      if (mapping.auditReadyUnified) {
        unifiedRequirements.push({
          id: mapping.id,
          category: mapping.category,
          title: mapping.auditReadyUnified.title,
          description: mapping.auditReadyUnified.description
        });
      }

      // Process framework requirements and create mappings
      Object.entries(mapping.frameworks || {}).forEach(([framework, requirements]) => {
        if (selectedFrameworks[framework as keyof FrameworkSelection] && requirements?.length > 0) {
          const fwRequirements = frameworkRequirements.get(framework) || [];
          const fwMappingMatrix = mappingMatrix.get(framework) || new Map();
          
          requirements.forEach((req: any) => {
            // Add requirement to framework list
            fwRequirements.push({
              id: req.id || `${framework}-${req.code}`,
              code: req.code,
              title: req.title,
              description: req.description,
              framework,
              category: mapping.category
            });
            
            // Create mapping entry
            const mappingType: MappingType = {
              type: 'DIRECT', // Default - could be enhanced with AI analysis
              confidence: 0.85, // Default confidence
              details: [
                `Mapped from ${framework.toUpperCase()} ${req.code}`,
                `Category: ${mapping.category}`,
                'Direct mapping established'
              ]
            };
            
            fwMappingMatrix.set(mapping.id, mappingType);
          });
          
          frameworkRequirements.set(framework, fwRequirements);
          mappingMatrix.set(framework, fwMappingMatrix);
        }
      });
    });

    // Calculate coverage statistics
    const totalRequirements = Array.from(frameworkRequirements.values())
      .reduce((total, reqs) => total + reqs.length, 0);
    
    const mappedRequirements = unifiedRequirements.length;
    const coveragePercentage = totalRequirements > 0 ? 
      Math.round((mappedRequirements / totalRequirements) * 100) : 0;
    
    const frameworkCoverage = new Map<string, number>();
    frameworkRequirements.forEach((reqs, framework) => {
      const mappedCount = mappingMatrix.get(framework)?.size || 0;
      const coverage = reqs.length > 0 ? Math.round((mappedCount / reqs.length) * 100) : 0;
      frameworkCoverage.set(framework, coverage);
    });

    const gapCount = totalRequirements - mappedRequirements;

    const coverageStats: CoverageStats = {
      totalRequirements,
      mappedRequirements,
      coveragePercentage,
      frameworkCoverage,
      gapCount
    };

    console.log('[ENHANCED_TRACEABILITY] Built data:', {
      frameworks: frameworkRequirements.size,
      unified: unifiedRequirements.length,
      coverage: coveragePercentage
    });

    return {
      frameworkRequirements,
      unifiedRequirements,
      mappingMatrix,
      coverageStats
    };
  }, [filteredMappings, selectedFrameworks]);

  // Get filtered framework options
  const availableFrameworks = useMemo(() => {
    const frameworks = [
      { value: 'all', label: 'All Frameworks' },
      { value: 'iso27001', label: 'ISO 27001', enabled: selectedFrameworks.iso27001 },
      { value: 'iso27002', label: 'ISO 27002', enabled: selectedFrameworks.iso27002 },
      { value: 'cisControls', label: 'CIS Controls', enabled: !!selectedFrameworks.cisControls },
      { value: 'gdpr', label: 'GDPR', enabled: selectedFrameworks.gdpr },
      { value: 'nis2', label: 'NIS2', enabled: selectedFrameworks.nis2 },
      { value: 'dora', label: 'DORA', enabled: selectedFrameworks.dora }
    ];
    
    return frameworks.filter(fw => fw.value === 'all' || fw.enabled);
  }, [selectedFrameworks]);

  // Refresh traceability data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Export handlers
  const handleExport = (format: 'excel' | 'pdf') => {
    onExport(format);
  };

  // Calculate real-time overlap metrics
  const calculateOverlapMetrics = async () => {
    setIsCalculatingOverlap(true);
    try {
      // Convert traceability data to format expected by overlap calculator
      const requirementData: RequirementData[] = [];
      
      traceabilityData.unifiedRequirements.forEach(req => {
        const frameworks: string[] = [];
        const mappings: any[] = [];
        
        // Find which frameworks this requirement maps to
        traceabilityData.frameworkRequirements.forEach((fwReqs, framework) => {
          const mapping = traceabilityData.mappingMatrix.get(framework)?.get(req.id);
          if (mapping) {
            frameworks.push(framework);
            mappings.push({
              framework,
              requirementCode: req.id,
              confidence: mapping.confidence,
              mappingType: mapping.type.toLowerCase()
            });
          }
        });

        requirementData.push({
          id: req.id,
          category: req.category,
          title: req.title,
          description: req.description,
          frameworks,
          mappings,
          keywords: req.title.split(' ').filter((word: string) => word.length > 3)
        });
      });

      const overlapRequest: FrameworkOverlapRequest = {
        selectedFrameworks,
        requirements: requirementData,
        analysisType: 'current'
      };

      const overlapResult = await overlapCalculator.calculateOverlap(overlapRequest);
      
      // Store overlap metrics in state or context for use by visualization components
      console.log('[OVERLAP_METRICS]', overlapResult);
      
    } catch (error) {
      console.error('Error calculating overlap metrics:', error);
    } finally {
      setIsCalculatingOverlap(false);
    }
  };

  // Perform AI validation
  const performAIValidation = async () => {
    setIsValidating(true);
    try {
      // Mock validation for demonstration
      // In real implementation, this would call the AITextConsolidationEngine
      const validationRequest: ValidationRequest = {
        originalContent: traceabilityData.unifiedRequirements.map(req => `${req.title}: ${req.description}`).join('\n\n'),
        consolidatedContent: 'Mock consolidated content',
        category: 'General',
        frameworks: Array.from(traceabilityData.frameworkRequirements.keys()),
        expectedReduction: 0.6,
        preservationRules: []
      };

      const validationResult = await aiValidator.validateConsolidation(validationRequest);
      console.log('[VALIDATION_METRICS]', validationResult);
      
    } catch (error) {
      console.error('Error performing AI validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-calculate metrics when data changes
  useEffect(() => {
    if (traceabilityData.unifiedRequirements.length > 0) {
      calculateOverlapMetrics();
      performAIValidation();
    }
  }, [traceabilityData]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Premium Design */}
      <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-blue-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <GitBranch className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Enhanced Traceability Matrix
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Real-time framework overlap analysis with AI validation metrics</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </motion.div>
              
              <Select value={selectedFrameworkFilter} onValueChange={setSelectedFrameworkFilter}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-blue-200">
                  <SelectValue placeholder="Filter framework" />
                </SelectTrigger>
                <SelectContent>
                  {availableFrameworks.map(fw => (
                    <SelectItem key={fw.value} value={fw.value}>
                      {fw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Enhanced Coverage Overview with Animated Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-gray-700 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requirements</p>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    {traceabilityData.coverageStats.totalRequirements}
                  </motion.p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-gray-700 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Mapped</p>
                  <motion.p 
                    className="text-2xl font-bold text-green-600 dark:text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    {traceabilityData.coverageStats.mappedRequirements}
                  </motion.p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-gray-700 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coverage</p>
                  <motion.p 
                    className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    {traceabilityData.coverageStats.coveragePercentage}%
                  </motion.p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 dark:border-gray-700 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Gaps</p>
                  <motion.p 
                    className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                  >
                    {traceabilityData.coverageStats.gapCount}
                  </motion.p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200 dark:border-gray-700 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Frameworks</p>
                  <motion.p 
                    className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                  >
                    {traceabilityData.frameworkRequirements.size}
                  </motion.p>
                </div>
                <Grid3X3 className="w-8 h-8 text-indigo-500" />
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search requirements, categories, or framework codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
                {traceabilityData.frameworkRequirements.size} frameworks active
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-green-50 border-green-200 text-green-700">
                {traceabilityData.unifiedRequirements.length} unified requirements
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Traceability Content Tabs */}
      <Tabs value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overlap" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4" />
            <span>Framework Overlap</span>
          </TabsTrigger>
          <TabsTrigger value="ai-validation" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <Brain className="w-4 h-4" />
            <span>AI Validation</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Grid3X3 className="w-4 h-4" />
            <span>Matrix View</span>
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            <span>Coverage Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Eye className="w-4 h-4" />
            <span>Mapping Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overlap" className="space-y-6">
          <FrameworkOverlapVisualization
            selectedFrameworks={selectedFrameworks}
            whatIfFrameworks={whatIfFrameworks}
            onWhatIfChange={setWhatIfFrameworks}
            traceabilityData={traceabilityData}
            isCalculating={isCalculatingOverlap}
            onCalculate={setIsCalculatingOverlap}
          />
        </TabsContent>

        <TabsContent value="ai-validation" className="space-y-6">
          <AIValidationMetricsPanel
            selectedFrameworks={selectedFrameworks}
            traceabilityData={traceabilityData}
            isValidating={isValidating}
            onValidate={setIsValidating}
          />
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <InteractiveOverlapMatrix
            traceabilityData={traceabilityData}
            selectedFrameworkFilter={selectedFrameworkFilter}
            searchQuery={searchQuery}
            onCellSelect={setSelectedCell}
            selectedCell={selectedCell}
          />
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <CoverageGapAnalysis
            traceabilityData={traceabilityData}
            selectedFrameworks={selectedFrameworks}
            onFrameworkFilter={setSelectedFrameworkFilter}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <RequirementMappingDetails
            selectedCell={selectedCell}
            traceabilityData={traceabilityData}
            onCellSelect={setSelectedCell}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}