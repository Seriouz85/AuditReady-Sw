/**
 * Unified Diagram Store - Coordinator for all diagram functionality
 * Provides a single interface combining core, UI, history, and templates stores
 */

import { Node, Edge } from 'reactflow';
import { 
  useDiagramCoreStore, 
  type DiagramCoreState 
} from './DiagramCoreStore';
import { 
  useDiagramUIStore, 
  type DiagramUIState, 
  type DiagramTheme 
} from './DiagramUIStore';
import { 
  useDiagramHistoryStore, 
  type DiagramHistoryState 
} from './DiagramHistoryStore';
import { 
  useDiagramTemplatesStore, 
  type DiagramTemplatesState, 
  type DiagramTemplate 
} from './DiagramTemplatesStore';

/**
 * Unified Diagram Store Hook
 * Combines all diagram stores into a single interface for easier usage
 */
export const useUnifiedDiagramStore = () => {
  const core = useDiagramCoreStore();
  const ui = useDiagramUIStore();
  const history = useDiagramHistoryStore();
  const templates = useDiagramTemplatesStore();

  // Enhanced actions that coordinate between stores
  const enhancedActions = {
    // Enhanced node operations with history tracking
    addNodeWithHistory: (node: Partial<Node>) => {
      history.saveToHistory(core.nodes, core.edges, 'Add Node');
      core.addNode(node);
    },

    deleteNodeWithHistory: (nodeId: string) => {
      history.saveToHistory(core.nodes, core.edges, 'Delete Node');
      core.deleteNode(nodeId);
    },

    updateNodeWithHistory: (nodeId: string, updates: Partial<Node>) => {
      history.saveToHistory(core.nodes, core.edges, 'Update Node');
      core.updateNode(nodeId, updates);
    },

    // Enhanced edge operations with history tracking
    addEdgeWithHistory: (edge: Edge) => {
      history.saveToHistory(core.nodes, core.edges, 'Add Edge');
      core.addEdge(edge);
    },

    deleteEdgeWithHistory: (edgeId: string) => {
      history.saveToHistory(core.nodes, core.edges, 'Delete Edge');
      core.deleteEdge(edgeId);
    },

    // Enhanced selection with UI feedback
    selectNodeWithFeedback: (nodeId: string, multi?: boolean) => {
      core.selectNode(nodeId, multi);
      ui.setEditing(true, nodeId);
    },

    clearSelectionWithFeedback: () => {
      core.clearSelection();
      ui.setEditing(false);
    },

    // Enhanced undo/redo that updates core state
    undoWithStateUpdate: () => {
      const result = history.undo();
      if (result) {
        core.setNodes(result.nodes);
        core.setEdges(result.edges);
      }
    },

    redoWithStateUpdate: () => {
      const result = history.redo();
      if (result) {
        core.setNodes(result.nodes);
        core.setEdges(result.edges);
      }
    },

    // Enhanced template application
    applyTemplateWithHistory: (template: DiagramTemplate) => {
      history.saveToHistory(core.nodes, core.edges, 'Apply Template');
      const result = templates.applyTemplate(template);
      core.setNodes(result.nodes);
      core.setEdges(result.edges);
      core.setProjectName(template.name);
      core.setProjectDescription(template.description);
    },

    // Save current diagram as template
    saveCurrentAsTemplate: (name: string, description: string, category: string) => {
      templates.saveAsTemplate(core.nodes, core.edges, name, description, category);
    },

    // AI generation with state updates
    generateFromAIWithUpdates: async (prompt: string) => {
      const result = await templates.generateFromAI(prompt);
      if (result) {
        history.saveToHistory(core.nodes, core.edges, 'AI Generation');
        core.setNodes(result.nodes);
        core.setEdges(result.edges);
      }
      return result;
    },

    // Bulk operations with history
    duplicateSelectedWithHistory: () => {
      history.saveToHistory(core.nodes, core.edges, 'Duplicate Selection');
      
      const selectedNodes = core.nodes.filter(n => core.selectedNodes.includes(n.id));
      const selectedEdges = core.edges.filter(e => core.selectedEdges.includes(e.id));
      
      const offset = 50;
      const nodeIdMap = new Map<string, string>();
      
      const newNodes = selectedNodes.map(node => {
        const newId = `${node.id}-copy-${Date.now()}`;
        nodeIdMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offset,
            y: node.position.y + offset
          }
        };
      });
      
      const newEdges = selectedEdges.map(edge => ({
        ...edge,
        id: `${edge.id}-copy-${Date.now()}`,
        source: nodeIdMap.get(edge.source) || edge.source,
        target: nodeIdMap.get(edge.target) || edge.target
      }));
      
      core.setNodes([...core.nodes, ...newNodes]);
      core.setEdges([...core.edges, ...newEdges]);
      core.selectNode(newNodes[0]?.id || '');
    },

    deleteSelectedWithHistory: () => {
      if (core.selectedNodes.length === 0 && core.selectedEdges.length === 0) return;
      
      history.saveToHistory(core.nodes, core.edges, 'Delete Selection');
      
      const newNodes = core.nodes.filter(n => !core.selectedNodes.includes(n.id));
      const newEdges = core.edges.filter(e => 
        !core.selectedEdges.includes(e.id) &&
        !core.selectedNodes.includes(e.source) &&
        !core.selectedNodes.includes(e.target)
      );
      
      core.setNodes(newNodes);
      core.setEdges(newEdges);
      core.clearSelection();
    },

    // Reset with confirmation
    resetDiagramWithConfirmation: () => {
      if (core.nodes.length > 0 || core.edges.length > 0) {
        history.saveToHistory(core.nodes, core.edges, 'Reset Diagram');
      }
      core.resetDiagram();
      history.clearHistory();
      ui.setEditing(false);
    },

    // Export combined state
    exportDiagramState: () => ({
      core: {
        nodes: core.nodes,
        edges: core.edges,
        projectName: core.projectName,
        projectDescription: core.projectDescription,
        version: core.version
      },
      ui: {
        theme: ui.currentTheme,
        showGrid: ui.showGrid,
        zoom: ui.zoom,
        canvasPosition: ui.canvasPosition
      },
      history: history.getHistoryInfo(),
      templates: {
        customCount: templates.customTemplates.length,
        favoritesCount: templates.favoriteTemplates.length,
        recentCount: templates.recentTemplates.length
      }
    })
  };

  // Return combined interface
  return {
    // Core state
    nodes: core.nodes,
    edges: core.edges,
    selectedNodes: core.selectedNodes,
    selectedEdges: core.selectedEdges,
    projectName: core.projectName,
    projectDescription: core.projectDescription,
    
    // UI state
    currentTheme: ui.currentTheme,
    showGrid: ui.showGrid,
    snapToGrid: ui.snapToGrid,
    zoom: ui.zoom,
    canvasPosition: ui.canvasPosition,
    isEditing: ui.isEditing,
    editingNodeId: ui.editingNodeId,
    panelStates: ui.panelStates,
    
    // History state
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
    historyInfo: history.getHistoryInfo(),
    
    // Templates state
    customTemplates: templates.customTemplates,
    favoriteTemplates: templates.favoriteTemplates,
    isAIGenerating: templates.isAIGenerating,
    aiConversations: templates.aiConversations,
    
    // Basic actions (direct from stores)
    ...core,
    ...ui,
    ...history,
    ...templates,
    
    // Enhanced coordinated actions
    ...enhancedActions
  };
};

// Export individual stores for specific use cases
export {
  useDiagramCoreStore,
  useDiagramUIStore,
  useDiagramHistoryStore,
  useDiagramTemplatesStore
};

// Export types
export type {
  DiagramCoreState,
  DiagramUIState,
  DiagramHistoryState,
  DiagramTemplatesState,
  DiagramTheme,
  DiagramTemplate
};