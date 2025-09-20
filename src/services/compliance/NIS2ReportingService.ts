// ============================================================================
// NIS2 Entity-Specific Reporting Service
// Implements different reporting requirements for Essential vs Important entities
// Based on NIS2 Directive Articles 23-24 (Notification obligations)
// ============================================================================

import { NIS2EntityClassificationService, type NIS2EntityClassification } from './NIS2EntityClassificationService';

export interface IncidentSeverity {
  level: 'low' | 'medium' | 'high' | 'critical';
  name: string;
  description: string;
  requiresImmediate: boolean;
  reportingTimeline: {
    initialNotification: number; // hours
    detailedReport: number; // hours
    finalReport?: number; // days
  };
}

export interface NIS2ReportingRequirement {
  entityType: 'essential' | 'important';
  sectorId: string;
  sectorName: string;
  baseTimeline: {
    initialNotification: number;
    detailedReport: number;
  };
  enhancedRequirements: {
    continuousMonitoring: boolean;
    quarterlyReports: boolean;
    annualRiskAssessment: boolean;
    boardReporting: boolean;
    thirdPartyRiskReporting: boolean;
  };
  penaltyFramework: {
    maxAdministrativeFine: string;
    periodicPenalty: string;
    additionalMeasures: string[];
  };
  supervisionIntensity: {
    inspectionFrequency: string;
    certificationRequirements: string[];
    auditFrequency: string;
  };
}

// NIS2 incident severity levels with entity-specific requirements
export const NIS2_INCIDENT_SEVERITIES: IncidentSeverity[] = [
  {
    level: 'critical',
    name: 'Critical Impact',
    description: 'Incidents affecting essential services or with significant cross-border impact',
    requiresImmediate: true,
    reportingTimeline: {
      initialNotification: 1, // Immediate notification for critical incidents
      detailedReport: 24,
      finalReport: 30
    }
  },
  {
    level: 'high',
    name: 'High Impact', 
    description: 'Incidents with substantial service disruption or significant user impact',
    requiresImmediate: false,
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72,
      finalReport: 30
    }
  },
  {
    level: 'medium',
    name: 'Medium Impact',
    description: 'Incidents with moderate service disruption or limited user impact',
    requiresImmediate: false,
    reportingTimeline: {
      initialNotification: 24,
      detailedReport: 72
    }
  },
  {
    level: 'low',
    name: 'Low Impact',
    description: 'Minor incidents with minimal service disruption',
    requiresImmediate: false,
    reportingTimeline: {
      initialNotification: 72,
      detailedReport: 168 // 7 days
    }
  }
];

export class NIS2ReportingService {
  /**
   * Get reporting requirements for a specific entity
   */
  static getReportingRequirements(sectorId: string | null): NIS2ReportingRequirement | null {
    if (!sectorId) return null;
    
    const classification = NIS2EntityClassificationService.getEntityClassification(sectorId);
    if (!classification) return null;

    const isEssential = classification.entityType === 'essential';

    return {
      entityType: classification.entityType,
      sectorId: classification.sectorId,
      sectorName: classification.sectorName,
      baseTimeline: classification.reportingTimeline,
      enhancedRequirements: {
        continuousMonitoring: isEssential,
        quarterlyReports: isEssential,
        annualRiskAssessment: true,
        boardReporting: isEssential,
        thirdPartyRiskReporting: isEssential
      },
      penaltyFramework: isEssential ? {
        maxAdministrativeFine: "€10 million or 2% of annual worldwide turnover",
        periodicPenalty: "€500,000 per day",
        additionalMeasures: [
          "Suspension of data processing operations",
          "Temporary prohibition of business activities",
          "Mandatory cybersecurity audit",
          "Public announcement of non-compliance"
        ]
      } : {
        maxAdministrativeFine: "€7 million or 1.4% of annual worldwide turnover", 
        periodicPenalty: "€100,000 per day",
        additionalMeasures: [
          "Corrective measures order",
          "Enhanced supervision",
          "Mandatory compliance reporting"
        ]
      },
      supervisionIntensity: isEssential ? {
        inspectionFrequency: "Annual on-site inspections with quarterly remote assessments",
        certificationRequirements: [
          "ISO 27001 certification mandatory",
          "Sector-specific security standards",
          "Third-party security audit every 2 years"
        ],
        auditFrequency: "Every 2 years (mandatory) + incident-triggered audits"
      } : {
        inspectionFrequency: "Biennial inspections with annual remote reviews",
        certificationRequirements: [
          "ISO 27001 certification recommended",
          "Self-assessment with independent validation"
        ],
        auditFrequency: "Every 3 years + risk-based assessments"
      }
    };
  }

  /**
   * Get incident reporting timeline based on severity and entity type
   */
  static getIncidentReportingTimeline(
    sectorId: string | null,
    severityLevel: 'low' | 'medium' | 'high' | 'critical'
  ): { initialNotification: number; detailedReport: number; finalReport?: number } {
    const classification = NIS2EntityClassificationService.getEntityClassification(sectorId);
    const severity = NIS2_INCIDENT_SEVERITIES.find(s => s.level === severityLevel);
    
    if (!severity) {
      // Default NIS2 timeline
      return { initialNotification: 24, detailedReport: 72 };
    }

    // Essential entities may have enhanced timelines for critical incidents
    if (classification?.entityType === 'essential' && severityLevel === 'critical') {
      return {
        initialNotification: 1, // Immediate for critical incidents affecting essential entities
        detailedReport: 24,
        finalReport: severity.reportingTimeline.finalReport
      };
    }

    return severity.reportingTimeline;
  }

  /**
   * Get compliance monitoring requirements
   */
  static getComplianceMonitoringRequirements(sectorId: string | null): {
    frequency: string;
    reports: string[];
    assessments: string[];
    audits: string[];
  } {
    const classification = NIS2EntityClassificationService.getEntityClassification(sectorId);
    const isEssential = classification?.entityType === 'essential';

    return {
      frequency: isEssential ? 'Quarterly' : 'Annually',
      reports: isEssential ? [
        'Quarterly cybersecurity posture reports',
        'Monthly incident summaries', 
        'Annual risk assessment updates',
        'Third-party risk assessment reports',
        'Business continuity testing reports'
      ] : [
        'Annual cybersecurity compliance reports',
        'Incident summary reports (as needed)',
        'Risk assessment updates',
        'Self-assessment compliance reports'
      ],
      assessments: isEssential ? [
        'Continuous threat intelligence assessment',
        'Quarterly vulnerability assessments',
        'Annual penetration testing',
        'Supply chain risk assessments',
        'Business impact assessments'
      ] : [
        'Annual vulnerability assessments',
        'Biennial penetration testing',
        'Risk assessments (as needed)',
        'Basic supply chain assessments'
      ],
      audits: isEssential ? [
        'Mandatory annual compliance audits',
        'Technical security audits every 2 years',
        'Incident response capability audits',
        'Third-party vendor security audits'
      ] : [
        'Compliance audits every 3 years',
        'Technical assessments as needed',
        'Self-audit with independent validation'
      ]
    };
  }

  /**
   * Get penalty information for non-compliance
   */
  static getPenaltyInformation(sectorId: string | null): {
    entityType: string;
    maxFine: string;
    dailyPenalty: string;
    additionalMeasures: string[];
    escalationPath: string[];
  } {
    const requirements = this.getReportingRequirements(sectorId);
    if (!requirements) {
      return {
        entityType: 'Unknown',
        maxFine: 'Standard NIS2 penalties apply',
        dailyPenalty: 'As per national implementation',
        additionalMeasures: ['Corrective measures'],
        escalationPath: ['Warning', 'Administrative fine', 'Corrective measures']
      };
    }

    const isEssential = requirements.entityType === 'essential';

    return {
      entityType: isEssential ? 'Essential Entity (Annex I)' : 'Important Entity (Annex II)',
      maxFine: requirements.penaltyFramework.maxAdministrativeFine,
      dailyPenalty: requirements.penaltyFramework.periodicPenalty,
      additionalMeasures: requirements.penaltyFramework.additionalMeasures,
      escalationPath: isEssential ? [
        'Immediate intervention notice',
        'Enhanced supervision order',
        'Administrative fine',
        'Periodic penalty payments',
        'Suspension of operations',
        'Public disclosure of non-compliance'
      ] : [
        'Compliance notice',
        'Corrective measures order',
        'Administrative fine',
        'Enhanced supervision',
        'Public reporting of violations'
      ]
    };
  }

  /**
   * Generate reporting checklist for entity type
   */
  static generateReportingChecklist(sectorId: string | null): {
    immediate: string[];
    within24h: string[];
    within72h: string[];
    ongoing: string[];
  } {
    const classification = NIS2EntityClassificationService.getEntityClassification(sectorId);
    const isEssential = classification?.entityType === 'essential';

    return {
      immediate: isEssential ? [
        'Activate incident response team',
        'Assess impact on essential services',
        'Notify national competent authority (for critical incidents)',
        'Implement containment measures',
        'Document incident timeline',
        'Coordinate with critical infrastructure partners'
      ] : [
        'Activate incident response procedures',
        'Assess service impact',
        'Implement initial containment',
        'Begin incident documentation'
      ],
      within24h: [
        'Submit initial incident notification to competent authority',
        'Notify relevant CSIRTs (Computer Security Incident Response Teams)',
        'Brief senior management/board (Essential entities)',
        'Assess cross-border impact',
        'Coordinate with law enforcement (if criminal activity suspected)',
        'Begin detailed impact assessment'
      ],
      within72h: [
        'Submit detailed incident report',
        'Provide preliminary root cause analysis',
        'Document containment and recovery actions',
        'Assess effectiveness of response measures',
        'Report to additional authorities if required',
        'Begin lessons learned documentation'
      ],
      ongoing: isEssential ? [
        'Continuous monitoring and reporting',
        'Quarterly cybersecurity posture updates',
        'Annual comprehensive risk assessments',
        'Regular board-level security briefings',
        'Third-party vendor risk assessments',
        'Business continuity plan testing and updates',
        'Compliance audit preparation and follow-up'
      ] : [
        'Annual compliance reporting',
        'Regular self-assessments',
        'Risk assessment updates as needed',
        'Incident trend analysis and reporting',
        'Basic compliance monitoring'
      ]
    };
  }

  /**
   * Get supervision and oversight information
   */
  static getSupervisionInfo(sectorId: string | null): {
    authority: string;
    contactInfo: string;
    inspectionSchedule: string;
    reportingPortal: string;
    escalationProcedure: string[];
  } {
    const classification = NIS2EntityClassificationService.getEntityClassification(sectorId);
    const isEssential = classification?.entityType === 'essential';

    return {
      authority: 'National Competent Authority designated under NIS2 Directive',
      contactInfo: 'Contact your national NIS2 competent authority - details available through national cybersecurity agency',
      inspectionSchedule: isEssential 
        ? 'Annual mandatory inspections + quarterly remote assessments'
        : 'Biennial inspections + annual remote reviews',
      reportingPortal: 'National incident reporting portal (established per NIS2 Article 23)',
      escalationProcedure: isEssential ? [
        'Local incident response team',
        'Organization CISO/DPO',
        'Senior management/Board',
        'National competent authority',
        'Relevant CSIRT',
        'ENISA (for cross-border incidents)',
        'Law enforcement (if criminal activity)'
      ] : [
        'Local incident response team',
        'Organization security officer',
        'Management team',
        'National competent authority',
        'Relevant CSIRT (as needed)'
      ]
    };
  }
}