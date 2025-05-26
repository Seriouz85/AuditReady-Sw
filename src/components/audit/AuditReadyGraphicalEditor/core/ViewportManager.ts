import * as fabric from 'fabric';

export interface ViewportBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CanvasMetrics {
  contentBounds: ViewportBounds;
  objectCount: number;
  isEmpty: boolean;
  recommendedSize: { width: number; height: number };
}

export class ViewportManager {
  private canvas: fabric.Canvas;
  private containerElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private minCanvasSize = { width: 800, height: 600 };
  private maxCanvasSize = { width: 4000, height: 3000 };
  private padding = 100; // Padding around content

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupResizeObserver();
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.handleContainerResize(entry.contentRect);
        }
      });
    }
  }

  public setContainer(element: HTMLElement): void {
    if (this.containerElement && this.resizeObserver) {
      this.resizeObserver.unobserve(this.containerElement);
    }

    this.containerElement = element;
    
    if (this.resizeObserver && element) {
      this.resizeObserver.observe(element);
    }

    this.updateCanvasSize();
  }

  private handleContainerResize(rect: DOMRectReadOnly): void {
    // Debounce resize events
    setTimeout(() => {
      this.updateCanvasSize();
    }, 100);
  }

  public updateCanvasSize(): void {
    if (!this.containerElement) return;

    const containerRect = this.containerElement.getBoundingClientRect();
    const metrics = this.getCanvasMetrics();
    
    // Calculate optimal canvas size based on content and container
    let canvasWidth: number;
    let canvasHeight: number;

    if (metrics.isEmpty) {
      // For empty canvas, use container size with minimum constraints
      canvasWidth = Math.max(containerRect.width - 40, this.minCanvasSize.width);
      canvasHeight = Math.max(containerRect.height - 40, this.minCanvasSize.height);
    } else {
      // For canvas with content, ensure content fits with padding
      const contentWidth = metrics.contentBounds.width + (this.padding * 2);
      const contentHeight = metrics.contentBounds.height + (this.padding * 2);
      
      // Use larger of content size or container size, but respect limits
      canvasWidth = Math.min(
        Math.max(contentWidth, containerRect.width - 40, this.minCanvasSize.width),
        this.maxCanvasSize.width
      );
      
      canvasHeight = Math.min(
        Math.max(contentHeight, containerRect.height - 40, this.minCanvasSize.height),
        this.maxCanvasSize.height
      );
    }

    // Only update if size changed significantly
    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();
    
    if (Math.abs(currentWidth - canvasWidth) > 10 || Math.abs(currentHeight - canvasHeight) > 10) {
      this.canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight
      });
      
      // Update the canvas element size
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
      }

      this.canvas.renderAll();
      console.log(`Canvas resized to ${canvasWidth}x${canvasHeight}`);
    }
  }

  public getCanvasMetrics(): CanvasMetrics {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    if (objects.length === 0) {
      return {
        contentBounds: { left: 0, top: 0, width: 0, height: 0 },
        objectCount: 0,
        isEmpty: true,
        recommendedSize: this.minCanvasSize
      };
    }

    // Calculate bounding box of all content
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    const contentBounds = {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    const recommendedSize = {
      width: Math.max(contentBounds.width + this.padding * 2, this.minCanvasSize.width),
      height: Math.max(contentBounds.height + this.padding * 2, this.minCanvasSize.height)
    };

    return {
      contentBounds,
      objectCount: objects.length,
      isEmpty: false,
      recommendedSize
    };
  }

  public fitContentToView(animate: boolean = true): void {
    const metrics = this.getCanvasMetrics();
    
    if (metrics.isEmpty) {
      this.resetView(animate);
      return;
    }

    const containerWidth = this.containerElement?.clientWidth || 800;
    const containerHeight = this.containerElement?.clientHeight || 600;
    
    // Calculate zoom to fit content with padding
    const contentWithPadding = {
      width: metrics.contentBounds.width + this.padding,
      height: metrics.contentBounds.height + this.padding
    };
    
    const zoomX = containerWidth / contentWithPadding.width;
    const zoomY = containerHeight / contentWithPadding.height;
    const zoom = Math.min(zoomX, zoomY, 2); // Max zoom of 2x

    // Calculate pan to center content
    const contentCenterX = metrics.contentBounds.left + metrics.contentBounds.width / 2;
    const contentCenterY = metrics.contentBounds.top + metrics.contentBounds.height / 2;
    
    const panX = containerWidth / 2 - contentCenterX * zoom;
    const panY = containerHeight / 2 - contentCenterY * zoom;

    if (animate) {
      this.animateToView(zoom, panX, panY);
    } else {
      this.canvas.setZoom(zoom);
      this.canvas.viewportTransform![4] = panX;
      this.canvas.viewportTransform![5] = panY;
      this.canvas.renderAll();
    }
  }

  public resetView(animate: boolean = true): void {
    const zoom = 1;
    const panX = 0;
    const panY = 0;

    if (animate) {
      this.animateToView(zoom, panX, panY);
    } else {
      this.canvas.setZoom(zoom);
      this.canvas.viewportTransform![4] = panX;
      this.canvas.viewportTransform![5] = panY;
      this.canvas.renderAll();
    }
  }

  public panToObject(object: fabric.Object, animate: boolean = true): void {
    const bounds = object.getBoundingRect();
    const zoom = this.canvas.getZoom();
    const containerWidth = this.containerElement?.clientWidth || 800;
    const containerHeight = this.containerElement?.clientHeight || 600;

    // Calculate center of object
    const objectCenterX = bounds.left + bounds.width / 2;
    const objectCenterY = bounds.top + bounds.height / 2;

    // Calculate pan to center the object
    const panX = containerWidth / 2 - objectCenterX * zoom;
    const panY = containerHeight / 2 - objectCenterY * zoom;

    if (animate) {
      this.animateToView(zoom, panX, panY);
    } else {
      this.canvas.viewportTransform![4] = panX;
      this.canvas.viewportTransform![5] = panY;
      this.canvas.renderAll();
    }
  }

  private animateToView(targetZoom: number, targetPanX: number, targetPanY: number): void {
    const currentZoom = this.canvas.getZoom();
    const currentPanX = this.canvas.viewportTransform![4];
    const currentPanY = this.canvas.viewportTransform![5];

    const duration = 300; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      const zoom = currentZoom + (targetZoom - currentZoom) * eased;
      const panX = currentPanX + (targetPanX - currentPanX) * eased;
      const panY = currentPanY + (targetPanY - currentPanY) * eased;

      this.canvas.setZoom(zoom);
      this.canvas.viewportTransform![4] = panX;
      this.canvas.viewportTransform![5] = panY;
      this.canvas.renderAll();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  public getViewportBounds(): ViewportBounds {
    const zoom = this.canvas.getZoom();
    const vpt = this.canvas.viewportTransform;
    
    if (!vpt) {
      return {
        left: 0,
        top: 0,
        width: this.canvas.getWidth(),
        height: this.canvas.getHeight()
      };
    }

    const containerWidth = this.containerElement?.clientWidth || this.canvas.getWidth();
    const containerHeight = this.containerElement?.clientHeight || this.canvas.getHeight();

    return {
      left: -vpt[4] / zoom,
      top: -vpt[5] / zoom,
      width: containerWidth / zoom,
      height: containerHeight / zoom
    };
  }

  public isObjectVisible(object: fabric.Object): boolean {
    const objectBounds = object.getBoundingRect();
    const viewport = this.getViewportBounds();

    return !(
      objectBounds.left + objectBounds.width < viewport.left ||
      objectBounds.left > viewport.left + viewport.width ||
      objectBounds.top + objectBounds.height < viewport.top ||
      objectBounds.top > viewport.top + viewport.height
    );
  }

  public ensureObjectVisible(object: fabric.Object): void {
    if (!this.isObjectVisible(object)) {
      this.panToObject(object, true);
    }
  }

  public setCanvasSizeLimits(min: { width: number; height: number }, max: { width: number; height: number }): void {
    this.minCanvasSize = min;
    this.maxCanvasSize = max;
  }

  public setPadding(padding: number): void {
    this.padding = padding;
  }

  public cleanup(): void {
    if (this.resizeObserver && this.containerElement) {
      this.resizeObserver.unobserve(this.containerElement);
    }
    this.resizeObserver = null;
    this.containerElement = null;
  }
}

// Singleton instance
let viewportManagerInstance: ViewportManager | null = null;

export const getViewportManager = (canvas?: fabric.Canvas): ViewportManager | null => {
  if (canvas && !viewportManagerInstance) {
    viewportManagerInstance = new ViewportManager(canvas);
  }
  return viewportManagerInstance;
};

export const cleanupViewportManager = (): void => {
  if (viewportManagerInstance) {
    viewportManagerInstance.cleanup();
    viewportManagerInstance = null;
  }
};
