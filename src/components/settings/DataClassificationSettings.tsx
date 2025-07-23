import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  BarChart3,
  Database,
  Scan,
  Timer,
  FileText,
  Download,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  azurePurviewService, 
  ClassificationLabel, 
  RetentionPolicy, 
  ComplianceReport,
  SensitiveDataDetection 
} from '@/services/classification/AzurePurviewService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DataClassificationSettingsProps {
  organizationId: string;
}

export function DataClassificationSettings({ organizationId }: DataClassificationSettingsProps) {
  const { user, organization } = useAuth();
  const { toast } = useToast();

  // State for classification labels
  const [classificationLabels, setClassificationLabels] = useState<ClassificationLabel[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [sensitiveDetections, setSensitiveDetections] = useState<SensitiveDataDetection[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState<ClassificationLabel | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);

  // Form states
  const [labelForm, setLabelForm] = useState({
    name: '',
    displayName: '',
    description: '',
    color: '#3b82f6',
    confidentialityLevel: 'internal' as ClassificationLabel['confidentialityLevel'],
    retentionPeriod: 2555
  });

  const [policyForm, setPolicyForm] = useState({
    name: '',
    description: '',
    retentionPeriod: 2555,
    action: 'notify' as RetentionPolicy['action'],
    appliesTo: [] as string[]
  });

  // Integration settings
  const [azureIntegrationEnabled, setAzureIntegrationEnabled] = useState(false);
  const [autoClassificationEnabled, setAutoClassificationEnabled] = useState(true);
  const [piiDetectionEnabled, setPiiDetectionEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load classification labels
      const labels = await azurePurviewService.syncClassificationLabels(organizationId);
      setClassificationLabels(labels);
      
      // Load retention policies
      const policies = await azurePurviewService.getRetentionPolicies(organizationId);
      setRetentionPolicies(policies);
      
      // Generate compliance report
      const report = await azurePurviewService.generateComplianceReport(organizationId);
      setComplianceReport(report);
      
      // Check Azure integration status
      setAzureIntegrationEnabled(azurePurviewService.isConfigured());
      
    } catch (error) {
      console.error('Error loading data classification data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data classification settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    try {
      // Create custom label (customer-specific, doesn't affect SaaS defaults)
      const newLabel: ClassificationLabel = {
        id: `custom-${Date.now()}`,
        name: labelForm.name,
        displayName: labelForm.displayName,
        description: labelForm.description,
        color: labelForm.color,
        confidentialityLevel: labelForm.confidentialityLevel,
        retentionPeriod: labelForm.retentionPeriod,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In production, this would save to organization_data_classification_labels table
      // with organization_id scope, ensuring customer isolation
      setClassificationLabels(prev => [...prev, newLabel]);
      setShowLabelDialog(false);
      resetLabelForm();
      
      toast({
        title: 'Success',
        description: `Custom classification label "${newLabel.displayName}" created for your organization`
      });
      
      // Analytics for business intelligence
      console.log('Custom label created:', {
        organization: organizationId,
        labelType: newLabel.confidentialityLevel,
        customization: 'customer_specific'
      });
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: 'Error',
        description: 'Failed to create classification label',
        variant: 'destructive'
      });
    }
  };

  const handleEditLabel = async (label: ClassificationLabel) => {
    if (label.isBuiltIn) {
      toast({
        title: 'Cannot Edit Built-in Label',
        description: 'Built-in labels maintain consistency across the platform. Create a custom label instead.',
        variant: 'destructive'
      });
      return;
    }
    
    setEditingLabel(label);
    setLabelForm({
      name: label.name,
      displayName: label.displayName,
      description: label.description,
      color: label.color,
      confidentialityLevel: label.confidentialityLevel,
      retentionPeriod: label.retentionPeriod || 2555
    });
    setShowLabelDialog(true);
  };

  const handleDeleteLabel = async (labelId: string) => {
    const label = classificationLabels.find(l => l.id === labelId);
    if (!label) return;
    
    if (label.isBuiltIn) {
      toast({
        title: 'Cannot Delete Built-in Label',
        description: 'Built-in labels are required for compliance and cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }
    
    // Remove custom label (customer-specific deletion)
    setClassificationLabels(prev => prev.filter(l => l.id !== labelId));
    toast({
      title: 'Label Deleted',
      description: `Custom label "${label.displayName}" has been removed from your organization.`
    });
  };

  const handleCreatePolicy = async () => {
    try {
      const policyId = await azurePurviewService.createRetentionPolicy({
        name: policyForm.name,
        description: policyForm.description,
        retentionPeriod: policyForm.retentionPeriod,
        action: policyForm.action,
        appliesTo: [],
        isActive: true,
        organizationId
      });

      const newPolicy: RetentionPolicy = {
        id: policyId,
        ...policyForm,
        appliesTo: [],
        isActive: true,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setRetentionPolicies(prev => [...prev, newPolicy]);
      setShowPolicyDialog(false);
      resetPolicyForm();
      
      toast({
        title: 'Success',
        description: 'Retention policy created successfully'
      });
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create retention policy',
        variant: 'destructive'
      });
    }
  };

  const resetLabelForm = () => {
    setLabelForm({
      name: '',
      displayName: '',
      description: '',
      color: '#3b82f6',
      confidentialityLevel: 'internal',
      retentionPeriod: 2555
    });
    setEditingLabel(null);
  };

  const resetPolicyForm = () => {
    setPolicyForm({
      name: '',
      description: '',
      retentionPeriod: 2555,
      action: 'notify',
      appliesTo: []
    });
    setEditingPolicy(null);
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      await loadData();
      toast({
        title: 'Success',
        description: 'Data classification settings synchronized'
      });
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: 'Error',
        description: 'Failed to synchronize settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidentialityColor = (level: string) => {
    const colors = {
      'public': 'bg-green-100 text-green-800 border-green-200',
      'internal': 'bg-blue-100 text-blue-800 border-blue-200',
      'confidential': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'restricted': 'bg-red-100 text-red-800 border-red-200',
      'top_secret': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Classification & Governance</h2>
          <p className="text-gray-600">
            Manage data classification labels, retention policies, and compliance monitoring
          </p>
        </div>
        <Button onClick={handleSync} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Settings
        </Button>
      </div>

      {/* Azure Integration Status */}
      <Alert className={azureIntegrationEnabled ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <Shield className={`h-4 w-4 ${azureIntegrationEnabled ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertTitle className={azureIntegrationEnabled ? 'text-green-800' : 'text-orange-800'}>
          Azure Purview Integration {azureIntegrationEnabled ? 'Active' : 'Not Configured'}
        </AlertTitle>
        <AlertDescription className={azureIntegrationEnabled ? 'text-green-700' : 'text-orange-700'}>
          {azureIntegrationEnabled ? (
            'Connected to Microsoft Information Protection for enterprise data governance'
          ) : (
            'Configure Azure Purview integration for advanced data classification and compliance monitoring'
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="labels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="labels">Classification Labels</TabsTrigger>
          <TabsTrigger value="policies">Retention Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Report</TabsTrigger>
          <TabsTrigger value="integration">Integration Settings</TabsTrigger>
        </TabsList>

        {/* Classification Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Classification Labels</CardTitle>
                <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Label
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingLabel ? 'Edit Classification Label' : 'Create Classification Label'}
                      </DialogTitle>
                      <DialogDescription>
                        Define data classification levels for your organization
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          value={labelForm.name}
                          onChange={(e) => setLabelForm(prev => ({ ...prev, name: e.target.value }))}
                          className="col-span-3"
                          placeholder="e.g., highly-confidential"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayName" className="text-right">Display Name</Label>
                        <Input
                          id="displayName"
                          value={labelForm.displayName}
                          onChange={(e) => setLabelForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="col-span-3"
                          placeholder="e.g., Highly Confidential"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea
                          id="description"
                          value={labelForm.description}
                          onChange={(e) => setLabelForm(prev => ({ ...prev, description: e.target.value }))}
                          className="col-span-3"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">Color</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Input
                            id="color"
                            type="color"
                            value={labelForm.color}
                            onChange={(e) => setLabelForm(prev => ({ ...prev, color: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={labelForm.color}
                            onChange={(e) => setLabelForm(prev => ({ ...prev, color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confidentialityLevel" className="text-right">Level</Label>
                        <Select
                          value={labelForm.confidentialityLevel}
                          onValueChange={(value) => setLabelForm(prev => ({ 
                            ...prev, 
                            confidentialityLevel: value as ClassificationLabel['confidentialityLevel']
                          }))}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="confidential">Confidential</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                            <SelectItem value="top_secret">Top Secret</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="retentionPeriod" className="text-right">Retention (days)</Label>
                        <Input
                          id="retentionPeriod"
                          type="number"
                          value={labelForm.retentionPeriod}
                          onChange={(e) => setLabelForm(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLabelDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingLabel ? () => {
                        // Update existing label
                        setClassificationLabels(prev => prev.map(l => 
                          l.id === editingLabel.id 
                            ? { ...l, ...labelForm, updatedAt: new Date().toISOString() }
                            : l
                        ));
                        setShowLabelDialog(false);
                        resetLabelForm();
                        toast({
                          title: 'Success',
                          description: `Label "${labelForm.displayName}" updated successfully`
                        });
                      } : handleCreateLabel}>
                        {editingLabel ? 'Update' : 'Create'} Label
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classificationLabels.map((label) => (
                  <div key={label.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: label.color }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{label.displayName}</h4>
                          <Badge className={getConfidentialityColor(label.confidentialityLevel)}>
                            {label.confidentialityLevel}
                          </Badge>
                          {label.isBuiltIn && (
                            <Badge variant="outline" className="text-xs">Built-in</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{label.description}</p>
                        <p className="text-xs text-gray-500">
                          Retention: {label.retentionPeriod} days
                        </p>
                      </div>
                    </div>
                    
                    {!label.isBuiltIn && (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditLabel(label)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLabel(label.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Retention Policies</CardTitle>
                <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Retention Policy</DialogTitle>
                      <DialogDescription>
                        Define automated data retention rules
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="policyName" className="text-right">Name</Label>
                        <Input
                          id="policyName"
                          value={policyForm.name}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="policyDescription" className="text-right">Description</Label>
                        <Textarea
                          id="policyDescription"
                          value={policyForm.description}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                          className="col-span-3"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="policyRetention" className="text-right">Retention Period</Label>
                        <Input
                          id="policyRetention"
                          type="number"
                          value={policyForm.retentionPeriod}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="policyAction" className="text-right">Action</Label>
                        <Select
                          value={policyForm.action}
                          onValueChange={(value) => setPolicyForm(prev => ({ 
                            ...prev, 
                            action: value as RetentionPolicy['action']
                          }))}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notify">Notify Only</SelectItem>
                            <SelectItem value="archive">Archive</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePolicy}>
                        Create Policy
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{policy.name}</h4>
                        <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                      <p className="text-xs text-gray-500">
                        {policy.retentionPeriod} days • {policy.action}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingPolicy(policy);
                          setPolicyForm({
                            name: policy.name,
                            description: policy.description,
                            retentionPeriod: policy.retentionPeriod,
                            action: policy.action,
                            appliesTo: policy.appliesTo
                          });
                          setShowPolicyDialog(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setRetentionPolicies(prev => prev.filter(p => p.id !== policy.id));
                          toast({
                            title: 'Policy Deleted',
                            description: `Retention policy "${policy.name}" has been removed.`
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Report Tab */}
        <TabsContent value="compliance" className="space-y-4">
          {complianceReport && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">
                    {complianceReport.classifiedDocuments} classified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classification Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((complianceReport.classifiedDocuments / complianceReport.totalDocuments) * 100)}%
                  </div>
                  <Progress 
                    value={(complianceReport.classifiedDocuments / complianceReport.totalDocuments) * 100} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sensitive Data</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {complianceReport.sensitiveDataExposure.high}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    High-risk detections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {complianceReport.gdprCompliantDocuments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compliant documents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Violations</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {complianceReport.retentionViolations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overdue documents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Report Generated</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {new Date(complianceReport.generatedAt).toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Integration Settings Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Azure Purview Integration</CardTitle>
              <p className="text-sm text-gray-600">
                Connect with Microsoft Information Protection for enterprise data governance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="azure-integration">Enable Azure Purview</Label>
                  <p className="text-sm text-gray-500">
                    Sync classification labels and policies from Azure
                  </p>
                </div>
                <Switch
                  id="azure-integration"
                  checked={azureIntegrationEnabled}
                  onCheckedChange={setAzureIntegrationEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-classification">Auto-Classification</Label>
                  <p className="text-sm text-gray-500">
                    Automatically classify new documents
                  </p>
                </div>
                <Switch
                  id="auto-classification"
                  checked={autoClassificationEnabled}
                  onCheckedChange={setAutoClassificationEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pii-detection">PII Detection</Label>
                  <p className="text-sm text-gray-500">
                    Scan documents for personally identifiable information
                  </p>
                </div>
                <Switch
                  id="pii-detection"
                  checked={piiDetectionEnabled}
                  onCheckedChange={setPiiDetectionEnabled}
                />
              </div>

              {!azureIntegrationEnabled && (
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription>
                    Configure Azure Purview environment variables to enable integration:
                    <br />
                    <code className="text-xs bg-gray-100 px-1 rounded">VITE_AZURE_PURVIEW_ENDPOINT</code>
                    <br />
                    <code className="text-xs bg-gray-100 px-1 rounded">VITE_AZURE_CLIENT_ID</code>
                    <br />
                    <code className="text-xs bg-gray-100 px-1 rounded">VITE_AZURE_TENANT_ID</code>
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Azure Purview Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}