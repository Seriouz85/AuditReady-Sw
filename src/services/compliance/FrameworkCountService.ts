import { supabase } from '@/lib/supabase';

export interface FrameworkCounts {
  iso27001: number;
  iso27002: number;
  cisIG1: number;
  cisIG2: number;
  cisIG3: number;
  gdpr: number;
  nis2: number;
}

class FrameworkCountService {
  private static instance: FrameworkCountService;
  private cachedCounts: FrameworkCounts | null = null;
  private lastFetchTime: number = 0;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FrameworkCountService {
    if (!FrameworkCountService.instance) {
      FrameworkCountService.instance = new FrameworkCountService();
    }
    return FrameworkCountService.instance;
  }

  async getFrameworkCounts(): Promise<FrameworkCounts> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedCounts && (now - this.lastFetchTime) < this.CACHE_TTL) {
      return this.cachedCounts;
    }

    try {
      // Get actual counts from database
      const counts = await this.fetchActualCounts();
      
      // Cache the results
      this.cachedCounts = counts;
      this.lastFetchTime = now;
      
      return counts;
    } catch (error) {
      console.error('Error fetching framework counts:', error);
      
      // Return fallback static counts if database query fails
      return this.getFallbackCounts();
    }
  }

  private async fetchActualCounts(): Promise<FrameworkCounts> {
    const counts: FrameworkCounts = {
      iso27001: 0,
      iso27002: 0,
      cisIG1: 0,
      cisIG2: 0,
      cisIG3: 0,
      gdpr: 0,
      nis2: 0
    };

    // Get counts for each framework individually using exact name patterns
    const frameworks = [
      { namePattern: 'ISO/IEC 27001', key: 'iso27001' as keyof FrameworkCounts },
      { namePattern: 'ISO/IEC 27002', key: 'iso27002' as keyof FrameworkCounts },
      { namePattern: 'CIS Controls Implementation Group 1 (IG1)', key: 'cisIG1' as keyof FrameworkCounts },
      { namePattern: 'CIS Controls Implementation Group 2 (IG2)', key: 'cisIG2' as keyof FrameworkCounts },
      { namePattern: 'CIS Controls Implementation Group 3 (IG3)', key: 'cisIG3' as keyof FrameworkCounts },
      { namePattern: 'GDPR', key: 'gdpr' as keyof FrameworkCounts },
      { namePattern: 'NIS2 Directive', key: 'nis2' as keyof FrameworkCounts }
    ];

    for (const framework of frameworks) {
      try {
        // First get the standard ID
        const { data: standard, error: standardError } = await supabase
          .from('standards_library')
          .select('id')
          .eq('name', framework.namePattern)
          .eq('is_active', true)
          .single();

        if (standardError || !standard) {
          console.warn(`Standard not found: ${framework.namePattern}`);
          continue;
        }

        // Then count requirements for this standard
        const { count, error: countError } = await supabase
          .from('requirements_library')
          .select('*', { count: 'exact', head: true })
          .eq('standard_id', standard.id);

        if (countError) {
          console.error(`Error counting requirements for ${framework.namePattern}:`, countError);
          continue;
        }

        counts[framework.key] = count || 0;
      } catch (error) {
        console.error(`Error fetching count for ${framework.namePattern}:`, error);
      }
    }

    return counts;
  }

  private getFallbackCounts(): FrameworkCounts {
    // These are the expected counts based on official standards
    return {
      iso27001: 24,  // ISO 27001:2022 requirements in database
      iso27002: 93,  // ISO 27002:2022 has 93 controls
      cisIG1: 56,    // CIS IG1 safeguards in database  
      cisIG2: 130,   // CIS IG2 safeguards in database
      cisIG3: 153,   // CIS IG3 safeguards in database
      gdpr: 40,      // GDPR articles in database
      nis2: 51       // NIS2 articles + industry-specific requirements in database
    };
  }

  // Method to get CIS Controls count based on IG level
  getCISControlsCount(igLevel: 'ig1' | 'ig2' | 'ig3' | null): number {
    if (!this.cachedCounts) {
      const fallback = this.getFallbackCounts();
      switch (igLevel) {
        case 'ig1': return fallback.cisIG1;
        case 'ig2': return fallback.cisIG2;
        case 'ig3': return fallback.cisIG3;
        default: return fallback.cisIG3;
      }
    }

    switch (igLevel) {
      case 'ig1': return this.cachedCounts.cisIG1;
      case 'ig2': return this.cachedCounts.cisIG2;
      case 'ig3': return this.cachedCounts.cisIG3;
      default: return this.cachedCounts.cisIG3;
    }
  }

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    this.cachedCounts = null;
    this.lastFetchTime = 0;
  }
}

export const frameworkCountService = FrameworkCountService.getInstance();