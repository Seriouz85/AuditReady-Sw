// Modern Design System for AuditReady Editor
// Inspired by Figma, Linear, and modern design tools

export const DesignTokens = {
  // Color System - Professional & Modern
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },

    // Neutral Grays - Sophisticated
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    },

    // Semantic Colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },

    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },

    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },

    // Surface Colors
    surface: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.6)'
    },

    // Border Colors
    border: {
      light: '#f5f5f5',
      default: '#e5e5e5',
      medium: '#d4d4d4',
      strong: '#a3a3a3'
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
    },

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  // Spacing System (8px grid)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px'
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px'
  },

  // Shadows - Subtle and Professional
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Component-specific design tokens
export const ComponentTokens = {
  // Button System
  button: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px'
    },
    padding: {
      sm: '0 12px',
      base: '0 16px',
      lg: '0 24px'
    },
    borderRadius: '6px',
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px'
    }
  },

  // Input System
  input: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px'
    },
    padding: '0 12px',
    borderRadius: '6px',
    fontSize: '14px',
    borderWidth: '1px'
  },

  // Panel System
  panel: {
    borderRadius: '16px',
    padding: '24px',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    backdropBlur: 'blur(20px)'
  },

  // Card System
  card: {
    borderRadius: '12px',
    padding: '20px',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f5f5f5'
  },

  // Header System
  header: {
    height: '64px',
    padding: '0 24px',
    borderBottom: '1px solid #f5f5f5',
    backdropBlur: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.8)'
  },

  // Sidebar System
  sidebar: {
    width: '280px',
    padding: '16px',
    borderRight: '1px solid #f5f5f5',
    background: '#fafafa'
  }
};

// Utility functions for design tokens
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = DesignTokens.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color token not found: ${path}`);
      return DesignTokens.colors.neutral[500];
    }
  }

  return value;
};

export const getSpacing = (size: keyof typeof DesignTokens.spacing): string => {
  return DesignTokens.spacing[size];
};

export const getShadow = (size: keyof typeof DesignTokens.shadows): string => {
  return DesignTokens.shadows[size];
};

export const getBorderRadius = (size: keyof typeof DesignTokens.borderRadius): string => {
  return DesignTokens.borderRadius[size];
};

// Theme variants
export const ThemeVariants = {
  light: {
    background: DesignTokens.colors.neutral[0],
    surface: DesignTokens.colors.surface.primary,
    text: {
      primary: DesignTokens.colors.neutral[900],
      secondary: DesignTokens.colors.neutral[600],
      tertiary: DesignTokens.colors.neutral[500]
    },
    border: DesignTokens.colors.border.default
  },

  dark: {
    background: DesignTokens.colors.neutral[950],
    surface: DesignTokens.colors.neutral[900],
    text: {
      primary: DesignTokens.colors.neutral[50],
      secondary: DesignTokens.colors.neutral[300],
      tertiary: DesignTokens.colors.neutral[400]
    },
    border: DesignTokens.colors.neutral[800]
  }
};

// Professional color palettes for different use cases
export const ProfessionalPalettes = {
  audit: {
    primary: DesignTokens.colors.primary[600],
    secondary: DesignTokens.colors.neutral[600],
    success: DesignTokens.colors.success[600],
    warning: DesignTokens.colors.warning[600],
    error: DesignTokens.colors.error[600]
  },

  risk: {
    low: DesignTokens.colors.success[500],
    medium: DesignTokens.colors.warning[500],
    high: DesignTokens.colors.error[500],
    critical: DesignTokens.colors.error[700]
  },

  compliance: {
    compliant: DesignTokens.colors.success[600],
    partial: DesignTokens.colors.warning[600],
    nonCompliant: DesignTokens.colors.error[600],
    notApplicable: DesignTokens.colors.neutral[400]
  }
};

export default DesignTokens;
