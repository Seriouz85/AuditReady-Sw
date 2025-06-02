/**
 * Node Properties Panel - Visual editing for shapes, colors, text, borders
 * Provides comprehensive visual editing capabilities
 */

import React, { useState, useCallback } from 'react';
import {
  Type, Square, Circle, Diamond,
  EyeOff, Trash2, Copy
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  MermaidDesignTokens
} from '../ui';

interface NodePropertiesProps {
  selectedNode: any;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeDuplicate: (nodeId: string) => void;
  onApplyToAll?: (updates: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  // First row - Original colors
  { name: 'Primary Blue', fill: '#2563eb', stroke: '#1d4ed8' },
  { name: 'Success Green', fill: '#10b981', stroke: '#059669' },
  { name: 'Warning Orange', fill: '#f59e0b', stroke: '#d97706' },
  { name: 'Error Red', fill: '#ef4444', stroke: '#dc2626' },
  { name: 'Purple', fill: '#8b5cf6', stroke: '#7c3aed' },
  { name: 'Cyan', fill: '#06b6d4', stroke: '#0891b2' },
  { name: 'Gray', fill: '#6b7280', stroke: '#4b5563' },
  { name: 'Dark', fill: '#1f2937', stroke: '#111827' },
  
  // Second row - Additional colors including black
  { name: 'Black', fill: '#000000', stroke: '#374151' },
  { name: 'White', fill: '#ffffff', stroke: '#d1d5db' },
  { name: 'Light Blue', fill: '#3b82f6', stroke: '#2563eb' },
  { name: 'Light Green', fill: '#22c55e', stroke: '#16a34a' },
  { name: 'Pink', fill: '#ec4899', stroke: '#db2777' },
  { name: 'Indigo', fill: '#6366f1', stroke: '#4f46e5' },
  { name: 'Yellow', fill: '#eab308', stroke: '#ca8a04' },
  { name: 'Slate', fill: '#64748b', stroke: '#475569' }
];

const SHAPE_OPTIONS = [
  { value: 'rectangle', label: 'Rectangle', icon: Square },
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'diamond', label: 'Diamond', icon: Diamond }
];

export const NodePropertiesPanel: React.FC<NodePropertiesProps> = ({
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
  onNodeDuplicate,
  onApplyToAll,
  isVisible,
  onClose
}) => {
  const [localLabel, setLocalLabel] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localFillColor, setLocalFillColor] = useState('#2563eb');
  const [localStrokeColor, setLocalStrokeColor] = useState('#1d4ed8');
  const [localStrokeWidth, setLocalStrokeWidth] = useState(2);
  const [localTextColor, setLocalTextColor] = useState('#ffffff');

  // Update local state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode?.data) {
      setLocalLabel(selectedNode.data.label || '');
      setLocalDescription(selectedNode.data.description || '');
      setLocalFillColor(selectedNode.data.fillColor || '#2563eb');
      setLocalStrokeColor(selectedNode.data.strokeColor || '#1d4ed8');
      setLocalStrokeWidth(selectedNode.data.strokeWidth || 2);
      setLocalTextColor(selectedNode.data.textColor || '#ffffff');
    }
  }, [selectedNode]);

  const handleUpdate = useCallback((field: string, value: any) => {
    if (!selectedNode) return;

    const updates = { [field]: value };
    onNodeUpdate(selectedNode.id, updates);

    // Update local state
    switch (field) {
      case 'label':
        setLocalLabel(value);
        break;
      case 'description':
        setLocalDescription(value);
        break;
      case 'fillColor':
        setLocalFillColor(value);
        break;
      case 'strokeColor':
        setLocalStrokeColor(value);
        break;
      case 'strokeWidth':
        setLocalStrokeWidth(value);
        break;
      case 'textColor':
        setLocalTextColor(value);
        break;
    }
  }, [selectedNode, onNodeUpdate]);

  const handleColorPreset = useCallback((preset: typeof COLOR_PRESETS[0]) => {
    if (!selectedNode) return;

    onNodeUpdate(selectedNode.id, {
      fillColor: preset.fill,
      strokeColor: preset.stroke
    });
    setLocalFillColor(preset.fill);
    setLocalStrokeColor(preset.stroke);
  }, [selectedNode, onNodeUpdate]);

  if (!isVisible || !selectedNode) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '300px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <GlassPanel variant="elevated" padding={3} style={{
        borderRadius: MermaidDesignTokens.borderRadius.xl,
        boxShadow: MermaidDesignTokens.shadows.glass.xl
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: MermaidDesignTokens.spacing[3],
          paddingBottom: MermaidDesignTokens.spacing[2],
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          <h3 style={{
            fontSize: MermaidDesignTokens.typography.fontSize.base,
            fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
            color: MermaidDesignTokens.colors.text.primary,
            margin: 0
          }}>
            Node Properties
          </h3>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<EyeOff size={16} />}
            onClick={onClose}
          />
        </div>

        {/* Text Content */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.xs,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[1]
          }}>
            Main Text
          </label>
          <GlassInput
            value={localLabel}
            onChange={(e) => {
              setLocalLabel(e.target.value);
              handleUpdate('label', e.target.value);
            }}
            placeholder="Enter main text..."
            icon={<Type size={16} />}
          />

          {/* Description Field */}
          <div style={{ marginTop: MermaidDesignTokens.spacing[2] }}>
            <label style={{
              display: 'block',
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary,
              marginBottom: MermaidDesignTokens.spacing[1]
            }}>
              Description (Optional)
            </label>
            <GlassInput
              value={localDescription}
              onChange={(e) => {
                setLocalDescription(e.target.value);
                handleUpdate('description', e.target.value);
              }}
              placeholder="Enter description text..."
              icon={<Type size={14} />}
            />
          </div>

        </div>

        {/* Shape Selection */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.xs,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[1]
          }}>
            Shape
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: MermaidDesignTokens.spacing[1]
          }}>
            {SHAPE_OPTIONS.map((shape) => {
              const Icon = shape.icon;
              return (
                <GlassButton
                  key={shape.value}
                  variant={selectedNode.data.shape === shape.value ? 'primary' : 'ghost'}
                  size="sm"
                  icon={<Icon size={14} />}
                  onClick={() => handleUpdate('shape', shape.value)}
                  style={{ justifyContent: 'center', fontSize: '11px' }}
                >
                  {shape.label}
                </GlassButton>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.xs,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[1]
          }}>
            Color Presets
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: MermaidDesignTokens.spacing[1]
          }}>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorPreset(preset)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  background: preset.fill,
                  border: `2px solid ${preset.stroke}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                title={preset.name}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.xs,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[1]
          }}>
            Custom Colors
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: MermaidDesignTokens.spacing[1]
          }}>
            <div>
              <label style={{
                fontSize: '10px',
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Fill
              </label>
              <input
                type="color"
                value={localFillColor}
                onChange={(e) => handleUpdate('fillColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: '10px',
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Border
              </label>
              <input
                type="color"
                value={localStrokeColor}
                onChange={(e) => handleUpdate('strokeColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: '10px',
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Text
              </label>
              <input
                type="color"
                value={localTextColor}
                onChange={(e) => handleUpdate('textColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Border Width */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.xs,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[1]
          }}>
            Border Width: {localStrokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={localStrokeWidth}
            onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: MermaidDesignTokens.colors.glass.border,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Apply to All Button */}
        {onApplyToAll && (
          <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => {
                // Gather current node properties
                const currentShape = selectedNode?.data?.shape || 'rectangle';
                const updates = {
                  fillColor: localFillColor,
                  strokeColor: localStrokeColor,
                  strokeWidth: localStrokeWidth,
                  textColor: localTextColor,
                  // Only apply shape if it makes sense (e.g., don't turn all nodes into diamonds)
                  ...(currentShape !== 'text' && { shape: currentShape })
                };
                onApplyToAll(updates);
              }}
              style={{ width: '100%' }}
            >
              Apply Style to All Shapes
            </GlassButton>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: MermaidDesignTokens.spacing[1],
          paddingTop: MermaidDesignTokens.spacing[2],
          borderTop: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Copy size={14} />}
            onClick={() => onNodeDuplicate(selectedNode.id)}
            style={{ flex: 1, fontSize: '11px' }}
          >
            Duplicate
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => onNodeDelete(selectedNode.id)}
            style={{ 
              flex: 1, 
              color: MermaidDesignTokens.colors.semantic.error[500],
              fontSize: '11px'
            }}
          >
            Delete
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  );
};

export default NodePropertiesPanel;
