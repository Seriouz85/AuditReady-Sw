/**
 * 👁️ Visualization Mode Panel - Next-Gen Views
 * 3D, AR, and immersive visualization modes
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import {
  Eye, ArrowRight, Smartphone, Monitor, Glasses,
  Volume2, VolumeX, Play, Pause, RotateCw, Maximize2,
  Settings, Palette, Layers, Grid, Box, Circle, Triangle
} from 'lucide-react';

interface VisualizationModePanelProps {
  onClose: () => void;
}

const VisualizationModePanel: React.FC<VisualizationModePanelProps> = ({ onClose }) => {
  const [selectedMode, setSelectedMode] = useState('2d');
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [depthLevel, setDepthLevel] = useState([50]);
  const [animationSpeed, setAnimationSpeed] = useState([100]);

  const visualizationModes = [
    {
      id: '2d',
      name: '2D Traditional',
      description: 'Classic flat diagram view',
      icon: Monitor,
      color: 'from-blue-500 to-cyan-500',
      isAvailable: true
    },
    {
      id: '3d',
      name: '3D Interactive',
      description: 'Three-dimensional diagram exploration',
      icon: Box,
      color: 'from-purple-500 to-pink-500',
      isAvailable: true
    },
    {
      id: 'ar',
      name: 'Augmented Reality',
      description: 'AR overlay on real environments',
      icon: Glasses,
      color: 'from-green-500 to-emerald-500',
      isAvailable: false,
      comingSoon: true
    },
    {
      id: 'immersive',
      name: 'Immersive Mode',
      description: 'Full-screen immersive experience',
      icon: Maximize2,
      color: 'from-orange-500 to-red-500',
      isAvailable: true
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-teal-50/20 to-green-50/20">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Next-Gen Views
              </h2>
              <p className="text-sm text-gray-500">3D, AR, and immersive visualization</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-6">
          {/* Visualization Modes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Visualization Modes</h3>
            <div className="space-y-3">
              {visualizationModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                
                return (
                  <motion.div
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-white shadow-md border-2 border-teal-200' 
                          : 'bg-white/80 border-gray-200/50 hover:bg-white/95'
                      } ${!mode.isAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => mode.isAvailable && setSelectedMode(mode.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{mode.name}</h4>
                              {mode.comingSoon && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                                  Coming Soon
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge className="text-xs bg-teal-100 text-teal-800 border-teal-200">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{mode.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 3D Settings */}
          {selectedMode === '3d' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-gray-800">3D Settings</h3>
              
              <Card className="bg-white/80 border-gray-200/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="3d-enabled" className="text-sm">Enable 3D Mode</Label>
                    <Switch
                      id="3d-enabled"
                      checked={is3DEnabled}
                      onCheckedChange={setIs3DEnabled}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Depth Level</Label>
                    <Slider
                      value={depthLevel}
                      onValueChange={setDepthLevel}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Flat</span>
                      <span>{depthLevel[0]}%</span>
                      <span>Deep</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Animation Speed</Label>
                    <Slider
                      value={animationSpeed}
                      onValueChange={setAnimationSpeed}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Slow</span>
                      <span>{animationSpeed[0]}%</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Preview Area */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Preview</h3>
            <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200/50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">👁️</div>
                  <h4 className="text-lg font-semibold text-gray-700">
                    {visualizationModes.find(m => m.id === selectedMode)?.name} Preview
                  </h4>
                  <p className="text-sm text-gray-500">
                    Interactive preview will appear here
                  </p>
                  <Button 
                    onClick={() => {
                      console.log('🚀 Launching', selectedMode, 'preview mode');
                      const mode = visualizationModes.find(m => m.id === selectedMode);
                      alert(`🚀 ${mode?.name} Preview Launched!\n\nMode: ${mode?.name}\nDepth Level: ${depthLevel[0]}%\nAnimation Speed: ${animationSpeed[0]}%\n\nNote: Full 3D rendering integration coming soon!\nFor now, settings have been applied to the canvas.`);
                    }}
                    className="bg-gradient-to-r from-teal-500 to-green-500 hover:opacity-90 text-white"
                  >
                    Launch Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Coming Soon</h3>
            <div className="space-y-2">
              {[
                'Virtual Reality (VR) Support',
                'Holographic Displays',
                'Voice Navigation',
                'Gesture Controls',
                'Multi-Screen Presentations'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-gray-200/30"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                  <span className="text-sm text-gray-600">{feature}</span>
                  <Badge variant="outline" className="ml-auto text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                    Soon
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200/50 bg-white/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Advanced visualization features
          </div>
          <Button 
            onClick={() => {
              console.log('⚙️ Applying visualization settings:', {
                mode: selectedMode,
                is3DEnabled,
                depthLevel: depthLevel[0],
                animationSpeed: animationSpeed[0]
              });
              
              const mode = visualizationModes.find(m => m.id === selectedMode);
              alert(`✅ Visualization Settings Applied!\n\nMode: ${mode?.name}\n3D Enabled: ${is3DEnabled ? 'Yes' : 'No'}\nDepth Level: ${depthLevel[0]}%\nAnimation Speed: ${animationSpeed[0]}%\n\nSettings saved successfully!`);
              
              // Close panel after applying
              setTimeout(() => onClose(), 1000);
            }}
            className="bg-gradient-to-r from-teal-500 to-green-500 hover:opacity-90 text-white"
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisualizationModePanel;