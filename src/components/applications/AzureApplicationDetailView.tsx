import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Database, 
  Shield, 
  Settings, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Server,
  Activity,
  BarChart3,
  FileText,
  Lock,
  Zap,
  GitBranch
} from 'lucide-react';
import { EnhancedApplication, RequirementFulfillment } from '@/types/applications';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { RequirementAnsweringInterface } from './RequirementAnsweringInterface';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface AzureApplicationDetailViewProps {
  application: EnhancedApplication;
  onUpdateRequirement?: (requirementId: string, updates: Partial<RequirementFulfillment>) => void;
  onViewRequirementDetails?: (requirementId: string) => void;
  onRefreshSync?: () => void;
  onViewInAzure?: () => void;
  className?: string;
}

export const AzureApplicationDetailView: React.FC<AzureApplicationDetailViewProps> = ({
  application,
  onUpdateRequirement,
  onViewRequirementDetails,
  onRefreshSync,
  onViewInAzure,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (application.syncMode !== 'azure' || !application.azureSyncMetadata) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This application is not configured for Azure synchronization.
        </AlertDescription>
      </Alert>
    );
  }

  const azureMetadata = application.azureSyncMetadata;
  const requirements = application.requirementFulfillments || [];

  const handleCopyResourceId = () => {
    navigator.clipboard.writeText(azureMetadata.azureResourceId);
    toast.success('Azure Resource ID copied to clipboard');
  };

  const handleCopySubscriptionId = () => {
    navigator.clipboard.writeText(azureMetadata.azureSubscriptionId);
    toast.success('Subscription ID copied to clipboard');
  };

  const getComplianceScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span>{application.name}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Azure Synced
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-2">{application.description}</p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{application.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{application.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Criticality:</span>
                  <Badge 
                    variant={application.criticality === 'critical' ? 'destructive' : 
                            application.criticality === 'high' ? 'secondary' : 'outline'}
                  >
                    {application.criticality}
                  </Badge>
                </div>
                {application.complianceScore && (
                  <div className="flex items-center space-x-1">
                    <BarChart3 size={14} className="text-muted-foreground" />
                    <span className={`font-medium ${getComplianceScoreColor(application.complianceScore)}`}>
                      {application.complianceScore}% Compliant
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onViewInAzure && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewInAzure}
                  className="h-8 px-3"
                >
                  <ExternalLink size={14} className="mr-1" />
                  View in Azure
                </Button>
              )}
              {onRefreshSync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshSync}
                  disabled={azureMetadata.syncStatus === 'pending'}
                  className="h-8 px-3"
                >
                  <RefreshCw 
                    size={14} 
                    className={`mr-1 ${azureMetadata.syncStatus === 'pending' ? 'animate-spin' : ''}`} 
                  />
                  Sync Now
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sync Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Azure Synchronization Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SyncStatusIndicator
            syncMetadata={azureMetadata}
            showDetails={true}
            showActions={true}
            onRefreshSync={onRefreshSync}
            onViewDetails={() => setActiveTab('azure-details')}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements" className="relative">
            Requirements
            {requirements.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {requirements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="azure-details">Azure Details</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Application Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Organization Number</span>
                    <div className="font-medium">{application.organizationNumber}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="font-medium capitalize">{application.status}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Review</span>
                    <div className="font-medium">
                      {application.lastReviewDate ? 
                        formatDistanceToNow(new Date(application.lastReviewDate), { addSuffix: true }) : 
                        'Not reviewed'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Review</span>
                    <div className="font-medium">
                      {application.nextReviewDate ? 
                        format(new Date(application.nextReviewDate), 'MMM dd, yyyy') : 
                        'Not scheduled'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Responsible Parties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Business Contact</div>
                  <div className="font-medium">{application.contact.name}</div>
                  <div className="text-sm text-muted-foreground">{application.contact.title}</div>
                  <div className="text-sm">{application.contact.email}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground">Internal Responsible</div>
                  <div className="font-medium">{application.internalResponsible.name}</div>
                  <div className="text-sm text-muted-foreground">{application.internalResponsible.department}</div>
                  <div className="text-sm">{application.internalResponsible.email}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{azureMetadata.autoAnsweredRequirements}</div>
                    <div className="text-xs text-muted-foreground">Auto-Answered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{azureMetadata.manualOverrides}</div>
                    <div className="text-xs text-muted-foreground">Manual Overrides</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold capitalize">{azureMetadata.syncFrequency}</div>
                    <div className="text-xs text-muted-foreground">Sync Frequency</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{azureMetadata.syncVersion}</div>
                    <div className="text-xs text-muted-foreground">Sync Version</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="mt-6">
          <RequirementAnsweringInterface
            requirements={requirements}
            onUpdateRequirement={onUpdateRequirement}
            onViewRequirementDetails={onViewRequirementDetails}
            showAuditTrail={true}
          />
        </TabsContent>

        {/* Azure Details Tab */}
        <TabsContent value="azure-details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resource Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>Azure Resource Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resource ID</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyResourceId}
                        className="h-6 px-2"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {azureMetadata.azureResourceId}
                    </code>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Subscription ID</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopySubscriptionId}
                        className="h-6 px-2"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block">
                      {azureMetadata.azureSubscriptionId}
                    </code>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Resource Group</span>
                    <div className="font-medium">{azureMetadata.azureResourceGroup}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sync Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Synchronization Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Source</span>
                    <span className="font-medium text-xs">{azureMetadata.dataSource}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Successful Sync</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(azureMetadata.lastSuccessfulSync), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync Frequency</span>
                    <span className="font-medium capitalize">{azureMetadata.syncFrequency}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync Version</span>
                    <span className="font-medium">{azureMetadata.syncVersion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Errors (if any) */}
          {azureMetadata.syncStatus === 'error' && azureMetadata.syncErrors && azureMetadata.syncErrors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Synchronization Errors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {azureMetadata.syncErrors.map((error, index) => (
                    <Alert key={index} className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 text-sm">
                        {typeof error === 'string' ? error : error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Compliance Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getComplianceScoreColor(application.complianceScore)}`}>
                    {application.complianceScore || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Overall Compliance
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Requirements</span>
                    <span className="font-medium">{requirements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Answered</span>
                    <span className="font-medium text-green-600">
                      {requirements.filter(r => r.isAutoAnswered && !r.isManualOverride).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Overrides</span>
                    <span className="font-medium text-orange-600">
                      {requirements.filter(r => r.isManualOverride).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fulfilled</span>
                    <span className="font-medium text-green-600">
                      {requirements.filter(r => r.status === 'fulfilled').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getHealthStatusColor('healthy')} border`}>
                      <Lock size={10} className="mr-1" />
                      Encrypted
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getHealthStatusColor('healthy')} border`}>
                      <Zap size={10} className="mr-1" />
                      Monitored
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Security controls automatically validated through Azure Security Center
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Associated Standards */}
          {application.associatedRequirements && application.associatedRequirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Associated Compliance Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {application.associatedRequirements.map((reqId) => (
                    <Badge key={reqId} variant="outline" className="text-xs">
                      {reqId}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AzureApplicationDetailView;