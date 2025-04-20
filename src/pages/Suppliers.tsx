import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Mail, Building, User, X, Check, AlertTriangle, FileEdit, Trash2, Shield, CheckSquare, ExternalLink, FileText, FileDown } from "lucide-react";
import { suppliers as initialSuppliers, internalUsers, standards, requirements } from "@/data/mockData";
import { InternalUser, Supplier, SupplierStandard, Requirement, Standard, RequirementStatus } from "@/types";
import { toast } from "@/utils/toast";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SupplierReviewReport } from "@/components/suppliers/SupplierReviewReport";
import { cn } from "@/lib/utils";

// Define the EmailData interface
interface EmailData {
  to: string;
  subject: string;
  message: string;
  includeRequirements: boolean;
  standardIds: string[];
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Supplier['status'] | "all">("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [isSendRequirementsOpen, setIsSendRequirementsOpen] = useState(false);
  const [isReportPreviewVisible, setIsReportPreviewVisible] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // New supplier form state
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    organizationNumber: '',
    address: '',
    website: '',
    category: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    internalResponsibleId: ''
  });
  
  // Standard and requirements selection state - updated to support multiple standards
  const [selectedStandardIds, setSelectedStandardIds] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<Record<string, boolean>>({});
  const [activeStandardId, setActiveStandardId] = useState<string>('');
  
  // Get filtered suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.organizationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setSuppliers(initialSuppliers);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResponsibleChange = (value: string) => {
    setNewSupplier(prev => ({
      ...prev,
      internalResponsibleId: value
    }));
  };

  const handleAddSupplier = () => {
    // Validate form
    if (!newSupplier.name || !newSupplier.organizationNumber || 
        !newSupplier.contactName || !newSupplier.contactEmail || 
        !newSupplier.internalResponsibleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new supplier
    const selectedResponsible = internalUsers.find(user => user.id === newSupplier.internalResponsibleId);
    if (!selectedResponsible) {
      toast.error("Please select a valid internal responsible person");
      return;
    }

    const now = new Date().toISOString();
    const newId = `supplier-${suppliers.length + 1}`;
    
    const createdSupplier: Supplier = {
      id: newId,
      name: newSupplier.name,
      organizationNumber: newSupplier.organizationNumber,
      address: newSupplier.address,
      website: newSupplier.website,
      category: newSupplier.category,
      status: 'active',
      contact: {
        name: newSupplier.contactName,
        email: newSupplier.contactEmail,
        phone: newSupplier.contactPhone,
        title: newSupplier.contactTitle
      },
      internalResponsible: {
        id: selectedResponsible.id,
        name: selectedResponsible.name,
        email: selectedResponsible.email,
        department: selectedResponsible.department
      },
      associatedStandards: [],
      createdAt: now,
      updatedAt: now
    };

    // Add to suppliers
    setSuppliers(prev => [...prev, createdSupplier]);
    
    // Reset form and close dialog
    setNewSupplier({
      name: '',
      organizationNumber: '',
      address: '',
      website: '',
      category: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactTitle: '',
      internalResponsibleId: ''
    });
    
    setIsAddSupplierOpen(false);
    toast.success("Supplier added successfully");
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleBackToSuppliers = () => {
    setSelectedSupplier(null);
  };

  const handleOpenStandardsDialog = () => {
    if (!selectedSupplier) return;
    
    // Get all standard IDs that the supplier already has
    const existingStandardIds = selectedSupplier.associatedStandards.map(s => s.standardId);
    setSelectedStandardIds(existingStandardIds);
    
    // Set the first standard as active, or first available if none exist
    const firstStandardId = existingStandardIds.length > 0 ? 
      existingStandardIds[0] : 
      standards[0]?.id || '';
    
    setActiveStandardId(firstStandardId);
    
    // Initialize selected requirements with all requirements pre-selected
    const initialSelected: Record<string, boolean> = {};
    
    // For each standard, pre-select all requirements
    standards.forEach(standard => {
      const standardRequirements = requirements.filter(req => req.standardId === standard.id);
      const existingStandard = selectedSupplier.associatedStandards.find(s => s.standardId === standard.id);
      
      standardRequirements.forEach(req => {
        // If the supplier already has this standard, use existing selections
        // Otherwise, pre-select all requirements
        initialSelected[req.id] = existingStandard ? 
          existingStandard.requirementIds.includes(req.id) : true;
      });
    });
    
    setSelectedRequirements(initialSelected);
    setIsStandardsOpen(true);
  };

  const handleStandardSelection = (standardId: string, checked: boolean) => {
    setSelectedStandardIds(prev => {
      if (checked) {
        // Add this standard to the list of selected standards
        const newSelected = [...prev, standardId];
        // If this is the first standard being selected, make it active
        if (prev.length === 0) {
          setActiveStandardId(standardId);
        }
        return newSelected;
      } else {
        // Remove this standard from the list
        const newSelected = prev.filter(id => id !== standardId);
        // If the active standard is being removed, select another one
        if (activeStandardId === standardId && newSelected.length > 0) {
          setActiveStandardId(newSelected[0]);
        }
        return newSelected;
      }
    });
    
    // If adding a new standard, pre-select all its requirements
    if (checked) {
      const standardRequirements = requirements.filter(req => req.standardId === standardId);
      const newSelections = { ...selectedRequirements };
      
      standardRequirements.forEach(req => {
        newSelections[req.id] = true;
      });
      
      setSelectedRequirements(newSelections);
      toast.success(`Added ${standardRequirements.length} requirements from ${getStandardName(standardId)}`);
    } else {
      // Remove all requirements for this standard
      const standardRequirements = requirements.filter(req => req.standardId === standardId);
      const newSelections = { ...selectedRequirements };
      
      standardRequirements.forEach(req => {
        delete newSelections[req.id];
      });
      
      setSelectedRequirements(newSelections);
      toast.info(`Removed requirements from ${getStandardName(standardId)}`);
    }

    // Show live preview for selected standards
    setIsReportPreviewVisible(true);
  };

  const handleSetActiveStandard = (standardId: string) => {
    setActiveStandardId(standardId);
  };

  const handleRequirementChange = (requirementId: string, checked: boolean) => {
    setSelectedRequirements(prev => ({
      ...prev,
      [requirementId]: checked
    }));
    
    // Show live preview for selected standards
    setIsReportPreviewVisible(true);
    
    // Calculate and show immediate feedback
    const standardId = requirements.find(req => req.id === requirementId)?.standardId;
    if (standardId) {
      const standardRequirements = requirements.filter(req => req.standardId === standardId);
      const selectedCount = standardRequirements.filter(req => selectedRequirements[req.id]).length;
      const totalCount = standardRequirements.length;
      const percentage = Math.round((selectedCount / totalCount) * 100);
      
      toast.info(`Selected ${selectedCount} of ${totalCount} requirements (${percentage}%) for ${getStandardName(standardId)}`);
    }
  };

  const handleSaveStandards = () => {
    if (selectedStandardIds.length === 0) {
      toast.error('Please select at least one standard');
      return;
    }

    // Make sure we have at least one requirement selected
    const hasSelectedRequirements = selectedStandardIds.some(stdId => {
      return requirements
        .filter(req => req.standardId === stdId)
        .some(req => selectedRequirements[req.id]);
    });

    if (!hasSelectedRequirements) {
      toast.error('Please select at least one requirement');
      return;
    }
    
    console.log('Standards selected for compliance assessment:', selectedStandardIds);
    console.log('Requirements selected:', Object.keys(selectedRequirements).filter(id => selectedRequirements[id]).length);
    
    // Convert the selected requirements to the format needed for supplier
    const updatedStandards = selectedStandardIds.map(stdId => {
      const requirementIds = Object.entries(selectedRequirements)
        .filter(([_, isSelected]) => isSelected)
        .map(([reqId]) => reqId)
        .filter(reqId => 
          requirements.find(req => req.id === reqId && req.standardId === stdId)
        );
        
      return {
        standardId: stdId,
        requirementIds,
        status: 'draft' as const,
        sentDate: selectedSupplier.associatedStandards.find(s => s.standardId === stdId)?.sentDate
      };
    }).filter(std => std.requirementIds.length > 0);
    
    // Check if we have any standards with requirements
    if (updatedStandards.length === 0) {
      toast.error('No standards with requirements selected');
      return;
    }
    
    // Update the supplier with the new standards
    const updatedSupplier = {
      ...selectedSupplier,
      associatedStandards: updatedStandards
    };
    
    // Update the supplier in the mock data store
    setSuppliers(suppliers.map(s => 
      s.id === selectedSupplier.id ? updatedSupplier : s
    ));
    
    // Update the selected supplier with the new standards
    setSelectedSupplier(updatedSupplier);
    
    // Close the standards dialog
    setIsStandardsOpen(false);
    toast.success('Standards and requirements saved successfully');
    
    // Immediately open the review dialog with the first standard for PDF generation
    console.log('Opening supplier review for PDF generation');
    
    // Short delay to ensure state updates have propagated
    setTimeout(() => {
      if (updatedStandards.length > 0) {
        const firstStandardId = updatedStandards[0].standardId;
        handleSupplierReview(firstStandardId);
      }
    }, 100);
  };

  const handleOpenSendRequirementsDialog = (standardId: string) => {
    if (!selectedSupplier) return;
    setSelectedStandardIds([standardId]);
    setActiveStandardId(standardId);
    setIsReportPreviewVisible(true);
  };

  const handleSendRequirements = () => {
    if (!selectedSupplier || !activeStandardId) return;

    // Find the standard
    const standardIndex = selectedSupplier.associatedStandards
      .findIndex(s => s.standardId === activeStandardId);
    
    if (standardIndex === -1) return;
    
    // Update the standard's status and sent date
    const updatedSupplier = { ...selectedSupplier };
    updatedSupplier.associatedStandards[standardIndex] = {
      ...updatedSupplier.associatedStandards[standardIndex],
      sentDate: new Date().toISOString(),
      status: 'sent'
    };
    
    // Update supplier
    setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    setSelectedSupplier(updatedSupplier);
    setIsReportPreviewVisible(false);
    setIsSendRequirementsOpen(false);
    toast.success(`Requirements sent to ${selectedSupplier.contact.name} at ${selectedSupplier.contact.email}`);
  };

  const handleSupplierReview = (standardId?: string) => {
    if (!selectedSupplier) return;

    console.log(`Opening supplier review for PDF generation`);
    
    // Set which standards to use (all or just one)
    let standardsToUse: string[] = [];
    if (standardId) {
      // Use just the specific standard
      standardsToUse = [standardId];
      console.log(`Using specific standard: ${standardId}`);
    } else {
      // Use all supplier standards
      standardsToUse = selectedSupplier.associatedStandards.map(s => s.standardId);
      console.log(`Using all supplier standards: ${standardsToUse.join(', ')}`);
    }
    
    if (standardsToUse.length === 0) {
      toast.error('No standards selected for review');
      return;
    }
    
    // Update the selected standards
    setSelectedStandardIds(standardsToUse);
    
    // Set the first one as active
    if (standardsToUse.length > 0) {
      setActiveStandardId(standardsToUse[0]);
    }
    
    // IMPORTANT: Mark ALL requirements for the selected standards as selected
    const requirementsForStandards = requirements.filter(req => 
      standardsToUse.includes(req.standardId)
    );
    
    console.log(`Found ${requirementsForStandards.length} requirements for selected standards`);
    
    const newSelectedReqs: Record<string, boolean> = {};
    requirementsForStandards.forEach(req => {
      newSelectedReqs[req.id] = true;
    });
    
    setSelectedRequirements(newSelectedReqs);
    
    // Open the review dialog to show the PDF
    setIsReviewOpen(true);
  };

  const handleSendRequirementsEmail = (emailData: EmailData) => {
    const supplierStandard = selectedSupplier.associatedStandards.find(
      s => emailData.standardIds.includes(s.standardId)
    );
    
    if (supplierStandard) {
      // Update the supplier with the sent date
      const updatedStandards = selectedSupplier.associatedStandards.map(std => 
        emailData.standardIds.includes(std.standardId) 
          ? { ...std, sentDate: new Date().toISOString() }
          : std
      );
      
      const updatedSupplier = {
        ...selectedSupplier,
        associatedStandards: updatedStandards
      };
      
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(s => 
          s.id === selectedSupplier.id ? updatedSupplier : s
        )
      );
      
      setSelectedSupplier(updatedSupplier);
    }
  };

  const getStandardName = (standardId: string): string => {
    const standard = standards.find(s => s.id === standardId);
    return standard ? standard.name : standardId;
  };

  const getStatusBadge = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'pending-review':
        return <Badge variant="secondary" className="bg-amber-500">Pending Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRequirementStatus = (status: SupplierStandard['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-500">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Add this function to directly export PDF without opening the review dialog
  const handleDirectPDFExport = (standardId: string) => {
    if (!selectedSupplier) return;
    
    console.log(`Directly exporting PDF for standard: ${standardId}`);
    
    // Create a temporary div to render the report
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Render the SupplierReviewReport component directly to the DOM for PDF export
    const supplier = selectedSupplier;
    const standard = standards.find(s => s.id === standardId);
    
    if (!standard) {
      toast.error(`Standard not found: ${standardId}`);
      document.body.removeChild(tempDiv);
      return;
    }
    
    // Show loading toast
    toast.info(`Preparing PDF export for ${standard.name}...`);
    
    // Set up temporary element with the SupplierReviewReport component
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      root.render(
        <SupplierReviewReport
          supplier={supplier}
          standards={standards}
          requirements={requirements}
          internalUser={supplier.internalResponsible}
          selectedStandardIds={[standardId]}
          onClose={() => {}}
          previewMode={true}
          directExport={{
            standardId: standardId,
            onComplete: () => {
              // Clean up
              setTimeout(() => {
                root.unmount();
                document.body.removeChild(tempDiv);
              }, 2000);
            }
          }}
        />
      );
    }).catch(error => {
      console.error('Error loading react-dom:', error);
      document.body.removeChild(tempDiv);
      toast.error('Failed to generate PDF');
    });
  };

  // If a supplier is selected, show detailed view
  if (selectedSupplier) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBackToSuppliers}>
              <X className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Supplier Details</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenStandardsDialog}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Requirements
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {selectedSupplier.name}
                  </CardTitle>
                  <CardDescription>
                    Organization Number: {selectedSupplier.organizationNumber}
                  </CardDescription>
                </div>
                {getStatusBadge(selectedSupplier.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p>{selectedSupplier.category || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                  {selectedSupplier.website ? (
                    <a 
                      href={selectedSupplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {selectedSupplier.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                  <p>{selectedSupplier.address || 'N/A'}</p>
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
                <p className="font-medium">{selectedSupplier.contact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSupplier.contact.title || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p>{selectedSupplier.contact.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                <p>{selectedSupplier.contact.phone || 'N/A'}</p>
              </div>
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Internal Responsible</h3>
                <p className="font-medium">{selectedSupplier.internalResponsible.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSupplier.internalResponsible.department || 'N/A'}</p>
                <p className="text-sm">{selectedSupplier.internalResponsible.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Standards & Requirements</CardTitle>
            <CardDescription>
              Manage compliance requirements for this supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSupplier.associatedStandards.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium">No standards assigned</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Assign standards and requirements to this supplier
                </p>
                <Button onClick={handleOpenStandardsDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Standards
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard</TableHead>
                        <TableHead>Requirements</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSupplier.associatedStandards.map(standard => (
                        <TableRow key={standard.standardId}>
                          <TableCell className="font-medium">
                            {getStandardName(standard.standardId)}
                          </TableCell>
                          <TableCell>{standard.requirementIds.length} requirements</TableCell>
                          <TableCell>{getRequirementStatus(standard.status)}</TableCell>
                          <TableCell>
                            {standard.sentDate ? 
                              new Date(standard.sentDate).toLocaleDateString() : 
                              'Not sent yet'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDirectPDFExport(standard.standardId)}
                                disabled={standard.requirementIds.length === 0}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export PDF</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  handleSupplierReview(standard.standardId);
                                }}
                                disabled={standard.requirementIds.length === 0}
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              >
                                <FileDown className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export PDF</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenSendRequirementsDialog(standard.standardId)}
                                disabled={standard.requirementIds.length === 0}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Send</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleOpenStandardsDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Supplier Review
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replace the old Manage Standards/Requirements Dialog */}
        <Dialog open={isStandardsOpen} onOpenChange={setIsStandardsOpen}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Supplier Review</DialogTitle>
              <DialogDescription>
                Select standards and requirements applicable to this supplier.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col md:flex-row gap-6 mt-4 flex-1 overflow-hidden">
              {/* Left side: Standards and requirements selection */}
              <div className="w-full md:w-1/2 space-y-6 overflow-y-auto pr-2">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Select Standards</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {standards.map(standard => (
                      <div key={standard.id} className="flex items-start gap-2 p-2 border rounded-md hover:bg-muted/30 transition-colors">
                        <Checkbox 
                          id={`standard-${standard.id}`}
                          checked={selectedStandardIds.includes(standard.id)}
                          onCheckedChange={(checked) => 
                            handleStandardSelection(standard.id, !!checked)
                          }
                        />
                        <div className="grid gap-1 leading-none">
                          <Label htmlFor={`standard-${standard.id}`} className="font-medium">
                            {standard.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {standard.description.length > 100 
                              ? `${standard.description.substring(0, 100)}...` 
                              : standard.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedStandardIds.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Requirements</h3>
                    
                    <Tabs 
                      value={activeStandardId} 
                      onValueChange={handleSetActiveStandard}
                      className="w-full"
                    >
                      <TabsList className="mb-4 w-full justify-start overflow-auto">
                        {selectedStandardIds.map(id => (
                          <TabsTrigger key={id} value={id} className="min-w-max">
                            {getStandardName(id)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {selectedStandardIds.map(standardId => (
                        <TabsContent key={standardId} value={standardId} className="mt-0">
                          <div className="flex justify-between mb-3">
                            <p className="text-sm text-muted-foreground">
                              Select requirements for {getStandardName(standardId)}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Select all requirements for this standard
                                  const standardRequirements = requirements.filter(req => req.standardId === standardId);
                                  const newSelections = { ...selectedRequirements };
                                  
                                  standardRequirements.forEach(req => {
                                    newSelections[req.id] = true;
                                  });
                                  
                                  setSelectedRequirements(newSelections);
                                }}
                              >
                                Select All
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Deselect all requirements for this standard
                                  const standardRequirements = requirements.filter(req => req.standardId === standardId);
                                  const newSelections = { ...selectedRequirements };
                                  
                                  standardRequirements.forEach(req => {
                                    newSelections[req.id] = false;
                                  });
                                  
                                  setSelectedRequirements(newSelections);
                                }}
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {requirements
                                .filter(req => req.standardId === standardId)
                                .map(requirement => (
                                  <div 
                                    key={requirement.id} 
                                    className={cn(
                                      "flex items-start gap-2 border p-3 rounded-md transition-colors",
                                      selectedRequirements[requirement.id] 
                                        ? "bg-primary/5 border-primary/20" 
                                        : "hover:bg-muted/30"
                                    )}
                                  >
                                    <Checkbox 
                                      id={`req-${requirement.id}`}
                                      checked={selectedRequirements[requirement.id] || false}
                                      onCheckedChange={(checked) => {
                                        handleRequirementChange(requirement.id, !!checked);
                                      }}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                      <Label 
                                        htmlFor={`req-${requirement.id}`} 
                                        className={cn(
                                          "font-medium",
                                          selectedRequirements[requirement.id] && "text-primary"
                                        )}
                                      >
                                        {requirement.section} {requirement.name}
                                      </Label>
                                      <p className="text-sm text-muted-foreground">{requirement.description}</p>
                                      {requirement.guidance && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          <span className="font-medium">Guidance:</span> {requirement.guidance}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
              
              {/* Right side: Live preview of the standards/requirements */}
              <div className="w-full md:w-1/2 border rounded-md">
                {(isReportPreviewVisible && selectedStandardIds.length > 0) ? (
                  <div className="h-full overflow-hidden flex flex-col">
                    <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
                      <h3 className="text-sm font-medium">Live Preview</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => setIsReportPreviewVisible(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="overflow-y-auto p-4 flex-1">
                      {/* Preview integration for standards dialog */}
                      {(() => {
                        // Create a map of the selected requirements
                        const selectedReqsMap = selectedRequirements || {};
                        
                        // Only show requirements that are selected
                        const tempStandards = selectedStandardIds.map(stdId => {
                          // Get all requirements for this standard that are selected
                          const requirementsForStandard = requirements
                            .filter(req => req.standardId === stdId && selectedReqsMap[req.id])
                            .map(req => req.id);
                          
                          // Log the selected requirements per standard
                          console.log(`Preview: Standard ${stdId} has ${requirementsForStandard.length} selected requirements`);
                          
                          return {
                            standardId: stdId,
                            requirementIds: requirementsForStandard,
                            status: 'draft' as const,
                            sentDate: undefined as string | undefined
                          };
                        }).filter(std => std.requirementIds.length > 0);
                        
                        // Log the preview data
                        console.log('Preview supplier data:', {
                          totalStandards: tempStandards.length,
                          totalRequirements: tempStandards.reduce((count, std) => count + std.requirementIds.length, 0),
                          standardIds: tempStandards.map(std => std.standardId)
                        });
                        
                        // Create a temporary supplier with only the currently selected standards/requirements
                        const previewSupplier = {
                          ...selectedSupplier,
                          associatedStandards: tempStandards
                        } as Supplier;

                        console.log('Rendering supplier preview with:', {
                          standardsCount: tempStandards.length,
                          requirementsCount: tempStandards.reduce((count, std) => count + std.requirementIds.length, 0),
                          activeStandard: activeStandardId
                        });

                        return tempStandards.length > 0 ? (
                          <div className="scale-[0.85] origin-top-left h-[118%] overflow-hidden supplier-preview-wrapper">
                            <SupplierReviewReport
                              supplier={previewSupplier}
                              standards={standards}
                              requirements={requirements}
                              internalUser={selectedSupplier.internalResponsible}
                              selectedStandardIds={selectedStandardIds}
                              onClose={() => {}}
                              previewMode={true}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                            <h3 className="text-base font-medium">No requirements selected</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Select standards and requirements to see a preview of what will be sent to the supplier.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-base font-medium">Live Preview</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Select standards and requirements on the left to see a live preview of what will be sent to the supplier.
                    </p>
                    {selectedStandardIds.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsReportPreviewVisible(true)}
                      >
                        Show Preview
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setIsStandardsOpen(false)}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsReportPreviewVisible(true);
                    }}
                    disabled={selectedStandardIds.length === 0}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Toggle Preview
                  </Button>
                  <Button 
                    onClick={handleSaveStandards}
                    disabled={selectedStandardIds.length === 0}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save and Generate PDF
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Supplier Review Report */}
        {isReviewOpen && selectedSupplier && (
          <SupplierReviewReport
            supplier={selectedSupplier}
            standards={standards}
            requirements={requirements}
            internalUser={selectedSupplier.internalResponsible}
            selectedStandardIds={selectedStandardIds}
            onClose={() => setIsReviewOpen(false)}
            onSend={handleSendRequirementsEmail}
          />
        )}
      </div>
    );
  }

  // Main suppliers list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <div className="flex gap-2">
          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter the details of the supplier you want to add to your compliance program.
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
                    value={newSupplier.name}
                    onChange={handleInputChange}
                    placeholder="Supplier name"
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="organizationNumber" className="text-right">
                    Org. Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationNumber"
                    name="organizationNumber"
                    value={newSupplier.organizationNumber}
                    onChange={handleInputChange}
                    placeholder="Organization identification number"
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={newSupplier.category}
                    onChange={handleInputChange}
                    placeholder="E.g. Cloud Services, Hardware, Consulting"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="website" className="text-right">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={newSupplier.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleInputChange}
                    placeholder="Full postal address"
                    className="col-span-3"
                  />
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
                      value={newSupplier.contactName}
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
                      value={newSupplier.contactEmail}
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
                      value={newSupplier.contactPhone}
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
                      value={newSupplier.contactTitle}
                      onChange={handleInputChange}
                      placeholder="E.g. Account Manager"
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
                      value={newSupplier.internalResponsibleId} 
                      onValueChange={handleResponsibleChange}
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
                <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier}>
                  Add Supplier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Supplier['status'] | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending-review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Supplier Management</h2>
        <p className="text-muted-foreground">
          Manage your suppliers and track their compliance with your security requirements.
        </p>
      </div>
      
      {filteredSuppliers.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Internal Responsible</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewSupplier(supplier)}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.category || 'N/A'}</TableCell>
                  <TableCell>{supplier.contact.name}</TableCell>
                  <TableCell>{supplier.internalResponsible.name}</TableCell>
                  <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleViewSupplier(supplier);
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
          <Building className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium">No suppliers found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery || statusFilter !== "all" ? 
              "Try adjusting your search or filters" : 
              "Add your first supplier to get started"}
          </p>
          {searchQuery || statusFilter !== "all" ? (
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => setIsAddSupplierOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Suppliers; 