import { supabase } from '@/lib/supabase';
import { TrainingAssignment } from '@/types/lms';
import { toast } from '@/utils/toast';

interface EnrollmentData {
  userIds: string[];
  learningPathId: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
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

export class EnrollmentService {
  // Enroll existing users in a course
  async enrollUsers(data: EnrollmentData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create training assignments for each user
      const assignments = data.userIds.map(userId => ({
        learning_path_id: data.learningPathId,
        assigned_to: userId,
        assigned_by: user.id,
        organization_id: user.user_metadata?.organization_id,
        due_date: data.dueDate || null,
        priority: data.priority,
        notes: data.notes || null
      }));

      const { error } = await supabase
        .from('training_assignments')
        .insert(assignments);

      if (error) throw error;

      // Send notifications if requested
      if (data.sendNotification) {
        await this.sendEnrollmentNotifications(data.userIds, data.learningPathId);
      }

      toast.success(`Successfully enrolled ${data.userIds.length} users`);
      return true;
    } catch (error) {
      console.error('Error enrolling users:', error);
      toast.error('Failed to enroll users');
      return false;
    }
  }

  // Get all users in an organization for enrollment
  async getOrganizationUsers(organizationId: string, excludeEnrolled?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('organization_users')
        .select(`
          user_id,
          users (
            id,
            email,
            name,
            role
          )
        `)
        .eq('organization_id', organizationId);

      const { data, error } = await query;
      if (error) throw error;

      let users = (data || []).map(item => ({
        id: item.user_id,
        email: item.users?.email,
        name: item.users?.name,
        role: item.users?.role
      }));

      // Exclude already enrolled users if specified
      if (excludeEnrolled) {
        const { data: enrolled } = await supabase
          .from('training_assignments')
          .select('assigned_to')
          .eq('learning_path_id', excludeEnrolled);

        const enrolledIds = new Set(enrolled?.map(e => e.assigned_to) || []);
        users = users.filter(user => !enrolledIds.has(user.id));
      }

      return users;
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }
  }

  // Get enrolled users for a course
  async getEnrolledUsers(learningPathId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('training_assignments')
        .select(`
          *,
          users (
            id,
            email,
            name,
            role
          ),
          user_learning_progress (
            progress_percentage,
            completed_at,
            last_accessed_at
          )
        `)
        .eq('learning_path_id', learningPathId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(assignment => ({
        ...assignment,
        user: assignment.users,
        progress: assignment.user_learning_progress?.[0] || null
      }));
    } catch (error) {
      console.error('Error fetching enrolled users:', error);
      return [];
    }
  }

  // Invite new users via email
  async inviteUsers(invitations: UserInvitation[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create user invitations
      const invitationRecords = invitations.map(invitation => ({
        email: invitation.email,
        name: invitation.name,
        role: invitation.role || 'learner',
        organization_id: invitation.organizationId,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }));

      const { data: createdInvitations, error } = await supabase
        .from('user_invitations')
        .insert(invitationRecords)
        .select();

      if (error) throw error;

      // If learning paths are specified, create pending assignments
      if (invitations[0]?.learningPathIds?.length) {
        await this.createPendingAssignments(createdInvitations, invitations);
      }

      // Send invitation emails
      await this.sendInvitationEmails(invitations);

      toast.success(`Sent ${invitations.length} invitations`);
      return true;
    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error('Failed to send invitations');
      return false;
    }
  }

  // Create pending assignments for invited users
  private async createPendingAssignments(invitations: any[], invitationData: UserInvitation[]): Promise<void> {
    try {
      const assignments: any[] = [];

      invitations.forEach((invitation, index) => {
        const learningPathIds = invitationData[index]?.learningPathIds || [];
        
        learningPathIds.forEach(learningPathId => {
          assignments.push({
            learning_path_id: learningPathId,
            assigned_to: null, // Will be updated when user accepts invitation
            assigned_by: invitation.invited_by,
            organization_id: invitation.organization_id,
            invitation_id: invitation.id,
            status: 'pending',
            due_date: null,
            priority: 'medium'
          });
        });
      });

      if (assignments.length > 0) {
        await supabase
          .from('training_assignments')
          .insert(assignments);
      }
    } catch (error) {
      console.error('Error creating pending assignments:', error);
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

      // Get user emails
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds);

      if (course && users) {
        // Send notifications (this would integrate with your email service)
        console.log('Sending enrollment notifications:', {
          course: course.title,
          users: users.map(u => u.email)
        });
        
        // TODO: Integrate with actual email service
        // await emailService.sendEnrollmentNotifications(users, course);
      }
    } catch (error) {
      console.error('Error sending enrollment notifications:', error);
    }
  }

  // Send invitation emails
  private async sendInvitationEmails(invitations: UserInvitation[]): Promise<void> {
    try {
      // TODO: Integrate with actual email service
      console.log('Sending invitation emails:', invitations.map(i => i.email));
      
      // await emailService.sendInvitations(invitations);
    } catch (error) {
      console.error('Error sending invitation emails:', error);
    }
  }

  // Remove user from course
  async unenrollUser(userId: string, learningPathId: string): Promise<boolean> {
    try {
      // Delete assignment
      const { error: assignmentError } = await supabase
        .from('training_assignments')
        .delete()
        .eq('assigned_to', userId)
        .eq('learning_path_id', learningPathId);

      if (assignmentError) throw assignmentError;

      // Optionally delete progress (ask user first)
      // const { error: progressError } = await supabase
      //   .from('user_learning_progress')
      //   .delete()
      //   .eq('user_id', userId)
      //   .eq('learning_path_id', learningPathId);

      toast.success('User unenrolled successfully');
      return true;
    } catch (error) {
      console.error('Error unenrolling user:', error);
      toast.error('Failed to unenroll user');
      return false;
    }
  }

  // Bulk enrollment from CSV/Excel data
  async bulkEnrollFromData(data: Array<{
    email: string;
    name?: string;
    role?: string;
    courseIds: string[];
  }>, organizationId: string): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      for (const row of data) {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', row.email)
            .single();

          if (existingUser) {
            // Enroll existing user
            await this.enrollUsers({
              userIds: [existingUser.id],
              learningPathId: row.courseIds[0], // For simplicity, enroll in first course
              priority: 'medium'
            });
          } else {
            // Invite new user
            await this.inviteUsers([{
              email: row.email,
              name: row.name,
              role: row.role,
              organizationId,
              learningPathIds: row.courseIds
            }]);
          }
          
          successful++;
        } catch (error) {
          failed++;
          errors.push(`${row.email}: ${error}`);
        }
      }

      if (successful > 0) {
        toast.success(`Successfully processed ${successful} enrollments`);
      }
      
      if (failed > 0) {
        toast.error(`${failed} enrollments failed`);
      }

      return { successful, failed, errors };
    } catch (error) {
      console.error('Error in bulk enrollment:', error);
      return { successful, failed: data.length, errors: ['Bulk enrollment failed'] };
    }
  }

  // Get enrollment statistics for admin dashboard
  async getEnrollmentStats(organizationId: string): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    completionRate: number;
    activeUsers: number;
    pendingInvitations: number;
  }> {
    try {
      // Get total users in organization
      const { count: totalUsers } = await supabase
        .from('organization_users')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Get total courses
      const { count: totalCourses } = await supabase
        .from('learning_paths')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Get total enrollments
      const { count: totalEnrollments } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Get completed assignments
      const { count: completed } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .not('completed_at', 'is', null);

      // Get active users (accessed learning in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('user_learning_progress')
        .select('user_id', { count: 'exact' })
        .gte('last_accessed_at', thirtyDaysAgo);

      // Get pending invitations
      const { count: pendingInvitations } = await supabase
        .from('user_invitations')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'pending');

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        completionRate: totalEnrollments ? ((completed || 0) / totalEnrollments) * 100 : 0,
        activeUsers: activeUsers || 0,
        pendingInvitations: pendingInvitations || 0
      };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      return {
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        completionRate: 0,
        activeUsers: 0,
        pendingInvitations: 0
      };
    }
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();