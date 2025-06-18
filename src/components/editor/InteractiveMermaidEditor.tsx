/**
 * Interactive Mermaid Editor with React Flow
 * Drag-and-drop visual editing that generates Mermaid code
 * Following user requirements: white/blue theme, no visible code, interactive editing
 */

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
  ConnectionMode,
  ConnectionLineType,
  NodeResizer
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Square, Circle, Diamond, Star,
  Type, Palette, Download, Undo, Redo,
  Brain, Sparkles
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  MermaidDesignTokens
} from '../ui';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { EdgePropertiesPanel } from './EdgePropertiesPanel';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { SaveExportModal } from './SaveExportModal';

import { EnhancedMermaidAI } from '../../services/ai/EnhancedMermaidAI';
import { applyAutoAdjustedColors, getAutoAdjustedEdgeColors, getOptimalColors, getSmartGradientAdjustment } from '../../utils/colorUtils';
import { useReactFlowUndoRedo } from '../../hooks/useUndoRedo';

// Helper to ensure we always spread from an object
function ensureObject(val: any): Record<string, any> {
  return val && typeof val === 'object' ? val : {};
}

// Type definition for CustomNode props
interface CustomNodeProps {
  data: {
    label?: string;
    shape?: 'rectangle' | 'circle' | 'diamond' | 'star' | 'text';
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    textColor?: string;
    onLabelChange?: (nodeId: string, newLabel: string) => void;
    description?: string;
    onUpdate?: (nodeId: string, updates: any) => void;
    width?: number;
    height?: number;
  };
  selected?: boolean;
  id?: string;
}

// Custom Node Component - Moved outside to prevent recreation
const CustomNode = React.memo<CustomNodeProps>(({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localLabel, setLocalLabel] = useState(data.label || 'Node');

  // Update local state when data changes
  React.useEffect(() => {
    setLocalLabel(data.label || 'Node');
  }, [data.label]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleLabelChange = useCallback((newLabel: string) => {
    setLocalLabel(newLabel);
    if (data.onUpdate) {
      data.onUpdate(id, { label: newLabel });
    } else if (data.onLabelChange) {
      data.onLabelChange(id, newLabel);
    }
  }, [data, id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Render text content with main label and optional description
  const renderTextContent = (fontSize: number) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={localLabel}
          onChange={(e) => handleLabelChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: textColor,
            fontSize: `${fontSize}px`,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            textAlign: 'center',
            width: '100%'
          }}
          autoFocus
        />
      );
    }

    return (
      <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
        {/* Main label */}
        <div style={{ 
          fontSize: `${fontSize}px`,
          fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
          wordWrap: 'break-word'
        }}>
          {localLabel}
        </div>
        {/* Description - smaller text below main label */}
        {description && (
          <div style={{ 
            fontSize: `${Math.max(fontSize - 2, 8)}px`,
            fontWeight: MermaidDesignTokens.typography.fontWeight.normal,
            color: `${textColor}99`, // Add transparency
            marginTop: '2px',
            wordWrap: 'break-word',
            lineHeight: '1.1'
          }}>
            {description}
          </div>
        )}
      </div>
    );
  };

  // Determine if handles should be visible
  const showHandles = selected || isHovered;

  const {
    shape = 'rectangle',
    fillColor = '#f8fafc',
    strokeColor = '#2563eb',
    strokeWidth = 2,
    textColor = '#1e293b',
    description = ''
  } = data;

  const getNodeStyle = () => {
    // Use custom dimensions if available, otherwise calculate optimal size
    const customWidth = data.width;
    const customHeight = data.height;
    const optimalSize = getOptimalSize(localLabel, shape, description);
    
    const width = customWidth || optimalSize;
    const height = customHeight || optimalSize;
    
    const baseStyle = {
      width: `${width}px`,
      height: `${height}px`,
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    if (selected) {
      return {
        ...baseStyle,
        transform: 'scale(1.05)',
        filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))'
      };
    }

    return baseStyle;
  };

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        const circleSize = data.width || data.height || getOptimalSize(localLabel, shape, description);
        const circleFontSize = getOptimalFontSize(localLabel, shape);
        return (
          <div
            style={{
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              borderRadius: '50%',
              border: `${strokeWidth}px solid ${strokeColor}`,
              background: fillColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textColor,
              padding: `${Math.max(circleSize * 0.1, 6)}px`
            }}
            onDoubleClick={handleDoubleClick}
          >
            {renderTextContent(circleFontSize)}
          </div>
        );

      case 'diamond':
        const diamondSize = data.width || data.height || getOptimalSize(localLabel, shape, description);
        const diamondFontSize = getOptimalFontSize(localLabel, shape);
        const textAreaSize = diamondSize * 0.7; // Text area is 70% of diamond size
        return (
          <div
            style={{
              width: `${diamondSize}px`,
              height: `${diamondSize}px`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDoubleClick={handleDoubleClick}
            title={localLabel}
          >
            {/* SVG-based diamond shape for better export compatibility */}
            <svg
              width={diamondSize}
              height={diamondSize}
              viewBox={`0 0 ${diamondSize} ${diamondSize}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <polygon
                points={`${diamondSize/2},${diamondSize*0.1} ${diamondSize*0.9},${diamondSize/2} ${diamondSize/2},${diamondSize*0.9} ${diamondSize*0.1},${diamondSize/2}`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Text container - optimized for diamond shape */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: textColor,
                fontSize: `${diamondFontSize}px`,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                textAlign: 'center' as const,
                maxWidth: `${textAreaSize}px`,
                maxHeight: `${textAreaSize}px`,
                lineHeight: '1.2',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${Math.max(diamondSize * 0.05, 4)}px`,
                whiteSpace: 'normal'
              }}
            >
              {renderTextContent(diamondFontSize)}
            </div>
          </div>
        );

      case 'star':
        const starSize = data.width || data.height || getOptimalSize(localLabel, shape, description);
        const starFontSize = getOptimalFontSize(localLabel, shape);
        const starTextAreaSize = starSize * 0.6; // Star has irregular shape, smaller text area
        return (
          <div
            style={{
              width: `${starSize}px`,
              height: `${starSize}px`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {/* SVG-based star shape for better export compatibility */}
            <svg
              width={starSize}
              height={starSize}
              viewBox={`0 0 ${starSize} ${starSize}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <polygon
                points={`${starSize/2},${starSize*0.1} ${starSize*0.6},${starSize*0.35} ${starSize*0.875},${starSize*0.35} ${starSize*0.65},${starSize*0.525} ${starSize*0.75},${starSize*0.775} ${starSize/2},${starSize*0.6} ${starSize*0.25},${starSize*0.775} ${starSize*0.35},${starSize*0.525} ${starSize*0.125},${starSize*0.35} ${starSize*0.4},${starSize*0.35}`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Text container - optimized for star shape */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: textColor,
                fontSize: `${starFontSize}px`,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                textAlign: 'center' as const,
                maxWidth: `${starTextAreaSize}px`,
                maxHeight: `${starTextAreaSize}px`,
                lineHeight: '1.1',
                wordWrap: 'break-word',
                overflow: 'hidden',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${Math.max(starSize * 0.03, 2)}px`
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={localLabel}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: textColor,
                    fontSize: `${starFontSize}px`,
                    fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: `${starTextAreaSize * 0.9}px`,
                    lineHeight: '1.1'
                  }}
                  autoFocus
                />
              ) : (
                <span style={{ 
                  display: 'block',
                  wordWrap: 'break-word',
                  lineHeight: '1.1',
                  fontSize: 'inherit',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}>{localLabel}</span>
              )}
            </div>
          </div>
        );

      default: // rectangle
        const rectSize = data.width || data.height || getOptimalSize(localLabel, shape, description);
        const rectFontSize = getOptimalFontSize(localLabel, shape);
        return (
          <div
            style={{
              width: `${rectSize}px`,
              height: `${rectSize}px`,
              border: `${strokeWidth}px solid ${strokeColor}`,
              borderRadius: '8px',
              background: fillColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textColor,
              padding: `${Math.max(rectSize * 0.08, 6)}px`
            }}
            onDoubleClick={handleDoubleClick}
          >
            {renderTextContent(rectFontSize)}
          </div>
        );
    }
  };

  return (
    <div 
      style={getNodeStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize handles - only visible when selected */}
      <NodeResizer 
        color={strokeColor}
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        maxWidth={300}
        maxHeight={300}
        keepAspectRatio={shape === 'circle' || shape === 'star' || shape === 'diamond'}
        onResize={(_, resizeData) => {
          // Update node size in data for dynamic sizing
          if (data.onUpdate && id) {
            data.onUpdate(id, {
              width: Math.round(resizeData.width),
              height: Math.round(resizeData.height)
            });
          }
        }}
      />
      {/* Working handle structure from successful version */}
      {/* Top Handle */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      
      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      
      {/* Left Handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      
      {/* Right Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        isConnectable={true}
      />
      
      {renderShape()}
    </div>
  );
});

// Set display name for debugging
CustomNode.displayName = 'CustomNode';

// Dynamic sizing functions based on text content
const getOptimalSize = (text: string, shape: string, description?: string) => {
  const textLength = text.length;
  const descriptionLength = description ? description.length : 0;
  const totalTextLength = textLength + (descriptionLength * 0.7); // Description has less weight
  
  const baseSize = 80;
  const minSize = 80;
  const maxSize = 200; // Increased max size for resize capability
  
  // Calculate size based on total text length
  let calculatedSize = baseSize;
  
  if (totalTextLength > 15) {
    calculatedSize = baseSize + Math.min((totalTextLength - 15) * 2, maxSize - baseSize);
  }
  
  // Add extra space if there's description
  if (description) {
    calculatedSize += 20; // Extra space for description line
  }
  
  // Shape-specific adjustments
  switch (shape) {
    case 'diamond':
      // Diamonds need more space due to rotated shape - increased for better text fit
      calculatedSize = Math.max(calculatedSize * 1.5, 120);
      break;
    case 'circle':
      // Circles need a bit more space for readability
      calculatedSize = Math.max(calculatedSize * 1.1, baseSize);
      break;
    case 'star':
      // Stars have irregular shape, need more space
      calculatedSize = Math.max(calculatedSize * 1.15, baseSize);
      break;
    default:
      // Rectangles are most efficient
      calculatedSize = Math.max(calculatedSize, minSize);
  }
  
  return Math.min(calculatedSize, maxSize);
};

const getOptimalFontSize = (text: string, shape: string = 'rectangle') => {
  const textLength = text.length;
  const baseFontSize = 14;
  
  // Diamonds need smaller text earlier due to rotated shape
  if (shape === 'diamond') {
    if (textLength <= 8) return baseFontSize;
    if (textLength <= 15) return Math.max(baseFontSize - 1, 11);
    if (textLength <= 25) return Math.max(baseFontSize - 2, 10);
    if (textLength <= 35) return Math.max(baseFontSize - 3, 9);
    return Math.max(baseFontSize - 4, 8);
  }
  
  // Other shapes
  if (textLength <= 10) return baseFontSize;
  if (textLength <= 20) return Math.max(baseFontSize - 1, 12);
  if (textLength <= 30) return Math.max(baseFontSize - 2, 11);
  if (textLength <= 40) return Math.max(baseFontSize - 3, 10);
  
  return Math.max(baseFontSize - 4, 9);
};


// Node types - defined outside component with stable reference
const nodeTypes: NodeTypes = {
  custom: CustomNode
};

// Edge types - ensure React Flow can render all edge types
const edgeTypes = {
  // Use default edge types from React Flow
};

// Initial nodes with proper default colors - matching expected flow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 200, y: 80 },
    data: {
      label: 'Start Your Secure Design Journey',
      shape: 'rectangle',
      fillColor: '#2563eb',
      strokeColor: '#1d4ed8',
      strokeWidth: 2,
      textColor: '#fff',
      onLabelChange: () => {},
      onUpdate: () => {}
    }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 200, y: 200 },
    data: {
      label: 'Select Template',
      shape: 'rectangle',
      fillColor: '#3b82f6',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      textColor: '#fff',
      onLabelChange: () => {},
      onUpdate: () => {}
    }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 200, y: 320 },
    data: {
      label: 'Customize Design',
      shape: 'rectangle',
      fillColor: '#60a5fa',
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      textColor: '#fff',
      onLabelChange: () => {},
      onUpdate: () => {}
    }
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 200, y: 440 },
    data: {
      label: 'Export & Share',
      shape: 'rectangle',
      fillColor: '#93c5fd',
      strokeColor: '#60a5fa',
      strokeWidth: 2,
      textColor: '#fff',
      onLabelChange: () => {},
      onUpdate: () => {}
    }
  }
];


const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target',
    animated: true,
    style: { stroke: '#1e293b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1e293b'
    }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target',
    style: { stroke: '#1e293b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1e293b'
    }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target',
    style: { stroke: '#1e293b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1e293b'
    }
  }
];

interface InteractiveMermaidEditorProps {
  onMermaidCodeChange?: (code: string) => void;
  onReactFlowInstanceChange?: (instance: any) => void;
  canvasBackground?: string;
  onCanvasBackgroundChange?: (color: string) => void;
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  onSetNodesAndEdges?: (setNodes: any, setEdges: any) => void;
}

export const InteractiveMermaidEditor: React.FC<InteractiveMermaidEditorProps> = ({
  onMermaidCodeChange,
  onReactFlowInstanceChange,
  canvasBackground = '#f8fafc',
  onCanvasBackgroundChange,
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onSetNodesAndEdges
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState(initialEdges);
  
  // Debug edge changes
  React.useEffect(() => {
    console.log('Edges state changed:', edges.length, 'edges');
    edges.forEach((edge, index) => {
      console.log(`Edge ${index + 1}:`, edge.id, `${edge.source} -> ${edge.target}`);
    });
  }, [edges]);

  // Enhanced edge change handler to prevent unwanted modifications
  const onEdgesChange = useCallback((changes: any) => {
    // Filter out edge update changes that could cause splitting
    const filteredChanges = changes.filter((change: any) => {
      // Allow only edge removal and selection changes, prevent position updates
      if (change.type === 'remove' || change.type === 'select') {
        return true;
      }
      // Block any other edge modifications that could cause splitting
      return false;
    });
    
    originalOnEdgesChange(filteredChanges);
  }, [originalOnEdgesChange]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle' | 'circle' | 'diamond' | 'star' | 'text'>('select');
  const [nodeIdCounter, setNodeIdCounter] = useState(5);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showEdgePropertiesPanel, setShowEdgePropertiesPanel] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<{x: number[], y: number[]}>({x: [], y: []});

  // Undo/Redo functionality
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState: saveUndoState
  } = useReactFlowUndoRedo(nodes, edges, setNodes, setEdges);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Ref for the palette button to position the color picker
  const paletteButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate alignment guides based on other nodes
  const calculateAlignmentGuides = useCallback((draggedNode: Node, allNodes: Node[]) => {
    const threshold = 10; // Snap distance in pixels
    const guides: { x: number[], y: number[] } = { x: [], y: [] };
    
    // Get positions of other nodes (excluding the dragged one)
    const otherNodes = allNodes.filter(node => node.id !== draggedNode.id);
    
    otherNodes.forEach(node => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeCenterX = nodeX + 40; // Assuming 80px node width, center is +40
      const nodeCenterY = nodeY + 40; // Assuming 80px node height, center is +40
      
      const draggedX = draggedNode.position.x;
      const draggedY = draggedNode.position.y;
      const draggedCenterX = draggedX + 40;
      const draggedCenterY = draggedY + 40;
      
      // Check for X-axis alignment (vertical lines)
      if (Math.abs(nodeX - draggedX) < threshold) guides.x.push(nodeX);
      if (Math.abs(nodeCenterX - draggedCenterX) < threshold) guides.x.push(nodeCenterX);
      
      // Check for Y-axis alignment (horizontal lines) 
      if (Math.abs(nodeY - draggedY) < threshold) guides.y.push(nodeY);
      if (Math.abs(nodeCenterY - draggedCenterY) < threshold) guides.y.push(nodeCenterY);
    });
    
    // Remove duplicates and return
    return {
      x: [...new Set(guides.x)],
      y: [...new Set(guides.y)]
    };
  }, []);

  // Handle node drag start
  const onNodeDragStart = useCallback((_: any, _node: Node) => {
    setIsDragging(true);
  }, []);

  // Handle node drag
  const onNodeDrag = useCallback((_: any, node: Node) => {
    if (!isDragging) return;
    
    const guides = calculateAlignmentGuides(node, nodes);
    setAlignmentGuides(guides);
  }, [isDragging, nodes, calculateAlignmentGuides]);

  // Handle node drag stop
  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
    setAlignmentGuides({x: [], y: []});
  }, []);

  // Generate Mermaid code from current nodes and edges following official syntax
  const generateMermaidCode = useCallback(() => {
    let code = 'flowchart TD\n';

    // Add nodes with their labels using proper Mermaid syntax
    nodes.forEach(node => {
      const label = node.data.label || 'Node';
      const shape = node.data.shape || 'rectangle';

      // Following official Mermaid syntax from documentation
      switch (shape) {
        case 'circle':
          code += `    ${node.id}((${label}))\n`;
          break;
        case 'diamond':
          code += `    ${node.id}{${label}}\n`;
          break;
        case 'rectangle':
        default:
          code += `    ${node.id}[${label}]\n`;
      }
    });

    // Add edges with proper arrow syntax
    edges.forEach(edge => {
      const label = edge.label ? ` -- ${edge.label} -->` : ' -->';
      code += `    ${edge.source}${label} ${edge.target}\n`;
    });

    // Add professional styling following Mermaid best practices
    code += '\n    %% Professional Styling\n';
    nodes.forEach(node => {
      const shape = node.data.shape || 'rectangle';
      switch (shape) {
        case 'circle':
          code += `    style ${node.id} fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff\n`;
          break;
        case 'diamond':
          code += `    style ${node.id} fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff\n`;
          break;
        default:
          code += `    style ${node.id} fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff\n`;
      }
    });

    return code;
  }, [nodes, edges]);

  // Update Mermaid code when nodes or edges change
  React.useEffect(() => {
    const code = generateMermaidCode();
    onMermaidCodeChange?.(code);
  }, [nodes, edges, generateMermaidCode, onMermaidCodeChange]);

  // Auto-save state for undo/redo when nodes or edges change
  React.useEffect(() => {
    // Debounce the save to avoid saving too frequently during rapid changes
    const timeoutId = setTimeout(() => {
      saveUndoState();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, saveUndoState]);

  // Handle new connections with improved validation
  const onConnect = useCallback(
    (params: Connection) => {
      // Additional validation to prevent unwanted connections
      if (!params.source || !params.target || params.source === params.target) {
        return;
      }

      // Let user control connection direction based on drag direction
      // If they dragged from a target handle, swap source and target to maintain direction
      if (params.sourceHandle && params.sourceHandle.includes('-target')) {
        // Swap source/target to maintain user's intended direction
        const originalSource = params.source;
        const originalSourceHandle = params.sourceHandle;
        params.source = params.target;
        params.sourceHandle = params.targetHandle?.replace('-target', '-source') || 'right-source';
        params.target = originalSource;
        params.targetHandle = originalSourceHandle;
      }

      // Ensure handles are valid types
      if (params.sourceHandle && params.sourceHandle.includes('-target')) {
        params.sourceHandle = params.sourceHandle.replace('-target', '-source');
      }
      if (params.targetHandle && params.targetHandle.includes('-source')) {
        params.targetHandle = params.targetHandle.replace('-source', '-target');
      }

      // Check for existing connections between the same handles
      const existingConnection = edges.find(edge => 
        edge.source === params.source && 
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
      );

      if (existingConnection) {
        return; // Prevent duplicate connections
      }

      // Get the appropriate edge color based on auto-adjust setting
      let edgeColor = '#1e293b'; // Default color
      if (autoAdjustEnabled) {
        const edgeColors = getAutoAdjustedEdgeColors(canvasBackground);
        edgeColor = edgeColors.stroke;
      }

      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor // Ensure arrow color matches line color
        },
        updatable: false, // Prevent edge updates that could cause splitting
        focusable: true,
        selectable: true
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      setTimeout(() => saveUndoState(), 100);
    },
    [setEdges, saveUndoState, autoAdjustEnabled, canvasBackground, edges]
  );

  // Handle node label changes
  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
    // Trigger undo state save after a short delay
    setTimeout(() => saveUndoState(), 100);
  }, [setNodes, saveUndoState]);

  // Update node properties
  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
    // Trigger undo state save after a short delay
    setTimeout(() => saveUndoState(), 100);
  }, [setNodes, saveUndoState]);

  // Add new node with proper default colors (light background, colored borders)
  const addNode = useCallback((shape: 'rectangle' | 'circle' | 'diamond' | 'star' | 'text') => {
    let colors;

    if (autoAdjustEnabled) {
      // Use smart gradient-aware auto-adjusted colors for new nodes
      const smartColors = getSmartGradientAdjustment(canvasBackground);
      const optimalColors = getOptimalColors(canvasBackground);
      colors = {
        fill: shape === 'text' ? 'transparent' : optimalColors.shapeFill,
        stroke: shape === 'text' ? 'transparent' : (() => {
          switch (shape) {
            case 'rectangle': return optimalColors.rectangleBorder;
            case 'circle': return optimalColors.circleBorder;
            case 'diamond': return optimalColors.diamondBorder;
            case 'star': return optimalColors.starBorder;
            default: return optimalColors.rectangleBorder;
          }
        })(),
        text: optimalColors.textColor,
        width: (smartColors as any).borderWidth || 2
      };
    } else {
      // Use default colors
      const defaultColors = {
        rectangle: { fill: '#f8fafc', stroke: '#2563eb' },
        circle: { fill: '#f8fafc', stroke: '#3b82f6' },
        diamond: { fill: '#f8fafc', stroke: '#f59e0b' },
        star: { fill: '#f8fafc', stroke: '#8b5cf6' },
        text: { fill: 'transparent', stroke: 'transparent' }
      };
      colors = {
        fill: defaultColors[shape].fill,
        stroke: defaultColors[shape].stroke,
        text: '#1e293b'
      };
    }

    // Calculate position within canvas bounds (accounting for node size)
    const nodeSize = 80;
    const canvasWidth = 920; // From nodeExtent
    const canvasHeight = 620; // From nodeExtent
    const margin = 50; // Margin from edges
    
    const maxX = canvasWidth - nodeSize - margin;
    const maxY = canvasHeight - nodeSize - margin;
    const minX = margin;
    const minY = margin;
    
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: 'custom',
      position: { x, y },
      data: {
        label: `New ${shape}`,
        shape,
        fillColor: colors.fill,
        strokeColor: colors.stroke,
        strokeWidth: colors.width || 2,
        textColor: colors.text,
        onLabelChange: handleNodeLabelChange,
        onUpdate: handleNodeUpdate
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodeIdCounter, setNodes, handleNodeLabelChange, handleNodeUpdate, autoAdjustEnabled, canvasBackground]);

  // Handle node selection
  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowPropertiesPanel(true);
    setShowEdgePropertiesPanel(false);
  }, []);

  // Handle edge selection
  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowEdgePropertiesPanel(true);
    setShowPropertiesPanel(false);
  }, []);

  // Handle canvas click (deselect all)
  const handleCanvasClick = useCallback((event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (target && target.classList && target.classList.contains('react-flow__pane')) {
      setSelectedNode(null);
      setSelectedEdge(null);
      setShowPropertiesPanel(false);
      setShowEdgePropertiesPanel(false);
    }
  }, []);

  // Delete node
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
    setShowPropertiesPanel(false);
  }, [setNodes, setEdges]);

  // Duplicate node
  const handleNodeDuplicate = useCallback((nodeId: string) => {
    const nodeToClone = nodes.find(n => n.id === nodeId);
    if (!nodeToClone) return;

    const newNode: Node = {
      ...nodeToClone,
      id: nodeIdCounter.toString(),
      position: {
        x: nodeToClone.position.x + 100,
        y: nodeToClone.position.y + 50
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodes, nodeIdCounter, setNodes]);

  // Update edge properties
  const handleEdgeUpdate = useCallback((edgeId: string, updates: any) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, ...updates }
          : edge
      )
    );
  }, [setEdges]);

  // Delete edge
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
    setShowEdgePropertiesPanel(false);

  }, [setEdges]);

  // Duplicate edge
  const handleEdgeDuplicate = useCallback((edgeId: string) => {
    const edgeToClone = edges.find(e => e.id === edgeId);
    if (!edgeToClone) return;

    const newEdge: Edge = {
      ...edgeToClone,
      id: `e${Date.now()}`, // Simple unique ID
    };

    setEdges((eds) => [...eds, newEdge]);
  }, [edges, setEdges]);

  // Refactor handleAIGenerate to support conversation and clarification
  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const aiService = EnhancedMermaidAI.getInstance();
      
      // Set current diagram context if we have existing content
      if (nodes.length > 0) {
        aiService.setCurrentDiagramFromNodes(nodes, edges);
      }
      
      let generatedDiagram;
      try {
        generatedDiagram = await aiService.generateProcessFlow(aiPrompt.trim());
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('I need more information')) {
          // Show clarification request in the message area
          setAiPrompt(error.message.replace('I need more information: ', ''));
          setIsGenerating(false);
          return;
        } else {
          throw error;
        }
      }
      // Convert AI-generated steps to React Flow nodes and edges
      const generatedNodes: Node[] = [];
      const generatedEdges: Edge[] = [];
      
      // Check if this is an additive operation
      const isAdditive = nodes.length > 0 && generatedDiagram.isAdditive;
      generatedDiagram.steps.forEach((step) => {
        const nodeId = `ai-${step.id}`;
        let shape: 'rectangle' | 'circle' | 'diamond' | 'star' = 'rectangle';
        let fillColor = '#f8fafc';
        let strokeColor = '#2563eb';
        switch (step.type) {
          case 'start':
            shape = 'circle';
            fillColor = '#e3f2fd';
            strokeColor = '#1976d2';
            break;
          case 'end':
            shape = 'circle';
            fillColor = '#e8f5e8';
            strokeColor = '#4caf50';
            break;
          case 'decision':
            shape = 'diamond';
            fillColor = '#fff3e0';
            strokeColor = '#f57c00';
            break;
          case 'process':
          case 'subprocess':
            shape = 'rectangle';
            fillColor = '#f8fafc';
            strokeColor = '#2563eb';
            break;
          case 'parallel':
            shape = 'star';
            fillColor = '#faf5ff';
            strokeColor = '#8b5cf6';
            break;
        }
        generatedNodes.push({
          id: nodeId,
          type: 'custom',
          position: step.position,
          data: {
            label: step.label,
            shape,
            fillColor,
            strokeColor,
            strokeWidth: 2,
            textColor: '#1e293b',
            onLabelChange: handleNodeLabelChange,
            onUpdate: handleNodeUpdate
          }
        });
      });
      generatedDiagram.steps.forEach((step) => {
        step.connections.forEach((targetId) => {
          const sourceId = `ai-${step.id}`;
          const targetNodeId = `ai-${targetId}`;
          
          // Smart handle selection based on node positions
          const sourceNode = generatedDiagram.steps.find(s => s.id === step.id);
          const targetNode = generatedDiagram.steps.find(s => s.id === targetId);
          
          let sourceHandle = 'bottom-source';
          let targetHandle = 'top-target';
          
          if (sourceNode && targetNode) {
            // If target is to the left, use left/right handles
            if (targetNode.position.x < sourceNode.position.x) {
              sourceHandle = 'left-source';
              targetHandle = 'right-target';
            }
            // If target is to the right, use right/left handles  
            else if (targetNode.position.x > sourceNode.position.x) {
              sourceHandle = 'right-source';
              targetHandle = 'left-target';
            }
            // Otherwise use default bottom/top for vertical flows
          }
          
          generatedEdges.push({
            id: `ai-edge-${sourceId}-${targetNodeId}`,
            source: sourceId,
            target: targetNodeId,
            sourceHandle,
            targetHandle,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#1976d2',
              strokeWidth: 2
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#1976d2'
            }
          });
        });
      });
      
      // Debug logging for generated edges
      console.log('Generated edges:', generatedEdges.length, generatedEdges);
      console.log('Current edges before update:', edges.length, edges);
      
      // Only replace if not additive, otherwise add to existing
      if (isAdditive) {
        console.log('Adding to existing nodes and edges (additive mode)');
        setNodes((prevNodes) => [...prevNodes, ...generatedNodes]);
        setEdges((prevEdges) => {
          const newEdges = [...prevEdges, ...generatedEdges];
          console.log('New edges array after additive update:', newEdges.length, newEdges);
          return newEdges;
        });
      } else {
        console.log('Replacing all nodes and edges (non-additive mode)');
        setNodes(generatedNodes);
        setEdges(generatedEdges);
      }
      
      onMermaidCodeChange?.(generatedDiagram.mermaidCode);
      setAiPrompt('');
    } catch (error) {
      setAiPrompt('AI generation failed. Please try again.');
      // fallback logic omitted for brevity
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, onMermaidCodeChange, setNodes, setEdges, handleNodeLabelChange, handleNodeUpdate]);


  // Update existing nodes with label change handler and update handler (like working version)
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { 
          ...node.data, 
          onLabelChange: handleNodeLabelChange,
          onUpdate: handleNodeUpdate
        }
      }))
    );
  }, [handleNodeLabelChange, handleNodeUpdate, setNodes]);

  // Notify parent when nodes change
  React.useEffect(() => {
    onNodesChangeCallback?.(nodes);
  }, [nodes, onNodesChangeCallback]);

  // Notify parent when edges change
  React.useEffect(() => {
    onEdgesChangeCallback?.(edges);
  }, [edges, onEdgesChangeCallback]);

  // Expose setNodes and setEdges functions to parent (only once)
  React.useEffect(() => {
    if (onSetNodesAndEdges) {
      onSetNodesAndEdges(setNodes, setEdges);
    }
  }, [onSetNodesAndEdges]); // Only depend on the callback, not the setters


  return (
    <>
      {/* CSS for subtle alignment guides */}
      <style>{`
        .alignment-guide {
          transition: opacity 0.2s ease;
        }
      `}</style>
      
      <div 
        className="react-flow-wrapper"
        style={{
          height: '100%', // Fill the flex parent container
          width: '100%',   
          minHeight: '100%', // Match height to ensure consistency
          minWidth: '800px',  
          background: MermaidDesignTokens.colors.secondary.gradient,
          position: 'relative',
          overflow: 'hidden' // Prevent any overflow that creates extra space
        }}
      >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handleCanvasClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 1.2 }}
        proOptions={{ hideAttribution: true }}
        style={{ 
          background: canvasBackground,
          width: '100%',
          height: '100%'
        }}
        snapToGrid={false}
        snapGrid={[1, 1]}
        connectionRadius={30}
        connectOnClick={true}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        edgesUpdatable={false}
        edgesFocusable={true}
        elevateEdgesOnSelect={true}
        // Add canvas bounds to prevent nodes from being dragged outside
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        // Enhanced zoom capabilities - allow much more zoom out
        minZoom={0.05} // Allow zooming out to 5% (was default 0.5)
        maxZoom={4} // Allow zooming in to 400% (was default 2)
        // Much more generous bounds to allow for large diagrams
        translateExtent={[[-5000, -5000], [10000, 8000]]} // Massive bounds for panning
        nodeExtent={[[-4000, -4000], [8000, 6000]]} // Allow nodes to be placed in a much larger area
        isValidConnection={(connection) => {
          // Simplified validation - only prevent self-connections
          if (connection.source === connection.target) {
            console.log('🚫 Edge rejected: Self-connection');
            return false;
          }
          
          console.log('✅ Edge accepted:', `${connection.source} -> ${connection.target}`);
          return true;
        }}
        defaultEdgeOptions={(() => {
          if (autoAdjustEnabled) {
            const edgeColors = getAutoAdjustedEdgeColors(canvasBackground);
            return {
              type: 'smoothstep',
              style: { stroke: edgeColors.stroke, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: edgeColors.stroke }
            };
          }
          return {
            type: 'smoothstep',
            style: { stroke: '#1e293b', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
          };
        })()}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          onReactFlowInstanceChange?.(instance);
          // Set a more reasonable default zoom
          setTimeout(() => {
            instance.fitView({ padding: 0.3, maxZoom: 0.8 });
          }, 50);
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={MermaidDesignTokens.colors.glass.border}
        />

        <Controls
          style={{
            background: MermaidDesignTokens.colors.glass.primary,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
            borderRadius: MermaidDesignTokens.borderRadius.lg
          }}
        />

        <MiniMap
          style={{
            background: MermaidDesignTokens.colors.glass.primary,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
            borderRadius: MermaidDesignTokens.borderRadius.lg
          }}
          nodeColor={MermaidDesignTokens.colors.accent.blue}
        />

        {/* Floating Toolbar - Center Top like Design Folder */}
        <Panel position="top-center">
          <GlassPanel variant="elevated" padding={3} style={{
            display: 'flex',
            alignItems: 'center',
            gap: MermaidDesignTokens.spacing[3],
            borderRadius: MermaidDesignTokens.borderRadius['2xl'],
            boxShadow: MermaidDesignTokens.shadows.glass.xl
          }}>
            {/* Shape Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[1] }}>
              <GlassButton
                variant={selectedTool === 'rectangle' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Square size={18} />}
                onClick={() => {
                  setSelectedTool('rectangle');
                  addNode('rectangle');
                }}
                title="Add Rectangle"
              />
              <GlassButton
                variant={selectedTool === 'circle' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Circle size={18} />}
                onClick={() => {
                  setSelectedTool('circle');
                  addNode('circle');
                }}
                title="Add Circle"
              />
              <GlassButton
                variant={selectedTool === 'diamond' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Diamond size={18} />}
                onClick={() => {
                  setSelectedTool('diamond');
                  addNode('diamond');
                }}
                title="Add Diamond"
              />
              <GlassButton
                variant={selectedTool === 'star' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Star size={18} />}
                onClick={() => {
                  setSelectedTool('star');
                  addNode('star');
                }}
                title="Add Star"
              />
              <GlassButton
                variant={selectedTool === 'text' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Type size={18} />}
                onClick={() => {
                  setSelectedTool('text');
                  addNode('text');
                }}
                title="Add Text"
              />
            </div>

            <div style={{
              width: '1px',
              height: '32px',
              background: MermaidDesignTokens.colors.glass.border
            }} />

            {/* Edit Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[1] }}>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Undo size={18} />}
                onClick={() => {
                  undo();
                  saveUndoState(); // Save state after undo
                }}
                disabled={!canUndo}
                title="Undo"
                style={{ opacity: canUndo ? 1 : 0.5 }}
              />
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Redo size={18} />}
                onClick={() => {
                  redo();
                  saveUndoState(); // Save state after redo
                }}
                disabled={!canRedo}
                title="Redo"
                style={{ opacity: canRedo ? 1 : 0.5 }}
              />
              <GlassButton
                ref={paletteButtonRef}
                variant="ghost"
                size="sm"
                icon={<Palette size={18} />}
                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                title="Change Background Color"
              />
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Download size={18} />}
                onClick={() => setShowExportModal(true)}
                title="Export Diagram"
              />
            </div>
          </GlassPanel>
        </Panel>

        {/* Lightweight AI Input - Bottom Center */}
        <Panel position="bottom-center">
          <GlassPanel variant="elevated" padding={3} style={{
            display: 'flex',
            alignItems: 'center',
            gap: MermaidDesignTokens.spacing[3],
            borderRadius: MermaidDesignTokens.borderRadius['2xl'],
            boxShadow: MermaidDesignTokens.shadows.glass.xl,
            minWidth: '500px',
            maxWidth: '700px'
          }}>
            {/* AI Icon */}
            <Brain size={18} color={MermaidDesignTokens.colors.accent.blue} />

            {/* AI Input Field */}
            <GlassInput
              placeholder="Describe your diagram and let AI create it..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              style={{
                flex: 1,
                background: MermaidDesignTokens.colors.glass.secondary,
                border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                fontSize: MermaidDesignTokens.typography.fontSize.sm
              }}
            />

            {/* Generate Button */}
            <GlassButton
              variant="primary"
              size="sm"
              icon={isGenerating ? <div className="animate-spin">⟳</div> : <Sparkles size={16} />}
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
              glow
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </GlassButton>
          </GlassPanel>
        </Panel>
      </ReactFlow>

      {/* Alignment Guides Overlay - Fixed positioning and subtle styling */}
      {isDragging && reactFlowInstance && (alignmentGuides.x.length > 0 || alignmentGuides.y.length > 0) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          {/* Vertical alignment guides */}
          {alignmentGuides.x.map((x, index) => {
            const viewport = reactFlowInstance.getViewport();
            const screenX = x * viewport.zoom + viewport.x;
            return (
              <div
                key={`v-guide-${index}`}
                style={{
                  position: 'absolute',
                  left: `${screenX}px`,
                  top: 0,
                  width: '1px',
                  height: '100%',
                  backgroundColor: '#60a5fa',
                  opacity: 0.4,
                  boxShadow: '0 0 2px rgba(96, 165, 250, 0.3)',
                  transition: 'opacity 0.2s ease'
                }}
              />
            );
          })}
          
          {/* Horizontal alignment guides */}
          {alignmentGuides.y.map((y, index) => {
            const viewport = reactFlowInstance.getViewport();
            const screenY = y * viewport.zoom + viewport.y;
            return (
              <div
                key={`h-guide-${index}`}
                style={{
                  position: 'absolute',
                  top: `${screenY}px`,
                  left: 0,
                  height: '1px',
                  width: '100%',
                  backgroundColor: '#60a5fa',
                  opacity: 0.4,
                  boxShadow: '0 0 2px rgba(96, 165, 250, 0.3)',
                  transition: 'opacity 0.2s ease'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Node Properties Panel */}
      <NodePropertiesPanel
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={handleNodeDelete}
        onNodeDuplicate={handleNodeDuplicate}
        onApplyToAll={(updates) => {
          // Apply updates to all nodes
          setNodes((nds) => nds.map(node => ({
            ...node,
            data: { ...node.data, ...updates }
          })));
        }}
        isVisible={showPropertiesPanel}
        onClose={() => setShowPropertiesPanel(false)}
      />

      {/* Edge Properties Panel */}
      <EdgePropertiesPanel
        selectedEdge={selectedEdge}
        onEdgeUpdate={handleEdgeUpdate}
        onEdgeDelete={handleEdgeDelete}
        onEdgeDuplicate={handleEdgeDuplicate}
        onApplyToAll={(updates) => {
          // Apply updates to all edges
          setEdges((eds) => eds.map(edge => ({
            ...edge,
            ...updates,
            style: { ...edge.style, ...updates.style },
            markerEnd: updates.markerEnd.type ? updates.markerEnd : edge.markerEnd
          })));
        }}
        isVisible={showEdgePropertiesPanel}
        onClose={() => setShowEdgePropertiesPanel(false)}
      />

      {/* Background Color Picker */}
      <BackgroundColorPicker
        isVisible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        onColorChange={(color) => {
          onCanvasBackgroundChange?.(color);

          // Apply auto-adjust if enabled - but only to new nodes or when explicitly requested
          if (autoAdjustEnabled) {
            // Ask user if they want to apply auto-adjust to existing content
            const applyToExisting = window.confirm(
              'Auto-adjust is enabled. Would you like to apply optimal colors to existing shapes and connectors for this background?'
            );

            if (applyToExisting) {
              const adjustedNodes = applyAutoAdjustedColors(nodes, color);
              setNodes(adjustedNodes);

              // Update edge colors
              const edgeColors = getAutoAdjustedEdgeColors(color);
              setEdges((eds) => eds.map(edge => ({
                ...edge,
                style: { ...ensureObject(edge.style), stroke: edgeColors.stroke },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: edgeColors.markerColor
                }
              })));
            }
          }

          // Save undo state for background change
          setTimeout(() => saveUndoState(), 100);
          setShowBackgroundPicker(false);
        }}
        currentColor={canvasBackground}
        triggerButtonRef={paletteButtonRef}
        autoAdjustEnabled={autoAdjustEnabled}
        onAutoAdjustChange={setAutoAdjustEnabled}
      />

      {/* Save Export Modal */}
      <SaveExportModal
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        diagramText={generateMermaidCode()}
        canvasBackground={canvasBackground}
        reactFlowInstance={reactFlowInstance}
      />

      </div>
    </>
  );
};

export default InteractiveMermaidEditor;
