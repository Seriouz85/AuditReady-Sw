/**
 * Test Real-time Sync Between Admin Console and Landing Page
 * This script demonstrates the sync functionality
 */

import 'dotenv/config';

const STRIPE_SECRET_KEY = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const STRIPE_BASE_URL = 'https://api.stripe.com/v1';

async function makeStripeRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRIPE_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    options.body = formData.toString();
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stripe API Error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

async function testSync() {
  console.log('🧪 Testing Real-time Sync Between Admin Console and Landing Page\n');
  console.log('=' .repeat(60));
  
  try {
    // Get current products
    const products = await makeStripeRequest('/products?limit=10&active=true');
    const teamProduct = products.data.find(p => p.name.toLowerCase().includes('team'));
    
    if (!teamProduct) {
      console.log('❌ Team product not found for testing');
      return;
    }
    
    console.log(`📦 Found Team product: ${teamProduct.id}`);
    console.log(`   Current name: "${teamProduct.name}"`);
    console.log(`   Current description: "${teamProduct.description}"`);
    
    // Test 1: Update product name
    console.log('\n🔄 Test 1: Updating product name...');
    const originalName = teamProduct.name;
    const testName = `${originalName} [TESTING SYNC]`;
    
    await makeStripeRequest(`/products/${teamProduct.id}`, 'POST', {
      name: testName
    });
    
    console.log(`   ✅ Updated name to: "${testName}"`);
    console.log('   💡 This change should now be visible in:');
    console.log('      - Admin Console Products tab');
    console.log('      - Landing Page pricing section');
    console.log('      - Any other browser tabs with the landing page open');
    
    // Wait a moment
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Revert the name
    console.log('\n🔄 Test 2: Reverting product name...');
    await makeStripeRequest(`/products/${teamProduct.id}`, 'POST', {
      name: originalName
    });
    
    console.log(`   ✅ Reverted name back to: "${originalName}"`);
    console.log('   💡 The change should immediately reflect across all tabs');
    
    console.log('\n🎉 Real-time Sync Test Complete!');
    console.log('\n📋 How the sync works:');
    console.log('   1. Admin console changes trigger localStorage events');
    console.log('   2. Landing page listens for these events');
    console.log('   3. DynamicPricingService clears cache and refetches');
    console.log('   4. Landing page updates instantly');
    
    console.log('\n🔧 To test manually:');
    console.log('   1. Open Admin Console (/admin) in one tab');
    console.log('   2. Open Landing Page (/) in another tab');
    console.log('   3. In Admin Console:');
    console.log('      - Go to Products tab');
    console.log('      - Edit a product name or price');
    console.log('      - Save changes');
    console.log('   4. Watch the Landing Page update in real-time!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSync();