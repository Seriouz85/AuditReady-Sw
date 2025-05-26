import React, { useState } from 'react';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { AUDIT_COLORS } from '../../core/fabric-utils';
import { Settings, Palette, Grid, Download, Sparkles } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { auditMode, setAuditMode, canvas } = useFabricCanvasStore();
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientColors, setGradientColors] = useState({ start: '#f3f4f6', end: '#e5e7eb' });
  const [customColor, setCustomColor] = useState('#ffffff');

  const auditModes = [
    { id: 'process', label: 'Process Audit', description: 'Focus on process workflows' },
    { id: 'compliance', label: 'Compliance Audit', description: 'Regulatory compliance checks' },
    { id: 'risk', label: 'Risk Assessment', description: 'Risk identification and analysis' },
  ] as const;

  const handleModeChange = (mode: 'process' | 'compliance' | 'risk') => {
    setAuditMode(mode);
  };

  const handleCanvasBackgroundChange = (color: string) => {
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
  };

  const handleGradientChange = () => {
    if (canvas && canvas.wrapperEl && canvas.wrapperEl.parentElement) {
      const container = canvas.wrapperEl.parentElement;
      const gradient = `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`;
      container.style.background = gradient;
      // Set canvas background to transparent to show gradient
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
    }
  };

  const applyGradientPreset = (start: string, end: string) => {
    setGradientColors({ start, end });
    if (canvas && canvas.wrapperEl && canvas.wrapperEl.parentElement) {
      const container = canvas.wrapperEl.parentElement;
      const gradient = `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
      container.style.background = gradient;
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
    }
  };

  const backgroundColors = [
    { name: 'Light Gray', color: AUDIT_COLORS.background },
    { name: 'White', color: AUDIT_COLORS.surface },
    { name: 'Light Blue', color: '#f0f9ff' },
    { name: 'Light Green', color: '#f0fdf4' },
  ];

  const gradientPresets = [
    { name: 'Professional', start: '#f8fafc', end: '#e2e8f0' },
    { name: 'Ocean', start: '#dbeafe', end: '#bfdbfe' },
    { name: 'Sunset', start: '#fef3c7', end: '#fed7aa' },
    { name: 'Forest', start: '#d1fae5', end: '#a7f3d0' },
    { name: 'Purple Haze', start: '#e9d5ff', end: '#c084fc' },
    { name: 'Rose Gold', start: '#fecdd3', end: '#fda4af' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Canvas Settings</h4>
        
        {/* Audit Mode */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Audit Mode</h5>
          <div className="space-y-2">
            {auditModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  auditMode === mode.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{mode.label}</div>
                <div className="text-xs text-gray-600">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Type Toggle */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Background Type</h5>
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBackgroundType('solid')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                backgroundType === 'solid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-1" />
              Solid
            </button>
            <button
              onClick={() => setBackgroundType('gradient')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                backgroundType === 'gradient' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              Gradient
            </button>
          </div>
        </div>

        {/* Solid Background Color */}
        {backgroundType === 'solid' && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Background Color</h5>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {backgroundColors.map((bg) => (
                <button
                  key={bg.color}
                  onClick={() => handleCanvasBackgroundChange(bg.color)}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: bg.color }}
                  />
                  <span className="text-xs">{bg.name}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  handleCanvasBackgroundChange(e.target.value);
                }}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-600">Custom Color</span>
            </div>
          </div>
        )}

        {/* Gradient Background */}
        {backgroundType === 'gradient' && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Gradient Background</h5>
            
            {/* Gradient Presets */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyGradientPreset(preset.start, preset.end)}
                  className="relative h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`
                  }}
                >
                  <span className="absolute bottom-0 left-0 right-0 bg-black/20 text-white text-xs py-1 text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Custom Gradient Colors */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={gradientColors.start}
                  onChange={(e) => {
                    setGradientColors({ ...gradientColors, start: e.target.value });
                    handleGradientChange();
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-600 flex-1">Start Color</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={gradientColors.end}
                  onChange={(e) => {
                    setGradientColors({ ...gradientColors, end: e.target.value });
                    handleGradientChange();
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-600 flex-1">End Color</span>
              </div>
              <button
                onClick={handleGradientChange}
                className="w-full py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Gradient
              </button>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Export</h5>
          <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <Download className="w-4 h-4" />
            Export as PNG
          </button>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Customize your audit diagram settings and export options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 