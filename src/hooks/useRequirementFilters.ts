import { useMemo } from 'react';
import { RequirementWithStatus } from '@/services/requirements/RequirementsService';
import { RequirementStatus, RequirementPriority } from '@/types';

interface FilterConfig {
  searchQuery: string;
  statusFilter: RequirementStatus | 'all';
  standardFilter: string;
  priorityFilter: RequirementPriority | 'all';
  categoryFilter: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  unifiedCategories: any[];
}

export function useRequirementFilters(
  requirements: RequirementWithStatus[],
  filters: FilterConfig
) {
  return useMemo(() => {
    // Deduplicate by ID
    const seen = new Set<string>();
    const deduplicated = requirements.filter(req => {
      if (seen.has(req.id)) return false;
      seen.add(req.id);
      return true;
    });

    // Apply filters
    let result = deduplicated.filter(requirement => {
      const matchesSearch =
        requirement.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        requirement.code.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        requirement.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesStatus = filters.statusFilter === 'all' || requirement.status === filters.statusFilter;
      const matchesStandard = filters.standardFilter === 'all' || requirement.standardId === filters.standardFilter;
      const matchesPriority = filters.priorityFilter === 'all' || requirement.priority === filters.priorityFilter;

      const matchesCategory =
        filters.categoryFilter.length === 0 ||
        (requirement.tags && requirement.tags.some(tag =>
          filters.categoryFilter.some(filterId => {
            const category = filters.unifiedCategories.find(uc => uc.id === filterId);
            return category && category.name === tag;
          })
        )) ||
        (requirement.categories && requirement.categories.some(cat =>
          filters.categoryFilter.some(filterId => {
            const category = filters.unifiedCategories.find(uc => uc.id === filterId);
            return category && category.name === cat;
          })
        ));

      return matchesSearch && matchesStatus && matchesStandard && matchesPriority && matchesCategory;
    });

    // Apply sorting
    if (filters.sortConfig) {
      result = sortRequirements(result, filters.sortConfig);
    } else if (filters.standardFilter !== 'all') {
      result = sortByCode(result);
    }

    return result;
  }, [requirements, filters]);
}

function sortRequirements(
  requirements: RequirementWithStatus[],
  sortConfig: { key: string; direction: 'asc' | 'desc' }
) {
  return [...requirements].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];

    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;

    if (sortConfig.key === 'lastAssessmentDate') {
      comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
    } else if (sortConfig.key === 'priority') {
      const priorityOrder = { default: 0, low: 1, medium: 2, high: 3 };
      comparison = (priorityOrder[aValue as keyof typeof priorityOrder] ?? 0) -
                   (priorityOrder[bValue as keyof typeof priorityOrder] ?? 0);
    } else if (sortConfig.key === 'code') {
      comparison = compareRequirementCodes(String(aValue), String(bValue));
    } else {
      comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}

function sortByCode(requirements: RequirementWithStatus[]) {
  return [...requirements].sort((a, b) => compareRequirementCodes(String(a.code), String(b.code)));
}

function compareRequirementCodes(aCode: string, bCode: string): number {
  const aMatch = aCode.match(/(\d+(?:\.\d+)*)/);
  const bMatch = bCode.match(/(\d+(?:\.\d+)*)/);

  if (aMatch && bMatch) {
    const aParts = aMatch[1].split('.').map(Number);
    const bParts = bMatch[1].split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      if (aPart !== bPart) return aPart - bPart;
    }
  }

  return aCode.localeCompare(bCode);
}
