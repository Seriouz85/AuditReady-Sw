import { useState, useCallback, useMemo } from 'react';
import { 
  UnifiedRequirement, 
  GuidanceContent 
} from '@/services/compliance/DynamicContentGenerator';
import { FrameworkReference } from '@/services/compliance/ContentDeduplicator';

interface UseUnifiedContentResult {
  selectedCategory: string | null;
  filteredRequirements: UnifiedRequirement[];
  guidanceContent: GuidanceContent | null;
  references: FrameworkReference[];
  searchTerm: string;
  showGuidanceModal: boolean;
  selectCategory: (category: string, requirements: UnifiedRequirement[], guidance: GuidanceContent, refs: FrameworkReference[]) => void;
  clearSelection: () => void;
  setSearchTerm: (term: string) => void;
  toggleGuidanceModal: () => void;
  getFilteredRequirements: (requirements: UnifiedRequirement[], searchTerm: string) => UnifiedRequirement[];
  getRequirementStats: () => {
    total: number;
    byFramework: Record<string, number>;
    byPriority: { high: number; medium: number; low: number };
  };
}

/**
 * Hook for managing unified content display and filtering
 */
export function useUnifiedContent(): UseUnifiedContentResult {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentRequirements, setCurrentRequirements] = useState<UnifiedRequirement[]>([]);
  const [guidanceContent, setGuidanceContent] = useState<GuidanceContent | null>(null);
  const [references, setReferences] = useState<FrameworkReference[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);

  const selectCategory = useCallback((
    category: string,
    requirements: UnifiedRequirement[],
    guidance: GuidanceContent,
    refs: FrameworkReference[]
  ) => {
    setSelectedCategory(category);
    setCurrentRequirements(requirements);
    setGuidanceContent(guidance);
    setReferences(refs);
    setSearchTerm(''); // Clear search when selecting new category
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategory(null);
    setCurrentRequirements([]);
    setGuidanceContent(null);
    setReferences([]);
    setSearchTerm('');
    setShowGuidanceModal(false);
  }, []);

  const toggleGuidanceModal = useCallback(() => {
    setShowGuidanceModal(prev => !prev);
  }, []);

  const getFilteredRequirements = useCallback((
    requirements: UnifiedRequirement[], 
    search: string
  ): UnifiedRequirement[] => {
    if (!search.trim()) return requirements;

    const searchLower = search.toLowerCase();
    
    return requirements.filter(req => 
      req.title.toLowerCase().includes(searchLower) ||
      req.description.toLowerCase().includes(searchLower) ||
      req.frameworks.some(fw => fw.toLowerCase().includes(searchLower)) ||
      req.subRequirements.some(sub => sub.toLowerCase().includes(searchLower))
    );
  }, []);

  // Memoized filtered requirements
  const filteredRequirements = useMemo(() => {
    return getFilteredRequirements(currentRequirements, searchTerm);
  }, [currentRequirements, searchTerm, getFilteredRequirements]);

  const getRequirementStats = useCallback(() => {
    const stats = {
      total: filteredRequirements.length,
      byFramework: {} as Record<string, number>,
      byPriority: { high: 0, medium: 0, low: 0 }
    };

    filteredRequirements.forEach(req => {
      // Count by framework
      req.frameworks.forEach(framework => {
        stats.byFramework[framework] = (stats.byFramework[framework] || 0) + 1;
      });

      // Count by priority
      if (req.priority >= 80) {
        stats.byPriority.high++;
      } else if (req.priority >= 60) {
        stats.byPriority.medium++;
      } else {
        stats.byPriority.low++;
      }
    });

    return stats;
  }, [filteredRequirements]);

  return {
    selectedCategory,
    filteredRequirements,
    guidanceContent,
    references,
    searchTerm,
    showGuidanceModal,
    selectCategory,
    clearSelection,
    setSearchTerm,
    toggleGuidanceModal,
    getFilteredRequirements,
    getRequirementStats
  };
}