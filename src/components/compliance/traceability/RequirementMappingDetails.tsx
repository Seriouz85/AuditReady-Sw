import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  GitBranch, 
  Target, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequirementMappingDetailsProps {
  selectedCell: { framework: string; requirement: string } | null;
  traceabilityData: any;
  onCellSelect: (cell: { framework: string; requirement: string } | null) => void;
}

interface MappingDetail {
  frameworkRequirement: any;
  unifiedRequirement: any;
  mappingType: 'DIRECT' | 'PARTIAL' | 'DERIVED' | 'NO_MAPPING';
  confidence: number;
  details: string[];
  preservedDetails: string[];
  qualityScore: number;
  sourcePath: string[];
  editableMapping?: {
    type: string;
    confidence: number;
    notes: string;
  };
}

export function RequirementMappingDetails({
  selectedCell,
  traceabilityData,
  onCellSelect
}: RequirementMappingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMapping, setEditedMapping] = useState<{
    type: string;
    confidence: number;
    notes: string;
  } | null>(null);

  // Get detailed mapping information
  const mappingDetail = useMemo<MappingDetail | null>(() => {
    if (!selectedCell) return null;

    const { framework, requirement } = selectedCell;
    const { frameworkRequirements, unifiedRequirements, mappingMatrix } = traceabilityData;
    
    // Find framework requirement
    const fwRequirements = frameworkRequirements.get(framework) || [];
    const frameworkRequirement = fwRequirements.find((req: any) => req.id.includes(requirement));
    
    // Find unified requirement
    const unifiedRequirement = unifiedRequirements.find((req: any) => req.id === requirement);
    
    // Find mapping
    const fwMappings = mappingMatrix.get(framework) || new Map();
    const mapping = fwMappings.get(requirement);
    
    if (!frameworkRequirement || !unifiedRequirement) return null;

    return {
      frameworkRequirement,
      unifiedRequirement,
      mappingType: mapping?.type || 'NO_MAPPING',
      confidence: mapping?.confidence || 0,
      details: mapping?.details || [],
      preservedDetails: [
        'Timeline: 72 hours notification',
        'Entity: Data Protection Officer',
        'Mandatory requirement'
      ], // Example preserved details
      qualityScore: 0.85, // Example quality score
      sourcePath: [
        `${framework.toUpperCase()} ${frameworkRequirement.code}`,
        'Intelligent Requirement Mapper',
        `Unified Requirement: ${unifiedRequirement.category}`
      ]
    };
  }, [selectedCell, traceabilityData]);

  // Handle edit mode
  const handleStartEdit = () => {
    if (!mappingDetail) return;
    
    setEditedMapping({
      type: mappingDetail.mappingType,
      confidence: mappingDetail.confidence,
      notes: mappingDetail.details.join('\n')
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editedMapping || !mappingDetail) return;
    
    // Here you would typically save to backend
    console.log('Saving mapping edit:', editedMapping);
    setIsEditing(false);
    setEditedMapping(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMapping(null);
  };

  // Get mapping type color
  const getMappingTypeColor = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'DERIVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Get confidence level description
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: 'Very High', color: 'text-green-600 dark:text-green-400' };
    if (confidence >= 0.7) return { level: 'High', color: 'text-blue-600 dark:text-blue-400' };
    if (confidence >= 0.5) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Low', color: 'text-red-600 dark:text-red-400' };
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!selectedCell || !mappingDetail) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select a Mapping Cell
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Click on any cell in the traceability matrix to view detailed mapping information,
            quality scores, and edit mapping relationships.
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidenceInfo = getConfidenceLevel(mappingDetail.confidence);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Mapping Details</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Framework requirement to unified requirement mapping analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCellSelect(null)}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </Button>
              
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Mapping</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Framework Requirement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Source Framework Requirement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-3 py-1">
                {selectedCell.framework.toUpperCase()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(mappingDetail.frameworkRequirement.code)}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                {mappingDetail.frameworkRequirement.code}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {mappingDetail.frameworkRequirement.title}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Description</h5>
              <ScrollArea className="h-32">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {mappingDetail.frameworkRequirement.description}
                </p>
              </ScrollArea>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Category</h5>
              <Badge variant="secondary">{mappingDetail.frameworkRequirement.category}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Target Unified Requirement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Unified Requirement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                UNIFIED
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(mappingDetail.unifiedRequirement.id)}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                {mappingDetail.unifiedRequirement.category}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {mappingDetail.unifiedRequirement.title}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Description</h5>
              <ScrollArea className="h-32">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {mappingDetail.unifiedRequirement.description}
                </p>
              </ScrollArea>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Requirement ID</h5>
              <Badge variant="secondary" className="font-mono text-xs">
                {mappingDetail.unifiedRequirement.id}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Mapping Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mapping Type */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Mapping Type</h5>
              {!isEditing ? (
                <Badge className={`px-4 py-2 text-sm ${getMappingTypeColor(mappingDetail.mappingType)}`}>
                  {mappingDetail.mappingType.replace('_', ' ')}
                </Badge>
              ) : (
                <Select
                  value={editedMapping?.type}
                  onValueChange={(value) => setEditedMapping(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECT">Direct Mapping</SelectItem>
                    <SelectItem value="PARTIAL">Partial Mapping</SelectItem>
                    <SelectItem value="DERIVED">Derived Mapping</SelectItem>
                    <SelectItem value="NO_MAPPING">No Mapping</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Confidence Score */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Confidence Score</h5>
              {!isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(mappingDetail.confidence * 100)}%
                    </span>
                    <Badge variant="outline" className={confidenceInfo.color}>
                      {confidenceInfo.level}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${mappingDetail.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.round((editedMapping?.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[(editedMapping?.confidence || 0) * 100]}
                    onValueChange={(value) => setEditedMapping(prev => prev ? { ...prev, confidence: value[0] / 100 } : null)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Quality Score */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Quality Score</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mappingDetail.qualityScore.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Based on semantic similarity and rule matching
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mapping Details */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Mapping Details</h5>
            {!isEditing ? (
              <div className="space-y-2">
                {mappingDetail.details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Textarea
                value={editedMapping?.notes || ''}
                onChange={(e) => setEditedMapping(prev => prev ? { ...prev, notes: e.target.value } : null)}
                placeholder="Enter mapping details and reasoning..."
                className="min-h-[100px]"
              />
            )}
          </div>

          {/* Preserved Details */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Preserved Critical Details</h5>
            <div className="space-y-2">
              {mappingDetail.preservedDetails.map((detail, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Path */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Mapping Source Path</h5>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              {mappingDetail.sourcePath.map((step, index) => (
                <React.Fragment key={index}>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{step}</span>
                  {index < mappingDetail.sourcePath.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Improvement Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mappingDetail.confidence < 0.7 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  This mapping has a relatively low confidence score. Consider reviewing the semantic 
                  similarity between requirements or adding manual validation.
                </AlertDescription>
              </Alert>
            )}
            
            {mappingDetail.mappingType === 'PARTIAL' && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  This partial mapping may benefit from additional framework-specific annotations 
                  to capture unique requirements not covered by the unified version.
                </AlertDescription>
              </Alert>
            )}
            
            {mappingDetail.mappingType === 'NO_MAPPING' && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  No mapping found. This framework requirement may need a dedicated unified 
                  requirement or should be mapped to an existing one manually.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}