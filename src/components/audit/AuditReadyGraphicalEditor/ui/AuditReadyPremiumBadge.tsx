import React from 'react';

interface AuditReadyPremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'icon' | 'text';
  className?: string;
  style?: React.CSSProperties;
}

const AuditReadyPremiumBadge: React.FC<AuditReadyPremiumBadgeProps> = ({
  size = 'medium',
  variant = 'badge',
  className = '',
  style = {}
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 20,
          fontSize: 8,
          padding: '2px 6px',
          iconSize: 12
        };
      case 'large':
        return {
          containerSize: 32,
          fontSize: 12,
          padding: '6px 12px',
          iconSize: 20
        };
      case 'medium':
      default:
        return {
          containerSize: 24,
          fontSize: 10,
          padding: '4px 8px',
          iconSize: 16
        };
    }
  };

  const config = getSizeConfig();

  // AuditReady logo as SVG (simplified version)
  const AuditReadyIcon = () => (
    <svg
      width={config.iconSize}
      height={config.iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield shape representing security/audit */}
      <path
        d="M12 2L4 6V11C4 16.55 7.84 21.74 12 22C16.16 21.74 20 16.55 20 11V6L12 2Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Checkmark representing audit approval */}
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Premium star accent */}
      <circle
        cx="17"
        cy="7"
        r="2"
        fill="#FFD700"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );

  // Premium gradient background
  const premiumGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const premiumGradientGold = 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)';

  if (variant === 'icon') {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.containerSize,
          height: config.containerSize,
          borderRadius: '50%',
          background: premiumGradient,
          color: 'white',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          ...style
        }}
      >
        <AuditReadyIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: config.fontSize,
          fontWeight: '600',
          color: '#667eea',
          ...style
        }}
      >
        <AuditReadyIcon />
        AuditReady Premium
      </span>
    );
  }

  // Default badge variant
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: config.padding,
        borderRadius: '6px',
        background: premiumGradientGold,
        color: '#1a1a1a',
        fontSize: config.fontSize,
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(247, 151, 30, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...style
      }}
    >
      <AuditReadyIcon />
      <span>Premium</span>
    </div>
  );
};

export default AuditReadyPremiumBadge;
