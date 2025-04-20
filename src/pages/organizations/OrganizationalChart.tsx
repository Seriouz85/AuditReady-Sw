import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, PlusCircle, Download, Loader2, 
  ZoomIn, ZoomOut, Maximize, Home, 
  Search, Building, Trash2, RefreshCw,
  Users, MapPin
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import { OrgChart } from '@/lib/org-chart/d3-org-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockOrganizations, Organization } from '@/pages/Organizations';
import { Badge } from '@/components/ui/badge';

// Function to convert organizations to chart nodes
const convertOrganizationsToChartNodes = (orgs) => {
  return orgs.map(org => ({
    id: org.id,
    parentId: org.parentId || '',
    name: org.name,
    role: org.type,
    email: org.securityContact?.email,
    location: `${org.address.city}, ${org.address.country}`,
    originalData: org // Keep reference to original data
  }));
};

// OrgChart component wrapper
const OrgChartComponent = ({ data, onNodeClick, isLoading = false }) => {
  const chartRef = useRef();
  const containerRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(1);
  const toast = useToast();

  // Handle zoom controls
  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoomIn();
      setZoomLevel(prevZoom => Math.min(prevZoom + 0.2, 3));
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoomOut();
      setZoomLevel(prevZoom => Math.max(prevZoom - 0.2, 0.3));
    }
  };

  const handleReset = () => {
    if (chartRef.current) {
      chartRef.current.fit();
      setZoomLevel(1);
    }
  };
  
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Initialize the chart
    const chart = new OrgChart()
      .container(containerRef.current)
      .data(data)
      .nodeWidth(() => 220)
      .nodeHeight(() => 120)
      .compact(false)
      .layout('top')
      .childrenMargin(() => 40)
      .siblingsMargin(() => 15)
      .neighbourMargin(() => 15) // Reduced distance between horizontal boxes
      .onNodeClick(d => {
        // Auto-zoom to the clicked node with animation
        chart.setExpanded(d.id, !d._expanded);
        chart.setCentered(d.id);
        
        // Update the chart and zoom level
        chart.update(d);
        setZoomLevel(1.2); // Set a comfortable zoom level
        
        if (onNodeClick) onNodeClick(d);
      })
      .nodeContent(node => {
        const { name, role, email, location } = node.data;
        // Determine background color based on organization type
        let bgColor = '#f8fafc'; // Default light gray
        let borderColor = '#e2e8f0'; // Default border
        
        switch(role) {
          case 'parent': 
            bgColor = '#eef2ff'; // Light indigo
            borderColor = '#c7d2fe';
            break;
          case 'subsidiary': 
            bgColor = '#f0fdf4'; // Light green
            borderColor = '#bbf7d0';
            break;
          case 'division': 
            bgColor = '#eff6ff'; // Light blue
            borderColor = '#bfdbfe';
            break;
          case 'department': 
            bgColor = '#fef2f2'; // Light red
            borderColor = '#fecaca';
            break;
          case 'branch': 
            bgColor = '#fef9c3'; // Light yellow
            borderColor = '#fde68a';
            break;
        }
        
        return `
          <div style="padding: 12px; border-radius: 6px; background-color: ${bgColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.12); width: 100%; height: 100%; border: 1px solid ${borderColor}; overflow: hidden;">
            <div style="font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name || 'Unnamed'}</div>
            <div style="font-size: 13px; color: #666; text-transform: capitalize; margin-top: 4px;">${role || 'No role'}</div>
            ${location ? `<div style="font-size: 12px; margin-top: 8px; display: flex; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
              <span style="margin-left: 4px;">${location}</span>
            </div>` : ''}
            ${email ? `<div style="font-size: 11px; margin-top: 4px; display: flex; align-items: center; color: #4299e1;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span style="margin-left: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${email}</span>
            </div>` : ''}
          </div>
        `;
      });

    chartRef.current = chart;
    chart.render();
    
    // Auto-fit the chart initially
    setTimeout(() => {
      chart.fit();
    }, 500);

    return () => {
      chart.clear();
    };
  }, [data, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading organization data...</p>
          </div>
        </div>
      )}
      
      {/* Chart controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* The chart container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          transition: "all 0.3s ease",
          opacity: isLoading ? 0.5 : 1 
        }}
      ></div>
      
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm py-1 px-2 rounded text-xs text-muted-foreground border">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

// Organization detail card component
const OrganizationDetails = ({ organization }) => {
  if (!organization) return null;
  
  const getTypeLabel = (type) => {
    const types = {
      'parent': 'Parent Company',
      'subsidiary': 'Subsidiary',
      'division': 'Division',
      'department': 'Department',
      'region': 'Region',
      'section': 'Section / Unit',
      'branch': 'Office / Branch'
    };
    return types[type] || type;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {organization.name}
          </CardTitle>
          {organization.complianceScopeTags && (
            <div className="flex flex-wrap gap-1">
              {organization.complianceScopeTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <CardDescription>
          {getTypeLabel(organization.type)}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3 pt-2">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            {organization.address.street}, {organization.address.city},
            {organization.address.state && ` ${organization.address.state},`}
            {` ${organization.address.zip}`}, {organization.address.country}
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <div><strong>Security Contact:</strong> {organization.securityContact.name}</div>
            <div className="text-primary">{organization.securityContact.email}</div>
          </div>
        </div>
        
        {organization.description && (
          <div className="pt-2 border-t text-muted-foreground">
            {organization.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
const OrganizationalChart = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('interactive');
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [chartNodes, setChartNodes] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [filteredChartNodes, setFilteredChartNodes] = useState([]);
  
  // Filter by organization type
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Load organization data
  useEffect(() => {
    // Simulate loading from API or context
    setIsLoading(true);
    
    setTimeout(() => {
      setOrganizations(mockOrganizations); // Use mock data from Organizations page
      const nodes = convertOrganizationsToChartNodes(mockOrganizations);
      setChartNodes(nodes);
      setFilteredChartNodes(nodes);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Handle searching and filtering
  useEffect(() => {
    if (chartNodes.length === 0) return;
    
    let filtered = [...chartNodes];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(node => node.role === typeFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        node => 
          node.name.toLowerCase().includes(query) ||
          node.role.toLowerCase().includes(query) ||
          node.location?.toLowerCase().includes(query) ||
          node.email?.toLowerCase().includes(query)
      );
    }
    
    setFilteredChartNodes(filtered);
  }, [searchQuery, typeFilter, chartNodes]);
  
  // Handle node click
  const handleNodeClick = useCallback((node) => {
    // Find the original organization data
    const org = organizations.find(o => o.id === node.id);
    if (org) {
      setSelectedOrganization(org);
      toast({
        title: "Organization Selected",
        description: `${org.name} - ${org.type}`,
        duration: 3000,
      });
    }
  }, [organizations, toast]);
  
  // Handle export
  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      // This would be an actual export in production
      toast({
        title: "Chart Exported",
        description: "The organizational chart has been exported successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setFilteredChartNodes(chartNodes);
  };
  
  // Render interactive view
  const renderInteractiveView = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
      <ResizablePanel defaultSize={70} minSize={60}>
        <div className="h-full">
          <OrgChartComponent 
            data={filteredChartNodes} 
            onNodeClick={handleNodeClick}
            isLoading={isLoading}
          />
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={30} minSize={25}>
        <div className="flex flex-col h-full p-4">
          <h3 className="text-lg font-semibold">Organization Details</h3>
          <div className="space-y-4 mt-4 flex-1 overflow-auto">
            {selectedOrganization ? (
              <OrganizationDetails organization={selectedOrganization} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Building className="h-10 w-10 mb-4 opacity-20" />
                <p>Click on an organization in the chart to view its details</p>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
  
  // Render the main component
  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Organizational Chart</h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="parent">Parent Company</SelectItem>
              <SelectItem value="subsidiary">Subsidiary</SelectItem>
              <SelectItem value="division">Division</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="branch">Branch/Office</SelectItem>
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleResetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Chart
          </Button>
        </div>
      </div>
      
      <Card className="flex-1">
        <CardHeader className="pb-0">
          <CardDescription>
            Interactive view of your organizational structure. Click on any box to see more details.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)] p-0 pt-4">
          {renderInteractiveView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationalChart; 