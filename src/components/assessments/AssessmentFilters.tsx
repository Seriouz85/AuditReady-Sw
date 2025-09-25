import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import { Standard } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface AssessmentFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filterStandard: string;
  onFilterStandardChange: (standard: string) => void;
  filterRecurring: string;
  onFilterRecurringChange: (recurring: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  standards: Standard[];
  filteredAssessmentsCount: number;
  totalAssessmentsCount: number;
}

export const AssessmentFilters: React.FC<AssessmentFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  filterStandard,
  onFilterStandardChange,
  filterRecurring,
  onFilterRecurringChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  standards,
  filteredAssessmentsCount,
  totalAssessmentsCount
}) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('assessments.status.draft');
      case 'in-progress': return t('assessments.status.in-progress');
      case 'completed': return t('assessments.status.completed');
      default: return t('assessments.status.all');
    }
  };

  const getRecurringLabel = (recurring: string) => {
    switch (recurring) {
      case 'true': return t('assessments.recurring.yes');
      case 'false': return t('assessments.recurring.no');
      default: return t('assessments.recurring.all');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('assessments.search.placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStandard} onValueChange={onFilterStandardChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Standards</SelectItem>
              {standards.map((standard) => (
                <SelectItem key={standard.id} value={standard.id}>
                  {standard.name} {standard.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterRecurring} onValueChange={onFilterRecurringChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter recurring" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="true">Recurring</SelectItem>
              <SelectItem value="false">One-time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Latest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="progress-desc">Progress High-Low</SelectItem>
              <SelectItem value="progress-asc">Progress Low-High</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="assessor">Assessor</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(filterStatus !== 'all' || filterStandard !== 'all' || filterRecurring !== 'all' || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">{t('assessments.filter.active')}:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {t('assessments.search.term')}: "{searchQuery}"
              <button
                onClick={() => onSearchQueryChange('')}
                className="text-xs hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filterStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('assessments.filter.status')}: {getStatusLabel(filterStatus)}
              <button
                onClick={() => onFilterStatusChange('all')}
                className="text-xs hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filterStandard !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('assessments.filter.standard')}: {standards.find(s => s.id === filterStandard)?.name || filterStandard}
              <button
                onClick={() => onFilterStandardChange('all')}
                className="text-xs hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filterRecurring !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('assessments.filter.recurring')}: {getRecurringLabel(filterRecurring)}
              <button
                onClick={() => onFilterRecurringChange('all')}
                className="text-xs hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAssessmentsCount === totalAssessmentsCount
          ? `Showing ${totalAssessmentsCount} assessments`
          : `Showing ${filteredAssessmentsCount} of ${totalAssessmentsCount} assessments`
        }
      </div>
    </div>
  );
};