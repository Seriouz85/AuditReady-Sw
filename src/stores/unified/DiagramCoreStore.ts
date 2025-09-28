/**
 * Diagram Core Store - Core diagram state and node/edge management
 * Handles the fundamental diagram data structures and basic operations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export interface DiagramCoreState {
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
  
  // Basic actions
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
  resetDiagram: () => void;
}

export const useDiagramCoreStore = create<DiagramCoreState>()(
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
        
        set((state) => ({
          nodes: [...state.nodes, newNode],
          lastModified: new Date()
        }));
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
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== nodeId),
          edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
          selectedNodes: state.selectedNodes.filter(id => id !== nodeId),
          lastModified: new Date()
        }));
      },
      
      addEdge: (edge) => {
        set((state) => ({
          edges: [...state.edges, edge],
          lastModified: new Date()
        }));
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
        set((state) => ({
          edges: state.edges.filter(e => e.id !== edgeId),
          selectedEdges: state.selectedEdges.filter(id => id !== edgeId),
          lastModified: new Date()
        }));
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
      
      resetDiagram: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodes: [],
          selectedEdges: [],
          lastModified: new Date()
        });
      },
    }),
    {
      name: 'diagram-core-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        projectName: state.projectName,
        projectDescription: state.projectDescription,
      })
    }
  )
);