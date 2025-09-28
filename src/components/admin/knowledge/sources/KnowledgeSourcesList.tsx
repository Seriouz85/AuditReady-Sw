/**
 * Knowledge Sources List Component
 * Displays table of knowledge sources with filtering and actions
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Eye,
  Shield,
  CheckCircle,
  Trash2,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { EnhancedKnowledgeSource } from '../shared/KnowledgeTypes';
import { getStatusBadge } from '../shared/KnowledgeUtilities';

interface KnowledgeSourcesListProps {
  sources: EnhancedKnowledgeSource[];
  loading: boolean;
  onViewSource: (source: EnhancedKnowledgeSource) => void;
  onValidateSource: (source: EnhancedKnowledgeSource) => void;
  onApproveSource: (sourceId: string, approved: boolean) => void;
  onRefreshSource: (source: EnhancedKnowledgeSource) => void;
}

export function KnowledgeSourcesList({
  sources,
  loading,
  onViewSource,
  onValidateSource,
  onApproveSource,
  onRefreshSource
}: KnowledgeSourcesListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Knowledge Sources</CardTitle>
            <CardDescription>
              Manage expert knowledge sources with approval workflows
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{source.title || source.domain}</div>
                    <div className="text-sm text-gray-600">{source.url}</div>
                    <div className="flex gap-1 mt-1">
                      {source.complianceFrameworks?.slice(0, 2).map(fw => (
                        <Badge key={fw} variant="outline" className="text-xs">
                          {fw.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {source.contentType}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(source.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={source.qualityScore * 100} className="w-16 h-2" />
                    <span className="text-sm">{(source.qualityScore * 100).toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{source.contentChunks}</div>
                    <div className="text-xs text-gray-500">chunks</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(source.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewSource(source)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onValidateSource(source)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    {source.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApproveSource(source.id, true)}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApproveSource(source.id, false)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {source.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRefreshSource(source)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No knowledge sources found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}