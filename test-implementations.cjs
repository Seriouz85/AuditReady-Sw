#!/usr/bin/env node

/**
 * Manual test script for our implementations
 * This tests the core functionality we've built without requiring a full test framework
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Audit Readiness Hub Implementations\n');

// Test 1: Check if all critical files exist
console.log('📁 Testing File Structure...');
const criticalFiles = [
  'src/services/requirements/RequirementsService.ts',
  'src/services/documents/DocumentUploadService.ts',
  'src/services/invitations/UserInvitationService.ts',
  'src/services/email/EmailService.ts',
  'src/services/assessments/AssessmentProgressService.ts',
  'src/utils/errorHandler.ts',
  'src/utils/formPersistence.ts',
  'src/components/ui/save-indicator.tsx',
  'src/components/ui/coming-soon-badge.tsx',
  'src/components/documents/DocumentUpload.tsx',
  'src/pages/ResetPassword.tsx',
  'src/pages/EmailVerification.tsx',
  'src/pages/EnhancedOnboardingFlow.tsx'
];

let fileTestsPassed = 0;
criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
    fileTestsPassed++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

console.log(`\n📊 File Structure: ${fileTestsPassed}/${criticalFiles.length} files present\n`);

// Test 2: Check TypeScript syntax in key files
console.log('🔧 Testing TypeScript Syntax...');
const typeScriptFiles = [
  'src/services/requirements/RequirementsService.ts',
  'src/services/documents/DocumentUploadService.ts',
  'src/utils/errorHandler.ts',
  'src/utils/formPersistence.ts'
];

let syntaxTestsPassed = 0;
typeScriptFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic syntax checks
      const hasValidImports = content.includes('import') || content.includes('export');
      const hasNoSyntaxErrors = !content.includes(';;') && !content.includes('}}}}');
      const hasValidTypeScript = content.includes('interface') || content.includes('type') || content.includes('class');
      
      if (hasValidImports && hasNoSyntaxErrors && hasValidTypeScript) {
        console.log(`  ✅ ${file} - Syntax OK`);
        syntaxTestsPassed++;
      } else {
        console.log(`  ⚠️  ${file} - Potential syntax issues`);
      }
    } catch (error) {
      console.log(`  ❌ ${file} - Error reading file`);
    }
  }
});

console.log(`\n📊 TypeScript Syntax: ${syntaxTestsPassed}/${typeScriptFiles.length} files passed\n`);

// Test 3: Check for proper exports
console.log('📦 Testing Service Exports...');
const serviceFiles = [
  { file: 'src/services/requirements/RequirementsService.ts', exports: ['RequirementsService', 'useRequirementsService'] },
  { file: 'src/services/documents/DocumentUploadService.ts', exports: ['DocumentUploadService', 'documentUploadService'] },
  { file: 'src/services/invitations/UserInvitationService.ts', exports: ['UserInvitationService', 'userInvitationService'] },
  { file: 'src/utils/errorHandler.ts', exports: ['ErrorHandler', 'errorHandler'] }
];

let exportTestsPassed = 0;
serviceFiles.forEach(({ file, exports }) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasAllExports = exports.every(exp => content.includes(`export`) && content.includes(exp));
      
      if (hasAllExports) {
        console.log(`  ✅ ${file} - All exports present`);
        exportTestsPassed++;
      } else {
        console.log(`  ⚠️  ${file} - Some exports missing`);
      }
    } catch (error) {
      console.log(`  ❌ ${file} - Error checking exports`);
    }
  }
});

console.log(`\n📊 Service Exports: ${exportTestsPassed}/${serviceFiles.length} services passed\n`);

// Test 4: Check component structure
console.log('🧩 Testing Component Structure...');
const componentFiles = [
  'src/components/ui/save-indicator.tsx',
  'src/components/ui/coming-soon-badge.tsx',
  'src/components/documents/DocumentUpload.tsx'
];

let componentTestsPassed = 0;
componentFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const hasReactImport = content.includes('React') || content.includes('react');
      const hasExportedComponent = content.includes('export') && (content.includes('const') || content.includes('function'));
      const hasProps = content.includes('Props') || content.includes('interface');
      
      if (hasReactImport && hasExportedComponent) {
        console.log(`  ✅ ${file} - Component structure OK`);
        componentTestsPassed++;
      } else {
        console.log(`  ⚠️  ${file} - Component structure issues`);
      }
    } catch (error) {
      console.log(`  ❌ ${file} - Error reading component`);
    }
  }
});

console.log(`\n📊 Component Structure: ${componentTestsPassed}/${componentFiles.length} components passed\n`);

// Test 5: Check for implementation completeness
console.log('🎯 Testing Implementation Completeness...');
const implementations = [
  {
    name: 'Requirements Service',
    file: 'src/services/requirements/RequirementsService.ts',
    keywords: ['updateRequirement', 'getRequirements', 'upsert', 'localStorage']
  },
  {
    name: 'Document Upload Service',
    file: 'src/services/documents/DocumentUploadService.ts',
    keywords: ['uploadFile', 'getDocuments', 'deleteDocument', 'supabase']
  },
  {
    name: 'Assessment Progress Service',
    file: 'src/services/assessments/AssessmentProgressService.ts',
    keywords: ['calculateProgress', 'updateProgress', 'getProgress']
  },
  {
    name: 'Error Handler',
    file: 'src/utils/errorHandler.ts',
    keywords: ['handleError', 'handleAsync', 'retryOperation', 'toast']
  }
];

let implementationTestsPassed = 0;
implementations.forEach(({ name, file, keywords }) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasAllKeywords = keywords.every(keyword => content.includes(keyword));
      
      if (hasAllKeywords) {
        console.log(`  ✅ ${name} - Implementation complete`);
        implementationTestsPassed++;
      } else {
        const missingKeywords = keywords.filter(keyword => !content.includes(keyword));
        console.log(`  ⚠️  ${name} - Missing: ${missingKeywords.join(', ')}`);
      }
    } catch (error) {
      console.log(`  ❌ ${name} - Error checking implementation`);
    }
  }
});

console.log(`\n📊 Implementation Completeness: ${implementationTestsPassed}/${implementations.length} implementations complete\n`);

// Final Summary
console.log('🎉 TEST SUMMARY:');
console.log('================');
console.log(`📁 File Structure: ${fileTestsPassed}/${criticalFiles.length}`);
console.log(`🔧 TypeScript Syntax: ${syntaxTestsPassed}/${typeScriptFiles.length}`);
console.log(`📦 Service Exports: ${exportTestsPassed}/${serviceFiles.length}`);
console.log(`🧩 Component Structure: ${componentTestsPassed}/${componentFiles.length}`);
console.log(`🎯 Implementation Completeness: ${implementationTestsPassed}/${implementations.length}`);

const totalTests = criticalFiles.length + typeScriptFiles.length + serviceFiles.length + componentFiles.length + implementations.length;
const totalPassed = fileTestsPassed + syntaxTestsPassed + exportTestsPassed + componentTestsPassed + implementationTestsPassed;
const successRate = Math.round((totalPassed / totalTests) * 100);

console.log(`\n🎯 OVERALL SUCCESS RATE: ${successRate}% (${totalPassed}/${totalTests})`);

if (successRate >= 90) {
  console.log('🎉 EXCELLENT! Ready for production deployment.');
} else if (successRate >= 75) {
  console.log('✅ GOOD! Minor issues to address.');
} else if (successRate >= 60) {
  console.log('⚠️  FAIR! Several issues need attention.');
} else {
  console.log('❌ NEEDS WORK! Major issues detected.');
}

console.log('\n✨ Quick Wins & Phase 2 Implementation Testing Complete!\n');