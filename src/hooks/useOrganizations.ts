import { useState, useEffect } from 'react';
import { Organization } from '@/types/organization';
import { useToast } from '@/components/ui/use-toast';

interface UseOrganizationsResult {
  organizations: Organization[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOrganizations(): UseOrganizationsResult {
  const [organizations, setOrganizations] = useState<Organization[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/organizations');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        variant: "destructive",
        title: "Error loading organizations",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  return {
    organizations,
    isLoading,
    error,
    refetch: fetchOrganizations
  };
} 