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
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface MediaBrowserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  filterType?: 'all' | 'image' | 'video' | 'document' | 'audio';
  className?: string;
}

export const MediaBrowserPanel: React.FC<MediaBrowserPanelProps> = ({
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

  // Demo media files
  const demoFiles: MediaFile[] = [
    {
      id: 'demo-1',
      filename: 'cybersecurity-intro.mp4',
      originalName: 'Cybersecurity Introduction Video.mp4',
      mimeType: 'video/mp4',
      size: 15728640,
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      category: 'video',
      description: 'Introduction to cybersecurity fundamentals',
      tags: ['cybersecurity', 'training', 'introduction'],
      uploadedBy: 'Admin',
      uploadedAt: new Date().toISOString(),
      organizationId: 'demo-org'
    },
    {
      id: 'demo-2',
      filename: 'phishing-guide.pdf',
      originalName: 'Phishing Awareness Guide.pdf',
      mimeType: 'application/pdf',
      size: 2048000,
      url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      category: 'document',
      description: 'Comprehensive guide on identifying phishing attacks',
      tags: ['phishing', 'security', 'awareness'],
      uploadedBy: 'Training Manager',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      organizationId: 'demo-org'
    },
    {
      id: 'demo-3',
      filename: 'security-infographic.png',
      originalName: 'Security Best Practices Infographic.png',
      mimeType: 'image/png',
      size: 1024000,
      url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
      category: 'image',
      description: 'Visual guide to security best practices',
      tags: ['security', 'infographic', 'visual'],
      uploadedBy: 'Design Team',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      organizationId: 'demo-org'
    },
    {
      id: 'demo-4',
      filename: 'iso27001-template.docx',
      originalName: 'ISO 27001 Implementation Template.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 512000,
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800',
      category: 'document',
      description: 'Template for ISO 27001 implementation',
      tags: ['ISO27001', 'template', 'compliance'],
      uploadedBy: 'Compliance Officer',
      uploadedAt: new Date(Date.now() - 259200000).toISOString(),
      organizationId: 'demo-org'
    },
    {
      id: 'demo-5',
      filename: 'training-podcast.mp3',
      originalName: 'Security Awareness Podcast Episode 1.mp3',
      mimeType: 'audio/mpeg',
      size: 8388608,
      url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
      category: 'audio',
      description: 'Monthly security awareness podcast',
      tags: ['podcast', 'audio', 'awareness'],
      uploadedBy: 'Communications',
      uploadedAt: new Date(Date.now() - 345600000).toISOString(),
      organizationId: 'demo-org'
    }
  ];

  useEffect(() => {
    if (isOpen && (organization || isDemo)) {
      loadFiles();
    }
  }, [isOpen, organization, isDemo]);

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
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
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

  const categories = [
    { value: 'all', label: 'All Files', icon: <Grid className="h-4 w-4" /> },
    { value: 'image', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'video', label: 'Videos', icon: <Video className="h-4 w-4" /> },
    { value: 'document', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { value: 'audio', label: 'Audio', icon: <Music className="h-4 w-4" /> }
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Media Library</h2>
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
          <label htmlFor="media-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" disabled={uploading || isDemo} asChild>
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </span>
            </Button>
          </label>
          <input
            id="media-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="border-b">
        <ScrollArea className="w-full">
          <div className="flex p-2 gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value as any)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {cat.icon}
                {cat.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 h-[calc(100vh-220px)]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No files found</p>
            {!isDemo && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => document.getElementById('media-upload')?.click()}
              >
                Upload First File
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 p-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
                  selectedFile?.id === file.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedFile(file)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {file.mimeType.startsWith('image/') || file.category === 'video' ? (
                    <img 
                      src={file.url} 
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file.mimeType)}
                    </div>
                  )}
                  {selectedFile?.id === file.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedFile?.id === file.id && "bg-muted"
                )}
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedFile?.id === file.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {selectedFile && (
        <div className="p-4 border-t bg-muted/30">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">{selectedFile.originalName}</p>
              {selectedFile.description && (
                <p className="text-xs text-muted-foreground mt-1">{selectedFile.description}</p>
              )}
            </div>
            {selectedFile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedFile.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
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
              Use This File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};