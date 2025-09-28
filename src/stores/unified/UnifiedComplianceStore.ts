/**
 * Unified Compliance Store - Consolidates Assessment and Compliance Management
 * Handles all compliance-related state including assessments, frameworks, and progress tracking
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Assessment, 
  RequirementStatus 
} from '../../types';

// Define missing types that would come from database schema
interface AssessmentResponse {
  id: string;
  assessment_id: string;
  requirement_id: string;
  status: RequirementStatus;
  evidence?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  standards: string[];
  created_at: string;
  updated_at: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: string[];
  created_at: string;
  updated_at: string;
}

interface RequirementStatusRecord {
  id: string;
  requirement_id: string;
  status: RequirementStatus;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface UnifiedComplianceState {
  // Assessment Management
  assessments: Assessment[];
  activeAssessment: Assessment | null;
  templates: AssessmentTemplate[];
  responses: AssessmentResponse[];
  
  // Compliance Framework Management
  frameworks: ComplianceFramework[];
  activeFramework: ComplianceFramework | null;
  requirementStatuses: RequirementStatusRecord[];
  
  // Shared State
  isLoading: boolean;
  error: string | null;
  
  // Combined Analytics
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  complianceScore: number;
  gapAnalysis: {
    total: number;
    fulfilled: number;
    partial: number;
    notFulfilled: number;
    notApplicable: number;
  };
  
  // Assessment Actions
  setAssessments: (assessments: Assessment[]) => void;
  setActiveAssessment: (assessment: Assessment | null) => void;
  setTemplates: (templates: AssessmentTemplate[]) => void;
  setResponses: (responses: AssessmentResponse[]) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  addResponse: (response: AssessmentResponse) => void;
  updateResponse: (id: string, updates: Partial<AssessmentResponse>) => void;
  submitAssessment: (assessmentId: string) => void;
  
  // Framework Actions
  setFrameworks: (frameworks: ComplianceFramework[]) => void;
  setActiveFramework: (framework: ComplianceFramework | null) => void;
  setRequirementStatuses: (statuses: RequirementStatusRecord[]) => void;
  updateRequirementStatus: (requirementId: string, status: Partial<RequirementStatusRecord>) => void;
  addFramework: (framework: ComplianceFramework) => void;
  removeFramework: (id: string) => void;
  
  // Shared Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculateProgress: () => void;
  calculateComplianceScore: () => void;
  performGapAnalysis: () => void;
  
  // Utility Actions
  getAssessmentsByFramework: (frameworkId: string) => Assessment[];
  getComplianceOverview: () => {
    totalFrameworks: number;
    activeAssessments: number;
    overallScore: number;
    criticalGaps: number;
  };
}

export const useUnifiedComplianceStore = create<UnifiedComplianceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        assessments: [],
        activeAssessment: null,
        templates: [],
        responses: [],
        frameworks: [],
        activeFramework: null,
        requirementStatuses: [],
        isLoading: false,
        error: null,
        progress: {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
        },
        complianceScore: 0,
        gapAnalysis: {
          total: 0,
          fulfilled: 0,
          partial: 0,
          notFulfilled: 0,
          notApplicable: 0,
        },

        // Assessment Actions
        setAssessments: (assessments) => {
          set({ assessments });
          get().calculateProgress();
        },
        
        setActiveAssessment: (activeAssessment) => set({ activeAssessment }),
        setTemplates: (templates) => set({ templates }),
        
        setResponses: (responses) => {
          set({ responses });
          get().calculateProgress();
        },
        
        addAssessment: (assessment) => {
          set((state) => ({
            assessments: [...state.assessments, assessment]
          }));
          get().calculateProgress();
        },
        
        updateAssessment: (id, updates) => {
          set((state) => ({
            assessments: state.assessments.map(a =>
              a.id === id ? { ...a, ...updates } : a
            ),
            activeAssessment: state.activeAssessment?.id === id
              ? { ...state.activeAssessment, ...updates }
              : state.activeAssessment
          }));
          get().calculateProgress();
        },
        
        deleteAssessment: (id) => {
          set((state) => ({
            assessments: state.assessments.filter(a => a.id !== id),
            activeAssessment: state.activeAssessment?.id === id
              ? null
              : state.activeAssessment
          }));
          get().calculateProgress();
        },
        
        addResponse: (response) => {
          set((state) => ({
            responses: [...state.responses, response]
          }));
          get().calculateProgress();
        },
        
        updateResponse: (id, updates) => {
          set((state) => ({
            responses: state.responses.map(r =>
              r.id === id ? { ...r, ...updates } : r
            )
          }));
          get().calculateProgress();
        },
        
        submitAssessment: (assessmentId) => {
          set((state) => ({
            assessments: state.assessments.map(a =>
              a.id === assessmentId
                ? { ...a, status: 'completed', completed_at: new Date().toISOString() }
                : a
            )
          }));
          get().calculateProgress();
        },

        // Framework Actions
        setFrameworks: (frameworks) => {
          set({ frameworks });
          get().calculateComplianceScore();
        },
        
        setActiveFramework: (activeFramework) => set({ activeFramework }),
        
        setRequirementStatuses: (requirementStatuses) => {
          set({ requirementStatuses });
          get().calculateComplianceScore();
          get().performGapAnalysis();
        },
        
        updateRequirementStatus: (requirementId, status) => {
          set((state) => ({
            requirementStatuses: state.requirementStatuses.map(rs =>
              rs.requirement_id === requirementId ? { ...rs, ...status } : rs
            )
          }));
          get().calculateComplianceScore();
          get().performGapAnalysis();
        },
        
        addFramework: (framework) => {
          set((state) => ({
            frameworks: [...state.frameworks, framework]
          }));
        },
        
        removeFramework: (id) => {
          set((state) => ({
            frameworks: state.frameworks.filter(f => f.id !== id),
            activeFramework: state.activeFramework?.id === id ? null : state.activeFramework
          }));
        },

        // Shared Actions
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        calculateProgress: () => {
          const assessments = get().assessments;
          const progress = {
            total: assessments.length,
            completed: assessments.filter(a => a.status === 'completed').length,
            inProgress: assessments.filter(a => a.status === 'in_progress').length,
            notStarted: assessments.filter(a => a.status === 'draft').length,
          };
          set({ progress });
        },
        
        calculateComplianceScore: () => {
          const statuses = get().requirementStatuses;
          if (statuses.length === 0) {
            set({ complianceScore: 0 });
            return;
          }
          
          const applicableStatuses = statuses.filter(s => s.status !== 'not_applicable');
          const fulfilledCount = applicableStatuses.filter(s => s.status === 'fulfilled').length;
          const partialCount = applicableStatuses.filter(s => s.status === 'partially_fulfilled').length;
          
          const score = applicableStatuses.length > 0
            ? Math.round(((fulfilledCount + (partialCount * 0.5)) / applicableStatuses.length) * 100)
            : 0;
            
          set({ complianceScore: score });
        },
        
        performGapAnalysis: () => {
          const statuses = get().requirementStatuses;
          const analysis = {
            total: statuses.length,
            fulfilled: statuses.filter(s => s.status === 'fulfilled').length,
            partial: statuses.filter(s => s.status === 'partially_fulfilled').length,
            notFulfilled: statuses.filter(s => s.status === 'not_fulfilled').length,
            notApplicable: statuses.filter(s => s.status === 'not_applicable').length,
          };
          set({ gapAnalysis: analysis });
        },

        // Utility Actions
        getAssessmentsByFramework: (frameworkId) => {
          return get().assessments.filter(a => a.framework_id === frameworkId);
        },
        
        getComplianceOverview: () => {
          const state = get();
          return {
            totalFrameworks: state.frameworks.length,
            activeAssessments: state.assessments.filter(a => a.status === 'in_progress').length,
            overallScore: state.complianceScore,
            criticalGaps: state.gapAnalysis.notFulfilled
          };
        },
      }),
      {
        name: 'unified-compliance-storage',
        partialize: (state) => ({
          assessments: state.assessments,
          templates: state.templates,
          frameworks: state.frameworks,
          activeFramework: state.activeFramework,
        }),
      }
    ),
    {
      name: 'unified-compliance-store',
    }
  )
);