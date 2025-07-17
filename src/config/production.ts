/**
 * Production Environment Configuration
 * Handles production-specific settings and optimizations
 */

// Environment validation
export const validateProductionEnvironment = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL format');
  }

  // Validate Stripe key format
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey.startsWith('pk_')) {
    throw new Error('Invalid Stripe publishable key format');
  }
};

// Production configuration
export const productionConfig = {
  // Database settings
  database: {
    connectionPoolSize: 10,
    queryTimeout: 30000, // 30 seconds
    enableQueryLogging: false,
    enablePerformanceMetrics: true,
    cacheTTL: {
      default: 5 * 60 * 1000, // 5 minutes
      dashboard: 2 * 60 * 1000, // 2 minutes
      static: 30 * 60 * 1000, // 30 minutes
      user: 10 * 60 * 1000 // 10 minutes
    }
  },

  // Security settings
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableSecurityHeaders: true,
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: {
        api: 1000,
        auth: 5,
        upload: 10
      }
    },
    cors: {
      allowedOrigins: [
        'https://app.auditready.com',
        'https://auditready.com',
        'https://www.auditready.com'
      ]
    }
  },

  // Performance settings
  performance: {
    enableCaching: true,
    enableCompression: true,
    enableServiceWorker: true,
    lazyLoadRoutes: true,
    bundleSize: {
      maxChunkSize: 500000, // 500KB
      maxAssetSize: 100000  // 100KB
    }
  },

  // Monitoring settings
  monitoring: {
    enableSentry: true,
    enableAnalytics: true,
    enablePerformanceTracking: true,
    sampleRate: 0.1, // 10% of transactions
    errorReporting: {
      enableUserFeedback: true,
      captureConsoleErrors: true,
      captureUnhandledRejections: true
    }
  },

  // Feature flags
  features: {
    enableRealTimeCollaboration: true,
    enableAIAssistance: true,
    enableAdvancedReporting: true,
    enableMobileApp: false,
    enableBetaFeatures: false,
    enableMaintenanceMode: false
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.auditready.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Third-party integrations
  integrations: {
    stripe: {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      enableWebhooks: true
    },
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0'
    },
    analytics: {
      enableGA: false, // Privacy-focused approach
      enableCustomAnalytics: true
    }
  }
};

// Development vs Production differences
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Demo account configuration
export const demoConfig = {
  email: 'demo@auditready.com',
  enabledFeatures: [
    'assessments',
    'requirements',
    'documents',
    'courses',
    'risks',
    'reports'
  ],
  limitations: {
    maxDocuments: 50,
    maxUsers: 1,
    maxAssessments: 5,
    maxCourses: 10
  }
};

// Security headers for production
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Database migration configuration
export const migrationConfig = {
  autoMigrate: false, // Manual control in production
  backupBeforeMigration: true,
  rollbackOnFailure: true,
  migrationTimeout: 300000, // 5 minutes
  validateAfterMigration: true
};

// Backup configuration
export const backupConfig = {
  enabled: true,
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 12
  },
  compression: true,
  encryption: true,
  offsite: true
};

// Error handling configuration
export const errorConfig = {
  logLevel: 'error',
  enableStackTrace: false, // Security: don't expose stack traces
  enableUserReporting: true,
  autoRetry: {
    enabled: true,
    maxAttempts: 3,
    backoffMultiplier: 2
  },
  gracefulDegradation: {
    enabled: true,
    fallbackToCache: true,
    showMaintenanceMessage: true
  }
};

// Performance thresholds
export const performanceThresholds = {
  pageLoadTime: 3000, // 3 seconds
  apiResponseTime: 1000, // 1 second
  databaseQueryTime: 500, // 500ms
  bundleSize: 2000000, // 2MB
  memoryUsage: 100000000 // 100MB
};

// Initialize production configuration
export const initializeProductionConfig = (): void => {
  if (isProduction) {
    validateProductionEnvironment();
    
    // Set security headers if in browser environment
    if (typeof window !== 'undefined') {
      // Apply CSP via meta tag if not set by server
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!existingCSP) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = securityHeaders['Content-Security-Policy'];
        document.head.appendChild(meta);
      }
    }
    
    // Configure console logging for production
    if (!productionConfig.monitoring.errorReporting.captureConsoleErrors) {
      console.log = () => {}; // Disable console.log in production
    }
  }
};

export default productionConfig;