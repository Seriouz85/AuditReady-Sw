import { useState, useEffect } from 'react';
import { requirements as demoRequirements } from '@/data/mockData';
import { Requirement } from '@/types';

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    const stored = localStorage.getItem('requirements');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('requirements', JSON.stringify(demoRequirements));
    return demoRequirements;
  });

  useEffect(() => {
    localStorage.setItem('requirements', JSON.stringify(requirements));
  }, [requirements]);

  return { requirements, setRequirements, loading: false };
} 