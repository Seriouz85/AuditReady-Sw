import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { trackActivity, usePageView } from '@/lib/tracking';
import {
  ArrowLeft,
  Clock,
  FileText,
  Play,
  BarChart,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Users,
  Download,
  Star,
  StarHalf,
  Share2,
  Bookmark,
  AlarmCheck,
  CircleCheck,
  CircleDashed,
  BookmarkPlus
} from 'lucide-react';

// Mock course data - in a real app, this would come from an API
const coursesData = [
  {
    id: '1',
    title: 'Introduction to Audit',
    description: 'Learn the fundamentals of auditing in this comprehensive course designed for beginners. This course covers audit planning, risk assessment, internal controls, and reporting techniques that comply with current standards.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    progress: 75,
    duration: '2h 30m',
    materials: 12,
    instructor: {
      name: 'Jennifer Wilson',
      role: 'Senior Audit Manager',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor1'
    },
    rating: 4.8,
    enrolled: 342,
    lastUpdated: '2023-11-15',
    category: 'Finance',
    level: 'Beginner',
    tags: ['Audit', 'Finance', 'Compliance'],
    modules: [
      {
        id: 'mod1',
        title: 'Getting Started with Auditing',
        duration: '20m',
        completed: true,
        lessons: [
          { id: 'les1', title: 'Introduction to the Course', type: 'video', duration: '5m', completed: true },
          { id: 'les2', title: 'What is Auditing?', type: 'video', duration: '8m', completed: true },
          { id: 'les3', title: 'Types of Audits', type: 'reading', duration: '7m', completed: true }
        ]
      },
      {
        id: 'mod2',
        title: 'Audit Planning and Risk Assessment',
        duration: '45m',
        completed: true,
        lessons: [
          { id: 'les4', title: 'Understanding the Client', type: 'video', duration: '10m', completed: true },
          { id: 'les5', title: 'Risk Assessment Procedures', type: 'video', duration: '12m', completed: true },
          { id: 'les6', title: 'Materiality Considerations', type: 'reading', duration: '8m', completed: true },
          { id: 'les7', title: 'Quiz: Audit Planning', type: 'quiz', duration: '15m', completed: true }
        ]
      },
      {
        id: 'mod3',
        title: 'Internal Controls Evaluation',
        duration: '35m',
        completed: true,
        lessons: [
          { id: 'les8', title: 'Types of Internal Controls', type: 'video', duration: '12m', completed: true },
          { id: 'les9', title: 'Control Testing Methods', type: 'video', duration: '15m', completed: true },
          { id: 'les10', title: 'Case Study: Control Deficiencies', type: 'exercise', duration: '8m', completed: true }
        ]
      },
      {
        id: 'mod4',
        title: 'Audit Evidence and Documentation',
        duration: '30m',
        completed: false,
        lessons: [
          { id: 'les11', title: 'Types of Audit Evidence', type: 'video', duration: '10m', completed: true },
          { id: 'les12', title: 'Documentation Requirements', type: 'reading', duration: '5m', completed: false },
          { id: 'les13', title: 'Practice: Evidence Collection', type: 'exercise', duration: '15m', completed: false }
        ]
      },
      {
        id: 'mod5',
        title: 'Audit Reporting',
        duration: '20m',
        completed: false,
        lessons: [
          { id: 'les14', title: 'Types of Audit Reports', type: 'video', duration: '8m', completed: false },
          { id: 'les15', title: 'Final Quiz', type: 'quiz', duration: '12m', completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Financial Reporting Standards',
    description: 'A comprehensive guide to understanding and applying financial reporting standards in your organization. Learn about IFRS, GAAP, and how to prepare compliant financial statements.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    progress: 30,
    duration: '4h 15m',
    materials: 20,
    instructor: {
      name: 'Michael Chen',
      role: 'Financial Reporting Expert',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=instructor2'
    },
    rating: 4.6,
    enrolled: 215,
    lastUpdated: '2023-10-02',
    category: 'Finance',
    level: 'Intermediate',
    tags: ['Financial Reporting', 'IFRS', 'GAAP'],
    modules: [
      {
        id: 'mod1',
        title: 'Introduction to Financial Reporting',
        duration: '30m',
        completed: true,
        lessons: [
          { id: 'les1', title: 'Course Overview', type: 'video', duration: '5m', completed: true },
          { id: 'les2', title: 'Importance of Standardized Reporting', type: 'video', duration: '12m', completed: true },
          { id: 'les3', title: 'Global vs. Local Standards', type: 'reading', duration: '13m', completed: true }
        ]
      },
      {
        id: 'mod2',
        title: 'IFRS Framework',
        duration: '50m',
        completed: true,
        lessons: [
          { id: 'les4', title: 'IFRS Principles and Concepts', type: 'video', duration: '15m', completed: true },
          { id: 'les5', title: 'Key IFRS Standards Overview', type: 'video', duration: '20m', completed: true },
          { id: 'les6', title: 'Quiz: IFRS Basics', type: 'quiz', duration: '15m', completed: true }
        ]
      },
      {
        id: 'mod3',
        title: 'US GAAP Overview',
        duration: '45m',
        completed: false,
        lessons: [
          { id: 'les7', title: 'GAAP Structure and Hierarchy', type: 'video', duration: '12m', completed: true },
          { id: 'les8', title: 'Key Differences: GAAP vs. IFRS', type: 'reading', duration: '18m', completed: false },
          { id: 'les9', title: 'Case Study: GAAP Application', type: 'exercise', duration: '15m', completed: false }
        ]
      }
    ]
  }
];

// Component to display lesson type icons
const LessonTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'reading':
      return <FileText className="h-4 w-4 text-amber-500" />;
    case 'quiz':
      return <BarChart className="h-4 w-4 text-purple-500" />;
    case 'exercise':
      return <BookOpen className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);

  // Track page view
  usePageView(courseId || 'unknown', 'course', course?.title || 'Course Detail');

  // Fetch course data
  useEffect(() => {
    // Simulate API call
    const fetchCourse = () => {
      setLoading(true);
      const foundCourse = coursesData.find(c => c.id === courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
        
        // Find first incomplete lesson
        for (const module of foundCourse.modules) {
          const incompleteLessons = module.lessons.filter(l => !l.completed);
          if (incompleteLessons.length > 0) {
            setCurrentLesson(incompleteLessons[0].id);
            break;
          }
        }
        
        // If all lessons are complete or no lessons found, set to first lesson
        if (!currentLesson && foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
          setCurrentLesson(foundCourse.modules[0].lessons[0].id);
        }
        
        // Track course view
        trackActivity('view', foundCourse.id, 'course', foundCourse.title);
      } else {
        // If course not found, go back to courses page
        navigate('/lms');
      }
      
      setLoading(false);
    };
    
    fetchCourse();
  }, [courseId, navigate]);

  // Handler for starting a lesson
  const handleStartLesson = (moduleId: string, lessonId: string) => {
    setCurrentLesson(lessonId);
    
    // Track activity
    if (course) {
      const module = course.modules.find((m: any) => m.id === moduleId);
      const lesson = module?.lessons.find((l: any) => l.id === lessonId);
      
      if (lesson) {
        trackActivity('start', lessonId, 'course', `${lesson.title} in ${course.title}`, 0);
      }
    }
    
    // In a real app, this would navigate to the lesson page or show the lesson content
    // For now, we'll just update the UI to show the selected lesson
  };
  
  // Handler for completing a lesson
  const handleCompleteLesson = (moduleId: string, lessonId: string) => {
    if (!course) return;
    
    // Update course state
    const updatedModules = course.modules.map((module: any) => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map((lesson: any) => {
          if (lesson.id === lessonId) {
            return { ...lesson, completed: true };
          }
          return lesson;
        });
        
        // Check if all lessons in this module are complete
        const allLessonsComplete = updatedLessons.every((l: any) => l.completed);
        
        return { 
          ...module, 
          lessons: updatedLessons,
          completed: allLessonsComplete
        };
      }
      return module;
    });
    
    // Calculate overall progress
    const totalLessons = updatedModules.reduce((acc: number, module: any) => 
      acc + module.lessons.length, 0);
      
    const completedLessons = updatedModules.reduce((acc: number, module: any) => 
      acc + module.lessons.filter((l: any) => l.completed).length, 0);
    
    const newProgress = Math.round((completedLessons / totalLessons) * 100);
    
    // Update course with new progress
    setCourse({
      ...course,
      modules: updatedModules,
      progress: newProgress
    });
    
    // Track activity
    const module = course.modules.find((m: any) => m.id === moduleId);
    const lesson = module?.lessons.find((l: any) => l.id === lessonId);
    
    if (lesson) {
      trackActivity('complete', lessonId, 'course', `${lesson.title} in ${course.title}`, newProgress);
    }
    
    // Find next lesson
    let foundNext = false;
    let nextLesson = null;
    
    // Check current module first
    const currentModule = course.modules.find((m: any) => m.id === moduleId);
    if (currentModule) {
      const lessonIndex = currentModule.lessons.findIndex((l: any) => l.id === lessonId);
      if (lessonIndex < currentModule.lessons.length - 1) {
        nextLesson = currentModule.lessons[lessonIndex + 1].id;
        foundNext = true;
      }
    }
    
    // If no next lesson in current module, try next module
    if (!foundNext) {
      const moduleIndex = course.modules.findIndex((m: any) => m.id === moduleId);
      if (moduleIndex < course.modules.length - 1) {
        const nextModule = course.modules[moduleIndex + 1];
        if (nextModule.lessons.length > 0) {
          nextLesson = nextModule.lessons[0].id;
          foundNext = true;
        }
      }
    }
    
    // Update current lesson to next lesson if found
    if (foundNext && nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };
  
  // Calculate course progress statistics
  const calculateModuleStats = () => {
    if (!course) return { completed: 0, total: 0 };
    
    const totalModules = course.modules.length;
    const completedModules = course.modules.filter((m: any) => m.completed).length;
    
    return {
      completed: completedModules,
      total: totalModules
    };
  };
  
  const moduleStats = calculateModuleStats();

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            onClick={() => navigate('/lms')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Find the lesson content for the current lesson
  const findCurrentLessonContent = () => {
    if (!currentLesson) return null;
    
    for (const module of course.modules) {
      const lesson = module.lessons.find((l: any) => l.id === currentLesson);
      if (lesson) {
        return { module, lesson };
      }
    }
    
    return null;
  };
  
  const currentLessonContent = findCurrentLessonContent();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 rounded-full p-2 h-auto w-auto"
              onClick={() => navigate('/lms')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">{course.category}</Badge>
              <Badge className="bg-white/20 text-white border-0">{course.level}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-white/80 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Avatar className="border-2 border-white">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>{course.instructor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="font-medium">{course.instructor.name}</p>
                    <p className="text-sm text-white/70">{course.instructor.role}</p>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-2 font-medium">{course.rating}</span>
                  <span className="text-sm text-white/70 ml-1">({course.enrolled} students)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration}</span>
                </div>
                
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{course.materials} lessons</span>
                </div>
                
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{moduleStats.completed}/{moduleStats.total} modules completed</span>
                </div>
                
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm">
                  <AlarmCheck className="h-4 w-4 mr-1" />
                  <span>Last updated: {new Date(course.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <div className="mb-4">
                <p className="font-medium text-lg mb-1">Your progress</p>
                <Progress value={course.progress} className="h-3 rounded-full bg-white/20" />
                <p className="text-sm mt-2">{course.progress}% complete</p>
              </div>
              
              <Button 
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 mb-4"
                onClick={() => currentLessonContent && handleStartLesson(currentLessonContent.module.id, currentLessonContent.lesson.id)}
              >
                {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
              </Button>
              
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 md:px-8 -mt-6">
        <Card className="rounded-2xl border-0 shadow-lg p-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 py-3 border-b">
              <TabsList className="rounded-full bg-gray-100">
                <TabsTrigger value="content" className="rounded-full">Course Content</TabsTrigger>
                <TabsTrigger value="resources" className="rounded-full">Resources</TabsTrigger>
                <TabsTrigger value="discussions" className="rounded-full">Discussions</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-full">My Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="content" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  {/* Current Lesson Content */}
                  {currentLessonContent ? (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <Badge className="mb-2 bg-primary/10 text-primary rounded-full">
                            {currentLessonContent.lesson.type.charAt(0).toUpperCase() + currentLessonContent.lesson.type.slice(1)}
                          </Badge>
                          <h2 className="text-xl font-semibold">{currentLessonContent.lesson.title}</h2>
                          <p className="text-sm text-muted-foreground">
                            From: {currentLessonContent.module.title} • {currentLessonContent.lesson.duration}
                          </p>
                        </div>
                        
                        {!currentLessonContent.lesson.completed && (
                          <Button 
                            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => handleCompleteLesson(currentLessonContent.module.id, currentLessonContent.lesson.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                      
                      {/* Lesson content - this would be dynamic based on lesson type */}
                      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        {currentLessonContent.lesson.type === 'video' && (
                          <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                            <Play className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        
                        {currentLessonContent.lesson.type === 'reading' && (
                          <div className="prose max-w-none">
                            <h3>Learning Content for {currentLessonContent.lesson.title}</h3>
                            <p>
                              This is where the learning content would be displayed. In a real application, 
                              this would contain rich text, images, and interactive elements related to "{currentLessonContent.lesson.title}".
                            </p>
                            <p>
                              The content would be specifically designed to help learners understand key concepts, apply them in 
                              practical situations, and test their knowledge through interactive elements.
                            </p>
                          </div>
                        )}
                        
                        {currentLessonContent.lesson.type === 'quiz' && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">Quiz: {currentLessonContent.lesson.title}</h3>
                            <p className="mb-4 text-muted-foreground">Complete this quiz to test your knowledge on this topic.</p>
                            <Button className="rounded-full">Start Quiz</Button>
                          </div>
                        )}
                        
                        {currentLessonContent.lesson.type === 'exercise' && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">Exercise: {currentLessonContent.lesson.title}</h3>
                            <p className="mb-4 text-muted-foreground">Complete this practical exercise to apply what you've learned.</p>
                            <Button className="rounded-full">Start Exercise</Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" className="rounded-full">
                          Previous Lesson
                        </Button>
                        
                        <Button 
                          className="rounded-full"
                          onClick={() => {
                            if (currentLessonContent.lesson.completed) {
                              // Find next lesson logic
                            } else {
                              handleCompleteLesson(currentLessonContent.module.id, currentLessonContent.lesson.id);
                            }
                          }}
                        >
                          {currentLessonContent.lesson.completed ? 'Next Lesson' : 'Complete & Continue'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Lesson Selected</h3>
                      <p className="text-muted-foreground mb-6">Select a lesson from the course outline to start learning.</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Course Outline</h3>
                  <Accordion type="multiple" defaultValue={course.modules.map((m: any) => m.id)}>
                    {course.modules.map((module: any) => (
                      <AccordionItem key={module.id} value={module.id} className="border-0 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 text-left">
                            {module.completed ? (
                              <div className="bg-green-100 p-1 rounded-full">
                                <CircleCheck className="h-5 w-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="bg-gray-100 p-1 rounded-full">
                                <CircleDashed className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {module.lessons.length} lessons • {module.duration}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0">
                          <div className="space-y-1 pl-12 pr-4 pb-3">
                            {module.lessons.map((lesson: any) => (
                              <div 
                                key={lesson.id} 
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                                  currentLesson === lesson.id ? 'bg-blue-50' : 'hover:bg-gray-100'
                                } transition-colors`}
                                onClick={() => handleStartLesson(module.id, lesson.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <LessonTypeIcon type={lesson.type} />
                                  <div>
                                    <p className="text-sm font-medium">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                  </div>
                                </div>
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="rounded-full h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartLesson(module.id, lesson.id);
                                    }}
                                  >
                                    Start
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Resources</h2>
              <div className="space-y-4">
                <Card className="p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Course Slides</h3>
                      <p className="text-sm text-muted-foreground">PDF • 2.4 MB</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Practice Exercises</h3>
                      <p className="text-sm text-muted-foreground">Excel • 1.8 MB</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Reference Guide</h3>
                      <p className="text-sm text-muted-foreground">PDF • 3.1 MB</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="discussions" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Course Discussions</h2>
                <Button className="rounded-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </div>
              
              <div className="space-y-4">
                <Card className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=user1" />
                      <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Question about Module 3</h3>
                          <p className="text-sm text-muted-foreground">Started by John Doe • 2 days ago</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Question</Badge>
                      </div>
                      <p className="mt-2 text-sm">
                        I'm having trouble understanding the concept of materiality as described in the third module. Can someone explain it in simpler terms?
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        <Badge className="bg-gray-100 text-gray-700">
                          <Users className="h-3 w-3 mr-1" />
                          5 replies
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=user2" />
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Additional Resource for Risk Assessment</h3>
                          <p className="text-sm text-muted-foreground">Started by Emma Wilson • 1 week ago</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Resource</Badge>
                      </div>
                      <p className="mt-2 text-sm">
                        I found this great article that explains risk assessment techniques in more detail. Thought it might be helpful for others in the course!
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        <Badge className="bg-gray-100 text-gray-700">
                          <Users className="h-3 w-3 mr-1" />
                          12 replies
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Notes</h2>
                <Button className="rounded-full">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              
              <div className="space-y-4">
                <Card className="p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Module 2: Risk Assessment</h3>
                    <Badge className="bg-gray-100 text-gray-700">Lesson 5</Badge>
                  </div>
                  <p className="text-sm mb-2">
                    Remember that risk assessment involves identifying potential issues before they 
                    materialize. Key steps include understanding the client's business environment and industry.
                  </p>
                  <p className="text-xs text-muted-foreground">Added on Oct 15, 2023</p>
                </Card>
                
                <Card className="p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Module 1: Intro to Auditing</h3>
                    <Badge className="bg-gray-100 text-gray-700">Lesson 2</Badge>
                  </div>
                  <p className="text-sm mb-2">
                    Three main types of audits: financial, operational, and compliance. 
                    Each serves a different purpose and follows different methodologies.
                  </p>
                  <p className="text-xs text-muted-foreground">Added on Oct 10, 2023</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Related Courses */}
      <div className="container max-w-7xl mx-auto px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Related Courses</h2>
          <Link to="/lms/library">
            <Button variant="link">View All Courses</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coursesData.filter(c => c.id !== courseId).map(relatedCourse => (
            <Link to={`/lms/courses/${relatedCourse.id}`} key={relatedCourse.id}>
              <Card className="overflow-hidden group rounded-2xl border-0 shadow hover:shadow-md transition-all h-full">
                <div className="h-48 bg-muted relative">
                  {relatedCourse.image ? (
                    <img src={relatedCourse.image} alt={relatedCourse.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-foreground">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-black font-normal rounded-full">{relatedCourse.level}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-primary/90 text-white hover:bg-primary rounded-full">
                      {relatedCourse.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-medium line-clamp-2 mb-3 group-hover:text-primary transition-colors">{relatedCourse.title}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" /> 
                      <span>{relatedCourse.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{relatedCourse.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 