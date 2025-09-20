// ============================================================================
// NIS2 Entity Classification Service
// Implements Essential vs Important entity tiered requirements
// Based on NIS2 Directive Annex I (Essential) and Annex II (Important)
// ============================================================================

export type NIS2EntityType = 'essential' | 'important';

export interface NIS2EntityClassification {
  sectorId: string;
  sectorName: string;
  entityType: NIS2EntityType;
  annexReference: 'Annex I' | 'Annex II';
  description: string;
  reportingTimeline: {
    initialNotification: number; // hours
    detailedReport: number; // hours
  };
  requirementIntensity: 'high' | 'medium';
  supervisionLevel: 'strict' | 'standard';
}

// NIS2 Directive entity classifications with exact sector mappings
export const NIS2_ENTITY_CLASSIFICATIONS: NIS2EntityClassification[] = [
  // ANNEX I - ESSENTIAL ENTITIES (Stricter requirements)
  {
    sectorId: "1f48b8fd-6421-4dba-b60c-37887157482d",
    sectorName: "Energy",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Electricity, oil, gas and hydrogen undertakings - Essential entities with critical infrastructure status',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },
  {
    sectorId: "05d63d52-00a3-43c8-9cab-24949cfb5d31",
    sectorName: "Water & Wastewater",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Water supply and distribution, wastewater collection and treatment - Essential entities affecting public health',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },
  {
    sectorId: "f244edfe-4ef6-4b9a-b7cd-8f1e41ec2021",
    sectorName: "Transportation",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Air, rail, water and road transport - Essential entities critical for societal and economic activities',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },
  {
    sectorId: "c53638c3-21ec-476b-a4ff-d03691248081",
    sectorName: "Healthcare",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Healthcare providers including hospitals and private clinics - Essential entities critical for public health',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },
  {
    sectorId: "b03ba0af-eb15-4533-8558-774c0f570861",
    sectorName: "Banking & Finance",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Banking, financial market infrastructures and credit institutions - Essential entities for economic stability',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },
  {
    sectorId: "6b51f159-d7e8-4981-8632-af2f73e0c388",
    sectorName: "Digital Infrastructure",
    entityType: 'essential',
    annexReference: 'Annex I',
    description: 'Internet exchange points, DNS service providers, TLD name registries, cloud computing services - Essential digital infrastructure',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'high',
    supervisionLevel: 'strict'
  },

  // ANNEX II - IMPORTANT ENTITIES (Standard requirements)
  {
    sectorId: "845dd597-a804-40c7-a92a-416162884ad1",
    sectorName: "Manufacturing",
    entityType: 'important',
    annexReference: 'Annex II',
    description: 'Manufacturing of medical devices, computer equipment, automotive, and other critical manufacturing - Important entities',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'medium',
    supervisionLevel: 'standard'
  },
  {
    sectorId: "ae461662-56fe-4019-b702-1b97ab595a62",
    sectorName: "Food & Agriculture",
    entityType: 'important',
    annexReference: 'Annex II',
    description: 'Food production, processing and distribution - Important entities for food security',
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    },
    requirementIntensity: 'medium',
    supervisionLevel: 'standard'
  }
];

export class NIS2EntityClassificationService {
  /**
   * Get entity classification for a sector
   */
  static getEntityClassification(sectorId: string | null): NIS2EntityClassification | null {
    if (!sectorId) return null;
    
    return NIS2_ENTITY_CLASSIFICATIONS.find(classification => 
      classification.sectorId === sectorId
    ) || null;
  }

  /**
   * Check if sector is an Essential Entity (Annex I)
   */
  static isEssentialEntity(sectorId: string | null): boolean {
    const classification = this.getEntityClassification(sectorId);
    return classification?.entityType === 'essential';
  }

  /**
   * Check if sector is an Important Entity (Annex II)
   */
  static isImportantEntity(sectorId: string | null): boolean {
    const classification = this.getEntityClassification(sectorId);
    return classification?.entityType === 'important';
  }

  /**
   * Get requirement intensity multiplier based on entity type
   * Essential entities get more stringent requirements
   */
  static getRequirementIntensityMultiplier(sectorId: string | null): number {
    const classification = this.getEntityClassification(sectorId);
    if (!classification) return 1.0;
    
    switch (classification.entityType) {
      case 'essential':
        return 1.5; // 50% more stringent requirements
      case 'important':
        return 1.0; // Standard requirements
      default:
        return 1.0;
    }
  }

  /**
   * Get additional requirements for Essential entities
   */
  static getEssentialEntityAdditionalRequirements(): string[] {
    return [
      'Enhanced incident response capabilities with 24/7 monitoring',
      'Mandatory business continuity plans tested every 6 months',
      'Enhanced supply chain cybersecurity requirements',
      'Mandatory cybersecurity risk management review by senior management',
      'Enhanced cyber threat intelligence capabilities',
      'Stricter access control and monitoring requirements'
    ];
  }

  /**
   * Get reporting timeline based on entity type
   */
  static getReportingTimeline(sectorId: string | null): { initialNotification: number; detailedReport: number } {
    const classification = this.getEntityClassification(sectorId);
    if (!classification) {
      return { initialNotification: 24, detailedReport: 72 }; // Default NIS2 timeline
    }
    
    return classification.reportingTimeline;
  }

  /**
   * Get supervision level description
   */
  static getSupervisionLevel(sectorId: string | null): string {
    const classification = this.getEntityClassification(sectorId);
    if (!classification) return 'Standard supervision';
    
    switch (classification.supervisionLevel) {
      case 'strict':
        return 'Enhanced supervision with regular audits and stricter penalties';
      case 'standard':
        return 'Standard supervision with periodic compliance reviews';
      default:
        return 'Standard supervision';
    }
  }

  /**
   * Get all Essential entities (Annex I)
   */
  static getEssentialEntities(): NIS2EntityClassification[] {
    return NIS2_ENTITY_CLASSIFICATIONS.filter(c => c.entityType === 'essential');
  }

  /**
   * Get all Important entities (Annex II)
   */
  static getImportantEntities(): NIS2EntityClassification[] {
    return NIS2_ENTITY_CLASSIFICATIONS.filter(c => c.entityType === 'important');
  }

  /**
   * Get entity type display label
   */
  static getEntityTypeLabel(sectorId: string | null): string {
    const classification = this.getEntityClassification(sectorId);
    if (!classification) return '';
    
    switch (classification.entityType) {
      case 'essential':
        return 'Essential Entity (Annex I)';
      case 'important':
        return 'Important Entity (Annex II)';
      default:
        return '';
    }
  }

  /**
   * Get entity type badge color for UI
   */
  static getEntityTypeBadgeColor(sectorId: string | null): string {
    const classification = this.getEntityClassification(sectorId);
    if (!classification) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    
    switch (classification.entityType) {
      case 'essential':
        return 'bg-red-500/20 text-red-300 border-red-500/30'; // Red for critical/essential
      case 'important':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'; // Orange for important
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  }

  /**
   * Get comprehensive entity information for UI display
   */
  static getEntityInfo(sectorId: string | null): {
    classification: NIS2EntityClassification | null;
    label: string;
    badgeColor: string;
    additionalRequirements: string[];
    supervisionDescription: string;
  } {
    const classification = this.getEntityClassification(sectorId);
    
    return {
      classification,
      label: this.getEntityTypeLabel(sectorId),
      badgeColor: this.getEntityTypeBadgeColor(sectorId),
      additionalRequirements: classification?.entityType === 'essential' 
        ? this.getEssentialEntityAdditionalRequirements() 
        : [],
      supervisionDescription: this.getSupervisionLevel(sectorId)
    };
  }
}