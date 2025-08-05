import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  EnhancedApplication, 
  ApplicationStats, 
  ApplicationFilters, 
  RequirementFulfillment,
  AzureSyncConfiguration,
  RequirementSuggestion,
  ApplicationSyncMode,
  AzureSyncStatus,
  ConfidenceLevel
} from '@/types/applications';
import { RequirementStatus } from '@/types';

interface ApplicationState {
  // Data
  applications: EnhancedApplication[];
  selectedApplication: EnhancedApplication | null;
  stats: ApplicationStats;
  filters: ApplicationFilters;
  isLoading: boolean;
  error: string | null;

  // Azure sync
  syncConfiguration: AzureSyncConfiguration;
  pendingSuggestions: RequirementSuggestion[];
  isSyncing: boolean;

  // Actions - Application Management
  setApplications: (applications: EnhancedApplication[]) => void;
  addApplication: (application: EnhancedApplication) => void;
  updateApplication: (id: string, updates: Partial<EnhancedApplication>) => void;
  deleteApplication: (id: string) => void;
  setSelectedApplication: (application: EnhancedApplication | null) => void;

  // Actions - Requirement Fulfillment
  updateRequirementFulfillment: (
    applicationId: string, 
    requirementId: string, 
    fulfillment: Partial<RequirementFulfillment>
  ) => void;
  bulkUpdateRequirementFulfillments: (
    applicationId: string,
    fulfillments: Partial<RequirementFulfillment>[]
  ) => void;
  overrideAutoAnswer: (
    applicationId: string,
    requirementId: string,
    newStatus: RequirementStatus,
    justification: string
  ) => void;

  // Actions - Filtering and Search
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  resetFilters: () => void;
  getFilteredApplications: () => EnhancedApplication[];

  // Actions - Azure Sync
  setSyncConfiguration: (config: Partial<AzureSyncConfiguration>) => void;
  triggerSync: (applicationId: string) => Promise<void>;
  processRequirementSuggestion: (
    applicationId: string,
    suggestionId: string,
    action: 'accept' | 'reject' | 'modify',
    customStatus?: RequirementStatus
  ) => void;
  setPendingSuggestions: (suggestions: RequirementSuggestion[]) => void;

  // Actions - Statistics
  calculateStats: () => void;
  calculateComplianceScore: (applicationId: string) => number;

  // Actions - UI State
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

export const useApplicationStore = create<ApplicationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      applications: [],
      selectedApplication: null,
      stats: {
        total: 0,
        manual: 0,
        azureSynced: 0,
        active: 0,
        underReview: 0,
        critical: 0,
        highRisk: 0,
        reviewDue: 0,
        syncedSuccessfully: 0,
        syncErrors: 0,
        pendingSync: 0,
        totalRequirements: 0,
        autoAnswered: 0,
        manuallyAnswered: 0,
        manualOverrides: 0,
        avgComplianceScore: 0
      },
      filters: defaultFilters,
      isLoading: false,
      error: null,
      syncConfiguration: defaultSyncConfig,
      pendingSuggestions: [],
      isSyncing: false,

      // Application Management
      setApplications: (applications) => {
        set({ applications });
        get().calculateStats();
      },

      addApplication: (application) => {
        set((state) => ({
          applications: [...state.applications, application]
        }));
        get().calculateStats();
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
        get().calculateStats();
      },

      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter(app => app.id !== id),
          selectedApplication: state.selectedApplication?.id === id ? null : state.selectedApplication
        }));
        get().calculateStats();
      },

      setSelectedApplication: (application) => set({ selectedApplication: application }),

      // Requirement Fulfillment
      updateRequirementFulfillment: (applicationId, requirementId, fulfillment) => {
        set((state) => ({
          applications: state.applications.map(app => {
            if (app.id !== applicationId) return app;
            
            const existingIndex = app.requirementFulfillments.findIndex(
              rf => rf.requirementId === requirementId
            );
            
            if (existingIndex >= 0) {
              // Update existing fulfillment
              const updatedFulfillments = [...app.requirementFulfillments];
              updatedFulfillments[existingIndex] = {
                ...updatedFulfillments[existingIndex],
                ...fulfillment,
                lastModifiedAt: new Date().toISOString()
              };
              return { ...app, requirementFulfillments: updatedFulfillments };
            } else {
              // Create new fulfillment
              const newFulfillment: RequirementFulfillment = {
                id: `rf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                requirementId,
                applicationId,
                status: 'not-fulfilled',
                isAutoAnswered: false,
                lastModifiedBy: 'current-user', // TODO: Get from auth store
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
          }),
          selectedApplication: state.selectedApplication?.id === applicationId
            ? get().applications.find(app => app.id === applicationId) || state.selectedApplication
            : state.selectedApplication
        }));
        get().calculateStats();
      },

      bulkUpdateRequirementFulfillments: (applicationId, fulfillments) => {
        fulfillments.forEach(fulfillment => {
          if (fulfillment.requirementId) {
            get().updateRequirementFulfillment(applicationId, fulfillment.requirementId, fulfillment);
          }
        });
      },

      overrideAutoAnswer: (applicationId, requirementId, newStatus, justification) => {
        const app = get().applications.find(a => a.id === applicationId);
        const existingFulfillment = app?.requirementFulfillments.find(rf => rf.requirementId === requirementId);
        
        get().updateRequirementFulfillment(applicationId, requirementId, {
          status: newStatus,
          isManualOverride: true,
          originalAutoAnswer: existingFulfillment?.status,
          justification,
          isAutoAnswered: false,
          confidenceLevel: undefined,
          autoAnswerSource: undefined
        });
      },

      // Filtering and Search
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
              app.category,
              app.contact?.name,
              app.internalResponsible?.name
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!searchable.includes(query)) return false;
          }

          // Sync mode filter
          if (filters.syncMode !== 'all' && app.syncMode !== filters.syncMode) {
            return false;
          }

          // Status filter
          if (filters.status !== 'all' && app.status !== filters.status) {
            return false;
          }

          // Criticality filter
          if (filters.criticality !== 'all' && app.criticality !== filters.criticality) {
            return false;
          }

          // Azure sync status filter
          if (filters.syncStatus !== 'all' && app.azureSyncMetadata?.syncStatus !== filters.syncStatus) {
            return false;
          }

          // Compliance score filter
          const complianceScore = get().calculateComplianceScore(app.id);
          if (complianceScore < filters.complianceScore.min || complianceScore > filters.complianceScore.max) {
            return false;
          }

          return true;
        });
      },

      // Azure Sync
      setSyncConfiguration: (config) => {
        set((state) => ({
          syncConfiguration: { ...state.syncConfiguration, ...config }
        }));
      },

      triggerSync: async (applicationId) => {
        set({ isSyncing: true, error: null });
        
        try {
          // TODO: Implement actual Azure sync logic
          console.log(`Triggering sync for application ${applicationId}`);
          
          // Simulate sync delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update sync metadata
          get().updateApplication(applicationId, {
            azureSyncMetadata: {
              ...get().applications.find(app => app.id === applicationId)?.azureSyncMetadata,
              lastSyncDate: new Date().toISOString(),
              syncStatus: 'synced' as AzureSyncStatus,
              lastSuccessfulSync: new Date().toISOString()
            }
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sync failed';
          set({ error: errorMessage });
          
          // Update sync status to error
          get().updateApplication(applicationId, {
            azureSyncMetadata: {
              ...get().applications.find(app => app.id === applicationId)?.azureSyncMetadata,
              syncStatus: 'error' as AzureSyncStatus,
              syncErrors: [errorMessage]
            }
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      processRequirementSuggestion: (applicationId, suggestionId, action, customStatus) => {
        const suggestion = get().pendingSuggestions.find(s => s.requirementId === suggestionId);
        if (!suggestion) return;

        if (action === 'accept') {
          get().updateRequirementFulfillment(applicationId, suggestion.requirementId, {
            status: suggestion.suggestedStatus,
            isAutoAnswered: true,
            confidenceLevel: suggestion.confidenceLevel,
            autoAnswerSource: suggestion.evidenceSource,
            evidence: suggestion.reasoning
          });
        } else if (action === 'modify' && customStatus) {
          get().updateRequirementFulfillment(applicationId, suggestion.requirementId, {
            status: customStatus,
            isAutoAnswered: false,
            justification: `Modified from suggested ${suggestion.suggestedStatus}`
          });
        }

        // Remove processed suggestion
        set((state) => ({
          pendingSuggestions: state.pendingSuggestions.filter(s => s.requirementId !== suggestionId)
        }));
      },

      setPendingSuggestions: (suggestions) => set({ pendingSuggestions: suggestions }),

      // Statistics
      calculateStats: () => {
        const applications = get().applications;
        const now = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(now.getMonth() + 3);

        const stats: ApplicationStats = {
          total: applications.length,
          manual: applications.filter(app => app.syncMode === 'manual').length,
          azureSynced: applications.filter(app => app.syncMode === 'azure').length,
          active: applications.filter(app => app.status === 'active').length,
          underReview: applications.filter(app => app.status === 'under-review').length,
          critical: applications.filter(app => app.criticality === 'critical').length,
          highRisk: applications.filter(app => app.criticality === 'high').length,
          reviewDue: applications.filter(app => {
            if (!app.nextReviewDate) return false;
            return new Date(app.nextReviewDate) <= threeMonthsFromNow;
          }).length,
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

        set({ stats });
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

      // UI State
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'application-store',
    }
  )
);