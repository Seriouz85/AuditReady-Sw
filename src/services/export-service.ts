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
 * Export canvas as PNG image
 */
export const exportAsPng = async (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  quality: number = 1.0,
  backgroundColor?: string
): Promise<boolean> => {
  try {
    // Find the React Flow viewport element which contains the actual content
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow viewport not found');
      return false;
    }

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait longer for the DOM to update and background to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the parent container to determine proper background
    const containerElement = document.querySelector('.react-flow') as HTMLElement;
    const actualBackground = backgroundColor ||
      (containerElement ? getComputedStyle(containerElement).backgroundColor : '#ffffff');

    console.log('Exporting with background:', actualBackground);

    const canvas = await html2canvas(flowElement, {
      backgroundColor: actualBackground,
      scale: quality,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: flowElement.scrollWidth,
      height: flowElement.scrollHeight,
      ignoreElements: (element) => {
        // Ignore handle elements and other UI elements
        return element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap');
      }
    });

    // Show anchor points after export
    showAnchorPoints();

    // Create download link
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Export as PNG failed:', error);
    // Make sure to show anchor points even if export fails
    showAnchorPoints();
    return false;
  }
};

/**
 * Export canvas as JPG image
 */
export const exportAsJpg = async (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  quality: number = 0.9,
  backgroundColor?: string
): Promise<boolean> => {
  try {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      console.error('React Flow viewport not found');
      return false;
    }

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait longer for the DOM to update and background to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    const containerElement = document.querySelector('.react-flow') as HTMLElement;
    const actualBackground = backgroundColor ||
      (containerElement ? getComputedStyle(containerElement).backgroundColor : '#ffffff');

    const canvas = await html2canvas(flowElement, {
      backgroundColor: actualBackground,
      scale: 1.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: flowElement.scrollWidth,
      height: flowElement.scrollHeight,
      ignoreElements: (element) => {
        return element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap');
      }
    });

    // Show anchor points after export
    showAnchorPoints();

    // Create download link
    const link = document.createElement('a');
    link.download = `${fileName}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
  // Using reactFlowInstance type for consistent API
  _reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram'
): boolean => {
  try {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return false;

    // Get the SVG element
    const svgElement = flowElement.querySelector('svg');
    if (!svgElement) return false;

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

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
  // Using reactFlowInstance type for consistent API
  _reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  backgroundColor?: string
): Promise<boolean> => {
  try {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) return false;

    // Hide anchor points before export
    hideAnchorPoints();

    // Wait longer for the DOM to update and background to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    const containerElement = document.querySelector('.react-flow') as HTMLElement;
    const actualBackground = backgroundColor ||
      (containerElement ? getComputedStyle(containerElement).backgroundColor : '#ffffff');

    const canvas = await html2canvas(flowElement, {
      backgroundColor: actualBackground,
      width: flowElement.scrollWidth,
      height: flowElement.scrollHeight,
      ignoreElements: (element) => {
        return element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap');
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
  // Using the reactFlowInstance to get the flow object
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram'
): boolean => {
  try {
    // Get the flow object
    const flow = reactFlowInstance.toObject();
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Export as JSON failed:', error);
    return false;
  }
};