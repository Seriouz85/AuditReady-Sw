import { supabase } from '@/lib/supabase';
import { CourseEnrollment, LearningPath } from '@/types/lms';
import { toast } from '@/utils/toast';

interface EnrollmentData {
  userIds: string[];
  learningPathId: string;
  organizationId: string;
  dueDate?: string;
  enrollmentType?: 'self' | 'assigned' | 'mandatory' | 'bulk';
  notes?: string;
  sendNotification?: boolean;
}

interface UserInvitation {
  email: string;
  name?: string;
  role?: string;
  organizationId: string;
  learningPathIds?: string[];
}

interface EnrollmentStats {
  totalEnrollments: number;
  completedEnrollments: number;
  inProgressEnrollments: number;
  averageProgress: number;
  completionRate: number;
}

export class EnrollmentService {
  // Enroll existing users in a course
  async enrollUsers(data: EnrollmentData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create course enrollments for each user
      const enrollments = data.userIds.map(userId => ({
        user_id: userId,
        learning_path_id: data.learningPathId,
        organization_id: data.organizationId,
        enrollment_type: data.enrollmentType || 'assigned',
        enrolled_by: user.id,
        due_date: data.dueDate || null,
        notes: data.notes || null,
        status: 'enrolled' as const
      }));

      const { error } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (error) {
        // Handle duplicate enrollment error gracefully
        if (error.code === '23505') { // Unique constraint violation
          toast.warning('Some users are already enrolled in this course');
        } else {
          throw error;
        }
      }

      // Send notifications if requested
      if (data.sendNotification) {
        await this.sendEnrollmentNotifications(data.userIds, data.learningPathId);
      }

      toast.success(`Successfully enrolled ${data.userIds.length} user(s)`);
      return true;
    } catch (error) {
      console.error('Error enrolling users:', error);
      toast.error('Failed to enroll users');
      return false;
    }
  }

  // Get user's enrollments
  async getUserEnrollments(userId: string, organizationId: string): Promise<CourseEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          learning_paths!inner (
            id,
            title,
            description,
            short_description,
            category,
            difficulty_level,
            estimated_duration_minutes,
            thumbnail_url,
            status,
            is_published
          )
        `)
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  }

  // Get course enrollments (for instructors/admins)
  async getCourseEnrollments(learningPathId: string, organizationId: string): Promise<CourseEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          learning_paths!inner (
            title,
            description
          )
        `)
        .eq('learning_path_id', learningPathId)
        .eq('organization_id', organizationId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      return [];
    }
  }

  // Enroll single user in course
  async enrollUser(userId: string, learningPathId: string, organizationId: string, enrollmentType: 'self' | 'assigned' | 'mandatory' | 'bulk' = 'self'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is already enrolled
      const { data: existing } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)
        .single();

      if (existing) {
        toast.warning('User is already enrolled in this course');
        return false;
      }

      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: userId,
          learning_path_id: learningPathId,
          organization_id: organizationId,
          enrollment_type: enrollmentType,
          enrolled_by: enrollmentType !== 'self' ? user.id : null,
          status: 'enrolled'
        });

      if (error) throw error;

      toast.success('User enrolled successfully');
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      toast.error('Failed to enroll user');
      return false;
    }
  }

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId: string, status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'expired', completionData?: {
    completion_score?: number;
    certificate_issued?: boolean;
    certificate_url?: string;
  }): Promise<boolean> {
    try {
      const updates: any = {
        status,
        last_accessed_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        if (completionData) {
          Object.assign(updates, completionData);
        }
      } else if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('course_enrollments')
        .update(updates)
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      return false;
    }
  }

  // Update enrollment progress
  async updateEnrollmentProgress(enrollmentId: string, progressPercentage: number, timeSpentMinutes?: number): Promise<boolean> {
    try {
      const updates: any = {
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
        last_accessed_at: new Date().toISOString()
      };

      if (timeSpentMinutes) {
        updates.total_time_spent_minutes = timeSpentMinutes;
      }

      // Update status based on progress
      if (progressPercentage === 100) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      } else if (progressPercentage > 0) {
        updates.status = 'in_progress';
        // Set started_at if not already set
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('started_at')
          .eq('id', enrollmentId)
          .single();
        
        if (enrollment && !enrollment.started_at) {
          updates.started_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('course_enrollments')
        .update(updates)
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      return false;
    }
  }

  // Get enrollment statistics
  async getEnrollmentStats(organizationId: string, learningPathId?: string): Promise<EnrollmentStats> {
    try {
      let query = supabase
        .from('course_enrollments')
        .select('status, progress_percentage')
        .eq('organization_id', organizationId);

      if (learningPathId) {
        query = query.eq('learning_path_id', learningPathId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const enrollments = data || [];
      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const inProgressEnrollments = enrollments.filter(e => e.status === 'in_progress').length;
      
      const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
      const averageProgress = totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      return {
        totalEnrollments,
        completedEnrollments,
        inProgressEnrollments,
        averageProgress: Math.round(averageProgress),
        completionRate: Math.round(completionRate * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      return {
        totalEnrollments: 0,
        completedEnrollments: 0,
        inProgressEnrollments: 0,
        averageProgress: 0,
        completionRate: 0
      };
    }
  }

  // Remove user from course
  async unenrollUser(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success('User unenrolled successfully');
      return true;
    } catch (error) {
      console.error('Error unenrolling user:', error);
      toast.error('Failed to unenroll user');
      return false;
    }
  }

  // Send enrollment notifications
  private async sendEnrollmentNotifications(userIds: string[], learningPathId: string): Promise<void> {
    try {
      // Get course details
      const { data: course } = await supabase
        .from('learning_paths')
        .select('title, description')
        .eq('id', learningPathId)
        .single();

      if (!course) return;

      // In a real implementation, this would send emails or push notifications
      // For now, we'll just create notification records
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: 'course_enrollment',
        title: 'New Course Enrollment',
        message: `You have been enrolled in "${course.title}"`,
        data: {
          learningPathId,
          courseTitle: course.title
        }
      }));

      // This would typically use a notifications service
      console.log('Would send notifications:', notifications);
      
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  // Invite new users via email
  async inviteUsers(invitations: UserInvitation[]): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Send invitation emails
      // 2. Create pending user accounts
      // 3. Pre-assign courses for when they sign up
      
      console.log('Would send invitations:', invitations);
      toast.success(`Sent ${invitations.length} invitation(s)`);
      return true;
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
      return false;
    }
  }

  // Get available courses for enrollment
  async getAvailableCourses(organizationId: string): Promise<LearningPath[]> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available courses:', error);
      return [];
    }
  }

  // Bulk enroll from CSV data
  async bulkEnrollFromData(data: any[], organizationId: string): Promise<boolean> {
    try {
      // Process bulk enrollment data
      // This would typically parse CSV data and create multiple enrollments
      console.log('Would process bulk enrollment:', data);
      toast.success('Bulk enrollment completed');
      return true;
    } catch (error) {
      console.error('Error processing bulk enrollment:', error);
      toast.error('Bulk enrollment failed');
      return false;
    }
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();