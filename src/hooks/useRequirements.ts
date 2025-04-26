import { useState, useEffect } from 'react';
import { Requirement } from '@/types/requirements';

export const useRequirements = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchRequirements = async () => {
      try {
        // Mock data for now
        const mockRequirements: Requirement[] = [
          {
            id: 'req-1',
            standardId: 'iso-27002-2022',
            name: 'Access Control',
            description: 'Access to information and associated assets should be controlled based on business and security requirements.',
            status: 'not_started'
          },
          {
            id: 'req-2',
            standardId: 'nist-800-53',
            name: 'Access Control',
            description: 'The organization limits information system access to authorized users, processes acting on behalf of authorized users, or devices.',
            status: 'not_started'
          }
        ];
        setRequirements(mockRequirements);
      } catch (error) {
        console.error('Error fetching requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  return { requirements, loading };
}; 