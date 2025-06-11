const fs = require('fs');

// Read the mock data file
const mockDataContent = fs.readFileSync('/Users/payam/audit-readiness-hub/src/data/mockData.ts', 'utf8');

// Let's focus on some specific missing codes and extract them manually
const targetCodes = ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6'];

targetCodes.forEach(code => {
  console.log(`\n=== Looking for code: ${code} ===`);
  
  // Use a more specific regex to find requirements with this code
  const regex = new RegExp(`\\{[^}]*?code:\\s*'${code.replace(/\./g, '\\.')}'[^}]*?\\}`, 'gs');
  const matches = mockDataContent.match(regex);
  
  if (matches) {
    console.log(`Found ${matches.length} requirements with code ${code}`);
    matches.forEach((match, index) => {
      // Extract key information
      const idMatch = match.match(/id:\s*'([^']+)'/);
      const standardIdMatch = match.match(/standardId:\s*'([^']+)'/);
      const nameMatch = match.match(/name:\s*'([^']+)'/);
      
      if (idMatch && standardIdMatch && nameMatch) {
        console.log(`  ${index + 1}. ID: ${idMatch[1]}, Standard: ${standardIdMatch[1]}, Name: ${nameMatch[1]}`);
      }
    });
  } else {
    console.log(`No matches found for code ${code}`);
  }
});

// Let's also look for some specific ISO codes that are definitely missing
console.log('\n=== Looking for ISO 27002 A7.x codes ===');
const isoCodes = ['A7.1', 'A7.2', 'A7.3', 'A7.4', 'A7.5'];

isoCodes.forEach(code => {
  const lines = mockDataContent.split('\n');
  const codeLines = lines.filter(line => line.includes(`code: '${code}'`));
  
  if (codeLines.length > 0) {
    console.log(`Found ${codeLines.length} occurrences of ${code}`);
    
    // Get context around each occurrence
    codeLines.forEach(line => {
      const lineIndex = lines.indexOf(line);
      if (lineIndex > 0) {
        const prevLine = lines[lineIndex - 1];
        const nextLine = lines[lineIndex + 1];
        
        const idMatch = prevLine.match(/id:\s*'([^']+)'/) || lines[lineIndex - 2]?.match(/id:\s*'([^']+)'/);
        const nameMatch = nextLine.match(/name:\s*'([^']+)'/);
        
        if (idMatch && nameMatch) {
          console.log(`  - ID: ${idMatch[1]}, Name: ${nameMatch[1]}`);
        }
      }
    });
  }
});