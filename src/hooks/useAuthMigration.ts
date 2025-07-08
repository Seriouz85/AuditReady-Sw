import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore, useOrganizationStore } from '@/stores';

/**
 * Migration hook to sync AuthContext with Zustand stores
 * This allows gradual migration from Context API to Zustand
 */
export const useAuthMigration = () => {
  const authContext = useAuth();
  const authStore = useAuthStore();
  const orgStore = useOrganizationStore();

  useEffect(() => {
    // Sync user data
    if (authContext.user !== authStore.user) {
      authStore.setUser(authContext.user);
    }

    // Sync loading state
    if (authContext.loading !== authStore.isLoading) {
      authStore.setLoading(authContext.loading);
    }

    // Sync organization data
    if (authContext.organization) {
      orgStore.setCurrentOrganization(authContext.organization as any);
      orgStore.setCurrentRole(authContext.userRole as any);
    }

    // Sync authentication state
    if (authContext.user && !authStore.isAuthenticated) {
      authStore.setUser(authContext.user);
    } else if (!authContext.user && authStore.isAuthenticated) {
      authStore.logout();
    }
  }, [
    authContext.user,
    authContext.loading,
    authContext.organization,
    authContext.userRole,
    authStore,
    orgStore
  ]);

  return {
    isReady: !authContext.loading && !authStore.isLoading
  };
};