import * as React from "react";
import { Check, X, Plus, FileText, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { Input } from "./input";
import { Label } from "./label";
import { Separator } from "./separator";

interface UnifiedCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  showLabels?: boolean;
}

export function TagSelector({
  selectedTags,
  onChange,
  className,
  showLabels = true,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [unifiedCategories, setUnifiedCategories] = React.useState<UnifiedCategory[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load unified categories
  React.useEffect(() => {
    loadUnifiedCategories();
  }, []);

  const loadUnifiedCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_compliance_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      if (data) {
        setUnifiedCategories(data);
      }
    } catch (error) {
      console.error('Error loading unified categories:', error);
      // Fallback to hardcoded categories
      setUnifiedCategories([
        { id: '1', name: 'Governance & Leadership', sort_order: 1 },
        { id: '2', name: 'Risk Management', sort_order: 2 },
        { id: '3', name: 'Inventory and Control of Software Assets', sort_order: 3 },
        { id: '4', name: 'Inventory and Control of Hardware Assets', sort_order: 4 },
        { id: '5', name: 'Identity & Access Management', sort_order: 5 },
        { id: '6', name: 'Data Protection', sort_order: 6 },
        { id: '7', name: 'Secure Configuration of Hardware and Software', sort_order: 7 },
        { id: '8', name: 'Vulnerability Management', sort_order: 8 },
        { id: '9', name: 'Physical & Environmental Security Controls', sort_order: 9 },
        { id: '10', name: 'Network Infrastructure Management', sort_order: 10 },
        { id: '11', name: 'Secure Software Development', sort_order: 11 },
        { id: '12', name: 'Network Monitoring & Defense', sort_order: 12 },
        { id: '13', name: 'Supplier & Third-Party Risk Management', sort_order: 13 },
        { id: '14', name: 'Security Awareness & Skills Training', sort_order: 14 },
        { id: '15', name: 'Business Continuity & Disaster Recovery Management', sort_order: 15 },
        { id: '16', name: 'Incident Response Management', sort_order: 16 },
        { id: '17', name: 'Malware Defenses', sort_order: 17 },
        { id: '18', name: 'Email & Web Browser Protections', sort_order: 18 },
        { id: '19', name: 'Penetration Testing', sort_order: 19 },
        { id: '20', name: 'Audit Log Management', sort_order: 20 },
        { id: '21', name: 'GDPR Unified Compliance', sort_order: 21 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (categoryId: string) => {
    if (selectedTags.includes(categoryId)) {
      onChange(selectedTags.filter(id => id !== categoryId));
    } else {
      onChange([...selectedTags, categoryId]);
    }
  };

  const handleRemove = (categoryId: string) => {
    onChange(selectedTags.filter((id) => id !== categoryId));
  };

  // Find category by id
  const getCategory = (categoryId: string): UnifiedCategory | undefined => {
    return unifiedCategories.find((cat) => cat.id === categoryId);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {showLabels && (
        <div className="mb-2">
          <Label className="text-sm font-medium">Categories</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select categories that apply to this requirement
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((categoryId) => {
          const category = getCategory(categoryId);
          if (!category) return null;
          
          return (
            <Badge
              key={category.id}
              variant="secondary"
              className="pr-1"
            >
              {category.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(category.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Loading categories..." : "Add categories"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {unifiedCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      handleSelect(category.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.includes(category.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

