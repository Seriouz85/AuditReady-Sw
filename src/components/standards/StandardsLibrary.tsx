import { Standard, StandardType } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Shield, FileText, BookOpen, Target, CheckCircle, Users, Building, Globe } from "lucide-react";

interface StandardsLibraryProps {
  availableStandards: Standard[];
  selectedStandards: Record<string, boolean>;
  onSelectionChange: (id: string, selected: boolean) => void;
  onAddStandards: () => void;
  onClose: () => void;
}

export function StandardsLibrary({
  availableStandards,
  selectedStandards,
  onSelectionChange,
  onAddStandards,
  onClose,
}: StandardsLibraryProps) {
  const { t } = useTranslation();

  const handleSelectAll = (type: string, selected: boolean) => {
    availableStandards
      .filter(std => std.type === type)
      .forEach(std => onSelectionChange(std.id, selected));
  };

  const getSelectedCount = (type: string) => {
    return availableStandards
      .filter(std => std.type === type && selectedStandards[std.id])
      .length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'framework': return <Shield className="h-4 w-4" />;
      case 'regulation': return <FileText className="h-4 w-4" />;
      case 'policy': return <BookOpen className="h-4 w-4" />;
      case 'guideline': return <Target className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'framework': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regulation': return 'bg-red-100 text-red-800 border-red-200';
      case 'policy': return 'bg-green-100 text-green-800 border-green-200';
      case 'guideline': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (standard: Standard) => {
    const category = standard.category || standard.description || '';
    if (category.toLowerCase().includes('security')) return <Shield className="h-5 w-5 text-blue-600" />;
    if (category.toLowerCase().includes('data')) return <Users className="h-5 w-5 text-green-600" />;
    if (category.toLowerCase().includes('network')) return <Globe className="h-5 w-5 text-purple-600" />;
    if (category.toLowerCase().includes('cyber')) return <Target className="h-5 w-5 text-red-600" />;
    return <Building className="h-5 w-5 text-gray-600" />;
  };

  const getAllStandards = () => availableStandards;
  const getStandardsByType = (type: string) => availableStandards.filter(s => s.type === type);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Standards & Frameworks Library</h3>
        <p className="text-sm text-muted-foreground">
          Choose from our comprehensive collection of {availableStandards.length} standards and frameworks
        </p>
      </div>
      
      <ScrollArea className="h-[60vh] pr-4">
        <Tabs defaultValue="all" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              All ({availableStandards.length})
            </TabsTrigger>
            <TabsTrigger value="framework" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="regulation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Regulations
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="guideline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Guidelines
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  {Object.values(selectedStandards).filter(Boolean).length} of {availableStandards.length} selected
                </Label>
                <p className="text-xs text-muted-foreground">Browse all available standards and frameworks</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allSelected = availableStandards.every(std => selectedStandards[std.id]);
                  availableStandards.forEach(std => 
                    onSelectionChange(std.id, !allSelected)
                  );
                }}
              >
                {availableStandards.every(std => selectedStandards[std.id]) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid gap-4">
              {getAllStandards().map(standard => (
                <Card key={standard.id} className={`transition-all duration-200 hover:shadow-md ${
                  selectedStandards[standard.id] ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:border-gray-300'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={`std-all-${standard.id}`}
                        checked={selectedStandards[standard.id] || false}
                        onCheckedChange={(checked) => 
                          onSelectionChange(standard.id, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(standard)}
                            <Label htmlFor={`std-all-${standard.id}`} className="font-semibold text-base cursor-pointer">
                              {standard.name}
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              v{standard.version}
                            </Badge>
                            <Badge className={`text-xs ${getTypeColor(standard.type)} flex items-center gap-1`}>
                              {getTypeIcon(standard.type)}
                              {standard.type}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">
                          {standard.description}
                        </CardDescription>
                        {standard.category && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {standard.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {(['framework', 'regulation', 'policy', 'guideline'] as StandardType[]).map(type => (
            <TabsContent key={type} value={type} className="space-y-6 mt-6">
              {getStandardsByType(type).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="flex justify-center mb-4">
                    {getTypeIcon(type)}
                  </div>
                  <p className="text-muted-foreground">No {type}s available in the library</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        {getTypeIcon(type)}
                        {getSelectedCount(type)} of {getStandardsByType(type).length} selected
                      </Label>
                      <p className="text-xs text-muted-foreground">Select {type}s to add to your organization</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const typeStandards = getStandardsByType(type);
                        const allSelected = typeStandards.every(std => selectedStandards[std.id]);
                        typeStandards.forEach(std => 
                          onSelectionChange(std.id, !allSelected)
                        );
                      }}
                    >
                      {getStandardsByType(type).every(std => selectedStandards[std.id]) ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {getStandardsByType(type).map(standard => (
                      <Card key={standard.id} className={`transition-all duration-200 hover:shadow-md ${
                        selectedStandards[standard.id] ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:border-gray-300'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id={`std-${type}-${standard.id}`}
                              checked={selectedStandards[standard.id] || false}
                              onCheckedChange={(checked) => 
                                onSelectionChange(standard.id, checked as boolean)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(standard)}
                                  <Label htmlFor={`std-${type}-${standard.id}`} className="font-semibold text-base cursor-pointer">
                                    {standard.name}
                                  </Label>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  v{standard.version}
                                </Badge>
                              </div>
                              <CardDescription className="text-sm leading-relaxed">
                                {standard.description}
                              </CardDescription>
                              {standard.category && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  {standard.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </ScrollArea>
      
      <div className="flex items-center justify-between pt-6 border-t bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
        <div className="text-sm text-muted-foreground">
          {Object.values(selectedStandards).filter(Boolean).length > 0 && (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {Object.values(selectedStandards).filter(Boolean).length} standard(s) selected
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onAddStandards}
            disabled={Object.values(selectedStandards).every(selected => !selected)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Add Selected Standards
          </Button>
        </div>
      </div>
    </div>
  );
} 