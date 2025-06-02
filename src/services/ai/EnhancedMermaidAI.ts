/**
 * Enhanced Mermaid AI Service
 * Advanced AI-powered diagram generation with intelligent process flow creation
 * Supports complex business processes, risk management, compliance workflows
 */

export interface ProcessStep {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'parallel' | 'subprocess';
  position: { x: number; y: number };
  connections: string[];
  metadata?: {
    description?: string;
    responsible?: string;
    duration?: string;
    risk?: 'low' | 'medium' | 'high';
  };
}

export interface GeneratedDiagram {
  title: string;
  description: string;
  mermaidCode: string;
  steps: ProcessStep[];
  layout: 'top-down' | 'left-right' | 'flowchart';
  theme: 'professional' | 'security' | 'compliance' | 'business';
  isAdditive?: boolean; // New: indicates if this is an additive operation
}

export class EnhancedMermaidAI {
  private static instance: EnhancedMermaidAI;
  private conversationHistory: Array<{prompt: string, response: string}> = [];
  private currentDiagram: GeneratedDiagram | null = null;

  public static getInstance(): EnhancedMermaidAI {
    if (!EnhancedMermaidAI.instance) {
      EnhancedMermaidAI.instance = new EnhancedMermaidAI();
    }
    return EnhancedMermaidAI.instance;
  }

  /**
   * Set current diagram for context-aware editing
   */
  public setCurrentDiagram(diagram: GeneratedDiagram | null) {
    this.currentDiagram = diagram;
  }

  /**
   * Set current diagram from React Flow nodes and edges
   */
  public setCurrentDiagramFromNodes(nodes: any[], edges: any[]) {
    if (!nodes.length) {
      this.currentDiagram = null;
      return;
    }

    // Convert React Flow nodes back to ProcessStep format
    const steps: ProcessStep[] = nodes.map(node => ({
      id: node.id,
      label: node.data.label || 'Node',
      type: this.getStepTypeFromShape(node.data.shape || 'rectangle'),
      position: node.position,
      connections: edges
        .filter(edge => edge.source === node.id)
        .map(edge => edge.target),
      metadata: {
        description: node.data.description,
        responsible: node.data.responsible,
        duration: node.data.duration
      }
    }));

    // Create a GeneratedDiagram from the nodes
    this.currentDiagram = {
      title: 'Current Process Flow',
      description: 'Existing diagram from canvas',
      mermaidCode: this.generateMermaidCode(steps, 'flowchart', 'professional'),
      steps,
      layout: 'flowchart',
      theme: 'professional'
    };
  }

  /**
   * Helper to convert React Flow shape back to step type
   */
  private getStepTypeFromShape(shape: string): ProcessStep['type'] {
    switch (shape) {
      case 'circle': return 'start';
      case 'diamond': return 'decision';
      case 'star': return 'parallel';
      default: return 'process';
    }
  }

  /**
   * Generate intelligent process flow from natural language description
   */
  public async generateProcessFlow(prompt: string): Promise<GeneratedDiagram> {
    // Store conversation history
    this.conversationHistory.push({ prompt, response: '' });

    // Check if this is an edit request for existing diagram
    if (this.currentDiagram && this.isEditRequest(prompt)) {
      return this.editExistingDiagram(prompt);
    }

    // Check if this is an additive request and we have existing content
    if (this.currentDiagram && this.isAdditiveRequest(prompt)) {
      return this.addToExistingDiagram(prompt);
    }

    // Check if we need to ask clarifying questions
    const clarificationNeeded = this.needsClarification(prompt);
    if (clarificationNeeded) {
      throw new Error(`I need more information: ${clarificationNeeded}`);
    }

    // Analyze prompt to determine process type and complexity
    const analysis = this.analyzePrompt(prompt);

    // Generate process steps based on analysis
    const steps = this.generateProcessSteps(analysis);

    // Create optimized layout
    const layout = this.determineOptimalLayout(steps);

    // Generate Mermaid code
    const mermaidCode = this.generateMermaidCode(steps, layout, analysis.theme);

    const diagram = {
      title: analysis.title,
      description: analysis.description,
      mermaidCode,
      steps,
      layout,
      theme: analysis.theme,
      isAdditive: false
    };

    // Store as current diagram for future edits
    this.currentDiagram = diagram;

    return diagram;
  }

  /**
   * Check if prompt is requesting edits to existing diagram
   */
  private isEditRequest(prompt: string): boolean {
    const editKeywords = ['remove', 'change', 'modify', 'update', 'edit', 'delete', 'replace'];
    return editKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Check if prompt is requesting additions to existing diagram
   */
  private isAdditiveRequest(prompt: string): boolean {
    const addKeywords = [
      'add', 'append', 'extend', 'continue', 'also add', 'then add', 'include',
      'insert', 'attach', 'connect', 'link', 'follow up', 'next step',
      'additional', 'plus', 'and then', 'after that', 'furthermore',
      'expand', 'enhance', 'supplement', 'augment'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return addKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Edit existing diagram based on prompt
   */
  private editExistingDiagram(prompt: string): GeneratedDiagram {
    if (!this.currentDiagram) {
      throw new Error('No existing diagram to edit');
    }

    const lowerPrompt = prompt.toLowerCase();
    let updatedSteps = [...this.currentDiagram.steps];

    // Handle different edit operations
    if (lowerPrompt.includes('add') || lowerPrompt.includes('insert')) {
      // Add new step
      const newStepLabel = this.extractStepLabel(prompt);
      const newStep: ProcessStep = {
        id: `step-${Date.now()}`,
        label: newStepLabel,
        type: 'process',
        position: { x: 250, y: updatedSteps.length * 100 + 50 },
        connections: []
      };
      updatedSteps.push(newStep);
    } else if (lowerPrompt.includes('remove') || lowerPrompt.includes('delete')) {
      // Remove step
      const stepToRemove = this.findStepByLabel(prompt, updatedSteps);
      if (stepToRemove) {
        updatedSteps = updatedSteps.filter(step => step.id !== stepToRemove.id);
      }
    } else if (lowerPrompt.includes('change') || lowerPrompt.includes('modify')) {
      // Modify existing step
      const stepToModify = this.findStepByLabel(prompt, updatedSteps);
      if (stepToModify) {
        const newLabel = this.extractStepLabel(prompt);
        stepToModify.label = newLabel;
      }
    }

    // Regenerate Mermaid code with updated steps
    const mermaidCode = this.generateMermaidCode(updatedSteps, this.currentDiagram.layout, this.currentDiagram.theme);

    const updatedDiagram = {
      ...this.currentDiagram,
      steps: updatedSteps,
      mermaidCode
    };

    this.currentDiagram = updatedDiagram;
    return updatedDiagram;
  }

  /**
   * Add to existing diagram based on prompt
   */
  private addToExistingDiagram(prompt: string): GeneratedDiagram {
    if (!this.currentDiagram) {
      throw new Error('No existing diagram to add to');
    }

    // Analyze the prompt to understand what to add
    const analysis = this.analyzePrompt(prompt);
    
    // Generate new steps based on the prompt
    const newSteps = this.generateAdditiveSteps(prompt, analysis);
    
    // Merge with existing steps
    const allSteps = [...this.currentDiagram.steps];
    const lastStep = allSteps[allSteps.length - 1];
    
    // Position new steps after existing ones
    newSteps.forEach((step, index) => {
      const yOffset = lastStep ? lastStep.position.y + 100 + (index * 100) : 100 + (index * 100);
      step.position = { x: 250, y: yOffset };
      
      // Connect the first new step to the last existing step if appropriate
      if (index === 0 && lastStep && lastStep.type !== 'end') {
        lastStep.connections.push(step.id);
      }
      
      allSteps.push(step);
    });

    // Regenerate Mermaid code with all steps
    const mermaidCode = this.generateMermaidCode(allSteps, this.currentDiagram.layout, this.currentDiagram.theme);

    const updatedDiagram = {
      ...this.currentDiagram,
      steps: newSteps, // Return only the new steps for additive rendering
      mermaidCode,
      isAdditive: true
    };

    // Update current diagram with all steps for future operations
    this.currentDiagram = {
      ...this.currentDiagram,
      steps: allSteps,
      mermaidCode
    };

    return updatedDiagram;
  }

  /**
   * Generate steps specifically for additive operations
   */
  private generateAdditiveSteps(prompt: string, analysis: any): ProcessStep[] {
    // Extract what the user wants to add from the prompt
    const stepText = this.extractStepLabel(prompt);
    
    // Create 1-3 steps based on complexity
    const steps: ProcessStep[] = [];
    const baseId = Date.now();
    
    if (analysis.complexity === 'simple' || stepText.split(' ').length <= 3) {
      // Single step addition
      steps.push({
        id: `add-${baseId}`,
        label: stepText || 'New Step',
        type: 'process',
        position: { x: 250, y: 100 }, // Will be repositioned
        connections: []
      });
    } else {
      // Multi-step addition for complex requests
      const keywords = analysis.keywords.slice(0, 3);
      keywords.forEach((keyword: string, index: number) => {
        steps.push({
          id: `add-${baseId}-${index}`,
          label: this.capitalizeWords(keyword.replace(/_/g, ' ')),
          type: index === keywords.length - 1 ? 'end' : 'process',
          position: { x: 250, y: 100 + index * 100 }, // Will be repositioned
          connections: index < keywords.length - 1 ? [`add-${baseId}-${index + 1}`] : []
        });
      });
    }
    
    return steps;
  }

  /**
   * Check if prompt needs clarification
   */
  private needsClarification(prompt: string): string | null {
    if (prompt.trim().length < 10) {
      return 'Could you provide more details about the process you want to create?';
    }

    if (!this.hasProcessKeywords(prompt)) {
      return 'What type of process are you looking to create? (e.g., risk management, compliance audit, incident response)';
    }

    return null;
  }

  /**
   * Check if prompt contains process-related keywords
   */
  private hasProcessKeywords(prompt: string): boolean {
    const processKeywords = ['process', 'flow', 'workflow', 'procedure', 'steps', 'management', 'audit', 'response', 'assessment'];
    return processKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Extract step label from edit prompt
   */
  private extractStepLabel(prompt: string): string {
    // Simple extraction - look for quoted text or text after "add"/"insert"
    const quotedMatch = prompt.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];

    const addMatch = prompt.match(/add\s+(.+?)(?:\s+to|\s+after|\s+before|$)/i);
    if (addMatch) return this.capitalizeWords(addMatch[1].trim());

    return 'New Step';
  }

  /**
   * Find step by label in prompt
   */
  private findStepByLabel(prompt: string, steps: ProcessStep[]): ProcessStep | null {
    for (const step of steps) {
      if (prompt.toLowerCase().includes(step.label.toLowerCase())) {
        return step;
      }
    }
    return null;
  }

  /**
   * Analyze prompt to extract process information
   */
  private analyzePrompt(prompt: string): {
    type: string;
    complexity: 'simple' | 'medium' | 'complex';
    domain: string;
    title: string;
    description: string;
    theme: 'professional' | 'security' | 'compliance' | 'business';
    keywords: string[];
  } {
    const lowerPrompt = prompt.toLowerCase();

    // Expanded domain detection
    let type = 'general';
    let domain = 'business';
    let theme: 'professional' | 'security' | 'compliance' | 'business' = 'professional';

    if (lowerPrompt.includes('risk') || lowerPrompt.includes('security') || lowerPrompt.includes('threat')) {
      type = 'risk_management';
      domain = 'security';
      theme = 'security';
    } else if (lowerPrompt.includes('audit') || lowerPrompt.includes('compliance') || lowerPrompt.includes('control')) {
      type = 'compliance';
      domain = 'compliance';
      theme = 'compliance';
    } else if (lowerPrompt.includes('incident') || lowerPrompt.includes('response')) {
      type = 'incident_response';
      domain = 'security';
      theme = 'security';
    } else if (lowerPrompt.includes('onboard') || lowerPrompt.includes('employee') || lowerPrompt.includes('hr')) {
      type = 'hr_process';
      domain = 'business';
      theme = 'business';
    } else if (lowerPrompt.includes('classification') || lowerPrompt.includes('information classification')) {
      type = 'information_classification';
      domain = 'security';
      theme = 'security';
    } else if (lowerPrompt.includes('data management') || lowerPrompt.includes('data governance')) {
      type = 'data_management';
      domain = 'security';
      theme = 'security';
    } else if (lowerPrompt.includes('yearly plan') || lowerPrompt.includes('annual plan') || lowerPrompt.includes('planning')) {
      type = 'yearly_plan';
      domain = 'business';
      theme = 'professional';
    }

    // Extract keywords for step generation
    const keywords = this.extractKeywords(prompt);

    // Determine complexity
    const complexity = keywords.length > 10 ? 'complex' : keywords.length > 5 ? 'medium' : 'simple';

    return {
      type,
      complexity,
      domain,
      title: this.generateTitle(prompt, type),
      description: `AI-generated ${type.replace('_', ' ')} process flow`,
      theme,
      keywords
    };
  }

  /**
   * Generate process steps based on analysis
   */
  private generateProcessSteps(analysis: any): ProcessStep[] {
    // Expanded process step generation for new types
    switch (analysis.type) {
      case 'risk_management':
        return this.generateRiskManagementSteps();
      case 'compliance':
        return this.generateComplianceSteps();
      case 'incident_response':
        return this.generateIncidentResponseSteps();
      case 'hr_process':
        return this.generateHRProcessSteps();
      case 'information_classification':
        return this.generateInformationClassificationSteps();
      case 'data_management':
        return this.generateDataManagementSteps();
      case 'yearly_plan':
        return this.generateYearlyPlanSteps();
      default:
        return this.generateSmartGenericProcessSteps(analysis.keywords, analysis.title);
    }
  }

  /**
   * Generate risk management process steps
   */
  private generateRiskManagementSteps(): ProcessStep[] {
    return [
      {
        id: 'start',
        label: 'Risk Assessment Initiated',
        type: 'start',
        position: { x: 250, y: 50 },
        connections: ['identify']
      },
      {
        id: 'identify',
        label: 'Identify Risk Sources',
        type: 'process',
        position: { x: 250, y: 150 },
        connections: ['analyze'],
        metadata: { responsible: 'Risk Team', duration: '2-3 days' }
      },
      {
        id: 'analyze',
        label: 'Analyze Risk Impact',
        type: 'process',
        position: { x: 250, y: 250 },
        connections: ['evaluate'],
        metadata: { responsible: 'Risk Analyst', duration: '1-2 days' }
      },
      {
        id: 'evaluate',
        label: 'Risk Level Acceptable?',
        type: 'decision',
        position: { x: 250, y: 350 },
        connections: ['accept', 'mitigate']
      },
      {
        id: 'accept',
        label: 'Accept Risk',
        type: 'process',
        position: { x: 100, y: 450 },
        connections: ['monitor'],
        metadata: { risk: 'low' }
      },
      {
        id: 'mitigate',
        label: 'Implement Mitigation',
        type: 'process',
        position: { x: 400, y: 450 },
        connections: ['monitor'],
        metadata: { risk: 'high' }
      },
      {
        id: 'monitor',
        label: 'Monitor & Review',
        type: 'process',
        position: { x: 250, y: 550 },
        connections: ['end']
      },
      {
        id: 'end',
        label: 'Risk Management Complete',
        type: 'end',
        position: { x: 250, y: 650 },
        connections: []
      }
    ];
  }

  /**
   * Generate compliance audit steps
   */
  private generateComplianceSteps(): ProcessStep[] {
    return [
      {
        id: 'start',
        label: 'Audit Planning',
        type: 'start',
        position: { x: 250, y: 50 },
        connections: ['scope']
      },
      {
        id: 'scope',
        label: 'Define Audit Scope',
        type: 'process',
        position: { x: 250, y: 150 },
        connections: ['evidence']
      },
      {
        id: 'evidence',
        label: 'Collect Evidence',
        type: 'process',
        position: { x: 250, y: 250 },
        connections: ['test']
      },
      {
        id: 'test',
        label: 'Test Controls',
        type: 'process',
        position: { x: 250, y: 350 },
        connections: ['findings']
      },
      {
        id: 'findings',
        label: 'Document Findings',
        type: 'process',
        position: { x: 250, y: 450 },
        connections: ['report']
      },
      {
        id: 'report',
        label: 'Generate Report',
        type: 'process',
        position: { x: 250, y: 550 },
        connections: ['end']
      },
      {
        id: 'end',
        label: 'Audit Complete',
        type: 'end',
        position: { x: 250, y: 650 },
        connections: []
      }
    ];
  }

  /**
   * Generate incident response steps
   */
  private generateIncidentResponseSteps(): ProcessStep[] {
    return [
      {
        id: 'start',
        label: 'Incident Detected',
        type: 'start',
        position: { x: 250, y: 50 },
        connections: ['assess']
      },
      {
        id: 'assess',
        label: 'Initial Assessment',
        type: 'process',
        position: { x: 250, y: 150 },
        connections: ['severity']
      },
      {
        id: 'severity',
        label: 'High Severity?',
        type: 'decision',
        position: { x: 250, y: 250 },
        connections: ['escalate', 'contain']
      },
      {
        id: 'escalate',
        label: 'Escalate to CISO',
        type: 'process',
        position: { x: 100, y: 350 },
        connections: ['contain']
      },
      {
        id: 'contain',
        label: 'Contain Incident',
        type: 'process',
        position: { x: 250, y: 450 },
        connections: ['investigate']
      },
      {
        id: 'investigate',
        label: 'Investigate Root Cause',
        type: 'process',
        position: { x: 250, y: 550 },
        connections: ['recover']
      },
      {
        id: 'recover',
        label: 'Recovery & Lessons',
        type: 'process',
        position: { x: 250, y: 650 },
        connections: ['end']
      },
      {
        id: 'end',
        label: 'Incident Closed',
        type: 'end',
        position: { x: 250, y: 750 },
        connections: []
      }
    ];
  }

  /**
   * Generate HR process steps
   */
  private generateHRProcessSteps(): ProcessStep[] {
    return [
      {
        id: 'start',
        label: 'New Hire Request',
        type: 'start',
        position: { x: 250, y: 50 },
        connections: ['approve']
      },
      {
        id: 'approve',
        label: 'Manager Approval?',
        type: 'decision',
        position: { x: 250, y: 150 },
        connections: ['reject', 'background']
      },
      {
        id: 'reject',
        label: 'Request Rejected',
        type: 'end',
        position: { x: 100, y: 250 },
        connections: []
      },
      {
        id: 'background',
        label: 'Background Check',
        type: 'process',
        position: { x: 400, y: 250 },
        connections: ['setup']
      },
      {
        id: 'setup',
        label: 'Setup Accounts',
        type: 'process',
        position: { x: 400, y: 350 },
        connections: ['orientation']
      },
      {
        id: 'orientation',
        label: 'Employee Orientation',
        type: 'process',
        position: { x: 400, y: 450 },
        connections: ['end']
      },
      {
        id: 'end',
        label: 'Onboarding Complete',
        type: 'end',
        position: { x: 400, y: 550 },
        connections: []
      }
    ];
  }

  // Add new process step generators for information security/business topics
  private generateInformationClassificationSteps(): ProcessStep[] {
    return [
      { id: 'start', label: 'Start Classification', type: 'start', position: { x: 250, y: 50 }, connections: ['identify'] },
      { id: 'identify', label: 'Identify Information Assets', type: 'process', position: { x: 250, y: 150 }, connections: ['categorize'] },
      { id: 'categorize', label: 'Categorize Data Types', type: 'process', position: { x: 250, y: 250 }, connections: ['assign'] },
      { id: 'assign', label: 'Assign Classification Levels', type: 'process', position: { x: 250, y: 350 }, connections: ['label'] },
      { id: 'label', label: 'Label Information', type: 'process', position: { x: 250, y: 450 }, connections: ['protect'] },
      { id: 'protect', label: 'Apply Protection Measures', type: 'process', position: { x: 250, y: 550 }, connections: ['review'] },
      { id: 'review', label: 'Review & Update', type: 'process', position: { x: 250, y: 650 }, connections: ['end'] },
      { id: 'end', label: 'Classification Complete', type: 'end', position: { x: 250, y: 750 }, connections: [] }
    ];
  }

  private generateDataManagementSteps(): ProcessStep[] {
    return [
      { id: 'start', label: 'Start Data Management', type: 'start', position: { x: 250, y: 50 }, connections: ['collect'] },
      { id: 'collect', label: 'Data Collection', type: 'process', position: { x: 250, y: 150 }, connections: ['store'] },
      { id: 'store', label: 'Data Storage', type: 'process', position: { x: 250, y: 250 }, connections: ['use'] },
      { id: 'use', label: 'Data Usage', type: 'process', position: { x: 250, y: 350 }, connections: ['share'] },
      { id: 'share', label: 'Data Sharing', type: 'process', position: { x: 250, y: 450 }, connections: ['archive'] },
      { id: 'archive', label: 'Data Archiving', type: 'process', position: { x: 250, y: 550 }, connections: ['delete'] },
      { id: 'delete', label: 'Data Deletion', type: 'process', position: { x: 250, y: 650 }, connections: ['end'] },
      { id: 'end', label: 'Data Management Complete', type: 'end', position: { x: 250, y: 750 }, connections: [] }
    ];
  }

  private generateYearlyPlanSteps(): ProcessStep[] {
    return [
      { id: 'start', label: 'Start Planning', type: 'start', position: { x: 250, y: 50 }, connections: ['gather'] },
      { id: 'gather', label: 'Gather Requirements', type: 'process', position: { x: 250, y: 150 }, connections: ['setgoals'] },
      { id: 'setgoals', label: 'Set Goals & Objectives', type: 'process', position: { x: 250, y: 250 }, connections: ['develop'] },
      { id: 'develop', label: 'Develop Action Plan', type: 'process', position: { x: 250, y: 350 }, connections: ['allocate'] },
      { id: 'allocate', label: 'Allocate Resources', type: 'process', position: { x: 250, y: 450 }, connections: ['timeline'] },
      { id: 'timeline', label: 'Establish Timeline', type: 'process', position: { x: 250, y: 550 }, connections: ['review'] },
      { id: 'review', label: 'Review & Approve', type: 'process', position: { x: 250, y: 650 }, connections: ['implement'] },
      { id: 'implement', label: 'Implement Plan', type: 'process', position: { x: 250, y: 750 }, connections: ['monitor'] },
      { id: 'monitor', label: 'Monitor Progress', type: 'process', position: { x: 250, y: 850 }, connections: ['end'] },
      { id: 'end', label: 'Plan Complete', type: 'end', position: { x: 250, y: 950 }, connections: [] }
    ];
  }

  // Improved generic process step generator
  private generateSmartGenericProcessSteps(keywords: string[], title: string): ProcessStep[] {
    // If no keywords, fallback to a basic process
    if (!keywords.length) {
      return [
        { id: 'start', label: 'Start', type: 'start', position: { x: 250, y: 50 }, connections: ['step1'] },
        { id: 'step1', label: 'Describe Process', type: 'process', position: { x: 250, y: 150 }, connections: ['end'] },
        { id: 'end', label: 'Complete', type: 'end', position: { x: 250, y: 250 }, connections: [] }
      ];
    }
    // Use keywords as step names, but make them more readable
    const steps: ProcessStep[] = [
      { id: 'start', label: `Start: ${title}`, type: 'start', position: { x: 250, y: 50 }, connections: ['step1'] }
    ];
    keywords.forEach((kw, idx) => {
      steps.push({
        id: `step${idx + 1}`,
        label: this.capitalizeWords(kw.replace(/_/g, ' ')),
        type: 'process',
        position: { x: 250, y: 150 + idx * 100 },
        connections: [idx < keywords.length - 1 ? `step${idx + 2}` : 'end']
      });
    });
    steps.push({
      id: 'end',
      label: 'Complete',
      type: 'end',
      position: { x: 250, y: 150 + keywords.length * 100 },
      connections: []
    });
    return steps;
  }

  /**
   * Generate Mermaid code from steps
   */
  private generateMermaidCode(steps: ProcessStep[], layout: string, theme: string): string {
    const direction = layout === 'left-right' ? 'LR' : 'TD';
    let code = `flowchart ${direction}\n`;

    // Add nodes
    steps.forEach(step => {
      const shape = this.getShapeForType(step.type);
      code += `    ${step.id}${shape.replace('LABEL', step.label)}\n`;
    });

    // Add connections
    steps.forEach(step => {
      step.connections.forEach(targetId => {
        code += `    ${step.id} --> ${targetId}\n`;
      });
    });

    // Add styling based on theme
    code += this.generateThemeStyles(steps, theme);

    return code;
  }

  /**
   * Helper methods
   */
  private extractKeywords(prompt: string): string[] {
    return prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'with', 'that', 'this', 'from'].includes(word))
      .slice(0, 10);
  }

  private generateTitle(prompt: string, _type: string): string {
    const words = prompt.split(' ').slice(0, 5);
    return this.capitalizeWords(words.join(' '));
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  private determineOptimalLayout(steps: ProcessStep[]): 'top-down' | 'left-right' | 'flowchart' {
    return steps.length > 6 ? 'top-down' : 'flowchart';
  }

  private getShapeForType(type: string): string {
    switch (type) {
      case 'start':
      case 'end':
        return '((LABEL))';
      case 'decision':
        return '{LABEL}';
      case 'process':
      default:
        return '[LABEL]';
    }
  }

  private generateThemeStyles(steps: ProcessStep[], theme: string): string {
    let styles = '\n    %% Theme Styling\n';

    const themeColors = {
      professional: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
      security: { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
      compliance: { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
      business: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' }
    } as const;
    type ThemeKey = keyof typeof themeColors;
    const validTheme = (t: string): t is ThemeKey => t in themeColors;
    const colors = validTheme(theme) ? themeColors[theme] : themeColors.professional;

    steps.forEach(step => {
      const color = step.type === 'start' || step.type === 'end' ? colors.primary :
                   step.type === 'decision' ? colors.secondary : colors.accent;

      styles += `    style ${step.id} fill:${color},stroke:#1e293b,stroke-width:2px,color:#fff\n`;
    });

    return styles;
  }
}
