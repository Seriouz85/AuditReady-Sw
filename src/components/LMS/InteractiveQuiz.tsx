import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  ChevronRight,
  ChevronLeft,
  Target,
  Brain,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'drag-drop';
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number; // in seconds
}

interface QuizAttempt {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

interface InteractiveQuizProps {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number; // percentage
  allowRetries?: boolean;
  showExplanations?: boolean;
  timeLimit?: number; // total quiz time in minutes
  onComplete?: (score: number, attempts: QuizAttempt[]) => void;
  onProgress?: (currentQuestion: number, totalQuestions: number) => void;
}

const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the primary purpose of implementing GDPR compliance in an organization?',
    options: [
      { id: 'a', text: 'To increase company profits', isCorrect: false },
      { id: 'b', text: 'To protect personal data and privacy rights of EU residents', isCorrect: true },
      { id: 'c', text: 'To reduce operational costs', isCorrect: false },
      { id: 'd', text: 'To improve marketing effectiveness', isCorrect: false }
    ],
    explanation: 'GDPR (General Data Protection Regulation) was specifically designed to protect the personal data and privacy rights of individuals within the European Union. It establishes strict guidelines for how organizations collect, process, and store personal information.',
    difficulty: 'easy',
    points: 10,
    timeLimit: 60
  },
  {
    id: 'q2',
    type: 'multiple-select',
    question: 'Which of the following are key principles of information security? (Select all that apply)',
    options: [
      { id: 'a', text: 'Confidentiality', isCorrect: true },
      { id: 'b', text: 'Integrity', isCorrect: true },
      { id: 'c', text: 'Availability', isCorrect: true },
      { id: 'd', text: 'Profitability', isCorrect: false },
      { id: 'e', text: 'Scalability', isCorrect: false }
    ],
    explanation: 'The CIA Triad (Confidentiality, Integrity, and Availability) forms the foundation of information security. Confidentiality ensures data is only accessible to authorized users, Integrity ensures data accuracy and completeness, and Availability ensures data is accessible when needed.',
    difficulty: 'medium',
    points: 15,
    timeLimit: 90
  },
  {
    id: 'q3',
    type: 'true-false',
    question: 'A data breach notification must be reported to the relevant supervisory authority within 72 hours under GDPR.',
    options: [
      { id: 'true', text: 'True', isCorrect: true },
      { id: 'false', text: 'False', isCorrect: false }
    ],
    explanation: 'Under GDPR Article 33, organizations must notify the relevant supervisory authority of a personal data breach within 72 hours of becoming aware of it, unless the breach is unlikely to result in a risk to the rights and freedoms of individuals.',
    difficulty: 'medium',
    points: 10,
    timeLimit: 45
  }
];

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  title,
  description,
  questions = sampleQuestions,
  passingScore = 70,
  allowRetries = true,
  showExplanations = true,
  timeLimit,
  onComplete,
  onProgress
}) => {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit ? timeLimit * 60 : null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleQuizComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Progress tracking
  useEffect(() => {
    onProgress?.(currentQuestionIndex + 1, totalQuestions);
  }, [currentQuestionIndex, totalQuestions, onProgress]);

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId: string) => {
    if (currentQuestion.type === 'multiple-select') {
      setSelectedAnswers(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedAnswers([optionId]);
    }
  };

  // Check if answer is correct
  const checkAnswer = (): boolean => {
    const correctAnswers = currentQuestion.options
      .filter(option => option.isCorrect)
      .map(option => option.id);
    
    if (currentQuestion.type === 'multiple-select') {
      return correctAnswers.length === selectedAnswers.length &&
             correctAnswers.every(id => selectedAnswers.includes(id));
    } else {
      return selectedAnswers.length === 1 && correctAnswers.includes(selectedAnswers[0]);
    }
  };

  // Submit current question
  const handleSubmitQuestion = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = checkAnswer();
    
    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      selectedAnswers: [...selectedAnswers],
      isCorrect,
      timeSpent,
      attempts: 1 // TODO: Track multiple attempts per question
    };

    setQuizAttempts(prev => [...prev, attempt]);
    setShowResult(true);
    
    if (showExplanations) {
      setShowExplanation(true);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswers([]);
      setShowResult(false);
      setShowExplanation(false);
    }
  };

  // Complete quiz
  const handleQuizComplete = () => {
    const totalPoints = quizAttempts.reduce((sum, attempt) => 
      sum + (attempt.isCorrect ? questions.find(q => q.id === attempt.questionId)?.points || 0 : 0), 0
    );
    const maxPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const score = Math.round((totalPoints / maxPoints) * 100);
    
    setIsQuizCompleted(true);
    onComplete?.(score, quizAttempts);
  };

  // Restart quiz
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizAttempts([]);
    setSelectedAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
    setIsQuizCompleted(false);
    setTimeRemaining(timeLimit ? timeLimit * 60 : null);
  };

  // Calculate final score
  const calculateScore = () => {
    const totalPoints = quizAttempts.reduce((sum, attempt) => 
      sum + (attempt.isCorrect ? questions.find(q => q.id === attempt.questionId)?.points || 0 : 0), 0
    );
    const maxPoints = questions.reduce((sum, q) => sum + q.points, 0);
    return Math.round((totalPoints / maxPoints) * 100);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isQuizCompleted) {
    const score = calculateScore();
    const passed = score >= passingScore;
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <Award className="h-10 w-10 text-green-600" />
            ) : (
              <Target className="h-10 w-10 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl mb-2">
            {passed ? 'Congratulations!' : 'Quiz Completed'}
          </CardTitle>
          <p className="text-gray-600">
            {passed 
              ? 'You have successfully passed the quiz!' 
              : 'You can review your answers and try again.'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <div className="text-gray-600">
              {quizAttempts.filter(a => a.isCorrect).length} of {totalQuestions} correct
            </div>
            <Badge className={passed ? 'bg-green-500' : 'bg-red-500'}>
              {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </Badge>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold">{score}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {Math.floor((Date.now() - quizStartTime) / 1000 / 60)}m
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {quizAttempts.filter(a => a.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {quizAttempts.filter(a => !a.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {!passed && allowRetries && (
              <Button onClick={handleRestartQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={() => window.history.back()}>
              Continue Course
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle className="text-2xl mb-2">{title}</CardTitle>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
          
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 300 ? 'text-red-600 font-semibold' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.points} points
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' ? (
            <RadioGroup value={selectedAnswers[0] || ''} onValueChange={(value) => handleAnswerSelect(value)}>
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id}
                    checked={selectedAnswers.includes(option.id)}
                    onCheckedChange={() => handleAnswerSelect(option.id)}
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={cn(
            "p-4 rounded-lg border",
            checkAnswer() 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {checkAnswer() ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {checkAnswer() ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            
            {showExplanation && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Explanation</span>
                </div>
                <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!showResult ? (
              <Button 
                onClick={handleSubmitQuestion}
                disabled={selectedAnswers.length === 0}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'Complete Quiz'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};