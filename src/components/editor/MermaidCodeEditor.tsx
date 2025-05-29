/**
 * Mermaid Code Editor - Following Official Mermaid Live Editor
 * Monaco Editor with Mermaid syntax highlighting and intelligent features
 */

import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { GlassButton, GlassPanel, GlassInput, MermaidDesignTokens } from '../ui';
import {
  Play, Copy, Download, FileText, Undo, Redo,
  Brain, Sparkles, RotateCcw, Save, Settings
} from 'lucide-react';

interface MermaidCodeEditorProps {
  diagramText: string;
  onDiagramTextChange: (text: string) => void;
  onRender: () => void;
  isRendering?: boolean;
  onAIGenerate?: (prompt: string) => void;
  onExport?: (format: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// Mermaid templates following official patterns
const MERMAID_TEMPLATES = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E`,

  sequence: `sequenceDiagram
    participant A as User
    participant B as System
    participant C as Database

    A->>B: Request
    B->>C: Query
    C-->>B: Response
    B-->>A: Result`,

  audit: `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E[Findings Analysis]
    E --> F[Report Generation]
    F --> G[Management Review]
    G --> H[Action Plan]`,

  gitgraph: `gitgraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,

  gantt: `gantt
    title Audit Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Risk Assessment    :done, des1, 2024-01-01, 2024-01-05
    Audit Plan        :done, des2, after des1, 5d
    section Execution
    Control Testing   :active, des3, after des2, 10d
    Evidence Review   :des4, after des3, 7d
    section Reporting
    Draft Report      :des5, after des4, 5d
    Final Report      :des6, after des5, 3d`
};

export const MermaidCodeEditor: React.FC<MermaidCodeEditorProps> = ({
  diagramText,
  onDiagramTextChange,
  onRender,
  isRendering = false,
  onAIGenerate,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const editorRef = useRef<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Monaco Editor configuration following official Mermaid Live Editor
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: MermaidDesignTokens.typography.fontFamily.mono,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on' as const,
    theme: 'mermaid-dark',
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    }
  };

  // Setup Monaco Editor with Mermaid language support
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Register Mermaid language
    monaco.languages.register({ id: 'mermaid' });

    // Define Mermaid syntax highlighting
    monaco.languages.setMonarchTokensProvider('mermaid', {
      tokenizer: {
        root: [
          [/flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitgraph/, 'keyword'],
          [/TD|TB|BT|RL|LR/, 'keyword'],
          [/participant|actor|note|loop|alt|opt|par/, 'keyword'],
          [/-->|->|-->>|->>|--x|-x|==|\.\./, 'operator'],
          [/\[.*?\]|\(.*?\)|\{.*?\}|>.*?]/, 'string'],
          [/%%.*$/, 'comment'],
          [/".*?"/, 'string'],
          [/\d+/, 'number']
        ]
      }
    });

    // Define Mermaid dark theme
    monaco.editor.defineTheme('mermaid-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'number', foreground: 'b5cea8' }
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f8fafc',
        'editorLineNumber.foreground': '#64748b',
        'editor.selectionBackground': '#3b82f630',
        'editor.lineHighlightBackground': '#1e293b30'
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRender();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e: any) => {
      e.preventDefault();
      onRender();
    });
  };

  // Insert template
  const insertTemplate = (template: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const range = selection || {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      };

      editor.executeEdits('insert-template', [{
        range,
        text: template
      }]);

      onDiagramTextChange(template);
      editor.focus();
    }
  };

  // Handle AI generation
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !onAIGenerate) return;

    setIsAIGenerating(true);
    try {
      await onAIGenerate(aiPrompt.trim());
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Copy diagram text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagramText);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: MermaidDesignTokens.colors.secondary.gradient,
      borderRadius: MermaidDesignTokens.borderRadius.xl,
      overflow: 'hidden'
    }}>
      {/* Editor Toolbar */}
      <GlassPanel variant="elevated" padding="2" style={{
        borderRadius: 0,
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: MermaidDesignTokens.spacing[2]
      }}>
        {/* Left side - Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Play size={16} />}
            onClick={onRender}
            disabled={isRendering}
            glow
          >
            {isRendering ? 'Rendering...' : 'Render'}
          </GlassButton>

          <div style={{
            width: '1px',
            height: '24px',
            background: MermaidDesignTokens.colors.glass.border
          }} />

          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Undo size={16} />}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          />
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Redo size={16} />}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          />

          <div style={{
            width: '1px',
            height: '24px',
            background: MermaidDesignTokens.colors.glass.border
          }} />

          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Copy size={16} />}
            onClick={handleCopy}
            title="Copy to Clipboard"
          />
        </div>

        {/* Right side - AI and Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
          {onAIGenerate && (
            <>
              <GlassInput
                placeholder="Describe your diagram..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ width: '200px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && aiPrompt.trim()) {
                    handleAIGenerate();
                  }
                }}
              />
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<Brain size={16} />}
                onClick={handleAIGenerate}
                disabled={isAIGenerating || !aiPrompt.trim()}
              >
                {isAIGenerating ? 'Generating...' : 'AI'}
              </GlassButton>
            </>
          )}

          {onExport && (
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<Download size={16} />}
              onClick={() => onExport('png')}
              title="Export Diagram"
            />
          )}
        </div>
      </GlassPanel>

      {/* Quick Templates */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: MermaidDesignTokens.spacing[2],
        padding: MermaidDesignTokens.spacing[2],
        background: 'rgba(0, 0, 0, 0.2)',
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
      }}>
        <span style={{
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          color: MermaidDesignTokens.colors.text.secondary
        }}>
          Quick Start:
        </span>
        {Object.entries(MERMAID_TEMPLATES).map(([key, template]) => (
          <GlassButton
            key={key}
            variant="ghost"
            size="sm"
            onClick={() => insertTemplate(template)}
            style={{ textTransform: 'capitalize' }}
          >
            {key}
          </GlassButton>
        ))}
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="mermaid"
          value={diagramText}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={(value) => onDiagramTextChange(value || '')}
          theme="mermaid-dark"
        />
      </div>
    </div>
  );
};

export default MermaidCodeEditor;
