// Simple test to verify unified requirements system
import { DynamicContentGenerator } from './src/services/compliance/DynamicContentGenerator.js';
import { FrameworkMappingResolver } from './src/services/compliance/FrameworkMappingResolver.js';

const testUnifiedSystem = async () => {
  try {
    console.log('🧪 Testing Unified Requirements System...\n');
    
    // Test framework mapping resolver
    const resolver = new FrameworkMappingResolver();
    console.log('✅ FrameworkMappingResolver initialized');
    
    // Test dynamic content generator  
    const generator = new DynamicContentGenerator();
    console.log('✅ DynamicContentGenerator initialized');
    
    // Test CIS mapping issue fix
    try {
      await resolver.fixCISMappingIssues();
      console.log('✅ CIS mapping issues fix completed');
    } catch (error) {
      console.log('⚠️  CIS mapping fix warning:', error.message);
    }
    
    // Test framework selection
    const frameworks = {
      iso27001: true,
      cisControls: 'ig2'
    };
    
    console.log('📊 Testing with frameworks:', frameworks);
    
    // Test content generation for a category
    try {
      const content = await generator.generateCategoryContent('Governance & Leadership', frameworks);
      if (content) {
        console.log('\n✅ Content generated successfully:');
        console.log(`   - Requirements: ${content.unifiedRequirements.length}`);
        console.log(`   - References: ${content.references.length}`);
        console.log(`   - Deduplication rate: ${Math.round(content.statistics.deduplicationRate)}%`);
      } else {
        console.log('⚠️  No content generated for test category');
      }
    } catch (error) {
      console.log('❌ Content generation failed:', error.message);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testUnifiedSystem();