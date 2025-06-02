/**
 * Background Color Picker - Minimalistic floating window for canvas background colors
 * Provides color options, gradients, and custom color input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Zap, Hash } from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  MermaidDesignTokens
} from '../ui';
import { gradientPresets } from '../../utils/colorUtils';

interface BackgroundColorPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  currentColor: string;
  triggerButtonRef?: React.RefObject<HTMLElement>;
  onAutoAdjustChange?: (enabled: boolean) => void;
  autoAdjustEnabled?: boolean;
}

const PRESET_COLORS = [
  { name: 'Default', value: '#f8fafc', type: 'solid' },
  { name: 'White', value: '#ffffff', type: 'solid' },
  { name: 'Light Gray', value: '#f1f5f9', type: 'solid' },
  { name: 'Blue Light', value: '#eff6ff', type: 'solid' },
  { name: 'Green Light', value: '#f0fdf4', type: 'solid' },
  { name: 'Purple Light', value: '#faf5ff', type: 'solid' },
  { name: 'Yellow Light', value: '#fefce8', type: 'solid' },
  { name: 'Pink Light', value: '#fdf2f8', type: 'solid' }
];

// Use enhanced gradient presets from colorUtils
const PRESET_GRADIENTS = gradientPresets;

export const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  isVisible,
  onClose,
  onColorChange,
  currentColor,
  triggerButtonRef,
  onAutoAdjustChange,
  autoAdjustEnabled = false
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'gradients' | 'custom'>('colors');
  const [customColor, setCustomColor] = useState('#f8fafc');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to trigger button
  useEffect(() => {
    if (isVisible && triggerButtonRef?.current) {
      const triggerRect = triggerButtonRef.current.getBoundingClientRect();
      const panelHeight = 320; // Estimated panel height
      const panelWidth = 280;

      // Position below the trigger button
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left - (panelWidth / 2) + (triggerRect.width / 2);

      // Adjust if panel would go off screen
      if (left < 16) left = 16;
      if (left + panelWidth > window.innerWidth - 16) {
        left = window.innerWidth - panelWidth - 16;
      }
      if (top + panelHeight > window.innerHeight - 16) {
        top = triggerRect.top - panelHeight - 8;
      }

      setPosition({ top, left });
    }
  }, [isVisible, triggerButtonRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  const handleCustomColorApply = () => {
    onColorChange(customColor);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
        width: '280px'
      }}
    >
      <GlassPanel variant="elevated" padding={0} style={{
        borderRadius: MermaidDesignTokens.borderRadius.xl,
        overflow: 'hidden',
        boxShadow: MermaidDesignTokens.shadows.glass.xl
      }}>
        {/* Header with tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'gradients', label: 'Gradients', icon: Zap },
            { id: 'custom', label: 'Custom', icon: Hash }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: MermaidDesignTokens.spacing[3],
                  background: activeTab === tab.id
                    ? MermaidDesignTokens.colors.glass.secondary
                    : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id
                    ? `2px solid ${MermaidDesignTokens.colors.accent.blue}`
                    : '2px solid transparent',
                  color: activeTab === tab.id
                    ? MermaidDesignTokens.colors.text.primary
                    : MermaidDesignTokens.colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: MermaidDesignTokens.spacing[1],
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: MermaidDesignTokens.spacing[4] }}>
          {/* Auto-Adjust Toggle */}
          <div style={{
            marginBottom: MermaidDesignTokens.spacing[4],
            padding: MermaidDesignTokens.spacing[3],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.md,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: MermaidDesignTokens.spacing[2],
              cursor: 'pointer',
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              <input
                type="checkbox"
                checked={autoAdjustEnabled}
                onChange={(e) => onAutoAdjustChange?.(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: MermaidDesignTokens.colors.accent.blue
                }}
              />
              Auto-adjust content colors
            </label>
            <p style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              margin: `${MermaidDesignTokens.spacing[1]} 0 0 ${MermaidDesignTokens.spacing[5]}`
            }}>
              Automatically adapt shapes, text, and connectors for optimal visibility
            </p>
          </div>

          {activeTab === 'colors' && (
            <div>
              <h4 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                color: MermaidDesignTokens.colors.text.primary,
                margin: `0 0 ${MermaidDesignTokens.spacing[3]} 0`
              }}>
                Solid Colors
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: MermaidDesignTokens.spacing[2]
              }}>
                {PRESET_COLORS.map((color) => (
                  <div
                    key={color.name}
                    onClick={() => handleColorSelect(color.value)}
                    style={{
                      width: '48px',
                      height: '48px',
                      background: color.value,
                      border: currentColor === color.value
                        ? `3px solid ${MermaidDesignTokens.colors.accent.blue}`
                        : `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                      borderRadius: MermaidDesignTokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    title={color.name}
                  >
                    {currentColor === color.value && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '16px',
                        background: MermaidDesignTokens.colors.accent.blue,
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gradients' && (
            <div>
              <h4 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                color: MermaidDesignTokens.colors.text.primary,
                margin: `0 0 ${MermaidDesignTokens.spacing[3]} 0`
              }}>
                Gradient Backgrounds
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: MermaidDesignTokens.spacing[2]
              }}>
                {PRESET_GRADIENTS.map((gradient) => (
                  <div
                    key={gradient.name}
                    onClick={() => handleColorSelect(gradient.value)}
                    style={{
                      height: '60px',
                      background: gradient.value,
                      border: currentColor === gradient.value
                        ? `3px solid ${MermaidDesignTokens.colors.accent.blue}`
                        : `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                      borderRadius: MermaidDesignTokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={`${gradient.name} - ${gradient.category}`}
                  >
                    <span style={{
                      fontSize: MermaidDesignTokens.typography.fontSize.xs,
                      fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      textAlign: 'center'
                    }}>
                      {gradient.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              <h4 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                color: MermaidDesignTokens.colors.text.primary,
                margin: `0 0 ${MermaidDesignTokens.spacing[3]} 0`
              }}>
                Custom Color
              </h4>

              <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
                <label style={{
                  display: 'block',
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  color: MermaidDesignTokens.colors.text.secondary,
                  marginBottom: MermaidDesignTokens.spacing[2]
                }}>
                  Color Picker
                </label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                    borderRadius: MermaidDesignTokens.borderRadius.md,
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                />
              </div>

              <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
                <label style={{
                  display: 'block',
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  color: MermaidDesignTokens.colors.text.secondary,
                  marginBottom: MermaidDesignTokens.spacing[1]
                }}>
                  Hex Color Code
                </label>
                <GlassInput
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#f8fafc"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{
                width: '100%',
                height: '60px',
                background: customColor,
                border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                borderRadius: MermaidDesignTokens.borderRadius.md,
                marginBottom: MermaidDesignTokens.spacing[3]
              }} />

              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleCustomColorApply}
                style={{ width: '100%' }}
              >
                Apply Custom Color
              </GlassButton>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default BackgroundColorPicker;
