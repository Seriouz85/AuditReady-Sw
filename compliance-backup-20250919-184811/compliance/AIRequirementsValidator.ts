import { mistralAI } from '../ai/MistralAIService';

interface ValidationRequest {
  category: string;
  generatedContent: string[];
  mappedRequirements: string[];
  selectedFrameworks: string[];
}

interface AIValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  enhancedContent?: string[];
}

/**
 * AI-powered Requirements Validator using Mistral API
 * 
 * Validates that generated unified requirements:
 * 1. Include all mapped requirements
 * 2. Maintain professional formatting
 * 3. Combine requirements intelligently
 * 4. Follow compliance best practices
 */
export class AIRequirementsValidator {
  
  constructor() {
    // Use existing Mistral service
  }
  
  /**
   * Validate generated unified requirements using AI
   */
  async validateRequirements(request: ValidationRequest): Promise<AIValidationResult> {
    try {
      const prompt = this.buildValidationPrompt(request);
      const response = await this.callMistralAPI(prompt);
      return this.parseAIResponse(response, request);
    } catch (error) {
      console.error('[AI Validator] Mistral API error:', error);
      // Fallback to basic validation
      return this.performBasicValidation(request);
    }
  }
  
  /**
   * Build validation prompt for Mistral
   */
  private buildValidationPrompt(request: ValidationRequest): string {
    return `
You are an expert compliance auditor validating unified requirements documentation.

CATEGORY: ${request.category}
SELECTED FRAMEWORKS: ${request.selectedFrameworks.join(', ')}

GENERATED CONTENT:
${request.generatedContent.join('\n\n')}

MAPPED REQUIREMENTS (must all be included):
${request.mappedRequirements.join('\n')}

VALIDATION TASKS:
1. Verify ALL mapped requirements are represented in the generated content
2. Check professional formatting (bold titles, bullet points, clear structure)
3. Ensure requirements are intelligently combined (3-4 similar ones merged into coherent sentences)
4. Validate compliance best practices are followed
5. Check for proper framework references [Framework: Control ID]

RESPONSE FORMAT (JSON):
{
  "isValid": boolean,
  "score": 0-100,
  "issues": ["list of problems found"],
  "suggestions": ["improvement suggestions"],
  "missingRequirements": ["requirements not included"],
  "formattingIssues": ["formatting problems"],
  "combinationQuality": "poor/good/excellent"
}

Analyze the content and provide your validation in the specified JSON format.`;
  }
  
  /**
   * Call existing Mistral service for validation
   */
  private async callMistralAPI(prompt: string): Promise<string> {
    // Use existing Mistral service instead of direct API calls
    const response = await mistralAI.analyzeRequirement(
      prompt,
      'requirement',
      'validation',
      'System Validation',
      ['validation']
    );
    
    if (response && response.length > 0) {
      return response[0]?.suggested_text || '';
    }
    
    throw new Error('No response from Mistral service');
  }
  
  /**
   * Parse AI response and create validation result
   */
  private parseAIResponse(aiResponse: string, request: ValidationRequest): AIValidationResult {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Build comprehensive validation result
      const result: AIValidationResult = {
        isValid: parsed.isValid && parsed.score >= 85,
        score: parsed.score || 0,
        issues: [],
        suggestions: []
      };
      
      // Add issues
      if (parsed.issues && Array.isArray(parsed.issues)) {
        result.issues.push(...parsed.issues);
      }
      
      if (parsed.missingRequirements && parsed.missingRequirements.length > 0) {
        result.issues.push(`Missing requirements: ${parsed.missingRequirements.join(', ')}`);
      }
      
      if (parsed.formattingIssues && parsed.formattingIssues.length > 0) {
        result.issues.push(...parsed.formattingIssues);
      }
      
      // Add suggestions
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        result.suggestions.push(...parsed.suggestions);
      }
      
      if (parsed.combinationQuality === 'poor') {
        result.suggestions.push('Improve requirement combination - merge similar requirements more intelligently');
      }
      
      // If validation failed, suggest regeneration
      if (!result.isValid) {
        result.suggestions.push('Consider regenerating content with improved requirement mapping');
      }
      
      return result;
      
    } catch (error) {
      console.error('[AI Validator] Failed to parse AI response:', error);
      return this.performBasicValidation(request);
    }
  }
  
  /**
   * Basic validation without AI
   */
  private performBasicValidation(request: ValidationRequest): AIValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check if content exists
    if (!request.generatedContent || request.generatedContent.length === 0) {
      issues.push('No content generated');
      return {
        isValid: false,
        score: 0,
        issues,
        suggestions: ['Generate content first']
      };
    }
    
    // Check formatting
    const hasProperFormatting = request.generatedContent.every(section => {
      return section.includes('**') && // Has bold text
             section.includes('•') || section.includes('-'); // Has bullet points
    });
    
    if (!hasProperFormatting) {
      issues.push('Missing proper formatting (bold titles, bullet points)');
      suggestions.push('Add bold markers (**) for titles and bullet points for requirements');
    }
    
    // Check requirement coverage (basic)
    const contentText = request.generatedContent.join(' ').toLowerCase();
    const missingCount = request.mappedRequirements.filter(req => {
      const reqId = req.toLowerCase();
      return !contentText.includes(reqId);
    }).length;
    
    const coverage = ((request.mappedRequirements.length - missingCount) / request.mappedRequirements.length) * 100;
    
    if (coverage < 90) {
      issues.push(`Low requirement coverage: ${coverage.toFixed(0)}%`);
      suggestions.push('Ensure all mapped requirements are included in the generated content');
    }
    
    // Check for framework references
    const hasReferences = request.generatedContent.some(section => 
      section.includes('[') && section.includes(']')
    );
    
    if (!hasReferences) {
      issues.push('Missing framework references');
      suggestions.push('Add framework references in format [Framework: Control ID]');
    }
    
    // Calculate score
    let score = 100;
    score -= issues.length * 15;
    score = Math.max(0, score);
    
    return {
      isValid: score >= 70,
      score,
      issues,
      suggestions
    };
  }
  
  /**
   * Enhance content based on validation feedback
   */
  async enhanceContent(
    content: string[],
    validationResult: AIValidationResult
  ): Promise<string[]> {
    // If content is already valid, return as-is
    if (validationResult.isValid && validationResult.score >= 95) {
      return content;
    }
    
    // Apply automatic enhancements based on issues
    let enhancedContent = [...content];
    
    // Fix formatting issues
    if (validationResult.issues.some(issue => issue.includes('formatting'))) {
      enhancedContent = this.fixFormatting(enhancedContent);
    }
    
    // Add missing framework references
    if (validationResult.issues.some(issue => issue.includes('references'))) {
      enhancedContent = this.addFrameworkReferences(enhancedContent);
    }
    
    return enhancedContent;
  }
  
  /**
   * Fix formatting issues in content
   */
  private fixFormatting(content: string[]): string[] {
    return content.map(section => {
      // Ensure titles are bold
      if (!section.startsWith('**')) {
        const lines = section.split('\n');
        if (lines[0] && !lines[0].startsWith('**')) {
          lines[0] = `**${lines[0].trim()}**`;
        }
        section = lines.join('\n');
      }
      
      // Ensure bullet points for requirements
      section = section.replace(/^- /gm, '• ');
      
      return section;
    });
  }
  
  /**
   * Add framework references where missing
   */
  private addFrameworkReferences(content: string[]): string[] {
    return content.map(section => {
      // Check if section already has references
      if (section.includes('[') && section.includes(']')) {
        return section;
      }
      
      // Add placeholder reference if missing
      const lines = section.split('\n');
      const requirementLines = lines.filter(line => line.startsWith('•'));
      
      if (requirementLines.length > 0) {
        // Add generic reference to requirements section
        const insertIndex = lines.findIndex(line => line.includes('Requirements:'));
        if (insertIndex !== -1) {
          lines.splice(insertIndex + 1, 0, '[Framework references will be added based on selected frameworks]');
        }
      }
      
      return lines.join('\n');
    });
  }
  
  /**
   * Get validation summary for UI display
   */
  getValidationSummary(result: AIValidationResult): string {
    if (result.isValid) {
      return `✅ Validation passed (Score: ${result.score}/100)`;
    } else {
      return `⚠️ Validation issues found (Score: ${result.score}/100)\n${result.issues.join('\n')}`;
    }
  }
}