import { useEffect, useState } from 'react';
import { OnboardingSessionService, OnboardingSessionData } from '@/services/OnboardingSessionService';

/**
 * Hook to manage onboarding session data with database persistence
 *
 * This replaces localStorage usage for onboarding flow to prevent data loss
 * across browsers/devices and provide better reliability.
 *
 * Usage:
 * ```typescript
 * const { sessionData, saveSession, isLoading } = useOnboardingSession();
 *
 * // Save data
 * await saveSession({ organizationName: 'Acme Corp', industry: 'finance' });
 *
 * // Access data
 * console.log(sessionData?.organizationName);
 * ```
 */
export function useOnboardingSession() {
  const [sessionData, setSessionData] = useState<OnboardingSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    async function initializeSession() {
      try {
        setIsLoading(true);

        // Migrate from localStorage if needed
        await OnboardingSessionService.migrateFromLocalStorage();

        // Initialize or retrieve session
        await OnboardingSessionService.initSession();

        // Load existing data
        const data = await OnboardingSessionService.getData();
        setSessionData(data);

        setError(null);
      } catch (err) {
        console.error('Failed to initialize onboarding session:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, []);

  /**
   * Save partial or full session data
   */
  const saveSession = async (data: Partial<OnboardingSessionData>) => {
    try {
      await OnboardingSessionService.saveData(data);

      // Update local state
      setSessionData(prev => ({ ...prev, ...data }));

      return true;
    } catch (err) {
      console.error('Failed to save onboarding session:', err);
      setError(err instanceof Error ? err.message : 'Failed to save session');
      return false;
    }
  };

  /**
   * Complete the onboarding session and link to user
   */
  const completeSession = async (userId: string) => {
    try {
      await OnboardingSessionService.completeSession(userId);
      setSessionData(null);
      return true;
    } catch (err) {
      console.error('Failed to complete onboarding session:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete session');
      return false;
    }
  };

  /**
   * Clear the current session
   */
  const clearSession = () => {
    OnboardingSessionService.clearSession();
    setSessionData(null);
  };

  /**
   * Refresh session data from database
   */
  const refreshSession = async () => {
    try {
      const data = await OnboardingSessionService.getData();
      setSessionData(data);
      return data;
    } catch (err) {
      console.error('Failed to refresh onboarding session:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh session');
      return null;
    }
  };

  return {
    sessionData,
    isLoading,
    error,
    saveSession,
    completeSession,
    clearSession,
    refreshSession
  };
}
