import * as fabric from 'fabric';
import { AUDIT_COLORS } from './fabric-utils';

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  objects: fabric.Object[];
}

export class AlignmentManager {
  private canvas: fabric.Canvas;
  private guidelines: fabric.Line[] = [];
  private snapDistance: number = 8;
  private isEnabled: boolean = true;
  private snapThreshold: number = 15; // Minimum movement before snapping kicks in
  private lastPosition: { x: number; y: number } | null = null;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.on('object:modified', this.handleObjectModified.bind(this));
    this.canvas.on('selection:cleared', this.clearGuidelines.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
  }

  private handleMouseDown(e: any): void {
    const target = e.target;
    if (target && !target.isConnectionPoint && !target.isConnector) {
      this.lastPosition = {
        x: target.left || 0,
        y: target.top || 0
      };
    }
  }

  private handleMouseUp(): void {
    this.lastPosition = null;
    // Don't clear guidelines immediately - let object:modified handle it
  }

  private handleObjectModified(e: any): void {
    // Apply final snapping when object modification is complete
    const target = e.target;
    if (!target || !this.isEnabled) {
      this.clearGuidelines();
      return;
    }

    // Perform final snap alignment
    this.performFinalSnap(target);
    this.clearGuidelines();
  }

  private handleObjectMoving(e: any): void {
    if (!this.isEnabled) return;

    const movingObject = e.target;
    if (!movingObject) return;

    // Check if we've moved enough to trigger snapping
    if (this.lastPosition) {
      const currentX = movingObject.left || 0;
      const currentY = movingObject.top || 0;
      const deltaX = Math.abs(currentX - this.lastPosition.x);
      const deltaY = Math.abs(currentY - this.lastPosition.y);

      // Only snap if we've moved beyond the threshold
      if (deltaX < this.snapThreshold && deltaY < this.snapThreshold) {
        return;
      }
    }

    this.clearGuidelines();

    const guides = this.calculateAlignmentGuides(movingObject);
    const snappedPosition = this.calculateSnapping(movingObject, guides);

    if (snappedPosition) {
      movingObject.set(snappedPosition);
      this.showGuidelines(guides);
    }
  }

  private performFinalSnap(object: fabric.Object): void {
    if (!this.isEnabled || object.isConnectionPoint || object.isConnector) return;

    const guides = this.calculateAlignmentGuides(object);
    const snappedPosition = this.calculateSnapping(object, guides);

    if (snappedPosition) {
      // Apply the final snap position
      object.set(snappedPosition);
      object.setCoords(); // Update object coordinates
      this.canvas.renderAll();

      console.log('Final snap applied:', snappedPosition);
    }
  }

  private calculateAlignmentGuides(movingObject: fabric.Object): AlignmentGuide[] {
    const guides: AlignmentGuide[] = [];
    const objects = this.canvas.getObjects().filter(obj =>
      obj !== movingObject &&
      obj.type !== 'line' &&
      !(obj as any).isConnectionPoint &&
      !(obj as any).isConnector
    );

    const movingBounds = movingObject.getBoundingRect();
    const movingCenter = {
      x: movingBounds.left + movingBounds.width / 2,
      y: movingBounds.top + movingBounds.height / 2
    };

    // Canvas center guides
    const canvasCenter = {
      x: this.canvas.width! / 2,
      y: this.canvas.height! / 2
    };

    // Check canvas center alignment
    if (Math.abs(movingCenter.x - canvasCenter.x) < this.snapDistance) {
      guides.push({
        type: 'vertical',
        position: canvasCenter.x,
        objects: []
      });
    }

    if (Math.abs(movingCenter.y - canvasCenter.y) < this.snapDistance) {
      guides.push({
        type: 'horizontal',
        position: canvasCenter.y,
        objects: []
      });
    }

    // Check alignment with other objects
    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      const center = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
      };

      // Vertical alignment (same X)
      if (Math.abs(movingCenter.x - center.x) < this.snapDistance) {
        guides.push({
          type: 'vertical',
          position: center.x,
          objects: [obj]
        });
      }

      // Horizontal alignment (same Y)
      if (Math.abs(movingCenter.y - center.y) < this.snapDistance) {
        guides.push({
          type: 'horizontal',
          position: center.y,
          objects: [obj]
        });
      }

      // Edge alignment
      // Left edges
      if (Math.abs(movingBounds.left - bounds.left) < this.snapDistance) {
        guides.push({
          type: 'vertical',
          position: bounds.left,
          objects: [obj]
        });
      }

      // Right edges
      if (Math.abs(movingBounds.left + movingBounds.width - bounds.left - bounds.width) < this.snapDistance) {
        guides.push({
          type: 'vertical',
          position: bounds.left + bounds.width,
          objects: [obj]
        });
      }

      // Top edges
      if (Math.abs(movingBounds.top - bounds.top) < this.snapDistance) {
        guides.push({
          type: 'horizontal',
          position: bounds.top,
          objects: [obj]
        });
      }

      // Bottom edges
      if (Math.abs(movingBounds.top + movingBounds.height - bounds.top - bounds.height) < this.snapDistance) {
        guides.push({
          type: 'horizontal',
          position: bounds.top + bounds.height,
          objects: [obj]
        });
      }
    });

    return guides;
  }

  private calculateSnapping(movingObject: fabric.Object, guides: AlignmentGuide[]): Partial<fabric.Object> | null {
    if (guides.length === 0) return null;

    const bounds = movingObject.getBoundingRect();
    const center = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };

    let newPosition: Partial<fabric.Object> = {};
    let hasSnap = false;

    // Find the closest guide for each direction
    let closestVertical: AlignmentGuide | null = null;
    let closestHorizontal: AlignmentGuide | null = null;
    let minVerticalDistance = Infinity;
    let minHorizontalDistance = Infinity;

    guides.forEach(guide => {
      if (guide.type === 'vertical') {
        const distance = Math.abs(center.x - guide.position);
        if (distance < minVerticalDistance) {
          minVerticalDistance = distance;
          closestVertical = guide;
        }
      } else if (guide.type === 'horizontal') {
        const distance = Math.abs(center.y - guide.position);
        if (distance < minHorizontalDistance) {
          minHorizontalDistance = distance;
          closestHorizontal = guide;
        }
      }
    });

    // Apply snapping to the closest guides
    if (closestVertical && minVerticalDistance <= this.snapDistance) {
      // Calculate the new left position to center the object on the guide
      const objectCenterX = movingObject.left! + (movingObject.width! * (movingObject.scaleX || 1)) / 2;
      const deltaX = closestVertical.position - objectCenterX;
      newPosition.left = movingObject.left! + deltaX;
      hasSnap = true;
    }

    if (closestHorizontal && minHorizontalDistance <= this.snapDistance) {
      // Calculate the new top position to center the object on the guide
      const objectCenterY = movingObject.top! + (movingObject.height! * (movingObject.scaleY || 1)) / 2;
      const deltaY = closestHorizontal.position - objectCenterY;
      newPosition.top = movingObject.top! + deltaY;
      hasSnap = true;
    }

    return hasSnap ? newPosition : null;
  }

  private showGuidelines(guides: AlignmentGuide[]): void {
    this.clearGuidelines();

    guides.forEach(guide => {
      let line: fabric.Line;

      if (guide.type === 'vertical') {
        line = new fabric.Line([guide.position, 0, guide.position, this.canvas.height!], {
          stroke: AUDIT_COLORS.warning,
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
          opacity: 0.8
        });
      } else {
        line = new fabric.Line([0, guide.position, this.canvas.width!, guide.position], {
          stroke: AUDIT_COLORS.warning,
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
          opacity: 0.8
        });
      }

      this.guidelines.push(line);
      this.canvas.add(line);
    });

    this.canvas.renderAll();
  }

  private clearGuidelines(): void {
    this.guidelines.forEach(line => {
      this.canvas.remove(line);
    });
    this.guidelines = [];
  }

  // Public methods for alignment tools
  public alignLeft(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const leftmost = Math.min(...objects.map(obj => obj.getBoundingRect().left));

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      obj.set('left', leftmost);
    });

    this.canvas.renderAll();
  }

  public alignRight(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const rightmost = Math.max(...objects.map(obj => {
      const bounds = obj.getBoundingRect();
      return bounds.left + bounds.width;
    }));

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      obj.set('left', rightmost - bounds.width);
    });

    this.canvas.renderAll();
  }

  public alignTop(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const topmost = Math.min(...objects.map(obj => obj.getBoundingRect().top));

    objects.forEach(obj => {
      obj.set('top', topmost);
    });

    this.canvas.renderAll();
  }

  public alignBottom(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const bottommost = Math.max(...objects.map(obj => {
      const bounds = obj.getBoundingRect();
      return bounds.top + bounds.height;
    }));

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      obj.set('top', bottommost - bounds.height);
    });

    this.canvas.renderAll();
  }

  public alignCenterHorizontal(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const centerY = this.canvas.height! / 2;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      obj.set('top', centerY - bounds.height / 2);
    });

    this.canvas.renderAll();
  }

  public alignCenterVertical(objects: fabric.Object[]): void {
    if (objects.length < 2) return;

    const centerX = this.canvas.width! / 2;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      obj.set('left', centerX - bounds.width / 2);
    });

    this.canvas.renderAll();
  }

  public distributeHorizontally(objects: fabric.Object[]): void {
    if (objects.length < 3) return;

    const sorted = objects.sort((a, b) => a.getBoundingRect().left - b.getBoundingRect().left);
    const first = sorted[0].getBoundingRect();
    const last = sorted[sorted.length - 1].getBoundingRect();

    const totalWidth = (last.left + last.width) - first.left;
    const spacing = totalWidth / (sorted.length - 1);

    sorted.forEach((obj, index) => {
      if (index > 0 && index < sorted.length - 1) {
        obj.set('left', first.left + spacing * index);
      }
    });

    this.canvas.renderAll();
  }

  public distributeVertically(objects: fabric.Object[]): void {
    if (objects.length < 3) return;

    const sorted = objects.sort((a, b) => a.getBoundingRect().top - b.getBoundingRect().top);
    const first = sorted[0].getBoundingRect();
    const last = sorted[sorted.length - 1].getBoundingRect();

    const totalHeight = (last.top + last.height) - first.top;
    const spacing = totalHeight / (sorted.length - 1);

    sorted.forEach((obj, index) => {
      if (index > 0 && index < sorted.length - 1) {
        obj.set('top', first.top + spacing * index);
      }
    });

    this.canvas.renderAll();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearGuidelines();
    }
    console.log(`Snapping ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isSnapEnabled(): boolean {
    return this.isEnabled;
  }

  public setSnapDistance(distance: number): void {
    this.snapDistance = Math.max(1, Math.min(50, distance));
  }

  public setSnapThreshold(threshold: number): void {
    this.snapThreshold = Math.max(5, Math.min(30, threshold));
  }

  public cleanup(): void {
    this.clearGuidelines();
    this.canvas.off('object:moving', this.handleObjectMoving);
    this.canvas.off('object:modified', this.handleObjectModified);
    this.canvas.off('selection:cleared', this.clearGuidelines);
    this.canvas.off('mouse:down', this.handleMouseDown);
    this.canvas.off('mouse:up', this.handleMouseUp);
  }
}

// Singleton instance
let alignmentManagerInstance: AlignmentManager | null = null;

export const getAlignmentManager = (canvas?: fabric.Canvas): AlignmentManager | null => {
  if (canvas && !alignmentManagerInstance) {
    alignmentManagerInstance = new AlignmentManager(canvas);
  }
  return alignmentManagerInstance;
};

export const cleanupAlignmentManager = (): void => {
  if (alignmentManagerInstance) {
    alignmentManagerInstance.cleanup();
    alignmentManagerInstance = null;
  }
};
