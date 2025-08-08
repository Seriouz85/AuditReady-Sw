import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle,
  Circle,
  Clock,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  FileQuestion,
  Trophy,
  Target,
  Edit,
  Save,
  ExternalLink,
  Book
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/utils/toast';

interface Module {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: string;
  duration?: string;
  isExpanded?: boolean;
  completed?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  modules: Module[];
  isExpanded: boolean;
  completed?: boolean;
}

interface CourseData {
  id?: string;
  title: string;
  description: string;
  type: string;
  targetAudience: string;
  difficultyLevel: string;
  themeColor?: string;
  instructor?: {
    name: string;
    title: string;
    avatar?: string;
  };
}

const CoursePreview: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get course data from localStorage or location state
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // First try to get from location state (passed from navigation)
    if (location.state?.courseData && location.state?.courseSections) {
      setCourseData(location.state.courseData);
      setCourseSections(location.state.courseSections);
      // Expand first section by default
      if (location.state.courseSections.length > 0) {
        setExpandedSections(new Set([location.state.courseSections[0].id]));
      }
    } 
    // Then try to get course data from localStorage (saved by CourseBuilder)
    else {
      const savedCourseData = localStorage.getItem('courseBuilderData');
      const savedSections = localStorage.getItem('courseBuilderSections');
      
      if (savedCourseData && savedSections) {
        try {
          setCourseData(JSON.parse(savedCourseData));
          const sections = JSON.parse(savedSections);
          setCourseSections(sections);
          // Expand first section by default
          if (sections.length > 0) {
            setExpandedSections(new Set([sections[0].id]));
          }
        } catch (error) {
          console.error('Error loading course data:', error);
          toast.error('Failed to load course preview data');
        }
      } else if (courseId === 'demo') {
        // Use demo data
        setCourseData({
          title: 'Demo Course',
          description: 'This is a demo course preview',
          type: 'Compliance',
          targetAudience: 'All Employees',
          difficultyLevel: 'Beginner',
          themeColor: 'from-blue-500 to-indigo-600',
          instructor: {
            name: 'Demo Instructor',
            title: 'Senior Trainer',
            avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=demo'
          }
        });
        setCourseSections([
          {
            id: 'demo-1',
            title: 'Introduction',
            isExpanded: true,
            modules: [
              {
                id: 'demo-mod-1',
                title: 'Welcome to the Course',
                type: 'text',
                content: '<h2>Welcome!</h2><p>This is a demo course preview.</p>',
                duration: '5 min'
              }
            ]
          }
        ]);
        setExpandedSections(new Set(['demo-1']));
      }
    }
  }, [courseId, location.state]);
  
  const toggleSectionExpand = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };
  
  const handleModuleClick = (sectionIndex: number, moduleIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentModuleIndex(moduleIndex);
  };
  
  const markModuleComplete = (moduleId: string) => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(moduleId);
    setCompletedModules(newCompleted);
  };
  
  const handleNext = () => {
    const currentSection = courseSections[currentSectionIndex];
    if (currentModuleIndex < currentSection.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else if (currentSectionIndex < courseSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentModuleIndex(0);
    }
  };
  
  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSection = courseSections[currentSectionIndex - 1];
      setCurrentModuleIndex(prevSection.modules.length - 1);
    }
  };
  
  const calculateProgress = () => {
    const totalModules = courseSections.reduce((acc, section) => acc + section.modules.length, 0);
    if (totalModules === 0) return 0;
    return Math.round((completedModules.size / totalModules) * 100);
  };
  
  const handleBackToBuilder = () => {
    navigate('/lms/create/course-builder', { 
      state: { 
        courseData,
        courseSections,
        returnFromPreview: true
      }
    });
  };
  
  const renderModuleContent = (module: Module) => {
    switch (module.type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: module.content || '<p>No content available</p>' }} />
          </div>
        );
      
      case 'video':
        try {
          const videoData = JSON.parse(module.content);
          return (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold">{videoData.title || 'Video Player'}</p>
                  <p className="text-sm opacity-75 mt-2">{videoData.description || 'Video content will be displayed here'}</p>
                  {videoData.url ? (
                    <Button className="mt-4" variant="secondary">
                      <Play className="mr-2 h-4 w-4" />
                      Play Video
                    </Button>
                  ) : (
                    <p className="text-sm mt-4 text-yellow-400">{videoData.placeholder || 'Video URL not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          );
        } catch {
          return <p>Video content</p>;
        }
      
      case 'quiz':
        try {
          const quizData = JSON.parse(module.content);
          return (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileQuestion className="mr-2 h-5 w-5 text-blue-600" />
                  Assessment
                </h3>
                {quizData.questions?.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="mb-6 last:mb-0">
                    <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
                    <div className="space-y-2 ml-4">
                      {q.options?.map((option: string, optIdx: number) => (
                        <label key={optIdx} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded">
                          <input type="radio" name={`question-${idx}`} className="text-blue-600" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="mt-4 w-full">
                  Submit Assessment
                </Button>
              </div>
            </div>
          );
        } catch {
          return <p>Quiz content</p>;
        }
      
      default:
        return <p>Unknown module type</p>;
    }
  };
  
  if (!courseData || courseSections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Preview Data Available</h2>
          <p className="text-gray-600 mb-6">Please save your course in the builder before previewing.</p>
          <Button onClick={() => navigate('/lms/create/course-builder')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Builder
          </Button>
        </Card>
      </div>
    );
  }
  
  const currentSection = courseSections[currentSectionIndex];
  const currentModule = currentSection?.modules[currentModuleIndex];
  
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar - Course Navigation - Fixed */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col fixed left-0 top-0 h-screen z-20">
        {/* Header - Compact Design */}
        <div className="p-4 border-b bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
          </div>
          
          <div className="relative z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToBuilder}
              className="text-white hover:bg-white/20 mb-3 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </Button>
            
            {/* Course Title Section - Better Structure */}
            <div className="mb-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Book className="h-5 w-5 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-lg leading-tight line-clamp-2">{courseData.title}</h1>
                  <p className="text-blue-100 text-xs mt-1 font-medium">Preview Mode - Interactive Learning</p>
                </div>
              </div>
              
              {/* Course Description */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                <p className="text-white/90 text-xs leading-relaxed line-clamp-3">
                  {courseData.description}
                </p>
              </div>
            </div>
            
            {/* Course Metrics - Compact Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1.5">
                <Clock className="h-3 w-3 text-blue-200" />
                <span className="text-blue-100 font-medium">{courseSections.reduce((acc, s) => acc + s.modules.length, 0) * 5} min</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1.5">
                <Users className="h-3 w-3 text-green-200" />
                <span className="text-blue-100 font-medium">{courseData.targetAudience.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1.5">
                <Star className="h-3 w-3 fill-current text-yellow-300" />
                <span className="text-blue-100 font-medium">Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress - Compact */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">Course Progress</span>
            <span className="text-xs font-bold text-blue-600">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-1.5" />
        </div>

        {/* Course Content Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {courseSections.map((section, sectionIdx) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header - Enhanced Design */}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2.5 h-auto text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
                  onClick={() => toggleSectionExpand(section.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      expandedSections.has(section.id) ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-200'
                    }`}>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-3 w-3 text-white" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 rounded-md shadow-sm">
                          Section {sectionIdx + 1}
                        </span>
                        {section.modules.every(m => completedModules.has(m.id)) && (
                          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700">{section.title}</p>
                      <p className="text-xs text-gray-500">{section.modules.length} modules</p>
                    </div>
                  </div>
                </Button>

                {/* Modules */}
                {expandedSections.has(section.id) && (
                  <div className="pl-4 space-y-1">
                    {section.modules.map((module, moduleIdx) => {
                      const isActive = currentSectionIndex === sectionIdx && currentModuleIndex === moduleIdx;
                      const Icon = module.type === 'video' ? Video : module.type === 'text' ? FileText : FileQuestion;
                      
                      return (
                        <Button
                          key={module.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start p-2 h-auto text-left ${
                            isActive ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                          onClick={() => handleModuleClick(sectionIdx, moduleIdx)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center gap-2">
                              {completedModules.has(module.id) ? (
                                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm ${
                                module.type === 'video' 
                                  ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                module.type === 'text' 
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                module.type === 'quiz' 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-orange-500 to-amber-600'
                              }`}>
                                {/* Background pattern for sophistication */}
                                <div className="absolute inset-0 bg-white/10"></div>
                                <Icon className="h-3.5 w-3.5 text-white relative z-10" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{module.title}</h4>
                              <p className="text-xs text-gray-500">{module.duration || '5 min'}</p>
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

        {/* Course Info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Type</span>
              <Badge variant="secondary" className="text-xs">{courseData.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Level</span>
              <span className="font-medium">{courseData.difficultyLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Sections</span>
              <span className="font-medium">{courseSections.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area - Add margin for fixed sidebar */}
      <div className="flex-1 flex ml-80">
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Content Header - Compact Design - Sticky */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    currentModule.type === 'video' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    currentModule.type === 'text' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    currentModule.type === 'quiz' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                  }`}>
                    {currentModule.type === 'video' && <Video className="h-5 w-5 text-white" />}
                    {currentModule.type === 'text' && <FileText className="h-5 w-5 text-white" />}
                    {currentModule.type === 'quiz' && <FileQuestion className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900">{currentModule.title}</h1>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                      <span className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-0.5">
                        <Clock className="h-3 w-3" />
                        {currentModule.duration || '5 min'}
                      </span>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0">
                        {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
                      </Badge>
                      {completedModules.has(currentModule.id) && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Section {currentSectionIndex + 1} / Module {currentModuleIndex + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {currentModule && renderModuleContent(currentModule)}
            </div>
          </div>

          {/* Bottom Navigation - Sticky */}
          <div className="bg-white border-t p-4 sticky bottom-0 z-10">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSectionIndex === 0 && currentModuleIndex === 0}
                >
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-3">
                  {!completedModules.has(currentModule.id) && (
                    <Button
                      variant="outline"
                      onClick={() => markModuleComplete(currentModule.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={
                      currentSectionIndex === courseSections.length - 1 &&
                      currentModuleIndex === currentSection.modules.length - 1
                    }
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;