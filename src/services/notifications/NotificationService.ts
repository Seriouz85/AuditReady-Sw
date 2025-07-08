import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string;
  type: 'mention' | 'assignment' | 'comment' | 'status_change' | 'deadline' | 'system' | 'collaboration';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_archived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
  
  // Related data
  actor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  resource?: {
    type: string;
    id: string;
    name: string;
  };
}

export interface NotificationPreferences {
  user_id: string;
  organization_id: string;
  
  // Email notifications
  email_mentions: boolean;
  email_assignments: boolean;
  email_comments: boolean;
  email_deadlines: boolean;
  email_digest: boolean;
  email_digest_frequency: 'never' | 'daily' | 'weekly';
  
  // Push notifications
  push_mentions: boolean;
  push_assignments: boolean;
  push_comments: boolean;
  push_deadlines: boolean;
  push_collaboration: boolean;
  
  // In-app notifications
  app_mentions: boolean;
  app_assignments: boolean;
  app_comments: boolean;
  app_status_changes: boolean;
  app_deadlines: boolean;
  app_system: boolean;
  
  // Mobile notifications
  mobile_enabled: boolean;
  mobile_mentions: boolean;
  mobile_assignments: boolean;
  mobile_urgent_only: boolean;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:MM format
  quiet_hours_end: string;   // HH:MM format
  quiet_hours_timezone: string;
  
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title_template: string;
  message_template: string;
  email_template?: string;
  push_template?: string;
  action_button_text?: string;
  is_active: boolean;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_activity: number;
}

class NotificationService {
  private static instance: NotificationService;
  private eventListeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get notifications for a user
  async getNotifications(
    userId: string,
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: string;
      priority?: string;
    }
  ): Promise<Notification[]> {
    try {
      // In production, query actual database
      // For demo, return mock data
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          user_id: userId,
          organization_id: organizationId,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: 'Demo Admin mentioned you in a comment on requirement A.5.1 - Policies for information security',
          data: {
            comment_id: 'comment-1',
            resource_type: 'requirement',
            resource_id: 'req-1'
          },
          is_read: false,
          is_archived: false,
          priority: 'medium',
          action_url: '/requirements/req-1?comment=comment-1',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          actor: {
            id: 'demo-admin',
            name: 'Demo Admin',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin'
          },
          resource: {
            type: 'requirement',
            id: 'req-1',
            name: 'A.5.1 - Policies for information security'
          }
        },
        {
          id: 'notif-2',
          user_id: userId,
          organization_id: organizationId,
          type: 'assignment',
          title: 'New requirement assigned',
          message: 'You have been assigned requirement A.6.1 - Screening',
          data: {
            assignment_id: 'assignment-1',
            resource_type: 'requirement',
            resource_id: 'req-2',
            due_date: '2025-02-01'
          },
          is_read: false,
          is_archived: false,
          priority: 'high',
          action_url: '/requirements/req-2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          actor: {
            id: 'demo-manager',
            name: 'Demo Manager',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Manager'
          },
          resource: {
            type: 'requirement',
            id: 'req-2',
            name: 'A.6.1 - Screening'
          }
        },
        {
          id: 'notif-3',
          user_id: userId,
          organization_id: organizationId,
          type: 'deadline',
          title: 'Upcoming deadline',
          message: 'Assessment "Q4 2024 Compliance Review" is due in 3 days',
          data: {
            resource_type: 'assessment',
            resource_id: 'assessment-1',
            due_date: '2025-01-25'
          },
          is_read: true,
          is_archived: false,
          priority: 'medium',
          action_url: '/assessments/assessment-1',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read_at: new Date(Date.now() - 3600000).toISOString(),
          resource: {
            type: 'assessment',
            id: 'assessment-1',
            name: 'Q4 2024 Compliance Review'
          }
        },
        {
          id: 'notif-4',
          user_id: userId,
          organization_id: organizationId,
          type: 'collaboration',
          title: 'Someone joined your collaboration session',
          message: 'Demo Analyst joined the real-time editing session on Compliance Flow Diagram',
          data: {
            session_id: 'session-123',
            resource_type: 'diagram',
            resource_id: 'diagram-1'
          },
          is_read: false,
          is_archived: false,
          priority: 'low',
          action_url: '/documents/diagram-1',
          created_at: new Date(Date.now() - 900000).toISOString(),
          actor: {
            id: 'demo-analyst',
            name: 'Demo Analyst',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst'
          },
          resource: {
            type: 'diagram',
            id: 'diagram-1',
            name: 'Compliance Flow Diagram'
          }
        },
        {
          id: 'notif-5',
          user_id: userId,
          organization_id: organizationId,
          type: 'system',
          title: 'System maintenance scheduled',
          message: 'Scheduled maintenance will occur on January 25, 2025 from 2:00 AM to 4:00 AM UTC',
          data: {
            maintenance_start: '2025-01-25T02:00:00Z',
            maintenance_end: '2025-01-25T04:00:00Z'
          },
          is_read: true,
          is_archived: false,
          priority: 'low',
          expires_at: '2025-01-25T04:00:00Z',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          read_at: new Date(Date.now() - 82800000).toISOString()
        }
      ];

      // Apply filters
      let filteredNotifications = mockNotifications;
      
      if (options?.unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.is_read);
      }
      
      if (options?.type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === options.type);
      }
      
      if (options?.priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === options.priority);
      }

      // Apply pagination
      const offset = options?.offset || 0;
      const limit = options?.limit || 50;
      
      return filteredNotifications.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Create a new notification
  async createNotification(params: {
    userId: string;
    organizationId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: string;
    actionUrl?: string;
    expiresAt?: string;
    actorId?: string;
  }): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        user_id: params.userId,
        organization_id: params.organizationId,
        type: params.type as any,
        title: params.title,
        message: params.message,
        data: params.data || {},
        is_read: false,
        is_archived: false,
        priority: (params.priority as any) || 'medium',
        action_url: params.actionUrl,
        expires_at: params.expiresAt,
        created_at: new Date().toISOString()
      };

      // In production, insert into database
      // await supabase.from('notifications').insert(notification);

      // Check if user should receive this notification based on preferences
      const shouldNotify = await this.shouldSendNotification(params.userId, params.type);
      
      if (shouldNotify) {
        // Send real-time notification
        this.emit('notification-created', notification);
        
        // Send push/email notifications based on preferences
        await this.sendExternalNotifications(notification);
      }

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: 'Failed to create notification' };
    }
  }

  // Mark notification as read
  async markAsRead(
    notificationId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, update notification in database
      // await supabase.from('notifications')
      //   .update({ 
      //     is_read: true, 
      //     read_at: new Date().toISOString() 
      //   })
      //   .eq('id', notificationId)
      //   .eq('user_id', userId);

      this.emit('notification-read', { notificationId, userId });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(
    userId: string, 
    organizationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, bulk update notifications
      // await supabase.from('notifications')
      //   .update({ 
      //     is_read: true, 
      //     read_at: new Date().toISOString() 
      //   })
      //   .eq('user_id', userId)
      //   .eq('organization_id', organizationId)
      //   .eq('is_read', false);

      this.emit('all-notifications-read', { userId, organizationId });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }

  // Archive notification
  async archiveNotification(
    notificationId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, update notification in database
      // await supabase.from('notifications')
      //   .update({ is_archived: true })
      //   .eq('id', notificationId)
      //   .eq('user_id', userId);

      this.emit('notification-archived', { notificationId, userId });
      
      return { success: true };
    } catch (error) {
      console.error('Error archiving notification:', error);
      return { success: false, error: 'Failed to archive notification' };
    }
  }

  // Get notification preferences
  async getNotificationPreferences(
    userId: string, 
    organizationId: string
  ): Promise<NotificationPreferences> {
    try {
      // In production, query user preferences
      // For demo, return default preferences
      return {
        user_id: userId,
        organization_id: organizationId,
        
        // Email notifications
        email_mentions: true,
        email_assignments: true,
        email_comments: false,
        email_deadlines: true,
        email_digest: true,
        email_digest_frequency: 'daily',
        
        // Push notifications
        push_mentions: true,
        push_assignments: true,
        push_comments: false,
        push_deadlines: true,
        push_collaboration: false,
        
        // In-app notifications
        app_mentions: true,
        app_assignments: true,
        app_comments: true,
        app_status_changes: true,
        app_deadlines: true,
        app_system: true,
        
        // Mobile notifications
        mobile_enabled: true,
        mobile_mentions: true,
        mobile_assignments: true,
        mobile_urgent_only: false,
        
        // Quiet hours
        quiet_hours_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        quiet_hours_timezone: 'America/New_York',
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    organizationId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, update preferences in database
      // await supabase.from('notification_preferences')
      //   .upsert({
      //     user_id: userId,
      //     organization_id: organizationId,
      //     ...preferences,
      //     updated_at: new Date().toISOString()
      //   });

      this.emit('preferences-updated', { userId, organizationId, preferences });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: 'Failed to update notification preferences' };
    }
  }

  // Get notification statistics
  async getNotificationStats(
    userId: string, 
    organizationId: string
  ): Promise<NotificationStats> {
    try {
      const notifications = await this.getNotifications(userId, organizationId);
      
      const stats: NotificationStats = {
        total_notifications: notifications.length,
        unread_count: notifications.filter(n => !n.is_read).length,
        read_count: notifications.filter(n => n.is_read).length,
        by_type: {},
        by_priority: {},
        recent_activity: notifications.filter(n => 
          new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      };

      // Count by type
      notifications.forEach(n => {
        stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
      });

      // Count by priority
      notifications.forEach(n => {
        stats.by_priority[n.priority] = (stats.by_priority[n.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total_notifications: 0,
        unread_count: 0,
        read_count: 0,
        by_type: {},
        by_priority: {},
        recent_activity: 0
      };
    }
  }

  // Helper methods
  private async shouldSendNotification(userId: string, type: string): Promise<boolean> {
    try {
      // Check user preferences
      // For demo, always return true
      return true;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return false;
    }
  }

  private async sendExternalNotifications(notification: Notification): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getNotificationPreferences(
        notification.user_id, 
        notification.organization_id
      );

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        console.log('Skipping external notifications due to quiet hours');
        return;
      }

      // Send email notification
      if (this.shouldSendEmail(notification.type, preferences)) {
        await this.sendEmailNotification(notification);
      }

      // Send push notification
      if (this.shouldSendPush(notification.type, preferences)) {
        await this.sendPushNotification(notification);
      }

      // Send mobile notification
      if (this.shouldSendMobile(notification, preferences)) {
        await this.sendMobileNotification(notification);
      }
    } catch (error) {
      console.error('Error sending external notifications:', error);
    }
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled) return false;
    
    // Simplified quiet hours check
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(preferences.quiet_hours_start.split(':')[0]);
    const endHour = parseInt(preferences.quiet_hours_end.split(':')[0]);
    
    if (startHour > endHour) {
      // Quiet hours span midnight
      return currentHour >= startHour || currentHour < endHour;
    } else {
      return currentHour >= startHour && currentHour < endHour;
    }
  }

  private shouldSendEmail(type: string, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'mention': return preferences.email_mentions;
      case 'assignment': return preferences.email_assignments;
      case 'comment': return preferences.email_comments;
      case 'deadline': return preferences.email_deadlines;
      default: return false;
    }
  }

  private shouldSendPush(type: string, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'mention': return preferences.push_mentions;
      case 'assignment': return preferences.push_assignments;
      case 'comment': return preferences.push_comments;
      case 'deadline': return preferences.push_deadlines;
      case 'collaboration': return preferences.push_collaboration;
      default: return false;
    }
  }

  private shouldSendMobile(notification: Notification, preferences: NotificationPreferences): boolean {
    if (!preferences.mobile_enabled) return false;
    if (preferences.mobile_urgent_only && notification.priority !== 'urgent') return false;
    
    switch (notification.type) {
      case 'mention': return preferences.mobile_mentions;
      case 'assignment': return preferences.mobile_assignments;
      default: return false;
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // In production, integrate with email service
    console.log('📧 Email notification sent:', notification.title);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // In production, integrate with push notification service
    console.log('🔔 Push notification sent:', notification.title);
  }

  private async sendMobileNotification(notification: Notification): Promise<void> {
    // In production, integrate with mobile push service
    console.log('📱 Mobile notification sent:', notification.title);
  }

  // Event system
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Real-time subscriptions
  public subscribeToNotifications(
    userId: string,
    organizationId: string,
    callback: (notification: Notification) => void
  ): () => void {
    // In production, set up real-time subscription
    console.log(`🔔 Subscribed to notifications for user ${userId}`);
    
    this.on('notification-created', callback);
    
    return () => {
      this.off('notification-created', callback);
      console.log(`🔕 Unsubscribed from notifications for user ${userId}`);
    };
  }
}

export const notificationService = NotificationService.getInstance();