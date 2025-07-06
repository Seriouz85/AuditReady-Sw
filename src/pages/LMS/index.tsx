import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
  Fish,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { getTimeBasedGreeting, updateStreak, trackActivity } from '@/lib/tracking';
import { useTheme } from 'next-themes';
import { learningService } from '@/services/lms/LearningService';
import { LearningPath, UserLearningProgress, TrainingAssignment, LearningAnalytics } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/utils/toast';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  date: string;
}

// Demo data for demo accounts - Comprehensive training programs
const demoCoursesData: LearningPath[] = [
  {
    id: 'demo-1',
    organization_id: 'demo-org',
    title: 'Introduction to Cybersecurity Compliance',
    description: 'Learn the fundamentals of cybersecurity compliance frameworks including GDPR, ISO 27001, and industry best practices',
    category: 'compliance',
    difficulty_level: 'beginner',
    estimated_duration: 150,
    total_modules: 5,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['compliance', 'security', 'fundamentals', 'GDPR'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    organization_id: 'demo-org',
    title: 'Advanced Phishing Detection & Response',
    description: 'Master advanced techniques for identifying, reporting, and responding to sophisticated phishing attacks',
    category: 'security-awareness',
    difficulty_level: 'intermediate',
    estimated_duration: 180,
    total_modules: 7,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['phishing', 'security', 'awareness', 'incident-response'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-3',
    organization_id: 'demo-org',
    title: 'ISO 27001 Implementation Guide',
    description: 'Complete step-by-step guide to implementing ISO 27001 information security management systems',
    category: 'compliance',
    difficulty_level: 'advanced',
    estimated_duration: 300,
    total_modules: 12,
    is_published: true,
    is_mandatory: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['ISO27001', 'security', 'implementation', 'ISMS'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-4',
    organization_id: 'demo-org',
    title: 'Data Privacy & GDPR Essentials',
    description: 'Essential training on data protection, privacy rights, and GDPR compliance for all employees',
    category: 'privacy',
    difficulty_level: 'beginner',
    estimated_duration: 120,
    total_modules: 6,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['GDPR', 'privacy', 'data-protection', 'compliance'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-5',
    organization_id: 'demo-org',
    title: 'Secure Remote Work Practices',
    description: 'Learn essential security practices for remote work including VPN usage, device security, and secure communications',
    category: 'security-awareness',
    difficulty_level: 'beginner',
    estimated_duration: 90,
    total_modules: 4,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['remote-work', 'VPN', 'device-security', 'communications'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-6',
    organization_id: 'demo-org',
    title: 'Incident Response & Crisis Management',
    description: 'Comprehensive training on cybersecurity incident response procedures and crisis management protocols',
    category: 'incident-response',
    difficulty_level: 'intermediate',
    estimated_duration: 240,
    total_modules: 10,
    is_published: true,
    is_mandatory: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['incident-response', 'crisis-management', 'security', 'procedures'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoProgressData: UserLearningProgress[] = [
  {
    id: 'prog-1',
    user_id: 'demo-user',
    learning_path_id: 'demo-1',
    progress_percentage: 75,
    time_spent_minutes: 120,
    last_accessed_at: new Date().toISOString(),
    completed_at: null,
    certificate_issued: false
  },
  {
    id: 'prog-2',
    user_id: 'demo-user',
    learning_path_id: 'demo-2',
    progress_percentage: 45,
    time_spent_minutes: 85,
    last_accessed_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: null,
    certificate_issued: false
  },
  {
    id: 'prog-3',
    user_id: 'demo-user',
    learning_path_id: 'demo-4',
    progress_percentage: 100,
    time_spent_minutes: 120,
    last_accessed_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    certificate_issued: true
  },
  {
    id: 'prog-4',
    user_id: 'demo-user',
    learning_path_id: 'demo-5',
    progress_percentage: 100,
    time_spent_minutes: 90,
    last_accessed_at: new Date(Date.now() - 259200000).toISOString(),
    completed_at: new Date(Date.now() - 259200000).toISOString(),
    certificate_issued: true
  },
  {
    id: 'prog-5',
    user_id: 'demo-user',
    learning_path_id: 'demo-3',
    progress_percentage: 15,
    time_spent_minutes: 45,
    last_accessed_at: new Date(Date.now() - 432000000).toISOString(),
    completed_at: null,
    certificate_issued: false
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

import { CourseCard } from '@/components/LMS/CourseCard';
import { ProgressWidget } from '@/components/LMS/ProgressWidget';
import { RecommendationsWidget } from '@/components/LMS/RecommendationsWidget';

const TrenningLMS: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const prevTheme = useRef<string | undefined>();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [userStreak] = useState(updateStreak());
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();
  const { organization } = useOrganization();
  
  // State for real data
  const [courses, setCourses] = useState<LearningPath[]>([]);
  const [userProgress, setUserProgress] = useState<UserLearningProgress[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  // Update greeting based on time of day
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Load learning data
  useEffect(() => {
    if (user && organization) {
      loadLearningData();
    }
  }, [user, organization]);
  
  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Use demo data for demo accounts
        setCourses(demoCoursesData);
        setUserProgress(demoProgressData);
        setAnalytics({
          totalCourses: 6,
          completedCourses: 2,
          inProgressCourses: 3,
          totalTimeSpent: 460,
          averageScore: 87,
          certificatesEarned: 2,
          upcomingDeadlines: 2,
          overdueCourses: 0
        });
      } else {
        // Load real data from database
        const [coursesData, progressData, assignmentsData] = await Promise.all([
          learningService.getOrganizationCourses(organization!.id),
          learningService.getUserProgress(user!.id),
          learningService.getAssignments(user!.id)
        ]);
        
        setCourses(coursesData);
        setUserProgress(progressData);
        setAssignments(assignmentsData);
        
        // Calculate analytics
        const completedCount = progressData.filter(p => p.completed_at).length;
        const inProgressCount = progressData.filter(p => !p.completed_at && p.progress_percentage > 0).length;
        const totalTime = progressData.reduce((sum, p) => sum + p.time_spent_minutes, 0);
        
        setAnalytics({
          totalCourses: coursesData.length,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          totalTimeSpent: totalTime,
          averageScore: 85, // TODO: Calculate from quiz scores
          certificatesEarned: progressData.filter(p => p.certificate_issued).length,
          upcomingDeadlines: assignmentsData.filter(a => !a.completed_at && new Date(a.due_date) > new Date()).length,
          overdueCourses: assignmentsData.filter(a => !a.completed_at && new Date(a.due_date) < new Date()).length
        });
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
      toast.error('Failed to load learning data');
    } finally {
      setLoading(false);
    }
  };
  
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
    name: user?.name || user?.email?.split('@')[0] || 'User',
    role: user?.role || 'Learner',
    points: analytics?.totalCourses ? analytics.totalCourses * 20 : 0,
    badges: analytics?.certificatesEarned || 0,
    streak: userStreak,
    dailyGoal: { 
      current: analytics?.inProgressCourses || 0, 
      total: 5 // Daily goal of 5 activities
    }
  };
  
  // Get courses with progress
  const getCoursesWithProgress = () => {
    return courses.map(course => {
      const progress = userProgress.find(p => p.learning_path_id === course.id);
      return {
        ...course,
        progressPercentage: progress?.progress_percentage || 0,
        timeSpent: progress?.time_spent_minutes || 0,
        lastAccessed: progress?.last_accessed_at,
        completed: !!progress?.completed_at
      };
    });
  };
  
  const inProgressCourses = getCoursesWithProgress().filter(c => c.progressPercentage > 0 && !c.completed);
  const availableCourses = getCoursesWithProgress().filter(c => c.progressPercentage === 0);
  
  // Handler for continuing or starting a course
  const handleCourseAction = async (courseId: string) => {
    navigate(`/lms/course/${courseId}`);
  };
  
  // Handler for enrolling in a new course
  const handleEnroll = async (courseId: string) => {
    if (!user || isDemo) {
      // For demo, just navigate to course
      navigate(`/lms/course/${courseId}`);
      return;
    }
    
    try {
      setEnrolling(courseId);
      
      // Create initial progress record
      const success = await learningService.updateProgress({
        userId: user.id,
        pathId: courseId,
        contentId: courseId, // Use course ID as initial content
        progress: 0,
        timeSpent: 0
      });
      
      if (success) {
        toast.success('Successfully enrolled in course');
        navigate(`/lms/course/${courseId}`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  // Add navigateCreate function
  const navigateCreate = () => {
    navigate('/lms/create/content');
  };

  return (
      <div className="min-h-screen bg-background">
        {/* Hero Header Section - New Design */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="container max-w-7xl mx-auto p-4 sm:p-8">
          
          <Link to="/app" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {greeting}, {currentUser.name}
                  </h1>
                  <p className="text-white/80 text-sm">Your personalized learning continues</p>
                </div>
              </div>
              
              {/* AI-Powered Insights */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">AI Insight</p>
                    <p className="text-white/90 text-sm">
                      {analytics?.inProgressCourses > 0 
                        ? `You're making great progress! Complete your ${analytics.inProgressCourses} active course${analytics.inProgressCourses > 1 ? 's' : ''} to unlock advanced cybersecurity topics.`
                        : analytics?.completedCourses > 0
                        ? `Excellent work completing ${analytics.completedCourses} course${analytics.completedCourses > 1 ? 's' : ''}! Ready for the next challenge in incident response?`
                        : "Welcome to your cybersecurity journey! I recommend starting with our 'Introduction to Cybersecurity Compliance' course."
                      }
                    </p>
                  </div>
                </div>
              </div>
              
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
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name}&backgroundColor=b6bbc0,6366f1,8b5cf6,06b6d4,10b981,f59e0b,ef4444&radius=50`} alt={currentUser.name} />
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
                      {currentUser.dailyGoal.current}/{currentUser.dailyGoal.total} activities today
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
                      <Progress value={analytics ? (analytics.inProgressCourses / Math.max(analytics.totalCourses, 1)) * 100 : 0} className="h-2 rounded-full bg-white/20" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Goal</span>
                        <span>42%</span>
                      </div>
                      <Progress value={analytics ? (analytics.completedCourses / Math.max(analytics.totalCourses, 1)) * 100 : 0} className="h-2 rounded-full bg-white/20" />
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Brain className="h-5 w-5 mr-2 text-indigo-300" />
                          <span>Completed Courses</span>
                        </div>
                        <span className="font-semibold">{analytics?.completedCourses || 0}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-amber-300" />
                          <span>Certifications</span>
                        </div>
                        <span className="font-semibold">{analytics?.certificatesEarned || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Actions Navigation - Responsive Design */}
      <div className="container max-w-7xl mx-auto -mt-8 z-10 relative px-4">
        {/* Mobile: Horizontal scrollable cards */}
        <div className="block md:hidden mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigateCreate()}>
              <Card className="p-0 h-20 w-44 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                <div className="flex h-full items-center px-4">
                  <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2 mr-3">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold text-sm group-hover:text-indigo-700 transition-colors">Create Course</h3>
                    <p className="text-xs text-muted-foreground">New content</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/lms/courses/edit")}>
              <Card className="p-0 h-20 w-44 bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                <div className="flex h-full items-center px-4">
                  <div className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 p-2 mr-3">
                    <Edit className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold text-sm group-hover:text-purple-700 transition-colors">Edit Courses</h3>
                    <p className="text-xs text-muted-foreground">Manage content</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/lms/phishing-simulation-manager")}>
              <Card className="p-0 h-20 w-44 bg-gradient-to-r from-orange-50 to-red-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                <div className="flex h-full items-center px-4">
                  <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-2 mr-3">
                    <Fish className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold text-sm group-hover:text-orange-700 transition-colors">Phishing</h3>
                    <p className="text-xs text-muted-foreground">Security training</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/lms/analytics")}>
              <Card className="p-0 h-20 w-44 bg-gradient-to-r from-emerald-50 to-teal-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                <div className="flex h-full items-center px-4">
                  <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-2 mr-3">
                    <ChartBar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Track progress</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/lms/admin")}>
              <Card className="p-0 h-20 w-44 bg-gradient-to-r from-gray-50 to-slate-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                <div className="flex h-full items-center px-4">
                  <div className="rounded-lg bg-gradient-to-r from-gray-500 to-slate-600 p-2 mr-3">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold text-sm group-hover:text-gray-700 transition-colors">Admin View</h3>
                    <p className="text-xs text-muted-foreground">System settings</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Desktop: Original beautiful cards */}
        <div className="hidden md:grid grid-cols-5 gap-4 mb-8 items-start">
          <div className="block cursor-pointer w-full" onClick={() => navigateCreate()}>
            <Card className="p-0 h-20 w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-start px-4 pt-4 pb-2">
                <div className="flex-shrink-0 mr-3">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h3 className="font-semibold text-sm group-hover:text-indigo-700 transition-colors mb-1 truncate">Create Course</h3>
                  <p className="text-xs text-muted-foreground leading-tight">Design new content</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="block cursor-pointer w-full" onClick={() => navigate("/lms/courses/edit")}>
            <Card className="p-0 h-20 w-full bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-start px-4 pt-4 pb-2">
                <div className="flex-shrink-0 mr-3">
                  <div className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-3">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h3 className="font-semibold text-sm group-hover:text-purple-700 transition-colors mb-1 truncate">Edit Courses</h3>
                  <p className="text-xs text-muted-foreground leading-tight">Manage existing content</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="block cursor-pointer w-full" onClick={() => navigate("/lms/phishing-simulation-manager")}>
            <Card className="p-0 h-20 w-full bg-gradient-to-r from-orange-50 to-red-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-start px-4 pt-4 pb-2">
                <div className="flex-shrink-0 mr-3">
                  <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-3">
                    <Fish className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h3 className="font-semibold text-sm group-hover:text-orange-700 transition-colors mb-1 truncate">Phishing Simulation</h3>
                  <p className="text-xs text-muted-foreground leading-tight">Security training</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="block cursor-pointer w-full" onClick={() => navigate("/lms/analytics")}>
            <Card className="p-0 h-20 w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-start px-4 pt-4 pb-2">
                <div className="flex-shrink-0 mr-3">
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3">
                    <ChartBar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h3 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors mb-1 truncate">Analytics</h3>
                  <p className="text-xs text-muted-foreground leading-tight">View learning metrics</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="block cursor-pointer w-full" onClick={() => navigate("/lms/admin")}>
            <Card className="p-0 h-20 w-full bg-gradient-to-r from-gray-50 to-slate-50 border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden rounded-2xl hover:translate-y-[-3px]">
              <div className="flex h-full items-start px-4 pt-4 pb-2">
                <div className="flex-shrink-0 mr-3">
                  <div className="rounded-xl bg-gradient-to-r from-gray-500 to-slate-600 p-3">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h3 className="font-semibold text-sm group-hover:text-gray-700 transition-colors mb-1 truncate">Admin View</h3>
                  <p className="text-xs text-muted-foreground leading-tight">Configure platform</p>
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
        <Card className="rounded-xl border-0 shadow-md mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Book className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">In Progress Learning</h2>
                  <p className="text-sm text-gray-600">Continue your cybersecurity training journey</p>
                </div>
              </div>
              <Button variant="ghost" className="text-primary hover:text-blue-600">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
        
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            // Loading skeletons
            [...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
                <Skeleton className="md:w-48 h-28 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : inProgressCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {inProgressCourses.map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description || ''}
                category={course.category}
                difficulty={course.difficulty_level as 'beginner' | 'intermediate' | 'advanced'}
                duration={course.estimated_duration}
                totalModules={course.total_modules}
                progress={course.progressPercentage}
                thumbnailUrl={course.thumbnail_url}
                isPublished={course.is_published}
                isMandatory={course.is_mandatory}
                tags={course.tags}
                onView={() => navigate(`/lms/course/${course.id}`)}
                onEdit={() => navigate(`/lms/course/${course.id}/edit`)}
              />
              ))}
            </div>
          ) : (
            // No courses in progress
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl">
              <Book className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
              <p className="text-muted-foreground text-center mb-6">You haven't started any courses yet. Explore new courses below and start learning!</p>
              <Button 
                className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={() => document.getElementById('new-courses')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Courses
              </Button>
            </div>
          )}
          </div>
        </div>
      </Card>
    </div>
      
      {/* New Enrollment Section - Fixed container width */}
      <div id="new-courses" className="container max-w-7xl mx-auto p-4 md:p-8">
        <Card className="rounded-xl border-0 shadow-md mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Courses</h2>
                  <p className="text-sm text-gray-600">Explore new training programs</p>
                </div>
              </div>
              <Button variant="ghost" className="text-primary hover:text-purple-600">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow">
                <Skeleton className="h-48" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))
          ) : availableCourses.length > 0 ? (
            availableCourses.slice(0, 3).map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description || ''}
                category={course.category}
                difficulty={course.difficulty_level as 'beginner' | 'intermediate' | 'advanced'}
                duration={course.estimated_duration}
                totalModules={course.total_modules}
                thumbnailUrl={course.thumbnail_url}
                isPublished={course.is_published}
                isMandatory={course.is_mandatory}
                tags={course.tags}
                onView={() => handleEnroll(course.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses available</h3>
              <p className="text-muted-foreground">Check back later for new learning opportunities</p>
            </div>
          )}
          </div>
        </div>
      </Card>
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
            <h3 className="font-medium mb-4">Daily Goal: {currentUser.dailyGoal.current}/{currentUser.dailyGoal.total} activities</h3>
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
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=user${position}&backgroundColor=b6bbc0,6366f1,8b5cf6,06b6d4,10b981,f59e0b,ef4444&radius=50`} />
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