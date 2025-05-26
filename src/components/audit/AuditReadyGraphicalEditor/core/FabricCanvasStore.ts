import { create } from 'zustand';
import { debounce } from 'lodash';

interface Collaborator {
  id: string;
  name: string;
  color: string;
}

interface FabricCanvasState {
  // Canvas
  canvas: any | null;
  setCanvas: (canvas: any) => void;
  
  // Design
  designId: string | null;
  setDesignId: (id: string) => void;
  name: string;
  setName: (name: string) => void;
  
  // UI State
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  showProperties: boolean;
  setShowProperties: (show: boolean) => void;
  
  // Save State
  saveStatus: 'saved' | 'saving' | 'error';
  setSaveStatus: (status: 'saved' | 'saving' | 'error') => void;
  isModified: boolean;
  lastModified: number;
  
  // Audit Mode
  auditMode: 'process' | 'compliance' | 'risk';
  setAuditMode: (mode: 'process' | 'compliance' | 'risk') => void;
  
  // Collaboration
  collaborators: Collaborator[];
  setCollaborators: (collaborators: Collaborator[]) => void;
  
  // Actions
  markAsModified: () => void;
  saveToServer: () => Promise<any>;
  saveDesign: () => Promise<boolean>;
  loadDesign: (designId: string) => Promise<boolean>;
  exportAsJSON: () => string | null;
  debouncedSaveToServer: () => void;
  resetStore: () => void;
}

export const useFabricCanvasStore = create<FabricCanvasState>((set, get) => ({
  // Canvas
  canvas: null,
  setCanvas: (canvas) => {
    set({ canvas });
    // Canvas styling is handled in FabricCanvas component
  },
  
  // Design
  designId: null,
  setDesignId: (id) => set({ designId: id }),
  name: 'Untitled Audit Design',
  setName: (name) => set({ name }),
  
  // UI State
  isEditing: true,
  setIsEditing: (editing) => set({ isEditing: editing }),
  showProperties: false,
  setShowProperties: (show) => set({ showProperties: show }),
  
  // Save State
  saveStatus: 'saved',
  setSaveStatus: (status) => set({ saveStatus: status }),
  isModified: false,
  lastModified: Date.now(),
  
  // Audit Mode
  auditMode: 'process',
  setAuditMode: (mode) => set({ auditMode: mode }),
  
  // Collaboration
  collaborators: [],
  setCollaborators: (collaborators) => set({ collaborators }),
  
  // Actions
  markAsModified: () => {
    const designId = get().designId;
    
    if (designId) {
      set({
        lastModified: Date.now(),
        saveStatus: 'saving',
        isModified: true,
      });
      
      get().debouncedSaveToServer();
    } else {
      console.log('No design ID available for auto-save');
    }
  },
  
  saveToServer: async () => {
    const { designId, canvas, name } = get();
    
    if (!canvas || !designId) {
      console.log('No design ID or canvas available for saving');
      return null;
    }
    
    try {
      // TODO: Implement actual save to server
      // For now, just simulate save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvasData = JSON.stringify(canvas.toJSON());
      console.log('Saving canvas data:', { designId, name, canvasData: canvasData.substring(0, 100) + '...' });
      
      set({
        saveStatus: 'saved',
        isModified: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      set({ saveStatus: 'error' });
      return null;
    }
  },
  
  saveDesign: async () => {
    const { canvas, name } = get();
    
    if (!canvas) {
      console.error('No canvas available for saving');
      return false;
    }
    
    try {
      const canvasData = JSON.stringify(canvas.toJSON());
      const designData = {
        name,
        canvasData,
        timestamp: Date.now(),
      };
      
      // Save to localStorage for now (in production, save to server)
      const designId = get().designId || `design-${Date.now()}`;
      localStorage.setItem(`fabric-design-${designId}`, JSON.stringify(designData));
      
      set({
        designId,
        saveStatus: 'saved',
        isModified: false,
      });
      
      console.log('Design saved successfully:', designId);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      set({ saveStatus: 'error' });
      return false;
    }
  },
  
  loadDesign: async (designId: string) => {
    const { canvas } = get();
    
    if (!canvas) {
      console.error('No canvas available for loading');
      return false;
    }
    
    try {
      const savedData = localStorage.getItem(`fabric-design-${designId}`);
      if (!savedData) {
        console.error('Design not found:', designId);
        return false;
      }
      
      const designData = JSON.parse(savedData);
      const canvasData = JSON.parse(designData.canvasData);
      
      // Clear canvas and load new data
      canvas.clear();
      await canvas.loadFromJSON(canvasData);
      canvas.renderAll();
      
      set({
        designId,
        name: designData.name,
        saveStatus: 'saved',
        isModified: false,
      });
      
      console.log('Design loaded successfully:', designId);
      return true;
    } catch (error) {
      console.error('Load failed:', error);
      return false;
    }
  },
  
  exportAsJSON: () => {
    const { canvas } = get();
    
    if (!canvas) {
      console.error('No canvas available for export');
      return null;
    }
    
    try {
      return JSON.stringify(canvas.toJSON(), null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  },

  debouncedSaveToServer: debounce(() => {
    get().saveToServer();
  }, 500),
  
  resetStore: () => {
    set({
      canvas: null,
      designId: null,
      name: 'Untitled Audit Design',
      isEditing: true,
      showProperties: false,
      saveStatus: 'saved',
      isModified: false,
      lastModified: Date.now(),
      auditMode: 'process',
      collaborators: [],
    });
  },
})); 