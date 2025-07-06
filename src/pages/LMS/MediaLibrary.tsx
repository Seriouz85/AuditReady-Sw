import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Edit,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  FolderPlus,
  Grid,
  List,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { mediaLibraryService } from '@/services/lms/MediaLibraryService';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/utils/toast';
import { useTheme } from 'next-themes';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  description?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  organizationId: string;
}

const MediaLibrary: React.FC = () => {
  const { setTheme } = useTheme();
  const { user, isDemo } = useAuth();
  const { organization } = useOrganization();
  
  useEffect(() => { setTheme('light'); }, [setTheme]);

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    category: 'general',
    description: '',
    tags: ''
  });

  useEffect(() => {
    if (organization || isDemo) {
      loadFiles();
    }
  }, [organization, isDemo]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Load demo media files
        setFiles([
          {
            id: 'demo-1',
            filename: 'cybersecurity-intro.mp4',
            originalName: 'Cybersecurity Introduction Video.mp4',
            mimeType: 'video/mp4',
            size: 15728640,
            url: '/demo/videos/cybersecurity-intro.mp4',
            category: 'video',
            description: 'Introduction to cybersecurity fundamentals',
            tags: ['cybersecurity', 'training', 'introduction'],
            uploadedBy: 'Admin',
            uploadedAt: new Date().toISOString(),
            organizationId: 'demo-org'
          },
          {
            id: 'demo-2',
            filename: 'phishing-awareness.pdf',
            originalName: 'Phishing Awareness Guide.pdf',
            mimeType: 'application/pdf',
            size: 2048000,
            url: '/demo/documents/phishing-awareness.pdf',
            category: 'document',
            description: 'Comprehensive guide on identifying phishing attacks',
            tags: ['phishing', 'security', 'awareness'],
            uploadedBy: 'Training Manager',
            uploadedAt: new Date(Date.now() - 86400000).toISOString(),
            organizationId: 'demo-org'
          },
          {
            id: 'demo-3',
            filename: 'compliance-checklist.png',
            originalName: 'Compliance Checklist Infographic.png',
            mimeType: 'image/png',
            size: 1024000,
            url: '/demo/images/compliance-checklist.png',
            category: 'image',
            description: 'Visual checklist for compliance requirements',
            tags: ['compliance', 'checklist', 'infographic'],
            uploadedBy: 'Compliance Officer',
            uploadedAt: new Date(Date.now() - 172800000).toISOString(),
            organizationId: 'demo-org'
          }
        ]);
        return;
      }

      if (organization) {
        const mediaFiles = await mediaLibraryService.getFiles(organization.id);
        setFiles(mediaFiles);
      }
    } catch (error) {
      console.error('Error loading media files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    if (!organization && !isDemo) {
      toast.error('Organization context required');
      return;
    }

    try {
      setUploading(true);
      
      if (isDemo) {
        toast.success(`Uploaded ${selectedFiles.length} file(s) (demo mode)`);
        setShowUploadDialog(false);
        return;
      }

      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const url = await mediaLibraryService.uploadFile(file, uploadForm.category);
        if (url) {
          await mediaLibraryService.saveFileMetadata({
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            category: uploadForm.category,
            description: uploadForm.description,
            tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            organizationId: organization!.id
          });
        }
        return url;
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
        loadFiles(); // Refresh the file list
        setShowUploadDialog(false);
        setUploadForm({ category: 'general', description: '', tags: '' });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (isDemo) {
      toast.success('File deleted (demo mode)');
      setFiles(files.filter(f => f.id !== fileId));
      return;
    }

    try {
      const success = await mediaLibraryService.deleteFile(fileId);
      if (success) {
        setFiles(files.filter(f => f.id !== fileId));
        toast.success('File deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category)))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Media Library</h1>
              <p className="text-muted-foreground mt-1">
                Manage course content, images, videos, and documents
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Media Files</DialogTitle>
                    <DialogDescription>
                      Upload images, videos, documents, and other files for your courses.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select Files</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        className="w-full p-2 border rounded-md"
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                        <option value="document">Documents</option>
                        <option value="presentation">Presentations</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe this file..."
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tags">Tags (Optional)</Label>
                      <Input
                        id="tags"
                        placeholder="Separate tags with commas"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search files by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading media files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first media file to get started'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      {getFileIcon(file.mimeType)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1 line-clamp-2" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    
                    {file.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{file.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Size</th>
                    <th className="text-left p-4">Uploaded</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-muted/20">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.mimeType)}
                          <div>
                            <p className="font-medium">{file.originalName}</p>
                            {file.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{file.category}</Badge>
                      </td>
                      <td className="p-4 text-sm">{formatFileSize(file.size)}</td>
                      <td className="p-4 text-sm">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;