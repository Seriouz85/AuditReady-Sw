/**
 * Content Validator Component
 * Handles content validation and quality assessment
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Download 
} from 'lucide-react';
import { ValidationResult } from '../shared/KnowledgeTypes';

interface ContentValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: ValidationResult | null;
  onExportReport?: () => void;
}

export function ContentValidator({
  open,
  onOpenChange,
  validationResults,
  onExportReport
}: ContentValidatorProps) {
  if (!validationResults) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Content Validation Results</DialogTitle>
          <DialogDescription>
            Automated quality and compliance validation results
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className={validationResults.score >= 0.8 ? 'text-green-600' : validationResults.score >= 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                {(validationResults.score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-sm text-gray-600">Overall Validation Score</div>
            <Progress value={validationResults.score * 100} className="mt-3" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Validation Checks</h3>
            <div className="space-y-2">
              {validationResults.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    {check.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-gray-600">{check.details}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {(check.score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {validationResults.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recommendations</h3>
              <div className="space-y-2">
                {validationResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">Confidence Level</span>
            <span className="text-sm font-semibold">{(validationResults.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onExportReport && (
            <Button onClick={onExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}