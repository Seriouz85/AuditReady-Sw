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
    // Show confirmation dialog with proper warning
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to remove this standard?\n\n" +
      "This action will permanently delete:\n" +
      "• All current settings and configurations\n" +
      "• All requirement fulfillment levels and progress\n" +
      "• All notes and custom data\n" +
      "• All assessment history related to this standard\n\n" +
      "This action cannot be undone!"
    );

    if (!confirmed) {
      return; // User cancelled
    }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Standards & Regulations
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Manage your compliance framework with enterprise-grade standards and automated requirement tracking.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Dialog open={isSOADialogOpen} onOpenChange={setIsSOADialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="w-full lg:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Statement of Applicability</span>
                    <span className="sm:hidden">SoA</span>
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Statement of Applicability</DialogTitle>
                <DialogDescription>
                  Live preview of your Statement of Applicability (SoA) based on all standards and requirements.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                <SoAPreview 
                  ref={soaRef}
                  standards={localStandards}
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
                  <Button className="w-full lg:w-auto bg-white hover:bg-gray-50 text-blue-700 shadow-lg transition-all duration-200">
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
                  <Button className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-200">
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
        </div>
      </div>

      {/* Modern Search and Filter Section */}
      <div className="container mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search standards and frameworks..."
                className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lg:w-64">
              <Select 
                value={filterType}
                onValueChange={(value) => setFilterType(value as string)}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
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
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Standards</p>
                <p className="text-3xl font-bold text-blue-900">{filteredStandards.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Library className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Applicable</p>
                <p className="text-3xl font-bold text-green-900">
                  {filteredStandards.filter(s => s.isApplicable).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Requirements</p>
                <p className="text-3xl font-bold text-purple-900">
                  {filteredStandards.reduce((sum, std) => sum + getRequirementCount(std.id), 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Standards Grid */}
        {filteredStandards.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Standards</h2>
              <p className="text-gray-600">{filteredStandards.length} standard{filteredStandards.length !== 1 ? 's' : ''} found</p>
            </div>
            
            <div className="grid gap-6">
              {filteredStandards.map((standard) => (
                <div key={standard.id} className="transform transition-all duration-200 hover:scale-[1.02]">
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
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No standards found</h3>
                <p className="text-gray-600">
                  Adjust your search criteria or add a new standard to get started.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="rounded-xl px-6 py-3"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Standards;
