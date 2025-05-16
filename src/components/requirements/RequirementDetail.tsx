import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Requirement, RequirementStatus, RequirementPriority } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "@/utils/toast";
import { TagSelector } from "@/components/ui/tag-selector";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FileText, Link, Save, Plus, X, Flag, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RequirementDetailProps {
  requirement: Requirement;
  onStatusChange?: (id: string, status: RequirementStatus) => void;
  onPriorityChange?: (id: string, priority: RequirementPriority) => void;
  onEvidenceChange?: (id: string, evidence: string, evidenceLinks?: string[]) => void;
  onNotesChange?: (id: string, notes: string) => void;
  onTagsChange?: (id: string, tags: string[]) => void;
  onGuidanceChange?: (id: string, guidance: string) => void;
}

interface EvidenceLink {
  url: string;
  description: string;
}

// Extend the Requirement type locally to include legend fields
interface RequirementWithLegend extends Requirement {
  legendReg?: boolean;
  legendCon?: boolean;
  legendBp?: boolean;
  legendRc?: boolean;
}

export function RequirementDetail({
  requirement,
  onStatusChange,
  onPriorityChange,
  onEvidenceChange,
  onNotesChange,
  onTagsChange,
  onGuidanceChange
}: RequirementDetailProps) {
  const req = requirement as RequirementWithLegend;
  const { t } = useTranslation();
  const [evidence, setEvidence] = useState(req.evidence || '');
  const [notes, setNotes] = useState(req.notes || '');
  const [status, setStatus] = useState<RequirementStatus>(req.status);
  const [priority, setPriority] = useState<RequirementPriority>(req.priority || 'default');
  const [tags, setTags] = useState<string[]>(req.tags || []);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([
    { url: '', description: '' }
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [legendReg, setLegendReg] = useState(req.legendReg || false);
  const [legendCon, setLegendCon] = useState(req.legendCon || false);
  const [legendBp, setLegendBp] = useState(req.legendBp || false);
  const [legendRc, setLegendRc] = useState(req.legendRc || false);
  const [justification, setJustification] = useState(requirement.justification || '');
  const [guidance, setGuidance] = useState(req.guidance || '');
  const [showAuditReady, setShowAuditReady] = useState(false);
  
  // Effect to update guidance state if requirement prop changes
  useEffect(() => {
    if (req.guidance) {
      setGuidance(req.guidance);
    }
  }, [req.id, req.guidance]);
  


  const handleStatusChange = (value: RequirementStatus) => {
    setStatus(value);
    setHasChanges(true);
    // If status is not-applicable, require justification
    if (value === 'not-applicable' && !justification) {
      setJustification('');
    }
  };

  const handlePriorityChange = (value: RequirementPriority) => {
    setPriority(value);
    setHasChanges(true);
  };

  const handleEvidenceChange = (value: string) => {
    setEvidence(value);
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasChanges(true);
  };

  const handleEvidenceLinkChange = (index: number, field: 'url' | 'description', value: string) => {
    const newLinks = [...evidenceLinks];
    newLinks[index][field] = value;
    setEvidenceLinks(newLinks);
    setHasChanges(true);
  };

  const addEvidenceLink = () => {
    setEvidenceLinks([...evidenceLinks, { url: '', description: '' }]);
  };

  const removeEvidenceLink = (index: number) => {
    const newLinks = evidenceLinks.filter((_, i) => i !== index);
    setEvidenceLinks(newLinks);
    setHasChanges(true);
  };

  const handleLegendChange = (type: 'reg' | 'con' | 'bp' | 'rc', checked: boolean) => {
    if (type === 'reg') setLegendReg(checked);
    if (type === 'con') setLegendCon(checked);
    if (type === 'bp') setLegendBp(checked);
    if (type === 'rc') setLegendRc(checked);
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    if (onStatusChange) {
      onStatusChange(req.id, status);
    }

    if (onPriorityChange) {
      onPriorityChange(req.id, priority);
    }

    if (onEvidenceChange) {
      // Format links as part of the evidence
      const formattedLinks = evidenceLinks
        .filter(link => link.url.trim())
        .map(link => `[${link.description || link.url}](${link.url})`)
        .join('\n');

      const fullEvidence = evidence + (formattedLinks ? `\n\nLinked Documents:\n${formattedLinks}` : '');
      onEvidenceChange(req.id, fullEvidence);
    }

    if (onNotesChange) {
      onNotesChange(req.id, notes);
    }

    if (onTagsChange) {
      onTagsChange(req.id, tags);
    }

    // Save guidance if handler is provided
    if (onGuidanceChange) {
      onGuidanceChange(req.id, guidance);
    }

    // Save legend fields (if you have a save handler, pass these values)
    req.legendReg = legendReg;
    req.legendCon = legendCon;
    req.legendBp = legendBp;
    req.legendRc = legendRc;
    // Save justification for exclusion if not applicable
    if (status === 'not-applicable') {
      req.justification = justification;
    }
    req.guidance = guidance;
    setHasChanges(false);
    toast.success(t('requirement.toast.updated', "Requirement updated successfully"));
  };
  
  // Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl/Cmd+S is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        if (hasChanges && !(status === 'not-applicable' && justification.trim() === '')) {
          handleSaveAll();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasChanges, status, justification]);

  return (
    <>
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {requirement.section} | {requirement.code}
            </div>
            <CardTitle>{t(`requirement.${requirement.id}.name`, requirement.name)}</CardTitle>
            <CardDescription>
              {requirement.standardId === 'cis-ig2' && 'CIS Controls IG2 - v8.1'}
              {requirement.standardId === 'cis-ig1' && 'CIS Controls IG1 - v8.1'}
              {requirement.standardId === 'cis-ig3' && 'CIS Controls IG3 - v8.1'}
              {requirement.standardId !== 'cis-ig2' && requirement.standardId !== 'cis-ig1' && requirement.standardId !== 'cis-ig3' && t(`standard.${requirement.standardId}.name`, requirement.standardId)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">{t('requirement.field.description', 'Description')}</h3>
          <p className="text-sm text-muted-foreground">
            {t(`requirement.${requirement.id}.description`, requirement.description)}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">{t('requirement.field.guidance', 'Guidance')}</h3>
            {requirement.auditReadyGuidance && requirement.auditReadyGuidance.trim() !== '' && (
              <Button
                variant="outline"
                className="ml-2 px-3 py-1 text-emerald-700 border-emerald-600 hover:bg-emerald-50"
                onClick={() => setShowAuditReady(true)}
              >
                AuditReady guidance
              </Button>
            )}
          </div>
          <Textarea
            value={guidance}
            onChange={e => { setGuidance(e.target.value); setHasChanges(true); }}
            placeholder="Write your own guidance or notes for this requirement..."
            className="min-h-[100px] overflow-hidden"
            style={{ height: 'auto' }}
            onInput={(e) => {
              // Auto-resize the textarea to fit content
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            ref={(textareaRef) => {
              // Initialize height on component mount and when value changes
              if (textareaRef) {
                setTimeout(() => {
                  textareaRef.style.height = 'auto';
                  textareaRef.style.height = `${textareaRef.scrollHeight}px`;
                }, 0);
              }
            }}
          />
        </div>

        {/* AuditReady guidance modal */}
        {showAuditReady && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setShowAuditReady(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 p-8 rounded-lg max-w-3xl w-full shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl"
                onClick={() => setShowAuditReady(false)}
              >
                &times;
              </button>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">AuditReady guidance</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-3 py-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    // Get bullet points and manually strip any existing dashes or bullet prefixes
                    const bulletElements = document.querySelectorAll('.prose ul li');
                    
                    // Get bullet points and manually strip any existing dashes or bullet prefixes
                    const bullets = Array.from(bulletElements)
                      .map(el => {
                        // Remove any leading dash, bullet, or asterisk with whitespace
                        let text = el.textContent || '';
                        return text.replace(/^[-•*]\s+/, '').trim();
                      })
                      .filter(text => text.length > 0) // Remove empty lines
                      .join('\n• '); // Join with bullet points for better readability
                    
                    // Format the guidance with just the Implementation section and proper bullet formatting
                    const formattedGuidance = bullets.length > 0 ? 
                      `Implementation:\n\n• ${bullets}` : 
                      'No implementation guidance available.';
                    
                    setGuidance(formattedGuidance);
                    setHasChanges(true);
                    toast.success("Guidance applied to requirement");
                    setShowAuditReady(false);
                  }}
                >
                  Apply to Requirement
                </Button>
              </div>
              <div className="prose dark:prose-invert max-w-none max-h-[70vh] overflow-y-auto w-full px-3">
                {(() => {
                  const content = requirement.auditReadyGuidance || 'No guidance available.';
                  
                  if (!content || content.trim() === '' || content === 'No guidance available.') {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No AuditReady guidance is available for this requirement.</p>
                      </div>
                    );
                  }
                  
                  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                  const implIdx = lines.findIndex(l =>
                    l.toLowerCase().includes('implementation') ||
                    l.includes('**Implementation**')
                  );
                  const bulletPoints: string[] = [];
                  if (implIdx >= 0) {
                    for (let i = implIdx + 1; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (line.length > 0 &&
                          !line.toLowerCase().includes('implementation') &&
                          !line.includes('**Implementation**')) {
                        const cleanedLine = line
                          .replace(/^[•*]+ */, '')
                          .replace(/^- */, '')
                          .trim();
                        if (cleanedLine && !bulletPoints.includes(cleanedLine)) {
                          bulletPoints.push(cleanedLine);
                        }
                      }
                    }
                  }
                  return (
                    <>
                      <div>
                        <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">Implementation</h4>
                        {bulletPoints.length > 0 ? (
                          <ul className="list-disc pl-6 space-y-3">
                            {bulletPoints.map((point, idx) => (
                              <li key={idx} className="text-base">{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No implementation details available.</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <TagSelector
            selectedTags={tags}
            onChange={handleTagsChange}
            className="min-h-[40px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="status">{t('requirement.field.status', 'Compliance Status')}</Label>
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('requirement.status.placeholder', 'Select status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulfilled">{t('assessment.status.fulfilled', 'Fulfilled')}</SelectItem>
                <SelectItem value="partially-fulfilled">{t('assessment.status.partial', 'Partially Fulfilled')}</SelectItem>
                <SelectItem value="not-fulfilled">{t('assessment.status.notFulfilled', 'Not Fulfilled')}</SelectItem>
                <SelectItem value="not-applicable">{t('assessment.status.notApplicable', 'Not Applicable')}</SelectItem>
              </SelectContent>
            </Select>
            {/* Justification for exclusion if Not Applicable */}
            {status === 'not-applicable' && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="justification" className="text-red-600 font-semibold">Justification for exclusion <span className="text-red-500">*</span></Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setJustification(e.target.value); setHasChanges(true); }}
                  placeholder="Provide a justification for why this requirement is not applicable."
                  rows={3}
                  required
                />
                {justification.trim() === '' && (
                  <div className="text-xs text-red-500">Justification is required when marking as Not Applicable.</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="priority" className="flex items-center gap-1">
                <Flag size={14} className="text-muted-foreground" />
                {t('requirement.field.priority', 'Priority')}
              </Label>
            </div>
            <Select value={priority} onValueChange={handlePriorityChange}>
              <SelectTrigger id="priority">
                <SelectValue placeholder={t('requirement.priority.placeholder', 'Select priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend for Control Inclusion */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-semibold">Legend for Control Inclusion</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center cursor-pointer text-blue-600"><Info size={16} /></span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <div className="mb-1 font-semibold">Legend Definitions:</div>
                  <ul className="list-disc ml-4">
                    <li><b>REG</b>: The control is related to a regulatory or certification requirement</li>
                    <li><b>CON</b>: The control is required due to contractual obligations</li>
                    <li><b>BP</b>: The control is needed according to best practices</li>
                    <li><b>RC</b>: The control is needed to mitigate inherent risk to control objectives</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={legendReg} onChange={e => handleLegendChange('reg', e.target.checked)} />
              REG <span className="text-xs text-muted-foreground">(Regulatory/Certification)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={legendCon} onChange={e => handleLegendChange('con', e.target.checked)} />
              CON <span className="text-xs text-muted-foreground">(Contractual)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={legendBp} onChange={e => handleLegendChange('bp', e.target.checked)} />
              BP <span className="text-xs text-muted-foreground">(Best Practice)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={legendRc} onChange={e => handleLegendChange('rc', e.target.checked)} />
              RC <span className="text-xs text-muted-foreground">(Risk Control)</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="evidence">{t('requirement.field.evidence', 'Evidence')}</Label>
          </div>
          <Textarea
            id="evidence"
            placeholder={t('requirement.field.evidence.placeholder', 'Document evidence of compliance...')}
            value={evidence}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEvidenceChange(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <FileText size={14} className="mr-1" />
            {t('requirement.field.linkedDocuments', 'Linked Documents')}
          </Label>
          <div className="space-y-3">
            {evidenceLinks.map((link, index) => (
              <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-start">
                <div>
                  <Label htmlFor={`link-url-${index}`} className="sr-only">Document URL</Label>
                  <div className="flex">
                    <div className="bg-muted p-2 border border-r-0 rounded-l-md">
                      <Link size={16} className="text-muted-foreground" />
                    </div>
                    <Input
                      id={`link-url-${index}`}
                      placeholder="Document URL"
                      value={link.url}
                      onChange={(e) => handleEvidenceLinkChange(index, 'url', e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={link.description}
                  onChange={(e) => handleEvidenceLinkChange(index, 'description', e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeEvidenceLink(index)}
                  disabled={evidenceLinks.length === 1 && !link.url && !link.description}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addEvidenceLink}
              className="flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add Document Link
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="notes">{t('requirement.field.notes', 'Notes')}</Label>
          </div>
          <Textarea
            id="notes"
            placeholder={t('requirement.field.notes.placeholder', 'Add notes or comments...')}
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSaveAll}
          disabled={!hasChanges || (status === 'not-applicable' && justification.trim() === '')}
        >
          <Save size={16} className="mr-2" />
          {t('requirement.button.saveAllChanges', 'Save All Changes')}
        </Button>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-end text-sm text-muted-foreground">
          <div>Responsible: {requirement.responsibleParty || 'Unassigned'}</div>
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
