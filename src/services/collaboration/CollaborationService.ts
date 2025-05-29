/**
 * Real-time Collaboration Service
 * Handles multi-user editing, presence, and synchronization
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
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
  private eventListeners: Map<string, Function[]> = new Map();
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
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: Function): void {
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
  private connectWebSocket(sessionId: string): void {
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
          randomUser.cursor = {
            x: Math.random() * 800,
            y: Math.random() * 600
          };
          this.emit('cursor-moved', { user: randomUser, position: randomUser.cursor });
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
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Create user from current session
   */
  public static createUser(name: string, email: string): User {
    return {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      color: CollaborationService.generateUserColor()
    };
  }
}
