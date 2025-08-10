/**
 * Comprehensive Test Suite for AR Editor
 * Unit tests for DiagramStore and core functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiagramStore } from '../../../stores/diagramStore';
import { Node, Edge } from 'reactflow';

describe('DiagramStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { resetAll } = useDiagramStore.getState();
    resetAll();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Node Operations', () => {
    it('should add a new node', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'test-node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' }
        });
      });

      const nodes = result.current.nodes;
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('test-node-1');
      expect(nodes[0].data.label).toBe('Test Node');
    });

    it('should update an existing node', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'test-node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' }
        });
      });

      act(() => {
        result.current.updateNode('test-node-1', {
          position: { x: 200, y: 200 },
          data: { label: 'Updated Node' }
        });
      });

      const nodes = result.current.nodes;
      expect(nodes[0].position).toEqual({ x: 200, y: 200 });
      expect(nodes[0].data.label).toBe('Updated Node');
    });

    it('should delete a node', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'test-node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' }
        });
      });

      expect(result.current.nodes).toHaveLength(1);

      act(() => {
        result.current.deleteNode('test-node-1');
      });

      expect(result.current.nodes).toHaveLength(0);
    });

    it('should delete connected edges when deleting a node', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add two nodes
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
        result.current.addNode({
          id: 'node-2',
          type: 'custom',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' }
        });
      });

      // Add edge between them
      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2'
        });
      });

      expect(result.current.edges).toHaveLength(1);

      // Delete source node
      act(() => {
        result.current.deleteNode('node-1');
      });

      // Edge should be deleted too
      expect(result.current.edges).toHaveLength(0);
      expect(result.current.nodes).toHaveLength(1);
    });
  });

  describe('Edge Operations', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
        result.current.addNode({
          id: 'node-2',
          type: 'custom',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' }
        });
      });
    });

    it('should add a new edge', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2'
        });
      });

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0].source).toBe('node-1');
      expect(result.current.edges[0].target).toBe('node-2');
    });

    it('should update an existing edge', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          label: 'Original Label'
        });
      });

      act(() => {
        result.current.updateEdge('edge-1', {
          label: 'Updated Label',
          animated: true
        });
      });

      expect(result.current.edges[0].label).toBe('Updated Label');
      expect(result.current.edges[0].animated).toBe(true);
    });

    it('should delete an edge', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2'
        });
      });

      expect(result.current.edges).toHaveLength(1);

      act(() => {
        result.current.deleteEdge('edge-1');
      });

      expect(result.current.edges).toHaveLength(0);
    });
  });

  describe('Selection Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
        result.current.addNode({
          id: 'node-2',
          type: 'custom',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' }
        });
      });
    });

    it('should select a single node', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.selectNode('node-1');
      });

      expect(result.current.selectedNodes).toContain('node-1');
      expect(result.current.selectedNodes).toHaveLength(1);
    });

    it('should select multiple nodes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.selectNode('node-1', true);
        result.current.selectNode('node-2', true);
      });

      expect(result.current.selectedNodes).toContain('node-1');
      expect(result.current.selectedNodes).toContain('node-2');
      expect(result.current.selectedNodes).toHaveLength(2);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.selectNode('node-1');
        result.current.selectNode('node-2', true);
      });

      expect(result.current.selectedNodes).toHaveLength(2);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedNodes).toHaveLength(0);
    });

    it('should select all nodes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedNodes).toHaveLength(2);
      expect(result.current.selectedNodes).toContain('node-1');
      expect(result.current.selectedNodes).toContain('node-2');
    });
  });

  describe('History Management', () => {
    it('should save state to history', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
      });

      expect(result.current.canUndo()).toBe(true);
    });

    it('should undo changes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add node and save to history
      act(() => {
        result.current.saveToHistory();
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
      });

      expect(result.current.nodes).toHaveLength(1);

      act(() => {
        result.current.undo();
      });

      expect(result.current.nodes).toHaveLength(0);
    });

    it('should redo changes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add node, undo, then redo
      act(() => {
        result.current.saveToHistory();
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.nodes).toHaveLength(0);
      expect(result.current.canRedo()).toBe(true);

      act(() => {
        result.current.redo();
      });

      expect(result.current.nodes).toHaveLength(1);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
        result.current.addNode({
          id: 'node-2',
          type: 'custom',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' }
        });
        result.current.selectNode('node-1');
        result.current.selectNode('node-2', true);
      });
    });

    it('should duplicate selected nodes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.duplicateSelected();
      });

      expect(result.current.nodes).toHaveLength(4);
      // New nodes should have different IDs
      const nodeIds = result.current.nodes.map(n => n.id);
      const uniqueIds = new Set(nodeIds);
      expect(uniqueIds.size).toBe(4);
    });

    it('should delete selected nodes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.deleteSelected();
      });

      expect(result.current.nodes).toHaveLength(0);
      expect(result.current.selectedNodes).toHaveLength(0);
    });

    it('should align selected nodes', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.alignNodes('left');
      });

      const nodes = result.current.nodes;
      expect(nodes[0].position.x).toBe(nodes[1].position.x);
    });
  });

  describe('Template Operations', () => {
    it('should apply a template', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const template = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        nodes: [
          {
            id: 'template-node-1',
            type: 'custom',
            position: { x: 50, y: 50 },
            data: { label: 'Template Node' }
          }
        ] as Node[],
        edges: [] as Edge[],
        tags: ['test'],
        complexity: 'Simple' as const
      };

      act(() => {
        result.current.applyTemplate(template);
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].data.label).toBe('Template Node');
      expect(result.current.projectName).toBe('Test Template');
    });

    it('should save current diagram as template', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
      });

      act(() => {
        result.current.saveAsTemplate('My Template', 'Custom template', 'custom');
      });

      expect(result.current.customTemplates).toHaveLength(1);
      expect(result.current.customTemplates[0].name).toBe('My Template');
      expect(result.current.customTemplates[0].nodes).toHaveLength(1);
    });
  });

  describe('AI Integration', () => {
    it('should manage AI conversation', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addAIMessage({
          role: 'user',
          content: 'Create a flowchart'
        });
      });

      expect(result.current.aiConversations).toHaveLength(1);
      expect(result.current.aiConversations[0].role).toBe('user');
      expect(result.current.aiConversations[0].content).toBe('Create a flowchart');
    });

    it('should clear AI conversation', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addAIMessage({
          role: 'user',
          content: 'Create a flowchart'
        });
        result.current.addAIMessage({
          role: 'assistant',
          content: 'Here is your flowchart'
        });
      });

      expect(result.current.aiConversations).toHaveLength(2);

      act(() => {
        result.current.clearAIConversation();
      });

      expect(result.current.aiConversations).toHaveLength(0);
    });
  });

  describe('Project Management', () => {
    it('should update project name', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.setProjectName('My Awesome Project');
      });

      expect(result.current.projectName).toBe('My Awesome Project');
    });

    it('should update project description', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.setProjectDescription('This is a test project');
      });

      expect(result.current.projectDescription).toBe('This is a test project');
    });

    it('should track last modified date', () => {
      const { result } = renderHook(() => useDiagramStore());
      const beforeTime = new Date();
      
      act(() => {
        result.current.setProjectName('Updated Project');
      });

      const afterTime = new Date();
      const lastModified = result.current.lastModified;
      
      expect(lastModified.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(lastModified.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('UI State Management', () => {
    it('should toggle panels', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const initialState = result.current.panelStates.leftPanel;
      
      act(() => {
        result.current.togglePanel('leftPanel');
      });

      expect(result.current.panelStates.leftPanel).toBe(!initialState);
    });

    it('should update zoom level', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.setZoom(1.5);
      });

      expect(result.current.zoom).toBe(1.5);
    });

    it('should update canvas position', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.setCanvasPosition({ x: 100, y: 200 });
      });

      expect(result.current.canvasPosition).toEqual({ x: 100, y: 200 });
    });

    it('should update grid settings', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.setShowGrid(false);
        result.current.setSnapToGrid(false);
        result.current.setGridSize(30);
      });

      expect(result.current.showGrid).toBe(false);
      expect(result.current.snapToGrid).toBe(false);
      expect(result.current.gridSize).toBe(30);
    });
  });

  describe('Reset Operations', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        });
        result.current.setProjectName('Test Project');
        result.current.addAIMessage({
          role: 'user',
          content: 'Test message'
        });
      });
    });

    it('should reset diagram only', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.resetDiagram();
      });

      expect(result.current.nodes).toHaveLength(0);
      expect(result.current.edges).toHaveLength(0);
      expect(result.current.selectedNodes).toHaveLength(0);
      // Project name should remain
      expect(result.current.projectName).toBe('Test Project');
      // AI conversation should remain
      expect(result.current.aiConversations).toHaveLength(1);
    });

    it('should reset everything', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      act(() => {
        result.current.resetAll();
      });

      expect(result.current.nodes).toHaveLength(0);
      expect(result.current.edges).toHaveLength(0);
      expect(result.current.selectedNodes).toHaveLength(0);
      expect(result.current.projectName).toBe('Untitled Diagram');
      expect(result.current.aiConversations).toHaveLength(0);
      expect(result.current.history.past).toHaveLength(0);
      expect(result.current.history.future).toHaveLength(0);
    });
  });
});