const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Clean up remaining formatting issues with purpose and implementation headers
function finalGuidanceFormatting() {
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`([\s\S]*?)`/g;
  
  // Replace with properly formatted content
  fileContent = fileContent.replace(regex, (match, content) => {
    // Clean up any dots, asterisks or other markers around Purpose and Implementation
    let cleanContent = content
      // Clean purpose headers with dots
      .replace(/• *• *[Pp]urpose *• *•/g, '**Purpose**')
      .replace(/•+ *[Pp]urpose *•+/g, '**Purpose**')
      .replace(/\*\* *[Pp]urpose *\*\*/g, '**Purpose**')
      // Clean implementation headers with dots
      .replace(/• *• *[Ii]mplementation *• *•/g, '**Implementation**')
      .replace(/•+ *[Ii]mplementation *•+/g, '**Implementation**')
      .replace(/\*\* *[Ii]mplementation *\*\*/g, '**Implementation**')
      // Remove random hash symbols
      .replace(/^\s*• *##\s*$/gm, '')
      .replace(/##/g, '');
    
    // Extract purpose and implementation sections
    const purposeMatch = cleanContent.match(/\*\*Purpose\*\*\s*([\s\S]*?)(?=\*\*Implementation\*\*|$)/i);
    const implMatch = cleanContent.match(/\*\*Implementation\*\*\s*([\s\S]*?)$/i);
    
    let purpose = '';
    let implementation = '';
    
    if (purposeMatch && purposeMatch[1]) {
      purpose = purposeMatch[1].trim();
    }
    
    if (implMatch && implMatch[1]) {
      // Clean up bullet points
      implementation = implMatch[1]
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Ensure consistent bullet points
          if (line.startsWith('*') || line.startsWith('•')) {
            return `* ${line.replace(/^[•*]\s*/, '')}`;
          }
          return `* ${line}`;
        })
        .join('\n\n');
    }
    
    // Format the complete guidance with explicit markdown and more spacing
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
const updatedContent = finalGuidanceFormatting();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Final guidance formatting completed successfully!'); 