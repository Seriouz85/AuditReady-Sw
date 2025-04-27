import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardCard } from "@/components/standards/StandardCard";
import { StandardsLibrary } from "@/components/standards/StandardsLibrary";
import { standards, requirements } from "@/data/mockData";
import { Standard, StandardType } from "@/types";
import { Plus, Search, Filter, FileUp, ClipboardCheck, Download, Library } from "lucide-react";
import { toast } from "@/utils/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStandardForm } from "@/components/standards/CreateStandardForm";
import { useNavigate } from "react-router-dom";
import { useStandards } from "@/hooks/useStandards";
import { useRequirements } from "@/hooks/useRequirements";
import SoAPreview from '@/components/soa/SoAPreview';

// Define the complete library of available standards
const standardsLibrary: Standard[] = [
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Information Security Management System standard that provides requirements for an information security management system.',
    category: 'Information Security',
    requirements: [
      'iso-27001-4.1', 'iso-27001-4.2', 'iso-27001-4.3', 'iso-27001-4.4',
      'iso-27001-5.1', 'iso-27001-5.2', 'iso-27001-5.3',
      'iso-27001-6.1.1', 'iso-27001-6.1.2', 'iso-27001-6.1.3', 'iso-27001-6.2', 'iso-27001-6.3',
      'iso-27001-7.1', 'iso-27001-7.2', 'iso-27001-7.3', 'iso-27001-7.4', 'iso-27001-7.5.1', 'iso-27001-7.5.2', 'iso-27001-7.5.3',
      'iso-27001-8.1', 'iso-27001-8.2', 'iso-27001-8.3',
      'iso-27001-9.1', 'iso-27001-9.2.1', 'iso-27001-9.2.2', 'iso-27001-9.3.1', 'iso-27001-9.3.2', 'iso-27001-9.3.3',
      'iso-27001-10.1', 'iso-27001-10.2'
    ],
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-03-10T12:00:00Z',
  },
  {
    id: 'iso-27002-2022',
    name: 'ISO 27002:2022',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Code of practice for information security controls that provides guidance on implementing information security controls.',
    category: 'Information Security',
    requirements: [
      // A.5 Organizational controls (37)
      'iso-27002-A5.1', 'iso-27002-A5.2', 'iso-27002-A5.3', 'iso-27002-A5.4', 'iso-27002-A5.5', 'iso-27002-A5.6', 
      'iso-27002-A5.7', 'iso-27002-A5.8', 'iso-27002-A5.9', 'iso-27002-A5.10', 'iso-27002-A5.11', 'iso-27002-A5.12', 
      'iso-27002-A5.13', 'iso-27002-A5.14', 'iso-27002-A5.15', 'iso-27002-A5.16', 'iso-27002-A5.17', 'iso-27002-A5.18', 
      'iso-27002-A5.19', 'iso-27002-A5.20', 'iso-27002-A5.21', 'iso-27002-A5.22', 'iso-27002-A5.23', 'iso-27002-A5.24', 
      'iso-27002-A5.25', 'iso-27002-A5.26', 'iso-27002-A5.27', 'iso-27002-A5.28', 'iso-27002-A5.29', 'iso-27002-A5.30', 
      'iso-27002-A5.31', 'iso-27002-A5.32', 'iso-27002-A5.33', 'iso-27002-A5.34', 'iso-27002-A5.35', 'iso-27002-A5.36', 
      'iso-27002-A5.37',
      // A.6 People controls (8)
      'iso-27002-A6.1', 'iso-27002-A6.2', 'iso-27002-A6.3', 'iso-27002-A6.4', 'iso-27002-A6.5', 'iso-27002-A6.6', 
      'iso-27002-A6.7', 'iso-27002-A6.8',
      // A.7 Physical controls (14)
      'iso-27002-A7.1', 'iso-27002-A7.2', 'iso-27002-A7.3', 'iso-27002-A7.4', 'iso-27002-A7.5', 'iso-27002-A7.6', 
      'iso-27002-A7.7', 'iso-27002-A7.8', 'iso-27002-A7.9', 'iso-27002-A7.10', 'iso-27002-A7.11', 'iso-27002-A7.12', 
      'iso-27002-A7.13', 'iso-27002-A7.14',
      // A.8 Technological controls (34)
      'iso-27002-A8.1', 'iso-27002-A8.2', 'iso-27002-A8.3', 'iso-27002-A8.4', 'iso-27002-A8.5', 'iso-27002-A8.6', 
      'iso-27002-A8.7', 'iso-27002-A8.8', 'iso-27002-A8.9', 'iso-27002-A8.10', 'iso-27002-A8.11', 'iso-27002-A8.12', 
      'iso-27002-A8.13', 'iso-27002-A8.14', 'iso-27002-A8.15', 'iso-27002-A8.16', 'iso-27002-A8.17', 'iso-27002-A8.18', 
      'iso-27002-A8.19', 'iso-27002-A8.20', 'iso-27002-A8.21', 'iso-27002-A8.22', 'iso-27002-A8.23', 'iso-27002-A8.24', 
      'iso-27002-A8.25', 'iso-27002-A8.26', 'iso-27002-A8.27', 'iso-27002-A8.28', 'iso-27002-A8.29', 'iso-27002-A8.30', 
      'iso-27002-A8.31', 'iso-27002-A8.32', 'iso-27002-A8.33', 'iso-27002-A8.34'
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2',
    name: 'NIS2 Directive',
    version: '2022',
    type: 'regulation' as StandardType,
    description: 'EU directive on measures for a high common level of cybersecurity across the Union.',
    category: 'Network Security',
    requirements: [
      'nis2-A1', 'nis2-A2', 'nis2-A3', 'nis2-A4', 'nis2-A5', 
      'nis2-B1', 'nis2-B2', 'nis2-B3', 'nis2-B4', 
      'nis2-C1', 'nis2-C2', 'nis2-C3'
    ],
    createdAt: '2024-03-12T14:30:00Z',
    updatedAt: '2024-03-12T14:30:00Z',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    version: '2018',
    type: 'regulation' as StandardType,
    description: 'General Data Protection Regulation for data protection and privacy in the EU.',
    category: 'Data Protection',
    requirements: [
      'gdpr-A1', 'gdpr-A2', 'gdpr-A3', 'gdpr-A4', 'gdpr-A5', 'gdpr-A6',
      'gdpr-B1', 'gdpr-B2', 'gdpr-B3', 'gdpr-B4', 'gdpr-B5',
      'gdpr-C1', 'gdpr-C2', 'gdpr-C3', 'gdpr-C4'
    ],
    createdAt: '2024-03-15T09:20:00Z',
    updatedAt: '2024-03-15T09:20:00Z',
  },
  {
    id: 'nist-csf-2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    version: '2.0',
    type: 'framework' as StandardType,
    description: 'A voluntary framework consisting of standards, guidelines, and best practices to manage cybersecurity-related risk.',
    category: 'Cybersecurity',
    requirements: [
      'nist-csf-GV.1', 'nist-csf-GV.2', 'nist-csf-GV.3', 'nist-csf-GV.4', 'nist-csf-GV.5',
      'nist-csf-ID.1', 'nist-csf-ID.2', 'nist-csf-ID.3', 'nist-csf-ID.4', 'nist-csf-ID.5',
      'nist-csf-PR.1', 'nist-csf-PR.2', 'nist-csf-PR.3', 'nist-csf-PR.4', 'nist-csf-PR.5',
      'nist-csf-DE.1', 'nist-csf-DE.2', 'nist-csf-DE.3', 'nist-csf-DE.4', 'nist-csf-DE.5',
      'nist-csf-RS.1', 'nist-csf-RS.2', 'nist-csf-RS.3', 'nist-csf-RS.4', 'nist-csf-RS.5',
      'nist-csf-RC.1', 'nist-csf-RC.2', 'nist-csf-RC.3', 'nist-csf-RC.4', 'nist-csf-RC.5'
    ],
    createdAt: '2024-02-26T00:00:00Z',
    updatedAt: '2024-02-26T00:00:00Z',
  },
  {
    id: 'iso-27005-2022',
    name: 'ISO/IEC 27005:2022',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Information security risk management standard that provides guidelines for information security risk management.',
    category: 'Risk Management',
    requirements: [
      'iso-27005-4.1', 'iso-27005-4.2', 'iso-27005-4.3', 'iso-27005-4.4',
      'iso-27005-5.1', 'iso-27005-5.2', 'iso-27005-5.3', 'iso-27005-5.4',
      'iso-27005-6.1', 'iso-27005-6.2', 'iso-27005-6.3', 'iso-27005-6.4',
      'iso-27005-7.1', 'iso-27005-7.2', 'iso-27005-7.3', 'iso-27005-7.4',
      'iso-27005-8.1', 'iso-27005-8.2', 'iso-27005-8.3', 'iso-27005-8.4'
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  }
];

const Standards = () => {
  const navigate = useNavigate();
  const { standards: standardsData, loading: standardsLoading } = useStandards();
  const { requirements: requirementsData, loading: requirementsLoading } = useRequirements();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [localStandards, setLocalStandards] = useState<Standard[]>(() => {
    const savedStandards = localStorage.getItem('standards');
    if (savedStandards) {
      return JSON.parse(savedStandards);
    }
    // If no saved standards, initialize with all standards except NIST CSF and ISO 27005
    const initialStandards = standardsLibrary.filter(std => 
      std.id !== 'nist-csf-2.0' && 
      std.id !== 'iso-27005-2022'
    );
    localStorage.setItem('standards', JSON.stringify(initialStandards));
    return initialStandards;
  });
  const [applicableStandards, setApplicableStandards] = useState<Record<string, boolean>>(() => {
    const savedApplicability = localStorage.getItem('applicableStandards');
    if (savedApplicability) {
      return JSON.parse(savedApplicability);
    }
    // If no saved applicability, initialize with all pre-added standards marked as applicable
    const initialApplicability: Record<string, boolean> = {};
    localStandards.forEach(standard => {
      initialApplicability[standard.id] = true;
    });
    localStorage.setItem('applicableStandards', JSON.stringify(initialApplicability));
    return initialApplicability;
  });
  const [isSOADialogOpen, setIsSOADialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLibraryStandards, setSelectedLibraryStandards] = useState<Record<string, boolean>>({});
  const soaRef = useRef(null);

  // Update localStorage when standards change
  useEffect(() => {
    localStorage.setItem('standards', JSON.stringify(localStandards));
  }, [localStandards]);

  // Update localStorage when applicability changes
  useEffect(() => {
    localStorage.setItem('applicableStandards', JSON.stringify(applicableStandards));
  }, [applicableStandards]);

  const getRequirementCount = (standardId: string) => {
    const standard = localStandards.find(std => std.id === standardId);
    return standard ? standard.requirements.length : 0;
  };

  const handleApplicabilityChange = (standardId: string, isApplicable: boolean) => {
    setApplicableStandards(prev => ({
      ...prev,
      [standardId]: isApplicable
    }));
  };

  const handleRemoveStandard = (standardId: string) => {
    // Remove from local standards
    setLocalStandards(prev => prev.filter(std => std.id !== standardId));
    
    // Remove from applicable standards
    setApplicableStandards(prev => {
      const newState = { ...prev };
      delete newState[standardId];
      return newState;
    });

    toast.success("Standard removed successfully");
  };

  const filteredStandards = localStandards.filter(standard => {
    const matchesSearch = standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || standard.type === filterType;
    const matchesTab = activeTab === "all" || 
      (activeTab === "applicable" && applicableStandards[standard.id]) ||
      (activeTab === "not-applicable" && !applicableStandards[standard.id]);
    return matchesSearch && matchesType && matchesTab;
  });

  const importStandard = () => {
    toast.success("Standard imported successfully");
  };

  const exportStandard = (id: string) => {
    toast.success(`Standard ${id} exported successfully`);
  };

  const handleAddStandards = (newStandards: Standard[]) => {
    // Filter out standards that are already in the list
    const uniqueNewStandards = newStandards.filter(
      newStd => !localStandards.some(existingStd => existingStd.id === newStd.id)
    );

    if (uniqueNewStandards.length === 0) {
      toast.error("No new standards to add");
      return;
    }

    // Add new standards to the list
    const updatedStandards = [...localStandards, ...uniqueNewStandards];
    setLocalStandards(updatedStandards);
    
    // Update applicable standards state for new standards
    const updatedApplicability = { ...applicableStandards };
    uniqueNewStandards.forEach(standard => {
      updatedApplicability[standard.id] = true; // Mark new standards as applicable by default
    });

    setApplicableStandards(updatedApplicability);
    setIsLibraryDialogOpen(false);
    setSelectedLibraryStandards({});
    toast.success(`Added ${uniqueNewStandards.length} new standard(s)`);
  };

  const handleCreateStandard = (newStandard: Standard) => {
    // Implementation needed
  };

  const generateSOA = () => {
    const selectedStandards = localStandards.filter(std => applicableStandards[std.id]);
    
    if (selectedStandards.length === 0) {
      toast.error("Please select at least one applicable standard");
      return;
    }

    toast.success("Statement of Applicability generated successfully");
    setIsSOADialogOpen(false);
  };

  if (standardsLoading || requirementsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Standards & Regulations</h1>
        <div className="flex gap-2">
          <Dialog open={isSOADialogOpen} onOpenChange={setIsSOADialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Statement of Applicability
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Statement of Applicability</DialogTitle>
                <DialogDescription>
                  Live preview of your Statement of Applicability (SoA) based on all applicable standards.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                <SoAPreview 
                  ref={soaRef}
                  standards={localStandards.filter(std => applicableStandards[std.id])}
                  requirements={requirementsData}
                />
              </div>
              <div className="border-t pt-3 pb-2 flex justify-end gap-2">
                <SoAPreview.ActionButtons soaRef={soaRef} onClose={() => setIsSOADialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Library className="h-4 w-4 mr-2" />
                Add from Library
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Standards Library</DialogTitle>
                <DialogDescription>
                  Select standards and frameworks to add to your organization's compliance scope.
                </DialogDescription>
              </DialogHeader>
              <StandardsLibrary
                availableStandards={standardsLibrary.filter(
                  std => !localStandards.some(vs => vs.id === std.id)
                )}
                selectedStandards={selectedLibraryStandards}
                onSelectionChange={(id, selected) => {
                  setSelectedLibraryStandards(prev => ({
                    ...prev,
                    [id]: selected
                  }));
                }}
                onAddStandards={() => {
                  const selectedStandards = standardsLibrary.filter(
                    std => selectedLibraryStandards[std.id]
                  );
                  handleAddStandards(selectedStandards);
                }}
                onClose={() => setIsLibraryDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Standard
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Standard</DialogTitle>
                <DialogDescription>
                  Define a new standard or framework for your organization.
                </DialogDescription>
              </DialogHeader>
              <CreateStandardForm onSubmit={handleCreateStandard} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search standards..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={filterType}
            onValueChange={(value) => setFilterType(value as string)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="framework">Framework</SelectItem>
              <SelectItem value="regulation">Regulation</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="guideline">Guideline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Available Standards</h2>
        <p className="text-muted-foreground">
          Browse, filter, and manage your cybersecurity standards and regulations. Click on a standard to view its requirements.
        </p>
      </div>
      
      {filteredStandards.length > 0 ? (
        <div className="pb-6">
          <div className="space-y-4">
            {filteredStandards.map((standard) => (
              <div key={standard.id} className="pb-4">
                <StandardCard 
                  standard={standard}
                  requirementCount={getRequirementCount(standard.id)}
                  onExport={() => exportStandard(standard.id)}
                  isApplicable={applicableStandards[standard.id] || false}
                  onApplicabilityChange={(isApplicable) => handleApplicabilityChange(standard.id, isApplicable)}
                  onRemove={() => handleRemoveStandard(standard.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-background">
          <h3 className="text-lg font-medium">No standards found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Adjust your search or add a new standard.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setFilterType("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Standards;
