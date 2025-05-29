/**
 * Mermaid Text Editor - Following Official Mermaid Live Editor Approach
 * Pure text-based editing with Monaco Editor
 * NO visual editing - this is the correct Mermaid approach
 */

import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { GlassButton } from '../ui/glassmorphic/GlassButton';
import {
  Play, Copy, Download, FileText, Zap, Brain,
  Sparkles, RotateCcw, Save, Eye, Code
} from 'lucide-react';

interface MermaidTextEditorProps {
  diagramText: string;
  onDiagramTextChange: (text: string) => void;
  onRender: () => void;
  isRendering?: boolean;
  onAIGenerate?: (prompt: string) => void;
  onExport?: (format: string) => void;
}

export const MermaidTextEditor: React.FC<MermaidTextEditorProps> = ({
  diagramText,
  onDiagramTextChange,
  onRender,
  isRendering = false,
  onAIGenerate,
  onExport
}) => {
  const editorRef = useRef<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Monaco Editor configuration
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    theme: 'vs-dark',
    wordWrap: 'on' as const,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line' as const,
    selectOnLineNumbers: true,
    bracketPairColorization: {
      enabled: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Register Mermaid language
    monaco.languages.register({ id: 'mermaid' });

    // Define Mermaid syntax highlighting
    monaco.languages.setMonarchTokensProvider('mermaid', {
      tokenizer: {
        root: [
          [/flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|gantt|pie/, 'keyword'],
          [/TD|TB|BT|RL|LR/, 'keyword'],
          [/-->|---/, 'operator'],
          [/\[.*?\]/, 'string'],
          [/\(.*?\)/, 'string'],
          [/\{.*?\}/, 'string'],
          [/\|.*?\|/, 'string'],
          [/%%.*$/, 'comment'],
          [/[A-Z][A-Z0-9]*/, 'variable'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string']
        ]
      }
    });

    // Define theme colors
    monaco.editor.defineTheme('mermaid-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#569cd6', fontStyle: 'bold' },
        { token: 'operator', foreground: '#d4d4d4' },
        { token: 'string', foreground: '#ce9178' },
        { token: 'variable', foreground: '#9cdcfe' },
        { token: 'comment', foreground: '#6a9955', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4'
      }
    });

    // Set the theme
    monaco.editor.setTheme('mermaid-dark');

    // Set language
    monaco.editor.setModelLanguage(editor.getModel(), 'mermaid');

    // Auto-render on text change with debounce
    let timeout: NodeJS.Timeout;
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onDiagramTextChange(value);

      // Auto-render with debounce
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onRender();
      }, 1000);
    });

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRender();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality
      console.log('Save triggered');
    });
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

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagramText);
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Insert template
  const insertTemplate = (template: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits('insert-template', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: template
      }]);
      editor.focus();
    }
  };

  // Quick templates
  const templates = {
    flowchart: `flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F[End]
    E --> F`,

    sequence: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response`,

    audit: `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E{Findings?}
    E -->|Yes| F[Document Issues]
    E -->|No| G[Validate Controls]
    F --> H[Management Response]
    G --> I[Final Report]
    H --> I`
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
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

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Copy size={16} />}
            onClick={handleCopy}
          >
            Copy
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => onExport?.('png')}
          >
            Export
          </GlassButton>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Describe your diagram..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && aiPrompt.trim()) {
                handleAIGenerate();
              }
            }}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-64"
          />
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Brain size={16} />}
            onClick={handleAIGenerate}
            disabled={isAIGenerating || !aiPrompt.trim()}
          >
            {isAIGenerating ? 'Generating...' : 'AI Create'}
          </GlassButton>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">Quick Start:</span>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => insertTemplate(templates.flowchart)}
        >
          Flowchart
        </GlassButton>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => insertTemplate(templates.sequence)}
        >
          Sequence
        </GlassButton>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => insertTemplate(templates.audit)}
        >
          Audit Process
        </GlassButton>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="mermaid"
          value={diagramText}
          options={editorOptions}
          onMount={handleEditorDidMount}
          theme="mermaid-dark"
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div>
          Lines: {diagramText.split('\n').length} |
          Characters: {diagramText.length}
        </div>
        <div>
          Ctrl+Enter to render | Ctrl+S to save
        </div>
      </div>
    </div>
  );
};
