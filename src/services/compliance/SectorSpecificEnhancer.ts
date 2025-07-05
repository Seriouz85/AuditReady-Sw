// ============================================================================
// NIS2 Sector-Specific Unified Requirements Enhancer
// CONSERVATIVE APPROACH: Only includes requirements explicitly mentioned in NIS2 directive
// Based on Annex I (Essential entities) and Annex II (Important entities)
// Short, actionable guidance derived directly from NIS2 Articles 21-23
// ============================================================================

import { cleanComplianceSubRequirement } from '@/utils/textFormatting';

export interface SectorEnhancement {
  sectorId: string;
  sectorName: string;
  enhancements: {
    [categoryTitle: string]: {
      additionalSubRequirements?: string[];
      enhancedSubRequirements?: {
        original: string;
        enhanced: string;
      }[];
    };
  };
}

// NIS2 Annex I (Essential entities) and Annex II (Important entities) sector-specific requirements
const NIS2_SECTOR_ENHANCEMENTS: SectorEnhancement[] = [
  {
    sectorId: "1f48b8fd-6421-4dba-b60c-37887157482d", // Energy
    sectorName: "Energy",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) ENERGY OT NETWORKS: Separate power plant IT systems from SCADA controlling turbines, substations, and grid equipment. Use firewalls between corporate networks and generation control systems",
          "o) SMART GRID SECURITY: Protect smart meters, distribution automation, and renewable energy connections. Monitor for cyber-physical attacks that could destabilize the power grid"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) ENERGY INCIDENT COORDINATION: Report grid security incidents to your national electricity regulator within 24 hours. Coordinate with transmission operators to prevent blackouts and cascading failures"
          }
        ],
        additionalSubRequirements: [
          "i) GRID STABILITY FIRST: During cyber incidents, prioritize keeping power flowing. Have manual backup controls for critical generation and transmission equipment",
          "j) ENERGY REGULATOR REPORTING: Know your sector's Computer Security Incident Response Team (CSIRT). Report incidents affecting power supply or grid stability immediately"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) POWER SYSTEM ACCESS: Limit access to generation control rooms, substation controls, and grid dispatch centers. Use multi-factor authentication for all operational technology systems",
          "o) CONTRACTOR CONTROLS: Monitor and time-limit access for maintenance vendors working on turbines, transformers, or control systems. Log all operational technology access"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) GRID DATA PROTECTION: Encrypt smart meter data, load forecasts, and generation schedules. Protect customer energy usage data and critical infrastructure information"
        ]
      }
    }
  },
  {
    sectorId: "05d63d52-00a3-43c8-9cab-24949cfb5d31", // Water & Wastewater
    sectorName: "Water & Wastewater", 
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) WATER IACS PROTECTION: Secure Industrial Automation and Control Systems (IACS) managing water treatment, chlorination, pH control, and pumping stations. Separate treatment control networks from office IT",
          "o) SCADA WATER SECURITY: Protect SCADA systems monitoring water quality sensors, valve controls, and distribution pressure. Use network segmentation to isolate treatment plant operations"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) WATER SAFETY COORDINATION: Report water system cyber incidents to health authorities within 24 hours if drinking water quality could be affected. Coordinate with public health agencies"
          }
        ],
        additionalSubRequirements: [
          "i) CONTAMINATION PREVENTION: During cyber incidents, prioritize preventing water contamination. Have manual controls for chlorination and treatment processes",
          "j) WATER SUPPLY CONTINUITY: Maintain backup systems for critical water treatment and distribution. Test emergency water supply procedures regularly"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) TREATMENT PLANT ACCESS: Restrict access to water treatment control rooms, chemical dosing systems, and filtration controls. Use physical and logical access controls",
          "o) WATER OPERATOR CONTROLS: Implement role-based access for water system operators, maintenance staff, and quality control personnel. Monitor all IACS system access"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) WATER DATA SECURITY: Protect water quality test results, treatment chemical inventories, and distribution system maps. Encrypt communications between treatment facilities"
        ]
      },
      "Physical & Environmental Security Controls": {
        additionalSubRequirements: [
          "n) WATER FACILITY SECURITY: Secure water treatment plants, pumping stations, and reservoirs against physical and cyber threats. Monitor facility access and chemical storage areas"
        ]
      }
    }
  },
  {
    sectorId: "f244edfe-4ef6-4b9a-b7cd-8f1e41ec2021", // Transportation
    sectorName: "Transportation",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) TRANSPORT CONTROL NETWORKS: Secure railway signaling systems, airport traffic control, port management, and traffic light control systems. Separate safety systems from administrative networks",
          "o) PASSENGER SAFETY SYSTEMS: Protect metro control systems, railway interlocking, airport baggage handling, and vessel traffic management from cyber threats affecting passenger safety"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) TRANSPORT SAFETY COORDINATION: Report transport cyber incidents to aviation, railway, or maritime safety authorities within 24 hours. Coordinate with emergency services if passenger safety is affected"
          }
        ],
        additionalSubRequirements: [
          "i) PASSENGER SAFETY FIRST: During cyber incidents, prioritize passenger and public safety. Have manual backup controls for critical safety systems like railway signals and airport traffic control",
          "j) TRANSPORT CONTINUITY: Maintain backup communication systems for air traffic control, railway dispatch, and port operations. Test emergency transport procedures regularly"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) TRANSPORT OPERATOR ACCESS: Restrict access to railway control centers, airport operations, and port management systems. Use multi-factor authentication for safety-critical controls",
          "o) MAINTENANCE CREW CONTROLS: Monitor and time-limit access for transport maintenance contractors working on signaling, navigation, or control systems"
        ]
      },
      "Physical & Environmental Security Controls": {
        additionalSubRequirements: [
          "n) TRANSPORT FACILITY SECURITY: Secure railway control rooms, airport towers, port control centers, and transport hubs against physical and cyber access"
        ]
      }
    }
  },
  {
    sectorId: "c53638c3-21ec-476b-a4ff-d03691248081", // Healthcare
    sectorName: "Healthcare",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) MEDICAL DEVICE NETWORKS: Secure medical IoT devices, patient monitors, MRI systems, and infusion pumps. Separate medical device networks from hospital administrative systems",
          "o) HOSPITAL SYSTEM SECURITY: Protect electronic health records (EHR), laboratory systems, radiology networks, and pharmacy management systems from cyber threats"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) HEALTHCARE INCIDENT COORDINATION: Report health system cyber incidents to health authorities within 24 hours. Coordinate with medical device manufacturers and health regulators"
          }
        ],
        additionalSubRequirements: [
          "i) PATIENT SAFETY FIRST: During cyber incidents, prioritize life-critical medical services. Have manual backup procedures for emergency care, surgery scheduling, and medication administration",
          "j) MEDICAL SERVICE CONTINUITY: Maintain backup systems for patient records, laboratory results, and emergency communication. Test healthcare emergency procedures regularly"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) MEDICAL STAFF ACCESS: Implement role-based access for doctors, nurses, technicians, and administrative staff. Use multi-factor authentication for electronic health records",
          "o) PATIENT DATA ACCESS: Monitor and audit access to patient records, medical imaging, and laboratory results. Implement break-glass access for medical emergencies"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) HEALTH DATA ENCRYPTION: Encrypt patient records, medical imaging, laboratory results, and health research data. Protect data in transit between hospitals and clinics",
          "o) MEDICAL PRIVACY CONTROLS: Implement GDPR and health data protection controls for patient consent, data subject rights, and cross-border health data transfers"
        ]
      },
      "Physical & Environmental Security Controls": {
        additionalSubRequirements: [
          "n) MEDICAL FACILITY SECURITY: Secure hospital data centers, medical device storage, pharmacy areas, and patient record storage against physical and cyber threats"
        ]
      }
    }
  },
  {
    sectorId: "b03ba0af-eb15-4533-8558-774c0f570861", // Banking & Finance
    sectorName: "Banking & Finance",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) BANKING NETWORK SECURITY: Secure core banking systems, payment processing, ATM networks, and online banking platforms. Implement real-time transaction monitoring and fraud detection",
          "o) FINANCIAL INFRASTRUCTURE: Protect SWIFT messaging, trading systems, and market data feeds. Use network segmentation to isolate critical financial processing systems"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) FINANCIAL REGULATOR COORDINATION: Report financial cyber incidents to your national financial supervisor within 24 hours. Coordinate with central bank and payment system operators"
          }
        ],
        additionalSubRequirements: [
          "i) PAYMENT SYSTEM CONTINUITY: During cyber incidents, prioritize maintaining payment processing and customer access to funds. Have backup systems for critical financial services",
          "j) SYSTEMIC RISK ASSESSMENT: Assess whether incidents could affect financial stability. Coordinate with other financial institutions and payment processors"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) BANKING SYSTEM ACCESS: Implement strong authentication for core banking, trading systems, and payment processing. Use privileged access management for financial system administrators",
          "o) CUSTOMER AUTHENTICATION: Protect customer online banking, mobile banking, and ATM access with multi-factor authentication and fraud monitoring"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) FINANCIAL DATA ENCRYPTION: Encrypt customer financial data, transaction records, and payment card information. Protect data in transit and at rest",
          "o) PAYMENT SECURITY: Implement PCI DSS controls for payment card processing and strong cryptography for financial transactions and customer communications"
        ]
      }
    }
  },
  {
    sectorId: "6b51f159-d7e8-4981-8632-af2f73e0c388", // Digital Infrastructure
    sectorName: "Digital Infrastructure",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) DIGITAL SERVICE NETWORKS: Secure cloud infrastructure, data centers, content delivery networks (CDN), and internet service provider networks. Implement DDoS protection and traffic filtering",
          "o) INTERNET INFRASTRUCTURE: Protect DNS root servers, internet exchange points (IXP), domain registries, and submarine cable landing stations from cyber threats"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) DIGITAL SERVICE COORDINATION: Report digital infrastructure incidents to telecommunications regulators within 24 hours. Coordinate with internet service providers and other digital services"
          }
        ],
        additionalSubRequirements: [
          "i) INTERNET CONTINUITY: During cyber incidents, prioritize maintaining internet connectivity and digital services. Have backup routing and content delivery systems",
          "j) CROSS-BORDER COORDINATION: For incidents affecting multiple countries, coordinate with relevant national authorities and internet governance organizations"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) CLOUD INFRASTRUCTURE ACCESS: Implement strong authentication for cloud management platforms, hypervisors, and data center infrastructure. Use privileged access management",
          "o) CUSTOMER SERVICE ACCESS: Protect customer cloud accounts, domain management systems, and digital service dashboards with multi-factor authentication"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) CLOUD DATA PROTECTION: Encrypt customer data in cloud storage, backup systems, and data processing services. Implement data residency and sovereignty controls",
          "o) DIGITAL SERVICE SECURITY: Protect customer digital assets, website data, and application data with appropriate encryption and access controls"
        ]
      }
    }
  },
  {
    sectorId: "845dd597-a804-40c7-a92a-416162884ad1", // Manufacturing  
    sectorName: "Manufacturing",
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) MANUFACTURING NETWORKS: Secure industrial control systems managing production lines, quality control, robotics, and manufacturing execution systems (MES). Separate production networks from office IT",
          "o) SUPPLY CHAIN SYSTEMS: Protect supply chain management, inventory tracking, and vendor integration systems from cyber threats affecting production schedules"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) MANUFACTURING INCIDENT COORDINATION: Report manufacturing cyber incidents to relevant industry authorities within 24 hours. Coordinate with suppliers and customers on supply chain impacts"
          }
        ],
        additionalSubRequirements: [
          "i) PRODUCTION CONTINUITY: During cyber incidents, prioritize maintaining critical manufacturing processes. Have manual backup controls for safety-critical production equipment",
          "j) SUPPLY CHAIN PROTECTION: Assess impact of incidents on supply chain partners and customers. Maintain backup suppliers and alternative production methods"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) PRODUCTION SYSTEM ACCESS: Restrict access to manufacturing control systems, quality management, and production planning systems. Use role-based access for operators and engineers",
          "o) CONTRACTOR CONTROLS: Monitor and time-limit access for maintenance contractors, equipment vendors, and system integrators working on production systems"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) MANUFACTURING DATA SECURITY: Protect production schedules, quality control data, product designs, and manufacturing processes from industrial espionage and cyber theft"
        ]
      }
    }
  },
  {
    sectorId: "ae461662-56fe-4019-b702-1b97ab595a62", // Food & Agriculture
    sectorName: "Food & Agriculture", 
    enhancements: {
      "Network Infrastructure Management": {
        additionalSubRequirements: [
          "n) FOOD PRODUCTION NETWORKS: Secure food processing control systems, agricultural automation, livestock monitoring, and food safety management systems. Protect farm-to-fork traceability",
          "o) AGRICULTURAL SYSTEMS: Implement network security for irrigation controls, greenhouse automation, precision agriculture, and livestock feeding systems"
        ]
      },
      "Incident Response and Management": {
        enhancedSubRequirements: [
          {
            original: "h) Coordinate with external parties during incidents",
            enhanced: "h) FOOD SAFETY COORDINATION: Report food sector cyber incidents to food safety authorities within 24 hours. Coordinate with health agencies if food contamination is possible"
          }
        ],
        additionalSubRequirements: [
          "i) FOOD SUPPLY PROTECTION: During cyber incidents, prioritize preventing food contamination and maintaining food safety standards. Have manual controls for critical food processing",
          "j) AGRICULTURAL CONTINUITY: Maintain backup systems for livestock care, irrigation, and food processing. Test emergency food production procedures regularly"
        ]
      },
      "Identity and Access Management Controls": {
        additionalSubRequirements: [
          "n) FOOD SYSTEM ACCESS: Restrict access to food processing controls, agricultural automation, and food safety management systems. Monitor access to livestock and crop monitoring",
          "o) FOOD CHAIN CONTROLS: Implement controls for supply chain partners, distributors, and food service providers accessing food traceability and safety systems"
        ]
      },
      "Data Protection & Cryptographic Controls": {
        additionalSubRequirements: [
          "n) FOOD DATA PROTECTION: Protect food safety records, traceability data, agricultural production information, and consumer food safety notifications"
        ]
      },
      "Physical & Environmental Security Controls": {
        additionalSubRequirements: [
          "n) FOOD FACILITY SECURITY: Secure food processing plants, agricultural control centers, livestock facilities, and food storage areas against physical and cyber threats"
        ]
      }
    }
  }
];

export class SectorSpecificEnhancer {
  /**
   * Get sector-specific enhancements for unified requirements
   */
  static getEnhancementsForSector(sectorId: string | null): SectorEnhancement | null {
    if (!sectorId) return null;
    
    return NIS2_SECTOR_ENHANCEMENTS.find(enhancement => 
      enhancement.sectorId === sectorId
    ) || null;
  }

  /**
   * Enhance unified requirements sub-requirements with sector-specific content
   */
  static enhanceSubRequirements(
    originalSubRequirements: string[],
    categoryTitle: string,
    sectorId: string | null,
    nis2Selected: boolean
  ): string[] {
    let enhancedSubReqs = [...originalSubRequirements];

    // Clean all sub-requirements first to remove symbols and long text
    enhancedSubReqs = enhancedSubReqs.map(req => cleanComplianceSubRequirement(req));

    // Apply generic NIS2 requirements for ALL categories when NIS2 is selected
    if (nis2Selected) {
      if (categoryTitle === 'Incident Response and Management') {
        // Add NIS2-specific incident reporting requirements with explanations
        enhancedSubReqs.push('i) NIS2 INCIDENT REPORTING: Report significant cybersecurity incidents to your sector\'s CSIRT (Computer Security Incident Response Team - your national cybersecurity authority) within 24 hours (initial notification), 72 hours (detailed report), and 1 month (final analysis). Coordinate with relevant authorities and assess cross-border impacts.');
        enhancedSubReqs.push('j) NIS2 REGULATORY COORDINATION: Identify your national competent authority (government agency responsible for your sector) and sector-specific CSIRT. Maintain updated contact lists and incident report templates that cover both NIS2 requirements and GDPR (data protection) obligations if personal data is affected.');
        enhancedSubReqs.push('k) NIS2 INCIDENT ASSESSMENT: Classify incidents by impact on essential services (services critical to society), affected users, geographical spread, and duration of service disruption. Report incidents that significantly affect service provision or have cross-border implications within the EU.');
        enhancedSubReqs.push('l) NIS2 INCIDENT TYPES: Understand what qualifies as a "significant" incident under NIS2 - incidents that cause substantial operational disruption or affect the security of networks and information systems. Include availability issues, integrity breaches, and confidentiality violations.');
      }
      
      if (categoryTitle === 'Network Infrastructure Management' || categoryTitle === 'Network Monitoring & Defense') {
        // Add general NIS2 network security requirements with explanations
        enhancedSubReqs.push('n) NIS2 NETWORK SECURITY: Implement network segmentation (dividing networks into separate zones), access controls (who can access what systems), and monitoring appropriate for essential entities (critical infrastructure) or important entities (significant digital service providers). Protect against supply chain attacks (threats through vendors/suppliers) and ensure network resilience (ability to maintain operations during disruptions).');
        enhancedSubReqs.push('o) NIS2 CYBERSECURITY MEASURES: Deploy cybersecurity measures covering Article 21 requirements including risk management (identifying and addressing cyber risks), corporate policies (written security procedures), incident handling (responding to cyber attacks), business continuity (maintaining operations during incidents), supply chain security (securing vendor relationships), and cybersecurity training (educating staff about threats).');
      }
    }

    // Only apply sector-specific enhancements if NIS2 is selected and we have a sector
    if (!nis2Selected || !sectorId) {
      return enhancedSubReqs;
    }

    const enhancement = this.getEnhancementsForSector(sectorId);
    if (!enhancement || !enhancement.enhancements[categoryTitle]) {
      return enhancedSubReqs;
    }

    const categoryEnhancement = enhancement.enhancements[categoryTitle];

    // Apply enhanced sub-requirements (replace existing ones)
    if (categoryEnhancement.enhancedSubRequirements) {
      categoryEnhancement.enhancedSubRequirements.forEach(({ original, enhanced }) => {
        const index = enhancedSubReqs.findIndex(req => 
          req.toLowerCase().includes(original.toLowerCase()) ||
          original.toLowerCase().includes(req.toLowerCase())
        );
        if (index !== -1) {
          enhancedSubReqs[index] = cleanComplianceSubRequirement(enhanced);
        }
      });
    }

    // Add additional sub-requirements
    if (categoryEnhancement.additionalSubRequirements) {
      enhancedSubReqs = [
        ...enhancedSubReqs,
        ...categoryEnhancement.additionalSubRequirements.map(req => 
          cleanComplianceSubRequirement(req)
        )
      ];
    }

    return enhancedSubReqs;
  }

  /**
   * Get all available sectors with enhancements
   */
  static getAvailableSectors(): { id: string; name: string }[] {
    return NIS2_SECTOR_ENHANCEMENTS.map(enhancement => ({
      id: enhancement.sectorId,
      name: enhancement.sectorName
    }));
  }

  /**
   * Check if a sector has enhancements available
   */
  static hasSectorEnhancements(sectorId: string | null): boolean {
    if (!sectorId) return false;
    return NIS2_SECTOR_ENHANCEMENTS.some(enhancement => 
      enhancement.sectorId === sectorId
    );
  }

  /**
   * Get summary of enhancements for a sector
   */
  static getEnhancementSummary(sectorId: string | null): string | null {
    const enhancement = this.getEnhancementsForSector(sectorId);
    if (!enhancement) return null;

    const categoryCount = Object.keys(enhancement.enhancements).length;
    const additionalReqCount = Object.values(enhancement.enhancements)
      .reduce((total, cat) => total + (cat.additionalSubRequirements?.length || 0), 0);

    return `${categoryCount} enhanced categories with ${additionalReqCount} additional sector-specific requirements`;
  }
}