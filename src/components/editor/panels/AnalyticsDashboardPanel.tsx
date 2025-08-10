/**
 * 📊 Analytics Dashboard Panel - Advanced Process Insights
 * Beautiful analytics and insights for diagram optimization
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  BarChart3, TrendingUp, TrendingDown, Activity, Target, Clock,
  Users, Zap, AlertTriangle, CheckCircle, Eye, ArrowRight,
  PieChart, LineChart, Network, Workflow, Database, Shield,
  RefreshCw, Download, Share2, Filter, Calendar, MapPin,
  Star, Award, Crown, Sparkles, ThumbsUp, ThumbsDown,
  ArrowUp, ArrowDown, Minus, Plus, Info, HelpCircle
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';

interface AnalyticsDashboardPanelProps {
  onClose: () => void;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'percentage' | 'time' | 'currency';
  icon: any;
  color: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'warning' | 'success' | 'info';
  priority: 'high' | 'medium' | 'low';
  action?: string;
  impact: number;
}

const AnalyticsDashboardPanel: React.FC<AnalyticsDashboardPanelProps> = ({ onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('complexity');

  const { nodes, edges, selectedNodes } = useDiagramStore();

  // Calculate diagram complexity metrics
  const complexity = useMemo(() => {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const avgConnections = nodeCount > 0 ? edgeCount / nodeCount : 0;
    
    // Complexity score (0-100)
    const complexityScore = Math.min(
      100,
      (nodeCount * 2) + (edgeCount * 1.5) + (avgConnections * 10)
    );
    
    return {
      score: Math.round(complexityScore),
      nodes: nodeCount,
      edges: edgeCount,
      avgConnections: Math.round(avgConnections * 100) / 100
    };
  }, [nodes, edges]);

  // Mock metrics data
  const metrics: Metric[] = [
    {
      id: 'complexity',
      name: 'Complexity Score',
      value: complexity.score,
      change: -12,
      changeType: 'decrease',
      format: 'number',
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'readability',
      name: 'Readability',
      value: 87,
      change: 15,
      changeType: 'increase',
      format: 'percentage',
      icon: Eye,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'efficiency',
      name: 'Process Efficiency',
      value: 92,
      change: 8,
      changeType: 'increase',
      format: 'percentage',
      icon: Zap,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'compliance',
      name: 'Compliance Score',
      value: 94,
      change: 3,
      changeType: 'increase',
      format: 'percentage',
      icon: Shield,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'collaboration',
      name: 'Team Engagement',
      value: 76,
      change: -5,
      changeType: 'decrease',
      format: 'percentage',
      icon: Users,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'time-saved',
      name: 'Time Saved',
      value: 240,
      change: 45,
      changeType: 'increase',
      format: 'time',
      icon: Clock,
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  // Smart insights
  const insights: Insight[] = [
    {
      id: 'complexity-warning',
      title: 'High Process Complexity Detected',
      description: 'Your diagram has 15+ decision points. Consider breaking into sub-processes for better readability.',
      type: 'warning',
      priority: 'high',
      action: 'Optimize Layout',
      impact: 85
    },
    {
      id: 'compliance-gap',
      title: 'ISO 27001 Compliance Gap',
      description: 'Missing 3 required control points in your security process. Add checkpoints to meet standards.',
      type: 'warning',
      priority: 'high',
      action: 'Add Controls',
      impact: 92
    },
    {
      id: 'efficiency-improvement',
      title: 'Process Bottleneck Identified',
      description: 'Step 7 (Manager Approval) creates delays. Consider parallel approval workflows.',
      type: 'optimization',
      priority: 'medium',
      action: 'Optimize Process',
      impact: 67
    },
    {
      id: 'template-suggestion',
      title: 'Better Template Available',
      description: 'Switch to "Advanced ISO Process" template for 23% better structure and compliance coverage.',
      type: 'info',
      priority: 'medium',
      action: 'Apply Template',
      impact: 74
    },
    {
      id: 'collaboration-success',
      title: 'Great Team Collaboration!',
      description: 'Your team made 47 productive edits this week. Collaboration score increased by 12%.',
      type: 'success',
      priority: 'low',
      action: 'Share Report',
      impact: 56
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'time':
        return `${value}m`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toString();
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'decrease':
        return <ArrowDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'optimization':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-orange-50/20 to-red-50/20">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Analytics & Insights
              </h2>
              <p className="text-sm text-gray-500">Process optimization and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-20 h-8 bg-white/70 border-gray-200/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Key Metrics</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                
                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/95 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatValue(metric.value, metric.format)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm">
                            {getChangeIcon(metric.changeType)}
                            <span className={`font-medium ${
                              metric.changeType === 'increase' ? 'text-green-600' :
                              metric.changeType === 'decrease' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {Math.abs(metric.change)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Diagram Health */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Diagram Health</span>
            </h3>
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Overall Health</span>
                      <span className="text-sm font-bold text-gray-900">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{complexity.nodes}</p>
                      <p className="text-xs text-gray-500">Nodes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{complexity.edges}</p>
                      <p className="text-xs text-gray-500">Connections</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{complexity.avgConnections}</p>
                      <p className="text-xs text-gray-500">Avg/Node</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Insights */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Smart Insights</span>
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/95 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                              {insight.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(insight.priority)}`}
                              >
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                {insight.impact}% impact
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/70 hover:bg-white border-gray-200/50 group-hover:border-blue-300 group-hover:text-blue-600"
                            >
                              {insight.action}
                              <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Trends */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Trends</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Quality Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Structure</span>
                      <span className="text-xs font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Clarity</span>
                      <span className="text-xs font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-1.5" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Completeness</span>
                      <span className="text-xs font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Time Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Creation Time</span>
                      <span className="text-xs font-medium">12m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Review Time</span>
                      <span className="text-xs font-medium">8m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Time Saved</span>
                      <span className="text-xs font-medium text-green-600">+45m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200/50 bg-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <RefreshCw className="w-3 h-3" />
            <span>Updated 2 minutes ago</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-white border-gray-200/50">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-white border-gray-200/50">
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPanel;