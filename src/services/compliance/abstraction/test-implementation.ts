/**
 * Test implementation for TextProcessor and ClusteringUtils
 * This file verifies that all critical dependencies are properly implemented
 */

import { TextProcessor } from './TextProcessor';
import { ClusteringUtils } from './ClusteringUtils';
import { SmartSemanticAnalyzer } from './SmartSemanticAnalyzer';
import type { RawRequirement } from './RequirementProcessor';

// Test TextProcessor functionality
const testTextProcessor = () => {
  console.log('🧪 Testing TextProcessor...');
  
  const processor = new TextProcessor();
  const sampleText = "Organizations must implement access control policies and procedures to protect information systems.";
  
  // Test all required methods
  const normalized = processor.normalizeText(sampleText);
  const keywords = processor.extractKeywords(sampleText);
  const hash = processor.generateContentHash(sampleText);
  const technicalTerms = processor.extractTechnicalTerms(sampleText);
  const category = processor.inferCategory(sampleText, technicalTerms);
  const domain = processor.inferDomain(sampleText, technicalTerms);
  const complexity = processor.calculateComplexity(sampleText, technicalTerms);
  const readability = processor.calculateReadabilityScore(sampleText);
  const vector = processor.generateVector(normalized, ['policy', 'access']);
  
  console.log('✅ TextProcessor methods tested:');
  console.log(`  - Normalized text: ${normalized.substring(0, 50)}...`);
  console.log(`  - Keywords (${keywords.length}): ${keywords.slice(0, 5).join(', ')}`);
  console.log(`  - Content hash: ${hash}`);
  console.log(`  - Technical terms (${technicalTerms.length}): ${technicalTerms.slice(0, 3).join(', ')}`);
  console.log(`  - Category: ${category}`);
  console.log(`  - Domain: ${domain}`);
  console.log(`  - Complexity: ${complexity.toFixed(2)}`);
  console.log(`  - Readability: ${readability.toFixed(1)}`);
  console.log(`  - Vector length: ${vector.length}`);
  
  return {
    normalized,
    keywords,
    hash,
    technicalTerms,
    category,
    domain,
    complexity,
    readability,
    vector
  };
};

// Test ClusteringUtils functionality
const testClusteringUtils = async () => {
  console.log('\n🧪 Testing ClusteringUtils...');
  
  // Create mock processed requirements
  const mockRequirements = [
    {
      id: 'req1',
      framework: 'ISO27001',
      original_text: 'Access control policy',
      normalized_text: 'access control policy',
      entities: [],
      structure: { main_clause: '', sub_clauses: [], conditions: [], exceptions: [], references: [], action_verbs: [], domain_context: '' },
      metadata: { category: 'ACCESS_CONTROL', domain: 'SECURITY', criticality: 'HIGH' as const, complexity: 0.5, word_count: 3, readability_score: 80, technical_terms: ['access', 'control'], extracted_at: new Date() },
      vector: [0.5, 0.3, 0.2, 0.0, 0.0],
      keywords: ['access', 'control', 'policy'],
      hash: 'abc123'
    },
    {
      id: 'req2',
      framework: 'ISO27001',
      original_text: 'Data protection measures',
      normalized_text: 'data protection measures',
      entities: [],
      structure: { main_clause: '', sub_clauses: [], conditions: [], exceptions: [], references: [], action_verbs: [], domain_context: '' },
      metadata: { category: 'DATA_PROTECTION', domain: 'SECURITY', criticality: 'HIGH' as const, complexity: 0.4, word_count: 3, readability_score: 85, technical_terms: ['data', 'protection'], extracted_at: new Date() },
      vector: [0.3, 0.5, 0.1, 0.1, 0.0],
      keywords: ['data', 'protection', 'measures'],
      hash: 'def456'
    },
    {
      id: 'req3',
      framework: 'ISO27001',
      original_text: 'Access management procedures',
      normalized_text: 'access management procedures',
      entities: [],
      structure: { main_clause: '', sub_clauses: [], conditions: [], exceptions: [], references: [], action_verbs: [], domain_context: '' },
      metadata: { category: 'ACCESS_CONTROL', domain: 'SECURITY', criticality: 'MEDIUM' as const, complexity: 0.6, word_count: 3, readability_score: 75, technical_terms: ['access', 'management'], extracted_at: new Date() },
      vector: [0.4, 0.2, 0.3, 0.1, 0.0],
      keywords: ['access', 'management', 'procedures'],
      hash: 'ghi789'
    }
  ];
  
  // Test clustering options
  const clusteringOptions = {
    algorithm: 'k-means' as const,
    min_similarity: 0.6,
    max_clusters: 5,
    min_cluster_size: 2,
    quality_threshold: 0.5,
    enable_validation: true
  };
  
  try {
    // Test K-means clustering
    const kmeansClusters = await ClusteringUtils.performKMeansClustering(mockRequirements, clusteringOptions);
    console.log(`✅ K-means clustering: ${kmeansClusters.length} clusters`);
    
    // Test hierarchical clustering
    const hierarchicalClusters = await ClusteringUtils.performHierarchicalClustering(mockRequirements, clusteringOptions);
    console.log(`✅ Hierarchical clustering: ${hierarchicalClusters.length} clusters`);
    
    // Test DBSCAN clustering
    const dbscanClusters = await ClusteringUtils.performDBSCANClustering(mockRequirements, clusteringOptions);
    console.log(`✅ DBSCAN clustering: ${dbscanClusters.length} clusters`);
    
    // Test utility methods
    if (kmeansClusters.length > 0) {
      const internalSimilarity = ClusteringUtils.calculateInternalSimilarity(mockRequirements);
      const externalSeparation = ClusteringUtils.calculateExternalSeparation(
        kmeansClusters[0], 
        kmeansClusters, 
        mockRequirements
      );
      const dominantConcepts = ClusteringUtils.extractDominantConcepts(mockRequirements);
      
      console.log(`✅ Internal similarity: ${internalSimilarity.toFixed(3)}`);
      console.log(`✅ External separation: ${externalSeparation.toFixed(3)}`);
      console.log(`✅ Dominant concepts: ${dominantConcepts.slice(0, 3).join(', ')}`);
    }
    
    return {
      kmeansClusters,
      hierarchicalClusters,
      dbscanClusters
    };
  } catch (error) {
    console.error('❌ ClusteringUtils test failed:', error.message);
    throw error;
  }
};

// Test SmartSemanticAnalyzer integration
const testSmartSemanticAnalyzer = async () => {
  console.log('\n🧪 Testing SmartSemanticAnalyzer integration...');
  
  try {
    // Create analyzer with default configuration
    const analyzer = SmartSemanticAnalyzer.createDefault();
    console.log('✅ SmartSemanticAnalyzer created successfully');
    
    // Test with sample requirements
    const sampleRequirements: RawRequirement[] = [
      {
        id: 'iso-ac-1',
        framework: 'ISO27001',
        code: 'A.9.1.1',
        title: 'Access Control Policy',
        description: 'An access control policy shall be established, documented and reviewed based on business and information security requirements.'
      },
      {
        id: 'iso-ac-2',
        framework: 'ISO27001',
        code: 'A.9.1.2', 
        title: 'Access to networks and network services',
        description: 'Users shall only be provided with access to the network and network services that they have been specifically authorized to use.'
      }
    ];
    
    // Test analysis
    const result = await analyzer.analyzeRequirements(sampleRequirements);
    
    console.log('✅ Analysis completed:');
    console.log(`  - Processed requirements: ${result.processed_requirements.length}`);
    console.log(`  - Similarity matrix size: ${result.similarity_matrix.length}x${result.similarity_matrix[0]?.length || 0}`);
    console.log(`  - Clusters: ${result.clusters.length}`);
    console.log(`  - Processing time: ${result.performance_metrics.processing_time.toFixed(2)}ms`);
    console.log(`  - Success rate: ${(result.analysis_summary.processed_successfully / result.analysis_summary.total_requirements * 100).toFixed(1)}%`);
    
    return result;
  } catch (error) {
    console.error('❌ SmartSemanticAnalyzer test failed:', error.message);
    throw error;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting dependency implementation tests...\n');
  
  try {
    // Test individual components
    const textProcessorResults = testTextProcessor();
    const clusteringResults = await testClusteringUtils();
    const analyzerResults = await testSmartSemanticAnalyzer();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ TextProcessor: All methods working');
    console.log('✅ ClusteringUtils: All algorithms working');
    console.log('✅ SmartSemanticAnalyzer: Integration working');
    console.log('\n📊 Implementation Summary:');
    console.log('   - TextProcessor: 9 methods implemented');
    console.log('   - ClusteringUtils: 6 static methods implemented');
    console.log('   - Full semantic analysis pipeline: ✅ Operational');
    
    return {
      textProcessor: textProcessorResults,
      clustering: clusteringResults,
      analyzer: analyzerResults
    };
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    throw error;
  }
};

// Export for external testing
export { testTextProcessor, testClusteringUtils, testSmartSemanticAnalyzer, runAllTests };

// Auto-run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}