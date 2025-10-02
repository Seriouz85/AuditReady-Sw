import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RequirementTable } from "@/components/requirements/RequirementTable";
import { RequirementDetail } from "@/components/requirements/RequirementDetail";
import { RequirementFilters } from "@/components/requirements/RequirementFilters";
import { RequirementPageHeader } from "@/components/requirements/RequirementPageHeader";
import { Requirement, RequirementStatus, RequirementPriority } from "@/types";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useTranslation } from "@/lib/i18n";
import { useRequirementsService, RequirementWithStatus } from "@/services/requirements/RequirementsService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useRequirementsRealTime } from "@/hooks/useRequirementsRealTime";
import { RequirementsRealTimeService } from "@/services/requirements/RequirementsRealTimeService";
import { RequirementConflictResolver } from "@/components/requirements/RequirementConflictResolver";
import { ConflictResolution } from "@/services/requirements/RequirementsService";
import { useRequirementFilters } from "@/hooks/useRequirementFilters";
import { useRequirementCollaboration } from "@/hooks/useRequirementCollaboration";
import { updateRequirement, initializeDemoPriorities } from "@/utils/requirementHandlers";
import { getCategoryColor } from "@/utils/categoryColors";

const Requirements = () => {
  const [searchParams] = useSearchParams();
  const standardIdFromUrl = searchParams.get("standard");
  const statusFromUrl = searchParams.get("status") as RequirementStatus | null;
  const priorityFromUrl = searchParams.get("priority") as RequirementPriority | null;
  const { t } = useTranslation();
  const { isDemo, organization } = useAuth();

  console.log('🚨 REQUIREMENTS PAGE LOADED!', {
    standardIdFromUrl,
    isDemo,
    organization: organization?.id,
    timestamp: new Date().toISOString()
  });

  const requirementsService = useRequirementsService();
  const realTimeService = RequirementsRealTimeService.getInstance();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | "all">(
    statusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(statusFromUrl)
      ? statusFromUrl : "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<RequirementPriority | "all">(
    priorityFromUrl && ['default', 'low', 'medium', 'high'].includes(priorityFromUrl)
      ? priorityFromUrl : "all"
  );
  const [standardFilter, setStandardFilter] = useState<string>(standardIdFromUrl || "all");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementWithStatus | null>(null);
  const [localRequirements, setLocalRequirements] = useState<RequirementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [standards, setStandards] = useState<any[]>([]);
  const [unifiedCategories, setUnifiedCategories] = useState<any[]>([]);
  const [conflictToResolve, setConflictToResolve] = useState<ConflictResolution | null>(null);

  // Real-time collaboration
  const { collaborationSessionId, startCollaboration, endCollaboration } = useRequirementCollaboration(
    organization?.id || '',
    isDemo
  );

  // Real-time data
  const {
    requirements: realTimeRequirements,
    activeUsers,
    recentActivities,
    isConnected,
    conflictedRequirements,
    resolveConflict,
    refreshRequirements
  } = useRequirementsRealTime({
    organizationId: organization?.id || '',
    standardId: standardFilter !== 'all' ? standardFilter : undefined,
    enabled: !isDemo
  });

  // Apply filters
  const sortedAndFilteredRequirements = useRequirementFilters(localRequirements, {
    searchQuery,
    statusFilter,
    standardFilter,
    priorityFilter,
    categoryFilter,
    sortConfig,
    unifiedCategories
  });

  // Load requirements
  useEffect(() => {
    loadRequirements();
  }, [standardFilter]);

  // Load standards and categories
  useEffect(() => {
    if (organization?.id) {
      loadStandardsAndCategories();
    }
  }, [organization?.id, isDemo]);

  // Handle URL params and start collaboration
  useEffect(() => {
    if (standardIdFromUrl) setStandardFilter(standardIdFromUrl);

    const newStatusFromUrl = searchParams.get("status") as RequirementStatus | null;
    if (newStatusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(newStatusFromUrl)) {
      setStatusFilter(newStatusFromUrl);
    }

    const newPriorityFromUrl = searchParams.get("priority") as RequirementPriority | null;
    if (newPriorityFromUrl && ['default', 'low', 'medium', 'high'].includes(newPriorityFromUrl)) {
      setPriorityFilter(newPriorityFromUrl);
    }

    if (!isDemo && organization?.id) {
      startCollaboration('viewing');
    }
  }, [searchParams, standardIdFromUrl, isDemo]);

  // Cleanup collaboration on unmount
  useEffect(() => {
    return () => {
      if (collaborationSessionId) {
        endCollaboration();
      }
    };
  }, [collaborationSessionId, endCollaboration]);

  // Monitor conflicts
  useEffect(() => {
    conflictedRequirements.forEach(requirementId => {
      if (!conflictToResolve) {
        const requirement = localRequirements.find(r => r.id === requirementId);
        if (requirement) {
          setConflictToResolve({
            requirementId,
            conflictType: 'version_mismatch',
            localValue: requirement,
            remoteValue: null
          });
        }
      }
    });
  }, [conflictedRequirements, localRequirements, conflictToResolve]);

  // Initialize demo priorities
  useEffect(() => {
    if (localRequirements.length > 0) {
      const prioritized = initializeDemoPriorities(localRequirements);
      if (prioritized !== localRequirements) {
        setLocalRequirements(prioritized);
      }
    }
  }, [localRequirements.length]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const requirementsData = await requirementsService.getRequirements(
        standardFilter !== "all" ? standardFilter : undefined
      );
      setLocalRequirements(requirementsData);

      if (requirementsData.length === 0 && !isDemo) {
        toast.info('No requirements found. Import standards first to get started.');
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error(
        isDemo
          ? 'Demo data unavailable'
          : 'Failed to load requirements. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStandardsAndCategories = async () => {
    try {
      if (!organization?.id) {
        console.log('No organization ID available, skipping standards load');
        return;
      }

      console.log('Loading standards and categories for org:', organization.id);

      const [orgStandardsResponse, categoriesResponse] = await Promise.all([
        isDemo
          ? supabase.from('standards_library').select('id, name, version, description, type, is_active').eq('is_active', true).order('name')
          : supabase
              .from('organization_standards')
              .select(`
                standard_id,
                standards_library (
                  id,
                  name,
                  version,
                  description,
                  type,
                  is_active
                )
              `)
              .eq('organization_id', organization.id),
        supabase.from('unified_compliance_categories').select('id, name, description, sort_order, is_active').eq('is_active', true).order('sort_order')
      ]);

      if (orgStandardsResponse.data) {
        if (isDemo) {
          setStandards(orgStandardsResponse.data);
        } else {
          const orgStandards = orgStandardsResponse.data
            .map(item => item.standards_library)
            .filter(standard => standard && standard.is_active)
            .sort((a, b) => a.name.localeCompare(b.name));
          setStandards(orgStandards);
        }
      }

      if (categoriesResponse.data) {
        setUnifiedCategories(categoriesResponse.data);
      }

      console.log('Standards and categories loaded successfully');
    } catch (error) {
      console.error('Error loading standards and categories:', error);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: 'asc' };
      } else if (prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      } else {
        return null;
      }
    });
  };

  const handleConflictResolve = async (conflict: ConflictResolution) => {
    try {
      await resolveConflict(conflict.requirementId, conflict.resolution || 'keep_remote');
      setConflictToResolve(null);

      if (!isDemo) {
        await refreshRequirements();
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve conflict');
    }
  };

  const handleUpdateRequirement = async (
    requirementId: string,
    updates: {
      status?: string;
      fulfillmentPercentage?: number;
      evidence?: string;
      notes?: string;
      responsibleParty?: string;
      tags?: string[];
      riskLevel?: string;
    }
  ) => {
    setSaveStatus('saving');

    if (!isDemo) {
      await startCollaboration('editing');
    }

    const result = await updateRequirement(requirementId, updates, {
      requirementsService,
      realTimeService,
      organizationId: organization?.id || '',
      isDemo,
      localRequirements,
      onConflict: (conflict) => {
        setConflictToResolve(conflict);
        setSaveStatus('error');
      },
      onSuccess: (updatedReq) => {
        setLocalRequirements(prev => prev.map(req => req.id === requirementId ? updatedReq : req));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    });

    if (!result.success) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleStatusChange = async (id: string, status: RequirementStatus) => {
    await handleUpdateRequirement(id, { status });
    if (selectedRequirement?.id === id) {
      setSelectedRequirement({ ...selectedRequirement, status, organizationStatus: status });
    }
  };

  const handlePriorityChange = async (id: string, priority: RequirementPriority) => {
    setLocalRequirements(localRequirements.map(req => req.id === id ? { ...req, priority } : req));
    if (selectedRequirement?.id === id) setSelectedRequirement({ ...selectedRequirement, priority });
  };

  const handleNotesChange = async (id: string, notes: string) => {
    await handleUpdateRequirement(id, { notes });
    if (selectedRequirement?.id === id) setSelectedRequirement({ ...selectedRequirement, notes });
  };

  const handleTagsChange = async (id: string, newTags: string[]) => {
    await handleUpdateRequirement(id, { tags: newTags });
    if (selectedRequirement?.id === id) {
      setSelectedRequirement({ ...selectedRequirement, tags: newTags, organizationTags: newTags });
    }
  };

  const updateUrlParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    (!value || value === 'all') ? params.delete(key) : params.set(key, value);
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading requirements">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStandardName = (id: string) => {
    const standard = standards.find(s => s.id === id);
    return standard ? t(`standard.${id}.name`, standard.name) : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          {selectedRequirement ? (
            <h1 className="text-3xl font-bold tracking-tight sr-only">{selectedRequirement.code}</h1>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">{t('requirements.title', 'Requirements')}</h1>
          )}
          {standardFilter !== "all" && !selectedRequirement && (
            <div className="text-sm text-muted-foreground mt-1">
              {t('requirements.viewing_for', 'Viewing requirements for')}: {getStandardName(standardFilter)}
            </div>
          )}
        </div>

        {!selectedRequirement && (
          <div className="flex items-center gap-4">
            <SaveIndicator status={saveStatus} isDemo={isDemo} />
            {!isDemo && (
              <div className="flex items-center gap-2" role="status" aria-live="polite">
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} aria-hidden="true" />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            )}
            <Button aria-label="Add new requirement">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('requirements.button.add', 'Add Requirement')}
            </Button>
          </div>
        )}
      </div>

      {!selectedRequirement && (
        <>
          <RequirementFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={(v) => { setStatusFilter(v); updateUrlParams('status', v); }}
            priorityFilter={priorityFilter}
            onPriorityChange={(v) => { setPriorityFilter(v); updateUrlParams('priority', v); }}
            standardFilter={standardFilter}
            onStandardChange={setStandardFilter}
            categoryFilter={categoryFilter}
            onCategoryToggle={(id) => setCategoryFilter(prev =>
              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )}
            standards={standards}
            unifiedCategories={unifiedCategories.map(cat => ({
              name: cat.name,
              count: localRequirements.filter(req =>
                req.tags?.includes(cat.name) || req.categories?.includes(cat.name)
              ).length
            }))}
          />
          <RequirementTable
            requirements={sortedAndFilteredRequirements}
            onSelectRequirement={setSelectedRequirement}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </>
      )}

      {selectedRequirement && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setSelectedRequirement(null)} aria-label="Back to requirements list">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('requirements.button.back', 'Back to requirements')}
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground" aria-live="polite">
                Last updated: {new Date(selectedRequirement.updatedAt).toLocaleString()}
              </div>
              <Button size="sm" className="flex items-center gap-1.5" aria-label="Save changes (Ctrl+S or Cmd+S)">
                <Save size={14} className="mr-1" aria-hidden="true" />
                Save
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 ml-1.5 border border-gray-400 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
                  {navigator.platform.includes('Mac') ? '⌘S' : 'Ctrl+S'}
                </span>
              </Button>
            </div>
          </div>
          <RequirementDetail
            requirement={selectedRequirement}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onEvidenceChange={(id, e) => handleUpdateRequirement(id, { evidence: e })}
            onNotesChange={handleNotesChange}
            onTagsChange={handleTagsChange}
            onCategoriesChange={(id, c) => handleUpdateRequirement(id, { categories: c })}
            onAppliesToChange={(id, a) => handleUpdateRequirement(id, { appliesTo: a })}
            onGuidanceChange={(id, g) => handleUpdateRequirement(id, { guidance: g })}
          />
        </>
      )}

      {conflictToResolve && (
        <RequirementConflictResolver
          isOpen={!!conflictToResolve}
          onClose={() => setConflictToResolve(null)}
          conflict={conflictToResolve}
          onResolve={handleConflictResolve}
          requirementTitle={localRequirements.find(r => r.id === conflictToResolve.requirementId)?.name || 'Unknown'}
          requirementCode={localRequirements.find(r => r.id === conflictToResolve.requirementId)?.code || 'N/A'}
        />
      )}
    </div>
  );
};

export default Requirements;
