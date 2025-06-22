import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/formatDate';
import { 
  notificationService, 
  Notification, 
  NotificationPreferences, 
  NotificationStats 
} from '@/services/notifications/NotificationService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, BellOff, Settings, Check, CheckCheck, Archive, 
  Trash2, Filter, Clock, AtSign, UserPlus, MessageSquare,
  AlertCircle, Calendar, Users, Mail, Smartphone, Volume2,
  Moon, RefreshCw, Eye
} from 'lucide-react';

interface NotificationCenterProps {
  showAsDialog?: boolean;
  compact?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  showAsDialog = false,
  compact = false
}) => {
  const { user, organization } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions' | 'assignments'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (user && organization) {
      loadNotifications();
      loadPreferences();
      loadStats();
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(
        user.id,
        organization.id,
        (notification: Notification) => {
          setNotifications(prev => [notification, ...prev]);
          // Show toast for new notifications
          if (notification.priority === 'urgent') {
            toast.error(notification.title);
          } else if (notification.priority === 'high') {
            toast.warning(notification.title);
          } else {
            toast.info(notification.title);
          }
        }
      );

      return unsubscribe;
    }
  }, [user, organization]);

  const loadNotifications = async () => {
    if (!user || !organization) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id, organization.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user || !organization) return;
    
    try {
      const prefs = await notificationService.getNotificationPreferences(user.id, organization.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const loadStats = async () => {
    if (!user || !organization) return;
    
    try {
      const statsData = await notificationService.getNotificationStats(user.id, organization.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await notificationService.markAsRead(notificationId, user.id);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      await loadStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !organization) return;
    
    try {
      await notificationService.markAllAsRead(user.id, organization.id);
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      await loadStats();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleArchiveNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await notificationService.archiveNotification(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await loadStats();
      toast.success('Notification archived');
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !organization) return;
    
    try {
      await notificationService.updateNotificationPreferences(user.id, organization.id, updates);
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      case 'assignment':
        return <UserPlus className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
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

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'mentions':
        return notification.type === 'mention';
      case 'assignments':
        return notification.type === 'assignment';
      default:
        return true;
    }
  });

  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-4 border-l-4 hover:bg-muted/50 cursor-pointer transition-colors ${
        notification.is_read ? 'opacity-75' : ''
      } ${getPriorityColor(notification.priority)}`}
      onClick={() => {
        if (!notification.is_read) {
          handleMarkAsRead(notification.id);
        }
        if (notification.action_url) {
          // In production, navigate to the action URL
          console.log('Navigate to:', notification.action_url);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {notification.actor ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.actor.avatar_url} />
              <AvatarFallback className="text-xs">
                {notification.actor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
            <Badge variant="outline" className="text-xs">
              {notification.type}
            </Badge>
            {notification.priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs">urgent</Badge>
            )}
            {notification.priority === 'high' && (
              <Badge variant="secondary" className="text-xs">high</Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {notification.message}
          </p>
          
          {notification.resource && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {notification.resource.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {notification.resource.name}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.created_at)}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveNotification(notification.id);
                }}
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Email Notifications</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mentions</Label>
              <p className="text-xs text-muted-foreground">When someone mentions you</p>
            </div>
            <Switch
              checked={preferences?.email_mentions}
              onCheckedChange={(checked) => handleUpdatePreferences({ email_mentions: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Assignments</Label>
              <p className="text-xs text-muted-foreground">When you're assigned new tasks</p>
            </div>
            <Switch
              checked={preferences?.email_assignments}
              onCheckedChange={(checked) => handleUpdatePreferences({ email_assignments: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Comments</Label>
              <p className="text-xs text-muted-foreground">When someone comments on your items</p>
            </div>
            <Switch
              checked={preferences?.email_comments}
              onCheckedChange={(checked) => handleUpdatePreferences({ email_comments: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Deadlines</Label>
              <p className="text-xs text-muted-foreground">Upcoming deadline reminders</p>
            </div>
            <Switch
              checked={preferences?.email_deadlines}
              onCheckedChange={(checked) => handleUpdatePreferences({ email_deadlines: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Digest</Label>
              <p className="text-xs text-muted-foreground">Summary of daily activity</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences?.email_digest}
                onCheckedChange={(checked) => handleUpdatePreferences({ email_digest: checked })}
              />
              <Select 
                value={preferences?.email_digest_frequency} 
                onValueChange={(value) => handleUpdatePreferences({ email_digest_frequency: value as any })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="font-medium mb-3">Push Notifications</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mentions</Label>
            </div>
            <Switch
              checked={preferences?.push_mentions}
              onCheckedChange={(checked) => handleUpdatePreferences({ push_mentions: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Assignments</Label>
            </div>
            <Switch
              checked={preferences?.push_assignments}
              onCheckedChange={(checked) => handleUpdatePreferences({ push_assignments: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Real-time Collaboration</Label>
            </div>
            <Switch
              checked={preferences?.push_collaboration}
              onCheckedChange={(checked) => handleUpdatePreferences({ push_collaboration: checked })}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="font-medium mb-3">Quiet Hours</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">Pause notifications during specified hours</p>
            </div>
            <Switch
              checked={preferences?.quiet_hours_enabled}
              onCheckedChange={(checked) => handleUpdatePreferences({ quiet_hours_enabled: checked })}
            />
          </div>
          
          {preferences?.quiet_hours_enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Select 
                    value={preferences?.quiet_hours_start} 
                    onValueChange={(value) => handleUpdatePreferences({ quiet_hours_start: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>End Time</Label>
                  <Select 
                    value={preferences?.quiet_hours_end} 
                    onValueChange={(value) => handleUpdatePreferences({ quiet_hours_end: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const content = (
    <div className={compact ? "w-80" : "w-full max-w-2xl"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          {stats && stats.unread_count > 0 && (
            <Badge variant="destructive">{stats.unread_count}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>
                  Customize how and when you receive notifications
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                {renderPreferencesSettings()}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={setFilter as any}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {stats && stats.unread_count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.unread_count}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          {filteredNotifications.some(n => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
        
        <ScrollArea className={compact ? "h-80" : "h-96"}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(renderNotificationItem)}
            </div>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );

  if (showAsDialog) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {stats && stats.unread_count > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {stats.unread_count > 9 ? '9+' : stats.unread_count}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-4">
            {content}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};