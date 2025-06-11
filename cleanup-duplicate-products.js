/**
 * Clean up duplicate Stripe products by deactivating the older ones
 */

const STRIPE_SECRET_KEY = 'sk_test_51RXKwbBDPoJ4xbIHIzeSLnkgKI6HYUZ8LyRUqRqyqVTBJqfGHq99mWnya5YHNinElMMTksFhLsOy3IEoQsocqYxK00mKpv3Du7';

// Keep the newer products (the ones we just created with better naming)
const PRODUCTS_TO_KEEP = [
  'prod_STTN6PCnsKU59z', // Team
  'prod_STTNuxlgcQEoUS', // Business  
  'prod_STTNWchHUxNIri'  // Enterprise
];

// Deactivate the older duplicate products
const PRODUCTS_TO_DEACTIVATE = [
  'prod_SSFje56jEZVKWd', // Old AuditReady Team
  'prod_SSFjvpZ8VojfbX', // Old AuditReady Business
  'prod_SSFjEKVTVVW6oE'  // Old AuditReady Enterprise
];

async function deactivateProduct(productId) {
  const formData = new URLSearchParams();
  formData.append('active', 'false');

  const response = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to deactivate product: ${error}`);
  }

  return await response.json();
}

async function cleanupProducts() {
  console.log('🧹 Cleaning up duplicate Stripe products...\n');

  for (const productId of PRODUCTS_TO_DEACTIVATE) {
    try {
      console.log(`Deactivating ${productId}...`);
      await deactivateProduct(productId);
      console.log(`✅ Deactivated ${productId}`);
    } catch (error) {
      console.error(`❌ Failed to deactivate ${productId}:`, error.message);
    }
  }

  console.log('\n🎉 Cleanup complete!');
  console.log('✅ Only the latest products will now appear in your admin console:');
  console.log('  - Team (prod_STTN6PCnsKU59z)');
  console.log('  - Business (prod_STTNuxlgcQEoUS)');  
  console.log('  - Enterprise (prod_STTNWchHUxNIri)');
}

cleanupProducts().catch(console.error);