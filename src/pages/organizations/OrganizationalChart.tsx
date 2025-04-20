import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, PlusCircle, Download, Loader2, ZoomIn, Maximize, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { OrgChart } from '@/lib/org-chart/d3-org-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// OrgChart component wrapper
const OrgChartComponent = ({ data, onNodeClick }) => {
  const chartRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Initialize the chart
    const chart = new OrgChart()
      .container(containerRef.current)
      .data(data)
      .nodeWidth(() => 200)
      .nodeHeight(() => 100)
      .compact(false)
      .layout('top')
      .childrenMargin(() => 50)
      .siblingsMargin(() => 20)
      .neighbourMargin(() => 15) // Reduced from default to create smaller distances between boxes
      .onNodeClick(d => {
        // Auto-zoom to the clicked node
        chart.setExpanded(d.id, !d._expanded);
        chart.setCentered(d.id);
        chart.update(d);
        
        if (onNodeClick) onNodeClick(d);
      })
      .nodeContent(node => {
        return `
          <div style="padding: 10px; border-radius: 4px; background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.15); width: 100%; height: 100%;">
            <div style="font-weight: bold; font-size: 14px;">${node.data.name || 'Unnamed'}</div>
            <div style="font-size: 12px; color: #666;">${node.data.role || 'No role'}</div>
            ${node.data.email ? `<div style="font-size: 11px; margin-top: 5px;">${node.data.email}</div>` : ''}
          </div>
        `;
      });

    chartRef.current = chart;
    chart.render();

    return () => {
      chart.clear();
    };
  }, [data, onNodeClick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

// Main component
const OrganizationalChart = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('template');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('ceo');

  // State for chart nodes
  const [nodes, setNodes] = useState([]);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeRole, setNewNodeRole] = useState('');
  const [newNodeEmail, setNewNodeEmail] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  const templates = {
    blank: [],
    ceo: [
      { id: '1', name: 'CEO', role: 'Chief Executive Officer', parentId: null },
      { id: '2', name: 'VP Engineering', role: 'Vice President', parentId: '1' },
      { id: '3', name: 'VP Sales', role: 'Vice President', parentId: '1' },
      { id: '4', name: 'Lead Dev', role: 'Team Lead', parentId: '2' },
      { id: '5', name: 'Sales Rep', role: 'Representative', parentId: '3' },
    ],
    corporate: [
      { id: '1', name: 'President', role: 'President', parentId: null },
      { id: '2', name: 'COO', role: 'Chief Operations Officer', parentId: '1' },
      { id: '3', name: 'CFO', role: 'Chief Financial Officer', parentId: '1' },
      { id: '4', name: 'CTO', role: 'Chief Technology Officer', parentId: '1' },
      { id: '5', name: 'Operations Manager', role: 'Manager', parentId: '2' },
      { id: '6', name: 'Finance Director', role: 'Director', parentId: '3' },
      { id: '7', name: 'Dev Manager', role: 'Manager', parentId: '4' },
    ]
  };

  // Set initial nodes based on template
  useEffect(() => {
    setNodes(templates[activeTemplate] || []);
  }, [activeTemplate]);

  // Handle adding a new node
  const handleAddNode = useCallback(() => {
    if (!newNodeName) return;
    
    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      name: newNodeName,
      role: newNodeRole,
      email: newNodeEmail,
      parentId: selectedParentId || null
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    setNewNodeName('');
    setNewNodeRole('');
    setNewNodeEmail('');
    setSelectedParentId('');
  }, [newNodeName, newNodeRole, newNodeEmail, selectedParentId]);

  // Handle removing a node
  const handleRemoveNode = useCallback((nodeId) => {
    // Remove this node and all its children
    const removeNodeAndChildren = (id) => {
      const childrenIds = nodes.filter(n => n.parentId === id).map(n => n.id);
      childrenIds.forEach(childId => removeNodeAndChildren(childId));
      setNodes(prevNodes => prevNodes.filter(n => n.id !== id));
    };
    
    removeNodeAndChildren(nodeId);
  }, [nodes]);

  // Export functionality
  const handleExport = () => {
    setIsLoading(true);
    // Implement actual export logic here
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "org-chart.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setIsLoading(false);
    }, 1000);
  };

  // Render chart view
  const renderChartView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Organizational Chart</CardTitle>
        <CardDescription>Interactive view of your organization's structure</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] p-0">
        <OrgChartComponent data={nodes} onNodeClick={(node) => {
          console.log('Node clicked:', node);
        }} />
      </CardContent>
    </Card>
  );

  // Render chart creation interface
  const renderChartCreation = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="flex h-full flex-col p-4 space-y-4">
          <h3 className="text-lg font-semibold">Create Chart</h3>
          <p className="text-sm text-muted-foreground">Start with a template or build from scratch.</p>
          
          <Tabs defaultValue={activeTemplate} onValueChange={setActiveTemplate}>
            <TabsList className="w-full">
              <TabsTrigger value="blank">Blank</TabsTrigger>
              <TabsTrigger value="ceo">CEO Structure</TabsTrigger>
              <TabsTrigger value="corporate">Corporate</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-6">
              {/* Add Person Form */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Add Person / Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="node-name">Name</Label>
                    <Input 
                      id="node-name" 
                      placeholder="e.g., John Smith" 
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-role">Position / Role</Label>
                    <Input 
                      id="node-role" 
                      placeholder="e.g., Chief Executive Officer" 
                      value={newNodeRole}
                      onChange={(e) => setNewNodeRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-email">Email (Optional)</Label>
                    <Input 
                      id="node-email" 
                      placeholder="e.g., john@example.com" 
                      value={newNodeEmail}
                      onChange={(e) => setNewNodeEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent-node">Reports To (Optional)</Label>
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                      <SelectTrigger id="parent-node">
                        <SelectValue placeholder="Select manager..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Manager (Top Level)</SelectItem>
                        {nodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>{node.name} ({node.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddNode} size="sm" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Person
                  </Button>
                </CardContent>
              </Card>

              {/* Current Nodes List */}
              {nodes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Current People</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {nodes.map((node) => (
                      <div key={node.id} className="flex items-center justify-between border p-2 rounded">
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-sm text-muted-foreground">{node.role}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveNode(node.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
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
          <OrgChartComponent data={nodes} onNodeClick={(node) => {
            setSelectedParentId(node.id);
          }} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  // Main render
  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Organizational Chart</h1>
        <div className="flex gap-2">
          <Button 
            variant={mode === 'view' ? 'default' : 'outline'} 
            onClick={() => setMode('view')}
          >
            <Eye className="mr-2 h-4 w-4" /> View Chart
          </Button>
          <Button 
            variant={mode === 'template' ? 'default' : 'outline'} 
            onClick={() => setMode('template')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Chart
          </Button>
          {nodes.length > 0 && (
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

      <div className="flex-1 min-h-0">
        {mode === 'view' ? renderChartView() : renderChartCreation()}
      </div>
    </div>
  );
};

export default OrganizationalChart; 