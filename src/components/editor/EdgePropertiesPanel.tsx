/**
 * Edge Properties Panel - Visual editing for connections, arrows, lines
 * Provides comprehensive visual editing capabilities for edges
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Minus, Plus, Palette, Type, Trash2, Copy,
  RotateCcw, Lock, Unlock
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  MermaidDesignTokens
} from '../ui';

interface EdgePropertiesProps {
  selectedEdge: any;
  onEdgeUpdate: (edgeId: string, updates: any) => void;
  onEdgeDelete: (edgeId: string) => void;
  onEdgeDuplicate: (edgeId: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const ARROW_TYPES = [
  { value: 'arrowclosed', label: 'Arrow', icon: ArrowRight },
  { value: 'none', label: 'None', icon: Minus },
  { value: 'arrow', label: 'Open', icon: ArrowLeft },
  { value: 'circle', label: 'Circle', icon: ArrowUp }
];

const LINE_STYLES = [
  { value: 'straight', label: 'Straight' },
  { value: 'curved', label: 'Curved' },
  { value: 'step', label: 'Step' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' }
];

const COLOR_PRESETS = [
  { name: 'Blue', color: '#2563eb' },
  { name: 'Green', color: '#10b981' },
  { name: 'Orange', color: '#f59e0b' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Gray', color: '#6b7280' }
];

export const EdgePropertiesPanel: React.FC<EdgePropertiesProps> = ({
  selectedEdge,
  onEdgeUpdate,
  onEdgeDelete,
  onEdgeDuplicate,
  isVisible,
  onClose
}) => {
  const [localLabel, setLocalLabel] = useState(selectedEdge?.label || '');
  const [localColor, setLocalColor] = useState(selectedEdge?.style?.stroke || '#6b7280');
  const [localWidth, setLocalWidth] = useState(selectedEdge?.style?.strokeWidth || 2);
  const [localArrowType, setLocalArrowType] = useState(selectedEdge?.markerEnd?.type || 'arrowclosed');
  const [localLineStyle, setLocalLineStyle] = useState(() => {
    if (!selectedEdge?.style) return 'straight';
    const dashArray = selectedEdge.style.strokeDasharray;
    if (!dashArray || dashArray === 'none') {
      // Fixed: smoothstep creates straight lines, default creates curved lines
      return selectedEdge.type === 'smoothstep' ? 'straight' : 'curved';
    }
    if (dashArray === '5,5' || dashArray.includes('5')) return 'dashed';
    if (dashArray === '2,2' || dashArray.includes('2')) return 'dotted';
    return 'straight';
  });
  const [isLocked, setIsLocked] = useState(selectedEdge?.locked || false);

  // Update local state when selectedEdge changes
  useEffect(() => {
    if (selectedEdge) {
      setLocalLabel(selectedEdge.label || '');
      setLocalColor(selectedEdge.style?.stroke || '#6b7280');
      setLocalWidth(selectedEdge.style?.strokeWidth || 2);
      setLocalArrowType(selectedEdge.markerEnd?.type || 'arrowclosed');

      // Properly detect line style (corrected logic)
      const dashArray = selectedEdge.style?.strokeDasharray;
      if (!dashArray || dashArray === 'none') {
        if (selectedEdge.animated) {
          setLocalLineStyle('dynamic');
        } else if (selectedEdge.type === 'smoothstep') {
          setLocalLineStyle('straight');
        } else if (selectedEdge.type === 'step') {
          setLocalLineStyle('step');
        } else {
          setLocalLineStyle('curved');
        }
      } else if (dashArray === '5,5' || (typeof dashArray === 'string' && dashArray.includes('5'))) {
        setLocalLineStyle('dashed');
      } else if (dashArray === '2,2' || (typeof dashArray === 'string' && dashArray.includes('2'))) {
        setLocalLineStyle('dotted');
      } else {
        setLocalLineStyle('straight');
      }

      setIsLocked(selectedEdge.locked || false);
    }
  }, [selectedEdge]);

  const handleUpdate = useCallback((field: string, value: any) => {
    if (!selectedEdge) return;

    let updates: any = {};

    // Map field updates to ReactFlow edge format
    switch (field) {
      case 'label':
        updates.label = value;
        setLocalLabel(value);
        break;
      case 'color':
        updates.style = {
          ...selectedEdge.style,
          stroke: value
        };
        setLocalColor(value);
        break;
      case 'width':
        updates.style = {
          ...selectedEdge.style,
          strokeWidth: value
        };
        setLocalWidth(value);
        break;
      case 'arrowType':
        if (value === 'none') {
          updates.markerEnd = undefined;
        } else {
          updates.markerEnd = {
            type: value,
            color: localColor
          };
        }
        setLocalArrowType(value);
        break;
      case 'lineStyle':
        let styleUpdates: any = { ...selectedEdge.style };

        if (value === 'straight') {
          // Straight line - no dash array, use smoothstep for straight lines
          styleUpdates.strokeDasharray = undefined;
          updates.type = 'smoothstep'; // This creates straight lines in ReactFlow
          updates.animated = false; // Disable animation for straight lines
          updates.style = styleUpdates;
        } else if (value === 'curved') {
          // Curved line - no dash array, use default for curved lines
          styleUpdates.strokeDasharray = undefined;
          updates.type = 'default'; // This creates curved lines in ReactFlow
          updates.animated = false; // Disable animation for curved lines
          updates.style = styleUpdates;
        } else if (value === 'step') {
          // Step line - no dash array, use step
          styleUpdates.strokeDasharray = undefined;
          updates.type = 'step'; // Force step line
          updates.animated = false; // Disable animation for step lines
          updates.style = styleUpdates;
        } else if (value === 'dynamic') {
          // Dynamic/flowing line - animated bezier curve
          styleUpdates.strokeDasharray = undefined;
          updates.type = 'smoothstep'; // Use smooth step for dynamic flow
          updates.animated = true; // Enable animation
          updates.style = styleUpdates;
        } else if (value === 'dashed') {
          // Dashed line - keep current type, add dash array
          styleUpdates.strokeDasharray = '5,5';
          updates.animated = false; // Disable animation for dashed lines
          updates.style = styleUpdates;
        } else if (value === 'dotted') {
          // Dotted line - keep current type, add dash array
          styleUpdates.strokeDasharray = '2,2';
          updates.animated = false; // Disable animation for dotted lines
          updates.style = styleUpdates;
        }

        setLocalLineStyle(value);
        break;
      case 'locked':
        updates.locked = value;
        setIsLocked(value);
        break;
    }

    onEdgeUpdate(selectedEdge.id, updates);
  }, [selectedEdge, onEdgeUpdate, localColor]);

  const handleColorPreset = useCallback((color: string) => {
    handleUpdate('color', color);
  }, [handleUpdate]);

  if (!isVisible || !selectedEdge) {
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
            Connection Properties
          </h3>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Minus size={16} />}
            onClick={onClose}
          />
        </div>

        {/* Label */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Connection Label
          </label>
          <GlassInput
            value={localLabel}
            onChange={(e) => handleUpdate('label', e.target.value)}
            placeholder="Enter connection label..."
            icon={<Type size={16} />}
          />
        </div>

        {/* Arrow Type */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Arrow Type
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            {ARROW_TYPES.map((arrow) => {
              const Icon = arrow.icon;
              return (
                <GlassButton
                  key={arrow.value}
                  variant={localArrowType === arrow.value ? 'primary' : 'ghost'}
                  size="sm"
                  icon={<Icon size={16} />}
                  onClick={() => handleUpdate('arrowType', arrow.value)}
                  style={{ justifyContent: 'center', fontSize: MermaidDesignTokens.typography.fontSize.xs }}
                >
                  {arrow.label}
                </GlassButton>
              );
            })}
          </div>
        </div>

        {/* Line Style */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Line Style
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            {LINE_STYLES.map((style) => (
              <GlassButton
                key={style.value}
                variant={localLineStyle === style.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleUpdate('lineStyle', style.value)}
                style={{ justifyContent: 'center', fontSize: MermaidDesignTokens.typography.fontSize.xs }}
              >
                {style.label}
              </GlassButton>
            ))}
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
            Line Color
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: MermaidDesignTokens.spacing[2],
            marginBottom: MermaidDesignTokens.spacing[3]
          }}>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorPreset(preset.color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: MermaidDesignTokens.borderRadius.md,
                  background: preset.color,
                  border: localColor === preset.color ? `3px solid ${MermaidDesignTokens.colors.accent.blue}` : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                title={preset.name}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>

          {/* Custom Color */}
          <input
            type="color"
            value={localColor}
            onChange={(e) => handleUpdate('color', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              border: 'none',
              borderRadius: MermaidDesignTokens.borderRadius.md,
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Line Width */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary,
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            Line Width: {localWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={localWidth}
            onChange={(e) => handleUpdate('width', parseInt(e.target.value))}
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

        {/* Lock/Unlock */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <GlassButton
            variant={isLocked ? 'primary' : 'ghost'}
            size="sm"
            icon={isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            onClick={() => handleUpdate('locked', !isLocked)}
            style={{ width: '100%' }}
          >
            {isLocked ? 'Locked Position' : 'Unlock Position'}
          </GlassButton>
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
            onClick={() => onEdgeDuplicate(selectedEdge.id)}
            style={{ flex: 1 }}
          >
            Duplicate
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => onEdgeDelete(selectedEdge.id)}
            style={{ flex: 1, color: MermaidDesignTokens.colors.semantic.error[500] }}
          >
            Delete
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  );
};

export default EdgePropertiesPanel;
