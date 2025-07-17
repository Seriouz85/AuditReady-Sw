import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequirementTable } from "@/components/requirements/RequirementTable";
import { RequirementDetail } from "@/components/requirements/RequirementDetail";
// Removed mock data import - using real data from service
import { Requirement, RequirementStatus, RequirementPriority } from "@/types";
import { ArrowLeft, Filter, Plus, Search, Flag, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useTranslation } from "@/lib/i18n";
import { useRequirementsService, RequirementWithStatus } from "@/services/requirements/RequirementsService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useRequirementsRealTime } from "@/hooks/useRequirementsRealTime";
import { RequirementsRealTimeService } from "@/services/requirements/RequirementsRealTimeService";
import { RequirementCollaborationIndicators } from "@/components/requirements/RequirementCollaborationIndicators";
import { RequirementConflictResolver } from "@/components/requirements/RequirementConflictResolver";
import { ConflictResolution } from "@/services/requirements/RequirementsService";

const Requirements = () => {
  const [searchParams] = useSearchParams();
  const standardIdFromUrl = searchParams.get("standard");
  const statusFromUrl = searchParams.get("status") as RequirementStatus | null;
  const priorityFromUrl = searchParams.get("priority") as RequirementPriority | null;
  const { t } = useTranslation();
  const { isDemo, organization } = useAuth();
  const requirementsService = useRequirementsService();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | "all">(
    statusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(statusFromUrl) 
      ? statusFromUrl 
      : "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<RequirementPriority | "all">(
    priorityFromUrl && ['default', 'low', 'medium', 'high'].includes(priorityFromUrl)
      ? priorityFromUrl
      : "all"
  );
  const [standardFilter, setStandardFilter] = useState<string>(standardIdFromUrl || "all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementWithStatus | null>(null);
  const [localRequirements, setLocalRequirements] = useState<RequirementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [standards, setStandards] = useState<any[]>([]);
  const [unifiedCategories, setUnifiedCategories] = useState<any[]>([]);
  const [conflictToResolve, setConflictToResolve] = useState<ConflictResolution | null>(null);
  const [collaborationSessionId, setCollaborationSessionId] = useState<string | null>(null);

  // Color function for consistent category colors - matches RequirementTable logic
  const getCategoryColor = (categoryName: string): string => {
    // Same color array as RequirementTable for consistency
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
    
    // Use hash of category name for consistent color assignment (same logic as RequirementTable)
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Initialize real-time service
  const realTimeService = RequirementsRealTimeService.getInstance();
  
  // Get real-time data
  const {
    requirements: realTimeRequirements,
    activeUsers,
    recentActivities,
    isConnected,
    conflictedRequirements,
    startCollaboration,
    endCollaboration,
    resolveConflict,
    refreshRequirements
  } = useRequirementsRealTime({
    organizationId: organization?.id || '',
    standardId: standardFilter !== 'all' ? standardFilter : undefined,
    enabled: !isDemo
  });

  // Load requirements data
  useEffect(() => {
    loadRequirements();
  }, [standardFilter]);

  // Load standards and unified categories
  useEffect(() => {
    loadStandardsAndCategories();
  }, []);

  // Handle URL params
  useEffect(() => {
    if (standardIdFromUrl) {
      setStandardFilter(standardIdFromUrl);
    }

    const newStatusFromUrl = searchParams.get("status") as RequirementStatus | null;
    if (newStatusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(newStatusFromUrl)) {
      setStatusFilter(newStatusFromUrl);
    }
    
    const newPriorityFromUrl = searchParams.get("priority") as RequirementPriority | null;
    if (newPriorityFromUrl && ['default', 'low', 'medium', 'high'].includes(newPriorityFromUrl)) {
      setPriorityFilter(newPriorityFromUrl);
    }
    
    // Start collaboration session when viewing requirements
    if (!isDemo && organization?.id) {
      handleStartCollaboration('viewing');
    }
  }, [searchParams, standardIdFromUrl, isDemo]);
  
  // Clean up collaboration session on unmount
  useEffect(() => {
    return () => {
      if (collaborationSessionId) {
        endCollaboration(collaborationSessionId);
      }
    };
  }, [collaborationSessionId, endCollaboration]);
  
  // Monitor for conflicts
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

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const requirementsData = await requirementsService.getRequirements(
        standardFilter !== "all" ? standardFilter : undefined
      );
      setLocalRequirements(requirementsData);
      
      // Show helpful message for first-time users
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
      if (isDemo) {
        // Load demo standards
        const { standards: demoStandards } = await import('@/data/mockData');
        setStandards(demoStandards);
        // Set demo unified categories
        setUnifiedCategories([
          { id: '1', name: 'Governance & Leadership', sort_order: 1 },
          { id: '2', name: 'Risk Management', sort_order: 2 },
          { id: '3', name: 'Inventory and Control of Software Assets', sort_order: 3 },
          { id: '4', name: 'Inventory and Control of Hardware Assets', sort_order: 4 },
          { id: '5', name: 'Identity & Access Management', sort_order: 5 },
          { id: '6', name: 'Data Protection', sort_order: 6 },
          { id: '7', name: 'Secure Configuration of Hardware and Software', sort_order: 7 },
          { id: '8', name: 'Vulnerability Management', sort_order: 8 },
          { id: '9', name: 'Physical & Environmental Security Controls', sort_order: 9 },
          { id: '10', name: 'Network Infrastructure Management', sort_order: 10 },
          { id: '11', name: 'Secure Software Development', sort_order: 11 },
          { id: '12', name: 'Network Monitoring & Defense', sort_order: 12 },
          { id: '13', name: 'Supplier & Third-Party Risk Management', sort_order: 13 },
          { id: '14', name: 'Security Awareness & Skills Training', sort_order: 14 },
          { id: '15', name: 'Business Continuity & Disaster Recovery Management', sort_order: 15 },
          { id: '16', name: 'Incident Response Management', sort_order: 16 },
          { id: '17', name: 'Malware Defenses', sort_order: 17 },
          { id: '18', name: 'Email & Web Browser Protections', sort_order: 18 },
          { id: '19', name: 'Penetration Testing', sort_order: 19 },
          { id: '20', name: 'Audit Log Management', sort_order: 20 },
          { id: '21', name: 'GDPR Unified Compliance', sort_order: 21 }
        ]);
      } else {
        // Load from Supabase
        const [standardsResponse, categoriesResponse] = await Promise.all([
          supabase.from('standards').select('id, name, version, description, type, is_active').eq('is_active', true).order('name'),
          supabase.from('unified_compliance_categories').select('id, name, description, sort_order, is_active').eq('is_active', true).order('sort_order')
        ]);

        if (standardsResponse.data) {
          setStandards(standardsResponse.data);
        }
        if (categoriesResponse.data) {
          setUnifiedCategories(categoriesResponse.data);
        }
      }
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

  // Real-time collaboration handlers
  const handleStartCollaboration = async (actionType: 'viewing' | 'editing' | 'commenting') => {
    if (isDemo) return;
    
    try {
      const sessionId = await realTimeService.startCollaboration(
        organization?.id || '',
        'general', // General collaboration for the page
        '', // User ID will be handled by the service
        actionType
      );
      if (sessionId) {
        setCollaborationSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error starting collaboration:', error);
    }
  };

  const handleConflictResolve = async (conflict: ConflictResolution) => {
    try {
      await resolveConflict(conflict.requirementId, conflict.resolution || 'keep_remote');
      setConflictToResolve(null);
      
      // Refresh requirements after conflict resolution
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
    try {
      // Show saving state
      setSaveStatus('saving');
      
      // Start editing collaboration
      if (!isDemo) {
        await handleStartCollaboration('editing');
      }
      
      let result;
      
      if (!isDemo) {
        // Use real-time service for conflict detection
        const currentReq = localRequirements.find(r => r.id === requirementId);
        result = await realTimeService.updateRequirementWithConflictDetection(
          organization?.id || '',
          requirementId,
          updates,
          {
            expectedVersion: currentReq?.version,
            optimisticUpdate: true
          }
        );
        
        // Handle conflicts
        if (result.conflict) {
          setConflictToResolve(result.conflict);
          setSaveStatus('error');
          return;
        }
      } else {
        // Fallback to regular service for demo mode
        result = await requirementsService.updateRequirement(requirementId, updates);
      }
      
      if (result.success) {
        // Update local state
        setLocalRequirements(prev => prev.map(req => 
          req.id === requirementId 
            ? { 
                ...req, 
                status: (updates.status as any) || req.status,
                organizationStatus: updates.status || req.organizationStatus,
                fulfillmentPercentage: updates.fulfillmentPercentage ?? req.fulfillmentPercentage,
                evidence: updates.evidence ?? req.evidence,
                notes: updates.notes ?? req.notes,
                responsibleParty: updates.responsibleParty ?? req.responsibleParty,
                organizationTags: updates.tags ?? req.organizationTags,
                riskLevel: updates.riskLevel ?? req.riskLevel,
                lastUpdated: new Date().toISOString(),
                version: result.data?.version || req.version
              }
            : req
        ));
        setSaveStatus('saved');
        toast.success(
          isDemo 
            ? 'Changes saved locally (demo mode)' 
            : 'Requirement updated successfully'
        );
        
        // Reset save status after delay
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        toast.error(result.error || 'Failed to update requirement');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      setSaveStatus('error');
      toast.error('Failed to update requirement');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const sortedAndFilteredRequirements = useMemo(() => {
    // First deduplicate by ID to prevent React key errors
    const seen = new Set();
    const deduplicatedRequirements = localRequirements.filter(req => {
      if (seen.has(req.id)) {
        return false;
      }
      seen.add(req.id);
      return true;
    });
    
    let result = [...deduplicatedRequirements];

    // Apply filters
    result = result.filter((requirement) => {
      const matchesSearch = 
        requirement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requirement.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requirement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || requirement.status === statusFilter;
      const matchesStandard = standardFilter === "all" || requirement.standardId === standardFilter;
      const matchesPriority = priorityFilter === "all" || requirement.priority === priorityFilter;
      
      const matchesCategory = categoryFilter === "all" || 
        (requirement.tags && requirement.tags.includes(categoryFilter)) ||
        (requirement.categories && requirement.categories.includes(categoryFilter)) ||
        (requirement.categories && requirement.categories.some(cat => {
          // Check if category name matches the filter (for demo data)
          const category = unifiedCategories.find(uc => uc.name === cat);
          return category && category.id === categoryFilter;
        }));
      
      return matchesSearch && matchesStatus && matchesStandard && matchesPriority && matchesCategory;
    });

    // Apply sorting
    if (sortConfig) {
      result = result.slice().sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        // Handle null/undefined values
        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        let comparison = 0;
        
        // Handle different data types with proper comparison
        if (sortConfig.key === 'lastAssessmentDate') {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue).getTime();
          comparison = aDate - bDate;
        } else if (sortConfig.key === 'priority') {
          const priorityOrder = { 'default': 0, 'low': 1, 'medium': 2, 'high': 3 };
          const aPriority = priorityOrder[aValue as keyof typeof priorityOrder] ?? 0;
          const bPriority = priorityOrder[bValue as keyof typeof priorityOrder] ?? 0;
          comparison = aPriority - bPriority;
        } else {
          // String comparison (case insensitive)
          comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [localRequirements, searchQuery, statusFilter, standardFilter, priorityFilter, categoryFilter, sortConfig]);

  const handleRequirementSelect = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
  };

  const handleStatusChange = async (id: string, status: RequirementStatus) => {
    await handleUpdateRequirement(id, { status });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, status, organizationStatus: status });
    }
  };
  
  const handlePriorityChange = async (id: string, priority: RequirementPriority) => {
    // Note: Priority is typically a master template property, not organization-specific
    // For now, we'll update local state only for UI consistency
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, priority } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, priority });
    }
  };

  const handleFilterChange = (status: RequirementStatus | "all") => {
    // Update URL parameters when status filter changes
    const newSearchParams = new URLSearchParams(searchParams);
    if (status === 'all') {
      newSearchParams.delete('status');
    } else {
      newSearchParams.set('status', status);
    }
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
  };
  
  const handlePriorityFilterChange = (priority: RequirementPriority | "all") => {
    // Update URL parameters when priority filter changes
    const newSearchParams = new URLSearchParams(searchParams);
    if (priority === 'all') {
      newSearchParams.delete('priority');
    } else {
      newSearchParams.set('priority', priority);
    }
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
  };

  const handleEvidenceChange = (id: string, evidence: string) => {
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, evidence } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, evidence });
    }
  };

  const handleNotesChange = async (id: string, notes: string) => {
    await handleUpdateRequirement(id, { notes });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, notes });
    }
  };

  const handleTagsChange = async (id: string, newTags: string[]) => {
    await handleUpdateRequirement(id, { tags: newTags });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, tags: newTags, organizationTags: newTags });
    }
  };

  const handleCategoriesChange = async (id: string, newCategories: string[]) => {
    await handleUpdateRequirement(id, { categories: newCategories });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, categories: newCategories });
    }
  };

  const handleAppliesToChange = async (id: string, newAppliesTo: string[]) => {
    await handleUpdateRequirement(id, { appliesTo: newAppliesTo });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, appliesTo: newAppliesTo });
    }
  };
  
  const handleGuidanceChange = async (id: string, guidance: string) => {
    // Guidance might be stored as evidence or notes depending on the implementation
    await handleUpdateRequirement(id, { guidance: guidance });
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, guidance: guidance });
    }
  };

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard ? t(`standard.${id}.name`, standard.name) : id;
  };


  // Set sample priorities for demonstration
  useEffect(() => {
    // Only set priorities if requirements exist and not already set
    if (localRequirements.length > 0) {
      const needsPriorities = localRequirements.some(req => !req.priority);
      
      if (needsPriorities) {
        const prioritizedRequirements = localRequirements.map((req, index) => {
          if (req.priority) return req;
          
          // Set some sample priorities for demonstration
          let priority: RequirementPriority = 'default';
          if (index % 10 === 0) priority = 'high';
          else if (index % 5 === 0) priority = 'medium';
          else if (index % 3 === 0) priority = 'low';
          
          return { ...req, priority };
        });
        
        setLocalRequirements(prioritizedRequirements);
      }
    }
  }, [localRequirements.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  realTimeStatus === 'connected' ? 'bg-green-500' : 
                  realTimeStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {realTimeStatus === 'connected' ? 'Live' : 
                   realTimeStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
                </span>
              </div>
            )}
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('requirements.button.add', 'Add Requirement')}
            </Button>
          </div>
        )}
      </div>
      
      {!selectedRequirement && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('requirements.search.placeholder', 'Search requirements...')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as RequirementStatus | "all");
                  handleFilterChange(value as RequirementStatus | "all");
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('requirements.filter.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('requirements.filter.all_statuses', 'All Statuses')}</SelectItem>
                  <SelectItem value="fulfilled">{t('assessment.status.fulfilled', 'Fulfilled')}</SelectItem>
                  <SelectItem value="partially-fulfilled">{t('assessment.status.partial', 'Partially Fulfilled')}</SelectItem>
                  <SelectItem value="not-fulfilled">{t('assessment.status.notFulfilled', 'Not Fulfilled')}</SelectItem>
                  <SelectItem value="not-applicable">{t('assessment.status.notApplicable', 'Not Applicable')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={priorityFilter}
                onValueChange={(value) => {
                  setPriorityFilter(value as RequirementPriority | "all");
                  handlePriorityFilterChange(value as RequirementPriority | "all");
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Flag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('requirements.filter.priority', 'Priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              {standardIdFromUrl === null && (
                <Select 
                  value={standardFilter}
                  onValueChange={setStandardFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t('requirements.filter.standard', 'Standard')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('requirements.filter.all_standards', 'All Standards')}</SelectItem>
                    {standards.map((standard) => (
                      <SelectItem key={standard.id} value={standard.id}>
                        {t(`standard.${standard.id}.name`, standard.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-3">{t('requirements.filter.category', 'Filter by Category')}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                key="all" 
                className={`cursor-pointer transition-colors ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                onClick={() => setCategoryFilter('all')}
              >
                All Categories
              </Badge>
              {unifiedCategories.map(category => (
                <Badge 
                  key={category.id}
                  className={`cursor-pointer transition-colors border ${
                    categoryFilter === category.id 
                      ? getCategoryColor(category.name) 
                      : getCategoryColor(category.name) + ' opacity-60 hover:opacity-80'
                  }`}
                  onClick={() => setCategoryFilter(categoryFilter === category.id ? 'all' : category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <RequirementTable 
            requirements={sortedAndFilteredRequirements} 
            onSelectRequirement={handleRequirementSelect}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </>
      )}
      
      {selectedRequirement && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRequirement(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('requirements.button.back', 'Back to requirements')}
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(selectedRequirement.updatedAt).toLocaleString()}
              </div>
              <Button 
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => {
                  document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 's',
                    ctrlKey: navigator.platform.includes('Win'),
                    metaKey: navigator.platform.includes('Mac'),
                  }));
                }}
              >
                <Save size={14} className="mr-1" />
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
            onEvidenceChange={handleEvidenceChange}
            onNotesChange={handleNotesChange}
            onTagsChange={handleTagsChange}
            onCategoriesChange={handleCategoriesChange}
            onAppliesToChange={handleAppliesToChange}
            onGuidanceChange={handleGuidanceChange}
          />
        </>
      )}

      {/* Conflict Resolution Dialog */}
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
