/**
 * This script updates the mockData.ts file to remove the Purpose section from
 * auditReadyGuidance fields in all requirements, keeping only the Implementation section.
 * 
 * To run this script:
 * 1. Make sure you have Node.js installed
 * 2. Run: node scripts/update-guidance.js
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the mockData.ts file
const mockDataPath = join(__dirname, '..', 'src', 'data', 'mockData.ts');

console.log('Reading mockData.ts file...');
let fileContent = fs.readFileSync(mockDataPath, 'utf8');

// Regular expression to match auditReadyGuidance sections
// This regex matches from "auditReadyGuidance: `" up to the closing backtick
const guidanceRegex = /auditReadyGuidance: `([\s\S]*?)`/g;

// Count of updated requirements
let updatedCount = 0;

// Function to process each auditReadyGuidance section
function processGuidance(match, content) {
  // Check if there's an Implementation section
  const implementationMatch = content.match(/\*\*Implementation\*\*\s*\n\n([\s\S]*?)$/);
  
  if (implementationMatch) {
    // Extract only the Implementation section
    const implementationContent = implementationMatch[1].trim();
    updatedCount++;
    
    // Return the updated auditReadyGuidance with only the Implementation section
    return `auditReadyGuidance: \`**Implementation**\n\n${implementationContent}\``;
  }
  
  // If no Implementation section is found, return the original content
  return match;
}

// Replace all auditReadyGuidance sections
const updatedContent = fileContent.replace(guidanceRegex, processGuidance);

// Write the updated content back to the file
fs.writeFileSync(mockDataPath, updatedContent, 'utf8');

console.log(`Updated ${updatedCount} requirements in mockData.ts`);
console.log('Update completed successfully!'); 