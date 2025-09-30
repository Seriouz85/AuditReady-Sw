import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Session key stored in sessionStorage (persists within browser session only)
const SESSION_KEY_STORAGE_KEY = 'auditready_onboarding_session_key';

export interface OnboardingSessionData {
  organizationName?: string;
  industry?: string;
  companySize?: string;
  primaryFrameworks?: string[];
  complianceGoals?: string[];
  assessmentData?: any;
  selectedPlan?: string;
  recommendedPlan?: string;
  stripePriceId?: string;
  intendedEmail?: string;
  intendedTier?: string;
}

export class OnboardingSessionService {
  /**
   * Get or create session key for current browser session
   */
  private static getSessionKey(): string {
    let sessionKey = sessionStorage.getItem(SESSION_KEY_STORAGE_KEY);

    if (!sessionKey) {
      sessionKey = uuidv4();
      sessionStorage.setItem(SESSION_KEY_STORAGE_KEY, sessionKey);
    }

    return sessionKey;
  }

  /**
   * Initialize or retrieve onboarding session
   */
  static async initSession(): Promise<string> {
    const sessionKey = this.getSessionKey();

    // Check if session exists in database
    const { data: existingSession } = await supabase
      .from('onboarding_sessions')
      .select('id')
      .eq('session_key', sessionKey)
      .single();

    if (!existingSession) {
      // Create new session
      const { error } = await supabase
        .from('onboarding_sessions')
        .insert({
          session_key: sessionKey,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });

      if (error) {
        console.error('Failed to create onboarding session:', error);
        throw error;
      }
    }

    return sessionKey;
  }

  /**
   * Save onboarding data to database
   */
  static async saveData(data: Partial<OnboardingSessionData>): Promise<void> {
    const sessionKey = this.getSessionKey();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map data to database columns
    if (data.organizationName) updateData.organization_name = data.organizationName;
    if (data.industry) updateData.industry = data.industry;
    if (data.companySize) updateData.company_size = data.companySize;
    if (data.primaryFrameworks) updateData.primary_frameworks = data.primaryFrameworks;
    if (data.complianceGoals) updateData.compliance_goals = data.complianceGoals;
    if (data.assessmentData) updateData.assessment_data = data.assessmentData;
    if (data.selectedPlan) updateData.selected_plan = data.selectedPlan;
    if (data.recommendedPlan) updateData.recommended_plan = data.recommendedPlan;
    if (data.stripePriceId) updateData.stripe_price_id = data.stripePriceId;
    if (data.intendedEmail) updateData.intended_email = data.intendedEmail;
    if (data.intendedTier) updateData.intended_tier = data.intendedTier;

    const { error } = await supabase
      .from('onboarding_sessions')
      .update(updateData)
      .eq('session_key', sessionKey);

    if (error) {
      console.error('Failed to save onboarding data:', error);
      throw error;
    }
  }

  /**
   * Retrieve onboarding session data
   */
  static async getData(): Promise<OnboardingSessionData | null> {
    const sessionKey = this.getSessionKey();

    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('session_key', sessionKey)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      organizationName: data.organization_name,
      industry: data.industry,
      companySize: data.company_size,
      primaryFrameworks: data.primary_frameworks,
      complianceGoals: data.compliance_goals,
      assessmentData: data.assessment_data,
      selectedPlan: data.selected_plan,
      recommendedPlan: data.recommended_plan,
      stripePriceId: data.stripe_price_id,
      intendedEmail: data.intended_email,
      intendedTier: data.intended_tier
    };
  }

  /**
   * Mark session as completed and link to user
   */
  static async completeSession(userId: string): Promise<void> {
    const sessionKey = this.getSessionKey();

    const { error } = await supabase
      .from('onboarding_sessions')
      .update({
        completed: true,
        user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('session_key', sessionKey);

    if (error) {
      console.error('Failed to complete onboarding session:', error);
      throw error;
    }

    // Clear session key from sessionStorage
    sessionStorage.removeItem(SESSION_KEY_STORAGE_KEY);
  }

  /**
   * Clear current session (for logout/cleanup)
   */
  static clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY_STORAGE_KEY);
  }

  /**
   * Migrate data from localStorage (backward compatibility)
   */
  static async migrateFromLocalStorage(): Promise<void> {
    // Check if localStorage has old data
    const onboardingData = localStorage.getItem('onboardingData');
    const selectedPlan = localStorage.getItem('selectedPlan');
    const recommendedPlan = localStorage.getItem('recommendedPlan');
    const assessmentData = localStorage.getItem('auditready_assessment_data');
    const selectedTier = localStorage.getItem('auditready_selected_tier');
    const intendedPlan = sessionStorage.getItem('intendedPlan');
    const intendedPriceId = sessionStorage.getItem('intendedPriceId');

    if (!onboardingData && !selectedPlan && !assessmentData) {
      return; // Nothing to migrate
    }

    // Initialize session
    await this.initSession();

    // Migrate data
    const migrationData: Partial<OnboardingSessionData> = {};

    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        migrationData.organizationName = parsed.organizationName;
        migrationData.industry = parsed.industry;
        migrationData.companySize = parsed.companySize;
        migrationData.primaryFrameworks = parsed.primaryFrameworks;
        migrationData.complianceGoals = parsed.complianceGoals;
      } catch (e) {
        console.warn('Failed to parse onboarding data from localStorage');
      }
    }

    if (assessmentData) {
      try {
        migrationData.assessmentData = JSON.parse(assessmentData);
      } catch (e) {
        console.warn('Failed to parse assessment data from localStorage');
      }
    }

    if (selectedPlan) migrationData.selectedPlan = selectedPlan;
    if (recommendedPlan) migrationData.recommendedPlan = recommendedPlan;
    if (selectedTier) migrationData.intendedTier = selectedTier;
    if (intendedPlan) migrationData.intendedTier = intendedPlan;
    if (intendedPriceId) migrationData.stripePriceId = intendedPriceId;

    await this.saveData(migrationData);

    // Clear localStorage after migration
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('recommendedPlan');
    localStorage.removeItem('auditready_assessment_data');
    localStorage.removeItem('auditready_selected_tier');
    sessionStorage.removeItem('intendedPlan');
    sessionStorage.removeItem('intendedPriceId');

    console.log('✅ Successfully migrated onboarding data from localStorage to database');
  }
}
