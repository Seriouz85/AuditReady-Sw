/**
 * ai-integration-demo.ts
 * Demonstration of AI consolidation integration with CleanUnifiedRequirementsGenerator
 */

import { 
  CleanUnifiedRequirementsGenerator,
  FrameworkRequirement,
  EnhancedGenerationOptions 
} from '../CleanUnifiedRequirementsGenerator';
import { 
  UnifiedRequirementsBridge,
  BridgeOptions 
} from '../UnifiedRequirementsBridge';
import { APIKeyDetector } from './APIKeyDetector';

/**
 * Demo function to show AI consolidation integration
 */
export async function demonstrateAIIntegration() {
  console.log('🤖 AI Integration Demonstration Starting...');
  
  // 1. Check API key availability
  const apiStatus = APIKeyDetector.detectAPIKeys();
  console.log('📋 API Key Status:', {
    available: apiStatus.hasValidKey,
    provider: apiStatus.provider,
    source: apiStatus.keySource,
    demo: apiStatus.isDemo
  });

  // 2. Create sample framework requirements
  const sampleRequirements: FrameworkRequirement[] = [
    {
      id: 'iso-a5-1',
      code: 'A.5.1',
      title: 'Information Security Policy',
      description: 'Management shall define and approve information security policies and ensure their communication to all employees and relevant external parties.',
      framework: 'ISO 27001',
      category: 'Access Control'
    },
    {
      id: 'cis-5-1',
      code: '5.1',
      title: 'Account Management',
      description: 'Maintain an inventory of administrative accounts and ensure proper access controls are implemented for privileged users.',
      framework: 'CIS Controls',
      category: 'Access Control'
    },
    {
      id: 'nis2-art8',
      code: 'Article 8',
      title: 'Risk Management',
      description: 'Essential entities shall take appropriate technical and organizational measures to manage risks posed to network and information systems.',
      framework: 'NIS2',
      category: 'Access Control'
    }
  ];

  // 3. Test basic generation without AI
  console.log('\n📄 Testing Standard Generation...');
  try {
    const standardResult = await CleanUnifiedRequirementsGenerator.generateForCategory(
      'Access Control',
      sampleRequirements
    );
    
    if (standardResult) {
      console.log('✅ Standard generation successful:', {
        category: standardResult.category,
        subRequirements: standardResult.subRequirements.length,
        frameworks: standardResult.frameworksCovered,
        contentLength: standardResult.content.length
      });
    } else {
      console.log('❌ Standard generation failed - no template found');
    }
  } catch (error) {
    console.error('❌ Standard generation error:', error);
  }

  // 4. Test AI-enhanced generation
  if (apiStatus.hasValidKey) {
    console.log('\n🤖 Testing AI-Enhanced Generation...');
    try {
      const aiOptions: EnhancedGenerationOptions = {
        enableAIConsolidation: true,
        aiConsolidationOptions: {
          targetReduction: 25,
          qualityThreshold: 85,
          preserveAllDetails: true,
          useCache: true
        },
        includeMetrics: true,
        fallbackToOriginal: true
      };

      const aiResult = await CleanUnifiedRequirementsGenerator.generateForCategoryWithAI(
        'Access Control',
        sampleRequirements,
        aiOptions
      );

      console.log('✅ AI-enhanced generation completed:', {
        success: aiResult.original !== null,
        aiApplied: aiResult.metrics.aiConsolidationApplied,
        reduction: `${aiResult.metrics.textReductionPercentage}%`,
        quality: aiResult.metrics.qualityScore,
        provider: aiResult.metrics.apiKeyStatus,
        processingTime: `${aiResult.metrics.processingTimeMs}ms`,
        cached: aiResult.metrics.cachingUsed
      });

      if (aiResult.enhanced) {
        console.log('🎯 Enhanced content available:', {
          originalLength: aiResult.original?.content.length || 0,
          enhancedLength: aiResult.enhanced.content.length,
          improvement: 'AI consolidation applied successfully'
        });
      }

    } catch (error) {
      console.error('❌ AI-enhanced generation error:', error);
    }
  } else {
    console.log('\n⚠️  Skipping AI-enhanced generation - no valid API key');
  }

  // 5. Test Bridge integration with AI
  console.log('\n🌉 Testing Bridge Integration...');
  try {
    const bridgeOptions: BridgeOptions = {
      enableAIConsolidation: apiStatus.hasValidKey,
      aiConsolidationOptions: {
        targetReduction: 20,
        qualityThreshold: 90,
        preserveAllDetails: true,
        useCache: true
      },
      featureFlags: {
        enableSmartAbstraction: false,
        enableQualityAssurance: true,
        enableTraceabilityMatrix: true,
        enableFallback: true,
        enableAIConsolidation: apiStatus.hasValidKey
      }
    };

    // Mock category mapping for bridge
    const mockMapping = {
      category: 'Access Control',
      frameworks: {
        iso27001: sampleRequirements.filter(r => r.framework === 'ISO 27001'),
        cisControls: sampleRequirements.filter(r => r.framework === 'CIS Controls'),
        nis2: sampleRequirements.filter(r => r.framework === 'NIS2')
      }
    };

    const selectedFrameworks = {
      iso27001: true,
      cisControls: true,
      nis2: true
    };

    const bridgeResult = await UnifiedRequirementsBridge.generateUnifiedRequirementsForCategory(
      mockMapping,
      selectedFrameworks,
      bridgeOptions
    );

    console.log('✅ Bridge integration successful:', {
      contentItems: bridgeResult.length,
      aiEnabled: bridgeOptions.enableAIConsolidation,
      fallbackEnabled: bridgeOptions.featureFlags?.enableFallback
    });

    // Show first few items
    console.log('📝 Sample output:', bridgeResult.slice(0, 3));

  } catch (error) {
    console.error('❌ Bridge integration error:', error);
  }

  console.log('\n🎉 AI Integration Demonstration Complete!');
  
  return {
    apiStatus,
    integrationAvailable: apiStatus.hasValidKey,
    demonstrationComplete: true,
    timestamp: new Date()
  };
}

/**
 * Quick API key check function
 */
export function checkAICapabilities() {
  const status = APIKeyDetector.detectAPIKeys();
  const providerStatus = APIKeyDetector.getProviderStatus();
  
  return {
    currentProvider: status.provider,
    hasValidKey: status.hasValidKey,
    isDemo: status.isDemo,
    keySource: status.keySource,
    allProviders: providerStatus,
    recommendation: !status.hasValidKey 
      ? 'Add VITE_MISTRAL_API_KEY, VITE_OPENAI_API_KEY, or VITE_GEMINI_API_KEY to enable AI consolidation'
      : `AI consolidation ready with ${status.provider.toUpperCase()}`
  };
}

// Export for use in other modules
export const aiIntegrationDemo = {
  demonstrate: demonstrateAIIntegration,
  checkCapabilities: checkAICapabilities
};