/**
 * Check existing Stripe products and sync them with landing page
 */

import { enhancedStripeService } from './src/services/stripe/EnhancedStripeService.js';

async function checkExistingProducts() {
  console.log('🔍 Checking existing Stripe products...\n');
  
  try {
    // Get all products and prices
    const [productsResult, pricesResult] = await Promise.all([
      enhancedStripeService.listProducts(true, 50),
      enhancedStripeService.listPrices(undefined, true, 100)
    ]);
    
    const products = productsResult.data;
    const prices = pricesResult.data;
    
    console.log(`Found ${products.length} products and ${prices.length} prices\n`);
    
    // Expected tiers from landing page
    const expectedTiers = ['team', 'business', 'enterprise'];
    const expectedPrices = {
      team: 499,
      business: 699, 
      enterprise: 999
    };
    
    console.log('📊 Current Stripe Products:');
    console.log('=' .repeat(50));
    
    products.forEach((product) => {
      console.log(`\n📦 ${product.name} (${product.id})`);
      console.log(`   Description: ${product.description || 'No description'}`);
      console.log(`   Active: ${product.active}`);
      console.log(`   Metadata: ${JSON.stringify(product.metadata, null, 2)}`);
      
      // Find prices for this product
      const productPrices = prices.filter(p => p.product === product.id);
      console.log(`   Prices (${productPrices.length}):`);
      
      productPrices.forEach((price) => {
        const amount = price.unit_amount / 100;
        const interval = price.recurring?.interval || 'one-time';
        console.log(`     - €${amount}/${interval} (${price.id})`);
      });
    });
    
    console.log('\n🎯 Landing Page Expected Products:');
    console.log('=' .repeat(50));
    
    expectedTiers.forEach((tier) => {
      const expectedPrice = expectedPrices[tier];
      const existingProduct = products.find(p => 
        p.name.toLowerCase() === tier ||
        p.metadata.tier === tier
      );
      
      if (existingProduct) {
        const productPrices = prices.filter(p => p.product === existingProduct.id);
        const monthlyPrice = productPrices.find(p => p.recurring?.interval === 'month');
        const actualPrice = monthlyPrice ? monthlyPrice.unit_amount / 100 : 'No monthly price';
        
        const status = actualPrice === expectedPrice ? '✅' : '⚠️';
        console.log(`${status} ${tier.toUpperCase()}: Expected €${expectedPrice}, Found €${actualPrice}`);
        
        if (actualPrice !== expectedPrice) {
          console.log(`   → Product: ${existingProduct.id}`);
          console.log(`   → Price needs update or new price needed`);
        }
      } else {
        console.log(`❌ ${tier.toUpperCase()}: Expected €${expectedPrice}, NOT FOUND`);
      }
    });
    
    console.log('\n💡 Recommendations:');
    console.log('=' .repeat(50));
    
    // Check if we need to create or update products
    let needsUpdates = false;
    
    expectedTiers.forEach((tier) => {
      const expectedPrice = expectedPrices[tier];
      const existingProduct = products.find(p => 
        p.name.toLowerCase() === tier ||
        p.metadata.tier === tier
      );
      
      if (!existingProduct) {
        console.log(`🆕 Create ${tier} product with €${expectedPrice}/month pricing`);
        needsUpdates = true;
      } else {
        const productPrices = prices.filter(p => p.product === existingProduct.id);
        const monthlyPrice = productPrices.find(p => p.recurring?.interval === 'month');
        
        if (!monthlyPrice || monthlyPrice.unit_amount / 100 !== expectedPrice) {
          console.log(`🔄 Update ${tier} pricing to €${expectedPrice}/month`);
          needsUpdates = true;
        }
      }
    });
    
    if (!needsUpdates) {
      console.log('✅ All products match landing page pricing!');
    }
    
    return { products, prices, needsUpdates };
    
  } catch (error) {
    console.error('❌ Error checking Stripe products:', error);
    throw error;
  }
}

// Run the check
checkExistingProducts()
  .then(({ needsUpdates }) => {
    if (needsUpdates) {
      console.log('\n🔧 Run setup-stripe-products.js to create missing products');
    } else {
      console.log('\n🎉 Your Stripe products are ready for real-time sync!');
    }
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });