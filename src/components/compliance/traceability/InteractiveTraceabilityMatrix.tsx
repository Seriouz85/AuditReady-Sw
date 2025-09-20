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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InteractiveTraceabilityMatrixProps {
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
}

export function InteractiveTraceabilityMatrix({
  traceabilityData,
  selectedFrameworkFilter,
  searchQuery,
  onCellSelect,
  selectedCell
}: InteractiveTraceabilityMatrixProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<MatrixCell | null>(null);

  // Filter and prepare matrix data
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
    
    // Build matrix cells
    const matrixCells: MatrixCell[] = [];
    
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
          
          matrixCells.push({
            framework: `${framework}:${fwReq.code}`,
            requirement: unifiedReq.id,
            mappingType: mapping?.type || 'NO_MAPPING',
            confidence: mapping?.confidence || 0,
            hasMapping
          });
        });
      });
    });
    
    return {
      frameworks,
      filteredUnified,
      matrixCells,
      frameworkRequirements: frameworkRequirements
    };
  }, [traceabilityData, selectedFrameworkFilter, searchQuery]);

  // Get cell color based on mapping type
  const getCellColor = (cell: MatrixCell) => {
    if (!cell.hasMapping) {
      return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
    
    switch (cell.mappingType) {
      case 'DIRECT':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'PARTIAL':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
      case 'DERIVED':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Get mapping icon
  const getMappingIcon = (mappingType: string) => {
    switch (mappingType) {
      case 'DIRECT':
        return <Check className="w-3 h-3 text-green-600 dark:text-green-400" />;
      case 'PARTIAL':
        return <Minus className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
      case 'DERIVED':
        return <AlertCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
      default:
        return <X className="w-3 h-3 text-gray-400" />;
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
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
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
      {/* Matrix Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Interactive Traceability Matrix</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                {matrixData.matrixCells.filter(c => c.hasMapping).length} mappings found
              </Badge>
              <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
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
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Legend:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Direct Mapping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Partial Mapping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Derived Mapping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">No Mapping</span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <ScrollArea className="h-[600px]">
              <div 
                className="relative"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Framework Requirements
                      </th>
                      {matrixData.filteredUnified.map((req: any) => (
                        <th 
                          key={req.id}
                          className="border border-gray-200 dark:border-gray-700 p-2 text-left text-xs font-medium text-gray-900 dark:text-white min-w-[120px] max-w-[200px]"
                        >
                          <div className="truncate" title={req.title}>
                            {req.category}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {req.title}
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
                        <tr key={`${framework}-${fwReq.code}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
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
                                    <td 
                                      className={`border border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-all duration-200 ${getCellColor(cell)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                      onClick={() => handleCellClick(cell)}
                                      onMouseEnter={() => setHoveredCell(cell)}
                                      onMouseLeave={() => setHoveredCell(null)}
                                    >
                                      <div className="flex items-center justify-center">
                                        {getMappingIcon(cell.mappingType)}
                                      </div>
                                      {cell.hasMapping && (
                                        <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-300">
                                          {Math.round(cell.confidence * 100)}%
                                        </div>
                                      )}
                                    </td>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                      <div className="font-medium">
                                        {getFrameworkLabel(framework)} {fwReq.code} → {unifiedReq.category}
                                      </div>
                                      <div className="text-sm">
                                        <strong>Mapping Type:</strong> {cell.mappingType.replace('_', ' ')}
                                      </div>
                                      {cell.hasMapping && (
                                        <div className="text-sm">
                                          <strong>Confidence:</strong> {Math.round(cell.confidence * 100)}%
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click for detailed mapping information
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Hovered Cell Details */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="max-w-sm shadow-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {hoveredCell.mappingType.replace('_', ' ')}
                  </Badge>
                  {hoveredCell.hasMapping && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.round(hoveredCell.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <strong>Framework:</strong> {hoveredCell.framework.split(':')[0]}
                </div>
                <div className="text-sm">
                  <strong>Code:</strong> {hoveredCell.framework.split(':')[1]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Click cell for detailed analysis
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}