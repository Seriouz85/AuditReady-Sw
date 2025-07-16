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
  ChevronLeft,
  Play,
  Download,
  Eye,
  Plus,
  Tag,
  Calendar,
  User,
  FileDown,
  Heart,
  Globe,
  Sparkles,
  Shield,
  ExternalLink,
  Refresh
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { unifiedMediaLibraryService, MediaItem, SearchOptions } from '@/services/lms/UnifiedMediaLibraryService';
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

interface UnifiedMediaSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile | MediaItem) => void;
  filterType?: 'all' | 'image' | 'video' | 'document' | 'audio';
  className?: string;
}

const copyrightFreeSources = [
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: 'High-quality photos',
    url: 'https://unsplash.com',
    type: 'image',
    license: 'Unsplash License',
    icon: '🖼️'
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    description: 'Free images & videos',
    url: 'https://pixabay.com',
    type: 'image',
    license: 'Pixabay License',
    icon: '🎨'
  },
  {
    id: 'pexels',
    name: 'Pexels',
    description: 'Free stock photos',
    url: 'https://pexels.com',
    type: 'image',
    license: 'Pexels License',
    icon: '📸'
  },
  {
    id: 'coverr',
    name: 'Coverr',
    description: 'Free stock videos',
    url: 'https://coverr.co',
    type: 'video',
    license: 'CC0',
    icon: '🎬'
  }
];

export const UnifiedMediaSidePanel: React.FC<UnifiedMediaSidePanelProps> = ({
  isOpen,
  onClose,
  onSelect,
  filterType = 'all',
  className
}) => {
  const { isDemo } = useAuth();
  const { organization } = useOrganization();
  
  const [localFiles, setLocalFiles] = useState<MediaFile[]>([]);
  const [onlineMedia, setOnlineMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(filterType);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'upload'>('local');
  const [searchLoading, setSearchLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaFile | MediaItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      loadLocalFiles();
      if (activeTab === 'online' && searchTerm) {
        searchOnlineMedia();
      }
    }
  }, [isOpen, organization, activeTab]);

  useEffect(() => {
    if (activeTab === 'online' && searchTerm) {
      const debounceTimer = setTimeout(() => {
        searchOnlineMedia();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, activeTab]);

  const loadLocalFiles = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        setLocalFiles(demoFiles);
      } else if (organization) {
        const mediaFiles = await mediaLibraryService.getFiles(organization.id);
        setLocalFiles(mediaFiles);
      }
    } catch (error) {
      console.error('Error loading local files:', error);
      toast.error('Failed to load local files');
    } finally {
      setLoading(false);
    }
  };

  const searchOnlineMedia = async () => {
    if (!searchTerm.trim()) {
      setOnlineMedia([]);
      return;
    }

    try {
      setSearchLoading(true);
      const searchOptions: SearchOptions = {
        query: searchTerm,
        type: selectedCategory === 'all' ? 'all' : selectedCategory as any,
        page: 1,
        perPage: 20
      };

      const results = await unifiedMediaLibraryService.searchAll(searchOptions);
      setOnlineMedia(results);
    } catch (error) {
      console.error('Error searching online media:', error);
      toast.error('Failed to search online media');
    } finally {
      setSearchLoading(false);
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
        loadLocalFiles();
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

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'audio': return <Music className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredLocalFiles = localFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOnlineMedia = onlineMedia.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All', icon: <Grid className="h-4 w-4" /> },
    { value: 'image', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'video', label: 'Videos', icon: <Video className="h-4 w-4" /> },
    { value: 'document', label: 'Docs', icon: <FileText className="h-4 w-4" /> },
    { value: 'audio', label: 'Audio', icon: <Music className="h-4 w-4" /> }
  ];

  const renderMediaCard = (item: MediaFile | MediaItem, isOnline: boolean = false) => {
    const isSelected = selectedFile?.id === item.id;
    const thumbnail = 'thumbnail' in item ? item.thumbnail : item.thumbnailUrl;
    const originalName = 'originalName' in item ? item.originalName : item.title;
    const mimeType = 'mimeType' in item ? item.mimeType : `${item.type}/*`;
    const size = 'size' in item ? item.size : item.fileSize;
    const description = 'description' in item ? item.description : item.description;

    return (
      <div
        key={item.id}
        className={cn(
          "group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFile(item);
        }}
        onDoubleClick={() => {
          setPreviewItem(item);
          setShowPreview(true);
        }}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {thumbnail || (item.type === 'image' || mimeType.startsWith('image/')) ? (
            <img 
              src={thumbnail || item.url} 
              alt={originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileIcon(mimeType)}
            </div>
          )}
          
          {(item.type === 'video' || mimeType.startsWith('video/')) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
          
          {item.duration && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </div>
          )}

          {isOnline && (
            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Free
            </div>
          )}

          {isSelected && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-blue-600" />
            </div>
          )}
          
          {/* Preview button overlay */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewItem(item);
                setShowPreview(true);
              }}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-2">
          <h3 className="font-medium text-xs truncate" title={originalName}>
            {originalName}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs">
              {item.type || ('category' in item ? item.category : 'unknown')}
            </Badge>
            {size && (
              <span className="text-xs text-gray-500">
                {formatFileSize(size)}
              </span>
            )}
          </div>
          
          {item.dimensions && (
            <div className="text-xs text-gray-500 mt-1">
              {item.dimensions.width} × {item.dimensions.height}
            </div>
          )}

          {isOnline && 'source' in item && (
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                {item.source}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListItem = (item: MediaFile | MediaItem, isOnline: boolean = false) => {
    const isSelected = selectedFile?.id === item.id;
    const thumbnail = 'thumbnail' in item ? item.thumbnail : item.thumbnailUrl;
    const originalName = 'originalName' in item ? item.originalName : item.title;
    const mimeType = 'mimeType' in item ? item.mimeType : `${item.type}/*`;
    const size = 'size' in item ? item.size : item.fileSize;
    const uploadedAt = 'uploadedAt' in item ? item.uploadedAt : item.createdAt;

    return (
      <div
        key={item.id}
        className={cn(
          "flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer transition-colors border-l-2",
          isSelected ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
        )}
        onClick={() => setSelectedFile(item)}
        onDoubleClick={() => {
          setPreviewItem(item);
          setShowPreview(true);
        }}
      >
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {thumbnail || (item.type === 'image' || mimeType.startsWith('image/')) ? (
            <img 
              src={thumbnail || item.url} 
              alt={originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            getFileIcon(mimeType)
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={originalName}>
            {originalName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {item.type || ('category' in item ? item.category : 'unknown')}
            </Badge>
            {size && (
              <span className="text-xs text-gray-500">
                {formatFileSize(size)}
              </span>
            )}
            {uploadedAt && (
              <span className="text-xs text-gray-500">
                {formatDate(uploadedAt)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isOnline && (
            <Badge variant="outline" className="text-xs">
              Free
            </Badge>
          )}
          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] lg:w-[480px] bg-white border-l shadow-xl transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              Media Library
            </h2>
            <p className="text-sm text-gray-600">Browse and select content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="h-8 w-8"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Local
            </TabsTrigger>
            <TabsTrigger value="online" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Online
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={activeTab === 'online' ? "Search online media..." : "Search files..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
          {activeTab === 'online' && searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="border-b overflow-hidden">
        <ScrollArea className="w-full" type="scroll">
          <div className="flex p-2 gap-1 min-w-max">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value as any)}
                className="flex-shrink-0 flex items-center gap-1 whitespace-nowrap text-xs px-3 py-1 h-7"
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.slice(0, 3)}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 h-[calc(100vh-300px)]">
        {activeTab === 'local' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredLocalFiles.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No files found</p>
                {!isDemo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload Files
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 p-4">
                {filteredLocalFiles.map(file => renderMediaCard(file, false))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredLocalFiles.map(file => renderListItem(file, false))}
              </div>
            )}
          </>
        )}

        {activeTab === 'online' && (
          <>
            {!searchTerm ? (
              <div className="p-4 space-y-4">
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Search copyright-free media</p>
                  <p className="text-xs text-gray-500">Enter a search term to find free images and videos</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Available Sources</span>
                  </div>
                  {copyrightFreeSources.map((source) => (
                    <div key={source.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{source.icon}</span>
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
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredOnlineMedia.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No results found</p>
                <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 p-4">
                {filteredOnlineMedia.map(item => renderMediaCard(item, true))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredOnlineMedia.map(item => renderListItem(item, true))}
              </div>
            )}
          </>
        )}

        {activeTab === 'upload' && (
          <div className="p-4 space-y-4">
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
                disabled={uploading || isDemo}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Choose Files
              </Button>
              {isDemo && (
                <p className="text-xs text-gray-500 mt-2">
                  Upload is disabled in demo mode
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Supported formats:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  <span>Images: JPG, PNG, GIF, SVG</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  <span>Videos: MP4, WebM, AVI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-purple-500" />
                  <span>Audio: MP3, WAV, AAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Docs: PDF, DOC, PPT</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {selectedFile && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">
                {'originalName' in selectedFile ? selectedFile.originalName : selectedFile.title}
              </p>
              {selectedFile.description && (
                <p className="text-xs text-gray-600 mt-1">{selectedFile.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {'source' in selectedFile && (
                <Badge variant="outline" className="text-xs">
                  {selectedFile.source}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {selectedFile.type || ('category' in selectedFile ? selectedFile.category : 'unknown')}
              </Badge>
            </div>

            {'tags' in selectedFile && selectedFile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedFile.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {selectedFile.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedFile.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <Button
              className="w-full"
              size="sm"
              onClick={() => {
                onSelect(selectedFile);
                onClose();
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Use This File
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewItem && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">
                {'originalName' in previewItem ? previewItem.originalName : previewItem.title}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelect(previewItem);
                    setShowPreview(false);
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Use This
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-200px)]">
              {/* Preview content based on type */}
              {(previewItem.type === 'image' || ('mimeType' in previewItem && previewItem.mimeType.startsWith('image/'))) && (
                <img
                  src={previewItem.url}
                  alt={'originalName' in previewItem ? previewItem.originalName : previewItem.title}
                  className="max-w-full h-auto mx-auto"
                />
              )}
              
              {(previewItem.type === 'video' || ('mimeType' in previewItem && previewItem.mimeType.startsWith('video/'))) && (
                <video
                  src={previewItem.url}
                  controls
                  className="max-w-full h-auto mx-auto"
                  poster={'thumbnail' in previewItem ? previewItem.thumbnail : previewItem.thumbnailUrl}
                />
              )}
              
              {(previewItem.type === 'audio' || ('mimeType' in previewItem && previewItem.mimeType.startsWith('audio/'))) && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
                    <Music className="h-16 w-16 text-purple-600" />
                  </div>
                  <audio src={previewItem.url} controls className="w-full max-w-md" />
                </div>
              )}
              
              {(previewItem.type === 'document' || ('mimeType' in previewItem && (previewItem.mimeType.includes('pdf') || previewItem.mimeType.includes('document')))) && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-16 w-16 text-blue-600" />
                  </div>
                  <p className="text-gray-600">Document preview not available</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewItem.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2">{previewItem.type || ('category' in previewItem ? previewItem.category : 'unknown')}</span>
                </div>
                {'size' in previewItem && previewItem.size && (
                  <div>
                    <span className="font-medium text-gray-600">Size:</span>
                    <span className="ml-2">{formatFileSize(previewItem.size)}</span>
                  </div>
                )}
                {previewItem.dimensions && (
                  <div>
                    <span className="font-medium text-gray-600">Dimensions:</span>
                    <span className="ml-2">{previewItem.dimensions.width} × {previewItem.dimensions.height}</span>
                  </div>
                )}
                {'source' in previewItem && (
                  <div>
                    <span className="font-medium text-gray-600">Source:</span>
                    <span className="ml-2">{previewItem.source}</span>
                  </div>
                )}
              </div>
              {previewItem.description && (
                <p className="text-sm text-gray-600 mt-3">{previewItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};