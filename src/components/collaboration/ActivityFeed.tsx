import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/formatDate';
import { CollaborationService, ActivityFeedItem } from '@/services/collaboration/CollaborationService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, UserPlus, FileUp, CheckCircle, 
  Clock, Users, Filter, RefreshCw, Star,
  Assignment, Eye, Edit, Upload, Send
} from 'lucide-react';

interface ActivityFeedProps {
  organizationId?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  organizationId,
  limit = 50,
  showFilters = true,
  compact = false
}) => {
  const { organization } = useAuth();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaborationService] = useState(() => CollaborationService.getInstance());
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const orgId = organizationId || organization?.id || 'demo-org';

  useEffect(() => {
    loadActivityFeed();
  }, [orgId, timeFilter, typeFilter, userFilter]);

  const loadActivityFeed = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      
      if (typeFilter !== 'all') {
        filters.types = [typeFilter];
      }
      
      if (userFilter !== 'all') {
        filters.userIds = [userFilter];
      }

      const data = await collaborationService.getActivityFeed(orgId, limit, filters);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'assignment':
        return <UserPlus className="h-4 w-4" />;
      case 'document_upload':
        return <FileUp className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'assessment_submit':
        return <Send className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, isImportant: boolean) => {
    if (isImportant) return 'text-orange-600 bg-orange-100';
    
    switch (type) {
      case 'comment':
        return 'text-blue-600 bg-blue-100';
      case 'assignment':
        return 'text-green-600 bg-green-100';
      case 'document_upload':
        return 'text-purple-600 bg-purple-100';
      case 'status_change':
        return 'text-emerald-600 bg-emerald-100';
      case 'collaboration':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadActivityFeed}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="document_upload">Documents</SelectItem>
                <SelectItem value="status_change">Status Changes</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className={compact ? "h-64" : "h-96"}>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Team activities will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.actor_avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.actor_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.is_important)}`}>
                      {getActivityIcon(activity.type, activity.action)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {activity.actor_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {activity.description}
                      </span>
                      {activity.is_important && (
                        <Star className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.target_name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {activity.target_type}
                      </Badge>
                    </div>
                    
                    {activity.metadata && (
                      <div className="text-xs text-muted-foreground">
                        {activity.type === 'comment' && activity.metadata.comment_preview && (
                          <p className="italic truncate">"{activity.metadata.comment_preview}"</p>
                        )}
                        {activity.type === 'assignment' && activity.metadata.assigned_to && (
                          <p>Assigned to: {activity.metadata.assigned_to}</p>
                        )}
                        {activity.type === 'document_upload' && activity.metadata.document_name && (
                          <p>File: {activity.metadata.document_name}</p>
                        )}
                        {activity.type === 'collaboration' && activity.metadata.user_count && (
                          <p>{activity.metadata.user_count} user{activity.metadata.user_count !== 1 ? 's' : ''} collaborating</p>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};