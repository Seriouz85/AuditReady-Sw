import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface UnifiedCategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

export function UnifiedCategorySelector({ 
  selectedCategories, 
  onChange, 
  className 
}: UnifiedCategorySelectorProps) {
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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
        setAvailableCategories(data);
      }
    } catch (error) {
      console.error('Error loading unified categories:', error);
    }
  };

  const getCategoryColor = (categoryId: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200', 
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-violet-100 text-violet-800 border-violet-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-lime-100 text-lime-800 border-lime-200',
      'bg-sky-100 text-sky-800 border-sky-200',
      'bg-rose-100 text-rose-800 border-rose-200',
      'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'bg-slate-100 text-slate-800 border-slate-200',
      'bg-stone-100 text-stone-800 border-stone-200',
      'bg-zinc-100 text-zinc-800 border-zinc-200',
      'bg-neutral-100 text-neutral-800 border-neutral-200'
    ];
    
    let hash = 0;
    for (let i = 0; i < categoryId.length; i++) {
      hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getCategoryName = (categoryId: string): string => {
    const category = availableCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(selectedCategories.filter(id => id !== categoryId));
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              Select Categories
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start" sideOffset={5}>
            <div className="max-h-[300px] overflow-auto p-4 space-y-2">
              {availableCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <div className="flex items-center justify-center w-4 h-4 border border-gray-300 rounded">
                    {selectedCategories.includes(category.id) && (
                      <Check className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Display selected categories */}
        {selectedCategories.map((categoryId) => (
          <Badge
            key={categoryId}
            variant="outline"
            className={cn("text-xs border", getCategoryColor(categoryId))}
          >
            {getCategoryName(categoryId)}
            <button
              onClick={(e) => handleRemoveCategory(categoryId, e)}
              className="ml-1 hover:text-red-600"
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}