const fs = require('fs');

// Read the mock data file
const mockDataContent = fs.readFileSync('/Users/payam/audit-readiness-hub/src/data/mockData.ts', 'utf8');

// Extract requirements array using regex
const requirementsMatch = mockDataContent.match(/export const requirements: Requirement\[\] = \[([\s\S]*?)\];/);
if (!requirementsMatch) {
  console.error('Could not find requirements array');
  process.exit(1);
}

// Read missing codes
const missingCodes = fs.readFileSync('/tmp/missing_codes.txt', 'utf8').trim().split('\n');
const uniqueMissingCodes = [...new Set(missingCodes)];

console.log('Missing codes:', uniqueMissingCodes.length);
console.log('Unique missing codes:', uniqueMissingCodes);

// Mock the types and create a basic structure to parse
const mockTypes = `
interface Requirement {
  id: string;
  standardId: string;
  section: string;
  code: string;
  name: string;
  description: string;
  guidance: string;
  status: string;
  evidence: string;
  notes: string;
  responsibleParty: string;
  lastAssessmentDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  auditReadyGuidance?: string;
}
`;

// Parse requirements with a more robust method
const requirementsStr = requirementsMatch[1];
const requirements = [];

// Split by requirement boundaries (looking for id: pattern)
const reqParts = requirementsStr.split(/\s*{\s*id:\s*'/);

for (let i = 1; i < reqParts.length; i++) {
  const reqStr = reqParts[i];
  
  try {
    // Extract key fields using regex
    const idMatch = reqStr.match(/^([^']+)/);
    const codeMatch = reqStr.match(/code:\s*'([^']+)'/);
    const nameMatch = reqStr.match(/name:\s*'([^']+)'/);
    const descMatch = reqStr.match(/description:\s*'([^']*?)'/);
    const standardIdMatch = reqStr.match(/standardId:\s*'([^']+)'/);
    const sectionMatch = reqStr.match(/section:\s*'([^']+)'/);
    
    if (idMatch && codeMatch && nameMatch && standardIdMatch) {
      const req = {
        id: idMatch[1],
        code: codeMatch[1],
        name: nameMatch[1],
        description: descMatch ? descMatch[1] : '',
        standardId: standardIdMatch[1],
        section: sectionMatch ? sectionMatch[1] : '',
      };
      
      if (uniqueMissingCodes.includes(req.code)) {
        requirements.push(req);
      }
    }
  } catch (e) {
    console.error('Error parsing requirement:', e);
  }
}

console.log(`Found ${requirements.length} missing requirements`);

// Save the extracted requirements
fs.writeFileSync('/tmp/missing_requirements.json', JSON.stringify(requirements, null, 2));

// Also create a simpler list for verification
const simpleList = requirements.map(r => ({ code: r.code, name: r.name, standardId: r.standardId }));
fs.writeFileSync('/tmp/missing_requirements_simple.json', JSON.stringify(simpleList, null, 2));

console.log('Saved missing requirements to /tmp/missing_requirements.json');