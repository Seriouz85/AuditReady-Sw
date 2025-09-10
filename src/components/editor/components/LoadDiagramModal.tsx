/**
 * 📂 Load Diagram Modal - Organization-based Folder Structure
 * Beautiful modal for loading/opening saved diagrams with folder organization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  Calendar,
  User,
  Tag,
  FolderOpen,
  Clock,
  BarChart3,
  Trash2,
  Download,
  Share2,
  Star,
  StarOff,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface DiagramData {
  id: string;
  projectName: string;
  projectDescription: string;
  timestamp: string;
  updatedAt?: string;
  nodeCount: number;
  edgeCount: number;
  createdBy: string;
  organizationId: string;
  tags: string[];
  isPublic: boolean;
  isFavorite?: boolean;
  nodes: any[];
  edges: any[];
  version: string;
}

interface LoadDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (diagramData: DiagramData) => void;
}

const LoadDiagramModal: React.FC<LoadDiagramModalProps> = ({
  isOpen,
  onClose,
  onLoad
}) => {
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  const [filteredDiagrams, setFilteredDiagrams] = useState<DiagramData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load diagrams from storage
  useEffect(() => {
    if (isOpen) {
      const savedDiagrams = JSON.parse(localStorage.getItem('org-shared-diagrams') || '[]');
      setDiagrams(savedDiagrams);
      setFilteredDiagrams(savedDiagrams);
    }
  }, [isOpen]);

  // Filter and search diagrams
  useEffect(() => {
    let filtered = [...diagrams];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(diagram => 
        diagram.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diagram.projectDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diagram.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply folder filter
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(diagram => {
        switch (selectedFolder) {
          case 'recent':
            return new Date(diagram.updatedAt || diagram.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case 'favorites':
            return diagram.isFavorite;
          case 'shared':
            return diagram.isPublic;
          case 'private':
            return !diagram.isPublic;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.projectName.localeCompare(b.projectName);
          break;
        case 'date':
          compareValue = new Date(b.updatedAt || b.timestamp).getTime() - new Date(a.updatedAt || a.timestamp).getTime();
          break;
        case 'size':
          compareValue = (b.nodeCount + b.edgeCount) - (a.nodeCount + a.edgeCount);
          break;
      }
      return sortOrder === 'desc' ? compareValue : -compareValue;
    });

    setFilteredDiagrams(filtered);
  }, [diagrams, searchQuery, selectedFolder, sortBy, sortOrder]);

  const handleLoadDiagram = (diagram: DiagramData) => {
    onLoad(diagram);
    onClose();
  };

  const toggleFavorite = (diagramId: string) => {
    const updatedDiagrams = diagrams.map(d => 
      d.id === diagramId ? { ...d, isFavorite: !d.isFavorite } : d
    );
    setDiagrams(updatedDiagrams);
    localStorage.setItem('org-shared-diagrams', JSON.stringify(updatedDiagrams));
  };

  const deleteDiagram = (diagramId: string) => {
    if (confirm('Are you sure you want to delete this diagram?')) {
      const updatedDiagrams = diagrams.filter(d => d.id !== diagramId);
      setDiagrams(updatedDiagrams);
      localStorage.setItem('org-shared-diagrams', JSON.stringify(updatedDiagrams));
    }
  };

  const folders = [
    { id: 'all', name: 'All Diagrams', icon: FolderOpen, count: diagrams.length },
    { id: 'recent', name: 'Recent', icon: Clock, count: diagrams.filter(d => new Date(d.updatedAt || d.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
    { id: 'favorites', name: 'Favorites', icon: Star, count: diagrams.filter(d => d.isFavorite).length },
    { id: 'shared', name: 'Shared', icon: Share2, count: diagrams.filter(d => d.isPublic).length },
    { id: 'private', name: 'Private', icon: User, count: diagrams.filter(d => !d.isPublic).length }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex h-full">
          {/* Sidebar - Folders */}
          <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Load Diagram
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Choose from your saved diagrams
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {folders.map(folder => {
                const Icon = folder.icon;
                const isActive = selectedFolder === folder.id;
                return (
                  <motion.button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-200">
                      {folder.count}
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header Controls */}
            <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search diagrams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Diagrams List/Grid */}
            <ScrollArea className="flex-1 p-6">
              {filteredDiagrams.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'Create your first diagram to get started'}
                  </p>
                </div>
              ) : (
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }`}>
                  {filteredDiagrams.map(diagram => (
                    <motion.div
                      key={diagram.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="cursor-pointer bg-white/70 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{diagram.projectName}</h3>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(diagram.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                {diagram.isFavorite ? (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                ) : (
                                  <StarOff className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDiagram(diagram.id);
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {diagram.projectDescription}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>{diagram.nodeCount} shapes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(diagram.updatedAt || diagram.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {diagram.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {diagram.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  {tag}
                                </Badge>
                              ))}
                              {diagram.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{diagram.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <Button
                            onClick={() => handleLoadDiagram(diagram)}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Load Diagram
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadDiagramModal;