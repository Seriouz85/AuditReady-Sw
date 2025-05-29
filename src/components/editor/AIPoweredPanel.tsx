/**
 * AI-Powered Panel for Mermaid Editor
 * Natural language to diagram conversion and intelligent suggestions
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, Wand2, Lightbulb, Zap, Send, Sparkles,
  Target, TrendingUp, AlertTriangle, CheckCircle,
  Loader2, MessageSquare, Code, Palette
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  FadeInContainer,
  MermaidDesignTokens
} from '../ui';
import { MermaidAIService, AIGenerationRequest } from '../../services/ai/MermaidAIService';

interface AIPoweredPanelProps {
  onDiagramGenerated: (code: string) => void;
  currentDiagram: string;
  onDiagramOptimized: (code: string) => void;
}

export const AIPoweredPanel: React.FC<AIPoweredPanelProps> = ({
  onDiagramGenerated,
  currentDiagram,
  onDiagramOptimized
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastGeneration, setLastGeneration] = useState<any>(null);
  const [selectedContext, setSelectedContext] = useState<'audit' | 'risk' | 'compliance' | 'process' | 'organization'>('process');
  const [selectedComplexity, setSelectedComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');

  // Initialize AI service safely
  const aiService = useRef<MermaidAIService | null>(null);

  // Initialize AI service on first render
  useEffect(() => {
    try {
      aiService.current = MermaidAIService.getInstance();
      console.log('🧠 AIPoweredPanel AI service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error);
    }
  }, []);

  // Simple test to ensure component renders
  console.log('🧠 AIPoweredPanel rendering...');

  const contextOptions = [
    { value: 'audit', label: 'Audit', icon: <Target size={14} />, color: '#3b82f6' },
    { value: 'risk', label: 'Risk', icon: <AlertTriangle size={14} />, color: '#ef4444' },
    { value: 'compliance', label: 'Compliance', icon: <CheckCircle size={14} />, color: '#22c55e' },
    { value: 'process', label: 'Process', icon: <TrendingUp size={14} />, color: '#06b6d4' },
    { value: 'organization', label: 'Organization', icon: <MessageSquare size={14} />, color: '#8b5cf6' }
  ];

  const complexityOptions = [
    { value: 'simple', label: 'Simple', description: '3-5 elements' },
    { value: 'medium', label: 'Medium', description: '6-10 elements' },
    { value: 'complex', label: 'Complex', description: '10+ elements' }
  ];

  const quickPrompts = [
    {
      text: 'Create an audit process workflow',
      context: 'audit' as const,
      icon: <Target size={16} />
    },
    {
      text: 'Design a risk assessment matrix',
      context: 'risk' as const,
      icon: <AlertTriangle size={16} />
    },
    {
      text: 'Build a compliance timeline',
      context: 'compliance' as const,
      icon: <CheckCircle size={16} />
    },
    {
      text: 'Map organizational structure',
      context: 'organization' as const,
      icon: <MessageSquare size={16} />
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      if (!aiService.current) {
        throw new Error('AI service not initialized');
      }

      const request: AIGenerationRequest = {
        prompt,
        context: selectedContext,
        complexity: selectedComplexity,
        style: 'professional'
      };

      const result = await aiService.current.generateDiagram(request);
      setLastGeneration(result);
      setSuggestions(result.suggestions);
      onDiagramGenerated(result.mermaidCode);

      console.log('✅ AI diagram generated successfully');
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      // Fallback: generate a simple diagram
      const fallbackDiagram = `flowchart TD
    A[${prompt}] --> B[Process Step 1]
    B --> C[Process Step 2]
    C --> D[Result]`;
      onDiagramGenerated(fallbackDiagram);
      setSuggestions(['AI service unavailable, generated fallback diagram']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async (type: 'layout' | 'readability' | 'aesthetics') => {
    if (!currentDiagram.trim()) return;

    setIsOptimizing(true);
    try {
      if (!aiService.current) {
        throw new Error('AI service not initialized');
      }

      const optimized = await aiService.current.optimizeDiagram({
        currentCode: currentDiagram,
        optimizationType: type
      });

      onDiagramOptimized(optimized);
      console.log(`✅ Diagram optimized for ${type}`);
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      setSuggestions([`Optimization for ${type} failed. AI service unavailable.`]);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleQuickPrompt = (quickPrompt: typeof quickPrompts[0]) => {
    setPrompt(quickPrompt.text);
    setSelectedContext(quickPrompt.context);
  };

  const handleGetSuggestions = async () => {
    if (!currentDiagram.trim()) return;

    try {
      if (!aiService.current) {
        throw new Error('AI service not initialized');
      }

      const newSuggestions = await aiService.current.getSuggestions(currentDiagram);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('❌ Failed to get suggestions:', error);
      setSuggestions(['AI suggestions unavailable. Service not initialized.']);
    }
  };

  // Simple test render first
  try {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <Brain size={20} style={{ color: '#8b5cf6' }} />
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            color: '#f8fafc'
          }}>
            AI Diagram Generator
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your diagram in natural language..."
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              width: '100%',
              padding: '12px',
              background: isGenerating ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate Diagram
              </>
            )}
          </button>

          {/* Quick Prompts */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(248, 250, 252, 0.7)',
              marginBottom: '8px'
            }}>
              Quick Start:
            </div>
            {quickPrompts.map((quickPrompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(quickPrompt)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'rgba(248, 250, 252, 0.9)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {quickPrompt.icon}
                {quickPrompt.text}
              </button>
            ))}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(248, 250, 252, 0.7)',
                marginBottom: '8px'
              }}>
                💡 AI Suggestions:
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontSize: '12px',
                    color: 'rgba(248, 250, 252, 0.9)',
                    marginBottom: '4px'
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ AIPoweredPanel render error:', error);
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#f8fafc'
      }}>
        <h4>AI Panel Error</h4>
        <p>Failed to render AI panel. Check console for details.</p>
      </div>
    );
  }
};

export default AIPoweredPanel;
