import React, { useState, useEffect } from 'react';
import {
  Settings,
  Grid3X3,
  Magnet,
  MousePointer,
  Zap,
  Eye,
  Sliders,
  X,
  RotateCcw,
  Type
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getAlignmentManager } from '../core/AlignmentManager';
import { getGridManager } from '../core/GridManager';
import { getInteractionManager } from '../core/InteractionManager';
import { getTextAlignmentManager } from '../core/TextAlignmentManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [settings, setSettings] = useState({
    // Grid settings
    gridEnabled: true,
    gridSize: 20,
    snapToGrid: false,
    gridOpacity: 0.5,

    // Alignment settings
    snapEnabled: true,
    snapDistance: 8,
    snapThreshold: 15,

    // Interaction settings
    hoverEffects: true,
    selectionAnimations: true,
    smoothMovement: true,
    hoverScale: 1.05,
    selectionGlow: true,

    // Text alignment settings
    textAlignmentEnabled: true,
    textSnapDistance: 15
  });

  const alignmentManager = getAlignmentManager();
  const gridManager = getGridManager();
  const interactionManager = getInteractionManager();
  const textAlignmentManager = getTextAlignmentManager();

  useEffect(() => {
    if (!visible) return;

    // Load current settings from managers
    if (gridManager) {
      const gridOptions = gridManager.getOptions();
      setSettings(prev => ({
        ...prev,
        gridEnabled: gridOptions.enabled,
        gridSize: gridOptions.size,
        snapToGrid: gridOptions.snapToGrid,
        gridOpacity: gridOptions.opacity
      }));
    }

    if (alignmentManager) {
      setSettings(prev => ({
        ...prev,
        snapEnabled: alignmentManager.isSnapEnabled()
      }));
    }

    if (interactionManager) {
      const interactionOptions = interactionManager.getOptions();
      setSettings(prev => ({
        ...prev,
        hoverEffects: interactionOptions.enableHoverEffects,
        selectionAnimations: interactionOptions.enableSelectionAnimations,
        smoothMovement: interactionOptions.enableSmoothMovement,
        hoverScale: interactionOptions.hoverScale,
        selectionGlow: interactionOptions.selectionGlow
      }));
    }

    if (textAlignmentManager) {
      setSettings(prev => ({
        ...prev,
        textAlignmentEnabled: textAlignmentManager.isTextAlignmentEnabled(),
        textSnapDistance: textAlignmentManager.getSnapDistance()
      }));
    }
  }, [visible, alignmentManager, gridManager, interactionManager, textAlignmentManager]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Apply settings to managers
    switch (key) {
      case 'gridEnabled':
        gridManager?.setEnabled(value);
        break;
      case 'gridSize':
        gridManager?.setGridSize(value);
        break;
      case 'snapToGrid':
        gridManager?.setSnapToGrid(value);
        break;
      case 'gridOpacity':
        gridManager?.setGridOpacity(value);
        break;
      case 'snapEnabled':
        alignmentManager?.setEnabled(value);
        break;
      case 'snapDistance':
        alignmentManager?.setSnapDistance(value);
        break;
      case 'snapThreshold':
        alignmentManager?.setSnapThreshold(value);
        break;
      case 'hoverEffects':
        interactionManager?.enableHoverEffects(value);
        break;
      case 'selectionAnimations':
        interactionManager?.enableSelectionAnimations(value);
        break;
      case 'smoothMovement':
        interactionManager?.enableSmoothMovement(value);
        break;
      case 'hoverScale':
        interactionManager?.setHoverScale(value);
        break;
      case 'selectionGlow':
        interactionManager?.enableSelectionGlow(value);
        break;
      case 'textAlignmentEnabled':
        textAlignmentManager?.setEnabled(value);
        break;
      case 'textSnapDistance':
        textAlignmentManager?.setSnapDistance(value);
        break;
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      gridEnabled: true,
      gridSize: 20,
      snapToGrid: false,
      gridOpacity: 0.5,
      snapEnabled: true,
      snapDistance: 8,
      snapThreshold: 15,
      hoverEffects: true,
      selectionAnimations: true,
      smoothMovement: true,
      hoverScale: 1.05,
      selectionGlow: true,
      textAlignmentEnabled: true,
      textSnapDistance: 15
    };

    setSettings(defaults);

    // Apply defaults to managers
    Object.entries(defaults).forEach(([key, value]) => {
      handleSettingChange(key, value);
    });
  };

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '500px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '32px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  };

  const ToggleComponent: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: checked ? AUDIT_COLORS.primary : '#d1d5db',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      />
    </button>
  );

  const SliderComponent: React.FC<{ value: number; min: number; max: number; step: number; onChange: (value: number) => void }> =
    ({ value, min, max, step, onChange }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '120px',
        height: '4px',
        borderRadius: '2px',
        background: `linear-gradient(to right, ${AUDIT_COLORS.primary} 0%, ${AUDIT_COLORS.primary} ${((value - min) / (max - min)) * 100}%, #d1d5db ${((value - min) / (max - min)) * 100}%, #d1d5db 100%)`,
        outline: 'none',
        cursor: 'pointer'
      }}
    />
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Editor Settings
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={resetToDefaults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: `1px solid ${AUDIT_COLORS.border}`,
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#6b7280',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Grid Settings */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Grid3X3 size={20} />
              Grid & Snapping
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Show Grid</span>
              <ToggleComponent
                checked={settings.gridEnabled}
                onChange={(checked) => handleSettingChange('gridEnabled', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Grid Size: {settings.gridSize}px</span>
              <SliderComponent
                value={settings.gridSize}
                min={10}
                max={50}
                step={5}
                onChange={(value) => handleSettingChange('gridSize', value)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Snap to Grid</span>
              <ToggleComponent
                checked={settings.snapToGrid}
                onChange={(checked) => handleSettingChange('snapToGrid', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Grid Opacity: {Math.round(settings.gridOpacity * 100)}%</span>
              <SliderComponent
                value={settings.gridOpacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={(value) => handleSettingChange('gridOpacity', value)}
              />
            </div>
          </div>

          {/* Alignment Settings */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Magnet size={20} />
              Smart Alignment
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Enable Snapping</span>
              <ToggleComponent
                checked={settings.snapEnabled}
                onChange={(checked) => handleSettingChange('snapEnabled', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Snap Distance: {settings.snapDistance}px</span>
              <SliderComponent
                value={settings.snapDistance}
                min={5}
                max={20}
                step={1}
                onChange={(value) => handleSettingChange('snapDistance', value)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Snap Threshold: {settings.snapThreshold}px</span>
              <SliderComponent
                value={settings.snapThreshold}
                min={5}
                max={30}
                step={5}
                onChange={(value) => handleSettingChange('snapThreshold', value)}
              />
            </div>
          </div>

          {/* Text Alignment Settings */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Type size={20} />
              Text Alignment
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Enable Text Alignment</span>
              <ToggleComponent
                checked={settings.textAlignmentEnabled}
                onChange={(checked) => handleSettingChange('textAlignmentEnabled', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Text Snap Distance: {settings.textSnapDistance}px</span>
              <SliderComponent
                value={settings.textSnapDistance}
                min={5}
                max={30}
                step={5}
                onChange={(value) => handleSettingChange('textSnapDistance', value)}
              />
            </div>
          </div>

          {/* Interaction Settings */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <MousePointer size={20} />
              Interactions & Animations
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Hover Effects</span>
              <ToggleComponent
                checked={settings.hoverEffects}
                onChange={(checked) => handleSettingChange('hoverEffects', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Selection Animations</span>
              <ToggleComponent
                checked={settings.selectionAnimations}
                onChange={(checked) => handleSettingChange('selectionAnimations', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Smooth Movement</span>
              <ToggleComponent
                checked={settings.smoothMovement}
                onChange={(checked) => handleSettingChange('smoothMovement', checked)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Hover Scale: {settings.hoverScale.toFixed(2)}x</span>
              <SliderComponent
                value={settings.hoverScale}
                min={1}
                max={1.2}
                step={0.05}
                onChange={(value) => handleSettingChange('hoverScale', value)}
              />
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Selection Glow</span>
              <ToggleComponent
                checked={settings.selectionGlow}
                onChange={(checked) => handleSettingChange('selectionGlow', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
