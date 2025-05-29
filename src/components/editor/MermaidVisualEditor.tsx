/**
 * Mermaid Visual Editor - Following Design Inspiration
 * Clean white & blue theme with left template panel
 * No visible code - pure visual interface
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft, Download, Palette,
  Undo, Redo, ZoomIn, ZoomOut,
  Brain, Sparkles, Plus, Search, X, Edit3, Eye,
  PanelLeftClose, PanelLeftOpen, Save, FolderOpen
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  AnimationProvider,
  FadeInContainer,
  MermaidDesignTokens
} from '../ui';
import { MermaidPreviewPane } from './MermaidPreviewPane';
import { InteractiveMermaidEditor } from './InteractiveMermaidEditor';
import { MermaidAIService } from '../../services/ai/MermaidAIService';
import { MermaidTemplatePanel } from './MermaidTemplatePanel';
import { SaveExportModal } from './SaveExportModal';
import { exportAsPng, exportAsJpg, exportAsSVG, exportAsPDF } from '../../services/export-service';
import { PREMIUM_TEMPLATES, getTemplatesByCategory, getPopularTemplates, searchTemplates } from '../../data/premiumTemplates';
import {
  generateUniqueProjectName,
  hasUnsavedChanges as checkUnsavedChanges,
  generateStateHash,
  autoAssignProjectName
} from '../../utils/projectUtils';

interface MermaidVisualEditorProps {
  designId?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

// Template categories from premium library
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', count: PREMIUM_TEMPLATES.length },
  { id: 'security', name: 'Security & Risk', count: getTemplatesByCategory('security').length },
  { id: 'compliance', name: 'Compliance & Audit', count: getTemplatesByCategory('compliance').length },
  { id: 'business', name: 'Business Process', count: getTemplatesByCategory('business').length },
  { id: 'technical', name: 'Technical Architecture', count: getTemplatesByCategory('technical').length },
  { id: 'project', name: 'Project Management', count: getTemplatesByCategory('project').length }
];

// Using premium template library

export const MermaidVisualEditor: React.FC<MermaidVisualEditorProps> = ({
  designId = 'visual-mermaid-editor',
  showBackButton = true,
  onBack
}) => {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [diagramText, setDiagramText] = useState(`flowchart TD
    A[Start Your Secure Design Journey] --> B[Select Template]
    B --> C[Customize Design]
    C --> D[Export & Share]

    style A fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style C fill:#60a5fa,stroke:#3b82f6,stroke-width:2px,color:#fff
    style D fill:#93c5fd,stroke:#60a5fa,stroke-width:2px,color:#fff`);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [showSaveExportModal, setShowSaveExportModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [canvasBackground, setCanvasBackground] = useState('#f8fafc');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');

  // Track changes and auto-assign project names
  React.useEffect(() => {
    const currentState = generateStateHash(diagramText, canvasBackground, reactFlowInstance?.toObject());
    const hasChanges = checkUnsavedChanges(currentState, lastSavedState, projectName);
    setHasUnsavedChanges(hasChanges);

    // Auto-assign project name if starting new project
    if (!projectName.trim() && diagramText.trim()) {
      const newName = autoAssignProjectName(projectName, diagramText, hasChanges);
      if (newName !== projectName) {
        setProjectName(newName);
      }
    }
  }, [diagramText, canvasBackground, reactFlowInstance, projectName, lastSavedState]);

  // Filter templates based on category and search using premium library
  const filteredTemplates = React.useMemo(() => {
    let templates = PREMIUM_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
      // If we have a category filter, apply it to search results
      if (selectedCategory !== 'all') {
        templates = templates.filter(t => t.category === selectedCategory);
      }
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  // Handle template selection - Convert Mermaid to React Flow nodes
  const handleTemplateSelect = useCallback((template: typeof PREMIUM_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setDiagramText(template.mermaidCode);
    setIsRendering(true);

    // For now, we'll trigger the interactive editor to update
    // In a full implementation, we'd parse the Mermaid code and convert to nodes/edges
    console.log('Loading template:', template.name);
    console.log('Mermaid code:', template.mermaidCode);

    setTimeout(() => setIsRendering(false), 500);
  }, []);

  // Handle AI generation
  const handleAIGenerate = useCallback(async (prompt: string) => {
    setIsRendering(true);
    try {
      const aiService = new MermaidAIService();
      const generatedCode = await aiService.generateDiagram(prompt);
      setDiagramText(generatedCode);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsRendering(false);
    }
  }, []);

  // Handle export with multiple formats
  const handleExport = useCallback(async (format: 'png' | 'jpg' | 'svg' | 'pdf' | 'mermaid') => {
    try {
      if (format === 'mermaid') {
        // Export Mermaid code
        const blob = new Blob([diagramText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.mmd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // Create a mock ReactFlow instance for export functions
      const mockReactFlowInstance = {
        getNodes: () => [],
        toObject: () => ({ nodes: [], edges: [] })
      } as any;

      const fileName = `mermaid-diagram-${Date.now()}`;

      switch (format) {
        case 'png':
          await exportAsPng(mockReactFlowInstance, fileName);
          break;
        case 'jpg':
          await exportAsJpg(mockReactFlowInstance, fileName);
          break;
        case 'svg':
          exportAsSVG(mockReactFlowInstance, fileName);
          break;
        case 'pdf':
          await exportAsPDF(mockReactFlowInstance, fileName);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [diagramText]);

  return (
    <AnimationProvider>
      <div style={{
        height: '100vh',
        width: '100vw',
        background: MermaidDesignTokens.colors.primary.gradient,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <GlassPanel variant="elevated" padding="4" style={{
          borderRadius: 0,
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px'
        }}>
          {/* Left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[4] }}>
            {showBackButton && (
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={onBack}
              >
                Back
              </GlassButton>
            )}

            <div>
              <h1 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xl,
                fontWeight: MermaidDesignTokens.typography.fontWeight.bold,
                color: MermaidDesignTokens.colors.text.primary,
                margin: 0
              }}>
                AI Security Architect
              </h1>
              <p style={{
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                color: MermaidDesignTokens.colors.text.secondary,
                margin: 0
              }}>
                Leverage AI to visualize your security posture
              </p>
            </div>
          </div>

          {/* Center - Title */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
              color: MermaidDesignTokens.colors.text.primary,
              margin: 0
            }}>
              Visual Process Designer
            </h2>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<FolderOpen size={16} />}
              onClick={() => setShowSaveExportModal(true)}
              title="Open Project"
            >
              Open
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={() => setShowSaveExportModal(true)}
              title="Save & Export Project"
            >
              Save
            </GlassButton>
          </div>
        </GlassPanel>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Reopen Sidebar Button - Only visible when sidebar is hidden */}
          {!showLeftPanel && (
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001
            }}>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<PanelLeftOpen size={16} />}
                onClick={() => setShowLeftPanel(true)}
                title="Show Sidebar Panel"
                style={{
                  background: MermaidDesignTokens.colors.glass.secondary,
                  border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: MermaidDesignTokens.shadows.glass.md
                }}
              />
            </div>
          )}

          {/* Left Template Panel - Conditionally Visible */}
          <MermaidTemplatePanel
            isVisible={showLeftPanel}
            onHide={() => setShowLeftPanel(false)}
            onTemplateSelect={(template) => {
              setSelectedTemplate(template.id);
              setDiagramText(template.code);
              setIsRendering(true);
              setTimeout(() => setIsRendering(false), 300);
            }}
          />

          {/* Main Canvas Area - Interactive Only */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <InteractiveMermaidEditor
              onMermaidCodeChange={(code) => {
                setDiagramText(code);
                setIsRendering(true);
                setTimeout(() => setIsRendering(false), 300);
              }}
              onReactFlowInstanceChange={setReactFlowInstance}
              canvasBackground={canvasBackground}
              onCanvasBackgroundChange={setCanvasBackground}
            />
          </div>
        </div>

        {/* Save & Export Modal */}
        <SaveExportModal
          isVisible={showSaveExportModal}
          onClose={() => setShowSaveExportModal(false)}
          diagramText={diagramText}
          projectName={projectName}
          canvasBackground={canvasBackground}
          onProjectNameChange={setProjectName}
          onProjectSaved={(savedProjectName) => {
            // Update last saved state when project is saved
            const currentState = generateStateHash(diagramText, canvasBackground, reactFlowInstance?.toObject());
            setLastSavedState(currentState);
            setHasUnsavedChanges(false);
          }}
          onProjectLoad={(loadedDiagramText, loadedCanvasBackground, flowData) => {
            console.log('Loading diagram text:', loadedDiagramText);
            console.log('Loading canvas background:', loadedCanvasBackground);
            console.log('Loading flow data:', flowData);

            setDiagramText(loadedDiagramText);
            if (loadedCanvasBackground) {
              setCanvasBackground(loadedCanvasBackground);
            }

            // If we have flow data, restore the complete React Flow state
            if (flowData && reactFlowInstance) {
              console.log('Restoring React Flow state...');
              try {
                // Restore the complete flow state including nodes, edges, and viewport
                reactFlowInstance.setNodes(flowData.nodes || []);
                reactFlowInstance.setEdges(flowData.edges || []);
                if (flowData.viewport) {
                  reactFlowInstance.setViewport(flowData.viewport);
                }
                console.log('React Flow state restored successfully');
              } catch (error) {
                console.error('Error restoring React Flow state:', error);
              }
            }

            // Trigger re-rendering
            setIsRendering(true);
            setTimeout(() => setIsRendering(false), 300);
          }}
          reactFlowInstance={reactFlowInstance}
        />
      </div>
    </AnimationProvider>
  );
};

export default MermaidVisualEditor;
