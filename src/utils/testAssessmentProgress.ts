/**
 * Test utility to verify assessment progress calculation and persistence
 * This can be called from the browser console to test the functionality
 */

import { assessmentProgressService } from '@/services/assessments/AssessmentProgressService';
import { assessmentStorageService } from '@/services/assessments/AssessmentStorageService';
import { Assessment, RequirementStatus } from '@/types';

export function testAssessmentProgress() {
  console.log('🧪 Testing Assessment Progress Functionality...');
  
  // Get a test assessment
  const assessments = assessmentStorageService.getAllAssessments();
  if (assessments.length === 0) {
    console.error('❌ No assessments found for testing');
    return;
  }
  
  const testAssessment = assessments[0];
  console.log(`📋 Testing with assessment: ${testAssessment.name} (ID: ${testAssessment.id})`);
  
  // Get requirements for this assessment
  const requirements = assessmentProgressService.getRequirementsWithStoredStatuses(testAssessment);
  console.log(`📝 Found ${requirements.length} requirements`);
  
  if (requirements.length === 0) {
    console.error('❌ No requirements found for this assessment');
    return;
  }
  
  // Get initial progress
  const initialStats = assessmentProgressService.getAssessmentProgress(testAssessment);
  console.log('📊 Initial Progress:', initialStats);
  
  // Test updating a requirement status
  const testRequirement = requirements[0];
  const originalStatus = testRequirement.status;
  const newStatus: RequirementStatus = 'fulfilled';
  
  console.log(`🔄 Updating requirement ${testRequirement.code} from ${originalStatus} to ${newStatus}`);
  
  try {
    // Update requirement status
    const updatedStats = assessmentProgressService.updateRequirementStatus(
      testAssessment.id,
      testRequirement.id,
      newStatus
    );
    
    console.log('✅ Updated Progress:', updatedStats);
    console.log(`📈 Progress changed from ${initialStats.progress}% to ${updatedStats.progress}%`);
    
    // Verify persistence
    const persistedStats = assessmentProgressService.getAssessmentProgress(testAssessment);
    console.log('💾 Persisted Progress:', persistedStats);
    
    if (persistedStats.progress === updatedStats.progress) {
      console.log('✅ Progress persistence test PASSED');
    } else {
      console.error('❌ Progress persistence test FAILED');
    }
    
    // Test different status values
    console.log('\n🧪 Testing different status values...');
    
    const statusTests: RequirementStatus[] = ['partially-fulfilled', 'not-fulfilled', 'not-applicable'];
    
    for (const status of statusTests) {
      const stats = assessmentProgressService.updateRequirementStatus(
        testAssessment.id,
        testRequirement.id,
        status
      );
      console.log(`  ${status}: ${stats.progress}%`);
    }
    
    // Restore original status
    assessmentProgressService.updateRequirementStatus(
      testAssessment.id,
      testRequirement.id,
      originalStatus
    );
    
    console.log(`🔄 Restored original status: ${originalStatus}`);
    
    // Get debug info
    console.log('\n🔍 Debug Information:');
    const debugInfo = assessmentProgressService.getDebugInfo();
    console.log('Stored Progress Data:', debugInfo.progressData);
    console.log('Stored Requirement Data:', debugInfo.requirementData);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Global function for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testAssessmentProgress = testAssessmentProgress;
}

export function clearTestData() {
  console.log('🧹 Clearing test data...');
  assessmentProgressService.clearStoredData();
  assessmentStorageService.clearStoredAssessments();
  console.log('✅ Test data cleared');
}

if (typeof window !== 'undefined') {
  (window as any).clearAssessmentTestData = clearTestData;
}

export function getAssessmentDebugInfo() {
  console.log('🔍 Assessment Debug Information:');
  
  // Progress service debug info
  const progressDebug = assessmentProgressService.getDebugInfo();
  console.log('Progress Service Data:', progressDebug);
  
  // Storage service debug info
  const assessments = assessmentStorageService.getAllAssessments();
  console.log('Stored Assessments:', assessments);
  
  return {
    progressData: progressDebug,
    assessments
  };
}

if (typeof window !== 'undefined') {
  (window as any).getAssessmentDebugInfo = getAssessmentDebugInfo;
}