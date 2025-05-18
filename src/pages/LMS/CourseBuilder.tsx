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
  ChevronUp
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
  
  // Add new state for AI generation
  const [numSectionsToGenerate, setNumSectionsToGenerate] = useState<number>(3);
  
  // Add new state for showing the generate modal
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  
  // Add new state for tab management
  const [activeTab, setActiveTab] = useState<'type' | 'details' | 'course-builder'>('type');
  
  // 1. Add loading state for AI generation
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => { setTheme('light'); setActiveTab('course-builder'); }, [setTheme]);
  
  // Handle back button click
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      setActiveTab('details');
      navigate('/lms/create/content?step=details', { state: { courseData: courseDataFromBuilder } });
    }
  };
  
  // Update addSection function to auto-scroll to the new section
  const addSection = () => {
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
    setShowGenerateModal(false);
    if (!courseData) {
      alert('Please ensure course details are filled in.');
      return;
    }
    setIsGenerating(true);
    // Ny, tydlig prompt för AI
    const prompt = `Return ONLY valid JSON.
Create a professional training course with the following details:
- Type: ${courseData.type}
- Title: ${courseData.title}
- Target Audience: ${courseData.targetAudience}
- Difficulty: ${courseData.difficultyLevel}
- Description: ${courseData.description}
- Number of sections: ${numSectionsToGenerate}

For each section, provide:
- title: string
- content: string (the main text for the section)
- quizzes: array of quiz questions (optional, each with question, options, answer)

Example format:
{
  "sections": [
    {
      "title": "Section 1 Title",
      "content": "Section 1 main text...",
      "quizzes": [
        {
          "question": "What is GDPR?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "Option 2"
        }
      ]
    }
  ]
}
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
            alert('Kunde inte tolka AI-svaret som JSON. Försök igen.');
            return;
          }
        } else {
          setIsGenerating(false);
          alert('Kunde inte tolka AI-svaret som JSON. Försök igen.');
          return;
        }
      }

      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        setIsGenerating(false);
        alert('AI-svaret innehåller inga sektioner. Försök igen.');
        return;
      }

      // Fix: Ensure all modules are expanded and first section gets its content
      const newSections = parsed.sections.map((section: { title?: string; content?: string; quizzes?: Array<{ question?: string; options?: string[]; answer?: string }> }, idx: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: section.title || `Section ${idx + 1}`,
        isExpanded: true,
        modules: [
          {
            id: Math.random().toString(36).substr(2, 9),
            title: section.title || `Section ${idx + 1} Content`,
            type: 'text',
            content: section.content || '',
            isExpanded: true
          },
          ...(Array.isArray(section.quizzes) ? section.quizzes.map((quiz: { question?: string; options?: string[]; answer?: string }, qidx: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: quiz.question ? `Quiz: ${quiz.question}` : `Quiz ${qidx + 1}`,
            type: 'quiz',
            content: JSON.stringify({
              question: quiz.question || '',
              options: quiz.options || [],
              answer: quiz.answer || ''
            }),
            isExpanded: true
          })) : [])
        ]
      }));

      setCourseSections([...courseSections, ...newSections]);
      // Auto-scroll till första nya sektionen
      if (newSections.length > 0) scrollToSection(newSections[0].id);
      setIsGenerating(false);
      alert('Innehåll genererat och uppdelat i sektioner!');
      setActiveTab('details');
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating content:', error);
      alert('Misslyckades med att generera innehåll. Försök igen.');
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
                  <div key={section.id} id={section.id} className="border-b last:border-0">
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
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-200"
                          onClick={e => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                          disabled={courseSections.findIndex(s => s.id === section.id) === 0}
                        >
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-200"
                          onClick={e => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                          disabled={courseSections.findIndex(s => s.id === section.id) === courseSections.length - 1}
                        >
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
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
                                  <div className="prose prose-lg font-serif text-gray-800 bg-white p-6 rounded-lg shadow-inner min-h-[150px]">
                                    {module.content}
                                  </div>
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
                                  (() => {
                                    let quizData: { question: string; options: string[]; answer: string } = { question: '', options: [], answer: '' };
                                    try {
                                      quizData = JSON.parse(module.content);
                                    } catch (error) {
                                      console.error('Error parsing quiz data:', error);
                                    }
                                    return (
                                      <div className="space-y-3">
                                        <Input
                                          placeholder="Quizfråga"
                                          className="rounded-lg"
                                          value={quizData.question}
                                          onChange={e => {
                                            const updated = { ...quizData, question: e.target.value };
                                            updateModule(section.id, module.id, { content: JSON.stringify(updated) });
                                          }}
                                        />
                                        {quizData.options && quizData.options.map((opt, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            <Input
                                              placeholder={`Alternativ ${i + 1}`}
                                              className="rounded-lg"
                                              value={opt}
                                              onChange={e => {
                                                const newOptions = [...quizData.options];
                                                newOptions[i] = e.target.value;
                                                const updated = { ...quizData, options: newOptions };
                                                updateModule(section.id, module.id, { content: JSON.stringify(updated) });
                                              }}
                                            />
                                            <input
                                              type="radio"
                                              checked={quizData.answer === opt}
                                              onChange={() => {
                                                const updated = { ...quizData, answer: opt };
                                                updateModule(section.id, module.id, { content: JSON.stringify(updated) });
                                              }}
                                              name={`quiz-answer-${module.id}`}
                                            />
                                            <span className="text-xs text-gray-500">Correct answer</span>
                                          </div>
                                        ))}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-full"
                                          onClick={() => {
                                            const updated = { ...quizData, options: [...(quizData.options || []), ''] };
                                            updateModule(section.id, module.id, { content: JSON.stringify(updated) });
                                          }}
                                        >
                                          Lägg till alternativ
                                        </Button>
                                      </div>
                                    );
                                  })()
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

      {/* Add the modal dialog */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Generate Content</h3>
            <p className="mb-4">How many sections would you like to generate?</p>
            <Input
              type="number"
              value={numSectionsToGenerate}
              onChange={(e) => setNumSectionsToGenerate(Number(e.target.value))}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
              <Button onClick={handleModalSubmit}>Generate</Button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CourseBuilder; 