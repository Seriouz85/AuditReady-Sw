import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppliesToSelectorProps {
  selectedItems: string[];
  onChange: (items: string[]) => void;
  className?: string;
}

export function AppliesToSelector({ 
  selectedItems, 
  onChange, 
  className 
}: AppliesToSelectorProps) {
  const [open, setOpen] = useState(false);

  // Simplified "Applies To" options as specified
  const appliesToOptions = [
    { id: 'organizations', label: 'Organizations', category: 'Entity' },
    { id: 'applications_systems', label: 'Applications/Systems', category: 'Entity' },
    { id: 'locations', label: 'Locations', category: 'Entity' },
    { id: 'devices_servers', label: 'Devices - Servers', category: 'Devices' },
    { id: 'devices_networks', label: 'Devices - Networks', category: 'Devices' },
    { id: 'devices_clients', label: 'Devices - Clients', category: 'Devices' }
  ];

  const getItemColor = (itemId: string): string => {
    const colors = [
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-blue-100 text-blue-800 border-blue-200', 
      'bg-violet-100 text-violet-800 border-violet-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200'
    ];
    
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) {
      hash = itemId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getItemLabel = (itemId: string): string => {
    const item = appliesToOptions.find((opt) => opt.id === itemId);
    return item ? item.label : itemId;
  };

  const handleToggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onChange(selectedItems.filter(id => id !== itemId));
    } else {
      onChange([...selectedItems, itemId]);
    }
  };

  const handleRemoveItem = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(selectedItems.filter(id => id !== itemId));
  };

  // Group options by category
  const groupedOptions = appliesToOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof appliesToOptions>);

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
              <Target className="mr-2 h-4 w-4" />
              Select Applies To
              {selectedItems.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {selectedItems.length}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start" sideOffset={5}>
            <div className="max-h-[400px] overflow-auto p-4 space-y-4">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-gray-600 mb-2 border-b pb-1">
                    {category}
                  </h4>
                  <div className="space-y-1 ml-2">
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => handleToggleItem(option.id)}
                      >
                        <div className="flex items-center justify-center w-4 h-4 border border-gray-300 rounded">
                          {selectedItems.includes(option.id) && (
                            <Check className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Display selected items */}
        {selectedItems.map((itemId) => (
          <Badge
            key={itemId}
            variant="outline"
            className={cn("text-xs border", getItemColor(itemId))}
          >
            {getItemLabel(itemId)}
            <button
              onClick={(e) => handleRemoveItem(itemId, e)}
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