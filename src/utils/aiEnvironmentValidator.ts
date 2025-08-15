/**
 * AI Environment Validation Utility
 * ================================
 * 
 * Validates environment configuration for AI-powered features
 * and provides user-friendly error messages and setup instructions.
 */

export interface AIEnvironmentStatus {
  isValid: boolean;
  hasGeminiKey: boolean;
  hasOpenAIKey: boolean;
  hasAnyAI: boolean;
  provider: 'gemini' | 'openai' | 'none';
  issues: string[];
  setupInstructions: string[];
}

/**
 * Validate AI environment configuration
 */
export function validateAIEnvironment(): AIEnvironmentStatus {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  const hasGeminiKey = Boolean(geminiKey && geminiKey.trim().length > 0);
  const hasOpenAIKey = Boolean(openaiKey && openaiKey.trim().length > 0);
  const hasAnyAI = hasGeminiKey || hasOpenAIKey;
  
  const issues: string[] = [];
  const setupInstructions: string[] = [];
  
  if (!hasGeminiKey && !hasOpenAIKey) {
    issues.push('No AI API keys configured');
    setupInstructions.push(
      '1. Obtain a Google Gemini API key from https://makersuite.google.com/app/apikey',
      '2. Add VITE_GEMINI_API_KEY=your_key_here to your .env file',
      '3. Restart the development server',
      '',
      'Alternative: Use OpenAI by setting VITE_OPENAI_API_KEY instead'
    );
  } else if (!hasGeminiKey && hasOpenAIKey) {
    setupInstructions.push(
      'Currently using OpenAI. For optimal compliance guidance, consider adding Gemini:',
      '1. Get Gemini API key from https://makersuite.google.com/app/apikey',
      '2. Add VITE_GEMINI_API_KEY=your_key_here to your .env file'
    );
  }
  
  // Determine preferred provider
  let provider: 'gemini' | 'openai' | 'none' = 'none';
  if (hasGeminiKey) {
    provider = 'gemini';
  } else if (hasOpenAIKey) {
    provider = 'openai';
  }
  
  return {
    isValid: hasAnyAI,
    hasGeminiKey,
    hasOpenAIKey,
    hasAnyAI,
    provider,
    issues,
    setupInstructions
  };
}

/**
 * Get AI provider display information
 */
export function getAIProviderInfo(provider: 'gemini' | 'openai' | 'none') {
  switch (provider) {
    case 'gemini':
      return {
        name: 'Google Gemini',
        icon: '🧠',
        color: 'text-blue-600',
        description: 'Optimized for compliance and regulatory content'
      };
    case 'openai':
      return {
        name: 'OpenAI GPT',
        icon: '🤖',
        color: 'text-green-600',
        description: 'General-purpose AI with strong reasoning capabilities'
      };
    case 'none':
      return {
        name: 'No AI Provider',
        icon: '⚠️',
        color: 'text-red-600',
        description: 'AI features disabled - API key required'
      };
  }
}

/**
 * Check if AI features should be enabled by default
 */
export function shouldEnableAIByDefault(): boolean {
  const { isValid } = validateAIEnvironment();
  return isValid;
}

/**
 * Get user-friendly error message for AI failures
 */
export function getAIErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  if (message.includes('API key')) {
    return 'AI API key is missing or invalid. Please check your environment configuration.';
  }
  
  if (message.includes('quota') || message.includes('rate limit')) {
    return 'AI service quota exceeded. Please try again later or upgrade your API plan.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'AI request timed out. The service may be experiencing high load. Please try again.';
  }
  
  return 'AI service temporarily unavailable. Using fallback content generation.';
}

/**
 * Format environment setup instructions for display
 */
export function formatSetupInstructions(instructions: string[]): string {
  return instructions.join('\n');
}