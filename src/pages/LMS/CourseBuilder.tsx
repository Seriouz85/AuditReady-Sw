import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Video, 
  FileQuestion,
  ChevronRight,
  ChevronDown,
  Trash2,
  Settings,
  Sparkles,
  Brain,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

// Inline editable title component
interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ value, onSave, className, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    if (tempValue.trim() && tempValue !== value) {
      onSave(tempValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`h-6 text-sm ${className}`}
        placeholder={placeholder}
        autoFocus
      />
    );
  }

  return (
    <div className={`flex items-center gap-1 group ${className}`}>
      <span
        className="cursor-pointer hover:text-blue-600 truncate"
        onClick={() => setIsEditing(true)}
        title="Click to edit"
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-50 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        <Edit2 className="h-3 w-3 text-gray-400 hover:text-blue-600" />
      </Button>
    </div>
  );
};

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
  
  // Add state for section deletion confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  
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
      if (previousState) {
        setRedoStack(prev => [...prev, courseSections]);
        setCourseSections(previousState);
        setUndoStack(prev => prev.slice(0, -1));
      }
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      if (nextState) {
        setUndoStack(prev => [...prev, courseSections]);
        setCourseSections(nextState);
        setRedoStack(prev => prev.slice(0, -1));
      }
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
      id: Math.random().toString(36).substring(2, 11),
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
    setSectionToDelete(sectionId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm section deletion
  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      setCourseSections(prev => prev.filter(section => section.id !== sectionToDelete));
      setSectionToDelete(null);
      setShowDeleteConfirm(false);
    }
  };
  
  // Add a module to a section
  const addModule = (sectionId: string, moduleType: Module['type']) => {
    const newModule: Module = {
      id: Math.random().toString(36).substring(2, 11),
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
- Create beautifully formatted HTML content with proper structure
- Use rich HTML formatting: headers (h2, h3), styled divs, cards, lists, icons
- Include visual elements like gradient backgrounds, colored sections, and badges
- Add emoji icons and professional styling similar to modern e-learning platforms
- Include practical applications and real-world scenarios with examples
- Make content engaging and interactive with call-out boxes and visual hierarchy
- Use proper CSS classes for styling (bg-gradient-to-r, rounded-xl, shadow-sm, etc.)
- Include actionable takeaways and best practices in highlighted sections
- Each section should be 500-800 words with rich HTML formatting
- Progressive difficulty building upon previous knowledge
- Format like professional e-learning content with visual appeal

REQUIRED JSON FORMAT:
{
  "sections": [
    {
      "title": "Clear, descriptive section title",
      "description": "Brief 1-2 sentence overview of what this section covers",
      "content": "<div class=\"space-y-8\"><div class=\"bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg\"><h2 class=\"text-2xl font-bold text-blue-900 mb-3\">🎯 Section Title</h2><p class=\"text-lg text-blue-800 leading-relaxed\">Engaging introduction paragraph with proper HTML formatting</p></div><div class=\"grid md:grid-cols-2 gap-6\"><div class=\"bg-white border border-gray-200 rounded-xl p-6 shadow-sm\"><h3 class=\"text-xl font-semibold text-gray-900 mb-4 flex items-center\"><span class=\"w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold\">📋</span>Key Points</h3><ul class=\"space-y-3 text-gray-700\"><li class=\"flex items-start\"><span class=\"w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0\"></span><span><strong>Point 1:</strong> Detailed explanation</span></li></ul></div></div></div>",
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

Generate ${numSectionsToGenerate} sections with progressive difficulty. Each section should be a SEPARATE learning module with rich HTML content. ${quizPlacement === 'after_each' ? `Each section should include ${numQuizzesToGenerate} quiz question(s) that test practical application.` : `Include ${numQuizzesToGenerate * numSectionsToGenerate} comprehensive quiz questions at the end covering all sections.`}
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
      // Clear existing sections first to avoid appending to existing content
      const shouldClearExisting = window.confirm(
        'Do you want to replace all existing course content with AI-generated content, or add the new content to existing sections?\n\nClick OK to REPLACE existing content\nClick Cancel to ADD to existing content'
      );
      
      // Type the quiz properly
      interface QuizFromAI {
        question?: string;
        options?: string[];
        answer?: string;
        correctAnswers?: number[];
        type?: 'multiple-choice' | 'multiple-select' | 'true-false';
        explanation?: string;
      }
      
      const newSections = parsed.sections.map((section: { 
        title?: string; 
        description?: string;
        content?: string; 
        videoSuggestions?: string[];
        quizzes?: Array<QuizFromAI> 
      }, idx: number) => {
        
        // Create the main content module with enhanced formatting
        const mainContentModule: Module = {
          id: Math.random().toString(36).substring(2, 11),
          title: section.title || `Section ${idx + 1} - Main Content`,
          type: 'text',
          content: section.content || `<div class="p-6"><h2 class="text-2xl font-bold mb-4">${section.title || `Section ${idx + 1}`}</h2><p>${section.description || 'Section content'}</p></div>`,
          isExpanded: true
        };

        const modules: Module[] = [mainContentModule];

        // Add video modules if suggestions are provided
        if (includeVideos && section.videoSuggestions && section.videoSuggestions.length > 0) {
          section.videoSuggestions.forEach((videoDesc) => {
            modules.push({
              id: Math.random().toString(36).substring(2, 11),
              title: `📹 ${videoDesc.substring(0, 60)}${videoDesc.length > 60 ? '...' : ''}`,
              type: 'video' as Module['type'],
              content: JSON.stringify({
                title: videoDesc,
                description: `Video content for ${section.title} - ${section.description || 'Educational video'}`,
                url: '', // User will fill this in
                autoplay: false,
                showControls: true,
                placeholder: `📹 Video suggestion: ${videoDesc}\n\nPlease add the video URL to complete this module.`
              }),
              isExpanded: false // Keep videos collapsed initially
            });
          });
        }

        // Add quiz modules based on placement preference
        if (quizPlacement === 'after_each' && Array.isArray(section.quizzes) && section.quizzes.length > 0) {
          section.quizzes.forEach((quiz, qidx) => {
            modules.push({
              id: Math.random().toString(36).substring(2, 11),
              title: `📝 ${quiz.question ? quiz.question.substring(0, 60) : `Assessment ${qidx + 1}`}${quiz.question && quiz.question.length > 60 ? '...' : ''}`,
              type: 'quiz' as Module['type'],
              content: JSON.stringify({
                questions: [{
                  id: Math.random().toString(36).substring(2, 11),
                  question: quiz.question || `Question ${qidx + 1}`,
                  options: quiz.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                  correctAnswer: quiz.correctAnswers ? quiz.correctAnswers : (quiz.options?.indexOf(quiz.answer || (quiz.options?.[0] || '')) || 0),
                  explanation: quiz.explanation || 'This is the correct answer based on the section content.',
                  type: quiz.type || (quiz.correctAnswers && quiz.correctAnswers.length > 1 ? 'multiple-select' : 'multiple-choice'),
                  points: 1
                }],
                passingScore: 70,
                shuffleQuestions: false,
                showResults: true
              }),
              isExpanded: false // Keep quizzes collapsed initially
            });
          });
        }

        return {
          id: Math.random().toString(36).substring(2, 11),
          title: section.title || `Section ${idx + 1}: Learning Module`,
          isExpanded: true, // Expand sections so users can see the content
          modules
        };
      });

      // Add final quiz section if placement is 'at_end'
      if (quizPlacement === 'at_end' && parsed.sections.length > 0) {
        const allQuizzes = parsed.sections.flatMap((section: any) => section.quizzes || []);
        if (allQuizzes.length > 0) {
          const quizSection = {
            id: Math.random().toString(36).substring(2, 11),
            title: '🏆 Final Assessment',
            isExpanded: true,
            modules: [{
              id: Math.random().toString(36).substring(2, 11),
              title: '📝 Comprehensive Course Assessment',
              type: 'quiz' as const,
              content: JSON.stringify({
                questions: allQuizzes.map((quiz: any, idx: number) => ({
                  id: Math.random().toString(36).substring(2, 11),
                  question: quiz.question || `Question ${idx + 1}`,
                  options: quiz.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                  correctAnswer: quiz.options?.indexOf(quiz.answer || quiz.options?.[0]) || 0,
                  explanation: quiz.explanation || 'This is the correct answer based on the course content.',
                  type: 'multiple-choice',
                  points: 1
                })),
                passingScore: 70,
                shuffleQuestions: true,
                showResults: true,
                description: `Complete this assessment to test your understanding of all ${parsed.sections.length} course sections.`
              }),
              isExpanded: false
            }]
          };
          newSections.push(quizSection);
        }
      }

      // Update course sections based on user choice
      if (shouldClearExisting) {
        setCourseSections(newSections);
        toast.success(`Successfully generated ${newSections.length} new sections, replacing existing content!`);
      } else {
        setCourseSections([...courseSections, ...newSections]);
        toast.success(`Successfully added ${newSections.length} new sections to existing course content!`);
      }
      
      // Auto-scroll to first new section
      if (newSections.length > 0) {
        setTimeout(() => scrollToSection(newSections[0].id), 500);
      }
      
      setIsGenerating(false);
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
        const currentSection = newSections[idx];
        const previousSection = newSections[idx - 1];
        if (currentSection && previousSection) {
          newSections[idx - 1] = currentSection;
          newSections[idx] = previousSection;
        }
      } else if (direction === 'down' && idx < newSections.length - 1) {
        const currentSection = newSections[idx];
        const nextSection = newSections[idx + 1];
        if (currentSection && nextSection) {
          newSections[idx] = nextSection;
          newSections[idx + 1] = currentSection;
        }
      }
      return newSections;
    });
  };
  
  // Handle template selection
  const handleTemplateSelection = (template: any) => {
    saveToUndoStack(courseSections);
    
    // Convert template sections to course sections
    const newSections = template.sections.map((section: any) => ({
      id: Math.random().toString(36).substring(2, 11),
      title: section.title,
      isExpanded: true,
      modules: section.modules.map((module: any) => ({
        id: Math.random().toString(36).substring(2, 11),
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
    <div className="min-h-screen bg-gray-50 flex">
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
              onClick={handleBack}
              className="text-white hover:bg-white/20 mb-3 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to LMS
            </Button>
            
            {/* Course Title Section */}
            <div className="mb-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold leading-tight text-white truncate">
                    {courseData?.title || 'Course Builder'}
                  </h1>
                  <p className="text-white/80 text-xs leading-tight mt-1">
                    {courseSections.reduce((total, section) => total + section.modules.length, 0)} modules
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-3">
              {courseSections.map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div 
                    className="p-3 bg-gray-50 border-b hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {sectionIndex + 1}
                        </div>
                        <EditableTitle
                          value={section.title}
                          onSave={(newTitle) => updateSectionTitle(section.id, newTitle)}
                          className="font-medium text-sm text-gray-900 flex-1 min-w-0"
                          placeholder="Section title"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSectionExpand(section.id)}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          {section.isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {section.modules.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modules List */}
                  {section.isExpanded && (
                    <div className="space-y-1">
                      {section.modules.map((module) => {
                        const getModuleIcon = (type: string) => {
                          switch (type) {
                            case 'video': return Video;
                            case 'text': return FileText;
                            case 'quiz': return FileQuestion;
                            default: return FileText;
                          }
                        };
                        const Icon = getModuleIcon(module.type);
                        
                        return (
                          <div
                            key={module.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // Auto-expand the section if not expanded
                              if (!section.isExpanded) {
                                toggleSectionExpand(section.id);
                              }
                              // Auto-expand the module and start editing
                              updateModule(section.id, module.id, { isExpanded: true });
                              // Scroll to the module in the main content area
                              setTimeout(() => {
                                const moduleElement = document.querySelector(`[data-module-id="${module.id}"]`);
                                if (moduleElement) {
                                  moduleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  // Trigger edit mode if the module has content
                                  const editButton = moduleElement.querySelector('[data-action="edit"]') as HTMLButtonElement;
                                  if (editButton) {
                                    editButton.click();
                                  }
                                }
                              }, 300);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm ${
                                module.type === 'video' 
                                  ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                module.type === 'text' 
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                module.type === 'quiz' 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                  'bg-gradient-to-br from-gray-500 to-slate-600'
                              }`}>
                                <Icon className="h-3.5 w-3.5 text-white relative z-10" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div 
                                onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                                className="block"
                              >
                                <EditableTitle
                                  value={module.title}
                                  onSave={(newTitle) => updateModule(section.id, module.id, { title: newTitle })}
                                  className="text-sm font-medium text-gray-900 block truncate"
                                  placeholder="Module title"
                                />
                              </div>
                              {module.duration && (
                                <span className="text-xs text-gray-500">
                                  {module.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add Module to This Section */}
                      <div className="p-3 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addModule(section.id, 'text');
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600"
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            Text
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addModule(section.id, 'video');
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-gray-600 hover:text-red-600"
                          >
                            <Video className="mr-1 h-3 w-3" />
                            Video
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addModule(section.id, 'quiz');
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-gray-600 hover:text-green-600"
                          >
                            <FileQuestion className="mr-1 h-3 w-3" />
                            Quiz
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add Section Button */}
            <div className="mt-4 space-y-3">
              <Button 
                onClick={addSection} 
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area - Add margin for fixed sidebar */}
      <div className="flex-1 flex ml-80">
        <div className="flex-1 flex flex-col">
          {/* Content Header - Compact Design - Sticky */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="px-6 py-3">
              {/* Add visual progress indicator */}
              <div className="flex justify-center mb-4">
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
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
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
                onGenerateWithAI={handleGenerateContent}
              />
            </div>
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
                      addModule(section.id, type);
                    }}
                    onUpdateModule={(moduleId, updates) => updateModule(section.id, moduleId, updates)}
                    onDeleteModule={(moduleId) => deleteModule(section.id, moduleId)}
                    onDuplicateModule={(moduleId) => {
                      const module = section.modules.find(m => m.id === moduleId);
                      if (module) {
                        const duplicatedModule: Module = {
                          ...module,
                          id: Math.random().toString(36).substring(2, 11),
                          title: `${module.title} (Copy)`
                        };
                        setCourseSections(prev => 
                          prev.map(sec => 
                            sec.id === section.id 
                              ? { 
                                  ...sec, 
                                  modules: [...sec.modules, duplicatedModule],
                                  isExpanded: true
                                } 
                              : sec
                          )
                        );
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
          
          </div>
        </div>

      {/* Beautiful AI Generation Loading Animation */}
      {isGenerating && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative">
            {/* Animated background circles */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-xl animate-bounce"></div>
            </div>
            <div className="absolute inset-0 animate-pulse delay-150">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400/40 to-indigo-400/40 rounded-full blur-lg animate-bounce delay-200"></div>
            </div>
            <div className="absolute inset-0 animate-pulse delay-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-400/50 to-purple-400/50 rounded-full blur-md animate-bounce delay-75"></div>
            </div>
            
            {/* Central content */}
            <div className="relative flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              {/* Animated Brain Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-lg opacity-60 animate-pulse scale-110"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full shadow-lg">
                  <Brain className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
              
              {/* Loading text with gradient */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI is thinking...
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  Generating amazing course content for you
                </p>
              </div>
              
              {/* Animated progress dots */}
              <div className="flex space-x-2 mt-6">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
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
            const fileName = 'originalName' in file ? file.originalName : ('title' in file ? file.title : 'Untitled');
            const fileType = 'mimeType' in file ? file.mimeType : 'application/octet-stream';
            const fileUrl = file.url;
            const fileDuration = file.duration;
            
            // Determine module type based on file type
            let moduleType: Module['type'] = 'text';
            if ('type' in file) {
              if (file.type === 'video' || fileType.startsWith('video/')) {
                moduleType = 'video';
              }
            } else if (fileType.startsWith('video/')) {
              moduleType = 'video';
            }
            
            const newModule: Module = {
              id: Math.random().toString(36).substring(2, 11),
              title: fileName,
              type: moduleType,
              content: moduleType === 'video' ? JSON.stringify({
                title: fileName,
                description: ('description' in file ? file.description : '') || '',
                url: fileUrl,
                autoplay: false,
                showControls: true
              }) : fileType.startsWith('image/') ? `<img src="${fileUrl}" alt="${fileName}" style="max-width: 100%; height: auto;">` : fileUrl,
              ...(fileDuration ? { duration: `${Math.floor(fileDuration / 60)}m` } : {}),
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

      {/* Section Deletion Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Section?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this section and all its content? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSectionToDelete(null);
                  setShowDeleteConfirm(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDeleteSection}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generation Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
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
