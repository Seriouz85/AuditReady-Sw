import * as fabric from 'fabric';
import { getSmartPlacementManager } from './SmartPlacementManager';
import { getViewportManager } from './ViewportManager';
import { createAuditShape } from '../utils/shape-factory';
import { showConnectionPoints, hideAllConnectionPoints, updateConnectionPoints, hideConnectionPointsForObject } from '../utils/connection-points';

// Audit-ready color palette
export const AUDIT_COLORS = {
  primary: '#1e40af',
  secondary: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#6b7280',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#374151',
  transparent: 'transparent',
} as const;

// Shape definitions following inspiration pattern
export const shapeDefinitions = {
  rectangle: {
    type: "rect",
    label: "Rectangle",
    defaultProps: {
      width: 120,
      height: 80,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    },
  },
  circle: {
    type: "circle",
    label: "Circle",
    defaultProps: {
      radius: 50,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
    },
  },
  triangle: {
    type: "triangle",
    label: "Triangle",
    defaultProps: {
      width: 100,
      height: 100,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
    },
  },
  diamond: {
    type: "polygon",
    label: "Diamond",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 }
      ],
    },
  },
  line: {
    type: "line",
    label: "Line",
    defaultProps: {
      x1: 0,
      y1: 0,
      x2: 150,
      y2: 0,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 3,
    },
  },
  arrow: {
    type: "path",
    label: "Arrow",
    defaultProps: {
      path: "M 0,20 L 100,20 L 100,10 L 130,25 L 100,40 L 100,30 L 0,30 z",
      fill: AUDIT_COLORS.border,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 1,
    },
  },
  star: {
    type: "polygon",
    label: "Star",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
      points: [] as { x: number; y: number }[],
    },
  },
  hexagon: {
    type: "polygon",
    label: "Hexagon",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
      points: [] as { x: number; y: number }[],
    },
  },
  // Audit-specific shapes
  process: {
    type: "rect",
    label: "Process",
    defaultProps: {
      width: 140,
      height: 80,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.primary,
      strokeWidth: 2,
      rx: 12,
      ry: 12,
    },
  },
  decision: {
    type: "polygon",
    label: "Decision",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.warning,
      strokeWidth: 2,
      points: [
        { x: 70, y: 0 },
        { x: 140, y: 40 },
        { x: 70, y: 80 },
        { x: 0, y: 40 }
      ],
    },
  },
  "start-end": {
    type: "ellipse",
    label: "Start/End",
    defaultProps: {
      rx: 70,
      ry: 40,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.secondary,
      strokeWidth: 2,
    },
  },
  document: {
    type: "path",
    label: "Document",
    defaultProps: {
      path: "M 0 0 L 80 0 L 80 60 Q 70 70 60 60 Q 50 50 40 60 Q 30 70 20 60 Q 10 50 0 60 Z",
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.secondary,
      strokeWidth: 2,
    },
  },
  database: {
    type: "group",
    label: "Database",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.primary,
      strokeWidth: 2,
    },
  },
  "risk-assessment": {
    type: "polygon",
    label: "Risk Assessment",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.danger,
      strokeWidth: 2,
      points: [
        { x: 50, y: 10 },
        { x: 90, y: 70 },
        { x: 10, y: 70 }
      ],
    },
  },
  "control-test": {
    type: "circle",
    label: "Control Test",
    defaultProps: {
      radius: 35,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.secondary,
      strokeWidth: 2,
    },
  },
  finding: {
    type: "polygon",
    label: "Finding",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.warning,
      strokeWidth: 2,
      points: [
        { x: 25, y: 0 },
        { x: 75, y: 0 },
        { x: 100, y: 30 },
        { x: 75, y: 60 },
        { x: 25, y: 60 },
        { x: 0, y: 30 }
      ],
    },
  },
  recommendation: {
    type: "circle",
    label: "Recommendation",
    defaultProps: {
      radius: 35,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.warning,
      strokeWidth: 2,
    },
  },
  connector: {
    type: "line",
    label: "Connector",
    defaultProps: {
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 0,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 2,
    },
  },
  "elbow-connector": {
    type: "path",
    label: "Elbow Connector",
    defaultProps: {
      path: "M 20,20 L 20,80 L 80,80",
      fill: "",
      stroke: AUDIT_COLORS.border,
      strokeWidth: 3,
    },
  },
  "double-arrow": {
    type: "path",
    label: "Double Arrow",
    defaultProps: {
      path: "M 20,40 L 180,40 L 180,20 L 220,50 L 180,80 L 180,60 L 20,60 L 20,80 L 0,50 L 20,20 z",
      fill: AUDIT_COLORS.border,
      stroke: AUDIT_COLORS.border,
      strokeWidth: 1,
    },
  },
  "manual-input": {
    type: "polygon",
    label: "Manual Input",
    defaultProps: {
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.primary,
      strokeWidth: 2,
      points: [
        { x: 0, y: 20 },
        { x: 120, y: 0 },
        { x: 120, y: 60 },
        { x: 0, y: 80 }
      ],
    },
  },
  "predefined-process": {
    type: "rect",
    label: "Predefined Process",
    defaultProps: {
      width: 140,
      height: 80,
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.primary,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    },
  },
  delay: {
    type: "path",
    label: "Delay",
    defaultProps: {
      path: "M 0,40 Q 0,0 40,0 L 80,0 Q 120,0 120,40 Q 120,80 80,80 L 40,80 Q 0,80 0,40 Z",
      fill: AUDIT_COLORS.transparent,
      stroke: AUDIT_COLORS.warning,
      strokeWidth: 2,
    },
  },
};



// Initialize Fabric following inspiration pattern
export const initializeFabric = async (canvasEl: HTMLCanvasElement): Promise<fabric.Canvas | null> => {
  try {
    console.log('Initializing Fabric.js canvas...');

    const canvas = new fabric.Canvas(canvasEl, {
      preserveObjectStacking: true,
      isDrawingMode: false,
      renderOnAddRemove: true,
      backgroundColor: AUDIT_COLORS.surface,
    });

    // Initialize drawing brush
    const brush = new fabric.PencilBrush(canvas);
    brush.color = AUDIT_COLORS.primary;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    // Setup canvas events
    setupCanvasEvents(canvas);

    return canvas;
  } catch (error) {
    console.error('Failed to load fabric', error);
    return null;
  }
};

// Setup canvas events
const setupCanvasEvents = (canvas: fabric.Canvas): void => {
  // Customize bounding box for all objects
  canvas.on("object:added", (e) => {
    if (e.target) {
      e.target.set({
        borderColor: AUDIT_COLORS.primary,
        cornerColor: AUDIT_COLORS.surface,
        cornerStrokeColor: AUDIT_COLORS.primary,
        cornerSize: 8,
        transparentCorners: false,
      });
    }
  });

  // Handle object selection for connection points
  canvas.on('selection:created', (e) => {
    const activeObject = e.selected?.[0];
    if (activeObject && !(activeObject as any).isConnectionPoint && !(activeObject as any).isConnector) {
      showConnectionPoints(canvas, activeObject);
    }
  });

  canvas.on('selection:updated', (e) => {
    hideAllConnectionPoints(canvas);
    const activeObject = e.selected?.[0];
    if (activeObject && !(activeObject as any).isConnectionPoint && !(activeObject as any).isConnector) {
      showConnectionPoints(canvas, activeObject);
    }
  });

  canvas.on('selection:cleared', () => {
    hideAllConnectionPoints(canvas);
  });

  // Handle object movement
  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (obj && !(obj as any).isConnectionPoint && !(obj as any).isConnector) {
      updateConnectionPoints(canvas, obj);
    }
  });

  // Handle mouse over for connection points visibility
  canvas.on('mouse:over', (e) => {
    const obj = e.target;
    if (obj && !(obj as any).isConnectionPoint && !(obj as any).isConnector && !canvas.getActiveObject()) {
      showConnectionPoints(canvas, obj);
    }
  });

  canvas.on('mouse:out', (e) => {
    const obj = e.target;
    if (obj && !(obj as any).isConnectionPoint && !(obj as any).isConnector && !canvas.getActiveObject()) {
      hideConnectionPointsForObject(canvas, obj);
    }
  });

  // Apply to existing objects
  canvas.getObjects().forEach((obj) => {
    obj.set({
      borderColor: AUDIT_COLORS.primary,
      cornerColor: AUDIT_COLORS.surface,
      cornerStrokeColor: AUDIT_COLORS.primary,
      cornerSize: 8,
      transparentCorners: false,
    });
  });
};

export const centerCanvas = (canvas: fabric.Canvas): void => {
  if (!canvas || !canvas.wrapperEl) return;

  const canvasWrapper = canvas.wrapperEl;
  canvasWrapper.style.width = `${canvas.width}px`;
  canvasWrapper.style.height = `${canvas.height}px`;
  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.top = "50%";
  canvasWrapper.style.left = "50%";
  canvasWrapper.style.transform = "translate(-50%, -50%)";
  canvasWrapper.style.border = `2px solid ${AUDIT_COLORS.border}`;
  canvasWrapper.style.borderRadius = "8px";
  canvasWrapper.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
};

// Smart positioning system - places objects side by side, not stacked
const getSmartPosition = (canvas: fabric.Canvas, objectWidth: number = 100, objectHeight: number = 100) => {
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

  // Calculate visible area
  const visibleLeft = -vpt[4] / zoom;
  const visibleTop = -vpt[5] / zoom;
  const visibleWidth = canvas.getWidth() / zoom;
  const visibleHeight = canvas.getHeight() / zoom;

  const objects = canvas.getObjects().filter(obj => !(obj as any).isConnectionPoint && !(obj as any).isConnector);
  const spacing = 20; // Space between objects
  const margin = 50; // Margin from edges

  // If no objects exist, place at top-left with margin
  if (objects.length === 0) {
    return {
      left: visibleLeft + margin,
      top: visibleTop + margin
    };
  }

  // Check for overlap with existing objects
  const hasOverlap = (testX: number, testY: number) => {
    const testBounds = {
      left: testX,
      top: testY,
      right: testX + objectWidth,
      bottom: testY + objectHeight
    };

    return objects.some(obj => {
      const objBounds = obj.getBoundingRect();
      const buffer = spacing / 2; // Add buffer for spacing
      return !(
        testBounds.right + buffer < objBounds.left ||
        testBounds.left - buffer > objBounds.left + objBounds.width ||
        testBounds.bottom + buffer < objBounds.top ||
        testBounds.top - buffer > objBounds.top + objBounds.height
      );
    });
  };

  // Strategy 1: Try to place to the right of the last object
  const lastObject = objects[objects.length - 1];
  if (lastObject) {
    const lastBounds = lastObject.getBoundingRect();
    let x = lastBounds.left + lastBounds.width + spacing;
    let y = lastBounds.top;

    // Check if it fits horizontally in visible area
    if (x + objectWidth <= visibleLeft + visibleWidth - margin) {
      if (!hasOverlap(x, y)) {
        return { left: x, top: y };
      }
    }
  }

  // Strategy 2: Try placing in a grid pattern starting from top-left
  const startX = visibleLeft + margin;
  const startY = visibleTop + margin;
  const maxCols = Math.floor((visibleWidth - 2 * margin) / (objectWidth + spacing));

  let row = 0;
  let col = 0;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const x = startX + col * (objectWidth + spacing);
    const y = startY + row * (objectHeight + spacing);

    // Check if position is within visible bounds
    if (x + objectWidth <= visibleLeft + visibleWidth - margin &&
        y + objectHeight <= visibleTop + visibleHeight - margin) {

      if (!hasOverlap(x, y)) {
        return { left: x, top: y };
      }
    }

    // Move to next grid position
    col++;
    if (col >= maxCols || x + objectWidth > visibleLeft + visibleWidth - margin) {
      col = 0;
      row++;
    }

    attempts++;
  }

  // Strategy 3: Find the rightmost object and place to its right
  let rightmostX = visibleLeft + margin;
  let rightmostY = visibleTop + margin;

  objects.forEach(obj => {
    const bounds = obj.getBoundingRect();
    if (bounds.left + bounds.width > rightmostX) {
      rightmostX = bounds.left + bounds.width + spacing;
      rightmostY = bounds.top;
    }
  });

  // Ensure it's within canvas bounds
  const canvasWidth = canvas.width || 1200;
  if (rightmostX + objectWidth > canvasWidth) {
    // Move to next row
    rightmostX = visibleLeft + margin;
    rightmostY = Math.max(rightmostY + objectHeight + spacing, visibleTop + margin);
  }

  return {
    left: rightmostX,
    top: rightmostY
  };
};

// Add shape to canvas following inspiration pattern
export const addShapeToCanvas = async (
  canvas: fabric.Canvas,
  shapeType: string,
  customProps: Partial<fabric.Object> = {}
): Promise<fabric.Object | null> => {
  if (!canvas) return null;

  try {
    const definition = shapeDefinitions[shapeType as keyof typeof shapeDefinitions];
    if (!definition) {
      console.error(`Shape type "${shapeType}" not found`);
      return null;
    }

    // Get smart position to avoid overlap
    const defaultProps = definition.defaultProps as any;
    const defaultWidth = defaultProps.width || defaultProps.radius * 2 || 100;
    const defaultHeight = defaultProps.height || defaultProps.radius * 2 || 100;
    const position = getSmartPosition(canvas, defaultWidth, defaultHeight);

    const shape = createAuditShape(fabric, shapeType, definition, {
      left: position.left,
      top: position.top,
      ...customProps,
    });

    if (shape) {
      (shape as any).id = `${shapeType}-${Date.now()}`;
      (shape as any).shapeType = shapeType;

      // Enable text editing on double-click
      setupTextEditing(canvas, shape);

      canvas.add(shape);
      canvas.setActiveObject(shape);

      // Expand canvas if needed to accommodate new content
      expandCanvasIfNeeded(canvas);

      canvas.renderAll();
      console.log(`Shape ${shapeType} added at position:`, { left: shape.left, top: shape.top });
      return shape;
    }
  } catch (error) {
    console.error('Error adding shape:', error);
  }

  return null;
};

// Setup text editing for shapes - simplified approach
const setupTextEditing = (canvas: fabric.Canvas, shape: fabric.Object) => {
  shape.on('mousedblclick', (e) => {
    e.e.preventDefault();
    e.e.stopPropagation();

    // Check if shape already has text
    const existingText = (shape as any).textObject;
    if (existingText) {
      // Enter editing mode for existing text
      canvas.setActiveObject(existingText);
      existingText.enterEditing();
      existingText.selectAll();
    } else {
      // Add new text to shape
      addEditableTextToShape(canvas, shape);
    }
  });
};

// Add editable text to a shape - simplified approach without grouping
export const addEditableTextToShape = (canvas: fabric.Canvas, shape: fabric.Object) => {
  if (!canvas || !shape) return;

  const bounds = shape.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;

  // Calculate appropriate font size based on shape size
  const maxWidth = bounds.width * 0.8;
  const fontSize = Math.min(maxWidth / 8, 20, bounds.height / 3);

  const textObj = new fabric.IText('Edit Text', {
    left: centerX,
    top: centerY,
    fontSize: Math.max(fontSize, 12),
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#1f2937',
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    borderColor: AUDIT_COLORS.primary,
    cornerColor: AUDIT_COLORS.surface,
    cornerStrokeColor: AUDIT_COLORS.primary,
    cornerSize: 6,
    transparentCorners: false,
  });

  // Link text with shape for movement synchronization
  (textObj as any).id = `text-${Date.now()}`;
  (textObj as any).parentShape = shape;
  (shape as any).textObject = textObj;

  // Add text to canvas
  canvas.add(textObj);
  canvas.setActiveObject(textObj);

  // Enter editing mode immediately
  textObj.enterEditing();
  textObj.selectAll();

  // Synchronize text position when shape moves
  const syncTextPosition = () => {
    if (textObj && shape && canvas.getObjects().includes(shape)) {
      const newBounds = shape.getBoundingRect();
      textObj.set({
        left: newBounds.left + newBounds.width / 2,
        top: newBounds.top + newBounds.height / 2
      });
      canvas.renderAll();
    }
  };

  // Listen for shape movements
  shape.on('moving', syncTextPosition);
  shape.on('scaling', syncTextPosition);
  shape.on('rotating', syncTextPosition);

  canvas.renderAll();
};

// Add text to canvas following inspiration pattern
export const addTextToCanvas = async (
  canvas: fabric.Canvas,
  text: string = 'Text',
  options: Partial<fabric.IText> = {},
  withBackground: boolean = false
): Promise<fabric.IText | null> => {
  if (!canvas) return null;

  try {
    // Get smart position using SmartPlacementManager
    const smartPlacement = getSmartPlacementManager();
    const viewportManager = getViewportManager();
    const estimatedWidth = text.length * 12; // Rough estimate
    const estimatedHeight = 24;
    const placement = smartPlacement?.findOptimalPlacement(estimatedWidth, estimatedHeight) ||
                     getSmartPosition(canvas, estimatedWidth, estimatedHeight);

    const position = typeof placement === 'object' && 'x' in placement ?
                     { left: placement.x, top: placement.y } : placement;

    const defaultProps = {
      left: position.left,
      top: position.top,
      fontSize: 24,
      fontFamily: "Arial",
      fill: AUDIT_COLORS.border,
      padding: withBackground ? 10 : 0,
      textAlign: "left" as const,
      id: `text-${Date.now()}`,
      borderColor: AUDIT_COLORS.primary,
      cornerColor: AUDIT_COLORS.surface,
      cornerStrokeColor: AUDIT_COLORS.primary,
      cornerSize: 8,
      transparentCorners: false,
      ...options,
    };

    const textObj = new fabric.IText(text, defaultProps);

    canvas.add(textObj);
    canvas.setActiveObject(textObj);

    // Ensure the new text is visible
    viewportManager?.ensureObjectVisible(textObj);

    // Expand canvas if needed to accommodate new content
    expandCanvasIfNeeded(canvas);

    canvas.renderAll();
    console.log(`Text "${text}" added at position:`, { left: textObj.left, top: textObj.top });

    return textObj;
  } catch (error) {
    console.error('Error adding text:', error);
    return null;
  }
};

// Add image to canvas following inspiration pattern
export const addImageToCanvas = async (canvas: fabric.Canvas, imageUrl: string): Promise<fabric.Image | null> => {
  if (!canvas) return null;

  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const fabricImg = new fabric.FabricImage(img, {
          id: `image-${Date.now()}`,
          top: 100,
          left: 100,
          cornerSize: 8,
          borderColor: AUDIT_COLORS.primary,
          cornerColor: AUDIT_COLORS.surface,
          cornerStrokeColor: AUDIT_COLORS.primary,
          transparentCorners: false,
        });

        const maxDimension = 400;
        if (fabricImg.width! > maxDimension || fabricImg.height! > maxDimension) {
          const scale = fabricImg.width! > fabricImg.height!
            ? maxDimension / fabricImg.width!
            : maxDimension / fabricImg.height!;
          fabricImg.scale(scale);
        }

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        resolve(fabricImg);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error adding image:', error);
    return null;
  }
};

// Drawing mode
export const toggleDrawingMode = (
  canvas: fabric.Canvas,
  isDrawingMode: boolean,
  drawingColor: string = AUDIT_COLORS.primary,
  brushWidth: number = 3
): boolean => {
  if (!canvas) return false;

  try {
    canvas.isDrawingMode = isDrawingMode;
    if (isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
    return true;
  } catch (error) {
    console.error('Error toggling drawing mode:', error);
    return false;
  }
};

// Erase mode
export const toggleEraseMode = (
  canvas: fabric.Canvas,
  isErasing: boolean,
  previousColor: string = AUDIT_COLORS.primary,
  eraserWidth: number = 20
): boolean => {
  if (!canvas || !canvas.freeDrawingBrush) return false;

  try {
    if (isErasing) {
      canvas.freeDrawingBrush.color = AUDIT_COLORS.surface;
      canvas.freeDrawingBrush.width = eraserWidth;
    } else {
      canvas.freeDrawingBrush.color = previousColor;
      canvas.freeDrawingBrush.width = 3;
    }
    return true;
  } catch (error) {
    console.error('Error toggling erase mode:', error);
    return false;
  }
};

// Update drawing brush
export const updateDrawingBrush = (canvas: fabric.Canvas, properties: {
  color?: string;
  width?: number;
  opacity?: number;
}): boolean => {
  if (!canvas || !canvas.freeDrawingBrush) return false;

  try {
    const { color, width, opacity } = properties;

    if (color !== undefined) {
      canvas.freeDrawingBrush.color = color;
    }

    if (width !== undefined) {
      canvas.freeDrawingBrush.width = width;
    }

    if (opacity !== undefined) {
      // Note: Fabric.js doesn't directly support brush opacity
      // This would need to be implemented differently
    }

    return true;
  } catch (error) {
    console.error('Error updating drawing brush:', error);
    return false;
  }
};

// Clone selected object
export const cloneSelectedObject = async (canvas: fabric.Canvas): Promise<fabric.Object | null> => {
  if (!canvas) return null;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return null;

  try {
    const clonedObj = await activeObject.clone();
    clonedObj.set({
      left: (activeObject.left || 0) + 10,
      top: (activeObject.top || 0) + 10,
    });
    (clonedObj as any).id = `${activeObject.type || 'object'}-${Date.now()}`;

    canvas.add(clonedObj);
    canvas.setActiveObject(clonedObj);
    canvas.renderAll();

    return clonedObj;
  } catch (error) {
    console.error('Error cloning object:', error);
    return null;
  }
};

// Delete selected object
export const deleteSelectedObject = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  try {
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error deleting object:', error);
    return false;
  }
};

// Layer management
export const bringToFront = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  canvas.bringObjectToFront(activeObject);
  canvas.renderAll();
  return true;
};

export const sendToBack = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  canvas.sendObjectToBack(activeObject);
  canvas.renderAll();
  return true;
};

export const bringForward = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  canvas.bringObjectForward(activeObject);
  canvas.renderAll();
  return true;
};

export const sendBackward = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  canvas.sendObjectBackwards(activeObject);
  canvas.renderAll();
  return true;
};

// Object properties
export const lockObject = (canvas: fabric.Canvas, lock: boolean = true): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  activeObject.set({
    selectable: !lock,
    evented: !lock
  });
  canvas.renderAll();
  return true;
};

// Trackpad pinch-to-zoom functionality
export const setupTrackpadZoom = (canvas: fabric.Canvas, container: HTMLElement | null): void => {
  if (!canvas || !container) return;

  let isZooming = false;
  let lastDistance = 0;
  let lastScale = 1;

  // Handle wheel events for trackpad pinch-to-zoom
  const handleWheel = (e: WheelEvent) => {
    // Check if this is a pinch gesture (ctrlKey is set on trackpad pinch)
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      const zoom = canvas.getZoom();
      let newZoom = zoom;

      // Calculate zoom based on delta
      if (delta < 0) {
        // Zoom in
        newZoom = Math.min(zoom * 1.1, 5); // Max zoom 5x
      } else {
        // Zoom out
        newZoom = Math.max(zoom * 0.9, 0.1); // Min zoom 0.1x
      }

      // Get mouse position relative to canvas
      const rect = container.getBoundingClientRect();
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Zoom to point
      canvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), newZoom);
      canvas.renderAll();
    }
  };

  // Handle touch events for mobile pinch-to-zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      isZooming = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastScale = canvas.getZoom();
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isZooming && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const scale = (distance / lastDistance) * lastScale;
      const newZoom = Math.min(Math.max(scale, 0.1), 5);

      // Get center point between touches
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const rect = container.getBoundingClientRect();
      const pointer = {
        x: centerX - rect.left,
        y: centerY - rect.top
      };

      canvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), newZoom);
      canvas.renderAll();
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      isZooming = false;
    }
  };

  // Add event listeners
  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Store cleanup function on canvas for later removal
  (canvas as any)._trackpadZoomCleanup = () => {
    container.removeEventListener('wheel', handleWheel);
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchmove', handleTouchMove);
    container.removeEventListener('touchend', handleTouchEnd);
  };
};

// Dynamic canvas expansion - expand canvas when content goes beyond bounds
export const expandCanvasIfNeeded = (canvas: fabric.Canvas, margin: number = 100): void => {
  if (!canvas) return;

  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  let maxRight = 0;
  let maxBottom = 0;

  // Find the furthest extent of all objects
  objects.forEach(obj => {
    const bounds = obj.getBoundingRect();
    maxRight = Math.max(maxRight, bounds.left + bounds.width);
    maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
  });

  const currentWidth = canvas.width || 1200;
  const currentHeight = canvas.height || 600;

  // Calculate new dimensions with margin
  const neededWidth = maxRight + margin;
  const neededHeight = maxBottom + margin;

  let needsResize = false;
  let newWidth = currentWidth;
  let newHeight = currentHeight;

  // Expand width if needed
  if (neededWidth > currentWidth) {
    newWidth = Math.max(neededWidth, currentWidth * 1.2); // At least 20% larger
    needsResize = true;
  }

  // Expand height if needed
  if (neededHeight > currentHeight) {
    newHeight = Math.max(neededHeight, currentHeight * 1.2); // At least 20% larger
    needsResize = true;
  }

  if (needsResize) {
    canvas.setDimensions({
      width: newWidth,
      height: newHeight
    });
    canvas.renderAll();
    console.log(`Canvas expanded to ${newWidth}x${newHeight} to accommodate content`);
  }
};

export const toggleObjectVisibility = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return false;

  const newVisibility = !activeObject.visible;
  activeObject.set('visible', newVisibility);
  canvas.renderAll();
  return newVisibility;
};

// Canvas background
export const setCanvasBackground = (canvas: fabric.Canvas, color: string): boolean => {
  if (!canvas) return false;

  canvas.backgroundColor = color;
  canvas.renderAll();
  return true;
};

export const clearCanvas = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  canvas.clear();
  canvas.backgroundColor = AUDIT_COLORS.surface;
  canvas.renderAll();
  return true;
};

// Export functions
export const exportCanvasAsImage = (canvas: fabric.Canvas, format: 'png' | 'jpeg' = 'png'): string => {
  return canvas.toDataURL({
    format: format,
    quality: 1,
    multiplier: 2,
  });
};

export const exportCanvasAsJSON = (canvas: fabric.Canvas): string => {
  return JSON.stringify(canvas.toJSON());
};

export const loadCanvasFromJSON = async (canvas: fabric.Canvas, jsonData: string): Promise<fabric.Canvas> => {
  try {
    const data = JSON.parse(jsonData);
    canvas.clear();
    await canvas.loadFromJSON(data);
    canvas.renderAll();
    return canvas;
  } catch (error) {
    console.error('Error loading canvas from JSON:', error);
    throw error;
  }
};

// Simplified connector system - just add lines and arrows as shapes
export const addConnectorLine = async (canvas: fabric.Canvas): Promise<fabric.Object | null> => {
  return addShapeToCanvas(canvas, 'line');
};

export const addConnectorArrow = async (canvas: fabric.Canvas): Promise<fabric.Object | null> => {
  return addShapeToCanvas(canvas, 'arrow');
};

export const addElbowConnector = async (canvas: fabric.Canvas): Promise<fabric.Object | null> => {
  return addShapeToCanvas(canvas, 'elbow-connector');
};

// Customize bounding box
export const customizeBoundingBox = (canvas: fabric.Canvas): void => {
  if (!canvas) return;

  try {
    canvas.getObjects().forEach((obj) => {
      obj.set({
        borderColor: AUDIT_COLORS.primary,
        cornerColor: AUDIT_COLORS.surface,
        cornerStrokeColor: AUDIT_COLORS.primary,
        cornerSize: 8,
        transparentCorners: false,
      });
    });

    canvas.renderAll();
  } catch (error) {
    console.error('Failed to customize bounding box', error);
  }
};

// Additional utility functions
export const getCanvasObjects = (canvas: fabric.Canvas): fabric.Object[] => {
  if (!canvas) return [];
  return canvas.getObjects();
};

export const getSelectedObject = (canvas: fabric.Canvas): fabric.Object | null => {
  if (!canvas) return null;
  return canvas.getActiveObject();
};

export const selectObject = (canvas: fabric.Canvas, obj: fabric.Object): boolean => {
  if (!canvas || !obj) return false;

  try {
    canvas.setActiveObject(obj);
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error selecting object:', error);
    return false;
  }
};

export const deselectAll = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  try {
    canvas.discardActiveObject();
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error deselecting objects:', error);
    return false;
  }
};

export const zoomToFit = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  try {
    const objects = canvas.getObjects();
    if (objects.length === 0) return false;

    // Calculate bounding box of all objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    const objectsWidth = maxX - minX;
    const objectsHeight = maxY - minY;
    const canvasWidth = canvas.width || 800;
    const canvasHeight = canvas.height || 600;

    // Calculate zoom to fit with some padding
    const padding = 50;
    const zoomX = (canvasWidth - padding * 2) / objectsWidth;
    const zoomY = (canvasHeight - padding * 2) / objectsHeight;
    const zoom = Math.min(zoomX, zoomY, 2); // Max zoom of 2x

    // Calculate center position
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    canvas.setZoom(zoom);
    canvas.absolutePan(new fabric.Point(
      canvasWidth / 2 - centerX * zoom,
      canvasHeight / 2 - centerY * zoom
    ));

    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error zooming to fit:', error);
    return false;
  }
};

export const resetZoom = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;

  try {
    canvas.setZoom(1);
    canvas.absolutePan(new fabric.Point(0, 0));
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error resetting zoom:', error);
    return false;
  }
};

export const setZoom = (canvas: fabric.Canvas, zoom: number): boolean => {
  if (!canvas) return false;

  try {
    const clampedZoom = Math.max(0.1, Math.min(5, zoom)); // Clamp between 0.1x and 5x
    canvas.setZoom(clampedZoom);
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error('Error setting zoom:', error);
    return false;
  }
};

export const panCanvas = (canvas: fabric.Canvas, deltaX: number, deltaY: number): boolean => {
  if (!canvas) return false;

  try {
    const currentTransform = canvas.viewportTransform;
    if (currentTransform) {
      currentTransform[4] += deltaX;
      currentTransform[5] += deltaY;
      canvas.setViewportTransform(currentTransform);
      canvas.renderAll();
    }
    return true;
  } catch (error) {
    console.error('Error panning canvas:', error);
    return false;
  }
};

// Group and ungroup functions
export const groupSelectedObjects = (canvas: fabric.Canvas): fabric.Group | null => {
  if (!canvas) return null;

  try {
    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== 'activeSelection') {
      return null;
    }

    const group = (activeSelection as any).toGroup();
    canvas.renderAll();
    return group;
  } catch (error) {
    console.error('Error grouping objects:', error);
    return null;
  }
};

export const ungroupSelectedObject = (canvas: fabric.Canvas): fabric.Object[] | null => {
  if (!canvas) return null;

  try {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
      return null;
    }

    const group = activeObject as any;
    const objects = group.toActiveSelection();
    canvas.renderAll();
    return objects.getObjects();
  } catch (error) {
    console.error('Error ungrouping object:', error);
    return null;
  }
};