/**
 * Integration Test for Smart Abstraction Engine
 * 
 * Basic test to verify that all integration components work together
 * This file should be used for manual testing and validation
 */

import { 
  EnhancedCleanUnifiedRequirementsGenerator,
  AbstractionConfigurationService,
  ComplianceAbstractionService,
  AbstractionMode
} from './index';

import { FrameworkRequirement } from '../CleanUnifiedRequirementsGenerator';

/**
 * Test basic abstraction functionality
 */
export async function testBasicAbstraction() {
  console.log('[INTEGRATION-TEST] Starting basic abstraction test...');
  
  try {
    // Create test requirements
    const testRequirements: FrameworkRequirement[] = [
      {
        id: 'test-1',
        code: 'ISO-27001-A.5.1',
        title: 'Information Security Policy',
        description: 'An information security policy shall be defined, approved by management, published and communicated to employees and relevant external parties.',
        framework: 'ISO 27001',
        category: 'Information Security Management'
      },
      {
        id: 'test-2', 
        code: 'NIS2-Art.21',
        title: 'Cybersecurity Risk Management',
        description: 'Essential and important entities shall adopt appropriate technical, operational and organisational measures to manage the risks posed to the security of network and information systems.',
        framework: 'NIS2',
        category: 'Information Security Management'
      },
      {
        id: 'test-3',
        code: 'CIS-1.1',
        title: 'Inventory and Control of Enterprise Assets',
        description: 'Actively manage (inventory, track, and correct) all enterprise assets (end-user devices, including portable and mobile; network devices; non-computing/IoT devices; and servers) connected to the infrastructure physically, virtually, remotely, and those within cloud environments, to accurately know the totality of assets that need to be monitored and protected within the enterprise.',
        framework: 'CIS Controls',
        category: 'Information Security Management'
      }
    ];
    
    // Test enhanced generator
    const result = await EnhancedCleanUnifiedRequirementsGenerator.generateForCategory(
      'Information Security Management',
      testRequirements,
      {
        abstraction: {
          mode: 'MODERATE',
          enableDeduplication: true,
          preserveAllReferences: true,
          qualityThreshold: 0.8,
          maxComplexityIncrease: 1.3,
          enableFallback: true
        },
        featureFlags: {
          enableAbstraction: true,
          enableProgressReporting: true,
          enableQualityAssurance: true,
          enableCaching: false
        }
      }
    );
    
    console.log('[INTEGRATION-TEST] Enhanced generator result:', {
      originalPresent: !!result.original,
      enhancedPresent: !!result.enhanced,
      abstractionApplied: result.abstraction.applied,
      reductionPercentage: result.abstraction.reductionPercentage,
      qualityScore: result.abstraction.qualityScore,
      processingTime: result.performance.processingTimeMs
    });
    
    // Test configuration service
    const configService = new AbstractionConfigurationService();
    const config = await configService.getConfigForMode('MODERATE');
    
    console.log('[INTEGRATION-TEST] Configuration service working:', {
      mode: config.mode,
      deduplicationEnabled: config.deduplication.processing_options.enable_exact_deduplication,
      qualityThreshold: config.quality.minCompliancePreservation
    });
    
    // Test abstraction service
    const abstractionService = new ComplianceAbstractionService();
    const workflowResult = await abstractionService.executeWorkflow(
      [{ name: 'Information Security Management', requirements: testRequirements }],
      {
        mode: 'MODERATE',
        frameworks: ['iso27001', 'nis2', 'cisControls'],
        enableCaching: false,
        enableProgressTracking: false,
        enableAuditTrail: true,
        performanceOptimizations: true,
        fallbackStrategy: 'GRACEFUL',
        qualityThresholds: {
          minimum: 0.8,
          target: 0.9,
          excellent: 0.95
        }
      }
    );
    
    console.log('[INTEGRATION-TEST] Workflow result:', {
      success: workflowResult.success,
      categoriesProcessed: workflowResult.summary.categoriesProcessed,
      abstractionApplied: workflowResult.summary.categoriesWithAbstraction,
      averageReduction: workflowResult.summary.totalReductionAchieved,
      auditEntries: workflowResult.auditTrail?.length || 0
    });
    
    return {
      success: true,
      enhancedGeneratorWorking: !!result.original,
      configServiceWorking: !!config,
      abstractionServiceWorking: workflowResult.success,
      results: {
        enhancedResult: result,
        config,
        workflowResult
      }
    };
    
  } catch (error) {
    console.error('[INTEGRATION-TEST] Test failed:', error);
    return {
      success: false,
      error: error.message,
      enhancedGeneratorWorking: false,
      configServiceWorking: false,
      abstractionServiceWorking: false
    };
  }
}

/**
 * Test backward compatibility with existing system
 */
export async function testBackwardCompatibility() {
  console.log('[INTEGRATION-TEST] Testing backward compatibility...');
  
  try {
    // Import the enhanced bridge
    const { UnifiedRequirementsBridge } = await import('../UnifiedRequirementsBridge');
    
    // Create test mapping (simulating existing system format)
    const testMapping = {
      category: 'Information Security Management',
      frameworks: {
        iso27001: [{
          id: 'iso-test',
          code: 'A.5.1',
          title: 'Information Security Policy',
          description: 'Test description for backward compatibility'
        }]
      }
    };
    
    const selectedFrameworks = { iso27001: true };
    
    // Test with abstraction disabled (backward compatibility mode)
    const standardResult = await UnifiedRequirementsBridge.generateUnifiedRequirementsForCategory(
      testMapping,
      selectedFrameworks,
      {
        enableAbstraction: false,
        featureFlags: {
          enableSmartAbstraction: false,
          enableQualityAssurance: true,
          enableTraceabilityMatrix: true,
          enableFallback: true
        }
      }
    );
    
    // Test with abstraction enabled
    const enhancedResult = await UnifiedRequirementsBridge.generateUnifiedRequirementsForCategory(
      testMapping,
      selectedFrameworks,
      {
        enableAbstraction: true,
        abstractionMode: 'CONSERVATIVE',
        featureFlags: {
          enableSmartAbstraction: true,
          enableQualityAssurance: true,
          enableTraceabilityMatrix: true,
          enableFallback: true
        }
      }
    );
    
    console.log('[INTEGRATION-TEST] Backward compatibility results:', {
      standardResultLength: standardResult.length,
      enhancedResultLength: enhancedResult.length,
      bothSuccessful: standardResult.length > 0 && enhancedResult.length > 0
    });
    
    return {
      success: true,
      backwardCompatible: standardResult.length > 0,
      enhancementWorking: enhancedResult.length > 0,
      results: {
        standardResult,
        enhancedResult
      }
    };
    
  } catch (error) {
    console.error('[INTEGRATION-TEST] Backward compatibility test failed:', error);
    return {
      success: false,
      error: error.message,
      backwardCompatible: false,
      enhancementWorking: false
    };
  }
}

/**
 * Run all integration tests
 */
export async function runAllIntegrationTests() {
  console.log('[INTEGRATION-TEST] Running all integration tests...');
  
  const results = {
    basicAbstraction: await testBasicAbstraction(),
    backwardCompatibility: await testBackwardCompatibility()
  };
  
  const allTestsPass = results.basicAbstraction.success && results.backwardCompatibility.success;
  
  console.log('[INTEGRATION-TEST] All tests completed:', {
    success: allTestsPass,
    basicAbstraction: results.basicAbstraction.success,
    backwardCompatibility: results.backwardCompatibility.success
  });
  
  return {
    success: allTestsPass,
    results
  };
}

// Export for manual testing
export default {
  testBasicAbstraction,
  testBackwardCompatibility,
  runAllIntegrationTests
};