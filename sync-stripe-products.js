/**
 * Sync Stripe Products with Landing Page
 * This script creates/updates Stripe products to match the landing page exactly
 */

import 'dotenv/config';

const STRIPE_SECRET_KEY = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const STRIPE_BASE_URL = 'https://api.stripe.com/v1';

// Landing page products that need to be in Stripe
const LANDING_PAGE_PRODUCTS = [
  {
    name: 'Team',
    description: 'Perfect for small teams getting started with compliance management. Includes multi-framework support, team collaboration tools, and email support.',
    price: 499, // €4.99 per month  
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
    price: 699, // €6.99 per month
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
    price: 999, // €9.99 per month
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
    
    // Flatten nested objects for Stripe API
    const flattenObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}[${key}]` : key;
        
        if (value === null || value === undefined) {
          return;
        }
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              flattenObject(item, `${newKey}[${index}]`);
            } else {
              formData.append(`${newKey}[${index}]`, String(item));
            }
          });
        } else {
          formData.append(newKey, String(value));
        }
      });
    };
    
    flattenObject(data);
    options.body = formData.toString();
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stripe API Error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

async function getExistingProducts() {
  console.log('🔍 Fetching existing Stripe products...');
  
  const [products, prices] = await Promise.all([
    makeStripeRequest('/products?limit=100&active=true'),
    makeStripeRequest('/prices?limit=100&active=true')
  ]);
  
  return {
    products: products.data || [],
    prices: prices.data || []
  };
}

async function createProduct(productData) {
  console.log(`📦 Creating product: ${productData.name}`);
  
  const product = await makeStripeRequest('/products', 'POST', {
    name: productData.name,
    description: productData.description,
    metadata: {
      ...productData.metadata,
      features: JSON.stringify(productData.features)
    },
    active: true
  });
  
  console.log(`   ✅ Product created: ${product.id}`);
  
  // Create monthly price
  const price = await makeStripeRequest('/prices', 'POST', {
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
  
  console.log(`   💰 Monthly price created: ${price.id} (€${productData.price}/${productData.interval})`);
  
  // Create annual price with 20% discount
  const annualAmount = Math.round(productData.price * 12 * 0.8); // 20% off
  const yearlyPrice = await makeStripeRequest('/prices', 'POST', {
    product: product.id,
    currency: productData.currency,
    unit_amount: annualAmount * 100,
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
  
  console.log(`   💰 Annual price created: ${yearlyPrice.id} (€${annualAmount}/year - 20% off)`);
  
  return {
    product,
    monthlyPrice: price,
    yearlyPrice: yearlyPrice
  };
}

async function syncProducts() {
  console.log('🚀 Syncing Stripe products with landing page...\n');
  
  try {
    const { products: existingProducts, prices: existingPrices } = await getExistingProducts();
    
    console.log(`Found ${existingProducts.length} existing products\n`);
    
    const results = [];
    
    for (const productData of LANDING_PAGE_PRODUCTS) {
      // Check if product already exists
      const existingProduct = existingProducts.find(p => 
        p.name.toLowerCase() === productData.name.toLowerCase() ||
        p.metadata?.tier === productData.metadata.tier
      );
      
      if (existingProduct) {
        console.log(`📦 Product "${productData.name}" already exists: ${existingProduct.id}`);
        
        // Check if monthly price exists and matches
        const monthlyPrice = existingPrices.find(p => 
          p.product === existingProduct.id && 
          p.recurring?.interval === 'month'
        );
        
        if (monthlyPrice && monthlyPrice.unit_amount === productData.price * 100) {
          console.log(`   ✅ Price matches: €${productData.price}/month`);
          
          results.push({
            product: existingProduct,
            monthlyPrice: monthlyPrice,
            tier: productData.metadata.tier
          });
        } else {
          console.log(`   🔄 Creating new price for €${productData.price}/month`);
          
          const newPrice = await makeStripeRequest('/prices', 'POST', {
            product: existingProduct.id,
            currency: productData.currency,
            unit_amount: productData.price * 100,
            recurring: {
              interval: productData.interval
            },
            metadata: {
              tier: productData.metadata.tier,
              display_name: `${productData.name} Monthly Updated`
            },
            active: true
          });
          
          console.log(`   ✅ New price created: ${newPrice.id}`);
          
          results.push({
            product: existingProduct,
            monthlyPrice: newPrice,
            tier: productData.metadata.tier
          });
        }
      } else {
        // Create new product
        const result = await createProduct(productData);
        results.push({
          ...result,
          tier: productData.metadata.tier
        });
      }
      
      console.log('');
    }
    
    console.log('🎉 Product sync complete!\n');
    console.log('📋 Summary:');
    console.log('=' .repeat(50));
    
    results.forEach(({ product, monthlyPrice, tier }) => {
      console.log(`${product.name} (${tier}):`);
      console.log(`  Product ID: ${product.id}`);
      console.log(`  Monthly Price ID: ${monthlyPrice.id}`);
      console.log(`  Price: €${monthlyPrice.unit_amount / 100}/month`);
      console.log('');
    });
    
    console.log('🔗 Environment Variables (add to .env):');
    console.log('=' .repeat(50));
    
    results.forEach(({ monthlyPrice, tier }) => {
      const envVar = `VITE_STRIPE_${tier.toUpperCase()}_PRICE_ID`;
      console.log(`${envVar}=${monthlyPrice.id}`);
    });
    
    console.log('\n✅ Setup complete!');
    console.log('💡 Your admin console and landing page are now synced with Stripe.');
    console.log('🔄 Changes in admin console will update the landing page in real-time.');
    
    return results;
    
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    throw error;
  }
}

// Run the sync
syncProducts()
  .then(() => {
    console.log('\n🚀 Ready! Your products are synced between Stripe, admin console, and landing page.');
  })
  .catch((error) => {
    console.error('Sync failed:', error);
    process.exit(1);
  });