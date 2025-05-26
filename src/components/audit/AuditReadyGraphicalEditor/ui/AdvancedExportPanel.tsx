import React, { useState, useEffect } from 'react';
import {
  Download,
  FileImage,
  FileText,
  File,
  Settings,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Palette,
  Maximize,
  Layers
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getAdvancedExportManager, ExportOptions, ExportResult } from '../core/AdvancedExportManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface AdvancedExportPanelProps {
  visible: boolean;
  onClose: () => void;
}

const AdvancedExportPanel: React.FC<AdvancedExportPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.9,
    scale: 1.0,
    backgroundColor: 'white',
    includeMetadata: true,
    compression: true,
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const exportManager = getAdvancedExportManager();

  useEffect(() => {
    if (visible && exportManager) {
      generatePreview();
    }
  }, [visible, exportOptions.format, exportOptions.scale, exportManager]);

  const generatePreview = () => {
    if (!exportManager) return;
    
    const preview = exportManager.getExportPreview({
      format: 'png',
      scale: 0.3,
      quality: 0.5
    });
    setPreviewUrl(preview);
  };

  const handleExport = async () => {
    if (!exportManager) return;

    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await exportManager.exportCanvas(exportOptions);
      setExportResult(result);

      if (result.success) {
        exportManager.downloadResult(result);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        filename: '',
        size: 0,
        format: exportOptions.format,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: AUDIT_COLORS.primary,
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Download size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Advanced Export
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '24px' }}>
            {/* Export Options */}
            <div>
              {/* Format Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Export Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { value: 'png', label: 'PNG', icon: FileImage },
                    { value: 'jpg', label: 'JPG', icon: FileImage },
                    { value: 'svg', label: 'SVG', icon: File },
                    { value: 'pdf', label: 'PDF', icon: FileText },
                    { value: 'json', label: 'JSON', icon: File },
                    { value: 'html', label: 'HTML', icon: FileText }
                  ].map(format => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.value}
                        onClick={() => handleOptionChange('format', format.value)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: exportOptions.format === format.value ? AUDIT_COLORS.primary : '#f8fafc',
                          color: exportOptions.format === format.value ? 'white' : '#475569',
                          border: `1px solid ${exportOptions.format === format.value ? AUDIT_COLORS.primary : '#e2e8f0'}`,
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={16} />
                        {format.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality & Scale */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Quality ({Math.round(exportOptions.quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={exportOptions.quality}
                    onChange={(e) => handleOptionChange('quality', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Scale ({exportOptions.scale}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={exportOptions.scale}
                    onChange={(e) => handleOptionChange('scale', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  <Palette size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Background Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={exportOptions.backgroundColor || '#ffffff'}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                    style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={exportOptions.backgroundColor || '#ffffff'}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="#ffffff"
                  />
                  <button
                    onClick={() => handleOptionChange('backgroundColor', 'transparent')}
                    style={secondaryButtonStyle}
                  >
                    Transparent
                  </button>
                </div>
              </div>

              {/* Advanced Options */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    ...secondaryButtonStyle,
                    marginBottom: '12px'
                  }}
                >
                  <Settings size={16} />
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* PDF Options */}
                    {exportOptions.format === 'pdf' && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                          Page Size
                        </label>
                        <select
                          value={exportOptions.pageSize}
                          onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                          style={selectStyle}
                        >
                          <option value="A4">A4</option>
                          <option value="A3">A3</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
                        </select>
                      </div>
                    )}

                    {/* Metadata & Compression */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={exportOptions.includeMetadata}
                          onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                        />
                        Include Metadata
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={exportOptions.compression}
                          onChange={(e) => handleOptionChange('compression', e.target.checked)}
                        />
                        Compression
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Result */}
              {exportResult && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${exportResult.success ? '#d1fae5' : '#fecaca'}`,
                  backgroundColor: exportResult.success ? '#ecfdf5' : '#fef2f2',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {exportResult.success ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                    <span style={{ fontWeight: '500', color: exportResult.success ? '#065f46' : '#991b1b' }}>
                      {exportResult.success ? 'Export Successful' : 'Export Failed'}
                    </span>
                  </div>
                  {exportResult.success ? (
                    <div style={{ fontSize: '14px', color: '#065f46' }}>
                      File: {exportResult.filename}<br />
                      Size: {formatFileSize(exportResult.size)}<br />
                      Format: {exportResult.format.toUpperCase()}
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#991b1b' }}>
                      Error: {exportResult.error}
                    </div>
                  )}
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  ...primaryButtonStyle,
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                {isExporting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export {exportOptions.format.toUpperCase()}
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color={AUDIT_COLORS.primary} />
                <span style={{ fontWeight: '500', color: '#374151' }}>Preview</span>
              </div>
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                textAlign: 'center'
              }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Export Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    <Layers size={32} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                {canvas?.getObjects().length || 0} objects • {exportOptions.format.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedExportPanel;
