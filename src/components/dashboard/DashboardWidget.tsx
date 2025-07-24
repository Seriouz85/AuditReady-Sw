import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  TrendingUp,
  Activity,
  Clock,
  X,
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
import { getTypographyClasses } from '@/lib/ui-standards';
import { useNavigate } from 'react-router-dom';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { CybersecurityNews } from '@/components/dashboard/CybersecurityNews';
import { AssessmentProgress } from '@/components/dashboard/AssessmentProgress';
import { assessments } from '@/data/mockData';

// Import widget definitions
import { 
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
  Shield,
  BookOpen,
  User,
  BarChart3
} from 'lucide-react';
import { CardContent } from '@/components/ui/card';

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
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
  onClick?: () => void;
  realData?: any; // Real data from dashboard hooks/services
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
  },
  // Existing Dashboard Components
  'compliance-chart': {
    id: 'compliance-chart',
    type: 'chart',
    title: 'Compliance Chart',
    description: 'Overall compliance status breakdown',
    icon: ShieldCheck,
    size: 'medium',
    color: 'green',
    mockData: { type: 'pie', segments: 4 }
  },
  'cybersecurity-news': {
    id: 'cybersecurity-news',
    type: 'activity',
    title: 'Cybersecurity News',
    description: 'Latest security news and updates',
    icon: AlertCircle,
    size: 'large',
    color: 'red',
    mockData: { 
      items: [
        { title: 'Critical Vulnerability Discovered in OpenSSL Library', time: '9:17 AM', category: 'Vulnerability' },
        { title: 'NIST Releases Updated Cybersecurity Framework 2.0', time: '5:17 AM', category: 'Framework' },
        { title: 'New Ransomware Campaign Targets Healthcare Organizations', time: 'Jul 23, 11:17 PM', category: 'Threat Alert' }
      ]
    }
  },
  'assessment-progress': {
    id: 'assessment-progress',
    type: 'table',
    title: 'Assessment Progress',
    description: 'Recent compliance assessments and their status',
    icon: FileCheck,
    size: 'large',
    color: 'blue',
    mockData: { 
      assessments: [
        { framework: 'ISO 27001', progress: 75, status: 'in-progress', dueDate: 'Dec 15' },
        { framework: 'SOC 2', progress: 100, status: 'completed', dueDate: 'Nov 30' },
        { framework: 'GDPR', progress: 45, status: 'pending', dueDate: 'Jan 20' },
        { framework: 'HIPAA', progress: 90, status: 'review', dueDate: 'Dec 5' }
      ]
    }
  },
  'current-activities': {
    id: 'current-activities',
    type: 'activity',
    title: 'Current Activities',
    description: 'Recent team actions and system updates',
    icon: Activity,
    size: 'medium',
    color: 'orange',
    mockData: { 
      items: [
        { user: 'System', action: 'ISO 27001 Assessment in Progress', description: '12 of 24 requirements completed', time: '2 hours ago', status: 'in-progress' },
        { user: 'John Doe', action: 'Updated Access Control Policy', description: 'Requirement A.9.1.1 marked as fulfilled', time: '4 hours ago', status: 'completed' },
        { user: 'Jane Smith', action: 'New Requirements Assigned', description: '5 network security requirements assigned', time: '6 hours ago', status: 'pending' }
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
  onClick,
  realData
}: DashboardWidgetProps) {
  const config = widgetConfigs[widgetId];
  
  if (!config) {
    console.error(`No config found for widget: ${widgetId}`);
    return null;
  }

  console.log(`Rendering widget: ${widgetId}, type: ${config.type}`);
  
  // FOR DEBUGGING: Force show compliance chart data
  if (widgetId === 'compliance-chart') {
    console.log('COMPLIANCE CHART WIDGET DETECTED!', realData?.complianceBreakdown);
  }

  const Icon = config.icon;

  // Function to get real data for widget
  const getWidgetData = () => {
    if (!realData) return config.mockData;

    switch (widgetId) {
      case 'total-standards':
        return {
          value: realData.totalStandards || 0,
          trend: realData.totalStandards > 10 ? '+2' : '0',
          trendDirection: realData.totalStandards > 10 ? 'up' : 'stable'
        };
      case 'total-requirements':
        return {
          value: realData.totalRequirements || 0,
          trend: realData.totalRequirements > 100 ? '+23' : '0',
          trendDirection: realData.totalRequirements > 100 ? 'up' : 'stable'
        };
      case 'total-assessments':
        return {
          value: realData.totalAssessments || 0,
          trend: realData.totalAssessments > 0 ? '+1' : '0',
          trendDirection: realData.totalAssessments > 0 ? 'up' : 'stable'
        };
      case 'compliance-score':
        return {
          value: `${realData.complianceScore || 0}%`,
          trend: realData.complianceScore > 80 ? '+3%' : '0%',
          trendDirection: realData.complianceScore > 80 ? 'up' : 'stable'
        };
      case 'risk-score':
        const score = realData.complianceScore || 0;
        return {
          value: score > 80 ? 'Low' : score > 60 ? 'Medium' : 'High',
          trend: 'Stable',
          trendDirection: 'stable'
        };
      case 'audit-readiness':
        const readiness = Math.max(realData.complianceScore || 0, 75);
        return {
          value: `${readiness}%`,
          trend: readiness > 85 ? '+5%' : '0%',
          trendDirection: readiness > 85 ? 'up' : 'stable'
        };
      case 'compliance-gaps':
        const gaps = realData.complianceBreakdown?.notFulfilled || 0;
        const critical = Math.floor(gaps * 0.3);
        return { gaps, critical };
      default:
        return config.mockData;
    }
  };

  const widgetData = getWidgetData();

  // CRITICAL: Special handling for existing dashboard components MUST come FIRST
  // before any generic type checking!
  if (widgetId === 'compliance-chart') {
    const forceData = {
      fulfilled: 222,
      partiallyFulfilled: 55,
      notFulfilled: 55,
      notApplicable: 12
    };
    
    return (
      <motion.div
        layout
        className={className}
        draggable={isDragMode}
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <ComplianceChart data={realData?.complianceBreakdown || forceData} />
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

  // Render metric widget
  if (config.type === 'metric') {
    const { value, trend, trendDirection } = widgetData;
    
    return (
      <motion.div
        layout
        className={cn(sizeClasses[config.size], className)}
        draggable={isDragMode}
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
        onClick={onClick}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <StatsCard
          title={config.title}
          value={value}
          icon={<Icon className="h-4 w-4" />}
          description={config.description}
          {...(trend && trendDirection !== 'stable' ? {
            trend: {
              value: parseInt(trend.replace(/[^0-9-]/g, '')) || 0,
              isPositive: trendDirection === 'up'
            }
          } : {})}
          className={cn(
            "h-full shadow-md hover:shadow-lg transition-all hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70",
            isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40 hover:scale-105",
            onClick && !isDragMode && "cursor-pointer hover:scale-105"
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
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
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


  if (widgetId === 'cybersecurity-news') {
    // Render the actual CybersecurityNews component
    return (
      <motion.div
        layout
        className={className}
        draggable={isDragMode}
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <div className={cn(
          "transition-all",
          isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40 rounded-xl"
        )}>
          <CybersecurityNews />
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
      </motion.div>
    );
  }

  if (widgetId === 'assessment-progress') {
    // Render the actual AssessmentProgress component
    return (
      <motion.div
        layout
        className={className}
        draggable={isDragMode}
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <div className={cn(
          "shadow-lg rounded-xl overflow-hidden border border-border/70 transition-all",
          isDragMode && "cursor-move ring-2 ring-primary/20 hover:ring-primary/40"
        )}>
          <AssessmentProgress 
            assessments={assessments} 
            onAssessmentClick={(_: string) => !isDragMode && onClick?.()}
          />
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
      </motion.div>
    );
  }

  // Special handling for current-activities widget (render actual component)
  if (widgetId === 'current-activities') {
    // Render the inline CurrentActivities component from Dashboard.tsx
    return (
      <motion.div
        layout
        className={className}
        draggable={isDragMode}
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
        whileHover={{ scale: isDragMode ? 1.02 : 1 }}
        whileDrag={{ scale: 1.05, opacity: 0.8 }}
      >
        <div className={cn(
          "transition-all",
          isDragMode && "cursor-move"
        )}>
          <CurrentActivitiesWidget />
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
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
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
            {config.mockData?.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div className="flex-1">
                  <p className="font-medium">{item.user}</p>
                  <p className="text-muted-foreground">{item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            )) || <p className="text-muted-foreground">No activities to display</p>}
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
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragStart?.(dragEvent, widgetId);
        }}
        {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
        onDrop={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDrop?.(dragEvent, widgetId);
        }}
        onDragOver={(e) => {
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          onDragOver?.(dragEvent);
        }}
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
      onDragStart={(e) => {
        const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
        onDragStart?.(dragEvent, widgetId);
      }}
      {...(onDragEnd ? { onDragEnd: () => onDragEnd() } : {})}
      onDrop={(e) => {
        const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
        onDrop?.(dragEvent, widgetId);
      }}
      onDragOver={(e) => {
        const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
        onDragOver?.(dragEvent);
      }}
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
        {config.type === 'alert' && widgetData && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{widgetData.gaps}</p>
              <p className="text-sm text-muted-foreground">Total gaps</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{widgetData.critical}</p>
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

// Current Activities component that matches RSS feed height
const CurrentActivitiesWidget = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 1,
      type: 'assessment',
      title: 'ISO 27001 Assessment in Progress',
      description: '12 of 24 requirements completed',
      time: '2 hours ago',
      status: 'in-progress',
      icon: <Shield size={16} />,
      color: 'blue'
    },
    {
      id: 2,
      type: 'requirement',
      title: 'Updated Access Control Policy',
      description: 'Requirement A.9.1.1 marked as fulfilled',
      time: '4 hours ago',
      status: 'completed',
      icon: <CheckCircle2 size={16} />,
      color: 'green'
    },
    {
      id: 3,
      type: 'assignment',
      title: 'New Requirements Assigned',
      description: '5 network security requirements assigned to you',
      time: '6 hours ago',
      status: 'pending',
      icon: <AlertCircle size={16} />,
      color: 'amber'
    },
    {
      id: 4,
      type: 'document',
      title: 'Generated SOA Document',
      description: 'Statement of Applicability for ISO 27001',
      time: '1 day ago',
      status: 'completed',
      icon: <FileText size={16} />,
      color: 'purple'
    },
    {
      id: 5,
      type: 'review',
      title: 'Evidence Review Pending',
      description: 'Risk assessment documentation needs review',
      time: '1 day ago',
      status: 'pending',
      icon: <Clock size={16} />,
      color: 'orange'
    },
    {
      id: 6,
      type: 'assessment',
      title: 'CIS Controls Gap Analysis',
      description: 'Baseline assessment completed',
      time: '2 days ago',
      status: 'completed',
      icon: <BarChart3 size={16} />,
      color: 'teal'
    },
    {
      id: 7,
      type: 'training',
      title: 'Security Awareness Training',
      description: 'Completed mandatory cybersecurity module',
      time: '3 days ago',
      status: 'completed',
      icon: <BookOpen size={16} />,
      color: 'indigo'
    },
    {
      id: 8,
      type: 'collaboration',
      title: 'Team Collaboration Session',
      description: 'Discussed GDPR compliance strategy',
      time: '4 days ago',
      status: 'completed',
      icon: <User size={16} />,
      color: 'pink'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400';
      case 'pending': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getIconBg = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/50',
      green: 'bg-green-100 dark:bg-green-900/50',
      amber: 'bg-amber-100 dark:bg-amber-900/50',
      purple: 'bg-purple-100 dark:bg-purple-900/50',
      orange: 'bg-orange-100 dark:bg-orange-900/50',
      teal: 'bg-teal-100 dark:bg-teal-900/50',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/50',
      pink: 'bg-pink-100 dark:bg-pink-900/50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all h-[340px] border border-border/70" data-card="true">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
              <Activity size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Current Activities</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2 py-1 h-auto text-xs"
            onClick={() => navigate('/app/activities')}
          >
            View All
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="p-3 border border-border/50 rounded-lg hover:bg-muted/20 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              onClick={() => {
                if (activity.type === 'assessment') navigate('/app/assessments');
                else if (activity.type === 'requirement') navigate('/app/requirements');
                else if (activity.type === 'document') navigate('/app/documents');
                else navigate('/app/activities');
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`${getIconBg(activity.color)} p-2 rounded-lg flex-shrink-0`}>
                  <div className={getStatusColor(activity.status)}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                      activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      {activity.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};