// Clean audit evidence from unified_requirements.sub_requirements database records
// This script removes audit evidence that was mistakenly stored in requirements instead of guidance

const cleanAuditEvidenceFromText = (text) => {
  if (!text) return text;
  
  // Split into lines and filter out audit evidence
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return true; // Keep empty lines
    
    // Remove audit evidence headers and sections
    if (/^•?\s*📋.*?audit.*?ready.*?evidence.*?collection/gi.test(trimmedLine)) return false;
    if (/^•?\s*audit.*?ready.*?evidence.*?collection.*?essential.*?documentation.*?required/gi.test(trimmedLine)) return false;
    if (/^•?\s*essential.*?documentation.*?required/gi.test(trimmedLine)) return false;
    if (/technical.*?evidence.*?to.*?collect/gi.test(trimmedLine)) return false;
    
    // Remove common audit evidence bullet points
    const evidencePatterns = [
      // Generic audit evidence patterns
      /^•?\s*documented.*?policy.*?with.*?management.*?approval/gi,
      /^•?\s*implementation.*?procedures.*?and.*?workflows/gi,
      /^•?\s*training.*?records.*?and.*?competency.*?assessments/gi,
      /^•?\s*regular.*?review.*?and.*?update.*?documentation/gi,
      /^•?\s*compliance.*?monitoring.*?and.*?reporting.*?records/gi,
      
      // Software inventory specific patterns
      /^•?\s*unauthorized.*?software.*?detection.*?and.*?removal.*?procedures/gi,
      /^•?\s*software.*?allowlisting.*?blocklisting.*?policies.*?and.*?enforcement.*?mechanisms/gi,
      /^•?\s*incident.*?response.*?procedures.*?for.*?unauthorized.*?software.*?discoveries/gi,
      /^•?\s*regular.*?software.*?audit.*?reports.*?showing.*?unauthorized.*?software.*?findings/gi,
      /^•?\s*user.*?access.*?controls.*?preventing.*?unauthorized.*?software.*?installation/gi,
      /^•?\s*application.*?allowlisting.*?tool.*?configuration.*?and.*?blocked.*?execution.*?logs/gi,
      /^•?\s*software.*?discovery.*?scans.*?comparing.*?found.*?software.*?against.*?approved.*?inventory/gi,
      /^•?\s*group.*?policy.*?or.*?endpoint.*?management.*?configurations.*?preventing.*?installations/gi,
      
      // Network security patterns
      /^•?\s*.*?deployment.*?coverage.*?reports.*?across.*?critical.*?enterprise.*?assets/gi,
      /^•?\s*.*?agent.*?configuration.*?and.*?detection.*?rule.*?sets/gi,
      /^•?\s*.*?alert.*?generation.*?and.*?investigation.*?logs/gi,
      /^•?\s*.*?system.*?performance.*?and.*?resource.*?utilization.*?monitoring/gi,
      /^•?\s*.*?integration.*?with.*?centralized.*?security.*?monitoring.*?and.*?siem.*?systems/gi,
      /^•?\s*.*?signature.*?and.*?rule.*?update.*?procedures.*?and.*?schedules/gi,
      
      // Infrastructure patterns
      /^•?\s*.*?network.*?infrastructure.*?inventory.*?with.*?current.*?firmware.*?software.*?versions/gi,
      /^•?\s*.*?patch.*?management.*?procedures.*?for.*?network.*?devices/gi,
      /^•?\s*.*?update.*?testing.*?results.*?and.*?rollback.*?procedures/gi,
      /^•?\s*.*?vulnerability.*?scans.*?of.*?network.*?infrastructure.*?showing.*?current.*?patch.*?levels/gi,
      
      // SIEM patterns
      /^•?\s*.*?siem.*?system.*?deployment.*?architecture.*?and.*?data.*?flow.*?diagrams/gi,
      /^•?\s*.*?log.*?source.*?configuration.*?and.*?collection.*?status.*?across.*?enterprise.*?assets/gi,
      /^•?\s*.*?security.*?event.*?correlation.*?rules.*?and.*?alerting.*?thresholds.*?configuration/gi,
      /^•?\s*.*?siem.*?dashboard.*?and.*?reporting.*?capabilities.*?demonstration/gi,
      /^•?\s*.*?security.*?event.*?storage.*?retention.*?and.*?backup.*?procedures/gi,
      
      // HIDS patterns
      /^•?\s*.*?host.*?based.*?intrusion.*?detection.*?system.*?deployment.*?policy.*?and.*?standards/gi,
      /^•?\s*.*?enterprise.*?asset.*?risk.*?assessment.*?and.*?hids.*?deployment.*?prioritization/gi,
      /^•?\s*.*?hids.*?agent.*?configuration.*?and.*?rule.*?management.*?procedures/gi,
      /^•?\s*.*?hids.*?alert.*?investigation.*?and.*?response.*?procedures/gi,
      /^•?\s*.*?hids.*?system.*?architecture.*?and.*?integration.*?documentation/gi,
      /^•?\s*.*?hids.*?performance.*?monitoring.*?and.*?tuning.*?procedures/gi
    ];
    
    // Check if this line matches any audit evidence pattern
    return !evidencePatterns.some(pattern => pattern.test(trimmedLine));
  });
  
  return filteredLines.join('\n').replace(/\s+/g, ' ').trim();
};

// Test the cleaning function
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

console.log('=== TESTING AUDIT EVIDENCE CLEANING ===');
console.log('Original length:', testData.length);
const cleaned = cleanAuditEvidenceFromText(testData);
console.log('Cleaned length:', cleaned.length);
console.log('\n=== CLEANED RESULT ===');
console.log(cleaned);

const stillHasEvidence = cleaned.includes('📋') || cleaned.includes('Audit Ready Evidence') || cleaned.includes('allowlisting tool configuration');
console.log('\n=== CLEANING SUCCESS ===');
console.log('Still contains audit evidence?', stillHasEvidence);

// Generate SQL UPDATE statements for database cleaning
console.log('\n=== GENERATED SQL CLEANING STATEMENTS ===');

const categoryNames = [
  'Network Security',
  'Network Infrastructure',
  'Network Monitoring & Defense',
  'Software Security',
  'System Security',
  'Application Security'
];

categoryNames.forEach(category => {
  console.log(`
-- Clean audit evidence from ${category}
UPDATE unified_requirements 
SET sub_requirements = jsonb_set(
  sub_requirements,
  '{}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN value::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection'
          OR value::text ~ '[Uu]nauthorized.*software.*detection.*and.*removal.*procedures'
          OR value::text ~ '[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms'
          OR value::text ~ '[Aa]pplication.*allowlisting.*tool.*configuration.*and.*blocked.*execution.*logs'
          OR value::text ~ '[Ss]oftware.*discovery.*scans.*comparing.*found.*software.*against.*approved.*inventory'
          OR value::text ~ '[Gg]roup.*[Pp]olicy.*or.*endpoint.*management.*configurations.*preventing.*installations'
        THEN regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(value::text, '📋[^\\n]*\\n', '', 'g'),
              '•\\s*[Uu]nauthorized.*software.*detection.*and.*removal.*procedures[^\\n]*\\n?', '', 'g'
            ),
            '•\\s*[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms[^\\n]*\\n?', '', 'g'
          ),
          '•\\s*[Aa]pplication.*allowlisting.*tool.*configuration.*and.*blocked.*execution.*logs[^\\n]*\\n?', '', 'g'
        )::jsonb
        ELSE value
      END
    )
    FROM jsonb_array_elements(sub_requirements)
  ),
  true
)
WHERE category_name = '${category}' 
AND sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection|[Uu]nauthorized.*software.*detection';`);
});

console.log('\n=== INSTRUCTIONS ===');
console.log('1. Run this script to test the cleaning logic');
console.log('2. Execute the generated SQL statements in the database');
console.log('3. Verify the audit evidence has been removed from unified_requirements');
console.log('4. The audit evidence will still appear correctly in unified_guidance');