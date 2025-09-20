/**
 * Simple Deduplication Test - Direct test without complex imports
 */

import { createDefaultDeduplicationEngine } from './index';

export async function testDeduplicationEngine() {
  try {
    console.log('Testing Deduplication Engine...');
    
    const engine = createDefaultDeduplicationEngine();
    
    // Simple test data
    const testRequirements = [
      {
        id: 'REQ-1',
        title: 'Asset Management Policy',
        description: 'Establish and maintain an inventory of organizational assets.',
        category: 'Asset Management',
        priority: 'high',
        framework: 'Test Framework 1',
        processed_id: 'processed_1',
        semantic_vector: new Array(100).fill(0).map(() => Math.random()),
        structure: {
          clauses: ['Establish and maintain an inventory of organizational assets.'],
          requirements: ['Establish and maintain an inventory of organizational assets.'],
          context: 'Asset Management'
        },
        metadata: {
          complexity_score: 0.5,
          specificity_level: 0.7,
          framework_confidence: 0.9
        }
      },
      {
        id: 'REQ-2',
        title: 'Asset Inventory Management',
        description: 'Maintain an accurate and up-to-date inventory of all organizational assets.',
        category: 'Asset Management',
        priority: 'high',
        framework: 'Test Framework 2',
        processed_id: 'processed_2',
        semantic_vector: new Array(100).fill(0).map(() => Math.random()),
        structure: {
          clauses: ['Maintain an accurate and up-to-date inventory of all organizational assets.'],
          requirements: ['Maintain an accurate and up-to-date inventory of all organizational assets.'],
          context: 'Asset Management'
        },
        metadata: {
          complexity_score: 0.5,
          specificity_level: 0.7,
          framework_confidence: 0.9
        }
      }
    ];

    const result = await engine.deduplicateRequirements(testRequirements);
    
    console.log('✅ Deduplication test passed');
    console.log(`Input: ${testRequirements.length} requirements`);
    console.log(`Output: ${result.deduplicated_count} requirements`);
    console.log(`Reduction: ${result.reduction_percentage}%`);
    
    return { success: true, result };
    
  } catch (error) {
    console.log('❌ Deduplication test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (typeof window === 'undefined' && import.meta.url === new URL(process.argv[1], 'file:').href) {
  testDeduplicationEngine().catch(console.error);
}