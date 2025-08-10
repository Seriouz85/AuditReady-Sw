/**
 * Advanced Theme System for AR Editor
 * Multiple professional themes with dark mode, accessibility, and customization
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useDiagramStore } from '../../../stores/diagramStore';

// Theme interface
export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'high-contrast' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    node: {
      default: {
        fill: string;
        stroke: string;
        text: string;
      };
      selected: {
        fill: string;
        stroke: string;
        text: string;
      };
      hover: {
        fill: string;
        stroke: string;
        text: string;
      };
    };
    edge: {
      default: string;
      selected: string;
      hover: string;
      animated: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Predefined themes
export const themes: Record<string, Theme> = {
  'executive-light': {
    id: 'executive-light',
    name: 'Executive Light',
    description: 'Clean, professional light theme for business environments',
    category: 'light',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#3b82f6',
      background: '#fefefe',
      surface: '#ffffff',
      border: '#e2e8f0',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        disabled: '#94a3b8',
        inverse: '#ffffff'
      },
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      node: {
        default: {
          fill: '#f1f5f9',
          stroke: '#475569',
          text: '#1e293b'
        },
        selected: {
          fill: '#dbeafe',
          stroke: '#3b82f6',
          text: '#1e293b'
        },
        hover: {
          fill: '#e2e8f0',
          stroke: '#64748b',
          text: '#1e293b'
        }
      },
      edge: {
        default: '#64748b',
        selected: '#3b82f6',
        hover: '#475569',
        animated: '#10b981'
      }
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "JetBrains Mono", monospace'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    animations: {
      fast: '150ms ease-out',
      normal: '250ms ease-out',
      slow: '400ms ease-out'
    }
  },

  'executive-dark': {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'Sophisticated dark theme for reduced eye strain',
    category: 'dark',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#3b82f6',
      background: '#020617',
      surface: '#0f172a',
      border: '#334155',
      text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        disabled: '#64748b',
        inverse: '#0f172a'
      },
      semantic: {
        success: '#22c55e',
        warning: '#eab308',
        error: '#f87171',
        info: '#60a5fa'
      },
      node: {
        default: {
          fill: '#1e293b',
          stroke: '#475569',
          text: '#f1f5f9'
        },
        selected: {
          fill: '#1e40af',
          stroke: '#3b82f6',
          text: '#f1f5f9'
        },
        hover: {
          fill: '#334155',
          stroke: '#64748b',
          text: '#f1f5f9'
        }
      },
      edge: {
        default: '#64748b',
        selected: '#3b82f6',
        hover: '#94a3b8',
        animated: '#22c55e'
      }
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "JetBrains Mono", monospace'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    animations: {
      fast: '150ms ease-out',
      normal: '250ms ease-out',
      slow: '400ms ease-out'
    }
  },

  'cybersecurity-blue': {
    id: 'cybersecurity-blue',
    name: 'Cybersecurity Blue',
    description: 'Professional blue theme optimized for security diagrams',
    category: 'light',
    colors: {
      primary: '#f0f9ff',
      secondary: '#e0f2fe',
      accent: '#0284c7',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#0ea5e9',
      text: {
        primary: '#0c4a6e',
        secondary: '#0369a1',
        disabled: '#7dd3fc',
        inverse: '#ffffff'
      },
      semantic: {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7'
      },
      node: {
        default: {
          fill: '#e0f2fe',
          stroke: '#0284c7',
          text: '#0c4a6e'
        },
        selected: {
          fill: '#bae6fd',
          stroke: '#0369a1',
          text: '#0c4a6e'
        },
        hover: {
          fill: '#f0f9ff',
          stroke: '#0ea5e9',
          text: '#0c4a6e'
        }
      },
      edge: {
        default: '#0284c7',
        selected: '#0369a1',
        hover: '#0ea5e9',
        animated: '#059669'
      }
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(2, 132, 199, 0.1)',
      md: '0 4px 6px -1px rgba(2, 132, 199, 0.15)',
      lg: '0 10px 15px -3px rgba(2, 132, 199, 0.2)',
      xl: '0 25px 50px -12px rgba(2, 132, 199, 0.3)'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "JetBrains Mono", monospace'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    animations: {
      fast: '150ms ease-out',
      normal: '250ms ease-out',
      slow: '400ms ease-out'
    }
  },

  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'High contrast theme for accessibility compliance',
    category: 'high-contrast',
    colors: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      accent: '#000000',
      background: '#ffffff',
      surface: '#ffffff',
      border: '#000000',
      text: {
        primary: '#000000',
        secondary: '#333333',
        disabled: '#666666',
        inverse: '#ffffff'
      },
      semantic: {
        success: '#006600',
        warning: '#cc6600',
        error: '#cc0000',
        info: '#0066cc'
      },
      node: {
        default: {
          fill: '#ffffff',
          stroke: '#000000',
          text: '#000000'
        },
        selected: {
          fill: '#000000',
          stroke: '#000000',
          text: '#ffffff'
        },
        hover: {
          fill: '#f5f5f5',
          stroke: '#000000',
          text: '#000000'
        }
      },
      edge: {
        default: '#000000',
        selected: '#000000',
        hover: '#333333',
        animated: '#006600'
      }
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
    },
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "JetBrains Mono", monospace'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    animations: {
      fast: '0ms',
      normal: '0ms',
      slow: '0ms'
    }
  },

  'nature-green': {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Calming green theme inspired by nature',
    category: 'light',
    colors: {
      primary: '#f0fdf4',
      secondary: '#dcfce7',
      accent: '#16a34a',
      background: '#f9fafb',
      surface: '#ffffff',
      border: '#22c55e',
      text: {
        primary: '#14532d',
        secondary: '#166534',
        disabled: '#86efac',
        inverse: '#ffffff'
      },
      semantic: {
        success: '#16a34a',
        warning: '#eab308',
        error: '#dc2626',
        info: '#3b82f6'
      },
      node: {
        default: {
          fill: '#dcfce7',
          stroke: '#16a34a',
          text: '#14532d'
        },
        selected: {
          fill: '#bbf7d0',
          stroke: '#15803d',
          text: '#14532d'
        },
        hover: {
          fill: '#f0fdf4',
          stroke: '#22c55e',
          text: '#14532d'
        }
      },
      edge: {
        default: '#16a34a',
        selected: '#15803d',
        hover: '#22c55e',
        animated: '#3b82f6'
      }
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(22, 163, 74, 0.1)',
      md: '0 4px 6px -1px rgba(22, 163, 74, 0.15)',
      lg: '0 10px 15px -3px rgba(22, 163, 74, 0.2)',
      xl: '0 25px 50px -12px rgba(22, 163, 74, 0.3)'
    },
    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "JetBrains Mono", monospace'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    animations: {
      fast: '150ms ease-out',
      normal: '250ms ease-out',
      slow: '400ms ease-out'
    }
  }
};

// Theme context
interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
  systemPreference: 'light' | 'dark';
  customTheme: Partial<Theme> | null;
  setCustomTheme: (theme: Partial<Theme>) => void;
  resetCustomTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'executive-light'
}) => {
  const [currentThemeId, setCurrentThemeId] = useState(defaultTheme);
  const [customTheme, setCustomTheme] = useState<Partial<Theme> | null>(null);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-switch theme based on system preference
  useEffect(() => {
    const autoTheme = systemPreference === 'dark' ? 'executive-dark' : 'executive-light';
    if (currentThemeId === 'auto') {
      setCurrentThemeId(autoTheme);
    }
  }, [systemPreference, currentThemeId]);

  const currentTheme = useMemo(() => {
    const baseTheme = themes[currentThemeId] || themes[defaultTheme];
    
    if (customTheme) {
      return {
        ...baseTheme,
        ...customTheme,
        colors: {
          ...baseTheme.colors,
          ...customTheme.colors
        }
      } as Theme;
    }
    
    return baseTheme;
  }, [currentThemeId, customTheme, defaultTheme]);

  const availableThemes = useMemo(() => Object.values(themes), []);

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    
    // Apply theme to CSS custom properties
    applyThemeToDOM(themes[themeId] || themes[defaultTheme]);
  };

  const resetCustomTheme = () => {
    setCustomTheme(null);
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    systemPreference,
    customTheme,
    setCustomTheme,
    resetCustomTheme
  };

  // Apply theme on mount and changes
  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Apply theme to DOM CSS custom properties
const applyThemeToDOM = (theme: Theme) => {
  const root = document.documentElement;
  
  // Apply color properties
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-border', theme.colors.border);
  
  root.style.setProperty('--theme-text-primary', theme.colors.text.primary);
  root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--theme-text-disabled', theme.colors.text.disabled);
  root.style.setProperty('--theme-text-inverse', theme.colors.text.inverse);
  
  root.style.setProperty('--theme-success', theme.colors.semantic.success);
  root.style.setProperty('--theme-warning', theme.colors.semantic.warning);
  root.style.setProperty('--theme-error', theme.colors.semantic.error);
  root.style.setProperty('--theme-info', theme.colors.semantic.info);
  
  // Apply spacing
  root.style.setProperty('--theme-spacing-xs', theme.spacing.xs);
  root.style.setProperty('--theme-spacing-sm', theme.spacing.sm);
  root.style.setProperty('--theme-spacing-md', theme.spacing.md);
  root.style.setProperty('--theme-spacing-lg', theme.spacing.lg);
  root.style.setProperty('--theme-spacing-xl', theme.spacing.xl);
  
  // Apply border radius
  root.style.setProperty('--theme-radius-sm', theme.borderRadius.sm);
  root.style.setProperty('--theme-radius-md', theme.borderRadius.md);
  root.style.setProperty('--theme-radius-lg', theme.borderRadius.lg);
  root.style.setProperty('--theme-radius-xl', theme.borderRadius.xl);
  
  // Apply shadows
  root.style.setProperty('--theme-shadow-sm', theme.shadows.sm);
  root.style.setProperty('--theme-shadow-md', theme.shadows.md);
  root.style.setProperty('--theme-shadow-lg', theme.shadows.lg);
  root.style.setProperty('--theme-shadow-xl', theme.shadows.xl);
  
  // Apply fonts
  root.style.setProperty('--theme-font-primary', theme.fonts.primary);
  root.style.setProperty('--theme-font-secondary', theme.fonts.secondary);
  root.style.setProperty('--theme-font-mono', theme.fonts.mono);
  
  // Apply animations
  root.style.setProperty('--theme-animation-fast', theme.animations.fast);
  root.style.setProperty('--theme-animation-normal', theme.animations.normal);
  root.style.setProperty('--theme-animation-slow', theme.animations.slow);
  
  // Set data attribute for theme category
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-category', theme.category);
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme selector component
interface ThemeSelectorProps {
  className?: string;
  showPreview?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showPreview = true
}) => {
  const { currentTheme, setTheme, availableThemes, systemPreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          color: currentTheme.colors.text.primary
        }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: currentTheme.colors.accent }}
        />
        <span>{currentTheme.name}</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 p-2 rounded-lg border shadow-lg z-50 min-w-64"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}
        >
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setTheme(theme.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-opacity-80"
              style={{
                backgroundColor: currentTheme.id === theme.id ? currentTheme.colors.accent + '20' : 'transparent',
                color: currentTheme.colors.text.primary
              }}
            >
              <div
                className="w-6 h-6 rounded-full border-2"
                style={{
                  backgroundColor: theme.colors.accent,
                  borderColor: theme.colors.border
                }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium">{theme.name}</div>
                <div 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {theme.description}
                </div>
              </div>
              {showPreview && (
                <div className="flex space-x-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Accessibility helper hook
export const useAccessibilityFeatures = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    motionQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const resetFontSize = () => setFontSize(16);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  };
};

export default {
  ThemeProvider,
  useTheme,
  ThemeSelector,
  useAccessibilityFeatures,
  themes
};