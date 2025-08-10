/**
 * 🛠️ Enterprise Toolbar - Beautiful & Functional Top Toolbar
 * Stunning toolbar with mode switching, controls, and quick actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Play, Pause, RotateCcw, RotateRight, Save, Download, Upload, Share2,
  Zap, Target, Eye, Users, Settings, Palette, Layout, Layers,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Grid, Move, Copy,
  Undo, Redo, AlignCenter, AlignLeft, AlignRight, DistributeHorizontally,
  ChevronDown, Sparkles, Crown, Award, Star, Heart, Bookmark,
  FileText, Image, Video, Link, Mail, Calendar, Clock,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Plus, Minus,
  MousePointer, Hand, Square, Circle, Triangle, Diamond,
  Type, Brush, Eraser, Eyedropper, Ruler, Crop
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';

interface EnterpriseToolbarProps {
  mode: 'design' | 'present' | 'collaborate';
  onModeChange: (mode: 'design' | 'present' | 'collaborate') => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onShare: () => void;
}

const EnterpriseToolbar: React.FC<EnterpriseToolbarProps> = ({
  mode,
  onModeChange,
  isPlaying,
  onPlayToggle,
  animationSpeed,
  onAnimationSpeedChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onShare
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [isCompactMode, setIsCompactMode] = useState(false);

  const { 
    projectName, 
    selectedNodes, 
    clearSelection,
    alignNodes,
    duplicateSelected,
    deleteSelected 
  } = useDiagramStore();

  // Mode configurations with beautiful styling
  const modes = [
    {
      id: 'design',
      name: 'Design',
      icon: Palette,
      color: 'from-blue-500 to-cyan-500',
      description: 'Create and edit diagrams'
    },
    {
      id: 'present',
      name: 'Present',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      description: 'Present and animate flows'
    },
    {
      id: 'collaborate',
      name: 'Collaborate',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      description: 'Real-time collaboration'
    }
  ] as const;

  // Tool configurations
  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer, shortcut: 'V' },
    { id: 'hand', name: 'Hand', icon: Hand, shortcut: 'H' },
    { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'R' },
    { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'O' },
    { id: 'diamond', name: 'Diamond', icon: Diamond, shortcut: 'D' },
    { id: 'text', name: 'Text', icon: Type, shortcut: 'T' },
    { id: 'brush', name: 'Brush', icon: Brush, shortcut: 'B' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, shortcut: 'E' }
  ];

  // Export options
  const exportOptions = [
    { name: 'PNG Image', icon: Image, format: 'png' },
    { name: 'SVG Vector', icon: FileText, format: 'svg' },
    { name: 'PDF Document', icon: FileText, format: 'pdf' },
    { name: 'JSON Data', icon: FileText, format: 'json' }
  ];

  // Animation variants
  const toolbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  };

  const modeVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={toolbarVariants}
        initial="hidden"
        animate="visible"
        className={`bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300 z-30 relative ${
          isCompactMode ? 'h-14' : 'h-16'
        }`}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6 overflow-x-auto">
          {/* Left Section - Mode Switcher */}
          <div className="flex items-center space-x-4">
            {/* Project Name */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">
                  {projectName || 'Untitled Diagram'}
                </h1>
                <p className="text-xs text-gray-500">Enterprise AR Editor</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center space-x-1 p-1 bg-gray-100/80 rounded-xl flex-shrink-0">
              {modes.map((modeConfig) => {
                const Icon = modeConfig.icon;
                const isActive = mode === modeConfig.id;
                
                return (
                  <Tooltip key={modeConfig.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => onModeChange(modeConfig.id as any)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                        }`}
                        variants={modeVariants}
                        animate={isActive ? 'active' : 'inactive'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isActive && (
                          <motion.div
                            className={`absolute inset-0 rounded-lg bg-gradient-to-r ${modeConfig.color}`}
                            layoutId="activeMode"
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          />
                        )}
                        <div className="relative flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{modeConfig.name}</span>
                        </div>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{modeConfig.name} Mode</p>
                      <p className="text-xs text-gray-500">{modeConfig.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Center Section - Tools */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {/* History Controls */}
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">Undo (⌘Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">Redo (⌘⇧Z)</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Quick Tools */}
            <div className="flex items-center space-x-1">
              {tools.slice(0, 6).map((tool) => {
                const Icon = tool.icon;
                const isActive = selectedTool === tool.id;
                
                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setSelectedTool(tool.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-content">
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-gray-500">Press {tool.shortcut}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Selection Tools */}
            <AnimatePresence>
              {selectedNodes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200/50"
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    {selectedNodes.length} selected
                  </Badge>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alignNodes('left')}
                        className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <AlignLeft className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-content">Align Left</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alignNodes('center')}
                        className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-content">Align Center</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateSelected()}
                        className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-content">Duplicate</TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - Actions & Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Animation Controls */}
            {mode === 'present' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-lg border border-purple-200/50 flex-shrink-0"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPlayToggle}
                      className="h-8 px-3 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip-content">{isPlaying ? 'Pause' : 'Play'} Animation</TooltipContent>
                </Tooltip>
                
                <div className="flex items-center space-x-2 text-xs text-purple-600">
                  <span>Speed:</span>
                  <div className="w-16">
                    <Slider
                      value={[animationSpeed]}
                      onValueChange={(value) => onAnimationSpeedChange(value[0])}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <span>{animationSpeed}x</span>
                </div>
              </motion.div>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Quick Actions */}
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSave}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">Save (⌘S)</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                        >
                          <Download className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-content">Export Options</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dropdown-content" style={{ zIndex: 'var(--z-tooltip)' }}>
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.format}
                        onClick={() => onExport()}
                        className="flex items-center space-x-3 px-3 py-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2">
                    <Star className="w-4 h-4" />
                    <span>Save as Template</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShare}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">Share & Collaborate</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Settings & Profile */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCompactMode(!isCompactMode)}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      {isCompactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">{isCompactMode ? 'Expand' : 'Compact'} Toolbar</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">Settings</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Progress indicator for animations */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 2 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
            >
              <motion.div
                className="h-full bg-white/30"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

export default EnterpriseToolbar;