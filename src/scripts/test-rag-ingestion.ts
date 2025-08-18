/**
 * Test script for RAG knowledge ingestion
 * Tests the KnowledgeIngestionService with expert sources
 */

import { KnowledgeIngestionService } from '../services/rag/KnowledgeIngestionService';

const testSources = [
  {
    url: 'https://www.iso27001security.com/html/27001.html',
    title: 'ISO 27001 Security Guide',
    description: 'Comprehensive ISO 27001 implementation guidance',
    contentType: 'guidance' as const,
    complianceFrameworks: ['iso27001'],
    focusAreas: ['governance', 'risk', 'access'],
    authorityScore: 9,
    credibilityRating: 'expert' as const
  },
  {
    url: 'https://blog.isms.online/',
    title: 'ISMS Online Blog',
    description: 'Information Security Management System insights',
    contentType: 'bestpractice' as const,
    complianceFrameworks: ['iso27001', 'iso27002'],
    focusAreas: ['governance', 'risk', 'training'],
    authorityScore: 7,
    credibilityRating: 'verified' as const
  }
];

async function testKnowledgeIngestion() {
  console.log('🚀 Starting RAG Knowledge Ingestion Test');
  console.log('===========================================');
  
  for (const source of testSources) {
    try {
      console.log(`\n📥 Testing ingestion from: ${source.url}`);
      console.log(`   Title: ${source.title}`);
      console.log(`   Authority Score: ${source.authorityScore}/10`);
      
      const startTime = Date.now();
      const result = await KnowledgeIngestionService.ingestFromURL(source.url, source);
      const duration = Date.now() - startTime;
      
      console.log(`\n✅ Ingestion completed in ${duration}ms`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Source ID: ${result.sourceId}`);
      console.log(`   Chunks Created: ${result.chunksCreated}`);
      console.log(`   Embeddings Generated: ${result.embeddingsGenerated}`);
      console.log(`   Quality Score: ${result.qualityScore.toFixed(2)}`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to ingest ${source.url}:`, error);
    }
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 RAG Knowledge Ingestion Test Complete!');
}

// Export for manual testing
export { testKnowledgeIngestion };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testKnowledgeIngestion().catch(console.error);
}