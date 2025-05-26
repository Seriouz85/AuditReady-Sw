import React from 'react';
import { DesignTokens, ComponentTokens, getColor, getSpacing, getShadow, getBorderRadius } from './DesignTokens';

// Modern Button Component
interface ModernButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'base',
  children,
  onClick,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: getColor('primary.600'),
          color: getColor('neutral.0'),
          border: 'none',
          boxShadow: getShadow('sm'),
          '&:hover': {
            backgroundColor: getColor('primary.700'),
            boxShadow: getShadow('md')
          },
          '&:active': {
            backgroundColor: getColor('primary.800'),
            transform: 'translateY(1px)'
          }
        };
      case 'secondary':
        return {
          backgroundColor: getColor('neutral.0'),
          color: getColor('neutral.700'),
          border: `1px solid ${getColor('border.default')}`,
          boxShadow: getShadow('xs'),
          '&:hover': {
            backgroundColor: getColor('neutral.50'),
            borderColor: getColor('border.medium'),
            boxShadow: getShadow('sm')
          }
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: getColor('neutral.600'),
          border: 'none',
          '&:hover': {
            backgroundColor: getColor('neutral.100'),
            color: getColor('neutral.700')
          }
        };
      case 'danger':
        return {
          backgroundColor: getColor('error.600'),
          color: getColor('neutral.0'),
          border: 'none',
          boxShadow: getShadow('sm'),
          '&:hover': {
            backgroundColor: getColor('error.700')
          }
        };
      default:
        return {};
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(2),
    height: ComponentTokens.button.height[size],
    padding: ComponentTokens.button.padding[size],
    fontSize: ComponentTokens.button.fontSize[size],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    fontFamily: DesignTokens.typography.fontFamily.sans,
    borderRadius: ComponentTokens.button.borderRadius,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${DesignTokens.animation.duration.normal} ${DesignTokens.animation.easing.default}`,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...getVariantStyles()
  };

  return (
    <button
      style={baseStyles}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

// Modern Input Component
interface ModernInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  fullWidth?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  icon,
  size = 'base',
  fullWidth = false
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: getSpacing(1),
    width: fullWidth ? '100%' : 'auto'
  };

  const inputContainerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: ComponentTokens.input.height[size],
    padding: icon ? `0 ${getSpacing(3)} 0 ${getSpacing(10)}` : ComponentTokens.input.padding,
    fontSize: ComponentTokens.input.fontSize,
    fontFamily: DesignTokens.typography.fontFamily.sans,
    border: `${ComponentTokens.input.borderWidth} solid ${error ? getColor('error.500') : getColor('border.default')}`,
    borderRadius: ComponentTokens.input.borderRadius,
    backgroundColor: disabled ? getColor('neutral.100') : getColor('neutral.0'),
    color: getColor('neutral.900'),
    outline: 'none',
    transition: `all ${DesignTokens.animation.duration.normal} ${DesignTokens.animation.easing.default}`,
    '&:focus': {
      borderColor: getColor('primary.500'),
      boxShadow: `0 0 0 3px ${getColor('primary.100')}`
    }
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    left: getSpacing(3),
    color: getColor('neutral.400'),
    pointerEvents: 'none',
    zIndex: 1
  };

  const labelStyles: React.CSSProperties = {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: getColor('neutral.700'),
    marginBottom: getSpacing(1)
  };

  const errorStyles: React.CSSProperties = {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: getColor('error.600'),
    marginTop: getSpacing(1)
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputContainerStyles}>
        {icon && <div style={iconStyles}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={inputStyles}
        />
      </div>
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

// Modern Card Component
interface ModernCardProps {
  children: React.ReactNode;
  padding?: keyof typeof DesignTokens.spacing;
  shadow?: keyof typeof DesignTokens.shadows;
  borderRadius?: keyof typeof DesignTokens.borderRadius;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  padding = '5',
  shadow = 'sm',
  borderRadius = 'lg',
  hover = false,
  className = '',
  onClick
}) => {
  const cardStyles: React.CSSProperties = {
    backgroundColor: getColor('surface.primary'),
    border: `1px solid ${getColor('border.light')}`,
    borderRadius: getBorderRadius(borderRadius),
    padding: getSpacing(padding),
    boxShadow: getShadow(shadow),
    transition: `all ${DesignTokens.animation.duration.normal} ${DesignTokens.animation.easing.default}`,
    cursor: onClick ? 'pointer' : 'default',
    ...(hover && {
      '&:hover': {
        boxShadow: getShadow('md'),
        transform: 'translateY(-2px)'
      }
    })
  };

  return (
    <div style={cardStyles} className={className} onClick={onClick}>
      {children}
    </div>
  );
};

// Modern Badge Component
interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'base';
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'base'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: getColor('primary.100'),
          color: getColor('primary.800')
        };
      case 'success':
        return {
          backgroundColor: getColor('success.50'),
          color: getColor('success.700')
        };
      case 'warning':
        return {
          backgroundColor: getColor('warning.50'),
          color: getColor('warning.700')
        };
      case 'error':
        return {
          backgroundColor: getColor('error.50'),
          color: getColor('error.700')
        };
      default:
        return {
          backgroundColor: getColor('neutral.100'),
          color: getColor('neutral.700')
        };
    }
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    fontSize: size === 'sm' ? DesignTokens.typography.fontSize.xs : DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    borderRadius: getBorderRadius('full'),
    ...getVariantStyles()
  };

  return <span style={badgeStyles}>{children}</span>;
};

// Modern Panel Component
interface ModernPanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  width?: string;
  maxHeight?: string;
  className?: string;
}

export const ModernPanel: React.FC<ModernPanelProps> = ({
  children,
  title,
  subtitle,
  onClose,
  width = '600px',
  maxHeight = '90vh',
  className = ''
}) => {
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: getColor('surface.overlay'),
    backdropFilter: ComponentTokens.panel.backdropBlur,
    zIndex: DesignTokens.zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getSpacing(4)
  };

  const panelStyles: React.CSSProperties = {
    backgroundColor: getColor('surface.primary'),
    borderRadius: ComponentTokens.panel.borderRadius,
    boxShadow: ComponentTokens.panel.shadow,
    width: width,
    maxHeight: maxHeight,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${getColor('border.light')}`
  };

  const headerStyles: React.CSSProperties = {
    padding: ComponentTokens.panel.padding,
    borderBottom: `1px solid ${getColor('border.light')}`,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: ComponentTokens.panel.padding
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={panelStyles} className={className} onClick={(e) => e.stopPropagation()}>
        {(title || onClose) && (
          <div style={headerStyles}>
            <div>
              {title && (
                <h2 style={{
                  margin: 0,
                  fontSize: DesignTokens.typography.fontSize['2xl'],
                  fontWeight: DesignTokens.typography.fontWeight.semibold,
                  color: getColor('neutral.900'),
                  lineHeight: DesignTokens.typography.lineHeight.tight
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: DesignTokens.typography.fontSize.sm,
                  color: getColor('neutral.600'),
                  lineHeight: DesignTokens.typography.lineHeight.normal
                }}>
                  {subtitle}
                </p>
              )}
            </div>
            {onClose && (
              <ModernButton variant="ghost" size="sm" onClick={onClose}>
                ×
              </ModernButton>
            )}
          </div>
        )}
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Modern Tooltip Component
interface ModernTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ModernTooltip: React.FC<ModernTooltipProps> = ({
  children,
  content,
  position = 'top'
}) => {
  const [visible, setVisible] = React.useState(false);

  const tooltipStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  };

  const tooltipContentStyles: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: getColor('neutral.900'),
    color: getColor('neutral.0'),
    padding: '6px 12px',
    borderRadius: getBorderRadius('base'),
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    whiteSpace: 'nowrap',
    zIndex: DesignTokens.zIndex.tooltip,
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: `all ${DesignTokens.animation.duration.fast} ${DesignTokens.animation.easing.default}`,
    ...(position === 'top' && {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '8px'
    }),
    ...(position === 'bottom' && {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px'
    }),
    ...(position === 'left' && {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '8px'
    }),
    ...(position === 'right' && {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '8px'
    })
  };

  return (
    <div
      style={tooltipStyles}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div style={tooltipContentStyles}>
        {content}
      </div>
    </div>
  );
};

// Modern Loading Spinner
interface ModernSpinnerProps {
  size?: 'sm' | 'base' | 'lg';
  color?: string;
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = 'base',
  color = getColor('primary.600')
}) => {
  const sizeMap = {
    sm: '16px',
    base: '24px',
    lg: '32px'
  };

  const spinnerStyles: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '2px solid transparent',
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return <div style={spinnerStyles} />;
};

// Add keyframe animation for spinner
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}
