import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardCard } from "@/components/standards/StandardCard";
import { standards, requirements } from "@/data/mockData";
import { StandardType } from "@/types";
import { Plus, Search, Filter, FileUp, ClipboardCheck, Download } from "lucide-react";
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

const Standards = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StandardType | "all">("all");
  const [visibleStandards] = useState(standards);
  const [isSOADialogOpen, setIsSOADialogOpen] = useState(false);
  const [applicableStandards, setApplicableStandards] = useState<Record<string, boolean>>(
    standards.reduce((acc, standard) => ({...acc, [standard.id]: false}), {})
  );
  const [justification, setJustification] = useState<Record<string, string>>(
    standards.reduce((acc, standard) => ({...acc, [standard.id]: ""}), {})
  );

  const filteredStandards = visibleStandards.filter((standard) => {
    const matchesSearch = 
      standard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      standard.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || standard.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate requirements count for each standard
  const getRequirementCount = (standardId: string) => {
    return requirements.filter(req => req.standardId === standardId).length;
  };

  const importStandard = () => {
    toast.success("Standard imported successfully");
  };

  const exportStandard = (id: string) => {
    toast.success(`Standard ${id} exported successfully`);
  };

  const handleStandardApplicabilityChange = (standardId: string, checked: boolean) => {
    setApplicableStandards(prev => ({
      ...prev,
      [standardId]: checked
    }));
  };

  const handleJustificationChange = (standardId: string, value: string) => {
    setJustification(prev => ({
      ...prev,
      [standardId]: value
    }));
  };

  const generateSOA = () => {
    // In a real implementation, this would generate and possibly export a Statement of Applicability document
    const selectedStandards = standards.filter(std => applicableStandards[std.id]);
    
    if (selectedStandards.length === 0) {
      toast.error("Please select at least one applicable standard");
      return;
    }

    // Display success message
    toast.success("Statement of Applicability generated successfully");
    setIsSOADialogOpen(false);
  };

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
            <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Statement of Applicability</DialogTitle>
                <DialogDescription>
                  Select which standards and frameworks are applicable to your organization and provide justification.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="h-[60vh] pr-4">
                <Tabs defaultValue="framework" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="framework">Frameworks</TabsTrigger>
                    <TabsTrigger value="regulation">Regulations</TabsTrigger>
                    <TabsTrigger value="policy">Policies</TabsTrigger>
                    <TabsTrigger value="guideline">Guidelines</TabsTrigger>
                  </TabsList>
                  
                  {(['framework', 'regulation', 'policy', 'guideline'] as StandardType[]).map(type => (
                    <TabsContent key={type} value={type} className="space-y-6 mt-4">
                      {standards.filter(s => s.type === type).length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No {type}s available</p>
                      ) : (
                        standards
                          .filter(s => s.type === type)
                          .map(standard => (
                            <div key={standard.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <Checkbox 
                                  id={`std-${standard.id}`}
                                  checked={applicableStandards[standard.id]}
                                  onCheckedChange={(checked) => 
                                    handleStandardApplicabilityChange(standard.id, checked as boolean)
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor={`std-${standard.id}`} className="font-medium">
                                    {standard.name} <span className="text-sm font-normal text-muted-foreground">v{standard.version}</span>
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{standard.description}</p>
                                </div>
                              </div>
                              
                              {applicableStandards[standard.id] && (
                                <div className="ml-6">
                                  <Label htmlFor={`just-${standard.id}`} className="text-sm mb-1 block">
                                    Justification
                                  </Label>
                                  <Input
                                    id={`just-${standard.id}`}
                                    value={justification[standard.id]}
                                    onChange={(e) => handleJustificationChange(standard.id, e.target.value)}
                                    placeholder="Explain why this standard is applicable to your organization"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </ScrollArea>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsSOADialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateSOA}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Statement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={importStandard}>
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Standard
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search standards..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as StandardType | "all")}
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
                  horizontal={true}
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
            setSearchQuery("");
            setTypeFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Standards;
