/**
 * 🎨 Beautiful Node Palette - Stunning Professional Shapes
 * Enterprise-grade node library with beautiful designs and interactions
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import {
  Box, Circle, Square, Triangle, Diamond, Hexagon, Star, Heart,
  Play, Pause, ArrowRight, Database, Server, Cloud, Smartphone,
  Monitor, Wifi, Shield, Key, Lock, User, Users, Building,
  Workflow, GitBranch, Route, MapPin, Target, Flag, Award,
  Calendar, Clock, CheckCircle, AlertCircle, XCircle, Info,
  Plus, Search, Filter, Grid3X3, Palette, Sparkles, Crown,
  Zap, TrendingUp, BarChart3, PieChart, LineChart, Activity,
  Settings, Gear, Tool, Wrench, Hammer, Clipboard, FileText,
  Image, Video, Music, Download, Upload, Share2, Link,
  Mail, Phone, Globe, Home, Car, Plane, Ship, Truck
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';
import { useTheme } from '../themes/AdvancedThemeSystem';

interface BeautifulNodePaletteProps {
  onClose: () => void;
  onNodeAdd?: (nodeData: any) => void;
  getViewportCenter?: () => { x: number; y: number };
}

// Node categories with stunning designs
const nodeCategories = [
  {
    id: 'basic',
    name: 'Basic Shapes',
    icon: Square,
    color: 'from-blue-500 to-cyan-500',
    description: 'Fundamental geometric shapes'
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    icon: Workflow,
    color: 'from-green-500 to-emerald-500',
    description: 'Process flow elements'
  },
  {
    id: 'network',
    name: 'Network & IT',
    icon: Server,
    color: 'from-purple-500 to-indigo-500',
    description: 'IT infrastructure components'
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building,
    color: 'from-orange-500 to-red-500',
    description: 'Business process shapes'
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-500',
    description: 'Data visualization elements'
  },
  {
    id: 'ui',
    name: 'UI Elements',
    icon: Smartphone,
    color: 'from-pink-500 to-rose-500',
    description: 'User interface components'
  },
  {
    id: 'symbols',
    name: 'Symbols & Icons',
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    description: 'Common symbols and icons'
  }
];

// Beautiful node definitions
const beautifulNodes = [
  // Basic Shapes
  {
    id: 'rectangle',
    category: 'basic',
    name: 'Rectangle',
    icon: Square,
    description: 'Clean rectangular shape',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid rgba(102, 126, 234, 0.3)',
      borderRadius: '8px',
      color: 'white',
      padding: '12px 20px',
      fontWeight: '500',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)'
    }
  },
  {
    id: 'circle',
    category: 'basic',
    name: 'Circle',
    icon: Circle,
    description: 'Perfect circular shape',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '2px solid rgba(240, 147, 251, 0.3)',
      borderRadius: '50%',
      color: 'white',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      boxShadow: '0 4px 20px rgba(240, 147, 251, 0.25)'
    }
  },
  {
    id: 'diamond',
    category: 'basic',
    name: 'Diamond',
    icon: Diamond,
    description: 'Decision point diamond',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      border: '2px solid rgba(79, 172, 254, 0.3)',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // True diamond shape
      color: 'white',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      boxShadow: '0 4px 20px rgba(79, 172, 254, 0.25)'
    }
  },
  
  // Flowchart Elements
  {
    id: 'process',
    category: 'flowchart',
    name: 'Process',
    icon: Box,
    description: 'Standard process box',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      border: '2px solid rgba(168, 237, 234, 0.4)',
      borderRadius: '12px',
      color: '#2d3748',
      padding: '16px 24px',
      fontWeight: '600',
      boxShadow: '0 6px 25px rgba(168, 237, 234, 0.3)',
      fontSize: '14px'
    }
  },
  {
    id: 'decision',
    category: 'flowchart',
    name: 'Decision',
    icon: Diamond,
    description: 'Decision diamond with gradient',
    isPremium: true,
    style: {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      border: '3px solid rgba(255, 236, 210, 0.5)',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      color: '#744210',
      width: '100px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      boxShadow: '0 8px 30px rgba(252, 182, 159, 0.4)',
      fontSize: '12px'
    }
  },
  {
    id: 'start-end',
    category: 'flowchart',
    name: 'Start/End',
    icon: Play,
    description: 'Rounded start/end terminal',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid rgba(102, 126, 234, 0.3)',
      borderRadius: '50px',
      color: 'white',
      padding: '12px 28px',
      fontWeight: '600',
      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.3)',
      fontSize: '14px'
    }
  },
  
  // Network & IT
  {
    id: 'server',
    category: 'network',
    name: 'Server',
    icon: Server,
    description: 'Modern server representation',
    isPremium: true,
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '3px solid rgba(102, 126, 234, 0.4)',
      borderRadius: '16px',
      color: 'white',
      padding: '20px',
      fontWeight: '700',
      boxShadow: '0 10px 35px rgba(102, 126, 234, 0.4)',
      position: 'relative',
      minHeight: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        height: '6px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '3px'
      }
    }
  },
  {
    id: 'database',
    category: 'network',
    name: 'Database',
    icon: Database,
    description: 'Cylinder database shape',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '2px solid rgba(240, 147, 251, 0.3)',
      borderRadius: '20px 20px 40px 40px',
      color: 'white',
      padding: '16px 20px',
      fontWeight: '600',
      boxShadow: '0 8px 30px rgba(240, 147, 251, 0.35)',
      position: 'relative',
      minHeight: '60px'
    }
  },
  {
    id: 'cloud',
    category: 'network',
    name: 'Cloud',
    icon: Cloud,
    description: 'Cloud computing shape',
    isPremium: true,
    style: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      border: '3px solid rgba(79, 172, 254, 0.4)',
      borderRadius: '50px',
      color: 'white',
      padding: '16px 32px',
      fontWeight: '700',
      boxShadow: '0 10px 40px rgba(79, 172, 254, 0.4)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-8px',
        left: '20%',
        width: '20px',
        height: '20px',
        background: 'inherit',
        borderRadius: '50%'
      }
    }
  },
  
  // Business Elements
  {
    id: 'user',
    category: 'business',
    name: 'User',
    icon: User,
    description: 'Person/user representation',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      border: '2px solid rgba(168, 237, 234, 0.4)',
      borderRadius: '50% 50% 20px 20px',
      color: '#2d3748',
      padding: '20px 16px 12px',
      fontWeight: '600',
      boxShadow: '0 8px 30px rgba(168, 237, 234, 0.35)',
      textAlign: 'center',
      minWidth: '60px'
    }
  },
  {
    id: 'team',
    category: 'business',
    name: 'Team',
    icon: Users,
    description: 'Team/group representation',
    isPremium: true,
    style: {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      border: '3px solid rgba(255, 236, 210, 0.5)',
      borderRadius: '20px',
      color: '#744210',
      padding: '18px 24px',
      fontWeight: '700',
      boxShadow: '0 10px 35px rgba(252, 182, 159, 0.4)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '8px',
        height: '8px',
        background: '#744210',
        borderRadius: '50%',
        opacity: 0.6
      }
    }
  },
  
  // Data & Analytics
  {
    id: 'chart-bar',
    category: 'data',
    name: 'Bar Chart',
    icon: BarChart3,
    description: 'Bar chart visualization',
    isPremium: false,
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid rgba(102, 126, 234, 0.3)',
      borderRadius: '12px',
      color: 'white',
      padding: '16px 20px',
      fontWeight: '600',
      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.35)',
      position: 'relative'
    }
  },
  {
    id: 'chart-pie',
    category: 'data',
    name: 'Pie Chart',
    icon: PieChart,
    description: 'Circular pie chart',
    isPremium: true,
    style: {
      background: 'conic-gradient(from 0deg, #667eea 0deg 120deg, #764ba2 120deg 240deg, #f093fb 240deg 360deg)',
      border: '3px solid rgba(102, 126, 234, 0.4)',
      borderRadius: '50%',
      color: 'white',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
      fontSize: '12px'
    }
  }
];

const BeautifulNodePalette: React.FC<BeautifulNodePaletteProps> = ({ onClose, onNodeAdd, getViewportCenter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [draggedNode, setDraggedNode] = useState<any>(null);

  const { currentTheme } = useTheme();
  const { addNode } = useDiagramStore();

  // Filter nodes based on search and category
  const filteredNodes = useMemo(() => {
    let filtered = beautifulNodes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(node => node.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  // Handle node drag start  
  const onDragStart = (event: React.DragEvent, node: any) => {
    setDraggedNode(node);
    
    // Create proper drag data for beautiful shapes
    const dragData = {
      nodeType: node.id,
      type: 'custom', // Use custom to route to BeautifulShapeNode
      data: { 
        label: node.name,
        nodeType: node.id, // Important: This routes to BeautifulShapeNode
        shape: node.id.includes('diamond') ? 'diamond' : 
               node.id.includes('circle') ? 'circle' : 'rectangle',
        description: node.description,
        customStyle: node.style,
        isBeautifulShape: true
      }
      // BeautifulShapeNode handles all styling
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';
    console.log('🎯 Drag started for node:', node.name, dragData);
  };

  // Handle node click (add to canvas)
  const handleNodeClick = (node: any) => {
    // Get current viewport center where user is looking, or fallback to canvas center
    const canvasCenter = getViewportCenter ? getViewportCenter() : { x: 400, y: 200 };
    const offset = { 
      x: (Math.random() - 0.5) * 200, // ±100px from center
      y: (Math.random() - 0.5) * 100   // ±50px from center  
    };
    
    // Map node shapes to supported ReactFlow node shapes - each shape should match its name
    const getNodeShape = (nodeId: string) => {
      if (nodeId.includes('diamond') || nodeId === 'decision') return 'diamond';
      if (nodeId.includes('circle') || nodeId === 'circle') return 'circle';
      if (nodeId.includes('hexagon')) return 'hexagon';
      if (nodeId.includes('parallelogram')) return 'parallelogram';
      if (nodeId.includes('cloud')) return 'cloud';
      if (nodeId.includes('database')) return 'database';
      if (nodeId.includes('server')) return 'server';
      if (nodeId.includes('user')) return 'user';
      if (nodeId.includes('team')) return 'team';
      return 'rectangle'; // default for basic rectangles
    };
    
    const newNode = {
      id: `${node.id}-${Date.now()}`,
      type: 'custom', // Use custom to route to BeautifulShapeNode
      position: { 
        x: Math.max(50, canvasCenter.x + offset.x), // Keep within reasonable bounds
        y: Math.max(50, canvasCenter.y + offset.y)
      },
      data: { 
        label: node.name,
        nodeType: node.id, // Important: This routes to BeautifulShapeNode
        shape: getNodeShape(node.id),
        description: node.description,
        // Mark as beautiful shape for routing
        customStyle: node.style,
        isBeautifulShape: true
      }
      // Remove inline styles - BeautifulShapeNode handles all styling
    };
    
    console.log('✅ Adding beautiful node to canvas:', newNode);
    addNode(newNode);
    
    // Provide user feedback
    console.log(`🎨 Added ${node.name} at position (${newNode.position.x}, ${newNode.position.y})`);
  };

  // Animation variants
  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    hover: { 
      scale: 1.1, 
      y: -8,
      boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    tap: { scale: 0.95 }
  };

  const categoryVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Beautiful Shapes
              </h2>
              <p className="text-sm text-gray-500">Professional node library with stunning designs</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search shapes and elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 border-gray-200/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/50 flex-shrink-0">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2 min-w-max">
            <motion.button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-white shadow-md border border-gray-200/50 text-gray-900'
                  : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
              }`}
              variants={categoryVariants}
              animate={selectedCategory === 'all' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">All Shapes</span>
              <Badge variant="outline" className="text-xs bg-gray-100 border-gray-200">
                {beautifulNodes.length}
              </Badge>
            </motion.button>
            
            {nodeCategories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              const categoryCount = beautifulNodes.filter(n => n.category === category.id).length;
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-md border border-gray-200/50 text-gray-900'
                      : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                  }`}
                  variants={categoryVariants}
                  animate={isActive ? 'active' : 'inactive'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-1 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs bg-gray-100 border-gray-200">
                    {categoryCount}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Node Grid */}
      <ScrollArea className="flex-1 px-3 md:px-6 overflow-hidden">
        <div className="py-4 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <AnimatePresence>
              {filteredNodes.map((node, index) => {
                const Icon = node.icon;
                
                return (
                  <motion.div
                    key={node.id}
                    variants={nodeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                    draggable
                    onDragStart={(e) => onDragStart(e, node)}
                    onClick={() => handleNodeClick(node)}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/95 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <CardContent className="p-3 md:p-4">
                        {/* Node Preview - Clean Preview without duplicates */}
                        <div className="flex items-center justify-center h-16 md:h-20 mb-2 md:mb-3 relative">
                          <motion.div
                            className="relative"
                            style={{
                              // Clean preview styles - only core shape and gradient
                              background: node.style?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: node.id === 'circle' ? '50%' : 
                                          node.id === 'diamond' ? '0' : '6px',
                              width: node.id === 'circle' ? '50px' : 
                                     node.id === 'diamond' ? '35px' : '60px',
                              height: node.id === 'circle' ? '50px' : 
                                      node.id === 'diamond' ? '35px' : '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              // Diamond shape using clip-path instead of rotation
                              clipPath: node.id === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                              transform: 'scale(0.8)',
                              transformOrigin: 'center'
                            }}
                            whileHover={{ 
                              scale: 0.9,
                              boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Icon className="w-4 h-4 text-white drop-shadow-sm" />
                          </motion.div>
                          
                          {node.isPremium && (
                            <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 scale-75">
                              <Crown className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>

                        {/* Node Info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                            {node.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {node.description}
                          </p>
                        </div>

                        {/* Hover Actions */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
                          initial={false}
                        />
                        
                        <motion.div
                          className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleNodeClick(node)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-md text-[10px] px-2 py-1 h-6"
                          >
                            <Plus className="w-2.5 h-2.5 mr-1" />
                            Add
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredNodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No shapes found</h3>
              <p className="text-gray-400 text-sm">
                Try adjusting your search terms or category filter
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Pro Tip */}
      <div className="p-3 md:p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex-shrink-0">
        <div className="flex items-start space-x-2 md:space-x-3">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Pro Tip</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Drag shapes onto the canvas or click to add them. Premium shapes include advanced styling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulNodePalette;