/**
 * Improved Supplier Review Component
 * Enhanced design with better UX, scrolling, and automatic email settings
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
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
  X,
  Save,
  Download,
  ExternalLink,
  Search,
  Loader2,
  Check,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { databaseSupplierAssessmentService } from '@/services/supplier-assessment/DatabaseSupplierAssessmentService';
import type { 
  Supplier, 
  Standard, 
  Requirement, 
  SupplierAssessmentForm,
  SupplierAssessmentCampaign
} from '@/types/supplier-assessment';

interface ImprovedSupplierReviewProps {
  supplier: Supplier;
  onClose: () => void;
  onCampaignCreated?: (campaign: SupplierAssessmentCampaign) => void;
}

interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  organizationName: string;
  emailSignature?: string;
}

const ImprovedSupplierReview: React.FC<ImprovedSupplierReviewProps> = ({
  supplier,
  onClose,
  onCampaignCreated
}) => {
  const [activeStep, setActiveStep] = useState<'standards' | 'requirements' | 'settings' | 'contacts' | 'preview' | 'analysis'>('standards');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [standards, setStandards] = useState<Standard[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  
  // Pagination states
  const [standardsPage, setStandardsPage] = useState(0);
  const [hasMoreStandards, setHasMoreStandards] = useState(true);
  const [loadingMoreStandards, setLoadingMoreStandards] = useState(false);
  const [standardsSearch, setStandardsSearch] = useState('');

  // Form state
  const [assessmentForm, setAssessmentForm] = useState<SupplierAssessmentForm>({
    campaign: {
      name: `${supplier.name} Security Assessment - ${new Date().getFullYear()}`,
      description: `Comprehensive security and compliance assessment for ${supplier.name}`,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      settings: {
        send_reminders: true,
        reminder_frequency_days: 7,
        allow_delegation: true,
        require_evidence: true
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

  // Load initial data
  useEffect(() => {
    loadStandardsWithPagination();
    loadEmailSettings();
  }, []);

  // Load requirements when standards are selected
  useEffect(() => {
    if (assessmentForm.standards.selected_standard_ids.length > 0) {
      loadRequirementsFromDatabase(assessmentForm.standards.selected_standard_ids);
    } else {
      setRequirements([]);
      setAssessmentForm(prev => ({
        ...prev,
        standards: {
          ...prev.standards,
          selected_requirement_ids: []
        }
      }));
    }
  }, [assessmentForm.standards.selected_standard_ids]);

  const loadStandardsWithPagination = async (reset = false) => {
    try {
      if (reset) {
        setStandardsPage(0);
        setStandards([]);
      }

      setLoadingMoreStandards(true);
      const currentPage = reset ? 0 : standardsPage;
      
      const result = await databaseSupplierAssessmentService.getStandards({
        limit: 20,
        offset: currentPage * 20,
        search: standardsSearch || undefined
      });
      
      if (result.success && result.standards) {
        if (reset) {
          setStandards(result.standards);
        } else {
          setStandards(prev => [...prev, ...result.standards!]);
        }
        setHasMoreStandards(result.hasMore || false);
        setStandardsPage(currentPage + 1);
        
        if (reset && result.standards.length > 0) {
          toast.success(`Loaded ${result.standards.length} standards from database`);
        }
      } else {
        toast.error(result.error || 'Failed to load standards');
      }
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('Failed to load standards');
    } finally {
      setLoadingMoreStandards(false);
    }
  };

  const loadRequirementsFromDatabase = async (standardIds: string[]) => {
    try {
      setLoading(true);
      const result = await databaseSupplierAssessmentService.getRequirements(standardIds);
      
      if (result.success && result.requirements) {
        setRequirements(result.requirements);
        
        // Auto-select all requirements
        const allRequirementIds = result.requirements.map(req => req.id);
        setAssessmentForm(prev => ({
          ...prev,
          standards: {
            ...prev.standards,
            selected_requirement_ids: allRequirementIds
          }
        }));
        
        toast.success(`Loaded ${result.requirements.length} requirements`);
      } else {
        toast.error(result.error || 'Failed to load requirements');
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      const result = await databaseSupplierAssessmentService.getOrganizationEmailSettings();
      
      if (result.success && result.settings) {
        setEmailSettings(result.settings);
        
        // Update form with sender information
        setAssessmentForm(prev => ({
          ...prev,
          email: {
            ...prev.email,
            custom_message: generateDefaultEmailMessage(result.settings!)
          }
        }));
      } else {
        console.error('Failed to load email settings:', result.error);
        // Use fallback settings
        setEmailSettings({
          senderName: 'Security Team',
          senderEmail: 'security@company.com',
          replyToEmail: 'security@company.com',
          organizationName: 'Your Organization'
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  const generateDefaultEmailMessage = (settings: EmailSettings): string => {
    return `Dear ${supplier.contact.name},

We hope this message finds you well. As part of ${settings.organizationName}'s supplier security management program, we are conducting a comprehensive security assessment of our key suppliers.

We have prepared a customized assessment for ${supplier.name} that covers the security standards and requirements relevant to our business relationship. This assessment will help us:

• Understand your current security posture
• Identify any potential risks or gaps
• Ensure alignment with our security requirements
• Strengthen our partnership through improved security practices

The assessment is designed to be completed collaboratively and should take approximately 30-45 minutes to complete. You will have access to:

• Clear guidance for each requirement
• The ability to save drafts and complete the assessment over multiple sessions  
• Direct communication channels for any questions or clarifications

Please complete the assessment by ${new Date(assessmentForm.campaign.due_date).toLocaleDateString()}. If you need additional time or have any questions, please don't hesitate to reach out.

Thank you for your continued partnership and commitment to security excellence.

${settings.emailSignature || ''}`;
  };

  const handleStandardSelection = (standardId: string, selected: boolean) => {
    const updatedStandardIds = selected 
      ? [...assessmentForm.standards.selected_standard_ids, standardId]
      : assessmentForm.standards.selected_standard_ids.filter(id => id !== standardId);

    setAssessmentForm(prev => ({
      ...prev,
      standards: {
        ...prev.standards,
        selected_standard_ids: updatedStandardIds
      }
    }));
  };

  const handleRequirementSelection = (requirementId: string, selected: boolean) => {
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
      setSubmitting(true);

      // Validation
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

      // Update campaign status
      if (assessmentForm.email.send_immediately) {
        await databaseSupplierAssessmentService.updateCampaignStatus(result.campaignId, 'sent');
      }

      toast.success('🎉 Assessment campaign created and invitations sent successfully!');
      
      if (onCampaignCreated) {
        const campaign: SupplierAssessmentCampaign = {
          id: result.campaignId,
          organization_id: '',
          supplier_id: supplier.id,
          name: assessmentForm.campaign.name,
          description: assessmentForm.campaign.description,
          status: assessmentForm.email.send_immediately ? 'sent' : 'draft',
          due_date: assessmentForm.campaign.due_date,
          created_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          risk_score: 0,
          risk_level: 'unknown',
          allow_delegation: true,
          require_evidence: true,
          send_reminders: assessmentForm.campaign.settings.send_reminders,
          reminder_frequency_days: assessmentForm.campaign.settings.reminder_frequency_days
        };
        onCampaignCreated(campaign);
      }

      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create assessment campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchStandards = useCallback(() => {
    loadStandardsWithPagination(true);
  }, [standardsSearch]);

  const renderStandardsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Standards</h3>
          <p className="text-sm text-muted-foreground">
            Choose the security standards for this assessment
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {assessmentForm.standards.selected_standard_ids.length} selected
        </Badge>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search standards..."
            value={standardsSearch}
            onChange={(e) => setStandardsSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearchStandards} variant="outline">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px] border rounded-md">
        <div className="p-4 space-y-4">
          {standards.map((standard) => (
            <Card key={standard.id} className={`cursor-pointer transition-all hover:shadow-md ${
              assessmentForm.standards.selected_standard_ids.includes(standard.id) 
                ? 'ring-2 ring-primary bg-primary/5' 
                : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`standard-${standard.id}`}
                      checked={assessmentForm.standards.selected_standard_ids.includes(standard.id)}
                      onCheckedChange={(checked) => handleStandardSelection(standard.id, !!checked)}
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor={`standard-${standard.id}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {standard.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{standard.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{standard.category}</Badge>
                        <Badge variant="outline">v{standard.version}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMoreStandards && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => loadStandardsWithPagination()}
                disabled={loadingMoreStandards}
              >
                {loadingMoreStandards ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More Standards
                  </>
                )}
              </Button>
            </div>
          )}

          {standards.length === 0 && !loadingMoreStandards && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No standards found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderRequirementsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review Requirements</h3>
          <p className="text-sm text-muted-foreground">
            Requirements from selected standards ({requirements.length} total)
          </p>
        </div>
        <Badge variant="outline">
          {assessmentForm.standards.selected_requirement_ids.length} selected
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading requirements...</span>
        </div>
      ) : (
        <ScrollArea className="h-[400px] border rounded-md">
          <div className="p-4 space-y-4">
            {requirements.map((requirement) => (
              <Card key={requirement.id} className={`transition-all ${
                assessmentForm.standards.selected_requirement_ids.includes(requirement.id)
                  ? 'ring-1 ring-primary bg-primary/5'
                  : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`requirement-${requirement.id}`}
                      checked={assessmentForm.standards.selected_requirement_ids.includes(requirement.id)}
                      onCheckedChange={(checked) => handleRequirementSelection(requirement.id, !!checked)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label 
                        htmlFor={`requirement-${requirement.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {requirement.section && `${requirement.section}: `}{requirement.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{requirement.description}</p>
                      {requirement.guidance && (
                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          💡 {requirement.guidance}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Campaign Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure assessment timeline and reminder settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={assessmentForm.campaign.name}
                onChange={(e) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: { ...prev.campaign, name: e.target.value }
                }))}
                placeholder="Q1 2024 Security Assessment"
              />
            </div>
            
            <div>
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                value={assessmentForm.campaign.description}
                onChange={(e) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: { ...prev.campaign, description: e.target.value }
                }))}
                placeholder="Comprehensive security and compliance assessment"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={assessmentForm.campaign.due_date}
                onChange={(e) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: { ...prev.campaign, due_date: e.target.value }
                }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="send-reminders">Send Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send reminder emails to suppliers
                </p>
              </div>
              <Switch
                id="send-reminders"
                checked={assessmentForm.campaign.settings.send_reminders}
                onCheckedChange={(checked) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: {
                    ...prev.campaign,
                    settings: { ...prev.campaign.settings, send_reminders: checked }
                  }
                }))}
              />
            </div>

            {assessmentForm.campaign.settings.send_reminders && (
              <div>
                <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
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
                  <SelectTrigger id="reminder-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Every 3 days</SelectItem>
                    <SelectItem value="7">Weekly</SelectItem>
                    <SelectItem value="14">Every 2 weeks</SelectItem>
                    <SelectItem value="30">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-evidence">Require Evidence</Label>
                <p className="text-xs text-muted-foreground">
                  Suppliers must provide evidence for their responses
                </p>
              </div>
              <Switch
                id="require-evidence"
                checked={assessmentForm.campaign.settings.require_evidence}
                onCheckedChange={(checked) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: {
                    ...prev.campaign,
                    settings: { ...prev.campaign.settings, require_evidence: checked }
                  }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-delegation">Allow Delegation</Label>
                <p className="text-xs text-muted-foreground">
                  Suppliers can delegate questions to team members
                </p>
              </div>
              <Switch
                id="allow-delegation"
                checked={assessmentForm.campaign.settings.allow_delegation}
                onCheckedChange={(checked) => setAssessmentForm(prev => ({
                  ...prev,
                  campaign: {
                    ...prev.campaign,
                    settings: { ...prev.campaign.settings, allow_delegation: checked }
                  }
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Preview */}
      {assessmentForm.campaign.settings.send_reminders && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Reminder Schedule</AlertTitle>
          <AlertDescription>
            Based on your settings, reminders will be sent:
            <ul className="mt-2 space-y-1">
              <li>• First reminder: {assessmentForm.campaign.settings.reminder_frequency_days} days after sending</li>
              <li>• Subsequent reminders: Every {assessmentForm.campaign.settings.reminder_frequency_days} days</li>
              <li>• Final reminder: 3 days before due date</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setActiveStep('requirements')}>
          <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
          Back
        </Button>
        <Button onClick={() => setActiveStep('contacts')}>
          Next
          <ChevronDown className="h-4 w-4 ml-2 -rotate-90" />
        </Button>
      </div>
    </div>
  );

  const renderContactsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Supplier Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Manage contacts who will receive the assessment
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const newContact = {
              email: '',
              full_name: '',
              title: '',
              phone: '',
              role: 'contributor' as const
            };
            setAssessmentForm(prev => ({
              ...prev,
              contacts: [...prev.contacts, newContact]
            }));
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-4">
        {assessmentForm.contacts.map((contact, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {index === 0 ? 'Primary Contact' : `Contact ${index + 1}`}
                </CardTitle>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAssessmentForm(prev => ({
                        ...prev,
                        contacts: prev.contacts.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Full Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={contact.full_name}
                    onChange={(e) => {
                      const newContacts = [...assessmentForm.contacts];
                      newContacts[index].full_name = e.target.value;
                      setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                    }}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`email-${index}`}>Email</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={contact.email}
                    onChange={(e) => {
                      const newContacts = [...assessmentForm.contacts];
                      newContacts[index].email = e.target.value;
                      setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                    }}
                    placeholder="john@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={contact.title}
                    onChange={(e) => {
                      const newContacts = [...assessmentForm.contacts];
                      newContacts[index].title = e.target.value;
                      setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                    }}
                    placeholder="Security Manager"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`role-${index}`}>Role</Label>
                  <Select
                    value={contact.role}
                    onValueChange={(value: 'primary' | 'contributor' | 'viewer') => {
                      const newContacts = [...assessmentForm.contacts];
                      newContacts[index].role = value;
                      setAssessmentForm(prev => ({ ...prev, contacts: newContacts }));
                    }}
                  >
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Full Access)</SelectItem>
                      <SelectItem value="contributor">Contributor (Can Edit)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Email Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Message</CardTitle>
          <CardDescription>
            Customize the message sent to supplier contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-message">Custom Message</Label>
            <Textarea
              id="custom-message"
              value={assessmentForm.email.custom_message}
              onChange={(e) => setAssessmentForm(prev => ({
                ...prev,
                email: { ...prev.email, custom_message: e.target.value }
              }))}
              placeholder="Add a personalized message to your assessment invitation..."
              rows={6}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="send-immediately">Send Immediately</Label>
              <p className="text-xs text-muted-foreground">
                Send invitations as soon as the campaign is created
              </p>
            </div>
            <Switch
              id="send-immediately"
              checked={assessmentForm.email.send_immediately}
              onCheckedChange={(checked) => setAssessmentForm(prev => ({
                ...prev,
                email: { ...prev.email, send_immediately: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setActiveStep('settings')}>
          <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
          Back
        </Button>
        <Button onClick={() => setActiveStep('preview')}>
          Review & Send
          <Eye className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Assessment Preview</h3>
        <p className="text-sm text-muted-foreground">
          Review the assessment details before sending
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">SUPPLIER</Label>
              <p className="text-sm font-medium">{supplier.name}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">ASSESSMENT NAME</Label>
              <p className="text-sm">{assessmentForm.campaign.name}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">DUE DATE</Label>
              <p className="text-sm">{new Date(assessmentForm.campaign.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">CONTACT</Label>
              <p className="text-sm">{supplier.contact.name} ({supplier.contact.email})</p>
            </div>
          </CardContent>
        </Card>

        {/* Standards & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">STANDARDS</Label>
              <p className="text-sm">{assessmentForm.standards.selected_standard_ids.length} selected</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">REQUIREMENTS</Label>
              <p className="text-sm">{assessmentForm.standards.selected_requirement_ids.length} selected</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">ESTIMATED TIME</Label>
              <p className="text-sm">{Math.ceil(assessmentForm.standards.selected_requirement_ids.length / 10)} - {Math.ceil(assessmentForm.standards.selected_requirement_ids.length / 5)} minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview */}
      {emailSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Preview</CardTitle>
            <CardDescription>
              This email will be sent from {emailSettings.senderName} ({emailSettings.senderEmail})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div><strong>From:</strong> {emailSettings.senderName} &lt;{emailSettings.senderEmail}&gt;</div>
              <div><strong>To:</strong> {supplier.contact.name} &lt;{supplier.contact.email}&gt;</div>
              <div><strong>Subject:</strong> Security Assessment Request - {supplier.name}</div>
              <Separator className="my-3" />
              <div className="whitespace-pre-wrap max-h-40 overflow-y-auto">
                {assessmentForm.email.custom_message}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setActiveStep('contacts')}>
          <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
          Back
        </Button>
        
        <Button 
          onClick={handleCreateCampaign} 
          className="min-w-[180px]"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Create & Send Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const steps = [
    { id: 'standards', label: 'Standards', icon: Shield },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-muted/50">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Supplier Assessment</h2>
            <p className="text-sm text-muted-foreground">{supplier.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-b">
        <div className="flex space-x-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <Button
                key={step.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveStep(step.id as any)}
                className={`flex items-center space-x-2 ${
                  isCompleted ? 'text-green-600' : ''
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span>{step.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <ScrollArea className="h-full">
          {activeStep === 'standards' && renderStandardsStep()}
          {activeStep === 'requirements' && renderRequirementsStep()}
          {activeStep === 'settings' && renderSettingsStep()}
          {activeStep === 'contacts' && renderContactsStep()}
          {activeStep === 'preview' && renderPreviewStep()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ImprovedSupplierReview;