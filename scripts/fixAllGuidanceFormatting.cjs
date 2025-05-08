const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Fix the formatting of all auditReadyGuidance fields (ISO 27002 and CIS controls)
function fixGuidanceFormatting() {
  let newContent = fileContent;
  
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`(Purpose:\s*(?:[^`]+?))\n\n(Implementation:\n(?:[^`]+?))`/g;
  
  // Replace with properly formatted guidance
  newContent = newContent.replace(regex, (match, purpose, implementation) => {
    // Clean up the purpose text
    const cleanPurpose = purpose.trim();
    
    // Process the implementation part
    let cleanImplementation = implementation.trim();
    
    // Make sure bullet points are properly formatted
    // First, extract just the implementation content after the "Implementation:" label
    const implementationContent = cleanImplementation.replace(/^Implementation:\s*/, '');
    
    // Split into lines and ensure each bullet point is properly formatted
    const lines = implementationContent.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      // If line starts with a bullet point, make sure it has proper formatting
      if (trimmedLine.startsWith('-')) {
        return trimmedLine; // Already has a bullet point
      } else if (trimmedLine.length > 0) {
        return `- ${trimmedLine}`; // Add bullet point
      }
      return trimmedLine; // Keep empty lines as is
    });
    
    // Reconstruct the implementation section
    const formattedImplementation = `Implementation:\n${formattedLines.join('\n')}`;
    
    // Return the properly formatted guidance
    return `auditReadyGuidance: \`${cleanPurpose}\n\n${formattedImplementation}\``;
  });
  
  return newContent;
}

// Apply the fixes
const updatedContent = fixGuidanceFormatting();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Fixed formatting of all guidance fields successfully!'); 