import React from 'react';
import { PhishingTemplate, AIConfig } from '../types';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { TemplateList } from './TemplateList';

interface TemplateManagerProps {
  templates: PhishingTemplate[];
  showTemplateEditor: boolean;
  selectedTemplate: PhishingTemplate | null;
  newTemplate: Partial<PhishingTemplate>;
  templateSearchQuery: string;
  templateCategoryFilter: string;
  uniqueCategories: string[];
  aiConfig: AIConfig;
  setShowTemplateEditor: (show: boolean) => void;
  setSelectedTemplate: (template: PhishingTemplate | null) => void;
  setNewTemplate: (template: Partial<PhishingTemplate>) => void;
  setTemplateSearchQuery: (query: string) => void;
  setTemplateCategoryFilter: (category: string) => void;
  setAIConfig: (config: AIConfig) => void;
  handleCreateTemplate: () => void;
  handleUpdateTemplate: () => void;
  handleEditTemplate: (template: PhishingTemplate) => void;
  handleDuplicateTemplate: (template: PhishingTemplate) => void;
  handleDeleteTemplate: (templateId: string) => void;
  addTrackingLink: () => void;
  removeTrackingLink: (index: number) => void;
  generateQRCode: () => void;
  removeQRCode: (index: number) => void;
  generatePhishingTemplate: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  showTemplateEditor,
  selectedTemplate,
  newTemplate,
  templateSearchQuery,
  templateCategoryFilter,
  uniqueCategories,
  aiConfig,
  setShowTemplateEditor,
  setSelectedTemplate,
  setNewTemplate,
  setTemplateSearchQuery,
  setTemplateCategoryFilter,
  setAIConfig,
  handleCreateTemplate,
  handleUpdateTemplate,
  handleEditTemplate,
  handleDuplicateTemplate,
  handleDeleteTemplate,
  addTrackingLink,
  removeTrackingLink,
  generateQRCode,
  removeQRCode,
  generatePhishingTemplate
}) => {
  const handleClose = () => {
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      difficultyLevel: 'Medium',
      category: 'General',
      html: '',
      trackingLinks: [
        {
          url: 'https://tracking.example.com/click?id=' + Date.now(),
          displayText: 'Click Here',
          trackingId: 'link-' + Date.now()
        }
      ],
      qrCodes: []
    });
    setShowTemplateEditor(true);
  };

  if (showTemplateEditor) {
    return (
      <EmailTemplateEditor
        selectedTemplate={selectedTemplate}
        newTemplate={newTemplate}
        aiConfig={aiConfig}
        onTemplateChange={setNewTemplate}
        onAIConfigChange={setAIConfig}
        onClose={handleClose}
        onSave={handleCreateTemplate}
        onUpdate={handleUpdateTemplate}
        onAddTrackingLink={addTrackingLink}
        onRemoveTrackingLink={removeTrackingLink}
        onAddQRCode={generateQRCode}
        onRemoveQRCode={removeQRCode}
        onGenerateTemplate={generatePhishingTemplate}
      />
    );
  }

  return (
    <TemplateList
      templates={templates}
      searchQuery={templateSearchQuery}
      categoryFilter={templateCategoryFilter}
      uniqueCategories={uniqueCategories}
      onSearchChange={setTemplateSearchQuery}
      onCategoryFilterChange={setTemplateCategoryFilter}
      onCreateNew={handleCreateNew}
      onEdit={handleEditTemplate}
      onDuplicate={handleDuplicateTemplate}
      onDelete={handleDeleteTemplate}
    />
  );
};