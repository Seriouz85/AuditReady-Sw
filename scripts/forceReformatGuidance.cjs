const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Force reformat guidance with a simpler, more direct approach
function forceReformatGuidance() {
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`([^`]*)`/g;
  
  // Replace with completely reconstructed content
  fileContent = fileContent.replace(regex, (match, content) => {
    console.log("Processing guidance content");
    
    // Get everything up to the first bullet point as purpose
    const contentLines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    // Find the first line that looks like a purpose line
    let purposeText = '';
    let purposeFound = false;
    let purposeEndIndex = 0;
    
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].toLowerCase();
      if (line.includes('purpose')) {
        purposeFound = true;
        continue; // Skip the actual "Purpose" label
      }
      
      // If we found a purpose line and the current line doesn't look like a bullet
      if (purposeFound && !line.startsWith('•') && !line.startsWith('*') && !line.includes('implementation')) {
        purposeText = contentLines[i];
        purposeEndIndex = i;
        break;
      }
    }
    
    // If no purpose was found, use the first non-empty line
    if (!purposeText && contentLines.length > 0) {
      for (let i = 0; i < contentLines.length; i++) {
        if (contentLines[i] && !contentLines[i].toLowerCase().includes('purpose') && 
            !contentLines[i].startsWith('•') && !contentLines[i].startsWith('*')) {
          purposeText = contentLines[i];
          purposeEndIndex = i;
          break;
        }
      }
    }
    
    // Extract bullet points - anything that starts with a bullet or has bullet-like content
    const bulletPoints = [];
    for (let i = purposeEndIndex + 1; i < contentLines.length; i++) {
      const line = contentLines[i];
      
      // Skip implementation headers
      if (line.toLowerCase().includes('implementation')) {
        continue;
      }
      
      // Skip empty lines or weird markers
      if (!line || line === '##' || line === '#') {
        continue;
      }
      
      // Clean up the line and extract the actual content
      let cleanLine = line
        .replace(/^[•*]+\s*/, '') // Remove leading bullets
        .replace(/^-\s*/, '')     // Remove leading dashes
        .trim();
        
      if (cleanLine && !bulletPoints.includes(cleanLine)) {
        bulletPoints.push(cleanLine);
      }
    }
    
    // Create the new guidance content with proper markdown
    const newContent = 
`**Purpose**

${purposeText}

**Implementation**

${bulletPoints.map(point => `* ${point}`).join('\n\n')}`;
    
    return `auditReadyGuidance: \`${newContent}\``;
  });
  
  return fileContent;
}

// Apply the fixes
const updatedContent = forceReformatGuidance();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Force reformatted all guidance content successfully!'); 