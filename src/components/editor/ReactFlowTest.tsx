/**
 * React Flow Test Component
 * Simple test to verify React Flow renders without dimension errors
 */

import React, { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  NodeTypes,
  Background,
  BackgroundVariant,
  Controls
} from 'reactflow';
import 'reactflow/dist/style.css';

// Simple test node component
const TestNode: React.FC<any> = ({ data }) => {
  return (
    <div style={{
      padding: '10px',
      background: '#f8fafc',
      border: '2px solid #2563eb',
      borderRadius: '8px',
      minWidth: '100px',
      textAlign: 'center'
    }}>
      {data.label}
    </div>
  );
};

// Node types defined outside component
const nodeTypes: NodeTypes = {
  test: TestNode
};

// Test nodes and edges
const testNodes: Node[] = [
  {
    id: '1',
    type: 'test',
    position: { x: 100, y: 100 },
    data: { label: 'Test Node 1' }
  },
  {
    id: '2',
    type: 'test',
    position: { x: 300, y: 100 },
    data: { label: 'Test Node 2' }
  }
];

const testEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'Test Edge'
  }
];

export const ReactFlowTest: React.FC = () => {
  // Memoize nodeTypes to prevent recreation
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div style={{
      width: '100%',
      height: '400px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px'
    }}>
      <ReactFlow
        nodes={testNodes}
        edges={testEdges}
        nodeTypes={memoizedNodeTypes}
        fitView
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  );
}; 