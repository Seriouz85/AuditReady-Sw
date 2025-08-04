// import { supabase } from '@/lib/supabase'; // Currently unused

export interface ActivityEvent {
  id: string;
  user_id: string;
  organization_id: string;
  event_type: 'login' | 'logout' | 'view' | 'edit' | 'create' | 'delete' | 'comment' | 'mention' | 'assignment' | 'collaboration' | 'assessment' | 'export' | 'settings_change';
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  action_details?: Record<string, any>;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  
  // Related data
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface UserSession {
  id: string;
  user_id: string;
  organization_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  page_views: number;
  actions_count: number;
  ip_address?: string;
  user_agent?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  is_active: boolean;
}

export interface UserActivityStats {
  user_id: string;
  total_sessions: number;
  total_time_minutes: number;
  avg_session_duration: number;
  page_views: number;
  actions_performed: number;
  last_activity: string;
  most_active_day: string;
  most_active_hour: number;
  favorite_features: string[];
  productivity_score: number;
  engagement_level: 'low' | 'medium' | 'high';
}

export interface OrganizationActivityStats {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  total_sessions: number;
  avg_session_duration: number;
  most_used_features: Array<{ feature: string; usage_count: number }>;
  peak_usage_hours: number[];
  user_engagement_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  activity_trends: Array<{
    date: string;
    active_users: number;
    sessions: number;
    page_views: number;
  }>;
}

export interface ActivityFilter {
  startDate?: string;
  endDate?: string;
  eventTypes?: string[];
  resourceTypes?: string[];
  userIds?: string[];
  limit?: number;
  offset?: number;
}

class UserActivityService {
  private static instance: UserActivityService;
  private currentSession: UserSession | null = null;
  private activityBuffer: ActivityEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  public static getInstance(): UserActivityService {
    if (!UserActivityService.instance) {
      UserActivityService.instance = new UserActivityService();
    }
    return UserActivityService.instance;
  }

  constructor() {
    // Auto-flush activity buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushActivityBuffer();
    }, 30000);

    // Listen for page visibility changes to end sessions
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.pauseSession();
        } else {
          this.resumeSession();
        }
      });

      // End session on page unload
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });
    }
  }

  // Session management
  async startSession(userId: string, organizationId: string): Promise<UserSession> {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session: UserSession = {
        id: sessionId,
        user_id: userId,
        organization_id: organizationId,
        start_time: new Date().toISOString(),
        page_views: 0,
        actions_count: 0,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        device_type: this.detectDeviceType(),
        browser: this.detectBrowser(),
        is_active: true
      };

      this.currentSession = session;

      // In production, insert into database
      // await supabase.from('user_sessions').insert(session);

      // Track session start event
      await this.trackActivity({
        userId,
        organizationId,
        eventType: 'login',
        sessionId
      });

      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor(
        (new Date(endTime).getTime() - new Date(this.currentSession.start_time).getTime()) / (1000 * 60)
      );

      const updatedSession = {
        ...this.currentSession,
        end_time: endTime,
        duration_minutes: duration,
        is_active: false
      };

      // Update the session (in production, this would save to database)
      this.currentSession = updatedSession;

      // In production, update database
      // await supabase.from('user_sessions')
      //   .update({
      //     end_time: endTime,
      //     duration_minutes: duration,
      //     page_views: this.currentSession.page_views,
      //     actions_count: this.currentSession.actions_count,
      //     is_active: false
      //   })
      //   .eq('id', this.currentSession.id);

      // Track logout event
      await this.trackActivity({
        userId: this.currentSession.user_id,
        organizationId: this.currentSession.organization_id,
        eventType: 'logout',
        sessionId: this.currentSession.id
      });

      // Flush any remaining activities
      await this.flushActivityBuffer();

      this.currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  async pauseSession(): Promise<void> {
    // Track when user becomes inactive (tab hidden, etc.)
    if (this.currentSession) {
      this.currentSession.is_active = false;
    }
  }

  async resumeSession(): Promise<void> {
    // Track when user becomes active again
    if (this.currentSession) {
      this.currentSession.is_active = true;
    }
  }

  // Activity tracking
  async trackActivity(params: {
    userId: string;
    organizationId: string;
    eventType: string;
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    actionDetails?: Record<string, any>;
    sessionId?: string;
  }): Promise<void> {
    try {
      const activity: ActivityEvent = {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: params.userId,
        organization_id: params.organizationId,
        event_type: params.eventType as any,
        resource_type: params.resourceType || 'unknown',
        resource_id: params.resourceId || '',
        resource_name: params.resourceName || '',
        action_details: params.actionDetails || {},
        session_id: params.sessionId || this.currentSession?.id || 'unknown',
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // Add to buffer for batch processing
      this.activityBuffer.push(activity);

      // Update current session counters
      if (this.currentSession) {
        if (params.eventType === 'view') {
          this.currentSession.page_views++;
        } else {
          this.currentSession.actions_count++;
        }
      }

      // Flush buffer if it gets too large
      if (this.activityBuffer.length >= 50) {
        await this.flushActivityBuffer();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  private async flushActivityBuffer(): Promise<void> {
    if (this.activityBuffer.length === 0) return;

    try {
      const activitiesToFlush = [...this.activityBuffer];
      this.activityBuffer = [];

      // In production, batch insert into database
      // await supabase.from('activity_events').insert(activitiesToFlush);

      console.log(`📊 Flushed ${activitiesToFlush.length} activity events`);
    } catch (error) {
      console.error('Error flushing activity buffer:', error);
      // Re-add failed activities to buffer
      this.activityBuffer.unshift(...this.activityBuffer);
    }
  }

  // Analytics and reporting
  async getUserActivityStats(
    userId: string, 
    _organizationId: string,
    _timeRange: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<UserActivityStats> {
    try {
      // In production, query actual data
      // For demo, return mock stats
      const mockStats: UserActivityStats = {
        user_id: userId,
        total_sessions: 45,
        total_time_minutes: 1820, // ~30 hours
        avg_session_duration: 40.4,
        page_views: 324,
        actions_performed: 158,
        last_activity: new Date(Date.now() - 3600000).toISOString(),
        most_active_day: 'Tuesday',
        most_active_hour: 14, // 2 PM
        favorite_features: [
          'requirements',
          'assessments',
          'collaboration',
          'notifications',
          'settings'
        ],
        productivity_score: 85,
        engagement_level: 'high'
      };

      return mockStats;
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      throw error;
    }
  }

  async getOrganizationActivityStats(
    _organizationId: string,
    _timeRange: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<OrganizationActivityStats> {
    try {
      // In production, aggregate actual data
      // For demo, return mock stats
      const mockStats: OrganizationActivityStats = {
        total_users: 54,
        active_users_today: 12,
        active_users_week: 28,
        active_users_month: 42,
        total_sessions: 156,
        avg_session_duration: 35.8,
        most_used_features: [
          { feature: 'requirements', usage_count: 245 },
          { feature: 'assessments', usage_count: 189 },
          { feature: 'collaboration', usage_count: 156 },
          { feature: 'documents', usage_count: 134 },
          { feature: 'settings', usage_count: 98 }
        ],
        peak_usage_hours: [9, 10, 11, 14, 15, 16],
        user_engagement_distribution: {
          high: 18,
          medium: 24,
          low: 12
        },
        activity_trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
          active_users: Math.floor(Math.random() * 15) + 8,
          sessions: Math.floor(Math.random() * 25) + 15,
          page_views: Math.floor(Math.random() * 150) + 100
        }))
      };

      return mockStats;
    } catch (error) {
      console.error('Error fetching organization activity stats:', error);
      throw error;
    }
  }

  async getActivityEvents(
    organizationId: string,
    filter: ActivityFilter = {}
  ): Promise<ActivityEvent[]> {
    try {
      // In production, query with proper filtering
      // For demo, return mock events
      const mockEvents: ActivityEvent[] = [
        {
          id: 'activity-1',
          user_id: 'demo-analyst',
          organization_id: organizationId,
          event_type: 'view',
          resource_type: 'requirement',
          resource_id: 'req-a-5-1',
          resource_name: 'A.5.1 - Policies for information security',
          session_id: 'session-123',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: 'demo-analyst',
            name: 'Demo Analyst',
            email: 'analyst@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst'
          }
        },
        {
          id: 'activity-2',
          user_id: 'demo-manager',
          organization_id: organizationId,
          event_type: 'edit',
          resource_type: 'assessment',
          resource_id: 'assessment-1',
          resource_name: 'Q4 2024 Compliance Review',
          action_details: {
            field_changed: 'status',
            old_value: 'in_progress',
            new_value: 'completed'
          },
          session_id: 'session-456',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: 'demo-manager',
            name: 'Demo Manager',
            email: 'manager@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Manager'
          }
        },
        {
          id: 'activity-3',
          user_id: 'demo-admin',
          organization_id: organizationId,
          event_type: 'comment',
          resource_type: 'requirement',
          resource_id: 'req-a-6-1',
          resource_name: 'A.6.1 - Screening',
          action_details: {
            comment_content: 'Updated background check procedures',
            mentions: ['demo-analyst']
          },
          session_id: 'session-789',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: {
            id: 'demo-admin',
            name: 'Demo Admin',
            email: 'admin@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin'
          }
        },
        {
          id: 'activity-4',
          user_id: 'demo-ciso',
          organization_id: organizationId,
          event_type: 'export',
          resource_type: 'assessment',
          resource_id: 'assessment-2',
          resource_name: 'Security Assessment Report',
          action_details: {
            export_format: 'pdf',
            sections_included: ['executive_summary', 'findings', 'recommendations']
          },
          session_id: 'session-101',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: {
            id: 'demo-ciso',
            name: 'Demo CISO',
            email: 'ciso@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO'
          }
        },
        {
          id: 'activity-5',
          user_id: 'demo-analyst',
          organization_id: organizationId,
          event_type: 'collaboration',
          resource_type: 'document',
          resource_id: 'doc-flow-1',
          resource_name: 'Compliance Flow Diagram',
          action_details: {
            collaboration_type: 'real_time_edit',
            participants: ['demo-analyst', 'demo-manager']
          },
          session_id: 'session-202',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: {
            id: 'demo-analyst',
            name: 'Demo Analyst',
            email: 'analyst@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst'
          }
        }
      ];

      // Apply filters
      let filteredEvents = mockEvents;

      if (filter.eventTypes?.length) {
        filteredEvents = filteredEvents.filter(event => 
          filter.eventTypes!.includes(event.event_type)
        );
      }

      if (filter.resourceTypes?.length) {
        filteredEvents = filteredEvents.filter(event => 
          event.resource_type && filter.resourceTypes!.includes(event.resource_type)
        );
      }

      if (filter.userIds?.length) {
        filteredEvents = filteredEvents.filter(event => 
          filter.userIds!.includes(event.user_id)
        );
      }

      if (filter.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp >= filter.startDate!
        );
      }

      if (filter.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp <= filter.endDate!
        );
      }

      // Apply pagination
      const offset = filter.offset || 0;
      const limit = filter.limit || 50;
      
      return filteredEvents.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching activity events:', error);
      throw error;
    }
  }

  async getUserSessions(
    userId: string,
    organizationId: string,
    _timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<UserSession[]> {
    try {
      // In production, query actual sessions
      // For demo, return mock sessions
      const mockSessions: UserSession[] = [
        {
          id: 'session-current',
          user_id: userId,
          organization_id: organizationId,
          start_time: new Date(Date.now() - 3600000).toISOString(),
          page_views: 15,
          actions_count: 8,
          device_type: 'desktop',
          browser: 'Chrome',
          is_active: true
        },
        {
          id: 'session-yesterday',
          user_id: userId,
          organization_id: organizationId,
          start_time: new Date(Date.now() - 86400000 - 3600000).toISOString(),
          end_time: new Date(Date.now() - 86400000).toISOString(),
          duration_minutes: 125,
          page_views: 42,
          actions_count: 23,
          device_type: 'desktop',
          browser: 'Chrome',
          is_active: false
        },
        {
          id: 'session-mobile',
          user_id: userId,
          organization_id: organizationId,
          start_time: new Date(Date.now() - 172800000 - 1800000).toISOString(),
          end_time: new Date(Date.now() - 172800000).toISOString(),
          duration_minutes: 28,
          page_views: 8,
          actions_count: 3,
          device_type: 'mobile',
          browser: 'Safari',
          is_active: false
        }
      ];

      return mockSessions;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  // Helper methods
  private async getClientIP(): Promise<string> {
    // In production, use actual IP detection
    return '192.168.1.100';
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof navigator === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    } else if (/mobile|iphone|android/.test(userAgent)) {
      return 'mobile';
    } else {
      return 'desktop';
    }
  }

  private detectBrowser(): string {
    if (typeof navigator === 'undefined') return 'Unknown';
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Unknown';
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    this.flushActivityBuffer();
    this.endSession();
  }
}

export const userActivityService = UserActivityService.getInstance();