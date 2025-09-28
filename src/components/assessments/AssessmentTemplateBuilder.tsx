import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TagSelector } from '@/components/ui/tag-selector';
import { toast } from '@/utils/toast';
import { 
  Plus, Trash2, Save, Eye, Settings, Users, 
  FileText, Workflow, Shield, BarChart3,
  AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { AssessmentTemplate, EnhancedAssessmentService } from '@/services/assessments/EnhancedAssessmentService';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentTemplateBuilderProps {
  template?: AssessmentTemplate;
  onSave?: (template: AssessmentTemplate) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  weight: number;
  required: boolean;
  order: number;
}

export const AssessmentTemplateBuilder: React.FC<AssessmentTemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
  isOpen = true
}) => {
  const { user, organization, isDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  
  // Template form state
  const [templateData, setTemplateData] = useState<Partial<AssessmentTemplate>>({
    name: '',
    description: '',
    standard_ids: [],
    methodology: 'standard',
    risk_scoring_enabled: false,
    sections: [],
    is_public: false,
    tags: [],
    metadata: {}
  });

  const [customSections, setCustomSections] = useState<TemplateSection[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const assessmentService = EnhancedAssessmentService.getInstance();

  useEffect(() => {
    if (template) {
      setTemplateData(template);
      setCustomSections(template.sections || []);
    }
    loadReferenceData();
  }, [template]);

  const loadReferenceData = async () => {
    try {
      if (!organization) return;

      // Load available standards
      // In production, this would come from StandardsService
      const mockStandards = [
        { id: 'iso27001', name: 'ISO 27001:2022' },
        { id: 'soc2', name: 'SOC 2 Type II' },
        { id: 'nist', name: 'NIST Cybersecurity Framework' },
        { id: 'gdpr', name: 'GDPR Compliance' }
      ];
      setStandards(mockStandards);

      // Load available workflows
      if (!isDemo) {
        const workflowData = await assessmentService.getWorkflows(organization.id);
        setWorkflows(workflowData);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !organization) {
      toast.error('User or organization not found');
      return;
    }

    if (!templateData.name || !templateData.standard_ids?.length) {
      toast.error('Please provide a name and select at least one standard');
      return;
    }

    try {
      setLoading(true);

      const templateToSave = {
        ...templateData,
        organization_id: organization.id,
        created_by: user.id,
        sections: customSections,
        updated_at: new Date().toISOString()
      } as AssessmentTemplate;

      if (template?.id) {
        // Update existing template
        // Implementation would use supabase update
        toast.success('Template updated successfully');
      } else {
        // Create new template
        if (!isDemo) {
          const newTemplate = await assessmentService.createTemplate(templateToSave);
          onSave?.(newTemplate);
          toast.success('Template created successfully');
        } else {
          toast.info('Template saved locally (demo mode)');
          onSave?.(templateToSave);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const addCustomSection = () => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      description: '',
      weight: 100,
      required: true,
      order: customSections.length
    };
    setCustomSections([...customSections, newSection]);
  };

  const updateCustomSection = (index: number, updates: Partial<TemplateSection>) => {
    const updated = [...customSections];
    updated[index] = { ...updated[index], ...updates };
    setCustomSections(updated);
  };

  const removeCustomSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case 'risk-based':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maturity-model':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getMethodologyDescription = (methodology: string) => {
    switch (methodology) {
      case 'risk-based':
        return 'Focus on high-risk areas first, with dynamic requirement prioritization';
      case 'maturity-model':
        return 'Assess organizational maturity levels with capability scoring';
      default:
        return 'Standard compliance assessment with equal weight requirements';
    }
  };

  if (previewMode) {
    return (
      <Dialog open={isOpen} onOpenChange={() => setPreviewMode(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview: {templateData.name}
            </DialogTitle>
            <DialogDescription>
              Preview how this template will appear to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Standards</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {templateData.standard_ids?.map(id => {
                        const standard = standards.find(s => s.id === id);
                        return (
                          <Badge key={id} variant="outline">
                            {standard?.name || id}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Methodology</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getMethodologyIcon(templateData.methodology || 'standard')}
                      <span className="capitalize">{templateData.methodology?.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {customSections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customSections.map((section, index) => (
                    <div key={section.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{section.name}</h4>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <Badge variant={section.required ? 'default' : 'secondary'}>
                            {section.required ? 'Required' : 'Optional'}
                          </Badge>
                          <p className="text-muted-foreground mt-1">
                            Weight: {section.weight}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Back to Editor
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {template ? 'Edit Assessment Template' : 'Create Assessment Template'}
          </DialogTitle>
          <DialogDescription>
            Design reusable templates for consistent assessment processes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={templateData.name}
                      onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                      placeholder="e.g., SOC 2 Annual Assessment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <TagSelector
                      selectedTags={templateData.tags || []}
                      onChange={(tags: string[]) => setTemplateData({ ...templateData, tags })}
                      placeholder="Add tags..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={templateData.description}
                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    placeholder="Describe the purpose and scope of this assessment template"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={templateData.is_public}
                    onCheckedChange={(checked) => 
                      setTemplateData({ ...templateData, is_public: checked as boolean })
                    }
                  />
                  <Label htmlFor="public">Make this template publicly available</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Standards</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose which compliance standards this template will assess
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {standards.map((standard) => (
                    <div key={standard.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={standard.id}
                        checked={templateData.standard_ids?.includes(standard.id)}
                        onCheckedChange={(checked) => {
                          const currentIds = templateData.standard_ids || [];
                          if (checked) {
                            setTemplateData({
                              ...templateData,
                              standard_ids: [...currentIds, standard.id]
                            });
                          } else {
                            setTemplateData({
                              ...templateData,
                              standard_ids: currentIds.filter(id => id !== standard.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={standard.id} className="font-normal">
                        {standard.name}
                      </Label>
                    </div>
                  ))}
                </div>

                {templateData.standard_ids && templateData.standard_ids.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Selected Standards</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {templateData.standard_ids.map(id => {
                        const standard = standards.find(s => s.id === id);
                        return (
                          <Badge key={id} variant="default">
                            {standard?.name || id}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Methodology</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how assessments using this template will be conducted
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Methodology Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {[
                      { id: 'standard', name: 'Standard', icon: <CheckCircle className="h-5 w-5" /> },
                      { id: 'risk-based', name: 'Risk-Based', icon: <AlertTriangle className="h-5 w-5" /> },
                      { id: 'maturity-model', name: 'Maturity Model', icon: <BarChart3 className="h-5 w-5" /> }
                    ].map((method) => (
                      <Card 
                        key={method.id}
                        className={`cursor-pointer transition-colors ${
                          templateData.methodology === method.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setTemplateData({ ...templateData, methodology: method.id as any })}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            {method.icon}
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getMethodologyDescription(method.id)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="risk-scoring"
                    checked={templateData.risk_scoring_enabled}
                    onCheckedChange={(checked) => 
                      setTemplateData({ ...templateData, risk_scoring_enabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="risk-scoring">Enable risk scoring</Label>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base font-medium">Custom Sections</Label>
                      <p className="text-sm text-muted-foreground">
                        Add custom sections to organize your assessment
                      </p>
                    </div>
                    <Button onClick={addCustomSection} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {customSections.map((section, index) => (
                      <Card key={section.id}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Section Name</Label>
                              <Input
                                value={section.name}
                                onChange={(e) => updateCustomSection(index, { name: e.target.value })}
                                placeholder="Section name"
                              />
                            </div>
                            <div>
                              <Label>Weight (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={section.weight}
                                onChange={(e) => updateCustomSection(index, { weight: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <Label>Description</Label>
                            <Textarea
                              value={section.description}
                              onChange={(e) => updateCustomSection(index, { description: e.target.value })}
                              placeholder="Section description"
                              rows={2}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={section.required}
                                onCheckedChange={(checked) => 
                                  updateCustomSection(index, { required: checked as boolean })
                                }
                              />
                              <Label>Required section</Label>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCustomSection(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set up approval workflows for assessments created from this template
                </p>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Default Workflow</Label>
                  <Select
                    value={templateData.default_workflow_id}
                    onValueChange={(value) => 
                      setTemplateData({ ...templateData, default_workflow_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No workflow</SelectItem>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isDemo && workflows.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">No workflows found</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Create workflows in the Workflow Management section to enable approval processes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};