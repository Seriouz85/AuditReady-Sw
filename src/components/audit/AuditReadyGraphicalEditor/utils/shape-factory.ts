import * as fabric from 'fabric';
import { AUDIT_COLORS } from '../core/fabric-utils';

export interface ShapeDefinition {
  type: string;
  label: string;
  defaultProps: {
    [key: string]: any;
    width?: number;
    height?: number;
    radius?: number;
    rx?: number;
    ry?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    points?: { x: number; y: number }[];
    path?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  };
}

export interface SimpleConnector {
  line: fabric.Line;
  arrowhead?: fabric.Triangle;
  startObject: fabric.Object;
  endObject: fabric.Object;
  canvas: fabric.Canvas;
  id: string;
  options: any;
  remove(): void;
  updateStyle(options: any): void;
  getProperties(): any;
}

// Audit element symbols mapping
const AUDIT_ELEMENT_SYMBOLS: Record<string, string> = {
  'process': '⚙️',
  'decision': '❓',
  'start-end': '🎯',
  'document': '📄',
  'database': '🗄️',
  'risk-assessment': '⚠️',
  'control-test': '✅',
  'finding': '🔍',
  'recommendation': '💡',
  'manual-input': '✏️',
  'predefined-process': '📋',
  'delay': '⏱️'
};

export const createAuditShape = (
  fabricModule: typeof fabric,
  type: string,
  definition: ShapeDefinition,
  customProps: Partial<fabric.Object> = {}
): fabric.Object | null => {
  const props = { ...definition.defaultProps, ...customProps };

  // Helper function to create shape with symbol
  const createShapeWithSymbol = (baseShape: fabric.Object, symbol?: string): fabric.Object => {
    if (!symbol) return baseShape;

    const symbolText = new fabricModule.Text(symbol, {
      fontSize: 20,
      fill: AUDIT_COLORS.primary,
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    return new fabricModule.Group([baseShape, symbolText], {
      left: (customProps.left as number) || 100,
      top: (customProps.top as number) || 100,
      selectable: true,
      evented: true,
    });
  };

  let baseShape: fabric.Object | null = null;
  const symbol = AUDIT_ELEMENT_SYMBOLS[type];

  switch (definition.type) {
    case "rect":
      baseShape = new fabricModule.Rect(props);
      break;

    case "circle":
      baseShape = new fabricModule.Circle(props);
      break;

    case "triangle":
      baseShape = new fabricModule.Triangle(props);
      break;

    case "ellipse":
      baseShape = new fabricModule.Ellipse(props);
      break;

    case "line":
      return new fabricModule.Line([props.x1 || 0, props.y1 || 0, props.x2 || 100, props.y2 || 0], {
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
        left: (customProps.left as number) || 100,
        top: (customProps.top as number) || 100,
        selectable: true,
        evented: true,
      });

    case "polygon":
      let points = props.points || [];

      if (type === "star") {
        const outerRadius = 40;
        const innerRadius = 20;
        const center = { x: 0, y: 0 };
        const numPoints = 5;
        points = [];

        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / numPoints - Math.PI / 2;
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          });
        }
      } else if (type === "hexagon") {
        const radius = 40;
        const center = { x: 0, y: 0 };
        const sides = 6;
        points = [];

        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          });
        }
      }

      baseShape = new fabricModule.Polygon(points, {
        fill: props.fill,
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
        left: (customProps.left as number) || 100,
        top: (customProps.top as number) || 100,
        selectable: true,
        evented: true,
      });
      break;

    case "path":
      baseShape = new fabricModule.Path(props.path || '', {
        fill: props.fill,
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
        left: (customProps.left as number) || 100,
        top: (customProps.top as number) || 100,
        selectable: true,
        evented: true,
      });
      break;

    case "group":
      if (type === "database") {
        const dbGroup = new fabricModule.Group([
          new fabricModule.Ellipse({ 
            rx: 40, 
            ry: 10, 
            top: 0, 
            left: 0, 
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth,
          }),
          new fabricModule.Rect({ 
            width: 80, 
            height: 40, 
            top: 10, 
            left: 0, 
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth,
          }),
          new fabricModule.Ellipse({ 
            rx: 40, 
            ry: 10, 
            top: 50, 
            left: 0, 
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth,
          })
        ], {
          left: (customProps.left as number) || 100,
          top: (customProps.top as number) || 100,
          selectable: true,
          evented: true,
        });
        return createShapeWithSymbol(dbGroup, symbol);
      }
      break;

    default:
      return null;
  }

  if (baseShape) {
    return createShapeWithSymbol(baseShape, symbol);
  }

  return null;
}; 