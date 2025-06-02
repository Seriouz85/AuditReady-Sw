/**
 * Conversational AI Panel for Left Sidebar
 * Provides enhanced AI interaction for IT security professionals
 * Focus on enterprise-grade process flows and security diagrams
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, Sparkles, MessageCircle, Clock, 
  RotateCcw, BookOpen, Shield, AlertTriangle,
  CheckCircle, PanelLeftClose, ArrowUp, ArrowDown
} from 'lucide-react';
import { GlassButton, GlassPanel, GlassInput, MermaidDesignTokens } from '../ui';
import { EnhancedMermaidAI } from '../../services/ai/EnhancedMermaidAI';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  diagramCode?: string;
}

interface ConversationalAIProps {
  isVisible: boolean;
  onHide?: () => void;
  onDiagramGenerate?: (code: string) => void;
  onReactFlowGenerate?: (nodes: any[], edges: any[]) => void;
  onReactFlowAdd?: (nodes: any[], edges: any[]) => void; // New: additive mode
  currentNodes?: any[]; // Current nodes in the editor
  currentEdges?: any[]; // Current edges in the editor
  showHeader?: boolean;
}

export const ConversationalAI: React.FC<ConversationalAIProps> = ({
  isVisible,
  onHide,
  onDiagramGenerate,
  onReactFlowGenerate,
  onReactFlowAdd,
  currentNodes = [],
  currentEdges = [],
  showHeader = true
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to AI Security Architect! I specialize in creating professional process flows for IT security and compliance. Ask me to create audit workflows, risk assessment diagrams, incident response procedures, or any security-related processes.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested prompts for IT security professionals
  const securityPrompts = [
    "Create an incident response workflow with escalation procedures",
    "Design a comprehensive vulnerability assessment process",
    "Build a compliance audit checklist flow for SOC 2",
    "Map out access control procedures with multi-factor authentication",
    "Create a data breach response plan with notification timelines",
    "Design security awareness training workflow for employees",
    "Generate risk assessment matrix with probability and impact scoring",
    "Create information classification process with data labeling",
    "Design yearly security planning process with quarterly reviews"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const aiService = EnhancedMermaidAI.getInstance();
      
      // Check if user wants to add to existing diagram
      const isAddToExisting = currentNodes.length > 0 && isAdditiveRequest(userMessage.content);
      
      if (isAddToExisting) {
        // Set current diagram context for additive operations
        aiService.setCurrentDiagramFromNodes(currentNodes, currentEdges);
      }
      
      const response = await aiService.generateProcessFlow(userMessage.content);
      
      // Create AI response message
      const isAdditive = isAddToExisting && response.isAdditive;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: isAdditive 
          ? `I've added ${response.steps.length} new steps to your existing process flow. The additions integrate seamlessly with your current diagram and maintain the ${response.theme} styling.`
          : `I've created a ${response.title} for you. This diagram includes ${response.steps.length} key steps in the process. The diagram shows ${response.theme} styling and follows ${response.layout} layout. You can modify any part of it or ask me to adjust specific aspects.`,
        timestamp: new Date(),
        diagramCode: response.mermaidCode
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Convert to React Flow format and apply to canvas
      if (isAdditive && onReactFlowAdd) {
        // Use additive mode to preserve existing nodes
        const { nodes, edges } = convertToReactFlow(response);
        onReactFlowAdd(nodes, edges);
      } else if (onReactFlowGenerate) {
        // Replace entire diagram
        const { nodes, edges } = convertToReactFlow(response);
        onReactFlowGenerate(nodes, edges);
      }
      
      // Also generate mermaid code for export purposes
      if (onDiagramGenerate) {
        onDiagramGenerate(response.mermaidCode);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an issue generating your diagram. Could you please rephrase your request or be more specific about the process you want to visualize?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptClick = async (prompt: string) => {
    setInputValue(prompt);
    
    // Automatically send the prompt for better UX
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const aiService = EnhancedMermaidAI.getInstance();
      
      // Check if user wants to add to existing diagram
      const isAddToExisting = currentNodes.length > 0 && isAdditiveRequest(prompt);
      
      if (isAddToExisting) {
        // Set current diagram context for additive operations
        aiService.setCurrentDiagramFromNodes(currentNodes, currentEdges);
      }
      
      const response = await aiService.generateProcessFlow(prompt);
      
      // Create AI response message
      const isAdditive = isAddToExisting && response.isAdditive;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: isAdditive 
          ? `I've added ${response.steps.length} new steps to your existing process flow. The additions integrate seamlessly with your current diagram and maintain the ${response.theme} styling.`
          : `I've created a ${response.title} for you. This diagram includes ${response.steps.length} key steps in the process. The diagram shows ${response.theme} styling and follows ${response.layout} layout. You can modify any part of it or ask me to adjust specific aspects.`,
        timestamp: new Date(),
        diagramCode: response.mermaidCode
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Convert to React Flow format and apply to canvas
      if (isAdditive && onReactFlowAdd) {
        // Use additive mode to preserve existing nodes
        const { nodes, edges } = convertToReactFlow(response);
        onReactFlowAdd(nodes, edges);
      } else if (onReactFlowGenerate) {
        // Replace entire diagram
        const { nodes, edges } = convertToReactFlow(response);
        onReactFlowGenerate(nodes, edges);
      }
      
      // Also generate mermaid code for export purposes
      if (onDiagramGenerate) {
        onDiagramGenerate(response.mermaidCode);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an issue generating your diagram. Could you please try again or rephrase your request?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'system',
        content: 'Conversation cleared. How can I help you create your next security process diagram?',
        timestamp: new Date()
      }
    ]);
  };

  // Helper function to detect if the request is asking to add to existing diagram
  const isAdditiveRequest = (prompt: string): boolean => {
    const addKeywords = [
      'add', 'append', 'extend', 'continue', 'also add', 'then add', 'include',
      'insert', 'attach', 'connect', 'link', 'follow up', 'next step',
      'additional', 'plus', 'and then', 'after that', 'furthermore',
      'expand', 'enhance', 'supplement', 'augment'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return addKeywords.some(keyword => lowerPrompt.includes(keyword));
  };

  // Convert AI ProcessSteps to React Flow nodes and edges
  const convertToReactFlow = (response: any) => {
    const nodes = response.steps.map((step: any) => {
      // Determine shape based on step type
      let shape = 'rectangle';
      let fillColor = '#f8fafc';
      let strokeColor = '#2563eb';

      switch (step.type) {
        case 'start':
        case 'end':
          shape = 'circle';
          fillColor = step.type === 'start' ? '#dbeafe' : '#dcfce7';
          strokeColor = step.type === 'start' ? '#2563eb' : '#16a34a';
          break;
        case 'decision':
          shape = 'diamond';
          fillColor = '#fef3c7';
          strokeColor = '#d97706';
          break;
        case 'process':
          shape = 'rectangle';
          fillColor = '#f1f5f9';
          strokeColor = '#475569';
          break;
        case 'parallel':
          shape = 'star';
          fillColor = '#faf5ff';
          strokeColor = '#8b5cf6';
          break;
      }

      return {
        id: step.id,
        type: 'custom',
        position: step.position,
        data: {
          label: step.label,
          shape,
          fillColor,
          strokeColor,
          strokeWidth: 2,
          textColor: '#1e293b',
          description: step.metadata?.description,
          responsible: step.metadata?.responsible,
          duration: step.metadata?.duration
        }
      };
    });

    // Generate edges from connections
    const edges = response.steps.reduce((acc: any[], step: any) => {
      step.connections.forEach((targetId: string) => {
        acc.push({
          id: `${step.id}-${targetId}`,
          source: step.id,
          target: targetId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#475569', strokeWidth: 2 },
          markerEnd: {
            type: 'ArrowClosed',
            color: '#475569'
          }
        });
      });
      return acc;
    }, []);

    return { nodes, edges };
  };

  if (!isVisible) return null;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* Header - Only show if showHeader is true */}
      {showHeader && (
        <GlassPanel variant="elevated" padding="4" style={{
          borderRadius: 0,
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: 0,
                fontSize: MermaidDesignTokens.typography.fontSize.lg,
                fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
                color: MermaidDesignTokens.colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: MermaidDesignTokens.spacing[2]
              }}>
                <Brain size={20} color={MermaidDesignTokens.colors.accent.blue} />
                AI Security Architect
              </h2>
              <p style={{
                margin: `${MermaidDesignTokens.spacing[2]} 0 0 0`,
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                color: MermaidDesignTokens.colors.text.secondary
              }}>
                Enterprise-grade security process design
              </p>
            </div>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={16} />}
              onClick={clearConversation}
              title="Clear conversation"
            />
          </div>
        </GlassPanel>
      )}

      {/* Quick Security Prompts */}
      <div style={{ 
        padding: MermaidDesignTokens.spacing[4],
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
      }}>
        <h3 style={{
          margin: `0 0 ${MermaidDesignTokens.spacing[2]} 0`,
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
          color: MermaidDesignTokens.colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: MermaidDesignTokens.spacing[1]
        }}>
          <Shield size={14} />
          Quick Start
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: MermaidDesignTokens.spacing[1],
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {securityPrompts.slice(0, 6).map((prompt, index) => (
            <GlassButton
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handlePromptClick(prompt)}
              style={{
                justifyContent: 'flex-start',
                fontSize: MermaidDesignTokens.typography.fontSize.xs,
                padding: MermaidDesignTokens.spacing[2],
                textAlign: 'left',
                lineHeight: '1.3',
                height: 'auto',
                whiteSpace: 'normal'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: MermaidDesignTokens.spacing[1]
              }}>
                <Sparkles size={12} style={{ 
                  marginTop: '2px', 
                  color: MermaidDesignTokens.colors.accent.blue,
                  flexShrink: 0
                }} />
                <span>{prompt}</span>
              </div>
            </GlassButton>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: MermaidDesignTokens.spacing[4],
        display: 'flex',
        flexDirection: 'column',
        gap: MermaidDesignTokens.spacing[3]
      }}>
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onApplyDiagram={onDiagramGenerate}
            onApplyReactFlow={onReactFlowGenerate}
            onApplyReactFlowAdd={onReactFlowAdd}
            currentNodes={currentNodes}
          />
        ))}
        {isProcessing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: MermaidDesignTokens.spacing[2],
            padding: MermaidDesignTokens.spacing[3],
            background: MermaidDesignTokens.colors.glass.primary,
            borderRadius: MermaidDesignTokens.borderRadius.lg,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
          }}>
            <div className="animate-spin">
              <Brain size={16} color={MermaidDesignTokens.colors.accent.blue} />
            </div>
            <span style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: MermaidDesignTokens.colors.text.secondary
            }}>
              Creating your security process...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: MermaidDesignTokens.spacing[4],
        borderTop: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        background: MermaidDesignTokens.colors.glass.primary
      }}>
        <div style={{
          display: 'flex',
          gap: MermaidDesignTokens.spacing[2],
          alignItems: 'flex-end'
        }}>
          <GlassInput
            ref={inputRef}
            placeholder="Describe your security process..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            style={{
              flex: 1,
              background: MermaidDesignTokens.colors.glass.secondary,
              border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
              fontSize: MermaidDesignTokens.typography.fontSize.sm
            }}
          />
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Send size={16} />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
            glow
            style={{ flexShrink: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ 
  message: Message; 
  onApplyDiagram?: (code: string) => void;
  onApplyReactFlow?: (nodes: any[], edges: any[]) => void;
  onApplyReactFlowAdd?: (nodes: any[], edges: any[]) => void;
  currentNodes?: any[];
}> = ({ message, onApplyDiagram, onApplyReactFlow, onApplyReactFlowAdd, currentNodes = [] }) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <MessageCircle size={14} />;
      case 'ai':
        return <Brain size={14} color={MermaidDesignTokens.colors.accent.blue} />;
      case 'system':
        return <AlertTriangle size={14} color={MermaidDesignTokens.colors.accent.warning} />;
      default:
        return null;
    }
  };

  const getMessageStyle = () => {
    const baseStyle = {
      padding: MermaidDesignTokens.spacing[3],
      borderRadius: MermaidDesignTokens.borderRadius.lg,
      fontSize: MermaidDesignTokens.typography.fontSize.sm,
      lineHeight: MermaidDesignTokens.typography.lineHeight.relaxed
    };

    switch (message.type) {
      case 'user':
        return {
          ...baseStyle,
          background: MermaidDesignTokens.colors.accent.blue,
          color: 'white',
          marginLeft: MermaidDesignTokens.spacing[4],
          alignSelf: 'flex-end'
        };
      case 'ai':
        return {
          ...baseStyle,
          background: MermaidDesignTokens.colors.glass.primary,
          border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
          color: MermaidDesignTokens.colors.text.primary,
          marginRight: MermaidDesignTokens.spacing[4]
        };
      case 'system':
        return {
          ...baseStyle,
          background: MermaidDesignTokens.colors.accent.warning,
          color: 'white',
          textAlign: 'center' as const,
          fontSize: MermaidDesignTokens.typography.fontSize.xs
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
      gap: MermaidDesignTokens.spacing[1]
    }}>
      {/* Message Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: MermaidDesignTokens.spacing[1],
        fontSize: MermaidDesignTokens.typography.fontSize.xs,
        color: MermaidDesignTokens.colors.text.secondary
      }}>
        {getMessageIcon()}
        <span>
          {message.type === 'user' ? 'You' : message.type === 'ai' ? 'AI Assistant' : 'System'}
        </span>
        <span>•</span>
        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Message Content */}
      <div style={getMessageStyle()}>
        {message.content}
        
        {/* Diagram Actions for AI messages with diagrams */}
        {message.type === 'ai' && message.diagramCode && onApplyDiagram && (
          <div style={{
            marginTop: MermaidDesignTokens.spacing[2],
            display: 'flex',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            <GlassButton
              variant="primary"
              size="xs"
              icon={<CheckCircle size={12} />}
              onClick={() => onApplyDiagram(message.diagramCode!)}
            >
              {currentNodes.length > 0 ? 'Replace Canvas' : 'Apply to Canvas'}
            </GlassButton>
            {currentNodes.length > 0 && onApplyReactFlowAdd && (
              <GlassButton
                variant="secondary"
                size="xs"
                icon={<ArrowDown size={12} />}
                onClick={() => {
                  // Extract nodes/edges from the message and add them
                  // This would be handled by the main handler but for manual apply we need conversion
                  if (message.diagramCode) {
                    onApplyDiagram(message.diagramCode);
                  }
                }}
              >
                Add to Canvas
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalAI;