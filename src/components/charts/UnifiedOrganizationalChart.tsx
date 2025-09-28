/**
 * 🏢 Unified Organizational Chart - ReactFlow-based replacement for D3
 * Enterprise-grade organizational chart with hierarchical layout and interactive features
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Position
} from 'reactflow';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut, RefreshCw, AlertCircle } from 'lucide-react';
import 'reactflow/dist/style.css';

// Types
export interface OrgNodeData {
  id: string;
  parentId?: string | null;
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  department?: string;
  hierarchyLevel?: number;
  _expanded?: boolean;
  [key: string]: any;
}

interface UnifiedOrganizationalChartProps {
  data: OrgNodeData[];
  onNodeClick?: (node: OrgNodeData) => void;
  className?: string;
  debug?: boolean;
}

// Organizational Node Component
const OrganizationalNode: React.FC<{ data: OrgNodeData }> = ({ data }) => {
  const hasAvatar = Boolean(data.avatar);
  const department = data.department || '';

  return (
    <div className="transition-all duration-200 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 w-60 h-32 overflow-hidden group">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          {hasAvatar ? (
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
              <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-medium text-lg">
                {data.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {data.name || 'Unnamed'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
              {data.role || 'No role'}
            </div>
          </div>
        </div>
        {department && (
          <div className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full self-start mb-2">
            {department}
          </div>
        )}
        {data.email && (
          <div className="mt-auto text-xs text-slate-500 dark:text-slate-400 truncate">
            {data.email}
          </div>
        )}
      </div>
    </div>
  );
};

// Custom node types for ReactFlow
const nodeTypes = {
  organizational: OrganizationalNode,
};

// Helper function to calculate hierarchical layout
const calculateHierarchicalLayout = (orgData: OrgNodeData[]): { nodes: Node[]; edges: Edge[] } => {
  if (!orgData || orgData.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Create a map for quick lookups
  const nodeMap = new Map<string, OrgNodeData>();
  orgData.forEach(node => {
    nodeMap.set(node.id, node);
  });

  // Find root nodes (no parentId or parentId is null)
  const rootNodes = orgData.filter(node => !node.parentId);
  
  // Build hierarchy levels
  const levels: OrgNodeData[][] = [];
  const visited = new Set<string>();
  
  const assignLevels = (nodes: OrgNodeData[], level: number) => {
    if (!levels[level]) levels[level] = [];
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visited.add(node.id);
        node.hierarchyLevel = level;
        levels[level].push(node);
        
        // Find children
        const children = orgData.filter(child => child.parentId === node.id);
        if (children.length > 0) {
          assignLevels(children, level + 1);
        }
      }
    });
  };

  assignLevels(rootNodes, 0);

  // Calculate positions
  const nodeSpacing = 280; // Horizontal spacing
  const levelSpacing = 180; // Vertical spacing
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  levels.forEach((levelNodes, levelIndex) => {
    const levelWidth = (levelNodes.length - 1) * nodeSpacing;
    const startX = -levelWidth / 2;

    levelNodes.forEach((node, nodeIndex) => {
      const x = startX + nodeIndex * nodeSpacing;
      const y = levelIndex * levelSpacing;

      nodes.push({
        id: node.id,
        type: 'organizational',
        position: { x, y },
        data: node,
        draggable: true,
        selectable: true,
      });

      // Create edge to parent if exists
      if (node.parentId && nodeMap.has(node.parentId)) {
        edges.push({
          id: `edge-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          style: {
            stroke: '#64748b',
            strokeWidth: 2,
          },
        });
      }
    });
  });

  return { nodes, edges };
};

// Internal Chart Component (must be wrapped in ReactFlowProvider)
const InternalChart: React.FC<UnifiedOrganizationalChartProps> = ({
  data,
  onNodeClick,
  className = '',
  debug = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  // Calculate nodes and edges from org data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    try {
      return calculateHierarchicalLayout(data);
    } catch (error) {
      console.error('Error calculating layout:', error);
      setChartError('Error calculating chart layout');
      return { nodes: [], edges: [] };
    }
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (debug) {
      console.log('Node clicked:', node);
    }
    
    if (onNodeClick && node.data) {
      onNodeClick(node.data);
    }
  }, [onNodeClick, debug]);

  // Auto-fit on data change
  useEffect(() => {
    if (initialNodes.length > 0) {
      setIsLoading(true);
      
      // Update nodes and edges
      setNodes(initialNodes);
      setEdges(initialEdges);
      
      // Fit view after a short delay to ensure nodes are rendered
      const timer = setTimeout(() => {
        fitView({ padding: 0.1, duration: 800 });
        setIsLoading(false);
        setChartError(null);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      return undefined;
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleReset = useCallback(() => {
    fitView({ padding: 0.1, duration: 800 });
  }, [fitView]);

  if (chartError) {
    return (
      <div className="flex items-center justify-center h-full bg-white/90 dark:bg-slate-900/90">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chart Error</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{chartError}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Loading chart...</span>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls position="bottom-right" />
        
        {/* Custom zoom controls */}
        <Panel position="top-right" className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-1.5 shadow-md border border-slate-200 dark:border-slate-700">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomIn} 
            className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomOut}
            className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
            className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ml-1"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Panel>
        
        {debug && data.length === 0 && (
          <Panel position="top-left" className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <div className="text-center text-slate-400">
              <AlertCircle className="h-10 w-10 mx-auto mb-2" />
              <p>No data to display</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

// Main component with ReactFlowProvider wrapper
const UnifiedOrganizationalChart: React.FC<UnifiedOrganizationalChartProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InternalChart {...props} />
    </ReactFlowProvider>
  );
};

export default UnifiedOrganizationalChart;