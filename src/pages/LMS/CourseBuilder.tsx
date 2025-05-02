import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  FileQuestion,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  Trash2,
  Save,
  Eye,
  Settings,
  Sparkles
} from 'lucide-react';
import { DragVertical } from '@/components/ui/drag-vertical';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

// Define types for content modules
interface Module {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz' | 'link' | 'assignment';
  content: string;
  duration?: string;
  isExpanded?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  modules: Module[];
  isExpanded: boolean;
}

const CourseBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state?.courseData || null;
  const { setTheme } = useTheme();
  
  const [courseSections, setCourseSections] = useState<CourseSection[]>([
    {
      id: '1',
      title: 'Introduction',
      modules: [],
      isExpanded: true
    }
  ]);
  
  useEffect(() => { setTheme('light'); }, [setTheme]);
  
  // Handle back button click
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      navigate('/lms/create/content');
    }
  };
  
  // Add a new section
  const addSection = () => {
    const newSection: CourseSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Section ${courseSections.length + 1}`,
      modules: [],
      isExpanded: true
    };
    
    setCourseSections([...courseSections, newSection]);
  };
  
  // Toggle section expansion
  const toggleSectionExpand = (sectionId: string) => {
    setCourseSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isExpanded: !section.isExpanded } 
          : section
      )
    );
  };
  
  // Update section title
  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setCourseSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, title: newTitle } 
          : section
      )
    );
  };
  
  // Delete a section
  const deleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section and all its content?')) {
      setCourseSections(prev => prev.filter(section => section.id !== sectionId));
    }
  };
  
  // Add a module to a section
  const addModule = (sectionId: string, moduleType: Module['type']) => {
    const newModule: Module = {
      id: Math.random().toString(36).substr(2, 9),
      title: `New ${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)}`,
      type: moduleType,
      content: '',
      isExpanded: true
    };
    
    setCourseSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              modules: [...section.modules, newModule],
              isExpanded: true // Ensure section is expanded when adding a module
            } 
          : section
      )
    );
  };
  
  // Toggle module expansion
  const toggleModuleExpand = (sectionId: string, moduleId: string) => {
    setCourseSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              modules: section.modules.map(module => 
                module.id === moduleId 
                  ? { ...module, isExpanded: !module.isExpanded } 
                  : module
              ) 
            } 
          : section
      )
    );
  };
  
  // Update module
  const updateModule = (sectionId: string, moduleId: string, updates: Partial<Module>) => {
    setCourseSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              modules: section.modules.map(module => 
                module.id === moduleId 
                  ? { ...module, ...updates } 
                  : module
              ) 
            } 
          : section
      )
    );
  };
  
  // Delete a module
  const deleteModule = (sectionId: string, moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setCourseSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { 
                ...section, 
                modules: section.modules.filter(module => module.id !== moduleId) 
              } 
            : section
        )
      );
    }
  };
  
  // Save the course
  const saveCourse = () => {
    const completeData = {
      ...courseData,
      sections: courseSections,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Saving course:', completeData);
    // In a real app, you would save this data to your backend
    
    // Show success message
    alert('Course saved successfully!');
    // Navigate back to the LMS page
    navigate('/lms');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-gray-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4 mr-2">
              {courseData?.title || 'Course Builder'}
            </h1>
            <Badge variant="outline" className="ml-2">{courseSections.reduce((total, section) => total + section.modules.length, 0)} modules</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={saveCourse} className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
              <Save className="mr-2 h-4 w-4" />
              Save Course
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container max-w-7xl mx-auto p-4 pt-6">
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* Main content area */}
          <div className="w-full md:w-3/4 space-y-6">
            {/* Course Header Preview */}
            <Card className="overflow-hidden rounded-xl border-0 shadow-md">
              <div className={`bg-gradient-to-r ${courseData?.themeColor || 'from-blue-500 to-indigo-600'} p-6 text-white`}>
                <Badge className="bg-white/20 text-white mb-3">
                  Course
                </Badge>
                <h2 className="text-2xl font-bold mb-2">
                  {courseData?.title || 'New Course'}
                </h2>
                <p className="text-white/80">
                  {courseData?.description || 'No description provided.'}
                </p>
              </div>
            </Card>

            {/* Section and Module Builder */}
            <Card className="rounded-xl border-0 shadow-md p-0 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="font-semibold">Course Content</h2>
                <Button onClick={addSection} className="rounded-full" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>
              
              <div className="p-0">
                {courseSections.map((section) => (
                  <div key={section.id} className="border-b last:border-0">
                    {/* Section header */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSectionExpand(section.id)}
                    >
                      <div className="flex items-center">
                        <DragVertical className="h-5 w-5 text-gray-400 mr-2 cursor-move" />
                        <div className="font-medium">
                          <Input 
                            value={section.title} 
                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                            className="border-0 p-0 h-auto text-base font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{section.modules.length} modules</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        {section.isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    
                    {/* Section content */}
                    {section.isExpanded && (
                      <div className="px-4 pb-4 ml-8">
                        {/* Module list */}
                        {section.modules.map((module) => (
                          <div key={module.id} className="mb-3 bg-white rounded-lg shadow-sm border">
                            {/* Module header */}
                            <div 
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
                              onClick={() => toggleModuleExpand(section.id, module.id)}
                            >
                              <div className="flex items-center">
                                <DragVertical className="h-4 w-4 text-gray-400 mr-2 cursor-move" />
                                {module.type === 'text' && <FileText className="h-4 w-4 text-blue-500 mr-2" />}
                                {module.type === 'video' && <Video className="h-4 w-4 text-pink-500 mr-2" />}
                                {module.type === 'quiz' && <FileQuestion className="h-4 w-4 text-green-500 mr-2" />}
                                {module.type === 'link' && <LinkIcon className="h-4 w-4 text-purple-500 mr-2" />}
                                <div className="font-medium">
                                  <Input 
                                    value={module.title} 
                                    onChange={(e) => updateModule(section.id, module.id, { title: e.target.value })}
                                    className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {module.duration && (
                                  <span className="text-xs text-gray-500">{module.duration}</span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-full hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteModule(section.id, module.id);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                                {module.isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            
                            {/* Module content editor */}
                            {module.isExpanded && (
                              <div className="p-3 border-t">
                                {module.type === 'text' && (
                                  <Textarea 
                                    placeholder="Enter text content here..."
                                    className="min-h-[150px] rounded-lg"
                                    value={module.content}
                                    onChange={(e) => updateModule(section.id, module.id, { content: e.target.value })}
                                  />
                                )}
                                
                                {module.type === 'video' && (
                                  <div className="space-y-3">
                                    <Input 
                                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                      className="rounded-lg"
                                      value={module.content}
                                      onChange={(e) => updateModule(section.id, module.id, { content: e.target.value })}
                                    />
                                    <Input 
                                      placeholder="Estimated duration (e.g., 10:30)"
                                      className="rounded-lg"
                                      value={module.duration || ''}
                                      onChange={(e) => updateModule(section.id, module.id, { duration: e.target.value })}
                                    />
                                  </div>
                                )}
                                
                                {module.type === 'link' && (
                                  <div className="space-y-3">
                                    <Input 
                                      placeholder="Enter URL"
                                      className="rounded-lg"
                                      value={module.content}
                                      onChange={(e) => updateModule(section.id, module.id, { content: e.target.value })}
                                    />
                                    <Textarea 
                                      placeholder="Description (optional)"
                                      className="rounded-lg min-h-[80px]"
                                    />
                                  </div>
                                )}
                                
                                {module.type === 'quiz' && (
                                  <div className="text-center p-4">
                                    <Button 
                                      onClick={() => navigate('/lms/quizzes/create')}
                                      className="rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                                    >
                                      <FileQuestion className="mr-2 h-4 w-4" />
                                      Create Quiz Questions
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">Opens the quiz editor in a new tab</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Add module buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => addModule(section.id, 'text')}
                          >
                            <FileText className="mr-1 h-3.5 w-3.5 text-blue-500" />
                            Text
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => addModule(section.id, 'video')}
                          >
                            <Video className="mr-1 h-3.5 w-3.5 text-pink-500" />
                            Video
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => addModule(section.id, 'quiz')}
                          >
                            <FileQuestion className="mr-1 h-3.5 w-3.5 text-green-500" />
                            Quiz
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => addModule(section.id, 'link')}
                          >
                            <LinkIcon className="mr-1 h-3.5 w-3.5 text-purple-500" />
                            Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {courseSections.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No sections added yet.</p>
                    <Button onClick={addSection} className="rounded-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Section
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-4">
            <Card className="rounded-xl border-0 shadow-md p-4">
              <h3 className="font-semibold mb-3">AI Assistant</h3>
              <div className="p-3 bg-purple-50 rounded-lg mb-3 border border-purple-100">
                <div className="flex gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-800">Need help creating content? Our AI can generate sections and modules for your course.</p>
                  </div>
                </div>
              </div>
              <Button className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
            </Card>
            
            <Card className="rounded-xl border-0 shadow-md p-4">
              <h3 className="font-semibold mb-3">Course Structure</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span>Sections</span>
                  <Badge variant="outline">{courseSections.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Modules</span>
                  <Badge variant="outline">{courseSections.reduce((total, section) => total + section.modules.length, 0)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Duration</span>
                  <Badge variant="outline">{courseData?.estimatedDuration || '0:00'}</Badge>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <Button variant="outline" className="w-full rounded-full" onClick={() => window.scrollTo(0, 0)}>
                <Settings className="mr-2 h-4 w-4" />
                Course Settings
              </Button>
            </Card>
            
            <Card className="rounded-xl border-0 shadow-md p-4">
              <h3 className="font-semibold mb-3">Templates</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-lg text-left">
                  <LayoutGrid className="mr-2 h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Security Awareness</div>
                    <div className="text-xs text-gray-500">5 sections, 15 modules</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-lg text-left">
                  <LayoutGrid className="mr-2 h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Compliance Basics</div>
                    <div className="text-xs text-gray-500">3 sections, 10 modules</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder; 