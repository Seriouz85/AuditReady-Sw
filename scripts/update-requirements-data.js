/**
 * This script runs both update scripts to remove the Purpose section from requirements:
 * 1. Updates the mockData.ts file to remove Purpose sections from auditReadyGuidance
 * 2. Updates the RequirementDetail.tsx component to remove Purpose section handling
 * 
 * To run this script:
 * 1. Make sure you have Node.js installed
 * 2. Run: node scripts/update-requirements-data.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting comprehensive requirements data update...');

// Function to execute a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${basename(scriptPath)} completed successfully.`);
        resolve();
      } else {
        console.error(`${basename(scriptPath)} failed with code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`Failed to start ${basename(scriptPath)}: ${err}`);
      reject(err);
    });
  });
}

// Main function to run scripts in sequence
async function main() {
  try {
    const updateGuidanceScript = join(__dirname, 'update-guidance.js');
    const updateComponentScript = join(__dirname, 'update-requirement-detail.js');
    
    // First update the mockData.ts to remove Purpose sections
    await runScript(updateGuidanceScript);
    
    // Then update the RequirementDetail component to remove Purpose handling
    await runScript(updateComponentScript);
    
    console.log('✅ All updates completed successfully!');
    console.log('');
    console.log('Changes made:');
    console.log('1. Removed Purpose sections from all requirements in mockData.ts');
    console.log('2. Updated RequirementDetail.tsx to only display Implementation sections');
    console.log('');
    console.log('Next steps:');
    console.log('- Restart your development server to see the changes');
    console.log('- Verify that requirements now only show Implementation sections');
    
  } catch (error) {
    console.error('❌ Update process failed:', error);
    process.exit(1);
  }
}

main(); 