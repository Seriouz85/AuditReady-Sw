import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ComplianceFramework, RequirementStatus, Assessment } from '@/types/database';

interface ComplianceState {
  frameworks: ComplianceFramework[];
  activeFramework: ComplianceFramework | null;
  requirementStatuses: RequirementStatus[];
  assessments: Assessment[];
  isLoading: boolean;
  complianceScore: number;
  gapAnalysis: {
    total: number;
    fulfilled: number;
    partial: number;
    notFulfilled: number;
    notApplicable: number;
  };
  setFrameworks: (frameworks: ComplianceFramework[]) => void;
  setActiveFramework: (framework: ComplianceFramework | null) => void;
  setRequirementStatuses: (statuses: RequirementStatus[]) => void;
  setAssessments: (assessments: Assessment[]) => void;
  setLoading: (loading: boolean) => void;
  updateRequirementStatus: (requirementId: string, status: Partial<RequirementStatus>) => void;
  calculateComplianceScore: () => void;
  performGapAnalysis: () => void;
  addFramework: (framework: ComplianceFramework) => void;
  removeFramework: (id: string) => void;
}

export const useComplianceStore = create<ComplianceState>()(
  devtools(
    (set, get) => ({
      frameworks: [],
      activeFramework: null,
      requirementStatuses: [],
      assessments: [],
      isLoading: false,
      complianceScore: 0,
      gapAnalysis: {
        total: 0,
        fulfilled: 0,
        partial: 0,
        notFulfilled: 0,
        notApplicable: 0,
      },
      setFrameworks: (frameworks) => set({ frameworks }),
      setActiveFramework: (activeFramework) => set({ activeFramework }),
      setRequirementStatuses: (requirementStatuses) => {
        set({ requirementStatuses });
        get().calculateComplianceScore();
        get().performGapAnalysis();
      },
      setAssessments: (assessments) => set({ assessments }),
      setLoading: (isLoading) => set({ isLoading }),
      updateRequirementStatus: (requirementId, status) => set((state) => ({
        requirementStatuses: state.requirementStatuses.map(rs =>
          rs.requirement_id === requirementId ? { ...rs, ...status } : rs
        )
      })),
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
      addFramework: (framework) => set((state) => ({
        frameworks: [...state.frameworks, framework]
      })),
      removeFramework: (id) => set((state) => ({
        frameworks: state.frameworks.filter(f => f.id !== id),
        activeFramework: state.activeFramework?.id === id ? null : state.activeFramework
      })),
    }),
    {
      name: 'compliance-store',
    }
  )
);