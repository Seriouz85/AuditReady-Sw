/**
 * Approval Workflow Component
 * Manages approval queue and workflow processes
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Eye, 
  CheckCircle, 
  Trash2 
} from 'lucide-react';
import { ApprovalWorkflowItem } from '../shared/KnowledgeTypes';
import { getStatusBadge } from '../shared/KnowledgeUtilities';

interface ApprovalWorkflowProps {
  approvalQueue: ApprovalWorkflowItem[];
  onViewItem?: (item: ApprovalWorkflowItem) => void;
  onApproveItem?: (itemId: string, approved: boolean) => void;
}

export function ApprovalWorkflow({
  approvalQueue,
  onViewItem,
  onApproveItem
}: ApprovalWorkflowProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
        <CardDescription>
          Review and approve knowledge sources and guidance content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalQueue.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      {item.content.slice(0, 80)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{item.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.priority === 'high' ? 'destructive' :
                      item.priority === 'medium' ? 'default' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(item.submittedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {onViewItem && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewItem(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {item.status === 'pending' && onApproveItem && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                          onClick={() => onApproveItem(item.id, true)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => onApproveItem(item.id, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {approvalQueue.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            All items have been reviewed. No pending approvals.
          </div>
        )}
      </CardContent>
    </Card>
  );
}