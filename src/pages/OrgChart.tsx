import type {
  Node,
  Edge,
  Connection,
  NodeTypes,
  NodeOrigin,
  NodeChange,
  NodeProps,
} from 'reactflow';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
  MiniMap,
  useReactFlow,
  Handle,
  Position,
  Background,
  BackgroundVariant
} from 'reactflow';
import { useState, useCallback, useRef, useEffect } from 'react';
import 'reactflow/dist/style.css';
import '@/styles/org-chart.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockOrganizations } from './Organizations';
import { Organization } from './Organizations';
import { FileDown, FileUp, Expand, Maximize2, Minimize2, AlignVerticalJustifyStart } from 'lucide-react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { useToast } from '@/components/ui/use-toast';

// Add Vite environment variable type declarations
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Define types
// Revert to simpler structure: ChartNode extends Node, data holds org details
interface ChartNode extends Node {
  data: {
    id: string;
    label: string;
    name: string;
    type: string; // Keep as string, color mapping handles specifics
    securityContact?: string | { name: string; email: string };
    isConnectable?: boolean;
    hierarchyLevel: number;
    // Include other necessary fields from Organization if accessed directly in node
    // e.g., parentId?: string;
  };
}

// Moved getNodeColor outside component for broader scope
const getNodeColor = (hierarchyLevel: number) => {
  if (hierarchyLevel === 1) return '#FF6B6B'; // Parent company
  if (hierarchyLevel === 2) return '#4ECDC4'; // Subsidiaries
  return '#45B7D1'; // Divisions
};

// Helper function to format security contact
const getSecurityContact = (contact: string | { name: string; email: string } | undefined): string => {
  if (!contact) return 'N/A';
  if (typeof contact === 'string') return contact;
  return `${contact.name} (${contact.email})`;
};

// Custom Node Component - Adjust props type back
const OrganizationNode = ({ data }: NodeProps<ChartNode['data']>) => {
  const bgColor = getNodeColor(data.hierarchyLevel);

  return (
    <div 
      style={{
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: bgColor,
        color: 'white',
        minWidth: '240px',
        maxWidth: '320px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      {/* Target Handle (Top) - Always present but might not be connectable depending on context */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${data.id}-target`}
        className="w-2 h-2 !bg-gray-500 opacity-50"
        isConnectable={data.isConnectable ?? true}
      />

      <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        {data.label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem', textAlign: 'center' }}>
        {data.type}
      </div>

      {data.securityContact && (
        <div style={{ 
          fontSize: '0.75rem', 
          borderTop: '1px solid rgba(255,255,255,0.2)', 
          paddingTop: '0.75rem', 
          marginTop: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Security Contact:</div>
          {getSecurityContact(data.securityContact)}
        </div>
      )}

      {/* Source Handle (Bottom) - Always present */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.id}-source`}
        className="w-2 h-2 !bg-gray-500 opacity-50"
        isConnectable={data.isConnectable ?? true}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  organization: OrganizationNode,
};

// Set origin to center for layout calculations
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const OrgChartContent = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, zoomIn, zoomOut, getNodes, setNodes: setReactFlowNodes, project } = useReactFlow();
  const [isLoading, setIsLoading] = useState(true);

  // Calculate node positions based on hierarchy - Adjusted spacing for step edges
  const calculateNodePositions = useCallback((orgs: Organization[]) => {
    const hierarchyLevels: { [key: number]: Organization[] } = {};
    const positions: { [key: string]: { x: number; y: number } } = {};
    const verticalSpacing = 300;   // Keep moderate vertical space
    const horizontalSpacing = 400; // Slightly increased horizontal for step edges
    const gridSize = 20; // Match the snapGrid size
    let maxWidth = 0;

    // Group organizations by hierarchy level
    orgs.forEach(org => {
      const level = org.hierarchyLevel || 1;
      if (!hierarchyLevels[level]) {
        hierarchyLevels[level] = [];
      }
      hierarchyLevels[level].push(org);
      maxWidth = Math.max(maxWidth, hierarchyLevels[level].length);
    });
    
    // Calculate positions for each level
    Object.entries(hierarchyLevels).forEach(([level, levelOrgs]) => {
      const y = Math.round(((parseInt(level) - 1) * verticalSpacing) / gridSize) * gridSize;
      const count = levelOrgs.length;
      const levelWidth = count * horizontalSpacing;
      // Distribute nodes evenly, centered around 0
      const startX = Math.round((-(levelWidth - horizontalSpacing) / 2) / gridSize) * gridSize;

      levelOrgs.forEach((org, index) => {
        positions[org.id] = {
          x: Math.round((startX + index * horizontalSpacing) / gridSize) * gridSize,
          y: y
        };
      });
    });

    return positions;
  }, []);

  // Re-apply hierarchical layout to current builder nodes
  const layoutHierarchy = useCallback(() => {
    const currentNodes = getNodes();
    if (currentNodes.length === 0) return;

    const orgsInData: Organization[] = currentNodes
      .map(node => node.data?.organization) // This might need adjustment based on final data structure
      .filter((org): org is Organization => !!org);

    if (orgsInData.length === 0) {
        // Corrected toast call
        toast({ title: "Layout Warning", description: "No organization data found in current nodes for hierarchical layout.", variant: "default" });
        return;
    }

    const positions = calculateNodePositions(orgsInData);

    const positionedNodes = currentNodes.map((node) => {
      const newPos = positions[node.id];
      if (newPos) {
        return { ...node, position: newPos };
      }
      console.warn(`Hierarchy position not found for node ${node.id}, keeping existing position.`);
      return node;
    });

    setReactFlowNodes(positionedNodes);
    setTimeout(() => fitView({ padding: 0.1, duration: 800 }), 50);
    // Corrected toast call
    toast({ title: "Layout Applied", description: 'Nodes arranged in hierarchical layout' });

  }, [getNodes, setReactFlowNodes, fitView, calculateNodePositions, toast]); // Added toast dependency

  // Transform organization data into nodes and edges
  const transformToChartData = useCallback((orgs: Organization[]) => {
    console.log("Transforming chart data for", orgs.length, "organizations...");
    try {
      const positions = calculateNodePositions(orgs);
      const newNodes: ChartNode[] = [];
      const newEdges: Edge[] = [];
      let maxLevel = 0;

      orgs.forEach(org => {
        maxLevel = Math.max(maxLevel, org.hierarchyLevel || 1);
        const position = positions[org.id];
        if (!position) {
          console.warn(`Position not calculated for org: ${org.id} (${org.name}) at level ${org.hierarchyLevel}`);
          return; // Skip nodes without positions
        }
        const node: ChartNode = {
          id: org.id,
          type: 'organization',
          position,
          data: {
            id: org.id, // Added missing id
            name: org.name, // Added missing name
            label: org.name,
            type: org.type,
            securityContact: org.securityContact || '',
            isConnectable: true,
            hierarchyLevel: org.hierarchyLevel,
          },
        };
        newNodes.push(node);

        if (org.parentId) {
          newEdges.push({
            id: `${org.parentId}-${org.id}`,
            source: org.parentId,
            target: org.id,
            type: 'step', // *** Reverted AGAIN to Step Edges ***
            animated: false,
            style: {
              stroke: '#000000', // Black lines
              strokeWidth: 2,    // Thicker
            },
          });
        }
      });

      console.log("Processed nodes up to level:", maxLevel);
      console.log("Generated", newNodes.length, "nodes and", newEdges.length, "edges.");
      setNodes(newNodes);
      setEdges(newEdges);
      setIsLoading(false);
      // Fit view slightly delayed to allow initial render
      setTimeout(() => fitView({ padding: 0.1, duration: 800 }), 100);
    } catch (error) {
      console.error('Error transforming chart data:', error);
      setIsLoading(false);
      // Corrected toast call
      toast({ title: "Error", description: 'Failed to load organizational chart', variant: "destructive" });
    }
  }, [calculateNodePositions, setNodes, setEdges, fitView, toast]); // Added toast dependency

  // Initialize with mock data
  useEffect(() => {
    transformToChartData(mockOrganizations);
  }, [transformToChartData]);

  // Export chart as PNG
  const exportAsPNG = useCallback(async () => {
    if (!reactFlowWrapper.current) return;

    try {
      // Corrected toast call
      toast({ title: "Exporting...", description: 'Generating PNG export...' });
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'organizational-chart.png');
          // Corrected toast call
          toast({ title: "Success", description: 'Chart exported successfully' });
        } else {
          // Corrected toast call
          toast({ title: "Error", description: 'Failed to create PNG blob', variant: "destructive" });
        }
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error exporting chart as PNG:', error);
      // Corrected toast call
      toast({ title: "Error", description: 'Failed to export chart as PNG', variant: "destructive" });
    }
  }, [toast]); // Added toast dependency

  // Export chart as JSON
  const exportAsJSON = useCallback(() => {
    try {
      const flow = { nodes, edges };
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
      saveAs(blob, 'organizational-chart.json');
      // Corrected toast call
      toast({ title: "Success", description: 'Chart exported successfully as JSON' });
    } catch (error) {
      console.error('Error exporting chart as JSON:', error);
      // Corrected toast call
      toast({ title: "Error", description: 'Failed to export chart as JSON', variant: "destructive" });
    }
  }, [nodes, edges, toast]); // Added toast dependency

  // Connection validation for Builder - MORE ROBUST check
  const onConnectBuilder = useCallback(
    (connection: Connection) => {
      console.log('onConnectBuilder: Attempting connection:', connection);
      const edgeExists = edges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target && edge.sourceHandle === connection.sourceHandle && edge.targetHandle === connection.targetHandle) ||
          (edge.source === connection.target && edge.target === connection.source && edge.sourceHandle === connection.targetHandle && edge.targetHandle === connection.sourceHandle)
      );

      if (edgeExists) {
        console.log('onConnectBuilder: Edge already exists, preventing duplicate.');
        toast({ // Corrected toast call
          title: "Connection Error",
          description: "An edge already exists between these points.",
          variant: "destructive",
        });
        return;
      }

      console.log('onConnectBuilder: Adding new edge.');
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'step',
        style: { stroke: '#000', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
      toast({ // Corrected toast call
        title: "Connection Added",
        description: `Connected ${connection.source} to ${connection.target}.`,
      });
    },
    [edges, setEdges, toast] // Added toast dependency
  );

  // Node change handler for logging drag end position
  const onNodesChangeBuilder = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false) {
        // Find the node details for better logging
        const node = nodes.find(n => n.id === change.id);
        console.log(
          `onNodesChangeBuilder (DragEnd): Node ${change.id} (${node?.data?.label}) final position:`,
          change.position
        );
      }
    });
    // Apply the changes using the hook's updater
    onNodesChange(changes);
  }, [onNodesChange, nodes]); // Include nodes in dependency array

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Organizational Chart</h1>
          <p className="text-muted-foreground">
            View and manage your organization's structure.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportAsPNG} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          <Button onClick={exportAsJSON} variant="outline">
            <FileUp className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Current Organization
          </TabsTrigger>
          <TabsTrigger value="builder">
            Chart Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Organizational Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[800px] border rounded-lg bg-gray-100" ref={reactFlowWrapper}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    snapToGrid={true}
                    snapGrid={[20, 20]}
                    defaultEdgeOptions={{
                      type: 'step',
                      style: { 
                        stroke: '#000000',
                        strokeWidth: 2,
                      },
                    }}
                    nodeOrigin={nodeOrigin}
                  >
                    <Background 
                      color="#f0f0f0"
                      gap={20}
                      size={1}
                      variant={BackgroundVariant.Dots}
                    />
                    <Controls style={{ border: '1px solid #e2e8f0' }} />
                    <MiniMap 
                      nodeColor={(node: Node<ChartNode['data']>) => getNodeColor(node.data?.hierarchyLevel).split(' ')[0] || 'bg-gray-50'}
                      style={{ 
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0'
                      }}
                      pannable={true}
                      zoomable={true}
                    />
                    <Panel position="top-right">
                      <div className="flex gap-2 p-2 bg-white/80 rounded border border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fitView({ padding: 0.2, duration: 800 })}
                          title="Fit to view"
                        >
                          <Expand className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => zoomIn({ duration: 300 })}
                          title="Zoom in"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => zoomOut({ duration: 300 })}
                          title="Zoom out"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Panel>
                  </ReactFlow>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Chart Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <div className="p-4 border rounded-lg bg-white shadow-sm max-h-[750px] overflow-y-auto">
                    <h3 className="font-semibold mb-4">Available Organizations</h3>
                    <div className="space-y-2">
                      {mockOrganizations.map(org => (
                        <div
                          key={org.id}
                          className="p-3 border rounded cursor-move hover:bg-muted/50 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            try {
                              const nodeData = JSON.stringify(org);
                              e.dataTransfer.setData('application/reactflow', nodeData);
                              e.dataTransfer.effectAllowed = 'move';
                            } catch (err) {
                              console.error("Error setting drag data:", err);
                            }
                          }}
                        >
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-[800px] border rounded-lg bg-gray-100" ref={reactFlowWrapper}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChangeBuilder}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnectBuilder}
                      nodeTypes={nodeTypes}
                      nodeOrigin={nodeOrigin}
                      fitView
                      snapToGrid={true}
                      snapGrid={[20, 20]}
                      edgesUpdatable={true}
                      nodesDraggable={true}
                      nodesConnectable={true}
                      minZoom={0.1}
                      maxZoom={2}
                      defaultEdgeOptions={{
                        type: 'step',
                        style: { 
                          stroke: '#000000',
                          strokeWidth: 2,
                        },
                      }}
                      connectionLineStyle={{ stroke: '#000000', strokeWidth: 2 }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!reactFlowWrapper.current) return;
                        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
                        const orgDataString = event.dataTransfer.getData('application/reactflow');
                        
                        if (!orgDataString) return;
                        
                        try {
                          const organization: Organization = JSON.parse(orgDataString);
                          // Use project function to get flow coordinates
                          const position = project({ 
                             x: event.clientX - reactFlowBounds.left,
                             y: event.clientY - reactFlowBounds.top 
                          });
                          
                          const newNode: ChartNode = {
                             id: `${organization.id}-${Date.now()}`,
                             type: 'organization',
                             position,
                             data: {
                               id: organization.id, // Added missing id
                               name: organization.name, // Added missing name
                               label: organization.name,
                               type: organization.type,
                               securityContact: organization.securityContact || '',
                               isConnectable: true,
                               hierarchyLevel: organization.hierarchyLevel,
                             },
                          };
                          console.log("onDrop: Adding node:", newNode, "at position:", position);
                          setNodes((nds) => nds.concat(newNode));
                        } catch (err) {
                          console.error("Error parsing dropped data:", err);
                        }
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                    >
                      <Background />
                      <Controls style={{ border: '1px solid #e2e8f0' }} />
                      <MiniMap 
                        nodeColor={(node: Node<ChartNode['data']>) => getNodeColor(node.data?.hierarchyLevel).split(' ')[0] || 'bg-gray-50'}
                        style={{ 
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0' 
                        }}
                        pannable={true}
                        zoomable={true}
                      />
                      <Panel position="bottom-center">
                        <div className="flex gap-2 p-2 bg-white/80 rounded border border-gray-200 shadow-md">
                          <Button variant="outline" size="sm" onClick={layoutHierarchy} title="Arrange Hierarchy">
                            <AlignVerticalJustifyStart className="w-4 h-4 mr-1" /> Hierarchy
                          </Button>
                        </div>
                      </Panel>
                      <Panel position="top-right">
                        <div className="flex gap-2 p-2 bg-white/80 rounded border border-gray-200 shadow-md">
                          <Button variant="outline" size="sm" onClick={() => fitView({ padding: 0.1, duration: 800 })} title="Fit to View">
                            <Expand className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => zoomIn({ duration: 300 })} title="Zoom In">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => zoomOut({ duration: 300 })} title="Zoom Out">
                            <Minimize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Panel>
                    </ReactFlow>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrgChart = () => {
  return (
    <ReactFlowProvider>
      <OrgChartContent />
    </ReactFlowProvider>
  );
};

export default OrgChart; 