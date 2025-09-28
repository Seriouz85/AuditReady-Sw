/**
 * Service Migration Example
 * Demonstrates how to migrate from direct Supabase calls to UnifiedApiClient
 */

import { unifiedApiClient } from '@/lib/api/UnifiedApiClient';
import { createQueryBuilder, queries } from '@/lib/api/SupabaseQueryBuilder';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { ApiResponse } from '@/lib/api/types';

// Example interface for demonstration
interface User {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export class UserServiceMigrationExample {
  
  // ========================================
  // BEFORE: Direct Supabase calls
  // ========================================
  
  async getUsersOldWay(organizationId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error occurred');
      throw error;
    }
  }

  // ========================================
  // AFTER: Using UnifiedApiClient
  // ========================================
  
  async getUsers(organizationId: string): Promise<User[]> {
    const response = await createQueryBuilder<User>('users')
      .select()
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .execute();

    // Error handling is automatically managed by UnifiedApiClient
    // Toast notifications are shown automatically
    // Retries are handled automatically
    
    return response.data || [];
  }

  // ========================================
  // BEFORE: Complex query with manual error handling
  // ========================================
  
  async searchUsersOldWay(organizationId: string, searchTerm: string, role?: string): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`email.ilike.%${searchTerm}%, name.ilike.%${searchTerm}%`);

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Users not found');
        } else if (error.code === 'PGRST204') {
          toast.error('Access denied');
        } else {
          toast.error('Failed to search users');
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      if (error.message.includes('network')) {
        toast.error('Network connection failed');
      } else {
        toast.error('Search failed');
      }
      throw error;
    }
  }

  // ========================================
  // AFTER: Simplified with automatic error handling
  // ========================================
  
  async searchUsers(organizationId: string, searchTerm: string, role?: string): Promise<User[]> {
    let query = createQueryBuilder<User>('users')
      .select()
      .eq('organization_id', organizationId)
      .or(`email.ilike.%${searchTerm}%, name.ilike.%${searchTerm}%`);

    if (role) {
      query = query.eq('role', role);
    }

    const response = await query
      .order('created_at', { ascending: false })
      .limit(50)
      .execute();

    return response.data || [];
  }

  // ========================================
  // BEFORE: Insert with manual error handling
  // ========================================
  
  async createUserOldWay(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('User with this email already exists');
        } else if (error.code === '23503') {
          toast.error('Invalid organization reference');
        } else {
          toast.error('Failed to create user');
        }
        throw error;
      }

      toast.success('User created successfully');
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // ========================================
  // AFTER: Simplified with standardized responses
  // ========================================
  
  async createUser(userData: Partial<User>): Promise<User | null> {
    const response = await createQueryBuilder<User>('users')
      .insert(userData)
      .execute();

    // Success/error toasts are handled automatically
    // Standard error codes are mapped automatically
    // Return the created user or null
    return response.data?.[0] || null;
  }

  // ========================================
  // BEFORE: Update with manual retry logic
  // ========================================
  
  async updateUserOldWay(userId: string, updates: Partial<User>): Promise<User | null> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            toast.error('User not found');
            return null;
          }
          throw error;
        }

        toast.success('User updated successfully');
        return data;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          toast.error('Failed to update user after multiple attempts');
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return null;
  }

  // ========================================
  // AFTER: Automatic retries and error handling
  // ========================================
  
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const response = await createQueryBuilder<User>('users')
      .update(updates)
      .eq('id', userId)
      .execute();

    // Retries are handled automatically
    // Error mapping is standardized
    // Success notifications are automatic
    return response.data?.[0] || null;
  }

  // ========================================
  // BEFORE: Batch operations with manual error handling
  // ========================================
  
  async bulkUpdateUsersOldWay(userIds: string[], updates: Partial<User>): Promise<User[]> {
    const results: User[] = [];
    const errors: any[] = [];

    for (const userId of userIds) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          errors.push({ userId, error });
        } else if (data) {
          results.push(data);
        }
      } catch (error) {
        errors.push({ userId, error });
      }
    }

    if (errors.length > 0) {
      console.error('Bulk update errors:', errors);
      toast.error(`Failed to update ${errors.length} users`);
    }

    if (results.length > 0) {
      toast.success(`Updated ${results.length} users successfully`);
    }

    return results;
  }

  // ========================================
  // AFTER: Simplified batch operations
  // ========================================
  
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<User[]> {
    const response = await createQueryBuilder<User>('users')
      .update(updates)
      .in('id', userIds)
      .execute();

    // Automatic error handling and notifications
    // Single transaction for better performance
    return response.data || [];
  }

  // ========================================
  // New: Using convenience query functions
  // ========================================
  
  async getUserById(userId: string): Promise<User | null> {
    const response = await queries.getById<User>('users', userId).execute();
    return response.data?.[0] || null;
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const response = await queries.getByOrganization<User>('users', organizationId).execute();
    return response.data || [];
  }

  async searchUsersByEmail(email: string): Promise<User[]> {
    const response = await queries.search<User>('users', 'email', email).execute();
    return response.data || [];
  }

  // ========================================
  // Advanced: Using with API response metadata
  // ========================================
  
  async getUsersWithMetadata(organizationId: string): Promise<{
    users: User[];
    requestId: string;
    duration: number;
    fromCache: boolean;
  }> {
    const response = await queries.getByOrganization<User>('users', organizationId, {
      cache: true,
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    }).execute();

    return {
      users: response.data || [],
      requestId: response.meta?.requestId || '',
      duration: response.meta?.duration || 0,
      fromCache: response.meta?.source === 'cache'
    };
  }

  // ========================================
  // Error Handling: Using response checking
  // ========================================
  
  async getUserWithErrorHandling(userId: string): Promise<User | null> {
    const response = await queries.getById<User>('users', userId, {
      suppressToast: true // Disable automatic toast notifications
    }).execute();

    if (!response.success) {
      // Custom error handling
      switch (response.error?.code) {
        case 'NOT_FOUND':
          console.log('User not found, creating default user...');
          return null;
        case 'UNAUTHORIZED':
          console.log('User not authorized, redirecting to login...');
          window.location.href = '/login';
          return null;
        default:
          console.error('Unexpected error:', response.error);
          return null;
      }
    }

    return response.data?.[0] || null;
  }
}

// ========================================
// Performance Monitoring Example
// ========================================

export class ApiPerformanceMonitor {
  static logPerformanceMetrics() {
    const metrics = unifiedApiClient.getPerformanceMetrics();
    
    console.log('API Performance Metrics:', {
      totalRequests: metrics.totalRequests,
      successRate: `${metrics.successRate.toFixed(2)}%`,
      averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
      errorsByCode: metrics.errorsByCode
    });
  }

  static getAuditTrail() {
    return unifiedApiClient.getAuditLogs();
  }

  static clearMetrics() {
    unifiedApiClient.clearAuditLogs();
  }
}

// ========================================
// Migration Checklist
// ========================================

/*
MIGRATION CHECKLIST:

1. ✅ Replace direct supabase.from() calls with createQueryBuilder()
2. ✅ Remove manual error handling (try/catch for API errors)
3. ✅ Remove manual toast notifications for API errors
4. ✅ Remove manual retry logic
5. ✅ Use standardized response format (ApiResponse<T>)
6. ✅ Add type safety with TypeScript generics
7. ✅ Use convenience functions (queries.getById, etc.) where applicable
8. ✅ Add error boundaries to UI components using ApiErrorBoundary
9. ✅ Consider adding performance monitoring for critical paths
10. ✅ Test with suppressToast option for custom error handling

BENEFITS ACHIEVED:
- ✅ Consistent error handling across the application
- ✅ Automatic retry logic for failed requests
- ✅ Standardized API response format
- ✅ Better TypeScript type safety
- ✅ Reduced boilerplate code
- ✅ Centralized logging and monitoring
- ✅ Improved user experience with better error messages
- ✅ Easier testing and debugging
*/