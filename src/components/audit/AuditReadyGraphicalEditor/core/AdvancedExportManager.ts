import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { getCanvasBackgroundManager } from './CanvasBackgroundManager';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'json' | 'html';
  quality: number; // 0.1 to 1.0
  scale: number; // 0.5 to 5.0
  backgroundColor?: string;
  includeMetadata: boolean;
  compression: boolean;
  watermark?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    fontSize: number;
  };
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
  customSize?: { width: number; height: number };
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  size: number;
  format: string;
  error?: string;
  metadata?: {
    exportedAt: Date;
    canvasSize: { width: number; height: number };
    objectCount: number;
    exportOptions: ExportOptions;
  };
}

export interface BatchExportOptions {
  formats: ExportOptions['format'][];
  baseFilename: string;
  zipOutput: boolean;
  includeManifest: boolean;
}

export class AdvancedExportManager {
  private canvas: fabric.Canvas;
  private defaultOptions: ExportOptions = {
    format: 'png',
    quality: 0.9,
    scale: 1.0,
    backgroundColor: 'white',
    includeMetadata: true,
    compression: true,
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public async exportCanvas(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    const exportOptions = { ...this.defaultOptions, ...options };

    try {
      const startTime = performance.now();
      let result: ExportResult;

      switch (exportOptions.format) {
        case 'png':
        case 'jpg':
          result = await this.exportAsImage(exportOptions);
          break;
        case 'svg':
          result = await this.exportAsSVG(exportOptions);
          break;
        case 'pdf':
          result = await this.exportAsPDF(exportOptions);
          break;
        case 'json':
          result = await this.exportAsJSON(exportOptions);
          break;
        case 'html':
          result = await this.exportAsHTML(exportOptions);
          break;
        default:
          throw new Error(`Unsupported export format: ${exportOptions.format}`);
      }

      const exportTime = performance.now() - startTime;
      console.log(`Export completed in ${exportTime.toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        filename: '',
        size: 0,
        format: exportOptions.format,
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  private async exportAsImage(options: ExportOptions): Promise<ExportResult> {
    const backgroundManager = getCanvasBackgroundManager();

    // Prepare background for export (removes grid if needed)
    const originalState = backgroundManager?.prepareForExport() || {
      originalBackground: this.canvas.backgroundImage,
      originalBackgroundColor: this.canvas.backgroundColor
    };

    // Set custom background if specified
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      this.canvas.setBackgroundColor(options.backgroundColor, () => {});
    } else if (options.backgroundColor === 'transparent') {
      this.canvas.setBackgroundColor('', () => {});
    }

    // Add watermark if specified
    let watermarkObject: fabric.Text | null = null;
    if (options.watermark) {
      watermarkObject = await this.addWatermark(options.watermark);
    }

    try {
      const dataURL = this.canvas.toDataURL({
        format: options.format === 'jpg' ? 'jpeg' : 'png',
        quality: options.quality,
        multiplier: options.scale,
        enableRetinaScaling: true
      });

      // Convert to blob for size calculation
      const blob = await this.dataURLToBlob(dataURL);
      const filename = `canvas-export.${options.format}`;

      const metadata = options.includeMetadata ? {
        exportedAt: new Date(),
        canvasSize: {
          width: this.canvas.width || 800,
          height: this.canvas.height || 600
        },
        objectCount: this.canvas.getObjects().length,
        exportOptions: options
      } : undefined;

      return {
        success: true,
        data: blob,
        filename,
        size: blob.size,
        format: options.format,
        metadata
      };
    } finally {
      // Cleanup
      if (watermarkObject) {
        this.canvas.remove(watermarkObject);
      }

      // Restore original background
      backgroundManager?.restoreAfterExport(originalState);

      this.canvas.renderAll();
    }
  }

  private async exportAsSVG(options: ExportOptions): Promise<ExportResult> {
    const svgString = this.canvas.toSVG({
      suppressPreamble: false,
      width: (this.canvas.width || 800) * options.scale,
      height: (this.canvas.height || 600) * options.scale,
      viewBox: {
        x: 0,
        y: 0,
        width: this.canvas.width || 800,
        height: this.canvas.height || 600
      }
    });

    // Add metadata as SVG comment if requested
    let finalSVG = svgString;
    if (options.includeMetadata) {
      const metadata = {
        exportedAt: new Date().toISOString(),
        canvasSize: { width: this.canvas.width, height: this.canvas.height },
        objectCount: this.canvas.getObjects().length
      };
      finalSVG = `<!-- Exported from AuditReady Editor: ${JSON.stringify(metadata)} -->\n${svgString}`;
    }

    const blob = new Blob([finalSVG], { type: 'image/svg+xml' });
    const filename = 'canvas-export.svg';

    return {
      success: true,
      data: blob,
      filename,
      size: blob.size,
      format: 'svg',
      metadata: options.includeMetadata ? {
        exportedAt: new Date(),
        canvasSize: { width: this.canvas.width || 800, height: this.canvas.height || 600 },
        objectCount: this.canvas.getObjects().length,
        exportOptions: options
      } : undefined
    };
  }

  private async exportAsPDF(options: ExportOptions): Promise<ExportResult> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: options.pageSize === 'Custom' && options.customSize ?
        [options.customSize.width, options.customSize.height] :
        options.pageSize || 'a4'
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };

    // Calculate available space
    const availableWidth = pageWidth - margins.left - margins.right;
    const availableHeight = pageHeight - margins.top - margins.bottom;

    // Get canvas as image
    const canvasDataURL = this.canvas.toDataURL({
      format: 'png',
      quality: options.quality,
      multiplier: options.scale
    });

    // Calculate image dimensions to fit page
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    const aspectRatio = canvasWidth / canvasHeight;

    let imgWidth = availableWidth;
    let imgHeight = availableWidth / aspectRatio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = availableHeight * aspectRatio;
    }

    // Add image to PDF
    pdf.addImage(
      canvasDataURL,
      'PNG',
      margins.left,
      margins.top,
      imgWidth,
      imgHeight
    );

    // Add watermark if specified
    if (options.watermark) {
      pdf.setFontSize(options.watermark.fontSize || 12);
      pdf.setTextColor(128, 128, 128);

      let x: number, y: number;
      switch (options.watermark.position) {
        case 'top-left':
          x = margins.left;
          y = margins.top + 10;
          break;
        case 'top-right':
          x = pageWidth - margins.right - 50;
          y = margins.top + 10;
          break;
        case 'bottom-left':
          x = margins.left;
          y = pageHeight - margins.bottom - 5;
          break;
        case 'bottom-right':
          x = pageWidth - margins.right - 50;
          y = pageHeight - margins.bottom - 5;
          break;
        case 'center':
        default:
          x = pageWidth / 2;
          y = pageHeight / 2;
          break;
      }

      pdf.text(options.watermark.text, x, y);
    }

    // Add metadata if requested
    if (options.includeMetadata) {
      pdf.setProperties({
        title: 'AuditReady Canvas Export',
        subject: 'Canvas Design',
        author: 'AuditReady Editor',
        creator: 'AuditReady Editor',
        creationDate: new Date()
      });
    }

    const pdfBlob = pdf.output('blob');
    const filename = 'canvas-export.pdf';

    return {
      success: true,
      data: pdfBlob,
      filename,
      size: pdfBlob.size,
      format: 'pdf',
      metadata: options.includeMetadata ? {
        exportedAt: new Date(),
        canvasSize: { width: this.canvas.width || 800, height: this.canvas.height || 600 },
        objectCount: this.canvas.getObjects().length,
        exportOptions: options
      } : undefined
    };
  }

  private async exportAsJSON(options: ExportOptions): Promise<ExportResult> {
    const canvasData = this.canvas.toJSON(['id', 'selectable', 'evented']);

    const exportData = {
      version: '1.0',
      canvas: canvasData,
      metadata: options.includeMetadata ? {
        exportedAt: new Date(),
        canvasSize: { width: this.canvas.width, height: this.canvas.height },
        objectCount: this.canvas.getObjects().length,
        exportOptions: options
      } : undefined
    };

    const jsonString = JSON.stringify(exportData, null, options.compression ? 0 : 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = 'canvas-export.json';

    return {
      success: true,
      data: blob,
      filename,
      size: blob.size,
      format: 'json',
      metadata: exportData.metadata
    };
  }

  private async exportAsHTML(options: ExportOptions): Promise<ExportResult> {
    const svgString = this.canvas.toSVG();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuditReady Canvas Export</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .canvas-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            display: inline-block;
        }
        .metadata {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="canvas-container">
        ${svgString}
    </div>
    ${options.includeMetadata ? `
    <div class="metadata">
        <strong>Export Information:</strong><br>
        Exported: ${new Date().toLocaleString()}<br>
        Canvas Size: ${this.canvas.width}x${this.canvas.height}px<br>
        Objects: ${this.canvas.getObjects().length}<br>
        Format: HTML with embedded SVG
    </div>
    ` : ''}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const filename = 'canvas-export.html';

    return {
      success: true,
      data: blob,
      filename,
      size: blob.size,
      format: 'html',
      metadata: options.includeMetadata ? {
        exportedAt: new Date(),
        canvasSize: { width: this.canvas.width || 800, height: this.canvas.height || 600 },
        objectCount: this.canvas.getObjects().length,
        exportOptions: options
      } : undefined
    };
  }

  public async batchExport(options: BatchExportOptions): Promise<ExportResult[]> {
    const results: ExportResult[] = [];

    for (const format of options.formats) {
      const exportOptions: ExportOptions = {
        ...this.defaultOptions,
        format
      };

      const result = await this.exportCanvas(exportOptions);
      if (result.success) {
        result.filename = `${options.baseFilename}.${format}`;
      }
      results.push(result);
    }

    if (options.zipOutput && results.some(r => r.success)) {
      // TODO: Implement ZIP creation
      console.log('ZIP export not yet implemented');
    }

    return results;
  }

  private async addWatermark(watermark: NonNullable<ExportOptions['watermark']>): Promise<fabric.Text> {
    const text = new fabric.Text(watermark.text, {
      fontSize: watermark.fontSize || 12,
      fill: `rgba(128, 128, 128, ${watermark.opacity || 0.5})`,
      selectable: false,
      evented: false
    });

    // Position watermark
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;

    switch (watermark.position) {
      case 'top-left':
        text.set({ left: 10, top: 10 });
        break;
      case 'top-right':
        text.set({ left: canvasWidth - (text.width || 0) - 10, top: 10 });
        break;
      case 'bottom-left':
        text.set({ left: 10, top: canvasHeight - (text.height || 0) - 10 });
        break;
      case 'bottom-right':
        text.set({
          left: canvasWidth - (text.width || 0) - 10,
          top: canvasHeight - (text.height || 0) - 10
        });
        break;
      case 'center':
      default:
        text.set({
          left: canvasWidth / 2 - (text.width || 0) / 2,
          top: canvasHeight / 2 - (text.height || 0) / 2
        });
        break;
    }

    this.canvas.add(text);
    this.canvas.renderAll();
    return text;
  }

  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  public downloadResult(result: ExportResult): void {
    if (!result.success || !result.data) {
      console.error('Cannot download failed export result');
      return;
    }

    const url = URL.createObjectURL(result.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public getExportPreview(options: Partial<ExportOptions> = {}): string {
    const exportOptions = { ...this.defaultOptions, ...options };

    return this.canvas.toDataURL({
      format: 'png',
      quality: 0.3,
      multiplier: 0.2
    });
  }

  public setDefaultOptions(options: Partial<ExportOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  public getDefaultOptions(): ExportOptions {
    return { ...this.defaultOptions };
  }
}

// Singleton instance
let advancedExportManagerInstance: AdvancedExportManager | null = null;

export const getAdvancedExportManager = (canvas?: fabric.Canvas): AdvancedExportManager | null => {
  if (canvas && !advancedExportManagerInstance) {
    advancedExportManagerInstance = new AdvancedExportManager(canvas);
  }
  return advancedExportManagerInstance;
};

export const cleanupAdvancedExportManager = (): void => {
  advancedExportManagerInstance = null;
};
