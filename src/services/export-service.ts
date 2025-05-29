import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReactFlowInstance } from 'reactflow';

/**
 * Hide anchor points during export
 */
const hideAnchorPoints = (): void => {
  const handles = document.querySelectorAll('.react-flow__handle');
  handles.forEach((handle) => {
    (handle as HTMLElement).style.display = 'none';
  });
};

/**
 * Show anchor points after export
 */
const showAnchorPoints = (): void => {
  const handles = document.querySelectorAll('.react-flow__handle');
  handles.forEach((handle) => {
    (handle as HTMLElement).style.display = '';
  });
};

/**
 * Convert gradient or complex CSS background to a solid color that html2canvas can handle
 */
const convertBackgroundToSolidColor = (background: string): string => {
  console.log('Converting background:', background);
  
  // If it's already a simple color, return as-is
  if (!background.includes('gradient') && !background.includes('url(')) {
    return background;
  }
  
  // Handle linear gradients - extract the first color
  if (background.includes('linear-gradient')) {
    // Match patterns like: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    // or linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)
    const colorMatches = background.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g);
    if (colorMatches && colorMatches.length > 0) {
      // Use the first color from the gradient
      console.log('Extracted first color from gradient:', colorMatches[0]);
      return colorMatches[0];
    }
    
    // Fallback: try to extract any color-like value
    const fallbackMatch = background.match(/(?:#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|white|black|transparent)/);
    if (fallbackMatch) {
      console.log('Extracted fallback color from gradient:', fallbackMatch[0]);
      return fallbackMatch[0] === 'transparent' ? '#ffffff' : fallbackMatch[0];
    }
  }
  
  // Handle radial gradients
  if (background.includes('radial-gradient')) {
    const colorMatches = background.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g);
    if (colorMatches && colorMatches.length > 0) {
      console.log('Extracted first color from radial gradient:', colorMatches[0]);
      return colorMatches[0];
    }
  }
  
  // Handle common CSS color names that might be in gradients
  const colorNameMatch = background.match(/\b(white|black|red|green|blue|yellow|orange|purple|pink|gray|grey)\b/);
  if (colorNameMatch) {
    const colorMap: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#ff0000',
      'green': '#008000',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'orange': '#ffa500',
      'purple': '#800080',
      'pink': '#ffc0cb',
      'gray': '#808080',
      'grey': '#808080'
    };
    const mappedColor = colorMap[colorNameMatch[0]];
    if (mappedColor) {
      console.log('Extracted color name from gradient:', mappedColor);
      return mappedColor;
    }
  }
  
  // If we can't parse it, return a safe fallback
  console.log('Could not parse background, using fallback');
  return '#ffffff';
};

/**
 * Improved background detection that checks React Flow's style prop
 */
const detectCanvasBackground = (backgroundColor?: string): string => {
  console.log('=== Background Detection Debug ===');
  console.log('Provided backgroundColor:', backgroundColor);
  
  // If background is explicitly provided, convert it to solid color
  if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
    const solidColor = convertBackgroundToSolidColor(backgroundColor);
    console.log('Using provided background (converted):', solidColor);
    return solidColor;
  }

  // Look for React Flow container with applied background
  const reactFlowContainer = document.querySelector('.react-flow') as HTMLElement;
  console.log('React Flow container found:', !!reactFlowContainer);
  
  if (reactFlowContainer) {
    // Check inline style first (this is where canvasBackground is applied)
    const inlineStyle = reactFlowContainer.style;
    console.log('React Flow inline styles:', {
      background: inlineStyle.background,
      backgroundColor: inlineStyle.backgroundColor,
      cssText: inlineStyle.cssText
    });
    
    if (inlineStyle.background && inlineStyle.background !== 'transparent') {
      const solidColor = convertBackgroundToSolidColor(inlineStyle.background);
      console.log('Found background in inline style (converted):', solidColor);
      return solidColor;
    }
    
    if (inlineStyle.backgroundColor && inlineStyle.backgroundColor !== 'transparent') {
      const solidColor = convertBackgroundToSolidColor(inlineStyle.backgroundColor);
      console.log('Found backgroundColor in inline style (converted):', solidColor);
      return solidColor;
    }
    
    // Check computed style as fallback
    const computedStyle = getComputedStyle(reactFlowContainer);
    console.log('React Flow computed styles:', {
      background: computedStyle.background,
      backgroundColor: computedStyle.backgroundColor
    });
    
    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const solidColor = convertBackgroundToSolidColor(computedStyle.backgroundColor);
      console.log('Found background in computed style (converted):', solidColor);
      return solidColor;
    }
  }
  
  // Also check for any parent containers that might have the background
  const parentContainers = document.querySelectorAll('[style*="background"]');
  console.log('Found containers with background styles:', parentContainers.length);
  parentContainers.forEach((container, index) => {
    const element = container as HTMLElement;
    console.log(`Container ${index}:`, {
      tagName: element.tagName,
      className: element.className,
      background: element.style.background,
      backgroundColor: element.style.backgroundColor
    });
  });
  
  // Final fallback
  console.log('Using fallback background: #ffffff');
  console.log('=== End Background Detection Debug ===');
  return '#ffffff';
};

/**
 * Improved download function that ensures the file is actually saved
 */
const triggerDownload = (dataUrl: string, fileName: string): void => {
  console.log('Triggering download for:', fileName);
  console.log('Data URL length:', dataUrl.length);
  console.log('Data URL preview:', dataUrl.substring(0, 100) + '...');
  
  // Check if we're in a secure context (required for some download operations)
  console.log('Secure context:', window.isSecureContext);
  console.log('User agent:', navigator.userAgent);
  
  // Create a more robust download mechanism
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = dataUrl;
  link.download = fileName;
  
  // Set additional attributes that might help with download
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  
  // Add to DOM, click, and remove
  document.body.appendChild(link);
  
  // Use setTimeout to ensure the link is in the DOM
  setTimeout(() => {
    try {
      link.click();
      console.log('Download link clicked successfully');
    } catch (error) {
      console.error('Error clicking download link:', error);
      
      // Fallback: try opening in new window
      try {
        window.open(dataUrl, '_blank');
        console.log('Opened in new window as fallback');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
        console.log('Download link removed from DOM');
      }
    }, 100);
  }, 10);
};

/**
 * Export canvas as PNG image with improved error handling
 */
export const exportAsPng = async (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  quality: number = 1.0,
  backgroundColor?: string
): Promise<boolean> => {
  try {
    console.log('Export PNG - Starting export with params:', {
      fileName,
      quality,
      backgroundColor,
      hasReactFlowInstance: !!reactFlowInstance
    });

    // Find the React Flow viewport element which contains the actual content
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow viewport not found');
      return false;
    }

    console.log('Export PNG - Flow element found:', {
      width: flowElement.scrollWidth,
      height: flowElement.scrollHeight,
      clientWidth: flowElement.clientWidth,
      clientHeight: flowElement.clientHeight
    });

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 300));

    // Detect the actual background color
    const actualBackground = detectCanvasBackground(backgroundColor);
    console.log('Export PNG - Using background:', actualBackground);

    // Ensure we have valid dimensions
    const exportWidth = Math.max(flowElement.scrollWidth, flowElement.clientWidth, 800);
    const exportHeight = Math.max(flowElement.scrollHeight, flowElement.clientHeight, 600);

    console.log('Export PNG - Export dimensions:', { exportWidth, exportHeight });

    // Try export with retry logic for gradient issues
    let canvas: HTMLCanvasElement | null = null;
    let lastError: Error | null = null;

    // First attempt with detected background
    try {
      canvas = await html2canvas(flowElement, {
        backgroundColor: actualBackground,
        scale: quality,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: exportWidth,
        height: exportHeight,
        foreignObjectRendering: true,
        ignoreElements: (element) => {
          const shouldIgnore = element.classList.contains('react-flow__handle') ||
                 element.classList.contains('react-flow__controls') ||
                 element.classList.contains('react-flow__minimap') ||
                 element.classList.contains('react-flow__panel');
          return shouldIgnore;
        }
      });
    } catch (error) {
      console.warn('First export attempt failed, trying with white background:', error);
      lastError = error as Error;
      
      // Retry with white background if gradient parsing failed
      try {
        canvas = await html2canvas(flowElement, {
          backgroundColor: '#ffffff',
          scale: quality,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: exportWidth,
          height: exportHeight,
          foreignObjectRendering: true,
          ignoreElements: (element) => {
            const shouldIgnore = element.classList.contains('react-flow__handle') ||
                   element.classList.contains('react-flow__controls') ||
                   element.classList.contains('react-flow__minimap') ||
                   element.classList.contains('react-flow__panel');
            return shouldIgnore;
          }
        });
        console.log('Export PNG - Retry with white background succeeded');
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        throw lastError; // Throw the original error
      }
    }

    console.log('Export PNG - Canvas created:', {
      width: canvas.width,
      height: canvas.height
    });

    // Show anchor points after export
    showAnchorPoints();

    // Verify canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas has zero dimensions');
      return false;
    }

    // Create download
    const dataURL = canvas.toDataURL('image/png');
    
    // Check if dataURL is valid
    if (!dataURL || dataURL === 'data:,' || dataURL.length < 100) {
      console.error('Invalid canvas data URL');
      return false;
    }

    console.log('Export PNG - Data URL created successfully');
    
    // Trigger download
    triggerDownload(dataURL, `${fileName}.png`);

    console.log('Export PNG - Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export as PNG failed:', error);
    // Make sure to show anchor points even if export fails
    showAnchorPoints();
    return false;
  }
};

/**
 * Export canvas as JPG image with improved error handling
 */
export const exportAsJpg = async (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  quality: number = 0.9,
  backgroundColor?: string
): Promise<boolean> => {
  try {
    console.log('Export JPG - Starting export with params:', {
      fileName,
      quality,
      backgroundColor
    });

    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow viewport not found');
      return false;
    }

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 300));

    // Detect the actual background color
    const actualBackground = detectCanvasBackground(backgroundColor);
    console.log('Export JPG - Using background:', actualBackground);

    // Ensure we have valid dimensions
    const exportWidth = Math.max(flowElement.scrollWidth, flowElement.clientWidth, 800);
    const exportHeight = Math.max(flowElement.scrollHeight, flowElement.clientHeight, 600);

    // Try export with retry logic for gradient issues
    let canvas: HTMLCanvasElement | null = null;
    let lastError: Error | null = null;

    // First attempt with detected background
    try {
      canvas = await html2canvas(flowElement, {
        backgroundColor: actualBackground,
        scale: 1.0,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: exportWidth,
        height: exportHeight,
        foreignObjectRendering: true,
        ignoreElements: (element) => {
          const shouldIgnore = element.classList.contains('react-flow__handle') ||
                 element.classList.contains('react-flow__controls') ||
                 element.classList.contains('react-flow__minimap') ||
                 element.classList.contains('react-flow__panel');
          return shouldIgnore;
        }
      });
    } catch (error) {
      console.warn('First JPG export attempt failed, trying with white background:', error);
      lastError = error as Error;
      
      // Retry with white background if gradient parsing failed
      try {
        canvas = await html2canvas(flowElement, {
          backgroundColor: '#ffffff',
          scale: 1.0,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: exportWidth,
          height: exportHeight,
          foreignObjectRendering: true,
          ignoreElements: (element) => {
            const shouldIgnore = element.classList.contains('react-flow__handle') ||
                   element.classList.contains('react-flow__controls') ||
                   element.classList.contains('react-flow__minimap') ||
                   element.classList.contains('react-flow__panel');
            return shouldIgnore;
          }
        });
        console.log('Export JPG - Retry with white background succeeded');
      } catch (retryError) {
        console.error('JPG retry also failed:', retryError);
        throw lastError; // Throw the original error
      }
    }

    console.log('Export JPG - Canvas created:', {
      width: canvas.width,
      height: canvas.height
    });

    // Show anchor points after export
    showAnchorPoints();

    // Verify canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas has zero dimensions');
      return false;
    }

    // Create download
    const dataURL = canvas.toDataURL('image/jpeg', quality);
    
    // Check if dataURL is valid
    if (!dataURL || dataURL === 'data:,' || dataURL.length < 100) {
      console.error('Invalid canvas data URL');
      return false;
    }

    console.log('Export JPG - Data URL created successfully');
    
    // Trigger download
    triggerDownload(dataURL, `${fileName}.jpg`);

    console.log('Export JPG - Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export as JPG failed:', error);
    // Make sure to show anchor points even if export fails
    showAnchorPoints();
    return false;
  }
};

/**
 * Export canvas as SVG
 */
export const exportAsSVG = (
  _reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram'
): boolean => {
  try {
    console.log('Export SVG - Starting export');
    
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow element not found');
      return false;
    }

    // Get the SVG element
    const svgElement = flowElement.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element not found');
      return false;
    }

    // Clone the SVG element to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    // Set viewBox and other attributes
    const { width, height } = flowElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Convert to string
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Trigger download
    triggerDownload(url, `${fileName}.svg`);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log('Export SVG - Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export as SVG failed:', error);
    return false;
  }
};

/**
 * Export canvas as PDF
 */
export const exportAsPDF = async (
  _reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  backgroundColor?: string
): Promise<boolean> => {
  try {
    console.log('Export PDF - Starting export');
    
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow viewport not found');
      return false;
    }

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 300));

    // Detect the actual background color
    const actualBackground = detectCanvasBackground(backgroundColor);
    console.log('Export PDF - Using background:', actualBackground);

    const canvas = await html2canvas(flowElement, {
      backgroundColor: actualBackground,
      width: flowElement.scrollWidth,
      height: flowElement.scrollHeight,
      ignoreElements: (element) => {
        return element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap') ||
               element.classList.contains('react-flow__panel');
      }
    });

    // Show anchor points after export
    showAnchorPoints();

    const imgData = canvas.toDataURL('image/png');
    const { width, height } = flowElement.getBoundingClientRect();

    // Create PDF with jsPDF
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`${fileName}.pdf`);

    console.log('Export PDF - Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export as PDF failed:', error);
    // Make sure to show anchor points even if export fails
    showAnchorPoints();
    return false;
  }
};

/**
 * Export flow as JSON
 */
export const exportAsJson = (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram'
): boolean => {
  try {
    console.log('Export JSON - Starting export');
    
    // Get the flow object
    const flow = reactFlowInstance.toObject();
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    triggerDownload(url, `${fileName}.json`);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log('Export JSON - Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export as JSON failed:', error);
    return false;
  }
};

/**
 * Test function to verify gradient conversion (can be removed in production)
 */
const testGradientConversion = () => {
  const testGradients = [
    'linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    '#ff0000',
    'rgba(255, 255, 255, 0.9)',
    'transparent'
  ];
  
  console.log('=== Testing Gradient Conversion ===');
  testGradients.forEach(gradient => {
    const result = convertBackgroundToSolidColor(gradient);
    console.log(`Input: ${gradient} -> Output: ${result}`);
  });
  console.log('=== End Gradient Conversion Test ===');
};

// Uncomment the line below to test gradient conversion
// testGradientConversion();