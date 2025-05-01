import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Clock,
  Calendar,
  Download,
  Trophy,
  Filter,
  Search,
  ArrowUpRight,
  MoreHorizontal,
  TrendingUp,
  Activity
} from 'lucide-react';
import LiveDashboard from '@/components/LMS/Dashboard';
import { usePageView } from '@/lib/tracking';

// Mock data
const courseCompletionData = [
  { name: 'Introduction to Audit', completed: 75, enrolled: 142, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'Financial Reporting Standards', completed: 48, enrolled: 97, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'Risk Assessment', completed: 62, enrolled: 110, image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'UI/UX Design Principles', completed: 88, enrolled: 156, image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'Design Thinking Workshop', completed: 32, enrolled: 78, image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
];

const topPerformers = [
  { id: 1, name: 'Alex Johnson', score: 96, completedCourses: 8, department: 'Design', image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=performer1' },
  { id: 2, name: 'Maria Rodriguez', score: 94, completedCourses: 7, department: 'Engineering', image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=performer2' },
  { id: 3, name: 'Sam Lee', score: 91, completedCourses: 6, department: 'Product', image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=performer3' },
  { id: 4, name: 'Taylor Patel', score: 89, completedCourses: 8, department: 'Marketing', image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=performer4' },
  { id: 5, name: 'Jordan Smith', score: 87, completedCourses: 5, department: 'Finance', image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=performer5' },
];

// Sample data for trend charts
const userTrends = {
  weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  data: [120, 145, 187, 234]
};

const completionTrends = {
  weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  data: [32, 68, 105, 178]
};

const departmentBreakdown = [
  { name: 'Design', usersCompleted: 42, totalUsers: 48, color: '#8b5cf6' },
  { name: 'Engineering', usersCompleted: 37, totalUsers: 55, color: '#3b82f6' },
  { name: 'Product', usersCompleted: 28, totalUsers: 32, color: '#10b981' },
  { name: 'Marketing', usersCompleted: 18, totalUsers: 24, color: '#f59e0b' },
  { name: 'Finance', usersCompleted: 23, totalUsers: 30, color: '#ef4444' },
];

const activityOverview = {
  activeUsers: 234,
  coursesCompleted: 178,
  avgTimePerCourse: '3h 45m',
  totalLearningHours: 682
};

// User activity data
const userActivities = [
  { id: 1, user: 'Alex J.', action: 'Completed', course: 'UI/UX Design Principles', time: '2 hours ago' },
  { id: 2, user: 'Maria R.', action: 'Started', course: 'Financial Reporting Standards', time: '3 hours ago' },
  { id: 3, user: 'Sam L.', action: 'Achieved 80%', course: 'Risk Assessment', time: '5 hours ago' },
  { id: 4, user: 'Taylor P.', action: 'Completed Quiz', course: 'Design Thinking Workshop', time: '1 day ago' },
  { id: 5, user: 'Jordan S.', action: 'Joined', course: 'Introduction to Audit', time: '1 day ago' }
];

// Function to get the badge styling based on score
const getScoreBadgeStyle = (score: number) => {
  if (score >= 95) return { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' };
  if (score >= 90) return { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200' };
  if (score >= 85) return { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' };
  return { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' };
};

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Track page view
  usePageView('reports', 'page', 'LMS Reports & Analytics');

  // Handler for exporting reports
  const handleExportReport = () => {
    alert('Exporting report data...');
    // In a real app, this would trigger a download of reports in CSV/PDF
  };

  // Handler for filtering by department
  const handleDepartmentFilter = (department: string) => {
    setSelectedDepartment(department);
    // In a real app, this would filter the displayed data
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
            <h1 className="text-2xl font-bold">Learning Reports & Analytics</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Active Users</h3>
                <div className="bg-indigo-400/20 p-2 rounded-full group-hover:bg-indigo-400/30 transition-colors">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{activityOverview.activeUsers}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Courses Completed</h3>
                <div className="bg-purple-400/20 p-2 rounded-full group-hover:bg-purple-400/30 transition-colors">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{activityOverview.coursesCompleted}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Avg Time per Course</h3>
                <div className="bg-blue-400/20 p-2 rounded-full group-hover:bg-blue-400/30 transition-colors">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{activityOverview.avgTimePerCourse}</p>
              <Badge className="mt-2 bg-amber-400/20 text-amber-100 rounded-full border-0">
                <Activity className="h-3 w-3 mr-1" />
                -5% from last month
              </Badge>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/15 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Total Learning Hours</h3>
                <div className="bg-pink-400/20 p-2 rounded-full group-hover:bg-pink-400/30 transition-colors">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{activityOverview.totalLearningHours}</p>
              <Badge className="mt-2 bg-green-400/20 text-green-100 rounded-full border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last month
              </Badge>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto rounded-full p-1">
              <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="courses" className="rounded-full">Courses</TabsTrigger>
              <TabsTrigger value="users" className="rounded-full">Users</TabsTrigger>
              <TabsTrigger value="departments" className="rounded-full">Departments</TabsTrigger>
              <TabsTrigger value="live" className="rounded-full">Live Activity</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <TabsContent value="overview" className="mt-6">
              {/* Course Completion Overview */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Course Completion Overview</h2>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <div className="space-y-4">
                  {courseCompletionData.map((course, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium">{course.name}</h3>
                          <span className="text-sm text-muted-foreground">{course.completed}% completed</span>
                        </div>
                        <Progress value={course.completed} className="h-2" />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">{course.enrolled} enrolled</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((course.completed / 100) * course.enrolled)} completed
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Top Performers */}
              <Card className="p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Top Performers</h2>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {topPerformers.map((performer) => {
                    const badgeStyle = getScoreBadgeStyle(performer.score);
                    return (
                      <div key={performer.id} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={performer.image} />
                          <AvatarFallback>{performer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{performer.name}</h3>
                            <Badge className={`${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.hover}`}>
                              {performer.score}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">{performer.department}</span>
                            <span className="text-sm text-muted-foreground">{performer.completedCourses} courses completed</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="mt-6">
              <LiveDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reports; 