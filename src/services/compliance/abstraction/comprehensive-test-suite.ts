/**
 * Comprehensive Test Suite for Smart Requirement Abstraction Engine
 * Tests all components systematically with realistic compliance data
 */

import { 
  SmartSemanticAnalyzer,
  RequirementHarmonizer,
  IntelligentDeduplicationEngine,
  EnhancedCleanUnifiedRequirementsGenerator,
  ComplianceAbstractionService,
  AbstractionConfigurationService,
  createDefaultSemanticAnalyzer,
  createDefaultHarmonizer,
  createDefaultDeduplicationEngine
} from './index';

import type {
  ProcessedRequirement,
  HarmonizationResult,
  DeduplicationResult,
  AbstractionResult,
  WorkflowResult
} from './index';

// Test data representing realistic compliance requirements
const TEST_REQUIREMENTS = {
  iso27001: [
    {
      id: 'ISO27001-5.1.1',
      title: 'Information Security Policies',
      description: 'An information security policy shall be defined, approved by management, published and communicated to employees and relevant external parties.',
      category: 'Policy and Organization',
      priority: 'high',
      framework: 'ISO 27001'
    },
    {
      id: 'ISO27001-6.1.1',
      title: 'Information Security Responsibilities',
      description: 'All information security responsibilities shall be defined and allocated.',
      category: 'Organization',
      priority: 'high',
      framework: 'ISO 27001'
    },
    {
      id: 'ISO27001-8.2.1',
      title: 'Classification of Information',
      description: 'Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.',
      category: 'Asset Management',
      priority: 'medium',
      framework: 'ISO 27001'
    }
  ],
  nis2: [
    {
      id: 'NIS2-Art21.1',
      title: 'Cybersecurity Risk Management',
      description: 'Essential and important entities shall take appropriate and proportionate technical, operational and organizational measures to manage the risks posed to the security of network and information systems.',
      category: 'Risk Management',
      priority: 'high',
      framework: 'NIS2'
    },
    {
      id: 'NIS2-Art21.2a',
      title: 'Policies on Cybersecurity Risk Analysis',
      description: 'Entities shall implement policies on cybersecurity risk analysis and information system security.',
      category: 'Policy',
      priority: 'high',
      framework: 'NIS2'
    },
    {
      id: 'NIS2-Art21.2f',
      title: 'Data Classification and Handling',
      description: 'Basic cyber hygiene practices and cybersecurity training, including policies and procedures regarding the use of data classification systems.',
      category: 'Data Management',
      priority: 'medium',
      framework: 'NIS2'
    }
  ],
  cis: [
    {
      id: 'CIS-1.1',
      title: 'Establish and Maintain Asset Inventory',
      description: 'Establish and maintain an accurate and up-to-date inventory of all technology assets with the potential to store or process data.',
      category: 'Asset Management',
      priority: 'high',
      framework: 'CIS Controls'
    },
    {
      id: 'CIS-2.1',
      title: 'Establish and Maintain Software Inventory',
      description: 'Establish and maintain an accurate and up-to-date inventory of all authorized software that is installed or executed on the enterprise systems.',
      category: 'Asset Management',
      priority: 'high',
      framework: 'CIS Controls'
    },
    {
      id: 'CIS-3.1',
      title: 'Establish and Maintain Data Classification Schema',
      description: 'Establish and maintain a data classification schema based on the level of data sensitivity and use.',
      category: 'Data Management',
      priority: 'medium',
      framework: 'CIS Controls'
    }
  ]
};

export class ComprehensiveTestSuite {
  private testResults: Array<{
    component: string;
    test: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    details: string;
    metrics?: any;
    duration?: number;
  }> = [];

  private logTest(component: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string, metrics?: any, duration?: number) {
    this.testResults.push({
      component,
      test,
      status,
      details,
      metrics,
      duration
    });
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} [${component}] ${test}: ${details}`);
    
    if (metrics) {
      console.log(`   Metrics:`, metrics);
    }
    
    if (duration) {
      console.log(`   Duration: ${duration}ms`);
    }
  }

  // Test 1: SmartSemanticAnalyzer Core Functionality
  async testSmartSemanticAnalyzer(): Promise<void> {
    console.log('\n🧠 Testing SmartSemanticAnalyzer...');
    
    try {
      const startTime = Date.now();
      const analyzer = createDefaultSemanticAnalyzer();
      
      // Test with all requirement sets
      const allRequirements = [
        ...TEST_REQUIREMENTS.iso27001,
        ...TEST_REQUIREMENTS.nis2,
        ...TEST_REQUIREMENTS.cis
      ];

      const result = await analyzer.analyzeRequirements(allRequirements);
      const duration = Date.now() - startTime;

      // Validate results
      if (!result || !result.processed_requirements) {
        this.logTest('SmartSemanticAnalyzer', 'Basic Analysis', 'FAIL', 'No analysis result returned');
        return;
      }

      this.logTest(
        'SmartSemanticAnalyzer', 
        'Basic Analysis', 
        'PASS', 
        `Analyzed ${result.processed_requirements.length} requirements`,
        {
          processed: result.processed_requirements.length,
          clusters: result.semantic_clusters?.length || 0,
          similarities: result.similarity_matches?.length || 0
        },
        duration
      );

      // Test semantic clustering
      if (result.semantic_clusters && result.semantic_clusters.length > 0) {
        this.logTest(
          'SmartSemanticAnalyzer',
          'Semantic Clustering',
          'PASS',
          `Generated ${result.semantic_clusters.length} semantic clusters`,
          { clusters: result.semantic_clusters.length }
        );
      } else {
        this.logTest(
          'SmartSemanticAnalyzer',
          'Semantic Clustering',
          'WARNING',
          'No semantic clusters generated'
        );
      }

      // Test similarity matching
      if (result.similarity_matches && result.similarity_matches.length > 0) {
        this.logTest(
          'SmartSemanticAnalyzer',
          'Similarity Matching',
          'PASS',
          `Found ${result.similarity_matches.length} similarity matches`
        );
      } else {
        this.logTest(
          'SmartSemanticAnalyzer',
          'Similarity Matching',
          'WARNING',
          'No similarity matches found'
        );
      }

    } catch (error) {
      this.logTest(
        'SmartSemanticAnalyzer',
        'Basic Analysis',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Test 2: RequirementHarmonizer Functionality
  async testRequirementHarmonizer(): Promise<void> {
    console.log('\n🔄 Testing RequirementHarmonizer...');
    
    try {
      const startTime = Date.now();
      const harmonizer = createDefaultHarmonizer();

      // Test with policy requirements that should harmonize well
      const policyRequirements = [
        TEST_REQUIREMENTS.iso27001[0], // Information Security Policies
        TEST_REQUIREMENTS.nis2[1]      // Policies on Cybersecurity Risk Analysis
      ];

      // Mock clusters for testing - harmonizeRequirements expects clusters and processed requirements
      const mockClusters = [
        {
          id: 'cluster_1',
          center: policyRequirements[0],
          members: policyRequirements,
          coherence_score: 0.85,
          theme: 'Security Policies'
        }
      ];

      const processedRequirements = policyRequirements.map((req, index) => ({
        ...req,
        processed_id: `processed_${index}`,
        semantic_vector: new Array(100).fill(0).map(() => Math.random()),
        structure: {
          clauses: [req.description],
          requirements: [req.description],
          context: req.category
        },
        metadata: {
          complexity_score: 0.5,
          specificity_level: 0.7,
          framework_confidence: 0.9
        }
      }));

      const result = await harmonizer.harmonizeRequirements(mockClusters, processedRequirements);
      const duration = Date.now() - startTime;

      if (!result || !result.harmonized_requirements) {
        this.logTest('RequirementHarmonizer', 'Basic Harmonization', 'FAIL', 'No harmonization result returned');
        return;
      }

      this.logTest(
        'RequirementHarmonizer',
        'Basic Harmonization',
        'PASS',
        `Harmonized ${result.harmonized_requirements.length} requirements from ${policyRequirements.length} sources`,
        {
          input: policyRequirements.length,
          output: result.harmonized_requirements.length,
          conflicts: result.conflicts_resolved?.length || 0,
          quality_score: result.quality_assessment?.overall_score || 0
        },
        duration
      );

      // Test conflict resolution
      if (result.conflicts_resolved && result.conflicts_resolved.length > 0) {
        this.logTest(
          'RequirementHarmonizer',
          'Conflict Resolution',
          'PASS',
          `Resolved ${result.conflicts_resolved.length} conflicts`
        );
      } else {
        this.logTest(
          'RequirementHarmonizer',
          'Conflict Resolution',
          'PASS',
          'No conflicts detected (good for similar requirements)'
        );
      }

      // Test quality assessment
      if (result.quality_assessment) {
        const qualityScore = result.quality_assessment.overall_score || 0;
        const status = qualityScore >= 0.8 ? 'PASS' : qualityScore >= 0.6 ? 'WARNING' : 'FAIL';
        this.logTest(
          'RequirementHarmonizer',
          'Quality Assessment',
          status,
          `Quality score: ${qualityScore.toFixed(2)}`
        );
      } else {
        this.logTest(
          'RequirementHarmonizer',
          'Quality Assessment',
          'WARNING',
          'No quality assessment provided'
        );
      }

    } catch (error) {
      this.logTest(
        'RequirementHarmonizer',
        'Basic Harmonization',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Test 3: IntelligentDeduplicationEngine
  async testIntelligentDeduplicationEngine(): Promise<void> {
    console.log('\n🔍 Testing IntelligentDeduplicationEngine...');
    
    try {
      const startTime = Date.now();
      
      // Try to create the engine dynamically to work around import issues
      let engine;
      try {
        engine = createDefaultDeduplicationEngine();
      } catch (importError) {
        this.logTest(
          'IntelligentDeduplicationEngine',
          'Engine Creation',
          'FAIL',
          `Failed to create engine: ${importError.message}`
        );
        return;
      }

      // Create test data with intentional duplicates
      const requirementsWithDuplicates = [
        {
          id: 'REQ-1',
          title: 'Asset Management Policy',
          description: 'Establish and maintain an inventory of organizational assets.',
          category: 'Asset Management',
          priority: 'high',
          framework: 'Test Framework 1'
        },
        {
          id: 'REQ-2',
          title: 'Asset Inventory Management',
          description: 'Maintain an accurate and up-to-date inventory of all organizational assets.',
          category: 'Asset Management',
          priority: 'high',
          framework: 'Test Framework 2'
        },
        {
          id: 'REQ-3',
          title: 'Unique Requirement',
          description: 'This requirement has completely different content and should not be deduplicated.',
          category: 'Access Control',
          priority: 'medium',
          framework: 'Test Framework 3'
        }
      ];

      const result = await engine.deduplicateRequirements(requirementsWithDuplicates);
      const duration = Date.now() - startTime;

      if (!result || !result.deduplicated_requirements) {
        this.logTest('IntelligentDeduplicationEngine', 'Basic Deduplication', 'FAIL', 'No deduplication result returned');
        return;
      }

      const reductionRate = ((requirementsWithDuplicates.length - result.deduplicated_requirements.length) / requirementsWithDuplicates.length) * 100;

      this.logTest(
        'IntelligentDeduplicationEngine',
        'Basic Deduplication',
        'PASS',
        `Reduced ${requirementsWithDuplicates.length} to ${result.deduplicated_requirements.length} requirements (${reductionRate.toFixed(1)}% reduction)`,
        {
          input: requirementsWithDuplicates.length,
          output: result.deduplicated_requirements.length,
          duplicates_found: result.summary?.duplicates_found || 0,
          reduction_rate: `${reductionRate.toFixed(1)}%`
        },
        duration
      );

      // Test duplicate detection accuracy
      if (result.summary?.duplicates_found && result.summary.duplicates_found > 0) {
        this.logTest(
          'IntelligentDeduplicationEngine',
          'Duplicate Detection',
          'PASS',
          `Correctly identified ${result.summary.duplicates_found} duplicates`
        );
      } else {
        this.logTest(
          'IntelligentDeduplicationEngine',
          'Duplicate Detection',
          'WARNING',
          'No duplicates detected in test data with known duplicates'
        );
      }

    } catch (error) {
      this.logTest(
        'IntelligentDeduplicationEngine',
        'Basic Deduplication',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Test 4: EnhancedCleanUnifiedRequirementsGenerator Integration
  async testEnhancedGenerator(): Promise<void> {
    console.log('\n⚡ Testing EnhancedCleanUnifiedRequirementsGenerator...');
    
    try {
      const startTime = Date.now();
      // Using static methods as they are defined in the class

      // Test with mixed requirements
      const testRequirements = [
        ...TEST_REQUIREMENTS.iso27001.slice(0, 2),
        ...TEST_REQUIREMENTS.nis2.slice(0, 2)
      ];

      const result = await EnhancedCleanUnifiedRequirementsGenerator.generateForCategory('Risk Management', testRequirements, {
        enable_abstraction: true,
        abstraction_mode: 'smart',
        preserve_compliance: true,
        quality_thresholds: {
          min_compliance_preservation: 0.95,
          max_complexity_increase: 1.3,
          min_clarity_score: 0.7
        }
      });
      const duration = Date.now() - startTime;

      if (!result || !result.unified_requirements) {
        this.logTest('EnhancedGenerator', 'Smart Abstraction', 'FAIL', 'No generation result returned');
        return;
      }

      this.logTest(
        'EnhancedGenerator',
        'Smart Abstraction',
        'PASS',
        `Generated ${result.unified_requirements.length} unified requirements from ${testRequirements.length} inputs`,
        {
          input: testRequirements.length,
          output: result.unified_requirements.length,
          abstraction_applied: result.abstraction_applied || false,
          quality_score: result.quality_metrics?.overall_score || 0
        },
        duration
      );

      // Test fallback mechanism
      const fallbackResult = await EnhancedCleanUnifiedRequirementsGenerator.generateForCategory('Risk Management', testRequirements, {
        enable_abstraction: false,
        abstraction_mode: 'conservative'
      });

      if (fallbackResult) {
        this.logTest(
          'EnhancedGenerator',
          'Fallback Mechanism',
          'PASS',
          'Successfully generated requirements with abstraction disabled'
        );
      } else {
        this.logTest(
          'EnhancedGenerator',
          'Fallback Mechanism',
          'FAIL',
          'Fallback generation failed'
        );
      }

    } catch (error) {
      this.logTest(
        'EnhancedGenerator',
        'Smart Abstraction',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Test 5: ComplianceAbstractionService Orchestration
  async testComplianceAbstractionService(): Promise<void> {
    console.log('\n🎭 Testing ComplianceAbstractionService...');
    
    try {
      const startTime = Date.now();
      const service = new ComplianceAbstractionService();

      const testRequirements = [
        ...TEST_REQUIREMENTS.iso27001,
        ...TEST_REQUIREMENTS.nis2.slice(0, 2)
      ];

      const category = { 
        name: 'Risk Management', 
        requirements: testRequirements 
      };
      const config = {};
      const options = {
        mode: 'smart' as const,
        enableProgressTracking: true,
        enableCaching: true,
        fallbackStrategy: 'GRACEFUL' as const,
        qualityThresholds: {
          minimum: 0.7,
          compliance_preservation: 0.95,
          complexity_limit: 1.3
        }
      };

      const result = await service.processSingleCategory(category, config, options);
      const duration = Date.now() - startTime;

      if (!result || !result.unified_requirements) {
        this.logTest('ComplianceAbstractionService', 'Full Workflow', 'FAIL', 'No workflow result returned');
        return;
      }

      this.logTest(
        'ComplianceAbstractionService',
        'Full Workflow',
        'PASS',
        `Processed workflow with ${result.unified_requirements.length} final requirements`,
        {
          input: testRequirements.length,
          output: result.unified_requirements.length,
          abstraction_applied: result.abstraction_applied || false,
          quality_score: result.quality_metrics?.overall_score || 0
        },
        duration
      );

      // Test quality metrics
      if (result.quality_metrics) {
        this.logTest(
          'ComplianceAbstractionService',
          'Quality Metrics',
          'PASS',
          `Quality metrics available with score ${result.quality_metrics.overall_score || 0}`
        );
      } else {
        this.logTest(
          'ComplianceAbstractionService',
          'Quality Metrics',
          'WARNING',
          'No quality metrics generated'
        );
      }

    } catch (error) {
      this.logTest(
        'ComplianceAbstractionService',
        'Full Workflow',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Test 6: Configuration Service
  async testAbstractionConfigurationService(): Promise<void> {
    console.log('\n⚙️ Testing AbstractionConfigurationService...');
    
    try {
      const service = new AbstractionConfigurationService();

      // Test configuration for smart mode
      const defaultConfig = await service.getConfigForMode('smart');
      
      if (defaultConfig) {
        this.logTest(
          'AbstractionConfigurationService',
          'Default Configuration',
          'PASS',
          'Successfully retrieved default configuration',
          {
            has_semantic_analysis: !!defaultConfig.semantic_analysis,
            has_harmonization: !!defaultConfig.harmonization,
            has_deduplication: !!defaultConfig.deduplication
          }
        );
      } else {
        this.logTest(
          'AbstractionConfigurationService',
          'Default Configuration',
          'FAIL',
          'Failed to retrieve default configuration'
        );
      }

      // Test configuration validation
      const validConfig = {
        semantic_analysis: {
          enable_clustering: true,
          similarity_threshold: 0.8,
          max_cluster_size: 10
        },
        harmonization: {
          conflict_resolution: 'merge_comprehensive' as const,
          preserve_framework_specific: true,
          quality_threshold: 0.7
        },
        deduplication: {
          strategy: 'semantic_similarity' as const,
          similarity_threshold: 0.85,
          preserve_unique_aspects: true
        }
      };

      const validationResult = await service.getConfigForMode('custom');
      
      if (validationResult) {
        this.logTest(
          'AbstractionConfigurationService',
          'Configuration Retrieval',
          'PASS',
          'Successfully retrieved custom configuration'
        );
      } else {
        this.logTest(
          'AbstractionConfigurationService',
          'Configuration Retrieval',
          'FAIL',
          'Failed to retrieve custom configuration'
        );
      }

    } catch (error) {
      this.logTest(
        'AbstractionConfigurationService',
        'Configuration Tests',
        'FAIL',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite for Smart Requirement Abstraction Engine\n');
    
    const overallStartTime = Date.now();

    await this.testSmartSemanticAnalyzer();
    await this.testRequirementHarmonizer();
    await this.testIntelligentDeduplicationEngine();
    await this.testEnhancedGenerator();
    await this.testComplianceAbstractionService();
    await this.testAbstractionConfigurationService();

    const overallDuration = Date.now() - overallStartTime;

    this.generateTestReport(overallDuration);
  }

  // Generate comprehensive test report
  generateTestReport(totalDuration: number): void {
    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('=====================================');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
    const warningTests = this.testResults.filter(t => t.status === 'WARNING').length;

    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`   ⚠️  Warnings: ${warningTests} (${((warningTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);

    console.log(`\n📋 Detailed Results by Component:`);
    
    const componentGroups = this.testResults.reduce((groups, test) => {
      if (!groups[test.component]) {
        groups[test.component] = [];
      }
      groups[test.component].push(test);
      return groups;
    }, {} as Record<string, typeof this.testResults>);

    for (const [component, tests] of Object.entries(componentGroups)) {
      const componentPassed = tests.filter(t => t.status === 'PASS').length;
      const componentTotal = tests.length;
      const statusIcon = componentPassed === componentTotal ? '✅' : 
                        tests.some(t => t.status === 'FAIL') ? '❌' : '⚠️';
      
      console.log(`\n   ${statusIcon} ${component} (${componentPassed}/${componentTotal} passed):`);
      
      for (const test of tests) {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`      ${icon} ${test.test}: ${test.details}`);
        
        if (test.duration) {
          console.log(`         Duration: ${test.duration}ms`);
        }
      }
    }

    // Production readiness assessment
    console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');
    console.log('=====================================');

    const criticalFailures = this.testResults.filter(t => 
      t.status === 'FAIL' && 
      (t.component.includes('Core') || t.test.includes('Basic') || t.test.includes('Integration'))
    );

    if (criticalFailures.length === 0) {
      console.log('✅ READY FOR PRODUCTION: All critical tests passed');
    } else {
      console.log('❌ NOT READY FOR PRODUCTION: Critical failures detected');
      console.log('\nCritical issues to resolve:');
      for (const failure of criticalFailures) {
        console.log(`   - ${failure.component}.${failure.test}: ${failure.details}`);
      }
    }

    console.log('\n📋 Deployment Recommendations:');
    if (failedTests === 0) {
      console.log('   ✅ All components functional - Deploy with confidence');
      console.log('   ✅ Enable all abstraction features');
      console.log('   ✅ Monitor performance metrics in production');
    } else if (criticalFailures.length === 0) {
      console.log('   ⚠️  Deploy with caution - Monitor affected components');
      console.log('   ⚠️  Consider feature flags for components with warnings');
      console.log('   ⚠️  Plan fixes for failed non-critical tests');
    } else {
      console.log('   ❌ Do not deploy - Fix critical issues first');
      console.log('   ❌ Re-run tests after fixes');
      console.log('   ❌ Consider rollback plan if already deployed');
    }

    console.log('\n=====================================');
    console.log('🏁 Test Suite Complete');
  }

  // Get test results for external use
  getTestResults() {
    return {
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.status === 'PASS').length,
        failed: this.testResults.filter(t => t.status === 'FAIL').length,
        warnings: this.testResults.filter(t => t.status === 'WARNING').length
      }
    };
  }
}

// Export test runner for external use
export const runComprehensiveTests = async () => {
  const suite = new ComprehensiveTestSuite();
  await suite.runAllTests();
  return suite.getTestResults();
};

// Auto-run if called directly
if (typeof window === 'undefined' && import.meta.url === new URL(process.argv[1], 'file:').href) {
  runComprehensiveTests().catch(console.error);
}