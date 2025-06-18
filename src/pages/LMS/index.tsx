import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Trophy, 
  Bell, 
  FileText, 
  Book, 
  Target,
  ArrowRight,
  Calendar,
  Plus,
  ChartBar,
  Edit,
  Sparkles,
  GraduationCap,
  Rocket,
  Brain,
  Award,
  Star,
  ChevronLeft,
  Settings,
  Fish
} from 'lucide-react';
import { getTimeBasedGreeting, updateStreak, trackActivity } from '@/lib/tracking';
import { useTheme } from 'next-themes';

interface Course {
  id: number;
  title: string;
  duration: string;
  progress: number;
  status: 'Not Started' | 'In Progress';
  materials: number;
  deadline?: string;
  image?: string;
  category?: string;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  date: string;
}

// Sample data
const courses: Course[] = [
  {
    id: 1,
    title: 'Introduction to Audit',
    duration: '2h 30m',
    progress: 75,
    status: 'In Progress',
    materials: 5,
    deadline: '1 Day',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Course'
  },
  {
    id: 2,
    title: 'Financial Reporting Standards',
    duration: '4h 15m',
    progress: 30,
    status: 'In Progress',
    materials: 12,
    deadline: '12 hrs',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Course'
  },
  {
    id: 3,
    title: 'Risk Assessment',
    duration: '3h 45m',
    progress: 0,
    status: 'Not Started',
    materials: 8,
    deadline: '3 Days',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Course'
  }
];

const newCourses: Course[] = [
  {
    id: 4,
    title: 'Enhancing Learning Engagement Through Thoughtful UI/UX',
    duration: '3h 30m',
    progress: 0,
    status: 'Not Started',
    materials: 10,
    category: 'Course',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'UI/UX 101 - For Beginner to be great and good Designer',
    duration: '6h 45m',
    progress: 0,
    status: 'Not Started',
    materials: 12,
    category: 'Course',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Mastering UI Design for Impactful Experiences',
    duration: '4h 20m',
    progress: 0,
    status: 'Not Started',
    materials: 12,
    category: 'Course',
    image: 'https://images.unsplash.com/photo-1525422847952-7f91db09a364?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

const notifications: Notification[] = [
  {
    id: 1,
    title: 'New LMS Feature: Collaborative Learning Spaces',
    content: 'We have introduced Collaborative Learning Spaces where team members can discuss course materials, share insights, and solve problems together in real-time.',
    type: 'New',
    date: '2h ago'
  }
];

const TrenningLMS: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const prevTheme = useRef<string | undefined>();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [userStreak] = useState(updateStreak());
  const [localCourses, setLocalCourses] = useState(courses);
  const navigate = useNavigate();
  
  // Update greeting based on time of day
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    prevTheme.current = theme;
    setTheme('light');
    return () => {
      if (prevTheme.current && prevTheme.current !== 'light') {
        setTheme(prevTheme.current);
      }
    };
  }, [theme, setTheme]);
  
  const currentUser = {
    name: 'User',
    role: 'Jr UI/UX Designer',
    points: 100,
    badges: 32,
    streak: userStreak,
    dailyGoal: { current: 6, total: 30 }
  };
  
  // Handler for continuing or starting a course
  const handleCourseAction = (course: Course) => {
    const isStarting = course.progress === 0;
    const actionType = isStarting ? 'start' : 'interact';
    
    // Track the activity
    trackActivity(
      actionType,
      course.id,
      'course',
      course.title,
      course.progress
    );
    
    // Update local state to reflect progress change
    if (isStarting) {
      const updatedCourses = localCourses.map(c => {
        if (c.id === course.id) {
          return {
            ...c,
            status: 'In Progress' as const,
            progress: 5 // Start with 5% progress
          };
        }
        return c;
      });
      setLocalCourses(updatedCourses);
    } else {
      // For continuing, we would typically navigate to the course
      // But for demo, we'll just increase progress by 10%
      const updatedCourses = localCourses.map(c => {
        if (c.id === course.id) {
          const newProgress = Math.min(c.progress + 10, 100);
          return {
            ...c,
            progress: newProgress
          };
        }
        return c;
      });
      setLocalCourses(updatedCourses);
    }
  };
  
  // Handler for enrolling in a new course
  const handleEnroll = (course: Course) => {
    // Track enrollment
    trackActivity('enroll', course.id, 'course', course.title);
    // Add to local courses
    setLocalCourses(prev => [...prev, { ...course, status: 'In Progress' }]);
  };

  // Add navigateCreate function
  const navigateCreate = () => {
    navigate('/lms/create/content');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header Section - New Design */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="container max-w-7xl mx-auto p-4 sm:p-8">
          {/* Back to Dashboard Button */}
          <Link to="/app" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
            <div className="md:col-span-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {greeting}, {currentUser.name} <span className="text-yellow-400">✨</span>
              </h1>
              <p className="text-white/80 text-base sm:text-lg mb-4 sm:mb-6">Welcome to your personalized learning journey</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <Target className="text-yellow-300 h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Learning Points</p>
                    <p className="text-lg sm:text-xl font-semibold">{currentUser.points}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <Trophy className="text-indigo-300 h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Badges Earned</p>
                    <p className="text-lg sm:text-xl font-semibold">{currentUser.badges}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <Star className="text-amber-300 h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Day Streak</p>
                    <p className="text-lg sm:text-xl font-semibold">{currentUser.streak.days}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 inline-flex items-center">
                <Avatar className="h-12 w-12 border-2 border-white mr-4">
                  <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=user1`} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="font-semibold">{currentUser.role}</p>
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                      Pro Learner
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-24 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" 
                        style={{ width: `${(currentUser.dailyGoal.current / currentUser.dailyGoal.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2 text-white/70">
                      {currentUser.dailyGoal.current}/{currentUser.dailyGoal.total} today
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -right-4 -top-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3 z-10 shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 text-white/5">
                    <Rocket className="h-36 w-36" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Your Learning Stats</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Progress</span>
                        <span>68%</span>
                      </div>
                      <Progress value={68} className="h-2 rounded-full bg-white/20" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Goal</span>
                        <span>42%</span>
                      </div>
                      <Progress value={42} className="h-2 rounded-full bg-white/20" />
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Brain className="h-5 w-5 mr-2 text-indigo-300" />
                          <span>Completed Courses</span>
                        </div>
                        <span className="font-semibold">4</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-amber-300" />
                          <span>Certifications</span>
                        </div>
                        <span className="font-semibold">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Actions Navigation */}
      <div className="container max-w-full mx-auto -mt-8 z-10 relative px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-8 justify-items-center">
          <div className="block cursor-pointer w-full sm:w-[240px] max-w-[280px]" onClick={() => navigateCreate()}>
            <Card className="p-0 h-32 w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-center">
                <div className="pl-6 pr-4">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pr-8 w-full flex flex-col justify-center">
                  <div className="mb-1 h-6 flex items-center">
                    <h3 className="font-semibold text-base group-hover:text-indigo-700 transition-colors">Create Course</h3>
                  </div>
                  <div className="h-5 flex items-center">
                    <p className="text-sm text-muted-foreground truncate whitespace-nowrap">Design new learning content</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="block cursor-pointer w-full sm:w-[240px] max-w-[280px]" onClick={() => navigate("/lms/courses/edit")}>
            <Card className="p-0 h-32 w-full bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-center">
                <div className="pl-6 pr-4">
                  <div className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-3">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pr-8 w-full flex flex-col justify-center">
                  <div className="mb-1 h-6 flex items-center">
                    <h3 className="font-semibold text-base group-hover:text-purple-700 transition-colors">Edit Courses</h3>
                  </div>
                  <div className="h-5 flex items-center">
                    <p className="text-sm text-muted-foreground truncate whitespace-nowrap">Manage existing content</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="block cursor-pointer w-full sm:w-[240px] max-w-[280px]" onClick={() => navigate("/lms/phishing-simulation-manager")}>
            <Card className="p-0 h-32 w-full bg-gradient-to-r from-amber-50 to-orange-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-center">
                <div className="pl-6 pr-4">
                  <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-3">
                    <Fish className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pr-8 w-full flex flex-col justify-center">
                  <div className="mb-1 h-6 flex items-center">
                    <h3 className="font-semibold text-base group-hover:text-amber-700 transition-colors">Phishing Simulation</h3>
                  </div>
                  <div className="h-5 flex items-center">
                    <p className="text-sm text-muted-foreground truncate whitespace-nowrap">Security awareness training</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="block cursor-pointer w-full sm:w-[240px] max-w-[280px]" onClick={() => navigate("/lms/analytics")}>
            <Card className="p-0 h-32 w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-center">
                <div className="pl-6 pr-4">
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3">
                    <ChartBar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pr-8 w-full flex flex-col justify-center">
                  <div className="mb-1 h-6 flex items-center">
                    <h3 className="font-semibold text-base group-hover:text-teal-700 transition-colors">Analytics</h3>
                  </div>
                  <div className="h-5 flex items-center">
                    <p className="text-sm text-muted-foreground truncate whitespace-nowrap">Track learning progress</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="block cursor-pointer w-full sm:w-[240px] max-w-[280px]" onClick={() => navigate("/lms/admin")}>
            <Card className="p-0 h-32 w-full bg-gradient-to-r from-slate-50 to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-center">
                <div className="pl-6 pr-4">
                  <div className="rounded-xl bg-gradient-to-r from-slate-500 to-gray-600 p-3">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pr-8 w-full flex flex-col justify-center">
                  <div className="mb-1 h-6 flex items-center">
                    <h3 className="font-semibold text-base group-hover:text-gray-700 transition-colors">Admin View</h3>
                  </div>
                  <div className="h-5 flex items-center">
                    <p className="text-sm text-muted-foreground truncate whitespace-nowrap">System settings & users</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="container max-w-7xl mx-auto p-4 md:p-8 mt-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 relative overflow-hidden shadow-md"
            >
              <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-full px-3">
                {notification.type}
              </Badge>
              <div className="ml-20">
                <h3 className="font-semibold text-lg mb-1">{notification.title}</h3>
                <p className="text-gray-600">{notification.content}</p>
                <div className="mt-2">
                  <Button variant="link" className="p-0 h-auto flex items-center text-green-600">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Learning Progress Section */}
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            In progress learning content 
            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
          </h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {localCourses.filter(course => course.status === "In Progress").map(course => (
            <Link to={`/lms/course/${course.id}`} key={course.id} className="block">
              <div className="flex flex-col md:flex-row gap-6 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow hover:shadow-md transition-all group overflow-hidden">
                <div className="md:w-48 h-28 rounded-2xl overflow-hidden bg-muted relative">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-foreground">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3">{course.category || 'Course'}</Badge>
                    <h3 className="font-medium text-lg mb-1">{course.title}</h3>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <div className="flex items-center mr-4">
                        <FileText className="mr-1 h-4 w-4" /> 
                        <span>{course.materials} Material</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" /> 
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="mb-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Completion</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-3 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 md:pl-4 md:border-l">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Deadline</span>
                      <div className="flex items-center text-sm font-medium">
                        <Calendar className="h-4 w-4 mr-1 text-red-500" />
                        <span>{course.deadline || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {course.progress > 0 ? (
                      <Button 
                        className="w-full md:w-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all"
                        onClick={() => handleCourseAction(course)}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button 
                        className="w-full md:w-auto rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-sm hover:shadow-md transition-all"
                        onClick={() => handleCourseAction(course)}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Show a message if no courses are in progress */}
          {localCourses.filter(course => course.status === "In Progress").length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl">
              <Book className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
              <p className="text-muted-foreground text-center mb-6">You haven't started any courses yet. Explore new courses below and start learning!</p>
              <Button className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                Explore Courses
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* New Enrollment Section - Fixed container width */}
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            New enrollment 
            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
          </h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newCourses.map(course => (
            <Link to={`/lms/course/${course.id}`} key={course.id} className="block">
              <Card className="overflow-hidden group rounded-2xl border-0 shadow hover:shadow-md transition-all">
                <div className="h-48 bg-muted relative">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-foreground">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-black font-normal rounded-full">{course.materials} materials</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-primary/90 text-white hover:bg-primary rounded-full">
                      {course.category || 'Course'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-medium line-clamp-2 mb-3 group-hover:text-primary transition-colors text-lg">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" /> 
                      <span>{course.duration}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-full p-2 h-auto w-auto bg-primary/10 hover:bg-primary/20 text-primary"
                      onClick={() => handleEnroll(course)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      {/* User Goals Section - Fixed container width */}
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center">Goals</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-medium mb-4">Daily Goal: {currentUser.dailyGoal.current}/{currentUser.dailyGoal.total} learning</h3>
            <div className="mb-2">
              <Progress value={(currentUser.dailyGoal.current / currentUser.dailyGoal.total) * 100} className="h-4 rounded-full bg-blue-100" />
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-orange-50 to-amber-50">
            <h3 className="font-medium mb-2">Your Learning streak: {currentUser.streak.days} Days</h3>
            <p className="text-sm text-muted-foreground">{currentUser.streak.dates}</p>
            <Button variant="link" className="p-0 mt-2 h-auto text-primary">
              See Detail
            </Button>
          </Card>
        </div>
      </div>
      
      {/* Leaderboard Preview - Fixed container width */}
      <div className="container max-w-7xl mx-auto p-4 md:p-8 mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center">Leaderboard</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        
        <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium">Top Learners This Week</h3>
            <Button variant="outline" className="rounded-full">See All</Button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((position) => (
              <div key={position} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-medium shadow-sm">
                    {position}
                  </div>
                  <Avatar className="border-2 border-white shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=user${position}`} />
                    <AvatarFallback>U{position}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User {position}</p>
                    <p className="text-xs text-muted-foreground">120 points</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full px-3">
                  +{30 - position * 5} pts
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4">
        <Link to="/lms/create/content">
          <Button className="rounded-full p-6 h-auto w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TrenningLMS; 