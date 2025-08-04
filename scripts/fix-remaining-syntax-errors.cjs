#!/usr/bin/env node

/**
 * Fix remaining critical syntax errors after first pass
 */

const fs = require('fs');
const path = require('path');

const PROBLEMATIC_FILES = [
  'src/components/admin/stripe/CouponManagementModal.tsx',
  'src/components/admin/stripe/ProductManagementModal.tsx', 
  'src/utils/wordUtils.ts',
  'src/utils/pdfUtils.ts',
  'src/components/assessments/AssessmentDashboard.tsx',
  'src/components/assessments/AssessmentTemplateBuilder.tsx',
  'src/components/LMS/UnifiedMediaSidePanel.tsx',
  'src/components/LMS/EnhancedMediaBrowserPanel.tsx',
  'src/components/certificates/CertificateManagement.tsx'
];

function fixCriticalSyntaxErrors(content) {
  let fixed = content;
  
  // Fix property definitions with wrong syntax
  fixed = fixed.replace(/(\w+) \+ '/g, '$1: \'');
  fixed = fixed.replace(/(\w+) \+ "/g, '$1: "');
  fixed = fixed.replace(/(\w+) \+ `/g, '$1: `');
  
  // Fix object property syntax
  fixed = fixed.replace(/text \+ '/g, 'text: \'');
  fixed = fixed.replace(/description \+ '/g, 'description: \'');
  fixed = fixed.replace(/id \+ '/g, 'id: \'');
  fixed = fixed.replace(/name \+ '/g, 'name: \'');
  
  // Fix broken ternary operators
  fixed = fixed.replace(/\? '([^']+)' \+ '([^']+)'\}/g, '? \'$1\' : \'$2\'}');
  
  // Fix missing colons in object properties
  fixed = fixed.replace(/(\w+) \+ (\w+)/g, '$1: $2');
  
  return fixed;
}

function processFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixedContent = fixCriticalSyntaxErrors(content);

    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent);
      console.log(`✅ Fixed critical syntax errors in: ${filePath}`);
    } else {
      console.log(`✨ No additional fixes needed for: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing remaining critical syntax errors...');
PROBLEMATIC_FILES.forEach(processFile);
console.log('✅ Emergency syntax fixes complete!');