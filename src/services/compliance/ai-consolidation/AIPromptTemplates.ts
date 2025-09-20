/**
 * AIPromptTemplates.ts
 * Deterministic prompt templates for consistent AI text consolidation
 * Ensures repetitive results and detail preservation
 */

export interface ConsolidationPromptConfig {
  preserveDetails: boolean;
  maintainStructure: boolean;
  targetReduction: number; // 0.4-0.7 (40-70%)
  includeTimeframes: boolean;
  includeAuthorities: boolean;
  includeStandards: boolean;
}

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  constraints: string[];
  validationRules: string[];
}

export class AIPromptTemplates {
  private static readonly DETAIL_PRESERVATION_RULES = [
    "NEVER remove or alter timeframes (quarterly, annual, monthly, etc.)",
    "NEVER remove or alter authority references (ENISA, ISO, NIST, etc.)",
    "NEVER remove or alter standard references (ISO 27001, NIS2, etc.)",
    "NEVER remove or alter numerical values, percentages, or metrics",
    "NEVER remove or alter regulatory deadlines or compliance dates",
    "NEVER remove or alter specific technical requirements or specifications"
  ];

  private static readonly CONSOLIDATION_RULES = [
    "Combine similar bullet points by topic while preserving ALL details",
    "Maintain exact sub-title structure and hierarchy",
    "Group related requirements under appropriate sub-requirements",
    "Preserve reference injection points {{framework_references}}",
    "Maintain compliance integrity and auditability",
    "Use consistent terminology throughout consolidated text"
  ];

  private static readonly OUTPUT_FORMAT_RULES = [
    "Output ONLY the consolidated text without explanations",
    "Maintain original markdown formatting and structure",
    "Preserve bullet point hierarchy and indentation",
    "Keep sub-requirement titles exactly as provided",
    "Maintain reference placeholders in exact format",
    "End response immediately after consolidated content"
  ];

  /**
   * Generate deterministic system prompt for text consolidation
   */
  static generateSystemPrompt(config: ConsolidationPromptConfig): string {
    const basePrompt = `You are an expert compliance text consolidation AI. Your role is to intelligently consolidate compliance requirements while preserving 100% of critical details.

CRITICAL MISSION: Consolidate text to achieve ${Math.round(config.targetReduction * 100)}% reduction while maintaining complete accuracy and compliance integrity.

ABSOLUTE REQUIREMENTS:
${this.DETAIL_PRESERVATION_RULES.map(rule => `- ${rule}`).join('\n')}

CONSOLIDATION METHODOLOGY:
${this.CONSOLIDATION_RULES.map(rule => `- ${rule}`).join('\n')}

OUTPUT SPECIFICATIONS:
${this.OUTPUT_FORMAT_RULES.map(rule => `- ${rule}`).join('\n')}`;

    if (config.includeTimeframes) {
      return basePrompt + '\n\nTIMEFRAME PRESERVATION: Pay special attention to preserving all temporal references (deadlines, review cycles, reporting periods).';
    }

    if (config.includeAuthorities) {
      return basePrompt + '\n\nAUTHORITY PRESERVATION: Pay special attention to preserving all regulatory authority names and references.';
    }

    if (config.includeStandards) {
      return basePrompt + '\n\nSTANDARD PRESERVATION: Pay special attention to preserving all compliance standard references and codes.';
    }

    return basePrompt;
  }

  /**
   * Generate deterministic user prompt for specific content
   */
  static generateUserPrompt(
    content: string,
    category: string,
    frameworks: string[],
    config: ConsolidationPromptConfig
  ): string {
    const contentFingerprint = this.generateContentFingerprint(content);
    
    return `CONSOLIDATION TASK for Category: "${category}"
Frameworks: ${frameworks.join(', ')}
Content Fingerprint: ${contentFingerprint}
Target Reduction: ${Math.round(config.targetReduction * 100)}%

CONTENT TO CONSOLIDATE:
${content}

CONSOLIDATION INSTRUCTIONS:
1. Identify similar requirements and group them intelligently
2. Combine redundant bullet points while preserving ALL details
3. Maintain sub-requirement title structure exactly as shown
4. Preserve framework reference injection points
5. Ensure consolidated text is more readable but complete
6. Achieve approximately ${Math.round(config.targetReduction * 100)}% text reduction

VALIDATION CHECKLIST (you must verify):
- All timeframes preserved
- All authority references preserved  
- All standard references preserved
- All numerical values preserved
- All technical specifications preserved
- Framework reference placeholders maintained
- Sub-requirement structure maintained

CONSOLIDATE NOW:`;
  }

  /**
   * Generate content fingerprint for caching and consistency
   */
  static generateContentFingerprint(content: string): string {
    // Create deterministic fingerprint based on content structure
    const normalized = content
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .toLowerCase()
      .trim();
    
    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate requirement consolidation prompt
   */
  static generateRequirementConsolidationPrompt(
    requirements: any[],
    category: string,
    config: ConsolidationPromptConfig
  ): PromptTemplate {
    const systemPrompt = this.generateSystemPrompt(config);
    
    const requirementText = requirements.map(req => 
      `${req.title}: ${req.description}`
    ).join('\n\n');

    const userPrompt = this.generateUserPrompt(
      requirementText,
      category,
      requirements.map(r => r.framework),
      config
    );

    return {
      systemPrompt,
      userPrompt,
      constraints: [
        ...this.DETAIL_PRESERVATION_RULES,
        ...this.CONSOLIDATION_RULES,
        ...this.OUTPUT_FORMAT_RULES
      ],
      validationRules: [
        "All timeframes must be preserved",
        "All authority references must be preserved",
        "All standard references must be preserved",
        "Text reduction must be between 40-70%",
        "Readability must be improved",
        "Compliance integrity must be maintained"
      ]
    };
  }

  /**
   * Generate guidance consolidation prompt
   */
  static generateGuidanceConsolidationPrompt(
    guidanceContent: string,
    category: string,
    config: ConsolidationPromptConfig
  ): PromptTemplate {
    const systemPrompt = this.generateSystemPrompt(config) + `

GUIDANCE CONSOLIDATION SPECIALIZATION:
- Focus on actionable guidance and practical steps
- Combine similar implementation advice
- Preserve all specific examples and case studies
- Maintain regulatory interpretation accuracy
- Group related guidance topics logically`;

    const userPrompt = `GUIDANCE CONSOLIDATION TASK for Category: "${category}"
Content Fingerprint: ${this.generateContentFingerprint(guidanceContent)}

GUIDANCE CONTENT TO CONSOLIDATE:
${guidanceContent}

CONSOLIDATION FOCUS:
1. Combine similar guidance topics while preserving examples
2. Group related implementation steps logically
3. Maintain all regulatory interpretations exactly
4. Preserve specific methodologies and approaches
5. Keep all reference materials and citations

CONSOLIDATE THE GUIDANCE:`;

    return {
      systemPrompt,
      userPrompt,
      constraints: [
        ...this.DETAIL_PRESERVATION_RULES,
        "Preserve all implementation examples",
        "Maintain regulatory interpretation accuracy",
        "Keep methodological approaches intact"
      ],
      validationRules: [
        "All examples and case studies preserved",
        "Implementation steps remain clear",
        "Regulatory interpretations unchanged",
        "Methodologies remain accessible"
      ]
    };
  }

  /**
   * Generate bullet point consolidation prompt
   */
  static generateBulletConsolidationPrompt(
    bulletPoints: string[],
    subRequirementTitle: string,
    config: ConsolidationPromptConfig
  ): PromptTemplate {
    const systemPrompt = `You are a compliance text consolidation specialist. Consolidate bullet points intelligently while preserving ALL details.

BULLET POINT CONSOLIDATION RULES:
- Combine related points by topic or theme
- Preserve ALL specific details, numbers, and references
- Maintain logical flow and hierarchy
- Group similar implementation requirements
- Preserve technical specifications exactly
- Keep all compliance deadlines and timeframes`;

    const bulletText = bulletPoints.map((point, index) => 
      `${index + 1}. ${point}`
    ).join('\n');

    const userPrompt = `CONSOLIDATE BULLET POINTS for: "${subRequirementTitle}"
Original Count: ${bulletPoints.length}
Target Reduction: ${Math.round(config.targetReduction * 100)}%

BULLET POINTS TO CONSOLIDATE:
${bulletText}

CONSOLIDATION TASK:
1. Group related bullet points by topic/theme
2. Combine similar requirements while preserving ALL details
3. Maintain numbered or bulleted format
4. Preserve all specific requirements and specifications
5. Ensure no detail is lost in consolidation

CONSOLIDATED BULLET POINTS:`;

    return {
      systemPrompt,
      userPrompt,
      constraints: [
        "Group by topic/theme",
        "Preserve all details",
        "Maintain format consistency",
        "Keep technical specifications"
      ],
      validationRules: [
        "All original details preserved",
        "Logical grouping achieved",
        "Format consistency maintained",
        "Reduction target achieved"
      ]
    };
  }

  /**
   * Generate framework reference consolidation prompt
   */
  static generateFrameworkReferencePrompt(
    frameworkReferences: Record<string, string[]>,
    config: ConsolidationPromptConfig
  ): PromptTemplate {
    const systemPrompt = `You are a compliance framework reference consolidation expert. Consolidate framework references while maintaining complete traceability.

FRAMEWORK REFERENCE RULES:
- Preserve all framework codes and identifiers
- Maintain mapping accuracy between frameworks
- Consolidate similar requirement descriptions
- Preserve regulatory authority attributions
- Keep cross-reference integrity intact`;

    const referencesText = Object.entries(frameworkReferences)
      .map(([framework, refs]) => 
        `${framework}:\n${refs.map(ref => `  - ${ref}`).join('\n')}`
      ).join('\n\n');

    const userPrompt = `CONSOLIDATE FRAMEWORK REFERENCES
Frameworks: ${Object.keys(frameworkReferences).join(', ')}

FRAMEWORK REFERENCES TO CONSOLIDATE:
${referencesText}

CONSOLIDATION REQUIREMENTS:
1. Preserve all framework codes exactly
2. Consolidate similar reference descriptions
3. Maintain cross-framework mapping accuracy
4. Group related references logically
5. Preserve regulatory traceability

CONSOLIDATED REFERENCES:`;

    return {
      systemPrompt,
      userPrompt,
      constraints: [
        "Preserve framework codes",
        "Maintain mapping accuracy",
        "Keep traceability intact",
        "Group references logically"
      ],
      validationRules: [
        "All framework codes preserved",
        "Mapping accuracy maintained",
        "Traceability intact",
        "Logical grouping achieved"
      ]
    };
  }

  /**
   * Generate validation prompt for consolidated content
   */
  static generateValidationPrompt(
    originalContent: string,
    consolidatedContent: string,
    config: ConsolidationPromptConfig
  ): PromptTemplate {
    const systemPrompt = `You are a compliance content validation expert. Validate that consolidated content preserves 100% of critical details from original content.

VALIDATION CRITERIA:
- Detail preservation: 100% required
- Timeframe preservation: All dates, periods, cycles
- Authority preservation: All regulatory bodies, standards
- Technical preservation: All specifications, metrics, numbers
- Structure preservation: All sub-requirements, hierarchies
- Reference preservation: All framework references, citations`;

    const userPrompt = `VALIDATION TASK: Compare original vs consolidated content

ORIGINAL CONTENT:
${originalContent}

CONSOLIDATED CONTENT:
${consolidatedContent}

VALIDATION CHECKLIST:
1. Are all timeframes preserved? (quarterly, annual, etc.)
2. Are all authorities preserved? (ENISA, ISO, NIST, etc.)
3. Are all standards preserved? (ISO 27001, NIS2, etc.)
4. Are all numerical values preserved?
5. Are all technical specifications preserved?
6. Is the structure/hierarchy maintained?
7. Are framework references intact?
8. Is compliance integrity maintained?

VALIDATION RESULT (JSON format):
{
  "validationPassed": boolean,
  "detailsPreserved": number (0-100),
  "timeframesPreserved": boolean,
  "authoritiesPreserved": boolean,
  "standardsPreserved": boolean,
  "technicalSpecsPreserved": boolean,
  "structurePreserved": boolean,
  "referencesPreserved": boolean,
  "textReduction": number (0-100),
  "qualityScore": number (0-100),
  "issues": string[],
  "suggestions": string[]
}`;

    return {
      systemPrompt,
      userPrompt,
      constraints: [
        "100% detail preservation required",
        "Strict timeframe validation",
        "Authority reference validation",
        "Technical specification validation"
      ],
      validationRules: [
        "All validation criteria must pass",
        "JSON response format required",
        "Detailed issue reporting required",
        "Actionable suggestions required"
      ]
    };
  }
}