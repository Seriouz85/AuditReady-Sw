import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Grid, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  Target,
  Activity,
  Bell,
  Database,
  GitBranch,
  Zap,
  Search,
  Plus,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Palette,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings2,
  Maximize2,
  Move3D,
  Layers3,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'alert' | 'custom';
  title: string;
  description: string;
  icon: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'full';
  category: string;
  isPro?: boolean;
  isNew?: boolean;
  dataSource?: string;
  refreshInterval?: number;
}

interface WidgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface ModernDashboardCustomizationProps {
  organizationId: string;
  onClose?: () => void;
  onAddWidget?: (widget: DashboardWidget) => void;
  activeWidgets?: string[];
}

export function ModernDashboardCustomization({
  organizationId,
  onClose,
  onAddWidget,
  activeWidgets = []
}: ModernDashboardCustomizationProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // Widget categories
  const categories: WidgetCategory[] = [
    { id: 'all', name: 'All Widgets', icon: <Grid className="h-4 w-4" />, count: 18 },
    { id: 'metrics', name: 'Metrics', icon: <TrendingUp className="h-4 w-4" />, count: 6 },
    { id: 'charts', name: 'Charts', icon: <BarChart3 className="h-4 w-4" />, count: 4 },
    { id: 'activity', name: 'Activity', icon: <Activity className="h-4 w-4" />, count: 3 },
    { id: 'compliance', name: 'Compliance', icon: <Shield className="h-4 w-4" />, count: 5 },
  ];

  // Available widgets with rich metadata
  const availableWidgets: DashboardWidget[] = [
    // Metrics
    {
      id: 'compliance-score',
      type: 'metric',
      title: 'Compliance Score',
      description: 'Real-time compliance percentage across all frameworks',
      icon: <Shield className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      dataSource: 'compliance_metrics',
      refreshInterval: 15,
    },
    {
      id: 'risk-score',
      type: 'metric',
      title: 'Risk Score',
      description: 'Current organizational risk assessment score',
      icon: <Target className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      isPro: true,
      dataSource: 'risk_assessments',
      refreshInterval: 30,
    },
    {
      id: 'active-assessments',
      type: 'metric',
      title: 'Active Assessments',
      description: 'Number of ongoing compliance assessments',
      icon: <FileText className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      dataSource: 'assessments',
      refreshInterval: 10,
    },
    {
      id: 'team-productivity',
      type: 'metric',
      title: 'Team Productivity',
      description: 'Team efficiency and task completion metrics',
      icon: <Users className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      isNew: true,
      dataSource: 'team_metrics',
      refreshInterval: 60,
    },
    {
      id: 'audit-readiness',
      type: 'metric',
      title: 'Audit Readiness',
      description: 'Overall audit preparation status',
      icon: <CheckCircle2 className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      dataSource: 'audit_metrics',
      refreshInterval: 30,
    },
    {
      id: 'data-classification',
      type: 'metric',
      title: 'Data Classification',
      description: 'Classified vs unclassified data ratio',
      icon: <Database className="h-5 w-5" />,
      size: 'small',
      category: 'metrics',
      isNew: true,
      dataSource: 'data_classification',
      refreshInterval: 60,
    },

    // Charts
    {
      id: 'compliance-trends',
      type: 'chart',
      title: 'Compliance Trends',
      description: 'Historical compliance scores over time',
      icon: <TrendingUp className="h-5 w-5" />,
      size: 'medium',
      category: 'charts',
      dataSource: 'compliance_history',
      refreshInterval: 60,
    },
    {
      id: 'risk-heatmap',
      type: 'chart',
      title: 'Risk Heatmap',
      description: 'Visual representation of risk areas',
      icon: <GitBranch className="h-5 w-5" />,
      size: 'large',
      category: 'charts',
      isPro: true,
      dataSource: 'risk_matrix',
      refreshInterval: 30,
    },
    {
      id: 'framework-coverage',
      type: 'chart',
      title: 'Framework Coverage',
      description: 'Compliance coverage by framework',
      icon: <PieChart className="h-5 w-5" />,
      size: 'medium',
      category: 'charts',
      dataSource: 'framework_stats',
      refreshInterval: 60,
    },
    {
      id: 'control-effectiveness',
      type: 'chart',
      title: 'Control Effectiveness',
      description: 'Security control performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      size: 'medium',
      category: 'charts',
      isNew: true,
      dataSource: 'control_metrics',
      refreshInterval: 30,
    },

    // Activity & Alerts
    {
      id: 'recent-activities',
      type: 'activity',
      title: 'Recent Activities',
      description: 'Latest team activities and updates',
      icon: <Activity className="h-5 w-5" />,
      size: 'medium',
      category: 'activity',
      dataSource: 'activity_feed',
      refreshInterval: 5,
    },
    {
      id: 'security-alerts',
      type: 'alert',
      title: 'Security Alerts',
      description: 'Active security notifications and warnings',
      icon: <Bell className="h-5 w-5" />,
      size: 'medium',
      category: 'activity',
      isPro: true,
      dataSource: 'security_alerts',
      refreshInterval: 5,
    },
    {
      id: 'audit-timeline',
      type: 'activity',
      title: 'Audit Timeline',
      description: 'Upcoming audit events and deadlines',
      icon: <Clock className="h-5 w-5" />,
      size: 'large',
      category: 'activity',
      isNew: true,
      dataSource: 'audit_schedule',
      refreshInterval: 60,
    },

    // Compliance specific
    {
      id: 'compliance-matrix',
      type: 'table',
      title: 'Compliance Matrix',
      description: 'Detailed compliance requirements matrix',
      icon: <Grid className="h-5 w-5" />,
      size: 'full',
      category: 'compliance',
      dataSource: 'compliance_matrix',
      refreshInterval: 60,
    },
    {
      id: 'policy-status',
      type: 'table',
      title: 'Policy Status',
      description: 'Organization policy review status',
      icon: <FileText className="h-5 w-5" />,
      size: 'medium',
      category: 'compliance',
      dataSource: 'policy_tracking',
      refreshInterval: 30,
    },
    {
      id: 'vendor-compliance',
      type: 'table',
      title: 'Vendor Compliance',
      description: 'Third-party vendor compliance tracking',
      icon: <Users className="h-5 w-5" />,
      size: 'large',
      category: 'compliance',
      isPro: true,
      dataSource: 'vendor_compliance',
      refreshInterval: 60,
    },
    {
      id: 'evidence-collection',
      type: 'activity',
      title: 'Evidence Collection',
      description: 'Audit evidence gathering progress',
      icon: <Database className="h-5 w-5" />,
      size: 'medium',
      category: 'compliance',
      isNew: true,
      dataSource: 'evidence_tracker',
      refreshInterval: 30,
    },
    {
      id: 'compliance-insights',
      type: 'custom',
      title: 'AI Compliance Insights',
      description: 'AI-powered compliance recommendations',
      icon: <Sparkles className="h-5 w-5" />,
      size: 'large',
      category: 'compliance',
      isPro: true,
      isNew: true,
      dataSource: 'ai_insights',
      refreshInterval: 120,
    },
  ];

  // Filter widgets based on search and category
  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesSearch = widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesNew = !showOnlyNew || widget.isNew;
    return matchesSearch && matchesCategory && matchesNew;
  });

  // Group widgets by category
  const groupedWidgets = filteredWidgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, DashboardWidget[]>);

  const handleAddWidget = (widget: DashboardWidget) => {
    if (activeWidgets.includes(widget.id)) {
      toast({
        title: 'Widget Already Added',
        description: `${widget.title} is already on your dashboard`,
        variant: 'default',
      });
      return;
    }

    onAddWidget?.(widget);
    
    toast({
      title: 'Widget Added',
      description: `${widget.title} has been added to your dashboard`,
    });
  };

  const getWidgetSizeLabel = (size: string) => {
    const sizeMap = {
      small: '1x1',
      medium: '2x1',
      large: '2x2',
      full: '4x1'
    };
    return sizeMap[size as keyof typeof sizeMap] || size;
  };

  const getWidgetTypeColor = (type: string) => {
    const typeColors = {
      metric: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      chart: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      table: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      activity: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      alert: 'bg-red-500/10 text-red-600 dark:text-red-400',
      custom: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-500/10 text-gray-600';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Modern Header */}
      <div className="px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layers3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Widget Library</h3>
              <p className="text-xs text-muted-foreground">
                {filteredWidgets.length} widgets available
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-1">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 px-3 text-xs whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon}
                    <span className="ml-1.5">{category.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-1.5 h-4 px-1 text-[10px]"
                    >
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Switch
                checked={showOnlyNew}
                onCheckedChange={setShowOnlyNew}
                className="scale-90"
              />
              <span className="text-muted-foreground">Show only new widgets</span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowOnlyNew(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedWidgets).map(([category, widgets]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                {categories.find(c => c.id === category)?.name || category}
              </h4>
              
              <div className="grid gap-3">
                {widgets.map(widget => (
                  <motion.div
                    key={widget.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "group relative rounded-lg border bg-card p-4 transition-all cursor-pointer",
                      "hover:shadow-md hover:border-primary/50",
                      activeWidgets.includes(widget.id) && "opacity-60 bg-muted/50"
                    )}
                    onClick={() => handleAddWidget(widget)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Widget Icon */}
                      <div className={cn(
                        "p-2.5 rounded-lg transition-colors",
                        getWidgetTypeColor(widget.type),
                        "group-hover:scale-110 transition-transform"
                      )}>
                        {widget.icon}
                      </div>

                      {/* Widget Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              {widget.title}
                              {widget.isNew && (
                                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                  NEW
                                </Badge>
                              )}
                              {widget.isPro && (
                                <Badge variant="outline" className="h-4 px-1 text-[10px] border-amber-600/50 text-amber-600">
                                  PRO
                                </Badge>
                              )}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {widget.description}
                            </p>
                          </div>
                          
                          {/* Add Button */}
                          <Button
                            size="sm"
                            variant={activeWidgets.includes(widget.id) ? "secondary" : "default"}
                            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddWidget(widget);
                            }}
                          >
                            {activeWidgets.includes(widget.id) ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Widget Metadata */}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            <Maximize2 className="h-2.5 w-2.5 mr-1" />
                            {getWidgetSizeLabel(widget.size)}
                          </Badge>
                          
                          {widget.refreshInterval && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {widget.refreshInterval}min
                            </Badge>
                          )}
                          
                          <Badge 
                            variant="secondary" 
                            className={cn("h-5 px-1.5 text-[10px]", getWidgetTypeColor(widget.type))}
                          >
                            {widget.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Hover Preview */}
                    <AnimatePresence>
                      {expandedWidget === widget.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t"
                        >
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>Data Source:</strong> {widget.dataSource}</p>
                            <p><strong>Update Frequency:</strong> Every {widget.refreshInterval} minutes</p>
                            <p><strong>Widget Type:</strong> {widget.type}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer with Quick Actions */}
      <div className="px-4 py-3 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {activeWidgets.length} widgets active
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                toast({
                  title: 'Layout Saved',
                  description: 'Your dashboard layout has been saved',
                });
              }}
            >
              <Settings2 className="h-3 w-3 mr-1" />
              Save Layout
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}