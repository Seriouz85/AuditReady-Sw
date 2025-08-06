/**
 * External Supplier Portal
 * Secure portal for suppliers to complete assessments
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Download,
  Send,
  Save,
  Eye,
  FileText,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { databaseSupplierAssessmentService } from '@/services/supplier-assessment/DatabaseSupplierAssessmentService';
import type { 
  SupplierExternalUser, 
  SupplierAssessmentCampaign,
  SupplierRequirementResponse,
  ExternalPortalSession,
  ExternalPortalRequirement,
  FulfillmentLevel
} from '@/types/supplier-assessment';

const SupplierPortal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ExternalPortalSession | null>(null);
  const [requirements, setRequirements] = useState<ExternalPortalRequirement[]>([]);
  const [responses, setResponses] = useState<Record<string, SupplierRequirementResponse>>({});
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assessment' | 'progress' | 'help'>('dashboard');
  const [loginForm, setLoginForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || ''
  });
  
  // Demo credentials for testing
  const demoCredentials = {
    email: 'jennifer.adams@cloudsecure.example.com',
    token: 'demo-token-123'
  };

  useEffect(() => {
    if (loginForm.email && loginForm.token) {
      handleLogin();
    }
  }, []);

  const loadCampaignRequirements = async (campaignId: string) => {
    try {
      let standardIds: string[];
      
      // For demo campaign, use demo standards
      if (campaignId === 'campaign-1') {
        standardIds = ['demo-standard-iso-27001', 'demo-standard-soc-2'];
      } else {
        // For real campaigns, get standards from database
        const { data: campaignStandards, error: standardsError } = await supabase
          .from('supplier_assessment_standards')
          .select('standard_id')
          .eq('campaign_id', campaignId);

        if (standardsError) {
          console.error('Error loading campaign standards:', standardsError);
          toast.error('Failed to load assessment requirements');
          return;
        }

        if (!campaignStandards || campaignStandards.length === 0) {
          setRequirements([]);
          return;
        }

        standardIds = campaignStandards.map(cs => cs.standard_id);
      }

      // Get requirements for the standards
      const result = await databaseSupplierAssessmentService.getRequirements(standardIds);
      
      if (result.success && result.requirements) {
        // Convert to ExternalPortalRequirement format
        const portalRequirements: ExternalPortalRequirement[] = result.requirements.map(req => ({
          id: req.id,
          section: req.section,
          name: req.name,
          description: req.description,
          guidance: req.guidance,
          is_mandatory: true, // Default to mandatory for supplier assessments
          weight: 1.0 // Default weight
        }));

        setRequirements(portalRequirements);
        toast.success(`Loaded ${portalRequirements.length} requirements from database`);
      } else {
        console.error('Error loading requirements:', result.error);
        toast.error(result.error || 'Failed to load requirements');
      }
    } catch (error) {
      console.error('Error loading campaign requirements:', error);
      toast.error('Failed to load assessment requirements');
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const result = await databaseSupplierAssessmentService.authenticateSupplier({
        email: loginForm.email,
        inviteToken: loginForm.token
      });

      if (!result.success || !result.user) {
        toast.error(result.error || 'Authentication failed');
        return;
      }

      // Create mock session for demo
      const mockSession: ExternalPortalSession = {
        user: result.user,
        campaign: {
          id: 'campaign-1',
          organization_id: 'org-1',
          supplier_id: result.user.supplier_id,
          name: 'CloudSecure Solutions - Q1 2024 Security Assessment',
          description: 'Comprehensive security and compliance assessment covering ISO 27001, SOC 2, and NIS2 requirements.',
          status: 'in_progress',
          due_date: '2024-04-30',
          created_by: 'user-1',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-03-28T14:30:00Z',
          risk_score: 0,
          risk_level: 'unknown',
          allow_delegation: true,
          require_evidence: true,
          send_reminders: true,
          reminder_frequency_days: 7
        },
        permissions: {
          can_respond: true,
          can_delegate: result.user.role === 'primary',
          can_upload_evidence: true,
          can_view_others_responses: result.user.role === 'primary'
        },
        progress: {
          total_requirements: 15,
          completed_requirements: 8,
          draft_responses: 3,
          percentage_complete: 53
        }
      };

      setSession(mockSession);
      
      // Load actual requirements from campaign
      await loadCampaignRequirements(mockSession.campaign.id);
      
      // Load existing responses from database
      try {
        const responsesResult = await databaseSupplierAssessmentService.getSupplierResponses(
          mockSession.campaign.id, 
          result.user.id
        );
        
        const initialResponses: Record<string, SupplierRequirementResponse> = {};
        
        if (responsesResult.success && responsesResult.responses) {
          // Use real database responses
          responsesResult.responses.forEach(response => {
            initialResponses[response.requirement_id] = response;
          });
        }
        
        setResponses(initialResponses);
        
        // Show progress feedback
        const totalRequirements = requirements.length;
        const completedResponses = Object.values(initialResponses).filter(r => !r.is_draft).length;
        const progressPercentage = Math.round((completedResponses / totalRequirements) * 100);
        
        if (completedResponses > 0) {
          setTimeout(() => {
            toast.info(`📊 Assessment Progress: ${completedResponses}/${totalRequirements} requirements completed (${progressPercentage}%)`);
          }, 1500);
        }
      } catch (error) {
        console.error('Error loading responses:', error);
        toast.error('Failed to load existing responses');
        setResponses({});
      }

      toast.success(`Welcome, ${result.user.full_name}!`);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (requirementId: string, field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        [field]: value,
        updated_at: new Date().toISOString()
      } as SupplierRequirementResponse
    }));
  };

  const handleSaveResponse = async (requirementId: string, isDraft: boolean = true) => {
    const response = responses[requirementId];
    if (!response || !session) return;

    try {
      // Use the database service for actual data persistence
      if (isDraft) {
        const result = await databaseSupplierAssessmentService.saveResponse({
          campaignId: session.campaign.id,
          requirementId: requirementId,
          fulfillmentLevel: response.fulfillment_level,
          responseText: response.response_text,
          evidenceDescription: response.evidence_description,
          confidenceLevel: response.confidence_level
        }, session.user.id);

        if (result.success) {
          toast.success('✅ Response saved as draft');
        } else {
          toast.error(result.error || 'Failed to save response');
        }
      } else {
        // Submit the response
        const submitResult = await databaseSupplierAssessmentService.submitResponse(
          session.campaign.id, 
          requirementId, 
          session.user.id
        );

        if (submitResult.success) {
          toast.success('🎉 Response submitted successfully!');
          setResponses(prev => ({
            ...prev,
            [requirementId]: {
              ...prev[requirementId],
              is_draft: false,
              submitted_at: new Date().toISOString()
            }
          }));
          
          // Show helpful tip
          setTimeout(() => {
            toast.info('💡 Your response has been securely recorded and will be reviewed by the requesting organization.');
          }, 2000);
        } else {
          toast.error(submitResult.error || 'Failed to submit response');
        }
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
    }
  };

  const getFulfillmentBadge = (level: FulfillmentLevel) => {
    const config = {
      'fulfilled': { color: 'bg-green-500', label: 'Fulfilled' },
      'partially_fulfilled': { color: 'bg-yellow-500', label: 'Partially Fulfilled' },
      'not_fulfilled': { color: 'bg-red-500', label: 'Not Fulfilled' },
      'not_applicable': { color: 'bg-gray-500', label: 'Not Applicable' },
      'in_progress': { color: 'bg-blue-500', label: 'In Progress' }
    };

    const { color, label } = config[level];
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assessment portal...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Supplier Assessment Portal</CardTitle>
            <CardDescription>
              Access your security assessment using the invitation link
            </CardDescription>
            {/* Demo badge */}
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                DEMO MODE AVAILABLE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Token</label>
              <Input
                value={loginForm.token}
                onChange={(e) => setLoginForm(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Enter access token from email"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!loginForm.email || !loginForm.token}
            >
              Access Assessment
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setLoginForm(demoCredentials);
                setTimeout(() => handleLogin(), 100);
              }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Use Demo Login
            </Button>
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs">
                <strong>Demo Mode:</strong> Click "Use Demo Login" to test the supplier portal with sample data.
              </AlertDescription>
            </Alert>
            
            <p className="text-xs text-center text-gray-500">
              Secure portal powered by Audit Readiness Hub
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Supplier Assessment Portal</h1>
                <p className="text-sm text-gray-600">{session.campaign.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.full_name}</p>
                <p className="text-xs text-gray-500">{session.user.title}</p>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{session.progress.percentage_complete}%</p>
                    <p className="text-sm text-gray-600">Complete</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{session.progress.completed_requirements}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{session.progress.draft_responses}</p>
                    <p className="text-sm text-gray-600">Drafts</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {session.campaign.due_date ? 
                        Math.ceil((new Date(session.campaign.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                        'N/A'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Days Left</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Overview</CardTitle>
                <CardDescription>Progress on your security assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{session.progress.percentage_complete}%</span>
                    </div>
                    <Progress value={session.progress.percentage_complete} />
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Due Date Reminder</AlertTitle>
                    <AlertDescription>
                      This assessment is due on {new Date(session.campaign.due_date || '').toLocaleDateString()}. 
                      Please complete all required responses before the deadline.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <div className="space-y-6">
              {requirements.map((requirement) => {
                const response = responses[requirement.id];
                const isCompleted = response && !response.is_draft && response.submitted_at;

                return (
                  <Card key={requirement.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {requirement.section} {requirement.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {requirement.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {requirement.is_mandatory && (
                            <Badge variant="outline" className="text-red-600">Required</Badge>
                          )}
                          {response && getFulfillmentBadge(response.fulfillment_level)}
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {requirement.guidance && (
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertTitle>Guidance</AlertTitle>
                          <AlertDescription>{requirement.guidance}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Fulfillment Level</label>
                          <Select
                            value={response?.fulfillment_level || 'not_fulfilled'}
                            onValueChange={(value) => handleResponseChange(requirement.id, 'fulfillment_level', value)}
                            disabled={isCompleted}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fulfilled">Fulfilled</SelectItem>
                              <SelectItem value="partially_fulfilled">Partially Fulfilled</SelectItem>
                              <SelectItem value="not_fulfilled">Not Fulfilled</SelectItem>
                              <SelectItem value="not_applicable">Not Applicable</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Response</label>
                          <Textarea
                            value={response?.response_text || ''}
                            onChange={(e) => handleResponseChange(requirement.id, 'response_text', e.target.value)}
                            placeholder="Describe how you fulfill this requirement..."
                            disabled={isCompleted}
                            rows={4}
                          />
                        </div>

                        {session.campaign.require_evidence && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Evidence Description</label>
                            <Textarea
                              value={response?.evidence_description || ''}
                              onChange={(e) => handleResponseChange(requirement.id, 'evidence_description', e.target.value)}
                              placeholder="Describe the evidence you can provide..."
                              disabled={isCompleted}
                              rows={2}
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-2 block">Confidence Level</label>
                          <Select
                            value={response?.confidence_level?.toString() || '3'}
                            onValueChange={(value) => handleResponseChange(requirement.id, 'confidence_level', parseInt(value))}
                            disabled={isCompleted}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Very Low</SelectItem>
                              <SelectItem value="2">2 - Low</SelectItem>
                              <SelectItem value="3">3 - Medium</SelectItem>
                              <SelectItem value="4">4 - High</SelectItem>
                              <SelectItem value="5">5 - Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {!isCompleted && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleSaveResponse(requirement.id, true)}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Draft
                            </Button>
                            <Button
                              onClick={() => handleSaveResponse(requirement.id, false)}
                              disabled={!response?.response_text}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit Response
                            </Button>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submitted on {new Date(response.submitted_at!).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Progress</CardTitle>
                <CardDescription>Track your completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Requirements by Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {requirements.filter(r => responses[r.id] && responses[r.id].fulfillment_level === 'fulfilled').length}
                        </p>
                        <p className="text-sm text-green-600">Fulfilled</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {requirements.filter(r => responses[r.id] && responses[r.id].fulfillment_level === 'partially_fulfilled').length}
                        </p>
                        <p className="text-sm text-yellow-600">Partial</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {requirements.filter(r => responses[r.id] && responses[r.id].fulfillment_level === 'in_progress').length}
                        </p>
                        <p className="text-sm text-blue-600">In Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {requirements.filter(r => responses[r.id] && responses[r.id].fulfillment_level === 'not_applicable').length}
                        </p>
                        <p className="text-sm text-gray-600">N/A</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {requirements.filter(r => !responses[r.id] || responses[r.id].fulfillment_level === 'not_fulfilled').length}
                        </p>
                        <p className="text-sm text-red-600">Outstanding</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Assessment Started</span>
                        <span>{new Date(session.campaign.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Activity</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Due Date</span>  
                        <span className="text-red-600">
                          {session.campaign.due_date ? new Date(session.campaign.due_date).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Help</CardTitle>
                <CardDescription>Get support for completing your assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Fulfillment Levels Guide</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white">Fulfilled</Badge>
                      <span>Requirement is completely implemented and operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-500 text-white">Partially Fulfilled</Badge>
                      <span>Requirement is partially implemented or has some gaps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500 text-white">In Progress</Badge>
                      <span>Currently working on implementing this requirement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-500 text-white">Not Fulfilled</Badge>
                      <span>Requirement is not currently implemented</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-500 text-white">Not Applicable</Badge>
                      <span>Requirement does not apply to your organization</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Contact Support</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    If you need assistance with your assessment, please contact our support team.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> support@auditready.com</p>
                    <p><strong>Phone:</strong> +1-800-AUDIT-READY</p>
                    <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Technical Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>• Stable internet connection</li>
                    <li>• JavaScript enabled</li>
                    <li>• Cookies enabled for session management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>© 2024 Audit Readiness Hub. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
              <a href="#" className="hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPortal;