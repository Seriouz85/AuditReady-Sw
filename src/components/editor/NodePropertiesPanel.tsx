/**
 * Node Properties Panel - Visual editing for shapes, colors, text, borders
 * Provides comprehensive visual editing capabilities
 */

import React, { useState, useCallback } from 'react';
import {
  Type, Palette, Square, Circle, Diamond,
  Plus, Minus, Eye, EyeOff, Trash2, Copy
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
  isVisible: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Primary Blue', fill: '#2563eb', stroke: '#1d4ed8' },
  { name: 'Success Green', fill: '#10b981', stroke: '#059669' },
  { name: 'Warning Orange', fill: '#f59e0b', stroke: '#d97706' },
  { name: 'Error Red', fill: '#ef4444', stroke: '#dc2626' },
  { name: 'Purple', fill: '#8b5cf6', stroke: '#7c3aed' },
  { name: 'Cyan', fill: '#06b6d4', stroke: '#0891b2' },
  { name: 'Gray', fill: '#6b7280', stroke: '#4b5563' },
  { name: 'Dark', fill: '#1f2937', stroke: '#111827' }
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
      width: '320px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <GlassPanel variant="elevated" padding="4" style={{
        borderRadius: MermaidDesignTokens.borderRadius.xl,
        boxShadow: MermaidDesignTokens.shadows.glass.xl
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: MermaidDesignTokens.spacing[4],
          paddingBottom: MermaidDesignTokens.spacing[3],
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          <h3 style={{
            fontSize: MermaidDesignTokens.typography.fontSize.lg,
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
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
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
          <div style={{ marginTop: MermaidDesignTokens.spacing[3] }}>
            <label style={{
              display: 'block',
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary,
              marginBottom: MermaidDesignTokens.spacing[2]
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
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              marginTop: MermaidDesignTokens.spacing[1]
            }}>
              Description appears as smaller text below main text
            </div>
          </div>

          {/* Live Text Preview */}
          <div style={{
            marginTop: MermaidDesignTokens.spacing[3],
            padding: MermaidDesignTokens.spacing[3],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.md,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              marginBottom: MermaidDesignTokens.spacing[2]
            }}>
              Live Preview:
            </div>
            <div style={{
              color: localTextColor,
              background: localFillColor,
              border: `2px solid ${localStrokeColor}`,
              borderRadius: MermaidDesignTokens.borderRadius.md,
              padding: MermaidDesignTokens.spacing[2],
              minHeight: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: MermaidDesignTokens.spacing[1]
            }}>
              <div style={{
                fontSize: localDescription ? MermaidDesignTokens.typography.fontSize.sm : MermaidDesignTokens.typography.fontSize.base,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                lineHeight: 1.2
              }}>
                {localLabel || 'Main Text'}
              </div>
              {localDescription && (
                <div style={{
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  opacity: 0.8,
                  lineHeight: 1.1,
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}>
                  {localDescription}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shape Selection */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Shape
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            {SHAPE_OPTIONS.map((shape) => {
              const Icon = shape.icon;
              return (
                <GlassButton
                  key={shape.value}
                  variant={selectedNode.data.shape === shape.value ? 'primary' : 'ghost'}
                  size="sm"
                  icon={<Icon size={16} />}
                  onClick={() => handleUpdate('shape', shape.value)}
                  style={{ justifyContent: 'center' }}
                >
                  {shape.label}
                </GlassButton>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Color Presets
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorPreset(preset)}
                style={{
                  width: '40px',
                  height: '40px',
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
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Custom Colors
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            <div>
              <label style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xs,
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Fill Color
              </label>
              <input
                type="color"
                value={localFillColor}
                onChange={(e) => handleUpdate('fillColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xs,
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Border Color
              </label>
              <input
                type="color"
                value={localStrokeColor}
                onChange={(e) => handleUpdate('strokeColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xs,
                color: MermaidDesignTokens.colors.text.secondary,
                marginBottom: MermaidDesignTokens.spacing[1],
                display: 'block'
              }}>
                Text Color
              </label>
              <input
                type="color"
                value={localTextColor}
                onChange={(e) => handleUpdate('textColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Border Width */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
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

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: MermaidDesignTokens.spacing[2],
          paddingTop: MermaidDesignTokens.spacing[3],
          borderTop: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Copy size={16} />}
            onClick={() => onNodeDuplicate(selectedNode.id)}
            style={{ flex: 1 }}
          >
            Duplicate
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => onNodeDelete(selectedNode.id)}
            style={{ flex: 1, color: MermaidDesignTokens.colors.semantic.error[500] }}
          >
            Delete
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  );
};

export default NodePropertiesPanel;
