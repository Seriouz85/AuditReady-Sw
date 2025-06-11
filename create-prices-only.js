/**
 * Create prices for existing Stripe products
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RXKwbBDPoJ4xbIHIzeSLnkgKI6HYUZ8LyRUqRqyqVTBJqfGHq99mWnya5YHNinElMMTksFhLsOy3IEoQsocqYxK00mKpv3Du7';

// Product IDs from the previous creation
const PRODUCTS = [
  { id: 'prod_STTN6PCnsKU59z', name: 'Team', price: 49900, tier: 'team' },
  { id: 'prod_STTNuxlgcQEoUS', name: 'Business', price: 69900, tier: 'business' },
  { id: 'prod_STTNWchHUxNIri', name: 'Enterprise', price: 99900, tier: 'enterprise' }
];

async function createPricesForProduct(product) {
  console.log(`Creating prices for ${product.name}...`);

  // Create monthly price
  const priceFormData = new URLSearchParams();
  priceFormData.append('product', product.id);
  priceFormData.append('currency', 'eur');
  priceFormData.append('unit_amount', product.price.toString());
  priceFormData.append('recurring[interval]', 'month');
  priceFormData.append('active', 'true');
  priceFormData.append('metadata[tier]', product.tier);
  priceFormData.append('metadata[display_name]', `${product.name} Monthly`);

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
    throw new Error(`Failed to create monthly price: ${error}`);
  }

  const monthlyPrice = await priceResponse.json();
  console.log(`✅ Monthly price created: ${monthlyPrice.id} (€${product.price / 100})`);

  // Create annual price with 20% discount
  const annualAmount = Math.round(product.price * 12 * 0.8);
  const annualPriceFormData = new URLSearchParams();
  annualPriceFormData.append('product', product.id);
  annualPriceFormData.append('currency', 'eur');
  annualPriceFormData.append('unit_amount', annualAmount.toString());
  annualPriceFormData.append('recurring[interval]', 'year');
  annualPriceFormData.append('active', 'true');
  annualPriceFormData.append('metadata[tier]', product.tier);
  annualPriceFormData.append('metadata[display_name]', `${product.name} Annual`);
  annualPriceFormData.append('metadata[discount_percentage]', '20');

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
  console.log(`✅ Annual price created: ${annualPrice.id} (€${annualAmount / 100} - 20% off)`);

  return { monthlyPrice, annualPrice };
}

async function createAllPrices() {
  console.log('💰 Creating prices for existing products...\n');

  const results = [];

  for (const product of PRODUCTS) {
    try {
      const prices = await createPricesForProduct(product);
      results.push({ product, ...prices });
      console.log(`✨ ${product.name} pricing complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to create prices for ${product.name}:`, error.message);
    }
  }

  console.log('🎉 Price creation complete!\n');
  console.log('📋 Summary:');
  
  results.forEach(({ product, monthlyPrice, annualPrice }) => {
    console.log(`\n${product.name}:`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`  Annual Price ID: ${annualPrice.id}`);
    console.log(`  Landing Page Tier: ${product.tier}`);
  });

  console.log('\n✅ All prices created successfully!');
  console.log('🔄 Your landing page will now show these prices automatically.');
}

createAllPrices().catch(console.error);