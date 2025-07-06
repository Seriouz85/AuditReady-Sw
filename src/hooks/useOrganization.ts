import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  domain?: string;
  subscription_plan?: string;
  is_active: boolean;
}

export const useOrganization = () => {
  const { user, isDemo } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrganization();
    } else {
      setOrganization(null);
      setLoading(false);
    }
  }, [user]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemo) {
        // Return demo organization
        setOrganization({
          id: 'demo-org-1',
          name: 'Demo Organization',
          domain: 'demo.com',
          subscription_plan: 'enterprise',
          is_active: true
        });
        return;
      }

      // Get user's organization from organization_users table
      const { data: orgUser, error: orgUserError } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single();

      if (orgUserError) throw orgUserError;

      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgUser.organization_id)
        .single();

      if (orgError) throw orgError;

      setOrganization(org);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError('Failed to load organization');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    // TODO: Implement organization switching
    console.log('Switching to organization:', organizationId);
  };

  return {
    organization,
    loading,
    error,
    switchOrganization,
    refreshOrganization: fetchOrganization
  };
};