import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Check, 
  ArrowLeft, 
  Plus, 
  Image as ImageIcon, 
  FileText, 
  BookOpen, 
  ClipboardList,
  Layers,
  Save,
  Upload,
  BookMarked,
  Palette,
  Library,
  FileQuestion,
  Sparkles,
  Timer,
  Users,
  ChevronRight,
  Brain,
  Bot
} from 'lucide-react';
import { useTheme } from 'next-themes';

// Content type interfaces
interface ContentType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  aiPowered?: boolean;
}

const contentTypes: ContentType[] = [
  {
    id: 'course',
    title: 'Course',
    description: 'Create and publish educational content for learners.',
    icon: <BookOpen className="h-10 w-10 text-white" />,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'page',
    title: 'Page',
    description: 'Create a standalone page containing educational content.',
    icon: <FileText className="h-10 w-10 text-white" />,
    color: 'from-purple-500 to-pink-600',
    aiPowered: true
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Create an assessment that evaluates learners\' understanding.',
    icon: <FileQuestion className="h-10 w-10 text-white" />,
    color: 'from-green-500 to-teal-600',
    aiPowered: true
  },
  {
    id: 'assignment',
    title: 'Assignment',
    description: 'Create assignments for learners to do within a certain deadline.',
    icon: <ClipboardList className="h-10 w-10 text-white" />,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'learning-path',
    title: 'Learning Path',
    description: 'Create a structured and sequenced journey for learners to follow.',
    icon: <Layers className="h-10 w-10 text-white" />,
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'wiki',
    title: 'Wiki',
    description: 'Create a knowledge base where information related to the course.',
    icon: <BookMarked className="h-10 w-10 text-white" />,
    color: 'from-cyan-500 to-blue-600'
  }
];

// Theme/color options
const themeColors = [
  { name: 'Blue', value: 'from-blue-500 to-indigo-600' },
  { name: 'Purple', value: 'from-purple-500 to-pink-600' },
  { name: 'Green', value: 'from-green-500 to-teal-600' },
  { name: 'Orange', value: 'from-amber-500 to-orange-600' },
  { name: 'Red', value: 'from-rose-500 to-red-600' },
  { name: 'Cyan', value: 'from-cyan-500 to-blue-600' },
  { name: 'Pink', value: 'from-pink-500 to-purple-600' },
  { name: 'Gray', value: 'from-gray-500 to-gray-700' },
  { name: 'Rainbow', value: 'from-purple-500 via-pink-500 to-red-500' }
];

// Category options
const categories = [
  'Prototyping',
  'UI/UX',
  'Design',
  'Development',
  'Audit',
  'Compliance',
  'Security',
  'Risk Management',
  'Finance',
  'Reporting'
];

const ContentCreator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    isPrivate: false,
    allowComments: true,
    themeColor: '',
    assignTo: [] as string[],
    aiGenerated: false,
    aiPrompt: '',
    savedTemplate: false,
    deadline: '',
    estimatedDuration: '1h 30m',
    difficultyLevel: 'Intermediate',
    targetAudience: 'All Employees'
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [animateCard, setAnimateCard] = useState(false);
  
  // Get current content type
  const currentType = contentTypes.find(type => type.id === selectedType);
  
  // Handler for selecting a content type
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setAnimateCard(true);
    
    // After a short delay, transition to the details tab
    setTimeout(() => {
      setActiveTab('details');
      setAnimateCard(false);
    }, 400);
    
    // Set default theme color based on selected content type
    const selectedContentType = contentTypes.find(t => t.id === type);
    if (selectedContentType) {
      setContentData({
        ...contentData,
        themeColor: selectedContentType.color
      });
    }
  };
  
  // Handler for category toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Handler for adding a new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
      setSelectedCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };
  
  // Handler for submitting the content
  const handleSubmit = () => {
    // Combine all data and send to API
    const finalData = {
      ...contentData,
      type: selectedType,
      categories: selectedCategories,
      created: new Date().toISOString()
    };
    
    console.log('Submitting content:', finalData);
    // In a real app, you would save this data to your backend
    
    // Set step 2 as active before navigating
    setActiveTab('content');

    // Navigate based on content type
    if (selectedType === 'course') {
      // For courses, go to the course builder to create content
      navigate('/lms/create/course-builder', { 
        state: { courseData: finalData } 
      });
    } else {
      // For other content types, go back to the LMS page
      navigate('/lms');
    }
  };
  
  // Handler for back button
  const handleBack = () => {
    if (activeTab === 'details') {
      setActiveTab('type');
    } else if (activeTab === 'content') {
      setActiveTab('details');
    } else {
      navigate('/lms');
    }
  };
  
  useEffect(() => {
    setTheme('light');
    const params = new URLSearchParams(location.search);
    // 1. Prioritera state från navigation
    if (location.state?.courseData) {
      setContentData(location.state.courseData);
      localStorage.setItem('lms_content_creator', JSON.stringify({
        ...JSON.parse(localStorage.getItem('lms_content_creator') || '{}'),
        contentData: location.state.courseData
      }));
      setActiveTab('details');
    } else if (params.get('step') === 'details') {
      // 2. Annars, ladda från autosave
      setActiveTab('details');
      const saved = localStorage.getItem('lms_content_creator');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.contentData) setContentData(parsed.contentData);
          if (parsed.selectedType) setSelectedType(parsed.selectedType);
          if (parsed.selectedCategories) setSelectedCategories(parsed.selectedCategories);
        } catch {}
      }
    }
  }, [setTheme, location.search, location.state]);
  
  // Autosave: Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lms_content_creator');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.contentData) setContentData(parsed.contentData);
        if (parsed.selectedType) setSelectedType(parsed.selectedType);
        if (parsed.selectedCategories) setSelectedCategories(parsed.selectedCategories);
      } catch {}
    }
  }, []);

  // Autosave: Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('lms_content_creator', JSON.stringify({
      contentData,
      selectedType,
      selectedCategories
    }));
  }, [contentData, selectedType, selectedCategories]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-gray-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4">
              {activeTab === 'type' ? 'Create new content' : `Create new ${currentType?.title.toLowerCase()}`}
            </h1>
          </div>
          
          {activeTab !== 'type' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full">
                Save as Draft
              </Button>
              <Button onClick={handleSubmit} className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                <Save className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <div className="container max-w-7xl mx-auto p-6">
        {/* Progress indicator at the top */}
        <div className="flex justify-center mb-8 mt-4">
          <div className="flex items-center space-x-4">
            {/* Step 1: Type */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'type' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => setActiveTab('type')}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">1</div>
              <span className="ml-2">Type</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            {/* Step 2: Details */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'details' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => {
                if (selectedType) setActiveTab('details');
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">2</div>
              <span className="ml-2">Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            {/* Step 3: Content */}
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeTab === 'content' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
              onClick={() => {
                if (selectedType && contentData.title && contentData.description) {
                  setActiveTab('content');
                  const finalData = {
                    ...contentData,
                    type: selectedType,
                    categories: selectedCategories,
                    created: new Date().toISOString()
                  };
                  if (selectedType === 'course') {
                    navigate('/lms/create/course-builder', { state: { courseData: finalData } });
                  } else {
                    navigate('/lms');
                  }
                }
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">3</div>
              <span className="ml-2">Content</span>
            </div>
          </div>
        </div>
        
        {/* Content Type Selection */}
        {activeTab === 'type' && (
          <div>
            <h2 className="text-2xl font-bold mb-8 text-center">What would you like to create?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentTypes.map((type) => (
                <Card 
                  key={type.id} 
                  className={`p-0 cursor-pointer overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-lg transition-all ${
                    selectedType === type.id ? 'ring-2 ring-primary' : ''
                  } ${animateCard && selectedType === type.id ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
                  style={{transition: 'all 0.3s ease'}}
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`bg-gradient-to-r ${type.color} p-6 text-white`}>
                      <div className="rounded-full bg-white/20 w-16 h-16 flex items-center justify-center backdrop-blur-sm mb-3">
                        {type.icon}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{type.title}</h3>
                        {type.aiPowered && (
                          <Badge className="bg-white/20 text-white">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Powered
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 bg-white">
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Content Details Form */}
        {activeTab === 'details' && selectedType && (
          <div className="grid grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Preview Card */}
              <Card className={`overflow-hidden rounded-2xl border-0 shadow-md`}>
                <div className={`bg-gradient-to-r ${contentData.themeColor || currentType.color} p-6 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-white/20 text-white mb-3">
                        {currentType.title}
                      </Badge>
                      <h2 className="text-2xl font-bold mb-2">
                        {contentData.title || `New ${currentType.title}`}
                      </h2>
                      <p className="text-white/80 line-clamp-2">
                        {contentData.description || 'Add a description to help learners understand what this content is about.'}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 w-16 h-16 flex items-center justify-center backdrop-blur-sm">
                      {currentType.icon}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-4">
                    {contentData.estimatedDuration && (
                      <div className="flex items-center text-sm">
                        <Timer className="mr-1 h-4 w-4 text-white/70" />
                        <span>{contentData.estimatedDuration}</span>
                      </div>
                    )}
                    {contentData.difficultyLevel && (
                      <div className="flex items-center text-sm">
                        <Layers className="mr-1 h-4 w-4 text-white/70" />
                        <span>{contentData.difficultyLevel}</span>
                      </div>
                    )}
                    {contentData.targetAudience && (
                      <div className="flex items-center text-sm">
                        <Users className="mr-1 h-4 w-4 text-white/70" />
                        <span>{contentData.targetAudience}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <p className="text-sm text-muted-foreground">This is how your content will appear to learners.</p>
                </div>
              </Card>
              
              {/* Basic Info */}
              <Card className="p-6 rounded-2xl border-0 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a title for your content" 
                      className="mt-1 rounded-xl"
                      value={contentData.title}
                      onChange={(e) => setContentData({...contentData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe what learners will gain from this content" 
                      className="mt-1 min-h-[100px] rounded-xl"
                      value={contentData.description}
                      onChange={(e) => setContentData({...contentData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                      <Input
                        id="estimatedDuration"
                        placeholder="e.g. 1h 30m"
                        className="mt-1 rounded-xl"
                        value={contentData.estimatedDuration}
                        onChange={(e) => setContentData({...contentData, estimatedDuration: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                      <Select 
                        value={contentData.difficultyLevel}
                        onValueChange={(value) => setContentData({...contentData, difficultyLevel: value})}
                      >
                        <SelectTrigger id="difficultyLevel" className="mt-1 rounded-xl">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Select 
                        value={contentData.targetAudience}
                        onValueChange={(value) => setContentData({...contentData, targetAudience: value})}
                      >
                        <SelectTrigger id="targetAudience" className="mt-1 rounded-xl">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Employees">All Employees</SelectItem>
                          <SelectItem value="Managers">Managers</SelectItem>
                          <SelectItem value="New Hires">New Hires</SelectItem>
                          <SelectItem value="Executives">Executives</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((category) => (
                        <Badge 
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer rounded-full px-3 py-1"
                          onClick={() => handleCategoryToggle(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex mt-2 items-center">
                      <Input
                        placeholder="Add custom category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="mr-2 rounded-xl"
                      />
                      <Button size="sm" onClick={handleAddCategory} className="rounded-full">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Theme Options */}
              <Card className="p-6 rounded-2xl border-0 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Appearance</h2>
                  <Palette className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Theme Color</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                      {themeColors.map((color) => (
                        <div 
                          key={color.value}
                          className={`h-12 rounded-xl cursor-pointer bg-gradient-to-r ${color.value} relative
                            ${contentData.themeColor === color.value ? 'ring-2 ring-primary' : ''}
                          `}
                          onClick={() => setContentData({...contentData, themeColor: color.value})}
                        >
                          {contentData.themeColor === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white rounded-full p-1">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Cover Image</Label>
                    <div className="mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        SVG, PNG, JPG or GIF (max. 2MB)
                      </p>
                      <Button variant="outline" className="mt-4 rounded-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* AI Content Generation (if applicable) */}
              {currentType?.aiPowered && (
                <Card className="p-6 rounded-2xl border-0 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100 to-transparent -z-10" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">AI Content Generation</h2>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Generate content with AI</h3>
                        <p className="text-sm text-muted-foreground">
                          Let AI help you create content based on your description
                        </p>
                      </div>
                      <Switch
                        checked={contentData.aiGenerated}
                        onCheckedChange={(checked) => setContentData({...contentData, aiGenerated: checked})}
                      />
                    </div>
                    
                    {contentData.aiGenerated && (
                      <div>
                        <Label htmlFor="aiPrompt">AI Prompt</Label>
                        <Textarea
                          id="aiPrompt"
                          placeholder="Describe what content you want to generate, e.g., 'Create a quiz about cybersecurity best practices with 10 multiple choice questions'"
                          className="mt-1 min-h-[120px] rounded-xl"
                          value={contentData.aiPrompt}
                          onChange={(e) => setContentData({...contentData, aiPrompt: e.target.value})}
                        />
                        <Button className="mt-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all">
                          <Bot className="mr-2 h-4 w-4" />
                          Generate Content
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              {/* Content Specific Options */}
              {selectedType === 'quiz' && (
                <Card className="p-6 rounded-2xl border-0 shadow-md">
                  <h2 className="text-lg font-semibold mb-4">Quiz Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Time Limit</h3>
                        <p className="text-sm text-muted-foreground">
                          Set a time limit for completing the quiz
                        </p>
                      </div>
                      <Input 
                        type="number"
                        placeholder="Minutes"
                        className="w-32 rounded-xl"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Passing Score</h3>
                        <p className="text-sm text-muted-foreground">
                          Minimum percentage required to pass
                        </p>
                      </div>
                      <Input 
                        type="number"
                        placeholder="e.g. 70"
                        className="w-32 rounded-xl"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Shuffle Questions</h3>
                        <p className="text-sm text-muted-foreground">
                          Randomize question order for each attempt
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Allow Retakes</h3>
                        <p className="text-sm text-muted-foreground">
                          Let learners take the quiz multiple times
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Sidebar Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="p-6 rounded-2xl border-0 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Content Source</h2>
                
                <div className="space-y-3">
                  <Button className="w-full flex justify-start rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Create from Scratch
                  </Button>
                  
                  <Button className="w-full flex justify-start rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  
                  <Button className="w-full flex justify-start rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border border-purple-200">
                    <Library className="mr-2 h-4 w-4" />
                    From Content Library
                  </Button>
                  
                  <Button className="w-full flex justify-start rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 border border-amber-200">
                    <BookMarked className="mr-2 h-4 w-4" />
                    From Templates
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl border-0 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Visibility Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="private" className="cursor-pointer">Private Content</Label>
                      <p className="text-xs text-muted-foreground">Only visible to assigned users</p>
                    </div>
                    <Switch 
                      id="private" 
                      checked={contentData.isPrivate}
                      onCheckedChange={(checked) => setContentData({...contentData, isPrivate: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="comments" className="cursor-pointer">Allow Comments</Label>
                      <p className="text-xs text-muted-foreground">Let users comment on content</p>
                    </div>
                    <Switch 
                      id="comments" 
                      checked={contentData.allowComments}
                      onCheckedChange={(checked) => setContentData({...contentData, allowComments: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="template" className="cursor-pointer">Save as Template</Label>
                      <p className="text-xs text-muted-foreground">Reuse this content structure later</p>
                    </div>
                    <Switch 
                      id="template" 
                      checked={contentData.savedTemplate}
                      onCheckedChange={(checked) => setContentData({...contentData, savedTemplate: checked})}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl border-0 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Assignments</h2>
                
                <div className="space-y-4">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200">
                    <Users className="mr-2 h-4 w-4" />
                    Assign to Users
                  </Button>
                  
                  <div>
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input 
                      id="deadline" 
                      type="date" 
                      className="mt-1 rounded-xl"
                      value={contentData.deadline}
                      onChange={(e) => setContentData({...contentData, deadline: e.target.value})}
                    />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="col-span-12 flex justify-between items-start mt-6 gap-6">
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-1">
                    <Sparkles className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Need help?</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Our AI assistant can help you create engaging content quickly.
                      Try using the AI generation feature!
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="rounded-full px-8 py-3 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all font-medium"
              >
                {selectedType === 'course' ? 'Continue to Course Builder' : 'Create Content'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCreator; 