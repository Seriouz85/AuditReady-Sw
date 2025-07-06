import { supabase } from '@/lib/supabase';
import { 
  LearningPath, 
  LearningContent, 
  UserLearningProgress,
  TrainingAssignment,
  CourseModule,
  Quiz,
  QuizQuestion,
  UserQuizAttempt
} from '@/types/lms';
import { toast } from '@/utils/toast';

export class LearningService {
  // Learning Paths (Courses)
  async getOrganizationCourses(organizationId: string): Promise<LearningPath[]> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_content (*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      return [];
    }
  }

  async getCourseById(courseId: string): Promise<LearningPath | null> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_content (
            *,
            order by sequence
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  async createCourse(course: Partial<LearningPath>): Promise<LearningPath | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('learning_paths')
        .insert({
          ...course,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Course created successfully');
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
      return null;
    }
  }

  async updateCourse(courseId: string, updates: Partial<LearningPath>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('learning_paths')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);

      if (error) throw error;
      toast.success('Course updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
      return false;
    }
  }

  // Learning Content (Modules/Lessons)
  async createContent(content: Partial<LearningContent>): Promise<LearningContent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('learning_content')
        .insert({
          ...content,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
      return null;
    }
  }

  async updateContent(contentId: string, updates: Partial<LearningContent>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_content')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      return false;
    }
  }

  async deleteContent(contentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      toast.success('Content deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      return false;
    }
  }

  // User Progress Tracking
  async getUserProgress(userId: string, pathId?: string): Promise<UserLearningProgress[]> {
    try {
      let query = supabase
        .from('user_learning_progress')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            total_duration
          ),
          learning_content (
            id,
            title,
            content_type
          )
        `)
        .eq('user_id', userId);

      if (pathId) {
        query = query.eq('learning_path_id', pathId);
      }

      const { data, error } = await query.order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  async updateProgress(progressData: {
    userId: string;
    pathId: string;
    contentId: string;
    progress: number;
    timeSpent?: number;
  }): Promise<boolean> {
    try {
      const { userId, pathId, contentId, progress, timeSpent } = progressData;

      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', pathId)
        .eq('content_id', contentId)
        .single();

      if (existing) {
        // Update existing progress
        const { error } = await supabase
          .from('user_learning_progress')
          .update({
            progress_percentage: progress,
            time_spent_minutes: existing.time_spent_minutes + (timeSpent || 0),
            last_accessed_at: new Date().toISOString(),
            completed_at: progress === 100 ? new Date().toISOString() : null
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_learning_progress')
          .insert({
            user_id: userId,
            learning_path_id: pathId,
            content_id: contentId,
            progress_percentage: progress,
            time_spent_minutes: timeSpent || 0,
            completed_at: progress === 100 ? new Date().toISOString() : null
          });

        if (error) throw error;
      }

      // Update overall path progress
      await this.updatePathProgress(userId, pathId);
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  private async updatePathProgress(userId: string, pathId: string): Promise<void> {
    try {
      // Get all content progress for this path
      const { data: progressData } = await supabase
        .from('user_learning_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('learning_path_id', pathId);

      if (progressData && progressData.length > 0) {
        const totalProgress = progressData.reduce((sum, p) => sum + p.progress_percentage, 0);
        const averageProgress = totalProgress / progressData.length;

        // Update or create path progress record
        await supabase
          .from('user_learning_progress')
          .upsert({
            user_id: userId,
            learning_path_id: pathId,
            content_id: null, // null indicates path-level progress
            progress_percentage: Math.round(averageProgress),
            last_accessed_at: new Date().toISOString(),
            completed_at: averageProgress === 100 ? new Date().toISOString() : null
          });
      }
    } catch (error) {
      console.error('Error updating path progress:', error);
    }
  }

  // Training Assignments
  async getAssignments(userId: string, status?: 'pending' | 'completed' | 'overdue'): Promise<TrainingAssignment[]> {
    try {
      let query = supabase
        .from('training_assignments')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            estimated_duration
          )
        `)
        .eq('assigned_to', userId);

      if (status) {
        const now = new Date().toISOString();
        if (status === 'overdue') {
          query = query.lt('due_date', now).is('completed_at', null);
        } else if (status === 'completed') {
          query = query.not('completed_at', 'is', null);
        } else if (status === 'pending') {
          query = query.is('completed_at', null).gte('due_date', now);
        }
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async createAssignment(assignment: Partial<TrainingAssignment>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('training_assignments')
        .insert({
          ...assignment,
          assigned_by: user.id
        });

      if (error) throw error;
      toast.success('Training assigned successfully');
      return true;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to assign training');
      return false;
    }
  }

  // Quizzes
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('learning_path_id', courseId)
        .eq('content_type', 'quiz')
        .order('sequence');

      if (error) throw error;
      
      // Parse quiz data from content
      return (data || []).map(content => ({
        id: content.id,
        title: content.title,
        questions: content.content?.questions || [],
        passingScore: content.content?.passingScore || 70,
        timeLimit: content.content?.timeLimit
      }));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  }

  async submitQuizAttempt(attempt: {
    userId: string;
    quizId: string;
    answers: Record<string, any>;
    score: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: attempt.userId,
          quiz_id: attempt.quizId,
          answers: attempt.answers,
          score: attempt.score,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      return false;
    }
  }

  // Analytics
  async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const { data: progressData } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('learning_path_id', courseId);

      const { data: assignmentData } = await supabase
        .from('training_assignments')
        .select('*')
        .eq('learning_path_id', courseId);

      // Calculate analytics
      const totalUsers = new Set(progressData?.map(p => p.user_id)).size;
      const completedUsers = progressData?.filter(p => p.completed_at).length || 0;
      const averageProgress = progressData?.reduce((sum, p) => sum + p.progress_percentage, 0) / (progressData?.length || 1);
      const averageTimeSpent = progressData?.reduce((sum, p) => sum + p.time_spent_minutes, 0) / (progressData?.length || 1);

      return {
        totalEnrolled: totalUsers,
        completedCount: completedUsers,
        completionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
        averageProgress: Math.round(averageProgress),
        averageTimeSpent: Math.round(averageTimeSpent),
        assignmentsCount: assignmentData?.length || 0
      };
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return null;
    }
  }

  // Media Library
  async uploadCourseMedia(file: File, courseId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('course-media')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media file');
      return null;
    }
  }

  async deleteMedia(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('course-media')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }
}

// Export singleton instance
export const learningService = new LearningService();