import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, User, FileText } from 'lucide-react';
import { ConflictResolution } from '@/services/requirements/RequirementsService';
import { formatDistanceToNow } from 'date-fns';

interface RequirementConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: ConflictResolution;
  onResolve: (resolution: ConflictResolution) => Promise<void>;
  requirementTitle?: string;
  requirementCode?: string;
}

export const RequirementConflictResolver: React.FC<RequirementConflictResolverProps> = ({
  isOpen,
  onClose,
  conflict,
  onResolve,
  requirementTitle = 'Unknown Requirement',
  requirementCode = 'N/A'
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'keep_local' | 'keep_remote' | 'merge'>('keep_remote');
  const [mergedValue, setMergedValue] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const resolvedConflict: ConflictResolution = {
        ...conflict,
        resolution: selectedResolution
      };

      await onResolve(resolvedConflict);
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const getConflictTypeDescription = (type: string) => {
    switch (type) {
      case 'version_mismatch':
        return 'Another user has modified this requirement while you were editing it.';
      case 'concurrent_edit':
        return 'Multiple users are editing this requirement simultaneously.';
      case 'lock_conflict':
        return 'This requirement is currently locked by another user.';
      default:
        return 'A conflict has occurred with this requirement.';
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'version_mismatch':
        return <Clock className="h-4 w-4" />;
      case 'concurrent_edit':
        return <User className="h-4 w-4" />;
      case 'lock_conflict':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderValueComparison = (label: string, localValue: any, remoteValue: any) => {
    if (localValue === remoteValue) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{label}</h4>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-orange-800">Your Version</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-orange-700 break-words">
                {localValue || 'No value'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-blue-800">Server Version</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-blue-700 break-words">
                {remoteValue || 'No value'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolve Requirement Conflict
          </DialogTitle>
          <DialogDescription>
            {getConflictTypeDescription(conflict.conflictType)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requirement Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {getConflictTypeIcon(conflict.conflictType)}
                <Badge variant="outline">{requirementCode}</Badge>
                <Badge variant="secondary">{conflict.conflictType.replace('_', ' ')}</Badge>
              </div>
              <h3 className="font-medium">{requirementTitle}</h3>
            </CardContent>
          </Card>

          {/* Conflict Details */}
          <div className="space-y-4">
            {conflict.localValue && conflict.remoteValue && (
              <>
                {renderValueComparison('Status', conflict.localValue.status, conflict.remoteValue.status)}
                {renderValueComparison('Evidence Summary', conflict.localValue.evidence_summary, conflict.remoteValue.evidence_summary)}
                {renderValueComparison('Notes', conflict.localValue.notes, conflict.remoteValue.notes)}
              </>
            )}
          </div>

          {/* Resolution Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedResolution} onValueChange={setSelectedResolution as any}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="keep_local">Keep My Changes</TabsTrigger>
                  <TabsTrigger value="keep_remote">Keep Server Version</TabsTrigger>
                  <TabsTrigger value="merge">Manual Merge</TabsTrigger>
                </TabsList>

                <TabsContent value="keep_local" className="mt-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Keep Your Changes</h4>
                    <p className="text-sm text-orange-700">
                      Your local changes will be saved and the server version will be overwritten.
                      This may result in data loss if the other user made important changes.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="keep_remote" className="mt-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Keep Server Version</h4>
                    <p className="text-sm text-blue-700">
                      The server version will be kept and your local changes will be discarded.
                      This is the safest option if you're unsure about the changes.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="merge" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Manual Merge</h4>
                      <p className="text-sm text-green-700">
                        Manually combine the changes from both versions. This gives you full control
                        but requires careful review of the differences.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="merged-notes" className="text-sm font-medium">
                        Merged Notes
                      </label>
                      <Textarea
                        id="merged-notes"
                        placeholder="Combine the changes from both versions..."
                        value={mergedValue}
                        onChange={(e) => setMergedValue(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isResolving}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolve} 
              disabled={isResolving || (selectedResolution === 'merge' && !mergedValue.trim())}
            >
              {isResolving ? 'Resolving...' : 'Resolve Conflict'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};