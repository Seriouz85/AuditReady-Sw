/**
 * Production Database Query Optimizer
 * Provides optimized queries and caching for better performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface QueryCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

interface QueryPerformanceMetric {
  query: string;
  executionTime: number;
  timestamp: Date;
  cacheHit: boolean;
}

export class QueryOptimizer {
  private supabase: SupabaseClient;
  private cache: QueryCache = {};
  private performanceMetrics: QueryPerformanceMetric[] = [];
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Optimized queries for common data fetching patterns
   */
  public readonly optimizedQueries = {
    // Standards queries
    standards: {
      active: () => this.supabase
        .from('standards')
        .select('id, name, version, description, type, is_active, created_at')
        .eq('is_active', true)
        .order('name'),
      
      byType: (type: string) => this.supabase
        .from('standards')
        .select('id, name, version, description')
        .eq('type', type)
        .eq('is_active', true)
        .order('name')
    },

    // Organizations queries
    organizations: {
      summary: () => this.supabase
        .from('active_organization_summary')
        .select('*'),
      
      byId: (id: string) => this.supabase
        .from('organizations')
        .select('id, name, status, subscription_tier, settings, created_at, updated_at')
        .eq('id', id)
        .single(),

      users: (orgId: string) => this.supabase
        .from('organization_users')
        .select('id, email, role, is_active, created_at, user_profiles(first_name, last_name, avatar_url)')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    },

    // Requirements queries
    requirements: {
      byOrganization: (orgId: string) => this.supabase
        .from('organization_requirements')
        .select(`
          id, requirement_id, status, assigned_to, due_date, notes, updated_at,
          requirements_library(id, title, description, category_id, risk_level)
        `)
        .eq('organization_id', orgId),

      categories: () => this.supabase
        .from('unified_compliance_categories')
        .select('id, name, description, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order'),

      byStatus: (orgId: string, status: string) => this.supabase
        .from('organization_requirements')
        .select('id, requirement_id, status, assigned_to, due_date, updated_at')
        .eq('organization_id', orgId)
        .eq('status', status)
    },

    // Assessments queries
    assessments: {
      byOrganization: (orgId: string) => this.supabase
        .from('assessments')
        .select(`
          id, name, framework, status, progress, created_at, updated_at,
          assessment_requirements(id, requirement_id, status, evidence_notes)
        `)
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false }),

      progress: (assessmentId: string) => this.supabase
        .from('assessment_requirements')
        .select('status')
        .eq('assessment_id', assessmentId)
    },

    // Documents queries
    documents: {
      byOrganization: (orgId: string) => this.supabase
        .from('documents')
        .select('id, title, document_type, file_size, file_path, created_at, updated_at, created_by')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false }),

      recent: (orgId: string, limit = 10) => this.supabase
        .from('documents')
        .select('id, title, document_type, created_at, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(limit)
    },

    // Courses queries
    courses: {
      published: (orgId: string) => this.supabase
        .from('courses')
        .select('id, title, description, duration_minutes, created_at, updated_at')
        .eq('organization_id', orgId)
        .eq('is_published', true)
        .order('title'),

      withProgress: (orgId: string, userId: string) => this.supabase
        .from('courses')
        .select(`
          id, title, description, duration_minutes,
          course_enrollments(id, progress, completed_at, enrolled_at)
        `)
        .eq('organization_id', orgId)
        .eq('is_published', true)
        .eq('course_enrollments.user_id', userId)
    },

    // Risks queries
    risks: {
      byOrganization: (orgId: string) => this.supabase
        .from('risks')
        .select('id, title, description, probability, impact, status, created_at, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false }),

      dashboard: (orgId: string) => this.supabase
        .from('risks')
        .select('status, probability, impact')
        .eq('organization_id', orgId)
    }
  };

  /**
   * Execute query with caching and performance monitoring
   */
  async executeWithCache<T>(
    queryKey: string,
    queryBuilder: () => any,
    cacheTTL: number = this.defaultCacheTTL
  ): Promise<T> {
    const startTime = Date.now();
    
    // Check cache first
    const cached = this.cache[queryKey];
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      this.recordMetric(queryKey, Date.now() - startTime, true);
      return cached.data;
    }

    // Execute query
    const { data, error } = await queryBuilder();
    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    // Cache result
    this.cache[queryKey] = {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL
    };

    this.recordMetric(queryKey, executionTime, false);
    return data;
  }

  /**
   * Batch multiple queries for better performance
   */
  async executeBatch(queries: Array<{ key: string; query: () => any; cacheTTL?: number }>) {
    const promises = queries.map(({ key, query, cacheTTL }) =>
      this.executeWithCache(key, query, cacheTTL)
    );

    return Promise.all(promises);
  }

  /**
   * Clear cache for specific keys or all
   */
  clearCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => delete this.cache[key]);
    } else {
      this.cache = {};
    }
  }

  /**
   * Invalidate cache based on table changes
   */
  invalidateByTable(tableName: string): void {
    const keysToInvalidate = Object.keys(this.cache).filter(key =>
      key.includes(tableName)
    );
    this.clearCache(keysToInvalidate);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): QueryPerformanceMetric[] {
    return this.performanceMetrics.slice(-100); // Last 100 queries
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const totalEntries = Object.keys(this.cache).length;
    const totalSize = JSON.stringify(this.cache).length;
    const hitRate = this.performanceMetrics.length > 0
      ? this.performanceMetrics.filter(m => m.cacheHit).length / this.performanceMetrics.length
      : 0;

    return {
      totalEntries,
      totalSize,
      hitRate: Math.round(hitRate * 100),
      averageExecutionTime: this.getAverageExecutionTime()
    };
  }

  private recordMetric(query: string, executionTime: number, cacheHit: boolean): void {
    this.performanceMetrics.push({
      query,
      executionTime,
      timestamp: new Date(),
      cacheHit
    });

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  private getAverageExecutionTime(): number {
    if (this.performanceMetrics.length === 0) return 0;
    
    const total = this.performanceMetrics.reduce((sum, metric) => sum + metric.executionTime, 0);
    return Math.round(total / this.performanceMetrics.length);
  }

  /**
   * Setup real-time invalidation for cache
   */
  setupRealTimeInvalidation(): void {
    const tables = [
      'organizations',
      'organization_users',
      'requirements_library',
      'organization_requirements',
      'assessments',
      'documents',
      'courses',
      'risks'
    ];

    tables.forEach(table => {
      this.supabase
        .channel(`cache-invalidation-${table}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          () => this.invalidateByTable(table)
        )
        .subscribe();
    });
  }

  /**
   * Common query patterns for dashboard
   */
  async getDashboardData(organizationId: string) {
    const cacheKey = `dashboard:${organizationId}`;
    
    return this.executeWithCache(cacheKey, async () => {
      const [
        requirementsData,
        assessmentsData,
        documentsData,
        risksData
      ] = await Promise.all([
        this.optimizedQueries.requirements.byOrganization(organizationId),
        this.optimizedQueries.assessments.byOrganization(organizationId),
        this.optimizedQueries.documents.recent(organizationId, 5),
        this.optimizedQueries.risks.dashboard(organizationId)
      ]);

      return {
        requirements: requirementsData.data || [],
        assessments: assessmentsData.data || [],
        documents: documentsData.data || [],
        risks: risksData.data || []
      };
    }, 2 * 60 * 1000); // 2 minutes cache for dashboard
  }

  /**
   * Paginated query with optimization
   */
  async getPaginatedData<T>(
    queryBuilder: () => any,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: T[]; totalCount: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;
    
    const [dataQuery, countQuery] = await Promise.all([
      queryBuilder().range(offset, offset + limit - 1),
      queryBuilder().select('id', { count: 'exact', head: true })
    ]);

    if (dataQuery.error) throw dataQuery.error;
    if (countQuery.error) throw countQuery.error;

    const totalCount = countQuery.count || 0;
    const hasMore = offset + limit < totalCount;

    return {
      data: dataQuery.data || [],
      totalCount,
      hasMore
    };
  }
}

// Singleton instance
let queryOptimizer: QueryOptimizer | null = null;

export const getQueryOptimizer = (supabaseClient: SupabaseClient): QueryOptimizer => {
  if (!queryOptimizer) {
    queryOptimizer = new QueryOptimizer(supabaseClient);
    queryOptimizer.setupRealTimeInvalidation();
  }
  return queryOptimizer;
};

export default QueryOptimizer;