#!/usr/bin/env node

/**
 * Script to create real Stripe products with correct pricing (€499, €699, €999)
 * Run this script to replace mock data with real Stripe products
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createStripeProducts() {
  console.log('🚀 Setting up real Stripe products...');

  try {
    // Create Team Plan product
    console.log('Creating Team Plan product...');
    const { data: teamProduct, error: teamError } = await supabase.functions.invoke('stripe-admin', {
      body: {
        action: 'create_product',
        productData: {
          name: 'Team Plan',
          description: 'Perfect for small teams getting started with compliance',
          metadata: { tier: 'team' },
          active: true
        }
      }
    });

    if (teamError) {
      console.error('Error creating Team Plan:', teamError);
    } else {
      console.log('✅ Team Plan created:', teamProduct.product.id);

      // Create price for Team Plan (€499)
      const { data: teamPrice, error: teamPriceError } = await supabase.functions.invoke('stripe-admin', {
        body: {
          action: 'create_price',
          priceData: {
            product: teamProduct.product.id,
            currency: 'eur',
            unit_amount: 49900, // €499
            recurring: { interval: 'month' },
            metadata: { tier: 'team' },
            active: true
          }
        }
      });

      if (teamPriceError) {
        console.error('Error creating Team Plan price:', teamPriceError);
      } else {
        console.log('✅ Team Plan price created: €499/month');
      }
    }

    // Create Business Plan product
    console.log('Creating Business Plan product...');
    const { data: businessProduct, error: businessError } = await supabase.functions.invoke('stripe-admin', {
      body: {
        action: 'create_product',
        productData: {
          name: 'Business Plan',
          description: 'Advanced features for growing businesses',
          metadata: { tier: 'business' },
          active: true
        }
      }
    });

    if (businessError) {
      console.error('Error creating Business Plan:', businessError);
    } else {
      console.log('✅ Business Plan created:', businessProduct.product.id);

      // Create price for Business Plan (€699)
      const { data: businessPrice, error: businessPriceError } = await supabase.functions.invoke('stripe-admin', {
        body: {
          action: 'create_price',
          priceData: {
            product: businessProduct.product.id,
            currency: 'eur',
            unit_amount: 69900, // €699
            recurring: { interval: 'month' },
            metadata: { tier: 'business' },
            active: true
          }
        }
      });

      if (businessPriceError) {
        console.error('Error creating Business Plan price:', businessPriceError);
      } else {
        console.log('✅ Business Plan price created: €699/month');
      }
    }

    // Create Enterprise Plan product
    console.log('Creating Enterprise Plan product...');
    const { data: enterpriseProduct, error: enterpriseError } = await supabase.functions.invoke('stripe-admin', {
      body: {
        action: 'create_product',
        productData: {
          name: 'Enterprise Plan',
          description: 'Full-featured solution for large organizations',
          metadata: { tier: 'enterprise' },
          active: true
        }
      }
    });

    if (enterpriseError) {
      console.error('Error creating Enterprise Plan:', enterpriseError);
    } else {
      console.log('✅ Enterprise Plan created:', enterpriseProduct.product.id);

      // Create price for Enterprise Plan (€999)
      const { data: enterprisePrice, error: enterprisePriceError } = await supabase.functions.invoke('stripe-admin', {
        body: {
          action: 'create_price',
          priceData: {
            product: enterpriseProduct.product.id,
            currency: 'eur',
            unit_amount: 99900, // €999
            recurring: { interval: 'month' },
            metadata: { tier: 'enterprise' },
            active: true
          }
        }
      });

      if (enterprisePriceError) {
        console.error('Error creating Enterprise Plan price:', enterprisePriceError);
      } else {
        console.log('✅ Enterprise Plan price created: €999/month');
      }
    }

    console.log('🎉 Real Stripe products setup complete!');
    console.log('Your platform admin console will now show real products instead of mock data.');
    console.log('These products will sync to your landing page with the correct pricing.');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Check that your STRIPE_SECRET_KEY is set in Supabase Edge Function secrets');
    console.log('2. Verify that the stripe-admin Edge Function is deployed');
    console.log('3. Ensure your Supabase environment variables are correct');
    console.log('');
    console.log('ℹ️  If Stripe is not configured, the platform will continue to use mock data');
    console.log('   which still provides full functionality for demo purposes.');
  }
}

async function listCurrentProducts() {
  console.log('📋 Listing current Stripe products...');
  
  try {
    const { data, error } = await supabase.functions.invoke('stripe-admin', {
      body: { action: 'list_products' }
    });

    if (error) {
      console.log('⚠️  Using mock products (Stripe not configured)');
      return;
    }

    if (data.products && data.products.length > 0) {
      console.log('✅ Real Stripe products found:');
      data.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.id})`);
      });
    } else {
      console.log('ℹ️  No real products found, will use mock data');
    }
  } catch (error) {
    console.log('⚠️  Using mock products (Stripe not available)');
  }
}

// Main execution
async function main() {
  console.log('🔧 AuditReady Stripe Products Setup');
  console.log('====================================');
  
  await listCurrentProducts();
  console.log('');
  
  const args = process.argv.slice(2);
  if (args.includes('--create')) {
    await createStripeProducts();
  } else {
    console.log('💡 To create real Stripe products with correct pricing, run:');
    console.log('   node setup-real-stripe-products.js --create');
    console.log('');
    console.log('⚠️  Make sure you have:');
    console.log('   1. STRIPE_SECRET_KEY configured in Supabase Edge Function secrets');
    console.log('   2. stripe-admin Edge Function deployed');
    console.log('   3. Proper environment variables set');
  }
}

main().catch(console.error);