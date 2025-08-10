/**
 * Custom hook for diagram operations
 * Handles node/edge manipulation, selection, and transformations
 */

import { useCallback, useMemo } from 'react';
import { Node, Edge, Connection, addEdge, MarkerType } from 'reactflow';
import { useDiagramStore } from '../../stores/diagramStore';
import { v4 as uuidv4 } from 'uuid';

export const useDiagramOperations = () => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addEdgeToStore,
    updateEdge,
    deleteEdge,
    selectedNodes,
    selectedEdges,
    selectNode,
    selectEdge,
    clearSelection,
    selectAll,
    duplicateSelected,
    deleteSelected,
    alignNodes,
    distributeNodes,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDiagramStore();

  // Node operations
  const handleNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      let updatedNodes = [...nds];
      
      changes.forEach((change: any) => {
        switch (change.type) {
          case 'position':
            updatedNodes = updatedNodes.map(node =>
              node.id === change.id
                ? { ...node, position: change.position }
                : node
            );
            break;
          case 'dimensions':
            updatedNodes = updatedNodes.map(node =>
              node.id === change.id
                ? { ...node, ...change.dimensions }
                : node
            );
            break;
          case 'remove':
            updatedNodes = updatedNodes.filter(node => node.id !== change.id);
            break;
          case 'select':
            if (change.selected) {
              selectNode(change.id, true);
            }
            break;
        }
      });
      
      return updatedNodes;
    });
  }, [setNodes, selectNode]);

  // Edge operations
  const handleEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      let updatedEdges = [...eds];
      
      changes.forEach((change: any) => {
        switch (change.type) {
          case 'remove':
            updatedEdges = updatedEdges.filter(edge => edge.id !== change.id);
            break;
          case 'select':
            if (change.selected) {
              selectEdge(change.id, true);
            }
            break;
        }
      });
      
      return updatedEdges;
    });
  }, [setEdges, selectEdge]);

  // Connection handling
  const handleConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    saveToHistory();
    
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}-${uuidv4()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle || undefined,
      targetHandle: params.targetHandle || undefined,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#1e293b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [saveToHistory, setEdges]);

  // Create node with smart positioning
  const createNode = useCallback((type: string = 'default', position?: { x: number; y: number }) => {
    const nodePosition = position || {
      x: Math.random() * 500 + 100,
      y: Math.random() * 300 + 100
    };

    const nodeTypes = {
      default: { shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569' },
      decision: { shape: 'diamond', fillColor: '#fef3c7', strokeColor: '#d97706' },
      start: { shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb' },
      end: { shape: 'circle', fillColor: '#dcfce7', strokeColor: '#16a34a' },
      process: { shape: 'rectangle', fillColor: '#e0e7ff', strokeColor: '#6366f1' },
      data: { shape: 'parallelogram', fillColor: '#fce7f3', strokeColor: '#ec4899' }
    };

    const nodeConfig = nodeTypes[type as keyof typeof nodeTypes] || nodeTypes.default;

    addNode({
      type: 'custom',
      position: nodePosition,
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        ...nodeConfig,
        strokeWidth: 2,
        textColor: '#1e293b',
        onLabelChange: (id: string, newLabel: string) => {
          updateNode(id, { data: { ...nodes.find(n => n.id === id)?.data, label: newLabel } });
        },
        onUpdate: (id: string, updates: any) => {
          updateNode(id, { data: { ...nodes.find(n => n.id === id)?.data, ...updates } });
        }
      }
    });
  }, [addNode, updateNode, nodes]);

  // Batch operations
  const batchUpdateNodes = useCallback((updates: { id: string; changes: Partial<Node> }[]) => {
    saveToHistory();
    setNodes((nds) => {
      const updatedNodes = [...nds];
      updates.forEach(({ id, changes }) => {
        const index = updatedNodes.findIndex(n => n.id === id);
        if (index !== -1) {
          updatedNodes[index] = { ...updatedNodes[index], ...changes };
        }
      });
      return updatedNodes;
    });
  }, [saveToHistory, setNodes]);

  // Smart edge creation with automatic handle detection
  const createSmartEdge = useCallback((sourceId: string, targetId: string, label?: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return;
    
    // Determine best handles based on relative positions
    let sourceHandle = 'bottom-source';
    let targetHandle = 'top-target';
    
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      sourceHandle = dx > 0 ? 'right-source' : 'left-source';
      targetHandle = dx > 0 ? 'left-target' : 'right-target';
    } else {
      sourceHandle = dy > 0 ? 'bottom-source' : 'top-source';
      targetHandle = dy > 0 ? 'top-target' : 'bottom-target';
    }
    
    const newEdge: Edge = {
      id: `e${sourceId}-${targetId}-${uuidv4()}`,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
      type: 'smoothstep',
      label,
      animated: false,
      style: { stroke: '#1e293b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
    };
    
    addEdgeToStore(newEdge);
  }, [nodes, addEdgeToStore]);

  // Node style operations
  const updateNodeStyle = useCallback((nodeId: string, style: any) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    updateNode(nodeId, {
      data: { ...node.data, ...style }
    });
  }, [nodes, updateNode]);

  // Edge style operations
  const updateEdgeStyle = useCallback((edgeId: string, style: any) => {
    updateEdge(edgeId, { style });
  }, [updateEdge]);

  // Selection operations
  const selectNodesByType = useCallback((type: string) => {
    const nodeIds = nodes
      .filter(n => n.type === type || n.data?.shape === type)
      .map(n => n.id);
    
    clearSelection();
    nodeIds.forEach(id => selectNode(id, true));
  }, [nodes, clearSelection, selectNode]);

  // Find connected nodes
  const getConnectedNodes = useCallback((nodeId: string) => {
    const connectedNodeIds = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      } else if (edge.target === nodeId) {
        connectedNodeIds.add(edge.source);
      }
    });
    
    return nodes.filter(n => connectedNodeIds.has(n.id));
  }, [nodes, edges]);

  // Path finding
  const findPath = useCallback((startId: string, endId: string): string[] | null => {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === endId) {
        return path;
      }
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      edges.forEach(edge => {
        if (edge.source === nodeId && !visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, path: [...path, edge.target] });
        }
      });
    }
    
    return null;
  }, [edges]);

  // Validation
  const validateDiagram = useCallback(() => {
    const issues: string[] = [];
    
    // Check for orphaned nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const orphanedNodes = nodes.filter(n => !connectedNodes.has(n.id));
    if (orphanedNodes.length > 0) {
      issues.push(`${orphanedNodes.length} orphaned node(s) found`);
    }
    
    // Check for circular dependencies
    const hasCycles = nodes.some(node => {
      const path = findPath(node.id, node.id);
      return path && path.length > 1;
    });
    
    if (hasCycles) {
      issues.push('Circular dependencies detected');
    }
    
    return issues;
  }, [nodes, edges, findPath]);

  // Statistics
  const diagramStats = useMemo(() => ({
    nodeCount: nodes.length,
    edgeCount: edges.length,
    selectedCount: selectedNodes.length + selectedEdges.length,
    nodeTypes: nodes.reduce((acc, node) => {
      const type = node.data?.shape || node.type || 'default';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }), [nodes, edges, selectedNodes, selectedEdges]);

  return {
    // State
    nodes,
    edges,
    selectedNodes,
    selectedEdges,
    diagramStats,
    
    // Node operations
    handleNodesChange,
    createNode,
    updateNodeStyle,
    batchUpdateNodes,
    
    // Edge operations
    handleEdgesChange,
    handleConnect,
    createSmartEdge,
    updateEdgeStyle,
    
    // Selection
    clearSelection,
    selectAll,
    selectNodesByType,
    
    // Bulk operations
    duplicateSelected,
    deleteSelected,
    alignNodes,
    distributeNodes,
    
    // History
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    
    // Utilities
    getConnectedNodes,
    findPath,
    validateDiagram
  };
};