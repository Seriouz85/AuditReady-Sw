import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';
import { RequirementDescriptor } from '../types/UnifiedRequirementsTypes';

export interface GovernanceSubRequirement {
  id: string;
  title: string;
  baseDescription: string;
  keywords: string[]; // For matching with framework requirements
  frameworkReferences: Map<string, string[]>; // Framework -> requirement codes
  enhancedDescription?: string; // After injection
}

/**
 * Hardcoded Governance & Leadership Template
 * 
 * This template defines the baseline sub-requirements for governance.
 * The system will inject detailed descriptions from selected frameworks
 * based on keyword matching and requirement mapping.
 */
export class GovernanceLeadershipTemplate {
  static getBaseRequirements(): GovernanceSubRequirement[] {
    return [
      {
        id: "governance-001",
        title: "Leadership Commitment and Accountability",
        baseDescription: "Establish executive leadership commitment to information security with documented accountability, regular oversight, and visible support for security initiatives.",
        keywords: ["leadership", "commitment", "accountability", "executive", "management", "responsibility", "oversight"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-002", 
        title: "Information Security Policy Framework",
        baseDescription: "Develop, implement, and maintain a comprehensive information security policy that aligns with business objectives and regulatory requirements.",
        keywords: ["policy", "framework", "information security", "documentation", "governance", "strategic"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-003",
        title: "Scope and Boundaries Definition", 
        baseDescription: "Define and document the scope of the information security management system, including all assets, locations, and business processes requiring protection.",
        keywords: ["scope", "boundaries", "ISMS", "assets", "locations", "business processes", "definition"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-004",
        title: "Organizational Structure and Governance",
        baseDescription: "Establish clear organizational structure with defined roles, responsibilities, and governance mechanisms for information security management.",
        keywords: ["organizational", "structure", "governance", "roles", "responsibilities", "hierarchy"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-005", 
        title: "Risk Management Framework",
        baseDescription: "Implement a systematic approach to identifying, assessing, treating, and monitoring information security risks across the organization.",
        keywords: ["risk", "management", "assessment", "treatment", "monitoring", "systematic", "approach"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-006",
        title: "Information Security Objectives and Planning",
        baseDescription: "Define measurable information security objectives that support business goals and establish plans to achieve these objectives.",
        keywords: ["objectives", "planning", "measurable", "goals", "strategy", "planning"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-007",
        title: "Documented Procedures Management",
        baseDescription: "Establish processes for creating, reviewing, updating, and controlling information security documentation and procedures.",
        keywords: ["procedures", "documentation", "control", "management", "processes", "standards"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-008",
        title: "Personnel Security and Competence",
        baseDescription: "Ensure personnel involved in information security have appropriate qualifications, training, and undergo necessary security screening.",
        keywords: ["personnel", "security", "competence", "training", "qualifications", "screening", "human resources"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-009",
        title: "Supplier Relationship Security",
        baseDescription: "Manage information security risks associated with supplier relationships and third-party service providers.",
        keywords: ["supplier", "third party", "vendor", "relationship", "external", "outsourcing"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-010",
        title: "Compliance Monitoring and Review",
        baseDescription: "Establish mechanisms for monitoring compliance with information security policies, procedures, and regulatory requirements.",
        keywords: ["compliance", "monitoring", "review", "audit", "assessment", "regulatory"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-011",
        title: "Incident Response Governance",
        baseDescription: "Define governance structure and accountability for information security incident response and business continuity planning.",
        keywords: ["incident", "response", "business continuity", "crisis", "emergency", "governance"],
        frameworkReferences: new Map()
      },
      {
        id: "governance-012",
        title: "Continuous Improvement and Management Review",
        baseDescription: "Implement processes for continuous improvement of the information security management system through regular reviews and updates.",
        keywords: ["improvement", "review", "management", "continuous", "enhancement", "optimization"],
        frameworkReferences: new Map()
      }
    ];
  }

  static enhanceWithFrameworkRequirements(
    baseRequirements: GovernanceSubRequirement[],
    frameworkMappings: any,
    selectedFrameworks: FrameworkSelection
  ): GovernanceSubRequirement[] {
    // Clone the base requirements
    const enhanced = baseRequirements.map(req => ({ ...req, frameworkReferences: new Map(req.frameworkReferences) }));

    // Process each selected framework
    Object.entries(selectedFrameworks).forEach(([framework, isSelected]) => {
      if (!isSelected || !frameworkMappings?.frameworks?.[framework]) return;

      const requirements = frameworkMappings.frameworks[framework];
      
      requirements.forEach((req: any) => {
        // Find best matching base requirement using keyword matching
        const bestMatch = this.findBestMatch(req, enhanced);
        if (bestMatch) {
          // Add framework reference
          if (!bestMatch.frameworkReferences.has(framework)) {
            bestMatch.frameworkReferences.set(framework, []);
          }
          bestMatch.frameworkReferences.get(framework)?.push(req.code || req.control_id);
          
          // Enhance description with specific requirements
          bestMatch.enhancedDescription = this.mergeDescriptions(
            bestMatch.enhancedDescription || bestMatch.baseDescription,
            req.description || req.title,
            framework
          );
        }
      });
    });

    return enhanced;
  }

  private static findBestMatch(requirement: any, baseRequirements: GovernanceSubRequirement[]): GovernanceSubRequirement | null {
    const reqText = (requirement.title + " " + (requirement.description || "")).toLowerCase();
    
    let bestMatch: GovernanceSubRequirement | null = null;
    let highestScore = 0;

    baseRequirements.forEach(baseReq => {
      const score = baseReq.keywords.reduce((acc, keyword) => {
        return acc + (reqText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = baseReq;
      }
    });

    return highestScore > 0 ? bestMatch : null;
  }

  private static mergeDescriptions(existing: string, newContent: string, framework: string): string {
    // Intelligent merging to avoid duplication
    const existingLower = existing.toLowerCase();
    const newLower = newContent.toLowerCase();

    // Check for significant overlap
    const words = newContent.split(/\s+/);
    const overlapCount = words.filter(word => 
      word.length > 3 && existingLower.includes(word.toLowerCase())
    ).length;

    // If significant overlap, don't add the new content
    if (overlapCount / words.length > 0.6) {
      return existing;
    }

    // Add specific framework requirements that add value
    const frameworkSpecifics = this.extractFrameworkSpecifics(newContent, framework);
    if (frameworkSpecifics) {
      return `${existing} ${frameworkSpecifics}`;
    }

    return existing;
  }

  private static extractFrameworkSpecifics(content: string, framework: string): string {
    // Extract framework-specific details like timelines, specific requirements, etc.
    const specifics: string[] = [];
    
    // Look for specific requirements, timelines, frequencies
    const timelineMatch = content.match(/(annually|quarterly|monthly|weekly|daily|\d+\s*(months?|years?|days?))/gi);
    if (timelineMatch) {
      specifics.push(`(${framework}: ${timelineMatch[0]})`);
    }

    // Look for specific percentages or numbers
    const numberMatch = content.match(/(\d+%|\d+\s*(percent|percentage))/gi);
    if (numberMatch) {
      specifics.push(`(${framework}: ${numberMatch[0]})`);
    }

    return specifics.length > 0 ? specifics.join(' ') : '';
  }

  static formatForDisplay(requirements: GovernanceSubRequirement[]): string[] {
    return requirements.map((req, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      const frameworkRefs = Array.from(req.frameworkReferences.entries())
        .filter(([_, codes]) => codes.length > 0)
        .map(([framework, codes]) => `${framework.toUpperCase()}: ${codes.join(', ')}`)
        .join('; ');
      
      const description = req.enhancedDescription || req.baseDescription;
      const references = frameworkRefs ? ` (References: ${frameworkRefs})` : '';
      
      return `${letter}) ${req.title.toUpperCase()} - ${description}${references}`;
    });
  }
}