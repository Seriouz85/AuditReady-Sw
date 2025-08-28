import { useState, useEffect, useCallback } from 'react';
import { 
  DynamicContentGenerator, 
  GeneratedContent 
} from '@/services/compliance/DynamicContentGenerator';
import { 
  FrameworkSelection 
} from '@/services/compliance/FrameworkMappingResolver';

interface UseComplianceDataResult {
  data: Map<string, GeneratedContent>;
  loading: boolean;
  error: string | null;
  generateContent: (frameworks: FrameworkSelection) => Promise<void>;
  generateCategoryContent: (category: string, frameworks: FrameworkSelection) => Promise<GeneratedContent | null>;
  clearData: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook for managing compliance data generation and caching
 */
export function useComplianceData(): UseComplianceDataResult {
  const [data, setData] = useState<Map<string, GeneratedContent>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFrameworks, setLastFrameworks] = useState<FrameworkSelection | null>(null);

  const contentGenerator = new DynamicContentGenerator();

  const generateContent = useCallback(async (frameworks: FrameworkSelection) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate content for all categories
      const generatedData = await contentGenerator.generateAllCategoriesContent(frameworks);
      
      setData(generatedData);
      setLastFrameworks(frameworks);
      
    } catch (err) {
      console.error('Error generating compliance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate compliance data');
    } finally {
      setLoading(false);
    }
  }, [contentGenerator]);

  const generateCategoryContent = useCallback(async (
    category: string, 
    frameworks: FrameworkSelection
  ): Promise<GeneratedContent | null> => {
    try {
      setError(null);
      
      const content = await contentGenerator.generateCategoryContent(category, frameworks);
      
      // Update the data map with the new category content
      setData(prev => {
        const updated = new Map(prev);
        updated.set(category, content);
        return updated;
      });
      
      return content;
      
    } catch (err) {
      console.error('Error generating category content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate category content');
      return null;
    }
  }, [contentGenerator]);

  const clearData = useCallback(() => {
    setData(new Map());
    setLastFrameworks(null);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    if (lastFrameworks) {
      await generateContent(lastFrameworks);
    }
  }, [lastFrameworks, generateContent]);

  // Auto-clear data when component unmounts or frameworks change significantly
  useEffect(() => {
    return () => {
      setData(new Map());
    };
  }, []);

  return {
    data,
    loading,
    error,
    generateContent,
    generateCategoryContent,
    clearData,
    refreshData
  };
}