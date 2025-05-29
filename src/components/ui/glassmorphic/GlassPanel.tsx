/**
 * Glassmorphic Panel Component
 * Beautiful glass panel with backdrop blur and modern styling
 */
import React, { forwardRef } from 'react';
import { MermaidDesignTokens, MermaidComponentTokens } from '../design-system/MermaidDesignTokens';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'elevated';
  blur?: 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  shadow?: 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
  glow?: 'blue' | 'cyan' | 'purple' | 'success' | 'warning' | 'error' | false;
  padding?: keyof typeof MermaidDesignTokens.spacing;
  borderRadius?: keyof typeof MermaidDesignTokens.borderRadius;
  children?: React.ReactNode;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
  variant = 'primary',
  blur = 'xl',
  border = true,
  shadow = 'lg',
  glow = false,
  padding = '6',
  borderRadius = '2xl',
  className = '',
  style = {},
  children,
  ...props
}, ref) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return MermaidDesignTokens.colors.glass.secondary;
      case 'elevated':
        return MermaidDesignTokens.colors.glass.elevated;
      default:
        return MermaidDesignTokens.colors.glass.primary;
    }
  };

  const getBoxShadow = () => {
    const shadows = [];
    
    // Add glass shadow
    if (shadow) {
      shadows.push(MermaidDesignTokens.shadows.glass[shadow]);
    }
    
    // Add glow effect
    if (glow) {
      shadows.push(MermaidDesignTokens.shadows.glow[glow]);
    }
    
    return shadows.join(', ');
  };

  const panelStyle: React.CSSProperties = {
    background: getBackgroundColor(),
    backdropFilter: MermaidDesignTokens.backdropBlur[blur],
    WebkitBackdropFilter: MermaidDesignTokens.backdropBlur[blur], // Safari support
    border: border ? `1px solid ${MermaidDesignTokens.colors.glass.border}` : 'none',
    borderRadius: MermaidDesignTokens.borderRadius[borderRadius],
    padding: MermaidDesignTokens.spacing[padding],
    boxShadow: getBoxShadow(),
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  return (
    <div
      ref={ref}
      className={`glass-panel ${className}`}
      style={panelStyle}
      {...props}
    >
      {children}
    </div>
  );
});

GlassPanel.displayName = 'GlassPanel';

// Preset variants for common use cases
export const GlassCard = forwardRef<HTMLDivElement, Omit<GlassPanelProps, 'variant'>>(
  (props, ref) => <GlassPanel ref={ref} variant="primary" shadow="md" {...props} />
);

export const GlassModal = forwardRef<HTMLDivElement, Omit<GlassPanelProps, 'variant' | 'blur'>>(
  (props, ref) => <GlassPanel ref={ref} variant="elevated" blur="2xl" shadow="2xl" {...props} />
);

export const GlassTooltip = forwardRef<HTMLDivElement, Omit<GlassPanelProps, 'variant' | 'padding'>>(
  (props, ref) => <GlassPanel ref={ref} variant="secondary" padding="2" shadow="sm" {...props} />
);

GlassCard.displayName = 'GlassCard';
GlassModal.displayName = 'GlassModal';
GlassTooltip.displayName = 'GlassTooltip';
