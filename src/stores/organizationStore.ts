import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Organization, OrganizationRole, Subscription } from '@/types/database';

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  currentRole: OrganizationRole | null;
  subscription: Subscription | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentRole: (role: OrganizationRole | null) => void;
  setSubscription: (sub: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  switchOrganization: (orgId: string) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  devtools(
    persist(
      (set, get) => ({
        currentOrganization: null,
        organizations: [],
        currentRole: null,
        subscription: null,
        isLoading: false,
        setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),
        setOrganizations: (organizations) => set({ organizations }),
        setCurrentRole: (currentRole) => set({ currentRole }),
        setSubscription: (subscription) => set({ subscription }),
        setLoading: (isLoading) => set({ isLoading }),
        addOrganization: (org) => set((state) => ({ 
          organizations: [...state.organizations, org] 
        })),
        updateOrganization: (id, updates) => set((state) => ({
          organizations: state.organizations.map(org => 
            org.id === id ? { ...org, ...updates } : org
          ),
          currentOrganization: state.currentOrganization?.id === id 
            ? { ...state.currentOrganization, ...updates } 
            : state.currentOrganization
        })),
        removeOrganization: (id) => set((state) => ({
          organizations: state.organizations.filter(org => org.id !== id),
          currentOrganization: state.currentOrganization?.id === id 
            ? null 
            : state.currentOrganization
        })),
        switchOrganization: (orgId) => {
          const org = get().organizations.find(o => o.id === orgId);
          if (org) {
            set({ currentOrganization: org });
          }
        },
      }),
      {
        name: 'organization-storage',
        partialize: (state) => ({ 
          currentOrganization: state.currentOrganization,
          organizations: state.organizations,
        }),
      }
    ),
    {
      name: 'organization-store',
    }
  )
);