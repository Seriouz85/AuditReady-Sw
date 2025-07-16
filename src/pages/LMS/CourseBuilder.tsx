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
  Sparkles,
  ChevronUp,
  FolderOpen,
  Brain
} from 'lucide-react';
import { DragVertical } from '@/components/ui/drag-vertical';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { UnifiedMediaSidePanel } from '@/components/LMS/UnifiedMediaSidePanel';
import { SectionCard } from '@/components/LMS/SectionCard';
import { QuickActionsToolbar } from '@/components/LMS/QuickActionsToolbar';
import { TemplateLibrary } from '@/components/LMS/TemplateLibrary';
import { toast } from '@/utils/toast';

// Define types for content modules
interface Module {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
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
  
  // Add new state for AI generation
  const [numSectionsToGenerate, setNumSectionsToGenerate] = useState<number>(3);
  const [numQuizzesToGenerate, setNumQuizzesToGenerate] = useState<number>(1);
  const [quizPlacement, setQuizPlacement] = useState<'after_each' | 'at_end'>('after_each');
  const [contentComplexity, setContentComplexity] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [includeVideos, setIncludeVideos] = useState<boolean>(true);
  const [focusAreas, setFocusAreas] = useState<string[]>(['best-practices', 'real-world-examples']);
  
  // Add new state for showing the generate modal
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  
  // Add new state for tab management
  const [activeTab, setActiveTab] = useState<'type' | 'details' | 'course-builder'>('type');
  
  // 1. Add loading state for AI generation
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Add search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Add undo/redo state
  const [undoStack, setUndoStack] = useState<CourseSection[][]>([]);
  const [redoStack, setRedoStack] = useState<CourseSection[][]>([]);
  
  // Media browser states
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [activeMediaSection, setActiveMediaSection] = useState<string | null>(null);
  const [activeMediaModule, setActiveMediaModule] = useState<string | null>(null);
  
  // Template library states
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  
  useEffect(() => { setTheme('light'); setActiveTab('course-builder'); }, [setTheme]);
  
  // Add undo/redo functionality
  const saveToUndoStack = (sections: CourseSection[]) => {
    setUndoStack(prev => [...prev.slice(-9), sections]); // Keep last 10 states
    setRedoStack([]); // Clear redo stack when new action is performed
  };
  
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, courseSections]);
      setCourseSections(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, courseSections]);
      setCourseSections(nextState);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };
  
  // Filter sections based on search and filter
  const filteredSections = courseSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.modules.some(module => 
                           module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.content.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesFilter = filterType === 'all' || 
                         section.modules.some(module => module.type === filterType);
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle back button click
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      setActiveTab('details');
      navigate('/lms/create/content?step=details', { state: { courseData: courseDataFromBuilder } });
    }
  };
  
  // Update addSection function to auto-scroll to the new section
  const addSection = () => {
    saveToUndoStack(courseSections);
    const newSection: CourseSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Section ${courseSections.length + 1}`,
      modules: [],
      isExpanded: true
    };
    
    setCourseSections([...courseSections, newSection]);
    // Auto-scroll to the new section
    scrollToSection(newSection.id);
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
  
  // Update handleGenerateContent to show the modal
  const handleGenerateContent = () => {
    setShowGenerateModal(true);
  };
  
  // Update handleModalSubmit to parse AI response and update courseSections
  const handleModalSubmit = async () => {
    if (!courseData || !courseData.title || !courseData.description) {
      toast.error('Please ensure course title and description are filled in before generating content.');
      return;
    }
    
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error('API key not configured. Please contact your administrator.');
      return;
    }
    
    setShowGenerateModal(false);
    setIsGenerating(true);
    
    // Enhanced AI prompt with user preferences
    const quizInstructions = quizPlacement === 'after_each' 
      ? `Include ${numQuizzesToGenerate} quiz question(s) after each section`
      : `Include ${numQuizzesToGenerate * numSectionsToGenerate} quiz questions at the end of all sections`;
    
    const focusAreasText = focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : '';
    
    const prompt = `Create a comprehensive ${courseData.title} training course. Return ONLY valid JSON in the exact format specified.

Course Requirements:
- Type: ${courseData.type}
- Title: ${courseData.title}
- Target Audience: ${courseData.targetAudience}
- Difficulty: ${courseData.difficultyLevel}
- Content Complexity: ${contentComplexity}
- Description: ${courseData.description}
- Number of sections: ${numSectionsToGenerate}
- Quiz Configuration: ${quizInstructions}
- Include Videos: ${includeVideos}
${focusAreasText}

Content Guidelines:
- Content complexity should match "${contentComplexity}" level
- Include practical applications and real-world scenarios
- Make content engaging and interactive with examples
- Ensure compliance training relevance where applicable
- Use clear, professional language appropriate for ${courseData.targetAudience}
- Include actionable takeaways and best practices
- Each section should be 400-600 words for comprehensive coverage
- Progressive difficulty building upon previous knowledge

REQUIRED JSON FORMAT:
{
  "sections": [
    {
      "title": "Clear, descriptive section title",
      "content": "Comprehensive section content (400-600 words). Include practical examples, step-by-step guidance, and real-world applications. Focus on key concepts, best practices, and actionable insights.",
      "videoSuggestions": ${includeVideos ? '["Brief description of suggested video content for this section"]' : '[]'},
      "quizzes": [
        {
          "question": "Practical question testing understanding",
          "options": ["Correct answer", "Plausible distractor", "Another distractor", "Final distractor"],
          "answer": "Correct answer",
          "explanation": "Brief explanation of why this is correct and relevant context"
        }
      ]
    }
  ]
}

Generate ${numSectionsToGenerate} sections with progressive difficulty. ${quizPlacement === 'after_each' ? `Each section should include ${numQuizzesToGenerate} quiz question(s) that test practical application.` : `Include ${numQuizzesToGenerate * numSectionsToGenerate} comprehensive quiz questions at the end covering all sections.`}
Do NOT include any introduction or explanation text before or after the JSON.`;

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Försök tolka JSON
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (err) {
        // Försök extrahera JSON om AI lagt till text före/efter
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (e) {
            setIsGenerating(false);
            toast.error('Could not parse AI response as JSON. Please try again.');
            return;
          }
        } else {
          setIsGenerating(false);
          toast.error('Could not parse AI response as JSON. Please try again.');
          return;
        }
      }

      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        setIsGenerating(false);
        toast.error('AI response contains no sections. Please try again.');
        return;
      }

      // Enhanced processing with video suggestions and better quiz handling
      const newSections = parsed.sections.map((section: { 
        title?: string; 
        content?: string; 
        videoSuggestions?: string[];
        quizzes?: Array<{ question?: string; options?: string[]; answer?: string; explanation?: string }> 
      }, idx: number) => {
        const modules = [
          {
            id: Math.random().toString(36).substr(2, 9),
            title: section.title || `Section ${idx + 1} Content`,
            type: 'text' as const,
            content: section.content || '',
            isExpanded: true
          }
        ];

        // Add video modules if suggestions are provided
        if (includeVideos && section.videoSuggestions && section.videoSuggestions.length > 0) {
          section.videoSuggestions.forEach((videoDesc, vidIdx) => {
            modules.push({
              id: Math.random().toString(36).substr(2, 9),
              title: `Video: ${videoDesc.substring(0, 50)}${videoDesc.length > 50 ? '...' : ''}`,
              type: 'video' as const,
              content: JSON.stringify({
                title: videoDesc,
                description: `Video content for ${section.title}`,
                url: '', // User will fill this in
                autoplay: false,
                showControls: true
              }),
              isExpanded: true
            });
          });
        }

        // Add quiz modules based on placement preference
        if (quizPlacement === 'after_each' && Array.isArray(section.quizzes)) {
          section.quizzes.forEach((quiz, qidx) => {
            modules.push({
              id: Math.random().toString(36).substr(2, 9),
              title: quiz.question ? `Quiz: ${quiz.question.substring(0, 50)}${quiz.question.length > 50 ? '...' : ''}` : `Quiz ${qidx + 1}`,
              type: 'quiz' as const,
              content: JSON.stringify({
                questions: [{
                  id: Math.random().toString(36).substr(2, 9),
                  question: quiz.question || '',
                  options: quiz.options || [],
                  correctAnswer: quiz.options?.indexOf(quiz.answer || '') || 0,
                  explanation: quiz.explanation || '',
                  type: 'multiple-choice',
                  points: 1
                }],
                passingScore: 70,
                shuffleQuestions: false,
                showResults: true
              }),
              isExpanded: true
            });
          });
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          title: section.title || `Section ${idx + 1}`,
          isExpanded: true,
          modules
        };
      });

      // Add final quiz section if placement is 'at_end'
      if (quizPlacement === 'at_end' && parsed.sections.length > 0) {
        const allQuizzes = parsed.sections.flatMap((section: any) => section.quizzes || []);
        if (allQuizzes.length > 0) {
          const quizSection = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Final Assessment',
            isExpanded: true,
            modules: [{
              id: Math.random().toString(36).substr(2, 9),
              title: 'Course Assessment Quiz',
              type: 'quiz' as const,
              content: JSON.stringify({
                questions: allQuizzes.map((quiz: any, idx: number) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  question: quiz.question || '',
                  options: quiz.options || [],
                  correctAnswer: quiz.options?.indexOf(quiz.answer || '') || 0,
                  explanation: quiz.explanation || '',
                  type: 'multiple-choice',
                  points: 1
                })),
                passingScore: 70,
                shuffleQuestions: true,
                showResults: true
              }),
              isExpanded: true
            }]
          };
          newSections.push(quizSection);
        }
      }

      setCourseSections([...courseSections, ...newSections]);
      // Auto-scroll to first new section
      if (newSections.length > 0) scrollToSection(newSections[0].id);
      setIsGenerating(false);
      toast.success(`Successfully generated ${newSections.length} sections with content and quizzes!`);
      setShowGenerateModal(false);
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please check your API key and try again.');
    }
  };

  // Add new function to auto-scroll to a section
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Section move up/down handlers
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setCourseSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId);
      if (idx === -1) return prev;
      const newSections = [...prev];
      if (direction === 'up' && idx > 0) {
        [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
      } else if (direction === 'down' && idx < newSections.length - 1) {
        [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
      }
      return newSections;
    });
  };
  
  // Handle template selection
  const handleTemplateSelection = (template: any) => {
    saveToUndoStack(courseSections);
    
    // Convert template sections to course sections
    const newSections = template.sections.map((section: any, index: number) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: section.title,
      isExpanded: true,
      modules: section.modules.map((module: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: module.title,
        type: module.type,
        content: module.content,
        isExpanded: true
      }))
    }));
    
    setCourseSections(newSections);
    setShowTemplateLibrary(false);
    toast.success(`Template "${template.name}" applied successfully!`);
  };

  // Helper: Build courseDataFromBuilder from current state
  const courseDataFromBuilder = {
    ...courseData,
    sections: courseSections,
    updatedAt: new Date().toISOString()
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
        {/* Add visual progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            {/* Step 1: Type */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'type' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => {
                setActiveTab('type');
                navigate('/lms/create/content');
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">1</div>
              <span className="ml-2">Type</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            {/* Step 2: Details */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'details' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => {
                setActiveTab('details');
                navigate('/lms/create/content?step=details', { state: { courseData: courseDataFromBuilder } });
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">2</div>
              <span className="ml-2">Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            {/* Step 3: Content */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'course-builder' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => {
                setActiveTab('course-builder');
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">3</div>
              <span className="ml-2">Content</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="mb-6">
          <QuickActionsToolbar
            onAddSection={addSection}
            onAddModule={(type) => {
              // Add module to the first section or create a new section
              if (courseSections.length === 0) {
                addSection();
              }
              const firstSectionId = courseSections[0]?.id || courseSections[courseSections.length - 1]?.id;
              if (firstSectionId) {
                addModule(firstSectionId, type as Module['type']);
              }
            }}
            onSave={saveCourse}
            onPreview={() => {
              // Add preview functionality
              window.open(`/lms/course-preview/${courseData?.id || 'demo'}`, '_blank');
            }}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            isSaving={false}
            onOpenMediaBrowser={() => {
              setActiveMediaSection(courseSections[0]?.id || '');
              setShowMediaBrowser(true);
            }}
          />
        </div>

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
              
              <div className="p-4 space-y-4">
                {filteredSections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    modules={section.modules}
                    isExpanded={section.isExpanded}
                    isFirst={index === 0}
                    isLast={index === courseSections.length - 1}
                    onToggleExpand={() => toggleSectionExpand(section.id)}
                    onUpdateTitle={(newTitle) => updateSectionTitle(section.id, newTitle)}
                    onAddModule={(type) => {
                      const newModule = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Module`,
                        type,
                        content: '',
                        isExpanded: true
                      };
                      addModule(section.id, type, newModule);
                    }}
                    onUpdateModule={(moduleId, updates) => updateModule(section.id, moduleId, updates)}
                    onDeleteModule={(moduleId) => deleteModule(section.id, moduleId)}
                    onDuplicateModule={(moduleId) => {
                      const module = section.modules.find(m => m.id === moduleId);
                      if (module) {
                        const newModule = {
                          ...module,
                          id: Math.random().toString(36).substr(2, 9),
                          title: `${module.title} (Copy)`
                        };
                        addModule(section.id, module.type, newModule);
                      }
                    }}
                    onMoveSection={(direction) => moveSection(section.id, direction)}
                    onDeleteSection={() => deleteSection(section.id)}
                  />
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
              <h3 className="font-semibold mb-3">Quick Start</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowTemplateLibrary(true)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleGenerateContent}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Generate
                </Button>
              </div>
            </Card>
            
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
              <Button className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" onClick={handleGenerateContent}>
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
              </div>
            </Card>
            
            <Card className="rounded-xl border-0 shadow-md p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full rounded-full">
                  <Eye className="mr-2 h-3 w-3" />
                  Preview Course
                </Button>
                <Button variant="outline" size="sm" className="w-full rounded-full">
                  <Settings className="mr-2 h-3 w-3" />
                  Course Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Loader overlay when isGenerating */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-lg font-semibold text-white">Generating content...</span>
          </div>
        </div>
      )}

      {/* Unified Media Side Panel */}
      <UnifiedMediaSidePanel
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={(file) => {
          if (activeMediaSection) {
            // Add media module with the selected file
            const fileName = 'originalName' in file ? file.originalName : file.title;
            const fileType = 'mimeType' in file ? file.mimeType : `${file.type}/*`;
            const fileUrl = file.url;
            const fileDuration = file.duration;
            
            const newModule: Module = {
              id: Math.random().toString(36).substr(2, 9),
              title: fileName,
              type: fileType.startsWith('video/') || file.type === 'video' ? 'video' : 'text',
              content: fileType.startsWith('video/') || file.type === 'video' ? JSON.stringify({
                title: fileName,
                description: file.description || '',
                url: fileUrl,
                autoplay: false,
                showControls: true
              }) : fileType.startsWith('image/') || file.type === 'image' ? `<img src="${fileUrl}" alt="${fileName}" style="max-width: 100%; height: auto;">` : fileUrl,
              duration: fileDuration ? `${Math.floor(fileDuration / 60)}m` : undefined,
              isExpanded: true
            };
            
            setCourseSections(prev => 
              prev.map(section => 
                section.id === activeMediaSection 
                  ? { 
                      ...section, 
                      modules: [...section.modules, newModule],
                      isExpanded: true
                    } 
                  : section
              )
            );
            
            setActiveMediaSection(null);
            toast.success(`Added ${fileName} to the course`);
          }
        }}
      />

      {/* Template Library */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={handleTemplateSelection}
        onCreateFromTemplate={handleTemplateSelection}
      />

      {/* AI Generation Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Course Content with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numSections">Number of Sections</Label>
                <Input
                  id="numSections"
                  type="number"
                  min="1"
                  max="10"
                  value={numSectionsToGenerate}
                  onChange={(e) => setNumSectionsToGenerate(parseInt(e.target.value) || 3)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contentComplexity">Content Complexity</Label>
                <Select value={contentComplexity} onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => setContentComplexity(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Simple concepts and examples</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Balanced depth and detail</SelectItem>
                    <SelectItem value="advanced">Advanced - Complex scenarios and deep analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quiz Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Quiz Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numQuizzes">Number of Quiz Questions</Label>
                  <Input
                    id="numQuizzes"
                    type="number"
                    min="1"
                    max="5"
                    value={numQuizzesToGenerate}
                    onChange={(e) => setNumQuizzesToGenerate(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quizPlacement">Quiz Placement</Label>
                  <Select value={quizPlacement} onValueChange={(value: 'after_each' | 'at_end') => setQuizPlacement(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after_each">After Each Section</SelectItem>
                      <SelectItem value="at_end">At End of Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {quizPlacement === 'after_each' 
                  ? `${numQuizzesToGenerate} quiz question(s) will be added after each of the ${numSectionsToGenerate} sections`
                  : `${numQuizzesToGenerate * numSectionsToGenerate} quiz questions will be combined into a final assessment`
                }
              </div>
            </div>

            {/* Content Options */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Content Options</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeVideos">Include Video Suggestions</Label>
                    <p className="text-sm text-gray-500">Generate video content suggestions for each section</p>
                  </div>
                  <Switch
                    id="includeVideos"
                    checked={includeVideos}
                    onCheckedChange={setIncludeVideos}
                  />
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Focus Areas</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'best-practices',
                  'real-world-examples', 
                  'case-studies',
                  'step-by-step-guides',
                  'common-mistakes',
                  'industry-standards',
                  'compliance-requirements',
                  'troubleshooting'
                ].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={focusAreas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFocusAreas([...focusAreas, area]);
                        } else {
                          setFocusAreas(focusAreas.filter(f => f !== area));
                        }
                      }}
                    />
                    <Label htmlFor={area} className="text-sm capitalize cursor-pointer">
                      {area.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">AI-Generated Content</p>
                  <p className="text-sm text-blue-700">
                    The AI will create comprehensive sections with {contentComplexity} complexity level, 
                    including practical examples and interactive elements based on your selections.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                className="flex-1"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleModalSubmit}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBuilder;
