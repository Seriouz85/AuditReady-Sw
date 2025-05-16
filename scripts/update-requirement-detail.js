/**
 * This script updates the RequirementDetail.tsx component to remove code related to 
 * parsing and displaying the Purpose section from auditReadyGuidance.
 * 
 * To run this script:
 * 1. Make sure you have Node.js installed
 * 2. Run: node scripts/update-requirement-detail.js
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the RequirementDetail.tsx file
const componentPath = join(__dirname, '..', 'src', 'components', 'requirements', 'RequirementDetail.tsx');

console.log('Reading RequirementDetail.tsx file...');
let fileContent = fs.readFileSync(componentPath, 'utf8');

// 1. Update the "Apply to Requirement" button handler
const buttonHandlerRegex = /(onClick={\(\) => {[\s\S]*?const purposeElement = document\.querySelector\('.prose h4:first-child \+ p'\);[\s\S]*?const purposeText = purposeElement \? purposeElement\.textContent \|\| '' : '';[\s\S]*?const formattedGuidance = )[`]PURPOSE\n\n\${purposeText}\n\n\n\nIMPLEMENTATION\n\n\${bullets}[`]([\s\S]*?setShowAuditReady\(false\);[\s\S]*?\})/;

const updatedButtonHandler = fileContent.replace(
  buttonHandlerRegex,
  (match, before, after) => {
    return `${before}\`IMPLEMENTATION\n\n\${bullets}\`${after}`;
  }
);

// 2. Update the modal content rendering - remove Purpose section
const modalContentRegex = /(const content = requirement\.auditReadyGuidance \|\| 'No guidance available\.';[\s\S]*?const lines = content\.split\('\\n'\)\.map\(l => l\.trim\(\)\)\.filter\(l => l\.length > 0\);[\s\S]*?const purposeIdx = lines\.findIndex\(l =>[\s\S]*?l\.includes\('\*\*Purpose\*\*'\)[\s\S]*?\);[\s\S]*?const implIdx = lines\.findIndex\(l =>[\s\S]*?l\.includes\('\*\*Implementation\*\*'\)[\s\S]*?\);[\s\S]*?let purposeText = '';[\s\S]*?if \(purposeIdx >= 0\) {[\s\S]*?for \(let i = purposeIdx \+ 1; i < lines\.length; i\+\+\) {[\s\S]*?if \(i === implIdx\) break;[\s\S]*?if \(!lines\[i\]\.toLowerCase\(\)\.includes\('purpose'\) &&[\s\S]*?!lines\[i\]\.startsWith\('•'\) &&[\s\S]*?!lines\[i\]\.startsWith\('\*'\)\)[\s\S]*?purposeText = lines\[i\];[\s\S]*?break;[\s\S]*?}[\s\S]*?}[\s\S]*?})([\s\S]*?return \([\s\S]*?<>)([\s\S]*?<div className="mb-6">[\s\S]*?<h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">Purpose<\/h4>[\s\S]*?<p className="text-base">{purposeText \|\| "No purpose information available\."}<\/p>[\s\S]*?<\/div>)([\s\S]*?<div>[\s\S]*?<h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">Implementation<\/h4>)/;

const updatedModalContent = updatedButtonHandler.replace(
  modalContentRegex,
  (match, parsing, beforeReturn, purposeDiv, implSection) => {
    // Simplify the parsing logic to only extract implementation section
    const updatedParsing = `const content = requirement.auditReadyGuidance || 'No guidance available.';
                  const lines = content.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
                  const implIdx = lines.findIndex(l =>
                    l.toLowerCase().includes('implementation') ||
                    l.includes('**Implementation**')
                  );`;
    
    // Return without the Purpose div
    return `${updatedParsing}${beforeReturn}${implSection}`;
  }
);

// Write the updated content back to the file
fs.writeFileSync(componentPath, updatedModalContent, 'utf8');

console.log('Updated RequirementDetail.tsx to remove Purpose section handling');
console.log('Update completed successfully!'); 