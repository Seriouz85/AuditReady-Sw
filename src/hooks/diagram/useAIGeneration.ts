/**
 * Custom hook for AI-powered diagram generation
 * Integrates with OpenAI/Gemini for intelligent diagram creation
 */

import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
import { useDiagramStore } from '../../stores/diagramStore';
import { v4 as uuidv4 } from 'uuid';

interface AIGenerationOptions {
  diagramType?: 'flowchart' | 'sequence' | 'gantt' | 'mindmap' | 'network' | 'org' | 'swimlane';
  complexity?: 'simple' | 'medium' | 'complex';
  style?: 'professional' | 'modern' | 'minimal' | 'colorful';
  includeDecisions?: boolean;
  includeParallel?: boolean;
  autoLayout?: boolean;
}

interface AIResponse {
  nodes: any[];
  edges: any[];
  layout?: string;
  title?: string;
  description?: string;
  suggestions?: string[];
}

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  
  const {
    setNodes,
    setEdges,
    addAIMessage,
    setProjectName,
    setProjectDescription,
    saveToHistory
  } = useDiagramStore();

  // Enhanced prompt engineering for better AI responses
  const createEnhancedPrompt = useCallback((userPrompt: string, options: AIGenerationOptions) => {
    const systemPrompt = `You are an expert diagram designer. Create a professional ${options.diagramType || 'flowchart'} diagram based on the user's requirements.
    
    Requirements:
    - Diagram Type: ${options.diagramType || 'flowchart'}
    - Complexity: ${options.complexity || 'medium'}
    - Style: ${options.style || 'professional'}
    ${options.includeDecisions ? '- Include decision points with branching logic' : ''}
    ${options.includeParallel ? '- Include parallel processes where appropriate' : ''}
    
    Return a JSON response with the following structure:
    {
      "title": "Diagram Title",
      "description": "Brief description",
      "nodes": [
        {
          "id": "unique_id",
          "label": "Node Label",
          "type": "rectangle|diamond|circle|parallelogram",
          "position": { "x": number, "y": number },
          "style": { "fillColor": "#hex", "strokeColor": "#hex" }
        }
      ],
      "edges": [
        {
          "id": "unique_id",
          "source": "node_id",
          "target": "node_id",
          "label": "optional edge label",
          "type": "straight|smoothstep|bezier"
        }
      ],
      "layout": "dagre|elk|force|circular",
      "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
    }`;

    return {
      system: systemPrompt,
      user: userPrompt
    };
  }, []);

  // Generate diagram using AI (OpenAI or Gemini) - Updated for new flow
  const generateDiagram = useCallback(async (prompt: string, contextOptions: any = {}) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const options: AIGenerationOptions = {
        diagramType: 'flowchart',
        complexity: 'medium',
        style: 'professional',
        ...contextOptions
      };
      
      const { system, user } = createEnhancedPrompt(prompt, options);
      
      // Check which AI service is available
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      let response: AIResponse;
      
      if (geminiKey) {
        response = await generateWithGemini(system, user, geminiKey);
      } else if (openaiKey) {
        response = await generateWithOpenAI(system, user, openaiKey);
      } else {
        // Fallback to intelligent template-based generation
        response = await generateFromTemplates(prompt, options);
      }
      
      // Convert AI response to React Flow nodes and edges
      const { nodes, edges } = convertAIResponseToFlow(response);
      
      // Save current state to history before making changes
      saveToHistory();
      
      console.log('AI Generated nodes and edges:', { nodes, edges });
      
      // Return the generated data instead of setting directly
      return {
        nodes,
        edges,
        title: response.title,
        description: response.description,
        explanation: `Generated ${nodes.length} nodes and ${edges.length} edges. ${response.suggestions?.join(' ') || ''}`,
        suggestions: response.suggestions
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate diagram';
      setError(errorMessage);
      
      addAIMessage({
        role: 'assistant',
        content: `Error: ${errorMessage}`
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [createEnhancedPrompt, saveToHistory, addAIMessage]);

  // Legacy method for compatibility  
  const generateFromAI = useCallback(async (prompt: string, options: AIGenerationOptions = {}) => {
    const result = await generateDiagram(prompt, options);
    
    // Apply the generated diagram to store
    setNodes(result.nodes);
    setEdges(result.edges);
    
    if (result.title) {
      setProjectName(result.title);
    }
    if (result.description) {
      setProjectDescription(result.description);
    }
    
    setConversation(prev => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: 'Diagram generated successfully!' }
    ]);
    
    return { success: true, nodes: result.nodes, edges: result.edges };
  }, [generateDiagram, setNodes, setEdges, setProjectName, setProjectDescription]);

  // Generate using Gemini AI
  const generateWithGemini = async (systemPrompt: string, userPrompt: string, apiKey: string): Promise<AIResponse> => {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Request: ${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate with Gemini AI');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
    }
    
    // Fallback parsing
    return parseTextToDiagram(generatedText);
  };

  // Generate using OpenAI
  const generateWithOpenAI = async (systemPrompt: string, userPrompt: string, apiKey: string): Promise<AIResponse> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate with OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      return parseTextToDiagram(content);
    }
  };

  // Intelligent template-based generation when AI is not available
  const generateFromTemplates = async (prompt: string, options: AIGenerationOptions): Promise<AIResponse> => {
    const promptLower = prompt.toLowerCase();
    
    // Analyze prompt for keywords
    const keywords = {
      audit: ['audit', 'compliance', 'assessment', 'review', 'control'],
      process: ['process', 'workflow', 'flow', 'procedure', 'steps'],
      decision: ['decision', 'choice', 'branch', 'if', 'condition'],
      data: ['data', 'database', 'storage', 'etl', 'pipeline'],
      network: ['network', 'system', 'architecture', 'infrastructure'],
      timeline: ['timeline', 'gantt', 'schedule', 'milestone', 'project']
    };
    
    let detectedType = 'flowchart';
    let complexity = 'medium';
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => promptLower.includes(word))) {
        detectedType = type === 'audit' ? 'flowchart' : type;
        break;
      }
    }
    
    // Count mentioned steps/items to determine complexity
    const numbers = prompt.match(/\d+/g);
    if (numbers) {
      const maxNumber = Math.max(...numbers.map(n => parseInt(n)));
      complexity = maxNumber <= 5 ? 'simple' : maxNumber <= 10 ? 'medium' : 'complex';
    }
    
    // Generate nodes based on detected type and complexity
    const nodes = generateTemplateNodes(detectedType, complexity, prompt);
    const edges = generateTemplateEdges(nodes, detectedType);
    
    return {
      title: `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)} Diagram`,
      description: `Generated from: ${prompt.substring(0, 100)}...`,
      nodes,
      edges,
      layout: 'dagre',
      suggestions: [
        'You can customize node colors and styles',
        'Try adding more detail to specific steps',
        'Consider adding decision points for branching logic'
      ]
    };
  };

  // Parse unstructured text to diagram
  const parseTextToDiagram = (text: string): AIResponse => {
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: any[] = [];
    const edges: any[] = [];
    
    let y = 100;
    let previousNodeId: string | null = null;
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const nodeId = `node-${index}`;
        const isDecision = line.includes('?') || line.toLowerCase().includes('if');
        const isStart = index === 0 || line.toLowerCase().includes('start');
        const isEnd = index === lines.length - 1 || line.toLowerCase().includes('end');
        
        nodes.push({
          id: nodeId,
          label: line.trim(),
          type: isDecision ? 'diamond' : isStart || isEnd ? 'circle' : 'rectangle',
          position: { x: 300, y },
          style: {
            fillColor: isStart ? '#dbeafe' : isEnd ? '#dcfce7' : isDecision ? '#fef3c7' : '#f1f5f9',
            strokeColor: isStart ? '#2563eb' : isEnd ? '#16a34a' : isDecision ? '#d97706' : '#475569'
          }
        });
        
        if (previousNodeId) {
          edges.push({
            id: `edge-${previousNodeId}-${nodeId}`,
            source: previousNodeId,
            target: nodeId,
            type: 'smoothstep'
          });
        }
        
        previousNodeId = nodeId;
        y += 120;
      }
    });
    
    return { nodes, edges };
  };

  // Generate template nodes
  const generateTemplateNodes = (type: string, complexity: string, prompt: string): any[] => {
    const nodeCount = complexity === 'simple' ? 5 : complexity === 'medium' ? 10 : 15;
    const nodes: any[] = [];
    
    // Extract steps from prompt if possible
    const steps = prompt.match(/(?:\d+\.?\s+)([^,\n]+)/g) || [];
    
    for (let i = 0; i < nodeCount; i++) {
      const x = 300 + (i % 3) * 200;
      const y = 100 + Math.floor(i / 3) * 150;
      
      nodes.push({
        id: `node-${i}`,
        label: steps[i] ? steps[i].replace(/^\d+\.?\s+/, '') : `Step ${i + 1}`,
        type: i === 0 ? 'circle' : i === nodeCount - 1 ? 'circle' : i % 3 === 0 ? 'diamond' : 'rectangle',
        position: { x, y },
        style: {
          fillColor: i === 0 ? '#dbeafe' : i === nodeCount - 1 ? '#dcfce7' : '#f1f5f9',
          strokeColor: i === 0 ? '#2563eb' : i === nodeCount - 1 ? '#16a34a' : '#475569'
        }
      });
    }
    
    return nodes;
  };

  // Generate template edges
  const generateTemplateEdges = (nodes: any[], type: string): any[] => {
    const edges: any[] = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
        animated: type === 'data'
      });
      
      // Add some branching for decision nodes
      if (nodes[i].type === 'diamond' && i < nodes.length - 2) {
        edges.push({
          id: `edge-alt-${i}`,
          source: nodes[i].id,
          target: nodes[i + 2].id,
          type: 'smoothstep',
          label: 'Alternative',
          style: { stroke: '#ef4444' }
        });
      }
    }
    
    return edges;
  };

  // Convert AI response to React Flow format
  const convertAIResponseToFlow = (response: AIResponse): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = response.nodes.map(node => ({
      id: node.id || uuidv4(),
      type: 'custom',
      position: node.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: node.label,
        shape: node.type || 'rectangle',
        fillColor: node.style?.fillColor || '#f1f5f9',
        strokeColor: node.style?.strokeColor || '#475569',
        strokeWidth: 2,
        textColor: '#1e293b',
        onLabelChange: () => {},
        onUpdate: () => {}
      }
    }));
    
    const edges: Edge[] = response.edges.map(edge => ({
      id: edge.id || uuidv4(),
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      label: edge.label,
      animated: false,
      style: { stroke: '#1e293b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
    }));
    
    return { nodes, edges };
  };

  // Refine existing diagram with AI
  const refineDiagram = useCallback(async (feedback: string) => {
    setIsGenerating(true);
    
    try {
      // Get current diagram state
      const currentState = useDiagramStore.getState();
      const { nodes, edges } = currentState;
      
      const prompt = `Current diagram has ${nodes.length} nodes and ${edges.length} edges.
      User feedback: ${feedback}
      
      Please suggest improvements or modifications to make the diagram better.`;
      
      const result = await generateFromAI(prompt, { autoLayout: true });
      
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [generateFromAI]);

  // Generate suggestions for current diagram
  const getSuggestions = useCallback(async () => {
    const currentState = useDiagramStore.getState();
    const { nodes, edges } = currentState;
    
    const suggestions: string[] = [];
    
    // Check for orphaned nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const orphanedCount = nodes.filter(n => !connectedNodes.has(n.id)).length;
    if (orphanedCount > 0) {
      suggestions.push(`Connect ${orphanedCount} orphaned node(s)`);
    }
    
    // Check for missing start/end nodes
    const hasStart = nodes.some(n => n.data?.shape === 'circle' && n.data?.label?.toLowerCase().includes('start'));
    const hasEnd = nodes.some(n => n.data?.shape === 'circle' && n.data?.label?.toLowerCase().includes('end'));
    
    if (!hasStart) suggestions.push('Add a Start node');
    if (!hasEnd) suggestions.push('Add an End node');
    
    // Check for decision points
    const hasDecisions = nodes.some(n => n.data?.shape === 'diamond');
    if (!hasDecisions && nodes.length > 5) {
      suggestions.push('Consider adding decision points for branching logic');
    }
    
    return suggestions;
  }, []);

  return {
    isGenerating,
    error,
    conversation,
    generateDiagram,
    generateFromAI,
    refineDiagram,
    getSuggestions
  };
};