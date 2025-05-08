import React, { useEffect, useRef, useState } from 'react';
import { OrganizationNode, Organization } from '@/types/organization';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Move, 
  Search, 
  RotateCcw, 
  Filter, 
  Download,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Grid,
  LayoutGrid
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { OrgNode, OrgChartInstance } from '@/lib/org-chart/OrgChartTypes';
import './OrgChart.css';

// This is a workaround for TypeScript - we'll use the actual library at runtime
// but interface with it through our strongly-typed interface
interface Window {
  d3OrgChart?: any;
  d3?: {
    OrgChart?: any;
  };
}
declare global {
  interface Window {
    d3OrgChart?: any;
    d3?: {
      OrgChart?: any;
    };
  }
}

interface OrgChartProps {
  organizationList?: Organization[];
  rootOrganization?: OrganizationNode;
  onNodeClick?: (node: OrganizationNode) => void;
  onNodeEdit?: (node: OrganizationNode) => void;
}

const OrgChart: React.FC<OrgChartProps> = ({ 
  organizationList, 
  rootOrganization, 
  onNodeClick, 
  onNodeEdit 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const orgChartRef = useRef<OrgChartInstance | null>(null);
  const { theme, setTheme } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hierarchicalData, setHierarchicalData] = useState<OrganizationNode | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoverNode, setHoverNode] = useState<OrganizationNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nodeSize, setNodeSize] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartLayout, setChartLayout] = useState<'tree' | 'compact'>('tree');
  const [animate, setAnimate] = useState(true);

  // Convert flat organization list to hierarchical structure
  useEffect(() => {
    if (rootOrganization) {
      // If a pre-built hierarchical structure is provided, use it directly
      setHierarchicalData(rootOrganization);
    } else if (organizationList && organizationList.length > 0) {
      // Build hierarchy from flat list using hierarchyLevel and parentId
      const orgMap = new Map<string, OrganizationNode>();
      
      // First pass: Create node objects
      organizationList.forEach(org => {
        orgMap.set(org.id, {
          id: org.id,
          name: org.name,
          role: org.type,
          type: org.type,
          hierarchyLevel: org.hierarchyLevel,
          parentId: org.parentId || null,
          department: org.description,
          email: org.securityContact?.email,
          children: []
        });
      });
      
      // Second pass: Build the tree structure
      const rootNodes: OrganizationNode[] = [];
      orgMap.forEach(node => {
        if (node.parentId && orgMap.has(node.parentId)) {
          // Add as child to parent
          const parent = orgMap.get(node.parentId);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else {
          // No parent or parent not in our list - this is a root node
          rootNodes.push(node);
        }
      });
      
      // Sort each level by hierarchyLevel
      const sortChildren = (node: OrganizationNode) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a: OrganizationNode, b: OrganizationNode) => (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0));
          node.children.forEach(sortChildren);
        }
      };
      
      rootNodes.sort((a: OrganizationNode, b: OrganizationNode) => (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0));
      rootNodes.forEach(sortChildren);
      
      // Set the root node (use the first one, or create a virtual root)
      if (rootNodes.length === 1) {
        setHierarchicalData(rootNodes[0]);
      } else if (rootNodes.length > 1) {
        // Create a virtual root if multiple root nodes
        setHierarchicalData({
          id: 'virtual-root',
          name: 'Organization Structure',
          role: 'Root',
          children: rootNodes
        });
      }
    }
  }, [organizationList, rootOrganization]);

  // Search and highlight nodes
  useEffect(() => {
    if (!searchTerm || !hierarchicalData || !orgChartRef.current) return;
    
    orgChartRef.current.clearHighlighting();
    
    if (searchTerm.length > 0) {
      orgChartRef.current.search(searchTerm.toLowerCase(), true);
    }
  }, [searchTerm, hierarchicalData]);

  // Helper function to get node color based on hierarchy level
  const getNodeColor = (level?: number): string => {
    const isDark = theme === 'dark';
    
    switch(level) {
      case 1: // Root/Parent
        return isDark ? '#1e40af' : '#3b82f6'; // Blue
      case 2: // Subsidiary
        return isDark ? '#7e22ce' : '#8b5cf6'; // Purple
      case 3: // Division
        return isDark ? '#047857' : '#10b981'; // Green
      case 4: // Region
        return isDark ? '#b45309' : '#f59e0b'; // Amber
      case 5: // Department
        return isDark ? '#9f1239' : '#e11d48'; // Red
      case 6: // Section
        return isDark ? '#5b21b6' : '#8b5cf6'; // Violet
      case 7: // Branch
        return isDark ? '#0f766e' : '#14b8a6'; // Teal
      default:
        return isDark ? '#1e40af' : '#3b82f6'; // Default blue
    }
  };

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current || !hierarchicalData) return;
    
    // Convert OrganizationNode to OrgNode
    const convertToOrgNode = (node: OrganizationNode): OrgNode => {
      return {
        ...node,
        children: node.children ? node.children.map(convertToOrgNode) : undefined
      };
    };

    const orgNodeData = convertToOrgNode(hierarchicalData);
    
    if (!orgChartRef.current) {
      try {
        // Find the OrgChart constructor from the global scope
        // This handles different ways the library might be loaded
        let OrgChartClass: any = null;
        
        if (typeof window !== 'undefined') {
          if (window.d3OrgChart) {
            OrgChartClass = window.d3OrgChart;
          } else if (window.d3 && window.d3.OrgChart) {
            OrgChartClass = window.d3.OrgChart;
          } else {
            // Try to load from the org-chart package at runtime
            OrgChartClass = require('d3-org-chart');
          }
        }
        
        if (!OrgChartClass) {
          console.error("Could not find d3-org-chart library. Make sure it's properly loaded.");
          return;
        }
        
        orgChartRef.current = new OrgChartClass() as OrgChartInstance;
        orgChartRef.current
          .container(chartRef.current)
          .data(orgNodeData)
          .nodeHeight(() => 80 * nodeSize)
          .nodeWidth(() => 180 * nodeSize)
          .childrenMargin(() => 50)
          .compactMarginBetween(() => 35)
          .compactMarginPair(() => 30)
          .neighbourMargin(() => 20)
          .siblingsMargin(() => 20)
          .buttonContent(({ node, state }: { node: any, state: any }) => {
            return `
              <div style="color: #2563eb; border-radius: 5px; padding: 4px; font-size: 10px; margin: auto auto; background-color: white; border: 1px solid #2563eb">
                <span>${node.children?.length}</span>
              </div>
            `;
          })
          .nodeContent((node: any) => {
            const borderColor = node.data._highlighted ? '#fde047' : (hoverNode?.id === node.data.id ? '#f97316' : getNodeColor(node.data.hierarchyLevel));
            const bgColor = getNodeColor(node.data.hierarchyLevel);
            const isDark = theme === 'dark';
            
            return `
              <div class="org-node ${node.data._highlighted ? 'highlighted' : ''} ${isDark ? 'dark' : ''}" 
                   style="background-color: ${bgColor}; border-color: ${borderColor};">
                <div class="org-node-content">
                  ${showLabels ? `
                    <div class="org-node-title">${node.data.name}</div>
                    <div class="org-node-subtitle">${node.data.role || 'No Role'}</div>
                    ${node.data.department ? `<div class="org-node-detail">${node.data.department}</div>` : ''}
                  ` : ''}
                </div>
              </div>
            `;
          })
          .onNodeClick((node: any) => {
            if (onNodeClick) {
              onNodeClick(node.data);
            }
          })
          .onNodeDblClick((node: any) => {
            if (onNodeEdit) {
              onNodeEdit(node.data);
            }
          });
          
        // Configure initial chart state based on component props
        if (isExpanded) {
          orgChartRef.current.expandAll();
        }
        
        if (chartLayout === 'compact') {
          orgChartRef.current.compact(true);
        }

        if (!animate) {
          orgChartRef.current.duration(0);
        }
        
        // Render the initial chart
        orgChartRef.current.render();
      } catch (error) {
        console.error("Error initializing org chart:", error);
      }
    } else {
      // Update existing chart with new data
      try {
        orgChartRef.current
          .data(orgNodeData)
          .nodeHeight(() => 80 * nodeSize)
          .nodeWidth(() => 180 * nodeSize)
          .compact(chartLayout === 'compact')
          .render();
      } catch (error) {
        console.error("Error updating org chart:", error);
      }
    }
    
    // Set up mouseover/mouseout handlers for hover effects
    if (chartRef.current) {
      try {
        const nodes = chartRef.current.querySelectorAll('.node');
        nodes.forEach((node: Element) => {
          node.addEventListener('mouseover', (e: Event) => {
            const nodeId = node.getAttribute('data-id');
            if (nodeId && orgChartRef.current) {
              const nodeData = orgChartRef.current.getNodeById(nodeId);
              if (nodeData) {
                setHoverNode(nodeData.data);
              }
            }
          });
          
          node.addEventListener('mouseout', () => {
            setHoverNode(null);
          });
        });
      } catch (error) {
        console.error("Error setting up node hover effects:", error);
      }
    }
  }, [hierarchicalData, chartLayout, nodeSize, showLabels, theme, animate, hoverNode?.id, onNodeClick, onNodeEdit]);

  // Zoom in functionality
  const handleZoomIn = () => {
    if (!orgChartRef.current) return;
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.2, 2.5);
      try {
        orgChartRef.current?.zoomIn();
      } catch (error) {
        console.error("Error zooming in:", error);
      }
      return newZoom;
    });
  };

  // Zoom out functionality
  const handleZoomOut = () => {
    if (!orgChartRef.current) return;
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.2, 0.5);
      try {
        orgChartRef.current?.zoomOut();
      } catch (error) {
        console.error("Error zooming out:", error);
      }
      return newZoom;
    });
  };

  // Reset zoom and position
  const handleReset = () => {
    if (!orgChartRef.current) return;
    setZoomLevel(1);
    try {
      orgChartRef.current.fit();
    } catch (error) {
      console.error("Error resetting view:", error);
    }
  };

  // Toggle dragging mode
  const handleToggleDrag = () => {
    setIsDragging(!isDragging);
    // D3 org chart automatically supports dragging
  };
  
  // Toggle expand/collapse all nodes
  const handleToggleExpand = () => {
    if (!orgChartRef.current) return;
    
    setIsExpanded(!isExpanded);
    try {
      if (isExpanded) {
        orgChartRef.current.collapseAll();
      } else {
        orgChartRef.current.expandAll();
      }
    } catch (error) {
      console.error("Error toggling expand/collapse:", error);
    }
  };
  
  // Handle increasing node size
  const handleIncreaseNodeSize = () => {
    setNodeSize(prev => Math.min(prev + 0.1, 1.5));
  };
  
  // Handle decreasing node size
  const handleDecreaseNodeSize = () => {
    setNodeSize(prev => Math.max(prev - 0.1, 0.6));
  };
  
  // Toggle labels visibility
  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
  };
  
  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    if (!chartRef.current) return;
    
    if (!isFullscreen) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  // Toggle chart layout
  const handleToggleLayout = () => {
    const newLayout = chartLayout === 'tree' ? 'compact' : 'tree';
    setChartLayout(newLayout);
    
    if (orgChartRef.current) {
      try {
        orgChartRef.current.compact(newLayout === 'compact').render();
      } catch (error) {
        console.error("Error changing layout:", error);
      }
    }
  };
  
  // Download chart as image
  const handleDownload = () => {
    if (!orgChartRef.current) return;
    
    try {
      orgChartRef.current.exportImg({
        full: true,
        scale: 2,
        onLoad: (imgData: string) => {
          const link = document.createElement('a');
          link.download = 'organization-chart.png';
          link.href = imgData;
          link.click();
        }
      });
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="org-chart-container">
      <div className="org-chart-toolbar">
        <div className="org-chart-toolbar-section">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleZoomIn}
                >
                  <ZoomIn size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleZoomOut}
                >
                  <ZoomOut size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleReset}
                >
                  <RotateCcw size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="org-chart-toolbar-section">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isDragging ? "default" : "outline"} 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleToggleDrag}
                >
                  <Move size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDragging ? "Pan Mode Active" : "Toggle Pan Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isExpanded ? "default" : "outline"} 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleToggleExpand}
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Collapse All" : "Expand All"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleToggleFullscreen}
                >
                  <Maximize size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="org-chart-toolbar-section">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleIncreaseNodeSize}
                >
                  <Plus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Increase Node Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleDecreaseNodeSize}
                >
                  <Minus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Decrease Node Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={chartLayout === 'compact' ? "default" : "outline"} 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleToggleLayout}
                >
                  {chartLayout === 'compact' ? <LayoutGrid size={18} /> : <Grid size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{chartLayout === 'compact' ? "Compact Layout" : "Standard Layout"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="org-chart-toolbar-section search-section">
          <div className="org-chart-search">
            <Search className="search-icon" size={16} />
            <Input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        <div className="org-chart-toolbar-section">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="org-chart-button">
                <Filter size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Chart Settings</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-labels">Show Labels</Label>
                    <Switch
                      id="show-labels"
                      checked={showLabels}
                      onCheckedChange={handleToggleLabels}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="toggle-animations">Animations</Label>
                    <Switch
                      id="toggle-animations"
                      checked={animate}
                      onCheckedChange={(checked) => {
                        setAnimate(checked);
                        if (orgChartRef.current) {
                          try {
                            orgChartRef.current.duration(checked ? 400 : 0);
                          } catch (error) {
                            console.error("Error setting animation duration:", error);
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Chart Layout</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleLayout}
                      className="flex items-center gap-2"
                    >
                      {chartLayout === 'tree' ? (
                        <><LayoutGrid size={14} /> Compact</>
                      ) : (
                        <><Grid size={14} /> Standard</>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="node-size">Node Size</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(nodeSize * 100)}%</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleDecreaseNodeSize}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Slider
                        id="node-size"
                        min={60}
                        max={150}
                        step={10}
                        value={[nodeSize * 100]}
                        onValueChange={(value) => {
                          setNodeSize(value[0] / 100);
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleIncreaseNodeSize}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant={theme === 'light' ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTheme('light')}
                      >
                        Light
                      </Button>
                      <Button 
                        variant={theme === 'dark' ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTheme('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="org-chart-button" 
                  onClick={handleDownload}
                >
                  <Download size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as Image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div 
        ref={chartRef} 
        className={cn(
          "org-chart", 
          isDragging && "cursor-grab",
          isFullscreen && "fullscreen-chart"
        )}
        data-testid="org-chart"
      />
      
      {hierarchicalData && organizationList && organizationList.length > 0 && (
        <div className="org-chart-status-bar">
          <div className="org-chart-status-item">
            <Badge variant="outline">
              {organizationList.length} Organizations
            </Badge>
          </div>
          <div className="org-chart-status-item">
            <Badge variant="outline">
              Zoom: {Math.round(zoomLevel * 100)}%
            </Badge>
          </div>
          {searchTerm && (
            <div className="org-chart-status-item">
              <Badge variant="secondary">
                Searching: "{searchTerm}"
              </Badge>
            </div>
          )}
          <div className="org-chart-status-item">
            <Badge variant="outline">
              Layout: {chartLayout === 'tree' ? 'Standard' : 'Compact'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart; 