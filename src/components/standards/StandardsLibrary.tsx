import { Standard } from "@/types/standards";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";

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

  return (
    <div className="space-y-4">
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
              {availableStandards.filter(s => s.type === type).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No {type}s available</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {getSelectedCount(type)} selected
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(type, true)}
                    >
                      Select All
                    </Button>
                  </div>
                  
                  {availableStandards
                    .filter(s => s.type === type)
                    .map(standard => (
                      <div key={standard.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <Checkbox 
                            id={`std-${standard.id}`}
                            checked={selectedStandards[standard.id] || false}
                            onCheckedChange={(checked) => 
                              onSelectionChange(standard.id, checked as boolean)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`std-${standard.id}`} className="font-medium">
                              {standard.name} <span className="text-sm font-normal text-muted-foreground">v{standard.version}</span>
                            </Label>
                            <p className="text-sm text-muted-foreground">{standard.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </ScrollArea>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={onAddStandards}
          disabled={Object.values(selectedStandards).every(selected => !selected)}
        >
          Add Selected Standards
        </Button>
      </div>
    </div>
  );
} 