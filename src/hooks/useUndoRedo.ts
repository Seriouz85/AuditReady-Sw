import { useState, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (nodes: Node[], edges: Edge[]) => void;
  clearHistory: () => void;
}

export const useUndoRedo = (
  initialNodes: Node[] = [],
  initialEdges: Edge[] = []
): UseUndoRedoReturn => {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Save current state to history
  const saveState = useCallback((nodes: Node[], edges: Edge[]) => {
    // Don't save state if this is an undo/redo action
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges)), // Deep clone
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push(newState);
      
      // Limit history size to prevent memory issues (keep last 50 states)
      if (newHistory.length > 50) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
        return newHistory;
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      isUndoRedoAction.current = true;
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      isUndoRedoAction.current = true;
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([{ nodes: [], edges: [], timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    canUndo,
    canRedo,
    undo: () => {
      const state = undo();
      return state;
    },
    redo: () => {
      const state = redo();
      return state;
    },
    saveState,
    clearHistory
  };
};

/**
 * Hook for managing undo/redo with React Flow integration
 */
export const useReactFlowUndoRedo = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) => {
  const {
    canUndo,
    canRedo,
    undo: undoState,
    redo: redoState,
    saveState,
    clearHistory
  } = useUndoRedo(nodes, edges);

  const undo = useCallback(() => {
    const state = undoState();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [undoState, setNodes, setEdges]);

  const redo = useCallback(() => {
    const state = redoState();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [redoState, setNodes, setEdges]);

  // Auto-save state when nodes or edges change
  const saveCurrentState = useCallback(() => {
    saveState(nodes, edges);
  }, [nodes, edges, saveState]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState: saveCurrentState,
    clearHistory
  };
};
