#!/usr/bin/env node

/**
 * Demo Validation Script - HARDCORE VALIDATION FOR THE BOARD
 * Ensures demo functionality is NEVER broken during refactoring
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEMO_EMAIL = 'demo@auditready.com';
const PROTECTED_FILES = [
  'src/lib/mockAuth.ts',
  'src/data/mockData.ts',
  'src/contexts/AuthContext.tsx',
  'src/pages/Login.tsx'
];

class DemoValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Check 1: Protected files exist and haven't been emptied
  validateProtectedFiles() {
    console.log('🔍 Validating protected demo files...');
    
    for (const file of PROTECTED_FILES) {
      const filePath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        this.errors.push(`❌ Protected file missing: ${file}`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      
      // Check if file has been gutted
      if (lines < 10) {
        this.errors.push(`❌ Protected file appears empty: ${file} (only ${lines} lines)`);
      }
      
      // Check for demo email presence
      if (file.includes('mockAuth') || file.includes('Login')) {
        if (!content.includes(DEMO_EMAIL)) {
          this.errors.push(`❌ Demo email missing from ${file}`);
        }
      }
      
      console.log(`✅ ${file} - ${lines} lines`);
    }
  }

  // Check 2: TypeScript compilation
  validateTypeScript() {
    console.log('\n🔍 Validating TypeScript compilation...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
    } catch (error) {
      this.errors.push('❌ TypeScript compilation failed');
      console.error(error.stdout?.toString() || error.message);
    }
  }

  // Check 3: ESLint
  validateESLint() {
    console.log('\n🔍 Running ESLint validation...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ ESLint validation passed');
    } catch (error) {
      this.warnings.push('⚠️ ESLint warnings detected');
    }
  }

  // Check 4: Build test
  validateBuild() {
    console.log('\n🔍 Testing production build...');
    
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log('✅ Production build successful');
    } catch (error) {
      this.errors.push('❌ Build failed');
      console.error(error.stdout?.toString() || error.message);
    }
  }

  // Check 5: Demo-specific validation
  validateDemoFunctionality() {
    console.log('\n🔍 Validating demo-specific functionality...');
    
    // Check mockData.ts hasn't been reduced
    const mockDataPath = path.join(process.cwd(), 'src/data/mockData.ts');
    const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
    const mockDataLines = mockDataContent.split('\n').length;
    
    if (mockDataLines < 1500) {
      this.errors.push(`❌ mockData.ts has been reduced to ${mockDataLines} lines (should be 1600+)`);
    } else {
      console.log(`✅ mockData.ts intact with ${mockDataLines} lines`);
    }
    
    // Check for demo user in mockData
    if (!mockDataContent.includes('demo@auditready.com')) {
      this.errors.push('❌ Demo user missing from mockData.ts');
    } else {
      console.log('✅ Demo user found in mockData.ts');
    }
  }

  // Generate validation report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('DEMO VALIDATION REPORT - FOR THE BOARD');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 ALL VALIDATIONS PASSED - DEMO IS SAFE! 🎉');
      console.log('✅ Demo login functionality preserved');
      console.log('✅ Mock data intact');
      console.log('✅ TypeScript compilation successful');
      console.log('✅ Build successful');
      console.log('✅ Ready for board presentation');
      return true;
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS FOUND:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n🚨 BOARD REQUIREMENT FAILED - DO NOT DEPLOY! 🚨');
      console.log('Rollback or fix immediately!');
      return false;
    }
    
    return true;
  }

  run() {
    console.log('🚀 Starting Hardcore Demo Validation for Board Requirements\n');
    
    this.validateProtectedFiles();
    this.validateDemoFunctionality();
    this.validateTypeScript();
    this.validateESLint();
    this.validateBuild();
    
    const success = this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// Run validation
new DemoValidator().run();