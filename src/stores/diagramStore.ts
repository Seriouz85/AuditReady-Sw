/**
 * Centralized Diagram Store using Zustand
 * Manages all diagram state, operations, and persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Node, Edge, Connection, ReactFlowInstance, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface DiagramTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
    };
  };
}

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
  tags: string[];
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  isPremium?: boolean;
  popularity?: number;
  rating?: number;
  downloads?: number;
  createdAt?: string;
}

export interface AIConversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  diagramGenerated?: boolean;
}

export interface DiagramState {
  // Core diagram state
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  
  // Project metadata
  projectId: string;
  projectName: string;
  projectDescription: string;
  lastModified: Date;
  version: string;
  
  // UI state
  currentTheme: DiagramTheme;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showControls: boolean;
  panelStates: {
    leftPanel: boolean;
    rightPanel: boolean;
    bottomPanel: boolean;
  };
  
  // Canvas state
  zoom: number;
  canvasPosition: { x: number; y: number };
  canvasBackground: string;
  
  // Editing state
  isEditing: boolean;
  editingNodeId: string | null;
  isDragging: boolean;
  isConnecting: boolean;
  
  // AI state
  aiConversations: AIConversation[];
  isAIGenerating: boolean;
  aiPrompt: string;
  
  // History for undo/redo
  history: {
    past: { nodes: Node[]; edges: Edge[] }[];
    future: { nodes: Node[]; edges: Edge[] }[];
  };
  
  // Templates
  recentTemplates: string[];
  favoriteTemplates: string[];
  customTemplates: DiagramTemplate[];
  
  // Collaboration
  collaborators: string[];
  isShared: boolean;
  shareLink: string | null;
  
  // Performance
  renderMode: 'svg' | 'canvas';
  enableAnimations: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  
  // Actions
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Partial<Node>) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Selection actions
  selectNode: (nodeId: string, multi?: boolean) => void;
  selectEdge: (edgeId: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Project actions
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  saveProject: () => void;
  loadProject: (projectId: string) => Promise<void>;
  exportProject: (format: 'json' | 'png' | 'svg' | 'pdf') => Promise<void>;
  
  // UI actions
  setTheme: (theme: DiagramTheme) => void;
  togglePanel: (panel: 'leftPanel' | 'rightPanel' | 'bottomPanel') => void;
  setShowGrid: (show: boolean) => void;
  setShowMinimap: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  
  // Canvas actions
  setZoom: (zoom: number) => void;
  setCanvasPosition: (position: { x: number; y: number }) => void;
  setCanvasBackground: (background: string) => void;
  fitView: () => void;
  centerNode: (nodeId: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Template actions
  applyTemplate: (template: DiagramTemplate) => void;
  saveAsTemplate: (name: string, description: string, category: string) => void;
  addToFavorites: (templateId: string) => void;
  removeFromFavorites: (templateId: string) => void;
  
  // AI actions
  setAIPrompt: (prompt: string) => void;
  generateFromAI: (prompt: string) => Promise<void>;
  addAIMessage: (message: Omit<AIConversation, 'id' | 'timestamp'>) => void;
  clearAIConversation: () => void;
  
  // Bulk operations
  duplicateSelected: () => void;
  deleteSelected: () => void;
  alignNodes: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle') => void;
  distributeNodes: (direction: 'horizontal' | 'vertical') => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  
  // Auto-layout
  autoLayout: (algorithm: 'dagre' | 'elk' | 'force' | 'circular' | 'grid') => void;
  
  // Reset
  resetDiagram: () => void;
  resetAll: () => void;
}

// Default theme
const defaultTheme: DiagramTheme = {
  name: 'Executive Clean',
  colors: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    accent: '#3b82f6',
    background: '#fefefe',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    }
  }
};

// Create the store
export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      
      projectId: uuidv4(),
      projectName: 'Untitled Diagram',
      projectDescription: '',
      lastModified: new Date(),
      version: '1.0.0',
      
      currentTheme: defaultTheme,
      showGrid: true,
      snapToGrid: true,
      gridSize: 20,
      showMinimap: true,
      showControls: true,
      panelStates: {
        leftPanel: true,
        rightPanel: false,
        bottomPanel: false
      },
      
      zoom: 1,
      canvasPosition: { x: 0, y: 0 },
      canvasBackground: '#fefefe',
      
      isEditing: false,
      editingNodeId: null,
      isDragging: false,
      isConnecting: false,
      
      aiConversations: [],
      isAIGenerating: false,
      aiPrompt: '',
      
      history: {
        past: [],
        future: []
      },
      
      recentTemplates: [],
      favoriteTemplates: [],
      customTemplates: [],
      
      collaborators: [],
      isShared: false,
      shareLink: null,
      
      renderMode: 'svg',
      enableAnimations: true,
      autoSave: true,
      autoSaveInterval: 30000,
      
      // Node/Edge actions
      setNodes: (nodes) => {
        set((state) => ({
          nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
          lastModified: new Date()
        }));
      },
      
      setEdges: (edges) => {
        set((state) => ({
          edges: typeof edges === 'function' ? edges(state.edges) : edges,
          lastModified: new Date()
        }));
      },
      
      addNode: (nodeData) => {
        const newNode: Node = {
          id: nodeData.id || uuidv4(),
          type: nodeData.type || 'custom',
          position: nodeData.position || { x: 100, y: 100 },
          data: nodeData.data || { label: 'New Node' },
          ...nodeData
        };
        
        set((state) => {
          state.saveToHistory();
          return {
            nodes: [...state.nodes, newNode],
            lastModified: new Date()
          };
        });
      },
      
      updateNode: (nodeId, updates) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
          ),
          lastModified: new Date()
        }));
      },
      
      deleteNode: (nodeId) => {
        set((state) => {
          state.saveToHistory();
          return {
            nodes: state.nodes.filter(n => n.id !== nodeId),
            edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
            selectedNodes: state.selectedNodes.filter(id => id !== nodeId),
            lastModified: new Date()
          };
        });
      },
      
      addEdge: (edge) => {
        set((state) => {
          state.saveToHistory();
          return {
            edges: [...state.edges, edge],
            lastModified: new Date()
          };
        });
      },
      
      updateEdge: (edgeId, updates) => {
        set((state) => ({
          edges: state.edges.map(edge =>
            edge.id === edgeId ? { ...edge, ...updates } : edge
          ),
          lastModified: new Date()
        }));
      },
      
      deleteEdge: (edgeId) => {
        set((state) => {
          state.saveToHistory();
          return {
            edges: state.edges.filter(e => e.id !== edgeId),
            selectedEdges: state.selectedEdges.filter(id => id !== edgeId),
            lastModified: new Date()
          };
        });
      },
      
      // Selection actions
      selectNode: (nodeId, multi = false) => {
        set((state) => ({
          selectedNodes: multi
            ? [...state.selectedNodes, nodeId]
            : [nodeId],
          selectedEdges: multi ? state.selectedEdges : []
        }));
      },
      
      selectEdge: (edgeId, multi = false) => {
        set((state) => ({
          selectedEdges: multi
            ? [...state.selectedEdges, edgeId]
            : [edgeId],
          selectedNodes: multi ? state.selectedNodes : []
        }));
      },
      
      clearSelection: () => {
        set({ selectedNodes: [], selectedEdges: [] });
      },
      
      selectAll: () => {
        set((state) => ({
          selectedNodes: state.nodes.map(n => n.id),
          selectedEdges: state.edges.map(e => e.id)
        }));
      },
      
      // Project actions
      setProjectName: (name) => {
        set({ projectName: name, lastModified: new Date() });
      },
      
      setProjectDescription: (description) => {
        set({ projectDescription: description, lastModified: new Date() });
      },
      
      saveProject: () => {
        const state = get();
        // Save to localStorage or backend
        console.log('Saving project:', state.projectName);
        set({ lastModified: new Date() });
      },
      
      loadProject: async (projectId) => {
        // Load from localStorage or backend
        console.log('Loading project:', projectId);
      },
      
      exportProject: async (format) => {
        const state = get();
        console.log(`Exporting as ${format}:`, state.projectName);
      },
      
      // UI actions
      setTheme: (theme) => {
        set({ currentTheme: theme });
      },
      
      togglePanel: (panel) => {
        set((state) => ({
          panelStates: {
            ...state.panelStates,
            [panel]: !state.panelStates[panel]
          }
        }));
      },
      
      setShowGrid: (show) => {
        set({ showGrid: show });
      },
      
      setShowMinimap: (show) => {
        set({ showMinimap: show });
      },
      
      setSnapToGrid: (snap) => {
        set({ snapToGrid: snap });
      },
      
      setGridSize: (size) => {
        set({ gridSize: size });
      },
      
      // Canvas actions
      setZoom: (zoom) => {
        set({ zoom });
      },
      
      setCanvasPosition: (position) => {
        set({ canvasPosition: position });
      },
      
      setCanvasBackground: (background) => {
        set({ canvasBackground: background });
      },
      
      fitView: () => {
        console.log('Fitting view to content');
      },
      
      centerNode: (nodeId) => {
        const node = get().nodes.find(n => n.id === nodeId);
        if (node) {
          set({ canvasPosition: { x: -node.position.x, y: -node.position.y } });
        }
      },
      
      // History actions
      undo: () => {
        const { history } = get();
        if (history.past.length > 0) {
          const previous = history.past[history.past.length - 1];
          const current = { nodes: get().nodes, edges: get().edges };
          
          set({
            nodes: previous.nodes,
            edges: previous.edges,
            history: {
              past: history.past.slice(0, -1),
              future: [current, ...history.future]
            }
          });
        }
      },
      
      redo: () => {
        const { history } = get();
        if (history.future.length > 0) {
          const next = history.future[0];
          const current = { nodes: get().nodes, edges: get().edges };
          
          set({
            nodes: next.nodes,
            edges: next.edges,
            history: {
              past: [...history.past, current],
              future: history.future.slice(1)
            }
          });
        }
      },
      
      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,
      
      saveToHistory: () => {
        const current = { nodes: get().nodes, edges: get().edges };
        set((state) => ({
          history: {
            past: [...state.history.past.slice(-49), current],
            future: []
          }
        }));
      },
      
      // Template actions
      applyTemplate: (template) => {
        get().saveToHistory();
        
        // Convert template nodes to proper ReactFlow nodes
        const convertedNodes = template.nodes.map(node => ({
          ...node,
          type: node.type === 'custom' ? 'process' : node.type || 'process', // Map custom to process
          data: {
            ...node.data,
            // Ensure proper data structure
            shape: node.data?.shape || (node.data?.label?.includes('?') ? 'diamond' : 'rectangle')
          }
        }));
        
        console.log('Applying template with converted nodes:', { template: template.name, nodes: convertedNodes, edges: template.edges });
        
        set({
          nodes: convertedNodes,
          edges: template.edges,
          projectName: template.name,
          projectDescription: template.description,
          lastModified: new Date()
        });
      },
      
      saveAsTemplate: (name, description, category) => {
        const state = get();
        const template: DiagramTemplate = {
          id: uuidv4(),
          name,
          description,
          category,
          nodes: state.nodes,
          edges: state.edges,
          tags: [],
          complexity: 'Intermediate'
        };
        
        set((state) => ({
          customTemplates: [...state.customTemplates, template]
        }));
      },
      
      addToFavorites: (templateId) => {
        set((state) => ({
          favoriteTemplates: [...state.favoriteTemplates, templateId]
        }));
      },
      
      removeFromFavorites: (templateId) => {
        set((state) => ({
          favoriteTemplates: state.favoriteTemplates.filter(id => id !== templateId)
        }));
      },
      
      // AI actions
      setAIPrompt: (prompt) => {
        set({ aiPrompt: prompt });
      },
      
      generateFromAI: async (prompt) => {
        set({ isAIGenerating: true });
        try {
          // AI generation logic here
          console.log('Generating from AI:', prompt);
          // Simulate AI response
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Add AI message
          get().addAIMessage({
            role: 'assistant',
            content: 'Generated diagram based on your prompt',
            diagramGenerated: true
          });
        } finally {
          set({ isAIGenerating: false });
        }
      },
      
      addAIMessage: (message) => {
        const aiMessage: AIConversation = {
          ...message,
          id: uuidv4(),
          timestamp: new Date()
        };
        
        set((state) => ({
          aiConversations: [...state.aiConversations, aiMessage]
        }));
      },
      
      clearAIConversation: () => {
        set({ aiConversations: [] });
      },
      
      // Bulk operations
      duplicateSelected: () => {
        const state = get();
        const offset = 50;
        
        const selectedNodes = state.nodes.filter(n => 
          state.selectedNodes.includes(n.id)
        );
        const selectedEdges = state.edges.filter(e => 
          state.selectedEdges.includes(e.id)
        );
        
        const nodeIdMap = new Map<string, string>();
        
        const newNodes = selectedNodes.map(node => {
          const newId = uuidv4();
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
          id: uuidv4(),
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target
        }));
        
        state.saveToHistory();
        set((state) => ({
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodes: newNodes.map(n => n.id),
          selectedEdges: newEdges.map(e => e.id),
          lastModified: new Date()
        }));
      },
      
      deleteSelected: () => {
        const state = get();
        state.saveToHistory();
        
        set((state) => ({
          nodes: state.nodes.filter(n => !state.selectedNodes.includes(n.id)),
          edges: state.edges.filter(e => 
            !state.selectedEdges.includes(e.id) &&
            !state.selectedNodes.includes(e.source) &&
            !state.selectedNodes.includes(e.target)
          ),
          selectedNodes: [],
          selectedEdges: [],
          lastModified: new Date()
        }));
      },
      
      alignNodes: (alignment) => {
        const state = get();
        const selectedNodes = state.nodes.filter(n => 
          state.selectedNodes.includes(n.id)
        );
        
        if (selectedNodes.length < 2) return;
        
        let alignmentValue: number;
        
        switch (alignment) {
          case 'left':
            alignmentValue = Math.min(...selectedNodes.map(n => n.position.x));
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, x: alignmentValue } }
                  : node
              )
            }));
            break;
          case 'right':
            alignmentValue = Math.max(...selectedNodes.map(n => n.position.x));
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, x: alignmentValue } }
                  : node
              )
            }));
            break;
          case 'top':
            alignmentValue = Math.min(...selectedNodes.map(n => n.position.y));
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, y: alignmentValue } }
                  : node
              )
            }));
            break;
          case 'bottom':
            alignmentValue = Math.max(...selectedNodes.map(n => n.position.y));
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, y: alignmentValue } }
                  : node
              )
            }));
            break;
          case 'center':
            const centerX = (Math.min(...selectedNodes.map(n => n.position.x)) + 
                           Math.max(...selectedNodes.map(n => n.position.x))) / 2;
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, x: centerX } }
                  : node
              )
            }));
            break;
          case 'middle':
            const centerY = (Math.min(...selectedNodes.map(n => n.position.y)) + 
                           Math.max(...selectedNodes.map(n => n.position.y))) / 2;
            set((state) => ({
              nodes: state.nodes.map(node =>
                state.selectedNodes.includes(node.id)
                  ? { ...node, position: { ...node.position, y: centerY } }
                  : node
              )
            }));
            break;
        }
      },
      
      distributeNodes: (direction) => {
        const state = get();
        const selectedNodes = state.nodes.filter(n => 
          state.selectedNodes.includes(n.id)
        ).sort((a, b) => 
          direction === 'horizontal' 
            ? a.position.x - b.position.x
            : a.position.y - b.position.y
        );
        
        if (selectedNodes.length < 3) return;
        
        const first = selectedNodes[0];
        const last = selectedNodes[selectedNodes.length - 1];
        const spacing = direction === 'horizontal'
          ? (last.position.x - first.position.x) / (selectedNodes.length - 1)
          : (last.position.y - first.position.y) / (selectedNodes.length - 1);
        
        set((state) => ({
          nodes: state.nodes.map(node => {
            const index = selectedNodes.findIndex(n => n.id === node.id);
            if (index === -1) return node;
            
            return {
              ...node,
              position: direction === 'horizontal'
                ? { ...node.position, x: first.position.x + spacing * index }
                : { ...node.position, y: first.position.y + spacing * index }
            };
          })
        }));
      },
      
      groupSelected: () => {
        console.log('Grouping selected nodes');
      },
      
      ungroupSelected: () => {
        console.log('Ungrouping selected nodes');
      },
      
      // Auto-layout
      autoLayout: (algorithm) => {
        console.log(`Applying ${algorithm} layout`);
        // Implementation depends on the algorithm
      },
      
      // Reset actions
      resetDiagram: () => {
        get().saveToHistory();
        set({
          nodes: [],
          edges: [],
          selectedNodes: [],
          selectedEdges: [],
          lastModified: new Date()
        });
      },
      
      resetAll: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodes: [],
          selectedEdges: [],
          projectId: uuidv4(),
          projectName: 'Untitled Diagram',
          projectDescription: '',
          lastModified: new Date(),
          history: { past: [], future: [] },
          aiConversations: []
        });
      }
    }),
    {
      name: 'diagram-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        projectName: state.projectName,
        projectDescription: state.projectDescription,
        currentTheme: state.currentTheme,
        customTemplates: state.customTemplates,
        favoriteTemplates: state.favoriteTemplates,
        recentTemplates: state.recentTemplates
      })
    }
  )
);