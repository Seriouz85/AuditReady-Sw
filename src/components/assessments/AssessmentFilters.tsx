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
      {/* Search and All Filters in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4" role="search" aria-label="Filter and search assessments">
        {/* Beautiful Search Bar */}
        <div className="relative md:col-span-2 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
          <Input
            placeholder={t('assessments.search.placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-12 h-11 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-lg shadow-sm transition-all"
            aria-label="Search assessments by name, description, or assessor"
          />
        </div>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="h-11" aria-label="Filter assessments by status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Standard Filter */}
        <Select value={filterStandard} onValueChange={onFilterStandardChange}>
          <SelectTrigger className="h-11" aria-label="Filter assessments by standard">
            <SelectValue placeholder="All Standards" />
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

        {/* Type Filter (Recurring/One-time) */}
        <Select value={filterRecurring} onValueChange={onFilterRecurringChange}>
          <SelectTrigger className="h-11" aria-label="Filter by assessment type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="true">Recurring</SelectItem>
            <SelectItem value="false">One-time</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="h-11" aria-label="Sort assessments by">
            <ArrowUpDown className="mr-2 h-4 w-4" aria-hidden="true" />
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

      {/* Active Filters */}
      {(filterStatus !== 'all' || filterStandard !== 'all' || filterRecurring !== 'all' || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center" role="region" aria-label="Active filters">
          <span className="text-sm text-muted-foreground">{t('assessments.filter.active')}:</span>

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {t('assessments.search.term')}: "{searchQuery}"
              <button
                onClick={() => onSearchQueryChange('')}
                className="text-xs hover:text-red-600"
                aria-label={`Remove search filter: ${searchQuery}`}
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
                aria-label={`Remove status filter: ${getStatusLabel(filterStatus)}`}
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
                aria-label={`Remove standard filter: ${standards.find(s => s.id === filterStandard)?.name || filterStandard}`}
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
                aria-label={`Remove recurring filter: ${getRecurringLabel(filterRecurring)}`}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground" role="status" aria-live="polite" aria-atomic="true">
        {filteredAssessmentsCount === totalAssessmentsCount
          ? `Showing ${totalAssessmentsCount} assessments`
          : `Showing ${filteredAssessmentsCount} of ${totalAssessmentsCount} assessments`
        }
      </div>
    </div>
  );
};