import { useState, useEffect } from 'react';
import { standards as demoStandards } from '@/data/mockData';
import { Standard } from '@/types';

export function useStandards() {
  const [standards, setStandards] = useState<Standard[]>(() => {
    const stored = localStorage.getItem('standards');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('standards', JSON.stringify(demoStandards));
    return demoStandards;
  });

  useEffect(() => {
    localStorage.setItem('standards', JSON.stringify(standards));
  }, [standards]);

  return { standards, setStandards, loading: false };
} 