/**
 * Guidance Manager Component
 * Manages AI-generated guidance content
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
  RefreshCw, 
  CheckCircle, 
  Zap 
} from 'lucide-react';
import { GuidancePreview } from '../shared/KnowledgeTypes';
import { getStatusBadge } from '../shared/KnowledgeUtilities';

interface GuidanceManagerProps {
  guidancePreviews: GuidancePreview[];
  isGenerating: boolean;
  onViewGuidance: (guidance: GuidancePreview) => void;
  onValidateGuidance: (guidance: GuidancePreview) => void;
  onRefreshGuidance: (category: string) => void;
  onApproveGuidance: (guidance: GuidancePreview) => void;
  onGenerateGuidance: (category: string) => void;
  selectedCategory: string;
}

export function GuidanceManager({
  guidancePreviews,
  isGenerating,
  onViewGuidance,
  onValidateGuidance,
  onRefreshGuidance,
  onApproveGuidance,
  onGenerateGuidance,
  selectedCategory
}: GuidanceManagerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Guidance Management</CardTitle>
            <CardDescription>
              Real-time guidance preview, editing, and approval for all categories
            </CardDescription>
          </div>
          <Button 
            onClick={() => {
              const category = selectedCategory !== 'all' ? selectedCategory : guidancePreviews[0]?.category || 'General';
              onGenerateGuidance(category);
            }}
            disabled={isGenerating}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Guidance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Sources</TableHead>
              <TableHead>Frameworks</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guidancePreviews.map((guidance) => (
              <TableRow key={guidance.category}>
                <TableCell>
                  <div>
                    <div className="font-medium">{guidance.category}</div>
                    <div className="text-sm text-gray-600">v{guidance.version}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(guidance.status, 'guidance')}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={guidance.quality * 100} className="w-16 h-2" />
                    <span className="text-sm">{(guidance.quality * 100).toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{guidance.sources.length}</div>
                    <div className="text-xs text-gray-500">sources</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {guidance.frameworks.slice(0, 2).map(fw => (
                      <Badge key={fw} variant="outline" className="text-xs">
                        {fw.toUpperCase()}
                      </Badge>
                    ))}
                    {guidance.frameworks.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{guidance.frameworks.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(guidance.lastGenerated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewGuidance(guidance)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onValidateGuidance(guidance)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRefreshGuidance(guidance.category)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    {guidance.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApproveGuidance(guidance)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}