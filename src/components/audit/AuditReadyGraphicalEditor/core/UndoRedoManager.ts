import * as fabric from 'fabric';

interface CanvasState {
  json: string;
  timestamp: number;
}

export class UndoRedoManager {
  private canvas: fabric.Canvas;
  private states: CanvasState[] = [];
  private currentIndex: number = -1;
  private maxStates: number = 50;
  private isRestoring: boolean = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.saveState(); // Save initial state
  }

  private setupEventListeners(): void {
    // Save state after modifications
    this.canvas.on('object:added', () => this.handleCanvasChange());
    this.canvas.on('object:removed', () => this.handleCanvasChange());
    this.canvas.on('object:modified', () => this.handleCanvasChange());
    this.canvas.on('path:created', () => this.handleCanvasChange());
  }

  private handleCanvasChange(): void {
    if (this.isRestoring) return;
    
    // Debounce state saving to avoid too many saves
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveState();
    }, 300);
  }

  private saveTimeout: NodeJS.Timeout | null = null;

  public saveState(): void {
    if (this.isRestoring) return;

    try {
      const json = JSON.stringify(this.canvas.toJSON());
      const state: CanvasState = {
        json,
        timestamp: Date.now()
      };

      // Remove any states after current index (when undoing then making new changes)
      this.states = this.states.slice(0, this.currentIndex + 1);
      
      // Add new state
      this.states.push(state);
      this.currentIndex = this.states.length - 1;

      // Limit the number of states
      if (this.states.length > this.maxStates) {
        this.states.shift();
        this.currentIndex--;
      }

      console.log(`State saved. Total states: ${this.states.length}, Current: ${this.currentIndex}`);
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  }

  public undo(): boolean {
    if (!this.canUndo()) return false;

    this.currentIndex--;
    this.restoreState(this.states[this.currentIndex]);
    console.log(`Undo performed. Current index: ${this.currentIndex}`);
    return true;
  }

  public redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    this.restoreState(this.states[this.currentIndex]);
    console.log(`Redo performed. Current index: ${this.currentIndex}`);
    return true;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  private async restoreState(state: CanvasState): Promise<void> {
    if (!state) return;

    this.isRestoring = true;
    
    try {
      const data = JSON.parse(state.json);
      this.canvas.clear();
      await this.canvas.loadFromJSON(data);
      this.canvas.renderAll();
    } catch (error) {
      console.error('Error restoring canvas state:', error);
    } finally {
      this.isRestoring = false;
    }
  }

  public getStateInfo(): { current: number; total: number; canUndo: boolean; canRedo: boolean } {
    return {
      current: this.currentIndex,
      total: this.states.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  public cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.canvas.off('object:added');
    this.canvas.off('object:removed');
    this.canvas.off('object:modified');
    this.canvas.off('path:created');
    
    this.states = [];
    this.currentIndex = -1;
  }
}

// Singleton instance
let undoRedoManagerInstance: UndoRedoManager | null = null;

export const getUndoRedoManager = (canvas?: fabric.Canvas): UndoRedoManager | null => {
  if (canvas && !undoRedoManagerInstance) {
    undoRedoManagerInstance = new UndoRedoManager(canvas);
  }
  return undoRedoManagerInstance;
};

export const cleanupUndoRedoManager = (): void => {
  if (undoRedoManagerInstance) {
    undoRedoManagerInstance.cleanup();
    undoRedoManagerInstance = null;
  }
};
