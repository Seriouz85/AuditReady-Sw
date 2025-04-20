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
import { Tag, TagCategory } from "@/types";
import { tags as allTags } from "@/data/mockData";
import { Input } from "./input";
import { Label } from "./label";
import { Separator } from "./separator";

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

  const handleSelect = (tagId: string) => {
    // If this is a parent tag and it was just selected, also select all child tags
    if (selectedTags.includes(tagId)) {
      // If unselecting a parent, also unselect all its children
      const childTags = allTags.filter(tag => tag.parentId === tagId).map(tag => tag.id);
      onChange(selectedTags.filter(id => id !== tagId && !childTags.includes(id)));
    } else {
      // When selecting a parent, don't auto-select children
      onChange([...selectedTags, tagId]);
    }
  };

  const handleRemove = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId));
  };

  // Find tag object by id
  const getTag = (tagId: string): Tag | undefined => {
    return allTags.find((tag) => tag.id === tagId);
  };

  // Group tags by category
  const typeTagsSelected = selectedTags
    .map(id => getTag(id))
    .filter(tag => tag?.category === 'type');
  
  const appliesToTagsSelected = selectedTags
    .map(id => getTag(id))
    .filter(tag => tag?.category === 'applies-to');

  // Filter tags by category
  const getTagsByCategory = (category: TagCategory, parentId?: string) => {
    return allTags.filter(tag => 
      tag.category === category && 
      (parentId ? tag.parentId === parentId : !tag.parentId)
    );
  };

  const typeTags = getTagsByCategory('type');
  const appliesToParentTags = getTagsByCategory('applies-to');
  
  // Get child tags for a parent
  const getChildTags = (parentId: string) => {
    return allTags.filter(tag => tag.parentId === parentId);
  };

  // Format category name for display
  const formatCategoryName = (category: TagCategory): string => {
    switch (category) {
      case 'type': return 'Type';
      case 'applies-to': return 'Applies to';
      default: return category;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {showLabels && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <Label className="text-sm mb-1.5 block">Type:</Label>
            <div className="flex flex-wrap gap-2 min-h-9 bg-background border rounded-md p-1">
              {typeTagsSelected.length > 0 ? (
                typeTagsSelected.map((tag) => tag && (
                  <Badge
                    key={tag.id}
                    style={{ 
                      backgroundColor: `${tag.color}20`, // 20% opacity
                      color: tag.color,
                      borderColor: `${tag.color}40`, // 40% opacity
                    }}
                    className="px-2 py-0.5 border flex items-center gap-1 group"
                  >
                    <span>{tag.name}</span>
                    <X
                      size={14}
                      className="cursor-pointer opacity-70 group-hover:opacity-100"
                      onClick={() => handleRemove(tag.id)}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground py-1 px-2">No types selected</span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Applies to:</Label>
            <div className="flex flex-wrap gap-2 min-h-9 bg-background border rounded-md p-1">
              {appliesToTagsSelected.length > 0 ? (
                appliesToTagsSelected.map((tag) => tag && (
                  <Badge
                    key={tag.id}
                    style={{ 
                      backgroundColor: `${tag.color}20`, // 20% opacity
                      color: tag.color,
                      borderColor: `${tag.color}40`, // 40% opacity
                    }}
                    className="px-2 py-0.5 border flex items-center gap-1 group"
                  >
                    <span>{tag.name}</span>
                    <X
                      size={14}
                      className="cursor-pointer opacity-70 group-hover:opacity-100"
                      onClick={() => handleRemove(tag.id)}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground py-1 px-2">No targets selected</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!showLabels && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagId) => {
            const tag = getTag(tagId);
            if (!tag) return null;
            
            return (
              <Badge
                key={tagId}
                style={{ 
                  backgroundColor: `${tag.color}20`, // 20% opacity
                  color: tag.color,
                  borderColor: `${tag.color}40`, // 40% opacity
                }}
                className="px-2 py-0.5 border flex items-center gap-1 group"
              >
                <span>{tag.name}</span>
                <X
                  size={14}
                  className="cursor-pointer opacity-70 group-hover:opacity-100"
                  onClick={() => handleRemove(tagId)}
                />
              </Badge>
            );
          })}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 border-dashed"
          >
            <Plus size={14} />
            Add Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No tags found.</CommandEmpty>
              
              {/* Type tags */}
              <CommandGroup heading="Type">
                {typeTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleSelect(tag.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {tag.description && (
                        <span className="text-muted-foreground text-xs ml-1 truncate">
                          — {tag.description}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="ml-auto h-4 w-4 text-green-500" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              
              <CommandSeparator />
              
              {/* Applies To tags */}
              <CommandGroup heading="Applies To">
                {appliesToParentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  const childTags = getChildTags(tag.id);
                  
                  return (
                    <React.Fragment key={tag.id}>
                      <CommandItem
                        onSelect={() => handleSelect(tag.id)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                        {isSelected && (
                          <Check className="ml-auto h-4 w-4 text-green-500" />
                        )}
                      </CommandItem>
                      
                      {childTags.length > 0 && isSelected && (
                        <div className="pl-6 border-l-2 ml-4 my-1 border-muted">
                          {childTags.map(childTag => {
                            const isChildSelected = selectedTags.includes(childTag.id);
                            return (
                              <CommandItem
                                key={childTag.id}
                                onSelect={() => handleSelect(childTag.id)}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: childTag.color }}
                                />
                                <span className="text-sm">{childTag.name}</span>
                                {isChildSelected && (
                                  <Check className="ml-auto h-3 w-3 text-green-500" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TagList({ tagIds }: { tagIds?: string[] }) {
  if (!tagIds || tagIds.length === 0) return null;

  // Group by category
  const typeTagIds = tagIds.filter(id => {
    const tag = allTags.find(t => t.id === id);
    return tag?.category === 'type';
  });
  
  const appliesToTagIds = tagIds.filter(id => {
    const tag = allTags.find(t => t.id === id);
    return tag?.category === 'applies-to';
  });

  return (
    <div className="space-y-1">
      {typeTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {typeTagIds.map((tagId) => {
            const tag = allTags.find((t) => t.id === tagId);
            if (!tag) return null;
            
            return (
              <Badge
                key={tagId}
                style={{ 
                  backgroundColor: `${tag.color}20`, // 20% opacity
                  color: tag.color,
                  borderColor: `${tag.color}40`, // 40% opacity
                }}
                className="px-1.5 py-0 text-xs border"
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
      )}
      
      {appliesToTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {appliesToTagIds.map((tagId) => {
            const tag = allTags.find((t) => t.id === tagId);
            if (!tag) return null;
            
            return (
              <Badge
                key={tagId}
                style={{ 
                  backgroundColor: `${tag.color}20`, // 20% opacity
                  color: tag.color,
                  borderColor: `${tag.color}40`, // 40% opacity
                }}
                className="px-1.5 py-0 text-xs border"
                variant="outline"
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
} 