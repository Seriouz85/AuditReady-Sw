import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getActivities, UserActivity } from '@/lib/tracking';
import { Activity, Timer, Book, Sparkles, Users, Clock } from 'lucide-react';

interface DashboardProps {
  userId?: string;
  className?: string;
  limit?: number;
  refreshInterval?: number;
}

const LiveDashboard: React.FC<DashboardProps> = ({ 
  userId, 
  className = '',
  limit = 5,
  refreshInterval = 10000
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalTimeSpent: 0,
    activeUsers: 0,
    courseViews: 0,
    completions: 0
  });
  
  // Reload activities at a set interval for real-time updates
  useEffect(() => {
    // Load initial activities
    const loadActivities = () => {
      const allActivities = getActivities();
      setActivities(allActivities.slice(0, limit));
      
      // Calculate stats
      setStats({
        totalActivities: allActivities.length,
        totalTimeSpent: allActivities
          .filter(a => a.duration)
          .reduce((total, activity) => total + (activity.duration || 0), 0),
        activeUsers: new Set(allActivities.map(a => a.id.split('-')[0])).size,
        courseViews: allActivities.filter(a => a.contentType === 'course' && a.type === 'view').length,
        completions: allActivities.filter(a => a.type === 'complete').length
      });
    };
    
    loadActivities();
    
    // Set up interval for refreshing
    const intervalId = setInterval(loadActivities, refreshInterval);
    
    // Listen for real-time events
    const handleNewActivity = () => {
      loadActivities();
    };
    
    window.addEventListener('user-activity', handleNewActivity);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('user-activity', handleNewActivity);
    };
  }, [limit, refreshInterval]);
  
  // Format timestamp to relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };
  
  // Get appropriate icon for activity type
  const getActivityIcon = (activity: UserActivity) => {
    switch (activity.type) {
      case 'view':
        return <Book className="h-4 w-4" />;
      case 'complete':
        return <Sparkles className="h-4 w-4" />;
      case 'interact':
        return <Activity className="h-4 w-4" />;
      case 'enroll':
        return <Users className="h-4 w-4" />;
      case 'start':
        return <Timer className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  // Get readable activity type
  const getActivityTypeText = (activity: UserActivity) => {
    switch (activity.type) {
      case 'view':
        return 'viewed';
      case 'complete':
        return 'completed';
      case 'interact':
        return 'interacted with';
      case 'enroll':
        return 'enrolled in';
      case 'start':
        return 'started';
      default:
        return activity.type;
    }
  };
  
  // Get color for activity type
  const getActivityColor = (activity: UserActivity) => {
    switch (activity.type) {
      case 'view':
        return 'bg-blue-100 text-blue-700';
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'interact':
        return 'bg-purple-100 text-purple-700';
      case 'enroll':
        return 'bg-amber-100 text-amber-700';
      case 'start':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Activity Dashboard</h2>
        <Badge className="bg-gradient-to-r from-green-100 to-emerald-200 text-emerald-700">Live</Badge>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Activities</span>
          </div>
          <p className="text-2xl font-semibold">{stats.totalActivities}</p>
        </Card>
        
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium">Time Spent</span>
          </div>
          <p className="text-2xl font-semibold">{stats.totalTimeSpent}m</p>
        </Card>
        
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <p className="text-2xl font-semibold">{stats.activeUsers}</p>
        </Card>
        
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <div className="flex items-center gap-2 mb-1">
            <Book className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Course Views</span>
          </div>
          <p className="text-2xl font-semibold">{stats.courseViews}</p>
        </Card>
        
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Completions</span>
          </div>
          <p className="text-2xl font-semibold">{stats.completions}</p>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <div>
        <h3 className="text-sm font-medium mb-3">Recent Activities</h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map(activity => (
              <div key={activity.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className={`p-2 rounded-full ${getActivityColor(activity)}`}>
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {activity.contentTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getActivityTypeText(activity)} {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard; 