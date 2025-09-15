/**
 * Test Script for Content Quality Analysis System
 * 
 * This script demonstrates the content quality analysis capabilities
 * and can be used for testing and validation.
 */

import { contentQualityAnalyzer } from '../services/compliance/ContentQualityAnalyzer';
import { ContentQualityService } from '../services/admin/ContentQualityService';

// Test content samples with various quality issues
const TEST_CONTENT_SAMPLES = {
  good: `Establish comprehensive multi-factor authentication controls for all administrative accounts and privileged users. This includes implementing hardware tokens, mobile authenticator applications, and SMS-based verification as secondary authentication factors. Organizations must define clear policies for MFA bypass procedures and maintain audit logs of all authentication events.`,
  
  incomplete: `Implement appropriate security controls for sensitive data of`,
  
  markdown: `## SOFTWARE INVENTORY MANAGEMENT - auditreadyguidance Executive Summary: Organizations must maintain comprehensive software inventory including .dll and .exe files`,
  
  vague: `Organizations should implement appropriate measures for essential entities as necessary`,
  
  broken: ``,
  
  repetitive: `Software inventory software inventory must include software applications. Software controls software controls are essential for software management.`
};

/**
 * Test individual content validation
 */
async function testContentValidation() {
  console.log('🧪 Testing individual content validation...\n');
  
  for (const [type, content] of Object.entries(TEST_CONTENT_SAMPLES)) {
    console.log(`📝 Testing ${type} content:`);
    console.log(`   Content: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`);
    
    const validation = contentQualityAnalyzer.validateContent(content, 'Software Asset Management');
    
    console.log(`   Score: ${validation.score}/100`);
    console.log(`   Issues: ${validation.issues.length}`);
    
    validation.issues.forEach(issue => {
      console.log(`   - [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.description}`);
    });
    
    console.log('');
  }
}

/**
 * Test quality overview
 */
async function testQualityOverview() {
  console.log('🔍 Testing quality overview...\n');
  
  try {
    const overview = await contentQualityAnalyzer.getQualityOverview();
    
    console.log('📊 Quality Overview Results:');
    console.log(`   Total Categories: ${overview.totalCategories}`);
    console.log(`   Categories with Issues: ${overview.categoriesWithIssues}`);
    console.log(`   Estimated Total Issues: ${overview.estimatedTotalIssues}`);
    console.log(`   Worst Categories: ${overview.worstCategories.join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ Quality overview test failed:', error);
  }
}

/**
 * Test admin service wrapper
 */
async function testAdminService() {
  console.log('🔐 Testing admin service wrapper...\n');
  
  try {
    // Test admin overview
    const adminOverview = await ContentQualityService.getQualityOverview();
    
    console.log('👨‍💼 Admin Quality Overview:');
    console.log(`   Total Categories: ${adminOverview.totalCategories}`);
    console.log(`   Needs Attention: ${adminOverview.needsAttention}`);
    console.log(`   Estimated Issues: ${adminOverview.estimatedTotalIssues}`);
    console.log('');
    
    // Test dashboard data
    const dashboardData = await ContentQualityService.getQualityDashboardData();
    
    console.log('📊 Dashboard Data:');
    console.log(`   Overall Score: ${dashboardData.score}/100`);
    console.log(`   Status: ${dashboardData.status}`);
    console.log(`   Priority Breakdown:`, dashboardData.priorityBreakdown);
    console.log(`   Top Categories to Fix: ${dashboardData.topCategoriesToFix.join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ Admin service test failed:', error);
  }
}

/**
 * Test single category analysis
 */
async function testSingleCategoryAnalysis() {
  console.log('🎯 Testing single category analysis...\n');
  
  const testCategory = 'Governance & Leadership';
  
  try {
    console.log(`📋 Analyzing category: ${testCategory}`);
    const categoryReport = await contentQualityAnalyzer.analyzeSingleCategory(testCategory);
    
    console.log(`   Overall Score: ${categoryReport.overallScore}/100`);
    console.log(`   Total Issues: ${categoryReport.totalIssues}`);
    console.log(`   Sub-requirements: ${categoryReport.subRequirements.length}`);
    
    if (categoryReport.recommendations.length > 0) {
      console.log('   Recommendations:');
      categoryReport.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
    
    // Show worst sub-requirements
    const worstSubReqs = categoryReport.subRequirements
      .filter(sub => sub.score < 70)
      .slice(0, 3);
    
    if (worstSubReqs.length > 0) {
      console.log('   Issues in sub-requirements:');
      worstSubReqs.forEach(sub => {
        console.log(`   - Section ${sub.id}: ${sub.score}/100 (${sub.issues.length} issues)`);
      });
    }
    
    console.log('');
  } catch (error) {
    console.error(`❌ Single category analysis failed for ${testCategory}:`, error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Content Quality Analysis Tests');
  console.log('='.repeat(50));
  console.log('');
  
  try {
    await testContentValidation();
    await testQualityOverview();
    await testAdminService();
    await testSingleCategoryAnalysis();
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

/**
 * Quick validation test for development
 */
function quickValidationTest() {
  console.log('⚡ Quick validation test...\n');
  
  const samples = [
    'This is a good sentence with proper structure.',
    'This sentence ends with of',
    '## MARKDOWN HEADER - auditreadyguidance content',
    'Organizations should implement appropriate controls for essential entities',
    ''
  ];
  
  samples.forEach((sample, index) => {
    const result = contentQualityAnalyzer.validateContent(sample);
    console.log(`${index + 1}. Score: ${result.score}/100, Issues: ${result.issues.length}`);
    result.issues.forEach(issue => {
      console.log(`   - [${issue.severity}] ${issue.description}`);
    });
    console.log('');
  });
}

// Export functions for manual testing
export {
  runAllTests,
  testContentValidation,
  testQualityOverview,
  testAdminService,
  testSingleCategoryAnalysis,
  quickValidationTest
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests();
} else {
  // Browser environment - expose functions to window for manual testing
  (window as any).contentQualityTests = {
    runAllTests,
    testContentValidation,
    testQualityOverview,
    testAdminService,
    testSingleCategoryAnalysis,
    quickValidationTest
  };
  
  console.log('🧪 Content Quality Tests loaded. Run tests with:');
  console.log('   contentQualityTests.quickValidationTest()');
  console.log('   contentQualityTests.runAllTests()');
}