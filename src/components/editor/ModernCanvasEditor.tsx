/**
 * Modern Canvas Editor - Enhanced editing experience with smooth transitions
 * Canvas-like interface inspired by Figma/Canva with professional animations
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  MarkerType,
  ConnectionMode,
  ConnectionLineType,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  MousePointer2,
  Square,
  Circle,
  Diamond,
  Type,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid3X3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Palette,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AuditReadyThemes, 
  ModernAnimations,
  ComponentTokens 
} from '../ui/design-system/AuditReadyDesignSystem';

interface ModernCanvasEditorProps {
  currentTheme: string;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  canvasBackground?: string;
  className?: string;
}

// Enhanced custom node component with smooth animations
const AnimatedCustomNode = ({ data, selected }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`transition-all duration-300 ease-out transform ${
        selected ? 'scale-105 shadow-lg' : isHovered ? 'scale-102 shadow-md' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: data.fillColor || '#ffffff',
        border: `2px solid ${data.strokeColor || '#e2e8f0'}`,
        borderRadius: data.shape === 'circle' ? '50%' : data.shape === 'diamond' ? '0' : '8px',
        padding: '12px 16px',
        minWidth: '120px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '500',
        color: data.textColor || '#1e293b',
        position: 'relative',
        cursor: 'pointer',
        transition: ModernAnimations.transitions.all
      }}
    >
      {/* Selection indicator */}
      {selected && (
        <div
          className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse"
          style={{
            borderRadius: data.shape === 'circle' ? '50%' : '8px',
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 text-center leading-tight">
        {data.label || 'Node'}
      </span>
      
      {/* Handles */}
      <div className={`absolute inset-0 ${selected || isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-75" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-75" />
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-75" />
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-75" />
      </div>
    </div>
  );
};

// Tool types for the modern toolbar
type ToolType = 'select' | 'rectangle' | 'circle' | 'diamond' | 'text' | 'move';

export const ModernCanvasEditor: React.FC<ModernCanvasEditorProps> = ({
  currentTheme,
  onNodesChange,
  onEdgesChange,
  canvasBackground,
  className
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [isGridSnap, setIsGridSnap] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const themeData = AuditReadyThemes[currentTheme as keyof typeof AuditReadyThemes] || AuditReadyThemes['Executive Clean'];

  // Custom node types with animations
  const nodeTypes: NodeTypes = {
    custom: AnimatedCustomNode
  };

  // Handle node changes with smooth animations
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange, onNodesChangeInternal]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange, onEdgesChangeInternal]);

  // Add new node with animation
  const addNode = useCallback((type: string, position: { x: number, y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: 'New Node',
        shape: type,
        fillColor: themeData.colors.secondary,
        strokeColor: themeData.colors.accent,
        textColor: themeData.colors.text.primary,
        strokeWidth: 2
      },
      style: {
        opacity: 0,
        transform: 'scale(0.8)'
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Animate in
    setTimeout(() => {
      setNodes((nds) => 
        nds.map((n) => 
          n.id === newNode.id 
            ? { ...n, style: { opacity: 1, transform: 'scale(1)' } }
            : n
        )
      );
    }, 50);
  }, [setNodes, themeData]);

  // Canvas click handler for adding nodes
  const onCanvasClick = useCallback((event: any) => {
    if (selectedTool !== 'select' && reactFlowWrapper.current && reactFlowInstance) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Apply grid snap if enabled
      if (isGridSnap) {
        position.x = Math.round(position.x / 20) * 20;
        position.y = Math.round(position.y / 20) * 20;
      }
      
      addNode(selectedTool, position);
      setSelectedTool('select'); // Return to select tool
    }
  }, [selectedTool, reactFlowInstance, addNode, isGridSnap]);

  // Zoom controls
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 300 });
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }
  };

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  // Duplicate selected nodes
  const duplicateSelectedNodes = useCallback(() => {
    const selectedNodesList = nodes.filter(n => n.selected);
    const newNodes = selectedNodesList.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      },
      selected: false
    }));
    setNodes(nds => [...nds, ...newNodes]);
  }, [nodes, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNodes();
      } else if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        duplicateSelectedNodes();
      } else if (event.key === 'Escape') {
        setSelectedTool('select');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, duplicateSelectedNodes]);

  const tools = [
    { id: 'select' as ToolType, icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle' as ToolType, icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'diamond' as ToolType, icon: Diamond, label: 'Diamond', shortcut: 'D' },
    { id: 'text' as ToolType, icon: Type, label: 'Text', shortcut: 'T' },
  ];

  return (
    <div className={`relative w-full h-full ${className}`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={(connection) => setEdges((eds) => addEdge(connection, eds))}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        onPaneClick={onCanvasClick}
        onInit={setReactFlowInstance}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={isGridSnap}
        snapGrid={[20, 20]}
        style={{
          background: canvasBackground || themeData.canvas.background
        }}
        className="transition-all duration-300"
      >
        <Background
          variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Cross}
          gap={20}
          size={1}
          color={themeData.canvas.grid}
          className={showGrid ? 'opacity-40' : 'opacity-20'}
        />
        
        {/* Modern Floating Toolbar */}
        <Panel position="top-left" className="m-4">
          <div 
            className="flex items-center space-x-1 p-2 rounded-xl shadow-lg backdrop-blur-sm border"
            style={{
              background: `${themeData.colors.primary}f0`,
              borderColor: themeData.colors.border
            }}
          >
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              const isActive = selectedTool === tool.id;
              
              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.id)}
                  className={`relative transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isActive ? themeData.colors.accent : 'transparent',
                    color: isActive ? 'white' : themeData.colors.text.secondary
                  }}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <IconComponent className="h-4 w-4" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Button>
              );
            })}
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* View Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="text-gray-600 hover:text-gray-900"
              title="Toggle Grid"
            >
              {showGrid ? <Grid3X3 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGridSnap(!isGridSnap)}
              className={`transition-colors ${
                isGridSnap ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Snap to Grid"
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </Panel>

        {/* Zoom Controls */}
        <Panel position="bottom-right" className="m-4">
          <div 
            className="flex flex-col space-y-1 p-2 rounded-xl shadow-lg backdrop-blur-sm border"
            style={{
              background: `${themeData.colors.primary}f0`,
              borderColor: themeData.colors.border
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-gray-600 hover:text-gray-900"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-gray-600 hover:text-gray-900"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitView}
              className="text-gray-600 hover:text-gray-900"
              title="Fit to View"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Panel>

        {/* Quick Actions */}
        {selectedNodes.length > 0 && (
          <Panel position="top-center" className="m-4">
            <div 
              className="flex items-center space-x-2 p-2 rounded-xl shadow-lg backdrop-blur-sm border"
              style={{
                background: `${themeData.colors.primary}f0`,
                borderColor: themeData.colors.border
              }}
            >
              <Badge variant="secondary" className="text-xs">
                {selectedNodes.length} selected
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={duplicateSelectedNodes}
                className="text-gray-600 hover:text-gray-900"
                title="Duplicate (Cmd+D)"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteSelectedNodes}
                className="text-red-600 hover:text-red-700"
                title="Delete (Del)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        )}

        <Controls 
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        
        <MiniMap 
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          nodeColor={(node) => node.data?.fillColor || themeData.colors.accent}
          maskColor="rgb(240, 240, 240, 0.8)"
        />
      </ReactFlow>
      
      {/* Status Bar */}
      <div 
        className="absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs backdrop-blur-sm border"
        style={{
          background: `${themeData.colors.primary}f0`,
          borderColor: themeData.colors.border,
          color: themeData.colors.text.muted
        }}
      >
        {nodes.length} nodes • {edges.length} connections
      </div>
    </div>
  );
};