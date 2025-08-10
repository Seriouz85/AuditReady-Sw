/**
 * Advanced Auto-Layout Hook
 * Implements multiple layout algorithms for intelligent diagram organization
 */

import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramStore } from '../../stores/diagramStore';

// Layout algorithm types
export type LayoutAlgorithm = 'dagre' | 'elk' | 'force' | 'circular' | 'grid' | 'hierarchical' | 'organic';

// Layout configuration options
interface LayoutConfig {
  algorithm: LayoutAlgorithm;
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  spacing?: {
    node: number;
    rank: number;
    edge: number;
  };
  alignment?: 'UL' | 'UR' | 'DL' | 'DR' | 'CENTER';
  animate?: boolean;
  preserveGroups?: boolean;
}

// Default configurations for each algorithm
const defaultConfigs: Record<LayoutAlgorithm, LayoutConfig> = {
  dagre: {
    algorithm: 'dagre',
    direction: 'TB',
    spacing: { node: 50, rank: 100, edge: 20 },
    alignment: 'CENTER',
    animate: true
  },
  elk: {
    algorithm: 'elk',
    direction: 'TB',
    spacing: { node: 60, rank: 120, edge: 30 },
    alignment: 'CENTER',
    animate: true
  },
  force: {
    algorithm: 'force',
    spacing: { node: 100, rank: 150, edge: 50 },
    animate: true
  },
  circular: {
    algorithm: 'circular',
    spacing: { node: 80, rank: 200, edge: 40 },
    animate: true
  },
  grid: {
    algorithm: 'grid',
    spacing: { node: 150, rank: 150, edge: 30 },
    animate: false
  },
  hierarchical: {
    algorithm: 'hierarchical',
    direction: 'TB',
    spacing: { node: 70, rank: 150, edge: 30 },
    alignment: 'CENTER',
    animate: true
  },
  organic: {
    algorithm: 'organic',
    spacing: { node: 80, rank: 100, edge: 40 },
    animate: true
  }
};

export const useAutoLayout = () => {
  const { nodes, edges, setNodes, setEdges } = useDiagramStore();

  // Dagre layout implementation
  const applyDagreLayout = useCallback((config: LayoutConfig) => {
    const dagreGraph = new Map<string, any>();
    const nodeMap = new Map<string, Node>();
    
    // Build graph structure
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      dagreGraph.set(node.id, {
        ...node,
        width: node.width || 150,
        height: node.height || 50
      });
    });

    // Calculate hierarchy levels
    const levels = new Map<string, number>();
    const inDegree = new Map<string, number>();
    
    // Initialize in-degree count
    nodes.forEach(node => inDegree.set(node.id, 0));
    edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Topological sort to determine levels
    const queue: string[] = [];
    nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
        levels.set(node.id, 0);
      }
    });
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const currentLevel = levels.get(nodeId) || 0;
      
      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const newInDegree = (inDegree.get(edge.target) || 0) - 1;
          inDegree.set(edge.target, newInDegree);
          
          if (newInDegree === 0) {
            queue.push(edge.target);
            levels.set(edge.target, currentLevel + 1);
          }
        }
      });
    }
    
    // Position nodes based on levels
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(nodeId);
    });
    
    const updatedNodes = nodes.map(node => {
      const level = levels.get(node.id) || 0;
      const levelNodes = levelGroups.get(level) || [];
      const indexInLevel = levelNodes.indexOf(node.id);
      
      let x, y;
      
      if (config.direction === 'TB' || config.direction === 'BT') {
        x = (indexInLevel - (levelNodes.length - 1) / 2) * (config.spacing?.node || 150);
        y = level * (config.spacing?.rank || 100);
        if (config.direction === 'BT') y *= -1;
      } else {
        x = level * (config.spacing?.rank || 150);
        y = (indexInLevel - (levelNodes.length - 1) / 2) * (config.spacing?.node || 100);
        if (config.direction === 'RL') x *= -1;
      }
      
      return {
        ...node,
        position: { x: x + 400, y: y + 200 } // Center offset
      };
    });
    
    return updatedNodes;
  }, [nodes, edges]);

  // Force-directed layout implementation
  const applyForceLayout = useCallback((config: LayoutConfig) => {
    const nodeSpacing = config.spacing?.node || 100;
    const iterations = 100;
    const repulsionForce = 5000;
    const attractionForce = 0.1;
    const centerForce = 0.01;
    
    let positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    
    // Initialize positions
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(300, nodes.length * 10);
      positions.set(node.id, {
        x: node.position.x || Math.cos(angle) * radius,
        y: node.position.y || Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      });
    });
    
    // Run simulation
    for (let iteration = 0; iteration < iterations; iteration++) {
      const alpha = 1 - iteration / iterations;
      
      // Apply forces
      nodes.forEach(nodeA => {
        const posA = positions.get(nodeA.id)!;
        
        // Repulsion forces
        nodes.forEach(nodeB => {
          if (nodeA.id === nodeB.id) return;
          
          const posB = positions.get(nodeB.id)!;
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          if (distance < nodeSpacing * 3) {
            const force = repulsionForce / (distance * distance);
            posA.vx += (dx / distance) * force * alpha;
            posA.vy += (dy / distance) * force * alpha;
          }
        });
        
        // Attraction forces from edges
        edges.forEach(edge => {
          if (edge.source === nodeA.id) {
            const posB = positions.get(edge.target)!;
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            posA.vx += dx * attractionForce * alpha;
            posA.vy += dy * attractionForce * alpha;
          }
          if (edge.target === nodeA.id) {
            const posB = positions.get(edge.source)!;
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            
            posA.vx += dx * attractionForce * alpha;
            posA.vy += dy * attractionForce * alpha;
          }
        });
        
        // Center force
        posA.vx += -posA.x * centerForce * alpha;
        posA.vy += -posA.y * centerForce * alpha;
        
        // Update position
        posA.x += posA.vx;
        posA.y += posA.vy;
        
        // Damping
        posA.vx *= 0.85;
        posA.vy *= 0.85;
      });
    }
    
    const updatedNodes = nodes.map(node => {
      const pos = positions.get(node.id)!;
      return {
        ...node,
        position: { x: pos.x + 400, y: pos.y + 300 } // Center offset
      };
    });
    
    return updatedNodes;
  }, [nodes, edges]);

  // Circular layout implementation
  const applyCircularLayout = useCallback((config: LayoutConfig) => {
    const radius = Math.max(200, nodes.length * 15);
    const centerX = 400;
    const centerY = 300;
    
    const updatedNodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      return {
        ...node,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      };
    });
    
    return updatedNodes;
  }, [nodes]);

  // Grid layout implementation
  const applyGridLayout = useCallback((config: LayoutConfig) => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = config.spacing?.node || 150;
    
    const updatedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        ...node,
        position: {
          x: col * spacing + 100,
          y: row * spacing + 100
        }
      };
    });
    
    return updatedNodes;
  }, [nodes]);

  // Hierarchical layout (tree-like structure)
  const applyHierarchicalLayout = useCallback((config: LayoutConfig) => {
    // Find root nodes (nodes with no incoming edges)
    const incomingEdges = new Map<string, number>();
    nodes.forEach(node => incomingEdges.set(node.id, 0));
    edges.forEach(edge => {
      incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
    });
    
    const rootNodes = nodes.filter(node => incomingEdges.get(node.id) === 0);
    if (rootNodes.length === 0) {
      // Fallback to first node if no clear root
      rootNodes.push(nodes[0]);
    }
    
    // Build tree structure
    const tree = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!tree.has(edge.source)) tree.set(edge.source, []);
      tree.get(edge.source)!.push(edge.target);
    });
    
    // Position nodes level by level
    const positioned = new Set<string>();
    const levels: string[][] = [];
    
    const processLevel = (nodeIds: string[], level: number) => {
      if (!levels[level]) levels[level] = [];
      
      nodeIds.forEach(nodeId => {
        if (!positioned.has(nodeId)) {
          levels[level].push(nodeId);
          positioned.add(nodeId);
          
          // Process children
          const children = tree.get(nodeId) || [];
          if (children.length > 0) {
            processLevel(children, level + 1);
          }
        }
      });
    };
    
    processLevel(rootNodes.map(n => n.id), 0);
    
    const updatedNodes = nodes.map(node => {
      let level = 0;
      let indexInLevel = 0;
      
      // Find node's level and position
      levels.forEach((levelNodes, l) => {
        const index = levelNodes.indexOf(node.id);
        if (index !== -1) {
          level = l;
          indexInLevel = index;
        }
      });
      
      const levelWidth = levels[level]?.length || 1;
      const spacing = config.spacing?.node || 150;
      const levelSpacing = config.spacing?.rank || 120;
      
      return {
        ...node,
        position: {
          x: (indexInLevel - (levelWidth - 1) / 2) * spacing + 400,
          y: level * levelSpacing + 100
        }
      };
    });
    
    return updatedNodes;
  }, [nodes, edges]);

  // Organic layout (relaxed force-directed with clustering)
  const applyOrganicLayout = useCallback((config: LayoutConfig) => {
    // Similar to force layout but with clustering detection
    const clusters = detectClusters(nodes, edges);
    const clusterCenters = new Map<string, { x: number; y: number }>();
    
    // Position clusters in a circle
    clusters.forEach((cluster, index) => {
      const angle = (index / clusters.size) * 2 * Math.PI;
      const radius = Math.max(300, clusters.size * 50);
      clusterCenters.set(cluster.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    });
    
    const updatedNodes = nodes.map(node => {
      // Find which cluster this node belongs to
      let clusterCenter = { x: 0, y: 0 };
      for (const [clusterId, cluster] of clusters) {
        if (cluster.nodes.includes(node.id)) {
          clusterCenter = clusterCenters.get(clusterId) || { x: 0, y: 0 };
          break;
        }
      }
      
      // Add some randomness within the cluster
      const localOffset = 50;
      return {
        ...node,
        position: {
          x: clusterCenter.x + (Math.random() - 0.5) * localOffset + 400,
          y: clusterCenter.y + (Math.random() - 0.5) * localOffset + 300
        }
      };
    });
    
    return updatedNodes;
  }, [nodes, edges]);

  // Cluster detection helper
  const detectClusters = (nodes: Node[], edges: Edge[]) => {
    const clusters = new Map<string, { id: string; nodes: string[] }>();
    const visited = new Set<string>();
    
    const dfs = (nodeId: string, clusterId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      if (!clusters.has(clusterId)) {
        clusters.set(clusterId, { id: clusterId, nodes: [] });
      }
      clusters.get(clusterId)!.nodes.push(nodeId);
      
      // Visit connected nodes
      edges.forEach(edge => {
        if (edge.source === nodeId && !visited.has(edge.target)) {
          dfs(edge.target, clusterId);
        } else if (edge.target === nodeId && !visited.has(edge.source)) {
          dfs(edge.source, clusterId);
        }
      });
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, `cluster-${clusters.size}`);
      }
    });
    
    return clusters;
  };

  // Main layout application function
  const applyLayout = useCallback(async (algorithm: LayoutAlgorithm, customConfig?: Partial<LayoutConfig>) => {
    const config = { ...defaultConfigs[algorithm], ...customConfig };
    let updatedNodes: Node[];
    
    switch (algorithm) {
      case 'dagre':
      case 'hierarchical':
        updatedNodes = applyDagreLayout(config);
        break;
      case 'force':
        updatedNodes = applyForceLayout(config);
        break;
      case 'circular':
        updatedNodes = applyCircularLayout(config);
        break;
      case 'grid':
        updatedNodes = applyGridLayout(config);
        break;
      case 'organic':
        updatedNodes = applyOrganicLayout(config);
        break;
      default:
        updatedNodes = applyDagreLayout(config);
    }
    
    // Apply animation if requested
    if (config.animate) {
      // Animate node positions over time
      const startPositions = new Map(nodes.map(n => [n.id, n.position]));
      const endPositions = new Map(updatedNodes.map(n => [n.id, n.position]));
      
      const animationSteps = 20;
      for (let step = 0; step <= animationSteps; step++) {
        const progress = step / animationSteps;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        
        const animatedNodes = nodes.map(node => {
          const startPos = startPositions.get(node.id) || node.position;
          const endPos = endPositions.get(node.id) || node.position;
          
          return {
            ...node,
            position: {
              x: startPos.x + (endPos.x - startPos.x) * easedProgress,
              y: startPos.y + (endPos.y - startPos.y) * easedProgress
            }
          };
        });
        
        setNodes(animatedNodes);
        
        if (step < animationSteps) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } else {
      setNodes(updatedNodes);
    }
  }, [nodes, edges, setNodes, applyDagreLayout, applyForceLayout, applyCircularLayout, applyGridLayout, applyOrganicLayout]);

  // Get layout suggestions based on diagram characteristics
  const getLayoutSuggestions = useCallback(() => {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const connectivity = edgeCount / Math.max(nodeCount, 1);
    
    const suggestions: { algorithm: LayoutAlgorithm; reason: string; score: number }[] = [];
    
    // Analyze diagram characteristics
    const isHierarchical = detectHierarchy(nodes, edges);
    const hasCycles = detectCycles(nodes, edges);
    const clusterCount = detectClusters(nodes, edges).size;
    
    // Score different algorithms
    if (isHierarchical && !hasCycles) {
      suggestions.push({ algorithm: 'dagre', reason: 'Clear hierarchical structure', score: 9 });
      suggestions.push({ algorithm: 'hierarchical', reason: 'Tree-like organization', score: 8 });
    }
    
    if (nodeCount <= 20 && connectivity > 0.3) {
      suggestions.push({ algorithm: 'force', reason: 'Small, well-connected diagram', score: 8 });
    }
    
    if (nodeCount <= 10) {
      suggestions.push({ algorithm: 'circular', reason: 'Small diagram, good for overview', score: 7 });
    }
    
    if (nodeCount > 50) {
      suggestions.push({ algorithm: 'grid', reason: 'Large diagram, grid provides structure', score: 6 });
    }
    
    if (clusterCount > 1 && clusterCount < nodeCount / 3) {
      suggestions.push({ algorithm: 'organic', reason: 'Multiple clusters detected', score: 8 });
    }
    
    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);
    
    return suggestions.slice(0, 3);
  }, [nodes, edges]);

  // Helper function to detect hierarchy
  const detectHierarchy = (nodes: Node[], edges: Edge[]) => {
    const inDegree = new Map<string, number>();
    nodes.forEach(node => inDegree.set(node.id, 0));
    edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    const rootNodes = Array.from(inDegree.entries()).filter(([, degree]) => degree === 0);
    return rootNodes.length > 0 && rootNodes.length < nodes.length;
  };

  // Helper function to detect cycles
  const detectCycles = (nodes: Node[], edges: Edge[]) => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (hasCycleDFS(edge.target)) return true;
        } else if (recursionStack.has(edge.target)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }
    
    return false;
  };

  return {
    applyLayout,
    getLayoutSuggestions,
    algorithms: Object.keys(defaultConfigs) as LayoutAlgorithm[]
  };
};