import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RequirementStatus, RequirementPriority } from "@/types";
import { getCategoryColor } from "@/utils/categoryColors";

interface RequirementFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequirementStatus | "all";
  onStatusChange: (value: RequirementStatus | "all") => void;
  priorityFilter: RequirementPriority | "all";
  onPriorityChange: (value: RequirementPriority | "all") => void;
  standardFilter: string;
  onStandardChange: (value: string) => void;
  categoryFilter: string[];
  onCategoryToggle: (category: string) => void;
  standards: Array<{ id: string; name: string; version?: string }>;
  unifiedCategories: Array<{ name: string; count: number }>;
}

export function RequirementFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  standardFilter,
  onStandardChange,
  categoryFilter,
  onCategoryToggle,
  standards,
  unifiedCategories
}: RequirementFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and All Filters in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Beautiful Search Bar */}
        <div className="relative md:col-span-2 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
          <Input
            type="text"
            placeholder="Search requirements by name, code, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-11 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-lg shadow-sm transition-all"
            aria-label="Search requirements by keyword"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger aria-label="Filter by compliance status" className="h-11">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="partially-fulfilled">Partially Fulfilled</SelectItem>
            <SelectItem value="not-fulfilled">Not Fulfilled</SelectItem>
            <SelectItem value="not-applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger aria-label="Filter by priority level" className="h-11">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="default">Default Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Standard Filter */}
        <Select value={standardFilter} onValueChange={onStandardChange}>
          <SelectTrigger aria-label="Filter by compliance framework" className="h-11">
            <SelectValue placeholder="All Standards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Standards</SelectItem>
            {standards.map((standard) => (
              <SelectItem key={standard.id} value={standard.id}>
                {standard.name} {standard.version && `(${standard.version})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter Pills - Always Colored */}
      {unifiedCategories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Filter by Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {unifiedCategories.map((category) => {
              const isActive = categoryFilter.includes(category.name);
              const colorClass = getCategoryColor(category.name);
              return (
                <Badge
                  key={category.name}
                  variant="outline"
                  className={`cursor-pointer transition-all border-2 ${colorClass} ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md scale-105'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  onClick={() => onCategoryToggle(category.name)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? 'Remove' : 'Add'} ${category.name} filter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCategoryToggle(category.name);
                    }
                  }}
                >
                  {category.name} ({category.count})
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
