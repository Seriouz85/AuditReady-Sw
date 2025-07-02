import { useQuery } from '@tanstack/react-query';
import { frameworkCountService, FrameworkCounts } from '@/services/compliance/FrameworkCountService';

export function useFrameworkCounts() {
  return useQuery<FrameworkCounts>({
    queryKey: ['framework-counts'],
    queryFn: () => frameworkCountService.getFrameworkCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get CIS Controls count based on IG level
export function useCISControlsCount(igLevel: 'ig1' | 'ig2' | 'ig3' | null) {
  const { data: frameworkCounts } = useFrameworkCounts();
  
  if (!frameworkCounts) {
    // Return fallback counts while loading
    switch (igLevel) {
      case 'ig1': return 56;
      case 'ig2': return 130;
      case 'ig3': return 153;
      default: return 153;
    }
  }

  return frameworkCountService.getCISControlsCount(igLevel);
}