import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReactFlowInstance } from 'reactflow';

/**
 * Export canvas as PNG image
 */
export const exportAsPng = async (
  // Using the reactFlowInstance to get nodes for calculating bounds
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram',
  quality: number = 1.0
): Promise<boolean> => {
  try {
    const nodesBounds = reactFlowInstance.getNodes().reduce(
      (bounds, node) => {
        return {
          minX: Math.min(bounds.minX, node.position.x),
          minY: Math.min(bounds.minY, node.position.y),
          maxX: Math.max(bounds.maxX, node.position.x + (node.width || 150)),
          maxY: Math.max(bounds.maxY, node.position.y + (node.height || 40)),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    // Add some padding
    const padding = 50;
    const width = nodesBounds.maxX - nodesBounds.minX + padding * 2;
    const height = nodesBounds.maxY - nodesBounds.minY + padding * 2;

    const flowElement = document.querySelector('.react-flow__renderer') as HTMLElement;
    if (!flowElement) return false;

    // Use html2canvas to generate the image
    const canvas = await html2canvas(flowElement, {
      backgroundColor: '#ffffff',
      width,
      height,
      scale: quality,
      x: nodesBounds.minX - padding,
      y: nodesBounds.minY - padding,
    });

    // Convert canvas to blob URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Export as PNG failed:', error);
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
  fileName: string = 'diagram'
): Promise<boolean> => {
  try {
    const flowElement = document.querySelector('.react-flow__renderer') as HTMLElement;
    if (!flowElement) return false;

    const canvas = await html2canvas(flowElement, {
      backgroundColor: '#ffffff',
    });

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