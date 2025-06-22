/**
 * Dynamic Pricing Service - Fetches real-time pricing from Stripe
 * Updates landing page pricing based on admin console changes
 */

import { stripeAdminService } from './StripeAdminService';

export interface DynamicPricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'one_time';
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  metadata?: Record<string, string>;
  active: boolean;
  discountedPrice?: number;
  couponCode?: string;
}

export class DynamicPricingService {
  private static cache: {
    plans: DynamicPricingPlan[];
    lastFetched: number;
  } | null = null;
  
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Map product names to tier IDs
  private static TIER_MAPPING: Record<string, string> = {
    'Team': 'team',
    'Team Plan': 'team',
    'Business': 'business', 
    'Business Plan': 'business',
    'Enterprise': 'enterprise',
    'Enterprise Plan': 'enterprise',
    'Professional': 'team', // alias
    'Pro': 'team', // alias
  };

  static async fetchLivePricing(): Promise<DynamicPricingPlan[]> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.lastFetched < this.CACHE_DURATION) {
      console.log('🎯 Using cached pricing data');
      return this.cache.plans;
    }

    try {
      console.log('🔄 Fetching live pricing from Stripe...');
      
      // Fetch all active products and prices from Stripe
      const [products, prices] = await Promise.all([
        stripeAdminService.listProducts(),
        stripeAdminService.listPrices()
      ]);

      console.log(`📦 Found ${products.length} products and ${prices.length} prices`);

      // Build pricing plans
      const plans: DynamicPricingPlan[] = [];

      // Always include free tier (not in Stripe)
      plans.push({
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        stripePriceId: '',
        stripeProductId: '',
        features: [
          'Full feature access (demo mode)',
          'Mock data and workflows',
          'Basic compliance templates',
          'Standard reporting',
          'Community support'
        ],
        active: true
      });

      // Process Stripe products
      for (const product of products) {
        // Find all prices for this product
        const productPrices = prices.filter(p => p.product === product.id && p.active);
        
        if (productPrices.length === 0) continue;

        // Get the main price (monthly preferred)
        const monthlyPrice = productPrices.find(p => p.recurring?.interval === 'month');
        const mainPrice = monthlyPrice || productPrices[0];

        // Determine tier ID from product name or metadata
        const tierName = product.name;
        const tierId = this.TIER_MAPPING[tierName] || 
                      product.metadata.tier || 
                      tierName.toLowerCase().replace(/\s+/g, '_');

        console.log(`🏷️  Mapping product "${product.name}" to tier "${tierId}" (price: €${mainPrice.unit_amount / 100})`);

        // Extract features from product metadata or description
        const features = this.extractFeatures(product);

        // Clean up product name - remove "Plan" suffix
        const cleanName = product.name.replace(/\s+Plan$/i, '').trim();
        
        plans.push({
          id: tierId,
          name: cleanName,
          price: mainPrice.unit_amount / 100, // Convert from cents
          interval: mainPrice.recurring?.interval || 'one_time',
          stripePriceId: mainPrice.id,
          stripeProductId: product.id,
          features,
          metadata: product.metadata,
          active: product.active
        });
      }

      // Sort plans by price
      plans.sort((a, b) => a.price - b.price);

      // Cache the results
      this.cache = {
        plans,
        lastFetched: Date.now()
      };

      console.log(`✅ Successfully cached ${plans.length} pricing plans for landing page sync`);
      return plans;
    } catch (error) {
      console.error('Failed to fetch live pricing:', error);
      
      // Fallback to default pricing if Stripe fails
      return this.getDefaultPricing();
    }
  }

  static async applyDiscountCode(code: string, plans: DynamicPricingPlan[]): Promise<DynamicPricingPlan[]> {
    try {
      // First try to get real promotion codes from Stripe
      try {
        const promotionCodes = await stripeAdminService.listPromotionCodes();
        const promoCode = promotionCodes.find(pc => pc.code.toUpperCase() === code.toUpperCase() && pc.active);
        
        if (promoCode) {
          const coupon = promoCode.coupon;
          
          // Apply real Stripe coupon discount
          return plans.map(plan => {
            if (plan.price === 0) return plan; // Don't discount free tier

            let discountedPrice = plan.price;
            
            if (coupon.percent_off) {
              discountedPrice = plan.price * (1 - coupon.percent_off / 100);
            } else if (coupon.amount_off && plan.interval !== 'one_time') {
              // Convert amount_off from cents to euros and apply
              discountedPrice = Math.max(0, plan.price - (coupon.amount_off / 100));
            }

            return {
              ...plan,
              discountedPrice,
              couponCode: code
            };
          });
        }
      } catch (error) {
        console.warn('Could not fetch real promotion codes, using fallback:', error);
      }
      
      // Fallback to demo discount codes if real ones aren't available
      const discounts: Record<string, { percent: number; name: string }> = {
        'LAUNCH20': { percent: 20, name: 'Launch Special' },
        'EARLY30': { percent: 30, name: 'Early Bird' },
        'SAVE10': { percent: 10, name: 'Save 10%' }
      };
      
      const discount = discounts[code.toUpperCase()];
      if (!discount) {
        throw new Error('Invalid or expired discount code');
      }

      // Apply discount to applicable plans
      return plans.map(plan => {
        if (plan.price === 0) return plan; // Don't discount free tier

        const discountedPrice = plan.price * (1 - discount.percent / 100);

        return {
          ...plan,
          discountedPrice,
          couponCode: code
        };
      });
    } catch (error) {
      console.error('Failed to apply discount code:', error);
      throw error;
    }
  }

  private static extractFeatures(product: any): string[] {
    // Try to extract features from metadata
    if (product.metadata.features) {
      try {
        return JSON.parse(product.metadata.features);
      } catch {
        // Ignore JSON parse errors and fall through to description parsing
      }
    }

    // Parse features from description
    if (product.description) {
      const features = product.description
        .split('\n')
        .filter((line: string) => line.trim().startsWith('✓') || line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^[✓\-\s]+/, '').trim())
        .filter((feature: string) => feature.length > 0);
      
      if (features.length > 0) return features;
    }

    // Default features based on tier
    const tierFeatures: Record<string, string[]> = {
      team: [
        'All core features',
        'Multi-framework support',
        'Advanced reporting & analytics',
        'Team collaboration tools',
        'Email support',
        'Up to 5 compliance frameworks'
      ],
      business: [
        'Everything in Team',
        'Custom audit templates',
        'API integrations',
        'Priority support',
        'Advanced security features',
        'Unlimited frameworks',
        'Custom workflows'
      ],
      enterprise: [
        'Everything in Business',
        'White-label solution',
        'Dedicated support manager',
        'Single Sign-On (SSO)',
        'Custom development',
        'SLA guarantees',
        'On-premise deployment',
        '24/7 phone support'
      ]
    };

    const tierId = product.metadata.tier || product.name.toLowerCase();
    return tierFeatures[tierId] || ['Contact us for details'];
  }

  private static getDefaultPricing(): DynamicPricingPlan[] {
    // Fallback pricing if Stripe is unavailable
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        stripePriceId: '',
        stripeProductId: '',
        features: [
          'Full feature access (demo mode)',
          'Mock data and workflows',
          'Basic compliance templates',
          'Standard reporting',
          'Community support'
        ],
        active: true
      },
      {
        id: 'team',
        name: 'Team',
        price: 499,
        interval: 'month',
        stripePriceId: import.meta.env.VITE_STRIPE_TEAM_PRICE_ID || '',
        stripeProductId: import.meta.env.VITE_STRIPE_TEAM_PRODUCT_ID || '',
        features: [
          'All core features',
          'Multi-framework support',
          'Advanced reporting & analytics',
          'Team collaboration tools',
          'Email support',
          'Up to 5 compliance frameworks'
        ],
        active: true
      },
      {
        id: 'business',
        name: 'Business',
        price: 699,
        interval: 'month',
        stripePriceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '',
        stripeProductId: import.meta.env.VITE_STRIPE_BUSINESS_PRODUCT_ID || '',
        features: [
          'Everything in Team',
          'Custom audit templates',
          'API integrations',
          'Priority support',
          'Advanced security features',
          'Unlimited frameworks',
          'Custom workflows'
        ],
        active: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 999,
        interval: 'month',
        stripePriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || '',
        stripeProductId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRODUCT_ID || '',
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
        active: true
      }
    ];
  }

  // Clear cache to force refresh
  static clearCache(): void {
    this.cache = null;
  }
}

export const dynamicPricingService = DynamicPricingService;