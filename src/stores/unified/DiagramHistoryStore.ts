/**
 * Diagram History Store - Undo/redo functionality and state management
 * Handles history tracking and time-travel debugging for diagrams
 */

import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
  timestamp: Date;
  action?: string;
}

export interface DiagramHistoryState {
  // History state
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
  maxHistorySize: number;
  
  // Actions
  saveToHistory: (nodes: Node[], edges: Edge[], action?: string) => void;
  undo: () => { nodes: Node[]; edges: Edge[] } | null;
  redo: () => { nodes: Node[]; edges: Edge[] } | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getHistoryInfo: () => {
    pastCount: number;
    futureCount: number;
    totalSize: number;
  };
}

export const useDiagramHistoryStore = create<DiagramHistoryState>()(
  (set, get) => ({
    // Initial state
    history: {
      past: [],
      future: []
    },
    maxHistorySize: 50,
    
    // Actions
    saveToHistory: (nodes, edges, action) => {
      const entry: HistoryEntry = {
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
        edges: JSON.parse(JSON.stringify(edges)), // Deep clone
        timestamp: new Date(),
        action
      };
      
      set((state) => ({
        history: {
          past: [...state.history.past.slice(-(state.maxHistorySize - 1)), entry],
          future: [] // Clear future when new action is taken
        }
      }));
    },
    
    undo: () => {
      const { history } = get();
      if (history.past.length === 0) return null;
      
      const previous = history.past[history.past.length - 1];
      
      set((state) => ({
        history: {
          past: state.history.past.slice(0, -1),
          future: [previous, ...state.history.future]
        }
      }));
      
      return {
        nodes: previous.nodes,
        edges: previous.edges
      };
    },
    
    redo: () => {
      const { history } = get();
      if (history.future.length === 0) return null;
      
      const next = history.future[0];
      
      set((state) => ({
        history: {
          past: [...state.history.past, next],
          future: state.history.future.slice(1)
        }
      }));
      
      return {
        nodes: next.nodes,
        edges: next.edges
      };
    },
    
    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,
    
    clearHistory: () => {
      set({
        history: {
          past: [],
          future: []
        }
      });
    },
    
    getHistoryInfo: () => {
      const { history } = get();
      return {
        pastCount: history.past.length,
        futureCount: history.future.length,
        totalSize: history.past.length + history.future.length
      };
    },
  })
);