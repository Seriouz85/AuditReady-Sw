/**
 * Diagram Templates Store - Template management and AI functionality
 * Handles template storage, favorites, and AI-powered diagram generation
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  diagramGenerated?: boolean;
}

export interface DiagramTemplatesState {
  // Templates
  recentTemplates: string[];
  favoriteTemplates: string[];
  customTemplates: DiagramTemplate[];
  
  // AI state
  aiConversations: AIConversation[];
  isAIGenerating: boolean;
  aiPrompt: string;
  
  // Template actions
  applyTemplate: (template: DiagramTemplate) => { nodes: Node[]; edges: Edge[] };
  saveAsTemplate: (
    nodes: Node[], 
    edges: Edge[], 
    name: string, 
    description: string, 
    category: string
  ) => void;
  addToFavorites: (templateId: string) => void;
  removeFromFavorites: (templateId: string) => void;
  addToRecent: (templateId: string) => void;
  deleteCustomTemplate: (templateId: string) => void;
  updateTemplate: (templateId: string, updates: Partial<DiagramTemplate>) => void;
  
  // AI actions
  setAIPrompt: (prompt: string) => void;
  generateFromAI: (prompt: string) => Promise<{ nodes: Node[]; edges: Edge[] } | null>;
  addAIMessage: (message: Omit<AIConversation, 'id' | 'timestamp'>) => void;
  clearAIConversation: () => void;
  
  // Utility actions
  getTemplatesByCategory: (category: string) => DiagramTemplate[];
  searchTemplates: (query: string) => DiagramTemplate[];
  getRecentTemplates: () => DiagramTemplate[];
  getFavoriteTemplates: () => DiagramTemplate[];
}

export const useDiagramTemplatesStore = create<DiagramTemplatesState>()(
  persist(
    (set, get) => ({
      // Initial state
      recentTemplates: [],
      favoriteTemplates: [],
      customTemplates: [],
      aiConversations: [],
      isAIGenerating: false,
      aiPrompt: '',
      
      // Template actions
      applyTemplate: (template) => {
        // Add to recent templates
        get().addToRecent(template.id);
        
        // Convert template nodes to proper ReactFlow nodes
        const convertedNodes = template.nodes.map(node => ({
          ...node,
          type: node.type === 'custom' ? 'process' : node.type || 'process',
          data: {
            ...node.data,
            shape: node.data?.shape || (node.data?.label?.includes('?') ? 'diamond' : 'rectangle')
          }
        }));
        
        return {
          nodes: convertedNodes,
          edges: template.edges
        };
      },
      
      saveAsTemplate: (nodes, edges, name, description, category) => {
        const template: DiagramTemplate = {
          id: uuidv4(),
          name,
          description,
          category,
          nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
          edges: JSON.parse(JSON.stringify(edges)), // Deep clone
          tags: [],
          complexity: 'Intermediate',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          customTemplates: [...state.customTemplates, template]
        }));
      },
      
      addToFavorites: (templateId) => {
        set((state) => ({
          favoriteTemplates: state.favoriteTemplates.includes(templateId)
            ? state.favoriteTemplates
            : [...state.favoriteTemplates, templateId]
        }));
      },
      
      removeFromFavorites: (templateId) => {
        set((state) => ({
          favoriteTemplates: state.favoriteTemplates.filter(id => id !== templateId)
        }));
      },
      
      addToRecent: (templateId) => {
        set((state) => ({
          recentTemplates: [
            templateId,
            ...state.recentTemplates.filter(id => id !== templateId)
          ].slice(0, 10) // Keep only 10 recent templates
        }));
      },
      
      deleteCustomTemplate: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter(t => t.id !== templateId),
          favoriteTemplates: state.favoriteTemplates.filter(id => id !== templateId),
          recentTemplates: state.recentTemplates.filter(id => id !== templateId)
        }));
      },
      
      updateTemplate: (templateId, updates) => {
        set((state) => ({
          customTemplates: state.customTemplates.map(template =>
            template.id === templateId
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          )
        }));
      },
      
      // AI actions
      setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
      
      generateFromAI: async (prompt) => {
        set({ isAIGenerating: true });
        
        try {
          // Add user message
          get().addAIMessage({
            role: 'user',
            content: prompt
          });
          
          // Simulate AI generation (replace with actual AI service)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Mock AI response - replace with actual AI integration
          const mockNodes: Node[] = [
            {
              id: 'ai-1',
              type: 'process',
              position: { x: 100, y: 100 },
              data: { label: 'AI Generated Start', shape: 'rectangle' }
            },
            {
              id: 'ai-2',
              type: 'process',
              position: { x: 300, y: 100 },
              data: { label: 'AI Generated Process', shape: 'rectangle' }
            }
          ];
          
          const mockEdges: Edge[] = [
            {
              id: 'ai-edge-1',
              source: 'ai-1',
              target: 'ai-2',
              type: 'smoothstep'
            }
          ];
          
          // Add AI response message
          get().addAIMessage({
            role: 'assistant',
            content: 'Generated diagram based on your prompt',
            diagramGenerated: true
          });
          
          return { nodes: mockNodes, edges: mockEdges };
          
        } catch (error) {
          console.error('AI generation failed:', error);
          
          get().addAIMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error while generating the diagram. Please try again.'
          });
          
          return null;
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
      
      clearAIConversation: () => set({ aiConversations: [] }),
      
      // Utility actions
      getTemplatesByCategory: (category) => {
        return get().customTemplates.filter(template => template.category === category);
      },
      
      searchTemplates: (query) => {
        const searchTerm = query.toLowerCase();
        return get().customTemplates.filter(template =>
          template.name.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      },
      
      getRecentTemplates: () => {
        const recentIds = get().recentTemplates;
        const customTemplates = get().customTemplates;
        return recentIds.map(id => customTemplates.find(t => t.id === id)).filter(Boolean) as DiagramTemplate[];
      },
      
      getFavoriteTemplates: () => {
        const favoriteIds = get().favoriteTemplates;
        const customTemplates = get().customTemplates;
        return favoriteIds.map(id => customTemplates.find(t => t.id === id)).filter(Boolean) as DiagramTemplate[];
      },
    }),
    {
      name: 'diagram-templates-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customTemplates: state.customTemplates,
        favoriteTemplates: state.favoriteTemplates,
        recentTemplates: state.recentTemplates,
      })
    }
  )
);