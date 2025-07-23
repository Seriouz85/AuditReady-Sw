import React, { useState, useEffect } from 'react';
import { 
  X,
  Search,
  Grid,
  BarChart3,
  Shield,
  Activity,
  Plus,
  Check,
  TrendingUp,
  Users,
  FileText,
  Target,
  Clock,
  Database,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Lock,
  Palette,
  Settings2,
  Eye,
  EyeOff,
  Filter,
  SlidersHorizontal,
  Zap,
  Bell,
  CheckCircle2,
  LucideIcon,
  Info,
  Star,
  Layout,
  CircleDollarSign,
  Building2,
  Calendar,
  FileCheck,
  GitBranch,
  ShieldCheck,
  UserCheck,
  Package,
  FolderOpen,
  MessageSquare,
  Bot,
  Brain,
  Award,
  Globe,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTypographyClasses, getIconClasses } from '@/lib/ui-standards';

// Widget types
type WidgetType = 'metric' | 'chart' | 'table' | 'activity' | 'alert' | 'custom';
type WidgetSize = 'small' | 'medium' | 'large' | 'full';

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: LucideIcon;
  size: WidgetSize;
  category: string;
  isPro?: boolean;
  isNew?: boolean;
  dataSource?: string;
  refreshInterval?: number;
  mockData?: any;
  color?: string;
}

interface WidgetCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface ModernDashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: string[];
  onAddWidget: (widgetId: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onToggleDragMode?: () => void;
  isDragMode?: boolean;
}

// Widget categories with better organization
const widgetCategories: WidgetCategory[] = [
  { 
    id: 'all', 
    name: 'All Widgets', 
    icon: Grid, 
    color: 'text-gray-600',
    description: 'Browse all available widgets'
  },
  { 
    id: 'metrics', 
    name: 'Key Metrics', 
    icon: TrendingUp, 
    color: 'text-blue-600',
    description: 'Important KPIs and numbers'
  },
  { 
    id: 'charts', 
    name: 'Visualizations', 
    icon: BarChart3, 
    color: 'text-purple-600',
    description: 'Charts and graphs'
  },
  { 
    id: 'compliance', 
    name: 'Compliance', 
    icon: Shield, 
    color: 'text-green-600',
    description: 'Compliance tracking'
  },
  { 
    id: 'activity', 
    name: 'Activity', 
    icon: Activity, 
    color: 'text-orange-600',
    description: 'Recent actions and updates'
  },
  { 
    id: 'team', 
    name: 'Team & Users', 
    icon: Users, 
    color: 'text-indigo-600',
    description: 'Team management widgets'
  },
];

// All available widgets with mock data
const availableWidgets: DashboardWidget[] = [
  // Core Metrics
  {
    id: 'total-standards',
    type: 'metric',
    title: 'Total Standards',
    description: 'Active compliance standards',
    icon: FileText,
    size: 'small',
    category: 'metrics',
    color: 'blue',
    mockData: { value: 12, trend: '+2', trendDirection: 'up' }
  },
  {
    id: 'total-requirements', 
    type: 'metric',
    title: 'Total Requirements',
    description: 'Across all standards',
    icon: CheckCircle2,
    size: 'small',
    category: 'metrics',
    color: 'green',
    mockData: { value: 543, trend: '+23', trendDirection: 'up' }
  },
  {
    id: 'total-assessments',
    type: 'metric',
    title: 'Total Assessments',
    description: 'Ongoing and completed',
    icon: FileCheck,
    size: 'small',
    category: 'metrics',
    color: 'purple',
    mockData: { value: 8, trend: '+1', trendDirection: 'up' }
  },
  {
    id: 'compliance-score',
    type: 'metric',
    title: 'Compliance Score',
    description: 'Overall compliance rate',
    icon: Award,
    size: 'small',
    category: 'metrics',
    color: 'emerald',
    mockData: { value: '87%', trend: '+3%', trendDirection: 'up' }
  },

  // Additional Metrics
  {
    id: 'risk-score',
    type: 'metric',
    title: 'Risk Score',
    description: 'Current risk assessment',
    icon: Target,
    size: 'small',
    category: 'metrics',
    isPro: true,
    color: 'red',
    mockData: { value: 'Medium', trend: 'Stable', trendDirection: 'stable' }
  },
  {
    id: 'audit-readiness',
    type: 'metric',
    title: 'Audit Readiness',
    description: 'Preparation status',
    icon: ShieldCheck,
    size: 'small',
    category: 'metrics',
    color: 'teal',
    mockData: { value: '92%', trend: '+5%', trendDirection: 'up' }
  },
  {
    id: 'team-members',
    type: 'metric',
    title: 'Team Members',
    description: 'Active users',
    icon: Users,
    size: 'small',
    category: 'team',
    color: 'indigo',
    mockData: { value: 24, trend: '+3', trendDirection: 'up' }
  },
  {
    id: 'pending-tasks',
    type: 'metric',
    title: 'Pending Tasks',
    description: 'Tasks requiring attention',
    icon: Clock,
    size: 'small',
    category: 'activity',
    isNew: true,
    color: 'orange',
    mockData: { value: 17, trend: '-5', trendDirection: 'down' }
  },

  // Charts
  {
    id: 'compliance-trends',
    type: 'chart',
    title: 'Compliance Trends',
    description: '6-month compliance history',
    icon: TrendingUp,
    size: 'medium',
    category: 'charts',
    color: 'blue',
    mockData: { type: 'line', dataPoints: 6 }
  },
  {
    id: 'risk-heatmap',
    type: 'chart',
    title: 'Risk Heatmap',
    description: 'Risk distribution by area',
    icon: GitBranch,
    size: 'large',
    category: 'charts',
    color: 'red',
    mockData: { 
      type: 'heatmap', 
      data: [
        { area: 'Access Control', risk: 'high', value: 85 },
        { area: 'Data Security', risk: 'medium', value: 65 },
        { area: 'Network Security', risk: 'low', value: 25 },
        { area: 'Physical Security', risk: 'medium', value: 45 }
      ]
    }
  },
  {
    id: 'framework-coverage',
    type: 'chart',
    title: 'Framework Coverage',
    description: 'Compliance by framework',
    icon: Package,
    size: 'medium',
    category: 'charts',
    color: 'purple',
    mockData: { type: 'donut', segments: 5 }
  },
  {
    id: 'assessment-timeline',
    type: 'chart',
    title: 'Assessment Timeline',
    description: 'Upcoming assessments',
    icon: Calendar,
    size: 'medium',
    category: 'charts',
    isNew: true,
    color: 'green',
    mockData: { type: 'gantt', items: 8 }
  },

  // Activity & Tables
  {
    id: 'recent-activity',
    type: 'activity',
    title: 'Recent Activity',
    description: 'Latest system actions',
    icon: Activity,
    size: 'medium',
    category: 'activity',
    color: 'orange',
    mockData: { items: 10, lastUpdate: '2 min ago' }
  },
  {
    id: 'upcoming-audits',
    type: 'table',
    title: 'Upcoming Audits',
    description: 'Scheduled audit list',
    icon: Calendar,
    size: 'medium',
    category: 'compliance',
    color: 'indigo',
    mockData: { rows: 5, nextAudit: 'March 15' }
  },
  {
    id: 'team-assignments',
    type: 'table',
    title: 'Team Assignments',
    description: 'Current task distribution',
    icon: UserCheck,
    size: 'medium',
    category: 'team',
    isNew: true,
    color: 'pink',
    mockData: { assignments: 24, overdue: 3 }
  },
  {
    id: 'compliance-gaps',
    type: 'alert',
    title: 'Compliance Gaps',
    description: 'Areas needing attention',
    icon: AlertCircle,
    size: 'small',
    category: 'compliance',
    color: 'yellow',
    mockData: { gaps: 7, critical: 2 }
  },
  {
    id: 'ai-insights',
    type: 'custom',
    title: 'AI Insights',
    description: 'AI-powered recommendations',
    icon: Brain,
    size: 'medium',
    category: 'activity',
    isPro: true,
    isNew: true,
    color: 'purple',
    mockData: { insights: 5, accuracy: '94%' }
  },
  {
    id: 'cost-analysis',
    type: 'metric',
    title: 'Compliance Cost',
    description: 'Monthly compliance spending',
    icon: CircleDollarSign,
    size: 'small',
    category: 'metrics',
    isPro: true,
    color: 'green',
    mockData: { value: '$12,450', trend: '-8%', trendDirection: 'down' }
  }
];

export function ModernDashboardSidebar({
  isOpen,
  onClose,
  activeWidgets,
  onAddWidget,
  onRemoveWidget,
  onToggleDragMode,
  isDragMode = false
}: ModernDashboardSidebarProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyPro, setShowOnlyPro] = useState(false);

  // Filter widgets based on search and category
  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesSearch = widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesNew = !showOnlyNew || widget.isNew;
    const matchesPro = !showOnlyPro || widget.isPro;
    
    return matchesSearch && matchesCategory && matchesNew && matchesPro;
  });

  const handleAddWidget = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget) return;

    if (activeWidgets.includes(widgetId)) {
      toast({
        title: "Widget Already Added",
        description: `${widget.title} is already on your dashboard`,
        variant: "default"
      });
      return;
    }

    onAddWidget(widgetId);
    toast({
      title: "Widget Added",
      description: `${widget.title} has been added to your dashboard`,
      variant: "default"
    });
  };

  const getWidgetIcon = (Icon: LucideIcon, color?: string) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      pink: 'text-pink-600 bg-pink-100',
      teal: 'text-teal-600 bg-teal-100',
      emerald: 'text-emerald-600 bg-emerald-100',
    };

    const classes = color ? colorClasses[color as keyof typeof colorClasses] : 'text-gray-600 bg-gray-100';

    return (
      <div className={cn("p-2 rounded-lg", classes)}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Removed blur to show dashboard changes in real-time */}
          <motion.div
            className="fixed inset-0 bg-black/10 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className={getTypographyClasses('section-header')}>Widget Gallery</h2>
                    <p className="text-sm text-muted-foreground">Customize your dashboard</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search widgets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={showOnlyNew ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                    className="gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    New
                  </Button>
                  <Button
                    variant={showOnlyPro ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyPro(!showOnlyPro)}
                    className="gap-1"
                  >
                    <Star className="h-3 w-3" />
                    Pro
                  </Button>
                  {onToggleDragMode && (
                    <Button
                      variant={isDragMode ? "default" : "outline"}
                      size="sm"
                      onClick={onToggleDragMode}
                      className="gap-1 ml-auto"
                    >
                      <Layout className="h-3 w-3" />
                      {isDragMode ? 'Exit Arrange' : 'Arrange'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-4 border-b border-border bg-muted/10">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
                <div className="flex gap-2 min-w-max pb-2" style={{ width: 'max-content' }}>
                  {widgetCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.id;
                    const categoryCount = category.id === 'all' 
                      ? availableWidgets.length 
                      : availableWidgets.filter(w => w.category === category.id).length;

                    return (
                      <Button
                        key={category.id}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "gap-2 whitespace-nowrap transition-all",
                          isActive && "shadow-sm"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", category.color)} />
                        {category.name}
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {categoryCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Widget List */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3">
                {filteredWidgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No widgets found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredWidgets.map((widget) => {
                    const isActive = activeWidgets.includes(widget.id);
                    const Icon = widget.icon;

                    return (
                      <motion.div
                        key={widget.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md border-2",
                            // Different sizes based on widget size
                            widget.size === 'small' && "p-3 h-20",
                            widget.size === 'medium' && "p-4 h-28", 
                            widget.size === 'large' && "p-5 h-36",
                            widget.size === 'full' && "p-6 h-40",
                            isActive 
                              ? "border-primary bg-primary/5" 
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => !isActive && handleAddWidget(widget.id)}
                        >
                          <div className={cn(
                            "flex gap-3",
                            widget.size === 'small' ? "items-center" : "items-start"
                          )}>
                            <div className={cn(
                              "flex-shrink-0",
                              widget.size === 'small' && "scale-75"
                            )}>
                              {getWidgetIcon(Icon, widget.color)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className={cn(
                                    "font-medium flex items-center gap-2 mb-1",
                                    widget.size === 'small' ? "text-sm" : "text-base"
                                  )}>
                                    {widget.title}
                                    {widget.isNew && (
                                      <Badge variant="secondary" className={cn(
                                        widget.size === 'small' ? "text-xs scale-75" : "text-xs"
                                      )}>
                                        NEW
                                      </Badge>
                                    )}
                                    {widget.isPro && (
                                      <Badge variant="outline" className={cn(
                                        widget.size === 'small' ? "text-xs scale-75" : "text-xs"
                                      )}>
                                        PRO
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className={cn(
                                    "text-muted-foreground",
                                    widget.size === 'small' ? "text-xs" : "text-sm"
                                  )}>
                                    {widget.description}
                                  </p>
                                </div>

                                {isActive ? (
                                  <div className="flex items-center gap-1 text-primary">
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs font-medium">Added</span>
                                  </div>
                                ) : (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 hover:bg-primary/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddWidget(widget.id);
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add to dashboard</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>

                              {/* Widget Preview/Mock Data - Sized according to widget */}
                              {widget.mockData && widget.size !== 'small' && (
                                <div className={cn(
                                  "mt-3 bg-muted/50 rounded-lg",
                                  widget.size === 'medium' && "p-2 text-xs",
                                  widget.size === 'large' && "p-3 text-sm", 
                                  widget.size === 'full' && "p-4 text-sm"
                                )}>
                                  {widget.type === 'metric' && (
                                    <div className="flex items-baseline justify-between">
                                      <span className={cn(
                                        "font-bold",
                                        widget.size === 'medium' && "text-lg",
                                        widget.size === 'large' && "text-xl",
                                        widget.size === 'full' && "text-2xl"
                                      )}>{widget.mockData.value}</span>
                                      {widget.mockData.trend && (
                                        <span className={cn(
                                          "flex items-center gap-1",
                                          widget.size === 'medium' && "text-xs",
                                          widget.size === 'large' && "text-sm",
                                          widget.size === 'full' && "text-sm",
                                          widget.mockData.trendDirection === 'up' ? 'text-green-600' : 
                                          widget.mockData.trendDirection === 'down' ? 'text-red-600' : 
                                          'text-gray-600'
                                        )}>
                                          {widget.mockData.trend}
                                          {widget.mockData.trendDirection === 'up' && '↑'}
                                          {widget.mockData.trendDirection === 'down' && '↓'}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {widget.type === 'chart' && (
                                    <div className="text-muted-foreground">
                                      {widget.mockData.type} chart • {widget.mockData.dataPoints || widget.mockData.segments || widget.mockData.areas || widget.mockData.items} data points
                                    </div>
                                  )}
                                  {widget.type === 'activity' && (
                                    <div className="text-muted-foreground">
                                      {widget.mockData.items} items • Last update: {widget.mockData.lastUpdate}
                                    </div>
                                  )}
                                  {widget.type === 'table' && (
                                    <div className="text-muted-foreground">
                                      {widget.mockData.rows} rows • Next: {widget.mockData.nextAudit}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Metadata - Only show for larger widgets */}
                              {widget.size !== 'small' && (
                                <div className={cn(
                                  "flex items-center gap-4 mt-3 text-muted-foreground",
                                  widget.size === 'medium' && "text-xs",
                                  widget.size === 'large' && "text-xs",
                                  widget.size === 'full' && "text-sm"
                                )}>
                                {widget.dataSource && (
                                  <span className="flex items-center gap-1">
                                    <Database className="h-3 w-3" />
                                    {widget.dataSource}
                                  </span>
                                )}
                                {widget.refreshInterval && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Updates every {widget.refreshInterval}s
                                  </span>
                                )}
                              </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>{activeWidgets.length} widgets active</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClose}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}