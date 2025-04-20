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
import { OrgChart, OrgNode } from '@/lib/org-chart/d3-org-chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

// Define additional methods that might be available on OrgChart
interface OrgChartEnhancements {
  setZoom?(scale: number): void;
  fit?(): void;
  zoomIn?(): void;
  zoomOut?(): void;
}

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

// Helper function to create a fresh OrgChart with provided data
const createOrgChart = (containerElement: HTMLDivElement, data: OrgNode[]) => {
  if (!containerElement) return null;
  
  console.log('Creating new OrgChart instance with data', data);
  
  try {
    // Clear the container first to avoid duplicate charts
    containerElement.innerHTML = '';
    
    // Create a new chart
    const chart = new OrgChart()
      .container(containerElement)
      .data(data)
      .nodeWidth(() => 240)
      .nodeHeight(() => 120)
      .compact(false)
      .layout('top')
      .childrenMargin(() => 50)
      .siblingsMargin(() => 25)
      .neighbourMargin(() => 20);
    
    return chart;
  } catch (error) {
    console.error('Error creating OrgChart:', error);
    return null;
  }
};

// OrgChart component wrapper
const OrgChartComponent: React.FC<OrgChartComponentProps> = ({ data, onNodeClick, className, debug = false }) => {
  const chartRef = useRef<(OrgChart & OrgChartEnhancements) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log("OrgChart data changed:", data);
  }, [data]);

  // Complete chart rebuild for each update - more reliable
  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) {
      console.log("Missing data or container:", { 
        hasData: Boolean(data), 
        dataLength: data?.length, 
        hasContainer: Boolean(containerRef.current) 
      });
      return;
    }
    
    setIsLoading(true);
    setChartError(null);
    
    try {
      // Create a new chart instance
      const chart = createOrgChart(containerRef.current, data);
      
      if (!chart) {
        setChartError("Failed to create organization chart");
        setIsLoading(false);
        return;
      }
      
      // Configure additional behavior
      chart
        .onNodeClick((d: OrgNodeExtended) => {
          console.log("Node clicked:", d);
          // Auto-zoom to the clicked node
          chart.setExpanded(d.id, !d._expanded);
          chart.setCentered(d.id);
          chart.update(d);
          
          if (onNodeClick) onNodeClick(d);
        })
        .nodeContent((node: OrgNodeExtended) => {
          // Enhanced node card with Tailwind-inspired design
          const hasAvatar = node.data?.avatar || false;
          const department = node.data?.department || '';
          const nodeContent = `
            <div class="transition-all duration-200 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 w-full h-full overflow-hidden group">
              <div class="p-4 flex flex-col h-full">
                <div class="flex items-center gap-3 mb-2">
                  ${hasAvatar 
                    ? `<div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                        <img src="${node.data?.avatar}" alt="${node.data?.name || node.name}" class="w-full h-full object-cover" />
                      </div>`
                    : `<div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span class="text-blue-600 dark:text-blue-300 font-medium text-lg">${(node.data?.name || node.name || 'U').charAt(0)}</span>
                      </div>`
                  }
                  <div>
                    <div class="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      ${node.data?.name || node.name || 'Unnamed'}
                    </div>
                    <div class="text-sm text-slate-600 dark:text-slate-300">
                      ${node.data?.role || node.role || 'No role'}
                    </div>
                  </div>
                </div>
                ${department ? `<div class="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full self-start mb-2">${department}</div>` : ''}
                ${(node.data?.email || node.email) 
                  ? `<div class="mt-auto text-xs text-slate-500 dark:text-slate-400 truncate">${node.data?.email || node.email}</div>` 
                  : ''
                }
              </div>
            </div>
          `;
          if (debug) console.log(`Generated node content for: ${node.name}`);
          return nodeContent;
        });

      // Store the chart reference
      chartRef.current = chart as OrgChart & OrgChartEnhancements;
      
      // Render the chart
      console.log("Rendering chart...");
      
      try {
        chart.render();
        
        // Use a timeout for rendering completion
        setTimeout(() => {
          console.log("Chart rendered via timeout");
          setIsLoading(false);
        }, 1000);
      } catch (renderError) {
        console.error("Error rendering chart:", renderError);
        setChartError("Error rendering chart. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initializing chart:", error);
      setChartError("Error creating chart. Please try again.");
      setIsLoading(false);
    }

    return () => {
      try {
        if (chartRef.current) {
          console.log("Cleaning up chart");
          chartRef.current.clear();
          chartRef.current = null;
        }
      } catch (error) {
        console.error("Error clearing chart:", error);
      }
    };
  }, [data, onNodeClick, debug]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (!containerRef.current || !data) return;
    
    setIsLoading(true);
    setChartError(null);
    
    try {
      const chart = createOrgChart(containerRef.current, data);
      
      if (!chart) {
        setChartError("Failed to refresh organization chart");
        setIsLoading(false);
        return;
      }
      
      chartRef.current = chart as OrgChart & OrgChartEnhancements;
      chart.render();
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Chart refreshed",
          description: "Organization chart has been refreshed successfully",
        });
      }, 1000);
    } catch (error) {
      console.error("Error refreshing chart:", error);
      setChartError("Error refreshing chart. Please try again.");
      setIsLoading(false);
    }
  }, [data]);

  // Zoom controls with fallbacks for missing methods
  const handleZoomIn = useCallback(() => {
    if (!chartRef.current) return;
    
    try {
      // Try to use zoomIn if available
      if (chartRef.current.zoomIn && typeof chartRef.current.zoomIn === 'function') {
        console.log("Using native zoomIn");
        chartRef.current.zoomIn();
        setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
        return;
      }
      
      // Try to use setZoom if available
      if (chartRef.current.setZoom && typeof chartRef.current.setZoom === 'function') {
        const newZoom = Math.min(zoomLevel + 0.25, 2.5);
        console.log("Using setZoom:", newZoom);
        chartRef.current.setZoom(newZoom);
        setZoomLevel(newZoom);
        return;
      }
      
      console.log("Zoom methods not available, using state only");
      setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
    } catch (error) {
      console.error("Error zooming in:", error);
      // Just update the state anyway
      setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (!chartRef.current) return;
    
    try {
      // Try to use zoomOut if available
      if (chartRef.current.zoomOut && typeof chartRef.current.zoomOut === 'function') {
        console.log("Using native zoomOut");
        chartRef.current.zoomOut();
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        return;
      }
      
      // Try to use setZoom if available
      if (chartRef.current.setZoom && typeof chartRef.current.setZoom === 'function') {
        const newZoom = Math.max(zoomLevel - 0.25, 0.5);
        console.log("Using setZoom:", newZoom);
        chartRef.current.setZoom(newZoom);
        setZoomLevel(newZoom);
        return;
      }
      
      console.log("Zoom methods not available, using state only");
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    } catch (error) {
      console.error("Error zooming out:", error);
      // Just update the state anyway
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    }
  }, [zoomLevel]);

  const handleReset = useCallback(() => {
    if (!chartRef.current) return;
    
    setZoomLevel(1);
    
    try {
      // Try to use fit if available
      if (chartRef.current.fit && typeof chartRef.current.fit === 'function') {
        console.log("Using fit method");
        // First reset zoom if possible
        if (chartRef.current.setZoom && typeof chartRef.current.setZoom === 'function') {
          chartRef.current.setZoom(1);
        }
        chartRef.current.fit();
        return;
      }
      
      // If fit is not available but setZoom is
      if (chartRef.current.setZoom && typeof chartRef.current.setZoom === 'function') {
        console.log("Using setZoom(1) for reset");
        chartRef.current.setZoom(1);
        return;
      }
      
      console.log("Reset methods not available, using refresh");
      handleRefresh();
    } catch (error) {
      console.error("Error resetting view:", error);
      // If all else fails, refresh
      handleRefresh();
    }
  }, [handleRefresh]);

  return (
    <div className={`relative flex flex-col h-full ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Loading chart...</span>
          </div>
        </div>
      )}
      
      {chartError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 z-10">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chart Error</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{chartError}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-1.5 shadow-md border border-slate-200 dark:border-slate-700">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleZoomIn} 
          className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="px-2 text-xs font-medium text-slate-600 dark:text-slate-300 min-w-10 text-center">
          {Math.round(zoomLevel * 100)}%
        </div>
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
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full transition-opacity duration-300 bg-transparent overflow-hidden" 
        style={{ opacity: isLoading ? 0.3 : 1 }}
      >
        {debug && !isLoading && data.length === 0 && (
          <div className="h-full w-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-2" />
              <p>No data to display</p>
            </div>
          </div>
        )}
      </div>
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
        (node.data?.department === departmentFilter);
        
      return matchesSearch && matchesDepartment;
    });
  }, [nodes, searchTerm, departmentFilter]);

  // Render chart view with improved UI
  const renderChartView = () => (
    <Card className="h-full overflow-hidden">
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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Filter by department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departmentOptions.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] p-0">
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
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
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
                      <Select value={newNodeDepartment} onValueChange={setNewNodeDepartment}>
                        <SelectTrigger id="node-department" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {departmentOptions.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parent-node">Reports To (Optional)</Label>
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                      <SelectTrigger id="parent-node" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select manager..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Manager (Top Level)</SelectItem>
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
                          {node.data?.department && (
                            <div className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 
                                          dark:text-slate-300 rounded-full self-start mt-1 inline-block">
                              {node.data.department}
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
        <div className="flex h-full items-center justify-center p-4">
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
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
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