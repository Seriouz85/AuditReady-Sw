import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target
} from 'lucide-react';
import { Quiz, QuizQuestion, UserQuizAttempt } from '@/types/lms';
import { quizService } from '@/services/lms/QuizService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

interface QuizTakerProps {
  quizId: string;
  onComplete?: (result: { score: number; passed: boolean }) => void;
  onBack?: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  timeRemaining: number;
  startTime: number;
  submitted: boolean;
  result: { score: number; passed: boolean; attemptId: string } | null;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quizId, onComplete, onBack }) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canRetake, setCanRetake] = useState(true);
  const [bestAttempt, setBestAttempt] = useState<UserQuizAttempt | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    startTime: Date.now(),
    submitted: false,
    result: null
  });

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    // Timer for time-limited quizzes
    if (quiz?.timeLimit && quizState.timeRemaining > 0 && !quizState.submitted) {
      const timer = setInterval(() => {
        setQuizState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            submitQuiz();
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz?.timeLimit, quizState.timeRemaining, quizState.submitted]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      const [quizData, retakeEligible, bestAttemptData] = await Promise.all([
        quizService.getQuiz(quizId),
        user ? quizService.canRetakeQuiz(user.id, quizId) : true,
        user ? quizService.getBestAttempt(user.id, quizId) : null
      ]);

      if (quizData) {
        setQuiz(quizData);
        
        // Shuffle questions if required
        const questionsToShow = quizData.shuffleQuestions 
          ? quizService.shuffleQuestions(quizData.questions)
          : quizData.questions;
          
        // Shuffle options for multiple choice questions
        const processedQuestions = questionsToShow.map(q => 
          q.type === 'multiple-choice' ? quizService.shuffleOptions(q) : q
        );
        
        setQuestions(processedQuestions);
        setCanRetake(retakeEligible);
        setBestAttempt(bestAttemptData);
        
        // Initialize timer
        if (quizData.timeLimit) {
          setQuizState(prev => ({
            ...prev,
            timeRemaining: quizData.timeLimit! * 60 // Convert minutes to seconds
          }));
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const previousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const submitQuiz = async () => {
    if (!user || !quiz) return;

    try {
      setSubmitting(true);
      
      const timeSpent = Math.round((Date.now() - quizState.startTime) / 60000); // Convert to minutes
      
      const result = await quizService.submitQuizAttempt({
        userId: user.id,
        quizId,
        answers: quizState.answers,
        timeSpent
      });

      if (result) {
        setQuizState(prev => ({
          ...prev,
          submitted: true,
          result
        }));
        
        if (onComplete) {
          onComplete(result);
        }
        
        toast.success('Quiz submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const retakeQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: quiz?.timeLimit ? quiz.timeLimit * 60 : 0,
      startTime: Date.now(),
      submitted: false,
      result: null
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = quizState.answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true-false':
        return (
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`} className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`} className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="min-h-[100px]"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Quiz Not Found</h3>
        <p className="text-muted-foreground">The requested quiz could not be loaded.</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>
    );
  }

  // Show result screen after submission
  if (quizState.submitted && quizState.result) {
    const { score, passed } = quizState.result;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Quiz Complete'}
          </CardTitle>
          <p className="text-muted-foreground">
            You scored {score}% on this quiz
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">{quiz.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
            </div>
            
            <Badge 
              variant={passed ? "default" : "destructive"} 
              className="mb-4"
            >
              {passed ? (
                <><CheckCircle className="h-4 w-4 mr-1" /> Passed</>
              ) : (
                <><XCircle className="h-4 w-4 mr-1" /> Not Passed</>
              )}
            </Badge>
            
            {bestAttempt && bestAttempt.score > score && (
              <p className="text-sm text-muted-foreground mb-4">
                Your best score: {bestAttempt.score}%
              </p>
            )}
          </div>
          
          <div className="flex justify-center space-x-3">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            )}
            
            {!passed && canRetake && quiz.allowRetakes && (
              <Button onClick={retakeQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quiz taking interface
  const currentQuestion = questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(quizState.answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Question {quizState.currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right space-y-2">
              {quiz.timeLimit && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className={quizState.timeRemaining < 300 ? 'text-red-600 font-semibold' : ''}>
                    {formatTime(quizState.timeRemaining)}
                  </span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {answeredQuestions} of {questions.length} answered
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
            </CardTitle>
            {currentQuestion.points && (
              <Badge variant="outline">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {renderQuestion(currentQuestion)}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={previousQuestion}
          disabled={quizState.currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {answeredQuestions} of {questions.length} questions answered
        </div>
        
        {quizState.currentQuestionIndex === questions.length - 1 ? (
          <Button 
            onClick={submitQuiz}
            disabled={submitting || answeredQuestions === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = Object.keys(quizState.answers).includes(questions[index].id);
              const isCurrent = index === quizState.currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setQuizState(prev => ({ ...prev, currentQuestionIndex: index }))}
                  className={`w-8 h-8 rounded text-xs font-medium ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : isAnswered 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};