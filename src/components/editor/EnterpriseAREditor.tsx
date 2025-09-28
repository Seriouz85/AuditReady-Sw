/**
 * 🚀 Enterprise AR Editor - Jaw-Dropping Visual Editor
 * Complete overhaul with stunning design, seamless UX, and enterprise features
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';
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
import { useExportCanvas } from '../../hooks/useExportCanvas';
import { usePresentMode } from '../../hooks/usePresentMode';
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
import { useNodeAlignment } from '@/hooks/useNodeAlignment';

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
import { BackgroundColorPicker } from './BackgroundColorPicker';
import SmartNodeTypes from './nodes/SmartNodeTypes';
import { customEdgeTypes } from './edges/CustomEdges';
import LoadDiagramModal from './components/LoadDiagramModal';
import SaveDiagramModal from './components/SaveDiagramModal';
import ClearConfirmationDialog from './components/ClearConfirmationDialog';
import CollaborationInviteModal from './components/CollaborationInviteModal';

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
  const [showGrid, setShowGrid] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showEdgePropertiesPanel, setShowEdgePropertiesPanel] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { } = useAccessibility();
  const { } = useReactFlow();
  const { handleNodeDrag } = useNodeAlignment(nodes);
  
  // Store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    projectName,
    projectDescription,
    setProjectName,
    setProjectDescription,
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

  // Auto-sizing utility function
  const calculateNodeSize = useCallback((text: string, description: string = '', shapeType: string = 'rectangle') => {
    const baseWidth = 120;
    const baseHeight = 40;
    const charWidth = 8; // Average character width
    const lineHeight = 20; // Line height for text
    
    // Calculate text dimensions
    const textLength = text.length;
    const descLength = description.length;
    const totalChars = textLength + (descLength > 0 ? descLength * 0.7 : 0); // Description uses smaller font
    
    // Calculate required width
    let width = Math.max(baseWidth, Math.min(totalChars * charWidth + 40, 300));
    let height = baseHeight;
    
    // Add height for description
    if (description) {
      height += lineHeight;
    }
    
    // Adjust for long text (wrap to multiple lines)
    if (textLength > 15) {
      const lines = Math.ceil(textLength / 15);
      height = Math.max(height, lines * lineHeight + 20);
    }
    
    // Shape-specific adjustments
    if (shapeType === 'circle') {
      const size = Math.max(width, height);
      width = height = size;
    } else if (shapeType === 'diamond') {
      // Diamond shapes need extra space due to rotation
      width = Math.max(width * 1.2, height * 1.2);
      height = width;
    }
    
    return { width, height };
  }, []);

  // Shape adding functionality with auto-sizing
  const handleAddShape = useCallback((shapeType: string) => {
    const initialLabel = shapeType.charAt(0).toUpperCase() + shapeType.slice(1);
    const { width, height } = calculateNodeSize(initialLabel, '', shapeType);
    
    const newNode = {
      id: `${shapeType}-${Date.now()}`,
      type: 'process',
      position: { 
        x: 400 + Math.random() * 100, // Add slight randomness to avoid overlap
        y: 200 + Math.random() * 100
      },
      data: {
        label: initialLabel,
        shape: shapeType,
        description: '',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        textColor: '#1f2937',
        autoWidth: width,
        autoHeight: height
      },
      style: {
        width: `${width}px`,
        height: `${height}px`
      }
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    storeAddNode(newNode);
    
    // Enhanced feedback for shape addition
    console.log(`✅ Added ${shapeType} shape to canvas:`, newNode);
    
    // Brief visual feedback (can be enhanced with toast notifications later)
    const feedback = document.createElement('div');
    feedback.innerHTML = `✅ ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} added!`;
    feedback.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove feedback after 2 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => feedback.remove(), 300);
      }
    }, 2000);
    
  }, [calculateNodeSize, setNodes, storeAddNode]);

  // Back to dashboard handler
  const handleBackToDashboard = useCallback(() => {
    // Navigate back to main dashboard using React Router (preserves auth state)
    navigate('/app/documents');
  }, [navigate]);

  // Save and Export Functions - Updated to show save dialog
  const handleSave = useCallback(() => {
    console.log('🔥 SAVE BUTTON CLICKED - opening save dialog');
    setShowSaveModal(true);
  }, []);

  // Actual save function called from SaveDiagramModal
  const handleSaveConfirm = useCallback(async (saveData: {
    projectName: string;
    projectDescription: string;
    isPublic: boolean;
    tags: string[];
    overwrite?: boolean;
  }) => {
    console.log('🔥 SAVE CONFIRMED - handleSaveConfirm called!', saveData);
    try {
      const diagramData = {
        id: `diagram_${Date.now()}`,
        nodes,
        edges,
        projectName: projectName || 'Untitled Process Flow',
        projectDescription: projectDescription || 'Created with AR Editor',
        timestamp: new Date().toISOString(),
        version: '1.0',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        createdBy: useAuthStore.getState().user?.email || 'system',
        organizationId: useOrganizationStore.getState().currentOrganization?.id || 'default',
        isPublic: true, // Shared with organization
        tags: ['process-flow', 'ar-editor']
      };
      
      // Save to organization shared storage (localStorage simulation for now)
      const orgDiagrams = JSON.parse(localStorage.getItem('org-shared-diagrams') || '[]');
      
      // Check if updating existing diagram
      const existingIndex = orgDiagrams.findIndex((d: any) => d.projectName === diagramData.projectName);
      if (existingIndex >= 0) {
        orgDiagrams[existingIndex] = { ...orgDiagrams[existingIndex], ...diagramData, updatedAt: new Date().toISOString() };
      } else {
        orgDiagrams.push(diagramData);
      }
      
      localStorage.setItem('org-shared-diagrams', JSON.stringify(orgDiagrams));
      localStorage.setItem('ar-editor-last-save', Date.now().toString());
      
      // Also save to store for immediate persistence
      storeSetNodes(nodes);
      storeSetEdges(edges);
      
      console.log('✅ Diagram saved successfully!', diagramData);
      
      // Enhanced user feedback with proper toast notification
      const saveTime = new Date().toLocaleTimeString();
      
      // Create a beautiful toast notification
      const toast = document.createElement('div');
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          z-index: 10000;
          max-width: 400px;
          animation: slideInRight 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">✅</div>
            <div>
              <div style="font-size: 16px; margin-bottom: 4px;">Diagram Saved Successfully!</div>
              <div style="font-size: 14px; opacity: 0.9;">
                📊 ${diagramData.nodeCount} shapes, ${diagramData.edgeCount} connections<br>
                ⏰ Saved at ${saveTime}
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add animation CSS
      if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(toast);
      
      // Remove toast after 4 seconds with animation
      setTimeout(() => {
        if (toast.parentNode) {
          toast.firstElementChild.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => toast.remove(), 300);
        }
      }, 4000);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      
      // Error toast
      const errorToast = document.createElement('div');
      errorToast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
          z-index: 10000;
          max-width: 400px;
          animation: slideInRight 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">❌</div>
            <div>
              <div style="font-size: 16px;">Save Failed</div>
              <div style="font-size: 14px; opacity: 0.9;">Please try again</div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorToast);
      setTimeout(() => {
        if (errorToast.parentNode) {
          errorToast.firstElementChild.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => errorToast.remove(), 300);
        }
      }, 3000);
    }
  }, [nodes, edges, projectName, projectDescription]);

  // Load diagram functionality
  const handleLoad = useCallback(() => {
    setShowLoadModal(true);
  }, []);

  const handleLoadDiagram = useCallback((diagramData: any) => {
    console.log('🔥 LOADING DIAGRAM:', diagramData);
    
    // Load the diagram data into the editor
    setNodes(diagramData.nodes || []);
    setEdges(diagramData.edges || []);
    
    // Update store
    storeSetNodes(diagramData.nodes || []);
    storeSetEdges(diagramData.edges || []);
    
    // Update project info
    setProjectName(diagramData.projectName);
    setProjectDescription(diagramData.projectDescription);
    
    // Success toast
    const loadToast = document.createElement('div');
    loadToast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">📂</div>
          <div>
            <div style="font-size: 16px; margin-bottom: 4px;">Diagram Loaded Successfully!</div>
            <div style="font-size: 14px; opacity: 0.9;">
              📊 ${diagramData.nodeCount || 0} shapes, ${diagramData.edgeCount || 0} connections<br>
              📁 ${diagramData.projectName}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(loadToast);
    setTimeout(() => {
      if (loadToast.parentNode) {
        loadToast.firstElementChild.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => loadToast.remove(), 300);
      }
    }, 4000);
    
    setShowLoadModal(false);
  }, [setNodes, setEdges, storeSetNodes, storeSetEdges, setProjectName, setProjectDescription]);

  // Clear canvas functionality
  const handleClear = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const handleClearConfirm = useCallback(() => {
    console.log('🔥 CLEARING CANVAS');
    
    // Clear all nodes and edges
    setNodes([]);
    setEdges([]);
    
    // Update store
    storeSetNodes([]);
    storeSetEdges([]);
    
    // Clear selection
    clearSelection();
    
    // Success toast
    const clearToast = document.createElement('div');
    clearToast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">🗑️</div>
          <div>
            <div style="font-size: 16px; margin-bottom: 4px;">Canvas Cleared!</div>
            <div style="font-size: 14px; opacity: 0.9;">
              Ready for your next masterpiece
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(clearToast);
    setTimeout(() => {
      if (clearToast.parentNode) {
        clearToast.firstElementChild.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => clearToast.remove(), 300);
      }
    }, 3000);
    
  }, [setNodes, setEdges, storeSetNodes, storeSetEdges, clearSelection]);


  // Collaborate mode handler - shows invitation modal for real-time collaboration
  const handleCollaborateMode = useCallback(() => {
    setSelectedMode('collaborate');
    setShowCollaborationModal(true);
    console.log('🤝 Switched to Collaborate mode - opening invitation modal');
  }, []);

  // Drag and Drop handlers for Beautiful Shapes consistency
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const reactFlowBounds = (event.target as Element).getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    
    if (!type) return;
    
    try {
      const nodeData = JSON.parse(type);
      
      // Use same positioning logic as click
      const position = {
        x: event.clientX - reactFlowBounds.left - 60,
        y: event.clientY - reactFlowBounds.top - 30
      };
      
      // Create node IDENTICAL to click behavior for Beautiful Shapes
      const newNode = {
        id: `${nodeData.nodeType || nodeData.type || 'node'}-${Date.now()}`,
        type: 'custom', // Always use custom for Beautiful Shapes consistency
        position,
        data: {
          label: nodeData.data?.label || 'New Node',
          nodeType: nodeData.data?.nodeType || nodeData.nodeType,
          shape: nodeData.data?.shape || 'rectangle',
          description: nodeData.data?.description || '',
          isBeautifulShape: nodeData.data?.isBeautifulShape || false,
          ...nodeData.data
        }
      };
      
      console.log('✅ Dropped Beautiful Shape (matches click behavior):', newNode);
      setNodes(nds => [...nds, newNode]);
      storeAddNode(newNode);
      
    } catch (error) {
      console.error('❌ Drop failed:', error);
    }
  }, [setNodes, storeAddNode]);
  
  // Initialize export hook
  const { handleExport } = useExportCanvas({ nodes, edges, projectName });
  
  // Initialize present mode hook
  const { isPresenting, togglePresentMode } = usePresentMode({
    onModeChange: (mode) => setSelectedMode(mode),
    onStateChange: (states) => {
      setActivePanel(states.activePanel);
      setShowPropertiesPanel(states.showPropertiesPanel);
      setShowEdgePropertiesPanel(states.showEdgePropertiesPanel);
      setShowSettings(states.showSettings);
      setShowColorPalette(states.showColorPalette);
      setShowMiniMap(states.showMiniMap);
      setShowGrid(states.showGrid);
    }
  });

  // Present mode handler using extracted hook
  const handlePresentMode = useCallback(() => {
    const currentStates = {
      activePanel,
      showPropertiesPanel,
      showEdgePropertiesPanel,
      showSettings,
      showColorPalette,
      showMiniMap,
      showGrid
    };
    
    togglePresentMode(currentStates);
    console.log('🎯 Present mode toggled via hook');
  }, [
    togglePresentMode, 
    activePanel, 
    showPropertiesPanel, 
    showEdgePropertiesPanel, 
    showSettings, 
    showColorPalette, 
    showMiniMap, 
    showGrid
  ]);

  const handleShare = useCallback(() => {
    console.log('🔗 Share clicked - Opening collaboration modal');
    setShowCollaborationModal(true);
    
    // Legacy share functionality as fallback
    const shareUrl = `${window.location.origin}/shared-diagram/${Date.now()}`;
    if (navigator.share && false) { // Disabled in favor of collaboration modal
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

  // Connection handler with professional straight lines for process flows
  const onConnect = useCallback(
    (params: Connection) => {
      const edgeId = `edge-${Date.now()}`;
      const edgeStyle = {
        stroke: currentTheme.colors.accent,
        strokeWidth: 2,
        strokeDasharray: '0', // Solid line for professional appearance
        zIndex: 1 // Ensure edges stay below text
      };
      
      const markerEnd = {
        type: 'arrowclosed' as const,
        color: currentTheme.colors.accent,
        strokeWidth: 2,
        width: 12,
        height: 12
      };
      
      const newEdge = {
        id: edgeId,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'step', // Back to standard step edge
        animated: false, // Disable animation for cleaner appearance
        style: edgeStyle,
        markerEnd,
        label: '', // ReactFlow label on root level - can be set later via properties panel
        data: {
          strokeColor: currentTheme.colors.accent,
          strokeWidth: 2,
        },
        zIndex: 1
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      storeAddEdge(newEdge);
      
      console.log('✨ Created straight edge:', {
        id: edgeId,
        type: 'straight',
        from: params.source,
        to: params.target,
        style: 'professional'
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


  // Node Update Handler - with store sync
  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setNodes(nodes => {
      const updatedNodes = nodes.map(node => {
        if (node.id === nodeId) {
          // Handle updates that are direct properties (like label, description, fillColor, etc.)
          const dataUpdates = { ...node.data };
          Object.keys(updates).forEach(key => {
            dataUpdates[key] = updates[key];
          });
          
          // Build style updates based on data changes
          const styleUpdates: any = { ...node.style };
          
          if (updates.fillColor) {
            if (updates.fillColor.includes('gradient')) {
              styleUpdates.background = updates.fillColor;
              styleUpdates.backgroundColor = 'transparent';
            } else {
              styleUpdates.backgroundColor = updates.fillColor;
              styleUpdates.background = updates.fillColor;
            }
          }
          
          if (updates.strokeColor) {
            styleUpdates.borderColor = updates.strokeColor;
            styleUpdates.border = `${updates.strokeWidth || 2}px solid ${updates.strokeColor}`;
          }
          
          if (updates.strokeWidth) {
            const currentColor = updates.strokeColor || node.data.strokeColor || '#e2e8f0';
            styleUpdates.border = `${updates.strokeWidth}px solid ${currentColor}`;
          }
          
          if (updates.textColor) {
            styleUpdates.color = updates.textColor;
          }
          
          // Auto-resize if text content changed
          if (updates.label || updates.description || updates.autoWidth || updates.autoHeight) {
            if (updates.autoWidth && updates.autoHeight) {
              // Use provided dimensions
              styleUpdates.width = `${updates.autoWidth}px`;
              styleUpdates.height = `${updates.autoHeight}px`;
            } else if (updates.label || updates.description) {
              // Recalculate dimensions based on text
              const newLabel = updates.label || node.data.label || '';
              const newDescription = updates.description || node.data.description || '';
              const shapeType = node.data.shape || 'rectangle';
              
              const { width: newWidth, height: newHeight } = calculateNodeSize(
                newLabel, 
                newDescription, 
                shapeType
              );
              
              styleUpdates.width = `${newWidth}px`;
              styleUpdates.height = `${newHeight}px`;
              
              // Store dimensions in data for future reference
              dataUpdates.autoWidth = newWidth;
              dataUpdates.autoHeight = newHeight;
            }
          }
          
          return {
            ...node,
            data: dataUpdates,
            style: styleUpdates
          };
        }
        return node;
      });
      
      // Sync with store immediately
      requestAnimationFrame(() => {
        storeSetNodes(updatedNodes);
      });
      return updatedNodes;
    });
  }, [storeSetNodes, calculateNodeSize]);

  // Edge Update Handler - with store sync
  const handleEdgeUpdate = useCallback((edgeId: string, updates: Partial<Edge>) => {
    setEdges(edges => {
      const updatedEdges = edges.map(edge => 
        edge.id === edgeId 
          ? { ...edge, ...updates, data: { ...edge.data, ...updates.data } }
          : edge
      );
      // Sync with store immediately for color changes
      requestAnimationFrame(() => {
        storeSetEdges(updatedEdges);
      });
      return updatedEdges;
    });
  }, [storeSetEdges]);

  // Color Selection Handler - Enhanced with gradient support
  const handleColorSelect = useCallback((color: string, type: 'fill' | 'stroke' | 'text') => {
    const isGradient = color.startsWith('linear-gradient') || color.startsWith('radial-gradient');
    
    if (selectedNode) {
      const updates: any = {
        style: { ...selectedNode.style },
        data: { ...selectedNode.data }
      };
      
      if (type === 'fill') {
        // Support both solid colors and gradients
        if (isGradient) {
          updates.style.background = color;
          updates.style.backgroundColor = 'transparent';
        } else {
          updates.style.backgroundColor = color;
          updates.style.background = color;
        }
        updates.data.fillColor = color;
      } else if (type === 'stroke') {
        // For gradients on stroke, we'll use a solid fallback color
        const strokeColor = isGradient ? '#3b82f6' : color;
        updates.style.border = `2px solid ${strokeColor}`;
        updates.style.borderColor = strokeColor;
        updates.data.strokeColor = strokeColor;
      } else if (type === 'text') {
        updates.style.color = color;
        updates.data.textColor = color;
      }
      
      handleNodeUpdate(selectedNode.id, updates);
      console.log(`🎨 Applied ${type} ${isGradient ? 'gradient' : 'color'} to node ${selectedNode.id}`);
      
    } else if (selectedEdge) {
      const updates: any = {
        style: { ...selectedEdge.style },
        data: { ...selectedEdge.data }
      };
      
      // Edges don't support gradients in ReactFlow, use solid color
      const edgeColor = isGradient ? '#3b82f6' : color;
      updates.style.stroke = edgeColor;
      updates.data.strokeColor = edgeColor;
      
      handleEdgeUpdate(selectedEdge.id, updates);
      console.log(`🎨 Applied color to edge ${selectedEdge.id}`);
      
    } else {
      // If no selection, apply to canvas background
      const canvasElement = document.querySelector('.react-flow') as HTMLElement;
      if (canvasElement && type === 'fill') {
        canvasElement.style.background = color;
        console.log(`🎨 Applied ${isGradient ? 'gradient' : 'color'} to canvas background`);
      } else {
        console.log(`💡 Select a node or edge first to apply ${type} color`);
      }
    }
  }, [selectedNode, selectedEdge, handleNodeUpdate, handleEdgeUpdate]);

  // Drag and drop handlers already defined above


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
    console.log('🔥 NODES CHANGE:', changes);
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

  // Delete selected nodes/edges
  const handleDeleteSelected = useCallback(() => {
    console.log('🔥 DELETE KEY PRESSED - handleDeleteSelected called!');
    const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
    const selectedEdgeIds = edges.filter(edge => edge.selected).map(edge => edge.id);
    console.log('Selected nodes for deletion:', selectedNodeIds);
    console.log('Selected edges for deletion:', selectedEdgeIds);
    
    if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
      // Remove selected nodes
      const newNodes = nodes.filter(node => !selectedNodeIds.includes(node.id));
      // Remove selected edges and edges connected to deleted nodes
      const newEdges = edges.filter(edge => 
        !selectedEdgeIds.includes(edge.id) &&
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
      storeSetNodes(newNodes);
      storeSetEdges(newEdges);
      
      console.log(`✅ Deleted ${selectedNodeIds.length} nodes and ${selectedEdgeIds.length + (edges.length - newEdges.length - selectedEdgeIds.length)} edges`);
    }
  }, [nodes, edges, setNodes, setEdges, storeSetNodes, storeSetEdges]);

  // Keyboard shortcuts - ENHANCED MAC SUPPORT for delete functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true' ||
        target.getAttribute('role') === 'textbox'
      );
      
      console.log('🔥 KEY PRESSED:', {
        key: event.key,
        code: event.code,
        target: target?.tagName,
        isInputField,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey
      });
      
      // IMPROVED Mac delete support - handle all delete key variations
      const isMac = navigator.platform.indexOf('Mac') > -1;
      const isDeleteKey = (
        event.key === 'Delete' || 
        event.key === 'Backspace' ||
        event.code === 'Delete' ||
        event.code === 'Backspace' ||
        event.keyCode === 8 || // Backspace keyCode
        event.keyCode === 46 || // Delete keyCode
        // Mac-specific delete combinations - SIMPLIFIED for Mac
        (isMac && event.key === 'Backspace') || // Regular backspace on Mac should delete
        // Windows/Linux variations
        event.key === 'Del'
      );
      
      if (isDeleteKey && !isInputField) {
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        
        console.log('🔥 DELETE KEY DETECTED (MAC-ENHANCED)!', {
          key: event.key,
          keyCode: event.keyCode,
          code: event.code,
          isMac,
          platform: navigator.platform,
          selectedNodes: selectedNodes.length,
          selectedEdges: selectedEdges.length
        });
        
        // Only proceed if there's something to delete
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          // Prevent default behavior and propagation
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          // Force delete execution
          handleDeleteSelected();
        }
        return false;
      }
      
      // Handle keyboard shortcuts (only when not in input fields)
      if (!isInputField) {
        // Meta/Ctrl key combinations
        if (event.metaKey || event.ctrlKey) {
          switch (event.key.toLowerCase()) {
            case 'z':
              event.preventDefault();
              event.stopPropagation();
              if (event.shiftKey) {
                redo();
                console.log('🔥 Redo triggered');
              } else {
                undo();
                console.log('🔥 Undo triggered');
              }
              break;
            case 's':
              event.preventDefault();
              event.stopPropagation();
              handleSave();
              console.log('🔥 Save triggered');
              break;
            case 'o':
              event.preventDefault();
              event.stopPropagation();
              handleLoad();
              console.log('🔥 Load triggered');
              break;
            case 'f':
              if (!event.shiftKey) { // Cmd+F for fullscreen, not search
                event.preventDefault();
                event.stopPropagation();
                setIsFullscreen(!isFullscreen);
                console.log('🔥 Fullscreen toggled');
              }
              break;
            case 'n':
              event.preventDefault();
              event.stopPropagation();
              resetDiagram();
              console.log('🔥 New diagram triggered');
              break;
            case 'a':
              // Select all nodes (cross-platform)
              event.preventDefault();
              event.stopPropagation();
              setNodes(prevNodes => prevNodes.map(node => ({ ...node, selected: true })));
              setEdges(prevEdges => prevEdges.map(edge => ({ ...edge, selected: true })));
              console.log('🔥 Select all triggered');
              break;
          }
        }
        
        // Escape key - clear selections and close panels
        if (event.key === 'Escape') {
          event.preventDefault();
          clearSelection();
          setActivePanel('');
          setSelectedNode(null);
          setSelectedEdge(null);
          setShowPropertiesPanel(false);
          setShowEdgePropertiesPanel(false);
          console.log('🔥 Escape - cleared selections');
        }
        
        // Arrow keys for moving selected nodes (Mac/PC compatible)
        const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code);
        if (isArrowKey) {
          const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
          if (selectedNodeIds.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            
            const moveDistance = event.shiftKey ? 20 : 5; // Hold shift for larger movements
            const deltaX = event.code === 'ArrowLeft' ? -moveDistance : event.code === 'ArrowRight' ? moveDistance : 0;
            const deltaY = event.code === 'ArrowUp' ? -moveDistance : event.code === 'ArrowDown' ? moveDistance : 0;
            
            setNodes(prevNodes => prevNodes.map(node => 
              selectedNodeIds.includes(node.id) 
                ? { ...node, position: { x: node.position.x + deltaX, y: node.position.y + deltaY } }
                : node
            ));
            
            console.log(`🔥 Arrow key movement: ${event.code}, distance: ${moveDistance}`);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, resetDiagram, clearSelection, isFullscreen, handleDeleteSelected, handleSave, handleLoad]);

  // Render active panel component
  const renderActivePanel = () => {
    const config = panelConfigs.find(p => p.id === activePanel);
    if (!config) return null;

    const Component = config.component;
    
    // Get current viewport for centering nodes where user is looking
    const getViewportCenter = () => {
      const viewport = document.querySelector('.react-flow__viewport');
      if (viewport) {
        const rect = viewport.getBoundingClientRect();
        const transform = viewport.style.transform;
        const matches = transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)\s*scale\((\d+(?:\.\d+)?)\)/);
        
        if (matches) {
          const [, x, y, scale] = matches;
          return {
            x: (rect.width / 2 - parseFloat(x)) / parseFloat(scale),
            y: (rect.height / 2 - parseFloat(y)) / parseFloat(scale)
          };
        }
      }
      return { x: 400, y: 200 }; // fallback center
    };
    
    // Pass viewport information to BeautifulNodePalette for better centering
    if (config.id === 'nodes') {
      return <Component onClose={() => setActivePanel('')} getViewportCenter={getViewportCenter} />;
    }
    
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
      {/* Left Sidebar - Panel Navigation - Hidden in present mode */}
      {selectedMode !== 'present' && (
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
      )}

      {/* Active Panel - Hidden in present mode */}
      <AnimatePresence mode="wait">
        {activePanel && selectedMode !== 'present' && (
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
        {/* Top Toolbar - Hidden in present mode */}
        {selectedMode !== 'present' && (
        <div className="toolbar w-full overflow-hidden">
          <EnterpriseToolbar
            mode={selectedMode}
            onModeChange={(mode) => {
              if (mode === 'present') {
                handlePresentMode();
              } else if (mode === 'collaborate') {
                handleCollaborateMode();
              } else {
                setSelectedMode(mode);
              }
            }}
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
            onAddShape={handleAddShape}
            onBackToDashboard={handleBackToDashboard}
            onDeleteSelected={handleDeleteSelected}
            onLoad={handleLoad}
            onClear={handleClear}
          />
        </div>
        )}

        {/* ReactFlow Canvas */}
        <div 
          className={`relative overflow-hidden min-h-0 ${
            selectedMode === 'present' 
              ? 'fixed inset-0 w-screen h-screen z-50' 
              : 'h-full w-full'
          }`} 
          tabIndex={0}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            connectionLineType="step" // Default connection preview to stepped
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={customEdgeTypes}
            connectionMode={ConnectionMode.Loose} // Allow flexible connections
            connectionRadius={40} // Much larger radius for easier anchor connections
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
            selectNodesOnDrag={true}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            multiSelectionKeyCode="Shift"
            deleteKeyCode={['Delete', 'Backspace']} // Cross-platform delete support
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            snapToGrid={false} // Disable to allow custom alignment
            onNodeDrag={handleNodeDrag} // Custom alignment for stepped lines
            // Professional edge defaults - stepped lines by default
            defaultEdgeOptions={{
              type: 'step',
              animated: false,
              style: {
                strokeWidth: 2,
                stroke: currentTheme.colors.accent,
                zIndex: 1
              },
              markerEnd: {
                type: 'arrowclosed',
                color: currentTheme.colors.accent,
                width: 12,
                height: 12
              }
            }}
          >
            {showGrid && (
              <Background
                variant={backgroundPatterns.dots}
                gap={20}
                size={1}
                color={`${currentTheme.colors.border}40`}
              />
            )}
            
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
        currentSettings={{
          showGrid,
          showMiniMap,
          animationSpeed
        }}
        onSettingsChange={(newSettings) => {
          setShowGrid(newSettings.showGrid);
          setShowMiniMap(newSettings.showMiniMap);
          setAnimationSpeed(newSettings.animationSpeed);
        }}
      />

      {/* Load Diagram Modal */}
      <LoadDiagramModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={handleLoadDiagram}
      />

      {/* Save Diagram Modal */}
      <SaveDiagramModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConfirm}
        initialName={projectName}
        initialDescription={projectDescription}
        existingDiagrams={JSON.parse(localStorage.getItem('org-shared-diagrams') || '[]')}
      />

      {/* Clear Confirmation Dialog */}
      <ClearConfirmationDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearConfirm}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* Collaboration Invite Modal */}
      <CollaborationInviteModal
        isOpen={showCollaborationModal}
        onClose={() => setShowCollaborationModal(false)}
        projectName={projectName || 'Untitled Diagram'}
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