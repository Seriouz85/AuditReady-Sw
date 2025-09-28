/**
 * Source Details Component
 * Detailed view and management of individual knowledge sources
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { EnhancedKnowledgeSource } from '../shared/KnowledgeTypes';
import { getStatusBadge } from '../shared/KnowledgeUtilities';

interface SourceDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: EnhancedKnowledgeSource | null;
  onRefreshSource?: (source: EnhancedKnowledgeSource) => void;
}

export function SourceDetails({
  open,
  onOpenChange,
  source,
  onRefreshSource
}: SourceDetailsProps) {
  if (!source) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Source Details</DialogTitle>
          <DialogDescription>
            Detailed information and management options for knowledge source
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>URL:</strong> {source.url}</div>
                <div><strong>Domain:</strong> {source.domain}</div>
                <div><strong>Title:</strong> {source.title}</div>
                <div><strong>Type:</strong> {source.contentType}</div>
                <div><strong>Authority Score:</strong> {source.authorityScore}/10</div>
                <div><strong>Status:</strong> {getStatusBadge(source.status)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Content Chunks:</strong> {source.contentChunks}</div>
                <div><strong>Quality Score:</strong> {(source.qualityScore * 100).toFixed(1)}%</div>
                <div><strong>Success Rate:</strong> {source.successRate * 100}%</div>
                <div><strong>Error Count:</strong> {source.errorCount}</div>
                <div><strong>Last Scraped:</strong> {source.lastScraped ? new Date(source.lastScraped).toLocaleString() : 'Never'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Compliance Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {source.complianceFrameworks?.map(framework => (
                <Badge key={framework} variant="outline">
                  {framework.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {source.focusAreas?.map(area => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
          
          {source.description && (
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-sm text-gray-600">{source.description}</p>
            </div>
          )}
          
          {source.lastError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Error:</strong> {source.lastError}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {source.status === 'active' && onRefreshSource && (
            <Button onClick={() => onRefreshSource(source)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Content
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}