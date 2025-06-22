# Assessment Progress System

This document describes the new assessment progress calculation and persistence system implemented to fix the issues with static progress values.

## Overview

The assessment progress system consists of two main services:

1. **AssessmentProgressService** - Handles progress calculation and requirement status tracking
2. **AssessmentStorageService** - Manages assessment data persistence in localStorage

## Key Features

- **Real-time Progress Calculation**: Progress is calculated based on actual requirement statuses
- **Persistent Storage**: Both assessment data and requirement statuses are stored in localStorage
- **Demo Mode Compatible**: Works in both demo and production environments
- **Status-based Calculation**: Progress accounts for different requirement statuses:
  - `fulfilled`: 100% contribution
  - `partially-fulfilled`: 50% contribution  
  - `not-fulfilled`: 0% contribution
  - `not-applicable`: Excluded from calculation

## Usage

### Basic Usage

```typescript
import { assessmentProgressService, assessmentStorageService } from '@/services/assessments';

// Get real-time progress for an assessment
const stats = assessmentProgressService.getAssessmentProgress(assessment);
console.log(`Progress: ${stats.progress}%`);

// Update a requirement status
const updatedStats = assessmentProgressService.updateRequirementStatus(
  assessmentId, 
  requirementId, 
  'fulfilled'
);

// Save assessment to storage
assessmentStorageService.saveAssessment(assessment);
```

### Testing

The system includes built-in testing utilities accessible from the browser console:

```javascript
// Test progress functionality
testAssessmentProgress();

// Get debug information
getAssessmentDebugInfo();

// Clear test data
clearAssessmentTestData();
```

## Progress Calculation Formula

```
applicableRequirements = totalRequirements - notApplicableCount
completedWeight = fulfilledCount + (partiallyFulfilledCount * 0.5)
progress = (completedWeight / applicableRequirements) * 100
```

## Data Persistence

### Storage Structure

**Assessment Progress Data**:
```json
{
  "assessment-1": {
    "progress": 68,
    "lastUpdated": "2024-03-28T14:30:00Z",
    "stats": {
      "totalRequirements": 25,
      "fulfilledCount": 15,
      "partialCount": 5,
      "notFulfilledCount": 3,
      "notApplicableCount": 2,
      "progress": 68,
      "complianceScore": 68
    }
  }
}
```

**Requirement Status Data**:
```json
{
  "assessment-1": {
    "req-1": {
      "status": "fulfilled",
      "lastUpdated": "2024-03-28T14:30:00Z"
    }
  }
}
```

## Integration Points

### Components Updated

1. **Assessments.tsx** - Uses storage service for CRUD operations
2. **AssessmentDetail.tsx** - Uses progress service via useAssessmentData hook
3. **AssessmentCard.tsx** - Shows real-time progress
4. **useAssessmentData.ts** - Integrates with both services

### Real-time Updates

Progress updates automatically when:
- Requirement status changes in AssessmentDetail
- Assessment status changes (draft → in-progress → completed)
- Assessment data is saved

## Browser Storage

Data is stored in `localStorage` with these keys:
- `assessment_progress_data` - Progress calculations and stats
- `requirement_status_data` - Individual requirement statuses  
- `stored_assessments` - Assessment metadata and state

## Demo Mode

The system works seamlessly in demo mode:
- No backend required
- Data persists across browser sessions
- Easy to clear for testing: `clearAssessmentTestData()`

## Error Handling

- Graceful fallback to mock data if storage fails
- Error logging for debugging
- Non-blocking failures (UI continues to work)

## Performance

- Efficient calculations using memoization
- Lazy loading of requirement data
- Minimal re-renders through optimized state management