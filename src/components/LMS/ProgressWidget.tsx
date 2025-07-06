import React from 'react';
import { DashboardWidget } from './DashboardWidget';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProgressData {
  completed: number;
  inProgress: number;
  total: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    isUrgent: boolean;
  }>;
}

interface ProgressWidgetProps {
  data: ProgressData;
  isExpanded?: boolean;
  onExpand?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  data,
  isExpanded = false,
  onExpand,
  onViewAll,
  className = ''
}) => {
  const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
  const weeklyGoalProgress = (data.weeklyProgress / data.weeklyGoal) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <DashboardWidget
      id="progress-widget"
      title="Learning Progress"
      subtitle="Track your course completion and goals"
      icon={<TrendingUp className="h-5 w-5 text-white" />}
      isExpanded={isExpanded}
      onExpand={onExpand}
      canExpand
      canRefresh
      className={className}
    >
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Overall Completion</h4>
            <span className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</span>
          </div>
          
          <Progress 
            value={completionRate} 
            className="h-3"
          />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{data.completed}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{data.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-600">{data.total}</div>
              <div className="text-xs text-gray-500">Total Courses</div>
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Weekly Goal</h4>
            </div>
            <Badge variant={weeklyGoalProgress >= 100 ? "default" : "secondary"}>
              {data.weeklyProgress}/{data.weeklyGoal} hours
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(weeklyGoalProgress, 100)} 
            className="h-2"
          />
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Learning Streak</div>
              <div className="text-sm text-gray-500">Keep it up!</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{data.streak}</div>
            <div className="text-xs text-gray-500">days</div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {data.upcomingDeadlines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Upcoming Deadlines</h4>
              {data.upcomingDeadlines.length > 3 && (
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {data.upcomingDeadlines.slice(0, isExpanded ? 10 : 3).map((deadline) => (
                <div 
                  key={deadline.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {deadline.isUrgent ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {deadline.title}
                      </div>
                      <div className={`text-xs ${deadline.isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                        {formatDaysUntilDue(deadline.dueDate)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Award className="mr-2 h-4 w-4" />
            View Achievements
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onViewAll}>
            <ArrowRight className="mr-2 h-4 w-4" />
            All Courses
          </Button>
        </div>
      </div>
    </DashboardWidget>
  );
};