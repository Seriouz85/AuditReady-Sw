import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { OrganizationNode, Organization } from '@/types/organization';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Move, 
  Search, 
  RotateCcw, 
  RefreshCcw, 
  Filter, 
  Download,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus
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
import './OrgChart.css';

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
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { theme, setTheme } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hierarchicalData, setHierarchicalData] = useState<OrganizationNode | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoverNode, setHoverNode] = useState<OrganizationNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nodeSize, setNodeSize] = useState<[number, number]>([160, 90]);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartLayout, setChartLayout] = useState<'orthogonal' | 'radial'>('orthogonal');
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
    if (!searchTerm || !hierarchicalData || !chartInstance.current) return;
    
    // Deep clone to avoid modifying original
    const searchAndHighlight = (node: OrganizationNode): OrganizationNode => {
      const clonedNode = {...node};
      
      const isMatch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (node.role && node.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (node.department && node.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      clonedNode.highlight = isMatch;
      
      if (node.children) {
        clonedNode.children = node.children.map(searchAndHighlight);
      }
      
      return clonedNode;
    };
    
    const highlightedData = searchAndHighlight(JSON.parse(JSON.stringify(hierarchicalData)));
    setHierarchicalData(highlightedData);
  }, [searchTerm]);

  // Convert organization data to ECharts tree data format
  const convertToEChartsFormat = (node: OrganizationNode): any => {
    // Determine if node matches search term
    const isHighlighted = node.highlight || 
                         (searchTerm && 
                          (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (node.role && node.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (node.department && node.department.toLowerCase().includes(searchTerm.toLowerCase()))));
    
    const hoverEffect = hoverNode?.id === node.id;
    
    // Build node styles based on hierarchy level
    let bgColor = '#3b82f6'; // Default blue
    let borderColor = '#2563eb';
    
    // Color scheme based on hierarchy level for visual distinction
    switch(node.hierarchyLevel) {
      case 1: // Root/Parent
        bgColor = theme === 'dark' ? '#1e40af' : '#3b82f6'; // Blue
        break;
      case 2: // Subsidiary
        bgColor = theme === 'dark' ? '#7e22ce' : '#8b5cf6'; // Purple
        break;
      case 3: // Division
        bgColor = theme === 'dark' ? '#047857' : '#10b981'; // Green
        break;
      case 4: // Region
        bgColor = theme === 'dark' ? '#b45309' : '#f59e0b'; // Amber
        break;
      case 5: // Department
        bgColor = theme === 'dark' ? '#9f1239' : '#e11d48'; // Red
        break;
      case 6: // Section
        bgColor = theme === 'dark' ? '#5b21b6' : '#8b5cf6'; // Violet
        break;
      case 7: // Branch
        bgColor = theme === 'dark' ? '#0f766e' : '#14b8a6'; // Teal
        break;
      default:
        bgColor = theme === 'dark' ? '#1e40af' : '#3b82f6'; // Default blue
    }
    
    return {
      name: node.name,
      value: node,
      children: node.children?.map((child: OrganizationNode) => convertToEChartsFormat(child)) || [],
      itemStyle: {
        color: bgColor,
        borderColor: isHighlighted ? '#fde047' : (hoverEffect ? '#f97316' : borderColor),
        borderWidth: isHighlighted ? 3 : (hoverEffect ? 2 : 1),
        borderType: isHighlighted ? 'dashed' : 'solid',
        shadowBlur: hoverEffect ? 10 : 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
      lineStyle: {
        color: isHighlighted ? '#f97316' : '#94a3b8',
        width: isHighlighted ? 2 : 1,
        curveness: 0.3,
      },
      label: {
        show: showLabels,
        position: 'inside',
        color: '#ffffff',
        formatter: (params: any) => {
          const { name, value } = params.data;
          return [
            `{title|${name}}`,
            `{role|${value.role || 'No Role'}}`,
            value.department ? `{dept|${value.department}}` : '',
          ].filter(Boolean).join('\\n');
        },
        rich: {
          title: {
            fontWeight: 'bold',
            fontSize: 14,
            padding: [2, 4, 0, 4],
            lineHeight: 20,
          },
          role: {
            fontSize: 12,
            padding: [0, 4, 2, 4],
            lineHeight: 16,
          },
          dept: {
            fontSize: 10,
            padding: [0, 4, 2, 4],
            lineHeight: 14,
            opacity: 0.8,
          }
        }
      },
      emphasis: {
        focus: 'descendant',
        itemStyle: {
          color: theme === 'dark' ? '#2563eb' : '#60a5fa',
          borderWidth: 2,
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
        lineStyle: {
          width: 2,
          color: '#f97316',
        },
        label: {
          color: '#ffffff',
          fontWeight: 'bold',
        }
      }
    };
  };

  const initChart = () => {
    if (!chartRef.current) return;
    
    // Dispose existing chart instance
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // Create new chart instance
    chartInstance.current = echarts.init(chartRef.current);
    
    // Apply responsive behavior
    window.addEventListener('resize', () => {
      chartInstance.current?.resize();
    });

    updateChart();
  };

  const updateChart = () => {
    if (!chartInstance.current || !hierarchicalData) return;

    const echartsData = convertToEChartsFormat(hierarchicalData);
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value } = params.data;
          const borderColor = params.color || '#3b82f6';
          
          // Create a more attractive tooltip with HTML/CSS
          return `
            <div class="org-tooltip">
              <div class="org-tooltip-header" style="border-color: ${borderColor}">
                <strong>${name}</strong>
              </div>
              <div class="org-tooltip-content">
                <div><span class="label">Role:</span> ${value.role || 'No Role'}</div>
                ${value.email ? `<div><span class="label">Email:</span> ${value.email}</div>` : ''}
                ${value.department ? `<div><span class="label">Dept:</span> ${value.department}</div>` : ''}
                ${value.hierarchyLevel ? `<div><span class="label">Level:</span> ${value.hierarchyLevel}</div>` : ''}
              </div>
            </div>
          `;
        },
        extraCssText: `
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 0;
          z-index: 100;
        `
      },
      series: [
        {
          type: 'tree',
          data: [echartsData],
          top: '6%',
          left: '8%',
          bottom: '6%',
          right: '8%',
          symbolSize: nodeSize,
          symbol: 'roundRect',
          roam: true,
          initialTreeDepth: isExpanded ? -1 : 1, // Expand all nodes if isExpanded is true
          expandAndCollapse: true,
          animationDuration: animate ? 750 : 0,
          animationDurationUpdate: animate ? 550 : 0,
          layout: chartLayout,
          orient: 'vertical',
          itemStyle: {
            borderWidth: 1,
            borderRadius: 5,
          },
          lineStyle: {
            color: theme === 'dark' ? '#64748b' : '#94a3b8',
            width: 1,
            curveness: 0.5
          },
          emphasis: {
            focus: 'descendant'
          },
          edgeShape: 'polyline',
          edgeForkPosition: '50%',
          leaves: {
            label: {
              position: 'inside',
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // Add click event handler
    chartInstance.current.on('click', (params: any) => {
      if (params.data?.value && onNodeClick) {
        onNodeClick(params.data.value);
      }
    });
    
    // Add double-click for edit
    chartInstance.current.on('dblclick', (params: any) => {
      if (params.data?.value && onNodeEdit) {
        onNodeEdit(params.data.value);
      }
    });
    
    // Add mouseover for hover effects
    chartInstance.current.on('mouseover', (params: any) => {
      if (params.data?.value) {
        setHoverNode(params.data.value);
      }
    });
    
    // Reset hover state on mouseout
    chartInstance.current.on('mouseout', () => {
      setHoverNode(null);
    });
  };

  // Zoom in functionality
  const handleZoomIn = () => {
    if (!chartInstance.current) return;
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.2, 2.5);
      chartInstance.current?.setOption({
        series: [{
          zoom: newZoom
        }]
      });
      return newZoom;
    });
  };

  // Zoom out functionality
  const handleZoomOut = () => {
    if (!chartInstance.current) return;
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.2, 0.5);
      chartInstance.current?.setOption({
        series: [{
          zoom: newZoom
        }]
      });
      return newZoom;
    });
  };

  // Reset zoom and position
  const handleReset = () => {
    if (!chartInstance.current) return;
    setZoomLevel(1);
    chartInstance.current.setOption({
      series: [{
        zoom: 1,
        center: ['50%', '50%']
      }]
    });
  };

  // Toggle dragging mode
  const handleToggleDrag = () => {
    setIsDragging(!isDragging);
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{
          roam: !isDragging ? 'move' : true
        }]
      });
    }
  };
  
  // Toggle expand/collapse all nodes
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{
          initialTreeDepth: !isExpanded ? -1 : 1
        }]
      });
    }
  };
  
  // Handle increasing node size
  const handleIncreaseNodeSize = () => {
    setNodeSize(prev => {
      const newSize: [number, number] = [Math.min(prev[0] + 20, 220), Math.min(prev[1] + 20, 140)];
      if (chartInstance.current) {
        chartInstance.current.setOption({
          series: [{
            symbolSize: newSize
          }]
        });
      }
      return newSize;
    });
  };
  
  // Handle decreasing node size
  const handleDecreaseNodeSize = () => {
    setNodeSize(prev => {
      const newSize: [number, number] = [Math.max(prev[0] - 20, 120), Math.max(prev[1] - 20, 60)];
      if (chartInstance.current) {
        chartInstance.current.setOption({
          series: [{
            symbolSize: newSize
          }]
        });
      }
      return newSize;
    });
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
    const newLayout = chartLayout === 'orthogonal' ? 'radial' : 'orthogonal';
    setChartLayout(newLayout);
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{
          layout: newLayout
        }]
      });
    }
  };
  
  // Download chart as image
  const handleDownload = () => {
    if (!chartInstance.current) return;
    
    const url = chartInstance.current.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
    });
    
    const link = document.createElement('a');
    link.download = 'organization-chart.png';
    link.href = url;
    link.click();
  };

  // Initialize chart on component mount
  useEffect(() => {
    initChart();
    
    // Listen for fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      window.removeEventListener('resize', () => {
        chartInstance.current?.resize();
      });
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update chart when data or theme changes
  useEffect(() => {
    if (hierarchicalData) {
      updateChart();
    }
  }, [hierarchicalData, theme, nodeSize, showLabels, chartLayout, animate]);

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
                  <ZoomIn />
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
                  <ZoomOut />
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
                  <RotateCcw />
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
                  <Move />
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
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
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
                  <Maximize />
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
                  <Plus />
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
                  <Minus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Decrease Node Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="org-chart-toolbar-section search-section">
          <div className="org-chart-search">
            <Search className="search-icon" />
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
                <Filter />
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
                      onCheckedChange={(checked) => setAnimate(checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Chart Layout</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleLayout}
                    >
                      {chartLayout === 'orthogonal' ? 'Tree View' : 'Radial View'}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="node-size">Node Size</Label>
                      <span className="text-xs text-muted-foreground">{nodeSize[0]}×{nodeSize[1]}</span>
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
                        min={120}
                        max={220}
                        step={10}
                        value={[nodeSize[0]]}
                        onValueChange={(value) => {
                          const ratio = nodeSize[1] / nodeSize[0];
                          const newSize: [number, number] = [value[0], Math.round(value[0] * ratio)];
                          setNodeSize(newSize);
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
                  <Download />
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
              Layout: {chartLayout === 'orthogonal' ? 'Tree' : 'Radial'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart; 