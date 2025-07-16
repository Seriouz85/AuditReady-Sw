import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Star, 
  Filter, 
  Plus, 
  Eye, 
  Copy, 
  Edit3, 
  Trash2,
  BookOpen,
  Clock,
  Users,
  Award,
  Shield,
  TrendingUp,
  Zap,
  Target,
  CheckCircle,
  Download,
  Share2,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'security' | 'onboarding' | 'skills' | 'assessment';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating: number;
  usageCount: number;
  isFavorite: boolean;
  isRecommended: boolean;
  thumbnail: string;
  author: string;
  tags: string[];
  sections: Array<{
    title: string;
    modules: Array<{
      type: 'text' | 'video' | 'quiz' | 'link' | 'assignment';
      title: string;
      content: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onCreateFromTemplate: (template: Template) => void;
  isOpen: boolean;
  onClose: () => void;
}

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Cybersecurity Fundamentals',
    description: 'Comprehensive introduction to cybersecurity principles, threats, and best practices.',
    category: 'security',
    difficulty: 'beginner',
    duration: '45 min',
    rating: 4.8,
    usageCount: 1247,
    isFavorite: true,
    isRecommended: true,
    thumbnail: '/templates/cybersecurity.jpg',
    author: 'Security Team',
    tags: ['cybersecurity', 'fundamentals', 'threats', 'best-practices'],
    sections: [
      {
        title: 'Introduction to Cybersecurity',
        modules: [
          { type: 'text', title: 'What is Cybersecurity?', content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks...' },
          { type: 'video', title: 'Cybersecurity Overview', content: 'https://example.com/video1' },
          { type: 'quiz', title: 'Knowledge Check', content: '{"questions":[{"question":"What is cybersecurity?","options":["Protection of digital assets","Network maintenance","Software development","Data entry"],"correctAnswer":0}]}' }
        ]
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: '2',
    name: 'GDPR Compliance Training',
    description: 'Essential GDPR compliance training for handling personal data in the EU.',
    category: 'compliance',
    difficulty: 'intermediate',
    duration: '60 min',
    rating: 4.6,
    usageCount: 892,
    isFavorite: false,
    isRecommended: true,
    thumbnail: '/templates/gdpr.jpg',
    author: 'Legal Team',
    tags: ['GDPR', 'compliance', 'privacy', 'EU', 'data-protection'],
    sections: [
      {
        title: 'GDPR Overview',
        modules: [
          { type: 'text', title: 'Understanding GDPR', content: 'The General Data Protection Regulation (GDPR) is a comprehensive data protection law...' },
          { type: 'assignment', title: 'GDPR Assessment', content: 'Evaluate your organization\'s GDPR compliance...' }
        ]
      }
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  },
  {
    id: '3',
    name: 'New Employee Onboarding',
    description: 'Complete onboarding program for new team members covering policies, culture, and procedures.',
    category: 'onboarding',
    difficulty: 'beginner',
    duration: '90 min',
    rating: 4.9,
    usageCount: 2156,
    isFavorite: true,
    isRecommended: false,
    thumbnail: '/templates/onboarding.jpg',
    author: 'HR Team',
    tags: ['onboarding', 'new-employee', 'culture', 'policies'],
    sections: [
      {
        title: 'Welcome to the Team',
        modules: [
          { type: 'text', title: 'Company Overview', content: 'Welcome to our organization! This module will introduce you to our company culture...' },
          { type: 'video', title: 'CEO Welcome Message', content: 'https://example.com/welcome-video' }
        ]
      }
    ],
    createdAt: '2024-01-05T08:15:00Z',
    updatedAt: '2024-01-22T11:30:00Z'
  },
  {
    id: '4',
    name: 'Advanced Threat Detection',
    description: 'Advanced training on identifying and responding to sophisticated cyber threats.',
    category: 'security',
    difficulty: 'advanced',
    duration: '120 min',
    rating: 4.7,
    usageCount: 543,
    isFavorite: false,
    isRecommended: true,
    thumbnail: '/templates/threat-detection.jpg',
    author: 'Security Team',
    tags: ['threats', 'detection', 'advanced', 'response'],
    sections: [
      {
        title: 'Advanced Threat Landscape',
        modules: [
          { type: 'text', title: 'Emerging Threats', content: 'The cybersecurity landscape is constantly evolving...' },
          { type: 'quiz', title: 'Threat Identification', content: '{"questions":[{"question":"Which is an APT characteristic?","options":["Quick attacks","Persistent presence","Loud activities","Simple methods"],"correctAnswer":1}]}' }
        ]
      }
    ],
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-19T09:10:00Z'
  },
  {
    id: '5',
    name: 'Skills Assessment Framework',
    description: 'Comprehensive framework for assessing employee skills and competencies.',
    category: 'assessment',
    difficulty: 'intermediate',
    duration: '75 min',
    rating: 4.4,
    usageCount: 678,
    isFavorite: false,
    isRecommended: false,
    thumbnail: '/templates/assessment.jpg',
    author: 'Training Team',
    tags: ['assessment', 'skills', 'competencies', 'evaluation'],
    sections: [
      {
        title: 'Assessment Methodology',
        modules: [
          { type: 'text', title: 'Assessment Principles', content: 'Effective skills assessment requires a structured approach...' },
          { type: 'assignment', title: 'Self-Assessment', content: 'Complete a comprehensive self-assessment of your current skills...' }
        ]
      }
    ],
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-25T10:45:00Z'
  }
];

const categoryConfig = {
  compliance: { icon: Shield, color: 'bg-blue-500', label: 'Compliance' },
  security: { icon: Shield, color: 'bg-red-500', label: 'Security' },
  onboarding: { icon: Users, color: 'bg-green-500', label: 'Onboarding' },
  skills: { icon: TrendingUp, color: 'bg-purple-500', label: 'Skills' },
  assessment: { icon: Award, color: 'bg-orange-500', label: 'Assessment' }
};

const difficultyConfig = {
  beginner: { color: 'bg-green-100 text-green-800', label: 'Beginner' },
  intermediate: { color: 'bg-yellow-100 text-yellow-800', label: 'Intermediate' },
  advanced: { color: 'bg-red-100 text-red-800', label: 'Advanced' }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
  onCreateFromTemplate,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'recent'>('rating');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [templates, setTemplates] = useState(sampleTemplates);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    const matchesFavorites = !showFavoritesOnly || template.isFavorite;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesFavorites;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Template Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 p-4 border-b">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className={`h-4 w-4 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Levels</option>
                  {Object.entries(difficultyConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'usage' | 'recent')}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="rating">Rating</option>
                  <option value="usage">Usage</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const categoryInfo = categoryConfig[template.category];
                const difficultyInfo = difficultyConfig[template.difficulty];
                const CategoryIcon = categoryInfo.icon;

                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${categoryInfo.color} flex items-center justify-center`}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{template.name}</h3>
                            <p className="text-xs text-gray-500">{template.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(template.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Heart 
                              className={`h-4 w-4 ${template.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onCreateFromTemplate(template)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Use Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={difficultyInfo.color} variant="secondary">
                          {difficultyInfo.label}
                        </Badge>
                        {template.isRecommended && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Zap className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {template.usageCount.toLocaleString()} uses
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderStars(template.rating)}
                          <span className="text-sm text-gray-600 ml-1">{template.rating}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onCreateFromTemplate(template)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Template Preview Modal */}
        {previewTemplate && (
          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Template Preview: {previewTemplate.name}
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(previewTemplate.rating)}
                      <span className="text-sm text-gray-600 ml-1">{previewTemplate.rating}</span>
                    </div>
                    <Badge className={difficultyConfig[previewTemplate.difficulty].color}>
                      {difficultyConfig[previewTemplate.difficulty].label}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {previewTemplate.duration}
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{previewTemplate.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Course Structure:</h4>
                    {previewTemplate.sections.map((section, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h5 className="font-medium mb-2">{section.title}</h5>
                        <div className="space-y-1">
                          {section.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {module.type}
                              </Badge>
                              <span>{module.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        onCreateFromTemplate(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                    <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};