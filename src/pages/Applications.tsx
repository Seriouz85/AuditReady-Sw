import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Filter, Laptop, X, Shield, Cloud, 
  AlertTriangle, CheckCircle, Clock, Zap,
  TrendingUp, Database, Smartphone, Network,
  RefreshCw, AlertCircle, Eye, Edit3, Settings
} from "lucide-react";
import { enhancedApplications } from "@/data/mockData";
import { Requirement } from "@/types";
import { 
  EnhancedApplication, 
  SyncStatus, 
  ConfidenceLevel, 
  RequirementStatus,
  ApplicationStats 
} from "@/types/applications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from '@/components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AzureIntegrationCard } from "@/components/settings/AzureIntegrationCard";

// Component for sync status indicator
const SyncStatusIndicator: React.FC<{ status: SyncStatus; lastSync?: string }> = ({ status, lastSync }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Synced' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' };
      case 'error':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Error' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Not Synced' };
    }
  };

  const { icon: Icon, color, bg, label } = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${bg}`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      {lastSync && (
        <span className="text-xs text-muted-foreground ml-1">
          {new Date(lastSync).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

// Component for confidence level indicator
const ConfidenceLevelIndicator: React.FC<{ level: ConfidenceLevel }> = ({ level }) => {
  const getConfig = () => {
    switch (level) {
      case 'high':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'High Confidence' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Confidence' };
      case 'low':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Confidence' };
    }
  };

  const { color, bg, label } = getConfig();

  return (
    <Badge variant="outline" className={`${color} ${bg} border-current`}>
      {label}
    </Badge>
  );
};

// Component for requirement answering interface
const RequirementAnsweringInterface: React.FC<{
  application: EnhancedApplication;
  onUpdate?: (application: EnhancedApplication) => void;
}> = ({ application }) => {
  const autoAnsweredCount = application.requirementFulfillments?.filter(rf => rf.isAutoAnswered).length || 0;
  const manualOverrides = application.requirementFulfillments?.filter(rf => rf.isManualOverride).length || 0;
  const totalRequirements = application.requirementFulfillments?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          AI-Powered Requirement Analysis
        </CardTitle>
        <CardDescription>
          Azure integration automatically evaluates compliance requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{autoAnsweredCount}</div>
            <div className="text-sm text-muted-foreground">Auto-Answered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{manualOverrides}</div>
            <div className="text-sm text-muted-foreground">Manual Overrides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRequirements}</div>
            <div className="text-sm text-muted-foreground">Total Requirements</div>
          </div>
        </div>
        
        {totalRequirements > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Automation Coverage</span>
              <span>{Math.round((autoAnsweredCount / totalRequirements) * 100)}%</span>
            </div>
            <Progress value={(autoAnsweredCount / totalRequirements) * 100} className="h-2" />
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Review Answers
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-sync Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Applications = () => {
  const [applications, setApplications] = useState<EnhancedApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnhancedApplication['status'] | "all">("all");
  const [criticalityFilter, setCriticalityFilter] = useState<EnhancedApplication['criticality'] | "all">("all");
  const [selectedApplication, setSelectedApplication] = useState<EnhancedApplication | null>(null);
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [isAzureSettingsOpen, setIsAzureSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'azure'>('manual');
  
  // New application form state
  const [newApplication, setNewApplication] = useState({
    name: '',
    description: '',
    organizationNumber: '',
    type: '',
    category: '',
    criticality: 'medium',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    internalResponsibleId: ''
  });
  
  // Requirements selection state
  const [selectedRequirements, setSelectedRequirements] = useState<Record<string, boolean>>({});
  
  // Placeholder data until we confirm where these come from
  const requirements: Requirement[] = [];

  // Get filtered applications based on active tab
  const getFilteredApplications = (syncMode: 'manual' | 'azure') => {
    return applications.filter((application) => {
      const matchesSyncMode = application.syncMode === syncMode;
      const matchesSearch = 
        application.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.organizationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (application.category && application.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (application.contact?.name && application.contact.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesCriticality = criticalityFilter === "all" || application.criticality === criticalityFilter;
      
      return matchesSyncMode && matchesSearch && matchesStatus && matchesCriticality;
    });
  };

  const manualApplications = getFilteredApplications('manual');
  const azureApplications = getFilteredApplications('azure');

  // Enhanced application stats for dashboard
  const applicationStats: ApplicationStats = {
    total: applications?.length || 0,
    manual: applications?.filter(app => app.syncMode === 'manual').length || 0,
    azureSynced: applications?.filter(app => app.syncMode === 'azure').length || 0,
    active: applications?.filter(app => app.status === 'active').length || 0,
    underReview: applications?.filter(app => app.status === 'under-review').length || 0,
    critical: applications?.filter(app => app.criticality === 'critical').length || 0,
    highRisk: applications?.filter(app => app.criticality === 'high').length || 0,
    reviewDue: applications?.filter(app => {
      if (!app.nextReviewDate) return false;
      const nextReview = new Date(app.nextReviewDate);
      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(today.getMonth() + 3);
      return nextReview <= threeMonthsFromNow;
    }).length || 0,
    averageComplianceScore: applications?.reduce((acc, app) => acc + (app.complianceScore || 0), 0) / (applications?.length || 1) || 0,
    autoAnsweredRequirements: applications?.reduce((acc, app) => 
      acc + (app.requirementFulfillments?.filter(rf => rf.isAutoAnswered).length || 0), 0
    ) || 0,
    manualOverrides: applications?.reduce((acc, app) => 
      acc + (app.requirementFulfillments?.filter(rf => rf.isManualOverride).length || 0), 0
    ) || 0,
    syncErrors: applications?.filter(app => 
      app.azureSyncMetadata?.syncStatus === 'error'
    ).length || 0,
    syncedSuccessfully: applications?.filter(app => 
      app.azureSyncMetadata?.syncStatus === 'synced'
    ).length || 0,
    pendingSync: applications?.filter(app => 
      app.azureSyncMetadata?.syncStatus === 'pending'
    ).length || 0,
    totalRequirements: applications?.reduce((acc, app) => acc + (app.requirementFulfillments?.length || 0), 0) || 0,
    autoAnswered: applications?.reduce((acc, app) => 
      acc + (app.requirementFulfillments?.filter(rf => rf.isAutoAnswered).length || 0), 0
    ) || 0,
    manuallyAnswered: applications?.reduce((acc, app) => 
      acc + (app.requirementFulfillments?.filter(rf => !rf.isAutoAnswered).length || 0), 0
    ) || 0,
    avgComplianceScore: applications?.reduce((acc, app) => acc + (app.complianceScore || 0), 0) / (applications?.length || 1) || 0
  };

  useEffect(() => {
    setApplications(enhancedApplications || []);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddApplication = () => {
    // Validate form
    if (!newApplication.name || !newApplication.organizationNumber || 
        !newApplication.contactName || !newApplication.contactEmail) {
      console.error("Please fill in all required fields");
      return;
    }

    const now = new Date().toISOString();
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    
    const newId = `app-manual-${applications.filter(app => app.syncMode === 'manual').length + 1}`;
    
    const createdApplication: EnhancedApplication = {
      id: newId,
      name: newApplication.name,
      description: newApplication.description,
      organizationNumber: newApplication.organizationNumber,
      type: newApplication.type,
      category: newApplication.category,
      status: 'active',
      criticality: newApplication.criticality as EnhancedApplication['criticality'],
      syncMode: 'manual',
      contact: {
        name: newApplication.contactName,
        email: newApplication.contactEmail,
        phone: newApplication.contactPhone,
        title: newApplication.contactTitle
      },
      internalResponsible: {
        id: 'internal-user-demo',
        name: 'Demo User',
        email: 'demo@auditready.com',
        department: 'IT Security'
      },
      associatedRequirements: [],
      lastReviewDate: now,
      nextReviewDate: nextYearDate.toISOString(),
      createdAt: now,
      updatedAt: now,
      requirementFulfillments: [],
      complianceScore: 0
    };

    // Add to applications
    setApplications(prev => [...prev, createdApplication]);
    
    // Reset form and close dialog
    setNewApplication({
      name: '',
      description: '',
      organizationNumber: '',
      type: '',
      category: '',
      criticality: 'medium',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactTitle: '',
      internalResponsibleId: ''
    });
    
    setIsAddApplicationOpen(false);
    console.log("Application added successfully");
  };

  const handleViewApplication = (application: EnhancedApplication) => {
    setSelectedApplication(application);
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
  };

  const handleOpenRequirementsDialog = () => {
    if (!selectedApplication) return;
    
    // Initialize selected requirements
    const initialSelected: Record<string, boolean> = {};
    
    // Get all requirements with the Application tag
    const applicationRequirements = requirements.filter(req => 
      req.tags?.includes('tag-application')
    );
    
    // Pre-select requirements that are already associated with this application
    applicationRequirements.forEach(req => {
      initialSelected[req.id] = selectedApplication.requirementFulfillments?.some(rf => rf.requirementId === req.id) || false;
    });
    
    setSelectedRequirements(initialSelected);
    setIsRequirementsOpen(true);
  };

  const handleRequirementChange = (requirementId: string, checked: boolean) => {
    setSelectedRequirements(prev => ({
      ...prev,
      [requirementId]: checked
    }));
  };

  const handleSaveRequirements = () => {
    if (!selectedApplication) return;
    
    // Get all selected requirement IDs
    const selectedReqIds = Object.entries(selectedRequirements)
      .filter(([_, isSelected]) => isSelected)
      .map(([reqId]) => reqId);
    
    // Update the application with the new associated requirements
    const updatedApplication = {
      ...selectedApplication,
      requirementFulfillments: selectedReqIds.map(reqId => ({
        id: `rf-${selectedApplication.id}-${reqId}`,
        requirementId: reqId,
        applicationId: selectedApplication.id,
        status: 'not_fulfilled' as RequirementStatus,
        isAutoAnswered: false,
        evidence: '',
        justification: '',
        responsibleParty: selectedApplication.internalResponsible?.name || '',
        lastAssessmentDate: new Date().toISOString(),
        lastModifiedBy: 'Demo User',
        lastModifiedAt: new Date().toISOString(),
        isManualOverride: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
    
    // Update the application in the main list
    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === selectedApplication.id ? updatedApplication : app
      )
    );
    
    // Update the selected application state as well
    setSelectedApplication(updatedApplication);
    
    // Close the dialog
    setIsRequirementsOpen(false);
    console.log("Requirements updated successfully");
  };

  const handleScheduleReview = () => {
    if (!selectedApplication) return;
    
    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6); // Schedule review for 6 months later
    
    const updatedApplication = {
      ...selectedApplication,
      nextReviewDate: nextReviewDate.toISOString(),
      status: 'under-review' as EnhancedApplication['status']
    };

    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === selectedApplication.id ? updatedApplication : app
      )
    );
    setSelectedApplication(updatedApplication);
    console.log(`Review scheduled`);
  };

  const handleUpdateApplication = (updatedApplication: EnhancedApplication) => {
    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === updatedApplication.id ? updatedApplication : app
      )
    );
    setSelectedApplication(updatedApplication);
  };

  const handleAzureSync = () => {
    console.log("Triggering Azure sync...");
    
    // Simulate sync process with visual feedback
    const syncing = document.querySelectorAll('[data-sync-button]');
    syncing.forEach(btn => {
      const icon = btn.querySelector('svg');
      if (icon) {
        icon.classList.add('animate-spin');
      }
    });
    
    // Simulate completion after 2 seconds  
    setTimeout(() => {
      syncing.forEach(btn => {
        const icon = btn.querySelector('svg');
        if (icon) {
          icon.classList.remove('animate-spin');
        }
      });
      
      // Show success feedback (could integrate with toast system)
      console.log("Azure sync completed successfully");
    }, 2000);
  };

  const handleOpenAzureSettings = () => {
    console.log('Opening Azure Settings dialog - current state:', isAzureSettingsOpen);
    setIsAzureSettingsOpen(true);
    console.log('Azure Settings dialog should now be open');
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

  const getApplicationIcon = (type: string, syncMode: 'manual' | 'azure') => {
    if (syncMode === 'azure') {
      switch (type) {
        case 'Cloud Application':
        case 'Data Lake':
          return <Database className="h-5 w-5 text-blue-500" />;
        case 'API Gateway':
          return <Network className="h-5 w-5 text-purple-500" />;
        case 'Mobile Application':
          return <Smartphone className="h-5 w-5 text-green-500" />;
        case 'IoT Platform':
          return <Zap className="h-5 w-5 text-orange-500" />;
        default:
          return <Cloud className="h-5 w-5 text-blue-500" />;
      }
    }
    return <Laptop className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const isReviewDueSoon = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const nextReview = new Date(dateString);
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(today.getMonth() + 1);
      return nextReview <= oneMonthFromNow;
    } catch (e) {
      return false;
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
            <h1 className="text-2xl font-bold">Application Details</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenRequirementsDialog}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Requirements
            </Button>
            <Button onClick={handleScheduleReview}>
              Schedule Review
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Icon and Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {getApplicationIcon(selectedApplication.type || '', selectedApplication.syncMode)}
                    {selectedApplication.name}
                    {selectedApplication.syncMode === 'azure' && (
                      <Badge variant="outline" className="ml-2 text-blue-600 border-blue-600">
                        <Cloud className="h-3 w-3 mr-1" />
                        Azure Synced
                      </Badge>
                    )}
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
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Review Schedule</h3>
                  <div className="flex items-center gap-2">
                    <span className={isReviewDueSoon(selectedApplication.nextReviewDate) ? "text-red-500 font-medium" : ""}>
                      Next: {formatDate(selectedApplication.nextReviewDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span>Last: {formatDate(selectedApplication.lastReviewDate)}</span>
                  </div>
                </div>
                {selectedApplication.complianceScore !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Compliance Score</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedApplication.complianceScore} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(selectedApplication.complianceScore)}%</span>
                    </div>
                  </div>
                )}
                {selectedApplication.syncMode === 'azure' && selectedApplication.azureSyncMetadata && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sync Status</h3>
                    <SyncStatusIndicator 
                      status={selectedApplication.azureSyncMetadata.syncStatus} 
                      lastSync={selectedApplication.azureSyncMetadata.lastSyncDate}
                    />
                  </div>
                )}
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
        
        {/* AI-Powered Requirement Analysis for Azure applications */}
        {selectedApplication.syncMode === 'azure' && (
          <RequirementAnsweringInterface 
            application={selectedApplication}
            onUpdate={handleUpdateApplication}
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Requirements
              {selectedApplication.syncMode === 'azure' && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  AI-Enhanced
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Security and compliance requirements for this application
              {selectedApplication.syncMode === 'azure' && (
                <span className="block mt-1 text-blue-600">
                  Requirements automatically analyzed using Azure integration
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!selectedApplication.requirementFulfillments || selectedApplication.requirementFulfillments.length === 0) ? (
              <div className="text-center py-12 border rounded-lg">
                <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium">No requirements assigned</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Assign requirements to this application to track compliance
                </p>
                <Button onClick={handleOpenRequirementsDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirements
                </Button>
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Evidence/Description</TableHead>
                        <TableHead>Last Assessment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedApplication.requirementFulfillments || []).map(fulfillment => (
                        <TableRow key={fulfillment.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{fulfillment.requirementId}</div>
                              {fulfillment.autoAnswerSource && (
                                <div className="text-xs text-muted-foreground">
                                  Source: {fulfillment.autoAnswerSource}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={fulfillment.status === 'fulfilled' ? 'default' : 'outline'}
                              className={
                                fulfillment.status === 'fulfilled' ? 'bg-green-500' : 
                                fulfillment.status === 'partially_fulfilled' ? 'text-yellow-500 border-yellow-500' : 
                                fulfillment.status === 'not_applicable' ? 'text-gray-500 border-gray-500' :
                                'text-red-500 border-red-500'
                              }
                            >
                              {fulfillment.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {fulfillment.isAutoAnswered && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs w-fit">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                              {fulfillment.isManualOverride && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs w-fit">
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Override
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {fulfillment.confidenceLevel && (
                              <ConfidenceLevelIndicator level={fulfillment.confidenceLevel} />
                            )}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="space-y-1">
                              <p className="text-sm">{fulfillment.evidence}</p>
                              {fulfillment.isManualOverride && fulfillment.overrideReason && (
                                <p className="text-xs text-orange-600 italic">
                                  Override: {fulfillment.overrideReason}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(fulfillment.lastAssessmentDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-3">
                  {(selectedApplication.requirementFulfillments || []).map(fulfillment => (
                    <Card key={fulfillment.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{fulfillment.requirementId}</h4>
                            {fulfillment.autoAnswerSource && (
                              <p className="text-xs text-muted-foreground">
                                Source: {fulfillment.autoAnswerSource}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant={fulfillment.status === 'fulfilled' ? 'default' : 'outline'}
                              className={
                                fulfillment.status === 'fulfilled' ? 'bg-green-500' : 
                                fulfillment.status === 'partially_fulfilled' ? 'text-yellow-500 border-yellow-500' : 
                                fulfillment.status === 'not_applicable' ? 'text-gray-500 border-gray-500' :
                                'text-red-500 border-red-500'
                              }
                            >
                              {fulfillment.status.replace('_', ' ')}
                            </Badge>
                            {fulfillment.confidenceLevel && (
                              <ConfidenceLevelIndicator level={fulfillment.confidenceLevel} />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {fulfillment.isAutoAnswered && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                            {fulfillment.isManualOverride && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                <Edit3 className="h-3 w-3 mr-1" />
                                Override
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{fulfillment.evidence}</p>
                          
                          {fulfillment.isManualOverride && fulfillment.overrideReason && (
                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                              <Edit3 className="h-3 w-3 inline mr-1" />
                              Override: {fulfillment.overrideReason}
                            </p>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Last assessed: {formatDate(fulfillment.lastAssessmentDate)}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Requirements Dialog */}
        <Dialog open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Manage Requirements</DialogTitle>
              <DialogDescription>
                Select security and compliance requirements applicable to this application.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3">Application Requirements</h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {requirements
                      .filter(req => req.tags?.includes('tag-application'))
                      .map(requirement => (
                        <div key={requirement.id} className="flex items-start gap-2">
                          <Checkbox 
                            id={`req-${requirement.id}`}
                            checked={selectedRequirements[requirement.id] || false}
                            onCheckedChange={(checked) => 
                              handleRequirementChange(requirement.id, !!checked)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`req-${requirement.id}`} className="font-medium">
                              {requirement.section} {requirement.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsRequirementsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRequirements}>
                Save Requirements
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main applications list view
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Applications" 
        description="Manage and track your application portfolio compliance"
      />

      {/* Enhanced Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationStats.total}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Laptop className="h-3 w-3" />
                <span className="text-gray-600 font-medium">{applicationStats.manual}</span> Manual
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                <span className="text-blue-600 font-medium">{applicationStats.azureSynced}</span> Azure
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              AI Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{applicationStats.autoAnswered}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <div>
                <span className="text-orange-500 font-medium">{applicationStats.manualOverrides}</span> Overrides
              </div>
              <div>
                <span className="text-red-500 font-medium">{applicationStats.syncErrors}</span> Errors
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-sm">
              <div>
                <span className="text-red-500 font-bold">{applicationStats.critical}</span> Critical
              </div>
              <div>
                <span className="text-orange-500 font-medium">{applicationStats.highRisk}</span> High Risk
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: applicationStats.total > 0 ? `${(applicationStats.critical / applicationStats.total) * 100}%` : '0%' }} 
                />
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: applicationStats.total > 0 ? `${(applicationStats.highRisk / applicationStats.total) * 100}%` : '0%' }} 
                />
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: applicationStats.total > 0 ? `${((applicationStats.total - applicationStats.critical - applicationStats.highRisk) / applicationStats.total) * 100}%` : '0%' }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Math.round(applicationStats.avgComplianceScore)}%
            </div>
            <div className="mt-2">
              <Progress value={applicationStats.avgComplianceScore} className="h-2" />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">Average across all applications</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dual-Tab Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'azure')} className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <TabsList className="grid w-full lg:w-auto grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                Manual Applications
                <Badge variant="secondary" className="ml-1">{applicationStats.manual}</Badge>
              </TabsTrigger>
              <TabsTrigger value="azure" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Azure Synced
                <Badge variant="secondary" className="ml-1">{applicationStats.azureSynced}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EnhancedApplication['status'] | "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={criticalityFilter}
                onValueChange={(value) => setCriticalityFilter(value as EnhancedApplication['criticality'] | "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Manual Applications Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Manual Applications</h3>
              <p className="text-sm text-muted-foreground">
                Traditional applications managed through manual assessment and documentation
              </p>
            </div>
            <Dialog open={isAddApplicationOpen} onOpenChange={setIsAddApplicationOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Manual Application</DialogTitle>
                  <DialogDescription>
                    Enter the details of the application you want to add to your compliance program.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newApplication.name}
                      onChange={handleInputChange}
                      placeholder="Application name"
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newApplication.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the application"
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="organizationNumber" className="text-right">
                      Org. Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="organizationNumber"
                      name="organizationNumber"
                      value={newApplication.organizationNumber}
                      onChange={handleInputChange}
                      placeholder="Organization identification number"
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={newApplication.type} 
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger id="type" className="col-span-3">
                        <SelectValue placeholder="Select application type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="External">External</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      value={newApplication.category}
                      onChange={handleInputChange}
                      placeholder="E.g. Finance, HR, Operations"
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="criticality" className="text-right">
                      Criticality
                    </Label>
                    <Select 
                      value={newApplication.criticality} 
                      onValueChange={(value) => handleSelectChange('criticality', value)}
                    >
                      <SelectTrigger id="criticality" className="col-span-3">
                        <SelectValue placeholder="Select criticality level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h3 className="font-medium mb-3">Contact Information</h3>
                    
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="contactName" className="text-right">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={newApplication.contactName}
                        onChange={handleInputChange}
                        placeholder="Contact person name"
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="contactEmail" className="text-right">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        value={newApplication.contactEmail}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="contactPhone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newApplication.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactTitle" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="contactTitle"
                        name="contactTitle"
                        value={newApplication.contactTitle}
                        onChange={handleInputChange}
                        placeholder="E.g. Application Owner"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h3 className="font-medium mb-3">Internal Responsible</h3>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="internalResponsible" className="text-right">
                        Person
                      </Label>
                      <div className="col-span-3">
                        <Input 
                          id="internalResponsible" 
                          value="Demo User (IT Security)"
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Demo account - automatically assigned
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddApplicationOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddApplication}>
                    Add Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {manualApplications.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Criticality</TableHead>
                      <TableHead>Internal Responsible</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualApplications.map((application) => (
                      <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewApplication(application)}>
                        <TableCell>{getApplicationIcon(application.type || '', application.syncMode)}</TableCell>
                        <TableCell className="font-medium">{application.name || 'N/A'}</TableCell>
                        <TableCell>{application.type || 'N/A'}</TableCell>
                        <TableCell>{getCriticalityBadge(application.criticality)}</TableCell>
                        <TableCell>{application.internalResponsible?.name || 'N/A'}</TableCell>
                        <TableCell className={isReviewDueSoon(application.nextReviewDate) ? "text-red-500 font-medium" : ""}>
                          {formatDate(application.nextReviewDate)}
                        </TableCell>
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {manualApplications.map((application) => (
                  <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewApplication(application)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getApplicationIcon(application.type || '', application.syncMode)}
                          <div>
                            <h3 className="font-semibold text-base mb-1">{application.name || 'N/A'}</h3>
                            <p className="text-sm text-muted-foreground">{application.type || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getCriticalityBadge(application.criticality)}
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Responsible:</span>
                          <span className="font-medium">{application.internalResponsible?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Review:</span>
                          <span className={isReviewDueSoon(application.nextReviewDate) ? "text-red-500 font-medium" : "font-medium"}>
                            {formatDate(application.nextReviewDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(application);
                        }}>
                          <Shield className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background">
              <Laptop className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium">No manual applications found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery || statusFilter !== "all" || criticalityFilter !== "all" ? 
                  "Try adjusting your search or filters" : 
                  "Add your first manual application to get started"}
              </p>
              {searchQuery || statusFilter !== "all" || criticalityFilter !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCriticalityFilter("all");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setIsAddApplicationOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Application
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Azure Synced Applications Tab */}
        <TabsContent value="azure" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Azure Synced Applications
              </h3>
              <p className="text-sm text-muted-foreground">
                Cloud applications automatically discovered and managed through Azure integration
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAzureSync} data-sync-button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  console.log('Sync Settings button clicked!');
                  e.preventDefault();
                  handleOpenAzureSettings();
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Sync Settings
              </Button>
            </div>
          </div>

          {azureApplications.length > 0 ? (
            <>
              {/* Desktop Table View for Azure Apps */}
              <div className="hidden md:block border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sync Status</TableHead>
                      <TableHead>Auto-Answered</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Criticality</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {azureApplications.map((application) => (
                      <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewApplication(application)}>
                        <TableCell>{getApplicationIcon(application.type || '', application.syncMode)}</TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{application.name || 'N/A'}</div>
                            <div className="text-xs text-blue-600">{application.organizationNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{application.type || 'N/A'}</TableCell>
                        <TableCell>
                          {application.azureSyncMetadata && (
                            <SyncStatusIndicator 
                              status={application.azureSyncMetadata.syncStatus}
                              lastSync={application.azureSyncMetadata.lastSyncDate}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {application.azureSyncMetadata?.autoAnsweredRequirements || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.complianceScore !== undefined && (
                            <div className="flex items-center gap-2">
                              <Progress value={application.complianceScore} className="w-16 h-2" />
                              <span className="text-sm font-medium">{Math.round(application.complianceScore)}%</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getCriticalityBadge(application.criticality)}</TableCell>
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

              {/* Mobile Card View for Azure Apps */}
              <div className="md:hidden space-y-4">
                {azureApplications.map((application) => (
                  <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewApplication(application)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getApplicationIcon(application.type || '', application.syncMode)}
                          <div>
                            <h3 className="font-semibold text-base mb-1">{application.name || 'N/A'}</h3>
                            <p className="text-sm text-muted-foreground">{application.type || 'N/A'}</p>
                            <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs mt-1">
                              <Cloud className="h-3 w-3 mr-1" />
                              Azure Synced
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getCriticalityBadge(application.criticality)}
                          {application.azureSyncMetadata && (
                            <SyncStatusIndicator 
                              status={application.azureSyncMetadata.syncStatus}
                              lastSync={application.azureSyncMetadata.lastSyncDate}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auto-Answered:</span>
                          <span className="font-medium text-blue-600">
                            {application.azureSyncMetadata?.autoAnsweredRequirements || 0} requirements
                          </span>
                        </div>
                        {application.complianceScore !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Compliance:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={application.complianceScore} className="w-16 h-2" />
                              <span className="font-medium">{Math.round(application.complianceScore)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(application);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View AI Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background">
              <Cloud className="mx-auto h-12 w-12 text-blue-300 mb-3" />
              <h3 className="text-lg font-medium">No Azure applications found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery || statusFilter !== "all" || criticalityFilter !== "all" ? 
                  "Try adjusting your search or filters" : 
                  "Azure integration will automatically discover and sync your cloud applications"}
              </p>
              {searchQuery || statusFilter !== "all" || criticalityFilter !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCriticalityFilter("all");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleAzureSync} data-sync-button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Azure Resources
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      console.log('Configure Integration button clicked!');
                      e.preventDefault();
                      handleOpenAzureSettings();
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Integration
                  </Button>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default Applications;