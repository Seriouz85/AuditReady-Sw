import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Requirement, RequirementStatus } from "@/types";
import { useState } from "react";
import { toast } from "@/utils/toast";
import { TagSelector } from "@/components/ui/tag-selector";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FileText, Link, ExternalLink, Save, Plus, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface RequirementDetailProps {
  requirement: Requirement;
  onStatusChange?: (id: string, status: RequirementStatus) => void;
  onEvidenceChange?: (id: string, evidence: string, evidenceLinks?: string[]) => void;
  onNotesChange?: (id: string, notes: string) => void;
  onTagsChange?: (id: string, tags: string[]) => void;
}

interface EvidenceLink {
  url: string;
  description: string;
}

export function RequirementDetail({ 
  requirement,
  onStatusChange,
  onEvidenceChange,
  onNotesChange,
  onTagsChange
}: RequirementDetailProps) {
  const { t } = useTranslation();
  const [evidence, setEvidence] = useState(requirement.evidence || '');
  const [notes, setNotes] = useState(requirement.notes || '');
  const [status, setStatus] = useState<RequirementStatus>(requirement.status);
  const [tags, setTags] = useState<string[]>(requirement.tags || []);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([
    { url: '', description: '' }
  ]);
  const [hasChanges, setHasChanges] = useState(false);

  const handleStatusChange = (value: RequirementStatus) => {
    setStatus(value);
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

  const handleSaveAll = () => {
    if (onStatusChange) {
      onStatusChange(requirement.id, status);
    }
    
    if (onEvidenceChange) {
      // Format links as part of the evidence
      const formattedLinks = evidenceLinks
        .filter(link => link.url.trim())
        .map(link => `[${link.description || link.url}](${link.url})`)
        .join('\n');
      
      const fullEvidence = evidence + (formattedLinks ? `\n\nLinked Documents:\n${formattedLinks}` : '');
      onEvidenceChange(requirement.id, fullEvidence);
    }
    
    if (onNotesChange) {
      onNotesChange(requirement.id, notes);
    }
    
    if (onTagsChange) {
      onTagsChange(requirement.id, tags);
    }
    
    setHasChanges(false);
    toast.success(t('requirement.toast.updated', "Requirement updated successfully"));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {requirement.code} | {requirement.section}
            </div>
            <CardTitle>{t(`requirement.${requirement.id}.name`, requirement.name)}</CardTitle>
            <CardDescription>
              {t(`standard.${requirement.standardId}.name`, requirement.standardId)}
            </CardDescription>
          </div>
          <StatusBadge status={status} />
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
          <h3 className="text-sm font-medium mb-2">{t('requirement.field.guidance', 'Guidance')}</h3>
          <p className="text-sm text-muted-foreground">
            {t(`requirement.${requirement.id}.guidance`, requirement.guidance)}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <TagSelector 
            selectedTags={tags} 
            onChange={handleTagsChange} 
            className="min-h-[40px]"
          />
        </div>
        
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
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="evidence">{t('requirement.field.evidence', 'Evidence')}</Label>
          </div>
          <Textarea
            id="evidence"
            placeholder={t('requirement.field.evidence.placeholder', 'Document evidence of compliance...')}
            value={evidence}
            onChange={(e) => handleEvidenceChange(e.target.value)}
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
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
          />
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleSaveAll} 
          disabled={!hasChanges}
        >
          <Save size={16} className="mr-2" />
          {t('requirement.button.saveAllChanges', 'Save All Changes')}
        </Button>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between text-sm text-muted-foreground">
          <div>Last updated: {new Date(requirement.updatedAt).toLocaleString()}</div>
          <div>Responsible: {requirement.responsibleParty || 'Unassigned'}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
