import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/utils/toast';
import { 
  History, 
  RotateCcw, 
  Clock, 
  User,
  Tag,
  GitBranch,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export interface Deployment {
  id: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'success' | 'failed' | 'in_progress' | 'rolled_back';
  deployedBy: string;
  deployedAt: Date;
  commitSha: string;
  branch: string;
  previousVersion?: string;
  rollbackAvailable: boolean;
  notes?: string;
  duration?: number; // in seconds
}

interface DeploymentHistoryProps {
  environment: string;
  onRollback?: (deployment: Deployment) => Promise<void>;
}

export const DeploymentHistory: React.FC<DeploymentHistoryProps> = ({ 
  environment, 
  onRollback 
}) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);

  const loadDeploymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data - in production this would fetch from your backend
      const mockDeployments: Deployment[] = [
        {
          id: '1',
          version: '1.1.0',
          environment: environment as any,
          status: 'success',
          deployedBy: 'CI/CD Pipeline',
          deployedAt: new Date(Date.now() - 3600000), // 1 hour ago
          commitSha: 'abc123def456',
          branch: 'main',
          previousVersion: '1.0.9',
          rollbackAvailable: true,
          notes: 'Added Kubernetes management features',
          duration: 145
        },
        {
          id: '2',
          version: '1.0.9',
          environment: environment as any,
          status: 'success',
          deployedBy: 'CI/CD Pipeline',
          deployedAt: new Date(Date.now() - 86400000), // 1 day ago
          commitSha: 'def456ghi789',
          branch: 'main',
          previousVersion: '1.0.8',
          rollbackAvailable: true,
          notes: 'Fixed authentication issues',
          duration: 132
        },
        {
          id: '3',
          version: '1.0.8',
          environment: environment as any,
          status: 'rolled_back',
          deployedBy: 'CI/CD Pipeline',
          deployedAt: new Date(Date.now() - 172800000), // 2 days ago
          commitSha: 'ghi789jkl012',
          branch: 'feature/new-ui',
          previousVersion: '1.0.7',
          rollbackAvailable: false,
          notes: 'Rolled back due to performance issues',
          duration: 98
        }
      ];

      setDeployments(mockDeployments);
    } catch (error) {
      console.error('Failed to load deployment history:', error);
      toast.error('Failed to load deployment history');
    } finally {
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadDeploymentHistory();
  }, [loadDeploymentHistory]);

  const handleRollback = async () => {
    if (!selectedDeployment || !onRollback) return;

    try {
      await onRollback(selectedDeployment);
      toast.success(`Rolling back to version ${selectedDeployment.previousVersion}`);
      setShowRollbackDialog(false);
      await loadDeploymentHistory();
    } catch (error) {
      toast.error('Rollback failed');
    }
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'rolled_back':
        return <RotateCcw className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: Deployment['status']) => {
    const variants: Record<Deployment['status'], any> = {
      'success': 'default',
      'failed': 'destructive',
      'in_progress': 'secondary',
      'rolled_back': 'outline'
    };

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Deployment History - {environment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Deployed</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(deployment.status)}
                      {getStatusBadge(deployment.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{deployment.version}</span>
                      {deployment.previousVersion && (
                        <span className="text-sm text-muted-foreground">
                          {deployment.version > deployment.previousVersion ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 inline" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-orange-600 inline" />
                          )}
                          from {deployment.previousVersion}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(deployment.deployedAt).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{deployment.deployedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDuration(deployment.duration)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {deployment.branch}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-muted-foreground truncate">
                      {deployment.notes || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {deployment.rollbackAvailable && 
                     deployment.status === 'success' && 
                     deployment.previousVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDeployment(deployment);
                          setShowRollbackDialog(true);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rollback from version{' '}
              <strong>{selectedDeployment?.version}</strong> to{' '}
              <strong>{selectedDeployment?.previousVersion}</strong>?
              <br /><br />
              This will deploy the previous version and may cause a brief service interruption.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollback}>
              Proceed with Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};