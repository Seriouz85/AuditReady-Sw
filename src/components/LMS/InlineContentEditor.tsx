import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  X, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2,
  Link as LinkIcon,
  Video,
  FileQuestion,
  PenTool,
  Upload,
  Globe,
  Check,
  AlertCircle,
  Play,
  ExternalLink
} from 'lucide-react';
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor';
import { UnifiedMediaSidePanel } from './UnifiedMediaSidePanel';
import { toast } from '@/utils/toast';

interface InlineContentEditorProps {
  type: 'text' | 'video' | 'quiz';
  content: string;
  title: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Support both single and multiple correct answers
  explanation?: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'text';
  points: number;
}

interface QuizData {
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showResults: boolean;
}

interface VideoData {
  url: string;
  title: string;
  description: string;
  startTime?: number;
  endTime?: number;
  autoplay: boolean;
  showControls: boolean;
}


export const InlineContentEditor: React.FC<InlineContentEditorProps> = ({
  type,
  content,
  title,
  onSave,
  onCancel,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [moduleTitle, setModuleTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  
  // State for different content types
  const [textContent, setTextContent] = useState(content);
  const [quizData, setQuizData] = useState<QuizData>({
    questions: [],
    passingScore: 70,
    shuffleQuestions: false,
    showResults: true
  });
  const [videoData, setVideoData] = useState<VideoData>({
    url: '',
    title: '',
    description: '',
    autoplay: false,
    showControls: true
  });

  useEffect(() => {
    if (content) {
      try {
        const parsed = JSON.parse(content);
        
        switch (type) {
          case 'quiz':
            setQuizData(parsed);
            break;
          case 'video':
            setVideoData(parsed);
            break;
          default:
            setTextContent(content);
        }
      } catch {
        // If not JSON, treat as plain text
        if (type === 'text') {
          setTextContent(content);
        }
      }
    }
  }, [content, type]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let finalContent = '';
      
      switch (type) {
        case 'text':
          finalContent = textContent;
          break;
        case 'quiz':
          finalContent = JSON.stringify(quizData);
          break;
        case 'video':
          finalContent = JSON.stringify(videoData);
          break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      onSave(finalContent);
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaSelect = (file: any) => {
    const fileName = 'originalName' in file ? file.originalName : file.title;
    const fileType = 'mimeType' in file ? file.mimeType : `${file.type}/*`;
    const fileUrl = file.url;
    
    if (type === 'text') {
      // For text content, insert media into the content
      if (fileType.startsWith('image/') || file.type === 'image') {
        setTextContent(prev => prev + `\n\n<img src="${fileUrl}" alt="${fileName}" class="max-w-full h-auto rounded-lg my-2" />`);
      } else if (fileType.startsWith('video/') || file.type === 'video') {
        setTextContent(prev => prev + `\n\n<div class="relative aspect-video my-4"><video src="${fileUrl}" controls class="w-full h-full rounded-lg"></video></div>`);
      } else {
        setTextContent(prev => prev + `\n\n[Media: ${fileName}]`);
      }
    } else if (type === 'video') {
      // For video content, set as the main video
      setVideoData(prev => ({
        ...prev,
        url: fileUrl,
        title: fileName,
        description: file.description || ''
      }));
    }
    
    setShowMediaBrowser(false);
    toast.success(`Added ${fileName} to content`);
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0, // Default to single answer
      type: 'multiple-choice',
      points: 1
    };
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuizQuestion = (id: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const validateVideoUrl = (url: string) => {
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
    return youtubePattern.test(url) || vimeoPattern.test(url) || url.includes('mp4');
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {type.replace('-', ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMediaBrowser(true)}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <Upload className="h-4 w-4 mr-1" />
            Media Library
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div>
        {type === 'text' && (
          <EnhancedRichTextEditor
            initialContent={textContent}
            onSave={setTextContent}
            onCancel={() => {}}
            placeholder="Enter your text content here..."
            height="500px"
            autoSave={false}
            showWordCount={true}
          />
        )}

        {type === 'quiz' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="content">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quiz Questions</h3>
                <Button onClick={addQuizQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {quizData.questions.map((question, index) => (
                  <Card key={question.id} className="p-4 border-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Question {index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuizQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuizQuestion(question.id, { question: e.target.value })}
                        placeholder="Enter your question"
                        className="min-h-[80px]"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Question Type</Label>
                          <Select 
                            value={question.type} 
                            onValueChange={(value: 'multiple-choice' | 'multiple-select' | 'true-false' | 'text') => {
                              // Reset correctAnswer when changing type
                              const correctAnswer = value === 'multiple-select' ? [] : 0;
                              updateQuizQuestion(question.id, { type: value, correctAnswer });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice (Single Answer)</SelectItem>
                              <SelectItem value="multiple-select">Multiple Select (Multiple Answers)</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="text">Text Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Points</Label>
                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuizQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                            min="1"
                          />
                        </div>
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <Label>Answer Options (Select one correct answer)</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuizQuestion(question.id, { correctAnswer: optionIndex })}
                                className="mt-1"
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuizQuestion(question.id, { options: newOptions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'multiple-select' && (
                        <div className="space-y-2">
                          <Label>Answer Options (Select all correct answers)</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optionIndex)}
                                onChange={(e) => {
                                  const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                                  let newAnswers;
                                  if (e.target.checked) {
                                    newAnswers = [...currentAnswers, optionIndex];
                                  } else {
                                    newAnswers = currentAnswers.filter(idx => idx !== optionIndex);
                                  }
                                  updateQuizQuestion(question.id, { correctAnswer: newAnswers });
                                }}
                                className="mt-1"
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuizQuestion(question.id, { options: newOptions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 Tip: Check all correct answers. Students will need to select all correct options to get points.
                          </div>
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={question.correctAnswer === 1}
                                onChange={() => updateQuizQuestion(question.id, { correctAnswer: 1 })}
                              />
                              True
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={question.correctAnswer === 0}
                                onChange={() => updateQuizQuestion(question.id, { correctAnswer: 0 })}
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          value={question.explanation || ''}
                          onChange={(e) => updateQuizQuestion(question.id, { explanation: e.target.value })}
                          placeholder="Explain why this is the correct answer"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {quizData.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No questions added yet.</p>
                    <Button onClick={addQuizQuestion} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Question
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={quizData.timeLimit || ''}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      passingScore: parseInt(e.target.value) || 70 
                    }))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Shuffle Questions</Label>
                  <input
                    type="checkbox"
                    checked={quizData.shuffleQuestions}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      shuffleQuestions: e.target.checked 
                    }))}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Results After Completion</Label>
                  <input
                    type="checkbox"
                    checked={quizData.showResults}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      showResults: e.target.checked 
                    }))}
                    className="rounded"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {type === 'video' && (
          <div className="space-y-4">
            <div>
              <Label>Video URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={videoData.url}
                  onChange={(e) => setVideoData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="flex-1"
                />
                {validateVideoUrl(videoData.url) && (
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {videoData.url && !validateVideoUrl(videoData.url) && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid YouTube or Vimeo URL
                </p>
              )}
            </div>

            <div>
              <Label>Video Title</Label>
              <Input
                value={videoData.title}
                onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={videoData.description}
                onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this video covers"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time (seconds)</Label>
                <Input
                  type="number"
                  value={videoData.startTime || ''}
                  onChange={(e) => setVideoData(prev => ({ 
                    ...prev, 
                    startTime: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>End Time (seconds)</Label>
                <Input
                  type="number"
                  value={videoData.endTime || ''}
                  onChange={(e) => setVideoData(prev => ({ 
                    ...prev, 
                    endTime: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Full video"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoData.autoplay}
                  onChange={(e) => setVideoData(prev => ({ ...prev, autoplay: e.target.checked }))}
                />
                Auto-play video
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoData.showControls}
                  onChange={(e) => setVideoData(prev => ({ ...prev, showControls: e.target.checked }))}
                />
                Show video controls
              </label>
            </div>

            {validateVideoUrl(videoData.url) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Video Preview</span>
                </div>
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <p className="text-gray-500">Video will be embedded here</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Unified Media Side Panel */}
      <UnifiedMediaSidePanel
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={handleMediaSelect}
        filterType={type === 'video' ? 'video' : 'all'}
      />
    </div>
  );
};