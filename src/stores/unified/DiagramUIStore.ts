/**
 * Diagram UI Store - UI state, themes, and canvas management
 * Handles all user interface-related state for diagram editor
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export interface DiagramUIState {
  // Theme and appearance
  currentTheme: DiagramTheme;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showControls: boolean;
  
  // Panel states
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
  
  // Performance settings
  renderMode: 'svg' | 'canvas';
  enableAnimations: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  
  // Actions
  setTheme: (theme: DiagramTheme) => void;
  togglePanel: (panel: 'leftPanel' | 'rightPanel' | 'bottomPanel') => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setCanvasPosition: (position: { x: number; y: number }) => void;
  setCanvasBackground: (background: string) => void;
  setEditing: (editing: boolean, nodeId?: string) => void;
  setDragging: (dragging: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setRenderMode: (mode: 'svg' | 'canvas') => void;
  setAnimations: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean, interval?: number) => void;
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

export const useDiagramUIStore = create<DiagramUIState>()(
  persist(
    (set) => ({
      // Initial state
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
      
      renderMode: 'svg',
      enableAnimations: true,
      autoSave: true,
      autoSaveInterval: 30000,
      
      // Actions
      setTheme: (theme) => set({ currentTheme: theme }),
      
      togglePanel: (panel) => {
        set((state) => ({
          panelStates: {
            ...state.panelStates,
            [panel]: !state.panelStates[panel]
          }
        }));
      },
      
      setShowGrid: (show) => set({ showGrid: show }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
      setGridSize: (size) => set({ gridSize: size }),
      setZoom: (zoom) => set({ zoom }),
      setCanvasPosition: (position) => set({ canvasPosition: position }),
      setCanvasBackground: (background) => set({ canvasBackground: background }),
      
      setEditing: (editing, nodeId) => set({ 
        isEditing: editing, 
        editingNodeId: editing ? nodeId || null : null 
      }),
      
      setDragging: (dragging) => set({ isDragging: dragging }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      setRenderMode: (mode) => set({ renderMode: mode }),
      setAnimations: (enabled) => set({ enableAnimations: enabled }),
      
      setAutoSave: (enabled, interval) => set({ 
        autoSave: enabled,
        ...(interval && { autoSaveInterval: interval })
      }),
    }),
    {
      name: 'diagram-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        showMinimap: state.showMinimap,
        showControls: state.showControls,
        renderMode: state.renderMode,
        enableAnimations: state.enableAnimations,
        autoSave: state.autoSave,
        autoSaveInterval: state.autoSaveInterval,
      })
    }
  )
);