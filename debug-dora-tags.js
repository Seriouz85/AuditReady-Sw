/**
 * Debug script to investigate DORA requirement tags vs other frameworks
 * This will help identify why DORA shows "tag-governance-and-leadership" + "tag-governance"
 * while other frameworks show clean "Governance & Leadership"
 */

// Mock DORA requirement from the image
const mockDoraRequirement = {
  id: 'dora-article-1',
  code: 'Article 1',
  title: 'Subject matter',
  framework: 'DORA',
  // This is what we see in the UI - double tags with incorrect format
  tags: ['tag-governance-and-leadership', 'tag-governance'],
  categories: [], // Likely empty or incorrect
};

// Mock other framework requirement that works correctly
const mockISORequirement = {
  id: 'iso-a-5-1',
  code: 'A.5.1',
  title: 'Information Security Policy',
  framework: 'ISO 27001',
  tags: [], // Clean - no old style tags
  categories: ['Governance & Leadership'], // Clean category names
};

console.log('🔍 DORA Requirements Analysis');
console.log('=============================');

console.log('\n❌ DORA Requirement (PROBLEMATIC):');
console.log('- Code:', mockDoraRequirement.code);
console.log('- Title:', mockDoraRequirement.title);
console.log('- Tags:', mockDoraRequirement.tags);
console.log('- Categories:', mockDoraRequirement.categories);
console.log('- Expected UI: Shows double tags "tag-governance-and-leadership" + "tag-governance"');

console.log('\n✅ ISO 27001 Requirement (CORRECT):');
console.log('- Code:', mockISORequirement.code);
console.log('- Title:', mockISORequirement.title);
console.log('- Tags:', mockISORequirement.tags);
console.log('- Categories:', mockISORequirement.categories);
console.log('- Expected UI: Shows clean "Governance & Leadership"');

console.log('\n🎯 SOLUTION NEEDED:');
console.log('1. DORA requirements should have empty tags: []');
console.log('2. DORA requirements should have proper categories: ["Governance & Leadership"]');
console.log('3. All unified category names must match exactly what other frameworks use');

console.log('\n📋 UNIFIED CATEGORY NAMES (from image):');
const categoryNames = [
  'Governance & Leadership',
  'Risk Management', 
  'Inventory and Control of Software Assets',
  'Inventory and Control of Hardware Assets',
  'Identity & Access Management',
  'Data Protection',
  'Secure Configuration of Hardware and Software',
  'Vulnerability Management',
  'Physical & Environmental Security Controls',
  'Network Infrastructure Management',
  'Secure Software Development',
  'Network Monitoring & Defense',
  'Supplier & Third-Party Risk Management',
  'Security Awareness & Skills Training',
  'Business Continuity & Disaster Recovery Management',
  'Incident Response Management',
  'Malware Defenses',
  'Email & Web Browser Protections',
  'Penetration Testing',
  'Audit Log Management',
  'GDPR Unified Compliance'
];

categoryNames.forEach(name => console.log(`- ${name}`));

console.log('\n🔧 IMPLEMENTATION STEPS:');
console.log('1. Update DORA requirements in database to use proper unified category names');
console.log('2. Clear old-style tags for DORA requirements');
console.log('3. Ensure RequirementTable shows categories first (which it already does)');
console.log('4. Test that DORA requirements display the same as other frameworks');