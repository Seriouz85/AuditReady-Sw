import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, profile: Profile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        profile: null,
        isLoading: true,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
        login: (user, profile) => set({ 
          user, 
          profile, 
          isAuthenticated: true,
          isLoading: false 
        }),
        logout: () => set({ 
          user: null, 
          profile: null, 
          isAuthenticated: false 
        }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user,
          profile: state.profile,
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);