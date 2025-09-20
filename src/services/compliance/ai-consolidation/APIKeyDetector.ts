/**
 * APIKeyDetector.ts
 * Detects and manages API key availability for AI consolidation services
 */

export interface APIKeyStatus {
  hasValidKey: boolean;
  provider: 'mistral' | 'openai' | 'gemini' | 'none';
  keySource: string;
  isDemo: boolean;
}

export class APIKeyDetector {
  /**
   * Detect available API keys in order of preference
   */
  static detectAPIKeys(): APIKeyStatus {
    // Check for API keys in order of preference
    const mistralKey = import.meta.env.VITE_MISTRAL_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Demo environment check
    const isDemo = window.location.hostname === 'localhost' || 
                   window.location.hostname.includes('demo') ||
                   import.meta.env.VITE_APP_DEMO_MODE === 'true';

    if (mistralKey && mistralKey.startsWith('sk-')) {
      return {
        hasValidKey: true,
        provider: 'mistral',
        keySource: 'VITE_MISTRAL_API_KEY',
        isDemo
      };
    }

    if (openaiKey && openaiKey.startsWith('sk-')) {
      return {
        hasValidKey: true,
        provider: 'openai',
        keySource: 'VITE_OPENAI_API_KEY',
        isDemo
      };
    }

    if (geminiKey && geminiKey.length > 20) {
      return {
        hasValidKey: true,
        provider: 'gemini',
        keySource: 'VITE_GEMINI_API_KEY',
        isDemo
      };
    }

    return {
      hasValidKey: false,
      provider: 'none',
      keySource: 'No valid API key found',
      isDemo
    };
  }

  /**
   * Check if a specific provider key is available
   */
  static hasProviderKey(provider: 'mistral' | 'openai' | 'gemini'): boolean {
    const status = this.detectAPIKeys();
    return status.hasValidKey && status.provider === provider;
  }

  /**
   * Get key validation status for each provider
   */
  static getProviderStatus() {
    const mistralKey = import.meta.env.VITE_MISTRAL_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    return {
      mistral: {
        available: Boolean(mistralKey && mistralKey.startsWith('sk-')),
        configured: Boolean(mistralKey),
        keyLength: mistralKey ? mistralKey.length : 0
      },
      openai: {
        available: Boolean(openaiKey && openaiKey.startsWith('sk-')),
        configured: Boolean(openaiKey),
        keyLength: openaiKey ? openaiKey.length : 0
      },
      gemini: {
        available: Boolean(geminiKey && geminiKey.length > 20),
        configured: Boolean(geminiKey),
        keyLength: geminiKey ? geminiKey.length : 0
      }
    };
  }
}