import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  BarChart2, 
  FileText, 
  Calendar, 
  BookMarked, 
  Copy,
  ChevronLeft,
  Users,
  Trophy,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePageView } from '@/lib/tracking';
import { demoCoursesData, demoInstructors } from '@/data/lms/demoCourses';
import { CourseCard } from '@/components/LMS/CourseCard';

// Types
interface Course {
  id: number;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low' | 'Not Urgent';
  lessonsCount: number;
  completionRate: number;
  accuracy: number;
  timeEstimate: string;
  lastModified: string;
  tags: string[];
  image: string;
  enrolled: number;
  instructor: {
    name: string;
    avatar: string;
  };
}

const EditCourse: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Track page view
  usePageView('edit-courses', 'page', 'Edit Courses');

  // Use shared demo course data
  const courses = demoCoursesData;

  // Filter courses based on search and active filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'completed') return matchesSearch && course.is_published;
    if (activeFilter === 'in-progress') return matchesSearch && course.is_published;
    if (activeFilter === 'not-started') return matchesSearch && !course.is_published;
    
    return matchesSearch;
  });

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      case 'Not Urgent': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white p-8 relative overflow-hidden">
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
            <h1 className="text-2xl font-bold">Edit Courses</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Active Courses</h3>
                <div className="bg-indigo-400/20 p-2 rounded-full group-hover:bg-indigo-400/30 transition-colors">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{courses.length}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +4 from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Total Enrollments</h3>
                <div className="bg-purple-400/20 p-2 rounded-full group-hover:bg-purple-400/30 transition-colors">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{courses.length * 120}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Avg Completion Rate</h3>
                <div className="bg-blue-400/20 p-2 rounded-full group-hover:bg-blue-400/30 transition-colors">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">
                {Math.round(courses.filter(c => c.is_published).length / courses.length * 100)}%
              </p>
              <Badge className="mt-2 bg-amber-400/20 text-amber-100 rounded-full border-0">
                <Activity className="h-3 w-3 mr-1" />
                -5% from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Total Lessons</h3>
                <div className="bg-pink-400/20 p-2 rounded-full group-hover:bg-pink-400/30 transition-colors">
                  <BookMarked className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.total_modules, 0)}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last month
              </Badge>
            </Card>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Course</DialogTitle>
                </DialogHeader>
                {/* Add course form content here */}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
          <TabsList className="w-full md:w-auto rounded-full p-1">
            <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full">Completed</TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-full">In Progress</TabsTrigger>
            <TabsTrigger value="not-started" className="rounded-full">Not Started</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              onEdit={() => console.log('Edit course:', course.id)}
              onDelete={() => console.log('Delete course:', course.id)}
              onDuplicate={() => console.log('Duplicate course:', course.id)}
              onShare={() => console.log('Share course:', course.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditCourse; 