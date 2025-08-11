/**
 * 🎨 Color Palette Popup - Professional Color Selection
 * Interactive color picker with preset palettes and custom colors
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Palette, Pipette, Sparkles, Star } from 'lucide-react';

interface ColorPalettePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string, type: 'fill' | 'stroke' | 'text') => void;
  currentColor?: string;
  selectedType?: 'fill' | 'stroke' | 'text';
}

const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  currentColor = '#3b82f6',
  selectedType = 'fill'
}) => {
  const [customColor, setCustomColor] = useState(currentColor);
  const [activeTab, setActiveTab] = useState('presets');

  // Professional color palettes
  const colorPalettes = {
    business: {
      name: 'Business',
      colors: ['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']
    },
    primary: {
      name: 'Primary',
      colors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
    },
    success: {
      name: 'Success',
      colors: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7']
    },
    warning: {
      name: 'Warning',
      colors: ['#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa']
    },
    danger: {
      name: 'Danger',
      colors: ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca']
    },
    purple: {
      name: 'Purple',
      colors: ['#7c2d12', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#f3e8ff']
    }
  };

  // Professional gradient palettes
  const gradientPalettes = {
    professional: {
      name: 'Professional',
      gradients: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
        'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
        'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
        'linear-gradient(135deg, #4A5568 0%, #718096 100%)',
        'linear-gradient(135deg, #2B6CB0 0%, #3182CE 100%)'
      ]
    },
    vibrant: {
      name: 'Vibrant',
      gradients: [
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      ]
    },
    subtle: {
      name: 'Subtle',
      gradients: [
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      ]
    },
    radial: {
      name: 'Radial',
      gradients: [
        'radial-gradient(circle, #667eea 0%, #764ba2 100%)',
        'radial-gradient(circle, #ffecd2 0%, #fcb69f 100%)',
        'radial-gradient(circle, #a8edea 0%, #fed6e3 100%)',
        'radial-gradient(circle, #89f7fe 0%, #66a6ff 100%)',
        'radial-gradient(circle, #fddb92 0%, #d1fdff 100%)',
        'radial-gradient(circle, #9890e3 0%, #b1f4cf 100%)'
      ]
    }
  };

  // Recently used colors (mock data)
  const recentColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const handleColorClick = (color: string) => {
    onColorSelect(color, selectedType);
    setCustomColor(color);
  };

  const handleCustomColorSubmit = () => {
    onColorSelect(customColor, selectedType);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-md w-full"
        >
          <Card className="w-full bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <span>Color Palette</span>
                <div className="ml-auto flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: currentColor }}
                  />
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    ×
                  </Button>
                </div>
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Target:</span>
                <div className="flex space-x-1">
                  {['fill', 'stroke', 'text'].map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={selectedType === type ? 'default' : 'outline'}
                      onClick={() => onColorSelect(currentColor, type as any)}
                      className="text-xs capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="presets" className="text-xs">Colors</TabsTrigger>
                  <TabsTrigger value="gradients" className="text-xs">Gradients</TabsTrigger>
                  <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
                  <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4 mt-4">
                  {Object.entries(colorPalettes).map(([key, palette]) => (
                    <div key={key}>
                      <Label className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <span>{palette.name}</span>
                        {key === 'business' && <Star className="w-3 h-3 text-yellow-500" />}
                      </Label>
                      <div className="grid grid-cols-6 gap-2">
                        {palette.colors.map((color, index) => (
                          <motion.button
                            key={`${key}-${index}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleColorClick(color)}
                            className="relative w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                            style={{ 
                              background: color.startsWith('linear-gradient') ? color : color,
                              backgroundColor: color.startsWith('linear-gradient') ? 'transparent' : color
                            }}
                          >
                            {currentColor === color && (
                              <Check className="absolute inset-0 w-4 h-4 text-white m-auto drop-shadow-md" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="gradients" className="space-y-4 mt-4">
                  {Object.entries(gradientPalettes).map(([key, palette]) => (
                    <div key={key}>
                      <Label className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <span>{palette.name}</span>
                        {key === 'professional' && <Star className="w-3 h-3 text-yellow-500" />}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {palette.gradients.map((gradient, index) => (
                          <motion.button
                            key={`${key}-${index}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleColorClick(gradient)}
                            className="relative h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all overflow-hidden shadow-sm hover:shadow-md"
                            style={{ 
                              background: gradient
                            }}
                          >
                            {currentColor === gradient && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Check className="w-5 h-5 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <Label className="text-xs font-medium text-gray-700 mb-2">Quick Gradient Builder</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const gradient = `linear-gradient(90deg, ${customColor} 0%, #ffffff 100%)`;
                            handleColorClick(gradient);
                          }}
                          className="text-xs flex-1"
                        >
                          → Horizontal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const gradient = `linear-gradient(180deg, ${customColor} 0%, #ffffff 100%)`;
                            handleColorClick(gradient);
                          }}
                          className="text-xs flex-1"
                        >
                          ↓ Vertical
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const gradient = `linear-gradient(135deg, ${customColor} 0%, #ffffff 100%)`;
                            handleColorClick(gradient);
                          }}
                          className="text-xs flex-1"
                        >
                          ↘ Diagonal
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Custom Color</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-16 h-10 p-1 border-gray-300"
                      />
                      <Input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleCustomColorSubmit}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                    >
                      <Pipette className="w-4 h-4 mr-2" />
                      Apply Custom Color
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Label className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Quick Colors</span>
                    </Label>
                    <div className="grid grid-cols-8 gap-2">
                      {['#000000', '#ffffff', '#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'].map((color) => (
                        <motion.button
                          key={color}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleColorClick(color)}
                          className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3">Recently Used</Label>
                    <div className="grid grid-cols-6 gap-3">
                      {recentColors.map((color, index) => (
                        <motion.button
                          key={`recent-${index}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleColorClick(color)}
                          className="relative w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                        >
                          {currentColor === color && (
                            <Check className="absolute inset-0 w-5 h-5 text-white m-auto drop-shadow-md" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {recentColors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No recently used colors</p>
                      <p className="text-xs">Colors you use will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ColorPalettePopup;