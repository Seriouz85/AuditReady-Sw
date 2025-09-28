/**
 * Multi-Tenant Data Isolation Service
 * Provides secure, organization-scoped data access patterns
 */

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AssessmentData, DocumentData, ActivityMetadata } from '@/types/auth';

export interface OrganizationContext {
  organizationId: string;
  userId: string;
  role: string;
  permissions: string[];
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Base class for multi-tenant data access
 * Automatically applies organization-level RLS
 */
export abstract class MultiTenantService {
  protected context: OrganizationContext | null = null;

  constructor(context?: OrganizationContext) {
    this.context = context || null;
  }

  /**
   * Set the organization context for all subsequent operations
   */
  setContext(context: OrganizationContext): void {
    this.context = context;
  }

  /**
   * Get the current organization context
   */
  getContext(): OrganizationContext {
    if (!this.context) {
      throw new Error('Organization context not set');
    }
    return this.context;
  }

  /**
   * Execute a query with automatic organization filtering
   */
  protected async executeQuery<T>(
    tableName: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const context = this.getContext();
    const { page = 1, limit = 50, sortBy, sortOrder = 'desc', filters = {} } = options;

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    // Apply organization filter if table has organization_id
    const { data: tableInfo } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', 'organization_id');

    if (tableInfo && tableInfo.length > 0) {
      query = query.eq('organization_id', context.organizationId);
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('*')) {
          query = query.ilike(key, value.replace(/\*/g, '%'));
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Create a new record with automatic organization assignment
   */
  protected async createRecord<T>(
    tableName: string,
    data: Partial<T>
  ): Promise<T> {
    const context = this.getContext();

    const recordData = {
      ...data,
      organization_id: context.organizationId,
      created_by: context.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from(tableName)
      .insert(recordData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }

    return result;
  }

  /**
   * Update a record with automatic organization validation
   */
  protected async updateRecord<T>(
    tableName: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const context = this.getContext();

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: context.userId
    };

    const { data: result, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }

    return result;
  }

  /**
   * Delete a record with organization validation
   */
  protected async deleteRecord(
    tableName: string,
    id: string
  ): Promise<void> {
    const context = this.getContext();

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('organization_id', context.organizationId);

    if (error) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Get a single record by ID with organization validation
   */
  protected async getRecord<T>(
    tableName: string,
    id: string
  ): Promise<T | null> {
    const context = this.getContext();

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      throw new Error(`Failed to get record: ${error.message}`);
    }

    return data;
  }

  /**
   * Check if user has specific permission
   */
  protected hasPermission(permission: string): boolean {
    const context = this.getContext();
    return context.permissions.includes(permission) || context.permissions.includes('*');
  }

  /**
   * Ensure user has required permission
   */
  protected requirePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }
}

/**
 * Assessment Management Service
 */
export class AssessmentService extends MultiTenantService {
  async getAssessments(options?: QueryOptions) {
    return this.executeQuery('assessments', options);
  }

  async createAssessment(data: AssessmentData) {
    this.requirePermission('create_assessments');
    return this.createRecord('assessments', data);
  }

  async updateAssessment(id: string, data: Partial<AssessmentData>) {
    this.requirePermission('edit_assessments');
    return this.updateRecord('assessments', id, data);
  }

  async deleteAssessment(id: string) {
    this.requirePermission('delete_assessments');
    return this.deleteRecord('assessments', id);
  }

  async getAssessmentRequirements(assessmentId: string) {
    const context = this.getContext();
    
    const { data, error } = await supabase
      .from('assessment_requirements')
      .select(`
        *,
        requirement:requirements_library(*),
        assessment:assessments(*)
      `)
      .eq('assessment_id', assessmentId)
      .eq('assessment.organization_id', context.organizationId);

    if (error) {
      throw new Error(`Failed to get assessment requirements: ${error.message}`);
    }

    return data;
  }

  async updateRequirementStatus(
    assessmentId: string,
    requirementId: string,
    status: string,
    evidence?: string,
    notes?: string
  ) {
    this.requirePermission('edit_assessments');
    const context = this.getContext();

    const { data, error } = await supabase
      .from('assessment_requirements')
      .update({
        status,
        evidence,
        notes,
        updated_at: new Date().toISOString(),
        reviewed_by: context.userId
      })
      .eq('assessment_id', assessmentId)
      .eq('requirement_id', requirementId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update requirement status: ${error.message}`);
    }

    return data;
  }
}

/**
 * Document Management Service
 */
export class DocumentService extends MultiTenantService {
  async getDocuments(options?: QueryOptions) {
    return this.executeQuery('document_library', options);
  }

  async createDocument(data: DocumentData) {
    this.requirePermission('create_documents');
    return this.createRecord('document_library', data);
  }

  async updateDocument(id: string, data: Partial<DocumentData>) {
    this.requirePermission('edit_documents');
    return this.updateRecord('document_library', id, data);
  }

  async deleteDocument(id: string) {
    this.requirePermission('delete_documents');
    return this.deleteRecord('document_library', id);
  }

  async getDocumentVersions(documentId: string) {
    const context = this.getContext();

    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) {
      throw new Error(`Failed to get document versions: ${error.message}`);
    }

    // Verify document belongs to organization
    const document = await this.getRecord('document_library', documentId);
    if (!document) {
      throw new Error('Document not found or access denied');
    }

    return data;
  }

  async linkDocumentToRequirement(
    documentId: string,
    requirementId: string,
    relationshipType: string = 'evidence'
  ) {
    this.requirePermission('edit_documents');
    const context = this.getContext();

    const { data, error } = await supabase
      .from('requirement_documents')
      .insert({
        document_id: documentId,
        requirement_id: requirementId,
        organization_id: context.organizationId,
        relationship_type: relationshipType,
        created_by: context.userId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to link document to requirement: ${error.message}`);
    }

    return data;
  }
}

/**
 * User Management Service
 */
export class UserManagementService extends MultiTenantService {
  async getOrganizationUsers(options?: QueryOptions) {
    return this.executeQuery('organization_users', options);
  }

  async inviteUser(email: string, name: string, role: string) {
    this.requirePermission('manage_users');
    const context = this.getContext();

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        email,
        name,
        role,
        organization_id: context.organizationId,
        invited_by_user_id: context.userId,
        invited_by_user_name: 'Current User', // TODO: Get actual user name
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invitation: ${error.message}`);
    }

    return data;
  }

  async updateUserRole(userId: string, role: string) {
    this.requirePermission('manage_users');
    
    const { data, error } = await supabase
      .from('organization_users')
      .update({ role_id: role })
      .eq('id', userId)
      .eq('organization_id', this.getContext().organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    return data;
  }

  async deactivateUser(userId: string) {
    this.requirePermission('manage_users');
    
    const { data, error } = await supabase
      .from('organization_users')
      .update({ status: 'inactive' })
      .eq('id', userId)
      .eq('organization_id', this.getContext().organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    return data;
  }
}

/**
 * Activity Logging Service
 */
export class ActivityLogService extends MultiTenantService {
  async logActivity(
    action: string,
    entityType: string,
    entityId: string,
    entityName?: string,
    description?: string,
    metadata?: ActivityMetadata
  ) {
    const context = this.getContext();

    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        organization_id: context.organizationId,
        actor_id: context.userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        description: description || `User ${action} ${entityType}`,
        metadata: metadata || {},
        is_system_generated: false
      });

    if (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error for logging failures
    }

    return data;
  }

  async getActivityFeed(options?: QueryOptions) {
    return this.executeQuery('activity_feed', {
      ...options,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }
}

/**
 * Service Factory
 * Creates properly configured service instances
 */
export class ServiceFactory {
  private static context: OrganizationContext | null = null;

  static setContext(context: OrganizationContext): void {
    ServiceFactory.context = context;
  }

  static getAssessmentService(): AssessmentService {
    if (!ServiceFactory.context) {
      throw new Error('Service context not initialized');
    }
    return new AssessmentService(ServiceFactory.context);
  }

  static getDocumentService(): DocumentService {
    if (!ServiceFactory.context) {
      throw new Error('Service context not initialized');
    }
    return new DocumentService(ServiceFactory.context);
  }

  static getUserManagementService(): UserManagementService {
    if (!ServiceFactory.context) {
      throw new Error('Service context not initialized');
    }
    return new UserManagementService(ServiceFactory.context);
  }

  static getActivityLogService(): ActivityLogService {
    if (!ServiceFactory.context) {
      throw new Error('Service context not initialized');
    }
    return new ActivityLogService(ServiceFactory.context);
  }
}

/**
 * React Hook for Multi-Tenant Services
 */
export const useMultiTenantServices = () => {
  const { user, organization } = useAuth();

  if (!user || !organization) {
    throw new Error('User and organization context required');
  }

  const context: OrganizationContext = {
    organizationId: organization.id,
    userId: user.id,
    role: user.role || 'user',
    permissions: user.permissions || []
  };

  // Initialize service factory
  ServiceFactory.setContext(context);

  return {
    assessmentService: ServiceFactory.getAssessmentService(),
    documentService: ServiceFactory.getDocumentService(),
    userManagementService: ServiceFactory.getUserManagementService(),
    activityLogService: ServiceFactory.getActivityLogService(),
    context
  };
};

export default {
  MultiTenantService,
  AssessmentService,
  DocumentService,
  UserManagementService,
  ActivityLogService,
  ServiceFactory,
  useMultiTenantServices
};