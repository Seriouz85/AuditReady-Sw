import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedDocumentService, DocumentMetadata } from '@/services/documents/EnhancedDocumentService';
import { useToast } from '@/hooks/use-toast';
import { getAccessLevelLabels } from '@/utils/accessLevels';
import { formatFileSize } from '@/services/utils/UnifiedUtilityService';

interface DocumentUploaderProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: (document?: DocumentMetadata) => void;
  existingDocument?: DocumentMetadata; // For uploading new versions
}

interface FileWithMetadata {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentUploader({ 
  organizationId, 
  onClose, 
  onSuccess, 
  existingDocument 
}: DocumentUploaderProps) {
  const { toast } = useToast();
  const documentService = EnhancedDocumentService.getInstance();

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state for document metadata
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [accessLevel, setAccessLevel] = useState<'public' | 'internal' | 'confidential' | 'restricted'>('internal');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [changeNotes, setChangeNotes] = useState('');

  const categories = [
    'general', 'policy', 'procedure', 'evidence', 'report', 
    'certificate', 'training', 'audit', 'risk', 'compliance'
  ];

  const accessLevelLabels = getAccessLevelLabels();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Basic file validation
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 100MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    const filesWithMetadata: FileWithMetadata[] = validFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'pending'
    }));

    if (existingDocument) {
      // For new versions, only allow one file
      setFiles(filesWithMetadata.slice(0, 1));
      if (filesWithMetadata.length > 0) {
        setDocumentName(filesWithMetadata[0].file.name);
      }
    } else {
      setFiles(prev => [...prev, ...filesWithMetadata]);
      if (filesWithMetadata.length > 0 && !documentName) {
        setDocumentName(filesWithMetadata[0].file.name);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload',
        variant: 'destructive'
      });
      return;
    }

    if (!documentName.trim()) {
      toast({
        title: 'Document name required',
        description: 'Please provide a name for the document',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        try {
          let result;
          
          if (existingDocument) {
            // Upload new version
            result = await documentService.uploadNewVersion(
              existingDocument.id,
              fileData.file,
              changeNotes || `New version: ${fileData.file.name}`
            );
          } else {
            // Upload new document
            const metadata: Partial<DocumentMetadata> = {
              name: i === 0 ? documentName : fileData.file.name,
              description: description || undefined,
              category,
              access_level: accessLevel,
              tags,
              compliance_tags: [],
              related_assessment_ids: [],
              related_requirement_ids: []
            };

            result = await documentService.uploadDocument(
              fileData.file,
              metadata,
              organizationId,
              changeNotes || 'Initial upload'
            );
          }

          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'success', progress: 100 } : f
          ));

          if (i === 0) {
            onSuccess(result as DocumentMetadata);
          }

        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'error', error: errorMessage } : f
          ));
        }
      }

      const hasErrors = files.some(f => f.status === 'error');
      if (!hasErrors) {
        toast({
          title: 'Upload successful',
          description: existingDocument 
            ? 'New version uploaded successfully' 
            : `${files.length} document(s) uploaded successfully`
        });
        
        // Close after a short delay to show success state
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (error) {
      console.error('Upload process error:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };


  const getFileIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingDocument ? `Upload New Version: ${existingDocument.name}` : 'Upload Documents'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {existingDocument ? 'Upload New Version' : 'Drop files here'}
              </h3>
              <p className="text-gray-500 mb-4">
                or click to browse files (max 100MB each)
              </p>
              <input
                type="file"
                multiple={!existingDocument}
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-input" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files</h4>
                {files.map((fileData) => (
                  <Card key={fileData.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(fileData.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{fileData.file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(fileData.file.size)}
                            </p>
                            {fileData.error && (
                              <p className="text-sm text-red-500">{fileData.error}</p>
                            )}
                          </div>
                        </div>
                        
                        {fileData.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileData.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Metadata Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-name">Document Name *</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                disabled={uploading}
              />
            </div>

            {!existingDocument && (
              <>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the document purpose and contents"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Access Level</Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel as any} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{accessLevelLabels.public}</SelectItem>
                      <SelectItem value="internal">{accessLevelLabels.internal}</SelectItem>
                      <SelectItem value="confidential">{accessLevelLabels.confidential}</SelectItem>
                      <SelectItem value="restricted">{accessLevelLabels.restricted}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      disabled={uploading}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" disabled={uploading}>
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer">
                          {tag}
                          <X 
                            className="h-3 w-3 ml-1" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="change-notes">
                {existingDocument ? 'Version Notes' : 'Upload Notes'}
              </Label>
              <Textarea
                id="change-notes"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder={existingDocument 
                  ? "Describe what changed in this version" 
                  : "Add any notes about this upload"
                }
                rows={2}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {existingDocument ? 'Upload Version' : 'Upload Documents'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}