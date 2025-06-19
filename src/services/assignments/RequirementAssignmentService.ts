/**
 * Requirement Assignment Service
 * Handles assignment of requirements to team members for SaaS organizations
 */

import { RequirementAssignment, UserActivity, Requirement, InternalUser } from '@/types';

export class RequirementAssignmentService {
  private static instance: RequirementAssignmentService;
  private assignments: RequirementAssignment[] = [];
  private activities: UserActivity[] = [];

  public static getInstance(): RequirementAssignmentService {
    if (!RequirementAssignmentService.instance) {
      RequirementAssignmentService.instance = new RequirementAssignmentService();
    }
    return RequirementAssignmentService.instance;
  }

  /**
   * Assign requirements to a user
   */
  async assignRequirements(
    requirementIds: string[],
    requirements: Requirement[],
    assignedToUser: InternalUser,
    assignedByUserId: string,
    assignedByUserName: string,
    organizationId: string,
    dueDate?: string
  ): Promise<RequirementAssignment[]> {
    const now = new Date().toISOString();
    const newAssignments: RequirementAssignment[] = [];

    for (const requirementId of requirementIds) {
      const requirement = requirements.find(r => r.id === requirementId);
      if (!requirement) continue;

      // Check if already assigned to this user
      const existingAssignment = this.assignments.find(
        a => a.requirementId === requirementId && 
        a.assignedToUserId === assignedToUser.id &&
        a.organizationId === organizationId
      );

      if (existingAssignment) {
        console.warn(`Requirement ${requirement.code} already assigned to ${assignedToUser.name}`);
        continue;
      }

      const assignment: RequirementAssignment = {
        id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requirementId: requirement.id,
        requirementCode: requirement.code,
        requirementName: requirement.name,
        standardId: requirement.standardId,
        standardName: this.getStandardName(requirement.standardId),
        assignedToUserId: assignedToUser.id,
        assignedToUserName: assignedToUser.name,
        assignedToUserEmail: assignedToUser.email,
        assignedByUserId,
        assignedByUserName,
        organizationId,
        status: 'pending',
        dueDate,
        assignedAt: now
      };

      this.assignments.push(assignment);
      newAssignments.push(assignment);

      // Create activity record
      await this.createActivity({
        userId: assignedToUser.id,
        type: 'requirement_assigned',
        title: `Requirement ${requirement.code} assigned`,
        description: `You have been assigned requirement "${requirement.name}" from ${this.getStandardName(requirement.standardId)}`,
        entityId: requirement.id,
        entityType: 'requirement',
        status: 'pending',
        dueDate,
        createdAt: now,
        updatedAt: now
      });
    }

    // In a real implementation, this would:
    // 1. Save to database (Supabase/PostgreSQL)
    // 2. Send email notifications to assigned users
    // 3. Create calendar events if due dates are set
    // 4. Log the assignments for audit trail

    return newAssignments;
  }

  /**
   * Get assignments for a specific user
   */
  async getUserAssignments(userId: string, organizationId: string): Promise<RequirementAssignment[]> {
    return this.assignments.filter(
      a => a.assignedToUserId === userId && a.organizationId === organizationId
    );
  }

  /**
   * Get all assignments for an organization
   */
  async getOrganizationAssignments(organizationId: string): Promise<RequirementAssignment[]> {
    return this.assignments.filter(a => a.organizationId === organizationId);
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: RequirementAssignment['status'],
    notes?: string,
    evidence?: string
  ): Promise<RequirementAssignment | null> {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    assignment.status = status;
    assignment.notes = notes;
    assignment.evidence = evidence;

    if (status === 'completed') {
      assignment.completedAt = new Date().toISOString();
      
      // Create completion activity
      await this.createActivity({
        userId: assignment.assignedToUserId,
        type: 'requirement_completed',
        title: `Requirement ${assignment.requirementCode} completed`,
        description: `You have completed requirement "${assignment.requirementName}"`,
        entityId: assignment.requirementId,
        entityType: 'requirement',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return assignment;
  }

  /**
   * Get user activities (for Activities page)
   */
  async getUserActivities(userId: string): Promise<UserActivity[]> {
    return this.activities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Create user activity record
   */
  private async createActivity(activity: Omit<UserActivity, 'id'>): Promise<UserActivity> {
    const newActivity: UserActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...activity
    };
    
    this.activities.push(newActivity);
    return newActivity;
  }

  /**
   * Get standard name by ID (would typically come from standards service)
   */
  private getStandardName(standardId: string): string {
    const standardNames: Record<string, string> = {
      'iso-27002-2022': 'ISO 27002:2022',
      'cis-controls-v8': 'CIS Controls v8',
      'nist-csf': 'NIST Cybersecurity Framework',
      'gdpr': 'GDPR',
      'hipaa': 'HIPAA'
    };
    return standardNames[standardId] || 'Unknown Standard';
  }

  /**
   * Send email notification to assigned user
   */
  private async sendAssignmentNotification(assignment: RequirementAssignment): Promise<void> {
    // In a real implementation, this would use EmailService
    console.log(`Email notification sent to ${assignment.assignedToUserEmail} for requirement ${assignment.requirementCode}`);
  }

  /**
   * Invite new user and assign requirements using UserInvitationService
   */
  async inviteUserAndAssign(
    email: string,
    name: string,
    role: string,
    requirementIds: string[],
    requirements: Requirement[],
    assignedByUserId: string,
    assignedByUserName: string,
    organizationId: string,
    dueDate?: string
  ): Promise<{ user?: InternalUser; assignments: RequirementAssignment[]; invitation?: any; error?: string }> {
    try {
      const { userInvitationService } = await import('../invitations/UserInvitationService');
      
      // Check seat availability first using the integrated service
      const seatUsage = await userInvitationService.checkSeatAvailability(organizationId);
      if (seatUsage.available_seats <= 0) {
        throw new Error(`No available seats. Your plan allows ${seatUsage.total_seats_allowed} users. Please upgrade your subscription.`);
      }

      // Create the invitation using the UserInvitationService
      const invitation = await userInvitationService.createInvitation(
        email,
        name,
        role,
        organizationId,
        assignedByUserId,
        assignedByUserName,
        requirementIds,
        `You've been invited to collaborate on ${requirementIds.length} compliance requirement${requirementIds.length !== 1 ? 's' : ''}.`
      );

      // Create temporary user object for assignment (user will be properly created when invitation is accepted)
      const tempUser: InternalUser = {
        id: `temp-${invitation.id}`,
        name,
        email,
        department: role
      };

      // Pre-assign requirements (these will be activated when user accepts invitation)
      const assignments = await this.assignRequirements(
        requirementIds,
        requirements,
        tempUser,
        assignedByUserId,
        assignedByUserName,
        organizationId,
        dueDate
      );

      // Mark assignments as pending invitation acceptance
      assignments.forEach(assignment => {
        assignment.status = 'pending_invitation';
        assignment.notes = 'Assignment pending user invitation acceptance';
      });

      return { 
        user: tempUser, 
        assignments,
        invitation
      };

    } catch (error) {
      console.error('Error inviting user and assigning requirements:', error);
      return {
        assignments: [],
        error: error instanceof Error ? error.message : 'Failed to invite user and assign requirements'
      };
    }
  }

  /**
   * Load requirements for organization (filtered by applicable standards)
   */
  async getOrganizationRequirements(
    organizationId: string,
    standardIds?: string[]
  ): Promise<Requirement[]> {
    // In real implementation, this would:
    // 1. Query organization's subscribed/applicable standards
    // 2. Filter requirements by those standards
    // 3. Consider organization's specific context (industry, size, etc.)
    
    // Mock implementation
    const allRequirements = this.getMockRequirements();
    
    if (standardIds && standardIds.length > 0) {
      return allRequirements.filter(req => standardIds.includes(req.standardId));
    }
    
    return allRequirements;
  }

  /**
   * Mock requirements data (in real implementation, this comes from database)
   */
  private getMockRequirements(): Requirement[] {
    return [
      {
        id: 'req-1',
        standardId: 'iso-27002-2022',
        section: 'A.5',
        code: 'A.5.1',
        name: 'Policies for information security',
        description: 'Information security policies shall be defined and approved by management.',
        status: 'not-fulfilled',
        tags: ['tag-organizational'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'req-2',
        standardId: 'iso-27002-2022',
        section: 'A.6',
        code: 'A.6.1',
        name: 'Screening',
        description: 'Background verification checks on all candidates for employment.',
        status: 'not-fulfilled',
        tags: ['tag-awareness'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'req-3',
        standardId: 'cis-controls-v8',
        section: '1',
        code: '1.1',
        name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
        description: 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets.',
        status: 'fulfilled',
        tags: ['tag-assets'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export const requirementAssignmentService = RequirementAssignmentService.getInstance();