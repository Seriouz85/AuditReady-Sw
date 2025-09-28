import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Save } from 'lucide-react';
import { PhishingTemplate, AIConfig } from '../types';
import { TemplateForm } from './TemplateForm';
import { AITemplateGenerator } from './AITemplateGenerator';
import { EmailPreview } from './EmailPreview';

interface EmailTemplateEditorProps {
  selectedTemplate: PhishingTemplate | null;
  newTemplate: Partial<PhishingTemplate>;
  aiConfig: AIConfig;
  onTemplateChange: (template: Partial<PhishingTemplate>) => void;
  onAIConfigChange: (config: AIConfig) => void;
  onClose: () => void;
  onSave: () => void;
  onUpdate: () => void;
  onAddTrackingLink: () => void;
  onRemoveTrackingLink: (index: number) => void;
  onAddQRCode: () => void;
  onRemoveQRCode: (index: number) => void;
  onGenerateTemplate: () => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  selectedTemplate,
  newTemplate,
  aiConfig,
  onTemplateChange,
  onAIConfigChange,
  onClose,
  onSave,
  onUpdate,
  onAddTrackingLink,
  onRemoveTrackingLink,
  onAddQRCode,
  onRemoveQRCode,
  onGenerateTemplate
}) => {
  return (
    <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent -z-10"></div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {selectedTemplate ? `Edit Template: ${selectedTemplate.name}` : 'Create New Template'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
          <Trash2 className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TemplateForm
            template={newTemplate}
            onTemplateChange={onTemplateChange}
            onAddTrackingLink={onAddTrackingLink}
            onRemoveTrackingLink={onRemoveTrackingLink}
            onAddQRCode={onAddQRCode}
            onRemoveQRCode={onRemoveQRCode}
          />
          
          <AITemplateGenerator
            aiConfig={aiConfig}
            onAIConfigChange={onAIConfigChange}
            onGenerateTemplate={onGenerateTemplate}
          />
        </div>
        
        <div className="space-y-6">
          <EmailPreview template={newTemplate} />
          
          <div className="flex justify-between items-center pt-2">
            <div />
            <div>
              <Button variant="outline" className="mr-2" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                onClick={selectedTemplate ? onUpdate : onSave}
              >
                <Save className="mr-2 h-4 w-4" />
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};