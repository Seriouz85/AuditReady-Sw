import React, { useState } from 'react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { AUDIT_COLORS } from '../core/fabric-utils';
import { Download, Image, FileText, Printer, Settings } from 'lucide-react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High quality image with transparency',
    icon: <Image className="w-5 h-5" />,
    extension: 'png'
  },
  {
    id: 'jpg',
    name: 'JPEG Image',
    description: 'Compressed image format',
    icon: <Image className="w-5 h-5" />,
    extension: 'jpg'
  },
  {
    id: 'svg',
    name: 'SVG Vector',
    description: 'Scalable vector graphics',
    icon: <FileText className="w-5 h-5" />,
    extension: 'svg'
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Portable document format',
    icon: <FileText className="w-5 h-5" />,
    extension: 'pdf'
  },
  {
    id: 'json',
    name: 'JSON Template',
    description: 'Editable template format',
    icon: <FileText className="w-5 h-5" />,
    extension: 'json'
  }
];

const ExportPanel: React.FC = () => {
  const { canvas, name } = useFabricCanvasStore();
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [exportSettings, setExportSettings] = useState({
    quality: 1,
    scale: 1,
    backgroundColor: '#ffffff',
    includeBackground: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!canvas) return;

    setIsExporting(true);
    try {
      const format = exportFormats.find(f => f.id === selectedFormat);
      if (!format) return;

      const fileName = `${name || 'audit-design'}.${format.extension}`;

      switch (selectedFormat) {
        case 'png':
        case 'jpg':
          await exportAsImage(fileName, selectedFormat as 'png' | 'jpeg');
          break;
        case 'svg':
          await exportAsSVG(fileName);
          break;
        case 'pdf':
          await exportAsPDF(fileName);
          break;
        case 'json':
          await exportAsJSON(fileName);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async (fileName: string, format: 'png' | 'jpeg') => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: format,
      quality: exportSettings.quality,
      multiplier: exportSettings.scale,
      enableRetinaScaling: true,
      withoutTransform: false
    });

    downloadFile(dataURL, fileName);
  };

  const exportAsSVG = async (fileName: string) => {
    if (!canvas) return;

    const svgData = canvas.toSVG({
      suppressPreamble: false,
      width: canvas.width * exportSettings.scale,
      height: canvas.height * exportSettings.scale,
      viewBox: {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
      }
    });

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, fileName);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async (fileName: string) => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: exportSettings.scale
      });

      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;

      // Create PDF with proper orientation
      const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate scale to fit canvas in PDF
      const scale = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight) * 0.9;

      const x = (pdfWidth - canvasWidth * scale) / 2;
      const y = (pdfHeight - canvasHeight * scale) / 2;

      pdf.addImage(
        dataURL,
        'PNG',
        x,
        y,
        canvasWidth * scale,
        canvasHeight * scale
      );

      pdf.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
      // Fallback to PNG
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: exportSettings.scale
      });
      downloadFile(dataURL, fileName.replace('.pdf', '.png'));
    }
  };

  const exportAsJSON = async (fileName: string) => {
    if (!canvas) return;

    try {
      const canvasData = canvas.toJSON();
      const jsonString = JSON.stringify(canvasData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, fileName);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSON export failed:', error);
    }
  };

  const downloadFile = (dataURL: string, fileName: string) => {
    try {
      // Use saveAs for better browser compatibility
      saveAs(dataURL, fileName);
    } catch (error) {
      // Fallback to manual download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print - ${name}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; }
              img { max-width: 100%; height: auto; }
              h1 { font-family: Arial, sans-serif; color: #333; }
            </style>
          </head>
          <body>
            <h1>${name || 'Audit Design'}</h1>
            <img src="${dataURL}" alt="Audit Design" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.primary }}>
          Export Design
        </h4>
        <p className="text-sm text-gray-600">
          Export your audit design in various formats for sharing and documentation.
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <h5 className="font-medium text-sm text-gray-700">Export Format</h5>
        <div className="grid grid-cols-1 gap-2">
          {exportFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedFormat === format.id ? AUDIT_COLORS.primary : AUDIT_COLORS.border
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded"
                  style={{ 
                    backgroundColor: selectedFormat === format.id 
                      ? AUDIT_COLORS.primary 
                      : AUDIT_COLORS.neutral,
                    color: selectedFormat === format.id ? 'white' : AUDIT_COLORS.primary
                  }}
                >
                  {format.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{format.name}</div>
                  <div className="text-xs text-gray-600">{format.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Settings */}
      <div className="space-y-4">
        <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Export Settings
        </h5>
        
        <div className="space-y-3">
          {/* Quality */}
          {(selectedFormat === 'png' || selectedFormat === 'jpg') && (
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                Quality: {Math.round(exportSettings.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportSettings.quality}
                onChange={(e) => setExportSettings(prev => ({ 
                  ...prev, 
                  quality: Number(e.target.value) 
                }))}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Scale: {exportSettings.scale}x
            </label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={exportSettings.scale}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                scale: Number(e.target.value) 
              }))}
              className="w-full"
            />
          </div>

          {/* Background */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">Include Background</label>
            <input
              type="checkbox"
              checked={exportSettings.includeBackground}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                includeBackground: e.target.checked 
              }))}
              className="rounded"
            />
          </div>

          {exportSettings.includeBackground && (
            <div>
              <label className="block text-xs text-gray-600 mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={exportSettings.backgroundColor}
                  onChange={(e) => setExportSettings(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  className="w-12 h-8 border rounded cursor-pointer"
                  style={{ borderColor: AUDIT_COLORS.border }}
                />
                <input
                  type="text"
                  value={exportSettings.backgroundColor}
                  onChange={(e) => setExportSettings(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  style={{ borderColor: AUDIT_COLORS.border }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={!canvas || isExporting}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: AUDIT_COLORS.primary }}
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'Exporting...' : 'Export Design'}
        </button>

        <button
          onClick={handlePrint}
          disabled={!canvas}
          className="w-full py-2 px-4 rounded-lg font-medium border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            borderColor: AUDIT_COLORS.primary,
            color: AUDIT_COLORS.primary 
          }}
        >
          <Printer className="w-4 h-4" />
          Print Design
        </button>
      </div>

      {/* Export Info */}
      <div 
        className="p-3 rounded-lg text-sm"
        style={{ backgroundColor: `${AUDIT_COLORS.secondary}10` }}
      >
        <p className="text-gray-600">
          <strong>Tip:</strong> Use PNG for high-quality images with transparency, 
          JPEG for smaller file sizes, SVG for scalable graphics, and PDF for documents.
        </p>
      </div>
    </div>
  );
};

export default ExportPanel; 