/**
 * Fix DORA Requirements Tags 
 * 
 * The issue: DORA requirements have old-style tags like 'tag-governance-and-leadership'
 * instead of proper unified category names like 'Governance & Leadership'
 * 
 * Solution: Map DORA requirements to correct unified categories
 */

// DORA Article to Unified Category Mapping
const doraToUnifiedCategoryMapping = {
  'Article 1': 'Governance & Leadership',      // Subject matter
  'Article 2': 'Governance & Leadership',      // Scope  
  'Article 3': 'Governance & Leadership',      // Definitions
  'Article 4': 'Governance & Leadership',      // Proportionality principle
  'Article 5': 'Governance & Leadership',      // Governance and organisation
  'Article 6': 'Risk Management',              // ICT risk management framework
  'Article 7': 'Risk Management',              // ICT risk management framework
  'Article 8': 'Risk Management',              // ICT risk management
  'Article 9': 'Risk Management',              // ICT risk management
  'Article 10': 'Risk Management',             // Simplified ICT risk management framework
  'Article 11': 'Risk Management',             // ICT risk management framework  
  'Article 12': 'Business Continuity & Disaster Recovery Management', // Digital operational resilience strategy
  'Article 13': 'Business Continuity & Disaster Recovery Management', // Learning and evolving
  'Article 14': 'Business Continuity & Disaster Recovery Management', // Digital operational resilience capabilities
  'Article 15': 'Incident Response Management', // ICT-related incident reporting
  'Article 16': 'Incident Response Management', // Classification of ICT-related incidents
  'Article 17': 'Incident Response Management', // ICT-related incident reporting
  'Article 18': 'Business Continuity & Disaster Recovery Management', // Digital operational resilience testing
  'Article 19': 'Business Continuity & Disaster Recovery Management', // Testing of digital operational resilience
  'Article 20': 'Business Continuity & Disaster Recovery Management', // Advanced testing
  'Article 21': 'Business Continuity & Disaster Recovery Management', // Digital operational resilience testing
  'Article 22': 'Supplier & Third-Party Risk Management', // General principles  
  'Article 23': 'Supplier & Third-Party Risk Management', // Key contractual provisions
  'Article 24': 'Supplier & Third-Party Risk Management', // Sub-outsourcing
  'Article 25': 'Supplier & Third-Party Risk Management', // Risk assessment
  'Article 26': 'Supplier & Third-Party Risk Management', // Key contractual provisions
  'Article 27': 'Supplier & Third-Party Risk Management', // Sub-outsourcing
  'Article 28': 'Supplier & Third-Party Risk Management', // ICT third-party service providers
};

console.log('🔧 DORA Tag Fix Generator');
console.log('==========================');

console.log('\n📋 DORA Article to Category Mapping:');
Object.entries(doraToUnifiedCategoryMapping).forEach(([article, category]) => {
  console.log(`${article}: ${category}`);
});

// Generate SQL updates for requirements_library table
console.log('\n🗄️  SQL UPDATE STATEMENTS (for requirements_library):');
console.log('-- Clear old-style tags and set proper categories for DORA requirements');

Object.entries(doraToUnifiedCategoryMapping).forEach(([article, category]) => {
  console.log(`UPDATE requirements_library SET tags = '[]'::jsonb, category = '${category}' WHERE framework = 'DORA' AND control_id = '${article}';`);
});

// Generate SQL for unified requirement mappings (if needed)
console.log('\n🗄️  SQL for Unified Requirement Mappings:');
console.log('-- Ensure DORA requirements are properly mapped to unified categories');
console.log(`
-- First, get the unified category IDs
SELECT id, name FROM unified_compliance_categories WHERE name IN (
  'Governance & Leadership',
  'Risk Management', 
  'Business Continuity & Disaster Recovery Management',
  'Incident Response Management',
  'Supplier & Third-Party Risk Management'
);

-- Then create mappings (replace category_id with actual IDs from above query)
-- INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id) 
-- SELECT ur.id, rl.id 
-- FROM unified_requirements ur
-- JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
-- JOIN requirements_library rl ON rl.framework = 'DORA'
-- WHERE ucc.name = 'Governance & Leadership' AND rl.control_id IN ('Article 1', 'Article 2', 'Article 3', 'Article 4', 'Article 5');
`);

console.log('\n✅ EXPECTED RESULT AFTER FIX:');
console.log('DORA requirements will display clean category tags like:');
console.log('- "Governance & Leadership" (instead of "tag-governance-and-leadership" + "tag-governance")');
console.log('- "Risk Management" (instead of tag-based duplicates)');
console.log('- Same visual consistency as ISO 27001, CIS Controls, etc.');

console.log('\n🧪 TESTING STEPS:');
console.log('1. Run the SQL updates on the database');
console.log('2. Restart the application');
console.log('3. Navigate to Requirements page with DORA filter');
console.log('4. Verify DORA requirements show clean category names');
console.log('5. Verify no double tags are displayed');
console.log('6. Verify same colors and styling as other frameworks');