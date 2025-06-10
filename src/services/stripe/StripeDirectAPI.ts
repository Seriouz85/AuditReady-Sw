/**
 * Direct Stripe API Implementation for SaaS Admin Console
 * Based on Stripe API documentation and best practices
 */

import { supabase } from '@/lib/supabase';

// Stripe API Configuration
const STRIPE_BASE_URL = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = '2023-10-16';

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

// Get Stripe configuration from environment or Supabase
const getStripeConfig = async (): Promise<StripeConfig> => {
  // Try environment variables first
  if (typeof window === 'undefined') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    };
  }

  // For client-side, get from Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('get-stripe-config');
  if (error || !data) {
    throw new Error('Failed to get Stripe configuration');
  }
  return data;
};

// Stripe API Headers
const getStripeHeaders = async (idempotencyKey?: string) => {
  const config = await getStripeConfig();
  const headers: HeadersInit = {
    'Authorization': `Bearer ${config.secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Stripe-Version': STRIPE_API_VERSION
  };
  
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  
  return headers;
};

// Utility function to make Stripe API calls
const stripeRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' = 'GET', 
  data?: Record<string, any>,
  idempotencyKey?: string
) => {
  const headers = await getStripeHeaders(idempotencyKey);
  const url = `${STRIPE_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = new URLSearchParams(data).toString();
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new StripeAPIError(error.error.message, error.error.code, response.status);
  }

  return response.json();
};

class StripeAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'StripeAPIError';
  }
}

// Customer Management
export class StripeCustomerAPI {
  static async create(data: {
    email: string;
    name?: string;
    phone?: string;
    description?: string;
    metadata?: Record<string, string>;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
    tax_ids?: Array<{
      type: string;
      value: string;
    }>;
  }) {
    return stripeRequest('/customers', 'POST', data);
  }

  static async retrieve(customerId: string) {
    return stripeRequest(`/customers/${customerId}`);
  }

  static async update(customerId: string, data: Record<string, any>) {
    return stripeRequest(`/customers/${customerId}`, 'POST', data);
  }

  static async delete(customerId: string) {
    return stripeRequest(`/customers/${customerId}`, 'DELETE');
  }

  static async list(params?: {
    limit?: number;
    starting_after?: string;
    ending_before?: string;
    email?: string;
    created?: {
      gte?: number;
      lte?: number;
    };
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined) {
                queryParams.append(`${key}[${subKey}]`, subValue.toString());
              }
            });
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/customers${query ? `?${query}` : ''}`);
  }

  static async getPaymentMethods(customerId: string, type?: string) {
    const params = new URLSearchParams({ customer: customerId });
    if (type) params.append('type', type);
    
    return stripeRequest(`/payment_methods?${params.toString()}`);
  }

  static async createPortalSession(customerId: string, returnUrl: string) {
    return stripeRequest('/billing_portal/sessions', 'POST', {
      customer: customerId,
      return_url: returnUrl
    });
  }
}

// Subscription Management
export class StripeSubscriptionAPI {
  static async create(data: {
    customer: string;
    items: Array<{
      price: string;
      quantity?: number;
      metadata?: Record<string, string>;
    }>;
    payment_behavior?: 'default_incomplete' | 'error_if_incomplete' | 'allow_incomplete';
    payment_settings?: {
      save_default_payment_method?: 'on_subscription' | 'off';
      payment_method_types?: string[];
    };
    trial_period_days?: number;
    trial_end?: number;
    metadata?: Record<string, string>;
    collection_method?: 'charge_automatically' | 'send_invoice';
    days_until_due?: number;
    proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
  }) {
    // Format items for Stripe API
    const formattedData: Record<string, any> = {
      customer: data.customer,
      ...data
    };

    // Handle array items properly
    data.items.forEach((item, index) => {
      formattedData[`items[${index}][price]`] = item.price;
      if (item.quantity) formattedData[`items[${index}][quantity]`] = item.quantity;
      if (item.metadata) {
        Object.entries(item.metadata).forEach(([key, value]) => {
          formattedData[`items[${index}][metadata][${key}]`] = value;
        });
      }
    });

    // Remove the original items array
    delete formattedData.items;

    return stripeRequest('/subscriptions', 'POST', formattedData);
  }

  static async retrieve(subscriptionId: string, expand?: string[]) {
    const params = new URLSearchParams();
    if (expand) {
      expand.forEach(field => params.append('expand[]', field));
    }
    
    const query = params.toString();
    return stripeRequest(`/subscriptions/${subscriptionId}${query ? `?${query}` : ''}`);
  }

  static async update(subscriptionId: string, data: {
    items?: Array<{
      id?: string;
      price?: string;
      quantity?: number;
      clear_usage?: boolean;
    }>;
    metadata?: Record<string, string>;
    proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
    proration_date?: number;
    trial_end?: number | 'now';
    cancel_at_period_end?: boolean;
    payment_behavior?: 'default_incomplete' | 'error_if_incomplete' | 'allow_incomplete';
  }) {
    const formattedData: Record<string, any> = { ...data };

    // Handle items array
    if (data.items) {
      data.items.forEach((item, index) => {
        if (item.id) formattedData[`items[${index}][id]`] = item.id;
        if (item.price) formattedData[`items[${index}][price]`] = item.price;
        if (item.quantity !== undefined) formattedData[`items[${index}][quantity]`] = item.quantity;
        if (item.clear_usage) formattedData[`items[${index}][clear_usage]`] = item.clear_usage;
      });
      delete formattedData.items;
    }

    return stripeRequest(`/subscriptions/${subscriptionId}`, 'POST', formattedData);
  }

  static async cancel(subscriptionId: string, options?: {
    cancel_at_period_end?: boolean;
    invoice_now?: boolean;
    prorate?: boolean;
  }) {
    if (options?.cancel_at_period_end) {
      return this.update(subscriptionId, { cancel_at_period_end: true });
    } else {
      return stripeRequest(`/subscriptions/${subscriptionId}`, 'DELETE', options);
    }
  }

  static async list(params?: {
    customer?: string;
    status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    price?: string;
    limit?: number;
    starting_after?: string;
    ending_before?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/subscriptions${query ? `?${query}` : ''}`);
  }

  static async pause(subscriptionId: string, pauseCollection: {
    behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
    resumes_at?: number;
  }) {
    return stripeRequest(`/subscriptions/${subscriptionId}`, 'POST', {
      'pause_collection[behavior]': pauseCollection.behavior,
      ...(pauseCollection.resumes_at && { 'pause_collection[resumes_at]': pauseCollection.resumes_at })
    });
  }

  static async resume(subscriptionId: string) {
    return stripeRequest(`/subscriptions/${subscriptionId}`, 'POST', {
      pause_collection: ''
    });
  }
}

// Product and Price Management
export class StripeProductAPI {
  static async create(data: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
    unit_label?: string;
    url?: string;
    images?: string[];
    package_dimensions?: {
      height: number;
      length: number;
      weight: number;
      width: number;
    };
    shippable?: boolean;
    statement_descriptor?: string;
    tax_code?: string;
  }) {
    return stripeRequest('/products', 'POST', data);
  }

  static async retrieve(productId: string) {
    return stripeRequest(`/products/${productId}`);
  }

  static async update(productId: string, data: Record<string, any>) {
    return stripeRequest(`/products/${productId}`, 'POST', data);
  }

  static async list(params?: {
    active?: boolean;
    limit?: number;
    starting_after?: string;
    ending_before?: string;
    ids?: string[];
    shippable?: boolean;
    type?: 'good' | 'service';
    url?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/products${query ? `?${query}` : ''}`);
  }

  static async delete(productId: string) {
    return stripeRequest(`/products/${productId}`, 'DELETE');
  }
}

export class StripePriceAPI {
  static async create(data: {
    product: string;
    unit_amount?: number;
    currency: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number;
      aggregate_usage?: 'last_during_period' | 'last_ever' | 'max' | 'sum';
      usage_type?: 'licensed' | 'metered';
    };
    billing_scheme?: 'per_unit' | 'tiered';
    tiers?: Array<{
      up_to: number | 'inf';
      unit_amount?: number;
      flat_amount?: number;
    }>;
    tiers_mode?: 'graduated' | 'volume';
    metadata?: Record<string, string>;
    nickname?: string;
    lookup_key?: string;
    transfer_lookup_key?: boolean;
    transform_quantity?: {
      divide_by: number;
      round: 'up' | 'down';
    };
  }) {
    const formattedData: Record<string, any> = { ...data };

    // Handle recurring object
    if (data.recurring) {
      Object.entries(data.recurring).forEach(([key, value]) => {
        formattedData[`recurring[${key}]`] = value;
      });
      delete formattedData.recurring;
    }

    // Handle tiers array
    if (data.tiers) {
      data.tiers.forEach((tier, index) => {
        Object.entries(tier).forEach(([key, value]) => {
          formattedData[`tiers[${index}][${key}]`] = value;
        });
      });
      delete formattedData.tiers;
    }

    // Handle transform_quantity object
    if (data.transform_quantity) {
      Object.entries(data.transform_quantity).forEach(([key, value]) => {
        formattedData[`transform_quantity[${key}]`] = value;
      });
      delete formattedData.transform_quantity;
    }

    return stripeRequest('/prices', 'POST', formattedData);
  }

  static async retrieve(priceId: string) {
    return stripeRequest(`/prices/${priceId}`);
  }

  static async update(priceId: string, data: {
    active?: boolean;
    metadata?: Record<string, string>;
    nickname?: string;
    lookup_key?: string;
    transfer_lookup_key?: boolean;
  }) {
    return stripeRequest(`/prices/${priceId}`, 'POST', data);
  }

  static async list(params?: {
    active?: boolean;
    currency?: string;
    product?: string;
    type?: 'one_time' | 'recurring';
    limit?: number;
    starting_after?: string;
    ending_before?: string;
    lookup_keys?: string[];
    recurring?: {
      interval?: 'day' | 'week' | 'month' | 'year';
      usage_type?: 'licensed' | 'metered';
    };
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined) {
                queryParams.append(`${key}[${subKey}]`, subValue.toString());
              }
            });
          } else if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/prices${query ? `?${query}` : ''}`);
  }
}

// Invoice Management
export class StripeInvoiceAPI {
  static async create(data: {
    customer: string;
    subscription?: string;
    auto_advance?: boolean;
    collection_method?: 'charge_automatically' | 'send_invoice';
    description?: string;
    metadata?: Record<string, string>;
    footer?: string;
    days_until_due?: number;
    payment_settings?: {
      payment_method_types?: string[];
      default_mandate?: string;
    };
  }) {
    return stripeRequest('/invoices', 'POST', data);
  }

  static async retrieve(invoiceId: string, expand?: string[]) {
    const params = new URLSearchParams();
    if (expand) {
      expand.forEach(field => params.append('expand[]', field));
    }
    
    const query = params.toString();
    return stripeRequest(`/invoices/${invoiceId}${query ? `?${query}` : ''}`);
  }

  static async update(invoiceId: string, data: Record<string, any>) {
    return stripeRequest(`/invoices/${invoiceId}`, 'POST', data);
  }

  static async delete(invoiceId: string) {
    return stripeRequest(`/invoices/${invoiceId}`, 'DELETE');
  }

  static async list(params?: {
    customer?: string;
    subscription?: string;
    status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    collection_method?: 'charge_automatically' | 'send_invoice';
    limit?: number;
    starting_after?: string;
    ending_before?: string;
    created?: {
      gte?: number;
      lte?: number;
    };
    due_date?: {
      gte?: number;
      lte?: number;
    };
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined) {
                queryParams.append(`${key}[${subKey}]`, subValue.toString());
              }
            });
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/invoices${query ? `?${query}` : ''}`);
  }

  static async pay(invoiceId: string, paymentMethod?: string) {
    const data: Record<string, any> = {};
    if (paymentMethod) {
      data.payment_method = paymentMethod;
    }
    
    return stripeRequest(`/invoices/${invoiceId}/pay`, 'POST', data);
  }

  static async finalize(invoiceId: string, autoAdvance?: boolean) {
    const data: Record<string, any> = {};
    if (autoAdvance !== undefined) {
      data.auto_advance = autoAdvance;
    }
    
    return stripeRequest(`/invoices/${invoiceId}/finalize`, 'POST', data);
  }

  static async voidInvoice(invoiceId: string) {
    return stripeRequest(`/invoices/${invoiceId}/void`, 'POST');
  }

  static async sendInvoice(invoiceId: string) {
    return stripeRequest(`/invoices/${invoiceId}/send`, 'POST');
  }
}

// Usage-based Billing
export class StripeUsageRecordAPI {
  static async create(subscriptionItemId: string, data: {
    quantity: number;
    timestamp?: number;
    action?: 'increment' | 'set';
  }) {
    return stripeRequest(`/subscription_items/${subscriptionItemId}/usage_records`, 'POST', data);
  }

  static async list(subscriptionItemId: string, params?: {
    limit?: number;
    starting_after?: string;
    ending_before?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/subscription_items/${subscriptionItemId}/usage_record_summaries${query ? `?${query}` : ''}`);
  }
}

// Payment Methods
export class StripePaymentMethodAPI {
  static async create(data: {
    type: 'card' | 'us_bank_account' | 'sepa_debit' | 'ideal' | 'sofort';
    card?: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    billing_details?: {
      address?: {
        city?: string;
        country?: string;
        line1?: string;
        line2?: string;
        postal_code?: string;
        state?: string;
      };
      email?: string;
      name?: string;
      phone?: string;
    };
    metadata?: Record<string, string>;
  }) {
    const formattedData: Record<string, any> = { type: data.type };

    // Handle card object
    if (data.card) {
      Object.entries(data.card).forEach(([key, value]) => {
        formattedData[`card[${key}]`] = value;
      });
    }

    // Handle billing_details object
    if (data.billing_details) {
      Object.entries(data.billing_details).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formattedData[`billing_details[${key}][${subKey}]`] = subValue;
          });
        } else {
          formattedData[`billing_details[${key}]`] = value;
        }
      });
    }

    if (data.metadata) {
      Object.entries(data.metadata).forEach(([key, value]) => {
        formattedData[`metadata[${key}]`] = value;
      });
    }

    return stripeRequest('/payment_methods', 'POST', formattedData);
  }

  static async retrieve(paymentMethodId: string) {
    return stripeRequest(`/payment_methods/${paymentMethodId}`);
  }

  static async update(paymentMethodId: string, data: {
    billing_details?: {
      address?: {
        city?: string;
        country?: string;
        line1?: string;
        line2?: string;
        postal_code?: string;
        state?: string;
      };
      email?: string;
      name?: string;
      phone?: string;
    };
    metadata?: Record<string, string>;
  }) {
    const formattedData: Record<string, any> = {};

    // Handle billing_details object
    if (data.billing_details) {
      Object.entries(data.billing_details).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formattedData[`billing_details[${key}][${subKey}]`] = subValue;
          });
        } else {
          formattedData[`billing_details[${key}]`] = value;
        }
      });
    }

    if (data.metadata) {
      Object.entries(data.metadata).forEach(([key, value]) => {
        formattedData[`metadata[${key}]`] = value;
      });
    }

    return stripeRequest(`/payment_methods/${paymentMethodId}`, 'POST', formattedData);
  }

  static async attach(paymentMethodId: string, customerId: string) {
    return stripeRequest(`/payment_methods/${paymentMethodId}/attach`, 'POST', {
      customer: customerId
    });
  }

  static async detach(paymentMethodId: string) {
    return stripeRequest(`/payment_methods/${paymentMethodId}/detach`, 'POST');
  }

  static async list(params: {
    customer: string;
    type?: 'card' | 'us_bank_account' | 'sepa_debit';
    limit?: number;
    starting_after?: string;
    ending_before?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return stripeRequest(`/payment_methods?${queryParams.toString()}`);
  }
}

// Checkout Sessions
export class StripeCheckoutAPI {
  static async createSession(data: {
    line_items: Array<{
      price?: string;
      quantity?: number;
      price_data?: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
        };
        unit_amount?: number;
        recurring?: {
          interval: 'day' | 'week' | 'month' | 'year';
          interval_count?: number;
        };
      };
    }>;
    mode: 'payment' | 'setup' | 'subscription';
    success_url: string;
    cancel_url: string;
    customer?: string;
    customer_email?: string;
    payment_method_types?: string[];
    billing_address_collection?: 'auto' | 'required';
    shipping_address_collection?: {
      allowed_countries: string[];
    };
    allow_promotion_codes?: boolean;
    subscription_data?: {
      trial_period_days?: number;
      metadata?: Record<string, string>;
    };
    metadata?: Record<string, string>;
    locale?: string;
    tax_id_collection?: {
      enabled: boolean;
    };
  }) {
    const formattedData: Record<string, any> = { ...data };

    // Handle line_items array
    data.line_items.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'object' && subValue !== null) {
              Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
                formattedData[`line_items[${index}][${key}][${subKey}][${subSubKey}]`] = subSubValue;
              });
            } else {
              formattedData[`line_items[${index}][${key}][${subKey}]`] = subValue;
            }
          });
        } else {
          formattedData[`line_items[${index}][${key}]`] = value;
        }
      });
    });
    delete formattedData.line_items;

    // Handle payment_method_types array
    if (data.payment_method_types) {
      data.payment_method_types.forEach((type, index) => {
        formattedData[`payment_method_types[${index}]`] = type;
      });
      delete formattedData.payment_method_types;
    }

    // Handle subscription_data object
    if (data.subscription_data) {
      Object.entries(data.subscription_data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formattedData[`subscription_data[${key}][${subKey}]`] = subValue;
          });
        } else {
          formattedData[`subscription_data[${key}]`] = value;
        }
      });
      delete formattedData.subscription_data;
    }

    return stripeRequest('/checkout/sessions', 'POST', formattedData);
  }

  static async retrieve(sessionId: string, expand?: string[]) {
    const params = new URLSearchParams();
    if (expand) {
      expand.forEach(field => params.append('expand[]', field));
    }
    
    const query = params.toString();
    return stripeRequest(`/checkout/sessions/${sessionId}${query ? `?${query}` : ''}`);
  }

  static async list(params?: {
    customer?: string;
    payment_intent?: string;
    subscription?: string;
    limit?: number;
    starting_after?: string;
    ending_before?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return stripeRequest(`/checkout/sessions${query ? `?${query}` : ''}`);
  }

  static async expire(sessionId: string) {
    return stripeRequest(`/checkout/sessions/${sessionId}/expire`, 'POST');
  }
}

// Webhook Handling
export class StripeWebhookAPI {
  static async constructEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Promise<any> {
    // This would typically use the Stripe library's webhook construction
    // For now, we'll implement basic signature verification
    const crypto = await import('crypto');
    
    const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf8');
    const elements = signature.split(',');
    
    let timestamp: string | undefined;
    let signatureHash: string | undefined;
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatureHash = value;
      }
    }
    
    if (!timestamp || !signatureHash) {
      throw new Error('Invalid signature format');
    }
    
    const signedPayload = `${timestamp}.${payloadStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');
    
    if (expectedSignature !== signatureHash) {
      throw new Error('Invalid signature');
    }
    
    // Check timestamp (should be within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);
    
    if (Math.abs(now - timestampNum) > 300) {
      throw new Error('Timestamp too old');
    }
    
    return JSON.parse(payloadStr);
  }
}

// Main Stripe API class
export class StripeDirectAPI {
  static Customer = StripeCustomerAPI;
  static Subscription = StripeSubscriptionAPI;
  static Product = StripeProductAPI;
  static Price = StripePriceAPI;
  static Invoice = StripeInvoiceAPI;
  static UsageRecord = StripeUsageRecordAPI;
  static PaymentMethod = StripePaymentMethodAPI;
  static Checkout = StripeCheckoutAPI;
  static Webhook = StripeWebhookAPI;

  // Utility methods
  static async testConnection(): Promise<boolean> {
    try {
      await stripeRequest('/customers?limit=1');
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }

  static async getAccount() {
    return stripeRequest('/account');
  }

  static async getBalance() {
    return stripeRequest('/balance');
  }

  static async getPayoutSchedule() {
    return stripeRequest('/accounts', 'GET');
  }

  // Error handling utility
  static isStripeError(error: any): error is StripeAPIError {
    return error instanceof StripeAPIError;
  }
}

export default StripeDirectAPI;