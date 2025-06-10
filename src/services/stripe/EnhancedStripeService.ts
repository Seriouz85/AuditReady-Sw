/**
 * Enhanced Stripe Service for Real-time Product & Pricing Management
 * Provides comprehensive tools for managing Stripe products, prices, and coupons
 */

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata: Record<string, string>;
  created: number;
  updated: number;
  images: string[];
  url?: string;
}

export interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
  };
  lookup_key?: string;
  metadata: Record<string, string>;
  created: number;
}

export interface StripeCoupon {
  id: string;
  name?: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: 'forever' | 'once' | 'repeating';
  duration_in_months?: number;
  max_redemptions?: number;
  times_redeemed: number;
  valid: boolean;
  created: number;
  redeem_by?: number;
  metadata: Record<string, string>;
}

export interface StripePromotionCode {
  id: string;
  code: string;
  coupon: StripeCoupon;
  active: boolean;
  expires_at?: number;
  max_redemptions?: number;
  times_redeemed: number;
  restrictions?: {
    minimum_amount?: number;
    minimum_amount_currency?: string;
  };
  metadata: Record<string, string>;
  created: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
  url?: string;
  active?: boolean;
}

export interface CreatePriceRequest {
  product: string;
  currency: string;
  unit_amount: number;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
  };
  lookup_key?: string;
  metadata?: Record<string, string>;
  active?: boolean;
}

export interface CreateCouponRequest {
  id?: string;
  name?: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: 'forever' | 'once' | 'repeating';
  duration_in_months?: number;
  max_redemptions?: number;
  redeem_by?: number;
  metadata?: Record<string, string>;
}

export interface CreatePromotionCodeRequest {
  coupon: string;
  code?: string;
  active?: boolean;
  expires_at?: number;
  max_redemptions?: number;
  restrictions?: {
    minimum_amount?: number;
    minimum_amount_currency?: string;
  };
  metadata?: Record<string, string>;
}

export class EnhancedStripeService {
  private secretKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor() {
    // Try multiple possible env var names
    this.secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || 
                     import.meta.env.STRIPE_SECRET_KEY || 
                     'sk_test_51RXKwbBDPoJ4xbIHIzeSLnkgKI6HYUZ8LyRUqRqyqVTBJqfGHq99mWnya5YHNinElMMTksFhLsOy3IEoQsocqYxK00mKpv3Du7';
    if (!this.secretKey) {
      throw new Error('Stripe secret key is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
    data?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = new URLSearchParams(this.flattenObject(data)).toString();
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}[${key}]` : key;
      
      if (value === null || value === undefined) {
        return;
      }
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            Object.assign(flattened, this.flattenObject(item, `${newKey}[${index}]`));
          } else {
            flattened[`${newKey}[${index}]`] = String(item);
          }
        });
      } else {
        flattened[newKey] = String(value);
      }
    });
    
    return flattened;
  }

  // ===== PRODUCT MANAGEMENT =====

  async listProducts(active?: boolean, limit = 100): Promise<{ data: StripeProduct[]; has_more: boolean }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (active !== undefined) {
      params.append('active', active.toString());
    }
    
    return this.makeRequest(`/products?${params.toString()}`);
  }

  async getProduct(productId: string): Promise<StripeProduct> {
    return this.makeRequest(`/products/${productId}`);
  }

  async createProduct(productData: CreateProductRequest): Promise<StripeProduct> {
    return this.makeRequest('/products', 'POST', productData);
  }

  async updateProduct(productId: string, updates: Partial<CreateProductRequest>): Promise<StripeProduct> {
    return this.makeRequest(`/products/${productId}`, 'POST', updates);
  }

  async deleteProduct(productId: string): Promise<{ id: string; deleted: boolean }> {
    return this.makeRequest(`/products/${productId}`, 'DELETE');
  }

  // ===== PRICE MANAGEMENT =====

  async listPrices(product?: string, active?: boolean, limit = 100): Promise<{ data: StripePrice[]; has_more: boolean }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (product) params.append('product', product);
    if (active !== undefined) params.append('active', active.toString());
    
    return this.makeRequest(`/prices?${params.toString()}`);
  }

  async getPrice(priceId: string): Promise<StripePrice> {
    return this.makeRequest(`/prices/${priceId}`);
  }

  async createPrice(priceData: CreatePriceRequest): Promise<StripePrice> {
    return this.makeRequest('/prices', 'POST', priceData);
  }

  async updatePrice(priceId: string, updates: { active?: boolean; metadata?: Record<string, string> }): Promise<StripePrice> {
    return this.makeRequest(`/prices/${priceId}`, 'POST', updates);
  }

  // ===== COUPON MANAGEMENT =====

  async listCoupons(limit = 100): Promise<{ data: StripeCoupon[]; has_more: boolean }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.makeRequest(`/coupons?${params.toString()}`);
  }

  async getCoupon(couponId: string): Promise<StripeCoupon> {
    return this.makeRequest(`/coupons/${couponId}`);
  }

  async createCoupon(couponData: CreateCouponRequest): Promise<StripeCoupon> {
    return this.makeRequest('/coupons', 'POST', couponData);
  }

  async updateCoupon(couponId: string, updates: { name?: string; metadata?: Record<string, string> }): Promise<StripeCoupon> {
    return this.makeRequest(`/coupons/${couponId}`, 'POST', updates);
  }

  async deleteCoupon(couponId: string): Promise<{ id: string; deleted: boolean }> {
    return this.makeRequest(`/coupons/${couponId}`, 'DELETE');
  }

  // ===== PROMOTION CODE MANAGEMENT =====

  async listPromotionCodes(coupon?: string, active?: boolean, limit = 100): Promise<{ data: StripePromotionCode[]; has_more: boolean }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (coupon) params.append('coupon', coupon);
    if (active !== undefined) params.append('active', active.toString());
    
    return this.makeRequest(`/promotion_codes?${params.toString()}`);
  }

  async getPromotionCode(promoCodeId: string): Promise<StripePromotionCode> {
    return this.makeRequest(`/promotion_codes/${promoCodeId}`);
  }

  async createPromotionCode(promoData: CreatePromotionCodeRequest): Promise<StripePromotionCode> {
    return this.makeRequest('/promotion_codes', 'POST', promoData);
  }

  async updatePromotionCode(promoCodeId: string, updates: { active?: boolean; metadata?: Record<string, string> }): Promise<StripePromotionCode> {
    return this.makeRequest(`/promotion_codes/${promoCodeId}`, 'POST', updates);
  }

  // ===== ADVANCED OPERATIONS =====

  async duplicatePrice(priceId: string, newAmount?: number): Promise<StripePrice> {
    const originalPrice = await this.getPrice(priceId);
    
    const newPriceData: CreatePriceRequest = {
      product: originalPrice.product,
      currency: originalPrice.currency,
      unit_amount: newAmount || originalPrice.unit_amount,
      recurring: originalPrice.recurring,
      metadata: { ...originalPrice.metadata, duplicated_from: priceId },
    };

    return this.createPrice(newPriceData);
  }

  async bulkUpdatePrices(priceIds: string[], updates: { active?: boolean }): Promise<StripePrice[]> {
    const updatePromises = priceIds.map(id => this.updatePrice(id, updates));
    return Promise.all(updatePromises);
  }

  async createPercentageDiscount(
    productId: string,
    percentOff: number,
    duration: 'forever' | 'once' | 'repeating' = 'once',
    code?: string
  ): Promise<{ coupon: StripeCoupon; promotionCode?: StripePromotionCode }> {
    const coupon = await this.createCoupon({
      percent_off: percentOff,
      duration,
      metadata: { product_id: productId },
    });

    if (code) {
      const promotionCode = await this.createPromotionCode({
        coupon: coupon.id,
        code,
      });
      return { coupon, promotionCode };
    }

    return { coupon };
  }

  async createAmountDiscount(
    productId: string,
    amountOff: number,
    currency: string,
    duration: 'forever' | 'once' | 'repeating' = 'once',
    code?: string
  ): Promise<{ coupon: StripeCoupon; promotionCode?: StripePromotionCode }> {
    const coupon = await this.createCoupon({
      amount_off: amountOff,
      currency,
      duration,
      metadata: { product_id: productId },
    });

    if (code) {
      const promotionCode = await this.createPromotionCode({
        coupon: coupon.id,
        code,
      });
      return { coupon, promotionCode };
    }

    return { coupon };
  }

  // ===== ANALYTICS & INSIGHTS =====

  async getProductAnalytics(productId: string): Promise<{
    product: StripeProduct;
    prices: StripePrice[];
    activePrices: number;
    totalPrices: number;
  }> {
    const [product, pricesResponse] = await Promise.all([
      this.getProduct(productId),
      this.listPrices(productId),
    ]);

    const activePrices = pricesResponse.data.filter(p => p.active).length;

    return {
      product,
      prices: pricesResponse.data,
      activePrices,
      totalPrices: pricesResponse.data.length,
    };
  }

  async getCouponUsageStats(): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    mostUsedCoupons: Array<{ coupon: StripeCoupon; redemptions: number }>;
  }> {
    const couponsResponse = await this.listCoupons();
    const coupons = couponsResponse.data;

    const activeCoupons = coupons.filter(c => c.valid).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.times_redeemed, 0);
    
    const mostUsedCoupons = coupons
      .filter(c => c.times_redeemed > 0)
      .sort((a, b) => b.times_redeemed - a.times_redeemed)
      .slice(0, 10)
      .map(coupon => ({ coupon, redemptions: coupon.times_redeemed }));

    return {
      totalCoupons: coupons.length,
      activeCoupons,
      totalRedemptions,
      mostUsedCoupons,
    };
  }
}

export const enhancedStripeService = new EnhancedStripeService();