import { supabase } from '@/lib/supabase';
import { Quiz, QuizQuestion, UserQuizAttempt } from '@/types/lms';
import { toast } from '@/utils/toast';

export class QuizService {
  // Create a new quiz
  async createQuiz(data: {
    learningPathId: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
    allowRetakes: boolean;
    shuffleQuestions: boolean;
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create learning content record for the quiz
      const { data: content, error } = await supabase
        .from('learning_content')
        .insert({
          learning_path_id: data.learningPathId,
          title: data.title,
          description: data.description,
          content_type: 'quiz',
          content: {
            questions: data.questions,
            passingScore: data.passingScore,
            timeLimit: data.timeLimit,
            allowRetakes: data.allowRetakes,
            shuffleQuestions: data.shuffleQuestions
          },
          sequence: 999, // Will be updated by course builder
          is_mandatory: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Quiz created successfully');
      return content.id as string;
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
      return null;
    }
  }

  // Update existing quiz
  async updateQuiz(quizId: string, data: {
    title?: string;
    description?: string;
    questions?: QuizQuestion[];
    passingScore?: number;
    timeLimit?: number;
    allowRetakes?: boolean;
    shuffleQuestions?: boolean;
  }): Promise<boolean> {
    try {
      // Get current quiz content
      const { data: currentQuiz, error: fetchError } = await supabase
        .from('learning_content')
        .select('content')
        .eq('id', quizId)
        .single();

      if (fetchError) throw fetchError;

      // Merge with new data
      const currentContent = (currentQuiz as any)?.content || {};
      const updatedContent = {
        ...currentContent,
        ...data
      };

      const { error } = await supabase
        .from('learning_content')
        .update({
          title: data.title,
          description: data.description,
          content: updatedContent
        })
        .eq('id', quizId);

      if (error) throw error;

      toast.success('Quiz updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
      return false;
    }
  }

  // Get quiz by ID
  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('id', quizId)
        .eq('content_type', 'quiz')
        .single();

      if (error) throw error;

      const quizData = data as any;
      return {
        id: quizData.id,
        learning_content_id: quizData.id,
        organization_id: quizData.organization_id || '',
        title: quizData.title,
        description: quizData.description,
        passing_score: quizData.content?.passingScore || 70,
        time_limit_minutes: quizData.content?.timeLimit,
        shuffle_questions: quizData.content?.shuffleQuestions || false,
        shuffle_answers: false,
        show_correct_answers: true,
        show_explanations: true,
        allow_review: true,
        available_from: new Date().toISOString(),
        total_questions: quizData.content?.questions?.length || 0,
        total_points: quizData.content?.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0,
        difficulty_level: 'intermediate',
        estimated_duration_minutes: quizData.content?.timeLimit || 30,
        status: 'active' as const,
        created_by: quizData.created_by || '',
        created_at: quizData.created_at || new Date().toISOString(),
        updated_at: quizData.updated_at || new Date().toISOString(),
        questions: quizData.content?.questions || []
      };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  }

  // Get all quizzes for a course
  async getCourseQuizzes(learningPathId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('learning_path_id', learningPathId)
        .eq('content_type', 'quiz')
        .order('sequence');

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        learning_content_id: item.id,
        organization_id: item.organization_id || '',
        title: item.title,
        description: item.description,
        passing_score: item.content?.passingScore || 70,
        time_limit_minutes: item.content?.timeLimit,
        shuffle_questions: item.content?.shuffleQuestions || false,
        shuffle_answers: false,
        show_correct_answers: true,
        show_explanations: true,
        allow_review: true,
        available_from: new Date().toISOString(),
        total_questions: item.content?.questions?.length || 0,
        total_points: item.content?.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0,
        difficulty_level: 'intermediate',
        estimated_duration_minutes: item.content?.timeLimit || 30,
        status: 'active' as const,
        created_by: item.created_by || '',
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        questions: item.content?.questions || []
      }));
    } catch (error) {
      console.error('Error fetching course quizzes:', error);
      return [];
    }
  }

  // Submit quiz attempt
  async submitQuizAttempt(data: {
    userId: string;
    quizId: string;
    answers: Record<string, any>;
    timeSpent: number;
  }): Promise<{ score: number; passed: boolean; attemptId: string } | null> {
    try {
      // Get quiz to calculate score
      const quiz = await this.getQuiz(data.quizId);
      if (!quiz) throw new Error('Quiz not found');

      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = quiz.questions.length;

      quiz.questions.forEach(question => {
        const userAnswer = data.answers[question.id];
        if (this.isAnswerCorrect(question, userAnswer)) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= quiz.passing_score;

      // Save attempt to database
      const { data: attempt, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: data.userId,
          quiz_id: data.quizId,
          organization_id: 'demo-org', // TODO: Get from context
          enrollment_id: null, // TODO: Get from enrollment
          attempt_number: 1, // TODO: Calculate proper attempt number
          status: 'completed',
          answers: data.answers,
          score,
          time_spent_minutes: Math.round(data.timeSpent),
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update learning progress if passed
      if (passed) {
        await this.updateLearningProgress(data.userId, data.quizId);
      }

      return {
        score,
        passed,
        attemptId: attempt.id as string
      };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      toast.error('Failed to submit quiz attempt');
      return null;
    }
  }

  // Check if answer is correct
  private isAnswerCorrect(question: QuizQuestion, userAnswer: any): boolean {
    switch (question.question_type) {
      case 'multiple_choice':
        return userAnswer === question.correct_answers;
      case 'true_false':
        return userAnswer === question.correct_answers;
      case 'short_answer':
      case 'long_answer':
        // Simple text comparison (case-insensitive)
        const correctText = String(question.correct_answers || '').toLowerCase().trim();
        const userText = String(userAnswer || '').toLowerCase().trim();
        return correctText === userText;
      default:
        return false;
    }
  }

  // Update learning progress after quiz completion
  private async updateLearningProgress(userId: string, quizId: string): Promise<void> {
    try {
      // Get quiz content to find learning path
      const { data: quizContent } = await supabase
        .from('learning_content')
        .select('learning_path_id')
        .eq('id', quizId)
        .single();

      if (quizContent) {
        // Import progress service dynamically to avoid circular dependency
        const { progressTrackingService } = await import('./ProgressTrackingService');
        
        await progressTrackingService.updateProgress({
          userId,
          learningPathId: (quizContent as any).learning_path_id,
          contentId: quizId,
          progressPercentage: 100,
          completed: true
        });
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  }

  // Get user's quiz attempts
  async getUserQuizAttempts(userId: string, quizId?: string): Promise<UserQuizAttempt[]> {
    try {
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId);

      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      return (data as UserQuizAttempt[]) || [];
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
  }

  // Get best attempt for a quiz
  async getBestAttempt(userId: string, quizId: string): Promise<UserQuizAttempt | null> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as UserQuizAttempt) || null;
    } catch (error) {
      console.error('Error fetching best attempt:', error);
      return null;
    }
  }

  // Get user's average quiz score across all attempts
  async getUserAverageScore(userId: string): Promise<number> {
    try {
      // Get all quiz attempts for the user
      const attempts = await this.getUserQuizAttempts(userId);
      
      if (attempts.length === 0) {
        return 0;
      }

      // Calculate average of best scores per quiz
      const quizScores = new Map<string, number>();
      
      attempts.forEach(attempt => {
        const currentBest = quizScores.get(attempt.quiz_id) || 0;
        if (attempt.score > currentBest) {
          quizScores.set(attempt.quiz_id, attempt.score);
        }
      });

      const scores = Array.from(quizScores.values());
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      return Math.round(averageScore);
    } catch (error) {
      console.error('Error calculating user average score:', error);
      return 0;
    }
  }

  // Check if user can retake quiz
  async canRetakeQuiz(userId: string, quizId: string): Promise<boolean> {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) return false;

      if (!quiz.max_attempts || quiz.max_attempts <= 1) {
        // Check if user has any attempts
        const attempts = await this.getUserQuizAttempts(userId, quizId);
        return attempts.length === 0;
      }

      return true;
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
      return false;
    }
  }

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<boolean> {
    try {
      // Check if quiz has any attempts
      const { data: attempts } = await supabase
        .from('user_quiz_attempts')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (attempts && attempts.length > 0) {
        toast.error('Cannot delete quiz with existing attempts');
        return false;
      }

      const { error } = await supabase
        .from('learning_content')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast.success('Quiz deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
      return false;
    }
  }

  // Get quiz analytics for instructors
  async getQuizAnalytics(quizId: string): Promise<{
    totalAttempts: number;
    uniqueUsers: number;
    averageScore: number;
    passRate: number;
    averageTime: number;
    questionAnalytics: Array<{
      questionId: string;
      correctRate: number;
      totalAnswers: number;
    }>;
  }> {
    try {
      const { data: attempts, error } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) throw error;

      const totalAttempts = attempts?.length || 0;
      const uniqueUsers = new Set(attempts?.map(a => a.user_id)).size;
      const passedAttempts = attempts?.filter(a => a.passed).length || 0;
      
      const averageScore = totalAttempts > 0 
        ? attempts!.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
        : 0;
        
      const averageTime = totalAttempts > 0 
        ? attempts!.reduce((sum, a) => sum + a.time_taken_minutes, 0) / totalAttempts 
        : 0;

      // Calculate question analytics
      const quiz = await this.getQuiz(quizId);
      const questionAnalytics = quiz?.questions.map(question => {
        const correctAnswers = attempts?.filter(attempt => 
          this.isAnswerCorrect(question, attempt.answers[question.id])
        ).length || 0;

        return {
          questionId: question.id,
          correctRate: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0,
          totalAnswers: totalAttempts
        };
      }) || [];

      return {
        totalAttempts,
        uniqueUsers,
        averageScore: Math.round(averageScore),
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageTime: Math.round(averageTime),
        questionAnalytics
      };
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      return {
        totalAttempts: 0,
        uniqueUsers: 0,
        averageScore: 0,
        passRate: 0,
        averageTime: 0,
        questionAnalytics: []
      };
    }
  }

  // Shuffle questions for display
  shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Shuffle options for multiple choice questions
  shuffleOptions(question: QuizQuestion): QuizQuestion {
    if (question.type !== 'multiple-choice' || !question.options) {
      return question;
    }

    const correctAnswer = question.correctAnswer;
    const correctText = question.options[correctAnswer as number];
    
    const shuffledOptions = [...question.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    // Update correct answer index
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    return {
      ...question,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex
    };
  }
}

// Export singleton instance
export const quizService = new QuizService();