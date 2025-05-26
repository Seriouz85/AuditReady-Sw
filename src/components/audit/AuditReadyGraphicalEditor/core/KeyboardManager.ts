import * as fabric from 'fabric';
import { getUndoRedoManager } from './UndoRedoManager';
import { getAlignmentManager } from './AlignmentManager';
import { getAnimationManager } from './AnimationManager';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardManager {
  private canvas: fabric.Canvas;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled: boolean = true;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupDefaultShortcuts();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private setupDefaultShortcuts(): void {
    // Undo/Redo
    this.addShortcut({
      key: 'z',
      ctrlKey: true,
      description: 'Undo',
      action: () => {
        const undoRedoManager = getUndoRedoManager();
        if (undoRedoManager?.canUndo()) {
          undoRedoManager.undo();
        }
      }
    });

    this.addShortcut({
      key: 'y',
      ctrlKey: true,
      description: 'Redo',
      action: () => {
        const undoRedoManager = getUndoRedoManager();
        if (undoRedoManager?.canRedo()) {
          undoRedoManager.redo();
        }
      }
    });

    // Selection
    this.addShortcut({
      key: 'a',
      ctrlKey: true,
      description: 'Select All',
      action: () => {
        const objects = this.canvas.getObjects().filter(obj => 
          !obj.isConnectionPoint && !obj.isConnector
        );
        if (objects.length > 0) {
          const selection = new fabric.ActiveSelection(objects, {
            canvas: this.canvas
          });
          this.canvas.setActiveObject(selection);
          this.canvas.renderAll();
        }
      }
    });

    // Copy/Paste
    this.addShortcut({
      key: 'c',
      ctrlKey: true,
      description: 'Copy',
      action: () => this.copySelectedObjects()
    });

    this.addShortcut({
      key: 'v',
      ctrlKey: true,
      description: 'Paste',
      action: () => this.pasteObjects()
    });

    // Delete
    this.addShortcut({
      key: 'Delete',
      description: 'Delete Selected',
      action: () => this.deleteSelectedObjects()
    });

    this.addShortcut({
      key: 'Backspace',
      description: 'Delete Selected',
      action: () => this.deleteSelectedObjects()
    });

    // Escape
    this.addShortcut({
      key: 'Escape',
      description: 'Clear Selection',
      action: () => {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    });

    // Alignment shortcuts
    this.addShortcut({
      key: 'ArrowLeft',
      ctrlKey: true,
      description: 'Align Left',
      action: () => this.alignObjects('left')
    });

    this.addShortcut({
      key: 'ArrowRight',
      ctrlKey: true,
      description: 'Align Right',
      action: () => this.alignObjects('right')
    });

    this.addShortcut({
      key: 'ArrowUp',
      ctrlKey: true,
      description: 'Align Top',
      action: () => this.alignObjects('top')
    });

    this.addShortcut({
      key: 'ArrowDown',
      ctrlKey: true,
      description: 'Align Bottom',
      action: () => this.alignObjects('bottom')
    });

    // Layer management
    this.addShortcut({
      key: ']',
      ctrlKey: true,
      description: 'Bring Forward',
      action: () => this.bringForward()
    });

    this.addShortcut({
      key: '[',
      ctrlKey: true,
      description: 'Send Backward',
      action: () => this.sendBackward()
    });

    // Zoom
    this.addShortcut({
      key: '=',
      ctrlKey: true,
      description: 'Zoom In',
      action: () => this.zoomIn()
    });

    this.addShortcut({
      key: '-',
      ctrlKey: true,
      description: 'Zoom Out',
      action: () => this.zoomOut()
    });

    this.addShortcut({
      key: '0',
      ctrlKey: true,
      description: 'Zoom to Fit',
      action: () => this.zoomToFit()
    });

    // Movement with arrow keys
    this.addShortcut({
      key: 'ArrowLeft',
      description: 'Move Left',
      action: () => this.moveSelected(-1, 0)
    });

    this.addShortcut({
      key: 'ArrowRight',
      description: 'Move Right',
      action: () => this.moveSelected(1, 0)
    });

    this.addShortcut({
      key: 'ArrowUp',
      description: 'Move Up',
      action: () => this.moveSelected(0, -1)
    });

    this.addShortcut({
      key: 'ArrowDown',
      description: 'Move Down',
      action: () => this.moveSelected(0, 1)
    });

    // Fine movement with Shift
    this.addShortcut({
      key: 'ArrowLeft',
      shiftKey: true,
      description: 'Move Left (Fine)',
      action: () => this.moveSelected(-10, 0)
    });

    this.addShortcut({
      key: 'ArrowRight',
      shiftKey: true,
      description: 'Move Right (Fine)',
      action: () => this.moveSelected(10, 0)
    });

    this.addShortcut({
      key: 'ArrowUp',
      shiftKey: true,
      description: 'Move Up (Fine)',
      action: () => this.moveSelected(0, -10)
    });

    this.addShortcut({
      key: 'ArrowDown',
      shiftKey: true,
      description: 'Move Down (Fine)',
      action: () => this.moveSelected(0, 10)
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Don't handle shortcuts when typing in inputs
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' || 
                          activeElement?.tagName === 'TEXTAREA' ||
                          activeElement?.contentEditable === 'true';

    if (isInputFocused) return;

    const shortcutKey = this.createShortcutKey(e);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }
  }

  private createShortcutKey(e: KeyboardEvent): string {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }

  public addShortcut(shortcut: KeyboardShortcut): void {
    const key = this.createShortcutKeyFromShortcut(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  private createShortcutKeyFromShortcut(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrlKey || shortcut.metaKey) parts.push('ctrl');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  // Action implementations
  private copySelectedObjects(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        (window as any).clipboardObject = cloned;
        console.log('Object copied to clipboard');
      });
    }
  }

  private pasteObjects(): void {
    const clipboardObject = (window as any).clipboardObject;
    if (clipboardObject) {
      clipboardObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 10,
          top: (cloned.top || 0) + 10,
        });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.renderAll();
        console.log('Object pasted');
      });
    }
  }

  private deleteSelectedObjects(): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        // Handle connector cleanup
        if ((obj as any).isConnector && (obj as any).arrowhead) {
          this.canvas.remove((obj as any).arrowhead);
        }
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }

  private alignObjects(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    const alignmentManager = getAlignmentManager();
    const activeObjects = this.canvas.getActiveObjects();
    
    if (alignmentManager && activeObjects.length >= 2) {
      switch (direction) {
        case 'left':
          alignmentManager.alignLeft(activeObjects);
          break;
        case 'right':
          alignmentManager.alignRight(activeObjects);
          break;
        case 'top':
          alignmentManager.alignTop(activeObjects);
          break;
        case 'bottom':
          alignmentManager.alignBottom(activeObjects);
          break;
      }
    }
  }

  private bringForward(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.bringObjectForward(activeObject);
      this.canvas.renderAll();
    }
  }

  private sendBackward(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.sendObjectBackwards(activeObject);
      this.canvas.renderAll();
    }
  }

  private zoomIn(): void {
    const animationManager = getAnimationManager();
    const currentZoom = this.canvas.getZoom();
    const newZoom = Math.min(currentZoom * 1.2, 3);
    
    if (animationManager) {
      animationManager.animateZoom(newZoom);
    } else {
      this.canvas.setZoom(newZoom);
      this.canvas.renderAll();
    }
  }

  private zoomOut(): void {
    const animationManager = getAnimationManager();
    const currentZoom = this.canvas.getZoom();
    const newZoom = Math.max(currentZoom / 1.2, 0.1);
    
    if (animationManager) {
      animationManager.animateZoom(newZoom);
    } else {
      this.canvas.setZoom(newZoom);
      this.canvas.renderAll();
    }
  }

  private zoomToFit(): void {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );
    
    if (objects.length === 0) return;

    // Calculate bounding box of all objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    const padding = 50;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const canvasWidth = this.canvas.width! - padding * 2;
    const canvasHeight = this.canvas.height! - padding * 2;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const animationManager = getAnimationManager();
    if (animationManager) {
      animationManager.animateZoom(scale);
    } else {
      this.canvas.setZoom(scale);
      this.canvas.renderAll();
    }
  }

  private moveSelected(deltaX: number, deltaY: number): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        obj.set({
          left: (obj.left || 0) + deltaX,
          top: (obj.top || 0) + deltaY
        });
      });
      this.canvas.renderAll();
    }
  }

  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
  }
}

// Singleton instance
let keyboardManagerInstance: KeyboardManager | null = null;

export const getKeyboardManager = (canvas?: fabric.Canvas): KeyboardManager | null => {
  if (canvas && !keyboardManagerInstance) {
    keyboardManagerInstance = new KeyboardManager(canvas);
  }
  return keyboardManagerInstance;
};

export const cleanupKeyboardManager = (): void => {
  if (keyboardManagerInstance) {
    keyboardManagerInstance.cleanup();
    keyboardManagerInstance = null;
  }
};
