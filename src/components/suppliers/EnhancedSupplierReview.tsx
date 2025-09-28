/**
 * Enhanced Supplier Review Component
 * Comprehensive supplier assessment workflow with standards library integration
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Shield,
  Plus,
  Send,
  Mail,
  FileText,
  Calendar,
  Users,
  Settings,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  X,
  Save,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { databaseSupplierAssessmentService } from '@/services/supplier-assessment/DatabaseSupplierAssessmentService';
import { mockSupplierRiskEngine } from '@/services/supplier-assessment/SupplierRiskEngine';
import type { 
  Supplier, 
  Standard, 
  Requirement, 
  SupplierAssessmentForm,
  SupplierAssessmentCampaign,
  SupplierComplianceMetrics,
  ComplianceGapAnalysis,
  SupplierRiskDashboard
} from '@/types/supplier-assessment';
import { mockSupplierAssessmentService } from '@/services/supplier-assessment/MockSupplierAssessmentService';

interface EnhancedSupplierReviewProps {
  supplier: Supplier;
  onClose: () => void;
  onCampaignCreated?: (campaign: SupplierAssessmentCampaign) => void;
}

const EnhancedSupplierReview: React.FC<EnhancedSupplierReviewProps> = ({
  supplier,
  onClose,
  onCampaignCreated
}) => {
  const [activeStep, setActiveStep] = useState<'standards' | 'requirements' | 'settings' | 'contacts' | 'preview' | 'analysis'>('standards');
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [organizationName, setOrganizationName] = useState('AuditReady Hub');
  const [existingCampaigns, setExistingCampaigns] = useState<SupplierAssessmentCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<SupplierAssessmentCampaign | null>(null);
  const [riskDashboard, setRiskDashboard] = useState<SupplierRiskDashboard | null>(null);
  const [complianceMetrics, setComplianceMetrics] = useState<SupplierComplianceMetrics | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<ComplianceGapAnalysis | null>(null);
  const [emailLogs, setEmailLogs] = useState<Array<{
    id: string;
    type: 'invitation' | 'reminder' | 'completion' | 'escalation';
    subject: string;
    recipient: string;
    sent_at: string;
    status: 'sent' | 'delivered' | 'opened' | 'failed';
    campaign_id: string;
  }>>([]);

  // Form state
  const [assessmentForm, setAssessmentForm] = useState<SupplierAssessmentForm>({
    campaign: {
      name: `${supplier.name} Security Assessment - ${new Date().getFullYear()}`,
      description: '',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      settings: {
        send_reminders: true,
        reminder_frequency_days: 7
      }
    },
    standards: {
      selected_standard_ids: [],
      selected_requirement_ids: []
    },
    contacts: [
      {
        email: supplier.contact.email,
        full_name: supplier.contact.name,
        title: supplier.contact.title || '',
        phone: supplier.contact.phone || '',
        role: 'primary'
      }
    ],
    email: {
      custom_message: '',
      send_immediately: true
    }
  });

  useEffect(() => {
    loadStandardsFromDatabase();
    loadOrganizationSettings();
    loadExistingCampaigns();
    loadEmailLogs();
  }, [supplier.id]);

  // Load requirements when standards are selected
  useEffect(() => {
    if (assessmentForm.standards.selected_standard_ids.length > 0) {
      loadRequirementsFromDatabase(assessmentForm.standards.selected_standard_ids);
    } else {
      setRequirements([]);
    }
  }, [assessmentForm.standards.selected_standard_ids]);

  const loadStandardsFromDatabase = async () => {
    try {
      setLoading(true);
      const result = await databaseSupplierAssessmentService.getStandards();
      
      if (result.success && result.standards) {
        setStandards(result.standards);
        toast.success(`Loaded ${result.standards.length} standards from database`);
      } else {
        console.error('Error loading standards:', result.error);
        toast.error(result.error || 'Failed to load standards from database');
      }
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('Failed to load standards from database');
    } finally {
      setLoading(false);
    }
  };

  const loadRequirementsFromDatabase = async (standardIds?: string[]) => {
    if (!standardIds || standardIds.length === 0) {
      setRequirements([]);
      return;
    }
    
    try {
      setLoading(true);
      const result = await databaseSupplierAssessmentService.getRequirements(standardIds);
      
      if (result.success && result.requirements) {
        setRequirements(result.requirements);
        toast.success(`Loaded ${result.requirements.length} requirements from database`);
      } else {
        console.error('Error loading requirements:', result.error);
        toast.error(result.error || 'Failed to load requirements from database');
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error('Failed to load requirements from database');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationSettings = async () => {
    // In a real implementation, this would fetch organization settings from Supabase
    // For demo, we'll use a mock organization name
    try {
      setOrganizationName('AuditReady Hub');
    } catch (error) {
      console.error('Error loading organization settings:', error);
    }
  };

  const loadEmailLogs = () => {
    // Load mock email logs for demo
    setEmailLogs([
      {
        id: 'email-1',
        type: 'invitation',
        subject: `Security Assessment Invitation from ${organizationName}`,
        recipient: 'jennifer.adams@cloudsecure.example.com',
        sent_at: '2024-01-16T09:00:00Z',
        status: 'opened',
        campaign_id: 'campaign-1'
      },
      {
        id: 'email-2',
        type: 'reminder',
        subject: `${organizationName}: Security Assessment Due Soon`,
        recipient: 'jennifer.adams@cloudsecure.example.com',
        sent_at: '2024-02-01T10:00:00Z',
        status: 'delivered',
        campaign_id: 'campaign-1'
      },
      {
        id: 'email-3',
        type: 'reminder',
        subject: `${organizationName}: Final Reminder - Assessment Deadline Tomorrow`,
        recipient: 'jennifer.adams@cloudsecure.example.com',
        sent_at: '2024-02-15T14:00:00Z',
        status: 'opened',
        campaign_id: 'campaign-1'
      },
      {
        id: 'email-4',
        type: 'completion',
        subject: `${organizationName}: Thank You - Security Assessment Completed`,
        recipient: 'jennifer.adams@cloudsecure.example.com',
        sent_at: '2024-03-20T16:00:00Z',
        status: 'delivered',
        campaign_id: 'campaign-1'
      }
    ]);
  };

  const loadExistingCampaigns = async () => {
    try {
      setLoading(true);
      const result = await databaseSupplierAssessmentService.getCampaigns(supplier.id);
      if (result.success && result.campaigns) {
        setExistingCampaigns(result.campaigns);
        
        // Generate risk dashboard
        const dashboard = await mockSupplierRiskEngine.generateRiskDashboard(result.campaigns);
        setRiskDashboard(dashboard);
      } else {
        console.error('Error loading campaigns:', result.error);
        toast.error(result.error || 'Failed to load assessment history');
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load assessment history');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSelection = (standardId: string, selected: boolean) => {
    const updatedStandardIds = selected 
      ? [...assessmentForm.standards.selected_standard_ids, standardId]
      : assessmentForm.standards.selected_standard_ids.filter(id => id !== standardId);

    // Auto-select all requirements for selected standards
    const standardRequirements = requirements.filter(req => 
      updatedStandardIds.includes(req.standardId)
    );
    
    setAssessmentForm(prev => ({
      ...prev,
      standards: {
        selected_standard_ids: updatedStandardIds,
        selected_requirement_ids: standardRequirements.map(req => req.id)
      }
    }));

    const standard = standards.find(s => s.id === standardId);
    if (selected && standard) {
      toast.success(`Added ${standardRequirements.filter(r => r.standardId === standardId).length} requirements from ${standard.name}`);
    }
  };

  const handleRequirementToggle = (requirementId: string, selected: boolean) => {
    const updatedRequirementIds = selected
      ? [...assessmentForm.standards.selected_requirement_ids, requirementId]
      : assessmentForm.standards.selected_requirement_ids.filter(id => id !== requirementId);

    setAssessmentForm(prev => ({
      ...prev,
      standards: {
        ...prev.standards,
        selected_requirement_ids: updatedRequirementIds
      }
    }));
  };

  const handleCreateCampaign = async () => {
    try {
      setLoading(true);

      if (assessmentForm.standards.selected_standard_ids.length === 0) {
        toast.error('Please select at least one standard');
        return;
      }

      if (assessmentForm.standards.selected_requirement_ids.length === 0) {
        toast.error('Please select at least one requirement');
        return;
      }

      // Create campaign
      const result = await databaseSupplierAssessmentService.createCampaign({
        supplierId: supplier.id,
        name: assessmentForm.campaign.name,
        description: assessmentForm.campaign.description,
        standardIds: assessmentForm.standards.selected_standard_ids,
        requirementIds: assessmentForm.standards.selected_requirement_ids,
        dueDate: assessmentForm.campaign.due_date,
        settings: assessmentForm.campaign.settings
      });

      if (!result.success || !result.campaignId) {
        toast.error(result.error || 'Failed to create campaign');
        return;
      }

      // Send invitations
      const inviteResult = await databaseSupplierAssessmentService.inviteSupplier({
        campaignId: result.campaignId,
        supplierId: supplier.id,
        contacts: assessmentForm.contacts,
        customMessage: assessmentForm.email.custom_message
      });

      if (!inviteResult.success) {
        toast.error(inviteResult.error || 'Failed to send invitations');
        return;
      }

      // Update campaign status to sent
      if (assessmentForm.email.send_immediately) {
        await databaseSupplierAssessmentService.updateCampaignStatus(result.campaignId, 'sent');
      }

      toast.success('Assessment campaign created and invitations sent successfully!');
      
      // Reload campaigns
      await loadExistingCampaigns();
      
      if (onCampaignCreated) {
        const campaign: SupplierAssessmentCampaign = {
          id: result.campaignId,
          organization_id: '', // Will be set by service
          supplier_id: supplier.id,
          name: assessmentForm.campaign.name,
          description: assessmentForm.campaign.description,
          status: assessmentForm.email.send_immediately ? 'sent' : 'draft',
          due_date: assessmentForm.campaign.due_date,
          created_by: '', // Will be set by service
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          risk_score: 0,
          risk_level: 'unknown',
          allow_delegation: true, // Default to true for compatibility
          require_evidence: true, // Default to true for compatibility
          send_reminders: assessmentForm.campaign.settings.send_reminders,
          reminder_frequency_days: assessmentForm.campaign.settings.reminder_frequency_days,
          supplier: supplier
        };
        onCampaignCreated(campaign);
      }

      // Switch to analysis view
      setActiveStep('analysis');
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCampaign = async (campaign: SupplierAssessmentCampaign) => {
    try {
      setLoading(true);
      setSelectedCampaign(campaign);

      // Load campaign analysis data
      const [responsesResult] = await Promise.all([
        mockSupplierAssessmentService.getSupplierResponses(campaign.id)
      ]);

      if (responsesResult.success && responsesResult.responses) {
        // Generate compliance metrics
        const metrics = await mockSupplierRiskEngine.generateComplianceMetrics({
          campaign,
          responses: responsesResult.responses,
          requirements: requirements.filter(r => 
            assessmentForm.standards.selected_requirement_ids.includes(r.id)
          ),
          standards: standards.filter(s => 
            assessmentForm.standards.selected_standard_ids.includes(s.id)
          )
        });
        setComplianceMetrics(metrics);

        // Generate gap analysis
        const gaps = await mockSupplierRiskEngine.performGapAnalysis({
          campaign,
          responses: responsesResult.responses,
          requirements: requirements.filter(r => 
            assessmentForm.standards.selected_requirement_ids.includes(r.id)
          ),
          standards: standards.filter(s => 
            assessmentForm.standards.selected_standard_ids.includes(s.id)
          )
        });
        setGapAnalysis(gaps);
      }

      setActiveStep('analysis');
    } catch (error) {
      console.error('Error analyzing campaign:', error);
      toast.error('Failed to analyze campaign');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-500', label: 'Draft', icon: FileText },
      'sent': { color: 'bg-blue-500', label: 'Sent', icon: Send },
      'in_progress': { color: 'bg-yellow-500', label: 'In Progress', icon: Clock },
      'completed': { color: 'bg-green-500', label: 'Completed', icon: CheckCircle },
      'expired': { color: 'bg-red-500', label: 'Expired', icon: AlertTriangle },
      'cancelled': { color: 'bg-gray-500', label: 'Cancelled', icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const { color, label, icon: Icon } = config;

    return (
      <Badge className={`${color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getRiskLevelBadge = (level: string) => {
    const riskConfig = {
      'low': { color: 'bg-green-500', label: 'Low Risk' },
      'medium': { color: 'bg-yellow-500', label: 'Medium Risk' },
      'high': { color: 'bg-orange-500', label: 'High Risk' },
      'critical': { color: 'bg-red-500', label: 'Critical Risk' },
      'unknown': { color: 'bg-gray-500', label: 'Unknown' }
    };

    const config = riskConfig[level as keyof typeof riskConfig] || riskConfig.unknown;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const selectedStandards = standards.filter(s => 
    assessmentForm.standards.selected_standard_ids.includes(s.id)
  );

  const selectedRequirements = requirements.filter(r => 
    assessmentForm.standards.selected_requirement_ids.includes(r.id)
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Supplier Assessment</h1>
                <p className="text-sm text-muted-foreground">{supplier.name}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="standards">Standards</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-6">
              {/* Standards Selection */}
              <TabsContent value="standards" className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Available Standards</CardTitle>
                      <CardDescription>
                        Select the compliance standards and frameworks for this assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                          {standards.map(standard => (
                            <div key={standard.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                              <Checkbox
                                id={`standard-${standard.id}`}
                                checked={assessmentForm.standards.selected_standard_ids.includes(standard.id)}
                                onCheckedChange={(checked) => handleStandardSelection(standard.id, !!checked)}
                              />
                              <div className="flex-1 space-y-2">
                                <Label htmlFor={`standard-${standard.id}`} className="font-medium cursor-pointer">
                                  {standard.name} {standard.version}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {standard.description}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{standard.type}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {requirements.filter(r => r.standardId === standard.id).length} requirements
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Selected Standards</CardTitle>
                      <CardDescription>
                        {selectedStandards.length} standard{selectedStandards.length !== 1 ? 's' : ''} selected with{' '}
                        {selectedRequirements.length} requirement{selectedRequirements.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      {selectedStandards.length > 0 ? (
                        <ScrollArea className="h-full pr-4">
                          <div className="space-y-4">
                            {selectedStandards.map(standard => {
                              const standardRequirements = requirements.filter(r => r.standardId === standard.id);
                              return (
                                <div key={standard.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">{standard.name}</h3>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStandardSelection(standard.id, false)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {standardRequirements.length} requirements selected
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <Badge className="bg-blue-600 text-white">
                                      {standard.type}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setActiveStep('requirements')}
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Customize
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Shield className="w-12 h-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Standards Selected</h3>
                          <p className="text-muted-foreground mb-4">
                            Select standards from the left panel to create your assessment
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Requirements Customization */}
              <TabsContent value="requirements" className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Requirements Selection</CardTitle>
                    <CardDescription>
                      Customize which requirements to include in the assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    {selectedStandards.length > 0 ? (
                      <div className="space-y-6 h-full">
                        {selectedStandards.map(standard => {
                          const standardRequirements = requirements.filter(r => r.standardId === standard.id);
                          const selectedCount = standardRequirements.filter(r => 
                            assessmentForm.standards.selected_requirement_ids.includes(r.id)
                          ).length;

                          return (
                            <div key={standard.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">{standard.name}</h3>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-muted-foreground">
                                    {selectedCount}/{standardRequirements.length} selected
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const allSelected = standardRequirements.every(r => 
                                        assessmentForm.standards.selected_requirement_ids.includes(r.id)
                                      );
                                      standardRequirements.forEach(req => {
                                        handleRequirementToggle(req.id, !allSelected);
                                      });
                                    }}
                                  >
                                    {selectedCount === standardRequirements.length ? 'Deselect All' : 'Select All'}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="max-h-96 overflow-y-auto space-y-2">
                                {standardRequirements.map(requirement => (
                                  <div key={requirement.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                                    <Checkbox
                                      id={`req-${requirement.id}`}
                                      checked={assessmentForm.standards.selected_requirement_ids.includes(requirement.id)}
                                      onCheckedChange={(checked) => handleRequirementToggle(requirement.id, !!checked)}
                                    />
                                    <div className="flex-1">
                                      <Label htmlFor={`req-${requirement.id}`} className="font-medium cursor-pointer">
                                        {requirement.section} {requirement.name}
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {requirement.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <FileText className="w-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Standards Selected</h3>
                        <p className="text-muted-foreground mb-4">
                          Please select standards first to customize requirements
                        </p>
                        <Button onClick={() => setActiveStep('standards')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Select Standards
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Campaign Settings */}
              <TabsContent value="settings" className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Campaign Details</CardTitle>
                      <CardDescription>Configure the assessment campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name</Label>
                        <Input
                          id="campaign-name"
                          value={assessmentForm.campaign.name}
                          onChange={(e) => setAssessmentForm(prev => ({
                            ...prev,
                            campaign: { ...prev.campaign, name: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="campaign-description">Description</Label>
                        <Textarea
                          id="campaign-description"
                          value={assessmentForm.campaign.description}
                          onChange={(e) => setAssessmentForm(prev => ({
                            ...prev,
                            campaign: { ...prev.campaign, description: e.target.value }
                          }))}
                          placeholder="Describe the purpose and scope of this assessment..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          type="date"
                          value={assessmentForm.campaign.due_date}
                          onChange={(e) => setAssessmentForm(prev => ({
                            ...prev,
                            campaign: { ...prev.campaign, due_date: e.target.value }
                          }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Assessment Settings</CardTitle>
                      <CardDescription>Configure assessment behavior and features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Send Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically send reminder emails
                          </p>
                        </div>
                        <Checkbox
                          checked={assessmentForm.campaign.settings.send_reminders}
                          onCheckedChange={(checked) => setAssessmentForm(prev => ({
                            ...prev,
                            campaign: {
                              ...prev.campaign,
                              settings: { ...prev.campaign.settings, send_reminders: !!checked }
                            }
                          }))}
                        />
                      </div>

                      {assessmentForm.campaign.settings.send_reminders && (
                        <div className="space-y-2">
                          <Label htmlFor="reminder-frequency">Reminder Frequency (days)</Label>
                          <Select
                            value={assessmentForm.campaign.settings.reminder_frequency_days.toString()}
                            onValueChange={(value) => setAssessmentForm(prev => ({
                              ...prev,
                              campaign: {
                                ...prev.campaign,
                                settings: { ...prev.campaign.settings, reminder_frequency_days: parseInt(value) }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Every 3 days</SelectItem>
                              <SelectItem value="7">Weekly</SelectItem>
                              <SelectItem value="14">Bi-weekly</SelectItem>
                              <SelectItem value="30">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Contacts */}
              <TabsContent value="contacts" className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Supplier Contacts</CardTitle>
                    <CardDescription>
                      Manage contacts who will receive assessment invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <div className="space-y-4">
                      {assessmentForm.contacts.map((contact, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Contact {index + 1}</h4>
                            {index > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAssessmentForm(prev => ({
                                  ...prev,
                                  contacts: prev.contacts.filter((_, i) => i !== index)
                                }))}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input
                                value={contact.full_name}
                                onChange={(e) => {
                                  const newContacts = [...assessmentForm.contacts];
                                  newContacts[index].full_name = e.target.value;
                                  setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Email Address</Label>
                              <Input
                                type="email"
                                value={contact.email}
                                onChange={(e) => {
                                  const newContacts = [...assessmentForm.contacts];
                                  newContacts[index].email = e.target.value;
                                  setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={contact.title}
                                onChange={(e) => {
                                  const newContacts = [...assessmentForm.contacts];
                                  newContacts[index].title = e.target.value;
                                  setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select
                                value={contact.role}
                                onValueChange={(value: 'primary' | 'contributor' | 'viewer') => {
                                  const newContacts = [...assessmentForm.contacts];
                                  newContacts[index].role = value;
                                  setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="primary">Primary Contact</SelectItem>
                                  <SelectItem value="contributor">Contributor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => setAssessmentForm(prev => ({
                          ...prev,
                          contacts: [...prev.contacts, {
                            email: '',
                            full_name: '',
                            title: '',
                            phone: '',
                            role: 'contributor'
                          }]
                        }))}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview */}
              <TabsContent value="preview" className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Assessment Summary</CardTitle>
                      <CardDescription>Review your assessment configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <h4 className="font-medium mb-2">Campaign Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {assessmentForm.campaign.name}</p>
                          <p><span className="font-medium">Due Date:</span> {new Date(assessmentForm.campaign.due_date).toLocaleDateString()}</p>
                          <p><span className="font-medium">Description:</span> {assessmentForm.campaign.description || 'None'}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Standards ({selectedStandards.length})</h4>
                        <div className="space-y-2">
                          {selectedStandards.map(standard => (
                            <div key={standard.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{standard.name}</span>
                              <Badge variant="outline">
                                {requirements.filter(r => r.standardId === standard.id && 
                                  assessmentForm.standards.selected_requirement_ids.includes(r.id)).length} reqs
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Settings</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Reminders:</span> {assessmentForm.campaign.settings.send_reminders ? `Every ${assessmentForm.campaign.settings.reminder_frequency_days} days` : 'Disabled'}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Contacts ({assessmentForm.contacts.length})</h4>
                        <div className="space-y-2">
                          {assessmentForm.contacts.map((contact, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <p className="text-sm font-medium">{contact.full_name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                              <Badge variant="outline">{contact.role}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Email Preview</CardTitle>
                      <CardDescription>Preview of the invitation email</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                        <Textarea
                          id="custom-message"
                          value={assessmentForm.email.custom_message}
                          onChange={(e) => setAssessmentForm(prev => ({
                            ...prev,
                            email: { ...prev.email, custom_message: e.target.value }
                          }))}
                          placeholder="Add a personal message to the invitation email..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="send-immediately"
                          checked={assessmentForm.email.send_immediately}
                          onCheckedChange={(checked) => setAssessmentForm(prev => ({
                            ...prev,
                            email: { ...prev.email, send_immediately: !!checked }
                          }))}
                        />
                        <Label htmlFor="send-immediately">Send invitations immediately</Label>
                      </div>

                      <div className="p-4 bg-muted rounded-lg text-sm">
                        <h5 className="font-medium mb-2">Email Preview:</h5>
                        <div className="space-y-2">
                          <p><span className="font-medium">To:</span> {assessmentForm.contacts[0]?.email}</p>
                          <p><span className="font-medium">Subject:</span> Security Assessment Invitation from Audit Readiness Hub</p>
                          <div className="mt-3 p-3 bg-white rounded border text-xs">
                            <p>Dear {assessmentForm.contacts[0]?.full_name},</p>
                            <br />
                            <p>As part of our ongoing supplier security program, we are requesting your participation in a security assessment.</p>
                            <br />
                            <p><strong>Assessment Details:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                              <li>Supplier: {supplier.name}</li>
                              <li>Due Date: {new Date(assessmentForm.campaign.due_date).toLocaleDateString()}</li>
                              <li>Standards: {selectedStandards.map(s => s.name).join(', ')}</li>
                            </ul>
                            <br />
                            {assessmentForm.email.custom_message && (
                              <>
                                <p>{assessmentForm.email.custom_message}</p>
                                <br />
                              </>
                            )}
                            <p>Please click the link below to access your secure assessment portal:</p>
                            <p>[Assessment Link]</p>
                            <br />
                            <p>Best regards,<br />Security Team</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analysis */}
              <TabsContent value="analysis" className="h-full">
                <div className="space-y-6 h-full overflow-y-auto">
                  {/* Existing Campaigns */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment History</CardTitle>
                      <CardDescription>
                        Previous and current assessments for {supplier.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {existingCampaigns.length > 0 ? (
                        <div className="space-y-4">
                          {existingCampaigns.map(campaign => (
                            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <h4 className="font-medium">{campaign.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                                  {campaign.due_date && (
                                    <span>Due {new Date(campaign.due_date).toLocaleDateString()}</span>
                                  )}
                                  <span>Risk Score: {campaign.risk_score}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(campaign.status)}
                                {getRiskLevelBadge(campaign.risk_level)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAnalyzeCampaign(campaign)}
                                >
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Analyze
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Previous Assessments</h3>
                          <p className="text-muted-foreground">
                            This will be the first assessment for this supplier
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Risk Dashboard */}
                  {riskDashboard && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Dashboard</CardTitle>
                        <CardDescription>Overall supplier risk metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{riskDashboard.active_assessments}</p>
                            <p className="text-sm text-blue-600">Active</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{riskDashboard.completed_assessments}</p>
                            <p className="text-sm text-green-600">Completed</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{riskDashboard.overdue_assessments}</p>
                            <p className="text-sm text-red-600">Overdue</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{riskDashboard.average_risk_score}</p>
                            <p className="text-sm text-purple-600">Avg Risk Score</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compliance Metrics */}
                  {complianceMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Metrics</CardTitle>
                        <CardDescription>Detailed compliance analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Overall Compliance</h4>
                            <div className="flex items-center space-x-2">
                              <Progress value={complianceMetrics.compliance_percentage} className="w-24" />
                              <span className="text-sm font-medium">{complianceMetrics.compliance_percentage}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{complianceMetrics.fulfillment_breakdown.fulfilled}</p>
                              <p className="text-xs text-green-600">Fulfilled</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{complianceMetrics.fulfillment_breakdown.partially_fulfilled}</p>
                              <p className="text-xs text-yellow-600">Partial</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{complianceMetrics.fulfillment_breakdown.not_fulfilled}</p>
                              <p className="text-xs text-red-600">Not Fulfilled</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-600">{complianceMetrics.fulfillment_breakdown.not_applicable}</p>
                              <p className="text-xs text-gray-600">N/A</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{complianceMetrics.fulfillment_breakdown.in_progress}</p>
                              <p className="text-xs text-blue-600">In Progress</p>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-3">Standards Breakdown</h5>
                            <div className="space-y-2">
                              {complianceMetrics.standards_compliance.map(standard => (
                                <div key={standard.standard_id} className="flex items-center justify-between">
                                  <span className="text-sm">{standard.standard_name}</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={standard.compliance_percentage} className="w-24" />
                                    <span className="text-sm">{standard.compliance_percentage}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gap Analysis */}
                  {gapAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Gap Analysis</CardTitle>
                        <CardDescription>Identified compliance gaps and recommendations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-xl font-bold text-red-600">{gapAnalysis.critical_gaps}</p>
                              <p className="text-xs text-red-600">Critical</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <p className="text-xl font-bold text-orange-600">{gapAnalysis.high_risk_gaps}</p>
                              <p className="text-xs text-orange-600">High Risk</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-xl font-bold text-yellow-600">{gapAnalysis.medium_risk_gaps}</p>
                              <p className="text-xs text-yellow-600">Medium Risk</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xl font-bold text-green-600">{gapAnalysis.low_risk_gaps}</p>
                              <p className="text-xs text-green-600">Low Risk</p>
                            </div>
                          </div>

                          {gapAnalysis.gap_details.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-3">Top Priority Gaps</h5>
                              <div className="space-y-2">
                                {gapAnalysis.gap_details
                                  .sort((a: any, b: any) => b.risk_impact - a.risk_impact)
                                  .slice(0, 5)
                                  .map((gap: any, index: any) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium text-sm">{gap.requirement_name}</p>
                                        <p className="text-xs text-muted-foreground">{gap.standard_name}</p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className={
                                          gap.risk_impact >= 4 ? 'border-red-500 text-red-600' :
                                          gap.risk_impact >= 3 ? 'border-orange-500 text-orange-600' :
                                          gap.risk_impact >= 2 ? 'border-yellow-500 text-yellow-600' :
                                          'border-green-500 text-green-600'
                                        }>
                                          Risk: {gap.risk_impact}/5
                                        </Badge>
                                        <Badge variant="outline">
                                          {gap.remediation_effort} effort
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Email Communication History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Email Communication History
                      </CardTitle>
                      <CardDescription>
                        Track all email communications sent to supplier contacts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {emailLogs.length > 0 ? (
                        <div className="space-y-3">
                          {emailLogs.map(email => (
                            <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant={
                                    email.type === 'invitation' ? 'default' :
                                    email.type === 'reminder' ? 'secondary' :
                                    email.type === 'completion' ? 'outline' :
                                    'destructive'
                                  } className="text-xs">
                                    {email.type.charAt(0).toUpperCase() + email.type.slice(1)}
                                  </Badge>
                                  <Badge variant={
                                    email.status === 'opened' ? 'default' :
                                    email.status === 'delivered' ? 'secondary' :
                                    email.status === 'sent' ? 'outline' :
                                    'destructive'
                                  } className="text-xs">
                                    {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm">{email.subject}</h4>
                                <p className="text-xs text-muted-foreground">
                                  To: {email.recipient} • {new Date(email.sent_at).toLocaleDateString()} at {new Date(email.sent_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Email History</h3>
                          <p className="text-muted-foreground">
                            Email communications will appear here once assessments are sent
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {activeStep !== 'standards' && (
                    <Button variant="outline" onClick={() => {
                      const steps = ['standards', 'requirements', 'settings', 'contacts', 'preview', 'analysis'];
                      const currentIndex = steps.indexOf(activeStep);
                      if (currentIndex > 0) {
                        setActiveStep(steps[currentIndex - 1] as any);
                      }
                    }}>
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {activeStep === 'analysis' && (
                    <>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Portal
                      </Button>
                    </>
                  )}
                  
                  {activeStep === 'preview' ? (
                    <Button onClick={handleCreateCampaign} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Create & Send Assessment
                        </>
                      )}
                    </Button>
                  ) : (
                    activeStep !== 'analysis' && (
                      <Button onClick={() => {
                        const steps = ['standards', 'requirements', 'settings', 'contacts', 'preview', 'analysis'];
                        const currentIndex = steps.indexOf(activeStep);
                        if (currentIndex < steps.length - 1) {
                          setActiveStep(steps[currentIndex + 1] as any);
                        }
                      }}>
                        Next
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSupplierReview;