/**
 * Guidance Preview Component
 * Preview and edit guidance content with approval workflow
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle } from 'lucide-react';
import { GuidancePreview as GuidancePreviewType } from '../shared/KnowledgeTypes';
import { getStatusBadge } from '../shared/KnowledgeUtilities';

interface GuidancePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guidance: GuidancePreviewType | null;
  onValidateContent?: (content: string) => void;
  onSubmitForApproval?: (guidance: GuidancePreviewType) => void;
  onContentChange?: (guidance: GuidancePreviewType, content: string) => void;
}

export function GuidancePreview({
  open,
  onOpenChange,
  guidance,
  onValidateContent,
  onSubmitForApproval,
  onContentChange
}: GuidancePreviewProps) {
  const [editedGuidance, setEditedGuidance] = useState<GuidancePreviewType | null>(null);

  useEffect(() => {
    if (guidance) {
      setEditedGuidance({ ...guidance });
    }
  }, [guidance]);

  if (!editedGuidance) return null;

  const handleContentChange = (content: string) => {
    const updated = { ...editedGuidance, content };
    setEditedGuidance(updated);
    onContentChange?.(updated, content);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guidance Preview</DialogTitle>
          <DialogDescription>
            Real-time preview and editing for AI-generated guidance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-lg">{editedGuidance.category}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(editedGuidance.status, 'guidance')}
                <span className="text-sm text-gray-500">v{editedGuidance.version}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(editedGuidance.quality * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {editedGuidance.sources.length}
              </div>
              <div className="text-sm text-gray-600">Sources Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {editedGuidance.frameworks.length}
              </div>
              <div className="text-sm text-gray-600">Frameworks</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Guidance Content</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <Textarea
                value={editedGuidance.content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={12}
                className="bg-white"
                placeholder="Guidance content..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Sources Used</h3>
              <div className="space-y-1">
                {editedGuidance.sources.map(source => (
                  <div key={source} className="text-sm text-blue-600">
                    • {source}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Framework Coverage</h3>
              <div className="flex flex-wrap gap-1">
                {editedGuidance.frameworks.map(fw => (
                  <Badge key={fw} variant="outline" className="text-xs">
                    {fw.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {editedGuidance.approvalWorkflow && (
            <div>
              <h3 className="font-semibold mb-3">Approval Workflow</h3>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <div className="space-y-2 text-sm">
                  <div><strong>Submitted:</strong> {new Date(editedGuidance.approvalWorkflow.submittedAt!).toLocaleString()}</div>
                  {editedGuidance.approvalWorkflow.comments && (
                    <div>
                      <strong>Comments:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {editedGuidance.approvalWorkflow.comments.map((comment, index) => (
                          <li key={index}>{comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onValidateContent && (
            <Button onClick={() => onValidateContent(editedGuidance.content)}>
              <Shield className="h-4 w-4 mr-2" />
              Validate
            </Button>
          )}
          {onSubmitForApproval && (
            <Button onClick={() => {
              onSubmitForApproval(editedGuidance);
              onOpenChange(false);
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}