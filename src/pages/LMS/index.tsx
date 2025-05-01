import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';
import { getTimeBasedGreeting, updateStreak, usePageView, trackActivity } from '@/lib/tracking';

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
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
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
    title: 'Feature Discussion',
    content: 'The learning content are a new feature in "Feature Discussion" can be explain the material problem chat.',
    type: 'New',
    date: '2h ago'
  }
];

const TrenningLMS: React.FC = () => {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [userStreak, setUserStreak] = useState(updateStreak());
  const [localCourses, setLocalCourses] = useState(courses);
  
  // Page view tracking
  usePageView('dashboard', 'page', 'LMS Dashboard');
  
  // Update greeting based on time of day
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
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

  return (
    <div className="container max-w-7xl mx-auto p-4">
      {/* Header Section with more playful design */}
      <div className="flex justify-between items-center pb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, {currentUser.name} <span className="text-yellow-500">✨</span>
          </h1>
          <p className="text-muted-foreground mt-1">Welcome to Trenning, check your priority learning.</p>
        </div>
        
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-2 rounded-2xl mb-1 flex items-center shadow-sm">
              <Target className="text-amber-500 mr-2 h-5 w-5" />
              <span className="text-xl font-semibold">{currentUser.points}</span>
            </div>
            <span className="text-xs text-muted-foreground">Point</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-2 rounded-2xl mb-1 flex items-center shadow-sm">
              <Trophy className="text-purple-500 mr-2 h-5 w-5" />
              <span className="text-xl font-semibold">{currentUser.badges}</span>
            </div>
            <span className="text-xs text-muted-foreground">Badges</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-2xl mb-1 flex items-center shadow-sm">
              <Book className="text-blue-500 mr-2 h-5 w-5" />
              <span className="text-xl font-semibold">120</span>
            </div>
            <span className="text-xs text-muted-foreground">Learning content</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-2 rounded-2xl mb-1 flex items-center shadow-sm">
              <Clock className="text-green-500 mr-2 h-5 w-5" />
              <span className="text-xl font-semibold">44</span>
            </div>
            <span className="text-xs text-muted-foreground">Learning time</span>
          </div>
        </div>
      </div>
      
      {/* Main Actions Bar */}
      <div className="mb-6 flex justify-center gap-4">
        <Link to="/lms/create/content">
          <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all">
            <Sparkles className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </Link>
        <Link to="/lms/courses/edit">
          <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all">
            <Edit className="mr-2 h-5 w-5" />
            Edit Courses
          </Button>
        </Link>
        <Link to="/lms/reports">
          <Button className="rounded-full px-6 py-6 h-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all">
            <ChartBar className="mr-2 h-5 w-5" />
            Reports
          </Button>
        </Link>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 relative overflow-hidden shadow-sm"
            >
              <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-full px-3">
                {notification.type}
              </Badge>
              <div className="ml-20">
                <h3 className="font-semibold text-lg mb-1">{notification.title}</h3>
                <p className="text-gray-600">{notification.content}</p>
                <div className="mt-2">
                  <Button variant="link" className="p-0 h-auto flex items-center text-primary">
                    Go to detail <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Learning Progress Section */}
      <div className="mb-8">
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
      
      {/* New Enrollment Section */}
      <div className="mb-8">
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
      
      {/* User Goals Section */}
      <div className="mb-8">
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
      
      {/* Leaderboard Preview */}
      <div>
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