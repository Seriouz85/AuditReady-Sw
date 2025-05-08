const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Fix the formatting of guidance to properly render in markdown
function enhanceMarkdownFormatting() {
  // Find all auditReadyGuidance fields
  const regex = /auditReadyGuidance:\s*`(Purpose:[^`]+?Implementation:[^`]+?)`/gs;
  
  // Replace with explicitly formatted markdown
  fileContent = fileContent.replace(regex, (match, content) => {
    // Add markdown headers and ensure bullet points are properly formatted
    let enhancedContent = content
      // Format the Purpose section as an h3
      .replace(/Purpose:\s*(.+?)(?=\n\n)/s, '## Purpose\n\n$1')
      // Format the Implementation section as an h3
      .replace(/Implementation:/g, '## Implementation')
      // Ensure consistent bullet point formatting
      .replace(/\n- /g, '\n* ');
      
    return `auditReadyGuidance: \`${enhancedContent}\``;
  });
  
  return fileContent;
}

// Apply the fixes
const updatedContent = enhanceMarkdownFormatting();

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Enhanced markdown formatting for guidance fields successfully!'); 