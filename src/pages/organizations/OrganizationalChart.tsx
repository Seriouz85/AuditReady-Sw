import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  PlusCircle, 
  Download, 
  Loader2, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Search, 
  Filter,
  AlertCircle
} from 'lucide-react';
import UnifiedOrganizationalChart, { OrgNodeData } from '@/components/charts/UnifiedOrganizationalChart';
// import { OrgChart, OrgNode } from '@/lib/org-chart/d3-org-chart';

// Define OrgNode interface locally since we're replacing D3 implementation
interface OrgNode {
  id: string;
  parentId?: string | null;
  name: string;
  role?: string;
  email?: string;
  data?: {
    name: string;
    role: string;
    email?: string;
    avatar?: string;
    department?: string;
  };
  [key: string]: any;
}
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

// Note: OrgChartEnhancements interface removed as we're using ReactFlow now

interface OrgNodeExtended extends OrgNode {
  _expanded?: boolean;
  data?: {
    name: string;
    role: string;
    email?: string;
    avatar?: string;
    department?: string;
  };
}

interface OrgChartComponentProps {
  data: OrgNode[];
  onNodeClick?: (node: OrgNodeExtended) => void;
  className?: string;
  debug?: boolean;
}

// Convert OrgNode to OrgNodeData format
const convertToOrgNodeData = (nodes: OrgNode[]): OrgNodeData[] => {
  return nodes.map(node => ({
    id: node.id,
    parentId: node.parentId,
    name: node.name || '',
    role: node.role || '',
    email: node.email || '',
    department: node.data?.department || '',
    avatar: node.data?.avatar || '',
    ...node.data
  }));
};

// Note: createOrgChart function removed as we're using ReactFlow-based UnifiedOrganizationalChart now

// ReactFlow-based OrgChart component wrapper
const OrgChartComponent: React.FC<OrgChartComponentProps> = ({ data, onNodeClick, className, debug = false }) => {
  // Convert OrgNode data to OrgNodeData format
  const convertedData = useMemo(() => convertToOrgNodeData(data), [data]);
  
  // Handle node click with proper conversion
  const handleNodeClick = useCallback((nodeData: OrgNodeData) => {
    if (onNodeClick) {
      // Convert back to OrgNodeExtended format for compatibility
      const orgNodeExtended: OrgNodeExtended = {
        id: nodeData.id,
        parentId: nodeData.parentId,
        name: nodeData.name,
        role: nodeData.role,
        email: nodeData.email,
        data: {
          name: nodeData.name,
          role: nodeData.role,
          email: nodeData.email,
          avatar: nodeData.avatar,
          department: nodeData.department
        },
        _expanded: nodeData._expanded
      };
      onNodeClick(orgNodeExtended);
    }
  }, [onNodeClick]);

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <UnifiedOrganizationalChart
        data={convertedData}
        onNodeClick={handleNodeClick}
        debug={debug}
        className="organizational-chart-component"
      />
    </div>
  );
};

type TemplateKey = 'blank' | 'ceo' | 'corporate' | 'department';

interface TemplateMap {
  blank: OrgNode[];
  ceo: OrgNode[];
  corporate: OrgNode[];
  department: OrgNode[];
  [key: string]: OrgNode[];
}

// Main component
const OrganizationalChart: React.FC = () => {
  const [mode, setMode] = useState<'view' | 'template'>('template');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('ceo');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [debugMode, setDebugMode] = useState<boolean>(false);

  // State for chart nodes
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeRole, setNewNodeRole] = useState<string>('');
  const [newNodeEmail, setNewNodeEmail] = useState<string>('');
  const [newNodeDepartment, setNewNodeDepartment] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  // Add department options
  const departmentOptions = [
    'Executive', 'Engineering', 'Sales', 'Marketing', 
    'Product', 'Design', 'Finance', 'HR', 'Operations', 'Customer Support'
  ];

  const templates: TemplateMap = {
    blank: [],
    ceo: [
      { id: '1', name: 'CEO', role: 'Chief Executive Officer', parentId: null, data: { department: 'Executive' } },
      { id: '2', name: 'VP Engineering', role: 'Vice President', parentId: '1', data: { department: 'Engineering' } },
      { id: '3', name: 'VP Sales', role: 'Vice President', parentId: '1', data: { department: 'Sales' } },
      { id: '4', name: 'Lead Dev', role: 'Team Lead', parentId: '2', data: { department: 'Engineering' } },
      { id: '5', name: 'Sales Rep', role: 'Representative', parentId: '3', data: { department: 'Sales' } },
    ],
    corporate: [
      { id: '1', name: 'President', role: 'President', parentId: null, data: { department: 'Executive' } },
      { id: '2', name: 'COO', role: 'Chief Operations Officer', parentId: '1', data: { department: 'Operations' } },
      { id: '3', name: 'CFO', role: 'Chief Financial Officer', parentId: '1', data: { department: 'Finance' } },
      { id: '4', name: 'CTO', role: 'Chief Technology Officer', parentId: '1', data: { department: 'Engineering' } },
      { id: '5', name: 'Operations Manager', role: 'Manager', parentId: '2', data: { department: 'Operations' } },
      { id: '6', name: 'Finance Director', role: 'Director', parentId: '3', data: { department: 'Finance' } },
      { id: '7', name: 'Dev Manager', role: 'Manager', parentId: '4', data: { department: 'Engineering' } },
    ],
    department: [
      { id: '1', name: 'Engineering Director', role: 'Director', parentId: null, data: { department: 'Engineering' } },
      { id: '2', name: 'Frontend Lead', role: 'Team Lead', parentId: '1', data: { department: 'Engineering' } },
      { id: '3', name: 'Backend Lead', role: 'Team Lead', parentId: '1', data: { department: 'Engineering' } },
      { id: '4', name: 'DevOps Lead', role: 'Team Lead', parentId: '1', data: { department: 'Engineering' } },
      { id: '5', name: 'Frontend Dev 1', role: 'Developer', parentId: '2', data: { department: 'Engineering' } },
      { id: '6', name: 'Frontend Dev 2', role: 'Developer', parentId: '2', data: { department: 'Engineering' } },
      { id: '7', name: 'Backend Dev 1', role: 'Developer', parentId: '3', data: { department: 'Engineering' } },
      { id: '8', name: 'DevOps Engineer', role: 'Engineer', parentId: '4', data: { department: 'Engineering' } },
    ]
  };

  // Set initial nodes based on template
  useEffect(() => {
    console.log("Template changed to:", activeTemplate);
    const templateData = templates[activeTemplate] ? [...templates[activeTemplate]] : [];
    console.log("Setting nodes with template data:", templateData);
    setNodes(templateData);
  }, [activeTemplate]);

  // Handle adding a new node
  const handleAddNode = useCallback(() => {
    if (!newNodeName) {
      toast({
        title: "Name required",
        description: "Please provide a name for the person.",
        variant: "destructive"
      });
      return;
    }
    
    const newNodeId = `node-${Date.now()}`;
    const newNode: OrgNode = {
      id: newNodeId,
      name: newNodeName,
      role: newNodeRole,
      email: newNodeEmail,
      parentId: selectedParentId || null,
      data: {
        name: newNodeName,
        role: newNodeRole,
        email: newNodeEmail,
        department: newNodeDepartment
      }
    };
    
    console.log("Adding new node:", newNode);
    
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes, newNode];
      console.log("Updated nodes:", updatedNodes);
      return updatedNodes;
    });
    
    setNewNodeName('');
    setNewNodeRole('');
    setNewNodeEmail('');
    setNewNodeDepartment('');
    setSelectedParentId('');
    
    toast({
      title: "Person added",
      description: "New person has been added to the chart.",
    });
  }, [newNodeName, newNodeRole, newNodeEmail, newNodeDepartment, selectedParentId]);

  // Handle removing a node
  const handleRemoveNode = useCallback((nodeId: string) => {
    // Remove this node and all its children
    const nodeToRemove = nodes.find(n => n.id === nodeId);
    
    console.log("Removing node:", nodeId, nodeToRemove);
    
    const removeNodeAndChildren = (id: string, nodesArray: OrgNode[]) => {
      const childrenIds = nodesArray.filter(n => n.parentId === id).map(n => n.id);
      let result = [...nodesArray];
      
      // Recursively remove children
      childrenIds.forEach(childId => {
        result = removeNodeAndChildren(childId, result);
      });
      
      // Remove this node
      return result.filter(n => n.id !== id);
    };
    
    setNodes(prevNodes => {
      const updatedNodes = removeNodeAndChildren(nodeId, prevNodes);
      console.log("After removal, nodes:", updatedNodes);
      return updatedNodes;
    });
    
    toast({
      title: "Person removed",
      description: `${nodeToRemove?.name || 'Person'} and all reports have been removed.`,
    });
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
      
      toast({
        title: "Chart exported",
        description: "Your organizational chart has been exported successfully.",
      });
    }, 1000);
  };

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    // Toggle the debug mode state
    setDebugMode(!debugMode);
    
    if (debugMode) {
      toast({
        title: "Debug mode disabled",
        description: "Debug information will no longer be shown"
      });
    } else {
      toast({
        title: "Debug mode enabled",
        description: "Debug information will be shown in the console"
      });
    }
  }, [debugMode]);

  // Filter nodes based on search term and department
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.role && node.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.email && node.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesDepartment = departmentFilter === '' || 
        (node['data'] && 'department' in node['data'] && node['data']['department'] === departmentFilter);
        
      return matchesSearch && matchesDepartment;
    });
  }, [nodes, searchTerm, departmentFilter]);

  // Render chart view with improved UI
  const renderChartView = () => (
    <Card className="h-full overflow-hidden organizational-chart-component">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
        <CardTitle>Organizational Chart</CardTitle>
        <CardDescription>Interactive view of your organization's structure</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search people..." 
                className="pl-9 h-9 w-full sm:w-[180px] lg:w-[240px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter || 'all'} onValueChange={(value) => setDepartmentFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Filter by department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] p-0 organizational-chart-component">
        <OrgChartComponent 
          data={filteredNodes.length > 0 ? filteredNodes : nodes} 
          onNodeClick={(node: OrgNodeExtended) => {
          console.log('Node clicked:', node);
          }} 
          debug={debugMode}
        />
      </CardContent>
    </Card>
  );

  // Render chart creation interface with improved UI
  const renderChartCreation = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border organizational-chart-component">
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="flex h-full flex-col">
          <div className="p-4 space-y-4 border-b">
            <h3 className="text-lg font-semibold">Create Organization Chart</h3>
          <p className="text-sm text-muted-foreground">Start with a template or build from scratch.</p>
          
          <Tabs defaultValue={activeTemplate} onValueChange={(value) => setActiveTemplate(value as TemplateKey)}>
              <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="blank">Blank</TabsTrigger>
                <TabsTrigger value="ceo">CEO</TabsTrigger>
              <TabsTrigger value="corporate">Corporate</TabsTrigger>
                <TabsTrigger value="department">Department</TabsTrigger>
            </TabsList>
          </Tabs>
          </div>
          
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-6">
              {/* Add Person Form */}
              <Card className="transition-all duration-200 border-slate-200 dark:border-slate-700 hover:shadow-md">
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
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-role">Position / Role</Label>
                    <Input 
                      id="node-role" 
                      placeholder="e.g., Chief Executive Officer" 
                      value={newNodeRole}
                      onChange={(e) => setNewNodeRole(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="node-email">Email (Optional)</Label>
                    <Input 
                      id="node-email" 
                      placeholder="e.g., john@example.com" 
                      value={newNodeEmail}
                      onChange={(e) => setNewNodeEmail(e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-department">Department</Label>
                      <Select value={newNodeDepartment || 'none'} onValueChange={(value) => setNewNodeDepartment(value === 'none' ? '' : value)}>
                        <SelectTrigger id="node-department" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {departmentOptions.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parent-node">Reports To (Optional)</Label>
                    <Select value={selectedParentId || 'none'} onValueChange={(value) => setSelectedParentId(value === 'none' ? '' : value)}>
                      <SelectTrigger id="parent-node" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select manager..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager (Top Level)</SelectItem>
                        {nodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({node.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddNode} 
                    size="sm" 
                    className="w-full mt-2 transition-all duration-200 hover:scale-[1.02] bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Person
                  </Button>
                </CardContent>
              </Card>

              {/* Current Nodes List */}
              {nodes.length > 0 && (
                <Card className="transition-all duration-200 border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Current People</CardTitle>
                      <div className="text-xs text-slate-500">{nodes.length} people</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {nodes.map((node) => (
                      <div 
                        key={node.id} 
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 
                                 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{node.name}</div>
                          <div className="text-sm text-muted-foreground truncate">{node.role}</div>
                          {node['data']?.['department'] && (
                            <div className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 
                                          dark:text-slate-300 rounded-full self-start mt-1 inline-block">
                              {node['data']['department']}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveNode(node.id)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 
                                   hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <div className="flex h-full items-center justify-center p-4 organizational-chart-component">
          <OrgChartComponent 
            data={nodes} 
            onNodeClick={(node: OrgNodeExtended) => {
            setSelectedParentId(node.id);
              toast({
                title: "Node selected",
                description: `Selected ${node.name} as parent node`,
              });
            }} 
            className="w-full h-full"
            debug={debugMode}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  // Main render with enhanced UI
  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4 organizational-chart-component">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Organizational Chart</h1>
        <div className="flex gap-2">
          <Button 
            variant={mode === 'view' ? 'default' : 'outline'} 
            onClick={() => setMode('view')}
            className="transition-all duration-200"
          >
            <Eye className="mr-2 h-4 w-4" /> View Chart
          </Button>
          <Button 
            variant={mode === 'template' ? 'default' : 'outline'} 
            onClick={() => setMode('template')}
            className="transition-all duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Chart
          </Button>
          {nodes.length > 0 && (
            <>
              <Button 
                onClick={handleExport} 
                disabled={isLoading}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Chart
            </Button>
              <Button
                variant="outline"
                onClick={toggleDebugMode}
                className={`transition-all duration-200 ${debugMode ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300' : ''}`}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {debugMode ? 'Disable Debug' : 'Debug Mode'}
              </Button>
            </>
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