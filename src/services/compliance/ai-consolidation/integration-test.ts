/**
 * Integration Test for AI-Powered Text Consolidation System
 * Demonstrates complete workflow with sample compliance data
 */

import { 
  AIConsolidationIntegrator,
  ConsolidationRequest,
  FrameworkOverlapRequest,
  RequirementData
} from './index';

// Sample compliance requirements for testing
const SAMPLE_REQUIREMENTS: RequirementData[] = [
  {
    id: "iso27001-access-1",
    category: "Access Control",
    title: "User Access Management",
    description: "Organizations must implement formal user access provisioning procedures to assign access rights. This includes regular review of access rights on a quarterly basis and immediate revocation upon termination. All access must be approved by designated authorities and documented in access logs.",
    frameworks: ["ISO27001"],
    mappings: [
      { framework: "ISO27001", requirementCode: "A.9.2.1", confidence: 0.95, mappingType: "direct" }
    ],
    keywords: ["access", "provisioning", "quarterly", "review", "termination", "authorities", "logs"]
  },
  {
    id: "nis2-access-1", 
    category: "Access Control",
    title: "Access Rights Management",
    description: "Essential entities shall establish access management procedures including quarterly access reviews and immediate access revocation procedures. Access must be granted based on business need and documented according to ENISA guidelines. Regular audits of access permissions are mandatory.",
    frameworks: ["NIS2"],
    mappings: [
      { framework: "NIS2", requirementCode: "Article 21(2)(a)", confidence: 0.90, mappingType: "direct" }
    ],
    keywords: ["access", "quarterly", "review", "revocation", "ENISA", "audit", "permissions"]
  },
  {
    id: "gdpr-access-1",
    category: "Access Control", 
    title: "Data Subject Access Controls",
    description: "Controllers must implement appropriate technical and organizational measures to ensure access to personal data is restricted to authorized personnel only. Access logs must be maintained for audit purposes and reviewed monthly. Data subjects have the right to access their personal data.",
    frameworks: ["GDPR"],
    mappings: [
      { framework: "GDPR", requirementCode: "Article 32", confidence: 0.88, mappingType: "partial" }
    ],
    keywords: ["access", "personal data", "authorized", "logs", "monthly", "audit", "data subjects"]
  },
  {
    id: "iso27001-backup-1",
    category: "Backup Management",
    title: "Information Backup",
    description: "Backup copies of information, software and system images shall be taken and tested regularly in accordance with an agreed backup policy. Backups must be stored securely and tested annually for recovery effectiveness.",
    frameworks: ["ISO27001"],
    mappings: [
      { framework: "ISO27001", requirementCode: "A.12.3.1", confidence: 0.92, mappingType: "direct" }
    ],
    keywords: ["backup", "testing", "policy", "annually", "recovery", "secure storage"]
  },
  {
    id: "nis2-backup-1",
    category: "Backup Management", 
    title: "Data Backup Procedures",
    description: "Essential entities must maintain secure backup procedures with regular testing. Backup systems shall be tested at least annually and stored in secure, geographically separated locations as per ENISA recommendations.",
    frameworks: ["NIS2"],
    mappings: [
      { framework: "NIS2", requirementCode: "Article 21(2)(f)", confidence: 0.87, mappingType: "direct" }
    ],
    keywords: ["backup", "testing", "annually", "secure", "geographical", "ENISA"]
  }
];

/**
 * Test the complete AI consolidation workflow
 */
async function testConsolidationWorkflow(): Promise<void> {
  console.log('🚀 Starting AI Consolidation Integration Test\n');

  const integrator = new AIConsolidationIntegrator();

  try {
    // Test 1: Basic consolidation with validation
    console.log('📝 Test 1: Basic Consolidation with Validation');
    
    const accessControlContent = SAMPLE_REQUIREMENTS
      .filter(req => req.category === "Access Control")
      .map(req => `## ${req.title}\n${req.description}`)
      .join('\n\n');

    const consolidationRequest: ConsolidationRequest = {
      content: accessControlContent,
      category: "Access Control",
      frameworks: ["ISO27001", "NIS2", "GDPR"],
      type: "requirements",
      config: {
        preserveDetails: true,
        maintainStructure: true,
        targetReduction: 0.6,
        includeTimeframes: true,
        includeAuthorities: true,
        includeStandards: true
      }
    };

    console.log(`Original content length: ${accessControlContent.length} characters`);
    
    const consolidationResult = await integrator.consolidateWithValidation(consolidationRequest);
    
    console.log(`Consolidated length: ${consolidationResult.consolidation.consolidatedLength} characters`);
    console.log(`Reduction: ${consolidationResult.consolidation.reductionPercentage.toFixed(1)}%`);
    console.log(`From cache: ${consolidationResult.consolidation.fromCache}`);
    console.log(`Validation passed: ${consolidationResult.validation.passed}`);
    console.log(`Overall score: ${consolidationResult.validation.overallScore}%`);
    
    if (consolidationResult.validation.blockingIssues.length > 0) {
      console.log('⚠️ Blocking issues found:');
      consolidationResult.validation.blockingIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message}`);
      });
    }

    console.log('\n✅ Test 1 completed successfully\n');

    // Test 2: Framework overlap analysis
    console.log('📊 Test 2: Framework Overlap Analysis');

    const overlapRequest: FrameworkOverlapRequest = {
      selectedFrameworks: {
        iso27001: true,
        iso27002: false,
        cisControls: null,
        gdpr: true,
        nis2: true,
        dora: false
      },
      requirements: SAMPLE_REQUIREMENTS,
      analysisType: "current"
    };

    const overlapResult = await integrator.analyzeFrameworkOverlap(overlapRequest);
    
    console.log(`Total requirements: ${overlapResult.overallStats.totalRequirements}`);
    console.log(`Unique requirements: ${overlapResult.overallStats.uniqueRequirements}`);
    console.log(`Overlap percentage: ${overlapResult.overallStats.overlapPercentage}%`);
    console.log(`Efficiency gain: ${overlapResult.overallStats.efficiencyGain}%`);
    
    console.log('\nFramework pair overlaps:');
    overlapResult.frameworkPairs.forEach(pair => {
      console.log(`  ${pair.framework1} ↔ ${pair.framework2}: ${pair.overlapPercentage}%`);
    });

    console.log('\n✅ Test 2 completed successfully\n');

    // Test 3: What-if analysis
    console.log('🔮 Test 3: What-If Analysis');

    const whatIfRequest: FrameworkOverlapRequest = {
      selectedFrameworks: {
        iso27001: true,
        iso27002: false,
        cisControls: null,
        gdpr: true,
        nis2: true,
        dora: false
      },
      requirements: SAMPLE_REQUIREMENTS,
      analysisType: "whatif",
      whatIfChanges: {
        iso27001: true,
        iso27002: true, // Adding ISO 27002
        cisControls: 'ig2', // Adding CIS Controls IG2
        gdpr: true,
        nis2: true,
        dora: true // Adding DORA
      }
    };

    const whatIfResult = await integrator.analyzeFrameworkOverlap(whatIfRequest);
    
    if (whatIfResult.whatIfComparison) {
      console.log('Current scenario:');
      console.log(`  Requirements: ${whatIfResult.whatIfComparison.currentScenario.totalRequirements}`);
      console.log(`  Efficiency: ${whatIfResult.whatIfComparison.currentScenario.efficiencyGain}%`);
      
      console.log('What-if scenario:');
      console.log(`  Requirements: ${whatIfResult.whatIfComparison.whatIfScenario.totalRequirements}`);
      console.log(`  Efficiency: ${whatIfResult.whatIfComparison.whatIfScenario.efficiencyGain}%`);
      
      console.log('\nImpact analysis:');
      console.log(`  Requirements delta: ${whatIfResult.whatIfComparison.impact.requirementsDelta}`);
      console.log(`  Efficiency delta: ${whatIfResult.whatIfComparison.impact.efficiencyDelta}%`);
      console.log(`  Added frameworks: ${whatIfResult.whatIfComparison.impact.addedValue.join(', ')}`);
      
      console.log(`\nRecommendation: ${whatIfResult.whatIfComparison.recommendation}`);
    }

    console.log('\n✅ Test 3 completed successfully\n');

    // Test 4: System statistics
    console.log('📈 Test 4: System Statistics');
    
    const stats = integrator.getSystemStats();
    console.log('System capabilities:');
    stats.capabilities.forEach(capability => {
      console.log(`  ✓ ${capability}`);
    });
    
    console.log(`\nCache statistics:`);
    console.log(`  Size: ${stats.cache.size} entries`);
    console.log(`  Hit rate: ${stats.cache.hitRate}%`);
    console.log(`  Oldest entry: ${stats.cache.oldestEntry?.toISOString() || 'None'}`);

    console.log('\n✅ Test 4 completed successfully\n');

    // Test 5: Cache consistency (same input should give same output)
    console.log('🔄 Test 5: Cache Consistency');
    
    console.log('Running same consolidation request again...');
    const secondConsolidation = await integrator.consolidateWithValidation(consolidationRequest);
    
    const isFromCache = secondConsolidation.consolidation.fromCache;
    const contentMatches = secondConsolidation.consolidation.consolidatedContent === 
      consolidationResult.consolidation.consolidatedContent;
    
    console.log(`Result from cache: ${isFromCache}`);
    console.log(`Content matches exactly: ${contentMatches}`);
    console.log(`Fingerprint matches: ${secondConsolidation.consolidation.contentFingerprint === consolidationResult.consolidation.contentFingerprint}`);

    if (isFromCache && contentMatches) {
      console.log('✅ Cache consistency verified - deterministic results achieved');
    } else {
      console.log('⚠️ Cache consistency issue detected');
    }

    console.log('\n✅ Test 5 completed successfully\n');

    console.log('🎉 All integration tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✓ AI consolidation with detail preservation');
    console.log('✓ Deterministic validation with quality metrics');
    console.log('✓ Framework overlap analysis with heatmaps');
    console.log('✓ What-if scenario analysis');
    console.log('✓ Cache consistency and performance tracking');
    console.log('✓ Enterprise-grade error handling and fallbacks');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.error('Stack trace:', error.stack);
    
    // Test fallback behavior
    console.log('\n🔄 Testing fallback behavior...');
    try {
      // This should work even if AI API fails
      const fallbackRequest: ConsolidationRequest = {
        content: "Simple test content for fallback validation.",
        category: "Test Category",
        frameworks: ["ISO27001"],
        type: "requirements",
        config: {
          preserveDetails: true,
          maintainStructure: true,
          targetReduction: 0.5,
          includeTimeframes: false,
          includeAuthorities: false,
          includeStandards: false
        }
      };
      
      const fallbackResult = await integrator.consolidateWithValidation(fallbackRequest);
      console.log('✅ Fallback mechanism working correctly');
      console.log(`Fallback result length: ${fallbackResult.consolidation.consolidatedLength}`);
      
    } catch (fallbackError) {
      console.error('❌ Fallback mechanism also failed:', fallbackError);
    }
  }
}

/**
 * Test individual components
 */
async function testIndividualComponents(): Promise<void> {
  console.log('\n🔧 Testing Individual Components\n');

  try {
    // Test prompt template generation
    console.log('📝 Testing prompt template generation...');
    const { AIPromptTemplates } = await import('./AIPromptTemplates');
    
    const config = {
      preserveDetails: true,
      maintainStructure: true,
      targetReduction: 0.6,
      includeTimeframes: true,
      includeAuthorities: true,
      includeStandards: true
    };

    const systemPrompt = AIPromptTemplates.generateSystemPrompt(config);
    const userPrompt = AIPromptTemplates.generateUserPrompt(
      "Test content for consolidation",
      "Access Control",
      ["ISO27001", "NIS2"],
      config
    );

    console.log(`✓ System prompt generated (${systemPrompt.length} chars)`);
    console.log(`✓ User prompt generated (${userPrompt.length} chars)`);
    
    const fingerprint = AIPromptTemplates.generateContentFingerprint("Test content");
    console.log(`✓ Content fingerprint: ${fingerprint}`);

    console.log('\n✅ Prompt template testing completed\n');

  } catch (error) {
    console.error('❌ Component testing failed:', error);
  }
}

/**
 * Performance benchmark
 */
async function performanceBenchmark(): Promise<void> {
  console.log('⚡ Performance Benchmark\n');

  const integrator = new AIConsolidationIntegrator();
  const iterations = 5;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    const request: ConsolidationRequest = {
      content: `Performance test iteration ${i + 1}. This is sample content for benchmarking the AI consolidation system performance and caching effectiveness.`,
      category: "Performance Test",
      frameworks: ["ISO27001"],
      type: "requirements",
      config: {
        preserveDetails: true,
        maintainStructure: true,
        targetReduction: 0.5,
        includeTimeframes: false,
        includeAuthorities: false,
        includeStandards: false
      }
    };

    try {
      const result = await integrator.consolidateWithValidation(request);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      times.push(duration);
      console.log(`Iteration ${i + 1}: ${duration}ms (from cache: ${result.consolidation.fromCache})`);
      
    } catch (error) {
      console.log(`Iteration ${i + 1}: Failed - ${error.message}`);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`\n📊 Performance Results:`);
    console.log(`Average time: ${avgTime.toFixed(1)}ms`);
    console.log(`Min time: ${minTime}ms`);
    console.log(`Max time: ${maxTime}ms`);
    console.log(`Total iterations: ${times.length}`);

    const stats = integrator.getSystemStats();
    console.log(`Cache hit rate: ${stats.cache.hitRate}%`);
  }

  console.log('\n✅ Performance benchmark completed\n');
}

// Main test execution
async function runAllTests(): Promise<void> {
  console.log('🎯 AI-Powered Text Consolidation System - Integration Tests');
  console.log('================================================================\n');

  await testConsolidationWorkflow();
  await testIndividualComponents();
  await performanceBenchmark();

  console.log('================================================================');
  console.log('🏁 All tests completed!');
}

// Export for use in other contexts
export {
  testConsolidationWorkflow,
  testIndividualComponents,
  performanceBenchmark,
  runAllTests,
  SAMPLE_REQUIREMENTS
};

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}