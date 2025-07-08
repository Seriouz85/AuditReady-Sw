import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Assessment, AssessmentResponse, AssessmentTemplate } from '@/types/database';

interface AssessmentState {
  assessments: Assessment[];
  activeAssessment: Assessment | null;
  templates: AssessmentTemplate[];
  responses: AssessmentResponse[];
  isLoading: boolean;
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  setAssessments: (assessments: Assessment[]) => void;
  setActiveAssessment: (assessment: Assessment | null) => void;
  setTemplates: (templates: AssessmentTemplate[]) => void;
  setResponses: (responses: AssessmentResponse[]) => void;
  setLoading: (loading: boolean) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  addResponse: (response: AssessmentResponse) => void;
  updateResponse: (id: string, updates: Partial<AssessmentResponse>) => void;
  calculateProgress: () => void;
  submitAssessment: (assessmentId: string) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    (set, get) => ({
      assessments: [],
      activeAssessment: null,
      templates: [],
      responses: [],
      isLoading: false,
      progress: {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      },
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
      setLoading: (isLoading) => set({ isLoading }),
      addAssessment: (assessment) => set((state) => ({
        assessments: [...state.assessments, assessment]
      })),
      updateAssessment: (id, updates) => set((state) => ({
        assessments: state.assessments.map(a =>
          a.id === id ? { ...a, ...updates } : a
        ),
        activeAssessment: state.activeAssessment?.id === id
          ? { ...state.activeAssessment, ...updates }
          : state.activeAssessment
      })),
      deleteAssessment: (id) => set((state) => ({
        assessments: state.assessments.filter(a => a.id !== id),
        activeAssessment: state.activeAssessment?.id === id
          ? null
          : state.activeAssessment
      })),
      addResponse: (response) => set((state) => ({
        responses: [...state.responses, response]
      })),
      updateResponse: (id, updates) => set((state) => ({
        responses: state.responses.map(r =>
          r.id === id ? { ...r, ...updates } : r
        )
      })),
      calculateProgress: () => {
        const assessments = get().assessments;
        const responses = get().responses;
        
        const progress = {
          total: assessments.length,
          completed: assessments.filter(a => a.status === 'completed').length,
          inProgress: assessments.filter(a => a.status === 'in_progress').length,
          notStarted: assessments.filter(a => a.status === 'draft').length,
        };
        
        set({ progress });
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
    }),
    {
      name: 'assessment-store',
    }
  )
);