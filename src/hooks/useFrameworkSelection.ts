import { useState, useCallback, useEffect } from 'react';
import { FrameworkSelection } from '@/services/compliance/FrameworkMappingResolver';

/**
 * Hook for managing framework selection state
 */
export function useFrameworkSelection() {
  const [frameworks, setFrameworks] = useState<FrameworkSelection>({
    iso27001: false,
    iso27002: false,
    cisControls: null,
    gdpr: false,
    nis2: false
  });

  const [isValid, setIsValid] = useState(false);

  // Validate framework selection
  useEffect(() => {
    const hasSelection = frameworks.iso27001 || 
                        frameworks.iso27002 || 
                        frameworks.cisControls !== null || 
                        frameworks.gdpr || 
                        frameworks.nis2;
    
    setIsValid(hasSelection);
  }, [frameworks]);

  const toggleFramework = useCallback((framework: keyof Omit<FrameworkSelection, 'cisControls'>) => {
    setFrameworks(prev => ({
      ...prev,
      [framework]: !prev[framework]
    }));
  }, []);

  const setCISLevel = useCallback((level: 'ig1' | 'ig2' | 'ig3' | null) => {
    setFrameworks(prev => ({
      ...prev,
      cisControls: level
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setFrameworks({
      iso27001: false,
      iso27002: false,
      cisControls: null,
      gdpr: false,
      nis2: false
    });
  }, []);

  const getSelectedFrameworkNames = useCallback(() => {
    const selected: string[] = [];
    
    if (frameworks.iso27001) selected.push('ISO 27001');
    if (frameworks.iso27002) selected.push('ISO 27002');
    if (frameworks.cisControls) selected.push(`CIS Controls ${frameworks.cisControls.toUpperCase()}`);
    if (frameworks.gdpr) selected.push('GDPR');
    if (frameworks.nis2) selected.push('NIS2');
    
    return selected;
  }, [frameworks]);

  const getSelectionCount = useCallback(() => {
    let count = 0;
    if (frameworks.iso27001) count++;
    if (frameworks.iso27002) count++;
    if (frameworks.cisControls) count++;
    if (frameworks.gdpr) count++;
    if (frameworks.nis2) count++;
    return count;
  }, [frameworks]);

  return {
    frameworks,
    setFrameworks,
    toggleFramework,
    setCISLevel,
    resetSelection,
    getSelectedFrameworkNames,
    getSelectionCount,
    isValid
  };
}