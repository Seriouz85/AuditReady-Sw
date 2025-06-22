import React, { useState, useEffect } from 'react';
import { 
  History, Download, RotateCcw, Calendar, User, FileText, 
  ChevronRight, Eye, Trash2, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DocumentMetadata, 
  DocumentVersion, 
  EnhancedDocumentService 
} from '@/services/documents/EnhancedDocumentService';
import { useToast } from '@/hooks/use-toast';

interface DocumentVersionViewerProps {
  document: DocumentMetadata;
  onClose: () => void;
  onVersionChange: () => void;
}

export function DocumentVersionViewer({ 
  document, 
  onClose, 
  onVersionChange 
}: DocumentVersionViewerProps) {
  const { toast } = useToast();
  const documentService = EnhancedDocumentService.getInstance();

  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<[number, number] | null>(null);
  const [reverting, setReverting] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, [document.id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const versionData = await documentService.getDocumentVersions(document.id);
      setVersions(versionData);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document versions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (version: DocumentVersion) => {
    try {
      const downloadUrl = await documentService.downloadDocument(
        document.id, 
        version.version_number
      );
      window.open(downloadUrl, '_blank');
      toast({
        title: 'Success',
        description: `Downloaded version ${version.version_number}`
      });
    } catch (error) {
      console.error('Error downloading version:', error);
      toast({
        title: 'Error',
        description: 'Failed to download version',
        variant: 'destructive'
      });
    }
  };

  const handleRevert = async (versionNumber: number) => {
    if (!confirm(`Are you sure you want to revert to version ${versionNumber}? This will create a new version with the content from version ${versionNumber}.`)) {
      return;
    }

    try {
      setReverting(versionNumber);
      await documentService.revertToVersion(document.id, versionNumber);
      toast({
        title: 'Success',
        description: `Reverted to version ${versionNumber}`
      });
      onVersionChange();
      loadVersions();
    } catch (error) {
      console.error('Error reverting version:', error);
      toast({
        title: 'Error',
        description: 'Failed to revert to this version',
        variant: 'destructive'
      });
    } finally {
      setReverting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionChanges = (currentVersion: DocumentVersion, previousVersion?: DocumentVersion) => {
    const changes: string[] = [];
    
    if (!previousVersion) {
      return ['Initial version'];
    }

    if (currentVersion.file_size !== previousVersion.file_size) {
      const sizeDiff = currentVersion.file_size - previousVersion.file_size;
      const sign = sizeDiff > 0 ? '+' : '';
      changes.push(`Size: ${sign}${formatFileSize(Math.abs(sizeDiff))}`);
    }

    if (currentVersion.file_type !== previousVersion.file_type) {
      changes.push(`Type: ${previousVersion.file_type} → ${currentVersion.file_type}`);
    }

    if (currentVersion.checksum !== previousVersion.checksum) {
      changes.push('Content modified');
    }

    return changes.length > 0 ? changes : ['Minor changes'];
  };

  const compareVersions = (v1: number, v2: number) => {
    setSelectedVersions([Math.min(v1, v2), Math.max(v1, v2)]);
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Version History: {document.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedVersions ? (
            <VersionComparison 
              versions={versions}
              selectedVersions={selectedVersions}
              onBack={() => setSelectedVersions(null)}
            />
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {/* Document Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{document.name}</h3>
                        <p className="text-sm text-gray-600">
                          Current Version: v{document.current_version} • {document.total_versions} total versions
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatFileSize(document.file_size)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Version Timeline */}
                <div className="space-y-3">
                  {versions.map((version, index) => {
                    const previousVersion = versions[index + 1];
                    const changes = getVersionChanges(version, previousVersion);
                    
                    return (
                      <Card 
                        key={version.id}
                        className={`transition-all hover:shadow-md ${
                          version.is_current ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  variant={version.is_current ? "default" : "outline"}
                                  className="font-mono"
                                >
                                  v{version.version_number}
                                </Badge>
                                {version.is_current && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Current
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1 text-sm">
                                <div className="flex items-center space-x-4 text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(version.created_at)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>You</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <FileText className="h-3 w-3" />
                                    <span>{formatFileSize(version.file_size)}</span>
                                  </div>
                                </div>

                                {version.change_notes && (
                                  <p className="text-gray-700 mt-1">
                                    {version.change_notes}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-1 mt-2">
                                  {changes.map((change, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {change}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(version)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>

                              {!version.is_current && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => compareVersions(version.version_number, document.current_version)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevert(version.version_number)}
                                    disabled={reverting === version.version_number}
                                  >
                                    {reverting === version.version_number ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-900"></div>
                                    ) : (
                                      <RotateCcw className="h-3 w-3" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {versions.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No versions found</h3>
                    <p className="text-gray-500">This document doesn't have any version history yet.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface VersionComparisonProps {
  versions: DocumentVersion[];
  selectedVersions: [number, number];
  onBack: () => void;
}

function VersionComparison({ versions, selectedVersions, onBack }: VersionComparisonProps) {
  const [v1, v2] = selectedVersions;
  const version1 = versions.find(v => v.version_number === v1);
  const version2 = versions.find(v => v.version_number === v2);

  if (!version1 || !version2) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot compare versions</h3>
        <p className="text-gray-500">One or both selected versions could not be found.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Back to History
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <h3 className="font-semibold">
          Comparing v{v1} and v{v2}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Version 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Badge variant="outline">v{version1.version_number}</Badge>
              {version1.is_current && (
                <Badge variant="default" className="text-xs">Current</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm">{formatDate(version1.created_at)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">File Size</label>
              <p className="text-sm">{formatFileSize(version1.file_size)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">File Type</label>
              <p className="text-sm">{version1.file_type}</p>
            </div>
            
            {version1.change_notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{version1.change_notes}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Checksum</label>
              <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                {version1.checksum}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Badge variant="outline">v{version2.version_number}</Badge>
              {version2.is_current && (
                <Badge variant="default" className="text-xs">Current</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm">{formatDate(version2.created_at)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">File Size</label>
              <p className="text-sm">
                {formatFileSize(version2.file_size)}
                {version2.file_size !== version1.file_size && (
                  <span className={`ml-2 text-xs ${
                    version2.file_size > version1.file_size ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ({version2.file_size > version1.file_size ? '+' : ''}{formatFileSize(Math.abs(version2.file_size - version1.file_size))})
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">File Type</label>
              <p className="text-sm">
                {version2.file_type}
                {version2.file_type !== version1.file_type && (
                  <Badge variant="outline" className="ml-2 text-xs">Changed</Badge>
                )}
              </p>
            </div>
            
            {version2.change_notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{version2.change_notes}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Checksum</label>
              <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                {version2.checksum}
                {version2.checksum !== version1.checksum && (
                  <Badge variant="outline" className="ml-2 text-xs">Different</Badge>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Comparison Summary</h4>
          <div className="space-y-1 text-sm">
            {version1.checksum === version2.checksum ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These versions have identical content (same checksum).
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These versions have different content. The files have been modified between versions.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}