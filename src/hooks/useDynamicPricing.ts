/**
 * Hook for fetching and managing dynamic Stripe pricing
 */

import { useState, useEffect } from 'react';
import { dynamicPricingService, DynamicPricingPlan } from '@/services/stripe/DynamicPricingService';
import { toast } from '@/utils/toast';

interface UseDynamicPricingReturn {
  plans: DynamicPricingPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<void>;
  clearDiscount: () => void;
  appliedDiscount: string | null;
}

export function useDynamicPricing(): UseDynamicPricingReturn {
  const [plans, setPlans] = useState<DynamicPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedPlans = await dynamicPricingService.fetchLivePricing();
      setPlans(fetchedPlans);
      
      // Check if there's a discount code in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const discountCode = urlParams.get('discount') || urlParams.get('promo');
      
      if (discountCode && !appliedDiscount) {
        await applyDiscountCode(discountCode);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      setError('Failed to load pricing. Using default pricing.');
      
      // Use static fallback pricing when Stripe fails
      const defaultPlans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month' as const,
          stripePriceId: '',
          stripeProductId: '',
          features: ['Full feature access (demo mode)', 'Mock data and workflows', 'Community support'],
          active: true
        },
        {
          id: 'team',
          name: 'Team',
          price: 499,
          interval: 'month' as const,
          stripePriceId: '',
          stripeProductId: '',
          features: ['All core features', 'Multi-framework support', 'Team collaboration', 'Email support'],
          active: true
        },
        {
          id: 'business',
          name: 'Business',
          price: 699,
          interval: 'month' as const,
          stripePriceId: '',
          stripeProductId: '',
          features: ['Everything in Team', 'Custom templates', 'API integrations', 'Priority support'],
          active: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 999,
          interval: 'month' as const,
          stripePriceId: '',
          stripeProductId: '',
          features: ['Everything in Business', 'White-label solution', 'Dedicated support', '24/7 phone support'],
          active: true
        }
      ];
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const applyDiscountCode = async (code: string) => {
    try {
      const discountedPlans = await dynamicPricingService.applyDiscountCode(code, plans);
      setPlans(discountedPlans);
      setAppliedDiscount(code);
      toast.success(`Discount code "${code}" applied successfully!`);
    } catch (err) {
      console.error('Failed to apply discount code:', err);
      toast.error('Invalid or expired discount code');
      throw err;
    }
  };

  const clearDiscount = () => {
    setAppliedDiscount(null);
    fetchPricing(); // Refetch original pricing
  };

  useEffect(() => {
    fetchPricing();

    // Set up a timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (plans.length === 0) {
          // Set fallback plans if we don't have any
          setPlans([
            { id: 'free', name: 'Free', price: 0, interval: 'month', stripePriceId: '', stripeProductId: '', features: ['Basic features'], active: true },
            { id: 'team', name: 'Team', price: 499, interval: 'month', stripePriceId: '', stripeProductId: '', features: ['All core features'], active: true },
            { id: 'business', name: 'Business', price: 699, interval: 'month', stripePriceId: '', stripeProductId: '', features: ['Everything in Team'], active: true },
            { id: 'enterprise', name: 'Enterprise', price: 999, interval: 'month', stripePriceId: '', stripeProductId: '', features: ['Everything in Business'], active: true }
          ]);
        }
      }
    }, 10000); // 10 second timeout

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchPricing();
    }, 5 * 60 * 1000);

    // Listen for storage events (when pricing is updated in admin)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'stripe_pricing_updated') {
        dynamicPricingService.clearCache();
        fetchPricing();
      }
    };

    // Also listen for custom events (same-window updates)
    const handlePricingUpdate = () => {
      dynamicPricingService.clearCache();
      fetchPricing();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('stripe_pricing_updated', handlePricingUpdate);

    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('stripe_pricing_updated', handlePricingUpdate);
    };
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPricing,
    applyDiscountCode,
    clearDiscount,
    appliedDiscount
  };
}