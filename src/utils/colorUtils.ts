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
 * Convert RGB color to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Extract all colors from a gradient string
 */
export const extractColorsFromGradient = (gradient: string): string[] => {
  // Match all hex colors
  const hexColors = gradient.match(/#[a-fA-F0-9]{6}/g) || [];
  
  // Match rgb/rgba colors
  const rgbColors = gradient.match(/rgba?\([^)]+\)/g) || [];
  
  // Convert rgb to hex
  const convertedRgbColors = rgbColors.map(rgb => {
    const match = rgb.match(/\d+/g);
    if (match && match.length >= 3) {
      return rgbToHex(parseInt(match[0]), parseInt(match[1]), parseInt(match[2]));
    }
    return null;
  }).filter(Boolean) as string[];
  
  return [...hexColors, ...convertedRgbColors];
};

/**
 * Calculate the average color from multiple colors
 */
export const getAverageColor = (colors: string[]): string => {
  if (colors.length === 0) return '#808080'; // Default gray
  if (colors.length === 1) return colors[0];
  
  let totalR = 0, totalG = 0, totalB = 0;
  let validColors = 0;
  
  colors.forEach(color => {
    const rgb = hexToRgb(color);
    if (rgb) {
      totalR += rgb.r;
      totalG += rgb.g;
      totalB += rgb.b;
      validColors++;
    }
  });
  
  if (validColors === 0) return '#808080';
  
  const avgR = Math.round(totalR / validColors);
  const avgG = Math.round(totalG / validColors);
  const avgB = Math.round(totalB / validColors);
  
  return rgbToHex(avgR, avgG, avgB);
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
  // Handle gradients by extracting and analyzing all colors
  if (backgroundColor.includes('gradient')) {
    const colors = extractColorsFromGradient(backgroundColor);
    if (colors.length > 0) {
      // Get average color from gradient
      const avgColor = getAverageColor(colors);
      backgroundColor = avgColor;
    } else {
      return false; // Default to light if we can't parse gradient
    }
  }

  const luminance = getLuminance(backgroundColor);
  return luminance < 0.5; // Threshold for dark vs light
};

/**
 * Analyze gradient direction and position for better color suggestions
 */
export const analyzeGradient = (gradientString: string): { 
  type: 'linear' | 'radial' | 'conic' | 'solid'; 
  colors: string[]; 
  dominantColor: string;
  positions?: number[];
} => {
  // Default solid color
  if (!gradientString.includes('gradient')) {
    return {
      type: 'solid',
      colors: [gradientString],
      dominantColor: gradientString
    };
  }

  const colors = extractColorsFromGradient(gradientString);
  
  // Determine gradient type
  let type: 'linear' | 'radial' | 'conic' = 'linear';
  if (gradientString.includes('radial')) type = 'radial';
  else if (gradientString.includes('conic')) type = 'conic';
  
  // For radial gradients, the center color is often dominant
  // For linear gradients, we average the colors
  const dominantColor = type === 'radial' && colors.length > 0 
    ? colors[0] // First color is usually center in radial
    : getAverageColor(colors);
    
  return {
    type,
    colors,
    dominantColor
  };
};

/**
 * Get smart color adjustments based on gradient analysis and all possible variables
 */
export const getSmartGradientAdjustment = (backgroundColor: string, nodeShape?: string, nodeSize?: { width: number; height: number }) => {
  const gradientInfo = analyzeGradient(backgroundColor);
  
  if (gradientInfo.type === 'solid') {
    return getOptimalColors(backgroundColor);
  }
  
  // For gradients, use the dominant color for calculations
  const baseColors = getOptimalColors(gradientInfo.dominantColor);
  const isDark = isDarkBackground(gradientInfo.dominantColor);
  const luminance = getLuminance(gradientInfo.dominantColor);
  
  // Enhanced calculations using all possible variables
  let enhancementFactor = 1;
  let contrastBoost = 0;
  let shadowIntensity = 0.3;
  let borderWidthMultiplier = 1.5;
  
  // Adjust based on gradient complexity (number of colors)
  if (gradientInfo.colors.length > 2) {
    enhancementFactor += 0.2; // More complex gradients need more contrast
    contrastBoost += 0.1;
  }
  
  // Adjust based on node shape complexity
  if (nodeShape) {
    switch (nodeShape) {
      case 'diamond':
        enhancementFactor += 0.3; // Diamonds need more contrast due to smaller text area
        shadowIntensity += 0.2;
        borderWidthMultiplier += 0.5;
        break;
      case 'star':
        enhancementFactor += 0.4; // Stars have the most complex shape
        shadowIntensity += 0.3;
        borderWidthMultiplier += 0.7;
        break;
      case 'circle':
        enhancementFactor += 0.1; // Circles are easier to read
        break;
      case 'text':
        enhancementFactor += 0.5; // Text nodes need maximum contrast
        shadowIntensity += 0.4;
        break;
    }
  }
  
  // Adjust based on node size (if smaller, need more contrast)
  if (nodeSize) {
    const area = nodeSize.width * nodeSize.height;
    const standardArea = 80 * 80; // Our standard node size
    if (area < standardArea) {
      const sizeRatio = area / standardArea;
      enhancementFactor += (1 - sizeRatio) * 0.5;
      shadowIntensity += (1 - sizeRatio) * 0.3;
    }
  }
  
  // Enhance contrast for gradient backgrounds using all variables
  if (gradientInfo.type === 'linear' || gradientInfo.type === 'radial') {
    const enhancedColors = {
      ...baseColors,
      
      // Enhanced shadow/glow effects based on all variables
      shadowEffect: isDark 
        ? `drop-shadow(0 0 ${Math.round(4 * enhancementFactor)}px rgba(255, 255, 255, ${Math.min(0.6, shadowIntensity)}))`
        : `drop-shadow(0 0 ${Math.round(4 * enhancementFactor)}px rgba(0, 0, 0, ${Math.min(0.4, shadowIntensity)}))`,
      
      // Dynamic fill opacity based on contrast needs
      shapeFillOpacity: Math.max(0.85, 1 - (contrastBoost * 0.3)),
      
      // Enhanced border width for better definition
      borderWidth: Math.round(2 * borderWidthMultiplier * enhancementFactor),
      
      // Enhanced text contrast
      textColor: isDark 
        ? (luminance < 0.15 ? '#ffffff' : adjustColorBrightness(baseColors.textColor, 20 + Math.round(contrastBoost * 30)))
        : (luminance > 0.85 ? '#000000' : adjustColorBrightness(baseColors.textColor, -(20 + Math.round(contrastBoost * 30)))),
      
      // Enhanced border colors with better contrast
      rectangleBorder: adjustColorSaturation(baseColors.rectangleBorder, 10 + Math.round(enhancementFactor * 20)),
      circleBorder: adjustColorSaturation(baseColors.circleBorder, 10 + Math.round(enhancementFactor * 20)),
      diamondBorder: adjustColorSaturation(baseColors.diamondBorder, 15 + Math.round(enhancementFactor * 25)),
      starBorder: adjustColorSaturation(baseColors.starBorder, 15 + Math.round(enhancementFactor * 25)),
      
      // Enhanced connector colors
      connectorColor: adjustColorBrightness(baseColors.connectorColor, isDark ? 15 : -15),
      
      // Background blur for text readability on complex gradients
      textBackgroundBlur: gradientInfo.colors.length > 3 ? 'backdrop-filter: blur(2px)' : null,
      
      // Font weight adjustment for better readability
      fontWeight: nodeShape === 'diamond' || nodeShape === 'star' ? 600 : 500,
      
      // Additional properties for advanced styling
      outlineColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
      outlineWidth: Math.round(enhancementFactor),
      
      // Gradient overlay for text backgrounds in complex cases
      textBackgroundGradient: gradientInfo.colors.length > 4 
        ? (isDark ? 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2))' : 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.2))')
        : null
    };
    
    return enhancedColors;
  }
  
  return baseColors;
};

/**
 * Adjust color brightness by a percentage
 */
export const adjustColorBrightness = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (color: number) => {
    const adjusted = color + (percent * 255 / 100);
    return Math.min(255, Math.max(0, Math.round(adjusted)));
  };
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
};

/**
 * Adjust color saturation by a percentage
 */
export const adjustColorSaturation = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Convert RGB to HSL for saturation adjustment
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const diff = max - min;
  const sum = max + min;
  const l = sum / 2;
  
  if (diff === 0) return hex; // Grayscale, no saturation to adjust
  
  const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
  
  // Adjust saturation
  const newS = Math.min(1, Math.max(0, s + (percent / 100)));
  
  // Convert back to RGB (simplified)
  const c = (1 - Math.abs(2 * l - 1)) * newS;
  const x = c * (1 - Math.abs(((max - min) / c) % 2 - 1));
  const m = l - c / 2;
  
  let rNew, gNew, bNew;
  if (max === r / 255) {
    rNew = c; gNew = x; bNew = 0;
  } else if (max === g / 255) {
    rNew = x; gNew = c; bNew = 0;
  } else {
    rNew = 0; gNew = x; bNew = c;
  }
  
  return rgbToHex(
    Math.round((rNew + m) * 255),
    Math.round((gNew + m) * 255),
    Math.round((bNew + m) * 255)
  );
};

/**
 * Get optimal colors for content based on background - Fine-tuned version
 */
export const getOptimalColors = (backgroundColor: string) => {
  let effectiveColor = backgroundColor;
  
  // Handle gradients by getting the dominant color
  if (backgroundColor.includes('gradient')) {
    const colors = extractColorsFromGradient(backgroundColor);
    if (colors.length > 0) {
      effectiveColor = getAverageColor(colors);
    }
  }
  
  const isDark = isDarkBackground(effectiveColor);
  const luminance = getLuminance(effectiveColor);

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
    const nodeSize = { width: 80, height: 80 }; // Default node size
    const nodeSmartColors = getSmartGradientAdjustment(backgroundColor, shape, nodeSize);
    
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
        textColor: colors.textColor,
        // Add enhanced properties for gradient backgrounds using correct object
        strokeWidth: (nodeSmartColors as any).borderWidth || node.data.strokeWidth || 2,
        shadowEffect: (nodeSmartColors as any).shadowEffect || null
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
  const smartColors = getSmartGradientAdjustment(backgroundColor);

  return {
    '--auto-text-color': colors.textColor,
    '--auto-connector-color': colors.connectorColor,
    '--auto-handle-color': colors.handleColor,
    '--auto-shape-fill': colors.shapeFill,
    '--auto-rectangle-border': colors.rectangleBorder,
    '--auto-circle-border': colors.circleBorder,
    '--auto-diamond-border': colors.diamondBorder,
    '--auto-star-border': colors.starBorder,
    '--auto-shadow-effect': (smartColors as any).shadowEffect || 'none',
    '--auto-shape-opacity': (smartColors as any).shapeFillOpacity?.toString() || '1',
    '--auto-border-width': (smartColors as any).borderWidth?.toString() + 'px' || '2px'
  };
};

/**
 * Create gradient-aware background presets
 */
export const gradientPresets = [
  {
    name: 'Ocean Depth',
    value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    category: 'dark'
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
    category: 'vibrant'
  },
  {
    name: 'Forest Mist',
    value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    category: 'nature'
  },
  {
    name: 'Purple Dream',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'elegant'
  },
  {
    name: 'Warm Sand',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    category: 'light'
  },
  {
    name: 'Cool Breeze',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    category: 'soft'
  },
  {
    name: 'Northern Lights',
    value: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    category: 'aurora'
  },
  {
    name: 'Lavender Fields',
    value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    category: 'pastel'
  }
];
