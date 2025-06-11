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
      
      // Use fallback pricing
      const defaultPlans = await dynamicPricingService.fetchLivePricing();
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

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
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