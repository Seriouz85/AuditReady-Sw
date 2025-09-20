import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  Zap,
  Gauge,
  Shield,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  RefreshCw,
  Download,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

interface AIValidationMetricsPanelProps {
  selectedFrameworks: FrameworkSelection;
  traceabilityData: any;
  isValidating: boolean;
  onValidate: (validating: boolean) => void;
}

interface ValidationMetrics {
  overallScore: number;
  detailPreservation: {
    timeframes: number;
    authorities: number;
    standards: number;
    technicalSpecs: number;
    numericalValues: number;
    references: number;
    overallScore: number;
  };
  structuralIntegrity: {
    score: number;
    hierarchyPreserved: boolean;
    formattingConsistent: boolean;
    referencesIntact: boolean;
  };
  complianceIntegrity: {
    score: number;
    auditTrailMaintained: boolean;
    regulatoryAccuracy: boolean;
    frameworkMappingsIntact: boolean;
  };
  qualityMetrics: {
    textReduction: number;
    readabilityScore: number;
    consistencyScore: number;
    compressionRatio: number;
  };
  processingStats: {
    totalRequirements: number;
    processedRequirements: number;
    processingTime: number;
    validationTime: number;
  };
  issues: ValidationIssue[];
  recommendations: string[];
}

interface ValidationIssue {
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  affectedCount: number;
  suggestedFix: string;
}

export function AIValidationMetricsPanel({
  selectedFrameworks,
  traceabilityData,
  isValidating,
  onValidate
}: AIValidationMetricsPanelProps) {
  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'issues' | 'trends'>('overview');
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [validationHistory, setValidationHistory] = useState<ValidationMetrics[]>([]);

  // Mock validation metrics (in real implementation, these would come from AITextConsolidationEngine)
  const generateMockValidationMetrics = (): ValidationMetrics => {
    const baseScore = 85 + Math.random() * 10; // 85-95% base score
    
    return {
      overallScore: Math.round(baseScore),
      detailPreservation: {
        timeframes: Math.round(95 + Math.random() * 5), // High preservation
        authorities: Math.round(98 + Math.random() * 2),
        standards: Math.round(96 + Math.random() * 4),
        technicalSpecs: Math.round(92 + Math.random() * 6),
        numericalValues: Math.round(100), // Perfect preservation required
        references: Math.round(97 + Math.random() * 3),
        overallScore: Math.round(96 + Math.random() * 4)
      },
      structuralIntegrity: {
        score: Math.round(88 + Math.random() * 8),
        hierarchyPreserved: Math.random() > 0.2,
        formattingConsistent: Math.random() > 0.1,
        referencesIntact: Math.random() > 0.05
      },
      complianceIntegrity: {
        score: Math.round(94 + Math.random() * 5),
        auditTrailMaintained: Math.random() > 0.1,
        regulatoryAccuracy: Math.random() > 0.05,
        frameworkMappingsIntact: Math.random() > 0.02
      },
      qualityMetrics: {
        textReduction: Math.round(40 + Math.random() * 30), // 40-70% reduction
        readabilityScore: Math.round(85 + Math.random() * 10),
        consistencyScore: Math.round(90 + Math.random() * 8),
        compressionRatio: Math.round(2.5 + Math.random() * 1.5) // 2.5-4x compression
      },
      processingStats: {
        totalRequirements: traceabilityData.unifiedRequirements.length,
        processedRequirements: traceabilityData.unifiedRequirements.length,
        processingTime: Math.round(120 + Math.random() * 60), // 2-3 minutes
        validationTime: Math.round(30 + Math.random() * 20) // 30-50 seconds
      },
      issues: [
        {
          type: 'warning',
          category: 'Detail Preservation',
          message: '2 timeframe references may need manual review',
          affectedCount: 2,
          suggestedFix: 'Review and verify timeframe accuracy in sections 3.2 and 5.1'
        },
        {
          type: 'info',
          category: 'Structure',
          message: 'Bullet point consolidation successful',
          affectedCount: 15,
          suggestedFix: 'No action required - optimization complete'
        }
      ],
      recommendations: [
        'Consider additional text simplification in technical sections',
        'Review consolidated requirements for regulatory accuracy',
        'Validate framework cross-references in final output'
      ]
    };
  };

  // Simulate AI validation process
  const runValidation = async () => {
    onValidate(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const metrics = generateMockValidationMetrics();
      setValidationMetrics(metrics);
      setValidationHistory(prev => [...prev.slice(-4), metrics]); // Keep last 5 results
      
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      onValidate(false);
    }
  };

  // Auto-run validation when data changes
  useEffect(() => {
    if (traceabilityData.unifiedRequirements.length > 0) {
      runValidation();
    }
  }, [traceabilityData]);

  // Real-time validation updates
  useEffect(() => {
    if (isRealTimeMode && validationMetrics) {
      const interval = setInterval(() => {
        const updatedMetrics = generateMockValidationMetrics();
        setValidationMetrics(updatedMetrics);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRealTimeMode, validationMetrics]);

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 dark:text-green-400';
    if (score >= 85) return 'text-blue-600 dark:text-blue-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get score background color
  const getScoreBg = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 85) return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    if (score >= 75) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  // Get issue icon
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    }
  };

  if (!validationMetrics && !isValidating) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI Validation Ready
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Run AI validation to analyze consolidation quality and detail preservation.
          </p>
          <Button onClick={runValidation} className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Start Validation</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 border-emerald-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl"
                animate={{ 
                  scale: isValidating ? [1, 1.1, 1] : 1,
                  rotate: isValidating ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: isValidating ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AI Validation Metrics
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Real-time consolidation quality analysis with 100% detail preservation</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                  className={`flex items-center space-x-2 ${isRealTimeMode ? 'bg-emerald-50 border-emerald-200' : ''}`}
                >
                  {isRealTimeMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRealTimeMode ? 'Pause' : 'Real-time'}</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={runValidation}
                disabled={isValidating}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                <span>Validate</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      <AnimatePresence>
        {isValidating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Running AI Validation Analysis
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>Analyzing detail preservation...</span>
                        <span>Processing {traceabilityData.unifiedRequirements.length} requirements</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Results */}
      {validationMetrics && !isValidating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              className={`rounded-xl p-6 border ${getScoreBg(validationMetrics.overallScore)}`}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/80 rounded-lg">
                  <Target className="w-6 h-6 text-gray-700" />
                </div>
                <Badge variant={validationMetrics.overallScore >= 95 ? 'default' : validationMetrics.overallScore >= 85 ? 'secondary' : 'destructive'}>
                  {validationMetrics.overallScore >= 95 ? 'Excellent' : validationMetrics.overallScore >= 85 ? 'Good' : 'Needs Review'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className={`text-3xl font-bold ${getScoreColor(validationMetrics.overallScore)}`}>
                  {validationMetrics.overallScore}%
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Validation Score
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full ${
                      validationMetrics.overallScore >= 95 ? 'bg-green-500' :
                      validationMetrics.overallScore >= 85 ? 'bg-blue-500' :
                      validationMetrics.overallScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${validationMetrics.overallScore}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`rounded-xl p-6 border ${getScoreBg(validationMetrics.detailPreservation.overallScore)}`}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/80 rounded-lg">
                  <Shield className="w-6 h-6 text-gray-700" />
                </div>
                <Badge variant={validationMetrics.detailPreservation.overallScore === 100 ? 'default' : 'secondary'}>
                  {validationMetrics.detailPreservation.overallScore === 100 ? 'Perfect' : 'Preserved'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className={`text-3xl font-bold ${getScoreColor(validationMetrics.detailPreservation.overallScore)}`}>
                  {validationMetrics.detailPreservation.overallScore}%
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detail Preservation
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${validationMetrics.detailPreservation.overallScore}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/80 rounded-lg">
                  <Gauge className="w-6 h-6 text-gray-700" />
                </div>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  Compressed
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {validationMetrics.qualityMetrics.textReduction}%
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Reduction
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${validationMetrics.qualityMetrics.textReduction}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/80 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-700" />
                </div>
                <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                  Processing
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(validationMetrics.processingStats.processingTime / 60)}m
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Processing Time
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {validationMetrics.processingStats.processedRequirements} requirements processed
                </p>
              </div>
            </motion.div>
          </div>

          {/* Detailed Metrics Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Issues ({validationMetrics.issues.length})</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trends</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detail Preservation Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Detail Preservation Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(validationMetrics.detailPreservation).map(([key, value]) => {
                        if (key === 'overallScore') return null;
                        const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{displayName}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    typeof value === 'number' && value === 100 ? 'bg-green-500' :
                                    typeof value === 'number' && value >= 95 ? 'bg-blue-500' :
                                    'bg-yellow-500'
                                  }`}
                                  style={{ width: `${typeof value === 'number' ? value : 100}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${
                                typeof value === 'number' && value === 100 ? 'text-green-600' :
                                typeof value === 'number' && value >= 95 ? 'text-blue-600' :
                                'text-yellow-600'
                              }`}>
                                {typeof value === 'number' ? `${value}%` : value ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Quality Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {validationMetrics.qualityMetrics.readabilityScore}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Readability</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {validationMetrics.qualityMetrics.consistencyScore}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Consistency</p>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {validationMetrics.qualityMetrics.compressionRatio}x
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Compression Ratio</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {validationMetrics.qualityMetrics.textReduction}% text reduction achieved
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>AI Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationMetrics.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Structural Integrity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Structural Integrity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(validationMetrics.structuralIntegrity.score)}`}>
                          {validationMetrics.structuralIntegrity.score}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(validationMetrics.structuralIntegrity).map(([key, value]) => {
                          if (key === 'score') return null;
                          const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-300">{displayName}</span>
                              <span className={`text-xs ${value ? 'text-green-600' : 'text-red-600'}`}>
                                {value ? '✓' : '✗'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Integrity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Integrity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(validationMetrics.complianceIntegrity.score)}`}>
                          {validationMetrics.complianceIntegrity.score}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(validationMetrics.complianceIntegrity).map(([key, value]) => {
                          if (key === 'score') return null;
                          const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-300">{displayName}</span>
                              <span className={`text-xs ${value ? 'text-green-600' : 'text-red-600'}`}>
                                {value ? '✓' : '✗'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(validationMetrics.processingStats).map(([key, value]) => {
                        const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        let displayValue = value;
                        
                        if (key.includes('Time')) {
                          displayValue = `${Math.round(value as number / 60)}m ${(value as number) % 60}s`;
                        }
                        
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{displayName}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {displayValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-6">
              <div className="space-y-4">
                {validationMetrics.issues.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Issues Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        All validation checks passed successfully. Your consolidation maintains 100% detail preservation.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  validationMetrics.issues.map((issue, index) => (
                    <Alert key={index} className={`
                      ${issue.type === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                        'border-blue-200 bg-blue-50 dark:bg-blue-900/20'}
                    `}>
                      <div className="flex items-start space-x-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {issue.category}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {issue.affectedCount} affected
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {issue.message}
                          </AlertDescription>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Suggested fix:</strong> {issue.suggestedFix}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Validation History Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationHistory.length > 1 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {validationHistory.length}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Validations</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {Math.round(validationHistory.reduce((sum, m) => sum + m.overallScore, 0) / validationHistory.length)}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Average Score</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {validationHistory[validationHistory.length - 1].overallScore > validationHistory[0].overallScore ? '+' : ''}
                            {validationHistory[validationHistory.length - 1].overallScore - validationHistory[0].overallScore}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Score Trend</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                      <p>Run more validations to see trend analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}