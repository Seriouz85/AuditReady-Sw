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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="w-full md:w-auto rounded-full p-1">
              <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="courses" className="rounded-full">Courses</TabsTrigger>
              <TabsTrigger value="users" className="rounded-full">Users</TabsTrigger>
              <TabsTrigger value="departments" className="rounded-full">Departments</TabsTrigger>
              <TabsTrigger value="live" className="rounded-full">Live Activity</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reports..."
                className="pl-10 rounded-full w-full md:w-64"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-40 rounded-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDepartment} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-full md:w-40 rounded-full">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Add Live Dashboard Tab */}
        <TabsContent value="live" className="mt-0">
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <LiveDashboard limit={10} refreshInterval={5000} />
          </Card>
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Course Completion Section */}
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Course Completion Rates</h2>
                <p className="text-muted-foreground">How well are users completing assigned courses</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {courseCompletionData.map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground">{course.completed} of {course.enrolled} completed</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3">
                      {Math.round((course.completed / course.enrolled) * 100)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={(course.completed / course.enrolled) * 100} 
                    className="h-3 rounded-full bg-gray-100" 
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline" className="rounded-full">
                View All Courses
              </Button>
            </div>
          </Card>
          
          {/* Top Performers */}
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Top Performers</h2>
                <p className="text-muted-foreground">Users with highest course scores</p>
              </div>
              <Button variant="link" className="flex items-center text-primary">
                View all 
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {topPerformers.map((user) => {
                const badgeStyle = getScoreBadgeStyle(user.score);
                return (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-white shadow-sm">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.completedCourses} courses completed • {user.department}</p>
                      </div>
                    </div>
                    <Badge className={`${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.hover} rounded-full px-3`}>
                      {user.score}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <p className="text-muted-foreground">Latest user interactions with courses</p>
              </div>
              <Button variant="outline" className="rounded-full">
                <Activity className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </div>
            
            <div className="space-y-4">
              {userActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.user} <span className="text-muted-foreground">{activity.action}</span> {activity.course}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Department Progress */}
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Department Progress</h2>
                <p className="text-muted-foreground">Completion rates by department</p>
              </div>
              <Button variant="outline" className="rounded-full">
                <PieChart className="h-4 w-4 mr-2" />
                View as Chart
              </Button>
            </div>
            
            <div className="space-y-4">
              {departmentBreakdown.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{dept.name} Department</p>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full px-3">
                      {Math.round((dept.usersCompleted / dept.totalUsers) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(dept.usersCompleted / dept.totalUsers) * 100} 
                      className="h-3 rounded-full bg-gray-100 flex-1" 
                      style={{ 
                        background: `linear-gradient(to right, ${dept.color} 0%, ${dept.color} ${(dept.usersCompleted / dept.totalUsers) * 100}%, #f3f4f6 ${(dept.usersCompleted / dept.totalUsers) * 100}%, #f3f4f6 100%)` 
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {dept.usersCompleted}/{dept.totalUsers}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-0">
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Course Analytics</h2>
            <p className="text-muted-foreground mb-8">Detailed performance metrics for each course</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-medium mb-2">Enrollment Growth</h3>
                <p className="text-sm text-muted-foreground mb-4">New enrollments over time</p>
                <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-end p-4">
                  {userTrends.data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-6 bg-white/80 rounded-t-lg mb-1"
                        style={{ height: `${(value / Math.max(...userTrends.data)) * 100}px` }}
                      ></div>
                      <span className="text-xs text-white">{userTrends.weeks[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-medium mb-2">Course Completions</h3>
                <p className="text-sm text-muted-foreground mb-4">Number of course completions per week</p>
                <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-end p-4">
                  {completionTrends.data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-6 bg-white/80 rounded-t-lg mb-1"
                        style={{ height: `${(value / Math.max(...completionTrends.data)) * 100}px` }}
                      ></div>
                      <span className="text-xs text-white">{completionTrends.weeks[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courseCompletionData.map((course) => (
                <Card key={course.name} className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <div className="h-32 relative">
                    <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2">
                      <h3 className="text-white font-medium">{course.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-muted-foreground">{course.completed} of {course.enrolled} completed</p>
                      <Badge className="bg-primary/10 text-primary rounded-full px-2">
                        {Math.round((course.completed / course.enrolled) * 100)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={(course.completed / course.enrolled) * 100} 
                      className="h-2 rounded-full bg-gray-100 mb-3" 
                    />
                    <Button variant="outline" className="w-full rounded-full mt-2 text-sm py-1">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all">
                View All Course Details
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-0">
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">User Performance Analytics</h2>
            <p className="text-muted-foreground mb-8">In-depth metrics on user engagement and progress</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="font-medium mb-4">Top 5 Most Active Users</h3>
                <div className="space-y-3">
                  {topPerformers.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="border-2 border-white shadow-sm">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center">
                          <Progress 
                            value={user.score} 
                            className="h-2 rounded-full bg-gray-200 flex-1 mr-2" 
                          />
                          <span className="text-xs">{user.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="font-medium mb-4">User Engagement by Department</h3>
                <div className="space-y-3">
                  {departmentBreakdown.map((dept) => (
                    <div key={dept.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <div className="flex-1">
                        <p className="font-medium">{dept.name}</p>
                        <div className="flex items-center">
                          <Progress 
                            value={(dept.usersCompleted / dept.totalUsers) * 100} 
                            className="h-2 rounded-full bg-gray-200 flex-1 mr-2" 
                            style={{ 
                              background: `linear-gradient(to right, ${dept.color} 0%, ${dept.color} ${(dept.usersCompleted / dept.totalUsers) * 100}%, #e5e7eb ${(dept.usersCompleted / dept.totalUsers) * 100}%, #e5e7eb 100%)` 
                            }}
                          />
                          <span className="text-xs">{Math.round((dept.usersCompleted / dept.totalUsers) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-medium mb-4">Recent User Activities</h3>
              <div className="space-y-2">
                {userActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.user} <span className="text-muted-foreground">{activity.action}</span> {activity.course}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all">
                View Detailed User Analytics
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="mt-0">
          <Card className="p-6 rounded-2xl border-0 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Department Analytics</h2>
            <p className="text-muted-foreground mb-8">Compare performance across different departments</p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {departmentBreakdown.map((dept) => (
                <Card 
                  key={dept.name} 
                  className="p-4 rounded-xl border-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleDepartmentFilter(dept.name.toLowerCase())}
                >
                  <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: dept.color }}>
                    <div className="text-white font-bold">{dept.name.substring(0, 1)}</div>
                  </div>
                  <h3 className="font-medium">{dept.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{dept.usersCompleted} of {dept.totalUsers} users</p>
                  <Progress 
                    value={(dept.usersCompleted / dept.totalUsers) * 100} 
                    className="h-2 rounded-full bg-gray-200" 
                    style={{ 
                      background: `linear-gradient(to right, ${dept.color} 0%, ${dept.color} ${(dept.usersCompleted / dept.totalUsers) * 100}%, #e5e7eb ${(dept.usersCompleted / dept.totalUsers) * 100}%, #e5e7eb 100%)` 
                    }}
                  />
                </Card>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
              <h3 className="font-medium mb-4">Department Comparison</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Course Completion Rate</h4>
                  <div className="flex h-12 rounded-lg overflow-hidden">
                    {departmentBreakdown.map((dept) => (
                      <div 
                        key={dept.name} 
                        className="h-full flex items-center justify-center text-white text-xs"
                        style={{ 
                          backgroundColor: dept.color,
                          width: `${(dept.usersCompleted / departmentBreakdown.reduce((acc, d) => acc + d.usersCompleted, 0)) * 100}%`
                        }}
                      >
                        {Math.round((dept.usersCompleted / departmentBreakdown.reduce((acc, d) => acc + d.usersCompleted, 0)) * 100)}%
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <div>0%</div>
                    <div>100%</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {departmentBreakdown.map((dept) => (
                    <div key={dept.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <span className="text-sm">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all">
                Generate Department Comparison Report
              </Button>
            </div>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
};

export default Reports; 