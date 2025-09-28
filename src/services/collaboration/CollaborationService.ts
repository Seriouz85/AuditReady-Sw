/**
 * Comprehensive Team Collaboration Service
 * Handles comments, activity feeds, presence, mentions, and real-time collaboration
 */

import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  resource_type: 'requirement' | 'assessment' | 'document' | 'risk' | 'diagram';
  resource_id: string;
  parent_comment_id?: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  is_edited: boolean;
  edit_history?: Array<{
    content: string;
    edited_at: string;
  }>;
}

export interface Mention {
  id: string;
  user_id: string;
  mentioned_by_id: string;
  comment_id: string;
  resource_type: string;
  resource_id: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'comment' | 'assignment' | 'status_change' | 'document_upload' | 'assessment_submit' | 'mention' | 'collaboration';
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  target_type: string;
  target_id: string;
  target_name: string;
  action: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  is_important: boolean;
}

export interface PresenceInfo {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  resource_type: string;
  resource_id: string;
  last_seen: string;
  is_online: boolean;
  current_activity?: string;
}

export interface CollaborationStats {
  total_comments: number;
  comments_this_week: number;
  active_discussions: number;
  team_activity_score: number;
  top_contributors: Array<{
    user_id: string;
    user_name: string;
    user_avatar?: string;
    contribution_count: number;
  }>;
}

export interface CollaborationSession {
  id: string;
  diagramId: string;
  users: User[];
  createdAt: Date;
  lastActivity: Date;
}

export interface CollaborationEvent {
  type: 'text-change' | 'cursor-move' | 'user-join' | 'user-leave' | 'selection-change';
  userId: string;
  timestamp: Date;
  data: any;
}

export interface TextChange {
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length?: number;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private websocket: WebSocket | null = null;
  private currentSession: CollaborationSession | null = null;
  private currentUser: User | null = null;
  private eventListeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Initialize collaboration session
   */
  public async initializeSession(diagramId: string, user: User): Promise<CollaborationSession> {
    try {
      this.currentUser = user;
      
      // In a real implementation, this would connect to a WebSocket server
      // For now, we'll simulate collaboration locally
      const session: CollaborationSession = {
        id: `session-${Date.now()}`,
        diagramId,
        users: [user],
        createdAt: new Date(),
        lastActivity: new Date()
      };

      this.currentSession = session;
      this.connectWebSocket(session.id);
      
      console.log('✅ Collaboration session initialized:', session.id);
      this.emit('session-initialized', session);
      
      return session;
    } catch (error) {
      console.error('❌ Failed to initialize collaboration session:', error);
      throw error;
    }
  }

  /**
   * Join existing collaboration session
   */
  public async joinSession(sessionId: string, user: User): Promise<CollaborationSession> {
    try {
      this.currentUser = user;
      
      // Simulate joining session
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession.users.push(user);
        this.currentSession.lastActivity = new Date();
      } else {
        // Create new session if not exists
        this.currentSession = {
          id: sessionId,
          diagramId: `diagram-${sessionId}`,
          users: [user],
          createdAt: new Date(),
          lastActivity: new Date()
        };
      }

      this.connectWebSocket(sessionId);
      this.broadcastEvent({
        type: 'user-join',
        userId: user.id,
        timestamp: new Date(),
        data: user
      });

      console.log('✅ Joined collaboration session:', sessionId);
      this.emit('user-joined', user);
      
      return this.currentSession;
    } catch (error) {
      console.error('❌ Failed to join collaboration session:', error);
      throw error;
    }
  }

  /**
   * Leave collaboration session
   */
  public async leaveSession(): Promise<void> {
    if (!this.currentSession || !this.currentUser) return;

    try {
      this.broadcastEvent({
        type: 'user-leave',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: this.currentUser
      });

      // Remove user from session
      this.currentSession.users = this.currentSession.users.filter(
        u => u.id !== this.currentUser!.id
      );

      this.disconnectWebSocket();
      this.emit('user-left', this.currentUser);
      
      console.log('✅ Left collaboration session');
      
      this.currentSession = null;
      this.currentUser = null;
    } catch (error) {
      console.error('❌ Failed to leave collaboration session:', error);
    }
  }

  /**
   * Broadcast text changes to other users
   */
  public broadcastTextChange(change: TextChange): void {
    if (!this.currentSession || !this.currentUser) return;

    const event: CollaborationEvent = {
      type: 'text-change',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: change
    };

    this.broadcastEvent(event);
  }

  /**
   * Broadcast cursor movement
   */
  public broadcastCursorMove(position: { x: number; y: number }): void {
    if (!this.currentSession || !this.currentUser) return;

    // Update current user's cursor position
    this.currentUser.cursor = position;

    const event: CollaborationEvent = {
      type: 'cursor-move',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: position
    };

    this.broadcastEvent(event);
  }

  /**
   * Broadcast text selection change
   */
  public broadcastSelectionChange(selection: { start: number; end: number }): void {
    if (!this.currentSession || !this.currentUser) return;

    this.currentUser.selection = selection;

    const event: CollaborationEvent = {
      type: 'selection-change',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: selection
    };

    this.broadcastEvent(event);
  }

  /**
   * Get current session users
   */
  public getSessionUsers(): User[] {
    return this.currentSession?.users || [];
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if collaboration is active
   */
  public isCollaborating(): boolean {
    return this.currentSession !== null && this.currentSession.users.length > 1;
  }

  /**
   * Add event listener
   */
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Connect to WebSocket server
   */
  private connectWebSocket(_sessionId: string): void {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate WebSocket behavior
      console.log('🔌 Connecting to collaboration server...');
      
      // Simulate connection success
      setTimeout(() => {
        console.log('✅ Connected to collaboration server');
        this.emit('connected');
      }, 1000);

      // Simulate receiving events from other users
      this.simulateCollaborationEvents();
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  private disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    console.log('🔌 Disconnected from collaboration server');
  }

  /**
   * Handle WebSocket reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentSession) {
          this.connectWebSocket(this.currentSession.id);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('connection-failed');
    }
  }

  /**
   * Broadcast event to other users
   */
  private broadcastEvent(event: CollaborationEvent): void {
    if (!this.currentSession) return;

    // In a real implementation, this would send the event via WebSocket
    console.log('📡 Broadcasting event:', event.type, event.data);
    
    // Update session activity
    this.currentSession.lastActivity = new Date();
    
    // Emit to local listeners (for demo purposes)
    this.emit('collaboration-event', event);
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentSession) {
        // User switched away from tab
        this.emit('user-away', this.currentUser);
      } else if (!document.hidden && this.currentSession) {
        // User returned to tab
        this.emit('user-active', this.currentUser);
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.leaveSession();
    });
  }

  /**
   * Simulate collaboration events for demo
   */
  private simulateCollaborationEvents(): void {
    // Simulate other users joining occasionally
    setTimeout(() => {
      if (this.currentSession && Math.random() > 0.7) {
        const simulatedUser: User = {
          id: `user-${Date.now()}`,
          name: 'Demo User',
          email: 'demo@example.com',
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        };
        
        this.currentSession.users.push(simulatedUser);
        this.emit('user-joined', simulatedUser);
      }
    }, 5000);

    // Simulate cursor movements
    setInterval(() => {
      if (this.currentSession && this.currentSession.users.length > 1) {
        const otherUsers = this.currentSession.users.filter(u => u.id !== this.currentUser?.id);
        if (otherUsers.length > 0) {
          const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
          if (randomUser) {
            randomUser.cursor = {
              x: Math.random() * 800,
              y: Math.random() * 600
            };
            this.emit('cursor-moved', { user: randomUser, position: randomUser.cursor });
          }
        }
      }
    }, 2000);
  }

  /**
   * Generate user color
   */
  public static generateUserColor(): string {
    const colors = [
      '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)] || '#3b82f6';
  }

  /**
   * Create user from current session
   */
  public static createUser(name: string, email: string): User {
    return {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Unknown User',
      email: email || '',
      color: CollaborationService.generateUserColor()
    };
  }

  // ========== ENHANCED COLLABORATION FEATURES ==========

  /**
   * Get comments for a resource
   */
  public async getComments(resourceType: string, resourceId: string): Promise<Comment[]> {
    try {
      // In production, this would query the actual database
      // For demo, return mock data
      const mockComments: Comment[] = [
        {
          id: 'comment-1',
          content: 'This requirement needs additional clarification on the encryption standards. @demo-ciso please review.',
          author_id: 'demo-user-1',
          author_name: 'Demo Admin',
          author_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin',
          resource_type: resourceType as any,
          resource_id: resourceId,
          mentions: ['demo-ciso'],
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          is_edited: false,
          replies: [
            {
              id: 'comment-2',
              content: 'I\'ll update the requirement to specify AES-256 encryption minimum.',
              author_id: 'demo-ciso',
              author_name: 'Demo CISO',
              author_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO',
              resource_type: resourceType as any,
              resource_id: resourceId,
              parent_comment_id: 'comment-1',
              mentions: [],
              created_at: new Date(Date.now() - 1800000).toISOString(),
              updated_at: new Date(Date.now() - 1800000).toISOString(),
              is_edited: false
            }
          ]
        },
        {
          id: 'comment-3',
          content: 'Assessment completed and evidence uploaded. Ready for review.',
          author_id: 'demo-analyst',
          author_name: 'Demo Analyst',
          author_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst',
          resource_type: resourceType as any,
          resource_id: resourceId,
          mentions: [],
          created_at: new Date(Date.now() - 900000).toISOString(),
          updated_at: new Date(Date.now() - 900000).toISOString(),
          is_edited: false
        }
      ];

      return mockComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Add a comment to a resource
   */
  public async addComment(params: {
    content: string;
    resourceType: string;
    resourceId: string;
    parentCommentId?: string;
    mentions?: string[];
  }): Promise<{ success: boolean; comment?: Comment; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Extract mentions from content (simple @username detection)
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(params.content)) !== null) {
        mentions.push(match[1]);
      }

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content: params.content,
        author_id: user.id,
        author_name: user.user_metadata?.['name'] || user.email?.split('@')[0] || 'Unknown User',
        author_avatar: user.user_metadata?.['avatar_url'] || '',
        resource_type: params.resourceType as any,
        resource_id: params.resourceId,
        parent_comment_id: params.parentCommentId || '',
        mentions: [...mentions.filter((m): m is string => typeof m === 'string'), ...(params.mentions || [])],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_edited: false
      };

      // In production, save to database
      // await supabase.from('comments').insert(newComment);

      // Create mentions notifications
      const validMentions = mentions.filter((m): m is string => typeof m === 'string');
      if (validMentions.length > 0) {
        await this.createMentionNotifications(newComment, validMentions);
      }

      // Log activity
      await this.logActivity({
        type: 'comment',
        actor_id: user.id,
        actor_name: newComment.author_name,
        target_type: params.resourceType,
        target_id: params.resourceId,
        action: 'added_comment',
        description: `commented on ${params.resourceType}`,
        metadata: { comment_id: newComment.id, mentions: validMentions },
        target_name: 'Comment',
        is_important: false
      });

      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: 'Failed to add comment' };
    }
  }

  /**
   * Get activity feed for an organization
   */
  public async getActivityFeed(
    _organizationId: string,
    limit = 50,
    filters?: {
      types?: string[];
      dateRange?: { start: string; end: string };
      userIds?: string[];
    }
  ): Promise<ActivityFeedItem[]> {
    try {
      // In production, query actual activity logs
      // For demo, return mock data
      const mockActivities: ActivityFeedItem[] = [
        {
          id: 'activity-1',
          type: 'assignment',
          actor_id: 'demo-admin',
          actor_name: 'Demo Admin',
          actor_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin',
          target_type: 'requirement',
          target_id: 'req-1',
          target_name: 'A.5.1 - Policies for information security',
          action: 'assigned',
          description: 'assigned requirement to Demo Analyst',
          metadata: { assigned_to: 'demo-analyst', due_date: '2025-02-01' },
          created_at: new Date(Date.now() - 1800000).toISOString(),
          is_important: true
        },
        {
          id: 'activity-2',
          type: 'comment',
          actor_id: 'demo-ciso',
          actor_name: 'Demo CISO',
          actor_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO',
          target_type: 'requirement',
          target_id: 'req-2',
          target_name: 'A.6.1 - Screening',
          action: 'commented',
          description: 'commented on requirement',
          metadata: { comment_preview: 'Need to update the background check procedures...' },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_important: false
        },
        {
          id: 'activity-3',
          type: 'collaboration',
          actor_id: this.currentUser?.id || 'demo-user',
          actor_name: this.currentUser?.name || 'Demo User',
          actor_avatar: this.currentUser?.avatar || '',
          target_type: 'diagram',
          target_id: this.currentSession?.diagramId || 'diagram-1',
          target_name: 'Compliance Flow Diagram',
          action: 'started_collaboration',
          description: 'started real-time collaboration session',
          metadata: { session_id: this.currentSession?.id, user_count: this.currentSession?.users.length || 1 },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_important: true
        }
      ];

      // Apply filters
      let filteredActivities = mockActivities;
      
      if (filters?.types) {
        filteredActivities = filteredActivities.filter(activity => 
          filters.types!.includes(activity.type)
        );
      }

      if (filters?.userIds) {
        filteredActivities = filteredActivities.filter(activity => 
          filters.userIds!.includes(activity.actor_id)
        );
      }

      return filteredActivities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  }

  /**
   * Update user presence for a resource
   */
  public updatePresence(resourceType: string, resourceId: string, activity: string): void {
    if (!this.currentUser) return;

    try {
      // In production, this would update the presence in real-time database
      console.log(`🟢 Updating presence for user ${this.currentUser.name}: ${activity} on ${resourceType}:${resourceId}`);
      
      // Update current user activity
      this.currentUser.current_activity = activity;
      
      // Emit presence update event
      this.emit('presence-updated', {
        user_id: this.currentUser.id,
        user_name: this.currentUser.name,
        resource_type: resourceType,
        resource_id: resourceId,
        current_activity: activity,
        last_seen: new Date().toISOString(),
        is_online: true
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  /**
   * Get presence information for a resource
   */
  public async getResourcePresence(resourceType: string, resourceId: string): Promise<PresenceInfo[]> {
    try {
      // In production, query real-time presence data
      // For demo, return mock data with current session users
      const presenceData: PresenceInfo[] = [];

      if (this.currentSession && this.currentSession.users) {
        this.currentSession.users.forEach(user => {
          presenceData.push({
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.avatar || '',
            resource_type: resourceType,
            resource_id: resourceId,
            last_seen: new Date().toISOString(),
            is_online: true,
            current_activity: user.id === this.currentUser?.id ? 'editing' : 'viewing'
          });
        });
      }

      // Add some mock offline users
      presenceData.push({
        user_id: 'demo-user-offline',
        user_name: 'Demo Manager',
        user_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Manager',
        resource_type: resourceType,
        resource_id: resourceId,
        last_seen: new Date(Date.now() - 1800000).toISOString(),
        is_online: false,
        current_activity: 'reviewed'
      });

      return presenceData;
    } catch (error) {
      console.error('Error fetching presence info:', error);
      return [];
    }
  }

  /**
   * Get collaboration statistics
   */
  public async getCollaborationStats(
    _organizationId: string,
    _timeRange: 'week' | 'month' | 'quarter' = 'week'
  ): Promise<CollaborationStats> {
    try {
      // In production, calculate from actual data
      // For demo, return mock stats
      return {
        total_comments: 127,
        comments_this_week: 23,
        active_discussions: 8,
        team_activity_score: 85,
        top_contributors: [
          {
            user_id: 'demo-admin',
            user_name: 'Demo Admin',
            user_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin',
            contribution_count: 45
          },
          {
            user_id: 'demo-ciso',
            user_name: 'Demo CISO',
            user_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO',
            contribution_count: 32
          },
          {
            user_id: 'demo-analyst',
            user_name: 'Demo Analyst',
            user_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst',
            contribution_count: 28
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching collaboration stats:', error);
      return {
        total_comments: 0,
        comments_this_week: 0,
        active_discussions: 0,
        team_activity_score: 0,
        top_contributors: []
      };
    }
  }

  /**
   * Get mentions for a user
   */
  public async getMentions(userId: string, unreadOnly = false): Promise<Mention[]> {
    try {
      // In production, query mentions table
      // For demo, return mock data
      const mockMentions: Mention[] = [
        {
          id: 'mention-1',
          user_id: userId,
          mentioned_by_id: 'demo-admin',
          comment_id: 'comment-1',
          resource_type: 'requirement',
          resource_id: 'req-1',
          is_read: false,
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      return unreadOnly ? mockMentions.filter(m => !m.is_read) : mockMentions;
    } catch (error) {
      console.error('Error fetching mentions:', error);
      return [];
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Create mention notifications
   */
  private async createMentionNotifications(_comment: Comment, mentionedUsers: string[]): Promise<void> {
    try {
      // In production, create mention records and send notifications
      for (const mentionedUser of mentionedUsers) {
        // Create mention record
        // Send real-time notification
        // Send email notification if user preferences allow
        console.log(`📧 Mention notification sent to ${mentionedUser}`);
      }
    } catch (error) {
      console.error('Error creating mention notifications:', error);
    }
  }

  /**
   * Log activity to feed
   */
  private async logActivity(activity: Omit<ActivityFeedItem, 'id' | 'created_at'>): Promise<void> {
    try {
      // In production, insert into activity_feed table
      const activityItem: ActivityFeedItem = {
        ...activity,
        id: `activity-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      console.log('📊 Activity logged:', activity.type, activity.action);
      this.emit('activity-logged', activityItem);
      
      // await supabase.from('activity_feed').insert(activityItem);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Subscribe to real-time comments
   */
  public subscribeToComments(
    resourceType: string,
    resourceId: string,
    _callback: (comment: Comment) => void
  ): () => void {
    // In production, set up real-time subscription
    // For demo, return a no-op unsubscribe function
    console.log(`🔔 Subscribed to comments for ${resourceType}:${resourceId}`);
    return () => {
      console.log(`🔕 Unsubscribed from comments for ${resourceType}:${resourceId}`);
    };
  }

  /**
   * Subscribe to real-time activity feed
   */
  public subscribeToActivityFeed(
    organizationId: string,
    _callback: (activity: ActivityFeedItem) => void
  ): () => void {
    // In production, set up real-time activity feed subscription
    // For demo, return a no-op unsubscribe function
    console.log(`🔔 Subscribed to activity feed for organization ${organizationId}`);
    return () => {
      console.log(`🔕 Unsubscribed from activity feed for organization ${organizationId}`);
    };
  }
}
