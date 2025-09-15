/**
 * Test script to debug DORA requirements tags in the live system
 * This will help us understand where the double tags are coming from
 */

console.log('🔍 DORA Requirements Debug Test');
console.log('================================');
console.log('Open your browser console and navigate to Requirements page with DORA filter');
console.log('Then run this in the browser console to debug the actual requirement data:');

const debugScript = `
// BROWSER CONSOLE DEBUG SCRIPT - Copy this to browser console
console.log('🔍 DEBUGGING DORA REQUIREMENTS DATA');

// Find any requirements data in window/global scope
if (window.requirementsData) {
  const doraReqs = window.requirementsData.filter(req => req.framework === 'DORA' || req.code?.startsWith('Article'));
  console.log('DORA Requirements from window.requirementsData:', doraReqs);
}

// Check React DevTools data
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  console.log('React DevTools available - check component state');
}

// Try to access the requirements through DOM analysis
const requirementRows = Array.from(document.querySelectorAll('[role="row"], tr')).filter(row => 
  row.textContent?.includes('Article 1') || row.textContent?.includes('Article 2')
);

console.log('Found', requirementRows.length, 'DORA requirement DOM rows');

requirementRows.forEach((row, index) => {
  const badges = Array.from(row.querySelectorAll('.badge, [class*="badge"]'));
  const tagTexts = badges.map(badge => badge.textContent?.trim()).filter(Boolean);
  console.log('Row', index + 1, 'tags:', tagTexts);
});

// Check localStorage/sessionStorage for requirements data
if (localStorage.requirementsCache) {
  try {
    const cached = JSON.parse(localStorage.requirementsCache);
    const doraReqs = cached.filter(req => req.code?.startsWith('Article'));
    console.log('DORA Requirements from localStorage:', doraReqs?.slice(0, 3));
  } catch (e) {
    console.log('No cached requirements in localStorage');
  }
}

// Check if there's any API data visible
console.log('🔍 Network tab should show API calls to /api/requirements or similar');
console.log('🔍 Look for DORA requirements in the response data');
console.log('🔍 Check if tags field contains the problematic data');
`;

console.log('\n📋 BROWSER CONSOLE SCRIPT:');
console.log('Copy and paste this into your browser console on the Requirements page:');
console.log('\n' + debugScript);

console.log('\n🎯 WHAT TO LOOK FOR:');
console.log('1. DORA requirements with tags: ["tag-governance-and-leadership", "tag-governance"]');
console.log('2. DORA requirements with empty categories: []');
console.log('3. Compare with working requirements that have proper categories');

console.log('\n✅ EXPECTED AFTER FIX:');
console.log('DORA requirements should have:');
console.log('- tags: [] (empty)');
console.log('- categories: ["Governance & Leadership"] (proper names)');