import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Layers, 
  Settings, 
  Users, 
  Clock, 
  Calendar,
  FileText,
  BookOpen,
  Video,
  FileQuestion,
  PenTool,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Target,
  Award,
  ChevronRight,
  ChevronDown,
  GripVertical,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  Route,
  MapPin,
  Flag,
  Shuffle,
  Lock,
  Unlock,
  Link2,
  Copy
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LearningPathNode {
  id: string;
  title: string;
  type: 'course' | 'quiz' | 'assignment' | 'page' | 'checkpoint' | 'branch';
  description: string;
  estimatedTime: number; // in minutes
  prerequisites: string[];
  isRequired: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  points: number;
  passingScore?: number;
  resources: string[];
  tags: string[];
}

interface LearningPathData {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTotalTime: number;
  nodes: LearningPathNode[];
  connections: { from: string; to: string; condition?: string }[];
  tags: string[];
  isPublished: boolean;
  enrollmentCount: number;
  completionRate: number;
  allowSelfEnrollment: boolean;
  certificateAwarded: boolean;
  maxAttempts: number;
}

const LearningPathBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathId } = useParams<{ pathId?: string }>();
  const { setTheme } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('builder');
  const [isSaving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [pathData, setPathData] = useState<LearningPathData>({
    title: '',
    description: '',
    category: 'Professional Development',
    difficulty: 'intermediate',
    estimatedTotalTime: 0,
    nodes: [],
    connections: [],
    tags: [],
    isPublished: false,
    enrollmentCount: 0,
    completionRate: 0,
    allowSelfEnrollment: true,
    certificateAwarded: false,
    maxAttempts: 3
  });

  const nodeTypes = [
    { type: 'course', label: 'Course', icon: BookOpen, color: 'bg-blue-500' },
    { type: 'quiz', label: 'Quiz', icon: FileQuestion, color: 'bg-green-500' },
    { type: 'assignment', label: 'Assignment', icon: PenTool, color: 'bg-orange-500' },
    { type: 'page', label: 'Page', icon: FileText, color: 'bg-purple-500' },
    { type: 'checkpoint', label: 'Checkpoint', icon: Flag, color: 'bg-yellow-500' },
    { type: 'branch', label: 'Branch', icon: GitBranch, color: 'bg-red-500' }
  ];

  const categories = [
    'Professional Development',
    'Technical Skills',
    'Leadership',
    'Compliance',
    'Security',
    'Communication',
    'Project Management'
  ];

  useEffect(() => {
    setTheme('light');
    
    if (pathId) {
      loadPathData();
    } else if (location.state?.learningPathData) {
      setPathData(location.state.learningPathData);
    }
  }, [pathId, location.state, setTheme]);

  const loadPathData = () => {
    // Demo learning path data
    const demoPath: LearningPathData = {
      id: pathId,
      title: 'Cybersecurity Fundamentals',
      description: 'A comprehensive learning path covering the fundamentals of cybersecurity, from basic concepts to advanced threat detection.',
      category: 'Security',
      difficulty: 'intermediate',
      estimatedTotalTime: 480, // 8 hours
      nodes: [
        {
          id: 'start',
          title: 'Introduction to Cybersecurity',
          type: 'course',
          description: 'Basic concepts and terminology',
          estimatedTime: 60,
          prerequisites: [],
          isRequired: true,
          isCompleted: false,
          position: { x: 100, y: 200 },
          status: 'not_started',
          points: 100,
          resources: [],
          tags: ['fundamentals', 'introduction']
        },
        {
          id: 'quiz1',
          title: 'Security Concepts Quiz',
          type: 'quiz',
          description: 'Test your understanding of basic security concepts',
          estimatedTime: 20,
          prerequisites: ['start'],
          isRequired: true,
          isCompleted: false,
          position: { x: 350, y: 200 },
          status: 'locked',
          points: 50,
          passingScore: 80,
          resources: [],
          tags: ['assessment', 'fundamentals']
        },
        {
          id: 'threats',
          title: 'Threat Landscape',
          type: 'course',
          description: 'Understanding modern cyber threats',
          estimatedTime: 90,
          prerequisites: ['quiz1'],
          isRequired: true,
          isCompleted: false,
          position: { x: 600, y: 200 },
          status: 'locked',
          points: 120,
          resources: [],
          tags: ['threats', 'analysis']
        },
        {
          id: 'checkpoint1',
          title: 'Mid-Point Assessment',
          type: 'checkpoint',
          description: 'Progress checkpoint',
          estimatedTime: 30,
          prerequisites: ['threats'],
          isRequired: true,
          isCompleted: false,
          position: { x: 850, y: 200 },
          status: 'locked',
          points: 0,
          resources: [],
          tags: ['checkpoint']
        },
        {
          id: 'branch1',
          title: 'Specialization Choice',
          type: 'branch',
          description: 'Choose your specialization path',
          estimatedTime: 0,
          prerequisites: ['checkpoint1'],
          isRequired: true,
          isCompleted: false,
          position: { x: 1100, y: 200 },
          status: 'locked',
          points: 0,
          resources: [],
          tags: ['branch', 'specialization']
        },
        {
          id: 'network-security',
          title: 'Network Security',
          type: 'course',
          description: 'Securing network infrastructure',
          estimatedTime: 120,
          prerequisites: ['branch1'],
          isRequired: false,
          isCompleted: false,
          position: { x: 1350, y: 100 },
          status: 'locked',
          points: 150,
          resources: [],
          tags: ['network', 'infrastructure']
        },
        {
          id: 'incident-response',
          title: 'Incident Response',
          type: 'course',
          description: 'Responding to security incidents',
          estimatedTime: 120,
          prerequisites: ['branch1'],
          isRequired: false,
          isCompleted: false,
          position: { x: 1350, y: 300 },
          status: 'locked',
          points: 150,
          resources: [],
          tags: ['incident', 'response']
        },
        {
          id: 'final-assignment',
          title: 'Capstone Project',
          type: 'assignment',
          description: 'Final comprehensive project',
          estimatedTime: 180,
          prerequisites: ['network-security', 'incident-response'],
          isRequired: true,
          isCompleted: false,
          position: { x: 1600, y: 200 },
          status: 'locked',
          points: 200,
          resources: [],
          tags: ['capstone', 'project']
        }
      ],
      connections: [
        { from: 'start', to: 'quiz1' },
        { from: 'quiz1', to: 'threats' },
        { from: 'threats', to: 'checkpoint1' },
        { from: 'checkpoint1', to: 'branch1' },
        { from: 'branch1', to: 'network-security' },
        { from: 'branch1', to: 'incident-response' },
        { from: 'network-security', to: 'final-assignment' },
        { from: 'incident-response', to: 'final-assignment' }
      ],
      tags: ['cybersecurity', 'fundamentals', 'professional'],
      isPublished: false,
      enrollmentCount: 0,
      completionRate: 0,
      allowSelfEnrollment: true,
      certificateAwarded: true,
      maxAttempts: 3
    };

    setPathData(demoPath);
  };

  const handleSave = async () => {
    if (!pathData.title.trim()) {
      toast.error('Learning path title is required');
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPath = {
        ...pathData,
        estimatedTotalTime: pathData.nodes.reduce((total, node) => total + node.estimatedTime, 0)
      };
      
      setPathData(updatedPath);
      toast.success('Learning path saved successfully');
      
      if (!pathId) {
        navigate(`/lms/learning-path/${updatedPath.id || 'demo'}`);
      }
    } catch (error) {
      toast.error('Failed to save learning path');
    } finally {
      setSaving(false);
    }
  };

  const addNode = (type: string, position: { x: number; y: number }) => {
    const typeConfig = nodeTypes.find(t => t.type === type);
    const newNode: LearningPathNode = {
      id: `node-${Date.now()}`,
      title: `New ${typeConfig?.label || 'Node'}`,
      type: type as any,
      description: '',
      estimatedTime: type === 'quiz' ? 20 : type === 'assignment' ? 120 : 60,
      prerequisites: [],
      isRequired: true,
      isCompleted: false,
      position,
      status: 'not_started',
      points: type === 'quiz' ? 50 : type === 'assignment' ? 150 : 100,
      passingScore: type === 'quiz' ? 80 : undefined,
      resources: [],
      tags: []
    };

    setPathData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setSelectedNode(newNode.id);
  };

  const updateNode = (nodeId: string, updates: Partial<LearningPathNode>) => {
    setPathData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  };

  const deleteNode = (nodeId: string) => {
    setPathData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId)
    }));
    setSelectedNode(null);
  };

  const addConnection = (fromId: string, toId: string) => {
    const newConnection = { from: fromId, to: toId };
    setPathData(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  };

  const deleteConnection = (fromId: string, toId: string) => {
    setPathData(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => 
        !(conn.from === fromId && conn.to === toId)
      )
    }));
  };

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      addConnection(connectionStart, nodeId);
      setIsConnecting(false);
      setConnectionStart(null);
    } else if (isConnecting) {
      setConnectionStart(nodeId);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleNodeDrag = (nodeId: string, newPosition: { x: number; y: number }) => {
    updateNode(nodeId, { position: newPosition });
  };

  const getNodeIcon = (type: string) => {
    const typeConfig = nodeTypes.find(t => t.type === type);
    return typeConfig?.icon || Circle;
  };

  const getNodeColor = (type: string) => {
    const typeConfig = nodeTypes.find(t => t.type === type);
    return typeConfig?.color || 'bg-gray-500';
  };

  const filteredNodes = pathData.nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const calculateProgress = () => {
    const totalNodes = pathData.nodes.length;
    const completedNodes = pathData.nodes.filter(node => node.isCompleted).length;
    return totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  };

  const selectedNodeData = pathData.nodes.find(node => node.id === selectedNode);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/lms/library')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Route className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Input
                    value={pathData.title}
                    onChange={(e) => setPathData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Learning path title"
                    className="text-lg font-semibold border-none focus:ring-0 p-0 h-auto"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant={pathData.isPublished ? "default" : "secondary"}>
                      {pathData.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <span>•</span>
                    <span>{pathData.nodes.length} nodes</span>
                    <span>•</span>
                    <span>{Math.round(pathData.estimatedTotalTime / 60)}h {pathData.estimatedTotalTime % 60}m</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'visual' ? 'list' : 'visual')}
                className="gap-2"
              >
                {viewMode === 'visual' ? <Layers className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {viewMode === 'visual' ? 'List View' : 'Visual View'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPathData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                className="gap-2"
              >
                {pathData.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto p-4">
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Main Builder Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {nodeTypes.map(type => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="builder" className="flex-1 overflow-hidden">
                {viewMode === 'visual' ? (
                  <div className="relative h-full bg-gray-50 rounded-lg border overflow-hidden">
                    {/* Canvas Controls */}
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <Button
                        variant={isConnecting ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsConnecting(!isConnecting);
                          setConnectionStart(null);
                        }}
                        className="gap-2"
                      >
                        <Link2 className="h-4 w-4" />
                        {isConnecting ? 'Cancel Connect' : 'Connect Nodes'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                      >
                        Zoom Out
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                      >
                        Zoom In
                      </Button>
                    </div>

                    {/* Node Palette */}
                    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg border p-2 shadow-lg">
                      <div className="text-sm font-medium mb-2">Add Node</div>
                      <div className="grid grid-cols-2 gap-1">
                        {nodeTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <Button
                              key={type.type}
                              variant="ghost"
                              size="sm"
                              className="p-2 h-auto flex flex-col items-center gap-1"
                              onClick={() => addNode(type.type, { x: 200, y: 200 })}
                            >
                              <div className={`w-6 h-6 rounded ${type.color} flex items-center justify-center`}>
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs">{type.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Canvas */}
                    <div 
                      className="absolute inset-0 overflow-auto"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                    >
                      <div className="relative w-[2000px] h-[1000px]">
                        {/* Connections */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {pathData.connections.map((connection, index) => {
                            const fromNode = pathData.nodes.find(n => n.id === connection.from);
                            const toNode = pathData.nodes.find(n => n.id === connection.to);
                            
                            if (!fromNode || !toNode) return null;
                            
                            const startX = fromNode.position.x + 100;
                            const startY = fromNode.position.y + 40;
                            const endX = toNode.position.x;
                            const endY = toNode.position.y + 40;
                            
                            return (
                              <g key={index}>
                                <line
                                  x1={startX}
                                  y1={startY}
                                  x2={endX}
                                  y2={endY}
                                  stroke="#94a3b8"
                                  strokeWidth="2"
                                  markerEnd="url(#arrowhead)"
                                />
                              </g>
                            );
                          })}
                          
                          {/* Arrow marker */}
                          <defs>
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="#94a3b8"
                              />
                            </marker>
                          </defs>
                        </svg>

                        {/* Nodes */}
                        {filteredNodes.map((node) => {
                          const Icon = getNodeIcon(node.type);
                          const isSelected = selectedNode === node.id;
                          
                          return (
                            <div
                              key={node.id}
                              className={cn(
                                "absolute cursor-pointer transition-all duration-200",
                                "hover:scale-105 hover:shadow-lg",
                                isSelected && "ring-2 ring-blue-500 ring-offset-2",
                                isConnecting && "hover:ring-2 hover:ring-green-500"
                              )}
                              style={{
                                left: node.position.x,
                                top: node.position.y
                              }}
                              onClick={() => handleNodeClick(node.id)}
                            >
                              <Card className="w-48 p-3 bg-white border-2 hover:border-blue-300">
                                <div className="flex items-start gap-2">
                                  <div className={`w-8 h-8 rounded-lg ${getNodeColor(node.type)} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {node.title}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2">
                                      {node.description || 'No description'}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant={node.isRequired ? "default" : "secondary"} className="text-xs">
                                        {node.isRequired ? 'Required' : 'Optional'}
                                      </Badge>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {node.estimatedTime}m
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNodes.map((node, index) => {
                      const Icon = getNodeIcon(node.type);
                      const isSelected = selectedNode === node.id;
                      
                      return (
                        <Card
                          key={node.id}
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200",
                            isSelected && "ring-2 ring-blue-500"
                          )}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-500 w-8">
                              {index + 1}
                            </div>
                            <div className={`w-8 h-8 rounded-lg ${getNodeColor(node.type)} flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{node.title}</div>
                              <div className="text-sm text-gray-500">{node.description || 'No description'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={node.isRequired ? "default" : "secondary"}>
                                {node.isRequired ? 'Required' : 'Optional'}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {node.estimatedTime}m
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Target className="h-4 w-4" />
                                {node.points} pts
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={pathData.description}
                        onChange={(e) => setPathData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this learning path"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={pathData.category} 
                          onValueChange={(value) => setPathData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select 
                          value={pathData.difficulty} 
                          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                            setPathData(prev => ({ ...prev, difficulty: value }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="maxAttempts">Max Attempts</Label>
                        <Input
                          id="maxAttempts"
                          type="number"
                          value={pathData.maxAttempts}
                          onChange={(e) => setPathData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 3 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Self-Enrollment</Label>
                          <p className="text-sm text-gray-500">Students can enroll themselves</p>
                        </div>
                        <Switch
                          checked={pathData.allowSelfEnrollment}
                          onCheckedChange={(checked) => setPathData(prev => ({ ...prev, allowSelfEnrollment: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Certificate Awarded</Label>
                          <p className="text-sm text-gray-500">Award certificate upon completion</p>
                        </div>
                        <Switch
                          checked={pathData.certificateAwarded}
                          onCheckedChange={(checked) => setPathData(prev => ({ ...prev, certificateAwarded: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{pathData.enrollmentCount}</div>
                      <div className="text-sm text-gray-500">Total Enrollments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{pathData.completionRate}%</div>
                      <div className="text-sm text-gray-500">Completion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(pathData.estimatedTotalTime / 60)}h</div>
                      <div className="text-sm text-gray-500">Total Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{pathData.nodes.reduce((sum, node) => sum + node.points, 0)}</div>
                      <div className="text-sm text-gray-500">Total Points</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Node Statistics</h3>
                    <div className="space-y-2">
                      {pathData.nodes.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${getNodeColor(node.type)}`} />
                            <span className="font-medium">{node.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{node.estimatedTime}m</span>
                            <span>{node.points} pts</span>
                            <Badge variant={node.isRequired ? "default" : "secondary"}>
                              {node.isRequired ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Node Properties Panel */}
          <div className="w-80 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">
                {selectedNodeData ? 'Node Properties' : 'Learning Path Overview'}
              </h3>
              
              {selectedNodeData ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node-title">Title</Label>
                    <Input
                      id="node-title"
                      value={selectedNodeData.title}
                      onChange={(e) => updateNode(selectedNodeData.id, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="node-description">Description</Label>
                    <Textarea
                      id="node-description"
                      value={selectedNodeData.description}
                      onChange={(e) => updateNode(selectedNodeData.id, { description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="node-time">Time (minutes)</Label>
                      <Input
                        id="node-time"
                        type="number"
                        value={selectedNodeData.estimatedTime}
                        onChange={(e) => updateNode(selectedNodeData.id, { estimatedTime: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-points">Points</Label>
                      <Input
                        id="node-points"
                        type="number"
                        value={selectedNodeData.points}
                        onChange={(e) => updateNode(selectedNodeData.id, { points: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Required</Label>
                    <Switch
                      checked={selectedNodeData.isRequired}
                      onCheckedChange={(checked) => updateNode(selectedNodeData.id, { isRequired: checked })}
                    />
                  </div>

                  <div>
                    <Label>Prerequisites</Label>
                    <div className="mt-2 space-y-1">
                      {selectedNodeData.prerequisites.map((prereqId, index) => {
                        const prereq = pathData.nodes.find(n => n.id === prereqId);
                        return (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span>{prereq?.title || 'Unknown'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newPrereqs = selectedNodeData.prerequisites.filter(id => id !== prereqId);
                                updateNode(selectedNodeData.id, { prerequisites: newPrereqs });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newNode = { ...selectedNodeData, id: `copy-${Date.now()}` };
                        setPathData(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
                      }}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteNode(selectedNodeData.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Nodes</span>
                    <span>{pathData.nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Time</span>
                    <span>{Math.round(pathData.estimatedTotalTime / 60)}h {pathData.estimatedTotalTime % 60}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points</span>
                    <span>{pathData.nodes.reduce((sum, node) => sum + node.points, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Nodes</span>
                    <span>{pathData.nodes.filter(node => node.isRequired).length}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Shuffle className="h-4 w-4" />
                  Auto-Layout
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export Path
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Path
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathBuilder;