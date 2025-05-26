import * as fabric from 'fabric';

export interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: string[]; // Object IDs
  isActive: boolean;
  lastSeen: Date;
}

export interface CollaborationEvent {
  id: string;
  type: 'object:added' | 'object:modified' | 'object:removed' | 'cursor:moved' | 'selection:changed';
  collaboratorId: string;
  timestamp: Date;
  data: any;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'merge' | 'manual';
  priority: 'timestamp' | 'user-role' | 'manual';
}

export class CollaborationManager {
  private canvas: fabric.Canvas;
  private collaborators: Map<string, CollaboratorInfo> = new Map();
  private currentUser: CollaboratorInfo | null = null;
  private cursors: Map<string, fabric.Circle> = new Map();
  private selectionIndicators: Map<string, fabric.Rect[]> = new Map();
  private eventQueue: CollaborationEvent[] = [];
  private isEnabled: boolean = false;
  private conflictResolution: ConflictResolution = {
    strategy: 'last-write-wins',
    priority: 'timestamp'
  };
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Canvas events for collaboration
    this.canvas.on('object:added', this.handleObjectAdded.bind(this));
    this.canvas.on('object:modified', this.handleObjectModified.bind(this));
    this.canvas.on('object:removed', this.handleObjectRemoved.bind(this));
    this.canvas.on('selection:created', this.handleSelectionChanged.bind(this));
    this.canvas.on('selection:updated', this.handleSelectionChanged.bind(this));
    this.canvas.on('selection:cleared', this.handleSelectionCleared.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
  }

  // User management
  public setCurrentUser(user: Omit<CollaboratorInfo, 'isActive' | 'lastSeen'>): void {
    this.currentUser = {
      ...user,
      isActive: true,
      lastSeen: new Date()
    };
    this.collaborators.set(user.id, this.currentUser);
    this.emit('user:joined', this.currentUser);
  }

  public addCollaborator(collaborator: CollaboratorInfo): void {
    this.collaborators.set(collaborator.id, collaborator);
    this.createCursorForCollaborator(collaborator);
    this.emit('collaborator:joined', collaborator);
    console.log(`Collaborator joined: ${collaborator.name}`);
  }

  public removeCollaborator(collaboratorId: string): void {
    const collaborator = this.collaborators.get(collaboratorId);
    if (collaborator) {
      this.removeCursorForCollaborator(collaboratorId);
      this.removeSelectionIndicators(collaboratorId);
      this.collaborators.delete(collaboratorId);
      this.emit('collaborator:left', collaborator);
      console.log(`Collaborator left: ${collaborator.name}`);
    }
  }

  public updateCollaborator(collaboratorId: string, updates: Partial<CollaboratorInfo>): void {
    const collaborator = this.collaborators.get(collaboratorId);
    if (collaborator) {
      Object.assign(collaborator, updates, { lastSeen: new Date() });
      this.emit('collaborator:updated', collaborator);
    }
  }

  public getCollaborators(): CollaboratorInfo[] {
    return Array.from(this.collaborators.values());
  }

  public getActiveCollaborators(): CollaboratorInfo[] {
    return this.getCollaborators().filter(c => c.isActive);
  }

  // Cursor management
  private createCursorForCollaborator(collaborator: CollaboratorInfo): void {
    const cursor = new fabric.Circle({
      radius: 8,
      fill: collaborator.color,
      stroke: 'white',
      strokeWidth: 2,
      left: -100, // Start off-screen
      top: -100,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      opacity: 0.8
    });

    // Add name label
    const label = new fabric.Text(collaborator.name, {
      left: -100,
      top: -100,
      fontSize: 12,
      fill: 'white',
      backgroundColor: collaborator.color,
      padding: 4,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    this.canvas.add(cursor);
    this.canvas.add(label);
    this.cursors.set(collaborator.id, cursor);
    this.cursors.set(`${collaborator.id}_label`, label as any);
  }

  private removeCursorForCollaborator(collaboratorId: string): void {
    const cursor = this.cursors.get(collaboratorId);
    const label = this.cursors.get(`${collaboratorId}_label`);
    
    if (cursor) {
      this.canvas.remove(cursor);
      this.cursors.delete(collaboratorId);
    }
    
    if (label) {
      this.canvas.remove(label);
      this.cursors.delete(`${collaboratorId}_label`);
    }
  }

  public updateCollaboratorCursor(collaboratorId: string, x: number, y: number): void {
    const cursor = this.cursors.get(collaboratorId);
    const label = this.cursors.get(`${collaboratorId}_label`);
    
    if (cursor) {
      cursor.set({ left: x, top: y });
    }
    
    if (label) {
      (label as fabric.Text).set({ left: x + 15, top: y - 5 });
    }
    
    this.canvas.renderAll();
    
    // Update collaborator info
    this.updateCollaborator(collaboratorId, { cursor: { x, y } });
  }

  // Selection indicators
  private showSelectionIndicators(collaboratorId: string, objectIds: string[]): void {
    this.removeSelectionIndicators(collaboratorId);
    
    const collaborator = this.collaborators.get(collaboratorId);
    if (!collaborator) return;

    const indicators: fabric.Rect[] = [];
    
    objectIds.forEach(objectId => {
      const obj = this.canvas.getObjects().find(o => o.id === objectId);
      if (obj) {
        const bounds = obj.getBoundingRect();
        const indicator = new fabric.Rect({
          left: bounds.left - 2,
          top: bounds.top - 2,
          width: bounds.width + 4,
          height: bounds.height + 4,
          fill: 'transparent',
          stroke: collaborator.color,
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        
        indicators.push(indicator);
        this.canvas.add(indicator);
      }
    });
    
    this.selectionIndicators.set(collaboratorId, indicators);
    this.canvas.renderAll();
  }

  private removeSelectionIndicators(collaboratorId: string): void {
    const indicators = this.selectionIndicators.get(collaboratorId);
    if (indicators) {
      indicators.forEach(indicator => this.canvas.remove(indicator));
      this.selectionIndicators.delete(collaboratorId);
    }
  }

  // Event handling
  private handleObjectAdded(e: any): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    const event: CollaborationEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'object:added',
      collaboratorId: this.currentUser.id,
      timestamp: new Date(),
      data: {
        object: e.target.toJSON(['id'])
      }
    };
    
    this.addToEventQueue(event);
    this.emit('event:created', event);
  }

  private handleObjectModified(e: any): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    const event: CollaborationEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'object:modified',
      collaboratorId: this.currentUser.id,
      timestamp: new Date(),
      data: {
        objectId: e.target.id,
        changes: e.target.toJSON(['id'])
      }
    };
    
    this.addToEventQueue(event);
    this.emit('event:created', event);
  }

  private handleObjectRemoved(e: any): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    const event: CollaborationEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'object:removed',
      collaboratorId: this.currentUser.id,
      timestamp: new Date(),
      data: {
        objectId: e.target.id
      }
    };
    
    this.addToEventQueue(event);
    this.emit('event:created', event);
  }

  private handleSelectionChanged(e: any): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    const selectedIds = (e.selected || [e.target]).map((obj: fabric.Object) => obj.id).filter(Boolean);
    
    this.updateCollaborator(this.currentUser.id, { selection: selectedIds });
    
    const event: CollaborationEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'selection:changed',
      collaboratorId: this.currentUser.id,
      timestamp: new Date(),
      data: {
        selection: selectedIds
      }
    };
    
    this.addToEventQueue(event);
    this.emit('event:created', event);
  }

  private handleSelectionCleared(): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    this.updateCollaborator(this.currentUser.id, { selection: [] });
  }

  private handleMouseMove(e: any): void {
    if (!this.isEnabled || !this.currentUser) return;
    
    const pointer = this.canvas.getPointer(e.e);
    this.updateCollaborator(this.currentUser.id, { 
      cursor: { x: pointer.x, y: pointer.y } 
    });
    
    // Emit cursor movement (throttled)
    this.throttledEmitCursor(pointer.x, pointer.y);
  }

  private throttledEmitCursor = this.throttle((x: number, y: number) => {
    this.emit('cursor:moved', { x, y });
  }, 100);

  // Event queue management
  private addToEventQueue(event: CollaborationEvent): void {
    this.eventQueue.push(event);
    
    // Limit queue size
    if (this.eventQueue.length > 1000) {
      this.eventQueue = this.eventQueue.slice(-500);
    }
  }

  public getEventQueue(): CollaborationEvent[] {
    return [...this.eventQueue];
  }

  public clearEventQueue(): void {
    this.eventQueue = [];
  }

  // Remote event processing
  public processRemoteEvent(event: CollaborationEvent): void {
    if (!this.isEnabled) return;
    
    switch (event.type) {
      case 'object:added':
        this.processRemoteObjectAdded(event);
        break;
      case 'object:modified':
        this.processRemoteObjectModified(event);
        break;
      case 'object:removed':
        this.processRemoteObjectRemoved(event);
        break;
      case 'selection:changed':
        this.processRemoteSelectionChanged(event);
        break;
      case 'cursor:moved':
        this.processRemoteCursorMoved(event);
        break;
    }
  }

  private processRemoteObjectAdded(event: CollaborationEvent): void {
    // Add object from remote user
    fabric.util.enlivenObjects([event.data.object], (objects: fabric.Object[]) => {
      if (objects.length > 0) {
        this.canvas.add(objects[0]);
        this.canvas.renderAll();
      }
    });
  }

  private processRemoteObjectModified(event: CollaborationEvent): void {
    // Update object from remote user
    const obj = this.canvas.getObjects().find(o => o.id === event.data.objectId);
    if (obj) {
      obj.set(event.data.changes);
      obj.setCoords();
      this.canvas.renderAll();
    }
  }

  private processRemoteObjectRemoved(event: CollaborationEvent): void {
    // Remove object from remote user
    const obj = this.canvas.getObjects().find(o => o.id === event.data.objectId);
    if (obj) {
      this.canvas.remove(obj);
      this.canvas.renderAll();
    }
  }

  private processRemoteSelectionChanged(event: CollaborationEvent): void {
    // Show selection indicators for remote user
    this.showSelectionIndicators(event.collaboratorId, event.data.selection);
  }

  private processRemoteCursorMoved(event: CollaborationEvent): void {
    // Update cursor position for remote user
    this.updateCollaboratorCursor(event.collaboratorId, event.data.x, event.data.y);
  }

  // Utility methods
  private throttle(func: Function, delay: number): Function {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return function (this: any, ...args: any[]) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Public methods
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAllCollaborationIndicators();
    }
    console.log(`Collaboration ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isCollaborationEnabled(): boolean {
    return this.isEnabled;
  }

  private clearAllCollaborationIndicators(): void {
    // Clear all cursors
    this.cursors.forEach((cursor, id) => {
      this.canvas.remove(cursor);
    });
    this.cursors.clear();

    // Clear all selection indicators
    this.selectionIndicators.forEach((indicators) => {
      indicators.forEach(indicator => this.canvas.remove(indicator));
    });
    this.selectionIndicators.clear();

    this.canvas.renderAll();
  }

  public cleanup(): void {
    this.clearAllCollaborationIndicators();
    this.canvas.off('object:added', this.handleObjectAdded);
    this.canvas.off('object:modified', this.handleObjectModified);
    this.canvas.off('object:removed', this.handleObjectRemoved);
    this.canvas.off('selection:created', this.handleSelectionChanged);
    this.canvas.off('selection:updated', this.handleSelectionChanged);
    this.canvas.off('selection:cleared', this.handleSelectionCleared);
    this.canvas.off('mouse:move', this.handleMouseMove);
    
    this.collaborators.clear();
    this.eventQueue = [];
    this.eventHandlers.clear();
    this.currentUser = null;
  }
}

// Singleton instance
let collaborationManagerInstance: CollaborationManager | null = null;

export const getCollaborationManager = (canvas?: fabric.Canvas): CollaborationManager | null => {
  if (canvas && !collaborationManagerInstance) {
    collaborationManagerInstance = new CollaborationManager(canvas);
  }
  return collaborationManagerInstance;
};

export const cleanupCollaborationManager = (): void => {
  if (collaborationManagerInstance) {
    collaborationManagerInstance.cleanup();
    collaborationManagerInstance = null;
  }
};
