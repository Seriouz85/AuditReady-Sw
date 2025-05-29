/**
 * Mermaid Editor - CORRECT IMPLEMENTATION
 * Following official Mermaid Live Editor approach: https://mermaid.live/
 *
 * KEY INSIGHT: Mermaid.js is TEXT-BASED ONLY
 * - No drag and drop (not supported by Mermaid)
 * - No visual node editing (not supported by Mermaid)
 * - Text editor + diagram viewer (like official editor)
 */

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Eye, Code, SplitSquareHorizontal } from 'lucide-react';

import { GlassButton } from '../ui/glassmorphic/GlassButton';
import { MermaidTextEditor } from './MermaidTextEditor';
import { MermaidViewer } from './MermaidViewer';
import { DiagramAIService } from '../../services/ai/DiagramAIService';

interface MermaidEditorProps {
  onBack?: () => void;
  initialDiagram?: string;
}

type ViewMode = 'split' | 'code' | 'preview';

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  onBack,
  initialDiagram = `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E{Findings?}
    E -->|Yes| F[Document Issues]
    E -->|No| G[Validate Controls]
    F --> H[Management Response]
    G --> I[Final Report]
    H --> I`
}) => {
  const [diagramText, setDiagramText] = useState(initialDiagram);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isRendering, setIsRendering] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Handle diagram text changes
  const handleDiagramTextChange = useCallback((text: string) => {
    setDiagramText(text);
  }, []);

  // Handle manual render trigger
  const handleRender = useCallback(() => {
    setIsRendering(true);
    // The MermaidViewer will handle the actual rendering
    setTimeout(() => setIsRendering(false), 500);
  }, []);

  // Handle AI generation
  const handleAIGenerate = useCallback(async (prompt: string) => {
    setIsAIGenerating(true);
    try {
      const aiService = DiagramAIService.getInstance();
      const generatedDiagram = await aiService.generateDiagram(prompt, 'flowchart');

      if (generatedDiagram) {
        setDiagramText(generatedDiagram);
        handleRender();
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setIsAIGenerating(false);
    }
  }, [handleRender]);

  // Handle export
  const handleExport = useCallback((format: string) => {
    console.log(`Exporting as ${format}`);
    // Export functionality is handled by MermaidViewer
  }, []);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </GlassButton>

          <h1 className="text-xl font-semibold text-white">
            Mermaid Diagram Editor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant={viewMode === 'code' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Code size={16} />}
            onClick={() => setViewMode('code')}
          >
            Code
          </GlassButton>

          <GlassButton
            variant={viewMode === 'split' ? 'primary' : 'secondary'}
            size="sm"
            icon={<SplitSquareHorizontal size={16} />}
            onClick={() => setViewMode('split')}
          >
            Split
          </GlassButton>

          <GlassButton
            variant={viewMode === 'preview' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </GlassButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Code Editor */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
            <MermaidTextEditor
              diagramText={diagramText}
              onDiagramTextChange={handleDiagramTextChange}
              onRender={handleRender}
              isRendering={isRendering}
              onAIGenerate={handleAIGenerate}
              onExport={handleExport}
            />
          </div>
        )}

        {/* Diagram Viewer */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <MermaidViewer
              diagramText={diagramText}
              isRendering={isRendering}
              onExport={handleExport}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Mode: {viewMode}</span>
          <span>Lines: {diagramText.split('\n').length}</span>
          <span>Characters: {diagramText.length}</span>
        </div>

        <div className="flex items-center gap-4">
          {isAIGenerating && (
            <span className="text-blue-400">🤖 AI Generating...</span>
          )}
          {isRendering && (
            <span className="text-green-400">🔄 Rendering...</span>
          )}
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};

// Export as default for easy replacement
export default MermaidEditor;
