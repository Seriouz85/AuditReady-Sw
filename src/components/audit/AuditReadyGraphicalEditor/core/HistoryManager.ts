import * as fabric from 'fabric';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  canvasState: string;
  thumbnail?: string;
  metadata?: any;
}

export interface VersionInfo {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  canvasState: string;
  thumbnail?: string;
  isAutoSave: boolean;
}

export class HistoryManager {
  private canvas: fabric.Canvas;
  private history: HistoryEntry[] = [];
  private versions: VersionInfo[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;
  private maxVersions: number = 20;
  private autoSaveInterval: number = 30000; // 30 seconds
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private lastSaveTime: Date = new Date();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.startAutoSave();
    this.saveInitialState();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', () => this.debounceHistoryCapture('Object Added'));
    this.canvas.on('object:removed', () => this.debounceHistoryCapture('Object Removed'));
    this.canvas.on('object:modified', () => this.debounceHistoryCapture('Object Modified'));
    this.canvas.on('path:created', () => this.debounceHistoryCapture('Path Created'));
  }

  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceHistoryCapture(action: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.captureState(action);
    }, 500); // 500ms debounce
  }

  private saveInitialState(): void {
    this.captureState('Initial State', 'Canvas initialized');
  }

  public captureState(action: string, description?: string): void {
    const canvasState = JSON.stringify(this.canvas.toJSON(['id', 'selectable', 'evented']));
    
    const entry: HistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      description: description || action,
      canvasState,
      thumbnail: this.generateThumbnail()
    };

    // Remove any entries after current index (when undoing then making new changes)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(entry);
    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`History captured: ${action} (${this.history.length} entries)`);
  }

  public undo(): boolean {
    if (this.currentIndex <= 0) return false;

    this.currentIndex--;
    const entry = this.history[this.currentIndex];
    this.restoreState(entry.canvasState);
    console.log(`Undone: ${entry.action}`);
    return true;
  }

  public redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    const entry = this.history[this.currentIndex];
    this.restoreState(entry.canvasState);
    console.log(`Redone: ${entry.action}`);
    return true;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private restoreState(canvasState: string): void {
    this.canvas.loadFromJSON(canvasState, () => {
      this.canvas.renderAll();
      // Re-setup any special object properties
      this.canvas.getObjects().forEach(obj => {
        if (obj.type === 'line' && (obj as any).isConnector) {
          // Restore connector properties
          (obj as any).isConnector = true;
        }
      });
    });
  }

  private generateThumbnail(): string {
    try {
      // Create a smaller version for thumbnail
      const scale = 0.1;
      return this.canvas.toDataURL({
        format: 'png',
        quality: 0.3,
        multiplier: scale
      });
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return '';
    }
  }

  // Version management
  public createVersion(name: string, description: string = ''): VersionInfo {
    const canvasState = JSON.stringify(this.canvas.toJSON(['id', 'selectable', 'evented']));
    
    const version: VersionInfo = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      timestamp: new Date(),
      canvasState,
      thumbnail: this.generateThumbnail(),
      isAutoSave: false
    };

    this.versions.push(version);

    // Limit versions
    if (this.versions.length > this.maxVersions) {
      // Remove oldest non-manual versions first
      const autoSaveVersions = this.versions.filter(v => v.isAutoSave);
      if (autoSaveVersions.length > 0) {
        const oldestAutoSave = autoSaveVersions[0];
        const index = this.versions.indexOf(oldestAutoSave);
        this.versions.splice(index, 1);
      } else {
        this.versions.shift();
      }
    }

    console.log(`Version created: ${name}`);
    return version;
  }

  public restoreVersion(versionId: string): boolean {
    const version = this.versions.find(v => v.id === versionId);
    if (!version) return false;

    this.restoreState(version.canvasState);
    this.captureState('Version Restored', `Restored to version: ${version.name}`);
    console.log(`Version restored: ${version.name}`);
    return true;
  }

  public deleteVersion(versionId: string): boolean {
    const index = this.versions.findIndex(v => v.id === versionId);
    if (index === -1) return false;

    const version = this.versions[index];
    this.versions.splice(index, 1);
    console.log(`Version deleted: ${version.name}`);
    return true;
  }

  public getAllVersions(): VersionInfo[] {
    return [...this.versions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  public getCurrentHistoryIndex(): number {
    return this.currentIndex;
  }

  // Auto-save functionality
  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.performAutoSave();
    }, this.autoSaveInterval);
  }

  private performAutoSave(): void {
    const now = new Date();
    const timeSinceLastSave = now.getTime() - this.lastSaveTime.getTime();
    
    // Only auto-save if there have been changes and enough time has passed
    if (timeSinceLastSave >= this.autoSaveInterval && this.history.length > 0) {
      const autoSaveName = `Auto-save ${now.toLocaleTimeString()}`;
      const version = this.createVersion(autoSaveName, 'Automatic save');
      version.isAutoSave = true;
      this.lastSaveTime = now;
      console.log('Auto-save performed');
    }
  }

  public setAutoSaveInterval(intervalMs: number): void {
    this.autoSaveInterval = Math.max(10000, intervalMs); // Minimum 10 seconds
    
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.startAutoSave();
    }
  }

  public enableAutoSave(enabled: boolean): void {
    if (enabled && !this.autoSaveTimer) {
      this.startAutoSave();
    } else if (!enabled && this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Export/Import functionality
  public exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      versions: this.versions,
      currentIndex: this.currentIndex,
      timestamp: new Date().toISOString()
    });
  }

  public importHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.history && Array.isArray(parsed.history)) {
        this.history = parsed.history.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
      
      if (parsed.versions && Array.isArray(parsed.versions)) {
        this.versions = parsed.versions.map((version: any) => ({
          ...version,
          timestamp: new Date(version.timestamp)
        }));
      }
      
      if (typeof parsed.currentIndex === 'number') {
        this.currentIndex = Math.min(parsed.currentIndex, this.history.length - 1);
      }
      
      console.log('History imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  public clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.saveInitialState();
    console.log('History cleared');
  }

  public clearVersions(): void {
    this.versions = [];
    console.log('Versions cleared');
  }

  // Statistics
  public getStatistics(): {
    historyEntries: number;
    versions: number;
    autoSaveVersions: number;
    manualVersions: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const autoSaveVersions = this.versions.filter(v => v.isAutoSave).length;
    const manualVersions = this.versions.filter(v => !v.isAutoSave).length;
    
    return {
      historyEntries: this.history.length,
      versions: this.versions.length,
      autoSaveVersions,
      manualVersions,
      oldestEntry: this.history.length > 0 ? this.history[0].timestamp : undefined,
      newestEntry: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : undefined
    };
  }

  public cleanup(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.canvas.off('object:added');
    this.canvas.off('object:removed');
    this.canvas.off('object:modified');
    this.canvas.off('path:created');
    
    this.history = [];
    this.versions = [];
    this.currentIndex = -1;
  }
}

// Singleton instance
let historyManagerInstance: HistoryManager | null = null;

export const getHistoryManager = (canvas?: fabric.Canvas): HistoryManager | null => {
  if (canvas && !historyManagerInstance) {
    historyManagerInstance = new HistoryManager(canvas);
  }
  return historyManagerInstance;
};

export const cleanupHistoryManager = (): void => {
  if (historyManagerInstance) {
    historyManagerInstance.cleanup();
    historyManagerInstance = null;
  }
};
