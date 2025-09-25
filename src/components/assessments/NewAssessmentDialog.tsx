import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Assessment, Standard } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NewAssessmentData {
  name: string;
  description: string;
  standardIds: string[];
  assessorName: string;
  assessorIds: string[];
  isRecurring: boolean;
  recurrenceSettings: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    weekdays: string[];
    skipWeekends: boolean;
    startDate: string;
  };
}

interface NewAssessmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newAssessment: NewAssessmentData;
  onAssessmentChange: (data: Partial<NewAssessmentData>) => void;
  standards: Standard[];
  internalUsers: Array<{ id: string; name: string; email: string; role: string; title?: string; department?: string; }>;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  assessorPopoverOpen: boolean;
  setAssessorPopoverOpen: (open: boolean) => void;
  onCreateAssessment: () => void;
}

export const NewAssessmentDialog: React.FC<NewAssessmentDialogProps> = ({
  isOpen,
  onOpenChange,
  newAssessment,
  onAssessmentChange,
  standards,
  internalUsers,
  popoverOpen,
  setPopoverOpen,
  assessorPopoverOpen,
  setAssessorPopoverOpen,
  onCreateAssessment
}) => {
  const { t } = useTranslation();
  
  // Helper functions to match original logic
  const getStandardNames = (standardIds: string[]) => {
    if (standardIds.length === 0) return "Select standards...";
    return standardIds.map(id => {
      const standard = standards.find(s => s.id === id);
      return standard ? `${standard.name} (${standard.version})` : id;
    }).join(", ");
  };

  const getAssessorNames = (assessorIds: string[]) => {
    if (assessorIds.length === 0) return "Select assessors...";
    return assessorIds.map(id => {
      const user = internalUsers.find(u => u.id === id);
      return user ? user.name : '';
    }).filter(Boolean).join(", ");
  };

  const handleNewAssessmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onAssessmentChange({ [name]: value });
  };

  const handleStandardChange = (standardId: string) => {
    const isSelected = newAssessment.standardIds.includes(standardId);
    if (isSelected) {
      onAssessmentChange({
        standardIds: newAssessment.standardIds.filter(id => id !== standardId)
      });
    } else {
      onAssessmentChange({
        standardIds: [...newAssessment.standardIds, standardId]
      });
    }
  };

  const handleSelectAllStandards = () => {
    if (newAssessment.standardIds.length === standards.length) {
      onAssessmentChange({ standardIds: [] });
    } else {
      onAssessmentChange({ standardIds: standards.map(s => s.id) });
    }
  };

  const handleAssessorChange = (assessorId: string) => {
    const isSelected = newAssessment.assessorIds.includes(assessorId);
    if (isSelected) {
      onAssessmentChange({
        assessorIds: newAssessment.assessorIds.filter(id => id !== assessorId)
      });
    } else {
      onAssessmentChange({
        assessorIds: [...newAssessment.assessorIds, assessorId]
      });
    }
  };

  const handleSelectAllAssessors = () => {
    if (newAssessment.assessorIds.length === internalUsers.length) {
      onAssessmentChange({ assessorIds: [] });
    } else {
      onAssessmentChange({ assessorIds: internalUsers.map(u => u.id) });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                    {getStandardNames(newAssessment.standardIds)}
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
              <Tabs defaultValue="organization" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="organization">Organization Users</TabsTrigger>
                  <TabsTrigger value="manual">External/Manual Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="organization" className="mt-2">
                  <Popover open={assessorPopoverOpen} onOpenChange={setAssessorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={assessorPopoverOpen}
                        className="w-full justify-between"
                      >
                        {getAssessorNames(newAssessment.assessorIds)}
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
                </TabsContent>
                <TabsContent value="manual" className="mt-2">
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter assessor names (comma separated)"
                      value={newAssessment.assessorName}
                      onChange={(e) => {
                        onAssessmentChange({ 
                          assessorName: e.target.value,
                          assessorIds: [] // Clear organization users when using manual entry
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter names separated by commas, e.g., "John Doe, Jane Smith, External Auditor"
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
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
                onValueChange={(value) => onAssessmentChange({ isRecurring: value === 'recurring' })}
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
                        onValueChange={(value: any) => onAssessmentChange({
                          recurrenceSettings: {
                            ...newAssessment.recurrenceSettings,
                            frequency: value
                          }
                        })}
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
                          onChange={(e) => onAssessmentChange({
                            recurrenceSettings: {
                              ...newAssessment.recurrenceSettings,
                              interval: parseInt(e.target.value) || 1
                            }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            const freq = newAssessment.recurrenceSettings.frequency;
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
                      onChange={(e) => onAssessmentChange({
                        recurrenceSettings: {
                          ...newAssessment.recurrenceSettings,
                          startDate: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="skipWeekends"
                      checked={newAssessment.recurrenceSettings.skipWeekends}
                      onCheckedChange={(checked) => onAssessmentChange({
                        recurrenceSettings: {
                          ...newAssessment.recurrenceSettings,
                          skipWeekends: checked as boolean
                        }
                      })}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onCreateAssessment} 
            disabled={!newAssessment.name || newAssessment.standardIds.length === 0 || (newAssessment.assessorIds.length === 0 && !newAssessment.assessorName.trim())}
          >
            {t('assessments.create.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};