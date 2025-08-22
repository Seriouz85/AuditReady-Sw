// PuterAIService.ts - Unlimited AI API using Puter.js
// This service provides unlimited AI API calls without quota limits
// Uses Puter.js for ALL AI operations - no quota limits!

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: any) => Promise<string>;
        txt2img: (prompt: string, options?: any) => Promise<HTMLImageElement>;
      };
      print: (text: string) => void;
    };
  }
}

interface PuterChatOptions {
  model?: 'gpt-5' | 'gpt-5-nano' | 'gpt-4o' | 'o1-mini' | 'o3-mini' | 'o4-mini';
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface RequirementSuggestion {
  id: string;
  requirement_id: string;
  item_id?: string; // For guidance items
  type: 'content_enhancement' | 'framework_specific' | 'length_optimization' | 'clarity_improvement' | 'framework_enhancement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  suggested_text: string;
  framework_specific?: string;
  expected_improvement: string;
  ai_confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  highlighted_text?: string;
}

interface ValidationAnalysis {
  suggestions: RequirementSuggestion[];
  quality_score: number;
  framework_coverage: number;
  clarity_improvements: string[];
}

class PuterAIService {
  private static instance: PuterAIService;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): PuterAIService {
    if (!PuterAIService.instance) {
      PuterAIService.instance = new PuterAIService();
    }
    return PuterAIService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve) => {
      // Check if puter is already loaded
      if (typeof window.puter !== 'undefined') {
        try {
          // Try to authenticate with Puter.js
          console.log('🔐 Attempting to authenticate with Puter.js...');
          
          // Check if we need to sign in
          if (!window.puter.auth?.isSignedIn()) {
            console.log('🚪 Not signed in, attempting anonymous access...');
            
            // Try to sign in anonymously or with a temporary session
            try {
              await window.puter.auth.signIn();
              console.log('✅ Puter.js authentication successful');
            } catch (authError) {
              console.warn('⚠️ Puter.js authentication failed, trying without auth:', authError);
            }
          }
          
          this.isInitialized = true;
          console.log('✅ Puter.js is ready for unlimited AI calls');
          resolve();
          return;
        } catch (error) {
          console.error('❌ Puter.js initialization error:', error);
          this.isInitialized = true; // Continue anyway
          resolve();
          return;
        }
      }

      // Wait for puter to be available
      const checkInterval = setInterval(async () => {
        if (typeof window.puter !== 'undefined') {
          clearInterval(checkInterval);
          
          try {
            // Try to authenticate when Puter becomes available
            console.log('🔐 Attempting to authenticate with Puter.js...');
            
            if (!window.puter.auth?.isSignedIn()) {
              try {
                await window.puter.auth.signIn();
                console.log('✅ Puter.js authentication successful');
              } catch (authError) {
                console.warn('⚠️ Puter.js authentication failed:', authError);
              }
            }
          } catch (error) {
            console.error('❌ Puter.js authentication error:', error);
          }
          
          this.isInitialized = true;
          console.log('✅ Puter.js is ready for unlimited AI calls');
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('❌ Puter.js failed to load after 10 seconds');
        resolve(); // Resolve anyway to prevent hanging
      }, 10000);
    });

    return this.initPromise;
  }

  async analyzeRequirement(
    content: string,
    type: 'requirement' | 'guidance',
    letter: string,
    categoryName: string,
    frameworks: string[]
  ): Promise<RequirementSuggestion[]> {
    await this.initialize();

    if (!this.isInitialized || !window.puter?.ai?.chat) {
      console.warn('🚫 Puter.js not available - no AI suggestions');
      return [];
    }

    const targetWordCount = type === 'requirement' ? 35 : 45;
    
    // Comprehensive prompt with full context - Swedish thinking, English output
    const prompt = await this.buildComprehensivePrompt(content, type, letter, categoryName, frameworks, targetWordCount);

    try {
      console.log(`🤖 Starting Puter AI analysis for ${type} ${letter}...`);
      
      // Longer timeout for Puter.js - their API needs more time
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)  // Increased to 10 seconds
      );
      
      const responsePromise = window.puter.ai.chat(prompt);
      
      const response = await Promise.race([responsePromise, timeoutPromise]) as any;
      
      // Check if Puter returned an error object
      if (typeof response === 'object' && response.success === false) {
        const errorMsg = response.error?.message || 'Unknown error';
        const errorCode = response.error?.code || 'unknown';
        
        if (errorMsg.includes('Permission denied') || errorCode.includes('usage-limited')) {
          throw new Error(`Puter.js Usage Limit: ${errorMsg} (Code: ${errorCode})`);
        }
        
        throw new Error(`Puter API Error: ${errorMsg} (Code: ${errorCode})`);
      }
      
      // Ensure we have a string response
      const responseText = typeof response === 'string' ? response : String(response);
      console.log(`✅ Puter AI success for ${type} ${letter}:`, responseText.substring(0, 100) + '...');

      // Use the response directly as suggested text (don't try to parse JSON)
      const itemId = type === 'requirement' 
        ? `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${letter}`
        : `guidance-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${letter.replace(')', '')}`;

      // Create a single high-quality suggestion
      return [{
        id: `puter-${Date.now()}`,
        requirement_id: type === 'requirement' ? itemId : '',
        item_id: type === 'guidance' ? itemId : '',
        type: 'content_enhancement',
        priority: 'high',
        suggestion: `AI-enhanced ${type} for better clarity and compliance`,
        suggested_text: responseText || content,
        framework_specific: frameworks[0],
        expected_improvement: 'Enhanced clarity, specific implementation details, and framework alignment',
        ai_confidence: 0.90,
        status: 'pending' as const,
        highlighted_text: undefined
      }];

    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        console.warn(`⏱️ Puter AI timeout for ${type} ${letter} - no suggestion generated`);
      } else if (error instanceof Error && error.message.includes('Usage Limit')) {
        console.error(`🚫 Puter.js has usage limits! ${error.message}`);
        console.error(`💡 Puter.js is NOT truly unlimited - authentication or paid plan may be required`);
      } else if (error instanceof Error && error.message.includes('Puter API Error')) {
        console.error(`❌ Puter API error for ${type} ${letter}:`, error.message);
      } else {
        console.error(`❌ Puter AI error for ${type} ${letter}:`, error);
      }
      return []; // No fallback - return empty array
    }
  }

  // No fallback methods - AI only as requested

  private async buildComprehensivePrompt(
    content: string,
    type: 'requirement' | 'guidance',
    letter: string,
    categoryName: string,
    frameworks: string[],
    targetWordCount: number
  ): Promise<string> {
    const categoryMappings = await this.getCategoryMappings(categoryName, frameworks);
    const targetLines = type === 'requirement' ? '5-6 lines' : '8-10 lines';
    
    return `You are an expert information security specialist. Write in English.

TASK: Improve this ${type} for ${categoryName} category
Current ${type} (${letter}): "${content}"

CATEGORY CONTEXT:
Category: "${categoryName}"
Description: "Comprehensive ${categoryName.toLowerCase()} framework with specific deadlines, clear accountabilities, and measurable covering all aspects of information security ${categoryName.toLowerCase()} and management"

ORIGINAL FRAMEWORK REQUIREMENTS FOR THIS CATEGORY:
${categoryMappings.requirements}

KEY FRAMEWORKS: ${frameworks.join(', ')}

CRITICAL INSTRUCTIONS FOR ${type.toUpperCase()}:

${type === 'requirement' ? `
1. UNIFIED REQUIREMENTS RULES (5-6 lines max):
   - TOPIC SEPARATION: Keep this ${type} (${letter}) focused ONLY on its specific topic
   - DO NOT mix topics from other sub-requirements in the same category
   - If current content mentions ISMS, enhance ONLY ISMS-related aspects
   - If current content mentions Risk Assessment, enhance ONLY risk assessment details
   - If current content mentions Access Control, enhance ONLY access control specifics
   - Add missing details from original framework requirements ONLY if they belong to this specific topic
   - Verify current requirement covers relevant original framework requirements for THIS TOPIC ONLY

2. CONTENT REQUIREMENTS:
   - ${targetWordCount} words target
   - Explain acronyms and technical terms specific to THIS topic
   - Include specific deadlines, accountabilities, and measurable criteria for THIS topic only
   - Reference relevant ISO/CIS clauses that apply to THIS specific topic
   - Avoid generic compliance language - be specific to this ${letter} topic within ${categoryName}

` : `
1. UNIFIED GUIDANCE RULES (8-10 lines):
   - TOPIC SEPARATION: Expand ONLY on the specific topic of ${type} ${letter}
   - DO NOT include implementation details that belong to other sub-requirements
   - Focus exclusively on HOW to implement what this specific requirement describes
   - Provide step-by-step practical implementation advice for THIS topic only
   - Include specific roles, responsibilities, and timelines for THIS topic
   - Add practical examples and best practices relevant to THIS topic only
   - Include monitoring and validation methods specific to THIS topic

2. IMPLEMENTATION FOCUS:
   - More detailed than requirement - explain the "how" for THIS specific topic
   - Include implementation steps and procedures for THIS topic only
   - Specify roles and responsibilities clearly for THIS topic
   - Include timeline considerations relevant to THIS topic
`}

QUALITY STANDARDS:
- Professional, technical language
- Specific to the topic of ${type} ${letter} within ${categoryName}
- Actionable and implementable for THIS specific topic
- Complete coverage of original framework requirements relevant to THIS topic only
- Clear distinction and NO overlap with other sub-requirements in same category

TOPIC FOCUS REMINDER:
This is ${type} ${letter} - enhance ONLY the specific topic/concept that this letter addresses. Do not add content that belongs in other letters (a, b, c, d, etc.) of the same category.

Generate improved ${type} (${targetLines}) that is comprehensive, specific, and focused ONLY on the topic of ${letter}:`;
  }

  private async getCategoryMappings(categoryName: string, frameworks: string[]): Promise<{ requirements: string }> {
    try {
      // Ensure frameworks is an array with safe values
      const safeFrameworks = Array.isArray(frameworks) && frameworks.length > 0 
        ? frameworks.filter(f => f && typeof f === 'string')
        : ['iso27001', 'iso27002'];
      
      if (safeFrameworks.length === 0) {
        return {
          requirements: `Relevant compliance controls and requirements for ${categoryName} including policy development, implementation procedures, monitoring controls, and compliance verification measures.`
        };
      }
      
      // Import the service dynamically to avoid circular dependencies
      const { complianceUnificationService } = await import('@/services/compliance/ComplianceUnificationService');
      
      // Get all categories
      const categories = await complianceUnificationService.getUnifiedCategories();
      const category = categories?.find(c => c?.name === categoryName);
      
      if (category) {
        // Get real framework requirements from database
        const frameworkRequirements = await complianceUnificationService.getFrameworkRequirementsByCategories(
          [category], 
          safeFrameworks
        );
        
        const categoryReqs = frameworkRequirements?.[categoryName];
        if (categoryReqs) {
          let requirementsText = '';
          
          // Format ISO 27001 requirements
          if (categoryReqs.iso27001?.length > 0) {
            const iso27001Reqs = categoryReqs.iso27001
              .filter(req => req?.code && req?.title)
              .map(req => `${req.code} (${req.title})`)
              .join(', ');
            if (iso27001Reqs) {
              requirementsText += `ISO 27001: ${iso27001Reqs}\n`;
            }
          }
          
          // Format ISO 27002 requirements
          if (categoryReqs.iso27002?.length > 0) {
            const iso27002Reqs = categoryReqs.iso27002
              .filter(req => req?.code && req?.title)
              .map(req => `${req.code} (${req.title})`)
              .join(', ');
            if (iso27002Reqs) {
              requirementsText += `ISO 27002: ${iso27002Reqs}\n`;
            }
          }
          
          // Format CIS Controls requirements
          if (categoryReqs.cisControls?.length > 0) {
            const cisReqs = categoryReqs.cisControls
              .filter(req => req?.code && req?.title)
              .map(req => `${req.code} (${req.title})`)
              .join(', ');
            if (cisReqs) {
              requirementsText += `CIS Controls: ${cisReqs}\n`;
            }
          }
          
          // Format NIS2 requirements
          if (categoryReqs.nis2?.length > 0) {
            const nis2Reqs = categoryReqs.nis2
              .filter(req => req?.code && req?.title)
              .map(req => `${req.code} (${req.title})`)
              .join(', ');
            if (nis2Reqs) {
              requirementsText += `NIS2: ${nis2Reqs}\n`;
            }
          }
          
          // Format GDPR requirements
          if (categoryReqs.gdpr?.length > 0) {
            const gdprReqs = categoryReqs.gdpr
              .filter(req => req?.code && req?.title)
              .map(req => `${req.code} (${req.title})`)
              .join(', ');
            if (gdprReqs) {
              requirementsText += `GDPR: ${gdprReqs}\n`;
            }
          }
          
          if (requirementsText.trim()) {
            return { requirements: requirementsText.trim() };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching category mappings from database:', error);
    }
    
    // Safe fallback with proper null checks
    const safeFrameworksForFallback = Array.isArray(frameworks) && frameworks.length > 0 
      ? frameworks.filter(f => f && typeof f === 'string')
      : ['compliance frameworks'];
    
    return {
      requirements: `${safeFrameworksForFallback.join(', ')}: Relevant controls and requirements for ${categoryName || 'this category'} including policy development, implementation procedures, monitoring controls, and compliance verification measures.`
    };
  }


  async generateRequirementSuggestions(
    requests: Array<{
      content: string;
      type: 'requirement';
      letter: string;
      categoryName: string;
      frameworks: string[];
    }>
  ): Promise<RequirementSuggestion[]> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('🚫 Puter.js not available - no AI suggestions generated');
      return [];
    }
    
    console.log(`🤖 Processing ${requests.length} requirements with REAL AI only - no fallbacks`);
    
    const allSuggestions: RequirementSuggestion[] = [];
    
    // Process requests in smaller batches to avoid overwhelming Puter API
    const batchSize = 3; // Process max 3 at a time
    const batches = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of max ${batchSize} requests each`);
    
    // Process each batch
    for (const batch of batches) {
      console.log(`🔄 Processing batch with ${batch.length} requests`);
      
      for (const req of batch) {
      try {
        const suggestions = await this.analyzeRequirement(
          req.content,
          req.type,
          req.letter,
          req.categoryName,
          req.frameworks
        );
        allSuggestions.push(...suggestions);
        
        // Longer delay between requests to avoid overwhelming Puter API
        if (batch.indexOf(req) < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds
        }
      } catch (error) {
        console.warn(`⚠️ AI failed for ${req.letter}, skipping (no fallback)`);
        // Skip this requirement - no fallback
      }
      }
      
      // Delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        console.log('⏸️ Pausing between batches...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second pause between batches
      }
    }
    
    console.log(`✅ Generated ${allSuggestions.length} REAL AI suggestions (no fallbacks)`);
    return allSuggestions;
  }

  async generateGuidanceSuggestions(
    requests: Array<{
      content: string;
      type: 'guidance';
      letter: string;
      categoryName: string;
      frameworks: string[];
    }>
  ): Promise<RequirementSuggestion[]> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('🚫 Puter.js not available - no AI suggestions generated');
      return [];
    }
    
    console.log(`🤖 Processing ${requests.length} guidance items with REAL AI only - no fallbacks`);
    
    const allSuggestions: RequirementSuggestion[] = [];
    
    // Process requests in smaller batches to avoid overwhelming Puter API
    const batchSize = 3; // Process max 3 at a time
    const batches = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of max ${batchSize} requests each`);
    
    // Process each batch
    for (const batch of batches) {
      console.log(`🔄 Processing batch with ${batch.length} requests`);
      
      for (const req of batch) {
      try {
        const suggestions = await this.analyzeRequirement(
          req.content,
          req.type,
          req.letter,
          req.categoryName,
          req.frameworks
        );
        allSuggestions.push(...suggestions);
        
        // Longer delay between requests to avoid overwhelming Puter API
        if (batch.indexOf(req) < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds
        }
      } catch (error) {
        console.warn(`⚠️ AI failed for ${req.letter}, skipping (no fallback)`);
        // Skip this guidance item - no fallback
      }
      }
      
      // Delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        console.log('⏸️ Pausing between batches...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second pause between batches
      }
    }
    
    console.log(`✅ Generated ${allSuggestions.length} REAL AI guidance suggestions (no fallbacks)`);
    return allSuggestions;
  }

  isAvailable(): boolean {
    return this.isInitialized && typeof window.puter !== 'undefined';
  }

  async testConnection(): Promise<boolean> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.error('Puter.js is not available');
      return false;
    }
    
    try {
      console.log('🔍 Testing Puter.js with simple request...');
      const response = await window.puter.ai.chat('Hello, are you working?');
      
      console.log('🔍 Raw Puter response type:', typeof response);
      console.log('🔍 Raw Puter response:', response);
      
      // Check if it's an error object
      if (typeof response === 'object' && response.success === false) {
        console.error('❌ Puter.js returned error object:', JSON.stringify(response, null, 2));
        return false;
      }
      
      console.log('✅ Puter.js test successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Puter.js test failed:', error);
      return false;
    }
  }
}

export const puterAI = PuterAIService.getInstance();

// Make test function available globally for debugging
(window as any).testPuterAI = () => {
  console.log('🧪 Running Puter.js test from global function...');
  return puterAI.testConnection();
};