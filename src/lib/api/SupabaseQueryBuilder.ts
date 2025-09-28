/**
 * Supabase Query Builder
 * Type-safe query builder with standardized error handling
 */

import { supabase } from '@/lib/supabase';
import { unifiedApiClient } from './UnifiedApiClient';
import { ApiResponse, SupabaseQueryConfig } from './types';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export class SupabaseQueryBuilder<T = any> {
  private tableName: string;
  private queryConfig: SupabaseQueryConfig;

  constructor(table: string, config: SupabaseQueryConfig = {}) {
    this.tableName = table;
    this.queryConfig = config;
  }

  /**
   * Select data with type safety and error handling
   */
  select(columns = '*'): SelectQueryBuilder<T> {
    return new SelectQueryBuilder<T>(this.tableName, columns, this.queryConfig);
  }

  /**
   * Insert data with type safety and error handling
   */
  insert(data: Partial<T> | Partial<T>[]): InsertQueryBuilder<T> {
    return new InsertQueryBuilder<T>(this.tableName, data, this.queryConfig);
  }

  /**
   * Update data with type safety and error handling
   */
  update(data: Partial<T>): UpdateQueryBuilder<T> {
    return new UpdateQueryBuilder<T>(this.tableName, data, this.queryConfig);
  }

  /**
   * Delete data with type safety and error handling
   */
  delete(): DeleteQueryBuilder<T> {
    return new DeleteQueryBuilder<T>(this.tableName, this.queryConfig);
  }

  /**
   * Call RPC function with type safety and error handling
   */
  rpc<R = any>(functionName: string, params: Record<string, any> = {}): RpcQueryBuilder<R> {
    return new RpcQueryBuilder<R>(functionName, params, this.queryConfig);
  }
}

export class SelectQueryBuilder<T> {
  private tableName: string;
  private columns: string;
  private filters: Array<(builder: any) => any> = [];
  private config: SupabaseQueryConfig;

  constructor(table: string, columns: string, config: SupabaseQueryConfig) {
    this.tableName = table;
    this.columns = columns;
    this.config = config;
  }

  // Filter methods
  eq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.eq(column as string, value));
    return this;
  }

  neq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.neq(column as string, value));
    return this;
  }

  gt(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.gt(column as string, value));
    return this;
  }

  gte(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.gte(column as string, value));
    return this;
  }

  lt(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.lt(column as string, value));
    return this;
  }

  lte(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.lte(column as string, value));
    return this;
  }

  like(column: keyof T, pattern: string): this {
    this.filters.push((builder) => builder.like(column as string, pattern));
    return this;
  }

  ilike(column: keyof T, pattern: string): this {
    this.filters.push((builder) => builder.ilike(column as string, pattern));
    return this;
  }

  in(column: keyof T, values: any[]): this {
    this.filters.push((builder) => builder.in(column as string, values));
    return this;
  }

  is(column: keyof T, value: null | boolean): this {
    this.filters.push((builder) => builder.is(column as string, value));
    return this;
  }

  // Ordering methods
  order(column: keyof T, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.filters.push((builder) => builder.order(column as string, options));
    return this;
  }

  // Pagination methods
  range(from: number, to: number): this {
    this.filters.push((builder) => builder.range(from, to));
    return this;
  }

  limit(count: number): this {
    this.filters.push((builder) => builder.limit(count));
    return this;
  }

  // Text search
  textSearch(column: keyof T, query: string, options?: { type?: 'plain' | 'phrase' | 'websearch' }): this {
    this.filters.push((builder) => builder.textSearch(column as string, query, options));
    return this;
  }

  // Execute the query
  async execute(): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(this.tableName).select(this.columns, {
        count: this.config.count || null,
        head: this.config.head || false
      });

      // Apply all filters
      for (const filter of this.filters) {
        query = filter(query);
      }

      const result = await query;
      
      if (result.error) {
        return unifiedApiClient.select(this.tableName, this.columns, this.config);
      }

      return {
        data: result.data || [],
        success: true,
        meta: {
          requestId: this.config.requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'supabase'
        }
      };
    } catch (error) {
      return unifiedApiClient.select(this.tableName, this.columns, this.config);
    }
  }

  // Get first record
  async single(): Promise<ApiResponse<T | null>> {
    this.limit(1);
    const result = await this.execute();
    
    return {
      ...result,
      data: result.data?.[0] || null
    };
  }

  // Check if any records exist
  async exists(): Promise<ApiResponse<boolean>> {
    this.limit(1);
    this.config.head = true;
    const result = await this.execute();
    
    return {
      ...result,
      data: (result.data?.length || 0) > 0
    };
  }
}

export class InsertQueryBuilder<T> {
  private tableName: string;
  private data: Partial<T> | Partial<T>[];
  private config: SupabaseQueryConfig;
  private shouldUpsert = false;
  private conflictColumns?: string[];

  constructor(table: string, data: Partial<T> | Partial<T>[], config: SupabaseQueryConfig) {
    this.tableName = table;
    this.data = data;
    this.config = config;
  }

  // Upsert configuration
  upsert(options?: { onConflict?: string[] }): this {
    this.shouldUpsert = true;
    this.conflictColumns = options?.onConflict;
    return this;
  }

  async execute(): Promise<ApiResponse<T[]>> {
    if (this.shouldUpsert) {
      return unifiedApiClient.insert(this.tableName, this.data, this.config);
    }
    
    return unifiedApiClient.insert(this.tableName, this.data, this.config);
  }
}

export class UpdateQueryBuilder<T> {
  private tableName: string;
  private data: Partial<T>;
  private filters: Array<(builder: any) => any> = [];
  private config: SupabaseQueryConfig;

  constructor(table: string, data: Partial<T>, config: SupabaseQueryConfig) {
    this.tableName = table;
    this.data = data;
    this.config = config;
  }

  // Filter methods (same as SelectQueryBuilder)
  eq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.eq(column as string, value));
    return this;
  }

  neq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.neq(column as string, value));
    return this;
  }

  in(column: keyof T, values: any[]): this {
    this.filters.push((builder) => builder.in(column as string, values));
    return this;
  }

  async execute(): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(this.tableName).update(this.data).select();

      // Apply all filters
      for (const filter of this.filters) {
        query = filter(query);
      }

      const result = await query;
      
      if (result.error) {
        return unifiedApiClient.update(this.tableName, this.data, this.config);
      }

      return {
        data: result.data || [],
        success: true,
        message: 'Resource updated successfully',
        meta: {
          requestId: this.config.requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'supabase'
        }
      };
    } catch (error) {
      return unifiedApiClient.update(this.tableName, this.data, this.config);
    }
  }
}

export class DeleteQueryBuilder<T> {
  private tableName: string;
  private filters: Array<(builder: any) => any> = [];
  private config: SupabaseQueryConfig;

  constructor(table: string, config: SupabaseQueryConfig) {
    this.tableName = table;
    this.config = config;
  }

  // Filter methods (same as SelectQueryBuilder)
  eq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.eq(column as string, value));
    return this;
  }

  neq(column: keyof T, value: any): this {
    this.filters.push((builder) => builder.neq(column as string, value));
    return this;
  }

  in(column: keyof T, values: any[]): this {
    this.filters.push((builder) => builder.in(column as string, values));
    return this;
  }

  async execute(): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(this.tableName).delete().select();

      // Apply all filters
      for (const filter of this.filters) {
        query = filter(query);
      }

      const result = await query;
      
      if (result.error) {
        return unifiedApiClient.delete(this.tableName, this.config);
      }

      return {
        data: result.data || [],
        success: true,
        message: 'Resource deleted successfully',
        meta: {
          requestId: this.config.requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'supabase'
        }
      };
    } catch (error) {
      return unifiedApiClient.delete(this.tableName, this.config);
    }
  }
}

export class RpcQueryBuilder<T> {
  private functionName: string;
  private params: Record<string, any>;
  private config: SupabaseQueryConfig;

  constructor(functionName: string, params: Record<string, any>, config: SupabaseQueryConfig) {
    this.functionName = functionName;
    this.params = params;
    this.config = config;
  }

  async execute(): Promise<ApiResponse<T>> {
    return unifiedApiClient.rpc<T>(this.functionName, this.params, this.config);
  }
}

// Factory function for creating query builders
export function createQueryBuilder<T = any>(
  table: string, 
  config: SupabaseQueryConfig = {}
): SupabaseQueryBuilder<T> {
  return new SupabaseQueryBuilder<T>(table, config);
}

// Utility functions for common patterns
export const queries = {
  // Get all records from a table
  getAll: <T>(table: string, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).select(),

  // Get record by ID
  getById: <T>(table: string, id: string, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).select().eq('id' as keyof T, id),

  // Get records by organization ID
  getByOrganization: <T>(table: string, organizationId: string, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).select().eq('organization_id' as keyof T, organizationId),

  // Search records
  search: <T>(table: string, column: keyof T, query: string, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).select().ilike(column, `%${query}%`),

  // Create record
  create: <T>(table: string, data: Partial<T>, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).insert(data),

  // Update record by ID
  updateById: <T>(table: string, id: string, data: Partial<T>, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).update(data).eq('id' as keyof T, id),

  // Delete record by ID
  deleteById: <T>(table: string, id: string, config?: SupabaseQueryConfig) =>
    createQueryBuilder<T>(table, config).delete().eq('id' as keyof T, id)
};