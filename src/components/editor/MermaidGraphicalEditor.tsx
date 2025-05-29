/**
 * AuditReady Mermaid Editor - OFFICIAL MERMAID LIVE EDITOR APPROACH
 * Following official Mermaid Live Editor: https://mermaid.live/
 *
 * ARCHITECTURE PRINCIPLES (from official Mermaid Live Editor):
 * ✅ Text-first editing with Monaco Editor
 * ✅ Simple split-pane layout (code | preview)
 * ✅ Pure Mermaid.js rendering without custom overlays
 * ✅ Template system based on Mermaid code snippets
 * ✅ Lightweight, professional design
 * ✅ AI integration for code generation
 *
 * REMOVED ANTI-PATTERNS:
 * ❌ Visual drag-and-drop editing
 * ❌ Complex custom services and overlays
 * ❌ Fabric.js integration
 * ❌ Visual element manipulation
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft, Download, Settings, Palette,
  Undo, Redo, ZoomIn, ZoomOut,
  Brain, Sparkles, Code, Eye, SplitSquareHorizontal,
  Play, Copy, FileText, Grid3X3, Layers
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  AnimationProvider,
  FadeInContainer,
  MermaidDesignTokens
} from '../../components/ui';
import { MermaidCodeEditor } from './MermaidCodeEditor';
import { MermaidPreviewPane } from './MermaidPreviewPane';
import { MermaidTemplatePanel } from './MermaidTemplatePanel';
import { MermaidAIService } from '../../services/ai/MermaidAIService';

interface MermaidGraphicalEditorProps {
  designId?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

type ViewMode = 'split' | 'code' | 'preview';

export const MermaidGraphicalEditor: React.FC<MermaidGraphicalEditorProps> = ({
  designId = 'mermaid-editor',
  showBackButton = true,
  onBack
}) => {
  // Core State Management - Following Official Mermaid Live Editor
  const [isInitialized, setIsInitialized] = useState(true); // Simplified initialization
  const [diagramText, setDiagramText] = useState(`flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E[Findings Analysis]
    E --> F[Report Generation]
    F --> G[Management Review]
    G --> H[Action Plan]`);

  // Editor State - Simplified following official patterns
  const [isRendering, setIsRendering] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [zoom, setZoom] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // History Management - Simplified
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI Integration State
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Refs - Simplified
  const aiService = useRef<MermaidAIService | null>(null);

  // Initialize AI service - Simplified following official patterns
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing Mermaid Editor (Official Pattern)...');

        // Initialize AI service
        aiService.current = MermaidAIService.getInstance();

        // Add initial diagram to history
        addToHistory(diagramText);

        console.log('✅ Mermaid Editor initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  // Simplified handlers following official Mermaid Live Editor patterns
  const handleRender = () => {
    setIsRendering(true);
    // Rendering is handled by the preview pane component
    setTimeout(() => setIsRendering(false), 500);
  };

  const handleDiagramTextChange = (text: string) => {
    setDiagramText(text);
    // Auto-save to history after a delay
    setTimeout(() => {
      if (text !== canvasHistory[historyIndex]) {
        addToHistory(text);
      }
    }, 1000);
  };

  // AI Generation Handler
  const handleAIGenerate = async (prompt: string) => {
    if (!aiService.current) return;

    setIsAIGenerating(true);
    try {
      console.log('🤖 Generating diagram from AI prompt:', prompt);

      const response = await aiService.current.generateDiagram({
        prompt,
        diagramType: 'flowchart',
        complexity: 'medium',
        includeParallelPaths: true,
        industry: 'audit'
      });

      console.log('✅ AI diagram generated successfully');
      setDiagramText(response.mermaidCode);
      addToHistory(response.mermaidCode);
    } catch (error) {
      console.error('❌ AI generation failed:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Template Selection Handler
  const handleTemplateSelect = (template: any) => {
    setDiagramText(template.code);
    addToHistory(template.code);
    setShowTemplates(false);
    console.log('✅ Template applied:', template.name);
  };

  // Export Handler
  const handleExport = async (format: 'svg' | 'png' | 'pdf') => {
    console.log(`📤 Exporting diagram as ${format.toUpperCase()}`);
    // Export functionality will be handled by the preview pane
  };

  // History handlers - Simplified
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDiagramText(canvasHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDiagramText(canvasHistory[newIndex]);
    }
  };

  const addToHistory = (text: string) => {
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(text);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Back navigation handler
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior
      try {
        const referrer = document.referrer;
        if (referrer && referrer.includes('/app/documents')) {
          window.history.back();
        } else {
          window.location.href = '/app';
        }
      } catch (e) {
        window.location.href = '/app';
      }
    }
  };

  // Editor styles following official Mermaid Live Editor
  const editorStyles: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    background: MermaidDesignTokens.colors.secondary.gradient,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: MermaidDesignTokens.typography.fontFamily.sans,
    color: MermaidDesignTokens.colors.text.primary,
    overflow: 'hidden'
  };

  const headerStyles: React.CSSProperties = {
    height: '4rem',
    background: MermaidDesignTokens.colors.primary.gradient,
    backdropFilter: MermaidDesignTokens.backdropBlur.lg,
    borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    padding: `0 ${MermaidDesignTokens.spacing[6]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: MermaidDesignTokens.shadows.glass.lg
  };

  const mainStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  };

  if (!isInitialized) {
    return (
      <div style={editorStyles}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: MermaidDesignTokens.typography.fontSize.lg,
          color: MermaidDesignTokens.colors.text.secondary
        }}>
          🚀 Initializing Mermaid Editor...
        </div>
      </div>
    );
  }

  return (
    <AnimationProvider>
      <div style={editorStyles}>
        {/* Header - Following Official Mermaid Live Editor */}
        <FadeInContainer style={headerStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[4] }}>
            {showBackButton && (
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={handleBack}
              >
                Back
              </GlassButton>
            )}
            <h1 style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xl,
              fontWeight: MermaidDesignTokens.typography.fontWeight.bold,
              margin: 0
            }}>
              AuditReady Mermaid Editor
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: MermaidDesignTokens.borderRadius.lg,
              padding: MermaidDesignTokens.spacing[1]
            }}>
              <GlassButton
                variant={viewMode === 'code' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Code size={16} />}
                onClick={() => setViewMode('code')}
                title="Code Only"
              />
              <GlassButton
                variant={viewMode === 'split' ? 'primary' : 'ghost'}
                size="sm"
                icon={<SplitSquareHorizontal size={16} />}
                onClick={() => setViewMode('split')}
                title="Split View"
              />
              <GlassButton
                variant={viewMode === 'preview' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Eye size={16} />}
                onClick={() => setViewMode('preview')}
                title="Preview Only"
              />
            </div>

            <div style={{
              width: '1px',
              height: '24px',
              background: MermaidDesignTokens.colors.glass.border,
              margin: `0 ${MermaidDesignTokens.spacing[2]}`
            }} />

            <GlassButton
              variant={showTemplates ? 'primary' : 'secondary'}
              size="sm"
              icon={<Layers size={16} />}
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Templates
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Settings size={16} />}
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </GlassButton>
          </div>
        </FadeInContainer>

        {/* Main Content - Split Pane Layout Following Official Mermaid Live Editor */}
        <div style={mainStyles}>
          {/* Code Editor */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div style={{
              width: viewMode === 'split' ? '50%' : '100%',
              borderRight: viewMode === 'split' ? `1px solid ${MermaidDesignTokens.colors.glass.border}` : 'none'
            }}>
              <MermaidCodeEditor
                diagramText={diagramText}
                onDiagramTextChange={handleDiagramTextChange}
                onRender={handleRender}
                isRendering={isRendering}
                onAIGenerate={handleAIGenerate}
                onExport={handleExport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < canvasHistory.length - 1}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div style={{
              width: viewMode === 'split' ? '50%' : '100%'
            }}>
              <MermaidPreviewPane
                diagramText={diagramText}
                isRendering={isRendering}
                onExport={handleExport}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </div>
          )}

          {/* Template Panel */}
          <MermaidTemplatePanel
            onTemplateSelect={handleTemplateSelect}
            isVisible={showTemplates}
            onHide={() => setShowTemplates(false)}
          />
        </div>
      </div>
    </AnimationProvider>
  );
};

export default MermaidGraphicalEditor;
