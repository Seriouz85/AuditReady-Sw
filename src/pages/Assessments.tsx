import React, { useState, useEffect } from 'react';
import { standards as mockStandards, internalUsers } from "@/data/mockData";
import { StandardsService } from "@/services/standards/StandardsService";
// NOTE: In production, internalUsers would be fetched from Azure Entra ID (formerly Azure AD)
// using Microsoft Graph API: https://graph.microsoft.com/v1.0/users
// This would include real employee data with roles, departments, and permissions
import { assessmentProgressService } from "@/services/assessments/AssessmentProgressService";
import { multiTenantAssessmentService } from "@/services/assessments/MultiTenantAssessmentService";
import { useAuth } from "@/contexts/AuthContext";
import { AssessmentDetail } from "@/components/assessments/AssessmentDetail";
import { NewAssessmentDialog } from "@/components/assessments/NewAssessmentDialog";
import { EditAssessmentDialog } from "@/components/assessments/EditAssessmentDialog";
import { AssessmentFilters } from "@/components/assessments/AssessmentFilters";
import { AssessmentList } from "@/components/assessments/AssessmentList";
import { Assessment } from "@/types";
import { toast } from "@/utils/toast";
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface ExtendedAssessment extends Assessment {
  isPinned?: boolean;
  standardNames?: string[];
}

const Assessments = () => {
  const { organization, isDemo } = useAuth();
  
  // Initialize assessments state
  const [assessments, setAssessments] = useState<ExtendedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<ExtendedAssessment | null>(null);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<ExtendedAssessment | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [assessorPopoverOpen, setAssessorPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [filterRecurring, setFilterRecurring] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [standards, setStandards] = useState(mockStandards);
  const { t } = useTranslation();
  
  // Get standardId from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const standardIdFromUrl = urlParams.get('standardId');
  
  // Form state for new assessment
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    standardIds: standardIdFromUrl ? [standardIdFromUrl] : [],
    description: '',
    assessorName: '',
    assessorIds: [] as string[],
    isRecurring: false,
    recurrenceSettings: {
      frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
      interval: 1,
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      skipWeekends: true,
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  // Apply filters
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = searchQuery === '' || 
      assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.assessorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStandard = filterStandard === 'all' || 
      assessment.standardIds.includes(filterStandard);
    
    const matchesRecurring = filterRecurring === 'all' || 
      (filterRecurring === 'true' && assessment.isRecurring) ||
      (filterRecurring === 'false' && !assessment.isRecurring);
    
    const matchesStatus = filterStatus === 'all' || 
      assessment.status === filterStatus;
    
    return matchesSearch && matchesStandard && matchesRecurring && matchesStatus;
  });

  // Sort assessments - pinned first, then by selected criteria
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    // Always sort pinned items first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Apply selected sorting
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'date-asc':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'progress-desc':
        return b.progress - a.progress;
      case 'progress-asc':
        return a.progress - b.progress;
      case 'status':
        const statusOrder = { 'in-progress': 0, 'draft': 1, 'completed': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'assessor':
        return a.assessorName.localeCompare(b.assessorName);
      case 'standard':
        const aStandardName = getStandardName(a.standardIds[0] || '');
        const bStandardName = getStandardName(b.standardIds[0] || '');
        return aStandardName.localeCompare(bStandardName);
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard?.name || id;
  };

  // Fetch standards from database
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const standardsService = new StandardsService();
        const availableStandards = await standardsService.getAvailableStandards();
        if (availableStandards.length > 0) {
          setStandards(availableStandards);
        }
      } catch (error) {
        console.error('Error fetching standards from database:', error);
      }
    };

    fetchStandards();
  }, []);

  // Load assessments from database
  useEffect(() => {
    const loadAssessments = async () => {
      if (!organization) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const organizationId = organization.id;
        const fetchedAssessments = await multiTenantAssessmentService.getAssessments(organizationId, isDemo);
        
        // Calculate progress for each assessment
        const assessmentsWithProgress = fetchedAssessments.map(assessment => {
          const stats = assessmentProgressService.getAssessmentProgress(assessment);
          return {
            ...assessment,
            progress: stats.progress
          };
        });

        setAssessments(assessmentsWithProgress);
      } catch (error) {
        console.error('Error loading assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [organization, isDemo]);

  useEffect(() => {
    if (standardIdFromUrl) {
      setNewAssessment(prev => ({
        ...prev,
        standardIds: [standardIdFromUrl]
      }));
    }
  }, [standardIdFromUrl]);

  const handleSelectAssessment = (assessment: ExtendedAssessment) => {
    setSelectedAssessment(assessment);
  };

  const handleBackToAssessments = () => {
    setSelectedAssessment(null);
  };

  const handleSaveAssessment = async (updatedAssessment: Assessment) => {
    if (!organization) return;

    try {
      const stats = assessmentProgressService.getAssessmentProgress(updatedAssessment);
      const assessmentWithProgress = {
        ...updatedAssessment,
        progress: stats.progress
      };
      
      const organizationId = organization.id;
      await multiTenantAssessmentService.updateAssessment(
        updatedAssessment.id,
        assessmentWithProgress,
        organizationId,
        isDemo
      );
      
      const updatedAssessments = assessments.map(a => 
        a.id === updatedAssessment.id ? { ...assessmentWithProgress, ...a } : a
      );
      setAssessments(updatedAssessments);
      
      if (selectedAssessment && selectedAssessment.id === updatedAssessment.id) {
        setSelectedAssessment({ ...assessmentWithProgress, ...selectedAssessment });
      }
      
      toast.success('Assessment saved successfully');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const handleDeleteAssessment = async (assessment: ExtendedAssessment) => {
    if (!organization) return;

    try {
      const organizationId = organization.id;
      await multiTenantAssessmentService.deleteAssessment(assessment.id, organizationId, isDemo);
      
      setAssessments(assessments.filter(a => a.id !== assessment.id));
      setSelectedAssessment(null);
      toast.success('Assessment deleted successfully');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handleEditAssessment = (assessment: ExtendedAssessment) => {
    setEditingAssessment(assessment);
    setIsEditAssessmentOpen(true);
  };

  const handleTogglePin = async (assessment: ExtendedAssessment) => {
    if (!organization) return;

    const newPinnedState = !assessment.isPinned;
    
    try {
      const organizationId = organization.id;
      await multiTenantAssessmentService.updateAssessment(
        assessment.id,
        { isPinned: newPinnedState },
        organizationId,
        isDemo
      );
      
      const updatedAssessments = assessments.map(a => 
        a.id === assessment.id ? { ...a, isPinned: newPinnedState } : a
      );
      setAssessments(updatedAssessments);
      
      toast.success(newPinnedState ? 'Assessment pinned' : 'Assessment unpinned');
    } catch (error) {
      console.error('Error updating pin state:', error);
      toast.error('Failed to update pin state');
    }
  };

  const handleNewAssessmentChange = (data: Partial<typeof newAssessment>) => {
    setNewAssessment(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleCreateAssessment = async () => {
    if (!organization) {
      toast.error('No organization found');
      return;
    }

    const hasAssessors = newAssessment.assessorIds.length > 0 || 
                        (newAssessment.assessorName && newAssessment.assessorName.trim().length > 0);
    
    if (!newAssessment.name || newAssessment.standardIds.length === 0 || !hasAssessors) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const organizationId = organization.id;
      
      const assessmentData = {
        name: newAssessment.name,
        standardIds: newAssessment.standardIds,
        description: newAssessment.description,
        assessorName: newAssessment.assessorName,
        assessorNames: newAssessment.assessorIds.map(id => {
          const user = internalUsers.find(u => u.id === id);
          return user ? user.name : '';
        }).filter(Boolean),
        assessorIds: newAssessment.assessorIds,
        isRecurring: newAssessment.isRecurring,
        recurrenceSettings: newAssessment.isRecurring ? newAssessment.recurrenceSettings : undefined,
        organizationId
      };

      const createdAssessment = await multiTenantAssessmentService.createAssessment(assessmentData, isDemo);

      const extendedAssessment: ExtendedAssessment = {
        ...createdAssessment,
        isPinned: newAssessment.isRecurring
      };

      setAssessments(prev => [...prev, extendedAssessment]);
      
      setNewAssessment({
        name: '',
        standardIds: standardIdFromUrl ? [standardIdFromUrl] : [],
        description: '',
        assessorName: '',
        assessorIds: [],
        isRecurring: false,
        recurrenceSettings: {
          frequency: 'monthly',
          interval: 1,
          weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          skipWeekends: true,
          startDate: new Date().toISOString().split('T')[0]
        }
      });
      
      setIsNewAssessmentOpen(false);
      toast.success('Assessment created successfully');
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  const handleUpdateAssessment = async () => {
    if (!editingAssessment || !organization) return;
    
    if (!editingAssessment.name || editingAssessment.standardIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const organizationId = organization.id;
      
      const updatedData = {
        ...editingAssessment,
        updatedAt: new Date().toISOString()
      };

      await multiTenantAssessmentService.updateAssessment(
        editingAssessment.id,
        updatedData,
        organizationId,
        isDemo
      );

      setAssessments(prev => prev.map(a => 
        a.id === editingAssessment.id ? { ...a, ...updatedData } : a
      ));
      
      setIsEditAssessmentOpen(false);
      setEditingAssessment(null);
      toast.success('Assessment updated successfully');
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast.error('Failed to update assessment');
    }
  };

  // If an assessment is selected, show its details
  if (selectedAssessment) {
    return (
      <AssessmentDetail 
        assessment={selectedAssessment}
        onBack={handleBackToAssessments}
        onSave={handleSaveAssessment}
        onDelete={() => handleDeleteAssessment(selectedAssessment)}
        onComplete={() => {/* handle complete */}}
        onReopen={() => {/* handle reopen */}}
      />
    );
  }


  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Assessments" 
          description="Manage and track your compliance assessments"
        />
        
        <NewAssessmentDialog
          isOpen={isNewAssessmentOpen}
          onOpenChange={setIsNewAssessmentOpen}
          newAssessment={newAssessment}
          onAssessmentChange={handleNewAssessmentChange}
          standards={standards}
          internalUsers={internalUsers}
          popoverOpen={popoverOpen}
          setPopoverOpen={setPopoverOpen}
          assessorPopoverOpen={assessorPopoverOpen}
          setAssessorPopoverOpen={setAssessorPopoverOpen}
          onCreateAssessment={handleCreateAssessment}
        />

        <EditAssessmentDialog
          isOpen={isEditAssessmentOpen}
          onOpenChange={setIsEditAssessmentOpen}
          editingAssessment={editingAssessment}
          onAssessmentChange={setEditingAssessment}
          standards={standards}
          internalUsers={internalUsers}
          popoverOpen={popoverOpen}
          setPopoverOpen={setPopoverOpen}
          assessorPopoverOpen={assessorPopoverOpen}
          setAssessorPopoverOpen={setAssessorPopoverOpen}
          onUpdateAssessment={handleUpdateAssessment}
        />
      </div>
      
      <AssessmentFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterStandard={filterStandard}
        onFilterStandardChange={setFilterStandard}
        filterRecurring={filterRecurring}
        onFilterRecurringChange={setFilterRecurring}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        standards={standards}
        filteredAssessmentsCount={filteredAssessments.length}
        totalAssessmentsCount={assessments.length}
      />

      <div className="mt-6">
        <AssessmentList
          assessments={sortedAssessments}
          standards={standards}
          loading={loading}
          onSelectAssessment={handleSelectAssessment}
          onEditAssessment={handleEditAssessment}
          onDeleteAssessment={handleDeleteAssessment}
          onTogglePin={handleTogglePin}
          onNewAssessment={() => setIsNewAssessmentOpen(true)}
        />
      </div>
    </div>
  );
};

export default Assessments;