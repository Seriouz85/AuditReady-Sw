import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Minus,
  X,
  Move,
  Maximize2,
  LucideIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Progress } from '@/components/ui/progress';
import { getTypographyClasses, getIconClasses } from '@/lib/ui-standards';

// Import widget definitions
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  Award, 
  Target, 
  ShieldCheck, 
  Users, 
  Calendar, 
  AlertCircle,
  CircleDollarSign,
  FileCheck,
  Brain,
  Package,
  GitBranch,
  UserCheck
} from 'lucide-react';

interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'alert' | 'custom';
  title: string;
  description: string;
  icon: LucideIcon;
  size: 'small' | 'medium' | 'large' | 'full';
  color?: string;
  mockData?: any;
}

interface DashboardWidgetProps {
  widgetId: string;
  isDragMode?: boolean;
  onRemove?: (widgetId: string) => void;
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent, widgetId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  className?: string;
  onClick?: () => void;
}

// Widget configurations with mock data for demo
const widgetConfigs: Record<string, WidgetConfig> = {
  'total-standards': {
    id: 'total-standards',
    type: 'metric',
    title: 'Total Standards',
    description: 'Active compliance standards',
    icon: FileText,
    size: 'small',
    color: 'blue',
    mockData: { value: 12, trend: '+2', trendDirection: 'up' }
  },
  'total-requirements': {
    id: 'total-requirements',
    type: 'metric',
    title: 'Total Requirements',
    description: 'Across all standards',
    icon: CheckCircle2,
    size: 'small',
    color: 'green',
    mockData: { value: 543, trend: '+23', trendDirection: 'up' }
  },
  'total-assessments': {
    id: 'total-assessments',
    type: 'metric',
    title: 'Total Assessments',
    description: 'Ongoing and completed',
    icon: FileCheck,
    size: 'small',
    color: 'purple',
    mockData: { value: 8, trend: '+1', trendDirection: 'up' }
  },
  'compliance-score': {
    id: 'compliance-score',
    type: 'metric',
    title: 'Compliance Score',
    description: 'Overall compliance rate',
    icon: Award,
    size: 'small',
    color: 'emerald',
    mockData: { value: '87%', trend: '+3%', trendDirection: 'up', isPercentage: true }
  },
  'risk-score': {
    id: 'risk-score',
    type: 'metric',
    title: 'Risk Score',
    description: 'Current risk assessment',
    icon: Target,
    size: 'small',
    color: 'red',
    mockData: { value: 'Medium', trend: 'Stable', trendDirection: 'stable', isText: true }
  },
  'audit-readiness': {
    id: 'audit-readiness',
    type: 'metric',
    title: 'Audit Readiness',
    description: 'Preparation status',
    icon: ShieldCheck,
    size: 'small',
    color: 'teal',
    mockData: { value: '92%', trend: '+5%', trendDirection: 'up', isPercentage: true }
  },
  'team-members': {
    id: 'team-members',
    type: 'metric',
    title: 'Team Members',
    description: 'Active users',
    icon: Users,
    size: 'small',
    color: 'indigo',
    mockData: { value: 24, trend: '+3', trendDirection: 'up' }
  },
  'pending-tasks': {
    id: 'pending-tasks',
    type: 'metric',
    title: 'Pending Tasks',
    description: 'Tasks requiring attention',
    icon: Clock,
    size: 'small',
    color: 'orange',
    mockData: { value: 17, trend: '-5', trendDirection: 'down' }
  },
  'compliance-gaps': {
    id: 'compliance-gaps',
    type: 'alert',
    title: 'Compliance Gaps',
    description: 'Areas needing attention',
    icon: AlertCircle,
    size: 'small',
    color: 'yellow',
    mockData: { gaps: 7, critical: 2 }
  },
  'cost-analysis': {
    id: 'cost-analysis',
    type: 'metric',
    title: 'Compliance Cost',
    description: 'Monthly compliance spending',
    icon: CircleDollarSign,
    size: 'small',
    color: 'green',
    mockData: { value: '$12,450', trend: '-8%', trendDirection: 'down', isCurrency: true }
  },
  'compliance-trends': {
    id: 'compliance-trends',
    type: 'chart',
    title: 'Compliance Trends',
    description: '6-month compliance history',
    icon: TrendingUp,
    size: 'medium',
    color: 'blue',
    mockData: { 
      type: 'line',
      data: [
        { month: 'Aug', value: 72 },
        { month: 'Sep', value: 75 },
        { month: 'Oct', value: 78 },
        { month: 'Nov', value: 82 },
        { month: 'Dec', value: 85 },
        { month: 'Jan', value: 87 }
      ]
    }
  },
  'recent-activity': {
    id: 'recent-activity',
    type: 'activity',
    title: 'Recent Activity',
    description: 'Latest system actions',
    icon: Activity,
    size: 'medium',
    color: 'orange',
    mockData: { 
      items: [
        { user: 'John Doe', action: 'Updated ISO 27001 assessment', time: '2 min ago' },
        { user: 'Jane Smith', action: 'Completed risk review', time: '15 min ago' },
        { user: 'System', action: 'Automated backup completed', time: '1 hour ago' },
        { user: 'Mike Johnson', action: 'Added new requirement', time: '2 hours ago' },
        { user: 'Sarah Wilson', action: 'Generated compliance report', time: '3 hours ago' }
      ]
    }
  },
  'framework-coverage': {
    id: 'framework-coverage',
    type: 'chart',
    title: 'Framework Coverage',
    description: 'Compliance by framework',
    icon: Package,
    size: 'medium',
    color: 'purple',
    mockData: { 
      type: 'donut',
      data: [
        { name: 'ISO 27001', value: 87, color: '#3B82F6' },
        { name: 'SOC 2', value: 92, color: '#10B981' },
        { name: 'GDPR', value: 78, color: '#8B5CF6' },
        { name: 'HIPAA', value: 85, color: '#F59E0B' },
        { name: 'PCI DSS', value: 90, color: '#EF4444' }
      ]
    }
  },
  'risk-heatmap': {
    id: 'risk-heatmap',
    type: 'chart',
    title: 'Risk Heatmap',
    description: 'Risk distribution by area',
    icon: GitBranch,
    size: 'large',
    color: 'red',
    mockData: { 
      type: 'heatmap',
      data: [
        { area: 'Access Control', risk: 'high', value: 85, color: '#EF4444' },
        { area: 'Data Security', risk: 'medium', value: 65, color: '#F59E0B' },
        { area: 'Network Security', risk: 'low', value: 25, color: '#10B981' },
        { area: 'Physical Security', risk: 'medium', value: 45, color: '#F59E0B' }
      ]
    }
  },
  'upcoming-audits': {
    id: 'upcoming-audits',
    type: 'table',
    title: 'Upcoming Audits',
    description: 'Scheduled audit list',
    icon: Calendar,
    size: 'medium',
    color: 'indigo',
    mockData: { 
      rows: [
        { framework: 'ISO 27001', date: 'Mar 15, 2024', auditor: 'External', status: 'scheduled' },
        { framework: 'SOC 2', date: 'Apr 22, 2024', auditor: 'Internal', status: 'preparation' },
        { framework: 'GDPR', date: 'May 10, 2024', auditor: 'External', status: 'scheduled' },
        { framework: 'PCI DSS', date: 'Jun 5, 2024', auditor: 'External', status: 'scheduled' }
      ]
    }
  },
  'ai-insights': {
    id: 'ai-insights',
    type: 'custom',
    title: 'AI Insights',
    description: 'AI-powered recommendations',
    icon: Brain,
    size: 'medium',
    color: 'purple',
    mockData: { 
      insights: [
        { type: 'risk', message: 'High-risk area detected in access control', severity: 'high' },
        { type: 'improvement', message: 'Automate password rotation policy', severity: 'medium' },
        { type: 'compliance', message: 'Update data retention policy for GDPR', severity: 'high' },
        { type: 'efficiency', message: 'Consolidate similar requirements', severity: 'low' }
      ]
    }
  }
};

// Color styles for different widget types (removed - using default styling)

// Size classes for widgets
const sizeClasses = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-2',
  large: 'col-span-1 md:col-span-3',
  full: 'col-span-1 md:col-span-4'
};

export function DashboardWidget({
  widgetId,
  isDragMode = false,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  className,
  onClick
}: DashboardWidgetProps) {
  const config = widgetConfigs[widgetId];
  
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  // Render metric widget
  if (config.type === 'metric') {
    const { value, trend, trendDirection, isPercentage, isText, isCurrency } = config.mockData;
    
    return (
      <motion.div
        layout
        className={cn(sizeClasses[config.size], className)}
        draggable={isDragMode}
        onDragStart={(e) => onDragStart?.(e, widgetId)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop?.(e, widgetId)}
        onDragOver={onDragOver}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <StatsCard
          title={config.title}
          value={value}
          icon={<Icon className="h-4 w-4" />}
          description={config.description}
          trend={trend && trendDirection !== 'stable' ? {
            value: parseInt(trend.replace(/[^0-9-]/g, '')) || 0,
            isPositive: trendDirection === 'up'
          } : undefined}
          className={cn(
            "h-full shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
            isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40",
            onClick && !isDragMode && "cursor-pointer"
          )}
        />
        {isDragMode && onRemove && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widgetId);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  // Render chart widget
  if (config.type === 'chart') {
    return (
      <motion.div
        layout
        className={cn(sizeClasses[config.size], className)}
        draggable={isDragMode}
        onDragStart={(e) => onDragStart?.(e, widgetId)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop?.(e, widgetId)}
        onDragOver={onDragOver}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <Card className={cn(
          "h-full p-6 shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
          isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40"
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={getTypographyClasses('card-title')}>{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>
            {!isDragMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Export Data</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onRemove?.(widgetId)}>
                    Remove Widget
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mock chart visualization */}
          {config.mockData.type === 'line' && (
            <div className="h-48 flex items-end justify-around gap-2">
              {config.mockData.data.map((point: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${(point.value / 100) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{point.month}</span>
                </div>
              ))}
            </div>
          )}

          {config.mockData.type === 'donut' && (
            <div className="space-y-3">
              {config.mockData.data.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.value} className="w-20" />
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {config.mockData.type === 'heatmap' && (
            <div className="grid grid-cols-2 gap-2">
              {config.mockData.data.map((item: any, index: number) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg border text-center"
                  style={{ 
                    backgroundColor: `${item.color}20`,
                    borderColor: item.color 
                  }}
                >
                  <div className="text-xs font-medium mb-1">{item.area}</div>
                  <div className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {item.risk} risk
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDragMode && onRemove && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widgetId);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  // Render activity widget
  if (config.type === 'activity') {
    return (
      <motion.div
        layout
        className={cn(sizeClasses[config.size], className)}
        draggable={isDragMode}
        onDragStart={(e) => onDragStart?.(e, widgetId)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop?.(e, widgetId)}
        onDragOver={onDragOver}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <Card className={cn(
          "h-full p-6 shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
          isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className={getTypographyClasses('card-title')}>{config.title}</h3>
            </div>
          </div>

          <div className="space-y-3">
            {config.mockData.items.map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div className="flex-1">
                  <p className="font-medium">{item.user}</p>
                  <p className="text-muted-foreground">{item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>

          {isDragMode && onRemove && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widgetId);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  // Render table widget
  if (config.type === 'table') {
    return (
      <motion.div
        layout
        className={cn(sizeClasses[config.size], className)}
        draggable={isDragMode}
        onDragStart={(e) => onDragStart?.(e, widgetId)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop?.(e, widgetId)}
        onDragOver={onDragOver}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <Card className={cn(
          "h-full p-6 shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
          isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className={getTypographyClasses('card-title')}>{config.title}</h3>
            </div>
          </div>

          <div className="space-y-2">
            {config.mockData.rows.map((row: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{row.framework}</p>
                  <p className="text-xs text-muted-foreground">{row.auditor} audit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{row.date}</p>
                  <Badge variant="outline" className="text-xs">
                    {row.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {isDragMode && onRemove && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widgetId);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  // Default card for other widget types
  return (
    <motion.div
      layout
      className={cn(sizeClasses[config.size], className)}
      draggable={isDragMode}
      onDragStart={(e) => onDragStart?.(e, widgetId)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop?.(e, widgetId)}
      onDragOver={onDragOver}
      whileHover={{ scale: isDragMode ? 1.02 : 1 }}
      whileDrag={{ scale: 1.05, opacity: 0.8 }}
    >
      <Card className={cn(
        "h-full p-6 shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
        isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className={getTypographyClasses('card-title')}>{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Custom content based on widget type */}
        {config.type === 'alert' && config.mockData && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{config.mockData.gaps}</p>
              <p className="text-sm text-muted-foreground">Total gaps</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{config.mockData.critical}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        )}

        {config.type === 'custom' && config.id === 'ai-insights' && config.mockData && (
          <div className="space-y-2">
            {config.mockData.insights.map((insight: any, index: number) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 rounded-lg text-sm",
                  insight.severity === 'high' ? 'bg-red-100 dark:bg-red-950' :
                  insight.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950' :
                  'bg-blue-100 dark:bg-blue-950'
                )}
              >
                <p className="font-medium">{insight.message}</p>
              </div>
            ))}
          </div>
        )}

        {isDragMode && onRemove && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widgetId);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </Card>
    </motion.div>
  );
}