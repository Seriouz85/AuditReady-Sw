import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Image, 
  Video, 
  Upload, 
  Grid3X3, 
  List, 
  Filter, 
  Check,
  X,
  Play,
  Download,
  Eye,
  Clock,
  FileText,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { MediaItem, MediaCollection } from './types';
import { mediaSelectorService } from './services/MediaSelectorService';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  allowMultiple?: boolean;
  allowedTypes?: ('image' | 'video' | 'document' | 'audio')[];
  maxSelections?: number;
  title?: string;
}

// Media collections will be loaded from the service

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false,
  allowedTypes = ['image', 'video', 'document', 'audio'],
  maxSelections = 1,
  title = 'Select Media'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'stock' | 'uploads'>('stock');
  const [loading, setLoading] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  
  const parentRef = useRef<HTMLDivElement>(null);

  // Load media data from service
  useEffect(() => {
    const loadMediaData = async () => {
      setLoading(true);
      try {
        const searchResult = await mediaSelectorService.searchMedia({
          type: allowedTypes.length === 1 ? allowedTypes[0] : undefined
        });
        setAllMedia(searchResult.data.filter(item => allowedTypes.includes(item.type)));
        
        const availableCategories = await mediaSelectorService.getCategories();
        setCategories(['all', ...availableCategories]);
      } catch (error) {
        console.error('Failed to load media data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadMediaData();
    }
  }, [isOpen, allowedTypes]);

  // Filter and search media items
  const filteredMedia = useMemo(() => {
    let items = allMedia;

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    return items;
  }, [allMedia, searchQuery, selectedCategory]);

  // Track media usage when items are selected
  const trackMediaUsage = useCallback(async (item: MediaItem, action: 'view' | 'select') => {
    try {
      await mediaSelectorService.trackUsage(item.id, action);
    } catch (error) {
      console.warn('Failed to track media usage:', error);
    }
  }, []);

  // Virtual scrolling for performance with large collections
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredMedia.length / (viewMode === 'grid' ? 4 : 1)),
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'grid' ? 200 : 80),
    overscan: 5,
  });

  // Handle item selection
  const handleItemSelect = useCallback((item: MediaItem) => {
    // Track selection
    trackMediaUsage(item, 'select');
    
    if (allowMultiple) {
      setSelectedItems(prev => {
        const isSelected = prev.some(selected => selected.id === item.id);
        if (isSelected) {
          return prev.filter(selected => selected.id !== item.id);
        } else if (prev.length < maxSelections) {
          return [...prev, item];
        }
        return prev;
      });
    } else {
      setSelectedItems([item]);
    }
  }, [allowMultiple, maxSelections, trackMediaUsage]);

  // Confirm selection
  const handleConfirmSelection = useCallback(() => {
    if (selectedItems.length > 0) {
      onSelect(allowMultiple ? selectedItems : selectedItems[0]);
      onClose();
    }
  }, [selectedItems, allowMultiple, onSelect, onClose]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render media item card
  const renderMediaCard = (item: MediaItem, index: number) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    return (
      <Card 
        key={item.id}
        className={cn(
          "relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          "group overflow-hidden",
          isSelected && "ring-2 ring-blue-500 shadow-lg"
        )}
        onClick={() => handleItemSelect(item)}
      >
        <CardContent className="p-0">
          {/* Media Preview */}
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            {item.type === 'image' ? (
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            ) : item.type === 'video' ? (
              <div className="relative">
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-80" />
                </div>
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(item.duration)}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Stock badge */}
            {item.isStock && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  Stock
                </Badge>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 opacity-0 group-hover:opacity-100">
              <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                <Button size="sm" variant="secondary" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="secondary" className="px-2">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Info */}
          <div className="p-3">
            <h4 className="font-medium text-sm line-clamp-1 mb-1">{item.name}</h4>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{formatFileSize(item.size)}</span>
              <span className="uppercase">{item.format}</span>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center gap-4 pb-4 border-b">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'stock' | 'uploads')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Stock Media</TabsTrigger>
            <TabsTrigger value="uploads">My Uploads</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="flex-1 flex flex-col mt-4">
            {/* Media Grid */}
            <div 
              ref={parentRef}
              className="flex-1 overflow-auto"
              style={{ height: '100%' }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                  const startIndex = virtualRow.index * (viewMode === 'grid' ? 4 : 1);
                  const endIndex = Math.min(startIndex + (viewMode === 'grid' ? 4 : 1), filteredMedia.length);
                  const items = filteredMedia.slice(startIndex, endIndex);

                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className={cn(
                        viewMode === 'grid' 
                          ? "grid grid-cols-4 gap-4 p-4" 
                          : "space-y-2 p-2"
                      )}>
                        {items.map((item, index) => renderMediaCard(item, startIndex + index))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="uploads" className="flex-1 flex flex-col mt-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Your Media</h3>
                <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 && (
              <span>
                {selectedItems.length} of {maxSelections} selected
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
            >
              Select {selectedItems.length > 0 && `(${selectedItems.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};