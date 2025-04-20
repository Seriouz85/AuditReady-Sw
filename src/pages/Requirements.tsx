import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequirementTable } from "@/components/requirements/RequirementTable";
import { RequirementDetail } from "@/components/requirements/RequirementDetail";
import { requirements, standards, tags } from "@/data/mockData";
import { Requirement, RequirementStatus, TagCategory } from "@/types";
import { ArrowLeft, Filter, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";

const Requirements = () => {
  const [searchParams] = useSearchParams();
  const standardIdFromUrl = searchParams.get("standard");
  const statusFromUrl = searchParams.get("status") as RequirementStatus | null;
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | "all">(
    statusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(statusFromUrl) 
      ? statusFromUrl 
      : "all"
  );
  const [standardFilter, setStandardFilter] = useState<string>(standardIdFromUrl || "all");
  const [typeTagFilter, setTypeTagFilter] = useState<string>("all");
  const [appliesToTagFilter, setAppliesToTagFilter] = useState<string>("all");
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [localRequirements, setLocalRequirements] = useState<Requirement[]>(requirements);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Requirement; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (standardIdFromUrl) {
      setStandardFilter(standardIdFromUrl);
    }

    const newStatusFromUrl = searchParams.get("status") as RequirementStatus | null;
    if (newStatusFromUrl && ['fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'].includes(newStatusFromUrl)) {
      setStatusFilter(newStatusFromUrl);
    }
  }, [searchParams, standardIdFromUrl]);

  const handleSort = (key: keyof Requirement) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRequirements = useMemo(() => {
    let result = [...localRequirements];

    // Apply filters
    result = result.filter((requirement) => {
      const matchesSearch = 
        requirement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requirement.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requirement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || requirement.status === statusFilter;
      const matchesStandard = standardFilter === "all" || requirement.standardId === standardFilter;
      
      const matchesTypeTag = typeTagFilter === "all" || (requirement.tags && requirement.tags.includes(typeTagFilter));
      const matchesAppliesToTag = appliesToTagFilter === "all" || (requirement.tags && requirement.tags.includes(appliesToTagFilter));
      
      return matchesSearch && matchesStatus && matchesStandard && matchesTypeTag && matchesAppliesToTag;
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [localRequirements, searchQuery, statusFilter, standardFilter, typeTagFilter, appliesToTagFilter, sortConfig]);

  const handleRequirementSelect = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
  };

  const handleStatusChange = (id: string, status: RequirementStatus) => {
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, status } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, status });
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

  const handleEvidenceChange = (id: string, evidence: string) => {
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, evidence } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, evidence });
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, notes } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, notes });
    }
  };

  const handleTagsChange = (id: string, newTags: string[]) => {
    setLocalRequirements(
      localRequirements.map((req) => (req.id === id ? { ...req, tags: newTags } : req))
    );
    
    if (selectedRequirement && selectedRequirement.id === id) {
      setSelectedRequirement({ ...selectedRequirement, tags: newTags });
    }
  };

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard ? t(`standard.${id}.name`, standard.name) : id;
  };

  const getTagsByCategory = (category: TagCategory) => {
    return tags.filter(tag => tag.category === category && !tag.parentId);
  };

  const typeTags = getTagsByCategory('type');
  const appliesToTags = getTagsByCategory('applies-to');

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          {selectedRequirement ? (
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRequirement(null)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('requirements.button.back', 'Back to requirements')}
            </Button>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('requirements.button.add', 'Add Requirement')}
          </Button>
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
          
          <Tabs defaultValue="type" className="mb-4">
            <TabsList>
              <TabsTrigger value="type">{t('requirements.tabs.type', 'Type')}</TabsTrigger>
              <TabsTrigger value="applies-to">{t('requirements.tabs.applies_to', 'Applies To')}</TabsTrigger>
            </TabsList>
            <TabsContent value="type" className="pt-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  key="all" 
                  className={`cursor-pointer ${typeTagFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => setTypeTagFilter('all')}
                >
                  All Types
                </Badge>
                {typeTags.map(tag => (
                  <Badge 
                    key={tag.id}
                    style={{ 
                      backgroundColor: typeTagFilter === tag.id ? tag.color : `${tag.color}20`,
                      color: typeTagFilter === tag.id ? 'white' : tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                    className="cursor-pointer border hover:opacity-90"
                    onClick={() => setTypeTagFilter(typeTagFilter === tag.id ? 'all' : tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="applies-to" className="pt-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  key="all" 
                  className={`cursor-pointer ${appliesToTagFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => setAppliesToTagFilter('all')}
                >
                  All Targets
                </Badge>
                {appliesToTags.map(tag => (
                  <Badge 
                    key={tag.id}
                    style={{ 
                      backgroundColor: appliesToTagFilter === tag.id ? tag.color : `${tag.color}20`,
                      color: appliesToTagFilter === tag.id ? 'white' : tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                    className="cursor-pointer border hover:opacity-90"
                    onClick={() => setAppliesToTagFilter(appliesToTagFilter === tag.id ? 'all' : tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <RequirementTable 
            requirements={sortedAndFilteredRequirements} 
            onSelectRequirement={handleRequirementSelect}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </>
      )}
      
      {selectedRequirement && (
        <RequirementDetail 
          requirement={selectedRequirement}
          onStatusChange={handleStatusChange}
          onEvidenceChange={handleEvidenceChange}
          onNotesChange={handleNotesChange}
          onTagsChange={handleTagsChange}
        />
      )}
    </div>
  );
};

export default Requirements;
