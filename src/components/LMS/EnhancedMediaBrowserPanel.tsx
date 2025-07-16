import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Music, 
  Upload,
  Loader2,
  Check,
  Grid,
  List,
  Play,
  Download,
  Eye,
  Plus,
  Tag,
  Calendar,
  User,
  FileDown,
  Trash2,
  Heart,
  Globe,
  Sparkles,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { mediaLibraryService } from '@/services/lms/MediaLibraryService';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/utils/toast';

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
  thumbnail?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
}

interface CopyrightFreeSource {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  license: string;
  icon: string;
}

interface EnhancedMediaBrowserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  filterType?: 'all' | 'image' | 'video' | 'document' | 'audio';
  className?: string;
}

const copyrightFreeSources: CopyrightFreeSource[] = [
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: 'High-quality photos for free',
    url: 'https://unsplash.com',
    type: 'image',
    license: 'Unsplash License',
    icon: 'https://unsplash.com/favicon.ico'
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    description: 'Free images, videos, and music',
    url: 'https://pixabay.com',
    type: 'image',
    license: 'Pixabay License',
    icon: 'https://pixabay.com/favicon.ico'
  },
  {
    id: 'pexels',
    name: 'Pexels',
    description: 'Free stock photos and videos',
    url: 'https://pexels.com',
    type: 'image',
    license: 'Pexels License',
    icon: 'https://pexels.com/favicon.ico'
  },
  {
    id: 'coverr',
    name: 'Coverr',
    description: 'Free stock videos',
    url: 'https://coverr.co',
    type: 'video',
    license: 'CC0',
    icon: 'https://coverr.co/favicon.ico'
  },
  {
    id: 'freesound',
    name: 'Freesound',
    description: 'Free audio clips and sounds',
    url: 'https://freesound.org',
    type: 'audio',
    license: 'Creative Commons',
    icon: 'https://freesound.org/favicon.ico'
  }
];

export const EnhancedMediaBrowserPanel: React.FC<EnhancedMediaBrowserPanelProps> = ({
  isOpen,
  onClose,
  onSelect,
  filterType = 'all',
  className
}) => {
  const { isDemo } = useAuth();
  const { organization } = useOrganization();
  
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(filterType);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'copyright-free'>('library');

  // Enhanced demo files with better metadata
  const demoFiles: MediaFile[] = [
    {
      id: 'demo-1',
      filename: 'cybersecurity-intro.mp4',
      originalName: 'Cybersecurity Introduction Video.mp4',
      mimeType: 'video/mp4',
      size: 15728640,
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=150&fit=crop',
      category: 'video',
      description: 'Introduction to cybersecurity fundamentals',
      tags: ['cybersecurity', 'training', 'introduction'],
      uploadedBy: 'Admin',
      uploadedAt: new Date().toISOString(),
      organizationId: 'demo-org',
      duration: 300,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: 'demo-2',
      filename: 'security-team.jpg',
      originalName: 'Security Team Meeting.jpg',
      mimeType: 'image/jpeg',
      size: 2048000,
      url: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=200&h=150&fit=crop',
      category: 'image',
      description: 'Professional security team collaboration',
      tags: ['team', 'security', 'professional'],
      uploadedBy: 'Training Manager',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      organizationId: 'demo-org',
      dimensions: { width: 1920, height: 1280 }
    },
    {
      id: 'demo-3',
      filename: 'phishing-guide.pdf',
      originalName: 'Phishing Awareness Guide.pdf',
      mimeType: 'application/pdf',
      size: 5242880,
      url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=150&fit=crop',
      category: 'document',
      description: 'Comprehensive guide on identifying phishing attacks',
      tags: ['phishing', 'security', 'awareness', 'guide'],
      uploadedBy: 'Security Expert',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      organizationId: 'demo-org'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, organization]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        setFiles(demoFiles);
      } else if (organization) {
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
    const file = event.target.files?.[0];
    if (!file || !organization || isDemo) return;

    try {
      setUploading(true);
      const url = await mediaLibraryService.uploadFile(file, selectedCategory);
      
      if (url) {
        await mediaLibraryService.saveFileMetadata({
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url,
          category: selectedCategory,
          organizationId: organization.id
        });
        
        toast.success('File uploaded successfully');
        loadFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Files', icon: <Grid className="h-4 w-4" />, count: files.length },
    { value: 'image', label: 'Images', icon: <ImageIcon className="h-4 w-4" />, count: files.filter(f => f.category === 'image').length },
    { value: 'video', label: 'Videos', icon: <Video className="h-4 w-4" />, count: files.filter(f => f.category === 'video').length },
    { value: 'document', label: 'Documents', icon: <FileText className="h-4 w-4" />, count: files.filter(f => f.category === 'document').length },
    { value: 'audio', label: 'Audio', icon: <Music className="h-4 w-4" />, count: files.filter(f => f.category === 'audio').length }
  ];

  const renderFileCard = (file: MediaFile) => (
    <Card 
      key={file.id}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
        selectedFile?.id === file.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      )}
      onClick={() => setSelectedFile(file)}
    >
      <CardContent className="p-0">
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
          {file.thumbnail || file.mimeType.startsWith('image/') ? (
            <img 
              src={file.thumbnail || file.url} 
              alt={file.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileIcon(file.mimeType)}
            </div>
          )}
          
          {file.mimeType.startsWith('video/') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
          
          {file.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-sm truncate" title={file.originalName}>
            {file.originalName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {file.category}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </span>
          </div>
          
          {file.dimensions && (
            <div className="text-xs text-gray-500 mt-1">
              {file.dimensions.width} × {file.dimensions.height}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderListItem = (file: MediaFile) => (
    <div 
      key={file.id}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
        selectedFile?.id === file.id ? "bg-blue-50 border-2 border-blue-500" : "hover:bg-gray-50 border-2 border-transparent"
      )}
      onClick={() => setSelectedFile(file)}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {file.thumbnail || file.mimeType.startsWith('image/') ? (
          <img 
            src={file.thumbnail || file.url} 
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          getFileIcon(file.mimeType)
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate" title={file.originalName}>
          {file.originalName}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {file.category}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(file.uploadedAt)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(file); }}>
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Media Library</h2>
              <p className="text-sm text-gray-600 font-normal">Browse, upload, and manage your content assets</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="library">Library</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="copyright-free">Free</TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="space-y-4">
                <div className="space-y-2">
                  {categories.map(({ value, label, icon, count }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedCategory(value)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                        selectedCategory === value ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                      )}
                    >
                      {icon}
                      <span className="flex-1">{label}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your files here, or click to browse
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Choose Files
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="copyright-free" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Copyright-Free Sources</span>
                  </div>
                  {copyrightFreeSources.map((source) => (
                    <div key={source.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={source.icon} alt={source.name} className="w-4 h-4" />
                        <span className="font-medium text-sm">{source.name}</span>
                        <Badge variant="outline" className="text-xs">{source.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{source.description}</p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                          className="flex-1"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Controls */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Files Grid/List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <ImageIcon className="h-12 w-12 mb-4" />
                  <p>No files found</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredFiles.map(renderFileCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(renderListItem)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredFiles.length} files
                  {selectedFile && (
                    <span className="ml-2">
                      • {selectedFile.originalName} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedFile && onSelect(selectedFile)}
                    disabled={!selectedFile}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};