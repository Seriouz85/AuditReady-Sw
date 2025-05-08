const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Fix the formatting of guidance to properly display with bullets
function fixGuidanceDisplay() {
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`([\s\S]*?)`/g;
  
  // Replace with properly formatted content
  fileContent = fileContent.replace(regex, (match, content) => {
    // Extract purpose and implementation sections
    const purposeMatch = content.match(/Purpose:?\s*([\s\S]*?)(?=Implementation:|$)/i);
    const implMatch = content.match(/Implementation:?\s*([\s\S]*?)(?=$)/i);
    
    let purpose = '';
    let implementation = '';
    
    if (purposeMatch && purposeMatch[1]) {
      purpose = purposeMatch[1].trim();
    }
    
    if (implMatch && implMatch[1]) {
      // Process implementation points into proper bullet points
      implementation = implMatch[1]
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `* ${line.replace(/^[-•*]\s*/, '')}`)
        .join('\n');
    }
    
    // Format the complete guidance with explicit markdown
    const newContent = 
`Purpose
${purpose}

Implementation
${implementation}`;
    
    return `auditReadyGuidance: \`${newContent}\``;
  });
  
  return fileContent;
}

// Apply the fixes
const updatedContent = fixGuidanceDisplay();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Fixed guidance display formatting successfully!'); 