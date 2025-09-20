import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  Shield,
  FileSearch,
  Lightbulb,
  ArrowRight,
  PieChart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

interface CoverageGapAnalysisProps {
  traceabilityData: any;
  selectedFrameworks: FrameworkSelection;
  onFrameworkFilter: (framework: string) => void;
}

interface CoverageMetrics {
  framework: string;
  label: string;
  totalRequirements: number;
  mappedRequirements: number;
  coveragePercentage: number;
  qualityScore: number;
  gaps: Gap[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface Gap {
  id: string;
  type: 'MISSING_MAPPING' | 'LOW_CONFIDENCE' | 'PARTIAL_COVERAGE' | 'SEMANTIC_DRIFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requirement: any;
  description: string;
  recommendation: string;
  impact: string;
}

interface Recommendation {
  id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  description: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: string;
  steps: string[];
}

export function CoverageGapAnalysis({
  traceabilityData,
  selectedFrameworks,
  onFrameworkFilter
}: CoverageGapAnalysisProps) {
  const [activeView, setActiveView] = useState<'overview' | 'gaps' | 'recommendations'>('overview');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Calculate coverage metrics for each framework
  const coverageMetrics = useMemo<CoverageMetrics[]>(() => {
    const { frameworkRequirements, mappingMatrix } = traceabilityData;
    const metrics: CoverageMetrics[] = [];

    const frameworkLabels: Record<string, string> = {
      iso27001: 'ISO 27001',
      iso27002: 'ISO 27002',
      cisControls: 'CIS Controls',
      gdpr: 'GDPR',
      nis2: 'NIS2',
      dora: 'DORA'
    };

    frameworkRequirements.forEach((requirements: any[], framework: string) => {
      const mappings = mappingMatrix.get(framework) || new Map();
      const totalRequirements = requirements.length;
      const mappedRequirements = mappings.size;
      const coveragePercentage = totalRequirements > 0 ? 
        Math.round((mappedRequirements / totalRequirements) * 100) : 0;

      // Calculate quality score based on mapping confidence
      let qualitySum = 0;
      let qualityCount = 0;
      mappings.forEach((mapping: any) => {
        qualitySum += mapping.confidence || 0;
        qualityCount++;
      });
      const qualityScore = qualityCount > 0 ? qualitySum / qualityCount : 0;

      // Identify gaps
      const gaps: Gap[] = [];
      
      // Missing mappings
      requirements.forEach((req: any) => {
        const hasMapping = Array.from(mappings.keys()).some(key => 
          mappings.get(key)?.frameworkReferences?.includes(`${framework} ${req.code}`)
        );
        
        if (!hasMapping) {
          gaps.push({
            id: `missing-${req.id}`,
            type: 'MISSING_MAPPING',
            severity: 'HIGH',
            requirement: req,
            description: `No unified requirement mapping found for ${req.code}`,
            recommendation: 'Create a new unified requirement or map to existing one',
            impact: 'Compliance gap - framework requirement not addressed'
          });
        }
      });

      // Low confidence mappings
      mappings.forEach((mapping: any, key: string) => {
        if ((mapping.confidence || 0) < 0.6) {
          const req = requirements.find((r: any) => 
            mapping.frameworkReferences?.includes(`${framework} ${r.code}`)
          );
          
          if (req) {
            gaps.push({
              id: `low-confidence-${key}`,
              type: 'LOW_CONFIDENCE',
              severity: 'MEDIUM',
              requirement: req,
              description: `Low confidence mapping (${Math.round((mapping.confidence || 0) * 100)}%)`,
              recommendation: 'Review and improve mapping accuracy',
              impact: 'Potential misalignment between framework and unified requirements'
            });
          }
        }
      });

      // Determine risk level
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (coveragePercentage < 50) riskLevel = 'CRITICAL';
      else if (coveragePercentage < 70) riskLevel = 'HIGH';
      else if (coveragePercentage < 90) riskLevel = 'MEDIUM';

      metrics.push({
        framework,
        label: frameworkLabels[framework] || framework.toUpperCase(),
        totalRequirements,
        mappedRequirements,
        coveragePercentage,
        qualityScore,
        gaps,
        riskLevel
      });
    });

    return metrics.sort((a, b) => b.coveragePercentage - a.coveragePercentage);
  }, [traceabilityData]);

  // Generate improvement recommendations
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];
    
    coverageMetrics.forEach(metric => {
      // Low coverage recommendations
      if (metric.coveragePercentage < 80) {
        recs.push({
          id: `coverage-${metric.framework}`,
          priority: metric.coveragePercentage < 50 ? 'CRITICAL' : 'HIGH',
          category: 'Coverage Improvement',
          title: `Improve ${metric.label} Coverage`,
          description: `Current coverage is ${metric.coveragePercentage}%. Missing mappings for ${metric.totalRequirements - metric.mappedRequirements} requirements.`,
          effort: 'MEDIUM',
          impact: 'Reduced compliance gaps and better requirement alignment',
          steps: [
            'Review unmapped framework requirements',
            'Identify similar unified requirements for mapping',
            'Create new unified requirements where needed',
            'Validate mapping accuracy and confidence'
          ]
        });
      }

      // Quality improvement recommendations
      if (metric.qualityScore < 0.7) {
        recs.push({
          id: `quality-${metric.framework}`,
          priority: 'MEDIUM',
          category: 'Quality Enhancement',
          title: `Enhance ${metric.label} Mapping Quality`,
          description: `Average mapping confidence is ${Math.round(metric.qualityScore * 100)}%. Consider improving semantic analysis.`,
          effort: 'HIGH',
          impact: 'More accurate requirement mappings and better compliance alignment',
          steps: [
            'Review low-confidence mappings',
            'Enhance semantic similarity algorithms',
            'Add manual validation for critical requirements',
            'Implement feedback loops for continuous improvement'
          ]
        });
      }

      // Gap-specific recommendations
      const criticalGaps = metric.gaps.filter(g => g.severity === 'CRITICAL').length;
      if (criticalGaps > 0) {
        recs.push({
          id: `gaps-${metric.framework}`,
          priority: 'CRITICAL',
          category: 'Critical Gap Resolution',
          title: `Address Critical ${metric.label} Gaps`,
          description: `${criticalGaps} critical gaps identified that could impact compliance.`,
          effort: 'HIGH',
          impact: 'Eliminate critical compliance gaps and reduce audit risk',
          steps: [
            'Prioritize critical gap resolution',
            'Create immediate mapping actions',
            'Implement temporary controls where needed',
            'Schedule comprehensive gap analysis review'
          ]
        });
      }
    });

    return recs.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [coverageMetrics]);

  // Filter gaps based on selected framework and severity
  const filteredGaps = useMemo(() => {
    let allGaps: Gap[] = [];
    
    if (selectedFramework === 'all') {
      allGaps = coverageMetrics.flatMap(metric => 
        metric.gaps.map(gap => ({ ...gap, framework: metric.framework, frameworkLabel: metric.label }))
      );
    } else {
      const metric = coverageMetrics.find(m => m.framework === selectedFramework);
      if (metric) {
        allGaps = metric.gaps.map(gap => ({ ...gap, framework: metric.framework, frameworkLabel: metric.label }));
      }
    }

    if (severityFilter !== 'all') {
      allGaps = allGaps.filter(gap => gap.severity === severityFilter);
    }

    return allGaps.sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [coverageMetrics, selectedFramework, severityFilter]);

  // Get framework options
  const frameworkOptions = [
    { value: 'all', label: 'All Frameworks' },
    ...coverageMetrics.map(metric => ({
      value: metric.framework,
      label: metric.label
    }))
  ];

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Coverage Gap Analysis</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Identify mapping gaps and improvement opportunities across frameworks
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 shadow-lg border">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <PieChart className="w-4 h-4" />
            <span>Coverage Overview</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Gap Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Recommendations</span>
          </TabsTrigger>
        </TabsList>

        {/* Coverage Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {coverageMetrics.map((metric, index) => (
              <motion.div
                key={metric.framework}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.label}</CardTitle>
                      <Badge className={`px-2 py-1 text-xs ${getRiskColor(metric.riskLevel)}`}>
                        {metric.riskLevel} RISK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coverage Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Coverage
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {metric.coveragePercentage}%
                        </span>
                      </div>
                      <Progress value={metric.coveragePercentage} className="h-2" />
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{metric.mappedRequirements} mapped</span>
                        <span>{metric.totalRequirements} total</span>
                      </div>
                    </div>

                    {/* Quality Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quality Score
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {Math.round(metric.qualityScore * 100)}%
                        </span>
                      </div>
                      <Progress value={metric.qualityScore * 100} className="h-2" />
                    </div>

                    {/* Gap Summary */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <div className="text-xl font-bold text-red-600 dark:text-red-400">
                            {metric.gaps.filter(g => g.severity === 'CRITICAL' || g.severity === 'HIGH').length}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Critical/High</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {metric.gaps.filter(g => g.severity === 'MEDIUM' || g.severity === 'LOW').length}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Medium/Low</div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFramework(metric.framework);
                        setActiveView('gaps');
                      }}
                      className="w-full flex items-center space-x-2"
                    >
                      <FileSearch className="w-4 h-4" />
                      <span>View Gaps</span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Gap Analysis */}
        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span>Identified Gaps</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="px-3 py-1">
                    {filteredGaps.length} gaps found
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredGaps.map((gap, index) => (
                    <motion.div
                      key={gap.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={`px-2 py-1 text-xs ${getSeverityColor(gap.severity)}`}>
                            {gap.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {gap.frameworkLabel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {gap.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {gap.requirement.code}: {gap.requirement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {gap.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Recommendation:
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {gap.recommendation}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Impact:
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {gap.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredGaps.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Gaps Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Great! No gaps were identified with the current filters.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {rec.category}
                        </p>
                      </div>
                      <Badge className={`px-2 py-1 text-xs ${getSeverityColor(rec.priority)}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {rec.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Effort:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {rec.effort}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Priority:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expected Impact:
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {rec.impact}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Implementation Steps:
                      </span>
                      <div className="space-y-2">
                        {rec.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start space-x-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center mt-0.5 flex-shrink-0">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {recommendations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Excellent Coverage!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your framework mappings are in great shape. No immediate recommendations needed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}