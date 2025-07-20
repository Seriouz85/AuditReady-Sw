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
import { RemoveStandardDialog } from "@/components/standards/RemoveStandardDialog";
// Removed old useRequirements hook - using database service instead
import SoAPreview from '@/components/soa/SoAPreview';
import { useStandardsService, StandardWithRequirements } from "@/services/standards/StandardsService";
import { useAuth } from "@/contexts/AuthContext";
import { PDFExportService } from "@/services/export/PDFExportService";
import { useRequirementsService } from "@/services/requirements/RequirementsService";
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
  const { isDemo, organization } = useAuth();
  const standardsService = useStandardsService();
  const requirementsService = useRequirementsService();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab] = useState("all");
  const [localStandards, setLocalStandards] = useState<StandardWithRequirements[]>([]);
  const [availableStandards, setAvailableStandards] = useState<Standard[]>([]);
  const [requirementsData, setRequirementsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requirementsLoading, setRequirementsLoading] = useState(true);
  const [isSOADialogOpen, setIsSOADialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedLibraryStandards, setSelectedLibraryStandards] = useState<Record<string, boolean>>({});
  const [standardToRemove, setStandardToRemove] = useState<StandardWithRequirements | null>(null);
  const [exportingStandards, setExportingStandards] = useState<Set<string>>(new Set());
  const soaRef = useRef(null);

  // Load standards and requirements data on component mount
  useEffect(() => {
    loadStandardsData();
    loadRequirementsData();
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

  const loadRequirementsData = async () => {
    try {
      setRequirementsLoading(true);
      
      // Load all requirements for all standards
      const requirements = await requirementsService.getRequirements();
      setRequirementsData(requirements);
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error('Failed to load requirements data');
    } finally {
      setRequirementsLoading(false);
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

  const handleRemoveStandard = (standardId: string) => {
    const standard = localStandards.find(std => std.id === standardId);
    if (standard) {
      setStandardToRemove(standard);
      setIsRemoveDialogOpen(true);
    }
  };

  const confirmRemoveStandard = async () => {
    if (!standardToRemove) return;

    try {
      const result = await standardsService.removeStandard(standardToRemove.id);
      if (result.success) {
        // Update local state
        setLocalStandards(prev => prev.filter(std => std.id !== standardToRemove.id));
        toast.success("Standard removed successfully");
      } else {
        toast.error(result.error || 'Failed to remove standard');
      }
    } catch (error) {
      console.error('Error removing standard:', error);
      toast.error('Failed to remove standard');
    } finally {
      setIsRemoveDialogOpen(false);
      setStandardToRemove(null);
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

  const exportStandard = async (standardId: string) => {
    try {
      // Add to exporting set
      setExportingStandards(prev => new Set([...prev, standardId]));

      // Find the standard
      const standard = localStandards.find(std => std.id === standardId);
      if (!standard) {
        toast.error('Standard not found');
        return;
      }

      // Get requirements for this standard
      const requirements = await requirementsService.getRequirements(standardId);
      const standardRequirements = requirements;

      if (standardRequirements.length === 0) {
        toast.error('No requirements found for this standard');
        return;
      }

      // Export to PDF
      await PDFExportService.exportStandardToPDF(
        standard,
        standardRequirements,
        organization?.name
      );

      toast.success(`${standard.name} exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export standard');
    } finally {
      // Remove from exporting set
      setExportingStandards(prev => {
        const newSet = new Set(prev);
        newSet.delete(standardId);
        return newSet;
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Standards & Regulations
              </h1>
              <p className="text-slate-200 dark:text-slate-300 text-lg max-w-2xl">
                Manage your compliance framework with enterprise-grade standards and automated requirement tracking.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Dialog open={isSOADialogOpen} onOpenChange={(open) => {
                setIsSOADialogOpen(open);
                if (open) {
                  // Reload requirements data when SoA dialog opens
                  loadRequirementsData();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="w-full lg:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
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
                <SoAPreview.ActionButtons 
                  soaRef={soaRef} 
                  onClose={() => setIsSOADialogOpen(false)}
                  standards={localStandards}
                  requirements={requirementsData}
                />
              </div>
            </DialogContent>
          </Dialog>
          
              <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full lg:w-auto bg-white hover:bg-gray-50 text-slate-700 shadow-lg transition-all duration-200">
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
                  <Button className="w-full lg:w-auto bg-slate-800 hover:bg-slate-900 text-white shadow-lg transition-all duration-200">
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-400" />
              <Input
                placeholder="Search standards and frameworks..."
                className="pl-12 h-12 text-lg border-gray-200 dark:border-slate-600 focus:border-slate-500 focus:ring-slate-500 rounded-xl dark:bg-slate-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lg:w-64">
              <Select 
                value={filterType}
                onValueChange={(value) => setFilterType(value as string)}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-slate-600 focus:border-slate-500 focus:ring-slate-500 dark:bg-slate-700 dark:text-white">
                  <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
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
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Standards</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredStandards.length}</p>
              </div>
              <div className="h-12 w-12 bg-slate-500 dark:bg-slate-600 rounded-full flex items-center justify-center">
                <Library className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Applicable</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                  {filteredStandards.filter(s => s.isApplicable).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Requirements</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {filteredStandards.reduce((sum, std) => sum + getRequirementCount(std.id), 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-500 dark:bg-slate-600 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Standards Grid */}
        {filteredStandards.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Standards</h2>
              <p className="text-gray-600 dark:text-slate-400">{filteredStandards.length} standard{filteredStandards.length !== 1 ? 's' : ''} found</p>
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
                    isExporting={exportingStandards.has(standard.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="h-24 w-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400 dark:text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No standards found</h3>
                <p className="text-gray-600 dark:text-slate-400">
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

      {/* Remove Standard Confirmation Dialog */}
      <RemoveStandardDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        standardName={standardToRemove?.name || ""}
        onConfirm={confirmRemoveStandard}
      />
    </div>
  );
};

export default Standards;
