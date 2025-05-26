import * as fabric from 'fabric';
import { AUDIT_COLORS } from '../core/fabric-utils';

export interface ConnectorOptions {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  hasArrow?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}

export class SimpleConnector {
  public line: fabric.Line;
  public arrowhead?: fabric.Triangle;
  public startObject: fabric.Object;
  public endObject: fabric.Object;
  public canvas: fabric.Canvas;
  public id: string;
  public options: ConnectorOptions;

  constructor(
    canvas: fabric.Canvas,
    startObj: fabric.Object,
    endObj: fabric.Object,
    options: ConnectorOptions = {}
  ) {
    this.canvas = canvas;
    this.startObject = startObj;
    this.endObject = endObj;
    this.id = `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.options = {
      strokeColor: '#000000', // Default to black
      strokeWidth: 2,
      strokeDashArray: [],
      hasArrow: true,
      lineStyle: 'solid',
      ...options
    };

    this.line = new fabric.Line([0, 0, 0, 0], {
      stroke: this.options.strokeColor,
      strokeWidth: this.options.strokeWidth,
      strokeDashArray: this.getStrokeDashArray(),
      selectable: true,
      evented: true,
      hasControls: false,
      hasBorders: true,
      borderColor: AUDIT_COLORS.secondary,
      cornerColor: AUDIT_COLORS.surface,
      cornerStrokeColor: AUDIT_COLORS.secondary,
      cornerSize: 8,
    });

    this.createConnector();
    this.attachEventListeners();
  }

  private getStrokeDashArray(): number[] {
    switch (this.options.lineStyle) {
      case 'dashed':
        return [10, 5];
      case 'dotted':
        return [2, 3];
      case 'solid':
      default:
        return [];
    }
  }

  private createConnector(): void {
    const startPos = this.getConnectionPoint(this.startObject, this.endObject, true);
    const endPos = this.getConnectionPoint(this.startObject, this.endObject, false);

    this.line.set({
      x1: startPos.x,
      y1: startPos.y,
      x2: endPos.x,
      y2: endPos.y
    });

    // Mark as connector
    (this.line as any).isConnector = true;
    (this.line as any).isSmartConnector = true;
    (this.line as any).connectorInstance = this;
    (this.line as any).startObject = this.startObject;
    (this.line as any).endObject = this.endObject;

    if (this.options.hasArrow) {
      this.createArrowhead(endPos);
    }

    this.canvas.add(this.line);
    if (this.arrowhead) {
      this.canvas.add(this.arrowhead);
    }
  }

  private createArrowhead(endPos: { x: number, y: number }): void {
    const x1 = this.line.x1 || 0;
    const y1 = this.line.y1 || 0;
    const x2 = this.line.x2 || 0;
    const y2 = this.line.y2 || 0;

    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Position arrow slightly before the border to avoid overlap
    const arrowOffset = 8; // Distance from border
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;

    this.arrowhead = new fabric.Triangle({
      left: endPos.x - unitX * arrowOffset,
      top: endPos.y - unitY * arrowOffset,
      width: 16,
      height: 16,
      fill: this.options.strokeColor,
      stroke: this.options.strokeColor,
      angle: (angle * 180) / Math.PI + 90,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
    });

    (this.arrowhead as any).isConnectorArrow = true;
    (this.arrowhead as any).parentConnector = this;
  }

  private getObjectCenter(obj: fabric.Object): { x: number, y: number } {
    const bounds = obj.getBoundingRect();
    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };
  }

  private getConnectionPoint(startObj: fabric.Object, endObj: fabric.Object, isStart: boolean): { x: number, y: number } {
    const startBounds = startObj.getBoundingRect();
    const endBounds = endObj.getBoundingRect();

    const startCenter = {
      x: startBounds.left + startBounds.width / 2,
      y: startBounds.top + startBounds.height / 2
    };

    const endCenter = {
      x: endBounds.left + endBounds.width / 2,
      y: endBounds.top + endBounds.height / 2
    };

    if (isStart) {
      // Calculate connection point on the border of start object
      const dx = endCenter.x - startCenter.x;
      const dy = endCenter.y - startCenter.y;

      // Calculate intersection with rectangle border
      const halfWidth = startBounds.width / 2;
      const halfHeight = startBounds.height / 2;

      if (Math.abs(dx) / halfWidth > Math.abs(dy) / halfHeight) {
        // Connect to left or right edge
        const x = startCenter.x + (dx > 0 ? halfWidth : -halfWidth);
        const y = startCenter.y + (dy * halfWidth) / Math.abs(dx);
        return { x, y };
      } else {
        // Connect to top or bottom edge
        const x = startCenter.x + (dx * halfHeight) / Math.abs(dy);
        const y = startCenter.y + (dy > 0 ? halfHeight : -halfHeight);
        return { x, y };
      }
    } else {
      // Calculate connection point on the border of end object
      const dx = startCenter.x - endCenter.x;
      const dy = startCenter.y - endCenter.y;

      // Calculate intersection with rectangle border
      const halfWidth = endBounds.width / 2;
      const halfHeight = endBounds.height / 2;

      if (Math.abs(dx) / halfWidth > Math.abs(dy) / halfHeight) {
        // Connect to left or right edge
        const x = endCenter.x + (dx > 0 ? halfWidth : -halfWidth);
        const y = endCenter.y + (dy * halfWidth) / Math.abs(dx);
        return { x, y };
      } else {
        // Connect to top or bottom edge
        const x = endCenter.x + (dx * halfHeight) / Math.abs(dy);
        const y = endCenter.y + (dy > 0 ? halfHeight : -halfHeight);
        return { x, y };
      }
    }
  }

  public updatePosition(): void {
    const startPos = this.getConnectionPoint(this.startObject, this.endObject, true);
    const endPos = this.getConnectionPoint(this.startObject, this.endObject, false);

    this.line.set({
      x1: startPos.x,
      y1: startPos.y,
      x2: endPos.x,
      y2: endPos.y
    });

    if (this.arrowhead) {
      const x1 = this.line.x1 || 0;
      const y1 = this.line.y1 || 0;
      const x2 = this.line.x2 || 0;
      const y2 = this.line.y2 || 0;

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowOffset = 8;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;

      this.arrowhead.set({
        left: endPos.x - unitX * arrowOffset,
        top: endPos.y - unitY * arrowOffset,
        angle: (angle * 180) / Math.PI + 90,
      });
    }

    this.canvas.renderAll();
  }

  private attachEventListeners(): void {
    const updateOnObjectMove = (e: any) => {
      // Check if the moved object is one of our connected objects
      const target = e.target;
      const isConnectedObject = target === this.startObject || target === this.endObject ||
                               (target as any).parentShape === this.startObject ||
                               (target as any).parentShape === this.endObject;

      if (isConnectedObject) {
        this.updatePosition();
      }
    };

    // Listen to multiple events to ensure connectors stay updated
    this.canvas.on('object:moving', updateOnObjectMove);
    this.canvas.on('object:scaling', updateOnObjectMove);
    this.canvas.on('object:rotating', updateOnObjectMove);
    this.canvas.on('object:modified', updateOnObjectMove);

    // Store cleanup function
    (this.line as any).cleanup = () => {
      this.canvas.off('object:moving', updateOnObjectMove);
      this.canvas.off('object:scaling', updateOnObjectMove);
      this.canvas.off('object:rotating', updateOnObjectMove);
      this.canvas.off('object:modified', updateOnObjectMove);
    };
  }

  public remove(): void {
    // Cleanup event listeners
    if ((this.line as any).cleanup) {
      (this.line as any).cleanup();
    }

    // Remove from canvas
    this.canvas.remove(this.line);
    if (this.arrowhead) {
      this.canvas.remove(this.arrowhead);
    }

    this.canvas.renderAll();
  }

  public updateStyle(newOptions: Partial<ConnectorOptions>): void {
    this.options = { ...this.options, ...newOptions };

    if (newOptions.strokeColor) {
      this.line.set('stroke', newOptions.strokeColor);
      if (this.arrowhead) {
        this.arrowhead.set({
          fill: newOptions.strokeColor,
          stroke: newOptions.strokeColor
        });
      }
    }

    if (newOptions.strokeWidth) {
      this.line.set('strokeWidth', newOptions.strokeWidth);
    }

    if (newOptions.strokeDashArray !== undefined) {
      this.line.set('strokeDashArray', newOptions.strokeDashArray);
    }

    if (newOptions.lineStyle) {
      this.line.set('strokeDashArray', this.getStrokeDashArray());
    }

    if (newOptions.hasArrow !== undefined) {
      if (newOptions.hasArrow && !this.arrowhead) {
        // Create arrowhead if it doesn't exist
        const endPos = this.getConnectionPoint(this.startObject, this.endObject, false);
        this.createArrowhead(endPos);
        if (this.arrowhead) {
          this.canvas.add(this.arrowhead);
        }
      } else if (!newOptions.hasArrow && this.arrowhead) {
        // Remove arrowhead if it exists
        this.canvas.remove(this.arrowhead);
        this.arrowhead = undefined;
      }
    }

    this.canvas.renderAll();
  }

  public getProperties(): ConnectorOptions {
    return { ...this.options };
  }
}

export const getAllConnectors = (canvas: fabric.Canvas): SimpleConnector[] => {
  const objects = canvas.getObjects();
  const connectors: SimpleConnector[] = [];

  objects.forEach((obj: fabric.Object) => {
    const extendedObj = obj as any;
    if (extendedObj.isConnector && extendedObj.connectorInstance) {
      connectors.push(extendedObj.connectorInstance);
    }
  });

  return connectors;
};

export const removeConnectorsForObject = (canvas: fabric.Canvas, targetObject: fabric.Object) => {
  const connectors = getAllConnectors(canvas);

  connectors.forEach(connector => {
    if (connector.startObject === targetObject || connector.endObject === targetObject) {
      connector.remove();
    }
  });
};