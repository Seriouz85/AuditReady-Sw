/**
 * Create Stripe products directly for landing page sync
 */

// Get Stripe secret key from environment or use the test key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RXKwbBDPoJ4xbIHIzeSLnkgKI6HYUZ8LyRUqRqyqVTBJqfGHq99mWnya5YHNinElMMTksFhLsOy3IEoQsocqYxK00mKpv3Du7';

const PRODUCTS_TO_CREATE = [
  {
    name: 'Team',
    description: 'Perfect for small teams getting started with compliance management. Includes multi-framework support, team collaboration tools, and email support.',
    price: 49900, // €499 in cents
    metadata: {
      tier: 'team',
      employee_range: '1-50',
      popular: 'true'
    },
    features: [
      'All core features',
      'Multi-framework support', 
      'Advanced reporting & analytics',
      'Team collaboration tools',
      'Email support',
      'Up to 5 compliance frameworks'
    ]
  },
  {
    name: 'Business',
    description: 'Designed for growing businesses that need advanced compliance capabilities. Includes custom templates, API integrations, and priority support.',
    price: 69900, // €699 in cents
    metadata: {
      tier: 'business',
      employee_range: '50-1000'
    },
    features: [
      'Everything in Team',
      'Custom audit templates',
      'API integrations',
      'Priority support', 
      'Advanced security features',
      'Unlimited frameworks',
      'Custom workflows'
    ]
  },
  {
    name: 'Enterprise',
    description: 'Complete enterprise solution with white-label capabilities, dedicated support, and custom development. Perfect for large organizations.',
    price: 99900, // €999 in cents
    metadata: {
      tier: 'enterprise',
      employee_range: '1000+'
    },
    features: [
      'Everything in Business',
      'White-label solution',
      'Dedicated support manager',
      'Single Sign-On (SSO)',
      'Custom development',
      'SLA guarantees',
      'On-premise deployment',
      '24/7 phone support'
    ]
  }
];

async function createStripeProduct(productData) {
  // Prepare form data for Stripe API
  const formData = new URLSearchParams();
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('active', 'true');
  
  // Add metadata as separate form fields
  Object.entries(productData.metadata).forEach(([key, value]) => {
    formData.append(`metadata[${key}]`, value);
  });
  formData.append('metadata[features]', JSON.stringify(productData.features));

  console.log(`Creating product: ${productData.name}`);
  
  const productResponse = await fetch('https://api.stripe.com/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!productResponse.ok) {
    const error = await productResponse.text();
    throw new Error(`Failed to create product: ${error}`);
  }

  const product = await productResponse.json();
  console.log(`✅ Product created: ${product.id}`);

  // Create monthly price
  const priceFormData = new URLSearchParams();
  priceFormData.append('product', product.id);
  priceFormData.append('currency', 'eur');
  priceFormData.append('unit_amount', productData.price.toString());
  priceFormData.append('recurring[interval]', 'month');
  priceFormData.append('active', 'true');
  priceFormData.append('metadata[tier]', productData.metadata.tier);
  priceFormData.append('metadata[display_name]', `${productData.name} Monthly`);

  console.log(`Creating monthly price for ${productData.name}: €${productData.price / 100}`);

  const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: priceFormData
  });

  if (!priceResponse.ok) {
    const error = await priceResponse.text();
    throw new Error(`Failed to create price: ${error}`);
  }

  const price = await priceResponse.json();
  console.log(`✅ Monthly price created: ${price.id}`);

  // Create annual price with 20% discount
  const annualAmount = Math.round(productData.price * 12 * 0.8); // 20% off
  const annualPriceFormData = new URLSearchParams();
  annualPriceFormData.append('product', product.id);
  annualPriceFormData.append('currency', 'eur');
  annualPriceFormData.append('unit_amount', annualAmount.toString());
  annualPriceFormData.append('recurring[interval]', 'year');
  annualPriceFormData.append('active', 'true');
  annualPriceFormData.append('metadata[tier]', productData.metadata.tier);
  annualPriceFormData.append('metadata[display_name]', `${productData.name} Annual`);
  annualPriceFormData.append('metadata[discount_percentage]', '20');

  console.log(`Creating annual price for ${productData.name}: €${annualAmount / 100} (20% off)`);

  const annualPriceResponse = await fetch('https://api.stripe.com/v1/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: annualPriceFormData
  });

  if (!annualPriceResponse.ok) {
    const error = await annualPriceResponse.text();
    throw new Error(`Failed to create annual price: ${error}`);
  }

  const annualPrice = await annualPriceResponse.json();
  console.log(`✅ Annual price created: ${annualPrice.id}`);

  return {
    product,
    monthlyPrice: price,
    annualPrice
  };
}

async function createAllProducts() {
  console.log('🚀 Creating Stripe products for landing page sync...\n');

  const results = [];
  
  for (const productData of PRODUCTS_TO_CREATE) {
    try {
      const result = await createStripeProduct(productData);
      results.push(result);
      console.log(`✨ ${productData.name} setup complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${productData.name}:`, error.message);
    }
  }

  console.log('🎉 Product creation complete!\n');
  console.log('📋 Summary:');
  
  results.forEach(({ product, monthlyPrice, annualPrice }) => {
    console.log(`\n${product.name}:`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`  Annual Price ID: ${annualPrice.id}`);
    console.log(`  Landing Page Tier: ${product.metadata.tier}`);
  });

  console.log('\n✅ Products created successfully!');
  console.log('🔄 Your admin console can now manage these products and they will sync to the landing page automatically.');

  return results;
}

// Run the script
createAllProducts().catch(console.error);