import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Laptop,
  X, 
  Shield,
  Cloud,
  RefreshCw,
  Settings,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useApplicationStore } from '@/stores/applicationStore';
import { EnhancedApplication, ApplicationSyncMode } from '@/types/applications';
import { SyncStatusIndicator } from '@/components/applications/SyncStatusIndicator';
import { AzureApplicationDetailView } from '@/components/applications/AzureApplicationDetailView';
import { AzureIntegrationCard } from '@/components/settings/AzureIntegrationCard';
import { getIconClasses, getTypographyClasses } from '@/lib/ui-standards';
import { cn } from '@/lib/utils';

// Import existing mockData for backward compatibility
import { applications as mockApplications } from '@/data/mockData';

const EnhancedApplications = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'azure'>('manual');
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false);
  const [isAzureSettingsOpen, setIsAzureSettingsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<EnhancedApplication | null>(null);
  
  // Zustand store
  const {
    stats,
    filters,
    isSyncing,
    setApplications,
    setFilters,
    getFilteredApplications,
    resetFilters,
    triggerSync
  } = useApplicationStore();

  // Initialize with mock data (convert to enhanced format)
  useEffect(() => {
    const enhancedApps: EnhancedApplication[] = mockApplications.map(app => ({
      ...app,
      syncMode: 'manual' as ApplicationSyncMode,
      requirementFulfillments: [],
      complianceScore: Math.floor(Math.random() * 100) // Mock compliance score
    }));

    // Add some mock Azure applications
    const azureApps: EnhancedApplication[] = [
      {
        id: 'azure-app-1',
        name: 'Customer Portal Azure App',
        description: 'Web application for customer self-service portal',
        organizationNumber: 'AZ-001',
        type: 'Web Application',
        category: 'Customer Facing',
        status: 'active',
        criticality: 'high',
        contact: {
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          phone: '+1 (555) 123-4567',
          title: 'Product Manager'
        },
        internalResponsible: {
          id: 'user-2',
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          department: 'Engineering'
        },
        syncMode: 'azure',
        azureSyncMetadata: {
          lastSyncDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          syncVersion: '1.2.3',
          azureResourceId: '/subscriptions/123/resourceGroups/prod/providers/Microsoft.Web/sites/customer-portal',
          azureSubscriptionId: '12345678-1234-1234-1234-123456789012',
          azureResourceGroup: 'customer-portal-rg',
          syncStatus: 'synced',
          dataSource: 'Azure Security Center',
          lastSuccessfulSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'daily',
          autoAnsweredRequirements: 15,
          manualOverrides: 2
        },
        requirementFulfillments: [
          {
            id: 'rf-1',
            requirementId: 'req-1',
            applicationId: 'azure-app-1',
            status: 'fulfilled',
            isAutoAnswered: true,
            confidenceLevel: 'high',
            autoAnswerSource: 'Azure Security Center',
            evidence: 'HTTPS is enabled and properly configured',
            justification: 'Automatically verified through Azure Security Center',
            responsibleParty: 'Azure Security Center',
            lastAssessmentDate: new Date().toISOString(),
            lastModifiedBy: 'system',
            lastModifiedAt: new Date().toISOString(),
            isManualOverride: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        associatedRequirements: ['req-1'],
        complianceScore: 87,
        lastReviewDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextReviewDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'azure-app-2',
        name: 'Data Analytics Service',
        description: 'Azure-based data processing and analytics platform',
        organizationNumber: 'AZ-002',
        type: 'Data Service',
        category: 'Analytics',
        status: 'active',
        criticality: 'critical',
        contact: {
          name: 'David Wilson',
          email: 'david.wilson@company.com',
          title: 'Data Architect'
        },
        internalResponsible: {
          id: 'user-3',
          name: 'Sarah Davis',
          email: 'sarah.davis@company.com',
          department: 'Data Science'
        },
        syncMode: 'azure',
        azureSyncMetadata: {
          lastSyncDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          syncVersion: '2.1.0',
          azureResourceId: '/subscriptions/123/resourceGroups/data/providers/Microsoft.DataFactory/factories/analytics-df',
          azureSubscriptionId: '12345678-1234-1234-1234-123456789012',
          azureResourceGroup: 'data-analytics-rg',
          syncStatus: 'syncing',
          dataSource: 'Azure Policy',
          lastSuccessfulSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'hourly',
          autoAnsweredRequirements: 23,
          manualOverrides: 1
        },
        requirementFulfillments: [],
        associatedRequirements: [],
        complianceScore: 92,
        lastReviewDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        nextReviewDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setApplications([...enhancedApps, ...azureApps]);
  }, [setApplications]);

  // Filter applications by sync mode
  const filteredApplications = getFilteredApplications();
  const manualApplications = filteredApplications.filter(app => app.syncMode === 'manual');
  const azureApplications = filteredApplications.filter(app => app.syncMode === 'azure');

  const handleViewApplication = (application: EnhancedApplication) => {
    setSelectedApplication(application);
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
  };

  const handleTriggerSync = (applicationId: string) => {
    triggerSync(applicationId);
  };

  const handleOpenAzureSettings = () => {
    setIsAzureSettingsOpen(true);
  };

  const handleCloseAzureSettings = () => {
    setIsAzureSettingsOpen(false);
  };

  const getStatusBadge = (status: EnhancedApplication['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'under-review':
        return <Badge variant="secondary" className="bg-yellow-500">Under Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCriticalityBadge = (criticality: EnhancedApplication['criticality']) => {
    switch (criticality) {
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-blue-500">Medium</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge>{criticality}</Badge>;
    }
  };


  // If an application is selected, show detailed view
  if (selectedApplication) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBackToApplications}>
              <X className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className={getTypographyClasses('page-title')}>Application Details</h1>
          </div>
        </div>

        {selectedApplication.syncMode === 'azure' ? (
          <AzureApplicationDetailView
            application={selectedApplication}
            onRefreshSync={() => handleTriggerSync(selectedApplication.id)}
          />
        ) : (
          // Manual application detail view (keep existing logic)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Laptop className="h-5 w-5" />
                      {selectedApplication.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedApplication.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(selectedApplication.status)}
                    {getCriticalityBadge(selectedApplication.criticality)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Organization Number</h3>
                    <p>{selectedApplication.organizationNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                    <p>{selectedApplication.type || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <p>{selectedApplication.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Compliance Score</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{selectedApplication.complianceScore || 0}%</span>
                      <TrendingUp className={cn(
                        getIconClasses('sm'),
                        (selectedApplication.complianceScore || 0) >= 80 ? 'text-green-500' : 
                        (selectedApplication.complianceScore || 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                      )} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Person</h3>
                  <p className="font-medium">{selectedApplication.contact?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.contact?.title || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p>{selectedApplication.contact?.email || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                  <p>{selectedApplication.contact?.phone || 'N/A'}</p>
                </div>
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Internal Responsible</h3>
                  <p className="font-medium">{selectedApplication.internalResponsible?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.internalResponsible?.department || 'N/A'}</p>
                  <p className="text-sm">{selectedApplication.internalResponsible?.email || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Main applications list view with dual tabs
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Applications" 
        description="Manage your application portfolio with manual and Azure-synced compliance tracking"
      />

      {/* Enhanced Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className={getIconClasses('base')} />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div>
                <span className="text-blue-500 font-medium">{stats.manual}</span> Manual
              </div>
              <div>
                <span className="text-purple-500 font-medium">{stats.azureSynced}</span> Azure
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className={getIconClasses('base')} />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgComplianceScore}%</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div>
                <span className="text-green-500 font-medium">{stats.active}</span> Active
              </div>
              <div>
                <span className="text-amber-500 font-medium">{stats.underReview}</span> Review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className={getIconClasses('base')} />
              Auto-Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.autoAnswered}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div>
                <span className="text-amber-500 font-medium">{stats.manualOverrides}</span> Overrides
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud className={getIconClasses('base')} />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.syncedSuccessfully}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div>
                <span className="text-red-500 font-medium">{stats.syncErrors}</span> Errors
              </div>
              <div>
                <span className="text-blue-500 font-medium">{stats.pendingSync}</span> Pending
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className={getIconClasses('base')} />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-red-500">{stats.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{stats.highRisk}</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={filters.status}
            onValueChange={(value) => setFilters({ status: value as any })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.criticality}
            onValueChange={(value) => setFilters({ criticality: value as any })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by criticality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Criticality</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'azure')}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <User className={getIconClasses('sm')} />
              Manual Applications ({manualApplications.length})
            </TabsTrigger>
            <TabsTrigger value="azure" className="flex items-center gap-2">
              <Cloud className={getIconClasses('sm')} />
              Azure Synced ({azureApplications.length})
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setIsAddApplicationOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        <TabsContent value="manual" className="space-y-4">
          {manualApplications.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Internal Responsible</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualApplications.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewApplication(application)}>
                      <TableCell className="font-medium">{application.name || 'N/A'}</TableCell>
                      <TableCell>{application.type || 'N/A'}</TableCell>
                      <TableCell>{getCriticalityBadge(application.criticality)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{application.complianceScore || 0}%</span>
                          <TrendingUp className={cn(
                            getIconClasses('xs'),
                            (application.complianceScore || 0) >= 80 ? 'text-green-500' : 
                            (application.complianceScore || 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                          )} />
                        </div>
                      </TableCell>
                      <TableCell>{application.internalResponsible?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(application);
                        }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className={cn(getIconClasses('xl'), 'text-muted-foreground mb-3')} />
                <h3 className="text-lg font-medium">No Manual Applications</h3>
                <p className="text-muted-foreground text-center">
                  Add your first manual application to get started with compliance tracking.
                </p>
                <Button className="mt-4" onClick={() => setIsAddApplicationOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Manual Application
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="azure" className="space-y-4">
          {azureApplications.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sync Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Auto-Answers</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {azureApplications.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewApplication(application)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Cloud className={cn(getIconClasses('sm'), 'text-blue-500')} />
                          {application.name}
                        </div>
                      </TableCell>
                      <TableCell>{application.type || 'N/A'}</TableCell>
                      <TableCell>
                        {application.azureSyncMetadata && (
                          <SyncStatusIndicator
                            syncMetadata={application.azureSyncMetadata}
                            size="sm"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{application.complianceScore || 0}%</span>
                          <TrendingUp className={cn(
                            getIconClasses('xs'),
                            (application.complianceScore || 0) >= 80 ? 'text-green-500' : 
                            (application.complianceScore || 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                          )} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Bot className={cn(getIconClasses('xs'), 'text-blue-500')} />
                          <span className="text-sm">{application.azureSyncMetadata?.autoAnsweredRequirements || 0}</span>
                          {(application.azureSyncMetadata?.manualOverrides || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-1 bg-yellow-100 text-yellow-800">
                              {application.azureSyncMetadata?.manualOverrides} overrides
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {application.azureSyncMetadata ? 
                            new Date(application.azureSyncMetadata.lastSyncDate).toLocaleString() : 
                            'Never'
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerSync(application.id);
                            }}
                            disabled={isSyncing}
                          >
                            <RefreshCw className={cn(getIconClasses('xs'), isSyncing && 'animate-spin')} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplication(application);
                          }}>
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cloud className={cn(getIconClasses('xl'), 'text-muted-foreground mb-3')} />
                <h3 className="text-lg font-medium">No Azure Applications</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Connect your Azure resources to automatically sync compliance data and get AI-powered requirement assessments.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={handleOpenAzureSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Azure
                  </Button>
                  <Button onClick={handleOpenAzureSettings}>
                    <Zap className="mr-2 h-4 w-4" />
                    Discover Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Azure Integration Settings Dialog */}
      <Dialog open={isAzureSettingsOpen} onOpenChange={setIsAzureSettingsOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Azure Integration Settings
            </DialogTitle>
            <DialogDescription>
              Configure Azure application sync and security monitoring for automatic compliance tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <AzureIntegrationCard organizationId="demo-org-1" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAzureSettings}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Application Dialog (placeholder - would need full implementation) */}
      <Dialog open={isAddApplicationOpen} onOpenChange={setIsAddApplicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
            <DialogDescription>
              Choose whether to add a manual application or discover Azure resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <User className={cn(getIconClasses('xl'), 'text-blue-500 mb-3')} />
                <h3 className="font-medium">Manual Application</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Manually define application details and track compliance
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Cloud className={cn(getIconClasses('xl'), 'text-purple-500 mb-3')} />
                <h3 className="font-medium">Azure Discovery</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Automatically discover and sync Azure resources
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddApplicationOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedApplications;