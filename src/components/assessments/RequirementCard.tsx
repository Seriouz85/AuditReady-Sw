import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Requirement, RequirementStatus } from '@/types';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Save, 
  Clock,
  User,
  Plus
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/services/utils/UnifiedUtilityService';

interface RequirementNote {
  id: string;
  text: string;
  timestamp: string;
  author: string;
  authorId: string;
}

interface RequirementCardProps {
  requirement: Requirement & {
    assessmentNotes?: RequirementNote[];
  };
  readOnly?: boolean;
  isCompleted?: boolean;
  onStatusChange?: (requirementId: string, status: RequirementStatus) => void;
  onNotesChange?: (requirementId: string, notes: RequirementNote[]) => void;
  fullWidth?: boolean;
}

export function RequirementCard({
  requirement,
  readOnly = false,
  isCompleted = false,
  onStatusChange,
  onNotesChange,
  fullWidth = false
}: RequirementCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<RequirementNote[]>(requirement.assessmentNotes || []);
  const [hasUnsavedNote, setHasUnsavedNote] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: RequirementNote = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      author: 'Current User', // This would come from auth context
      authorId: 'user-1'
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote('');
    setHasUnsavedNote(false);
    
    if (onNotesChange) {
      onNotesChange(requirement.id, updatedNotes);
    }
  };


  return (
    <Card className={cn("shadow-sm", fullWidth && "w-full")}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">
              {requirement.code} | {requirement.section}
            </div>
            <CardTitle className="text-base">
              {t(`requirement.${requirement.id}.name`, requirement.name)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={requirement.status} />
            {notes.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                {notes.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-3">
        <p className="text-sm text-muted-foreground mb-3">
          {t(`requirement.${requirement.id}.description`, requirement.description)}
        </p>
        
        {!readOnly && !isCompleted && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`status-${requirement.id}`} className="text-xs">
                {t('assessment.status.label', 'Status')}
              </Label>
              <Select 
                value={requirement.status} 
                onValueChange={(value) => onStatusChange?.(requirement.id, value as RequirementStatus)}
                disabled={readOnly || isCompleted}
              >
                <SelectTrigger id={`status-${requirement.id}`} className="h-8">
                  <SelectValue placeholder={t('assessment.status.placeholder', 'Select status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulfilled">{t('assessment.status.fulfilled')}</SelectItem>
                  <SelectItem value="partially-fulfilled">{t('assessment.status.partial')}</SelectItem>
                  <SelectItem value="not-fulfilled">{t('assessment.status.notFulfilled')}</SelectItem>
                  <SelectItem value="not-applicable">{t('assessment.status.notApplicable')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes Section */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between p-2 h-auto"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notes & Comments
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                {/* Existing Notes */}
                {notes.length > 0 && (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div 
                        key={note.id} 
                        className="p-3 bg-muted/50 rounded-lg text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(note.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Note */}
                {!readOnly && !isCompleted && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note about this requirement..."
                      value={newNote}
                      onChange={(e) => {
                        setNewNote(e.target.value);
                        setHasUnsavedNote(true);
                      }}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Read-only view for completed assessments */}
        {(readOnly || isCompleted) && notes.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between p-2 h-auto mt-3"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View Notes ({notes.length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-2">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 bg-muted/50 rounded-lg text-sm space-y-1"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {note.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{note.text}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}