/**
 * Glassmorphic Button Component
 * Beautiful glass button with hover effects and animations
 */
import React, { forwardRef } from 'react';
import { MermaidDesignTokens, MermaidComponentTokens } from '../design-system/MermaidDesignTokens';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'base' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(({
  variant = 'primary',
  size = 'base',
  glow = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  style = {},
  disabled,
  children,
  ...props
}, ref) => {
  const getVariantStyles = () => {
    const baseStyles = {
      background: MermaidDesignTokens.colors.glass.primary,
      backdropFilter: MermaidDesignTokens.backdropBlur.base,
      WebkitBackdropFilter: MermaidDesignTokens.backdropBlur.base,
      border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
      color: MermaidDesignTokens.colors.text.primary
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: MermaidDesignTokens.colors.primary.gradient,
          border: `1px solid ${MermaidDesignTokens.colors.primary[600]}`,
          boxShadow: glow ? MermaidDesignTokens.shadows.glow.blue : MermaidDesignTokens.shadows.glass.base
        };
      
      case 'secondary':
        return {
          ...baseStyles,
          background: MermaidDesignTokens.colors.glass.secondary,
          border: `1px solid ${MermaidDesignTokens.colors.glass.borderStrong}`
        };
      
      case 'ghost':
        return {
          ...baseStyles,
          background: 'transparent',
          border: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none'
        };
      
      case 'danger':
        return {
          ...baseStyles,
          background: MermaidDesignTokens.colors.semantic.error.glass,
          border: `1px solid ${MermaidDesignTokens.colors.semantic.error[500]}`,
          color: MermaidDesignTokens.colors.semantic.error[500],
          boxShadow: glow ? MermaidDesignTokens.shadows.glow.error : MermaidDesignTokens.shadows.glass.base
        };
      
      case 'success':
        return {
          ...baseStyles,
          background: MermaidDesignTokens.colors.semantic.success.glass,
          border: `1px solid ${MermaidDesignTokens.colors.semantic.success[500]}`,
          color: MermaidDesignTokens.colors.semantic.success[500],
          boxShadow: glow ? MermaidDesignTokens.shadows.glow.success : MermaidDesignTokens.shadows.glass.base
        };
      
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    return {
      height: MermaidComponentTokens.button.height[size],
      padding: MermaidComponentTokens.button.padding[size],
      fontSize: MermaidComponentTokens.button.fontSize[size],
      fontWeight: MermaidComponentTokens.button.fontWeight
    };
  };

  const buttonStyle: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: MermaidComponentTokens.button.borderRadius,
    fontFamily: MermaidDesignTokens.typography.fontFamily.sans,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${MermaidDesignTokens.animation.duration[200]} ${MermaidDesignTokens.animation.easing.inOut}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MermaidDesignTokens.spacing[2],
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = variant === 'primary' && glow 
        ? `${MermaidDesignTokens.shadows.glow.blue}, ${MermaidDesignTokens.shadows.glass.lg}`
        : MermaidDesignTokens.shadows.glass.lg;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = getVariantStyles().boxShadow || MermaidDesignTokens.shadows.glass.base;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
    }
  };

  const LoadingSpinner = () => (
    <div
      style={{
        width: '1rem',
        height: '1rem',
        border: `2px solid ${MermaidDesignTokens.colors.text.tertiary}`,
        borderTop: `2px solid ${MermaidDesignTokens.colors.text.primary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .glass-button:focus-visible {
            outline: 2px solid ${MermaidDesignTokens.colors.accent.blue};
            outline-offset: 2px;
          }
        `}
      </style>
      <button
        ref={ref}
        className={`glass-button ${className}`}
        style={buttonStyle}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && icon}
        {!loading && children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    </>
  );
});

GlassButton.displayName = 'GlassButton';

// Preset button variants
export const PrimaryGlassButton = forwardRef<HTMLButtonElement, Omit<GlassButtonProps, 'variant'>>(
  (props, ref) => <GlassButton ref={ref} variant="primary" glow {...props} />
);

export const SecondaryGlassButton = forwardRef<HTMLButtonElement, Omit<GlassButtonProps, 'variant'>>(
  (props, ref) => <GlassButton ref={ref} variant="secondary" {...props} />
);

export const DangerGlassButton = forwardRef<HTMLButtonElement, Omit<GlassButtonProps, 'variant'>>(
  (props, ref) => <GlassButton ref={ref} variant="danger" {...props} />
);

export const SuccessGlassButton = forwardRef<HTMLButtonElement, Omit<GlassButtonProps, 'variant'>>(
  (props, ref) => <GlassButton ref={ref} variant="success" {...props} />
);

PrimaryGlassButton.displayName = 'PrimaryGlassButton';
SecondaryGlassButton.displayName = 'SecondaryGlassButton';
DangerGlassButton.displayName = 'DangerGlassButton';
SuccessGlassButton.displayName = 'SuccessGlassButton';
