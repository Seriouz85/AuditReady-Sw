/**
 * Mermaid Export Functionality
 * Handles exporting diagrams in various formats
 */
import { ExportOptions } from './types/mermaid-config';

export class MermaidExporter {
  private static instance: MermaidExporter;

  private constructor() {}

  public static getInstance(): MermaidExporter {
    if (!MermaidExporter.instance) {
      MermaidExporter.instance = new MermaidExporter();
    }
    return MermaidExporter.instance;
  }

  /**
   * Export diagram as SVG
   */
  public async exportAsSVG(
    svgContent: string,
    options: ExportOptions = { format: 'svg' }
  ): Promise<Blob> {
    // Clean up the SVG content
    const cleanSvg = this.cleanSVGContent(svgContent);

    // Apply custom styling if needed
    const styledSvg = this.applyStyling(cleanSvg, options);

    return new Blob([styledSvg], { type: 'image/svg+xml' });
  }

  /**
   * Export diagram as PNG
   */
  public async exportAsPNG(
    svgContent: string,
    options: ExportOptions = { format: 'png', scale: 2 }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const scale = options.scale || 2;
        canvas.width = (options.width || img.width) * scale;
        canvas.height = (options.height || img.height) * scale;

        // Set background color if specified
        if (options.backgroundColor) {
          ctx!.fillStyle = options.backgroundColor;
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx!.scale(scale, scale);
        ctx!.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png', options.quality || 0.9);
      };

      img.onerror = () => reject(new Error('Failed to load SVG for PNG conversion'));

      const cleanSvg = this.cleanSVGContent(svgContent);
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Export diagram as PDF
   */
  public async exportAsPDF(
    svgContent: string,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<Blob> {
    // For PDF export, we'll convert to PNG first and then embed in PDF
    // This requires a PDF library like jsPDF
    const pngBlob = await this.exportAsPNG(svgContent, {
      ...options,
      format: 'png',
      scale: 3 // Higher resolution for PDF
    });

    // Create a simple PDF with the image
    // Note: This is a simplified implementation
    // In production, use a proper PDF library
    return this.createPDFFromImage(pngBlob, options);
  }

  /**
   * Clean SVG content for export
   */
  private cleanSVGContent(svgContent: string): string {
    // Remove any script tags for security
    let cleaned = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Ensure proper XML declaration
    if (!cleaned.startsWith('<?xml')) {
      cleaned = '<?xml version="1.0" encoding="UTF-8"?>\n' + cleaned;
    }

    // Add proper namespace if missing
    if (!cleaned.includes('xmlns="http://www.w3.org/2000/svg"')) {
      cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    return cleaned;
  }

  /**
   * Apply custom styling to SVG
   */
  private applyStyling(svgContent: string, options: ExportOptions): string {
    let styled = svgContent;

    // Add custom CSS if needed
    const customStyles = this.generateCustomStyles(options);
    if (customStyles) {
      styled = styled.replace(
        '<svg',
        `<svg><defs><style type="text/css"><![CDATA[${customStyles}]]></style></defs>`
      );
    }

    return styled;
  }

  /**
   * Generate custom styles for export
   */
  private generateCustomStyles(options: ExportOptions): string {
    const styles: string[] = [];

    // Add font improvements
    styles.push(`
      text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 500;
      }
    `);

    // Add glassmorphic effects for modern look
    styles.push(`
      .node rect, .node circle, .node polygon {
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
      }
    `);

    // Add background if specified
    if (options.backgroundColor) {
      styles.push(`
        svg {
          background-color: ${options.backgroundColor};
        }
      `);
    }

    return styles.join('\n');
  }

  /**
   * Create PDF from image blob
   */
  private async createPDFFromImage(imageBlob: Blob, options: ExportOptions): Promise<Blob> {
    // This is a simplified PDF creation
    // In production, use jsPDF or similar library

    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Create a simple PDF structure
    const pdfContent = this.createSimplePDF(base64, options);

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Create simple PDF structure
   */
  private createSimplePDF(base64Image: string, options: ExportOptions): string {
    // This is a very basic PDF structure
    // In production, use a proper PDF library
    const width = options.width || 595; // A4 width in points
    const height = options.height || 842; // A4 height in points

    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${width} ${height}]
/Contents 4 0 R
/Resources <<
  /XObject <<
    /Im1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q
endstream
endobj

5 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${options.width || 800}
/Height ${options.height || 600}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /DCTDecode
/Length ${base64Image.length}
>>
stream
${base64Image}
endstream
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
0000000369 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + base64Image.length}
%%EOF`;
  }

  /**
   * Download blob as file
   */
  public downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get export format recommendations
   */
  public getFormatRecommendations(_diagramType: string, usage: string): ExportOptions[] {
    const recommendations: ExportOptions[] = [];

    switch (usage) {
      case 'presentation':
        recommendations.push(
          { format: 'png', scale: 2, backgroundColor: 'transparent' },
          { format: 'svg' }
        );
        break;

      case 'documentation':
        recommendations.push(
          { format: 'svg' },
          { format: 'pdf', backgroundColor: 'white' }
        );
        break;

      case 'web':
        recommendations.push(
          { format: 'svg' },
          { format: 'png', scale: 1, backgroundColor: 'transparent' }
        );
        break;

      default:
        recommendations.push(
          { format: 'svg' },
          { format: 'png', scale: 2 }
        );
    }

    return recommendations;
  }

  /**
   * Validate export options
   */
  public validateExportOptions(options: ExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['svg', 'png', 'pdf'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (options.scale && (options.scale < 0.1 || options.scale > 10)) {
      errors.push('Scale must be between 0.1 and 10');
    }

    if (options.quality && (options.quality < 0 || options.quality > 1)) {
      errors.push('Quality must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
