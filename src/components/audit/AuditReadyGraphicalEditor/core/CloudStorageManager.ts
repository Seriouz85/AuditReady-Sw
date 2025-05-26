import * as fabric from 'fabric';

export interface CloudDocument {
  id: string;
  name: string;
  description?: string;
  canvasData: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  tags: string[];
  isPublic: boolean;
  collaborators: string[];
  size: number; // in bytes
}

export interface CloudFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  createdBy: string;
  documentCount: number;
  subfolderCount: number;
}

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'conflict' | 'error' | 'offline';
  lastSync: Date;
  pendingChanges: number;
  error?: string;
}

export interface CloudStorageConfig {
  provider: 'supabase' | 'firebase' | 'aws' | 'local';
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  maxFileSize: number; // bytes
  maxVersions: number;
  compressionEnabled: boolean;
}

export class CloudStorageManager {
  private canvas: fabric.Canvas;
  private config: CloudStorageConfig = {
    provider: 'local',
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxVersions: 50,
    compressionEnabled: true
  };
  private currentDocument: CloudDocument | null = null;
  private syncStatus: SyncStatus = {
    status: 'synced',
    lastSync: new Date(),
    pendingChanges: 0
  };
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private changeQueue: any[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.startAutoSave();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', this.handleCanvasChange.bind(this));
    this.canvas.on('object:modified', this.handleCanvasChange.bind(this));
    this.canvas.on('object:removed', this.handleCanvasChange.bind(this));
    this.canvas.on('path:created', this.handleCanvasChange.bind(this));
  }

  private handleCanvasChange(): void {
    this.syncStatus.pendingChanges++;
    this.syncStatus.status = 'syncing';
    this.emit('sync:status-changed', this.syncStatus);
    
    // Add to change queue for batch processing
    this.changeQueue.push({
      timestamp: new Date(),
      canvasData: this.getCanvasData()
    });
  }

  // Document management
  public async createDocument(name: string, description?: string, folderId?: string): Promise<CloudDocument> {
    const canvasData = this.getCanvasData();
    const thumbnail = this.generateThumbnail();
    
    const document: CloudDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      canvasData,
      thumbnail,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // Should come from auth
      lastModifiedBy: 'current-user',
      version: 1,
      tags: [],
      isPublic: false,
      collaborators: [],
      size: new Blob([canvasData]).size
    };

    try {
      await this.saveToCloud(document);
      this.currentDocument = document;
      this.syncStatus.status = 'synced';
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
      this.emit('document:created', document);
      this.emit('sync:status-changed', this.syncStatus);
      
      console.log(`Document created: ${name}`);
      return document;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('sync:status-changed', this.syncStatus);
      throw error;
    }
  }

  public async saveDocument(document?: CloudDocument): Promise<CloudDocument> {
    const doc = document || this.currentDocument;
    if (!doc) {
      throw new Error('No document to save');
    }

    const canvasData = this.getCanvasData();
    const updatedDocument: CloudDocument = {
      ...doc,
      canvasData,
      thumbnail: this.generateThumbnail(),
      updatedAt: new Date(),
      lastModifiedBy: 'current-user',
      version: doc.version + 1,
      size: new Blob([canvasData]).size
    };

    try {
      await this.saveToCloud(updatedDocument);
      this.currentDocument = updatedDocument;
      this.syncStatus.status = 'synced';
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
      this.changeQueue = [];
      this.emit('document:saved', updatedDocument);
      this.emit('sync:status-changed', this.syncStatus);
      
      console.log(`Document saved: ${updatedDocument.name} (v${updatedDocument.version})`);
      return updatedDocument;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('sync:status-changed', this.syncStatus);
      throw error;
    }
  }

  public async loadDocument(documentId: string): Promise<CloudDocument> {
    try {
      this.syncStatus.status = 'syncing';
      this.emit('sync:status-changed', this.syncStatus);

      const document = await this.loadFromCloud(documentId);
      
      // Load canvas data
      this.canvas.loadFromJSON(document.canvasData, () => {
        this.canvas.renderAll();
        this.currentDocument = document;
        this.syncStatus.status = 'synced';
        this.syncStatus.lastSync = new Date();
        this.syncStatus.pendingChanges = 0;
        this.emit('document:loaded', document);
        this.emit('sync:status-changed', this.syncStatus);
        
        console.log(`Document loaded: ${document.name} (v${document.version})`);
      });

      return document;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('sync:status-changed', this.syncStatus);
      throw error;
    }
  }

  public async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.deleteFromCloud(documentId);
      
      if (this.currentDocument?.id === documentId) {
        this.currentDocument = null;
      }
      
      this.emit('document:deleted', documentId);
      console.log(`Document deleted: ${documentId}`);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  public async listDocuments(folderId?: string): Promise<CloudDocument[]> {
    try {
      return await this.listFromCloud(folderId);
    } catch (error) {
      console.error('Failed to list documents:', error);
      return [];
    }
  }

  public async searchDocuments(query: string, tags?: string[]): Promise<CloudDocument[]> {
    try {
      const allDocuments = await this.listDocuments();
      
      return allDocuments.filter(doc => {
        const matchesQuery = !query || 
          doc.name.toLowerCase().includes(query.toLowerCase()) ||
          doc.description?.toLowerCase().includes(query.toLowerCase());
        
        const matchesTags = !tags || tags.length === 0 ||
          tags.some(tag => doc.tags.includes(tag));
        
        return matchesQuery && matchesTags;
      });
    } catch (error) {
      console.error('Failed to search documents:', error);
      return [];
    }
  }

  // Folder management
  public async createFolder(name: string, parentId?: string): Promise<CloudFolder> {
    const folder: CloudFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date(),
      createdBy: 'current-user',
      documentCount: 0,
      subfolderCount: 0
    };

    try {
      await this.saveFolderToCloud(folder);
      this.emit('folder:created', folder);
      console.log(`Folder created: ${name}`);
      return folder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  public async listFolders(parentId?: string): Promise<CloudFolder[]> {
    try {
      return await this.listFoldersFromCloud(parentId);
    } catch (error) {
      console.error('Failed to list folders:', error);
      return [];
    }
  }

  // Auto-save functionality
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    if (this.config.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        this.performAutoSave();
      }, this.config.autoSaveInterval);
    }
  }

  private async performAutoSave(): Promise<void> {
    if (!this.currentDocument || this.syncStatus.pendingChanges === 0) {
      return;
    }

    try {
      await this.saveDocument();
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Cloud storage abstraction
  private async saveToCloud(document: CloudDocument): Promise<void> {
    switch (this.config.provider) {
      case 'local':
        return this.saveToLocalStorage(document);
      case 'supabase':
        return this.saveToSupabase(document);
      default:
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    }
  }

  private async loadFromCloud(documentId: string): Promise<CloudDocument> {
    switch (this.config.provider) {
      case 'local':
        return this.loadFromLocalStorage(documentId);
      case 'supabase':
        return this.loadFromSupabase(documentId);
      default:
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    }
  }

  private async deleteFromCloud(documentId: string): Promise<void> {
    switch (this.config.provider) {
      case 'local':
        return this.deleteFromLocalStorage(documentId);
      case 'supabase':
        return this.deleteFromSupabase(documentId);
      default:
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    }
  }

  private async listFromCloud(folderId?: string): Promise<CloudDocument[]> {
    switch (this.config.provider) {
      case 'local':
        return this.listFromLocalStorage(folderId);
      case 'supabase':
        return this.listFromSupabase(folderId);
      default:
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    }
  }

  // Local storage implementation
  private async saveToLocalStorage(document: CloudDocument): Promise<void> {
    const key = `fabric_doc_${document.id}`;
    localStorage.setItem(key, JSON.stringify(document));
    
    // Update document list
    const listKey = 'fabric_documents';
    const existingList = JSON.parse(localStorage.getItem(listKey) || '[]');
    const existingIndex = existingList.findIndex((d: any) => d.id === document.id);
    
    if (existingIndex >= 0) {
      existingList[existingIndex] = { id: document.id, name: document.name, updatedAt: document.updatedAt };
    } else {
      existingList.push({ id: document.id, name: document.name, updatedAt: document.updatedAt });
    }
    
    localStorage.setItem(listKey, JSON.stringify(existingList));
  }

  private async loadFromLocalStorage(documentId: string): Promise<CloudDocument> {
    const key = `fabric_doc_${documentId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    return JSON.parse(data);
  }

  private async deleteFromLocalStorage(documentId: string): Promise<void> {
    const key = `fabric_doc_${documentId}`;
    localStorage.removeItem(key);
    
    // Update document list
    const listKey = 'fabric_documents';
    const existingList = JSON.parse(localStorage.getItem(listKey) || '[]');
    const filteredList = existingList.filter((d: any) => d.id !== documentId);
    localStorage.setItem(listKey, JSON.stringify(filteredList));
  }

  private async listFromLocalStorage(folderId?: string): Promise<CloudDocument[]> {
    const listKey = 'fabric_documents';
    const documentList = JSON.parse(localStorage.getItem(listKey) || '[]');
    
    const documents: CloudDocument[] = [];
    
    for (const item of documentList) {
      try {
        const doc = await this.loadFromLocalStorage(item.id);
        documents.push(doc);
      } catch (error) {
        console.warn(`Failed to load document ${item.id}:`, error);
      }
    }
    
    return documents;
  }

  // Placeholder methods for other providers
  private async saveToSupabase(document: CloudDocument): Promise<void> {
    // TODO: Implement Supabase integration
    throw new Error('Supabase integration not implemented');
  }

  private async loadFromSupabase(documentId: string): Promise<CloudDocument> {
    // TODO: Implement Supabase integration
    throw new Error('Supabase integration not implemented');
  }

  private async deleteFromSupabase(documentId: string): Promise<void> {
    // TODO: Implement Supabase integration
    throw new Error('Supabase integration not implemented');
  }

  private async listFromSupabase(folderId?: string): Promise<CloudDocument[]> {
    // TODO: Implement Supabase integration
    throw new Error('Supabase integration not implemented');
  }

  private async saveFolderToCloud(folder: CloudFolder): Promise<void> {
    // TODO: Implement folder storage
    console.log('Folder storage not implemented');
  }

  private async listFoldersFromCloud(parentId?: string): Promise<CloudFolder[]> {
    // TODO: Implement folder listing
    return [];
  }

  // Utility methods
  private getCanvasData(): string {
    return JSON.stringify(this.canvas.toJSON(['id', 'selectable', 'evented']));
  }

  private generateThumbnail(): string {
    try {
      return this.canvas.toDataURL({
        format: 'png',
        quality: 0.3,
        multiplier: 0.2
      });
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return '';
    }
  }

  // Configuration
  public setConfig(config: Partial<CloudStorageConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.autoSave !== undefined || config.autoSaveInterval !== undefined) {
      this.startAutoSave();
    }
    
    this.emit('config:changed', this.config);
  }

  public getConfig(): CloudStorageConfig {
    return { ...this.config };
  }

  public getCurrentDocument(): CloudDocument | null {
    return this.currentDocument;
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
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

  public cleanup(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    this.canvas.off('object:added', this.handleCanvasChange);
    this.canvas.off('object:modified', this.handleCanvasChange);
    this.canvas.off('object:removed', this.handleCanvasChange);
    this.canvas.off('path:created', this.handleCanvasChange);
    
    this.changeQueue = [];
    this.eventHandlers.clear();
    this.currentDocument = null;
  }
}

// Singleton instance
let cloudStorageManagerInstance: CloudStorageManager | null = null;

export const getCloudStorageManager = (canvas?: fabric.Canvas): CloudStorageManager | null => {
  if (canvas && !cloudStorageManagerInstance) {
    cloudStorageManagerInstance = new CloudStorageManager(canvas);
  }
  return cloudStorageManagerInstance;
};

export const cleanupCloudStorageManager = (): void => {
  if (cloudStorageManagerInstance) {
    cloudStorageManagerInstance.cleanup();
    cloudStorageManagerInstance = null;
  }
};
