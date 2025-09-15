// Test cleaning function
const testData = `d) Automated Software Discovery: Deploy automated software inventory tools across all enterprise assets including workstations, servers, mobile devices, and cloud instances. Configure continuous scanning with real-time inventory updates, software change detection, and comprehensive coverage validation. Integrate discovery tools with Cmdb and asset management systems for consolidated asset visibility. 
• Purpose Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets 
📋 Audit Ready Evidence Collection: Essential Documentation Required: 
• Unauthorized software detection and removal procedures 
• Software allowlisting/blocklisting policies and enforcement mechanisms
• Incident response procedures for unauthorized software discoveries
• Regular software audit reports showing unauthorized software findings
• User access controls preventing unauthorized software installation Technical Evidence to Collect:
• Application allowlisting tool configuration and blocked execution logs
• Software discovery scans comparing found software against approved inventory
• Group Policy or endpoint management configurations preventing installations`;

console.log('=== ORIGINAL DATA ===');
console.log('Length:', testData.length);
console.log('Contains audit evidence header:', testData.includes('📋 Audit Ready Evidence Collection'));
console.log('Lines with bullets:', testData.split('\n').filter(line => line.trim().startsWith('•')).length);

console.log('\n=== PATTERNS TO REMOVE ===');
const lines = testData.split('\n');
lines.forEach((line, i) => {
  const trimmedLine = line.trim();
  if (trimmedLine.includes('📋') || trimmedLine.includes('Audit Ready Evidence') || 
      trimmedLine.includes('Essential Documentation Required') || 
      trimmedLine.includes('Technical Evidence to Collect')) {
    console.log(`Line ${i+1}: ${trimmedLine}`);
  }
  if (trimmedLine.startsWith('•')) {
    // Check if it matches audit evidence patterns
    const evidencePatterns = [
      /^•?\s*unauthorized.*software.*detection.*and.*removal.*procedures/gi,
      /^•?\s*software.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms/gi,
      /^•?\s*incident.*response.*procedures.*for.*unauthorized.*software.*discoveries/gi,
      /^•?\s*regular.*software.*audit.*reports.*showing.*unauthorized.*software.*findings/gi,
      /^•?\s*user.*access.*controls.*preventing.*unauthorized.*software.*installation/gi,
      /^•?\s*application.*allowlisting.*tool.*configuration.*and.*blocked.*execution.*logs/gi,
      /^•?\s*software.*discovery.*scans.*comparing.*found.*software.*against.*approved.*inventory/gi,
      /^•?\s*group.*policy.*or.*endpoint.*management.*configurations.*preventing.*installations/gi
    ];
    
    const isEvidence = evidencePatterns.some(pattern => pattern.test(trimmedLine));
    if (isEvidence) {
      console.log(`Evidence bullet ${i+1}: ${trimmedLine}`);
    }
  }
});