/**
 * 🧠 AI Intelligence Panel - Smart Diagram Generation & Optimization
 * Beautiful AI-powered assistant with natural language processing
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Brain, Sparkles, Wand2, Zap, Target, TrendingUp, CheckCircle,
  Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, ArrowRight,
  Lightbulb, MessageCircle, User, Bot, Star, Crown, Award,
  Settings, Sliders, Filter, Search, Clock, Calendar,
  BarChart3, PieChart, Network, Workflow, Database, Shield,
  Plus, Eye, Download, Share2, Bookmark, Heart, Copy,
  AlertCircle, Info, HelpCircle, ExternalLink, ChevronDown,
  Magic, Cpu, Activity, Layers, Grid, Box, Circle, Diamond
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';
import { useAIGeneration } from '../../../hooks/diagram/useAIGeneration';
import { oneShotDiagramService, OneShotDiagramRequest } from '../../../services/ai/OneShotDiagramService';

interface AIIntelligencePanelProps {
  onClose: () => void;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'diagram' | 'analysis';
  metadata?: any;
}

interface DiagramSuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: 'optimization' | 'validation' | 'enhancement' | 'template';
  action: () => void;
}

const AIIntelligencePanel: React.FC<AIIntelligencePanelProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "🚀 **Welcome to Intelligent AI Diagram Generation!**\n\nI'm your advanced AI diagram assistant with smart template recognition. I can create complete, professional diagrams instantly and automatically choose the best specialized template based on your request.\n\n**🎯 Intelligent Features:**\n• **Auto-Detection** - I automatically recognize what type of diagram you need\n• **Specialized Templates** - Professional templates for risk management, incident response, audits, software development\n• **Smart Routing** - Custom prompts are intelligently routed to the best template\n• **Industry Standards** - Follows compliance and security best practices\n\n**💡 Just type naturally and I'll figure out the rest:**\n• \"Risk management process\" → Uses comprehensive cyber security risk template\n• \"Incident response workflow\" → Uses NIST-compliant incident response template  \n• \"Software project timeline\" → Uses development Gantt chart template\n• \"Audit compliance process\" → Uses ISO 27001 audit template\n\n**🔥 The AI gets smarter with every query - try any process or workflow idea!**\n\nReady to create something amazing?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [contextAware, setContextAware] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { generateDiagram, isGenerating, error } = useAIGeneration();
  const { 
    nodes, 
    edges, 
    projectName, 
    projectDescription,
    addNode,
    addEdge,
    updateNode,
    applyTemplate,
    resetDiagram,
    setProjectName,
    setProjectDescription
  } = useDiagramStore();

  // Smart suggestions based on current diagram
  const [suggestions, setSuggestions] = useState<DiagramSuggestion[]>([
    {
      id: 'optimize-layout',
      title: 'Optimize Layout',
      description: 'Automatically arrange nodes for better readability',
      confidence: 0.92,
      type: 'optimization',
      action: () => {}
    },
    {
      id: 'add-swimlanes',
      title: 'Add Swimlanes',
      description: 'Organize process by responsible parties',
      confidence: 0.87,
      type: 'enhancement',
      action: () => {}
    },
    {
      id: 'validate-compliance',
      title: 'Validate Compliance',
      description: 'Check against ISO 27001 requirements',
      confidence: 0.94,
      type: 'validation',
      action: () => {}
    }
  ]);

  // Enhanced preset prompts for one-shot generation
  const presetPrompts = [
    {
      id: 'iso-process',
      title: 'ISO 27001 Audit Process',
      prompt: 'Create a comprehensive ISO 27001 risk assessment and audit process flow with all required steps, decision points, and compliance checkpoints',
      category: 'Compliance',
      diagramType: 'flowchart' as const,
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      complexity: 'complex' as const,
      industry: 'audit' as const
    },
    {
      id: 'software-gantt',
      title: 'Software Development Gantt',
      prompt: 'Generate a detailed Gantt chart for a mobile app development project including planning, development, testing, and deployment phases with realistic timelines and dependencies',
      category: 'Project Management',
      diagramType: 'gantt' as const,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      complexity: 'complex' as const,
      industry: 'software' as const,
      includeTimeline: true,
      projectDuration: '6 months'
    },
    {
      id: 'network-architecture',
      title: 'Enterprise Network',
      prompt: 'Design a secure enterprise network architecture with DMZ, internal networks, firewalls, load balancers, and security controls for a mid-sized company',
      category: 'Technical',
      diagramType: 'network' as const,
      icon: Network,
      color: 'from-purple-500 to-indigo-500',
      complexity: 'complex' as const,
      industry: 'business' as const
    },
    {
      id: 'customer-onboarding',
      title: 'Customer Onboarding',
      prompt: 'Create a customer onboarding workflow with all touchpoints, decision gates, verification steps, and handoff points between departments',
      category: 'Business Process',
      diagramType: 'swimlane' as const,
      icon: Workflow,
      color: 'from-green-500 to-emerald-500',
      complexity: 'medium' as const,
      industry: 'business' as const
    },
    {
      id: 'data-pipeline',
      title: 'ETL Data Pipeline',
      prompt: 'Design an ETL data pipeline from multiple source systems to data warehouse with data transformation, validation, quality checks, and error handling',
      category: 'Data Engineering',
      diagramType: 'process' as const,
      icon: Database,
      color: 'from-orange-500 to-red-500',
      complexity: 'complex' as const,
      industry: 'software' as const
    },
    {
      id: 'compliance-audit',
      title: 'Compliance Audit Timeline',
      prompt: 'Create a compliance audit timeline for NIS2 directive implementation with preparation, fieldwork, reporting, and follow-up phases',
      category: 'Compliance',
      diagramType: 'gantt' as const,
      icon: Calendar,
      color: 'from-indigo-500 to-purple-500',
      complexity: 'medium' as const,
      industry: 'compliance' as const,
      includeTimeline: true,
      projectDuration: '4 months'
    },
    {
      id: 'incident-response',
      title: 'Incident Response Flow',
      prompt: 'Design a cybersecurity incident response process with detection, analysis, containment, eradication, recovery, and lessons learned phases',
      category: 'Security',
      diagramType: 'flowchart' as const,
      icon: AlertCircle,
      color: 'from-red-600 to-orange-500',
      complexity: 'complex' as const,
      industry: 'compliance' as const
    },
    {
      id: 'cyber-risk-management',
      title: 'Cyber Risk Management Process',
      prompt: 'Create a comprehensive cybersecurity risk management process including: 1) Risk Identification (asset inventory, threat identification, vulnerability assessment), 2) Risk Analysis (likelihood assessment, impact evaluation, risk rating matrix), 3) Risk Evaluation (risk tolerance, acceptance criteria, stakeholder review), 4) Risk Treatment (mitigation strategies, control implementation, residual risk assessment), 5) Risk Monitoring (continuous monitoring, KRI tracking, regular reviews), 6) Risk Communication (reporting, stakeholder updates, incident response integration), 7) Risk Review (periodic assessment, process improvement, lessons learned). Include decision points, feedback loops, and integration with business continuity planning.',
      category: 'Risk Management',
      diagramType: 'flowchart' as const,
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      complexity: 'complex' as const,
      industry: 'compliance' as const
    },
    {
      id: 'decision-tree',
      title: 'Risk Assessment Decision Tree',
      prompt: 'Create a risk assessment decision tree for evaluating cybersecurity threats with likelihood, impact, and mitigation decision points',
      category: 'Risk Management',
      diagramType: 'decision' as const,
      icon: Diamond,
      color: 'from-amber-500 to-yellow-500',
      complexity: 'medium' as const,
      industry: 'compliance' as const
    }
  ];

  // Scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Intelligent prompt analyzer to route to specialized templates
  const analyzePromptAndGetTemplate = (promptText: string): any => {
    const promptLower = promptText.toLowerCase();
    
    // Risk Management Process Detection
    if ((promptLower.includes('risk') && (promptLower.includes('management') || promptLower.includes('assessment') || promptLower.includes('analysis'))) ||
        (promptLower.includes('cyber') && promptLower.includes('risk')) ||
        (promptLower.includes('security') && promptLower.includes('risk')) ||
        (promptLower.includes('threat') && promptLower.includes('assessment')) ||
        promptLower.includes('risk register') ||
        promptLower.includes('risk matrix') ||
        promptLower.includes('risk mitigation') ||
        promptLower.includes('risk evaluation') ||
        promptLower.includes('risk treatment')) {
      
      // Find the cyber risk management preset
      const riskPreset = presetPrompts.find(p => p.id === 'cyber-risk-management');
      if (riskPreset) {
        return {
          ...riskPreset,
          prompt: promptText // Use user's custom prompt but with specialized template settings
        };
      }
    }
    
    // Incident Response Detection
    if ((promptLower.includes('incident') && promptLower.includes('response')) ||
        (promptLower.includes('security') && promptLower.includes('incident')) ||
        (promptLower.includes('cyber') && promptLower.includes('incident')) ||
        promptLower.includes('incident handling') ||
        promptLower.includes('breach response') ||
        promptLower.includes('security breach') ||
        promptLower.includes('incident management')) {
      
      const incidentPreset = presetPrompts.find(p => p.id === 'incident-response');
      if (incidentPreset) {
        return {
          ...incidentPreset,
          prompt: promptText
        };
      }
    }
    
    // Software Development Gantt Detection
    if (((promptLower.includes('software') || promptLower.includes('app') || promptLower.includes('development')) && 
         (promptLower.includes('timeline') || promptLower.includes('schedule') || promptLower.includes('gantt') || promptLower.includes('project plan'))) ||
        (promptLower.includes('mobile') && promptLower.includes('development')) ||
        (promptLower.includes('web') && promptLower.includes('development')) ||
        promptLower.includes('sdlc') ||
        promptLower.includes('software project')) {
      
      const softwarePreset = presetPrompts.find(p => p.id === 'software-gantt');
      if (softwarePreset) {
        return {
          ...softwarePreset,
          prompt: promptText
        };
      }
    }
    
    // Audit/Compliance Process Detection
    if (promptLower.includes('audit') || 
        promptLower.includes('compliance') ||
        promptLower.includes('iso 27001') ||
        promptLower.includes('nis2') ||
        promptLower.includes('gdpr') ||
        promptLower.includes('sox') ||
        promptLower.includes('regulatory')) {
      
      const auditPreset = presetPrompts.find(p => p.id === 'iso-process' || p.id === 'compliance-audit');
      if (auditPreset) {
        return {
          ...auditPreset,
          prompt: promptText
        };
      }
    }
    
    // Network Architecture Detection
    if ((promptLower.includes('network') && (promptLower.includes('architecture') || promptLower.includes('design') || promptLower.includes('diagram'))) ||
        promptLower.includes('enterprise network') ||
        promptLower.includes('network topology') ||
        (promptLower.includes('security') && promptLower.includes('architecture'))) {
      
      const networkPreset = presetPrompts.find(p => p.id === 'network-architecture');
      if (networkPreset) {
        return {
          ...networkPreset,
          prompt: promptText
        };
      }
    }
    
    // Business Process Detection
    if (promptLower.includes('customer onboarding') ||
        promptLower.includes('business process') ||
        promptLower.includes('workflow') ||
        (promptLower.includes('process') && promptLower.includes('flow'))) {
      
      const businessPreset = presetPrompts.find(p => p.id === 'customer-onboarding');
      if (businessPreset) {
        return {
          ...businessPreset,
          prompt: promptText
        };
      }
    }
    
    // Data Pipeline Detection
    if (promptLower.includes('etl') ||
        promptLower.includes('data pipeline') ||
        (promptLower.includes('data') && (promptLower.includes('processing') || promptLower.includes('transformation'))) ||
        promptLower.includes('data warehouse') ||
        promptLower.includes('data flow')) {
      
      const dataPreset = presetPrompts.find(p => p.id === 'data-pipeline');
      if (dataPreset) {
        return {
          ...dataPreset,
          prompt: promptText
        };
      }
    }
    
    // Decision Tree Detection
    if (promptLower.includes('decision tree') ||
        promptLower.includes('decision flow') ||
        (promptLower.includes('decision') && promptLower.includes('process'))) {
      
      const decisionPreset = presetPrompts.find(p => p.id === 'decision-tree');
      if (decisionPreset) {
        return {
          ...decisionPreset,
          prompt: promptText
        };
      }
    }
    
    // Default: Analyze for diagram type and complexity
    let diagramType: any = 'flowchart';
    let complexity: any = 'medium';
    let industry: any = 'general';
    
    // Diagram type detection
    if (promptLower.includes('gantt') || promptLower.includes('timeline') || promptLower.includes('schedule')) {
      diagramType = 'gantt';
    } else if (promptLower.includes('network') || promptLower.includes('architecture')) {
      diagramType = 'network';
    } else if (promptLower.includes('decision')) {
      diagramType = 'decision';
    } else if (promptLower.includes('swimlane') || promptLower.includes('swim lane')) {
      diagramType = 'swimlane';
    }
    
    // Complexity detection
    if (promptLower.includes('simple') || promptLower.includes('basic') || promptLower.includes('quick')) {
      complexity = 'simple';
    } else if (promptLower.includes('complex') || promptLower.includes('detailed') || promptLower.includes('comprehensive') || promptLower.includes('enterprise')) {
      complexity = 'complex';
    }
    
    // Industry detection
    if (promptLower.includes('audit') || promptLower.includes('compliance') || promptLower.includes('security')) {
      industry = 'compliance';
    } else if (promptLower.includes('software') || promptLower.includes('development') || promptLower.includes('tech')) {
      industry = 'software';
    } else if (promptLower.includes('business') || promptLower.includes('corporate')) {
      industry = 'business';
    }
    
    return {
      prompt: promptText,
      diagramType,
      complexity,
      industry,
      title: `Custom ${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`,
      category: 'Custom Request'
    };
  };

  // Handle one-shot diagram generation
  const handleOneShotGeneration = async (presetPrompt?: any) => {
    const messageText = presetPrompt?.prompt || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use intelligent prompt analysis if no preset provided
      const templateConfig = presetPrompt || analyzePromptAndGetTemplate(messageText);
      
      // Prepare one-shot diagram request with intelligent routing
      const request: OneShotDiagramRequest = {
        prompt: messageText,
        diagramType: templateConfig.diagramType || 'flowchart',
        complexity: templateConfig.complexity || 'medium',
        industry: templateConfig.industry || 'general',
        includeTimeline: templateConfig.includeTimeline,
        projectDuration: templateConfig.projectDuration
      };
      
      // Add debug info for better user feedback
      console.log('🤖 AI Prompt Analysis:', {
        originalPrompt: messageText,
        detectedType: templateConfig.diagramType,
        detectedComplexity: templateConfig.complexity,
        detectedIndustry: templateConfig.industry,
        usingTemplate: templateConfig.title || 'Custom Analysis'
      });

      console.log('🚀 Starting one-shot generation with request:', request);

      // Generate diagram with one-shot service
      const response = await oneShotDiagramService.generateDiagram(request);

      if (response.success && response.nodes.length > 0) {
        // Clear existing diagram first for one-shot experience
        resetDiagram();

        // Add generated nodes and edges to store
        console.log('✅ Adding generated nodes and edges:', { 
          nodeCount: response.nodes.length, 
          edgeCount: response.edges.length 
        });

        // Set project metadata
        setProjectName(response.title);
        setProjectDescription(response.description);

        // Add nodes and edges to the diagram
        response.nodes.forEach(node => addNode(node));
        response.edges.forEach(edge => addEdge(edge));

        // Enhanced success message with template detection info
        const templateInfo = templateConfig.title && templateConfig.title !== 'Custom Request' 
          ? `\n🎯 **Smart Template Used:** ${templateConfig.title} (${templateConfig.category})\n💡 Detected as: ${templateConfig.industry} industry, ${templateConfig.complexity} complexity`
          : `\n🤖 **AI Analysis:** Custom ${templateConfig.diagramType} diagram`;

        const assistantMessage: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `🎉 **${response.title}** generated successfully!${templateInfo}\n\n${response.description}\n\n**Generated:**\n• ${response.nodes.length} nodes\n• ${response.edges.length} connections\n• Processing time: ${response.processingTime}ms\n• Confidence: ${Math.round(response.confidence * 100)}%\n\n**Suggestions for improvement:**\n${response.suggestions.map(s => `• ${s}`).join('\n')}`,
          timestamp: new Date(),
          type: 'diagram',
          metadata: { ...response, templateUsed: templateConfig.title }
        };

        setMessages(prev => [...prev, assistantMessage]);

      } else {
        throw new Error(response.error || 'Failed to generate diagram');
      }

    } catch (error) {
      console.error('❌ One-shot generation failed:', error);
      
      // Provide intelligent fallback suggestions based on the detected template
      const templateType = templateConfig.diagramType || 'flowchart';
      const templateSuggestions = templateConfig.title !== 'Custom Request' 
        ? `\n🎯 **Detected Template:** ${templateConfig.title}\n💡 **Try these specific examples:**\n• "Create a ${templateType} for ${templateConfig.industry} risk management"\n• "Design a ${templateConfig.complexity} ${templateType} process"\n• "Show me a ${templateConfig.industry} workflow diagram"`
        : `\n💡 **Try these specific examples:**\n• "Risk management process"\n• "Incident response workflow" \n• "Software development timeline"\n• "Audit compliance process"`;

      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Generation Failed**\n\nI encountered an error while generating your diagram: ${error instanceof Error ? error.message : 'Unknown error'}${templateSuggestions}\n\n**Quick fixes:**\n• Simplify your prompt (remove complex technical jargon)\n• Use the quick examples below for guaranteed results\n• Try clicking a preset template above\n• Check your internet connection\n\n💡 **Note:** I detected your request as "${templateConfig.diagramType}" type with "${templateConfig.complexity}" complexity.`,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message submission (legacy compatibility)
  const handleSubmit = async (prompt?: string) => {
    // Route to one-shot generation for better experience
    await handleOneShotGeneration(null);
  };

  // Handle voice input (mock implementation)
  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // In a real implementation, this would integrate with Web Speech API
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  const suggestionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { scale: 1.02, x: 5 }
  };

  const presetVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.05, y: -2 }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get suggestion type color
  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'from-blue-500 to-cyan-500';
      case 'validation': return 'from-green-500 to-emerald-500';
      case 'enhancement': return 'from-purple-500 to-pink-500';
      case 'template': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 overflow-hidden min-h-0">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200/50 flex-shrink-0 max-h-48 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AI Intelligence
              </h2>
              <p className="text-sm text-gray-500">Smart diagram assistant with natural language</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 border-green-200" title="AI Assistant Status">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close AI Intelligence Panel">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-provider" className="text-sm font-medium">AI Provider</Label>
            <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
              <SelectTrigger className="w-32 h-8 bg-white/70 border-gray-200/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>OpenAI</span>
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Gemini</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="context-aware" className="text-sm">Context Aware</Label>
            <Switch
              id="context-aware"
              checked={contextAware}
              onCheckedChange={setContextAware}
              className="data-[state=checked]:bg-purple-500"
              title="Enable context-aware AI responses based on current diagram"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smart-suggestions" className="text-sm">Smart Suggestions</Label>
            <Switch
              id="smart-suggestions"
              checked={smartSuggestions}
              onCheckedChange={setSmartSuggestions}
              className="data-[state=checked]:bg-purple-500"
              title="Show AI-powered suggestions for diagram improvements"
            />
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions && suggestions.length > 0 && (
        <div className="p-3 md:p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 flex-shrink-0 max-h-32 overflow-hidden">
          <div className="flex items-center space-x-2 mb-3" title="AI-powered suggestions to improve your diagram">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-800">Smart Suggestions</h3>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="p-3 bg-white/70 border-gray-200/50 hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={suggestion.action}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getSuggestionTypeColor(suggestion.type)}`} />
                        <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{suggestion.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* One-Shot Generation Templates */}
      <div className="p-3 md:p-4 border-b border-gray-200/50 flex-shrink-0 max-h-64 overflow-hidden">
        <div className="flex items-center space-x-2 mb-3" title="Generate complete professional diagrams with a single click">
          <Wand2 className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">🚀 One-Shot Generation</h3>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200" title="Instant diagram creation">
            Instant
          </Badge>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto overscroll-contain">
          {presetPrompts.slice(0, 4).map((preset, index) => {
            const Icon = preset.icon;
            return (
              <motion.button
                key={preset.id}
                variants={presetVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                onClick={() => handleOneShotGeneration(preset)}
                disabled={isLoading}
                className={`w-full flex items-center space-x-3 p-3 bg-white/70 border border-gray-200/50 rounded-lg hover:bg-white/90 hover:shadow-md transition-all duration-200 text-left group ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${preset.color} flex-shrink-0`}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {preset.title}
                    </h4>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                      {preset.diagramType}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 flex-1 truncate">{preset.category}</p>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        preset.complexity === 'complex' ? 'bg-red-400' :
                        preset.complexity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                      }`} />
                      <span className="text-xs text-gray-400">{preset.complexity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {/* Show All Templates Button */}
        {presetPrompts.length > 4 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-2 p-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Show {presetPrompts.length - 4} More Templates</span>
          </motion.button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-3 md:px-4">
        <div className="py-4 space-y-4 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col space-y-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/80 text-gray-800 border border-gray-200/50'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words max-w-full overflow-hidden">{message.content}</p>
                      
                      {/* Message metadata */}
                      {message.type === 'diagram' && message.metadata && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <div className="flex items-center space-x-2 text-xs opacity-80">
                            <Box className="w-3 h-3" />
                            <span>{message.metadata.nodes?.length || 0} nodes</span>
                            <span>•</span>
                            <span>{message.metadata.edges?.length || 0} connections</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.role === 'assistant' && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                            AI Generated
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/80 border border-gray-200/50 rounded-2xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
        </ScrollArea>
      </div>

      {/* One-Shot Input Area */}
      <div className="p-3 md:p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex-shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type your diagram request for instant generation..."
                className="pr-24 bg-white/90 border-blue-200/50 focus:bg-white focus:border-blue-400 transition-all duration-200 text-sm placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={`p-1 md:p-1.5 ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                  disabled={isLoading}
                  title="Voice Input (Coming Soon)"
                >
                  {isListening ? <MicOff className="w-3 h-3 md:w-4 md:h-4" /> : <Mic className="w-3 h-3 md:w-4 md:h-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSubmit()}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-1 md:p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-sm"
                  title="Generate Diagram Instantly"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center space-x-2 text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                <span>for instant generation</span>
                <span>•</span>
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-amber-600 font-medium">One-Shot Mode</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-600 text-xs font-medium">
                    {import.meta.env.VITE_GEMINI_API_KEY ? 'Gemini AI' : 'Smart Templates'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                'Risk management process',
                'Cyber security risk assessment',
                'Incident response workflow', 
                'Software development timeline',
                'Audit compliance process',
                'Network security architecture'
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(example)}
                  className="text-xs px-2 py-1 bg-blue-100/70 hover:bg-blue-200/70 text-blue-700 rounded transition-colors"
                  disabled={isLoading}
                  title={`Try: "${example}" - AI will auto-detect the best template`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntelligencePanel;