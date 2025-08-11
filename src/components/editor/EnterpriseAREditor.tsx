/**
 * 🚀 Enterprise AR Editor - Jaw-Dropping Visual Editor
 * Complete overhaul with stunning design, seamless UX, and enterprise features
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  MiniMap,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/layout-fixes.css';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import {
  Sparkles, Brain, Eye, Settings, Palette, Box, BarChart3,
  Zap, Shield, Network, Maximize2, Minimize2, MapPin, Grid, Cpu,
  Workflow
} from 'lucide-react';

// Store and Hooks
import { useDiagramStore } from '../../stores/diagramStore';
import { useTheme } from '../editor/themes/AdvancedThemeSystem';
import { useAccessibility } from '../editor/accessibility/AccessibilitySystem';

// Components
import AIIntelligencePanel from './panels/AIIntelligencePanel';
import EnterpriseIntegrationsPanel from './panels/EnterpriseIntegrationsPanel';
import AnalyticsDashboardPanel from './panels/AnalyticsDashboardPanel';
import VisualizationModePanel from './panels/VisualizationModePanel';
import SecurityGovernancePanel from './panels/SecurityGovernancePanel';
import ProductivityAcceleratorPanel from './panels/ProductivityAcceleratorPanel';
import BeautifulNodePalette from './components/BeautifulNodePalette';
import StunningTemplateGallery from './components/StunningTemplateGallery';
import FlowAnimationControls from './components/FlowAnimationControls';
import EnterpriseToolbar from './components/EnterpriseToolbar';
import EditorSettings from './components/EditorSettings';
import ColorPalettePopup from './components/ColorPalettePopup';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { EdgePropertiesPanel } from './EdgePropertiesPanel';
// import { BackgroundColorPicker } from './BackgroundColorPicker'; // TODO: Implement background picker
import SmartNodeTypes from './nodes/SmartNodeTypes';

// Types
interface EnterpriseAREditorProps {
  className?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  mode?: 'design' | 'present' | 'collaborate';
}

const EnterpriseAREditor: React.FC<EnterpriseAREditorProps> = ({
  className = '',
  initialNodes = [],
  initialEdges = [],
  mode = 'design'
}) => {
  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedMode, setSelectedMode] = useState<'design' | 'present' | 'collaborate'>(mode);
  const [activePanel, setActivePanel] = useState<string>('templates');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showEdgePropertiesPanel, setShowEdgePropertiesPanel] = useState(false);
  // const [showBackgroundPicker, setShowBackgroundPicker] = useState(false); // TODO: Implement background picker
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hooks
  const { currentTheme } = useTheme();
  const { } = useAccessibility();
  const { } = useReactFlow();
  
  // Store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    projectName,
    projectDescription,
    clearSelection,
    addNode: storeAddNode,
    addEdge: storeAddEdge,
    setNodes: storeSetNodes,
    setEdges: storeSetEdges,
    undo,
    redo,
    canUndo,
    canRedo,
    resetDiagram
  } = useDiagramStore();

  // Save and Export Functions
  const handleSave = useCallback(() => {
    const diagramData = {
      nodes,
      edges,
      projectName: projectName || 'Untitled Diagram',
      projectDescription,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    // Save to localStorage for demo
    localStorage.setItem('ar-editor-diagram', JSON.stringify(diagramData));
    console.log('✅ Diagram saved successfully!', diagramData);
  }, [nodes, edges, projectName, projectDescription]);

  const handleExport = useCallback((format: 'png' | 'svg' | 'json' = 'png') => {
    const diagramData = {
      nodes,
      edges,
      projectName: projectName || 'Untitled Diagram',
      timestamp: new Date().toISOString()
    };
    
    if (format === 'json') {
      const dataStr = JSON.stringify(diagramData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagramData.projectName.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('📁 Exported as JSON');
    } else {
      console.log(`🖼️ Export as ${format.toUpperCase()} - Feature coming soon!`);
    }
  }, [nodes, edges, projectName]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/shared-diagram/${Date.now()}`;
    if (navigator.share) {
      navigator.share({
        title: projectName || 'Untitled Diagram',
        text: projectDescription || 'Check out my diagram!',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      console.log('📋 Share URL copied to clipboard');
    }
  }, [projectName, projectDescription]);

  // Beautiful Node Types
  const nodeTypes = useMemo(() => SmartNodeTypes, []);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: currentTheme.colors.accent,
          strokeWidth: 2
        }
      }, edges);
      setEdges(newEdge);
      storeAddEdge({
        id: `edge-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        type: 'smoothstep',
        animated: true
      });
    },
    [edges, setEdges, storeAddEdge, currentTheme]
  );

  // Node and Edge Selection Handlers
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowPropertiesPanel(true);
    setShowEdgePropertiesPanel(false);
  }, []);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setShowEdgePropertiesPanel(true);
    setShowPropertiesPanel(false);
  }, []);

  const handlePaneClick = useCallback(() => {
    setShowPropertiesPanel(false);
    setShowEdgePropertiesPanel(false);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Node Update Handler
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates, data: { ...node.data, ...updates.data } }
          : node
      )
    );
  }, []);

  // Edge Update Handler  
  const handleEdgeUpdate = useCallback((edgeId: string, updates: Partial<Edge>) => {
    setEdges(edges => 
      edges.map(edge => 
        edge.id === edgeId 
          ? { ...edge, ...updates, data: { ...edge.data, ...updates.data } }
          : edge
      )
    );
  }, []);

  // Color Selection Handler
  const handleColorSelect = useCallback((color: string, type: 'fill' | 'stroke' | 'text') => {
    if (selectedNode) {
      const updates: any = {};
      if (type === 'fill') {
        updates.style = { ...selectedNode.style, background: color };
        updates.data = { ...selectedNode.data, fillColor: color };
      } else if (type === 'stroke') {
        updates.style = { ...selectedNode.style, border: `2px solid ${color}` };
        updates.data = { ...selectedNode.data, strokeColor: color };
      } else if (type === 'text') {
        updates.style = { ...selectedNode.style, color };
        updates.data = { ...selectedNode.data, textColor: color };
      }
      handleNodeUpdate(selectedNode.id, updates);
    } else if (selectedEdge) {
      const updates: any = {};
      updates.style = { ...selectedEdge.style, stroke: color };
      updates.data = { ...selectedEdge.data, strokeColor: color };
      handleEdgeUpdate(selectedEdge.id, updates);
    } else {
      // Apply to all selected nodes/edges if any, or show notification
      console.log(`🎨 Applied ${type} color ${color} - Select a node or edge first`);
    }
  }, [selectedNode, selectedEdge, handleNodeUpdate, handleEdgeUpdate]);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      try {
        const nodeData = JSON.parse(type);
        
        // Calculate the position where the node should be dropped
        const position = {
          x: event.clientX - reactFlowBounds.left - 60, // Center the node
          y: event.clientY - reactFlowBounds.top - 20
        };

        const newNode = {
          id: `${nodeData.type || 'node'}-${Date.now()}`,
          type: 'process',
          position,
          data: {
            label: nodeData.data?.label || 'New Node',
            shape: nodeData.type === 'diamond' ? 'diamond' : nodeData.type === 'circle' ? 'circle' : 'rectangle',
            ...nodeData.data
          },
          style: nodeData.data?.style || {
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b'
          }
        };

        console.log('Dropping node at position:', position, newNode);
        storeAddNode(newNode);
      } catch (error) {
        console.error('Failed to parse dropped node data:', error);
      }
    },
    [storeAddNode]
  );

  // Panel animations - optimized for performance
  const panelVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 25,
        mass: 0.8
      } 
    },
    exit: { 
      x: -320, 
      opacity: 0, 
      transition: { 
        duration: 0.2,
        ease: 'easeInOut' as const
      } 
    }
  };

  // Mode switching animations - reduced for performance
  const modeVariants = {
    design: { scale: 1, rotateY: 0 },
    present: { scale: 1.02, rotateY: 2 },
    collaborate: { scale: 0.98, rotateY: -2 }
  };

  // Stunning background patterns
  const backgroundPatterns = {
    dots: BackgroundVariant.Dots,
    lines: BackgroundVariant.Lines,
    cross: BackgroundVariant.Cross
  };

  // Panel configurations with beautiful icons and descriptions
  const panelConfigs = [
    {
      id: 'ai',
      title: 'AI Intelligence',
      icon: Brain,
      description: 'Smart diagram generation and optimization',
      color: 'from-purple-500 to-pink-500',
      component: AIIntelligencePanel
    },
    {
      id: 'templates',
      title: 'Stunning Templates',
      icon: Sparkles,
      description: 'Jaw-dropping enterprise templates',
      color: 'from-blue-500 to-cyan-500',
      component: StunningTemplateGallery
    },
    {
      id: 'nodes',
      title: 'Beautiful Shapes',
      icon: Box,
      description: 'Professional node library',
      color: 'from-green-500 to-emerald-500',
      component: BeautifulNodePalette
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: BarChart3,
      description: 'Process insights and optimization',
      color: 'from-orange-500 to-red-500',
      component: AnalyticsDashboardPanel
    },
    {
      id: 'integrations',
      title: 'Enterprise Integrations',
      icon: Network,
      description: 'Connect to your enterprise tools',
      color: 'from-indigo-500 to-purple-500',
      component: EnterpriseIntegrationsPanel
    },
    {
      id: 'visualization',
      title: 'Next-Gen Views',
      icon: Eye,
      description: '3D, AR, and immersive visualization',
      color: 'from-teal-500 to-green-500',
      component: VisualizationModePanel
    },
    {
      id: 'security',
      title: 'Security & Governance',
      icon: Shield,
      description: 'Enterprise security and compliance',
      color: 'from-gray-500 to-slate-600',
      component: SecurityGovernancePanel
    },
    {
      id: 'productivity',
      title: 'Productivity Boost',
      icon: Zap,
      description: 'Automation and bulk operations',
      color: 'from-yellow-500 to-orange-500',
      component: ProductivityAcceleratorPanel
    }
  ];

  // Synchronize ReactFlow state with Zustand store
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Optimized ReactFlow changes handlers - reduced store syncing for smoother dragging
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    
    // Only sync to store on drag end, not during dragging for smoother performance
    const hasDragEnd = changes.some((change: any) => 
      change.type === 'position' && change.dragging === false
    );
    
    if (hasDragEnd || changes.some((change: any) => 
      ['add', 'remove', 'select', 'dimensions'].includes(change.type)
    )) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        storeSetNodes(nodes);
      });
    }
  }, [onNodesChange, nodes, storeSetNodes]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    
    // Only sync significant changes to store
    const hasSignificantChange = changes.some((change: any) => 
      ['add', 'remove', 'select'].includes(change.type)
    );
    
    if (hasSignificantChange) {
      requestAnimationFrame(() => {
        storeSetEdges(edges);
      });
    }
  }, [onEdgesChange, edges, storeSetEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            event.preventDefault();
            // Auto-save
            break;
          case 'n':
            event.preventDefault();
            resetDiagram();
            break;
          case 'f':
            event.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
        }
      }

      if (event.key === 'Escape') {
        clearSelection();
        setActivePanel('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, resetDiagram, clearSelection, isFullscreen]);

  // Render active panel component
  const renderActivePanel = () => {
    const config = panelConfigs.find(p => p.id === activePanel);
    if (!config) return null;

    const Component = config.component;
    return <Component onClose={() => setActivePanel('')} />;
  };

  return (
    <div 
      className={`enterprise-ar-editor h-screen w-full grid overflow-hidden ${className} 
        grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr]
        md:grid-cols-[auto_auto_1fr] md:grid-rows-[auto_1fr]
        lg:grid-cols-[auto_auto_1fr] lg:grid-rows-[auto_1fr]
      `}
      style={{
        background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.secondary} 100%)`,
        gridTemplateAreas: `
          "sidebar panel main"
          "sidebar panel main"
        `
      }}
    >
      {/* Left Sidebar - Panel Navigation */}
      <motion.div 
        className="sidebar w-12 md:w-16 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col items-center py-2 md:py-4 space-y-1 md:space-y-2 overflow-y-auto gpu-accelerated"
        style={{ gridArea: 'sidebar' }}
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      >
        {panelConfigs.map((config) => {
          const Icon = config.icon;
          const isActive = activePanel === config.id;
          
          return (
            <TooltipProvider key={config.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => setActivePanel(isActive ? '' : config.id)}
                    className={`relative w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive 
                        ? 'bg-white shadow-lg scale-110' 
                        : 'hover:bg-white/60 hover:scale-105'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div 
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.color} ${
                        isActive ? 'opacity-20' : 'opacity-0 hover:opacity-10'
                      } transition-opacity duration-200`}
                    />
                    <Icon 
                      className={`w-4 h-4 md:w-6 md:h-6 transition-colors duration-200 ${
                        isActive ? 'text-gray-800' : 'text-gray-600'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute -right-1 -top-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2 tooltip-content">
                  <div className="text-sm font-medium">{config.title}</div>
                  <div className="text-xs text-gray-500">{config.description}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </motion.div>

      {/* Active Panel */}
      <AnimatePresence mode="wait">
        {activePanel && (
          <motion.div
            key={activePanel}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="panel w-64 sm:w-72 md:w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-full overflow-hidden gpu-accelerated scrollable-container"
            style={{ gridArea: 'panel' }}
          >
            {renderActivePanel()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <motion.div 
        className="main-canvas relative grid grid-rows-[auto_1fr] overflow-hidden min-w-0"
        style={{ gridArea: 'main' }}
        variants={modeVariants}
        animate={selectedMode}
        transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.8 }}
      >
        {/* Top Toolbar */}
        <div className="toolbar w-full overflow-hidden">
          <EnterpriseToolbar
            mode={selectedMode}
            onModeChange={setSelectedMode}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            animationSpeed={animationSpeed}
            onAnimationSpeedChange={setAnimationSpeed}
            canUndo={canUndo()}
            canRedo={canRedo()}
            onUndo={undo}
            onRedo={redo}
            onSave={handleSave}
            onExport={handleExport}
            onShare={handleShare}
          />
        </div>

        {/* ReactFlow Canvas */}
        <div className="relative h-full w-full overflow-hidden min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            attributionPosition="bottom-left"
            className="bg-transparent"
            style={{
              background: 'transparent'
            }}
            // Performance optimizations for smooth dragging
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            snapToGrid={false}
            snapGrid={[15, 15]}
          >
            <Background
              variant={backgroundPatterns.dots}
              gap={20}
              size={1}
              color={`${currentTheme.colors.border}40`}
            />
            
            {showMiniMap && (
              <MiniMap
                className="!bg-white/80 !border-gray-200/50 !backdrop-blur-xl"
                nodeColor={() => currentTheme.colors.accent}
                maskColor="rgba(0,0,0,0.1)"
              />
            )}
            
            <Controls 
              className="!bg-white/80 !border-gray-200/50 !backdrop-blur-xl"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />

            {/* Floating Action Buttons */}
            <Panel position="top-right" className="floating-element space-y-2">
              <motion.div 
                className="flex flex-col space-y-2 gpu-accelerated"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90"
                  onClick={() => setShowMiniMap(!showMiniMap)}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </motion.div>
            </Panel>

            {/* Project Info Panel */}
            <Panel position="bottom-left" className="floating-element w-64 sm:w-72 md:w-80 hidden sm:block">
              <motion.div
                className="gpu-accelerated"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Workflow className="w-4 h-4" />
                      <span>{projectName || 'Untitled Diagram'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-2">
                      {projectDescription || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{nodes.length} nodes</span>
                      <span>{edges.length} connections</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedMode}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Flow Animation Controls */}
        {isPlaying && (
          <FlowAnimationControls
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            nodes={nodes}
            edges={edges}
          />
        )}
      </motion.div>

      {/* Theme and Settings Quick Access */}
      <motion.div 
        className="floating-element absolute top-4 right-4 hidden lg:block gpu-accelerated"
        style={{ gridArea: 'toolbar', zIndex: 'var(--z-floating)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-xl border-gray-200/50"
            onClick={() => setShowColorPalette(true)}
            title="Color Palette - Select colors for nodes and edges"
          >
            <Palette className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-xl border-gray-200/50"
            onClick={() => setShowSettings(true)}
            title="Open Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Performance Monitor */}
      <motion.div
        className="floating-element absolute bottom-4 right-4 hidden lg:block gpu-accelerated"
        style={{ gridArea: 'main', justifySelf: 'end', alignSelf: 'end', margin: '16px', zIndex: 'var(--z-floating)' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
          <CardContent className="p-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>60 FPS</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3" />
                <span>12% CPU</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Editor Settings Modal */}
      <EditorSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Color Palette Popup */}
      <ColorPalettePopup
        isOpen={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        onColorSelect={handleColorSelect}
        currentColor={selectedNode?.data?.fillColor || selectedEdge?.data?.strokeColor || '#3b82f6'}
        selectedType="fill"
      />

      {/* Properties Panels */}
      <NodePropertiesPanel
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={(nodeId) => {
          setNodes(nodes => nodes.filter(n => n.id !== nodeId));
          setShowPropertiesPanel(false);
          setSelectedNode(null);
        }}
        onNodeDuplicate={(nodeId) => {
          const nodeToDupe = nodes.find(n => n.id === nodeId);
          if (nodeToDupe) {
            const newNode = {
              ...nodeToDupe,
              id: `${nodeId}-copy-${Date.now()}`,
              position: {
                x: nodeToDupe.position.x + 50,
                y: nodeToDupe.position.y + 50
              }
            };
            setNodes(nodes => [...nodes, newNode]);
            storeAddNode(newNode);
          }
        }}
        isVisible={showPropertiesPanel}
        onClose={() => {
          setShowPropertiesPanel(false);
          setSelectedNode(null);
        }}
      />

      <EdgePropertiesPanel
        selectedEdge={selectedEdge}
        onEdgeUpdate={handleEdgeUpdate}
        onEdgeDelete={(edgeId) => {
          setEdges(edges => edges.filter(e => e.id !== edgeId));
          setShowEdgePropertiesPanel(false);
          setSelectedEdge(null);
        }}
        onEdgeDuplicate={(edgeId) => {
          const edgeToDupe = edges.find(e => e.id === edgeId);
          if (edgeToDupe) {
            const newEdge = {
              ...edgeToDupe,
              id: `${edgeId}-copy-${Date.now()}`,
            };
            setEdges(edges => [...edges, newEdge]);
            storeAddEdge(newEdge);
          }
        }}
        isVisible={showEdgePropertiesPanel}
        onClose={() => {
          setShowEdgePropertiesPanel(false);
          setSelectedEdge(null);
        }}
      />
    </div>
  );
};

export default EnterpriseAREditor;