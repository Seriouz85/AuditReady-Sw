// MistralAIService.ts - Reliable AI API using Mistral with proper rate limiting
// Uses Mistral API with 1 request per second rate limit compliance

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

interface MistralChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralChatRequest {
  model: string;
  messages: MistralChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

interface MistralChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

class MistralAIService {
  private static instance: MistralAIService;
  private readonly apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  private readonly baseUrl = 'https://api.mistral.ai/v1';
  private lastRequestTime = 0;
  private readonly rateLimitMs = 1100; // 1.1 seconds to be safe (1 req/sec limit)

  private constructor() {}

  static getInstance(): MistralAIService {
    if (!MistralAIService.instance) {
      MistralAIService.instance = new MistralAIService();
    }
    return MistralAIService.instance;
  }

  /**
   * Enforce rate limiting - wait if necessary
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make a chat completion request to Mistral API
   */
  private async chat(messages: MistralChatMessage[]): Promise<string> {
    await this.enforceRateLimit();

    const request: MistralChatRequest = {
      model: 'mistral-small-latest', // Use smaller model for cost efficiency
      messages,
      temperature: 0.7,
      max_tokens: 500, // Reasonable limit for suggestions
      top_p: 0.9
    };

    try {
      console.log('🤖 Making Mistral API request...');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API Error ${response.status}: ${errorText}`);
      }

      const data: MistralChatResponse = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in Mistral API response');
      }

      console.log('✅ Mistral API success:', content.substring(0, 100) + '...');
      return content;

    } catch (error) {
      console.error('❌ Mistral API error:', error);
      throw error;
    }
  }

  async analyzeRequirement(
    content: string,
    type: 'requirement' | 'guidance',
    letter: string,
    categoryName: string,
    frameworks: string[]
  ): Promise<RequirementSuggestion[]> {
    try {
      console.log(`🔍 Analyzing ${type} ${letter} with Mistral AI...`);
      
      // Get real database mappings for context
      const categoryMappings = await this.getCategoryMappings(categoryName, frameworks);
      const targetLines = type === 'requirement' ? '5-6 lines' : '8-10 lines';
      
      // Build focused, improved prompt that preserves structure
      const systemPrompt = `You are an expert information security compliance specialist. Write in English.

CRITICAL TASK: Enhance the specific content of requirement ${letter} without changing its core focus or mixing other topics.

CURRENT REQUIREMENT ${letter.toUpperCase()}:
"${content}"

CATEGORY: ${categoryName}
FRAMEWORKS: ${frameworks.join(', ')}

DATABASE CONTEXT (for reference only):
${categoryMappings.requirements}

STRICT RULES - MUST FOLLOW:

1. KEEP ORIGINAL STRUCTURE:
   - DO NOT add generic titles like "**Improved Requirement (${letter}):**" 
   - Keep the original requirement topic and focus
   - Only enhance what's already there

2. TOPIC SEPARATION (CRITICAL):
   - ${letter === 'a)' ? 'Focus ONLY on leadership/commitment aspects' : 
     letter === 'b)' ? 'Focus ONLY on scope/boundaries aspects' :
     letter === 'c)' ? 'Focus ONLY on policy-related aspects' :
     letter === 'd)' ? 'Focus ONLY on roles/responsibilities aspects' :
     'Focus ONLY on the specific topic this requirement addresses'}
   - DO NOT mention topics from other sub-requirements (a, b, c, d, e, etc.)
   - DO NOT mix leadership with technical implementation
   - DO NOT mix scope definition with policy content
   - DO NOT mix different compliance topics

3. ENHANCEMENT APPROACH:
   - Expand ONLY the existing topic with missing details
   - Explain acronyms (ISMS = Information Security Management System)
   - Add specific timelines (quarterly, annually)
   - Add measurable criteria (documented, approved, reviewed)
   - Reference specific clauses (ISO 27001:2022 clause X.X)
   - Use bullet points for clarity when listing multiple items

4. OUTPUT FORMAT:
   Just provide the enhanced requirement text. NO titles, NO "Improved" labels.
   
   Example format:
   • Enhanced requirement text with specific details
   • Acronym explanations (ISMS = Information Security Management System)  
   • Specific timelines and responsibilities
   • Measurable criteria and compliance references
   
Generate enhanced requirement ${letter} (${targetLines}) focused ONLY on its specific topic:`;

      const userPrompt = `Please improve this ${type}: "${content}"`;

      const messages: MistralChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.chat(messages);

      // Create suggestion object
      const itemId = type === 'requirement' 
        ? `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${letter}`
        : `guidance-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${letter.replace(')', '')}`;

      return [{
        id: `mistral-${Date.now()}`,
        requirement_id: type === 'requirement' ? itemId : '',
        item_id: type === 'guidance' ? itemId : '',
        type: 'content_enhancement',
        priority: 'high',
        suggestion: `Mistral AI-enhanced ${type} for better clarity and compliance`,
        suggested_text: response.trim(),
        framework_specific: frameworks[0],
        expected_improvement: 'Enhanced clarity, specific implementation details, and framework alignment',
        ai_confidence: 0.85,
        status: 'pending' as const,
        highlighted_text: undefined
      }];

    } catch (error) {
      console.error(`❌ Mistral AI error for ${type} ${letter}:`, error);
      
      // Log specific error details for debugging
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        
        // Check for specific API errors
        if (error.message.includes('401') || error.message.includes('403')) {
          console.error('🔑 API Key issue - check VITE_MISTRAL_API_KEY in .env file');
        } else if (error.message.includes('429')) {
          console.error('⏱️ Rate limit exceeded - will retry later');
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          console.error('🚨 Mistral API server error - temporary issue');
        }
      }
      
      return []; // Return empty array on error - no fallbacks
    }
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
          
          // Format requirements from all frameworks
          Object.entries(categoryReqs).forEach(([framework, reqs]) => {
            if (Array.isArray(reqs) && reqs.length > 0) {
              const formattedReqs = reqs
                .filter(req => req?.code && req?.title)
                .map(req => `${req.code} (${req.title})`)
                .join(', ');
              if (formattedReqs) {
                const frameworkName = framework === 'iso27001' ? 'ISO 27001' :
                                    framework === 'iso27002' ? 'ISO 27002' :
                                    framework === 'cisControls' ? 'CIS Controls' :
                                    framework === 'nis2' ? 'NIS2' :
                                    framework === 'gdpr' ? 'GDPR' : framework;
                requirementsText += `${frameworkName}: ${formattedReqs}\n`;
              }
            }
          });
          
          if (requirementsText.trim()) {
            return { requirements: requirementsText.trim() };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching category mappings from database:', error);
    }
    
    // Safe fallback
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
    if (!requests || requests.length === 0) {
      console.warn('🚫 No requirement requests provided');
      return [];
    }

    console.log(`🤖 Processing ${requests.length} requirements with Mistral AI (rate limited: 1 req/sec)`);
    console.log(`📋 Requirements to process: ${requests.map(r => r.letter).join(', ')}`);
    
    const allSuggestions: RequirementSuggestion[] = [];
    let successCount = 0;
    let failCount = 0;
    
    // Process requests sequentially due to rate limiting
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      console.log(`📝 [${i + 1}/${requests.length}] Processing requirement ${req.letter} for ${req.categoryName}`);
      
      try {
        const suggestions = await this.analyzeRequirement(
          req.content,
          req.type,
          req.letter,
          req.categoryName,
          req.frameworks
        );
        
        if (suggestions.length > 0) {
          allSuggestions.push(...suggestions);
          successCount++;
          console.log(`✅ [${i + 1}/${requests.length}] Generated suggestion for ${req.letter}`);
        } else {
          failCount++;
          console.warn(`⚠️ [${i + 1}/${requests.length}] No suggestions generated for ${req.letter}`);
        }
        
      } catch (error) {
        failCount++;
        console.error(`❌ [${i + 1}/${requests.length}] Mistral AI failed for ${req.letter}:`, error);
      }
    }
    
    console.log(`🎯 Processing complete: ${successCount} success, ${failCount} failed, ${allSuggestions.length} total suggestions`);
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
    if (!requests || requests.length === 0) {
      console.warn('🚫 No guidance requests provided');
      return [];
    }

    console.log(`🤖 Processing ${requests.length} guidance items with Mistral AI (rate limited: 1 req/sec)`);
    console.log(`📋 Guidance items to process: ${requests.map(r => r.letter).join(', ')}`);
    
    const allSuggestions: RequirementSuggestion[] = [];
    let successCount = 0;
    let failCount = 0;
    
    // Process requests sequentially due to rate limiting  
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      console.log(`📋 [${i + 1}/${requests.length}] Processing guidance ${req.letter} for ${req.categoryName}`);
      
      try {
        const suggestions = await this.analyzeRequirement(
          req.content,
          req.type,
          req.letter,
          req.categoryName,
          req.frameworks
        );
        
        if (suggestions.length > 0) {
          allSuggestions.push(...suggestions);
          successCount++;
          console.log(`✅ [${i + 1}/${requests.length}] Generated guidance suggestion for ${req.letter}`);
        } else {
          failCount++;
          console.warn(`⚠️ [${i + 1}/${requests.length}] No guidance suggestions generated for ${req.letter}`);
        }
        
      } catch (error) {
        failCount++;
        console.error(`❌ [${i + 1}/${requests.length}] Mistral AI failed for guidance ${req.letter}:`, error);
      }
    }
    
    console.log(`🎯 Guidance processing complete: ${successCount} success, ${failCount} failed, ${allSuggestions.length} total suggestions`);
    return allSuggestions;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Mistral API connection...');
      
      const messages: MistralChatMessage[] = [
        { role: 'user', content: 'Hello, please respond with "OK" to test the connection.' }
      ];

      const response = await this.chat(messages);
      console.log('✅ Mistral API test successful:', response);
      return true;
      
    } catch (error) {
      console.error('❌ Mistral API test failed:', error);
      return false;
    }
  }
}

export const mistralAI = MistralAIService.getInstance();

// Make test function available globally for debugging
(window as any).testMistralAI = () => {
  console.log('🧪 Running Mistral AI test from global function...');
  return mistralAI.testConnection();
};