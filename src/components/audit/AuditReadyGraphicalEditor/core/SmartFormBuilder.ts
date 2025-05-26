import * as fabric from 'fabric';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'number' | 'email' | 'signature';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FormValidation;
  options?: string[]; // For select, radio
  defaultValue?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: FormFieldStyle;
}

export interface FormValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

export interface FormFieldStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
}

export interface SmartForm {
  id: string;
  name: string;
  description: string;
  category: 'audit' | 'risk' | 'compliance' | 'assessment' | 'checklist';
  fields: FormField[];
  layout: FormLayout;
  styling: FormStyling;
  logic: FormLogic[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author: string;
  };
}

export interface FormLayout {
  type: 'single-column' | 'two-column' | 'grid' | 'custom';
  spacing: number;
  margins: { top: number; right: number; bottom: number; left: number };
  alignment: 'left' | 'center' | 'right';
}

export interface FormStyling {
  theme: 'professional' | 'modern' | 'minimal' | 'audit-ready';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: any;
  fieldStyle: any;
}

export interface FormLogic {
  id: string;
  type: 'show' | 'hide' | 'require' | 'calculate' | 'validate';
  trigger: { fieldId: string; condition: string; value: any };
  target: string[]; // Field IDs affected
  action: any;
}

export class SmartFormBuilder {
  private canvas: fabric.Canvas;
  private forms: Map<string, SmartForm> = new Map();
  private currentForm: SmartForm | null = null;
  private fieldObjects: Map<string, fabric.Object[]> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.loadBuiltInForms();
  }

  private loadBuiltInForms(): void {
    // Audit Checklist Form
    this.createForm({
      name: 'Audit Checklist Form',
      description: 'Standard audit checklist with checkboxes and comments',
      category: 'audit',
      layout: { type: 'single-column', spacing: 20, margins: { top: 20, right: 20, bottom: 20, left: 20 }, alignment: 'left' },
      styling: { 
        theme: 'audit-ready', 
        primaryColor: '#2563eb', 
        secondaryColor: '#64748b',
        fontFamily: 'Arial',
        headerStyle: {},
        fieldStyle: {}
      },
      logic: [],
      fields: [
        {
          type: 'text',
          label: 'Audit Title',
          required: true,
          placeholder: 'Enter audit title...'
        },
        {
          type: 'date',
          label: 'Audit Date',
          required: true
        },
        {
          type: 'checkbox',
          label: 'Access controls are properly implemented',
          required: false
        },
        {
          type: 'checkbox',
          label: 'User access reviews are conducted regularly',
          required: false
        },
        {
          type: 'textarea',
          label: 'Additional Comments',
          required: false,
          placeholder: 'Enter any additional observations...'
        }
      ]
    });

    // Risk Assessment Form
    this.createForm({
      name: 'Risk Assessment Form',
      description: 'Comprehensive risk assessment with scoring',
      category: 'risk',
      layout: { type: 'two-column', spacing: 15, margins: { top: 20, right: 20, bottom: 20, left: 20 }, alignment: 'left' },
      styling: { 
        theme: 'professional', 
        primaryColor: '#dc2626', 
        secondaryColor: '#64748b',
        fontFamily: 'Arial',
        headerStyle: {},
        fieldStyle: {}
      },
      logic: [
        {
          id: 'calc_risk_score',
          type: 'calculate',
          trigger: { fieldId: 'likelihood', condition: 'changed', value: null },
          target: ['risk_score'],
          action: { formula: 'likelihood * impact' }
        }
      ],
      fields: [
        {
          type: 'text',
          label: 'Risk Description',
          required: true,
          placeholder: 'Describe the risk...'
        },
        {
          type: 'select',
          label: 'Risk Category',
          required: true,
          options: ['Operational', 'Financial', 'Strategic', 'Compliance', 'Reputational']
        },
        {
          type: 'radio',
          label: 'Likelihood',
          required: true,
          options: ['Low (1)', 'Medium (2)', 'High (3)']
        },
        {
          type: 'radio',
          label: 'Impact',
          required: true,
          options: ['Low (1)', 'Medium (2)', 'High (3)']
        },
        {
          type: 'number',
          label: 'Risk Score',
          required: false,
          validation: { min: 1, max: 9 }
        }
      ]
    });

    // Compliance Checklist Form
    this.createForm({
      name: 'Compliance Checklist',
      description: 'Regulatory compliance verification form',
      category: 'compliance',
      layout: { type: 'single-column', spacing: 18, margins: { top: 20, right: 20, bottom: 20, left: 20 }, alignment: 'left' },
      styling: { 
        theme: 'minimal', 
        primaryColor: '#059669', 
        secondaryColor: '#64748b',
        fontFamily: 'Arial',
        headerStyle: {},
        fieldStyle: {}
      },
      logic: [],
      fields: [
        {
          type: 'select',
          label: 'Compliance Framework',
          required: true,
          options: ['ISO 27001', 'SOX', 'GDPR', 'HIPAA', 'PCI DSS']
        },
        {
          type: 'checkbox',
          label: 'Policies and procedures are documented',
          required: false
        },
        {
          type: 'checkbox',
          label: 'Staff training is up to date',
          required: false
        },
        {
          type: 'checkbox',
          label: 'Regular compliance monitoring is performed',
          required: false
        },
        {
          type: 'signature',
          label: 'Auditor Signature',
          required: true
        }
      ]
    });
  }

  public createForm(formData: Partial<SmartForm>): SmartForm {
    const form: SmartForm = {
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name || 'New Form',
      description: formData.description || '',
      category: formData.category || 'audit',
      fields: [],
      layout: formData.layout || { 
        type: 'single-column', 
        spacing: 20, 
        margins: { top: 20, right: 20, bottom: 20, left: 20 }, 
        alignment: 'left' 
      },
      styling: formData.styling || {
        theme: 'audit-ready',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Arial',
        headerStyle: {},
        fieldStyle: {}
      },
      logic: formData.logic || [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        author: 'User'
      }
    };

    // Process fields if provided
    if (formData.fields) {
      formData.fields.forEach((fieldData, index) => {
        this.addFieldToForm(form, fieldData, index);
      });
    }

    this.forms.set(form.id, form);
    this.emit('form:created', form);
    return form;
  }

  private addFieldToForm(form: SmartForm, fieldData: Partial<FormField>, index: number): FormField {
    const field: FormField = {
      id: `field_${Date.now()}_${index}`,
      type: fieldData.type || 'text',
      label: fieldData.label || 'New Field',
      placeholder: fieldData.placeholder,
      required: fieldData.required || false,
      validation: fieldData.validation,
      options: fieldData.options,
      defaultValue: fieldData.defaultValue,
      position: fieldData.position || this.calculateFieldPosition(form, index),
      size: fieldData.size || this.getDefaultFieldSize(fieldData.type || 'text'),
      style: fieldData.style || this.getDefaultFieldStyle(form.styling)
    };

    form.fields.push(field);
    return field;
  }

  private calculateFieldPosition(form: SmartForm, index: number): { x: number; y: number } {
    const { layout } = form;
    const baseX = layout.margins.left;
    const baseY = layout.margins.top + (index * (40 + layout.spacing));

    switch (layout.type) {
      case 'single-column':
        return { x: baseX, y: baseY };
      case 'two-column':
        const columnWidth = 300;
        const column = index % 2;
        return { 
          x: baseX + (column * (columnWidth + 20)), 
          y: layout.margins.top + (Math.floor(index / 2) * (40 + layout.spacing))
        };
      default:
        return { x: baseX, y: baseY };
    }
  }

  private getDefaultFieldSize(type: FormField['type']): { width: number; height: number } {
    switch (type) {
      case 'textarea':
        return { width: 300, height: 80 };
      case 'signature':
        return { width: 250, height: 60 };
      default:
        return { width: 200, height: 30 };
    }
  }

  private getDefaultFieldStyle(styling: FormStyling): FormFieldStyle {
    return {
      fontSize: 14,
      fontFamily: styling.fontFamily,
      textColor: '#374151',
      backgroundColor: '#ffffff',
      borderColor: styling.secondaryColor,
      borderWidth: 1,
      borderRadius: 4,
      padding: 8
    };
  }

  public async renderFormOnCanvas(formId: string): Promise<void> {
    const form = this.forms.get(formId);
    if (!form) {
      throw new Error(`Form not found: ${formId}`);
    }

    // Clear existing form objects
    this.clearFormFromCanvas();

    const objects: fabric.Object[] = [];

    // Render form title
    const titleText = new fabric.IText(form.name, {
      left: form.layout.margins.left,
      top: form.layout.margins.top - 40,
      fontSize: 20,
      fontWeight: 'bold',
      fill: form.styling.primaryColor,
      selectable: false
    });
    objects.push(titleText);

    // Render fields
    for (const field of form.fields) {
      const fieldObjects = await this.renderField(field, form);
      objects.push(...fieldObjects);
    }

    // Add all objects to canvas
    objects.forEach(obj => this.canvas.add(obj));
    this.fieldObjects.set(formId, objects);
    this.currentForm = form;
    this.canvas.renderAll();

    this.emit('form:rendered', form);
  }

  private async renderField(field: FormField, form: SmartForm): Promise<fabric.Object[]> {
    const objects: fabric.Object[] = [];

    // Field label
    const label = new fabric.Text(field.label + (field.required ? ' *' : ''), {
      left: field.position.x,
      top: field.position.y - 20,
      fontSize: field.style.fontSize - 2,
      fill: field.style.textColor,
      fontFamily: field.style.fontFamily,
      selectable: false
    });
    objects.push(label);

    // Field input based on type
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        const textInput = this.createTextInput(field);
        objects.push(textInput);
        break;

      case 'textarea':
        const textareaInput = this.createTextareaInput(field);
        objects.push(textareaInput);
        break;

      case 'checkbox':
        const checkbox = this.createCheckbox(field);
        objects.push(...checkbox);
        break;

      case 'radio':
        const radioGroup = this.createRadioGroup(field);
        objects.push(...radioGroup);
        break;

      case 'select':
        const select = this.createSelect(field);
        objects.push(select);
        break;

      case 'date':
        const dateInput = this.createDateInput(field);
        objects.push(dateInput);
        break;

      case 'signature':
        const signature = this.createSignatureField(field);
        objects.push(signature);
        break;
    }

    return objects;
  }

  private createTextInput(field: FormField): fabric.Object {
    const rect = new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fill: field.style.backgroundColor,
      stroke: field.style.borderColor,
      strokeWidth: field.style.borderWidth,
      rx: field.style.borderRadius,
      ry: field.style.borderRadius,
      selectable: false
    });

    return rect;
  }

  private createTextareaInput(field: FormField): fabric.Object {
    return new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fill: field.style.backgroundColor,
      stroke: field.style.borderColor,
      strokeWidth: field.style.borderWidth,
      rx: field.style.borderRadius,
      ry: field.style.borderRadius,
      selectable: false
    });
  }

  private createCheckbox(field: FormField): fabric.Object[] {
    const checkbox = new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: 16,
      height: 16,
      fill: field.style.backgroundColor,
      stroke: field.style.borderColor,
      strokeWidth: field.style.borderWidth,
      selectable: false
    });

    return [checkbox];
  }

  private createRadioGroup(field: FormField): fabric.Object[] {
    const objects: fabric.Object[] = [];
    
    field.options?.forEach((option, index) => {
      const radio = new fabric.Circle({
        left: field.position.x,
        top: field.position.y + (index * 25),
        radius: 8,
        fill: field.style.backgroundColor,
        stroke: field.style.borderColor,
        strokeWidth: field.style.borderWidth,
        selectable: false
      });

      const optionText = new fabric.Text(option, {
        left: field.position.x + 20,
        top: field.position.y + (index * 25) - 6,
        fontSize: field.style.fontSize - 2,
        fill: field.style.textColor,
        selectable: false
      });

      objects.push(radio, optionText);
    });

    return objects;
  }

  private createSelect(field: FormField): fabric.Object {
    return new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fill: field.style.backgroundColor,
      stroke: field.style.borderColor,
      strokeWidth: field.style.borderWidth,
      rx: field.style.borderRadius,
      ry: field.style.borderRadius,
      selectable: false
    });
  }

  private createDateInput(field: FormField): fabric.Object {
    return new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fill: field.style.backgroundColor,
      stroke: field.style.borderColor,
      strokeWidth: field.style.borderWidth,
      rx: field.style.borderRadius,
      ry: field.style.borderRadius,
      selectable: false
    });
  }

  private createSignatureField(field: FormField): fabric.Object {
    return new fabric.Rect({
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fill: '#f9fafb',
      stroke: '#d1d5db',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      rx: field.style.borderRadius,
      ry: field.style.borderRadius,
      selectable: false
    });
  }

  public clearFormFromCanvas(): void {
    if (this.currentForm) {
      const objects = this.fieldObjects.get(this.currentForm.id);
      if (objects) {
        objects.forEach(obj => this.canvas.remove(obj));
        this.fieldObjects.delete(this.currentForm.id);
      }
    }
    this.currentForm = null;
    this.canvas.renderAll();
  }

  public getAllForms(): SmartForm[] {
    return Array.from(this.forms.values());
  }

  public getForm(formId: string): SmartForm | undefined {
    return this.forms.get(formId);
  }

  public deleteForm(formId: string): boolean {
    const deleted = this.forms.delete(formId);
    if (deleted) {
      this.emit('form:deleted', formId);
    }
    return deleted;
  }

  public exportFormData(formId: string): any {
    const form = this.forms.get(formId);
    if (!form) return null;

    return {
      form,
      data: form.fields.map(field => ({
        fieldId: field.id,
        label: field.label,
        type: field.type,
        value: field.defaultValue || null
      }))
    };
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
    this.clearFormFromCanvas();
    this.forms.clear();
    this.fieldObjects.clear();
    this.eventHandlers.clear();
  }
}

// Singleton instance
let smartFormBuilderInstance: SmartFormBuilder | null = null;

export const getSmartFormBuilder = (canvas?: fabric.Canvas): SmartFormBuilder | null => {
  if (canvas && !smartFormBuilderInstance) {
    smartFormBuilderInstance = new SmartFormBuilder(canvas);
  }
  return smartFormBuilderInstance;
};

export const cleanupSmartFormBuilder = (): void => {
  if (smartFormBuilderInstance) {
    smartFormBuilderInstance.cleanup();
    smartFormBuilderInstance = null;
  }
};
