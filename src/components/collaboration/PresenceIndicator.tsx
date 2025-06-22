import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollaborationService, PresenceInfo } from '@/services/collaboration/CollaborationService';
import { formatDate } from '@/utils/formatDate';
import { Users, Eye, Edit, Clock } from 'lucide-react';

interface PresenceIndicatorProps {
  resourceType: string;
  resourceId: string;
  showDetails?: boolean;
  maxAvatars?: number;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  resourceType,
  resourceId,
  showDetails = false,
  maxAvatars = 5
}) => {
  const [presence, setPresence] = useState<PresenceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaborationService] = useState(() => CollaborationService.getInstance());

  useEffect(() => {
    loadPresence();
    
    // Update presence periodically
    const interval = setInterval(loadPresence, 30000); // 30 seconds
    
    // Update own presence
    collaborationService.updatePresence(resourceType, resourceId, 'viewing');
    
    return () => {
      clearInterval(interval);
    };
  }, [resourceType, resourceId]);

  const loadPresence = async () => {
    try {
      const data = await collaborationService.getResourcePresence(resourceType, resourceId);
      setPresence(data);
    } catch (error) {
      console.error('Error loading presence:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activity?: string) => {
    switch (activity) {
      case 'editing':
        return <Edit className="h-3 w-3" />;
      case 'viewing':
        return <Eye className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getActivityColor = (activity?: string, isOnline?: boolean) => {
    if (!isOnline) return 'bg-gray-500';
    
    switch (activity) {
      case 'editing':
        return 'bg-orange-500';
      case 'viewing':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatLastSeen = (lastSeen: string, isOnline: boolean) => {
    if (isOnline) return 'Online now';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return formatDate(lastSeen);
  };

  const onlineUsers = presence.filter(p => p.is_online);
  const offlineUsers = presence.filter(p => !p.is_online);
  const visibleUsers = presence.slice(0, maxAvatars);
  const hiddenCount = presence.length - maxAvatars;

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-muted rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (presence.length === 0) {
    return showDetails ? (
      <div className="text-center py-4 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No one else is viewing this resource</p>
      </div>
    ) : null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {visibleUsers.map((user, index) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background hover:z-10 relative">
                    <AvatarImage src={user.user_avatar} />
                    <AvatarFallback className="text-xs">
                      {user.user_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background flex items-center justify-center ${getActivityColor(user.current_activity, user.is_online)}`}>
                    <div className="text-white" style={{ fontSize: '8px' }}>
                      {getActivityIcon(user.current_activity)}
                    </div>
                  </div>
                  
                  {/* Online pulse animation */}
                  {user.is_online && (
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getActivityColor(user.current_activity, user.is_online)} animate-ping opacity-75`}></div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-center">
                  <p className="font-medium">{user.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.current_activity} • {formatLastSeen(user.last_seen, user.is_online)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{hiddenCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hiddenCount} more user{hiddenCount !== 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Online count badge */}
        {onlineUsers.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            {onlineUsers.length} online
          </Badge>
        )}
        
        {/* Detailed view */}
        {showDetails && (
          <div className="space-y-4 mt-4">
            {onlineUsers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online ({onlineUsers.length})
                </h4>
                <div className="space-y-2">
                  {onlineUsers.map(user => (
                    <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_avatar} />
                          <AvatarFallback className="text-xs">
                            {user.user_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getActivityColor(user.current_activity, true)}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.user_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {getActivityIcon(user.current_activity)}
                          {user.current_activity} now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {offlineUsers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  Recently Active ({offlineUsers.length})
                </h4>
                <div className="space-y-2">
                  {offlineUsers.map(user => (
                    <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8 opacity-75">
                        <AvatarImage src={user.user_avatar} />
                        <AvatarFallback className="text-xs">
                          {user.user_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last seen {formatLastSeen(user.last_seen, false)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};