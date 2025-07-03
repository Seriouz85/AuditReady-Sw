import { supabase } from '@/lib/supabase';
import { complianceCacheService } from './ComplianceCacheService';

// Critical compliance details that must be preserved in unified requirements
interface CriticalComplianceDetail {
  framework: string;
  requirementCode: string;
  timeframe: string;
  action: string;
  consequence: string;
  legalBasis: string;
  keywords: string[];
}

export interface EnhancedComplianceMappingData {
  id: string;
  category: string;
  auditReadyUnified: {
    title: string;
    description: string;
    subRequirements: string[];
    criticalDetails: CriticalComplianceDetail[];
    timeframeSummary?: string;
  };
  frameworks: {
    [key: string]: Array<{
      code: string;
      title: string;
      description: string;
      criticalDetails?: string[];
    }>;
  };
}

class EnhancedComplianceUnificationService {
  private criticalDetailPatterns: Map<string, CriticalComplianceDetail[]>;

  constructor() {
    this.criticalDetailPatterns = new Map();
    this.initializeCriticalPatterns();
  }

  /**
   * Initialize patterns for detecting critical compliance details
   */
  private initializeCriticalPatterns() {
    const patterns: CriticalComplianceDetail[] = [
      {
        framework: 'GDPR',
        requirementCode: 'Article 33',
        timeframe: '72 hours',
        action: 'Data breach notification to supervisory authority',
        consequence: 'Administrative fines up to 4% of annual global turnover or €20 million',
        legalBasis: 'GDPR Article 33(1)',
        keywords: ['breach', 'notification', '72', 'hours', 'supervisory', 'authority', 'personal data']
      },
      {
        framework: 'GDPR',
        requirementCode: 'Article 34',
        timeframe: '72 hours (when high risk)',
        action: 'Data breach notification to data subjects',
        consequence: 'Administrative fines and potential lawsuits',
        legalBasis: 'GDPR Article 34(1)',
        keywords: ['breach', 'notification', 'data subjects', 'high risk', 'individual', 'communication']
      },
      {
        framework: 'NIS2',
        requirementCode: 'Article 23',
        timeframe: '24 hours',
        action: 'Early warning notification of significant incidents',
        consequence: 'Administrative fines up to 2% of worldwide annual turnover or €10 million',
        legalBasis: 'NIS2 Directive Article 23(3)',
        keywords: ['incident', 'notification', '24', 'hours', 'early warning', 'significant', 'competent authority', 'CSIRT']
      },
      {
        framework: 'NIS2',
        requirementCode: 'Article 23',
        timeframe: '72 hours',
        action: 'Detailed incident report submission',
        consequence: 'Administrative fines and potential service restrictions',
        legalBasis: 'NIS2 Directive Article 23(4)',
        keywords: ['incident', 'report', '72', 'hours', 'detailed', 'final', 'follow-up']
      },
      {
        framework: 'GDPR',
        requirementCode: 'Article 35',
        timeframe: 'Before processing begins',
        action: 'Data Protection Impact Assessment (DPIA) for high-risk processing',
        consequence: 'Processing may be prohibited by supervisory authority',
        legalBasis: 'GDPR Article 35(1)',
        keywords: ['DPIA', 'impact assessment', 'high risk', 'processing', 'prior consultation']
      },
      {
        framework: 'ISO27001',
        requirementCode: 'A.16.1.5',
        timeframe: 'As soon as possible',
        action: 'Response to information security incidents',
        consequence: 'Certification non-compliance',
        legalBasis: 'ISO/IEC 27001:2022 Annex A.16.1.5',
        keywords: ['incident', 'response', 'information security', 'immediate', 'timely']
      }
    ];

    // Group patterns by framework
    patterns.forEach(pattern => {
      if (!this.criticalDetailPatterns.has(pattern.framework)) {
        this.criticalDetailPatterns.set(pattern.framework, []);
      }
      this.criticalDetailPatterns.get(pattern.framework)!.push(pattern);
    });
  }

  /**
   * Extract critical compliance details from requirement text
   */
  private extractCriticalDetails(
    text: string, 
    framework: string, 
    requirementCode: string
  ): CriticalComplianceDetail[] {
    const details: CriticalComplianceDetail[] = [];
    const lowerText = text.toLowerCase();
    
    // Get patterns for this framework
    const frameworkPatterns = this.criticalDetailPatterns.get(framework.toUpperCase()) || [];
    
    frameworkPatterns.forEach(pattern => {
      const keywordMatches = pattern.keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      
      // If we have significant keyword matches or exact requirement code match
      if (keywordMatches.length >= 3 || 
          requirementCode.toLowerCase().includes(pattern.requirementCode.toLowerCase()) ||
          pattern.requirementCode.toLowerCase().includes(requirementCode.toLowerCase())) {
        details.push(pattern);
      }
    });

    // Extract time-sensitive requirements using regex patterns
    const timePatterns = [
      /(\d+)\s*hours?/gi,
      /(\d+)\s*days?/gi,
      /immediately/gi,
      /without\s+undue\s+delay/gi,
      /as\s+soon\s+as\s+possible/gi,
      /within\s+(\d+)\s*(hours?|days?|weeks?|months?)/gi
    ];

    timePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Create dynamic critical detail for detected timeframes
          details.push({
            framework: framework.toUpperCase(),
            requirementCode,
            timeframe: match,
            action: this.extractActionFromContext(text, match),
            consequence: 'Non-compliance penalties as per framework requirements',
            legalBasis: `${framework.toUpperCase()} ${requirementCode}`,
            keywords: [match.toLowerCase(), 'time-sensitive', 'deadline']
          });
        });
      }
    });

    return details;
  }

  /**
   * Extract action context around timeframe mentions
   */
  private extractActionFromContext(text: string, timeframe: string): string {
    const timeframeIndex = text.toLowerCase().indexOf(timeframe.toLowerCase());
    if (timeframeIndex === -1) return 'Time-sensitive compliance action required';

    // Extract surrounding context (50 characters before and after)
    const start = Math.max(0, timeframeIndex - 50);
    const end = Math.min(text.length, timeframeIndex + timeframe.length + 50);
    const context = text.substring(start, end);

    // Clean up and return meaningful action
    const cleanContext = context.replace(/\s+/g, ' ').trim();
    return cleanContext || 'Time-sensitive compliance action required';
  }

  /**
   * Generate comprehensive timeframe summary for unified requirements
   */
  private generateTimeframeSummary(criticalDetails: CriticalComplianceDetail[]): string {
    if (criticalDetails.length === 0) return '';

    const timeframes = criticalDetails
      .filter(detail => detail.timeframe)
      .map(detail => `${detail.framework} ${detail.requirementCode}: ${detail.timeframe}`)
      .join('; ');

    const urgentTimeframes = criticalDetails
      .filter(detail => {
        const timeframeLower = detail.timeframe.toLowerCase();
        return timeframeLower.includes('hour') || timeframeLower.includes('immediate');
      })
      .sort((a, b) => {
        // Sort by urgency - hours before days, immediate first
        const aHours = a.timeframe.toLowerCase().includes('immediate') ? 0 : 
                     parseInt(a.timeframe.match(/(\d+)/)?.[1] || '999');
        const bHours = b.timeframe.toLowerCase().includes('immediate') ? 0 : 
                     parseInt(b.timeframe.match(/(\d+)/)?.[1] || '999');
        return aHours - bHours;
      });

    if (urgentTimeframes.length > 0) {
      const mostUrgent = urgentTimeframes[0];
      return `⚠️ CRITICAL TIMING: ${mostUrgent.framework} requires action within ${mostUrgent.timeframe}. All timeframes: ${timeframes}`;
    }

    return `📅 TIMING REQUIREMENTS: ${timeframes}`;
  }

  /**
   * Enhanced unified requirements with detailed time-sensitive compliance preservation
   */
  async getEnhancedComplianceMappingData(
    selectedFrameworks: Record<string, boolean | string>
  ): Promise<EnhancedComplianceMappingData[]> {
    try {
      const frameworkCodes = Object.entries(selectedFrameworks)
        .filter(([_, selected]) => selected !== false && selected !== null)
        .map(([code]) => code);

      // Get unified categories and requirements
      const { data: categories, error: catError } = await supabase
        .from('unified_compliance_categories')
        .select(`
          id,
          name,
          description,
          sort_order
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (catError) throw catError;

      const { data: unifiedRequirements, error: reqError } = await supabase
        .from('unified_requirements')
        .select(`
          id,
          category_id,
          title,
          description,
          sub_requirements,
          sort_order
        `)
        .order('sort_order');

      if (reqError) throw reqError;

      // Get detailed mappings with full requirement information
      const { data: mappings, error: mappingError } = await supabase
        .from('unified_requirement_mappings')
        .select(`
          unified_requirement_id,
          requirement:requirements_library(
            id,
            control_id,
            title,
            description,
            official_description,
            standard:standards_library(
              id,
              name,
              code
            )
          )
        `);

      if (mappingError) throw mappingError;

      const result: EnhancedComplianceMappingData[] = [];

      for (const category of categories || []) {
        const categoryRequirements = (unifiedRequirements || [])
          .filter(req => req.category_id === category.id);

        for (const unifiedReq of categoryRequirements) {
          // Get all framework requirements mapped to this unified requirement
          const reqMappings = (mappings || [])
            .filter(m => m.unified_requirement_id === unifiedReq.id)
            .filter(m => m.requirement?.standard);

          const frameworkGroups: Record<string, Array<{
            code: string;
            title: string;
            description: string;
            criticalDetails?: string[];
          }>> = {};

          const allCriticalDetails: CriticalComplianceDetail[] = [];

          // Process each mapped requirement
          reqMappings.forEach(mapping => {
            if (!mapping.requirement) return;

            const req = mapping.requirement;
            const standardCode = req.standard.code.toLowerCase();
            
            // Check if this framework is selected
            if (!frameworkCodes.includes(standardCode)) return;

            // Extract critical details from this requirement
            const criticalDetails = this.extractCriticalDetails(
              `${req.title} ${req.description || ''} ${req.official_description || ''}`,
              req.standard.name,
              req.control_id
            );

            allCriticalDetails.push(...criticalDetails);

            // Initialize framework group if needed
            if (!frameworkGroups[standardCode]) {
              frameworkGroups[standardCode] = [];
            }

            // Add requirement with critical details
            frameworkGroups[standardCode].push({
              code: req.control_id,
              title: req.title,
              description: req.official_description || req.description || '',
              criticalDetails: criticalDetails.map(detail => 
                `${detail.timeframe}: ${detail.action}`
              ).filter(Boolean)
            });
          });

          // Enhanced sub-requirements with critical details integration
          const enhancedSubRequirements = [...(unifiedReq.sub_requirements || [])];
          
          // Add time-sensitive requirements that might be missing
          const timeSensitiveDetails = allCriticalDetails.filter(detail => 
            detail.timeframe && (
              detail.timeframe.includes('hour') || 
              detail.timeframe.includes('immediate') ||
              detail.timeframe.includes('without undue delay')
            )
          );

          timeSensitiveDetails.forEach(detail => {
            const timeSpecificReq = `CRITICAL TIMING (${detail.framework} ${detail.requirementCode}): ${detail.action} must be completed within ${detail.timeframe}. Non-compliance may result in ${detail.consequence.toLowerCase()}.`;
            
            // Only add if not already covered in existing sub-requirements
            const isAlreadyCovered = enhancedSubRequirements.some(subReq => 
              subReq.toLowerCase().includes(detail.timeframe.toLowerCase()) ||
              subReq.toLowerCase().includes(detail.requirementCode.toLowerCase())
            );

            if (!isAlreadyCovered) {
              enhancedSubRequirements.unshift(timeSpecificReq); // Add at beginning for visibility
            }
          });

          // Generate comprehensive description that includes critical details
          let enhancedDescription = unifiedReq.description;
          
          if (allCriticalDetails.length > 0) {
            const frameworksWithDetails = [...new Set(allCriticalDetails.map(d => d.framework))];
            enhancedDescription += ` This unified requirement consolidates critical compliance obligations from ${frameworksWithDetails.join(', ')}, ensuring all time-sensitive requirements and regulatory deadlines are met through a single implementation approach.`;
          }

          // Only include if we have framework mappings
          if (Object.keys(frameworkGroups).length > 0) {
            result.push({
              id: unifiedReq.id,
              category: category.name,
              auditReadyUnified: {
                title: unifiedReq.title,
                description: enhancedDescription,
                subRequirements: enhancedSubRequirements,
                criticalDetails: allCriticalDetails,
                timeframeSummary: this.generateTimeframeSummary(allCriticalDetails)
              },
              frameworks: frameworkGroups
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching enhanced compliance mapping data:', error);
      return [];
    }
  }

  /**
   * Validate that critical time-sensitive requirements are preserved
   */
  validateTimeframePreservation(mappingData: EnhancedComplianceMappingData[]): {
    preserved: boolean;
    missingCriticalDetails: string[];
    recommendations: string[];
  } {
    const missingCriticalDetails: string[] = [];
    const recommendations: string[] = [];

    // Check for GDPR 72-hour requirement
    const gdprBreach = mappingData.some(mapping => 
      mapping.auditReadyUnified.criticalDetails.some(detail => 
        detail.framework === 'GDPR' && 
        detail.timeframe.includes('72') &&
        detail.action.toLowerCase().includes('breach')
      ) ||
      mapping.auditReadyUnified.subRequirements.some(subReq =>
        subReq.toLowerCase().includes('72') && 
        subReq.toLowerCase().includes('breach')
      )
    );

    if (!gdprBreach) {
      missingCriticalDetails.push('GDPR Article 33 - 72-hour breach notification requirement');
      recommendations.push('Add explicit GDPR 72-hour breach notification requirement to incident response unified requirements');
    }

    // Check for NIS2 24-hour requirement
    const nis2Early = mappingData.some(mapping => 
      mapping.auditReadyUnified.criticalDetails.some(detail => 
        detail.framework === 'NIS2' && 
        detail.timeframe.includes('24') &&
        detail.action.toLowerCase().includes('incident')
      ) ||
      mapping.auditReadyUnified.subRequirements.some(subReq =>
        subReq.toLowerCase().includes('24') && 
        subReq.toLowerCase().includes('incident')
      )
    );

    if (!nis2Early) {
      missingCriticalDetails.push('NIS2 Article 23 - 24-hour early incident notification requirement');
      recommendations.push('Add explicit NIS2 24-hour early incident notification requirement to incident response unified requirements');
    }

    return {
      preserved: missingCriticalDetails.length === 0,
      missingCriticalDetails,
      recommendations
    };
  }
}

export const enhancedComplianceUnificationService = new EnhancedComplianceUnificationService();

// React Query hook for enhanced compliance mapping
import { useQuery } from '@tanstack/react-query';

export function useEnhancedComplianceMappingData(selectedFrameworks: Record<string, boolean | string>) {
  return useQuery({
    queryKey: ['enhanced-compliance-mapping-data', selectedFrameworks],
    queryFn: () => enhancedComplianceUnificationService.getEnhancedComplianceMappingData(selectedFrameworks),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}