import * as fabric from 'fabric';

export interface GridOptions {
  size: number;
  enabled: boolean;
  snapToGrid: boolean;
  color: string;
  opacity: number;
}

export class GridManager {
  private canvas: fabric.Canvas;
  private gridGroup: fabric.Group | null = null;
  private options: GridOptions = {
    size: 20,
    enabled: true,
    snapToGrid: false,
    color: '#e5e7eb',
    opacity: 0.5
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.createGrid();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.on('path:created', this.handlePathCreated.bind(this));
  }

  private handleObjectMoving(e: any): void {
    if (!this.options.snapToGrid) return;

    const obj = e.target;
    if (!obj || ((obj as any)['isConnectionPoint']) || ((obj as any)['isConnector'])) return;

    // If Shift is held, do not snap
    if (e.e && e.e.shiftKey) return;

    const gridSize = this.options.size;
    const left = obj.left || 0;
    const top = obj.top || 0;
    const snappedLeft = Math.round(left / gridSize) * gridSize;
    const snappedTop = Math.round(top / gridSize) * gridSize;
    const threshold = 8; // px

    // Only snap if within threshold
    const dx = Math.abs(left - snappedLeft);
    const dy = Math.abs(top - snappedTop);
    obj.set({
      left: dx < threshold ? snappedLeft : left,
      top: dy < threshold ? snappedTop : top
    });
  }

  private handlePathCreated(e: any): void {
    if (!this.options.snapToGrid) return;

    const path = e.path;
    if (!path) return;

    const gridSize = this.options.size;
    const snappedLeft = Math.round((path.left || 0) / gridSize) * gridSize;
    const snappedTop = Math.round((path.top || 0) / gridSize) * gridSize;

    path.set({
      left: snappedLeft,
      top: snappedTop
    });
  }

  private createGrid(): void {
    if (!this.options.enabled) return;

    this.removeGrid();

    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    const gridSize = this.options.size;
    const lines: fabric.Line[] = [];

    // Create vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      const line = new fabric.Line([x, 0, x, canvasHeight], {
        stroke: this.options.color,
        strokeWidth: 1,
        opacity: this.options.opacity,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      lines.push(line);
    }

    // Create horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      const line = new fabric.Line([0, y, canvasWidth, y], {
        stroke: this.options.color,
        strokeWidth: 1,
        opacity: this.options.opacity,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      lines.push(line);
    }

    // Create grid group
    this.gridGroup = new fabric.Group(lines, {
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    // Add grid to canvas background
    this.canvas.add(this.gridGroup);
    this.canvas.sendObjectToBack(this.gridGroup);
    this.canvas.renderAll();
  }

  private removeGrid(): void {
    if (this.gridGroup) {
      this.canvas.remove(this.gridGroup);
      this.gridGroup = null;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    if (enabled) {
      this.createGrid();
    } else {
      this.removeGrid();
    }
    console.log(`Grid ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isEnabled(): boolean {
    return this.options.enabled;
  }

  public setSnapToGrid(snap: boolean): void {
    this.options.snapToGrid = snap;
    console.log(`Snap to grid ${snap ? 'enabled' : 'disabled'}`);
  }

  public isSnapToGridEnabled(): boolean {
    return this.options.snapToGrid;
  }

  public setGridSize(size: number): void {
    this.options.size = Math.max(5, Math.min(100, size));
    if (this.options.enabled) {
      this.createGrid();
    }
  }

  public getGridSize(): number {
    return this.options.size;
  }

  public setGridColor(color: string): void {
    this.options.color = color;
    if (this.options.enabled) {
      this.createGrid();
    }
  }

  public setGridOpacity(opacity: number): void {
    this.options.opacity = Math.max(0, Math.min(1, opacity));
    if (this.options.enabled) {
      this.createGrid();
    }
  }

  public getOptions(): GridOptions {
    return { ...this.options };
  }

  public updateOptions(newOptions: Partial<GridOptions>): void {
    this.options = { ...this.options, ...newOptions };
    if (this.options.enabled) {
      this.createGrid();
    }
  }

  // Snap point to grid
  public snapPointToGrid(x: number, y: number): { x: number; y: number } {
    if (!this.options.snapToGrid) {
      return { x, y };
    }

    const gridSize = this.options.size;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  // Snap object to grid
  public snapObjectToGrid(object: fabric.Object): void {
    if (!this.options.snapToGrid) return;

    const gridSize = this.options.size;
    const snappedLeft = Math.round((object.left || 0) / gridSize) * gridSize;
    const snappedTop = Math.round((object.top || 0) / gridSize) * gridSize;

    object.set({
      left: snappedLeft,
      top: snappedTop
    });

    this.canvas.renderAll();
  }

  // Snap all objects to grid
  public snapAllObjectsToGrid(): void {
    if (!this.options.snapToGrid) return;

    const objects = this.canvas.getObjects().filter((obj: any) => 
      !obj.isConnectionPoint && 
      !obj.isConnector && 
      obj !== this.gridGroup
    );

    objects.forEach((obj: any) => {
      this.snapObjectToGrid(obj);
    });

    console.log(`Snapped ${objects.length} objects to grid`);
  }

  // Create grid-based layout helpers
  public createGridLayout(rows: number, cols: number, padding: number = 20): {
    cellWidth: number;
    cellHeight: number;
    getCellPosition: (row: number, col: number) => { x: number; y: number };
  } {
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    return {
      cellWidth,
      cellHeight,
      getCellPosition: (row: number, col: number) => ({
        x: padding + col * cellWidth + cellWidth / 2,
        y: padding + row * cellHeight + cellHeight / 2
      })
    };
  }

  // Auto-arrange objects in grid
  public autoArrangeObjects(objects: fabric.Object[], cols: number = 3): void {
    if (objects.length === 0) return;

    const rows = Math.ceil(objects.length / cols);
    const layout = this.createGridLayout(rows, cols, 50);

    objects.forEach((obj, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const position = layout.getCellPosition(row, col);

      obj.set({
        left: position.x,
        top: position.y
      });
    });

    this.canvas.renderAll();
    console.log(`Auto-arranged ${objects.length} objects in ${rows}x${cols} grid`);
  }

  public cleanup(): void {
    this.removeGrid();
    this.canvas.off('object:moving', this.handleObjectMoving);
    this.canvas.off('path:created', this.handlePathCreated);
  }
}

// Singleton instance
let gridManagerInstance: GridManager | null = null;

export const getGridManager = (canvas?: fabric.Canvas): GridManager | null => {
  if (canvas && !gridManagerInstance) {
    gridManagerInstance = new GridManager(canvas);
  }
  return gridManagerInstance;
};

export const cleanupGridManager = (): void => {
  if (gridManagerInstance) {
    gridManagerInstance.cleanup();
    gridManagerInstance = null;
  }
};
