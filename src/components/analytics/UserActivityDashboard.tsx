import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/formatDate';
import {
  userActivityService,
  UserActivityStats,
  OrganizationActivityStats,
  ActivityEvent,
  UserSession
} from '@/services/analytics/UserActivityService';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3, Clock, Eye, Edit, MessageSquare, Users,
  TrendingUp, Calendar, Monitor, Smartphone, Tablet,
  Activity, FileText, Settings, Download, RefreshCw,
  Filter, ChevronRight, Zap, Target, Star
} from 'lucide-react';

interface UserActivityDashboardProps {
  userId?: string;
  showOrgStats?: boolean;
}

export const UserActivityDashboard: React.FC<UserActivityDashboardProps> = ({
  userId,
  showOrgStats = false
}) => {
  const { user, organization } = useAuth();
  const [userStats, setUserStats] = useState<UserActivityStats | null>(null);
  const [orgStats, setOrgStats] = useState<OrganizationActivityStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId && organization) {
      loadActivityData();
    }
  }, [targetUserId, organization, timeRange]);

  const loadActivityData = async () => {
    if (!targetUserId || !organization) return;

    try {
      setLoading(true);
      
      const [userStatsData, recentActivitiesData, sessionsData] = await Promise.all([
        userActivityService.getUserActivityStats(targetUserId, organization.id, timeRange),
        userActivityService.getActivityEvents(organization.id, {
          userIds: [targetUserId],
          limit: 20
        }),
        userActivityService.getUserSessions(targetUserId, organization.id, timeRange)
      ]);

      setUserStats(userStatsData);
      setRecentActivities(recentActivitiesData);
      setUserSessions(sessionsData);

      if (showOrgStats) {
        const orgStatsData = await userActivityService.getOrganizationActivityStats(
          organization.id,
          timeRange
        );
        setOrgStats(orgStatsData);
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'create':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      case 'settings_change':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return 'text-blue-600 bg-blue-100';
      case 'edit':
        return 'text-orange-600 bg-orange-100';
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'comment':
        return 'text-purple-600 bg-purple-100';
      case 'collaboration':
        return 'text-indigo-600 bg-indigo-100';
      case 'export':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(timestamp);
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            User Activity Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading activity data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Activity Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'day' | 'week' | 'month' | 'year')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadActivityData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              {showOrgStats && <TabsTrigger value="organization">Organization</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {userStats && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Time</p>
                            <p className="text-xl font-semibold">
                              {formatDuration(userStats.total_time_minutes)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Sessions</p>
                            <p className="text-xl font-semibold">{userStats.total_sessions}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Eye className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Page Views</p>
                            <p className="text-xl font-semibold">{userStats.page_views}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Actions</p>
                            <p className="text-xl font-semibold">{userStats.actions_performed}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Productivity Score</span>
                          <div className="flex items-center gap-2">
                            <Progress value={userStats.productivity_score} className="w-20" />
                            <span className="text-sm font-medium">{userStats.productivity_score}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Engagement Level</span>
                          <Badge className={getEngagementColor(userStats.engagement_level)}>
                            {userStats.engagement_level.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg Session Duration</span>
                          <span className="text-sm font-medium">
                            {formatDuration(userStats.avg_session_duration)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Most Active Day</span>
                          <span className="text-sm font-medium">{userStats.most_active_day}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Peak Hour</span>
                          <span className="text-sm font-medium">
                            {userStats.most_active_hour}:00
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Favorite Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userStats.favorite_features.map((feature, index) => (
                            <div key={feature} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {index + 1}
                              </div>
                              <span className="text-sm capitalize">{feature}</span>
                              {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {userSessions.map(session => (
                        <div key={session.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className={`p-2 rounded-lg ${getDeviceIcon(session.device_type)} bg-muted`}>
                            {getDeviceIcon(session.device_type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {session.browser} on {session.device_type}
                              </span>
                              {session.is_active && (
                                <Badge variant="default" className="text-xs">Active</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Started {formatRelativeTime(session.start_time)}
                              {session.duration_minutes && ` • Duration: ${formatDuration(session.duration_minutes)}`}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium">{session.page_views} views</p>
                            <p className="text-xs text-muted-foreground">{session.actions_count} actions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-2 rounded-lg ${getEventColor(activity.event_type)}`}>
                            {getEventIcon(activity.event_type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">
                                {activity.event_type.replace('_', ' ')}
                              </span>
                              {activity.resource_type && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.resource_type}
                                </Badge>
                              )}
                            </div>
                            
                            {activity.resource_name && (
                              <p className="text-sm text-muted-foreground mb-1">
                                {activity.resource_name}
                              </p>
                            )}
                            
                            {activity.action_details && (
                              <div className="text-xs text-muted-foreground">
                                {Object.entries(activity.action_details).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            {showOrgStats && orgStats && (
              <TabsContent value="organization" className="space-y-6">
                {/* Organization Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Users</p>
                          <p className="text-xl font-semibold">{orgStats.total_users}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Today</p>
                          <p className="text-xl font-semibold">{orgStats.active_users_today}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Sessions</p>
                          <p className="text-xl font-semibold">{orgStats.total_sessions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Session</p>
                          <p className="text-xl font-semibold">
                            {formatDuration(orgStats.avg_session_duration)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Feature Usage and Engagement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Most Used Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {orgStats.most_used_features.map((feature, index) => (
                          <div key={feature.feature} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{index + 1}.</span>
                              <span className="text-sm capitalize">{feature.feature}</span>
                            </div>
                            <span className="text-sm font-medium">{feature.usage_count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Engagement Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">High Engagement</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(orgStats.user_engagement_distribution.high / orgStats.total_users) * 100} className="w-20" />
                            <span className="text-sm font-medium">{orgStats.user_engagement_distribution.high}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Medium Engagement</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(orgStats.user_engagement_distribution.medium / orgStats.total_users) * 100} className="w-20" />
                            <span className="text-sm font-medium">{orgStats.user_engagement_distribution.medium}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Low Engagement</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(orgStats.user_engagement_distribution.low / orgStats.total_users) * 100} className="w-20" />
                            <span className="text-sm font-medium">{orgStats.user_engagement_distribution.low}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};