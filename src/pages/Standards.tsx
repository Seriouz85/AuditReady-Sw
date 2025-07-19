import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardCard } from "@/components/standards/StandardCard";
import { StandardsLibrary } from "@/components/standards/StandardsLibrary";
import { Standard, StandardType } from "@/types";
import { Plus, Search, Filter, ClipboardCheck, Library } from "lucide-react";
import { toast } from "@/utils/toast";
import { CreateStandardForm } from "@/components/standards/CreateStandardForm";
import { useRequirements } from "@/hooks/useRequirements";
import SoAPreview from '@/components/soa/SoAPreview';
import { useStandardsService, StandardWithRequirements } from "@/services/standards/StandardsService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Standards are now loaded from database only

const Standards = () => {
  const { requirements: requirementsData, loading: requirementsLoading } = useRequirements();
  const { isDemo } = useAuth();
  const standardsService = useStandardsService();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab] = useState("all");
  const [localStandards, setLocalStandards] = useState<StandardWithRequirements[]>([]);
  const [availableStandards, setAvailableStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSOADialogOpen, setIsSOADialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLibraryStandards, setSelectedLibraryStandards] = useState<Record<string, boolean>>({});
  const soaRef = useRef(null);

  // Load standards data on component mount
  useEffect(() => {
    loadStandardsData();
  }, []);

  const loadStandardsData = async () => {
    try {
      setLoading(true);
      
      // Both demo and production now use database
      const [orgStandards, availableStds] = await Promise.all([
        standardsService.getStandards(),
        standardsService.getAvailableStandards()
      ]);
      
      setLocalStandards(orgStandards);
      setAvailableStandards(availableStds);
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('Failed to load standards');
    } finally {
      setLoading(false);
    }
  };

  const getRequirementCount = (standardId: string) => {
    const standard = localStandards.find(std => std.id === standardId);
    return standard?.requirementCount || 0;
  };

  const handleApplicabilityChange = async (standardId: string, isApplicable: boolean) => {
    try {
      const result = await standardsService.updateApplicability(standardId, isApplicable);
      if (result.success) {
        // Update local state
        setLocalStandards(prev => prev.map(std => 
          std.id === standardId 
            ? { ...std, isApplicable }
            : std
        ));
        toast.success(`Standard marked as ${isApplicable ? 'applicable' : 'not applicable'}`);
      } else {
        toast.error(result.error || 'Failed to update standard applicability');
      }
    } catch (error) {
      console.error('Error updating applicability:', error);
      toast.error('Failed to update standard applicability');
    }
  };

  const handleRemoveStandard = async (standardId: string) => {
    try {
      const result = await standardsService.removeStandard(standardId);
      if (result.success) {
        // Update local state
        setLocalStandards(prev => prev.filter(std => std.id !== standardId));
        toast.success("Standard removed successfully");
      } else {
        toast.error(result.error || 'Failed to remove standard');
      }
    } catch (error) {
      console.error('Error removing standard:', error);
      toast.error('Failed to remove standard');
    }
  };

  const filteredStandards = localStandards.filter(standard => {
    const matchesSearch = standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || standard.type === filterType;
    const matchesTab = activeTab === "all" || 
      (activeTab === "applicable" && standard.isApplicable) ||
      (activeTab === "not-applicable" && !standard.isApplicable);
    return matchesSearch && matchesType && matchesTab;
  });

  const exportStandard = (id: string) => {
    toast.success(`Standard ${id} exported successfully`);
  };

  const handleAddStandards = async (newStandards: Standard[]) => {
    try {
      // Filter out standards that are already in the list
      const uniqueNewStandards = newStandards.filter(
        newStd => !localStandards.some(existingStd => existingStd.id === newStd.id)
      );

      if (uniqueNewStandards.length === 0) {
        toast.error("No new standards to add");
        return;
      }

      const standardIds = uniqueNewStandards.map(std => std.id);
      const result = await standardsService.addStandards(standardIds);
      
      if (result.success) {
        // Reload standards data to get the updated list
        await loadStandardsData();
        setIsLibraryDialogOpen(false);
        setSelectedLibraryStandards({});
        toast.success(`Added ${uniqueNewStandards.length} new standard(s)`);
      } else {
        toast.error(result.error || 'Failed to add standards');
      }
    } catch (error) {
      console.error('Error adding standards:', error);
      toast.error('Failed to add standards');
    }
  };

   const handleCreateStandard = (_: Standard) => {    // Implementation needed
  };

  if (requirementsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Standards & Regulations</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isSOADialogOpen} onOpenChange={setIsSOADialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Statement of Applicability</span>
                <span className="sm:hidden">SoA</span>
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
                  standards={localStandards.filter(std => std.isApplicable)}
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
              <Button className="w-full sm:w-auto">
                <Library className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add from Library</span>
                <span className="sm:hidden">Library</span>
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
                availableStandards={availableStandards.filter(
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
                  const selectedStandards = availableStandards.filter(
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
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Standard</span>
                <span className="sm:hidden">Create</span>
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
      
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
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
            <SelectTrigger className="w-full">
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
                  isApplicable={standard.isApplicable}
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
