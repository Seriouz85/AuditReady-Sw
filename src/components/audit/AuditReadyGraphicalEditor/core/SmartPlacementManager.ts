import * as fabric from 'fabric';

export interface PlacementOptions {
  avoidOverlap: boolean;
  preferredArea: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'auto';
  spacing: number;
  gridSnap: boolean;
  gridSize: number;
}

export interface PlacementResult {
  x: number;
  y: number;
  reason: string;
}

export class SmartPlacementManager {
  private canvas: fabric.Canvas;
  private defaultOptions: PlacementOptions = {
    avoidOverlap: true,
    preferredArea: 'auto',
    spacing: 20,
    gridSnap: true,
    gridSize: 20
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public findOptimalPlacement(
    objectWidth: number,
    objectHeight: number,
    options: Partial<PlacementOptions> = {}
  ): PlacementResult {
    const opts = { ...this.defaultOptions, ...options };
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    const existingObjects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    // Get viewport bounds (visible area)
    const viewport = this.getViewportBounds();
    
    // Try different placement strategies
    let placement: PlacementResult;

    // Strategy 1: Smart auto placement
    if (opts.preferredArea === 'auto') {
      placement = this.findAutoPlacement(objectWidth, objectHeight, existingObjects, viewport, opts);
    } else {
      // Strategy 2: Preferred area placement
      placement = this.findAreaPlacement(objectWidth, objectHeight, existingObjects, opts.preferredArea, opts);
    }

    // Strategy 3: Fallback to grid placement if overlap still exists
    if (opts.avoidOverlap && this.hasOverlap(placement.x, placement.y, objectWidth, objectHeight, existingObjects)) {
      placement = this.findGridPlacement(objectWidth, objectHeight, existingObjects, viewport, opts);
    }

    // Apply grid snapping if enabled
    if (opts.gridSnap) {
      placement.x = Math.round(placement.x / opts.gridSize) * opts.gridSize;
      placement.y = Math.round(placement.y / opts.gridSize) * opts.gridSize;
    }

    // Ensure object stays within canvas bounds
    placement.x = Math.max(0, Math.min(placement.x, canvasWidth - objectWidth));
    placement.y = Math.max(0, Math.min(placement.y, canvasHeight - objectHeight));

    return placement;
  }

  private getViewportBounds(): { left: number; top: number; width: number; height: number } {
    const zoom = this.canvas.getZoom();
    const vpt = this.canvas.viewportTransform;
    
    if (!vpt) {
      return {
        left: 0,
        top: 0,
        width: this.canvas.width || 800,
        height: this.canvas.height || 600
      };
    }

    const containerWidth = this.canvas.getWidth();
    const containerHeight = this.canvas.getHeight();

    return {
      left: -vpt[4] / zoom,
      top: -vpt[5] / zoom,
      width: containerWidth / zoom,
      height: containerHeight / zoom
    };
  }

  private findAutoPlacement(
    width: number,
    height: number,
    existingObjects: fabric.Object[],
    viewport: { left: number; top: number; width: number; height: number },
    options: PlacementOptions
  ): PlacementResult {
    // Prefer visible area first
    const visibleCenterX = viewport.left + viewport.width / 2;
    const visibleCenterY = viewport.top + viewport.height / 2;

    // Try center of visible area first
    let x = visibleCenterX - width / 2;
    let y = visibleCenterY - height / 2;

    if (!this.hasOverlap(x, y, width, height, existingObjects)) {
      return { x, y, reason: 'Placed in visible center' };
    }

    // Try placing near existing objects (workflow continuation)
    if (existingObjects.length > 0) {
      const lastObject = existingObjects[existingObjects.length - 1];
      const lastBounds = lastObject.getBoundingRect();
      
      // Try to the right of last object
      x = lastBounds.left + lastBounds.width + options.spacing;
      y = lastBounds.top;
      
      if (!this.hasOverlap(x, y, width, height, existingObjects) && 
          this.isWithinCanvas(x, y, width, height)) {
        return { x, y, reason: 'Placed to the right of last object' };
      }

      // Try below last object
      x = lastBounds.left;
      y = lastBounds.top + lastBounds.height + options.spacing;
      
      if (!this.hasOverlap(x, y, width, height, existingObjects) && 
          this.isWithinCanvas(x, y, width, height)) {
        return { x, y, reason: 'Placed below last object' };
      }
    }

    // Try top-left of visible area
    x = viewport.left + options.spacing;
    y = viewport.top + options.spacing;
    
    if (!this.hasOverlap(x, y, width, height, existingObjects)) {
      return { x, y, reason: 'Placed in visible top-left' };
    }

    // Fallback to canvas center
    return {
      x: (this.canvas.width || 800) / 2 - width / 2,
      y: (this.canvas.height || 600) / 2 - height / 2,
      reason: 'Fallback to canvas center'
    };
  }

  private findAreaPlacement(
    width: number,
    height: number,
    existingObjects: fabric.Object[],
    area: Exclude<PlacementOptions['preferredArea'], 'auto'>,
    options: PlacementOptions
  ): PlacementResult {
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    const spacing = options.spacing;

    let x: number, y: number;

    switch (area) {
      case 'top-left':
        x = spacing;
        y = spacing;
        break;
      case 'top-right':
        x = canvasWidth - width - spacing;
        y = spacing;
        break;
      case 'bottom-left':
        x = spacing;
        y = canvasHeight - height - spacing;
        break;
      case 'bottom-right':
        x = canvasWidth - width - spacing;
        y = canvasHeight - height - spacing;
        break;
      case 'center':
      default:
        x = canvasWidth / 2 - width / 2;
        y = canvasHeight / 2 - height / 2;
        break;
    }

    return { x, y, reason: `Placed in ${area}` };
  }

  private findGridPlacement(
    width: number,
    height: number,
    existingObjects: fabric.Object[],
    viewport: { left: number; top: number; width: number; height: number },
    options: PlacementOptions
  ): PlacementResult {
    const gridSize = options.gridSize;
    const spacing = options.spacing;
    
    // Start from visible area
    const startX = Math.floor(viewport.left / gridSize) * gridSize;
    const startY = Math.floor(viewport.top / gridSize) * gridSize;
    const endX = viewport.left + viewport.width;
    const endY = viewport.top + viewport.height;

    // Try grid positions in visible area first
    for (let y = startY; y < endY; y += gridSize) {
      for (let x = startX; x < endX; x += gridSize) {
        if (!this.hasOverlap(x, y, width, height, existingObjects) &&
            this.isWithinCanvas(x, y, width, height)) {
          return { x, y, reason: 'Placed on grid in visible area' };
        }
      }
    }

    // Expand search to entire canvas
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;

    for (let y = 0; y < canvasHeight - height; y += gridSize) {
      for (let x = 0; x < canvasWidth - width; x += gridSize) {
        if (!this.hasOverlap(x, y, width, height, existingObjects)) {
          return { x, y, reason: 'Placed on grid' };
        }
      }
    }

    // Final fallback
    return {
      x: spacing,
      y: spacing,
      reason: 'Fallback to top-left with spacing'
    };
  }

  private hasOverlap(
    x: number,
    y: number,
    width: number,
    height: number,
    existingObjects: fabric.Object[]
  ): boolean {
    const newBounds = { left: x, top: y, width, height };

    return existingObjects.some(obj => {
      const bounds = obj.getBoundingRect();
      return this.boundsOverlap(newBounds, bounds);
    });
  }

  private boundsOverlap(
    bounds1: { left: number; top: number; width: number; height: number },
    bounds2: { left: number; top: number; width: number; height: number }
  ): boolean {
    return !(
      bounds1.left + bounds1.width <= bounds2.left ||
      bounds2.left + bounds2.width <= bounds1.left ||
      bounds1.top + bounds1.height <= bounds2.top ||
      bounds2.top + bounds2.height <= bounds1.top
    );
  }

  private isWithinCanvas(x: number, y: number, width: number, height: number): boolean {
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;

    return x >= 0 && y >= 0 && 
           x + width <= canvasWidth && 
           y + height <= canvasHeight;
  }

  public panToObject(object: fabric.Object): void {
    const bounds = object.getBoundingRect();
    const zoom = this.canvas.getZoom();
    const containerWidth = this.canvas.getWidth();
    const containerHeight = this.canvas.getHeight();

    // Calculate center of object
    const objectCenterX = bounds.left + bounds.width / 2;
    const objectCenterY = bounds.top + bounds.height / 2;

    // Calculate where to pan to center the object
    const panX = containerWidth / 2 - objectCenterX * zoom;
    const panY = containerHeight / 2 - objectCenterY * zoom;

    // Apply smooth pan animation
    this.canvas.viewportTransform![4] = panX;
    this.canvas.viewportTransform![5] = panY;
    this.canvas.requestRenderAll();
  }

  public setDefaultOptions(options: Partial<PlacementOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  public getDefaultOptions(): PlacementOptions {
    return { ...this.defaultOptions };
  }
}

// Singleton instance
let smartPlacementManagerInstance: SmartPlacementManager | null = null;

export const getSmartPlacementManager = (canvas?: fabric.Canvas): SmartPlacementManager | null => {
  if (canvas && !smartPlacementManagerInstance) {
    smartPlacementManagerInstance = new SmartPlacementManager(canvas);
  }
  return smartPlacementManagerInstance;
};

export const cleanupSmartPlacementManager = (): void => {
  smartPlacementManagerInstance = null;
};
