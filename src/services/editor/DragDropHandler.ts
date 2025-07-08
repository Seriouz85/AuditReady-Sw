/**
 * Drag and Drop Handler Service
 * Manages visual drag-and-drop interactions for diagram elements
 */

export interface DragState {
  isDragging: boolean;
  element: SVGElement | null;
  elementId: string | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
  snapToGrid: boolean;
  gridSize: number;
}

export interface DropZone {
  id: string;
  element: HTMLElement;
  bounds: DOMRect;
  onDrop: (draggedElement: SVGElement, position: { x: number; y: number }) => void;
}

export class DragDropHandler {
  private static instance: DragDropHandler;
  private dragState: DragState = {
    isDragging: false,
    element: null,
    elementId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    snapToGrid: true,
    gridSize: 20
  };
  private dropZones: Map<string, DropZone> = new Map();
  private eventListeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private ghostElement: HTMLElement | null = null;

  private constructor() {
    this.setupGlobalEventListeners();
  }

  public static getInstance(): DragDropHandler {
    if (!DragDropHandler.instance) {
      DragDropHandler.instance = new DragDropHandler();
    }
    return DragDropHandler.instance;
  }

  /**
   * Make an SVG element draggable with Mermaid integration
   */
  public makeDraggable(element: SVGElement, options?: {
    elementId?: string;
    constrainToParent?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
  }): void {
    element.style.cursor = 'grab';
    element.setAttribute('data-draggable', 'true');

    // Store element ID for Mermaid integration
    if (options?.elementId) {
      element.setAttribute('data-element-id', options.elementId);
    }

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.startDrag(element, event, options);
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const touch = event.touches[0];
      this.startDrag(element, { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent, options);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart);

    // Store cleanup function
    (element as any).__dragCleanup = () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }

  /**
   * Set snap to grid options
   */
  public setSnapToGrid(enabled: boolean, gridSize: number = 20): void {
    this.dragState.snapToGrid = enabled;
    this.dragState.gridSize = gridSize;
  }

  /**
   * Remove draggable functionality from an element
   */
  public removeDraggable(element: SVGElement): void {
    element.style.cursor = '';
    element.removeAttribute('data-draggable');

    if ((element as any).__dragCleanup) {
      (element as any).__dragCleanup();
      delete (element as any).__dragCleanup;
    }
  }

  /**
   * Register a drop zone
   */
  public registerDropZone(dropZone: DropZone): void {
    this.dropZones.set(dropZone.id, dropZone);
  }

  /**
   * Unregister a drop zone
   */
  public unregisterDropZone(id: string): void {
    this.dropZones.delete(id);
  }

  /**
   * Start dragging an element with enhanced options
   */
  private startDrag(element: SVGElement, event: MouseEvent, options?: any): void {
    const rect = element.getBoundingClientRect();
    const elementId = element.getAttribute('data-element-id') || null;

    this.dragState = {
      isDragging: true,
      element,
      elementId,
      startPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: event.clientX, y: event.clientY },
      offset: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      },
      snapToGrid: options?.snapToGrid ?? this.dragState.snapToGrid,
      gridSize: options?.gridSize ?? this.dragState.gridSize
    };

    // Change cursor
    element.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing';

    // Create ghost element
    this.createGhostElement(element);

    // Add visual feedback
    element.style.opacity = '0.5';
    element.style.filter = 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))';

    // Emit drag start event
    this.emit('dragStart', {
      element,
      elementId,
      position: this.dragState.startPosition
    });

    console.log('🎯 Drag started for Mermaid element:', elementId || 'unknown');
  }

  /**
   * Handle drag movement with snap-to-grid
   */
  private handleDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.dragState.isDragging || !this.dragState.element) return;

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    // Calculate position relative to canvas
    let newX = clientX - this.dragState.offset.x;
    let newY = clientY - this.dragState.offset.y;

    // Apply snap to grid if enabled
    if (this.dragState.snapToGrid) {
      newX = Math.round(newX / this.dragState.gridSize) * this.dragState.gridSize;
      newY = Math.round(newY / this.dragState.gridSize) * this.dragState.gridSize;
    }

    this.dragState.currentPosition = { x: newX, y: newY };

    // Update ghost element position
    if (this.ghostElement) {
      this.ghostElement.style.left = `${newX}px`;
      this.ghostElement.style.top = `${newY}px`;

      // Add snap indicator
      if (this.dragState.snapToGrid) {
        this.ghostElement.style.border = '2px solid #22c55e';
        this.ghostElement.style.borderStyle = 'dashed';
      }
    }

    // Check for drop zone hover
    this.checkDropZoneHover(clientX, clientY);

    // Emit drag move event with snap information
    this.emit('dragMove', {
      element: this.dragState.element,
      elementId: this.dragState.elementId,
      position: this.dragState.currentPosition,
      snapped: this.dragState.snapToGrid
    });
  }

  /**
   * Handle drag end
   */
  private handleDragEnd(event: MouseEvent | TouchEvent): void {
    if (!this.dragState.isDragging || !this.dragState.element) return;

    const clientX = 'clientX' in event ? event.clientX : event.changedTouches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.changedTouches[0].clientY;

    // Check for valid drop
    const dropZone = this.findDropZone(clientX, clientY);

    if (dropZone) {
      // Valid drop
      const dropPosition = {
        x: clientX - dropZone.bounds.left,
        y: clientY - dropZone.bounds.top
      };

      dropZone.onDrop(this.dragState.element, dropPosition);
      this.emit('dragDrop', {
        element: this.dragState.element,
        elementId: this.dragState.elementId,
        dropZone,
        position: dropPosition,
        snapped: this.dragState.snapToGrid
      });

      console.log('✅ Mermaid element dropped:', this.dragState.elementId, 'in zone:', dropZone.id);
    } else {
      // Invalid drop - return to original position
      this.emit('dragCancel', { element: this.dragState.element });
      console.log('❌ Drag cancelled - no valid drop zone');
    }

    // Cleanup
    this.endDrag();
  }

  /**
   * End drag operation
   */
  private endDrag(): void {
    if (this.dragState.element) {
      // Restore element appearance
      this.dragState.element.style.cursor = 'grab';
      this.dragState.element.style.opacity = '1';
      this.dragState.element.style.filter = '';
    }

    // Restore cursor
    document.body.style.cursor = '';

    // Remove ghost element
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }

    // Clear drop zone highlights
    this.clearDropZoneHighlights();

    // Emit drag end event
    this.emit('dragEnd', { element: this.dragState.element });

    // Reset drag state
    this.dragState = {
      isDragging: false,
      element: null,
      elementId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      snapToGrid: this.dragState.snapToGrid,
      gridSize: this.dragState.gridSize
    };
  }

  /**
   * Create ghost element for visual feedback
   */
  private createGhostElement(element: SVGElement): void {
    const rect = element.getBoundingClientRect();

    this.ghostElement = document.createElement('div');
    this.ghostElement.style.position = 'fixed';
    this.ghostElement.style.left = `${rect.left}px`;
    this.ghostElement.style.top = `${rect.top}px`;
    this.ghostElement.style.width = `${rect.width}px`;
    this.ghostElement.style.height = `${rect.height}px`;
    this.ghostElement.style.background = 'rgba(59, 130, 246, 0.3)';
    this.ghostElement.style.border = '2px dashed #3b82f6';
    this.ghostElement.style.borderRadius = '8px';
    this.ghostElement.style.pointerEvents = 'none';
    this.ghostElement.style.zIndex = '9999';
    this.ghostElement.style.transition = 'none';

    document.body.appendChild(this.ghostElement);
  }

  /**
   * Check if cursor is over a drop zone
   */
  private checkDropZoneHover(x: number, y: number): void {
    const dropZone = this.findDropZone(x, y);

    // Clear previous highlights
    this.clearDropZoneHighlights();

    if (dropZone) {
      // Highlight drop zone
      dropZone.element.style.background = 'rgba(34, 197, 94, 0.1)';
      dropZone.element.style.border = '2px dashed #22c55e';
      dropZone.element.setAttribute('data-drop-hover', 'true');
    }
  }

  /**
   * Find drop zone at coordinates
   */
  private findDropZone(x: number, y: number): DropZone | null {
    for (const dropZone of this.dropZones.values()) {
      const bounds = dropZone.element.getBoundingClientRect();

      if (x >= bounds.left && x <= bounds.right &&
          y >= bounds.top && y <= bounds.bottom) {
        return dropZone;
      }
    }

    return null;
  }

  /**
   * Clear drop zone highlights
   */
  private clearDropZoneHighlights(): void {
    this.dropZones.forEach(dropZone => {
      dropZone.element.style.background = '';
      dropZone.element.style.border = '';
      dropZone.element.removeAttribute('data-drop-hover');
    });
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Mouse events
    document.addEventListener('mousemove', (e) => this.handleDragMove(e));
    document.addEventListener('mouseup', (e) => this.handleDragEnd(e));

    // Touch events
    document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleDragEnd(e));

    // Prevent default drag behavior
    document.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /**
   * Add event listener
   */
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Get current drag state
   */
  public getDragState(): DragState {
    return { ...this.dragState };
  }

  /**
   * Check if currently dragging
   */
  public isDragging(): boolean {
    return this.dragState.isDragging;
  }
}
