import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  ExternalLink,
  Check,
  AlertCircle,
  Minus,
  X,
  Grid3X3,
  Filter,
  Download,
  Eye,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InteractiveOverlapMatrixProps {
  traceabilityData: any;
  selectedFrameworkFilter: string;
  searchQuery: string;
  onCellSelect: (cell: { framework: string; requirement: string } | null) => void;
  selectedCell: { framework: string; requirement: string } | null;
}

interface MatrixCell {
  framework: string;
  requirement: string;
  mappingType: 'DIRECT' | 'PARTIAL' | 'DERIVED' | 'NO_MAPPING';
  confidence: number;
  hasMapping: boolean;
  overlapPercentage?: number;
  frameworkCount?: number;
}

interface OverlapStats {
  totalCells: number;
  mappedCells: number;
  highOverlap: number;
  mediumOverlap: number;
  lowOverlap: number;
  noOverlap: number;
}

export function InteractiveOverlapMatrix({
  traceabilityData,
  selectedFrameworkFilter,
  searchQuery,
  onCellSelect,
  selectedCell
}: InteractiveOverlapMatrixProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<MatrixCell | null>(null);
  const [viewMode, setViewMode] = useState<'overlap' | 'confidence' | 'density'>('overlap');
  const [showOnlyMapped, setShowOnlyMapped] = useState(false);

  // Enhanced matrix data with overlap calculations
  const matrixData = useMemo(() => {
    const { frameworkRequirements, unifiedRequirements, mappingMatrix } = traceabilityData;
    
    // Filter frameworks
    const frameworks = Array.from(frameworkRequirements.keys()).filter(fw => 
      selectedFrameworkFilter === 'all' || fw === selectedFrameworkFilter
    );
    
    // Filter unified requirements based on search
    const filteredUnified = unifiedRequirements.filter((req: any) => 
      searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Build enhanced matrix cells with overlap analysis
    const matrixCells: MatrixCell[] = [];
    const requirementOverlapMap = new Map<string, number>(); // Track how many frameworks each requirement maps to
    
    // First pass: count framework mappings per requirement
    filteredUnified.forEach((unifiedReq: any) => {
      let frameworkCount = 0;
      frameworks.forEach(framework => {
        const fwMappings = mappingMatrix.get(framework) || new Map();
        if (fwMappings.has(unifiedReq.id)) {
          frameworkCount++;
        }
      });
      requirementOverlapMap.set(unifiedReq.id, frameworkCount);
    });
    
    // Second pass: build matrix cells with overlap data
    frameworks.forEach(framework => {
      const fwRequirements = frameworkRequirements.get(framework) || [];
      const fwMappings = mappingMatrix.get(framework) || new Map();
      
      // Filter framework requirements based on search
      const filteredFwReqs = fwRequirements.filter((req: any) =>
        searchQuery === '' ||
        req.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredFwReqs.forEach((fwReq: any) => {
        filteredUnified.forEach((unifiedReq: any) => {
          const mapping = fwMappings.get(unifiedReq.id);
          const hasMapping = !!mapping;
          const frameworkCount = requirementOverlapMap.get(unifiedReq.id) || 0;
          
          // Calculate overlap percentage based on how many frameworks share this requirement
          const overlapPercentage = frameworkCount > 1 ? 
            Math.round(((frameworkCount - 1) / (frameworks.length - 1)) * 100) : 0;
          
          if (!showOnlyMapped || hasMapping) {
            matrixCells.push({
              framework: `${framework}:${fwReq.code}`,
              requirement: unifiedReq.id,
              mappingType: mapping?.type || 'NO_MAPPING',
              confidence: mapping?.confidence || 0,
              hasMapping,
              overlapPercentage,
              frameworkCount
            });
          }
        });
      });
    });
    
    return {
      frameworks,
      filteredUnified,
      matrixCells,
      frameworkRequirements: frameworkRequirements,
      requirementOverlapMap
    };
  }, [traceabilityData, selectedFrameworkFilter, searchQuery, showOnlyMapped]);

  // Calculate overlap statistics
  const overlapStats = useMemo<OverlapStats>(() => {
    const stats = matrixData.matrixCells.reduce(
      (acc, cell) => {
        acc.totalCells++;
        if (cell.hasMapping) {
          acc.mappedCells++;
          if (cell.overlapPercentage >= 70) acc.highOverlap++;
          else if (cell.overlapPercentage >= 40) acc.mediumOverlap++;
          else if (cell.overlapPercentage > 0) acc.lowOverlap++;
        } else {
          acc.noOverlap++;
        }
        return acc;
      },
      { totalCells: 0, mappedCells: 0, highOverlap: 0, mediumOverlap: 0, lowOverlap: 0, noOverlap: 0 }
    );
    
    return stats;
  }, [matrixData.matrixCells]);

  // Get cell color based on view mode and data
  const getCellColor = (cell: MatrixCell) => {
    if (!cell.hasMapping) {
      return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60';
    }
    
    switch (viewMode) {
      case 'overlap':
        if (cell.overlapPercentage >= 70) {
          return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50';
        } else if (cell.overlapPercentage >= 40) {
          return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
        } else if (cell.overlapPercentage > 0) {
          return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50';
        } else {
          return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50';
        }
      
      case 'confidence':
        if (cell.confidence >= 0.9) {
          return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50';
        } else if (cell.confidence >= 0.7) {
          return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50';
        } else if (cell.confidence >= 0.5) {
          return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
        } else {
          return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50';
        }
      
      case 'density':
        const intensity = Math.min(100, (cell.frameworkCount || 1) * 25);
        if (intensity >= 75) {
          return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50';
        } else if (intensity >= 50) {
          return 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-900/50';
        } else if (intensity >= 25) {
          return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50';
        } else {
          return 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900/50';
        }
      
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Get mapping icon with enhanced styling
  const getMappingIcon = (cell: MatrixCell) => {
    if (!cell.hasMapping) {
      return <X className="w-3 h-3 text-gray-400" />;
    }

    switch (viewMode) {
      case 'overlap':
        if (cell.overlapPercentage >= 70) {
          return <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />;
        } else if (cell.overlapPercentage >= 40) {
          return <Minus className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
        } else if (cell.overlapPercentage > 0) {
          return <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
        } else {
          return <Check className="w-3 h-3 text-green-600 dark:text-green-400" />;
        }
      
      case 'confidence':
        if (cell.confidence >= 0.9) {
          return <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
        } else if (cell.confidence >= 0.7) {
          return <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
        } else if (cell.confidence >= 0.5) {
          return <Minus className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
        } else {
          return <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />;
        }
      
      case 'density':
        return <Layers className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
      
      default:
        return <Check className="w-3 h-3 text-green-600 dark:text-green-400" />;
    }
  };

  // Get cell value display
  const getCellValue = (cell: MatrixCell) => {
    if (!cell.hasMapping) return null;
    
    switch (viewMode) {
      case 'overlap':
        return `${cell.overlapPercentage}%`;
      case 'confidence':
        return `${Math.round(cell.confidence * 100)}%`;
      case 'density':
        return `${cell.frameworkCount}x`;
      default:
        return `${Math.round(cell.confidence * 100)}%`;
    }
  };

  // Handle cell click
  const handleCellClick = (cell: MatrixCell) => {
    const [framework, code] = cell.framework.split(':');
    onCellSelect({ framework, requirement: cell.requirement });
  };

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    switch (direction) {
      case 'in':
        setZoomLevel(Math.min(zoomLevel * 1.2, 3));
        break;
      case 'out':
        setZoomLevel(Math.max(zoomLevel / 1.2, 0.5));
        break;
      case 'reset':
        setZoomLevel(1);
        break;
    }
  };

  const getFrameworkLabel = (framework: string) => {
    const labels: Record<string, string> = {
      iso27001: 'ISO 27001',
      iso27002: 'ISO 27002',
      cisControls: 'CIS Controls',
      gdpr: 'GDPR',
      nis2: 'NIS2',
      dora: 'DORA'
    };
    return labels[framework] || framework.toUpperCase();
  };

  if (matrixData.frameworks.length === 0 || matrixData.filteredUnified.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Matrix Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            No framework requirements or unified requirements found with current filters.
            Try adjusting your framework selection or search query.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Matrix Controls */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-indigo-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"
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
                <Grid3X3 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Enhanced Overlap Matrix
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Interactive framework overlap analysis with real-time metrics
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Selector */}
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overlap">Overlap %</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="density">Density</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button
                variant={showOnlyMapped ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyMapped(!showOnlyMapped)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Mapped Only</span>
              </Button>

              {/* Stats Badge */}
              <Badge variant="outline" className="px-3 py-1 bg-white/80 backdrop-blur-sm">
                {overlapStats.mappedCells} / {overlapStats.totalCells} mapped
              </Badge>
              
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white/80 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('out')}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-mono px-2 text-gray-600 dark:text-gray-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('in')}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('reset')}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Enhanced Statistics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Mappings</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {overlapStats.mappedCells}
                  </p>
                </div>
                <Check className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-red-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Overlap</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {overlapStats.highOverlap}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Medium Overlap</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {overlapStats.mediumOverlap}
                  </p>
                </div>
                <Minus className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Low/No Overlap</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {overlapStats.lowOverlap + overlapStats.noOverlap}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coverage</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round((overlapStats.mappedCells / overlapStats.totalCells) * 100)}%
                  </p>
                </div>
                <Grid3X3 className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
          </div>

          {/* Enhanced Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {viewMode === 'overlap' ? 'Overlap Legend:' : 
               viewMode === 'confidence' ? 'Confidence Legend:' : 
               'Density Legend:'}
            </span>
            
            {viewMode === 'overlap' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Unique (0%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Low Overlap (1-39%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Medium Overlap (40-69%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">High Overlap (70%+)</span>
                </div>
              </>
            )}

            {viewMode === 'confidence' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Low (0-49%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Medium (50-69%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">High (70-89%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Excellent (90%+)</span>
                </div>
              </>
            )}

            {viewMode === 'density' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Single (1x)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Multiple (2x)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-indigo-200 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Dense (3x)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-200 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Very Dense (4x+)</span>
                </div>
              </>
            )}
          </div>

          {/* Enhanced Matrix Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
            <ScrollArea className="h-[600px]">
              <div 
                className="relative"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Framework Requirements
                      </th>
                      {matrixData.filteredUnified.map((req: any) => (
                        <th 
                          key={req.id}
                          className="border border-gray-200 dark:border-gray-700 p-2 text-left text-xs font-medium text-gray-900 dark:text-white min-w-[140px] max-w-[200px]"
                        >
                          <div className="space-y-1">
                            <div className="truncate font-semibold" title={req.title}>
                              {req.category}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {req.title}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {matrixData.requirementOverlapMap.get(req.id) || 0}x
                              </Badge>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.frameworks.map(framework => {
                      const fwRequirements = matrixData.frameworkRequirements.get(framework) || [];
                      const filteredFwReqs = fwRequirements.filter((req: any) =>
                        searchQuery === '' ||
                        req.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        req.title.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      
                      return filteredFwReqs.map((fwReq: any, index: number) => (
                        <motion.tr 
                          key={`${framework}-${fwReq.code}`} 
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                {getFrameworkLabel(framework)}
                              </Badge>
                              <span className="font-medium">{fwReq.code}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[250px]">
                              {fwReq.title}
                            </div>
                          </td>
                          {matrixData.filteredUnified.map((unifiedReq: any) => {
                            const cell = matrixData.matrixCells.find(c => 
                              c.framework === `${framework}:${fwReq.code}` && 
                              c.requirement === unifiedReq.id
                            );
                            
                            if (!cell) return (
                              <td key={`${framework}-${fwReq.code}-${unifiedReq.id}`} className="border border-gray-200 dark:border-gray-700 p-2"></td>
                            );
                            
                            const isSelected = selectedCell?.framework === framework && 
                                             selectedCell?.requirement === unifiedReq.id;
                            
                            return (
                              <TooltipProvider key={`${framework}-${fwReq.code}-${unifiedReq.id}`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.td 
                                      className={`border border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-all duration-200 ${getCellColor(cell)} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                      onClick={() => handleCellClick(cell)}
                                      onMouseEnter={() => setHoveredCell(cell)}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      whileHover={{ scale: 1.05, z: 10 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <div className="flex flex-col items-center justify-center space-y-1">
                                        {getMappingIcon(cell)}
                                        {cell.hasMapping && (
                                          <div className="text-xs text-center font-medium text-gray-700 dark:text-gray-300">
                                            {getCellValue(cell)}
                                          </div>
                                        )}
                                      </div>
                                    </motion.td>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                                    <div className="space-y-2">
                                      <div className="font-medium">
                                        {getFrameworkLabel(framework)} {fwReq.code} → {unifiedReq.category}
                                      </div>
                                      {cell.hasMapping ? (
                                        <>
                                          <div className="text-sm space-y-1">
                                            <div><strong>Overlap:</strong> {cell.overlapPercentage}%</div>
                                            <div><strong>Confidence:</strong> {Math.round(cell.confidence * 100)}%</div>
                                            <div><strong>Framework Count:</strong> {cell.frameworkCount}x</div>
                                            <div><strong>Type:</strong> {cell.mappingType.replace('_', ' ')}</div>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="text-sm text-gray-500">No mapping found</div>
                                      )}
                                      <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
                                        Click for detailed mapping information
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </motion.tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Hovered Cell Details */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {hoveredCell.mappingType.replace('_', ' ')}
                    </Badge>
                    {hoveredCell.hasMapping && (
                      <Badge variant="secondary" className="bg-green-50 border-green-200 text-green-700">
                        Mapped
                      </Badge>
                    )}
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Framework:</span>
                      <p className="font-medium">{hoveredCell.framework.split(':')[0]}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Code:</span>
                      <p className="font-medium">{hoveredCell.framework.split(':')[1]}</p>
                    </div>
                  </div>
                  
                  {hoveredCell.hasMapping && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Overlap:</span>
                        <p className="font-medium text-purple-600">{hoveredCell.overlapPercentage}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <p className="font-medium text-blue-600">{Math.round(hoveredCell.confidence * 100)}%</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t">
                  Click cell for comprehensive analysis
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}