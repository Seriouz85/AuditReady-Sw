import React, { useState } from 'react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { AUDIT_COLORS } from '../core/fabric-utils';
import { Download, Image, FileText, X, Settings } from 'lucide-react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { canvas, name } = useFabricCanvasStore();
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [exportSettings, setExportSettings] = useState({
    quality: 1,
    scale: 1,
    backgroundColor: '#ffffff',
    includeBackground: true
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

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
      
      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
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

    saveAs(dataURL, fileName);
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
    saveAs(blob, fileName);
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

      const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

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
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: exportSettings.scale
      });
      saveAs(dataURL, fileName.replace('.pdf', '.png'));
    }
  };

  const exportAsJSON = async (fileName: string) => {
    if (!canvas) return;

    try {
      const canvasData = canvas.toJSON();
      const jsonString = JSON.stringify(canvasData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      saveAs(blob, fileName);
    } catch (error) {
      console.error('JSON export failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold" style={{ color: AUDIT_COLORS.primary }}>
            Export Design
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Export Format</h3>
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
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Export Settings
            </h3>
            
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!canvas || isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: AUDIT_COLORS.primary }}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 