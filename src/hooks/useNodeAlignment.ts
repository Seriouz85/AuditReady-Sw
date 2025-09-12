/**
 * 🎯 Node Alignment Hook - Smart Drag & Alignment System
 * Fixes jumping issues and enables perfect center-to-center alignment
 */

import { useCallback } from 'react';
import { Node } from 'reactflow';

interface NodeDimensions {
  width: number;
  height: number;
}

interface NodeCenter {
  x: number;
  y: number;
}

interface AlignmentGuides {
  vertical: number | null;
  horizontal: number | null;
}

export const useNodeAlignment = (nodes: Node[]) => {
  const SNAP_DISTANCE = 30; // Distance for snapping to alignment guides

  /**
   * Get node dimensions - handles different node shapes and sizes
   */
  const getNodeDimensions = useCallback((node: Node): NodeDimensions => {
    // Get dimensions from style first (most accurate)
    if (node.style?.width && node.style?.height) {
      const width = typeof node.style.width === 'string' 
        ? parseInt(node.style.width.replace('px', '')) 
        : node.style.width;
      const height = typeof node.style.height === 'string' 
        ? parseInt(node.style.height.replace('px', '')) 
        : node.style.height;
      return { width, height };
    }

    // Get from data if available
    if (node.data?.autoWidth && node.data?.autoHeight) {
      return { 
        width: node.data.autoWidth, 
        height: node.data.autoHeight 
      };
    }

    // Shape-specific defaults based on SmartNodeTypes
    const shape = node.data?.shape || 'rectangle';
    
    switch (shape) {
      case 'circle':
        return { width: 80, height: 80 };
      case 'database':
        return { width: 120, height: 60 };
      case 'server':
        return { width: 120, height: 80 };
      case 'user':
        return { width: 60, height: 80 };
      case 'team':
        return { width: 140, height: 60 };
      case 'cloud':
        return { width: 140, height: 60 };
      case 'hexagon':
      case 'parallelogram':
        return { width: 140, height: 60 };
      case 'rectangle':
      default:
        return { width: 120, height: 40 };
    }
  }, []);

  /**
   * Calculate node center point
   */
  const getNodeCenter = useCallback((node: Node): NodeCenter => {
    const dimensions = getNodeDimensions(node);
    return {
      x: node.position.x + dimensions.width / 2,
      y: node.position.y + dimensions.height / 2
    };
  }, [getNodeDimensions]);

  /**
   * Find alignment guides from other nodes
   */
  const findAlignmentGuides = useCallback((draggedNode: Node, otherNodes: Node[]): AlignmentGuides => {
    const draggedCenter = getNodeCenter(draggedNode);
    let closestVertical: number | null = null;
    let closestHorizontal: number | null = null;
    let minVerticalDistance = SNAP_DISTANCE;
    let minHorizontalDistance = SNAP_DISTANCE;

    otherNodes.forEach(otherNode => {
      if (otherNode.id === draggedNode.id) return;

      const otherCenter = getNodeCenter(otherNode);

      // Check vertical alignment (X-axis)
      const verticalDistance = Math.abs(draggedCenter.x - otherCenter.x);
      if (verticalDistance < minVerticalDistance) {
        minVerticalDistance = verticalDistance;
        closestVertical = otherCenter.x;
      }

      // Check horizontal alignment (Y-axis)
      const horizontalDistance = Math.abs(draggedCenter.y - otherCenter.y);
      if (horizontalDistance < minHorizontalDistance) {
        minHorizontalDistance = horizontalDistance;
        closestHorizontal = otherCenter.y;
      }
    });

    return {
      vertical: closestVertical,
      horizontal: closestHorizontal
    };
  }, [getNodeCenter, SNAP_DISTANCE]);

  /**
   * Calculate aligned position for a node
   */
  const calculateAlignedPosition = useCallback((
    node: Node, 
    guides: AlignmentGuides
  ): { x: number; y: number } => {
    const dimensions = getNodeDimensions(node);
    let newX = node.position.x;
    let newY = node.position.y;

    // Apply vertical alignment (center X coordinates)
    if (guides.vertical !== null) {
      newX = guides.vertical - dimensions.width / 2;
      console.log(`🎯 Vertical alignment: node center X will be ${guides.vertical}, node position X: ${newX}`);
    }

    // Apply horizontal alignment (center Y coordinates)  
    if (guides.horizontal !== null) {
      newY = guides.horizontal - dimensions.height / 2;
      console.log(`🎯 Horizontal alignment: node center Y will be ${guides.horizontal}, node position Y: ${newY}`);
    }

    return { x: newX, y: newY };
  }, [getNodeDimensions]);

  /**
   * Main drag handler with smart alignment
   */
  const handleNodeDrag = useCallback((event: React.MouseEvent, draggedNode: Node) => {
    console.log('🔥 Node drag started:', draggedNode.id, draggedNode.position);

    // Get all other nodes for alignment reference
    const otherNodes = nodes.filter(n => n.id !== draggedNode.id);
    
    if (otherNodes.length === 0) {
      console.log('No other nodes for alignment');
      return;
    }

    // Find alignment guides
    const guides = findAlignmentGuides(draggedNode, otherNodes);
    console.log('🎯 Alignment guides found:', guides);

    // Apply alignment if guides are found
    if (guides.vertical !== null || guides.horizontal !== null) {
      const alignedPosition = calculateAlignedPosition(draggedNode, guides);
      
      console.log(`🎯 Applying alignment:`, {
        original: draggedNode.position,
        aligned: alignedPosition,
        guides
      });

      // Update node position directly (this will be handled by ReactFlow's state management)
      draggedNode.position.x = alignedPosition.x;
      draggedNode.position.y = alignedPosition.y;

      // Log the final centers for debugging
      const finalCenter = getNodeCenter(draggedNode);
      console.log(`🎯 Final dragged node center:`, finalCenter);
      
      // Log nearby node centers for comparison
      otherNodes.forEach(otherNode => {
        const otherCenter = getNodeCenter(otherNode);
        const distance = Math.sqrt(
          Math.pow(finalCenter.x - otherCenter.x, 2) + 
          Math.pow(finalCenter.y - otherCenter.y, 2)
        );
        if (distance < 100) { // Only log nearby nodes
          console.log(`📍 Nearby node ${otherNode.id} center:`, otherCenter, `Distance: ${distance.toFixed(1)}px`);
        }
      });
    }
  }, [nodes, findAlignmentGuides, calculateAlignedPosition, getNodeCenter]);

  /**
   * Get visual alignment guides for UI feedback
   */
  const getAlignmentGuidesForUI = useCallback((draggedNode: Node): AlignmentGuides => {
    const otherNodes = nodes.filter(n => n.id !== draggedNode.id);
    return findAlignmentGuides(draggedNode, otherNodes);
  }, [nodes, findAlignmentGuides]);

  /**
   * Check if two nodes are aligned
   */
  const areNodesAligned = useCallback((node1: Node, node2: Node, tolerance: number = 5): {
    vertically: boolean;
    horizontally: boolean;
  } => {
    const center1 = getNodeCenter(node1);
    const center2 = getNodeCenter(node2);

    return {
      vertically: Math.abs(center1.x - center2.x) <= tolerance,
      horizontally: Math.abs(center1.y - center2.y) <= tolerance
    };
  }, [getNodeCenter]);

  /**
   * Get all aligned node groups
   */
  const getAlignedGroups = useCallback((): {
    verticalGroups: Node[][];
    horizontalGroups: Node[][];
  } => {
    const verticalGroups: Node[][] = [];
    const horizontalGroups: Node[][] = [];
    const processedNodes = new Set<string>();

    nodes.forEach(node => {
      if (processedNodes.has(node.id)) return;

      const verticalGroup = nodes.filter(otherNode => 
        areNodesAligned(node, otherNode).vertically
      );

      const horizontalGroup = nodes.filter(otherNode => 
        areNodesAligned(node, otherNode).horizontally
      );

      if (verticalGroup.length > 1) {
        verticalGroups.push(verticalGroup);
        verticalGroup.forEach(n => processedNodes.add(n.id));
      }

      if (horizontalGroup.length > 1) {
        horizontalGroups.push(horizontalGroup);
        horizontalGroup.forEach(n => processedNodes.add(n.id));
      }
    });

    return { verticalGroups, horizontalGroups };
  }, [nodes, areNodesAligned]);

  return {
    handleNodeDrag,
    getNodeDimensions,
    getNodeCenter,
    getAlignmentGuidesForUI,
    areNodesAligned,
    getAlignedGroups,
    SNAP_DISTANCE
  };
};

export type { NodeDimensions, NodeCenter, AlignmentGuides };