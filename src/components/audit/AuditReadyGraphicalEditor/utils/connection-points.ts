import * as fabric from 'fabric';
import { AUDIT_COLORS } from '../core/fabric-utils';
import { SimpleConnector } from './connector-utils';

// Connection point pool for performance optimization
class ConnectionPointPool {
  private pool: fabric.Circle[] = [];
  private maxPoolSize = 20;

  getPoint(): fabric.Circle {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    return new fabric.Circle({
      radius: 6,
      fill: '#e5e7eb',
      stroke: '#9ca3af',
      strokeWidth: 1,
      selectable: false,
      evented: true,
      hoverCursor: 'pointer',
      moveCursor: 'pointer',
      originX: 'center',
      originY: 'center',
    });
  }

  returnPoint(point: fabric.Circle): void {
    if (this.pool.length < this.maxPoolSize) {
      // Reset point properties
      point.set({
        fill: '#e5e7eb',
        stroke: '#9ca3af',
        strokeWidth: 1,
        visible: true,
        opacity: 1
      });
      this.pool.push(point);
    }
  }

  clear(): void {
    this.pool = [];
  }
}

const connectionPointPool = new ConnectionPointPool();

export interface ConnectionPoint extends fabric.Circle {
  isConnectionPoint?: boolean;
  pointPosition?: string;
  parentObject?: fabric.Object;
  originalPosition?: { x: number; y: number };
}

export const showConnectionPoints = (canvas: fabric.Canvas, obj: fabric.Object): void => {
  // First hide any existing connection points for this object
  hideConnectionPointsForObject(canvas, obj);

  const bounds = obj.getBoundingRect();
  const offset = 12; // Distance from object edge

  const points = [
    { id: 'top', x: bounds.left + bounds.width / 2, y: bounds.top - offset },
    { id: 'right', x: bounds.left + bounds.width + offset, y: bounds.top + bounds.height / 2 },
    { id: 'bottom', x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height + offset },
    { id: 'left', x: bounds.left - offset, y: bounds.top + bounds.height / 2 }
  ];

  points.forEach(point => {
    const connectionPoint = new fabric.Circle({
      left: point.x - 8, // Larger hit area
      top: point.y - 8,  // Larger hit area
      radius: 8, // Larger default size
      fill: AUDIT_COLORS.primary,
      stroke: AUDIT_COLORS.surface,
      strokeWidth: 2,
      selectable: false,
      evented: true,
      hoverCursor: 'crosshair',
      hasControls: false,
      hasBorders: false,
      excludeFromExport: true,
      opacity: 0.9
    }) as ConnectionPoint;

    connectionPoint.isConnectionPoint = true;
    connectionPoint.pointPosition = point.id;
    connectionPoint.parentObject = obj;
    connectionPoint.originalPosition = { x: point.x, y: point.y };

    // Add hover effects
    connectionPoint.on('mouseover', () => {
      connectionPoint.set({
        radius: 10, // Even larger on hover
        fill: AUDIT_COLORS.secondary,
        stroke: AUDIT_COLORS.warning,
        strokeWidth: 3,
        opacity: 1
      });
      canvas.renderAll();
    });

    connectionPoint.on('mouseout', () => {
      connectionPoint.set({
        radius: 8,
        fill: AUDIT_COLORS.primary,
        stroke: AUDIT_COLORS.surface,
        strokeWidth: 2,
        opacity: 0.9
      });
      canvas.renderAll();
    });

    // Handle connection creation
    connectionPoint.on('mousedown', (e) => {
      if (e.e) {
        e.e.stopPropagation();
      }
      startConnectionDrag(canvas, connectionPoint);
    });

    canvas.add(connectionPoint);
  });

  canvas.renderAll();
};

export const hideConnectionPointsForObject = (canvas: fabric.Canvas, obj: fabric.Object): void => {
  const objects = canvas.getObjects();
  const connectionPoints = objects.filter((point: fabric.Object) => {
    const cp = point as ConnectionPoint;
    return cp.isConnectionPoint && cp.parentObject === obj;
  });

  connectionPoints.forEach((point: fabric.Object) => {
    canvas.remove(point);
  });
};

export const hideAllConnectionPoints = (canvas: fabric.Canvas): void => {
  const objects = canvas.getObjects();
  const connectionPoints = objects.filter((obj: fabric.Object) => {
    return (obj as ConnectionPoint).isConnectionPoint;
  });

  connectionPoints.forEach((point: fabric.Object) => {
    canvas.remove(point);
  });
  canvas.renderAll();
};

export const updateConnectionPoints = (canvas: fabric.Canvas, obj: fabric.Object): void => {
  hideConnectionPointsForObject(canvas, obj);
  showConnectionPoints(canvas, obj);
};

let dragLine: fabric.Line | null = null;
let startConnectionPoint: ConnectionPoint | null = null;

const startConnectionDrag = (canvas: fabric.Canvas, connectionPoint: ConnectionPoint): void => {
  startConnectionPoint = connectionPoint;

  // Create temporary drag line
  const startPos = connectionPoint.originalPosition!;
  dragLine = new fabric.Line([startPos.x, startPos.y, startPos.x, startPos.y], {
    stroke: AUDIT_COLORS.primary,
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    opacity: 0.7
  });

  canvas.add(dragLine);

  // Highlight all other connection points
  highlightTargetConnectionPoints(canvas, connectionPoint.parentObject!);

  // Add mouse move and up handlers
  canvas.on('mouse:move', handleConnectionDrag);
  canvas.on('mouse:up', handleConnectionEnd);

  canvas.renderAll();
};

const handleConnectionDrag = (e: any): void => {
  if (!dragLine || !startConnectionPoint) return;

  const pointer = e.pointer;
  const startPos = startConnectionPoint.originalPosition!;

  dragLine.set({
    x2: pointer.x,
    y2: pointer.y
  });

  // Check for nearby connection points for magnetic effect
  const canvas = dragLine.canvas!;
  const objects = canvas.getObjects();
  let nearestPoint: ConnectionPoint | null = null;
  let minDistance = 40; // Larger magnetic range (was 25)

  // First, make all connection points visible
  highlightAllConnectionPoints(canvas, startConnectionPoint.parentObject!);

  objects.forEach((obj: fabric.Object) => {
    const cp = obj as ConnectionPoint;
    if (cp.isConnectionPoint && cp.parentObject !== startConnectionPoint!.parentObject) {
      const distance = Math.sqrt(
        Math.pow(pointer.x - cp.originalPosition!.x, 2) +
        Math.pow(pointer.y - cp.originalPosition!.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = cp;
      }
    }
  });

  // Apply magnetic effect
  if (nearestPoint) {
    dragLine.set({
      x2: nearestPoint.originalPosition!.x,
      y2: nearestPoint.originalPosition!.y
    });

    // Enhanced visual feedback
    nearestPoint.set({
      radius: 12,
      fill: AUDIT_COLORS.warning,
      stroke: AUDIT_COLORS.secondary,
      strokeWidth: 4,
      opacity: 1
    });

    // Add pulsing animation effect
    const animate = () => {
      if (!nearestPoint) return;

      fabric.util.animate({
        startValue: 12,
        endValue: 14,
        duration: 500,
        onChange: (value: number) => {
          if (nearestPoint) {
            nearestPoint.set({ radius: value });
            canvas.renderAll();
          }
        },
        onComplete: () => {
          fabric.util.animate({
            startValue: 14,
            endValue: 12,
            duration: 500,
            onChange: (value: number) => {
              if (nearestPoint) {
                nearestPoint.set({ radius: value });
                canvas.renderAll();
              }
            },
            onComplete: animate
          });
        }
      });
    };

    // Start animation
    animate();
  }

  canvas.renderAll();
};

const handleConnectionEnd = (e: any): void => {
  if (!dragLine || !startConnectionPoint) return;

  const canvas = dragLine.canvas!;
  const pointer = e.pointer;

  // Find target connection point
  const objects = canvas.getObjects();
  let targetPoint: ConnectionPoint | null = null;

  objects.forEach((obj: fabric.Object) => {
    const cp = obj as ConnectionPoint;
    if (cp.isConnectionPoint && cp.parentObject !== startConnectionPoint!.parentObject) {
      const distance = Math.sqrt(
        Math.pow(pointer.x - cp.originalPosition!.x, 2) +
        Math.pow(pointer.y - cp.originalPosition!.y, 2)
      );

      if (distance < 25) { // Magnetic range
        targetPoint = cp;
      }
    }
  });

  // Create connection if target found
  if (targetPoint) {
    new SimpleConnector(
      canvas,
      startConnectionPoint.parentObject!,
      targetPoint.parentObject!,
      {
        strokeColor: AUDIT_COLORS.primary,
        strokeWidth: 2,
        hasArrow: true
      }
    );
  }

  // Cleanup
  canvas.remove(dragLine);
  resetConnectionPointStyles(canvas);
  hideAllConnectionPoints(canvas);

  canvas.off('mouse:move', handleConnectionDrag);
  canvas.off('mouse:up', handleConnectionEnd);

  dragLine = null;
  startConnectionPoint = null;

  canvas.renderAll();
};

const highlightTargetConnectionPoints = (canvas: fabric.Canvas, excludeObject: fabric.Object): void => {
  const objects = canvas.getObjects();
  objects.forEach((obj: fabric.Object) => {
    const cp = obj as ConnectionPoint;
    if (cp.isConnectionPoint && cp.parentObject !== excludeObject) {
      cp.set({
        radius: 8,
        fill: AUDIT_COLORS.warning,
        stroke: AUDIT_COLORS.secondary,
        strokeWidth: 3,
        opacity: 1
      });
    }
  });
};

const resetConnectionPointStyles = (canvas: fabric.Canvas): void => {
  const objects = canvas.getObjects();
  objects.forEach((obj: fabric.Object) => {
    const cp = obj as ConnectionPoint;
    if (cp.isConnectionPoint) {
      cp.set({
        radius: 6,
        fill: AUDIT_COLORS.primary,
        stroke: AUDIT_COLORS.surface,
        strokeWidth: 2,
        opacity: 0.9
      });
    }
  });
};

// Helper function to highlight all connection points
const highlightAllConnectionPoints = (canvas: fabric.Canvas, excludeObject: fabric.Object): void => {
  const objects = canvas.getObjects();
  objects.forEach((obj: fabric.Object) => {
    if (!(obj as any).isConnectionPoint && !(obj as any).isConnector && obj !== excludeObject) {
      // Show connection points for all objects except the one being dragged from
      showConnectionPoints(canvas, obj);
    }
  });
};