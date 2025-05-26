import * as fabric from 'fabric';

export interface BackgroundSettings {
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  backgroundColor: string;
  exportWithGrid: boolean;
  gridStyle: 'dots' | 'lines' | 'crosses';
}

export class CanvasBackgroundManager {
  private canvas: fabric.Canvas;
  private gridPattern: fabric.Pattern | null = null;
  private settings: BackgroundSettings = {
    showGrid: true,
    gridSize: 20,
    gridColor: '#e5e7eb',
    gridOpacity: 0.5,
    backgroundColor: '#ffffff',
    exportWithGrid: false, // Best practice: don't export grid
    gridStyle: 'dots'
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initializeBackground();
  }

  private initializeBackground(): void {
    this.updateBackground();
  }

  public updateBackground(): void {
    if (this.settings.showGrid) {
      this.createGridPattern();
    } else {
      this.removeGrid();
    }
    
    this.canvas.setBackgroundColor(this.settings.backgroundColor, () => {
      this.canvas.renderAll();
    });
  }

  private createGridPattern(): void {
    const { gridSize, gridColor, gridOpacity, gridStyle } = this.settings;
    
    // Create a canvas for the pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = gridSize;
    patternCanvas.height = gridSize;
    const ctx = patternCanvas.getContext('2d')!;

    // Clear the canvas
    ctx.clearRect(0, 0, gridSize, gridSize);
    
    // Set grid color with opacity
    ctx.fillStyle = gridColor;
    ctx.globalAlpha = gridOpacity;

    switch (gridStyle) {
      case 'dots':
        this.drawDots(ctx, gridSize);
        break;
      case 'lines':
        this.drawLines(ctx, gridSize);
        break;
      case 'crosses':
        this.drawCrosses(ctx, gridSize);
        break;
    }

    // Create fabric pattern
    this.gridPattern = new fabric.Pattern({
      source: patternCanvas,
      repeat: 'repeat'
    });

    // Apply pattern as background
    this.canvas.setBackgroundColor(this.gridPattern, () => {
      this.canvas.renderAll();
    });
  }

  private drawDots(ctx: CanvasRenderingContext2D, size: number): void {
    const dotSize = Math.max(1, size / 20);
    ctx.beginPath();
    ctx.arc(0, 0, dotSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawLines(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    ctx.globalAlpha = ctx.globalAlpha * 0.5; // Make lines more subtle
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
  }

  private drawCrosses(ctx: CanvasRenderingContext2D, size: number): void {
    const crossSize = Math.max(2, size / 10);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    
    // Draw cross at origin
    ctx.beginPath();
    ctx.moveTo(-crossSize / 2, 0);
    ctx.lineTo(crossSize / 2, 0);
    ctx.moveTo(0, -crossSize / 2);
    ctx.lineTo(0, crossSize / 2);
    ctx.stroke();
  }

  private removeGrid(): void {
    this.gridPattern = null;
    this.canvas.setBackgroundColor(this.settings.backgroundColor, () => {
      this.canvas.renderAll();
    });
  }

  // Export methods
  public prepareForExport(): { originalBackground: any; originalBackgroundColor: any } {
    const originalBackground = this.canvas.backgroundImage;
    const originalBackgroundColor = this.canvas.backgroundColor;

    if (!this.settings.exportWithGrid && this.gridPattern) {
      // Temporarily remove grid for export
      this.canvas.setBackgroundColor(this.settings.backgroundColor, () => {});
    }

    return { originalBackground, originalBackgroundColor };
  }

  public restoreAfterExport(originalState: { originalBackground: any; originalBackgroundColor: any }): void {
    if (!this.settings.exportWithGrid && this.settings.showGrid) {
      // Restore grid after export
      this.canvas.setBackgroundColor(this.gridPattern || this.settings.backgroundColor, () => {
        this.canvas.renderAll();
      });
    }
  }

  // Settings management
  public setSettings(newSettings: Partial<BackgroundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateBackground();
  }

  public getSettings(): BackgroundSettings {
    return { ...this.settings };
  }

  public toggleGrid(): void {
    this.settings.showGrid = !this.settings.showGrid;
    this.updateBackground();
  }

  public setGridSize(size: number): void {
    this.settings.gridSize = Math.max(5, Math.min(100, size));
    if (this.settings.showGrid) {
      this.updateBackground();
    }
  }

  public setGridColor(color: string): void {
    this.settings.gridColor = color;
    if (this.settings.showGrid) {
      this.updateBackground();
    }
  }

  public setGridOpacity(opacity: number): void {
    this.settings.gridOpacity = Math.max(0.1, Math.min(1, opacity));
    if (this.settings.showGrid) {
      this.updateBackground();
    }
  }

  public setGridStyle(style: BackgroundSettings['gridStyle']): void {
    this.settings.gridStyle = style;
    if (this.settings.showGrid) {
      this.updateBackground();
    }
  }

  public setBackgroundColor(color: string): void {
    this.settings.backgroundColor = color;
    this.updateBackground();
  }

  public setExportWithGrid(exportWithGrid: boolean): void {
    this.settings.exportWithGrid = exportWithGrid;
  }

  // Utility methods
  public isGridVisible(): boolean {
    return this.settings.showGrid;
  }

  public getGridSize(): number {
    return this.settings.gridSize;
  }

  public shouldExportWithGrid(): boolean {
    return this.settings.exportWithGrid;
  }

  // Preset configurations
  public applyPreset(preset: 'minimal' | 'standard' | 'detailed' | 'print'): void {
    switch (preset) {
      case 'minimal':
        this.setSettings({
          showGrid: false,
          backgroundColor: '#ffffff',
          exportWithGrid: false
        });
        break;
      case 'standard':
        this.setSettings({
          showGrid: true,
          gridSize: 20,
          gridColor: '#e5e7eb',
          gridOpacity: 0.5,
          gridStyle: 'dots',
          backgroundColor: '#ffffff',
          exportWithGrid: false
        });
        break;
      case 'detailed':
        this.setSettings({
          showGrid: true,
          gridSize: 10,
          gridColor: '#d1d5db',
          gridOpacity: 0.7,
          gridStyle: 'lines',
          backgroundColor: '#ffffff',
          exportWithGrid: false
        });
        break;
      case 'print':
        this.setSettings({
          showGrid: false,
          backgroundColor: '#ffffff',
          exportWithGrid: false
        });
        break;
    }
  }

  // Snap to grid functionality
  public snapToGrid(x: number, y: number): { x: number; y: number } {
    if (!this.settings.showGrid) {
      return { x, y };
    }

    const gridSize = this.settings.gridSize;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  public cleanup(): void {
    this.gridPattern = null;
  }
}

// Singleton instance
let canvasBackgroundManagerInstance: CanvasBackgroundManager | null = null;

export const getCanvasBackgroundManager = (canvas?: fabric.Canvas): CanvasBackgroundManager | null => {
  if (canvas && !canvasBackgroundManagerInstance) {
    canvasBackgroundManagerInstance = new CanvasBackgroundManager(canvas);
  }
  return canvasBackgroundManagerInstance;
};

export const cleanupCanvasBackgroundManager = (): void => {
  if (canvasBackgroundManagerInstance) {
    canvasBackgroundManagerInstance.cleanup();
    canvasBackgroundManagerInstance = null;
  }
};
