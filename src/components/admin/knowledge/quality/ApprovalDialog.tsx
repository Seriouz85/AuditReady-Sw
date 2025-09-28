/**
 * Approval Dialog Component
 * Dialog for submitting content for approval
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (notes: string, options: ApprovalOptions) => void;
  title?: string;
  description?: string;
}

interface ApprovalOptions {
  notifyReviewers: boolean;
  runQualityChecks: boolean;
  requireManualReview: boolean;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Submit for Approval",
  description = "Submit this guidance for review and approval"
}: ApprovalDialogProps) {
  const [notes, setNotes] = useState('');
  const [options, setOptions] = useState<ApprovalOptions>({
    notifyReviewers: true,
    runQualityChecks: true,
    requireManualReview: false
  });

  const handleSubmit = () => {
    onSubmit(notes, options);
    setNotes('');
    setOptions({
      notifyReviewers: true,
      runQualityChecks: true,
      requireManualReview: false
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="approval-notes">Review Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Add notes for the reviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Approval Options</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={options.notifyReviewers}
                  onChange={(e) => setOptions(prev => ({ ...prev, notifyReviewers: e.target.checked }))}
                />
                <span className="text-sm">Notify reviewers immediately</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={options.runQualityChecks}
                  onChange={(e) => setOptions(prev => ({ ...prev, runQualityChecks: e.target.checked }))}
                />
                <span className="text-sm">Run automated quality checks</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={options.requireManualReview}
                  onChange={(e) => setOptions(prev => ({ ...prev, requireManualReview: e.target.checked }))}
                />
                <span className="text-sm">Require manual review before publishing</span>
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}