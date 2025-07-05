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
          "n) IEC 62443 POWER SYSTEMS: Apply IEC 62443 industrial cybersecurity standards to power generation and transmission control systems. Implement security level 4 (SL4) for critical safety systems that could cause catastrophic grid failure",
          "o) IEC 62351 COMMUNICATIONS: Secure power system communications using IEC 62351 standards for SCADA protocols, substation automation, and inter-control center communications. Implement authentication and encryption for DNP3, IEC 61850, and ICCP protocols",
          "p) ENERGY OT NETWORKS: Separate power plant IT systems from SCADA controlling turbines, substations, and grid equipment. Use firewalls between corporate networks and generation control systems following IEC 62443 zone/conduit model",
          "q) SMART GRID SECURITY: Protect smart meters, distribution automation, and renewable energy connections. Monitor for cyber-physical attacks that could destabilize the power grid using IEC 62351-7 network security monitoring"
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
          "n) IEC 62443 INDUSTRIAL SECURITY: Implement IEC 62443 cybersecurity standards for water treatment systems. Establish security levels (SL-T) based on consequences: SL2 for distribution monitoring, SL3 for treatment control, SL4 for critical safety systems",
          "o) WATER IACS PROTECTION: Secure Industrial Automation and Control Systems (IACS) managing water treatment, chlorination, pH control, and pumping stations. Separate treatment control networks from office IT using IEC 62443 zone and conduit architecture",
          "p) SCADA NETWORK SEGMENTATION: Implement IEC 62443-3-2 security zones: Level 0 (sensors/actuators), Level 1 (control systems), Level 2 (supervisory control), Level 3 (operations management). Use security conduits between zones with appropriate security controls"
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
          "n) ISO 21434 AUTOMOTIVE SECURITY: Apply ISO 21434 cybersecurity engineering lifecycle for connected vehicles, autonomous systems, and automotive manufacturing. Implement cybersecurity risk assessment, security monitoring, and incident response for vehicular systems",
          "o) RAILWAY SECURITY STANDARDS: Follow EN 50159 safety-related electronic systems for railway applications and IEC 62443 for railway control systems. Secure train control management systems (TCMS), automatic train protection (ATP), and signaling communications",
          "p) TRANSPORT CONTROL NETWORKS: Secure railway signaling systems, airport traffic control, port management, and traffic light control systems. Separate safety systems from administrative networks using defense-in-depth architecture",
          "q) PASSENGER SAFETY SYSTEMS: Protect metro control systems, railway interlocking, airport baggage handling, and vessel traffic management from cyber threats affecting passenger safety. Implement functional safety (IEC 61508) with cybersecurity integration"
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
          "n) IEC 62304 MEDICAL SOFTWARE: Apply IEC 62304 software lifecycle processes for medical devices. Implement cybersecurity controls based on safety classification: Class A (non-safety), Class B (non-life-threatening), Class C (life-threatening)",
          "o) FDA MEDICAL DEVICE SECURITY: Follow FDA cybersecurity guidelines for connected medical devices. Establish device inventory, vulnerability management, secure configuration, and incident response procedures for Class II/III medical devices",
          "p) MEDICAL DEVICE NETWORKS: Secure medical IoT devices, patient monitors, MRI systems, and infusion pumps. Separate medical device networks from hospital administrative systems using network segmentation and device authentication",
          "q) HOSPITAL SYSTEM SECURITY: Protect electronic health records (EHR), laboratory systems, radiology networks, and pharmacy management systems from cyber threats using healthcare-specific security controls"
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
          "n) IEC 62443 MANUFACTURING SECURITY: Implement IEC 62443 industrial automation security standards for production systems. Apply security levels based on impact: SL2 for monitoring systems, SL3 for process control, SL4 for safety-critical manufacturing equipment",
          "o) INDUSTRIAL CONTROL ZONES: Design IEC 62443-3-2 security zones for manufacturing: Level 0 (sensors/actuators), Level 1 (PLCs/controllers), Level 2 (HMI/SCADA), Level 3 (MES/plant operations). Implement security conduits with appropriate authentication and monitoring",
          "p) MANUFACTURING NETWORKS: Secure industrial control systems managing production lines, quality control, robotics, and manufacturing execution systems (MES). Separate production networks from office IT using IEC 62443 zone segmentation",
          "q) SUPPLY CHAIN SYSTEMS: Protect supply chain management, inventory tracking, and vendor integration systems from cyber threats affecting production schedules. Apply security controls for supplier connectivity"
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
   * Integrates sector guidance into existing requirements rather than adding new ones
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

    // Only apply sector-specific enhancements if NIS2 is selected and we have a sector
    if (!nis2Selected || !sectorId) {
      return enhancedSubReqs;
    }

    const enhancement = this.getEnhancementsForSector(sectorId);
    if (!enhancement) {
      return enhancedSubReqs;
    }

    // Apply comprehensive sector-specific integration by enhancing existing requirements
    enhancedSubReqs = this.integrateNetworkSecurityGuidance(enhancedSubReqs, categoryTitle, enhancement.sectorName);
    enhancedSubReqs = this.integrateIncidentResponseGuidance(enhancedSubReqs, categoryTitle, enhancement.sectorName);
    enhancedSubReqs = this.integrateAccessControlGuidance(enhancedSubReqs, categoryTitle, enhancement.sectorName);
    enhancedSubReqs = this.integrateDataProtectionGuidance(enhancedSubReqs, categoryTitle, enhancement.sectorName);
    enhancedSubReqs = this.integratePhysicalSecurityGuidance(enhancedSubReqs, categoryTitle, enhancement.sectorName);

    return enhancedSubReqs;
  }

  /**
   * Integrate network security guidance into existing network-related requirements
   */
  private static integrateNetworkSecurityGuidance(
    subRequirements: string[],
    categoryTitle: string,
    sectorName: string
  ): string[] {
    if (!categoryTitle.toLowerCase().includes('network')) {
      return subRequirements;
    }

    return subRequirements.map(req => {
      // Skip if already enhanced to prevent duplicates
      if (req.includes('(NIS2)') || req.includes('SECTOR FOCUS') || req.includes('SECTOR IMPLEMENTATION')) {
        return req;
      }

      // Enhance network monitoring requirements
      if (req.toLowerCase().includes('network monitoring') || req.toLowerCase().includes('network security')) {
        switch (sectorName) {
          case 'Energy':
            return req + ' - ENERGY SECTOR FOCUS (NIS2): Implement IEC 62443-3-3 network security specifically for power systems. Your SCADA networks controlling turbines, substations, and grid equipment need separate security zones (Level 0: field devices like sensors, Level 1: control systems like PLCs, Level 2: supervisory systems like HMIs, Level 3: operations management). Use specialized industrial firewalls that understand power system protocols (DNP3, IEC 61850, Modbus) and can inspect these communications for anomalies without disrupting real-time operations. Monitor for cyber-physical attacks that could destabilize the power grid - unusual load changes, unauthorized equipment commands, or communication disruptions between control centers.';
          
          case 'Water & Wastewater':
            return req + ' - WATER SECTOR FOCUS (NIS2): Apply IEC 62443 standards to protect water treatment and distribution systems. Your industrial networks managing chlorination, pH control, filtration, and pumping stations require specialized monitoring that understands water treatment processes. Implement network segmentation that separates treatment control systems from office networks - a cyber attack on your treatment controls could potentially contaminate public water supply. Monitor industrial protocols used in water systems (Modbus, DNP3) and watch for unauthorized changes to treatment parameters like chemical dosing levels, flow rates, or quality sensor readings. Consider that any disruption to water treatment could affect public health within hours.';
          
          case 'Healthcare':
            return req + ' - HEALTHCARE SECTOR FOCUS (NIS2): Secure medical device networks and hospital systems with FDA cybersecurity guidelines in mind. Your network monitoring must account for connected medical devices (patient monitors, MRI systems, infusion pumps) that often can\'t be patched frequently due to regulatory requirements. Segment medical device networks from hospital administrative systems, and monitor for unauthorized access to life-critical equipment. Implement network controls that follow IEC 62304 medical software security requirements - categorize devices by safety impact (Class A: non-safety, Class B: non-life-threatening, Class C: life-threatening) and apply appropriate network security controls. Monitor communications between electronic health record (EHR) systems and ensure patient data flows are encrypted and authorized.';
          
          case 'Transportation':
            return req + ' - TRANSPORTATION SECTOR FOCUS (NIS2): Implement network security for transportation control systems following safety standards. Your networks controlling railway signaling, airport traffic management, or port operations must maintain functional safety (IEC 61508) while implementing cybersecurity. For automotive/connected vehicle systems, apply ISO 21434 cybersecurity engineering throughout the vehicle lifecycle. Monitor networks supporting automatic train protection (ATP), railway interlocking systems, or vessel traffic management - any disruption could immediately affect passenger safety. Separate safety-critical control networks from passenger WiFi and administrative systems. For autonomous systems, monitor communications between vehicles and infrastructure (V2X) and ensure authentication of safety-critical commands.';
          
          case 'Manufacturing':
            return req + ' - MANUFACTURING SECTOR FOCUS (NIS2): Secure production networks using IEC 62443 industrial automation security standards. Your manufacturing execution systems (MES), quality control systems, and production line controls need network security that won\'t disrupt just-in-time manufacturing. Implement security zones that protect production equipment from cyber threats while maintaining operational efficiency - Level 0 (sensors and actuators), Level 1 (PLCs and controllers), Level 2 (HMI and SCADA), Level 3 (MES and plant operations). Monitor industrial protocols and watch for unauthorized changes to production parameters, quality settings, or safety interlocks. Consider that production downtime from a cyber incident could cost thousands per minute and affect supply chain partners downstream.';
          
          default:
            return req + ' - NIS2 NETWORK SECURITY (NIS2): Implement network segmentation appropriate for your essential or important entity status, with monitoring that detects both IT and operational technology threats.';
        }
      }

      // Enhance access control requirements
      if (req.toLowerCase().includes('access control') || req.toLowerCase().includes('authentication')) {
        switch (sectorName) {
          case 'Energy':
            return req + ' - ENERGY SECTOR IMPLEMENTATION (NIS2): Control access to power generation and grid control systems with multi-factor authentication appropriate for operational environments. Your control room operators need quick access during emergencies, so implement solutions that balance security with operational speed. Use role-based access (generation operator, transmission operator, system dispatcher, maintenance technician) and ensure emergency override procedures don\'t bypass all security controls. For remote access to substations or generation facilities, implement secure VPNs with time-limited access and comprehensive logging of all operational changes.';
          
          case 'Water & Wastewater':
            return req + ' - WATER SECTOR IMPLEMENTATION (NIS2): Implement access controls for water treatment operators and maintenance staff that account for emergency response needs. Your water quality cannot be compromised during authentication delays, so design multi-factor authentication that works even during power outages or network disruptions. Control access to chemical dosing systems, filtration controls, and distribution pumps with role-based permissions (treatment operator, lab technician, maintenance staff, emergency responder). Implement break-glass access procedures for contamination events while maintaining audit trails of all actions taken.';
          
          case 'Healthcare':
            return req + ' - HEALTHCARE SECTOR IMPLEMENTATION (NIS2): Design access controls that support emergency medical care while protecting patient data. Healthcare workers need immediate access to patient information during life-threatening situations, so implement authentication systems that work during power outages, network failures, or emergency scenarios. Use role-based access (doctor, nurse, technician, pharmacist, administrator) with emergency override capabilities that maintain audit trails. For medical devices, implement access controls appropriate for device capabilities - many medical devices have limited processing power and can\'t support complex authentication schemes.';
          
          case 'Transportation':
            return req + ' - TRANSPORTATION SECTOR IMPLEMENTATION (NIS2): Control access to transportation control systems while ensuring safety operations can continue during authentication system failures. Your railway signal operators, air traffic controllers, or port operators need immediate access during safety emergencies. Implement multi-factor authentication with backup procedures that don\'t compromise passenger safety. Use role-based access for different transportation functions (train dispatcher, signal maintainer, traffic controller, safety officer) and ensure emergency procedures include proper authentication bypass with full audit logging.';
          
          case 'Manufacturing':
            return req + ' - MANUFACTURING SECTOR IMPLEMENTATION (NIS2): Secure manufacturing systems with access controls that don\'t disrupt production schedules. Your production operators need quick access to resolve equipment issues before they affect quality or cause line shutdowns. Implement authentication appropriate for industrial environments (potentially dusty, noisy, with workers wearing gloves) and consider biometric options suitable for factory floors. Use role-based access for different manufacturing functions (operator, quality inspector, maintenance technician, production supervisor) and ensure system lockouts don\'t prevent emergency safety responses.';
          
          default:
            return req + ' - SECTOR-SPECIFIC ACCESS CONTROL (NIS2): Implement access controls appropriate for your operational environment and emergency response requirements.';
        }
      }

      return req;
    });
  }

  /**
   * Integrate incident response guidance into existing incident management requirements
   */
  private static integrateIncidentResponseGuidance(
    subRequirements: string[],
    categoryTitle: string,
    sectorName: string
  ): string[] {
    if (!categoryTitle.toLowerCase().includes('incident')) {
      return subRequirements;
    }

    return subRequirements.map(req => {
      // Skip if already enhanced to prevent duplicates
      if (req.includes('(NIS2)') || req.includes('SECTOR RESPONSE') || req.includes('SECTOR REPORTING')) {
        return req;
      }

      if (req.toLowerCase().includes('incident response') || req.toLowerCase().includes('incident management')) {
        const sectorGuidance = this.getSectorIncidentGuidance(sectorName);
        return req + ` - ${sectorGuidance}`;
      }

      if (req.toLowerCase().includes('external') && req.toLowerCase().includes('coordinate')) {
        const reportingGuidance = this.getSectorReportingGuidance(sectorName);
        return req + ` - ${reportingGuidance}`;
      }

      return req;
    });
  }

  /**
   * Get sector-specific incident response guidance with detailed explanations
   */
  private static getSectorIncidentGuidance(sectorName: string): string {
    switch (sectorName) {
      case 'Energy':
        return 'ENERGY SECTOR RESPONSE (NIS2): During cyber incidents affecting power systems, your primary concern is maintaining grid stability and preventing blackouts. Have manual backup controls ready for critical generation and transmission equipment - if your SCADA systems are compromised, operators need to be able to manually control power flows. Coordinate with your regional transmission organization (RTO) or independent system operator (ISO) to assess grid impact. For incidents affecting renewable energy integration or smart grid systems, consider the potential for cascading failures across interconnected systems. Your incident response team should include electrical engineers who understand power system operations, not just IT security staff.';
      
      case 'Water & Wastewater':
        return 'WATER SECTOR RESPONSE (NIS2): Prioritize preventing water contamination above all other concerns during cyber incidents. If treatment control systems are compromised, immediately implement manual monitoring of chlorination levels, pH, turbidity, and other critical water quality parameters. Have backup laboratory testing capabilities ready in case automated monitoring systems fail. Coordinate with public health authorities if there\'s any possibility of contamination reaching consumers - they may need to issue boil-water advisories or alternative water supply guidance. Your response team should include water treatment operators and public health professionals who understand the health implications of various contamination scenarios.';
      
      case 'Healthcare':
        return 'HEALTHCARE SECTOR RESPONSE (NIS2): Patient safety is your top priority during any cyber incident. If electronic health record (EHR) systems or medical devices are affected, immediately activate manual backup procedures for patient care - paper charts, manual medication verification, backup communication systems. For incidents affecting life-critical equipment (ventilators, patient monitors, infusion pumps), have manual alternatives ready and ensure clinical staff know how to operate them. Coordinate with medical device manufacturers for specialized incident response support - many medical devices require vendor assistance for security incidents due to regulatory constraints on modifications.';
      
      case 'Transportation':
        return 'TRANSPORTATION SECTOR RESPONSE (NIS2): Passenger and public safety must be your immediate priority during transportation cyber incidents. For railway systems, if signaling or train control systems are affected, immediately implement manual train movements with strict safety protocols - this may mean significant service delays, but prevents accidents. For aviation systems, coordinate with air traffic control and have backup communication systems ready. For maritime systems, ensure vessel traffic management can continue manually if automated systems fail. Your incident response team should include transportation safety experts who understand the operational implications of various system failures on passenger safety.';
      
      case 'Manufacturing':
        return 'MANUFACTURING SECTOR RESPONSE (NIS2): Focus on maintaining production safety and preventing equipment damage during cyber incidents. If production control systems are compromised, safely shut down equipment rather than risk damage to machinery or injury to workers. Have procedures ready to continue critical production manually if needed, especially for products that affect other critical infrastructure (pharmaceuticals, food production, energy equipment). Consider the impact on supply chain partners - many just-in-time manufacturing processes can\'t tolerate extended outages. Your response team should include production engineers and safety officers who understand the operational and safety implications of various system failures.';
      
      default:
        return 'SECTOR RESPONSE (NIS2): Implement incident response procedures appropriate for your essential services and operational requirements.';
    }
  }

  /**
   * Get sector-specific regulatory reporting guidance
   */
  private static getSectorReportingGuidance(sectorName: string): string {
    switch (sectorName) {
      case 'Energy':
        return 'ENERGY SECTOR REPORTING (NIS2): Report grid security incidents to your electricity regulator within 24 hours if they could affect power supply reliability. In many regions, you must also notify the regional transmission organization (RTO) or independent system operator (ISO) immediately if the incident affects bulk power system operations. For incidents affecting nuclear facilities, additional NRC reporting may be required. Coordinate with NERC (in North America) or equivalent grid security organizations in your region. Your reports should assess potential for cascading grid failures and impact on essential services that depend on reliable power.';
      
      case 'Water & Wastewater':
        return 'WATER SECTOR REPORTING (NIS2): Report to health authorities within 24 hours if cyber incidents could affect drinking water quality or public health. This includes your local health department, state environmental agency, and potentially the EPA (in the US) or equivalent environmental regulator. If the incident affects interstate water systems or could impact multiple jurisdictions, coordinate with regional water authorities. Your reports should assess potential for contamination, service disruption duration, and affected population size. Include water quality test results and any precautionary measures taken to protect public health.';
      
      case 'Healthcare':
        return 'HEALTHCARE SECTOR REPORTING (NIS2): Report to health authorities if incidents affect patient care delivery or medical device safety. This includes your local health department, medical device manufacturers (who may have FDA reporting obligations), and potentially HHS (in the US) or equivalent health ministry. For incidents affecting medical devices, the device manufacturer may need to report to medical device regulators. If patient data is involved, ensure GDPR breach notification requirements are met. Your reports should assess patient safety impact, affected medical services, and any clinical workarounds implemented.';
      
      case 'Transportation':
        return 'TRANSPORTATION SECTOR REPORTING (NIS2): Report to transportation safety authorities within 24 hours if incidents affect passenger safety or service operations. For aviation, coordinate with aviation authorities (FAA, EASA, etc.). For railway, notify railway safety regulators. For maritime, contact port authorities and maritime safety organizations. If the incident affects international transportation routes, coordinate with relevant foreign authorities. Your reports should assess passenger safety impact, service disruption, and any safety protocols activated in response to the incident.';
      
      case 'Manufacturing':
        return 'MANUFACTURING SECTOR REPORTING (NIS2): Report to relevant industry authorities if incidents affect product safety or supply chain operations. For pharmaceutical manufacturing, coordinate with medical product regulators (FDA, EMA). For food production, notify food safety authorities. For automotive manufacturing, consider NHTSA or equivalent vehicle safety reporting if the incident could affect vehicle safety systems. If you supply other critical infrastructure sectors, notify major customers who may need to implement their own contingency plans.';
      
      default:
        return 'SECTOR REPORTING (NIS2): Coordinate with your sector\'s competent authority and CSIRT as designated under NIS2, ensuring 24-hour initial notification and 72-hour detailed reporting timelines are met.';
    }
  }

  /**
   * Integrate access control guidance into existing identity management requirements
   */
  private static integrateAccessControlGuidance(
    subRequirements: string[],
    categoryTitle: string,
    sectorName: string
  ): string[] {
    if (!categoryTitle.toLowerCase().includes('identity') && !categoryTitle.toLowerCase().includes('access')) {
      return subRequirements;
    }

    // Implementation already handled in integrateNetworkSecurityGuidance for access control requirements
    return subRequirements;
  }

  /**
   * Integrate data protection guidance into existing data security requirements
   */
  private static integrateDataProtectionGuidance(
    subRequirements: string[],
    categoryTitle: string,
    sectorName: string
  ): string[] {
    if (!categoryTitle.toLowerCase().includes('data') && !categoryTitle.toLowerCase().includes('cryptographic')) {
      return subRequirements;
    }

    return subRequirements.map(req => {
      // Skip if already enhanced to prevent duplicates
      if (req.includes('(NIS2)') || req.includes('DATA SECURITY') || req.includes('DATA PROTECTION')) {
        return req;
      }

      if (req.toLowerCase().includes('data protection') || req.toLowerCase().includes('encryption')) {
        switch (sectorName) {
          case 'Energy':
            return req + ' - ENERGY DATA SECURITY (NIS2): Protect smart meter data, load forecasts, generation schedules, and grid topology information. This data could be used by adversaries to plan attacks on power infrastructure. Encrypt communications between control centers, generation facilities, and distribution systems using industrial-grade encryption that meets power system timing requirements. Consider that energy consumption data can reveal sensitive information about industrial processes or personal activities.';
          
          case 'Water & Wastewater':
            return req + ' - WATER DATA SECURITY (NIS2): Protect water quality test results, treatment process data, and distribution system information. Unauthorized access to treatment parameters could enable contamination attacks. Encrypt communications between treatment facilities, pumping stations, and monitoring locations. Protect customer water usage data and ensure treatment chemical inventory information doesn\'t reveal system vulnerabilities to potential attackers.';
          
          case 'Healthcare':
            return req + ' - HEALTHCARE DATA SECURITY (NIS2): Follow HIPAA requirements for patient data while implementing additional protections for medical devices and research systems. Encrypt patient records, medical imaging, laboratory results, and device data both in transit and at rest. Consider that aggregated health data can reveal sensitive population health information. Implement strong encryption for telemedicine communications and ensure medical device data transmission meets FDA cybersecurity guidance requirements.';
          
          case 'Transportation':
            return req + ' - TRANSPORTATION DATA SECURITY (NIS2): Protect passenger information, route planning data, and transportation control system communications. For connected and autonomous vehicles, implement ISO 21434 data protection requirements throughout the vehicle lifecycle. Encrypt communications between vehicles and infrastructure (V2X), and protect traffic management data that could be used to disrupt transportation flows. Consider that transportation data can reveal sensitive information about individual movements and critical infrastructure dependencies.';
          
          case 'Manufacturing':
            return req + ' - MANUFACTURING DATA SECURITY (NIS2): Protect product designs, production processes, quality control data, and supply chain information from industrial espionage. Encrypt communications with suppliers and customers, especially for data sharing about product specifications or delivery schedules. Protect production parameters and quality metrics that could reveal competitive advantages or be used to sabotage production processes. Consider that manufacturing data aggregation could reveal strategic business information to competitors.';
          
          default:
            return req + ' - SECTOR DATA PROTECTION (NIS2): Implement data protection measures appropriate for your sector\'s sensitive information and regulatory requirements.';
        }
      }
      return req;
    });
  }

  /**
   * Integrate physical security guidance into existing physical security requirements
   */
  private static integratePhysicalSecurityGuidance(
    subRequirements: string[],
    categoryTitle: string,
    sectorName: string
  ): string[] {
    if (!categoryTitle.toLowerCase().includes('physical')) {
      return subRequirements;
    }

    return subRequirements.map(req => {
      // Skip if already enhanced to prevent duplicates
      if (req.includes('(NIS2)') || req.includes('PHYSICAL SECURITY')) {
        return req;
      }

      if (req.toLowerCase().includes('physical') && req.toLowerCase().includes('security')) {
        switch (sectorName) {
          case 'Energy':
            return req + ' - ENERGY PHYSICAL SECURITY (NIS2): Secure power generation plants, substations, and transmission facilities against both physical and cyber threats. Implement layered physical security that considers the unique vulnerabilities of energy infrastructure - attackers may target physical infrastructure to cause cyber disruptions or vice versa. Control access to control rooms, switch yards, and generation facilities with security appropriate for critical infrastructure. Consider that physical access to energy systems can enable both immediate operational disruption and longer-term cyber attacks through console access or network connections.';
          
          case 'Water & Wastewater':
            return req + ' - WATER PHYSICAL SECURITY (NIS2): Secure water treatment plants, pumping stations, reservoirs, and distribution infrastructure against physical tampering that could enable contamination or service disruption. Implement security measures that protect both the physical infrastructure and the control systems that manage water treatment processes. Control access to chemical storage areas, treatment equipment, and water quality monitoring systems. Consider that physical access to water systems could enable contamination attacks that affect public health within hours.';
          
          case 'Healthcare':
            return req + ' - HEALTHCARE PHYSICAL SECURITY (NIS2): Secure hospital data centers, medical device storage, pharmacy areas, and patient record storage against physical threats. Healthcare facilities have unique security challenges due to the need for emergency access and the presence of patients and families. Implement security measures that protect sensitive areas while maintaining emergency response capabilities. Control access to medical device networks, medication storage, and patient data systems while ensuring healthcare workers can respond quickly to medical emergencies.';
          
          case 'Transportation':
            return req + ' - TRANSPORTATION PHYSICAL SECURITY (NIS2): Secure transportation control centers, maintenance facilities, and critical infrastructure nodes (airports, ports, rail yards) against physical threats that could disrupt operations or enable cyber attacks. Implement security appropriate for facilities that must maintain 24/7 operations and emergency response capabilities. Control access to signaling equipment, traffic control systems, and vehicle maintenance areas where cyber systems interface with physical transportation infrastructure.';
          
          case 'Manufacturing':
            return req + ' - MANUFACTURING PHYSICAL SECURITY (NIS2): Secure production facilities, quality control laboratories, and design centers against physical threats and industrial espionage. Manufacturing facilities often have multiple access points for suppliers, customers, and maintenance contractors, requiring careful access control management. Protect areas where production control systems interface with manufacturing equipment, and secure intellectual property storage areas including design data and production specifications.';
          
          default:
            return req + ' - SECTOR PHYSICAL SECURITY (NIS2): Implement physical security measures appropriate for your sector\'s operational requirements and threat environment.';
        }
      }
      return req;
    });
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