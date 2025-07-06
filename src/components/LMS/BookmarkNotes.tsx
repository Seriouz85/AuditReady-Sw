import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Bookmark, 
  BookmarkPlus,
  StickyNote,
  Plus,
  X,
  Search,
  Tag,
  Clock,
  Edit3,
  Trash2,
  Star,
  ChevronDown,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BookmarkItem {
  id: string;
  title: string;
  content?: string;
  moduleId: string;
  moduleName: string;
  timestamp: number; // Video timestamp in seconds or content position
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  type: 'bookmark' | 'note';
}

interface BookmarkNotesProps {
  moduleId: string;
  moduleName: string;
  moduleType: 'video' | 'text' | 'quiz' | 'assignment';
  currentPosition?: number; // For video: seconds, for text: character position
  onJumpTo?: (position: number) => void;
  className?: string;
}

const sampleBookmarks: BookmarkItem[] = [
  {
    id: '1',
    title: 'GDPR Definition',
    content: 'Key point about GDPR protecting EU residents\' personal data and privacy rights.',
    moduleId: 'mod-2-1',
    moduleName: 'Introduction to GDPR',
    timestamp: 145,
    tags: ['GDPR', 'Privacy', 'Definition'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isStarred: true,
    type: 'bookmark'
  },
  {
    id: '2',
    title: 'CIA Triad Note',
    content: 'Remember: Confidentiality, Integrity, Availability - these are the three pillars of information security. Need to review this for the exam.',
    moduleId: 'mod-2-2',
    moduleName: 'GDPR Implementation Guide',
    timestamp: 0,
    tags: ['Security', 'CIA Triad', 'Exam'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isStarred: false,
    type: 'note'
  },
  {
    id: '3',
    title: 'Data Breach Notification',
    content: '',
    moduleId: 'mod-2-1',
    moduleName: 'Introduction to GDPR',
    timestamp: 320,
    tags: ['GDPR', 'Breach', '72 hours'],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isStarred: true,
    type: 'bookmark'
  }
];

export const BookmarkNotes: React.FC<BookmarkNotesProps> = ({
  moduleId,
  moduleName,
  moduleType,
  currentPosition = 0,
  onJumpTo,
  className = ''
}) => {
  // State management
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(sampleBookmarks);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'bookmarks' | 'notes'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  
  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newType, setNewType] = useState<'bookmark' | 'note'>('bookmark');

  // Get current module bookmarks
  const currentModuleBookmarks = bookmarks.filter(b => b.moduleId === moduleId);
  
  // Get all unique tags
  const allTags = [...new Set(bookmarks.flatMap(b => b.tags))];
  
  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          bookmark.title.toLowerCase().includes(searchLower) ||
          bookmark.content?.toLowerCase().includes(searchLower) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter(bookmark => {
      // Filter by type
      if (filterType !== 'all') {
        return filterType === 'bookmarks' ? bookmark.type === 'bookmark' : bookmark.type === 'note';
      }
      return true;
    })
    .filter(bookmark => {
      // Filter by selected tags
      if (selectedTags.length > 0) {
        return selectedTags.every(tag => bookmark.tags.includes(tag));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Format timestamp
  const formatTimestamp = (seconds: number): string => {
    if (moduleType !== 'video') return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Create new bookmark/note
  const handleCreate = () => {
    if (!newTitle.trim()) return;
    
    const newBookmark: BookmarkItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle.trim(),
      content: newContent.trim(),
      moduleId,
      moduleName,
      timestamp: currentPosition,
      tags: newTags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      type: newType
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreating(false);
  };

  // Edit bookmark/note
  const handleEdit = (id: string, updates: Partial<BookmarkItem>) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === id 
        ? { ...bookmark, ...updates, updatedAt: new Date() }
        : bookmark
    ));
    setEditingId(null);
  };

  // Delete bookmark/note
  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  // Toggle star
  const handleToggleStar = (id: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === id 
        ? { ...bookmark, isStarred: !bookmark.isStarred, updatedAt: new Date() }
        : bookmark
    ));
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Bookmarks & Notes
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Quick Add for Current Module */}
      {!isCreating && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewType('bookmark');
                  setNewTitle(`Bookmark at ${formatTimestamp(currentPosition)}`);
                  setIsCreating(true);
                }}
                className="flex items-center gap-2"
              >
                <BookmarkPlus className="h-4 w-4" />
                Bookmark Here
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewType('note');
                  setNewTitle('');
                  setIsCreating(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Create {newType === 'bookmark' ? 'Bookmark' : 'Note'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={newType === 'bookmark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewType('bookmark')}
              >
                Bookmark
              </Button>
              <Button
                variant={newType === 'note' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewType('note')}
              >
                Note
              </Button>
            </div>
            
            <Input
              placeholder="Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            
            <Textarea
              placeholder="Content (optional)..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />
            
            <Input
              placeholder="Tags (comma separated)..."
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newTitle.trim()}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search bookmarks and notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Type: {filterType}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('bookmarks')}>
                  Bookmarks Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('notes')}>
                  Notes Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Alphabetical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTagFilter(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookmarks List */}
      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedTags.length > 0 
                  ? 'Try adjusting your filters'
                  : 'Create your first bookmark or note to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookmarks.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'bookmark' ? (
                        <Bookmark className="h-4 w-4 text-blue-500" />
                      ) : (
                        <StickyNote className="h-4 w-4 text-green-500" />
                      )}
                      
                      <h4 className="font-medium truncate">{item.title}</h4>
                      
                      {item.isStarred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      
                      {moduleType === 'video' && item.timestamp > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {formatTimestamp(item.timestamp)}
                        </Badge>
                      )}
                    </div>
                    
                    {item.content && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(item.updatedAt)}</span>
                      <span>•</span>
                      <span>{item.moduleName}</span>
                    </div>
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {moduleType === 'video' && item.timestamp > 0 && onJumpTo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onJumpTo(item.timestamp)}
                        className="h-8 w-8 p-0"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Star className={cn(
                        "h-4 w-4",
                        item.isStarred ? "text-yellow-500 fill-current" : "text-gray-400"
                      )} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};