import React, { useEffect, useState } from 'react';
import { useFabricCanvasStore } from './core/FabricCanvasStore';
import FabricCanvas from './canvas/FabricCanvas';
import ModernSidebar from './sidebar/ModernSidebar';
import PropertiesPanel from './properties/PropertiesPanel';
import ExportModal from './export/ExportModal';
import { Save, ArrowLeft, Trash2, Undo, Redo, Settings, Users, Cloud, Layout, FileDown, Zap, FileText, BarChart3 } from 'lucide-react';
import { debugAllEditorComponents, testSidebarButtons } from './utils/visibility-debug';
import { getUndoRedoManager } from './core/UndoRedoManager';
import ContextMenu from './ui/ContextMenu';
import AlignmentToolbar from './ui/AlignmentToolbar';
import SettingsPanel from './ui/SettingsPanel';
import CollaborationPanel from './ui/CollaborationPanel';
import CloudStoragePanel from './ui/CloudStoragePanel';
import AdvancedExportPanel from './ui/AdvancedExportPanel';
import TemplateGalleryPanel from './ui/TemplateGalleryPanel';
import WorkflowAutomationPanel from './ui/WorkflowAutomationPanel';
import SmartFormsPanel from './ui/SmartFormsPanel';
import ModernAnalyticsDashboard from './ui/ModernAnalyticsDashboard';
import { parseMermaidToDiagram } from './utils/mermaid-interop';


interface FabricEditorProps {
  designId?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

// Complete self-contained styles - no external dependencies
const editorStyles = {
  root: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#1f2937',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    visibility: 'visible' as const,
    opacity: 1,
    transform: 'none',
    animation: 'none',
    transition: 'none'
  },
  header: {
    height: '64px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex !important' as any, // Override any global CSS
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    flexShrink: 0,
    position: 'relative' as const,
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: 1.5,
    visibility: 'visible !important' as any,
    opacity: '1 !important' as any,
    transform: 'none !important' as any
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: 1,
    userSelect: 'none' as const,
    outline: 'none',
    pointerEvents: 'auto' as const
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'white'
  },
  headerInput: {
    width: '100%',
    maxWidth: '300px',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    fontSize: '14px',
    textAlign: 'center' as const,
    fontFamily: 'inherit'
  },
  headerInputContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '400px'
  },
  headerStatus: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase' as const,
    fontWeight: 500
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: 'calc(100vh - 64px)'
  },
  sidebarContainer: {
    display: 'flex !important' as any, // Override any global CSS
    height: '100%',
    flexShrink: 0,
    backgroundColor: 'white',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
    visibility: 'visible !important' as any,
    opacity: '1 !important' as any,
    transform: 'none !important' as any,
    zIndex: 998
  },
  canvasArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    position: 'relative' as const,
    marginRight: 0
  },
  canvasMain: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    paddingRight: '24px'
  },
  propertiesPanel: {
    position: 'fixed' as const,
    right: 0,
    top: '64px',
    bottom: 0,
    width: '320px',
    backgroundColor: 'white',
    borderLeft: '1px solid #e2e8f0',
    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
    overflowY: 'auto' as const,
    visibility: 'visible !important' as any,
    opacity: '1 !important' as any,
    transform: 'none !important' as any
  },
  canvasAreaWithProperties: {
    marginRight: '320px'
  }
};

const FabricEditor: React.FC<FabricEditorProps> = ({ designId, showBackButton, onBack }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetObject?: fabric.Object;
  }>({ visible: false, x: 0, y: 0 });
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showCloudStorage, setShowCloudStorage] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [showSmartForms, setShowSmartForms] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showMermaidModal, setShowMermaidModal] = useState(false);
  const [mermaidMode] = useState<'import' | 'export'>('import');
  const [mermaidText, setMermaidText] = useState('');

  const {
    setDesignId,
    saveStatus,
    isEditing,
    showProperties,
    saveDesign,
    name,
    setName,
    setIsEditing,
    canvas
  } = useFabricCanvasStore();

  // Track selected objects for alignment toolbar
  useEffect(() => {
    if (!canvas) return;

    const updateSelectedObjects = () => {
      const activeObjects = canvas.getActiveObjects();
      setSelectedObjects(activeObjects);
    };

    const handleRightClick = (e: any) => {
      const target = e.target;
      if (target && !target.isConnectionPoint) {
        setContextMenu({
          visible: true,
          x: e.e.clientX,
          y: e.e.clientY,
          targetObject: target
        });
      }
    };

    // Enhanced connector management
    const handleObjectRemoved = (e: any) => {
      const removedObject = e.target;

      // If a connector is being removed, ensure all its parts are removed
      if (removedObject && (removedObject as any).isConnector) {
        console.log('Connector removed:', (removedObject as any).connectorData);
      }

      // If a flowchart node is being removed, remove connected connectors
      if (removedObject && (removedObject as any).nodeData) {
        const nodeId = (removedObject as any).nodeData.id;
        const objectsToRemove: fabric.Object[] = [];

        canvas.getObjects().forEach((obj: fabric.Object) => {
          if ((obj as any).isConnector && (obj as any).connectorData) {
            const connData = (obj as any).connectorData;
            if (connData.from === nodeId || connData.to === nodeId) {
              objectsToRemove.push(obj);
            }
          }
        });

        // Remove connected connectors
        objectsToRemove.forEach(obj => {
          canvas.remove(obj);
        });

        console.log(`Removed ${objectsToRemove.length} connectors for node ${nodeId}`);
      }
    };

    canvas.on('selection:created', updateSelectedObjects);
    canvas.on('selection:updated', updateSelectedObjects);
    canvas.on('selection:cleared', () => setSelectedObjects([]));
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('mouse:down', (e: any) => {
      if (e.e.button === 2) { // Right click
        handleRightClick(e);
      } else {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    });

    return () => {
      canvas.off('selection:created', updateSelectedObjects);
      canvas.off('selection:updated', updateSelectedObjects);
      canvas.off('selection:cleared');
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('mouse:down');
    };
  }, [canvas, setSelectedObjects, setContextMenu]);

  useEffect(() => {
    // Set the design id if provided
    if (designId) {
      setDesignId(designId);
    }

    // Ensure editing mode is enabled for proper UI visibility
    if (!isEditing) {
      setIsEditing(true);
    }

    setIsInitialized(true);

    // Add debug function to window for development
    if (typeof window !== 'undefined') {
      (window as any).debugFabricEditor = debugAllEditorComponents;
      (window as any).testSidebarButtons = testSidebarButtons;

      // Debug visibility after a short delay to ensure components are rendered
      setTimeout(() => {
        console.log('[FabricEditor] Components initialized, checking visibility...');
        debugAllEditorComponents();
        console.log('[FabricEditor] Testing sidebar button clickability...');
        testSidebarButtons();
      }, 1000);
    }
  }, [designId, setDesignId, isEditing, setIsEditing]);

  // Prevent rendering until initialized to avoid flashing
  if (!isInitialized) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        zIndex: 999999
      }}>
        <div>Loading editor...</div>
      </div>
    );
  }

  const handleSave = async () => {
    console.log('Saving design...');
    const success = await saveDesign();
    if (success) {
      console.log('Design saved successfully');
    } else {
      console.error('Failed to save design');
    }
  };

  // Export functionality now handled by AdvancedExportPanel

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      const { canvas } = useFabricCanvasStore.getState();
      if (canvas) {
        // Use the proper fabric-utils clear function
        const { clearCanvas } = require('./core/fabric-utils');
        clearCanvas(canvas);
        console.log('Canvas cleared');
      }
    }
  };

  const handleUndo = () => {
    const undoRedoManager = getUndoRedoManager();
    if (undoRedoManager && undoRedoManager.canUndo()) {
      undoRedoManager.undo();
    }
  };

  const handleRedo = () => {
    const undoRedoManager = getUndoRedoManager();
    if (undoRedoManager && undoRedoManager.canRedo()) {
      undoRedoManager.redo();
    }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  // Handler for import
  const handleMermaidImport = () => {
    try {
      parseMermaidToDiagram(mermaidText);
      alert('Import not yet implemented');
    } catch (e) {
      alert('Import not yet implemented');
    }
  };

  return (
    <div style={editorStyles.root}>
      {/* CSS Override to prevent global interference */}
      <style>
        {`
          /* Ensure fabric editor components are always visible */
          [data-testid="fabric-editor-header"],
          [data-testid="fabric-editor-sidebar"],
          [data-testid="fabric-editor-properties"],
          [data-testid="primary-sidebar"],
          [data-testid="content-panel"] {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: none !important;
          }

          /* Ensure sidebar buttons are clickable */
          [data-testid="primary-sidebar"] button,
          [data-testid^="sidebar-item"] {
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 1001 !important;
            position: relative !important;
          }

          /* Prevent icon interference with clicks */
          [data-testid="primary-sidebar"] button svg,
          [data-testid="primary-sidebar"] button div {
            pointer-events: none !important;
          }

          /* Override any print media queries for editor */
          @media print {
            [data-testid="fabric-editor-header"],
            [data-testid="fabric-editor-sidebar"],
            [data-testid="fabric-editor-properties"],
            [data-testid="primary-sidebar"],
            [data-testid="content-panel"] {
              display: flex !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
          }

          /* Prevent any animations or transitions from hiding elements */
          [data-testid^="fabric-editor"],
          [data-testid^="sidebar-item"] {
            animation: none !important;
            transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease !important;
          }

          /* Ensure proper scrolling in panels */
          [data-testid="content-panel"] {
            overflow: hidden !important;
          }

          /* Smooth sidebar transitions */
          [data-testid="fabric-editor-sidebar"] {
            transition: all 0.3s ease !important;
          }

          /* Ensure header buttons are clickable with proper cursor */
          [data-testid="fabric-editor-header"] button {
            cursor: pointer !important;
            pointer-events: auto !important;
          }

          /* Prevent icon interference with button clicks */
          [data-testid="fabric-editor-header"] button svg {
            pointer-events: none !important;
          }
        `}
      </style>

      {/* Header - Always visible with forced display */}
      <header style={editorStyles.header} data-testid="fabric-editor-header">
        {/* Left section */}
        <div style={editorStyles.headerSection}>
          {showBackButton && (
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  // Navigate back to document generator or previous page
                  try {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = '/app/documents';
                    }
                  } catch (e) {
                    window.location.href = '/app/documents';
                  }
                }
              }}
              style={editorStyles.headerButton}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              title="Back to Document Generator"
            >
              <ArrowLeft style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
            </button>
          )}

          <div style={editorStyles.headerTitle}>
            AuditReady Editor
          </div>

          {/* Save Status Indicator */}
          <button
            onClick={handleUndo}
            style={editorStyles.headerButton}
            title="Undo (Ctrl+Z)"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Undo style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={handleRedo}
            style={editorStyles.headerButton}
            title="Redo (Ctrl+Y)"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Redo style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={handleSave}
            style={editorStyles.headerButton}
            title={saveStatus === 'saving' ? 'Saving...' : 'Save'}
            disabled={saveStatus === 'saving'}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Save style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowSmartForms(true)}
            style={editorStyles.headerButton}
            title="Smart Forms"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <FileText style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowTemplateGallery(true)}
            style={editorStyles.headerButton}
            title="Template Gallery"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Layout style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowAdvancedExport(true)}
            style={editorStyles.headerButton}
            title="Advanced Export"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <FileDown style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowWorkflowAutomation(true)}
            style={editorStyles.headerButton}
            title="Workflow Automation"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Zap style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowAnalyticsDashboard(true)}
            style={editorStyles.headerButton}
            title="Analytics Dashboard"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <BarChart3 style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowCloudStorage(true)}
            style={editorStyles.headerButton}
            title="Cloud Storage"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Cloud style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowCollaboration(true)}
            style={editorStyles.headerButton}
            title="Collaboration"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Users style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            style={editorStyles.headerButton}
            title="Editor Settings"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Settings style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
          </button>

          <button
            onClick={handleClear}
            style={{
              ...editorStyles.headerButton,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}
            title="Clear Canvas"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 style={{ width: '20px', height: '20px', color: '#ef4444', pointerEvents: 'none' }} />
          </button>
        </div>

        {/* Center section - Design name */}
        <div style={editorStyles.headerInputContainer}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={editorStyles.headerInput}
            placeholder="Design name"
          />
        </div>

        {/* Right section */}
        <div style={editorStyles.headerSection}>
          <div style={editorStyles.headerStatus}>
            {isEditing ? 'Editing' : 'Viewing'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={editorStyles.main}>
        {/* Sidebar - Always render when editing with forced display */}
        {isEditing && (
          <div style={editorStyles.sidebarContainer} data-testid="fabric-editor-sidebar">
            <ModernSidebar />
          </div>
        )}

        {/* Canvas Area */}
        <div style={{
          ...editorStyles.canvasArea,
          ...(showProperties && isEditing ? editorStyles.canvasAreaWithProperties : {})
        }}>
          <main style={editorStyles.canvasMain}>
            <FabricCanvas />

            {/* Alignment Toolbar */}
            <AlignmentToolbar
              visible={selectedObjects.length >= 2}
              selectedObjects={selectedObjects}
            />
          </main>
        </div>
      </div>

      {/* Properties Panel */}
      {showProperties && isEditing && selectedObjects.length > 0 && (
        <div style={editorStyles.propertiesPanel} data-testid="fabric-editor-properties">
          <PropertiesPanel />
        </div>
      )}

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        targetObject={contextMenu.targetObject}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
      />

      {/* Smart Forms Panel */}
      <SmartFormsPanel
        visible={showSmartForms}
        onClose={() => setShowSmartForms(false)}
      />

      {/* Template Gallery Panel */}
      <TemplateGalleryPanel
        visible={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
      />

      {/* Advanced Export Panel */}
      <AdvancedExportPanel
        visible={showAdvancedExport}
        onClose={() => setShowAdvancedExport(false)}
      />

      {/* Workflow Automation Panel */}
      <WorkflowAutomationPanel
        visible={showWorkflowAutomation}
        onClose={() => setShowWorkflowAutomation(false)}
      />

      {/* Analytics Dashboard */}
      <ModernAnalyticsDashboard
        visible={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
      />

      {/* Cloud Storage Panel */}
      <CloudStoragePanel
        visible={showCloudStorage}
        onClose={() => setShowCloudStorage(false)}
      />

      {/* Collaboration Panel */}
      <CollaborationPanel
        visible={showCollaboration}
        onClose={() => setShowCollaboration(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Export Modal */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />

      {/* Mermaid Modal */}
      {showMermaidModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 16 }}>{mermaidMode === 'import' ? 'Import Mermaid Diagram' : 'Export Mermaid Diagram'}</h3>
            <textarea
              value={mermaidText}
              onChange={e => setMermaidText(e.target.value)}
              rows={10}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, marginBottom: 16 }}
              readOnly={mermaidMode === 'export'}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowMermaidModal(false)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#374151', fontWeight: 600 }}>Close</button>
              {mermaidMode === 'import' ? (
                <button onClick={handleMermaidImport} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: 'white', fontWeight: 600 }}>Import</button>
              ) : (
                <button onClick={() => { navigator.clipboard.writeText(mermaidText); }} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: 'white', fontWeight: 600 }}>Copy</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricEditor;