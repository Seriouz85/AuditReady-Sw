/**
 * harmonization-example.ts
 * Example implementation showing how to use the RequirementHarmonizer system
 * Demonstrates the complete workflow from semantic analysis to harmonization
 */

import { 
  SmartSemanticAnalyzer,
  RequirementHarmonizer,
  createDefaultSemanticAnalyzer,
  createDefaultHarmonizer
} from './index';
import type { 
  RawRequirement, 
  HarmonizationResult,
  HarmonizedRequirement,
  ProcessedRequirement 
} from './index';

/**
 * Example usage of the RequirementHarmonizer system
 */
export async function demonstrateHarmonization(): Promise<void> {
  console.log('=== RequirementHarmonizer Demonstration ===\n');

  // Sample requirements from different frameworks
  const sampleRequirements: RawRequirement[] = [
    {
      id: 'iso27001_a5_1',
      framework: 'ISO27001',
      code: 'A.5.1',
      title: 'Information Security Policy',
      description: 'The organization shall establish and maintain an information security policy that is approved by management, published and communicated to employees and relevant external parties.',
      category: 'Policy Management',
      domain: 'Information Security'
    },
    {
      id: 'nis2_art_21_1',
      framework: 'NIS2',
      code: 'Article 21.1',
      title: 'Cybersecurity Policy',
      description: 'Essential and important entities shall adopt and implement a cybersecurity policy approved by their management body, communicated to all personnel, and made available to relevant stakeholders.',
      category: 'Cybersecurity Governance',
      domain: 'Network Security'
    },
    {
      id: 'cis_control_1_1',
      framework: 'CIS',
      code: '1.1',
      title: 'Asset Inventory Management',
      description: 'Organizations must establish, implement, and actively manage an inventory of authorized and unauthorized devices to ensure that only approved devices are given access to the network.',
      category: 'Asset Management',
      domain: 'Device Control'
    },
    {
      id: 'nist_csf_id_am_1',
      framework: 'NIST_CSF',
      code: 'ID.AM-1',
      title: 'Asset Identification',
      description: 'Physical devices and systems within the organization are inventoried and managed throughout their lifecycle to ensure proper oversight and control.',
      category: 'Asset Management',
      domain: 'Asset Identification'
    }
  ];

  try {
    // Step 1: Initialize semantic analyzer
    console.log('1. Initializing semantic analyzer...');
    const analyzer = createDefaultSemanticAnalyzer();

    // Step 2: Process requirements and perform clustering
    console.log('2. Processing requirements and detecting clusters...');
    const analysisResult = await analyzer.analyzeRequirements(sampleRequirements, {
      processing: {
        enable_vectorization: true,
        extract_keywords: true,
        analyze_structure: true,
        calculate_readability: true,
        generate_hash: true
      },
      clustering: {
        algorithm: 'hierarchical',
        min_similarity: 0.7,
        min_cluster_size: 2,
        max_clusters: 10,
        quality_threshold: 0.6,
        enable_validation: true
      },
      similarity_weights: {
        semantic_weight: 0.4,
        structural_weight: 0.3,
        contextual_weight: 0.2,
        entity_weight: 0.1
      },
      enable_batch_processing: true,
      parallel_processing: true,
      cache_results: true
    });

    console.log(`   - Processed ${analysisResult.processed_requirements.length} requirements`);
    console.log(`   - Found ${analysisResult.clusters.length} clusters`);
    console.log(`   - Processing time: ${analysisResult.performance_metrics.processing_time.toFixed(2)}ms\n`);

    // Step 3: Initialize harmonizer
    console.log('3. Initializing requirement harmonizer...');
    const harmonizer = createDefaultHarmonizer();

    // Step 4: Harmonize requirements within clusters
    console.log('4. Harmonizing requirements...');
    const harmonizationResult: HarmonizationResult = await harmonizer.harmonizeRequirements(
      analysisResult.clusters,
      analysisResult.processed_requirements
    );

    console.log(`   - Successfully harmonized: ${harmonizationResult.harmonized_requirements.length} requirements`);
    console.log(`   - Failed harmonizations: ${harmonizationResult.failed_harmonizations.length}`);
    console.log(`   - Overall quality score: ${harmonizationResult.quality_assessment.overall_quality_score.toFixed(3)}`);
    console.log(`   - Average compliance preservation: ${harmonizationResult.quality_assessment.compliance_preservation_average.toFixed(3)}\n`);

    // Step 5: Display harmonization results
    console.log('5. Harmonization Results:\n');
    
    for (const harmonized of harmonizationResult.harmonized_requirements) {
      displayHarmonizedRequirement(harmonized, analysisResult.processed_requirements);
    }

    // Step 6: Display failed harmonizations
    if (harmonizationResult.failed_harmonizations.length > 0) {
      console.log('\n6. Failed Harmonizations:\n');
      for (const failed of harmonizationResult.failed_harmonizations) {
        console.log(`❌ Cluster ${failed.cluster_id}:`);
        console.log(`   Reason: ${failed.failure_reason}`);
        console.log(`   Fallback: ${failed.fallback_action}`);
        console.log(`   Source Requirements: ${failed.source_requirements.join(', ')}\n`);
      }
    }

    // Step 7: Display quality assessment and recommendations
    console.log('\n7. Quality Assessment:\n');
    const qa = harmonizationResult.quality_assessment;
    console.log(`Overall Quality Score: ${qa.overall_quality_score.toFixed(3)}/1.0`);
    console.log(`Compliance Preservation: ${qa.compliance_preservation_average.toFixed(3)}/1.0`);
    console.log(`Text Complexity Average: ${qa.text_complexity_average.toFixed(3)}`);
    console.log(`Confidence Score Average: ${qa.confidence_score_average.toFixed(3)}/1.0`);
    
    if (qa.recommendations.length > 0) {
      console.log('\nRecommendations:');
      qa.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    if (qa.manual_review_required.length > 0) {
      console.log(`\nManual Review Required: ${qa.manual_review_required.length} requirements`);
    }

    // Step 8: Performance metrics
    console.log('\n8. Performance Metrics:\n');
    const metrics = harmonizationResult.performance_metrics;
    console.log(`Total Processing Time: ${metrics.processing_time.toFixed(2)}ms`);
    console.log(`Clusters Processed: ${metrics.total_clusters_processed}`);
    console.log(`Success Rate: ${((metrics.successful_harmonizations / metrics.total_clusters_processed) * 100).toFixed(1)}%`);
    console.log(`Average Reduction: ${metrics.average_reduction_percentage.toFixed(1)}%`);
    console.log(`Cache Utilization: ${metrics.cache_utilization.toFixed(1)}%`);

  } catch (error) {
    console.error('Error during harmonization demonstration:', error);
    throw error;
  }
}

/**
 * Display detailed information about a harmonized requirement
 */
function displayHarmonizedRequirement(
  harmonized: HarmonizedRequirement,
  originalRequirements: ProcessedRequirement[]
): void {
  console.log(`✅ ${harmonized.id}:`);
  console.log(`   Frameworks: ${harmonized.framework_coverage.join(', ')}`);
  console.log(`   Source Requirements: ${harmonized.source_requirements.length}`);
  console.log(`   Compliance Preservation: ${harmonized.compliance_preservation_score.toFixed(3)}`);
  console.log(`   Text Complexity Ratio: ${harmonized.text_complexity_ratio.toFixed(2)}`);
  console.log(`   Confidence Score: ${harmonized.confidence_score.toFixed(3)}`);
  
  // Show text reduction
  const metadata = harmonized.harmonization_metadata;
  console.log(`   Text Reduction: ${metadata.original_word_count} → ${metadata.unified_word_count} words (${metadata.reduction_percentage.toFixed(1)}% reduction)`);
  
  // Show conflicts resolved
  if (harmonized.conflicts_resolved.length > 0) {
    console.log(`   Conflicts Resolved: ${harmonized.conflicts_resolved.length}`);
    harmonized.conflicts_resolved.forEach(conflict => {
      console.log(`     - ${conflict.conflict_type}: ${conflict.source_values.join(' vs ')} → ${conflict.resolved_value}`);
    });
  }
  
  // Show critical terms preserved
  if (metadata.critical_terms_preserved.length > 0) {
    console.log(`   Critical Terms Preserved: ${metadata.critical_terms_preserved.slice(0, 5).join(', ')}${metadata.critical_terms_preserved.length > 5 ? '...' : ''}`);
  }
  
  console.log('\n   📄 Unified Text:');
  console.log(`   "${harmonized.unified_text}"\n`);
  
  console.log('   📋 Original Requirements:');
  for (const reqId of harmonized.source_requirements) {
    const original = originalRequirements.find(req => req.id === reqId);
    if (original) {
      console.log(`   - [${original.framework}] ${original.original_text.substring(0, 100)}...`);
    }
  }
  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Demonstrate specific harmonization scenarios
 */
export async function demonstrateSpecificScenarios(): Promise<void> {
  console.log('\n=== Specific Harmonization Scenarios ===\n');

  // Scenario 1: Frequency conflicts
  const frequencyConflictRequirements: RawRequirement[] = [
    {
      id: 'req_1',
      framework: 'ISO27001',
      code: 'A.9.2.5',
      title: 'Access Rights Review',
      description: 'Access rights shall be reviewed annually to ensure they remain appropriate.',
      category: 'Access Control',
      domain: 'User Management'
    },
    {
      id: 'req_2',
      framework: 'SOX',
      code: '404',
      title: 'User Access Review',
      description: 'User access permissions must be reviewed quarterly and documented.',
      category: 'Access Control',
      domain: 'User Management'
    }
  ];

  await demonstrateScenario('Frequency Conflict Resolution', frequencyConflictRequirements);

  // Scenario 2: Scope conflicts
  const scopeConflictRequirements: RawRequirement[] = [
    {
      id: 'req_3',
      framework: 'GDPR',
      code: 'Article 30',
      title: 'Records of Processing Activities',
      description: 'All personal data processing activities must be documented and maintained.',
      category: 'Data Protection',
      domain: 'Privacy'
    },
    {
      id: 'req_4',
      framework: 'CCPA',
      code: '1798.100',
      title: 'Consumer Rights',
      description: 'Specific categories of personal information processing must be documented where applicable.',
      category: 'Data Protection',
      domain: 'Privacy'
    }
  ];

  await demonstrateScenario('Scope Conflict Resolution', scopeConflictRequirements);
}

/**
 * Demonstrate a specific harmonization scenario
 */
async function demonstrateScenario(scenarioName: string, requirements: RawRequirement[]): Promise<void> {
  console.log(`🔍 ${scenarioName}:\n`);
  
  try {
    const analyzer = createDefaultSemanticAnalyzer();
    const harmonizer = createDefaultHarmonizer();

    const analysisResult = await analyzer.analyzeRequirements(requirements);
    const harmonizationResult = await harmonizer.harmonizeRequirements(
      analysisResult.clusters,
      analysisResult.processed_requirements
    );

    if (harmonizationResult.harmonized_requirements.length > 0) {
      const harmonized = harmonizationResult.harmonized_requirements[0];
      
      console.log('📋 Original Requirements:');
      requirements.forEach(req => {
        console.log(`   [${req.framework}] ${req.description}`);
      });
      
      console.log('\n✨ Harmonized Result:');
      console.log(`   ${harmonized.unified_text}`);
      
      console.log('\n🔧 Conflicts Resolved:');
      harmonized.conflicts_resolved.forEach(conflict => {
        console.log(`   - ${conflict.conflict_type}: ${conflict.resolved_value} (${conflict.resolution_strategy})`);
      });
      
      console.log(`\n📊 Quality Metrics:`);
      console.log(`   - Compliance Preservation: ${harmonized.compliance_preservation_score.toFixed(3)}`);
      console.log(`   - Text Reduction: ${harmonized.harmonization_metadata.reduction_percentage.toFixed(1)}%`);
      console.log(`   - Confidence: ${harmonized.confidence_score.toFixed(3)}`);
    } else {
      console.log('   ❌ No successful harmonization achieved');
      if (harmonizationResult.failed_harmonizations.length > 0) {
        console.log(`   Reason: ${harmonizationResult.failed_harmonizations[0].failure_reason}`);
      }
    }
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error(`Error in scenario "${scenarioName}":`, error);
  }
}

/**
 * Run all demonstrations
 */
export async function runAllDemonstrations(): Promise<void> {
  try {
    await demonstrateHarmonization();
    await demonstrateSpecificScenarios();
    console.log('🎉 All demonstrations completed successfully!');
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
    throw error;
  }
}

// Export for easy testing
export {
  displayHarmonizedRequirement,
  demonstrateScenario
};