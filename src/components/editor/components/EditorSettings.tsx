/**
 * 🛠️ Editor Settings Panel - Comprehensive Configuration
 * Complete settings management for Enterprise AR Editor
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Settings, X, Save, RotateCcw, Grid3X3, Eye, Palette, Zap,
  Keyboard, Download, Upload, Monitor, Smartphone, Tablet,
  Volume2, VolumeX, Sun, Moon, Gauge, Layers, Target,
  CheckCircle, AlertTriangle, Info, HelpCircle, ExternalLink
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';

interface EditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsState {
  // Canvas Settings
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showMinimap: boolean;
  animationSpeed: number;
  
  // Theme & Appearance
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  nodeStyle: 'minimal' | 'gradient' | 'professional';
  edgeStyle: 'straight' | 'bezier' | 'step';
  
  // Performance
  enableAnimations: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  maxNodes: number;
  enableVirtualization: boolean;
  
  // Export Settings
  exportFormat: 'png' | 'svg' | 'pdf' | 'json';
  exportQuality: number;
  includeBackground: boolean;
  
  // Editor Preferences
  enableTooltips: boolean;
  enableSounds: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  
  // Keyboard Shortcuts
  enableShortcuts: boolean;
  shortcuts: Record<string, string>;
}

const defaultSettings: SettingsState = {
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  showMinimap: true,
  animationSpeed: 50,
  theme: 'light',
  primaryColor: '#667eea',
  nodeStyle: 'gradient',
  edgeStyle: 'bezier',
  enableAnimations: true,
  renderQuality: 'high',
  maxNodes: 1000,
  enableVirtualization: false,
  exportFormat: 'png',
  exportQuality: 100,
  includeBackground: true,
  enableTooltips: true,
  enableSounds: false,
  autoSave: true,
  autoSaveInterval: 30,
  enableShortcuts: true,
  shortcuts: {
    'ctrl+s': 'Save',
    'ctrl+z': 'Undo',
    'ctrl+y': 'Redo',
    'delete': 'Delete Selected',
    'ctrl+a': 'Select All',
    'ctrl+c': 'Copy',
    'ctrl+v': 'Paste'
  }
};

const EditorSettings: React.FC<EditorSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');

  const { 
    showGrid, 
    setShowGrid, 
    showMinimap, 
    setShowMinimap,
    currentTheme,
    setCurrentTheme
  } = useDiagramStore();

  // Update setting and track changes
  const updateSetting = <K extends keyof SettingsState>(
    key: K, 
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings and apply to store
  const handleSave = () => {
    // Apply settings to diagram store
    setShowGrid(settings.showGrid);
    setShowMinimap(settings.showMinimap);
    
    // Save to localStorage for persistence
    localStorage.setItem('ar-editor-settings', JSON.stringify(settings));
    
    setHasChanges(false);
    
    // Show success feedback
    console.log('✅ Settings saved successfully', settings);
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // Import/Export settings
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ar-editor-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...importedSettings });
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import settings:', error);
        // TODO: Show error toast
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Editor Settings
                  </h2>
                  <p className="text-gray-600">Configure your diagram editor experience</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} title="Close Settings">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Settings Content */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-6 py-4 bg-gray-50 border-b">
                  <TabsTrigger value="canvas" className="flex items-center space-x-2">
                    <Grid3X3 className="w-4 h-4" />
                    <span>Canvas</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Appearance</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="shortcuts" className="flex items-center space-x-2">
                    <Keyboard className="w-4 h-4" />
                    <span>Shortcuts</span>
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 overflow-auto">
                  <div className="p-6">
                    {/* Canvas Settings */}
                    <TabsContent value="canvas" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Grid3X3 className="w-5 h-5" />
                              <span>Grid Settings</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="show-grid">Show Grid</Label>
                              <Switch
                                id="show-grid"
                                checked={settings.showGrid}
                                onCheckedChange={(value) => updateSetting('showGrid', value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Grid Size: {settings.gridSize}px</Label>
                              <Slider
                                value={[settings.gridSize]}
                                onValueChange={([value]) => updateSetting('gridSize', value)}
                                min={10}
                                max={50}
                                step={5}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="snap-to-grid">Snap to Grid</Label>
                              <Switch
                                id="snap-to-grid"
                                checked={settings.snapToGrid}
                                onCheckedChange={(value) => updateSetting('snapToGrid', value)}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Eye className="w-5 h-5" />
                              <span>Display</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="show-minimap">Show Minimap</Label>
                              <Switch
                                id="show-minimap"
                                checked={settings.showMinimap}
                                onCheckedChange={(value) => updateSetting('showMinimap', value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Animation Speed: {settings.animationSpeed}%</Label>
                              <Slider
                                value={[settings.animationSpeed]}
                                onValueChange={([value]) => updateSetting('animationSpeed', value)}
                                min={0}
                                max={100}
                                step={10}
                                className="w-full"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Theme & Colors</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Theme</Label>
                              <Select
                                value={settings.theme}
                                onValueChange={(value: any) => updateSetting('theme', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">
                                    <div className="flex items-center space-x-2">
                                      <Sun className="w-4 h-4" />
                                      <span>Light</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="dark">
                                    <div className="flex items-center space-x-2">
                                      <Moon className="w-4 h-4" />
                                      <span>Dark</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="auto">
                                    <div className="flex items-center space-x-2">
                                      <Monitor className="w-4 h-4" />
                                      <span>Auto</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Primary Color</Label>
                              <div className="flex items-center space-x-3">
                                <Input
                                  type="color"
                                  value={settings.primaryColor}
                                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                                  className="w-20 h-10"
                                />
                                <Input
                                  type="text"
                                  value={settings.primaryColor}
                                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                                  placeholder="#667eea"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Node & Edge Styles</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Node Style</Label>
                              <Select
                                value={settings.nodeStyle}
                                onValueChange={(value: any) => updateSetting('nodeStyle', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minimal">Minimal</SelectItem>
                                  <SelectItem value="gradient">Gradient</SelectItem>
                                  <SelectItem value="professional">Professional</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Edge Style</Label>
                              <Select
                                value={settings.edgeStyle}
                                onValueChange={(value: any) => updateSetting('edgeStyle', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="straight">Straight</SelectItem>
                                  <SelectItem value="bezier">Bezier</SelectItem>
                                  <SelectItem value="step">Step</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Performance Settings */}
                    <TabsContent value="performance" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Gauge className="w-5 h-5" />
                            <span>Performance Options</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Enable Animations</Label>
                              <Switch
                                checked={settings.enableAnimations}
                                onCheckedChange={(value) => updateSetting('enableAnimations', value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Render Quality</Label>
                              <Select
                                value={settings.renderQuality}
                                onValueChange={(value: any) => updateSetting('renderQuality', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low (Better Performance)</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High (Best Quality)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Max Nodes: {settings.maxNodes}</Label>
                              <Slider
                                value={[settings.maxNodes]}
                                onValueChange={([value]) => updateSetting('maxNodes', value)}
                                min={100}
                                max={5000}
                                step={100}
                                className="w-full"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label>Enable Virtualization</Label>
                              <Switch
                                checked={settings.enableVirtualization}
                                onCheckedChange={(value) => updateSetting('enableVirtualization', value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Shortcuts */}
                    <TabsContent value="shortcuts" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Keyboard Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Enable Keyboard Shortcuts</Label>
                              <Switch
                                checked={settings.enableShortcuts}
                                onCheckedChange={(value) => updateSetting('enableShortcuts', value)}
                              />
                            </div>

                            {settings.enableShortcuts && (
                              <div className="space-y-3">
                                {Object.entries(settings.shortcuts).map(([shortcut, action]) => (
                                  <div key={shortcut} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <Badge variant="outline" className="font-mono">
                                        {shortcut}
                                      </Badge>
                                      <span className="text-sm text-gray-700">{action}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Export Settings */}
                    <TabsContent value="export" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Export Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Default Format</Label>
                              <Select
                                value={settings.exportFormat}
                                onValueChange={(value: any) => updateSetting('exportFormat', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG Image</SelectItem>
                                  <SelectItem value="svg">SVG Vector</SelectItem>
                                  <SelectItem value="pdf">PDF Document</SelectItem>
                                  <SelectItem value="json">JSON Data</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label>Include Background</Label>
                              <Switch
                                checked={settings.includeBackground}
                                onCheckedChange={(value) => updateSetting('includeBackground', value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Export Quality: {settings.exportQuality}%</Label>
                              <Slider
                                value={[settings.exportQuality]}
                                onValueChange={([value]) => updateSetting('exportQuality', value)}
                                min={50}
                                max={100}
                                step={10}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSettings}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Settings</span>
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Settings</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditorSettings;