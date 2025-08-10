/**
 * Enhanced AI-Powered Diagram Generation Service
 * Generates Mermaid diagrams from natural language descriptions
 * Supports OpenAI/Gemini APIs with intelligent prompt engineering
 */

export interface DiagramGenerationRequest {
  prompt: string;
  diagramType?: 'flowchart' | 'sequence' | 'class' | 'state' | 'gantt' | 'pie' | 'swimlane' | 'bpmn' | 'timeline' | 'journey' | 'sankey' | 'quadrant';
  complexity?: 'simple' | 'medium' | 'complex';
  includeParallelPaths?: boolean;
  industry?: 'audit' | 'compliance' | 'software' | 'business' | 'general';
  style?: 'professional' | 'modern' | 'minimal' | 'colorful';
  contextHistory?: ConversationContext[];
  streaming?: boolean;
  cacheKey?: string;
}

export interface ConversationContext {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  diagramType?: string;
}

export interface StreamingResponse {
  chunk: string;
  isComplete: boolean;
  accumulated: string;
}

export interface DiagramLayoutConfig {
  nodeSpacing: number;
  rankDirection: 'TD' | 'LR' | 'BT' | 'RL';
  nodeStyle: Record<string, string>;
  linkStyle: Record<string, string>;
  autoPosition: boolean;
}

export interface DiagramGenerationResponse {
  mermaidCode: string;
  title: string;
  description: string;
  suggestions: string[];
  confidence: number;
  layout?: DiagramLayoutConfig;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  metadata?: {
    generatedAt: Date;
    model: string;
    tokensUsed?: number;
    processingTime: number;
    cached?: boolean;
  };
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'stadium' | 'cylinder';
  position?: { x: number; y: number };
  style?: Record<string, string>;
  data?: Record<string, any>;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  type: 'solid' | 'dashed' | 'dotted';
  style?: Record<string, string>;
}

export interface ProcessFlowRequest {
  processName: string;
  steps: string[];
  includeDecisionPoints?: boolean;
  includeParallelTasks?: boolean;
  addErrorHandling?: boolean;
}

export class DiagramAIService {
  private static instance: DiagramAIService;
  private cache: Map<string, { response: DiagramGenerationResponse; timestamp: Date }> = new Map();
  private conversationHistory: Map<string, ConversationContext[]> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second

  private constructor() {
    this.initializeCleanupTimer();
  }

  private initializeCleanupTimer() {
    // Clean up expired cache entries every 10 minutes
    setInterval(() => {
      const now = new Date();
      for (const [key, entry] of this.cache.entries()) {
        if (now.getTime() - entry.timestamp.getTime() > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }

  public static getInstance(): DiagramAIService {
    if (!DiagramAIService.instance) {
      DiagramAIService.instance = new DiagramAIService();
    }
    return DiagramAIService.instance;
  }

  /**
   * Generate diagram from natural language prompt with AI integration
   */
  public async generateDiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    try {
      console.log('🤖 Generating diagram from prompt:', request.prompt);

      // Check cache first
      if (request.cacheKey !== 'skip' && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        console.log('💾 Returning cached result');
        return {
          ...cached.response,
          metadata: {
            ...cached.response.metadata!,
            cached: true,
            processingTime: Date.now() - startTime
          }
        };
      }

      // Try AI generation first, fallback to templates
      let response: DiagramGenerationResponse;
      try {
        response = await this.generateWithAI(request);
      } catch (aiError) {
        console.warn('⚠️ AI generation failed, falling back to templates:', aiError);
        response = await this.generateFromTemplate(request);
      }

      // Apply auto-layout if requested
      if (request.complexity !== 'simple') {
        response = await this.applyAutoLayout(response, request);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        response,
        timestamp: new Date()
      });

      console.log('✅ Diagram generated successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to generate diagram:', error);
      throw new Error(`AI diagram generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate streaming diagram response
   */
  public async *generateDiagramStream(request: DiagramGenerationRequest): AsyncGenerator<StreamingResponse> {
    try {
      console.log('🌊 Starting streaming diagram generation');
      
      const fullResponse = await this.generateDiagram({ ...request, streaming: true });
      const mermaidCode = fullResponse.mermaidCode;
      const chunks = this.chunkMermaidCode(mermaidCode);
      
      let accumulated = '';
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        accumulated += chunk;
        
        yield {
          chunk,
          isComplete: i === chunks.length - 1,
          accumulated
        };
        
        // Add small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('❌ Streaming generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate process flow with parallel nodes
   */
  public async generateProcessFlow(request: ProcessFlowRequest): Promise<DiagramGenerationResponse> {
    try {
      console.log('🔄 Generating process flow:', request.processName);

      const { steps, includeDecisionPoints, includeParallelTasks, addErrorHandling } = request;
      
      let mermaidCode = 'flowchart TD\n';
      let nodeId = 'A';
      
      // Add start node
      mermaidCode += `    ${nodeId}([Start: ${request.processName}])\n`;
      let previousNode = nodeId;
      nodeId = this.getNextNodeId(nodeId);

      // Add process steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const currentNode = nodeId;
        
        // Add decision points if requested
        if (includeDecisionPoints && i > 0 && i % 3 === 0) {
          const decisionNode = nodeId;
          mermaidCode += `    ${decisionNode}{${step} Complete?}\n`;
          mermaidCode += `    ${previousNode} --> ${decisionNode}\n`;
          
          nodeId = this.getNextNodeId(nodeId);
          const nextNode = nodeId;
          mermaidCode += `    ${nextNode}[${step} - Continue]\n`;
          mermaidCode += `    ${decisionNode} -->|Yes| ${nextNode}\n`;
          
          if (addErrorHandling) {
            nodeId = this.getNextNodeId(nodeId);
            const errorNode = nodeId;
            mermaidCode += `    ${errorNode}[Handle Error]\n`;
            mermaidCode += `    ${decisionNode} -->|No| ${errorNode}\n`;
            mermaidCode += `    ${errorNode} --> ${nextNode}\n`;
          }
          
          previousNode = nextNode;
        } else {
          mermaidCode += `    ${currentNode}[${step}]\n`;
          mermaidCode += `    ${previousNode} --> ${currentNode}\n`;
          previousNode = currentNode;
        }
        
        nodeId = this.getNextNodeId(nodeId);
      }

      // Add parallel tasks if requested
      if (includeParallelTasks && steps.length > 2) {
        const parallelStart = nodeId;
        mermaidCode += `    ${parallelStart}[Parallel Processing]\n`;
        mermaidCode += `    ${previousNode} --> ${parallelStart}\n`;
        
        nodeId = this.getNextNodeId(nodeId);
        const parallel1 = nodeId;
        nodeId = this.getNextNodeId(nodeId);
        const parallel2 = nodeId;
        
        mermaidCode += `    ${parallel1}[Task A]\n`;
        mermaidCode += `    ${parallel2}[Task B]\n`;
        mermaidCode += `    ${parallelStart} --> ${parallel1}\n`;
        mermaidCode += `    ${parallelStart} --> ${parallel2}\n`;
        
        nodeId = this.getNextNodeId(nodeId);
        const merge = nodeId;
        mermaidCode += `    ${merge}[Merge Results]\n`;
        mermaidCode += `    ${parallel1} --> ${merge}\n`;
        mermaidCode += `    ${parallel2} --> ${merge}\n`;
        
        previousNode = merge;
      }

      // Add end node
      nodeId = this.getNextNodeId(nodeId);
      mermaidCode += `    ${nodeId}([End])\n`;
      mermaidCode += `    ${previousNode} --> ${nodeId}\n`;

      return {
        mermaidCode,
        title: request.processName,
        description: `Generated process flow with ${steps.length} steps`,
        suggestions: [
          'Add error handling nodes',
          'Include decision points',
          'Add parallel processing',
          'Customize node styling'
        ],
        confidence: 0.95
      };
    } catch (error) {
      console.error('❌ Failed to generate process flow:', error);
      throw error;
    }
  }

  /**
   * Generate diagram with AI (OpenAI/Gemini)
   */
  private async generateWithAI(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    const startTime = Date.now();
    const apiKey = this.getAPIKey();
    const model = this.getPreferredModel();
    
    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);
    const messages = this.buildMessages(systemPrompt, userPrompt, request.contextHistory);

    let response: any;
    let tokensUsed = 0;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (model.startsWith('gemini')) {
          response = await this.callGeminiAPI(messages, request);
        } else {
          response = await this.callOpenAIAPI(messages, request);
        }
        tokensUsed = response.usage?.total_tokens || 0;
        break;
      } catch (error: any) {
        if (attempt === this.MAX_RETRIES) {
          throw new Error(`AI API failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }
        
        const delay = Math.pow(2, attempt - 1) * this.RATE_LIMIT_DELAY;
        console.warn(`⚠️ AI API attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const aiResponse = this.parseAIResponse(response.choices[0].message.content, request);
    const nodes = this.extractNodes(aiResponse.mermaidCode);
    const edges = this.extractEdges(aiResponse.mermaidCode);

    return {
      ...aiResponse,
      nodes,
      edges,
      metadata: {
        generatedAt: new Date(),
        model,
        tokensUsed,
        processingTime: Date.now() - startTime,
        cached: false
      }
    };
  }

  /**
   * Template-based diagram generation (enhanced fallback)
   */
  private async generateFromTemplate(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    const { prompt, diagramType = 'flowchart', industry = 'general' } = request;
    const startTime = Date.now();
    
    // Enhanced keyword-based template selection
    const keywords = prompt.toLowerCase();
    let response: DiagramGenerationResponse;
    
    if (keywords.includes('audit') || keywords.includes('compliance')) {
      response = this.generateAuditTemplate(prompt, diagramType);
    } else if (keywords.includes('user') && keywords.includes('auth')) {
      response = this.generateAuthFlowTemplate(prompt, diagramType);
    } else if (keywords.includes('process') || keywords.includes('workflow')) {
      response = this.generateProcessTemplate(prompt, diagramType);
    } else if (keywords.includes('timeline') || keywords.includes('gantt')) {
      response = this.generateTimelineTemplate(prompt);
    } else if (keywords.includes('swim') || keywords.includes('lane')) {
      response = this.generateSwimlaneTemplate(prompt);
    } else if (keywords.includes('bpmn') || keywords.includes('business')) {
      response = this.generateBPMNTemplate(prompt);
    } else {
      response = this.generateGenericTemplate(prompt, diagramType);
    }

    // Add nodes and edges extraction
    const nodes = this.extractNodes(response.mermaidCode);
    const edges = this.extractEdges(response.mermaidCode);

    return {
      ...response,
      nodes,
      edges,
      metadata: {
        generatedAt: new Date(),
        model: 'template',
        processingTime: Date.now() - startTime,
        cached: false
      }
    };
  }

  /**
   * AI API Integration Methods
   */
  private getAPIKey(): string | null {
    // Try Gemini first, then OpenAI
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  private getPreferredModel(): string {
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      return 'gemini-1.5-pro';
    }
    return 'gpt-4-turbo-preview';
  }

  private buildSystemPrompt(request: DiagramGenerationRequest): string {
    const { diagramType, industry, style, complexity } = request;
    
    return `You are an expert diagram designer specializing in Mermaid syntax. Generate professional ${diagramType} diagrams for the ${industry} industry.

Key Requirements:
- Use proper Mermaid syntax for ${diagramType} diagrams
- Apply ${style} styling
- Target ${complexity} complexity level
- Include proper node IDs and labels
- Add appropriate decision points and flows
- Ensure diagram is well-structured and readable

Supported Diagram Types:
- flowchart: Standard flowcharts with decision points
- sequence: Sequence diagrams with participants and messages
- class: Class diagrams with relationships
- state: State transition diagrams
- gantt: Project timeline with tasks and dependencies
- pie: Pie charts with data segments
- swimlane: Cross-functional flowcharts
- bpmn: Business process model notation
- timeline: Event timelines
- journey: User journey maps
- sankey: Flow diagrams
- quadrant: Priority/impact matrices

Response Format:
{
  "mermaidCode": "valid mermaid syntax",
  "title": "diagram title",
  "description": "brief description",
  "suggestions": ["improvement suggestions"],
  "confidence": 0.95
}`;
  }

  private buildUserPrompt(request: DiagramGenerationRequest): string {
    const { prompt, includeParallelPaths, complexity } = request;
    
    let userPrompt = `Create a ${request.diagramType} diagram for: ${prompt}`;
    
    if (includeParallelPaths) {
      userPrompt += '\n\nInclude parallel processing paths where appropriate.';
    }
    
    if (complexity === 'complex') {
      userPrompt += '\n\nMake this a detailed, comprehensive diagram with multiple decision points and error handling.';
    }
    
    return userPrompt;
  }

  private buildMessages(systemPrompt: string, userPrompt: string, contextHistory?: ConversationContext[]): any[] {
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (contextHistory && contextHistory.length > 0) {
      const recentHistory = contextHistory.slice(-6); // Keep last 6 messages
      for (const context of recentHistory) {
        messages.push({
          role: context.role,
          content: context.content
        });
      }
    }

    messages.push({ role: 'user', content: userPrompt });
    return messages;
  }

  private async callOpenAIAPI(messages: any[], request: DiagramGenerationRequest): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: request.streaming || false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  private async callGeminiAPI(messages: any[], request: DiagramGenerationRequest): Promise<any> {
    // Convert OpenAI format to Gemini format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Convert Gemini response to OpenAI format
    return {
      choices: [{
        message: {
          content: data.candidates[0]?.content?.parts[0]?.text || ''
        }
      }],
      usage: {
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  private parseAIResponse(content: string, request: DiagramGenerationRequest): Omit<DiagramGenerationResponse, 'nodes' | 'edges' | 'metadata'> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        mermaidCode: parsed.mermaidCode || '',
        title: parsed.title || 'Generated Diagram',
        description: parsed.description || 'AI-generated diagram',
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8
      };
    } catch (error) {
      // Fallback: extract Mermaid code from text
      const mermaidMatch = content.match(/```(?:mermaid)?\n([\s\S]*?)\n```/);
      const mermaidCode = mermaidMatch ? mermaidMatch[1].trim() : content.trim();
      
      return {
        mermaidCode,
        title: this.generateTitle(request.prompt),
        description: `Generated ${request.diagramType} diagram`,
        suggestions: ['Refine the diagram structure', 'Add more detail', 'Customize styling'],
        confidence: 0.7
      };
    }
  }

  /**
   * Layout and Positioning Methods
   */
  private async applyAutoLayout(response: DiagramGenerationResponse, request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    if (!response.nodes || response.nodes.length === 0) {
      return response;
    }

    const layoutConfig = this.generateLayoutConfig(request);
    const positionedNodes = this.calculateNodePositions(response.nodes, response.edges || [], layoutConfig);
    
    return {
      ...response,
      layout: layoutConfig,
      nodes: positionedNodes
    };
  }

  private generateLayoutConfig(request: DiagramGenerationRequest): DiagramLayoutConfig {
    const { diagramType, style, complexity } = request;
    
    const spacing = complexity === 'complex' ? 120 : complexity === 'medium' ? 100 : 80;
    
    return {
      nodeSpacing: spacing,
      rankDirection: this.getRankDirection(diagramType),
      nodeStyle: this.getNodeStyle(style),
      linkStyle: this.getLinkStyle(style),
      autoPosition: true
    };
  }

  private getRankDirection(diagramType?: string): 'TD' | 'LR' | 'BT' | 'RL' {
    switch (diagramType) {
      case 'sequence': return 'LR';
      case 'timeline': return 'LR';
      case 'gantt': return 'LR';
      default: return 'TD';
    }
  }

  private getNodeStyle(style?: string): Record<string, string> {
    switch (style) {
      case 'modern':
        return { fill: '#e1f5fe', stroke: '#0288d1', 'stroke-width': '2px' };
      case 'minimal':
        return { fill: '#fafafa', stroke: '#757575', 'stroke-width': '1px' };
      case 'colorful':
        return { fill: '#fff3e0', stroke: '#ff9800', 'stroke-width': '2px' };
      default:
        return { fill: '#f5f5f5', stroke: '#1976d2', 'stroke-width': '1px' };
    }
  }

  private getLinkStyle(style?: string): Record<string, string> {
    switch (style) {
      case 'modern':
        return { stroke: '#0288d1', 'stroke-width': '2px' };
      case 'minimal':
        return { stroke: '#757575', 'stroke-width': '1px' };
      case 'colorful':
        return { stroke: '#ff9800', 'stroke-width': '2px' };
      default:
        return { stroke: '#1976d2', 'stroke-width': '1px' };
    }
  }

  private calculateNodePositions(nodes: DiagramNode[], edges: DiagramEdge[], layout: DiagramLayoutConfig): DiagramNode[] {
    // Simple hierarchical layout algorithm
    const positioned = [...nodes];
    const { nodeSpacing } = layout;
    
    // Find root nodes (no incoming edges)
    const hasIncoming = new Set(edges.map(e => e.to));
    const rootNodes = positioned.filter(n => !hasIncoming.has(n.id));
    
    // Arrange in levels
    let currentLevel = 0;
    const processedNodes = new Set<string>();
    const queue = [...rootNodes];
    
    while (queue.length > 0) {
      const levelNodes = queue.splice(0, queue.length);
      
      levelNodes.forEach((node, index) => {
        if (processedNodes.has(node.id)) return;
        
        node.position = {
          x: index * nodeSpacing,
          y: currentLevel * nodeSpacing
        };
        
        processedNodes.add(node.id);
        
        // Add children to next level
        const children = edges
          .filter(e => e.from === node.id && !processedNodes.has(e.to))
          .map(e => positioned.find(n => n.id === e.to)!)
          .filter(Boolean);
        
        queue.push(...children);
      });
      
      currentLevel++;
    }
    
    return positioned;
  }

  /**
   * Utility Methods
   */
  private generateCacheKey(request: DiagramGenerationRequest): string {
    const { prompt, diagramType, complexity, industry, style } = request;
    return `${prompt}-${diagramType}-${complexity}-${industry}-${style}`.replace(/\s+/g, '-');
  }

  private generateTitle(prompt: string): string {
    // Extract meaningful title from prompt
    const words = prompt.split(' ').slice(0, 5);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private chunkMermaidCode(code: string): string[] {
    const lines = code.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const line of lines) {
      currentChunk += line + '\n';
      if (line.trim() === '' || line.includes('-->') || line.includes('---')) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private extractNodes(mermaidCode: string): DiagramNode[] {
    const nodes: DiagramNode[] = [];
    const lines = mermaidCode.split('\n');
    
    for (const line of lines) {
      const nodeMatch = line.match(/^\s*(\w+)\[(.*?)\]/);
      if (nodeMatch) {
        nodes.push({
          id: nodeMatch[1],
          label: nodeMatch[2],
          type: 'rectangle'
        });
      }
      
      // Handle other node types
      const circleMatch = line.match(/^\s*(\w+)\((.*?)\)/);
      if (circleMatch) {
        nodes.push({
          id: circleMatch[1],
          label: circleMatch[2],
          type: 'circle'
        });
      }
      
      const diamondMatch = line.match(/^\s*(\w+)\{(.*?)\}/);
      if (diamondMatch) {
        nodes.push({
          id: diamondMatch[1],
          label: diamondMatch[2],
          type: 'diamond'
        });
      }
    }
    
    return nodes;
  }

  private extractEdges(mermaidCode: string): DiagramEdge[] {
    const edges: DiagramEdge[] = [];
    const lines = mermaidCode.split('\n');
    
    for (const line of lines) {
      const edgeMatch = line.match(/^\s*(\w+)\s*-->\s*(\w+)/);
      if (edgeMatch) {
        edges.push({
          from: edgeMatch[1],
          to: edgeMatch[2],
          type: 'solid'
        });
      }
      
      // Handle labeled edges
      const labeledEdgeMatch = line.match(/^\s*(\w+)\s*-->\|(.+?)\|\s*(\w+)/);
      if (labeledEdgeMatch) {
        edges.push({
          from: labeledEdgeMatch[1],
          to: labeledEdgeMatch[3],
          label: labeledEdgeMatch[2],
          type: 'solid'
        });
      }
    }
    
    return edges;
  }

  /**
   * Conversation Management
   */
  public addToConversationHistory(sessionId: string, role: 'user' | 'assistant', content: string, diagramType?: string) {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    
    const history = this.conversationHistory.get(sessionId)!;
    history.push({
      role,
      content,
      timestamp: new Date(),
      diagramType
    });
    
    // Keep only last 20 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  public getConversationHistory(sessionId: string): ConversationContext[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  public clearConversationHistory(sessionId: string) {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Enhanced Template Methods
   */
  private generateAuditTemplate(prompt: string, diagramType?: string): DiagramGenerationResponse {
    const mermaidCode = `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E{Findings?}
    E -->|Yes| F[Document Issues]
    E -->|No| G[Validate Controls]
    F --> H[Management Response]
    G --> I[Final Report]
    H --> I
    I --> J[Follow-up Actions]`;

    return {
      mermaidCode,
      title: 'Audit Process Flow',
      description: 'Standard audit process with decision points',
      suggestions: ['Add parallel testing', 'Include remediation steps', 'Add timeline'],
      confidence: 0.9
    };
  }

  private generateTimelineTemplate(prompt: string): DiagramGenerationResponse {
    const mermaidCode = `timeline
    title ${this.generateTitle(prompt)}
    
    Phase 1 : Planning
           : Requirements gathering
           : Risk assessment
    
    Phase 2 : Implementation
           : Development
           : Testing
    
    Phase 3 : Deployment
           : Go-live
           : Monitoring`;

    return {
      mermaidCode,
      title: `${this.generateTitle(prompt)} Timeline`,
      description: 'Project timeline with phases and milestones',
      suggestions: ['Add specific dates', 'Include dependencies', 'Add resource allocation'],
      confidence: 0.9
    };
  }

  private generateSwimlaneTemplate(prompt: string): DiagramGenerationResponse {
    const mermaidCode = `flowchart TD
    subgraph "Customer"
        A[Submit Request]
        E[Receive Confirmation]
    end
    
    subgraph "Sales Team"
        B[Review Request]
        C[Create Proposal]
    end
    
    subgraph "Management"
        D[Approve Proposal]
        F[Final Review]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F`;

    return {
      mermaidCode,
      title: `${this.generateTitle(prompt)} Swimlane`,
      description: 'Cross-functional process flow with responsibility lanes',
      suggestions: ['Add more departments', 'Include decision points', 'Add timing information'],
      confidence: 0.88
    };
  }

  private generateBPMNTemplate(prompt: string): DiagramGenerationResponse {
    const mermaidCode = `flowchart TD
    A((Start)) --> B[Activity 1]
    B --> C{Gateway}
    C -->|Path A| D[Activity 2a]
    C -->|Path B| E[Activity 2b]
    D --> F((End A))
    E --> G((End B))
    
    classDef startEnd fill:#c8e6c9,stroke:#4caf50,stroke-width:2px
    classDef activity fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    classDef gateway fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    
    class A,F,G startEnd
    class B,D,E activity
    class C gateway`;

    return {
      mermaidCode,
      title: `${this.generateTitle(prompt)} BPMN`,
      description: 'Business Process Model and Notation diagram',
      suggestions: ['Add sub-processes', 'Include error handling', 'Add swimlanes'],
      confidence: 0.85
    };
  }

  private generateAuthFlowTemplate(prompt: string, diagramType?: string): DiagramGenerationResponse {
    const mermaidCode = `flowchart TD
    A[User Login] --> B{Credentials Valid?}
    B -->|No| C[Show Error]
    C --> A
    B -->|Yes| D[Check 2FA]
    D --> E{2FA Required?}
    E -->|Yes| F[Request 2FA Code]
    F --> G{Code Valid?}
    G -->|No| C
    G -->|Yes| H[Generate JWT]
    E -->|No| H
    H --> I[Set Session]
    I --> J[Redirect to Dashboard]`;

    return {
      mermaidCode,
      title: 'User Authentication Flow',
      description: 'Complete authentication process with 2FA',
      suggestions: ['Add OAuth options', 'Include password reset', 'Add session management'],
      confidence: 0.95
    };
  }

  private generateProcessTemplate(prompt: string, diagramType?: string): DiagramGenerationResponse {
    const mermaidCode = `flowchart TD
    A[Start Process] --> B[Input Validation]
    B --> C{Valid Input?}
    C -->|No| D[Error Handling]
    D --> B
    C -->|Yes| E[Process Data]
    E --> F[Generate Output]
    F --> G[Quality Check]
    G --> H{Quality OK?}
    H -->|No| I[Rework]
    I --> E
    H -->|Yes| J[Complete Process]`;

    return {
      mermaidCode,
      title: 'Generic Process Flow',
      description: 'Standard process with validation and quality checks',
      suggestions: ['Add parallel processing', 'Include notifications', 'Add logging'],
      confidence: 0.85
    };
  }

  private generateGenericTemplate(prompt: string, diagramType: string): DiagramGenerationResponse {
    let mermaidCode = '';
    
    switch (diagramType) {
      case 'sequence':
        mermaidCode = `sequenceDiagram
    participant A as User
    participant B as System
    participant C as Database
    
    A->>B: Request
    B->>C: Query
    C-->>B: Response
    B-->>A: Result`;
        break;
      
      default:
        mermaidCode = `flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F[End]
    E --> F`;
    }

    return {
      mermaidCode,
      title: this.generateTitle(prompt),
      description: `${diagramType} diagram based on: ${prompt}`,
      suggestions: ['Customize styling', 'Add more details', 'Include error handling'],
      confidence: 0.7
    };
  }

  private getNextNodeId(currentId: string): string {
    return String.fromCharCode(currentId.charCodeAt(0) + 1);
  }
}
