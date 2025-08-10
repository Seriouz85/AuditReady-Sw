/**
 * 🎨 Stunning Template Gallery - Jaw-Dropping Enterprise Templates
 * Beautiful, interactive template browser with categories and previews
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Search, Sparkles, Star, Download, Eye, Play, Crown,
  Shield, Building, Workflow, BarChart3, Database, Network,
  Users, Calendar, CheckCircle, TrendingUp, Zap, Award,
  Filter, SortDesc, Grid3X3, List, Bookmark, Heart,
  Clock, Tag, ArrowRight, ExternalLink, Copy, Share2
} from 'lucide-react';

import { useDiagramStore } from '../../../stores/diagramStore';
import { allTemplates as professionalTemplates } from '../../../data/templates/professionalTemplates';

interface StunningTemplateGalleryProps {
  onClose: () => void;
}

const StunningTemplateGallery: React.FC<StunningTemplateGalleryProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set());

  const { applyTemplate } = useDiagramStore();

  // Template categories with beautiful icons and descriptions
  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid3X3, count: professionalTemplates.length, color: 'from-blue-500 to-cyan-500' },
    { id: 'Audit & Compliance', name: 'Audit & Compliance', icon: Shield, count: 15, color: 'from-red-500 to-pink-500' },
    { id: 'Business Process', name: 'Business Process', icon: Workflow, count: 10, color: 'from-green-500 to-emerald-500' },
    { id: 'Technical', name: 'Technical Architecture', icon: Network, count: 10, color: 'from-purple-500 to-indigo-500' },
    { id: 'Project Management', name: 'Project Management', icon: Calendar, count: 8, color: 'from-orange-500 to-red-500' },
    { id: 'Data Flow', name: 'Data Flow', icon: Database, count: 7, color: 'from-teal-500 to-cyan-500' }
  ];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = professionalTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'complexity':
          const complexityOrder = { 'Simple': 1, 'Intermediate': 2, 'Advanced': 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        default:
          return 0;
      }
    });

    return filtered;
  }, [professionalTemplates, selectedCategory, searchTerm, sortBy]);

  // Animation variants
  const templateVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 20 } }
  };

  const categoryVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 }
  };

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    applyTemplate(template);
    onClose();
  };

  // Toggle favorite
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favoriteTemplates);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavoriteTemplates(newFavorites);
  };

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Stunning Templates
              </h2>
              <p className="text-sm text-gray-500">Jaw-dropping enterprise-grade templates</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-200/50 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white/70 border-gray-200/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="complexity">By Complexity</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-white/70 border-gray-200/50"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredTemplates.length} templates
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 py-4 border-b border-gray-200/50">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-md border border-gray-200/50 text-gray-900'
                      : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                  }`}
                  variants={categoryVariants}
                  animate={isActive ? 'active' : 'inactive'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-1 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs bg-gray-100 border-gray-200">
                    {category.count}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Template Grid/List */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={templateVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {template.name}
                              </CardTitle>
                              {template.isPremium && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {template.description}
                            </p>
                            
                            {/* Template Stats */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-current text-yellow-400" />
                                <span>{template.rating || '4.9'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="w-3 h-3" />
                                <span>{template.downloads || '1.2k'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>5 min setup</span>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                  +{template.tags.length - 3}
                                </Badge>
                              )}
                            </div>

                            {/* Complexity Badge */}
                            <Badge 
                              variant="outline"
                              className={`text-xs w-fit ${getComplexityColor(template.complexity)}`}
                            >
                              {template.complexity}
                            </Badge>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(template.id)}
                              className="p-1.5 hover:bg-pink-50"
                            >
                              <Heart 
                                className={`w-4 h-4 transition-all duration-200 ${
                                  favoriteTemplates.has(template.id) 
                                    ? 'fill-current text-pink-500' 
                                    : 'text-gray-400 hover:text-pink-500'
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleTemplateSelect(template)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-md"
                            size="sm"
                          >
                            <Play className="w-3 h-3 mr-1.5" />
                            Use Template
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                            className="bg-white/70 hover:bg-white border-gray-200/50"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/70 hover:bg-white border-gray-200/50"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>

                      {/* Hover overlay with quick actions */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        initial={false}
                      />
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // List View
            <div className="space-y-2">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={templateVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: index * 0.02 }}
                    className="group"
                  >
                    <div className="flex items-center p-4 bg-white/70 rounded-lg border border-gray-200/50 hover:bg-white/90 hover:shadow-md transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                          {template.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shrink-0">
                              <Crown className="w-3 h-3" />
                            </Badge>
                          )}
                          <Badge variant="outline" className={`shrink-0 ${getComplexityColor(template.complexity)}`}>
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>{template.rating || '4.9'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{template.downloads || '1.2k'}</span>
                          </span>
                          <span>{template.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(template.id)}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              favoriteTemplates.has(template.id) 
                                ? 'fill-current text-pink-500' 
                                : 'text-gray-400'
                            }`}
                          />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleTemplateSelect(template)}>
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                    <p className="text-gray-600">{previewTemplate.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Template Preview</p>
                    <p className="text-sm text-gray-400">Visual representation coming soon</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge className={getComplexityColor(previewTemplate.complexity)}>
                      {previewTemplate.complexity}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {previewTemplate.nodes?.length || 0} nodes, {previewTemplate.edges?.length || 0} connections
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      handleTemplateSelect(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StunningTemplateGallery;