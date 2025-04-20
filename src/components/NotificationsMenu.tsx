import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { Notification } from '@/types';
import { notifications as mockNotifications } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const NotificationsMenu = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications as Notification[]);
  
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  
  const getIconColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return diffDays === 1 
        ? t('notifications.day_ago') 
        : t('notifications.days_ago').replace('{count}', String(diffDays));
    } else if (diffHours > 0) {
      return diffHours === 1 
        ? t('notifications.hour_ago') 
        : t('notifications.hours_ago').replace('{count}', String(diffHours));
    } else {
      return t('notifications.just_now');
    }
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, status: 'read' } : n
    ));
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="px-4 py-2 font-medium text-sm flex justify-between items-center">
          <span>{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => {
              setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
            }}>
              {t('notifications.mark_all_read')}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="px-4 py-2 text-sm text-center text-muted-foreground">
            {t('notifications.empty')}
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-default flex flex-col items-start gap-1 ${
                  notification.status === 'unread' ? 'bg-muted/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center w-full gap-2">
                  <span className={`text-sm font-medium ${getIconColor(notification.priority)}`}>
                    {notification.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getRelativeTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.description}
                </p>
                {notification.dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('notifications.due')}: {formatDate(notification.dueDate)}
                  </p>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-4 py-2 justify-center text-sm text-primary">
              {t('notifications.view_all')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 