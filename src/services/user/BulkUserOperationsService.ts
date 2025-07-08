import { supabase } from '@/lib/supabase';

export interface BulkUserOperation {
  id: string;
  operation_type: 'invite' | 'role_change' | 'department_assign' | 'team_assign' | 'deactivate' | 'activate' | 'delete';
  target_users: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  created_by: string;
  organization_id: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  total_users: number;
  successful_users: number;
  failed_users: number;
  error_details?: Array<{
    user_id: string;
    error: string;
  }>;
}

export interface BulkInviteParams {
  emails: string[];
  role_id: string;
  department_id?: string;
  team_ids?: string[];
  send_welcome_email?: boolean;
  custom_message?: string;
}

export interface BulkRoleChangeParams {
  user_ids: string[];
  new_role_id: string;
  effective_date?: string;
  notify_users?: boolean;
}

export interface BulkDepartmentAssignParams {
  user_ids: string[];
  department_id: string;
  transfer_date?: string;
  retain_teams?: boolean;
  notify_users?: boolean;
}

export interface BulkTeamAssignParams {
  user_ids: string[];
  team_ids: string[];
  role_in_team?: 'member' | 'lead' | 'contributor';
  notify_users?: boolean;
}

export interface BulkStatusChangeParams {
  user_ids: string[];
  new_status: 'active' | 'inactive' | 'on_leave';
  reason?: string;
  effective_date?: string;
  notify_users?: boolean;
}

export interface UserImportData {
  email: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  department?: string;
  role?: string;
  phone?: string;
  start_date?: string;
}

export interface ImportValidationResult {
  valid_users: UserImportData[];
  invalid_users: Array<{
    row: number;
    data: Partial<UserImportData>;
    errors: string[];
  }>;
  duplicates: Array<{
    email: string;
    existing_user_id: string;
  }>;
  summary: {
    total_rows: number;
    valid_count: number;
    invalid_count: number;
    duplicate_count: number;
  };
}

class BulkUserOperationsService {
  private static instance: BulkUserOperationsService;
  private operationListeners: Map<string, ((operation: BulkUserOperation) => void)[]> = new Map();

  public static getInstance(): BulkUserOperationsService {
    if (!BulkUserOperationsService.instance) {
      BulkUserOperationsService.instance = new BulkUserOperationsService();
    }
    return BulkUserOperationsService.instance;
  }

  // Bulk invite users
  async bulkInviteUsers(
    organizationId: string,
    params: BulkInviteParams,
    createdBy: string
  ): Promise<{ success: boolean; operation_id?: string; error?: string }> {
    try {
      const operationId = `bulk-invite-${Date.now()}`;
      
      const operation: BulkUserOperation = {
        id: operationId,
        operation_type: 'invite',
        target_users: [], // Will be populated as users are created
        parameters: params,
        status: 'pending',
        created_by: createdBy,
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        progress: 0,
        total_users: params.emails.length,
        successful_users: 0,
        failed_users: 0
      };

      // In production, insert operation record
      // await supabase.from('bulk_operations').insert(operation);

      // Start processing asynchronously
      this.processBulkInvites(operation);

      return { success: true, operation_id: operationId };
    } catch (error) {
      console.error('Error starting bulk invite operation:', error);
      return { success: false, error: 'Failed to start bulk invite operation' };
    }
  }

  private async processBulkInvites(operation: BulkUserOperation): Promise<void> {
    try {
      const params = operation.parameters as BulkInviteParams;
      
      // Update operation status
      operation.status = 'in_progress';
      operation.started_at = new Date().toISOString();
      this.notifyOperationUpdate(operation.id, operation);

      const results = [];
      const errors = [];

      for (let i = 0; i < params.emails.length; i++) {
        const email = params.emails[i];
        
        try {
          // Validate email format
          if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
          }

          // Check if user already exists
          const existingUser = await this.checkUserExists(email, operation.organization_id);
          if (existingUser) {
            throw new Error('User already exists in organization');
          }

          // Create user invitation
          const inviteResult = await this.createUserInvitation({
            email,
            organizationId: operation.organization_id,
            roleId: params.role_id,
            departmentId: params.department_id,
            teamIds: params.team_ids,
            invitedBy: operation.created_by,
            customMessage: params.custom_message
          });

          if (inviteResult.success) {
            results.push(inviteResult.user_id);
            operation.successful_users++;
          } else {
            throw new Error(inviteResult.error || 'Failed to create invitation');
          }

          if (params.send_welcome_email) {
            await this.sendWelcomeEmail(email, params.custom_message);
          }

        } catch (error) {
          console.error(`Error inviting user ${email}:`, error);
          errors.push({
            user_id: email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.failed_users++;
        }

        // Update progress
        operation.progress = Math.floor(((i + 1) / params.emails.length) * 100);
        this.notifyOperationUpdate(operation.id, operation);

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete operation
      operation.status = operation.failed_users > 0 ? 'partial' : 'completed';
      operation.completed_at = new Date().toISOString();
      operation.target_users = results;
      operation.error_details = errors;

      this.notifyOperationUpdate(operation.id, operation);

    } catch (error) {
      console.error('Error processing bulk invites:', error);
      operation.status = 'failed';
      operation.completed_at = new Date().toISOString();
      this.notifyOperationUpdate(operation.id, operation);
    }
  }

  // Bulk role changes
  async bulkChangeRoles(
    organizationId: string,
    params: BulkRoleChangeParams,
    createdBy: string
  ): Promise<{ success: boolean; operation_id?: string; error?: string }> {
    try {
      const operationId = `bulk-roles-${Date.now()}`;
      
      const operation: BulkUserOperation = {
        id: operationId,
        operation_type: 'role_change',
        target_users: params.user_ids,
        parameters: params,
        status: 'pending',
        created_by: createdBy,
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        progress: 0,
        total_users: params.user_ids.length,
        successful_users: 0,
        failed_users: 0
      };

      // Start processing asynchronously
      this.processBulkRoleChanges(operation);

      return { success: true, operation_id: operationId };
    } catch (error) {
      console.error('Error starting bulk role change operation:', error);
      return { success: false, error: 'Failed to start bulk role change operation' };
    }
  }

  private async processBulkRoleChanges(operation: BulkUserOperation): Promise<void> {
    try {
      const params = operation.parameters as BulkRoleChangeParams;
      
      operation.status = 'in_progress';
      operation.started_at = new Date().toISOString();
      this.notifyOperationUpdate(operation.id, operation);

      const errors = [];

      for (let i = 0; i < params.user_ids.length; i++) {
        const userId = params.user_ids[i];
        
        try {
          // In production, update user role
          // await supabase.from('organization_users')
          //   .update({
          //     role_id: params.new_role_id,
          //     updated_at: new Date().toISOString()
          //   })
          //   .eq('user_id', userId)
          //   .eq('organization_id', operation.organization_id);

          operation.successful_users++;

          if (params.notify_users) {
            await this.sendRoleChangeNotification(userId, params.new_role_id);
          }

        } catch (error) {
          console.error(`Error changing role for user ${userId}:`, error);
          errors.push({
            user_id: userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.failed_users++;
        }

        operation.progress = Math.floor(((i + 1) / params.user_ids.length) * 100);
        this.notifyOperationUpdate(operation.id, operation);
      }

      operation.status = operation.failed_users > 0 ? 'partial' : 'completed';
      operation.completed_at = new Date().toISOString();
      operation.error_details = errors;

      this.notifyOperationUpdate(operation.id, operation);

    } catch (error) {
      console.error('Error processing bulk role changes:', error);
      operation.status = 'failed';
      operation.completed_at = new Date().toISOString();
      this.notifyOperationUpdate(operation.id, operation);
    }
  }

  // CSV Import functionality
  async validateUserImport(csvData: string): Promise<ImportValidationResult> {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['email'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const validUsers: UserImportData[] = [];
      const invalidUsers: Array<{ row: number; data: Partial<UserImportData>; errors: string[] }> = [];
      const duplicates: Array<{ email: string; existing_user_id: string }> = [];
      const seenEmails = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const userData: Partial<UserImportData> = {};
        const errors: string[] = [];

        // Map CSV columns to user data
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'email':
              userData.email = value;
              break;
            case 'first_name':
            case 'firstname':
              userData.first_name = value;
              break;
            case 'last_name':
            case 'lastname':
              userData.last_name = value;
              break;
            case 'job_title':
            case 'title':
              userData.job_title = value;
              break;
            case 'department':
              userData.department = value;
              break;
            case 'role':
              userData.role = value;
              break;
            case 'phone':
              userData.phone = value;
              break;
            case 'start_date':
              userData.start_date = value;
              break;
          }
        });

        // Validate email
        if (!userData.email) {
          errors.push('Email is required');
        } else if (!this.isValidEmail(userData.email)) {
          errors.push('Invalid email format');
        } else if (seenEmails.has(userData.email)) {
          errors.push('Duplicate email in import file');
        } else {
          seenEmails.add(userData.email);
        }

        // Validate start date if provided
        if (userData.start_date && !this.isValidDate(userData.start_date)) {
          errors.push('Invalid start date format (use YYYY-MM-DD)');
        }

        if (errors.length > 0) {
          invalidUsers.push({
            row: i + 1,
            data: userData,
            errors
          });
        } else {
          validUsers.push(userData as UserImportData);
        }
      }

      // Check for existing users (in demo, assume no duplicates)
      // In production, query database for existing emails

      return {
        valid_users: validUsers,
        invalid_users: invalidUsers,
        duplicates,
        summary: {
          total_rows: lines.length - 1,
          valid_count: validUsers.length,
          invalid_count: invalidUsers.length,
          duplicate_count: duplicates.length
        }
      };

    } catch (error) {
      console.error('Error validating user import:', error);
      throw error;
    }
  }

  async processUserImport(
    organizationId: string,
    validUsers: UserImportData[],
    defaultRoleId: string,
    createdBy: string
  ): Promise<{ success: boolean; operation_id?: string; error?: string }> {
    try {
      const emails = validUsers.map(u => u.email);
      
      // Use existing bulk invite functionality
      return await this.bulkInviteUsers(organizationId, {
        emails,
        role_id: defaultRoleId,
        send_welcome_email: true
      }, createdBy);

    } catch (error) {
      console.error('Error processing user import:', error);
      return { success: false, error: 'Failed to process user import' };
    }
  }

  // Get operation status
  async getOperationStatus(operationId: string): Promise<BulkUserOperation | null> {
    try {
      // In production, query from database
      // For demo, return mock data
      const mockOperation: BulkUserOperation = {
        id: operationId,
        operation_type: 'invite',
        target_users: ['user1', 'user2', 'user3'],
        parameters: {
          emails: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
          role_id: 'analyst'
        },
        status: 'completed',
        created_by: 'admin',
        organization_id: 'demo-org',
        created_at: new Date(Date.now() - 300000).toISOString(),
        started_at: new Date(Date.now() - 250000).toISOString(),
        completed_at: new Date(Date.now() - 50000).toISOString(),
        progress: 100,
        total_users: 3,
        successful_users: 2,
        failed_users: 1,
        error_details: [{
          user_id: 'user3@example.com',
          error: 'Invalid email domain'
        }]
      };

      return mockOperation;
    } catch (error) {
      console.error('Error fetching operation status:', error);
      return null;
    }
  }

  // Helper methods
  private async createUserInvitation(params: {
    email: string;
    organizationId: string;
    roleId: string;
    departmentId?: string;
    teamIds?: string[];
    invitedBy: string;
    customMessage?: string;
  }): Promise<{ success: boolean; user_id?: string; error?: string }> {
    // In production, create actual invitation
    // For demo, simulate success
    return {
      success: true,
      user_id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };
  }

  private async checkUserExists(email: string, organizationId: string): Promise<boolean> {
    // In production, query database
    // For demo, always return false
    return false;
  }

  private async sendWelcomeEmail(email: string, customMessage?: string): Promise<void> {
    // In production, send actual email
    console.log(`📧 Welcome email sent to ${email}`);
  }

  private async sendRoleChangeNotification(userId: string, newRoleId: string): Promise<void> {
    // In production, send notification
    console.log(`🔔 Role change notification sent to user ${userId}`);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString) && !isNaN(Date.parse(dateString));
  }

  // Event system for real-time updates
  public on(operationId: string, callback: (operation: BulkUserOperation) => void): void {
    if (!this.operationListeners.has(operationId)) {
      this.operationListeners.set(operationId, []);
    }
    this.operationListeners.get(operationId)!.push(callback);
  }

  public off(operationId: string, callback: (operation: BulkUserOperation) => void): void {
    const listeners = this.operationListeners.get(operationId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyOperationUpdate(operationId: string, operation: BulkUserOperation): void {
    const listeners = this.operationListeners.get(operationId);
    if (listeners) {
      listeners.forEach(callback => callback(operation));
    }
  }
}

export const bulkUserOperationsService = BulkUserOperationsService.getInstance();