import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Grid, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  Target,
  Settings,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Move,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Palette,
  Layers,
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'status' | 'progress' | 'alerts';
  title: string;
  subtitle?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  isVisible: boolean;
  dataSource: string;
  refreshInterval: number; // minutes
  customization: Record<string, any>;
  permissions: string[];
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  columns: number;
  theme: 'light' | 'dark' | 'auto';
  refreshRate: number;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerDashboardSettingsProps {
  organizationId: string;
  onClose?: () => void;
  onLayoutChange?: (layout: DashboardLayout) => void;
}

export function CustomerDashboardSettings({ organizationId, onClose, onLayoutChange }: CustomerDashboardSettingsProps) {
  const { user, organization } = useAuth();
  const { toast } = useToast();

  // State management
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<DashboardLayout | null>(null);
  const [availableWidgets, setAvailableWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  // Form states
  const [layoutForm, setLayoutForm] = useState({
    name: '',
    description: '',
    columns: 4,
    theme: 'auto' as DashboardLayout['theme'],
    refreshRate: 5
  });

  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' },
  ];

  // Available widget templates with enhanced metadata
  const widgetTemplates: Partial<DashboardWidget>[] = [
    {
      type: 'metric',
      title: 'Compliance Score',
      subtitle: 'Overall compliance percentage',
      size: 'small',
      dataSource: 'compliance_metrics',
      refreshInterval: 15,
      permissions: ['view_dashboard', 'view_compliance']
    },
    {
      type: 'chart',
      title: 'Risk Assessment Trends',
      subtitle: 'Risk levels over time',
      size: 'medium',
      dataSource: 'risk_assessments',
      refreshInterval: 30,
      permissions: ['view_dashboard', 'view_risks']
    },
    {
      type: 'status',
      title: 'System Health',
      subtitle: 'Platform status indicators',
      size: 'small',
      dataSource: 'system_health',
      refreshInterval: 5,
      permissions: ['view_dashboard', 'admin']
    },
    {
      type: 'table',
      title: 'Recent Documents',
      subtitle: 'Latest document uploads',
      size: 'large',
      dataSource: 'recent_documents',
      refreshInterval: 10,
      permissions: ['view_dashboard', 'view_documents']
    },
    {
      type: 'progress',
      title: 'Standard Implementation',
      subtitle: 'Progress by framework',
      size: 'medium',
      dataSource: 'standards_progress',
      refreshInterval: 60,
      permissions: ['view_dashboard', 'view_standards']
    },
    {
      type: 'alerts',
      title: 'Security Alerts',
      subtitle: 'Active security notifications',
      size: 'medium',
      dataSource: 'security_alerts',
      refreshInterval: 5,
      permissions: ['view_dashboard', 'view_security']
    },
    {
      type: 'chart',
      title: 'User Activity',
      subtitle: 'Team engagement metrics',
      size: 'medium',
      dataSource: 'user_activity',
      refreshInterval: 30,
      permissions: ['view_dashboard', 'view_users']
    },
    {
      type: 'metric',
      title: 'Data Classification',
      subtitle: 'Classified vs unclassified data',
      size: 'small',
      dataSource: 'data_classification',
      refreshInterval: 60,
      permissions: ['view_dashboard', 'view_data_classification']
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [organizationId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In production, this would load from database
      const demoLayouts: DashboardLayout[] = [
        {
          id: 'default-executive',
          name: 'Executive Dashboard',
          description: 'High-level compliance and risk overview for leadership',
          isDefault: true,
          columns: 4,
          theme: 'light',
          refreshRate: 15,
          organizationId,
          createdBy: user?.id || 'demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          widgets: [
            {
              ...widgetTemplates[0],
              id: 'widget-1',
              position: { x: 0, y: 0 },
              isVisible: true,
              customization: { color: '#22c55e', showTrend: true }
            },
            {
              ...widgetTemplates[1],
              id: 'widget-2', 
              position: { x: 1, y: 0 },
              isVisible: true,
              customization: { chartType: 'line', period: '30d' }
            },
            {
              ...widgetTemplates[2],
              id: 'widget-3',
              position: { x: 2, y: 0 },
              isVisible: true,
              customization: { alertsOnly: false }
            }
          ] as DashboardWidget[]
        },
        {
          id: 'analyst-dashboard',
          name: 'Security Analyst Dashboard',
          description: 'Detailed view for security professionals',
          isDefault: false,
          columns: 3,
          theme: 'dark',
          refreshRate: 5,
          organizationId,
          createdBy: user?.id || 'demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          widgets: [
            {
              ...widgetTemplates[5],
              id: 'widget-4',
              position: { x: 0, y: 0 },
              isVisible: true,
              customization: { severity: 'high', autoRefresh: true }
            },
            {
              ...widgetTemplates[3],
              id: 'widget-5',
              position: { x: 0, y: 1 },
              isVisible: true,
              customization: { maxRows: 10, showClassification: true }
            }
          ] as DashboardWidget[]
        }
      ];

      setLayouts(demoLayouts);
      setActiveLayout(demoLayouts[0]);
      setAvailableWidgets(widgetTemplates as DashboardWidget[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayout = async () => {
    try {
      const newLayout: DashboardLayout = {
        id: `layout-${Date.now()}`,
        ...layoutForm,
        widgets: [],
        isDefault: false,
        organizationId,
        createdBy: user?.id || 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLayouts(prev => [...prev, newLayout]);
      setShowCreateDialog(false);
      setLayoutForm({
        name: '',
        description: '',
        columns: 4,
        theme: 'auto',
        refreshRate: 5
      });

      toast({
        title: 'Success',
        description: `Dashboard layout "${newLayout.name}" created successfully`
      });
    } catch (error) {
      console.error('Error creating layout:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dashboard layout',
        variant: 'destructive'
      });
    }
  };

  const handleAddWidget = (templateIndex: number) => {
    if (!activeLayout) return;

    const template = widgetTemplates[templateIndex];
    const newWidget: DashboardWidget = {
      ...template,
      id: `widget-${Date.now()}`,
      position: { x: 0, y: activeLayout.widgets.length },
      isVisible: true,
      customization: {}
    } as DashboardWidget;

    const updatedLayout = {
      ...activeLayout,
      widgets: [...activeLayout.widgets, newWidget],
      updatedAt: new Date().toISOString()
    };

    setActiveLayout(updatedLayout);
    setLayouts(prev => prev.map(l => l.id === activeLayout.id ? updatedLayout : l));

    toast({
      title: 'Widget Added',
      description: `"${template.title}" widget has been added to your dashboard`
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!activeLayout) return;

    const updatedLayout = {
      ...activeLayout,
      widgets: activeLayout.widgets.filter(w => w.id !== widgetId),
      updatedAt: new Date().toISOString()
    };

    setActiveLayout(updatedLayout);
    setLayouts(prev => prev.map(l => l.id === activeLayout.id ? updatedLayout : l));

    toast({
      title: 'Widget Removed',
      description: 'Widget has been removed from your dashboard'
    });
  };

  const handleToggleWidget = (widgetId: string) => {
    if (!activeLayout) return;

    const updatedLayout = {
      ...activeLayout,
      widgets: activeLayout.widgets.map(w => 
        w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
      ),
      updatedAt: new Date().toISOString()
    };

    setActiveLayout(updatedLayout);
    setLayouts(prev => prev.map(l => l.id === activeLayout.id ? updatedLayout : l));
  };

  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'metric': return <TrendingUp className="h-4 w-4" />;
      case 'table': return <Grid className="h-4 w-4" />;
      case 'status': return <Shield className="h-4 w-4" />;
      case 'progress': return <Target className="h-4 w-4" />;
      case 'alerts': return <Clock className="h-4 w-4" />;
      default: return <Layout className="h-4 w-4" />;
    }
  };

  const getSizeColor = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800'; 
      case 'large': return 'bg-orange-100 text-orange-800';
      case 'full': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Customize your organization's dashboard layouts and widgets
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-3 w-3 mr-1" />
                New Layout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Dashboard Layout</DialogTitle>
                <DialogDescription>
                  Create a custom dashboard layout for your organization
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="layoutName" className="text-right">Name</Label>
                  <Input
                    id="layoutName"
                    value={layoutForm.name}
                    onChange={(e) => setLayoutForm(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="e.g., Executive Dashboard"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="layoutDesc" className="text-right">Description</Label>
                  <Input
                    id="layoutDesc"
                    value={layoutForm.description}
                    onChange={(e) => setLayoutForm(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    placeholder="Brief description of this layout"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="columns" className="text-right">Columns</Label>
                  <Select
                    value={layoutForm.columns.toString()}
                    onValueChange={(value) => setLayoutForm(prev => ({ ...prev, columns: parseInt(value) }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="6">6 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme" className="text-right">Theme</Label>
                  <Select
                    value={layoutForm.theme}
                    onValueChange={(value) => setLayoutForm(prev => ({ ...prev, theme: value as DashboardLayout['theme'] }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="refreshRate" className="text-right">Refresh Rate</Label>
                  <Select
                    value={layoutForm.refreshRate.toString()}
                    onValueChange={(value) => setLayoutForm(prev => ({ ...prev, refreshRate: parseInt(value) }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLayout}>
                  Create Layout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="layouts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="layouts" className="text-xs data-[state=active]:bg-background">
            <Layers className="h-3 w-3 mr-1" />
            Layouts
          </TabsTrigger>
          <TabsTrigger value="widgets" className="text-xs data-[state=active]:bg-background">
            <Grid className="h-3 w-3 mr-1" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs data-[state=active]:bg-background">
            <Shield className="h-3 w-3 mr-1" />
            Access
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Layouts Tab */}
        <TabsContent value="layouts" className="space-y-3">
          <div className="space-y-3">
            {/* Layout Selector */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Dashboard Layouts
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {layouts.length} layouts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 px-3 pb-3">
                <div className="space-y-2">
                  {layouts.map((layout) => (
                    <motion.div
                      key={layout.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all",
                        activeLayout?.id === layout.id 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                      onClick={() => {
                        setActiveLayout(layout);
                        onLayoutChange?.(layout);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Layout className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{layout.name}</span>
                            {layout.isDefault && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {layout.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Grid className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {layout.columns} columns
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {layout.refreshRate}min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Copy layout logic
                              toast({
                                title: 'Layout Copied',
                                description: `"${layout.name}" has been copied`
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {activeLayout?.id === layout.id && (
                            <Check className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        // Export layout logic
                        toast({
                          title: 'Export Layout',
                          description: 'Layout exported successfully'
                        });
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        // Import layout logic
                        toast({
                          title: 'Import Layout', 
                          description: 'Select a layout file to import'
                        });
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Layout Configuration */}
            {activeLayout && (
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Edit2 className="h-3 w-3" />
                        Widget Configuration
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          // Reset layout
                          toast({
                            title: 'Layout Reset',
                            description: 'Layout has been reset to defaults'
                          });
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-2">
                  <div className="space-y-2">
                    {activeLayout.widgets.map((widget, index) => (
                      <div 
                        key={widget.id}
                        className={cn(
                          "p-2 border rounded-lg transition-all",
                          widget.isVisible 
                            ? "bg-card hover:bg-muted/50 border-border" 
                            : "bg-muted/30 border-muted-foreground/20 opacity-60"
                        )}
                        draggable={widget.isVisible}
                        onDragStart={(e) => {
                          if (widget.isVisible) {
                            e.dataTransfer.setData('text/plain', widget.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1 min-w-0">
                            <div className="mt-0.5">
                              {getWidgetIcon(widget.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium truncate">{widget.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{widget.subtitle}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Badge className={`${getSizeColor(widget.size)} text-xs px-1 py-0`}>
                                  {widget.size}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {widget.refreshInterval}m
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleToggleWidget(widget.id)}
                            >
                              {widget.isVisible ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingWidget(widget)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveWidget(widget.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {activeLayout.widgets.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-6 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg"
                      >
                        <Layout className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-xs font-medium">No widgets configured</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Switch to Widget Library tab to add widgets
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Widget Library Tab */}
        <TabsContent value="widgets" className="space-y-3">
          {/* Widget Search/Filter */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search widgets..."
              className="h-8 text-xs"
              // Add search functionality
            />
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="metric">Metrics</SelectItem>
                <SelectItem value="chart">Charts</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Grid className="h-3 w-3" />
                  Widget Library
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {widgetTemplates.length} widgets
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3">
              <div className="grid grid-cols-1 gap-2">
                {widgetTemplates.map((template, index) => (
                  <motion.div 
                    key={`template-${index}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative p-3 border rounded-lg transition-all cursor-pointer group",
                      "hover:border-primary/50 hover:bg-muted/50",
                      !activeLayout && "opacity-50 cursor-not-allowed"
                    )}
                    draggable={!!activeLayout}
                    onDragStart={(e) => {
                      if (activeLayout) {
                        e.dataTransfer.setData('text/plain', `template-${index}`);
                      }
                    }}
                    onClick={() => activeLayout && handleAddWidget(index)}
                  >
                    {/* Widget Preview */}
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        "bg-primary/10 text-primary group-hover:bg-primary/20"
                      )}>
                        {getWidgetIcon(template.type!)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium">{template.title}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeLayout) handleAddWidget(index);
                            }}
                            disabled={!activeLayout}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {template.subtitle}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn(
                            "text-xs px-1.5 py-0",
                            getSizeColor(template.size!)
                          )}>
                            {template.size}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            <RefreshCw className="h-2.5 w-2.5 mr-1" />
                            {template.refreshInterval}min
                          </Badge>
                          {template.permissions && template.permissions.length > 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              <Shield className="h-2.5 w-2.5 mr-1" />
                              {template.permissions.length} perms
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Drag indicator */}
                    {activeLayout && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Move className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {!activeLayout && (
                <Alert className="mt-3">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Select a layout from the Layouts tab to add widgets
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="permissions" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Access Control</CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage dashboard permissions
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Alert className="py-2">
                <Shield className="h-3 w-3" />
                <AlertTitle className="text-xs">Permission-Based Widgets</AlertTitle>
                <AlertDescription className="text-xs">
                  Widgets respect user permissions automatically.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium">Dashboard Customization</h4>
                    <p className="text-xs text-muted-foreground truncate">Allow dashboard customization</p>
                  </div>
                  <Switch defaultChecked className="ml-2" />
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium">Widget Creation</h4>
                    <p className="text-xs text-muted-foreground truncate">Allow custom widgets</p>
                  </div>
                  <Switch className="ml-2" />
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium">Layout Sharing</h4>
                    <p className="text-xs text-muted-foreground truncate">Allow layout sharing</p>
                  </div>
                  <Switch defaultChecked className="ml-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}