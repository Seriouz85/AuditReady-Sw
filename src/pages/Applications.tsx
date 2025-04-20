import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, Filter, Mail, Laptop,
  X, Check, AlertTriangle, FileEdit, Trash2, Shield,
} from "lucide-react";
import { applications as initialApplications } from "@/data/mockData";
import { InternalUser, Application, Requirement, Standard } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from '@/components/PageHeader';

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Application['status'] | "all">("all");
  const [criticalityFilter, setCriticalityFilter] = useState<Application['criticality'] | "all">("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  
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
  const internalUsers: InternalUser[] = []; 
  const requirements: Requirement[] = [];
  const standards: Standard[] = [];

  // Get filtered applications
  const filteredApplications = applications.filter((application) => {
    const matchesSearch = 
      application.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.organizationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application.category && application.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      application.contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    const matchesCriticality = criticalityFilter === "all" || application.criticality === criticalityFilter;
    
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  // Application stats for dashboard
  const applicationStats = {
    total: applications.length,
    active: applications.filter(app => app.status === 'active').length,
    underReview: applications.filter(app => app.status === 'under-review').length,
    critical: applications.filter(app => app.criticality === 'critical').length,
    highRisk: applications.filter(app => app.criticality === 'high').length,
    reviewDue: applications.filter(app => {
      if (!app.nextReviewDate) return false;
      const nextReview = new Date(app.nextReviewDate);
      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(today.getMonth() + 3);
      return nextReview <= threeMonthsFromNow;
    }).length
  };

  useEffect(() => {
    setApplications(initialApplications);
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
        !newApplication.contactName || !newApplication.contactEmail || 
        !newApplication.internalResponsibleId) {
      console.error("Please fill in all required fields");
      return;
    }

    // Create new application
    const selectedResponsible = internalUsers.find(user => user.id === newApplication.internalResponsibleId);
    if (!selectedResponsible) {
      console.error("Please select a valid internal responsible person");
      return;
    }

    const now = new Date().toISOString();
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    
    const newId = `app-${applications.length + 1}`;
    
    const createdApplication: Application = {
      id: newId,
      name: newApplication.name,
      description: newApplication.description,
      organizationNumber: newApplication.organizationNumber,
      type: newApplication.type,
      category: newApplication.category,
      status: 'active',
      criticality: newApplication.criticality as Application['criticality'],
      contact: {
        name: newApplication.contactName,
        email: newApplication.contactEmail,
        phone: newApplication.contactPhone,
        title: newApplication.contactTitle
      },
      internalResponsible: {
        id: selectedResponsible.id,
        name: selectedResponsible.name,
        email: selectedResponsible.email,
        department: selectedResponsible.department
      },
      associatedRequirements: [],
      lastReviewDate: now,
      nextReviewDate: nextYearDate.toISOString(),
      createdAt: now,
      updatedAt: now
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

  const handleViewApplication = (application: Application) => {
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
      initialSelected[req.id] = selectedApplication.associatedRequirements.includes(req.id);
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
      associatedRequirements: selectedReqIds
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
      status: 'under-review' as Application['status']
    };

    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === selectedApplication.id ? updatedApplication : app
      )
    );
    setSelectedApplication(updatedApplication);
    console.log(`Review scheduled`);
  };

  const getStatusBadge = (status: Application['status']) => {
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

  const getCriticalityBadge = (criticality: Application['criticality']) => {
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
                <p className="font-medium">{selectedApplication.contact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.contact.title || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p>{selectedApplication.contact.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                <p>{selectedApplication.contact.phone || 'N/A'}</p>
              </div>
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Internal Responsible</h3>
                <p className="font-medium">{selectedApplication.internalResponsible.name}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.internalResponsible.department || 'N/A'}</p>
                <p className="text-sm">{selectedApplication.internalResponsible.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Requirements</CardTitle>
            <CardDescription>
              Security and compliance requirements for this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedApplication.associatedRequirements.length === 0 ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.associatedRequirements.map(reqId => {
                    const req = requirements.find(r => r.id === reqId);
                    if (!req) return null;
                    
                    return (
                      <Card key={req.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-md">{req.section} {req.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                          <div className="mt-3 flex justify-between items-center">
                            <Badge 
                              variant={req.status === 'fulfilled' ? 'default' : 'outline'}
                              className={
                                req.status === 'fulfilled' ? 'bg-green-500' : 
                                req.status === 'partially-fulfilled' ? 'text-yellow-500 border-yellow-500' : 
                                'text-red-500 border-red-500'
                              }
                            >
                              {req.status.replace('-', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {req.lastAssessmentDate ? `Last assessed: ${formatDate(req.lastAssessmentDate)}` : 'Not assessed yet'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationStats.total}</div>
            <div className="flex gap-3 mt-2">
              <div className="text-sm">
                <span className="text-green-500 font-medium">{applicationStats.active}</span> Active
              </div>
              <div className="text-sm">
                <span className="text-amber-500 font-medium">{applicationStats.underReview}</span> Under Review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="text-sm">
                <span className="text-red-500 font-bold">{applicationStats.critical}</span> Critical
              </div>
              <div className="text-sm">
                <span className="text-orange-500 font-medium">{applicationStats.highRisk}</span> High Risk
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${(applicationStats.critical / applicationStats.total) * 100}%` }} 
                />
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: `${(applicationStats.highRisk / applicationStats.total) * 100}%` }} 
                />
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: `${((applicationStats.total - applicationStats.critical - applicationStats.highRisk) / applicationStats.total) * 100}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <span>{applicationStats.reviewDue}</span>
              <span className="text-base ml-2 font-normal text-muted-foreground">Due Soon</span>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">Applications requiring review in the next 3 months</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select 
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as Application['status'] | "all")}
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
              value={criticalityFilter}
              onValueChange={(value) => setCriticalityFilter(value as Application['criticality'] | "all")}
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
          </div>
        </div>

        <div className="ml-4">
          <Dialog open={isAddApplicationOpen} onOpenChange={setIsAddApplicationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
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
                      Person <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={newApplication.internalResponsibleId} 
                      onValueChange={(value) => handleSelectChange('internalResponsibleId', value)}
                    >
                      <SelectTrigger id="internalResponsible" className="col-span-3">
                        <SelectValue placeholder="Select responsible person" />
                      </SelectTrigger>
                      <SelectContent>
                        {internalUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
      </div>
      
      {filteredApplications.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
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
              {filteredApplications.map((application) => (
                <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewApplication(application)}>
                  <TableCell className="font-medium">{application.name}</TableCell>
                  <TableCell>{application.type || 'N/A'}</TableCell>
                  <TableCell>{getCriticalityBadge(application.criticality)}</TableCell>
                  <TableCell>{application.internalResponsible.name}</TableCell>
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
      ) : (
        <div className="text-center py-12 border rounded-lg bg-background">
          <Laptop className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery || statusFilter !== "all" || criticalityFilter !== "all" ? 
              "Try adjusting your search or filters" : 
              "Add your first application to get started"}
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
    </div>
  );
};

export default Applications; 