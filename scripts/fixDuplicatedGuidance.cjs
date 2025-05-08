const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Fix duplicated guidance and improve formatting
function fixGuidanceContent() {
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`([\s\S]*?)`/g;
  
  // Replace with properly formatted content
  fileContent = fileContent.replace(regex, (match, content) => {
    // Clean up the content - remove duplicates and extra symbols
    let cleanContent = content
      .replace(/\*\*Purpose\*\*/g, '') // Remove existing purpose headers
      .replace(/\*\*Implementation\*\*/g, '') // Remove existing implementation headers
      .replace(/• • [Pp]urpose • •/g, '') // Remove weird purpose markers
      .replace(/• • [Ii]mplementation • •/g, '') // Remove weird implementation markers
      .replace(/[Pp]urpose/g, '') // Remove any remaining purpose text
      .replace(/[Ii]mplementation/g, '') // Remove any remaining implementation text
      .trim();
    
    // Split the content at a natural break point
    const contentParts = cleanContent.split(/\n\s*\n/);
    
    // The first non-empty part is likely the purpose
    let purpose = '';
    for (let i = 0; i < contentParts.length; i++) {
      if (contentParts[i].trim()) {
        purpose = contentParts[i].trim();
        contentParts.splice(i, 1);
        break;
      }
    }
    
    // The remaining parts likely contain the bullet points
    // Deduplicate bullet points by creating a Set of the cleaned text
    const bulletPointsSet = new Set();
    contentParts.forEach(part => {
      // Split by bullet points and add unique ones to the set
      part.split(/\n\s*\*\s*/)
        .map(point => point.trim().replace(/^[-•*]\s*/, ''))
        .filter(point => point.length > 0)
        .forEach(point => bulletPointsSet.add(point));
    });
    
    // Create the implementation bullet points
    const bulletPoints = Array.from(bulletPointsSet)
      .map(point => `* ${point}`)
      .join('\n\n');
    
    // Format the complete guidance with explicit markdown and more spacing
    const newContent = 
`**Purpose**

${purpose}

**Implementation**

${bulletPoints}`;
    
    return `auditReadyGuidance: \`${newContent}\``;
  });
  
  return fileContent;
}

// Apply the fixes
const updatedContent = fixGuidanceContent();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Fixed duplicated guidance content successfully!'); 