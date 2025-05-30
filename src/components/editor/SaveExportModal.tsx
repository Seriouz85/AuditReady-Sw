/**
 * Save & Export Modal - Comprehensive save and export functionality
 * Supports multiple formats and local storage management
 */

import React, { useState, useCallback } from 'react';
import {
  Download, Save, FolderOpen, X, Image, FileText,
  HardDrive
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  MermaidDesignTokens
} from '../ui';
import { exportAsPng, exportAsJpg, exportAsSVG, exportAsPDF } from '../../services/export-service';
import { generateUniqueNameFromDesired, projectNameExists, validateProjectName } from '../../utils/projectUtils';

interface SaveExportModalProps {
  isVisible: boolean;
  onClose: () => void;
  diagramText: string;
  projectName?: string;
  canvasBackground?: string;
  onProjectNameChange?: (name: string) => void;
  onProjectLoad?: (diagramText: string, canvasBackground?: string, flowData?: any) => void;
  onProjectSaved?: (projectName: string) => void;
  reactFlowInstance?: any;
}

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'image' | 'document' | 'data';
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG Image',
    extension: 'png',
    description: 'High quality raster image',
    icon: Image,
    category: 'image'
  },
  {
    id: 'jpg',
    name: 'JPG Image',
    extension: 'jpg',
    description: 'Compressed raster image',
    icon: Image,
    category: 'image'
  },
  {
    id: 'svg',
    name: 'SVG Vector',
    extension: 'svg',
    description: 'Scalable vector graphics',
    icon: Image,
    category: 'image'
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: 'pdf',
    description: 'Portable document format',
    icon: FileText,
    category: 'document'
  },
  {
    id: 'mermaid',
    name: 'Mermaid Code',
    extension: 'mmd',
    description: 'Source code file',
    icon: FileText,
    category: 'data'
  }
];

export const SaveExportModal: React.FC<SaveExportModalProps> = ({
  isVisible,
  onClose,
  diagramText,
  projectName = '',
  canvasBackground = '#f8fafc',
  onProjectNameChange,
  onProjectLoad,
  onProjectSaved,
  reactFlowInstance
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [fileName, setFileName] = useState(projectName || 'mermaid-diagram');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'save' | 'open'>('export');
  const [exportQuality, setExportQuality] = useState<number>(2.0); // Default 2x scale for higher quality
  const [jpgQuality, setJpgQuality] = useState<number>(0.95); // High quality for JPG

  // Handle export
  const handleExport = useCallback(async () => {
    if (!fileName.trim()) return;

    setIsExporting(true);
    try {
      const format = EXPORT_FORMATS.find(f => f.id === selectedFormat);
      if (!format) return;

      const finalFileName = fileName.endsWith(`.${format.extension}`)
        ? fileName.slice(0, -format.extension.length - 1)
        : fileName;

      console.log('Starting export:', { format: selectedFormat, fileName: finalFileName, canvasBackground });

      let exportSuccess = false;

      switch (selectedFormat) {
        case 'png':
          exportSuccess = await exportAsPng(finalFileName, exportQuality, canvasBackground, reactFlowInstance);
          break;
        case 'jpg':
          exportSuccess = await exportAsJpg(finalFileName, jpgQuality, canvasBackground, reactFlowInstance);
          break;
        case 'svg':
          if (reactFlowInstance) {
            exportSuccess = exportAsSVG(reactFlowInstance, finalFileName);
          }
          break;
        case 'pdf':
          exportSuccess = await exportAsPDF(finalFileName, canvasBackground, reactFlowInstance);
          break;
        case 'mermaid':
          try {
            const blob = new Blob([diagramText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${finalFileName}.mmd`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            exportSuccess = true;
          } catch (error) {
            console.error('Mermaid export failed:', error);
            exportSuccess = false;
          }
          break;
      }

      if (exportSuccess) {
        console.log('Export completed successfully');
        // Show success message
        alert(`Successfully exported as ${format.name}!`);
        // Close modal after successful export
        setTimeout(() => onClose(), 500);
      } else {
        console.error('Export failed - function returned false');
        // Add debugging information
        console.log('Debug: You can test the export system by opening browser console and running:');
        console.log('- window.debugExportService() - to check container detection');
        console.log('- window.testExport() - to test the export process');
        alert(`Export failed. Please check the console for details and try again.\n\nFor debugging, open browser console and run:\n- window.debugExportService()\n- window.testExport()`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat, fileName, diagramText, reactFlowInstance, canvasBackground, onClose, exportQuality, jpgQuality]);

  // Handle save to local storage
  const handleSaveToLocalStorage = useCallback(() => {
    if (!fileName.trim()) return;

    // Get the complete React Flow state including nodes and edges
    const flowData = reactFlowInstance ? reactFlowInstance.toObject() : null;

    const projectData = {
      name: fileName,
      diagramText,
      canvasBackground,
      flowData, // Include complete React Flow state
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Saving project with flow data:', projectData); // Debug log

    // Validate project name
    const validation = validateProjectName(fileName);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Check if project name already exists and generate unique name if needed
    let finalFileName = fileName;
    if (projectNameExists(fileName) && fileName !== projectName) {
      // Only ask for confirmation if this is a different project name
      const useUniqueName = window.confirm(
        `A project named "${fileName}" already exists. Would you like to save with a unique name instead?`
      );

      if (useUniqueName) {
        finalFileName = generateUniqueNameFromDesired(fileName);
      } else {
        // User wants to overwrite
        const confirmOverwrite = window.confirm(`Are you sure you want to overwrite "${fileName}"?`);
        if (!confirmOverwrite) return;
      }
    }

    // Update project data with final name
    projectData.name = finalFileName;

    const savedProjects = JSON.parse(localStorage.getItem('mermaid-projects') || '[]');
    const existingIndex = savedProjects.findIndex((p: any) => p.name === finalFileName);

    if (existingIndex >= 0) {
      savedProjects[existingIndex] = { ...projectData, createdAt: savedProjects[existingIndex].createdAt };
      console.log('Overwriting existing project');
    } else {
      savedProjects.push(projectData);
      console.log('Creating new project');
    }

    localStorage.setItem('mermaid-projects', JSON.stringify(savedProjects));
    console.log('Projects saved to localStorage:', savedProjects);

    onProjectNameChange?.(finalFileName);
    onProjectSaved?.(finalFileName);

    // Show success message
    alert(`Project "${finalFileName}" saved successfully!`);
    onClose();
  }, [fileName, diagramText, canvasBackground, projectName, reactFlowInstance, onProjectNameChange, onProjectSaved, onClose]);

  // Get saved projects
  const getSavedProjects = useCallback(() => {
    const projects = JSON.parse(localStorage.getItem('mermaid-projects') || '[]');
    console.log('Retrieved projects from localStorage:', projects);
    return projects;
  }, []);

  // Handle open project
  const handleOpenProject = useCallback((project: any) => {
    console.log('Opening project:', project);

    // Confirm loading if current work might be lost
    const confirmLoad = window.confirm(`Load project "${project.name}"? Any unsaved changes will be lost.`);
    if (!confirmLoad) return;

    onProjectNameChange?.(project.name);
    onProjectLoad?.(project.diagramText, project.canvasBackground, project.flowData);

    // Show success message
    alert(`Project "${project.name}" loaded successfully!`);
    onClose();
  }, [onProjectNameChange, onProjectLoad, onClose]);

  if (!isVisible) return null;

  const selectedFormatData = EXPORT_FORMATS.find(f => f.id === selectedFormat);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <GlassPanel variant="elevated" padding={0} style={{
        width: '480px',
        maxHeight: '85vh',
        borderRadius: MermaidDesignTokens.borderRadius.xl,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: MermaidDesignTokens.spacing[4],
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: MermaidDesignTokens.typography.fontSize.xl,
            fontWeight: MermaidDesignTokens.typography.fontWeight.bold,
            color: MermaidDesignTokens.colors.text.primary,
            margin: 0
          }}>
            Save & Export Project
          </h2>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<X size={18} />}
            onClick={onClose}
          />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
        }}>
          {[
            { id: 'export', label: 'Export', icon: Download },
            { id: 'save', label: 'Save', icon: Save },
            { id: 'open', label: 'Open', icon: FolderOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: MermaidDesignTokens.spacing[3],
                  background: activeTab === tab.id
                    ? MermaidDesignTokens.colors.glass.secondary
                    : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id
                    ? `2px solid ${MermaidDesignTokens.colors.accent.blue}`
                    : '2px solid transparent',
                  color: activeTab === tab.id
                    ? MermaidDesignTokens.colors.text.primary
                    : MermaidDesignTokens.colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: MermaidDesignTokens.spacing[2],
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ 
          padding: MermaidDesignTokens.spacing[3],
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(85vh - 120px)'
        }}>
          {activeTab === 'export' && (
            <div>
              {/* File Name Input */}
              <div style={{ marginBottom: MermaidDesignTokens.spacing[2] }}>
                <label style={{
                  display: 'block',
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  color: MermaidDesignTokens.colors.text.primary,
                  marginBottom: MermaidDesignTokens.spacing[1]
                }}>
                  File Name
                </label>
                <GlassInput
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name..."
                  style={{ width: '100%' }}
                />
              </div>

              {/* Format Selection */}
              <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
                <label style={{
                  display: 'block',
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  color: MermaidDesignTokens.colors.text.primary,
                  marginBottom: MermaidDesignTokens.spacing[2]
                }}>
                  Export Format
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: MermaidDesignTokens.spacing[2]
                }}>
                  {EXPORT_FORMATS.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        style={{
                          padding: MermaidDesignTokens.spacing[2],
                          border: `2px solid ${selectedFormat === format.id
                            ? MermaidDesignTokens.colors.accent.blue
                            : MermaidDesignTokens.colors.glass.border}`,
                          borderRadius: MermaidDesignTokens.borderRadius.lg,
                          cursor: 'pointer',
                          background: selectedFormat === format.id
                            ? MermaidDesignTokens.colors.glass.secondary
                            : 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: MermaidDesignTokens.spacing[2],
                          marginBottom: MermaidDesignTokens.spacing[1]
                        }}>
                          <Icon size={18} color={MermaidDesignTokens.colors.accent.blue} />
                          <span style={{
                            fontSize: MermaidDesignTokens.typography.fontSize.sm,
                            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                            color: MermaidDesignTokens.colors.text.primary
                          }}>
                            {format.name}
                          </span>
                        </div>
                        <p style={{
                          fontSize: MermaidDesignTokens.typography.fontSize.xs,
                          color: MermaidDesignTokens.colors.text.secondary,
                          margin: 0
                        }}>
                          {format.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Settings */}
              {(selectedFormat === 'png' || selectedFormat === 'jpg') && (
                <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
                  <label style={{
                    display: 'block',
                    fontSize: MermaidDesignTokens.typography.fontSize.sm,
                    fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                    color: MermaidDesignTokens.colors.text.primary,
                    marginBottom: MermaidDesignTokens.spacing[1]
                  }}>
                    Export Quality
                  </label>
                  
                  {selectedFormat === 'png' && (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: MermaidDesignTokens.spacing[1]
                      }}>
                        <span style={{
                          fontSize: MermaidDesignTokens.typography.fontSize.xs,
                          color: MermaidDesignTokens.colors.text.secondary
                        }}>
                          Resolution: {exportQuality}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={exportQuality}
                        onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          height: '4px',
                          borderRadius: '2px',
                          background: MermaidDesignTokens.colors.glass.border,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  )}
                  
                  {selectedFormat === 'jpg' && (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: MermaidDesignTokens.spacing[1]
                      }}>
                        <span style={{
                          fontSize: MermaidDesignTokens.typography.fontSize.xs,
                          color: MermaidDesignTokens.colors.text.secondary
                        }}>
                          Quality: {Math.round(jpgQuality * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={jpgQuality}
                        onChange={(e) => setJpgQuality(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          height: '4px',
                          borderRadius: '2px',
                          background: MermaidDesignTokens.colors.glass.border,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Export Button */}
              <div style={{ marginTop: MermaidDesignTokens.spacing[3] }}>
                <GlassButton
                  variant="primary"
                  size="base"
                  icon={<Download size={18} />}
                  onClick={handleExport}
                  disabled={!fileName.trim() || isExporting}
                  style={{ width: '100%' }}
                  glow
                >
                  {isExporting ? 'Exporting...' : `Export as ${selectedFormatData?.name || 'File'}`}
                </GlassButton>
              </div>
            </div>
          )}

          {activeTab === 'save' && (
            <div>
              <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
                <label style={{
                  display: 'block',
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  color: MermaidDesignTokens.colors.text.primary,
                  marginBottom: MermaidDesignTokens.spacing[2]
                }}>
                  Project Name
                </label>
                <GlassInput
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter project name..."
                  style={{ width: '100%' }}
                />
              </div>

              <GlassButton
                variant="primary"
                size="base"
                icon={<HardDrive size={18} />}
                onClick={handleSaveToLocalStorage}
                disabled={!fileName.trim()}
                style={{ width: '100%' }}
                glow
              >
                Save to Local Storage
              </GlassButton>
            </div>
          )}

          {activeTab === 'open' && (
            <div>
              <h3 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.lg,
                fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
                color: MermaidDesignTokens.colors.text.primary,
                marginBottom: MermaidDesignTokens.spacing[3]
              }}>
                Saved Projects
              </h3>

              <div style={{
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {getSavedProjects().map((project: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: MermaidDesignTokens.spacing[2],
                      border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                      borderRadius: MermaidDesignTokens.borderRadius.md,
                      marginBottom: MermaidDesignTokens.spacing[1],
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleOpenProject(project)}
                  >
                    <div style={{
                      fontSize: MermaidDesignTokens.typography.fontSize.sm,
                      fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                      color: MermaidDesignTokens.colors.text.primary,
                      marginBottom: MermaidDesignTokens.spacing[1]
                    }}>
                      {project.name}
                    </div>
                    <div style={{
                      fontSize: MermaidDesignTokens.typography.fontSize.xs,
                      color: MermaidDesignTokens.colors.text.secondary
                    }}>
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default SaveExportModal;
