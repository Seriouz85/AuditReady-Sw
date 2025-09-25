/**
 * Framework ID Mapper
 * Maps framework selection to database standard IDs
 */

import { supabase } from '@/lib/supabase';

interface SelectedFrameworks {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

export class FrameworkIdMapper {
  private static frameworkNameMap: Record<string, string[]> = {
    iso27001: ['ISO/IEC 27001', 'ISO 27001', 'ISO27001'],
    iso27002: ['ISO/IEC 27002', 'ISO 27002', 'ISO27002'],
    cisControls: ['CIS Controls', 'CIS Critical Security Controls'],
    gdpr: ['GDPR', 'General Data Protection Regulation'],
    nis2: ['NIS2', 'NIS 2', 'Network and Information Security Directive'],
    dora: ['DORA', 'Digital Operational Resilience Act']
  };

  static async getFrameworkIds(selectedFrameworks: SelectedFrameworks): Promise<string[]> {
    const frameworkIds: string[] = [];
    
    try {
      // Get all standards from database
      const { data: standards, error } = await supabase
        .from('standards')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching standards:', error);
        // Fallback to standards_library table
        const { data: standardsLibrary } = await supabase
          .from('standards_library')
          .select('id, name');
        
        if (standardsLibrary) {
          return this.mapFrameworksToIds(selectedFrameworks, standardsLibrary);
        }
        return [];
      }

      return this.mapFrameworksToIds(selectedFrameworks, standards || []);
    } catch (error) {
      console.error('Error in getFrameworkIds:', error);
      return [];
    }
  }

  private static mapFrameworksToIds(
    selectedFrameworks: SelectedFrameworks, 
    standards: { id: string; name: string }[]
  ): string[] {
    const frameworkIds: string[] = [];

    Object.entries(selectedFrameworks).forEach(([key, value]) => {
      if (value && key !== 'cisControls') {
        // For boolean frameworks
        const nameVariants = this.frameworkNameMap[key] || [];
        const standard = standards.find(s => 
          nameVariants.some(variant => 
            s.name.toLowerCase().includes(variant.toLowerCase())
          )
        );
        if (standard) {
          frameworkIds.push(standard.id);
        }
      } else if (key === 'cisControls' && value) {
        // For CIS Controls (has levels)
        const nameVariants = this.frameworkNameMap.cisControls || [];
        const standard = standards.find(s => 
          nameVariants.some(variant => 
            s.name.toLowerCase().includes(variant.toLowerCase())
          )
        );
        if (standard) {
          frameworkIds.push(standard.id);
        }
      }
    });

    console.log('🗂️ Mapped frameworks to IDs:', frameworkIds);
    return frameworkIds;
  }

  // Fallback method for when database is empty - use predictable UUIDs
  static getFallbackFrameworkIds(selectedFrameworks: SelectedFrameworks): string[] {
    const fallbackIds: Record<string, string> = {
      iso27001: '11111111-1111-1111-1111-111111111111',
      iso27002: '22222222-2222-2222-2222-222222222222',
      cisControls: '33333333-3333-3333-3333-333333333333',
      gdpr: '44444444-4444-4444-4444-444444444444',
      nis2: '55555555-5555-5555-5555-555555555555',
      dora: '66666666-6666-6666-6666-666666666666'
    };

    const frameworkIds: string[] = [];

    Object.entries(selectedFrameworks).forEach(([key, value]) => {
      if (value) {
        const fallbackId = fallbackIds[key];
        if (fallbackId) {
          frameworkIds.push(fallbackId);
        }
      }
    });

    console.log('🔄 Using fallback framework IDs:', frameworkIds);
    return frameworkIds;
  }
}

export const frameworkIdMapper = new FrameworkIdMapper();