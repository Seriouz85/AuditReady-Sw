// Assessment services index file
export { assessmentProgressService, AssessmentProgressService } from './AssessmentProgressService';
export { assessmentStorageService, AssessmentStorageService } from './AssessmentStorageService';
export type { AssessmentStats } from './AssessmentProgressService';

// Test utilities
export { testAssessmentProgress, clearTestData, getAssessmentDebugInfo } from '../../utils/testAssessmentProgress';