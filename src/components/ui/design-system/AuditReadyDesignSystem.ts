/**
 * AuditReady Editor - Professional Design System
 * Light, clean, trustworthy themes for cybersecurity professionals
 */

export const AuditReadyThemes = {
  // PRIMARY PROFESSIONAL THEMES
  'Executive Clean': {
    name: 'Executive Clean',
    description: 'Clean, trustworthy design for executive presentations',
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    colors: {
      primary: '#ffffff',         // Pure white background
      secondary: '#f8fafc',       // Light gray background
      tertiary: '#f1f5f9',        // Subtle blue-gray
      accent: '#3b82f6',          // Professional blue
      accentSecondary: '#60a5fa', // Lighter blue
      success: '#10b981',         // Trust green
      warning: '#f59e0b',         // Attention amber
      danger: '#ef4444',          // Clear red
      text: {
        primary: '#1e293b',       // Dark readable text
        secondary: '#64748b',     // Medium gray
        muted: '#94a3b8'          // Light gray
      },
      border: '#e2e8f0',          // Subtle borders
      shadow: 'rgba(0, 0, 0, 0.08)' // Soft shadows
    },
    canvas: {
      background: '#fefefe',      // Warm white canvas
      grid: '#f1f5f9',           // Subtle grid
      guides: '#3b82f6'          // Blue guides
    }
  },

  'Audit Professional': {
    name: 'Audit Professional', 
    description: 'Professional blue theme for audit documentation',
    preview: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
    colors: {
      primary: '#ffffff',
      secondary: '#eff6ff',       // Light blue tint
      tertiary: '#dbeafe',        // Soft blue
      accent: '#1e40af',          // Deep professional blue
      accentSecondary: '#3b82f6', // Standard blue
      success: '#059669',         // Compliance green
      warning: '#d97706',         // Professional orange
      danger: '#dc2626',          // Alert red
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
      },
      border: '#cbd5e1',
      shadow: 'rgba(30, 64, 175, 0.1)'
    },
    canvas: {
      background: '#ffffff',
      grid: '#eff6ff',
      guides: '#1e40af'
    }
  },

  'Trust & Security': {
    name: 'Trust & Security',
    description: 'Conveying security and trustworthiness',
    preview: 'linear-gradient(135deg, #f0f9ff 0%, #0369a1 100%)',
    colors: {
      primary: '#ffffff',
      secondary: '#f0f9ff',       // Very light blue
      tertiary: '#e0f2fe',        // Soft cyan
      accent: '#0369a1',          // Security blue
      accentSecondary: '#0284c7', // Cyan blue
      success: '#047857',         // Deep green
      warning: '#ca8a04',         // Golden warning
      danger: '#b91c1c',          // Strong red
      text: {
        primary: '#0f172a',
        secondary: '#334155',
        muted: '#64748b'
      },
      border: '#cbd5e1',
      shadow: 'rgba(3, 105, 161, 0.12)'
    },
    canvas: {
      background: '#fefefe',
      grid: '#f0f9ff',
      guides: '#0369a1'
    }
  },

  'Compliance Fresh': {
    name: 'Compliance Fresh',
    description: 'Modern, fresh approach to compliance workflows',
    preview: 'linear-gradient(135deg, #f0fdf4 0%, #10b981 100%)',
    colors: {
      primary: '#ffffff',
      secondary: '#f0fdf4',       // Very light green
      tertiary: '#dcfce7',        // Soft green
      accent: '#059669',          // Compliance green
      accentSecondary: '#10b981', // Fresh green
      success: '#047857',         // Deep success
      warning: '#d97706',         // Amber warning
      danger: '#dc2626',          // Clear danger
      text: {
        primary: '#14532d',
        secondary: '#166534',
        muted: '#4b5563'
      },
      border: '#d1fae5',
      shadow: 'rgba(5, 150, 105, 0.1)'
    },
    canvas: {
      background: '#fefefe',
      grid: '#f0fdf4',
      guides: '#059669'
    }
  }
};

export const ModernTypography = {
  fontFamily: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace"
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

export const ModernSpacing = {
  // Consistent 8px base unit system
  space: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  }
};

export const ModernAnimations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  transitions: {
    colors: 'color 150ms ease, background-color 150ms ease, border-color 150ms ease',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms ease',
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Component-specific design tokens
export const ComponentTokens = {
  button: {
    height: {
      sm: '2rem',      // 32px
      base: '2.5rem',  // 40px
      lg: '3rem'       // 48px
    },
    padding: {
      sm: '0.5rem 1rem',     // 8px 16px
      base: '0.75rem 1.5rem', // 12px 24px
      lg: '1rem 2rem'        // 16px 32px
    }
  },
  panel: {
    width: {
      sidebar: '320px',
      sidebarExpanded: '420px',
      properties: '280px'
    },
    shadow: {
      light: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
      large: '0 10px 15px rgba(0, 0, 0, 0.08)'
    }
  },
  canvas: {
    minHeight: 'calc(100vh - 4rem)',
    padding: '2rem',
    grid: {
      size: '20px',
      opacity: 0.4
    }
  }
};

// Export the default theme
export const defaultTheme = AuditReadyThemes['Executive Clean'];

// Helper functions
export const getThemeColors = (themeName: keyof typeof AuditReadyThemes) => {
  return AuditReadyThemes[themeName]?.colors || defaultTheme.colors;
};

export const getCanvasStyle = (themeName: keyof typeof AuditReadyThemes) => {
  return AuditReadyThemes[themeName]?.canvas || defaultTheme.canvas;
};