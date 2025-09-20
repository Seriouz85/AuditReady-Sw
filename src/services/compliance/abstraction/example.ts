/**
 * Example usage of SmartSemanticAnalyzer
 * Demonstrates basic functionality and API usage
 */

import { 
  SmartSemanticAnalyzer, 
  createDefaultSemanticAnalyzer,
  createCustomSemanticAnalyzer,
  RawRequirement 
} from './index';

// Example raw requirements for testing
const exampleRequirements: RawRequirement[] = [
  {
    id: 'req_001',
    framework: 'ISO27001',
    code: 'A.5.1.1',
    title: 'Information Security Policy',
    description: 'The organization shall establish, implement, and maintain an information security policy that is approved by management, published and communicated to employees and relevant external parties.',
    category: 'GOVERNANCE',
    domain: 'SECURITY'
  },
  {
    id: 'req_002', 
    framework: 'NIS2',
    code: 'Art.21.1',
    title: 'Cybersecurity Governance',
    description: 'Essential entities shall implement appropriate cybersecurity governance structures and processes to manage cybersecurity risks effectively.',
    category: 'GOVERNANCE',
    domain: 'CYBERSECURITY'
  },
  {
    id: 'req_003',
    framework: 'CIS',
    code: 'Control 1.1',
    title: 'Asset Inventory',
    description: 'Maintain an accurate and up-to-date inventory of all technology assets with the potential to store or process data.',
    category: 'ASSET_MANAGEMENT',
    domain: 'TECHNOLOGY'
  }
];

/**
 * Example: Basic semantic analysis
 */
export async function exampleBasicAnalysis() {
  console.log('🚀 Starting basic semantic analysis example...');
  
  // Create analyzer with default settings
  const analyzer = createDefaultSemanticAnalyzer();
  
  // Perform analysis
  const result = await analyzer.analyzeRequirements(exampleRequirements);
  
  console.log('📊 Analysis Results:');
  console.log(`- Processed ${result.analysis_summary.processed_successfully} requirements`);
  console.log(`- Generated ${result.analysis_summary.total_clusters} clusters`);
  console.log(`- Highest similarity: ${(result.analysis_summary.highest_similarity_score * 100).toFixed(1)}%`);
  console.log(`- Processing time: ${result.analysis_summary.processing_time_ms.toFixed(0)}ms`);
  
  return result;
}

/**
 * Example: Find similar requirements
 */
export async function exampleSimilaritySearch() {
  console.log('🔍 Starting similarity search example...');
  
  const analyzer = createDefaultSemanticAnalyzer();
  
  // Find requirements similar to the first one
  const targetRequirement = exampleRequirements[0];
  const candidateRequirements = exampleRequirements.slice(1);
  
  const similarRequirements = await analyzer.findSimilarRequirements(
    targetRequirement,
    candidateRequirements,
    0.3, // Lower threshold for demo
    5    // Max results
  );
  
  console.log('🎯 Similar Requirements Found:');
  similarRequirements.forEach((sim, index) => {
    console.log(`${index + 1}. ${sim.target_id} - Similarity: ${(sim.combined_score * 100).toFixed(1)}%`);
    console.log(`   Explanation: ${sim.explanation}`);
  });
  
  return similarRequirements;
}

/**
 * Example: Custom configuration
 */
export async function exampleCustomConfiguration() {
  console.log('⚙️ Starting custom configuration example...');
  
  // Create analyzer with custom settings
  const analyzer = createCustomSemanticAnalyzer({
    similarity_thresholds: {
      semantic: 0.8,
      structural: 0.7, 
      contextual: 0.9,
      clustering: 0.75
    },
    tfidf_weights: {
      control_terms: 2.0,     // Higher weight for control terms
      process_terms: 1.5,
      technical_terms: 1.8,
      domain_terms: 1.6
    }
  });
  
  const result = await analyzer.analyzeRequirements(exampleRequirements);
  
  console.log('📈 Custom Analysis Results:');
  console.log(`- Cache hit rate: ${result.performance_metrics.cache_hit_rate.toFixed(1)}%`);
  console.log(`- Average processing time: ${result.performance_metrics.average_similarity_computation_time.toFixed(2)}ms`);
  
  return result;
}

/**
 * Example: Requirement pair analysis
 */
export async function examplePairAnalysis() {
  console.log('🔬 Starting requirement pair analysis example...');
  
  const analyzer = createDefaultSemanticAnalyzer();
  
  // Analyze specific pair relationship
  const analysis = await analyzer.analyzeRequirementPair(
    exampleRequirements[0],
    exampleRequirements[1]
  );
  
  console.log('🧬 Pair Analysis Results:');
  console.log(`- Similarity Score: ${(analysis.similarity * 100).toFixed(1)}%`);
  console.log(`- Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
  console.log(`- Processing Time: ${analysis.processing_time.toFixed(2)}ms`);
  console.log(`- Entities Found: ${analysis.entities.length}`);
  console.log(`- Matched Concepts: ${analysis.matches[0]?.matched_concepts.join(', ') || 'None'}`);
  
  return analysis;
}

/**
 * Run all examples (for testing)
 */
export async function runAllExamples() {
  try {
    console.log('🎬 Running SmartSemanticAnalyzer Examples\n');
    
    await exampleBasicAnalysis();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleSimilaritySearch();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleCustomConfiguration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await examplePairAnalysis();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
    throw error;
  }
}

// Export for potential use in tests
export { exampleRequirements };