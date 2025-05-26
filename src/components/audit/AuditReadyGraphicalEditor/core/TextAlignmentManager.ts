import * as fabric from 'fabric';

export interface TextAlignmentGuide {
  type: 'text-center-horizontal' | 'text-center-vertical' | 'text-top' | 'text-bottom' | 'text-left' | 'text-right';
  position: number;
  targetObject: fabric.Object;
  textObject: fabric.Object;
  strength: number; // 0-1, how strong the alignment suggestion is
}

export class TextAlignmentManager {
  private canvas: fabric.Canvas;
  private textGuides: fabric.Line[] = [];
  private snapDistance: number = 25; // More generous for text
  private isEnabled: boolean = true;
  private currentTextObject: fabric.Object | null = null;
  private nearbyShapes: fabric.Object[] = [];

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:moving', this.handleTextMoving.bind(this));
    this.canvas.on('object:modified', this.handleTextModified.bind(this));
    this.canvas.on('selection:cleared', this.clearTextGuides.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
  }

  private handleMouseDown(e: any): void {
    const target = e.target;
    if (this.isTextObject(target)) {
      this.currentTextObject = target;
      this.findNearbyShapes(target);
    } else {
      this.currentTextObject = null;
      this.nearbyShapes = [];
    }
  }

  private handleTextMoving(e: any): void {
    const target = e.target;
    if (!this.isEnabled || !this.isTextObject(target)) return;

    this.clearTextGuides();
    this.currentTextObject = target;
    this.findNearbyShapes(target);

    const guides = this.calculateTextAlignmentGuides(target);
    const snappedPosition = this.calculateTextSnapping(target, guides);

    if (snappedPosition) {
      target.set(snappedPosition);
      this.showTextGuides(guides);
    }
  }

  private handleTextModified(e: any): void {
    const target = e.target;
    if (!this.isTextObject(target)) {
      this.clearTextGuides();
      return;
    }

    // Apply final gentle snap for text
    this.performFinalTextSnap(target);
    this.clearTextGuides();
  }

  private isTextObject(obj: fabric.Object): boolean {
    return obj && (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox');
  }

  private isShapeObject(obj: fabric.Object): boolean {
    return obj && !this.isTextObject(obj) &&
           !obj.isConnectionPoint &&
           !obj.isConnector &&
           (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'ellipse' ||
            obj.type === 'polygon' || obj.type === 'path' || obj.type === 'group');
  }

  private findNearbyShapes(textObj: fabric.Object): void {
    const textBounds = textObj.getBoundingRect();
    const searchRadius = 100; // Look for shapes within 100px

    this.nearbyShapes = this.canvas.getObjects().filter(obj => {
      if (!this.isShapeObject(obj) || obj === textObj) return false;

      const shapeBounds = obj.getBoundingRect();
      const distance = Math.sqrt(
        Math.pow(textBounds.left + textBounds.width/2 - (shapeBounds.left + shapeBounds.width/2), 2) +
        Math.pow(textBounds.top + textBounds.height/2 - (shapeBounds.top + shapeBounds.height/2), 2)
      );

      return distance <= searchRadius;
    });
  }

  private calculateTextAlignmentGuides(textObj: fabric.Object): TextAlignmentGuide[] {
    const guides: TextAlignmentGuide[] = [];
    const textBounds = textObj.getBoundingRect();
    const textCenter = {
      x: textBounds.left + textBounds.width / 2,
      y: textBounds.top + textBounds.height / 2
    };

    this.nearbyShapes.forEach(shape => {
      const shapeBounds = shape.getBoundingRect();
      const shapeCenter = {
        x: shapeBounds.left + shapeBounds.width / 2,
        y: shapeBounds.top + shapeBounds.height / 2
      };

      // Calculate alignment strength based on overlap and proximity
      const overlapX = Math.max(0, Math.min(textBounds.left + textBounds.width, shapeBounds.left + shapeBounds.width) -
                                   Math.max(textBounds.left, shapeBounds.left));
      const overlapY = Math.max(0, Math.min(textBounds.top + textBounds.height, shapeBounds.top + shapeBounds.height) -
                                   Math.max(textBounds.top, shapeBounds.top));

      const isInside = overlapX > textBounds.width * 0.5 && overlapY > textBounds.height * 0.5;
      const isNearby = !isInside && (overlapX > 0 || overlapY > 0);

      if (isInside || isNearby) {
        const baseStrength = isInside ? 0.8 : 0.4;

        // Horizontal center alignment
        const hCenterDistance = Math.abs(textCenter.x - shapeCenter.x);
        if (hCenterDistance <= this.snapDistance) {
          guides.push({
            type: 'text-center-horizontal',
            position: shapeCenter.x,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * (1 - hCenterDistance / this.snapDistance)
          });
        }

        // Vertical center alignment
        const vCenterDistance = Math.abs(textCenter.y - shapeCenter.y);
        if (vCenterDistance <= this.snapDistance) {
          guides.push({
            type: 'text-center-vertical',
            position: shapeCenter.y,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * (1 - vCenterDistance / this.snapDistance)
          });
        }

        // Left alignment (text left edge to shape left edge)
        const leftDistance = Math.abs(textBounds.left - shapeBounds.left);
        if (leftDistance <= this.snapDistance) {
          guides.push({
            type: 'text-left',
            position: shapeBounds.left,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * 0.6 * (1 - leftDistance / this.snapDistance)
          });
        }

        // Right alignment (text right edge to shape right edge)
        const rightDistance = Math.abs((textBounds.left + textBounds.width) - (shapeBounds.left + shapeBounds.width));
        if (rightDistance <= this.snapDistance) {
          guides.push({
            type: 'text-right',
            position: shapeBounds.left + shapeBounds.width - textBounds.width,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * 0.6 * (1 - rightDistance / this.snapDistance)
          });
        }

        // Top alignment
        const topDistance = Math.abs(textBounds.top - shapeBounds.top);
        if (topDistance <= this.snapDistance) {
          guides.push({
            type: 'text-top',
            position: shapeBounds.top,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * 0.6 * (1 - topDistance / this.snapDistance)
          });
        }

        // Bottom alignment
        const bottomDistance = Math.abs((textBounds.top + textBounds.height) - (shapeBounds.top + shapeBounds.height));
        if (bottomDistance <= this.snapDistance) {
          guides.push({
            type: 'text-bottom',
            position: shapeBounds.top + shapeBounds.height - textBounds.height,
            targetObject: shape,
            textObject: textObj,
            strength: baseStrength * 0.6 * (1 - bottomDistance / this.snapDistance)
          });
        }
      }
    });

    // Sort by strength (strongest first)
    return guides.sort((a, b) => b.strength - a.strength);
  }

  private calculateTextSnapping(textObj: fabric.Object, guides: TextAlignmentGuide[]): Partial<fabric.Object> | null {
    if (guides.length === 0) return null;

    const textBounds = textObj.getBoundingRect();
    let newPosition: Partial<fabric.Object> = {};
    let hasSnap = false;

    // Apply the strongest horizontal and vertical guides
    const horizontalGuides = guides.filter(g =>
      g.type === 'text-center-horizontal' || g.type === 'text-left' || g.type === 'text-right'
    );
    const verticalGuides = guides.filter(g =>
      g.type === 'text-center-vertical' || g.type === 'text-top' || g.type === 'text-bottom'
    );

    // Apply strongest horizontal guide
    if (horizontalGuides.length > 0) {
      const guide = horizontalGuides[0];
      if (guide.strength > 0.6) { // Only apply if strong enough (less aggressive)
        switch (guide.type) {
          case 'text-center-horizontal':
            newPosition.left = guide.position - textBounds.width / 2;
            break;
          case 'text-left':
            newPosition.left = guide.position;
            break;
          case 'text-right':
            newPosition.left = guide.position;
            break;
        }
        hasSnap = true;
      }
    }

    // Apply strongest vertical guide
    if (verticalGuides.length > 0) {
      const guide = verticalGuides[0];
      if (guide.strength > 0.6) { // Only apply if strong enough (less aggressive)
        switch (guide.type) {
          case 'text-center-vertical':
            newPosition.top = guide.position - textBounds.height / 2;
            break;
          case 'text-top':
            newPosition.top = guide.position;
            break;
          case 'text-bottom':
            newPosition.top = guide.position;
            break;
        }
        hasSnap = true;
      }
    }

    return hasSnap ? newPosition : null;
  }

  private performFinalTextSnap(textObj: fabric.Object): void {
    if (!this.isEnabled) return;

    this.findNearbyShapes(textObj);
    const guides = this.calculateTextAlignmentGuides(textObj);
    const snappedPosition = this.calculateTextSnapping(textObj, guides);

    if (snappedPosition) {
      textObj.set(snappedPosition);
      textObj.setCoords();
      this.canvas.renderAll();
      console.log('Final text snap applied');
    }
  }

  private showTextGuides(guides: TextAlignmentGuide[]): void {
    this.clearTextGuides();

    guides.forEach(guide => {
      if (guide.strength < 0.5) return; // Don't show weak guides

      const shapeBounds = guide.targetObject.getBoundingRect();
      let line: fabric.Line;

      // Create guide line based on type
      switch (guide.type) {
        case 'text-center-horizontal':
          line = new fabric.Line([
            guide.position, shapeBounds.top - 10,
            guide.position, shapeBounds.top + shapeBounds.height + 10
          ], {
            stroke: '#4ade80', // Green for center alignment
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            opacity: guide.strength
          });
          break;

        case 'text-center-vertical':
          line = new fabric.Line([
            shapeBounds.left - 10, guide.position,
            shapeBounds.left + shapeBounds.width + 10, guide.position
          ], {
            stroke: '#4ade80', // Green for center alignment
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            opacity: guide.strength
          });
          break;

        case 'text-left':
        case 'text-right':
          line = new fabric.Line([
            guide.position, shapeBounds.top - 5,
            guide.position, shapeBounds.top + shapeBounds.height + 5
          ], {
            stroke: '#60a5fa', // Blue for edge alignment
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
            opacity: guide.strength * 0.8
          });
          break;

        case 'text-top':
        case 'text-bottom':
          line = new fabric.Line([
            shapeBounds.left - 5, guide.position,
            shapeBounds.left + shapeBounds.width + 5, guide.position
          ], {
            stroke: '#60a5fa', // Blue for edge alignment
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
            opacity: guide.strength * 0.8
          });
          break;

        default:
          return;
      }

      this.textGuides.push(line);
      this.canvas.add(line);
    });

    this.canvas.renderAll();
  }

  private clearTextGuides(): void {
    this.textGuides.forEach(guide => {
      this.canvas.remove(guide);
    });
    this.textGuides = [];
  }

  // Public methods
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearTextGuides();
    }
    console.log(`Text alignment ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isTextAlignmentEnabled(): boolean {
    return this.isEnabled;
  }

  public setSnapDistance(distance: number): void {
    this.snapDistance = Math.max(5, Math.min(30, distance));
  }

  public getSnapDistance(): number {
    return this.snapDistance;
  }

  // Helper method to manually align text to shape center
  public alignTextToShapeCenter(textObj: fabric.Object, shapeObj: fabric.Object): void {
    if (!this.isTextObject(textObj) || !this.isShapeObject(shapeObj)) return;

    const textBounds = textObj.getBoundingRect();
    const shapeBounds = shapeObj.getBoundingRect();

    const centerX = shapeBounds.left + shapeBounds.width / 2;
    const centerY = shapeBounds.top + shapeBounds.height / 2;

    textObj.set({
      left: centerX - textBounds.width / 2,
      top: centerY - textBounds.height / 2
    });

    textObj.setCoords();
    this.canvas.renderAll();
  }

  // Helper method to align text to shape edges
  public alignTextToShape(textObj: fabric.Object, shapeObj: fabric.Object, alignment: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'): void {
    if (!this.isTextObject(textObj) || !this.isShapeObject(shapeObj)) return;

    const textBounds = textObj.getBoundingRect();
    const shapeBounds = shapeObj.getBoundingRect();
    const padding = 8; // Small padding from edges

    let newLeft = textObj.left || 0;
    let newTop = textObj.top || 0;

    switch (alignment) {
      case 'center':
        newLeft = shapeBounds.left + shapeBounds.width / 2 - textBounds.width / 2;
        newTop = shapeBounds.top + shapeBounds.height / 2 - textBounds.height / 2;
        break;
      case 'top-left':
        newLeft = shapeBounds.left + padding;
        newTop = shapeBounds.top + padding;
        break;
      case 'top-center':
        newLeft = shapeBounds.left + shapeBounds.width / 2 - textBounds.width / 2;
        newTop = shapeBounds.top + padding;
        break;
      case 'top-right':
        newLeft = shapeBounds.left + shapeBounds.width - textBounds.width - padding;
        newTop = shapeBounds.top + padding;
        break;
      case 'bottom-left':
        newLeft = shapeBounds.left + padding;
        newTop = shapeBounds.top + shapeBounds.height - textBounds.height - padding;
        break;
      case 'bottom-center':
        newLeft = shapeBounds.left + shapeBounds.width / 2 - textBounds.width / 2;
        newTop = shapeBounds.top + shapeBounds.height - textBounds.height - padding;
        break;
      case 'bottom-right':
        newLeft = shapeBounds.left + shapeBounds.width - textBounds.width - padding;
        newTop = shapeBounds.top + shapeBounds.height - textBounds.height - padding;
        break;
    }

    textObj.set({ left: newLeft, top: newTop });
    textObj.setCoords();
    this.canvas.renderAll();
  }

  public cleanup(): void {
    this.clearTextGuides();
    this.canvas.off('object:moving', this.handleTextMoving);
    this.canvas.off('object:modified', this.handleTextModified);
    this.canvas.off('selection:cleared', this.clearTextGuides);
    this.canvas.off('mouse:down', this.handleMouseDown);

    this.currentTextObject = null;
    this.nearbyShapes = [];
  }
}

// Singleton instance
let textAlignmentManagerInstance: TextAlignmentManager | null = null;

export const getTextAlignmentManager = (canvas?: fabric.Canvas): TextAlignmentManager | null => {
  if (canvas && !textAlignmentManagerInstance) {
    textAlignmentManagerInstance = new TextAlignmentManager(canvas);
  }
  return textAlignmentManagerInstance;
};

export const cleanupTextAlignmentManager = (): void => {
  if (textAlignmentManagerInstance) {
    textAlignmentManagerInstance.cleanup();
    textAlignmentManagerInstance = null;
  }
};
