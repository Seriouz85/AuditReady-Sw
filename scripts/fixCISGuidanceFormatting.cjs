const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Fix the formatting of the auditReadyGuidance field for CIS controls
function fixGuidanceFormatting() {
  let newContent = fileContent;
  
  // Find the auditReadyGuidance fields for CIS controls
  const regex = /auditReadyGuidance:\s*`Purpose:\s*([^`]+?)\\n\\nImplementation:\\n((?:[^`]+?))`/g;
  
  // Replace with properly formatted guidance
  newContent = newContent.replace(regex, (match, purpose, implementation) => {
    // Clean up the purpose text
    const cleanPurpose = purpose.trim();
    
    // Split the implementation into bullet points
    const bulletPoints = implementation.split('\\n').map(point => point.trim());
    
    // Format the implementation with proper markdown bullet points
    const formattedImplementation = bulletPoints.join('\n');
    
    // Return the properly formatted guidance
    return `auditReadyGuidance: \`Purpose: ${cleanPurpose}\n\nImplementation:\n${formattedImplementation}\``;
  });
  
  return newContent;
}

// Apply the fixes
const updatedContent = fixGuidanceFormatting();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Fixed formatting of CIS guidance successfully!'); 