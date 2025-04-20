import React, { useState, useEffect } from 'react';
// import { useSearchParams } from "react-router-dom"; // Removed unused import
import { Button } from "@/components/ui/button";
// Removed unused Card components
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Removed unused Progress component
// import { Progress } from "@/components/ui/progress"; 
import { assessments as initialAssessments, standards } from "@/data/mockData";
// Removed unused BarChart, Calendar, CheckCircle2, User icons
import { Plus, Check, ChevronsUpDown } from "lucide-react"; 
import { AssessmentDetail } from "@/components/assessments/AssessmentDetail";
import { Assessment } from "@/types";
import { toast } from "@/utils/toast";
import { PageHeader } from '@/components/PageHeader';
import { AssessmentCard } from '@/components/assessments/AssessmentCard';
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
// Removed unused Select components - Assuming they are unused, will verify later if needed
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select";
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
// Removed unused Checkbox component
// import { Checkbox } from "@/components/ui/checkbox"; 
import { cn } from "@/lib/utils";

const Assessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { t } = useTranslation();
  
  // Get standardId from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const standardIdFromUrl = urlParams.get('standardId');
  
  // Filter assessments if a standard is specified in the URL
  const filteredAssessments = standardIdFromUrl 
    ? assessments.filter(a => a.standardIds.includes(standardIdFromUrl))
    : assessments;
  
  // Form state for new assessment
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    standardIds: standardIdFromUrl ? [standardIdFromUrl] : [],
    description: '',
    assessorName: ''
  });

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard ? standard.name : id;
  };
  
  const getStandardNames = (ids: string[]): string => {
    if (ids.length === 0) return '';
    if (ids.length === 1) return getStandardName(ids[0]);
    return `${getStandardName(ids[0])} +${ids.length - 1} more`;
  };

  useEffect(() => {
    if (standardIdFromUrl) {
      setNewAssessment(prev => ({
        ...prev,
        standardIds: [standardIdFromUrl]
      }));
    }
  }, [standardIdFromUrl]);

  const handleContinueAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };

  const handleBackToAssessments = () => {
    setSelectedAssessment(null);
  };

  const handleSaveAssessment = (updatedAssessment: Assessment) => {
    const updatedAssessments = assessments.map(a => 
      a.id === updatedAssessment.id ? updatedAssessment : a
    );
    setAssessments(updatedAssessments);
    toast.success(t('assessments.toast.saved'));
  };

  const handleDeleteAssessment = (id: string) => {
    setAssessments(assessments.filter(a => a.id !== id));
    setSelectedAssessment(null);
    toast.success(t('assessments.toast.deleted'));
  };

  const handleCompleteAssessment = (id: string) => {
    const updatedAssessments = assessments.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'completed', 
        endDate: new Date().toISOString(), 
        progress: 100 
      } as Assessment : a
    );
    setAssessments(updatedAssessments);
    setSelectedAssessment(null);
    toast.success(t('assessments.toast.completed'));
  };

  const handleReopenAssessment = (id: string) => {
    const updatedAssessments = assessments.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'in-progress', 
        endDate: null 
      } as Assessment : a
    );
    setAssessments(updatedAssessments);
    // Keep the assessment detail view open
    setSelectedAssessment(updatedAssessments.find(a => a.id === id) || null);
    toast.success(t('assessments.toast.reopened'));
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

  const handleCreateAssessment = () => {
    // Validate form
    if (!newAssessment.name || newAssessment.standardIds.length === 0 || !newAssessment.assessorName) {
      toast.error(t('assessments.toast.fillRequired'));
      return;
    }

    // Create new assessment
    const now = new Date().toISOString();
    const newId = `assessment-${assessments.length + 1}`;
    
    const createdAssessment: Assessment = {
      id: newId,
      name: newAssessment.name,
      standardIds: newAssessment.standardIds,
      description: newAssessment.description,
      status: 'draft',
      progress: 0,
      startDate: now,
      endDate: null,
      assessorName: newAssessment.assessorName,
      assessorId: 'user-1', // Default user ID
      updatedAt: now,
      createdAt: now
    };

    // Add to assessments
    setAssessments(prev => [...prev, createdAssessment]);
    
    // Reset form and close dialog
    setNewAssessment({
      name: '',
      standardIds: standardIdFromUrl ? [standardIdFromUrl] : [],
      description: '',
      assessorName: ''
    });
    
    setIsNewAssessmentOpen(false);
    toast.success(t('assessments.toast.created'));
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('assessments.new')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
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
                <Label htmlFor="assessor" className="text-right">
                  {t('assessments.form.assessor')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assessor"
                  name="assessorName"
                  value={newAssessment.assessorName}
                  onChange={handleNewAssessmentChange}
                  className="col-span-3"
                  placeholder={t('assessments.form.assessor.placeholder')}
                  required
                />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredAssessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onContinue={() => handleContinueAssessment(assessment)}
          />
        ))}

        {filteredAssessments.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-12 border rounded-xl bg-muted/10">
            <h3 className="text-lg font-medium mb-2">{t('assessments.empty.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {standardIdFromUrl 
                ? t('assessments.empty.standard')
                : t('assessments.empty.description')}
            </p>
            <Button onClick={() => setIsNewAssessmentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('assessments.button.create')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;
