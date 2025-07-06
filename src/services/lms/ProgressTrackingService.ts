import { supabase } from '@/lib/supabase';
import { UserLearningProgress } from '@/types/lms';
import { toast } from '@/utils/toast';

export class ProgressTrackingService {
  // Update user progress for a specific content item
  async updateProgress(data: {
    userId: string;
    learningPathId: string;
    contentId?: string;
    progressPercentage: number;
    timeSpentMinutes?: number;
    completed?: boolean;
  }): Promise<boolean> {
    try {
      const { userId, learningPathId, contentId, progressPercentage, timeSpentMinutes = 0, completed = false } = data;

      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .eq('content_id', contentId || learningPathId)
        .single();

      const progressData = {
        user_id: userId,
        learning_path_id: learningPathId,
        content_id: contentId || null,
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
        time_spent_minutes: timeSpentMinutes,
        last_accessed_at: new Date().toISOString(),
        completed_at: completed || progressPercentage >= 100 ? new Date().toISOString() : null
      };

      if (existing) {
        // Update existing progress
        const { error } = await supabase
          .from('user_learning_progress')
          .update({
            ...progressData,
            time_spent_minutes: existing.time_spent_minutes + timeSpentMinutes
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_learning_progress')
          .insert(progressData);

        if (error) throw error;
      }

      // Update overall course progress if this is content-level progress
      if (contentId && contentId !== learningPathId) {
        await this.updateCourseProgress(userId, learningPathId);
      }

      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  // Calculate and update overall course progress
  private async updateCourseProgress(userId: string, learningPathId: string): Promise<void> {
    try {
      // Get all content progress for this course
      const { data: contentProgress } = await supabase
        .from('user_learning_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .not('content_id', 'is', null);

      if (contentProgress && contentProgress.length > 0) {
        // Calculate average progress
        const totalProgress = contentProgress.reduce((sum, p) => sum + p.progress_percentage, 0);
        const averageProgress = Math.round(totalProgress / contentProgress.length);

        // Update or create course-level progress
        await this.updateProgress({
          userId,
          learningPathId,
          progressPercentage: averageProgress,
          completed: averageProgress >= 100
        });
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  }

  // Get user's progress for a specific course
  async getCourseProgress(userId: string, learningPathId: string): Promise<UserLearningProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            estimated_duration
          )
        `)
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .is('content_id', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      return data || null;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  }

  // Get all user progress across all courses
  async getUserAllProgress(userId: string): Promise<UserLearningProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            estimated_duration,
            category,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .is('content_id', null) // Only course-level progress
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  // Mark content as completed
  async markCompleted(userId: string, learningPathId: string, contentId?: string): Promise<boolean> {
    return this.updateProgress({
      userId,
      learningPathId,
      contentId,
      progressPercentage: 100,
      completed: true
    });
  }

  // Track time spent on content
  async trackTimeSpent(userId: string, learningPathId: string, contentId: string, minutes: number): Promise<boolean> {
    try {
      // Get current progress
      const { data: current } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .eq('content_id', contentId)
        .single();

      const currentProgress = current?.progress_percentage || 0;
      
      return this.updateProgress({
        userId,
        learningPathId,
        contentId,
        progressPercentage: currentProgress,
        timeSpentMinutes: minutes
      });
    } catch (error) {
      console.error('Error tracking time spent:', error);
      return false;
    }
  }

  // Get detailed content progress for a course
  async getContentProgress(userId: string, learningPathId: string): Promise<UserLearningProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select(`
          *,
          learning_content (
            id,
            title,
            content_type,
            sequence
          )
        `)
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .not('content_id', 'is', null)
        .order('learning_content(sequence)');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content progress:', error);
      return [];
    }
  }

  // Get learning analytics for a user
  async getUserAnalytics(userId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalTimeSpent: number;
    averageProgress: number;
    completionRate: number;
    streak: number;
  }> {
    try {
      const progress = await this.getUserAllProgress(userId);
      
      const completedCourses = progress.filter(p => p.completed_at).length;
      const inProgressCourses = progress.filter(p => !p.completed_at && p.progress_percentage > 0).length;
      const totalTimeSpent = progress.reduce((sum, p) => sum + p.time_spent_minutes, 0);
      const averageProgress = progress.length > 0 
        ? progress.reduce((sum, p) => sum + p.progress_percentage, 0) / progress.length 
        : 0;

      // Calculate streak (consecutive days with activity)
      const streak = await this.calculateStreak(userId);

      return {
        totalCourses: progress.length,
        completedCourses,
        inProgressCourses,
        totalTimeSpent,
        averageProgress: Math.round(averageProgress),
        completionRate: progress.length > 0 ? (completedCourses / progress.length) * 100 : 0,
        streak
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalTimeSpent: 0,
        averageProgress: 0,
        completionRate: 0,
        streak: 0
      };
    }
  }

  // Calculate learning streak
  private async calculateStreak(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('last_accessed_at')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });

      if (error || !data) return 0;

      // Group by date and calculate consecutive days
      const dates = data
        .map(p => new Date(p.last_accessed_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Reset user progress for a course (admin function)
  async resetCourseProgress(userId: string, learningPathId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_learning_progress')
        .delete()
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId);

      if (error) throw error;
      
      toast.success('Progress reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
      return false;
    }
  }

  // Get course completion statistics (for admins)
  async getCourseStats(learningPathId: string): Promise<{
    totalEnrolled: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    averageProgress: number;
    averageTimeSpent: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('learning_path_id', learningPathId)
        .is('content_id', null);

      if (error) throw error;

      const stats = data || [];
      const completed = stats.filter(s => s.completed_at).length;
      const inProgress = stats.filter(s => !s.completed_at && s.progress_percentage > 0).length;
      const notStarted = stats.filter(s => s.progress_percentage === 0).length;
      
      const averageProgress = stats.length > 0 
        ? stats.reduce((sum, s) => sum + s.progress_percentage, 0) / stats.length 
        : 0;
      
      const averageTimeSpent = stats.length > 0 
        ? stats.reduce((sum, s) => sum + s.time_spent_minutes, 0) / stats.length 
        : 0;

      return {
        totalEnrolled: stats.length,
        completed,
        inProgress,
        notStarted,
        averageProgress: Math.round(averageProgress),
        averageTimeSpent: Math.round(averageTimeSpent)
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return {
        totalEnrolled: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        averageProgress: 0,
        averageTimeSpent: 0
      };
    }
  }
}

// Export singleton instance
export const progressTrackingService = new ProgressTrackingService();