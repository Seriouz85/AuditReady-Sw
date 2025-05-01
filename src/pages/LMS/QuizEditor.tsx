import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash, 
  Image as ImageIcon, 
  FileText, 
  Copy, 
  Eye 
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
import { useNavigate, useLocation } from 'react-router-dom';

interface Question {
  id: number;
  title: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  choices?: string[];
  correctAnswer?: string | string[];
  points: number;
  timeLimit?: number;
}

const QuizEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: 'What does UI stand for in the context of design?',
      type: 'multiple_choice',
      choices: ['User Interface', 'User Integration', 'Universal Interaction', 'User Involvement'],
      correctAnswer: 'User Interface',
      points: 1
    },
    {
      id: 2,
      title: 'Which aspect of UI design focuses on the layout and visual hierarchy?',
      type: 'multiple_choice',
      choices: ['Color Theory', 'Typography', 'Spatial Arrangement', 'Iconography'],
      correctAnswer: 'Spatial Arrangement',
      points: 1
    }
  ]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(1);
  const [quizTitle, setQuizTitle] = useState('UI Design Fundamentals & Best Practice');
  const [quizDescription, setQuizDescription] = useState('Test your knowledge of UI design fundamentals and best practices.');
  const [quizSettings, setQuizSettings] = useState({
    timeLimit: 30,
    passingScore: 80,
    shuffleQuestions: true,
    showResults: true,
    allowRetakes: true,
    maxAttempts: 3
  });

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  const location = useLocation();
  const courseBuilderMode = location.pathname.includes('create');
  
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (courseBuilderMode) {
      navigate('/lms/create/course-builder');
    } else {
      navigate('/lms');
    }
  };

  const addNewQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    const newQuestion: Question = {
      id: newId,
      title: 'New Question',
      type: 'multiple_choice',
      choices: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
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

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(questions.length > 1 ? questions[0].id : null);
    }
  };

  const duplicateQuestion = (id: number) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (!questionToDuplicate) return;
    
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    const duplicatedQuestion = { ...questionToDuplicate, id: newId };
    setQuestions([...questions, duplicatedQuestion]);
    setSelectedQuestionId(newId);
  };

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
                <Badge variant="secondary">Design</Badge>
                <Badge variant="outline">Not Urgent</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Quiz
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
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{question.title}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateQuestion(question.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteQuestion(question.id)}>
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">{question.type.replace('_', ' ')}</Badge>
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
                          value={selectedQuestion.title} 
                          onChange={(e) => updateQuestion({ title: e.target.value })}
                          placeholder="Enter your question"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Question Type</label>
                          <Select 
                            value={selectedQuestion.type} 
                            onValueChange={(value: any) => updateQuestion({ type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
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

                    {selectedQuestion.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Answer Choices</label>
                        {selectedQuestion.choices?.map((choice, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <RadioGroup defaultValue={selectedQuestion.correctAnswer as string} onValueChange={(value) => updateQuestion({ correctAnswer: value })}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={choice} id={`option-${index}`} />
                              </div>
                            </RadioGroup>
                            <Input 
                              value={choice} 
                              onChange={(e) => {
                                const newChoices = [...(selectedQuestion.choices || [])];
                                newChoices[index] = e.target.value;
                                updateQuestion({ choices: newChoices });
                              }}
                              className="flex-1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => {
                              const newChoices = (selectedQuestion.choices || []).filter((_, i) => i !== index);
                              updateQuestion({ choices: newChoices });
                            }}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="gap-2" onClick={() => {
                          const newChoices = [...(selectedQuestion.choices || []), 'New option'];
                          updateQuestion({ choices: newChoices });
                        }}>
                          <Plus className="h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                    )}

                    {selectedQuestion.type === 'true_false' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Correct Answer</label>
                        <RadioGroup defaultValue={selectedQuestion.correctAnswer as string} onValueChange={(value) => updateQuestion({ correctAnswer: value })}>
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