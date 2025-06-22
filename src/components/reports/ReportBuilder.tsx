/**
 * Report Builder Component
 * Drag-and-drop interface for creating custom reports
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextType,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BarChart3,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  PieChart,
  LineChart,
  Plus,
  Settings,
  Trash2,
  Eye,
  Save,
  Download,
} from 'lucide-react';

export interface ReportElement {
  id: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'summary' | 'spacer';
  title?: string;
  config: Record<string, any>;
  data?: any;
  style?: {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface ReportConfig {
  id?: string;
  title: string;
  description?: string;
  template: 'blank' | 'compliance' | 'assessment' | 'gap_analysis' | 'executive';
  layout: 'single_column' | 'two_column' | 'three_column';
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  elements: ReportElement[];
}

const ELEMENT_TYPES = [
  {
    type: 'text',
    icon: FileText,
    label: 'Text Block',
    description: 'Add formatted text content',
  },
  {
    type: 'table',
    icon: TableIcon,
    label: 'Data Table',
    description: 'Display tabular data',
  },
  {
    type: 'chart',
    icon: BarChart3,
    label: 'Chart',
    description: 'Add charts and graphs',
  },
  {
    type: 'summary',
    icon: PieChart,
    label: 'Summary Cards',
    description: 'Key metrics and KPIs',
  },
  {
    type: 'image',
    icon: ImageIcon,
    label: 'Image',
    description: 'Add images and logos',
  },
];

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'area', label: 'Area Chart', icon: BarChart3 },
];

const REPORT_TEMPLATES = [
  {
    value: 'blank',
    label: 'Blank Report',
    description: 'Start with an empty report',
  },
  {
    value: 'compliance',
    label: 'Compliance Summary',
    description: 'Pre-configured compliance report',
  },
  {
    value: 'assessment',
    label: 'Assessment Report',
    description: 'Detailed assessment results',
  },
  {
    value: 'gap_analysis',
    label: 'Gap Analysis',
    description: 'Gap analysis with recommendations',
  },
  {
    value: 'executive',
    label: 'Executive Summary',
    description: 'High-level executive overview',
  },
];

interface SortableElementProps {
  element: ReportElement;
  onEdit: (element: ReportElement) => void;
  onDelete: (id: string) => void;
}

const SortableElement: React.FC<SortableElementProps> = ({
  element,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return FileText;
      case 'table':
        return TableIcon;
      case 'chart':
        return BarChart3;
      case 'summary':
        return PieChart;
      case 'image':
        return ImageIcon;
      default:
        return FileText;
    }
  };

  const Icon = getElementIcon(element.type);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-move border-dashed border-2 hover:border-blue-300 transition-colors"
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-sm">
              {element.title || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element`}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(element);
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">
          {element.config?.description || 'Click settings to configure'}
        </div>
      </CardContent>
    </Card>
  );
};

interface ElementConfigDialogProps {
  element: ReportElement | null;
  open: boolean;
  onClose: () => void;
  onSave: (element: ReportElement) => void;
}

const ElementConfigDialog: React.FC<ElementConfigDialogProps> = ({
  element,
  open,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<ReportElement | null>(null);

  React.useEffect(() => {
    if (element) {
      setConfig({ ...element });
    }
  }, [element]);

  const handleSave = () => {
    if (config) {
      onSave(config);
      onClose();
    }
  };

  if (!config) return null;

  const renderConfigFields = () => {
    switch (config.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={config.config.content || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, content: e.target.value },
                  })
                }
                placeholder="Enter your text content..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select
                value={config.style?.textAlign || 'left'}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    style: { ...config.style, textAlign: value as any },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select
                value={config.config.dataSource || ''}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, dataSource: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessments">Assessments</SelectItem>
                  <SelectItem value="requirements">Requirements</SelectItem>
                  <SelectItem value="findings">Findings</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="columns">Columns (comma-separated)</Label>
              <Input
                id="columns"
                value={config.config.columns?.join(', ') || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: {
                      ...config.config,
                      columns: e.target.value.split(',').map((col) => col.trim()),
                    },
                  })
                }
                placeholder="e.g., Name, Status, Date"
              />
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chartType">Chart Type</Label>
              <Select
                value={config.config.chartType || 'bar'}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, chartType: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select
                value={config.config.dataSource || ''}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, dataSource: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance_score">Compliance Score</SelectItem>
                  <SelectItem value="requirement_status">Requirement Status</SelectItem>
                  <SelectItem value="findings_by_severity">Findings by Severity</SelectItem>
                  <SelectItem value="assessment_progress">Assessment Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={config.config.height || 300}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, height: parseInt(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="metrics">Metrics to Display</Label>
              <div className="space-y-2 mt-2">
                {[
                  'Total Requirements',
                  'Fulfilled Requirements',
                  'Compliance Percentage',
                  'Critical Findings',
                  'Assessments Completed',
                  'Users Count',
                ].map((metric) => (
                  <label key={metric} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.config.metrics?.includes(metric) || false}
                      onChange={(e) => {
                        const metrics = config.config.metrics || [];
                        const updated = e.target.checked
                          ? [...metrics, metric]
                          : metrics.filter((m: string) => m !== metric);
                        setConfig({
                          ...config,
                          config: { ...config.config, metrics: updated },
                        });
                      }}
                    />
                    <span className="text-sm">{metric}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={config.config.imageUrl || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, imageUrl: e.target.value },
                  })
                }
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={config.config.altText || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, altText: e.target.value },
                  })
                }
                placeholder="Describe the image"
              />
            </div>
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={config.config.width || 200}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: { ...config.config, width: parseInt(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Configure {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Element
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={config.title || ''}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Enter element title"
            />
          </div>

          {renderConfigFields()}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ReportBuilder: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'New Report',
    template: 'blank',
    layout: 'single_column',
    pageSize: 'a4',
    orientation: 'portrait',
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
    },
    elements: [],
  });

  const [activeElement, setActiveElement] = useState<ReportElement | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveElement(
      reportConfig.elements.find((el) => el.id === active.id) || null
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportConfig((prev) => {
        const oldIndex = prev.elements.findIndex((el) => el.id === active.id);
        const newIndex = prev.elements.findIndex((el) => el.id === over?.id);

        return {
          ...prev,
          elements: arrayMove(prev.elements, oldIndex, newIndex),
        };
      });
    }

    setActiveElement(null);
  };

  const addElement = (type: string) => {
    const newElement: ReportElement = {
      id: `element_${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
      style: {},
    };

    setReportConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
  };

  const editElement = (element: ReportElement) => {
    setActiveElement(element);
    setConfigDialogOpen(true);
  };

  const saveElement = (element: ReportElement) => {
    setReportConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === element.id ? element : el
      ),
    }));
  };

  const deleteElement = (id: string) => {
    setReportConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
  };

  const saveReport = async () => {
    // TODO: Implement save functionality
    console.log('Saving report:', reportConfig);
  };

  const exportReport = async () => {
    // TODO: Implement export functionality
    console.log('Exporting report:', reportConfig);
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Report Preview</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto bg-white shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-2">{reportConfig.title}</h1>
            <div className="text-sm text-gray-500 mb-8">
              Generated on {new Date().toLocaleDateString()}
            </div>
            
            {reportConfig.elements.map((element) => (
              <div key={element.id} className="mb-6">
                {element.title && (
                  <h2 className="text-lg font-semibold mb-3">{element.title}</h2>
                )}
                
                {element.type === 'text' && (
                  <div 
                    className="prose max-w-none"
                    style={{ textAlign: element.style?.textAlign || 'left' }}
                  >
                    {element.config.content || 'No content configured'}
                  </div>
                )}
                
                {element.type === 'table' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 text-center text-gray-500">
                      Table: {element.config.dataSource || 'No data source configured'}
                    </div>
                  </div>
                )}
                
                {element.type === 'chart' && (
                  <div 
                    className="border rounded-lg bg-gray-50 flex items-center justify-center"
                    style={{ height: element.config.height || 300 }}
                  >
                    <div className="text-center text-gray-500">
                      {element.config.chartType || 'Bar'} Chart<br />
                      Data: {element.config.dataSource || 'No data source'}
                    </div>
                  </div>
                )}
                
                {element.type === 'summary' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(element.config.metrics || ['Sample Metric']).map((metric: string, index: number) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">123</div>
                        <div className="text-sm text-gray-600">{metric}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {element.type === 'image' && (
                  <div className="text-center">
                    {element.config.imageUrl ? (
                      <img
                        src={element.config.imageUrl}
                        alt={element.config.altText || 'Report image'}
                        style={{ width: element.config.width || 200 }}
                        className="mx-auto"
                      />
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mx-auto"
                        style={{ width: element.config.width || 200, height: 150 }}
                      >
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Report Builder</h1>
            <p className="text-sm text-gray-500">
              Create custom reports with drag-and-drop elements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={saveReport}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-6 h-screen overflow-y-auto">
          <Tabs defaultValue="elements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="elements" className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Add Elements</h3>
                <div className="space-y-2">
                  {ELEMENT_TYPES.map((elementType) => {
                    const Icon = elementType.icon;
                    return (
                      <Button
                        key={elementType.type}
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => addElement(elementType.type)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="text-left">
                            <div className="font-medium">{elementType.label}</div>
                            <div className="text-xs text-gray-500">
                              {elementType.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div>
                <Label htmlFor="reportTitle">Report Title</Label>
                <Input
                  id="reportTitle"
                  value={reportConfig.title}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={reportConfig.template}
                  onValueChange={(value) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      template: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TEMPLATES.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="layout">Layout</Label>
                <Select
                  value={reportConfig.layout}
                  onValueChange={(value) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      layout: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_column">Single Column</SelectItem>
                    <SelectItem value="two_column">Two Columns</SelectItem>
                    <SelectItem value="three_column">Three Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={reportConfig.branding.primaryColor}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        primaryColor: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="min-h-96 bg-white">
              <CardHeader>
                <CardTitle>{reportConfig.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={reportConfig.elements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {reportConfig.elements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No elements added yet.</p>
                          <p className="text-sm">
                            Add elements from the sidebar to get started.
                          </p>
                        </div>
                      ) : (
                        reportConfig.elements.map((element) => (
                          <SortableElement
                            key={element.id}
                            element={element}
                            onEdit={editElement}
                            onDelete={deleteElement}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                  
                  <DragOverlay>
                    {activeElement ? (
                      <Card className="opacity-80 rotate-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {activeElement.title || `${activeElement.type} Element`}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ElementConfigDialog
        element={activeElement}
        open={configDialogOpen}
        onClose={() => {
          setConfigDialogOpen(false);
          setActiveElement(null);
        }}
        onSave={saveElement}
      />
    </div>
  );
};

export default ReportBuilder;