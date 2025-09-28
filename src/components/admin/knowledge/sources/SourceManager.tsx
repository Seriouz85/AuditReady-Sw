/**
 * Source Manager Component
 * Handles adding and editing knowledge sources
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KnowledgeSource } from '@/services/rag/KnowledgeIngestionService';
import { CONTENT_TYPES, FRAMEWORKS, COMPLIANCE_CATEGORIES } from '../shared/KnowledgeTypes';

interface SourceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (source: Partial<KnowledgeSource>) => void;
  loading: boolean;
  initialSource?: Partial<KnowledgeSource>;
}

export function SourceManager({
  open,
  onOpenChange,
  onSubmit,
  loading,
  initialSource
}: SourceManagerProps) {
  const [source, setSource] = useState<Partial<KnowledgeSource>>(
    initialSource || {
      contentType: 'guidance',
      authorityScore: 5,
      credibilityRating: 'pending',
      complianceFrameworks: [],
      focusAreas: []
    }
  );

  const handleUrlChange = (url: string) => {
    try {
      const domain = url ? new URL(url).hostname : '';
      setSource(prev => ({ ...prev, url, domain }));
    } catch {
      setSource(prev => ({ ...prev, url }));
    }
  };

  const toggleFramework = (framework: string) => {
    const frameworks = source.complianceFrameworks || [];
    if (frameworks.includes(framework)) {
      setSource(prev => ({
        ...prev,
        complianceFrameworks: frameworks.filter(f => f !== framework)
      }));
    } else {
      setSource(prev => ({
        ...prev,
        complianceFrameworks: [...frameworks, framework]
      }));
    }
  };

  const toggleFocusArea = (area: string) => {
    const areas = source.focusAreas || [];
    if (areas.includes(area)) {
      setSource(prev => ({
        ...prev,
        focusAreas: areas.filter(a => a !== area)
      }));
    } else {
      setSource(prev => ({
        ...prev,
        focusAreas: [...areas, area]
      }));
    }
  };

  const resetForm = () => {
    setSource({
      contentType: 'guidance',
      authorityScore: 5,
      credibilityRating: 'pending',
      complianceFrameworks: [],
      focusAreas: []
    });
  };

  const handleSubmit = () => {
    onSubmit(source);
    resetForm();
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Knowledge Source</DialogTitle>
          <DialogDescription>
            Add a new expert knowledge source with approval workflow
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url">Source URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/compliance-guide"
                value={source.url || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={source.domain || ''}
                readOnly
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Expert Compliance Guide"
              value={source.title || ''}
              onChange={(e) => setSource(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this source provides..."
              value={source.description || ''}
              onChange={(e) => setSource(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={source.contentType}
                onValueChange={(value) => setSource(prev => ({ ...prev, contentType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="authorityScore">Authority Score</Label>
              <Select
                value={source.authorityScore?.toString()}
                onValueChange={(value) => setSource(prev => ({ ...prev, authorityScore: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}/10
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="credibilityRating">Credibility</Label>
              <Select
                value={source.credibilityRating}
                onValueChange={(value) => setSource(prev => ({ ...prev, credibilityRating: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Compliance Frameworks</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FRAMEWORKS.map(framework => (
                <Badge
                  key={framework}
                  variant={source.complianceFrameworks?.includes(framework) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleFramework(framework)}
                >
                  {framework.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Focus Areas</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {COMPLIANCE_CATEGORIES.slice(0, 10).map(category => (
                <Badge
                  key={category}
                  variant={source.focusAreas?.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleFocusArea(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!source.url || !source.domain || loading}
          >
            {loading ? 'Adding...' : 'Add Source'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}