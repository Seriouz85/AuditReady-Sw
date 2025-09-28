/**
 * Optimized Application Store - Streamlined application management
 * Simplified application state management with better separation of concerns
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  RequirementFulfillment,
  AzureSyncConfiguration,
  AzureSyncStatus,
  ConfidenceLevel,
  ApplicationSyncMode
} from '../../types/applications';
import { RequirementStatus, Application } from '../../types';
import { supabase } from '../../lib/supabase';

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || 'system';
  } catch {
    return 'system';
  }
};

// Define missing types that would be in applications.ts
interface EnhancedApplication extends Application {
  syncMode: ApplicationSyncMode;
  requirementFulfillments: RequirementFulfillment[];
  azureSyncMetadata?: {
    lastSyncDate: string;
    syncStatus: AzureSyncStatus;
    lastSuccessfulSync?: string;
    syncErrors?: string[];
  };
}

interface ApplicationStats {
  total: number;
  manual: number;
  azureSynced: number;
  active: number;
  underReview: number;
  critical: number;
  highRisk: number;
  reviewDue: number;
  syncedSuccessfully: number;
  syncErrors: number;
  pendingSync: number;
  totalRequirements: number;
  autoAnswered: number;
  manuallyAnswered: number;
  manualOverrides: number;
  avgComplianceScore: number;
}

interface ApplicationFilters {
  searchQuery: string;
  syncMode: ApplicationSyncMode | 'all';
  status: string;
  criticality: string;
  syncStatus: AzureSyncStatus | 'all';
  complianceScore: { min: number; max: number };
}

interface RequirementSuggestion {
  requirementId: string;
  suggestedStatus: RequirementStatus;
  confidenceLevel: ConfidenceLevel;
  evidenceSource: string;
  reasoning: string;
}

interface OptimizedApplicationState {
  // Core data
  applications: EnhancedApplication[];
  selectedApplication: EnhancedApplication | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  filters: ApplicationFilters;
  
  // Azure sync (simplified)
  syncConfiguration: AzureSyncConfiguration;
  isSyncing: boolean;
  
  // Core actions
  setApplications: (applications: EnhancedApplication[]) => void;
  addApplication: (application: EnhancedApplication) => void;
  updateApplication: (id: string, updates: Partial<EnhancedApplication>) => void;
  deleteApplication: (id: string) => void;
  setSelectedApplication: (application: EnhancedApplication | null) => void;
  
  // Requirement management (simplified)
  updateRequirementFulfillment: (
    applicationId: string, 
    requirementId: string, 
    fulfillment: Partial<RequirementFulfillment>
  ) => void;
  
  // Filtering
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  resetFilters: () => void;
  getFilteredApplications: () => EnhancedApplication[];
  
  // Azure sync (simplified)
  setSyncConfiguration: (config: Partial<AzureSyncConfiguration>) => void;
  triggerSync: (applicationId: string) => Promise<void>;
  
  // Statistics (computed)
  getStats: () => ApplicationStats;
  calculateComplianceScore: (applicationId: string) => number;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: ApplicationFilters = {
  searchQuery: '',
  syncMode: 'all',
  status: 'all',
  criticality: 'all',
  syncStatus: 'all',
  complianceScore: { min: 0, max: 100 }
};

const defaultSyncConfig: AzureSyncConfiguration = {
  enabled: true,
  frequency: 'daily',
  autoApproveHighConfidence: false,
  confidenceThreshold: 'medium',
  notifyOnChanges: true,
  notificationRecipients: [],
  excludedRequirements: [],
  customMappings: {}
};

export const useOptimizedApplicationStore = create<OptimizedApplicationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        applications: [],
        selectedApplication: null,
        isLoading: false,
        error: null,
        filters: defaultFilters,
        syncConfiguration: defaultSyncConfig,
        isSyncing: false,

        // Core actions
        setApplications: (applications) => set({ applications }),
        
        addApplication: (application) => {
          set((state) => ({
            applications: [...state.applications, application]
          }));
        },

        updateApplication: (id, updates) => {
          set((state) => ({
            applications: state.applications.map(app =>
              app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
            ),
            selectedApplication: state.selectedApplication?.id === id 
              ? { ...state.selectedApplication, ...updates, updatedAt: new Date().toISOString() }
              : state.selectedApplication
          }));
        },

        deleteApplication: (id) => {
          set((state) => ({
            applications: state.applications.filter(app => app.id !== id),
            selectedApplication: state.selectedApplication?.id === id ? null : state.selectedApplication
          }));
        },

        setSelectedApplication: (application) => set({ selectedApplication: application }),

        // Simplified requirement fulfillment
        updateRequirementFulfillment: (applicationId, requirementId, fulfillment) => {
          set((state) => ({
            applications: state.applications.map(app => {
              if (app.id !== applicationId) return app;
              
              const existingIndex = app.requirementFulfillments.findIndex(
                rf => rf.requirementId === requirementId
              );
              
              if (existingIndex >= 0) {
                // Update existing
                const updatedFulfillments = [...app.requirementFulfillments];
                updatedFulfillments[existingIndex] = {
                  ...updatedFulfillments[existingIndex],
                  ...fulfillment,
                  lastModifiedAt: new Date().toISOString()
                };
                return { ...app, requirementFulfillments: updatedFulfillments };
              } else {
                // Create new
                const newFulfillment: RequirementFulfillment = {
                  id: `rf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  requirementId,
                  applicationId,
                  status: 'not-fulfilled',
                  isAutoAnswered: false,
                  lastModifiedBy: 'system', // Will be updated when user context is available
                  lastModifiedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  ...fulfillment
                };
                return {
                  ...app,
                  requirementFulfillments: [...app.requirementFulfillments, newFulfillment]
                };
              }
            })
          }));
        },

        // Filtering
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters }
          }));
        },

        resetFilters: () => set({ filters: defaultFilters }),

        getFilteredApplications: () => {
          const { applications, filters } = get();
          
          return applications.filter(app => {
            // Search query
            if (filters.searchQuery) {
              const query = filters.searchQuery.toLowerCase();
              const searchable = [
                app.name,
                app.description,
                app.organizationNumber,
                app.category
              ].filter(Boolean).join(' ').toLowerCase();
              
              if (!searchable.includes(query)) return false;
            }

            // Other filters
            if (filters.syncMode !== 'all' && app.syncMode !== filters.syncMode) return false;
            if (filters.status !== 'all' && app.status !== filters.status) return false;
            if (filters.criticality !== 'all' && app.criticality !== filters.criticality) return false;
            
            // Compliance score filter
            const complianceScore = get().calculateComplianceScore(app.id);
            if (complianceScore < filters.complianceScore.min || complianceScore > filters.complianceScore.max) {
              return false;
            }

            return true;
          });
        },

        // Azure sync (simplified)
        setSyncConfiguration: (config) => {
          set((state) => ({
            syncConfiguration: { ...state.syncConfiguration, ...config }
          }));
        },

        triggerSync: async (applicationId) => {
          set({ isSyncing: true, error: null });
          
          try {
            // Simulate sync
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            get().updateApplication(applicationId, {
              azureSyncMetadata: {
                lastSyncDate: new Date().toISOString(),
                syncStatus: 'synced' as AzureSyncStatus,
                lastSuccessfulSync: new Date().toISOString()
              }
            });
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sync failed';
            set({ error: errorMessage });
          } finally {
            set({ isSyncing: false });
          }
        },

        // Statistics (computed on demand)
        getStats: () => {
          const applications = get().applications;
          
          return {
            total: applications.length,
            manual: applications.filter(app => app.syncMode === 'manual').length,
            azureSynced: applications.filter(app => app.syncMode === 'azure').length,
            active: applications.filter(app => app.status === 'active').length,
            underReview: applications.filter(app => app.status === 'under-review').length,
            critical: applications.filter(app => app.criticality === 'critical').length,
            highRisk: applications.filter(app => app.criticality === 'high').length,
            reviewDue: 0, // Simplified
            syncedSuccessfully: applications.filter(app => 
              app.syncMode === 'azure' && app.azureSyncMetadata?.syncStatus === 'synced'
            ).length,
            syncErrors: applications.filter(app => 
              app.syncMode === 'azure' && app.azureSyncMetadata?.syncStatus === 'error'
            ).length,
            pendingSync: applications.filter(app => 
              app.syncMode === 'azure' && app.azureSyncMetadata?.syncStatus === 'pending'
            ).length,
            totalRequirements: applications.reduce((sum, app) => sum + app.requirementFulfillments.length, 0),
            autoAnswered: applications.reduce((sum, app) => 
              sum + app.requirementFulfillments.filter(rf => rf.isAutoAnswered).length, 0
            ),
            manuallyAnswered: applications.reduce((sum, app) => 
              sum + app.requirementFulfillments.filter(rf => !rf.isAutoAnswered).length, 0
            ),
            manualOverrides: applications.reduce((sum, app) => 
              sum + app.requirementFulfillments.filter(rf => rf.isManualOverride).length, 0
            ),
            avgComplianceScore: applications.length > 0 
              ? Math.round(applications.reduce((sum, app) => sum + get().calculateComplianceScore(app.id), 0) / applications.length)
              : 0
          };
        },

        calculateComplianceScore: (applicationId) => {
          const app = get().applications.find(a => a.id === applicationId);
          if (!app || app.requirementFulfillments.length === 0) return 0;

          const applicableFulfillments = app.requirementFulfillments.filter(rf => rf.status !== 'not-applicable');
          if (applicableFulfillments.length === 0) return 100;

          const fulfilledCount = applicableFulfillments.filter(rf => rf.status === 'fulfilled').length;
          const partialCount = applicableFulfillments.filter(rf => rf.status === 'partially-fulfilled').length;

          return Math.round(((fulfilledCount + (partialCount * 0.5)) / applicableFulfillments.length) * 100);
        },

        // UI state
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error })
      }),
      {
        name: 'optimized-application-storage',
        partialize: (state) => ({
          applications: state.applications,
          syncConfiguration: state.syncConfiguration,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'optimized-application-store',
    }
  )
);