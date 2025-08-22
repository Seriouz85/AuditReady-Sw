/**
 * OpenRouter AI Service for DeepSeek Integration
 * Uses OpenRouter API with DeepSeek model for requirement and guidance validation
 */

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterAIService {
  private static instance: OpenRouterAIService | null = null;
  private config: OpenRouterConfig;

  private constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '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',
      model: 'deepseek/deepseek-chat-v3-0324:free',
      baseUrl: 'https://openrouter.ai/api/v1'
    };
  }

  public static getInstance(): OpenRouterAIService {
    if (!OpenRouterAIService.instance) {
      OpenRouterAIService.instance = new OpenRouterAIService();
    }
    return OpenRouterAIService.instance;
  }

  /**
   * Call OpenRouter API with DeepSeek model
   */
  public async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const messages: OpenRouterRequest['messages'] = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const request: OpenRouterRequest = {
        model: this.config.model,
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 0.9,
        stream: false
      };

      console.log(`🤖 Calling OpenRouter API with DeepSeek model...`);
      
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Audit Readiness Hub'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        
        // Parse rate limit error specifically
        if (response.status === 429) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message?.includes('free-models-per-day')) {
              console.warn('⚠️ OpenRouter Free Tier Limit Reached (50 requests/day)');
              console.warn('💡 Add 10 credits to unlock 1,000 free requests per day');
              throw new Error('Rate limit: Daily free tier limit reached. Add credits to continue.');
            }
          } catch (e) {
            // Continue with generic error if parsing fails
          }
        }
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      const content = data.choices[0].message.content;
      
      // Log token usage if available
      if (data.usage) {
        console.log(`📊 Token usage - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
      }
      
      return content;
    } catch (error) {
      console.error('OpenRouter AI generation failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced content generation with retry logic
   */
  public async generateEnhancedContent(
    prompt: string, 
    systemPrompt?: string, 
    retries: number = 2
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt} of ${retries}...`);
          // Add a small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        return await this.generateContent(prompt, systemPrompt);
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries) {
          console.error('All retry attempts exhausted');
        }
      }
    }
    
    throw lastError || new Error('Failed to generate content after retries');
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.config.apiKey) {
      issues.push('OpenRouter API key is not configured');
    }
    
    if (!this.config.model) {
      issues.push('Model is not specified');
    }
    
    if (!this.config.baseUrl) {
      issues.push('Base URL is not configured');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Test API connectivity
   */
  public async testConnection(): Promise<boolean> {
    try {
      const testPrompt = 'Reply with "OK" if you receive this message.';
      const response = await this.generateContent(testPrompt);
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openRouterAI = OpenRouterAIService.getInstance();