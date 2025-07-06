import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash, 
  Image as ImageIcon, 
  FileText, 
  Copy, 
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { quizService } from '@/services/lms/QuizService';
import { useAuth } from '@/contexts/AuthContext';
import { QuizQuestion } from '@/types/lms';
import { toast } from '@/utils/toast';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text' | 'matching';
  options?: string[];
  correctAnswer?: string | number | boolean;
  points: number;
  timeLimit?: number;
}

const QuizEditor: React.FC = () => {
  const { setTheme } = useTheme();
  const { user, isDemo } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId?: string }>();
  const [searchParams] = useSearchParams();
  const learningPathId = searchParams.get('courseId');
  
  useEffect(() => { setTheme('light'); }, [setTheme]);

  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    timeLimit: 30,
    passingScore: 80,
    shuffleQuestions: true,
    showResults: true,
    allowRetakes: true,
    maxAttempts: 3
  });

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    } else {
      // New quiz - set defaults
      setQuizTitle('New Quiz');
      setQuizDescription('Test your knowledge.');
      addNewQuestion();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      
      if (isDemo) {
        // Load demo quiz data
        setQuizTitle('Demo Quiz: UI Design Fundamentals');
        setQuizDescription('Test your knowledge of UI design fundamentals and best practices.');
        const demoQuestions: Question[] = [
          {
            id: 'demo-q1',
            question: 'What does UI stand for in the context of design?',
            type: 'multiple-choice',
            options: ['User Interface', 'User Integration', 'Universal Interaction', 'User Involvement'],
            correctAnswer: 0,
            points: 1
          },
          {
            id: 'demo-q2',
            question: 'Which aspect of UI design focuses on the layout and visual hierarchy?',
            type: 'multiple-choice',
            options: ['Color Theory', 'Typography', 'Spatial Arrangement', 'Iconography'],
            correctAnswer: 2,
            points: 1
          }
        ];
        setQuestions(demoQuestions);
        setSelectedQuestionId(demoQuestions[0].id);
        return;
      }
      
      const quiz = await quizService.getQuiz(quizId);
      
      if (quiz) {
        setQuizTitle(quiz.title);
        setQuestions(quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          timeLimit: q.timeLimit
        })));
        setQuizSettings({
          timeLimit: quiz.timeLimit || 30,
          passingScore: quiz.passingScore || 70,
          shuffleQuestions: quiz.shuffleQuestions || false,
          showResults: true,
          allowRetakes: quiz.allowRetakes || false,
          maxAttempts: 3
        });
        
        if (quiz.questions.length > 0) {
          setSelectedQuestionId(quiz.questions[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (isDemo) {
      toast.success('Quiz saved (demo mode)');
      return;
    }
    
    if (!learningPathId && !quizId) {
      toast.error('Course ID is required to save quiz');
      return;
    }
    
    if (!quizTitle.trim() || questions.length === 0) {
      toast.error('Quiz title and at least one question are required');
      return;
    }
    
    try {
      setSaving(true);
      
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          timeLimit: q.timeLimit
        } as QuizQuestion)),
        passingScore: quizSettings.passingScore,
        timeLimit: quizSettings.timeLimit > 0 ? quizSettings.timeLimit : undefined,
        allowRetakes: quizSettings.allowRetakes,
        shuffleQuestions: quizSettings.shuffleQuestions
      };
      
      if (quizId) {
        // Update existing quiz
        const success = await quizService.updateQuiz(quizId, quizData);
        if (success) {
          toast.success('Quiz updated successfully');
        }
      } else {
        // Create new quiz
        const newQuizId = await quizService.createQuiz({
          learningPathId: learningPathId!,
          ...quizData
        });
        
        if (newQuizId) {
          // Navigate to the created quiz
          navigate(`/lms/quiz-editor/${newQuizId}?courseId=${learningPathId}`);
        }
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  const location = useLocation();
  const courseBuilderMode = location.pathname.includes('create');
  
  const handleBack = () => {
    if (courseBuilderMode) {
      navigate('/lms/create/course-builder');
    } else if (learningPathId) {
      navigate(`/lms/course/${learningPathId}`);
    } else {
      navigate('/lms');
    }
  };

  const addNewQuestion = () => {
    const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion: Question = {
      id: newId,
      question: 'New Question',
      type: 'multiple-choice',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
      points: 1
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newId);
  };

  const updateQuestion = (updatedQuestion: Partial<Question>) => {
    if (!selectedQuestionId) return;
    
    setQuestions(questions.map(q => 
      q.id === selectedQuestionId ? { ...q, ...updatedQuestion } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    const filteredQuestions = questions.filter(q => q.id !== id);
    setQuestions(filteredQuestions);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(filteredQuestions.length > 0 ? filteredQuestions[0].id : null);
    }
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (!questionToDuplicate) return;
    
    const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedQuestion = { ...questionToDuplicate, id: newId };
    setQuestions([...questions, duplicatedQuestion]);
    setSelectedQuestionId(newId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="gap-1 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
              {courseBuilderMode ? 'Back to Course Builder' : 'Back to LMS'}
            </Button>
            <div>
              <Input 
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="text-xl font-semibold border-none focus-visible:ring-0 p-0 h-auto"
              />
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">Quiz</Badge>
                <Badge variant="outline">{questions.length} Question{questions.length !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" disabled>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              className="gap-2" 
              onClick={saveQuiz}
              disabled={saving || !quizTitle.trim() || questions.length === 0}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : (quizId ? 'Update Quiz' : 'Save Quiz')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Question List Sidebar */}
              <div className="col-span-3 space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={addNewQuestion}>
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
                
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto p-1">
                  {questions.map((question, index) => (
                    <Card 
                      key={question.id}
                      className={`p-3 cursor-pointer ${selectedQuestionId === question.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-medium">Question {index + 1}</span>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{question.question}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                            e.stopPropagation();
                            duplicateQuestion(question.id);
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(question.id);
                          }}>
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">{question.type.replace('-', ' ')}</Badge>
                        <span className="text-xs">{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Question Editor */}
              <div className="col-span-9">
                {selectedQuestion ? (
                  <Card className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Question</label>
                        <Textarea 
                          value={selectedQuestion.question} 
                          onChange={(e) => updateQuestion({ question: e.target.value })}
                          placeholder="Enter your question"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Question Type</label>
                          <Select 
                            value={selectedQuestion.type} 
                            onValueChange={(value: 'multiple-choice' | 'true-false' | 'text' | 'matching') => {
                              const updates: Partial<Question> = { type: value };
                              
                              // Set default values based on type
                              if (value === 'multiple-choice') {
                                updates.options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                                updates.correctAnswer = 0;
                              } else if (value === 'true-false') {
                                updates.options = undefined;
                                updates.correctAnswer = true;
                              } else if (value === 'text') {
                                updates.options = undefined;
                                updates.correctAnswer = '';
                              }
                              
                              updateQuestion(updates);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="text">Text Answer</SelectItem>
                              <SelectItem value="matching">Matching</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Points</label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={selectedQuestion.points} 
                            onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Time Limit (seconds)</label>
                          <Input 
                            type="number" 
                            min="0" 
                            value={selectedQuestion.timeLimit || ''} 
                            onChange={(e) => updateQuestion({ timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>

                    {selectedQuestion.type === 'multiple-choice' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Answer Choices</label>
                        <RadioGroup 
                          value={selectedQuestion.correctAnswer?.toString()} 
                          onValueChange={(value) => updateQuestion({ correctAnswer: parseInt(value) })}
                        >
                          {selectedQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              </div>
                              <Input 
                                value={option} 
                                onChange={(e) => {
                                  const newOptions = [...(selectedQuestion.options || [])];
                                  newOptions[index] = e.target.value;
                                  updateQuestion({ options: newOptions });
                                }}
                                className="flex-1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => {
                                const newOptions = (selectedQuestion.options || []).filter((_, i) => i !== index);
                                updateQuestion({ options: newOptions });
                                // Update correct answer if it was the deleted option
                                if (selectedQuestion.correctAnswer === index) {
                                  updateQuestion({ correctAnswer: 0 });
                                } else if ((selectedQuestion.correctAnswer as number) > index) {
                                  updateQuestion({ correctAnswer: (selectedQuestion.correctAnswer as number) - 1 });
                                }
                              }}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </RadioGroup>
                        <Button variant="outline" className="gap-2" onClick={() => {
                          const newOptions = [...(selectedQuestion.options || []), 'New option'];
                          updateQuestion({ options: newOptions });
                        }}>
                          <Plus className="h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                    )}

                    {selectedQuestion.type === 'true-false' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Correct Answer</label>
                        <RadioGroup 
                          value={selectedQuestion.correctAnswer?.toString()} 
                          onValueChange={(value) => updateQuestion({ correctAnswer: value === 'true' })}
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="true" />
                              <Label htmlFor="true">True</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="false" />
                              <Label htmlFor="false">False</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {selectedQuestion.type === 'text' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Expected Answer</label>
                        <Input 
                          value={selectedQuestion.correctAnswer as string || ''} 
                          onChange={(e) => updateQuestion({ correctAnswer: e.target.value })}
                          placeholder="Enter the expected answer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Text answers will be compared case-insensitively
                        </p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No question selected</h3>
                    <p className="text-muted-foreground mt-2">Select a question from the sidebar or create a new one.</p>
                    <Button className="mt-6 gap-2" onClick={addNewQuestion}>
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Quiz Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Time Limit (minutes)</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={quizSettings.timeLimit} 
                      onChange={(e) => setQuizSettings({...quizSettings, timeLimit: parseInt(e.target.value) || 30})}
                    />
                    <p className="text-xs text-muted-foreground">Set to 0 for no time limit</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Passing Score (%)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={quizSettings.passingScore} 
                      onChange={(e) => setQuizSettings({...quizSettings, passingScore: parseInt(e.target.value) || 80})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Shuffle Questions</h3>
                      <p className="text-sm text-muted-foreground">Randomize the order of questions for each attempt</p>
                    </div>
                    <Switch 
                      checked={quizSettings.shuffleQuestions} 
                      onCheckedChange={(checked) => setQuizSettings({...quizSettings, shuffleQuestions: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Results</h3>
                      <p className="text-sm text-muted-foreground">Display detailed results after quiz completion</p>
                    </div>
                    <Switch 
                      checked={quizSettings.showResults} 
                      onCheckedChange={(checked) => setQuizSettings({...quizSettings, showResults: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Allow Retakes</h3>
                      <p className="text-sm text-muted-foreground">Let learners attempt the quiz multiple times</p>
                    </div>
                    <Switch 
                      checked={quizSettings.allowRetakes} 
                      onCheckedChange={(checked) => setQuizSettings({...quizSettings, allowRetakes: checked})}
                    />
                  </div>
                </div>

                {quizSettings.allowRetakes && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Maximum Attempts</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={quizSettings.maxAttempts} 
                      onChange={(e) => setQuizSettings({...quizSettings, maxAttempts: parseInt(e.target.value) || 3})}
                    />
                    <p className="text-xs text-muted-foreground">Set to 0 for unlimited attempts</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Quiz Appearance</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Quiz Description</label>
                  <Textarea 
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Enter a description of your quiz"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Quiz Cover Image</label>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload a cover image</p>
                      <p className="text-xs text-muted-foreground mt-1">Recommended size: 1280 x 720px</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuizEditor;