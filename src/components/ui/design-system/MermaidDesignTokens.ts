/**
 * Mermaid Editor Design System
 * Clean white and blue professional theme
 */

export const MermaidDesignTokens = {
  // Color System - Clean White & Blue Professional Theme
  colors: {
    // Primary Colors - Professional Blue System
    primary: {
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#2563eb', // Main brand blue
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#172554',
      950: '#0f172a'
    },

    // Secondary Colors - Clean Blue Accents
    secondary: {
      gradient: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)',
      50: '#ffffff',
      100: '#f8fafc',
      200: '#f1f5f9',
      300: '#e2e8f0',
      400: '#cbd5e1',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // Accent Colors - Clean Blue System
    accent: {
      blue: '#2563eb',
      lightBlue: '#3b82f6',
      darkBlue: '#1d4ed8',
      success: '#10b981',
      warning: '#f59e0b',
      green: '#10b981',
      purple: '#8b5cf6'
    },

    // Glass Surface Colors - Clean White Glass
    glass: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      elevated: 'rgba(255, 255, 255, 0.95)',
      overlay: 'rgba(0, 0, 0, 0.1)',
      border: 'rgba(37, 99, 235, 0.15)',
      borderStrong: 'rgba(37, 99, 235, 0.25)'
    },

    // Text Colors - Professional Dark Text on Light Background
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff'
    },

    // Semantic Colors
    semantic: {
      success: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        glass: 'rgba(34, 197, 94, 0.1)'
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        glass: 'rgba(245, 158, 11, 0.1)'
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        glass: 'rgba(239, 68, 68, 0.1)'
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        glass: 'rgba(59, 130, 246, 0.1)'
      }
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", monospace',
      display: '"Cal Sans", "Inter", sans-serif'
    },

    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },

    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // Spacing System (8px grid)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem'      // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Glassmorphism Shadows
  shadows: {
    glass: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
    },
    glow: {
      blue: '0 0 20px rgba(59, 130, 246, 0.3)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
      purple: '0 0 20px rgba(139, 92, 246, 0.3)',
      success: '0 0 20px rgba(34, 197, 94, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)',
      error: '0 0 20px rgba(239, 68, 68, 0.3)'
    }
  },

  // Backdrop Blur
  backdropBlur: {
    none: 'blur(0)',
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)'
  },

  // Animation & Transitions
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
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

// Component-specific tokens
export const MermaidComponentTokens = {
  // Glass Panel System
  glassPanel: {
    background: MermaidDesignTokens.colors.glass.primary,
    backdropFilter: MermaidDesignTokens.backdropBlur.xl,
    border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    borderRadius: MermaidDesignTokens.borderRadius['2xl'],
    boxShadow: MermaidDesignTokens.shadows.glass.xl,
    padding: MermaidDesignTokens.spacing[6]
  },

  // Header System
  header: {
    height: '4rem', // 64px
    background: MermaidDesignTokens.colors.primary.gradient,
    backdropFilter: MermaidDesignTokens.backdropBlur.lg,
    borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    padding: `0 ${MermaidDesignTokens.spacing[6]}`,
    boxShadow: MermaidDesignTokens.shadows.glass.lg
  },

  // Sidebar System
  sidebar: {
    width: '18rem', // 288px
    background: MermaidDesignTokens.colors.glass.secondary,
    backdropFilter: MermaidDesignTokens.backdropBlur.xl,
    borderRight: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    padding: MermaidDesignTokens.spacing[4]
  },

  // Button System
  button: {
    height: {
      sm: '2rem',    // 32px
      base: '2.5rem', // 40px
      lg: '3rem'     // 48px
    },
    padding: {
      sm: `0 ${MermaidDesignTokens.spacing[3]}`,
      base: `0 ${MermaidDesignTokens.spacing[4]}`,
      lg: `0 ${MermaidDesignTokens.spacing[6]}`
    },
    borderRadius: MermaidDesignTokens.borderRadius.lg,
    fontSize: {
      sm: MermaidDesignTokens.typography.fontSize.sm,
      base: MermaidDesignTokens.typography.fontSize.base,
      lg: MermaidDesignTokens.typography.fontSize.lg
    },
    fontWeight: MermaidDesignTokens.typography.fontWeight.medium
  },

  // Input System
  input: {
    height: {
      sm: '2rem',
      base: '2.5rem',
      lg: '3rem'
    },
    padding: `0 ${MermaidDesignTokens.spacing[3]}`,
    borderRadius: MermaidDesignTokens.borderRadius.lg,
    fontSize: MermaidDesignTokens.typography.fontSize.sm,
    background: MermaidDesignTokens.colors.glass.primary,
    border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    backdropFilter: MermaidDesignTokens.backdropBlur.base
  },

  // Card System
  card: {
    background: MermaidDesignTokens.colors.glass.primary,
    backdropFilter: MermaidDesignTokens.backdropBlur.lg,
    border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    borderRadius: MermaidDesignTokens.borderRadius.xl,
    padding: MermaidDesignTokens.spacing[5],
    boxShadow: MermaidDesignTokens.shadows.glass.md
  }
};

export default MermaidDesignTokens;
