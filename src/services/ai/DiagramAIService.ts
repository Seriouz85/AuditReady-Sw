/**
 * AI-Powered Diagram Generation Service
 * Generates Mermaid diagrams from natural language descriptions
 */

export interface DiagramGenerationRequest {
  prompt: string;
  diagramType?: 'flowchart' | 'sequence' | 'class' | 'state' | 'gantt' | 'pie';
  complexity?: 'simple' | 'medium' | 'complex';
  includeParallelPaths?: boolean;
  industry?: 'audit' | 'compliance' | 'software' | 'business' | 'general';
  style?: 'professional' | 'modern' | 'minimal' | 'colorful';
}

export interface DiagramGenerationResponse {
  mermaidCode: string;
  title: string;
  description: string;
  suggestions: string[];
  confidence: number;
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

  private constructor() {
    // Note: Environment variables will be accessed when needed
  }

  public static getInstance(): DiagramAIService {
    if (!DiagramAIService.instance) {
      DiagramAIService.instance = new DiagramAIService();
    }
    return DiagramAIService.instance;
  }

  /**
   * Generate diagram from natural language prompt
   */
  public async generateDiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    try {
      console.log('🤖 Generating diagram from prompt:', request.prompt);

      // For now, use template-based generation
      // In production, this would call an AI API
      const response = await this.generateFromTemplate(request);
      
      console.log('✅ Diagram generated successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to generate diagram:', error);
      throw new Error(`AI diagram generation failed: ${(error as Error).message}`);
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
   * Template-based diagram generation (fallback for when AI API is not available)
   */
  private async generateFromTemplate(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    const { prompt, diagramType = 'flowchart', industry: _industry = 'general' } = request;
    
    // Simple keyword-based template selection
    const keywords = prompt.toLowerCase();
    
    if (keywords.includes('audit') || keywords.includes('compliance')) {
      return this.generateAuditTemplate(prompt);
    } else if (keywords.includes('user') && keywords.includes('auth')) {
      return this.generateAuthFlowTemplate(prompt);
    } else if (keywords.includes('process') || keywords.includes('workflow')) {
      return this.generateProcessTemplate(prompt);
    } else {
      return this.generateGenericTemplate(prompt, diagramType);
    }
  }

  private generateAuditTemplate(_prompt: string): DiagramGenerationResponse {
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

  private generateAuthFlowTemplate(_prompt: string): DiagramGenerationResponse {
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

  private generateProcessTemplate(_prompt: string): DiagramGenerationResponse {
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

  private generateGenericTemplate(_prompt: string, diagramType: string): DiagramGenerationResponse {
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
      title: 'Generated Diagram',
      description: `${diagramType} diagram based on: ${prompt}`,
      suggestions: ['Customize styling', 'Add more details', 'Include error handling'],
      confidence: 0.7
    };
  }

  private getNextNodeId(currentId: string): string {
    return String.fromCharCode(currentId.charCodeAt(0) + 1);
  }
}
