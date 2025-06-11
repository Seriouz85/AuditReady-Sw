/**
 * Setup Script: Create Stripe Products to Match Landing Page
 * This script creates the exact products and prices shown on the landing page
 */

import { enhancedStripeService } from './src/services/stripe/EnhancedStripeService.js';

const LANDING_PAGE_PRODUCTS = [
  {
    name: 'Team',
    description: 'Perfect for small teams getting started with compliance management. Includes multi-framework support, team collaboration tools, and email support.',
    price: 499, // €499 per month
    currency: 'eur',
    interval: 'month',
    features: [
      'All core features',
      'Multi-framework support',
      'Advanced reporting & analytics', 
      'Team collaboration tools',
      'Email support',
      'Up to 5 compliance frameworks'
    ],
    metadata: {
      tier: 'team',
      employee_range: '1-50',
      popular: 'true'
    }
  },
  {
    name: 'Business', 
    description: 'Designed for growing businesses that need advanced compliance capabilities. Includes custom templates, API integrations, and priority support.',
    price: 699, // €699 per month
    currency: 'eur',
    interval: 'month',
    features: [
      'Everything in Team',
      'Custom audit templates',
      'API integrations', 
      'Priority support',
      'Advanced security features',
      'Unlimited frameworks',
      'Custom workflows'
    ],
    metadata: {
      tier: 'business',
      employee_range: '50-1000'
    }
  },
  {
    name: 'Enterprise',
    description: 'Complete enterprise solution with white-label capabilities, dedicated support, and custom development. Perfect for large organizations.',
    price: 999, // €999 per month
    currency: 'eur', 
    interval: 'month',
    features: [
      'Everything in Business',
      'White-label solution',
      'Dedicated support manager',
      'Single Sign-On (SSO)',
      'Custom development',
      'SLA guarantees',
      'On-premise deployment',
      '24/7 phone support'
    ],
    metadata: {
      tier: 'enterprise',
      employee_range: '1000+'
    }
  }
];

async function createProductsInStripe() {
  console.log('🚀 Setting up Stripe products to match landing page...\n');
  
  try {
    const results = [];
    
    for (const productData of LANDING_PAGE_PRODUCTS) {
      console.log(`📦 Creating product: ${productData.name}`);
      
      // Create the product
      const product = await enhancedStripeService.createProduct({
        name: productData.name,
        description: productData.description,
        metadata: {
          ...productData.metadata,
          features: JSON.stringify(productData.features)
        },
        active: true
      });
      
      console.log(`   ✅ Product created: ${product.id}`);
      
      // Create the monthly price
      const price = await enhancedStripeService.createPrice({
        product: product.id,
        currency: productData.currency,
        unit_amount: productData.price * 100, // Convert to cents
        recurring: {
          interval: productData.interval
        },
        metadata: {
          tier: productData.metadata.tier,
          display_name: `${productData.name} Monthly`
        },
        active: true
      });
      
      console.log(`   💰 Price created: ${price.id} (€${productData.price}/${productData.interval})`);
      
      // Create annual price with 20% discount
      const annualPrice = Math.round(productData.price * 12 * 0.8); // 20% discount
      const yearlyPrice = await enhancedStripeService.createPrice({
        product: product.id,
        currency: productData.currency,
        unit_amount: annualPrice * 100,
        recurring: {
          interval: 'year'
        },
        metadata: {
          tier: productData.metadata.tier,
          display_name: `${productData.name} Annual`,
          discount_percentage: '20'
        },
        active: true
      });
      
      console.log(`   💰 Annual price created: ${yearlyPrice.id} (€${annualPrice}/year - 20% off)`);
      
      results.push({
        product,
        monthlyPrice: price,
        yearlyPrice: yearlyPrice,
        tier: productData.metadata.tier
      });
      
      console.log(`   ✨ ${productData.name} setup complete!\n`);
    }
    
    console.log('🎉 All products created successfully!\n');
    console.log('📋 Summary:');
    
    results.forEach(({ product, monthlyPrice, yearlyPrice, tier }) => {
      console.log(`\n${product.name} (${tier}):`);
      console.log(`  Product ID: ${product.id}`);
      console.log(`  Monthly Price ID: ${monthlyPrice.id}`);
      console.log(`  Annual Price ID: ${yearlyPrice.id}`);
    });
    
    console.log('\n🔗 Environment Variables:');
    console.log('Add these to your .env file:');
    
    results.forEach(({ product, monthlyPrice, tier }) => {
      const envVar = `VITE_STRIPE_${tier.toUpperCase()}_PRICE_ID`;
      console.log(`${envVar}=${monthlyPrice.id}`);
    });
    
    console.log('\n✅ Setup complete! Your admin console can now manage these products.');
    console.log('💡 Changes made in the admin console will sync to the landing page in real-time.');
    
    return results;
    
  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createProductsInStripe()
    .then(() => {
      console.log('\n🚀 Ready to sync! Run your admin console to manage these products.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { createProductsInStripe };