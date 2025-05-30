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
  ConnectionMode
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
import { applyAutoAdjustedColors, getAutoAdjustedEdgeColors, getOptimalColors } from '../../utils/colorUtils';
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

  // Determine if handles should be visible
  const showHandles = selected || isHovered;

  const {
    shape = 'rectangle',
    fillColor = '#f8fafc',
    strokeColor = '#2563eb',
    strokeWidth = 2,
    textColor = '#1e293b'
  } = data;

  const getNodeStyle = () => {
    const baseStyle = {
      width: '80px',
      height: '80px',
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
        return (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `${strokeWidth}px solid ${strokeColor}`,
              background: fillColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textColor,
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              textAlign: 'center' as const,
              padding: '6px', // Reduced padding for more text space
              lineHeight: '1.1' // Tighter line height
            }}
            onDoubleClick={handleDoubleClick}
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
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  textAlign: 'center',
                  width: '100%'
                }}
                autoFocus
              />
            ) : (
              <span style={{ 
                lineHeight: '1.1',
                wordWrap: 'break-word'
              }}>{localLabel}</span>
            )}
          </div>
        );

      case 'diamond':
        return (
          <div
            style={{
              width: '80px',
              height: '80px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {/* SVG-based diamond shape for better export compatibility */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <polygon
                points="40,10 70,40 40,70 10,40"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Text container - properly centered */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: textColor,
                fontSize: MermaidDesignTokens.typography.fontSize.sm, // Increased from xs
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                textAlign: 'center' as const,
                maxWidth: '50px', // Increased from 40px
                lineHeight: '1.1', // Tighter line height
                wordWrap: 'break-word',
                overflow: 'hidden',
                zIndex: 1
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
                    fontSize: MermaidDesignTokens.typography.fontSize.sm,
                    fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                    textAlign: 'center',
                    width: '100%'
                  }}
                  autoFocus
                />
              ) : (
                <span style={{ 
                  display: 'block',
                  wordWrap: 'break-word',
                  lineHeight: '1.1'
                }}>{localLabel}</span>
              )}
            </div>
          </div>
        );

      case 'star':
        return (
          <div
            style={{
              width: '80px',
              height: '80px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {/* SVG-based star shape for better export compatibility */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <polygon
                points="40,8 48,28 70,28 52,42 60,62 40,48 20,62 28,42 10,28 32,28"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Text container */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: textColor,
                fontSize: MermaidDesignTokens.typography.fontSize.sm, // Increased from xs
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                textAlign: 'center' as const,
                maxWidth: '55px', // Increased from 45px
                lineHeight: '1.1', // Tighter line height
                wordWrap: 'break-word',
                overflow: 'hidden',
                zIndex: 1
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
                    fontSize: MermaidDesignTokens.typography.fontSize.sm,
                    fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                    textAlign: 'center',
                    width: '100%'
                  }}
                  autoFocus
                />
              ) : (
                <span style={{ 
                  display: 'block',
                  wordWrap: 'break-word',
                  lineHeight: '1.1'
                }}>{localLabel}</span>
              )}
            </div>
          </div>
        );

      default: // rectangle
        return (
          <div
            style={{
              width: '80px',
              height: '80px',
              border: `${strokeWidth}px solid ${strokeColor}`,
              borderRadius: '8px',
              background: fillColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textColor,
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              textAlign: 'center' as const,
              padding: '6px', // Reduced padding for more text space
              lineHeight: '1.1' // Tighter line height
            }}
            onDoubleClick={handleDoubleClick}
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
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  textAlign: 'center',
                  width: '100%'
                }}
                autoFocus
              />
            ) : (
              <span style={{ 
                lineHeight: '1.1',
                wordWrap: 'break-word'
              }}>{localLabel}</span>
            )}
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
      {/* Single handles per side that can act as both source and target */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        isConnectable={showHandles}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        isConnectable={showHandles}
      />
      
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        isConnectable={showHandles}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: strokeColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: showHandles ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        isConnectable={showHandles}
      />
      
      {renderShape()}
    </div>
  );
});

// Set display name for debugging
CustomNode.displayName = 'CustomNode';

// Node types - defined outside component with stable reference
const nodeTypes: NodeTypes = {
  custom: CustomNode
};

// Initial nodes with proper default colors
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 200, y: 80 },
    data: {
      label: 'Start Process',
      shape: 'rectangle',
      fillColor: '#f8fafc',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      textColor: '#1e293b',
      onLabelChange: () => {}
    }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 200, y: 180 },
    data: {
      label: 'Decision Point',
      shape: 'diamond',
      fillColor: '#f8fafc',
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      textColor: '#1e293b',
      onLabelChange: () => {}
    }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 100, y: 280 },
    data: {
      label: 'Process A',
      shape: 'rectangle',
      fillColor: '#f8fafc',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      textColor: '#1e293b',
      onLabelChange: () => {}
    }
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 300, y: 280 },
    data: {
      label: 'Process B',
      shape: 'rectangle',
      fillColor: '#f8fafc',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      textColor: '#1e293b',
      onLabelChange: () => {}
    }
  }
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    sourceHandle: 'bottom',
    targetHandle: 'top',
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
    sourceHandle: 'left',
    targetHandle: 'top',
    label: 'Yes',
    style: { stroke: '#1e293b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1e293b'
    }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    sourceHandle: 'right',
    targetHandle: 'top',
    label: 'No',
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
}

export const InteractiveMermaidEditor: React.FC<InteractiveMermaidEditorProps> = ({
  onMermaidCodeChange,
  onReactFlowInstanceChange,
  canvasBackground = '#f8fafc',
  onCanvasBackgroundChange
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
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
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      // Save undo state after connection
      setTimeout(() => saveUndoState(), 100);
    },
    [setEdges, saveUndoState, autoAdjustEnabled, canvasBackground]
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

  // Add new node with proper default colors (light background, colored borders)
  const addNode = useCallback((shape: 'rectangle' | 'circle' | 'diamond' | 'star' | 'text') => {
    let colors;

    if (autoAdjustEnabled) {
      // Use auto-adjusted colors for new nodes
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
        text: optimalColors.textColor
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
        strokeWidth: 2,
        textColor: colors.text,
        onLabelChange: handleNodeLabelChange
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodeIdCounter, setNodes, handleNodeLabelChange, autoAdjustEnabled, canvasBackground]);

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
      // Clear existing nodes and edges for fresh diagram
      setNodes([]);
      setEdges([]);
      // Convert AI-generated steps to React Flow nodes and edges
      const generatedNodes: Node[] = [];
      const generatedEdges: Edge[] = [];
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
            onLabelChange: handleNodeLabelChange
          }
        });
      });
      generatedDiagram.steps.forEach((step) => {
        step.connections.forEach((targetId) => {
          const sourceId = `ai-${step.id}`;
          const targetNodeId = `ai-${targetId}`;
          generatedEdges.push({
            id: `ai-edge-${sourceId}-${targetNodeId}`,
            source: sourceId,
            target: targetNodeId,
            type: 'smoothstep',
            animated: true,
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
      setNodes(generatedNodes);
      setEdges(generatedEdges);
      onMermaidCodeChange?.(generatedDiagram.mermaidCode);
      setAiPrompt('');
    } catch (error) {
      setAiPrompt('AI generation failed. Please try again.');
      // fallback logic omitted for brevity
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, onMermaidCodeChange, setNodes, setEdges, handleNodeLabelChange]);

  // Update existing nodes with label change handler
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onLabelChange: handleNodeLabelChange }
      }))
    );
  }, [handleNodeLabelChange, setNodes]);

  return (
    <div 
      className="react-flow-wrapper"
      style={{
        height: '600px', // Explicit height
        width: '100%',   // Explicit width
        minHeight: '600px', // Minimum height
        minWidth: '800px',  // Minimum width
        background: MermaidDesignTokens.colors.secondary.gradient,
        position: 'relative'
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
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ 
          background: canvasBackground,
          width: '100%',
          height: '100%'
        }}
        snapToGrid={false}
        snapGrid={[1, 1]}
        connectionRadius={50}
        connectOnClick={false}
        connectionMode={ConnectionMode.Loose}
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
          // Allow connections between any handles on different nodes
          return connection.source !== connection.target;
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

      {/* Node Properties Panel */}
      <NodePropertiesPanel
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={handleNodeDelete}
        onNodeDuplicate={handleNodeDuplicate}
        isVisible={showPropertiesPanel}
        onClose={() => setShowPropertiesPanel(false)}
      />

      {/* Edge Properties Panel */}
      <EdgePropertiesPanel
        selectedEdge={selectedEdge}
        onEdgeUpdate={handleEdgeUpdate}
        onEdgeDelete={handleEdgeDelete}
        onEdgeDuplicate={handleEdgeDuplicate}
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
  );
};

export default InteractiveMermaidEditor;
