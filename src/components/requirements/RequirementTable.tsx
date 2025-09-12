import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComplianceStatusBadge } from "@/components/ui/status-badge";
// @ts-ignore: Required for type checking
import { Requirement, RequirementPriority } from "@/types";
import { ArrowUpDown, ArrowUp, ArrowDown, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface RequirementTableProps {
  requirements: Requirement[];
  onSelectRequirement?: (requirement: Requirement) => void;
  onSort?: (key: string) => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
}

export function RequirementTable({ 
  requirements, 
  onSelectRequirement,
  onSort,
  sortConfig 
}: RequirementTableProps) {
  const [unifiedCategories, setUnifiedCategories] = useState<any[]>([]);

  // Load unified categories (no separate tags table needed)
  const loadUnifiedCategories = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    loadUnifiedCategories();
  }, [loadUnifiedCategories]);

  const getCategoryName = (categoryId: string): string => {
    // Safety check for non-string inputs
    if (!categoryId || typeof categoryId !== 'string') {
      return 'General';
    }
    
    const category = unifiedCategories.find((cat) => cat.id === categoryId);
    if (category) return category.name;
    
    // Handle demo/mock data with category names directly (not IDs)
    if (categoryId && !categoryId.startsWith('tag-') && !categoryId.match(/^\d+$/)) {
      return categoryId; // It's already a category name
    }
    
    // Handle demo/mock data with old tag format
    if (categoryId.startsWith('tag-')) {
      const name = categoryId.replace('tag-', '').replace(/-/g, ' ');
      return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    return categoryId;
  };

  const getTagName = (tagName: string): string => {
    // Tags are now category names directly, not IDs
    return tagName;
  };

  const getTagColor = (tagName: string): string => {
    // Find the unified category that matches this tag name
    const category = unifiedCategories.find((cat) => cat.name === tagName);
    if (category) {
      // Use a color based on the category index/sort order
      const colors = [
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899',
        '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#C2410C',
        '#4338CA', '#0D9488', '#1D4ED8', '#7C2D12', '#166534', '#581C87',
        '#B91C1C', '#BE185D', '#0369A1', '#1E40AF'
      ];
      return colors[category.sort_order % colors.length] || '#6B7280';
    }
    return '#6B7280';
  };

  const getCategoryColor = (categoryName: string): string => {
    // Generate consistent colors based on category name - same logic as Requirements page
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
    
    // Use hash of category name for consistent color assignment (same logic as Requirements page)
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority?: RequirementPriority) => {
    if (!priority || priority === 'default') {
      return null;
    }

    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800"
    };

    return (
      <Badge variant="outline" className={`${colors[priority]} flex items-center gap-1 py-0.5`}>
        <Flag className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => onSort?.('code')}
            >
              <div className="flex items-center gap-1">
                Code {getSortIcon('code')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[300px] cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('name')}
            >
              <div className="flex items-center gap-1">
                Requirement {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('status')}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('priority')}
            >
              <div className="flex items-center gap-1">
                Priority {getSortIcon('priority')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('lastAssessmentDate')}
            >
              <div className="flex items-center gap-1">
                Last Assessment {getSortIcon('lastAssessmentDate')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('responsibleParty')}
            >
              <div className="flex items-center gap-1">
                Responsible {getSortIcon('responsibleParty')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.length > 0 ? (
            requirements.map((req) => (
              <TableRow 
                key={req.id}
                onClick={() => onSelectRequirement?.(req)}
                className={onSelectRequirement ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                <TableCell className="font-medium">{req.code}</TableCell>
                <TableCell>{req.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {/* Display categories with consistent color scheme */}
                    {/* Debug DORA requirements */}
                    {req.code?.startsWith('Article') && (() => {
                      console.log('🔍 DORA REQUIREMENT DEBUG:', {
                        code: req.code,
                        title: req.name,
                        categories: req.categories,
                        tags: req.tags,
                        categoriesLength: req.categories?.length,
                        tagsLength: req.tags?.length
                      });
                      // Also add to window for inspection
                      if (typeof window !== 'undefined') {
                        (window as any).doraDebugData = (window as any).doraDebugData || [];
                        (window as any).doraDebugData.push({
                          code: req.code,
                          title: req.name,
                          categories: req.categories,
                          tags: req.tags
                        });
                      }
                      return null;
                    })()}
                    {req.categories && req.categories.length > 0 ? (
                      req.categories.map((category, index) => {
                        // Handle both object categories and string categoryIds
                        const categoryId = typeof category === 'object' ? category.id : category;
                        const categoryName = typeof category === 'object' ? category.name : getCategoryName(category);
                        return (
                          <Badge 
                            key={`cat-${index}`} 
                            variant="outline" 
                            className={`text-xs border ${getCategoryColor(categoryName)}`}
                          >
                            {categoryName}
                          </Badge>
                        );
                      })
                    ) : req.tags && req.tags.length > 0 ? (
                      req.tags.map((tagId, index) => (
                        <Badge 
                          key={`tag-${index}`} 
                          variant="outline" 
                          className={`text-xs border ${getCategoryColor(getTagName(tagId))}`}
                        >
                          {getTagName(tagId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">No categories</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ComplianceStatusBadge status={req.status as 'fulfilled' | 'partially-fulfilled' | 'not-fulfilled' | 'not-applicable'} />
                </TableCell>
                <TableCell>
                  {getPriorityBadge(req.priority)}
                </TableCell>
                <TableCell>
                  {req.lastAssessmentDate 
                    ? new Date(req.lastAssessmentDate).toLocaleDateString() 
                    : 'Never'}
                </TableCell>
                <TableCell>{req.responsibleParty || 'Unassigned'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No requirements found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
