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

  // Sample course data
  const courses: Course[] = [
    {
      id: 1,
      title: 'UI Design Fundamentals & Best Practice',
      category: 'Design',
      priority: 'Not Urgent',
      lessonsCount: 12,
      completionRate: 64,
      accuracy: 80,
      timeEstimate: '30 min',
      lastModified: '2 days ago',
      tags: ['UI/UX', 'Prototyping'],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      enrolled: 142,
      instructor: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor1'
      }
    },
    {
      id: 2,
      title: 'Financial Reporting Ethics Assessment',
      category: 'Finance',
      priority: 'High',
      lessonsCount: 25,
      completionRate: 30,
      accuracy: 75,
      timeEstimate: '45 min',
      lastModified: '1 week ago',
      tags: ['Audit', 'Compliance'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      enrolled: 97,
      instructor: {
        name: 'Michael Chen',
        avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor2'
      }
    },
    {
      id: 3,
      title: 'Cybersecurity Awareness Training',
      category: 'IT',
      priority: 'Medium',
      lessonsCount: 15,
      completionRate: 0,
      accuracy: 0,
      timeEstimate: '20 min',
      lastModified: '3 days ago',
      tags: ['Security', 'Compliance'],
      image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      enrolled: 110,
      instructor: {
        name: 'Alex Rodriguez',
        avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor3'
      }
    },
    {
      id: 4,
      title: 'Risk Assessment Methodology',
      category: 'Risk',
      priority: 'Not Urgent',
      lessonsCount: 18,
      completionRate: 100,
      accuracy: 92,
      timeEstimate: '35 min',
      lastModified: '2 weeks ago',
      tags: ['Audit', 'Risk Management'],
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      enrolled: 156,
      instructor: {
        name: 'Emily Wilson',
        avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor4'
      }
    }
  ];

  // Filter courses based on search and active filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'completed') return matchesSearch && course.completionRate === 100;
    if (activeFilter === 'in-progress') return matchesSearch && course.completionRate > 0 && course.completionRate < 100;
    if (activeFilter === 'not-started') return matchesSearch && course.completionRate === 0;
    
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
        <div className="container max-w-7xl mx-auto">
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
              <p className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.enrolled, 0)}</p>
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
                {Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)}%
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
              <p className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.lessonsCount, 0)}</p>
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
            <Card key={course.id} className="p-5 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col space-y-4">
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-semibold text-lg text-white">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-white/80">{course.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(course.priority)}`}>
                        {course.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={course.instructor.avatar} />
                      <AvatarFallback>{course.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{course.instructor.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.timeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{course.lastModified}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditCourse; 