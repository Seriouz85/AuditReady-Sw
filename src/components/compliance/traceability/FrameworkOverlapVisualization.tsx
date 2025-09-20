import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Layers,
  GitBranch,
  Zap,
  Info,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

interface FrameworkOverlapVisualizationProps {
  selectedFrameworks: FrameworkSelection;
  whatIfFrameworks: FrameworkSelection;
  onWhatIfChange: (frameworks: FrameworkSelection) => void;
  traceabilityData: any;
  isCalculating: boolean;
  onCalculate: (calculating: boolean) => void;
}

interface OverlapMetrics {
  totalRequirements: number;
  uniqueRequirements: number;
  sharedRequirements: number;
  overlapPercentage: number;
  efficiencyGain: number;
  frameworkPairs: FrameworkPairOverlap[];
  heatmapData: number[][];
  frameworks: string[];
}

interface FrameworkPairOverlap {
  framework1: string;
  framework2: string;
  overlapCount: number;
  overlapPercentage: number;
  uniqueToFramework1: number;
  uniqueToFramework2: number;
  efficiency: number;
}

interface WhatIfComparison {
  current: OverlapMetrics;
  whatIf: OverlapMetrics;
  impact: {
    requirementsDelta: number;
    overlapDelta: number;
    efficiencyDelta: number;
    recommendation: string;
  };
}

export function FrameworkOverlapVisualization({
  selectedFrameworks,
  whatIfFrameworks,
  onWhatIfChange,
  traceabilityData,
  isCalculating,
  onCalculate
}: FrameworkOverlapVisualizationProps) {
  const [viewMode, setViewMode] = useState<'heatmap' | 'chord' | 'network'>('heatmap');
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [animateOverlap, setAnimateOverlap] = useState(true);
  const [selectedPair, setSelectedPair] = useState<FrameworkPairOverlap | null>(null);

  // Calculate current framework overlap metrics
  const overlapMetrics = useMemo<OverlapMetrics>(() => {
    const frameworks = Object.keys(selectedFrameworks).filter(
      fw => selectedFrameworks[fw as keyof FrameworkSelection]
    );

    if (frameworks.length === 0) {
      return {
        totalRequirements: 0,
        uniqueRequirements: 0,
        sharedRequirements: 0,
        overlapPercentage: 0,
        efficiencyGain: 0,
        frameworkPairs: [],
        heatmapData: [],
        frameworks: []
      };
    }

    // Calculate requirements per framework
    const frameworkRequirementCounts = new Map<string, number>();
    frameworks.forEach(fw => {
      const reqs = traceabilityData.frameworkRequirements.get(fw) || [];
      frameworkRequirementCounts.set(fw, reqs.length);
    });

    const totalRequirements = Array.from(frameworkRequirementCounts.values())
      .reduce((sum, count) => sum + count, 0);
    
    const uniqueRequirements = traceabilityData.unifiedRequirements.length;
    const sharedRequirements = totalRequirements - uniqueRequirements;
    const overlapPercentage = totalRequirements > 0 ? (sharedRequirements / totalRequirements) * 100 : 0;
    const efficiencyGain = totalRequirements > 0 ? ((totalRequirements - uniqueRequirements) / totalRequirements) * 100 : 0;

    // Calculate pairwise overlaps
    const frameworkPairs: FrameworkPairOverlap[] = [];
    for (let i = 0; i < frameworks.length; i++) {
      for (let j = i + 1; j < frameworks.length; j++) {
        const fw1 = frameworks[i];
        const fw2 = frameworks[j];
        const count1 = frameworkRequirementCounts.get(fw1) || 0;
        const count2 = frameworkRequirementCounts.get(fw2) || 0;
        
        // Simulate overlap calculation (in real implementation, this would use actual requirement similarity)
        const maxCount = Math.max(count1, count2);
        const minCount = Math.min(count1, count2);
        const estimatedOverlap = minCount * (0.3 + Math.random() * 0.4); // 30-70% overlap simulation
        const overlapPercentage = maxCount > 0 ? (estimatedOverlap / maxCount) * 100 : 0;

        frameworkPairs.push({
          framework1: fw1,
          framework2: fw2,
          overlapCount: Math.round(estimatedOverlap),
          overlapPercentage: Math.round(overlapPercentage),
          uniqueToFramework1: count1 - Math.round(estimatedOverlap),
          uniqueToFramework2: count2 - Math.round(estimatedOverlap),
          efficiency: Math.round(overlapPercentage * 0.8) // Efficiency is lower than raw overlap
        });
      }
    }

    // Generate heatmap data
    const heatmapData: number[][] = [];
    for (let i = 0; i < frameworks.length; i++) {
      heatmapData[i] = [];
      for (let j = 0; j < frameworks.length; j++) {
        if (i === j) {
          heatmapData[i][j] = 100; // Self-overlap is 100%
        } else {
          const pair = frameworkPairs.find(p => 
            (p.framework1 === frameworks[i] && p.framework2 === frameworks[j]) ||
            (p.framework1 === frameworks[j] && p.framework2 === frameworks[i])
          );
          heatmapData[i][j] = pair ? pair.overlapPercentage : 0;
        }
      }
    }

    return {
      totalRequirements,
      uniqueRequirements,
      sharedRequirements,
      overlapPercentage: Math.round(overlapPercentage),
      efficiencyGain: Math.round(efficiencyGain),
      frameworkPairs,
      heatmapData,
      frameworks
    };
  }, [selectedFrameworks, traceabilityData]);

  // Calculate what-if comparison
  const whatIfComparison = useMemo<WhatIfComparison | null>(() => {
    if (!showWhatIf) return null;

    // Mock what-if calculation
    const currentFrameworkCount = Object.values(selectedFrameworks).filter(Boolean).length;
    const whatIfFrameworkCount = Object.values(whatIfFrameworks).filter(Boolean).length;
    
    const deltaFrameworks = whatIfFrameworkCount - currentFrameworkCount;
    const estimatedRequirementsDelta = deltaFrameworks * 50; // ~50 requirements per framework
    const estimatedOverlapDelta = deltaFrameworks > 0 ? 15 : -10; // Adding frameworks increases overlap
    const estimatedEfficiencyDelta = deltaFrameworks > 0 ? 12 : -8;

    let recommendation = '';
    if (deltaFrameworks > 0) {
      recommendation = `Adding ${deltaFrameworks} framework(s) would increase requirements by ~${estimatedRequirementsDelta} but improve overlap efficiency by ${estimatedEfficiencyDelta}%.`;
    } else if (deltaFrameworks < 0) {
      recommendation = `Removing ${Math.abs(deltaFrameworks)} framework(s) would reduce requirements by ~${Math.abs(estimatedRequirementsDelta)} but decrease overlap efficiency by ${Math.abs(estimatedEfficiencyDelta)}%.`;
    } else {
      recommendation = 'No changes detected in framework selection.';
    }

    return {
      current: overlapMetrics,
      whatIf: {
        ...overlapMetrics,
        totalRequirements: overlapMetrics.totalRequirements + estimatedRequirementsDelta,
        overlapPercentage: Math.max(0, Math.min(100, overlapMetrics.overlapPercentage + estimatedOverlapDelta)),
        efficiencyGain: Math.max(0, Math.min(100, overlapMetrics.efficiencyGain + estimatedEfficiencyDelta))
      },
      impact: {
        requirementsDelta: estimatedRequirementsDelta,
        overlapDelta: estimatedOverlapDelta,
        efficiencyDelta: estimatedEfficiencyDelta,
        recommendation
      }
    };
  }, [showWhatIf, selectedFrameworks, whatIfFrameworks, overlapMetrics]);

  // Framework display labels
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

  // Get color for overlap percentage
  const getOverlapColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-red-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 30) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get overlap intensity for heatmap
  const getHeatmapIntensity = (percentage: number) => {
    const intensity = Math.round(percentage / 10) * 10;
    return `bg-blue-${Math.min(900, Math.max(100, intensity * 9))}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-purple-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl"
                animate={{ 
                  rotate: animateOverlap ? [0, 360] : 0,
                  scale: animateOverlap ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  duration: 3,
                  repeat: animateOverlap ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <Layers className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Framework Overlap Analysis
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Real-time framework overlap metrics with what-if analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Selector */}
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 rounded-lg p-1 border">
                <Button
                  variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('heatmap')}
                  className="h-8"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Heatmap
                </Button>
                <Button
                  variant={viewMode === 'chord' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chord')}
                  className="h-8"
                >
                  <PieChart className="w-4 h-4 mr-1" />
                  Chord
                </Button>
                <Button
                  variant={viewMode === 'network' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('network')}
                  className="h-8"
                >
                  <GitBranch className="w-4 h-4 mr-1" />
                  Network
                </Button>
              </div>

              {/* Animation Controls */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={animateOverlap}
                  onCheckedChange={setAnimateOverlap}
                  id="animate-overlap"
                />
                <Label htmlFor="animate-overlap" className="text-sm">Animate</Label>
              </div>

              {/* What-If Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showWhatIf}
                  onCheckedChange={setShowWhatIf}
                  id="show-what-if"
                />
                <Label htmlFor="show-what-if" className="text-sm">What-If Mode</Label>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              Total
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {overlapMetrics.totalRequirements}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Total Requirements
            </p>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <motion.div 
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              Unique
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {overlapMetrics.uniqueRequirements}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Unique Requirements
            </p>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
              <motion.div 
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(overlapMetrics.uniqueRequirements / overlapMetrics.totalRequirements) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <GitBranch className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
              Overlap
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {overlapMetrics.overlapPercentage}%
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Framework Overlap
            </p>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
              <motion.div 
                className="bg-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overlapMetrics.overlapPercentage}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
              Efficiency
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {overlapMetrics.efficiencyGain}%
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Efficiency Gain
            </p>
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
              <motion.div 
                className="bg-orange-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overlapMetrics.efficiencyGain}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Visualization */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Framework Overlap {viewMode === 'heatmap' ? 'Heatmap' : viewMode === 'chord' ? 'Diagram' : 'Network'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'heatmap' && (
              <div className="space-y-4">
                {/* Heatmap Header */}
                <div className="grid grid-cols-1 gap-2 text-center">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300"></div>
                    {overlapMetrics.frameworks.map(fw => (
                      <div key={fw} className="text-xs font-medium text-gray-900 dark:text-white p-2">
                        {getFrameworkLabel(fw)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="space-y-2">
                  {overlapMetrics.frameworks.map((fw1, i) => (
                    <motion.div 
                      key={fw1}
                      className="grid grid-cols-6 gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="text-xs font-medium text-gray-900 dark:text-white p-2 text-right">
                        {getFrameworkLabel(fw1)}
                      </div>
                      {overlapMetrics.frameworks.map((fw2, j) => {
                        const overlapPercentage = overlapMetrics.heatmapData[i]?.[j] || 0;
                        const isSelected = selectedPair?.framework1 === fw1 && selectedPair?.framework2 === fw2;
                        
                        return (
                          <TooltipProvider key={`${fw1}-${fw2}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  className={`h-12 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                                    i === j ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' :
                                    overlapPercentage >= 70 ? 'bg-red-500 hover:bg-red-600 border-red-600' :
                                    overlapPercentage >= 50 ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600' :
                                    overlapPercentage >= 30 ? 'bg-blue-500 hover:bg-blue-600 border-blue-600' :
                                    'bg-green-500 hover:bg-green-600 border-green-600'
                                  } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    if (i !== j) {
                                      const pair = overlapMetrics.frameworkPairs.find(p =>
                                        (p.framework1 === fw1 && p.framework2 === fw2) ||
                                        (p.framework1 === fw2 && p.framework2 === fw1)
                                      );
                                      setSelectedPair(pair || null);
                                    }
                                  }}
                                >
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                      {i === j ? '100%' : `${overlapPercentage}%`}
                                    </span>
                                  </div>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {getFrameworkLabel(fw1)} ↔ {getFrameworkLabel(fw2)}
                                  </p>
                                  <p className="text-sm">
                                    Overlap: {i === j ? '100%' : `${overlapPercentage}%`}
                                  </p>
                                  {i !== j && (
                                    <p className="text-xs text-gray-500">
                                      Click for detailed analysis
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Low (0-29%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Medium (30-49%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">High (50-69%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Critical (70%+)</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'chord' && (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center space-y-2">
                  <PieChart className="w-12 h-12 mx-auto" />
                  <p>Chord diagram visualization</p>
                  <p className="text-sm">Interactive chord diagram coming soon</p>
                </div>
              </div>
            )}

            {viewMode === 'network' && (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center space-y-2">
                  <GitBranch className="w-12 h-12 mx-auto" />
                  <p>Network visualization</p>
                  <p className="text-sm">Interactive network graph coming soon</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Framework Pair Details */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Framework Pair Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPair ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {getFrameworkLabel(selectedPair.framework1)}
                    </Badge>
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                      {getFrameworkLabel(selectedPair.framework2)}
                    </Badge>
                  </div>
                  <Badge variant={selectedPair.overlapPercentage >= 50 ? 'destructive' : 'default'}>
                    {selectedPair.overlapPercentage}% overlap
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shared Requirements</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedPair.overlapCount}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency Score</p>
                    <p className="text-2xl font-bold text-green-600">{selectedPair.efficiency}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Unique to {getFrameworkLabel(selectedPair.framework1)}
                    </span>
                    <span className="font-medium">{selectedPair.uniqueToFramework1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Unique to {getFrameworkLabel(selectedPair.framework2)}
                    </span>
                    <span className="font-medium">{selectedPair.uniqueToFramework2}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Consolidation Potential:</strong> {
                      selectedPair.overlapPercentage >= 70 ? 'High - Consider consolidating overlapping requirements' :
                      selectedPair.overlapPercentage >= 50 ? 'Medium - Review for consolidation opportunities' :
                      selectedPair.overlapPercentage >= 30 ? 'Low - Minimal consolidation potential' :
                      'Very Low - Frameworks complement each other well'
                    }
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <div className="text-center space-y-2">
                  <Eye className="w-12 h-12 mx-auto" />
                  <p>Select a framework pair</p>
                  <p className="text-sm">Click on a heatmap cell to view detailed analysis</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* What-If Analysis */}
      <AnimatePresence>
        {showWhatIf && whatIfComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                  <Zap className="w-5 h-5" />
                  <span>What-If Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Current vs What-If Comparison */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Impact Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Requirements Delta</span>
                        <div className="flex items-center space-x-1">
                          {whatIfComparison.impact.requirementsDelta > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : whatIfComparison.impact.requirementsDelta < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className={`font-medium ${
                            whatIfComparison.impact.requirementsDelta > 0 ? 'text-green-600' :
                            whatIfComparison.impact.requirementsDelta < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {whatIfComparison.impact.requirementsDelta > 0 ? '+' : ''}{whatIfComparison.impact.requirementsDelta}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Overlap Delta</span>
                        <div className="flex items-center space-x-1">
                          {whatIfComparison.impact.overlapDelta > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : whatIfComparison.impact.overlapDelta < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className={`font-medium ${
                            whatIfComparison.impact.overlapDelta > 0 ? 'text-green-600' :
                            whatIfComparison.impact.overlapDelta < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {whatIfComparison.impact.overlapDelta > 0 ? '+' : ''}{whatIfComparison.impact.overlapDelta}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Efficiency Delta</span>
                        <div className="flex items-center space-x-1">
                          {whatIfComparison.impact.efficiencyDelta > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : whatIfComparison.impact.efficiencyDelta < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className={`font-medium ${
                            whatIfComparison.impact.efficiencyDelta > 0 ? 'text-green-600' :
                            whatIfComparison.impact.efficiencyDelta < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {whatIfComparison.impact.efficiencyDelta > 0 ? '+' : ''}{whatIfComparison.impact.efficiencyDelta}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Framework Selection */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">What-If Framework Selection</h4>
                    <div className="space-y-2">
                      {Object.entries(whatIfFrameworks).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={`whatif-${key}`} className="text-sm">
                            {getFrameworkLabel(key)}
                          </Label>
                          <Switch
                            id={`whatif-${key}`}
                            checked={!!value}
                            onCheckedChange={(checked) => {
                              onWhatIfChange({
                                ...whatIfFrameworks,
                                [key]: checked
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Recommendation</h4>
                    <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {whatIfComparison.impact.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}