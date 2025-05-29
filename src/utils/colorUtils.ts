/**
 * Color utility functions for auto-adjusting content colors based on background
 */

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate luminance of a color (0-1, where 0 is darkest and 1 is lightest)
 */
export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // Default to medium luminance if parsing fails

  // Convert to relative luminance using sRGB formula
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if a background color is dark or light
 */
export const isDarkBackground = (backgroundColor: string): boolean => {
  // Handle gradients by extracting the first color
  if (backgroundColor.includes('gradient')) {
    const colorMatch = backgroundColor.match(/#[a-fA-F0-9]{6}/);
    if (colorMatch) {
      backgroundColor = colorMatch[0];
    } else {
      return false; // Default to light if we can't parse gradient
    }
  }

  const luminance = getLuminance(backgroundColor);
  return luminance < 0.5; // Threshold for dark vs light
};

/**
 * Get optimal colors for content based on background - Fine-tuned version
 */
export const getOptimalColors = (backgroundColor: string) => {
  const isDark = isDarkBackground(backgroundColor);
  const luminance = getLuminance(backgroundColor);

  if (isDark) {
    // Dark background - use subtle light colors that aren't too harsh
    const intensity = Math.max(0.3, 1 - luminance); // Adjust intensity based on how dark it is

    return {
      // Shape colors - keep light fills but adjust borders for better contrast
      shapeFill: '#ffffff',       // Pure white for better contrast on dark
      rectangleBorder: `hsl(217, ${Math.round(85 * intensity)}%, ${Math.round(65 + 15 * intensity)}%)`, // Adaptive blue
      circleBorder: `hsl(160, ${Math.round(75 * intensity)}%, ${Math.round(60 + 20 * intensity)}%)`,    // Adaptive green
      diamondBorder: `hsl(45, ${Math.round(90 * intensity)}%, ${Math.round(65 + 15 * intensity)}%)`,   // Adaptive yellow
      starBorder: `hsl(270, ${Math.round(80 * intensity)}%, ${Math.round(70 + 15 * intensity)}%)`,     // Adaptive purple

      // Text colors - ensure good readability
      textColor: luminance < 0.1 ? '#ffffff' : '#f1f5f9',  // Very white for very dark backgrounds

      // Connector colors - subtle but visible
      connectorColor: luminance < 0.15 ? '#cbd5e1' : '#94a3b8',  // Adaptive gray

      // Handle colors
      handleColor: `hsl(217, ${Math.round(85 * intensity)}%, ${Math.round(65 + 15 * intensity)}%)`
    };
  } else {
    // Light background - use refined dark colors
    const intensity = Math.min(1, luminance + 0.2); // Adjust intensity based on how light it is

    return {
      // Shape colors - keep light fills with properly contrasted borders
      shapeFill: luminance > 0.9 ? '#f8fafc' : '#ffffff',  // Slightly different fill for very light backgrounds
      rectangleBorder: `hsl(217, ${Math.round(75 + 15 * intensity)}%, ${Math.round(45 - 10 * (intensity - 0.5))}%)`, // Adaptive blue
      circleBorder: `hsl(160, ${Math.round(70 + 20 * intensity)}%, ${Math.round(40 - 5 * (intensity - 0.5))}%)`,     // Adaptive green
      diamondBorder: `hsl(25, ${Math.round(85 + 10 * intensity)}%, ${Math.round(50 - 10 * (intensity - 0.5))}%)`,    // Adaptive orange
      starBorder: `hsl(270, ${Math.round(75 + 15 * intensity)}%, ${Math.round(45 - 5 * (intensity - 0.5))}%)`,       // Adaptive purple

      // Text colors - ensure good readability
      textColor: luminance > 0.85 ? '#1e293b' : '#334155',  // Darker text for very light backgrounds

      // Connector colors - visible but not overwhelming
      connectorColor: luminance > 0.8 ? '#1e293b' : '#475569',  // Adaptive dark gray

      // Handle colors
      handleColor: `hsl(217, ${Math.round(75 + 15 * intensity)}%, ${Math.round(45 - 10 * (intensity - 0.5))}%)`
    };
  }
};

/**
 * Apply auto-adjusted colors to nodes based on background
 */
export const applyAutoAdjustedColors = (nodes: any[], backgroundColor: string) => {
  const colors = getOptimalColors(backgroundColor);

  return nodes.map(node => {
    const shape = node.data.shape || 'rectangle';
    let borderColor = colors.rectangleBorder;

    // Select appropriate border color based on shape
    switch (shape) {
      case 'circle':
        borderColor = colors.circleBorder;
        break;
      case 'diamond':
        borderColor = colors.diamondBorder;
        break;
      case 'star':
        borderColor = colors.starBorder;
        break;
      case 'text':
        borderColor = 'transparent';
        break;
      default:
        borderColor = colors.rectangleBorder;
    }

    return {
      ...node,
      data: {
        ...node.data,
        fillColor: shape === 'text' ? 'transparent' : colors.shapeFill,
        strokeColor: borderColor,
        textColor: colors.textColor
      }
    };
  });
};

/**
 * Get auto-adjusted edge colors based on background
 */
export const getAutoAdjustedEdgeColors = (backgroundColor: string) => {
  const colors = getOptimalColors(backgroundColor);
  return {
    stroke: colors.connectorColor,
    markerColor: colors.connectorColor
  };
};

/**
 * Generate CSS custom properties for auto-adjusted colors
 */
export const generateAutoAdjustedCSSVars = (backgroundColor: string): Record<string, string> => {
  const colors = getOptimalColors(backgroundColor);

  return {
    '--auto-text-color': colors.textColor,
    '--auto-connector-color': colors.connectorColor,
    '--auto-handle-color': colors.handleColor,
    '--auto-shape-fill': colors.shapeFill,
    '--auto-rectangle-border': colors.rectangleBorder,
    '--auto-circle-border': colors.circleBorder,
    '--auto-diamond-border': colors.diamondBorder,
    '--auto-star-border': colors.starBorder
  };
};
