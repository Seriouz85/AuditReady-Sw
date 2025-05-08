const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Fix the formatting of guidance to properly display with bullets
function enhanceGuidanceDisplay() {
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
      // Clean up implementation text and split into bullet points
      const points = implMatch[1]
        .replace(/•/g, '') // Remove existing bullet characters
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Create new points with consistent formatting
      implementation = points
        .map(point => `* ${point.replace(/^[-•*]\s*/, '')}`)
        .join('\n\n'); // Add empty line between bullet points
    }
    
    // Format the complete guidance with explicit markdown
    const newContent = 
`**Purpose**

${purpose}

**Implementation**

${implementation}`;
    
    return `auditReadyGuidance: \`${newContent}\``;
  });
  
  return fileContent;
}

// Apply the fixes
const updatedContent = enhanceGuidanceDisplay();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Enhanced guidance display formatting successfully!'); 