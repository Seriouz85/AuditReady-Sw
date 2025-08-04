import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/services/admin/AdminService';
import { toast } from '@/utils/toast';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  // AlertTriangle,
  CheckCircle,
  BookOpen,
  FileText,
  // Upload,
  // Download,
  Info
} from 'lucide-react';

interface CreateStandardModalProps {
  open: boolean;
  onClose: () => void;
  onStandardCreated: () => void;
}

interface Requirement {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  implementationGuidance: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  section: string;
  tags: string[];
}

interface StandardFormData {
  name: string;
  version: string;
  type: 'framework' | 'regulation' | 'policy' | 'guideline';
  description: string;
  category: string;
  officialSourceUrl: string;
  requirements: Requirement[];
}

export const CreateStandardModal: React.FC<CreateStandardModalProps> = ({
  open,
  onClose,
  onStandardCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StandardFormData>({
    name: '',
    version: '',
    type: 'framework',
    description: '',
    category: '',
    officialSourceUrl: '',
    requirements: []
  });

  const standardTypes = [
    { value: 'framework', label: 'Framework', description: 'Comprehensive security framework' },
    { value: 'regulation', label: 'Regulation', description: 'Legal regulatory requirement' },
    { value: 'policy', label: 'Policy', description: 'Internal policy or procedure' },
    { value: 'guideline', label: 'Guideline', description: 'Best practice guideline' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const handleAddRequirement = () => {
    const newRequirement: Requirement = {
      id: `req_${Date.now()}`,
      requirementCode: '',
      title: '',
      description: '',
      implementationGuidance: '',
      priority: 'medium',
      section: '',
      tags: []
    };
    
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, newRequirement]
    }));
  };

  const handleRemoveRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req.id !== id)
    }));
  };

  const handleRequirementChange = (id: string, field: keyof Requirement, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.version || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the standard first
      const standard = await adminService.createStandard({
        name: formData.name,
        version: formData.version,
        type: formData.type,
        description: formData.description,
        category: formData.category,
        officialSourceUrl: formData.officialSourceUrl
      });

      // If there are requirements, create them
      if (formData.requirements.length > 0) {
        for (const requirement of formData.requirements) {
          if (requirement.requirementCode && requirement.title && requirement.description) {
            await adminService.createRequirement({
              standardId: standard.id,
              requirementCode: requirement.requirementCode,
              title: requirement.title,
              officialDescription: requirement.description,
              implementationGuidance: requirement.implementationGuidance,
              section: requirement.section,
              priority: requirement.priority,
              tags: requirement.tags
            });
          }
        }
      }

      toast.success(`Standard "${formData.name}" created successfully with ${formData.requirements.length} requirements`);
      onStandardCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        version: '',
        type: 'framework',
        description: '',
        category: '',
        officialSourceUrl: '',
        requirements: []
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating standard:', error);
      toast.error('Failed to create standard. Please check the form and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.version && formData.type;
      case 2:
        return true; // Requirements are optional
      default:
        return false;
    }
  };

  const totalRequirements = formData.requirements.length;
  const validRequirements = formData.requirements.filter(req => 
    req.requirementCode && req.title && req.description
  ).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Create New Compliance Standard
          </DialogTitle>
          <DialogDescription>
            Add a new compliance standard with requirements to your library
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="1" 
              className="flex items-center"
              onClick={() => setCurrentStep(1)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Standard Details
              {isStepValid(1) && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="2" 
              className="flex items-center"
              onClick={() => setCurrentStep(2)}
              disabled={!isStepValid(1)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Requirements ({totalRequirements})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-6 mt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Standard Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., ISO 27001, SOC 2, CIS Controls"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="version">Version *</Label>
                        <Input
                          id="version"
                          placeholder="e.g., 2022, v8.1, 2017"
                          value={formData.version}
                          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Standard Type *</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {standardTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., Security, Privacy, Compliance"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the standard and its purpose"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="url">Official Source URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://..."
                        value={formData.officialSourceUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, officialSourceUrl: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {formData.type || 'Not specified'}
                        </Badge>
                        <span className="font-medium">
                          {formData.name || 'Standard Name'} v{formData.version || 'X.X'}
                        </span>
                      </div>
                      {formData.description && (
                        <p className="text-sm text-blue-700">{formData.description}</p>
                      )}
                      {formData.category && (
                        <div className="text-xs text-blue-600">Category: {formData.category}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="2" className="space-y-6 mt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Requirements Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Requirements & Controls</h3>
                    <p className="text-sm text-muted-foreground">
                      Add individual requirements, controls, or clauses for this standard
                    </p>
                  </div>
                  <Button onClick={handleAddRequirement} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>

                {/* Requirements Summary */}
                {totalRequirements > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {totalRequirements} requirement{totalRequirements !== 1 ? 's' : ''} added 
                      ({validRequirements} complete, {totalRequirements - validRequirements} incomplete)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Requirements List */}
                {formData.requirements.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Requirements Added</h3>
                      <p className="text-muted-foreground mb-4">
                        Add requirements to make this standard useful for assessments
                      </p>
                      <Button onClick={handleAddRequirement}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Requirement
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {formData.requirements.map((requirement, index) => (
                      <Card key={requirement.id} className="relative">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <span className="text-sm font-medium">
                                Requirement {requirement.requirementCode || 'Untitled'}
                              </span>
                              {requirement.requirementCode && requirement.title && requirement.description && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRequirement(requirement.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Requirement Code *</Label>
                              <Input
                                placeholder="e.g., 4.1, A.5.1, CC6.1"
                                value={requirement.requirementCode}
                                onChange={(e) => handleRequirementChange(requirement.id, 'requirementCode', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Section</Label>
                              <Input
                                placeholder="e.g., Access Control, Monitoring"
                                value={requirement.section}
                                onChange={(e) => handleRequirementChange(requirement.id, 'section', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select 
                                value={requirement.priority} 
                                onValueChange={(value: any) => handleRequirementChange(requirement.id, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorityLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      <Badge className={level.color}>{level.label}</Badge>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Title *</Label>
                            <Input
                              placeholder="Short descriptive title for this requirement"
                              value={requirement.title}
                              onChange={(e) => handleRequirementChange(requirement.id, 'title', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Official Description *</Label>
                            <Textarea
                              placeholder="The official text or description of this requirement"
                              value={requirement.description}
                              onChange={(e) => handleRequirementChange(requirement.id, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Implementation Guidance</Label>
                            <Textarea
                              placeholder="Practical guidance on how to implement this requirement"
                              value={requirement.implementationGuidance}
                              onChange={(e) => handleRequirementChange(requirement.id, 'implementationGuidance', e.target.value)}
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentStep === 2 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep === 1 ? (
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!isStepValid(1)}
              >
                Next: Add Requirements
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid(1)}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Standard
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};