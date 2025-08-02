import { useState } from 'react';
import { 
  X,
  Search,
  Grid,
  BarChart3,
  Shield,
  Activity,
  Check,
  TrendingUp,
  Users,
  FileText,
  Target,
  Clock,
  AlertCircle,
  Sparkles,
  Settings2,
  CheckCircle2,
  LucideIcon,
  Info,
  Star,
  Layout,
  CircleDollarSign,
  Calendar,
  FileCheck,
  GitBranch,
  ShieldCheck,
  UserCheck,
  Package,
  Brain,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

// All available widgets with mock data (including existing dashboard cards)
const availableWidgets: DashboardWidget[] = [
  // Existing Dashboard Cards
  {
    id: 'compliance-chart',
    type: 'chart',
    title: 'Compliance Chart',
    description: 'Current compliance overview chart',
    icon: ShieldCheck,
    size: 'medium',
    category: 'compliance',
    color: 'green',
    mockData: { type: 'pie', segments: 4 }
  },
  {
    id: 'cybersecurity-news', 
    type: 'activity',
    title: 'Cybersecurity News',
    description: 'Latest security news and updates',
    icon: AlertCircle,
    size: 'medium',
    category: 'activity',
    color: 'blue',
    mockData: { items: 8, lastUpdate: '1 hour ago' }
  },
  {
    id: 'assessment-progress',
    type: 'table',
    title: 'Assessment Progress',
    description: 'Latest compliance assessments',
    icon: FileCheck,
    size: 'large',
    category: 'compliance',
    color: 'purple',
    mockData: { rows: 6, status: 'active' }
  },
  {
    id: 'current-activities',
    type: 'activity',
    title: 'Current Activities', 
    description: 'Ongoing team activities',
    icon: Activity,
    size: 'medium',
    category: 'activity',
    color: 'orange',
    mockData: { items: 12, active: 5 }
  },

  // Original Available Widgets
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
  onToggleDragMode,
  isDragMode = false
}: ModernDashboardSidebarProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyPro, setShowOnlyPro] = useState(false);

  // Filter and group widgets by size
  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesSearch = widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesNew = !showOnlyNew || widget.isNew;
    const matchesPro = !showOnlyPro || widget.isPro;
    
    return matchesSearch && matchesCategory && matchesNew && matchesPro;
  });

  // Group widgets by size (small first, then medium, then large, then full)
  const groupedWidgets = {
    small: filteredWidgets.filter(w => w.size === 'small'),
    medium: filteredWidgets.filter(w => w.size === 'medium'),
    large: filteredWidgets.filter(w => w.size === 'large'),
    full: filteredWidgets.filter(w => w.size === 'full')
  };

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

  const getWidgetIcon = (Icon: LucideIcon, color?: string, size: WidgetSize = 'medium') => {
    const colorClasses = {
      blue: 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200/50',
      green: 'text-green-600 bg-gradient-to-br from-green-100 to-green-200 border-green-200/50',
      purple: 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-200/50',
      orange: 'text-orange-600 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-200/50',
      red: 'text-red-600 bg-gradient-to-br from-red-100 to-red-200 border-red-200/50',
      yellow: 'text-yellow-600 bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-200/50',
      indigo: 'text-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-200/50',
      pink: 'text-pink-600 bg-gradient-to-br from-pink-100 to-pink-200 border-pink-200/50',
      teal: 'text-teal-600 bg-gradient-to-br from-teal-100 to-teal-200 border-teal-200/50',
      emerald: 'text-emerald-600 bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-200/50',
    };

    const classes = color ? colorClasses[color as keyof typeof colorClasses] : 'text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200/50';

    return (
      <div className={cn(
        "rounded-lg shadow-sm border transition-all duration-200",
        size === 'small' && "p-1",
        size === 'medium' && "p-2", 
        size === 'large' && "p-2.5",
        size === 'full' && "p-3",
        classes
      )}>
        <Icon className={cn(
          "drop-shadow-sm",
          size === 'small' && "h-3 w-3",
          size === 'medium' && "h-4 w-4",
          size === 'large' && "h-5 w-5", 
          size === 'full' && "h-6 w-6"
        )} />
      </div>
    );
  };

  // Render individual widget with improved design
  const renderWidget = (widget: DashboardWidget) => {
    const isActive = activeWidgets.includes(widget.id);
    const Icon = widget.icon;

    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        {/* Enhanced Widget Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-300 group relative overflow-hidden backdrop-blur-sm",
            isActive 
              ? "border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg ring-1 ring-primary/20" 
              : "border border-border/50 bg-gradient-to-br from-card to-muted/10 hover:border-primary/30 hover:shadow-md hover:bg-gradient-to-br hover:from-card hover:to-primary/5"
          )}
          onClick={() => !isActive && handleAddWidget(widget.id)}
        >
          {/* Widget Preview with Enhanced Design */}
          <div className="p-3">
            <div className="mb-3 flex justify-center">
              <div
                className={cn(
                  "relative rounded-xl flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-background to-muted/30 border-2",
                  isActive 
                    ? "border-primary/40 shadow-lg shadow-primary/20" 
                    : "border-dashed border-muted-foreground/20 group-hover:border-primary/30 group-hover:shadow-md"
                )}
                style={{
                  // IMPROVED PROPORTIONAL SIZES
                  width: widget.size === 'small' ? '70px' : 
                         widget.size === 'medium' ? '110px' : 
                         widget.size === 'large' ? '150px' : 
                         widget.size === 'full' ? '180px' : '110px',
                  height: widget.size === 'small' ? '70px' : '65px',
                  maxWidth: '100%'
                }}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-background/50 to-muted/20 opacity-60" />
                
                {/* Widget Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  {getWidgetIcon(Icon, widget.color, widget.size)}
                  {widget.size !== 'small' && (
                    <div className={cn(
                      "mt-1 text-center text-muted-foreground/60",
                      widget.size === 'medium' ? "text-[8px]" : "text-[9px]"
                    )}>
                      {widget.type}
                    </div>
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Widget Info */}
            <div className="text-center space-y-1">
              <h4 className="text-xs font-semibold leading-tight flex items-center justify-center gap-1 flex-wrap">
                <span className="truncate">{widget.title}</span>
                {widget.isNew && (
                  <Badge variant="secondary" className="text-[7px] bg-green-500/20 text-green-700 border-green-500/30 px-1">
                    NEW
                  </Badge>
                )}
                {widget.isPro && (
                  <Badge variant="outline" className="text-[7px] bg-amber-500/20 text-amber-700 border-amber-500/50 px-1">
                    PRO
                  </Badge>
                )}
              </h4>
              
              {widget.size !== 'small' && (
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {widget.description}
                </p>
              )}

              <Badge className={cn("text-[10px] px-1.5 py-0.5 font-medium", 
                widget.size === 'small' && "bg-blue-100 text-blue-800 border-blue-200",
                widget.size === 'medium' && "bg-green-100 text-green-800 border-green-200",
                widget.size === 'large' && "bg-orange-100 text-orange-800 border-orange-200",
                widget.size === 'full' && "bg-purple-100 text-purple-800 border-purple-200"
              )}>
                {widget.size}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
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
            className="fixed right-0 top-0 h-full w-[420px] bg-gradient-to-br from-background via-background to-muted/30 border-l border-border/50 shadow-2xl backdrop-blur-sm z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-background to-muted/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl shadow-lg border border-primary/20">
                    <Settings2 className="h-5 w-5 text-primary drop-shadow-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Widget Gallery</h2>
                    <p className="text-sm text-muted-foreground/80">Customize your dashboard experience</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 hover:bg-muted/80 rounded-full hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="Search widgets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm hover:border-primary/30 focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={showOnlyNew ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                    className={cn(
                      "gap-1.5 shadow-sm transition-all duration-200",
                      showOnlyNew 
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-primary/25" 
                        : "hover:bg-muted/80 hover:border-primary/30"
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    New
                  </Button>
                  <Button
                    variant={showOnlyPro ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyPro(!showOnlyPro)}
                    className={cn(
                      "gap-1.5 shadow-sm transition-all duration-200",
                      showOnlyPro 
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25 text-white" 
                        : "hover:bg-muted/80 hover:border-amber-400/50"
                    )}
                  >
                    <Star className="h-3 w-3" />
                    Pro
                  </Button>
                  {onToggleDragMode && (
                    <Button
                      variant={isDragMode ? "default" : "outline"}
                      size="sm"
                      onClick={onToggleDragMode}
                      className={cn(
                        "gap-1.5 ml-auto shadow-sm transition-all duration-200",
                        isDragMode 
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25" 
                          : "hover:bg-muted/80 hover:border-green-400/50"
                      )}
                    >
                      <Layout className="h-3 w-3" />
                      {isDragMode ? 'Lock' : 'Arrange'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="px-5 py-4 border-b border-border/30 bg-gradient-to-r from-muted/10 to-muted/5">
              <div className="grid grid-cols-2 gap-2.5">
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
                        "gap-2 whitespace-nowrap transition-all duration-200 shadow-sm backdrop-blur-sm justify-start",
                        isActive && "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-primary/20 scale-105",
                        !isActive && "hover:bg-muted/80 hover:border-primary/30 hover:shadow-md"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", category.color)} />
                      <span className="truncate flex-1">{category.name}</span>
                      <Badge 
                        variant={isActive ? "outline" : "secondary"} 
                        className={cn(
                          "h-5 px-1.5 text-xs font-medium transition-colors flex-shrink-0",
                          isActive && "bg-white/20 border-white/30 text-white"
                        )}
                      >
                        {categoryCount}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Widget Grid - Grouped by Size */}
            <ScrollArea className="flex-1 px-5 py-4">
              {filteredWidgets.length === 0 ? (
                <div className="text-center py-12 w-full">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No widgets found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Small Widgets */}
                  {groupedWidgets.small.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Small Widgets ({groupedWidgets.small.length})
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {groupedWidgets.small.map((widget) => renderWidget(widget))}
                      </div>
                    </div>
                  )}

                  {/* Medium Widgets */}
                  {groupedWidgets.medium.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Medium Widgets ({groupedWidgets.medium.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {groupedWidgets.medium.map((widget) => renderWidget(widget))}
                      </div>
                    </div>
                  )}

                  {/* Large Widgets */}
                  {groupedWidgets.large.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        Large Widgets ({groupedWidgets.large.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {groupedWidgets.large.map((widget) => renderWidget(widget))}
                      </div>
                    </div>
                  )}

                  {/* Full Width Widgets */}
                  {groupedWidgets.full.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Full Width Widgets ({groupedWidgets.full.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {groupedWidgets.full.map((widget) => renderWidget(widget))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/30 bg-gradient-to-r from-muted/20 via-background to-muted/20 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Info className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium">{activeWidgets.length} widgets active</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClose}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-all duration-200"
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