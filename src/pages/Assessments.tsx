import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { standards as mockStandards, internalUsers } from "@/data/mockData";
import { StandardsService } from "@/services/standards/StandardsService";
// NOTE: In production, internalUsers would be fetched from Azure Entra ID (formerly Azure AD)
// using Microsoft Graph API: https://graph.microsoft.com/v1.0/users
// This would include real employee data with roles, departments, and permissions
import { assessmentProgressService } from "@/services/assessments/AssessmentProgressService";
import { multiTenantAssessmentService } from "@/services/assessments/MultiTenantAssessmentService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Check, 
  ChevronsUpDown, 
  Search, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  MoreVertical,
  ChevronRight,
  RotateCcw,
  Pin
} from "lucide-react";
import { AssessmentDetail } from "@/components/assessments/AssessmentDetail";
import { Assessment, RecurrenceSettings } from "@/types";
import { toast } from "@/utils/toast";
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface ExtendedAssessment extends Assessment {
  isPinned?: boolean;
}

const Assessments = () => {
  const { organization, isDemo } = useAuth();
  
  // Initialize assessments state
  const [assessments, setAssessments] = useState<ExtendedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<ExtendedAssessment | null>(null);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [assessorPopoverOpen, setAssessorPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [filterRecurring, setFilterRecurring] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [standards, setStandards] = useState(mockStandards); // Start with mock data as fallback
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
    assessorIds: [] as string[], // Multiple assessor IDs
    isRecurring: false,
    recurrenceSettings: {
      frequency: 'monthly' as const,
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
      (filterRecurring === 'recurring' && assessment.isRecurring) ||
      (filterRecurring === 'one-time' && !assessment.isRecurring);
    
    // Debug filtering when recurring is selected
    if (filterRecurring === 'recurring') {
      console.log(`Filter Debug - "${assessment.name}":`, {
        filterRecurring,
        'assessment.isRecurring': assessment.isRecurring,
        'typeof assessment.isRecurring': typeof assessment.isRecurring,
        matchesRecurring
      });
    }
    
    const matchesStatus = filterStatus === 'all' || 
      assessment.status === filterStatus;
    
    return matchesSearch && matchesStandard && matchesRecurring && matchesStatus;
  });

  // Sort assessments - pinned first, then by status and date
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.status !== b.status) {
      const statusOrder = { 'in-progress': 0, 'draft': 1, 'completed': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard?.name || id;
  };
  
  const getStandardNames = (ids: string[]): string => {
    if (ids.length === 0) return '';
    const firstId = ids[0];
    if (!firstId) return '';
    if (ids.length === 1) return getStandardName(firstId);
    return `${getStandardName(firstId)} +${ids.length - 1} more`;
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'in-progress': return <RotateCcw className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
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
        // Keep mock data as fallback if database fetch fails
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
        
        // Debug: Log all assessments and their isRecurring status
        console.log('=== ASSESSMENT DEBUG ===');
        console.log('Total assessments fetched:', fetchedAssessments.length);
        console.log('isDemo:', isDemo);
        fetchedAssessments.forEach((assessment, index) => {
          console.log(`Assessment ${index + 1}:`, {
            name: assessment.name,
            isRecurring: assessment.isRecurring,
            hasRecurrenceSettings: !!assessment.recurrenceSettings
          });
        });
        
        const recurringCount = fetchedAssessments.filter(a => a.isRecurring === true).length;
        const oneTimeCount = fetchedAssessments.filter(a => a.isRecurring === false || a.isRecurring === undefined).length;
        console.log('Recurring assessments (isRecurring === true):', recurringCount);
        console.log('One-time assessments (isRecurring === false or undefined):', oneTimeCount);
        console.log('=== END ASSESSMENT DEBUG ===');
        
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

  const handleContinueAssessment = (assessment: ExtendedAssessment) => {
    setSelectedAssessment(assessment);
  };

  const handleBackToAssessments = () => {
    setSelectedAssessment(null);
  };

  const handleSaveAssessment = async (updatedAssessment: Assessment) => {
    if (!organization) return;

    try {
      // Get updated progress from the service
      const stats = assessmentProgressService.getAssessmentProgress(updatedAssessment);
      const assessmentWithProgress = {
        ...updatedAssessment,
        progress: stats.progress
      };
      
      // Save to database
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
      
      // Update selected assessment if it's the one being saved
      if (selectedAssessment && selectedAssessment.id === updatedAssessment.id) {
        setSelectedAssessment({ ...assessmentWithProgress, ...selectedAssessment });
      }
      
      toast.success(t('assessments.toast.saved'));
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!organization) return;

    try {
      const organizationId = organization.id;
      await multiTenantAssessmentService.deleteAssessment(id, organizationId, isDemo);
      
      setAssessments(assessments.filter(a => a.id !== id));
      setSelectedAssessment(null);
      toast.success(t('assessments.toast.deleted'));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handleCompleteAssessment = async (id: string) => {
    if (!organization) return;

    try {
      const organizationId = organization.id;
      const updatedAssessment = await multiTenantAssessmentService.updateAssessment(
        id,
        {
          status: 'completed',
          endDate: new Date().toISOString(),
          progress: 100
        },
        organizationId,
        isDemo
      );
      
      if (updatedAssessment) {
        const updatedAssessments = assessments.map(a => 
          a.id === id ? { ...updatedAssessment, ...a } : a
        );
        setAssessments(updatedAssessments);
      }
      
      setSelectedAssessment(null);
      toast.success(t('assessments.toast.completed'));
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Failed to complete assessment');
    }
  };

  const handleReopenAssessment = async (id: string) => {
    if (!organization) return;

    try {
      const organizationId = organization.id;
      const updatedAssessment = await multiTenantAssessmentService.updateAssessment(
        id,
        {
          status: 'in-progress'
        },
        organizationId,
        isDemo
      );
      
      if (updatedAssessment) {
        const updatedAssessments = assessments.map(a => 
          a.id === id ? { ...updatedAssessment, ...a } : a
        );
        setAssessments(updatedAssessments);
        // Keep the assessment detail view open
        setSelectedAssessment({ ...updatedAssessment, ...assessments.find(a => a.id === id)! });
      }
      
      toast.success(t('assessments.toast.reopened'));
    } catch (error) {
      console.error('Error reopening assessment:', error);
      toast.error('Failed to reopen assessment');
    }
  };

  const handleTogglePin = async (id: string) => {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment || !organization) return;

    const newPinnedState = !assessment.isPinned;
    
    try {
      // Update in database/localStorage
      const organizationId = organization.id;
      await multiTenantAssessmentService.updateAssessment(
        id,
        { isPinned: newPinnedState },
        organizationId,
        isDemo
      );
      
      // Update local state
      const updatedAssessments = assessments.map(a => 
        a.id === id ? { ...a, isPinned: newPinnedState } : a
      );
      setAssessments(updatedAssessments);
      
      toast.success(newPinnedState ? 'Assessment pinned' : 'Assessment unpinned');
    } catch (error) {
      console.error('Error updating pin state:', error);
      toast.error('Failed to update pin state');
    }
  };

  const handleNewAssessmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAssessment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStandardChange = (standardId: string) => {
    setNewAssessment(prev => {
      // If it's already selected, remove it
      if (prev.standardIds.includes(standardId)) {
        return {
          ...prev,
          standardIds: prev.standardIds.filter(id => id !== standardId)
        };
      } 
      // Otherwise, add it
      return {
        ...prev,
        standardIds: [...prev.standardIds, standardId]
      };
    });
  };

  const handleSelectAllStandards = () => {
    if (newAssessment.standardIds.length === standards.length) {
      // If all are selected, deselect all
      setNewAssessment(prev => ({
        ...prev,
        standardIds: []
      }));
    } else {
      // Otherwise, select all
      setNewAssessment(prev => ({
        ...prev,
        standardIds: standards.map(s => s.id)
      }));
    }
  };

  const calculateNextDueDate = (settings: RecurrenceSettings): Date => {
    const startDate = new Date(settings.startDate);
    const now = new Date();
    let nextDate = new Date(startDate);
    
    // Find the next occurrence based on frequency
    while (nextDate <= now) {
      switch (settings.frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7 * settings.interval);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + settings.interval);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3 * settings.interval);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + settings.interval);
          break;
      }
    }
    
    // Skip weekends if enabled
    if (settings.skipWeekends) {
      const dayOfWeek = nextDate.getDay();
      if (dayOfWeek === 0) { // Sunday
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (dayOfWeek === 6) { // Saturday
        nextDate.setDate(nextDate.getDate() + 2);
      }
    }
    
    return nextDate;
  };

  // Assessor selection handlers
  const handleAssessorChange = (userId: string) => {
    setNewAssessment(prev => {
      const isSelected = prev.assessorIds.includes(userId);
      const newAssessorIds = isSelected 
        ? prev.assessorIds.filter(id => id !== userId)
        : [...prev.assessorIds, userId];
      
      // Update primary assessor name to the first selected user
      const primaryUser = newAssessorIds.length > 0 
        ? internalUsers.find(user => user.id === newAssessorIds[0])
        : null;
      
      return {
        ...prev,
        assessorIds: newAssessorIds,
        assessorName: primaryUser ? primaryUser.name : ''
      };
    });
  };

  const handleSelectAllAssessors = () => {
    if (newAssessment.assessorIds.length === internalUsers.length) {
      // Deselect all
      setNewAssessment(prev => ({
        ...prev,
        assessorIds: [],
        assessorName: ''
      }));
    } else {
      // Select all
      const allUserIds = internalUsers.map(user => user.id);
      const primaryUser = internalUsers[0];
      setNewAssessment(prev => ({
        ...prev,
        assessorIds: allUserIds,
        assessorName: primaryUser ? primaryUser.name : ''
      }));
    }
  };

  const getAssessorNames = (ids: string[]): string => {
    if (ids.length === 0) return '';
    if (ids.length === 1) {
      const user = internalUsers.find(u => u.id === ids[0]);
      return user ? user.name : '';
    }
    const firstUser = internalUsers.find(u => u.id === ids[0]);
    const firstName = firstUser ? firstUser.name : '';
    return `${firstName} +${ids.length - 1} more`;
  };

  const handleCreateAssessment = async () => {
    if (!organization) {
      toast.error('No organization found');
      return;
    }

    // Validate form
    if (!newAssessment.name || newAssessment.standardIds.length === 0 || newAssessment.assessorIds.length === 0) {
      toast.error(t('assessments.toast.fillRequired'));
      return;
    }

    try {
      const organizationId = organization.id;
      
      // Create new assessment using multi-tenant service
      const assessmentData = {
        name: newAssessment.name,
        standardIds: newAssessment.standardIds,
        description: newAssessment.description,
        assessorName: newAssessment.assessorName,
        assessorId: newAssessment.assessorIds[0] || '', // Primary assessor ID
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

      // Add to assessments with extended properties
      const extendedAssessment: ExtendedAssessment = {
        ...createdAssessment,
        isPinned: newAssessment.isRecurring, // Auto-pin recurring assessments
        ...(newAssessment.isRecurring && newAssessment.recurrenceSettings.startDate
          ? { nextDueDate: calculateNextDueDate({
              ...newAssessment.recurrenceSettings,
              startDate: newAssessment.recurrenceSettings.startDate
            }).toISOString() }
          : {})
      };

      setAssessments(prev => [...prev, extendedAssessment]);
      
      // Reset form and close dialog
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
      toast.success(t('assessments.toast.created'));
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  // If an assessment is selected, show its details
  if (selectedAssessment) {
    return (
      <AssessmentDetail 
        assessment={selectedAssessment}
        onBack={handleBackToAssessments}
        onSave={handleSaveAssessment}
        onDelete={() => handleDeleteAssessment(selectedAssessment.id)}
        onComplete={() => handleCompleteAssessment(selectedAssessment.id)}
        onReopen={() => handleReopenAssessment(selectedAssessment.id)}
      />
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title={t('assessments.title')} 
          description={t('assessments.description')}
        />
        
        <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <Plus className="mr-2 h-4 w-4" />
              {t('assessments.new')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('assessments.create.title')}</DialogTitle>
              <DialogDescription>
                {t('assessments.create.description')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('assessments.form.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newAssessment.name}
                  onChange={handleNewAssessmentChange}
                  className="col-span-3"
                  placeholder={t('assessments.form.name.placeholder')}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="standard" className="text-right">
                  {t('assessments.form.standard')} <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between"
                      >
                        {newAssessment.standardIds.length === 0
                          ? "Select standards..."
                          : getStandardNames(newAssessment.standardIds)}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search standards..." />
                        <CommandList>
                          <CommandEmpty>No standards found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={handleSelectAllStandards}
                              className="flex items-center"
                            >
                              <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                                {newAssessment.standardIds.length === standards.length && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <span className="font-medium">Select All</span>
                            </CommandItem>
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            {standards.map((standard) => (
                              <CommandItem
                                key={standard.id}
                                onSelect={() => handleStandardChange(standard.id)}
                                className="flex items-center"
                              >
                                <div className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  newAssessment.standardIds.includes(standard.id) 
                                    ? "bg-primary text-primary-foreground" 
                                    : "opacity-50"
                                )}>
                                  {newAssessment.standardIds.includes(standard.id) && (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                                <span>{standard.name} ({standard.version})</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t('assessments.form.description')}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newAssessment.description}
                  onChange={handleNewAssessmentChange}
                  className="col-span-3"
                  placeholder={t('assessments.form.description.placeholder')}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assessors" className="text-right">
                  {t('assessments.form.assessor')} <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Popover open={assessorPopoverOpen} onOpenChange={setAssessorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={assessorPopoverOpen}
                        className="w-full justify-between"
                      >
                        {newAssessment.assessorIds.length === 0
                          ? "Select assessors..."
                          : getAssessorNames(newAssessment.assessorIds)}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search assessors..." />
                        <CommandList>
                          <CommandEmpty>No assessors found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={handleSelectAllAssessors}
                              className="flex items-center"
                            >
                              <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                                {newAssessment.assessorIds.length === internalUsers.length && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <span className="font-medium">Select All</span>
                            </CommandItem>
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            {internalUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => handleAssessorChange(user.id)}
                                className="flex items-center"
                              >
                                <div className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  newAssessment.assessorIds.includes(user.id) 
                                    ? "bg-primary text-primary-foreground" 
                                    : "opacity-50"
                                )}>
                                  {newAssessment.assessorIds.includes(user.id) && (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.title} • {user.department}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Recurrence Options */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-3">
                  Assessment Type
                </Label>
                <div className="col-span-3 space-y-4">
                  <RadioGroup 
                    value={newAssessment.isRecurring ? 'recurring' : 'one-time'}
                    onValueChange={(value) => setNewAssessment(prev => ({
                      ...prev,
                      isRecurring: value === 'recurring'
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time" className="font-normal cursor-pointer">
                        One-time Assessment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recurring" id="recurring" />
                      <Label htmlFor="recurring" className="font-normal cursor-pointer">
                        Recurring Assessment
                      </Label>
                    </div>
                  </RadioGroup>

                  {newAssessment.isRecurring && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frequency" className="text-sm">Frequency</Label>
                          <Select 
                            value={newAssessment.recurrenceSettings.frequency}
                            onValueChange={(value: any) => setNewAssessment(prev => ({
                              ...prev,
                              recurrenceSettings: {
                                ...prev.recurrenceSettings,
                                frequency: value
                              }
                            }))}
                          >
                            <SelectTrigger id="frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="interval" className="text-sm">Every</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="interval"
                              type="number"
                              min="1"
                              max="12"
                              value={newAssessment.recurrenceSettings.interval}
                              onChange={(e) => setNewAssessment(prev => ({
                                ...prev,
                                recurrenceSettings: {
                                  ...prev.recurrenceSettings,
                                  interval: parseInt(e.target.value) || 1
                                }
                              }))}
                            />
                            <span className="text-sm text-muted-foreground">
                              {(() => {
                                const freq = newAssessment.recurrenceSettings.frequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly';
                                switch (freq) {
                                  case 'weekly': return 'week(s)';
                                  case 'monthly': return 'month(s)';
                                  case 'quarterly': return 'quarter(s)';
                                  case 'yearly': return 'year(s)';
                                  default: return 'period(s)';
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newAssessment.recurrenceSettings.startDate}
                          onChange={(e) => setNewAssessment(prev => ({
                            ...prev,
                            recurrenceSettings: {
                              ...prev.recurrenceSettings,
                              startDate: e.target.value
                            }
                          }))}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="skipWeekends"
                          checked={newAssessment.recurrenceSettings.skipWeekends}
                          onCheckedChange={(checked) => setNewAssessment(prev => ({
                            ...prev,
                            recurrenceSettings: {
                              ...prev.recurrenceSettings,
                              skipWeekends: checked as boolean
                            }
                          }))}
                        />
                        <Label htmlFor="skipWeekends" className="text-sm font-normal cursor-pointer">
                          Skip weekends (Saturday and Sunday)
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAssessmentOpen(false)}>
                {t('assessments.button.cancel')}
              </Button>
              <Button onClick={handleCreateAssessment}>
                {t('assessments.button.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStandard} onValueChange={setFilterStandard}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Standards</SelectItem>
            {standards.map(standard => (
              <SelectItem key={standard.id} value={standard.id}>
                {standard.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRecurring} onValueChange={setFilterRecurring}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessments List - Row Design */}
      <div className="space-y-3">
        {loading && (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {!loading && sortedAssessments.map((assessment) => (
          <Card 
            key={assessment.id} 
            className={cn(
              "group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 relative overflow-hidden",
              assessment.isPinned && "ring-4 ring-primary/30 ring-offset-2 bg-gradient-to-br from-primary/8 to-primary/15 shadow-lg shadow-primary/20 border-primary/20"
            )}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent group-hover:via-primary/5 transition-all duration-300" />
            
            {/* Enhanced Pinned indicator */}
            {assessment.isPinned && (
              <>
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[35px] border-l-transparent border-t-[35px] border-t-primary/40">
                  <Pin className="absolute -top-8 -right-1.5 h-4 w-4 text-primary transform rotate-45 drop-shadow-sm" />
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/10 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/20">
                  <Pin className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Pinned</span>
                </div>
              </>
            )}
            
            <CardContent className="p-2 relative">
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                  onClick={() => handleContinueAssessment(assessment)}
                >
                  {/* Enhanced Status Icon and Progress */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "p-2 rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl",
                        assessment.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                        assessment.status === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                        'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                      )}>
                        {getStatusIcon(assessment.status)}
                      </div>
                      {assessment.isRecurring && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <RotateCcw className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {assessment.progress}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          completion
                        </div>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            assessment.progress === 100 ? 
                            "bg-gradient-to-r from-green-500 to-green-600" :
                            assessment.progress > 0 ?
                            "bg-gradient-to-r from-blue-500 to-blue-600" :
                            "bg-gradient-to-r from-gray-400 to-gray-500"
                          )}
                          style={{ width: `${assessment.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Assessment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {assessment.name}
                      </h3>
                      {assessment.isRecurring && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <User className="h-2.5 w-2.5" />
                        </div>
                        {assessment.assessorNames && assessment.assessorNames.length > 1
                          ? `${assessment.assessorNames[0]} +${assessment.assessorNames.length - 1} more`
                          : assessment.assessorName}
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Calendar className="h-2.5 w-2.5" />
                        </div>
                        {new Date(assessment.startDate).toLocaleDateString()}
                      </span>
                      {assessment.nextDueDate && (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-orange-600" />
                          </div>
                          Next: {new Date(assessment.nextDueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {assessment.standardIds.map(id => (
                        <Badge 
                          key={id} 
                          variant="outline" 
                          className="text-xs border-primary/20 text-primary/80 bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          {getStandardName(id)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Status Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      className={cn(
                        "text-sm font-medium px-4 py-2 rounded-lg shadow-md",
                        assessment.status === 'completed' ? 
                        'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' :
                        assessment.status === 'in-progress' ?
                        'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' :
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0'
                      )}
                    >
                      {assessment.status === 'completed' ? 'Completed' :
                       assessment.status === 'in-progress' ? 'In Progress' :
                       'Draft'}
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="flex items-center gap-2 ml-6">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueAssessment(assessment);
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleTogglePin(assessment.id)}>
                        {assessment.isPinned ? 'Unpin' : 'Pin'} Assessment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteAssessment(assessment.id)}>
                        Delete Assessment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && sortedAssessments.length === 0 && (
          <Card>
            <CardContent className="text-center p-12">
              <h3 className="text-lg font-medium mb-2">{t('assessments.empty.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStandard !== 'all' || filterRecurring !== 'all' || filterStatus !== 'all'
                  ? 'No assessments match your filters'
                  : t('assessments.empty.description')}
              </p>
              <Button onClick={() => setIsNewAssessmentOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('assessments.button.create')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assessments;