// Unified API Client exports (RECOMMENDED)
export { unifiedApiClient } from './UnifiedApiClient';
export { createSelectQuery, createInsertQuery, createUpdateQuery, createDeleteQuery } from './UnifiedApiClient';

// API Types
export * from './types';

// Query Builder
export { SupabaseQueryBuilder, createQueryBuilder, queries } from './SupabaseQueryBuilder';

// Error Boundary Components
export { ApiErrorBoundary, withApiErrorBoundary, useApiErrorHandler } from '@/components/error/ApiErrorBoundary';

// Legacy API client (deprecated - use UnifiedApiClient instead)
export { apiClient } from './client';
export type { ApiErrorResponse } from './client';

// API endpoints
export * from './endpoints';