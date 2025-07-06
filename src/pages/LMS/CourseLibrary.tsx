import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  ChevronLeft,
  SlidersHorizontal,
  Grid3x3,
  List,
  BookMarked,
  GraduationCap,
  Globe,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CourseCard } from '@/components/LMS/CourseCard';
import { demoCoursesData, demoInstructors } from '@/data/lms/demoCourses';
import { usePageView } from '@/lib/tracking';

const CourseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('title');

  // Track page view
  usePageView('course-library', 'page', 'Course Library');

  // Available courses (published only)
  const availableCourses = demoCoursesData.filter(course => course.is_published);

  // Extract unique categories, difficulties, and languages for filters
  const categories = [...new Set(availableCourses.map(course => course.category))];
  const difficulties = [...new Set(availableCourses.map(course => course.difficulty_level))];
  const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin']; // Mock languages

  // Filter and sort courses
  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
    // For now, all courses are in English (mock data)
    const matchesLanguage = selectedLanguage === 'all' || selectedLanguage === 'English';
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesLanguage;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return a.estimated_duration - b.estimated_duration;
      case 'modules':
        return b.total_modules - a.total_modules;
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        return difficultyOrder[a.difficulty_level as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty_level as keyof typeof difficultyOrder];
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance': return <BookMarked className="h-4 w-4" />;
      case 'security-awareness': return <GraduationCap className="h-4 w-4" />;
      case 'data-protection': return <Tag className="h-4 w-4" />;
      case 'risk': return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/lms">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Course Library</h1>
              <p className="text-white/90 text-sm md:text-base">Discover and explore our comprehensive cybersecurity training catalog</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-white" />
                <div>
                  <p className="text-2xl font-bold">{filteredCourses.length}</p>
                  <p className="text-white/80 text-sm">Courses</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-white" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(filteredCourses.reduce((sum, c) => sum + c.estimated_duration, 0) / 60)}h</p>
                  <p className="text-white/80 text-sm">Total Content</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Tag className="h-8 w-8 text-white" />
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-white/80 text-sm">Categories</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-white" />
                <div>
                  <p className="text-2xl font-bold">{languages.length}</p>
                  <p className="text-white/80 text-sm">Languages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-8 border-0 shadow-md">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {category.replace('-', ' ')}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        <Badge className={getDifficultyColor(difficulty)}>
                          {difficulty}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(language => (
                      <SelectItem key={language} value={language}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {language}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="modules">Module Count</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
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
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-muted-foreground text-sm">
              {searchQuery && `Results for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory.replace('-', ' ')}`}
            </p>
          </div>
        </div>

        {/* Course Grid/List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedLanguage('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                category={course.category}
                difficulty={course.difficulty_level as 'beginner' | 'intermediate' | 'advanced'}
                duration={course.estimated_duration}
                totalModules={course.total_modules}
                thumbnailUrl={course.thumbnail_url}
                isPublished={course.is_published}
                isMandatory={course.is_mandatory}
                instructor={demoInstructors[course.created_by as keyof typeof demoInstructors]}
                tags={course.tags}
                onView={() => navigate(`/lms/viewer/${course.id}`)}
                className={viewMode === 'list' ? 'w-full' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLibrary;