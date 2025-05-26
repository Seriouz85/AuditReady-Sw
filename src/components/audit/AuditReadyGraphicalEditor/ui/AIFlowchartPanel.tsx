/**
 * AI Flowchart Panel - Inspired by YN's plugin architecture
 * Provides natural language to flowchart generation
 */

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Wand2, Zap, FileText, Settings, Download, RefreshCw, Sparkles } from 'lucide-react';
import { AIFlowchartGenerator, AIFlowchartRequest, FlowchartData } from '../ai/AIFlowchartGenerator';

interface AIFlowchartPanelProps {
  visible: boolean;
  onClose: () => void;
  canvas: fabric.Canvas | null;
}

const AIFlowchartPanel: React.FC<AIFlowchartPanelProps> = ({
  visible,
  onClose,
  canvas
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlowchart, setGeneratedFlowchart] = useState<FlowchartData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('audit-process');
  const [selectedStyle, setSelectedStyle] = useState<'simple' | 'detailed' | 'hierarchical'>('detailed');
  const [selectedFormat, setSelectedFormat] = useState<'horizontal' | 'vertical' | 'circular'>('vertical');
  const [aiGenerator, setAiGenerator] = useState<AIFlowchartGenerator | null>(null);

  useEffect(() => {
    if (canvas) {
      setAiGenerator(new AIFlowchartGenerator(canvas));
    }
  }, [canvas]);

  const promptTemplates = [
    {
      id: 'audit-process',
      name: 'Audit Process',
      description: 'Standard audit workflow from planning to reporting',
      prompt: 'Create an audit process flowchart showing the steps from planning through fieldwork to reporting'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Risk identification and management process',
      prompt: 'Generate a risk assessment flowchart including risk identification, analysis, evaluation, and mitigation'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Verification',
      description: 'Compliance framework verification process',
      prompt: 'Create a compliance verification flowchart for ISO 27001 including gap analysis and remediation'
    },
    {
      id: 'control-testing',
      name: 'Control Testing',
      description: 'Internal control testing workflow',
      prompt: 'Design a control testing flowchart showing design and operating effectiveness testing'
    },
    {
      id: 'incident-response',
      name: 'Incident Response',
      description: 'Security incident response process',
      prompt: 'Create an incident response flowchart from detection through resolution and lessons learned'
    }
  ];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
  };

  const handleGenerate = async () => {
    if (!aiGenerator || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const request: AIFlowchartRequest = {
        prompt: prompt.trim(),
        context: {
          auditType: 'internal',
          framework: 'ISO 27001',
          industry: 'technology'
        },
        style: selectedStyle,
        format: selectedFormat
      };

      const flowchartData = await aiGenerator.generateFromPrompt(request);
      setGeneratedFlowchart(flowchartData);
      
      // Render on canvas
      await aiGenerator.renderFlowchart(flowchartData);
      
      console.log('Flowchart generated successfully:', flowchartData.title);
    } catch (error) {
      console.error('Failed to generate flowchart:', error);
      alert('Failed to generate flowchart. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!generatedFlowchart || !aiGenerator) return;
    
    setIsGenerating(true);
    try {
      // Add refinement context to the prompt
      const refinedPrompt = `${prompt}\n\nPlease refine this flowchart with more detail and better organization.`;
      
      const request: AIFlowchartRequest = {
        prompt: refinedPrompt,
        context: {
          auditType: 'internal',
          framework: 'ISO 27001',
          industry: 'technology'
        },
        style: 'detailed',
        format: selectedFormat
      };

      const flowchartData = await aiGenerator.generateFromPrompt(request);
      setGeneratedFlowchart(flowchartData);
      await aiGenerator.renderFlowchart(flowchartData);
    } catch (error) {
      console.error('Failed to refine flowchart:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: '#3b82f6' }} />
            AI Flowchart Generator
          </h2>
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
            ×
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Generate professional flowcharts from natural language descriptions
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Quick Templates */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Quick Templates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {promptTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                style={{
                  padding: '12px',
                  border: selectedTemplate === template.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: selectedTemplate === template.id ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                  {template.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Custom Description
          </h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the process you want to visualize..."
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Style Options */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Style Options
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
              Detail Level
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="hierarchical">Hierarchical</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
              Layout Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              <option value="vertical">Vertical Flow</option>
              <option value="horizontal">Horizontal Flow</option>
              <option value="circular">Circular Layout</option>
            </select>
          </div>
        </div>

        {/* Generated Flowchart Info */}
        {generatedFlowchart && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#0369a1' }}>
              Generated: {generatedFlowchart.title}
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#0369a1' }}>
              {generatedFlowchart.description}
            </p>
            <div style={{ fontSize: '11px', color: '#0369a1' }}>
              <strong>Nodes:</strong> {generatedFlowchart.nodes.length} | 
              <strong> Category:</strong> {generatedFlowchart.category}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isGenerating ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate Flowchart
              </>
            )}
          </button>

          {generatedFlowchart && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRefine}
                disabled={isGenerating}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                Refine
              </button>
              <button
                onClick={() => {
                  // Export functionality would go here
                  console.log('Export flowchart');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AIFlowchartPanel;
