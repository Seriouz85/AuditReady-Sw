import * as fabric from 'fabric';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  priority: number;
  category: 'audit' | 'risk' | 'compliance' | 'process' | 'general';
}

export interface WorkflowTrigger {
  type: 'object:added' | 'object:modified' | 'object:selected' | 'text:changed' | 'canvas:loaded' | 'timer' | 'manual';
  objectType?: string;
  delay?: number; // milliseconds
  conditions?: any;
}

export interface WorkflowCondition {
  type: 'object:count' | 'object:type' | 'text:contains' | 'canvas:size' | 'time:elapsed' | 'custom';
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'matches' | 'exists';
  value: any;
  objectId?: string;
}

export interface WorkflowAction {
  type: 'create:object' | 'modify:object' | 'connect:objects' | 'apply:template' | 'suggest:content' | 'notify:user' | 'auto:align' | 'auto:format';
  parameters: any;
  delay?: number;
}

export interface WorkflowExecution {
  id: string;
  ruleId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: WorkflowStep[];
  error?: string;
}

export interface WorkflowStep {
  action: WorkflowAction;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export class WorkflowAutomationEngine {
  private canvas: fabric.Canvas;
  private rules: Map<string, WorkflowRule> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private isEnabled: boolean = true;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.loadBuiltInRules();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', (e) => this.handleTrigger('object:added', e));
    this.canvas.on('object:modified', (e) => this.handleTrigger('object:modified', e));
    this.canvas.on('selection:created', (e) => this.handleTrigger('object:selected', e));
    this.canvas.on('text:changed', (e) => this.handleTrigger('text:changed', e));
  }

  private loadBuiltInRules(): void {
    // Auto-connect related audit elements
    this.addRule({
      id: 'auto-connect-audit-flow',
      name: 'Auto-Connect Audit Flow',
      description: 'Automatically connect audit process steps',
      trigger: { type: 'object:added', objectType: 'rect' },
      conditions: [
        { type: 'object:count', operator: 'greater', value: 1 },
        { type: 'text:contains', operator: 'contains', value: 'audit|process|step' }
      ],
      actions: [
        { type: 'suggest:content', parameters: { type: 'connector', message: 'Connect this step to the workflow?' } }
      ],
      enabled: true,
      priority: 1,
      category: 'audit'
    });

    // Auto-format risk matrices
    this.addRule({
      id: 'auto-format-risk-matrix',
      name: 'Auto-Format Risk Matrix',
      description: 'Automatically format and color-code risk matrices',
      trigger: { type: 'object:added', objectType: 'rect' },
      conditions: [
        { type: 'object:count', operator: 'greater', value: 8 },
        { type: 'text:contains', operator: 'contains', value: 'risk|high|medium|low' }
      ],
      actions: [
        { type: 'auto:format', parameters: { type: 'risk-matrix', colors: ['#ef4444', '#f59e0b', '#10b981'] } }
      ],
      enabled: true,
      priority: 2,
      category: 'risk'
    });

    // Smart compliance checklist
    this.addRule({
      id: 'smart-compliance-checklist',
      name: 'Smart Compliance Checklist',
      description: 'Auto-generate compliance checklist items',
      trigger: { type: 'text:changed' },
      conditions: [
        { type: 'text:contains', operator: 'contains', value: 'ISO|SOX|GDPR|compliance' }
      ],
      actions: [
        { type: 'suggest:content', parameters: { type: 'checklist', framework: 'detected' } }
      ],
      enabled: true,
      priority: 3,
      category: 'compliance'
    });

    // Auto-align process flows
    this.addRule({
      id: 'auto-align-process-flow',
      name: 'Auto-Align Process Flow',
      description: 'Automatically align process flow elements',
      trigger: { type: 'object:modified' },
      conditions: [
        { type: 'object:count', operator: 'greater', value: 2 },
        { type: 'object:type', operator: 'equals', value: 'rect' }
      ],
      actions: [
        { type: 'auto:align', parameters: { type: 'horizontal', spacing: 50 }, delay: 1000 }
      ],
      enabled: true,
      priority: 4,
      category: 'process'
    });

    // Smart template suggestions
    this.addRule({
      id: 'smart-template-suggestions',
      name: 'Smart Template Suggestions',
      description: 'Suggest relevant templates based on content',
      trigger: { type: 'object:added' },
      conditions: [
        { type: 'object:count', operator: 'equals', value: 1 }
      ],
      actions: [
        { type: 'suggest:content', parameters: { type: 'template', delay: 3000 } }
      ],
      enabled: true,
      priority: 5,
      category: 'general'
    });
  }

  private async handleTrigger(triggerType: WorkflowTrigger['type'], event: any): Promise<void> {
    if (!this.isEnabled) return;

    const relevantRules = Array.from(this.rules.values()).filter(rule => 
      rule.enabled && rule.trigger.type === triggerType
    );

    for (const rule of relevantRules) {
      if (await this.evaluateConditions(rule.conditions, event)) {
        this.executeRule(rule, event);
      }
    }
  }

  private async evaluateConditions(conditions: WorkflowCondition[], event: any): Promise<boolean> {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, event)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: WorkflowCondition, event: any): Promise<boolean> {
    switch (condition.type) {
      case 'object:count':
        const objectCount = this.canvas.getObjects().filter(obj => 
          !obj.isConnectionPoint && !obj.isConnector
        ).length;
        return this.compareValues(objectCount, condition.operator, condition.value);

      case 'object:type':
        const targetObject = event.target || event.e?.target;
        if (!targetObject) return false;
        return this.compareValues(targetObject.type, condition.operator, condition.value);

      case 'text:contains':
        const textObjects = this.canvas.getObjects().filter(obj => 
          obj.type === 'i-text' || obj.type === 'text'
        );
        const allText = textObjects.map(obj => (obj as fabric.IText).text || '').join(' ').toLowerCase();
        const searchTerms = condition.value.toLowerCase().split('|');
        return searchTerms.some(term => allText.includes(term));

      case 'canvas:size':
        const canvasSize = this.canvas.getObjects().length;
        return this.compareValues(canvasSize, condition.operator, condition.value);

      case 'time:elapsed':
        // Implementation for time-based conditions
        return true;

      default:
        return true;
    }
  }

  private compareValues(actual: any, operator: WorkflowCondition['operator'], expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'greater':
        return actual > expected;
      case 'less':
        return actual < expected;
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case 'matches':
        return new RegExp(expected).test(String(actual));
      case 'exists':
        return actual !== null && actual !== undefined;
      default:
        return false;
    }
  }

  private async executeRule(rule: WorkflowRule, event: any): Promise<void> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      startTime: new Date(),
      status: 'running',
      steps: []
    };

    this.executions.set(execution.id, execution);
    this.emit('execution:started', { execution, rule });

    try {
      for (const action of rule.actions) {
        const step: WorkflowStep = {
          action,
          startTime: new Date(),
          status: 'running'
        };

        execution.steps.push(step);

        if (action.delay) {
          await this.delay(action.delay);
        }

        const result = await this.executeAction(action, event, rule);
        
        step.endTime = new Date();
        step.status = 'completed';
        step.result = result;
      }

      execution.endTime = new Date();
      execution.status = 'completed';
      this.emit('execution:completed', { execution, rule });

    } catch (error) {
      execution.endTime = new Date();
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('execution:failed', { execution, rule, error });
    }
  }

  private async executeAction(action: WorkflowAction, event: any, rule: WorkflowRule): Promise<any> {
    switch (action.type) {
      case 'create:object':
        return this.createObject(action.parameters);

      case 'modify:object':
        return this.modifyObject(action.parameters, event);

      case 'connect:objects':
        return this.connectObjects(action.parameters);

      case 'apply:template':
        return this.applyTemplate(action.parameters);

      case 'suggest:content':
        return this.suggestContent(action.parameters, rule);

      case 'notify:user':
        return this.notifyUser(action.parameters);

      case 'auto:align':
        return this.autoAlign(action.parameters);

      case 'auto:format':
        return this.autoFormat(action.parameters);

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return null;
    }
  }

  private async createObject(parameters: any): Promise<fabric.Object> {
    // Implementation for creating objects
    const { type, properties } = parameters;
    
    switch (type) {
      case 'connector':
        // Create a connector line
        const line = new fabric.Line([0, 0, 100, 0], {
          stroke: '#6b7280',
          strokeWidth: 2,
          selectable: true
        });
        this.canvas.add(line);
        return line;

      default:
        throw new Error(`Unknown object type: ${type}`);
    }
  }

  private async modifyObject(parameters: any, event: any): Promise<void> {
    const targetObject = event.target;
    if (!targetObject) return;

    Object.keys(parameters).forEach(key => {
      targetObject.set(key, parameters[key]);
    });

    this.canvas.renderAll();
  }

  private async connectObjects(parameters: any): Promise<void> {
    // Implementation for connecting objects
    console.log('Connecting objects:', parameters);
  }

  private async applyTemplate(parameters: any): Promise<void> {
    // Implementation for applying templates
    console.log('Applying template:', parameters);
  }

  private async suggestContent(parameters: any, rule: WorkflowRule): Promise<void> {
    this.emit('content:suggestion', {
      type: parameters.type,
      message: parameters.message || `${rule.name}: ${rule.description}`,
      parameters,
      rule
    });
  }

  private async notifyUser(parameters: any): Promise<void> {
    this.emit('user:notification', {
      type: parameters.type || 'info',
      message: parameters.message,
      duration: parameters.duration || 5000
    });
  }

  private async autoAlign(parameters: any): Promise<void> {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector && obj.type === 'rect'
    );

    if (objects.length < 2) return;

    switch (parameters.type) {
      case 'horizontal':
        const baseY = objects[0].top || 0;
        objects.forEach((obj, index) => {
          obj.set({
            top: baseY,
            left: (obj.left || 0) + index * (parameters.spacing || 50)
          });
        });
        break;

      case 'vertical':
        const baseX = objects[0].left || 0;
        objects.forEach((obj, index) => {
          obj.set({
            left: baseX,
            top: (obj.top || 0) + index * (parameters.spacing || 50)
          });
        });
        break;
    }

    this.canvas.renderAll();
  }

  private async autoFormat(parameters: any): Promise<void> {
    const objects = this.canvas.getObjects().filter(obj => obj.type === 'rect');

    if (parameters.type === 'risk-matrix' && objects.length >= 9) {
      const colors = parameters.colors || ['#ef4444', '#f59e0b', '#10b981'];
      
      objects.forEach((obj, index) => {
        const colorIndex = Math.floor(index / 3) % colors.length;
        obj.set('fill', colors[colorIndex]);
      });

      this.canvas.renderAll();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  public addRule(rule: WorkflowRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule:added', rule);
  }

  public removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.emit('rule:removed', ruleId);
    }
    return removed;
  }

  public getRule(ruleId: string): WorkflowRule | undefined {
    return this.rules.get(ruleId);
  }

  public getAllRules(): WorkflowRule[] {
    return Array.from(this.rules.values());
  }

  public enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.emit('rule:enabled', rule);
    }
  }

  public disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      this.emit('rule:disabled', rule);
    }
  }

  public async executeRuleManually(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    await this.executeRule(rule, { manual: true });
  }

  public getExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  public getExecutionsByRule(ruleId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(exec => exec.ruleId === ruleId);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.emit('engine:toggled', enabled);
  }

  public isEngineEnabled(): boolean {
    return this.isEnabled;
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public cleanup(): void {
    this.canvas.off('object:added');
    this.canvas.off('object:modified');
    this.canvas.off('selection:created');
    this.canvas.off('text:changed');
    
    this.rules.clear();
    this.executions.clear();
    this.eventHandlers.clear();
  }
}

// Singleton instance
let workflowAutomationEngineInstance: WorkflowAutomationEngine | null = null;

export const getWorkflowAutomationEngine = (canvas?: fabric.Canvas): WorkflowAutomationEngine | null => {
  if (canvas && !workflowAutomationEngineInstance) {
    workflowAutomationEngineInstance = new WorkflowAutomationEngine(canvas);
  }
  return workflowAutomationEngineInstance;
};

export const cleanupWorkflowAutomationEngine = (): void => {
  if (workflowAutomationEngineInstance) {
    workflowAutomationEngineInstance.cleanup();
    workflowAutomationEngineInstance = null;
  }
};
