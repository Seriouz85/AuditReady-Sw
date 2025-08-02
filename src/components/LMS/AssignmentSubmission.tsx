import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface AssignmentRubric {
  criteria: string;
  description: string;
  maxPoints: number;
  levels: {
    name: string;
    points: number;
    description: string;
  }[];
}

interface AssignmentSubmissionProps {
  title: string;
  description: string;
  instructions?: string;
  dueDate?: Date;
  maxPoints: number;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  rubric?: AssignmentRubric[];
  onSubmit?: (content: string, files: UploadedFile[]) => void;
  onSaveDraft?: (content: string, files: UploadedFile[]) => void;
  existingSubmission?: {
    content: string;
    files: UploadedFile[];
    submittedAt?: Date;
    status: 'draft' | 'submitted' | 'graded';
    grade?: number;
    feedback?: string;
  };
}

const sampleRubric: AssignmentRubric[] = [
  {
    criteria: 'Understanding of Concepts',
    description: 'Demonstrates clear understanding of cybersecurity compliance principles',
    maxPoints: 25,
    levels: [
      { name: 'Excellent', points: 25, description: 'Shows comprehensive understanding with detailed examples' },
      { name: 'Good', points: 20, description: 'Shows good understanding with some examples' },
      { name: 'Satisfactory', points: 15, description: 'Shows basic understanding' },
      { name: 'Needs Improvement', points: 10, description: 'Shows limited understanding' }
    ]
  },
  {
    criteria: 'Application of Knowledge',
    description: 'Applies concepts to real-world scenarios effectively',
    maxPoints: 25,
    levels: [
      { name: 'Excellent', points: 25, description: 'Excellent application with innovative solutions' },
      { name: 'Good', points: 20, description: 'Good application with practical solutions' },
      { name: 'Satisfactory', points: 15, description: 'Basic application demonstrated' },
      { name: 'Needs Improvement', points: 10, description: 'Limited application shown' }
    ]
  }
];

export const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({
  title,
  description,
  instructions,
  dueDate,
  maxPoints,
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10,
  maxFiles = 5,
  rubric = sampleRubric,
  onSubmit,
  onSaveDraft,
  existingSubmission
}) => {
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingSubmission?.files || []);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'submission' | 'rubric' | 'feedback'>('submission');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate time remaining
  const timeRemaining = dueDate ? Math.max(0, dueDate.getTime() - Date.now()) : 0;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const isOverdue = dueDate && dueDate < new Date();
  const isDueSoon = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000; // Less than 24 hours

  // File size formatter
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  // Upload files moved before handleFileSelect to avoid hoisting issues

  // Upload files simulation
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be the server URL
        uploadedAt: new Date()
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      // Check file type
      const isValidType = allowedFileTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      
      // Check file size
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      
      if (!isValidType) {
        alert(`File type not allowed: ${file.name}. Allowed types: ${allowedFileTypes.join(', ')}`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File too large: ${file.name}. Maximum size: ${maxFileSize}MB`);
        return false;
      }
      
      return true;
    });

    // Check total file count
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      alert(`Too many files. Maximum allowed: ${maxFiles}`);
      return;
    }

    // Upload files
    uploadFiles(validFiles);
  }, [allowedFileTypes, maxFileSize, uploadedFiles.length, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle submission
  const handleSubmit = () => {
    if (!content.trim() && uploadedFiles.length === 0) {
      alert('Please provide content or upload files before submitting.');
      return;
    }
    
    onSubmit?.(content, uploadedFiles);
  };

  // Handle save draft
  const handleSaveDraft = () => {
    onSaveDraft?.(content, uploadedFiles);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{title}</CardTitle>
              <p className="text-gray-600 mb-4">{description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">
                  {maxPoints} points
                </Badge>
                
                {dueDate && (
                  <div className={cn(
                    "flex items-center gap-1",
                    isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-gray-600"
                  )}>
                    <Clock className="h-4 w-4" />
                    <span>
                      {isOverdue 
                        ? 'Overdue' 
                        : `Due in ${daysRemaining}d ${hoursRemaining}h`
                      }
                    </span>
                  </div>
                )}
                
                {existingSubmission && (
                  <Badge className={
                    existingSubmission.status === 'graded' ? 'bg-green-500' :
                    existingSubmission.status === 'submitted' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {existingSubmission.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            
            {existingSubmission?.grade !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {existingSubmission.grade}%
                </div>
                <div className="text-sm text-gray-600">Grade</div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'submission' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('submission')}
          className="flex-1"
        >
          Submission
        </Button>
        <Button
          variant={activeTab === 'rubric' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rubric')}
          className="flex-1"
        >
          Rubric
        </Button>
        {existingSubmission?.feedback && (
          <Button
            variant={activeTab === 'feedback' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('feedback')}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'submission' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Submission Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            {instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {instructions}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Response</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedRichTextEditor
                  initialContent={content}
                  onSave={setContent}
                  onCancel={() => {}}
                  placeholder="Write your assignment response here..."
                />
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Attachments</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload supporting documents ({allowedFileTypes.join(', ')}, max {maxFileSize}MB each)
                </p>
              </CardHeader>
              <CardContent>
                {/* Upload Area */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragging 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-600">
                    {uploadedFiles.length}/{maxFiles} files uploaded
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={allowedFileTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Uploading...</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium">Uploaded Files</h4>
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileIcon className="h-8 w-8 text-gray-500" />
                          <div className="flex-1">
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {existingSubmission?.status === 'submitted' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="font-medium">
                    {existingSubmission?.status === 'submitted' 
                      ? 'Submitted'
                      : 'Not submitted'
                    }
                  </span>
                </div>
                
                {existingSubmission?.submittedAt && (
                  <p className="text-sm text-gray-600">
                    Submitted on {existingSubmission.submittedAt.toLocaleDateString()}
                  </p>
                )}
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSaveDraft} 
                    variant="outline"
                    disabled={existingSubmission?.status === 'submitted'}
                  >
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={existingSubmission?.status === 'submitted' || isOverdue}
                  >
                    Submit Assignment
                  </Button>
                </div>
                
                {isOverdue && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Submission deadline has passed</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Max Points:</span>
                  <span className="font-medium">{maxPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Files Uploaded:</span>
                  <span className="font-medium">{uploadedFiles.length}/{maxFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>Word Count:</span>
                  <span className="font-medium">{content.split(' ').filter(w => w).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rubric' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grading Rubric</CardTitle>
            <p className="text-gray-600">This assignment will be evaluated based on the following criteria:</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {rubric.map((criterion, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <h3 className="font-semibold">{criterion.criteria}</h3>
                    <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {criterion.maxPoints} points
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {criterion.levels.map((level, levelIndex) => (
                      <div key={levelIndex} className="p-4 border-r last:border-r-0">
                        <div className="font-medium text-sm">{level.name}</div>
                        <div className="text-lg font-bold text-blue-600">{level.points} pts</div>
                        <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'feedback' && existingSubmission?.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructor Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {existingSubmission.feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};