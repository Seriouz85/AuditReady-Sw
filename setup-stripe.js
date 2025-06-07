#!/usr/bin/env node

// Stripe Setup Script for AuditReady
// This script creates products and prices in your Stripe account

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

const PRODUCTS_AND_PRICES = [
  {
    envVar: 'VITE_STRIPE_TEAM_PRICE_ID',
    product: {
      name: 'AuditReady Team',
      description: 'Perfect for small to medium teams (1-50 employees)',
      metadata: {
        tier: 'team',
        employees: '1-50',
        features: 'Multi-framework support, Team collaboration, Email support'
      }
    },
    price: {
      unit_amount: 49900, // €499.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'team'
      }
    }
  },
  {
    envVar: 'VITE_STRIPE_BUSINESS_PRICE_ID',
    product: {
      name: 'AuditReady Business',
      description: 'Advanced features for growing businesses (50-1000 employees)',
      metadata: {
        tier: 'business',
        employees: '50-1000',
        features: 'Custom templates, API integrations, Priority support'
      }
    },
    price: {
      unit_amount: 69900, // €699.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'business'
      }
    }
  },
  {
    envVar: 'VITE_STRIPE_ENTERPRISE_PRICE_ID',
    product: {
      name: 'AuditReady Enterprise',
      description: 'Complete solution for large organizations (1000+ employees)',
      metadata: {
        tier: 'enterprise',
        employees: '1000+',
        features: 'White-label, Dedicated support, SSO, Custom development'
      }
    },
    price: {
      unit_amount: 99900, // €999.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'enterprise'
      }
    }
  }
];

async function createProductsAndPrices() {
  console.log('🚀 Setting up AuditReady Stripe products and prices...\n');

  const envUpdates = [];

  for (const config of PRODUCTS_AND_PRICES) {
    try {
      console.log(`Creating product: ${config.product.name}`);
      
      // Create product
      const product = await stripe.products.create(config.product);
      console.log(`✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        ...config.price,
        product: product.id
      });
      console.log(`✅ Price created: ${price.id} (€${price.unit_amount / 100}/month)`);

      envUpdates.push({
        envVar: config.envVar,
        priceId: price.id
      });

      console.log('');
    } catch (error) {
      console.error(`❌ Error creating ${config.product.name}:`, error.message);
      if (error.type === 'StripeAuthenticationError') {
        console.error('Please check your Stripe secret key is correct and has the right permissions.');
        process.exit(1);
      }
    }
  }

  // Update .env file
  if (envUpdates.length > 0) {
    updateEnvFile(envUpdates);
  }

  console.log('🎉 Stripe setup complete!');
  console.log('\nNext steps:');
  console.log('1. Set up webhooks in Stripe Dashboard');
  console.log('2. Add webhook secret to STRIPE_WEBHOOK_SECRET in .env');
  console.log('3. Test the payment flow on your landing page');
}

function updateEnvFile(updates) {
  const envPath = path.join(process.cwd(), '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    updates.forEach(({ envVar, priceId }) => {
      const regex = new RegExp(`^${envVar}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${envVar}=${priceId}`);
        console.log(`✅ Updated ${envVar}=${priceId}`);
      } else {
        envContent += `\n${envVar}=${priceId}`;
        console.log(`✅ Added ${envVar}=${priceId}`);
      }
    });

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated with Price IDs\n');
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    console.log('\nManually add these to your .env file:');
    updates.forEach(({ envVar, priceId }) => {
      console.log(`${envVar}=${priceId}`);
    });
  }
}

// Check if Stripe key is available
if (!process.env.VITE_STRIPE_SECRET_KEY) {
  console.error('❌ VITE_STRIPE_SECRET_KEY not found in environment variables');
  console.error('Please make sure your .env file contains your Stripe secret key');
  process.exit(1);
}

// Run the setup
createProductsAndPrices().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});