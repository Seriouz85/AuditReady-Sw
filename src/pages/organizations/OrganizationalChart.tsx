import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, PlusCircle, Download, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n'; // Assuming you use i18n

// Placeholder for the charting library (e.g., reactflow)
// We'll integrate this properly later
const PlaceholderOrgChart = ({ data, mode }: { data: any; mode: 'view' | 'create' }) => (
  <div className="w-full h-full border rounded-lg flex items-center justify-center bg-muted/30 text-muted-foreground">
    <p>Organizational Chart Preview ({mode} mode) - Data: {JSON.stringify(data)}</p>
    {/* Chart rendering logic will go here */}
  </div>
);

const OrganizationalChart = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'create'>('view');
  const [isLoading, setIsLoading] = useState(false);

  // --- State for Create Mode ---
  const [nodes, setNodes] = useState<any[]>([]); // Replace 'any' with your node type
  const [edges, setEdges] = useState<any[]>([]); // Replace 'any' with your edge type
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeRole, setNewNodeRole] = useState('');
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');

  // --- Mock Data for View Mode ---
  // TODO: Replace with actual data fetching logic from your Organization data
  const mockOrgData = {
    nodes: [
      { id: '1', data: { label: 'CEO', role: 'Chief Executive Officer' }, position: { x: 250, y: 5 } },
      { id: '2', data: { label: 'VP Engineering', role: 'Vice President' }, position: { x: 100, y: 100 } },
      { id: '3', data: { label: 'VP Sales', role: 'Vice President' }, position: { x: 400, y: 100 } },
      { id: '4', data: { label: 'Lead Dev', role: 'Team Lead' }, position: { x: 50, y: 200 } },
      { id: '5', data: { label: 'Sales Rep', role: 'Representative' }, position: { x: 350, y: 200 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
    ],
  };

  // --- Event Handlers (Create Mode) ---
  const handleAddNode = useCallback(() => {
    if (!newNodeLabel || !newNodeRole) return; // Basic validation
    const newNodeId = `node-${nodes.length + 1}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      // Position needs logic based on layout or user input
      position: { x: Math.random() * 400, y: Math.random() * 400 }, 
      data: { label: newNodeLabel, role: newNodeRole },
      // Add other node properties as needed by your chart library
    };
    setNodes((nds) => nds.concat(newNode));
    setNewNodeLabel('');
    setNewNodeRole('');
  }, [nodes, newNodeLabel, newNodeRole]);

  const handleAddEdge = useCallback(() => {
    if (!sourceNode || !targetNode || sourceNode === targetNode) return; // Basic validation
    const newEdgeId = `edge-${sourceNode}-${targetNode}-${Date.now()}`;
    const newEdge = {
      id: newEdgeId,
      source: sourceNode,
      target: targetNode,
      // Add other edge properties (e.g., type: 'smoothstep')
    };
    setEdges((eds) => eds.concat(newEdge));
    setSourceNode('');
    setTargetNode('');
  }, [edges, sourceNode, targetNode]);

  // --- Export Functionality ---
  const handleExport = () => {
    setIsLoading(true);
    console.log('Exporting chart data:', { nodes, edges });
    // TODO: Implement actual export logic (e.g., to PNG, SVG using a library)
    setTimeout(() => {
      alert('Export functionality not yet implemented. Chart data logged to console.');
      setIsLoading(false);
    }, 1000);
  };

  // --- Render Logic ---
  const renderViewMode = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Current Organizational Chart</CardTitle>
        <CardDescription>Visual representation of your organization's structure.</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] p-0"> {/* Adjust height based on CardHeader */} 
        <PlaceholderOrgChart data={mockOrgData} mode="view" />
      </CardContent>
    </Card>
  );

  const renderCreateMode = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="flex h-full flex-col p-4 space-y-4">
          <h3 className="text-lg font-semibold">Create Chart</h3>
          <p className="text-sm text-muted-foreground">Add elements and define relationships.</p>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-6">
              {/* Add Node Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Add Person / Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="node-label">Name / Title</Label>
                    <Input 
                      id="node-label" 
                      placeholder="e.g., CEO, Marketing Team" 
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-role">Role / Description</Label>
                    <Input 
                      id="node-role" 
                      placeholder="e.g., Chief Executive Officer" 
                      value={newNodeRole}
                      onChange={(e) => setNewNodeRole(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddNode} size="sm" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Element
                  </Button>
                </CardContent>
              </Card>

              {/* Add Edge/Connection Section */}
              {nodes.length > 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Define Relationship</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="source-node">Reports To (Source)</Label>
                      <Select value={sourceNode} onValueChange={setSourceNode}>
                        <SelectTrigger id="source-node">
                          <SelectValue placeholder="Select manager..." />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>{node.data.label} ({node.data.role})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target-node">Subordinate (Target)</Label>
                      <Select value={targetNode} onValueChange={setTargetNode}>
                        <SelectTrigger id="target-node">
                          <SelectValue placeholder="Select direct report..." />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>{node.data.label} ({node.data.role})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddEdge} size="sm" className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Relationship
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65} minSize={30}>
        <div className="flex h-full items-center justify-center p-4">
          <PlaceholderOrgChart data={{ nodes, edges }} mode="create" />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Organizational Chart</h1>
        <div className="flex gap-2">
          <Button 
            variant={mode === 'view' ? 'default' : 'outline'} 
            onClick={() => setMode('view')}
          >
            <Eye className="mr-2 h-4 w-4" /> View Existing
          </Button>
          <Button 
            variant={mode === 'create' ? 'default' : 'outline'} 
            onClick={() => setMode('create')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Button>
          {(mode === 'create' && nodes.length > 0) && (
            <Button onClick={handleExport} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Chart
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0"> {/* Ensure container takes remaining height */} 
        {mode === 'view' ? renderViewMode() : renderCreateMode()}
      </div>
    </div>
  );
};

export default OrganizationalChart; 