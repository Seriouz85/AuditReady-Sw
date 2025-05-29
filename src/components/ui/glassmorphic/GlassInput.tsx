/**
 * Glassmorphic Input Component
 * Beautiful glass input with focus effects and validation states
 */
import React, { forwardRef, useState } from 'react';
import { MermaidDesignTokens, MermaidComponentTokens } from '../design-system/MermaidDesignTokens';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  success,
  hint,
  size = 'base',
  variant = 'default',
  icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  className = '',
  style = {},
  value,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = Boolean(currentValue);
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const getVariantStyles = () => {
    const baseStyles = {
      background: MermaidDesignTokens.colors.glass.primary,
      backdropFilter: MermaidDesignTokens.backdropBlur.base,
      WebkitBackdropFilter: MermaidDesignTokens.backdropBlur.base,
      border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          background: MermaidDesignTokens.colors.glass.secondary
        };
      
      case 'minimal':
        return {
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          border: 'none',
          borderBottom: `2px solid ${MermaidDesignTokens.colors.glass.border}`
        };
      
      default:
        return baseStyles;
    }
  };

  const getBorderColor = () => {
    if (hasError) return MermaidDesignTokens.colors.semantic.error[500];
    if (hasSuccess) return MermaidDesignTokens.colors.semantic.success[500];
    if (isFocused) return MermaidDesignTokens.colors.accent.blue;
    return MermaidDesignTokens.colors.glass.border;
  };

  const getGlowEffect = () => {
    if (hasError) return MermaidDesignTokens.shadows.glow.error;
    if (hasSuccess) return MermaidDesignTokens.shadows.glow.success;
    if (isFocused) return MermaidDesignTokens.shadows.glow.blue;
    return 'none';
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%'
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle: React.CSSProperties = {
    ...getVariantStyles(),
    ...MermaidComponentTokens.input,
    height: MermaidComponentTokens.input.height[size],
    borderColor: getBorderColor(),
    boxShadow: `${MermaidDesignTokens.shadows.glass.sm}, ${getGlowEffect()}`,
    color: MermaidDesignTokens.colors.text.primary,
    fontFamily: MermaidDesignTokens.typography.fontFamily.sans,
    fontSize: MermaidComponentTokens.input.fontSize,
    transition: `all ${MermaidDesignTokens.animation.duration[200]} ${MermaidDesignTokens.animation.easing.inOut}`,
    outline: 'none',
    width: '100%',
    paddingLeft: icon && iconPosition === 'left' ? MermaidDesignTokens.spacing[10] : MermaidDesignTokens.spacing[3],
    paddingRight: (icon && iconPosition === 'right') || clearable ? MermaidDesignTokens.spacing[10] : MermaidDesignTokens.spacing[3],
    ...style
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: MermaidDesignTokens.spacing[2],
    fontSize: MermaidDesignTokens.typography.fontSize.sm,
    fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
    color: hasError 
      ? MermaidDesignTokens.colors.semantic.error[500]
      : MermaidDesignTokens.colors.text.secondary
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition === 'left' ? 'left' : 'right']: MermaidDesignTokens.spacing[3],
    color: MermaidDesignTokens.colors.text.tertiary,
    pointerEvents: 'none',
    zIndex: 1
  };

  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: MermaidDesignTokens.spacing[3],
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: MermaidDesignTokens.colors.text.tertiary,
    cursor: 'pointer',
    padding: MermaidDesignTokens.spacing[1],
    borderRadius: MermaidDesignTokens.borderRadius.base,
    transition: `color ${MermaidDesignTokens.animation.duration[150]} ${MermaidDesignTokens.animation.easing.inOut}`,
    zIndex: 1
  };

  const messageStyle: React.CSSProperties = {
    marginTop: MermaidDesignTokens.spacing[1],
    fontSize: MermaidDesignTokens.typography.fontSize.xs,
    color: hasError 
      ? MermaidDesignTokens.colors.semantic.error[500]
      : hasSuccess
      ? MermaidDesignTokens.colors.semantic.success[500]
      : MermaidDesignTokens.colors.text.tertiary
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(e);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    onClear?.();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
        </label>
      )}
      
      <div style={inputWrapperStyle}>
        {icon && iconPosition === 'left' && (
          <div style={iconStyle}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`glass-input ${className}`}
          style={inputStyle}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {icon && iconPosition === 'right' && !clearable && (
          <div style={iconStyle}>
            {icon}
          </div>
        )}
        
        {clearable && hasValue && (
          <button
            type="button"
            style={clearButtonStyle}
            onClick={handleClear}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = MermaidDesignTokens.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = MermaidDesignTokens.colors.text.tertiary;
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {(error || success || hint) && (
        <div style={messageStyle}>
          {error || success || hint}
        </div>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

// Preset input variants
export const SearchGlassInput = forwardRef<HTMLInputElement, Omit<GlassInputProps, 'icon' | 'type'>>(
  (props, ref) => (
    <GlassInput
      ref={ref}
      type="search"
      icon={<span>🔍</span>}
      iconPosition="left"
      clearable
      {...props}
    />
  )
);

export const PasswordGlassInput = forwardRef<HTMLInputElement, Omit<GlassInputProps, 'type'>>(
  (props, ref) => <GlassInput ref={ref} type="password" {...props} />
);

SearchGlassInput.displayName = 'SearchGlassInput';
PasswordGlassInput.displayName = 'PasswordGlassInput';
