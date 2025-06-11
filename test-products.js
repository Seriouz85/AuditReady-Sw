/**
 * Quick test to verify our Stripe products exist
 */

const STRIPE_SECRET_KEY = 'sk_test_51RXKwbBDPoJ4xbIHIzeSLnkgKI6HYUZ8LyRUqRqyqVTBJqfGHq99mWnya5YHNinElMMTksFhLsOy3IEoQsocqYxK00mKpv3Du7';

async function testStripeProducts() {
  console.log('🔍 Testing Stripe products...\n');

  try {
    // List all products
    const response = await fetch('https://api.stripe.com/v1/products?limit=100&active=true', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.data.length} active products:`);
    
    data.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Active: ${product.active}`);
      console.log(`   Description: ${product.description || 'No description'}`);
      console.log(`   Metadata: ${JSON.stringify(product.metadata, null, 2)}`);
    });

    // Also test prices
    console.log('\n🔍 Testing Stripe prices...\n');
    
    const pricesResponse = await fetch('https://api.stripe.com/v1/prices?limit=100&active=true', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!pricesResponse.ok) {
      throw new Error(`HTTP ${pricesResponse.status}: ${pricesResponse.statusText}`);
    }

    const pricesData = await pricesResponse.json();
    
    console.log(`✅ Found ${pricesData.data.length} active prices:`);
    
    pricesData.data.forEach((price, index) => {
      console.log(`\n${index + 1}. Price ID: ${price.id}`);
      console.log(`   Product: ${price.product}`);
      console.log(`   Amount: €${price.unit_amount / 100}`);
      console.log(`   Interval: ${price.recurring?.interval || 'one-time'}`);
      console.log(`   Active: ${price.active}`);
    });

    console.log('\n🎉 Stripe API is working correctly!');
    console.log('✅ Your admin console should now show these products.');

  } catch (error) {
    console.error('❌ Failed to fetch Stripe data:', error);
  }
}

testStripeProducts();