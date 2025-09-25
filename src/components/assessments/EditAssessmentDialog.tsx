import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Assessment, Standard } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface ExtendedAssessment extends Assessment {
  standardNames?: string[];
}

interface EditAssessmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingAssessment: ExtendedAssessment | null;
  onAssessmentChange: (assessment: ExtendedAssessment | null) => void;
  standards: Standard[];
  internalUsers: Array<{ id: string; name: string; email: string; role: string; }>;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  assessorPopoverOpen: boolean;
  setAssessorPopoverOpen: (open: boolean) => void;
  onUpdateAssessment: () => void;
}

export const EditAssessmentDialog: React.FC<EditAssessmentDialogProps> = ({
  isOpen,
  onOpenChange,
  editingAssessment,
  onAssessmentChange,
  standards,
  internalUsers,
  popoverOpen,
  setPopoverOpen,
  assessorPopoverOpen,
  setAssessorPopoverOpen,
  onUpdateAssessment
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Assessment</DialogTitle>
          <DialogDescription>
            Update the assessment details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t('assessments.name')}</Label>
            <Input
              id="edit-name"
              placeholder={t('assessments.name.placeholder')}
              value={editingAssessment?.name || ''}
              onChange={(e) => onAssessmentChange(editingAssessment ? {...editingAssessment, name: e.target.value} : null)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description">{t('assessments.description')}</Label>
            <Textarea
              id="edit-description"
              placeholder={t('assessments.description.placeholder')}
              value={editingAssessment?.description || ''}
              onChange={(e) => onAssessmentChange(editingAssessment ? {...editingAssessment, description: e.target.value} : null)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>{t('assessments.standards')}</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {t('assessments.standards.current')}:
              <div className="flex flex-wrap gap-1 mt-1">
                {editingAssessment?.standardIds && editingAssessment.standardIds.length > 0
                  ? editingAssessment.standardIds.map((standardId) => {
                      const standard = standards.find(s => s.id === standardId);
                      return standard ? (
                        <Badge key={standardId} variant="outline" className="text-xs">
                          {standard.name} {standard.version}
                        </Badge>
                      ) : null;
                    })
                  : <span className="text-muted-foreground">{t('assessments.standards.none')}</span>
                }
              </div>
            </div>
            
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="justify-between"
                >
                  {editingAssessment?.standardIds && editingAssessment.standardIds.length > 0
                    ? `${editingAssessment.standardIds.length} standard(s) selected`
                    : t('assessments.standards.placeholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder={t('assessments.standards.search')} />
                  <CommandEmpty>{t('assessments.standards.not-found')}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        if (editingAssessment) {
                          const allStandardIds = standards.map(s => s.id);
                          if (editingAssessment.standardIds.length === standards.length) {
                            // Deselect all
                            onAssessmentChange({...editingAssessment, standardIds: []});
                          } else {
                            // Select all
                            onAssessmentChange({...editingAssessment, standardIds: allStandardIds});
                          }
                        }
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          editingAssessment?.standardIds.length === standards.length ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {t('assessments.standards.select-all')}
                    </CommandItem>
                    {standards.map((standard) => (
                      <CommandItem
                        key={standard.id}
                        onSelect={() => {
                          if (editingAssessment) {
                            const isSelected = editingAssessment.standardIds.includes(standard.id);
                            if (isSelected) {
                              onAssessmentChange({
                                ...editingAssessment,
                                standardIds: editingAssessment.standardIds.filter(id => id !== standard.id)
                              });
                            } else {
                              onAssessmentChange({
                                ...editingAssessment,
                                standardIds: [...editingAssessment.standardIds, standard.id]
                              });
                            }
                          }
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            editingAssessment?.standardIds.includes(standard.id) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {standard.name} {standard.version}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label>{t('assessments.assessor')}</Label>
            <Popover open={assessorPopoverOpen} onOpenChange={setAssessorPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={assessorPopoverOpen}
                  className="justify-between"
                >
                  {editingAssessment?.assessorIds && editingAssessment.assessorIds.length > 0
                    ? `${editingAssessment.assessorIds.length} assessor(s) selected`
                    : t('assessments.assessor.placeholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={t('assessments.assessor.search')} />
                  <CommandEmpty>{t('assessments.assessor.not-found')}</CommandEmpty>
                  <CommandGroup>
                    {internalUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          if (editingAssessment) {
                            const isSelected = editingAssessment.assessorIds?.includes(user.id);
                            if (isSelected) {
                              onAssessmentChange({
                                ...editingAssessment,
                                assessorIds: editingAssessment.assessorIds?.filter(id => id !== user.id) || [],
                                assessorNames: editingAssessment.assessorNames?.filter(name => name !== user.name) || []
                              });
                            } else {
                              onAssessmentChange({
                                ...editingAssessment,
                                assessorIds: [...(editingAssessment.assessorIds || []), user.id],
                                assessorNames: [...(editingAssessment.assessorNames || []), user.name]
                              });
                            }
                          }
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            editingAssessment?.assessorIds?.includes(user.id) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {user.name} ({user.role})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            {editingAssessment?.assessorNames && editingAssessment.assessorNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {editingAssessment.assessorNames.map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                    <button
                      onClick={() => {
                        if (editingAssessment) {
                          const assessorId = editingAssessment.assessorIds?.[index];
                          onAssessmentChange({
                            ...editingAssessment,
                            assessorIds: editingAssessment.assessorIds?.filter(id => id !== assessorId) || [],
                            assessorNames: editingAssessment.assessorNames?.filter(n => n !== name) || []
                          });
                        }
                      }}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpdateAssessment} disabled={!editingAssessment?.name}>
            Update Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};