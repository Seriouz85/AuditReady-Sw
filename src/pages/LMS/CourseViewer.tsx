import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/lms/VideoPlayer';
import { InteractiveQuiz } from '@/components/lms/InteractiveQuiz';
import { AssignmentSubmission } from '@/components/lms/AssignmentSubmission';
import { BookmarkNotes } from '@/components/lms/BookmarkNotes';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  CheckCircle,
  Circle,
  Book,
  Clock,
  Users,
  Star,
  Download,
  Share,
  Bookmark,
  Volume2,
  Settings,
  Maximize,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  FileQuestion,
  Trophy,
  Target,
  StickyNote
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  completed: boolean;
  content?: string;
  videoUrl?: string;
  description?: string;
}

interface CourseSection {
  id: string;
  title: string;
  modules: CourseModule[];
  completed: boolean;
  expanded: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  duration: string;
  rating: number;
  students: number;
  sections: CourseSection[];
  progress: number;
}

// Demo course data
const demoCoursePart: Course = {
  id: 'demo-cybersecurity-101',
  title: 'Introduction to Cybersecurity Compliance',
  description: 'Master the fundamentals of cybersecurity compliance frameworks including GDPR, ISO 27001, and industry best practices through practical examples and real-world scenarios.',
  instructor: {
    name: 'Dr. Sarah Chen',
    title: 'Senior Cybersecurity Consultant',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=sarah'
  },
  duration: '2h 30m',
  rating: 4.8,
  students: 1247,
  progress: 35,
  sections: [
    {
      id: 'section-1',
      title: 'Introduction to Cybersecurity',
      completed: true,
      expanded: true,
      modules: [
        {
          id: 'mod-1-1',
          title: 'Welcome and Course Overview',
          type: 'video',
          duration: '8:30',
          completed: true,
          videoUrl: 'https://example.com/video1',
          description: 'Introduction to the course structure and learning objectives'
        },
        {
          id: 'mod-1-2',
          title: 'What is Cybersecurity?',
          type: 'text',
          duration: '12 min read',
          completed: true,
          content: '<h3>Understanding Cybersecurity Fundamentals</h3><p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.</p><p>Key areas include:</p><ul><li>Network Security</li><li>Information Security</li><li>Application Security</li><li>Endpoint Security</li></ul>'
        },
        {
          id: 'mod-1-3',
          title: 'Knowledge Check: Basic Concepts',
          type: 'quiz',
          duration: '5 min',
          completed: true,
          content: 'Quiz covering fundamental cybersecurity concepts'
        }
      ]
    },
    {
      id: 'section-2',
      title: 'Compliance Frameworks',
      completed: false,
      expanded: true,
      modules: [
        {
          id: 'mod-2-1',
          title: 'Introduction to GDPR',
          type: 'video',
          duration: '15:45',
          completed: true,
          videoUrl: 'https://example.com/video2',
          description: 'Overview of the General Data Protection Regulation'
        },
        {
          id: 'mod-2-2',
          title: 'GDPR Implementation Guide',
          type: 'text',
          duration: '20 min read',
          completed: false,
          content: '<h3>Implementing GDPR in Your Organization</h3><p>The General Data Protection Regulation (GDPR) is a comprehensive data protection law that affects how organizations collect, store, and process personal data of EU residents.</p>'
        },
        {
          id: 'mod-2-3',
          title: 'ISO 27001 Overview',
          type: 'video',
          duration: '12:20',
          completed: false,
          videoUrl: 'https://example.com/video3',
          description: 'Understanding the ISO 27001 standard for information security'
        },
        {
          id: 'mod-2-4',
          title: 'Compliance Assessment',
          type: 'assignment',
          duration: '30 min',
          completed: false,
          content: 'Practical assessment of compliance frameworks understanding'
        }
      ]
    },
    {
      id: 'section-3',
      title: 'Risk Management',
      completed: false,
      expanded: false,
      modules: [
        {
          id: 'mod-3-1',
          title: 'Risk Assessment Methodologies',
          type: 'video',
          duration: '18:30',
          completed: false,
          videoUrl: 'https://example.com/video4'
        },
        {
          id: 'mod-3-2',
          title: 'Risk Mitigation Strategies',
          type: 'text',
          duration: '15 min read',
          completed: false,
          content: 'Comprehensive guide to risk mitigation in cybersecurity'
        }
      ]
    }
  ]
};

const CourseViewer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course] = useState<Course>(demoCoursePart);
  const [currentModule, setCurrentModule] = useState<CourseModule>(course.sections[1].modules[1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionsState, setSectionsState] = useState(course.sections);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const toggleSection = (sectionId: string) => {
    setSectionsState(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const selectModule = (module: CourseModule) => {
    setCurrentModule(module);
    setIsPlaying(false);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'quiz': return FileQuestion;
      case 'assignment': return Target;
      default: return FileText;
    }
  };

  const getNextModule = () => {
    const allModules = sectionsState.flatMap(section => section.modules);
    const currentIndex = allModules.findIndex(m => m.id === currentModule.id);
    return allModules[currentIndex + 1] || null;
  };

  const getPreviousModule = () => {
    const allModules = sectionsState.flatMap(section => section.modules);
    const currentIndex = allModules.findIndex(m => m.id === currentModule.id);
    return allModules[currentIndex - 1] || null;
  };

  const markModuleComplete = () => {
    // In real app, this would update the backend
    console.log('Marking module complete:', currentModule.id);
    const nextModule = getNextModule();
    if (nextModule) {
      setCurrentModule(nextModule);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Course Navigation */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/lms')}
            className="text-white hover:bg-white/20 mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="font-bold text-lg leading-tight mb-2">{course.title}</h1>
          
          <div className="flex items-center gap-3 text-sm text-blue-100">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-300" />
              {course.rating}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-600">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        {/* Course Content Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {sectionsState.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto text-left"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {section.expanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Section {sectionIndex + 1}</span>
                        {section.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{section.title}</h3>
                    </div>
                  </div>
                </Button>

                {/* Section Modules */}
                {section.expanded && (
                  <div className="ml-6 space-y-1">
                    {section.modules.map((module, moduleIndex) => {
                      const Icon = getModuleIcon(module.type);
                      const isActive = currentModule.id === module.id;
                      
                      return (
                        <Button
                          key={module.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start p-2 h-auto text-left ${
                            isActive ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                          onClick={() => selectModule(module)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center gap-2">
                              {module.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                module.type === 'video' ? 'bg-red-100' :
                                module.type === 'text' ? 'bg-blue-100' :
                                module.type === 'quiz' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                <Icon className={`h-3 w-3 ${
                                  module.type === 'video' ? 'text-red-600' :
                                  module.type === 'text' ? 'text-blue-600' :
                                  module.type === 'quiz' ? 'text-green-600' : 'text-orange-600'
                                }`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{module.title}</h4>
                              <p className="text-xs text-gray-500">{module.duration}</p>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={course.instructor.avatar} />
              <AvatarFallback>
                {course.instructor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{course.instructor.name}</h4>
              <p className="text-xs text-gray-600">{course.instructor.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentModule.type === 'video' ? 'bg-red-100' :
                currentModule.type === 'text' ? 'bg-blue-100' :
                currentModule.type === 'quiz' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {React.createElement(getModuleIcon(currentModule.type), {
                  className: `h-4 w-4 ${
                    currentModule.type === 'video' ? 'text-red-600' :
                    currentModule.type === 'text' ? 'text-blue-600' :
                    currentModule.type === 'quiz' ? 'text-green-600' : 'text-orange-600'
                  }`
                })}
              </div>
              <div>
                <h1 className="font-bold text-lg">{currentModule.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentModule.duration}
                  </span>
                  <Badge variant="outline">
                    {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showBookmarks ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Notes
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentModule.type === 'video' ? (
            <div className="space-y-6">
              {/* Advanced Video Player */}
              <div className="aspect-video">
                <VideoPlayer
                  src={currentModule.videoUrl || 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'}
                  title={currentModule.title}
                  description={currentModule.description}
                  onProgress={(progress, currentTime) => {
                    // Track video progress for analytics
                    setCurrentVideoTime(currentTime);
                    console.log(`Video progress: ${progress}% at ${currentTime}s`);
                  }}
                  onComplete={() => {
                    console.log('Video completed');
                    markModuleComplete();
                  }}
                  className="w-full h-full"
                />
              </div>
              
              {/* Video Description */}
              {currentModule.description && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3">About this video</h3>
                  <p className="text-gray-700">{currentModule.description}</p>
                </Card>
              )}
            </div>
          ) : currentModule.type === 'text' ? (
            <Card className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: currentModule.content || '<p>Text content would be displayed here.</p>' 
                }}
              />
            </Card>
          ) : currentModule.type === 'quiz' ? (
            <InteractiveQuiz
              title={currentModule.title}
              description="Test your understanding of the concepts covered in this section."
              passingScore={70}
              allowRetries={true}
              showExplanations={true}
              timeLimit={10} // 10 minutes
              onComplete={(score, attempts) => {
                console.log(`Quiz completed with score: ${score}%`, attempts);
                if (score >= 70) {
                  markModuleComplete();
                }
              }}
              onProgress={(current, total) => {
                console.log(`Quiz progress: ${current}/${total}`);
              }}
            />
          ) : (
            <AssignmentSubmission
              title={currentModule.title}
              description="Complete this practical assignment to apply what you've learned in this module."
              instructions="Analyze a real-world cybersecurity compliance scenario and provide recommendations based on the frameworks covered in this course."
              dueDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // Due in 7 days
              maxPoints={50}
              allowedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
              maxFileSize={10}
              maxFiles={3}
              onSubmit={(content, files) => {
                console.log('Assignment submitted:', { content, files });
                markModuleComplete();
              }}
              onSaveDraft={(content, files) => {
                console.log('Draft saved:', { content, files });
              }}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              disabled={!getPreviousModule()}
              onClick={() => getPreviousModule() && setCurrentModule(getPreviousModule()!)}
            >
              <SkipBack className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={markModuleComplete}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              
              <Button 
                disabled={!getNextModule()}
                onClick={() => getNextModule() && setCurrentModule(getNextModule()!)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        </div>

        {/* BookmarkNotes Sidebar */}
        {showBookmarks && (
          <div className="w-80 border-l bg-white">
            <div className="h-full overflow-y-auto p-4">
              <BookmarkNotes
                moduleId={currentModule.id}
                moduleName={currentModule.title}
                moduleType={currentModule.type}
                currentPosition={currentModule.type === 'video' ? currentVideoTime : 0}
                onJumpTo={(position) => {
                  if (currentModule.type === 'video') {
                    // In a real implementation, this would seek the video to the position
                    setCurrentVideoTime(position);
                    console.log(`Jumping to ${position}s in video`);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseViewer;