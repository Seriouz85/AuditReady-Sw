import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, Check } from 'lucide-react';
import { documentUploadService, UploadedDocument } from '@/services/documents/DocumentUploadService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  folder?: string;
  onUploadComplete?: (document: UploadedDocument) => void;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  folder,
  onUploadComplete,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { organization, isDemo } = useAuth();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      let result;
      if (isDemo) {
        result = await documentUploadService.uploadFileDemo(file, folder);
      } else {
        if (!organization) {
          throw new Error('No organization found');
        }
        result = await documentUploadService.uploadFile(file, organization.id, folder);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.data) {
        toast.success(`${file.name} uploaded successfully`);
        onUploadComplete?.(result.data);
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600',
            uploading && 'pointer-events-none opacity-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
          />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                <Progress value={uploadProgress} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <File className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supports PDF, Word, Excel, PowerPoint, text, and image files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: {isDemo ? '5MB' : '10MB'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button 
            onClick={openFileDialog} 
            disabled={uploading}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};